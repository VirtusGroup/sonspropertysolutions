import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ACCULYNX_API_BASE = 'https://api.acculynx.com/api/v2';
const ACCULYNX_SOURCE_ID = '2';

// Exponential backoff: 5min, 15min, 45min
const BACKOFF_MINUTES = [5, 15, 45];

// Map service categories to AccuLynx trade type IDs
const CATEGORY_TO_TRADE_TYPE: Record<string, string> = {
  'repairs': '1',
  'maintenance': '1',
  'gutters': '2',
  'default': '1',
};

function getTradeTypeFromCategory(category: string): string {
  return CATEGORY_TO_TRADE_TYPE[category?.toLowerCase()] || CATEGORY_TO_TRADE_TYPE['default'];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const acculynxApiKey = Deno.env.get('ACCULYNX_API_KEY');

  if (!acculynxApiKey) {
    console.error('ACCULYNX_API_KEY not configured');
    return new Response(
      JSON.stringify({ error: 'AccuLynx API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('Starting retry-failed-syncs job...');

    // Query orders that need retry (failed or photo_upload_failed, attempts < 3)
    const { data: failedOrders, error: queryError } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        sync_status,
        sync_attempts,
        last_sync_at,
        acculynx_job_id,
        acculynx_contact_id,
        service_category,
        contact_first_name,
        contact_last_name,
        contact_email,
        contact_phone,
        address_id,
        addresses:address_id (
          street,
          unit,
          city,
          state,
          zip
        )
      `)
      .in('sync_status', ['failed', 'photo_upload_failed'])
      .lt('sync_attempts', 3);

    if (queryError) {
      console.error('Error querying failed orders:', queryError);
      throw queryError;
    }

    if (!failedOrders || failedOrders.length === 0) {
      console.log('No failed orders to retry');
      return new Response(
        JSON.stringify({ message: 'No failed orders to retry', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${failedOrders.length} failed orders to check`);

    const results: { orderId: string; status: string; message: string }[] = [];
    const now = Date.now();

    for (const order of failedOrders) {
      const attempts = order.sync_attempts || 0;
      const backoffMinutes = BACKOFF_MINUTES[Math.min(attempts, BACKOFF_MINUTES.length - 1)];
      const lastSyncTime = order.last_sync_at ? new Date(order.last_sync_at).getTime() : 0;
      const eligibleAfter = lastSyncTime + (backoffMinutes * 60 * 1000);

      // Check if backoff period has passed
      if (now < eligibleAfter) {
        const waitMinutes = Math.ceil((eligibleAfter - now) / 60000);
        console.log(`Order ${order.id}: Skipping - need to wait ${waitMinutes} more minutes`);
        results.push({
          orderId: order.id,
          status: 'skipped',
          message: `Backoff not elapsed. Wait ${waitMinutes} more minutes.`
        });
        continue;
      }

      console.log(`Processing order ${order.id} (attempt ${attempts + 1}/3, status: ${order.sync_status})`);

      try {
        if (order.sync_status === 'failed') {
          // Retry job creation
          await retryJobCreation(supabase, order, acculynxApiKey);
          results.push({ orderId: order.id, status: 'success', message: 'Job created successfully' });
        } else if (order.sync_status === 'photo_upload_failed') {
          // Retry photo upload
          await retryPhotoUpload(supabase, order, acculynxApiKey);
          results.push({ orderId: order.id, status: 'success', message: 'Photos uploaded successfully' });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing order ${order.id}:`, errorMessage);

        // Update sync attempts and check if max attempts reached
        const newAttempts = attempts + 1;
        const newStatus = newAttempts >= 3 ? 'requires_manual_review' : order.sync_status;

        await supabase
          .from('orders')
          .update({
            sync_attempts: newAttempts,
            sync_status: newStatus,
            last_sync_at: new Date().toISOString(),
            last_sync_error: errorMessage,
          })
          .eq('id', order.id);

        results.push({
          orderId: order.id,
          status: newAttempts >= 3 ? 'requires_manual_review' : 'retry_scheduled',
          message: errorMessage
        });
      }
    }

    console.log('Retry job completed:', results);

    return new Response(
      JSON.stringify({
        message: 'Retry job completed',
        processed: results.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Fatal error in retry-failed-syncs:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Retry job creation for 'failed' status orders
async function retryJobCreation(
  supabase: any,
  order: any,
  acculynxApiKey: string
) {
  // Get user's acculynx_contact_id from profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('acculynx_contact_id')
    .eq('id', order.user_id)
    .maybeSingle();

  if (profileError || !profile?.acculynx_contact_id) {
    throw new Error('User does not have an AccuLynx contact ID');
  }

  const address = order.addresses;
  if (!address) {
    throw new Error('Order has no associated address');
  }

  // Build job payload
  const jobPayload = {
    contactId: profile.acculynx_contact_id,
    leadSourceId: ACCULYNX_SOURCE_ID,
    locationAddress: {
      streetAddress: address.unit ? `${address.street}, ${address.unit}` : address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
    },
    tradeTypes: [{ id: getTradeTypeFromCategory(order.service_category || 'default') }],
  };

  console.log(`Creating AccuLynx job for order ${order.id}:`, JSON.stringify(jobPayload));

  const response = await fetch(`${ACCULYNX_API_BASE}/jobs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${acculynxApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jobPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AccuLynx API error: ${response.status} - ${errorText}`);
  }

  const jobData = await response.json();
  const acculynxJobId = jobData.id || jobData.jobId;

  console.log(`AccuLynx job created: ${acculynxJobId}`);

  // Update order with job ID and new status
  await supabase
    .from('orders')
    .update({
      acculynx_job_id: acculynxJobId,
      acculynx_contact_id: profile.acculynx_contact_id,
      sync_status: 'pending_photo_upload',
      sync_attempts: (order.sync_attempts || 0) + 1,
      last_sync_at: new Date().toISOString(),
      last_sync_error: null,
    })
    .eq('id', order.id);
}

// Retry photo upload for 'photo_upload_failed' status orders
async function retryPhotoUpload(
  supabase: any,
  order: any,
  acculynxApiKey: string
) {
  if (!order.acculynx_job_id) {
    throw new Error('Order has no AccuLynx job ID for photo upload');
  }

  // Get photos that haven't been uploaded yet
  const { data: photos, error: photosError } = await supabase
    .from('order_photos')
    .select('*')
    .eq('order_id', order.id)
    .eq('uploaded_to_acculynx', false);

  if (photosError) {
    throw new Error(`Failed to fetch photos: ${photosError.message}`);
  }

  if (!photos || photos.length === 0) {
    // No photos to upload, mark as submitted
    await supabase
      .from('orders')
      .update({
        sync_status: 'submitted',
        sync_attempts: (order.sync_attempts || 0) + 1,
        last_sync_at: new Date().toISOString(),
        last_sync_error: null,
      })
      .eq('id', order.id);
    return;
  }

  console.log(`Uploading ${photos.length} photos for order ${order.id}`);

  let uploadedCount = 0;
  const errors: string[] = [];

  for (const photo of photos) {
    try {
      // Download photo from Supabase Storage
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from('order-photos')
        .download(photo.storage_path);

      if (downloadError || !fileData) {
        throw new Error(`Failed to download photo: ${downloadError?.message || 'No data'}`);
      }

      // Create form data for AccuLynx upload
      const formData = new FormData();
      const fileName = photo.file_name || `photo_${photo.id}.jpg`;
      formData.append('file', fileData, fileName);
      if (photo.caption) {
        formData.append('description', photo.caption);
      }

      // Upload to AccuLynx
      const uploadResponse = await fetch(
        `${ACCULYNX_API_BASE}/jobs/${order.acculynx_job_id}/photos-videos`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${acculynxApiKey}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`AccuLynx upload error: ${uploadResponse.status} - ${errorText}`);
      }

      const uploadData = await uploadResponse.json();

      // Mark photo as uploaded
      await supabase
        .from('order_photos')
        .update({
          uploaded_to_acculynx: true,
          acculynx_file_id: uploadData.id || uploadData.fileId || null,
        })
        .eq('id', photo.id);

      uploadedCount++;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Photo ${photo.id}: ${errorMsg}`);
      console.error(`Failed to upload photo ${photo.id}:`, errorMsg);
    }
  }

  // Update order status based on results
  if (errors.length === 0) {
    // All photos uploaded successfully
    await supabase
      .from('orders')
      .update({
        sync_status: 'submitted',
        sync_attempts: (order.sync_attempts || 0) + 1,
        last_sync_at: new Date().toISOString(),
        last_sync_error: null,
      })
      .eq('id', order.id);
  } else if (uploadedCount > 0) {
    // Partial success - some photos uploaded
    await supabase
      .from('orders')
      .update({
        sync_attempts: (order.sync_attempts || 0) + 1,
        last_sync_at: new Date().toISOString(),
        last_sync_error: `Partial upload: ${uploadedCount}/${photos.length} succeeded. Errors: ${errors.join('; ')}`,
      })
      .eq('id', order.id);
    throw new Error(`Partial upload: ${errors.length} photos failed`);
  } else {
    // All failed
    throw new Error(errors.join('; '));
  }
}

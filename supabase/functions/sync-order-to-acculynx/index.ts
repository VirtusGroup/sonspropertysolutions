import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ACCULYNX_API_BASE = 'https://api.acculynx.com/api/v2';
const ACCULYNX_SOURCE_ID = '4d3ff3bd-6685-45ba-8209-951b30adc9a6';

// Trade type mapping by category
const CATEGORY_TO_TRADE_TYPE: Record<string, string> = {
  gutters:     '991168f6-c6b3-4179-bd94-3b3e84551d9c',
  roofing:     '63ed4a38-4bf6-429d-913b-365b043bb5e0',
  maintenance: '44a743a5-82c0-44b3-bc83-cfe05a8802e3',
  storm:       '63ed4a38-4bf6-429d-913b-365b043bb5e0',
};

function getTradeTypeFromCategory(category: string): string {
  return CATEGORY_TO_TRADE_TYPE[category] || CATEGORY_TO_TRADE_TYPE.roofing;
}

async function updateSyncStatus(
  supabaseUrl: string,
  supabaseServiceKey: string,
  orderId: string,
  status: string,
  errorMessage?: string
) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data: order } = await supabase
    .from('orders')
    .select('sync_attempts')
    .eq('id', orderId)
    .single();

  const attempts = ((order as { sync_attempts?: number })?.sync_attempts || 0) + 1;
  const finalStatus = attempts >= 3 ? 'requires_manual_review' : status;

  await supabase
    .from('orders')
    .update({
      sync_status: finalStatus,
      sync_attempts: attempts,
      last_sync_error: errorMessage,
      last_sync_at: new Date().toISOString()
    })
    .eq('id', orderId);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { orderId } = await req.json();
    console.log('Syncing order to AccuLynx:', orderId);

    const acculynxApiKey = Deno.env.get('ACCULYNX_API_KEY');
    if (!acculynxApiKey) {
      console.error('ACCULYNX_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AccuLynx API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch order with address
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, addresses(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Failed to fetch order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order fetched:', order.job_ref);

    // Fetch user profile to get acculynx_contact_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('acculynx_contact_id')
      .eq('id', order.user_id)
      .single();

    if (profileError || !profile) {
      console.error('Failed to fetch profile:', profileError);
      await updateSyncStatus(supabaseUrl, supabaseServiceKey, orderId, 'failed', 'Profile not found');
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile.acculynx_contact_id) {
      console.error('No AccuLynx contact ID for user');
      await updateSyncStatus(supabaseUrl, supabaseServiceKey, orderId, 'failed', 'No AccuLynx contact ID');
      return new Response(
        JSON.stringify({ error: 'No AccuLynx contact ID for user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get address from order or snapshot
    const address = order.addresses || order.address_snapshot;
    if (!address) {
      console.error('No address found for order');
      await updateSyncStatus(supabaseUrl, supabaseServiceKey, orderId, 'failed', 'No address found');
      return new Response(
        JSON.stringify({ error: 'No address found for order' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build job payload
    const tradeTypeId = getTradeTypeFromCategory(order.service_category || 'roofing');
    const jobPayload = {
      contact: {
        id: profile.acculynx_contact_id
      },
      leadSource: {
        id: ACCULYNX_SOURCE_ID
      },
      locationAddress: {
        street1: address.street,
        street2: address.unit || '',
        city: address.city,
        state: address.state,
        country: 'US',
        zipCode: address.zip
      },
      tradeTypes: [
        { id: tradeTypeId }
      ],
      notes: `Service request ${order.job_ref}: ${order.notes || 'No additional notes'}`
    };

    console.log('Creating job in AccuLynx:', JSON.stringify(jobPayload));

    // Create job in AccuLynx
    const jobResponse = await fetch(`${ACCULYNX_API_BASE}/jobs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${acculynxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobPayload),
    });

    const jobResponseText = await jobResponse.text();
    console.log('AccuLynx job response status:', jobResponse.status);
    console.log('AccuLynx job response:', jobResponseText);

    if (!jobResponse.ok) {
      console.error('Failed to create job:', jobResponseText);
      await updateSyncStatus(supabaseUrl, supabaseServiceKey, orderId, 'failed', jobResponseText);
      return new Response(
        JSON.stringify({ error: 'Failed to create job in AccuLynx', details: jobResponseText }),
        { status: jobResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jobData = JSON.parse(jobResponseText);
    const acculynxJobId = jobData.id;

    console.log('AccuLynx job created:', acculynxJobId);

    // Update order with job ID
    await supabase
      .from('orders')
      .update({
        acculynx_job_id: acculynxJobId,
        acculynx_contact_id: profile.acculynx_contact_id,
        sync_status: 'pending_photo_upload',
        last_sync_at: new Date().toISOString()
      })
      .eq('id', orderId);

    // Upload photos
    const { data: photos } = await supabase
      .from('order_photos')
      .select('*')
      .eq('order_id', orderId)
      .eq('uploaded_to_acculynx', false);

    let photosUploaded = 0;
    let photoErrors = 0;

    if (photos && photos.length > 0) {
      console.log(`Uploading ${photos.length} photos to AccuLynx`);

      for (const photo of photos) {
        try {
          // Download from Supabase Storage
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('order-photos')
            .download(photo.storage_path);

          if (downloadError || !fileData) {
            console.error(`Failed to download photo ${photo.id}:`, downloadError);
            photoErrors++;
            continue;
          }

          // Create form data for upload
          const formData = new FormData();
          formData.append('file', fileData, photo.file_name || 'photo.jpg');
          formData.append('description', `Photo for ${order.job_ref}`);

          // Upload to AccuLynx
          const photoResponse = await fetch(
            `${ACCULYNX_API_BASE}/jobs/${acculynxJobId}/photos-videos`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${acculynxApiKey}`,
              },
              body: formData,
            }
          );

          if (photoResponse.ok) {
            const photoData = await photoResponse.json();
            
            // Mark as uploaded
            await supabase
              .from('order_photos')
              .update({
                uploaded_to_acculynx: true,
                acculynx_file_id: photoData.id
              })
              .eq('id', photo.id);

            photosUploaded++;
            console.log(`Photo ${photo.id} uploaded successfully`);
          } else {
            const errorText = await photoResponse.text();
            console.error(`Failed to upload photo ${photo.id}:`, errorText);
            photoErrors++;
          }
        } catch (photoError) {
          console.error(`Error uploading photo ${photo.id}:`, photoError);
          photoErrors++;
        }
      }
    }

    // Update final sync status
    await supabase
      .from('orders')
      .update({
        sync_status: 'submitted',
        last_sync_at: new Date().toISOString()
      })
      .eq('id', orderId);

    console.log(`Sync complete. Job: ${acculynxJobId}, Photos uploaded: ${photosUploaded}, Photo errors: ${photoErrors}`);

    return new Response(
      JSON.stringify({
        success: true,
        acculynxJobId,
        photosUploaded,
        photoErrors
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sync-order-to-acculynx:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

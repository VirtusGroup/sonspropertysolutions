import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ACCULYNX_API_BASE = 'https://api.acculynx.com/api/v2';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { orderId, acculynxJobId } = await req.json();
    console.log('Uploading photos to AccuLynx for order:', orderId, 'job:', acculynxJobId);

    if (!orderId || !acculynxJobId) {
      return new Response(
        JSON.stringify({ error: 'orderId and acculynxJobId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const acculynxApiKey = Deno.env.get('ACCULYNX_API_KEY');
    if (!acculynxApiKey) {
      console.error('ACCULYNX_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AccuLynx API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch order to get job_ref for descriptions
    const { data: order } = await supabase
      .from('orders')
      .select('job_ref')
      .eq('id', orderId)
      .single();

    const jobRef = order?.job_ref || 'Unknown';

    // Fetch photos that haven't been uploaded yet
    const { data: photos, error: photosError } = await supabase
      .from('order_photos')
      .select('*')
      .eq('order_id', orderId)
      .eq('uploaded_to_acculynx', false);

    if (photosError) {
      console.error('Failed to fetch photos:', photosError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch photos' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!photos || photos.length === 0) {
      console.log('No photos to upload');
      
      // Update sync status to submitted since there are no photos
      await supabase
        .from('orders')
        .update({
          sync_status: 'submitted',
          last_sync_at: new Date().toISOString()
        })
        .eq('id', orderId);

      return new Response(
        JSON.stringify({ success: true, photosUploaded: 0, photoErrors: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Uploading ${photos.length} photos to AccuLynx`);

    let photosUploaded = 0;
    let photoErrors = 0;

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
        formData.append('description', `Photo for ${jobRef}`);

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
          console.log(`Photo ${photo.id} uploaded successfully, AccuLynx file ID: ${photoData.id}`);
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

    // Update final sync status
    const finalStatus = photoErrors > 0 && photosUploaded === 0 
      ? 'photo_upload_failed' 
      : 'submitted';

    await supabase
      .from('orders')
      .update({
        sync_status: finalStatus,
        last_sync_at: new Date().toISOString(),
        last_sync_error: photoErrors > 0 ? `${photoErrors} photo(s) failed to upload` : null
      })
      .eq('id', orderId);

    console.log(`Photo upload complete. Uploaded: ${photosUploaded}, Errors: ${photoErrors}`);

    return new Response(
      JSON.stringify({
        success: true,
        photosUploaded,
        photoErrors
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in upload-photos-to-acculynx:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

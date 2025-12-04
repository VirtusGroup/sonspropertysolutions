import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ACCULYNX_API_BASE = 'https://api.acculynx.com/api/v2';
const ACCULYNX_SOURCE_ID = '4d3ff3bd-6685-45ba-8209-951b30adc9a6';
const ACCULYNX_CONTACT_TYPE_ID = '52ba94c5-3ecf-4e7f-90cd-a91de12a72f5';

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

async function createAccuLynxContact(
  acculynxApiKey: string,
  firstName: string,
  lastName: string,
  email: string,
  phone: string
): Promise<{ contactId?: string; error?: string }> {
  console.log('[sync-order] Creating fallback AccuLynx contact for:', { firstName, lastName, email });
  
  const contactPayload = {
    firstName,
    lastName,
    contactTypeIds: [ACCULYNX_CONTACT_TYPE_ID],
    phoneNumbers: phone ? [{ number: phone, type: 'Mobile' }] : [],
    emailAddresses: email ? [{ address: email, type: 'Personal' }] : []
  };

  try {
    const response = await fetch(`${ACCULYNX_API_BASE}/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${acculynxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactPayload),
    });

    const responseText = await response.text();
    console.log('[sync-order] AccuLynx contact creation response:', response.status, responseText);

    if (!response.ok) {
      return { error: `AccuLynx contact creation failed: ${responseText}` };
    }

    const data = JSON.parse(responseText);
    return { contactId: data.id };
  } catch (err) {
    console.error('[sync-order] AccuLynx contact creation error:', err);
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
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
    console.log('Syncing order to AccuLynx (job creation only):', orderId);

    const acculynxApiKey = Deno.env.get('ACCULYNX_API_KEY');
    if (!acculynxApiKey) {
      console.error('ACCULYNX_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: true, code: 'ALX-J004', message: 'AccuLynx API key not configured' }),
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
        JSON.stringify({ error: true, code: 'ALX-J002', message: 'Order not found' }),
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
        JSON.stringify({ error: true, code: 'ALX-J001', message: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let contactId = profile.acculynx_contact_id;
    
    // Fallback: Create contact if missing
    if (!contactId) {
      console.log('[sync-order] No AccuLynx contact ID - attempting fallback creation');
      
      // Fetch full profile for contact creation
      const { data: fullProfile, error: fullProfileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone')
        .eq('id', order.user_id)
        .single();
      
      if (fullProfileError || !fullProfile) {
        console.error('[sync-order] Failed to fetch full profile for contact creation:', fullProfileError);
        await updateSyncStatus(supabaseUrl, supabaseServiceKey, orderId, 'failed', 'Could not fetch profile for contact creation');
        return new Response(
          JSON.stringify({ error: true, code: 'ALX-J001', message: 'Could not create contact - profile not found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const { contactId: newContactId, error: contactError } = await createAccuLynxContact(
        acculynxApiKey,
        fullProfile.first_name || order.contact_first_name,
        fullProfile.last_name || order.contact_last_name,
        fullProfile.email || order.contact_email,
        fullProfile.phone || order.contact_phone
      );
      
      if (contactError || !newContactId) {
        console.error('[sync-order] Fallback contact creation failed:', contactError);
        await updateSyncStatus(supabaseUrl, supabaseServiceKey, orderId, 'failed', contactError || 'Contact creation failed');
        return new Response(
          JSON.stringify({ error: true, code: 'ALX-J001', message: 'Failed to create AccuLynx contact' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('[sync-order] Fallback contact created:', newContactId);
      
      // Update profile with new contact ID
      await supabase
        .from('profiles')
        .update({ acculynx_contact_id: newContactId })
        .eq('id', order.user_id);
      
      contactId = newContactId;
    }

    // Get address from order or snapshot
    const address = order.addresses || order.address_snapshot;
    if (!address) {
      console.error('No address found for order');
      await updateSyncStatus(supabaseUrl, supabaseServiceKey, orderId, 'failed', 'No address found');
      return new Response(
        JSON.stringify({ error: true, code: 'ALX-J002', message: 'No address found for order' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build job payload
    const tradeTypeId = getTradeTypeFromCategory(order.service_category || 'roofing');
    
    // Build formatted notes for AccuLynx
    const propertyTypeCapitalized = order.property_type === 'residential' ? 'Residential' : 'Commercial';
    
    // Extract user's free-form notes by removing the property type prefix
    const propertyPrefix = `This is a ${order.property_type} property. `;
    const userNotes = order.notes?.startsWith(propertyPrefix) 
      ? order.notes.slice(propertyPrefix.length).trim() 
      : (order.notes || '');
    
    // Format the preferred date if available
    let schedulePart = '';
    if (order.scheduled_at) {
      const date = new Date(order.scheduled_at);
      const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
      schedulePart = formattedDate;
    }
    if (order.preferred_window) {
      schedulePart += schedulePart ? ` ${order.preferred_window}` : order.preferred_window;
    }
    
    // Build final notes: "This is a [Property Type] Property - [job_ref] - [date] [time window] - [user notes]"
    const formattedNotes = `This is a ${propertyTypeCapitalized} Property - ${order.job_ref} - ${schedulePart || 'No preferred time'} - ${userNotes || 'No additional notes'}`;
    
    const jobPayload = {
      contact: {
        id: contactId
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
      notes: formattedNotes
    };

    console.log('Creating job in AccuLynx:', JSON.stringify(jobPayload));

    // Create job in AccuLynx
    let jobResponse;
    try {
      jobResponse = await fetch(`${ACCULYNX_API_BASE}/jobs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${acculynxApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobPayload),
      });
    } catch (fetchError) {
      console.error('Network error calling AccuLynx:', fetchError);
      await updateSyncStatus(supabaseUrl, supabaseServiceKey, orderId, 'failed', 'Network error');
      return new Response(
        JSON.stringify({ error: true, code: 'ALX-J004', message: 'Network error connecting to AccuLynx' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jobResponseText = await jobResponse.text();
    console.log('AccuLynx job response status:', jobResponse.status);
    console.log('AccuLynx job response:', jobResponseText);

    if (!jobResponse.ok) {
      console.error('Failed to create job:', jobResponseText);
      await updateSyncStatus(supabaseUrl, supabaseServiceKey, orderId, 'failed', jobResponseText);
      return new Response(
        JSON.stringify({ error: true, code: 'ALX-J003', message: 'AccuLynx rejected the job', details: jobResponseText }),
        { status: jobResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jobData = JSON.parse(jobResponseText);
    const acculynxJobId = jobData.id;

    console.log('AccuLynx job created:', acculynxJobId);

    // Update order with job ID and set status to pending_photo_upload
    await supabase
      .from('orders')
      .update({
        acculynx_job_id: acculynxJobId,
        acculynx_contact_id: contactId,
        sync_status: 'pending_photo_upload',
        last_sync_at: new Date().toISOString()
      })
      .eq('id', orderId);

    console.log(`Job creation complete. Job ID: ${acculynxJobId}`);

    return new Response(
      JSON.stringify({
        success: true,
        acculynxJobId
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sync-order-to-acculynx:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: true, code: 'ALX-J004', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

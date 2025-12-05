import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ACCULYNX_API_BASE = 'https://api.acculynx.com/api/v2';
const ACCULYNX_CONTACT_TYPE_ID = '52ba94c5-3ecf-4e7f-90cd-a91de12a72f5';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, firstName, lastName, email, phone, address } = await req.json();

    console.log('Creating AccuLynx contact for user:', userId);
    console.log('Contact details:', { firstName, lastName, email, phone });

    const acculynxApiKey = Deno.env.get('ACCULYNX_API_KEY');
    if (!acculynxApiKey) {
      console.error('ACCULYNX_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: true, code: 'ALX-C001', message: 'AccuLynx API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build contact payload per TRD
    const contactPayload: Record<string, unknown> = {
      firstName,
      lastName,
      contactTypeIds: [ACCULYNX_CONTACT_TYPE_ID],
      phoneNumbers: [
        {
          number: phone,
          type: 'Mobile'
        }
      ],
      emailAddresses: [
        {
          address: email
        }
      ]
    };

    // Add mailing address if provided
    if (address) {
    contactPayload.mailingAddress = {
        street1: address.street,
        city: address.city,
        state: { id: 43 },      // Texas (business only operates in TX)
        zipcode: address.zip,
        country: { id: 1 }      // US
      };
    }

    console.log('Sending to AccuLynx:', JSON.stringify(contactPayload));

    // Create contact in AccuLynx
    let acculynxResponse;
    try {
      acculynxResponse = await fetch(`${ACCULYNX_API_BASE}/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${acculynxApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactPayload),
      });
    } catch (fetchError) {
      console.error('Network error calling AccuLynx:', fetchError);
      return new Response(
        JSON.stringify({ error: true, code: 'ALX-C001', message: 'Network error connecting to AccuLynx' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const responseText = await acculynxResponse.text();
    console.log('AccuLynx response status:', acculynxResponse.status);
    console.log('AccuLynx response:', responseText);

    if (!acculynxResponse.ok) {
      console.error('AccuLynx API error:', responseText);
      return new Response(
        JSON.stringify({ error: true, code: 'ALX-C002', message: 'AccuLynx rejected the contact', details: responseText }),
        { status: acculynxResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const acculynxData = JSON.parse(responseText);
    const contactId = acculynxData.id;

    console.log('AccuLynx contact created with ID:', contactId);

    // Update profile with AccuLynx contact ID using service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ acculynx_contact_id: contactId })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update profile:', updateError);
      // Contact was created in AccuLynx but we failed to save the ID
      return new Response(
        JSON.stringify({ error: true, code: 'ALX-C003', contactId, message: 'Contact created but failed to save to profile' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Profile updated with AccuLynx contact ID');

    return new Response(
      JSON.stringify({ success: true, contactId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-acculynx-contact:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: true, code: 'ALX-C001', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

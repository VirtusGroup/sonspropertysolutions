import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Service ID to title mapping
const SERVICE_TITLES: Record<string, string> = {
  'svc-1': 'Gutter Cleaning',
  'svc-2': 'Roof Inspection',
  'svc-3': 'Small Roof Repair',
  'svc-4': 'Emergency Roof Tarp',
  'svc-5': 'Skylight Resealing',
  'svc-6': 'Gutter Guard Installation',
  'svc-7': 'Roof Tune-Up',
  'svc-8': 'Chimney Flashing Repair',
  'svc-9': 'Roof Ventilation Upgrade',
  'svc-10': 'Downspout Extensions',
};

// Milestone to status mapping
function mapMilestoneToStatus(milestone: string): string {
  const milestoneUpper = milestone.toUpperCase();
  
  switch (milestoneUpper) {
    case 'UNASSIGNED_LEAD':
    case 'LEAD':
    case 'PROSPECT':
      return 'received';
    case 'APPROVED':
      return 'scheduled'; // Will auto-progress to in_progress
    case 'COMPLETED':
      return 'job_complete';
    case 'INVOICED':
      return 'finished';
    default:
      return 'received';
  }
}

// Create notification for user
async function createNotification(
  supabase: any,
  userId: string,
  orderId: string,
  title: string,
  message: string,
  type: 'order' | 'system' = 'order'
) {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      order_id: orderId,
      title,
      message,
      type,
      read: false,
    });
  
  if (error) {
    console.error('Failed to create notification:', error);
  }
}

// Log webhook to database
async function logWebhook(
  supabase: any,
  payload: unknown,
  eventType: string,
  orderId: string | null,
  processed: boolean,
  errorMessage: string | null
) {
  const { error } = await supabase
    .from('webhook_logs')
    .insert({
      source: 'acculynx',
      event_type: eventType,
      payload,
      order_id: orderId,
      processed,
      error_message: errorMessage,
    });
  
  if (error) {
    console.error('Failed to log webhook:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  let payload: { job_id?: string; milestone_type?: string; lead_dead_reason?: string } = {};
  
  try {
    // Validate webhook secret
    const providedSecret = req.headers.get('x-webhook-secret');
    if (!providedSecret || providedSecret !== WEBHOOK_SECRET) {
      console.error('Invalid webhook secret');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse payload
    payload = await req.json();
    const { job_id, milestone_type, lead_dead_reason } = payload;

    console.log('Received webhook:', { job_id, milestone_type, lead_dead_reason });

    // Validate required fields
    if (!job_id || !milestone_type) {
      await logWebhook(supabase, payload, milestone_type || 'unknown', null, false, 'Missing required fields');
      return new Response(JSON.stringify({ error: 'Missing required fields: job_id and milestone_type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find order by AccuLynx job ID
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, service_id, status')
      .eq('acculynx_job_id', job_id)
      .maybeSingle();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      await logWebhook(supabase, payload, milestone_type, null, false, orderError.message);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!order) {
      console.error('Order not found for job_id:', job_id);
      await logWebhook(supabase, payload, milestone_type, null, false, 'Order not found');
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const serviceTitle = SERVICE_TITLES[order.service_id] || 'roofing';
    const now = new Date().toISOString();

    // Check if cancelled (lead_dead_reason present and non-empty)
    if (lead_dead_reason && lead_dead_reason.trim() !== '') {
      // Update order as cancelled
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          acculynx_milestone: milestone_type,
          milestone_updated_at: now,
          cancellation_reason: lead_dead_reason,
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('Error updating order:', updateError);
        await logWebhook(supabase, payload, milestone_type, order.id, false, updateError.message);
        return new Response(JSON.stringify({ error: 'Failed to update order' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create cancellation notification
      await createNotification(
        supabase,
        order.user_id,
        order.id,
        'Order Cancelled',
        'Your order has been cancelled. Please contact support if you have questions.'
      );

      await logWebhook(supabase, payload, milestone_type, order.id, true, null);
      console.log('Order cancelled:', order.id);

      return new Response(JSON.stringify({ success: true, status: 'cancelled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Map milestone to status
    const newStatus = mapMilestoneToStatus(milestone_type);
    
    // Build update object
    const updateData: Record<string, unknown> = {
      acculynx_milestone: milestone_type,
      milestone_updated_at: now,
    };

    // Only update status if it's different
    if (newStatus !== order.status) {
      updateData.status = newStatus;
    }

    // Set timestamps based on milestone
    if (milestone_type.toUpperCase() === 'APPROVED') {
      updateData.scheduled_at = now;
    }
    if (milestone_type.toUpperCase() === 'COMPLETED' || milestone_type.toUpperCase() === 'INVOICED') {
      updateData.completed_at = now;
    }

    // Update order
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order.id);

    if (updateError) {
      console.error('Error updating order:', updateError);
      await logWebhook(supabase, payload, milestone_type, order.id, false, updateError.message);
      return new Response(JSON.stringify({ error: 'Failed to update order' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create notifications based on status
    if (newStatus !== order.status) {
      switch (newStatus) {
        case 'scheduled':
          await createNotification(
            supabase,
            order.user_id,
            order.id,
            'Service Scheduled',
            `We've scheduled your ${serviceTitle} service and will be there soon.`
          );
          break;
        case 'job_complete':
          await createNotification(
            supabase,
            order.user_id,
            order.id,
            'Job Complete!',
            `Great news! Your ${serviceTitle} service has been completed.`
          );
          break;
        case 'finished':
          await createNotification(
            supabase,
            order.user_id,
            order.id,
            'Invoice Sent',
            'Your invoice has been sent to your email.'
          );
          break;
      }
    }

    // Auto-progress: If APPROVED, immediately set to in_progress
    let finalStatus = newStatus;
    if (milestone_type.toUpperCase() === 'APPROVED') {
      const { error: progressError } = await supabase
        .from('orders')
        .update({ status: 'in_progress' })
        .eq('id', order.id);

      if (progressError) {
        console.error('Error auto-progressing order:', progressError);
      } else {
        finalStatus = 'in_progress';
        // Create in_progress notification
        await createNotification(
          supabase,
          order.user_id,
          order.id,
          'Work Has Begun',
          `Our team has started work on your ${serviceTitle} service.`
        );
      }
    }

    await logWebhook(supabase, payload, milestone_type, order.id, true, null);
    console.log('Order updated:', order.id, 'Status:', finalStatus);

    return new Response(JSON.stringify({ success: true, status: finalStatus }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    await logWebhook(supabase, payload, 'error', null, false, errorMsg);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

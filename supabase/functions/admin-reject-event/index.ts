import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";
// Remove Resend for now  
// import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false } }
);

// const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requestId, reason, adminUserId } = await req.json();
    
    // Verify admin access
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin, email')
      .eq('id', adminUserId)
      .single();
      
    if (adminError || !adminProfile?.is_admin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the request details
    const { data: request, error: requestError } = await supabase
      .from('interview_event_requests')
      .select('*')
      .eq('id', requestId)
      .eq('status', 'pending')
      .single();
      
    if (requestError || !request) {
      return new Response(
        JSON.stringify({ error: 'Request not found or already processed' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update request status to rejected
    const { error: updateError } = await supabase
      .from('interview_event_requests')
      .update({ 
        status: 'rejected',
        rejection_reason: reason 
      })
      .eq('id', requestId);
      
    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update request status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_email: adminProfile.email,
        admin_user_id: adminUserId,
        action_type: 'reject_event',
        target_table: 'interview_event_requests',
        target_id: requestId,
        payload: { event_name: request.event_name, society: request.society_name },
        reason
      });

    // Send rejection email to requester (email notifications disabled for now)
    // TODO: Configure Resend API key to enable email notifications

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Event rejected and user notified',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Admin reject event error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
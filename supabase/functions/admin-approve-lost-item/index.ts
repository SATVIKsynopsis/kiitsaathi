import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";
// Remove Resend for now - will be added when email notifications are needed
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
    const { requestId, adminUserId } = await req.json();
    
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
      .from('lost_found_requests')
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

    // Move to public lost_and_found_items table
    const { data: newItem, error: insertError } = await supabase
      .from('lost_and_found_items')
      .insert({
        title: request.title,
        description: request.description,
        location: request.location,
        category: request.category,
        item_type: request.item_type,
        contact_name: request.contact_name,
        contact_email: request.contact_email,
        contact_phone: request.contact_phone,
        image_url: request.image_url,
        date: new Date().toISOString().split('T')[0],
        user_id: request.user_id,
        status: 'active'
      })
      .select()
      .single();
      
    if (insertError) {
      console.error('Error inserting to public table:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to publish item' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update request status
    await supabase
      .from('lost_found_requests')
      .update({ status: 'approved' })
      .eq('id', requestId);

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_email: adminProfile.email,
        admin_user_id: adminUserId,
        action_type: 'approve_lost_item',
        target_table: 'lost_found_requests',
        target_id: requestId,
        payload: { item_title: request.title, item_type: request.item_type }
      });

    // Send approval email to requester (commented out for now)
    // if (resend) {
    //   try {
    //     Email sending logic here when Resend is properly configured
    //   } catch (emailError) {
    //     console.warn('Email notification failed:', emailError);
    //   }
    // }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Item approved successfully',
        publicItemId: newItem.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Admin approve lost item error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
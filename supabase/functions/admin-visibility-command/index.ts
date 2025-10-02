import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check admin secret
    const adminSecret = req.headers.get('x-admin-secret');
    if (!adminSecret || adminSecret !== Deno.env.get('ADMIN_SECRET')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid admin secret' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { command } = await req.json();

    // Exact command strings
    const CMD_RESTORE = 'Get The next services back (Senior Connect, Handwritten Assignments, Tutoring & Counselling, Campus Tour Booking, Carton Packing & Hostel Transfers, Book Buyback & Resale, KIIT Saathi Celebrations ,KIIT Saathi Meetups, Food and micro-essentials delivery)';
    const CMD_HIDE = 'Hide the next services again';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Services to hide/show
    const servicesTarget = [
      'senior-connect',
      'handwritten-assignments', 
      'tutoring-counselling',
      'campus-tour-booking',
      'carton-packing-hostel-transfers',
      'book-buyback-resale',
      'kiit-saathi-celebrations',
      'kiit-saathi-meetups',
      'food-micro-essentials-delivery',
      'resale-saathi'
    ];

    if (command === CMD_HIDE) {
      // Hide services and replace printout with placeholder
      const updates = servicesTarget.map(serviceId => ({ 
        service_id: serviceId, 
        visible: false 
      }));
      
      // Add printout placeholder (removing replaced_text as it's not in the schema)
      updates.push({
        service_id: 'printout-on-demand',
        visible: false
      });

      for (const update of updates) {
        await supabase
          .from('service_visibility')
          .update({
            visible: update.visible,
            updated_at: new Date().toISOString()
          })
          .eq('service_id', update.service_id);
      }

      // Log the action
      await supabase
        .from('admin_action_logs')
        .insert({
          action: 'hide_services',
          command: command,
          details: { services: servicesTarget.concat(['printout-on-demand']) }
        });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Services hidden successfully',
          hidden_services: servicesTarget.length + 1
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (command === CMD_RESTORE) {
      // Restore services visibility
      const updates = servicesTarget.map(serviceId => ({ 
        service_id: serviceId, 
        visible: true 
      }));
      
      // Restore printout service (removing replaced_text)
      updates.push({
        service_id: 'printout-on-demand',
        visible: true
      });

      for (const update of updates) {
        await supabase
          .from('service_visibility')
          .update({
            visible: update.visible,
            updated_at: new Date().toISOString()
          })
          .eq('service_id', update.service_id);
      }

      // Log the action
      await supabase
        .from('admin_action_logs')
        .insert({
          action: 'restore_services',
          command: command,
          details: { services: servicesTarget.concat(['printout-on-demand']) }
        });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Services restored successfully',
          restored_services: servicesTarget.length + 1
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      return new Response(
        JSON.stringify({ 
          error: 'Unknown command. Use exact text matching required.',
          expected_commands: [CMD_HIDE, CMD_RESTORE]
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('Error in admin visibility command:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
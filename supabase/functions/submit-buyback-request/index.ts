import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookDetails {
  title: string;
  author: string;
  condition: string;
  estimatedPrice: number;
}

interface BuybackRequest {
  booksDetails: BookDetails[];
  estimatedTotal: number;
  pickupAddress: string;
  contactNumber: string;
  studentName: string;
  rollNumber: string;
  paymentPreference: string;
  additionalNotes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('💰 Buyback request function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('User not authenticated');
    }

    const requestData: BuybackRequest = await req.json();
    console.log('📋 Buyback request data received:', requestData);

    // Insert buyback request into database
    const { data: buybackRequest, error: insertError } = await supabase
      .from('book_buyback_requests')
      .insert([{
        user_id: user.id,
        books_details: requestData.booksDetails,
        estimated_total: requestData.estimatedTotal,
        pickup_address: requestData.pickupAddress,
        contact_number: requestData.contactNumber,
        student_name: requestData.studentName,
        roll_number: requestData.rollNumber,
        payment_preference: requestData.paymentPreference,
        status: 'submitted'
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting buyback request:', insertError);
      throw new Error(`Failed to create buyback request: ${insertError.message}`);
    }

    console.log('✅ Buyback request created:', buybackRequest.id);

    // Email functionality temporarily disabled - core functionality maintained
    console.log('Buyback confirmation would be sent to:', user.email);
    console.log('Admin notification would be sent about new buyback request');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Buyback request submitted successfully! We\'ll evaluate your books and contact you within 24-48 hours.',
        requestId: buybackRequest.id 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('❌ Error in buyback request function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to submit buyback request'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);
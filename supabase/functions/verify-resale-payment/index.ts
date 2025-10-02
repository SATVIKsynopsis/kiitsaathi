import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      transactionId
    } = await req.json();

    // Verify signature
    const crypto = await import("node:crypto");
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update transaction with payment details
    const { error: txError } = await supabase
      .from('resale_transactions')
      .update({
        razorpay_order_id,
        razorpay_payment_id,
        status: 'escrow',
        paid_at: new Date().toISOString()
      })
      .eq('id', transactionId);

    if (txError) throw txError;

    // Log transaction event
    const { error: eventError } = await supabase
      .from('resale_transaction_events')
      .insert({
        transaction_id: transactionId,
        event_type: 'payment_received',
        notes: 'Payment captured, funds in escrow'
      });

    if (eventError) console.error('Error logging event:', eventError);

    // TODO: Send notification to seller

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment verified and funds held in escrow'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error verifying resale payment:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Payment verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
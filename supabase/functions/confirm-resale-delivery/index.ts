import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

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
    const { transactionId } = await req.json();

    if (!transactionId) {
      return new Response(
        JSON.stringify({ error: 'Transaction ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get transaction details
    const { data: transaction, error: txError } = await supabase
      .from('resale_transactions')
      .select('*, listing:resale_listings(*)')
      .eq('id', transactionId)
      .single();

    if (txError) throw txError;

    if (transaction.status !== 'escrow') {
      return new Response(
        JSON.stringify({ error: 'Transaction not in escrow status' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update transaction to completed
    const { error: updateError } = await supabase
      .from('resale_transactions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', transactionId);

    if (updateError) throw updateError;

    // Update listing to sold
    const { error: listingError } = await supabase
      .from('resale_listings')
      .update({ status: 'sold' })
      .eq('id', transaction.listing_id);

    if (listingError) console.error('Error updating listing:', listingError);

    // Log event
    const { error: eventError } = await supabase
      .from('resale_transaction_events')
      .insert({
        transaction_id: transactionId,
        event_type: 'delivery_confirmed',
        notes: 'Buyer confirmed delivery, funds released to seller'
      });

    if (eventError) console.error('Error logging event:', eventError);

    // Update seller's sales count and rating
    const { error: sellerError } = await supabase.rpc('increment', {
      table_name: 'profiles',
      row_id: transaction.seller_id,
      column_name: 'total_sales'
    });

    if (sellerError) console.error('Error updating seller stats:', sellerError);

    // TODO: Initiate payout to seller via Razorpay
    // TODO: Send notification to seller about funds release
    // TODO: Send notification to buyer to leave review

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Delivery confirmed and funds released to seller'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error confirming delivery:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to confirm delivery',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
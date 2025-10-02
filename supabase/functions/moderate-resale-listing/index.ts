import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Profanity and sensitive content filters
const BLOCKED_WORDS = ['fuck', 'shit', 'damn', 'bitch', 'ass', 'hell'];
const PHONE_REGEX = /(\+?91[\-\s]?)?[6-9]\d{9}/g;
const EMAIL_REGEX = /[\w.-]+@[\w.-]+\.\w+/g;

function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BLOCKED_WORDS.some(word => lowerText.includes(word));
}

function containsContactInfo(text: string): boolean {
  return PHONE_REGEX.test(text) || EMAIL_REGEX.test(text);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listingId, action, adminUserId, reason } = await req.json();

    if (!listingId || !action) {
      return new Response(
        JSON.stringify({ error: 'Listing ID and action are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'auto_moderate') {
      // Auto moderation on listing creation
      const { data: listing, error: fetchError } = await supabase
        .from('resale_listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (fetchError) throw fetchError;

      const issues: string[] = [];

      // Check title and description for profanity
      if (containsProfanity(listing.title) || containsProfanity(listing.description || '')) {
        issues.push('Contains inappropriate language');
      }

      // Check for contact information
      if (containsContactInfo(listing.title) || containsContactInfo(listing.description || '')) {
        issues.push('Contains contact information (use in-app chat instead)');
      }

      // Check price validity
      if (listing.price < 10 || listing.price > 1000000) {
        issues.push('Price is outside acceptable range');
      }

      if (issues.length > 0) {
        // Flag for manual review
        await supabase
          .from('resale_listings')
          .update({
            status: 'pending',
            moderation_notes: issues.join('; ')
          })
          .eq('id', listingId);

        return new Response(
          JSON.stringify({
            approved: false,
            flagged: true,
            issues
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Auto-approve clean listings
      await supabase
        .from('resale_listings')
        .update({ status: 'active' })
        .eq('id', listingId);

      return new Response(
        JSON.stringify({
          approved: true,
          message: 'Listing auto-approved'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Manual admin actions
    if (action === 'approve') {
      await supabase
        .from('resale_listings')
        .update({ status: 'active', moderation_notes: null })
        .eq('id', listingId);

      // Log admin action
      await supabase
        .from('resale_admin_actions')
        .insert({
          listing_id: listingId,
          admin_id: adminUserId,
          action_type: 'approve',
          notes: 'Listing approved by admin'
        });

      return new Response(
        JSON.stringify({ success: true, message: 'Listing approved' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'reject') {
      await supabase
        .from('resale_listings')
        .update({
          status: 'removed',
          moderation_notes: reason || 'Rejected by admin'
        })
        .eq('id', listingId);

      // Log admin action
      await supabase
        .from('resale_admin_actions')
        .insert({
          listing_id: listingId,
          admin_id: adminUserId,
          action_type: 'reject',
          notes: reason || 'Listing rejected'
        });

      // TODO: Notify seller

      return new Response(
        JSON.stringify({ success: true, message: 'Listing rejected' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in moderation:', error);
    return new Response(
      JSON.stringify({ error: 'Moderation failed', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
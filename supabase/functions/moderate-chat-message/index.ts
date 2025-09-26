import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, senderId } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Moderating message:', { message, sessionId, senderId });

    // Check for phone numbers and suspicious numeric patterns
    const phoneRegex = /(\+?\d{1,4}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?\d{4,}[-.\s]?\d{4,}/g;
    const whatsappRegex = /whatsapp|wa\.me|chat\.whatsapp\.com/i;
    const numericRegex = /\b\d{8,}\b/g; // 8+ consecutive digits
    
    let isBlocked = false;
    let flaggedReason = '';

    if (phoneRegex.test(message)) {
      isBlocked = true;
      flaggedReason = 'Contains phone number';
    } else if (whatsappRegex.test(message)) {
      isBlocked = true;
      flaggedReason = 'Contains WhatsApp reference';
    } else if (numericRegex.test(message)) {
      // Additional check for suspicious numeric strings (fixed type annotation)
      const numericMatches = message.match(numericRegex) || [];
      if (numericMatches.some((match: string) => match.length >= 10)) {
        isBlocked = true;
        flaggedReason = 'Contains suspicious numeric string';
      }
    }

    if (isBlocked) {
      console.log('Message blocked:', flaggedReason);
      
      // Log the flagged message attempt
      const { error: logError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          sender_id: senderId,
          message: '[BLOCKED MESSAGE]',
          is_flagged: true,
          flagged_reason: flaggedReason
        });

      if (logError) {
        console.error('Error logging flagged message:', logError);
      }

      return new Response(JSON.stringify({
        allowed: false,
        flaggedReason,
        warningMessage: 'Sharing personal numbers is strictly prohibited.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Message is allowed - insert it normally
    const { error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        sender_id: senderId,
        message,
        is_flagged: false
      });

    if (insertError) {
      console.error('Error inserting message:', insertError);
      throw new Error('Failed to save message');
    }

    console.log('Message allowed and saved successfully');

    return new Response(JSON.stringify({
      allowed: true,
      message: 'Message sent successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in moderate-chat-message function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error?.message || 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
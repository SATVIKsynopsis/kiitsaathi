// supabase/functions/gen-secure-pdf-url/index.ts

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Service role key for bypassing RLS
);

interface GenerateURLRequest {
  sessionToken: string;
  userAgent?: string;
  ipAddress?: string;
}

interface PDFSession {
  id: string;
  user_id: string;
  pdf_id: number;
  session_token: string;
  expires_at: string;
  is_active: boolean;
  ip_address?: string;
  user_agent?: string;
}

interface PDFRecord {
  id: number;
  filename: string;
  file_path: string;
  upload_user_id: string;
  max_session_duration: number;
  is_active: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
  return new Response("ok", { headers: corsHeaders });
}


  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }

  try {
    // Parse request body
    const requestData: GenerateURLRequest = await req.json();
    const { sessionToken, userAgent, ipAddress } = requestData;

    if (!sessionToken) {
      return new Response(
        JSON.stringify({ 
          error: 'Session token is required',
          code: 'MISSING_TOKEN'
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Validating session token:', sessionToken);

    // Step 1: Validate session token and check expiration
    const { data: sessionData, error: sessionError } = await supabase
      .from('pdf_sessions')
      .select(`
        id,
        user_id,
        pdf_id,
        session_token,
        expires_at,
        is_active,
        ip_address,
        user_agent
      `)
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .single();

    if (sessionError || !sessionData) {
      await logAccess(null, null, 'INVALID_TOKEN_ATTEMPT', {
        session_token: sessionToken,
        error: sessionError?.message || 'Token not found',
        ip_address: ipAddress,
        user_agent: userAgent
      });

      return new Response(
        JSON.stringify({ 
          error: 'Invalid or expired session token',
          code: 'INVALID_TOKEN'
        }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const session = sessionData as PDFSession;
    const now = new Date();
    const expiresAt = new Date(session.expires_at);

    // Check if session has expired
    if (expiresAt <= now) {
      // Mark session as inactive
      await supabase
        .from('pdf_sessions')
        .update({ is_active: false })
        .eq('id', session.id);

      await logAccess(session.id, session.user_id, 'SESSION_EXPIRED', {
        session_token: sessionToken,
        expired_at: session.expires_at,
        current_time: now.toISOString()
      });

      return new Response(
        JSON.stringify({ 
          error: 'Session has expired',
          code: 'SESSION_EXPIRED',
          expiredAt: session.expires_at
        }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Step 2: Get PDF information
    const { data: pdfData, error: pdfError } = await supabase
      .from('pdfs')
      .select(`
        id,
        filename,
        file_path,
        upload_user_id,
        max_session_duration,
        is_active
      `)
      .eq('id', session.pdf_id)
      .eq('is_active', true)
      .single();

    if (pdfError || !pdfData) {
      await logAccess(session.id, session.user_id, 'PDF_NOT_FOUND', {
        pdf_id: session.pdf_id,
        error: pdfError?.message
      });

      return new Response(
        JSON.stringify({ 
          error: 'PDF not found or no longer available',
          code: 'PDF_NOT_FOUND'
        }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const pdf = pdfData as PDFRecord;

    // Step 3: Optional IP validation (if IP was recorded during session creation)
    if (session.ip_address && ipAddress && session.ip_address !== ipAddress) {
      await logAccess(session.id, session.user_id, 'IP_MISMATCH', {
        session_ip: session.ip_address,
        request_ip: ipAddress,
        pdf_id: pdf.id
      });

      // You can choose to either block or just log this
      // For now, we'll log but allow access
      console.warn('IP address mismatch detected:', {
        sessionIP: session.ip_address,
        requestIP: ipAddress
      });
    }

    // Step 4: Generate signed URL from Supabase Storage
    // The signed URL will be valid for remaining session time or max 1 hour (whichever is shorter)
    const timeRemaining = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);
    const signedUrlExpiry = Math.min(timeRemaining, 3600); // Max 1 hour

    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('study-materials')
      .createSignedUrl(pdf.file_path, signedUrlExpiry, {
        download: false, // Set to true if you want force download instead of inline view
      });

    if (urlError || !signedUrlData) {
      await logAccess(session.id, session.user_id, 'URL_GENERATION_FAILED', {
        pdf_id: pdf.id,
        error: urlError?.message
      });

      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate secure URL',
          code: 'URL_GENERATION_FAILED'
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Step 5: Log successful access
    await logAccess(session.id, session.user_id, 'PDF_URL_GENERATED', {
      pdf_id: pdf.id,
      filename: pdf.filename,
      time_remaining: timeRemaining,
      signed_url_expiry: signedUrlExpiry,
      ip_address: ipAddress,
      user_agent: userAgent
    });

    // Step 6: Update session with last access time
    await supabase
      .from('pdf_sessions')
      .update({ 
        user_agent: userAgent || session.user_agent,
        ip_address: ipAddress || session.ip_address 
      })
      .eq('id', session.id);

    // Step 7: Return the secure URL and session info
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          pdfUrl: signedUrlData.signedUrl,
          filename: pdf.filename,
          timeRemaining: timeRemaining,
          expiresAt: session.expires_at,
          sessionId: session.id,
          pdfId: pdf.id
        }
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders,
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block'
        }
      }
    );

  } catch (error: any) {
    console.error('Error in generate-secure-pdf-url function:', error);

    // Log the error
    await logAccess(null, null, 'FUNCTION_ERROR', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

// Helper function to log access attempts
async function logAccess(
  sessionId: string | null, 
  userId: string | null, 
  action: string, 
  details: any = {}
): Promise<void> {
  try {
    await supabase
      .from('pdf_access_logs')
      .insert({
        session_id: sessionId,
        user_id: userId,
        action,
        details: {
          ...details,
          timestamp: new Date().toISOString(),
          function: 'generate-secure-pdf-url'
        }
      });
  } catch (error) {
    console.error('Failed to log access:', error);
    
  }
}

serve(handler);
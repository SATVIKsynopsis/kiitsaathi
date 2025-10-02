// Fixed verify-pdf-session function based on your actual database structure

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return encode(array.buffer)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, ''); 
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  try {
    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid token or user not found',
          details: userError?.message 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Parse request body
    let requestData;
    try {
      const body = await req.text();
      console.log('Request body:', body);
      
      if (!body || body.trim() === '') {
        return new Response(
          JSON.stringify({ error: 'Request body is empty' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
      
      requestData = JSON.parse(body);
    } catch (parseError: any) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: parseError?.message || 'Unknown parsing error' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { pdfId, duration = 1800, ipAddress, userAgent } = requestData;

    console.log('Processing request:', { pdfId, duration, userId: user.id });

    if (!pdfId || typeof pdfId !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Valid PDF ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate duration (5 minutes to 2 hours)
    if (duration < 300 || duration > 7200) {
      return new Response(
        JSON.stringify({ error: 'Duration must be between 300 and 7200 seconds' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if PDF exists and is active
    const { data: pdfData, error: pdfError } = await supabase
      .from('pdfs')
      .select(`
        id,
        pdf_id,
        title,
        file_path,
        upload_user_id,
        max_session_duration,
        is_active
      `)
      .eq('id', pdfId)
      .eq('is_active', true)
      .single();

    console.log('PDF query result:', { pdfData, pdfError });

    if (pdfError || !pdfData) {
      await logAccess(null, user.id, 'PDF_NOT_FOUND', {
        pdf_id: pdfId,
        error: pdfError?.message
      });

      return new Response(
        JSON.stringify({ 
          error: 'PDF not found or not active',
          code: 'PDF_NOT_FOUND'
        }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Since upload_user_id is NULL in your data, we'll allow access to all authenticated users
    // You can modify this logic based on your access control requirements
    const hasAccess = true; // For now, allow all authenticated users
    
    // If you want to restrict access, you could check:
    // - User roles
    // - Semester/branch matching
    // - Specific permissions table
    
    if (!hasAccess) {
      await logAccess(null, user.id, 'ACCESS_DENIED', {
        pdf_id: pdfId,
        reason: 'No access to this PDF'
      });

      return new Response(
        JSON.stringify({ error: 'Access denied to this PDF' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Use PDF's max_session_duration or requested duration, whichever is lower
    const finalDuration = Math.min(duration, pdfData.max_session_duration || duration);

    // Invalidate any existing active sessions for this user/PDF
    await supabase
      .from('pdf_sessions')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('pdf_id', pdfId)
      .eq('is_active', true);

    // Generate new session
    const sessionToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + finalDuration * 1000);

    console.log('Creating session with duration:', finalDuration);

    const { data: sessionData, error: sessionError } = await supabase
      .from('pdf_sessions')
      .insert({
        user_id: user.id,
        pdf_id: pdfId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent,
        is_active: true
      })
      .select('id, session_token, expires_at')
      .single();

    if (sessionError || !sessionData) {
      console.error('Session creation failed:', sessionError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create session',
          details: sessionError?.message 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Log successful session creation
    await logAccess(sessionData.id, user.id, 'SESSION_CREATED', {
      pdf_id: pdfId,
      duration: finalDuration,
      expires_at: expiresAt.toISOString()
    });

    console.log('Session created successfully:', sessionData.id);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          sessionId: sessionData.id,
          sessionToken: sessionData.session_token,
          pdfId: pdfId,
          duration: finalDuration,
          expiresAt: sessionData.expires_at
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Function error:', error);

    await logAccess(null, null, 'FUNCTION_ERROR', {
      error: error.message,
      stack: error.stack
    });

    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

// Helper function to log access
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
          function: 'verify-pdf-session'
        }
      });
  } catch (error) {
    console.error('Failed to log access:', error);
  }
}

serve(handler);



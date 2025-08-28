// supabase/functions/verify-pdf-session/index.ts

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

interface CreateSessionRequest {
  pdfId: number;
  duration?: number; 
  ipAddress?: string;
  userAgent?: string;
  allowedDomain?: string; 
}

// Generate a cryptographically secure session token
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return encode(array)
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
      return new Response(
        JSON.stringify({ error: 'Invalid token or user not found' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Parse request
    const requestData: CreateSessionRequest = await req.json();
    console.log('Request data received:', requestData);
    
    const { 
      pdfId, 
      duration: requestedDuration = 300, // ✅ Renamed to avoid conflicts
      ipAddress,
      userAgent,
      allowedDomain 
    } = requestData;

    console.log('Parsed pdfId:', pdfId, 'Type:', typeof pdfId);

    if (!pdfId) {
      return new Response(
        JSON.stringify({ error: 'PDF ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate duration limits (between 1 minute and 2 hours)
    if (requestedDuration < 60 || requestedDuration > 7200) {
      return new Response(
        JSON.stringify({ error: 'Duration must be between 60 and 7200 seconds' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Creating session for PDF:', pdfId, 'User:', user.id);

    // Check if PDF exists and user has access
    const { data: pdfData, error: pdfError } = await supabase
      .from('pdfs')
      .select('pdf_id, title, uploaded_by')
      .eq('pdf_id', pdfId)
      .single();

    console.log('PDF query result:', { pdfData, pdfError });

    if (pdfError || !pdfData) {
      console.error('PDF not found - Error:', pdfError);
      console.error('PDF not found - Data:', pdfData);
      
      // Let's also check if PDF exists but is inactive
      const { data: inactivePdf, error: inactiveError } = await supabase
        .from('pdfs')
        .select('pdf_id, uploaded_by')
        .eq('pdf_id', pdfId)
        .single();
      
      console.log('Inactive PDF check:', { inactivePdf, inactiveError });

      return new Response(
        JSON.stringify({ 
          error: 'PDF not found or access denied',
          debug: {
            pdfId,
            pdfError: pdfError?.message,
            inactivePdf,
            inactiveError: inactiveError?.message
          }
        }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if user owns the PDF or has permission
    const hasAccess = pdfData.uploaded_by === user.id;
    let effectiveDuration = requestedDuration; // ✅ Use let for reassignment
    
    if (!hasAccess) {
      // Check if there's a permission record
      const { data: permissionData } = await supabase
        .from('pdf_permissions')
        .select('can_access, max_duration')
        .eq('pdf_id', pdfId)
        .eq('user_id', user.id)
        .single();

      if (!permissionData?.can_access) {
        await logAccess(null, user.id, 'ACCESS_DENIED', {
          pdf_id: pdfId,
          reason: 'No permission to access PDF'
        });

        return new Response(
          JSON.stringify({ error: 'Access denied to this PDF' }),
          { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Use permission-specific duration if it's lower
      if (permissionData.max_duration && permissionData.max_duration < effectiveDuration) {
        effectiveDuration = permissionData.max_duration; // ✅ Now this works
      }
    }

    // Respect PDF's max session duration (default to 5 minutes if not specified)
    const finalDuration = Math.min(effectiveDuration, 300); // Default 5 minutes

    console.log('Final duration calculated:', finalDuration);

    // Check for existing active sessions for this user/PDF combo
    const { data: existingSessions, error: existingError } = await supabase
      .from('pdf_sessions')
      .select('id, session_token, expires_at')
      .eq('user_id', user.id)
      .eq('pdf_id', pdfId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString());

    if (existingError) {
      console.error('Error checking existing sessions:', existingError);
    }

    // Optionally limit concurrent sessions
    if (existingSessions && existingSessions.length > 0) {
      console.log('Invalidating existing sessions:', existingSessions.length);
      
      const sessionIds = existingSessions.map(s => s.id);
      const { error: updateError } = await supabase
        .from('pdf_sessions')
        .update({ is_active: false })
        .in('id', sessionIds);

      if (updateError) {
        console.error('Error invalidating old sessions:', updateError);
      }

      await logAccess(null, user.id, 'OLD_SESSIONS_INVALIDATED', {
        pdf_id: pdfId,
        invalidated_sessions: sessionIds.length
      });
    }

    // Generate new session
    const sessionToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + finalDuration * 1000);

    console.log('Creating new session with token:', sessionToken.substring(0, 10) + '...');

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
      console.error('Failed to create session:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('Session created successfully:', sessionData.id);

    // Log successful session creation
    await logAccess(sessionData.id, user.id, 'SESSION_CREATED', {
      pdf_id: pdfId,
      duration: finalDuration,
      expires_at: expiresAt.toISOString(),
      ip_address: ipAddress,
      user_agent: userAgent
    });

    console.log('Returning successful response');

    // Return session data
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          sessionId: sessionData.id,
          sessionToken: sessionData.session_token,
          pdfId: pdfId,
          duration: finalDuration,
          expiresAt: sessionData.expires_at,
          viewUrl: `${Deno.env.get('FRONTEND_URL') || 'http://localhost:3000'}/view/${sessionData.session_token}`
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Error in verify-pdf-session function:', error);
    console.error('Error stack:', error.stack);

    await logAccess(null, null, 'FUNCTION_ERROR', {
      error: error.message,
      stack: error.stack
    });

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
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
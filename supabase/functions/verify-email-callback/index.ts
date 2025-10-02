import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !data?.user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const user = data.user

    // Check if email is confirmed by Supabase Auth
    if (!user.email_confirmed_at) {
      console.log('❌ Email not confirmed by Supabase Auth')
      return new Response(
        JSON.stringify({ 
          error: 'Email not confirmed',
          code: 'EMAIL_NOT_CONFIRMED'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mark email as verified in profiles
    await supabaseClient.rpc('mark_email_verified', { p_user_id: user.id })

    // Log email in email_logs as delivered
    await supabaseClient.from('email_logs').insert({
      user_id: user.id,
      email: user.email,
      email_type: 'verification',
      status: 'delivered',
      delivered_at: new Date().toISOString()
    })

    console.log('✅ Email verified for user:', user.email)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email verified successfully',
        email: user.email
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in verify-email-callback function:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

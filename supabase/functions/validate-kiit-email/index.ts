import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ALLOWED_DOMAIN = 'kiit.ac.in';

serve(async (req) => {
  // Handle CORS preflight requests
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
    const email = user.email?.toLowerCase() || ''
    const domain = email.split('@').pop()
    const provider = user.app_metadata?.provider || 'email'

    console.log('Validating user:', { email, domain, provider })

    // Check if user email ends with @kiit.ac.in
    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      console.log('🚫 Rejecting non-KIIT email:', email)
      
      // Log violation
      await supabaseClient.from('auth_violations').insert({
        user_id: user.id,
        email: email,
        violation_type: 'domain_not_allowed',
        provider: provider,
        reason: `Only KIIT College Email IDs (@${ALLOWED_DOMAIN}) are allowed`,
        metadata: {
          attempted_domain: domain,
          auth_method: provider,
          timestamp: new Date().toISOString()
        }
      })

      // Delete the user from auth.users table
      const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user.id)
      
      if (deleteError) {
        console.error('❌ Error deleting unauthorized user:', deleteError)
      } else {
        console.log('✅ Deleted unauthorized user:', user.id)
      }

      return new Response(
        JSON.stringify({
          error: `Only KIIT College Email IDs (@${ALLOWED_DOMAIN}) are allowed to sign up or log in to KIIT Saathi.`,
          code: 'INVALID_EMAIL_DOMAIN'
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check email verification status
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('is_email_verified, email_verified_at')
      .eq('id', user.id)
      .single()

    // If OAuth provider and email is confirmed, mark as verified
    if (provider !== 'email' && user.email_confirmed_at && !profile?.is_email_verified) {
      console.log('✅ OAuth user with confirmed email, marking as verified:', email)
      await supabaseClient.rpc('mark_email_verified', { p_user_id: user.id })
    }

    // Log successful validation
    await supabaseClient.from('auth_events').insert({
      user_id: user.id,
      email: email,
      event_type: provider === 'email' ? 'signin' : 'oauth_callback',
      provider: provider,
      metadata: {
        email_verified: profile?.is_email_verified || false,
        timestamp: new Date().toISOString()
      }
    })

    console.log('✅ Allowing KIIT email:', email)

    return new Response(
      JSON.stringify({ 
        success: true,
        email_verified: profile?.is_email_verified || false
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('❌ Error in validate-kiit-email function:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Alert thresholds
const ALERT_THRESHOLDS = {
  DOMAIN_REJECTED_PER_10MIN: 10,
  EMAIL_BOUNCE_RATE_PERCENT: 5,
  FAILED_VERIFICATIONS_PER_USER: 3
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

    const now = new Date()
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)

    // Check 1: Domain rejection rate
    const { count: domainRejections } = await supabaseClient
      .from('auth_violations')
      .select('*', { count: 'exact', head: true })
      .eq('violation_type', 'domain_not_allowed')
      .gte('created_at', tenMinutesAgo.toISOString())

    const alerts: any[] = []

    if (domainRejections && domainRejections >= ALERT_THRESHOLDS.DOMAIN_REJECTED_PER_10MIN) {
      alerts.push({
        type: 'HIGH_DOMAIN_REJECTION_RATE',
        severity: 'HIGH',
        message: `${domainRejections} non-KIIT email signup attempts in last 10 minutes`,
        threshold: ALERT_THRESHOLDS.DOMAIN_REJECTED_PER_10MIN,
        actual: domainRejections,
        recommendation: 'Monitor for potential brute force or automated attacks'
      })
    }

    // Check 2: Email bounce rate
    const { data: emailStats } = await supabaseClient
      .from('email_logs')
      .select('status')
      .gte('created_at', tenMinutesAgo.toISOString())

    if (emailStats && emailStats.length > 0) {
      const bounced = emailStats.filter(e => e.status === 'bounced').length
      const total = emailStats.length
      const bounceRate = (bounced / total) * 100

      if (bounceRate >= ALERT_THRESHOLDS.EMAIL_BOUNCE_RATE_PERCENT) {
        alerts.push({
          type: 'HIGH_EMAIL_BOUNCE_RATE',
          severity: 'MEDIUM',
          message: `Email bounce rate is ${bounceRate.toFixed(1)}%`,
          threshold: ALERT_THRESHOLDS.EMAIL_BOUNCE_RATE_PERCENT,
          actual: bounceRate,
          recommendation: 'Check email service configuration and DNS records'
        })
      }
    }

    // Check 3: Failed verification attempts per user
    const { data: failedVerifications } = await supabaseClient
      .from('auth_events')
      .select('user_id, email')
      .eq('event_type', 'verification_failed')
      .gte('created_at', tenMinutesAgo.toISOString())

    if (failedVerifications) {
      const userCounts = failedVerifications.reduce((acc: any, curr) => {
        acc[curr.user_id] = (acc[curr.user_id] || 0) + 1
        return acc
      }, {})

      Object.entries(userCounts).forEach(([userId, count]) => {
        if ((count as number) >= ALERT_THRESHOLDS.FAILED_VERIFICATIONS_PER_USER) {
          const user = failedVerifications.find(v => v.user_id === userId)
          alerts.push({
            type: 'MULTIPLE_FAILED_VERIFICATIONS',
            severity: 'MEDIUM',
            message: `User ${user?.email} has ${count} failed verification attempts`,
            user_id: userId,
            email: user?.email,
            threshold: ALERT_THRESHOLDS.FAILED_VERIFICATIONS_PER_USER,
            actual: count,
            recommendation: 'User may need support or account may be compromised'
          })
        }
      })
    }

    // Send alerts if any
    if (alerts.length > 0) {
      console.log('🚨 SECURITY ALERTS:', JSON.stringify(alerts, null, 2))
      
      // Store alerts in admin_action_logs for admin visibility
      for (const alert of alerts) {
        await supabaseClient.from('admin_action_logs').insert({
          action: 'security_alert',
          details: alert,
          command: alert.type
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        alerts_count: alerts.length,
        alerts: alerts,
        checked_at: now.toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in auth-monitor function:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

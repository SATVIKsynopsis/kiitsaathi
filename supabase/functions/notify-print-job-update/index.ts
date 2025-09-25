import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  jobId: string;
  status: string;
  helperName?: string;
  estimatedTime?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId, status, helperName, estimatedTime }: NotificationRequest = await req.json();

    console.log(`Sending notification for job ${jobId} with status ${status}`);

    // Get job and user details
    const { data: job, error: jobError } = await supabase
      .from('print_jobs')
      .select(`
        *,
        profiles!print_jobs_user_id_fkey(email, full_name)
      `)
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      throw new Error('Job not found');
    }

    // Get status messages
    const statusMessages = {
      accepted: `Your print job has been accepted by ${helperName}! 🎉`,
      printing: `Your documents are being printed now! 🖨️`,
      ready_for_pickup: `Your printouts are ready for pickup! 📄`,
      delivered: `Your printouts have been delivered! ✅`,
      completed: `Print job completed successfully! Thank you for using KIIT Saathi! 🙏`
    };

    const message = statusMessages[status] || `Status updated to: ${status}`;
    
    // Create notification in database
    const { error: notifError } = await supabase.rpc('create_print_job_notification', {
      p_job_id: jobId,
      p_user_id: job.user_id,
      p_type: `job_${status}`,
      p_message: message
    });

    if (notifError) {
      console.error('Error creating notification:', notifError);
    }

    // Send email notification if user has email
    const userEmail = job.profiles?.email;
    if (userEmail) {
      const emailSubject = `Print Job Update - ${job.file_name}`;
      const emailContent = `
        <h1>📄 Print Job Update</h1>
        <p><strong>Job ID:</strong> ${jobId}</p>
        <p><strong>File:</strong> ${job.file_name}</p>
        <p><strong>Status:</strong> ${message}</p>
        
        ${status === 'accepted' && helperName ? 
          `<p><strong>Helper:</strong> ${helperName}</p>` : ''}
        
        ${estimatedTime ? 
          `<p><strong>Estimated Time:</strong> ${estimatedTime}</p>` : ''}
        
        ${status === 'ready_for_pickup' ? 
          `<div style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3>📍 Pickup Information</h3>
            <p><strong>Location:</strong> ${job.delivery_location}</p>
            <p>Please contact your helper for exact pickup details.</p>
          </div>` : ''}
        
        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          Track your order status on the KIIT Saathi app.
        </p>
      `;

      try {
        await resend.emails.send({
          from: "KIIT Saathi Print Service <printservice@kiitsaathi.com>",
          to: [userEmail],
          subject: emailSubject,
          html: emailContent,
        });
        console.log(`Email notification sent to ${userEmail}`);
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Notification sent successfully" 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
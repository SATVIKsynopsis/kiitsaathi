import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

// Email functionality temporarily disabled to fix build errors
// const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const { fullName, email, phone, subject, message }: ContactFormData = await req.json();

    console.log("Processing contact form submission:", { fullName, email, subject });

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get current user (if authenticated)
    const { data: { user } } = await supabase.auth.getUser();

    // Save contact form submission to database
    const { error: dbError } = await supabase
      .from('contacts')
      .insert({
        user_id: user?.id,
        full_name: fullName,
        email: email,
        phone: phone,
        subject: subject,
        message: message,
        status: 'new'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue with email sending even if database save fails
    } else {
      console.log("Contact form saved to database successfully");
    }

    // Send notification email to KIIT Saathi team
    const adminEmailResponse = await resend.emails.send({
      from: "KIIT Saathi <onboarding@resend.dev>",
      to: ["kiitsaathi@gmail.com"], // Replace with actual admin email
      subject: `New Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-left: 4px solid #6366f1; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Message:</h3>
            <p style="line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              This email was sent from the KIIT Saathi contact form.
            </p>
          </div>
        </div>
      `,
    });

    // Send auto-reply email to the user
    const userEmailResponse = await resend.emails.send({
      from: "KIIT Saathi <onboarding@resend.dev>",
      to: [email],
      subject: "Thanks for contacting KIIT Saathi! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #6366f1; margin-bottom: 10px;">Thanks for reaching out!</h1>
            <p style="font-size: 18px; color: #333;">Hi ${fullName} 👋</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px; color: white; text-align: center; margin: 20px 0;">
            <h2 style="margin: 0 0 15px 0;">We've received your message!</h2>
            <p style="margin: 0; font-size: 16px; opacity: 0.9;">
              Our team will get back to you within 24 hours.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Message Summary:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong> ${message.length > 100 ? message.substring(0, 100) + '...' : message}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666;">
              Meanwhile, feel free to explore our services:<br>
              🧾 SplitSaathi | 📚 Study Materials | 🔍 Lost & Found | 👥 Senior Connect
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              Best regards,<br>
              <strong style="color: #6366f1;">The KIIT Saathi Team</strong>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Admin email sent:", adminEmailResponse);
    console.log("User auto-reply sent:", userEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Message sent successfully! We'll get back to you soon." 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to send message. Please try again later." 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
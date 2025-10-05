import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SignupEmailData {
  user: {
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
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
    const webhookData: SignupEmailData = await req.json();
    const { user, email_data } = webhookData;
    
    // Extract first name from full name, fallback to 'Student'
    const fullName = user.user_metadata?.full_name || 'Student';
    const firstName = fullName.split(' ')[0] || 'Student';
    const confirmationUrl = `${email_data.site_url}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${email_data.redirect_to}`;

    console.log("Processing signup confirmation for:", user.email);

    // Send confirmation email via Resend
    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: "KIIT Saathi <noreply@ksaathi.app>",
      to: [user.email],
      subject: "🎓 Verify Your KIIT Saathi Account",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f7fa; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  <tr>
                    <td style="background: linear-gradient(135deg, #0066FF 0%, #00C896 100%); padding: 40px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Welcome to KIIT Saathi!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px; color: #1a1a1a; font-size: 16px; line-height: 1.6;">
                        Hi ${firstName},
                      </p>
                      <p style="margin: 0 0 20px; color: #1a1a1a; font-size: 16px; line-height: 1.6;">
                        Thanks for signing up for KIIT Saathi! We're excited to have you on board. 🎉
                      </p>
                      <p style="margin: 0 0 30px; color: #1a1a1a; font-size: 16px; line-height: 1.6;">
                        Click the button below to verify your email and activate your account:
                      </p>
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, #0066FF 0%, #00C896 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">Verify Email Address</a>
                      </div>
                      <p style="margin: 30px 0 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="margin: 0 0 30px; color: #0066FF; font-size: 14px; word-break: break-all;">
                        ${confirmationUrl}
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.6;">
                        If you didn't create an account with KIIT Saathi, please ignore this email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f5f7fa; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #666666; font-size: 13px;">
                        © ${new Date().getFullYear()} KIIT Saathi. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Email send error:", emailError);
      throw emailError;
    }

    console.log("Signup confirmation sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Signup confirmation email sent successfully!" 
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
    console.error("Error in send-signup-confirmation function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to send signup confirmation email. Please try again later." 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
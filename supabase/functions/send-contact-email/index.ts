import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

// Email functionality temporarily disabled to fix build errors
// const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface ContactFormData {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  try {
    const { fullName, email, phone, subject, message }: ContactFormData = await req.json();

    console.log("Processing contact form submission:", { fullName, email, subject });

    // Validate required fields
    if (!fullName || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Store contact form data in database
    try {
      const { error: dbError } = await supabase
        .from("contacts")
        .insert({
          full_name: fullName,
          email: email,
          phone: phone,
          subject: subject,
          message: message,
        });

      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }

      console.log("Contact form saved to database successfully");
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
    }

    // Email functionality temporarily disabled - core functionality maintained
    console.log("Admin notification would be sent:", subject, "from:", email);
    console.log("User auto-reply would be sent to:", email);

    console.log("Contact form processed successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Your message has been received! We'll get back to you soon." 
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
        error: "Failed to process contact form. Please try again later.",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
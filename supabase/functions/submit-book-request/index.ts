import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookSubmissionRequest {
  type: 'sell' | 'buy';
  fullName: string;
  rollNumber: string;
  contactNumber: string;
  email?: string;
  bookTitles?: string;
  branch?: string;
  yearOfStudy?: string;
  bookCondition?: string;
  photoUrls?: string[];
  pickupLocation?: string;
  termsAccepted?: boolean;
  bookSetNeeded?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get user ID from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const requestData: BookSubmissionRequest = await req.json();
    console.log("Received book request:", requestData);

    if (requestData.type === 'sell') {
      // Razorpay payment verification (for paid requests)
      let paymentVerified = true;
      let paymentStatus = 'not-required';
      let paymentDetails = null;
      if (requestData.razorpay_payment_id && requestData.razorpay_order_id && requestData.razorpay_signature) {
        // Verify payment using Razorpay API
        const crypto = await import('node:crypto');
        const generated_signature = crypto.createHmac('sha256', Deno.env.get('RAZORPAY_SECRET'))
          .update(requestData.razorpay_order_id + '|' + requestData.razorpay_payment_id)
          .digest('hex');
        paymentVerified = generated_signature === requestData.razorpay_signature;
        paymentStatus = paymentVerified ? 'success' : 'failed';
        paymentDetails = {
          payment_id: requestData.razorpay_payment_id,
          order_id: requestData.razorpay_order_id,
          signature: requestData.razorpay_signature,
          verified: paymentVerified
        };
        if (!paymentVerified) {
          return new Response(JSON.stringify({ error: 'Payment verification failed' }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
      }
      // Handle book selling submission
      const { data, error } = await supabase
        .from('book_submissions')
        .insert([{
          user_id: user.id,
          full_name: requestData.fullName,
          roll_number: requestData.rollNumber,
          contact_number: requestData.contactNumber,
          email: requestData.email || user.email,
          book_titles: requestData.bookTitles,
          branch: requestData.branch,
          year_of_study: requestData.yearOfStudy,
          book_condition: requestData.bookCondition,
          photo_urls: requestData.photoUrls,
          pickup_location: requestData.pickupLocation,
          terms_accepted: requestData.termsAccepted,
          payment_status: paymentStatus,
          payment_details: paymentDetails
        }])
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      // Send notification email to admin
      await resend.emails.send({
        from: "KIIT Saathi <onboarding@resend.dev>",
        to: ["kiitsaathi@gmail.com"],
        subject: "New Book Selling Request! 📚",
        html: `
          <h2>New Book Selling Request</h2>
          <p><strong>Student:</strong> ${requestData.fullName}</p>
          <p><strong>Roll Number:</strong> ${requestData.rollNumber}</p>
          <p><strong>Contact:</strong> ${requestData.contactNumber}</p>
          <p><strong>Email:</strong> ${requestData.email || user.email}</p>
          <p><strong>Books:</strong> ${requestData.bookTitles}</p>
          <p><strong>Branch:</strong> ${requestData.branch}</p>
          <p><strong>Year:</strong> ${requestData.yearOfStudy}</p>
          <p><strong>Condition:</strong> ${requestData.bookCondition}</p>
          <p><strong>Pickup Location:</strong> ${requestData.pickupLocation}</p>
          <p>Please contact the student to arrange pickup and pricing.</p>
        `,
      });

      // Send confirmation email to student
      await resend.emails.send({
        from: "KIIT Saathi <onboarding@resend.dev>",
        to: [requestData.email || user.email!],
        subject: "Book Selling Request Received - KIIT Saathi",
        html: `
          <h2>Thank you for your book selling request!</h2>
          <p>Dear ${requestData.fullName},</p>
          <p>We have received your request to sell books. Here are the details:</p>
          <ul>
            <li><strong>Books:</strong> ${requestData.bookTitles}</li>
            <li><strong>Condition:</strong> ${requestData.bookCondition}</li>
            <li><strong>Pickup Location:</strong> ${requestData.pickupLocation}</li>
          </ul>
          <p>Our team will review your submission and contact you within 24 hours with a quote and pickup details.</p>
          <p>Best regards,<br>The KIIT Saathi Team</p>
        `,
      });

    } else if (requestData.type === 'buy') {
      // Razorpay payment verification (for paid requests)
      let paymentVerified = true;
      let paymentStatus = 'not-required';
      let paymentDetails = null;
      if (requestData.razorpay_payment_id && requestData.razorpay_order_id && requestData.razorpay_signature) {
        // Verify payment using Razorpay API
        const crypto = await import('node:crypto');
        const generated_signature = crypto.createHmac('sha256', Deno.env.get('RAZORPAY_SECRET'))
          .update(requestData.razorpay_order_id + '|' + requestData.razorpay_payment_id)
          .digest('hex');
        paymentVerified = generated_signature === requestData.razorpay_signature;
        paymentStatus = paymentVerified ? 'success' : 'failed';
        paymentDetails = {
          payment_id: requestData.razorpay_payment_id,
          order_id: requestData.razorpay_order_id,
          signature: requestData.razorpay_signature,
          verified: paymentVerified
        };
        if (!paymentVerified) {
          return new Response(JSON.stringify({ error: 'Payment verification failed' }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
      }
      // Handle book purchase request
      const { data, error } = await supabase
        .from('book_purchase_requests')
        .insert([{
          user_id: user.id,
          full_name: requestData.fullName,
          roll_number: requestData.rollNumber,
          contact_number: requestData.contactNumber,
          book_set_needed: requestData.bookSetNeeded,
          payment_status: paymentStatus,
          payment_details: paymentDetails
        }])
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      // Send notification email to admin
      await resend.emails.send({
        from: "KIIT Saathi <onboarding@resend.dev>",
        to: ["kiitsaathi@gmail.com"],
        subject: "New Book Purchase Request! 📖",
        html: `
          <h2>New Book Purchase Request</h2>
          <p><strong>Student:</strong> ${requestData.fullName}</p>
          <p><strong>Roll Number:</strong> ${requestData.rollNumber}</p>
          <p><strong>Contact:</strong> ${requestData.contactNumber}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Book Set Needed:</strong> ${requestData.bookSetNeeded}</p>
          <p>Please check inventory and contact the student with availability and pricing.</p>
        `,
      });
    }

    console.log("Book request processed successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: requestData.type === 'sell' 
          ? "Book selling request submitted successfully! We'll contact you soon with a quote."
          : "Book purchase request submitted successfully! We'll contact you with availability and pricing."
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
    console.error("Error in submit-book-request function:", error);
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
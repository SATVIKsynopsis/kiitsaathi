import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

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
          terms_accepted: requestData.termsAccepted
        }])
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      // Email functionality temporarily disabled - core functionality maintained
      console.log("Admin notification would be sent about book selling request");
      console.log("Confirmation email would be sent to:", requestData.email || user.email);

      console.log("Book selling request processed successfully");

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Book selling request submitted successfully! We'll contact you soon.",
          submissionId: data.id
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    } else {
      // Handle book purchase request
      const { data, error } = await supabase
        .from('book_purchase_requests')
        .insert([{
          user_id: user.id,
          full_name: requestData.fullName,
          roll_number: requestData.rollNumber,
          contact_number: requestData.contactNumber,
          email: requestData.email || user.email,
          book_set_needed: requestData.bookSetNeeded,
          branch: requestData.branch,
          year_of_study: requestData.yearOfStudy,
        }])
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      // Email functionality temporarily disabled - core functionality maintained  
      console.log("Admin notification would be sent about book purchase request");

      console.log("Book purchase request processed successfully");

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Book purchase request submitted successfully! We'll contact you with availability.",
          requestId: data.id
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
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
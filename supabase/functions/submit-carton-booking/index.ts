import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartonBookingRequest {
  fullName: string;
  mobileNumber: string;
  hostelName: string;
  roomNumber: string;
  numberOfBoxes: number;
  needTape: boolean;
  pickupSlot: string;
  paymentMethod: string;
  totalPrice: number;
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

    // Create Supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user ID from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const bookingData: CartonBookingRequest = await req.json();
    console.log("Received carton booking:", bookingData);

    // Insert booking into database with user_id
    const { data: booking, error: dbError } = await supabase
      .from("carton_transfer_bookings")
      .insert({
        user_id: user.id,
        full_name: bookingData.fullName,
        mobile_number: bookingData.mobileNumber,
        hostel_name: bookingData.hostelName,
        room_number: bookingData.roomNumber,
        number_of_boxes: bookingData.numberOfBoxes,
        need_tape: bookingData.needTape,
        pickup_slot: bookingData.pickupSlot,
        payment_method: bookingData.paymentMethod,
        total_price: bookingData.totalPrice,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }

    // Send notification email to admin
    await resend.emails.send({
      from: "KIIT Saathi <onboarding@resend.dev>",
      to: ["kiitsaathi@gmail.com"],
      subject: "New Carton Transfer Booking! 📦",
      html: `
        <h2>New Carton Transfer Booking</h2>
        <p><strong>Customer:</strong> ${bookingData.fullName}</p>
        <p><strong>Contact:</strong> ${bookingData.mobileNumber}</p>
        <p><strong>Location:</strong> ${bookingData.hostelName}, Room ${bookingData.roomNumber}</p>
        <p><strong>Pickup Slot:</strong> ${bookingData.pickupSlot}</p>
        <p><strong>Number of Boxes:</strong> ${bookingData.numberOfBoxes}</p>
        <p><strong>Tape Required:</strong> ${bookingData.needTape ? 'Yes' : 'No'}</p>
        <p><strong>Payment Method:</strong> ${bookingData.paymentMethod}</p>
        <p><strong>Total Price:</strong> ₹${bookingData.totalPrice}</p>
        <p><strong>User Email:</strong> ${user.email}</p>
        <p>Please coordinate with the customer for pickup.</p>
      `,
    });

    console.log("Carton booking processed successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Booking submitted successfully! We'll contact you soon.",
        bookingId: booking.id
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
    console.error("Error in submit-carton-booking function:", error);
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
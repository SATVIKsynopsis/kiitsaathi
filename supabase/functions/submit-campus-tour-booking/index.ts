import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";
// import { Resend } from "npm:resend@2.0.0";

// const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CampusTourBookingRequest {
  guestName: string;
  contactNumber: string;
  email?: string;
  selectedDate: string;
  selectedSlot: string;
  groupSize: number;
  specialRequests?: string;
  tourType: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: user, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user.user) {
      throw new Error("Authentication failed");
    }

    const booking: CampusTourBookingRequest = await req.json();

    // Calculate price based on tour type and group size
    const basePrice = booking.tourType === 'morning' ? 299 : 399;
    const totalPrice = basePrice + (booking.groupSize > 4 ? (booking.groupSize - 4) * 50 : 0);

    // Insert booking into database
    const { data: bookingData, error: insertError } = await supabase
      .from("campus_tour_bookings")
      .insert({
        user_id: user.user.id,
        guest_name: booking.guestName,
        contact_number: booking.contactNumber,
        email: booking.email,
        selected_date: booking.selectedDate,
        selected_slot: booking.selectedSlot,
        group_size: booking.groupSize,
        special_requests: booking.specialRequests,
        tour_type: booking.tourType,
        price: totalPrice,
        status: "pending"
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Email functionality temporarily disabled - core functionality maintained
    console.log("Campus tour confirmation would be sent to:", booking.email || user.user.email);

    return new Response(JSON.stringify({ 
      success: true, 
      booking: bookingData,
      totalPrice 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in submit-campus-tour-booking:", error);
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
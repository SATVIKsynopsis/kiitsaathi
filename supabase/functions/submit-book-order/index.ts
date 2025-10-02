import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookOrderRequest {
  books: Array<{
    id: string;
    quantity: number;
    selling_price: number;
    semester_book: {
      book_name: string;
      author: string;
      semester: number;
    };
  }>;
  deliveryAddress: string;
  contactNumber: string;
  paymentMethod: string;
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

    const orderData: BookOrderRequest = await req.json();

    // Calculate total amount
    const totalAmount = orderData.books.reduce((total, book) => 
      total + (book.selling_price * book.quantity), 0
    );

    // Insert order into database
    const { data: order, error: insertError } = await supabase
      .from("book_orders")
      .insert({
        buyer_id: user.user.id,
        books: orderData.books,
        total_amount: totalAmount,
        delivery_address: orderData.deliveryAddress,
        contact_number: orderData.contactNumber,
        payment_method: orderData.paymentMethod,
        order_status: "placed"
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Update book inventory status to 'sold'
    for (const book of orderData.books) {
      await supabase
        .from("book_inventory")
        .update({ 
          status: 'sold',
          buyer_id: user.user.id,
          sold_at: new Date().toISOString()
        })
        .eq('id', book.id);
    }

    // Email functionality temporarily disabled - core functionality maintained
    console.log("Book order confirmation would be sent to:", user.user.email);

    return new Response(JSON.stringify({ 
      success: true, 
      order: order,
      message: "Order placed successfully!" 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in submit-book-order:", error);
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
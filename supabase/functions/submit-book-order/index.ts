import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
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
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
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

    // Razorpay payment verification (for online payments)
  // Payment verification and order creation are now handled by the Node.js backend. Remove old Razorpay logic.

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
        // payment_status and payment_details are now handled by the Node.js backend
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

    // Send confirmation email
    try {
      const booksList = orderData.books.map(book => 
        `<li>${book.semester_book.book_name} by ${book.semester_book.author} - Qty: ${book.quantity} - ₹${book.selling_price * book.quantity}</li>`
      ).join('');

      await resend.emails.send({
        from: "KIIT Saathi <orders@kiitsaathi.com>",
        to: [user.user.email!],
        subject: "Book Order Confirmation - KIIT Saathi",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin-bottom: 10px;">📚 Order Confirmed!</h1>
              <p style="color: #6b7280; font-size: 16px;">Your book order has been successfully placed</p>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #374151; margin-bottom: 15px;">Order Details</h2>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
              <p><strong>Payment Method:</strong> ${orderData.paymentMethod.toUpperCase()}</p>
              <p><strong>Delivery Address:</strong> ${orderData.deliveryAddress}</p>
              <p><strong>Contact:</strong> ${orderData.contactNumber}</p>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h3 style="color: #374151; margin-bottom: 15px;">Books Ordered:</h3>
              <ul style="color: #374151; line-height: 1.6;">
                ${booksList}
              </ul>
            </div>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 10px; border-left: 4px solid #10b981; margin-bottom: 20px;">
              <h3 style="color: #059669; margin-bottom: 10px;">What's Next?</h3>
              <ul style="color: #374151; line-height: 1.6;">
                <li>Our team will contact you within 24 hours</li>
                <li>Payment collection and book delivery will be coordinated</li>
                <li>Books will be delivered to your specified address</li>
                <li>You can track your order status in your dashboard</li>
              </ul>
            </div>
            
            <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin-bottom: 10px;">Questions? Contact us at:</p>
              <p style="color: #2563eb;"><strong>Phone:</strong> +91 9876543210</p>
              <p style="color: #6b7280; font-size: 14px;">This is an automated email from KIIT Saathi</p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      order,
      totalAmount 
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
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookSelectionRequest {
  selectedBooks: string[];
  selectedCombo?: string;
  totalAmount: number;
  semester: number;
  action: 'buy' | 'sell';
  userDetails: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    rollNumber?: string;
    branch?: string;
    yearOfStudy?: string;
    upiId?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header is required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const requestData: BookSelectionRequest = await req.json();
    const { selectedBooks, selectedCombo, totalAmount, semester, action, userDetails } = requestData;

    // Validate required fields
    if (!userDetails || !userDetails.name || !userDetails.email || !userDetails.phone) {
      return new Response(
        JSON.stringify({ error: 'User details (name, email, phone) are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (action === 'buy') {
      // Handle book purchase order
      const { data: order, error: orderError } = await supabase
        .from('book_orders')
        .insert({
          buyer_id: user.id,
          books: {
            semester,
            selectedBooks: selectedBooks || [],
            selectedCombo: selectedCombo || null,
            bookDetails: selectedBooks // This would normally contain full book info
          },
          total_amount: totalAmount,
          contact_number: userDetails.phone,
          delivery_address: userDetails.address || '',
          order_status: 'placed',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        return new Response(
          JSON.stringify({ error: 'Failed to create order' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          orderId: order.id,
          message: 'Book order placed successfully!'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );

    } else if (action === 'sell') {
      // Handle book buyback/sell request
      const { data: submission, error: submissionError } = await supabase
        .from('book_submissions')
        .insert({
          user_id: user.id,
          semester,
          selected_books: {
            semester,
            selectedBooks: selectedBooks || [],
            selectedCombo: selectedCombo || null
          },
          total_estimated_price: totalAmount,
          full_name: userDetails.name,
          roll_number: userDetails.rollNumber || 'N/A',
          email: userDetails.email,
          contact_number: userDetails.phone,
          pickup_location: userDetails.address || '',
          book_condition: 'good', // Default condition
          year_of_study: userDetails.yearOfStudy || `Semester ${semester}`,
          branch: userDetails.branch || 'General',
          book_titles: selectedBooks?.join(', ') || selectedCombo || '',
          upi_id: userDetails.upiId || null,
          terms_accepted: true,
          status: 'pending'
        })
        .select()
        .single();

      if (submissionError) {
        console.error('Error creating submission:', submissionError);
        return new Response(
          JSON.stringify({ error: 'Failed to create buyback request' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          submissionId: submission.id,
          message: 'Buyback request submitted successfully!'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Must be "buy" or "sell"' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in submit-book-selection function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
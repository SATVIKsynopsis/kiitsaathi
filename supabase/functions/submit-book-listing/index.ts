import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookListingRequest {
  title: string;
  author: string;
  semester?: number;
  condition: string;
  price: number;
  description?: string;
  images?: string[];
  contactInfo: {
    name: string;
    phone: string;
    email: string;
    preferredContact: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log('📚 Book listing function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('User not authenticated');
    }

    const listingData: BookListingRequest = await req.json();
    console.log('📋 Listing data received:', listingData);

    // Insert book listing into database
    const { data: listing, error: insertError } = await supabase
      .from('book_listings')
      .insert([{
        user_id: user.id,
        title: listingData.title,
        author: listingData.author,
        semester: listingData.semester,
        condition: listingData.condition,
        price: listingData.price,
        description: listingData.description,
        images: listingData.images || [],
        contact_info: listingData.contactInfo,
        status: 'active'
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting listing:', insertError);
      throw new Error(`Failed to create listing: ${insertError.message}`);
    }

    console.log('✅ Book listing created:', listing.id);

    // Email functionality temporarily disabled - core functionality maintained
    console.log('Confirmation email would be sent to:', listingData.contactInfo.email);
    console.log('Admin notification would be sent about new book listing');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Book listed successfully!',
        listingId: listing.id 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('❌ Error in book listing function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create book listing'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);
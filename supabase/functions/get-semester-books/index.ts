import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SemesterBooksRequest {
  semester: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = globalThis['SUPABASE_URL'] as string;
    const supabaseKey = globalThis['SUPABASE_SERVICE_ROLE_KEY'] as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'GET') {
      // Get semester from URL params
      const url = new URL(req.url);
      const semester = url.searchParams.get('semester');
      
      if (!semester) {
        return new Response(
          JSON.stringify({ error: 'Semester parameter is required' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Fetch books for the semester
      const { data: books, error: booksError } = await supabase
        .from('semester_books')
        .select('*')
        .eq('semester', parseInt(semester))
        .order('subject_category', { ascending: true });

      if (booksError) {
        console.error('Error fetching books:', booksError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch books' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      // Fetch combos for the semester
      const { data: combos, error: combosError } = await supabase
        .from('semester_combos')
        .select('*')
        .eq('semester_number', parseInt(semester));

      if (combosError) {
        console.error('Error fetching combos:', combosError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch combos' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          books: books || [], 
          combos: combos || [],
          semester: parseInt(semester)
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in get-semester-books function:', error);
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
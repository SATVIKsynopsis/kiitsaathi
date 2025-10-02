import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
// import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface AssignmentRequest {
  assignmentId: string;
  studentName: string;
  whatsappNumber: string;
  year: string;
  branch: string;
  pages: number;
  deadline: string;
  deliveryMethod: string;
  totalPrice: number;
  fileCount: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: AssignmentRequest = await req.json();
    console.log('Assignment request received:', requestData);

    // Email functionality temporarily disabled - core functionality maintained
    console.log("Assignment confirmation would be sent to:", `${requestData.studentName.toLowerCase().replace(' ', '.')}@kiit.ac.in`);

    // Notify helpers about new assignment
    const { data: helpers } = await supabase
      .from('assignment_helpers')
      .select('email, name, specializations')
      .eq('is_active', true);

    if (helpers && helpers.length > 0) {
      // Find relevant helpers based on branch/specializations
      const relevantHelpers = helpers.filter(helper => 
        helper.specializations?.some((spec: string) => 
          spec.toLowerCase().includes(requestData.branch.toLowerCase()) ||
          requestData.branch.toLowerCase().includes(spec.toLowerCase())
        ) || helpers.length < 3 // Include all if few helpers
      );

      // Log helper notifications (email functionality disabled)
      for (const helper of relevantHelpers.slice(0, 3)) {
        console.log("Helper notification would be sent to:", helper.email);
      }
    }

    console.log('Assignment notifications processed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Assignment request processed successfully',
        assignmentId: requestData.assignmentId
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Error in submit-assignment-request function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process assignment request'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);
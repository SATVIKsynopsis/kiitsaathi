import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

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

    // Send confirmation email to student
    const studentEmailResponse = await resend.emails.send({
      from: 'KIIT Saathi <assignments@kiitsaathi.com>',
      to: [`${requestData.studentName.toLowerCase().replace(' ', '.')}@kiit.ac.in`],
      subject: '📝 Assignment Request Confirmed - KIIT Saathi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">📝 Assignment Request Confirmed!</h1>
              <p style="color: #64748b; margin: 10px 0 0 0; font-size: 16px;">Your handwritten assignment is being processed</p>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1e293b; margin: 0 0 15px 0;">📋 Request Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #64748b; font-weight: 500;">Order ID:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">#${requestData.assignmentId.substring(0, 8)}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b; font-weight: 500;">Subject/Branch:</td><td style="padding: 8px 0; color: #1e293b;">${requestData.branch}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b; font-weight: 500;">Pages:</td><td style="padding: 8px 0; color: #1e293b;">${requestData.pages} pages</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b; font-weight: 500;">Deadline:</td><td style="padding: 8px 0; color: #1e293b;">${new Date(requestData.deadline).toLocaleDateString()}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b; font-weight: 500;">Delivery Method:</td><td style="padding: 8px 0; color: #1e293b;">${requestData.deliveryMethod === 'hostel_delivery' ? '🏠 Hostel Delivery' : '📍 Pickup'}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b; font-weight: 500;">Files Uploaded:</td><td style="padding: 8px 0; color: #1e293b;">${requestData.fileCount} files</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b; font-weight: 500;">Total Amount:</td><td style="padding: 8px 0; color: #059669; font-weight: 700; font-size: 18px;">₹${requestData.totalPrice}</td></tr>
              </table>
            </div>

            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h4 style="color: #92400e; margin: 0 0 10px 0; display: flex; align-items: center;">
                ⚠️ Important Disclaimer
              </h4>
              <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.5;">
                <strong>Marks depend on the provided content.</strong> KIIT Saathi and the assigned helper are not responsible for low marks if the content is copied exactly as provided. Please ensure your uploaded content is accurate and complete.
              </p>
            </div>

            <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #0277bd; margin: 0 0 15px 0;">📱 What Happens Next?</h3>
              <div style="color: #01579b;">
                <p style="margin: 8px 0; display: flex; align-items: center;"><span style="margin-right: 10px;">✅</span> <strong>Step 1:</strong> Helper assigned within 2 hours</p>
                <p style="margin: 8px 0; display: flex; align-items: center;"><span style="margin-right: 10px;">📝</span> <strong>Step 2:</strong> Writing begins (you'll get updates on WhatsApp)</p>
                <p style="margin: 8px 0; display: flex; align-items: center;"><span style="margin-right: 10px;">🚚</span> <strong>Step 3:</strong> ${requestData.deliveryMethod === 'hostel_delivery' ? 'Delivery to your hostel' : 'Pickup notification sent'}</p>
                <p style="margin: 8px 0; display: flex; align-items: center;"><span style="margin-right: 10px;">💯</span> <strong>Step 4:</strong> Assignment completed!</p>
              </div>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #64748b; margin: 0; font-size: 14px;">
                Need help? WhatsApp us at <strong>+91 ${requestData.whatsappNumber}</strong>
              </p>
              <p style="color: #64748b; margin: 10px 0 0 0; font-size: 12px;">
                Thanks for choosing KIIT Saathi! 💙
              </p>
            </div>
          </div>
        </div>
      `
    });

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

      // Send notification to relevant helpers
      for (const helper of relevantHelpers.slice(0, 3)) { // Max 3 notifications
        if (helper.email) {
          await resend.emails.send({
            from: 'KIIT Saathi <helpers@kiitsaathi.com>',
            to: [helper.email],
            subject: '🆕 New Assignment Available - KIIT Saathi',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563eb;">New Assignment Request</h2>
                <p>Hi ${helper.name},</p>
                <p>A new assignment request matching your expertise is available:</p>
                <ul>
                  <li><strong>Subject:</strong> ${requestData.branch}</li>
                  <li><strong>Pages:</strong> ${requestData.pages}</li>
                  <li><strong>Deadline:</strong> ${new Date(requestData.deadline).toLocaleDateString()}</li>
                  <li><strong>Delivery:</strong> ${requestData.deliveryMethod === 'hostel_delivery' ? 'Hostel Delivery' : 'Pickup'}</li>
                </ul>
                <p>Login to your helper dashboard to view details and accept this assignment.</p>
                <p style="color: #64748b; font-size: 14px;">First come, first served basis!</p>
              </div>
            `
          });
        }
      }
    }

    console.log('Assignment notification emails sent successfully');

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
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  jobId: string;
  shopkeeperEmail: string;
  fileName: string;
  fileUrl: string;
  customerName: string;
  customerContact: string;
  printDetails: {
    copies: number;
    printType: string;
    paperSize: string;
    bindingOption?: string;
    deliveryLocation: string;
    additionalNotes?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      jobId, 
      shopkeeperEmail, 
      fileName, 
      fileUrl, 
      customerName, 
      customerContact, 
      printDetails 
    }: EmailRequest = await req.json();

    console.log(`Sending print job email for job ${jobId} to ${shopkeeperEmail}`);

    const emailResponse = await resend.emails.send({
      from: "KIIT Saathi Print Service <printservice@kiitsaathi.com>",
      to: [shopkeeperEmail],
      subject: `New Print Job - ${fileName}`,
      html: `
        <h1>🖨️ New Print Job Request</h1>
        <p><strong>Job ID:</strong> ${jobId}</p>
        
        <h2>📄 File Details</h2>
        <p><strong>File Name:</strong> ${fileName}</p>
        <p><strong>Download Link:</strong> <a href="${fileUrl}" target="_blank">Download PDF</a></p>
        
        <h2>👤 Customer Details</h2>
        <p><strong>Name:</strong> ${customerName}</p>
        <p><strong>Contact:</strong> ${customerContact}</p>
        
        <h2>🖨️ Print Specifications</h2>
        <ul>
          <li><strong>Copies:</strong> ${printDetails.copies}</li>
          <li><strong>Print Type:</strong> ${printDetails.printType === 'black_white' ? 'Black & White' : 'Color'}</li>
          <li><strong>Paper Size:</strong> ${printDetails.paperSize}</li>
          ${printDetails.bindingOption ? `<li><strong>Binding:</strong> ${printDetails.bindingOption}</li>` : ''}
          <li><strong>Delivery Location:</strong> ${printDetails.deliveryLocation}</li>
          ${printDetails.additionalNotes ? `<li><strong>Notes:</strong> ${printDetails.additionalNotes}</li>` : ''}
        </ul>
        
        <div style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3>📋 Next Steps</h3>
          <ol>
            <li>Download and print the file as per specifications</li>
            <li>Contact customer at ${customerContact} when ready</li>
            <li>Arrange delivery/pickup at ${printDetails.deliveryLocation}</li>
          </ol>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 24px;">
          This is an automated message from KIIT Saathi Print Service.
        </p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending print job email:", error);
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
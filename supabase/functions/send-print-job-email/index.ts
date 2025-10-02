import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Email functionality temporarily disabled to fix build errors
// const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    console.log(`Print job notification would be sent for job ${jobId} to ${shopkeeperEmail}`);
    console.log("Email functionality temporarily disabled");

    console.log("Print job email processing completed");

    return new Response(JSON.stringify({ success: true, message: "Email functionality temporarily disabled" }), {
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
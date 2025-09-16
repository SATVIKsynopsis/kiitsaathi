import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppRequest {
  jobId: string;
  whatsappNumber: string;
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
      whatsappNumber, 
      fileName, 
      fileUrl, 
      customerName, 
      customerContact, 
      printDetails 
    }: WhatsAppRequest = await req.json();

    console.log(`Sending WhatsApp message for job ${jobId} to ${whatsappNumber}`);

    // Create a formatted message
    const message = `🖨️ *New Print Job Request*

📋 *Job ID:* ${jobId}
📄 *File:* ${fileName}
🔗 *Download:* ${fileUrl}

👤 *Customer Details:*
• Name: ${customerName}
• Contact: ${customerContact}

🖨️ *Print Specifications:*
• Copies: ${printDetails.copies}
• Type: ${printDetails.printType === 'black_white' ? 'Black & White' : 'Color'}
• Paper: ${printDetails.paperSize}
${printDetails.bindingOption ? `• Binding: ${printDetails.bindingOption}` : ''}
• Delivery: ${printDetails.deliveryLocation}
${printDetails.additionalNotes ? `• Notes: ${printDetails.additionalNotes}` : ''}

📋 *Next Steps:*
1. Download and print the file
2. Contact customer when ready: ${customerContact}
3. Arrange delivery/pickup

_Automated message from KIIT Saathi Print Service_`;

    // Encode message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;

    // In a real implementation, you would integrate with WhatsApp Business API
    // For now, we'll return the WhatsApp URL that can be opened
    console.log("WhatsApp message prepared successfully");

    return new Response(JSON.stringify({ 
      success: true, 
      whatsappUrl,
      message: "WhatsApp link generated successfully. Open the link to send the message."
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error preparing WhatsApp message:", error);
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
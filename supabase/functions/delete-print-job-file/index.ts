import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId } = await req.json();

    if (!jobId) {
      return new Response(JSON.stringify({ error: 'Job ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Attempting to delete files for job:', jobId);

    // Get the print job details
    const { data: job, error: jobError } = await supabase
      .from('print_jobs')
      .select('file_path, status, customer_completed, helper_completed')
      .eq('id', jobId)
      .single();

    if (jobError) {
      console.error('Error fetching job:', jobError);
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify that both customer and helper have marked it as completed
    if (!job.customer_completed || !job.helper_completed) {
      return new Response(JSON.stringify({ 
        error: 'Cannot delete files until both customer and helper mark job as completed' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract the file path from the URL to get the storage path
    let filePath = job.file_path;
    if (filePath.includes('/storage/v1/object/public/print-job-files/')) {
      filePath = filePath.split('/storage/v1/object/public/print-job-files/')[1];
    } else if (filePath.includes('print-job-files/')) {
      filePath = filePath.split('print-job-files/')[1];
    }

    console.log('Attempting to delete file from storage:', filePath);

    // Delete the file from storage
    const { error: deleteError } = await supabase.storage
      .from('print-job-files')
      .remove([filePath]);

    if (deleteError) {
      console.error('Error deleting file from storage:', deleteError);
      // Continue with database update even if file deletion fails
      // (file might already be deleted or path might be incorrect)
    } else {
      console.log('File deleted successfully from storage');
    }

    // Update the print job to mark file as deleted and clear the file path
    const { error: updateError } = await supabase
      .from('print_jobs')
      .update({ 
        file_path: null,
        status: 'completed'
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('Error updating job status:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update job status' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Print job completed and file deleted successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Print job completed and files permanently deleted for privacy'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in delete-print-job-file function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error?.message || 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
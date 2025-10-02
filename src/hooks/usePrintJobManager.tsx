import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export interface PrintJob {
  id: string;
  file_name: string;
  file_url: string;
  file_storage_path?: string;
  file_size: number;
  page_count: number;
  copies: number;
  print_type: string;
  paper_size: string;
  binding_option?: string;
  delivery_location: string;
  delivery_time?: string;
  delivery_type?: string;
  delivery_fee?: number;
  additional_notes?: string;
  student_name: string;
  student_contact: string;
  total_cost: number;
  printing_cost: number;
  service_fee: number;
  helper_fee: number;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  helper_id?: string;
  privacy_acknowledged?: boolean;
  accepted_at?: string;
  printed_at?: string;
  delivered_at?: string;
}

export function usePrintJobManager() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const validateFile = (file: File): boolean => {
    console.log('Validating file:', { name: file.name, size: file.size, type: file.type });
    
    // Check file type
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF files are allowed');
      return false;
    }
    
    // Check file size (20MB limit)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 20MB');
      return false;
    }
    
    return true;
  };

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    if (!user) {
      console.error('Upload failed: No user logged in');
      toast.error('You must be logged in to upload files');
      return null;
    }

    if (!validateFile(file)) {
      return null;
    }

    try {
      console.log('Starting file upload for user:', user.id);
      
      const fileExt = file.name.split('.').pop() || 'pdf';
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      console.log('Upload path:', fileName);
      
      const { data, error: uploadError } = await supabase.storage
        .from('print-job-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      console.log('File uploaded successfully:', data.path);
      return data.path;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
      return null;
    }
  }, [user]);

  const createPrintJob = useCallback(async (jobData: Partial<PrintJob>, file: File): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to create print jobs');
      return false;
    }

    console.log('Creating print job with data:', jobData);

    setIsLoading(true);
    try {
      // Validate required fields
      if (!jobData.student_name || !jobData.student_contact || !jobData.delivery_location) {
        throw new Error('Please fill in all required fields');
      }

      // Upload file first
      console.log('Uploading file...');
      const filePath = await uploadFile(file);
      if (!filePath) {
        console.error('File upload failed');
        return false;
      }

      console.log('File uploaded, creating database record...');

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('print-job-files')
        .getPublicUrl(filePath);

      // Create print job record with all required fields
      const insertData = {
        user_id: user.id, // Required and now NOT NULL
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_storage_path: filePath,
        file_size: file.size,
        page_count: jobData.page_count || 1,
        copies: jobData.copies || 1,
        print_type: jobData.print_type || 'black_white',
        paper_size: jobData.paper_size || 'A4',
        binding_option: jobData.binding_option || null,
        delivery_location: jobData.delivery_location,
        delivery_time: jobData.delivery_time || null,
        delivery_type: jobData.delivery_type || 'pickup',
        delivery_fee: jobData.delivery_fee || 0,
        additional_notes: jobData.additional_notes || null,
        student_name: jobData.student_name,
        student_contact: jobData.student_contact,
        total_cost: jobData.total_cost || 0,
        printing_cost: jobData.printing_cost || 0,
        service_fee: jobData.service_fee || 0,
        helper_fee: jobData.helper_fee || 0,
        privacy_acknowledged: true, // Always true since checked in UI
        status: 'pending'
      };

      console.log('Inserting job data:', insertData);

      const { data: insertedData, error } = await supabase
        .from('print_jobs')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        // Try to clean up uploaded file
        try {
          await supabase.storage.from('print-job-files').remove([filePath]);
        } catch (cleanupError) {
          console.warn('Failed to cleanup uploaded file:', cleanupError);
        }
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Print job created successfully:', insertedData);
      toast.success('✅ Print job submitted successfully! You\'ll be notified when a helper accepts it.');
      return true;
    } catch (error: any) {
      console.error('Error creating print job:', error);
      toast.error(`Submission failed: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, uploadFile]);

  const acceptJob = useCallback(async (jobId: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to accept jobs');
      return false;
    }

    setIsLoading(true);
    try {
      console.log('Accepting job:', jobId, 'for user:', user.id);
      
      // Check if helper already has 3 active jobs (additional client-side check)
      const { data: helperJobs, error: checkError } = await supabase
        .from('print_jobs')
        .select('id')
        .eq('helper_id', user.id)
        .not('status', 'in', '(completed,cancelled)');

      if (checkError) {
        throw new Error(checkError.message);
      }

      if (helperJobs && helperJobs.length >= 3) {
        toast.error('You cannot accept more than 3 jobs at a time. Please complete some existing jobs first.');
        return false;
      }
      
      const { error } = await supabase
        .from('print_jobs')
        .update({ 
          status: 'accepted', 
          helper_id: user.id,
          accepted_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .eq('status', 'pending'); // Prevent race conditions

      if (error) {
        console.error('Accept job error:', error);
        if (error.message.includes('cannot accept more than 3 active jobs')) {
          toast.error('You cannot accept more than 3 jobs at a time. Please complete some existing jobs first.');
        } else {
          throw new Error(error.message);
        }
        return false;
      }

      toast.success('Job accepted! You can now download the file and start printing.');
      return true;
    } catch (error: any) {
      console.error('Error accepting job:', error);
      toast.error('Failed to accept job. It may have been accepted by another helper.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateJobStatus = useCallback(async (jobId: string, status: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to update jobs');
      return false;
    }

    setIsLoading(true);
    try {
      console.log('Updating job status:', jobId, 'to:', status);
      
      const updates: any = { status };
      
      if (status === 'printing') {
        updates.printed_at = new Date().toISOString();
      } else if (status === 'delivered' || status === 'ready_for_pickup') {
        updates.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('print_jobs')
        .update(updates)
        .eq('id', jobId)
        .eq('helper_id', user.id);

      if (error) {
        console.error('Update status error:', error);
        throw new Error(error.message);
      }

      const statusMessages: Record<string, string> = {
        printing: 'Job marked as printing',
        ready_for_pickup: 'Job marked as ready for pickup',
        delivered: 'Job marked as delivered',
        completed: 'Job completed successfully!'
      };

      toast.success(statusMessages[status] || 'Job status updated');
      return true;
    } catch (error: any) {
      console.error('Error updating job status:', error);
      toast.error(`Failed to update status: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const downloadFile = useCallback(async (filePath: string, fileName: string): Promise<void> => {
    if (!user) {
      toast.error('You must be logged in to download files');
      return;
    }

    try {
      console.log('Downloading file:', filePath);
      
      const { data, error } = await supabase.storage
        .from('print-job-files')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        console.error('Download URL error:', error);
        throw new Error(error.message);
      }

      // Create download link
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('File download started');
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(`Download failed: ${error.message}`);
    }
  }, [user]);

  const sendToShopkeeper = useCallback(async (
    jobId: string, 
    method: 'email' | 'whatsapp'
  ): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to send files');
      return false;
    }

    setIsLoading(true);
    try {
      console.log('Sending to shopkeeper:', jobId, 'via:', method);
      
      // Get job details
      const { data: job, error: jobError } = await supabase
        .from('print_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError || !job) {
        throw new Error('Job not found');
      }

      // Get shopkeeper contact info
      const { data: shopkeeper, error: shopkeeperError } = await supabase
        .from('shopkeeper_contacts')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (shopkeeperError || !shopkeeper) {
        throw new Error('No active shopkeeper found');
      }

      // Get signed URL for file
      const { data: urlData, error: urlError } = await supabase.storage
        .from('print-job-files')
        .createSignedUrl(job.file_storage_path, 86400); // 24 hour expiry

      if (urlError) throw new Error(urlError.message);

      const payload = {
        jobId: job.id,
        fileName: job.file_name,
        fileUrl: urlData.signedUrl,
        customerName: job.student_name,
        customerContact: job.student_contact,
        printDetails: {
          copies: job.copies,
          printType: job.print_type,
          paperSize: job.paper_size,
          bindingOption: job.binding_option,
          deliveryLocation: job.delivery_location,
          additionalNotes: job.additional_notes
        }
      };

      if (method === 'email' && shopkeeper.email) {
        const { error } = await supabase.functions.invoke('send-print-job-email', {
          body: { ...payload, shopkeeperEmail: shopkeeper.email }
        });
        if (error) throw new Error(error.message);
        toast.success('Email sent to shopkeeper successfully! 📧');
      } else if (method === 'whatsapp' && shopkeeper.whatsapp) {
        const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
          body: { ...payload, whatsappNumber: shopkeeper.whatsapp }
        });
        if (error) throw new Error(error.message);
        
        if (data.whatsappUrl) {
          // Open WhatsApp link
          window.open(data.whatsappUrl, '_blank');
          toast.success('WhatsApp message prepared! Check the new tab. 📱');
        }
      } else {
        throw new Error(`${method} not available for shopkeeper`);
      }

      return true;
    } catch (error: any) {
      console.error(`Error sending to shopkeeper via ${method}:`, error);
      toast.error(`Failed to send via ${method}: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const notifyStatusUpdate = useCallback(async (
    jobId: string,
    status: string,
    helperName?: string
  ): Promise<void> => {
    try {
      console.log('Sending notification for job:', jobId, 'status:', status);
      await supabase.functions.invoke('notify-print-job-update', {
        body: { jobId, status, helperName }
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      // Don't show error to user as this is background process
    }
  }, []);

  const fetchJobs = useCallback(async (filters?: { status?: string; helper_id?: string }): Promise<any[]> => {
    try {
      console.log('Fetching jobs with filters:', filters);
      
      let query = supabase.from('print_jobs').select('*');
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.helper_id) {
        query = query.eq('helper_id', filters.helper_id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Fetch jobs error:', error);
        throw new Error(error.message);
      }
      
      console.log('Fetched jobs:', data?.length || 0);
      return data || [];
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      toast.error(`Failed to load jobs: ${error.message}`);
      return [];
    }
  }, []);

  const markJobCompleted = useCallback(async (jobId: string, userType: 'customer' | 'helper'): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to mark jobs as completed');
      return false;
    }

    setIsLoading(true);
    try {
      console.log('Marking job completed:', jobId, 'by:', userType);
      
      const field = userType === 'customer' ? 'customer_completed' : 'helper_completed';
      
      const { error } = await supabase
        .from('print_jobs')
        .update({ [field]: true })
        .eq('id', jobId);

      if (error) {
        throw new Error(error.message);
      }

      // Check if both parties have marked as completed
      const { data: job, error: fetchError } = await supabase
        .from('print_jobs')
        .select('customer_completed, helper_completed, file_storage_path')
        .eq('id', jobId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (job.customer_completed && job.helper_completed) {
        // Both completed - finalize the job and delete file
        const { error: finalError } = await supabase
          .from('print_jobs')
          .update({ 
            status: 'completed',
            file_deleted_at: new Date().toISOString()
          })
          .eq('id', jobId);

        if (finalError) {
          throw new Error(finalError.message);
        }

        // Delete the file from storage
        if (job.file_storage_path) {
          const { error: deleteError } = await supabase.storage
            .from('print-job-files')
            .remove([job.file_storage_path]);

          if (deleteError) {
            console.warn('Failed to delete file from storage:', deleteError);
          }
        }

        toast.success('🎉 Job completed! File has been permanently deleted for privacy.');
      } else {
        const message = userType === 'customer' 
          ? 'Marked as completed! Waiting for helper confirmation.'
          : 'Marked as completed! Waiting for customer confirmation.';
        toast.success(message);
      }

      return true;
    } catch (error: any) {
      console.error('Error marking job completed:', error);
      toast.error(`Failed to mark as completed: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    createPrintJob,
    acceptJob,
    updateJobStatus,
    downloadFile,
    sendToShopkeeper,
    notifyStatusUpdate,
    fetchJobs,
    markJobCompleted,
    isLoading
  };
}

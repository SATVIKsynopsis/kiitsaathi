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
  user_id?: string;
  helper_id?: string;
  privacy_acknowledged?: boolean;
  accepted_at?: string;
  printed_at?: string;
  delivered_at?: string;
}

export function usePrintJobManager() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to upload files');
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('print-job-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;
      
      return fileName;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      return null;
    }
  }, [user]);

  const createPrintJob = useCallback(async (jobData: Partial<PrintJob>, file: File): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to create print jobs');
      return false;
    }

    setIsLoading(true);
    try {
      // Upload file first
      const filePath = await uploadFile(file);
      if (!filePath) {
        return false;
      }

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('print-job-files')
        .getPublicUrl(filePath);

      // Create print job record with all required fields
      const insertData = {
        user_id: user.id, // Required for RLS policy
        file_name: jobData.file_name || file.name,
        file_url: urlData.publicUrl,
        file_storage_path: filePath, // Store the storage path for helper access
        file_size: jobData.file_size || file.size,
        page_count: jobData.page_count || 1,
        copies: jobData.copies || 1,
        print_type: jobData.print_type || 'black_white',
        paper_size: jobData.paper_size || 'A4',
        binding_option: jobData.binding_option,
        delivery_location: jobData.delivery_location || '',
        delivery_time: jobData.delivery_time,
        delivery_type: jobData.delivery_type || 'pickup',
        delivery_fee: jobData.delivery_fee || 0,
        additional_notes: jobData.additional_notes,
        student_name: jobData.student_name || '',
        student_contact: jobData.student_contact || '',
        total_cost: jobData.total_cost || 0,
        printing_cost: jobData.printing_cost || 0,
        service_fee: jobData.service_fee || 0,
        helper_fee: jobData.helper_fee || 0,
        privacy_acknowledged: jobData.privacy_acknowledged || false
      };

      const { error } = await supabase
        .from('print_jobs')
        .insert(insertData);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      toast.success('🎉 Print job submitted! You\'ll be notified when a helper accepts it.');
      return true;
    } catch (error) {
      console.error('Error creating print job:', error);
      toast.error(`Failed to submit print job: ${error.message || 'Please try again.'}`);
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
      const { error } = await supabase
        .from('print_jobs')
        .update({ 
          status: 'accepted', 
          helper_id: user.id,
          accepted_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .eq('status', 'pending'); // Prevent race conditions

      if (error) throw error;

      toast.success('Job accepted! You can now download the file and start printing.');
      return true;
    } catch (error) {
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

      if (error) throw error;

      const statusMessages = {
        printing: 'Job marked as printing',
        ready_for_pickup: 'Job marked as ready for pickup',
        delivered: 'Job marked as delivered',
        completed: 'Job completed successfully!'
      };

      toast.success(statusMessages[status] || 'Job status updated');
      return true;
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
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
      const { data, error } = await supabase.storage
        .from('print-job-files')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;

      // Create download link
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('File download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
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

      if (urlError) throw urlError;

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
        if (error) throw error;
        toast.success('Email sent to shopkeeper successfully! 📧');
      } else if (method === 'whatsapp' && shopkeeper.whatsapp) {
        const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
          body: { ...payload, whatsappNumber: shopkeeper.whatsapp }
        });
        if (error) throw error;
        
        if (data.whatsappUrl) {
          // Open WhatsApp link
          window.open(data.whatsappUrl, '_blank');
          toast.success('WhatsApp message prepared! Check the new tab. 📱');
        }
      } else {
        throw new Error(`${method} not available for shopkeeper`);
      }

      return true;
    } catch (error) {
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
      let query = supabase.from('print_jobs').select('*');
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.helper_id) {
        query = query.eq('helper_id', filters.helper_id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  }, []);

  return {
    createPrintJob,
    acceptJob,
    updateJobStatus,
    downloadFile,
    sendToShopkeeper,
    notifyStatusUpdate,
    fetchJobs,
    isLoading
  };
}
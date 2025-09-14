-- Fix storage bucket policies for print job files
CREATE POLICY "Users can upload print job files"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'print-job-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Helpers can access assigned job files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'print-job-files' 
  AND (
    -- File owner can access
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- Helper who accepted the job can access
    EXISTS (
      SELECT 1 FROM print_jobs 
      WHERE file_storage_path = name 
      AND helper_id = auth.uid()
      AND status IN ('accepted', 'printing', 'ready_for_pickup', 'delivered', 'completed')
    )
    OR
    -- Admin can access all
    get_current_user_role() = 'admin'
  )
);

-- Add helper notification preferences table
CREATE TABLE public.helper_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  whatsapp_notifications BOOLEAN DEFAULT true,
  shopkeeper_email TEXT,
  shopkeeper_whatsapp TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.helper_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for helper preferences
CREATE POLICY "Users can manage their own preferences"
ON public.helper_preferences FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add shopkeeper integration table
CREATE TABLE public.shopkeeper_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(email),
  UNIQUE(whatsapp)
);

-- Insert default shopkeeper
INSERT INTO public.shopkeeper_contacts (name, email, whatsapp, location) VALUES
('KIIT Print Shop', 'printshop@kiit.ac.in', '+919876543210', 'Campus 1');

-- Enable RLS for shopkeeper contacts
ALTER TABLE public.shopkeeper_contacts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view shopkeeper contacts
CREATE POLICY "Authenticated users can view shopkeeper contacts"
ON public.shopkeeper_contacts FOR SELECT
TO authenticated
USING (is_active = true);

-- Add print job notifications table
CREATE TABLE public.print_job_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES print_jobs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL, -- 'job_accepted', 'job_printed', 'job_delivered', etc.
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.print_job_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.print_job_notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.print_job_notifications FOR INSERT
WITH CHECK (true);

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_print_job_notification(
  p_job_id UUID,
  p_user_id UUID,
  p_type TEXT,
  p_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.print_job_notifications (job_id, user_id, notification_type, message)
  VALUES (p_job_id, p_user_id, p_type, p_message)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;
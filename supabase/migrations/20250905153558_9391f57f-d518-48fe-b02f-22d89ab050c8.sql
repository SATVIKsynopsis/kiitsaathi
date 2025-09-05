-- Create contacts table for contact form submissions
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create contact submissions" 
ON public.contacts 
FOR INSERT 
WITH CHECK (true); -- Allow anyone to submit contact forms

CREATE POLICY "Users can view their own contact submissions" 
ON public.contacts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all contact submissions" 
ON public.contacts 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can update contact submissions" 
ON public.contacts 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

-- Add trigger for updating timestamps
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
-- Create service visibility configuration table
CREATE TABLE IF NOT EXISTS public.service_visibility (
  service_id text PRIMARY KEY,
  visible boolean NOT NULL DEFAULT true,
  replaced_text text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_visibility ENABLE ROW LEVEL SECURITY;

-- Create policies - Only allow select for everyone, no public writes
CREATE POLICY "Everyone can view service visibility" 
ON public.service_visibility 
FOR SELECT 
USING (true);

-- Create admin action logs table for audit trail
CREATE TABLE IF NOT EXISTS public.admin_action_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action text NOT NULL,
  user_id uuid NULL,
  command text NULL,
  details jsonb NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on logs
ALTER TABLE public.admin_action_logs ENABLE ROW LEVEL SECURITY;

-- Only allow admins to view logs
CREATE POLICY "Admins can view action logs" 
ON public.admin_action_logs 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- Insert service visibility records for all services
INSERT INTO public.service_visibility (service_id, visible) VALUES
  ('kiit-saathi-ai-assistant', true),
  ('study-material', true),
  ('lost-and-found-portal', true),
  ('campus-map', true),
  ('kiit-societies-fests-sports', true),
  ('resume-saathi', true),
  ('split-saathi', true),
  ('sgpa-cgpa-calculator', true),
  ('printout-on-demand', true),
  ('senior-connect', true),
  ('handwritten-assignments', true),
  ('tutoring-counselling', true),
  ('campus-tour-booking', true),
  ('carton-packing-hostel-transfers', true),
  ('book-buyback-resale', true),
  ('kiit-saathi-celebrations', true),
  ('kiit-saathi-meetups', true),
  ('food-micro-essentials-delivery', true)
ON CONFLICT (service_id) DO NOTHING;
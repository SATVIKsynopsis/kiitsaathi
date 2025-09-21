-- ================================
-- Tables for Printout on Demand service
-- ================================

-- Table for print job requests
CREATE TABLE IF NOT EXISTS public.print_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid(),                -- links job to logged-in user
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  page_count INTEGER NOT NULL,
  copies INTEGER NOT NULL DEFAULT 1,
  print_type TEXT NOT NULL CHECK (print_type IN ('black_white', 'color')),
  paper_size TEXT NOT NULL DEFAULT 'A4',
  binding_option TEXT,
  delivery_location TEXT NOT NULL,
  delivery_time TEXT,
  additional_notes TEXT,
  student_name TEXT NOT NULL,
  student_contact TEXT NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  printing_cost DECIMAL(10,2) NOT NULL,
  service_fee DECIMAL(10,2) NOT NULL,
  helper_fee DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'printing', 'delivered', 'cancelled')),
  helper_id UUID,
  accepted_at TIMESTAMP WITH TIME ZONE,
  printed_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  secure_download_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  privacy_acknowledged BOOLEAN NOT NULL DEFAULT false,   -- must be true to insert
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for helper profiles and earnings
CREATE TABLE IF NOT EXISTS public.print_helpers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  email TEXT,
  total_jobs INTEGER NOT NULL DEFAULT 0,
  total_earnings DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ================================
-- Enable Row Level Security (RLS)
-- ================================
ALTER TABLE public.print_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_helpers ENABLE ROW LEVEL SECURITY;

-- ================================
-- Drop old policies if they exist
-- ================================
DROP POLICY IF EXISTS "Allow full access to print_jobs" ON public.print_jobs;
DROP POLICY IF EXISTS "Allow full access to print_helpers" ON public.print_helpers;
DROP POLICY IF EXISTS "Users can create own print jobs" ON public.print_jobs;
DROP POLICY IF EXISTS "Users can view own print jobs" ON public.print_jobs;
DROP POLICY IF EXISTS "Users can update own print jobs" ON public.print_jobs;
DROP POLICY IF EXISTS "Print helpers are publicly accessible" ON public.print_helpers;

-- ================================
-- RLS POLICIES (secured for logged-in users)
-- ================================

-- Insert: only logged-in users can create jobs
CREATE POLICY "Users can create own print jobs"
ON public.print_jobs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Select: users see their own jobs, helpers see assigned jobs
CREATE POLICY "Users can view own print jobs"
ON public.print_jobs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = helper_id);

-- Update: users update their own jobs, helpers update assigned jobs
CREATE POLICY "Users can update own print jobs"
ON public.print_jobs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = helper_id)
WITH CHECK (auth.uid() = user_id OR auth.uid() = helper_id);

-- Delete: users can delete their own jobs
CREATE POLICY "Users can delete own print jobs"
ON public.print_jobs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Helpers table: authenticated users can read
CREATE POLICY "Print helpers are publicly accessible"
ON public.print_helpers
FOR SELECT
TO authenticated
USING (true);

-- ================================
-- Grant privileges to anon/authenticated roles
-- ================================
GRANT ALL ON public.print_jobs TO anon, authenticated;
GRANT ALL ON public.print_helpers TO anon, authenticated;

-- Also grant sequence usage (needed for DEFAULT uuid functions, etc.)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ================================
-- Trigger for updated_at
-- ================================
CREATE OR REPLACE FUNCTION public.update_print_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_print_jobs_updated_at ON public.print_jobs;
CREATE TRIGGER update_print_jobs_updated_at
BEFORE UPDATE ON public.print_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_print_jobs_updated_at();

-- ================================
-- Indexes for better performance
-- ================================
CREATE INDEX IF NOT EXISTS idx_print_jobs_status ON public.print_jobs(status);
CREATE INDEX IF NOT EXISTS idx_print_jobs_helper_id ON public.print_jobs(helper_id);
CREATE INDEX IF NOT EXISTS idx_print_jobs_created_at ON public.print_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_print_helpers_is_active ON public.print_helpers(is_active);
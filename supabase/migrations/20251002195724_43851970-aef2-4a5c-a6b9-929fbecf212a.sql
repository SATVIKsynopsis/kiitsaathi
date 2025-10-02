-- Create ebooks table for E-Books section
CREATE TABLE IF NOT EXISTS public.ebooks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  semester TEXT NOT NULL,
  branch TEXT,
  year TEXT,
  views INTEGER DEFAULT 0,
  uploaded_by TEXT NOT NULL,
  upload_date TEXT,
  pdf_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to view ebooks
CREATE POLICY "Authenticated users can view ebooks"
ON public.ebooks
FOR SELECT
USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to insert ebooks
CREATE POLICY "Authenticated users can upload ebooks"
ON public.ebooks
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Add trigger for updated_at
CREATE TRIGGER update_ebooks_updated_at
  BEFORE UPDATE ON public.ebooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
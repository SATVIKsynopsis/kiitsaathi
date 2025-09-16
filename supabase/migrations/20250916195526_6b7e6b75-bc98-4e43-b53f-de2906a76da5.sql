-- Add DELETE policy for PPTs bucket to allow users to delete their own uploads
CREATE POLICY "Users can delete their own PPT files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'ppts' AND auth.uid() IS NOT NULL);

-- Create pyqs table if it doesn't exist (similar structure to notes and ppts)
CREATE TABLE IF NOT EXISTS public.pyqs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  semester TEXT NOT NULL,
  branch TEXT NOT NULL,
  year TEXT,
  uploaded_by TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  pdf_url TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  rating NUMERIC,
  upload_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on pyqs table
ALTER TABLE public.pyqs ENABLE ROW LEVEL SECURITY;

-- Create policies for pyqs table (same as notes and ppts)
CREATE POLICY "Anyone can view pyqs" 
ON public.pyqs 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can upload pyqs" 
ON public.pyqs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pyqs" 
ON public.pyqs 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at timestamp
CREATE TRIGGER update_pyqs_updated_at
  BEFORE UPDATE ON public.pyqs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
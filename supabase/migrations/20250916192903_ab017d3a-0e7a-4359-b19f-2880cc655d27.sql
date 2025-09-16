-- Create PPTs table for presentations
CREATE TABLE public.ppts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  semester TEXT NOT NULL,
  branch TEXT NOT NULL,
  ppt_url TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  views INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT NULL,
  upload_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on PPTs table
ALTER TABLE public.ppts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for PPTs
CREATE POLICY "Anyone can view ppts" 
ON public.ppts 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can upload ppts" 
ON public.ppts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ppts" 
ON public.ppts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create storage bucket for PPTs
INSERT INTO storage.buckets (id, name, public) VALUES ('ppts', 'ppts', true);

-- Create storage policies for PPTs bucket
CREATE POLICY "PPT files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'ppts');

CREATE POLICY "Authenticated users can upload PPTs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'ppts' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own PPT files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'ppts' AND auth.uid() IS NOT NULL);
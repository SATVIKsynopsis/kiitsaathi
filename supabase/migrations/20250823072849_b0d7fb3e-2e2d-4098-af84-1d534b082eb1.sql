-- Create notes table for study materials
CREATE TABLE public.notes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  semester TEXT NOT NULL,
  branch TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT NULL CHECK (rating >= 0 AND rating <= 5),
  pdf_url TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pyqs table for previous year question papers
CREATE TABLE public.pyqs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  semester TEXT NOT NULL,
  branch TEXT NOT NULL,
  year TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  pdf_url TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pyqs ENABLE ROW LEVEL SECURITY;

-- Create policies for notes table
CREATE POLICY "Anyone can view notes" ON public.notes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.notes FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for pyqs table  
CREATE POLICY "Anyone can view pyqs" ON public.pyqs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload pyqs" ON public.pyqs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pyqs" ON public.pyqs FOR UPDATE USING (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pyqs_updated_at
  BEFORE UPDATE ON public.pyqs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
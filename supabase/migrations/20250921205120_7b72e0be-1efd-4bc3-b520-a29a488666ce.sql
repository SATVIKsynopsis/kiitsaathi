-- Create resumes table for storing user resume data
CREATE TABLE public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  template text not null,
  data jsonb not null,
  ats_score numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create daily download tracking table
CREATE TABLE public.resume_downloads_daily (
  user_id uuid references auth.users(id) on delete cascade,
  day date not null,
  downloads integer default 0,
  primary key(user_id, day)
);

-- Enable RLS on both tables
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_downloads_daily ENABLE ROW LEVEL SECURITY;

-- RLS policies for resumes - users can only access their own data
CREATE POLICY "Users can view own resumes"
ON public.resumes FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes"
ON public.resumes FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes"
ON public.resumes FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes"
ON public.resumes FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- RLS policies for download tracking
CREATE POLICY "Users can view own download stats"
ON public.resume_downloads_daily FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own download stats"
ON public.resume_downloads_daily FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own download stats"
ON public.resume_downloads_daily FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE TRIGGER update_resumes_updated_at
BEFORE UPDATE ON public.resumes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
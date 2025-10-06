-- Create faculty members table
CREATE TABLE IF NOT EXISTS public.faculty_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  linkedin TEXT,
  category TEXT NOT NULL, -- 'contact' or 'faculty'
  department TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.faculty_members ENABLE ROW LEVEL SECURITY;

-- Allow public read access for authenticated users
CREATE POLICY "Anyone can view faculty members"
ON public.faculty_members
FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage faculty members"
ON public.faculty_members
FOR ALL
TO authenticated
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- Create storage bucket for faculty photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('faculty-photos', 'faculty-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for faculty photos
CREATE POLICY "Anyone can view faculty photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'faculty-photos');

CREATE POLICY "Admins can upload faculty photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'faculty-photos' AND
  get_current_user_role() = 'admin'
);

CREATE POLICY "Admins can update faculty photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'faculty-photos' AND get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete faculty photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'faculty-photos' AND get_current_user_role() = 'admin');

-- Update trigger
CREATE TRIGGER update_faculty_members_updated_at
BEFORE UPDATE ON public.faculty_members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
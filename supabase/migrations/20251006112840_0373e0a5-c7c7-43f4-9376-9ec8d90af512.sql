-- Ensure faculty-photos bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('faculty-photos', 'faculty-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access to faculty photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload faculty photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update faculty photos" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete faculty photos" ON storage.objects;

-- Allow public read access to faculty photos
CREATE POLICY "Public read access to faculty photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'faculty-photos');

-- Allow only admin to upload/update faculty photos
CREATE POLICY "Admin can upload faculty photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'faculty-photos' 
  AND auth.jwt() ->> 'email' = 'adityash8997@gmail.com'
);

CREATE POLICY "Admin can update faculty photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'faculty-photos' 
  AND auth.jwt() ->> 'email' = 'adityash8997@gmail.com'
);

CREATE POLICY "Admin can delete faculty photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'faculty-photos' 
  AND auth.jwt() ->> 'email' = 'adityash8997@gmail.com'
);
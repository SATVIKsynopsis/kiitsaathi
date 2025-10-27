-- Make lost-and-found-images bucket public
-- This allows images to be displayed without authentication

-- First, create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('lost-and-found-images', 'lost-and-found-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload lost and found images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view lost and found images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;

-- Create policy to allow anyone to view images in lost-and-found-images bucket
CREATE POLICY "Anyone can view lost and found images"
ON storage.objects FOR SELECT
USING (bucket_id = 'lost-and-found-images');

-- Create policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload lost and found images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lost-and-found-images' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow users to update their own images
CREATE POLICY "Users can update their own lost and found images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'lost-and-found-images'
  AND auth.role() = 'authenticated'
);

-- Create policy to allow users to delete their own images
CREATE POLICY "Users can delete their own lost and found images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lost-and-found-images'
  AND auth.role() = 'authenticated'
);

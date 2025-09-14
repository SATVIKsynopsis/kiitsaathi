-- Drop conflicting storage policies and create clean ones
DROP POLICY IF EXISTS "Authenticated users can upload print files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload print job files" ON storage.objects;
DROP POLICY IF EXISTS "Only assigned helpers can download files" ON storage.objects;

-- Create clean, simple storage policies for print job files
CREATE POLICY "Users can upload their own print job files"
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'print-job-files' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can access their own print job files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'print-job-files' 
  AND (
    -- File owner can access
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- Helper who accepted the job can access
    EXISTS (
      SELECT 1 FROM print_jobs 
      WHERE file_storage_path = name 
      AND helper_id = auth.uid()
      AND status IN ('accepted', 'printing', 'ready_for_pickup', 'delivered', 'completed')
    )
  )
);

-- Make user_id NOT NULL in print_jobs for better RLS
ALTER TABLE print_jobs ALTER COLUMN user_id SET NOT NULL;
-- Clean up placeholder/example image URLs from lost_and_found_items table
-- This removes example.com URLs and other placeholders

-- Option 1: Set placeholder URLs to NULL (recommended)
UPDATE public.lost_and_found_items
SET image_url = NULL
WHERE 
  image_url LIKE '%example.com%'
  OR image_url LIKE '%placeholder%'
  OR image_url = '';

-- Option 2: If you want to delete items with placeholder images entirely (commented out)
-- DELETE FROM public.lost_and_found_items
-- WHERE 
--   image_url LIKE '%example.com%'
--   OR image_url LIKE '%placeholder%'
--   OR image_url = '';

-- Update lost_found_requests table as well
UPDATE public.lost_found_requests
SET image_url = NULL
WHERE 
  image_url LIKE '%example.com%'
  OR image_url LIKE '%placeholder%'
  OR image_url = '';

-- Log the cleanup
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Cleaned up % placeholder image URLs', updated_count;
END $$;

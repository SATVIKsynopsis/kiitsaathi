-- This script helps identify and fix items that might have images in storage
-- but have NULL image_url in the database

-- First, let's see what we have in storage (run this in Supabase Dashboard > Storage)
-- SELECT name, created_at FROM storage.objects WHERE bucket_id = 'lost-and-found-images' ORDER BY created_at DESC;

-- If you want to manually set image URLs for specific items, use this template:
-- UPDATE public.lost_and_found_items
-- SET image_url = 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/lost-and-found-images/FILENAME.jpg'
-- WHERE id = 'ITEM_UUID';

-- Example: If you have a file named "1234567890.jpg" in storage and want to link it to an item
-- UPDATE public.lost_and_found_items
-- SET image_url = (
--   SELECT 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/lost-and-found-images/' || name
--   FROM storage.objects 
--   WHERE bucket_id = 'lost-and-found-images' 
--   AND name = '1234567890.jpg'
-- )
-- WHERE title = 'KIIT ID Card';  -- or use WHERE id = 'uuid'

-- For testing: Add some dummy image URLs to existing items (ONLY FOR TESTING)
-- DO NOT RUN THIS ON PRODUCTION DATA
/*
UPDATE public.lost_and_found_items
SET image_url = 'https://images.unsplash.com/photo-1585076799133-c2b8c6a7d1e7?w=400'
WHERE item_type = 'lost' AND image_url IS NULL
LIMIT 1;

UPDATE public.lost_and_found_items
SET image_url = 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400'
WHERE item_type = 'found' AND image_url IS NULL
LIMIT 1;
*/

-- To see items with NULL images:
-- SELECT id, title, item_type, created_at, image_url FROM public.lost_and_found_items WHERE image_url IS NULL;

COMMENT ON TABLE public.lost_and_found_items IS 'Lost and Found items. Use storage bucket lost-and-found-images for images.';

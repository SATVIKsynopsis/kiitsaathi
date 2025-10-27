-- Add sample/placeholder images to Lost & Found items for testing
-- This uses Unsplash free images that match the item types

-- Update KIIT ID Card with an ID card image
UPDATE public.lost_and_found_items
SET image_url = 'https://images.unsplash.com/photo-1591378612550-c38a01c36c52?w=800&q=80'
WHERE title = 'KIIT ID Card' AND image_url IS NULL;

-- Update Sony earphones items with earphone images
UPDATE public.lost_and_found_items
SET image_url = 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80'
WHERE title LIKE '%Sony WF-C510%' AND image_url IS NULL;

-- For any remaining items without images, add generic lost & found images
UPDATE public.lost_and_found_items
SET image_url = CASE 
  WHEN category = 'Electronics' THEN 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80'
  WHEN category = 'ID Card' THEN 'https://images.unsplash.com/photo-1591378612550-c38a01c36c52?w=800&q=80'
  WHEN category = 'Books' THEN 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80'
  WHEN category = 'Accessories' THEN 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80'
  ELSE 'https://images.unsplash.com/photo-1553835973-dec43bfddbeb?w=800&q=80'
END
WHERE image_url IS NULL;

-- Verify the updates
SELECT 
  id,
  title,
  category,
  item_type,
  CASE 
    WHEN image_url IS NOT NULL THEN '✅ Has Image'
    ELSE '❌ No Image'
  END as image_status,
  LEFT(image_url, 50) as image_url_preview
FROM public.lost_and_found_items
ORDER BY created_at DESC;

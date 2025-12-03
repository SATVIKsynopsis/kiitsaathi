-- Add photos column to shop_menu_items table
ALTER TABLE public.shop_menu_items 
ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';

-- Add comment to describe the photos column
COMMENT ON COLUMN public.shop_menu_items.photos IS 'Array of photo URLs for the menu item';
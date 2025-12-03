-- Add ALL missing columns to shops table for admin editing
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS location varchar(255),
ADD COLUMN IF NOT EXISTS contact_number varchar(20),
ADD COLUMN IF NOT EXISTS category varchar(100),
ADD COLUMN IF NOT EXISTS opening_hours time,
ADD COLUMN IF NOT EXISTS closing_hours time,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS photos text[], -- Array of photo URLs
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- Update existing rows to have default updated_at
UPDATE public.shops 
SET updated_at = timezone('utc'::text, now())
WHERE updated_at IS NULL;

-- Create index for category for better performance
CREATE INDEX IF NOT EXISTS shops_category_idx ON public.shops(category);

-- Add some sample categories to existing shops
UPDATE public.shops 
SET category = 'restaurant'
WHERE category IS NULL AND (name ILIKE '%restaurant%' OR name ILIKE '%food%');

UPDATE public.shops 
SET category = 'cafe' 
WHERE category IS NULL AND (name ILIKE '%cafe%' OR name ILIKE '%coffee%');

UPDATE public.shops 
SET category = 'snacks'
WHERE category IS NULL AND (name ILIKE '%chaat%' OR name ILIKE '%corner%' OR name ILIKE '%snack%');

UPDATE public.shops 
SET category = 'ice-cream'
WHERE category IS NULL AND (name ILIKE '%ice%' OR name ILIKE '%cream%' OR name ILIKE '%dessert%');

UPDATE public.shops 
SET category = 'other'
WHERE category IS NULL;
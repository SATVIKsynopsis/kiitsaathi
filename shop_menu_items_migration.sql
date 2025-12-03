-- Create shop_menu_items table
CREATE TABLE IF NOT EXISTS public.shop_menu_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  category varchar(100),
  is_veg boolean DEFAULT false,
  is_available boolean DEFAULT true,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS shop_menu_items_shop_id_idx ON public.shop_menu_items(shop_id);
CREATE INDEX IF NOT EXISTS shop_menu_items_category_idx ON public.shop_menu_items(category);
CREATE INDEX IF NOT EXISTS shop_menu_items_available_idx ON public.shop_menu_items(is_available);

-- Enable RLS (Row Level Security)
ALTER TABLE public.shop_menu_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to menu items" ON public.shop_menu_items
  FOR SELECT USING (is_available = true);

-- Create policies for authenticated users to manage their shop's menu items
CREATE POLICY "Allow shop owners to manage their menu items" ON public.shop_menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shop_staff 
      WHERE shop_staff.shop_id = shop_menu_items.shop_id 
      AND shop_staff.user_id = auth.uid()
    )
  );

-- Create policies for admin users to manage all menu items
CREATE POLICY "Allow admin users to manage all menu items" ON public.shop_menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Insert sample menu items for the first shop (optional - you can remove this part)
INSERT INTO public.shop_menu_items (shop_id, name, description, price, category, is_veg, is_available)
SELECT 
  shops.id,
  'Pani Puri',
  'Crispy puris filled with spicy tangy water, chutneys and stuffing',
  30.00,
  'Chaat',
  true,
  true
FROM public.shops 
WHERE shops.name ILIKE '%chaat%' OR shops.name ILIKE '%corner%'
LIMIT 1;

INSERT INTO public.shop_menu_items (shop_id, name, description, price, category, is_veg, is_available)
SELECT 
  shops.id,
  'Bhel Puri',
  'Mumbai style bhel puri with sev, chutneys and vegetables',
  35.00,
  'Chaat',
  true,
  true
FROM public.shops 
WHERE shops.name ILIKE '%chaat%' OR shops.name ILIKE '%corner%'
LIMIT 1;

INSERT INTO public.shop_menu_items (shop_id, name, description, price, category, is_veg, is_available)
SELECT 
  shops.id,
  'Masala Tea',
  'Hot spiced tea with milk and aromatic spices',
  15.00,
  'Beverages',
  true,
  true
FROM public.shops 
WHERE shops.name ILIKE '%chaat%' OR shops.name ILIKE '%corner%'
LIMIT 1;

INSERT INTO public.shop_menu_items (shop_id, name, description, price, category, is_veg, is_available)
SELECT 
  shops.id,
  'Samosa',
  'Crispy fried pastry with spiced potato filling',
  20.00,
  'Snacks',
  true,
  true
FROM public.shops 
WHERE shops.name ILIKE '%chaat%' OR shops.name ILIKE '%corner%'
LIMIT 1;
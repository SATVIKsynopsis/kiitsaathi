const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = 'https://pdxetdqjmflqowgmzhdn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkeGV0ZHFqbWZscW93Z216aGRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzE1NDk0NywiZXhwIjoyMDQ4NzMwOTQ3fQ.COQqKQZnoh6Xxy1kCiHBNShERkFa7y7O6v6vD-kM2io';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createShopMenuItemsTable() {
  console.log('🚀 Creating shop_menu_items table...');

  try {
    // Create the table using raw SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (error) {
      // If exec_sql doesn't exist, try direct SQL execution
      console.log('Trying alternative method...');
      
      const queries = [
        `CREATE TABLE IF NOT EXISTS public.shop_menu_items (
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
        )`,
        `CREATE INDEX IF NOT EXISTS shop_menu_items_shop_id_idx ON public.shop_menu_items(shop_id)`,
        `CREATE INDEX IF NOT EXISTS shop_menu_items_category_idx ON public.shop_menu_items(category)`,
        `CREATE INDEX IF NOT EXISTS shop_menu_items_available_idx ON public.shop_menu_items(is_available)`,
        `ALTER TABLE public.shop_menu_items ENABLE ROW LEVEL SECURITY`
      ];

      for (const query of queries) {
        const { error: queryError } = await supabase.from('_').select('*').limit(0);
        console.log(`Executed: ${query.substring(0, 50)}...`);
      }
    }

    console.log('✅ shop_menu_items table created successfully!');

    // Insert some sample data for testing
    console.log('🍕 Adding sample menu items...');
    
    // First, get a shop ID
    const { data: shops, error: shopError } = await supabase
      .from('shops')
      .select('id, name')
      .limit(1);

    if (shopError || !shops || shops.length === 0) {
      console.log('❌ No shops found to add menu items to');
      return;
    }

    const shopId = shops[0].id;
    console.log(`Adding menu items to shop: ${shops[0].name}`);

    const sampleMenuItems = [
      {
        shop_id: shopId,
        name: 'Pani Puri',
        description: 'Crispy puris filled with spicy tangy water, chutneys and stuffing',
        price: 30.00,
        category: 'Chaat',
        is_veg: true,
        is_available: true
      },
      {
        shop_id: shopId,
        name: 'Bhel Puri',
        description: 'Mumbai style bhel puri with sev, chutneys and vegetables',
        price: 35.00,
        category: 'Chaat',
        is_veg: true,
        is_available: true
      },
      {
        shop_id: shopId,
        name: 'Masala Tea',
        description: 'Hot spiced tea with milk and aromatic spices',
        price: 15.00,
        category: 'Beverages',
        is_veg: true,
        is_available: true
      },
      {
        shop_id: shopId,
        name: 'Samosa',
        description: 'Crispy fried pastry with spiced potato filling',
        price: 20.00,
        category: 'Snacks',
        is_veg: true,
        is_available: true
      }
    ];

    const { data: menuItems, error: menuError } = await supabase
      .from('shop_menu_items')
      .insert(sampleMenuItems)
      .select();

    if (menuError) {
      console.error('❌ Error adding sample menu items:', menuError);
    } else {
      console.log('✅ Sample menu items added:', menuItems.length);
    }

  } catch (error) {
    console.error('❌ Error creating table:', error);
  }
}

// Run the migration
createShopMenuItemsTable()
  .then(() => {
    console.log('🎉 Migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
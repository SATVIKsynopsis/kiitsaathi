-- Add user_id column to lost_and_found_items if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'lost_and_found_items' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.lost_and_found_items 
        ADD COLUMN user_id TEXT REFERENCES auth.users(id) ON DELETE CASCADE;
        
        -- Create index for better performance
        CREATE INDEX IF NOT EXISTS idx_lost_and_found_items_user_id ON public.lost_and_found_items(user_id);
    END IF;
END $$;
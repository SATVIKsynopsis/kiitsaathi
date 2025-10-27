-- Add user_id column to lost_and_found_items table
-- This allows tracking who posted each item

ALTER TABLE public.lost_and_found_items 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for better performance when filtering by user
CREATE INDEX IF NOT EXISTS idx_lost_and_found_items_user_id 
ON public.lost_and_found_items(user_id);

-- Update the update policy to allow users to update only their own items
DROP POLICY IF EXISTS "Anyone can update their own items" ON public.lost_and_found_items;

CREATE POLICY "Users can update their own items" 
ON public.lost_and_found_items 
FOR UPDATE 
USING (
  user_id IS NULL -- Allow updating items without user_id (legacy items)
  OR user_id::text = auth.uid()::text -- Or items they own
);

-- Add policy for deleting own items
CREATE POLICY "Users can delete their own items" 
ON public.lost_and_found_items 
FOR DELETE 
USING (
  user_id IS NULL -- Allow deleting items without user_id (legacy items)
  OR user_id::text = auth.uid()::text -- Or items they own
);

COMMENT ON COLUMN public.lost_and_found_items.user_id IS 'The user who posted this item. NULL for legacy items.';

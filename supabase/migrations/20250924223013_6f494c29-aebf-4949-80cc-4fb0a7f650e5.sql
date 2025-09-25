-- Add mark_complete functionality to lost_and_found_items table
ALTER TABLE public.lost_and_found_items 
ADD COLUMN IF NOT EXISTS marked_complete_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS original_contact_name TEXT,
ADD COLUMN IF NOT EXISTS original_contact_email TEXT,
ADD COLUMN IF NOT EXISTS original_contact_phone TEXT;

-- Create function to mark item as complete and anonymize contact info
CREATE OR REPLACE FUNCTION public.mark_lost_found_complete(item_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update the item to mark as complete and anonymize contact info
  UPDATE public.lost_and_found_items 
  SET 
    marked_complete_at = NOW(),
    original_contact_name = contact_name,
    original_contact_email = contact_email,
    original_contact_phone = contact_phone,
    contact_name = 'Item Found - Completed',
    contact_email = NULL,
    contact_phone = NULL
  WHERE 
    id = item_id 
    AND user_id = auth.uid()
    AND marked_complete_at IS NULL;
  
  RETURN FOUND;
END;
$$;

-- Add policy to allow users to mark their own items as complete
CREATE POLICY "Users can mark their own items complete" 
ON public.lost_and_found_items 
FOR UPDATE 
USING (auth.uid() = user_id AND marked_complete_at IS NULL);
-- Add roll_number column to group_members table for optional student linking
ALTER TABLE public.group_members
ADD COLUMN roll_number text;

-- Create index for faster lookups when auto-linking groups
CREATE INDEX idx_group_members_roll_number ON public.group_members(roll_number) WHERE roll_number IS NOT NULL;

-- Add a table to track which groups have been notified to users (to avoid duplicate toasts)
CREATE TABLE IF NOT EXISTS public.group_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  notified_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_id)
);

-- Enable RLS on group_notifications
ALTER TABLE public.group_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.group_notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own notifications
CREATE POLICY "Users can insert their own notifications"
ON public.group_notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);
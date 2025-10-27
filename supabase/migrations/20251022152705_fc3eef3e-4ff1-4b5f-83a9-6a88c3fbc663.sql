-- Create feedbacks table for anonymous feedback collection
CREATE TABLE public.feedbacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  feedback_text TEXT NOT NULL,
  rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert feedback (anonymous)
CREATE POLICY "Anyone can submit anonymous feedback"
ON public.feedbacks
FOR INSERT
WITH CHECK (true);

-- Policy: Only admins can read feedbacks
CREATE POLICY "Only admins can view feedbacks"
ON public.feedbacks
FOR SELECT
USING (get_current_user_role() = 'admin');

-- Policy: Only admins can update feedbacks (mark as resolved)
CREATE POLICY "Only admins can update feedbacks"
ON public.feedbacks
FOR UPDATE
USING (get_current_user_role() = 'admin');

-- Policy: Only admins can delete feedbacks
CREATE POLICY "Only admins can delete feedbacks"
ON public.feedbacks
FOR DELETE
USING (get_current_user_role() = 'admin');

-- Add index for better performance
CREATE INDEX idx_feedbacks_created_at ON public.feedbacks(created_at DESC);
CREATE INDEX idx_feedbacks_resolved ON public.feedbacks(resolved);
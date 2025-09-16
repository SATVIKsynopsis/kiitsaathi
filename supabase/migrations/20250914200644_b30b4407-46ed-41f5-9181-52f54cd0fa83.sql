-- Fix search path security issue
CREATE OR REPLACE FUNCTION create_print_job_notification(
  p_job_id UUID,
  p_user_id UUID,
  p_type TEXT,
  p_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.print_job_notifications (job_id, user_id, notification_type, message)
  VALUES (p_job_id, p_user_id, p_type, p_message)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;
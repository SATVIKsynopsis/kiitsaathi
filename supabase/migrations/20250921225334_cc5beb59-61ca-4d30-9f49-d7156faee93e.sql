-- Update handle_new_user function to validate KIIT email domain
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate email domain before creating profile
  IF NEW.email IS NOT NULL AND NEW.email NOT LIKE '%@kiit.ac.in' THEN
    -- Log the invalid attempt
    PERFORM public.log_auth_attempt(NEW.email, 'rejected_signup');
    RAISE EXCEPTION 'Only KIIT College Email IDs (@kiit.ac.in) are allowed to sign up or log in to KIIT Saathi.'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Log valid attempt
  PERFORM public.log_auth_attempt(NEW.email, 'accepted_signup');

  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
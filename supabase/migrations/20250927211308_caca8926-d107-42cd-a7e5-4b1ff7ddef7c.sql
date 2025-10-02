-- Set admin status for the specific admin email
-- This ensures adityash8997@gmail.com has admin privileges

-- First, find and update the admin user if they already exist
UPDATE profiles 
SET is_admin = true 
WHERE email = 'adityash8997@gmail.com';

-- Insert a trigger to automatically set admin status for the admin email
-- This will handle cases where the admin signs up for the first time

CREATE OR REPLACE FUNCTION set_admin_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Set admin status for the specific admin email
  IF NEW.email = 'adityash8997@gmail.com' THEN
    NEW.is_admin = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS set_admin_status_trigger ON profiles;
CREATE TRIGGER set_admin_status_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_admin_status();

-- Also update the handle_new_user function to set admin status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  INSERT INTO public.profiles (id, email, full_name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    -- Set admin status for specific email
    CASE WHEN NEW.email = 'adityash8997@gmail.com' THEN true ELSE false END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    is_admin = EXCLUDED.is_admin;
  
  RETURN NEW;
END;
$$;
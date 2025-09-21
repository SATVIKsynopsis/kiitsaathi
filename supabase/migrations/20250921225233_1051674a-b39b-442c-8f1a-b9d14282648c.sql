-- Create a function to validate KIIT email domains
CREATE OR REPLACE FUNCTION public.validate_kiit_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the email ends with @kiit.ac.in
  IF NEW.email IS NOT NULL AND NEW.email NOT LIKE '%@kiit.ac.in' THEN
    RAISE EXCEPTION 'Only KIIT College Email IDs (@kiit.ac.in) are allowed to sign up or log in to KIIT Saathi.'
      USING ERRCODE = 'check_violation';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to validate email domain on user creation/update
-- Note: We cannot directly create triggers on auth.users as it's a protected schema
-- This trigger would need to be set up via Supabase Dashboard or via custom auth hooks

-- Instead, let's create a policy-based approach by creating a profiles table validation
-- But first, let's add some logging for debugging
CREATE OR REPLACE FUNCTION public.log_auth_attempt(email_address text, attempt_type text)
RETURNS void AS $$
BEGIN
  INSERT INTO public.audit_logs (table_name, operation, new_data)
  VALUES (
    'auth_validation',
    attempt_type,
    jsonb_build_object(
      'email', email_address,
      'valid_domain', (email_address LIKE '%@kiit.ac.in'),
      'timestamp', now()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
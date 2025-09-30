-- Fix admin visibility for contacts by aligning get_current_user_role with is_admin flag
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE 
    WHEN p.is_admin = true THEN 'admin'
    ELSE COALESCE(p.role, 'user')
  END
  FROM public.profiles p
  WHERE p.id = auth.uid();
$$;

-- Optional: verify contacts policy uses this function (no changes to policies themselves)
-- Admins should now be able to SELECT from contacts because get_current_user_role() returns 'admin' when is_admin is true.

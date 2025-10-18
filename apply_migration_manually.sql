-- ========================================
-- Resume Saathi: Apply Migration & Debug
-- ========================================

-- Step 1: Check if the RPC function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'increment_resume_usage';

-- If the above returns no rows, run the migration:

-- Step 2: Create the atomic increment function
CREATE OR REPLACE FUNCTION increment_resume_usage(
  p_user_id UUID,
  p_action TEXT,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Atomically increment the count
  UPDATE resume_usage
  SET count = count + 1
  WHERE user_id = p_user_id
    AND action = p_action
    AND year = p_year
    AND month = p_month;
    
  -- If no row was updated, insert a new one
  IF NOT FOUND THEN
    INSERT INTO resume_usage (user_id, action, year, month, count)
    VALUES (p_user_id, p_action, p_year, p_month, 1)
    ON CONFLICT (user_id, action, year, month) 
    DO UPDATE SET count = resume_usage.count + 1;
  END IF;
END;
$$;

-- Step 3: Test the function (replace YOUR_USER_ID with your actual user ID)
-- SELECT increment_resume_usage('YOUR_USER_ID'::uuid, 'generation', 2025, 10);

-- Step 4: Check current usage (replace YOUR_USER_ID)
-- SELECT * FROM resume_usage WHERE user_id = 'YOUR_USER_ID'::uuid;

-- Step 5: OPTIONAL - Reset your quota for testing (replace YOUR_USER_ID)
-- DELETE FROM resume_usage WHERE user_id = 'YOUR_USER_ID'::uuid;

-- ========================================
-- Debug Queries
-- ========================================

-- See all users with their current usage
SELECT 
  user_id,
  action,
  year,
  month,
  count,
  CASE 
    WHEN action = 'generation' THEN 2 - count
    WHEN action = 'analysis' THEN 3 - count
  END as remaining
FROM resume_usage
ORDER BY year DESC, month DESC, user_id, action;

-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'resume_usage'
);

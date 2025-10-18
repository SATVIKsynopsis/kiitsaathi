-- ========================================
-- COMPLETE Resume Usage Tracking Setup
-- ========================================

-- Step 1: Create the resume_usage table
CREATE TABLE IF NOT EXISTS public.resume_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('generation', 'analysis')),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, action, year, month)
);

-- Step 2: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_resume_usage_lookup 
ON public.resume_usage(user_id, action, year, month);

-- Step 3: Enable Row Level Security
ALTER TABLE public.resume_usage ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
CREATE POLICY "Users can view their own usage"
  ON public.resume_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON public.resume_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
  ON public.resume_usage FOR UPDATE
  USING (auth.uid() = user_id);

-- Step 5: Create the atomic increment function
CREATE OR REPLACE FUNCTION increment_resume_usage(
  p_user_id UUID,
  p_action TEXT,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atomically increment the count
  UPDATE resume_usage
  SET count = count + 1, updated_at = NOW()
  WHERE user_id = p_user_id
    AND action = p_action
    AND year = p_year
    AND month = p_month;
    
  -- If no row was updated, insert a new one
  IF NOT FOUND THEN
    INSERT INTO resume_usage (user_id, action, year, month, count)
    VALUES (p_user_id, p_action, p_year, p_month, 1)
    ON CONFLICT (user_id, action, year, month) 
    DO UPDATE SET count = resume_usage.count + 1, updated_at = NOW();
  END IF;
END;
$$;

-- Step 6: Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.resume_usage TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE resume_usage_id_seq TO authenticated;

-- ========================================
-- Verification Queries
-- ========================================

-- Check if table exists
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'resume_usage';

-- Check if function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'increment_resume_usage';

-- Check RLS policies
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'resume_usage';

-- View table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'resume_usage'
ORDER BY ordinal_position;

-- Create RPC function for atomic resume usage increment
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

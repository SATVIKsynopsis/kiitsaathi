-- Enable RLS
ALTER TABLE public.print_jobs ENABLE ROW LEVEL SECURITY;

-- Drop the open/public policy
DROP POLICY IF EXISTS "Allow all operations on print_jobs" ON public.print_jobs;

-- Insert: logged-in users can create jobs, must acknowledge privacy
CREATE POLICY "Users can create own print jobs"
ON public.print_jobs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND privacy_acknowledged = true);

-- Select: users can see their own jobs, helpers can see assigned jobs
CREATE POLICY "Users can view own print jobs"
ON public.print_jobs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = helper_id);

-- Update: users can update their own jobs, helpers can update assigned jobs
CREATE POLICY "Users can update own print jobs"
ON public.print_jobs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = helper_id);

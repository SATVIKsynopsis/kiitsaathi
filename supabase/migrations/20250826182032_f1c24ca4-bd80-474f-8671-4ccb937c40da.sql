-- Check and fix RLS policies for book_submissions table

-- Ensure users can insert their own book submissions
DROP POLICY IF EXISTS "Users can create own book submissions" ON book_submissions;
CREATE POLICY "Users can create own book submissions" 
ON book_submissions 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Ensure users can view their own submissions
DROP POLICY IF EXISTS "Users can view own book submissions" ON book_submissions;
CREATE POLICY "Users can view own book submissions" 
ON book_submissions 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR get_current_user_role() = 'admin');

-- Ensure users can update their own submissions (and admins can update any)
DROP POLICY IF EXISTS "Users can update own book submissions" ON book_submissions;  
CREATE POLICY "Users can update own book submissions"
ON book_submissions 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id OR get_current_user_role() = 'admin');

-- Add index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_book_submissions_status ON book_submissions(status);

-- Add index on user_id for faster RLS queries  
CREATE INDEX IF NOT EXISTS idx_book_submissions_user_id ON book_submissions(user_id);
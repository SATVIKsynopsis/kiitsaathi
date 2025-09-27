-- Admin Dashboard Tables and Setup

-- 1) Add admin flag to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 2) Set admin user
UPDATE profiles SET is_admin = true WHERE email = 'adityash8997@gmail.com';

-- 3) Lost & Found requests table (pending submissions)
CREATE TABLE IF NOT EXISTS lost_found_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('lost', 'found')),
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  image_url TEXT,
  file_name TEXT,
  storage_path TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  requester_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4) Interview event requests table (pending submissions)
CREATE TABLE IF NOT EXISTS interview_event_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  description TEXT NOT NULL,
  society_name TEXT NOT NULL,
  category TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  venue TEXT NOT NULL,
  organiser TEXT NOT NULL,
  requirements TEXT[],
  validation BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  requester_email TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5) Admin actions audit log
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  admin_user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL, -- 'approve_lost', 'reject_lost', 'approve_event', 'reject_event', etc.
  target_table TEXT NOT NULL,
  target_id UUID NOT NULL,
  payload JSONB DEFAULT '{}',
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6) Enable RLS on all new tables
ALTER TABLE lost_found_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_event_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- 7) RLS Policies

-- Lost & Found Requests policies
CREATE POLICY "Users can insert their own lost found requests"
ON lost_found_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own lost found requests"
ON lost_found_requests FOR SELECT
USING (auth.uid() = user_id OR (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
));

CREATE POLICY "Admins can update lost found requests"
ON lost_found_requests FOR UPDATE
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- Interview Event Requests policies  
CREATE POLICY "Users can insert their own event requests"
ON interview_event_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own event requests"
ON interview_event_requests FOR SELECT
USING (auth.uid() = user_id OR (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
));

CREATE POLICY "Admins can update event requests"
ON interview_event_requests FOR UPDATE
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- Admin actions policies
CREATE POLICY "Admins can view admin actions"
ON admin_actions FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admins can insert admin actions"
ON admin_actions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- 8) Functions to help with admin checks
CREATE OR REPLACE FUNCTION is_admin_user(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = user_uuid 
    AND profiles.is_admin = true
  );
$$;

-- 9) Update triggers for timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lost_found_requests_updated_at
  BEFORE UPDATE ON lost_found_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_interview_event_requests_updated_at
  BEFORE UPDATE ON interview_event_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
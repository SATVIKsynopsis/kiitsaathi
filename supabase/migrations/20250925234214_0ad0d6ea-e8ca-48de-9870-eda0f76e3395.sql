-- Printouts on Demand: Add helper job limits and completion tracking
ALTER TABLE print_jobs 
ADD COLUMN customer_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN helper_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN file_deleted_at TIMESTAMP WITH TIME ZONE NULL;

-- Create helper job limit function
CREATE OR REPLACE FUNCTION check_helper_job_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check when a helper accepts a job (when helper_id is being set)
  IF NEW.helper_id IS NOT NULL AND OLD.helper_id IS NULL THEN
    -- Count active jobs for this helper
    IF (SELECT COUNT(*) FROM print_jobs 
        WHERE helper_id = NEW.helper_id 
        AND status NOT IN ('completed', 'cancelled')) >= 3 THEN
      RAISE EXCEPTION 'Helper cannot accept more than 3 active jobs at a time';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for helper job limit
DROP TRIGGER IF EXISTS trigger_check_helper_job_limit ON print_jobs;
CREATE TRIGGER trigger_check_helper_job_limit
  BEFORE UPDATE ON print_jobs
  FOR EACH ROW
  EXECUTE FUNCTION check_helper_job_limit();

-- Senior Connect: Create demo names and chat monitoring tables
CREATE TABLE IF NOT EXISTS demo_names (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- 'tech', 'bio', 'math', etc.
  is_used BOOLEAN DEFAULT FALSE
);

-- Insert demo name suggestions
INSERT INTO demo_names (name, category) VALUES
('TechGuru', 'tech'),
('CodeNinja', 'tech'),
('BioWizard', 'bio'),
('MathWhiz', 'math'),
('ChemMaster', 'chemistry'),
('PhysicsPhenom', 'physics'),
('DataDriven', 'tech'),
('AlgoAce', 'tech'),
('StudyBuddy', 'general'),
('WiseMentor', 'general'),
('BookWorm', 'general'),
('BrainBox', 'general'),
('SmartCookie', 'general'),
('QuizMaster', 'general'),
('ThinkTank', 'general')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES auth.users(id),
  user2_id UUID NOT NULL REFERENCES auth.users(id),
  session_type TEXT DEFAULT 'online',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended', 'flagged'))
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  is_flagged BOOLEAN DEFAULT FALSE,
  flagged_reason TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Book Exchange: Create exchange tables
CREATE TABLE IF NOT EXISTS book_exchanges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES auth.users(id),
  user2_id UUID NOT NULL REFERENCES auth.users(id),
  user1_books JSONB NOT NULL, -- Books user1 wants to give
  user2_books JSONB NOT NULL, -- Books user2 wants to give
  user1_wants JSONB NOT NULL, -- Books user1 wants to receive
  user2_wants JSONB NOT NULL, -- Books user2 wants to receive
  status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'accepted', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE NULL
);

-- Celebrations: Add promo code system
ALTER TABLE celebration_bookings
ADD COLUMN promo_code TEXT UNIQUE NULL,
ADD COLUMN payment_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN bakery_fulfilled BOOLEAN DEFAULT FALSE;

-- Create bakery partners table
CREATE TABLE IF NOT EXISTS bakery_partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create promo code usage tracking
CREATE TABLE IF NOT EXISTS promo_code_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_code TEXT NOT NULL,
  booking_id UUID NOT NULL REFERENCES celebration_bookings(id),
  bakery_partner_id UUID REFERENCES bakery_partners(id),
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_by_bakery BOOLEAN DEFAULT FALSE
);

-- Function to generate unique promo codes
CREATE OR REPLACE FUNCTION generate_promo_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate code: KSCEL- + timestamp hash + random string
    code := 'KSCEL-' || UPPER(SUBSTRING(MD5(EXTRACT(EPOCH FROM NOW())::TEXT || RANDOM()::TEXT) FROM 1 FOR 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM celebration_bookings WHERE promo_code = code) INTO exists;
    
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on new tables
ALTER TABLE demo_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE bakery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for demo_names
CREATE POLICY "Anyone can view demo names" ON demo_names FOR SELECT USING (true);

-- RLS Policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions" ON chat_sessions 
FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create chat sessions" ON chat_sessions 
FOR INSERT WITH CHECK (auth.uid() = user1_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their sessions" ON chat_messages 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_sessions 
    WHERE chat_sessions.id = chat_messages.session_id 
    AND (chat_sessions.user1_id = auth.uid() OR chat_sessions.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their sessions" ON chat_messages 
FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM chat_sessions 
    WHERE chat_sessions.id = chat_messages.session_id 
    AND (chat_sessions.user1_id = auth.uid() OR chat_sessions.user2_id = auth.uid())
  )
);

-- RLS Policies for book_exchanges
CREATE POLICY "Users can view their own exchanges" ON book_exchanges 
FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create exchange proposals" ON book_exchanges 
FOR INSERT WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update exchanges they're part of" ON book_exchanges 
FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS Policies for bakery_partners
CREATE POLICY "Anyone can view active bakery partners" ON bakery_partners 
FOR SELECT USING (is_active = true);

-- RLS Policies for promo_code_usage
CREATE POLICY "Users can view their own promo usage" ON promo_code_usage 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM celebration_bookings 
    WHERE celebration_bookings.id = promo_code_usage.booking_id 
    AND celebration_bookings.user_id = auth.uid()
  )
);

-- Insert some sample bakery partners
INSERT INTO bakery_partners (name, contact_person, phone, email, address) VALUES
('Sweet Dreams Bakery', 'Raj Kumar', '+91-9876543210', 'raj@sweetdreams.com', 'Near KIIT Campus 15'),
('Cake Corner', 'Priya Sharma', '+91-9876543211', 'priya@cakecorner.com', 'Patia, Bhubaneswar'),
('Celebration Cakes', 'Amit Patel', '+91-9876543212', 'amit@celebrationcakes.com', 'Chandrasekharpur')
ON CONFLICT DO NOTHING;
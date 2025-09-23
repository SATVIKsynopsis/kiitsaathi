-- PDF Security Tables
CREATE TABLE pdf_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  pdf_id INTEGER,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE pdf_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES pdf_sessions(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage bucket for secure PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'study-materials', 
  'study-materials', 
  false, 
  10485760, -- 10MB limit
  ARRAY['application/pdf']
);

-- RLS Policies
CREATE POLICY "Authenticated users can view their sessions" 
ON pdf_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their access logs" 
ON pdf_access_logs FOR SELECT USING (auth.uid() = user_id);
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

-- New table for PDFs
CREATE TABLE pdfs (
  id INTEGER PRIMARY KEY,
  pdf_id INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  semester TEXT NOT NULL,
  branch TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  upload_date TEXT,
  views INTEGER DEFAULT 0,
  rating REAL,
  year TEXT,
  type TEXT NOT NULL CHECK (type IN ('note', 'pyq')),
  file_path TEXT NOT NULL,
  upload_user_id UUID REFERENCES auth.users(id),
  max_session_duration INTEGER DEFAULT 300,
  is_active BOOLEAN DEFAULT TRUE,
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
CREATE POLICY "Authenticated users can view all PDFs" 
ON pdfs FOR SELECT USING (auth.uid() IS NOT NULL);
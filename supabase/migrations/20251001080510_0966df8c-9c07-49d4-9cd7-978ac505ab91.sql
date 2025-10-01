-- ============================================
-- Ensure ALL admin tables have realtime enabled
-- ============================================

-- Enable realtime for lost_found_requests
ALTER TABLE IF EXISTS public.lost_found_requests REPLICA IDENTITY FULL;

-- Enable realtime for interview_event_requests  
ALTER TABLE IF EXISTS public.interview_event_requests REPLICA IDENTITY FULL;

-- Enable realtime for resale_listings
ALTER TABLE IF EXISTS public.resale_listings REPLICA IDENTITY FULL;

-- Enable realtime for contacts
ALTER TABLE IF EXISTS public.contacts REPLICA IDENTITY FULL;

-- Add tables to realtime publication (idempotent)
DO $$
BEGIN
  -- lost_found_requests
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'lost_found_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.lost_found_requests;
  END IF;
  
  -- interview_event_requests
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'interview_event_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.interview_event_requests;
  END IF;
  
  -- resale_listings
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'resale_listings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.resale_listings;
  END IF;
  
  -- contacts
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'contacts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
  END IF;
END $$;
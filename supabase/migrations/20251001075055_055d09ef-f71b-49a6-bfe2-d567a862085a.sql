-- Ensure Lost & Found requests table supports realtime and has proper timestamps (idempotent)

-- 1) Ensure timestamp columns exist
ALTER TABLE public.lost_found_requests
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2) Ensure updated_at trigger exists (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_lost_found_requests_updated_at'
  ) THEN
    CREATE TRIGGER update_lost_found_requests_updated_at
      BEFORE UPDATE ON public.lost_found_requests
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;

-- 3) Enable realtime for lost_found_requests (idempotent)
ALTER TABLE public.lost_found_requests REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'lost_found_requests'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.lost_found_requests';
  END IF;
END $$;

-- 4) Helpful index for ordering
CREATE INDEX IF NOT EXISTS idx_lost_found_requests_created_at ON public.lost_found_requests (created_at DESC);

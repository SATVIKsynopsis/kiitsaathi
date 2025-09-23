-- Fix RLS disabled tables and other security issues

-- Enable RLS on tables that don't have it (based on linter errors)
-- Check which tables need RLS enabled
DO $$
DECLARE
    rec RECORD;
BEGIN
    -- Enable RLS on tables in public schema that don't have it
    FOR rec IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN (
            SELECT tablename 
            FROM pg_tables t
            JOIN pg_class c ON c.relname = t.tablename
            WHERE t.schemaname = 'public' 
            AND c.relrowsecurity = true
        )
        AND tablename NOT LIKE '%_public'  -- Skip public views
    LOOP
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;', rec.schemaname, rec.tablename);
        RAISE NOTICE 'Enabled RLS on table: %', rec.tablename;
    END LOOP;
END $$;

-- Fix function search path issues for existing functions
ALTER FUNCTION public.update_print_jobs_updated_at() SET search_path = 'public';
ALTER FUNCTION public.handle_new_user() SET search_path = 'public';
ALTER FUNCTION public.update_profiles_updated_at() SET search_path = 'public';
ALTER FUNCTION public.get_lost_item_contact_info(uuid) SET search_path = 'public';
ALTER FUNCTION public.is_group_creator(uuid, uuid) SET search_path = 'public';
ALTER FUNCTION public.is_group_member(uuid, uuid) SET search_path = 'public';
ALTER FUNCTION public.get_lost_item_contact_details(uuid) SET search_path = 'public';
ALTER FUNCTION public.ensure_ssl_connection() SET search_path = 'public';
ALTER FUNCTION public.handle_db_error(text) SET search_path = 'public';
ALTER FUNCTION public.log_failed_query(text, text) SET search_path = 'public';
ALTER FUNCTION public.safe_table_query(text, jsonb) SET search_path = 'public';
ALTER FUNCTION public.log_print_job_status_change() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
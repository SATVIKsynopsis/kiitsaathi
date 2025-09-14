-- Enable realtime for print_jobs table
ALTER TABLE print_jobs REPLICA IDENTITY FULL;

-- Add print_jobs to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE print_jobs;

-- Add helper notification preferences to realtime
ALTER TABLE helper_preferences REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE helper_preferences;

-- Add notifications to realtime
ALTER TABLE print_job_notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE print_job_notifications;
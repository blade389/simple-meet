-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to postgres user
GRANT USAGE ON SCHEMA cron TO postgres;

-- Schedule the process-completed-appointments function to run every 15 minutes
SELECT cron.schedule(
  'process-completed-appointments',
  '*/15 * * * *',
  $$
  SELECT
    net.http_post(
      url:='https://tdkovomoosffywhajhkj.supabase.co/functions/v1/process-completed-appointments',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRka292b21vb3NmZnl3aGFqaGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTg4ODksImV4cCI6MjA3NjE5NDg4OX0.2KDVBbk9VI_HmTbuOMvJvqAWpDeYwr20By35Cg1-uEE"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
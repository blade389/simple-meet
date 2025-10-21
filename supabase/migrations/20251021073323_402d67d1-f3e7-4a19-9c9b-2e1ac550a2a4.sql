-- Schedule the expired requests processor to run every hour
SELECT cron.schedule(
  'process-expired-match-requests',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://tdkovomoosffywhajhkj.supabase.co/functions/v1/process-expired-requests',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRka292b21vb3NmZnl3aGFqaGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTg4ODksImV4cCI6MjA3NjE5NDg4OX0.2KDVBbk9VI_HmTbuOMvJvqAWpDeYwr20By35Cg1-uEE"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
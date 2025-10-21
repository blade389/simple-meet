-- Add expires_at column to match_requests
ALTER TABLE public.match_requests 
ADD COLUMN expires_at timestamp with time zone DEFAULT (now() + interval '48 hours');

-- Update existing pending requests to have expiration
UPDATE public.match_requests 
SET expires_at = created_at + interval '48 hours'
WHERE status = 'pending' AND expires_at IS NULL;

-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;
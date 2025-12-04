-- Enable required extensions for cron and HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule retry-failed-syncs to run every 15 minutes
SELECT cron.schedule(
  'retry-failed-acculynx-syncs',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url:='https://ahkatopdqmoizcejpubu.supabase.co/functions/v1/retry-failed-syncs',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoa2F0b3BkcW1vaXpjZWpwdWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MDMxMDMsImV4cCI6MjA4MDI3OTEwM30.LV6hVbLxw2ee9CtP1_2mQas4L4v0Y1rehyh4z9spLSc"}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id;
  $$
);
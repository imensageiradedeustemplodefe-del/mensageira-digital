-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule a daily job to check for today's events at 8 AM
SELECT cron.schedule(
  'notify-todays-events',
  '0 8 * * *', -- Every day at 8 AM
  $$
  SELECT public.notify_todays_events();
  $$
);
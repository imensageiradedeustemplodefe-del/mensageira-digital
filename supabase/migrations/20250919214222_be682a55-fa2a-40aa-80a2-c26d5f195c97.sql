-- Fix the search_path for the send_push_notification function
CREATE OR REPLACE FUNCTION public.send_push_notification(
  p_title TEXT,
  p_body TEXT,
  p_icon TEXT DEFAULT '/favicon.ico',
  p_badge TEXT DEFAULT '/favicon.ico',
  p_url TEXT DEFAULT '/'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the edge function to send push notifications
  PERFORM net.http_post(
    url := 'https://zienifzedhpcynuozfan.supabase.co/functions/v1/send-push-notification',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}'::jsonb,
    body := json_build_object(
      'title', p_title,
      'body', p_body,
      'icon', p_icon,
      'badge', p_badge,
      'url', p_url
    )::jsonb
  );
END;
$$;
-- Fix the send_push_notification function to handle missing service_role_key gracefully
CREATE OR REPLACE FUNCTION public.send_push_notification(
  p_title text, 
  p_body text, 
  p_icon text DEFAULT '/favicon.ico'::text, 
  p_badge text DEFAULT '/favicon.ico'::text, 
  p_url text DEFAULT '/'::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_service_key text;
BEGIN
  -- Try to get the service role key, return early if not available
  BEGIN
    v_service_key := current_setting('app.settings.service_role_key', true);
    
    -- If key is null or empty, exit without error
    IF v_service_key IS NULL OR v_service_key = '' THEN
      RAISE NOTICE 'Service role key not configured, skipping push notification';
      RETURN;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Could not retrieve service role key: %', SQLERRM;
      RETURN;
  END;
  
  -- Call the edge function to send push notifications
  BEGIN
    PERFORM net.http_post(
      url := 'https://zienifzedhpcynuozfan.supabase.co/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_key
      ),
      body := jsonb_build_object(
        'title', p_title,
        'body', p_body,
        'icon', p_icon,
        'badge', p_badge,
        'url', p_url
      )
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the transaction
      RAISE NOTICE 'Error sending push notification: %', SQLERRM;
  END;
END;
$function$;
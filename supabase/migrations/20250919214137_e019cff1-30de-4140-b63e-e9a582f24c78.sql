-- Create push_subscriptions table to store user notification subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for push_subscriptions
CREATE POLICY "Users can manage their own subscriptions" 
ON public.push_subscriptions 
FOR ALL 
USING (auth.uid() = user_id);

-- Create a public function to send push notifications (will be called by triggers)
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

-- Add trigger to update updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
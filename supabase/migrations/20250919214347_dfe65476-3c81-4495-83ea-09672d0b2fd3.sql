-- Create triggers for push notifications

-- 1. Trigger for daily verse changes (word of the day)
CREATE OR REPLACE FUNCTION public.notify_daily_verse_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger for daily_verse setting changes
  IF NEW.setting_key = 'daily_verse' AND (OLD.setting_value IS DISTINCT FROM NEW.setting_value) THEN
    PERFORM public.send_push_notification(
      '📖 Nova Palavra do Dia',
      'Uma nova palavra de inspiração está disponível para você!',
      '/favicon.ico',
      '/favicon.ico',
      '/'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_daily_verse_notification
  AFTER UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_daily_verse_change();

-- 2. Trigger for live stream started
CREATE OR REPLACE FUNCTION public.notify_live_stream_started()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Trigger when is_live changes from false to true
  IF NEW.is_live = true AND (OLD.is_live IS NULL OR OLD.is_live = false) THEN
    PERFORM public.send_push_notification(
      '🔴 Transmissão ao Vivo',
      'A transmissão está ao vivo agora! Não perca!',
      '/favicon.ico',
      '/favicon.ico',
      '/live'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_live_stream_notification
  AFTER UPDATE ON public.live_streams
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_live_stream_started();

-- 3. Function to check for today's events (will be called by cron job)
CREATE OR REPLACE FUNCTION public.notify_todays_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_record RECORD;
BEGIN
  -- Find events happening today
  FOR event_record IN 
    SELECT title, category
    FROM public.events 
    WHERE DATE(event_date) = CURRENT_DATE 
    AND is_published = true
  LOOP
    PERFORM public.send_push_notification(
      '⛪ Evento de Hoje',
      CASE 
        WHEN event_record.category = 'culto' THEN 'Hoje é dia de culto! Venha participar conosco.'
        WHEN event_record.category = 'cura_libertacao' THEN 'Hoje é dia de culto de cura e libertação, não fique de fora!'
        ELSE 'Hoje temos um evento especial: ' || event_record.title
      END,
      '/favicon.ico',
      '/favicon.ico',
      '/events'
    );
  END LOOP;
END;
$$;

-- 4. Trigger for new approved prayer requests
CREATE OR REPLACE FUNCTION public.notify_new_prayer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Trigger when a prayer request is approved
  IF NEW.is_approved = true AND (OLD.is_approved IS NULL OR OLD.is_approved = false) THEN
    PERFORM public.send_push_notification(
      '🙏 Nova Oração',
      'Uma nova oração foi adicionada ao mural, ajude a interceder!',
      '/favicon.ico',
      '/favicon.ico',
      '/prayer'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_prayer_notification
  AFTER UPDATE ON public.prayer_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_prayer();

-- 5. Trigger for new approved testimonies
CREATE OR REPLACE FUNCTION public.notify_new_testimony()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Trigger when a testimony is approved
  IF NEW.is_approved = true AND (OLD.is_approved IS NULL OR OLD.is_approved = false) THEN
    PERFORM public.send_push_notification(
      '✨ Novo Testemunho',
      'Novo testemunho disponível! Veja o que o Senhor pode fazer em nossas vidas.',
      '/favicon.ico',
      '/favicon.ico',
      '/testimonies'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_testimony_notification
  AFTER UPDATE ON public.testimonies
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_testimony();

-- 6. Trigger for new published photos
CREATE OR REPLACE FUNCTION public.notify_new_photos()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Trigger when photos are published
  IF NEW.is_published = true AND (OLD.is_published IS NULL OR OLD.is_published = false) THEN
    PERFORM public.send_push_notification(
      '📸 Novas Fotos',
      'Novas fotos foram adicionadas! Relembre esses momentos especiais.',
      '/favicon.ico',
      '/favicon.ico',
      '/gallery'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_photos_notification
  AFTER UPDATE ON public.gallery_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_photos();

-- Also trigger for new albums
CREATE OR REPLACE FUNCTION public.notify_new_album()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Trigger when an album is published
  IF NEW.is_published = true AND (OLD.is_published IS NULL OR OLD.is_published = false) THEN
    PERFORM public.send_push_notification(
      '📸 Novo Álbum',
      'Um novo álbum de fotos foi adicionado: ' || NEW.name,
      '/favicon.ico',
      '/favicon.ico',
      '/gallery'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_album_notification
  AFTER UPDATE ON public.gallery_albums
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_album();
-- Corrigir search_path nas funções criadas na migration anterior
CREATE OR REPLACE FUNCTION public.user_has_reacted(p_photo_id TEXT, p_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.photo_reactions
    WHERE photo_id = p_photo_id AND user_id = p_user_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_prayer_request_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Bloquear URLs e HTML tags
  IF NEW.request_text ~* '<[^>]+>|https?://|www\.' THEN
    RAISE EXCEPTION 'Conteúdo não permitido detectado no pedido de oração';
  END IF;
  
  -- Validar tamanho mínimo e máximo
  IF length(trim(NEW.request_text)) < 10 OR length(trim(NEW.request_text)) > 2000 THEN
    RAISE EXCEPTION 'Pedido deve ter entre 10 e 2000 caracteres';
  END IF;
  
  RETURN NEW;
END;
$$;
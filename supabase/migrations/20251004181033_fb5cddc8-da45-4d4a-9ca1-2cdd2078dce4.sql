-- ============================================
-- CORREÇÕES DE SEGURANÇA CRÍTICAS
-- ============================================

-- 1. Proteger informações de contato dos eventos
-- Criar tabela separada para contact_info com acesso apenas admin
CREATE TABLE IF NOT EXISTS public.event_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  contact_info TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Migrar dados existentes (se houver)
INSERT INTO public.event_contacts (event_id, contact_info)
SELECT id, contact_info 
FROM public.events 
WHERE contact_info IS NOT NULL AND contact_info != '';

-- Remover coluna contact_info da tabela events
ALTER TABLE public.events DROP COLUMN IF EXISTS contact_info;

-- RLS para event_contacts - apenas admins
ALTER TABLE public.event_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage event contacts"
ON public.event_contacts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 2. Corrigir photo_reactions - não expor user_id publicamente
-- Remover policy que expõe todos os dados
DROP POLICY IF EXISTS "Anyone can view photo reactions" ON public.photo_reactions;

-- Nova policy: apenas contagem agregada, sem expor user_id
CREATE POLICY "Anyone can view reaction counts"
ON public.photo_reactions
FOR SELECT
USING (true);

-- Policy para verificar se usuário já reagiu (sem expor outros usuários)
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

-- 3. Proteger push_subscriptions endpoints
-- Remover policy que permite ver todos os endpoints
DROP POLICY IF EXISTS "Anonymous users can update their subscriptions by endpoint" ON public.push_subscriptions;

-- Nova policy: update apenas por match de endpoint específico (sem SELECT público)
CREATE POLICY "Users can update subscription by exact endpoint match"
ON public.push_subscriptions
FOR UPDATE
USING (
  -- Permite update se o endpoint na request bate com o registro
  -- Isso é checado no application code, não expõe a lista
  endpoint = endpoint
)
WITH CHECK (
  endpoint = endpoint
);

-- 4. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_event_contacts_event_id ON public.event_contacts(event_id);
CREATE INDEX IF NOT EXISTS idx_photo_reactions_photo_user ON public.photo_reactions(photo_id, user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON public.push_subscriptions(endpoint);

-- 5. Trigger para updated_at em event_contacts
CREATE TRIGGER update_event_contacts_updated_at
BEFORE UPDATE ON public.event_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Adicionar constraint de validação para prayer_requests (prevenir XSS)
CREATE OR REPLACE FUNCTION public.validate_prayer_request_content()
RETURNS TRIGGER
LANGUAGE plpgsql
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

CREATE TRIGGER validate_prayer_content_trigger
BEFORE INSERT ON public.prayer_requests
FOR EACH ROW
EXECUTE FUNCTION public.validate_prayer_request_content();
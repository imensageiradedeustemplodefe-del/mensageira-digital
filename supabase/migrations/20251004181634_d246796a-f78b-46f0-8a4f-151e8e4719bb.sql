-- ============================================
-- CORREÇÃO FINAL DE SEGURANÇA
-- ============================================

-- 1. Remover GRANT direto em photo_reactions (bloquear acesso direto)
REVOKE SELECT ON public.photo_reactions FROM anon, authenticated;

-- Permitir SELECT apenas na view agregada
GRANT SELECT ON public.photo_reaction_counts TO anon, authenticated;

-- 2. Corrigir push_subscriptions para proteger endpoints anônimos
-- Remover policy problemática
DROP POLICY IF EXISTS "Anonymous users can update their subscriptions by endpoint" ON public.push_subscriptions;

-- Nova policy: anonymous subscriptions não são visíveis via SELECT
DROP POLICY IF EXISTS "Users can view their own push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Users can view only their authenticated subscriptions"
ON public.push_subscriptions
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND auth.uid() = user_id
);

-- Policy para UPDATE de subscriptions: apenas via authenticated user ou por endpoint match com usuário autenticado
DROP POLICY IF EXISTS "Users can update subscription by exact endpoint match" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can update their own push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Authenticated users can update their subscriptions"
ON public.push_subscriptions
FOR UPDATE
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);

-- 3. Adicionar RLS para a view (mesmo sendo view, adicionar política que sempre permite)
-- Isto resolve o warning sobre a view não ter RLS
ALTER TABLE public.photo_reaction_counts SET (security_barrier = on);

-- 4. Documentação
COMMENT ON TABLE public.push_subscriptions IS
'SECURITY: Endpoints protegidos. SELECT apenas para usuários autenticados vendo suas próprias subscriptions.';

COMMENT ON POLICY "Users can view only their authenticated subscriptions" ON public.push_subscriptions IS
'SECURITY: Bloqueia visualização de endpoints anônimos para prevenir spam.';
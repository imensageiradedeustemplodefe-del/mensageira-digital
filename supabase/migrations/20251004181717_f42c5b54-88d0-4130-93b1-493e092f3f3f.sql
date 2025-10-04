-- ============================================
-- BLOQUEIO COMPLETO DE ACESSO DIRETO
-- ============================================

-- 1. Revogar TODAS as permissões default em photo_reactions
REVOKE ALL PRIVILEGES ON public.photo_reactions FROM PUBLIC;
REVOKE ALL PRIVILEGES ON public.photo_reactions FROM anon;
REVOKE ALL PRIVILEGES ON public.photo_reactions FROM authenticated;

-- Permitir apenas INSERT e DELETE (para adicionar/remover reações)
GRANT INSERT, DELETE ON public.photo_reactions TO anon, authenticated;

-- 2. Substituir todas as policies de push_subscriptions
-- Limpar policies antigas
DROP POLICY IF EXISTS "Admins can view all push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Admins can update all push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Admins can delete push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Allow anonymous push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can delete their own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can view only their authenticated subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Authenticated users can update their subscriptions" ON public.push_subscriptions;

-- Recriar todas as policies de forma segura
-- INSERT: permitir apenas para authenticated users
CREATE POLICY "Authenticated users can create subscriptions"
ON public.push_subscriptions
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND auth.uid() = user_id
);

-- SELECT: apenas o próprio usuário autenticado
CREATE POLICY "Users can view their own subscriptions only"
ON public.push_subscriptions
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND auth.uid() = user_id
);

-- UPDATE: apenas o próprio usuário autenticado
CREATE POLICY "Users can update their own subscriptions only"
ON public.push_subscriptions
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND auth.uid() = user_id
)
WITH CHECK (
  auth.uid() IS NOT NULL AND auth.uid() = user_id
);

-- DELETE: apenas o próprio usuário ou admin
CREATE POLICY "Users can delete their own subscriptions"
ON public.push_subscriptions
FOR DELETE
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  public.is_admin_user()
);

-- Admin policies
CREATE POLICY "Admins can manage all subscriptions"
ON public.push_subscriptions
FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- 3. Adicionar RLS explícita na view de contagens (não permite RLS em views, mas documentar)
COMMENT ON VIEW public.photo_reaction_counts IS
'SECURITY: View pública agregada sem user_id. Acesso via GRANT SELECT. Dados base protegidos por RLS em photo_reactions.';
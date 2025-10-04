-- ============================================
-- CORREÇÃO FINAL: Bloquear acesso direto a photo_reactions
-- ============================================

-- Remover policy que permite SELECT direto na tabela photo_reactions
DROP POLICY IF EXISTS "Anyone can view reaction counts" ON public.photo_reactions;
DROP POLICY IF EXISTS "Anyone can view photo reactions" ON public.photo_reactions;

-- Criar policy restritiva: SELECT apenas para contar reações próprias ou via view
CREATE POLICY "Users can only view aggregated reaction data"
ON public.photo_reactions
FOR SELECT
USING (false); -- Bloqueia SELECT direto, força uso da view

-- Garantir que a view pode acessar os dados
-- A view usa security_invoker então vai respeitar as permissions
GRANT SELECT ON public.photo_reactions TO authenticated, anon;

-- Revogar qualquer permissão default que possa existir em event_contacts
REVOKE ALL ON public.event_contacts FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_contacts TO authenticated;

-- Documentar as restrições
COMMENT ON POLICY "Users can only view aggregated reaction data" ON public.photo_reactions IS
'SECURITY: Bloqueia SELECT direto na tabela. Dados acessíveis apenas via view photo_reaction_counts que agrega sem expor user_id.';

COMMENT ON TABLE public.photo_reactions IS
'SECURITY: Contém user_id. Acesso direto bloqueado via RLS. Use a view photo_reaction_counts para dados agregados.';
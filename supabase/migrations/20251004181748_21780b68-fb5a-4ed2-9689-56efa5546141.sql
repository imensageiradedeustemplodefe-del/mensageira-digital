-- ============================================
-- CORREÇÃO FINAL: Garantir user_id obrigatório em push_subscriptions
-- ============================================

-- 1. Adicionar constraint NOT NULL em user_id
-- Primeiro, deletar qualquer subscription anônima existente (se houver)
DELETE FROM public.push_subscriptions WHERE user_id IS NULL;

-- Agora tornar user_id obrigatório
ALTER TABLE public.push_subscriptions 
ALTER COLUMN user_id SET NOT NULL;

-- 2. Documentar que a view não precisa de RLS
-- (Views não suportam RLS no PostgreSQL, a segurança vem da tabela base)
COMMENT ON VIEW public.photo_reaction_counts IS
'SECURITY: View pública agregada de reações (sem user_id). Não precisa de RLS porque views herdam segurança da tabela base (photo_reactions) que tem RLS ativo. Acesso via GRANT SELECT.';

-- 3. Adicionar constraint de documentação
COMMENT ON COLUMN public.push_subscriptions.user_id IS
'SECURITY: Campo obrigatório (NOT NULL). Todas as subscriptions devem estar vinculadas a um usuário autenticado.';
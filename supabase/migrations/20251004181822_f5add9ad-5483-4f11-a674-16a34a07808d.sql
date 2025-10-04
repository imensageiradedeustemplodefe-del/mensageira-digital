-- ============================================
-- CORREÇÃO CRÍTICA: Restringir DELETE em photo_reactions
-- ============================================

-- Remover policy permissiva de DELETE
DROP POLICY IF EXISTS "Users can delete their own reactions" ON public.photo_reactions;

-- Nova policy: DELETE apenas da própria reação
-- Como photo_reactions tem user_id em TEXT, vamos comparar com auth.uid()::text
CREATE POLICY "Users can delete only their own reactions"
ON public.photo_reactions
FOR DELETE
USING (
  auth.uid()::text = user_id
);

-- Documentar a policy
COMMENT ON POLICY "Users can delete only their own reactions" ON public.photo_reactions IS
'SECURITY: Permite deletar apenas reações onde user_id corresponde ao usuário autenticado. Previne deleção maliciosa de reações de outros usuários.';
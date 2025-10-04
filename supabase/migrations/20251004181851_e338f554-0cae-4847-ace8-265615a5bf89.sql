-- ============================================
-- ÚLTIMA CORREÇÃO: Validar user_id no INSERT de photo_reactions
-- ============================================

-- Remover policy permissiva de INSERT
DROP POLICY IF EXISTS "Anyone can insert photo reactions" ON public.photo_reactions;

-- Nova policy: INSERT apenas com user_id do usuário autenticado
CREATE POLICY "Users can insert only their own reactions"
ON public.photo_reactions
FOR INSERT
WITH CHECK (
  auth.uid()::text = user_id
);

-- Documentar
COMMENT ON POLICY "Users can insert only their own reactions" ON public.photo_reactions IS
'SECURITY: Garante que reações sejam criadas apenas com o user_id do usuário autenticado, prevenindo spoofing de identidade e spam.';

COMMENT ON TABLE public.photo_reactions IS
'SECURITY SUMMARY:
- INSERT: Apenas com próprio user_id (auth.uid()::text = user_id)
- SELECT: Bloqueado (USING false) - usar view photo_reaction_counts para dados agregados
- DELETE: Apenas próprias reações (auth.uid()::text = user_id)
- UPDATE: Bloqueado (sem policy)
Objetivo: Proteger privacidade dos usuários enquanto permite funcionalidade de reações.';
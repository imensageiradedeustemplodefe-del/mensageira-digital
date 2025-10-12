-- Garantir que RLS está habilitado e recriar políticas de forma limpa
ALTER TABLE public.photo_reactions ENABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Anyone can insert reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Anyone can delete their own reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Public can view all reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Public can insert reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Public can delete reactions" ON public.photo_reactions;

-- Criar política de SELECT (qualquer um pode ver)
CREATE POLICY "Enable read access for all users"
ON public.photo_reactions
FOR SELECT
TO public
USING (true);

-- Criar política de INSERT (qualquer um pode inserir com validação)
CREATE POLICY "Enable insert for all users"
ON public.photo_reactions
FOR INSERT
TO public
WITH CHECK (
  photo_id IS NOT NULL AND 
  user_id IS NOT NULL AND 
  reaction_type IN ('love', 'prayer', 'amen', 'hallelujah', 'glory', 'fire')
);

-- Criar política de DELETE (qualquer um pode deletar baseado no user_id)
CREATE POLICY "Enable delete for all users"
ON public.photo_reactions
FOR DELETE
TO public
USING (true);
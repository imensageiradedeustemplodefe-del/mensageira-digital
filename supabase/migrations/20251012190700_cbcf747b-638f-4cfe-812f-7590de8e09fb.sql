-- Corrigir políticas RLS para photo_reactions permitir acesso público
-- Primeiro, remove as políticas existentes
DROP POLICY IF EXISTS "Public can view all reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Public can insert reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Public can delete reactions" ON public.photo_reactions;

-- Criar novas políticas que permitem acesso público sem autenticação
CREATE POLICY "Anyone can view reactions"
ON public.photo_reactions
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert reactions"
ON public.photo_reactions
FOR INSERT
WITH CHECK (
  photo_id IS NOT NULL AND 
  length(photo_id) > 0 AND 
  user_id IS NOT NULL AND 
  length(user_id) > 0 AND 
  reaction_type IN ('love', 'prayer', 'amen', 'hallelujah', 'glory', 'fire')
);

CREATE POLICY "Anyone can delete their own reactions"
ON public.photo_reactions
FOR DELETE
USING (user_id IS NOT NULL AND length(user_id) > 0);
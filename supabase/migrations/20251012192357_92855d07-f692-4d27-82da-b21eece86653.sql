-- Desabilitar RLS temporariamente para limpar políticas
ALTER TABLE public.photo_reactions DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Enable read access for all users" ON public.photo_reactions;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.photo_reactions;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.photo_reactions;
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Anyone can insert reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Anyone can delete their own reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Public can view all reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Public can insert reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Public can delete reactions" ON public.photo_reactions;

-- Reabilitar RLS
ALTER TABLE public.photo_reactions ENABLE ROW LEVEL SECURITY;

-- Criar política de SELECT pública (PERMISSIVA)
CREATE POLICY "Public read access"
ON public.photo_reactions
FOR SELECT
TO anon, authenticated
USING (true);

-- Criar política de INSERT pública (PERMISSIVA)
CREATE POLICY "Public insert access"
ON public.photo_reactions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Criar política de DELETE pública (PERMISSIVA)
CREATE POLICY "Public delete access"
ON public.photo_reactions
FOR DELETE
TO anon, authenticated
USING (true);

-- Criar política de UPDATE pública (PERMISSIVA)
CREATE POLICY "Public update access"
ON public.photo_reactions
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);
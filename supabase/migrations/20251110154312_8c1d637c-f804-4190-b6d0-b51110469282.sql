-- First, disable RLS temporarily to check if it's the issue
ALTER TABLE public.photo_reactions DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Allow public to view reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Allow public to add reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Allow public to update reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Allow public to delete reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Public read access" ON public.photo_reactions;
DROP POLICY IF EXISTS "Public insert access" ON public.photo_reactions;
DROP POLICY IF EXISTS "Public update access" ON public.photo_reactions;
DROP POLICY IF EXISTS "Public delete access" ON public.photo_reactions;

-- Re-enable RLS
ALTER TABLE public.photo_reactions ENABLE ROW LEVEL SECURITY;

-- Create new permissive policies that work for all users (anon, authenticated, and service_role)
CREATE POLICY "Enable read access for all users"
  ON public.photo_reactions
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON public.photo_reactions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON public.photo_reactions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON public.photo_reactions
  FOR DELETE
  USING (true);
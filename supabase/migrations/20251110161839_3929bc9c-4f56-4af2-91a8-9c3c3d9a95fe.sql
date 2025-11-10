-- Fix photo_reactions RLS policies by ensuring they are PERMISSIVE
-- First, drop all existing policies
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.photo_reactions;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.photo_reactions;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.photo_reactions;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.photo_reactions;

-- Ensure RLS is enabled
ALTER TABLE public.photo_reactions ENABLE ROW LEVEL SECURITY;

-- Create new PERMISSIVE policies (default type)
-- These policies use 'true' to allow all operations for everyone (anon and authenticated)
CREATE POLICY "Public can view all reactions"
  ON public.photo_reactions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can add reactions"
  ON public.photo_reactions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can update reactions"
  ON public.photo_reactions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete reactions"
  ON public.photo_reactions
  FOR DELETE
  TO anon, authenticated
  USING (true);
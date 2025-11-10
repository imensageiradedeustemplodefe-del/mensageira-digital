-- Drop existing policies
DROP POLICY IF EXISTS "Public read access" ON public.photo_reactions;
DROP POLICY IF EXISTS "Public insert access" ON public.photo_reactions;
DROP POLICY IF EXISTS "Public update access" ON public.photo_reactions;
DROP POLICY IF EXISTS "Public delete access" ON public.photo_reactions;

-- Recreate policies with proper public access
CREATE POLICY "Allow public to view reactions"
  ON public.photo_reactions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public to add reactions"
  ON public.photo_reactions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public to update reactions"
  ON public.photo_reactions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public to delete reactions"
  ON public.photo_reactions
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE public.photo_reactions ENABLE ROW LEVEL SECURITY;
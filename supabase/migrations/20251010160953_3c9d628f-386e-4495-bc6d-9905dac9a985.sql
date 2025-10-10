-- Drop all existing policies on photo_reactions
DROP POLICY IF EXISTS "Anon can view all reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Anon can insert reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Anon can delete reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Authenticated can view all reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Authenticated can insert reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Authenticated can delete reactions" ON public.photo_reactions;

-- Create permissive policies that work for all users (including anonymous)
CREATE POLICY "Allow all to view reactions"
ON public.photo_reactions
FOR SELECT
USING (true);

CREATE POLICY "Allow all to insert reactions"
ON public.photo_reactions
FOR INSERT
WITH CHECK (
  user_id IS NOT NULL 
  AND length(user_id) > 0 
  AND photo_id IS NOT NULL 
  AND reaction_type IN ('love', 'prayer', 'amen', 'hallelujah', 'glory', 'fire')
);

CREATE POLICY "Allow all to delete reactions"
ON public.photo_reactions
FOR DELETE
USING (user_id IS NOT NULL);
-- Fix RLS policies for photo_reactions to work with both anon and authenticated users

-- Drop existing public policies
DROP POLICY IF EXISTS "Public can view all reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Public can insert reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Public can delete reactions by user_id" ON public.photo_reactions;

-- Create policies for anon (unauthenticated) users
CREATE POLICY "Anon can view all reactions"
ON public.photo_reactions
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Anon can insert reactions"
ON public.photo_reactions
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NOT NULL 
  AND length(user_id) > 0 
  AND photo_id IS NOT NULL 
  AND reaction_type IN ('love', 'prayer', 'amen', 'hallelujah', 'glory', 'fire')
);

CREATE POLICY "Anon can delete reactions"
ON public.photo_reactions
FOR DELETE
TO anon
USING (user_id IS NOT NULL);

-- Create policies for authenticated users
CREATE POLICY "Authenticated can view all reactions"
ON public.photo_reactions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert reactions"
ON public.photo_reactions
FOR INSERT
TO authenticated
WITH CHECK (
  user_id IS NOT NULL 
  AND length(user_id) > 0 
  AND photo_id IS NOT NULL 
  AND reaction_type IN ('love', 'prayer', 'amen', 'hallelujah', 'glory', 'fire')
);

CREATE POLICY "Authenticated can delete reactions"
ON public.photo_reactions
FOR DELETE
TO authenticated
USING (user_id IS NOT NULL);
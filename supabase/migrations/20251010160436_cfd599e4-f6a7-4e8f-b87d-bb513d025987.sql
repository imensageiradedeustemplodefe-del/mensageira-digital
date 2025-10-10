-- Fix RLS policies for photo_reactions to allow public access

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view all reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Anyone can insert reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Anyone can delete their own reactions" ON public.photo_reactions;

-- Create new policies that allow public (unauthenticated) access
CREATE POLICY "Public can view all reactions"
ON public.photo_reactions
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public can insert reactions"
ON public.photo_reactions
FOR INSERT
TO public
WITH CHECK (
  user_id IS NOT NULL 
  AND length(user_id) > 0 
  AND photo_id IS NOT NULL 
  AND reaction_type IN ('love', 'prayer', 'amen', 'hallelujah', 'glory', 'fire')
);

CREATE POLICY "Public can delete reactions by user_id"
ON public.photo_reactions
FOR DELETE
TO public
USING (user_id IS NOT NULL);
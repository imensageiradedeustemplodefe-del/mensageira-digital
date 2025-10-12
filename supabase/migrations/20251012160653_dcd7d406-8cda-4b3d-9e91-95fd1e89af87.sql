-- Drop all existing policies on photo_reactions
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Anyone can add reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Users can delete own reactions" ON public.photo_reactions;

-- Create comprehensive policies that allow all operations
-- Allow anyone (authenticated or not) to view all reactions
CREATE POLICY "Public can view all reactions"
ON public.photo_reactions
FOR SELECT
USING (true);

-- Allow anyone to insert reactions with validation
CREATE POLICY "Public can insert reactions"
ON public.photo_reactions
FOR INSERT
WITH CHECK (
  user_id IS NOT NULL 
  AND length(user_id) > 0 
  AND photo_id IS NOT NULL
  AND length(photo_id) > 0
  AND reaction_type IN ('love', 'prayer', 'amen', 'hallelujah', 'glory', 'fire')
);

-- Allow anyone to delete reactions (they have the user_id from localStorage)
CREATE POLICY "Public can delete reactions"
ON public.photo_reactions
FOR DELETE
USING (
  user_id IS NOT NULL
  AND length(user_id) > 0
);
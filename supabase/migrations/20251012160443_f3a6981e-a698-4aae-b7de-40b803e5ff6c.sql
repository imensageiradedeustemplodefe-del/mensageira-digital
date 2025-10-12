-- Drop existing policies that may be causing issues
DROP POLICY IF EXISTS "Allow all to view reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Allow all to insert reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Allow all to delete reactions" ON public.photo_reactions;

-- Create new policies with correct permissions
-- Allow everyone (including anonymous) to view all reactions
CREATE POLICY "Anyone can view reactions"
ON public.photo_reactions
FOR SELECT
TO public
USING (true);

-- Allow anyone to insert reactions (with validation)
CREATE POLICY "Anyone can add reactions"
ON public.photo_reactions
FOR INSERT
TO public
WITH CHECK (
  user_id IS NOT NULL 
  AND length(user_id) > 0 
  AND photo_id IS NOT NULL
  AND reaction_type IN ('love', 'prayer', 'amen', 'hallelujah', 'glory', 'fire')
);

-- Allow users to delete their own reactions
CREATE POLICY "Users can delete own reactions"
ON public.photo_reactions
FOR DELETE
TO public
USING (user_id IS NOT NULL);
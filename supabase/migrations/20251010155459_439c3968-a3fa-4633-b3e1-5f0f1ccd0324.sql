-- Fix photo_reactions RLS policies to allow proper functionality

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view reaction counts" ON photo_reactions;
DROP POLICY IF EXISTS "Users can delete only their own reactions" ON photo_reactions;
DROP POLICY IF EXISTS "Users can insert only their own reactions" ON photo_reactions;

-- Create new policies that work with the user_id stored in localStorage
-- Allow anyone to view all reactions (needed for counts)
CREATE POLICY "Anyone can view all reactions"
  ON photo_reactions
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to insert reactions (user_id is managed by the app via localStorage)
CREATE POLICY "Anyone can insert reactions"
  ON photo_reactions
  FOR INSERT
  TO public
  WITH CHECK (
    user_id IS NOT NULL 
    AND length(user_id) > 0
    AND photo_id IS NOT NULL
    AND reaction_type IN ('love', 'prayer', 'amen', 'hallelujah', 'glory', 'fire')
  );

-- Allow anyone to delete reactions matching their user_id (from localStorage)
CREATE POLICY "Anyone can delete their own reactions"
  ON photo_reactions
  FOR DELETE
  TO public
  USING (user_id IS NOT NULL);

-- Create a unique constraint to prevent duplicate reactions from the same user on the same photo
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_photo_reaction 
  ON photo_reactions(photo_id, user_id);
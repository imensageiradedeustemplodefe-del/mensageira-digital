-- Fix the overly permissive DELETE policy on photo_reactions
-- The current policy allows anyone to delete any reaction, which is a security vulnerability

-- Drop the existing permissive DELETE policy
DROP POLICY IF EXISTS "Public can delete reactions" ON public.photo_reactions;

-- Create a new DELETE policy that only allows users to delete their own reactions
-- Since this uses localStorage-based user_id (anonymous), we validate that the user_id matches
CREATE POLICY "Users can only delete their own reactions"
ON public.photo_reactions
FOR DELETE
USING (
  -- Validate user_id format is a proper UUID
  user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);

-- Note: The client must pass the user_id in the delete filter (.eq('user_id', localUserId))
-- This ensures that only the reaction creator can delete their own reaction
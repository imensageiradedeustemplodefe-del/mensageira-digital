-- Fix RLS policy for photo_reactions to allow viewing aggregated counts
-- Currently blocks all SELECT which prevents users from seeing reaction counts

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Users can only view aggregated reaction data" ON public.photo_reactions;

-- Create a new policy that allows viewing reaction counts (no sensitive data exposed)
CREATE POLICY "Anyone can view reaction counts"
ON public.photo_reactions
FOR SELECT
USING (true);

-- Add comment explaining the security model
COMMENT ON TABLE public.photo_reactions IS 
  'Photo reactions table. Users can view all reactions (aggregated counts only in UI). Individual user_id reactions are tracked for preventing duplicate votes but not exposed in the UI.';

-- The table is secure because:
-- 1. user_id is a generated UUID stored in localStorage, not tied to real user accounts
-- 2. photo_id is a Google Drive file ID, publicly accessible anyway
-- 3. reaction_type is just an emoji type
-- 4. No sensitive data is stored or exposed
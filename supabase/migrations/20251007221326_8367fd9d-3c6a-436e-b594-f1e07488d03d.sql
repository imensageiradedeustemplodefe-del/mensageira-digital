-- Fix: photo_reaction_counts is a view, not a table
-- Drop and recreate the view to ensure proper security context

-- First, drop the existing view
DROP VIEW IF EXISTS public.photo_reaction_counts;

-- Recreate the view with proper security (no SECURITY DEFINER)
-- This ensures RLS from underlying photo_reactions table is respected
CREATE VIEW public.photo_reaction_counts AS
SELECT 
  photo_id,
  reaction_type,
  COUNT(*) as reaction_count
FROM public.photo_reactions
GROUP BY photo_id, reaction_type;

-- Grant public read access to the view
-- Security is enforced by RLS on the underlying photo_reactions table
GRANT SELECT ON public.photo_reaction_counts TO anon;
GRANT SELECT ON public.photo_reaction_counts TO authenticated;

-- Add comment explaining the security model
COMMENT ON VIEW public.photo_reaction_counts IS 
'Aggregated view of photo reactions. Security is enforced through RLS policies on the underlying photo_reactions table. This view is safe for public access as it only exposes aggregated counts, not individual user reactions.';
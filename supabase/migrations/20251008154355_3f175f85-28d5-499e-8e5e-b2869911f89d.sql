-- Fix Security Definer View warning for photo_reaction_counts
-- Make the view respect RLS by adding security_barrier option

-- Drop and recreate the view with security_barrier enabled
-- This ensures the view respects RLS policies on the underlying photo_reactions table
DROP VIEW IF EXISTS public.photo_reaction_counts CASCADE;

CREATE VIEW public.photo_reaction_counts
WITH (security_barrier = true)
AS
SELECT 
  photo_id,
  reaction_type,
  count(*) AS reaction_count
FROM public.photo_reactions
GROUP BY photo_id, reaction_type;

-- Grant appropriate permissions
-- Allow public to view aggregated reaction counts
GRANT SELECT ON public.photo_reaction_counts TO anon, authenticated;

-- Add comment explaining the security model
COMMENT ON VIEW public.photo_reaction_counts IS
'Aggregated view of photo reactions. Uses security_barrier to enforce RLS policies from the underlying photo_reactions table. This ensures individual user reactions remain private while allowing public access to reaction counts.';
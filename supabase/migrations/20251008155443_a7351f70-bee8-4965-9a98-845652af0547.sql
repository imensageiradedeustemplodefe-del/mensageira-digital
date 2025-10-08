-- Fix Security Definer View warning - use security_invoker instead of security_barrier
-- This ensures the view executes with the calling user's permissions, respecting RLS

-- Drop and recreate the view with security_invoker enabled
DROP VIEW IF EXISTS public.photo_reaction_counts CASCADE;

CREATE VIEW public.photo_reaction_counts
WITH (security_invoker = on)
AS
SELECT 
  photo_id,
  reaction_type,
  count(*) AS reaction_count
FROM public.photo_reactions
GROUP BY photo_id, reaction_type;

-- Grant appropriate permissions
GRANT SELECT ON public.photo_reaction_counts TO anon, authenticated;

-- Add comment explaining the security model
COMMENT ON VIEW public.photo_reaction_counts IS
'Aggregated view of photo reactions. Uses security_invoker to respect RLS policies and execute with the calling user''s permissions. This ensures proper access control while allowing public access to aggregated reaction counts.';
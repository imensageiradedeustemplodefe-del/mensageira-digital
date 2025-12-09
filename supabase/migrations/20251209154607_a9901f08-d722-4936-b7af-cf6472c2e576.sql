-- Grant all permissions on photo_reactions to anon and authenticated roles
GRANT ALL ON public.photo_reactions TO anon;
GRANT ALL ON public.photo_reactions TO authenticated;
GRANT ALL ON public.photo_reactions TO service_role;

-- Also grant on the view for reading aggregated counts
GRANT SELECT ON public.photo_reaction_counts TO anon;
GRANT SELECT ON public.photo_reaction_counts TO authenticated;
GRANT SELECT ON public.photo_reaction_counts TO service_role;
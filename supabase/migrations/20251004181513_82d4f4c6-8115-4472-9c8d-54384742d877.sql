-- Corrigir view para não usar SECURITY DEFINER
-- Recriar view sem SECURITY DEFINER
DROP VIEW IF EXISTS public.photo_reaction_counts;

CREATE VIEW public.photo_reaction_counts 
WITH (security_invoker = true)
AS
SELECT 
  photo_id,
  reaction_type,
  COUNT(*) as reaction_count
FROM public.photo_reactions
GROUP BY photo_id, reaction_type;

-- Garantir permissões corretas
GRANT SELECT ON public.photo_reaction_counts TO anon, authenticated;

-- Documentar segurança
COMMENT ON VIEW public.photo_reaction_counts IS 
'SECURITY: View agregada de reações (security_invoker=true) que não expõe user_id individual. Acesso público apenas para contagens.';
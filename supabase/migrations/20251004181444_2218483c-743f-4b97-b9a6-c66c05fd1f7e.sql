-- ============================================
-- CORREÇÕES DE SEGURANÇA - event_contacts e photo_reactions
-- ============================================

-- 1. CRÍTICO: Remover policy SELECT pública de event_contacts
-- A tabela event_contacts NÃO deve ser acessível publicamente
DROP POLICY IF EXISTS "Anyone can view event contacts" ON public.event_contacts;
DROP POLICY IF EXISTS "Public can view event contacts" ON public.event_contacts;

-- Garantir que APENAS admins podem fazer SELECT
CREATE POLICY "Only admins can view event contacts"
ON public.event_contacts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 2. Revisar photo_reactions - garantir que user_id não seja exposto em SELECT
-- Criar view agregada para reações (sem expor user_id)
CREATE OR REPLACE VIEW public.photo_reaction_counts AS
SELECT 
  photo_id,
  reaction_type,
  COUNT(*) as reaction_count
FROM public.photo_reactions
GROUP BY photo_id, reaction_type;

-- Permitir SELECT apenas na view agregada
GRANT SELECT ON public.photo_reaction_counts TO anon, authenticated;

-- 3. Melhorar a função is_admin_user para prevenir bypass
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Verificar se há usuário autenticado
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Buscar role do usuário
  SELECT role INTO user_role
  FROM public.profiles 
  WHERE id = auth.uid()
  LIMIT 1;
  
  -- Verificar se é admin
  RETURN COALESCE(user_role = 'admin', FALSE);
END;
$$;

-- 4. Adicionar policy explícita para bloquear SELECT não autorizado em encrypted_contacts
DROP POLICY IF EXISTS "Block unauthorized access to encrypted contacts" ON public.encrypted_contacts;

CREATE POLICY "Block unauthorized SELECT on encrypted contacts"
ON public.encrypted_contacts
FOR SELECT
USING (
  public.is_admin_user()
);

-- 5. Adicionar comentários de documentação de segurança
COMMENT ON TABLE public.event_contacts IS 
'SECURITY: Contém informações de contato sensíveis. Acesso restrito apenas para admins via RLS.';

COMMENT ON TABLE public.encrypted_contacts IS 
'SECURITY: Contém dados de contato criptografados. Acesso via função SECURITY DEFINER apenas para admins.';

COMMENT ON FUNCTION public.is_admin_user() IS 
'SECURITY: Função SECURITY DEFINER para verificação segura de role admin. Retorna FALSE se não autenticado.';

COMMENT ON VIEW public.photo_reaction_counts IS 
'SECURITY: View agregada de reações que não expõe user_id individual. Acesso público apenas para contagens.';
-- Fix: Remove SECURITY DEFINER from public data functions
-- These functions query tables/views that already have RLS policies allowing public access
-- Using SECURITY DEFINER bypasses those policies unnecessarily

-- 1. get_public_church_info - Reads from site_settings which already has public RLS
CREATE OR REPLACE FUNCTION public.get_public_church_info()
RETURNS TABLE(
  setting_key text, 
  setting_value text, 
  display_name text, 
  category text
)
LANGUAGE sql
STABLE
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    s.setting_key,
    -- Mask sensitive parts of setting values
    CASE 
      WHEN s.setting_key ILIKE '%email%' THEN 'Disponível no local'
      WHEN s.setting_key ILIKE '%phone%' THEN 'Disponível no local' 
      WHEN s.setting_key ILIKE '%whatsapp%' THEN 'Disponível no local'
      WHEN s.setting_key ILIKE '%address%' THEN 
        CASE 
          WHEN s.setting_value ~ '^[^,]+,' THEN 
            split_part(s.setting_value, ',', 1) || ', [Detalhes disponíveis no local]'
          ELSE 'Disponível no local'
        END
      ELSE s.setting_value
    END as setting_value,
    s.display_name,
    s.category
  FROM public.site_settings s
  WHERE 
    -- Only return settings that are meant to be public
    (s.category IN ('general', 'social', 'schedule'))
    AND 
    -- Allow some basic info but mask sensitive details
    (s.setting_key IN (
      'church_name', 'church_description', 'mission_statement', 
      'service_times', 'weekly_schedule', 'facebook_url', 
      'instagram_url', 'youtube_url', 'website_url', 'city', 'state'
    )
    OR (s.setting_key ILIKE '%address%' AND s.category = 'general')
    OR (s.setting_key ILIKE '%phone%' AND s.category = 'general')
    OR (s.setting_key ILIKE '%email%' AND s.category = 'general'))
  ORDER BY s.category, s.setting_key;
$function$;

-- 2. get_public_prayer_requests - Reads from public_prayer_requests which has public RLS
CREATE OR REPLACE FUNCTION public.get_public_prayer_requests()
RETURNS TABLE(
  id uuid, 
  display_name text, 
  request_text text, 
  category text, 
  is_urgent boolean, 
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    pr.id,
    COALESCE(pr.display_name, 'Anônimo') as display_name,
    pr.request_text,
    pr.category,
    pr.is_urgent,
    pr.created_at
  FROM public_prayer_requests pr
  WHERE pr.display_name IS NOT NULL
  ORDER BY pr.created_at DESC;
$function$;

-- 3. get_sanitized_prayer_requests - Also reads from public_prayer_requests
CREATE OR REPLACE FUNCTION public.get_sanitized_prayer_requests()
RETURNS TABLE(
  id uuid, 
  display_name text, 
  request_text text, 
  category text, 
  is_urgent boolean, 
  created_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ppr.id,
    ppr.display_name,
    ppr.request_text,
    ppr.category,
    ppr.is_urgent,
    ppr.created_at
  FROM public.public_prayer_requests ppr
  ORDER BY ppr.created_at DESC;
END;
$function$;

-- Add documentation
COMMENT ON FUNCTION public.get_public_church_info IS 
'Returns public church information with contact details masked. Uses SECURITY INVOKER to respect RLS policies on site_settings table.';

COMMENT ON FUNCTION public.get_public_prayer_requests IS 
'Returns public prayer requests from the public_prayer_requests table. Uses SECURITY INVOKER to respect existing RLS policies.';

COMMENT ON FUNCTION public.get_sanitized_prayer_requests IS 
'Returns sanitized prayer requests. Deprecated - prefer querying public_prayer_requests table directly.';
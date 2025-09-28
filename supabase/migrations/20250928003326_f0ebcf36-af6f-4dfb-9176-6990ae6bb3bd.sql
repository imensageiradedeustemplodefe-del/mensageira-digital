-- Fix security vulnerability: Restrict public access to sensitive contact information
-- Drop the existing overly permissive policy
DROP POLICY "Public can view general settings" ON public.site_settings;

-- Create a more secure policy that explicitly blocks sensitive contact information
CREATE POLICY "Public can view non-sensitive settings only" 
ON public.site_settings 
FOR SELECT 
USING (
  -- Allow only specific non-sensitive categories
  (category IN ('general', 'social', 'schedule')) 
  AND 
  -- Explicitly block sensitive contact information regardless of category
  (setting_key NOT ILIKE '%email%' 
   AND setting_key NOT ILIKE '%phone%' 
   AND setting_key NOT ILIKE '%whatsapp%' 
   AND setting_key NOT ILIKE '%contact%'
   AND setting_key NOT ILIKE '%telefone%'
   AND setting_key NOT ILIKE '%endereco%'
   AND setting_key NOT ILIKE '%address%')
);

-- Create a function to safely get public church information without exposing sensitive data
CREATE OR REPLACE FUNCTION public.get_public_church_info()
RETURNS TABLE(
  setting_key text,
  setting_value text,
  display_name text,
  category text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
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
$$;
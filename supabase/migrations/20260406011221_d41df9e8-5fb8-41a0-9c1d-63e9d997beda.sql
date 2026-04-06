-- Fix 1: Change event_contacts block policy from PERMISSIVE to RESTRICTIVE
DROP POLICY "Block all anonymous access to event contacts" ON event_contacts;
CREATE POLICY "Block all anonymous access to event contacts"
  ON event_contacts
  AS RESTRICTIVE
  FOR ALL
  TO public
  USING (false);

-- Fix 2: Remove google_drive_script_url from public SELECT policy on site_settings
DROP POLICY "Public can view gallery settings" ON site_settings;
CREATE POLICY "Public can view limited settings"
  ON site_settings
  FOR SELECT
  TO public
  USING (setting_key = ANY (ARRAY['church_name'::text, 'church_address'::text, 'church_phone'::text, 'church_email'::text]));

-- Fix 3: Remove google_drive_script_url from get_public_church_info function
CREATE OR REPLACE FUNCTION public.get_public_church_info()
 RETURNS TABLE(setting_key text, setting_value text, display_name text, category text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    s.setting_key,
    CASE 
      WHEN s.setting_key IN (
        'church_email',
        'contact_email_secretary'
      ) THEN 'Disponível no local'
      WHEN s.setting_key IN (
        'church_phone',
        'whatsapp_number'
      ) THEN 'Disponível no local'
      WHEN s.setting_key IN (
        'church_address',
        'contact_address_full'
      ) THEN 
        CASE 
          WHEN s.setting_value IS NULL OR btrim(s.setting_value) = '' THEN ''
          WHEN s.setting_value ~ '^[^,]+,' THEN split_part(s.setting_value, ',', 1) || ', [Detalhes disponíveis no local]'
          ELSE 'Disponível no local'
        END
      ELSE COALESCE(s.setting_value, '')
    END AS setting_value,
    s.display_name,
    s.category
  FROM public.site_settings s
  WHERE s.setting_key = ANY(ARRAY[
    'church_name', 'church_slogan', 'hero_title', 'hero_subtitle', 'hero_description',
    'church_address', 'church_phone', 'church_email', 'contact_email_secretary', 'contact_address_full',
    'facebook_url', 'instagram_url', 'youtube_url', 'website_url', 'whatsapp_number',
    'sunday_service_time', 'wednesday_service_time', 'friday_service_time',
    'live_youtube_id', 'live_facebook_url',
    'church_description', 'mission_statement', 'pastor_name', 'church_founded_year',
    'pastor_principal_name', 'pastor_principal_description',
    'pastora_name', 'pastora_description',
    'pastor_auxiliar_name', 'pastor_auxiliar_description',
    'events_page_title', 'events_page_subtitle', 'events_section_title', 'events_section_description',
    'ministries_section_title', 'ministries_section_description',
    'events_cta_title', 'events_cta_description',
    'prayer_page_title', 'prayer_page_subtitle', 'prayer_form_title',
    'prayer_schedule_title', 'prayer_schedule_description',
    'prayer_team_title', 'prayer_team_description',
    'prayer_confidentiality_title', 'prayer_confidentiality_description',
    'gallery_page_title', 'gallery_page_subtitle',
    'gallery_stats_photos', 'gallery_stats_categories', 'gallery_stats_people',
    'testimonies_page_title', 'testimonies_page_subtitle',
    'testimonies_featured_title', 'testimonies_all_title',
    'testimonies_form_title', 'testimonies_form_description', 'testimonies_empty_message',
    'home_events_title', 'home_events_description',
    'home_visit_title', 'home_visit_description',
    'event_healing_title', 'event_healing_description',
    'event_family_title', 'event_family_description',
    'event_prayer_title', 'event_prayer_description'
  ])
  ORDER BY s.category, s.setting_key;
$function$;
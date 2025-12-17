-- Security hardening: remove brittle public SELECT policy on site_settings and expose only via audited RPC

-- 1) Site settings: remove pattern-based public policy (brittle)
DROP POLICY IF EXISTS "Public can view non-sensitive settings only" ON public.site_settings;

-- 2) Replace get_public_church_info with SECURITY DEFINER and explicit allowlist
--    This keeps the same RPC signature used by the frontend, but no longer relies on table RLS.
CREATE OR REPLACE FUNCTION public.get_public_church_info()
RETURNS TABLE(setting_key text, setting_value text, display_name text, category text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    s.setting_key,
    CASE 
      -- Mask contact-like values, but still indicate availability
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
    -- General / UI
    'church_name',
    'church_slogan',
    'hero_title',
    'hero_subtitle',
    'hero_description',

    -- Contact (masked)
    'church_address',
    'church_phone',
    'church_email',
    'contact_email_secretary',
    'contact_address_full',

    -- Social
    'facebook_url',
    'instagram_url',
    'youtube_url',
    'website_url',
    'whatsapp_number',

    -- Schedule
    'sunday_service_time',
    'wednesday_service_time',
    'friday_service_time',

    -- Live
    'live_youtube_id',
    'live_facebook_url',

    -- About
    'church_description',
    'mission_statement',
    'pastor_name',
    'church_founded_year',
    'pastor_principal_name',
    'pastor_principal_description',
    'pastora_name',
    'pastora_description',
    'pastor_auxiliar_name',
    'pastor_auxiliar_description',

    -- Pages Content (safe text content)
    'events_page_title',
    'events_page_subtitle',
    'events_section_title',
    'events_section_description',
    'ministries_section_title',
    'ministries_section_description',
    'events_cta_title',
    'events_cta_description',

    'prayer_page_title',
    'prayer_page_subtitle',
    'prayer_form_title',
    'prayer_schedule_title',
    'prayer_schedule_description',
    'prayer_team_title',
    'prayer_team_description',
    'prayer_confidentiality_title',
    'prayer_confidentiality_description',

    'gallery_page_title',
    'gallery_page_subtitle',
    'gallery_stats_photos',
    'gallery_stats_categories',
    'gallery_stats_people',

    'testimonies_page_title',
    'testimonies_page_subtitle',
    'testimonies_featured_title',
    'testimonies_all_title',
    'testimonies_form_title',
    'testimonies_form_description',
    'testimonies_empty_message',

    'home_events_title',
    'home_events_description',
    'home_visit_title',
    'home_visit_description',

    'event_healing_title',
    'event_healing_description',
    'event_family_title',
    'event_family_description',
    'event_prayer_title',
    'event_prayer_description',

    -- Gallery integration (required by public Gallery page)
    'google_drive_script_url'
  ])
  ORDER BY s.category, s.setting_key;
$$;

-- 3) Event registrations: add server-side validation for registration_data
CREATE OR REPLACE FUNCTION public.validate_event_registration_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  kv record;
  v_text text;
BEGIN
  IF NEW.registration_data IS NULL THEN
    RAISE EXCEPTION 'registration_data is required';
  END IF;

  IF jsonb_typeof(NEW.registration_data) <> 'object' THEN
    RAISE EXCEPTION 'registration_data must be a JSON object';
  END IF;

  -- Prevent abuse via oversized payloads
  IF length(NEW.registration_data::text) > 20000 THEN
    RAISE EXCEPTION 'registration_data too large';
  END IF;

  FOR kv IN SELECT * FROM jsonb_each(NEW.registration_data)
  LOOP
    IF length(kv.key) > 100 THEN
      RAISE EXCEPTION 'Field name too long';
    END IF;

    IF jsonb_typeof(kv.value) = 'string' THEN
      v_text := btrim(kv.value #>> '{}');
      IF length(v_text) > 2000 THEN
        RAISE EXCEPTION 'Field "%" is too long', kv.key;
      END IF;
    ELSIF jsonb_typeof(kv.value) IN ('object','array') THEN
      RAISE EXCEPTION 'Nested values are not allowed in registration_data';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_validate_event_registration_data ON public.event_registrations;
CREATE TRIGGER trigger_validate_event_registration_data
BEFORE INSERT OR UPDATE ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.validate_event_registration_data();

-- 4) Defense-in-depth: ensure store_encrypted_contact enforces admin authorization internally
CREATE OR REPLACE FUNCTION public.store_encrypted_contact(
  p_prayer_request_id uuid,
  p_encrypted_email text DEFAULT NULL::text,
  p_encrypted_phone text DEFAULT NULL::text,
  p_key_hash text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  contact_id uuid;
BEGIN
  -- Defense-in-depth: only admins can store encrypted contact data
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Ensure prayer request exists
  PERFORM 1 FROM public.prayer_requests pr WHERE pr.id = p_prayer_request_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prayer request not found';
  END IF;

  -- Validate key hash strength
  IF p_key_hash IS NULL OR length(p_key_hash) < 32 OR p_key_hash = 'default_key' THEN
    RAISE EXCEPTION 'Invalid or weak encryption key hash. Must be at least 32 characters and not a default value.'
      USING HINT = 'Use a cryptographically secure hash of the encryption key';
  END IF;

  -- Validate that at least one contact method is provided
  IF p_encrypted_email IS NULL AND p_encrypted_phone IS NULL THEN
    RAISE EXCEPTION 'At least one contact method (email or phone) must be provided';
  END IF;

  -- Insert encrypted contact data
  INSERT INTO public.encrypted_contacts (
    prayer_request_id,
    encrypted_email,
    encrypted_phone,
    encryption_key_hash
  ) VALUES (
    p_prayer_request_id,
    p_encrypted_email,
    p_encrypted_phone,
    p_key_hash
  ) RETURNING id INTO contact_id;

  -- Update has_contact_info flag
  UPDATE public.prayer_requests
  SET has_contact_info = true
  WHERE id = p_prayer_request_id;

  RETURN contact_id;
END;
$$;

-- Fix: Remove SECURITY DEFINER from functions that don't need it

-- 1. sanitize_prayer_request_for_public - This is a pure text processing function
-- It doesn't access any tables, so SECURITY DEFINER is unnecessary
CREATE OR REPLACE FUNCTION public.sanitize_prayer_request_for_public(
  p_name text, 
  p_email text DEFAULT NULL::text, 
  p_phone text DEFAULT NULL::text
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Return only first name or a generic identifier
  IF p_name IS NULL OR trim(p_name) = '' THEN
    RETURN 'Anônimo';
  END IF;
  
  -- Return only first word (first name) to protect privacy
  RETURN split_part(trim(p_name), ' ', 1);
END;
$function$;

-- 2. user_has_reacted - Should respect RLS and only check current user's reactions
-- Changed to SECURITY INVOKER so it respects photo_reactions RLS policies
CREATE OR REPLACE FUNCTION public.user_has_reacted(
  p_photo_id text, 
  p_user_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow checking if the querying user matches the user_id parameter
  -- This prevents users from checking other users' reactions
  IF auth.uid()::text != p_user_id THEN
    RETURN false;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.photo_reactions
    WHERE photo_id = p_photo_id AND user_id = p_user_id
  );
END;
$function$;

COMMENT ON FUNCTION public.sanitize_prayer_request_for_public IS 
'Pure text processing function that extracts first name for privacy. Does not access database tables.';

COMMENT ON FUNCTION public.user_has_reacted IS 
'Checks if current authenticated user has reacted to a photo. Respects RLS policies and prevents checking other users reactions.';
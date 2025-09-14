-- Drop and recreate the public_prayer_requests view with SECURITY INVOKER to fix security issue
DROP VIEW IF EXISTS public.public_prayer_requests;

CREATE VIEW public.public_prayer_requests 
WITH (security_invoker = true) AS
SELECT 
  id,
  name as display_name,
  request_text,
  category,
  is_urgent,
  created_at
FROM public.prayer_requests 
WHERE is_approved = true 
  AND allow_public_share = true
ORDER BY created_at DESC;

-- Grant SELECT permissions to anonymous and authenticated users
GRANT SELECT ON public.public_prayer_requests TO anon;
GRANT SELECT ON public.public_prayer_requests TO authenticated;
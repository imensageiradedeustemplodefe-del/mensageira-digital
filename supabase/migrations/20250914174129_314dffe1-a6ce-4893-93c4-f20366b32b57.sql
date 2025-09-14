-- Drop and recreate the public_prayer_requests view to include only requests that allow public sharing
DROP VIEW IF EXISTS public.public_prayer_requests;

CREATE VIEW public.public_prayer_requests AS
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
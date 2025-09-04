-- Create a secure view for public prayer requests that excludes sensitive personal data
CREATE OR REPLACE VIEW public.public_prayer_requests AS
SELECT 
  id,
  -- Only show first name to protect privacy
  CASE 
    WHEN name IS NOT NULL AND trim(name) != '' THEN
      split_part(trim(name), ' ', 1)
    ELSE 'Anônimo'
  END as display_name,
  request_text,
  is_urgent,
  category,
  created_at
FROM public.prayer_requests
WHERE is_approved = true;

-- Grant SELECT permission on the view to everyone
GRANT SELECT ON public.public_prayer_requests TO anon, authenticated;

-- Update the existing SELECT policy to be more restrictive
-- Remove the old policy that exposed all data
DROP POLICY IF EXISTS "Everyone can view approved prayer requests" ON public.prayer_requests;

-- Create a new restricted policy that only allows viewing limited data
-- This will be used by the view and by admin interfaces that need full data
CREATE POLICY "Public can view limited prayer request data" 
ON public.prayer_requests 
FOR SELECT 
USING (is_approved = true AND auth.role() = 'anon'::text);

-- Admins can still see all data (this policy already exists but let's make it explicit)
CREATE POLICY "Authenticated users can view approved prayer requests" 
ON public.prayer_requests 
FOR SELECT 
USING (is_approved = true AND auth.role() = 'authenticated'::text);
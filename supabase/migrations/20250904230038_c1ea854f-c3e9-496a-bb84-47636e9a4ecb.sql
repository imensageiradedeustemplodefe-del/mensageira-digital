-- Drop the problematic view and recreate it properly
DROP VIEW IF EXISTS public.public_prayer_requests;

-- Create a secure view WITHOUT security definer (safer approach)
CREATE VIEW public.public_prayer_requests AS
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

-- Set proper RLS on the view
ALTER VIEW public.public_prayer_requests SET (security_invoker = true);

-- Grant SELECT permission on the view 
GRANT SELECT ON public.public_prayer_requests TO anon, authenticated;

-- Simplify the RLS policies - remove the problematic auth.role() conditions
DROP POLICY IF EXISTS "Public can view limited prayer request data" ON public.prayer_requests;
DROP POLICY IF EXISTS "Authenticated users can view approved prayer requests" ON public.prayer_requests;

-- Create a simple policy that works with the view
CREATE POLICY "Everyone can view approved prayer requests through view" 
ON public.prayer_requests 
FOR SELECT 
USING (is_approved = true);
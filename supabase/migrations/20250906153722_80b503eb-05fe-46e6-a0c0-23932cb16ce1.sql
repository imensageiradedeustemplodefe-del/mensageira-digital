-- SECURITY FIX: Remove dangerous public access to prayer_requests table
-- This prevents public access to sensitive personal data (emails, phones, full names)

-- Remove the policy that allows public access to prayer_requests table
DROP POLICY IF EXISTS "Everyone can view approved non-completed prayer requests" ON public.prayer_requests;

-- Ensure public_prayer_requests view/table exists and is properly configured
-- This should only contain safe, anonymized data for public viewing

-- Add RLS policy to ensure only authenticated admins can read the full prayer_requests table
CREATE POLICY "Only admins can view prayer requests with personal data" 
ON public.prayer_requests 
FOR SELECT 
TO authenticated
USING (EXISTS ( 
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Ensure public_prayer_requests table has proper RLS
ALTER TABLE public.public_prayer_requests ENABLE ROW LEVEL SECURITY;

-- Allow public access to the safe, anonymized public_prayer_requests view
CREATE POLICY IF NOT EXISTS "Public can view anonymized prayer requests" 
ON public.public_prayer_requests 
FOR SELECT 
TO public, anon
USING (true);
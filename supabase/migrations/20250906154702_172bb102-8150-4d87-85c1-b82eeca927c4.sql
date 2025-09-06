-- SECURITY FIX: Remove dangerous public access to prayer_requests table
-- This prevents public access to sensitive personal data (emails, phones, full names)

-- Remove the policy that allows public access to prayer_requests table
DROP POLICY IF EXISTS "Everyone can view approved non-completed prayer requests" ON public.prayer_requests;

-- Add secure RLS policy: only authenticated admins can read the full prayer_requests table
CREATE POLICY "Only admins can view prayer requests with personal data" 
ON public.prayer_requests 
FOR SELECT 
TO authenticated
USING (EXISTS ( 
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Note: public_prayer_requests is a VIEW that should only contain safe, anonymized data
-- Views inherit permissions from their underlying tables, so securing prayer_requests secures the view
-- The view should only show: display_name (not full name), request_text, category, created_at, is_urgent, id
-- No sensitive data like email, phone, or full names should be accessible through this view
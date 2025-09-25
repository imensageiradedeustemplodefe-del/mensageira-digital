-- Secure the prayer_requests table with stricter RLS policies
-- Drop existing policies to recreate them with better security

DROP POLICY IF EXISTS "Limited public prayer submission" ON public.prayer_requests;
DROP POLICY IF EXISTS "Admins can view all prayer requests" ON public.prayer_requests;
DROP POLICY IF EXISTS "Admins can manage prayer requests" ON public.prayer_requests;

-- Create a security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Recreate policies with stricter security

-- Policy 1: Allow public to submit prayer requests (INSERT only, no SELECT)
CREATE POLICY "Public can submit prayer requests"
ON public.prayer_requests
FOR INSERT
WITH CHECK (
  -- Strict validation for public submissions
  name IS NOT NULL AND 
  request_text IS NOT NULL AND 
  length(TRIM(name)) > 0 AND 
  length(TRIM(request_text)) >= 10 AND 
  length(TRIM(request_text)) <= 2000 AND
  -- Email validation if provided
  (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') AND
  -- Phone validation if provided  
  (phone IS NULL OR phone ~* '^[\d\s\-\(\)\+]{10,20}$') AND
  -- Category validation
  (category IS NULL OR category = ANY (ARRAY['geral', 'saude', 'familia', 'trabalho', 'espiritual', 'financeiro']))
);

-- Policy 2: Only admins can view prayer requests (protects sensitive email/phone data)
CREATE POLICY "Only admins can view prayer requests"
ON public.prayer_requests
FOR SELECT
USING (public.is_admin_user());

-- Policy 3: Only admins can update prayer requests
CREATE POLICY "Only admins can update prayer requests"
ON public.prayer_requests
FOR UPDATE
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Policy 4: Only admins can delete prayer requests
CREATE POLICY "Only admins can delete prayer requests"
ON public.prayer_requests
FOR DELETE
USING (public.is_admin_user());

-- Add additional security function to sanitize data for public access
CREATE OR REPLACE FUNCTION public.get_sanitized_prayer_requests()
RETURNS TABLE(
  id uuid,
  display_name text,
  request_text text,
  category text,
  is_urgent boolean,
  created_at timestamp with time zone
) AS $$
BEGIN
  -- Only return data from the secure public_prayer_requests view
  -- This ensures no sensitive personal information is exposed
  RETURN QUERY
  SELECT 
    ppr.id,
    ppr.display_name,
    ppr.request_text,
    ppr.category,
    ppr.is_urgent,
    ppr.created_at
  FROM public.public_prayer_requests ppr
  ORDER BY ppr.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;
-- Enhanced security for encrypted_contacts table
-- Fix: Make RLS policies more restrictive and explicit

-- Drop existing policies
DROP POLICY IF EXISTS "Block unauthorized SELECT on encrypted contacts" ON public.encrypted_contacts;
DROP POLICY IF EXISTS "Only admins can access encrypted contacts" ON public.encrypted_contacts;

-- Create more restrictive policies that require authentication FIRST
-- Then check admin status via the is_admin_user() function

-- Policy 1: Explicitly block all anonymous access
CREATE POLICY "Block all anonymous access to encrypted contacts"
ON public.encrypted_contacts
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Policy 2: Allow authenticated users only if they are admins
CREATE POLICY "Authenticated admins can SELECT encrypted contacts"
ON public.encrypted_contacts
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND public.is_admin_user()
);

-- Policy 3: Allow authenticated admins to INSERT
CREATE POLICY "Authenticated admins can INSERT encrypted contacts"
ON public.encrypted_contacts
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.is_admin_user()
);

-- Policy 4: Allow authenticated admins to UPDATE
CREATE POLICY "Authenticated admins can UPDATE encrypted contacts"
ON public.encrypted_contacts
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND public.is_admin_user()
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.is_admin_user()
);

-- Policy 5: Allow authenticated admins to DELETE
CREATE POLICY "Authenticated admins can DELETE encrypted contacts"
ON public.encrypted_contacts
FOR DELETE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND public.is_admin_user()
);

-- Add table comment documenting security model
COMMENT ON TABLE public.encrypted_contacts IS 
'Stores encrypted contact information (email, phone) for prayer requests. 
Access is strictly limited to authenticated admin users only. 
Uses AES-GCM encryption with keys stored in Supabase secrets.';

-- Verify RLS is still enabled
ALTER TABLE public.encrypted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encrypted_contacts FORCE ROW LEVEL SECURITY;
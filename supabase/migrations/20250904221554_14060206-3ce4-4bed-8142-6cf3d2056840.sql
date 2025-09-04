-- URGENT SECURITY FIX: Remove insecure public access to admin credentials
-- This fixes a critical security vulnerability where admin credentials were publicly accessible

-- Step 1: Drop the insecure policy that exposes admin credentials publicly
DROP POLICY IF EXISTS "Anyone can view admin users for login" ON admin_users;

-- Step 2: Create secure RLS policies for admin_users table
-- Only allow admins to view admin users (for management purposes)
CREATE POLICY "Only authenticated admins can view admin users"
ON admin_users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Step 3: Create secure admin management policies
CREATE POLICY "Only authenticated admins can manage admin users"
ON admin_users
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Step 4: Create admin users in the auth system
-- Insert admin users into auth.users with proper email/password auth
-- Note: These will need to be updated with real email addresses

-- Create profiles for existing admin users with admin role
INSERT INTO profiles (id, email, role) 
SELECT 
  gen_random_uuid(),
  lower(username) || '@mensageiradedeustemplodefe.com',
  'admin'
FROM admin_users
WHERE NOT EXISTS (
  SELECT 1 FROM profiles 
  WHERE email = lower(admin_users.username) || '@mensageiradedeustemplodefe.com'
);

-- Step 5: Add a secure function for admin authentication verification
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Step 6: Update site_settings policy to use the secure function
DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;
CREATE POLICY "Admins can manage site settings"
ON site_settings
FOR ALL
USING (public.is_admin());

-- The admin_users table is now secured and will be deprecated
-- in favor of Supabase's native authentication system
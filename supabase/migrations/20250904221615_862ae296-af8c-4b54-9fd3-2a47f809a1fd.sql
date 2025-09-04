-- URGENT SECURITY FIX: Immediately remove public access to admin credentials
-- This is a critical security vulnerability that must be fixed NOW

-- Step 1: Drop the extremely insecure policy that exposes admin credentials to everyone
DROP POLICY IF EXISTS "Anyone can view admin users for login" ON admin_users;

-- Step 2: Temporarily block ALL access to admin_users table until proper migration
-- This prevents any public access while we set up secure authentication
CREATE POLICY "Block all access to admin_users during security migration"
ON admin_users
FOR ALL
USING (false);
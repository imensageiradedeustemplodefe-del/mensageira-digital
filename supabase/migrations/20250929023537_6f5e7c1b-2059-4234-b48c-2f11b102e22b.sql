-- CRITICAL SECURITY FIX: Remove admin_users table with plaintext passwords
-- This table contains plaintext passwords which is a major security vulnerability
-- The application already uses Supabase Auth with the profiles table for admin authentication
-- This table is redundant and poses a security risk

-- Drop the vulnerable admin_users table entirely  
-- This eliminates the security risk completely
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- Add a comment documenting the security fix
COMMENT ON SCHEMA public IS 'admin_users table removed for security - app uses Supabase Auth + profiles system';
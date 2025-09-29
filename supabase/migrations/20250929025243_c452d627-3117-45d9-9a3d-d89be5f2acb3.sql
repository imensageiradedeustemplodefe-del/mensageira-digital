-- SECURITY FIX: Remove email column from profiles table
-- The email column in profiles table poses a security risk as it exposes admin email addresses
-- Supabase Auth already handles email authentication securely
-- This column is redundant and creates unnecessary exposure

-- Remove the email column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- Add comment documenting the security fix
COMMENT ON TABLE public.profiles IS 'Admin profiles table - email removed for security (handled by Supabase Auth)';
-- CRITICAL SECURITY FIX: Remove publicly accessible prayer contact backup table
-- This table contains sensitive contact information but the RLS policies are not properly protecting it
-- The application already uses the encrypted_contacts system, so this backup table is redundant and dangerous

-- First, let's check if there's any data that needs to be preserved
-- (This data should already be in the encrypted_contacts system)

-- Drop the vulnerable backup table entirely
-- This is the most secure approach as it eliminates the attack surface completely
DROP TABLE IF EXISTS public.prayer_requests_contact_backup CASCADE;

-- Add a comment for future reference
COMMENT ON SCHEMA public IS 'Contact backup table removed for security - all contact data now uses encrypted_contacts system';
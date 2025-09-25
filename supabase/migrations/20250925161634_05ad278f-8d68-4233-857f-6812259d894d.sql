-- First, drop the existing policy that depends on email column
DROP POLICY IF EXISTS "Public can submit prayer requests" ON public.prayer_requests;

-- Create new policy without email/phone validation (we'll handle this in application layer)
CREATE POLICY "Public can submit prayer requests (secure)"
ON public.prayer_requests
FOR INSERT
WITH CHECK (
  -- Basic validation without sensitive data
  name IS NOT NULL AND 
  request_text IS NOT NULL AND 
  length(TRIM(name)) > 0 AND 
  length(TRIM(request_text)) >= 10 AND 
  length(TRIM(request_text)) <= 2000 AND
  -- Category validation
  (category IS NULL OR category = ANY (ARRAY['geral', 'saude', 'familia', 'trabalho', 'espiritual', 'financeiro']))
);

-- Create secure encrypted contacts table for sensitive personal information
CREATE TABLE IF NOT EXISTS public.encrypted_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_request_id uuid NOT NULL,
  encrypted_email text,
  encrypted_phone text,
  encryption_key_hash text NOT NULL DEFAULT 'default_key',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on encrypted_contacts table
ALTER TABLE public.encrypted_contacts ENABLE ROW LEVEL SECURITY;

-- Create strict policies - only admins can access encrypted data
CREATE POLICY "Only admins can access encrypted contacts"
ON public.encrypted_contacts
FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Add reference column to prayer_requests before removing sensitive columns
ALTER TABLE public.prayer_requests 
ADD COLUMN IF NOT EXISTS has_contact_info boolean DEFAULT false;

-- Create backup of sensitive data before removal (for potential recovery)
CREATE TABLE IF NOT EXISTS public.prayer_requests_contact_backup AS 
SELECT id, email, phone FROM public.prayer_requests 
WHERE email IS NOT NULL OR phone IS NOT NULL;

-- Update existing records that have email or phone
UPDATE public.prayer_requests 
SET has_contact_info = true 
WHERE email IS NOT NULL OR phone IS NOT NULL;

-- Now safely remove the sensitive columns
ALTER TABLE public.prayer_requests DROP COLUMN IF EXISTS email CASCADE;
ALTER TABLE public.prayer_requests DROP COLUMN IF EXISTS phone CASCADE;
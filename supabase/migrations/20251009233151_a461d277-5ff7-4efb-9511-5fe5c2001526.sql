-- Remove insecure default value and add validation for encryption_key_hash
-- This prevents the use of weak or default encryption key hashes

-- First, remove the insecure default value from the column
ALTER TABLE public.encrypted_contacts 
  ALTER COLUMN encryption_key_hash DROP DEFAULT;

-- Add a check constraint to prevent weak key hashes
ALTER TABLE public.encrypted_contacts 
  ADD CONSTRAINT encryption_key_hash_not_weak 
  CHECK (
    encryption_key_hash IS NOT NULL 
    AND encryption_key_hash != 'default_key'
    AND length(encryption_key_hash) >= 32
  );

-- Update the store_encrypted_contact function to require a strong key hash
CREATE OR REPLACE FUNCTION public.store_encrypted_contact(
  p_prayer_request_id uuid,
  p_encrypted_email text DEFAULT NULL,
  p_encrypted_phone text DEFAULT NULL,
  p_key_hash text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  contact_id uuid;
BEGIN
  -- Validate key hash strength
  IF p_key_hash IS NULL OR length(p_key_hash) < 32 OR p_key_hash = 'default_key' THEN
    RAISE EXCEPTION 'Invalid or weak encryption key hash. Must be at least 32 characters and not a default value.'
      USING HINT = 'Use a cryptographically secure hash of the encryption key';
  END IF;

  -- Validate that at least one contact method is provided
  IF p_encrypted_email IS NULL AND p_encrypted_phone IS NULL THEN
    RAISE EXCEPTION 'At least one contact method (email or phone) must be provided';
  END IF;
  
  -- Insert encrypted contact data
  INSERT INTO public.encrypted_contacts (
    prayer_request_id,
    encrypted_email,
    encrypted_phone,
    encryption_key_hash
  ) VALUES (
    p_prayer_request_id,
    p_encrypted_email,
    p_encrypted_phone,
    p_key_hash
  ) RETURNING id INTO contact_id;
  
  -- Update has_contact_info flag
  UPDATE public.prayer_requests 
  SET has_contact_info = true 
  WHERE id = p_prayer_request_id;
  
  RETURN contact_id;
END;
$$;

-- Add comment explaining the security requirement
COMMENT ON COLUMN public.encrypted_contacts.encryption_key_hash IS 
  'Cryptographic hash of the encryption key. Must be at least 32 characters. Never store actual encryption keys in the database.';

-- Log the security improvement
DO $$
BEGIN
  RAISE NOTICE 'Security improvement applied: Removed insecure default encryption key hash and added validation constraints';
END $$;
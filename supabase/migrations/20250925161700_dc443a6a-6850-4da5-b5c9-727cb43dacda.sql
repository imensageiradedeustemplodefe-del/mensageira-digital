-- Enable RLS on the backup table (it was created without RLS)
ALTER TABLE public.prayer_requests_contact_backup ENABLE ROW LEVEL SECURITY;

-- Add admin-only policy for the backup table
CREATE POLICY "Only admins can access backup data"
ON public.prayer_requests_contact_backup
FOR ALL
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- Now complete the secure contact handling setup
-- Create secure functions for encrypted contact operations
CREATE OR REPLACE FUNCTION public.store_encrypted_contact(
  p_prayer_request_id uuid,
  p_encrypted_email text DEFAULT NULL,
  p_encrypted_phone text DEFAULT NULL,
  p_key_hash text DEFAULT 'default_key'
)
RETURNS uuid AS $$
DECLARE
  contact_id uuid;
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create secure function to retrieve encrypted contact data (admin only)
CREATE OR REPLACE FUNCTION public.get_encrypted_contact(p_prayer_request_id uuid)
RETURNS TABLE(
  encrypted_email text,
  encrypted_phone text,
  encryption_key_hash text
) AS $$
BEGIN
  -- Verify admin access
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Unauthorized access to encrypted data';
  END IF;
  
  RETURN QUERY
  SELECT 
    ec.encrypted_email,
    ec.encrypted_phone,
    ec.encryption_key_hash
  FROM public.encrypted_contacts ec
  WHERE ec.prayer_request_id = p_prayer_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add foreign key constraint and indexes
ALTER TABLE public.encrypted_contacts 
ADD CONSTRAINT fk_encrypted_contacts_prayer_request 
FOREIGN KEY (prayer_request_id) 
REFERENCES public.prayer_requests(id) 
ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_encrypted_contacts_prayer_request 
ON public.encrypted_contacts(prayer_request_id);

-- Add updated_at trigger
CREATE TRIGGER update_encrypted_contacts_updated_at
BEFORE UPDATE ON public.encrypted_contacts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
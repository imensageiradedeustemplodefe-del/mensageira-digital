-- Drop the existing view
DROP VIEW IF EXISTS public.public_prayer_requests;

-- Create a security definer function to get public prayer requests
CREATE OR REPLACE FUNCTION public.get_public_prayer_requests()
RETURNS TABLE (
  id uuid,
  display_name text,
  request_text text,
  category text,
  is_urgent boolean,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pr.id,
    pr.name AS display_name,
    pr.request_text,
    pr.category,
    pr.is_urgent,
    pr.created_at
  FROM prayer_requests pr
  WHERE pr.is_approved = true 
    AND pr.allow_public_share = true
  ORDER BY pr.created_at DESC;
$$;

-- Create a new table for public prayer requests with proper structure
CREATE TABLE public.public_prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text,
  request_text text NOT NULL,
  category text DEFAULT 'geral',
  is_urgent boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.public_prayer_requests ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view public prayer requests
CREATE POLICY "Everyone can view public prayer requests" 
ON public.public_prayer_requests 
FOR SELECT 
USING (true);

-- Only admins can manage public prayer requests
CREATE POLICY "Admins can manage public prayer requests" 
ON public.public_prayer_requests 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create a trigger function to automatically populate public prayer requests
CREATE OR REPLACE FUNCTION public.sync_public_prayer_requests()
RETURNS TRIGGER AS $$
BEGIN
  -- When a prayer request is approved and marked for public sharing
  IF NEW.is_approved = true AND NEW.allow_public_share = true AND 
     (OLD.is_approved IS DISTINCT FROM NEW.is_approved OR 
      OLD.allow_public_share IS DISTINCT FROM NEW.allow_public_share) THEN
    
    -- Insert or update in public table
    INSERT INTO public.public_prayer_requests (
      id, display_name, request_text, category, is_urgent, created_at
    ) VALUES (
      NEW.id, NEW.name, NEW.request_text, NEW.category, NEW.is_urgent, NEW.created_at
    ) ON CONFLICT (id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      request_text = EXCLUDED.request_text,
      category = EXCLUDED.category,
      is_urgent = EXCLUDED.is_urgent;
      
  -- Remove from public table if no longer approved or public
  ELSIF (NEW.is_approved = false OR NEW.allow_public_share = false) THEN
    DELETE FROM public.public_prayer_requests WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on prayer_requests table
CREATE TRIGGER sync_public_prayer_requests_trigger
  AFTER UPDATE ON public.prayer_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_public_prayer_requests();
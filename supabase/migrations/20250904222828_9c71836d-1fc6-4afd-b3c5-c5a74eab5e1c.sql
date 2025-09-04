-- Create prayer requests table
CREATE TABLE public.prayer_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text,
  phone text,
  request_text text NOT NULL,
  is_approved boolean DEFAULT false,
  is_urgent boolean DEFAULT false,
  category text DEFAULT 'geral',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can submit prayer requests"
ON public.prayer_requests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Everyone can view approved prayer requests"
ON public.prayer_requests
FOR SELECT
USING (is_approved = true);

CREATE POLICY "Admins can manage all prayer requests"
ON public.prayer_requests
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create function to update timestamps
CREATE TRIGGER update_prayer_requests_updated_at
BEFORE UPDATE ON public.prayer_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Enable Row Level Security on public_prayer_requests table
ALTER TABLE public.public_prayer_requests ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view public prayer requests (read-only access for the public)
CREATE POLICY "Everyone can view public prayer requests" 
ON public.public_prayer_requests 
FOR SELECT 
USING (true);

-- Only admins can insert public prayer requests
CREATE POLICY "Admins can insert public prayer requests" 
ON public.public_prayer_requests 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Only admins can update public prayer requests
CREATE POLICY "Admins can update public prayer requests" 
ON public.public_prayer_requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Only admins can delete public prayer requests
CREATE POLICY "Admins can delete public prayer requests" 
ON public.public_prayer_requests 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
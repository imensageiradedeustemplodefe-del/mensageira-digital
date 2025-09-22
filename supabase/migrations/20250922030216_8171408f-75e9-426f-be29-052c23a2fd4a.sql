-- Create RLS policies for public_prayer_requests view
-- This view should only show approved prayer requests without personal data

-- Enable RLS on the public_prayer_requests view
ALTER TABLE public.public_prayer_requests ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow everyone to view public prayer requests
-- This assumes the view already filters for approved requests
CREATE POLICY "Everyone can view public prayer requests" 
ON public.public_prayer_requests 
FOR SELECT 
USING (true);

-- Policy 2: Only admins can manage public prayer requests
-- This prevents unauthorized modifications
CREATE POLICY "Admins can manage public prayer requests" 
ON public.public_prayer_requests 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Policy 3: Block direct insertions into the view
-- Prayer requests should be inserted into the main prayer_requests table
CREATE POLICY "Block direct insertions to public view" 
ON public.public_prayer_requests 
FOR INSERT 
WITH CHECK (false);

-- Policy 4: Block direct updates to the view
-- Updates should happen on the main prayer_requests table
CREATE POLICY "Block direct updates to public view" 
ON public.public_prayer_requests 
FOR UPDATE 
USING (false);

-- Policy 5: Block direct deletions from the view
-- Deletions should happen on the main prayer_requests table
CREATE POLICY "Block direct deletions from public view" 
ON public.public_prayer_requests 
FOR DELETE 
USING (false);
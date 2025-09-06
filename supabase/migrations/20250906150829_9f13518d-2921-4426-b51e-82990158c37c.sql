-- Add column to track completed intercession
ALTER TABLE public.prayer_requests 
ADD COLUMN is_completed BOOLEAN DEFAULT FALSE;

-- Add column to track when intercession was completed
ALTER TABLE public.prayer_requests 
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Update the public view policy to exclude completed requests
DROP POLICY IF EXISTS "Everyone can view approved prayer requests through view" ON public.prayer_requests;

CREATE POLICY "Everyone can view approved non-completed prayer requests" 
ON public.prayer_requests 
FOR SELECT 
USING (is_approved = true AND (is_completed = false OR is_completed IS NULL));
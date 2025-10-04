-- First, drop all existing push_subscriptions policies to start fresh
DROP POLICY IF EXISTS "Admins can manage all push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Allow anonymous push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anonymous users can update their subscriptions by endpoint" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can create their own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Admins can view all push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can view their own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Admins can update all push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Admins can delete push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can update their own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can delete their own push subscriptions" ON public.push_subscriptions;

-- Add secure SELECT policies - only admins and users can view their own subscriptions
CREATE POLICY "Admins can view all push subscriptions"
ON public.push_subscriptions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can view their own push subscriptions"
ON public.push_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow anonymous and authenticated users to insert subscriptions
CREATE POLICY "Allow anonymous push subscriptions"
ON public.push_subscriptions
FOR INSERT
TO anon, authenticated
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Allow anonymous users to update their subscriptions by endpoint
CREATE POLICY "Anonymous users can update their subscriptions by endpoint"
ON public.push_subscriptions
FOR UPDATE
TO anon, authenticated
USING (user_id IS NULL)
WITH CHECK (user_id IS NULL);

-- Allow authenticated users to update their own subscriptions
CREATE POLICY "Users can update their own push subscriptions"
ON public.push_subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own subscriptions
CREATE POLICY "Users can delete their own push subscriptions"
ON public.push_subscriptions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Allow admins to manage all subscriptions
CREATE POLICY "Admins can update all push subscriptions"
ON public.push_subscriptions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete push subscriptions"
ON public.push_subscriptions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
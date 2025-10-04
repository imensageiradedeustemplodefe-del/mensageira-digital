-- Drop existing overly permissive policies for push_subscriptions
-- and add strict SELECT policies

-- Drop the "Users can manage their own push subscriptions" ALL policy
-- as we'll replace it with specific SELECT, UPDATE, DELETE policies
DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON public.push_subscriptions;

-- Drop the "Admins can manage all push subscriptions" ALL policy
-- as we'll replace it with specific SELECT, UPDATE, DELETE policies
DROP POLICY IF EXISTS "Admins can manage all push subscriptions" ON public.push_subscriptions;

-- Add strict SELECT policies
-- Admins can view all subscriptions (for admin dashboard)
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

-- Authenticated users can view only their own subscriptions
CREATE POLICY "Users can view their own push subscriptions"
ON public.push_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Re-add admin management policies for UPDATE and DELETE
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

-- Re-add user management policies for UPDATE and DELETE
CREATE POLICY "Users can update their own push subscriptions"
ON public.push_subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push subscriptions"
ON public.push_subscriptions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
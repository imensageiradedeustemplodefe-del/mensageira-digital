-- Remove existing admin users and create the single church admin
DELETE FROM public.profiles WHERE email != 'imensageiradedeustemplodefe@gmail.com';

-- Create/Update the single church admin profile
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'imensageiradedeustemplodefe@gmail.com',
  'admin',
  now(),
  now()
) 
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  updated_at = now();

-- Block creation of new profiles - only allow SELECT for existing users
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create restrictive policies - only allow viewing own profile, no updates or inserts
CREATE POLICY "Users can only view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Block all INSERT and UPDATE operations on profiles
CREATE POLICY "Block profile creation" 
ON public.profiles 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "Block profile updates" 
ON public.profiles 
FOR UPDATE 
USING (false);

-- Remove the handle_new_user trigger to prevent automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Protect church contact information in site_settings
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;

-- Create more restrictive policies for site_settings
CREATE POLICY "Public can view general settings" 
ON public.site_settings 
FOR SELECT 
USING (
  category IN ('general', 'social', 'schedule') OR 
  setting_key NOT IN ('email', 'phone', 'whatsapp')
);

CREATE POLICY "Admin can view all settings" 
ON public.site_settings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin can manage settings" 
ON public.site_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
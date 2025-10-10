-- ========================================
-- CRITICAL SECURITY FIX: Remove role from profiles table
-- Phase 1: Drop all dependent policies first
-- ========================================

-- Step 1: Migrate existing role data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::app_role
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 2: Drop ALL policies that depend on profiles.role column
DROP POLICY IF EXISTS "Admins can manage verses" ON public.daily_verses;
DROP POLICY IF EXISTS "Admins can manage all event templates" ON public.event_templates;
DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage all albums" ON public.gallery_albums;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Admins can manage all photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Admins can manage Google Drive photo tracking" ON public.google_drive_photos;
DROP POLICY IF EXISTS "Admins can manage Google Drive settings" ON public.google_drive_settings;
DROP POLICY IF EXISTS "Admins can manage all live streams" ON public.live_streams;
DROP POLICY IF EXISTS "Admins can manage media categories" ON public.media_categories;
DROP POLICY IF EXISTS "Admins can manage all media" ON public.media_items;
DROP POLICY IF EXISTS "Admins can manage public prayer requests" ON public.public_prayer_requests;
DROP POLICY IF EXISTS "Admin can manage settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin can view all settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can manage all testimonies" ON public.testimonies;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Step 3: Now drop the vulnerable role column from profiles
ALTER TABLE public.profiles DROP COLUMN role;

-- Step 4: Recreate all policies using has_role() security definer function

-- daily_verses
CREATE POLICY "Admins can manage verses"
ON public.daily_verses
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- event_templates
CREATE POLICY "Admins can manage all event templates"
ON public.event_templates
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- events
CREATE POLICY "Admins can manage all events"
ON public.events
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- gallery_albums
CREATE POLICY "Admins can manage all albums"
ON public.gallery_albums
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- gallery_categories
CREATE POLICY "Admins can manage categories"
ON public.gallery_categories
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- gallery_photos
CREATE POLICY "Admins can manage all photos"
ON public.gallery_photos
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- google_drive_photos
CREATE POLICY "Admins can manage Google Drive photo tracking"
ON public.google_drive_photos
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- google_drive_settings
CREATE POLICY "Admins can manage Google Drive settings"
ON public.google_drive_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- live_streams
CREATE POLICY "Admins can manage all live streams"
ON public.live_streams
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- media_categories
CREATE POLICY "Admins can manage media categories"
ON public.media_categories
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- media_items
CREATE POLICY "Admins can manage all media"
ON public.media_items
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- public_prayer_requests
CREATE POLICY "Admins can manage public prayer requests"
ON public.public_prayer_requests
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- site_settings
CREATE POLICY "Admin can manage settings"
ON public.site_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can view all settings"
ON public.site_settings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- testimonies
CREATE POLICY "Admins can manage all testimonies"
ON public.testimonies
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- user_roles (secure with has_role)
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
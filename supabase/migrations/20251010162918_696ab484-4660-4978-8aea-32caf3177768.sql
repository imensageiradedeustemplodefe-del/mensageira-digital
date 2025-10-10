-- ========================================
-- CRITICAL SECURITY FIX: Update RLS policies to use has_role()
-- (Skip data migration as it appears to be already done)
-- ========================================

-- Drop ALL policies that may reference profiles.role
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

-- Remove role column if it still exists
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role CASCADE;

-- Recreate all policies using has_role() security definer function

CREATE POLICY "Admins can manage verses"
ON public.daily_verses FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all event templates"
ON public.event_templates FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all events"
ON public.events FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all albums"
ON public.gallery_albums FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage categories"
ON public.gallery_categories FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all photos"
ON public.gallery_photos FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage Google Drive photo tracking"
ON public.google_drive_photos FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage Google Drive settings"
ON public.google_drive_settings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all live streams"
ON public.live_streams FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage media categories"
ON public.media_categories FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all media"
ON public.media_items FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage public prayer requests"
ON public.public_prayer_requests FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can manage settings"
ON public.site_settings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can view all settings"
ON public.site_settings FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all testimonies"
ON public.testimonies FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
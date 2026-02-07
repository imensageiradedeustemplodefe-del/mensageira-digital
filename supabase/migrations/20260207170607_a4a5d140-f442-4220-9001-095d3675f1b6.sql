-- Allow public read access to specific site settings needed for gallery
CREATE POLICY "Public can view gallery settings"
ON public.site_settings
FOR SELECT
TO public
USING (setting_key IN ('google_drive_script_url', 'church_name', 'church_address', 'church_phone', 'church_email'));
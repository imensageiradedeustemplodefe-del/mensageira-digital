-- Fix RLS policies on event_contacts table to use security definer function
-- This prevents recursive policy issues and follows security best practices

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Only admins can manage event contacts" ON public.event_contacts;
DROP POLICY IF EXISTS "Only admins can view event contacts" ON public.event_contacts;

-- Create secure policies using the is_admin_user() security definer function
-- This matches the pattern used in encrypted_contacts table

CREATE POLICY "Authenticated admins can SELECT event contacts"
ON public.event_contacts
FOR SELECT
USING ((auth.uid() IS NOT NULL) AND is_admin_user());

CREATE POLICY "Authenticated admins can INSERT event contacts"
ON public.event_contacts
FOR INSERT
WITH CHECK ((auth.uid() IS NOT NULL) AND is_admin_user());

CREATE POLICY "Authenticated admins can UPDATE event contacts"
ON public.event_contacts
FOR UPDATE
USING ((auth.uid() IS NOT NULL) AND is_admin_user())
WITH CHECK ((auth.uid() IS NOT NULL) AND is_admin_user());

CREATE POLICY "Authenticated admins can DELETE event contacts"
ON public.event_contacts
FOR DELETE
USING ((auth.uid() IS NOT NULL) AND is_admin_user());

-- Block all anonymous access to event contacts
CREATE POLICY "Block all anonymous access to event contacts"
ON public.event_contacts
FOR ALL
USING (false);
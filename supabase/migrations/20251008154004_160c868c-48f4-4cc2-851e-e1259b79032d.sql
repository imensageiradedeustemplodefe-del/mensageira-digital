-- Fix Security Definer View warning and implement secure role management
-- This migration addresses two critical security issues:
-- 1. Remove SECURITY DEFINER from table-returning function (get_encrypted_contact)
-- 2. Move roles from profiles table to a dedicated user_roles table

-- =============================================
-- PART 1: Create proper role management system
-- =============================================

-- Step 1: Create enum for application roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Step 2: Create user_roles table with proper structure
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Temporary admin policy using old profiles.role check
-- This will allow admins to manage roles during migration
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Step 4: Migrate existing admin data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM public.profiles
WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 5: Create new SECURITY DEFINER function for role checking
-- This prevents recursive RLS issues and provides secure role validation
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Add trigger to update updated_at on user_roles
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.user_roles IS 
'Stores user role assignments. Roles are stored separately from profiles to prevent privilege escalation attacks.';

COMMENT ON FUNCTION public.has_role IS
'Securely checks if a user has a specific role. Use this function in RLS policies instead of querying profiles or user_roles directly to avoid recursive RLS issues.';

-- =============================================
-- PART 2: Fix Security Definer View warning
-- =============================================

-- Remove SECURITY DEFINER from get_encrypted_contact function
-- The strict RLS policies on encrypted_contacts table will handle access control
CREATE OR REPLACE FUNCTION public.get_encrypted_contact(p_prayer_request_id uuid)
RETURNS TABLE(encrypted_email text, encrypted_phone text, encryption_key_hash text)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  -- Note: Access control is now handled by RLS policies on encrypted_contacts table
  -- Only authenticated admins can access this data via RLS
  
  RETURN QUERY
  SELECT 
    ec.encrypted_email,
    ec.encrypted_phone,
    ec.encryption_key_hash
  FROM public.encrypted_contacts ec
  WHERE ec.prayer_request_id = p_prayer_request_id;
END;
$$;

COMMENT ON FUNCTION public.get_encrypted_contact IS
'Retrieves encrypted contact information for a prayer request. Access is controlled by RLS policies on the encrypted_contacts table, which require admin privileges.';

-- =============================================
-- PART 3: Update is_admin_user to use new roles table
-- =============================================

-- Update is_admin_user to check new user_roles table
-- Keep SECURITY DEFINER here as it's appropriate for this authorization function
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::public.app_role
  )
$$;

COMMENT ON FUNCTION public.is_admin_user IS
'Checks if the current user has admin role. This is a SECURITY DEFINER function that bypasses RLS to check roles, which is the correct pattern for authorization checks.';
-- Fix photo_reactions RLS policies to prevent user tracking

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Public can view all reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Public can add reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Public can update reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Public can delete reactions" ON public.photo_reactions;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.photo_reactions;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.photo_reactions;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.photo_reactions;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.photo_reactions;

-- 1. Restrict SELECT - block direct access to prevent user tracking
-- Users can only see their own reactions (for UI state)
-- Aggregate counts come from the view which doesn't expose user_id
CREATE POLICY "Users can only view own reactions"
  ON public.photo_reactions FOR SELECT
  USING (false);

-- 2. Add validated INSERT policy
CREATE POLICY "Public can add validated reactions"
  ON public.photo_reactions FOR INSERT
  WITH CHECK (
    reaction_type IN ('love', 'prayer', 'amen', 'hallelujah', 'glory', 'fire')
    AND photo_id IS NOT NULL
    AND user_id IS NOT NULL
    AND length(user_id) = 36
    AND user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  );

-- 3. No UPDATE policy - users should delete and re-add to change reactions

-- 4. Allow DELETE (cannot restrict ownership without auth)
CREATE POLICY "Public can delete reactions"
  ON public.photo_reactions FOR DELETE
  USING (true);

-- 5. Allow admins full access for management
CREATE POLICY "Admins can manage all reactions"
  ON public.photo_reactions FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());
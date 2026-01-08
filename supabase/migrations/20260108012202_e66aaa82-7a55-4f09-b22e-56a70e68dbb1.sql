-- Fix photo_reactions security vulnerabilities
-- 1. Drop overly permissive policies
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.photo_reactions;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.photo_reactions;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.photo_reactions;
DROP POLICY IF EXISTS "Public can add validated reactions" ON public.photo_reactions;

-- 2. Add unique constraint to prevent duplicate reactions per user/photo
-- First check if constraint exists and drop it if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'photo_reactions_user_photo_unique'
  ) THEN
    ALTER TABLE public.photo_reactions DROP CONSTRAINT photo_reactions_user_photo_unique;
  END IF;
END $$;

-- Add the unique constraint
ALTER TABLE public.photo_reactions 
ADD CONSTRAINT photo_reactions_user_photo_unique UNIQUE (photo_id, user_id);

-- 3. Create a SECURITY DEFINER function for adding reactions
-- This ensures server-side validation and prevents client-side manipulation
CREATE OR REPLACE FUNCTION public.add_photo_reaction(
  p_photo_id text,
  p_user_id text,
  p_reaction_type text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Validate user_id format (must be a valid UUID)
  IF p_user_id IS NULL OR p_user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid user_id format');
  END IF;
  
  -- Validate photo_id is not null or empty
  IF p_photo_id IS NULL OR length(trim(p_photo_id)) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid photo_id');
  END IF;
  
  -- Validate reaction_type is one of the allowed values
  IF p_reaction_type NOT IN ('love', 'prayer', 'amen', 'hallelujah', 'glory', 'fire') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid reaction_type');
  END IF;
  
  -- Delete any existing reaction for this user/photo combination first
  DELETE FROM public.photo_reactions 
  WHERE photo_id = p_photo_id AND user_id = p_user_id;
  
  -- Insert the new reaction
  INSERT INTO public.photo_reactions (photo_id, user_id, reaction_type)
  VALUES (p_photo_id, p_user_id, p_reaction_type);
  
  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN unique_violation THEN
    -- This shouldn't happen since we delete first, but handle it gracefully
    RETURN jsonb_build_object('success', false, 'error', 'Reaction already exists');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 4. Block direct INSERT - users must use the add_photo_reaction function
CREATE POLICY "Block direct insert - use function instead"
ON public.photo_reactions
FOR INSERT
WITH CHECK (
  -- Only admins can insert directly
  is_admin_user()
);

-- 5. Block all UPDATE - reactions should be delete+insert via functions
CREATE POLICY "Block all updates - use functions instead"
ON public.photo_reactions
FOR UPDATE
USING (false)
WITH CHECK (false);
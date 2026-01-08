-- Drop the previous policy that only validates format but doesn't restrict ownership
DROP POLICY IF EXISTS "Users can only delete their own reactions" ON public.photo_reactions;

-- Create a SECURITY DEFINER function that safely handles reaction deletion
-- This validates that the provided user_id owns the reaction being deleted
CREATE OR REPLACE FUNCTION public.delete_own_reaction(
  p_photo_id text,
  p_user_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Validate user_id format (must be a valid UUID)
  IF p_user_id IS NULL OR p_user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN false;
  END IF;
  
  -- Validate photo_id is not null
  IF p_photo_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Delete only the reaction that matches BOTH photo_id AND user_id
  DELETE FROM public.photo_reactions
  WHERE photo_id = p_photo_id AND user_id = p_user_id;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count > 0;
END;
$$;

-- Now create a restrictive DELETE policy that blocks direct deletes
-- Users must use the delete_own_reaction function instead
CREATE POLICY "Block direct delete - use function instead"
ON public.photo_reactions
FOR DELETE
USING (
  -- Only admins can delete directly
  is_admin_user()
);
-- Create a one-time admin insertion function that works with auth
-- We need to handle the case where the user might already exist in auth.users

-- Create a temporary function to allow admin profile creation
CREATE OR REPLACE FUNCTION create_admin_profile()
RETURNS void AS $$
BEGIN
  -- First check if profile already exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'imensageiradedeustemplodefe@gmail.com') THEN
    -- Temporarily allow INSERT for this operation
    DROP POLICY IF EXISTS "Block profile creation" ON public.profiles;
    
    -- Create the admin profile with a dummy ID that will be updated when user logs in
    INSERT INTO public.profiles (id, email, role, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'imensageiradedeustemplodefe@gmail.com', 
      'admin',
      now(),
      now()
    );
    
    -- Restore the block policy
    CREATE POLICY "Block profile creation" 
    ON public.profiles 
    FOR INSERT 
    WITH CHECK (false);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function
SELECT create_admin_profile();

-- Drop the function after use
DROP FUNCTION create_admin_profile();
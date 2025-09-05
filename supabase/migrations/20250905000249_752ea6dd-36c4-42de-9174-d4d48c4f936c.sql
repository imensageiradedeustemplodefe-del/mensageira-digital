-- Create the admin profile for the specific user that was created
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
VALUES (
  'd8c88e22-6f2a-4177-becd-a419d86f8134',
  'imensageiradedeustemplodefe@gmail.com',
  'admin',
  now(),
  now()
) 
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  updated_at = now();
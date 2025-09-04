-- Create admin users table
CREATE TABLE public.admin_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access (anyone can select for login purposes)
CREATE POLICY "Anyone can view admin users for login" 
ON public.admin_users 
FOR SELECT 
USING (true);

-- Insert the predefined users
INSERT INTO public.admin_users (username, password, name) VALUES
('Pablo', 'templode49', 'Pablo'),
('Elisa', 'templode49', 'Elisa'),
('Wellika', 'templode49', 'Wellika'),
('Jessica', 'templode49', 'Jessica');
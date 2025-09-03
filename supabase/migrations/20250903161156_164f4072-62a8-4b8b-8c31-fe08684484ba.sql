-- Create gallery categories table
CREATE TABLE public.gallery_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for gallery categories
CREATE POLICY "Everyone can view categories" 
ON public.gallery_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage categories" 
ON public.gallery_categories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Create gallery photos table
CREATE TABLE public.gallery_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category_id UUID REFERENCES public.gallery_categories(id) ON DELETE CASCADE,
  event_date DATE,
  participants INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for gallery photos
CREATE POLICY "Everyone can view published photos" 
ON public.gallery_photos 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage all photos" 
ON public.gallery_photos 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Create testimonies table
CREATE TABLE public.testimonies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;

-- Create policies for testimonies
CREATE POLICY "Everyone can view approved testimonies" 
ON public.testimonies 
FOR SELECT 
USING (is_approved = true);

CREATE POLICY "Anyone can submit testimonies" 
ON public.testimonies 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage all testimonies" 
ON public.testimonies 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Add triggers for timestamps
CREATE TRIGGER update_gallery_categories_updated_at
BEFORE UPDATE ON public.gallery_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gallery_photos_updated_at
BEFORE UPDATE ON public.gallery_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_testimonies_updated_at
BEFORE UPDATE ON public.testimonies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.gallery_categories (name, slug, icon) VALUES
('Cultos', 'cultos', 'Heart'),
('Batismos', 'batismos', 'Users'),
('Música', 'musica', 'Camera'),
('Grupos', 'grupos', 'Users'),
('Crianças', 'criancas', 'Heart'),
('Jovens', 'jovens', 'Users'),
('Oração', 'oracao', 'Heart');
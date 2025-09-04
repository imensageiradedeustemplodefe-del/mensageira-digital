-- Create media categories table
CREATE TABLE public.media_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create media items table
CREATE TABLE public.media_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category_id UUID REFERENCES public.media_categories(id),
  duration INTEGER, -- in seconds
  artist TEXT,
  is_published BOOLEAN DEFAULT false,
  is_radio BOOLEAN DEFAULT false,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- Create policies for media_categories
CREATE POLICY "Everyone can view media categories" 
ON public.media_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage media categories" 
ON public.media_categories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Create policies for media_items
CREATE POLICY "Everyone can view published media" 
ON public.media_items 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage all media" 
ON public.media_items 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_media_categories_updated_at
  BEFORE UPDATE ON public.media_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_items_updated_at
  BEFORE UPDATE ON public.media_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.media_categories (name, slug, icon) VALUES 
('Louvor e Adoração', 'louvor-adoracao', 'music'),
('Pregações', 'pregacoes', 'mic'),
('Rádio Gospel', 'radio-gospel', 'radio'),
('Música Instrumental', 'instrumental', 'piano');

-- Insert sample radio station
INSERT INTO public.media_items (title, description, media_url, category_id, is_published, is_radio, artist) 
SELECT 
  'Rádio Gospel Online',
  'Transmissão 24h de música gospel',
  'https://stream.zeno.fm/example-gospel-radio', -- placeholder URL
  id,
  true,
  true,
  'Rádio Gospel'
FROM public.media_categories 
WHERE slug = 'radio-gospel';
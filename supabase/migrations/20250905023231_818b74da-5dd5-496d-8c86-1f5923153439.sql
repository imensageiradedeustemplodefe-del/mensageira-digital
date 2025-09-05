-- Criar tabela de álbuns/pastas da galeria
CREATE TABLE public.gallery_albums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_photo_url TEXT,
  event_date DATE,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar coluna album_id na tabela gallery_photos
ALTER TABLE public.gallery_photos 
ADD COLUMN album_id UUID REFERENCES public.gallery_albums(id) ON DELETE SET NULL;

-- Habilitar RLS na nova tabela
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para álbuns
CREATE POLICY "Everyone can view published albums" 
ON public.gallery_albums 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage all albums" 
ON public.gallery_albums 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_gallery_albums_updated_at
BEFORE UPDATE ON public.gallery_albums
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_gallery_albums_published ON public.gallery_albums(is_published);
CREATE INDEX idx_gallery_albums_event_date ON public.gallery_albums(event_date);
CREATE INDEX idx_gallery_photos_album_id ON public.gallery_photos(album_id);
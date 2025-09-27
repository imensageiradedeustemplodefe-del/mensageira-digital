-- Create table to store Google Drive integration settings
CREATE TABLE public.google_drive_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  folder_id TEXT, -- Main Google Drive folder ID to sync from
  is_enabled BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_frequency INTEGER DEFAULT 3600, -- seconds between syncs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.google_drive_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for Google Drive settings
CREATE POLICY "Admins can manage Google Drive settings" 
ON public.google_drive_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create table to track imported photos from Google Drive
CREATE TABLE public.google_drive_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_photo_id UUID REFERENCES public.gallery_photos(id) ON DELETE CASCADE,
  drive_file_id TEXT NOT NULL UNIQUE, -- Google Drive file ID
  drive_folder_id TEXT, -- Parent folder ID in Drive
  drive_modified_time TIMESTAMP WITH TIME ZONE,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.google_drive_photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for Google Drive photos tracking
CREATE POLICY "Admins can manage Google Drive photo tracking" 
ON public.google_drive_photos 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Everyone can view synced photo info" 
ON public.google_drive_photos 
FOR SELECT 
USING (true);

-- Update triggers for timestamps
CREATE TRIGGER update_google_drive_settings_updated_at
BEFORE UPDATE ON public.google_drive_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_google_drive_photos_updated_at
BEFORE UPDATE ON public.google_drive_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
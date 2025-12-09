-- Adicionar coluna drive_folder_id à tabela gallery_albums
ALTER TABLE public.gallery_albums 
ADD COLUMN IF NOT EXISTS drive_folder_id TEXT;
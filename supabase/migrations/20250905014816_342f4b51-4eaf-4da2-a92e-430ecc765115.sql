-- Remove the current non-working radio
UPDATE media_items 
SET is_published = false 
WHERE title = 'Rádio Novo Tempo' AND is_radio = true;

-- Add a new radio focused on hymns
INSERT INTO media_items (title, media_url, is_radio, is_published, artist, description) 
VALUES (
  'Rádio Trans Mundial - Hinos',
  'https://centova.svdns.com.br:20020/stream',
  true,
  true,
  'RTM',
  'Rádio cristã com programação focada em hinos tradicionais e música gospel clássica'
);
-- Update the gospel radio with a real working stream
UPDATE media_items 
SET 
  title = 'Rádio Novo Tempo',
  media_url = 'https://stream.zeno.fm/4wkdtuem8ehvv'
WHERE is_radio = true AND id = 'd12436db-3b41-47a4-a6ca-05f7ec02ee3b';

-- If no radio exists, insert a working gospel radio
INSERT INTO media_items (title, media_url, is_radio, is_published)
SELECT 'Rádio Novo Tempo', 'https://stream.zeno.fm/4wkdtuem8ehvv', true, true
WHERE NOT EXISTS (
  SELECT 1 FROM media_items WHERE is_radio = true AND is_published = true
);
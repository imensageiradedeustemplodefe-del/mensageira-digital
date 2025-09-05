-- Publish the existing radio stream
UPDATE media_items 
SET is_published = true 
WHERE title = 'Rádio Novo Tempo' AND is_radio = true;
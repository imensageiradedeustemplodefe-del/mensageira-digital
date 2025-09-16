-- Atualizar os horários corretos dos cultos
UPDATE site_settings 
SET setting_value = '20:00', updated_at = now()
WHERE setting_key = 'friday_service_time';

UPDATE site_settings 
SET setting_value = '19:30', updated_at = now()
WHERE setting_key = 'sunday_service_time';

-- Desativar culto de quarta-feira (opcional - manteremos o campo mas não usaremos)
UPDATE site_settings 
SET setting_value = '', updated_at = now()
WHERE setting_key = 'wednesday_service_time';
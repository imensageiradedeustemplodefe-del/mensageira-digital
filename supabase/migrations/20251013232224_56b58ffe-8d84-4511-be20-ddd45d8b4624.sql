-- Adicionar configuração do URL do Google Apps Script para sincronizar inscrições de eventos
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, category, display_name, description)
VALUES (
  'event_registration_script_url',
  '',
  'text',
  'integrations',
  'URL do Google Apps Script (Inscrições)',
  'URL do Google Apps Script que gerencia as planilhas de inscrições na pasta Inscrições_Eventos'
)
ON CONFLICT (setting_key) DO NOTHING;
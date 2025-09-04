-- Create site settings table
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value text,
  setting_type text NOT NULL DEFAULT 'text',
  category text NOT NULL DEFAULT 'general',
  display_name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM admin_users WHERE id = auth.uid()::text::uuid
));

-- Add trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default site settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, category, display_name, description) VALUES
-- Informações Gerais
('church_name', 'Igreja Mensageira de Deus - Templo de Fé', 'text', 'general', 'Nome da Igreja', 'Nome completo da igreja'),
('church_slogan', 'Proclamando a Palavra de Deus com Fé e Amor', 'text', 'general', 'Slogan/Lema', 'Frase que representa a igreja'),
('church_address', 'Rua da Igreja, 123 - Centro - Cidade - Estado', 'textarea', 'contact', 'Endereço', 'Endereço completo da igreja'),
('church_phone', '(11) 99999-9999', 'text', 'contact', 'Telefone', 'Telefone principal da igreja'),
('church_email', 'contato@mensageiradedeus.com.br', 'email', 'contact', 'E-mail', 'E-mail para contato'),

-- Redes Sociais
('facebook_url', '', 'url', 'social', 'Facebook', 'Link do Facebook da igreja'),
('instagram_url', '', 'url', 'social', 'Instagram', 'Link do Instagram da igreja'),
('youtube_url', '', 'url', 'social', 'YouTube', 'Link do canal do YouTube'),
('whatsapp_number', '', 'text', 'social', 'WhatsApp', 'Número do WhatsApp para contato'),

-- Horários
('sunday_service_time', '10:00', 'time', 'schedule', 'Culto Dominical', 'Horário do culto de domingo'),
('wednesday_service_time', '19:30', 'time', 'schedule', 'Culto de Quarta', 'Horário do culto de quarta-feira'),
('friday_service_time', '19:30', 'time', 'schedule', 'Culto de Sexta', 'Horário do culto de sexta-feira'),

-- Live/Transmissão
('live_youtube_id', '', 'text', 'live', 'ID do YouTube Live', 'ID do vídeo/canal para transmissão ao vivo'),
('live_facebook_url', '', 'url', 'live', 'Link Facebook Live', 'Link para transmissão no Facebook'),

-- Sobre
('church_description', 'Somos uma igreja que tem como missão proclamar o evangelho de Jesus Cristo, transformando vidas através da Palavra de Deus e do amor cristão.', 'textarea', 'about', 'Descrição da Igreja', 'Texto sobre a igreja para a página Sobre'),
('pastor_name', 'Pastor João Silva', 'text', 'about', 'Nome do Pastor', 'Nome do pastor principal'),
('church_founded_year', '1990', 'number', 'about', 'Ano de Fundação', 'Ano em que a igreja foi fundada');
-- Add missing site settings for pastors and contact info
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, category, display_name, description) VALUES
-- Contact page settings  
('contact_email_secretary', 'imensageiradedeustemplodefe@gmail.com', 'email', 'contact', 'E-mail da Secretaria', 'E-mail principal da secretaria'),
('contact_address_full', 'R. Elias Biasi, 49 - Berger, Caçador - SC, 89500-000', 'textarea', 'contact', 'Endereço Completo', 'Endereço completo com CEP'),

-- Pastor information
('pastor_principal_name', 'Pr. Gilmar Radaelli', 'text', 'about', 'Pastor Principal', 'Nome do pastor responsável principal'),
('pastor_principal_description', 'Líder espiritual dedicado ao crescimento da igreja e ao cuidado pastoral das famílias.', 'textarea', 'about', 'Descrição Pastor Principal', 'Descrição do pastor principal'),
('pastora_name', 'Pra. Vera Lucia Radaelli', 'text', 'about', 'Nome da Pastora', 'Nome da pastora responsável'),
('pastora_description', 'Comprometida com o ministério de mulheres e o ensino da Palavra de Deus.', 'textarea', 'about', 'Descrição da Pastora', 'Descrição da pastora'),
('pastor_auxiliar_name', 'Pr. João Ezequiel Batista', 'text', 'about', 'Pastor Auxiliar', 'Nome do pastor auxiliar'),
('pastor_auxiliar_description', 'Apoio pastoral e liderança em diversas atividades da congregação.', 'textarea', 'about', 'Descrição Pastor Auxiliar', 'Descrição do pastor auxiliar'),

-- Home page
('hero_title', 'Bem-vindos à Mensageira de Deus', 'text', 'general', 'Título Principal', 'Título da página inicial'),
('hero_subtitle', 'Templo de Fé', 'text', 'general', 'Subtítulo', 'Subtítulo da página inicial'),
('hero_description', 'Uma igreja comprometida com a Palavra de Deus, onde vidas são transformadas e famílias são edificadas no amor de Cristo.', 'textarea', 'general', 'Descrição Principal', 'Descrição da página inicial')

ON CONFLICT (setting_key) DO UPDATE SET 
setting_value = EXCLUDED.setting_value,
updated_at = now();
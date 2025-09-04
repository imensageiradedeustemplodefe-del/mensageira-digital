-- Add page-specific settings for all static text content
INSERT INTO site_settings (setting_key, setting_value, setting_type, category, display_name, description) VALUES
-- Events page
('events_page_title', 'Eventos e Programação', 'text', 'pages', 'Título da Página de Eventos', 'Título principal da página de eventos'),
('events_page_subtitle', 'Participe da nossa programação semanal e fortaleça sua fé em comunidade.', 'textarea', 'pages', 'Subtítulo da Página de Eventos', 'Descrição da página de eventos'),
('events_section_title', 'Programação Regular', 'text', 'pages', 'Título Seção Programação', 'Título da seção de programação regular'),
('events_section_description', 'Nossa programação semanal e mensal de cultos e eventos especiais.', 'textarea', 'pages', 'Descrição Seção Programação', 'Descrição da programação regular'),
('ministries_section_title', 'Atividades dos Ministérios', 'text', 'pages', 'Título Seção Ministérios', 'Título da seção de ministérios'),
('ministries_section_description', 'Conheça os diferentes ministérios e suas atividades na igreja.', 'textarea', 'pages', 'Descrição Seção Ministérios', 'Descrição dos ministérios'),
('events_cta_title', 'Venha Participar Conosco', 'text', 'pages', 'Título Convite Eventos', 'Título do convite para participar'),
('events_cta_description', 'Todos são bem-vindos em nossa igreja! Venha adorar, aprender e crescer espiritualmente em nossa comunidade de fé.', 'textarea', 'pages', 'Descrição Convite Eventos', 'Descrição do convite para participar'),

-- Prayer page
('prayer_page_title', 'Pedidos de Oração', 'text', 'pages', 'Título da Página de Oração', 'Título principal da página de pedidos de oração'),
('prayer_page_subtitle', 'Compartilhe seus pedidos de oração conosco. Nossa equipe estará intercedendo por você.', 'textarea', 'pages', 'Subtítulo da Página de Oração', 'Descrição da página de oração'),
('prayer_form_title', 'Envie seu Pedido de Oração', 'text', 'pages', 'Título do Formulário de Oração', 'Título do formulário de pedidos'),
('prayer_schedule_title', 'Horários de Oração', 'text', 'pages', 'Título Horários de Oração', 'Título da seção de horários'),
('prayer_schedule_description', 'Nossas reuniões de oração acontecem todas as terças-feiras. Participe conosco!', 'textarea', 'pages', 'Descrição Horários de Oração', 'Descrição dos horários de oração'),
('prayer_team_title', 'Equipe de Intercessão', 'text', 'pages', 'Título Equipe de Intercessão', 'Título da seção sobre a equipe'),
('prayer_team_description', 'Nossa equipe de oração está sempre intercedendo pelos pedidos recebidos. Você não está sozinho!', 'textarea', 'pages', 'Descrição Equipe de Intercessão', 'Descrição sobre a equipe de oração'),
('prayer_confidentiality_title', 'Confidencialidade', 'text', 'pages', 'Título Confidencialidade', 'Título sobre confidencialidade'),
('prayer_confidentiality_description', 'Todos os pedidos são tratados com total confidencialidade e amor cristão.', 'textarea', 'pages', 'Descrição Confidencialidade', 'Descrição sobre confidencialidade'),

-- Gallery page
('gallery_page_title', 'Galeria de Fotos', 'text', 'pages', 'Título da Página da Galeria', 'Título principal da galeria de fotos'),
('gallery_page_subtitle', 'Reviva os momentos especiais de nossa comunidade de fé através destas imagens.', 'textarea', 'pages', 'Subtítulo da Página da Galeria', 'Descrição da galeria'),
('gallery_stats_photos', 'Fotos na Galeria', 'text', 'pages', 'Texto Estatística Fotos', 'Texto para contagem de fotos'),
('gallery_stats_categories', 'Categorias', 'text', 'pages', 'Texto Estatística Categorias', 'Texto para contagem de categorias'),
('gallery_stats_people', 'Pessoas nas Fotos', 'text', 'pages', 'Texto Estatística Pessoas', 'Texto para contagem de pessoas'),

-- Testimonies page
('testimonies_page_title', 'Testemunhos', 'text', 'pages', 'Título da Página de Testemunhos', 'Título principal da página de testemunhos'),
('testimonies_page_subtitle', 'Veja como Deus tem transformado vidas em nossa comunidade e compartilhe seu próprio testemunho.', 'textarea', 'pages', 'Subtítulo da Página de Testemunhos', 'Descrição da página de testemunhos'),
('testimonies_featured_title', 'Testemunhos em Destaque', 'text', 'pages', 'Título Testemunhos Destaque', 'Título da seção de testemunhos em destaque'),
('testimonies_all_title', 'Todos os Testemunhos', 'text', 'pages', 'Título Todos Testemunhos', 'Título da seção de todos os testemunhos'),
('testimonies_form_title', 'Compartilhe seu Testemunho', 'text', 'pages', 'Título Formulário Testemunho', 'Título do formulário de testemunhos'),
('testimonies_form_description', 'Conte-nos como Deus tem agido em sua vida. Seu testemunho pode encorajar outros!', 'textarea', 'pages', 'Descrição Formulário Testemunho', 'Descrição do formulário de testemunhos'),
('testimonies_empty_message', 'Nenhum testemunho publicado ainda. Seja o primeiro a compartilhar!', 'textarea', 'pages', 'Mensagem Sem Testemunhos', 'Mensagem quando não há testemunhos'),

-- Home page additional content
('home_events_title', 'Próximos Eventos', 'text', 'home', 'Título Próximos Eventos', 'Título da seção de próximos eventos na home'),
('home_events_description', 'Participe da nossa programação semanal e fortaleça sua fé em comunidade.', 'textarea', 'home', 'Descrição Próximos Eventos', 'Descrição dos próximos eventos'),
('home_visit_title', 'Visite Nossa Igreja', 'text', 'home', 'Título Visitar Igreja', 'Título do convite para visitar'),
('home_visit_description', 'Venha fazer parte da nossa família! Todos são bem-vindos para adorar e crescer juntos na presença do Senhor.', 'textarea', 'home', 'Descrição Visitar Igreja', 'Descrição do convite para visitar'),

-- Event descriptions - making them editable
('event_healing_title', 'Culto de Cura e Libertação', 'text', 'events', 'Título Culto Cura', 'Título do culto de cura e libertação'),
('event_healing_description', 'Venha buscar a cura e libertação em Jesus Cristo', 'textarea', 'events', 'Descrição Culto Cura', 'Descrição do culto de cura'),
('event_family_title', 'Culto da Família', 'text', 'events', 'Título Culto Família', 'Título do culto da família'),
('event_family_description', 'Culto especial para toda a família', 'textarea', 'events', 'Descrição Culto Família', 'Descrição do culto da família'),
('event_prayer_title', 'Culto de Oração', 'text', 'events', 'Título Culto Oração', 'Título do culto de oração'),
('event_prayer_description', 'Momento de oração e comunhão', 'textarea', 'events', 'Descrição Culto Oração', 'Descrição do culto de oração');
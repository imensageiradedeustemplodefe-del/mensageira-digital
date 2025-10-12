-- Criar templates de eventos: Culto da Família e Culto Cura e Libertação
INSERT INTO public.event_templates (name, title, category, description, location, is_default)
VALUES 
  (
    'Culto da Família',
    'Culto da Família',
    'culto',
    'Momento especial de adoração e ministração voltado para toda a família, com atividades e palavra direcionada para edificação do lar.',
    'Templo Principal',
    false
  ),
  (
    'Culto Cura e Libertação',
    'Culto de Cura e Libertação',
    'culto',
    'Culto de poder com ministração de cura e libertação, momento de quebra de cadeias e renovação espiritual.',
    'Templo Principal',
    false
  );
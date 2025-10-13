-- Inserir template para Culto Homens de Propósito
INSERT INTO public.event_templates (
  name,
  title,
  description,
  category,
  location,
  is_default
) VALUES (
  'Homens de Propósito',
  'Culto Homens de Propósito',
  'Encontro especial para os homens da igreja. Um momento de comunhão, ensinamento e fortalecimento espiritual.',
  'culto',
  NULL,
  false
)
ON CONFLICT DO NOTHING;
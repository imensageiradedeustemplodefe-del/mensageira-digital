-- Criar tabela para modelos de eventos personalizados
CREATE TABLE public.event_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  location TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.event_templates ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Admins can manage all event templates" 
ON public.event_templates 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Criar trigger para updated_at
CREATE TRIGGER update_event_templates_updated_at
BEFORE UPDATE ON public.event_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir modelos padrões
INSERT INTO public.event_templates (name, title, category, description, location, is_default) VALUES
('Culto de Adoração', 'Culto de Adoração', 'culto', 'Junte-se a nós para um momento especial de adoração, louvor e palavra de Deus. Venha experimentar a presença do Senhor em nossa comunidade.', 'Templo Principal', true),
('Cerimônia de Batismo', 'Cerimônia de Batismo', 'batismo', 'Celebrando o novo nascimento em Cristo através do batismo nas águas. Uma cerimônia especial de compromisso com Jesus.', 'Batistério do Templo', true),
('Encontro de Jovens', 'Encontro de Jovens', 'jovens', 'Um momento especial para os jovens se conectarem com Deus através de louvor, palavra e comunhão. Venha fazer parte desta família!', 'Salão dos Jovens', true),
('Santa Ceia', 'Santa Ceia', 'ceia', 'Participem conosco da Santa Ceia, recordando o sacrifício de Jesus Cristo por nós. Um momento de reflexão e comunhão.', 'Templo Principal', true),
('Campanha de Oração', 'Campanha de Oração', 'campanha', 'Dias especiais de oração e busca pela presença de Deus. Venha participar desta campanha de avivamento espiritual.', 'Templo Principal', true),
('Retiro Espiritual', 'Retiro Espiritual', 'retiro', 'Um tempo especial de comunhão, oração e palavra de Deus. Momentos únicos de crescimento espiritual e renovação.', 'Centro de Retiros', true),
('Conferência Ministerial', 'Conferência Ministerial', 'conferencia', 'Dias especiais de ensino, workshops e ministração. Uma oportunidade de crescimento e capacitação ministerial.', 'Auditório Principal', true),
('Ação Evangelística', 'Ação Evangelística', 'evangelismo', 'Saída missionária para compartilhar o amor de Cristo. Juntos levando a palavra de Deus àqueles que precisam.', 'Praça Central', true),
('Lava Car Beneficente', 'Lava Car Beneficente', 'lavacar', 'Ação social da igreja para arrecadar recursos para obras missionárias. Venha lavar seu carro e contribuir com a obra.', 'Estacionamento da Igreja', true);
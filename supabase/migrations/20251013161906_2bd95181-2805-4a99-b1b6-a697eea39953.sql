-- Tabela para armazenar campos personalizáveis de formulários de eventos
CREATE TABLE public.event_registration_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text', -- text, email, phone, number, date, select, textarea
  field_label TEXT NOT NULL,
  field_placeholder TEXT,
  is_required BOOLEAN DEFAULT true,
  field_options TEXT[], -- Para campos do tipo select
  field_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para armazenar as inscrições nos eventos
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  registration_data JSONB NOT NULL, -- Armazena os dados do formulário de forma flexível
  spreadsheet_id TEXT, -- ID da planilha no Google Sheets
  synced_to_sheets BOOLEAN DEFAULT false,
  synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX idx_event_registration_fields_event_id ON public.event_registration_fields(event_id);
CREATE INDEX idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX idx_event_registrations_synced ON public.event_registrations(synced_to_sheets);

-- Enable RLS
ALTER TABLE public.event_registration_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Policies para event_registration_fields
CREATE POLICY "Admins can manage event registration fields"
ON public.event_registration_fields
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Everyone can view registration fields for published events"
ON public.event_registration_fields
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_registration_fields.event_id
    AND events.is_published = true
  )
);

-- Policies para event_registrations
CREATE POLICY "Admins can view all registrations"
ON public.event_registrations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can submit registrations for published events"
ON public.event_registrations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = event_registrations.event_id
    AND events.is_published = true
    AND events.registration_required = true
  )
);

-- Trigger para updated_at
CREATE TRIGGER update_event_registration_fields_updated_at
BEFORE UPDATE ON public.event_registration_fields
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at
BEFORE UPDATE ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
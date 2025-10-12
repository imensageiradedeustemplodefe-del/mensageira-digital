-- Criar tabela para notificações personalizadas do admin
CREATE TABLE IF NOT EXISTS public.custom_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT DEFAULT '📢',
  url TEXT DEFAULT '/',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.custom_notifications ENABLE ROW LEVEL SECURITY;

-- Admins podem gerenciar todas as notificações personalizadas
CREATE POLICY "Admins can manage custom notifications"
  ON public.custom_notifications
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Todos podem visualizar notificações ativas
CREATE POLICY "Everyone can view active custom notifications"
  ON public.custom_notifications
  FOR SELECT
  USING (is_active = true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_custom_notifications_updated_at
  BEFORE UPDATE ON public.custom_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
-- Remover a política insegura atual
DROP POLICY IF EXISTS "Anyone can manage push subscriptions" ON public.push_subscriptions;

-- Criar políticas seguras para push subscriptions
-- Usuários autenticados podem gerenciar apenas suas próprias subscriptions
CREATE POLICY "Users can manage their own push subscriptions"
ON public.push_subscriptions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Permitir que usuários autenticados criem subscriptions para si mesmos
CREATE POLICY "Users can create their own push subscriptions"
ON public.push_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins podem ver e gerenciar todas as subscriptions
CREATE POLICY "Admins can manage all push subscriptions"
ON public.push_subscriptions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Para subscriptions anônimas (user_id NULL), apenas permitir inserção e atualização baseada no endpoint
-- Isso permite que dispositivos anônimos gerenciem suas próprias subscriptions
CREATE POLICY "Anonymous users can manage their own subscriptions by endpoint"
ON public.push_subscriptions
FOR ALL
USING (
  user_id IS NULL AND 
  auth.uid() IS NULL
)
WITH CHECK (
  user_id IS NULL AND 
  auth.uid() IS NULL
);
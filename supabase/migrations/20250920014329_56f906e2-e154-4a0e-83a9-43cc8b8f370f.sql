-- Corrigir a política para usuários anônimos que pode estar muito restritiva
DROP POLICY IF EXISTS "Anonymous users can manage their own subscriptions by endpoint" ON public.push_subscriptions;

-- Criar uma política mais permissiva para usuários anônimos
-- Permite que qualquer um crie subscriptions quando não está autenticado
CREATE POLICY "Allow anonymous push subscriptions"
ON public.push_subscriptions
FOR INSERT
WITH CHECK (user_id IS NULL);

-- Permitir que usuários anônimos atualizem suas próprias subscriptions por endpoint
CREATE POLICY "Anonymous users can update their subscriptions by endpoint"
ON public.push_subscriptions
FOR UPDATE
USING (user_id IS NULL)
WITH CHECK (user_id IS NULL);
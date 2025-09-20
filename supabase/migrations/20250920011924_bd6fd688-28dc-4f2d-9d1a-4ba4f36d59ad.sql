-- Ajustar as políticas RLS para permitir subscriptions anônimas
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON public.push_subscriptions;

-- Criar política que permite qualquer pessoa criar/gerenciar subscriptions baseado no endpoint
CREATE POLICY "Anyone can manage push subscriptions"
ON public.push_subscriptions
FOR ALL
USING (true)
WITH CHECK (true);

-- Verificar se a tabela permite inserções anônimas
SELECT tablename, schemaname FROM pg_tables WHERE tablename = 'push_subscriptions';
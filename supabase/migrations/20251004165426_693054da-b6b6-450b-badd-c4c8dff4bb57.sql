-- Atualizar a tabela photo_reactions para suportar mais tipos de reação
-- Primeiro, vamos ver se há dados existentes e atualizá-los se necessário

-- Como não temos um enum definido, vamos apenas documentar os novos tipos permitidos
-- Os tipos de reação agora serão: 'love', 'prayer', 'amen', 'hallelujah', 'glory', 'fire'

-- Adicionar um comentário na tabela para documentar os tipos permitidos
COMMENT ON COLUMN public.photo_reactions.reaction_type IS 
'Tipos de reação permitidos: love (Amei), prayer (Oração), amen (Amém), hallelujah (Aleluia), glory (Glória a Deus), fire (Aviva Senhor)';
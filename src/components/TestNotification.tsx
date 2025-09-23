import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const TestNotification = () => {
  const { toast } = useToast();
  const { isRegistered, subscribeToPush, isSupported, token } = usePushNotifications();

  const sendTestNotification = async () => {
    try {
      console.log('🧪 [TEST] Enviando notificação de teste...');
      
      toast({
        title: "Enviando notificação de teste...",
        description: "Aguarde um momento."
      });

      const { data, error } = await supabase.functions.invoke('test-push-notification', {
        body: {}
      });

      console.log('🧪 [TEST] Resposta do test:', { data, error });

      if (error) {
        throw error;
      }

      console.log('🧪 [TEST] Notificação enviada com sucesso:', data);
      
      toast({
        title: "Teste enviado!",
        description: "Verifique se recebeu a notificação."
      });
    } catch (error) {
      console.error('❌ [TEST] Erro no teste:', error);
      toast({
        title: "Erro no teste",
        description: "Não foi possível enviar a notificação de teste: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleSubscribeAndTest = async () => {
    console.log('🎯 [HANDLER] Iniciando processo ativar/testar');
    
    if (!isRegistered) {
      console.log('📝 [HANDLER] Não registrado, tentando ativar...');
      const success = await subscribeToPush();
      console.log('📝 [HANDLER] Resultado da ativação:', success);
      
      if (success) {
        // Wait a bit for subscription to be saved
        console.log('⏱️ [HANDLER] Aguardando 2s antes do teste...');
        setTimeout(() => {
          console.log('🧪 [HANDLER] Enviando teste após ativação');
          sendTestNotification();
        }, 2000);
      }
    } else {
      console.log('🧪 [HANDLER] Já registrado, enviando teste direto');
      sendTestNotification();
    }
  };

  return (
    <Card className="bg-card border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔔 Debug de Notificações Push
          <Badge variant={isRegistered ? "default" : "secondary"}>
            {isRegistered ? "Ativo" : "Inativo"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Navegador suporta:</strong> {isSupported ? "✅ Sim" : "❌ Não"}</p>
          <p><strong>Service Worker:</strong> {'serviceWorker' in navigator ? "✅ Disponível" : "❌ Não disponível"}</p>
          <p><strong>Push Manager:</strong> {'PushManager' in window ? "✅ Disponível" : "❌ Não disponível"}</p>
          <p><strong>Permissão atual:</strong> {Notification?.permission || 'N/A'}</p>
          <p><strong>Status da inscrição:</strong> {isRegistered ? "✅ Inscrito" : "❌ Não inscrito"}</p>
          {token && (
            <>
              <p><strong>Endpoint:</strong></p>
              <p className="text-xs break-all bg-muted p-2 rounded">{token.substring(0, 100)}...</p>
            </>
          )}
        </div>
        
        <Button 
          onClick={handleSubscribeAndTest}
          disabled={!isSupported}
          className="w-full"
        >
          {isRegistered ? "🧪 Testar Notificação" : "🔔 ATIVAR NOTIFICAÇÕES"}
        </Button>
        
        <div className="text-xs text-muted-foreground">
          <p><strong>Instruções:</strong></p>
          <p>1. Clique no botão para ativar</p>
          <p>2. Permita notificações no navegador</p>
          <p>3. Abra o console (F12) para ver logs detalhados</p>
        </div>
        
        {!isSupported && (
          <div className="p-3 bg-destructive/10 rounded border">
            <p className="text-sm text-destructive font-medium">⚠️ Não Suportado</p>
            <p className="text-xs text-destructive mt-1">
              Notificações push não são suportadas neste navegador/dispositivo.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
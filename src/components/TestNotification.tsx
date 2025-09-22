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
      toast({
        title: "Enviando notificação de teste...",
        description: "Aguarde um momento."
      });

      const { data, error } = await supabase.functions.invoke('test-push-notification', {
        body: {}
      });

      if (error) {
        throw error;
      }

      console.log('Test notification response:', data);
      
      toast({
        title: "Teste enviado!",
        description: "Verifique se recebeu a notificação."
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Erro no teste",
        description: "Não foi possível enviar a notificação de teste.",
        variant: "destructive"
      });
    }
  };

  const handleSubscribeAndTest = async () => {
    if (!isRegistered) {
      const success = await subscribeToPush();
      if (success) {
        // Wait a bit for subscription to be saved
        setTimeout(() => {
          sendTestNotification();
        }, 2000);
      }
    } else {
      sendTestNotification();
    }
  };

  return (
    <Card className="bg-card border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔔 Teste de Notificações Push
          <Badge variant={isRegistered ? "default" : "secondary"}>
            {isRegistered ? "Ativo" : "Inativo"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Suporte:</strong> {isSupported ? "✅ Suportado" : "❌ Não Suportado"}</p>
          <p><strong>Status:</strong> {isRegistered ? "✅ Inscrito" : "❌ Não inscrito"}</p>
          {token && <p><strong>Endpoint:</strong> {token.substring(0, 50)}...</p>}
        </div>
        
        <Button 
          onClick={handleSubscribeAndTest}
          disabled={!isSupported}
          className="w-full"
        >
          {isRegistered ? "Testar Notificação" : "🔔 ATIVAR NOTIFICAÇÕES"}
        </Button>
        
        {!isSupported && (
          <p className="text-sm text-destructive">
            Notificações push não são suportadas neste navegador/dispositivo.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const TestNotification = () => {
  const { toast } = useToast();
  const { isRegistered, subscribeToPush } = usePushNotifications();

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
    <div className="p-4 bg-card rounded-lg border">
      <h3 className="font-semibold mb-2">Teste de Notificações Push</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {isRegistered 
          ? "Você está inscrito para receber notificações. Clique para testar."
          : "Ative as notificações e teste o funcionamento."
        }
      </p>
      <Button onClick={handleSubscribeAndTest}>
        {isRegistered ? "Testar Notificação" : "Ativar e Testar"}
      </Button>
    </div>
  );
};
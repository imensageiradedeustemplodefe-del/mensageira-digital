import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initPushNotifications = async () => {
      // Verificar se o dispositivo suporta push notifications
      if (Capacitor.isNativePlatform()) {
        setIsSupported(true);

        // Solicitar permissões
        const permStatus = await PushNotifications.checkPermissions();
        
        if (permStatus.receive === 'prompt') {
          const permResult = await PushNotifications.requestPermissions();
          if (permResult.receive !== 'granted') {
            toast({
              title: "Permissão negada",
              description: "Não será possível enviar notificações.",
              variant: "destructive"
            });
            return;
          }
        }

        if (permStatus.receive === 'denied') {
          toast({
            title: "Notificações desabilitadas",
            description: "Ative nas configurações do aplicativo.",
            variant: "destructive"
          });
          return;
        }

        // Registrar para receber notificações
        await PushNotifications.register();
        setIsRegistered(true);

        // Listener para quando o registro é bem-sucedido
        await PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token: ' + token.value);
          setToken(token.value);
          toast({
            title: "Notificações ativadas!",
            description: "Você receberá avisos sobre novos eventos e cultos."
          });
        });

        // Listener para erros no registro
        await PushNotifications.addListener('registrationError', (error) => {
          console.error('Error on registration: ' + JSON.stringify(error));
          toast({
            title: "Erro nas notificações",
            description: "Não foi possível ativar as notificações.",
            variant: "destructive"
          });
        });

        // Listener para notificações recebidas
        await PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push received: ' + JSON.stringify(notification));
          toast({
            title: notification.title || "Nova notificação",
            description: notification.body || "Você tem uma nova mensagem."
          });
        });

        // Listener para quando usuário toca na notificação
        await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push action performed: ' + JSON.stringify(notification));
          // Aqui você pode navegar para uma página específica baseada no conteúdo da notificação
        });

      } else if ('serviceWorker' in navigator && 'PushManager' in window) {
        // Web Push para browsers
        setIsSupported(true);
        
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          
          if (subscription) {
            setIsRegistered(true);
            setToken(JSON.stringify(subscription));
          }
        } catch (error) {
          console.error('Error checking web push:', error);
        }
      }
    };

    initPushNotifications();
  }, [toast]);

  const subscribeToPush = async () => {
    if (!isSupported) return false;

    try {
      if (Capacitor.isNativePlatform()) {
        // Já tratado no useEffect
        return true;
      } else {
        // Web Push - desabilitado temporariamente até configurar VAPID keys
        toast({
          title: "Notificações web em breve",
          description: "As notificações web estão sendo configuradas. Use o app mobile para receber notificações.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast({
        title: "Erro nas notificações",
        description: "Não foi possível ativar as notificações.",
        variant: "destructive"
      });
      return false;
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Para apps nativos, você pode limpar o token localmente
        setToken(null);
        setIsRegistered(false);
      } else {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();
          setToken(null);
          setIsRegistered(false);
        }
      }
      
      toast({
        title: "Notificações desativadas",
        description: "Você não receberá mais notificações."
      });
      
      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return false;
    }
  };

  return {
    isSupported,
    isRegistered,
    token,
    subscribeToPush,
    unsubscribeFromPush
  };
};
import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();

  const saveSubscriptionToBackend = async (subscription: PushSubscription | { endpoint: string; keys: { p256dh: string; auth: string } }) => {
    try {
      console.log('Tentando salvar subscription:', subscription.endpoint);
      
      // Para aplicações sem login, permitir subscriptions anônimas
      const user = (await supabase.auth.getUser()).data.user;

      let p256dhKey = '';
      let authKey = '';
      
      if ('toJSON' in subscription) {
        // É uma PushSubscription real do browser
        const subscriptionJson = subscription.toJSON();
        p256dhKey = subscriptionJson.keys?.p256dh || '';
        authKey = subscriptionJson.keys?.auth || '';
      } else {
        // É um objeto simples (para native)
        p256dhKey = subscription.keys.p256dh;
        authKey = subscription.keys.auth;
      }

      const subscriptionData = {
        user_id: user?.id || null, // Permitir subscriptions anônimas
        endpoint: subscription.endpoint,
        p256dh: p256dhKey,
        auth: authKey,
        is_active: true
      };

      console.log('Dados da subscription:', subscriptionData);

      // Check if subscription already exists (por endpoint, não por usuário)
      const { data: existingSubscription, error: selectError } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('endpoint', subscription.endpoint)
        .maybeSingle();

      console.log('Subscription existente:', existingSubscription, 'Error:', selectError);

      if (existingSubscription) {
        // Update existing subscription
        const { error } = await supabase
          .from('push_subscriptions')
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .eq('id', existingSubscription.id);

        if (error) {
         console.log('Error updating subscription:', error);
         console.log('Error details:', JSON.stringify(error, null, 2));
        } else {
          console.log('Subscription updated successfully');
        }
      } else {
        // Create new subscription
        const { data, error } = await supabase
          .from('push_subscriptions')
          .insert([subscriptionData])
          .select();

        if (error) {
         console.log('Error saving subscription:', error);
         console.log('Error details:', JSON.stringify(error, null, 2));
        } else {
          console.log('Subscription saved successfully:', data);
        }
      }
    } catch (error) {
      console.error('Error in saveSubscriptionToBackend:', error);
    }
  };

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
        await PushNotifications.addListener('registration', async (token) => {
          console.log('Push registration success, token: ' + token.value);
          setToken(token.value);
          
          // Save subscription to backend
          await saveSubscriptionToBackend({
            endpoint: token.value,
            keys: { p256dh: '', auth: '' } // Native doesn't use these
          });
          
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
          // Navigate to URL if provided
          if (notification.notification.data?.url) {
            window.location.href = notification.notification.data.url;
          }
        });

      } else {
        // Para web, usar service worker e VAPID
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          setIsSupported(true);
          
          // Check if already subscribed
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          
          if (subscription) {
            setIsRegistered(true);
            setToken(subscription.endpoint);
          }
          
          // Check notification permission
          if (Notification.permission === 'granted') {
            setIsRegistered(!!subscription);
          }
        } else {
          console.log('Push messaging is not supported');
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
        // Para web, usar service worker com VAPID key
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          toast({
            title: "Não Suportado",
            description: "Notificações push não são suportadas neste navegador.",
            variant: "destructive",
          });
          return false;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast({
            title: "Permissão Negada",
            description: "Permissão para notificações foi negada.",
            variant: "destructive",
          });
          return false;
        }

        // Get VAPID key from backend
        const vapidResponse = await supabase.functions.invoke('get-vapid-key');
        if (vapidResponse.error) {
          console.error('Error getting VAPID key:', vapidResponse.error);
          toast({
            title: "Erro de Configuração",
            description: "Não foi possível obter as chaves de notificação.",
            variant: "destructive",
          });
          return false;
        }

        const { vapidPublicKey } = vapidResponse.data;
        console.log('Using VAPID key:', vapidPublicKey);

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey
        });

        console.log('Web subscription created:', {
          endpoint: subscription.endpoint,
          keys: subscription.toJSON().keys
        });

        await saveSubscriptionToBackend(subscription);
        setIsRegistered(true);
        setToken(subscription.endpoint);

        toast({
          title: "Sucesso!",
          description: "Notificações ativadas com sucesso.",
        });
        
        return true;
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
        // For native platforms, mark as inactive in backend
        if (token) {
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('endpoint', token);
        }
        
        setToken(null);
        setIsRegistered(false);
      } else {
        // Para web, unsubscribe from service worker
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();
          
          // Mark as inactive in backend por endpoint
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('endpoint', subscription.endpoint);
        }
        
        setToken(null);
        setIsRegistered(false);
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
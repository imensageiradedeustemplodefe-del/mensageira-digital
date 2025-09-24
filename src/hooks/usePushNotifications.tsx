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
      console.log('💾 [SAVE] Iniciando salvamento da subscription:', subscription.endpoint.substring(0, 50) + '...');
      
      // Para aplicações sem login, permitir subscriptions anônimas
      const user = (await supabase.auth.getUser()).data.user;
      console.log('👤 [SAVE] Usuário autenticado:', user ? user.id : 'ANÔNIMO');

      let p256dhKey = '';
      let authKey = '';
      
      if ('toJSON' in subscription) {
        // É uma PushSubscription real do browser
        console.log('🔧 [SAVE] Processando subscription real do browser');
        const subscriptionJson = subscription.toJSON();
        p256dhKey = subscriptionJson.keys?.p256dh || '';
        authKey = subscriptionJson.keys?.auth || '';
      } else {
        // É um objeto simples (para native)
        console.log('📱 [SAVE] Processando subscription nativa');
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

      console.log('📊 [SAVE] Dados da subscription preparados:', {
        user_id: subscriptionData.user_id,
        endpoint: subscriptionData.endpoint.substring(0, 50) + '...',
        p256dh: subscriptionData.p256dh ? 'PRESENTE' : 'AUSENTE',
        auth: subscriptionData.auth ? 'PRESENTE' : 'AUSENTE'
      });

      // Check if subscription already exists (por endpoint, não por usuário)
      console.log('🔍 [SAVE] Verificando se subscription já existe...');
      const { data: existingSubscription, error: selectError } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('endpoint', subscription.endpoint)
        .maybeSingle();

      if (selectError) {
        console.error('❌ [SAVE] Erro ao verificar subscription existente:', selectError);
        return { success: false, error: selectError };
      }

      console.log('🔍 [SAVE] Subscription existente:', existingSubscription ? 'SIM (id: ' + existingSubscription.id + ')' : 'NÃO');

      if (existingSubscription) {
        // Update existing subscription
        console.log('🔄 [SAVE] Atualizando subscription existente...');
        const { error } = await supabase
          .from('push_subscriptions')
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .eq('id', existingSubscription.id);

        if (error) {
         console.error('❌ [SAVE] Erro ao atualizar subscription:', error);
         console.error('❌ [SAVE] Detalhes do erro:', JSON.stringify(error, null, 2));
         return { success: false, error };
        } else {
          console.log('✅ [SAVE] Subscription atualizada com sucesso');
          return { success: true };
        }
      } else {
        // Create new subscription
        console.log('➕ [SAVE] Criando nova subscription...');
        const { data, error } = await supabase
          .from('push_subscriptions')
          .insert([subscriptionData])
          .select();

        if (error) {
         console.error('❌ [SAVE] Erro ao criar subscription:', error);
         console.error('❌ [SAVE] Detalhes do erro:', JSON.stringify(error, null, 2));
         return { success: false, error };
        } else {
          console.log('✅ [SAVE] Subscription criada com sucesso:', data);
          return { success: true, data };
        }
      }
    } catch (error) {
      console.error('💥 [SAVE] Erro geral no saveSubscriptionToBackend:', error);
      return { success: false, error };
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
    console.log('🔔 Iniciando processo de inscrição para push notifications');
    console.log('isSupported:', isSupported);
    
    if (!isSupported) {
      console.error('❌ Push notifications não suportadas');
      return false;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        console.log('📱 Plataforma nativa detectada');
        // Já tratado no useEffect
        return true;
      } else {
        console.log('🌐 Plataforma web detectada');
        // Para web, usar service worker com VAPID key
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          console.error('❌ Service Worker ou PushManager não disponível');
          toast({
            title: "Não Suportado",
            description: "Notificações push não são suportadas neste navegador.",
            variant: "destructive",
          });
          return false;
        }

        console.log('🔐 Solicitando permissão de notificação...');
        const permission = await Notification.requestPermission();
        console.log('Permissão:', permission);
        
        if (permission !== 'granted') {
          console.error('❌ Permissão negada');
          toast({
            title: "Permissão Negada",
            description: "Permissão para notificações foi negada.",
            variant: "destructive",
          });
          return false;
        }

        console.log('🔑 Obtendo chave VAPID do backend...');
        // Get VAPID key from backend
        const vapidResponse = await supabase.functions.invoke('get-vapid-key');
        console.log('Resposta VAPID completa:', vapidResponse);
        
        if (vapidResponse.error) {
          console.error('❌ Erro ao obter chave VAPID:', vapidResponse.error);
          toast({
            title: "Erro de Configuração",
            description: "Não foi possível obter as chaves de notificação: " + vapidResponse.error.message,
            variant: "destructive",
          });
          return false;
        }

        const { vapidPublicKey } = vapidResponse.data;
        if (!vapidPublicKey) {
          console.error('❌ Chave VAPID não encontrada na resposta');
          toast({
            title: "Erro de Configuração", 
            description: "Chave VAPID não foi encontrada.",
            variant: "destructive",
          });
          return false;
        }
        
        // Validate VAPID key format
        if (typeof vapidPublicKey !== 'string' || vapidPublicKey.length < 10) {
          console.error('❌ Chave VAPID inválida:', vapidPublicKey);
          toast({
            title: "Erro de Configuração", 
            description: "Chave VAPID tem formato inválido.",
            variant: "destructive",
          });
          return false;
        }
        
        console.log('✅ Chave VAPID obtida:', vapidPublicKey?.substring(0, 20) + '...', 'Tamanho:', vapidPublicKey.length);

        console.log('⚙️ Obtendo Service Worker...');
        const registration = await navigator.serviceWorker.ready;
        console.log('Service Worker pronto');
        
        console.log('📝 Convertendo chave VAPID...');
        // Convert base64 VAPID key to Uint8Array with better error handling
        const urlBase64ToUint8Array = (base64String: string) => {
          try {
            console.log('🔧 String original:', base64String?.substring(0, 20) + '...');
            
            // Remove any whitespace
            base64String = base64String.trim();
            
            // Add padding if needed
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding)
              .replace(/\-/g, '+')
              .replace(/_/g, '/');
            
            console.log('🔧 String após conversão:', base64?.substring(0, 20) + '...');
            
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; ++i) {
              outputArray[i] = rawData.charCodeAt(i);
            }
            
            console.log('🔧 Array gerado, tamanho:', outputArray.length);
            return outputArray;
            
          } catch (error) {
            console.error('❌ Erro na conversão VAPID:', error);
            console.error('❌ String problemática:', base64String);
            throw new Error('Erro ao converter chave VAPID: ' + error.message);
          }
        };
        
        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        console.log('✅ Chave convertida para Uint8Array com sucesso');
        
        console.log('📝 Criando subscription...');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey
        });

        console.log('✅ Subscription criada:', {
          endpoint: subscription.endpoint.substring(0, 50) + '...',
          keys: subscription.toJSON().keys
        });

        console.log('💾 Salvando subscription no backend...');
        const saveResult = await saveSubscriptionToBackend(subscription);
        console.log('Resultado do salvamento:', saveResult);
        
        setIsRegistered(true);
        setToken(subscription.endpoint);

        console.log('🎉 Processo concluído com sucesso!');
        toast({
          title: "Sucesso!",
          description: "Notificações ativadas com sucesso.",
        });
        
        return true;
      }
    } catch (error) {
      console.error('💥 Erro no processo de inscrição:', error);
      console.error('Stack trace completo:', error.stack);
      toast({
        title: "Erro nas notificações",
        description: "Erro detalhado: " + (error.message || error.toString()),
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
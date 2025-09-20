import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useNotificationCount = () => {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const { count: subscriptionCount, error } = await supabase
          .from('push_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        if (error) {
          console.error('Erro ao buscar contagem de notificações:', error);
          setCount(0);
        } else {
          setCount(subscriptionCount || 0);
        }
      } catch (error) {
        console.error('Erro inesperado:', error);
        setCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCount();

    // Configurar escuta em tempo real para mudanças nas subscriptions
    const subscription = supabase
      .channel('push_subscriptions_count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'push_subscriptions'
        },
        () => {
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { count, isLoading };
};
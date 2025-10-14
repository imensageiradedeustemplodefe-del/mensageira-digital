import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCacheManager } from './useCacheManager';

export const useServiceWorkerUpdate = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { toast } = useToast();
  const { clearCacheAutomatically } = useCacheManager();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Escuta mensagens do service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          setUpdateAvailable(true);
          
          // Apenas notifica, sem recarregar automaticamente
          toast({
            title: "Nova versão disponível!",
            description: "Clique para atualizar o app.",
            duration: 10000,
          });
          
          // Aguarda ação do usuário
          setUpdateAvailable(true);
        }
      });

      // Verifica se há um service worker aguardando
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          setUpdateAvailable(true);
          // Força a ativação do novo service worker
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        // Escuta por novos service workers
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      });

      // Verifica por atualizações periodicamente (a cada 1 hora)
      const interval = setInterval(() => {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      }, 60 * 60 * 1000); // 1 hora

      return () => clearInterval(interval);
    }
  }, [toast]);

  const forceUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        // Força recarregamento
        window.location.reload();
      });
    }
  };

  return { updateAvailable, forceUpdate };
};
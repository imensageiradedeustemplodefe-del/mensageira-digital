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
          
          // Mostra notificação de atualização disponível
          toast({
            title: "Nova versão disponível!",
            description: "O app foi atualizado automaticamente com as últimas melhorias.",
            duration: 5000,
          });

          // Limpa cache e recarrega a página após um breve delay
          clearCacheAutomatically();
          setTimeout(() => {
            window.location.reload();
          }, 2000);
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

      // Verifica por atualizações periodicamente (a cada 30 segundos)
      const interval = setInterval(() => {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      }, 30000);

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
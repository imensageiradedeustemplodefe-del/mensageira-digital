import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useCacheManager = () => {
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Detecta quando a página foi recarregada
    const handlePageLoad = () => {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const isReload = navigationEntries.length > 0 && 
        (navigationEntries[0].type === 'reload' || 
         window.performance.navigation?.type === 1);

      if (isReload) {
        console.log('Page reload detected - clearing cache automatically');
        clearCacheAutomatically();
      }
    };

    // Executa na primeira carga
    handlePageLoad();

    // Escuta mensagens do service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_CLEARED') {
          toast({
            title: "Cache Atualizado",
            description: "Versão mais recente carregada com sucesso!",
            duration: 3000,
          });
        }
      });
    }

    // Força limpeza do cache no beforeunload (antes de sair da página)
    const handleBeforeUnload = () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'FORCE_UPDATE' });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [toast]);

  const clearCacheAutomatically = async () => {
    if (isClearing) return;
    
    setIsClearing(true);
    
    try {
      // Limpa cache do navegador
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log('Clearing browser cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }

      // Comunica com o service worker para limpeza adicional
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            console.log('Service worker cache cleared successfully');
          }
        };

        navigator.serviceWorker.controller.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
      }

      // Força recarregamento dos recursos sem cache
      const timestamp = Date.now();
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      links.forEach((link: any) => {
        if (link.href) {
          const url = new URL(link.href);
          url.searchParams.set('v', timestamp.toString());
          link.href = url.toString();
        }
      });

      console.log('Cache clearing completed');
      
    } catch (error) {
      console.error('Error clearing cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const forceClearCache = async () => {
    await clearCacheAutomatically();
    
    toast({
      title: "Cache Limpo",
      description: "Cache limpo manualmente. Atualizando página...",
      duration: 2000,
    });
    
    // Recarrega a página após limpar o cache
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Limpa cache automaticamente a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Scheduled cache refresh');
      clearCacheAutomatically();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  return { 
    isClearing, 
    forceClearCache,
    clearCacheAutomatically 
  };
};
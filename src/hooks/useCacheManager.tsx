import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useCacheManager = () => {
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
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
  }, [toast]);

  const clearCacheAutomatically = async () => {
    if (isClearing) return;
    
    setIsClearing(true);
    
    try {
      // Força recarregamento dos arquivos CSS para garantir estilos atualizados
      const timestamp = Date.now();
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      links.forEach((link: any) => {
        if (link.href) {
          const url = new URL(link.href);
          url.searchParams.set('v', timestamp.toString());
          link.href = url.toString();
        }
      });

      // Comunica com o service worker para limpeza seletiva de outros recursos
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            console.log('Service worker cache cleared selectively - CSS refreshed');
          } else {
            console.error('Cache clearing failed:', event.data.error);
          }
        };

        // Usa limpeza seletiva que preserva apenas imagens e recursos estáticos
        navigator.serviceWorker.controller.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
      }

      console.log('Selective cache clearing completed - CSS updated, other resources preserved');
      
    } catch (error) {
      console.error('Error clearing cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const forceClearCache = async () => {
    await clearCacheAutomatically();
    
    toast({
      title: "Cache Atualizado",
      description: "Cache limpo preservando estilos",
      duration: 2000,
    });
  };

  // Função para limpeza completa quando realmente necessário
  const clearAllCache = async () => {
    if (isClearing) return;
    
    setIsClearing(true);
    
    try {
      // Limpa tudo incluindo CSS (pode causar perda temporária de estilo)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            console.log('Complete cache cleared - styles may be affected');
          }
        };

        navigator.serviceWorker.controller.postMessage(
          { type: 'CLEAR_ALL_CACHE' },
          [messageChannel.port2]
        );
      }
      
      toast({
        title: "Cache Completamente Limpo",
        description: "Recarregando página para restaurar estilos...",
        duration: 2000,
      });
      
      // Recarrega a página para restaurar estilos
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Error clearing all cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  // Removido: cache só é limpo quando usuário clica em atualizar

  return { 
    isClearing, 
    forceClearCache,
    clearCacheAutomatically,
    clearAllCache
  };
};
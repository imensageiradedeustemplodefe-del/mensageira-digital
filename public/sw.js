const CACHE_NAME = 'mensageira-app-v1.3';
const OFFLINE_URL = '/offline.html';

// URLs essenciais para cache
const ESSENTIAL_FILES = [
  '/',
  '/offline.html',
  '/manifest.json',
];

// URLs de API que devem ser cached
const API_CACHE_URLS = [
  '/rest/v1/site_settings',
  '/rest/v1/daily_verses',
  '/rest/v1/events'
];

// Durações de cache
const CACHE_MAX_AGE = {
  images: 30 * 24 * 60 * 60 * 1000, // 30 dias
  static: 7 * 24 * 60 * 60 * 1000,  // 7 dias  
  api: 5 * 60 * 1000,                 // 5 minutos
};

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Install - nova versão detectada');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching essential files');
        return cache.addAll(ESSENTIAL_FILES);
      })
      .then(() => {
        console.log('[SW] Skip waiting - forçando ativação imediata');
        return self.skipWaiting();
      })
  );
});

// Ativar service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate - limpando caches antigos');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('[SW] Clients claim - tomando controle de todas as páginas');
      return self.clients.claim();
    }).then(() => {
      // Notifica todos os clientes sobre a atualização
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_UPDATED',
            message: 'Service Worker atualizado com sucesso!'
          });
        });
      });
    })
  );
});

// Interceptar requisições (estratégia offline-first para recursos estáticos)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') return;

  // Ignorar requisições externas não relacionadas ao app
  if (!url.origin === location.origin && !url.pathname.startsWith('/api')) return;

  // Permitir streaming de áudio para continuar em background
  if (request.destination === 'audio' || request.url.includes('.mp3') || request.url.includes('.m3u8') || request.url.includes('stream')) {
    // Para áudio, usar estratégia de rede primeiro para garantir stream em tempo real
    event.respondWith(
      fetch(request).catch(() => {
        // Se falhar, tentar cache como fallback
        return caches.match(request);
      })
    );
    return;
  }

  // Estratégia Cache First para recursos estáticos
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image') {
    
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            // Encontrou no cache, retornar e atualizar em background
            fetch(request).then((fetchResponse) => {
              if (fetchResponse && fetchResponse.status === 200) {
                cache.put(request, fetchResponse.clone());
              }
            }).catch(() => {
              // Falha na rede é ok quando temos cache
            });
            return response;
          } else {
            // Não encontrou no cache, buscar na rede
            return fetch(request).then((fetchResponse) => {
              if (fetchResponse && fetchResponse.status === 200) {
                cache.put(request, fetchResponse.clone());
              }
              return fetchResponse;
            }).catch(() => {
              // Se é uma página e não conseguimos carregar, mostrar página offline
              if (request.destination === 'document') {
                return caches.match(OFFLINE_URL);
              }
            });
          }
        });
      })
    );
  }
  
  // Estratégia Network First para dados da API
  else if (url.pathname.startsWith('/api') || API_CACHE_URLS.some(apiUrl => url.pathname.includes(apiUrl))) {
    event.respondWith(
      fetch(request).then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Se falhar na rede, tentar cache
        return caches.match(request);
      })
    );
  }
});

// Controles de mídia em segundo plano
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    
    // Notificar cliente sobre a atualização
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'SW_UPDATED',
          message: 'Service Worker atualizado!'
        });
      });
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    const preservePatterns = [
      '/lovable-uploads/', // Imagens do projeto
      '/favicon', // Favicons
      '/manifest.json', // Manifest PWA
      '.png',     // Imagens
      '.jpg',     // Imagens
      '.jpeg',    // Imagens
      '.svg',     // Ícones
      '.webp',    // Imagens
    ];

    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map(async (cacheName) => {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          
          // Filtrar e deletar CSS/JS para forçar atualização, preservar apenas imagens
          const keysToDelete = keys.filter(request => {
            const url = request.url;
            // Preservar apenas imagens e recursos estáticos não críticos
            return !preservePatterns.some(pattern => url.includes(pattern));
          });

          console.log('[SW] Clearing cache entries (including CSS/JS):', keysToDelete.length, 'of', keys.length);
          
          // Deletar CSS, JS e outros recursos para forçar atualização
          return Promise.all(
            keysToDelete.map(request => cache.delete(request))
          );
        })
      );
    }).then(() => {
      console.log('[SW] Cache cleared selectively - images preserved, CSS/JS updated');
      event.ports[0].postMessage({ success: true });
    }).catch((error) => {
      console.error('[SW] Error clearing cache:', error);
      event.ports[0].postMessage({ success: false, error: error.message });
    });
  }

  // Nova opção para limpeza completa (se necessário)
  if (event.data && event.data.type === 'CLEAR_ALL_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Clearing all cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[SW] All cache cleared completely');
      event.ports[0].postMessage({ success: true });
    });
  }

  // Suporte para controles de mídia
  if (event.data && event.data.type === 'MEDIA_SESSION_UPDATE') {
    const { title, artist, artwork } = event.data;
    console.log('[SW] Media session update:', { title, artist });
    
    // Configurar metadata para controles do sistema
    if ('mediaSession' in self) {
      self.mediaSession.metadata = new MediaMetadata({
        title: title || 'Rádio Gospel',
        artist: artist || 'Mensageira de Deus',
        album: 'Transmissão ao vivo',
        artwork: artwork || [
          { src: '/lovable-uploads/a66b8df0-078f-4966-91ac-e6ead39aced4.png', sizes: '192x192', type: 'image/png' }
        ]
      });
    }
  }
});
const CACHE_NAME = 'mensageira-app-v1.1';
const OFFLINE_URL = '/offline.html';

// URLs essenciais para cache
const ESSENTIAL_FILES = [
  '/',
  '/offline.html',
  '/manifest.json',
  // Adicionar outros recursos críticos aqui
];

// URLs de API que devem ser cached
const API_CACHE_URLS = [
  // Adicionar endpoints da API aqui quando disponíveis
];

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching essential files');
        return cache.addAll(ESSENTIAL_FILES);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        self.skipWaiting();
      })
  );
});

// Ativar service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  
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
      console.log('[SW] Clients claim');
      self.clients.claim();
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

// Escutar mensagens do cliente
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
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Clearing cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Push notifications (quando disponível)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  const options = {
    body: 'Você tem uma nova mensagem da igreja!',
    icon: '/lovable-uploads/a66b8df0-078f-4966-91ac-e6ead39aced4.png',
    badge: '/lovable-uploads/a66b8df0-078f-4966-91ac-e6ead39aced4.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir App'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data.url = data.url || options.data.url;
  }

  event.waitUntil(
    self.registration.showNotification('Mensageira de Deus', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const url = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Verificar se já existe uma janela aberta
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Abrir nova janela
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
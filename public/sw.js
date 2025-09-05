// Service Worker for Mensageira de Deus Templo de Fé PWA
const CACHE_VERSION = 'mensageira-deus-v' + Date.now();
const CACHE_NAME = CACHE_VERSION;
const urlsToCache = [
  '/',
  '/sobre',
  '/eventos', 
  '/live',
  '/contato',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Função para limpar todos os caches
function clearAllCaches() {
  return caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.map(cacheName => {
        console.log('Service Worker: Clearing cache', cacheName);
        return caches.delete(cacheName);
      })
    );
  });
}

// Install event - força atualização imediata
self.addEventListener('install', function(event) {
  console.log('Service Worker: Installing new version');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Força o service worker a se tornar ativo imediatamente
        return self.skipWaiting();
      })
  );
});

// Activate event - limpa caches antigos e toma controle imediatamente
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activating new version');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Força todos os clientes a usar a nova versão
      return self.clients.claim();
    }).then(() => {
      // Notifica todos os clientes que uma atualização foi instalada
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            message: 'Nova versão disponível!'
          });
        });
      });
    })
  );
});

// Fetch event - estratégia network-first para sempre buscar a versão mais recente
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Se a rede funcionou, atualiza o cache e retorna a resposta
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(function() {
        // Se a rede falhou, usa o cache
        return caches.match(event.request);
      })
  );
});

// Escuta mensagens dos clientes
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Força limpeza completa do cache
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      clearAllCaches().then(() => {
        // Notifica o cliente que o cache foi limpo
        event.ports[0].postMessage({ success: true });
      })
    );
  }
  
  // Força atualização e limpeza
  if (event.data && event.data.type === 'FORCE_UPDATE') {
    event.waitUntil(
      clearAllCaches().then(() => {
        return self.clients.matchAll();
      }).then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'CACHE_CLEARED',
            message: 'Cache limpo com sucesso!'
          });
        });
      })
    );
  }
});
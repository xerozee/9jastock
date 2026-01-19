const CACHE_NAME = '9jastock-v1';
const DATA_CACHE_NAME = '9jastock-data-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/apple-touch-icon.png'
];

const SYNC_TAGS = {
  STOCK_DATA: 'sync-stock-data',
  PORTFOLIO: 'sync-portfolio',
  NEWS: 'sync-news'
};

const PERIODIC_SYNC_TAG = 'periodic-stock-update';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'New notification from 9jaStock',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
        type: data.type || 'general',
      },
      actions: data.actions || [],
      tag: data.tag || 'default',
      renotify: true,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || '9jaStock Alert', options)
    );
  } catch (error) {
    console.error('Push notification error:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((response) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response);
          });
        });
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });
    })
  );
});

// Background Sync - Triggered when connection is restored
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === SYNC_TAGS.STOCK_DATA) {
    event.waitUntil(syncStockData());
  } else if (event.tag === SYNC_TAGS.PORTFOLIO) {
    event.waitUntil(syncPortfolio());
  } else if (event.tag === SYNC_TAGS.NEWS) {
    event.waitUntil(syncNews());
  }
});

// Periodic Background Sync - Fetches data at regular intervals
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync triggered:', event.tag);
  
  if (event.tag === PERIODIC_SYNC_TAG) {
    event.waitUntil(fetchAndCacheStockData());
  }
});

// Fetch and cache stock data
async function fetchAndCacheStockData() {
  try {
    const response = await fetch('/api/stocks');
    if (response.ok) {
      const cache = await caches.open(DATA_CACHE_NAME);
      await cache.put('/api/stocks', response.clone());
      
      // Notify clients about the update
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'STOCK_DATA_UPDATED',
          timestamp: Date.now()
        });
      });
      
      console.log('[SW] Stock data cached successfully');
      return response.json();
    }
  } catch (error) {
    console.error('[SW] Failed to fetch stock data:', error);
  }
}

// Sync stock data when back online
async function syncStockData() {
  try {
    const data = await fetchAndCacheStockData();
    console.log('[SW] Stock data synced:', data?.length || 0, 'stocks');
  } catch (error) {
    console.error('[SW] Stock sync failed:', error);
  }
}

// Sync portfolio data
async function syncPortfolio() {
  try {
    const response = await fetch('/api/portfolio');
    if (response.ok) {
      const cache = await caches.open(DATA_CACHE_NAME);
      await cache.put('/api/portfolio', response.clone());
      console.log('[SW] Portfolio synced');
    }
  } catch (error) {
    console.error('[SW] Portfolio sync failed:', error);
  }
}

// Sync news data
async function syncNews() {
  try {
    const response = await fetch('/api/news');
    if (response.ok) {
      const cache = await caches.open(DATA_CACHE_NAME);
      await cache.put('/api/news', response.clone());
      console.log('[SW] News synced');
    }
  } catch (error) {
    console.error('[SW] News sync failed:', error);
  }
}

// Message handler for client communication
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'REQUEST_SYNC') {
    const tag = event.data.tag || SYNC_TAGS.STOCK_DATA;
    self.registration.sync.register(tag).catch(err => {
      console.error('[SW] Sync registration failed:', err);
    });
  }
});

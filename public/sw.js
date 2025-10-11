// Service Worker for caching and offline functionality
const CACHE_NAME = 'fitfusion-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/src/main.tsx',
  '/src/index.css'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE)
        .then(cache => {
          return fetch(request)
            .then(response => {
              // Only cache successful responses
              if (response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => {
              // Return cached version if available
              return cache.match(request);
            });
        })
    );
    return;
  }

  // Handle static files
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cache the response
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(request, responseToCache);
              });

            return response;
          });
      })
  );
});
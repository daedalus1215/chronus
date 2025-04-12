/// <reference lib="webworker" />

const CACHE_NAME = 'chronus-cache-v1';

// Add URLs that should be cached for offline access
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // For API requests, try network first, then return offline response
        if (event.request.url.includes('/api/')) {
          return fetch(event.request)
            .catch(() => new Response(JSON.stringify({ error: 'You are offline' }), {
              headers: { 'Content-Type': 'application/json' }
            }));
        }

        // For other requests, try network and cache successful responses
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return a fallback HTML page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return new Response('Offline content not available');
          });
      })
  );
}); 
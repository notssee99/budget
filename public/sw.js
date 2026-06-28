const CACHE_NAME = 'budgetapp-v1';
const urlsToCache = [
  '/',
  '/expenses',
  '/goals',
  '/statistics',
  '/calendar',
  '/reports',
  '/insights',
  '/settings',
];

// ---------------------------------------------------------------------------
// Install: pre-cache all app shell routes
// ---------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  // Activate immediately without waiting for existing clients to close
  self.skipWaiting();
});

// ---------------------------------------------------------------------------
// Activate: remove stale caches from previous versions
// ---------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// ---------------------------------------------------------------------------
// Fetch: network-first, fall back to cache
// ---------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  // Only handle GET requests; skip cross-origin requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Clone before consuming — response body can only be read once
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      })
      .catch(() =>
        caches.match(event.request).then(
          (cachedResponse) =>
            cachedResponse ??
            new Response('Offline — no cached version available.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' },
            })
        )
      )
  );
});

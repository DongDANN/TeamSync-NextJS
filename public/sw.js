const CACHE_NAME = 'teamsync-v1'
const STATIC_CACHE = 'teamsync-static-v1'

/* ── Install: pre-warm caches ── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(() => self.skipWaiting())
  )
})

/* ── Activate: clean old caches ── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key.startsWith('teamsync-'))
          .map((key) => caches.delete(key))
      )
    ).then(() => clients.claim())
  )
})

/* ── Fetch: network-first, fall back to cache ── */
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip browser extension requests
  if (!event.request.url.startsWith(self.location.origin)) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for offline use
        if (response.ok || response.type === 'opaqueredirect') {
          const clone = response.clone()
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(event.request, clone)
          })
        }
        return response
      })
      .catch(() => {
        // Offline — serve from cache
        return caches.match(event.request).then((cached) => {
          return cached || new Response('Offline', { status: 503 })
        })
      })
  )
})

const cacheName = 'butonica v1.7'

const cacheAsset = [
    'index.html',
    'style.css',
    'script.js'
]

self.addEventListener('install', e => e.waitUntil(caches.open(cacheName)
    .then(cache => cache.addAll(cacheAsset))
    .then(() => self.skipWaiting())
))

self.addEventListener('activate', e => e.waitUntil(
    caches.keys().then(cacheName => Promise.all(cacheName.map(cache => {
            if (cache !== cacheName) {
                return caches.delete(cache)
            }
        }))
    )
))

self.addEventListener('fetch', e => e.respondWith(fetch(e.request).catch(() => caches.match(e.request))))

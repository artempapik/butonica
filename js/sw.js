const cacheAsset = [
    'cart.png',
    'checkout.png',
    'courier.png',
    'delivery.png',
    'empty-box.webp',
    'empty-flower.png',
    'exchange.png',
    'order.png',
    'parsley.png',
    'pickup.png',
    'rent.png',
    'surcharge.png',
    'today.png',
    'trash.png',
    'water.png',
    'withdrawal.png'
]

self.addEventListener('install', e => e.waitUntil(caches.open('butonica')
    .then(cache => cache.addAll(cacheAsset.map(n => '../img' + n)))
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

const cacheName = 'butonica'

const cacheAsset = [
    'img/cart.png',
    'img/check.png',
    'img/checkout.png',
    'img/close.png',
    'img/courier.png',
    'img/decline.png',
    'img/delivery.png',
    'img/empty-box.webp',
    'img/empty-flower.webp',
    'img/exchange.png',
    'img/instagram.png',
    'img/no-signal.png',
    'img/order.png',
    'img/parsley.png',
    'img/pickup.png',
    'img/rent.png',
    'img/surcharge.png',
    'img/today.png',
    'img/trash.png',
    'img/water.png',
    'img/withdrawal.png'
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

// self.addEventListener('push', e => {
//     e.waitUntil(self.registration.showNotification('Test Message from Butonica', {
//         body: 'Hello from Notification API beach'
//     }))
// })

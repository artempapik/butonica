const cacheName = 'butonica'

const cacheAsset = [
    'index.html',
    'manifest.json',
    'css/cash-register.css',
    'css/category.css',
    'css/client.css',
    'css/company.css',
    'css/contractor.css',
    'css/employee.css',
    'css/flavor.css',
    'css/general-statistics.css',
    'css/inventory.css',
    'css/label.css',
    'css/leftover.css',
    'css/order.css',
    'css/product.css',
    'css/sale.css',
    'css/shift.css',
    'css/stock.css',
    'css/store-expense.css',
    'css/style.css',
    'css/supply.css',
    'css/waste.css',
    'img/add_note.png',
    'img/calendar.png',
    'img/cart.png',
    'img/check.png',
    'img/checkout.png',
    'img/clock.png',
    'img/close.png',
    'img/courier.png',
    'img/decline.png',
    'img/delivery.png',
    'img/empty-box.webp',
    'img/empty-flower.webp',
    'img/exchange.png',
    'img/git.png',
    'img/instagram.png',
    'img/no-signal.png',
    'img/note.png',
    'img/order.png',
    'img/parsley_pwa_192.png',
    'img/parsley_pwa.png',
    'img/parsley.png',
    'img/period.png',
    'img/pickup.png',
    'img/refresh.png',
    'img/rent.png',
    'img/search.png',
    'img/surcharge.png',
    'img/time_left.png',
    'img/today.png',
    'img/trash.png',
    'img/water.png',
    'img/withdrawal.png',
    'js/all-orders.js',
    'js/cash-register.js',
    'js/category.js',
    'js/client.js',
    'js/company.js',
    'js/completed-orders.js',
    'js/contractor.js',
    'js/employee.js',
    'js/flavor.js',
    'js/general-statistics.js',
    'js/inventory.js',
    'js/label.js',
    'js/leftover.js',
    'js/pending-orders.js',
    'js/product.js',
    'js/sale.js',
    'js/script.js',
    'js/shift.js',
    'js/stock.js',
    'js/store-expense.js',
    'js/supply.js',
    'js/waste.js',
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

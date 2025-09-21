// Service Worker for Offline Support
const CACHE_NAME = 'hedera-agrifund-v1.0.0';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles/modern-ui.css',
    '/styles/hero-canvas.css',
    '/js/app.js',
    '/js/modern-ui.js',
    '/js/language-manager.js',
    '/js/performance-optimizer.js',
    '/js/accessibility-manager.js',
    '/js/toast-notifications.js',
    '/js/skeleton-loader.js',
    '/js/micro-interactions.js',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle API requests
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirstStrategy(request));
        return;
    }

    // Handle static assets
    if (STATIC_ASSETS.includes(url.pathname)) {
        event.respondWith(cacheFirstStrategy(request));
        return;
    }

    // Handle other requests
    event.respondWith(staleWhileRevalidateStrategy(request));
});

// Cache strategies
async function cacheFirstStrategy(request) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || fetch(request);
}

async function networkFirstStrategy(request) {
    const dynamicCache = await caches.open(DYNAMIC_CACHE);
    
    try {
        const networkResponse = await fetch(request);
        dynamicCache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        const cachedResponse = await dynamicCache.match(request);
        return cachedResponse || new Response(
            JSON.stringify({ error: 'Offline - data not available' }),
            { 
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

async function staleWhileRevalidateStrategy(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        cache.put(request, networkResponse.clone());
        return networkResponse;
    });

    return cachedResponse || fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(syncOfflineActions());
    }
});

async function syncOfflineActions() {
    const offlineActions = await getOfflineActions();
    
    for (const action of offlineActions) {
        try {
            await processOfflineAction(action);
            await removeOfflineAction(action.id);
        } catch (error) {
            console.error('Failed to sync offline action:', error);
        }
    }
}

// Push notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New update available',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Details',
                icon: '/assets/icons/icon-32x32.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/icons/icon-32x32.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Hedera AgriFund', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Utility functions for offline storage
async function getOfflineActions() {
    // Implementation would depend on IndexedDB or similar storage
    return [];
}

async function processOfflineAction(action) {
    // Process the offline action when back online
    console.log('Processing offline action:', action);
}

async function removeOfflineAction(actionId) {
    // Remove processed action from offline storage
    console.log('Removing offline action:', actionId);
}
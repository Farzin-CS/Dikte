/**
 * Service Worker for Dikte App
 * Provides offline functionality, caching, and background sync
 */

const CACHE_NAME = 'dikte-app-v1.0.0';
const STATIC_CACHE = 'dikte-static-v1.0.0';
const DYNAMIC_CACHE = 'dikte-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/manifest.json',
    '/assets/css/styles.css',
    '/assets/js/app.js',
    '/assets/js/storage-manager.js',
    '/assets/js/ui-manager.js',
    '/assets/js/dikte-manager.js',
    '/assets/js/practice-manager.js',
    '/assets/js/audio-manager.js',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;200;300;400;500;600;700;800;900&display=swap'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Static files cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Error caching static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle different types of requests
    if (isStaticFile(request)) {
        event.respondWith(handleStaticFile(request));
    } else if (isApiRequest(request)) {
        event.respondWith(handleApiRequest(request));
    } else {
        event.respondWith(handleDynamicRequest(request));
    }
});

// Check if request is for a static file
function isStaticFile(request) {
    const url = new URL(request.url);
    return STATIC_FILES.includes(url.pathname) || 
           url.pathname.startsWith('/assets/') ||
           url.origin === 'https://cdn.tailwindcss.com' ||
           url.origin === 'https://fonts.googleapis.com' ||
           url.origin === 'https://fonts.gstatic.com';
}

// Check if request is for API
function isApiRequest(request) {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/');
}

// Handle static file requests
async function handleStaticFile(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Fallback to network
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('Error handling static file:', error);
        
        // Return offline page for HTML requests
        if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html');
        }
        
        throw error;
    }
}

// Handle API requests
async function handleApiRequest(request) {
    try {
        // Try network first for API requests
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Error handling API request:', error);
        
        // Try cache as fallback
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return error response
        return new Response(
            JSON.stringify({ error: 'Network error', offline: true }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Handle dynamic requests
async function handleDynamicRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Error handling dynamic request:', error);
        
        // Try cache as fallback
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(handleBackgroundSync());
    }
});

// Handle background sync
async function handleBackgroundSync() {
    try {
        // Get pending actions from IndexedDB
        const pendingActions = await getPendingActions();
        
        for (const action of pendingActions) {
            try {
                await processPendingAction(action);
                await removePendingAction(action.id);
            } catch (error) {
                console.error('Error processing pending action:', error);
            }
        }
    } catch (error) {
        console.error('Error in background sync:', error);
    }
}

// Get pending actions from IndexedDB
async function getPendingActions() {
    // This would be implemented based on your storage structure
    return [];
}

// Process pending action
async function processPendingAction(action) {
    // This would be implemented based on your action types
    console.log('Processing action:', action);
}

// Remove pending action
async function removePendingAction(actionId) {
    // This would be implemented based on your storage structure
    console.log('Removing action:', actionId);
}

// Push notification handling
self.addEventListener('push', (event) => {
    console.log('Push notification received:', event);
    
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'پیام جدید دریافت شد',
            icon: '/assets/icons/icon-192x192.png',
            badge: '/assets/icons/badge-72x72.png',
            vibrate: [200, 100, 200],
            data: {
                url: data.url || '/',
                timestamp: Date.now()
            },
            actions: [
                {
                    action: 'open',
                    title: 'مشاهده',
                    icon: '/assets/icons/action-open.png'
                },
                {
                    action: 'close',
                    title: 'بستن',
                    icon: '/assets/icons/action-close.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'دیکته', options)
        );
    }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);
    
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
    console.log('Message received in SW:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                    return cache.addAll(event.data.urls);
                })
        );
    }
});

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
});

// Unhandled rejection handling
self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker unhandled rejection:', event.reason);
});

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
    self.addEventListener('periodicsync', (event) => {
        console.log('Periodic sync triggered:', event.tag);
        
        if (event.tag === 'content-sync') {
            event.waitUntil(syncContent());
        }
    });
}

// Sync content periodically
async function syncContent() {
    try {
        // Sync latest content
        const response = await fetch('/api/sync');
        if (response.ok) {
            const data = await response.json();
            // Update cache with new content
            console.log('Content synced:', data);
        }
    } catch (error) {
        console.error('Error syncing content:', error);
    }
}

// Cache size management
async function manageCacheSize() {
    const cacheNames = [STATIC_CACHE, DYNAMIC_CACHE];
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        // Keep only the most recent 50 items
        if (keys.length > 50) {
            const keysToDelete = keys.slice(0, keys.length - 50);
            await Promise.all(keysToDelete.map(key => cache.delete(key)));
        }
    }
}

// Run cache management periodically
setInterval(manageCacheSize, 24 * 60 * 60 * 1000); // Every 24 hours

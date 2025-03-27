// Service Worker for offline functionality
const CACHE_NAME = 'file-converter-v1';
const OFFLINE_URL = 'offline.html';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/scripts/main.js',
    '/scripts/converter.js',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png'
];

// Install service worker and cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Serve cached content when offline
self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(OFFLINE_URL))
        );
    } else {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(event.request))
        );
    }
});

// Clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Basic offline detection
window.addEventListener('online', () => {
    document.documentElement.classList.remove('offline');
    const onlineEvent = new CustomEvent('appOnline');
    document.dispatchEvent(onlineEvent);
});

window.addEventListener('offline', () => {
    document.documentElement.classList.add('offline');
    const offlineEvent = new CustomEvent('appOffline');
    document.dispatchEvent(offlineEvent);
});

// Check initial connection status
if (!navigator.onLine) {
    document.documentElement.classList.add('offline');
}

// Basic offline operations
const offlineConverters = {
    'jpg-to-pdf': async (file, options) => {
        return await FileConverter.convertImageToPdf(file, options);
    },
    'merge-pdf': async (files) => {
        return await FileConverter.mergePdfs(files);
    }
};

document.addEventListener('appOffline', () => {
    // Disable tools that require online connection
    document.querySelectorAll('.tool-card').forEach(card => {
        const tool = card.getAttribute('data-tool');
        if (!offlineConverters[tool]) {
            card.classList.add('disabled');
            card.title = 'This tool requires an internet connection';
        }
    });
});

document.addEventListener('appOnline', () => {
    // Re-enable all tools
    document.querySelectorAll('.tool-card.disabled').forEach(card => {
        card.classList.remove('disabled');
        card.removeAttribute('title');
    });
});
// service-worker.js
// Aggressive caching of GitHub raw URLs for Cloudflare Pages
// Caches external GitHub images to improve performance

const CACHE_VERSION = 'v1';
const CACHE_NAME = `forte-cards-${CACHE_VERSION}`;

// Cache duration
const CACHE_DURATION_DAYS = 30;
const CACHE_DURATION_MS = CACHE_DURATION_DAYS * 24 * 60 * 60 * 1000;

// URL patterns to cache
const GITHUB_IMAGE_PATTERN = /raw\.githubusercontent\.com.*\.(webp|png)$/i;
const LOCAL_ASSET_PATTERN = /\.(js|css|webp|png|jpg|svg)$/i;

/**
 * Install event - prepare cache
 */
self.addEventListener('install', event => {
    console.log('[SW] Installing service worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Cache opened');
            // Could pre-cache critical assets here
            return cache.addAll([
                '/',
                '/index.html',
                '/js/app.js',
                '/js/gallery.js',
                '/js/webp-loader.js'
            ].filter(url => url));
        }).catch(err => {
            console.error('[SW] Cache pre-population failed:', err);
        })
    );
    
    self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', event => {
    console.log('[SW] Activating service worker...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName.startsWith('forte-cards-')) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    return self.clients.claim();
});

/**
 * Fetch event - intercept and cache
 */
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Check if this is a GitHub image URL
    const isGitHubImage = GITHUB_IMAGE_PATTERN.test(url.href);
    const isLocalAsset = LOCAL_ASSET_PATTERN.test(url.pathname);

    if (isGitHubImage) {
        // GitHub images: Cache-first with network fallback and long expiry
        event.respondWith(
            cacheFirstWithExpiry(request, CACHE_DURATION_MS)
        );
    } else if (isLocalAsset) {
        // Local assets: Cache-first with network fallback
        event.respondWith(
            cacheFirst(request)
        );
    } else {
        // Everything else: Network-first
        event.respondWith(
            networkFirst(request)
        );
    }
});

/**
 * Cache-first strategy with expiry check
 * Perfect for GitHub images (static, rarely change)
 */
async function cacheFirstWithExpiry(request, maxAge) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);

        if (cached) {
            // Check if cached response is still fresh
            const cachedDate = cached.headers.get('sw-cached-date');
            if (cachedDate) {
                const age = Date.now() - parseInt(cachedDate);
                if (age < maxAge) {
                    console.log('[SW] Serving from cache (fresh):', request.url);
                    return cached;
                } else {
                    console.log('[SW] Cache expired, fetching fresh:', request.url);
                }
            } else {
                // No date header, assume fresh (backward compat)
                return cached;
            }
        }

        // Fetch from network
        console.log('[SW] Fetching from network:', request.url);
        const response = await fetch(request);

        // Cache successful responses
        if (response.ok) {
            const responseToCache = response.clone();
            
            // Add timestamp header
            const headers = new Headers(responseToCache.headers);
            headers.append('sw-cached-date', Date.now().toString());
            
            const cachedResponse = new Response(responseToCache.body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: headers
            });
            
            cache.put(request, cachedResponse);
            console.log('[SW] Cached:', request.url);
        }

        return response;
    } catch (error) {
        console.error('[SW] Fetch failed:', error);
        
        // Return cached version even if expired (offline mode)
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        if (cached) {
            console.log('[SW] Network failed, serving stale cache:', request.url);
            return cached;
        }
        
        throw error;
    }
}

/**
 * Cache-first strategy (for local assets)
 */
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
        return cached;
    }

    const response = await fetch(request);
    if (response.ok) {
        cache.put(request, response.clone());
    }

    return response;
}

/**
 * Network-first strategy (for HTML, API calls)
 */
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        
        if (cached) {
            return cached;
        }
        
        throw error;
    }
}

/**
 * Message handler for cache management
 */
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data === 'clearCache') {
        event.waitUntil(
            caches.delete(CACHE_NAME).then(() => {
                console.log('[SW] Cache cleared');
            })
        );
    }
});

console.log('[SW] Service Worker loaded');


// js/service-worker-cache.js
// Service Worker registration and cache management for GitHub images
// Caches external GitHub URLs aggressively on Cloudflare Pages

(function() {
    'use strict';

    const SW_VERSION = 'v1';
    const CACHE_NAME = `forte-cards-${SW_VERSION}`;
    const GITHUB_IMAGE_CACHE_DAYS = 30; // Cache GitHub images for 30 days

    /**
     * Register service worker if supported
     */
    function registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.log('[Cache] Service Worker not supported');
            return;
        }

        // Don't register on localhost (for development)
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.protocol === 'file:') {
            console.log('[Cache] Skipping Service Worker on localhost');
            return;
        }

        navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
            .then(registration => {
                console.log('[Cache] Service Worker registered:', registration.scope);
                
                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 60000); // Check every minute
            })
            .catch(error => {
                console.error('[Cache] Service Worker registration failed:', error);
            });
    }

    /**
     * Preload critical images (first screen)
     */
    function preloadCriticalImages() {
        if (!window.app || !window.app.filteredCards) {
            console.log('[Cache] Cards not loaded yet, deferring preload');
            setTimeout(preloadCriticalImages, 1000);
            return;
        }

        const criticalCards = window.app.filteredCards.slice(0, 12); // First 12 cards
        
        criticalCards.forEach((card, index) => {
            if (!window.WebPLoader) return;
            
            const webpUrl = window.WebPLoader.getBestImageUrl(card, 'small');
            if (!webpUrl) return;
            
            // Create link element for preload
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = webpUrl;
            link.type = 'image/webp';
            
            // Add to head
            document.head.appendChild(link);
        });
        
        console.log(`[Cache] Preloading ${Math.min(12, criticalCards.length)} critical images`);
    }

    /**
     * Prefetch next batch of images (for smooth scrolling)
     */
    function setupPrefetching() {
        if (!window.app || !window.app.filteredCards) return;

        let lastScrollPos = 0;
        let prefetchedCount = 20; // Already loaded first 20

        const galleryWrapper = document.querySelector('.gallery-content-wrapper');
        if (!galleryWrapper) return;

        galleryWrapper.addEventListener('scroll', debounce(() => {
            const scrollTop = galleryWrapper.scrollTop;
            const scrollHeight = galleryWrapper.scrollHeight;
            const clientHeight = galleryWrapper.clientHeight;
            
            // When scrolled 50% down, prefetch next batch
            const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;
            
            if (scrollPercent > 50 && prefetchedCount < window.app.filteredCards.length) {
                const nextBatch = window.app.filteredCards.slice(prefetchedCount, prefetchedCount + 20);
                
                nextBatch.forEach(card => {
                    if (!window.WebPLoader) return;
                    const webpUrl = window.WebPLoader.getBestImageUrl(card, 'small');
                    if (webpUrl) {
                        // Prefetch by creating image in memory
                        const img = new Image();
                        img.src = webpUrl;
                    }
                });
                
                prefetchedCount += 20;
                console.log(`[Cache] Prefetched next 20 images (total: ${prefetchedCount})`);
            }
        }, 200));
    }

    /**
     * Debounce helper
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Clear old caches
     */
    function clearOldCaches() {
        if (!('caches' in window)) return;

        caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
                if (cacheName !== CACHE_NAME && cacheName.startsWith('forte-cards-')) {
                    console.log('[Cache] Deleting old cache:', cacheName);
                    caches.delete(cacheName);
                }
            });
        });
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            registerServiceWorker();
            clearOldCaches();
            setTimeout(preloadCriticalImages, 2000);
            setTimeout(setupPrefetching, 3000);
        });
    } else {
        registerServiceWorker();
        clearOldCaches();
        setTimeout(preloadCriticalImages, 2000);
        setTimeout(setupPrefetching, 3000);
    }

    console.log('[Cache] Cache manager initialized');

})();


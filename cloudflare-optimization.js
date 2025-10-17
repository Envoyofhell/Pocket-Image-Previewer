// cloudflare-optimization.js
// Client-side optimizations for Cloudflare Pages + GitHub images
// Adds aggressive caching hints and optimizations

(function() {
    'use strict';

    /**
     * Add cache-friendly headers to image fetch requests
     */
    function optimizeImageFetching() {
        // Intercept fetch requests for images
        const originalFetch = window.fetch;
        
        window.fetch = function(...args) {
            const url = args[0];
            const options = args[1] || {};
            
            // Check if this is a GitHub image URL
            if (typeof url === 'string' && url.includes('raw.githubusercontent.com')) {
                // Add cache-friendly options
                options.mode = 'cors';
                options.cache = 'force-cache'; // Use browser cache aggressively
                options.credentials = 'omit'; // No credentials needed for public images
                
                console.log('[Cloudflare] Optimized fetch for:', url);
                return originalFetch(url, options);
            }
            
            return originalFetch(...args);
        };
    }

    /**
     * Use browser's built-in image caching
     */
    function setupBrowserCaching() {
        // Create a hidden iframe for DNS prefetch and preconnect
        const prefetchLinks = [
            { rel: 'dns-prefetch', href: '//raw.githubusercontent.com' },
            { rel: 'preconnect', href: 'https://raw.githubusercontent.com', crossorigin: 'anonymous' }
        ];

        prefetchLinks.forEach(link => {
            const linkEl = document.createElement('link');
            linkEl.rel = link.rel;
            linkEl.href = link.href;
            if (link.crossorigin) linkEl.crossOrigin = link.crossorigin;
            document.head.appendChild(linkEl);
        });

        console.log('[Cloudflare] DNS prefetch and preconnect added for GitHub');
    }

    /**
     * Add resource hints for better performance
     */
    function addResourceHints() {
        const hints = document.createDocumentFragment();

        // DNS prefetch for GitHub
        const dnsPrefetch = document.createElement('link');
        dnsPrefetch.rel = 'dns-prefetch';
        dnsPrefetch.href = '//raw.githubusercontent.com';
        hints.appendChild(dnsPrefetch);

        // Preconnect to GitHub (establish connection early)
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = 'https://raw.githubusercontent.com';
        preconnect.crossOrigin = 'anonymous';
        hints.appendChild(preconnect);

        document.head.appendChild(hints);
        console.log('[Cloudflare] Resource hints added');
    }

    /**
     * Monitor cache performance
     */
    function monitorCachePerformance() {
        if (!window.performance || !window.performance.getEntriesByType) return;

        setTimeout(() => {
            const resources = performance.getEntriesByType('resource');
            
            let githubRequests = 0;
            let cachedRequests = 0;
            let totalSize = 0;

            resources.forEach(resource => {
                if (resource.name.includes('raw.githubusercontent.com')) {
                    githubRequests++;
                    totalSize += resource.transferSize || 0;
                    
                    // transferSize = 0 usually means cached
                    if (resource.transferSize === 0) {
                        cachedRequests++;
                    }
                }
            });

            if (githubRequests > 0) {
                const cacheRate = (cachedRequests / githubRequests * 100).toFixed(1);
                const sizeKB = (totalSize / 1024).toFixed(1);
                
                console.log('[Cloudflare] Cache Performance:');
                console.log(`  Total GitHub requests: ${githubRequests}`);
                console.log(`  Cached requests: ${cachedRequests} (${cacheRate}%)`);
                console.log(`  Bandwidth used: ${sizeKB} KB`);
            }
        }, 5000); // Check after 5 seconds
    }

    /**
     * Enable Cloudflare-specific optimizations
     */
    function enableCloudflareOptimizations() {
        // Tell Cloudflare to cache everything (if using Workers)
        if (window.location.hostname.includes('pages.dev')) {
            console.log('[Cloudflare] Running on Cloudflare Pages');
            
            // Add meta tags for Cloudflare optimization
            const meta = document.createElement('meta');
            meta.httpEquiv = 'Cache-Control';
            meta.content = 'public, max-age=31536000';
            document.head.appendChild(meta);
        }
    }

    // Initialize optimizations
    function init() {
        console.log('[Cloudflare] Initializing optimizations...');
        
        addResourceHints();
        setupBrowserCaching();
        enableCloudflareOptimizations();
        
        // Delay non-critical optimizations
        setTimeout(() => {
            optimizeImageFetching();
            monitorCachePerformance();
        }, 1000);
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();


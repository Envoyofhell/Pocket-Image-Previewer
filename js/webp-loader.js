// js/webp-loader.js
// WebP image loader with PNG fallback and local/remote path detection

(function() {
    'use strict';

    // --- Configuration ---
    const IS_LOCAL = window.location.protocol === 'file:' || 
                    window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
    
    // Support both GitHub raw URLs and Cloudflare CDN URLs
    const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/Envoyofhell/Pocket-Image-Previewer/Forte-Master/';
    const CLOUDFLARE_BASE_URL = 'https://cdn.example.com/'; // Update if using Cloudflare CDN
    const LOCAL_BASE_PATH = './';
    
    // Detect if we're using Cloudflare (can be configured)
    const USE_CLOUDFLARE = false; // Set to true if using Cloudflare CDN

    console.log('[WebP Loader] Environment:', IS_LOCAL ? 'LOCAL' : 'REMOTE');
    console.log('[WebP Loader] CDN:', USE_CLOUDFLARE ? 'Cloudflare' : 'GitHub Raw');

    /**
     * Convert a card's image URLs to use local or remote paths
     */
    function getImagePath(url, preferWebP = true) {
        if (!url) return '';
        
        if (IS_LOCAL) {
            // Running locally - use relative paths
            let localPath = url.replace(GITHUB_BASE_URL, LOCAL_BASE_PATH);
            localPath = localPath.replace(CLOUDFLARE_BASE_URL, LOCAL_BASE_PATH);
            
            // Convert to WebP if preferred and available
            if (preferWebP && !localPath.endsWith('.webp')) {
                const webpPath = localPath.replace(/\.png$/i, '.webp');
                return webpPath;
            }
            
            return localPath;
        } else {
            // Running on server - use configured CDN/GitHub URLs
            let remoteUrl = url;
            
            // If using Cloudflare, replace GitHub URLs with Cloudflare
            if (USE_CLOUDFLARE && url.includes('raw.githubusercontent.com')) {
                remoteUrl = url.replace(GITHUB_BASE_URL, CLOUDFLARE_BASE_URL);
            }
            
            // Convert to WebP if preferred
            if (preferWebP && !remoteUrl.endsWith('.webp')) {
                const webpUrl = remoteUrl.replace(/\.png$/i, '.webp');
                return webpUrl;
            }
            
            return remoteUrl;
        }
    }

    /**
     * Get image URLs with WebP priority and PNG fallback
     */
    function getCardImageUrls(card) {
        const smallUrl = card.images?.small || card.images?.large || '';
        const largeUrl = card.images?.large || card.images?.small || '';
        
        return {
            // WebP URLs (priority)
            webp: {
                small: getImagePath(smallUrl, true),
                large: getImagePath(largeUrl, true)
            },
            // PNG URLs (fallback)
            png: {
                small: getImagePath(smallUrl, false),
                large: getImagePath(largeUrl, false)
            },
            // Embedded WebP data (if available)
            embedded: card.imageDataWebP || ''
        };
    }

    /**
     * Load image with WebP priority and automatic fallback
     */
    function loadImage(card, size = 'small', imgElement = null) {
        const urls = getCardImageUrls(card);
        
        return new Promise((resolve, reject) => {
            // Try WebP first
            const webpUrl = urls.webp[size];
            const pngUrl = urls.png[size];
            const embeddedUrl = urls.embedded;
            
            if (!webpUrl && !pngUrl && !embeddedUrl) {
                reject(new Error('No image URL available'));
                return;
            }
            
            // Create or use existing img element
            const img = imgElement || new Image();
            
            // Try WebP
            if (webpUrl) {
                const webpImg = new Image();
                
                webpImg.onload = () => {
                    if (imgElement) {
                        imgElement.src = webpUrl;
                    }
                    resolve({ url: webpUrl, format: 'webp' });
                };
                
                webpImg.onerror = () => {
                    console.log(`[WebP Loader] WebP failed, trying PNG fallback for ${card.name}`);
                    
                    // Try PNG fallback
                    if (pngUrl) {
                        const pngImg = new Image();
                        
                        pngImg.onload = () => {
                            if (imgElement) {
                                imgElement.src = pngUrl;
                            }
                            resolve({ url: pngUrl, format: 'png' });
                        };
                        
                        pngImg.onerror = () => {
                            // Try embedded WebP as last resort
                            if (embeddedUrl) {
                                if (imgElement) {
                                    imgElement.src = embeddedUrl;
                                }
                                resolve({ url: embeddedUrl, format: 'embedded' });
                            } else {
                                reject(new Error('All image sources failed'));
                            }
                        };
                        
                        pngImg.src = pngUrl;
                    } else if (embeddedUrl) {
                        if (imgElement) {
                            imgElement.src = embeddedUrl;
                        }
                        resolve({ url: embeddedUrl, format: 'embedded' });
                    } else {
                        reject(new Error('No fallback available'));
                    }
                };
                
                webpImg.src = webpUrl;
            } else if (pngUrl) {
                // No WebP, use PNG directly
                img.src = pngUrl;
                img.onload = () => resolve({ url: pngUrl, format: 'png' });
                img.onerror = () => {
                    if (embeddedUrl) {
                        if (imgElement) {
                            imgElement.src = embeddedUrl;
                        }
                        resolve({ url: embeddedUrl, format: 'embedded' });
                    } else {
                        reject(new Error('PNG failed'));
                    }
                };
            } else if (embeddedUrl) {
                // Only embedded available
                if (imgElement) {
                    imgElement.src = embeddedUrl;
                }
                resolve({ url: embeddedUrl, format: 'embedded' });
            }
        });
    }

    /**
     * Get the best image URL for a card (synchronous)
     */
    function getBestImageUrl(card, size = 'small') {
        const urls = getCardImageUrls(card);
        
        // Return WebP URL first, then PNG, then embedded
        return urls.webp[size] || urls.png[size] || urls.embedded || '';
    }

    /**
     * Check if WebP is supported by the browser
     */
    function checkWebPSupport() {
        return new Promise((resolve) => {
            const webpData = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = webpData;
        });
    }

    // Check WebP support on load
    checkWebPSupport().then(supported => {
        console.log('[WebP Loader] WebP support:', supported ? 'YES' : 'NO');
        window.WEBP_SUPPORTED = supported;
    });

    // --- Public API ---
    window.WebPLoader = {
        loadImage,
        getBestImageUrl,
        getImagePath,
        getCardImageUrls,
        isLocal: IS_LOCAL,
        checkWebPSupport
    };

    console.log('[WebP Loader] Module initialized');

})();


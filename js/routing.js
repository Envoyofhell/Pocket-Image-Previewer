// js/routing.js
// Client-side routing for #set/name-number URLs

window.ForteRouting = {
    init() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            this.handleRouteChange();
        });
        
        // Handle hash changes
        window.addEventListener('hashchange', (event) => {
            this.handleRouteChange();
        });
        
        // Handle initial page load with a slight delay to ensure modules are loaded
        setTimeout(() => {
            this.handleRouteChange();
        }, 100);
    },
    
    handleRouteChange() {
        const hash = window.location.hash;
        
        // Check if this is a card URL
        if (window.ForteURLUtils && hash && hash.startsWith('#') && hash.length > 1) {
            const pathInfo = window.ForteURLUtils.parseCardPath(hash.substring(1));
            
            if (pathInfo) {
                // This is a card URL, open the card
                if (window.ForteLightbox && window.ForteLightbox.openCardByPath) {
                    window.ForteLightbox.openCardByPath(pathInfo.set, pathInfo.cardSlug);
                } else {
                    // Lightbox not ready yet, try again in a moment
                    setTimeout(() => {
                        if (window.ForteLightbox && window.ForteLightbox.openCardByPath) {
                            window.ForteLightbox.openCardByPath(pathInfo.set, pathInfo.cardSlug);
                        }
                    }, 200);
                }
                return;
            }
        }
        
        // Not a card URL, close lightbox if open
        if (window.ForteLightbox && window.ForteLightbox.isVisible) {
            window.ForteLightbox.close();
        }
    },
    
    // Navigate to a card URL
    navigateToCard(card) {
        console.log('[Routing] navigateToCard called with:', card?.name || 'null');
        
        if (!card || !window.ForteURLUtils) {
            console.warn('[Routing] Invalid card or URL utils not available');
            return;
        }
        
        const url = window.ForteURLUtils.generateCardUrl(card);
        console.log('[Routing] Generated URL:', url);
        
        // Use hash-based navigation
        const hash = url.split('#')[1] || '';
        window.history.pushState(null, null, `#${hash}`);
        
        // Update page title
        document.title = `${card.name} - Forte Card Viewer`;
        console.log('[Routing] Updated page title to:', document.title);
    },
    
    // Navigate to home
    navigateToHome() {
        window.history.pushState(null, null, window.location.pathname);
        document.title = 'Forte Card Viewer';
    }
};

// Initialize routing when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ForteRouting.init();
    });
} else {
    window.ForteRouting.init();
} 
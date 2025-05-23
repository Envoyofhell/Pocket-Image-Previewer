// simple-effects.js - Basic card glow effects
// Replace the complex effects.js with this simpler version

(function() {
    'use strict';
    
    console.log("[SimpleEffects] Initializing basic card effects...");
    
    // Simple glow effect on hover/focus
    function initCardEffects() {
        document.addEventListener('DOMContentLoaded', function() {
            // Apply effects when gallery is rendered
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        const addedNodes = mutation.addedNodes;
                        for (let i = 0; i < addedNodes.length; i++) {
                            const node = addedNodes[i];
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                if (node.classList.contains('thumbnail')) {
                                    addCardEffects(node);
                                } else {
                                    // Check for thumbnails within added nodes
                                    const thumbnails = node.querySelectorAll('.thumbnail');
                                    thumbnails.forEach(addCardEffects);
                                }
                            }
                        }
                    }
                });
            });
            
            // Start observing the gallery
            const gallery = document.getElementById('item-gallery');
            if (gallery) {
                observer.observe(gallery, {
                    childList: true,
                    subtree: true
                });
                
                // Apply to existing thumbnails
                const existingThumbnails = gallery.querySelectorAll('.thumbnail');
                existingThumbnails.forEach(addCardEffects);
            }
        });
    }
    
    function addCardEffects(thumbnail) {
        if (thumbnail.dataset.effectsApplied) return;
        thumbnail.dataset.effectsApplied = 'true';
        
        // Mouse enter effect
        thumbnail.addEventListener('mouseenter', function() {
            this.classList.add('holo-active');
        });
        
        // Mouse leave effect
        thumbnail.addEventListener('mouseleave', function() {
            this.classList.remove('holo-active');
        });
        
        // Focus effect
        thumbnail.addEventListener('focus', function() {
            this.classList.add('holo-active');
        });
        
        // Blur effect
        thumbnail.addEventListener('blur', function() {
            this.classList.remove('holo-active');
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        initCardEffects();
    } else {
        // DOM already loaded
        const gallery = document.getElementById('item-gallery');
        if (gallery) {
            const thumbnails = gallery.querySelectorAll('.thumbnail');
            thumbnails.forEach(addCardEffects);
        }
    }
    
    console.log("[SimpleEffects] Basic card effects initialized");
    
})();
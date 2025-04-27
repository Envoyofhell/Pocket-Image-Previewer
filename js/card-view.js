// card-view.js - Enhanced Card Viewer with Blank/Textless Handling & Download Features
// Add to your project and include in index.html after main scripts

(function() {
    'use strict';
    
    console.log("[CardView] Initializing enhanced card viewer...");
    
    // --- Constants ---
    const BLANK_SUFFIX = '-BL-'; // Match the suffix in your image names
    
    // --- DOM Element Cache ---
    let fancyLightbox, fancyCardImage, fancyHoloInner, infoFileName;
    let fancyNormalView, fancyTextlessView, fancyLightboxBody;
    
    // --- State Variables ---
    let currentCardPath = null;
    let normalVersionPath = null;
    let blankVersionPath = null;
    let hasBlankVersion = false;
    
    /**
     * Creates extra buttons for downloading and copying image path
     */
    function createExtraButtons() {
        // Create button container if it doesn't exist
        let actionContainer = document.querySelector('.fancy-card-actions');
        if (!actionContainer) {
            actionContainer = document.createElement('div');
            actionContainer.className = 'fancy-card-actions';
            actionContainer.style.cssText = 'position: absolute; right: 1rem; bottom: 5rem; display: flex; flex-direction: column; gap: 0.5rem; z-index: 10;';
            
            // Find the right place to insert it in the DOM
            const fancyCardControls = document.getElementById('fancy-card-controls');
            if (fancyCardControls && fancyCardControls.parentNode) {
                fancyCardControls.parentNode.insertBefore(actionContainer, fancyCardControls);
            } else {
                // Fallback insertion into lightbox body
                const lightboxBody = document.querySelector('.fancy-lightbox-body');
                if (lightboxBody) {
                    lightboxBody.appendChild(actionContainer);
                } else {
                    console.error("[CardView] Could not find a place to insert action buttons");
                    return;
                }
            }
        }
        
        // Create Download Button
        const downloadButton = document.createElement('button');
        downloadButton.id = 'fancy-download-button';
        downloadButton.className = 'fancy-action-button';
        downloadButton.innerHTML = '<i class="fas fa-download"></i>';
        downloadButton.title = 'Download Image';
        downloadButton.setAttribute('aria-label', 'Download Image');
        downloadButton.style.cssText = 'background-color: rgba(0, 0, 0, 0.5); color: white; border: none; border-radius: 50%; width: 2.5rem; height: 2.5rem; font-size: 1rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;';
        
        // Create Copy Path Button
        const copyPathButton = document.createElement('button');
        copyPathButton.id = 'fancy-copy-path-button';
        copyPathButton.className = 'fancy-action-button';
        copyPathButton.innerHTML = '<i class="fas fa-clipboard"></i>';
        copyPathButton.title = 'Copy Image Path';
        copyPathButton.setAttribute('aria-label', 'Copy Image Path');
        copyPathButton.style.cssText = 'background-color: rgba(0, 0, 0, 0.5); color: white; border: none; border-radius: 50%; width: 2.5rem; height: 2.5rem; font-size: 1rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;';
        
        // Add hover effects via CSS
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .fancy-action-button:hover {
                background-color: rgba(90, 8, 102, 0.8) !important;
                transform: scale(1.1) !important;
            }
            .fancy-action-button:active {
                transform: scale(0.95) !important;
            }
            .fancy-action-button.success {
                background-color: rgba(22, 163, 74, 0.8) !important;
            }
            .fancy-action-button.error {
                background-color: rgba(220, 38, 38, 0.8) !important;
            }
        `;
        document.head.appendChild(styleElement);
        
        // Add buttons to container
        actionContainer.appendChild(downloadButton);
        actionContainer.appendChild(copyPathButton);
        
        // Add event listeners
        downloadButton.addEventListener('click', handleDownloadImage);
        copyPathButton.addEventListener('click', handleCopyImagePath);
        
        console.log("[CardView] Extra buttons created.");
    }
    
    /**
     * Handles the download image button click
     */
    function handleDownloadImage() {
        if (!fancyCardImage || !fancyCardImage.src) {
            showButtonStatus('fancy-download-button', 'error');
            return;
        }
        
        const downloadButton = document.getElementById('fancy-download-button');
        
        try {
            // Create a temporary anchor element
            const link = document.createElement('a');
            link.href = fancyCardImage.src;
            
            // Get base filename from the path
            const filename = currentCardPath ? currentCardPath.split('/').pop() : 'card.png';
            link.download = filename;
            
            // Append to document, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showButtonStatus('fancy-download-button', 'success');
        } catch (e) {
            console.error("[CardView] Error downloading image:", e);
            showButtonStatus('fancy-download-button', 'error');
        }
    }
    
    /**
     * Handles the copy image path button click
     */
    function handleCopyImagePath() {
        if (!currentCardPath) {
            showButtonStatus('fancy-copy-path-button', 'error');
            return;
        }
        
        try {
            // Use the clipboard API
            navigator.clipboard.writeText(currentCardPath)
                .then(() => {
                    console.log("[CardView] Path copied to clipboard:", currentCardPath);
                    showButtonStatus('fancy-copy-path-button', 'success');
                })
                .catch(err => {
                    console.error("[CardView] Error copying to clipboard:", err);
                    showButtonStatus('fancy-copy-path-button', 'error');
                    
                    // Fallback method with textarea
                    fallbackCopyToClipboard(currentCardPath);
                });
        } catch (e) {
            console.error("[CardView] Error in copy path handler:", e);
            showButtonStatus('fancy-copy-path-button', 'error');
            
            // Try fallback
            fallbackCopyToClipboard(currentCardPath);
        }
    }
    
    /**
     * Fallback clipboard copy method using textarea
     */
    function fallbackCopyToClipboard(text) {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed'; // Avoid scrolling to bottom
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                console.log("[CardView] Fallback copy succeeded");
                showButtonStatus('fancy-copy-path-button', 'success');
            } else {
                console.error("[CardView] Fallback copy failed");
                showButtonStatus('fancy-copy-path-button', 'error');
            }
        } catch (e) {
            console.error("[CardView] Fallback copy error:", e);
            showButtonStatus('fancy-copy-path-button', 'error');
        }
    }
    
    /**
     * Shows success/error status on a button temporarily
     */
    function showButtonStatus(buttonId, status) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        button.classList.add(status);
        
        // Reset after animation
        setTimeout(() => {
            button.classList.remove(status);
        }, 1500);
    }
    
    /**
     * Finds the normal/blank counterpart for a given image path
     * @param {string} path - The current image path
     * @returns {Object} Object with normalPath, blankPath, and hasCounterpart properties
     */
    function findCounterpartPaths(path) {
        if (!path) return { normalPath: null, blankPath: null, hasCounterpart: false };
        
        const isBlankVersion = path.includes(BLANK_SUFFIX);
        let normalPath = path;
        let blankPath = null;
        
        if (isBlankVersion) {
            // Current is blank, try to find normal
            // Extract parts: path/to/filename-BL-.ext
            const lastDot = path.lastIndexOf('.');
            const ext = lastDot !== -1 ? path.substring(lastDot) : '';
            const withoutExt = lastDot !== -1 ? path.substring(0, lastDot) : path;
            const blankSuffixIndex = withoutExt.lastIndexOf(BLANK_SUFFIX);
            
            if (blankSuffixIndex !== -1) {
                // Remove -BL- suffix to get normal path
                normalPath = withoutExt.substring(0, blankSuffixIndex) + ext;
                blankPath = path; // Current path is blank
            }
        } else {
            // Current is normal, try to create blank path
            const lastDot = path.lastIndexOf('.');
            if (lastDot !== -1) {
                // Insert -BL- before extension
                blankPath = path.substring(0, lastDot) + BLANK_SUFFIX + path.substring(lastDot);
            } else {
                // No extension, just append -BL-
                blankPath = path + BLANK_SUFFIX;
            }
        }
        
        // Check if the counterpart file exists (needs to be done on server side)
        // For now, we'll assume it exists if the hasBlankCounterpart or hasNormalCounterpart
        // properties are set on the image object in the data structure
        
        return {
            normalPath,
            blankPath,
            hasCounterpart: false // Will be set based on image data
        };
    }
    
    /**
     * Enhanced version of openFancyLightbox that correctly handles blank/normal versions
     * This will be called by the patched original function
     */
    function enhancedOpenFancyLightbox(imageObject) {
        if (!imageObject || !imageObject.path) {
            console.error("[CardView] Invalid image object:", imageObject);
            return;
        }
        
        // Reset state variables
        currentCardPath = imageObject.path;
        normalVersionPath = null;
        blankVersionPath = null;
        hasBlankVersion = false;
        
        console.log("[CardView] Opening lightbox for:", imageObject.path);
        
        // Set paths based on the image object's properties
        if (imageObject.isBlank) {
            // Current image is blank
            blankVersionPath = imageObject.path;
            
            // Check if it has a normal counterpart
            if (imageObject.hasNormalCounterpart && imageObject.normalCounterpartPath) {
                normalVersionPath = imageObject.normalCounterpartPath;
                hasBlankVersion = true;
            } else {
                // No normal version, only show blank
                normalVersionPath = imageObject.path; // Same as blank path
                hasBlankVersion = false;
            }
        } else {
            // Current image is normal
            normalVersionPath = imageObject.path;
            
            // Check if it has a blank counterpart
            if (imageObject.hasBlankCounterpart && imageObject.blankCounterpartPath) {
                blankVersionPath = imageObject.blankCounterpartPath;
                hasBlankVersion = true;
            } else {
                // No blank version, only show normal
                blankVersionPath = imageObject.path; // Same as normal path
                hasBlankVersion = false;
            }
        }
        
        // Enable/disable the textless button based on whether counterpart exists
        if (fancyTextlessView) {
            fancyTextlessView.disabled = !hasBlankVersion;
        }
        
        // Update button active states
        if (fancyNormalView && fancyTextlessView) {
            fancyNormalView.classList.toggle('active', !imageObject.isBlank);
            fancyTextlessView.classList.toggle('active', imageObject.isBlank);
        }
        
        console.log(`[CardView] Paths set - Normal: ${normalVersionPath}, Blank: ${blankVersionPath}, Has both: ${hasBlankVersion}`);
    }
    
    /**
     * Enhanced version of switchCardView that correctly handles blank/normal switching
     */
    function enhancedSwitchCardView(view) {
        if (!hasBlankVersion) return; // Nothing to switch if no counterpart
        
        // Determine current view state (based on active button class)
        const currentlyViewingBlank = fancyTextlessView && fancyTextlessView.classList.contains('active');
        let targetPath = null;
        
        // Switch path based on requested view
        if (view === 'normal' && currentlyViewingBlank) {
            // Switch from blank to normal
            targetPath = normalVersionPath;
        } else if (view === 'textless' && !currentlyViewingBlank) {
            // Switch from normal to blank
            targetPath = blankVersionPath;
        } else {
            // No change needed
            return;
        }
        
        if (!targetPath) {
            console.error("[CardView] No target path found for view:", view);
            return;
        }
        
        // Update current card path
        currentCardPath = targetPath;
        
        // Load the image (call original function if available)
        if (typeof window.loadFancyCardImage === 'function') {
            window.loadFancyCardImage(targetPath);
        } else if (fancyCardImage) {
            // Fallback: directly update image src
            fancyCardImage.src = targetPath;
        }
        
        // Update button active states
        if (fancyNormalView && fancyTextlessView) {
            fancyNormalView.classList.toggle('active', view === 'normal');
            fancyTextlessView.classList.toggle('active', view === 'textless');
        }
    }
    
    /**
     * Initializes the enhanced card viewer by patching existing functions
     */
    function initEnhancedCardViewer() {
        console.log("[CardView] Setting up enhanced card viewer...");
        
        // Get DOM elements we'll need
        fancyLightbox = document.getElementById('fancy-lightbox');
        fancyCardImage = document.getElementById('fancy-card-image');
        fancyHoloInner = document.getElementById('fancy-holo-inner');
        infoFileName = document.getElementById('info-file-name');
        fancyNormalView = document.getElementById('fancy-normal-view');
        fancyTextlessView = document.getElementById('fancy-textless-view');
        fancyLightboxBody = document.querySelector('.fancy-lightbox-body');
        
        if (!fancyLightbox || !fancyCardImage) {
            console.error("[CardView] Required elements not found. Cannot initialize.");
            return;
        }
        
        // Create extra buttons for download and copy
        createExtraButtons();
        
        // Patch the original functions for blank/normal handling
        if (typeof window.openFancyLightbox === 'function') {
            const origOpenFancyLightbox = window.openFancyLightbox;
            window.openFancyLightbox = function(imageObject) {
                // Call our enhanced version first to set up paths
                enhancedOpenFancyLightbox(imageObject);
                
                // Then call original to handle the rest of the UI
                origOpenFancyLightbox.apply(this, arguments);
            };
            console.log("[CardView] Successfully patched openFancyLightbox function");
        }
        
        if (typeof window.switchCardView === 'function') {
            const origSwitchCardView = window.switchCardView;
            window.switchCardView = function(view) {
                // Call our enhanced version for proper path handling
                enhancedSwitchCardView(view);
                
                // Call original for UI updates
                origSwitchCardView.apply(this, arguments);
            };
            console.log("[CardView] Successfully patched switchCardView function");
        }
        
        // Patch the filter and render function to prioritize normal versions
        if (typeof window.applyFiltersAndRender === 'function') {
            const origApplyFiltersAndRender = window.applyFiltersAndRender;
            window.applyFiltersAndRender = function() {
                // Just call the original - the fix for normal/blank handling is already
                // implemented in the original app's applyFiltersAndRender function
                origApplyFiltersAndRender.apply(this, arguments);
            };
        }
        
        console.log("[CardView] Enhanced card viewer initialized!");
    }
    
    // --- Run Initialization ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEnhancedCardViewer);
    } else {
        initEnhancedCardViewer(); // DOM already loaded
    }
})();
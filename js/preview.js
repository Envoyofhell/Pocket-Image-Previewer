// debug-preview.js - Identifies and filters image data in any form
// Add this script before any of your other scripts

(function() {
    'use strict';
    
    console.log("[DebugPreview] Starting debug mode for preview filtering...");
    
    // --- Configuration ---
    const PREVIEW_PASSWORD = "forte";
    const PREVIEW_STORAGE_KEY = 'fortePreviewUnlocked';
    const ALLOWED_PROMOS_PREVIEW = ["001", "002"];
    const UNBOUND_SET_NAME = "Other";  // Internal setName for Unbound cards
    const PROMO_SET_NAME = "Promo";    // Internal setName for Promo cards
    
    // --- Check if in preview mode ---
    let isPreviewMode = true; // Default to preview mode
    try {
        const unlockState = localStorage.getItem(PREVIEW_STORAGE_KEY);
        isPreviewMode = unlockState !== "unlocked";
    } catch (e) {
        console.error("[DebugPreview] Error checking localStorage:", e);
    }
    
    console.log("[DebugPreview] Preview mode active:", isPreviewMode);
    
    // --- Only proceed if in preview mode ---
    if (!isPreviewMode) {
        console.log("[DebugPreview] Preview mode disabled - showing all cards.");
        return; // Exit early if not in preview mode
    }
    
    // --- Hook into DOMContentLoaded to create unlock button ---
    document.addEventListener('DOMContentLoaded', function() {
        createUnlockButton();
    });
    
    // --- Create unlock button ---
    function createUnlockButton() {
        let accessControlArea = document.getElementById('access-controls');
        if (!accessControlArea) {
            const filterControls = document.getElementById('filter-controls');
            if (filterControls && filterControls.parentElement) {
                accessControlArea = document.createElement('div');
                accessControlArea.id = 'access-controls';
                accessControlArea.className = 'flex items-center gap-x-3 ml-auto pl-4';
                filterControls.parentElement.appendChild(accessControlArea);
            } else {
                console.error("[DebugPreview] Could not find control area");
                return;
            }
        }
        
        const unlockButton = document.createElement('button');
        unlockButton.id = 'unlock-button';
        unlockButton.className = 'access-button';
        unlockButton.title = 'Unlock Full Version';
        unlockButton.innerHTML = '<i id="unlock-icon" class="fas fa-lock"></i>';
        unlockButton.addEventListener('click', handleUnlockAttempt);
        
        accessControlArea.appendChild(unlockButton);
    }
    
    // --- Handle unlock button click ---
    function handleUnlockAttempt() {
        const password = prompt("Enter password to unlock full version:");
        if (password === null) return; // Cancelled
        
        if (password === PREVIEW_PASSWORD) {
            localStorage.setItem(PREVIEW_STORAGE_KEY, "unlocked");
            alert("Password correct! Unlocking full version.");
            window.location.reload();
        } else {
            alert("Incorrect password.");
        }
    }
    
    // =========================================================
    // DEBUG CODE: Find and filter the image data in any form
    // =========================================================

    // --- Helper to log objects for debugging ---
    function debugLogObject(obj, prefix = "") {
        console.log(`${prefix} Type:`, typeof obj);
        if (obj === null) {
            console.log(`${prefix} Value: null`);
            return;
        }
        if (typeof obj !== 'object') {
            console.log(`${prefix} Value:`, obj);
            return;
        }
        
        console.log(`${prefix} Keys:`, Object.keys(obj));
        
        if (Array.isArray(obj)) {
            console.log(`${prefix} Array length:`, obj.length);
            if (obj.length > 0) {
                console.log(`${prefix} First item type:`, typeof obj[0]);
                if (typeof obj[0] === 'object' && obj[0] !== null) {
                    console.log(`${prefix} First item keys:`, Object.keys(obj[0]));
                }
            }
        }
    }
    
    // --- Check for known variables ---
    function findAndDebugImageData() {
        console.log("[DebugPreview] Searching for image data variables...");
        
        // Check for imageData global
        if (typeof window.imageData !== 'undefined') {
            console.log("[DebugPreview] Found window.imageData");
            debugLogObject(window.imageData, "imageData");
            
            // Try to find image structure inside imageData
            if (window.imageData && typeof window.imageData === 'object') {
                if (window.imageData.imageStructure) {
                    console.log("[DebugPreview] Found imageData.imageStructure");
                    debugLogObject(window.imageData.imageStructure, "imageData.imageStructure");
                }
                
                // Check for filter config
                if (window.imageData.filterConfig) {
                    console.log("[DebugPreview] Found imageData.filterConfig");
                    debugLogObject(window.imageData.filterConfig, "imageData.filterConfig");
                }
            }
        }
        
        // Check for specific variables related to image lists
        const potentialImageListVars = [
            'allImagesMasterList', 'baseImageSet', 'currentlyDisplayedImages', 
            'rootImageStructure', 'filteredImages', 'allImagesForSets', 'allImages'
        ];
        
        potentialImageListVars.forEach(varName => {
            if (typeof window[varName] !== 'undefined') {
                console.log(`[DebugPreview] Found window.${varName}`);
                debugLogObject(window[varName], varName);
            }
        });
        
        // Check specific nested structures
        if (window.imageData && window.imageData.imageStructure && 
            window.imageData.imageStructure.children) {
            console.log("[DebugPreview] Examining imageData.imageStructure.children");
            const children = window.imageData.imageStructure.children;
            debugLogObject(children, "imageStructure.children");
            
            // Look for folders that might contain images
            children.forEach((child, index) => {
                if (child.type === 'folder' && child.children) {
                    console.log(`[DebugPreview] Found folder: ${child.name} with ${child.children.length} children`);
                    
                    // Check for files in this folder
                    const files = child.children.filter(c => c.type === 'file');
                    if (files.length > 0) {
                        console.log(`[DebugPreview] Found ${files.length} files in ${child.name} folder`);
                        debugLogObject(files[0], `First file in ${child.name}`);
                    }
                }
            });
        }
    }
    
    // --- Main debug function to run once DOM is loaded ---
    function runDebugAndFilter() {
        findAndDebugImageData();
        
        // Set up a mutation observer to watch for new script elements
        // This helps detect when image_data.js might be loaded
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    const addedNodes = Array.from(mutation.addedNodes);
                    const hasScripts = addedNodes.some(node => 
                        node.tagName === 'SCRIPT' || 
                        (node.querySelectorAll && node.querySelectorAll('script').length > 0)
                    );
                    
                    if (hasScripts) {
                        console.log("[DebugPreview] New scripts detected, checking for image data...");
                        setTimeout(findAndDebugImageData, 500); // Check after scripts load
                    }
                }
            });
        });
        
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
        
        // Intercept any renderTabs, handleTabChange, or applyFiltersAndRender functions
        setupFunctionInterceptors();
        
        // Check for image data again when page is fully loaded
        window.addEventListener('load', function() {
            console.log("[DebugPreview] Page load complete, checking for image data...");
            findAndDebugImageData();
            
            // Try one more check after a delay
            setTimeout(function() {
                console.log("[DebugPreview] Final check for image data...");
                findAndDebugImageData();
                setupFunctionInterceptors(); // Try again to intercept functions
            }, 1000);
        });
    }
    
    // --- Set up interceptors for key functions ---
    function setupFunctionInterceptors() {
        // Track original functions
        const originalFunctions = {};
        
        // Functions to intercept
        const functionsToIntercept = [
            'renderTabs', 
            'handleTabChange', 
            'applyFiltersAndRender',
            'getAllImageFilesRecursive'
        ];
        
        functionsToIntercept.forEach(funcName => {
            if (typeof window[funcName] === 'function' && !originalFunctions[funcName]) {
                console.log(`[DebugPreview] Intercepting ${funcName} function`);
                
                // Store original function
                originalFunctions[funcName] = window[funcName];
                
                // Replace with our interceptor
                window[funcName] = function() {
                    console.log(`[DebugPreview] ${funcName} called with arguments:`, arguments);
                    
                    // Special handling for specific functions
                    if (funcName === 'getAllImageFilesRecursive' && arguments[0]) {
                        console.log(`[DebugPreview] Found structure in getAllImageFilesRecursive:`, arguments[0]);
                        
                        // This is likely the root image structure - we can filter it
                        if (arguments[0].children && Array.isArray(arguments[0].children)) {
                            console.log(`[DebugPreview] Found ${arguments[0].children.length} root children`);
                            
                            // Look for image folders
                            arguments[0].children.forEach(child => {
                                if (child.type === 'folder' && child.children) {
                                    console.log(`[DebugPreview] Found folder: ${child.name} with ${child.children.length} children`);
                                    
                                    // TODO: We could filter here, but need to know structure
                                }
                            });
                        }
                    }
                    
                    if (funcName === 'handleTabChange') {
                        console.log(`[DebugPreview] Tab change to: ${arguments[0]}`);
                        
                        // This might be where we need to filter
                        // Remember the tab for future reference
                        window.debugLastTabChange = arguments[0];
                    }
                    
                    // Execute original function
                    const result = originalFunctions[funcName].apply(this, arguments);
                    
                    // Check result for some functions
                    if (funcName === 'getAllImageFilesRecursive') {
                        console.log(`[DebugPreview] getAllImageFilesRecursive returned ${result.length} items`);
                        
                        if (result.length > 0) {
                            console.log("[DebugPreview] First image returned:", result[0]);
                            
                            // Count items by set
                            const setNameCounts = {};
                            result.forEach(item => {
                                const setName = item.setName || 'Unknown';
                                setNameCounts[setName] = (setNameCounts[setName] || 0) + 1;
                                
                                // Count promos specifically
                                if (setName === PROMO_SET_NAME) {
                                    const promoNum = item.setNumber || 'Unknown';
                                    setNameCounts[`${setName}_${promoNum}`] = 
                                        (setNameCounts[`${setName}_${promoNum}`] || 0) + 1;
                                }
                            });
                            
                            console.log("[DebugPreview] Count by setName:", setNameCounts);
                            
                            // THIS IS WHERE WE CAN FILTER THE RESULT
                            if (isPreviewMode) {
                                console.log("[DebugPreview] FILTERING getAllImageFilesRecursive result!");
                                
                                // Filter to only allowed cards
                                const filteredResult = result.filter(img => {
                                    // Allow all Unbound cards
                                    if (img.setName === UNBOUND_SET_NAME) return true;
                                    
                                    // Allow only specific Promo cards
                                    if (img.setName === PROMO_SET_NAME && 
                                        ALLOWED_PROMOS_PREVIEW.includes(img.setNumber)) return true;
                                    
                                    // Filter out everything else
                                    return false;
                                });
                                
                                console.log(`[DebugPreview] Filtered from ${result.length} to ${filteredResult.length} images`);
                                
                                // Count items by set after filtering
                                const filteredCounts = {};
                                filteredResult.forEach(item => {
                                    const setName = item.setName || 'Unknown';
                                    filteredCounts[setName] = (filteredCounts[setName] || 0) + 1;
                                });
                                
                                console.log("[DebugPreview] Count after filtering:", filteredCounts);
                                
                                // Return the filtered result instead
                                return filteredResult;
                            }
                        }
                    }
                    
                    return result;
                };
            }
        });
    }
    
    // Add CSS for unlock button
    const style = document.createElement('style');
    style.textContent = `
        .access-button {
            background-color: rgba(107, 114, 128, 0.3);
            color: var(--color-text-secondary, #ccc);
            border: 1px solid var(--color-border, #555);
            border-radius: 50%;
            padding: 0.3rem 0.5rem;
            font-size: 0.9rem;
            line-height: 1;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            margin-left: 0.5rem;
        }
        .access-button:hover {
            background-color: rgba(107, 114, 128, 0.5);
            color: var(--color-text-primary, #fff);
            border-color: var(--color-accent, #facc15);
        }
    `;
    document.head.appendChild(style);
    
    // Run our debug and filtering as soon as possible
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runDebugAndFilter);
    } else {
        runDebugAndFilter();
    }
    
    console.log("[DebugPreview] Debug setup complete!");
})();
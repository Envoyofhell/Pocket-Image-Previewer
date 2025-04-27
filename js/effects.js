// js/effects.js - Handles Holo Effects for Gallery and Lightbox

(function() {
    'use strict';

    console.log("[Effects] Initializing...");

    // --- Configuration & State ---
    const HOVER_EFFECT_TIMEOUT_MS = 1000; // Timeout for thumbnail hover effect reset
    const hoverEffectTimeouts = new Map(); // Track timeouts for gallery thumbnail holo hover effect resets

    // --- Global Flag Check ---
    // Assumes settings.js runs first and sets window.effectsEnabled
    // Default to true if the flag isn't set for some reason when a function is called.
    const areEffectsEnabled = () => typeof window.effectsEnabled === 'boolean' ? window.effectsEnabled : true;

    // === Gallery Thumbnail Holo Effects ===

    /** Applies holo effect listeners to gallery thumbnails */
    function applyHoloListeners(containerSelector) {
        if (!areEffectsEnabled()) {
            console.log("[Effects] Gallery holo listeners skipped (effects disabled).");
            return; // Don't attach listeners if effects are off
        }
        const galleryContainer = document.querySelector(containerSelector);
        if (!galleryContainer) return;

        // Remove potentially old listeners first to avoid duplicates if called multiple times
        galleryContainer.removeEventListener('pointermove', handleHoloMove);
        galleryContainer.removeEventListener('pointerleave', handleHoloEnd);
        galleryContainer.removeEventListener('pointerup', handleHoloEnd); // Use pointerup for drag end

        // Add new listeners
        galleryContainer.addEventListener('pointermove', handleHoloMove);
        galleryContainer.addEventListener('pointerleave', handleHoloEnd); // Reset when pointer leaves gallery
        galleryContainer.addEventListener('pointerup', handleHoloEnd);
        console.log("[Effects] Gallery holo listeners applied to:", containerSelector);
    }

    /** Handles pointer movement for thumbnail holo effect */
    function handleHoloMove(e) {
        // Check global flag FIRST
        if (!areEffectsEnabled()) return;

        if (e.pointerType === 'touch') return; // Ignore touch

        const target = e.target.closest('.thumbnail');
         // Ensure target is valid, in view, not click-animating, and not an error placeholder
         if (!target || !target.classList.contains('in-view') || target.classList.contains('holo-click-active') || target.querySelector('.load-error')) {
            const activeHolo = document.querySelector('#item-gallery .thumbnail.holo-active:not(.holo-click-active)');
            if(activeHolo && activeHolo !== target) resetHoloEffect(activeHolo);
            return;
        }

        // Reset other active elements first
        const otherActiveHolo = document.querySelector('#item-gallery .thumbnail.holo-active:not(.holo-click-active)');
        if(otherActiveHolo && otherActiveHolo !== target) resetHoloEffect(otherActiveHolo);

        // --- Holo Calculation Logic ---
        const rect = target.getBoundingClientRect();
        const clientX = e.clientX; const clientY = e.clientY;
        const offsetX = clientX - rect.left; const offsetY = clientY - rect.top;
        const w = target.offsetWidth; const h = target.offsetHeight;
        if (w === 0 || h === 0) return;
        const px = (offsetX / w) * 100; const py = (offsetY / h) * 100;
        const dist_x = Math.abs(px - 50); const dist_y = Math.abs(py - 50);
        const max_angle = 10;
        const rotate_y = ((px - 50) / 50) * max_angle;
        const rotate_x = ((py - 50) / 50) * -max_angle;
        const lp = 50 + rotate_y * -0.6;
        const tp = 50 + rotate_x * 0.6;
        const px_spark = 50 + (px - 50) / 7;
        const py_spark = 50 + (py - 50) / 7;
        const p_opc = Math.min(Math.max(0.3 + (dist_x + dist_y) / 100 * 0.8, 0.3), 0.9);

        // Apply styles
        target.classList.add('holo-active');
        target.style.setProperty('--thumb-gradient-pos-x', `${lp}%`);
        target.style.setProperty('--thumb-gradient-pos-y', `${tp}%`);
        target.style.setProperty('--thumb-sparkle-pos-x', `${px_spark}%`);
        target.style.setProperty('--thumb-sparkle-pos-y', `${py_spark}%`);
        target.style.setProperty('--thumb-sparkle-opacity', p_opc);
        target.style.transform = `perspective(900px) rotateX(${rotate_x}deg) rotateY(${rotate_y}deg) scale(1.03)`;

        // Timeout to reset effect
        clearHoverEffectTimeout(target.id);
        setHoverEffectTimeout(target.id, () => {
            const currentHoverTarget = document.elementFromPoint(clientX, clientY)?.closest('.thumbnail');
            if (currentHoverTarget === target) resetHoloEffect(target);
        }, HOVER_EFFECT_TIMEOUT_MS);
    }

    /** Clears the hover effect reset timeout for a specific element */
    function clearHoverEffectTimeout(elementId) {
        if (elementId && hoverEffectTimeouts.has(elementId)) {
            clearTimeout(hoverEffectTimeouts.get(elementId));
            hoverEffectTimeouts.delete(elementId);
        }
    }

    /** Sets the hover effect reset timeout for a specific element */
    function setHoverEffectTimeout(elementId, callback, timeout) {
         if (!elementId) return;
        clearHoverEffectTimeout(elementId); // Ensure no previous timeout exists
        const timeoutId = setTimeout(callback, timeout);
        hoverEffectTimeouts.set(elementId, timeoutId);
    }

    /** Handles pointer leaving a thumbnail or the gallery container */
    function handleHoloEnd(e) {
        // No need to check effectsEnabled flag here, reset should always work
        const target = e.target.closest('.thumbnail');
        const relatedTarget = e.relatedTarget ? e.relatedTarget.closest('.thumbnail') : null;
        if (target && target !== relatedTarget && target.classList.contains('holo-active') && !target.classList.contains('holo-click-active')) {
            resetHoloEffect(target);
        }
         // If leaving the entire container, reset all non-clicking holo effects
         if (e.target.id === 'item-gallery' && !e.relatedTarget?.closest('#item-gallery')) {
             const allActive = document.querySelectorAll('#item-gallery .thumbnail.holo-active:not(.holo-click-active)');
             allActive.forEach(resetHoloEffect);
         }
    }

    /** Resets the holo effect styles on a gallery thumbnail */
    function resetHoloEffect(element, resetTransform = true) {
        if (!element) return;
        // Always remove class and clear timeout, even if effects are off globally
        element.classList.remove('holo-active');
         if (element.id) clearHoverEffectTimeout(element.id);

        // Only reset styles if effects were likely enabled when they were applied
        if (resetTransform && !element.classList.contains('holo-click-active')) {
            element.style.transform = ''; // Reset transform
        }
        // Remove CSS variables (safe to do even if not set)
        element.style.removeProperty('--thumb-gradient-pos-x');
        element.style.removeProperty('--thumb-gradient-pos-y');
        element.style.removeProperty('--thumb-sparkle-pos-x');
        element.style.removeProperty('--thumb-sparkle-pos-y');
        element.style.removeProperty('--thumb-sparkle-opacity');
    }


    // === Lightbox Holo Effects ===

    let isLightboxDragging = false; // State for lightbox drag interaction

     /** Applies holo effect listeners to the lightbox image container */
     function applyFancyHoloListeners(containerSelector) {
         if (!areEffectsEnabled()) {
            console.log("[Effects] Lightbox holo listeners skipped (effects disabled).");
             return;
         }
         const container = document.querySelector(containerSelector);
         if (!container) return;

         // Clear old listeners
         container.removeEventListener('pointermove', handleFancyHoloMove);
         container.removeEventListener('pointerleave', handleFancyHoloEnd);
         container.removeEventListener('pointerup', handleFancyHoloPointerUp); // Changed from handleHoloEnd
         container.removeEventListener('pointerdown', handleFancyHoloPointerDown); // Added for dragging
         document.removeEventListener('pointermove', handleFancyHoloDrag); // Listener on document for dragging
         document.removeEventListener('pointerup', handleFancyHoloDragEnd); // Listener on document for drag end

         // Add new listeners
         container.addEventListener('pointermove', handleFancyHoloMove);
         container.addEventListener('pointerleave', handleFancyHoloEnd);
         container.addEventListener('pointerup', handleFancyHoloPointerUp);
         container.addEventListener('pointerdown', handleFancyHoloPointerDown);
         console.log("[Effects] Lightbox holo listeners applied to:", containerSelector);
     }

    // State variables for dragging/rotation in lightbox
    let fancyDragStartX = 0, fancyDragStartY = 0;
    let fancyCurrentRotateX = 0, fancyCurrentRotateY = 0;

    function handleFancyHoloPointerDown(e) {
        // Only initiate drag if effects are on, not touch, not zoomed
        if (!areEffectsEnabled() || e.pointerType === 'touch' || window.isZoomed) return; // Assumes isZoomed is global/accessible

        const target = e.target.closest('.fancy-holo-container'); // Listen on container
        const inner = document.getElementById('fancy-holo-inner');
        if (!target || !inner) return;

        isLightboxDragging = true;
        target.setPointerCapture(e.pointerId); // Capture pointer events
        fancyDragStartX = e.clientX;
        fancyDragStartY = e.clientY;

        // Get current rotation (more robustly)
        const ts = window.getComputedStyle(inner).transform;
        if (ts && ts !== 'none') {
            try {
                // Basic parsing for simple rotateX/Y - replace with DOMMatrix if needed
                const matrix = new DOMMatrixReadOnly(ts);
                 // These calculations might need adjustment based on matrix type (3d)
                 // This is complex; simpler might be to store last applied rotation degrees.
                 // Let's store the degrees directly when applying them instead.
                 // Resetting stored rotation for simplicity on new drag start:
                 fancyCurrentRotateX = 0;
                 fancyCurrentRotateY = 0;

            } catch (err) { fancyCurrentRotateX = 0; fancyCurrentRotateY = 0; }
        } else {
            fancyCurrentRotateX = 0; fancyCurrentRotateY = 0;
        }

        target.style.cursor = 'grabbing';
        inner.style.transition = 'none'; // Disable transition during drag
        e.preventDefault();

        // Add move/up listeners to the document to track dragging outside the element
        document.addEventListener('pointermove', handleFancyHoloDrag);
        document.addEventListener('pointerup', handleFancyHoloDragEnd);
    }

     function handleFancyHoloDrag(e) {
         if (!isLightboxDragging) return;
         const inner = document.getElementById('fancy-holo-inner');
         if (!inner) return;

         const dX = e.clientX - fancyDragStartX;
         const dY = e.clientY - fancyDragStartY;
         // Adjust sensitivity (0.15 factor)
         const nRY = fancyCurrentRotateY + (dX * 0.15);
         const nRX = fancyCurrentRotateX - (dY * 0.15); // Invert Y drag for natural feel

         // Apply transform (store these values if matrix parsing is too complex)
         // We'll apply rotation here, but the holo light/sparkle effect is still driven by handleFancyHoloMove
         inner.style.transform = `perspective(1000px) rotateX(${nRX}deg) rotateY(${nRY}deg)`;
     }

     function handleFancyHoloDragEnd(e) {
         if (!isLightboxDragging) return;
         const target = document.getElementById('fancy-holo-container');
         const inner = document.getElementById('fancy-holo-inner');

         isLightboxDragging = false;
         if (target) {
            target.releasePointerCapture(e.pointerId);
            target.style.cursor = 'grab';
         }
          if (inner) {
             inner.style.transition = 'transform 0.4s ease-out'; // Restore transition
             // Reset to non-rotated state *if* effects are on and not zoomed
             if (areEffectsEnabled() && !window.isZoomed) {
                  inner.style.transform = ''; // Smoothly return to center
                  setTimeout(() => {
                      if (!isLightboxDragging && inner) inner.style.transition = ''; // Remove transition after animation
                  }, 400);
             } else {
                // Store final rotation if zoomed or effects off? Or just reset?
                // Let's just remove transition if zoomed
                if (window.isZoomed) inner.style.transition = '';
             }
         }
          // Remove document listeners
         document.removeEventListener('pointermove', handleFancyHoloDrag);
         document.removeEventListener('pointerup', handleFancyHoloDragEnd);
     }


     /** Handles pointer movement for lightbox holo effect */
     function handleFancyHoloMove(e) {
         // Check global flag, touch, zoom, and dragging state
         if (!areEffectsEnabled() || e.pointerType === 'touch' || window.isZoomed || isLightboxDragging) {
             // If effects are off but holo was active, reset it
              if (!areEffectsEnabled()) resetFancyHoloEffect();
             return;
         }

         const container = document.getElementById('fancy-holo-container');
         const target = document.getElementById('fancy-holo-inner');
         if (!container || !target) return;

         // --- Holo Calculation Logic ---
        const rect = container.getBoundingClientRect();
        const clientX = e.clientX; const clientY = e.clientY;
        const relativeX = clientX - rect.left; const relativeY = clientY - rect.top;
        // Check bounds to prevent effect outside container? Maybe not necessary.
        if (rect.width === 0 || rect.height === 0) return; // Avoid division by zero
        const percentX = (relativeX / rect.width) * 100; const percentY = (relativeY / rect.height) * 100;
        const max_angle = 15; // Adjust intensity
        const rotateY = ((percentX / 100) - 0.5) * max_angle * 2;
        const rotateX = (((percentY / 100) - 0.5) * -max_angle * 2);
        const normX = percentX / 100; const normY = percentY / 100;
        const gradientX = 50 + ((percentX - 50) / -1.5); // Opposite direction
        const gradientY = 50 + ((percentY - 50) / -1.5);
        const sparkleX = 50 + ((percentX - 50) / 5); // Subtler movement
        const sparkleY = 50 + ((percentY - 50) / 5);
        const distFromCenter = Math.sqrt(Math.pow((normX - 0.5) * 2, 2) + Math.pow((normY - 0.5) * 2, 2));
        const sparkleOpacity = Math.min(0.4 + distFromCenter * 0.6, 0.9);

         // Apply styles
         target.classList.add('holo-active');
         // Only apply rotation if NOT dragging
         if (!isLightboxDragging) {
             target.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
         }
         target.style.setProperty('--lb-gradient-pos-x', `${gradientX}%`);
         target.style.setProperty('--lb-gradient-pos-y', `${gradientY}%`);
         target.style.setProperty('--lb-sparkle-pos-x', `${sparkleX}%`);
         target.style.setProperty('--lb-sparkle-pos-y', `${sparkleY}%`);
         target.style.setProperty('--lb-sparkle-opacity', sparkleOpacity);

         // Timeout to reset effect if pointer stops
         clearTimeout(window.fancyActiveHoloTimeout); // Use window scope if needed elsewhere, else keep local
         window.fancyActiveHoloTimeout = setTimeout(() => {
             const currentElement = document.elementFromPoint(clientX, clientY);
             if (container && container.contains(currentElement)) resetFancyHoloEffect(); // Only reset if still inside
         }, HOVER_EFFECT_TIMEOUT_MS);
     }

     /** Handles pointer leaving the lightbox container or pointer up*/
     function handleFancyHoloEnd(e) {
          // Don't reset on pointer leave if dragging is active
         if (isLightboxDragging) return;

          // Reset if leaving the main container
          const container = document.getElementById('fancy-holo-container');
          const relatedTarget = e.relatedTarget;
          if (container && (!relatedTarget || !container.contains(relatedTarget))) {
              resetFancyHoloEffect();
          }
     }
      // Specific handler for pointer up (might be redundant if dragEnd handles it)
     function handleFancyHoloPointerUp(e){
         if (!isLightboxDragging) {
             resetFancyHoloEffect();
         }
         // Drag end is handled by handleFancyHoloDragEnd
     }


     /** Resets the holo effect styles on the lightbox image */
     function resetFancyHoloEffect() {
         const target = document.getElementById('fancy-holo-inner');
         if (!target) return;

         // Always remove class and clear timeout
         target.classList.remove('holo-active');
         clearTimeout(window.fancyActiveHoloTimeout);

         // Reset transform only if effects are considered enabled and not zoomed
         if (areEffectsEnabled() && !window.isZoomed) {
              target.style.transform = '';
         }
         // Remove CSS variables
         target.style.removeProperty('--lb-gradient-pos-x');
         target.style.removeProperty('--lb-gradient-pos-y');
         target.style.removeProperty('--lb-sparkle-pos-x');
         target.style.removeProperty('--lb-sparkle-pos-y');
         target.style.removeProperty('--lb-sparkle-opacity');
     }

    // --- Expose Functions to Global Scope ---
    // Create a global object to avoid polluting window directly
    window.ForteEffects = {
        // Gallery Holo
        initGalleryHolo: applyHoloListeners,
        resetGalleryHolo: resetHoloEffect, // Might be needed by main script (e.g., on filter change)
        resetAllGalleryHolo: () => { // Helper to reset all currently active
             const allActive = document.querySelectorAll('#item-gallery .thumbnail.holo-active:not(.holo-click-active)');
             allActive.forEach(resetHoloEffect);
        },

        // Lightbox Holo
        initLightboxHolo: applyFancyHoloListeners,
        resetLightboxHolo: resetFancyHoloEffect // Needed by main script (lightbox close, zoom, view switch)
    };

    // --- Listen for Effects Setting Change ---
    document.addEventListener('forteSettingChanged', (event) => {
        if (event.detail.setting === 'effectsEnabled') {
            const enabled = event.detail.value;
            console.log("[Effects] Received effectsEnabled update:", enabled);
            // Update the global flag (redundant if settings.js already sets it, but safe)
             window.effectsEnabled = enabled;
            if (!enabled) {
                // If effects are disabled, immediately reset any active effects
                window.ForteEffects.resetAllGalleryHolo();
                window.ForteEffects.resetLightboxHolo();
                // Remove listeners? Or just let the checks handle it? Checks are simpler.
            } else {
                 // If effects enabled, re-apply listeners if needed (e.g., if they were removed)
                 // For now, we assume listeners remain attached and checks handle enabling/disabling.
                 // window.ForteEffects.initGalleryHolo('#item-gallery'); // Re-attach if needed
                 // window.ForteEffects.initLightboxHolo('#fancy-holo-container'); // Re-attach if needed
            }
        }
    });

     console.log("[Effects] Module initialized and exposed functions on window.ForteEffects.");

})(); // End of IIFE
// legend_popup.js

(function() { // Use an IIFE (Immediately Invoked Function Expression) to avoid polluting the global scope
    'use strict';

    // --- Hoopa Theme Colors ---
    const hoopaColors = {
        background: '#3E325A', // Dark Purple/Grey base
        contentBg: '#4C3D6E', // Slightly lighter purple for content
        border: '#E85E9A', // Pink accent for borders
        title: '#FDD835', // Yellow for title/highlights
        textPrimary: '#F0F0F0', // Light grey/white text
        textSecondary: '#A090C0', // Lighter purple/grey text
        kbdBg: '#31264A', // Darker purple for kbd
        kbdBorder: '#5C4A7E',
        overlayBg: 'rgba(40, 30, 60, 0.75)', // Semi-transparent purple overlay
        closeHover: '#FFFFFF'
    };

    /** --- CSS Injection ---
     * Dynamically creates and injects CSS rules for the popup into the <head>.
     */
    function injectLegendCSS() {
        const css = `
            .key-info-button {
                background-color: rgba(107, 114, 128, 0.3);
                color: var(--color-text-secondary, #A090C0); /* Use CSS var fallback */
                border: 1px solid var(--color-border, ${hoopaColors.textSecondary});
                border-radius: 50%;
                padding: 0.3rem 0.5rem;
                font-size: 0.9rem;
                line-height: 1;
                cursor: pointer;
                transition: all 0.2s ease-in-out;
                margin-left: 0.5rem;
                align-self: center;
            }
            .key-info-button:hover {
                background-color: rgba(107, 114, 128, 0.5);
                color: var(--color-text-primary, #F0F0F0);
                border-color: ${hoopaColors.border}; /* Hoopa pink */
            }
            .key-popup-overlay {
                position: fixed;
                inset: 0;
                background-color: ${hoopaColors.overlayBg};
                display: none; /* Initially hidden */
                align-items: center;
                justify-content: center;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
            }
            .key-popup-overlay.visible {
                display: flex; /* Use flex to enable centering */
                opacity: 1;
            }
            .key-popup-content {
                background-color: ${hoopaColors.contentBg};
                color: ${hoopaColors.textPrimary};
                border-radius: 8px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
                width: 90%;
                max-width: 550px;
                max-height: 85vh;
                overflow-y: auto;
                border: 2px solid ${hoopaColors.border}; /* Hoopa pink border */
                font-family: 'Inter', sans-serif; /* Ensure consistent font */
            }
            .key-popup-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem 1.25rem;
                border-bottom: 1px solid ${hoopaColors.border}; /* Hoopa pink */
                background-color: ${hoopaColors.background}; /* Darker header */
                border-top-left-radius: 6px; /* Match content radius */
                 border-top-right-radius: 6px;
            }
            .key-popup-title {
                font-size: 1.25rem;
                font-weight: bold;
                color: ${hoopaColors.title}; /* Hoopa yellow */
                text-shadow: 1px 1px 2px rgba(0,0,0,0.4);
            }
            .key-popup-close {
                background: none;
                border: none;
                font-size: 1.3rem;
                color: ${hoopaColors.textSecondary};
                cursor: pointer;
                padding: 0.25rem;
                line-height: 1;
                transition: color 0.2s ease;
            }
            .key-popup-close:hover {
                color: ${hoopaColors.closeHover};
            }
            .key-popup-body {
                padding: 1rem 1.25rem;
            }
            .key-popup-body h4 {
                font-weight: bold;
                margin-top: 0.75rem;
                margin-bottom: 0.35rem;
                color: ${hoopaColors.title}; /* Hoopa yellow */
                border-bottom: 1px solid ${hoopaColors.border}; /* Hoopa pink */
                padding-bottom: 0.3rem;
                font-size: 1.05em;
            }
             .key-popup-body h4:first-child {
                margin-top: 0;
            }
            .key-popup-body ul {
                list-style: none;
                padding-left: 0;
                margin-bottom: 0.85rem;
            }
            .key-popup-body li {
                margin-bottom: 0.4rem;
                color: ${hoopaColors.textSecondary};
                font-size: 0.95rem;
                line-height: 1.4;
            }
            .key-popup-body kbd {
                background-color: ${hoopaColors.kbdBg};
                border: 1px solid ${hoopaColors.kbdBorder};
                border-radius: 4px;
                padding: 0.15em 0.5em;
                font-family: 'Inter', sans-serif;
                font-size: 0.85em;
                box-shadow: 1px 1px 2px rgba(0,0,0,0.2);
                margin: 0 0.15em;
                color: ${hoopaColors.textPrimary};
                white-space: nowrap;
            }
            .key-popup-body i {
                display: inline-block;
                width: 1.3em;
                text-align: center;
                color: ${hoopaColors.title}; /* Hoopa yellow */
                margin-right: 0.2em;
            }
            .key-popup-body .fa-heart { color: ${hoopaColors.border}; } /* Like color */
        `;
        const styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.id = 'legend-popup-styles'; // Add an ID for potential removal/check
        styleElement.appendChild(document.createTextNode(css));
        document.head.appendChild(styleElement);
        console.log("[Legend Popup] Hoopa CSS injected.");
    }

    /** --- HTML Creation ---
     * Creates and appends the Button and Modal elements to the DOM.
     */
    function createLegendHTML() {
        // Create Button
        const button = document.createElement('button');
        button.id = 'key-info-button'; // Use the same ID as before for consistency
        button.className = 'key-info-button';
        button.title = 'Show Controls Key';
        button.setAttribute('aria-label', 'Show Controls Key');
        button.innerHTML = '<i class="fas fa-question-circle"></i>';

        // Find target container for the button (adjust selector if needed)
        const controlsContainer = document.querySelector('#filter-controls');
        if (controlsContainer) {
            controlsContainer.appendChild(button);
        } else {
            console.warn("[Legend Popup] Could not find #filter-controls to append button.");
            // Fallback: Append to body if controls not found
             document.body.appendChild(button);
             button.style.position = 'fixed'; // Make it easily visible if fallback
             button.style.top = '10px';
             button.style.right = '10px';
             button.style.zIndex = '900';
        }

        // Create Modal Structure
        const modal = document.createElement('div');
        modal.id = 'key-popup-modal';
        modal.className = 'key-popup-overlay';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none'; // Start hidden

        modal.innerHTML = `
            <div class="key-popup-content">
                <div class="key-popup-header">
                    <h3 class="key-popup-title"><i class="fas fa-ring mr-2"></i>Controls Key</h3>
                    <button id="key-popup-close" class="key-popup-close" aria-label="Close key">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="key-popup-body">
                    <h4>Gallery</h4>
                    <ul>
                        <li><kbd>Click Thumbnail</kbd> / <kbd>Enter</kbd> / <kbd>Space</kbd> : Open card viewer</li>
                        <li><kbd>Arrow Keys</kbd> : Navigate gallery grid</li>
                        <li><kbd>Home</kbd> / <kbd>End</kbd> : Go to first/last card</li>
                        <li><i class="far fa-heart"></i> / <i class="fas fa-heart"></i> : Like/Unlike card</li>
                    </ul>
                    <h4>Card Viewer</h4>
                    <ul>
                        <li><kbd>←</kbd> / <kbd>→</kbd> : Previous/Next card</li>
                        <li><kbd>+</kbd> / <kbd>-</kbd> / <kbd>0</kbd> : Zoom In / Out / Reset</li>
                        <li><kbd>Double Click</kbd> : Zoom In / Reset Zoom</li>
                         <li><kbd>Drag</kbd> : Rotate card (when not zoomed)</li>
                        <li><kbd>Space</kbd> : Toggle Normal / Textless view</li>
                        <li><kbd>Esc</kbd> : Close viewer</li>
                    </ul>
                     <h4>Audio Player</h4>
                    <ul>
                         <li><i class="fas fa-play"></i> / <i class="fas fa-pause"></i> : Play/Pause music</li>
                         <li><i class="fas fa-forward-step"></i> : Next Song</li>
                         <li><i class="fas fa-volume-high"></i> / <i class="fas fa-volume-mute"></i> : Mute/Unmute (Hover for Slider)</li>
                    </ul>
                </div>
            </div>`;

        document.body.appendChild(modal);
        console.log("[Legend Popup] HTML elements created.");
    }

    /** --- Event Handling & Initialization --- */
    function initializeLegendPopup() {
        console.log("[Legend Popup] Initializing...");
        createLegendHTML();
        injectLegendCSS();

        const keyInfoButton = document.getElementById('key-info-button');
        const keyPopupModal = document.getElementById('key-popup-modal');
        const keyPopupCloseButton = document.getElementById('key-popup-close');

        if (!keyInfoButton || !keyPopupModal || !keyPopupCloseButton) {
            console.error("[Legend Popup] Failed to find necessary elements after creation.");
            return;
        }

        const openKeyPopup = () => {
            keyPopupModal.style.display = 'flex';
            void keyPopupModal.offsetWidth; // Trigger reflow
            keyPopupModal.classList.add('visible');
            keyPopupModal.setAttribute('aria-hidden', 'false');
            keyPopupCloseButton.focus();
            // Add ESC listener only when popup is open
            document.addEventListener('keydown', handleLegendEscKey);
            console.log("[Legend Popup] Opened.");
        };

        const closeKeyPopup = () => {
            keyPopupModal.classList.remove('visible');
            keyPopupModal.setAttribute('aria-hidden', 'true');
            // Remove ESC listener when popup is closed
            document.removeEventListener('keydown', handleLegendEscKey);

            // Wait for transition before setting display: none
            const handleTransitionEnd = () => {
                if (!keyPopupModal.classList.contains('visible')) {
                    keyPopupModal.style.display = 'none';
                }
            };
            keyPopupModal.removeEventListener('transitionend', handleTransitionEnd); // Prevent multiple listeners
            keyPopupModal.addEventListener('transitionend', handleTransitionEnd, { once: true });

            // Fallback timeout in case transitionend doesn't fire
            setTimeout(() => {
                 if (!keyPopupModal.classList.contains('visible')) {
                    keyPopupModal.style.display = 'none';
                }
            }, 400); // Slightly longer than transition duration

            console.log("[Legend Popup] Closed.");
            // Optional: Refocus the button that opened it
             keyInfoButton.focus();
        };

        // ESC key handler specific to this popup
        const handleLegendEscKey = (event) => {
            if (event.key === 'Escape') {
                event.stopPropagation(); // Prevent other ESC handlers (like lightbox close) if popup is open
                closeKeyPopup();
            }
        };

        // Attach listeners
        keyInfoButton.addEventListener('click', openKeyPopup);
        keyPopupCloseButton.addEventListener('click', closeKeyPopup);
        keyPopupModal.addEventListener('click', (event) => { // Close on overlay click
            if (event.target === keyPopupModal) {
                closeKeyPopup();
            }
        });

         console.log("[Legend Popup] Initialization complete.");
    }

    // --- Run Initialization ---
    // Use DOMContentLoaded to ensure the target elements (like #filter-controls) exist
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeLegendPopup);
    } else {
        initializeLegendPopup(); // DOM already loaded
    }

})(); // End of IIFE
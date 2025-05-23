
// legend_popup.js
// Provides a popup explaining controls and data sources for the Forte Card Previewer.

(function() {
    'use strict';

    // --- Theme Colors (Hoopa Theme) ---
    const hoopaColors = {
        background: '#3E325A',    // Dark Purple/Grey base
        contentBg: '#4C3D6E',    // Slightly lighter purple for content
        border: '#E85E9A',      // Pink accent for borders
        title: '#FDD835',       // Yellow for title/highlights
        textPrimary: '#F0F0F0',   // Light grey/white text
        textSecondary: '#A090C0', // Lighter purple/grey text
        kbdBg: '#31264A',        // Darker purple for kbd
        kbdBorder: '#5C4A7E',
        overlayBg: 'rgba(40, 30, 60, 0.85)', // Semi-transparent purple overlay
        closeHover: '#FFFFFF'
    };

    function injectLegendCSS() {
        const css = `
            .key-info-button {
                background-color: rgba(107, 114, 128, 0.2); /* More subtle */
                color: var(--color-text-secondary, ${hoopaColors.textSecondary});
                border: 1px solid var(--color-border, ${hoopaColors.textSecondary});
                border-radius: 0.375rem; /* Rounded-md */
                padding: 0.4rem 0.6rem; /* Adjusted padding */
                font-size: 0.8rem;
                line-height: 1;
                cursor: pointer;
                transition: all 0.2s ease-in-out;
                margin-left: 0.5rem;
                align-self: center;
            }
            .key-info-button:hover {
                background-color: rgba(107, 114, 128, 0.4);
                color: var(--color-text-primary, ${hoopaColors.textPrimary});
                border-color: var(--color-accent, ${hoopaColors.border});
            }
            .key-popup-overlay {
                position: fixed; inset: 0;
                background-color: ${hoopaColors.overlayBg};
                display: none; align-items: center; justify-content: center;
                z-index: 10001; /* Above lightbox */
                opacity: 0; transition: opacity 0.25s ease-in-out;
            }
            .key-popup-overlay.visible { display: flex; opacity: 1; }
            .key-popup-content {
                background-color: ${hoopaColors.contentBg};
                color: ${hoopaColors.textPrimary};
                border-radius: 0.5rem; /* md */
                box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4), 0 8px 10px -6px rgba(0,0,0,0.3);
                width: 90%; max-width: 500px; /* Slightly narrower */
                max-height: 85vh;
                overflow-y: auto;
                border: 1px solid ${hoopaColors.border};
                font-family: 'Inter', sans-serif;
                display: flex; flex-direction: column;
            }
            .key-popup-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 0.75rem 1rem;
                border-bottom: 1px solid ${hoopaColors.border};
                background-color: ${hoopaColors.background};
            }
            .key-popup-title {
                font-size: 1.125rem; font-weight: 600;
                color: ${hoopaColors.title};
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            }
            .key-popup-close {
                background: none; border: none; font-size: 1.25rem;
                color: ${hoopaColors.textSecondary}; cursor: pointer;
                padding: 0.25rem; line-height: 1; transition: color 0.2s ease;
            }
            .key-popup-close:hover { color: ${hoopaColors.closeHover}; }
            .key-popup-body { padding: 1rem; font-size: 0.875rem; }
            .key-popup-body h4 {
                font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem;
                color: ${hoopaColors.title};
                border-bottom: 1px solid ${hoopaColors.border};
                padding-bottom: 0.25rem; font-size: 1rem;
            }
            .key-popup-body h4:first-child { margin-top: 0; }
            .key-popup-body ul { list-style: none; padding-left: 0; margin-bottom: 1rem; }
            .key-popup-body li { margin-bottom: 0.3rem; color: ${hoopaColors.textSecondary}; line-height: 1.5; }
            .key-popup-body kbd {
                background-color: ${hoopaColors.kbdBg}; border: 1px solid ${hoopaColors.kbdBorder};
                border-radius: 3px; padding: 0.1em 0.4em; font-family: 'Inter', sans-serif;
                font-size: 0.8em; box-shadow: 1px 1px 1px rgba(0,0,0,0.1);
                margin: 0 0.1em; color: ${hoopaColors.textPrimary}; white-space: nowrap;
            }
            .key-popup-body i {
                display: inline-block; width: 1.2em; text-align: center;
                color: ${hoopaColors.title}; margin-right: 0.3em;
            }
            .key-popup-body .note {
                font-size: 0.8rem; color: ${hoopaColors.textSecondary};
                margin-top: 1rem; padding-top: 0.75rem;
                border-top: 1px dashed ${hoopaColors.border};
            }
        `;
        const styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.id = 'legend-popup-styles';
        if (!document.getElementById(styleElement.id)) { // Prevent duplicate injection
            styleElement.appendChild(document.createTextNode(css));
            document.head.appendChild(styleElement);
            console.log("[Legend Popup] CSS injected.");
        }
    }

    function createLegendHTML() {
        if (document.getElementById('key-info-button')) return; // Prevent duplicate creation

        const button = document.createElement('button');
        button.id = 'key-info-button';
        button.className = 'key-info-button';
        button.title = 'Show Info & Controls Key';
        button.setAttribute('aria-label', 'Show Info & Controls Key');
        button.innerHTML = '<i class="fas fa-info-circle"> </i> Info'; // Changed icon

        const discordbutton = document.getElementById('discords-button');
        if (discordbutton) {
            discordbutton.insertBefore(button, discordbutton.firstChild); // Add before submission button
        } else {
            console.warn("[Legend Popup] #sdiscord-button not found. Appending button to body as fallback.");
            document.body.appendChild(button);
            button.style.cssText = 'position:fixed; top:15px; right:60px; z-index:1001;'; // Adjust fallback position
        }

        const modal = document.createElement('div');
        modal.id = 'key-popup-modal';
        modal.className = 'key-popup-overlay';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';

        modal.innerHTML = `
            <div class="key-popup-content">
                <div class="key-popup-header">
                    <h3 class="key-popup-title"><i class="fas fa-info-circle mr-2"></i>Info & Controls</h3>
                    <button id="key-popup-close" class="key-popup-close" aria-label="Close key">
                        <i class="fas fa-times"></i>
                        
                    </button>
                </div>
                <div class="key-popup-body">
                    <h4>Data Source</h4>
                    <ul>
                        <li>Card information is loaded from a central <code>cards.json</code> file.</li>
                        <li>This file is automatically updated from a Google Sheet when new cards are approved.</li>
                    </ul>
                    <h4>Gallery Navigation</h4>
                    <ul>
                        <li><kbd>Click Thumbnail</kbd> or <kbd>Enter</kbd>/<kbd>Space</kbd> on a focused thumbnail: Open card viewer.</li>
                    </ul>
                    <h4>Card Viewer (Lightbox)</h4>
                    <ul>
                        <li><kbd>←</kbd> / <kbd>→</kbd> : Navigate to Previous/Next card in the current filtered view.</li>
                        <li><kbd>Esc</kbd> : Close the card viewer.</li>
                        <li>The displayed image is the primary card image. Textless versions are no longer a separate view in the lightbox.</li>
                    </ul>
                     <h4>Filtering & Sorting</h4>
                    <ul>
                        <li>Use the dropdowns in the sidebar to filter cards by Category, Type/Subtype, Rarity, Creator, and Forte Status.</li>
                        <li>Use the "Sort By" dropdown to change the order of cards in the gallery.</li>
                        <li>Click on Set tabs at the top to view cards from specific sets or all sets.</li>
                    </ul>
                    <p class="note">This previewer is a fan project. Pokémon and its trademarks are ©1995-2024 Nintendo, Creatures Inc., GAME FREAK inc.</p>
                </div>
            </div>`;
        document.body.appendChild(modal);
        console.log("[Legend Popup] HTML elements created.");
    }

    function initializeLegendPopup() {
        if (document.getElementById('key-info-button-initialized')) return; // Already initialized

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
        keyInfoButton.id = 'key-info-button-initialized'; // Mark as initialized

        const openKeyPopup = () => {
            keyPopupModal.style.display = 'flex';
            requestAnimationFrame(() => { // Ensure display:flex is applied before opacity transition
                 keyPopupModal.classList.add('visible');
            });
            keyPopupModal.setAttribute('aria-hidden', 'false');
            keyPopupCloseButton.focus();
            document.addEventListener('keydown', handleLegendEscKey);
        };

        const closeKeyPopup = () => {
            keyPopupModal.classList.remove('visible');
            keyPopupModal.setAttribute('aria-hidden', 'true');
            document.removeEventListener('keydown', handleLegendEscKey);
            keyPopupModal.addEventListener('transitionend', () => {
                if (!keyPopupModal.classList.contains('visible')) {
                    keyPopupModal.style.display = 'none';
                }
            }, { once: true });
             setTimeout(() => { // Fallback
                if (!keyPopupModal.classList.contains('visible')) keyPopupModal.style.display = 'none';
            }, 300);
            keyInfoButton.focus();
        };

        const handleLegendEscKey = (event) => {
            if (event.key === 'Escape' && keyPopupModal.classList.contains('visible')) {
                event.stopPropagation(); 
                closeKeyPopup();
            }
        };

        keyInfoButton.addEventListener('click', openKeyPopup);
        keyPopupCloseButton.addEventListener('click', closeKeyPopup);
        keyPopupModal.addEventListener('click', (event) => {
            if (event.target === keyPopupModal) closeKeyPopup();
        });
        console.log("[Legend Popup] Initialization complete.");
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeLegendPopup);
    } else {
        initializeLegendPopup();
    }
})();
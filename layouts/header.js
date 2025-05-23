// layouts/header.js
(function() {
    'use strict';

    /**
     * Creates the HTML string for the header's content.
     * Includes version badge and prepares for changelog modal.
     * @returns {string} The HTML string.
     */
    function createHeaderContentHTML() {
        let versionBadgeHTML = '';
        // More robust check for window.latestVersion and its version property
        if (window.latestVersion && typeof window.latestVersion.version !== 'undefined' && window.latestVersion.version !== null) {
            versionBadgeHTML = `
                <span id="version-badge" class="version-badge" role="button" tabindex="0" aria-label="View Changelog, Version ${window.latestVersion.version}">
                    v${window.latestVersion.version}
                </span>`;
        } else {
            // This console warning will appear if the version data isn't ready
            console.warn('[Header] window.latestVersion or window.latestVersion.version is not available when createHeaderContentHTML was called. Version badge not rendered.');
        }

        const html = `
            <div class="header-content">
                <div class="brand-area">
                    <h1 class="title-glow">Forte Card Viewer</h1>
                    ${versionBadgeHTML}
                </div>
                <div class="search-container">
                    <input type="text" id="card-search" class="search-input" placeholder="Search cards..." autocomplete="off" aria-label="Search cards">
                    <i class="fas fa-search search-icon" aria-hidden="true"></i>
                    <i class="fas fa-times clear-search" id="clear-search" role="button" aria-label="Clear search" tabindex="0" style="display: none;"></i>
                </div>
                <div class="header-actions">
                    <div id="discords-button-container"> 
                        <a href="https://discord.gg/fortecommunity" target="_blank" rel="noopener noreferrer" class="discord-button">
                            <i class="fab fa-discord" aria-hidden="true"></i>
                            <span>Join Discord</span>
                        </a>
                    </div>
                    <div id="access-controls"> 
                        <button id="submission-button" class="access-button">
                            <i class="fas fa-upload" aria-hidden="true"></i>
                            <span>Submit Card</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        return html;
    }

    /**
     * Renders the header into the DOM and sets up changelog interactions.
     */
    function renderHeader() {
        let headerElement = document.querySelector('header.app-header');

        if (!headerElement) {
            console.warn('<header class="app-header"> element not found. Creating one.');
            headerElement = document.createElement('header');
            headerElement.className = 'app-header';
            if (document.body.firstChild) {
                document.body.insertBefore(headerElement, document.body.firstChild);
            } else {
                document.body.appendChild(headerElement);
            }
        }
        
        headerElement.innerHTML = createHeaderContentHTML(); // This now includes the check for version data
        console.log('[Header] Header HTML injected.');

        const versionBadge = document.getElementById('version-badge');
        if (versionBadge) {
            console.log('[Header] Version badge found, attaching listeners.');
            versionBadge.addEventListener('click', openChangelogModal);
            versionBadge.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openChangelogModal();
                }
            });
        } else {
            // This will log if the badge element itself wasn't created.
            console.warn('[Header] Version badge element (id="version-badge") not found in the DOM after rendering header. Changelog click will not work.');
        }
    }

    /**
     * Keyword mapping for styling changelog items.
     * Keys should be uppercase and include the colon.
     */
    const keywordsMap = {
        "ADDED:": "changelog-keyword-added",
        "IMPROVED:": "changelog-keyword-improved",
        "FIXED:": "changelog-keyword-fixed",
        "CHANGED:": "changelog-keyword-changed",
        "REMOVED:": "changelog-keyword-removed",
        "REDUCED:": "changelog-keyword-reduced",
        "REPLACED:": "changelog-keyword-replaced",
        "NEW:": "changelog-keyword-new",
        "UPDATED:": "changelog-keyword-updated",
        // Subsection titles from your changelogData.js (ensure these match exactly, case-insensitively for the check)
        "**MODULAR UI COMPONENTS:**": "changelog-subsection-title",
        "**VERSION & CHANGELOG SYSTEM:**": "changelog-subsection-title",
        "**HEADER & BUTTON ENHANCEMENTS:**": "changelog-subsection-title",
        "**GENERAL UI/UX:**": "changelog-subsection-title",
        "**BUG FIXES & STABILITY:**": "changelog-subsection-title", // Added based on your changelog
        "**PROJECT DIRECTION & CORE CHANGES:**": "changelog-subsection-title",
        "**CUSTOM CARD & DATA MANAGEMENT:**": "changelog-subsection-title",
        "**CORE FUNCTIONALITY ADAPTATION:**": "changelog-subsection-title",
        "**CORE IMAGE GALLERY FEATURES:**": "changelog-subsection-title",
        "**INTERACTIVE ELEMENTS & UX:**": "changelog-subsection-title",
        "**MULTIMEDIA & AESTHETICS:**": "changelog-subsection-title",
    };

    /**
     * Renders a single changelog item, applying keyword styling.
     * @param {string} itemText - The text of the changelog item.
     * @returns {DocumentFragment} - A fragment containing styled HTML elements.
     */
    function renderChangelogItem(itemText) {
        let textToProcess = String(itemText).trimStart();
        const fragment = document.createDocumentFragment();
        
        let processedAsSubsection = false;
        // Check for subsection title first (case-insensitive check for robustness)
        for (const titleKeyword in keywordsMap) {
            if (keywordsMap[titleKeyword].includes('subsection-title') && 
                textToProcess.toUpperCase().startsWith(titleKeyword.toUpperCase())) {
                const span = document.createElement('span');
                span.className = `changelog-keyword ${keywordsMap[titleKeyword]}`;
                // Use the original casing from itemText for the title itself, remove markdown
                const originalTitle = itemText.substring(0, titleKeyword.length).replace(/\*\*/g, '');
                span.textContent = originalTitle;
                fragment.appendChild(span);
                textToProcess = textToProcess.substring(titleKeyword.length).trimStart();
                processedAsSubsection = true;
                break;
            }
        }

        // If it was NOT a subsection title OR if there's text remaining after a subsection title, process for leading keywords.
        if (!processedAsSubsection || textToProcess.length > 0) {
            const words = textToProcess.split(/(\s+)/); // Split by space, keeping spaces
            const firstWordCandidate = words.length > 0 ? words[0] : "";
            const firstWordUpperWithColon = firstWordCandidate.endsWith(':') ? firstWordCandidate.toUpperCase() : (firstWordCandidate + ":").toUpperCase();

            if (keywordsMap[firstWordUpperWithColon] && !keywordsMap[firstWordUpperWithColon].includes('subsection-title')) {
                const keywordSpan = document.createElement('span');
                keywordSpan.className = `changelog-keyword ${keywordsMap[firstWordUpperWithColon]}`;
                keywordSpan.textContent = firstWordCandidate; // Original casing
                fragment.appendChild(keywordSpan);
                // Add the space back if it was there, then the rest of the text
                if (words.length > 1) fragment.appendChild(document.createTextNode(words[1])); // The space
                textToProcess = words.slice(2).join('').trimStart();
            }
        }
        
        // Process remaining text for bolding (**)
        const parts = textToProcess.split(/(\*\*.*?\*\*)/g);
        parts.forEach(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const strong = document.createElement('strong');
                strong.textContent = part.substring(2, part.length - 2);
                fragment.appendChild(strong);
            } else if (part) {
                fragment.appendChild(document.createTextNode(part));
            }
        });
        
        return fragment;
    }


    /**
     * Opens the changelog modal.
     */
    function openChangelogModal() {
        if (!window.changelogData || window.changelogData.length === 0) {
            console.warn('[Header] Changelog data not available for modal.');
            if (window.ForteUIControls && typeof window.ForteUIControls.showToast === 'function') {
                window.ForteUIControls.showToast('Changelog data is not available.', 'error');
            } else {
                alert('Changelog data is not available.');
            }
            return;
        }

        const existingModal = document.querySelector('.changelog-modal-overlay');
        if (existingModal) existingModal.remove();

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'changelog-modal-overlay key-popup-overlay';

        let accordionHTML = '';
        window.changelogData.forEach((versionLog, index) => {
            let changesHTML = '';
            if (versionLog.changes && Array.isArray(versionLog.changes)) {
                versionLog.changes.forEach(category => {
                    let itemsHTML = '';
                    if (category.items && Array.isArray(category.items) && category.items.length > 0) {
                        category.items.forEach(item => {
                            const tempDiv = document.createElement('div');
                            tempDiv.appendChild(renderChangelogItem(item));
                            itemsHTML += `<li class="changelog-item">${tempDiv.innerHTML}</li>`;
                        });
                    } else {
                        itemsHTML = '<li>No specific items listed for this category.</li>';
                    }
                    changesHTML += `
                        <div class="changelog-category">
                            <h5 class="changelog-category-title">${category.title}</h5>
                            <ul class="list-unstyled">${itemsHTML}</ul>
                        </div>`;
                });
            }

            const isOpenAttribute = versionLog.isOpen || index === 0 ? 'open' : '';
            accordionHTML += `
                <details class="changelog-accordion-item" ${isOpenAttribute}>
                    <summary class="changelog-accordion-header">
                        <span class="fw-bold me-2">Version ${versionLog.version}</span>
                        ${versionLog.title ? `<span class="text-muted me-2">- ${versionLog.title}</span>` : ''}
                        ${versionLog.date ? `<small class="text-muted">(${versionLog.date})</small>` : ''}
                    </summary>
                    <div class="changelog-accordion-body">
                        ${changesHTML}
                    </div>
                </details>
            `;
        });
        
        const isDarkMode = document.body.classList.contains('dark-theme') || 
                           (window.AppThemeContext && window.AppThemeContext.theme === 'dark'); 
        const modalThemeClass = isDarkMode ? 'changelog-modal-dark' : 'changelog-modal-light';

        modalOverlay.innerHTML = `
            <div class="changelog-modal-content key-popup-content ${modalThemeClass}">
                <div class="changelog-modal-header key-popup-header">
                    <h3 class="changelog-modal-title key-popup-title">
                        <i class="fas fa-history mr-2"></i>Application Changelog
                    </h3>
                    <button class="changelog-modal-close key-popup-close" aria-label="Close Changelog">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="changelog-modal-body key-popup-body">
                    ${accordionHTML}
                    <hr style="margin-top: var(--space-4, 1rem); margin-bottom: var(--space-3, 0.75rem); border-color: var(--color-border-light);">
                    <p class="text-muted small" style="font-size: var(--text-xs, 0.75rem); text-align: center;">
                        Forte Card Previewer Changelog
                    </p>
                </div>
            </div>
        `;
        document.body.appendChild(modalOverlay);

        requestAnimationFrame(() => {
            modalOverlay.classList.add('visible');
        });

        const closeButton = modalOverlay.querySelector('.changelog-modal-close');
        const closeModalFunction = () => {
            modalOverlay.classList.remove('visible');
            const escHandlerRef = modalOverlay.escHandlerRef;
            modalOverlay.addEventListener('transitionend', () => {
                if (document.body.contains(modalOverlay)) document.body.removeChild(modalOverlay);
                if (escHandlerRef) document.removeEventListener('keydown', escHandlerRef);
            }, { once: true });
            setTimeout(() => { 
                if (document.body.contains(modalOverlay)) document.body.removeChild(modalOverlay);
                if (escHandlerRef) document.removeEventListener('keydown', escHandlerRef);
            }, 300);
        };

        if (closeButton) closeButton.addEventListener('click', closeModalFunction);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModalFunction();
        });
        
        modalOverlay.escHandlerRef = (e) => {
            if (e.key === 'Escape') closeModalFunction();
        };
        document.addEventListener('keydown', modalOverlay.escHandlerRef);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderHeader);
    } else {
        renderHeader();
    }

})();

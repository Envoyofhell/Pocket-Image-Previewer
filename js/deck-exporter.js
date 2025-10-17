// js/deck-exporter.js
// Modular deck building and export functionality
// Right-side deck drawer matching left sidebar styling

(function() {
    'use strict';

    // --- Deck State ---
    const deck = []; // Array of {card: cardData, qty: number}
    const MIN_DECK_SIZE = 40;
    const MAX_DECK_SIZE = 60;
    const STANDARD_DECK_SIZE = 60;

    // --- UI Elements (will be created dynamically) ---
    let deckDrawer = null;
    let deckList = null;
    let deckCountDisplay = null;
    let exportButton = null;
    let deckNameInput = null;
    let isDeckDrawerCollapsed = false; // Default to open

    /**
     * Initialize deck exporter - create drawer UI and set up event listeners
     */
    function init() {
        console.log('[Deck Exporter] Initializing...');
        
        // Wait for gallery to be available
        const checkGallery = setInterval(() => {
            const gallery = document.querySelector('.app-gallery-area');
            if (gallery) {
                clearInterval(checkGallery);
                createDeckDrawer();
                attachCardPlusButtons();
                setupDragAndDrop();
                loadDeckDrawerState();
                loadDeckState(); // Load saved deck
                updateDeckUI();
            }
        }, 100);
    }

    /**
     * Create the right-side deck drawer UI (inside gallery area)
     */
    function createDeckDrawer() {
        const galleryArea = document.querySelector('.app-gallery-area');
        if (!galleryArea) {
            console.error('[Deck Exporter] Gallery area not found!');
            return;
        }

        // Check if already initialized
        if (document.getElementById('deck-drawer')) {
            console.log('[Deck Exporter] Deck drawer already exists');
            return;
        }

        // Get existing elements BEFORE clearing
        const itemGallery = document.getElementById('item-gallery');
        const emptyMessage = document.getElementById('empty-folder-message');
        
        if (!itemGallery) {
            console.error('[Deck Exporter] item-gallery not found!');
            return;
        }

        // Store original parent for reference
        const originalParent = galleryArea;
        
        // Clear and setup flex layout
        galleryArea.innerHTML = '';
        galleryArea.style.display = 'flex';
        galleryArea.style.gap = '0';

        // Create gallery content wrapper
        const galleryContent = document.createElement('div');
        galleryContent.id = 'gallery-content-wrapper';
        galleryContent.className = 'gallery-content-wrapper';
        
        // Append the preserved elements
        galleryContent.appendChild(itemGallery);
        if (emptyMessage) {
            galleryContent.appendChild(emptyMessage);
        }
        
        // Update ForteGallery's reference to use the wrapper for scrolling
        if (window.ForteGallery) {
            window.ForteGallery.galleryScrollContainer = galleryContent;
            console.log('[Deck Exporter] Updated ForteGallery scroll container');
        }
        
        // Create drawer container (matching left sidebar structure)
        deckDrawer = document.createElement('aside');
        deckDrawer.id = 'deck-drawer';
        deckDrawer.className = 'deck-drawer';
        deckDrawer.innerHTML = `
            <!-- Deck Drawer Content -->
            <div class="sidebar-content">
                <h2 class="text-lg font-semibold mt-1 mb-3" style="color: var(--color-text-primary);">
                    📦 Deck Builder
                </h2>
                
                <!-- Deck Name Input -->
                <div class="filter-group mb-4">
                    <label class="filter-label">Deck Name</label>
                    <input 
                        type="text" 
                        id="deck-name-input" 
                        class="filter-input" 
                        placeholder="My Awesome Deck" 
                        maxlength="50"
                    >
                </div>

                <!-- Card Count Display -->
                <div class="deck-count-display" id="deck-count-display">
                    <div class="deck-count-number">0</div>
                    <div class="deck-count-label">/ 60 cards</div>
                    <div class="deck-count-status" id="deck-count-status">
                        Add cards to build your deck
                    </div>
                </div>

                <!-- Deck List -->
                <div class="filter-group deck-list-wrapper">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <label class="filter-label" style="margin: 0;">Cards in Deck</label>
                        <button class="deck-clear-btn" id="clear-deck-btn" title="Clear all cards">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <div class="deck-list" id="deck-list">
                        <div class="deck-empty-state">
                            <p>🎴</p>
                            <p>Drag cards here<br>or click +</p>
                        </div>
                    </div>
                </div>

                <!-- Export Section -->
                <div class="filter-group" style="margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--color-border);">
                    <!-- Export Button -->
                    <button class="deck-export-btn" id="deck-export-btn" disabled>
                        <i class="fas fa-file-download"></i> Export Deck (CSV)
                    </button>
                    <p style="font-size: 0.7rem; color: var(--color-text-tertiary); text-align: center; margin-top: 0.5rem;">
                        Standard CSV format
                    </p>
                </div>
            </div>

            <!-- Toggle Button (Matches left sidebar) -->
            <button class="sidebar-toggle deck-drawer-toggle" id="deck-drawer-toggle" title="Toggle Deck Builder">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        // Append both to gallery area
        galleryArea.appendChild(galleryContent);
        galleryArea.appendChild(deckDrawer);

        // Get references to UI elements
        deckList = document.getElementById('deck-list');
        deckCountDisplay = document.getElementById('deck-count-display');
        exportButton = document.getElementById('deck-export-btn');
        deckNameInput = document.getElementById('deck-name-input');

        // Attach event listeners
        document.getElementById('deck-drawer-toggle').addEventListener('click', toggleDrawer);
        document.getElementById('clear-deck-btn').addEventListener('click', clearDeck);
        exportButton.addEventListener('click', exportDeck);

        // Make deck list a drop zone
        deckList.addEventListener('dragover', handleDragOver);
        deckList.addEventListener('drop', handleDrop);
        deckList.addEventListener('dragleave', handleDragLeave);

        console.log('[Deck Exporter] Deck drawer created on right side');
    }

    /**
     * Attach "+" buttons to all card elements in the gallery
     */
    function attachCardPlusButtons() {
        console.log('[Deck Exporter] Setting up + buttons...');
        
        // Watch for new thumbnails being added
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.classList && node.classList.contains('thumbnail')) {
                                if (!node.querySelector('.card-add-to-deck-btn')) {
                                    addPlusButtonToCard(node);
                                }
                            } else if (node.querySelectorAll) {
                                const thumbnails = node.querySelectorAll('.thumbnail');
                                thumbnails.forEach(thumb => {
                                    if (!thumb.querySelector('.card-add-to-deck-btn')) {
                                        addPlusButtonToCard(thumb);
                                    }
                                });
                            }
                        }
                    });
                }
            });
        });

        // Start observing the gallery
        const gallery = document.getElementById('item-gallery');
        if (gallery) {
            observer.observe(gallery, { childList: true, subtree: true });
            
            // Add to existing thumbnails
            const existing = gallery.querySelectorAll('.thumbnail');
            console.log(`[Deck Exporter] Found ${existing.length} existing thumbnails`);
            existing.forEach(thumb => addPlusButtonToCard(thumb));
        }
    }

    /**
     * Add a "+" button to a card element
     */
    function addPlusButtonToCard(cardElement) {
        if (cardElement.dataset.deckBtnAdded) return;
        cardElement.dataset.deckBtnAdded = 'true';
        
        const plusBtn = document.createElement('button');
        plusBtn.className = 'card-add-to-deck-btn';
        plusBtn.innerHTML = '+';
        plusBtn.title = 'Add to deck';
        
        plusBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const cardData = extractCardDataFromElement(cardElement);
            if (cardData) {
                addCardToDeck(cardData);
                // Visual feedback
                plusBtn.classList.add('card-add-feedback');
                setTimeout(() => plusBtn.classList.remove('card-add-feedback'), 300);
            }
        });

        cardElement.appendChild(plusBtn);
    }

    /**
     * Extract card data from a thumbnail element
     */
    function extractCardDataFromElement(thumbnailElement) {
        try {
            const cardIndex = parseInt(thumbnailElement.dataset.cardIndex);
            
            // Get card from global filtered cards array
            if (window.app && window.app.filteredCards && cardIndex >= 0) {
                const card = window.app.filteredCards[cardIndex];
                if (card) {
                    console.log('[Deck Exporter] Found card:', card.name);
                    return card;
                }
            }

            // Fallback: extract from DOM
            const img = thumbnailElement.querySelector('img.gallery-image');
            const imageUrl = img?.src || '';
            const altText = img?.alt || 'Unknown Card';
            
            return {
                id: `card-${cardIndex || Date.now()}`,
                name: altText,
                supertype: 'Pokémon',
                images: {
                    small: imageUrl,
                    large: imageUrl
                }
            };
        } catch (error) {
            console.error('[Deck Exporter] Error extracting card data:', error);
            return null;
        }
    }

    /**
     * Setup drag and drop functionality
     */
    function setupDragAndDrop() {
        console.log('[Deck Exporter] Setting up drag and drop...');
        
        // Make thumbnails draggable
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.classList && node.classList.contains('thumbnail')) {
                                if (!node.hasAttribute('draggable')) {
                                    node.setAttribute('draggable', 'true');
                                    node.addEventListener('dragstart', handleDragStart);
                                    node.addEventListener('dragend', handleDragEnd);
                                }
                            } else if (node.querySelectorAll) {
                                const thumbnails = node.querySelectorAll('.thumbnail');
                                thumbnails.forEach(thumb => {
                                    if (!thumb.hasAttribute('draggable')) {
                                        thumb.setAttribute('draggable', 'true');
                                        thumb.addEventListener('dragstart', handleDragStart);
                                        thumb.addEventListener('dragend', handleDragEnd);
                                    }
                                });
                            }
                        }
                    });
                }
            });
        });

        const gallery = document.getElementById('item-gallery');
        if (gallery) {
            observer.observe(gallery, { childList: true, subtree: true });
            
            // Make existing thumbnails draggable
            const existing = gallery.querySelectorAll('.thumbnail');
            existing.forEach(thumb => {
                thumb.setAttribute('draggable', 'true');
                thumb.addEventListener('dragstart', handleDragStart);
                thumb.addEventListener('dragend', handleDragEnd);
            });
            console.log(`[Deck Exporter] Made ${existing.length} thumbnails draggable`);
        }
    }

    /**
     * Handle drag start
     */
    function handleDragStart(e) {
        const cardData = extractCardDataFromElement(e.currentTarget);
        if (cardData) {
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('text/plain', JSON.stringify(cardData));
            e.currentTarget.classList.add('dragging');
            console.log('[Deck Exporter] Drag started:', cardData.name);
        }
    }

    /**
     * Handle drag end
     */
    function handleDragEnd(e) {
        e.currentTarget.classList.remove('dragging');
    }

    /**
     * Handle drag over deck list
     */
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        deckList.classList.add('deck-list-drag-over');
    }

    /**
     * Handle drag leave
     */
    function handleDragLeave(e) {
        if (e.target === deckList) {
            deckList.classList.remove('deck-list-drag-over');
        }
    }

    /**
     * Handle drop on deck list
     */
    function handleDrop(e) {
        e.preventDefault();
        deckList.classList.remove('deck-list-drag-over');
        
        try {
            const cardDataStr = e.dataTransfer.getData('text/plain');
            if (cardDataStr) {
                const cardData = JSON.parse(cardDataStr);
                console.log('[Deck Exporter] Card dropped:', cardData.name);
                addCardToDeck(cardData);
            }
        } catch (error) {
            console.error('[Deck Exporter] Error handling drop:', error);
        }

        // Remove dragging class from all thumbnails
        document.querySelectorAll('.thumbnail.dragging').forEach(el => el.classList.remove('dragging'));
    }

    /**
     * Add a card to the deck
     */
    function addCardToDeck(cardData) {
        // Check if card already exists in deck
        const existingCard = deck.find(item => item.card.id === cardData.id);
        
        // Check if card is Energy (unlimited) or regular card (max 4)
        const isEnergy = cardData.supertype === 'Energy' || 
                        cardData.name?.toLowerCase().includes('energy');
        const maxQty = isEnergy ? 999 : 4;
        
        if (existingCard) {
            // Increment quantity
            if (existingCard.qty < maxQty) {
                existingCard.qty++;
            } else {
                if (!isEnergy) {
                    showNotification('Maximum 4 copies per card', 'warning');
                }
                return;
            }
        } else {
            // Add new card with quantity 1
            deck.push({
                card: cardData,
                qty: 1
            });
        }

        saveDeckState();
        updateDeckUI();
        showNotification(`Added ${cardData.name} to deck`, 'success');
    }

    /**
     * Remove a card from the deck
     */
    function removeCardFromDeck(cardId) {
        const index = deck.findIndex(item => item.card.id === cardId);
        if (index !== -1) {
            deck.splice(index, 1);
            saveDeckState();
            updateDeckUI();
            showNotification('Card removed from deck', 'info');
        }
    }

    /**
     * Update card quantity in deck
     */
    function updateCardQuantity(cardId, newQty) {
        const deckItem = deck.find(item => item.card.id === cardId);
        if (deckItem) {
            if (newQty <= 0) {
                removeCardFromDeck(cardId);
            } else {
                // Check if Energy (unlimited) or regular card (max 4)
                const isEnergy = deckItem.card.supertype === 'Energy' || 
                                deckItem.card.name?.toLowerCase().includes('energy');
                const maxQty = isEnergy ? 999 : 4;
                
                if (newQty <= maxQty) {
                    deckItem.qty = parseInt(newQty);
                    saveDeckState();
                    updateDeckUI();
                } else if (!isEnergy) {
                    showNotification('Maximum 4 copies per card', 'warning');
                }
            }
        }
    }

    /**
     * Clear entire deck
     */
    function clearDeck() {
        if (deck.length === 0) return;
        
        if (confirm('Clear all cards from deck?')) {
            deck.length = 0;
            saveDeckState();
            updateDeckUI();
            showNotification('Deck cleared', 'info');
        }
    }

    /**
     * Save deck state to localStorage
     */
    function saveDeckState() {
        try {
            const deckData = deck.map(item => ({
                cardId: item.card.id,
                cardName: item.card.name,
                qty: item.qty,
                // Store minimal card data to reconstruct
                card: {
                    id: item.card.id,
                    name: item.card.name,
                    supertype: item.card.supertype,
                    images: item.card.images
                }
            }));
            localStorage.setItem('forteDeckBuilderState', JSON.stringify(deckData));
            console.log('[Deck Exporter] Deck state saved');
        } catch (e) {
            console.warn('[Deck Exporter] Could not save deck state:', e);
        }
    }

    /**
     * Load deck state from localStorage
     */
    function loadDeckState() {
        try {
            const savedDeck = localStorage.getItem('forteDeckBuilderState');
            if (savedDeck) {
                const deckData = JSON.parse(savedDeck);
                
                // Restore deck items
                deckData.forEach(item => {
                    // Try to find the full card data from the app
                    let fullCard = null;
                    if (window.app && window.app.getAllCards) {
                        fullCard = window.app.getAllCards().find(c => c.id === item.cardId);
                    }
                    
                    // Use full card data if available, otherwise use saved minimal data
                    deck.push({
                        card: fullCard || item.card,
                        qty: item.qty
                    });
                });
                
                if (deck.length > 0) {
                    updateDeckUI();
                    console.log('[Deck Exporter] Restored', deck.length, 'deck items from saved state');
                }
            }
        } catch (e) {
            console.warn('[Deck Exporter] Could not load deck state:', e);
        }
    }

    /**
     * Update deck UI (list, count, validation)
     */
    function updateDeckUI() {
        const totalCards = deck.reduce((sum, item) => sum + item.qty, 0);
        
        // Update count display
        const countNumber = deckCountDisplay.querySelector('.deck-count-number');
        countNumber.textContent = totalCards;
        
        // Update validation status
        updateDeckValidation(totalCards);
        
        // Update deck list
        updateDeckList();
        
        // Enable/disable export button
        exportButton.disabled = totalCards < MIN_DECK_SIZE || totalCards > MAX_DECK_SIZE;
    }

    /**
     * Update deck validation status with color coding
     */
    function updateDeckValidation(totalCards) {
        const statusEl = document.getElementById('deck-count-status');
        const countDisplay = document.getElementById('deck-count-display');
        
        // Remove all status classes
        countDisplay.classList.remove('deck-count-red', 'deck-count-orange', 'deck-count-green');
        
        if (totalCards === 0) {
            statusEl.textContent = 'Add cards to build your deck';
        } else if (totalCards < MIN_DECK_SIZE) {
            statusEl.textContent = `Deck must have at least ${MIN_DECK_SIZE} cards`;
            countDisplay.classList.add('deck-count-red');
        } else if (totalCards >= MIN_DECK_SIZE && totalCards < STANDARD_DECK_SIZE) {
            statusEl.textContent = `⚠️ Below standard (${STANDARD_DECK_SIZE} cards)`;
            countDisplay.classList.add('deck-count-orange');
        } else if (totalCards === STANDARD_DECK_SIZE) {
            statusEl.textContent = '✅ Standard deck size';
            countDisplay.classList.add('deck-count-green');
        } else if (totalCards > MAX_DECK_SIZE) {
            statusEl.textContent = `Cannot exceed ${MAX_DECK_SIZE} cards`;
            countDisplay.classList.add('deck-count-red');
        }
    }

    /**
     * Update the deck list UI
     */
    function updateDeckList() {
        // Clear existing content
        deckList.innerHTML = '';
        
        if (deck.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'deck-empty-state';
            emptyState.innerHTML = `
                <p>🎴</p>
                <p>Drag cards here<br>or click +</p>
            `;
            deckList.appendChild(emptyState);
            return;
        }

        // Sort deck by type and name
        const sortedDeck = [...deck].sort((a, b) => {
            const typeOrder = { 'Pokémon': 1, 'Trainer': 2, 'Energy': 3 };
            const typeCompare = (typeOrder[a.card.supertype] || 99) - (typeOrder[b.card.supertype] || 99);
            if (typeCompare !== 0) return typeCompare;
            return a.card.name.localeCompare(b.card.name);
        });

        // Create card items
        sortedDeck.forEach(item => {
            // Use WebP loader to get best image URL
            let imageUrl = '';
            if (window.WebPLoader) {
                imageUrl = window.WebPLoader.getBestImageUrl(item.card, 'small');
            } else {
                imageUrl = item.card.images?.small || item.card.images?.large || '';
            }
            
            const isEnergy = item.card.supertype === 'Energy' || 
                           item.card.name?.toLowerCase().includes('energy');
            const maxQty = isEnergy ? 999 : 4;
            
            const cardItem = document.createElement('div');
            cardItem.className = 'deck-card-item';
            cardItem.dataset.cardId = item.card.id;
            cardItem.innerHTML = `
                <img src="${imageUrl}" class="deck-card-preview" alt="${item.card.name}" onerror="this.style.display='none'">
                <div class="deck-card-info">
                    <div class="deck-card-qty-control">
                        <button class="qty-btn qty-btn-minus" data-card-id="${item.card.id}">−</button>
                        <input 
                            type="number" 
                            class="deck-card-qty-input" 
                            value="${item.qty}" 
                            min="1" 
                            max="${maxQty}"
                            data-card-id="${item.card.id}"
                        >
                        <button class="qty-btn qty-btn-plus" data-card-id="${item.card.id}">+</button>
                    </div>
                    <div class="deck-card-details">
                        <span class="deck-card-name">${item.card.name}</span>
                        <span class="deck-card-type">${item.card.supertype || 'Card'}</span>
                    </div>
                </div>
                <button class="deck-card-remove" data-card-id="${item.card.id}" title="Remove from deck">×</button>
            `;
            
            deckList.appendChild(cardItem);
        });

        // Attach event listeners to quantity controls
        deckList.querySelectorAll('.qty-btn-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const cardId = btn.dataset.cardId;
                const item = deck.find(i => i.card.id === cardId);
                if (item) updateCardQuantity(cardId, item.qty - 1);
            });
        });

        deckList.querySelectorAll('.qty-btn-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const cardId = btn.dataset.cardId;
                const item = deck.find(i => i.card.id === cardId);
                if (item) updateCardQuantity(cardId, item.qty + 1);
            });
        });

        deckList.querySelectorAll('.deck-card-qty-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const cardId = e.target.dataset.cardId;
                updateCardQuantity(cardId, parseInt(e.target.value));
            });
        });

        deckList.querySelectorAll('.deck-card-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                removeCardFromDeck(btn.dataset.cardId);
            });
        });
    }

    /**
     * Toggle drawer open/closed (matching left sidebar behavior)
     */
    function toggleDrawer() {
        isDeckDrawerCollapsed = !isDeckDrawerCollapsed;
        deckDrawer.classList.toggle('collapsed', isDeckDrawerCollapsed);
        
        // Update toggle icon
        const icon = document.querySelector('#deck-drawer-toggle i');
        if (icon) {
            icon.className = isDeckDrawerCollapsed ? 
                'fas fa-chevron-left' : 
                'fas fa-chevron-right';
        }
        
        // Update tooltip
        document.getElementById('deck-drawer-toggle').title = 
            isDeckDrawerCollapsed ? 'Show Deck Builder' : 'Hide Deck Builder';
        
        saveDeckDrawerState();
        console.log('[Deck Exporter] Drawer toggled. Collapsed:', isDeckDrawerCollapsed);
    }

    /**
     * Save deck drawer state to localStorage
     */
    function saveDeckDrawerState() {
        try {
            localStorage.setItem('forteDeckDrawerCollapsed', isDeckDrawerCollapsed ? '1' : '0');
        } catch (e) {
            console.warn('[Deck Exporter] Could not save drawer state:', e);
        }
    }

    /**
     * Load deck drawer state from localStorage
     */
    function loadDeckDrawerState() {
        try {
            const savedState = localStorage.getItem('forteDeckDrawerCollapsed');
            // Default to open (false) if no saved state
            isDeckDrawerCollapsed = savedState === '1';
            
            if (deckDrawer) {
                deckDrawer.classList.toggle('collapsed', isDeckDrawerCollapsed);
                
                const icon = document.querySelector('#deck-drawer-toggle i');
                if (icon) {
                    icon.className = isDeckDrawerCollapsed ? 
                        'fas fa-chevron-left' : 
                        'fas fa-chevron-right';
                }
                
                document.getElementById('deck-drawer-toggle').title = 
                    isDeckDrawerCollapsed ? 'Show Deck Builder' : 'Hide Deck Builder';
            }
        } catch (e) {
            console.warn('[Deck Exporter] Could not load drawer state:', e);
            isDeckDrawerCollapsed = false; // Default to open on error
        }
    }

    /**
     * Export deck as Standard CSV
     */
    function exportDeck() {
        const totalCards = deck.reduce((sum, item) => sum + item.qty, 0);
        
        // Validate deck size
        if (totalCards < MIN_DECK_SIZE || totalCards > MAX_DECK_SIZE) {
            showNotification('Invalid deck size. Must be 40-60 cards.', 'error');
            return;
        }

        const deckName = deckNameInput.value.trim() || 'my-deck';
        const fileName = `${sanitizeFileName(deckName)}.csv`;

        // Generate CSV content
        const csvLines = ['QTY,Name,Type,URL'];
        
        deck.forEach(item => {
            const qty = item.qty;
            const name = escapeCSV(item.card.name);
            const type = escapeCSV(item.card.supertype || 'Pokémon');
            
            // Use WebP URL if available, fallback to PNG
            let url = '';
            if (window.WebPLoader) {
                url = window.WebPLoader.getBestImageUrl(item.card, 'small');
            } else {
                url = item.card.images?.small || item.card.images?.large || '';
            }
            
            csvLines.push(`${qty},${name},${type},${url}`);
        });

        const csvContent = csvLines.join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        showNotification(`Deck exported as ${fileName}`, 'success');
    }

    /**
     * Escape CSV special characters
     */
    function escapeCSV(str) {
        if (!str) return '';
        str = String(str);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }

    /**
     * Sanitize file name
     */
    function sanitizeFileName(name) {
        return name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    }

    /**
     * Show notification
     */
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `deck-notification deck-notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('deck-notification-show'), 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('deck-notification-show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // --- Public API ---
    window.DeckExporter = {
        init,
        addCardToDeck,
        removeCardFromDeck,
        clearDeck,
        getDeck: () => [...deck],
        getTotalCards: () => deck.reduce((sum, item) => sum + item.qty, 0)
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();


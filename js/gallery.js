// js/gallery.js - Gallery Module
// Handles gallery rendering and card thumbnail display

window.ForteGallery = {
    app: null,
    galleryElement: null,
    emptyMessage: null,
    galleryControls: null,
    sizeSlider: null,
    sizeIndicator: null,

    init(appInstance) {
        this.app = appInstance;
        this.galleryElement = document.getElementById('item-gallery');
        this.emptyMessage = document.getElementById('empty-folder-message');
        this.galleryControls = document.querySelector('.gallery-controls');
        this.sizeSlider = document.getElementById('gallery-size-slider');
        this.sizeIndicator = document.querySelector('.size-value-indicator');

        if (!this.galleryElement) {
            console.error('[Gallery] Gallery element not found');
            return;
        }

        this.setupGalleryControls();
        this.loadSizePreference();
        console.log('[Gallery] Module initialized');
    },

    setupGalleryControls() {
        if (this.sizeSlider) {
            this.sizeSlider.addEventListener('input', (e) => {
                this.updateGallerySize(parseInt(e.target.value));
            });
        }
    },

    updateGallerySize(value) {
        // Remove all size classes
        this.galleryElement.classList.remove(
            'gallery-size-xs', 'gallery-size-s', 'gallery-size-m', 
            'gallery-size-l', 'gallery-size-xl'
        );

        // Add appropriate size class
        const sizeMap = {
            1: { class: 'gallery-size-xs', label: 'XS' },
            2: { class: 'gallery-size-s', label: 'S' },
            3: { class: 'gallery-size-m', label: 'M' },
            4: { class: 'gallery-size-l', label: 'L' },
            5: { class: 'gallery-size-xl', label: 'XL' }
        };

        const size = sizeMap[value] || sizeMap[3];
        this.galleryElement.classList.add(size.class);
        
        if (this.sizeIndicator) {
            this.sizeIndicator.textContent = size.label;
        }

        // Save preference
        this.saveSizePreference(value);
    },

    saveSizePreference(value) {
        try {
            localStorage.setItem('forteGallerySize', value.toString());
        } catch (e) {
            console.warn('[Gallery] Could not save size preference:', e);
        }
    },

    loadSizePreference() {
        try {
            const savedSize = localStorage.getItem('forteGallerySize');
            if (savedSize && this.sizeSlider) {
                this.sizeSlider.value = savedSize;
                this.updateGallerySize(parseInt(savedSize));
            } else {
                this.updateGallerySize(3); // Default to medium
            }
        } catch (e) {
            console.warn('[Gallery] Could not load size preference:', e);
            this.updateGallerySize(3);
        }
    },

    render(cards) {
        if (!this.galleryElement) return;

        console.log('[Gallery] Rendering', cards.length, 'cards');
        console.log('[Gallery] First few cards:', cards.slice(0, 3).map(c => ({ name: c.name, id: c.id })));

        this.galleryElement.innerHTML = '';

        if (cards.length === 0) {
            this.showEmptyMessage();
            return;
        }

        this.hideEmptyMessage();
        this.renderCards(cards);
    },

    renderCards(cards) {
        const fragment = document.createDocumentFragment();

        cards.forEach((card, index) => {
            const thumbnail = this.createThumbnail(card, index);
            fragment.appendChild(thumbnail);
        });

        this.galleryElement.appendChild(fragment);
    },

    createThumbnail(card, index) {
        const div = document.createElement('div');
        div.className = 'thumbnail';
        div.tabIndex = 0;
        div.setAttribute('aria-label', card.name);
        div.dataset.cardIndex = index;
        
        // Store the actual card ID for deck builder and other uses
        if (card.id) {
            div.dataset.cardId = card.id;
            console.log('[Gallery] Created thumbnail with cardId:', card.id, 'for card:', card.name);
        } else {
            console.warn('[Gallery] Card has no ID:', card.name);
        }

        const img = document.createElement('img');
        img.alt = card.name;
        img.className = 'gallery-image';
        img.loading = 'lazy';
        
        // Use WebP loader if available, otherwise fallback to PNG
        if (window.WebPLoader) {
            const bestUrl = window.WebPLoader.getBestImageUrl(card, 'small');
            img.src = bestUrl || this.app.placeholderUrl;
            
            // Set up fallback chain
            img.onerror = () => {
                const urls = window.WebPLoader.getCardImageUrls(card);
                // If WebP failed, try PNG
                if (img.src.endsWith('.webp') && urls.png.small) {
                    img.src = urls.png.small;
                } else if (urls.embedded) {
                    img.src = urls.embedded;
                } else {
                    img.src = this.app.placeholderUrl;
                }
            };
        } else {
            // Fallback to original behavior if WebP loader not available
            img.src = card.images?.small || card.images?.large || this.app.placeholderUrl;
            img.onerror = () => {
                img.src = this.app.placeholderUrl;
            };
        }
        
        img.onload = () => {
            img.classList.add('loaded');
        };

        div.appendChild(img);

        // Add like button
        const likeButton = this.createLikeButton(card);
        div.appendChild(likeButton);

        // Add Forte indicator if applicable
        if (card.forteData?.isForte) {
            const indicator = document.createElement('div');
            indicator.className = 'forte-indicator';
            indicator.innerHTML = '<img src="img/favicon.png" alt="Forte" class="forte-icon" onerror="this.onerror=null; this.src=\'img/types/Forte.png\';" />';
            div.appendChild(indicator);
        }

        // Event listeners
        div.addEventListener('click', () => {
            if (window.ForteLightbox) {
                window.ForteLightbox.open(card, index);
            }
        });

        div.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (window.ForteLightbox) {
                    window.ForteLightbox.open(card, index);
                }
            }
        });

        return div;
    },

    createThumbnailWithQuantity(card, index, quantity) {
        // Create a thumbnail like regular cards but with quantity badge instead of like button
        const div = document.createElement('div');
        div.className = 'thumbnail';
        div.tabIndex = 0;
        div.setAttribute('aria-label', card.name);
        div.dataset.cardIndex = index;
        
        if (card.id) {
            div.dataset.cardId = card.id;
        }

        const img = document.createElement('img');
        img.alt = card.name;
        img.className = 'gallery-image';
        img.loading = 'lazy';
        
        // Use WebPLoader if available
        if (window.WebPLoader) {
            const bestUrl = window.WebPLoader.getBestImageUrl(card, 'small');
            img.src = bestUrl || this.app.placeholderUrl;
            
            img.onerror = () => {
                const urls = window.WebPLoader.getCardImageUrls(card);
                if (img.src.endsWith('.webp') && urls.png.small) {
                    img.src = urls.png.small;
                } else if (urls.embedded) {
                    img.src = urls.embedded;
                } else {
                    img.src = this.app.placeholderUrl;
                }
            };
        } else {
            img.src = card.images?.small || card.images?.large || this.app.placeholderUrl;
            img.onerror = () => {
                img.src = this.app.placeholderUrl;
            };
        }
        
        img.onload = () => {
            img.classList.add('loaded');
        };

        div.appendChild(img);

        // Add quantity badge instead of like button
        const qtyBadge = document.createElement('div');
        qtyBadge.className = 'starter-deck-quantity-badge';
        qtyBadge.textContent = `${quantity}x`;
        div.appendChild(qtyBadge);

        // Add Forte indicator if applicable
        if (card.forteData?.isForte) {
            const indicator = document.createElement('div');
            indicator.className = 'forte-indicator';
            indicator.innerHTML = '<img src="img/favicon.png" alt="Forte" class="forte-icon" onerror="this.onerror=null; this.src=\'img/types/Forte.png\';" />';
            div.appendChild(indicator);
        }

        // Event listeners for lightbox
        div.addEventListener('click', () => {
            if (window.ForteLightbox) {
                window.ForteLightbox.open(card, index);
            }
        });

        div.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (window.ForteLightbox) {
                    window.ForteLightbox.open(card, index);
                }
            }
        });

        return div;
    },

    createLikeButton(card) {
        const likeButton = document.createElement('button');
        likeButton.className = 'gallery-like-button';
        likeButton.setAttribute('aria-label', 'Like this card');
        likeButton.dataset.cardPath = card.images?.large || card.images?.small || '';
        
        // Get initial like data
        const cardPath = likeButton.dataset.cardPath;
        const likeData = window.getLikeData ? window.getLikeData(cardPath) : { count: 0, liked: false };
        
        // Set initial state
        this.updateLikeButton(likeButton, likeData);
        
        // Add click handler
        likeButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent opening lightbox
            
            const cardPath = likeButton.dataset.cardPath;
            if (!cardPath || !window.toggleLike) return;
            
            console.log(`Gallery: Toggling like for ${cardPath}`);
            const newLikedState = window.toggleLike(cardPath);
            
            if (newLikedState !== false) { // false means action was prevented (e.g., rate limit)
                // Immediately update this button's state
                const newLikeData = window.getLikeData(cardPath);
                this.updateLikeButton(likeButton, newLikeData);
                console.log(`Gallery: Updated button state - liked: ${newLikeData.liked}, count: ${newLikeData.count}`);
                
                // Update lightbox if it's showing the same card
                if (window.ForteLightbox && window.ForteLightbox.getCurrentCard) {
                    const currentCard = window.ForteLightbox.getCurrentCard();
                    if (currentCard) {
                        const currentCardPath = currentCard.images?.large || currentCard.images?.small || '';
                        if (currentCardPath === cardPath && window.ForteLightbox.updateLikeButton) {
                            window.ForteLightbox.updateLikeButton(cardPath);
                        }
                    }
                }
            }
        });
        
        return likeButton;
    },

    updateLikeButton(button, likeData) {
        const isLiked = likeData.liked;
        const count = likeData.count;
        
        button.innerHTML = `
            <i class="fas fa-heart ${isLiked ? 'liked' : ''}"></i>
            <span class="like-count">${count > 0 ? count : ''}</span>
        `;
        
        button.classList.toggle('liked', isLiked);
        button.setAttribute('aria-label', isLiked ? 'Unlike this card' : 'Like this card');
    },

    handleLikeClick(button) {
        const cardPath = button.dataset.cardPath;
        if (!cardPath || !window.toggleLike) return;
        
        const newLikedState = window.toggleLike(cardPath);
        if (newLikedState !== false) { // false means action was prevented (e.g., rate limit)
            // Update button state
            const newLikeData = window.getLikeData ? window.getLikeData(cardPath) : { count: 0, liked: newLikedState };
            this.updateLikeButton(button, newLikeData);
            
            // Update any lightbox like button if open
            if (window.ForteLightbox && window.ForteLightbox.updateLikeButton) {
                window.ForteLightbox.updateLikeButton(cardPath);
            }
        }
    },

    // Method to refresh all like buttons (called when like data is updated)
    refreshLikeButtons() {
        if (!this.galleryElement) {
            console.warn('[Gallery] refreshLikeButtons called before gallery initialized');
            return;
        }
        const likeButtons = this.galleryElement.querySelectorAll('.gallery-like-button');
        likeButtons.forEach(button => {
            const cardPath = button.dataset.cardPath;
            if (cardPath && window.getLikeData) {
                const likeData = window.getLikeData(cardPath);
                this.updateLikeButton(button, likeData);
            }
        });
    },

    showEmptyMessage() {
        if (this.emptyMessage) {
            this.emptyMessage.classList.remove('hidden');
        }
    },

    hideEmptyMessage() {
        if (this.emptyMessage) {
            this.emptyMessage.classList.add('hidden');
        }
    },

    // Utility methods for external use
    scrollToTop() {
        // If deck exporter has set a scroll container, use that
        if (this.galleryScrollContainer) {
            this.galleryScrollContainer.scrollTop = 0;
        } else if (this.galleryElement) {
            this.galleryElement.scrollTop = 0;
        }
    },

    focusFirstCard() {
        const firstThumbnail = this.galleryElement.querySelector('.thumbnail');
        if (firstThumbnail) {
            firstThumbnail.focus();
        }
    },

    renderStarterDeckBanners(decks) {
        this.galleryElement.innerHTML = '';
        this.hideEmptyMessage();
        this.galleryElement.classList.add('starter-deck-cards-container');

        decks.forEach((deck, index) => {
            const deckData = deck.data;
            const deckName = deck.name || deck.folder;
            const totalCards = deckData.totalCards || (deckData.data ? deckData.data.reduce((sum, item) => sum + (item.qty || 1), 0) : 0);
            const bannerImage = `data/starter-decks/${deck.folder}/banner.png`;
            
            const card = document.createElement('div');
            card.className = 'starter-deck-card is-collapsed';
            card.dataset.deckIndex = index;
            card._deckData = deck;
            card._deckFolder = deck.folder;
            
            const bannerDiv = card; // Keep variable name for compatibility
            card.innerHTML = `
                <div class="starter-deck-card__inner js-expander">
                    <img src="${bannerImage}" alt="${deckName}" class="starter-deck-card-banner" onerror="this.style.display='none'">
                    <div class="starter-deck-card-content">
                        <h3 class="starter-deck-card-name">${deckName}</h3>
                        <span class="starter-deck-card-count">${totalCards} cards</span>
                    </div>
                </div>
                <div class="starter-deck-card__expander">
                    <button class="starter-deck-card-close js-collapser">
                        <i class="fas fa-times"></i> Close
                    </button>
                    <div class="starter-deck-header-section">
                        <div class="starter-deck-banner-container">
                            <img src="${bannerImage}" alt="${deckName}" class="starter-deck-banner-large" onerror="this.style.display='none'">
                        </div>
                        <div class="starter-deck-info-section">
                            <h2 class="starter-deck-info-name">${deckName}</h2>
                            <div class="starter-deck-info-count">${totalCards} cards</div>
                            <div class="starter-deck-description">${deck.description || 'A pre-built starter deck ready for battle!'}</div>
                        </div>
                    </div>
                    <div class="starter-deck-expander-content"></div>
                    <button class="starter-deck-expander-download" data-deck-folder="${deck.folder}">
                        <i class="fas fa-download"></i> Download Deck
                    </button>
                </div>
            `;

            // Add event listeners
            const expander = card.querySelector('.js-expander');
            const collapser = card.querySelector('.js-collapser');
            const downloadBtn = card.querySelector('.starter-deck-expander-download');
            
            expander.addEventListener('click', () => this.toggleStarterDeckCard(card, index));
            collapser.addEventListener('click', () => this.closeStarterDeckCard(card));
            downloadBtn.addEventListener('click', () => this.downloadStarterDeck(deck.folder, deckData));

            this.galleryElement.appendChild(card);
        });
    },

    toggleStarterDeckCard(card, index) {
        const allCards = this.galleryElement.querySelectorAll('.starter-deck-card');
        
        if (card.classList.contains('is-collapsed')) {
            // Hide other cards
            allCards.forEach(c => {
                if (c !== card) {
                    c.classList.add('is-hidden');
                }
            });
            
            // Expand this card
            card.classList.remove('is-collapsed', 'is-inactive', 'is-hidden');
            card.classList.add('is-expanded');
            
            // Render deck content
            this.renderDeckInExpander(card);
            
            // Scroll to top
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
        } else {
            this.closeStarterDeckCard(card);
        }
    },

    closeStarterDeckCard(card) {
        card.classList.remove('is-expanded');
        card.classList.add('is-collapsed');
        
        // Show all cards again
        this.galleryElement.querySelectorAll('.starter-deck-card').forEach(c => {
            c.classList.remove('is-hidden', 'is-inactive');
        });
        
        // Scroll back to cards
        setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    },

    renderDeckInExpander(card) {
        const expanderContent = card.querySelector('.starter-deck-expander-content');
        if (!expanderContent) return;
        
        const deck = card._deckData;
        const deckData = deck.data;
        
        if (!deckData?.data || !Array.isArray(deckData.data)) {
            expanderContent.innerHTML = '<p>No cards</p>';
            return;
        }

        const app = this.app;
        
        // Clear content first
        expanderContent.innerHTML = '';
        
        // Create a wrapper div for the grid (same as regular gallery)
        const gridWrapper = document.createElement('div');
        gridWrapper.className = 'starter-deck-expander-grid';
        expanderContent.appendChild(gridWrapper);
        
        // Render each card using the thumbnail system
        deckData.data.forEach((item, index) => {
            let fullCardData = null;
            
            // Try to find the full card data by ID or name
            if (item.id && app) {
                fullCardData = app.getAllCards().find(x => x.id === item.id);
            }
            
            if (!fullCardData && item.name && app) {
                fullCardData = app.getAllCards().find(x => x.name === item.name);
            }
            
            // If we found the card, use it; otherwise create a minimal card object
            if (!fullCardData) {
                fullCardData = {
                    id: item.id || `deck-${index}`,
                    name: item.name,
                    images: item.url ? { small: item.url, large: item.url } : null
                };
            }
            
            // Create thumbnail with quantity
            const thumbnail = this.createThumbnailWithQuantity(fullCardData, index, item.qty || 1);
            gridWrapper.appendChild(thumbnail);
        });
    },

    downloadStarterDeck(folder, deckData) {
        // Export as CSV format like deck builder
        const csvRows = ['QTY,Name,Type,URL'];
        if (deckData.data && Array.isArray(deckData.data)) {
            deckData.data.forEach(item => {
                const name = item.name || '';
                const type = item.supertype || item.type || 'Pokémon';
                const url = item.url || item.images?.large || '';
                csvRows.push(`${item.qty || 1},${name},${type},${url}`);
            });
        }
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${folder}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    renderDeckPreview(deckData, container) {
        if (!deckData.data || !Array.isArray(deckData.data)) {
            container.innerHTML = '<p class="text-gray-400">No card data available</p>';
            return;
        }

        const cardsHtml = deckData.data.map(item => {
            let imageUrl = '';
            
            // Try to get image from card ID first
            if (item.id) {
                const card = this.app.getAllCards().find(c => c.id === item.id);
                imageUrl = card ? (window.WebPLoader ? window.WebPLoader.getBestImageUrl(card, 'small') : card.images?.small) : '';
            }
            
            // Fallback to URL from CSV
            if (!imageUrl && item.url) {
                imageUrl = item.url;
            }
            
            return `
                <div class="deck-preview-card">
                    <img src="${imageUrl}" alt="${item.name}" class="deck-preview-card-image" onerror="this.style.display='none'">
                    <div class="deck-preview-card-info">
                        <div class="deck-preview-card-qty">${item.qty || 1}x</div>
                        <div class="deck-preview-card-name">${item.name}</div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `<div class="deck-preview-grid">${cardsHtml}</div>`;
    }
};
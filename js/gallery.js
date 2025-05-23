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

        const img = document.createElement('img');
        img.src = card.images?.small || card.images?.large || this.app.placeholderUrl;
        img.alt = card.name;
        img.className = 'gallery-image';
        img.loading = 'lazy';
        
        img.onerror = () => {
            img.src = this.app.placeholderUrl;
        };
        
        img.onload = () => {
            img.classList.add('loaded');
        };

        div.appendChild(img);

        // Add Forte indicator if applicable
        if (card.forteData?.isForte) {
            const indicator = document.createElement('div');
            indicator.className = 'forte-indicator';
            indicator.innerHTML = '<i class="fas fa-crown"></i>';
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
        if (this.galleryElement) {
            this.galleryElement.scrollTop = 0;
        }
    },

    focusFirstCard() {
        const firstThumbnail = this.galleryElement.querySelector('.thumbnail');
        if (firstThumbnail) {
            firstThumbnail.focus();
        }
    }
};
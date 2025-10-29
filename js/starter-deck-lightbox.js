// Starter Deck Lightbox - Modal view for viewing starter deck cards
(function() {
    'use strict';

    let lightbox = null;
    let currentDeck = null;

    function createLightbox() {
        if (lightbox) return lightbox;

        lightbox = document.createElement('div');
        lightbox.id = 'starter-deck-lightbox';
        lightbox.className = 'starter-deck-lightbox-overlay';
        lightbox.innerHTML = `
            <div class="starter-deck-lightbox-content">
                <div class="starter-deck-lightbox-header">
                    <h2 class="starter-deck-lightbox-title"></h2>
                    <button class="starter-deck-lightbox-close" aria-label="Close lightbox">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="starter-deck-lightbox-controls">
                    <div class="starter-deck-lightbox-scale">
                        <label>Card Size:</label>
                        <div class="scale-controls">
                            <button class="scale-btn" data-scale="xs">XS</button>
                            <button class="scale-btn" data-scale="s">S</button>
                            <button class="scale-btn active" data-scale="m">M</button>
                            <button class="scale-btn" data-scale="l">L</button>
                            <button class="scale-btn" data-scale="xl">XL</button>
                        </div>
                    </div>
                    <div class="starter-deck-lightbox-actions">
                        <button class="starter-deck-download-lightbox-btn">
                            <i class="fas fa-download"></i> Download Deck
                        </button>
                    </div>
                </div>
                <div class="starter-deck-lightbox-body">
                    <div class="starter-deck-lightbox-cards" id="starter-deck-lightbox-cards"></div>
                </div>
            </div>
        `;

        document.body.appendChild(lightbox);

        // Attach event listeners
        lightbox.querySelector('.starter-deck-lightbox-close').addEventListener('click', closeLightbox);
        
        // Close on overlay click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Scale buttons
        lightbox.querySelectorAll('.scale-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const scale = e.target.dataset.scale;
                setCardScale(scale);
            });
        });

        // Download button
        lightbox.querySelector('.starter-deck-download-lightbox-btn').addEventListener('click', () => {
            if (currentDeck) {
                downloadDeck(currentDeck.folder, currentDeck.data);
            }
        });

        // Escape key to close
        document.addEventListener('keydown', handleEscape);

        return lightbox;
    }

    function handleEscape(e) {
        if (e.key === 'Escape' && lightbox && lightbox.classList.contains('visible')) {
            closeLightbox();
        }
    }

    function setCardScale(scale) {
        const cards = lightbox.querySelectorAll('.starter-deck-lightbox-card');
        cards.forEach(card => card.className = `starter-deck-lightbox-card scale-${scale}`);
        
        lightbox.querySelectorAll('.scale-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.scale === scale);
        });
    }

    function closeLightbox() {
        if (lightbox) {
            lightbox.classList.remove('visible');
            currentDeck = null;
        }
    }

    function openLightbox(deck, deckData) {
        createLightbox();
        currentDeck = { folder: deck.folder, data: deckData };

        lightbox.querySelector('.starter-deck-lightbox-title').textContent = deckData.name || deck.folder;
        
        renderCards(deckData);
        
        lightbox.classList.add('visible');
    }

    function renderCards(deckData) {
        const cardsContainer = lightbox.querySelector('#starter-deck-lightbox-cards');
        if (!deckData.data || !Array.isArray(deckData.data)) {
            cardsContainer.innerHTML = '<p class="text-gray-400">No card data available</p>';
            return;
        }

        const app = window.ForteApp || window.app;
        const cardsHtml = deckData.data.map((item, index) => {
            let imageUrl = '';
            
            // Try to get image from card ID first
            if (item.id && app) {
                const card = app.getAllCards().find(c => c.id === item.id);
                imageUrl = card ? (window.WebPLoader ? window.WebPLoader.getBestImageUrl(card, 'large') : card.images?.large) : '';
            }
            
            // Fallback to URL from CSV
            if (!imageUrl && item.url) {
                imageUrl = item.url;
            }

            // Add click handler to open card lightbox
            const clickHandler = item.id && app ? `onclick="window.ForteLightbox.openCardLightbox('${item.id}', ${index})"` : '';
            const cursorStyle = item.id ? 'cursor: pointer;' : '';
            
            return `
                <div class="starter-deck-lightbox-card scale-m" ${clickHandler} style="${cursorStyle}">
                    <div class="starter-deck-lightbox-card-qty">${item.qty || 1}x</div>
                    <img src="${imageUrl}" alt="${item.name}" onerror="this.style.display='none'">
                    <div class="starter-deck-lightbox-card-name">${item.name}</div>
                </div>
            `;
        }).join('');

        cardsContainer.innerHTML = cardsHtml;
    }

    function downloadDeck(folder, deckData) {
        const jsonStr = JSON.stringify(deckData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${folder}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Expose API
    window.StarterDeckLightbox = {
        open: openLightbox,
        close: closeLightbox
    };
})();


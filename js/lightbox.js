// js/lightbox.js - Lightbox Module
// Handles card viewer/lightbox functionality

window.ForteLightbox = {
    app: null,
    lightbox: null,
    currentIndex: -1,
    isVisible: false,
    
    // DOM elements
    elements: {},

    init(appInstance) {
        this.app = appInstance;
        this.lightbox = document.getElementById('fancy-lightbox');
        
        if (!this.lightbox) {
            console.error('[Lightbox] Lightbox element not found');
            return;
        }

        this.cacheElements();
        this.setupEventListeners();
        this.createActionButtons();
        this.checkUrlForCard();
        
        console.log('[Lightbox] Module initialized');
    },

    cacheElements() {
        const elementIds = [
            'fancy-lightbox-close', 'card-title-lightbox', 'fancy-card-image',
            'fancy-spinner', 'fancy-prev-button', 'fancy-next-button',
            'lb-card-name', 'lb-set-name', 'lb-card-number', 'lb-rarity',
            'lb-artist', 'lb-pokemon-details', 'lb-hp', 'lb-types',
            'lb-stage-item', 'lb-stage', 'lb-evolves-from-item', 'lb-evolves-from',
            'lb-pokedex-item', 'lb-pokedex-data', 'lb-trainer-details',
            'lb-trainer-subtypes', 'lb-energy-details', 'lb-energy-types',
            'lb-abilities-section', 'lb-abilities-container',
            'lb-attacks-section', 'lb-attacks-container',
            'lb-rules-section', 'lb-rules-text', 'lb-battle-stats-section',
            'lb-weakness-container', 'lb-weakness', 'lb-resistance-container',
            'lb-resistance', 'lb-retreat-cost-item', 'lb-retreat-cost',
            'lb-flavor-text-section', 'lb-flavor-text', 'lb-creator',
            'lb-is-forte', 'lb-regulation', 'lb-approved-date'
        ];

        elementIds.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
    },

    setupEventListeners() {
        // Close button
        if (this.elements['fancy-lightbox-close']) {
            this.elements['fancy-lightbox-close'].addEventListener('click', () => this.close());
        }

        // Navigation buttons
        if (this.elements['fancy-prev-button']) {
            this.elements['fancy-prev-button'].addEventListener('click', () => this.showPrevious());
        }
        if (this.elements['fancy-next-button']) {
            this.elements['fancy-next-button'].addEventListener('click', () => this.showNext());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isVisible) return;

            switch (e.key) {
                case 'Escape':
                    this.close();
                    break;
                case 'ArrowLeft':
                    this.showPrevious();
                    break;
                case 'ArrowRight':
                    this.showNext();
                    break;
                case 'd':
                    if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
                        document.getElementById('fancy-download-button')?.click();
                    }
                    break;
                case 'S':
                    if (e.shiftKey && !e.ctrlKey && !e.altKey) {
                        document.getElementById('fancy-share-button')?.click();
                    }
                    break;
            }
        });

        // Close on background click
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.close();
            }
        });
    },

    createActionButtons() {
        let actionContainer = document.querySelector('.fancy-card-actions');
        if (!actionContainer) {
            actionContainer = document.createElement('div');
            actionContainer.className = 'fancy-card-actions';
            
            const lightboxBody = document.querySelector('.fancy-lightbox-body');
            if (lightboxBody) {
                lightboxBody.appendChild(actionContainer);
            }
        }

        // Download button
        const downloadButton = document.createElement('button');
        downloadButton.id = 'fancy-download-button';
        downloadButton.className = 'fancy-action-button';
        downloadButton.innerHTML = '<i class="fas fa-download"></i>';
        downloadButton.title = 'Download Image';
        downloadButton.setAttribute('aria-label', 'Download Image');
        downloadButton.addEventListener('click', () => this.downloadImage());

        // Like button
        const likeButton = document.createElement('button');
        likeButton.id = 'fancy-like-button';
        likeButton.className = 'fancy-action-button like-button';
        likeButton.innerHTML = '<i class="fas fa-heart"></i><span class="like-count"></span>';
        likeButton.title = 'Like this card';
        likeButton.setAttribute('aria-label', 'Like this card');
        likeButton.addEventListener('click', () => this.handleLikeClick());

        // Share button
        const shareButton = document.createElement('button');
        shareButton.id = 'fancy-share-button';
        shareButton.className = 'fancy-action-button';
        shareButton.innerHTML = '<i class="fas fa-share-alt"></i>';
        shareButton.title = 'Share Card Link';
        shareButton.setAttribute('aria-label', 'Share Card Link');
        shareButton.addEventListener('click', () => this.shareCard());

        actionContainer.appendChild(downloadButton);
        actionContainer.appendChild(likeButton);
        actionContainer.appendChild(shareButton);
    },

    open(card, index = -1) {
        if (!card) return;

        const filteredCards = this.app.getFilteredCards();
        this.currentIndex = index >= 0 ? index : filteredCards.findIndex(c => c.id === card.id);
        
        this.updateDetails(card);
        this.updateNavigation();
        this.show();
        this.updateUrl(card.id);
    },

    close() {
        this.hide();
        this.updateUrl(null);
    },

    show() {
        this.lightbox.classList.add('visible');
        document.body.style.overflow = 'hidden';
        this.isVisible = true;
    },

    hide() {
        this.lightbox.classList.remove('visible');
        document.body.style.overflow = '';
        this.isVisible = false;
    },

    showPrevious() {
        const cards = this.app.getFilteredCards();
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateDetails(cards[this.currentIndex]);
            this.updateNavigation();
            this.updateUrl(cards[this.currentIndex].id);
        }
    },

    showNext() {
        const cards = this.app.getFilteredCards();
        if (this.currentIndex < cards.length - 1) {
            this.currentIndex++;
            this.updateDetails(cards[this.currentIndex]);
            this.updateNavigation();
            this.updateUrl(cards[this.currentIndex].id);
        }
    },

    updateNavigation() {
        const cards = this.app.getFilteredCards();
        
        if (this.elements['fancy-prev-button']) {
            this.elements['fancy-prev-button'].disabled = this.currentIndex <= 0;
        }
        if (this.elements['fancy-next-button']) {
            this.elements['fancy-next-button'].disabled = this.currentIndex >= cards.length - 1;
        }
    },

    updateDetails(card) {
        if (!card) return;

        // Update title and image
        if (this.elements['card-title-lightbox']) {
            let titleText = card.name || 'Card Details';
            
            
            
            this.elements['card-title-lightbox'].innerHTML = titleText;
            
            // Add type-based class to lightbox header title
            if (card.supertype === 'Pokémon' && card.types && card.types[0]) {
                this.elements['card-title-lightbox'].className = `type-${card.types[0].toLowerCase()}`;
            } else {
                this.elements['card-title-lightbox'].className = '';
            }
        }

        this.loadImage(card);
        this.populateCardInfo(card);
        
        // Update like button state
        const cardPath = card.images?.large || card.images?.small || '';
        if (cardPath) {
            this.updateLikeButton(cardPath);
        }
    },

    loadImage(card) {
        const imageEl = this.elements['fancy-card-image'];
        const spinnerEl = this.elements['fancy-spinner'];
        
        if (!imageEl || !spinnerEl) return;

        spinnerEl.classList.remove('hidden');
        imageEl.classList.add('hidden');

        imageEl.onload = () => {
            spinnerEl.classList.add('hidden');
            imageEl.classList.remove('hidden');
            imageEl.classList.add('loaded');
        };

        imageEl.onerror = () => {
            imageEl.src = this.app.placeholderUrl;
            spinnerEl.classList.add('hidden');
            imageEl.classList.remove('hidden');
        };

        const imageUrl = card.images?.large || card.images?.small || this.app.placeholderUrl;
        imageEl.src = imageUrl;
        imageEl.alt = card.name;
    },

    populateCardInfo(card) {
        // Basic info
        this.setText('lb-card-name', card.name);
        
        // Add type-based class to Pokemon name
        const nameElement = this.elements['lb-card-name'];
        if (nameElement && card.supertype === 'Pokémon' && card.types && card.types[0]) {
            nameElement.className = `info-value type-${card.types[0].toLowerCase()}`;
        } else if (nameElement) {
            nameElement.className = 'info-value';
        }
        
        this.setText('lb-set-name', card.set?.name);
        this.setText('lb-card-number', `${card.number || '-'}${card.set?.printedTotal ? ` / ${card.set.printedTotal}` : ''}`);
        this.setText('lb-rarity', card.rarity);
        this.setText('lb-artist', card.artist);

        const isPokemon = card.supertype === 'Pokémon';
        const isTrainer = card.supertype === 'Trainer';
        const isEnergy = card.supertype === 'Energy';

        // Show/hide sections
        this.toggleSection('lb-pokemon-details', isPokemon);
        this.toggleSection('lb-trainer-details', isTrainer);
        this.toggleSection('lb-energy-details', isEnergy);
        this.toggleSection('lb-abilities-section', isPokemon && card.abilities?.length);
        this.toggleSection('lb-attacks-section', isPokemon && card.attacks?.length);
        this.toggleSection('lb-rules-section', (isTrainer || isEnergy) && card.rules?.length);
        this.toggleSection('lb-battle-stats-section', isPokemon && (card.weaknesses?.length || card.resistances?.length || card.retreatCost?.length));
        this.toggleSection('lb-flavor-text-section', !!card.flavorText);

        // Pokémon details
        if (isPokemon) {
            this.setText('lb-hp', card.hp);
            this.setHTML('lb-types', this.formatTypes(card.types));
            
            // Format stage with Forte indicator if applicable
            let stageText = card.subtypes?.join(', ') || '';
            if (card.forteData?.isForte) {
                const forteIcon = '<img src="img/types/Forte.png" alt="Forte" class="forte-stage-icon" title="Forte" />';
                stageText = `<div class="forte-stage-container">
                    <span class="forte-stage-text">${stageText}</span>
                    ${forteIcon}
                </div>`;
            }
            this.setHTML('lb-stage', stageText);
            this.toggleSection('lb-stage-item', card.subtypes?.length || card.forteData?.isForte);
            
            if (card.evolvesFrom) {
                this.toggleSection('lb-evolves-from-item', true);
                this.setText('lb-evolves-from', card.evolvesFrom);
            } else {
                this.toggleSection('lb-evolves-from-item', false);
            }

            if (card.nationalPokedexNumbers?.length) {
                this.toggleSection('lb-pokedex-item', true);
                this.setText('lb-pokedex-data', card.nationalPokedexNumbers.join(', '));
            } else {
                this.toggleSection('lb-pokedex-item', false);
            }

            this.setHTML('lb-abilities-container', this.formatAbilities(card.abilities, card.types));
            this.setHTML('lb-attacks-container', this.formatAttacks(card.attacks, card.types));
            this.formatBattleStats(card);
        }

        // Trainer/Energy details
        if (isTrainer) {
            this.setHTML('lb-trainer-subtypes', this.formatSubtypes(card.subtypes, 'trainer'));
            this.setHTML('lb-rules-text', card.rules?.join('<br>'));
        }

        if (isEnergy) {
            this.setHTML('lb-energy-types', this.formatTypes(card.types));
            this.setHTML('lb-rules-text', card.rules?.join('<br>'));
        }

        // Meta info
        this.setText('lb-flavor-text', card.flavorText);
        this.setText('lb-creator', card.forteData?.discordUsername || card.artist || 'Unknown');
        this.setHTML('lb-is-forte', card.forteData?.isForte ? 
            '<span class="forte-badge"><i class="fas fa-crown"></i> Forte</span>' : 'No');
        this.setText('lb-regulation', card.forteData?.regulationMark);
        this.setText('lb-approved-date', card.forteData?.approvedDate);
    },

    formatTypes(types) {
        if (!types) return '-';
        
        // Use the new type mapping system to show icons with text
        if (window.ForteTypeMapping) {
            return types.map(t => {
                const typeInfo = window.ForteTypeMapping.getTypeInfo(t);
                if (typeInfo) {
                    return `<span class="card-type-badge type-${t.toLowerCase()}">
                        <img src="${typeInfo.icon}" alt="${typeInfo.name}" class="type-icon-inline" title="${typeInfo.name}" />
                        ${t}
                    </span>`;
                }
                return `<span class="card-type-badge type-${t.toLowerCase()}">${t}</span>`;
            }).join(' ');
        }
        
        // Fallback to old format
        return types.map(t => `<span class="card-type-badge type-${t.toLowerCase()}">${t}</span>`).join(' ');
    },

    formatSubtypes(subtypes, prefix) {
        if (!subtypes) return '-';
        return subtypes.map(st => `<span class="card-type-badge type-${prefix}">${st}</span>`).join(' ');
    },

    formatAbilities(abilities, cardTypes) {
        if (!abilities) return '';
        const primaryType = cardTypes && cardTypes[0] ? cardTypes[0].toLowerCase() : '';
        return abilities.map(a => {
            const hasForteRestriction = a.text && a.text.toLowerCase().includes('you cannot use more than 1 forte attack in a game');
            const useForteIcon = hasForteRestriction;
            
            return `
            <div class="ability-box ${primaryType ? `type-${primaryType}` : ''}">
                <div class="ability-header">
                    <div class="ability-name-damage">
                        <span class="ability-name">${a.name}</span>
                        ${a.damage && a.damage !== 'NA' && a.damage !== 'N/A' ? `<span class="ability-damage">${a.damage}</span>` : ''}
                    </div>
                    ${useForteIcon ? 
                        `<img src="img/types/ForteBw.png" alt="Forte" class="ability-type-icon" title="Forte Ability" />` : 
                        (a.type === 'Ability' ? 
                            `<img src="img/types/Ability.png" alt="Ability" class="ability-type-icon" title="Ability" />` : 
                            `<span class="ability-type">(${a.type})</span>`
                        )
                    }
                </div>
                <div class="ability-description">${a.text}</div>
            </div>
        `;
        }).join('');
    },

    formatAttacks(attacks, cardTypes) {
        if (!attacks) return '';
        const primaryType = cardTypes && cardTypes[0] ? cardTypes[0].toLowerCase() : '';
        return attacks.map(atk => {
            const hasForteRestriction = atk.text && atk.text.toLowerCase().includes('you cannot use more than 1 forte attack in a game');
            const hasForteInName = atk.name && atk.name.toLowerCase().includes('forte');
            
            return `
            <div class="attack-box ${primaryType ? `type-${primaryType}` : ''}">
                <div class="attack-header">
                    <div class="attack-cost-icons">${this.formatEnergyCost(atk.cost)}</div>
                    <div class="attack-name-damage">
                        <span class="attack-name">${atk.name}</span>
                        ${atk.damage && atk.damage !== 'NA' && atk.damage !== 'N/A' ? `<span class="attack-damage">${atk.damage}</span>` : ''}
                    </div>
                    ${(hasForteRestriction || hasForteInName) ? 
                        `<img src="img/types/ForteBw.png" alt="Forte Attack" class="attack-forte-icon" title="Forte Attack" />` : 
                        ''
                    }
                </div>
                ${atk.text ? `<div class="attack-description">${atk.text}</div>` : ''}
            </div>
        `;
        }).join('');
    },

    formatEnergyCost(cost) {
        if (!cost || !Array.isArray(cost)) return '';
        
        // Use the new type mapping system
        if (window.ForteTypeMapping) {
            const parsedCosts = [];
            for (const costItem of cost) {
                if (typeof costItem === 'string') {
                    const parsed = window.ForteTypeMapping.parseEnergyCost(costItem);
                    parsedCosts.push(...parsed);
                } else {
                    // Handle legacy format
                    const typeInfo = window.ForteTypeMapping.getTypeInfo(costItem);
                    if (typeInfo) parsedCosts.push(typeInfo);
                }
            }
            return window.ForteTypeMapping.formatEnergyCostHTML(parsedCosts);
        }
        
        // Fallback to old format
        return cost.map(c => `<span class="energy-symbol energy-${c.toLowerCase()}">${c.charAt(0)}</span>`).join('');
    },

    formatBattleStats(card) {
        // Weakness
        this.toggleSection('lb-weakness-container', card.weaknesses?.length);
        if (card.weaknesses?.length) {
            const weaknessHTML = card.weaknesses.map(w => {
                if (window.ForteTypeMapping) {
                    const weaknessStr = `${w.type} ${w.value}`;
                    console.log('[Lightbox] Parsing weakness:', weaknessStr); // Debug log
                    const parsed = window.ForteTypeMapping.parseWeaknessResistance(weaknessStr);
                    if (parsed) {
                        console.log('[Lightbox] Parsed weakness:', parsed); // Debug log
                        return window.ForteTypeMapping.formatWeaknessResistanceHTML(parsed);
                    } else {
                        console.warn('[Lightbox] Failed to parse weakness:', weaknessStr); // Debug log
                        return weaknessStr;
                    }
                }
                return `<span class="card-type-badge type-${w.type.toLowerCase()}">${w.type} ${w.value}</span>`;
            }).join(', ');
            this.setHTML('lb-weakness', `<div class="weakness-container">${weaknessHTML}</div>`);
        }

        // Resistance
        this.toggleSection('lb-resistance-container', card.resistances?.length);
        if (card.resistances?.length) {
            const resistanceHTML = card.resistances.map(r => {
                if (window.ForteTypeMapping) {
                    const resistanceStr = `${r.type} ${r.value}`;
                    console.log('[Lightbox] Parsing resistance:', resistanceStr); // Debug log
                    const parsed = window.ForteTypeMapping.parseWeaknessResistance(resistanceStr);
                    if (parsed) {
                        console.log('[Lightbox] Parsed resistance:', parsed); // Debug log
                        return window.ForteTypeMapping.formatWeaknessResistanceHTML(parsed);
                    } else {
                        console.warn('[Lightbox] Failed to parse resistance:', resistanceStr); // Debug log
                        return resistanceStr;
                    }
                }
                return `<span class="card-type-badge type-${r.type.toLowerCase()}">${r.type} ${r.value}</span>`;
            }).join(', ');
            this.setHTML('lb-resistance', `<div class="resistance-container">${resistanceHTML}</div>`);
        }

        // Retreat cost
        this.toggleSection('lb-retreat-cost-item', card.retreatCost?.length);
        if (card.retreatCost?.length) {
            const retreatHTML = this.formatEnergyCost(card.retreatCost);
            this.setHTML('lb-retreat-cost', `<div class="retreat-cost-container">${retreatHTML}</div>`);
        }
    },

    setText(elementId, text) {
        const element = this.elements[elementId];
        if (element) {
            element.textContent = text || '-';
        }
    },

    setHTML(elementId, html) {
        const element = this.elements[elementId];
        if (element) {
            element.innerHTML = html || '-';
        }
    },

    toggleSection(elementId, show) {
        const element = this.elements[elementId];
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    },

    downloadImage() {
        const imageEl = this.elements['fancy-card-image'];
        if (!imageEl || !imageEl.src) {
            this.showButtonStatus('fancy-download-button', 'error');
            return;
        }

        const cards = this.app.getFilteredCards();
        const currentCard = cards[this.currentIndex];
        
        try {
            const link = document.createElement('a');
            link.href = imageEl.src;
            link.download = currentCard?.id ? `${currentCard.id}.png` : 'card.png';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showButtonStatus('fancy-download-button', 'success');
        } catch (e) {
            console.error('[Lightbox] Download error:', e);
            this.showButtonStatus('fancy-download-button', 'error');
        }
    },

    shareCard() {
        const cards = this.app.getFilteredCards();
        const currentCard = cards[this.currentIndex];
        
        if (!currentCard?.id) {
            this.showButtonStatus('fancy-share-button', 'error');
            return;
        }

        const pageUrl = `${window.location.origin}${window.location.pathname}#card=${currentCard.id}`;

        if (navigator.share) {
            navigator.share({
                title: `Forte Card: ${currentCard.name}`,
                text: `Check out this Pokémon card: ${currentCard.name}`,
                url: pageUrl
            })
            .then(() => this.showButtonStatus('fancy-share-button', 'success'))
            .catch(() => this.copyToClipboard(pageUrl));
        } else {
            this.copyToClipboard(pageUrl);
        }
    },

    copyToClipboard(text) {
        // Get the current card and create page URL
        const cards = this.app.getFilteredCards();
        const currentCard = cards[this.currentIndex];
        
        if (!currentCard?.id) {
            this.showButtonStatus('fancy-share-button', 'error');
            return;
        }
        
        // Create page URL with card ID
        const pageUrl = `${window.location.origin}${window.location.pathname}#card=${currentCard.id}`;
        
        navigator.clipboard.writeText(pageUrl)
            .then(() => {
                this.showButtonStatus('fancy-share-button', 'success');
                this.showTooltip('Card link copied to clipboard!');
            })
            .catch(() => {
                this.fallbackCopyToClipboard(pageUrl);
            });
    },

    fallbackCopyToClipboard(text) {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                this.showButtonStatus('fancy-share-button', 'success');
                this.showTooltip('Card link copied to clipboard!');
            } else {
                this.showButtonStatus('fancy-share-button', 'error');
            }
        } catch (e) {
            this.showButtonStatus('fancy-share-button', 'error');
        }
    },

    showButtonStatus(buttonId, status) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        button.classList.add(status);
        setTimeout(() => button.classList.remove(status), 1500);
    },

    showTooltip(message) {
        const existingTooltip = document.getElementById('copy-tooltip');
        if (existingTooltip) existingTooltip.remove();
        
        const tooltip = document.createElement('div');
        tooltip.id = 'copy-tooltip';
        tooltip.className = 'copy-tooltip';
        tooltip.textContent = message;
        document.body.appendChild(tooltip);
        
        setTimeout(() => tooltip.style.opacity = '1', 10);
        
        setTimeout(() => {
            tooltip.style.opacity = '0';
            setTimeout(() => tooltip.remove(), 300);
        }, 3000);
    },

    updateUrl(cardId) {
        const url = cardId ? `#card=${cardId}` : window.location.pathname;
        window.history.pushState(null, null, url);
    },

    checkUrlForCard() {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#card=')) {
            const cardId = hash.substring(6);
            setTimeout(() => this.openCardById(cardId), 100);
        }
    },

    openCardById(cardId) {
        const card = this.app.getAllCards().find(c => c.id === cardId);
        if (card) {
            // Reset filters to show all cards
            this.app.filters = { type: 'all', supertype: 'all', rarity: 'all', creator: 'all', forte: 'all' };
            this.app.currentSetTab = 'all';
            this.app.applyFiltersAndRender();
            
            setTimeout(() => this.open(card), 50);
        }
    },

    handleLikeClick() {
        const currentCard = this.getCurrentCard();
        if (!currentCard) return;
        
        const cardPath = currentCard.images?.large || currentCard.images?.small || '';
        if (!cardPath || !window.toggleLike) return;
        
        console.log(`Lightbox: Toggling like for ${cardPath}`);
        const newLikedState = window.toggleLike(cardPath);
        
        if (newLikedState !== false) { // false means action was prevented (e.g., rate limit)
            // Immediately update lightbox like button
            this.updateLikeButton(cardPath);
            console.log(`Lightbox: Updated button state for ${cardPath}`);
            
            // Update gallery like button if visible
            if (window.ForteGallery && window.ForteGallery.refreshLikeButtons) {
                window.ForteGallery.refreshLikeButtons();
            }
        }
    },

    updateLikeButton(cardPath) {
        const likeButton = document.getElementById('fancy-like-button');
        if (!likeButton || !window.getLikeData) return;
        
        const likeData = window.getLikeData(cardPath);
        const isLiked = likeData.liked;
        const count = likeData.count;
        
        likeButton.innerHTML = `<i class="fas fa-heart ${isLiked ? 'liked' : ''}"></i><span class="like-count">${count > 0 ? count : ''}</span>`;
        likeButton.classList.toggle('liked', isLiked);
        likeButton.title = isLiked ? 'Unlike this card' : 'Like this card';
        likeButton.setAttribute('aria-label', isLiked ? 'Unlike this card' : 'Like this card');
    },

    getCurrentCard() {
        const cards = this.app.getFilteredCards();
        return cards[this.currentIndex] || null;
    }
};
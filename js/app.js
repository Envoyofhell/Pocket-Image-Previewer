// js/app.js - Main Application Module
// Handles initialization, data loading, and coordination between modules

class ForteCardApp {
    constructor() {
        this.allCardsData = [];
        this.currentFilteredCards = [];
        this.filters = {
            type: 'all',
            supertype: 'all', 
            rarity: 'all',
            creator: 'all',
            forte: 'all'
        };
        this.currentSort = 'setThenNumber';
        this.currentSetTab = 'all';
        this.searchQuery = '';
        
        this.placeholderUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjMwOCIgdmlld0JveD0iMCAwIDIyMCAzMDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIyMCIgaGVpZ2h0PSIzMDgiIGZpbGw9IiMxRTI5M0IiLz48cGF0aCBkPSJNMTEwIDE1NEMxMzYuNTEgMTU0IDE1OCAxMzIuNTEgMTU4IDEwNkMxNTggNzkuNDkwMyAxMzYuNTEgNTggMTEwIDU4QzgzLjQ5MDMgNTggNjIgNzkuNDkwMyA2MiAxMDZDNjIgMTMyLjUxIDgzLjQ5MDMgMTU0IDExMCAxNTRaIiBmaWxsPSIjNjQ3NDhCIi8+PHBhdGggZD0iTTYyLjUgMjEyLjVDODIuNSAxOTIuNSAxMzcuNSAxOTIuNSAxNTcuNSAyMTIuNSIgc3Ryb2tlPSIjNjQ3NDhCIiBzdHJva2Utd2lkdGg9IjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==';
        
        // Initialize modules when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        console.log('[App] Initializing Forte Card Viewer...');
        
        try {
            // Load configuration
            if (typeof SITE_CONFIG === 'undefined') {
                throw new Error('SITE_CONFIG not loaded. Make sure filter_config.js is included.');
            }

            // Set default active tab
            this.currentSetTab = SITE_CONFIG.defaultActiveSetTab === 'all' ? 'all' : 
                (SITE_CONFIG.setDisplayNameToCodeMap[SITE_CONFIG.defaultActiveSetTab] || 'all');

            // Load card data
            await this.loadCardData();
            
            // Initialize modules
            this.initializeModules();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initial render
            this.applyFiltersAndRender();
            
            console.log('[App] Initialization complete');
            
        } catch (error) {
            console.error('[App] Initialization failed:', error);
            this.showError(error.message);
        } finally {
            this.hideLoadingOverlay();
        }
    }

    async loadCardData() {
        console.log('[App] Loading card data...');
        
        const response = await fetch('data/cards.json?timestamp=' + new Date().getTime());
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status} fetching cards.json`);
        }
        
        this.allCardsData = await response.json();
        if (!Array.isArray(this.allCardsData)) {
            throw new Error('Card data is not an array');
        }
        
        console.log(`[App] Loaded ${this.allCardsData.length} cards`);
    }

    initializeModules() {
        // Initialize search module
        if (window.ForteSearch) {
            window.ForteSearch.init(this);
        }
        
        // Initialize gallery module
        if (window.ForteGallery) {
            window.ForteGallery.init(this);
        }
        
        // Initialize lightbox module
        if (window.ForteLightbox) {
            window.ForteLightbox.init(this);
        }
        
        // Initialize navigation module
        if (window.ForteNavigation) {
            window.ForteNavigation.init(this);
        }
        
        // Initialize UI controls
        if (window.ForteUIControls) {
            window.ForteUIControls.init(this);
        }
        
        // Populate filter dropdowns
        this.populateFilterDropdowns();
    }

    populateFilterDropdowns() {
        const types = new Set();
        const trainerSubtypes = new Set();
        const rarities = new Set();
        const creators = new Set();

        this.allCardsData.forEach(card => {
            if (card.supertype === "Pokémon" && card.types) {
                card.types.forEach(t => types.add(t));
            }
            if (card.supertype === "Trainer" && card.subtypes) {
                card.subtypes.forEach(st => trainerSubtypes.add(st));
            }
            if (card.rarity) rarities.add(card.rarity);
            if (card.artist) creators.add(card.artist);
            if (card.forteData?.discordUsername) creators.add(card.forteData.discordUsername);
        });

        // Populate type filter
        const typeFilter = document.getElementById('type-filter');
        const combinedTypes = new Set([...types, ...trainerSubtypes]);
        const typeOrder = [...SITE_CONFIG.pokemonTypeOrder, ...SITE_CONFIG.trainerSubtypeOrder];
        this.populateSelect(typeFilter, combinedTypes, typeOrder, "All Types");

        // Populate rarity filter
        const rarityFilter = document.getElementById('rarity-filter');
        this.populateSelect(rarityFilter, rarities, SITE_CONFIG.rarityOrder, "All Rarities");

        // Populate creator filter
        const creatorFilter = document.getElementById('creator-filter');
        this.populateSelect(creatorFilter, creators, [], "All Creators");

        // Populate forte filter
        const forteFilter = document.getElementById('forte-filter');
        forteFilter.innerHTML = '';
        Object.entries(SITE_CONFIG.forteStatusOptions).forEach(([value, text]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = text;
            forteFilter.appendChild(option);
        });
    }

    populateSelect(selectElement, itemsSet, orderArray, allText) {
        selectElement.innerHTML = `<option value="all">${allText}</option>`;
        
        const ordered = orderArray.filter(item => itemsSet.has(item));
        const unordered = Array.from(itemsSet).filter(item => !orderArray.includes(item)).sort();
        
        [...ordered, ...unordered].forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            selectElement.appendChild(option);
        });
    }

    setupEventListeners() {
        // Filter change listeners
        const filterElements = [
            'type-filter', 'supertype-filter', 'rarity-filter', 
            'creator-filter', 'forte-filter', 'sort-filter'
        ];
        
        filterElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.handleFilterChange());
            }
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));
    }

    handleFilterChange() {
        this.filters.type = document.getElementById('type-filter').value;
        this.filters.supertype = document.getElementById('supertype-filter').value;
        this.filters.rarity = document.getElementById('rarity-filter').value;
        this.filters.creator = document.getElementById('creator-filter').value;
        this.filters.forte = document.getElementById('forte-filter').value;
        this.currentSort = document.getElementById('sort-filter').value;
        
        this.applyFiltersAndRender();
    }

    handleGlobalKeydown(e) {
        if (this.isInputFocused()) return;
        
        // Quick set selection with number keys
        const key = parseInt(e.key);
        if (!isNaN(key) && key >= 0 && key <= 9) {
            if (window.ForteNavigation) {
                window.ForteNavigation.selectTabByNumber(key);
                e.preventDefault();
            }
        }
        
        // Other shortcuts
        switch (e.key) {
            case '/':
                document.getElementById('card-search')?.focus();
                e.preventDefault();
                break;
            case '\\':
                if (window.ForteUIControls) {
                    window.ForteUIControls.toggleSidebar();
                    e.preventDefault();
                }
                break;
            case 's':
                if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
                    document.getElementById('settings-button')?.click();
                    e.preventDefault();
                }
                break;
        }
    }

    isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement.tagName === 'INPUT' || 
               activeElement.tagName === 'TEXTAREA' || 
               activeElement.tagName === 'SELECT' ||
               activeElement.isContentEditable;
    }

    applyFiltersAndRender() {
        let filteredCards = [...this.allCardsData];

        // Apply set filter
        if (this.currentSetTab !== 'all') {
            filteredCards = filteredCards.filter(card => 
                card.set && card.set.name === this.currentSetTab
            );
        }

        // Apply category filter
        if (this.filters.supertype !== 'all') {
            filteredCards = filteredCards.filter(card => 
                card.supertype === this.filters.supertype
            );
        }

        // Apply type/subtype filter
        if (this.filters.type !== 'all') {
            const selectedType = this.filters.type;
            filteredCards = filteredCards.filter(card => {
                if (card.supertype === 'Trainer') {
                    return card.subtypes && card.subtypes.includes(selectedType);
                } else if (card.supertype === 'Pokémon' || card.supertype === 'Energy') {
                    return card.types && card.types.includes(selectedType);
                } else {
                    return (card.types && card.types.includes(selectedType)) ||
                           (card.subtypes && card.subtypes.includes(selectedType));
                }
            });
        }

        // Apply rarity filter
        if (this.filters.rarity !== 'all') {
            filteredCards = filteredCards.filter(card => 
                card.rarity === this.filters.rarity
            );
        }

        // Apply creator filter
        if (this.filters.creator !== 'all') {
            filteredCards = filteredCards.filter(card => 
                card.artist === this.filters.creator || 
                (card.forteData && card.forteData.discordUsername === this.filters.creator)
            );
        }

        // Apply forte status filter
        if (this.filters.forte !== 'all') {
            const isForteTarget = this.filters.forte === 'isForte';
            filteredCards = filteredCards.filter(card => 
                card.forteData && card.forteData.isForte === isForteTarget
            );
        }

        // Apply search filter
        if (this.searchQuery && window.ForteSearch) {
            filteredCards = window.ForteSearch.filterByQuery(filteredCards, this.searchQuery);
        }

        // Apply sorting
        filteredCards.sort((a, b) => this.sortCards(a, b));

        this.currentFilteredCards = filteredCards;

        // Render gallery
        if (window.ForteGallery) {
            window.ForteGallery.render(filteredCards);
        }
    }

    sortCards(a, b) {
        switch (this.currentSort) {
            case 'name':
                return (a.name || '').localeCompare(b.name || '');
            case 'hp':
                return (parseInt(b.hp) || 0) - (parseInt(a.hp) || 0);
            case 'artist':
                const artistA = a.artist || a.forteData?.discordUsername || '';
                const artistB = b.artist || b.forteData?.discordUsername || '';
                return artistA.localeCompare(artistB);
            case 'rarity':
                const rarityA = SITE_CONFIG.rarityOrder.indexOf(a.rarity);
                const rarityB = SITE_CONFIG.rarityOrder.indexOf(b.rarity);
                return (rarityA === -1 ? 999 : rarityA) - (rarityB === -1 ? 999 : rarityB);
            case 'recent':
                const dateA = new Date(a.forteData?.approvedDate || a.set?.releaseDate || '1900-01-01');
                const dateB = new Date(b.forteData?.approvedDate || b.set?.releaseDate || '1900-01-01');
                return dateB - dateA;
            case 'setThenNumber':
            default:
                const setIdA = a.set?.id || 'zzz';
                const setIdB = b.set?.id || 'zzz';
                if (setIdA !== setIdB) {
                    return setIdA.localeCompare(setIdB);
                }
                return (parseInt(a.number) || 99999) - (parseInt(b.number) || 99999);
        }
    }

    setSearchQuery(query) {
        this.searchQuery = query;
        this.applyFiltersAndRender();
    }

    setCurrentSetTab(setId) {
        this.currentSetTab = setId;
        this.applyFiltersAndRender();
    }

    showError(message) {
        const gallery = document.getElementById('item-gallery');
        if (gallery) {
            gallery.innerHTML = `<p class="text-red-500 text-center col-span-full">Error: ${message}</p>`;
        }
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('page-loading-overlay');
        if (overlay) {
            overlay.classList.add('loaded');
        }
    }

    // Public API for other modules
    getFilteredCards() {
        return this.currentFilteredCards;
    }

    getAllCards() {
        return this.allCardsData;
    }

    getCurrentFilters() {
        return { ...this.filters };
    }

    getCurrentSort() {
        return this.currentSort;
    }

    getCurrentSetTab() {
        return this.currentSetTab;
    }

    getSearchQuery() {
        return this.searchQuery;
    }
}

// Initialize the application
window.ForteApp = new ForteCardApp();
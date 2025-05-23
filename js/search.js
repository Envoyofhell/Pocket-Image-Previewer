// js/search.js - Search Module
// Handles search functionality with partial matching

window.ForteSearch = {
    app: null,
    searchInput: null,
    clearButton: null,
    searchStats: null,

    init(appInstance) {
        this.app = appInstance;
        this.searchInput = document.getElementById('card-search');
        this.clearButton = document.getElementById('clear-search');
        this.searchStats = document.getElementById('search-stats');

        if (!this.searchInput) {
            console.warn('[Search] Search input not found');
            return;
        }

        this.setupEventListeners();
        console.log('[Search] Module initialized');
    },

    setupEventListeners() {
        // Search input
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            this.updateSearchState(query);
            this.app.setSearchQuery(query);
        });

        // Clear button
        if (this.clearButton) {
            this.clearButton.addEventListener('click', () => {
                this.clearSearch();
            });
        }

        // Search shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.activeElement === this.searchInput) {
                this.clearSearch();
            }
        });
    },

    updateSearchState(query) {
        if (this.clearButton) {
            this.clearButton.style.display = query ? 'block' : 'none';
        }
    },

    clearSearch() {
        this.searchInput.value = '';
        this.updateSearchState('');
        this.app.setSearchQuery('');
        this.searchInput.focus();
    },

    filterByQuery(cards, query) {
        if (!query) return cards;

        const searchLower = query.toLowerCase();
        const beforeCount = cards.length;
        
        const filtered = cards.filter(card => this.cardMatchesQuery(card, searchLower));
        
        // Update search stats
        if (this.searchStats) {
            this.searchStats.textContent = `Found ${filtered.length} of ${beforeCount} cards`;
        }

        return filtered;
    },

    cardMatchesQuery(card, queryLower) {
        const checks = [
            // Basic info
            card.name?.toLowerCase().includes(queryLower),
            card.number?.toLowerCase().includes(queryLower),
            card.artist?.toLowerCase().includes(queryLower),
            card.forteData?.discordUsername?.toLowerCase().includes(queryLower),
            
            // Set info
            card.set?.name?.toLowerCase().includes(queryLower),
            card.set?.id?.toLowerCase().includes(queryLower),
            
            // Card properties
            card.rarity?.toLowerCase().includes(queryLower),
            card.supertype?.toLowerCase().includes(queryLower),
            card.forteData?.regulationMark?.toLowerCase().includes(queryLower),
            
            // Arrays
            card.subtypes?.some(st => st.toLowerCase().includes(queryLower)),
            card.types?.some(t => t.toLowerCase().includes(queryLower)),
            
            // Text content
            card.flavorText?.toLowerCase().includes(queryLower),
            card.rules?.some(rule => rule.toLowerCase().includes(queryLower)),
            
            // Abilities and attacks
            card.abilities?.some(ability => 
                ability.name?.toLowerCase().includes(queryLower) ||
                ability.text?.toLowerCase().includes(queryLower)
            ),
            card.attacks?.some(attack => 
                attack.name?.toLowerCase().includes(queryLower) ||
                attack.text?.toLowerCase().includes(queryLower)
            ),
            
            // Numeric searches
            card.hp?.toString().includes(queryLower),
            card.nationalPokedexNumbers?.some(num => num.toString().includes(queryLower)),
            
            // Evolution
            card.evolvesFrom?.toLowerCase().includes(queryLower),
        ];

        // Handle partial name matching better
        if (card.name) {
            const cardNameLower = card.name.toLowerCase();
            const queryWords = queryLower.split(/\s+/);
            const nameWordsMatch = queryWords.every(word => 
                cardNameLower.includes(word)
            );
            checks.push(nameWordsMatch);
        }

        // Handle partial Discord username matching
        if (card.forteData?.discordUsername) {
            const usernameLower = card.forteData.discordUsername.toLowerCase();
            const queryWords = queryLower.split(/\s+/);
            const usernameWordsMatch = queryWords.every(word => 
                usernameLower.includes(word)
            );
            checks.push(usernameWordsMatch);
        }

        return checks.some(result => result === true);
    },

    updateStats(filteredCount, totalCount) {
        if (this.searchStats && this.app.getSearchQuery()) {
            this.searchStats.textContent = `Found ${filteredCount} of ${totalCount} cards`;
        } else if (this.searchStats) {
            this.searchStats.textContent = '';
        }
    }
};
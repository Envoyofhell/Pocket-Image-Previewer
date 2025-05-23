// js/navigation.js - Fixed Navigation Module
// Handles set tabs and navigation

window.ForteNavigation = {
    app: null,
    tabContainer: null,

    init(appInstance) {
        this.app = appInstance;
        this.tabContainer = document.getElementById('tab-container');
        
        if (!this.tabContainer) {
            console.error('[Navigation] Tab container not found');
            return;
        }

        this.renderTabs();
        this.setupEventListeners();
        this.selectDefaultTab();
        
        console.log('[Navigation] Module initialized');
    },

    renderTabs() {
        const setCounts = this.calculateSetCounts();
        const orderedSets = this.orderSets(setCounts);
        
        this.tabContainer.innerHTML = '';
        
        // Add "All Sets" tab
        const allTab = this.createTab('all', `All Sets (${this.app.getAllCards().length})`, 
            SITE_CONFIG.setColors['All'] || SITE_CONFIG.setColors['default']);
        allTab.setAttribute('data-key-num', '0');
        this.tabContainer.appendChild(allTab);
        
        // Add set-specific tabs
        orderedSets.forEach((setInfo, index) => {
            const tab = this.createTab(
                setInfo.id, 
                `${setInfo.name} (${setInfo.count})`,
                SITE_CONFIG.setColors[setInfo.name] || SITE_CONFIG.setColors['default']
            );
            
            if (index < 9) {
                tab.setAttribute('data-key-num', (index + 1).toString());
            }
            
            this.tabContainer.appendChild(tab);
        });
    },

    calculateSetCounts() {
        const setCounts = {};
        
        this.app.getAllCards().forEach(card => {
            if (card.set?.name) {
                const setKey = card.set.name; // Use set.name as key
                if (!setCounts[setKey]) {
                    setCounts[setKey] = {
                        name: this.getSetDisplayName(card.set.name),
                        count: 0,
                        id: card.set.name, // Use set.name as id for filtering
                        setName: card.set.name
                    };
                }
                setCounts[setKey].count++;
            } else {
                // Handle cards without set info
                const defaultKey = "Unknown";
                if (!setCounts[defaultKey]) {
                    setCounts[defaultKey] = { 
                        name: "Unknown Set", 
                        count: 0, 
                        id: "unknown",
                        setName: "Unknown"
                    };
                }
                setCounts[defaultKey].count++;
            }
        });
        
        return setCounts;
    },

    getSetDisplayName(setName) {
        if (!setName) return "Unknown Set";
        
        // Find matching display name in SITE_CONFIG by comparing set name with the map values
        const configEntry = Object.entries(SITE_CONFIG.setDisplayNameToCodeMap)
            .find(([displayName, code]) => 
                code === setName || displayName === setName
            );
        
        return configEntry ? configEntry[0] : setName;
    },

    orderSets(setCounts) {
        // Order sets according to SITE_CONFIG.setOrder
        const orderedSets = SITE_CONFIG.setOrder
            .map(setDisplayName => {
                const setCode = SITE_CONFIG.setDisplayNameToCodeMap[setDisplayName];
                // Look for the set by both code and display name
                const foundSet = Object.values(setCounts).find(setInfo => 
                    setInfo.setName === setCode || setInfo.setName === setDisplayName
                );
                return foundSet || null;
            })
            .filter(Boolean);
        
        // Add any sets not in SITE_CONFIG.setOrder
        Object.values(setCounts).forEach(setInfo => {
            if (!orderedSets.find(s => s.setName === setInfo.setName)) {
                orderedSets.push(setInfo);
            }
        });
        
        return orderedSets;
    },

    createTab(setId, text, color) {
        const button = document.createElement('button');
        button.className = 'tab';
        button.dataset.setId = setId;
        button.textContent = text;
        
        if (color) {
            button.style.setProperty('--tab-active-border-color', color);
            button.style.setProperty('--tab-active-bg-color', this.hexToRgba(color, 0.1));
            button.style.setProperty('--tab-active-text-color', color);
        }
        
        return button;
    },

    hexToRgba(hex, alpha = 1) {
        if (!hex || typeof hex !== 'string') return `rgba(107, 114, 128, ${alpha})`;
        
        hex = hex.replace('#', '');
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        const bigint = parseInt(hex, 16);
        if (isNaN(bigint)) return `rgba(107, 114, 128, ${alpha})`;
        
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    setupEventListeners() {
        // Use event delegation for better performance and to handle dynamically created tabs
        this.tabContainer.addEventListener('click', (e) => {
            const tab = e.target.closest('.tab');
            if (tab && !tab.classList.contains('active')) {
                console.log('[Navigation] Tab clicked:', tab.dataset.setId);
                this.selectTab(tab.dataset.setId);
            }
        });

        // Also add keyboard support
        this.tabContainer.addEventListener('keydown', (e) => {
            const tab = e.target.closest('.tab');
            if (tab && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                if (!tab.classList.contains('active')) {
                    this.selectTab(tab.dataset.setId);
                }
            }
        });
    },

    selectTab(setId) {
        console.log('[Navigation] Selecting tab:', setId);
        
        // Update active state
        this.tabContainer.querySelectorAll('.tab').forEach(tab => {
            const isActive = tab.dataset.setId === setId;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive.toString());
        });
        
        // Notify app of tab change
        this.app.setCurrentSetTab(setId);
        
        // Scroll gallery to top
        if (window.ForteGallery && window.ForteGallery.scrollToTop) {
            window.ForteGallery.scrollToTop();
        }
    },

    selectDefaultTab() {
        const defaultSetId = this.app.getCurrentSetTab();
        console.log('[Navigation] Selecting default tab:', defaultSetId);
        
        // First try to find the exact tab
        const defaultTab = this.tabContainer.querySelector(
            `.tab[data-set-id="${defaultSetId}"]`
        );
        
        if (defaultTab) {
            this.selectTab(defaultTab.dataset.setId);
        } else {
            // Fallback to "All Sets"
            const allTab = this.tabContainer.querySelector('.tab[data-set-id="all"]');
            if (allTab) {
                this.selectTab('all');
            } else {
                // Last resort - select first tab
                const firstTab = this.tabContainer.querySelector('.tab');
                if (firstTab) {
                    this.selectTab(firstTab.dataset.setId);
                }
            }
        }
    },

    selectTabByNumber(number) {
        const tabs = this.tabContainer.querySelectorAll('.tab');
        
        if (number === 0) {
            // Select "All Sets" tab
            const allTab = tabs[0];
            if (allTab && !allTab.classList.contains('active')) {
                this.selectTab(allTab.dataset.setId);
                return true;
            }
        } else if (number <= tabs.length - 1) {
            // Select specific set tab (1-indexed)
            const tab = tabs[number];
            if (tab && !tab.classList.contains('active')) {
                this.selectTab(tab.dataset.setId);
                return true;
            }
        }
        
        return false;
    },

    // Public API
    refreshTabs() {
        this.renderTabs();
        this.selectDefaultTab();
    },

    getCurrentTab() {
        const activeTab = this.tabContainer.querySelector('.tab.active');
        return activeTab ? activeTab.dataset.setId : 'all';
    }
};
// js/url-utils.js
// Utility functions for generating SEO-friendly URLs

/**
 * Generate SEO-friendly URL for a card
 * @param {Object} card - The card object
 * @returns {string} SEO-friendly URL slug
 */
function generateSEOUrl(card) {
    if (!card || !card.name) {
        return 'unknown-card';
    }
    
    // Create SEO-friendly URL based on card name
    let seoUrl = card.name;
    
    // Handle special characters and spaces
    seoUrl = seoUrl
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    // Add card number if available
    if (card.number) {
        seoUrl += `-${card.number}`;
    }
    
    return seoUrl;
}

/**
 * Generate full card URL with set path
 * @param {Object} card - The card object
 * @param {string} baseUrl - The base URL of the site
 * @returns {string} Full card URL
 */
function generateCardUrl(card, baseUrl = window.location.origin) {
    if (!card || !card.name) {
        console.warn('[URL Utils] Invalid card object:', card);
        return `${baseUrl}/#unknown-card`;
    }
    
    const setId = card.set?.id || 'unknown';
    const seoUrl = generateSEOUrl(card);
    const fullUrl = `${baseUrl}/#${setId}/${seoUrl}`;
    
    return fullUrl;
}

/**
 * Find a card by set path and card slug
 * @param {Array} allCards - Array of all cards
 * @param {string} setPath - The set path (e.g., "pf1")
 * @param {string} cardSlug - The card slug (e.g., "ivysaur-2")
 * @returns {Object|null} The card object or null if not found
 */
function findCardByPath(allCards, setPath, cardSlug) {
    if (!allCards || !Array.isArray(allCards) || !setPath || !cardSlug) {
        console.warn('[URL Utils] Invalid parameters for findCardByPath:', { allCards: !!allCards, setPath, cardSlug });
        return null;
    }
    
    console.log('[URL Utils] Searching for card:', { setPath, cardSlug, totalCards: allCards.length });
    
    // First, find cards in the specified set
    const setCards = allCards.filter(card => card.set?.id === setPath);
    console.log('[URL Utils] Found cards in set:', setCards.length);
    
    if (setCards.length === 0) {
        console.warn('[URL Utils] No cards found in set:', setPath);
        return null;
    }
    
    // Parse the card slug to extract name and number
    const match = cardSlug.match(/^(.+)-(\d+)$/);
    if (!match) {
        console.warn('[URL Utils] Invalid card slug format:', cardSlug);
        return null;
    }
    
    const [, cardName, cardNumber] = match;
    const normalizedCardName = cardName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    console.log('[URL Utils] Looking for card:', {
        cardName: cardName,
        normalizedCardName: normalizedCardName,
        cardNumber: cardNumber
    });
    
    // Find the card by name and number
    const card = setCards.find(card => {
        const normalizedName = card.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cardNum = card.number?.toString();
        
        return normalizedName === normalizedCardName && cardNum === cardNumber;
    });
    
    if (card) {
        console.log('[URL Utils] Found card:', card.name);
    } else {
        console.warn('[URL Utils] Card not found:', { setPath, cardSlug, cardName, cardNumber });
    }
    
    return card;
}

/**
 * Parse a card path to extract set and card information
 * @param {string} path - The path to parse (e.g., "pf1/ivysaur-2")
 * @returns {Object|null} Object with set and cardSlug, or null if invalid
 */
function parseCardPath(path) {
    if (!path || typeof path !== 'string') {
        console.warn('[URL Utils] Invalid path:', path);
        return null;
    }
    
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Split by '/' to get set and card parts
    const parts = cleanPath.split('/');
    if (parts.length !== 2) {
        console.warn('[URL Utils] Invalid path format:', path);
        return null;
    }
    
    const [setId, cardSlug] = parts;
    
    console.log('[URL Utils] Parsed path:', {
        originalPath: path,
        cleanPath: cleanPath,
        setId: setId,
        cardSlug: cardSlug
    });
    
    return {
        set: setId,
        cardSlug: cardSlug
    };
}

/**
 * Automatically fix set ID based on set name to ensure consistency
 * @param {Object} card - The card object
 * @returns {Object} The card object with corrected set.id
 */
function fixCardSetId(card) {
    if (!card || !card.set) {
        return card;
    }
    
    // Set name to ID mapping based on filter_config.js
    const setMapping = {
        "PF1": "PF1",      // Forte Arrivals
        "PFI": "PF1",      // Forte Arrivals (typo fix)
        "PF1a": "PF1a",    // Celestial Resonance  
        "pf1b": "pf1b",    // Ancient Awakenings
        "Promo": "promo",  // Promo
        "Unbound": "misc"  // Unbound (actual misc cards)
    };
    
    // If set.name exists and set.id doesn't match the mapping, fix it
    if (card.set.name && setMapping[card.set.name] && card.set.id !== setMapping[card.set.name]) {
        console.log(`[URL Utils] Fixing set ID for ${card.name}: ${card.set.id} → ${setMapping[card.set.name]} (${card.set.name})`);
        card.set.id = setMapping[card.set.name];
    }
    
    return card;
}

/**
 * Fix set IDs for all cards in an array
 * @param {Array} cards - Array of card objects
 * @returns {Array} Array of cards with corrected set IDs
 */
function fixAllCardSetIds(cards) {
    if (!Array.isArray(cards)) {
        return cards;
    }
    
    return cards.map(card => fixCardSetId(card));
}

// Export for use in other modules
window.ForteURLUtils = {
    generateCardUrl,
    generateSEOUrl,
    parseCardPath,
    findCardByPath,
    fixCardSetId,
    fixAllCardSetIds
}; 
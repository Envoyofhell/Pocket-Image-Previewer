// filter-config.js
// Client-side configuration for UI presentation of filters and sets.

const SITE_CONFIG = {
    // 1. Order for Set Tabs and Set Filter Dropdown
    // These display names should match the keys in setDisplayNameToCodeMap
    // and will be used for tab labels and dropdown options.
    setOrder: [
        "Forte Arrivals",
        "Celestial Resonance",
        "Ancient Awakenings",
        "Promo",
        "Unbound" // Display name for cards with set.id 'misc'
    ],

    // 2. Mapping of Set Display Names (used in UI) to Set IDs/Codes (from cards.json)
    // Ensure the CODES ("pf1", "misc", etc.) match exactly what's in card.set.id in your cards.json
    setDisplayNameToCodeMap: {
        "Forte Arrivals": "pf1",
        "Celestial Resonance": "pf1a",
        "Ancient Awakenings": "pf1b",
        "Promo": "promo",
        "Unbound": "misc" // This display name maps to the 'misc' set ID
    },

    // 3. Order for Pokémon Type Filter Dropdown
    pokemonTypeOrder: [
        "Grass", "Fire", "Water", "Lightning", "Fighting", "Psychic",
        "Darkness", "Metal", "Dragon", "Fairy", "Colorless"
    ],

    // 4. Order for Trainer Subtype Filter Dropdown
    trainerSubtypeOrder: [
        "Supporter", "Item", "Pokémon Tool", "Stadium", "Declassified"
    ],

    // 5. Order for Rarity Filter Dropdown
    rarityOrder: [
        "Common", "Uncommon", "Rare", "Rare Holo", "Double Rare",
        "Ultra Rare", "Illustration Rare", "Special Illustration Rare", "Hyper Rare", "Promo"
    ],

    // 6. Colors for Set Tabs/UI Elements
    // Keys should be the DISPLAY NAMES from setOrder.
    setColors: {
        "Forte Arrivals": "#4ade80",
        "Celestial Resonance": "#a78bfa",
        "Ancient Awakenings": "#fbbf24",
        "Promo": "#A0A0A0",
        "Unbound": "#71717a",
        "All": "#DC2626",
        "default": "#6B7280"
    },

    // 7. Colors for Creators
    creatorColors: {
        "Avalan": "#3b82f6",
        "Fizzy": "#ec4899",
        "Ultima": "#10b981",
        "EnvoyOfHell": "#f97316",
        "default": "#64748b"
    },

    // 8. Default Set Tab to be active on page load (use 'all' or a set ID from setDisplayNameToCodeMap values)
    defaultActiveSetTab: "all", // 'all' refers to showing all sets

    // 9. Configuration for "Forte" status filter
    forteStatusOptions: {
        "all": "All Statuses",
        "isForte": "Forte Only",
        "notForte": "Non-Forte"
    }
};

window.SITE_CONFIG = SITE_CONFIG;

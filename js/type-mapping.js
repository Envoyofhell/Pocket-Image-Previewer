// js/type-mapping.js
// Type mapping system for Forte Card Previewer

window.ForteTypeMapping = {
    // Master type mapping: full name -> { initial, icon, color }
    typeMap: {
        // Pokémon TCG Standard Types
        'Grass': { initial: 'G', icon: 'img/types/Grass.png', color: '#4ade80' },
        'Fire': { initial: 'R', icon: 'img/types/Fire.png', color: '#ef4444' },
        'Water': { initial: 'W', icon: 'img/types/Water.png', color: '#3b82f6' },
        'Lightning': { initial: 'L', icon: 'img/types/Electric.png', color: '#eab308' },
        'Electric': { initial: 'L', icon: 'img/types/Electric.png', color: '#eab308' }, // Alias
        'Psychic': { initial: 'P', icon: 'img/types/Psychic.png', color: '#a855f7' },
        'Fighting': { initial: 'F', icon: 'img/types/Fighting.png', color: '#f97316' },
        'Darkness': { initial: 'D', icon: 'img/types/Dark.png', color: '#374151' },
        'Dark': { initial: 'D', icon: 'img/types/Dark.png', color: '#374151' }, // Alias
        'Metal': { initial: 'M', icon: 'img/types/Metal.png', color: '#6b7280' },
        'Dragon': { initial: 'N', icon: 'img/types/Dragon.png', color: '#7c3aed' },
        'Fairy': { initial: 'Y', icon: 'img/types/Fairy.png', color: '#ec4899' },
        'Colorless': { initial: 'C', icon: 'img/types/Colorless.png', color: '#9ca3af' },
        
        // Common aliases and variations
        'Neutral': { initial: 'C', icon: 'img/types/Colorless.png', color: '#9ca3af' },
        'Normal': { initial: 'C', icon: 'img/types/Colorless.png', color: '#9ca3af' },
    },

    // Reverse mapping: initial -> type info
    initialMap: null,

    // Initialize the reverse mapping
    init() {
        this.initialMap = {};
        for (const [typeName, typeInfo] of Object.entries(this.typeMap)) {
            this.initialMap[typeInfo.initial.toUpperCase()] = {
                name: typeName,
                ...typeInfo
            };
        }
        console.log('[TypeMapping] Initialized with', Object.keys(this.typeMap).length, 'types');
    },

    // Parse energy cost string (handles both full names and initials)
    // Examples: "Fire x2", "R x2", "Colorless,Colorless", "C,C", "Water x1. Neutral x1"
    parseEnergyCost(costString) {
        if (!costString) return [];
        
        const costs = [];
        
        // Split by periods first (for cases like "Water x1. Neutral x1")
        const sections = costString.split('.').map(s => s.trim());
        
        for (const section of sections) {
            // Handle comma-separated format (C,C)
            if (section.includes(',') && !section.toLowerCase().includes(' x')) {
                const parts = section.split(',').map(p => p.trim());
                for (const part of parts) {
                    const typeInfo = this.getTypeInfo(part);
                    if (typeInfo) {
                        costs.push(typeInfo);
                    }
                }
            }
            // Handle "x" format (Fire x2, R x2)
            else {
                const match = section.match(/^(.+?)\s*x?(\d+)$/i);
                if (match) {
                    const typeName = match[1].trim();
                    const count = parseInt(match[2]) || 1;
                    const typeInfo = this.getTypeInfo(typeName);
                    
                    if (typeInfo) {
                        // Add multiple copies
                        for (let i = 0; i < count; i++) {
                            costs.push(typeInfo);
                        }
                    }
                } else {
                    // Single type without multiplier
                    const typeInfo = this.getTypeInfo(section);
                    if (typeInfo) {
                        costs.push(typeInfo);
                    }
                }
            }
        }
        
        return costs;
    },

    // Get type info from either full name or initial
    getTypeInfo(input) {
        if (!input) return null;
        
        const cleanInput = input.trim();
        
        // Try full name first (case-insensitive)
        for (const [typeName, typeInfo] of Object.entries(this.typeMap)) {
            if (typeName.toLowerCase() === cleanInput.toLowerCase()) {
                return { name: typeName, ...typeInfo };
            }
        }
        
        // Try initial (case-insensitive)
        const upperInput = cleanInput.toUpperCase();
        if (this.initialMap && this.initialMap[upperInput]) {
            return this.initialMap[upperInput];
        }
        
        // If no match found, return a generic colorless
        console.warn('[TypeMapping] Unknown type:', cleanInput, '- defaulting to Colorless');
        return { name: 'Colorless', initial: 'C', icon: 'img/types/Colorless.png', color: '#9ca3af' };
    },

    // Parse weakness/resistance string
    // Examples: "Fire x2", "Psychic -30", "F x2", "P -30", "fighting 2", "Fighting ×2"
    parseWeaknessResistance(input) {
        if (!input) return null;
        
        const cleanInput = input.trim();
        
        // Match patterns like:
        // "Fire x2", "F x2" (with x)
        // "Fighting ×2" (with ×)
        // "fighting 2" (just space and number)
        // "Psychic -30", "P -30" (resistance with minus)
        const match = cleanInput.match(/^(.+?)\s*([x×]\d+|[-+]\d+|\d+)$/i);
        
        if (match) {
            const typeName = match[1].trim();
            let modifier = match[2].trim();
            
            // If it's just a number (like "2"), add "x" prefix
            if (/^\d+$/.test(modifier)) {
                modifier = 'x' + modifier;
            }
            
            const typeInfo = this.getTypeInfo(typeName);
            
            if (typeInfo) {
                return {
                    type: typeInfo,
                    value: modifier
                };
            }
        }
        
        return null;
    },

    // Generate HTML for energy cost icons
    formatEnergyCostHTML(costs) {
        if (!costs || costs.length === 0) return '';
        
        return costs.map(cost => 
            `<img src="${cost.icon}" alt="${cost.name}" class="energy-icon" title="${cost.name}" />`
        ).join('');
    },

    // Generate HTML for weakness/resistance
    formatWeaknessResistanceHTML(parsed) {
        if (!parsed) return '';
        
        return `<img src="${parsed.type.icon}" alt="${parsed.type.name}" class="type-icon" title="${parsed.type.name}" /> ${parsed.value}`;
    },

    // Generate reference key for documentation
    generateReferenceKey() {
        const keyEntries = Object.entries(this.typeMap)
            .filter(([name, info]) => !['Electric', 'Dark', 'Neutral', 'Normal'].includes(name)) // Remove aliases
            .sort(([a], [b]) => a.localeCompare(b));
        
        let key = '# Type Reference Key\n\n';
        key += '| Type | Initial | Full Name | Example Usage |\n';
        key += '|------|---------|-----------|---------------|\n';
        
        for (const [typeName, typeInfo] of keyEntries) {
            key += `| ![${typeName}](${typeInfo.icon}) | **${typeInfo.initial}** | ${typeName} | \`${typeInfo.initial}\`, \`${typeName}\`, \`${typeInfo.initial} x2\`, \`${typeName} x2\` |\n`;
        }
        
        key += '\n## Usage Examples:\n';
        key += '- **Attack Costs**: `R,R` or `Fire,Fire` or `Fire x2`\n';
        key += '- **Weakness**: `F x2` or `Fighting x2`\n';
        key += '- **Resistance**: `P -30` or `Psychic -30`\n';
        key += '- **Retreat Cost**: `C,C,C` or `Colorless x3`\n';
        
        return key;
    }
};

// Initialize when the script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.ForteTypeMapping.init());
} else {
    window.ForteTypeMapping.init();
} 
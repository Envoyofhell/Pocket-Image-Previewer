// generate_sitemap.js
// Generates dynamic sitemaps for better SEO indexing of individual card pages

const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = 'https://your-domain.com'; // Replace with your actual domain
const OUTPUT_DIR = './public'; // Directory to output sitemaps
const CARDS_PER_SITEMAP = 50000; // Maximum cards per sitemap (Google's limit is 50,000)
const PRIORITY_HOME = '1.0';
const PRIORITY_CARD = '0.8';
const PRIORITY_SET = '0.9';
const CHANGE_FREQ = 'weekly';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate SEO-friendly URL slug for a card
 * @param {Object} card - The card object
 * @returns {string} SEO-friendly URL slug
 */
function generateSEOUrl(card) {
    if (!card || !card.name) {
        return 'unknown-card';
    }
    
    // Create a URL-friendly version of the card name
    const nameSlug = card.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim();
    
    // Add card number for uniqueness
    const cardNumber = card.number || '0';
    
    return `${nameSlug}-${cardNumber}`;
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
        card.set.id = setMapping[card.set.name];
    }
    
    return card;
}

/**
 * Generate XML sitemap content
 */
function generateSitemapXML(urls) {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const urlsetClose = '</urlset>';
    
    const urlEntries = urls.map(url => {
        return `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
    }).join('\n');
    
    return `${xmlHeader}
${urlsetOpen}
${urlEntries}
${urlsetClose}`;
}

/**
 * Generate sitemap index XML
 */
function generateSitemapIndex(sitemaps) {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const sitemapindexOpen = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const sitemapindexClose = '</sitemapindex>';
    
    const sitemapEntries = sitemaps.map(sitemap => {
        return `  <sitemap>
    <loc>${sitemap.loc}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`;
    }).join('\n');
    
    return `${xmlHeader}
${sitemapindexOpen}
${sitemapEntries}
${sitemapindexClose}`;
}

/**
 * Load card data from cards.json
 */
function loadCardData() {
    try {
        const cardsPath = path.join(__dirname, 'data', 'cards.json');
        const cardsData = fs.readFileSync(cardsPath, 'utf8');
        return JSON.parse(cardsData);
    } catch (error) {
        console.error('Error loading card data:', error);
        return [];
    }
}

/**
 * Generate URLs for all cards
 */
function generateCardUrls(cards) {
    const now = new Date().toISOString().split('T')[0];
    
    return cards.map(card => {
        // Fix set ID before generating URL
        const fixedCard = fixCardSetId(card);
        const seoUrl = generateSEOUrl(fixedCard);
        const setId = fixedCard.set?.id || 'unknown';
        
        return {
            loc: `${SITE_URL}/#${setId}/${seoUrl}`,
            lastmod: now,
            changefreq: CHANGE_FREQ,
            priority: PRIORITY_CARD
        };
    });
}

/**
 * Generate set-specific URLs
 */
function generateSetUrls(cards) {
    const now = new Date().toISOString().split('T')[0];
    const sets = new Set();
    
    cards.forEach(card => {
        if (card.set && card.set.id) {
            sets.add(card.set.id);
        }
    });
    
    return Array.from(sets).map(setId => ({
        loc: `${SITE_URL}/#set=${setId}`,
        lastmod: now,
        changefreq: CHANGE_FREQ,
        priority: PRIORITY_SET
    }));
}

/**
 * Generate main sitemap URLs
 */
function generateMainUrls() {
    const now = new Date().toISOString().split('T')[0];
    
    return [
        {
            loc: SITE_URL,
            lastmod: now,
            changefreq: CHANGE_FREQ,
            priority: PRIORITY_HOME
        }
    ];
}

/**
 * Split URLs into chunks for multiple sitemaps
 */
function chunkUrls(urls, chunkSize) {
    const chunks = [];
    for (let i = 0; i < urls.length; i += chunkSize) {
        chunks.push(urls.slice(i, i + chunkSize));
    }
    return chunks;
}

/**
 * Main sitemap generation function
 */
function generateSitemaps() {
    console.log('🚀 Starting sitemap generation...');
    
    // Load card data
    const cards = loadCardData();
    console.log(`📊 Loaded ${cards.length} cards`);
    
    // Generate all URLs
    const mainUrls = generateMainUrls();
    const setUrls = generateSetUrls(cards);
    const cardUrls = generateCardUrls(cards);
    
    console.log(`📍 Generated URLs: ${mainUrls.length} main, ${setUrls.length} sets, ${cardUrls.length} cards`);
    
    // Combine all URLs
    const allUrls = [...mainUrls, ...setUrls, ...cardUrls];
    
    // Split into chunks if needed
    const urlChunks = chunkUrls(allUrls, CARDS_PER_SITEMAP);
    
    const sitemaps = [];
    const now = new Date().toISOString().split('T')[0];
    
    // Generate individual sitemap files
    urlChunks.forEach((urlChunk, index) => {
        const sitemapName = index === 0 ? 'sitemap.xml' : `sitemap-${index + 1}.xml`;
        const sitemapPath = path.join(OUTPUT_DIR, sitemapName);
        const sitemapContent = generateSitemapXML(urlChunk);
        
        fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');
        console.log(`✅ Generated ${sitemapName} with ${urlChunk.length} URLs`);
        
        sitemaps.push({
            loc: `${SITE_URL}/${sitemapName}`,
            lastmod: now
        });
    });
    
    // Generate sitemap index if multiple sitemaps
    if (sitemaps.length > 1) {
        const indexPath = path.join(OUTPUT_DIR, 'sitemap-index.xml');
        const indexContent = generateSitemapIndex(sitemaps);
        fs.writeFileSync(indexPath, indexContent, 'utf8');
        console.log(`✅ Generated sitemap-index.xml with ${sitemaps.length} sitemaps`);
    }
    
    // Generate robots.txt
    generateRobotsTxt(sitemaps.length > 1);
    
    console.log('🎉 Sitemap generation complete!');
    console.log(`📁 Sitemaps saved to: ${path.resolve(OUTPUT_DIR)}`);
}

/**
 * Generate robots.txt file
 */
function generateRobotsTxt(hasMultipleSitemaps) {
    const robotsContent = `User-agent: *
Allow: /

# Sitemaps
${hasMultipleSitemaps ? 
    `Sitemap: ${SITE_URL}/sitemap-index.xml` : 
    `Sitemap: ${SITE_URL}/sitemap.xml`
}

# Crawl-delay for respectful crawling
Crawl-delay: 1`;
    
    const robotsPath = path.join(OUTPUT_DIR, 'robots.txt');
    fs.writeFileSync(robotsPath, robotsContent, 'utf8');
    console.log('✅ Generated robots.txt');
}

/**
 * Generate JSON sitemap for modern search engines
 */
function generateJSONSitemap(cards) {
    const now = new Date().toISOString();
    
    const jsonSitemap = {
        version: '1.0',
        generated: now,
        pages: cards.map(card => {
            // Fix set ID before generating URL
            const fixedCard = fixCardSetId(card);
            const seoUrl = generateSEOUrl(fixedCard);
            const setId = fixedCard.set?.id || 'unknown';
            
            return {
                url: `${SITE_URL}/#${setId}/${seoUrl}`,
                title: card.name,
                description: `${card.name} - ${card.supertype} card from ${card.set?.name || 'Unknown Set'}`,
                image: card.images?.large || card.images?.small,
                lastModified: now,
                type: 'card'
            };
        })
    };
    
    const jsonPath = path.join(OUTPUT_DIR, 'sitemap.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonSitemap, null, 2), 'utf8');
    console.log('✅ Generated sitemap.json');
}

// Run the generation
if (require.main === module) {
    try {
        generateSitemaps();
        
        // Also generate JSON sitemap
        const cards = loadCardData();
        generateJSONSitemap(cards);
        
    } catch (error) {
        console.error('❌ Error generating sitemaps:', error);
        process.exit(1);
    }
}

module.exports = {
    generateSitemaps,
    generateJSONSitemap,
    generateRobotsTxt
}; 
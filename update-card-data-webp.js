// update-card-data-webp.js
// Node.js script to add WebP URLs to existing card data
// Adds imagesWebP field while keeping original PNG URLs

const fs = require('fs');
const path = require('path');

// Configuration
const CARD_DATA_FILES = [
    './data/cards.json'
    // Add more files as needed
];

/**
 * Add WebP URLs to a card object
 */
function addWebPUrls(card) {
    if (!card.images || (!card.images.small && !card.images.large)) {
        return card; // No images to convert
    }
    
    // Create WebP URLs by replacing .png with .webp
    const imagesWebP = {};
    
    if (card.images.small) {
        imagesWebP.small = card.images.small.replace(/\.png$/i, '.webp');
    }
    
    if (card.images.large) {
        imagesWebP.large = card.images.large.replace(/\.png$/i, '.webp');
    }
    
    // Add imagesWebP field (keep original images field intact)
    return {
        ...card,
        imagesWebP
    };
}

/**
 * Process a card data file
 */
function processCardDataFile(filePath) {
    console.log(`\n📁 Processing: ${filePath}`);
    
    try {
        // Read file
        const fileContent = fs.readFileSync(filePath, 'utf8');
        let cardData = JSON.parse(fileContent);
        
        // Handle both array and object formats
        const isArray = Array.isArray(cardData);
        const cards = isArray ? cardData : [cardData];
        
        let updatedCount = 0;
        let skippedCount = 0;
        
        // Add WebP URLs to each card
        const updatedCards = cards.map(card => {
            if (card.imagesWebP) {
                skippedCount++;
                return card; // Already has WebP URLs
            }
            
            const updated = addWebPUrls(card);
            if (updated.imagesWebP) {
                updatedCount++;
            }
            return updated;
        });
        
        // Create backup
        const backupPath = filePath + '.backup';
        fs.writeFileSync(backupPath, fileContent, 'utf8');
        console.log(`💾 Backup created: ${backupPath}`);
        
        // Write updated data
        const updatedData = isArray ? updatedCards : updatedCards[0];
        fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf8');
        
        console.log(`✅ Updated: ${updatedCount} cards`);
        console.log(`⏭️  Skipped: ${skippedCount} cards (already have WebP URLs)`);
        
        return { updatedCount, skippedCount };
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return { error: error.message };
    }
}

/**
 * Main function
 */
function main() {
    console.log('🖼️  Card Data WebP URL Updater');
    console.log('================================');
    
    const totalResults = {
        updated: 0,
        skipped: 0,
        failed: 0
    };
    
    CARD_DATA_FILES.forEach(filePath => {
        if (!fs.existsSync(filePath)) {
            console.log(`\n⚠️  File not found: ${filePath}`);
            totalResults.failed++;
            return;
        }
        
        const result = processCardDataFile(filePath);
        
        if (result.error) {
            totalResults.failed++;
        } else {
            totalResults.updated += result.updatedCount || 0;
            totalResults.skipped += result.skippedCount || 0;
        }
    });
    
    // Summary
    console.log('\n================================');
    console.log('📊 Summary:');
    console.log(`✅ Cards Updated: ${totalResults.updated}`);
    console.log(`⏭️  Cards Skipped: ${totalResults.skipped}`);
    console.log(`❌ Files Failed: ${totalResults.failed}`);
    console.log('\n✨ Update complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Upload .webp files to GitHub');
    console.log('   2. Update index.html to include webp-loader.js');
    console.log('   3. Update gallery.js to use WebPLoader');
    console.log('   4. Test in browser');
}

main();


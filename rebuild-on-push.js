// rebuild-on-push.js
// Detects changed PNG files and triggers necessary rebuilds
// Run by GitHub Actions to maintain WebP sync

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Checking for PNG changes and triggering rebuilds...\n');

/**
 * Find all PNG files that are newer than their WebP counterparts
 */
function findChangedPNGs() {
    const changedFiles = [];
    
    function scanDirectory(dir) {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                scanDirectory(filePath);
            } else if (file.toLowerCase().endsWith('.png')) {
                const webpPath = filePath.replace(/\.png$/i, '.webp');
                
                // Check if WebP is missing or older than PNG
                if (!fs.existsSync(webpPath)) {
                    changedFiles.push({ png: filePath, reason: 'missing WebP' });
                } else {
                    const pngMtime = fs.statSync(filePath).mtime;
                    const webpMtime = fs.statSync(webpPath).mtime;
                    
                    if (pngMtime > webpMtime) {
                        changedFiles.push({ png: filePath, reason: 'PNG updated' });
                    }
                }
            }
        });
    }
    
    scanDirectory('./img/approved');
    return changedFiles;
}

/**
 * Main rebuild logic
 */
function main() {
    console.log('📋 Step 1: Checking for changed PNGs...');
    const changedFiles = findChangedPNGs();
    
    if (changedFiles.length === 0) {
        console.log('✅ No PNG changes detected. Everything is up to date!\n');
        return;
    }
    
    console.log(`\n🔄 Found ${changedFiles.length} PNG(s) needing WebP conversion:`);
    changedFiles.forEach(file => {
        console.log(`   - ${path.basename(file.png)} (${file.reason})`);
    });
    
    // Step 2: Convert PNGs to WebP
    console.log('\n📋 Step 2: Converting PNGs to WebP...');
    try {
        execSync('node convert-to-webp.js', { stdio: 'inherit' });
        console.log('✅ WebP conversion complete\n');
    } catch (error) {
        console.error('❌ WebP conversion failed:', error.message);
        process.exit(1);
    }
    
    // Step 3: Update card data with new WebP URLs
    console.log('📋 Step 3: Updating card data with WebP URLs...');
    try {
        execSync('node update-card-data-webp.js', { stdio: 'inherit' });
        console.log('✅ Card data updated\n');
    } catch (error) {
        console.error('❌ Card data update failed:', error.message);
        process.exit(1);
    }
    
    // Step 4: Rebuild image_data.js
    console.log('📋 Step 4: Rebuilding image_data.js...');
    try {
        execSync('npm run build:images', { stdio: 'inherit' });
        console.log('✅ image_data.js rebuilt\n');
    } catch (error) {
        console.error('❌ image_data.js rebuild failed:', error.message);
        process.exit(1);
    }
    
    console.log('🎉 All rebuilds complete!\n');
    console.log('📦 Changed files:');
    console.log('   - ' + changedFiles.length + ' new .webp files');
    console.log('   - data/cards.json (updated)');
    console.log('   - image_data.js (rebuilt)');
}

main();


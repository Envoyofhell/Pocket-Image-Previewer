// convert-to-webp.js
// Batch convert all PNG images to WebP format
// Node.js script using sharp library

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const IMG_DIR = './img/approved';
const WEBP_QUALITY = 85;
const RECURSIVE = true;

/**
 * Recursively find all PNG files in a directory
 */
function findPNGFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && RECURSIVE) {
            findPNGFiles(filePath, fileList);
        } else if (file.toLowerCase().endsWith('.png')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

/**
 * Convert a PNG file to WebP
 */
async function convertToWebP(pngPath) {
    const webpPath = pngPath.replace(/\.png$/i, '.webp');
    
    // Skip if WebP already exists
    if (fs.existsSync(webpPath)) {
        console.log(`⏭️  Skipping (exists): ${path.basename(webpPath)}`);
        return { skipped: true };
    }
    
    try {
        const pngStats = fs.statSync(pngPath);
        const pngSize = pngStats.size;
        
        // Convert to WebP
        await sharp(pngPath)
            .webp({ quality: WEBP_QUALITY })
            .toFile(webpPath);
        
        const webpStats = fs.statSync(webpPath);
        const webpSize = webpStats.size;
        const savings = ((pngSize - webpSize) / pngSize * 100).toFixed(1);
        
        console.log(`✅ Converted: ${path.basename(pngPath)} (${formatBytes(pngSize)} → ${formatBytes(webpSize)}, ${savings}% smaller)`);
        
        return {
            success: true,
            pngSize,
            webpSize,
            savings: parseFloat(savings)
        };
    } catch (error) {
        console.error(`❌ Failed: ${path.basename(pngPath)} - ${error.message}`);
        return { error: error.message };
    }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Main conversion function
 */
async function main() {
    console.log('🎨 PNG to WebP Batch Converter');
    console.log('================================\n');
    console.log(`📁 Scanning directory: ${IMG_DIR}`);
    console.log(`⚙️  WebP Quality: ${WEBP_QUALITY}`);
    console.log(`🔄 Recursive: ${RECURSIVE}\n`);
    
    // Find all PNG files
    const pngFiles = findPNGFiles(IMG_DIR);
    console.log(`📊 Found ${pngFiles.length} PNG files\n`);
    
    if (pngFiles.length === 0) {
        console.log('No PNG files found. Exiting.');
        return;
    }
    
    // Convert each file
    const results = {
        converted: 0,
        skipped: 0,
        failed: 0,
        totalPNGSize: 0,
        totalWebPSize: 0
    };
    
    for (const pngPath of pngFiles) {
        const result = await convertToWebP(pngPath);
        
        if (result.skipped) {
            results.skipped++;
        } else if (result.error) {
            results.failed++;
        } else if (result.success) {
            results.converted++;
            results.totalPNGSize += result.pngSize;
            results.totalWebPSize += result.webpSize;
        }
    }
    
    // Summary
    console.log('\n================================');
    console.log('📊 Conversion Summary:');
    console.log(`✅ Converted: ${results.converted}`);
    console.log(`⏭️  Skipped: ${results.skipped}`);
    console.log(`❌ Failed: ${results.failed}`);
    
    if (results.converted > 0) {
        const totalSavings = ((results.totalPNGSize - results.totalWebPSize) / results.totalPNGSize * 100).toFixed(1);
        console.log(`\n💾 Total Size Reduction:`);
        console.log(`   PNG: ${formatBytes(results.totalPNGSize)}`);
        console.log(`   WebP: ${formatBytes(results.totalWebPSize)}`);
        console.log(`   Savings: ${totalSavings}% (${formatBytes(results.totalPNGSize - results.totalWebPSize)})`);
    }
    
    console.log('\n✨ Conversion complete!');
}

// Run the script
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});


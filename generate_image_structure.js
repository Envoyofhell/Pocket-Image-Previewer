// generate_image_structure.js
// Purpose: Scan the './img' directory recursively, parse filenames using external config,
// and generate 'image_data.js' with the structured data and config.

const fs = require('fs');
const path = require('path');

// --- Configuration ---
const imageDirectory = './img'; // <<< ENSURE THIS IS './img'
const outputFilePath = './image_data.js';
const outputVariableName = 'imageStructure';
const supportedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
const configFilePath = './filter_config.json'; // Path to the new config file

// --- Load Filtering Rules from JSON ---
let filterConfig;
let RARITY_MAP;
let TYPE_MAP;
let RARITY_ORDER;
let TYPE_ORDER;

try {
    console.log(`Loading filter configuration from: ${configFilePath}`);
    const configFileContent = fs.readFileSync(configFilePath, 'utf8');
    filterConfig = JSON.parse(configFileContent);

    // Validate loaded config (basic checks)
    if (!filterConfig || typeof filterConfig.rarityMap !== 'object' || typeof filterConfig.typeMap !== 'object' || !Array.isArray(filterConfig.rarityOrder) || !Array.isArray(filterConfig.typeOrder)) {
        throw new Error("Invalid format in filter_config.json. Ensure rarityMap, typeMap, rarityOrder, and typeOrder exist.");
    }

    RARITY_MAP = filterConfig.rarityMap;
    TYPE_MAP = filterConfig.typeMap;
    RARITY_ORDER = filterConfig.rarityOrder;
    TYPE_ORDER = filterConfig.typeOrder;
    console.log("✅ Filter configuration loaded successfully.");

} catch (err) {
    console.error(`❌ FATAL ERROR loading or parsing ${configFilePath}:`, err.message);
    process.exit(1); // Stop if config is missing or invalid
}


/**
 * Parses filename to determine card type and rarity using loaded config.
 * @param {string} filename - The filename to parse.
 * @returns {{cardType: string | null, cardRarity: string | null}} - Detected type and rarity.
 */
function parseFilename(filename) {
    let cardType = null;
    let cardRarity = null;

    // Use loaded TYPE_MAP
    for (const prefix in TYPE_MAP) {
        if (filename.startsWith(prefix)) {
            cardType = TYPE_MAP[prefix];
            break;
        }
    }

    // Use loaded RARITY_MAP
    for (const code in RARITY_MAP) {
        if (filename.includes(code)) {
            cardRarity = RARITY_MAP[code];
            break;
        }
    }

    return { cardType, cardRarity };
}


/**
 * Recursively scans a directory and builds a nested object structure.
 * Includes type/rarity parsing for image files.
 */
function buildDirectoryStructure(dirPath, rootDir) {
    const absoluteDirPath = path.resolve(dirPath);
    console.log(`Scanning: ${absoluteDirPath}`);

    if (!fs.existsSync(absoluteDirPath) || !fs.statSync(absoluteDirPath).isDirectory()) {
        console.error(`❌ Error: Path not found or is not a directory - ${absoluteDirPath}`);
        if (absoluteDirPath === path.resolve(rootDir)) {
             console.error(`❌ FATAL: Root directory '${rootDir}' not found.`);
             process.exit(1);
        }
        return null;
    }

    const currentRelativePath = path.relative('.', dirPath).replace(/\\/g, '/');
    const currentName = path.basename(dirPath);
    console.log(`   -> Processing Folder: Name='${currentName}', RelativePath='${currentRelativePath}'`);

    const children = [];

    try {
        const files = fs.readdirSync(dirPath);

        files.forEach(file => {
            const currentItemPath = path.join(dirPath, file);
            let stat;
            try { stat = fs.statSync(currentItemPath); }
            catch (statErr) { console.error(`❌ Error getting stats for ${currentItemPath}:`, statErr.message); return; }

            if (stat.isDirectory()) {
                console.log(`      L Found Subfolder: ${file}`);
                const subStructure = buildDirectoryStructure(currentItemPath, rootDir);
                if (subStructure) {
                     console.log(`      L Adding Subfolder object for '${subStructure.name}'`);
                     children.push(subStructure);
                } else { console.log(`      L Skipping empty/invalid subfolder: ${file}`); }
            } else {
                const ext = path.extname(file).toLowerCase();
                if (supportedExtensions.includes(ext)) {
                     const fileRelativePath = path.relative('.', currentItemPath).replace(/\\/g, '/');
                     // *** Parse filename using loaded config ***
                     const { cardType, cardRarity } = parseFilename(file);
                     const fileObject = {
                         name: file,
                         type: 'file',
                         path: fileRelativePath,
                         cardType: cardType, // Add detected type
                         cardRarity: cardRarity // Add detected rarity
                     };
                     console.log(`     L Adding Image: '${fileObject.name}' (Type: ${cardType || 'N/A'}, Rarity: ${cardRarity || 'N/A'})`);
                     children.push(fileObject);
                }
            }
        });
    } catch (readErr) { console.error(`❌ Error reading directory ${dirPath}:`, readErr); process.exit(1); }

    children.sort((a, b) => {
        if (a.type === b.type) { return a.name.localeCompare(b.name); }
        return a.type === 'folder' ? -1 : 1;
    });

    const structure = {
        name: currentName,
        type: 'folder',
        path: currentRelativePath,
        children: children
    };
     console.log(`   <- Finished processing folder '${structure.name}'. Returning structure with ${structure.children.length} children.`);
    return structure;
}

// --- Main Execution ---
try {
    const absoluteRootPath = path.resolve(imageDirectory);
    console.log(`\n--- Starting Image Scan ---`);
    console.log(`Root directory: ${imageDirectory} (Absolute: ${absoluteRootPath})`);
    console.log(`Output file: ${outputFilePath}`);
    console.log(`Supported extensions: ${supportedExtensions.join(', ')}\n`);

    const structure = buildDirectoryStructure(imageDirectory, imageDirectory);

    if (!structure) { console.error(`\n❌ Failed to generate structure.`); process.exit(1); }

    // --- Final Check ---
    if (!structure.name || !structure.path || !Array.isArray(structure.children)) { console.error(`\n❌ Error: Generated structure invalid.`); process.exit(1); }
    const expectedRootName = path.basename(imageDirectory);
    const expectedRootPath = imageDirectory.replace(/\\/g, '/');
    if (structure.name !== expectedRootName || structure.path !== expectedRootPath) { console.warn(`\n⚠️ Warning: Root mismatch.`); }
    console.log(`\n✅ Scan complete. Root: '${structure.name}', Path: '${structure.path}', Children: ${structure.children.length}`);

    console.log(`\nPreparing to write data...`);

    // Use the loaded filterConfig directly
    const outputObject = {
         imageStructure: structure,
         filterConfig: filterConfig // Include the loaded config in the output
    };

    let outputString = '';
    try {
        outputString = `// This file is automatically generated by generate_image_structure.js
// Do not edit this file manually!

const ${outputVariableName} = ${JSON.stringify(outputObject, null, 2)};
`;
        console.log(`   Data formatted successfully. Length: ${outputString.length}`);
    } catch (stringifyError) { console.error(`❌ Error stringifying data:`, stringifyError); process.exit(1); }

    // Write to file
    try {
        console.log(`   Attempting to write to: ${path.resolve(outputFilePath)}`);
        fs.writeFileSync(outputFilePath, outputString, 'utf8');
        console.log(`✅ Data successfully written to: ${path.resolve(outputFilePath)}`);
    } catch (writeError) { console.error(`❌❌❌ CRITICAL ERROR writing file!`, writeError); process.exit(1); }

} catch (error) { console.error("\n❌ Unexpected error:", error); process.exit(1); }

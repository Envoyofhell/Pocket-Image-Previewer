// generate_image_structure.js
// Purpose: Scan './img', parse complex Forte filenames using external config,
// collect unique creators, and generate 'image_data.js'.

const fs = require('fs');
const path = require('path');

// --- Configuration ---
const imageDirectory = './img';
const outputFilePath = './image_data.js';
const outputVariableName = 'imageData'; // Contains structure + config
const supportedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
const configFilePath = './filter_config.json';
const BLANK_SUFFIX = '-BL-';

// --- Load Filtering Rules ---
let filterConfig;
let TYPE_MAP, TRAINER_TYPE_MAP, SET_MAP, FORTE_MAP;
let allCreators = new Set();

try {
    console.log(`Loading filter configuration from: ${configFilePath}`);
    const configFileContent = fs.readFileSync(configFilePath, 'utf8');
    filterConfig = JSON.parse(configFileContent);

    // Basic validation (removed rarity checks)
    if (!filterConfig || typeof filterConfig.typeMap !== 'object' ||
        typeof filterConfig.trainerTypeMap !== 'object' || typeof filterConfig.setMap !== 'object' ||
        typeof filterConfig.forteMap !== 'object' || !Array.isArray(filterConfig.typeOrder) ||
        !Array.isArray(filterConfig.trainerTypeOrder) || !Array.isArray(filterConfig.setOrder) ||
        typeof filterConfig.setColors !== 'object') { // Changed to setColors
        throw new Error("Invalid format in filter_config.json. Check all required maps/orders/colors (excluding rarity).");
    }

    TYPE_MAP = filterConfig.typeMap;
    TRAINER_TYPE_MAP = filterConfig.trainerTypeMap;
    SET_MAP = filterConfig.setMap;
    FORTE_MAP = filterConfig.forteMap;
    console.log("✅ Filter configuration loaded successfully.");

} catch (err) {
    console.error(`❌ FATAL ERROR loading or parsing ${configFilePath}:`, err.message);
    process.exit(1);
}

/**
 * Parses complex filename based on defined rules from config.
 * @param {string} filename - The filename to parse (without extension).
 * @returns {object} - Object containing parsed properties.
 */
function parseFilenameAdvanced(filename) {
    let remainingFilename = filename;
    const parsed = {
        dexNumber: null, setCode: null, setName: null, setNumber: null,
        cardName: null, isForte: false, types: [], isTrainer: false,
        trainerType: null, creator: null, isBlank: false, isNumbered: true,
        cardRarity: null // Keep property but set to null
    };

    // 1. Creator (@...)
    const creatorMatch = remainingFilename.match(/@([a-zA-Z0-9_]+)$/);
    if (creatorMatch) {
        parsed.creator = creatorMatch[1];
        allCreators.add(parsed.creator);
        remainingFilename = remainingFilename.substring(0, remainingFilename.lastIndexOf('@')).trim();
    }

    // 2. Blank (-BL-)
    if (remainingFilename.endsWith(BLANK_SUFFIX)) {
        parsed.isBlank = true;
        remainingFilename = remainingFilename.substring(0, remainingFilename.length - BLANK_SUFFIX.length).trim();
    }

    // 3. Forte (_F_)
    if (remainingFilename.includes('_F_')) {
        parsed.isForte = true;
    }

    // 4. Dex Number (#xxxx)
    const dexMatch = remainingFilename.match(/^#(\d{1,4})\s*/);
    if (dexMatch) {
        parsed.dexNumber = dexMatch[1].padStart(4, '0');
    }

    // 5. Trainer (-TR-) and Trainer Type (-TT-)
    if (remainingFilename.includes('-TR-')) {
        parsed.isTrainer = true;
        parsed.cardType = 'Trainer';
        let foundTrainerType = false;
        for (const code in TRAINER_TYPE_MAP) {
            if (remainingFilename.includes(code)) {
                parsed.trainerType = TRAINER_TYPE_MAP[code];
                foundTrainerType = true;
                break;
            }
        }
        if (!foundTrainerType && TRAINER_TYPE_MAP['-XX-']) {
            parsed.trainerType = TRAINER_TYPE_MAP['-XX-'];
        }
    }

    // 6. Set Code (_xx_) and Set Number (_xxx_ or ....)
    // --- REVISED LOGIC (Removed .toUpperCase) ---
    let setCodeFound = false; // Flag to track if we found any set code

    if (parsed.isTrainer) {
        // --- Trainer Logic ---
        // Use a simpler regex looking just for the set code pattern (_XXX_)
        const trainerSetRegex = /(_[A-Za-z0-9]{1,3}b?_)/; // Matches _CODE_ (e.g., _01a_, _Pr_)
        const trainerSetMatch = remainingFilename.match(trainerSetRegex);

        if (trainerSetMatch && trainerSetMatch[1]) {
            parsed.setCode = trainerSetMatch[1]; // Capture the code exactly as it is (e.g., _01a_)

            // *** Perform lookup using the exact captured code ***
            // Assumes the case in the filename (_01a_) matches the key in setMap ("_01a_")
            parsed.setName = SET_MAP[parsed.setCode] || "Other";

            // For trainers parsed this way, assume not numbered according to the strict format
            parsed.setNumber = null;
            parsed.isNumbered = false;
            setCodeFound = true;
        }

    } else {
        // --- Non-Trainer (e.g., Pokemon) Logic ---
        // Use the original, stricter regex that requires the number/dots part
        const pokemonSetRegex = /(_[A-Za-z0-9]{1,3}b?_)(?:(\d{3})|(\.{3,}))_/;
        const pokemonSetMatch = remainingFilename.match(pokemonSetRegex);

        if (pokemonSetMatch) {
            parsed.setCode = pokemonSetMatch[1]; // Capture the code exactly as it is (e.g., _01b_)

            // *** Perform lookup using the exact captured code ***
            // Assumes the case in the filename (_01b_) matches the key in setMap ("_01b_")
            parsed.setName = SET_MAP[parsed.setCode] || "Other";

            // --- Number Parsing Logic (remains the same) ---
            if (pokemonSetMatch[2]) { // Matched digits (\d{3})
                parsed.setNumber = pokemonSetMatch[2];
                parsed.isNumbered = true;
            } else if (pokemonSetMatch[3]) { // Matched dots (\.{3,})
                parsed.setNumber = '...';
                parsed.isNumbered = false;
            } else {
                 // This case shouldn't be hit if pokemonSetMatch is truthy, but safety first
                parsed.setNumber = null;
                parsed.isNumbered = false;
            }
            // --- End Number Parsing ---
            setCodeFound = true;
        }
    }

    // --- Fallback if NO set code pattern was matched by either method ---
    if (!setCodeFound) {
        parsed.setCode = null; // Good practice to nullify if not found
        parsed.setName = "Other";
        parsed.setNumber = null;
        parsed.isNumbered = false;
    }
    // --- END REVISED LOGIC ---

    // --- Fallback if NO set code pattern was matched by either method ---
    if (!setCodeFound) {
        parsed.setCode = null; // Good practice to nullify if not found
        parsed.setName = "Other";
        parsed.setNumber = null;
        parsed.isNumbered = false;
    }
    // --- END MODIFIED LOGIC ---

    // 7. Pokemon Types (-T-)
    if (!parsed.isTrainer) {
        for (const code in TYPE_MAP) {
            if (remainingFilename.includes(code)) {
                parsed.types.push(TYPE_MAP[code]);
            }
        }
        if (parsed.types.length > 0) { parsed.cardType = 'Pokemon'; }
    }

    // 8. Card Name (-Name-) - Improved Extraction
    // Try to find content between hyphens that isn't a known code
    const nameMatch = remainingFilename.match(/-([^-_\s@][^-@_]*[^-_\s@])-/); // Content between hyphens, not starting/ending with _, not containing @
     if (nameMatch && nameMatch[1]) {
         // Further refine: remove known codes if they are accidentally included within the hyphens
         let potentialName = nameMatch[1];
         const allCodes = [
             ...Object.keys(TYPE_MAP),
             ...Object.keys(TRAINER_TYPE_MAP),
             ...Object.keys(FORTE_MAP),
             ...Object.keys(SET_MAP),
             '-TR-', '_F_'
         ];
         allCodes.forEach(code => {
             potentialName = potentialName.replace(code, '');
         });
         potentialName = potentialName.trim();
         if (potentialName) {
             parsed.cardName = potentialName;
         }
     }

     // Fallback if no hyphenated name found
     if (!parsed.cardName) {
         let fallbackName = remainingFilename;
         // Remove known codes/prefixes/suffixes more aggressively
         if (parsed.dexNumber) fallbackName = fallbackName.replace(`#${parsed.dexNumber.replace(/^0+/, '')}`, '');
         if (parsed.setCode) fallbackName = fallbackName.replace(parsed.setCode, '');
         if (parsed.setNumber) fallbackName = fallbackName.replace(parsed.setNumber + '_', '');
         if (parsed.isForte) fallbackName = fallbackName.replace('_F_', '');
         if (parsed.isTrainer) fallbackName = fallbackName.replace('-TR-', '');
         Object.keys(TYPE_MAP).forEach(code => { fallbackName = fallbackName.replace(code, ''); });
         Object.keys(TRAINER_TYPE_MAP).forEach(code => { fallbackName = fallbackName.replace(code, ''); });
         // Clean up underscores and hyphens
         fallbackName = fallbackName.replace(/_+/g, ' ').replace(/-+/g, ' ').trim();
         if (fallbackName) {
             parsed.cardName = fallbackName;
         } else if (parsed.isTrainer) {
             parsed.cardName = parsed.trainerType || "Trainer"; // Default trainer name
         }
     }


    // Rarity is removed
    parsed.cardRarity = null;

    return parsed;
}


/** Recursively scans directory */
function buildDirectoryStructure(dirPath, rootDir) {
    const absoluteDirPath = path.resolve(dirPath);
    if (!fs.existsSync(absoluteDirPath) || !fs.statSync(absoluteDirPath).isDirectory()) {
        if (absoluteDirPath === path.resolve(rootDir)) { console.error(`❌ FATAL: Root directory '${rootDir}' not found.`); process.exit(1); }
        return null;
    }
    const currentRelativePath = path.relative('.', dirPath).replace(/\\/g, '/');
    const currentName = path.basename(dirPath);
    const children = [];
    try {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
            const currentItemPath = path.join(dirPath, file);
            let stat;
            try { stat = fs.statSync(currentItemPath); }
            catch (statErr) { console.error(`❌ Stats error for ${currentItemPath}:`, statErr.message); return; }
            if (stat.isDirectory()) {
                const subStructure = buildDirectoryStructure(currentItemPath, rootDir);
                if (subStructure) { children.push(subStructure); }
            } else {
                const ext = path.extname(file).toLowerCase();
                if (supportedExtensions.includes(ext)) {
                     const fileRelativePath = path.relative('.', currentItemPath).replace(/\\/g, '/');
                     const filenameWithoutExt = path.basename(file, ext);
                     const parsedData = parseFilenameAdvanced(filenameWithoutExt); // Use new parser
                     children.push({ name: file, type: 'file', path: fileRelativePath, ...parsedData });
                }
            }
        });
    } catch (readErr) { console.error(`❌ Error reading directory ${dirPath}:`, readErr); process.exit(1); }

    children.sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        if (a.type === 'file' && b.type === 'file') {
             const numA = a.isNumbered ? parseInt(a.setNumber || '9999', 10) : Infinity;
             const numB = b.isNumbered ? parseInt(b.setNumber || '9999', 10) : Infinity;
             if (numA !== numB) return numA - numB;
        }
        return a.name.localeCompare(b.name);
    });

    return { name: currentName, type: 'folder', path: currentRelativePath, children };
}

// --- Main Execution ---
try {
    console.log(`\n--- Starting Image Scan ---`);
    const structure = buildDirectoryStructure(imageDirectory, imageDirectory);
    if (!structure) { console.error(`\n❌ Failed to generate structure.`); process.exit(1); }
    console.log(`\n✅ Scan complete.`);

    // Add collected creators to filterConfig before saving
    filterConfig.creators = Array.from(allCreators).sort();
    // Remove rarity config before saving
    delete filterConfig.rarityMap;
    delete filterConfig.rarityOrder;

    const outputObject = { imageStructure: structure, filterConfig: filterConfig };
    let outputString = '';
    try {
        outputString = `// Auto-generated by generate_image_structure.js\nconst ${outputVariableName} = ${JSON.stringify(outputObject, null, 2)};`;
        console.log(`   Data formatted.`);
    } catch (stringifyError) { console.error(`❌ Error stringifying data:`, stringifyError); process.exit(1); }
    try {
        fs.writeFileSync(outputFilePath, outputString, 'utf8');
        console.log(`✅ Data written to: ${path.resolve(outputFilePath)}`);
    } catch (writeError) { console.error(`❌❌❌ ERROR writing file!`, writeError); process.exit(1); }
} catch (error) { console.error("\n❌ Unexpected error:", error); process.exit(1); }


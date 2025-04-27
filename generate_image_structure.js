// generate_image_structure.js
// Purpose: Scan './img', parse filenames, CORRECTLY check for counterparts, generate 'image_data.js'.

const fs = require('fs');
const path = require('path');

// --- Configuration ---
const imageDirectory = './img'; // <<< Make sure this points to your image root
const outputFilePath = './image_data.js'; // <<< Output file path
const outputVariableName = 'imageData'; // Variable name in the output file
const supportedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
const configFilePath = './filter_config.json'; // <<< Path to your config
const BLANK_SUFFIX = '-BL-'; // Suffix for blank versions

// --- Load Filtering Rules ---
let filterConfig;
let TYPE_MAP, TRAINER_TYPE_MAP, SET_MAP, FORTE_MAP;
let allCreators = new Set(); // Keep track of unique creators

try {
    console.log(`Loading filter configuration from: ${configFilePath}`);
    const configFileContent = fs.readFileSync(configFilePath, 'utf8');
    filterConfig = JSON.parse(configFileContent);
    // --- Validation ---
    if (!filterConfig || typeof filterConfig.typeMap !== 'object' ||
        typeof filterConfig.trainerTypeMap !== 'object' || typeof filterConfig.setMap !== 'object' ||
        typeof filterConfig.forteMap !== 'object' || !Array.isArray(filterConfig.typeOrder) ||
        !Array.isArray(filterConfig.trainerTypeOrder) || !Array.isArray(filterConfig.setOrder) ||
        typeof filterConfig.setColors !== 'object') {
        throw new Error("Invalid format in filter_config.json. Check maps/orders/colors.");
    }
    TYPE_MAP = filterConfig.typeMap;
    TRAINER_TYPE_MAP = filterConfig.trainerTypeMap;
    SET_MAP = filterConfig.setMap;
    FORTE_MAP = filterConfig.forteMap || {}; // Default empty object if forteMap might be missing
    console.log("✅ Filter configuration loaded successfully.");

} catch (err) {
    console.error(`❌ FATAL ERROR loading or parsing ${configFilePath}:`, err.message);
    process.exit(1);
}

/** Gets extension from filename */
function getExtension(filename = '') {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot < 1 || lastDot === filename.length - 1) return '';
    return filename.substring(lastDot);
}

// --- REVISED Filename Parser v3 ---
/**
 * Parses complex filename based on defined rules from config.
 * Attempts to handle unusual structures like repeated codes more robustly.
 * @param {string} filename - The filename to parse (without extension).
 * @returns {object} - Object containing parsed properties.
 */
function parseFilenameAdvanced(filename) {
    let workString = filename; // Operate on this copy
    const parsed = {
        dexNumber: null, setCode: null, setName: null, setNumber: null,
        cardName: null, isForte: false, types: [], isTrainer: false,
        trainerType: null, creator: null, isBlank: false, isNumbered: false, // Default isNumbered to false
        cardRarity: null, cardType: 'Unknown' // Default cardType
    };

    // --- Step 1: Extract and Remove known SUFFIXES first ---

    // Creator (@... at END) - Extract and REMOVE
    const creatorMatch = workString.match(/@([a-zA-Z0-9_.-]+)$/);
    if (creatorMatch) {
        parsed.creator = creatorMatch[1];
        allCreators.add(parsed.creator);
        workString = workString.substring(0, workString.lastIndexOf('@')).trim();
    }

    // Blank (-BL- at END of remaining string) - Check and REMOVE
    if (workString.endsWith(BLANK_SUFFIX)) {
        parsed.isBlank = true;
        workString = workString.substring(0, workString.length - BLANK_SUFFIX.length).trim();
    }

    // --- Step 2: Extract known CODES/FLAGS (and remove if unambiguous) ---

    // Forte (_F_) - Check if present
    if (workString.includes('_F_')) {
        parsed.isForte = true;
        // Don't remove yet, might be part of name e.g., -Regirock_F_-
    }

    // --- Step 3: Extract PREFIX codes ---

    // Dex (#... at START) - Extract and REMOVE
    const dexMatch = workString.match(/^#(\d{1,4})\s*/);
    if (dexMatch) {
        parsed.dexNumber = dexMatch[1].padStart(4, '0');
        // IMPORTANT: Remove the matched dex number part from the string
        workString = workString.substring(dexMatch[0].length).trim();
    }

    // --- Step 4: Extract Set and Number (Potentially complex) ---
    // Try matching Pokemon format first: _CODE_NUM_ or _CODE_..._
    // Use a regex that is less strict about the *end* underscore placement
    // Regex needs to be robust to potential extra data like repeated dex/set
    // Let's try a pattern that looks for the code AND number/dots together more explicitly
    const pokemonSetRegex = /(_[A-Za-z0-9]{1,3}b?_)(\d{3}|\.{3,})_?/; // Look for CODE followed immediately by NUM or DOTS
    let setMatch = workString.match(pokemonSetRegex);
    let isPokemonSetFormat = false;

    if (setMatch) { // Pokemon format matched
        isPokemonSetFormat = true;
        parsed.setCode = setMatch[1]; // e.g., _01b_
        parsed.setName = SET_MAP[parsed.setCode] || "Other"; // Lookup name

        if (setMatch[2] && !setMatch[2].startsWith('.')) { // Matched digits \d{3}
            parsed.setNumber = setMatch[2];
            parsed.isNumbered = true;
        } else if (setMatch[2] && setMatch[2].startsWith('.')) { // Matched dots \.{3,}
            parsed.setNumber = '...';
            parsed.isNumbered = false;
        }
        // Remove the matched part (code and number/dots)
        workString = workString.replace(setMatch[0], '').trim();
    } else {
        // Try Trainer format (_CODE_) - look for it specifically
        const trainerSetRegex = /(_[A-Za-z0-9]{1,3}b?_)/;
        setMatch = workString.match(trainerSetRegex);
        if (setMatch) {
            // Check if this code is actually in the SET_MAP before assigning
            if (SET_MAP[setMatch[0]]) {
                parsed.setCode = setMatch[0]; // Includes underscores
                parsed.setName = SET_MAP[parsed.setCode]; // Use map value
                parsed.isNumbered = false;
                workString = workString.replace(setMatch[0], '').trim(); // Remove matched part
            } else {
                 // Found a _CODE_ pattern but it's not a known set code
                 parsed.setName = "Other";
            }
        } else {
            // No set found
            parsed.setName = "Other";
            parsed.isNumbered = false;
        }
    }

     // --- Step 5: Extract Trainer/Type Codes (and remove) ---
     // Trainer (-TR-) - Check and set type, remove flag
     if (workString.includes('-TR-')) {
         parsed.isTrainer = true;
         parsed.cardType = 'Trainer';
         workString = workString.replace('-TR-', '').trim();
         // Now look for trainer type codes
         let foundTT = false;
         for (const code in TRAINER_TYPE_MAP) {
             if (code !== '-XX-' && workString.includes(code)) {
                 parsed.trainerType = TRAINER_TYPE_MAP[code];
                 workString = workString.replace(code, '').trim(); // Remove code
                 foundTT = true; break;
             }
         }
         if (!foundTT && TRAINER_TYPE_MAP['-XX-'] && workString.includes('-XX-')) {
              parsed.trainerType = TRAINER_TYPE_MAP['-XX-'];
              workString = workString.replace('-XX-','').trim();
         }
         if (!parsed.trainerType) parsed.trainerType = 'Unknown Trainer';
     }

    // Pokemon Types (-T-) - Extract all found types and remove codes
    const foundTypes = [];
     if (!parsed.isTrainer) { // Only for Pokemon
         for (const code in TYPE_MAP) {
             const regex = new RegExp(code.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'g'); // Escape regex chars
             if (workString.match(regex)) { // Check if code exists
                 foundTypes.push(TYPE_MAP[code]);
                 workString = workString.replace(regex, '').trim(); // Remove ALL instances
             }
         }
         if (foundTypes.length > 0) {
             parsed.types = foundTypes;
             parsed.cardType = 'Pokemon';
         }
     }

    // --- Step 6: Extract Card Name ---
    // Remove leftover known flags/codes that might interfere
    if (parsed.isForte) workString = workString.replace('_F_', '').trim();
    // Remove potential repeated dex/set codes if they appear strangely
    if (parsed.dexNumber) workString = workString.replace(`#${parsed.dexNumber.replace(/^0+/, '')}`, '').trim();
    // Don't remove setCode here as it might be part of the name if parsing failed earlier

    // Clean up extra spaces/delimiters aggressively
    workString = workString.replace(/_+/g, ' ').replace(/-+/g, ' ').replace(/\s+/g, ' ').trim();

    // Assume the longest remaining segment is the name
    parsed.cardName = workString || null;


    // Final Name & Type Fallbacks
    if (!parsed.cardName) {
        if (parsed.cardType === 'Pokemon') parsed.cardName = "Unknown Pokemon";
        else if (parsed.cardType === 'Trainer') parsed.cardName = parsed.trainerType || "Trainer";
        else if (parsed.cardType === 'Energy') parsed.cardName = "Energy";
        else parsed.cardName = "Unknown Card";
    }
     if (parsed.cardType === 'Unknown') { // Final type check
         if (parsed.cardName.toLowerCase().includes('energy') && parsed.types.length === 0 && !parsed.isTrainer) parsed.cardType = 'Energy';
         // If still unknown and not trainer/energy, default to Pokemon
         else if (!parsed.isTrainer && parsed.cardType === 'Unknown') parsed.cardType = 'Pokemon';
     }

    return parsed;
}


/** Recursively scans directory and returns flat list of file objects */
function getAllFiles(dirPath, rootDir, fileList = []) {
    const absoluteDirPath = path.resolve(dirPath);
    if (!fs.existsSync(absoluteDirPath) || !fs.statSync(absoluteDirPath).isDirectory()) {
        if (absoluteDirPath === path.resolve(rootDir)) { console.error(`❌ Root directory '${rootDir}' not found.`); return null; }
        return fileList;
    }
    try {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
            const currentItemPath = path.join(dirPath, file);
            let stat;
            try { stat = fs.statSync(currentItemPath); }
            catch (statErr) { console.warn(`⚠️ Stats error for ${currentItemPath}: ${statErr.message}. Skipping.`); return; }

            if (stat.isDirectory()) {
                getAllFiles(currentItemPath, rootDir, fileList); // Recurse
            } else {
                const ext = path.extname(file).toLowerCase();
                if (supportedExtensions.includes(ext)) {
                    const fileRelativePath = path.relative('.', currentItemPath).replace(/\\/g, '/');
                    const filenameWithoutExt = path.basename(file, ext);
                    try {
                        const parsedData = parseFilenameAdvanced(filenameWithoutExt); // Use revised parser
                        fileList.push({
                            name: file, // Original filename with ext
                            type: 'file',
                            path: fileRelativePath,
                            ...parsedData // Spread parsed properties
                        });
                    } catch (parseError) {
                        console.warn(`⚠️ Error parsing filename "${file}": ${parseError.message}. Skipping.`);
                    }
                }
            }
        });
    } catch (readErr) { console.error(`❌ Error reading directory ${dirPath}:`, readErr); return null; }
    return fileList;
}

/** Builds the nested directory structure */
function buildDirectoryStructure(dirPath, rootDir) {
     const absoluteDirPath = path.resolve(dirPath);
     if (!fs.existsSync(absoluteDirPath) || !fs.statSync(absoluteDirPath).isDirectory()) {
         if (absoluteDirPath === path.resolve(rootDir)) { console.error(`❌ Root directory '${rootDir}' not found.`); return null; }
         return null;
     }
     const currentRelativePath = path.relative('.', dirPath).replace(/\\/g, '/');
     // Handle root directory naming correctly (use config name or default)
     const currentName = (currentRelativePath === imageDirectory.replace('./','')) ? (filterConfig.rootDisplayName || 'Root') : path.basename(dirPath);
     const children = [];
     try {
         const files = fs.readdirSync(dirPath);
         files.forEach(file => {
             const currentItemPath = path.join(dirPath, file);
             let stat;
             try { stat = fs.statSync(currentItemPath); } catch (statErr) { console.warn(`⚠️ Stats error for ${currentItemPath}: ${statErr.message}. Skipping child.`); return; }
             if (stat.isDirectory()) {
                 const subStructure = buildDirectoryStructure(currentItemPath, rootDir);
                 if (subStructure) children.push(subStructure);
             } // Files added later
         });
     } catch (readErr) { console.error(`❌ Error reading directory ${dirPath}:`, readErr); return null; }
     children.sort((a, b) => a.name.localeCompare(b.name)); // Sort folders
     return { name: currentName, type: 'folder', path: currentRelativePath, children };
 }


// --- Main Execution ---
try {
    console.log(`\n--- Starting Image Scan in '${path.resolve(imageDirectory)}' ---`);
    // 1. Get flat list
    const allFilesFlat = getAllFiles(imageDirectory, imageDirectory);
    if (allFilesFlat === null) throw new Error(`Failed to read files.`);
    console.log(`\n🔎 Found ${allFilesFlat.length} image files.`);

    // 2. Create Set of existing paths
    const existingPaths = new Set(allFilesFlat.map(f => f.path));

    // 3. Post-processing: Add CORRECTED counterpart information v3
    console.log(`\n⚙️ Checking for normal/blank counterparts (v3)...`);
    allFilesFlat.forEach(fileObject => {
        const originalNameWithExt = fileObject.name;
        const ext = getExtension(originalNameWithExt);
        const dir = path.dirname(fileObject.path);
        const nameWithoutExt = originalNameWithExt.substring(0, originalNameWithExt.length - ext.length);

        // Isolate creator tag first
        let baseNameNoCreator = nameWithoutExt;
        let creatorTag = '';
        const creatorMatch = nameWithoutExt.match(/(@[a-zA-Z0-9_.-]+)$/);
        if (creatorMatch) {
            creatorTag = creatorMatch[0]; // Includes '@'
            baseNameNoCreator = nameWithoutExt.substring(0, nameWithoutExt.length - creatorTag.length).trim();
        }

        let potentialNormalPath, potentialBlankPath;
        let hasNormal = false, hasBlank = false;
        // Determine if the current file (after removing creator) ends with -BL-
        const isCurrentFileBlank = baseNameNoCreator.endsWith(BLANK_SUFFIX);
        fileObject.isBlank = isCurrentFileBlank; // Ensure object property matches

        // Determine the base name WITHOUT the -BL- suffix
        const baseNameNoSuffix = isCurrentFileBlank
            ? baseNameNoCreator.substring(0, baseNameNoCreator.length - BLANK_SUFFIX.length).trim()
            : baseNameNoCreator;

        // Construct the potential paths INCLUDING the creator tag at the end
        potentialNormalPath = path.join(dir, baseNameNoSuffix + creatorTag + ext).replace(/\\/g, '/');
        potentialBlankPath = path.join(dir, baseNameNoSuffix + BLANK_SUFFIX + creatorTag + ext).replace(/\\/g, '/');

        // Check existence in the Set
        hasNormal = existingPaths.has(potentialNormalPath);
        hasBlank = existingPaths.has(potentialBlankPath);

        // Assign flags and paths
        fileObject.hasNormalCounterpart = hasNormal;
        fileObject.normalCounterpartPath = hasNormal ? potentialNormalPath : null;
        fileObject.hasBlankCounterpart = hasBlank;
        fileObject.blankCounterpartPath = hasBlank ? potentialBlankPath : null;

        // Debug log for specific files if needed
        // if (originalNameWithExt.includes("Wailord") || originalNameWithExt.includes("Arcanine")) {
        //     console.log(`--- FINAL for ${originalNameWithExt}: isBlank=${fileObject.isBlank}, hasNormal=${hasNormal}, normalPath=${fileObject.normalCounterpartPath}, hasBlank=${hasBlank}, blankPath=${fileObject.blankCounterpartPath}`);
        // }
    });
    console.log(`✅ Counterpart check complete (v3).`);

    // 4. Build nested structure and add processed files
    console.log(`\n🏗️ Building nested directory structure...`);
    const rootStructure = buildDirectoryStructure(imageDirectory, imageDirectory);
    if (!rootStructure) throw new Error("Failed to build base directory structure.");

    // Function to add files recursively
    function addFilesToStructure(folderNode, filesMap) {
        const folderPath = folderNode.path;
        filesMap.forEach((file, filePath) => {
            if (path.dirname(filePath) === folderPath) {
                folderNode.children.push(file);
                filesMap.delete(filePath);
            }
        });
        folderNode.children.filter(child => child.type === 'folder').forEach(subFolder => {
            addFilesToStructure(subFolder, filesMap);
        });
        // Sort children: folders first, then files by number/name
        folderNode.children.sort((a, b) => {
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;
            if (a.type === 'file' && b.type === 'file') {
                const numA = a.isNumbered ? parseInt(a.setNumber || '9999', 10) : Infinity;
                const numB = b.isNumbered ? parseInt(b.setNumber || '9999', 10) : Infinity;
                if (numA !== numB) return numA - numB;
            }
            return a.name.localeCompare(b.name);
        });
    }
    const filesToAddMap = new Map(allFilesFlat.map(f => [f.path, f]));
    addFilesToStructure(rootStructure, filesToAddMap);
    console.log(`✅ Nested structure built.`);

    // 5. Prepare final output object
    filterConfig.creators = Array.from(allCreators).sort();
    delete filterConfig.rarityMap; delete filterConfig.rarityOrder;
    const outputObject = { imageStructure: rootStructure, filterConfig: filterConfig };

    // 6. Write to file
    console.log(`\n💾 Writing data to ${outputFilePath}...`);
    const outputString = `// Auto-generated by generate_image_structure.js on ${new Date().toISOString()}\nconst ${outputVariableName} = ${JSON.stringify(outputObject, null, 2)};`;
    fs.writeFileSync(outputFilePath, outputString, 'utf8');
    console.log(`✅ Data successfully written to: ${path.resolve(outputFilePath)}`);

} catch (error) {
    console.error("\n❌ An unexpected error occurred:", error);
    process.exit(1);
}
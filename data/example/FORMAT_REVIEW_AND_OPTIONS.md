# WebP Migration & Deck Export Format Review

## Current State Analysis

### 1. **Current Image Storage**
- **Format**: PNG files stored in `img/approved/` subdirectories
- **URLs**: GitHub raw URLs pointing to PNG files
- **Size**: PNGs are large, slowing down loading/rendering

### 2. **Existing Formats**

#### **Set Format (pf1.json)**
```json
{
  "id": "misc-013",
  "name": "Magmortar Forte",
  "images": {
    "small": "https://raw.githubusercontent.com/.../misc-013.png",
    "large": "https://raw.githubusercontent.com/.../misc-013.png"
  }
}
```

#### **Deck CSV Format (gardevoir_gallade.csv)**
```csv
QTY,Name,Type,URL
2,Flabébé,Pokémon,https://raw.githubusercontent.com/.../misc-093.png
```

#### **CompileSet WebP Format**
```json
{
  "id": "PFE-007",
  "name": "Basic [D] Energy",
  "images": {
    "small": "https://...",
    "large": "https://..."
  },
  "imageDataWebP": "data:image/webp;base64,UklGRiQCAABXRUJQ..."
}
```

---

## Proposed Solutions

### **Option 1: Dual Format with Fallback (RECOMMENDED)**
- Keep PNG URLs in `images.small` and `images.large` (backward compatibility)
- Add new `imagesWebP` object with WebP URLs
- Add optional `imageDataWebP` field for embedded base64 WebP (future-proofing)

**Pros:**
- Backward compatible
- Progressive enhancement
- Users can still use PNG URLs externally
- WebP loads in your viewer for speed

**Cons:**
- Slightly larger JSON files (but worth it for compatibility)

---

### **Option 2: Standard Deck CSV + Experimental .mtcg JSON (RECOMMENDED FOR DECKS)**

#### **Standard CSV Export (backward compatible)**
```csv
QTY,Name,Type,URL
2,Gardevoir Forte,Pokémon,https://raw.githubusercontent.com/.../misc-091.png
```
- **Limitation**: CSV can't embed base64 data (commas in base64 would break parsing)
- CSV could have a 5th column for WebP URL, but not embedded data

#### **New .mtcg JSON Export (experimental, future-proof)**
```json
{
  "_format": "mtcg-deck",
  "_version": "1.0-beta",
  "_experimental": true,
  "_note": "This format includes embedded WebP images. Not compatible with standard deck viewers yet.",
  "timestamp": 1760568670604,
  "deckName": "Gardevoir/Gallade Control",
  "cards": [
    {
      "qty": 2,
      "id": "misc-091",
      "name": "Gardevoir Forte",
      "type": "Pokémon",
      "images": {
        "png": "https://raw.githubusercontent.com/.../misc-091.png",
        "webp": "https://raw.githubusercontent.com/.../misc-091.webp",
        "webpData": "data:image/webp;base64,..."
      }
    }
  ]
}
```

**Pros:**
- Can include all data (URLs + embedded WebP)
- Extensible for future features
- Works great in your ecosystem

**Cons:**
- New format won't work in other deck viewers (yet)
- Need to maintain both CSV and .mtcg exports

---

### **Option 3: CSV with WebP URLs (middle ground)**
```csv
QTY,Name,Type,PNG_URL,WEBP_URL
2,Gardevoir Forte,Pokémon,https://.../misc-091.png,https://.../misc-091.webp
```

**Pros:**
- Still CSV format
- Includes both PNG and WebP URLs
- Can be opened in Excel/Google Sheets

**Cons:**
- Can't embed base64 data
- Breaking change for existing CSV parsers

---

## Recommended Implementation Plan

### **Phase 1: WebP Migration**
1. Batch convert all PNGs to WebP (keep originals)
2. Store WebP files alongside PNGs: `img/approved/misc/misc-013.webp`
3. Update JSON structure to include both:
   ```json
   "images": {
     "small": "https://.../misc-013.png",
     "large": "https://.../misc-013.png"
   },
   "imagesWebP": {
     "small": "https://.../misc-013.webp",
     "large": "https://.../misc-013.webp"
   }
   ```

### **Phase 2: Viewer Update**
1. Update gallery/preview to prioritize WebP URLs
2. Fallback to PNG if WebP fails to load
3. Use WebP for thumbnails/previews
4. Use PNG as backup for compatibility

### **Phase 3: Deck Export Features**
1. Add app drawer (like CompileSet.html)
2. Export options:
   - **Standard CSV**: QTY, Name, Type, PNG_URL (for compatibility)
   - **Enhanced CSV**: QTY, Name, Type, PNG_URL, WEBP_URL
   - **MTCG JSON** (experimental): Full data + embedded WebP

### **Phase 4: Future-Proofing**
1. Optional `imageDataWebP` field for offline/embedded use
2. Lazy loading WebP data on demand
3. Build import/export tools for .mtcg format

---

## CSV vs MTCG Trade-offs

### **CSV Advantages:**
- Universal compatibility
- Excel/Google Sheets support
- Lightweight text format
- Easy manual editing

### **CSV Limitations:**
- Can't embed base64 data (commas break parsing)
- Limited to simple key-value structure
- Can't nest objects

### **MTCG JSON Advantages:**
- Can embed WebP data
- Rich metadata support
- Nested structures
- Future extensibility

### **MTCG JSON Limitations:**
- New format (no external support yet)
- Larger file sizes if embedding images

---

## Recommended Final Structure

### **For Sets (pf1.json)**
```json
{
  "id": "misc-013",
  "name": "Magmortar Forte",
  "images": {
    "small": "https://.../misc-013.png",
    "large": "https://.../misc-013.png"
  },
  "imagesWebP": {
    "small": "https://.../misc-013.webp",
    "large": "https://.../misc-013.webp"
  },
  "imageDataWebP": "data:image/webp;base64,..." // Optional, for offline use
}
```

### **For Deck CSV (standard)**
```csv
QTY,Name,Type,URL
2,Gardevoir Forte,Pokémon,https://.../misc-091.png
```

### **For Deck CSV (enhanced, optional)**
```csv
QTY,Name,Type,PNG_URL,WEBP_URL
2,Gardevoir Forte,Pokémon,https://.../misc-091.png,https://.../misc-091.webp
```

### **For Deck MTCG (experimental)**
See test file: `deck-format-mtcg-example.json`

---

## Test Files Created

I've created test files showing each format option:

1. **`test-set-webp-dual-format.json`** - Set format with PNG + WebP URLs + embedded WebP
2. **`test-deck-csv-standard.csv`** - Standard CSV (backward compatible)
3. **`test-deck-csv-enhanced.csv`** - Enhanced CSV with both PNG and WebP URLs
4. **`test-deck-mtcg-experimental.mtcg`** - New MTCG JSON format with full metadata + embedded WebP

---

## ✅ RECOMMENDED APPROACH

### **For Sets (pf1.json, etc.)**
**Use Dual Format Strategy:**
- Keep `images.small`/`images.large` with PNG URLs (backward compatibility)
- Add `imagesWebP.small`/`imagesWebP.large` with WebP URLs (performance)
- Optionally include `imageDataWebP` for offline/embedded use (future-proofing)

**Viewer Logic:**
1. Try to load from `imagesWebP` URLs first (fast)
2. Fallback to `images` PNG URLs if WebP fails
3. Fallback to `imageDataWebP` base64 if both URLs fail
4. This gives best performance + maximum compatibility

---

### **For Deck Exports**
**Offer THREE export options in app drawer:**

#### Option 1: Standard CSV (Default)
- Format: `QTY,Name,Type,URL`
- Uses PNG URLs for maximum compatibility
- Works with all existing deck viewers/tools
- **Use case:** Sharing decks with others

#### Option 2: Enhanced CSV
- Format: `QTY,Name,Type,PNG_URL,WEBP_URL`
- Includes both PNG and WebP URLs
- Still CSV format (Excel/Sheets compatible)
- Can't embed base64 data (CSV limitation)
- **Use case:** Users who want WebP benefits but need CSV

#### Option 3: MTCG JSON (Beta)
- New `.mtcg` file extension
- Includes full metadata + embedded WebP
- Future-proof format for your ecosystem
- Add warning: "Experimental - not compatible with other deck viewers yet"
- **Use case:** Power users, offline decks, archiving

---

### **CSV Base64 Limitation - ANSWER**

**Q: Can we add image data to CSV format?**

**A: No, it's not feasible for these reasons:**

1. **Comma Problem**: Base64 strings don't contain commas, BUT the `data:image/webp;base64,` prefix does
2. **Escaping Hell**: You'd need to quote the entire field, making CSV messy
3. **File Size**: Base64 WebP images are 50-100KB each. A 60-card deck would be 3-6MB CSV file
4. **Readability**: CSV becomes unreadable with giant base64 strings
5. **Excel Limits**: Excel has cell size limits (~32K characters)

**Example of the problem:**
```csv
QTY,Name,Type,IMAGE_DATA
2,Gardevoir,"Pokémon","data:image/webp;base64,UklGRh5WAABXRUJQVl..." ❌ Comma breaks parsing
2,Gardevoir,Pokémon,"data:image/webp;base64,UklGRh5WAABXRUJQVl..." ❌ Quotes are messy
```

**This is why .mtcg JSON format is necessary for embedded images.**

---

## Implementation Priority

### Phase 1: WebP Migration (Week 1)
1. ✅ Batch convert all PNG to WebP (quality 85%)
2. ✅ Keep PNGs in place (don't delete)
3. ✅ Upload WebP files alongside PNGs
4. ✅ Update set JSON files with dual format

### Phase 2: Viewer Updates (Week 1-2)
1. ✅ Update image loading to prioritize WebP
2. ✅ Add fallback logic (WebP → PNG → embedded)
3. ✅ Test loading performance
4. ✅ Update preview/thumbnail logic

### Phase 3: Deck Export (Week 2)
1. ✅ Create app drawer UI (based on CompileSet.html)
2. ✅ Implement 3 export options (Standard CSV, Enhanced CSV, MTCG JSON)
3. ✅ Add export controls and warnings
4. ✅ Test all export formats

### Phase 4: Documentation (Week 2)
1. ✅ Update changelog
2. ✅ Document .mtcg format
3. ✅ Add export guide for users
4. ✅ Create debug screen for format testing

---

## File Size Comparison

**PNG vs WebP for typical card (745×1040):**
- PNG: ~150-250 KB
- WebP (quality 85): ~40-70 KB
- **Savings: 60-70% reduction**

**Set JSON file size:**
- Current (PNG URLs only): ~500 KB for 100 cards
- Dual format (PNG + WebP URLs): ~550 KB for 100 cards (+10%)
- With embedded WebP: ~5-7 MB for 100 cards (not recommended for sets)

**Deck exports:**
- Standard CSV: ~2-3 KB
- Enhanced CSV: ~3-4 KB
- MTCG JSON (no embedded): ~10-15 KB
- MTCG JSON (with embedded): ~3-6 MB (60 cards)

---

## Next Steps

1. **Review test files** - Check `test-set-webp-dual-format.json` and `.mtcg` format
2. **Approve approach** - Confirm dual format strategy
3. **Start batch conversion** - Convert existing PNGs to WebP
4. **Update viewer** - Implement WebP loading with fallbacks
5. **Build deck exporter** - Create app drawer with 3 export options


# CSV Format Test Results

**Date:** October 17, 2025  
**Tested By:** System Testing  
**Purpose:** Determine which CSV format works best for deck exports

---

## Test Results

### ✅ Standard CSV Format - **WORKS**
```csv
QTY,Name,Type,URL
2,Gardevoir Forte,Pokémon,https://.../misc-091.png
```

**Status:** ✅ **APPROVED FOR PRODUCTION**

**Compatibility:**
- ✅ Excel
- ✅ Google Sheets
- ✅ All deck viewers
- ✅ CSV parsers

**Use Case:** Default export format for maximum compatibility

---

### ❌ Enhanced CSV Format - **DOESN'T WORK AS EXPECTED**
```csv
QTY,Name,Type,PNG_URL,WEBP_URL
2,Gardevoir Forte,Pokémon,https://.../misc-091.png,https://.../misc-091.webp
```

**Status:** ❌ **GRAYED OUT / FUTURE FEATURE**

**Issues:**
- May not be recognized by existing deck viewers
- Extra column confuses some parsers
- No immediate benefit until WebP URLs are deployed

**Decision:** Keep as placeholder for future implementation after WebP migration is complete

---

### 🔄 MTCG JSON Format - **FUTURE FEATURE**
```json
{
  "_format": "mtcg-deck",
  "cards": [...]
}
```

**Status:** 🔄 **GRAYED OUT / EXPERIMENTAL**

**Notes:**
- Requires new file format
- Not compatible with existing tools
- Useful for embedded WebP and metadata
- Implement after WebP migration

**Decision:** Keep as placeholder, implement in Phase 2

---

## Production Decision

**Implement Standard CSV ONLY for now:**
- Simple, reliable, universally compatible
- 4 columns: QTY, Name, Type, URL
- Works with all existing deck tools
- Gray out Enhanced CSV and MTCG JSON options with "Coming Soon" labels

---

## Deck Export Requirements

### Card Count Validation

| Card Count | Color | Export Allowed | Message |
|------------|-------|----------------|---------|
| < 40 | 🔴 Red | ❌ No | "Deck must have at least 40 cards" |
| 40-59 | 🟠 Orange | ✅ Yes | "⚠️ Warning: Deck size below standard 60" |
| 60 | 🟢 Green | ✅ Yes | "✅ Standard deck size" |
| 61+ | 🔴 Red | ❌ No | "Deck cannot exceed 60 cards" |

### Export Features
- Deck naming on export
- Quantity selector for each card
- Drag-and-drop card addition
- Remove card from deck
- Clear all deck
- Live card count with validation

---

## Implementation Notes

**Phase 1: Current Implementation**
- ✅ Standard CSV export only
- ✅ Card count validation (40-60 range)
- ✅ Deck naming
- ✅ Quantity selectors
- 🔲 Enhanced CSV (grayed out placeholder)
- 🔲 MTCG JSON (grayed out placeholder)

**Phase 2: After WebP Migration**
- Enable Enhanced CSV option
- Enable MTCG JSON option
- Add embedded WebP support

---

**Last Updated:** October 17, 2025  
**Status:** Standard CSV approved for production use


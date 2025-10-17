# 📦 Deck Builder & Export Guide

## Overview

The Deck Builder allows you to create custom card decks and export them as CSV files. It features a modern left-side drawer interface with drag-and-drop functionality.

---

## Features

### ✨ Adding Cards to Deck

**Two ways to add cards:**

1. **Click the + Button**
   - Hover over any card preview in the gallery
   - A blue "+" button appears at the bottom center of the card
   - Click to add the card to your deck

2. **Drag and Drop**
   - Click and drag any card from the gallery
   - Drop it onto the deck list area
   - Card is automatically added to your deck

### 📊 Card Quantity Management

- **Increment/Decrement:** Use the + and − buttons
- **Direct Input:** Type a number (1-4) in the quantity field
- **Maximum:** 4 copies per card (standard TCG limit)
- **Auto-sort:** Cards sorted by type (Pokémon → Trainer → Energy)

### 🎯 Deck Size Validation

| Card Count | Status | Export | Message |
|------------|--------|--------|---------|
| **0-39** | 🔴 Red | ❌ Blocked | "Deck must have at least 40 cards" |
| **40-59** | 🟠 Orange | ✅ Allowed | "⚠️ Warning: Deck size below standard 60" |
| **60** | 🟢 Green | ✅ Allowed | "✅ Standard deck size" |
| **61+** | 🔴 Red | ❌ Blocked | "Deck cannot exceed 60 cards" |

**Live Feedback:** Deck count and validation status update in real-time

---

## Using the Deck Builder

### 1. Open the Deck Drawer

- The drawer opens automatically on the left side
- Use the toggle button (◀/▶) to collapse/expand
- Collapsed drawer stays accessible as a thin bar

### 2. Name Your Deck

- Enter a deck name in the "Deck Name" field
- Default: "My Awesome Deck"
- Filename will be auto-generated (e.g., `my_awesome_deck.csv`)

### 3. Build Your Deck

- Add 40-60 cards using + button or drag-and-drop
- Adjust quantities using +/− buttons or direct input
- Remove cards with the × button
- Clear entire deck with "🗑️ Clear" button (confirmation required)

### 4. Export Your Deck

**Export Options:**

- ✅ **Standard CSV** (Active)
  - Format: `QTY,Name,Type,URL`
  - Compatible with all deck viewers
  - File size: ~2-3 KB

- 🔲 **Enhanced CSV** (Coming Soon)
  - Will include PNG + WebP URLs
  - Available after WebP migration

- 🔲 **MTCG JSON** (Experimental)
  - Will include embedded images
  - Experimental format for offline use

**To Export:**

1. Build a valid deck (40-60 cards)
2. Enter a deck name
3. Click "📥 Export Deck" button
4. CSV file downloads automatically

---

## Export Format

### Standard CSV Structure

```csv
QTY,Name,Type,URL
2,Gardevoir Forte,Pokémon,https://raw.githubusercontent.com/.../misc-091.png
4,Ralts,Pokémon,https://raw.githubusercontent.com/.../misc-089.png
8,Basic [Y] Energy,Energy,https://raw.githubusercontent.com/.../PFE-009.png
3,Ultra Ball,Trainer,https://raw.githubusercontent.com/.../misc-118.png
```

### CSV Fields

| Field | Description | Example |
|-------|-------------|---------|
| **QTY** | Number of copies (1-4) | `2` |
| **Name** | Card name | `Gardevoir Forte` |
| **Type** | Card supertype | `Pokémon`, `Trainer`, `Energy` |
| **URL** | Image URL (PNG) | `https://.../misc-091.png` |

---

## Keyboard Shortcuts & Tips

### Tips

- **Fast Adding:** Click + button multiple times to add up to 4 copies
- **Quick Remove:** Set quantity to 0 or click × button
- **Batch Building:** Drag multiple cards in succession
- **Visual Feedback:** Watch for green success/red error animations
- **Auto-save:** Deck persists in browser session (until refresh)

### Best Practices

1. **Name before export:** Give your deck a meaningful name
2. **Check validation:** Ensure deck is green (60) or orange (40-59)
3. **Review composition:** Check Pokémon/Trainer/Energy balance
4. **Export early:** Export backups as you build

---

## Deck Building Strategy

### Standard Deck Composition

| Type | Recommended Count | Purpose |
|------|------------------|---------|
| **Pokémon** | 12-20 cards | Attackers and bench support |
| **Trainer** | 20-30 cards | Items, supporters, stadiums |
| **Energy** | 10-20 cards | Basic and special energy |

**Total:** 60 cards (standard competitive format)

### Common Ratios

- **Evolution Lines:** 4-4-4 (Basic → Stage 1 → Stage 2)
- **Key Supporters:** 2-4 copies for consistency
- **Tech Cards:** 1-2 copies for specific matchups
- **Energy Type:** 8-12 of primary type, 2-4 of secondary

---

## Troubleshooting

### "Export button is disabled"

**Cause:** Deck size is invalid (< 40 or > 60 cards)

**Solution:** 
- Check card count display
- Add cards if under 40
- Remove cards if over 60

### "Cards not appearing in deck"

**Cause:** Drag-and-drop may have failed

**Solution:**
- Try using + button instead
- Refresh page if issue persists
- Check browser console for errors

### "CSV file won't download"

**Cause:** Browser may be blocking downloads

**Solution:**
- Allow downloads in browser settings
- Check browser's download manager
- Try a different browser

### "+ button not visible on cards"

**Cause:** Cards still loading or CSS not applied

**Solution:**
- Wait for gallery to fully load
- Hover over cards to trigger visibility
- Refresh page if needed

---

## Technical Details

### Files

- **Script:** `js/deck-exporter.js`
- **Styles:** `assets/css/deck-exporter.css`
- **Changelog:** v2.7 in `js/changelogData.js`

### Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ Drag-and-drop may vary by browser

### Data Storage

- Deck data stored in memory (not persisted)
- Export to CSV for permanent storage
- Deck cleared on page refresh

---

## Future Features (Coming Soon)

### Enhanced CSV Export
- PNG + WebP URLs in single file
- Smaller file sizes with WebP
- Available after WebP migration

### MTCG JSON Export
- Embedded WebP images (offline decks)
- Full card metadata
- Deck statistics and analysis
- Experimental format for advanced users

### Deck Management
- Save multiple decks to browser storage
- Load previously built decks
- Deck import from CSV
- Deck validation and suggestions

---

## Examples

### Example 1: Simple Deck Export

1. Add 4× Ralts
2. Add 4× Kirlia
3. Add 2× Gardevoir Forte
4. Add 10× Trainer cards
5. Add 8× Basic [Y] Energy
6. Name: "Gardevoir Control"
7. Export → `gardevoir_control.csv`

### Example 2: Maximum Flexibility

1. Build 40-card deck for testing
2. Orange warning appears but export works
3. Add cards up to 60 for competitive play
4. Green success indicator activates
5. Export final version

---

## Support

**Issues?** Check:
1. Browser console (F12) for errors
2. Card data is loading properly
3. Deck drawer is visible (toggle if needed)
4. Export button is not disabled

**Feature Requests:** Document in changelog or create a note

---

**Happy Deck Building! 🎴**


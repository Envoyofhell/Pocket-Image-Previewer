# Deck Exporter Debugging Guide

## Common Issues & Solutions

### Issue 1: Blank Page / Images Not Showing

**Symptoms:**
- Page loads but no cards visible
- Console shows `ERR_CERT_VERIFIER_CHANGED` errors
- Tabs work but gallery is empty

**Causes:**
1. **GitHub Certificate Error:** `ERR_CERT_VERIFIER_CHANGED` is a network/SSL issue
2. **Gallery Layout Broken:** Wrapper CSS conflicts with grid display
3. **Missing item-gallery:** Element moved incorrectly

**Solutions:**

**A. GitHub Certificate Error (External):**
- This is a GitHub/network issue, not your code
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Try different network/VPN
- Wait a few minutes and retry

**B. Gallery Layout Fix:**
```javascript
// Check in console:
document.getElementById('item-gallery')           // Should exist
document.querySelector('.gallery-content-wrapper') // Should exist
document.querySelectorAll('.thumbnail').length    // Should be > 0
```

**C. CSS Override:**
```css
/* Ensure these are in deck-exporter.css */
.gallery-content-wrapper #item-gallery {
    display: grid !important;
    width: 100%;
}
```

---

### Issue 2: Tabs Not Switching

**Symptoms:**
- Clicking tabs doesn't change view
- Gallery doesn't scroll
- Filter doesn't update

**Cause:**
- ForteGallery.scrollToTop() references wrong container

**Solution:**
```javascript
// In deck-exporter.js:
if (window.ForteGallery) {
    window.ForteGallery.galleryScrollContainer = galleryContent;
}

// In gallery.js:
scrollToTop() {
    if (this.galleryScrollContainer) {
        this.galleryScrollContainer.scrollTop = 0;
    }
}
```

---

### Issue 3: Deck Not Persisting

**Symptoms:**
- Build deck
- Refresh page
- Deck is empty

**Solution:**
- Check localStorage: `localStorage.getItem('forteDeckBuilderState')`
- Should return JSON string
- If null, deck state isn't saving

**Debug:**
```javascript
// In console:
window.DeckExporter.getDeck()           // Check current deck
localStorage.getItem('forteDeckBuilderState') // Check saved deck
```

---

### Issue 4: + Button Not Appearing

**Symptoms:**
- Hover over cards, no + button
- Can't add cards to deck

**Causes:**
1. Mutation observer not running
2. Wrong element selector
3. CSS opacity: 0 not changing

**Debug in Console:**
```javascript
document.querySelectorAll('.thumbnail').length           // Should be > 0
document.querySelectorAll('.card-add-to-deck-btn').length // Should match thumbnails
```

**Solution:**
- Ensure `attachCardPlusButtons()` runs after gallery loads
- Check CSS: `.thumbnail:hover .card-add-to-deck-btn { opacity: 1; }`

---

### Issue 5: Drag & Drop Not Working

**Symptoms:**
- Can drag cards but drop doesn't work
- No feedback when dropping

**Debug:**
```javascript
// Check in console during drag:
// Should see: "[Deck Exporter] Drag started: CardName"
// Should see: "[Deck Exporter] Card dropped: CardName"
```

**Solution:**
- Ensure `setupDragAndDrop()` runs
- Check deck list has event listeners:
  - `dragover`
  - `drop`
  - `dragleave`

---

## Browser Console Debugging

### Check Gallery Setup
```javascript
// Run in console:
console.log('Gallery Area:', document.querySelector('.app-gallery-area'));
console.log('Gallery Wrapper:', document.querySelector('.gallery-content-wrapper'));
console.log('Item Gallery:', document.getElementById('item-gallery'));
console.log('Thumbnails:', document.querySelectorAll('.thumbnail').length);
console.log('Deck Drawer:', document.getElementById('deck-drawer'));
```

### Check Deck Exporter
```javascript
// Run in console:
console.log('Deck Exporter:', window.DeckExporter);
console.log('Current Deck:', window.DeckExporter.getDeck());
console.log('Total Cards:', window.DeckExporter.getTotalCards());
```

### Check localStorage
```javascript
// Run in console:
console.log('Deck State:', localStorage.getItem('forteDeckBuilderState'));
console.log('Drawer State:', localStorage.getItem('forteDeckDrawerCollapsed'));
```

---

## Nuclear Option: Reset Everything

If nothing works, try resetting:

```javascript
// In browser console:
localStorage.removeItem('forteDeckBuilderState');
localStorage.removeItem('forteDeckDrawerCollapsed');
location.reload();
```

Or disable deck exporter temporarily:

```html
<!-- In index.html, comment out: -->
<!-- <link rel="stylesheet" href="assets/css/deck-exporter.css"> -->
<!-- <script src="js/deck-exporter.js"></script> -->
```

---

## Current Known Issues

### Network Errors (External)
- `ERR_CERT_VERIFIER_CHANGED`: GitHub certificate verification issue
- **Not a code bug** - this is network/SSL related
- Usually resolves itself after cache clear or retry

### Solutions to Try:
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache completely
3. Try incognito/private mode
4. Check GitHub status page
5. Try different network
6. Wait 5-10 minutes and retry

---

**Most Common Fix:** Hard refresh + clear cache resolves 90% of issues.


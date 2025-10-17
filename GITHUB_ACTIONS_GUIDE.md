# 🤖 GitHub Actions - Automatic WebP Sync Guide

## Overview

We've set up **two GitHub Actions** to handle WebP conversion:

1. **`build-image-data.yml`** - Runs on any img/ changes
2. **`sync-webp-images.yml`** - Dedicated WebP sync (NEW!)

---

## 🎯 New Action: Sync WebP Images

**File:** `.github/workflows/sync-webp-images.yml`

### What It Does

**Automatic Triggers:**
- ✅ Runs when you push PNG files to `img/` directory
- ✅ Verifies all WebP files are up-to-date
- ✅ Only converts PNGs that are newer than their WebP
- ✅ Updates card data automatically
- ✅ Rebuilds image_data.js

**Manual Trigger:**
- ✅ Run from GitHub Actions tab anytime
- ✅ Optional "force rebuild" to recreate ALL WebP files
- ✅ Useful for fixing issues or testing

---

## 🔄 How It Works

### Scenario 1: You Update a PNG (Automatic)

```
1. You update pf1a-020.png and push to GitHub
   ↓
2. GitHub Actions detects PNG change
   ↓
3. Workflow runs automatically:
   - Checks if pf1a-020.webp exists
   - Compares modification times
   - PNG newer? → Recreate WebP
   - PNG older? → Skip (already up-to-date)
   ↓
4. Updates data/cards.json with WebP URL
   ↓
5. Rebuilds image_data.js
   ↓
6. Commits changes back:
   - img/approved/PF1a/pf1a-020.webp (updated)
   - data/cards.json (updated)
   - image_data.js (rebuilt)
   ↓
7. Done! ✅
```

### Scenario 2: Manual Run (On-Demand)

```
1. Go to GitHub → Actions tab
   ↓
2. Click "Sync WebP Images"
   ↓
3. Click "Run workflow"
   ↓
4. Options:
   - Branch: Choose branch (main/test)
   - Force rebuild: ☐ No (default) / ☑ Yes (rebuild all)
   ↓
5. Click "Run workflow" button
   ↓
6. Workflow runs and shows progress
   ↓
7. Verifies all WebP files
   ↓
8. Converts any missing/outdated ones
   ↓
9. Commits changes if needed
```

---

## 🎮 How to Use

### Automatic (No Action Needed)

**Just push updated PNGs:**
```bash
# Update a PNG file
git add img/approved/PF1a/pf1a-020.png
git commit -m "Update pf1a-020 card art"
git push origin test
```

**GitHub Actions automatically:**
- ✅ Detects pf1a-020.png was updated
- ✅ Checks if pf1a-020.webp is older
- ✅ Recreates pf1a-020.webp
- ✅ Updates card data
- ✅ Rebuilds image_data.js
- ✅ Commits everything back

**Result:** WebP always in sync! 🎉

---

### Manual Trigger

**When to use:**
- Verify all WebP files are current
- Fix any sync issues
- Rebuild all WebP files from scratch
- Test the workflow

**How to trigger:**

1. **Go to GitHub:**
   - Repository → Actions tab
   - Click "Sync WebP Images" workflow

2. **Run Workflow:**
   - Click "Run workflow" button (top right)
   - Select branch (main or test)
   - Optional: Check "Force rebuild all WebP files"
   - Click green "Run workflow" button

3. **Watch Progress:**
   - Workflow appears in the list
   - Click it to see real-time logs
   - See verification, conversion, and commit steps

4. **View Results:**
   - Green checkmark = Success
   - Red X = Failed (check logs)
   - Commits appear in your git history

---

## 📊 Workflow Steps Explained

### Step 1: Verify WebP Status
```bash
# Counts files
PNG_COUNT: 254
WEBP_COUNT: 254

# Checks timestamps
For each PNG:
  - WebP missing? → needs_update = true
  - PNG newer than WebP? → needs_update = true
  - WebP up-to-date? → Skip
```

### Step 2: Convert (Only if Needed)
```bash
# Only runs if needs_update = true
node convert-to-webp.js

# Converts:
- Missing WebP files (new PNGs)
- Outdated WebP files (PNG was updated)

# Skips:
- Up-to-date WebP files (already current)
```

### Step 3: Update Card Data
```bash
# Adds imagesWebP URLs to cards
node update-card-data-webp.js
```

### Step 4: Rebuild Image Data
```bash
# Regenerates image_data.js
npm run build:images
```

### Step 5: Commit Changes
```bash
# Auto-commits:
- img/**/*.webp (new/updated)
- data/cards.json (updated)
- image_data.js (rebuilt)
```

---

## 🎯 Example: Update pf1a-020.png

### Your Workflow:
```bash
# 1. You update the PNG locally
# (edit pf1a-020.png in Photoshop, etc.)

# 2. Commit and push
git add img/approved/PF1a/pf1a-020.png
git commit -m "Update pf1a-020 card art"
git push origin test

# 3. DONE! GitHub Actions handles the rest
```

### What GitHub Actions Does (Automatically):
```
✓ Detects pf1a-020.png was updated
✓ Checks pf1a-020.webp modification time
✓ PNG is newer? → Recreate WebP
✓ Converts pf1a-020.png → pf1a-020.webp
✓ Updates data/cards.json with new WebP URL
✓ Rebuilds image_data.js
✓ Commits: 
  - img/approved/PF1a/pf1a-020.webp
  - data/cards.json
  - image_data.js
✓ Pushes back to repository
```

**Result:** pf1a-020.webp is automatically updated! 🎉

---

## 🔧 Manual Verification

**Run anytime to verify everything is synced:**

1. Go to: `https://github.com/Envoyofhell/Pocket-Image-Previewer/actions`
2. Click "Sync WebP Images"
3. Click "Run workflow"
4. Select branch and options
5. Click "Run workflow" button
6. Wait for completion (~2-3 minutes)
7. Check results

**Workflow will:**
- ✅ Check all 254+ PNG files
- ✅ Verify each has a current WebP
- ✅ Convert any missing/outdated ones
- ✅ Update card data
- ✅ Rebuild image_data.js
- ✅ Commit changes (if any)

---

## 📋 Workflow Options

### Force Rebuild (Manual Only)

**When to use:**
- WebP quality changed (want to reconvert all)
- Corrupted WebP files
- Testing new conversion settings
- Paranoid verification

**How:**
1. GitHub → Actions → Sync WebP Images
2. Run workflow
3. ☑ Check "Force rebuild all WebP files"
4. Run

**Result:** Deletes and recreates ALL 254 WebP files

---

## 🎮 Testing the Workflow

### Test 1: Update a PNG
```bash
# Make a small change to any PNG
git add img/approved/misc/misc-001.png
git commit -m "test: Update misc-001"
git push origin test

# Check GitHub Actions
# Should see "Sync WebP Images" running
# Should create new misc-001.webp
```

### Test 2: Manual Run
```bash
# Go to GitHub Actions
# Click "Sync WebP Images"
# Click "Run workflow"
# Watch it verify and update
```

### Test 3: Force Rebuild
```bash
# GitHub Actions → Sync WebP Images
# Run workflow
# Check "Force rebuild"
# All 254 WebP files recreated
```

---

## 📊 Expected Behavior

### When PNG is Unchanged
```
✅ WebP up-to-date → Skip conversion
→ No commit, workflow completes quickly
```

### When PNG is Updated
```
🔄 WebP outdated → Convert PNG to WebP
→ Commit new .webp file + updated data
```

### When PNG is New
```
❌ WebP missing → Create WebP
→ Commit new .webp file + updated data
```

### When Force Rebuild
```
🔄 Rebuild all → Delete all WebP, reconvert everything
→ Commit all 254 .webp files
```

---

## 🚀 Benefits

### For You
- ✅ **Zero manual work** - Just push PNGs
- ✅ **Always in sync** - WebP auto-updates
- ✅ **Verify anytime** - Manual trigger available
- ✅ **Fix issues** - Force rebuild option
- ✅ **Transparent** - See all changes in git history

### For the System
- ✅ **WebP always current** - Timestamp verification
- ✅ **No redundant work** - Only converts when needed
- ✅ **Complete automation** - End-to-end pipeline
- ✅ **Reliable** - Multiple safeguards

---

## 📁 Files Updated

1. **`.github/workflows/sync-webp-images.yml`** - NEW dedicated WebP sync action
2. **`.github/workflows/build-image-data.yml`** - Updated to use rebuild-on-push.js
3. **`rebuild-on-push.js`** - Smart rebuild detector
4. **`convert-to-webp.js`** - Now checks timestamps (updated)

---

## 🎯 Summary

**You asked for:**
- ✅ Action that verifies WebP created AFTER PNG
- ✅ Always up-to-date verification
- ✅ Manual run capability

**You got:**
- ✅ Automatic sync on PNG push
- ✅ Timestamp-based verification
- ✅ Manual trigger with force rebuild option
- ✅ Smart conversion (only when needed)
- ✅ Complete pipeline (convert → update data → rebuild)

---

## 🎊 How to Use Going Forward

### Updating a Card Image:

```bash
# 1. Update PNG locally
# (edit in image editor)

# 2. Push to GitHub
git add img/approved/PF1a/pf1a-020.png
git commit -m "Update pf1a-020 artwork"
git push origin test

# 3. DONE!
# GitHub Actions automatically:
# - Creates pf1a-020.webp
# - Updates data/cards.json
# - Rebuilds image_data.js
# - Commits changes
```

**You never touch WebP files manually!** 🎉

---

**The workflow is ready! Next time you push a PNG, it will automatically create/update the WebP!** 🚀


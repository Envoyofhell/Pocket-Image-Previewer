# 🎯 How to Run GitHub Actions - Step-by-Step Guide

## ✅ Workflow is Now Available!

The workflow is pushed and should appear in your GitHub Actions tab.

---

## 📍 How to Find and Run the Action

### Step 1: Go to GitHub Actions Tab

**URL:**
```
https://github.com/Envoyofhell/Pocket-Image-Previewer/actions
```

**Or navigate:**
```
GitHub.com → Your Repository → Actions tab (top menu)
```

---

### Step 2: Find "Sync WebP Images" Workflow

**On the left sidebar, you'll see:**
```
All workflows
├── Build Image Data
└── Sync WebP Images  ← Click this one!
```

**If you don't see it:**
- Wait 30 seconds (GitHub needs to index it)
- Refresh the page
- Make sure you're on the correct repository

---

### Step 3: Run the Workflow

**Once you click "Sync WebP Images":**

```
┌─────────────────────────────────────────────┐
│ Sync WebP Images                            │
├─────────────────────────────────────────────┤
│                                             │
│ This workflow has a workflow_dispatch event │
│ trigger.                                    │
│                                             │
│  [Run workflow ▼]  ← Click this button     │
│                                             │
└─────────────────────────────────────────────┘
```

**A dropdown appears:**
```
┌──────────────────────────────────────┐
│ Use workflow from                    │
│ Branch: [Forte-Master ▼]            │
│                                      │
│ Force rebuild all WebP files         │
│ [ ] (unchecked)                      │
│                                      │
│ [Run workflow]  ← Click this         │
└──────────────────────────────────────┘
```

---

### Step 4: Choose Options

**Branch:** Select `Forte-Master` (your working branch)

**Force rebuild:**
- ☐ **Unchecked (default):** Only converts outdated/missing WebP
- ☑ **Checked:** Deletes and recreates ALL 254 WebP files

**For most cases:** Leave unchecked

---

### Step 5: Click "Run workflow" Button

The green button at the bottom of the dropdown.

---

### Step 6: Watch Progress

**The workflow will appear at the top of the list:**
```
🟡 Sync WebP Images #1
   Running · Forte-Master
   
   Click to see live logs →
```

**Progress indicators:**
```
🟡 Yellow dot = Running
✅ Green checkmark = Success
❌ Red X = Failed
```

---

## 🔍 If You Don't See the Workflow

### Troubleshooting

**1. Check the URL:**
Make sure you're at:
```
https://github.com/Envoyofhell/Pocket-Image-Previewer/actions
```

**2. Check the Branch:**
The workflow file must exist on the branch you're viewing.

To check:
```
https://github.com/Envoyofhell/Pocket-Image-Previewer/blob/Forte-Master/.github/workflows/sync-webp-images.yml
```

Should show the file. If "404", the file isn't on that branch.

**3. Wait and Refresh:**
- GitHub indexes workflows every 30-60 seconds
- Wait 1 minute, then refresh the Actions page

**4. Check for YAML Errors:**
If the YAML has syntax errors, it won't appear.

Go to:
```
Repository → .github/workflows/sync-webp-images.yml
```

GitHub will show syntax errors if any exist.

**5. Check Repository Settings:**
- Settings → Actions → General
- Ensure "Actions permissions" is set to "Allow all actions"

---

## 📸 Visual Guide

### What the Actions Tab Looks Like

```
╔════════════════════════════════════════════════════════╗
║  Actions                                               ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  All workflows                  [Run workflow ▼]      ║
║  ├─ Build Image Data                                  ║
║  └─ Sync WebP Images  ← You should see this          ║
║                                                        ║
║  Workflow runs                                         ║
║  ┌──────────────────────────────────────────────┐    ║
║  │ 🟢 Sync WebP Images #1                       │    ║
║  │    Completed · Forte-Master · 2m ago         │    ║
║  └──────────────────────────────────────────────┘    ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

## 🎮 Quick Start

### Option 1: Direct Link (After Push)
```
https://github.com/Envoyofhell/Pocket-Image-Previewer/actions/workflows/sync-webp-images.yml
```

Click this link 1 minute after pushing → Should see "Run workflow" button

### Option 2: Navigate Manually
```
1. GitHub.com
2. Your repository
3. Click "Actions" tab
4. Left sidebar → "Sync WebP Images"
5. Click "Run workflow"
```

---

## ✅ What to Expect

### When You Run It Manually

**The workflow will:**
1. ✅ Check all 254 PNG files
2. ✅ Verify each has a WebP
3. ✅ Compare modification timestamps
4. ✅ Convert any outdated/missing WebP
5. ✅ Update data/cards.json
6. ✅ Rebuild image_data.js
7. ✅ Commit changes (if any)
8. ✅ Push back to your branch

**Completion time:** 2-5 minutes

**Output:** You'll see detailed logs showing:
- How many PNGs found
- How many WebP files exist
- Which ones were converted
- What was committed

---

## 🎯 Current Status

**Just pushed:** ✅
- Updated workflows to support `Forte-Master` branch
- Workflow should appear in Actions tab within 1 minute

**To verify:**
1. Wait 1 minute
2. Go to: https://github.com/Envoyofhell/Pocket-Image-Previewer/actions
3. Refresh the page
4. Look for "Sync WebP Images" in left sidebar

**Should be there now!** 🎉

---

## 🚀 Next Steps

1. **Go to Actions tab** (wait 1 min after push)
2. **Find "Sync WebP Images"** in left sidebar
3. **Click "Run workflow"** button
4. **Select branch:** `Forte-Master`
5. **Click green "Run workflow"** button
6. **Watch it run!**

---

**The workflow is live! Try running it now!** 🚀


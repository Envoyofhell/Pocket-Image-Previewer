# 🎯 Quick Guide: Running GitHub Actions Manually

## Step-by-Step Visual Guide

### 1. Go to Your Repository Actions Tab

**Direct Link:**
```
https://github.com/Envoyofhell/Pocket-Image-Previewer/actions
```

---

### 2. What You Should See

```
┌────────────────────────────────────────────────────────┐
│ Actions                                                │
├────────────────────────────────────────────────────────┤
│                                                        │
│ All workflows                                          │
│ ├─ Build Image Data          ← Existing workflow      │
│ └─ Sync WebP Images          ← NEW workflow           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**If you DON'T see "Sync WebP Images":**
- Wait 1-2 minutes (GitHub needs to index the workflow)
- Hard refresh: Ctrl+Shift+F5
- Check you're on the right repository

---

### 3. Click "Sync WebP Images"

**You'll see:**
```
┌────────────────────────────────────────────────────────┐
│ Sync WebP Images                                       │
├────────────────────────────────────────────────────────┤
│                                                        │
│ This workflow has a workflow_dispatch event trigger.   │
│                                                        │
│ Run workflow ▼  ← Click this dropdown                 │
│                                                        │
│ (Past runs appear below)                               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### 4. Select Branch and Options

**The dropdown shows:**
```
┌─────────────────────────────────────┐
│ Use workflow from                   │
│                                     │
│ Branch: Forte-Master ▼              │
│                                     │
│ Force rebuild all WebP files        │
│ ☐ Unchecked (default)               │
│                                     │
│ [Run workflow]  ← Green button      │
└─────────────────────────────────────┘
```

**Choose:**
- Branch: `Forte-Master`
- Force rebuild: Leave unchecked (unless you want to rebuild all)

---

### 5. Click Green "Run workflow" Button

**You'll see:**
```
✅ Workflow run was successfully requested
```

**Then the page updates:**
```
┌────────────────────────────────────────────────────────┐
│ Workflow runs                                          │
│                                                        │
│ 🟡 Sync WebP Images #1                                │
│    Running · Forte-Master · less than a minute ago    │
│    ↑ Click to see live logs                           │
└────────────────────────────────────────────────────────┘
```

---

### 6. Watch Progress (Optional)

**Click the running workflow to see:**
```
┌────────────────────────────────────────────────────────┐
│ Sync WebP Images #1                                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Jobs                                                   │
│ ✓ sync-webp (2m 15s)                                  │
│   ✓ Checkout Repository                               │
│   ✓ Setup Node.js                                     │
│   ✓ Install Dependencies                              │
│   ✓ Install Sharp                                     │
│   ✓ Verify WebP Status                                │
│   ✓ Convert PNG to WebP                               │
│   ✓ Update Card Data                                  │
│   ✓ Rebuild Image Data                                │
│   ✓ Commit Updated Files                              │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🔍 Troubleshooting: "I Don't See the Workflow"

### Check 1: Is the Workflow File on GitHub?

**Go to:**
```
https://github.com/Envoyofhell/Pocket-Image-Previewer/blob/Forte-Master/.github/workflows/sync-webp-images.yml
```

**Should show:** The workflow YAML file

**If 404:** The file isn't pushed yet

---

### Check 2: Is GitHub Actions Enabled?

**Go to:**
```
Repository → Settings → Actions → General
```

**Ensure:**
- ✅ "Allow all actions and reusable workflows" is selected
- ✅ Workflow permissions set to "Read and write permissions"

---

### Check 3: Refresh and Wait

- GitHub indexes workflows every 30-60 seconds
- Hard refresh: Ctrl+Shift+F5
- Close and reopen Actions tab
- Wait 2 minutes after push

---

## 🚀 Alternative: Run via URL

**Direct workflow URL:**
```
https://github.com/Envoyofhell/Pocket-Image-Previewer/actions/workflows/sync-webp-images.yml
```

**If this URL shows 404:**
- Workflow file isn't on GitHub yet
- Need to push it

**If this URL works:**
- You'll see "Run workflow" button
- Click it to run manually

---

## ✅ Verification Steps

### Step 1: Check File Exists on GitHub
```bash
# In terminal
git ls-files .github/workflows/sync-webp-images.yml
```
Should output: `.github/workflows/sync-webp-images.yml`

### Step 2: Check Remote Has It
```bash
git ls-remote --heads origin Forte-Master
```
Should show your latest commit hash

### Step 3: View on GitHub
```
https://github.com/Envoyofhell/Pocket-Image-Previewer/tree/Forte-Master/.github/workflows
```
Should show:
- build-image-data.yml
- sync-webp-images.yml

---

## 🎯 Current Status

**Local:** ✅ Workflow file exists and is committed  
**Remote:** ✅ Should be pushed (says "Everything up-to-date")  
**GitHub Actions:** ⏳ Waiting to appear (give it 1-2 minutes)

---

## 💡 If Still Not Visible After 2 Minutes

The workflow might have a YAML syntax error. Let me know and I'll create a minimal test workflow to verify Actions are working.

---

**Try this URL in 1-2 minutes:**
```
https://github.com/Envoyofhell/Pocket-Image-Previewer/actions/workflows/sync-webp-images.yml
```

**Should show the workflow with "Run workflow" button!** 🎯


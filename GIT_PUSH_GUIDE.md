# Git Push Guide - Large File Upload

## ✅ Solution Applied

**Increased HTTP post buffer:**
```bash
git config http.postBuffer 524288000  # 500 MB
```

**Now try pushing again:**
```bash
git push origin test
```

This should work now! ✅

---

## Alternative Strategies (If Still Fails)

### Option 1: Push in Batches

**Step 1: Push WebP files by directory**
```bash
# Push misc folder
git add img/approved/misc/*.webp
git commit -m "feat: Add misc WebP images (139 files)"
git push origin test

# Push PF1a folder
git add img/approved/PF1a/*.webp
git commit -m "feat: Add PF1a WebP images"
git push origin test

# Push PFE folder
git add img/approved/PFE/*.webp
git commit -m "feat: Add PFE WebP images"
git push origin test
```

**Step 2: Push code changes**
```bash
git add js/ assets/ index.html data/
git commit -m "feat: WebP loading system + deck builder"
git push origin test
```

---

### Option 2: Use Git LFS (Large File Storage)

**If you have MANY large files:**
```bash
# Install Git LFS (one-time)
git lfs install

# Track WebP files
git lfs track "*.webp"
git add .gitattributes

# Now push (LFS handles large files)
git add img/approved/**/*.webp
git commit -m "feat: Add WebP images via LFS"
git push origin test
```

---

### Option 3: Increase Timeout and Compression

```bash
# Increase timeout
git config http.postBuffer 524288000
git config http.timeout 600  # 10 minutes
git config pack.windowMemory 256m
git config pack.packSizeLimit 256m

# Then push
git push origin test
```

---

### Option 4: Push with Compression

```bash
# Enable maximum compression
git config core.compression 9

# Push
git push origin test
```

---

## 🎯 Recommended Approach

**Try this order:**

1. **Try normal push** (buffer already increased)
   ```bash
   git push origin test
   ```

2. **If fails, push in batches** (most reliable)
   ```bash
   # Code first (small)
   git add js/ assets/ index.html public/ cloudflare-optimization.js _headers _redirects
   git commit -m "feat: Add WebP loading system and Cloudflare caching"
   git push origin test
   
   # Then images in batches
   git add img/approved/misc/*.webp
   git commit -m "feat: Add misc WebP images"
   git push origin test
   
   git add img/approved/PF1a/*.webp
   git commit -m "feat: Add PF1a WebP images"
   git push origin test
   
   git add img/approved/PFE/*.webp
   git commit -m "feat: Add PFE WebP images"
   git push origin test
   
   # Finally card data
   git add data/cards.json
   git commit -m "feat: Update card data with WebP URLs"
   git push origin test
   ```

3. **If still fails, use Git LFS** (for projects with many large files)

---

## 🐛 Common Issues

### "unable to rewind rpc post data"
**Cause:** Pushing too much data at once  
**Solution:** ✅ Increase postBuffer (done) or push in batches

### "early EOF" or "fatal: the remote end hung up unexpectedly"
**Cause:** Network timeout  
**Solution:** Increase timeout or push in smaller batches

### "HTTP 413 - Request Entity Too Large"
**Cause:** Git server limits  
**Solution:** Push in batches or use Git LFS

---

## 📊 Your Files

**Total size to push:**
- WebP images: 34.7 MB (254 files)
- Code changes: ~100 KB (20 files)
- **Total:** ~35 MB

**Should work with 500 MB buffer!** But if network is slow, try batches.

---

## ✅ Current Status

**Git config:**
```
http.postBuffer = 524288000  # 500 MB
```

**Ready to push:**
```bash
git status  # Check what's staged
git push origin test  # Try pushing
```

**If it fails:**
- Try batch pushing (Option 2 above)
- Or let me know the error message

---

**Try pushing now! The buffer increase should fix it.** 🚀


# Fix: Double Slash in Backend URL

## Problem

Your environment variable has a trailing slash:
```
REACT_APP_BACKEND_URL=https://presentera.onrender.com/
```

This causes the URL to become:
```
https://presentera.onrender.com//convert  ❌ (double slash)
```

## Solution

### Option 1: Fix Environment Variable (Recommended)

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `REACT_APP_BACKEND_URL`
3. **Edit the value** to remove the trailing slash:
   - ❌ Wrong: `https://presentera.onrender.com/`
   - ✅ Correct: `https://presentera.onrender.com`
4. **Save**
5. **Redeploy** your project (Deployments → Redeploy)

### Option 2: Code Already Fixed

I've updated the code to automatically remove trailing slashes, so even if your env var has a trailing slash, it will work. But it's still better to fix the env var.

## After Fixing

1. **Update environment variable** (remove trailing slash)
2. **Redeploy** on Vercel
3. **Test again** - should work now!

The code now handles trailing slashes automatically, but fixing the env var is the cleanest solution.


# Vercel Frontend Deployment Guide

This guide covers deploying the frontend to Vercel (recommended for React apps).

## Why Vercel for Frontend?

✅ **Optimized for React** - Best performance and build times  
✅ **Automatic SPA Routing** - Handles React Router perfectly  
✅ **Fast CDN** - Global edge network  
✅ **Zero Configuration** - Works out of the box  
✅ **Free Tier** - Generous free tier with great features  

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Your code pushed to GitHub

## Quick Deployment

### Step 1: Prepare Your Repository

Make sure your code is on GitHub:
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push
```

### Step 2: Deploy to Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "Add New Project"**
3. **Import GitHub Repository**
   - Select your repository
   - Vercel will auto-detect it's a React app
4. **Configure Project:**
   - **Framework Preset:** Create React App (auto-detected)
   - **Root Directory:** `frontend` ⚠️ **Important!**
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `build` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

5. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add: `REACT_APP_BACKEND_URL`
   - Value: Your Render backend URL (e.g., `https://presentera-backend.onrender.com`)
   - Select all environments (Production, Preview, Development)

6. **Click "Deploy"**
7. **Wait for build to complete** (~2-3 minutes)

### Step 3: Verify Deployment

After deployment, you'll get:
- **Production URL:** `https://your-app.vercel.app`
- **Preview URLs:** For each branch/PR

**Test Routes:**
- Landing: `https://your-app.vercel.app/`
- Editor: `https://your-app.vercel.app/app` ✅ Should work!

## Configuration Files

### vercel.json

Your `frontend/vercel.json` is already configured:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/images/(.*)",
      "dest": "/images/$1"
    },
    {
      "src": "/clipart/(.*)",
      "dest": "/clipart/$1"
    },
    {
      "src": "/templates/(.*)",
      "dest": "/templates/$1",
      "headers": {
        "Content-Type": "application/json"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**Key Points:**
- ✅ SPA routing configured (`/(.*)` → `/index.html`)
- ✅ Static assets properly routed
- ✅ Templates served with correct headers

## Environment Variables

### Required

**`REACT_APP_BACKEND_URL`**
- Your Render backend URL
- Example: `https://presentera-backend.onrender.com`
- Must start with `REACT_APP_` to be accessible in React

### Optional

**`DISABLE_ESLINT_PLUGIN`**
- Set to `true` for faster builds
- Already in `vercel.json` env section

**`GENERATE_SOURCEMAP`**
- Set to `false` for smaller builds
- Already in `vercel.json` env section

## How to Set Environment Variables

### Via Dashboard

1. Go to your project in Vercel
2. Settings → Environment Variables
3. Add variable:
   - **Key:** `REACT_APP_BACKEND_URL`
   - **Value:** Your backend URL
   - **Environment:** Select all (Production, Preview, Development)
4. Save
5. **Redeploy** (or wait for next auto-deploy)

### Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Add environment variable
vercel env add REACT_APP_BACKEND_URL
# Enter value when prompted
# Select environments

# Redeploy
vercel --prod
```

## SPA Routing

Vercel automatically handles React Router (BrowserRouter):

✅ **Direct URLs work:**
- `https://your-app.vercel.app/app` ✅
- `https://your-app.vercel.app/` ✅

✅ **Page refresh works:**
- Refresh on `/app` → Still shows editor ✅

✅ **Browser navigation works:**
- Back/forward buttons work correctly ✅

**No additional configuration needed!** The `vercel.json` routes handle everything.

## Auto-Deploy

Vercel automatically deploys:
- ✅ Every push to `main` branch → Production
- ✅ Every push to other branches → Preview
- ✅ Every Pull Request → Preview with unique URL

## Custom Domain

1. Go to project → Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions
4. Vercel handles SSL automatically

## Troubleshooting

### Problem: Routes return 404

**Solution:**
- Verify `vercel.json` has the catch-all route: `"src": "/(.*)", "dest": "/index.html"`
- Check Root Directory is set to `frontend`
- Redeploy after changes

### Problem: Environment variable not working

**Solution:**
- Ensure variable starts with `REACT_APP_`
- Redeploy after adding/changing variables
- Check variable is set for correct environment

### Problem: Build fails

**Solution:**
- Check build logs in Vercel dashboard
- Verify Root Directory is `frontend`
- Check `package.json` has correct build script
- Ensure all dependencies are in `package.json`

### Problem: Can't connect to backend

**Solution:**
- Verify `REACT_APP_BACKEND_URL` is set correctly
- Check backend URL is accessible
- Verify CORS is configured in backend
- Check browser console for errors

## Performance Tips

1. **Enable Edge Functions** (if needed)
2. **Use Image Optimization** (automatic with Vercel)
3. **Enable Analytics** (optional, in project settings)
4. **Use Preview Deployments** for testing

## Next Steps

After deploying frontend:
1. ✅ Update backend CORS with your Vercel URL
2. ✅ Test all routes work correctly
3. ✅ Set up custom domain (optional)
4. ✅ Enable analytics (optional)

---

**Your frontend is now live on Vercel!** 🚀

For backend deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md).


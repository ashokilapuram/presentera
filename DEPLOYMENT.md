# Deployment Guide

This guide will help you deploy the Presentera fullstack application. You have two options:

1. **Option A:** Frontend on Vercel + Backend on Render (Recommended for best performance)
2. **Option B:** Both Frontend and Backend on Render (Simpler, one platform)

**For deploying both on Render, see [DEPLOYMENT_RENDER_ONLY.md](./DEPLOYMENT_RENDER_ONLY.md)**

This guide covers **Option A** (Vercel + Render).

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Git Repository Setup](#git-repository-setup)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Backend Deployment (Render)](#backend-deployment-render)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Render account (free tier available)
- Git installed on your local machine

---

## Environment Variables

### Frontend (Vercel)
- `REACT_APP_BACKEND_URL` - Backend API URL (e.g., `https://your-backend.onrender.com`)

### Backend (Render)
- `PORT` - Server port (Render sets this automatically, but you can override)
- `CORS_ORIGINS` - Comma-separated list of allowed origins (optional, defaults to "*")

**Note:** After deploying the backend, you'll get a URL like `https://your-app.onrender.com`. Use this URL as the `REACT_APP_BACKEND_URL` in your frontend environment variables.

---

## Git Repository Setup

### 1. Initialize Git Repository

```bash
# Navigate to project root
cd presentera-fullstack

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Presentera fullstack app"

# Create a new repository on GitHub (via web interface)
# Then connect your local repo to GitHub:

git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 2. Verify .gitignore

Make sure your `.gitignore` file is in place to exclude:
- `node_modules/`
- `__pycache__/`
- `.env` files
- Build outputs
- IDE files

---

## Frontend Deployment (Vercel) - Recommended ✅

Vercel is optimized for React apps with faster builds, better performance, and automatic SPA routing.

### Step 1: Prepare for Deployment

1. ✅ `vercel.json` is already configured correctly
2. ✅ Build command: `npm run build` (in `package.json`)
3. ✅ Output directory: `build` (configured in `vercel.json`)
4. ✅ SPA routing: Already configured in `vercel.json` - routes like `/app` will work automatically!

### Step 2: Deploy via Vercel Dashboard

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "Add New Project"**
3. **Import your GitHub repository**
   - Select the repository
   - Vercel will auto-detect it's a React app
4. **Configure Project Settings:**
   - **Framework Preset:** Create React App (auto-detected)
   - **Root Directory:** `frontend` ⚠️ **Important!**
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `build` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

5. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add: `REACT_APP_BACKEND_URL` = `https://your-backend.onrender.com`
     - **Note:** Update this after deploying the backend
   - Select all environments (Production, Preview, Development)

6. **Deploy:**
   - Click "Deploy"
   - Wait for build (~2-3 minutes)
   - Your frontend will be live at `https://your-app.vercel.app`

### Step 3: Verify Routes Work

After deployment, test:
- ✅ Landing page: `https://your-app.vercel.app/`
- ✅ Editor: `https://your-app.vercel.app/app` (should work perfectly!)
- ✅ Page refresh on `/app` works correctly

**Vercel automatically handles SPA routing - no additional configuration needed!**

### Step 4: Update Environment Variable After Backend Deployment

Once your backend is deployed on Render:
1. Go to Vercel project → Settings → Environment Variables
2. Update `REACT_APP_BACKEND_URL` with your Render backend URL
3. Redeploy (or wait for auto-redeploy)

### Alternative: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Login
vercel login

# Deploy
vercel

# Add environment variable
vercel env add REACT_APP_BACKEND_URL
# Enter backend URL when prompted
```

**For detailed Vercel deployment guide, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**

---

## Backend Deployment (Render)

### Step 1: Prepare for Deployment

1. Ensure `requirements.txt` is up to date
2. Create a `render.yaml` file (already created in this project)
3. The backend uses FastAPI with Uvicorn

### Step 2: Deploy via Render Dashboard

1. **Go to [Render Dashboard](https://dashboard.render.com/)**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
   - Select the repository
   - Render will detect it's a Python app
4. **Configure Service Settings:**
   - **Name:** `presentera-backend` (or your preferred name)
   - **Environment:** Python 3
   - **Region:** Choose closest to your users
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free (or choose a paid plan)

5. **Add Environment Variables (Optional):**
   - `PORT` - Usually set automatically by Render
   - `CORS_ORIGINS` - Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
     - **Note:** The backend currently allows all origins (`*`). For production, you may want to restrict this.

6. **Deploy:**
   - Click "Create Web Service"
   - Render will build and deploy your backend
   - Your backend will be live at `https://your-app.onrender.com`

### Step 3: Update Backend CORS (Recommended)

For better security, restrict CORS to your Vercel frontend:

1. **Backend code is already configured** - `backend/main.py` supports `CORS_ORIGINS` environment variable

2. **In Render dashboard:**
   - Go to your backend service → Environment
   - Add environment variable:
     - **Key:** `CORS_ORIGINS`
     - **Value:** `https://your-app.vercel.app` (your Vercel frontend URL)
   - Service will auto-restart

**This restricts CORS to only your Vercel frontend for better security.**

---

## Post-Deployment Configuration

### 1. Update Frontend Environment Variable

After backend is deployed:
1. Go to Vercel dashboard
2. Update `REACT_APP_BACKEND_URL` with your Render backend URL
3. Redeploy frontend

### 2. Test the Integration

1. Visit your Vercel frontend URL
2. Try uploading a PPTX file
3. Check browser console for any CORS errors
4. Check Render logs if there are issues

### 3. Enable Auto-Deploy

Both Vercel and Render support auto-deploy:
- **Vercel:** Automatically deploys on push to main branch
- **Render:** Enable "Auto-Deploy" in service settings

---

## Troubleshooting

### Frontend Issues

**Problem:** Frontend can't connect to backend
- **Solution:** Check `REACT_APP_BACKEND_URL` is set correctly in Vercel
- Verify the backend URL is accessible (visit it in browser)
- Check browser console for CORS errors

**Problem:** Build fails on Vercel
- **Solution:** Check build logs in Vercel dashboard
- Ensure `package.json` has correct build script
- Verify all dependencies are in `package.json`

### Backend Issues

**Problem:** Backend returns 503 or doesn't start
- **Solution:** Check Render logs
- Verify `requirements.txt` is correct
- Ensure start command is: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Problem:** CORS errors
- **Solution:** Update CORS_ORIGINS environment variable in Render
- Or update backend code to use environment variable (see Step 3 above)

**Problem:** Backend times out on free tier
- **Solution:** Render free tier services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to a paid plan for always-on service

### General Issues

**Problem:** Environment variables not working
- **Solution:** 
  - Frontend: Variables must start with `REACT_APP_` to be accessible
  - Backend: Restart service after adding environment variables
  - Both: Redeploy after changing environment variables

---

## Quick Reference

### Frontend URLs
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Your App:** `https://your-app.vercel.app`

### Backend URLs
- **Render Dashboard:** https://dashboard.render.com/
- **Your API:** `https://your-app.onrender.com`
- **API Docs:** `https://your-app.onrender.com/docs`

### Environment Variables Summary

**Vercel (Frontend):**
```
REACT_APP_BACKEND_URL=https://your-backend.onrender.com
```

**Render (Backend):**
```
PORT=10000 (auto-set by Render)
CORS_ORIGINS=https://your-frontend.vercel.app (optional)
```

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Vercel
3. ✅ Update frontend environment variable with backend URL
4. ✅ Test the full integration
5. ✅ Set up custom domains (optional)
6. ✅ Configure monitoring and alerts (optional)

---

## Support

For issues:
- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **React Docs:** https://react.dev/


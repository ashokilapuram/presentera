# Quick Start Guide

Get your Presentera app deployed in minutes!

## 🚀 Recommended Setup: Vercel (Frontend) + Render (Backend)

This is the recommended deployment setup:
- **Frontend on Vercel** - Best performance, faster builds, optimized for React
- **Backend on Render** - Reliable Python hosting

**Alternative:** Both on Render → See [DEPLOYMENT_RENDER_ONLY.md](./DEPLOYMENT_RENDER_ONLY.md)

## 🚀 5-Minute Deployment

### Step 1: Git Setup (2 minutes)

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend to Render (2 minutes)

1. Go to [render.com](https://render.com) → Sign up/Login
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Name:** `presentera-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Click "Create Web Service"
6. **Copy your backend URL** (e.g., `https://presentera-backend.onrender.com`)

### Step 3: Deploy Frontend to Vercel (1 minute)

1. Go to [vercel.com](https://vercel.com) → Sign up/Login
2. Click "Add New Project"
3. Import your GitHub repo
4. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Create React App
5. Add Environment Variable:
   - **Key:** `REACT_APP_BACKEND_URL`
   - **Value:** Your Render backend URL from Step 2
6. Click "Deploy"

### Step 4: Update Backend CORS (Optional but Recommended)

1. In Render dashboard, go to your backend service
2. Click "Environment" tab
3. Add environment variable:
   - **Key:** `CORS_ORIGINS`
   - **Value:** Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
4. Service will auto-restart

## ✅ Done!

Your app is now live:
- **Frontend:** `https://your-app.vercel.app` (Vercel - optimized for React)
- **Backend:** `https://your-backend.onrender.com` (Render)
- **API Docs:** `https://your-backend.onrender.com/docs`

**Routes work perfectly:**
- Landing page: `https://your-app.vercel.app/`
- Editor: `https://your-app.vercel.app/app`

## 📚 Need More Details?

- **Full Deployment Guide (Vercel + Render):** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Deploy Both on Render:** [DEPLOYMENT_RENDER_ONLY.md](./DEPLOYMENT_RENDER_ONLY.md)
- **Environment Variables:** [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)
- **Git Setup:** [GIT_SETUP.md](./GIT_SETUP.md)

## 🐛 Troubleshooting

**Frontend can't connect to backend?**
- Check `REACT_APP_BACKEND_URL` is set in Vercel
- Verify backend URL is accessible
- Redeploy frontend after setting environment variable

**CORS errors?**
- Add `CORS_ORIGINS` environment variable in Render
- Set it to your Vercel frontend URL

**Backend not starting?**
- Check Render logs
- Verify start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

**Happy Deploying! 🎉**


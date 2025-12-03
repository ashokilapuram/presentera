# Deploy Both Frontend and Backend on Render

This guide shows you how to deploy both the frontend and backend on Render, keeping everything in one platform.

## Table of Contents
1. [Why Render for Both?](#why-render-for-both)
2. [Prerequisites](#prerequisites)
3. [Quick Deployment](#quick-deployment)
4. [Manual Deployment Steps](#manual-deployment-steps)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Why Render for Both?

### Advantages:
- ✅ **Single Platform** - Manage everything in one place
- ✅ **Easier Configuration** - Both services in same dashboard
- ✅ **Consistent URLs** - Both use `.onrender.com` domains
- ✅ **Simplified CORS** - Easier to configure since both are on Render
- ✅ **Free Tier Available** - Both services can use free tier

### Considerations:
- ⚠️ **Free Tier Limits** - Services spin down after 15 min inactivity
- ⚠️ **Build Time** - Frontend builds on Render (may be slower than Vercel)
- ⚠️ **Static Site vs Web Service** - Frontend uses Static Site service

---

## Prerequisites

- GitHub account
- Render account (free tier available)
- Git repository with your code

---

## Quick Deployment (Using render.yaml)

### Step 1: Update render.yaml (Optional)

The `render.yaml` file is configured for both services. However, **Render Blueprints have limited support for static sites**, so we recommend using the **Manual Deployment** method below.

If you want to try the Blueprint method:
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will detect `render.yaml`
5. You may need to manually create the static site after the backend is created
6. Update environment variables as described in Step 3

**Note:** The Blueprint method works best for the backend. For the frontend, use the manual Static Site creation method below.

---

## Manual Deployment Steps

### Deploy Backend First

1. **Go to Render Dashboard** → "New +" → "Web Service"
2. **Connect GitHub Repository**
3. **Configure Backend:**
   - **Name:** `presentera-backend`
   - **Environment:** Python 3
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free (or choose paid)

4. **Add Environment Variables (Optional):**
   - `PORT` = 10000 (usually auto-set)
   - `CORS_ORIGINS` = (set after frontend is deployed)

5. **Click "Create Web Service"**
6. **Wait for deployment** and note your backend URL: `https://presentera-backend.onrender.com`

### Deploy Frontend

1. **Go to Render Dashboard** → "New +" → "Static Site"
2. **Connect GitHub Repository**
3. **Configure Frontend:**
   - **Name:** `presentera-frontend`
   - **Region:** Same as backend (for better performance)
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
   - **Plan:** Free (or choose paid)

4. **Add Environment Variables:**
   - `REACT_APP_BACKEND_URL` = `https://presentera-backend.onrender.com`
   - `DISABLE_ESLINT_PLUGIN` = `true` (optional, for faster builds)
   - `GENERATE_SOURCEMAP` = `false` (optional, for smaller builds)

5. **SPA Routing:**
   - Render Static Sites handle SPA routing automatically
   - The `_redirects` file in `frontend/public/` ensures all routes serve `index.html`
   - React Router (BrowserRouter) handles client-side routing
   - Routes like `/` and `/app` will work correctly

6. **Click "Create Static Site"**
7. **Wait for deployment**

### Update CORS in Backend

1. Go to backend service → Environment
2. Add environment variable:
   - **Key:** `CORS_ORIGINS`
   - **Value:** `https://presentera-frontend.onrender.com`
3. Service will auto-restart

---

## Environment Variables

### Backend (Web Service)
```bash
PORT=10000  # Auto-set by Render
CORS_ORIGINS=https://presentera-frontend.onrender.com
```

### Frontend (Static Site)
```bash
REACT_APP_BACKEND_URL=https://presentera-backend.onrender.com
DISABLE_ESLINT_PLUGIN=true  # Optional
GENERATE_SOURCEMAP=false     # Optional
```

**Important:** 
- Frontend env vars must start with `REACT_APP_` to be accessible in React
- Changes require redeployment

---

## Post-Deployment

### 1. Test Your Services

**Backend:**
- Health check: `https://presentera-backend.onrender.com/health`
- API docs: `https://presentera-backend.onrender.com/docs`
- Root: `https://presentera-backend.onrender.com/`

**Frontend:**
- Main app: `https://presentera-frontend.onrender.com`
- Test PPTX upload functionality

### 2. Verify Integration

1. Open frontend in browser
2. Try uploading a PPTX file
3. Check browser console for errors
4. Verify API calls work

### 3. Enable Auto-Deploy

Both services support auto-deploy:
- **Backend:** Settings → Auto-Deploy → Enable
- **Frontend:** Settings → Auto-Deploy → Enable

---

## Troubleshooting

### Frontend Build Fails

**Problem:** Build command fails
**Solutions:**
- Check build logs in Render dashboard
- Verify `package.json` has correct build script
- Ensure `rootDir` is set to `frontend`
- Check Node.js version (Render uses latest LTS)

**Problem:** Environment variables not working
**Solutions:**
- Ensure variables start with `REACT_APP_`
- Redeploy after adding/changing variables
- Check variable names for typos

### Backend Issues

**Problem:** Backend doesn't start
**Solutions:**
- Check logs in Render dashboard
- Verify start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Ensure `requirements.txt` is correct
- Check Python version (Render uses 3.11+)

**Problem:** CORS errors
**Solutions:**
- Verify `CORS_ORIGINS` is set correctly
- Ensure frontend URL matches exactly
- Restart backend service after changes

### Integration Issues

**Problem:** Frontend can't connect to backend
**Solutions:**
- Verify `REACT_APP_BACKEND_URL` is set correctly
- Check backend is running (not spun down)
- Test backend URL directly in browser
- Check browser console for errors

**Problem:** 404 errors on frontend routes (e.g., `/app` returns 404)
**Solutions:**
- Verify `_redirects` file exists in `frontend/public/` directory
- Ensure `routes` configuration in `render.yaml` includes the rewrite rule
- Check that `index.html` is in build output
- Verify React Router is using `BrowserRouter` (not `HashRouter`)
- After fixing, redeploy the frontend

### Free Tier Limitations

**Problem:** Services spin down after inactivity
**Solutions:**
- First request after spin-down takes 30-60 seconds
- Consider upgrading to paid plan for always-on service
- Use Render's "Always On" feature (paid plans)

**Problem:** Build timeouts
**Solutions:**
- Free tier has build time limits
- Optimize build process
- Consider upgrading for longer build times

---

## Configuration Comparison

### Render vs Vercel for Frontend

| Feature | Render (Static Site) | Vercel |
|---------|---------------------|--------|
| Free Tier | ✅ Yes | ✅ Yes |
| Build Speed | Slower | Faster |
| Auto-Deploy | ✅ Yes | ✅ Yes |
| Custom Domain | ✅ Yes | ✅ Yes |
| SPA Routing | ✅ Auto | ✅ Auto |
| Environment Variables | ✅ Yes | ✅ Yes |
| Cold Starts | N/A (Static) | N/A (Static) |

### Recommendation

- **Use Render** if you want everything in one place
- **Use Vercel** if you want faster frontend builds and better React optimization

---

## Quick Reference

### Service URLs
- **Backend:** `https://presentera-backend.onrender.com`
- **Frontend:** `https://presentera-frontend.onrender.com`
- **API Docs:** `https://presentera-backend.onrender.com/docs`

### Environment Variables Summary

**Backend:**
```
CORS_ORIGINS=https://presentera-frontend.onrender.com
```

**Frontend:**
```
REACT_APP_BACKEND_URL=https://presentera-backend.onrender.com
```

### Render Dashboard Links
- [Dashboard](https://dashboard.render.com/)
- [Documentation](https://render.com/docs)
- [Static Sites Guide](https://render.com/docs/static-sites)
- [Web Services Guide](https://render.com/docs/web-services)

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Render
3. ✅ Configure environment variables
4. ✅ Test integration
5. ✅ Set up custom domains (optional)
6. ✅ Enable monitoring (optional)

---

## Support

For issues:
- **Render Docs:** https://render.com/docs
- **Render Support:** https://render.com/support
- **Community:** https://community.render.com/

---

**Ready to deploy?** Follow the steps above and you'll have both services running on Render! 🚀


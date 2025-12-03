# Setup Checklist

Use this checklist to ensure everything is configured correctly for deployment.

## Pre-Deployment Checklist

### Git Repository
- [ ] Git repository initialized (`git init`)
- [ ] `.gitignore` file is in place (root directory)
- [ ] All files committed (`git add .` and `git commit`)
- [ ] GitHub repository created
- [ ] Local repo connected to GitHub (`git remote add origin ...`)
- [ ] Code pushed to GitHub (`git push -u origin main`)

### Backend Preparation
- [ ] `requirements.txt` is up to date
- [ ] `render.yaml` exists (optional, for Render Blueprint)
- [ ] Backend code is tested locally
- [ ] CORS configuration updated (supports environment variable)

### Frontend Preparation
- [ ] `package.json` has correct build script
- [ ] `vercel.json` is configured correctly
- [ ] Frontend builds successfully locally (`npm run build`)

## Deployment Checklist

### Backend (Render)
- [ ] Render account created
- [ ] New Web Service created
- [ ] GitHub repository connected
- [ ] Configuration set:
  - [ ] Root Directory: `backend`
  - [ ] Build Command: `pip install -r requirements.txt`
  - [ ] Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
  - [ ] Plan selected (Free/Starter/etc.)
- [ ] Service deployed successfully
- [ ] Backend URL obtained (e.g., `https://your-app.onrender.com`)
- [ ] Health check works (`/health` endpoint)
- [ ] API docs accessible (`/docs` endpoint)

### Frontend (Vercel)
- [ ] Vercel account created
- [ ] New project created
- [ ] GitHub repository imported
- [ ] Configuration set:
  - [ ] Root Directory: `frontend`
  - [ ] Framework Preset: Create React App
  - [ ] Build Command: `npm run build` (auto-detected)
  - [ ] Output Directory: `build` (auto-detected)
- [ ] Environment variable added:
  - [ ] `REACT_APP_BACKEND_URL` = Your Render backend URL
- [ ] Project deployed successfully
- [ ] Frontend URL obtained (e.g., `https://your-app.vercel.app`)

### Post-Deployment Configuration
- [ ] Backend CORS updated (optional):
  - [ ] `CORS_ORIGINS` environment variable added in Render
  - [ ] Value set to frontend Vercel URL
  - [ ] Backend restarted
- [ ] Frontend environment variable verified:
  - [ ] `REACT_APP_BACKEND_URL` points to correct backend
  - [ ] Frontend redeployed if needed

## Testing Checklist

### Backend Testing
- [ ] Backend health endpoint works: `https://your-backend.onrender.com/health`
- [ ] API docs accessible: `https://your-backend.onrender.com/docs`
- [ ] Root endpoint works: `https://your-backend.onrender.com/`
- [ ] Can upload PPTX file via `/convert` endpoint (test with Postman/curl)

### Frontend Testing
- [ ] Frontend loads without errors
- [ ] No console errors in browser
- [ ] Can navigate between pages
- [ ] Can upload PPTX file
- [ ] Conversion works end-to-end
- [ ] No CORS errors in console

### Integration Testing
- [ ] Frontend can communicate with backend
- [ ] PPTX upload and conversion works
- [ ] All API calls succeed
- [ ] Error handling works correctly

## Security Checklist

- [ ] `.env` files are in `.gitignore`
- [ ] No secrets committed to git
- [ ] CORS origins restricted (not using `*` in production)
- [ ] HTTPS enabled (automatic on Vercel/Render)
- [ ] Environment variables set in deployment platforms (not in code)

## Documentation Checklist

- [ ] README.md updated
- [ ] DEPLOYMENT.md reviewed
- [ ] ENVIRONMENT_VARIABLES.md reviewed
- [ ] Team members have access to:
  - [ ] GitHub repository
  - [ ] Vercel project
  - [ ] Render service

## Monitoring Checklist

- [ ] Vercel deployment notifications set up (optional)
- [ ] Render service monitoring enabled
- [ ] Error tracking considered (optional)
- [ ] Logs accessible in both platforms

## Optional Enhancements

- [ ] Custom domain configured (Vercel)
- [ ] Custom domain configured (Render)
- [ ] SSL certificates verified
- [ ] Performance monitoring set up
- [ ] Analytics integrated (optional)

## Troubleshooting Reference

If something doesn't work, check:

1. **Backend Issues:**
   - Render service logs
   - Health endpoint status
   - Environment variables in Render

2. **Frontend Issues:**
   - Vercel build logs
   - Browser console errors
   - Environment variables in Vercel
   - Network tab for API calls

3. **Integration Issues:**
   - CORS configuration
   - Backend URL in frontend env var
   - Backend service is running (not spun down)

## Quick Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Render Dashboard:** https://dashboard.render.com/
- **GitHub Repository:** Your repo URL
- **Frontend URL:** Your Vercel URL
- **Backend URL:** Your Render URL
- **API Docs:** Your Render URL + `/docs`

---

## Notes

- Render free tier services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to paid plan for always-on service
- Environment variables require service restart/redeploy to take effect

---

**All checked? You're ready to go! 🚀**


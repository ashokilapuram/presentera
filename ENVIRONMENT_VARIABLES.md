# Environment Variables Guide

This document explains all environment variables needed for the Presentera application.

## Overview

The application consists of two parts:
- **Frontend** (React) - Deployed on Vercel
- **Backend** (FastAPI) - Deployed on Render

---

## Frontend Environment Variables (Vercel)

### Required Variables

#### `REACT_APP_BACKEND_URL`
- **Description:** The URL of your backend API
- **Format:** Full URL with protocol (https://)
- **Example:** `https://presentera-backend.onrender.com`
- **Default (Development):** `http://localhost:8000`
- **Where to Set:** Vercel Dashboard → Project Settings → Environment Variables
- **Important:** 
  - Must start with `REACT_APP_` to be accessible in React
  - Set for all environments (Production, Preview, Development)
  - Update this after deploying the backend

### How to Set in Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings"
3. Navigate to "Environment Variables"
4. Click "Add New"
5. Enter:
   - **Key:** `REACT_APP_BACKEND_URL`
   - **Value:** `https://your-backend.onrender.com`
   - **Environment:** Select all (Production, Preview, Development)
6. Click "Save"
7. **Important:** Redeploy your application for changes to take effect

### Usage in Code

The frontend uses this variable in `EditorApp.js`:

```javascript
const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
```

---

## Backend Environment Variables (Render)

### Required Variables

#### `PORT`
- **Description:** Port number for the server to listen on
- **Format:** Integer
- **Example:** `10000`
- **Default:** Render automatically sets this
- **Where to Set:** Usually auto-set by Render, but can be overridden
- **Note:** Render provides `$PORT` in the start command, which is automatically set

### Optional Variables

#### `CORS_ORIGINS`
- **Description:** Comma-separated list of allowed CORS origins
- **Format:** Comma-separated URLs
- **Example:** `https://presentera.vercel.app,https://www.presentera.com`
- **Default:** `*` (allows all origins - current implementation)
- **Where to Set:** Render Dashboard → Environment → Environment Variables
- **Security Note:** 
  - Currently, the backend allows all origins (`*`)
  - For production, it's recommended to restrict this to your frontend domain(s)
  - See "Updating CORS Configuration" below

### How to Set in Render

1. Go to your Render service dashboard
2. Click on "Environment" tab
3. Scroll to "Environment Variables"
4. Click "Add Environment Variable"
5. Enter:
   - **Key:** `CORS_ORIGINS` (or other variable name)
   - **Value:** Your frontend URL(s)
6. Click "Save Changes"
7. **Important:** The service will automatically restart

### Updating CORS Configuration

To use the `CORS_ORIGINS` environment variable, update `backend/main.py`:

**Current code (allows all origins):**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Updated code (uses environment variable):**
```python
import os

# Get allowed origins from environment variable
cors_origins = os.getenv("CORS_ORIGINS", "*")
if cors_origins == "*":
    allowed_origins = ["*"]
else:
    allowed_origins = [origin.strip() for origin in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Development Environment Variables

### Frontend (.env file in `frontend/` directory)

Create `frontend/.env` for local development:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

### Backend (.env file in `backend/` directory)

Create `backend/.env` for local development (optional):

```env
PORT=8000
CORS_ORIGINS=http://localhost:3000
```

**Note:** `.env` files are already in `.gitignore` and won't be committed to git.

---

## Environment Variable Checklist

### Before Deployment

- [ ] Backend deployed on Render
- [ ] Backend URL obtained (e.g., `https://your-app.onrender.com`)
- [ ] Frontend environment variable `REACT_APP_BACKEND_URL` set in Vercel
- [ ] Backend environment variable `CORS_ORIGINS` set in Render (optional but recommended)
- [ ] Both services restarted/redeployed after setting variables

### After Deployment

- [ ] Test frontend can connect to backend
- [ ] Check browser console for errors
- [ ] Verify API calls work (try uploading a PPTX file)
- [ ] Check Render logs for any errors
- [ ] Verify CORS is working correctly

---

## Common Issues

### Issue: Frontend can't connect to backend

**Symptoms:**
- Network errors in browser console
- "Failed to fetch" errors
- CORS errors

**Solutions:**
1. Verify `REACT_APP_BACKEND_URL` is set correctly in Vercel
2. Check the backend URL is accessible (visit it in browser)
3. Ensure backend is running (check Render dashboard)
4. Verify CORS configuration allows your frontend domain

### Issue: Environment variable not working

**Symptoms:**
- Variable shows as `undefined` in code
- Default value is always used

**Solutions:**
1. **Frontend:** Ensure variable starts with `REACT_APP_`
2. **Frontend:** Redeploy after adding/changing variables
3. **Backend:** Restart service after adding/changing variables
4. Check for typos in variable names
5. Verify variable is set for the correct environment

### Issue: CORS errors

**Symptoms:**
- "Access to fetch at ... has been blocked by CORS policy"
- Preflight requests failing

**Solutions:**
1. Update `CORS_ORIGINS` in Render with your frontend URL
2. Update backend code to use environment variable (see above)
3. Ensure frontend URL matches exactly (including https/http)
4. Restart backend service after changes

---

## Quick Reference

### Frontend (Vercel)
```bash
REACT_APP_BACKEND_URL=https://your-backend.onrender.com
```

### Backend (Render)
```bash
PORT=10000  # Usually auto-set
CORS_ORIGINS=https://your-frontend.vercel.app  # Optional but recommended
```

### Local Development
```bash
# frontend/.env
REACT_APP_BACKEND_URL=http://localhost:8000

# backend/.env (optional)
PORT=8000
CORS_ORIGINS=http://localhost:3000
```

---

## Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use specific CORS origins** - Don't use `*` in production
3. **Use HTTPS** - Always use `https://` in production URLs
4. **Rotate secrets** - If you add API keys later, rotate them regularly
5. **Review environment variables** - Regularly audit what's set in your deployments

---

## Additional Resources

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [React Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/)


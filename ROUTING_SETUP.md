# Frontend Routing Setup for Deployment

This document explains how routing is configured for the Presentera frontend to work correctly after deployment.

## Routes in the Application

The app uses React Router with the following routes:
- `/` - Landing page
- `/app` - Main editor application
- `*` - Catch-all redirects to `/`

## How It Works

### Client-Side Routing (React Router)

The app uses `BrowserRouter` from `react-router-dom`:
- Routes are handled on the client side
- No page refresh when navigating
- URLs look clean (e.g., `/app` instead of `/#/app`)

### Server-Side Configuration

For `BrowserRouter` to work, the server must:
1. Serve `index.html` for all routes
2. Let React Router handle the routing on the client

## Files Configured

### 1. `frontend/public/_redirects`

This file ensures all routes serve `index.html`:
```
/*    /index.html   200
```

This file is copied to the `build` folder during `npm run build`.

### 2. `render.yaml`

The Render configuration includes routing rules:
```yaml
routes:
  - type: rewrite
    source: /*
    destination: /index.html
```

This tells Render to serve `index.html` for all routes.

## Deployment Platforms

### Vercel (Recommended) ✅

✅ **Automatically configured** - Vercel's `vercel.json` handles SPA routing perfectly:
```json
{
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**No additional configuration needed!** Vercel automatically:
- Serves `index.html` for all routes
- Handles React Router (BrowserRouter) perfectly
- Works with direct URLs, page refresh, and browser navigation

### Render Static Sites (Alternative)

If deploying on Render, you would need:
- `_redirects` file in `public/` folder
- Routes configuration in `render.yaml`

**But we recommend Vercel for the frontend** - it's optimized for React apps.

## Testing Routes

After deployment, test these scenarios:

1. **Direct Navigation:**
   - Visit `https://your-app.onrender.com/` → Should show landing page
   - Visit `https://your-app.onrender.com/app` → Should show editor
   - Visit `https://your-app.onrender.com/invalid` → Should redirect to `/`

2. **Page Refresh:**
   - Navigate to `/app` in the app
   - Refresh the page (F5)
   - Should still show the editor (not 404)

3. **Browser Back/Forward:**
   - Navigate between routes
   - Use browser back/forward buttons
   - Should work correctly

## Troubleshooting

### Problem: 404 on `/app` route

**Symptoms:**
- Landing page works (`/`)
- Editor page shows 404 (`/app`)
- Direct URL access fails

**Solutions:**
1. Verify `_redirects` file exists in `frontend/public/`
2. Check `render.yaml` has routes configuration
3. Ensure build includes `_redirects` in `build/` folder
4. Redeploy frontend after adding `_redirects`

### Problem: Routes work but refresh breaks

**Solution:**
- This means routing is partially working
- Verify `_redirects` file is correct
- Check server configuration

### Problem: Hash routing works but clean URLs don't

**Solution:**
- You might be using `HashRouter` instead of `BrowserRouter`
- Check `frontend/src/App.js` - should use `BrowserRouter`
- Change `HashRouter` to `BrowserRouter` if needed

## Current Configuration

✅ `BrowserRouter` is used in `App.js`  
✅ `vercel.json` has routes configuration (for Vercel deployment)  
✅ Ready for Vercel deployment - routing works automatically!  

## Verification Checklist

After deployment:
- [ ] Landing page loads at `/`
- [ ] Editor loads at `/app`
- [ ] Direct URL to `/app` works
- [ ] Page refresh on `/app` works
- [ ] Browser back/forward works
- [ ] Invalid routes redirect to `/`

---

**All routing is properly configured!** Your app should work correctly after deployment. 🚀


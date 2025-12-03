# Vercel Troubleshooting Guide

## Error: "Not Found" when uploading PPTX file

### Common Causes and Solutions

#### 1. Environment Variable Not Set or Not Rebuilt ⚠️ **MOST COMMON**

**Problem:** React embeds environment variables at **build time**, not runtime. If you set the environment variable after deployment, you need to rebuild.

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify `REACT_APP_BACKEND_URL` is set correctly:
   - **Key:** `REACT_APP_BACKEND_URL`
   - **Value:** `https://your-backend.onrender.com` (no trailing slash!)
   - **Environments:** Check all (Production, Preview, Development)
3. **Redeploy the project:**
   - Go to Deployments tab
   - Click "..." on latest deployment → "Redeploy"
   - OR push a new commit to trigger rebuild

**Important:** Environment variables starting with `REACT_APP_` are only available after a rebuild!

#### 2. Backend URL Format Issues

**Check:**
- ✅ No trailing slash: `https://backend.onrender.com` (correct)
- ❌ With trailing slash: `https://backend.onrender.com/` (wrong)
- ✅ Full URL with `https://`
- ❌ Missing protocol: `backend.onrender.com` (wrong)

**Solution:**
- Ensure URL is exactly: `https://your-backend.onrender.com`
- No trailing slash
- Include `https://`

#### 3. Backend Not Running

**Check:**
1. Visit your backend URL directly: `https://your-backend.onrender.com`
2. Should see: `{"status":"ok","message":"PPTX to JSON Converter API",...}`
3. Check health endpoint: `https://your-backend.onrender.com/health`
4. Check API docs: `https://your-backend.onrender.com/docs`

**If backend is down:**
- Check Render dashboard for service status
- Free tier services spin down after 15 min inactivity
- First request after spin-down takes 30-60 seconds

#### 4. CORS Issues

**Symptoms:**
- Browser console shows CORS errors
- Network tab shows preflight (OPTIONS) request failing

**Solution:**
1. In Render dashboard → Backend service → Environment
2. Add environment variable:
   - **Key:** `CORS_ORIGINS`
   - **Value:** `https://your-app.vercel.app` (your Vercel frontend URL)
3. Backend will auto-restart
4. Verify CORS is working

#### 5. Wrong Endpoint Path

**Check:**
- Backend endpoint: `/convert` (POST)
- Frontend is calling: `${backendUrl}/convert`
- Full URL should be: `https://backend.onrender.com/convert`

**Verify:**
- Open browser console
- Check the "Full request URL" log
- Should match: `https://your-backend.onrender.com/convert`

## Debugging Steps

### Step 1: Check Environment Variable

1. **In Vercel Dashboard:**
   - Settings → Environment Variables
   - Verify `REACT_APP_BACKEND_URL` exists
   - Check value is correct

2. **In Browser Console:**
   - Open your deployed app
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for log: `Backend URL: https://...`
   - Verify it matches your backend URL

### Step 2: Test Backend Directly

1. **Test root endpoint:**
   ```
   https://your-backend.onrender.com/
   ```
   Should return JSON with API info

2. **Test health endpoint:**
   ```
   https://your-backend.onrender.com/health
   ```
   Should return: `{"status":"healthy"}`

3. **Test convert endpoint (use Postman/curl):**
   ```bash
   curl -X POST https://your-backend.onrender.com/convert \
     -F "file=@test.pptx"
   ```

### Step 3: Check Network Tab

1. Open browser DevTools → Network tab
2. Try uploading a PPTX file
3. Look for the request to `/convert`
4. Check:
   - **Request URL:** Should be `https://your-backend.onrender.com/convert`
   - **Status:** 404 means endpoint not found
   - **Response:** Check error message

### Step 4: Verify Build Includes Environment Variable

**After setting environment variable:**
1. **Redeploy is required!**
2. Go to Deployments → Redeploy
3. Or push a commit to trigger rebuild
4. Wait for build to complete
5. Test again

## Quick Fix Checklist

- [ ] Environment variable `REACT_APP_BACKEND_URL` is set in Vercel
- [ ] Environment variable value is correct (no trailing slash)
- [ ] Project was **rebuilt** after setting environment variable
- [ ] Backend is running (check Render dashboard)
- [ ] Backend URL is accessible (visit in browser)
- [ ] CORS is configured in backend
- [ ] Browser console shows correct backend URL
- [ ] Network tab shows correct request URL

## Common Mistakes

### ❌ Setting env var but not rebuilding
**Fix:** Redeploy after setting environment variable

### ❌ Wrong URL format
**Fix:** Use `https://backend.onrender.com` (no trailing slash)

### ❌ Backend URL not accessible
**Fix:** Check Render dashboard, backend might be spun down

### ❌ CORS not configured
**Fix:** Add `CORS_ORIGINS` in Render backend environment

### ❌ Environment variable name wrong
**Fix:** Must be exactly `REACT_APP_BACKEND_URL` (case-sensitive)

## Still Not Working?

1. **Check Vercel Build Logs:**
   - Deployments → Latest deployment → Build Logs
   - Look for any errors

2. **Check Browser Console:**
   - Open DevTools → Console
   - Look for errors or the debug logs we added

3. **Check Network Tab:**
   - DevTools → Network
   - Find the `/convert` request
   - Check status, headers, response

4. **Test Backend Manually:**
   - Use Postman or curl to test backend directly
   - Verify backend works independently

---

**Most likely issue:** Environment variable was set but project wasn't rebuilt. **Redeploy your Vercel project!**


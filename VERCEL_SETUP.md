# Vercel Frontend Deployment

Your backend is deployed at: **https://number-game-969o.onrender.com**

## Deploy to Vercel

### Step 1: Go to Vercel
1. Visit https://vercel.com
2. Sign in with your GitHub account
3. Click "Add New..." → "Project"

### Step 2: Import Repository
1. Find and select `aryanpillar/Number-game`
2. Click "Import"

### Step 3: Configure Project
Set these settings:

**Framework Preset**: Vite

**Root Directory**: `client`

**Build Command**: `npm run build`

**Output Directory**: `dist`

**Install Command**: `npm install`

### Step 4: Add Environment Variables
Click "Environment Variables" and add these two variables:

**Variable 1:**
- **Name**: `VITE_API_URL`
- **Value**: `https://number-game-969o.onrender.com`

**Variable 2:**
- **Name**: `VITE_WS_URL`
- **Value**: `wss://number-game-969o.onrender.com`

### Step 5: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Copy your Vercel URL (e.g., `https://your-app.vercel.app`)

---

## After Vercel Deployment

### Update Backend CORS

Once you have your Vercel URL, you need to update the backend to allow requests from it:

1. Go to your Render dashboard: https://dashboard.render.com
2. Open your `number-game-969o` service
3. Go to "Environment" tab
4. Add new environment variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://your-app.vercel.app` (use your actual Vercel URL)
5. Click "Save Changes" (this will trigger a redeploy)

---

## Testing Your Deployment

### 1. Test Backend
Visit: https://number-game-969o.onrender.com/api/trees

You should see:
```json
{"trees": []}
```

### 2. Test Frontend
Visit your Vercel URL (e.g., `https://your-app.vercel.app`)

You should see:
- Navigation bar with "Calculation Discussions" title
- Login/Register buttons
- Empty state or "Create Starting Number" form

### 3. Test Full Flow
1. Click "Register" and create an account
2. Create a starting number (e.g., 42)
3. Add an operation (e.g., + 10)
4. Open in another browser tab
5. Verify real-time updates work

---

## Troubleshooting

### Frontend shows "Failed to fetch"
- Check that environment variables are set correctly in Vercel
- Verify backend URL is correct
- Check browser console for errors

### CORS errors
- Make sure you added `FRONTEND_URL` to Render
- Verify the URL matches your Vercel deployment exactly
- Wait for Render to finish redeploying after adding the variable

### WebSocket not connecting
- Check `VITE_WS_URL` uses `wss://` (not `ws://`)
- Verify backend is running (visit `/api/trees` endpoint)
- Check browser console for WebSocket errors

---

## Your Deployment URLs

**Backend API**: https://number-game-969o.onrender.com
**Frontend**: (will be provided after Vercel deployment)

Save these for future reference!

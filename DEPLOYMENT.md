# Deployment Guide: Vercel + Render

This guide will help you deploy the Calculation Tree application with:
- **Frontend** on Vercel (React client)
- **Backend** on Render (Node.js server with WebSocket + SQLite)

---

## Part 1: Deploy Backend to Render

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with your GitHub account

### Step 2: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `aryanpillar/Number-game`
3. Configure the service:
   - **Name**: `calculation-tree-backend` (or your choice)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

### Step 3: Add Environment Variables
In the "Environment" section, add:

```
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_PATH=/opt/render/project/src/server/data/database.sqlite
```

### Step 4: Add Persistent Disk
1. Scroll to "Disk" section
2. Click "Add Disk"
3. Configure:
   - **Name**: `calculation-tree-data`
   - **Mount Path**: `/opt/render/project/src/server/data`
   - **Size**: 1 GB (free tier)

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Once deployed, copy your backend URL (e.g., `https://calculation-tree-backend.onrender.com`)

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update Environment Variables
1. Open `client/.env.production` in your project
2. Replace with your Render backend URL:

```env
VITE_API_URL=https://your-backend-name.onrender.com
VITE_WS_URL=wss://your-backend-name.onrender.com
```

3. Commit and push changes:
```bash
git add client/.env.production
git commit -m "Update production API URLs"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com
2. Sign up with your GitHub account
3. Click "Add New..." → "Project"
4. Import your repository: `aryanpillar/Number-game`
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variables:
   - `VITE_API_URL`: `https://your-backend-name.onrender.com`
   - `VITE_WS_URL`: `wss://your-backend-name.onrender.com`
7. Click "Deploy"

### Step 3: Configure CORS on Backend
After deployment, you need to update the backend to allow requests from your Vercel domain.

1. Go to your Render dashboard
2. Open your web service
3. Go to "Environment" tab
4. Add new environment variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://your-app.vercel.app`
5. Click "Save Changes" (this will redeploy)

---

## Part 3: Update Backend CORS Configuration

You need to update the server to accept requests from your Vercel frontend.

### Option A: Update via GitHub (Recommended)

1. Open `server/src/index.ts` in your local project
2. Find the CORS configuration (around line 15):

```typescript
app.use(cors());
```

3. Replace with:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
```

4. Commit and push:
```bash
git add server/src/index.ts
git commit -m "Update CORS for production"
git push origin main
```

5. Render will automatically redeploy

---

## Testing Your Deployment

### 1. Test Backend
Visit your Render URL: `https://your-backend-name.onrender.com/api/trees`

You should see:
```json
{"trees": []}
```

### 2. Test Frontend
Visit your Vercel URL: `https://your-app.vercel.app`

You should see the application load with:
- Navigation bar
- "Create Starting Number" form (if logged in)
- Empty state or existing trees

### 3. Test Full Flow
1. Register a new account
2. Create a starting number
3. Add operations
4. Open in another browser tab - verify real-time updates work

---

## Troubleshooting

### Backend Issues

**Problem**: "Application failed to respond"
- Check Render logs: Dashboard → Your Service → Logs
- Verify build command completed successfully
- Check environment variables are set

**Problem**: Database not persisting
- Verify disk is mounted at correct path
- Check DATABASE_PATH environment variable
- Ensure disk size is sufficient

**Problem**: WebSocket not connecting
- Render free tier supports WebSockets
- Check browser console for connection errors
- Verify WS_URL uses `wss://` (not `ws://`)

### Frontend Issues

**Problem**: "Failed to fetch" errors
- Verify VITE_API_URL is correct in Vercel environment variables
- Check CORS is configured on backend
- Open browser DevTools → Network tab to see actual requests

**Problem**: Real-time updates not working
- Check VITE_WS_URL is correct
- Open browser console for WebSocket errors
- Verify backend WebSocket server is running

### CORS Issues

**Problem**: "CORS policy" errors
- Add your Vercel domain to backend CORS configuration
- Ensure credentials: true is set
- Check FRONTEND_URL environment variable on Render

---

## Important Notes

### Free Tier Limitations

**Render Free Tier**:
- Spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free
- Persistent disk included

**Vercel Free Tier**:
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Global CDN

### Keeping Backend Alive

To prevent Render from spinning down:
1. Use a service like UptimeRobot (free) to ping your backend every 5 minutes
2. Or upgrade to Render paid plan ($7/month)

### Database Backups

Render free tier doesn't include automatic backups. To backup:
1. Add a backup endpoint to your API
2. Periodically download the SQLite file
3. Or upgrade to paid plan with automatic backups

---

## Deployment Checklist

- [ ] Backend deployed to Render
- [ ] Persistent disk configured
- [ ] Environment variables set on Render
- [ ] Backend URL copied
- [ ] Frontend environment variables updated
- [ ] Frontend deployed to Vercel
- [ ] CORS configured on backend
- [ ] Tested registration/login
- [ ] Tested creating trees
- [ ] Tested adding operations
- [ ] Tested real-time updates
- [ ] Tested in multiple browsers/tabs

---

## URLs After Deployment

**Backend API**: `https://your-backend-name.onrender.com`
**Frontend App**: `https://your-app.vercel.app`

Save these URLs for future reference!

---

## Need Help?

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Check application logs in respective dashboards
- Review browser console for frontend errors
- Check Render logs for backend errors

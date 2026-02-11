# EduVillage Backend - Deployment Guide

## Render.com Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Prepare backend for deployment"
git push origin main
```

### 2. Create New Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: eduvillage-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Add Environment Variables
In Render dashboard, add these environment variables:

```
MONGO_URI=mongodb+srv://alikasif1424_db_user:hkXZMRxrlKOeaWZ@eduvillage.cuhpzej.mongodb.net/mydb?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=anything
PORT=5000
FRONTEND_URL=https://your-frontend-url.onrender.com
NODE_ENV=production
```

### 4. Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Your backend will be available at: `https://eduvillage-backend.onrender.com`

### 5. Update Frontend
Update your frontend's API base URL to point to your new backend URL.

## Important Notes
- Free tier on Render may spin down after inactivity
- First request after inactivity may take 30-60 seconds
- All existing functions remain unchanged
- CORS is configured to accept requests from your frontend URL

## Local Development
```bash
npm install
npm run dev
```

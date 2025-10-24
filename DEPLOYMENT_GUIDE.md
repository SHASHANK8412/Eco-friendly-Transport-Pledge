# 🚀 Deployment Guide - Eco-Friendly Pledge App

## Quick Recommendation: **Deploy on Render** (Easiest & Free)

---

## 📋 Pre-Deployment Setup

### 1. Setup MongoDB Atlas (Required)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a **free account**
3. Create a **free M0 cluster** (512 MB storage)
4. Click "Connect" → Choose "Connect your application"
5. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/eco-pledge?retryWrites=true&w=majority
   ```
6. **Important**: In MongoDB Atlas Dashboard:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - This allows Render/Vercel to connect

### 2. Prepare Environment Variables

You'll need these for deployment:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/eco-pledge

# OpenAI (for AI features)
OPENAI_API_KEY=sk-proj-your-api-key-here

# Firebase (for authentication)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-key-here\n-----END PRIVATE KEY-----"

# API Configuration
PORT=5000
NODE_ENV=production
```

---

## 🎯 Option 1: Render (Recommended - FREE)

### Why Render?
- ✅ Free tier (750 hours/month)
- ✅ Auto-deploys from GitHub
- ✅ Easy to configure
- ✅ Built-in SSL certificates
- ✅ Supports Node.js & Static sites

### Steps:

#### A. Deploy Backend

1. **Go to Render**: https://render.com
2. **Sign up** with your GitHub account
3. Click **"New +"** → Select **"Web Service"**
4. **Connect Repository**: Select `Eco-friendly-Transport-Pledge`
5. **Configure Service**:
   - **Name**: `eco-pledge-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

6. **Add Environment Variables** (Click "Advanced"):
   ```
   MONGODB_URI = <your-mongodb-atlas-connection-string>
   OPENAI_API_KEY = <your-openai-api-key>
   FIREBASE_PROJECT_ID = <your-firebase-project-id>
   FIREBASE_CLIENT_EMAIL = <your-firebase-client-email>
   FIREBASE_PRIVATE_KEY = <your-firebase-private-key>
   PORT = 5000
   NODE_ENV = production
   ```

7. Click **"Create Web Service"**

8. **Wait 5-10 minutes** for build to complete

9. **Copy your backend URL**: `https://eco-pledge-backend.onrender.com`

#### B. Deploy Frontend

1. In Render Dashboard, click **"New +"** → Select **"Static Site"**
2. Select same repository: `Eco-friendly-Transport-Pledge`
3. **Configure**:
   - **Name**: `eco-pledge-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Add Environment Variable**:
   ```
   VITE_API_URL = https://eco-pledge-backend.onrender.com
   ```
   (Use the backend URL from step A.9)

5. Click **"Create Static Site"**

6. **Your app is live!** Frontend URL: `https://eco-pledge-frontend.onrender.com`

#### ⚠️ Important Notes:
- Free tier services sleep after 15 mins of inactivity
- First request after sleep takes ~30 seconds to wake up
- For 24/7 uptime, upgrade to paid tier ($7/month per service)

---

## 🎯 Option 2: Vercel (Frontend) + Render (Backend)

### Why This Combo?
- ✅ Vercel = Best performance for React apps
- ✅ Both have generous free tiers
- ✅ Automatic deployments from GitHub

### Steps:

#### A. Deploy Backend on Render
Follow steps from Option 1, Section A (same process)

#### B. Deploy Frontend on Vercel

1. **Install Vercel CLI**:
   ```powershell
   npm install -g vercel
   ```

2. **Navigate to frontend**:
   ```powershell
   cd frontend
   ```

3. **Login to Vercel**:
   ```powershell
   vercel login
   ```

4. **Deploy**:
   ```powershell
   vercel
   ```

5. **Follow prompts**:
   - Link to existing project? `N`
   - Project name: `eco-pledge-frontend`
   - Which directory? `./` (current directory)
   - Want to override settings? `Y`
   - Build command: `npm run build`
   - Output directory: `dist`

6. **Add Environment Variable**:
   ```powershell
   vercel env add VITE_API_URL production
   ```
   Enter: `https://eco-pledge-backend.onrender.com`

7. **Deploy to production**:
   ```powershell
   vercel --prod
   ```

8. **Your app is live!** Vercel provides a URL like: `eco-pledge-frontend.vercel.app`

---

## 🎯 Option 3: Railway (Simplest Full-Stack)

### Why Railway?
- ✅ Detects both frontend & backend automatically
- ✅ $5 free credit (no credit card required initially)
- ✅ Very simple configuration

### Steps:

1. **Go to Railway**: https://railway.app
2. **Sign up** with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose: `Eco-friendly-Transport-Pledge`
6. Railway automatically detects:
   - Backend (Node.js app)
   - Frontend (Vite app)
7. **Add variables** for backend service:
   - Click on backend service
   - Go to "Variables" tab
   - Add all environment variables
8. **Add variable** for frontend:
   - Click frontend service
   - Add: `VITE_API_URL = <backend-railway-url>`
9. **Deploy!** Railway handles the rest

---

## 🎯 Option 4: Netlify (Frontend) + Render (Backend)

Similar to Vercel option, but using Netlify:

1. **Backend on Render** (same as Option 1)
2. **Frontend on Netlify**:
   - Go to https://netlify.com
   - Click "Add new site" → "Import existing project"
   - Connect GitHub repo
   - Configure:
     - Base directory: `frontend`
     - Build command: `npm run build`
     - Publish directory: `frontend/dist`
   - Add environment variable: `VITE_API_URL`

---

## 📊 Comparison Table

| Platform | Free Tier | Ease | Performance | Best For |
|----------|-----------|------|-------------|----------|
| **Render** | ✅ 750hrs | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Full-stack |
| **Vercel** | ✅ Unlimited | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Frontend |
| **Railway** | $5 credit | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Full-stack |
| **Netlify** | ✅ 100GB | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Frontend |

---

## ✅ Post-Deployment Checklist

After deployment:

1. **Test all features**:
   - [ ] User registration/login
   - [ ] Create pledge
   - [ ] View dashboard
   - [ ] AI Pledge Assistant
   - [ ] AI Eco Insights
   - [ ] Certificate generation
   - [ ] Daily check-ins

2. **Update Firebase**:
   - Add your deployed URLs to Firebase authorized domains
   - Go to Firebase Console → Authentication → Settings
   - Add: `your-frontend-url.onrender.com` or `.vercel.app`

3. **Test API connection**:
   - Visit: `https://your-backend.onrender.com/api/test/health`
   - Should return: `{"status":"ok"}`

4. **Monitor logs**:
   - Check Render/Vercel logs for any errors
   - Fix any environment variable issues

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution**: 
- Verify MongoDB connection string is correct
- Ensure IP whitelist includes 0.0.0.0/0 in MongoDB Atlas
- Check username/password in connection string

### Issue: "CORS Error"
**Solution**: 
- Backend CORS is already configured
- Make sure VITE_API_URL points to correct backend URL

### Issue: "Firebase Auth not working"
**Solution**: 
- Add deployed domain to Firebase authorized domains
- Check Firebase environment variables are correct

### Issue: "AI features returning errors"
**Solution**: 
- Verify OPENAI_API_KEY is set correctly
- Check OpenAI account has credits

---

## 💰 Cost Estimation

### Free Option (Render + MongoDB Atlas):
- **Cost**: $0/month
- **Limitations**: 
  - Services sleep after 15 mins inactivity
  - 750 hours/month (enough for 1 service 24/7)
  - MongoDB 512 MB storage

### Production Option (Render Starter):
- **Backend**: $7/month (always-on)
- **Frontend**: Free (static site)
- **MongoDB Atlas**: Free (M0 tier) or $9/month (M10)
- **Total**: $7-16/month

---

## 🎓 My Recommendation

**For Your Project**: Use **Render (Option 1)**

**Why?**
1. ✅ Completely free to start
2. ✅ Single platform for both frontend & backend
3. ✅ Easy to manage
4. ✅ Auto-deploys when you push to GitHub
5. ✅ Easy to upgrade later

**Alternative**: If you want best performance, use **Vercel (frontend) + Render (backend)**

---

## 🚀 Quick Start Command

After setting up on Render, future deployments are automatic:

```powershell
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main

# Render automatically deploys! 🎉
```

---

## 📞 Need Help?

If you encounter issues:
1. Check Render/Vercel build logs
2. Verify all environment variables
3. Test backend health endpoint
4. Check MongoDB Atlas connection

---

**Ready to deploy? Start with Option 1 (Render) - it's the easiest!** 🚀

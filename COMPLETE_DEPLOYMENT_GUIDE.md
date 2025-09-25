# 🚀 Complete Multi-Platform Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Prerequisites:
- [ ] GitHub repository with your code
- [ ] Vercel account (free)
- [ ] Render account (free)  
- [ ] Fly.io account (free)
- [ ] Clerk account (for authentication)
- [ ] Google Gemini API key (for AI)

### ✅ Required Files Created:
- [x] `vercel.json` - Vercel configuration
- [x] `render.yaml` - Render configuration
- [x] `fly.toml` - Fly.io configuration
- [x] `.gitignore` - Repository optimization
- [x] `docker-compose.yml` - Local development

---

## 🎯 Step-by-Step Deployment

### **Step 1: Deploy Python AI Service (Fly.io)**

#### 1.1 Install Fly CLI:
```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Mac/Linux
curl -L https://fly.io/install.sh | sh
```

#### 1.2 Login to Fly.io:
```bash
fly auth login
```

#### 1.3 Deploy Python Service:
```bash
cd Beautycareai/backend/python_service
fly launch
# Follow prompts:
# - App name: metizcare-python-service
# - Region: bom (Mumbai)
# - Deploy now: Yes
```

#### 1.4 Set Environment Variables:
```bash
fly secrets set BACKEND_URL=https://metizcare-backend.onrender.com
fly secrets set FRONTEND_URL=https://metizcare.vercel.app
```

#### 1.5 Test Python Service:
```bash
curl https://metizcare-python-service.fly.dev/health
```

---

### **Step 2: Deploy Backend (Render)**

#### 2.1 Go to Render Dashboard:
1. Visit [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"

#### 2.2 Connect Repository:
1. Connect your GitHub account
2. Select your Metizcare repository
3. Choose "Docker" as environment

#### 2.3 Configure Service:
- **Name**: `metizcare-backend`
- **Environment**: `Docker`
- **Dockerfile Path**: `Beautycareai/backend/Dockerfile`
- **Docker Context**: `Beautycareai/backend`
- **Plan**: `Free`

#### 2.4 Add Environment Variables:
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/metizcare
PYTHON_SERVICE_URL=https://metizcare-python-service.fly.dev
JWT_SECRET=your_super_secret_jwt_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGIN=https://metizcare.vercel.app
```

#### 2.5 Deploy:
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Note the URL: `https://metizcare-backend.onrender.com`

#### 2.6 Test Backend:
```bash
curl https://metizcare-backend.onrender.com/health
```

---

### **Step 3: Deploy Frontend (Vercel)**

#### 3.1 Go to Vercel Dashboard:
1. Visit [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"

#### 3.2 Import Repository:
1. Select your Metizcare repository
2. Click "Import"

#### 3.3 Configure Build Settings:
- **Framework Preset**: `Create React App`
- **Root Directory**: `Beautycareai/frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`

#### 3.4 Add Environment Variables:
```env
REACT_APP_BACKEND_URL=https://metizcare-backend.onrender.com
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
REACT_APP_PYTHON_SERVICE_URL=https://metizcare-python-service.fly.dev
```

#### 3.5 Deploy:
1. Click "Deploy"
2. Wait for deployment (2-3 minutes)
3. Note the URL: `https://metizcare.vercel.app`

#### 3.6 Test Frontend:
```bash
curl https://metizcare.vercel.app
```

---

## 🔧 Post-Deployment Configuration

### **Update Cross-Service URLs:**

#### 1. Update Backend CORS:
```javascript
// In your backend server.js
const corsOptions = {
  origin: [
    'https://metizcare.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
};
```

#### 2. Update Python Service CORS:
```python
# In your Python service
CORS(app, origins=[
    "https://metizcare.vercel.app",
    "https://metizcare-backend.onrender.com"
])
```

#### 3. Test Full Stack:
1. Open `https://metizcare.vercel.app`
2. Test authentication
3. Test AI face analysis
4. Test product recommendations

---

## 📊 Monitoring & Maintenance

### **Health Check URLs:**
- Frontend: `https://metizcare.vercel.app`
- Backend: `https://metizcare-backend.onrender.com/health`
- Python AI: `https://metizcare-python-service.fly.dev/health`

### **Log Monitoring:**
- **Vercel**: Dashboard → Functions → Logs
- **Render**: Dashboard → Service → Logs  
- **Fly.io**: `fly logs -a metizcare-python-service`

### **Performance Monitoring:**
- **Vercel**: Built-in analytics
- **Render**: Service metrics
- **Fly.io**: `fly metrics -a metizcare-python-service`

---

## 🚨 Troubleshooting

### **Common Issues & Solutions:**

#### 1. CORS Errors:
```bash
# Check CORS configuration
curl -H "Origin: https://metizcare.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://metizcare-backend.onrender.com/api/face-analysis
```

#### 2. Service Connection Issues:
```bash
# Test Python service
curl https://metizcare-python-service.fly.dev/health

# Test Backend
curl https://metizcare-backend.onrender.com/health

# Test Frontend
curl https://metizcare.vercel.app
```

#### 3. Environment Variable Issues:
- Check all environment variables are set correctly
- Ensure URLs don't have trailing slashes
- Verify API keys are valid

#### 4. Deployment Failures:
- Check build logs in respective dashboards
- Ensure all dependencies are in package.json
- Verify Docker configurations

---

## 💰 Cost Breakdown: ₹0 (ZERO!)

| Platform | Free Tier | Your Usage | Cost |
|----------|-----------|------------|------|
| **Vercel** | Unlimited sites | Frontend hosting | **₹0** |
| **Render** | 750 hrs/month | Backend + DB | **₹0** |
| **Fly.io** | 3 apps | Python service | **₹0** |
| **Total** | | | **₹0** |

---

## 🎉 Success Checklist

- [ ] Python AI service deployed on Fly.io
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] All services communicating correctly
- [ ] Authentication working
- [ ] AI face analysis working
- [ ] Product recommendations working
- [ ] All health checks passing

**Congratulations! Your Metizcare application is now live and completely FREE! 🚀**

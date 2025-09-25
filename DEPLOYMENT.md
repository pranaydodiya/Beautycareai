# Metizcare Deployment Guide

## 🚀 Free Hosting Options

### 1. Railway (Recommended)
**Why Railway?**
- Free tier: $5 credit monthly
- Automatic Docker deployment
- Built-in MongoDB
- Easy environment variable management
- GitHub integration

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Connect GitHub account
3. Import your repository
4. Add environment variables
5. Deploy!

**Railway Configuration:**
```yaml
# railway.json (create this file)
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "docker-compose.yml"
  },
  "deploy": {
    "startCommand": "docker-compose up -d",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### 2. Render
**Why Render?**
- Free tier available
- Docker support
- Automatic deployments
- Built-in databases

**Steps:**
1. Go to [render.com](https://render.com)
2. Connect GitHub
3. Create new Web Service
4. Select Docker
5. Configure environment variables

### 3. DigitalOcean App Platform
**Why DigitalOcean?**
- $100 credit for new users
- Excellent Docker support
- Managed databases
- Global CDN

**Steps:**
1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Create new app from GitHub
3. Select Docker deployment
4. Configure services

### 4. Fly.io
**Why Fly.io?**
- Generous free tier
- Global deployment
- Docker native
- Great for AI/ML apps

**Steps:**
1. Install Fly CLI
2. Run `fly launch`
3. Configure fly.toml
4. Deploy with `fly deploy`

## 🔧 Environment Variables Setup

### Required Variables for All Platforms:
```env
# Database
MONGO_DB_NAME=metizcare
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/metizcare

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key

# AI Services
GEMINI_API_KEY=your-gemini-api-key

# URLs (will be provided by hosting platform)
REACT_APP_BACKEND_URL=https://your-backend-url.com
PYTHON_SERVICE_URL=http://python-service:5001
```

## 📦 ML Models Setup

### Option 1: External Storage (Recommended)
Store large ML models on cloud storage and download during deployment:

```bash
# Add to Dockerfile
RUN mkdir -p /app/models && \
    wget -O /app/models/res10_300x300_ssd_iter_140000.caffemodel \
    "https://your-storage.com/models/res10_300x300_ssd_iter_140000.caffemodel"
```

### Option 2: Git LFS (Limited)
Use Git LFS for essential models only:
```bash
git lfs track "*.caffemodel"
git lfs track "*.h5"
```

### Option 3: Model Download Script
Create a setup script that downloads models:

```bash
#!/bin/bash
# download-models.sh
mkdir -p models
# Add download commands for your models
```

## 🐳 Docker Optimization

### Multi-stage Build Optimization
```dockerfile
# Optimized Dockerfile for production
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### Docker Compose for Production
```yaml
# docker-compose.prod.yml
version: "3.9"
services:
  mongo:
    image: mongo:6
    restart: unless-stopped
    environment:
      - MONGO_INITDB_DATABASE=${MONGO_DB_NAME}
    volumes:
      - mongo_data:/data/db

  python-service:
    build:
      context: ./Beautycareai/backend/python_service
    restart: unless-stopped
    environment:
      - DEEPFACE_HOME=/cache/deepface
    volumes:
      - deepface_cache:/cache/deepface

  backend:
    build:
      context: ./Beautycareai/backend
    depends_on:
      - mongo
      - python-service
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/${MONGO_DB_NAME}
      - PYTHON_SERVICE_URL=http://python-service:5001
    volumes:
      - uploads_data:/app/uploads

  frontend:
    build:
      context: ./Beautycareai/frontend
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mongo_data:
  deepface_cache:
  uploads_data:
```

## 🔍 Monitoring & Logs

### Health Checks
Add health checks to your services:

```yaml
# In docker-compose.yml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Logging
```javascript
// Add to your backend
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 💰 Cost Optimization

### Free Tier Limits:
- **Railway**: $5/month credit
- **Render**: 750 hours/month free
- **DigitalOcean**: $100 credit for new users
- **Fly.io**: 3 shared-cpu-1x apps free

### Tips to Stay Free:
1. Use shared CPU instances
2. Optimize Docker images
3. Use external storage for large files
4. Implement caching
5. Use CDN for static assets

## 🚨 Common Deployment Issues

### Issue 1: Out of Memory
**Solution**: Increase memory allocation or optimize ML models

### Issue 2: Build Timeout
**Solution**: Use multi-stage builds and optimize Dockerfile

### Issue 3: Environment Variables
**Solution**: Double-check all required variables are set

### Issue 4: Database Connection
**Solution**: Use managed database services

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review Docker logs
3. Test locally first
4. Contact platform support

---

**Next Steps:**
1. Choose your hosting platform
2. Set up environment variables
3. Configure ML model storage
4. Deploy and test
5. Monitor performance

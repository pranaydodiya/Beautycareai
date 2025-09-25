#!/bin/bash

# Metizcare Deployment Preparation Script
# This script prepares your project for direct upload deployment

echo "🚀 Metizcare Deployment Preparation"
echo "=================================="

# Create deployment directories
echo "📁 Creating deployment directories..."
mkdir -p deployment/frontend
mkdir -p deployment/backend
mkdir -p deployment/python

# Copy frontend files
echo "📦 Preparing frontend package..."
cp -r Beautycareai/frontend/* deployment/frontend/
cp vercel.json deployment/frontend/

# Copy backend files
echo "📦 Preparing backend package..."
cp -r Beautycareai/backend/* deployment/backend/
cp render.yaml deployment/backend/

# Copy python service files
echo "📦 Preparing python package..."
cp -r Beautycareai/backend/python_service/* deployment/python/
cp fly.toml deployment/python/

# Create environment template files
echo "📝 Creating environment templates..."

# Frontend environment template
cat > deployment/frontend/.env.template << EOF
# Frontend Environment Variables for Vercel
REACT_APP_BACKEND_URL=https://metizcare-backend.onrender.com
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here
REACT_APP_PYTHON_SERVICE_URL=https://metizcare-python-service.fly.dev
EOF

# Backend environment template
cat > deployment/backend/.env.template << EOF
# Backend Environment Variables for Render
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/metizcare
PYTHON_SERVICE_URL=https://metizcare-python-service.fly.dev
JWT_SECRET=your_jwt_secret_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGIN=https://metizcare.vercel.app
EOF

# Python environment template
cat > deployment/python/.env.template << EOF
# Python Service Environment Variables for Fly.io
FLASK_ENV=production
DEEPFACE_HOME=/cache/deepface
BACKEND_URL=https://metizcare-backend.onrender.com
FRONTEND_URL=https://metizcare.vercel.app
EOF

# Create deployment instructions
echo "📋 Creating deployment instructions..."
cat > deployment/DEPLOYMENT_INSTRUCTIONS.txt << EOF
# Metizcare Deployment Instructions

## 🚀 Deployment Order:
1. Python Service (Fly.io) - Deploy first
2. Backend (Render) - Deploy second  
3. Frontend (Vercel) - Deploy last

## 📁 Deployment Packages Ready:
- deployment/frontend/ - Upload to Vercel
- deployment/backend/ - Upload to Render
- deployment/python/ - Upload to Fly.io

## 🔧 Next Steps:
1. Go to each platform dashboard
2. Upload the respective package
3. Set environment variables
4. Deploy!

## 📞 Support:
- Check deployment guides in project root
- Test each service after deployment
- Monitor logs for any issues
EOF

echo ""
echo "✅ Deployment preparation complete!"
echo "==================================="
echo ""
echo "📁 Check the 'deployment' folder:"
echo "- frontend/ - Ready for Vercel"
echo "- backend/ - Ready for Render"  
echo "- python/ - Ready for Fly.io"
echo ""
echo "📋 Read DEPLOYMENT_INSTRUCTIONS.txt for next steps"
echo ""
echo "🎯 Recommended deployment order:"
echo "1. Python Service (Fly.io)"
echo "2. Backend (Render)"
echo "3. Frontend (Vercel)"
echo ""

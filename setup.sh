#!/bin/bash

# Metizcare Setup Script
# This script helps set up the Metizcare project for deployment

echo "🚀 Metizcare Setup Script"
echo "========================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database
MONGO_DB_NAME=metizcare

# JWT
JWT_SECRET=$(openssl rand -base64 32)

# Clerk Authentication (Replace with your actual keys)
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here

# AI Service (Replace with your actual key)
GEMINI_API_KEY=your_gemini_api_key_here

# Backend URL (Update for production)
REACT_APP_BACKEND_URL=http://localhost:5000
EOF
    echo "✅ .env file created with default values"
    echo "⚠️  Please update the .env file with your actual API keys"
else
    echo "✅ .env file already exists"
fi

# Create models directory
echo "📁 Creating models directory..."
mkdir -p Beautycareai/backend/python_service/models
echo "✅ Models directory created"

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p Beautycareai/backend/uploads
echo "✅ Uploads directory created"

# Download ML models (placeholder - you need to add actual download URLs)
echo "📥 ML Models Setup"
echo "=================="
echo "⚠️  ML models are not included in the repository due to size."
echo "Please download the following models and place them in Beautycareai/backend/python_service/models/:"
echo ""
echo "Required models:"
echo "- res10_300x300_ssd_iter_140000.caffemodel"
echo "- Various .h5 model files for age, gender, emotion detection"
echo ""
echo "You can download them from:"
echo "- OpenCV GitHub releases"
echo "- DeepFace model repositories"
echo "- Your own model storage"
echo ""

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose build
echo "✅ Docker images built"

# Start services
echo "🚀 Starting services..."
docker-compose up -d
echo "✅ Services started"

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
if curl -f http://localhost:5000/health &> /dev/null; then
    echo "✅ Backend service is healthy"
else
    echo "⚠️  Backend service may not be ready yet"
fi

if curl -f http://localhost:5001/health &> /dev/null; then
    echo "✅ Python AI service is healthy"
else
    echo "⚠️  Python AI service may not be ready yet"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo "Your Metizcare application is now running:"
echo "• Frontend: http://localhost:3000"
echo "• Backend API: http://localhost:5000"
echo "• Python AI Service: http://localhost:5001"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop services: docker-compose down"
echo "To restart services: docker-compose restart"
echo ""
echo "⚠️  Don't forget to:"
echo "1. Update .env file with your actual API keys"
echo "2. Download and place ML models in the models directory"
echo "3. Test all functionality before deploying to production"

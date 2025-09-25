@echo off
REM Metizcare Setup Script for Windows
REM This script helps set up the Metizcare project for deployment

echo 🚀 Metizcare Setup Script
echo =========================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    (
        echo # Database
        echo MONGO_DB_NAME=metizcare
        echo.
        echo # JWT
        echo JWT_SECRET=your_jwt_secret_here_replace_with_random_string
        echo.
        echo # Clerk Authentication ^(Replace with your actual keys^)
        echo CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
        echo REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
        echo.
        echo # AI Service ^(Replace with your actual key^)
        echo GEMINI_API_KEY=your_gemini_api_key_here
        echo.
        echo # Backend URL ^(Update for production^)
        echo REACT_APP_BACKEND_URL=http://localhost:5000
    ) > .env
    echo ✅ .env file created with default values
    echo ⚠️  Please update the .env file with your actual API keys
) else (
    echo ✅ .env file already exists
)

REM Create models directory
echo 📁 Creating models directory...
if not exist "Beautycareai\backend\python_service\models" mkdir "Beautycareai\backend\python_service\models"
echo ✅ Models directory created

REM Create uploads directory
echo 📁 Creating uploads directory...
if not exist "Beautycareai\backend\uploads" mkdir "Beautycareai\backend\uploads"
echo ✅ Uploads directory created

REM Download ML models (placeholder - you need to add actual download URLs)
echo 📥 ML Models Setup
echo ==================
echo ⚠️  ML models are not included in the repository due to size.
echo Please download the following models and place them in Beautycareai\backend\python_service\models\:
echo.
echo Required models:
echo - res10_300x300_ssd_iter_140000.caffemodel
echo - Various .h5 model files for age, gender, emotion detection
echo.
echo You can download them from:
echo - OpenCV GitHub releases
echo - DeepFace model repositories
echo - Your own model storage
echo.

REM Build Docker images
echo 🐳 Building Docker images...
docker-compose build
if %errorlevel% neq 0 (
    echo ❌ Failed to build Docker images
    pause
    exit /b 1
)
echo ✅ Docker images built

REM Start services
echo 🚀 Starting services...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ Failed to start services
    pause
    exit /b 1
)
echo ✅ Services started

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check service health
echo 🔍 Checking service health...
curl -f http://localhost:5000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend service is healthy
) else (
    echo ⚠️  Backend service may not be ready yet
)

curl -f http://localhost:5001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python AI service is healthy
) else (
    echo ⚠️  Python AI service may not be ready yet
)

echo.
echo 🎉 Setup Complete!
echo ==================
echo Your Metizcare application is now running:
echo • Frontend: http://localhost:3000
echo • Backend API: http://localhost:5000
echo • Python AI Service: http://localhost:5001
echo.
echo To view logs: docker-compose logs -f
echo To stop services: docker-compose down
echo To restart services: docker-compose restart
echo.
echo ⚠️  Don't forget to:
echo 1. Update .env file with your actual API keys
echo 2. Download and place ML models in the models directory
echo 3. Test all functionality before deploying to production
echo.
pause

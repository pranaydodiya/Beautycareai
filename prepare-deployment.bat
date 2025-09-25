@echo off
REM Metizcare Deployment Preparation Script
REM This script prepares your project for direct upload deployment

echo 🚀 Metizcare Deployment Preparation
echo ==================================

REM Create deployment directories
echo 📁 Creating deployment directories...
if not exist "deployment" mkdir "deployment"
if not exist "deployment\frontend" mkdir "deployment\frontend"
if not exist "deployment\backend" mkdir "deployment\backend"
if not exist "deployment\python" mkdir "deployment\python"

REM Copy frontend files
echo 📦 Preparing frontend package...
xcopy "Beautycareai\frontend\*" "deployment\frontend\" /E /I /Y
copy "vercel.json" "deployment\frontend\"

REM Copy backend files
echo 📦 Preparing backend package...
xcopy "Beautycareai\backend\*" "deployment\backend\" /E /I /Y
copy "render.yaml" "deployment\backend\"

REM Copy python service files
echo 📦 Preparing python package...
xcopy "Beautycareai\backend\python_service\*" "deployment\python\" /E /I /Y
copy "fly.toml" "deployment\python\"

REM Create environment template files
echo 📝 Creating environment templates...

REM Frontend environment template
(
echo # Frontend Environment Variables for Vercel
echo REACT_APP_BACKEND_URL=https://metizcare-backend.onrender.com
echo REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here
echo REACT_APP_PYTHON_SERVICE_URL=https://metizcare-python-service.fly.dev
) > "deployment\frontend\.env.template"

REM Backend environment template
(
echo # Backend Environment Variables for Render
echo NODE_ENV=production
echo MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/metizcare
echo PYTHON_SERVICE_URL=https://metizcare-python-service.fly.dev
echo JWT_SECRET=your_jwt_secret_here
echo CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
echo GEMINI_API_KEY=your_gemini_api_key
echo CORS_ORIGIN=https://metizcare.vercel.app
) > "deployment\backend\.env.template"

REM Python environment template
(
echo # Python Service Environment Variables for Fly.io
echo FLASK_ENV=production
echo DEEPFACE_HOME=/cache/deepface
echo BACKEND_URL=https://metizcare-backend.onrender.com
echo FRONTEND_URL=https://metizcare.vercel.app
) > "deployment\python\.env.template"

REM Create deployment instructions
echo 📋 Creating deployment instructions...
(
echo # Metizcare Deployment Instructions
echo.
echo ## 🚀 Deployment Order:
echo 1. Python Service ^(Fly.io^) - Deploy first
echo 2. Backend ^(Render^) - Deploy second  
echo 3. Frontend ^(Vercel^) - Deploy last
echo.
echo ## 📁 Deployment Packages Ready:
echo - deployment\frontend\ - Upload to Vercel
echo - deployment\backend\ - Upload to Render
echo - deployment\python\ - Upload to Fly.io
echo.
echo ## 🔧 Next Steps:
echo 1. Go to each platform dashboard
echo 2. Upload the respective package
echo 3. Set environment variables
echo 4. Deploy!
echo.
echo ## 📞 Support:
echo - Check deployment guides in project root
echo - Test each service after deployment
echo - Monitor logs for any issues
) > "deployment\DEPLOYMENT_INSTRUCTIONS.txt"

echo.
echo ✅ Deployment preparation complete!
echo ===================================
echo.
echo 📁 Check the 'deployment' folder:
echo - frontend\ - Ready for Vercel
echo - backend\ - Ready for Render  
echo - python\ - Ready for Fly.io
echo.
echo 📋 Read DEPLOYMENT_INSTRUCTIONS.txt for next steps
echo.
echo 🎯 Recommended deployment order:
echo 1. Python Service ^(Fly.io^)
echo 2. Backend ^(Render^)
echo 3. Frontend ^(Vercel^)
echo.
pause

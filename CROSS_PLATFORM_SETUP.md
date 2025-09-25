# Cross-Platform Communication Setup

## 🔗 Service Communication Flow

```
Frontend (Vercel) → Backend (Render) → Python AI (Fly.io)
     ↓                    ↓                    ↓
  React App          Node.js API         ML Services
  Port: 3000         Port: 5000          Port: 5001
```

## 🌐 URL Structure

### Production URLs:
- **Frontend**: `https://metizcare.vercel.app`
- **Backend**: `https://metizcare-backend.onrender.com`
- **Python AI**: `https://metizcare-python-service.fly.dev`

## 🔧 Environment Variables Configuration

### 1. Frontend (Vercel) Environment Variables:
```env
REACT_APP_BACKEND_URL=https://metizcare-backend.onrender.com
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
REACT_APP_PYTHON_SERVICE_URL=https://metizcare-python-service.fly.dev
```

### 2. Backend (Render) Environment Variables:
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/metizcare
PYTHON_SERVICE_URL=https://metizcare-python-service.fly.dev
JWT_SECRET=your_super_secret_jwt_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGIN=https://metizcare.vercel.app
```

### 3. Python AI Service (Fly.io) Environment Variables:
```env
FLASK_ENV=production
DEEPFACE_HOME=/cache/deepface
BACKEND_URL=https://metizcare-backend.onrender.com
FRONTEND_URL=https://metizcare.vercel.app
```

## 🔒 CORS Configuration

### Backend CORS Setup:
```javascript
// In your backend server.js
const cors = require('cors');

const corsOptions = {
  origin: [
    'https://metizcare.vercel.app',
    'http://localhost:3000' // For development
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### Python Service CORS Setup:
```python
# In your Python service
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=[
    "https://metizcare.vercel.app",
    "https://metizcare-backend.onrender.com",
    "http://localhost:3000"  # For development
])
```

## 🚀 Deployment Order

### Recommended Deployment Sequence:
1. **Python AI Service** (Fly.io) - Deploy first
2. **Backend** (Render) - Deploy second  
3. **Frontend** (Vercel) - Deploy last

### Why This Order?
- Python service needs to be ready for backend to connect
- Backend needs to be ready for frontend to connect
- Each service can test connectivity to the previous one

## 🔍 Health Check Endpoints

### Backend Health Check:
```javascript
// Add to your backend
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      python_service: 'checking...'
    }
  });
});
```

### Python Service Health Check:
```python
# Add to your Python service
@app.route('/health')
def health_check():
    return {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'python-ai-service'
    }
```

## 📊 Monitoring & Debugging

### 1. Check Service Connectivity:
```bash
# Test Python service
curl https://metizcare-python-service.fly.dev/health

# Test Backend
curl https://metizcare-backend.onrender.com/health

# Test Frontend
curl https://metizcare.vercel.app
```

### 2. View Logs:
- **Vercel**: Dashboard → Functions → View Logs
- **Render**: Dashboard → Service → Logs
- **Fly.io**: `fly logs` command

### 3. Debug Cross-Platform Issues:
```javascript
// Add to frontend for debugging
console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL);
console.log('Python Service URL:', process.env.REACT_APP_PYTHON_SERVICE_URL);
```

## 🔄 Update Process

### When You Need to Update:
1. **Update code** in respective directories
2. **Push to GitHub** - each platform auto-deploys
3. **Test connectivity** between services
4. **Monitor logs** for any issues

### Environment Variable Updates:
- **Vercel**: Dashboard → Project → Settings → Environment Variables
- **Render**: Dashboard → Service → Environment
- **Fly.io**: `fly secrets set KEY=value`

## 🚨 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check CORS configuration
2. **Connection Timeouts**: Verify URLs and health checks
3. **Environment Variables**: Ensure all are set correctly
4. **Service Dependencies**: Check deployment order

### Debug Commands:
```bash
# Check Fly.io service status
fly status

# Check Render service logs
# (Use Render dashboard)

# Check Vercel deployment status
# (Use Vercel dashboard)
```

This setup ensures seamless communication between all three services while keeping costs at zero! 🎉

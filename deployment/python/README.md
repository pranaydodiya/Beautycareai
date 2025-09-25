# Python Face Analysis Service

This service provides AI-powered face analysis using DeepFace and OpenCV for the MetizCare skincare recommendation system.

## Features

- Face detection and validation (face-only images)
- Skin tone analysis
- Undertone detection
- Skin texture analysis
- Concern detection (acne, wrinkles, dullness, redness)
- Age and gender estimation

## Setup

### Prerequisites

- Python 3.8 or higher
- pip package manager

### Installation

1. Navigate to the python_service directory:
```bash
cd backend/python_service
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the Service

1. Start the service:
```bash
python face_analysis.py
```

Or use the startup script:
```bash
python start_python_service.py
```

The service will start on `http://localhost:5001`

### API Endpoints

#### POST /analyze
Analyzes a face image and returns skin analysis results.

**Request Body:**
```json
{
  "image": "base64_encoded_image_data"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "skin_tone": "medium",
    "undertone": "warm",
    "texture_score": 125.5,
    "concerns": ["acne", "dullness"],
    "age": 28,
    "gender": "woman",
    "race": "asian"
  }
}
```

#### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

## Environment Variables

Set the following environment variable in your main backend `.env` file:

```
PYTHON_SERVICE_URL=http://localhost:5001
```

## Notes

- The service automatically downloads required models on first run
- Images are processed in memory and not stored permanently
- Face detection requires clear, well-lit images with a single face
- The service validates that uploaded images contain only faces (no body shots)

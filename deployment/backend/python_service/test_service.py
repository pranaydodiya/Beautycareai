#!/usr/bin/env python3
"""
Test script for the Python face analysis service
"""
import requests
import base64
import json

def test_health_endpoint():
    """Test the health check endpoint"""
    try:
        response = requests.get('http://localhost:5001/health')
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Python service. Make sure it's running on port 5001")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_analysis_endpoint():
    """Test the face analysis endpoint with a sample image"""
    try:
        # Create a simple test image (1x1 pixel)
        from PIL import Image
        import io
        
        # Create a minimal test image
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        # Convert to base64
        img_base64 = base64.b64encode(img_bytes.getvalue()).decode('utf-8')
        
        # Test the analysis endpoint
        response = requests.post('http://localhost:5001/analyze', 
                               json={'image': f'data:image/jpeg;base64,{img_base64}'})
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Analysis endpoint working")
                return True
            else:
                print(f"❌ Analysis failed: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ Analysis endpoint failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Analysis test error: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Python Face Analysis Service...")
    print("=" * 50)
    
    # Test health endpoint
    health_ok = test_health_endpoint()
    
    if health_ok:
        # Test analysis endpoint
        analysis_ok = test_analysis_endpoint()
        
        if analysis_ok:
            print("\n🎉 All tests passed! Service is working correctly.")
        else:
            print("\n⚠️  Health check passed but analysis failed. Check DeepFace installation.")
    else:
        print("\n❌ Service is not running. Start it with: python face_analysis.py")
    
    print("=" * 50)

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Test script for DeepFace face analysis service
"""

import requests
import base64
import json

def test_face_analysis():
    """Test the face analysis service with a sample image"""
    
    # Test with a sample image (you can replace this with your own image)
    # For now, we'll test the health endpoint first
    try:
        # Test health endpoint
        print("Testing health endpoint...")
        health_response = requests.get("http://localhost:5001/health")
        print(f"Health check status: {health_response.status_code}")
        print(f"Health check response: {health_response.json()}")
        
        if health_response.status_code == 200:
            print("✅ DeepFace service is running!")
        else:
            print("❌ DeepFace service is not responding")
            return
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to DeepFace service. Make sure it's running on port 5001")
        print("Run: python start_deepface_service.py")
        return
    except Exception as e:
        print(f"❌ Error testing service: {e}")
        return

if __name__ == "__main__":
    print("=== DeepFace Service Test ===")
    test_face_analysis()

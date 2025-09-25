#!/usr/bin/env python3
"""
Start the DeepFace-based face analysis service
"""

import subprocess
import sys
import os
from urllib.request import urlretrieve

def install_requirements():
    """Install required packages"""
    try:
        print("Installing required packages...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("Requirements installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"Error installing requirements: {e}")
        return False
    return True

def start_service():
    """Start the face analysis service"""
    try:
        # Ensure Caffe model exists (used by Face_detection.py if leveraged)
        caffe_model = "res10_300x300_ssd_iter_140000.caffemodel"
        if not os.path.exists(caffe_model):
            print("Caffe face detector weights not found. Downloading...")
            urls = [
                # Official OpenCV 3rdparty (raw download)
                "https://github.com/opencv/opencv_3rdparty/raw/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel",
                # Raw content CDN
                "https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel",
            ]
            downloaded = False
            for url in urls:
                try:
                    print("Trying:", url)
                    urlretrieve(url, caffe_model)
                    downloaded = True
                    print("Downloaded:", caffe_model)
                    break
                except Exception as e:
                    print("Download failed:", e)
            if not downloaded:
                print("Could not download Caffe model automatically.")
                print("Please download it manually and place next to this script:")
                print("  res10_300x300_ssd_iter_140000.caffemodel")
                print("From (open in browser and Save As):")
                print("  https://github.com/opencv/opencv_3rdparty/raw/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel")
                # Continue anyway; code paths that do not use DNN will still work

        # Ensure deploy.prototxt exists
        if not os.path.exists("deploy.prototxt"):
            print("Warning: deploy.prototxt not found in python_service."
                  " Place your model file as 'deploy.prototxt' if you plan to use DNN detector.")

        print("Starting DeepFace face analysis service...")
        subprocess.run([sys.executable, "face_analysis_deepface.py"])
    except KeyboardInterrupt:
        print("\nService stopped by user")
    except Exception as e:
        print(f"Error starting service: {e}")

if __name__ == "__main__":
    print("=== DeepFace Face Analysis Service ===")
    
    # Check if we're in the right directory
    if not os.path.exists("face_analysis_deepface.py"):
        print("Error: face_analysis_deepface.py not found. Please run from the python_service directory.")
        sys.exit(1)
    
    # Install requirements
    if install_requirements():
        # Start the service
        start_service()
    else:
        print("Failed to install requirements. Please check your Python environment.")
        sys.exit(1)

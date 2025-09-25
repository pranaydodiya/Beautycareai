#!/usr/bin/env python3
"""
Startup script for the Python face analysis service
"""
import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("Installing Python requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("Requirements installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"Error installing requirements: {e}")
        return False
    return True

def start_service():
    """Start the Flask service"""
    print("Starting Python face analysis service...")
    try:
        subprocess.run([sys.executable, "face_analysis.py"])
    except KeyboardInterrupt:
        print("\nService stopped by user")
    except Exception as e:
        print(f"Error starting service: {e}")

if __name__ == "__main__":
    if install_requirements():
        start_service()

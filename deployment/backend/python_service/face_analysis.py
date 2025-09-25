import os
import cv2
import numpy as np
from deepface import DeepFace
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from PIL import Image
import tempfile
import json

app = Flask(__name__)
CORS(app)

def detect_face_only(image_path):
    """Detect if image contains only a face (no body)"""
    try:
        # Load image
        img = cv2.imread(image_path)
        if img is None:
            return False, "Could not load image"
        
        # Convert to RGB
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Use DeepFace to detect faces
        try:
            face_objs = DeepFace.extract_faces(
                img_path=image_path,
                detector_backend='opencv',
                enforce_detection=True,
                align=True
            )
            
            if len(face_objs) == 0:
                return False, "No face detected"
            
            if len(face_objs) > 1:
                return False, "Multiple faces detected. Please upload a selfie with only one face."
            
            # Get face coordinates using OpenCV
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) == 0:
                return False, "Face detection failed"
            
            # Get the largest face
            largest_face = max(faces, key=lambda x: x[2] * x[3])
            x, y, w, h = largest_face
            
            # Calculate face area percentage
            img_area = img.shape[0] * img.shape[1]
            face_area = w * h
            face_percentage = (face_area / img_area) * 100
            
            # If face takes up more than 15% of the image, consider it a good selfie
            if face_percentage < 15:
                return False, "Face too small. Please upload a closer selfie."
            
            # Check if face is roughly centered and takes up reasonable portion
            img_center_x, img_center_y = img.shape[1] // 2, img.shape[0] // 2
            face_center_x, face_center_y = x + w // 2, y + h // 2
            
            # Calculate distance from center
            center_distance = np.sqrt((face_center_x - img_center_x)**2 + (face_center_y - img_center_y)**2)
            max_distance = min(img.shape[0], img.shape[1]) // 3
            
            if center_distance > max_distance:
                return False, "Face not centered. Please center your face in the image."
            
            return True, "Face detected successfully"
            
        except Exception as e:
            return False, f"Face detection error: {str(e)}"
            
    except Exception as e:
        return False, f"Image processing error: {str(e)}"

def analyze_skin_attributes(image_path):
    """Analyze skin tone, undertone, texture, and concerns"""
    try:
        # Analyze age, gender, race, emotion
        demography = DeepFace.analyze(
            img_path=image_path,
            actions=['age', 'gender', 'race', 'emotion'],
            detector_backend='opencv',
            enforce_detection=True
        )
        
        # Extract skin tone from race analysis
        race_results = demography[0]['race']
        dominant_race = max(race_results, key=race_results.get)
        
        # Map race to skin tone categories
        skin_tone_mapping = {
            'asian': 'light-medium',
            'indian': 'medium',
            'black': 'dark',
            'white': 'fair',
            'middle eastern': 'medium',
            'latino hispanic': 'medium'
        }
        
        skin_tone = skin_tone_mapping.get(dominant_race.lower(), 'medium')
        
        # Analyze undertone (simplified approach)
        img = cv2.imread(image_path)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Get face region
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) > 0:
            x, y, w, h = max(faces, key=lambda x: x[2] * x[3])
            face_region = img_rgb[y:y+h, x:x+w]
            
            # Analyze color channels for undertone
            mean_colors = np.mean(face_region, axis=(0, 1))
            r, g, b = mean_colors
            
            # Simple undertone detection
            if r > g and r > b:
                undertone = 'warm'
            elif b > r and b > g:
                undertone = 'cool'
            else:
                undertone = 'neutral'
        else:
            undertone = 'neutral'
        
        # Analyze texture and concerns (simplified)
        gray_face = cv2.cvtColor(face_region, cv2.COLOR_RGB2GRAY)
        
        # Texture analysis using Laplacian variance
        texture_score = cv2.Laplacian(gray_face, cv2.CV_64F).var()
        
        # Concern detection (simplified)
        concerns = []
        
        # Check for acne (dark spots)
        dark_spots = cv2.threshold(gray_face, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
        dark_spot_count = cv2.countNonZero(dark_spots)
        if dark_spot_count > (gray_face.size * 0.05):  # 5% threshold
            concerns.append('acne')
        
        # Check for dullness (low contrast)
        contrast = gray_face.std()
        if contrast < 30:
            concerns.append('dullness')
        
        # Check for redness
        red_channel = face_region[:, :, 0]
        red_mean = np.mean(red_channel)
        if red_mean > 140:
            concerns.append('redness')
        
        # Check for wrinkles (edge detection)
        edges = cv2.Canny(gray_face, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        if edge_density > 0.1:
            concerns.append('wrinkles')
        
        # Age-based concerns
        age = demography[0]['age']
        if age > 30:
            if 'wrinkles' not in concerns:
                concerns.append('aging')
        
        return {
            'skin_tone': skin_tone,
            'undertone': undertone,
            'texture_score': float(texture_score),
            'concerns': concerns,
            'age': age,
            'gender': demography[0]['dominant_gender'],
            'race': dominant_race
        }
        
    except Exception as e:
        return {
            'error': f"Analysis failed: {str(e)}",
            'skin_tone': 'medium',
            'undertone': 'neutral',
            'texture_score': 0,
            'concerns': [],
            'age': 25,
            'gender': 'unknown',
            'race': 'unknown'
        }

@app.route('/analyze', methods=['POST'])
def analyze_face():
    try:
        # Get image from request
        data = request.get_json()
        if 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Decode base64 image
        image_data = data['image'].split(',')[1]  # Remove data:image/jpeg;base64, prefix
        image_bytes = base64.b64decode(image_data)
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            temp_file.write(image_bytes)
            temp_path = temp_file.name
        
        try:
            # Detect face only
            face_detected, face_message = detect_face_only(temp_path)
            if not face_detected:
                return jsonify({
                    'success': False,
                    'error': face_message
                }), 400
            
            # Analyze skin attributes
            analysis = analyze_skin_attributes(temp_path)
            
            return jsonify({
                'success': True,
                'analysis': analysis
            })
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

import os
import warnings

# Reduce TensorFlow/NumPy/Deprecation console noise
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")  # suppress INFO/WARNING logs
os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")  # avoid oneDNN notice
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=DeprecationWarning)

# Ensure DeepFace caches models in a stable, project-local folder so downloads
# happen only once and persist across restarts.
_service_root = os.path.dirname(__file__)
_deepface_home = os.path.join(_service_root, ".deepface")
os.makedirs(_deepface_home, exist_ok=True)
os.environ.setdefault("DEEPFACE_HOME", _deepface_home)

import cv2
import numpy as np
from skimage.feature import blob_log
from skimage.color import rgb2gray
from deepface import DeepFace
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from PIL import Image
import tempfile
import json

# Prevent Flask from auto-loading .env files (can break if non-text files exist nearby)
os.environ.setdefault("FLASK_SKIP_DOTENV", "1")

app = Flask(__name__)
CORS(app)

# Product database for recommendations
product_db = {
    "skin_tone": {
        "light": {"foundation": "MAC NC15", "lipstick": "Soft Pink"},
        "medium": {"foundation": "MAC NC30", "lipstick": "Coral"},
        "dark": {"foundation": "MAC NW45", "lipstick": "Deep Red"}
    },
    "undertone": {
        "warm": {"foundation": "Yellow-based shades", "lipstick": "Peach/Warm Red"},
        "cool": {"foundation": "Pink-based shades", "lipstick": "Berry/Cool Pink"},
        "neutral": {"foundation": "Neutral shades", "lipstick": "Nude/Rose"}
    },
    "skin_concerns": {
        "pores": "Pore-minimizing primer",
        "fine_lines": "Hydrating serum",
        "pigmentation": "Vitamin C serum",
        "acne": "Anti-acne treatment",
        "dullness": "Brightening serum",
        "redness": "Soothing cream"
    },
    "eye_shape": {
        "almond": "Winged eyeliner",
        "hooded": "Smokey eye",
        "round": "Cat-eye liner"
    },
    "lip_fullness": {
        "thin": "Glossy lipstick",
        "full": "Matte bold lipstick"
    }
}

def analyze_skin_tone(image):
    """Analyze skin tone and undertone from the cheek area."""
    try:
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        height, width = image.shape[:2]
        cheek_region = hsv[int(height*0.4):int(height*0.6), int(width*0.3):int(width*0.7)]
        mean_hsv = np.mean(cheek_region, axis=(0, 1))
        brightness = mean_hsv[2]
        
        if brightness > 150:
            skin_tone = "light"
        elif brightness > 100:
            skin_tone = "medium"
        else:
            skin_tone = "dark"
            
        hue = mean_hsv[0]
        if hue < 20:
            undertone = "warm"
        elif hue < 40:
            undertone = "cool"
        else:
            undertone = "neutral"
            
        return skin_tone, undertone
    except Exception as e:
        print(f"Skin tone analysis error: {e}")
        return "medium", "neutral"

def analyze_skin_texture(image):
    """Analyze skin texture for pores, fine lines, and pigmentation."""
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)
        pore_score = np.mean(edges)
        
        sobel = cv2.Sobel(gray, cv2.CV_64F, 1, 1, ksize=5)
        line_score = np.mean(np.abs(sobel))
        
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        pigmentation_score = np.var(hsv[:, :, 2])
        
        concerns = []
        if pore_score > 50:
            concerns.append("pores")
        if line_score > 20:
            concerns.append("fine_lines")
        if pigmentation_score > 1000:
            concerns.append("pigmentation")
            
        # Additional concern detection
        # Check for acne (dark spots)
        dark_spots = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
        dark_spot_count = cv2.countNonZero(dark_spots)
        if dark_spot_count > (gray.size * 0.05):  # 5% threshold
            concerns.append("acne")
        
        # Check for dullness (low contrast)
        contrast = gray.std()
        if contrast < 30:
            concerns.append("dullness")
        
        # Check for redness
        red_channel = image[:, :, 2]
        red_mean = np.mean(red_channel)
        if red_mean > 140:
            concerns.append("redness")
        
        return concerns if concerns else ["none"]
    except Exception as e:
        print(f"Skin texture analysis error: {e}")
        return ["none"]

def detect_issue_boxes(image_bgr):
    """Detect acne, wrinkles, redness, dryness; return (boxes, annotated_bgr, stats).
    stats: per-label counts and coverage percent of image area.
    """
    try:
        annotated = image_bgr.copy()
        boxes = []
        area_sums = {"acne": 0, "wrinkles": 0, "redness": 0, "dryness": 0}
        counts = {"acne": 0, "wrinkles": 0, "redness": 0, "dryness": 0}

        gray_full = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)

        # Focus on largest face if present
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray_full, 1.2, 5)
        if len(faces) > 0:
            fx, fy, fw, fh = max(faces, key=lambda r: r[2] * r[3])
            roi = image_bgr[fy:fy+fh, fx:fx+fw]
            roi_gray = gray_full[fy:fy+fh, fx:fx+fw]
        else:
            fx, fy, fw, fh = 0, 0, image_bgr.shape[1], image_bgr.shape[0]
            roi = image_bgr
            roi_gray = gray_full

        # Acne detection with Laplacian of Gaussian blobs
        # Use red-enhanced grayscale to prioritize inflamed areas
        roi_rgb = cv2.cvtColor(roi, cv2.COLOR_BGR2RGB)
        gray = rgb2gray(roi_rgb).astype(np.float32)
        red_ch = roi_rgb[:, :, 0].astype(np.float32) / 255.0
        # Bias more towards redness to catch inflamed pimples
        red_boost = np.clip(gray * 0.25 + red_ch * 0.75, 0.0, 1.0)
        # Detect blobs across a tuned range and apply simple non-maximum suppression
        blobs = blob_log(red_boost, min_sigma=0.9, max_sigma=10.0, num_sigma=15, threshold=0.03)
        kept_centers = []  # (cx, cy, w, h)
        # blob_log returns (y, x, sigma)
        for (by, bx, bs) in blobs:
            r = int(bs * np.sqrt(2) * 2.0)  # approximate radius -> half box
            x = max(0, int(bx) - r)
            y = max(0, int(by) - r)
            w = min(int(2 * r), roi.shape[1] - x)
            h = min(int(2 * r), roi.shape[0] - y)
            area_box = w * h
            # discard overly small/large boxes
            if area_box < 30 or area_box > int((roi.shape[0] * roi.shape[1]) * 0.02):
                continue
            cx, cy = x + w / 2.0, y + h / 2.0
            too_close = False
            for (pcx, pcy, pw, ph) in kept_centers:
                if (cx - pcx) ** 2 + (cy - pcy) ** 2 < (max(pw, ph) * 0.6) ** 2:
                    too_close = True
                    break
            if too_close:
                continue
            kept_centers.append((cx, cy, w, h))
            boxes.append({"label": "acne", "x": int(fx + x), "y": int(fy + y), "w": int(w), "h": int(h)})
            area_sums["acne"] += int(area_box)
            counts["acne"] += 1
            cv2.rectangle(annotated, (fx + x, fy + y), (fx + x + w, fy + y + h), (0, 0, 255), 3)

        # Wrinkles (edge density)
        edges = cv2.Canny(roi_gray, 50, 150)
        win = 32
        step = 24
        for j in range(0, max(0, edges.shape[0] - win), step):
            for i in range(0, max(0, edges.shape[1] - win), step):
                patch = edges[j:j+win, i:i+win]
                if patch.size == 0:
                    continue
                if np.mean(patch > 0) > 0.25:
                    boxes.append({"label": "wrinkles", "x": int(fx + i), "y": int(fy + j), "w": int(win), "h": int(win)})
                    area_sums["wrinkles"] += int(win) * int(win)
                    counts["wrinkles"] += 1
                    cv2.rectangle(annotated, (fx + i, fy + j), (fx + i + win, fy + j + win), (255, 165, 0), 2)

        # Redness (strong red channel)
        red = roi[:, :, 2]
        red_mask = cv2.inRange(red, 160, 255)
        contours, _ = cv2.findContours(red_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for c in contours:
            area = cv2.contourArea(c)
            if area < 60:
                continue
            x, y, w, h = cv2.boundingRect(c)
            boxes.append({"label": "redness", "x": int(fx + x), "y": int(fy + y), "w": int(w), "h": int(h)})
            area_sums["redness"] += int(w) * int(h)
            counts["redness"] += 1
            cv2.rectangle(annotated, (fx + x, fy + y), (fx + x + w, fy + y + h), (0, 0, 200), 2)

        # Dryness (low variance)
        k = 7
        m = cv2.blur(roi_gray.astype(np.float32), (k, k))
        m2 = cv2.blur((roi_gray.astype(np.float32)) ** 2, (k, k))
        vmap = np.maximum(m2 - m * m, 0)
        vmap = cv2.normalize(vmap, None, 0, 1.0, cv2.NORM_MINMAX)
        dry_mask = (vmap < 0.08).astype(np.uint8) * 255
        contours, _ = cv2.findContours(dry_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for c in contours:
            area = cv2.contourArea(c)
            if area < 120:
                continue
            x, y, w, h = cv2.boundingRect(c)
            boxes.append({"label": "dryness", "x": int(fx + x), "y": int(fy + y), "w": int(w), "h": int(h)})
            area_sums["dryness"] += int(w) * int(h)
            counts["dryness"] += 1
            cv2.rectangle(annotated, (fx + x, fy + y), (fx + x + w, fy + y + h), (200, 200, 0), 2)

        # Use face ROI area for coverage percentage (more stable)
        img_area = roi.shape[0] * roi.shape[1]
        stats = {}
        for k in area_sums:
            perc = 0.0 if img_area == 0 else (area_sums[k] / float(img_area)) * 100.0
            stats[k] = {"count": int(counts[k]), "coverage_percent": round(float(perc), 2)}

        return boxes, annotated, stats
    except Exception as e:
        print("Annotation error:", e)
        return [], image_bgr

def analyze_facial_features(image_path):
    """Analyze eye shape and lip fullness using OpenCV."""
    try:
        # Prefer a bundled Haar cascade if present (project root or service dir),
        # otherwise fall back to OpenCV's built-in path
        def _haar_path():
            candidates = [
                os.path.join(os.path.dirname(__file__), 'haarcascade_frontalface_default.xml'),
                os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'haarcascade_frontalface_default.xml')),
                os.path.join(os.getcwd(), 'haarcascade_frontalface_default.xml'),
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml',
            ]
            for p in candidates:
                if os.path.exists(p):
                    return p
            return cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'

        face_cascade = cv2.CascadeClassifier(_haar_path())
        img = cv2.imread(image_path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            return "almond", "thin"
            
        x, y, w, h = faces[0]
        eye_region = gray[y:y+h//2, x:x+w]
        eye_width = np.mean(cv2.Canny(eye_region, 50, 150))
        eye_shape = "almond" if eye_width > 50 else "hooded"
        
        lip_region = gray[y+h//2:y+h, x:x+w]
        lip_score = np.mean(cv2.Canny(lip_region, 50, 150))
        lip_fullness = "full" if lip_score > 30 else "thin"
        
        return eye_shape, lip_fullness
    except Exception as e:
        print(f"Facial feature analysis error: {e}")
        return "almond", "thin"

def detect_emotion(image_path):
    """Detect emotion using DeepFace."""
    try:
        result = DeepFace.analyze(img_path=image_path, actions=['emotion'], enforce_detection=False)
        emotion = result[0]['dominant_emotion']
        confidence = result[0]['emotion'][emotion]
        
        # Map DeepFace emotions to your labels
        emotion_map = {
            'angry': 'anger',
            'happy': 'happiness',
            'neutral': 'neutrality',
            'sad': 'sadness',
            'surprise': 'surprise',
            'fear': 'fear',
            'disgust': 'disgust',
            'contempt': 'contempt'
        }
        return emotion_map.get(emotion, 'neutrality'), confidence
    except Exception as e:
        print(f"DeepFace emotion error: {e}")
        return "neutrality", 0.0

def analyze_demographics(image_path):
    """Analyze age, gender, and race using DeepFace."""
    try:
        result = DeepFace.analyze(
            img_path=image_path,
            actions=['age', 'gender', 'race'],
            enforce_detection=False
        )
        
        age = result[0]['age']
        gender = result[0]['dominant_gender']
        race = result[0]['dominant_race']
        
        return age, gender, race
    except Exception as e:
        print(f"Demographics analysis error: {e}")
        return 25, "unknown", "unknown"

def recommend_products(skin_tone, undertone, skin_concerns, eye_shape, lip_fullness):
    """Generate product recommendations based on analysis."""
    recommendations = {
        "foundation": product_db["skin_tone"][skin_tone]["foundation"],
        "lipstick": product_db["undertone"][undertone]["lipstick"],
        "skincare": [product_db["skin_concerns"].get(concern, concern) for concern in skin_concerns if concern != "none"],
        "eye_makeup": product_db["eye_shape"][eye_shape],
        "lip_style": product_db["lip_fullness"][lip_fullness]
    }
    return recommendations

@app.route('/analyze', methods=['POST'])
def analyze_face():
    try:
        # Get image from request
        data = request.get_json()
        if 'image' not in data:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        fast_mode = bool(data.get('fast', False))
        
        # Decode base64 image
        image_data = data['image'].split(',')[1]  # Remove data:image/jpeg;base64, prefix
        image_bytes = base64.b64decode(image_data)
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            temp_file.write(image_bytes)
            temp_path = temp_file.name
        
        try:
            # Load image for analysis (keep original resolution for box detection)
            image_orig = cv2.imread(temp_path)
            if image_orig is None:
                return jsonify({
                    'success': False,
                    'error': 'Could not load image'
                }), 400
            
            # Create a smaller copy for global analysis to speed up, but keep
            # image_orig for precise box detection at native resolution
            image = image_orig
            h, w = image.shape[:2]
            max_dim = max(h, w)
            if max_dim > 960:  # allow larger size to preserve detail for acne
                scale = 960.0 / max_dim
                image = cv2.resize(image, (int(w*scale), int(h*scale)), interpolation=cv2.INTER_AREA)
            
            # Validate: ensure at least one face is present
            gray_for_detect = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            face_cascade_guard = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            faces_guard = face_cascade_guard.detectMultiScale(gray_for_detect, 1.2, 5)
            if len(faces_guard) == 0:
                return jsonify({
                    'success': False,
                    'error': 'No face detected. Please upload a clear selfie with one face.'
                }), 400
            if len(faces_guard) > 1:
                return jsonify({
                    'success': False,
                    'error': 'Multiple faces detected. Please upload a selfie with only one face.'
                }), 400

            # Analyze skin tone and undertone
            skin_tone, undertone = analyze_skin_tone(image)
            
            # Analyze skin texture and concerns
            skin_concerns = analyze_skin_texture(image)
            
            # Analyze facial features
            eye_shape, lip_fullness = analyze_facial_features(temp_path)
            
            # Detect emotion only (skip age / gender / race to reduce latency)
            if fast_mode:
                emotion, emotion_confidence = 'neutrality', 0.0
            else:
                emotion, emotion_confidence = detect_emotion(temp_path)
            
            # Generate product recommendations
            recommendations = recommend_products(skin_tone, undertone, skin_concerns, eye_shape, lip_fullness)
            
            # Create annotated image and boxes using full-resolution image
            boxes, annotated, stats = detect_issue_boxes(image_orig)
            _, enc = cv2.imencode('.jpg', annotated)
            annotated_b64 = 'data:image/jpeg;base64,' + base64.b64encode(enc.tobytes()).decode('utf-8')

            # Prepare analysis results
            analysis = {
                'skin_tone': skin_tone,
                'undertone': undertone,
                'concerns': skin_concerns,
                'eye_shape': eye_shape,
                'lip_fullness': lip_fullness,
                'emotion': emotion,
                'emotion_confidence': float(emotion_confidence) if isinstance(emotion_confidence, (np.floating,)) else emotion_confidence,
                'boxes': boxes,
                'stats': stats
            }
            
            return jsonify({
                'success': True,
                'analysis': analysis,
                'recommendations': recommendations,
                'annotatedImage': annotated_b64
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
    print("Starting DeepFace-based face analysis service...")
    app.run(host='0.0.0.0', port=5001, debug=True)

import cv2
import numpy as np
from deepface import DeepFace
import os

proto_path = 'deploy.prototxt'
model_path = 'res10_300x300_ssd_iter_140000.caffemodel'
net = cv2.dnn.readNetFromCaffe(proto_path, model_path)

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
        "pigmentation": "Vitamin C serum"
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

def analyze_skin_texture(image):
    """Analyze skin texture for pores, fine lines, and pigmentation."""
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
    return concerns if concerns else ["none"]

def analyze_facial_features(image_path):
    """Analyze eye shape and lip fullness using OpenCV."""
    try:
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
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

def recommend_products(skin_tone, undertone, skin_concerns, eye_shape, lip_fullness):
    """Generate product recommendations based on analysis."""
    recommendations = {
        "foundation": product_db["skin_tone"][skin_tone]["foundation"],
        "lipstick": product_db["undertone"][undertone]["lipstick"],
        "skincare": [product_db["skin_concerns"][concern] for concern in skin_concerns],
        "eye_makeup": product_db["eye_shape"][eye_shape],
        "lip_style": product_db["lip_fullness"][lip_fullness]
    }
    return recommendations

def detect_faces_dnn(image, conf_threshold=0.5):
    """Detect faces using DNN model."""
    (h, w) = image.shape[:2]
    blob = cv2.dnn.blobFromImage(cv2.resize(image, (300, 300)), 1.0,
                                 (300, 300), (104.0, 177.0, 123.0))
    net.setInput(blob)
    detections = net.forward()
    faces = []
    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > conf_threshold:
            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            (startX, startY, endX, endY) = box.astype("int")
            startX, startY = max(0, startX), max(0, startY)
            endX, endY = min(w-1, endX), min(h-1, endY)
            faces.append((startX, startY, endX, endY))
    return faces

def main(image_path):
    """Main function to perform face image analysis and recommendations."""
    if not os.path.exists(image_path):
        print("Error: Image file not found.")
        return
    image = cv2.imread(image_path)
    if image is None:
        print("Error: Could not load image.")
        return
    skin_tone, undertone = analyze_skin_tone(image)
    skin_concerns = analyze_skin_texture(image)
    eye_shape, lip_fullness = analyze_facial_features(image_path)
    emotion, confidence = detect_emotion(image_path)
    recommendations = recommend_products(skin_tone, undertone, skin_concerns, eye_shape, lip_fullness)

    print("=== Face Image Analysis Results ===")
    print(f"Skin Tone: {skin_tone.capitalize()}")
    print(f"Undertone: {undertone.capitalize()}")
    print(f"Skin Concerns: {', '.join(skin_concerns).capitalize()}")
    print(f"Eye Shape: {eye_shape.capitalize()}")
    print(f"Lip Fullness: {lip_fullness.capitalize()}")
    print(f"Emotion: {emotion.capitalize()} ({confidence:.2f})")

    s = []
    s.append(f"Foundation: {recommendations['foundation']}")
    s.append(f"Lipstick: {recommendations['lipstick']}")
    s.append(f"Skincare: {', '.join(recommendations['skincare'])}")
    s.append(f"Eye Makeup: {recommendations['eye_makeup']}")
    s.append(f"Lip Style: {recommendations['lip_style']}")
    s.append(f"Emotion: {emotion.capitalize()} ({confidence:.2f})")

    print("\n=== Product Recommendations ===")
    for line in s:
        print(line)

    img = image
    faces_rect = detect_faces_dnn(img)
    for (x1, y1, x2, y2) in faces_rect:
        for i, line in enumerate(s):
            cv2.putText(img, line, (x1 - 400, y1 + 200 - (i * 15)), 
                        cv2.FONT_HERSHEY_COMPLEX, 0.5, (0, 0, 255), 1)
        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)



    cv2.imshow("Output", img)
    cv2.waitKey(0)
    cv2.imwrite("output_image.png", img)
    cv2.destroyAllWindows()

if __name__ == "__main__":
    check = input("Enter 1 to click live image or any other to upload image from space: ")
    try:
        check = int(check)
    except ValueError:
        check = 0
    if check == 1:
        cap = cv2.VideoCapture(0)
        ret, frame = cap.read()
        if not ret:
            print("Error: Failed to capture image from webcam.")
            cap.release()
        cv2.imshow("Captured Photo", frame)
        cv2.waitKey(0)
        cv2.destroyAllWindows()
        img_path = r"C:\Users\prana\OneDrive\Desktop\image.png"
        cv2.imwrite(img_path, frame)
        cap.release()
        main(img_path)
    else:
        img_path = input("Enter the file path: ")
        main(img_path)
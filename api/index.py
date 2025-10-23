# api/index.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import os

api = Flask(__name__)
CORS(api) 

IMG_SIZE = (160, 160)
CLASS_LABELS = ['benign', 'malignant']

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'backend', 'models', 'usg_breast_clean_final.keras')

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print(f"--- Model '{MODEL_PATH}' berhasil dimuat. ---")
except Exception as e:
    print(f"FATAL: Error memuat model: {e}")
    model = None

def preprocess_image(image_bytes):
    # ... (fungsi ini tidak berubah)
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, IMG_SIZE)
        img_array = np.asarray(img)
        img_array = img_array.astype('float32') / 255.0
        img_batch = np.expand_dims(img_array, axis=0)
        return img_batch
    except: return None

@api.route('/predict', methods=['GET', 'POST'])
def predict():
    if model is None: return jsonify({'error': 'Model tidak tersedia'}), 500
    if request.method == 'GET': return jsonify({'status': 'Server is running'})
    if 'file' not in request.files: return jsonify({'error': 'Tidak ada file'}), 400
    
    file = request.files['file']
    if file.filename == '': return jsonify({'error': 'Tidak ada file yang dipilih'}), 400

    try:
        processed_image = preprocess_image(file.read())
        if processed_image is None: return jsonify({'error': 'Gagal memproses gambar'}), 500
        
        prediction_proba = model.predict(processed_image)[0][0]
        
        label = CLASS_LABELS[1] if prediction_proba >= 0.5 else CLASS_LABELS[0]
        confidence = prediction_proba if prediction_proba >= 0.5 else 1 - prediction_proba
        
        return jsonify({"prediction": label, "confidence": f"{confidence * 100:.2f}%"})
    except Exception as e:
        return jsonify({'error': f'Kesalahan prediksi: {str(e)}'}), 500

if __name__ == '__main__': api.run(debug=True, port=5000)
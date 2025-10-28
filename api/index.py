# api/index.py
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import os
import logging

logging.basicConfig(level=logging.INFO)

api = Flask(__name__)

# --- Konfigurasi CORS: ganti origin bila domain produksi-mu berbeda ---
CORS(api, origins=["https://kecoak.vercel.app"], supports_credentials=True)

IMG_SIZE = (160, 160)
CLASS_LABELS = ['benign', 'malignant']

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'backend', 'models', 'usg_breast_clean_final.keras')

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    logging.info(f"--- Model '{MODEL_PATH}' berhasil dimuat. ---")
except Exception as e:
    logging.exception(f"FATAL: Error memuat model: {e}")
    model = None

def preprocess_image(image_bytes):
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return None
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, IMG_SIZE)
        img_array = np.asarray(img).astype('float32') / 255.0
        img_batch = np.expand_dims(img_array, axis=0)
        return img_batch
    except Exception as e:
        logging.exception("Error preprocessing image:")
        return None

@api.route('/predict', methods=['GET', 'OPTIONS', 'POST'])
def predict():
    # Jika model tidak tersedia (gagal load), informasikan ke caller
    if model is None:
        return jsonify({'error': 'Model tidak tersedia'}), 500

    # Handling simple health check
    if request.method == 'GET':
        return jsonify({'status': 'Server is running'})

    # Preflight request handling (OPTIONS) - CORS sudah di-set global, tapi ini memastikan response 204
    if request.method == 'OPTIONS':
        resp = make_response('', 204)
        resp.headers['Access-Control-Allow-Origin'] = 'https://kecoak.vercel.app'
        resp.headers['Access-Control-Allow-Methods'] = 'POST,OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        resp.headers['Access-Control-Allow-Credentials'] = 'true'
        return resp

    # POST: proses file upload
    if 'file' not in request.files:
        return jsonify({'error': 'Tidak ada file'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Tidak ada file yang dipilih'}), 400

    try:
        file_bytes = file.read()
        processed_image = preprocess_image(file_bytes)
        if processed_image is None:
            return jsonify({'error': 'Gagal memproses gambar'}), 500

        # prediksi
        preds = model.predict(processed_image)
        # ambil probabilitas berupa scalar — bentuk output model mungkin berbeda,
        # kita coba handle beberapa kemungkinan bentuk output
        try:
            # common: model.predict -> array([[prob]])
            prediction_proba = float(preds.ravel()[0])
        except Exception:
            # fallback
            prediction_proba = float(preds[0][0]) if hasattr(preds, '__len__') else float(preds)

        label = CLASS_LABELS[1] if prediction_proba >= 0.5 else CLASS_LABELS[0]
        confidence = prediction_proba if prediction_proba >= 0.5 else 1 - prediction_proba

        return jsonify({
            "prediction": label,
            "confidence": f"{confidence * 100:.2f}%"
        })
    except Exception as e:
        logging.exception("Kesalahan prediksi:")
        return jsonify({'error': f'Kesalahan prediksi: {str(e)}'}), 500

# Jalankan server (untuk development). Pada production gunakan WSGI/hosting provider.
if __name__ == '__main__':
    api.run(host='0.0.0.0', debug=True, port=5000)

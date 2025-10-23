# api/index.py
# --- KODE LENGKAP DENGAN PATH YANG SUDAH DIPERBAIKI ---

# --- 1. Import library yang dibutuhkan ---
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import os

# --- 2. Inisialisasi Aplikasi Flask ---
app = Flask(__name__)
CORS(app) 


# --- 3. Konfigurasi dan Pemuatan Model (BAGIAN YANG DIPERBAIKI) ---
IMG_SIZE = (160, 160)
CLASS_LABELS = ['benign', 'malignant']

# --- PATH BARU UNTUK STRUKTUR YANG SUDAH DIRATAKAN ---
# Kita perlu "mundur" satu level dari folder 'api' untuk menemukan folder 'backend'
MODEL_PATH = os.path.join(
    os.path.dirname(__file__), '..', 'backend', 'models', 'usg_breast_clean_final.keras'
)
# -----------------------------------------------------------------

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print(f"--- Model '{MODEL_PATH}' berhasil dimuat. Server siap. ---")
except Exception as e:
    print(f"FATAL: Error memuat model: {e}")
    model = None


# --- 4. Fungsi Preprocessing (TIDAK PERLU DIUBAH) ---
def preprocess_image(image_bytes):
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, IMG_SIZE)
        img_array = np.asarray(img)
        img_array = img_array.astype('float32') / 255.0
        img_batch = np.expand_dims(img_array, axis=0)
        
        return img_batch
    except Exception as e:
        print(f"Error saat memproses gambar: {e}")
        return None


# --- 5. Membuat Endpoint API '/predict' (TIDAK PERLU DIUBAH) ---
@app.route('/predict', methods=['GET','POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model tidak tersedia atau gagal dimuat'}), 500

    # Bagian ini ditambahkan untuk menangani request GET (untuk pengecekan Vercel)
    if request.method == 'GET':
        return jsonify({'status': 'Server is running and ready to predict'})

    if 'file' not in request.files:
        return jsonify({'error': 'Tidak ada file gambar dalam request'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Tidak ada file yang dipilih'}), 400

    try:
        image_bytes = file.read()
        processed_image = preprocess_image(image_bytes)
        
        if processed_image is None:
            return jsonify({'error': 'Gagal memproses gambar'}), 500
        
        prediction_proba = model.predict(processed_image)[0][0]
        
        threshold = 0.5
        if prediction_proba < threshold:
            label = CLASS_LABELS[0]
            confidence = 1 - prediction_proba
        else:
            label = CLASS_LABELS[1]
            confidence = prediction_proba
            
        result = {
            "prediction": label,
            "confidence": f"{confidence * 100:.2f}%"
        }
        
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': f'Terjadi kesalahan saat prediksi: {str(e)}'}), 500


# --- 6. Menjalankan Server (TIDAK PERLU DIUBAH) ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)
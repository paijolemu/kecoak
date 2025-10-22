# backend/app/main.py

# --- 1. Import library yang dibutuhkan ---
from flask import Flask, request, jsonify
from flask_cors import CORS # Pastikan sudah di-install: pip install Flask-Cors
import tensorflow as tf
import numpy as np
import cv2
import os

# --- 2. Inisialisasi Aplikasi Flask ---
app = Flask(__name__)
# Mengizinkan request dari frontend (React default di port 3000)
# Ini penting agar browser tidak memblokir request dari frontend Anda
CORS(app, resources={r"/predict": {"origins": "http://localhost:3000"}})


# --- 3. Konfigurasi dan Pemuatan Model (SESUAIKAN DENGAN MODEL 2 KELAS ANDA) ---
# Konfigurasi ini harus sama persis dengan saat training model terakhir Anda
IMG_SIZE = (160, 160)
CLASS_LABELS = ['benign', 'malignant'] # Hanya 2 kelas

# Path relatif dari file main.py ke folder models
# os.path.dirname(__file__) -> folder 'app'
# '..' -> mundur ke folder 'backend'
# 'models' -> masuk ke folder 'models'
MODEL_PATH = os.path.join(
    os.path.dirname(__file__), '..', 'models', 'usg_breast_clean_final.keras' # GANTI DENGAN NAMA MODEL ANDA
)

# Muat model saat aplikasi pertama kali dijalankan
try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print(f"--- Model '{MODEL_PATH}' berhasil dimuat. Server siap. ---")
except Exception as e:
    print(f"FATAL: Error memuat model: {e}")
    model = None # Tandai bahwa model gagal dimuat


# --- 4. Fungsi Preprocessing (SESUAIKAN DENGAN TRAINING TERAKHIR ANDA) ---
def preprocess_image(image_bytes):
    """Memproses byte gambar mentah menjadi format yang siap untuk model."""
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Proses ini HARUS SAMA PERSIS dengan saat training
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB) # Konversi warna
        img = cv2.resize(img, IMG_SIZE)            # Ubah ukuran
        img_array = np.asarray(img)
        img_array = img_array.astype('float32') / 255.0 # Normalisasi (rescale 1./255)
        img_batch = np.expand_dims(img_array, axis=0)
        
        return img_batch
    except Exception as e:
        print(f"Error saat memproses gambar: {e}")
        return None


# --- 5. Membuat Endpoint API '/predict' (UNTUK MODEL 2 KELAS) ---
@app.route('/predict', methods=['POST'])
def predict():
    """Menerima file gambar, melakukan prediksi, dan mengembalikan hasilnya."""
    if model is None:
        return jsonify({'error': 'Model tidak tersedia atau gagal dimuat'}), 500

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
        
        # Lakukan prediksi (outputnya adalah 1 angka probabilitas)
        prediction_proba = model.predict(processed_image)[0][0]
        
        # Interpretasi hasil untuk model biner (2 kelas)
        threshold = 0.5
        if prediction_proba < threshold:
            label = CLASS_LABELS[0]  # benign
            confidence = 1 - prediction_proba
        else:
            label = CLASS_LABELS[1]  # malignant
            confidence = prediction_proba
            
        result = {
            "prediction": label,
            "confidence": f"{confidence * 100:.2f}%"
        }
        
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': f'Terjadi kesalahan saat prediksi: {str(e)}'}), 500


# --- 6. Menjalankan Server ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)
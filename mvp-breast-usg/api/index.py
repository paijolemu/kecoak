# api/index.py
# --- KODE LENGKAP YANG SUDAH DISESUAIKAN UNTUK VERCEL ---

# --- 1. Import library yang dibutuhkan ---
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import os

# --- 2. Inisialisasi Aplikasi Flask ---
app = Flask(__name__)
# Mengizinkan request dari SEMUA asal (origins). 
# Ini lebih aman untuk Vercel karena URL frontend Anda tidak lagi 'localhost'.
CORS(app) 


# --- 3. Konfigurasi dan Pemuatan Model (BAGIAN YANG DIUBAH) ---
IMG_SIZE = (160, 160)
CLASS_LABELS = ['benign', 'malignant']

# --- PATH BARU UNTUK VERCEL ---
# __file__ akan berada di /var/task/api/index.py saat di Vercel.
# Kita perlu "mundur" dua kali untuk mencapai root, lalu masuk ke backend/models.
# os.path.dirname(__file__) -> /var/task/api
# '..' -> /var/task
# '..' -> / (root proyek Anda di Vercel)
# 'backend', 'models', 'nama_model' -> path yang benar
MODEL_PATH = os.path.join(
    os.path.dirname(__file__), '..', 'backend', 'models', 'usg_breast_clean_final.keras'
)
# CATATAN: Firebase Admin SDK tidak ada di kode ini, jadi saya tidak menambahkannya.
# Jika Anda membutuhkannya, logikanya sama, path ke serviceAccountKey.json juga perlu diubah.
# --------------------------------

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print(f"--- Model '{MODEL_PATH}' berhasil dimuat. Server siap. ---")
except Exception as e:
    print(f"FATAL: Error memuat model: {e}")
    model = None


# --- 4. Fungsi Preprocessing (TIDAK PERLU DIUBAH) ---
def preprocess_image(image_bytes):
    """Memproses byte gambar mentah menjadi format yang siap untuk model."""
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
        
        prediction_proba = model.predict(processed_image)[0][0]
        
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


# --- 6. Menjalankan Server (TIDAK PERLU DIUBAH) ---
# Vercel akan mengabaikan bagian ini, tapi ini tetap berguna untuk testing lokal.
if __name__ == '__main__':
    app.run(debug=True, port=5000)
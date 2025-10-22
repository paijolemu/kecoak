# test_model.py
# Versi lengkap: uji model klasifikasi USG payudara (jinak vs ganas)
# Jalankan di folder mvp-breast-usg: python backend/app/test_model.py

import tensorflow as tf
from PIL import Image
import numpy as np
import os

# ==============================================================================
# KONFIGURASI — SESUAIKAN DENGAN LINGKUNGAN ANDA
# ==============================================================================
MODEL_PATH = "app/usg_breast_clean_final.keras"  # Path relatif dari folder backend
IMG_SIZE = (160, 160)

# GANTI PATH INI SESUAI GAMBAR YANG INGIN DIUJI
# IMAGE_PATH_TO_TEST = r"C:\Users\62812\Downloads\archive (12)\ultrasound breast classification\val\malignant\malignant (7).png"
# IMAGE_PATH_TO_TEST = r"C:\Users\62812\Downloads\archive (12)\ultrasound breast classification\val\malignant\malignant (2).png"
IMAGE_PATH_TO_TEST = r"C:\Users\62812\Downloads\archive (12)\ultrasound breast classification\val\benign\benign (4).png"

# THRESHOLD PREDIKSI — SESUAIKAN BERDASARKAN KEBUTUHAN
# - Nilai rendah (0.3): lebih sensitif terhadap ganas (kurangi false negative)
# - Nilai tinggi (0.7): lebih hati-hati prediksi ganas (kurangi false positive)
THRESHOLD = 0.45

# ==============================================================================
# FUNGSI UTAMA
# ==============================================================================

def load_and_preprocess_image(image_path, target_size=(160, 160)):
    """Muat dan proses gambar menjadi format yang sesuai untuk model."""
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Gambar tidak ditemukan: {image_path}")
    
    image = Image.open(image_path)
    
    # Konversi ke RGB jika perlu
    if image.mode in ("L", "LA"):  # Grayscale
        image = image.convert("RGB")
    elif image.mode == "RGBA":
        # Gabungkan dengan latar putih
        background = Image.new("RGB", image.size, (255, 255, 255))
        background.paste(image, mask=image.split()[-1])
        image = background
    elif image.mode != "RGB":
        image = image.convert("RGB")
    
    # Resize ke ukuran model
    image = image.resize(target_size)
    
    # Normalisasi ke [0, 1]
    image_array = np.array(image).astype(np.float32) / 255.0
    
    # Tambahkan dimensi batch: (1, H, W, 3)
    image_array = np.expand_dims(image_array, axis=0)
    
    return image_array

def predict_image(model, image_array, threshold=0.5):
    """Lakukan prediksi dan kembalikan hasil dalam format siap pakai."""
    prob_ganas = model.predict(image_array, verbose=0)[0][0]
    
    if prob_ganas > threshold:
        label = "Malignant (Ganas)"
        confidence = prob_ganas
    else:
        label = "Benign (Jinak)"
        confidence = 1 - prob_ganas
        
    return {
        "label": label,
        "confidence": float(confidence),
        "prob_ganas": float(prob_ganas),
        "prob_jinak": float(1 - prob_ganas)
    }

# ==============================================================================
# JALANKAN PENGUJIAN
# ==============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("🔍 UJI MODEL KLASIFIKASI KANKER PAYUDARA (USG)")
    print("=" * 60)
    
    # 1. Validasi path gambar
    if not os.path.exists(IMAGE_PATH_TO_TEST):
        print(f"❌ ERROR: File gambar tidak ditemukan!")
        print(f"   Path: {IMAGE_PATH_TO_TEST}")
        print("\n💡 Tips: Pastikan path benar dan gunakan tanda kutip jika ada spasi.")
        exit(1)
    
    # 2. Muat model
    print("🚀 Memuat model...")
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        print("✅ Model berhasil dimuat.")
    except Exception as e:
        print(f"❌ Gagal memuat model: {e}")
        exit(1)
    
    # 3. Proses gambar
    print("🖼️ Memproses gambar...")
    try:
        image_array = load_and_preprocess_image(IMAGE_PATH_TO_TEST, IMG_SIZE)
        print(f"✅ Gambar siap. Shape: {image_array.shape}")
    except Exception as e:
        print(f"❌ Gagal memproses gambar: {e}")
        exit(1)
    
    # 4. Prediksi
    print("🧠 Melakukan prediksi...")
    try:
        result = predict_image(model, image_array, threshold=THRESHOLD)
    except Exception as e:
        print(f"❌ Gagal melakukan prediksi: {e}")
        exit(1)
    
    # 5. Tampilkan hasil
    print("\n" + "=" * 60)
    print("📊 HASIL PREDIKSI")
    print("=" * 60)
    print(f"File gambar       : {os.path.basename(IMAGE_PATH_TO_TEST)}")
    print(f"Path lengkap      : {IMAGE_PATH_TO_TEST}")
    print(f"Threshold         : {THRESHOLD}")
    print("-" * 60)
    print(f"Prediksi          : {result['label']}")
    print(f"Confidence        : {result['confidence'] * 100:.2f}%")
    print(f"Probabilitas Ganas: {result['prob_ganas'] * 100:.2f}%")
    print(f"Probabilitas Jinak: {result['prob_jinak'] * 100:.2f}%")
    print("=" * 60)
    
    # 6. Rekomendasi
    if result["label"] == "Malignant (Ganas)":
        print("\n⚠️  REKOMENDASI: Hasil ini menunjukkan kemungkinan kanker.")
        print("   Harap konsultasikan dengan tenaga medis profesional untuk diagnosis lebih lanjut.")
    else:
        print("\n✅ REKOMENDASI: Hasil ini menunjukkan lesi jinak.")
        print("   Tetap lakukan pemeriksaan rutin sesuai anjuran dokter.")
    
    print("\nℹ️  Catatan: Ini adalah alat bantu AI. BUKAN pengganti diagnosis medis.")
// src/pages/AboutPage.jsx
import React from 'react';
import { Container } from 'react-bootstrap';

function AboutPage() {
  return (
    <Container className="mt-5">
      <h2>Tentang Aplikasi Ini</h2>
      <p>
        Aplikasi ini dikembangkan sebagai bagian dari proyek [Sebutkan nama proyek/studi Anda, misal: "Studi Independen" atau "Tugas Akhir"] untuk mengeksplorasi potensi kecerdasan buatan dalam bidang medis.
      </p>
      <p>
        Model AI yang digunakan dilatih pada dataset gambar USG payudara publik untuk membedakan antara lesi jinak dan ganas.
      </p>
      <hr />
      <h4>Peringatan Penting (Disclaimer)</h4>
      <p className="text-danger fw-bold">
        Aplikasi ini adalah alat bantu edukasi dan penelitian, BUKAN pengganti diagnosis medis profesional. Hasil prediksi tidak boleh digunakan sebagai dasar untuk keputusan medis. Selalu konsultasikan dengan dokter atau tenaga medis yang berkualifikasi.
      </p>
    </Container>
  );
}

export default AboutPage;
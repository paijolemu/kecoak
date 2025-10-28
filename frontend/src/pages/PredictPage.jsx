import React, { useState } from "react";
import axios from "axios";

function PredictPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const backendURL = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:5000";

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setResult(null);
    setError("");
    if (selected) setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Pilih file gambar dulu!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${backendURL}/predict`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Tidak dapat terhubung ke backend. Coba cek koneksi atau port Flask.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <h2>Prediksi Kanker Payudara (USG)</h2>
      <input type="file" onChange={handleFileChange} />
      <br /><br />
      {preview && (
        <img
          src={preview}
          alt="preview"
          style={{ width: 200, borderRadius: 10, marginBottom: 10 }}
        />
      )}
      <br />
      <button onClick={handleSubmit}>Dapatkan Prediksi</button>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {result && (
        <div style={{ marginTop: 20, border: "1px solid #ddd", padding: 10 }}>
          <strong>Hasil Prediksi:</strong>
          <div>Label: {result.prediction}</div>
          <div>Confidence: {result.confidence}</div>
        </div>
      )}
    </div>
  );
}

export default PredictPage;

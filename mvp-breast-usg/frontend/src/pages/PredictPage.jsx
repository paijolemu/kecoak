// frontend/src/pages/PredictPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Card, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext'; // Untuk cek status login
import { db } from '../firebaseConfig'; // Untuk koneksi ke database
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Fungsi-fungsi Firestore
import './PredictPage.css'; // Pastikan file CSS ini ada di folder yang sama

function PredictPage() {
  // --- BAGIAN 1: STATE MANAGEMENT ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { currentUser } = useAuth();

  // --- BAGIAN 2: FUNGSI-FUNGSI ---

  // Fungsi untuk menangani saat pengguna memilih file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    // Reset semua state saat file baru dipilih
    setResult(null);
    setError(null);

    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreview(null);
    }
  };

  // Fungsi untuk mengirim gambar ke backend saat tombol diklik
  const handlePredictClick = async () => {
    if (!selectedFile) {
      setError("Silakan pilih sebuah gambar terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await axios.post('http://localhost:5000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const data = res.data;
      setResult(data);

      // --- LOGIKA PENYIMPANAN RIWAYAT BARU ---
    if (currentUser) {
      // JIKA PENGGUNA LOGIN, SIMPAN KE FIRESTORE
      try {
        await addDoc(collection(db, 'users', currentUser.uid, 'history'), {
          prediction: data.prediction,
          confidence: data.confidence,
          imageUrl: preview, // Kita akan perlu cara untuk menyimpan gambar ini secara permanen nanti*
          createdAt: serverTimestamp() // Gunakan timestamp server
        });
        console.log("Riwayat berhasil disimpan ke Firestore");
      } catch (e) {
        console.error("Error menyimpan riwayat ke Firestore: ", e);
      }
    } else {
      // JIKA PENGGUNA TIDAK LOGIN, SIMPAN KE LOCALSTORAGE (seperti sebelumnya)
      const newHistoryItem = {
        prediction: data.prediction,
        confidence: data.confidence,
        image: preview,
        timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
      };
      const history = JSON.parse(localStorage.getItem('predictionHistory')) || [];
      history.unshift(newHistoryItem);
      localStorage.setItem('predictionHistory', JSON.stringify(history.slice(0, 5)));
    }

      // Logika untuk menyimpan riwayat ke localStorage
      const newHistoryItem = {
        prediction: data.prediction,
        confidence: data.confidence,
        image: preview,
        timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
      };
      const history = JSON.parse(localStorage.getItem('predictionHistory')) || [];
      history.unshift(newHistoryItem);
      localStorage.setItem('predictionHistory', JSON.stringify(history.slice(0, 5)));

    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Terjadi kesalahan yang tidak diketahui.";
      setError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // --- BAGIAN 3: TAMPILAN (JSX) ---
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Container className="mt-5 text-center">
        <h1 className="mb-3 display-5 fw-bold">AI Breast Cancer Predictor</h1>
        <p className="lead text-muted mb-5">
          Unggah gambar USG untuk mendapatkan analisis awal. Cepat, aman, dan rahasia.
        </p>

        <Row className="justify-content-center">
          <Col md={8} lg={7}>
            <Card className="p-4 shadow-lg main-card glass-card">
              <Card.Body>
                <div 
                  className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
                  onDragEnter={() => setIsDragOver(true)}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={() => setIsDragOver(false)}
                >
                  <Form.Group controlId="formFileLg">
                    <Form.Label className="upload-label">
                      <i className="bi bi-cloud-arrow-up-fill fs-1"></i>
                      <span className="d-block mt-2">Pilih File Gambar Anda</span>
                      <small className="text-muted">atau seret dan lepas di sini</small>
                    </Form.Label>
                    <Form.Control 
                      type="file" 
                      className="d-none" // <-- Ini penting untuk menyembunyikan input asli
                      accept="image/png, image/jpeg" 
                      onChange={handleFileChange} 
                      disabled={loading} 
                    />
                  </Form.Group>
                </div>
                
                <div className="d-grid">
                  <Button variant="primary" size="lg" onClick={handlePredictClick} disabled={!selectedFile || loading} className="predict-button">
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Analisis...
                      </>
                    ) : (
                      'Dapatkan Prediksi'
                    )}
                  </Button>
                </div>
              </Card.Body>
            </Card>

            <div className="mt-4">
              {error && <Alert variant="danger">{error}</Alert>}
              
              {preview && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
                  <Card className="mt-4 shadow-lg glass-card">
                    <Card.Header as="h5">{result ? 'Hasil Analisis' : 'Preview Gambar'}</Card.Header>
                    <Card.Body>
                      <img src={preview} alt="Uploaded preview" className="img-fluid rounded" style={{ maxHeight: '300px' }} />
                      
                      {result && (
                        <div className="mt-4">
                          <Alert variant={result.prediction === 'malignant' ? 'danger' : 'success'}>
                            <Alert.Heading className="fs-4">
                              Prediksi: {result.prediction.charAt(0).toUpperCase() + result.prediction.slice(1)}
                            </Alert.Heading>
                            <hr />
                            <div className="mb-0 fs-5">
                              Tingkat Kepercayaan: <strong>
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.5 }}
                                >
                                  {result.confidence}
                                </motion.span>
                              </strong>
                            </div>
                                                      </Alert>
                          
                          {parseFloat(result.confidence) < 75.00 &&
                            <Alert variant="info" className="mt-3">
                              <strong>Catatan:</strong> Tingkat kepercayaan hasil ini relatif rendah. Konsultasi dengan dokter sangat disarankan.
                            </Alert>
                          }

                          <Alert variant="warning" className="mt-3 text-start">
                            <p className="mb-0">
                              <strong>PENTING:</strong> Hasil ini adalah analisis AI dan BUKAN diagnosis medis. Segera konsultasikan dengan dokter.
                            </p>
                          </Alert>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </motion.div>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
}

export default PredictPage;
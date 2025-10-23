// src/pages/HistoryPage.jsx

import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';

function HistoryPage() {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- PERBAIKAN ADA DI SINI ---
  useEffect(() => {
    // Definisikan fungsi async DI DALAM useEffect
    const fetchHistory = async () => {
      // Jangan lakukan apa-apa jika user belum login (currentUser masih null)
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Path ke koleksi 'history' milik pengguna yang sedang login
        const historyCol = collection(db, 'users', currentUser.uid, 'history');
        // Buat query untuk mengambil 10 dokumen terakhir, diurutkan berdasarkan tanggal pembuatan
        const q = query(historyCol, orderBy('createdAt', 'desc'), limit(10));
        
        const historySnapshot = await getDocs(q);
        const historyList = historySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Konversi timestamp Firestore ke format tanggal yang bisa dibaca
          timestamp: doc.data().createdAt?.toDate().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) || 'N/A'
        }));
        
        setHistory(historyList);
      } catch (error) {
        console.error("Gagal mengambil riwayat dari Firestore:", error);
      } finally {
        setLoading(false);
      }
    };

    // Panggil fungsi async tersebut
    fetchHistory();
    
  }, [currentUser]); // <-- Array dependensi ini sudah benar, akan menjalankan ulang useEffect saat status login berubah

  // Tampilkan spinner saat data sedang dimuat
  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  // Tampilan utama setelah loading selesai
  return (
    <Container className="mt-5">
      <h2>Riwayat Prediksi Anda</h2>
      <p className="text-muted">Menampilkan hasil prediksi terakhir Anda yang tersimpan di akun.</p>
      <hr />
      
      {history.length === 0 ? (
        <Alert variant="info">Anda belum memiliki riwayat prediksi yang tersimpan di akun Anda.</Alert>
      ) : (
        <Row>
          {history.map((item) => (
            <Col md={6} lg={4} key={item.id} className="mb-4">
              <Card className="h-100 shadow-sm glass-card">
                {/* Gunakan imageUrl jika ada, jika tidak jangan tampilkan gambar */}
                {item.imageUrl && <Card.Img variant="top" src={item.imageUrl} style={{ height: '200px', objectFit: 'cover' }} />}
                <Card.Body>
                  <Card.Title>Prediksi: <span className={item.prediction === 'malignant' ? 'text-danger' : 'text-success'}>{item.prediction}</span></Card.Title>
                  <Card.Text>Kepercayaan: <strong>{item.confidence}</strong></Card.Text>
                </Card.Body>
                <Card.Footer>
                  <small className="text-muted">Diprediksi pada: {item.timestamp}</small>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default HistoryPage;
// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';

// Definisikan varian animasi untuk container dan item
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2 // Beri jeda 0.2 detik antara setiap anak
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

function HomePage() {
  return (
    <div>
      {/* Hero Section dengan animasi fade-in */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
        <Container fluid className="text-center bg-transparent p-5 mb-5">
          <h1 className="display-4 fw-bold">Selamat Datang di Breast Cancer Predictor</h1>
          <p className="fs-4 lead">
            Manfaatkan kekuatan Kecerdasan Buatan untuk analisis awal citra USG payudara.
          </p>
          <Link to="/predict">
            <Button variant="primary" size="lg" className="mt-3">
              Mulai Prediksi Sekarang <i className="bi bi-arrow-right"></i> {/* Tambah ikon */}
            </Button>
          </Link>
        </Container>
      </motion.div>

      {/* Bagian Fitur dengan animasi STAGGERING */}
      <Container>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <Row className="text-center">
            {/* Kartu 1: Cepat & Mudah */}
            <Col md={4} className="mb-4">
              <motion.div variants={itemVariants}>
                <Card className="h-100 glass-card">
                  <Card.Body className="p-4 d-flex flex-column">
                    <div className="mb-3">
                      <i className="bi bi-speedometer2 fs-1 text-primary"></i>
                    </div>
                    <Card.Title as="h3" className="mb-3">Cepat & Mudah</Card.Title>
                    <Card.Text className="mt-auto">
                      Unggah gambar USG Anda dalam hitungan detik dan dapatkan hasil analisis instan.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
            
            {/* Kartu 2: Aman & Pribadi */}
            <Col md={4} className="mb-4">
              <motion.div variants={itemVariants}>
                <Card className="h-100 glass-card">
                  <Card.Body className="p-4 d-flex flex-column">
                    <div className="mb-3">
                      <i className="bi bi-shield-lock-fill fs-1 text-primary"></i>
                    </div>
                    <Card.Title as="h3" className="mb-3">Aman & Pribadi</Card.Title>
                    <Card.Text className="mt-auto">
                      Gambar yang Anda unggah diproses secara aman dan tidak disimpan di server kami.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
            
            {/* Kartu 3: Bukan Diagnosis Medis */}
            <Col md={4} className="mb-4">
              <motion.div variants={itemVariants}>
                <Card className="h-100 glass-card bg-warning">
                  <Card.Body className="p-4 d-flex flex-column">
                    <div className="mb-3">
                      <i className="bi bi-exclamation-triangle-fill fs-1 text-dark"></i>
                    </div>
                    <Card.Title as="h3" className="mb-3">Bukan Diagnosis Medis</Card.Title>
                    <Card.Text className="mt-auto">
                      Ingat, aplikasi ini adalah alat bantu edukasi. Selalu konsultasikan hasil dengan dokter.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </Container>
    </div>
  );
}

export default HomePage;

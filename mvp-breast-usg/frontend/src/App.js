// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import ProtectedRoute from './routes/ProtectedRoute';

import NavigationBar from './components/NavigationBar';
import HomePage from './pages/HomePage';
import PredictPage from './pages/PredictPage';
import AboutPage from './pages/AboutPage';
import HistoryPage from './pages/HistoryPage';
import Footer from './components/Footer';

// Varian animasi untuk transisi halaman
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -20
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

// Komponen untuk menangani animasi rute
const AnimatedRoutes = () => {
  <Route path="/history" element={
  <ProtectedRoute> {/* <-- Bungkus dengan ini */}
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
      <HistoryPage />
    </motion.div>
  </ProtectedRoute>
  } />
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <HomePage />
          </motion.div>
        } />
        <Route path="/predict" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <PredictPage />
          </motion.div>
        } />
        <Route path="/about" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <AboutPage />
          </motion.div>
        } />
        <Route path="/history" element={
          <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
            <HistoryPage />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <NavigationBar />
      <main className="py-5">
        <Container>
          <AnimatedRoutes />
        </Container>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
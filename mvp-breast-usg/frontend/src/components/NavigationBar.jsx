import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext'; // Path ini sudah benar
import { auth, googleProvider } from '../firebaseConfig'; // Ganti dari 'firebaseConfig.js' menjadi '../firebaseConfig'
import { signInWithPopup, signOut } from 'firebase/auth';

function NavigationBar() {
  const { currentUser } = useAuth(); // Ambil info pengguna saat ini dari context

  // --- Fungsi untuk menangani Login dengan Google ---
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Setelah login berhasil, halaman akan refresh secara otomatis oleh AuthContext
    } catch (error) {
      console.error("Gagal login dengan Google:", error);
    }
  };

  // --- Fungsi untuk menangani Logout ---
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Setelah logout berhasil, halaman akan refresh otomatis
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  return (
    <Navbar expand="lg" collapseOnSelect sticky="top" className="shadow-sm">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>AI Breast Cancer</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <LinkContainer to="/">
              <Nav.Link><i className="bi bi-house-door-fill me-2"></i>Beranda</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/predict">
              <Nav.Link><i className="bi bi-camera-fill me-2"></i>Prediksi</Nav.Link>
            </LinkContainer>
            
            {/* Tampilkan link Riwayat HANYA jika pengguna sudah login */}
            {currentUser && (
              <LinkContainer to="/history">
                <Nav.Link><i className="bi bi-clock-history me-2"></i>Riwayat</Nav.Link>
              </LinkContainer>
            )}

            <LinkContainer to="/about">
              <Nav.Link><i className="bi bi-info-circle-fill me-2"></i>Tentang</Nav.Link>
            </LinkContainer>
            
            {/* --- Logika untuk menampilkan tombol Login atau profil pengguna --- */}
            {currentUser ? (
              // Jika SUDAH login, tampilkan nama dan tombol logout
              <NavDropdown title={<><i className="bi bi-person-circle me-2"></i>{currentUser.displayName}</>} id="basic-nav-dropdown">
                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              // Jika BELUM login, tampilkan tombol login
              <Nav.Link onClick={handleLogin}>
                <i className="bi bi-google me-2"></i>Login
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
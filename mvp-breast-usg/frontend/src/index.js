// frontend/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';

// Import AuthProvider dari file context Anda
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* --- INI PERBAIKANNYA --- */}
    {/* AuthProvider HARUS membungkus <App /> di level tertinggi */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
// src/routes/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Jika tidak ada user, redirect ke halaman utama
    return <Navigate to="/" />;
  }

  return children; // Jika ada user, tampilkan halaman yang diminta
};

export default ProtectedRoute;
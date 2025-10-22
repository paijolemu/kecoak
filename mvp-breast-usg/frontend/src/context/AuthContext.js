// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../firebaseConfig'; // Pastikan mengimpor 'auth' dari file config
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged adalah pendengar. Ia mengembalikan fungsi "unsubscribe".
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // 'user' akan berisi data pengguna jika login, atau null jika logout.
      setCurrentUser(user);
      setLoading(false);
    });

    // Ini adalah fungsi cleanup. Ia akan berjalan saat komponen "dihancurkan".
    // Ini penting untuk mencegah memory leak.
    return unsubscribe;
  }, []); // Array dependensi kosong berarti useEffect ini hanya berjalan sekali saat mount.

  const value = {
    currentUser,
  };

  // Jangan render anak-anaknya sampai status login selesai diperiksa.
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
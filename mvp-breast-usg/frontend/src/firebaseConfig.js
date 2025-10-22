// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- PASTIKAN BLOK INI 100% SAMA DENGAN DARI FIREBASE CONSOLE ---
const firebaseConfig = {
  apiKey: "AIzaSyB5zvqfFDe6ONAICZZvOu12OFG0-1pem0A",
  authDomain: "webapp-27aad.firebaseapp.com",
  projectId: "webapp-27aad",
  storageBucket: "webapp-27aad.firebasestorage.app",
  messagingSenderId: "193350139157",
  appId: "1:193350139157:web:9d837c5b78fa61cb12bd1c"
};
// -----------------------------------------------------------

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
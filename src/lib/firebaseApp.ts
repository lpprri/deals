// Inisialisasi Firebase — aktivasi Firebase (PRD v2.0 Final Bab 10).
// Aplikasi hanya diinisialisasi bila konfigurasi lengkap
// (`isFirebaseConfigured` dari src/config/firebase.ts). Bila belum
// terkonfigurasi, `auth` dan `db` bernilai null dan aplikasi tetap berjalan
// dalam mode contoh — TIDAK crash. Tidak ada kredensial di file ini;
// konfigurasi dibaca dari environment variable VITE_FIREBASE_*.

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from '../config/firebase';

export { isFirebaseConfigured };

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };

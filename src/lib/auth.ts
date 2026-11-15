// Autentikasi Firebase Auth (email + kata sandi) — aktivasi Firebase.
// KEPUTUSAN PENGGUNA 14/11/2026 21:29 WIB: hanya ada 1 role — Operator
// (Staf Layanan & Pengembangan Usaha). Akun Auth Operator dibuat pengguna
// di Firebase console; file ini TIDAK membuat akun Auth Operator.
// KOREKSI 2026-11-15: peran klien dihapus — klien tidak punya
// login/akun; hanya Operator.
// Profil peran disimpan di Firestore: dokumen `users/{uid}`.
// Bootstrap: bila `users/{uid}` belum ada, profil diambil dari dokumen
// `userProfiles/{email}` (key = email huruf kecil) yang di-seed oleh
// migrasi satu kali (src/lib/migrasi.ts), lalu disalin ke `users/{uid}`.
// Bila tidak ada profil untuk email itu, akun tersebut tetap dibuatkan
// profil Operator langsung — karena akun Auth Operator HANYA bisa dibuat
// di Firebase console oleh admin (tidak ada pendaftaran Operator di
// aplikasi), dan tahap ini hanya punya 1 peran Operator. Jadi akun
// console mana pun yang login pertama kali menjadi Operator. Bila nanti
// dibutuhkan pembatasan (mis. daftar email yang diizinkan atau peran
// kedua), bootstrap ini yang harus diperketat — jangan mengandalkan
// aturan lain.

import {
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebaseApp';
import { SATKER_PILOT } from './master';
import type { SatkerRef } from './types';

export interface AppUser {
  uid: string;
  email: string;
  nama: string;
  jabatan: string;
  peran: 'operator';
  satker: SatkerRef;
}

function pastikanTerkonfigurasi(): void {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error(
      'Firebase belum terkonfigurasi — gunakan mode contoh atau lengkapi konfigurasi.',
    );
  }
}

function bacaAppUser(uid: string, data: Record<string, unknown>): AppUser {
  const satker = data.satker as SatkerRef | undefined;
  return {
    uid,
    email: String(data.email ?? ''),
    nama: String(data.nama ?? ''),
    jabatan: String(data.jabatan ?? ''),
    peran: 'operator',
    satker: satker ?? SATKER_PILOT,
  };
}

/**
 * Membuat dokumen `users/{uid}` dari profil yang sudah disiapkan di
 * `userProfiles/{email}` (di-seed oleh migrasi satu kali). Bila belum ada
 * profil untuk email tersebut — mis. sebelum migrasi berjalan, atau akun
 * dibuat di console dengan email lain — akun tersebut dibuatkan profil
 * Operator langsung. Alasannya: akun Auth hanya bisa dibuat di Firebase
 * console oleh admin, dan tahap ini hanya punya 1 role, jadi akun
 * console mana pun yang login pertama kali adalah Operator. Selalu
 * mengembalikan true bila profil berhasil dibuat.
 */
export async function bootstrapProfil(
  uid: string,
  email: string,
): Promise<boolean> {
  pastikanTerkonfigurasi();
  const emailKecil = email.toLowerCase();
  const profilRef = doc(db!, 'userProfiles', emailKecil);
  const profilSnap = await getDoc(profilRef);
  if (profilSnap.exists()) {
    const profil = profilSnap.data();
    await setDoc(doc(db!, 'users', uid), {
      email: emailKecil,
      nama: String(profil.nama ?? ''),
      jabatan: String(profil.jabatan ?? ''),
      peran: 'operator',
      satker: SATKER_PILOT,
      dibuatPada: new Date().toISOString(),
    });
    return true;
  }

  // Tidak ada profil yang disiapkan untuk email ini. Buatkan profil
  // Operator langsung (lihat komentar file ini). Rules mengizinkan
  // pembuatan users/{uid} sendiri sebagai operator.
  await setDoc(doc(db!, 'users', uid), {
    email: emailKecil,
    nama: 'Operator Layanan & Pengembangan Usaha',
    jabatan: 'Staf Layanan & Pengembangan Usaha',
    peran: 'operator',
    satker: SATKER_PILOT,
    dibuatPada: new Date().toISOString(),
  });
  return true;
}

/**
 * Masuk dengan email + kata sandi. Setelah sign-in, dokumen `users/{uid}`
 * dibaca; bila belum ada, dijalankan bootstrap dari `userProfiles/{email}`
 * lalu dibaca lagi. Bila tetap tidak ada atau perannya bukan operator,
 * sesi ditutup dan dilempar Error.
 */
export async function masukDenganEmail(
  email: string,
  kataSandi: string,
): Promise<AppUser> {
  pastikanTerkonfigurasi();
  const kredensial = await signInWithEmailAndPassword(
    auth!,
    email.trim(),
    kataSandi,
  );
  const pengguna: User = kredensial.user;

  let snap = await getDoc(doc(db!, 'users', pengguna.uid));
  if (!snap.exists()) {
    await bootstrapProfil(pengguna.uid, pengguna.email ?? email);
    snap = await getDoc(doc(db!, 'users', pengguna.uid));
  }

  if (!snap.exists() || snap.data().peran !== 'operator') {
    await signOut(auth!);
    throw new Error(
      'Akun belum diberi peran Operator — hubungi operator aplikasi.',
    );
  }

  return bacaAppUser(pengguna.uid, snap.data());
}

/** Keluar (signOut Firebase Auth). */
export async function keluar(): Promise<void> {
  if (auth) await signOut(auth);
}

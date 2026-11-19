// Pengguna awal — DUMMY, mode contoh saja.
// EMPAT PERAN (keputusan pengguna 19/11/2026 20:41 + 20:43 WIB):
// client (klien), operator (petugas yang berhak mengubah app —
// membuat akun/akses peran lain, menjalankan migrasi dan kartu
// one-off, master data & konfigurasi), user (admin staf bidang
// Layanan & Pengembangan Usaha — kerja operasional harian), dan
// verifikator (ahli madya / supervisor — mengecek bagian Report
// dan memberi checklist). Keputusan ini menggantikan model DUA
// PERAN PR #121 dan mendefinisikan ulang 'operator' (yang tadinya
// berarti staf LPU). Akun lpu.lpprripalembang@gmail.com TETAP
// operator. Peran dibedakan lewat field `peran` di profil akun;
// setelah masuk, client masuk Client Portal, operator/user/
// verifikator masuk admin portal. Akun client dibuat DUA JALUR
// (keputusan pengguna 19/11/2026 16:12 WIB): signup publik di
// halaman login (selalu peran 'client') ATAU invite oleh operator;
// Lacak publik (nomor PKS/tagihan) TETAP ada di samping login.
//
// DummyUser dipakai sebagai tipe pengguna sesi aplikasi (keempat
// peran). Client membawa `klienId` — id record klien yang ditautkan
// ke akunnya. klienId BOLEH kosong untuk akun client yang baru daftar
// (signup publik 19/11/2026) dan belum ditautkan operator — portal
// menampilkan keadaan 'belum tertaut' (lihat peranDariProfil di
// src/lib/auth.ts + PortalKlien).

import type { SatkerRef } from './types';

export type Role = 'operator' | 'user' | 'verifikator' | 'client';

export interface DummyUser {
  nama: string;
  jabatan: string;
  peran: Role;
  /** Email akun Auth (operator maupun client). */
  email?: string;
  /** Satker pengguna (dari profil Firestore). */
  satker?: SatkerRef;
  /**
   * Id record klien yang ditautkan ke akun ini — HANYA untuk peran
   * 'client'. Boleh kosong untuk akun client yang baru daftar dan
   * belum ditautkan (portal 'belum tertaut'). Menentukan data apa
   * yang boleh dibaca client: hanya entitas dengan klienId yang sama
   * (ditegakkan firestore.rules, bukan hanya routing di App.tsx).
   */
  klienId?: string;
  /**
   * Institusi yang dideklarasikan sendiri saat signup publik —
   * dipakai operator untuk mencocokkan pendaftar ke record klien
   * saat menautkan (bukan bukti kepemilikan record).
   */
  institusi?: string;
}

export const DUMMY_USERS: DummyUser[] = [
  {
    nama: 'Operator (Contoh)',
    jabatan: 'Staf Layanan & Pengembangan Usaha',
    peran: 'operator',
  },
  {
    nama: 'Client (Contoh)',
    jabatan: 'Client — Badan Narkotika Nasional Provinsi Sumatera Selatan',
    peran: 'client',
    email: 'client@contoh.local',
    klienId: 'KLN-030',
  },
];

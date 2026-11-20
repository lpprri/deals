// Pengguna awal — DUMMY, mode contoh saja.
// TIGA PERAN (keputusan pengguna 20/11/2026 21:06 WIB): client
// (mitra kerjasama RRI), operator (petugas bidang Layanan &
// Pengembangan Usaha — kerja operasional harian), dan admin (super
// user yang mengelola web app — membuat akun/akses peran lain,
// menjalankan migrasi dan kartu one-off, master data & konfigurasi).
// Keputusan ini menggantikan model EMPAT PERAN PR #124 (tidak jadi
// di-merge 20/11/2026): dua peran tambahan model empat peran
// DIHAPUS dan checklist verifikasi DIHAPUS — 'operator' kembali
// berarti
// staf LPU (seperti PR #121), 'admin' mengambil alih kuasa penuh
// operator model empat peran. Akun lpu.lpprripalembang@gmail.com
// akan menjadi 'admin' SETELAH merge + publish rules (saat ini
// masih 'operator' di Firestore — kode baru tetap menerima
// 'operator' sebagai Operator supaya login tidak putus sebelum
// profil dibalik; lihat peranDariProfil di src/lib/auth.ts).
// Satu halaman login, peran dibedakan lewat field `peran` di profil
// akun; setelah masuk, client masuk Client Portal, operator/admin
// masuk admin portal. Akun client dibuat DUA JALUR (keputusan
// pengguna 19/11/2026 16:12 WIB): signup publik di halaman login
// (selalu peran 'client') ATAU invite oleh admin; Lacak publik
// (nomor PKS/tagihan) TETAP ada di samping login.
//
// DummyUser dipakai sebagai tipe pengguna sesi aplikasi (ketiga
// peran). Client membawa `klienId` — id record klien yang ditautkan
// ke akunnya. klienId BOLEH kosong untuk akun client yang baru daftar
// (signup publik 19/11/2026) dan belum ditautkan admin — portal
// menampilkan keadaan 'belum tertaut' (lihat peranDariProfil di
// src/lib/auth.ts + PortalKlien).

import type { SatkerRef } from './types';

export type Role = 'client' | 'operator' | 'admin';

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

// Pengguna awal — DUMMY, mode contoh saja.
// DUA PERAN (keputusan pengguna 19/11/2026 15:45 WIB): Operator
// (Staf Layanan & Pengembangan Usaha) DAN Client — satu halaman login,
// peran dibedakan lewat field `peran` di profil akun; setelah masuk,
// client masuk Client Portal, operator masuk admin portal. Keputusan
// ini MEMBALIK dua keputusan sebelumnya: (1) keputusan pengguna
// 14/11/2026 21:29 WIB "buang semua role" (hanya 1 role Operator);
// (2) koreksi 15/11/2026 (PRD v2.3) yang menghapus peran klien —
// klien TIDAK punya login/akun, hanya Lacak publik + Ajukan. Profil di
// bawah ini hanya untuk mode contoh dan WAJIB diganti akun Firebase
// Auth produksi. Akun client dibuat OPERATOR (invite — tanpa
// self-registration publik); Lacak publik (nomor PKS/tagihan) TETAP
// ada di samping login.
//
// DummyUser dipakai sebagai tipe pengguna sesi aplikasi (operator +
// client). Client membawa `klienId` — id record klien yang ditautkan
// ke akunnya; tanpa itu portal klien tidak tahu data siapa yang
// ditampilkan, jadi klienId WAJIB ada pada akun client (lihat
// peranDariProfil di src/lib/auth.ts).

import type { SatkerRef } from './types';

export type Role = 'operator' | 'client';

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
   * 'client' (wajib; lihat peranDariProfil). Menentukan data apa yang
   * boleh dibaca client: hanya entitas dengan klienId yang sama
   * (ditegakkan firestore.rules, bukan hanya routing di App.tsx).
   */
  klienId?: string;
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

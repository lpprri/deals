// Pengguna awal — DUMMY, mode contoh saja.
// KEPUTUSAN PENGGUNA 14/11/2026 21:29 WIB: hanya ada 1 role — Operator
// (Staf Layanan & Pengembangan Usaha). Keenam peran dummy Q-01
// (Andi Pratama, Siti Rahmawati, Budi Santoso, Dewi Lestari, Ahmad Fauzi,
// Rizky Ramadhan) dinyatakan TIDAK BERLAKU, dan peran Admin Nasional
// (PRD v2.1) TIDAK DIPAKAI tahap ini. Profil di bawah ini hanya untuk
// mode contoh dan WAJIB diganti akun Firebase Auth produksi.
// KOREKSI 2026-11-15: peran klien dihapus — klien tidak punya
// login/akun; hanya Operator. DummyUser dipakai sebagai tipe pengguna
// sesi aplikasi (operator saja).

import type { SatkerRef } from './types';

export type Role = 'operator';

export interface DummyUser {
  nama: string;
  jabatan: string;
  peran: Role;
  /** Email akun Auth (operator). */
  email?: string;
  /** Satker pengguna (dari profil Firestore). */
  satker?: SatkerRef;
}

export const DUMMY_USERS: DummyUser[] = [
  {
    nama: 'Operator (Contoh)',
    jabatan: 'Staf Layanan & Pengembangan Usaha',
    peran: 'operator',
  },
];

// Pengguna awal — DUMMY, mode contoh saja.
// KEPUTUSAN PENGGUNA 14/11/2026 21:29 WIB: hanya ada 1 role — Operator
// (Staf Layanan & Pengembangan Usaha). Keenam peran dummy Q-01
// (Andi Pratama, Siti Rahmawati, Budi Santoso, Dewi Lestari, Ahmad Fauzi,
// Rizky Ramadhan) dinyatakan TIDAK BERLAKU, dan peran Admin Nasional
// (PRD v2.1) TIDAK DIPAKAI tahap ini. Profil di bawah ini hanya untuk
// mode contoh dan WAJIB diganti akun Firebase Auth produksi.
// FASE C — Client Order Portal (Q-10, 15/11/2026): peran kedua 'klien'
// (PIC dari tiap klien, daftar sendiri, wajib disetujui Operator).
// DummyUser dipakai sebagai tipe pengguna sesi aplikasi (operator maupun
// klien); field klien hanya terisi untuk peran 'klien'.

import type { SatkerRef, StatusApprovalKlien } from './types';

export type Role = 'operator' | 'klien';

export interface DummyUser {
  nama: string;
  jabatan: string;
  peran: Role;
  /** Email akun Auth (operator maupun PIC klien). */
  email?: string;
  /** Klien yang diwakili — hanya untuk peran 'klien'. */
  klienId?: string;
  /** Status approval akun PIC — hanya untuk peran 'klien'. */
  statusApproval?: StatusApprovalKlien;
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

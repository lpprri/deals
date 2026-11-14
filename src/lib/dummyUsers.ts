// Pengguna awal — DUMMY, mode contoh saja.
// KEPUTUSAN PENGGUNA 14/11/2026 21:29 WIB: hanya ada 1 role — Operator
// (Staf Layanan & Pengembangan Usaha). Keenam peran dummy Q-01
// (Andi Pratama, Siti Rahmawati, Budi Santoso, Dewi Lestari, Ahmad Fauzi,
// Rizky Ramadhan) dinyatakan TIDAK BERLAKU, dan peran Admin Nasional
// (PRD v2.1) TIDAK DIPAKAI tahap ini. Profil di bawah ini hanya untuk
// mode contoh dan WAJIB diganti akun Firebase Auth produksi.

export type Role = 'operator';

export interface DummyUser {
  nama: string;
  jabatan: string;
  peran: Role;
}

export const DUMMY_USERS: DummyUser[] = [
  {
    nama: 'Operator (Contoh)',
    jabatan: 'Staf Layanan & Pengembangan Usaha',
    peran: 'operator',
  },
];

// Pengguna awal — DUMMY (Q-01, PRD v2.0 Final Lampiran C).
// Nama dan jabatan di bawah ini HANYA CONTOH atas instruksi pemilik produk
// (14 Nov 2026) agar pembangunan Tahap 0 dapat berjalan.
// WAJIB diganti dengan nama dan jabatan asli sebelum setup Firebase Auth
// dengan akun produksi. Jangan pakai daftar ini untuk akun nyata.

export type Role =
  | 'operator_layanan'
  | 'verifikator_layanan'
  | 'keuangan'
  | 'umum'
  | 'pimpinan'
  | 'admin_sistem';

export interface DummyUser {
  nama: string;
  jabatan: string;
  peran: Role;
}

export const DUMMY_USERS: DummyUser[] = [
  {
    nama: 'Andi Pratama (Contoh)',
    jabatan: 'Staf Layanan & Pengembangan Usaha',
    peran: 'operator_layanan',
  },
  {
    nama: 'Siti Rahmawati (Contoh)',
    jabatan: 'Kepala Bidang Layanan & Pengembangan Usaha',
    peran: 'verifikator_layanan',
  },
  {
    nama: 'Budi Santoso (Contoh)',
    jabatan: 'Staf Keuangan',
    peran: 'keuangan',
  },
  {
    nama: 'Dewi Lestari (Contoh)',
    jabatan: 'Staf Umum',
    peran: 'umum',
  },
  {
    nama: 'Ahmad Fauzi (Contoh)',
    jabatan: 'Kepala LPP RRI Palembang',
    peran: 'pimpinan',
  },
  {
    nama: 'Rizky Ramadhan (Contoh)',
    jabatan: 'Admin Sistem',
    peran: 'admin_sistem',
  },
];

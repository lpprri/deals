// Kamus umum — Fase 1 dual bahasa (spek dual-bahasa §3.4).
// Tombol umum yang dipakai di banyak tempat, teks halaman login, dan
// label peran. ID ditulis mengikuti skill bahasa-indonesia-plain:
// kalimat aktif pendek, kata sehari-hari, sentence case untuk judul ID,
// sapaan "Anda", "kami" untuk RRI. EN disalin verbatim dari teks yang
// sudah live (tidak diubah). Kunci baru untuk Fase 2/3 ditambahkan di
// file ini atau kamus per bagiannya masing-masing.

import type { Bahasa } from '../bahasa';

export interface KamusLogin {
  kembaliKeLanding: string;
  judulMasuk: string;
  judulDaftar: string;
  subMasuk: string;
  subDaftar: string;
  kotakDaftar: string;
  labelNama: string;
  phNama: string;
  labelInstitusi: string;
  phInstitusi: string;
  labelEmail: string;
  phEmail: string;
  labelKataSandi: string;
  phKataSandiBaru: string;
  phKataSandi: string;
  tombolMembuat: string;
  tombolBuatAkun: string;
  sudahPunyaAkun: string;
  tombolMasuk: string;
  tombolMemeriksa: string;
  belumPunyaAkun: string;
  peringatanContoh: string;
  masukSebagaiContoh: string;
  tanpaKataSandi: string;
}

export interface KamusUmum {
  simpan: string;
  batal: string;
  kembali: string;
  hapus: string;
  cari: string;
  tutup: string;
  lanjutkan: string;
  login: KamusLogin;
  /** Label peran (dipakai footer sidebar + kartu contoh di Login). */
  peran: Record<'operator' | 'admin' | 'client', string>;
}

export const kamusUmum: Record<Bahasa, KamusUmum> = {
  id: {
    simpan: 'Simpan',
    batal: 'Batal',
    kembali: 'Kembali',
    hapus: 'Hapus',
    cari: 'Cari',
    tutup: 'Tutup',
    lanjutkan: 'Lanjutkan',
    login: {
      kembaliKeLanding: 'Kembali ke landing page',
      judulMasuk: 'Selamat datang kembali',
      judulDaftar: 'Buat akun Anda',
      subMasuk: 'Masukkan email dan kata sandi Anda untuk masuk ke akun Anda',
      subDaftar: 'Buat akun klien untuk melacak kerja sama Anda',
      kotakDaftar:
        'Ini membuat akun klien — Anda tidak perlu memilih peran. Setelah mendaftar, Admin akan menautkan akun Anda ke data kerja sama Anda. Sampai saat itu, Anda bisa mengajukan permohonan dan memesan panggilan gratis dari portal Anda.',
      labelNama: 'Nama Anda',
      phNama: 'Nama lengkap Anda',
      labelInstitusi: 'Perusahaan / institusi',
      phInstitusi: 'Perusahaan atau institusi Anda',
      labelEmail: 'Email',
      phEmail: 'alamat email Anda',
      labelKataSandi: 'Kata sandi',
      phKataSandiBaru: 'Minimal 6 karakter',
      phKataSandi: 'Kata sandi',
      tombolMembuat: 'Membuat akun…',
      tombolBuatAkun: 'Buat akun',
      sudahPunyaAkun: 'Sudah punya akun?',
      tombolMasuk: 'Masuk',
      tombolMemeriksa: 'Memeriksa…',
      belumPunyaAkun: 'Belum punya akun?',
      peringatanContoh:
        'Mode contoh — masuk sebagai Operator (Contoh) atau Client (Contoh). Di produksi, masuk memakai Firebase Auth; profil contoh ini hanya untuk pengembangan.',
      masukSebagaiContoh: 'Masuk sebagai (Contoh):',
      tanpaKataSandi:
        'Tanpa kata sandi — mode contoh hanya untuk pengembangan Tahap A, Tahap B, dan Tahap C.',
    },
    peran: { operator: 'Operator', admin: 'Admin', client: 'Klien' },
  },
  en: {
    simpan: 'Save',
    batal: 'Cancel',
    kembali: 'Back',
    hapus: 'Delete',
    cari: 'Search',
    tutup: 'Close',
    lanjutkan: 'Continue',
    login: {
      kembaliKeLanding: 'Back to Landing Page',
      judulMasuk: 'Welcome Back',
      judulDaftar: 'Create your account',
      subMasuk: 'Enter your credentials to access your account',
      subDaftar: 'Create a client account to track your partnership',
      kotakDaftar:
        'This creates a client account — there is no role to choose. After signing up, the Admin will link your account to your partnership data; until then you can submit a request and book a free call from your portal.',
      labelNama: 'Your name',
      phNama: 'Your full name',
      labelInstitusi: 'Company / institution',
      phInstitusi: 'Your company or institution',
      labelEmail: 'Email',
      phEmail: 'your email address',
      labelKataSandi: 'Password',
      phKataSandiBaru: 'At least 6 characters',
      phKataSandi: 'Password',
      tombolMembuat: 'Creating…',
      tombolBuatAkun: 'Create account',
      sudahPunyaAkun: 'Already have an account?',
      tombolMasuk: 'Sign in',
      tombolMemeriksa: 'Checking…',
      belumPunyaAkun: 'No account yet?',
      peringatanContoh:
        'Sample mode — sign in as Operator (Sample) or Client (Sample). In production, sign-in uses Firebase Auth; these dummy profiles are only for development.',
      masukSebagaiContoh: 'Sign in as (Sample):',
      tanpaKataSandi:
        'No password — sample mode is for development only Phase A, Phase B, and Phase C.',
    },
    peran: { operator: 'Operator', admin: 'Admin', client: 'Client' },
  },
};

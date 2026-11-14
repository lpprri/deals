// Master data terpusat — Fase A (PRD v2.0 Final Bab 6.13).
// Master hanya diubah Admin; nilai yang sudah dipakai transaksi tidak dapat
// dihapus, hanya dinonaktifkan (di mode contoh Fase A: tampil read-only).
// ATURAN YANG DIKUNCI (Bab 6.7): satu kode akun = satu klasifikasi.
// Master Kode Akun adalah sumber kebenaran: 425131 = Umum.

import type { JenisPnBP, SatkerRef } from './types';

/** Satker pilot Fase A: Palembang (no. 41 di daftar satker nasional). */
export const SATKER_PILOT: SatkerRef = { kode: '41', nama: 'PALEMBANG' };

export interface KodeAkun {
  kode: string;
  uraian: string;
  jenisPnBP: JenisPnBP;
}

export const MASTER_KODE_AKUN: KodeAkun[] = [
  { kode: '425131', uraian: 'PNBP Umum', jenisPnBP: 'Umum' },
  { kode: '425531', uraian: 'PNBP Fungsional', jenisPnBP: 'Fungsional' },
  { kode: '425839', uraian: 'Denda Keterlambatan', jenisPnBP: 'Umum' },
  { kode: '425151', uraian: 'Sarana Prasarana Sesuai Tusi', jenisPnBP: 'Umum' },
  { kode: '425122', uraian: 'Penjualan Peralatan / Mesin', jenisPnBP: 'Umum' },
];

/** Cari klasifikasi jenis PNBP dari kode akun. Sumber kebenaran tunggal. */
export function jenisPnBPDariKodeAkun(kode: string): JenisPnBP | undefined {
  return MASTER_KODE_AKUN.find((k) => k.kode === kode)?.jenisPnBP;
}

export function uraianKodeAkun(kode: string): string {
  return MASTER_KODE_AKUN.find((k) => k.kode === kode)?.uraian ?? kode;
}

export interface KategoriLayanan {
  nama: string;
  kodeAkun: string;
  jenisPnBP: JenisPnBP;
}

export const MASTER_KATEGORI_LAYANAN: KategoriLayanan[] = [
  {
    nama: 'Siaran Iklan (Spot/Jingle/Filler/Advetorial)',
    kodeAkun: '425531',
    jenisPnBP: 'Fungsional',
  },
  // Pelajaran Bab 13: "Ad-Lib / Jingle" pada build pertama salah
  // diklasifikasikan sebagai Fungsional. Kode akunnya 425131 = Umum.
  { nama: 'Ad-Lib / Jingle', kodeAkun: '425131', jenisPnBP: 'Umum' },
  { nama: 'Sewa Lahan / BMN', kodeAkun: '425131', jenisPnBP: 'Umum' },
  { nama: 'Sewa Rumah Dinas', kodeAkun: '425131', jenisPnBP: 'Umum' },
  { nama: 'Dukungan Layanan', kodeAkun: '425131', jenisPnBP: 'Umum' },
  { nama: 'Nota Kesepahaman', kodeAkun: '425131', jenisPnBP: 'Umum' },
  { nama: 'Media Partner', kodeAkun: '425131', jenisPnBP: 'Umum' },
];

export const MASTER_PROGRAMA: string[] = ['Pro 1', 'Pro 2', 'Pro 3', 'Pro 4'];

export const MASTER_JENIS_KLIEN: string[] = [
  'Pemerintah',
  'BUMN/BUMD',
  'Swasta',
  'Perorangan',
  'Lembaga/Organisasi',
];

export const MASTER_JENIS_DOKUMEN: string[] = [
  'PKS (asli)',
  'NPWP',
  'NIB/SIUP',
  'Surat Permohonan',
  'Bukti Pembayaran',
  'Berita Acara Serah Terima',
];

export const MASTER_STATUS_KONTRAK: string[] = [
  'Draft',
  'Aktif',
  'Selesai',
  'Dibatalkan',
  'Berakhir',
];

export const MASTER_TAHAP_PENGAJUAN: string[] = [
  'Masuk',
  'Ditelaah',
  'Menunggu Dokumen',
  'Disetujui',
  'Ditolak',
  'Dikonversi',
];

export const MASTER_METODE_PEMBAYARAN: string[] = [
  'Transfer Bank',
  'Tunai',
  'QRIS',
];

export const MASTER_JENIS_PNBP: JenisPnBP[] = ['Fungsional', 'Umum'];

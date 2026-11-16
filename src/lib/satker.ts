// Daftar Satker — master data nasional (PRD v2.1, Bab 6: daftar satker = master nasional).
// Sumber: spreadsheet "LAPORAN PNBP 2026" (tab JANUARI), dibaca 14 Nov 2026.
// 69 work units bernomor (termasuk Kantor Pusat dan Puslitbangdiklat).
// 35 sub-stasiun (SP) DIHAPUS dari data master atas keputusan user
// 2026-11-16 (PR #44) — bukan disembunyikan.
// Pemetaan Korwil (Regional Coordinator) I–XVII per daftar user 2026-11-16:
// 65 work units terpetakan; 4 tanpa Korwil (KANTOR PUSAT, SANGGAU, LANGGUR,
// PUSLITBANGDIKLAT) dan 4 nama dari daftar user tidak cocok dengan entri
// bernomor mana pun (Tual, Entikong, Stasiun Siaran Luar Negeri,
// Pusat Pemberitaan) sehingga tidak dipetakan — JANGAN ditebak padanannya.
// CATATAN: ejaan nama mengikuti persis yang tertulis di spreadsheet sumber
// (mis. "BOVENDIGOEL"). Jangan "memperbaiki" ejaan tanpa konfirmasi —
// ejaan resmi menunggu verifikasi dengan kantor pusat.

export type SatkerTipe = 'KANTOR_PUSAT' | 'SATKER' | 'PUSLITBANGDIKLAT';

export interface Satker {
  /** Nomor urut di spreadsheet sumber (1–69). */
  no: number | null;
  nama: string;
  tipe: SatkerTipe;
  /** Koordinator wilayah (Korwil I–XVII) per daftar user 2026-11-16; kosong untuk 4 entri tanpa Korwil. */
  korwil?: string;
}

export const DAFTAR_SATKER: Satker[] = [
  { no: 1, nama: 'KANTOR PUSAT', tipe: 'KANTOR_PUSAT' },
  { no: 2, nama: 'AMBON', tipe: 'SATKER', korwil: 'Korwil III — Ambon' },
  { no: 3, nama: 'ATAMBUA', tipe: 'SATKER', korwil: 'Korwil VI — Kupang' },
  { no: 4, nama: 'BANDA ACEH', tipe: 'SATKER', korwil: 'Korwil XVII — Banda Aceh' },
  { no: 5, nama: 'BANDAR LAMPUNG', tipe: 'SATKER', korwil: 'Korwil XIV — Palembang' },
  { no: 6, nama: 'BANDUNG', tipe: 'SATKER', korwil: 'Korwil XII — Bandung' },
  { no: 7, nama: 'BANJARMASIN', tipe: 'SATKER', korwil: 'Korwil VIII — Banjarmasin' },
  { no: 8, nama: 'BATAM', tipe: 'SATKER', korwil: 'Korwil XV — Pekanbaru' },
  { no: 9, nama: 'BENGKULU', tipe: 'SATKER', korwil: 'Korwil XIV — Palembang' },
  { no: 10, nama: 'BIAK', tipe: 'SATKER', korwil: 'Korwil I — Jayapura' },
  { no: 11, nama: 'BOGOR', tipe: 'SATKER', korwil: 'Korwil XII — Bandung' },
  { no: 12, nama: 'BOVENDIGOEL', tipe: 'SATKER', korwil: 'Korwil I — Jayapura' },
  { no: 13, nama: 'BUKITTINGGI', tipe: 'SATKER', korwil: 'Korwil XV — Pekanbaru' },
  { no: 14, nama: 'CIREBON', tipe: 'SATKER', korwil: 'Korwil XII — Bandung' },
  { no: 15, nama: 'DENPASAR', tipe: 'SATKER', korwil: 'Korwil VII — Denpasar' },
  { no: 16, nama: 'ENDE', tipe: 'SATKER', korwil: 'Korwil VI — Kupang' },
  { no: 17, nama: 'SANGGAU', tipe: 'SATKER' },
  { no: 18, nama: 'FAK FAK', tipe: 'SATKER', korwil: 'Korwil II — Manokwari' },
  { no: 19, nama: 'GORONTALO', tipe: 'SATKER', korwil: 'Korwil V — Manado' },
  { no: 20, nama: 'GUNUNG SITOLI', tipe: 'SATKER', korwil: 'Korwil XVI — Medan' },
  { no: 21, nama: 'JAKARTA', tipe: 'SATKER', korwil: 'Korwil XIII — Jakarta' },
  { no: 22, nama: 'JAMBI', tipe: 'SATKER', korwil: 'Korwil XIV — Palembang' },
  { no: 23, nama: 'JAYAPURA', tipe: 'SATKER', korwil: 'Korwil I — Jayapura' },
  { no: 24, nama: 'JEMBER', tipe: 'SATKER', korwil: 'Korwil X — Surabaya' },
  { no: 25, nama: 'KENDARI', tipe: 'SATKER', korwil: 'Korwil IV — Makassar' },
  { no: 26, nama: 'KUPANG', tipe: 'SATKER', korwil: 'Korwil VI — Kupang' },
  { no: 27, nama: 'LHOKSEUMAWE', tipe: 'SATKER', korwil: 'Korwil XVII — Banda Aceh' },
  { no: 28, nama: 'MADIUN', tipe: 'SATKER', korwil: 'Korwil X — Surabaya' },
  { no: 29, nama: 'MAKASSAR', tipe: 'SATKER', korwil: 'Korwil IV — Makassar' },
  { no: 30, nama: 'MALANG', tipe: 'SATKER', korwil: 'Korwil X — Surabaya' },
  { no: 31, nama: 'MANADO', tipe: 'SATKER', korwil: 'Korwil V — Manado' },
  { no: 32, nama: 'MANOKWARI', tipe: 'SATKER', korwil: 'Korwil II — Manokwari' },
  { no: 33, nama: 'MATARAM', tipe: 'SATKER', korwil: 'Korwil VII — Denpasar' },
  { no: 34, nama: 'MEDAN', tipe: 'SATKER', korwil: 'Korwil XVI — Medan' },
  { no: 35, nama: 'MERAUKE', tipe: 'SATKER', korwil: 'Korwil I — Jayapura' },
  { no: 36, nama: 'MEULABOH', tipe: 'SATKER', korwil: 'Korwil XVII — Banda Aceh' },
  { no: 37, nama: 'NABIRE', tipe: 'SATKER', korwil: 'Korwil I — Jayapura' },
  { no: 38, nama: 'NUNUKAN', tipe: 'SATKER', korwil: 'Korwil VIII — Banjarmasin' },
  { no: 39, nama: 'PADANG', tipe: 'SATKER', korwil: 'Korwil XV — Pekanbaru' },
  { no: 40, nama: 'PALANGKARAYA', tipe: 'SATKER', korwil: 'Korwil VIII — Banjarmasin' },
  { no: 41, nama: 'PALEMBANG', tipe: 'SATKER', korwil: 'Korwil XIV — Palembang' },
  { no: 42, nama: 'PALU', tipe: 'SATKER', korwil: 'Korwil IV — Makassar' },
  { no: 43, nama: 'PEKANBARU', tipe: 'SATKER', korwil: 'Korwil XV — Pekanbaru' },
  { no: 44, nama: 'PONTIANAK', tipe: 'SATKER', korwil: 'Korwil IX — Pontianak' },
  { no: 45, nama: 'PURWOKERTO', tipe: 'SATKER', korwil: 'Korwil XI — Yogyakarta' },
  { no: 46, nama: 'RANAI', tipe: 'SATKER', korwil: 'Korwil XV — Pekanbaru' },
  { no: 47, nama: 'SAMARINDA', tipe: 'SATKER', korwil: 'Korwil VIII — Banjarmasin' },
  { no: 48, nama: 'SEMARANG', tipe: 'SATKER', korwil: 'Korwil XI — Yogyakarta' },
  { no: 49, nama: 'SERUI', tipe: 'SATKER', korwil: 'Korwil I — Jayapura' },
  { no: 50, nama: 'SIBOLGA', tipe: 'SATKER', korwil: 'Korwil XVI — Medan' },
  { no: 51, nama: 'SINGARAJA', tipe: 'SATKER', korwil: 'Korwil VII — Denpasar' },
  { no: 52, nama: 'SINTANG', tipe: 'SATKER', korwil: 'Korwil IX — Pontianak' },
  { no: 53, nama: 'SORONG', tipe: 'SATKER', korwil: 'Korwil II — Manokwari' },
  { no: 54, nama: 'SUMENEP', tipe: 'SATKER', korwil: 'Korwil X — Surabaya' },
  { no: 55, nama: 'SUNGAILIAT', tipe: 'SATKER', korwil: 'Korwil XIV — Palembang' },
  { no: 56, nama: 'SURABAYA', tipe: 'SATKER', korwil: 'Korwil X — Surabaya' },
  { no: 57, nama: 'SURAKARTA', tipe: 'SATKER', korwil: 'Korwil XI — Yogyakarta' },
  { no: 58, nama: 'TAHUNA', tipe: 'SATKER', korwil: 'Korwil V — Manado' },
  { no: 59, nama: 'TAKENGON', tipe: 'SATKER', korwil: 'Korwil XVII — Banda Aceh' },
  { no: 60, nama: 'TANJUNG PINANG', tipe: 'SATKER', korwil: 'Korwil XV — Pekanbaru' },
  { no: 61, nama: 'TARAKAN', tipe: 'SATKER', korwil: 'Korwil VIII — Banjarmasin' },
  { no: 62, nama: 'TERNATE', tipe: 'SATKER', korwil: 'Korwil III — Ambon' },
  { no: 63, nama: 'TOLI TOLI', tipe: 'SATKER', korwil: 'Korwil IV — Makassar' },
  { no: 64, nama: 'LANGGUR', tipe: 'SATKER' },
  { no: 65, nama: 'WAMENA', tipe: 'SATKER', korwil: 'Korwil I — Jayapura' },
  { no: 66, nama: 'YOGYAKARTA', tipe: 'SATKER', korwil: 'Korwil XI — Yogyakarta' },
  { no: 67, nama: 'BANTEN', tipe: 'SATKER', korwil: 'Korwil XIII — Jakarta' },
  { no: 68, nama: 'MAMUJU', tipe: 'SATKER', korwil: 'Korwil IV — Makassar' },
  { no: 69, nama: 'PUSLITBANGDIKLAT', tipe: 'PUSLITBANGDIKLAT' },
];

export const JUMLAH_SATKER_BERNOMOR = DAFTAR_SATKER.filter(
  (s) => s.no !== null,
).length;

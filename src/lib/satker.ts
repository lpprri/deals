// Daftar Satker — master data nasional (PRD v2.1, Bab 6: daftar satker = master nasional).
// Sumber: spreadsheet "LAPORAN PNBP 2026" (tab JANUARI), dibaca 14 Nov 2026.
// 69 work units bernomor (termasuk Kantor Pusat dan Puslitbangdiklat).
// 35 sub-stasiun (SP) DIHAPUS dari data master atas keputusan user
// 2026-11-16 (PR #44) — bukan disembunyikan.
// Pemetaan Korwil (Regional Coordinator) I–XVII per DAFTAR TERBARU dari
// situs Pitching Hub Direktorat LPU (halaman ARSIP PU), dibaca 2026-11-16
// (PR #46) — menggantikan daftar user 2026-11-16 yang dipakai PR #44.
// 47 work units terpetakan; 22 tanpa Korwil (KANTOR PUSAT, SANGGAU,
// LANGGUR, PUSLITBANGDIKLAT + 18 entri lain yang tidak tercantum di
// daftar hub). 22 nama dari daftar hub tidak cocok
// dengan entri bernomor mana pun — nama-nama itu adalah sub-stasiun
// (mis. Singkil, Tapaktuan, Sabang, Solok, Lubuklinggau, Prabumulih,
// Curup, Mukomuko, Kotabumi, Metro, Liwa, Pringsewu, Ruteng, Ketapang,
// Entikong, Singkawang, Balikpapan, Tanjung Selor, Tanjung Balai Karimun,
// Natuna, Sungai Penuh, Bungo) sehingga tidak dipetakan — JANGAN ditebak
// padanannya.
// CATATAN: ejaan nama mengikuti persis yang tertulis di spreadsheet sumber
// (mis. "BOVENDIGOEL"). Jangan "memperbaiki" ejaan tanpa konfirmasi —
// ejaan resmi menunggu verifikasi dengan kantor pusat.

export type SatkerTipe = 'KANTOR_PUSAT' | 'SATKER' | 'PUSLITBANGDIKLAT';

export interface Satker {
  /** Nomor urut di spreadsheet sumber (1–69). */
  no: number | null;
  nama: string;
  tipe: SatkerTipe;
  /** Koordinator wilayah (Korwil I–XVII) per daftar hub terbaru 2026-11-16; kosong untuk 22 entri tanpa Korwil. */
  korwil?: string;
}

export const DAFTAR_SATKER: Satker[] = [
  { no: 1, nama: 'KANTOR PUSAT', tipe: 'KANTOR_PUSAT' },
  { no: 2, nama: 'AMBON', tipe: 'SATKER' },
  { no: 3, nama: 'ATAMBUA', tipe: 'SATKER', korwil: 'Korwil XIII — Kupang' },
  { no: 4, nama: 'BANDA ACEH', tipe: 'SATKER', korwil: 'Korwil I — Banda Aceh' },
  { no: 5, nama: 'BANDAR LAMPUNG', tipe: 'SATKER', korwil: 'Korwil VIII — Bandar Lampung' },
  { no: 6, nama: 'BANDUNG', tipe: 'SATKER', korwil: 'Korwil IX — Jakarta' },
  { no: 7, nama: 'BANJARMASIN', tipe: 'SATKER', korwil: 'Korwil XV — Banjarmasin' },
  { no: 8, nama: 'BATAM', tipe: 'SATKER', korwil: 'Korwil IV — Pekanbaru' },
  { no: 9, nama: 'BENGKULU', tipe: 'SATKER', korwil: 'Korwil VII — Bengkulu' },
  { no: 10, nama: 'BIAK', tipe: 'SATKER' },
  { no: 11, nama: 'BOGOR', tipe: 'SATKER', korwil: 'Korwil IX — Jakarta' },
  { no: 12, nama: 'BOVENDIGOEL', tipe: 'SATKER' },
  { no: 13, nama: 'BUKITTINGGI', tipe: 'SATKER', korwil: 'Korwil III — Padang' },
  { no: 14, nama: 'CIREBON', tipe: 'SATKER' },
  { no: 15, nama: 'DENPASAR', tipe: 'SATKER', korwil: 'Korwil XII — Denpasar' },
  { no: 16, nama: 'ENDE', tipe: 'SATKER', korwil: 'Korwil XIII — Kupang' },
  { no: 17, nama: 'SANGGAU', tipe: 'SATKER' },
  { no: 18, nama: 'FAK FAK', tipe: 'SATKER' },
  { no: 19, nama: 'GORONTALO', tipe: 'SATKER', korwil: 'Korwil XVII — Manado' },
  { no: 20, nama: 'GUNUNG SITOLI', tipe: 'SATKER', korwil: 'Korwil II — Medan' },
  { no: 21, nama: 'JAKARTA', tipe: 'SATKER', korwil: 'Korwil IX — Jakarta' },
  { no: 22, nama: 'JAMBI', tipe: 'SATKER', korwil: 'Korwil V — Jambi' },
  { no: 23, nama: 'JAYAPURA', tipe: 'SATKER' },
  { no: 24, nama: 'JEMBER', tipe: 'SATKER', korwil: 'Korwil XI — Surabaya' },
  { no: 25, nama: 'KENDARI', tipe: 'SATKER', korwil: 'Korwil XVI — Makassar' },
  { no: 26, nama: 'KUPANG', tipe: 'SATKER', korwil: 'Korwil XIII — Kupang' },
  { no: 27, nama: 'LHOKSEUMAWE', tipe: 'SATKER', korwil: 'Korwil I — Banda Aceh' },
  { no: 28, nama: 'MADIUN', tipe: 'SATKER', korwil: 'Korwil X — Yogyakarta' },
  { no: 29, nama: 'MAKASSAR', tipe: 'SATKER', korwil: 'Korwil XVI — Makassar' },
  { no: 30, nama: 'MALANG', tipe: 'SATKER', korwil: 'Korwil XI — Surabaya' },
  { no: 31, nama: 'MANADO', tipe: 'SATKER', korwil: 'Korwil XVII — Manado' },
  { no: 32, nama: 'MANOKWARI', tipe: 'SATKER' },
  { no: 33, nama: 'MATARAM', tipe: 'SATKER', korwil: 'Korwil XII — Denpasar' },
  { no: 34, nama: 'MEDAN', tipe: 'SATKER', korwil: 'Korwil II — Medan' },
  { no: 35, nama: 'MERAUKE', tipe: 'SATKER' },
  { no: 36, nama: 'MEULABOH', tipe: 'SATKER', korwil: 'Korwil I — Banda Aceh' },
  { no: 37, nama: 'NABIRE', tipe: 'SATKER' },
  { no: 38, nama: 'NUNUKAN', tipe: 'SATKER' },
  { no: 39, nama: 'PADANG', tipe: 'SATKER', korwil: 'Korwil III — Padang' },
  { no: 40, nama: 'PALANGKARAYA', tipe: 'SATKER', korwil: 'Korwil XV — Banjarmasin' },
  { no: 41, nama: 'PALEMBANG', tipe: 'SATKER', korwil: 'Korwil VI — Palembang' },
  { no: 42, nama: 'PALU', tipe: 'SATKER', korwil: 'Korwil XVII — Manado' },
  { no: 43, nama: 'PEKANBARU', tipe: 'SATKER', korwil: 'Korwil IV — Pekanbaru' },
  { no: 44, nama: 'PONTIANAK', tipe: 'SATKER', korwil: 'Korwil XIV — Pontianak' },
  { no: 45, nama: 'PURWOKERTO', tipe: 'SATKER', korwil: 'Korwil X — Yogyakarta' },
  { no: 46, nama: 'RANAI', tipe: 'SATKER' },
  { no: 47, nama: 'SAMARINDA', tipe: 'SATKER', korwil: 'Korwil XV — Banjarmasin' },
  { no: 48, nama: 'SEMARANG', tipe: 'SATKER', korwil: 'Korwil X — Yogyakarta' },
  { no: 49, nama: 'SERUI', tipe: 'SATKER' },
  { no: 50, nama: 'SIBOLGA', tipe: 'SATKER', korwil: 'Korwil II — Medan' },
  { no: 51, nama: 'SINGARAJA', tipe: 'SATKER', korwil: 'Korwil XII — Denpasar' },
  { no: 52, nama: 'SINTANG', tipe: 'SATKER', korwil: 'Korwil XIV — Pontianak' },
  { no: 53, nama: 'SORONG', tipe: 'SATKER' },
  { no: 54, nama: 'SUMENEP', tipe: 'SATKER', korwil: 'Korwil XI — Surabaya' },
  { no: 55, nama: 'SUNGAILIAT', tipe: 'SATKER' },
  { no: 56, nama: 'SURABAYA', tipe: 'SATKER', korwil: 'Korwil XI — Surabaya' },
  { no: 57, nama: 'SURAKARTA', tipe: 'SATKER', korwil: 'Korwil X — Yogyakarta' },
  { no: 58, nama: 'TAHUNA', tipe: 'SATKER' },
  { no: 59, nama: 'TAKENGON', tipe: 'SATKER', korwil: 'Korwil I — Banda Aceh' },
  { no: 60, nama: 'TANJUNG PINANG', tipe: 'SATKER', korwil: 'Korwil IV — Pekanbaru' },
  { no: 61, nama: 'TARAKAN', tipe: 'SATKER', korwil: 'Korwil XV — Banjarmasin' },
  { no: 62, nama: 'TERNATE', tipe: 'SATKER', korwil: 'Korwil XVII — Manado' },
  { no: 63, nama: 'TOLI TOLI', tipe: 'SATKER' },
  { no: 64, nama: 'LANGGUR', tipe: 'SATKER' },
  { no: 65, nama: 'WAMENA', tipe: 'SATKER' },
  { no: 66, nama: 'YOGYAKARTA', tipe: 'SATKER', korwil: 'Korwil X — Yogyakarta' },
  { no: 67, nama: 'BANTEN', tipe: 'SATKER' },
  { no: 68, nama: 'MAMUJU', tipe: 'SATKER', korwil: 'Korwil XVI — Makassar' },
  { no: 69, nama: 'PUSLITBANGDIKLAT', tipe: 'PUSLITBANGDIKLAT' },
];

export const JUMLAH_SATKER_BERNOMOR = DAFTAR_SATKER.filter(
  (s) => s.no !== null,
).length;

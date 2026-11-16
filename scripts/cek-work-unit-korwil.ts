// Verifikasi Work Unit + Korwil (PR #44, src/lib/satker.ts).
// Asersi: total entri DAFTAR_SATKER = 69; 0 entri bertipe SP; jumlah per
// Korwil SESUAI tabel penetapan user 2026-11-16 (termasuk keanggotaan
// persis per nomor); tepat 4 entri tanpa Korwil dan namanya persis
// KANTOR PUSAT, SANGGAU, LANGGUR, PUSLITBANGDIKLAT; nomor 1–69 lengkap
// tanpa lompatan; statistik landing tetap 69 (hitung seperti Beranda:
// filter no !== null).
// CATATAN: Korwil III, IX, XIII hanya 2 anggota — BUKAN 3/3/4 — karena
// 4 nama dari daftar user tidak cocok dengan entri bernomor mana pun
// (Tual, Entikong, Stasiun Siaran Luar Negeri, Pusat Pemberitaan) dan
// sengaja tidak dipetakan, bukan karena datanya hilang.
// Keluar bukan-nol bila ada asersi gagal.
import { DAFTAR_SATKER, JUMLAH_SATKER_BERNOMOR } from '../src/lib/satker';

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};

// Tabel penetapan Korwil per daftar user 2026-11-16 (nomor entri).
const HARAPAN: Record<string, number[]> = {
  'Korwil I — Jayapura': [23, 10, 37, 35, 65, 49, 12],
  'Korwil II — Manokwari': [32, 53, 18],
  'Korwil III — Ambon': [2, 62],
  'Korwil IV — Makassar': [29, 25, 42, 63, 68],
  'Korwil V — Manado': [31, 19, 58],
  'Korwil VI — Kupang': [26, 16, 3],
  'Korwil VII — Denpasar': [15, 51, 33],
  'Korwil VIII — Banjarmasin': [7, 47, 40, 61, 38],
  'Korwil IX — Pontianak': [44, 52],
  'Korwil X — Surabaya': [56, 30, 24, 54, 28],
  'Korwil XI — Yogyakarta': [66, 48, 57, 45],
  'Korwil XII — Bandung': [6, 14, 11],
  'Korwil XIII — Jakarta': [21, 67],
  'Korwil XIV — Palembang': [41, 5, 22, 9, 55],
  'Korwil XV — Pekanbaru': [43, 39, 60, 13, 8, 46],
  'Korwil XVI — Medan': [34, 50, 20],
  'Korwil XVII — Banda Aceh': [4, 27, 36, 59],
};
const TANPA_KORWIL = ['KANTOR PUSAT', 'SANGGAU', 'LANGGUR', 'PUSLITBANGDIKLAT'];

// --- Total & sub-stasiun. ---
cek('total entri DAFTAR_SATKER = 69', DAFTAR_SATKER.length === 69, `${DAFTAR_SATKER.length} entri`);
cek(
  '0 entri bertipe SP',
  DAFTAR_SATKER.every((s) => s.tipe !== 'SP'),
  `${DAFTAR_SATKER.filter((s) => s.tipe === 'SP').length} entri SP`,
);
cek(
  'tidak ada entri dengan field induk',
  DAFTAR_SATKER.every((s) => !('induk' in s)),
);
cek(
  'JUMLAH_SATKER_BERNOMOR = 69',
  JUMLAH_SATKER_BERNOMOR === 69,
  `${JUMLAH_SATKER_BERNOMOR}`,
);

// --- Nomor 1–69 lengkap tanpa lompatan. ---
const nomor = DAFTAR_SATKER.map((s) => s.no).sort((a, b) => (a ?? 0) - (b ?? 0));
cek(
  'nomor 1–69 lengkap tanpa lompatan',
  nomor.length === 69 && nomor.every((n, i) => n === i + 1),
  `nomor: ${nomor[0]}–${nomor[nomor.length - 1]}`,
);
cek(
  'nama unik (tidak ada duplikat)',
  new Set(DAFTAR_SATKER.map((s) => s.nama)).size === DAFTAR_SATKER.length,
);

// --- Jumlah + keanggotaan per Korwil. ---
const hitung = (k: string) => DAFTAR_SATKER.filter((s) => s.korwil === k);
for (const [korwil, nos] of Object.entries(HARAPAN)) {
  const anggota = hitung(korwil);
  const nomorAnggota = anggota.map((s) => s.no).sort((a, b) => (a ?? 0) - (b ?? 0));
  const nomorHarapan = [...nos].sort((a, b) => a - b);
  cek(
    `${korwil} = ${nos.length} anggota`,
    anggota.length === nos.length,
    `${anggota.length} vs ${nos.length}`,
  );
  cek(
    `${korwil} anggotanya persis no. ${nomorHarapan.join(', ')}`,
    nomorAnggota.length === nomorHarapan.length &&
      nomorAnggota.every((n, i) => n === nomorHarapan[i]),
    `no. ${nomorAnggota.join(', ')}`,
  );
}
cek(
  'hanya 17 nilai korwil yang dikenal',
  DAFTAR_SATKER.every(
    (s) => s.korwil === undefined || s.korwil in HARAPAN,
  ),
);
cek(
  'total ber-Korwil = 65',
  DAFTAR_SATKER.filter((s) => s.korwil !== undefined).length === 65,
  `${DAFTAR_SATKER.filter((s) => s.korwil !== undefined).length}`,
);

// --- Entri tanpa Korwil. ---
const tanpaKorwil = DAFTAR_SATKER.filter((s) => s.korwil === undefined);
cek('tepat 4 entri tanpa Korwil', tanpaKorwil.length === 4, `${tanpaKorwil.length}`);
cek(
  'nama tanpa Korwil persis KANTOR PUSAT, SANGGAU, LANGGUR, PUSLITBANGDIKLAT',
  tanpaKorwil.length === TANPA_KORWIL.length &&
    [...tanpaKorwil.map((s) => s.nama)].sort().join('|') ===
      [...TANPA_KORWIL].sort().join('|'),
  tanpaKorwil.map((s) => s.nama).join(', '),
);

// --- Statistik landing tetap 69 (hitung seperti Beranda). ---
const jumlahLanding = DAFTAR_SATKER.filter((s) => s.no !== null).length;
cek('statistik landing (no !== null) = 69', jumlahLanding === 69, `${jumlahLanding}`);

if (gagal > 0) {
  console.log(`\n${gagal} asersi GAGAL`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');

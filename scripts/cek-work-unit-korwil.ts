// Verifikasi Work Unit + Korwil (PR #46, src/lib/satker.ts).
// Asersi: total entri DAFTAR_SATKER = 69; 0 entri bertipe SP; jumlah per
// Korwil SESUAI tabel penetapan dari DAFTAR TERBARU situs Pitching Hub
// Direktorat LPU (halaman ARSIP PU), dibaca 2026-11-16 (termasuk
// keanggotaan persis per nomor); tepat 22 entri tanpa Korwil dan namanya
// persis sesuai daftar TANPA_KORWIL; nomor 1–69 lengkap tanpa lompatan;
// statistik landing tetap 69 (hitung seperti Beranda: filter no !== null).
// CATATAN: 10 Korwil anggotanya berkurang dibanding daftar hub karena
// 22 nama hub tidak cocok dengan entri bernomor mana pun (nama-nama itu
// adalah sub-stasiun: Singkil, Tapaktuan, Sabang, Solok, Tanjung Balai
// Karimun, Natuna, Sungai Penuh, Bungo, Lubuklinggau, Prabumulih, Curup,
// Mukomuko, Kotabumi, Metro, Liwa, Pringsewu, Ruteng, Ketapang, Entikong,
// Singkawang, Balikpapan, Tanjung Selor) dan sengaja tidak dipetakan,
// bukan karena datanya hilang. Korwil V, VI, VII, VIII hanya 1 anggota.
// Keluar bukan-nol bila ada asersi gagal.
import { DAFTAR_SATKER, JUMLAH_SATKER_BERNOMOR } from '../src/lib/satker';

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};

// Tabel penetapan Korwil per daftar hub terbaru 2026-11-16 (nomor entri).
const HARAPAN: Record<string, number[]> = {
  'Korwil I — Banda Aceh': [4, 27, 36, 59],
  'Korwil II — Medan': [20, 34, 50],
  'Korwil III — Padang': [13, 39],
  'Korwil IV — Pekanbaru': [8, 43, 60],
  'Korwil V — Jambi': [22],
  'Korwil VI — Palembang': [41],
  'Korwil VII — Bengkulu': [9],
  'Korwil VIII — Bandar Lampung': [5],
  'Korwil IX — Jakarta': [6, 11, 21],
  'Korwil X — Yogyakarta': [28, 45, 48, 57, 66],
  'Korwil XI — Surabaya': [24, 30, 54, 56],
  'Korwil XII — Denpasar': [15, 33, 51],
  'Korwil XIII — Kupang': [3, 16, 26],
  'Korwil XIV — Pontianak': [44, 52],
  'Korwil XV — Banjarmasin': [7, 40, 47, 61],
  'Korwil XVI — Makassar': [25, 29, 68],
  'Korwil XVII — Manado': [19, 31, 42, 62],
};
const TANPA_KORWIL = [
  'KANTOR PUSAT', 'AMBON', 'BIAK', 'BOVENDIGOEL', 'CIREBON', 'SANGGAU',
  'FAK FAK', 'JAYAPURA', 'MANOKWARI', 'MERAUKE', 'NABIRE', 'NUNUKAN',
  'RANAI', 'SERUI', 'SORONG', 'SUNGAILIAT', 'TAHUNA', 'TOLI TOLI',
  'LANGGUR', 'WAMENA', 'BANTEN', 'PUSLITBANGDIKLAT',
];

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
  'total ber-Korwil = 47',
  DAFTAR_SATKER.filter((s) => s.korwil !== undefined).length === 47,
  `${DAFTAR_SATKER.filter((s) => s.korwil !== undefined).length}`,
);

// --- Entri tanpa Korwil. ---
const tanpaKorwil = DAFTAR_SATKER.filter((s) => s.korwil === undefined);
cek('tepat 22 entri tanpa Korwil', tanpaKorwil.length === 22, `${tanpaKorwil.length}`);
cek(
  'nama tanpa Korwil persis 22 nama TANPA_KORWIL',
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

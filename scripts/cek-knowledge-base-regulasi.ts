// Verifikasi Knowledge Base regulasi + FAQ + Document (PR #49, 16/11/2026):
// - 9 artikel regulasi (id stabil, judul/kategori/ringkasan/isi benar,
//   tanpa duplikat) ada di daftar kanonis DAN di seed mode contoh.
// - 25 entri FAQ bersumber regulasi (id FAQ-01..FAQ-25, pertanyaan /
//   jawaban / sumber terisi, tanpa duplikat) ada di daftar kanonis DAN
//   di seed mode contoh.
// - 9 entri Document (nama/halaman/ukuran benar, tautan /dokumen/...,
//   ukuran cocok dengan berkas asli di ~/workspace/user/files/).
// - 6 total kontrol tidak berubah.
// - Invarian perbaikan idBerikutnya (PR #49): jangkar ^(\d+) tidak
//   mengubah id berikutnya untuk semua skema id yang sudah ada, dan id
//   KB manual berikutnya adalah 'KB-01' (bukan 'KB-2024').
import { statSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_NYATA } from '../src/lib/seedNyata';
import { ARTIKEL_REGULASI } from '../src/lib/artikelRegulasi';
import { FAQ_REGULASI } from '../src/lib/faqRegulasi';
import {
  DOKUMEN_REGULASI,
  urlDokumenRegulasi,
} from '../src/lib/dokumenRegulasi';
import { hitungTotalKontrol } from '../src/lib/derive';

let total = 0;
let lolos = 0;
const cek = (nama: string, ok: boolean, detail = '') => {
  total += 1;
  if (ok) {
    lolos += 1;
    console.log(`OK ${nama}${detail === '' ? '' : `: ${detail}`}`);
  } else {
    console.error(`GAGAL ${nama}${detail === '' ? '' : `: ${detail}`}`);
    process.exitCode = 1;
  }
};
const cekAngka = (nama: string, aktual: number, harap: number) =>
  cek(nama, aktual === harap, `${aktual} (harap ${harap})`);

// ---------- 6 total kontrol (tidak berubah) ----------
const k = hitungTotalKontrol(DATA_NYATA);
cekAngka('jumlahPksAktif', k.jumlahPks, 15);
cekAngka('nilaiKontrak', k.nilaiKontrak, 441863375);
cekAngka('totalTagihan', k.totalTagihan, 379068204);
cekAngka(
  'totalPembayaranTerverifikasi',
  k.totalPembayaranTerverifikasi,
  229405255,
);
cekAngka('sisaPiutang', k.sisaPiutang, 149662949);
cekAngka('totalDenda', k.totalDenda, 8873330);
cekAngka('totalPenerimaanAcuan', k.totalPenerimaanAcuan, 257590368);

// ---------- 9 artikel regulasi ----------
const ID_ARTIKEL = [
  'KB-PMK-115-2021',
  'KB-PP-5-2015',
  'KB-PP-68-2020',
  'KB-PERDIRUT-1-2023',
  'KB-PERDIRUT-5-2023',
  'KB-PERDIRUT-11-2023',
  'KB-PEDOMAN-LPU-2019',
  'KB-PEDOMAN-LPU-2023',
  'KB-JUKNIS-PNBP-13-2025',
];
cekAngka('jumlahArtikelRegulasi', ARTIKEL_REGULASI.length, 9);
cek(
  'idArtikelRegulasi',
  ARTIKEL_REGULASI.map((a) => a.id).join(',') === ID_ARTIKEL.join(','),
  ARTIKEL_REGULASI.map((a) => a.id).join(','),
);
cek(
  'idArtikelUnik',
  new Set(ARTIKEL_REGULASI.map((a) => a.id)).size === 9,
);
cek(
  'judulArtikelTerisi',
  ARTIKEL_REGULASI.every((a) => a.judul.trim() !== ''),
);
cek(
  'kategoriArtikelRegulasi',
  ARTIKEL_REGULASI.every((a) => a.kategori === 'Regulasi'),
  'semua berkategori Regulasi',
);
cek(
  'ringkasanArtikelTerisi',
  ARTIKEL_REGULASI.every((a) => a.ringkasan.trim().length >= 50),
);
cek(
  'isiArtikelTerisi',
  ARTIKEL_REGULASI.every((a) => (a.isi ?? '').trim().length >= 200),
);
const byId = new Map(ARTIKEL_REGULASI.map((a) => [a.id, a]));
cek(
  'nomorArtikel',
  byId.get('KB-PMK-115-2021')?.nomor === '115/PMK.03/2021' &&
    byId.get('KB-PP-5-2015')?.nomor === '5 Tahun 2015' &&
    byId.get('KB-PP-68-2020')?.nomor === '68 Tahun 2020' &&
    byId.get('KB-PERDIRUT-1-2023')?.nomor === '01 Tahun 2023' &&
    byId.get('KB-PERDIRUT-5-2023')?.nomor === '05 Tahun 2023' &&
    byId.get('KB-PERDIRUT-11-2023')?.nomor === '11 Tahun 2023' &&
    byId.get('KB-PEDOMAN-LPU-2019')?.nomor ===
      'Keputusan Direktur Utama LPP RRI Nomor 02 Tahun 2019' &&
    byId.get('KB-PEDOMAN-LPU-2023')?.nomor === undefined &&
    byId.get('KB-JUKNIS-PNBP-13-2025')?.nomor === '13 Tahun 2025',
  'nomor Pedoman 2023 sengaja kosong (tidak terbaca)',
);
cek(
  'tanggalBerlakuArtikel',
  byId.get('KB-PMK-115-2021')?.tanggalBerlaku === '2021-09-01' &&
    byId.get('KB-PERDIRUT-1-2023')?.tanggalBerlaku === '2023-01-05' &&
    byId.get('KB-JUKNIS-PNBP-13-2025')?.tanggalBerlaku === '2025-11-26',
);
// Q-03 terjawab di artikel Juknis; Q-06 dinyatakan tetap terbuka di sana.
const isiJuknis = byId.get('KB-JUKNIS-PNBP-13-2025')?.isi ?? '';
cek(
  'juknisRumusDendaQ03',
  isiJuknis.includes('2% (dua persen) per bulan') &&
    isiJuknis.includes('24 (dua puluh empat) bulan'),
  'denda 2%/bulan, maks 24 bulan',
);
cek(
  'juknisQ06TetapTerbuka',
  isiJuknis.includes('TIDAK memuat daftar dokumen wajib'),
);
cek(
  'pp5Dicabut',
  (byId.get('KB-PP-5-2015')?.isi ?? '').includes('dicabut') &&
    (byId.get('KB-PP-5-2015')?.ringkasan ?? '').includes('PP 68/2020'),
);
cek(
  'seedArtikelSamaDenganKanonis',
  DATA_NYATA.artikelKB.map((a) => a.id).join(',') === ID_ARTIKEL.join(','),
  `${DATA_NYATA.artikelKB.length} artikel di seed`,
);

// ---------- 25 entri FAQ ----------
cekAngka('jumlahFaq', FAQ_REGULASI.length, 25);
const ID_FAQ = Array.from({ length: 25 }, (_, i) => `FAQ-${String(i + 1).padStart(2, '0')}`);
cek(
  'idFaq',
  FAQ_REGULASI.map((f) => f.id).join(',') === ID_FAQ.join(','),
  FAQ_REGULASI.map((f) => f.id).join(','),
);
cek('idFaqUnik', new Set(FAQ_REGULASI.map((f) => f.id)).size === 25);
cek(
  'pertanyaanFaqTerisi',
  FAQ_REGULASI.every((f) => f.pertanyaan.trim().length >= 10),
);
cek(
  'jawabanFaqTerisi',
  FAQ_REGULASI.every((f) => f.jawaban.trim().length >= 50),
);
cek(
  'sumberFaqTerisi',
  FAQ_REGULASI.every((f) => f.sumber.trim() !== ''),
);
cek(
  'seedFaqSamaDenganKanonis',
  DATA_NYATA.faq.map((f) => f.id).join(',') === ID_FAQ.join(','),
  `${DATA_NYATA.faq.length} entri di seed`,
);
const faqDenda = FAQ_REGULASI.find((f) => f.id === 'FAQ-14');
cek(
  'faqDendaQ03',
  (faqDenda?.jawaban ?? '').includes('2% per bulan') &&
    (faqDenda?.sumber ?? '').includes('Juknis PNBP 13/2025 Pasal 21'),
);

// ---------- 9 entri Document ----------
const DOKUMEN_HARAP: [string, number, number][] = [
  ['PMK 115-PMK.03-2021.pdf', 85, 7031454],
  ['PP 5-2015.pdf', 54, 985693],
  ['PP 68-2020.pdf', 14, 701139],
  ['Perdirut RRI 1-2023.pdf', 68, 8748096],
  ['Perdirut RRI 5-2023.pdf', 71, 12945043],
  ['Perdirut RRI 11-2023.pdf', 26, 6068314],
  ['Pedoman LPU 2019.pdf', 94, 4320139],
  ['Pedoman LPU 2023.pdf', 53, 10592785],
  ['Juknis PNBP Perdirut 13-2025.pdf', 59, 2654753],
];
cekAngka('jumlahDokumen', DOKUMEN_REGULASI.length, 9);
cek(
  'namaBerkasDokumen',
  DOKUMEN_REGULASI.map((d) => d.berkas).join('|') ===
    DOKUMEN_HARAP.map((d) => d[0]).join('|'),
);
cek(
  'halamanDokumen',
  DOKUMEN_REGULASI.every(
    (d, i) => d.halaman === DOKUMEN_HARAP[i][1],
  ),
  'halaman sesuai pdfinfo',
);
cek(
  'ukuranDokumen',
  DOKUMEN_REGULASI.every(
    (d, i) => d.ukuranByte === DOKUMEN_HARAP[i][2],
  ),
  'ukuran sesuai stat',
);
cek(
  'tautanDokumen',
  DOKUMEN_REGULASI.every(
    (d) =>
      urlDokumenRegulasi(d.berkas) ===
      `/dokumen/${encodeURIComponent(d.berkas)}`,
  ),
  'tautan /dokumen/<nama-berkas>',
);
// Ukuran cocok dengan berkas asli di ~/workspace/user/files/.
const dirDokumen = join(process.cwd(), '..', 'user', 'files');
let ukuranCocok = true;
for (const d of DOKUMEN_REGULASI) {
  try {
    if (statSync(join(dirDokumen, d.berkas)).size !== d.ukuranByte)
      ukuranCocok = false;
  } catch {
    ukuranCocok = false;
  }
}
cek('ukuranCocokBerkasAsli', ukuranCocok, `dir ${dirDokumen}`);

// ---------- Invarian perbaikan idBerikutnya (jangkar ^(\d+)) ----------
// Id berikutnya dengan awalan yang sama; versi lama (tanpa jangkar) dan
// versi baru (dengan jangkar) harus sama untuk semua skema id yang ada.
const AWALAN = [
  'KLN-', 'BYR-', 'DND-', 'PJ-', 'PKL-', 'KB-', 'TGH-', 'DOK-',
  'QTN-', 'ORD-', 'MTG-', 'PRS-', 'UMP-', 'TKT-', 'PSN-',
];
const semuaId: string[] = [];
for (const daftar of Object.values(DATA_NYATA)) {
  if (!Array.isArray(daftar)) continue;
  for (const e of daftar as { id?: unknown }[]) {
    if (typeof e?.id === 'string') semuaId.push(e.id);
  }
}
const berikut = (awalan: string, jangkar: boolean, daftarId: string[]) => {
  let maks = 0;
  let lebar = 2;
  for (const id of daftarId) {
    if (!id.startsWith(awalan)) continue;
    const cocok = id
      .slice(awalan.length)
      .match(jangkar ? /^(\d+)/ : /(\d+)/);
    if (!cocok) continue;
    maks = Math.max(maks, Number(cocok[1]));
    lebar = Math.max(lebar, cocok[1].length);
  }
  return `${awalan}${String(maks + 1).padStart(lebar, '0')}`;
};
let jangkarAman = true;
for (const awalan of AWALAN) {
  // 'KB-' DIKECUALIKAN dari kesamaan lama-vs-baru: artikelKB kosong sebelum
  // PR ini, jadi tidak ada skema id KB lama — perubahan KB-2024 -> KB-01
  // justru perbaikan yang dimaksud (diasersi terpisah di bawah).
  if (awalan === 'KB-') continue;
  if (berikut(awalan, false, semuaId) !== berikut(awalan, true, semuaId)) {
    jangkarAman = false;
    console.error(
      `  awalan ${awalan} berubah: lama ${berikut(awalan, false, semuaId)} vs baru ${berikut(awalan, true, semuaId)}`,
    );
  }
}
cek('jangkarIdBerikutnyaAman', jangkarAman, 'tidak ada skema id lama berubah');
cek(
  'idKbManualBerikutnya',
  berikut('KB-', true, semuaId) === 'KB-01',
  `berikut('KB-') = ${berikut('KB-', true, semuaId)} (bukan KB-2024)`,
);

console.log(`\n${lolos}/${total} asersi lolos.`);

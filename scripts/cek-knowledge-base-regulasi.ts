// Verifikasi Knowledge Base regulasi + FAQ + Document (PR #49, 16/11/2026;
// PR #50: tab Document digabung ke Knowledge Base — tombol Download di
// sisi kanan tabel KB, tanpa kolom ID, terbaru paling atas; PR #51:
// tombol jadi "View" — membuka preview Google Drive, bukan /dokumen/):
// - 9 artikel regulasi (id stabil, judul/kategori/ringkasan/isi benar,
//   tanpa duplikat) ada di daftar kanonis DAN di seed mode contoh.
// - 25 entri FAQ bersumber regulasi (id FAQ-01..FAQ-25, pertanyaan /
//   jawaban / sumber terisi, tanpa duplikat) ada di daftar kanonis DAN
//   di seed mode contoh.
// - 9 entri Document (nama/halaman/ukuran benar, tautan preview Google
//   Drive, ukuran cocok dengan berkas asli di ~/workspace/user/files/)
//   — daftar kanonis berkas tetap ada sebagai sumber tautan artikel KB.
// - 6 total kontrol tidak berubah.
// - Invarian perbaikan idBerikutnya (PR #49): jangkar ^(\d+) tidak
//   mengubah id berikutnya untuk semua skema id yang sudah ada, dan id
//   KB manual berikutnya adalah 'KB-01' (bukan 'KB-2024').
import { statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_NYATA } from '../src/lib/seedNyata';
import {
  ARTIKEL_REGULASI,
  kunciUrutArtikelKB,
  urutkanArtikelKBBaruDulu,
} from '../src/lib/artikelRegulasi';
import { FAQ_REGULASI } from '../src/lib/faqRegulasi';
import {
  DOKUMEN_REGULASI,
  tautanUnduhArtikel,
  urlDokumenRegulasi,
  urlLihatDrive,
  urlUnduhDrive,
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

// ---------- Tautan unduh artikel + tanggal tidak dikarang (PR #50) ----------
// Tautan preview Google Drive (webViewLink) per artikel — disalin persis
// dari ~/workspace/dokumen-regulasi-drive.md (PR #51).
const TAUTAN_LIHAT_HARAP = new Map([
  [
    'PMK 115/PMK.03/2021',
    'https://drive.google.com/file/d/17mLmWqjyWzgK5wh7GcWW2kyFmt5olGQs/view?usp=drivesdk',
  ],
  [
    'PP 5/2015',
    'https://drive.google.com/file/d/1ZEXSEy-FKEcCGE5D7V27G0UDi_g6dBjT/view?usp=drivesdk',
  ],
  [
    'PP 68/2020',
    'https://drive.google.com/file/d/1aB-zvEo2WRidLjwaGM4RcrUy1EefGadW/view?usp=drivesdk',
  ],
  [
    'Perdirut RRI 1/2023',
    'https://drive.google.com/file/d/1igH8Leo4E2qOtnXBO7cmF0KknIYiPbT-/view?usp=drivesdk',
  ],
  [
    'Perdirut RRI 5/2023',
    'https://drive.google.com/file/d/118jqKJ1SjW56fImM9QBXnRekfFiExUx9/view?usp=drivesdk',
  ],
  [
    'Perdirut RRI 11/2023',
    'https://drive.google.com/file/d/1k176UfoWp9FTrlRvXpBO5HfrOi3W0-6D/view?usp=drivesdk',
  ],
  [
    'Pedoman LPU 2019',
    'https://drive.google.com/file/d/1H8WCzkZFi2Zv9CmE-R2UWR-QHdomdXB2/view?usp=drivesdk',
  ],
  [
    'Pedoman LPU 2023',
    'https://drive.google.com/file/d/1xi0WeLdA-0IyyZc42jcRpeNBMkbsSRRm/view?usp=drivesdk',
  ],
  [
    'Juknis PNBP Perdirut 13/2025',
    'https://drive.google.com/file/d/1jwqBV2ECzyXZA_XaTD0Gey8qs0SBLl1a/view?usp=drivesdk',
  ],
]);
const berkasUntukJudul = new Map(
  DOKUMEN_REGULASI.map((d) => [d.judul, d.berkas]),
);
cek(
  'tautanArtikelRegulasi',
  ARTIKEL_REGULASI.every(
    (a) =>
      a.tautan === TAUTAN_LIHAT_HARAP.get(a.judul) &&
      a.tautan ===
        urlDokumenRegulasi(berkasUntukJudul.get(a.judul) ?? ''),
  ),
  'tiap artikel membawa tautan preview Google Drive-nya',
);
cek(
  'tanggalBerlakuTidakDikarang',
  [
    'KB-PP-5-2015',
    'KB-PP-68-2020',
    'KB-PERDIRUT-5-2023',
    'KB-PERDIRUT-11-2023',
    'KB-PEDOMAN-LPU-2019',
    'KB-PEDOMAN-LPU-2023',
  ].every((id) => byId.get(id)?.tanggalBerlaku === undefined),
  '6 artikel tanpa tanggalBerlaku tetap tanpa tanggal (tampil "-")',
);

// ---------- Urutan KB terbaru-paling-atas (PR #50) ----------
// Aturan: tanggalBerlaku bila ada; bila tidak ada, 1 Januari dari tahun
// pada judul; bila tidak ada keduanya, paling bawah. Seri = urutan asal.
const URUTAN_HARAP = [
  'KB-JUKNIS-PNBP-13-2025', // 2025-11-26
  'KB-PERDIRUT-1-2023', // 2023-01-05
  'KB-PERDIRUT-5-2023', // 2023 (tanpa tanggal)
  'KB-PERDIRUT-11-2023', // 2023 (tanpa tanggal)
  'KB-PEDOMAN-LPU-2023', // 2023 (tanpa tanggal)
  'KB-PMK-115-2021', // 2021-09-01
  'KB-PP-68-2020', // 2020 (tanpa tanggal)
  'KB-PEDOMAN-LPU-2019', // 2019 (tanpa tanggal)
  'KB-PP-5-2015', // 2015 (tanpa tanggal)
];
cek(
  'urutanKbTerbaruDulu',
  urutkanArtikelKBBaruDulu(ARTIKEL_REGULASI)
    .map((a) => a.id)
    .join(',') === URUTAN_HARAP.join(','),
  urutkanArtikelKBBaruDulu(ARTIKEL_REGULASI).map((a) => a.id).join(','),
);
cek(
  'kunciUrutArtikelKB',
  kunciUrutArtikelKB({
    id: 'X',
    judul: 'Perdirut RRI 11/2023',
    tanggalBerlaku: '2023-01-05',
    ringkasan: '',
    dibuatOleh: '',
    dibuatPada: '',
  }) === '2023-01-05' &&
    kunciUrutArtikelKB({
      id: 'X',
      judul: 'Perdirut RRI 11/2023',
      ringkasan: '',
      dibuatOleh: '',
      dibuatPada: '',
    }) === '2023-01-01' &&
    kunciUrutArtikelKB({
      id: 'X',
      judul: 'Pedoman Tanpa Tahun',
      ringkasan: '',
      dibuatOleh: '',
      dibuatPada: '',
    }) === null,
  'tanggalBerlaku didahulukan; tahun judul jadi 1 Jan; tanpa tahun = null',
);
cek(
  'fallbackTautanUnduh',
  tautanUnduhArtikel({ judul: 'PP 68/2020' }) ===
    'https://drive.google.com/file/d/1aB-zvEo2WRidLjwaGM4RcrUy1EefGadW/view?usp=drivesdk' &&
    tautanUnduhArtikel({
      judul: 'PP 68/2020',
      tautan: 'https://contoh.test/x.pdf',
    }) === 'https://contoh.test/x.pdf' &&
    tautanUnduhArtikel({ judul: 'Tidak ada' }) === undefined,
  'tautan tersimpan menang; judul cocok ke kanonis; judul asing = undefined',
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
// Daftar kanonis berkas tetap ada (sumber tautan unduh artikel KB);
// tab Document-nya sudah digabung ke Knowledge Base (PR #50).
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
// ID Drive per berkas — disalin persis dari
// ~/workspace/dokumen-regulasi-drive.md (PR #51).
const DRIVE_ID_HARAP = new Map([
  ['PMK 115-PMK.03-2021.pdf', '17mLmWqjyWzgK5wh7GcWW2kyFmt5olGQs'],
  ['PP 5-2015.pdf', '1ZEXSEy-FKEcCGE5D7V27G0UDi_g6dBjT'],
  ['PP 68-2020.pdf', '1aB-zvEo2WRidLjwaGM4RcrUy1EefGadW'],
  ['Perdirut RRI 1-2023.pdf', '1igH8Leo4E2qOtnXBO7cmF0KknIYiPbT-'],
  ['Perdirut RRI 5-2023.pdf', '118jqKJ1SjW56fImM9QBXnRekfFiExUx9'],
  ['Perdirut RRI 11-2023.pdf', '1k176UfoWp9FTrlRvXpBO5HfrOi3W0-6D'],
  ['Pedoman LPU 2019.pdf', '1H8WCzkZFi2Zv9CmE-R2UWR-QHdomdXB2'],
  ['Pedoman LPU 2023.pdf', '1xi0WeLdA-0IyyZc42jcRpeNBMkbsSRRm'],
  ['Juknis PNBP Perdirut 13-2025.pdf', '1jwqBV2ECzyXZA_XaTD0Gey8qs0SBLl1a'],
]);
cek(
  'driveIdDokumen',
  DOKUMEN_REGULASI.every(
    (d) => d.driveId === DRIVE_ID_HARAP.get(d.berkas),
  ),
  'ID Drive per berkas sesuai daftar',
);
cek(
  'tautanDokumen',
  DOKUMEN_REGULASI.every(
    (d) =>
      urlDokumenRegulasi(d.berkas) === urlLihatDrive(d.driveId) &&
      urlDokumenRegulasi(d.berkas) ===
        `https://drive.google.com/file/d/${d.driveId}/view?usp=drivesdk` &&
      urlUnduhDrive(d.driveId) ===
        `https://drive.google.com/uc?id=${d.driveId}&export=download`,
  ),
  'tautan preview Drive (webViewLink); unduh langsung hanya fallback',
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

// ---------- Judul tab browser (PR #49, lipatan 09:42 WIB) ----------
// index.html <title> "RRI Deals" (bukan lagi "Partnership LPP RRI").
const judulTab = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
cek(
  'judulTabRriDeals',
  judulTab.includes('<title>RRI Deals</title>') &&
    !judulTab.includes('<title>Partnership LPP RRI</title>'),
  'index.html <title> = RRI Deals',
);

// ---------- Tab Document digabung ke KB (PR #50) ----------
const sumberService = readFileSync(
  join(process.cwd(), 'src', 'modules', 'Service.tsx'),
  'utf8',
);
cek(
  'tabDocumentDihapus',
  !sumberService.includes("{ id: 'document'") &&
    !sumberService.includes('function Dokumen(') &&
    !sumberService.includes('DOKUMEN_REGULASI.map'),
  'tab Document tidak ada; komponen Dokumen dihapus',
);
const awalKb = sumberService.indexOf('function KnowledgeBase(');
const akhirKb = sumberService.indexOf('function FormArtikelKB(');
const sumberKb = sumberService.slice(awalKb, akhirKb);
cek(
  'tabelKbKolomView',
  awalKb >= 0 &&
    akhirKb > awalKb &&
    !sumberKb.includes('<Th>ID</Th>') &&
    sumberKb.includes('<Th>View</Th>') &&
    !sumberKb.includes('<Th>Download</Th>') &&
    sumberKb.indexOf('<Th>View</Th>') >
      sumberKb.indexOf('<Th>Summary</Th>') &&
    sumberKb.includes('artikelTerurut.map') &&
    sumberKb.includes('tautanUnduhArtikel(a)') &&
    />\s*View\s*<\/a>/.test(sumberKb) &&
    !/>\s*Download\s*<\/a>/.test(sumberKb),
  'tanpa kolom ID; View paling kanan; daftar terurut; tautan per baris',
);
cek(
  'keteranganDriveKb',
  sumberKb.includes('Google Drive') &&
    sumberKb.includes('preview') &&
    !sumberKb.includes('public/dokumen/') &&
    !sumberKb.includes('shows a 404'),
  'keterangan Drive: View membuka preview; unduh di dalam preview',
);
cek(
  'detailBukaPreview',
  sumberKb.includes('Open document') &&
    sumberKb.includes('target="_blank"'),
  'kartu detail membuka preview Drive di tab baru',
);

console.log(`\n${lolos}/${total} asersi lolos.`);

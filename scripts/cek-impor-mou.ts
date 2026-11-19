// Verifikasi impor MoU (19/11/2026) + perbaikan panel MoU (19/11/2026)
// — TANPA Firestore.
// - Seed: 44 record MoU dari file pengguna (26 Nota Kesepahaman, 17
//   Perjanjian Kerjasama, 1 Pelaksanaan Kerja Sama), semua field wajib
//   terisi, tanggal valid, typo tahun sumber '0206' sudah dikoreksi.
// - Perbaikan 037 (keputusan pengguna 19/11/2026 14:41 WIB): PIC record
//   037/RRI-PLB/KJM.02.04/09/2026 menjadi 'Ja'far' (di sumber kosong)
//   dan backtick nyasar di nama instansinya dibersihkan — diterapkan di
//   generator (scripts/impor-mou.py) supaya regenerasi seed tetap sama.
// - Panel MoU membaca data.mou (bukan kontrak); teks empty-state lama
//   tentang kategori 'Nota Kesepahaman' sudah tidak ada; kolom
//   "Remaining Days" di samping Period dan kolom "Document" paling
//   kanan (View membuka detail MoU).
// - Patch live satu kali record 037 (tanpa guard meta baru — prakondisi
//   nilai live): cakupan PERSIS 1 dokumen + 2 field, menolak bila sudah
//   diperbaiki / dokumen hilang / nilai di luar dugaan.
// - Total kontrak PNBP TIDAK berubah: 42 kontrak, Rp441.863.375.
// - firestore.rules: koleksi `mou` di allowlist operator + blok guard
//   `meta/migrasi-mou-2026`; TIDAK ADA perubahan rules di PR ini (patch
//   menulis ke koleksi `mou` yang sudah diizinkan).
// - Rencana migrasi MoU: cakupan PERSIS ['mou'], guard baru berbeda
//   dari guard migrasi lain, prakondisi live 0, verifikasi lolos pada
//   seed dan menolak bila data berubah.
// Keluar bukan-nol bila ada asersi gagal.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_NYATA } from '../src/lib/seedNyata';
import { DATA_CONTOH } from '../src/lib/sampleData';
import { KOLEKSI } from '../src/lib/firestoreStore';
import {
  ID_GUARD_MIGRASI_MOU,
  ID_GUARD_MIGRASI_PERTAMA,
  ID_GUARD_REMIGRASI_KONTRAK,
  JENIS_MOU_DIHARAPKAN,
  JUMLAH_MOU_SEED,
  KOLEKSI_MIGRASI_MOU,
  TOTAL_KONTROL_KONTRAK,
  periksaPrakondisiMou,
  verifikasiHasilMou,
} from '../src/lib/migrasiMouRencana';
import { sisaHariMou } from '../src/lib/kontrakTampilan';
import {
  ID_MOU_037,
  INSTANSI_MOU_037_BARU,
  INSTANSI_MOU_037_LAMA,
  PERBAIKAN_MOU_037,
  PIC_MOU_037_BARU,
  PIC_MOU_037_LAMA,
  periksaPrakondisiPerbaikanMou037,
  verifikasiHasilPerbaikanMou037,
} from '../src/lib/perbaikanMou037Rencana';

// Dijalankan dari root repo — berkas dibaca saat runtime, jadi path
// diambil dari cwd, bukan dari lokasi bundle.
const baca = (relatif: string) =>
  readFileSync(join(process.cwd(), relatif), 'utf8');
const kerjaSama = baca('src/modules/KerjaSama.tsx');
const rules = baca('firestore.rules');
const app = baca('src/App.tsx');
const master = baca('src/modules/MasterPage.tsx');

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};

// ---------- seed: 44 record, rincian JENIS 26/17/1 ----------
const mou = DATA_NYATA.mou;
cek('seed mou 44 record', mou.length === 44, `${mou.length}`);
cek(
  'seed mou rincian JENIS 26/17/1',
  ['Nota Kesepahaman', 'Perjanjian Kerjasama', 'Pelaksanaan Kerja Sama'].every(
    (j) => mou.filter((m) => m.jenis === j).length === JENIS_MOU_DIHARAPKAN[j],
  ),
  JSON.stringify(
    Object.fromEntries(
      Object.keys(JENIS_MOU_DIHARAPKAN).map((j) => [
        j,
        mou.filter((m) => m.jenis === j).length,
      ]),
    ),
  ),
);
cek(
  'seed mou id unik (nomor dokumen)',
  new Set(mou.map((m) => m.id)).size === 44,
);
const wajib = [
  'id',
  'jenis',
  'instansi',
  'kategori',
  'judul',
  'tanggalTandaTangan',
  'tanggalMulai',
  'tanggalSelesai',
  'masaBerlaku',
] as const;
cek(
  'seed mou semua field wajib terisi',
  mou.every((m) =>
    wajib.every((f) => typeof m[f] === 'string' && m[f].trim() !== ''),
  ),
);
const polaTanggal = /^\d{4}-\d{2}-\d{2}$/;
cek(
  'seed mou tanggal format yyyy-mm-dd',
  mou.every(
    (m) =>
      polaTanggal.test(m.tanggalTandaTangan) &&
      polaTanggal.test(m.tanggalMulai) &&
      polaTanggal.test(m.tanggalSelesai),
  ),
);
const tglTandaTangan = mou.map((m) => m.tanggalTandaTangan).sort();
cek(
  'seed mou tanggal 2026-01-20..2026-11-04',
  tglTandaTangan[0] === '2026-01-20' &&
    tglTandaTangan[tglTandaTangan.length - 1] === '2026-11-04',
  `${tglTandaTangan[0]}..${tglTandaTangan[tglTandaTangan.length - 1]}`,
);
cek(
  'seed mou tanpa masa "2 tahun" huruf kecil',
  mou.every((m) => m.masaBerlaku !== '2 tahun'),
);
cek(
  'seed mou PIC Dessi (5) dan Dessi Maya Sari (2) TIDAK digabung',
  mou.filter((m) => m.pic === 'Dessi').length === 5 &&
    mou.filter((m) => m.pic === 'Dessi Maya Sari').length === 2,
);
cek(
  "seed mou PIC Selvia Lena 4 baris (bukan operator, tetap disimpan)",
  mou.filter((m) => m.pic === 'Selvia Lena').length === 4,
);
cek(
  "seed mou PIC '—' tinggal 0 baris (037 dikoreksi pengguna menjadi Ja'far)",
  mou.filter((m) => m.pic === '—').length === 0,
  `${mou.filter((m) => m.pic === '—').length}`,
);
cek(
  "seed mou PIC 'Ja'far' 2 baris (1 dari sumber + 037 dari koreksi)",
  mou.filter((m) => m.pic === "Ja'far").length === 2,
);
cek(
  "seed mou 037 PIC Ja'far + instansi tanpa backtick + dokumen tetap '—'",
  (() => {
    const r037 = mou.find((m) => m.id === ID_MOU_037);
    return (
      r037?.pic === PIC_MOU_037_BARU &&
      r037?.instansi === INSTANSI_MOU_037_BARU &&
      r037?.dokumen === '—'
    );
  })(),
);
cek(
  'seed mou TIDAK ADA instansi berakhir backtick',
  mou.every((m) => !m.instansi.endsWith('`')),
);
cek(
  "seed mou DOKUMEN '—' tepat 21 baris",
  mou.filter((m) => m.dokumen === '—').length === 21,
);
const perId = new Map(mou.map((m) => [m.id, m]));
cek(
  "typo tahun sumber baris 28 dikoreksi (023/.../05/2026 mulai 2026-04-07, selesai 2028-04-07)",
  perId.get('023/RRI-PLB/KJM.02.04/05/2026')?.tanggalMulai === '2026-04-07' &&
    perId.get('023/RRI-PLB/KJM.02.04/05/2026')?.tanggalSelesai === '2028-04-07',
);
cek(
  "typo tahun sumber baris 29 dikoreksi (024/.../05/2026 mulai+selesai 2026-05-06)",
  perId.get('024/RRI-PLB/KJM.02.04/05/2026')?.tanggalMulai === '2026-05-06' &&
    perId.get('024/RRI-PLB/KJM.02.04/05/2026')?.tanggalSelesai === '2026-05-06',
);
cek(
  'seed mou satker 41 PALEMBANG semua',
  mou.every((m) => m.satker.kode === '41' && m.satker.nama === 'PALEMBANG'),
);

// ---------- wiring: koleksi + sample kosong ----------
cek('KOLEKSI mou = "mou"', KOLEKSI.mou === 'mou', KOLEKSI.mou);
cek('DATA_CONTOH mou kosong', DATA_CONTOH.mou.length === 0);

// ---------- panel MoU membaca data.mou, bukan kontrak ----------
cek(
  'panel MoU memakai data.mou',
  kerjaSama.includes('data.mou'),
);
cek(
  'panel MoU TIDAK memfilter kontrak kategori Nota Kesepahaman',
  !kerjaSama.includes("kategoriLayanan === 'Nota Kesepahaman'"),
);
cek(
  'teks empty-state lama (kategori Nota Kesepahaman) sudah tidak ada',
  !kerjaSama.includes(
    "No contract in the imported data has the 'Nota Kesepahaman' service category yet",
  ),
);
cek(
  'panel MoU empty state mengarah ke migrasi MoU',
  kerjaSama.includes('Run the MoU migration from the') &&
    kerjaSama.includes('Master &amp; Users page'),
);
cek(
  'panel Commitment tetap filter kontrak Dukungan Layanan (tidak disentuh)',
  kerjaSama.includes('kategori="Dukungan Layanan"'),
);
cek(
  'panel Approvement tetap filter kontrak Media Partner (tidak disentuh)',
  kerjaSama.includes('kategori="Media Partner"'),
);

// ---------- kolom Remaining Days + Document di tabel MoU ----------
const idxPeriod = kerjaSama.indexOf('<Th>Period</Th>');
const idxSisa = kerjaSama.indexOf('<Th>Remaining Days</Th>');
const idxValidity = kerjaSama.indexOf('<Th>Validity</Th>');
const idxPic = kerjaSama.indexOf('<Th>PIC</Th>');
const idxDokumen = kerjaSama.indexOf('<Th>Document</Th>');
cek(
  'kolom Remaining Days tepat sesudah Period (sebelum Validity)',
  idxPeriod > -1 && idxPeriod < idxSisa && idxSisa < idxValidity,
  `${idxPeriod}/${idxSisa}/${idxValidity}`,
);
cek(
  'kolom Document PALING KANAN (sesudah PIC, penutup thead)',
  idxPic > -1 &&
    idxPic < idxDokumen &&
    kerjaSama.includes('<Th>Document</Th>\n            </tr>'),
  `${idxPic}/${idxDokumen}`,
);
const tabelMou = kerjaSama.slice(
  kerjaSama.indexOf('function DaftarMou'),
  kerjaSama.indexOf('export function MenuKomitmen'),
);
cek(
  'baris MoU memakai sisaHariMou(m) untuk Remaining Days',
  tabelMou.includes('sisaHariMou(m)'),
);
cek(
  'kolom Document menampilkan nilai dokumen + tombol View (stopPropagation)',
  tabelMou.includes('{m.dokumen}') &&
    tabelMou.includes('View') &&
    tabelMou.includes('e.stopPropagation();') &&
    tabelMou.includes('setMouIdTerpilih(m.id)'),
);
cek(
  "kolom Document menampilkan '—' bila dokumen kosong",
  tabelMou.includes("m.dokumen === '—'"),
);

// ---------- helper sisaHariMou (format sama seperti kontrak) ----------
const r037 = mou.find((m) => m.id === ID_MOU_037);
cek(
  'sisaHariMou 037 = 672 days pada 2026-11-19 (selesai 2028-09-21)',
  r037 !== undefined && sisaHariMou(r037, '2026-11-19') === '672 days',
  r037 ? sisaHariMou(r037, '2026-11-19') : '(037 tidak ada)',
);
cek(
  'sisaHariMou tanggal akhir lewat tampil apa adanya (-5 days)',
  r037 !== undefined &&
    sisaHariMou({ ...r037, tanggalSelesai: '2026-11-14' }, '2026-11-19') ===
      '-5 days',
);
cek(
  'sisaHariMou bentuk tunggal 1 day',
  r037 !== undefined &&
    sisaHariMou({ ...r037, tanggalSelesai: '2026-11-20' }, '2026-11-19') ===
      '1 day',
);
cek(
  'sisaHariMou 0 days di hari terakhir',
  r037 !== undefined &&
    sisaHariMou({ ...r037, tanggalSelesai: '2026-11-19' }, '2026-11-19') ===
      '0 days',
);

// ---------- total kontrak PNBP TIDAK berubah ----------
cek(
  'kontrak seed tetap 42',
  DATA_NYATA.kontrak.length === TOTAL_KONTROL_KONTRAK.jumlahKontrak,
  `${DATA_NYATA.kontrak.length}`,
);
cek(
  'nilai kontrak seed tetap Rp441.863.375',
  DATA_NYATA.kontrak.reduce((s, k) => s + k.nilaiKontrak, 0) ===
    TOTAL_KONTROL_KONTRAK.nilaiKontrak,
  `Rp${DATA_NYATA.kontrak.reduce((s, k) => s + k.nilaiKontrak, 0).toLocaleString('id-ID')}`,
);

// ---------- firestore.rules ----------
cek(
  "rules allowlist memuat 'mou' 4x (read/create/update/delete)",
  (rules.match(/^ *'mou',?$/gm) ?? []).length === 4,
  `${(rules.match(/^ *'mou',?$/gm) ?? []).length}x`,
);
cek(
  'rules blok guard meta/migrasi-mou-2026 ada',
  rules.includes('match /meta/migrasi-mou-2026 {'),
);
cek(
  'rules TIDAK menambah guard meta baru untuk patch 037 (tanpa publish rules)',
  !rules.includes('perbaikan-mou-037'),
);
cek(
  'rules hitungan koleksi bersatker diperbarui (20 di blok)',
  rules.includes('20 koleksi di blok ini'),
);

// ---------- rencana migrasi MoU ----------
cek(
  "guard migrasi MoU bernama 'migrasi-mou-2026'",
  ID_GUARD_MIGRASI_MOU === 'migrasi-mou-2026',
  ID_GUARD_MIGRASI_MOU,
);
cek(
  'guard MoU BERBEDA dari guard migrasi pertama dan re-migrasi kontrak',
  ID_GUARD_MIGRASI_MOU !== ID_GUARD_MIGRASI_PERTAMA &&
    ID_GUARD_MIGRASI_MOU !== ID_GUARD_REMIGRASI_KONTRAK,
);
cek(
  "cakupan migrasi MoU PERSIS ['mou']",
  KOLEKSI_MIGRASI_MOU.length === 1 && KOLEKSI_MIGRASI_MOU[0] === 'mou',
  KOLEKSI_MIGRASI_MOU.join(','),
);
cek(
  'JUMLAH_MOU_SEED 44',
  JUMLAH_MOU_SEED === 44,
  `${JUMLAH_MOU_SEED}`,
);
cek(
  'prakondisi LOLOS bila live mou 0',
  periksaPrakondisiMou(0).length === 0,
);
cek(
  'prakondisi MENOLAK bila live mou sudah ada (1)',
  periksaPrakondisiMou(1).length > 0,
);
cek(
  'verifikasi LOLOS pada seed (mou 44 + kontrak tidak berubah)',
  verifikasiHasilMou({ mou: DATA_NYATA.mou, kontrak: DATA_NYATA.kontrak })
    .length === 0,
  verifikasiHasilMou({
    mou: DATA_NYATA.mou,
    kontrak: DATA_NYATA.kontrak,
  }).join(' | '),
);
cek(
  'verifikasi MENOLAK bila mou kurang (43)',
  verifikasiHasilMou({
    mou: DATA_NYATA.mou.slice(0, 43),
    kontrak: DATA_NYATA.kontrak,
  }).length > 0,
);
const nilaiSalah = {
  ...DATA_NYATA,
  kontrak: DATA_NYATA.kontrak.map((k, i) =>
    i === 0 ? { ...k, nilaiKontrak: k.nilaiKontrak + 1000 } : k,
  ),
};
cek(
  'verifikasi MENOLAK bila total kontrak berubah',
  verifikasiHasilMou({ mou: DATA_NYATA.mou, kontrak: nilaiSalah.kontrak })
    .length > 0,
);

// ---------- wiring UI migrasi MoU ----------
cek(
  'App.tsx memasang handler + status migrasi MoU',
  app.includes('tanganiMigrasiMou') &&
    app.includes('onMigrasiMou={tanganiMigrasiMou}') &&
    app.includes('statusMigrasiMou'),
);
cek(
  'MasterPage memuat kartu migrasi MoU',
  master.includes('BagianMigrasiMou') &&
    master.includes('Run MoU migration'),
);

// ---------- patch live satu kali MoU 037 ----------
cek(
  'target patch PERSIS dokumen 037',
  ID_MOU_037 === '037/RRI-PLB/KJM.02.04/09/2026',
  ID_MOU_037,
);
cek(
  'patch hanya menulis 2 field (pic, instansi) dengan nilai baru',
  Object.keys(PERBAIKAN_MOU_037).sort().join(',') === 'instansi,pic' &&
    PERBAIKAN_MOU_037.pic === PIC_MOU_037_BARU &&
    PERBAIKAN_MOU_037.instansi === INSTANSI_MOU_037_BARU,
  JSON.stringify(PERBAIKAN_MOU_037),
);
const dok037Lama = {
  id: ID_MOU_037,
  pic: PIC_MOU_037_LAMA,
  instansi: INSTANSI_MOU_037_LAMA,
};
const dok037Baru = {
  id: ID_MOU_037,
  pic: PIC_MOU_037_BARU,
  instansi: INSTANSI_MOU_037_BARU,
};
cek(
  'prakondisi patch LOLOS pada nilai lama',
  periksaPrakondisiPerbaikanMou037(dok037Lama).length === 0,
);
cek(
  'prakondisi patch MENOLAK bila dokumen hilang (null)',
  periksaPrakondisiPerbaikanMou037(null).length > 0,
);
cek(
  'prakondisi patch MENOLAK bila sudah diperbaiki (nilai baru = jalan kedua)',
  periksaPrakondisiPerbaikanMou037(dok037Baru).length > 0,
);
cek(
  'prakondisi patch MENOLAK bila nilai live di luar dugaan',
  periksaPrakondisiPerbaikanMou037({
    id: ID_MOU_037,
    pic: 'Nadya Pratita',
    instansi: INSTANSI_MOU_037_LAMA,
  }).length > 0,
);
cek(
  'verifikasi patch LOLOS pada nilai baru',
  verifikasiHasilPerbaikanMou037(dok037Baru).length === 0,
);
cek(
  'verifikasi patch MENOLAK pada nilai lama',
  verifikasiHasilPerbaikanMou037(dok037Lama).length > 0,
);
cek(
  'verifikasi patch MENOLAK bila dokumen hilang (null)',
  verifikasiHasilPerbaikanMou037(null).length > 0,
);
cek(
  'MasterPage memuat kartu perbaikan MoU 037',
  master.includes('BagianPerbaikanMou037') &&
    master.includes('Run MoU 037 fix'),
);
cek(
  'App.tsx memasang handler + status perbaikan MoU 037',
  app.includes('tanganiPerbaikanMou037') &&
    app.includes('onPerbaikanMou037={tanganiPerbaikanMou037}') &&
    app.includes('statusPerbaikanMou037'),
);

if (gagal > 0) {
  console.error(`\n${gagal} asersi GAGAL.`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');

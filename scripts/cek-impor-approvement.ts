// Verifikasi daftar surat persetujuan Media Partner (Approvement,
// definisi pengguna 24/11/2026) — TANPA Firestore.
// - Seed: 4 record DUMMY dari seedApprovement.ts (2 organisasi
//   mahasiswa + 2 komunitas, berlabel "(Contoh)"), nilai kompensasi
//   Rp0 untuk barter (3 record) + Rp2.500.000 tunai (1 record),
//   dokumen '—' semua (upload ditunda).
// - Panel Media Partner membaca data.approvement (bukan kontrak);
//   tampilan lama (filter kontrak berkategori 'Media Partner') sudah
//   tidak ada.
// - Total kontrak PNBP TIDAK berubah: 42 kontrak, Rp441.863.375.
// - firestore.rules: koleksi `approvement` di allowlist operator
//   (read/create/update/delete) + hitungan koleksi bersatker 22.
// - Migrasi Approvement: migrasiApprovement.ts +
//   migrasiApprovementRencana.ts (guard meta/migrasi-approvement-2026,
//   sekali jalan, hanya bila live kosong), kartu "Migrasi Data Media
//   Partner" di Master & Users, blok guard di firestore.rules
//   (publish rules dulu sebelum menjalankan migrasi).
// Keluar bukan-nol bila ada asersi gagal.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_NYATA } from '../src/lib/seedNyata';
import { DATA_CONTOH } from '../src/lib/sampleData';
import { KOLEKSI } from '../src/lib/firestoreStore';
import { TOTAL_KONTROL_KONTRAK } from '../src/lib/migrasiCommitmentRencana';
import {
  ID_GUARD_MIGRASI_APPROVEMENT,
  ID_GUARD_MIGRASI_COMMITMENT,
  ID_GUARD_MIGRASI_MOU,
  ID_GUARD_MIGRASI_PERTAMA,
  ID_GUARD_REMIGRASI_KONTRAK,
  JUMLAH_APPROVEMENT_SEED,
  KOLEKSI_MIGRASI_APPROVEMENT,
  periksaPrakondisiApprovement,
  verifikasiHasilApprovement,
} from '../src/lib/migrasiApprovementRencana';

// Dijalankan dari root repo — berkas dibaca saat runtime, jadi path
// diambil dari cwd, bukan dari lokasi bundle.
const baca = (relatif: string) =>
  readFileSync(join(process.cwd(), relatif), 'utf8');
const kerjaSama = baca('src/modules/KerjaSama.tsx');
const rules = baca('firestore.rules');
const types = baca('src/lib/types.ts');
const migrasiApprovement = baca('src/lib/migrasiApprovement.ts');
const master = baca('src/modules/MasterPage.tsx');
const app = baca('src/App.tsx');

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};

// ---------- seed: 4 record dummy, 2 mahasiswa + 2 komunitas ----------
const approvement = DATA_NYATA.approvement;
cek('seed approvement 4 record', approvement.length === 4, `${approvement.length}`);
cek(
  'seed approvement 2 Mahasiswa + 2 Komunitas',
  approvement.filter((a) => a.jenisKlien === 'Mahasiswa').length === 2 &&
    approvement.filter((a) => a.jenisKlien === 'Komunitas').length === 2,
  approvement.map((a) => a.jenisKlien).join(','),
);
cek(
  'seed approvement id unik APR-01..APR-04',
  approvement.map((a) => a.id).join(',') === 'APR-01,APR-02,APR-03,APR-04',
  approvement.map((a) => a.id).join(','),
);
cek(
  'seed approvement nomorSurat unik',
  new Set(approvement.map((a) => a.nomorSurat)).size === 4,
);
const wajib = [
  'id',
  'nomorSurat',
  'namaKlien',
  'jenisKlien',
  'namaNarahubung',
  'tanggalPelaksanaan',
  'jenisKompensasi',
] as const;
cek(
  'seed approvement semua field wajib terisi',
  approvement.every((a) =>
    wajib.every((f) => typeof a[f] === 'string' && a[f].trim() !== ''),
  ),
);
cek(
  'seed approvement namaKlien semua berlabel (Contoh)',
  approvement.every((a) => a.namaKlien.includes('(Contoh)')),
  approvement.map((a) => a.namaKlien).join(' | '),
);
cek(
  "seed approvement dokumen '—' semua (upload ditunda)",
  approvement.every((a) => a.dokumen === '—'),
);
cek(
  'seed approvement nilaiKompensasi 3x Rp0 (barter) + 1x Rp2.500.000 (tunai)',
  approvement.filter((a) => a.nilaiKompensasi === 0).length === 3 &&
    approvement.filter((a) => a.nilaiKompensasi === 2500000).length === 1,
  approvement.map((a) => a.nilaiKompensasi).join(','),
);
cek(
  'seed approvement nilaiKompensasi tidak negatif',
  approvement.every((a) => a.nilaiKompensasi >= 0),
);
cek(
  'seed approvement tanggalPelaksanaan format yyyy-mm-dd',
  approvement.every((a) => /^\d{4}-\d{2}-\d{2}$/.test(a.tanggalPelaksanaan)),
  approvement.map((a) => a.tanggalPelaksanaan).join(','),
);
cek(
  'seed approvement satker 41 PALEMBANG semua',
  approvement.every((a) => a.satker.kode === '41' && a.satker.nama === 'PALEMBANG'),
);
cek(
  'seed approvement total nilai kompensasi Rp2.500.000',
  approvement.reduce((s, a) => s + a.nilaiKompensasi, 0) === 2500000,
  `Rp${approvement.reduce((s, a) => s + a.nilaiKompensasi, 0).toLocaleString('id-ID')}`,
);

// ---------- wiring: tipe + koleksi + sample kosong ----------
cek(
  'types.ts mendefinisikan interface Approvement',
  types.includes('export interface Approvement {'),
);
cek(
  'types.ts AppData memuat approvement',
  types.includes('approvement: Approvement[];'),
);
cek(
  'KOLEKSI approvement = "approvement"',
  KOLEKSI.approvement === 'approvement',
  KOLEKSI.approvement,
);
cek('DATA_CONTOH approvement kosong', DATA_CONTOH.approvement.length === 0);

// ---------- panel Media Partner membaca data.approvement, bukan kontrak ----------
cek('panel Media Partner memakai data.approvement', kerjaSama.includes('data.approvement'));
cek(
  'panel Media Partner TIDAK lagi filter kontrak Media Partner',
  !kerjaSama.includes('kategori="Media Partner"'),
);
cek(
  'teks empty-state lama (kategori Media Partner) sudah tidak ada',
  !kerjaSama.includes(
    "No contract in the imported data has the 'Media Partner' service category yet",
  ),
);
cek(
  'panel Media Partner empty state baru ada',
  kerjaSama.includes('Belum ada surat persetujuan Media Partner.'),
);
cek(
  'panel Media Partner menampilkan kolom No. Surat, Klien, Jenis Klien, Narahubung, Tanggal Pelaksanaan, Jenis Kompensasi, Nilai Kompensasi, Dokumen',
  ['No. Surat', 'Klien', 'Jenis Klien', 'Narahubung', 'Tanggal Pelaksanaan', 'Jenis Kompensasi', 'Nilai Kompensasi', 'Dokumen'].every(
    (kolom) => kerjaSama.includes(`<Th>${kolom}</Th>`) || kerjaSama.includes(`<Th kanan>${kolom}</Th>`),
  ),
);

// ---------- kotak pencarian panel Media Partner (permintaan user 24/11/2026) ----------
cek(
  'panel Media Partner punya kotak pencarian sendiri (input type search)',
  kerjaSama.includes('type="search"') &&
    kerjaSama.includes('aria-label="Cari surat persetujuan"'),
);
cek(
  'panel Media Partner pencarian pakai state lokal (pencarian global di top bar sudah dihapus 15/11/2026)',
  kerjaSama.includes("const [pencarian, setPencarian] = useState('')"),
);
cek(
  'panel Media Partner pencarian memfilter nomor surat, klien, jenis klien, narahubung, jenis kompensasi',
  kerjaSama.includes(
    '`${a.nomorSurat} ${a.namaKlien} ${a.jenisKlien} ${a.namaNarahubung} ${a.jenisKompensasi}`',
  ),
);
cek(
  'panel Media Partner pencarian tanpa hasil menampilkan pesan beda dari empty state',
  kerjaSama.includes('Tidak ada surat persetujuan yang cocok dengan pencarian.'),
);
cek(
  'panel Media Partner kotak pencarian tampil juga saat daftar kosong (dirender sebelum empty state)',
  kerjaSama.indexOf('aria-label="Cari surat persetujuan"') <
    kerjaSama.indexOf('Belum ada surat persetujuan Media Partner.'),
);
cek(
  'panel MoU tetap memakai data.mou (tidak disentuh)',
  kerjaSama.includes('data.mou'),
);
cek(
  'panel Commitment tetap memakai data.commitment (tidak disentuh)',
  kerjaSama.includes('data.commitment'),
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
  "rules allowlist memuat 'approvement' 4x (read/create/update/delete)",
  (rules.match(/^ *'approvement',?$/gm) ?? []).length === 4,
  `${(rules.match(/^ *'approvement',?$/gm) ?? []).length}x`,
);
cek(
  "rules entri 'commitment' sebelum 'approvement' diakhiri koma (tanpa koma Firebase menolak 'approvement' — insiden publish 24/11/2026)",
  (rules.match(/^ *'commitment',\n *\/\/ Approvement/gm) ?? []).length === 4,
  `${(rules.match(/^ *'commitment',\n *\/\/ Approvement/gm) ?? []).length}x`,
);
cek(
  'rules hitungan koleksi bersatker diperbarui (22 di blok)',
  rules.includes('22 koleksi di blok ini'),
);
cek(
  'rules TIDAK memberi akses baca client ke approvement (tanpa klienId)',
  !rules.includes('match /approvement/{id} {'),
);

// ---------- rencana migrasi Approvement ----------
cek(
  "guard migrasi Approvement bernama 'migrasi-approvement-2026'",
  ID_GUARD_MIGRASI_APPROVEMENT === 'migrasi-approvement-2026',
  ID_GUARD_MIGRASI_APPROVEMENT,
);
cek(
  'guard Approvement BERBEDA dari guard migrasi pertama, re-migrasi kontrak, MoU, dan Commitment',
  new Set([
    ID_GUARD_MIGRASI_APPROVEMENT,
    ID_GUARD_MIGRASI_PERTAMA,
    ID_GUARD_REMIGRASI_KONTRAK,
    ID_GUARD_MIGRASI_MOU,
    ID_GUARD_MIGRASI_COMMITMENT,
  ]).size === 5,
);
cek(
  "cakupan migrasi Approvement PERSIS ['approvement']",
  KOLEKSI_MIGRASI_APPROVEMENT.length === 1 &&
    KOLEKSI_MIGRASI_APPROVEMENT[0] === 'approvement',
  KOLEKSI_MIGRASI_APPROVEMENT.join(','),
);
cek(
  'JUMLAH_APPROVEMENT_SEED 4 dan cocok dengan seed',
  JUMLAH_APPROVEMENT_SEED === 4 && approvement.length === JUMLAH_APPROVEMENT_SEED,
  `${JUMLAH_APPROVEMENT_SEED}`,
);
cek(
  'prakondisi migrasi Approvement: live 0 lolos, live >0 batal (hanya jika kosong)',
  periksaPrakondisiApprovement(0).length === 0 &&
    periksaPrakondisiApprovement(1).length > 0 &&
    periksaPrakondisiApprovement(4).length > 0,
);
cek(
  'verifikasi hasil migrasi Approvement lolos pada seed (approvement + kontrak)',
  verifikasiHasilApprovement({
    approvement: DATA_NYATA.approvement,
    kontrak: DATA_NYATA.kontrak,
  }).length === 0,
  verifikasiHasilApprovement({
    approvement: DATA_NYATA.approvement,
    kontrak: DATA_NYATA.kontrak,
  }).join(' '),
);
cek(
  'verifikasi hasil migrasi Approvement gagal bila 1 record hilang',
  verifikasiHasilApprovement({
    approvement: DATA_NYATA.approvement.slice(1),
    kontrak: DATA_NYATA.kontrak,
  }).length > 0,
);
cek(
  'verifikasi hasil migrasi Approvement gagal bila nilai kompensasi APR-04 salah',
  verifikasiHasilApprovement({
    approvement: DATA_NYATA.approvement.map((a) =>
      a.id === 'APR-04' ? { ...a, nilaiKompensasi: 0 } : a,
    ),
    kontrak: DATA_NYATA.kontrak,
  }).length > 0,
);
cek(
  'verifikasi hasil migrasi Approvement gagal bila kontrak berubah',
  verifikasiHasilApprovement({
    approvement: DATA_NYATA.approvement,
    kontrak: DATA_NYATA.kontrak.slice(1),
  }).length > 0,
);

// ---------- modul migrasi Approvement ----------
cek(
  'migrasiApprovement.ts memakai seed APPROVEMENT_DUMMY (bukan DATA_NYATA)',
  migrasiApprovement.includes("from './seedApprovement'") &&
    migrasiApprovement.includes('APPROVEMENT_DUMMY') &&
    !migrasiApprovement.includes('DATA_NYATA'),
);
cek(
  'migrasiApprovement.ts punya cekSudah + bacaStatus + jalankan',
  migrasiApprovement.includes('cekSudahMigrasiApprovement') &&
    migrasiApprovement.includes('bacaStatusMigrasiApprovement') &&
    migrasiApprovement.includes('jalankanMigrasiApprovement'),
);
cek(
  'migrasiApprovement.ts menulis guard di batch terakhir + satu entri audit',
  migrasiApprovement.includes('batch.set(refGuard') &&
    migrasiApprovement.includes("buatEntriAudit(") &&
    migrasiApprovement.includes("'Migrasi Data Media Partner'"),
);

// ---------- rules: blok guard meta/migrasi-approvement-2026 ----------
cek(
  'rules blok guard meta/migrasi-approvement-2026 ada (match + create sekali + !exists)',
  rules.includes('match /meta/migrasi-approvement-2026 {') &&
    rules.includes(
      '!exists(/databases/$(database)/documents/meta/migrasi-approvement-2026)',
    ),
);
cek(
  "rules 'migrasi-approvement-2026' muncul PERSIS 3x (match + !exists + komentar backfill) — blok Approvement TIDAK menyebut dirinya sendiri di daftar Terpisah",
  (rules.match(/migrasi-approvement-2026/g) ?? []).length === 3,
  `${(rules.match(/migrasi-approvement-2026/g) ?? []).length}x`,
);
cek(
  'rules blok guard Approvement sesudah blok Commitment dan sebelum blok backfill (batas blok utuh)',
  rules.indexOf('match /meta/migrasi-commitment-2026 {') <
    rules.indexOf('match /meta/migrasi-approvement-2026 {') &&
    rules.indexOf('match /meta/migrasi-approvement-2026 {') <
      rules.indexOf('match /meta/backfill-klienId-2026 {'),
);
cek(
  'rules komentar backfill mencantumkan guard Approvement',
  rules.includes(
    '`meta/migrasi-commitment-2026`, dan\n    // `meta/migrasi-approvement-2026`.',
  ),
);

// ---------- wiring UI migrasi Approvement ----------
cek(
  'App.tsx memasang handler + status migrasi Approvement',
  app.includes('tanganiMigrasiApprovement') &&
    app.includes('onMigrasiApprovement={tanganiMigrasiApprovement}') &&
    app.includes('statusMigrasiApprovement'),
);
cek(
  'MasterPage memuat kartu migrasi Approvement (judul + tombol Indonesia)',
  master.includes('BagianMigrasiApprovement') &&
    master.includes('Migrasi Data Media Partner') &&
    master.includes('Jalankan migrasi Media Partner'),
);
cek(
  'MasterPage kartu Approvement dirender sesudah kartu Commitment',
  master.indexOf('<BagianMigrasiCommitment') <
    master.indexOf('<BagianMigrasiApprovement'),
);

if (gagal > 0) {
  console.error(`\n${gagal} asersi GAGAL.`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');

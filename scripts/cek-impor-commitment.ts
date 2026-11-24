// Verifikasi impor Commitment (19/11/2026) — TANPA Firestore.
// - Seed: 4 record Commitment dari file pengguna (1 kegiatan
//   "Pekan Tilawatil Qur'an" 13 Mar 2024, 4 mitra, 13 baris item),
//   total dukungan Rp16.600.000 (cocok dengan REKAPITULASI file),
//   jumlah tiap item = qty x hargaSatuan, layanan/benefit dan nilai
//   konversi kosong ('—').
// - Panel Commitment membaca data.commitment (bukan kontrak); teks
//   empty-state lama tentang kategori 'Dukungan Layanan' sudah tidak ada.
// - Total kontrak PNBP TIDAK berubah: 42 kontrak, Rp441.863.375.
// - firestore.rules: koleksi `commitment` di allowlist operator + blok
//   guard `meta/migrasi-commitment-2026`.
// - Rencana migrasi Commitment: cakupan PERSIS ['commitment'], guard
//   baru berbeda dari guard migrasi lain, prakondisi live 0, verifikasi
//   lolos pada seed dan menolak bila data berubah.
// Keluar bukan-nol bila ada asersi gagal.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_NYATA } from '../src/lib/seedNyata';
import { DATA_CONTOH } from '../src/lib/sampleData';
import { KOLEKSI } from '../src/lib/firestoreStore';
import {
  ID_GUARD_MIGRASI_COMMITMENT,
  ID_GUARD_MIGRASI_MOU,
  ID_GUARD_MIGRASI_PERTAMA,
  ID_GUARD_REMIGRASI_KONTRAK,
  JUMLAH_COMMITMENT_SEED,
  KOLEKSI_MIGRASI_COMMITMENT,
  TANGGAL_KEGIATAN_DIHARAPKAN,
  TOTAL_DUKUNGAN_DIHARAPKAN,
  TOTAL_DUKUNGAN_PER_MITRA,
  TOTAL_KONTROL_KONTRAK,
  periksaPrakondisiCommitment,
  verifikasiHasilCommitment,
} from '../src/lib/migrasiCommitmentRencana';

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

// ---------- seed: 4 record, 13 baris item, total Rp16.600.000 ----------
const commitment = DATA_NYATA.commitment;
cek('seed commitment 4 record', commitment.length === 4, `${commitment.length}`);
cek(
  'seed commitment 13 baris item',
  commitment.reduce((s, c) => s + c.dukungan.length, 0) === 13,
  `${commitment.reduce((s, c) => s + c.dukungan.length, 0)}`,
);
cek(
  'seed commitment total per mitra 3jt/1,5jt/1,9jt/10,2jt',
  Object.entries(TOTAL_DUKUNGAN_PER_MITRA).every(
    ([id, total]) =>
      commitment.find((c) => c.id === id)?.totalDukungan === total,
  ),
  JSON.stringify(
    Object.fromEntries(commitment.map((c) => [c.id, c.totalDukungan])),
  ),
);
cek(
  'seed commitment total dukungan Rp16.600.000 (== REKAPITULASI file)',
  commitment.reduce((s, c) => s + c.totalDukungan, 0) ===
    TOTAL_DUKUNGAN_DIHARAPKAN,
  `Rp${commitment.reduce((s, c) => s + c.totalDukungan, 0).toLocaleString('id-ID')}`,
);
cek(
  'seed commitment tiap item jumlah == qty x hargaSatuan',
  commitment.every((c) =>
    c.dukungan.every((d) => d.qty * d.hargaSatuan === d.jumlah),
  ),
);
cek(
  'seed commitment jumlah item == totalDukungan tiap mitra',
  commitment.every(
    (c) => c.dukungan.reduce((s, d) => s + d.jumlah, 0) === c.totalDukungan,
  ),
);
cek(
  'seed commitment id unik (nomor dokumen)',
  new Set(commitment.map((c) => c.id)).size === 4,
);
const wajib = [
  'id',
  'kegiatan',
  'tanggalKegiatan',
  'mitra',
  'penandatangan',
  'jabatanPenandatangan',
  'dokumen',
] as const;
cek(
  'seed commitment semua field wajib terisi',
  commitment.every((c) =>
    wajib.every((f) => typeof c[f] === 'string' && c[f].trim() !== ''),
  ),
);
cek(
  "seed commitment kegiatan 'Pekan Tilawatil Qur'an' semua",
  commitment.every((c) => c.kegiatan === "Pekan Tilawatil Qur'an"),
);
cek(
  'seed commitment tanggal kegiatan 2024-03-13 semua (data 2024 meski nama file 2026)',
  commitment.every(
    (c) => c.tanggalKegiatan === TANGGAL_KEGIATAN_DIHARAPKAN,
  ),
  commitment.map((c) => c.tanggalKegiatan).join(','),
);
cek(
  "seed commitment layanan '—' semua (kosong di sumber)",
  commitment.every((c) => c.layanan === '—'),
);
cek(
  "seed commitment nilaiKonversi '—' semua (kosong di sumber)",
  commitment.every((c) => c.nilaiKonversi === '—'),
);
cek(
  "seed commitment mitra pertama 'Bank Syariah Indonesian Kenten 2' (ejaan file)",
  commitment[0]?.mitra === 'Bank Syariah Indonesian Kenten 2',
  commitment[0]?.mitra,
);
cek(
  'seed commitment dokumen 001 sesuai file',
  commitment.find((c) => c.id === '001/RRI.PLB/PKS.DL/03/2024')
    ?.dokumen ===
    "Surat Penawaran 001 Pekan Tilawatil Qur'an - Bank Syariah Indonesian Kenten 2",
);
cek(
  'seed commitment nomorDokumen 001-004',
  commitment.map((c) => c.nomorDokumen).join(',') === '001,002,003,004',
  commitment.map((c) => c.nomorDokumen).join(','),
);
cek(
  'seed commitment satker 41 PALEMBANG semua',
  commitment.every((c) => c.satker.kode === '41' && c.satker.nama === 'PALEMBANG'),
);

// ---------- wiring: koleksi + sample kosong ----------
cek(
  'KOLEKSI commitment = "commitment"',
  KOLEKSI.commitment === 'commitment',
  KOLEKSI.commitment,
);
cek('DATA_CONTOH commitment kosong', DATA_CONTOH.commitment.length === 0);

// ---------- panel Commitment membaca data.commitment, bukan kontrak ----------
cek('panel Commitment memakai data.commitment', kerjaSama.includes('data.commitment'));
cek(
  'panel Commitment TIDAK memfilter kontrak kategori Dukungan Layanan',
  !kerjaSama.includes("kategoriLayanan === 'Dukungan Layanan'"),
);
cek(
  'teks empty-state lama (kategori Dukungan Layanan) sudah tidak ada',
  !kerjaSama.includes(
    "No contract in the imported data has the 'Dukungan Layanan' service category yet",
  ),
);
cek(
  'panel Commitment empty state mengarah ke migrasi Commitment',
  kerjaSama.includes('Run the Commitment migration from the') &&
    kerjaSama.includes('Master &amp; Users page'),
);
cek(
  'panel MoU tetap memakai data.mou (tidak disentuh)',
  kerjaSama.includes('data.mou'),
);
cek(
  'panel Approvement TIDAK lagi filter kontrak (definisi 24/11/2026, baca data.approvement)',
  !kerjaSama.includes('kategori="Media Partner"') &&
    kerjaSama.includes('data.approvement'),
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
  "rules allowlist memuat 'commitment' 4x (read/create/update/delete)",
  (rules.match(/^ *'commitment',?$/gm) ?? []).length === 4,
  `${(rules.match(/^ *'commitment',?$/gm) ?? []).length}x`,
);
cek(
  'rules blok guard meta/migrasi-commitment-2026 ada',
  rules.includes('match /meta/migrasi-commitment-2026 {'),
);
cek(
  'rules hitungan koleksi bersatker diperbarui (22 di blok)',
  rules.includes('22 koleksi di blok ini'),
);

// ---------- rencana migrasi Commitment ----------
cek(
  "guard migrasi Commitment bernama 'migrasi-commitment-2026'",
  ID_GUARD_MIGRASI_COMMITMENT === 'migrasi-commitment-2026',
  ID_GUARD_MIGRASI_COMMITMENT,
);
cek(
  'guard Commitment BERBEDA dari guard migrasi pertama, re-migrasi kontrak, dan MoU',
  ID_GUARD_MIGRASI_COMMITMENT !== ID_GUARD_MIGRASI_PERTAMA &&
    ID_GUARD_MIGRASI_COMMITMENT !== ID_GUARD_REMIGRASI_KONTRAK &&
    ID_GUARD_MIGRASI_COMMITMENT !== ID_GUARD_MIGRASI_MOU,
);
cek(
  "cakupan migrasi Commitment PERSIS ['commitment']",
  KOLEKSI_MIGRASI_COMMITMENT.length === 1 &&
    KOLEKSI_MIGRASI_COMMITMENT[0] === 'commitment',
  KOLEKSI_MIGRASI_COMMITMENT.join(','),
);
cek('JUMLAH_COMMITMENT_SEED 4', JUMLAH_COMMITMENT_SEED === 4, `${JUMLAH_COMMITMENT_SEED}`);
cek(
  'TOTAL_DUKUNGAN_DIHARAPKAN Rp16.600.000',
  TOTAL_DUKUNGAN_DIHARAPKAN === 16600000,
  `Rp${TOTAL_DUKUNGAN_DIHARAPKAN.toLocaleString('id-ID')}`,
);
cek(
  'prakondisi LOLOS bila live commitment 0',
  periksaPrakondisiCommitment(0).length === 0,
);
cek(
  'prakondisi MENOLAK bila live commitment sudah ada (1)',
  periksaPrakondisiCommitment(1).length > 0,
);
cek(
  'verifikasi LOLOS pada seed (commitment 4 + total 16,6jt + kontrak tidak berubah)',
  verifikasiHasilCommitment({
    commitment: DATA_NYATA.commitment,
    kontrak: DATA_NYATA.kontrak,
  }).length === 0,
  verifikasiHasilCommitment({
    commitment: DATA_NYATA.commitment,
    kontrak: DATA_NYATA.kontrak,
  }).join(' | '),
);
cek(
  'verifikasi MENOLAK bila commitment kurang (3)',
  verifikasiHasilCommitment({
    commitment: DATA_NYATA.commitment.slice(0, 3),
    kontrak: DATA_NYATA.kontrak,
  }).length > 0,
);
const totalSalah = DATA_NYATA.commitment.map((c, i) =>
  i === 0 ? { ...c, totalDukungan: c.totalDukungan + 1000 } : c,
);
cek(
  'verifikasi MENOLAK bila total dukungan berubah',
  verifikasiHasilCommitment({
    commitment: totalSalah,
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
  verifikasiHasilCommitment({
    commitment: DATA_NYATA.commitment,
    kontrak: nilaiSalah.kontrak,
  }).length > 0,
);

// ---------- wiring UI migrasi Commitment ----------
cek(
  'App.tsx memasang handler + status migrasi Commitment',
  app.includes('tanganiMigrasiCommitment') &&
    app.includes('onMigrasiCommitment={tanganiMigrasiCommitment}') &&
    app.includes('statusMigrasiCommitment'),
);
cek(
  'MasterPage memuat kartu migrasi Commitment',
  master.includes('BagianMigrasiCommitment') &&
    master.includes('Run Commitment migration'),
);

if (gagal > 0) {
  console.error(`\n${gagal} asersi GAGAL.`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');

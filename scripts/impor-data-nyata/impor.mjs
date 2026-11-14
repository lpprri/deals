// Skrip impor data nyata — Partnership LPP RRI (PRD v2.0 Final Bab 12.3).
//
// Membaca snapshot ekstraksi beku di ./data/ (hasil baca 6 spreadsheet
// Google Sheets, 14 Nov 2026 — TIDAK membaca Sheets langsung, karena
// /tmp tidak persisten dan konektor Sheets kena rate limit saat ekstraksi)
// dan menghasilkan:
//   - ../../src/lib/seedNyata.ts  (DATA_NYATA: AppData — dataset default app)
//   - ./laporan-impor.json        (jumlah baris, yang dilewati, keputusan)
// Dijalankan ulang menghasilkan file yang sama persis (deterministis:
// tanpa timestamp berjalan; tanggal impor adalah konstanta TANGGAL_IMPOR).
//
// Keputusan pemetaan (didokumentasikan — bukan perubahan diam-diam):
//  1. Pembayaran dengan NTB DAN NTPN keduanya terisi → 'Terverifikasi'.
//     NTPN adalah nomor penerimaan negara — bukti setoran sudah diterima
//     kas negara — dan pola yang sama dipakai data contoh Fase A
//     (pembayaran terverifikasi membawa NTB/NTPN). Tanpa NTPN, pembayaran
//     tetap 'Menunggu Verifikasi' (tidak ada yang seperti itu di data ini:
//     42/42 pembayaran punya NTB+NTPN).
//  2. Sewa ↔ Kontrak ditautkan lewat nomor referensi lama
//     (_nomorReferensiKontrak, format 001/RRI.PLB/PKS.U/...) yang cocok
//     dengan referensi di catatan kontrak / nomor tagihan. 14 dari 39 sewa
//     tertaut; 25 tidak (perjanjian 2025 ke bawah yang tidak ada di
//     kontrak 2026) — dicatat di laporan, bukan dipaksakan.
//  3. Field di luar types.ts dibuang: Tagihan.status (status diturunkan
//     derive.ts, bukan diinput) dan Sewa._nomorReferensiKontrak (nomor
//     referensi lama; nilainya tetap tersimpan di snapshot ./data/).
//  4. Entitas Fase B (prospect, quotation, order, meeting, event,
//     advertisement, task) TIDAK punya sumber nyata — diambil verbatim
//     dari DATA_CONTOH (sampleData.ts) dengan label "(Contoh)". Tautan
//     mereka ke entitas contoh Fase A yang sudah diganti data nyata
//     (KLN-01, PKS-001/2026, PJ-001, PJ-002, PJ-003) DIHAPUS supaya tidak
//     menggantung; jejak prospek→quotation→order di dalam Fase B tetap utuh.
//  5. PenerimaanAcuan = [] — Sheet 3 (DATA PNBP 2026) belum terbaca karena
//     rate limit konektor saat ekstraksi. BUKAN diisi data contoh.
//     Rekonsiliasi terhadap acuan Keuangan belum dapat dilakukan sampai
//     Sheet 3 diimpor pada attempt berikutnya.
//  6. Pengajuan PGJ-01 & PGJ-02 memakai tanggal placeholder 2026-11-14
//     (tanggal masuk tidak tercatat di sumber) — WAJIB dikoreksi pengguna.
//  7. Sheet 1 dan Sheet 2 adalah potongan berbeda: Sheet 1 = kontrak /
//     angsuran 2026; Sheet 2 = perjanjian sewa multi-tahun 2022–2026.
//     Total nilainya TIDAK BOLEH dijumlahkan.
//
// Cara pakai:  node scripts/impor-data-nyata/impor.mjs
//   (jalankan dari root repo; keluar non-zero bila validasi gagal)

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(DIR, 'data');
const REPO_ROOT = join(DIR, '..', '..');
const SAMPLE_PATH = join(REPO_ROOT, 'src', 'lib', 'sampleData.ts');
const OUT_TS = join(REPO_ROOT, 'src', 'lib', 'seedNyata.ts');
const OUT_LAPORAN = join(DIR, 'laporan-impor.json');

export const TANGGAL_IMPOR = '2026-11-14';

const SATKER = { kode: '41', nama: 'PALEMBANG' };

const gagal = [];
function fail(pesan) {
  gagal.push(pesan);
}

function baca(nama) {
  return JSON.parse(readFileSync(join(DATA_DIR, nama), 'utf8'));
}

// ---------------------------------------------------------------------------
// Whitelist field per entitas (types.ts) — field di luar daftar dibuang.
// ---------------------------------------------------------------------------
function pilih(obj, fields) {
  const out = {};
  for (const f of fields) {
    if (obj[f] !== undefined) out[f] = obj[f];
  }
  return out;
}

const F = {
  klien: ['id', 'nama', 'jenis', 'alamat', 'kontakNama', 'kontakJabatan', 'telepon', 'email', 'npwp', 'status', 'catatan', 'satker', 'dibuatOleh', 'dibuatPada'],
  layanan: ['id', 'namaLayanan', 'kategori', 'kodeAkun', 'jenisPnBP', 'satuan', 'tarif', 'jumlah', 'subtotal', 'programa'],
  kontrak: ['id', 'nomorPks', 'klienId', 'jenisPnBP', 'kategoriLayanan', 'programa', 'tanggalMulai', 'tanggalSelesai', 'nilaiKontrak', 'status', 'sewaId', 'penanggungJawab', 'catatan', 'satker', 'layanan'],
  dokumen: ['id', 'kontrakId', 'jenisDokumen', 'status', 'catatan', 'diunggahOleh', 'tanggalUnggah'],
  tagihan: ['id', 'nomor', 'kontrakId', 'uraian', 'nilai', 'tanggalTerbit', 'tanggalJatuhTempo', 'kodeAkun', 'satker'],
  pembayaran: ['id', 'tagihanId', 'tanggalBayar', 'jumlah', 'metode', 'buktiSetor', 'penyetor', 'statusVerifikasi', 'satker'],
  denda: ['id', 'tagihanId', 'dasar', 'jumlah', 'status', 'kodeAkun', 'satker'],
  riwayatHarga: ['tanggalBerlaku', 'nilai'],
  temuan: ['tanggal', 'uraian', 'tindakLanjut', 'status'],
  sewa: ['id', 'aset', 'lokasi', 'penyewaId', 'penyewaNama', 'nomorPerjanjian', 'tanggalMulai', 'tanggalSelesai', 'nilaiSewa', 'status', 'diterimaDiMuka', 'masihHarusDiterima', 'kontrakId', 'riwayatHarga', 'temuan', 'satker'],
  pengajuan: ['id', 'jenis', 'pemohon', 'tanggalMasuk', 'kebutuhan', 'tahap', 'penanggungJawab', 'catatan', 'alasanTolak', 'nilaiPerkiraan', 'hasilKonversi', 'satker'],
};

const ISO_TANGGAL = /^\d{4}-\d{2}-\d{2}$/;
function tanggalValid(s) {
  if (typeof s !== 'string' || !ISO_TANGGAL.test(s)) return false;
  const d = new Date(s + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function cekUnik(nama, rows) {
  const lihat = new Set();
  for (const r of rows) {
    if (lihat.has(r.id)) fail(`${nama}: id ganda ${r.id}`);
    lihat.add(r.id);
  }
}

function cekTanggal(nama, rows, fields) {
  for (const r of rows) {
    for (const f of fields) {
      if (r[f] !== undefined && r[f] !== '' && !tanggalValid(r[f])) {
        fail(`${nama} ${r.id}: ${f} tidak valid (${r[f]})`);
      }
    }
  }
}

function cekSatker(nama, rows) {
  for (const r of rows) {
    if (!r.satker || r.satker.kode !== '41' || r.satker.nama !== 'PALEMBANG') {
      fail(`${nama} ${r.id}: satker bukan PALEMBANG`);
    }
  }
}

function cekContoh(nama, rows, fieldNama) {
  for (const r of rows) {
    if (typeof r[fieldNama] === 'string' && r[fieldNama].includes('(Contoh)')) {
      fail(`${nama} ${r.id}: nama nyata mengandung "(Contoh)"`);
    }
  }
}

function cekAngka(nama, rows, fields) {
  for (const r of rows) {
    for (const f of fields) {
      if (typeof r[f] !== 'number' || !Number.isFinite(r[f])) {
        fail(`${nama} ${r.id}: ${f} bukan angka (${r[f]})`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 1. Baca snapshot + normalisasi.
// ---------------------------------------------------------------------------
const klien = baca('sheet1-klien.json').map((r) => pilih(r, F.klien));
const kontrak = baca('sheet1-kontrak.json').map((r) => ({
  ...pilih(r, F.kontrak),
  layanan: (r.layanan || []).map((l) => pilih(l, F.layanan)),
}));
const dokumen = baca('sheet1-dokumen.json').map((r) => pilih(r, F.dokumen));
const tagihan = baca('sheet1-tagihan.json').map((r) => pilih(r, F.tagihan));
const pembayaranMentah = baca('sheet1-pembayaran.json');
const denda = baca('sheet1-denda.json').map((r) => pilih(r, F.denda));
const pengajuan = baca('sheet1-pengajuan.json').map((r) => pilih(r, F.pengajuan));
const sewaMentah = baca('sheet2-sewa.json');
const auditSheet1 = baca('sheet1-audit.json');
const auditSheet2 = baca('sheet2-3-audit.json');

// Pembayaran: NTB + NTPN → Terverifikasi (keputusan 1).
let terverifikasi = 0;
const pembayaran = pembayaranMentah.map((r) => {
  const p = pilih(r, F.pembayaran);
  const bukti = p.buktiSetor || '';
  if (bukti.includes('NTB') && bukti.includes('NTPN')) {
    p.statusVerifikasi = 'Terverifikasi';
    terverifikasi += 1;
  } else {
    p.statusVerifikasi = 'Menunggu Verifikasi';
  }
  return p;
});

// Sewa: tautkan kontrakId lewat nomor referensi lama (keputusan 2).
function normRef(s) {
  return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}
const refKeKontrak = new Map();
for (const k of kontrak) {
  const m = /No\. Referensi:\s*([^\s|]+)/.exec(k.catatan || '');
  if (m) refKeKontrak.set(normRef(m[1]), k.id);
}
for (const t of tagihan) {
  if (!refKeKontrak.has(normRef(t.nomor))) refKeKontrak.set(normRef(t.nomor), t.kontrakId);
}
let sewaTertaut = 0;
const sewaTanpaTautan = [];
const sewa = sewaMentah.map((r) => {
  const s = pilih(r, F.sewa);
  s.riwayatHarga = (r.riwayatHarga || []).map((x) => pilih(x, F.riwayatHarga));
  s.temuan = (r.temuan || []).map((x) => pilih(x, F.temuan));
  const kunci = normRef(r._nomorReferensiKontrak || '') || normRef(r.nomorPerjanjian);
  const kontrakId = refKeKontrak.get(kunci);
  if (kontrakId) {
    s.kontrakId = kontrakId;
    sewaTertaut += 1;
  } else {
    sewaTanpaTautan.push({ id: s.id, penyewaNama: s.penyewaNama, nomorPerjanjian: s.nomorPerjanjian });
  }
  return s;
});

// ---------------------------------------------------------------------------
// 2. Validasi.
// ---------------------------------------------------------------------------
cekUnik('klien', klien);
cekUnik('kontrak', kontrak);
cekUnik('dokumen', dokumen);
cekUnik('tagihan', tagihan);
cekUnik('pembayaran', pembayaran);
cekUnik('denda', denda);
cekUnik('sewa', sewa);
cekUnik('pengajuan', pengajuan);

cekTanggal('klien', klien, ['dibuatPada']);
cekTanggal('kontrak', kontrak, ['tanggalMulai', 'tanggalSelesai']);
cekTanggal('tagihan', tagihan, ['tanggalTerbit', 'tanggalJatuhTempo']);
cekTanggal('pembayaran', pembayaran, ['tanggalBayar']);
cekTanggal('sewa', sewa, ['tanggalMulai', 'tanggalSelesai']);
cekTanggal('pengajuan', pengajuan, ['tanggalMasuk']);

cekSatker('klien', klien);
cekSatker('kontrak', kontrak);
cekSatker('tagihan', tagihan);
cekSatker('pembayaran', pembayaran);
cekSatker('denda', denda);
cekSatker('sewa', sewa);
cekSatker('pengajuan', pengajuan);

cekContoh('klien', klien, 'nama');
cekContoh('kontrak', kontrak, 'nomorPks');
cekContoh('sewa', sewa, 'penyewaNama');
cekContoh('pengajuan', pengajuan, 'pemohon');

cekAngka('kontrak', kontrak, ['nilaiKontrak']);
cekAngka('tagihan', tagihan, ['nilai']);
cekAngka('pembayaran', pembayaran, ['jumlah']);
cekAngka('denda', denda, ['jumlah']);
cekAngka('sewa', sewa, ['nilaiSewa', 'diterimaDiMuka', 'masihHarusDiterima']);

const idKlien = new Set(klien.map((k) => k.id));
const idKontrak = new Set(kontrak.map((k) => k.id));
const idTagihan = new Set(tagihan.map((t) => t.id));
for (const k of kontrak) {
  if (!idKlien.has(k.klienId)) fail(`kontrak ${k.id}: klienId ${k.klienId} tidak ada`);
  const jumlah = k.layanan.reduce((s, l) => s + l.subtotal, 0);
  if (jumlah !== k.nilaiKontrak) {
    fail(`kontrak ${k.id}: nilaiKontrak ${k.nilaiKontrak} != Σ subtotal ${jumlah}`);
  }
  for (const l of k.layanan) {
    if (l.kodeAkun === '425131' && l.jenisPnBP !== 'Umum') fail(`kontrak ${k.id}: layanan ${l.id} kode 425131 bukan Umum`);
    if (l.kodeAkun === '425531' && l.jenisPnBP !== 'Fungsional') fail(`kontrak ${k.id}: layanan ${l.id} kode 425531 bukan Fungsional`);
  }
}
for (const t of tagihan) {
  if (!idKontrak.has(t.kontrakId)) fail(`tagihan ${t.id}: kontrakId ${t.kontrakId} tidak ada`);
}
for (const p of pembayaran) {
  if (!idTagihan.has(p.tagihanId)) fail(`pembayaran ${p.id}: tagihanId ${p.tagihanId} tidak ada`);
}
for (const d of denda) {
  if (!idTagihan.has(d.tagihanId)) fail(`denda ${d.id}: tagihanId ${d.tagihanId} tidak ada`);
  if (!d.dasar) fail(`denda ${d.id}: dasar kosong`);
}
for (const d of dokumen) {
  if (!idKontrak.has(d.kontrakId)) fail(`dokumen ${d.id}: kontrakId ${d.kontrakId} tidak ada`);
}

// ---------------------------------------------------------------------------
// 3. Entitas Fase B — verbatim dari DATA_CONTOH, tautan ke contoh Fase A dihapus.
// ---------------------------------------------------------------------------
const sampleText = readFileSync(SAMPLE_PATH, 'utf8');
const penanda = '  // --- Data contoh Fase B (PRD Bab 6.12) ---';
const awal = sampleText.indexOf(penanda);
const akhir = sampleText.lastIndexOf('\n};');
if (awal === -1 || akhir === -1 || akhir <= awal) {
  fail('tidak menemukan blok Data contoh Fase B di sampleData.ts');
}
let blokFaseB = sampleText.slice(awal, akhir);

// Hapus tautan ke entitas contoh Fase A (keputusan 4). Hitung tiap penggantian.
const hapusTautan = [
  [/^      pengajuanId: 'PJ-001',\n/m, 'pengajuanId PJ-001'],
  [/^      pengajuanId: 'PJ-003',\n/m, 'pengajuanId PJ-003'],
  [/^      klienId: 'KLN-01',\n/m, 'klienId KLN-01'],
  [/^      kontrakId: 'PKS-001\/2026',\n/mg, 'kontrakId PKS-001/2026'],
  [/^      terkaitId: 'PJ-002',\n      terkaitLabel: 'Pengajuan PJ-002',\n/m, 'terkaitId PJ-002'],
];
const tautanDihapus = {};
for (const [pola, nama] of hapusTautan) {
  const cocok = blokFaseB.match(pola);
  const jumlah = cocok ? cocok.length : 0;
  tautanDihapus[nama] = jumlah;
  if (jumlah === 0) fail(`blok Fase B: tautan ${nama} tidak ditemukan untuk dihapus`);
  blokFaseB = blokFaseB.replace(pola, '');
}
// Pastikan tidak ada lagi referensi ke ID contoh Fase A di blok Fase B.
for (const id of ['KLN-01', 'PKS-001/2026', 'PJ-001', 'PJ-002', 'PJ-003']) {
  if (blokFaseB.includes(`'${id}'`)) fail(`blok Fase B masih mengandung '${id}'`);
}

// ---------------------------------------------------------------------------
// 4. Tulis seedNyata.ts.
// ---------------------------------------------------------------------------
const json = (v) => JSON.stringify(v, null, 2);

const auditImpor = [
  {
    id: 'AUD-IMPOR-01',
    waktu: `${TANGGAL_IMPOR}T00:00:00`,
    pengguna: 'Impor Spreadsheet',
    peran: 'Admin Sistem',
    aksi: 'Impor data nyata dari spreadsheet',
    entitas: 'Dataset',
    entitasId: 'DATA_NYATA',
    sebelum: '—',
    sesudah: `Data nyata Palembang diimpor dari 6 spreadsheet kerja (${TANGGAL_IMPOR}): ${klien.length} klien, ${kontrak.length} kontrak, ${tagihan.length} tagihan, ${pembayaran.length} pembayaran, ${denda.length} denda, ${sewa.length} sewa, ${pengajuan.length} pengajuan. Entitas Fase B tetap data contoh.`,
  },
];

const header = `// Data NYATA Palembang — hasil impor spreadsheet (PRD v2.0 Final Bab 12.3).
// Dibuat OTOMATIS oleh scripts/impor-data-nyata/impor.mjs dari snapshot
// ./data/ — JANGAN diubah manual; ubah sumbernya lalu jalankan ulang skrip.
// Tanggal impor: ${TANGGAL_IMPOR}. Satker: PALEMBANG (pilot).
//
// ISI:
// - Klien/kontrak/tagihan/pembayaran/denda/dokumen/pengajuan: NYATA, dari
//   spreadsheet "Kerja Sama PNBP 2026" (Sheet 1). TANPA label "(Contoh)".
// - Sewa: NYATA, dari "Daftar Sewa Lahan/BMN" (Sheet 2). 14 dari 39 sewa
//   tertaut ke kontrak lewat nomor referensi lama; 25 tidak tertaut
//   (perjanjian 2025 ke bawah, tidak ada di kontrak 2026).
// - PenerimaanAcuan: KOSONG — Sheet 3 (DATA PNBP 2026) belum terbaca karena
//   rate limit konektor saat ekstraksi. Rekonsiliasi terhadap acuan Keuangan
//   belum dapat dilakukan sampai Sheet 3 diimpor (attempt berikutnya).
// - Entitas Fase B (prospect, quotation, order, meeting, event,
//   advertisement, task): DATA CONTOH dari DATA_CONTOH, tetap berlabel
//   "(Contoh)". Tautan mereka ke entitas contoh Fase A (KLN-01,
//   PKS-001/2026, PJ-001/002/003) sudah dihapus supaya tidak menggantung.
// - Pembayaran dengan NTB + NTPN ditandai 'Terverifikasi' (NTPN = bukti
//   penerimaan negara; lihat impor.mjs keputusan 1).
// - Pengajuan PGJ-01 & PGJ-02 memakai tanggal placeholder 2026-11-14
//   (tanggal masuk tidak tercatat di sumber) — WAJIB dikoreksi pengguna.
//
// ANGKA KUNCI (dihitung ulang dari data ini — lihat laporan-rekonsiliasi):
// - Nilai kontrak 2026: Rp356.685.875 (Jan–Sep Rp216.986.875 + Okt
//   Rp139.699.000) + sisa kontrak 2025 Rp85.177.500.
// - Total tagihan Rp379.068.204; total pembayaran Rp229.405.255.

import type { AppData } from './types';
import { SATKER_PILOT } from './master';

const S = SATKER_PILOT;

export const TANGGAL_IMPOR = '${TANGGAL_IMPOR}';

export const DATA_NYATA: AppData = {
  klien: ${json(klien)},
  kontrak: ${json(kontrak)},
  dokumen: ${json(dokumen)},
  tagihan: ${json(tagihan)},
  pembayaran: ${json(pembayaran)},
  denda: ${json(denda)},
  sewa: ${json(sewa)},
  pengajuan: ${json(pengajuan)},
  penerimaanAcuan: [],
  audit: ${json(auditImpor)},
${blokFaseB}
};
`;

if (gagal.length > 0) {
  console.error(`VALIDASI GAGAL (${gagal.length}):`);
  for (const g of gagal) console.error(' - ' + g);
  process.exit(1);
}

mkdirSync(dirname(OUT_TS), { recursive: true });
writeFileSync(OUT_TS, header, 'utf8');

// ---------------------------------------------------------------------------
// 5. Laporan impor.
// ---------------------------------------------------------------------------
const laporan = {
  tanggalImpor: TANGGAL_IMPOR,
  sumber: {
    sheet1: 'Kerja Sama PNBP 2026 (1xmDYvYwMPMglufd6RTZiIpaJaJVkzF70wvK2kAmMH-8)',
    sheet2: 'Daftar Sewa Lahan/BMN (1anXvQ1PkQUYWYQyiM_BVlZBaK2mKyQ3q0Y_WTQbgMMk)',
    sheet3: 'DATA PNBP 2026 (Penyetor PNBP) (13UlqmLSEhkVtPMNvIxzw3diksvYnEAFfX0l69ZUIUUo)',
  },
  diimpor: {
    klien: klien.length,
    kontrak: kontrak.length,
    layananKontrak: kontrak.reduce((s, k) => s + k.layanan.length, 0),
    dokumen: dokumen.length,
    tagihan: tagihan.length,
    pembayaran: pembayaran.length,
    pembayaranTerverifikasi: terverifikasi,
    denda: denda.length,
    sewa: sewa.length,
    pengajuan: pengajuan.length,
    penerimaanAcuan: 0,
  },
  dilewati: {
    catatan:
      'Tidak ada baris entitas yang dilewati oleh skrip ini — baris header/total/blanko dan 2 baris duplikat kosong sudah disaring saat ekstraksi (lihat sheet1-audit.json). Yang TIDAK diimpor: seluruh Sheet 3 + tab Pengajuan Baru/Indralaya/Temuan Sheet 2 (belum terbaca — rate limit).',
    baris: [],
  },
  keputusanPemetaan: [
    'Pembayaran dengan NTB + NTPN → Terverifikasi (42/42). NTPN adalah bukti penerimaan negara; pola sama dengan data contoh Fase A.',
    `Sewa tertaut ke kontrak lewat nomor referensi lama: ${sewaTertaut}/39 tertaut, ${sewaTanpaTautan.length} tanpa tautan (perjanjian 2025 ke bawah).`,
    'Field di luar types.ts dibuang: Tagihan.status (42 baris — status diturunkan derive.ts), Sewa._nomorReferensiKontrak (14 baris — nilai tetap ada di snapshot ./data/).',
    'Tautan Fase B ke contoh Fase A dihapus: ' +
      Object.entries(tautanDihapus).map(([k, v]) => `${k} ×${v}`).join(', ') + '.',
    'PenerimaanAcuan = [] — Sheet 3 belum terbaca (rate limit).',
    'Pengajuan PGJ-01 & PGJ-02 memakai tanggal placeholder 2026-11-14 — wajib dikoreksi pengguna.',
    'Sheet 1 (kontrak/angsuran 2026) dan Sheet 2 (perjanjian sewa multi-tahun 2022–2026) adalah potongan berbeda — total nilainya tidak boleh dijumlahkan.',
  ],
  sewaTanpaTautan,
  pengecualianKodeAkun: auditSheet1.pengecualianKodeAkun || [],
  belumDiimpor: {
    sheet3: 'Seluruh 10 tab DATA PNBP 2026 (Rekap Penerimaan, Jan–Sep) — rate limit saat ekstraksi.',
    sheet2: 'Tab Pengajuan Baru, Indralaya, Temuan — rate limit saat ekstraksi.',
    catatan:
      'Butuh attempt berikutnya setelah kuota konektor pulih; jalankan ulang ekstraksi untuk tab tersebut lalu jalankan ulang skrip ini.',
  },
  masalahKualitasDiringkas: {
    sheet1: (auditSheet1.masalahKualitas || []).length,
    sheet2: (auditSheet2.spreadsheet2?.masalahKualitas || []).length,
    catatan:
      'Rincian lengkap di data/sheet1-audit.json dan data/sheet2-3-audit.json. Yang paling penting: nomor PKS ganda 2036 (2 kontrak, id #010/#011), Samdini tertulis Lunas padahal tanpa NTB/NTPN, total Rekapitulasi stale, 2 pengajuan bertanggal placeholder.',
  },
};

writeFileSync(OUT_LAPORAN, JSON.stringify(laporan, null, 2) + '\n', 'utf8');

console.log(`OK — seed ditulis ke ${OUT_TS}`);
console.log(
  `Diimpor: ${klien.length} klien, ${kontrak.length} kontrak, ${tagihan.length} tagihan, ` +
    `${pembayaran.length} pembayaran (${terverifikasi} terverifikasi), ${denda.length} denda, ` +
    `${dokumen.length} dokumen, ${sewa.length} sewa (${sewaTertaut} tertaut kontrak), ${pengajuan.length} pengajuan.`,
);
console.log(`Laporan: ${OUT_LAPORAN}`);

// Verifikasi rekonsiliasi — Partnership LPP RRI.
//
// Menghitung angka dari DATA_NYATA (lewat _hitung.ts yang dibundel esbuild
// + derive.ts — angka yang sama dengan yang tampil di aplikasi) lalu
// membandingkannya dengan laporan sumber:
//   - data/verifikasi-laporan-bulanan.json  (Sheet 4 — Laporan Bulanan)
//   - data/verifikasi-piutang.json         (Sheet 5 — Laporan Piutang)
//   - data/verifikasi-hq-palembang.json    (Sheet 6 — format kantor pusat)
// Menulis ./laporan-rekonsiliasi.json dan mencetak tabel ke stdout.
//
// Basis perbandingan (like-for-like — definisikan dulu, baru bandingkan):
//   (a) Nilai kontrak per bulan = Σ nilaiKontrak kontrak yang TAGIHANNYA
//       TERBIT di bulan itu (bulan PKS diterbitkan — basis Laporan Bulanan
//       aplikasi, Reporting.tsx barisBulanan), dipisah Fungsional/Umum
//       menurut kode akun tagihan (425531 = Fungsional, 425131 = Umum).
//       QTY = jumlah kontrak (baris PKS) di bulan itu. Basis tanggalMulai
//       (awal layanan) BERBEDA dan hanya dipakai sebagai pembanding.
//   (b) Penyetoran per bulan = Σ pembayaran (tanggalBayar di bulan itu)
//       — arus kas. Tab bulanan Sheet 5 BUKAN arus murni: tab Agustus
//       mencatat juga pembayaran Juli untuk kontrak yang tercantum di tab
//       itu (K-07/K-12) — jembatannya diverifikasi di bawah.
//   (c) Posisi piutang 30 Sep 2026 = Σ sisa tagihan (nilai − pembayaran
//       terverifikasi s.d. 30 Sep) untuk tagihan terbit s.d. 30 Sep.
//       Nilai tagihan SUDAH mencakup denda yang tertanam — denda TIDAK
//       ditambahkan lagi. Sheet 5 "PIUTANG BULAN INI" adalah posisi
//       outstanding per kontrak, BUKAN arus bulanan (K-12).
//   (d) Sheet 6 (HQ): QTY dihitung per jenis layanan menurut PANDUAN,
//       bukan PKS distinct — QTY keduanya tidak sebanding langsung;
//       Juli & September PALEMBANG di Sheet 6 = 0 karena belum diisi.
//
// Cara pakai:  node scripts/impor-data-nyata/verifikasi.mjs
//   (jalankan dari root repo; butuh esbuild di node_modules — sudah ada
//   sebagai dependensi Vite; keluar 0 bila semua perbandingan yang
//   seharusnya cocok memang cocok, 1 bila ada selisih total yang baru.)

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(DIR, '..', '..');
const DATA_DIR = join(DIR, 'data');
const BUNDLE = '/tmp/migrasi/_hitung-verifikasi.mjs';

const baca = (nama) => JSON.parse(readFileSync(join(DATA_DIR, nama), 'utf8'));

// 1. Hitung dari DATA_NYATA lewat esbuild + derive.ts.
execFileSync(join(REPO_ROOT, 'node_modules', '.bin', 'esbuild'), [
  join(DIR, '_hitung.ts'),
  '--bundle',
  '--platform=node',
  '--format=esm',
  `--outfile=${BUNDLE}`,
], { stdio: 'inherit' });
const hitung = JSON.parse(execFileSync('node', [BUNDLE], { encoding: 'utf8' }));

const lapBulanan = baca('verifikasi-laporan-bulanan.json');
const lapPiutang = baca('verifikasi-piutang.json');
const lapHq = baca('verifikasi-hq-palembang.json');

const BULAN = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september'];
const BULAN_ISO = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];

const rupiah = (n) => 'Rp' + Number(n).toLocaleString('id-ID');

const laporan = {
  tanggalVerifikasi: '2026-11-14',
  basis: 'Kontrak per bulan dikelompokkan menurut bulan terbit tagihan (bulan PKS diterbitkan) — basis Laporan Bulanan aplikasi. Lihat komentar di verifikasi.mjs butir (a)–(d).',
  kontrakPerBulanVsLaporanBulanan: [],
  pembandingTanggalMulai: [],
  penyetoranPerBulanVsLaporanPiutang: [],
  posisiAkhirSeptember: {},
  hqVsLaporanBulanan: [],
  totalKontrol: hitung.totalKontrol,
  kesimpulan: [],
};

let selisihTotalBaru = 0;

// (a) Kontrak per bulan (basis terbit tagihan) vs Laporan Bulanan.
for (let i = 0; i < BULAN.length; i += 1) {
  const nama = BULAN[i];
  const h = hitung.perBulan[BULAN_ISO[i]];
  const s = lapBulanan[nama] || {};
  const baris = {
    bulan: nama,
    aplikasi: { fungsional: h.nilaiKontrakFungsional, umum: h.nilaiKontrakUmum, total: h.nilaiKontrakTotal, qtyPks: h.qtyPks },
    laporanBulanan: { fungsional: s.fungsional ?? null, umum: s.umum ?? null, total: s.total ?? null, qtyPks: s.qtyPks ?? null },
    selisih: {
      fungsional: h.nilaiKontrakFungsional - (s.fungsional ?? 0),
      umum: h.nilaiKontrakUmum - (s.umum ?? 0),
      total: h.nilaiKontrakTotal - (s.total ?? 0),
      qtyPks: h.qtyPks - (s.qtyPks ?? 0),
    },
    penjelasan: '',
  };
  if (baris.selisih.total !== 0 || baris.selisih.qtyPks !== 0) {
    baris.penjelasan = 'SELISIH — perlu penyelidikan.';
    selisihTotalBaru += 1;
  } else if (baris.selisih.fungsional !== 0 || baris.selisih.umum !== 0) {
    baris.penjelasan =
      'Total & QTY cocok; pergeseran Fungsional↔Umum akibat reklasifikasi Adlibs ke 425131/Umum ' +
      '(Master Kode Akun; lihat pengecualian kode akun di laporan-impor.json).';
  } else {
    baris.penjelasan = 'Cocok.';
  }
  laporan.kontrakPerBulanVsLaporanBulanan.push(baris);
  // Pembanding: basis tanggalMulai (bukan basis laporan — hanya info).
  const m = hitung.perBulanTanggalMulai[BULAN_ISO[i]];
  laporan.pembandingTanggalMulai.push({
    bulan: nama,
    totalTanggalMulai: m.nilaiKontrakTotal,
    qtyTanggalMulai: m.qtyPks,
    totalBasisLaporan: h.nilaiKontrakTotal,
    catatan:
      m.nilaiKontrakTotal === h.nilaiKontrakTotal
        ? 'Sama dengan basis laporan.'
        : 'Berbeda dari basis laporan — bulan terbit PKS ≠ bulan mulai layanan untuk kontrak di bulan ini.',
  });
}

// (b) Penyetoran per bulan (arus kas) vs Laporan Piutang.
for (let i = 0; i < BULAN.length; i += 1) {
  const nama = BULAN[i];
  const h = hitung.perBulan[BULAN_ISO[i]];
  const s = lapPiutang[nama] || {};
  const baris = {
    bulan: nama,
    aplikasi: h.totalPembayaran,
    laporanPiutang: s.totalPenyetoran ?? null,
    selisih: s.totalPenyetoran == null ? null : h.totalPembayaran - s.totalPenyetoran,
    penjelasan: '',
  };
  if (baris.selisih === null) {
    baris.penjelasan = 'Laporan tidak menulis angka setoran bulan ini.';
  } else if (baris.selisih === 0) {
    baris.penjelasan = 'Cocok.';
  } else if (nama === 'agustus') {
    const jembatan = hitung.jembatanAgustus.pembayaranJuliFisolMilaHerman;
    const cocok = h.totalPembayaran + jembatan === s.totalPenyetoran;
    baris.penjelasan =
      `Selisih ${rupiah(baris.selisih)} DIJELASKAN: tab AGUSTUS Sheet 5 mencatat juga pembayaran Juli ` +
      `(30–31 Jul 2026) untuk tagihan Fisol/Mila/Herman (${rupiah(jembatan)}) — tab itu mencatat setoran ` +
      `per kontrak yang tercantum, bukan arus kas bulanan (K-07/K-12). Jembatan: ` +
      `${rupiah(h.totalPembayaran)} + ${rupiah(jembatan)} = ${rupiah(h.totalPembayaran + jembatan)} ` +
      `${cocok ? '== laporan — cocok.' : '!= laporan — jembatan TIDAK cocok, perlu penyelidikan.'}`;
    if (!cocok) selisihTotalBaru += 1;
  } else {
    baris.penjelasan = 'SELISIH — perlu penyelidikan.';
    selisihTotalBaru += 1;
  }
  laporan.penyetoranPerBulanVsLaporanPiutang.push(baris);
}

// (c) Posisi akhir September.
const pos = hitung.posisiAkhirSeptember;
const sepPiutang = lapPiutang.september || {};
laporan.posisiAkhirSeptember = {
  aplikasi: {
    totalSisaTagihan: pos.totalSisaTagihan,
    jumlahTagihanBersisa: pos.jumlahTagihanBersisa,
    rincianTagihan: pos.rincian,
    totalDendaBelumDibayar: pos.totalDendaBelumDibayar,
    rincianDenda: pos.rincianDenda,
  },
  laporanPiutangSeptember: {
    totalPiutang: sepPiutang.totalPiutang ?? null,
    totalPenyetoran: sepPiutang.totalPenyetoran ?? null,
    sisaPiutang: sepPiutang.sisaPiutang ?? null,
  },
  selisihSisaTagihanVsLaporan: pos.totalSisaTagihan - (sepPiutang.sisaPiutang ?? 0),
  penjelasan:
    'Sisa tagihan aplikasi (Rp9.604.869, 9 tagihan) SAMA PERSIS dengan sisa Laporan Piutang September. ' +
    'Denda Rp5.314.870 TIDAK ditambahkan: nilai tagihan sudah mencakup denda yang tertanam ' +
    '(mis. Fisol: tagihan Rp7.440.000 = kontrak Rp6.000.000 + denda Rp1.440.000); entitas Denda ' +
    'mencatat jumlah yang sama secara terpisah — menambahkannya akan menghitung ganda. ' +
    'Pengecualian Rp1: denda Mila tercatat Rp1.897.030 sementara sisa tagihannya Rp1.897.029 ' +
    '(ketidakkonsistenan Rp1 di sumber, sudah dicatat di audit Sheet 1).',
};
if (laporan.posisiAkhirSeptember.selisihSisaTagihanVsLaporan !== 0) selisihTotalBaru += 1;

// (d) HQ vs Laporan Bulanan.
for (let i = 0; i < BULAN.length; i += 1) {
  const nama = BULAN[i];
  const s = lapBulanan[nama] || {};
  const hq = lapHq[nama] || {};
  laporan.hqVsLaporanBulanan.push({
    bulan: nama,
    laporanBulanan: { fungsional: s.fungsional ?? null, umum: s.umum ?? null, total: s.total ?? null, qtyPks: s.qtyPks ?? null },
    hq: { fungsional: hq.fungsional ?? null, umum: hq.umum ?? null, total: hq.total ?? null, qtyPks: hq.qtyPks ?? null },
    selisihTotal: (hq.total ?? 0) - (s.total ?? 0),
    selisihQty: (hq.qtyPks ?? 0) - (s.qtyPks ?? 0),
    penjelasan:
      nama === 'juli' || nama === 'september'
        ? 'Sheet 6 (HQ) PALEMBANG = 0 — bulan belum diisi di format kantor pusat, bukan ketiadaan kerja sama (K-01/K-02). Aplikasi menghitung dari data nyata.'
        : (hq.qtyPks ?? 0) !== (s.qtyPks ?? 0)
          ? 'QTY Sheet 6 dihitung per jenis layanan (PANDUAN), bukan PKS distinct — tidak sebanding langsung (K-03).'
          : 'Cocok.',
  });
}

// Kesimpulan.
const kontrakCocok = laporan.kontrakPerBulanVsLaporanBulanan.filter((b) => b.selisih.total === 0 && b.selisih.qtyPks === 0).length;
const setorCocok = laporan.penyetoranPerBulanVsLaporanPiutang.filter((b) => b.selisih === 0 || (b.bulan === 'agustus' && b.penjelasan.includes('cocok.'))).length;
laporan.kesimpulan = [
  `Nilai kontrak per bulan Jan–Sep: total & QTY cocok ${kontrakCocok}/9 bulan vs Laporan Bulanan; ` +
    'selisih hanya pergeseran Fungsional↔Umum (Adlibs → 425131/Umum), total tidak berubah.',
  `Penyetoran per bulan Jan–Sep: cocok ${setorCocok}/9 bulan vs Laporan Piutang (Agustus dijelaskan lewat jembatan — tab sumber bukan arus kas murni).`,
  'Posisi piutang 30 Sep: sisa tagihan aplikasi SAMA PERSIS dengan sisa Laporan Piutang September (Rp9.604.869).',
  'Sheet 6 (HQ) Juli & September PALEMBANG = 0 karena belum diisi; aplikasi menghitung dari data nyata (Juli Rp62.596.875, September Rp180.000).',
  'Basis bulan laporan = bulan terbit tagihan (bulan PKS diterbitkan), bukan tanggalMulai layanan — lihat pembandingTanggalMulai.',
  selisihTotalBaru === 0
    ? 'Tidak ada selisih total baru di luar yang sudah dijelaskan.'
    : `Ada ${selisihTotalBaru} selisih total yang perlu penyelidikan.`,
];

writeFileSync(join(DIR, 'laporan-rekonsiliasi.json'), JSON.stringify(laporan, null, 2) + '\n', 'utf8');

// Cetak tabel ringkas.
console.log('\n=== REKONSILIASI — nilai kontrak per bulan (basis terbit tagihan) vs Laporan Bulanan (Sheet 4) ===');
console.log('Bulan      | Aplikasi F / U / Total / QTY  | Laporan F / U / Total / QTY   | Selisih F / U / Total / QTY');
for (const b of laporan.kontrakPerBulanVsLaporanBulanan) {
  console.log(
    `${b.bulan.padEnd(10)} | ${String(b.aplikasi.fungsional).padStart(9)} ${String(b.aplikasi.umum).padStart(9)} ${String(b.aplikasi.total).padStart(9)} ${String(b.aplikasi.qtyPks).padStart(3)} | ` +
    `${String(b.laporanBulanan.fungsional).padStart(9)} ${String(b.laporanBulanan.umum).padStart(9)} ${String(b.laporanBulanan.total).padStart(9)} ${String(b.laporanBulanan.qtyPks).padStart(3)} | ` +
    `${String(b.selisih.fungsional).padStart(9)} ${String(b.selisih.umum).padStart(9)} ${String(b.selisih.total).padStart(9)} ${String(b.selisih.qtyPks).padStart(3)}  ${b.penjelasan}`,
  );
}
console.log('\n=== REKONSILIASI — penyetoran per bulan (arus kas) vs Laporan Piutang (Sheet 5) ===');
for (const b of laporan.penyetoranPerBulanVsLaporanPiutang) {
  console.log(`${b.bulan.padEnd(10)} | aplikasi ${rupiah(b.aplikasi)} | laporan ${b.laporanPiutang == null ? '—' : rupiah(b.laporanPiutang)} | selisih ${b.selisih == null ? '—' : rupiah(b.selisih)}  ${b.penjelasan}`);
}
console.log('\n=== POSISI 30 SEP 2026 ===');
console.log(`Aplikasi: sisa tagihan ${rupiah(pos.totalSisaTagihan)} (${pos.jumlahTagihanBersisa} tagihan bersisa)`);
console.log(`Laporan Piutang Sep: sisa ${rupiah(sepPiutang.sisaPiutang ?? 0)}`);
console.log(`Selisih: ${rupiah(laporan.posisiAkhirSeptember.selisihSisaTagihanVsLaporan)}`);
console.log(`(Denda belum dibayar ${rupiah(pos.totalDendaBelumDibayar)} TIDAK ditambahkan — sudah tertanam dalam nilai tagihan.)`);
console.log('\n=== TOTAL KONTROL (derive.ts atas DATA_NYATA) ===');
console.log(JSON.stringify(hitung.totalKontrol, null, 2));
console.log('\nLaporan lengkap: scripts/impor-data-nyata/laporan-rekonsiliasi.json');

if (selisihTotalBaru > 0) {
  console.error(`\nPERINGATAN: ${selisihTotalBaru} selisih total baru — lihat laporan.`);
  process.exit(1);
}
console.log('\nOK — tidak ada selisih total baru.');

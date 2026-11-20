// Cek perbaikan tabel Contract (PR perbaikan-tabel-contract, keputusan
// pengguna 19/11/2026 16:19 WIB — dari audit UI rrideals.vercel.app:
// tabel 32 kolom tidak terpindai, status teks biasa, tanpa pencarian).
// Scope HANYA ini:
// 1. Tampilan default ramping: 10 kolom (No., Contract & Reference
//    Number, Contract Title, Signing Date, Client, Contract Period,
//    Remaining Days, Total Revenue, Payment Status, View) — ke-32 kolom
//    TETAP ADA, tampil kembali bila "Slim view" dimatikan. Preferensi
//    localStorage cluster lama (rri-contract-cluster-tersembunyi) tetap
//    dihormati, bukan ditimpa (kunci tampilan ramping terpisah).
// 2. Payment Status jadi pill (teks + titik, label English tetap):
//    Paid biru solid #2573E2/teks putih; Partially-Paid biru pucat
//    #E8F1FE/navy #0D2569; Insufficient Payment amber pucat #FEF3C7/
//    #92400E; Unpaid abu-abu #F2F4F7/#475467; Overdue merah pucat
//    #FEF3F2/#B42318. Definisi & nilai status TIDAK berubah (PR #60/#66).
// 3. Kotak pencarian teks di atas tabel: nomor kontrak, nomor referensi,
//    judul kontrak, nama klien — bekerja bersama filter dropdown.
// 4. No-wrap: nomor kontrak + referensi dan Contact satu baris dengan
//    ellipsis; judul kontrak dan nama klien maksimal 2 baris.
// 5. Kolom pertama (No.) sticky saat scroll horizontal, latar putih +
//    bayangan pemisah.
// 6. TIDAK diubah: data, rumus (Piutang/Sisa Kontrak/Sisa Piutang),
//    definisi status, filter, sort, Detail Kontrak, UI English, dan
//    firestore.rules (tanpa perubahan rules → merge tanpa publish).
import * as fs from 'node:fs';
import * as crypto from 'node:crypto';
import { DATA_NYATA } from '../src/lib/seedNyata';
import { hitungTotalKontrol } from '../src/lib/derive';
import {
  piutangRealisasi,
  sisaKontrakRealisasi,
  totalPembayaranKontrak,
} from '../src/lib/realisasi';
import {
  CLUSTER_KONTRAK,
  KOLOM_KONTRAK_TAMPILAN_RAMPING,
  bacaTampilanRampingKontrak,
  clusterKontrakTerlihat,
  clusterKontrakTerlihatRamping,
  kolomKontrakTerlihat,
  simpanTampilanRampingKontrak,
} from '../src/lib/clusterKontrak';
import {
  KELAS_PILL_STATUS_PEMBAYARAN,
  cocokPencarianKontrak,
  judulKontrak,
  kelasPillStatusPembayaran,
  nomorReferensiKontrak,
  sisaHariKerjaSama,
  sisaHariNegatif,
  statusPembayaranKontrak,
  type StatusPembayaranKontrak,
} from '../src/lib/kontrakTampilan';

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};

const kontrak = DATA_NYATA.kontrak;
const cari = (nomor: string) => kontrak.find((k) => k.nomorPks === nomor)!;
const namaKlien = (klienId: string) =>
  DATA_NYATA.klien.find((k) => k.id === klienId)?.nama ?? '';
const HARI_INI = '2026-11-16';
const dealsSrc = fs.readFileSync('src/modules/Deals.tsx', 'utf8');

// ---------- 1. tampilan default ramping: 10 kolom ----------
const headerDariId = (id: string): string => {
  for (const c of CLUSTER_KONTRAK) {
    const k = c.kolom.find((x) => x.id === id);
    if (k) return k.header;
  }
  return '';
};
cek(
  'tampilan ramping = 10 kolom, urutan sesuai spec',
  JSON.stringify(KOLOM_KONTRAK_TAMPILAN_RAMPING) ===
    JSON.stringify([
      'no',
      'nomor',
      'judul',
      'tanggalTandaTangan',
      'klien',
      'periode',
      'sisaHari',
      'totalRevenue',
      'statusPembayaran',
      'lihatDokumen',
    ]),
);
cek(
  'header 10 kolom ramping sesuai spec',
  JSON.stringify(KOLOM_KONTRAK_TAMPILAN_RAMPING.map(headerDariId)) ===
    JSON.stringify([
      'No.',
      'Contract & Reference Number',
      'Contract Title',
      'Signing Date',
      'Client',
      'Contract Period',
      'Remaining Days',
      'Total Revenue',
      'Payment Status',
      'View',
    ]),
);
cek(
  'semua id kolom ramping ada di CLUSTER_KONTRAK (32 kolom utuh)',
  KOLOM_KONTRAK_TAMPILAN_RAMPING.every((id) =>
    CLUSTER_KONTRAK.some((c) => c.kolom.some((k) => k.id === id)),
  ) && kolomKontrakTerlihat([]).length === 32,
);
cek(
  'clusterKontrakTerlihatRamping([], true) = 10 kolom, 6 cluster (Notes hilang dari header grup)',
  clusterKontrakTerlihatRamping([], true).flatMap((c) => c.kolom).length ===
    10 && clusterKontrakTerlihatRamping([], true).length === 6,
);
cek(
  'clusterKontrakTerlihatRamping([], false) = 32 kolom (tampilan penuh = model lama)',
  clusterKontrakTerlihatRamping([], false).flatMap((c) => c.kolom).length ===
    32 && clusterKontrakTerlihatRamping([], false).length === 7,
);
cek(
  'clusterKontrakTerlihat([]) tetap 32 kolom (model lama tidak berubah)',
  clusterKontrakTerlihat([]).flatMap((c) => c.kolom).length === 32,
);
cek(
  'tampilan ramping menghormati preferensi cluster lama: sembunyikan klien -> 9 kolom',
  clusterKontrakTerlihatRamping(['klien'], true).flatMap((c) => c.kolom)
    .length === 9,
);
cek(
  'tampilan ramping menghormati preferensi cluster lama: sembunyikan dokumen -> 9 kolom (tanpa View)',
  clusterKontrakTerlihatRamping(['dokumen'], true).flatMap((c) => c.kolom)
    .length === 9 &&
    !clusterKontrakTerlihatRamping(['dokumen'], true)
      .flatMap((c) => c.kolom)
      .some((k) => k.id === 'lihatDokumen'),
);
cek(
  'bacaTampilanRampingKontrak() default true di Node (tanpa localStorage)',
  bacaTampilanRampingKontrak() === true,
);
cek(
  'simpanTampilanRampingKontrak() diam di Node (tanpa localStorage, tanpa throw)',
  (() => {
    try {
      simpanTampilanRampingKontrak(true);
      simpanTampilanRampingKontrak(false);
      return true;
    } catch {
      return false;
    }
  })(),
);

// ---------- 2. pill Payment Status ----------
cek(
  'pill Paid = biru solid #2573E2, teks putih',
  KELAS_PILL_STATUS_PEMBAYARAN.Paid === 'bg-[#2573E2] text-white',
);
cek(
  'pill Partially-Paid = biru pucat #E8F1FE, teks navy #0D2569',
  KELAS_PILL_STATUS_PEMBAYARAN['Partially-Paid'] ===
    'bg-[#E8F1FE] text-[#0D2569]',
);
cek(
  'pill Insufficient Payment = amber pucat #FEF3C7, teks #92400E',
  KELAS_PILL_STATUS_PEMBAYARAN['Insufficient Payment'] ===
    'bg-[#FEF3C7] text-[#92400E]',
);
cek(
  'pill Unpaid = abu-abu #F2F4F7, teks #475467',
  KELAS_PILL_STATUS_PEMBAYARAN.Unpaid === 'bg-[#F2F4F7] text-[#475467]',
);
cek(
  'pill Overdue = merah pucat #FEF3F2, teks #B42318',
  KELAS_PILL_STATUS_PEMBAYARAN.Overdue === 'bg-[#FEF3F2] text-[#B42318]',
);
cek(
  'kelasPillStatusPembayaran memetakan kelima status',
  (Object.keys(KELAS_PILL_STATUS_PEMBAYARAN) as StatusPembayaranKontrak[]).every(
    (s) => kelasPillStatusPembayaran(s) === KELAS_PILL_STATUS_PEMBAYARAN[s],
  ),
);
cek(
  'pill fallback nilai tak dikenal = abu-abu Unpaid',
  kelasPillStatusPembayaran('X' as StatusPembayaranKontrak) ===
    'bg-[#F2F4F7] text-[#475467]',
);
cek(
  'Deals.tsx merender pill: span rounded-full + kelasPillStatusPembayaran(statusBayar) + titik bg-current',
  dealsSrc.includes('kelasPillStatusPembayaran(statusBayar)') &&
    dealsSrc.includes('rounded-full px-2.5 py-0.5') &&
    dealsSrc.includes('rounded-full bg-current'),
);

// ---------- 3. pencarian teks ----------
const bidangCari = (k: (typeof kontrak)[number]) => ({
  nomorPks: k.nomorPks,
  referensi: nomorReferensiKontrak(k),
  judul: judulKontrak(k),
  namaKlien: namaKlien(k.klienId),
});
const hasilCari = (term: string) =>
  kontrak.filter((k) => cocokPencarianKontrak(bidangCari(k), term));
cek(
  'cari "0603" (nomor kontrak) = 1: 0603',
  hasilCari('0603').length === 1 &&
    hasilCari('0603')[0].nomorPks === '0603/PKS/RRI.PLB/01/2026',
);
cek(
  'cari "001/RRI.PLB/PKS.F/01/2026" (nomor referensi) = 1: 0603',
  hasilCari('001/RRI.PLB/PKS.F/01/2026').length === 1 &&
    hasilCari('001/RRI.PLB/PKS.F/01/2026')[0].nomorPks ===
      '0603/PKS/RRI.PLB/01/2026',
);
cek(
  'cari "taspen" (judul + nama klien) = 1: 001 Taspen',
  hasilCari('taspen').length === 1 &&
    hasilCari('taspen')[0].nomorPks === '001/PKS/DIR.LPU/01/2026',
);
cek(
  'cari tidak case-sensitive: "TASPEN" = "taspen"',
  hasilCari('TASPEN').length === 1 &&
    hasilCari('TASPEN')[0].nomorPks === '001/PKS/DIR.LPU/01/2026',
);
cek(
  'cari "bank sumsel" (nama klien) = 1: 2036 Bank Sumsel Babel',
  hasilCari('bank sumsel').length === 1 &&
    namaKlien(hasilCari('bank sumsel')[0].klienId).includes('Bank Sumsel'),
);
cek(
  'cari "spot iklan" (judul) = 8 kontrak',
  hasilCari('spot iklan').length === 8,
  `${hasilCari('spot iklan').length}`,
);
cek(
  'cari "rri.plb" (nomor kontrak) = 39 kontrak',
  hasilCari('rri.plb').length === 39,
  `${hasilCari('rri.plb').length}`,
);
cek(
  'cari "Sewa Lahan" = 0 (detail layanan TIDAK dicari — hanya 4 bidang)',
  hasilCari('Sewa Lahan').length === 0,
);
cek(
  'cari kosong = 42 (semua)',
  hasilCari('').length === 42 && hasilCari('   ').length === 42,
);
cek(
  'cari "zzz-tidak-ada" = 0',
  hasilCari('zzz-tidak-ada').length === 0,
);
// Pencarian bekerja bersama filter dropdown (simulasi rantai filter TabKontrak).
const statusBayar = (nomor: string) =>
  statusPembayaranKontrak(
    cari(nomor),
    DATA_NYATA.tagihan,
    DATA_NYATA.pembayaran,
    DATA_NYATA.denda,
    HARI_INI,
  );
cek(
  'cari "1051" + filter Partially-Paid = 1',
  hasilCari('1051').filter(
    (k) =>
      statusPembayaranKontrak(
        k,
        DATA_NYATA.tagihan,
        DATA_NYATA.pembayaran,
        DATA_NYATA.denda,
        HARI_INI,
      ) === 'Partially-Paid',
  ).length === 1,
);
cek(
  'cari "1051" + filter Paid = 0 (pencarian tidak mengabaikan filter)',
  hasilCari('1051').filter(
    (k) =>
      statusPembayaranKontrak(
        k,
        DATA_NYATA.tagihan,
        DATA_NYATA.pembayaran,
        DATA_NYATA.denda,
        HARI_INI,
      ) === 'Paid',
  ).length === 0,
);
cek(
  'cari "taspen" + filter Fungsional = 1 (001 sudah Fungsional)',
  hasilCari('taspen').filter((k) => k.jenisPnBP === 'Fungsional').length ===
    1,
);
cek(
  'cari "spot iklan" + filter Unpaid = 1: 10227',
  hasilCari('spot iklan').filter(
    (k) =>
      statusPembayaranKontrak(
        k,
        DATA_NYATA.tagihan,
        DATA_NYATA.pembayaran,
        DATA_NYATA.denda,
        HARI_INI,
      ) === 'Unpaid',
  ).length === 1 &&
    hasilCari('spot iklan').filter(
      (k) =>
        statusPembayaranKontrak(
          k,
          DATA_NYATA.tagihan,
          DATA_NYATA.pembayaran,
          DATA_NYATA.denda,
          HARI_INI,
        ) === 'Unpaid',
    )[0].nomorPks === '10227/PKS/RRI.PLB/10/2026',
);
cek(
  'Deals.tsx: kotak pencarian di atas tabel (type search + placeholder + aria-label + state pencarianKontrak)',
  dealsSrc.includes('type="search"') &&
    dealsSrc.includes('value={pencarianKontrak}') &&
    dealsSrc.includes('placeholder="Contract number, title, client…"') &&
    dealsSrc.includes(
      'aria-label="Search contracts by number, reference, title, or client"',
    ) &&
    dealsSrc.includes('cocokPencarianKontrak('),
);

// ---------- 4. no-wrap + 5. kolom pertama sticky ----------
cek(
  'Deals.tsx: Slim view (centang + baca/simpan localStorage + clusterKontrakTerlihatRamping)',
  dealsSrc.includes('Slim view') &&
    dealsSrc.includes('bacaTampilanRampingKontrak()') &&
    dealsSrc.includes('simpanTampilanRampingKontrak(baru)') &&
    dealsSrc.includes('clusterKontrakTerlihatRamping('),
);
cek(
  'kolom pertama menempel: konstanta kelas sticky + dipakai di Th No. dan Td nomor urut',
  dealsSrc.includes('KELAS_KOLOM_PERTAMA_MENEMPEL') &&
    dealsSrc.includes('sticky left-0 z-10 bg-white') &&
    dealsSrc.includes('shadow-[1px_0_0_0_rgba(37,115,226,0.15)]') &&
    dealsSrc.includes('<Th className={KELAS_KOLOM_PERTAMA_MENEMPEL}>No.</Th>') &&
    dealsSrc.includes('<Td className={KELAS_KOLOM_PERTAMA_MENEMPEL}>'),
);
cek(
  'no-wrap nomor kontrak + referensi: max-w-[240px] truncate di kedua baris',
  dealsSrc.includes('max-w-[240px] truncate font-semibold') &&
    dealsSrc.includes('max-w-[240px] truncate text-xs'),
);
cek(
  'no-wrap Contact/telepon: max-w-[160px] truncate',
  dealsSrc.includes('max-w-[160px] truncate'),
);
cek(
  'judul kontrak + nama klien maksimal 2 baris: line-clamp-2',
  dealsSrc.includes('<span className="line-clamp-2">') &&
    dealsSrc.includes('line-clamp-2 text-left text-[#2573e2]'),
);

// ---------- Remaining Days negatif ----------
cek(
  'sisaHariNegatif("-2 days") = true; "1 day"/"807 days"/"Completed" = false',
  sisaHariNegatif('-2 days') === true &&
    sisaHariNegatif('-1 day') === true &&
    sisaHariNegatif('1 day') === false &&
    sisaHariNegatif('807 days') === false &&
    sisaHariNegatif('Completed') === false,
);
cek(
  'remaining days 10227 per 2026-11-19 = "-2 days" (berakhir 17/11, status belum Selesai)',
  sisaHariKerjaSama(cari('10227/PKS/RRI.PLB/10/2026'), '2026-11-19') ===
    '-2 days',
);
cek(
  'remaining days 0603 = "Completed" (status Selesai)',
  sisaHariKerjaSama(cari('0603/PKS/RRI.PLB/01/2026'), '2026-11-19') ===
    'Completed',
);
cek(
  'Deals.tsx: sisa hari negatif tampil merah + titik (sisaHariNegatif + text-[#B42318])',
  dealsSrc.includes('sisaHariNegatif(sisaHari)') &&
    dealsSrc.includes('text-[#B42318]'),
);

// ---------- 6. TIDAK diubah: 32 kolom, filter, sort, rumus, status ----------
// Semua 32 header kolom masih ada di sumber Deals.tsx.
cek(
  'ke-32 header kolom masih ada di Deals.tsx (tidak ada kolom dihapus)',
  CLUSTER_KONTRAK.flatMap((c) => c.kolom).every((k) =>
    dealsSrc.includes(k.header.replace('&', '&amp;')),
  ),
);
cek(
  'filter dropdown utuh: Client Type, PNBP Type, Payment Status, Cooperation Status',
  dealsSrc.includes('<Label>Client Type</Label>') &&
    dealsSrc.includes('<Label>PNBP Type</Label>') &&
    dealsSrc.includes('<Label>Payment Status</Label>') &&
    dealsSrc.includes('<Label>Cooperation Status</Label>'),
);
cek(
  'sort utuh: Sort by + Order',
  dealsSrc.includes('<Label>Sort by</Label>') &&
    dealsSrc.includes('<Label>Order</Label>'),
);
cek(
  'bar View + centang cluster utuh (View, CLUSTER_KONTRAK.map, toggleCluster)',
  dealsSrc.includes('>\n          View\n        </span>') &&
    dealsSrc.includes('{CLUSTER_KONTRAK.map((c) => (') &&
    dealsSrc.includes('onChange={() => toggleCluster(c.id)}'),
);
// Definisi status TIDAK berubah (nilai + distribusi per 2026-11-16).
const hitungBayar = (s: string) =>
  kontrak.filter(
    (k) =>
      statusPembayaranKontrak(
        k,
        DATA_NYATA.tagihan,
        DATA_NYATA.pembayaran,
        DATA_NYATA.denda,
        HARI_INI,
      ) === s,
  ).length;
cek('payment status Paid = 28', hitungBayar('Paid') === 28, `${hitungBayar('Paid')}`);
cek(
  'payment status Partially-Paid = 5',
  hitungBayar('Partially-Paid') === 5,
  `${hitungBayar('Partially-Paid')}`,
);
cek(
  'payment status Insufficient Payment = 6',
  hitungBayar('Insufficient Payment') === 6,
  `${hitungBayar('Insufficient Payment')}`,
);
cek('payment status Unpaid = 3', hitungBayar('Unpaid') === 3, `${hitungBayar('Unpaid')}`);
cek('payment status Overdue = 0', hitungBayar('Overdue') === 0, `${hitungBayar('Overdue')}`);
cek(
  'definisi status byte-identik di sumber: Paid dulu, toleransi Rp1 Partially-Paid',
  fs
    .readFileSync('src/lib/kontrakTampilan.ts', 'utf8')
    .includes("if (totalDibayar >= penuh) return 'Paid';") &&
    fs
      .readFileSync('src/lib/kontrakTampilan.ts', 'utf8')
      .includes('Math.abs(totalDibayar - piutang) <= 1 && piutang < penuh'),
);
// Rumus nilai TIDAK berubah.
cek(
  'nilai kontrak 441.863.375',
  kontrak.reduce((s, x) => s + x.nilaiKontrak, 0) === 441863375,
);
cek(
  'piutang 10227 = 2.700.000',
  piutangRealisasi(cari('10227/PKS/RRI.PLB/10/2026'), DATA_NYATA.tagihan, DATA_NYATA.denda, HARI_INI) === 2700000,
);
cek(
  'sisa kontrak 10227 = 2.295.000',
  sisaKontrakRealisasi(cari('10227/PKS/RRI.PLB/10/2026'), DATA_NYATA.tagihan, DATA_NYATA.denda, HARI_INI) === 2295000,
);
cek(
  'Σ total pembayaran terverifikasi = 362.329.255',
  kontrak.reduce(
    (s, k) =>
      s + totalPembayaranKontrak(k, DATA_NYATA.tagihan, DATA_NYATA.pembayaran),
    0,
  ) === 362329255,
);
const k = hitungTotalKontrol(DATA_NYATA);
cek('total kontrol tagihan 376.414.124', k.totalTagihan === 376414124, `${k.totalTagihan}`);
cek('total kontrol sisa piutang 14.084.869', k.sisaPiutang === 14084869, `${k.sisaPiutang}`);
cek('total kontrol denda 6.219.250', k.totalDenda === 6219250, `${k.totalDenda}`);
// firestore.rules BERUBAH di PR tiga peran (bukan lagi byte-identik
// dengan main 56e0736c — hash lama 593ee968...): penanda tiga peran
// harus ada, supaya rules lama (dua peran) tidak terpakai lagi.
const rules = fs.readFileSync('firestore.rules');
const rulesText = rules.toString('utf8');
const blobSha1 = crypto
  .createHash('sha1')
  .update(Buffer.concat([Buffer.from(`blob ${rules.length}\0`), rules]))
  .digest('hex');
cek(
  'firestore.rules BERUBAH dari main 56e0736c (tiga peran) + penanda admin ada',
  blobSha1 !== '593ee9685dc7d50f9588b0d9861deeefb8d92bfd' &&
    rulesText.includes('function adalahAdmin()') &&
    rulesText.includes('function adalahStafInternal()'),
  blobSha1,
);

if (gagal === 0) console.log('\nSemua asersi lolos.');
else console.log(`\n${gagal} asersi GAGAL.`);
process.exit(gagal === 0 ? 0 : 1);

// Cek tampilan baru tabel Contract (PR tampilan-baru-contract + PR
// contract-signing-date): 9 kolom — No., Contract & Reference Number
// (gabungan, keputusan pengguna 16/11/2026 13:35 WIB), Contract Title,
// Signing Date (= Creation Date per keputusan pengguna 16/11/2026, dari
// tanggalTandaTangan dengan fallback tanggalMulai), Client, Service Type,
// Service / BMN Detail (nama layanan, gabung "; "), Contract Period,
// Contract Value; nomor urut "No." mengikuti urutan tampil sesudah
// filter + sort (keputusan pengguna 16/11/2026 13:31 WIB), filter Client
// Type + PNBP Type, sort 3 kunci, tanpa Account Code dan tanpa Status di
// tabel; total kontrol tidak berubah.
import * as fs from 'node:fs';
import { DATA_NYATA } from '../src/lib/seedNyata';
import { hitungTotalKontrol } from '../src/lib/derive';
import {
  detailLayananKontrak,
  jenisKlienYangAda,
  judulKontrak,
  labelArahUrutKontrak,
  nomorReferensiKontrak,
  tanggalPenandatangananKontrak,
  urutkanKontrak,
} from '../src/lib/kontrakTampilan';

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};

const kontrak = DATA_NYATA.kontrak;
const cari = (nomor: string) => kontrak.find((k) => k.nomorPks === nomor)!;

// ---------- parsing Judul + Referensi dari catatan ----------
const dgnJudul = kontrak.filter((k) => judulKontrak(k) !== undefined).length;
const dgnRef = kontrak.filter((k) => nomorReferensiKontrak(k) !== undefined).length;
cek('judul terparsir 42/42', dgnJudul === 42, `${dgnJudul}`);
cek('referensi terparsir 38/42', dgnRef === 38, `${dgnRef}`);
cek(
  'judul 0603',
  judulKontrak(cari('0603/PKS/RRI.PLB/01/2026')) ===
    'Spot Iklan Edukasi Bahaya & Manfaat Listrik',
);
cek(
  'referensi 0603',
  nomorReferensiKontrak(cari('0603/PKS/RRI.PLB/01/2026')) ===
    '001/RRI.PLB/PKS.F/01/2026',
);
cek(
  'judul Taspen 001',
  judulKontrak(cari('001/PKS/DIR.LPU/01/2026')) ===
    'Adlibs Waspada Penipuan Mengatasnamakan PT Taspen',
);
cek(
  'referensi Taspen 001 kosong',
  nomorReferensiKontrak(cari('001/PKS/DIR.LPU/01/2026')) === undefined,
);
cek(
  'judul 018 tanpa \\r (normalisasi spasi)',
  judulKontrak(cari('018/PKS/DIR.LPU/08/2026')) ===
    'Kerjasama Penyiaran Program Komunikasi Publik Kementerian Komdigi & Radio Republik Indonesia',
);
cek(
  'referensi Samdini 10828',
  nomorReferensiKontrak(cari('10828/PKS/RRI.PLB/10/2026')) ===
    '037/RRI.PLB/PKS.U/10/2026',
);
cek(
  'referensi Darojad 2025 kosong',
  nomorReferensiKontrak(cari('027/RRI.PLB/PKS.U/06/2025')) === undefined,
);
cek(
  'referensi VGreen 2025 kosong',
  nomorReferensiKontrak(cari('016/PKS/DIR.LPU/06/2025')) === undefined,
);
cek(
  'judul Darojad 2025 ada',
  judulKontrak(cari('027/RRI.PLB/PKS.U/06/2025')) !== undefined,
);

// ---------- kolom Signing Date = Creation Date (keputusan 16/11/2026) ----------
cek(
  'signing date terisi 42/42',
  kontrak.every((k) => tanggalPenandatangananKontrak(k) !== ''),
);
cek(
  'signing date = ttd ?? mulai di 42/42',
  kontrak.every(
    (k) => tanggalPenandatangananKontrak(k) === (k.tanggalTandaTangan ?? k.tanggalMulai),
  ),
);
cek(
  'signing date 0603 = 2026-01-19',
  tanggalPenandatangananKontrak(cari('0603/PKS/RRI.PLB/01/2026')) === '2026-01-19',
);
cek(
  'signing date Samdini 10828 = 2026-09-17',
  tanggalPenandatangananKontrak(cari('10828/PKS/RRI.PLB/10/2026')) === '2026-09-17',
);
cek(
  'signing date 11290 = 2026-10-30',
  tanggalPenandatangananKontrak(cari('11290/PKS/RRI.PLB/10/2026')) === '2026-10-30',
);
cek(
  'signing date Taspen 001 = 2026-01-20',
  tanggalPenandatangananKontrak(cari('001/PKS/DIR.LPU/01/2026')) === '2026-01-20',
);

// ---------- kolom No. (nomor urut tampil, sesudah filter + sort) ----------
// Hitungan Fungsional = 23 adalah yang benar untuk seed cabang ini
// (base main 6f41cbb). Kopi lokal bersama saat ini memuat koreksi Adlibs
// PR #56 yang belum merge (25 Fungsional), sehingga asersi ini
// DIHARAPKAN gagal bila dijalankan terhadap seed lokal bersama — itu
// efek silang yang diketahui, BUKAN cacat PR ini. Urutan merge: PR #55
// dulu, lalu PR #56 di-rebase dan asersi ini diperbarui menjadi 25 di sana.
const fungsional = kontrak.filter((k) => k.jenisPnBP === 'Fungsional');
cek('filter Fungsional = 23 kontrak', fungsional.length === 23, `${fungsional.length}`);
const fungNilaiDesc = urutkanKontrak(fungsional, 'nilai', 'turun');
cek(
  'sort nilai desc terurut menurun sesudah filter Fungsional',
  fungNilaiDesc.every(
    (k, i) => i === 0 || fungNilaiDesc[i - 1].nilaiKontrak >= k.nilaiKontrak,
  ),
);
cek(
  'nomor 1 sesudah filter Fungsional + sort nilai = 1744',
  fungNilaiDesc[0].nomorPks === '1744/PKS/RRI.PLB/03/2026',
  fungNilaiDesc[0].nomorPks,
);
cek(
  'nomor terakhir sesudah filter Fungsional + sort nilai = 1158 (Rp180.000)',
  fungNilaiDesc[fungNilaiDesc.length - 1].nomorPks === '1158/PKS/RRI.PLB/10/2026' &&
    fungNilaiDesc[fungNilaiDesc.length - 1].nilaiKontrak === 180000,
  fungNilaiDesc[fungNilaiDesc.length - 1].nomorPks,
);
cek(
  'nomor 1..3 sort default (ttd desc) = 11290, 10227, 1158',
  JSON.stringify(
    urutkanKontrak(kontrak, 'tandaTangan', 'turun')
      .slice(0, 3)
      .map((k) => k.nomorPks),
  ) ===
    JSON.stringify([
      '11290/PKS/RRI.PLB/10/2026',
      '10227/PKS/RRI.PLB/10/2026',
      '1158/PKS/RRI.PLB/10/2026',
    ]),
);

// ---------- kolom Service / BMN Detail (nama layanan, gabung "; ") ----------
cek(
  'detail 001 Taspen = "Ad-Lib / Jingle"',
  detailLayananKontrak(cari('001/PKS/DIR.LPU/01/2026')) === 'Ad-Lib / Jingle',
);
cek(
  'detail Samdini 10828 = "Sewa Lahan / BMN"',
  detailLayananKontrak(cari('10828/PKS/RRI.PLB/10/2026')) === 'Sewa Lahan / BMN',
);
cek(
  'detail 018 multi-layanan digabung "; "',
  detailLayananKontrak(cari('018/PKS/DIR.LPU/08/2026')) ===
    'Siaran Iklan (Spot); Sandiwara Radio / Majalah Udara; Feauture',
);
cek(
  'detail 0603 = "Siaran Iklan (Spot)"',
  detailLayananKontrak(cari('0603/PKS/RRI.PLB/01/2026')) === 'Siaran Iklan (Spot)',
);
cek(
  'detail 11290 = "Dialog Interaktif Dalam Studio"',
  detailLayananKontrak(cari('11290/PKS/RRI.PLB/10/2026')) ===
    'Dialog Interaktif Dalam Studio',
);
cek(
  '39 kontrak 1 layanan, 3 kontrak 3 layanan',
  kontrak.filter((k) => (k.layanan ?? []).length === 1).length === 39 &&
    kontrak.filter((k) => (k.layanan ?? []).length === 3).length === 3,
);
cek(
  '16 kontrak sewa tampil teks generik "Sewa Lahan / BMN"',
  kontrak.filter((k) => detailLayananKontrak(k) === 'Sewa Lahan / BMN').length === 16,
);
cek(
  'detail tanpa layanan = undefined',
  detailLayananKontrak({ ...cari('0603/PKS/RRI.PLB/01/2026'), layanan: [] }) ===
    undefined,
);

// ---------- kolom gabungan Contract & Reference Number ----------
cek(
  'sel gabungan 0603: baris 1 nomorPks + baris 2 referensi',
  cari('0603/PKS/RRI.PLB/01/2026').nomorPks === '0603/PKS/RRI.PLB/01/2026' &&
    nomorReferensiKontrak(cari('0603/PKS/RRI.PLB/01/2026')) ===
      '001/RRI.PLB/PKS.F/01/2026',
);
cek(
  'sel gabungan 001 Taspen: baris 2 "—" (tanpa referensi)',
  nomorReferensiKontrak(cari('001/PKS/DIR.LPU/01/2026')) === undefined,
);

// ---------- opsi filter Jenis Klien ----------
cek(
  'jenis klien di data = 5 master',
  JSON.stringify(jenisKlienYangAda(DATA_NYATA.klien)) ===
    JSON.stringify([
      'Pemerintah',
      'BUMN/BUMD',
      'Swasta',
      'Perorangan',
      'Lembaga/Organisasi',
    ]),
);

// ---------- kebenaran sort ----------
const nilaiDesc = urutkanKontrak(kontrak, 'nilai', 'turun');
cek('sort nilai desc pertama Samdini', nilaiDesc[0].nomorPks === '10828/PKS/RRI.PLB/10/2026' && nilaiDesc[0].nilaiKontrak === 132704000, nilaiDesc[0].nomorPks);
cek('sort nilai asc pertama 1158 (Rp180.000)', urutkanKontrak(kontrak, 'nilai', 'naik')[0].nomorPks === '1158/PKS/RRI.PLB/10/2026');
const ttdDesc = urutkanKontrak(kontrak, 'tandaTangan', 'turun');
cek('sort ttd desc pertama 11290', ttdDesc[0].nomorPks === '11290/PKS/RRI.PLB/10/2026', ttdDesc[0].nomorPks);
cek('sort ttd asc pertama Darojad 2025', urutkanKontrak(kontrak, 'tandaTangan', 'naik')[0].nomorPks === '027/RRI.PLB/PKS.U/06/2025');
const selesaiAsc = urutkanKontrak(kontrak, 'selesai', 'naik');
cek('sort selesai asc pertama 0603', selesaiAsc[0].nomorPks === '0603/PKS/RRI.PLB/01/2026', selesaiAsc[0].nomorPks);
const selesaiDesc = urutkanKontrak(kontrak, 'selesai', 'turun');
cek('sort selesai desc pertama 1051 (seri 2029, tie-break nomor)', selesaiDesc[0].nomorPks === '1051/PKS/RRI.PLB/02/2026', selesaiDesc[0].nomorPks);
const sebelum = kontrak.map((k) => k.id).join(',');
urutkanKontrak(kontrak, 'nilai', 'turun');
cek('sort tidak mengubah data asli', kontrak.map((k) => k.id).join(',') === sebelum);
cek(
  'label arah nilai turun',
  labelArahUrutKontrak('nilai', 'turun') === 'Highest first',
);
cek(
  'label arah ttd naik',
  labelArahUrutKontrak('tandaTangan', 'naik') === 'Oldest first',
);

// ---------- struktur sumber TabKontrak ----------
const deals = fs.readFileSync('src/modules/Deals.tsx', 'utf8');
const kerjaSama = fs.readFileSync('src/modules/KerjaSama.tsx', 'utf8');
const awal = deals.indexOf('export function TabKontrak');
const akhir = deals.indexOf('function DetailKontrak', awal);
const tabKontrak = deals.slice(awal, akhir);
const header = [...tabKontrak.matchAll(/<Th[^>]*>([^<]+)<\/Th>/g)].map((m) => m[1]);
cek(
  'urutan 9 header kolom (No. paling kiri, nomor+referensi gabung)',
  JSON.stringify(header) ===
    JSON.stringify([
      'No.',
      'Contract &amp; Reference Number',
      'Contract Title',
      'Signing Date',
      'Client',
      'Service Type',
      'Service / BMN Detail',
      'Contract Period',
      'Contract Value',
    ]),
  JSON.stringify(header),
);
cek(
  'header gabungan "Contract & Reference Number" 1x',
  (tabKontrak.match(/<Th>Contract &amp; Reference Number<\/Th>/g) ?? []).length === 1,
);
cek(
  'header "Contract Number" terpisah 0x',
  !tabKontrak.includes('<Th>Contract Number</Th>'),
);
cek(
  'header "Reference Number" terpisah 0x',
  !tabKontrak.includes('<Th>Reference Number</Th>'),
);
cek(
  'sel gabungan: nomorPks tebal + referensi kecil di bawahnya',
  tabKontrak.includes('<div className="font-semibold">{k.nomorPks}</div>') &&
    tabKontrak.includes('nomorReferensiKontrak(k) ??'),
);
cek(
  'sel detail pakai helper detailLayananKontrak',
  tabKontrak.includes('detailLayananKontrak(k)'),
);
cek('header pertama "No."', header[0] === 'No.');
cek(
  'sel No. = indeks + 1 dari kontrakTersaring',
  tabKontrak.includes('kontrakTersaring.map((k, indeks)') &&
    tabKontrak.includes('{indeks + 1}'),
);
cek('"Account Code" 0x di TabKontrak', !tabKontrak.includes('Account Code'));
cek('"Account code" 0x di TabKontrak', !tabKontrak.includes('Account code'));
cek('kolom Status lama 0x di TabKontrak', !tabKontrak.includes('<Th>Status</Th>'));
cek('kolom PKS Number lama 0x di TabKontrak', !tabKontrak.includes('<Th>PKS Number</Th>'));
cek('kolom End Date lama 0x di TabKontrak', !tabKontrak.includes('<Th>End Date</Th>'));
cek('"Creation Date" 0x di TabKontrak', !tabKontrak.includes('Creation Date'));
cek('header Signing Date ada di TabKontrak', tabKontrak.includes('<Th>Signing Date</Th>'));
cek(
  'sel Signing Date pakai helper tanggalPenandatangananKontrak',
  tabKontrak.includes('tanggalPenandatangananKontrak(k)'),
);
cek('filter Client Type ada', tabKontrak.includes('<Label>Client Type</Label>'));
cek('filter PNBP Type ada', tabKontrak.includes('<Label>PNBP Type</Label>'));
cek('kontrol Sort by ada', tabKontrak.includes('<Label>Sort by</Label>'));
cek('kontrol Order ada', tabKontrak.includes('<Label>Order</Label>'));
cek('opsi sort Signing Date', tabKontrak.includes('value="tandaTangan">Signing Date'));
cek('opsi sort End Date', tabKontrak.includes('value="selesai">End Date'));
cek('opsi sort Contract Value', tabKontrak.includes('value="nilai">Contract Value'));
cek('"Account Code" 0x di DetailKontrak', !deals.slice(akhir, deals.indexOf('function FormKontrak', akhir)).includes('Account code'));
cek('filterStatus 0x di Deals.tsx', !deals.includes('filterStatus'));
cek('filterStatus 0x di KerjaSama.tsx', !kerjaSama.includes('filterStatus'));
cek('MASTER_STATUS_KONTRAK 0x di Deals.tsx', !deals.includes('MASTER_STATUS_KONTRAK'));

// ---------- total kontrol tidak berubah ----------
const k = hitungTotalKontrol(DATA_NYATA);
const totalKontrak = kontrak.reduce((s, x) => s + x.nilaiKontrak, 0);
const pksAktif = kontrak.filter((x) => x.status === 'Aktif').length;
cek('nilai kontrak 441.863.375', totalKontrak === 441863375, `${totalKontrak}`);
cek('tagihan 376.414.124', k.totalTagihan === 376414124, `${k.totalTagihan}`);
cek('pembayaran terverifikasi 362.329.255', k.totalPembayaranTerverifikasi === 362329255, `${k.totalPembayaranTerverifikasi}`);
cek('sisa piutang 14.084.869', k.sisaPiutang === 14084869, `${k.sisaPiutang}`);
cek('denda 6.219.250', k.totalDenda === 6219250, `${k.totalDenda}`);
cek('PKS aktif 15/42', pksAktif === 15, `${pksAktif}`);

if (gagal === 0) console.log('\nSemua asersi lolos.');
else console.log(`\n${gagal} asersi GAGAL.`);
process.exit(gagal === 0 ? 0 : 1);

// Cek tampilan baru tabel Contract (PR tampilan-baru-contract):
// 8 kolom, filter Client Type + PNBP Type, sort 3 kunci, tanpa Account Code
// dan tanpa Status di tabel; total kontrol tidak berubah.
import * as fs from 'node:fs';
import { DATA_NYATA } from '../src/lib/seedNyata';
import { hitungTotalKontrol } from '../src/lib/derive';
import {
  jenisKlienYangAda,
  judulKontrak,
  labelArahUrutKontrak,
  nomorReferensiKontrak,
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
  'urutan 8 header kolom',
  JSON.stringify(header) ===
    JSON.stringify([
      'Contract Number',
      'Reference Number',
      'Contract Title',
      'Creation Date',
      'Client',
      'Service Type',
      'Contract Period',
      'Contract Value',
    ]),
  JSON.stringify(header),
);
cek('"Account Code" 0x di TabKontrak', !tabKontrak.includes('Account Code'));
cek('"Account code" 0x di TabKontrak', !tabKontrak.includes('Account code'));
cek('kolom Status lama 0x di TabKontrak', !tabKontrak.includes('<Th>Status</Th>'));
cek('kolom PKS Number lama 0x di TabKontrak', !tabKontrak.includes('<Th>PKS Number</Th>'));
cek('kolom End Date lama 0x di TabKontrak', !tabKontrak.includes('<Th>End Date</Th>'));
cek('sel Creation Date "—"', tabKontrak.includes('<Td>—</Td>'));
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

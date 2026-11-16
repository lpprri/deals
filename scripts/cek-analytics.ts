// Verifikasi Analytics + Cross-Filtering (template Figma "Analytics
// Dashboard with Cross-Filtering" — pola saja; angka dari data nyata).
// Asersi: ringkasan tanpa filter cocok dengan total kontrol; semua
// pengelompokan dijumlahkan kembali ke total yang sama; filter kategori,
// satker, dan periode menghasilkan himpunan yang benar; kombinasi kosong
// menghasilkan nol. Keluar bukan-nol bila ada asersi gagal.
import { DATA_NYATA } from '../src/lib/seedNyata';
import {
  FILTER_ANALYTICS_KOSONG,
  opsiFilterAnalytics,
  ringkasanAnalytics,
} from '../src/lib/derive';

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};
const jumlah = (xs: { nilai: number }[]) => xs.reduce((s, x) => s + x.nilai, 0);

const semua = ringkasanAnalytics(DATA_NYATA, FILTER_ANALYTICS_KOSONG);
cek('tanpa filter: nilaiKontrak', semua.nilaiKontrak === 441863375, `Rp${semua.nilaiKontrak.toLocaleString('id-ID')}`);
cek('tanpa filter: pembayaran terverifikasi', semua.pembayaranTerverifikasi === 362329255, `Rp${semua.pembayaranTerverifikasi.toLocaleString('id-ID')}`);
cek('tanpa filter: sisa piutang', semua.sisaPiutang === 14084869, `Rp${semua.sisaPiutang.toLocaleString('id-ID')}`);
cek('tanpa filter: jumlah kontrak', semua.jumlahKontrak === 42, `${semua.jumlahKontrak}`);
cek('tanpa filter: jumlah klien', semua.jumlahKlien === 33, `${semua.jumlahKlien}`);
cek('perKategori dijumlahkan ke total', jumlah(semua.perKategori) === semua.nilaiKontrak, `${semua.perKategori.map((b) => `${b.label}=${b.jumlah}`).join(', ')}`);
cek('perSatker dijumlahkan ke total', jumlah(semua.perSatker) === semua.nilaiKontrak, `${semua.perSatker.map((b) => `${b.label}=${b.jumlah}`).join(', ')}`);
cek('perBulan dijumlahkan ke total', jumlah(semua.perBulan) === semua.nilaiKontrak, `${semua.perBulan.length} bulan`);
cek('perTahun dijumlahkan ke total', jumlah(semua.perTahun) === semua.nilaiKontrak, `${semua.perTahun.map((b) => `${b.tahun}=${b.jumlah}`).join(', ')}`);
cek('perTahun: 2026 = 40 kontrak, 2025 = 2', semua.perTahun.find((b) => b.tahun === '2026')?.jumlah === 40 && semua.perTahun.find((b) => b.tahun === '2025')?.jumlah === 2);

const siaran = ringkasanAnalytics(DATA_NYATA, { ...FILTER_ANALYTICS_KOSONG, kategori: 'Jasa Penyiaran' });
cek('filter kategori Jasa Penyiaran: 24 kontrak', siaran.jumlahKontrak === 24, `${siaran.jumlahKontrak}`);
cek('filter kategori: perKategori hanya 1 baris', siaran.perKategori.length === 1 && siaran.perKategori[0].label === 'Jasa Penyiaran');
cek('filter kategori: nilai = jumlah independen', siaran.nilaiKontrak === DATA_NYATA.kontrak.filter((k) => k.kategoriLayanan === 'Jasa Penyiaran').reduce((s, k) => s + k.nilaiKontrak, 0), `Rp${siaran.nilaiKontrak.toLocaleString('id-ID')}`);

const feb = ringkasanAnalytics(DATA_NYATA, { ...FILTER_ANALYTICS_KOSONG, periode: '2026-02' });
cek('filter periode 2026-02: 13 kontrak', feb.jumlahKontrak === 13, `${feb.jumlahKontrak}`);
const thn25 = ringkasanAnalytics(DATA_NYATA, { ...FILTER_ANALYTICS_KOSONG, periode: '2025' });
cek('filter periode 2025: 2 kontrak', thn25.jumlahKontrak === 2, `${thn25.jumlahKontrak}`);
const plb = ringkasanAnalytics(DATA_NYATA, { ...FILTER_ANALYTICS_KOSONG, satker: '41' });
cek('filter satker 41 (PALEMBANG): 42 kontrak', plb.jumlahKontrak === 42, `${plb.jumlahKontrak}`);

const kosong = ringkasanAnalytics(DATA_NYATA, { kategori: 'Jasa Digitalisasi Penyiaran', satker: '', periode: '2025' });
cek('kombinasi kosong: 0 kontrak, semua KPI 0', kosong.jumlahKontrak === 0 && kosong.nilaiKontrak === 0 && kosong.pembayaranTerverifikasi === 0 && kosong.sisaPiutang === 0 && kosong.perKategori.length === 0 && kosong.perBulan.length === 0);

const opsi = opsiFilterAnalytics(DATA_NYATA);
cek('opsi kategori: 3', opsi.kategori.length === 3, opsi.kategori.join(', '));
cek('opsi satker: 1 (PALEMBANG)', opsi.satker.length === 1 && opsi.satker[0].kode === '41', JSON.stringify(opsi.satker));
cek('opsi periode memuat 2026, 2025, 2026-02', opsi.periode.includes('2026') && opsi.periode.includes('2025') && opsi.periode.includes('2026-02'), opsi.periode.join(', '));

if (gagal > 0) process.exit(1);

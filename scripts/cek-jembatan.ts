import { DATA_NYATA } from '../src/lib/seedNyata';
import { hitungTotalKontrol, hitungJembatanRekonsiliasi } from '../src/lib/derive';

const kontrol = hitungTotalKontrol(DATA_NYATA);
const j = hitungJembatanRekonsiliasi(DATA_NYATA);
console.log(JSON.stringify({ kontrol, jembatan: j }, null, 2));

const cek = (nama: string, aktual: number, harap: number) => {
  if (aktual !== harap) {
    console.error(`GAGAL ${nama}: ${aktual} !== ${harap}`);
    process.exitCode = 1;
  } else {
    console.log(`OK ${nama}: ${aktual}`);
  }
};
cek('selisih', j.selisih, -104738887); // PR #52: pembayaran terverifikasi kini melebihi acuan Jan-Sep (3 pembayaran Okt 2026)
cek('selisih==kontrol', j.selisih, kontrol.selisihRekonsiliasi);
cek('acuanTanpaPembayaran.total', j.acuanTanpaPembayaran.total, 56577613);
cek('acuanTanpaPembayaran.baris', j.acuanTanpaPembayaran.jumlahBaris, 21);
cek('pembayaranTanpaAcuan.total', j.pembayaranTanpaAcuan.total, 161316500); // PR #52: 2x 2025 (28.392.500) + 3x Okt 2026 (132.924.000)
cek('pembayaranTanpaAcuan.baris', j.pembayaranTanpaAcuan.jumlahBaris, 5);
cek('sisaTakTerjelaskan', j.sisaTakTerjelaskan, 0);
cek('pasangan.jumlahBarisAcuan', j.pasangan.jumlahBarisAcuan, 40);
cek('pasangan.jumlahPembayaran', j.pasangan.jumlahPembayaran, 40);
const bmn = j.acuanTanpaPembayaran.perKodeAkun.find((r) => r.kodeAkun === '425122');
const dinas = j.acuanTanpaPembayaran.perKodeAkun.find((r) => r.kodeAkun === '425151');
cek('BMN 425122', bmn?.total ?? -1, 51350000);
cek('BMN baris', bmn?.jumlahBaris ?? -1, 2);
cek('Rumah dinas 425151', dinas?.total ?? -1, 5227613);
cek('Rumah dinas baris', dinas?.jumlahBaris ?? -1, 19);
// Koreksi Adlibs → Fungsional (2026-11-16): Taspen 001 (Rp1.550.000) dan
// BI 5592 (Rp1.000.000) kini Fungsional di kontrak + layanan + tagihan,
// sama seperti acuan Keuangan (ACU-015/ACU-040 sudah 425531). Pasangan
// beda-kode 425531/425131 pun hilang — tersisa hanya entri denda.
const adlibs = j.pasanganBedaKode.find((b) => b.kodeAcuan === '425531' && b.kodeTagihan === '425131');
cek('Adlibs beda-kode tidak ada', adlibs === undefined ? 0 : 1, 0);
cek('pasanganBedaKode hanya denda', j.pasanganBedaKode.length, 1);
// Klasifikasi kedua kontrak setelah koreksi.
const k001 = DATA_NYATA.kontrak.find((k) => k.id === '001/PKS/DIR.LPU/01/2026');
const k5592 = DATA_NYATA.kontrak.find((k) => k.id === '5592/PKS/RRI.PLB/06/2026');
cek('kontrak 001 Fungsional', k001?.jenisPnBP === 'Fungsional' ? 1 : 0, 1);
cek('kontrak 5592 Fungsional', k5592?.jenisPnBP === 'Fungsional' ? 1 : 0, 1);
cek('layanan 001 kode 425531', k001?.layanan[0]?.kodeAkun === '425531' ? 1 : 0, 1);
cek('layanan 5592 kode 425531', k5592?.layanan[0]?.kodeAkun === '425531' ? 1 : 0, 1);
const t001 = DATA_NYATA.tagihan.find((t) => t.id === 'TGH-001-PKS-DIR-LPU-01-2026');
const t5592 = DATA_NYATA.tagihan.find((t) => t.id === 'TGH-026-RRI-PLB-PKS-F-06-2026');
cek('tagihan 001 kode 425531', t001?.kodeAkun === '425531' ? 1 : 0, 1);
cek('tagihan 5592 kode 425531', t5592?.kodeAkun === '425531' ? 1 : 0, 1);
cek('kontrak Fungsional jumlah', DATA_NYATA.kontrak.filter((k) => k.jenisPnBP === 'Fungsional').length, 25);
cek('kontrak Fungsional nilai', DATA_NYATA.kontrak.filter((k) => k.jenisPnBP === 'Fungsional').reduce((s, k) => s + k.nilaiKontrak, 0), 83780000);
// Split bulanan (basis bulan terbit tagihan): Jan Fungsional +1.550.000,
// Jun Fungsional +1.000.000 dibanding sebelum koreksi.
const tagihanBulan = (bln: string, kode: string) =>
  DATA_NYATA.tagihan
    .filter((t) => t.tanggalTerbit.slice(0, 7) === bln && t.kodeAkun === kode)
    .reduce((s, t) => s + t.nilai, 0);
cek('Jan 2026 tagihan Fungsional', tagihanBulan('2026-01', '425531'), 1820000);
cek('Jan 2026 tagihan Umum', tagihanBulan('2026-01', '425131'), 18558000);
cek('Jun 2026 tagihan Fungsional', tagihanBulan('2026-06', '425531'), 14050000);
cek('Jun 2026 tagihan Umum', tagihanBulan('2026-06', '425131'), 3056000);
// Denda 425839 total Rp904.380 = 3 baris terpasang via NTPN (Rp724.000)
// + 1 baris tanpa NTPN, ACU-010 (Rp180.380). Baris tanpa NTPN tidak bisa
// dipasangkan secara mekanis — ia tercatat di acuanTanpaNtpn, dan
// nilainya persis menutup selisih pasangan ACU-009 (−Rp180.380).
cek('acuanTanpaNtpn.total', j.acuanTanpaNtpn.total, 180380);
cek('acuanTanpaNtpn.baris', j.acuanTanpaNtpn.jumlahBaris, 1);
cek('pasangan.selisih', j.pasangan.selisih, -180380);
cek('dendaTertanam.total', j.dendaTertanam.total, 724000);
cek('dendaTertanam.baris', j.dendaTertanam.jumlahBaris, 3);
const dendaBeda = j.pasanganBedaKode.find((b) => b.kodeAcuan === '425839' && b.kodeTagihan === '425531');
cek('denda beda-kode baris', dendaBeda?.jumlahBaris ?? -1, 3);
cek('denda beda-kode totalAcuan', dendaBeda?.totalAcuan ?? -1, 724000);

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
cek('selisih', j.selisih, 28185113);
cek('selisih==kontrol', j.selisih, kontrol.selisihRekonsiliasi);
cek('acuanTanpaPembayaran.total', j.acuanTanpaPembayaran.total, 56577613);
cek('acuanTanpaPembayaran.baris', j.acuanTanpaPembayaran.jumlahBaris, 21);
cek('pembayaranTanpaAcuan.total', j.pembayaranTanpaAcuan.total, 28392500);
cek('pembayaranTanpaAcuan.baris', j.pembayaranTanpaAcuan.jumlahBaris, 2);
cek('sisaTakTerjelaskan', j.sisaTakTerjelaskan, 0);
cek('pasangan.jumlahBarisAcuan', j.pasangan.jumlahBarisAcuan, 40);
cek('pasangan.jumlahPembayaran', j.pasangan.jumlahPembayaran, 40);
const bmn = j.acuanTanpaPembayaran.perKodeAkun.find((r) => r.kodeAkun === '425122');
const dinas = j.acuanTanpaPembayaran.perKodeAkun.find((r) => r.kodeAkun === '425151');
cek('BMN 425122', bmn?.total ?? -1, 51350000);
cek('BMN baris', bmn?.jumlahBaris ?? -1, 2);
cek('Rumah dinas 425151', dinas?.total ?? -1, 5227613);
cek('Rumah dinas baris', dinas?.jumlahBaris ?? -1, 19);
const adlibs = j.pasanganBedaKode.find((b) => b.kodeAcuan === '425531' && b.kodeTagihan === '425131');
cek('Adlibs baris', adlibs?.jumlahBaris ?? -1, 2);
cek('Adlibs totalAcuan', adlibs?.totalAcuan ?? -1, 2550000);
cek('Adlibs totalPembayaran', adlibs?.totalPembayaran ?? -1, 2550000);
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

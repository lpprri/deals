// Verifikasi tindak lanjut "tanpa login klien" (KOREKSI 2026-11-15):
// - 6 total kontrol dari DATA_NYATA (nilai baru per PR #52, 2026-11-16:
//   tagihan/pembayaran/piutang/denda berubah karena penggantian data
//   kontrak; nilai kontrak + PKS aktif + acuan TIDAK berubah).
// - Lookup Lacak: nomor PKS nyata -> kontrak benar; nomor tagihan nyata
//   -> kontrak yang sama; nomor salah -> tidak ditemukan; pencocokan
//   tidak case-sensitive.
// - Antrean pengajuanKlien di seed mulai kosong (submission publik baru
//   masuk setelah form dipakai).
import { DATA_NYATA } from '../src/lib/seedNyata';
import { hitungTotalKontrol } from '../src/lib/derive';
import { cariKerjaSama } from '../src/modules/Lacak';

const k = hitungTotalKontrol(DATA_NYATA);
const cek = (nama: string, aktual: number, harap: number) => {
  if (aktual !== harap) {
    console.error(`GAGAL ${nama}: ${aktual} !== ${harap}`);
    process.exitCode = 1;
  } else console.log(`OK ${nama}: ${aktual}`);
};
cek('nilaiKontrak', k.nilaiKontrak, 441863375);
cek('totalTagihan', k.totalTagihan, 376414124);
cek('totalPembayaranTerverifikasi', k.totalPembayaranTerverifikasi, 362329255);
cek('sisaPiutang', k.sisaPiutang, 14084869);
cek('totalDenda', k.totalDenda, 6219250);
cek('totalPenerimaanAcuan', k.totalPenerimaanAcuan, 257590368);
console.log('pengajuanKlien di seed:', DATA_NYATA.pengajuanKlien.length);
if (DATA_NYATA.pengajuanKlien.length !== 0) {
  console.error('GAGAL pengajuanKlien di seed harus 0');
  process.exitCode = 1;
} else console.log('OK pengajuanKlien di seed 0 (antrean publik mulai kosong)');

const cekLacak = (
  kode: string,
  harapNomorPks: string | null,
  keterangan: string,
) => {
  const hasil = cariKerjaSama(DATA_NYATA, kode);
  if (harapNomorPks === null) {
    if (hasil !== null) {
      console.error(`GAGAL Lacak ${keterangan}: harus null, dapat ${hasil.kontrak.nomorPks}`);
      process.exitCode = 1;
    } else console.log(`OK Lacak ${keterangan}: tidak ditemukan`);
    return;
  }
  if (hasil === null) {
    console.error(`GAGAL Lacak ${keterangan}: harus ${harapNomorPks}, dapat null`);
    process.exitCode = 1;
    return;
  }
  if (hasil.kontrak.nomorPks !== harapNomorPks) {
    console.error(
      `GAGAL Lacak ${keterangan}: harus ${harapNomorPks}, dapat ${hasil.kontrak.nomorPks}`,
    );
    process.exitCode = 1;
    return;
  }
  if (hasil.tagihan.length === 0) {
    console.error(`GAGAL Lacak ${keterangan}: kontrak tanpa tagihan`);
    process.exitCode = 1;
    return;
  }
  console.log(
    `OK Lacak ${keterangan}: ${hasil.kontrak.nomorPks} (nilai Rp${hasil.kontrak.nilaiKontrak}, ${hasil.tagihan.length} tagihan, ${hasil.dokumen.length} dokumen, ${hasil.pembayaran.length} pembayaran)`,
  );
};

// Nomor PKS nyata (PT PLN UPT Palembang, Rp270.000).
cekLacak('0603/PKS/RRI.PLB/01/2026', '0603/PKS/RRI.PLB/01/2026', 'nomor PKS');
// Nomor tagihan nyata milik kontrak yang sama (jalur 2).
cekLacak('001/RRI.PLB/PKS.F/01/2026', '0603/PKS/RRI.PLB/01/2026', 'nomor tagihan');
// Huruf kecil harus tetap cocok (normalisasi case-insensitive).
cekLacak('0603/pks/rri.plb/01/2026', '0603/PKS/RRI.PLB/01/2026', 'nomor PKS huruf kecil');
// Nomor salah -> tidak ditemukan.
cekLacak('TIDAK-ADA/000', null, 'nomor salah');
// PT Taspen — kontrak dengan Kwitansi "Belum Ada" (jalur peringatan).
const taspen = cariKerjaSama(DATA_NYATA, '001/PKS/DIR.LPU/01/2026');
if (taspen === null) {
  console.error('GAGAL Lacak Taspen: harus ditemukan');
  process.exitCode = 1;
} else {
  const menunggu = taspen.dokumen.filter(
    (d) =>
      (d.jenisDokumen.includes('Kwitansi') ||
        d.jenisDokumen.includes('Bukti Siaran')) &&
      d.status !== 'Ada',
  );
  if (menunggu.length === 0) {
    console.error('GAGAL Lacak Taspen: harus ada Kwitansi/Bukti Siaran menunggu');
    process.exitCode = 1;
  } else {
    console.log(
      `OK Lacak Taspen: ${menunggu.length} dokumen menunggu diterbitkan (${menunggu.map((d) => d.jenisDokumen).join(', ')})`,
    );
  }
}

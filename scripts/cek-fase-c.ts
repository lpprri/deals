// Verifikasi Fase C: hitung ulang total kontrol dari DATA_NYATA.
// Semua total harus sama persis dengan sebelum Fase C.
import { DATA_NYATA } from '../src/lib/seedNyata';
import { hitungTotalKontrol } from '../src/lib/derive';

const k = hitungTotalKontrol(DATA_NYATA);
console.log(JSON.stringify(k, null, 2));
const cek = (nama: string, aktual: number, harap: number) => {
  if (aktual !== harap) {
    console.error(`GAGAL ${nama}: ${aktual} !== ${harap}`);
    process.exitCode = 1;
  } else console.log(`OK ${nama}: ${aktual}`);
};
cek('nilaiKontrak', k.nilaiKontrak, 441863375);
cek('totalTagihan', k.totalTagihan, 379068204);
cek('totalPembayaranTerverifikasi', k.totalPembayaranTerverifikasi, 229405255);
cek('sisaPiutang', k.sisaPiutang, 149662949);
cek('totalDenda', k.totalDenda, 8873330);
cek('totalPenerimaanAcuan', k.totalPenerimaanAcuan, 257590368);
// Koleksi baru Fase C mulai kosong di seed.
console.log('tiket:', DATA_NYATA.tiket.length, 'umpanBalik:', DATA_NYATA.umpanBalik.length, 'artikelKB:', DATA_NYATA.artikelKB.length, 'pengajuanKlien:', DATA_NYATA.pengajuanKlien.length);

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

// Employee Rank (keputusan 2026-11-15): ranking memakai operatorPenutup,
// BUKAN penanggungJawab (itu PIC klien). Kontrak impor belum punya
// operatorPenutup — ranking 2026 harus KOSONG dan 40 kontrak terhitung
// sebagai tanpa operator; kontrak yang diberi operatorPenutup harus muncul.
import { rankingOperator, ringkasanPeriodeRanking } from '../src/lib/derive';
const ring2026 = ringkasanPeriodeRanking(DATA_NYATA, 'tahun', '2026');
cek('ranking2026.jumlahKontrak', ring2026.jumlahKontrak, 40);
cek('ranking2026.jumlahTanpaOperator', ring2026.jumlahTanpaOperator, 40);
const rank2026 = rankingOperator(DATA_NYATA, 'tahun', '2026');
if (rank2026.length !== 0) {
  console.error(`GAGAL ranking2026: berisi ${rank2026.length} baris, harus 0 (belum ada operatorPenutup)`);
  process.exitCode = 1;
} else console.log('OK ranking2026 kosong (belum ada operatorPenutup)');
const idx2026 = DATA_NYATA.kontrak.findIndex((k) =>
  k.tanggalMulai.startsWith('2026'),
);
const denganOperator = {
  ...DATA_NYATA,
  kontrak: DATA_NYATA.kontrak.map((k, i) =>
    i === idx2026 ? { ...k, operatorPenutup: 'Operator Uji' } : k,
  ),
};
const rankUji = rankingOperator(denganOperator, 'tahun', '2026');
if (rankUji.length !== 1 || rankUji[0].label !== 'Operator Uji') {
  console.error(`GAGAL ranking dengan operator: ${JSON.stringify(rankUji)}`);
  process.exitCode = 1;
} else console.log(`OK ranking dengan operator: ${rankUji[0].label} Rp${rankUji[0].nilai}`);
const ringUji = ringkasanPeriodeRanking(denganOperator, 'tahun', '2026');
cek('rankingUji.jumlahTanpaOperator', ringUji.jumlahTanpaOperator, 39);

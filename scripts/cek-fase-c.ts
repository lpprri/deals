// Verifikasi Fase C: hitung ulang total kontrol dari DATA_NYATA.
// Nilai kontrak + PKS aktif + acuan harus sama persis dengan sebelum
// Fase C; tagihan/pembayaran/piutang/denda memakai nilai baru PR #52
// (penggantian data kontrak 2026-11-16).
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
cek('totalTagihan', k.totalTagihan, 376414124);
cek('totalPembayaranTerverifikasi', k.totalPembayaranTerverifikasi, 362329255);
cek('sisaPiutang', k.sisaPiutang, 14084869);
cek('totalDenda', k.totalDenda, 6219250);
cek('totalPenerimaanAcuan', k.totalPenerimaanAcuan, 257590368);
// Koleksi baru Fase C mulai kosong di seed.
console.log('tiket:', DATA_NYATA.tiket.length, 'umpanBalik:', DATA_NYATA.umpanBalik.length, 'artikelKB:', DATA_NYATA.artikelKB.length, 'pengajuanKlien:', DATA_NYATA.pengajuanKlien.length);

// Employee Rank (keputusan 2026-11-15): ranking memakai operatorPenutup,
// BUKAN penanggungJawab (itu PIC klien). CATATAN PR #52: ekspektasi lama
// di sini ("kontrak impor belum punya operatorPenutup", ranking 2026
// kosong, jumlahTanpaOperator 40/39) kedaluwarsa sejak PR #26 (atribusi
// acak 2026-11-15) — semua kontrak kini punya operatorPenutup. Ekspektasi
// baru mengikuti distribusi PR #26 (juga diasersi cek-atribusi-acak.ts):
// ranking 2026 = 40 kontrak 2026; Darojad (Nadya) + VGreen (A. Kadir)
// tidak masuk 2026 karena tanggalTandaTangan-nya 2025.
import { rankingOperator, ringkasanPeriodeRanking } from '../src/lib/derive';
const ring2026 = ringkasanPeriodeRanking(DATA_NYATA, 'tahun', '2026');
cek('ranking2026.jumlahKontrak', ring2026.jumlahKontrak, 40);
cek('ranking2026.jumlahTanpaOperator', ring2026.jumlahTanpaOperator, 0);
const rank2026 = rankingOperator(DATA_NYATA, 'tahun', '2026');
cek('ranking2026: 5 baris operator', rank2026.length, 5);
cek('ranking2026: Meliyana teratas', rank2026[0].label === 'Meliyana' ? rank2026[0].nilai : -1, 166805000);
cek('ranking2026: Meliyana 9 kontrak', rank2026[0].jumlahKontrak, 9);
cek('ranking2026: Nadya nilai (Darojad 2025 di luar)', rank2026.find((r) => r.label === 'Nadya Pratita')?.nilai ?? -1, 61777292);
cek('ranking2026: Nadya 7 kontrak', rank2026.find((r) => r.label === 'Nadya Pratita')?.jumlahKontrak ?? -1, 7);
cek('ranking2026: A. Kadir nilai (VGreen 2025 di luar)', rank2026.find((r) => r.label === 'A. Kadir Kurniawan')?.nilai ?? -1, 35006000);
cek('ranking2026: A. Kadir 7 kontrak', rank2026.find((r) => r.label === 'A. Kadir Kurniawan')?.jumlahKontrak ?? -1, 7);
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
const uji = rankUji.find((r) => r.label === 'Operator Uji');
cek('ranking dengan operator: 6 baris', rankUji.length, 6);
cek('ranking dengan operator: Operator Uji Rp270.000', uji?.nilai ?? -1, 270000);
cek('ranking dengan operator: Operator Uji 1 kontrak', uji?.jumlahKontrak ?? -1, 1);
cek('ranking dengan operator: Dessi tinggal 7 (0603 dipindah)', rankUji.find((r) => r.label === 'Dessi Maya Sari')?.jumlahKontrak ?? -1, 7);
cek('ranking dengan operator: Dessi Rp34.462.000', rankUji.find((r) => r.label === 'Dessi Maya Sari')?.nilai ?? -1, 34462000);
const ringUji = ringkasanPeriodeRanking(denganOperator, 'tahun', '2026');
cek('rankingUji.jumlahTanpaOperator', ringUji.jumlahTanpaOperator, 0);

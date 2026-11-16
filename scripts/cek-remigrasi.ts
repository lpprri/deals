// Verifikasi re-migrasi data kontrak 2026 (PR #53) — TANPA Firestore.
// Menguji logika murni di src/lib/remigrasiRencana.ts:
// - cakupan koleksi PERSIS 5 (klien, kontrak, tagihan, pembayaran, denda)
// - guard baru sekali jalan, terpisah dari guard migrasi pertama
// - prakondisi membatalkan bila hitungan live tidak cocok
// - operatorPenutup + tanggalTandaTangan dibawa dari live
// - 2 kontrak 2025 ada sesudah migrasi; total kontrol sesudah = angka PR #52
// - tidak ada tulis ke koleksi di luar cakupan (rencana tulis hanya 5 kunci)
// Keluar bukan-nol bila ada asersi gagal.
import { DATA_NYATA } from '../src/lib/seedNyata';
import { hitungTotalKontrol } from '../src/lib/derive';
import {
  HITUNGAN_LIVE_DIHARAPKAN,
  HITUNGAN_SEED,
  ID_GUARD_MIGRASI_PERTAMA,
  ID_GUARD_REMIGRASI,
  KOLEKSI_REMIGRASI,
  KONTRAK_2025_WAJIB,
  TOTAL_KONTROL_TARGET,
  gabungkanAtribusiLive,
  hitungTotalRemigrasi,
  periksaPrakondisi,
  rencanaTulis,
  verifikasiHasil,
} from '../src/lib/remigrasiRencana';
import type { Kontrak } from '../src/lib/types';

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};

// ---------- cakupan PERSIS 5 koleksi ----------
cek(
  'cakupan PERSIS 5 koleksi',
  KOLEKSI_REMIGRASI.length === 5 &&
    KOLEKSI_REMIGRASI.join(',') === 'klien,kontrak,tagihan,pembayaran,denda',
  KOLEKSI_REMIGRASI.join(','),
);
const diLuarCakupan = [
  'sewa', 'pengajuan', 'penerimaanAcuan', 'dokumen', 'prospect',
  'quotation', 'order', 'meeting', 'tiket', 'umpanBalik', 'artikelKB',
  'faq', 'pesan', 'audit', 'userProfiles', 'meta',
];
cek(
  'tidak ada koleksi luar cakupan dalam rencana',
  !KOLEKSI_REMIGRASI.some((k) =>
    (diLuarCakupan as string[]).includes(k),
  ),
);

// ---------- guard sekali jalan, terpisah dari migrasi pertama ----------
cek('guard baru bernama migrasi-kontrak-2026', ID_GUARD_REMIGRASI === 'migrasi-kontrak-2026');
cek(
  'guard baru BERBEDA dari guard migrasi pertama',
  ID_GUARD_REMIGRASI !== ID_GUARD_MIGRASI_PERTAMA,
  `${ID_GUARD_REMIGRASI} vs ${ID_GUARD_MIGRASI_PERTAMA}`,
);

// ---------- prakondisi ----------
cek(
  'prakondisi lolos bila hitungan live cocok',
  periksaPrakondisi({ ...HITUNGAN_LIVE_DIHARAPKAN }).length === 0,
);
for (const kunci of KOLEKSI_REMIGRASI) {
  const salah = { ...HITUNGAN_LIVE_DIHARAPKAN, [kunci]: HITUNGAN_LIVE_DIHARAPKAN[kunci] + 1 };
  const masalah = periksaPrakondisi(salah);
  cek(
    `prakondisi BATAL bila ${kunci} tidak cocok`,
    masalah.length === 1 && masalah[0].includes(kunci),
    masalah.join(' '),
  );
}
cek(
  'prakondisi BATAL bila live kosong (belum dimigrasi)',
  periksaPrakondisi({ klien: 0, kontrak: 0, tagihan: 0, pembayaran: 0, denda: 0 }).length === 5,
);

// ---------- rencana tulis: hapus 172, tulis 174, hanya 5 koleksi ----------
const rencana = rencanaTulis();
cek('rencana tulis 5 koleksi', rencana.length === 5);
cek(
  'rencana hapus total 172',
  rencana.reduce((s, r) => s + r.hapus, 0) === 172,
  `${rencana.reduce((s, r) => s + r.hapus, 0)}`,
);
cek(
  'rencana tulis total 174',
  rencana.reduce((s, r) => s + r.tulis, 0) === 174,
  `${rencana.reduce((s, r) => s + r.tulis, 0)}`,
);
cek(
  'rencana hapus per koleksi = hitungan live diharapkan',
  rencana.every((r) => r.hapus === HITUNGAN_LIVE_DIHARAPKAN[r.koleksi]),
);
cek(
  'rencana tulis per koleksi = hitungan seed',
  rencana.every((r) => r.tulis === HITUNGAN_SEED[r.koleksi]),
);

// ---------- atribusi dibawa dari live ----------
const seedDua: Kontrak[] = DATA_NYATA.kontrak.slice(0, 2);
const liveDua = [
  { id: seedDua[0].id, operatorPenutup: 'Meliyana', tanggalTandaTangan: '2026-01-19' },
  { id: seedDua[1].id, operatorPenutup: undefined, tanggalTandaTangan: undefined },
];
const gabung = gabungkanAtribusiLive(seedDua, liveDua);
cek(
  'atribusi live MENANG atas seed (operatorPenutup)',
  gabung[0].operatorPenutup === 'Meliyana',
  `${gabung[0].operatorPenutup}`,
);
cek(
  'atribusi live MENANG atas seed (tanggalTandaTangan)',
  gabung[0].tanggalTandaTangan === '2026-01-19',
  `${gabung[0].tanggalTandaTangan}`,
);
cek(
  'atribusi seed dipertahankan bila live kosong',
  gabung[1].operatorPenutup === seedDua[1].operatorPenutup &&
    gabung[1].tanggalTandaTangan === seedDua[1].tanggalTandaTangan,
);
cek(
  'semua 42 kontrak seed punya operatorPenutup',
  DATA_NYATA.kontrak.every((k) => typeof k.operatorPenutup === 'string' && k.operatorPenutup.length > 0),
);
cek(
  'semua 42 kontrak seed punya tanggalTandaTangan',
  DATA_NYATA.kontrak.every((k) => typeof k.tanggalTandaTangan === 'string' && k.tanggalTandaTangan.length > 0),
);
const gabungPenuh = gabungkanAtribusiLive(DATA_NYATA.kontrak, DATA_NYATA.kontrak);
cek(
  'gabung live=seed menghasilkan kontrak identik',
  gabungPenuh.every(
    (k, i) =>
      k.operatorPenutup === DATA_NYATA.kontrak[i].operatorPenutup &&
      k.tanggalTandaTangan === DATA_NYATA.kontrak[i].tanggalTandaTangan,
  ),
);

// ---------- verifikasi hasil atas seed (sesudah migrasi) ----------
cek('verifikasiHasil(seed) lolos tanpa masalah', verifikasiHasil(DATA_NYATA).length === 0, verifikasiHasil(DATA_NYATA).join(' | '));
const totalSeed = hitungTotalRemigrasi(DATA_NYATA);
cek('total seed: nilai kontrak 441.863.375', totalSeed.nilaiKontrak === TOTAL_KONTROL_TARGET.nilaiKontrak, `Rp${totalSeed.nilaiKontrak.toLocaleString('id-ID')}`);
cek('total seed: pembayaran terverifikasi 362.329.255', totalSeed.totalPembayaranTerverifikasi === TOTAL_KONTROL_TARGET.totalPembayaranTerverifikasi, `Rp${totalSeed.totalPembayaranTerverifikasi.toLocaleString('id-ID')}`);
cek('total seed: sisa piutang 14.084.869', totalSeed.sisaPiutang === TOTAL_KONTROL_TARGET.sisaPiutang, `Rp${totalSeed.sisaPiutang.toLocaleString('id-ID')}`);
cek('total seed: denda 6.219.250', totalSeed.totalDenda === TOTAL_KONTROL_TARGET.totalDenda, `Rp${totalSeed.totalDenda.toLocaleString('id-ID')}`);
cek(
  'hitungTotalRemigrasi = hitungTotalKontrol (4 total yang sama)',
  (() => {
    const k = hitungTotalKontrol(DATA_NYATA);
    return (
      totalSeed.nilaiKontrak === k.nilaiKontrak &&
      totalSeed.totalPembayaranTerverifikasi === k.totalPembayaranTerverifikasi &&
      totalSeed.sisaPiutang === k.sisaPiutang &&
      totalSeed.totalDenda === k.totalDenda
    );
  })(),
);

// ---------- 2 kontrak 2025 wajib ada ----------
for (const nomor of KONTRAK_2025_WAJIB) {
  cek(`kontrak 2025 ${nomor} ada di seed`, DATA_NYATA.kontrak.some((k) => k.id === nomor));
}
const darojad = DATA_NYATA.kontrak.find((k) => k.id === '016/PKS/DIR.LPU/06/2025');
cek('Darojad nilai 51.438.750', darojad?.nilaiKontrak === 51438750, `Rp${darojad?.nilaiKontrak}`);
const vgreen = DATA_NYATA.kontrak.find((k) => k.id === '027/RRI.PLB/PKS.U/06/2025');
cek('PT VGreen nilai 33.738.750', vgreen?.nilaiKontrak === 33738750, `Rp${vgreen?.nilaiKontrak}`);

// ---------- verifikasi MENOLAK data yang dirusak ----------
const tanpa2025 = { ...DATA_NYATA, kontrak: DATA_NYATA.kontrak.filter((k) => k.id !== '016/PKS/DIR.LPU/06/2025') };
cek(
  'verifikasi MENOLAK bila kontrak 2025 hilang',
  verifikasiHasil(tanpa2025).some((m) => m.includes('016/PKS/DIR.LPU/06/2025')),
  verifikasiHasil(tanpa2025).join(' | '),
);
const tanpaBayar = { ...DATA_NYATA, pembayaran: DATA_NYATA.pembayaran.slice(0, 44) };
cek(
  'verifikasi MENOLAK bila pembayaran kurang (44, bukan 45)',
  verifikasiHasil(tanpaBayar).some((m) => m.includes('pembayaran')),
  verifikasiHasil(tanpaBayar).join(' | '),
);
const nilaiSalah = {
  ...DATA_NYATA,
  kontrak: DATA_NYATA.kontrak.map((k, i) => (i === 0 ? { ...k, nilaiKontrak: k.nilaiKontrak + 1000 } : k)),
};
cek(
  'verifikasi MENOLAK bila total kontrak berubah',
  verifikasiHasil(nilaiSalah).some((m) => m.includes('nilaiKontrak')),
  verifikasiHasil(nilaiSalah).join(' | '),
);

// ---------- klien seed: Bank Indonesia tetap 1 dokumen (KLN-012) ----------
// PR #52: baris file untuk Bank Indonesia saling bertentangan, jadi data
// klien lama dipertahankan. Migrasi menulis seed apa adanya — tidak ada
// logika khusus klien di re-migrasi.
cek(
  'klien Bank Indonesia 1 dokumen (KLN-012)',
  DATA_NYATA.klien.filter((k) => k.id === 'KLN-012').length === 1,
);
cek('klien seed 33', DATA_NYATA.klien.length === 33, `${DATA_NYATA.klien.length}`);

if (gagal > 0) {
  console.error(`\n${gagal} asersi GAGAL.`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');

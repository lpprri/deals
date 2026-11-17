// Cek tampilan baru tabel Contract (PR tampilan-baru-contract + PR
// contract-signing-date + PR filter-contract-status + PR
// remaining-days-contract + PR kolom-status-pembayaran + PR
// tambah-kolom-nilai-contract + PR persentase-dokumen-contract): 18
// kolom — No.,
// Contract & Reference Number (gabungan, keputusan pengguna 16/11/2026
// 13:35 WIB), Contract Title, Signing Date (= Creation Date per keputusan
// pengguna 16/11/2026, dari tanggalTandaTangan dengan fallback
// tanggalMulai), Client, Service Type, Service Detail (nama layanan,
// gabung "; " — header diganti dari "Service / BMN Detail" per keputusan
// pengguna 16/11/2026 13:58 WIB), Contract Period, Remaining Days
// (hitung mundur sampai tanggalSelesai, "Completed" bila status Selesai —
// keputusan pengguna 16/11/2026 15:29 WIB), Payment Status (kolom
// kembali ke English per keputusan pengguna 17/11/2026 08:34 WIB —
// membatalkan label Indonesia PR #64; definisi status DIREDEFINISI
// 17/11/2026 08:33 WIB: Partially-Paid = dibayar == Piutang realisasi,
// ditambah Insufficient Payment), Payment Deadline, Contract Value,
// Fine Value, Total Revenue (header diganti dari
// "Total Contract Value + Fine" 17/11/2026 09:06 WIB), Realisation,
// Receivable Value, Remaining Value (header diganti dari
// "Remaining Contract Value" 17/11/2026 09:07 WIB); urutan blok nilai
// DIURUT ULANG per keputusan pengguna 17/11/2026 09:24 WIB — Contract
// Value pindah ke awal blok (sesudah Payment Deadline), Realisation
// dan Receivable Value bertukar posisi; kolom "Document Completeness"
// ditambahkan sebagai kolom TERAKHIR (ke-18) per keputusan pengguna
// 17/11/2026 09:26 WIB — persentase item checklist "Ada" / total item
// (7 normal, 8 bila Overdue), format sama dengan Realisation; nomor
// urut "No." mengikuti urutan tampil sesudah filter + sort (keputusan
// pengguna 16/11/2026 13:31 WIB), filter Client Type + PNBP Type +
// Payment Status + Cooperation Status (keputusan pengguna 16/11/2026
// 13:56 WIB), sort 4 kunci (Signing Date / End Date / Contract Value /
// Remaining Days — opsi ke-4 keputusan pengguna 16/11/2026 15:37 WIB,
// TIDAK ada sort baru untuk 6 kolom nilai), tanpa Account Code dan
// tanpa Status di tabel; total kontrol tidak berubah.
import * as fs from 'node:fs';
import { DATA_NYATA } from '../src/lib/seedNyata';
import { dibayarTerverifikasi, hitungTotalKontrol } from '../src/lib/derive';
import { selisihHari } from '../src/lib/format';
import {
  formatPersenRealisasi,
  piutangRealisasi,
  realisasiKontrak,
  sisaKontrakRealisasi,
  totalDendaKontrak,
} from '../src/lib/realisasi';
import type { Pembayaran, Tagihan } from '../src/lib/types';
import {
  daftarDokumenKontrak,
  kelengkapanDokumen,
} from '../src/lib/dokumenKontrak';
import {
  detailLayananKontrak,
  jatuhTempoPembayaranKontrak,
  jenisKlienYangAda,
  judulKontrak,
  labelArahUrutKontrak,
  nomorReferensiKontrak,
  sisaHariKerjaSama,
  statusKerjaSamaKontrak,
  statusPembayaranKontrak,
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
// Hitungan Fungsional = 25 sesudah koreksi Adlibs PR #56 (Taspen 001 +
// BI 5592 pindah ke Fungsional; dulu 23).
const fungsional = kontrak.filter((k) => k.jenisPnBP === 'Fungsional');
cek('filter Fungsional = 25 kontrak', fungsional.length === 25, `${fungsional.length}`);
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
  'nomor 25 (terakhir) sesudah filter Fungsional + sort nilai = 1158 (Rp180.000)',
  fungNilaiDesc.length === 25 &&
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

// ---------- kolom Service Detail (nama layanan, gabung "; ") ----------
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

// ---------- filter Payment Status (keputusan pengguna 16/11/2026 13:56 WIB,
// DIREDEFINISI pengguna 17/11/2026 08:33 WIB — menggantikan definisi
// PR #60 untuk Partially-Paid; ditambah Insufficient Payment) ----------
// Aturan BARU (helper statusPembayaranKontrak, hari ini = 2026-11-16);
// pembandingnya NILAI KONTRAK + DENDA dan PIUTANG (realisasi), bukan
// nilai tagihan:
// Paid = dibayar Terverifikasi >= nilaiKontrak + total denda;
// Partially-Paid = dibayar == Piutang ((nilaiKontrak + total denda) x
// % Realisasi) DALAM toleransi |dibayar - Piutang| <= Rp1, DAN Piutang
// < nilaiKontrak + total denda — klien sudah membayar lunas nilai
// kontrak yang SUDAH dilaksanakan (5 sewa multi-tahun: 1051/1052/1053
// 1/3, 016/027 2/3);
// Insufficient Payment = 0 < dibayar < nilaiKontrak + total denda DAN
// dibayar != Piutang — 6 kontrak yang pokoknya lunas tetapi dendanya
// belum dibayar (1744, 2919, 2920, 7052, 7054, 7060); termasuk dibayar
// > Piutang tapi < penuh (tidak ada kasusnya di seed);
// Overdue = dibayar 0 DAN ada tagihan lewat jatuh tempo;
// Unpaid = dibayar 0 DAN belum ada tagihan lewat jatuh tempo.
// Hanya pembayaran Terverifikasi yang dihitung. Urutan periksa: Paid,
// Partially-Paid, Insufficient Payment, lalu Overdue/Unpaid.
const HARI_INI = '2026-11-16';
const statusBayar = (nomor: string) =>
  statusPembayaranKontrak(
    cari(nomor),
    DATA_NYATA.tagihan,
    DATA_NYATA.pembayaran,
    DATA_NYATA.denda,
    HARI_INI,
  );
const hitungBayar = (s: string) =>
  kontrak.filter(
    (k) =>
      statusPembayaranKontrak(
        k,
        DATA_NYATA.tagihan,
        DATA_NYATA.pembayaran,
        DATA_NYATA.denda,
        HARI_INI,
      ) === s,
  ).length;
cek('payment status 0603 = Paid', statusBayar('0603/PKS/RRI.PLB/01/2026') === 'Paid');
cek(
  'payment status Taspen 001 = Paid',
  statusBayar('001/PKS/DIR.LPU/01/2026') === 'Paid',
);
cek(
  'payment status 1744 = Insufficient Payment (dibayar 15.000.000, piutang 15.900.000 = penuh; denda 900.000 belum dibayar)',
  statusBayar('1744/PKS/RRI.PLB/03/2026') === 'Insufficient Payment',
);
cek(
  'payment status 2919 = Insufficient Payment (dibayar 1.500.000, piutang 1.530.000 = penuh; denda 30.000 belum dibayar)',
  statusBayar('2919/PKS/RRI.PLB/04/2026') === 'Insufficient Payment',
);
cek(
  'payment status 2920 = Insufficient Payment (dibayar 1.000.000, piutang 1.020.000 = penuh; denda 20.000 belum dibayar)',
  statusBayar('2920/PKS/RRI.PLB/04/2026') === 'Insufficient Payment',
);
cek(
  'payment status 7052 = Insufficient Payment (dibayar 6.000.000, piutang 7.440.000 = penuh; denda 1.440.000 belum dibayar)',
  statusBayar('7052/PKS/RRI.PLB/07/2026') === 'Insufficient Payment',
);
cek(
  'payment status 7054 = Insufficient Payment (dibayar 7.904.292, piutang 9.801.322 = penuh; denda 1.897.030 belum dibayar)',
  statusBayar('7054/PKS/RRI.PLB/07/2026') === 'Insufficient Payment',
);
cek(
  'payment status 7060 = Insufficient Payment (dibayar 4.116.000, piutang 5.103.840 = penuh; denda 987.840 belum dibayar)',
  statusBayar('7060/PKS/RRI.PLB/07/2026') === 'Insufficient Payment',
);
cek(
  'payment status 1051 = Partially-Paid (dibayar == piutang 6.455.000 = 1/3 x 19.365.000)',
  statusBayar('1051/PKS/RRI.PLB/02/2026') === 'Partially-Paid',
);
cek(
  'payment status 1052 = Partially-Paid (dibayar == piutang 6.455.000 = 1/3 x 19.365.000)',
  statusBayar('1052/PKS/RRI.PLB/02/2026') === 'Partially-Paid',
);
cek(
  'payment status 1053 = Partially-Paid (dibayar == piutang 5.648.000 = 1/3 x 16.944.000)',
  statusBayar('1053/PKS/RRI.PLB/02/2026') === 'Partially-Paid',
);
cek(
  'payment status 016 VGreen = Partially-Paid (dibayar == piutang 34.292.500 = 2/3 x 51.438.750)',
  statusBayar('016/PKS/DIR.LPU/06/2025') === 'Partially-Paid',
);
cek(
  'payment status 027 Darojad = Partially-Paid (dibayar == piutang 22.492.500 = 2/3 x 33.738.750)',
  statusBayar('027/RRI.PLB/PKS.U/06/2025') === 'Partially-Paid',
);
cek(
  'payment status 018 = Unpaid (jatuh tempo 2026-12-31)',
  statusBayar('018/PKS/DIR.LPU/08/2026') === 'Unpaid',
);
cek(
  'payment status 10227 = Unpaid',
  statusBayar('10227/PKS/RRI.PLB/10/2026') === 'Unpaid',
);
cek(
  'payment status 11290 = Unpaid (jatuh tempo 2026-11-27)',
  statusBayar('11290/PKS/RRI.PLB/10/2026') === 'Unpaid',
);
cek('payment status Paid = 28', hitungBayar('Paid') === 28, `${hitungBayar('Paid')}`);
cek(
  'payment status Partially-Paid = 5 (sewa multi-tahun, dibayar == piutang)',
  hitungBayar('Partially-Paid') === 5,
  `${hitungBayar('Partially-Paid')}`,
);
cek(
  'payment status Insufficient Payment = 6 (pokok lunas, denda belum dibayar)',
  hitungBayar('Insufficient Payment') === 6,
  `${hitungBayar('Insufficient Payment')}`,
);
cek('payment status Unpaid = 3', hitungBayar('Unpaid') === 3, `${hitungBayar('Unpaid')}`);
cek(
  'payment status Overdue = 0 (jujur: 3 kontrak tanpa pembayaran semuanya belum jatuh tempo)',
  hitungBayar('Overdue') === 0,
  `${hitungBayar('Overdue')}`,
);

// ---------- kolom Payment Status (kembali ke English, keputusan pengguna
// 17/11/2026 08:34 WIB — membatalkan label Indonesia PR #64) ----------
// Helper label Indonesia labelStatusPembayaranKontrak DIHAPUS: sel tabel
// menampilkan nilai statusnya langsung (Paid / Unpaid / Partially-Paid /
// Insufficient Payment / Overdue). Nilai "Overdue" TIDAK BISA dites
// lewat baris tabel — saat ini tidak ada kontrak Overdue di seed (0,
// lihat asersi di atas) — nilai itu sendiri sudah English, jadi tidak
// ada pemetaan label yang perlu dites.
cek(
  'kolom Payment Status 0603 = Paid',
  statusBayar('0603/PKS/RRI.PLB/01/2026') === 'Paid',
);
cek(
  'kolom Payment Status 018 = Unpaid',
  statusBayar('018/PKS/DIR.LPU/08/2026') === 'Unpaid',
);
cek(
  'kolom Payment Status 1051 = Partially-Paid',
  statusBayar('1051/PKS/RRI.PLB/02/2026') === 'Partially-Paid',
);
cek(
  'kolom Payment Status 10227 = Unpaid',
  statusBayar('10227/PKS/RRI.PLB/10/2026') === 'Unpaid',
);
cek(
  'kolom Payment Status 1744 = Insufficient Payment',
  statusBayar('1744/PKS/RRI.PLB/03/2026') === 'Insufficient Payment',
);
// Denda tertanam di tagihan.nilai, TETAPI Σ tagihan == nilaiKontrak +
// total denda hanya di 34/42 kontrak: 7 kontrak punya tagihan yang
// nilainya memang lebih kecil dari nilai kontrak (5 sewa multi-tahun —
// 1051/1052/1053 tagihan tahun pertama, 016/027 tagihan 2/3 nilai —
// plus 018 dan 10227 yang Piutang di file lebih kecil dari nilai
// kontrak), dan 7054 selisih Rp1 pembulatan impor. Justru karena itu
// rumus helper memakai nilaiKontrak + denda secara harfiah (bukan
// Σ tagihan): memakai Σ tagihan sebagai pembanding akan membuat
// ketujuh kontrak itu tetap Paid.
const dendaKontrak = (k: (typeof kontrak)[number]) => {
  const idTagihan = new Set(
    DATA_NYATA.tagihan.filter((t) => t.kontrakId === k.id).map((t) => t.id),
  );
  return DATA_NYATA.denda
    .filter((d) => idTagihan.has(d.tagihanId) && d.status !== 'Dihapus')
    .reduce((s, d) => s + d.jumlah, 0);
};
const cocokTarget = kontrak.filter((k) => {
  const totalTagihan = DATA_NYATA.tagihan
    .filter((t) => t.kontrakId === k.id)
    .reduce((s, t) => s + t.nilai, 0);
  return totalTagihan === k.nilaiKontrak + dendaKontrak(k);
}).length;
cek(
  'Σ tagihan == nilaiKontrak + denda di 34/42 kontrak',
  cocokTarget === 34,
  `${cocokTarget}`,
);
cek(
  '8 pengecualian Σ tagihan < nilaiKontrak + denda: 1051, 1052, 1053, 018, 10227, 027, 016, 7054',
  JSON.stringify(
    kontrak
      .filter((k) => {
        const totalTagihan = DATA_NYATA.tagihan
          .filter((t) => t.kontrakId === k.id)
          .reduce((s, t) => s + t.nilai, 0);
        return totalTagihan !== k.nilaiKontrak + dendaKontrak(k);
      })
      .map((k) => k.nomorPks.split('/')[0])
      .sort(),
  ) === JSON.stringify(['016', '018', '027', '10227', '1051', '1052', '1053', '7054']),
);
cek(
  '7054 satu-satunya selisih Rp1 (tagihan 9.801.321 vs nilaiKontrak + denda 9.801.322)',
  DATA_NYATA.tagihan
    .filter((t) => t.kontrakId === cari('7054/PKS/RRI.PLB/07/2026').id)
    .reduce((s, t) => s + t.nilai, 0) -
    (cari('7054/PKS/RRI.PLB/07/2026').nilaiKontrak +
      dendaKontrak(cari('7054/PKS/RRI.PLB/07/2026'))) ===
    -1,
);
// 11 kontrak yang dibayar sebagian (menurut nilai kontrak + denda)
// terbagi dua oleh definisi baru: 5 yang dibayar == Piutang tetap
// Partially-Paid, 6 yang dibayar < Piutang jadi Insufficient Payment.
const bayarSebagian = kontrak.filter((k) => {
  const tg = DATA_NYATA.tagihan.filter((t) => t.kontrakId === k.id);
  const total = tg.reduce(
    (s, t) => s + dibayarTerverifikasi(t.id, DATA_NYATA.pembayaran),
    0,
  );
  return total > 0 && total < k.nilaiKontrak + dendaKontrak(k);
});
const statusDari = (k: (typeof kontrak)[number]) =>
  statusPembayaranKontrak(
    k,
    DATA_NYATA.tagihan,
    DATA_NYATA.pembayaran,
    DATA_NYATA.denda,
    HARI_INI,
  );
cek(
  '11 kontrak bayar-sebagian terbagi 5 Partially-Paid + 6 Insufficient Payment',
  bayarSebagian.length === 11 &&
    bayarSebagian.filter((k) => statusDari(k) === 'Partially-Paid').length === 5 &&
    bayarSebagian.filter((k) => statusDari(k) === 'Insufficient Payment').length === 6,
  `${bayarSebagian.length}`,
);
cek(
  '5 Partially-Paid = 1051, 1052, 1053, 016, 027 (dibayar == piutang)',
  JSON.stringify(
    bayarSebagian
      .filter((k) => statusDari(k) === 'Partially-Paid')
      .map((k) => k.nomorPks.split('/')[0])
      .sort(),
  ) === JSON.stringify(['016', '027', '1051', '1052', '1053']),
);
cek(
  '6 Insufficient Payment = 1744, 2919, 2920, 7052, 7054, 7060 (dibayar < piutang)',
  JSON.stringify(
    bayarSebagian
      .filter((k) => statusDari(k) === 'Insufficient Payment')
      .map((k) => k.nomorPks.split('/')[0])
      .sort(),
  ) === JSON.stringify(['1744', '2919', '2920', '7052', '7054', '7060']),
);
cek(
  '6 Insufficient Payment semuanya pokok lunas, denda belum dibayar (dibayar == nilaiKontrak)',
  bayarSebagian
    .filter((k) => statusDari(k) === 'Insufficient Payment')
    .every((k) => {
      const tg = DATA_NYATA.tagihan.filter((t) => t.kontrakId === k.id);
      const total = tg.reduce(
        (s, t) => s + dibayarTerverifikasi(t.id, DATA_NYATA.pembayaran),
        0,
      );
      return total === k.nilaiKontrak;
    }),
);
cek(
  'tidak ada kontrak dibayar > Piutang tapi < penuh di seed',
  kontrak.every((k) => {
    const tg = DATA_NYATA.tagihan.filter((t) => t.kontrakId === k.id);
    const total = tg.reduce(
      (s, t) => s + dibayarTerverifikasi(t.id, DATA_NYATA.pembayaran),
      0,
    );
    const piutang = piutangRealisasi(k, DATA_NYATA.tagihan, DATA_NYATA.denda, HARI_INI);
    return !(total > piutang && total < k.nilaiKontrak + dendaKontrak(k));
  }),
);
// Toleransi |dibayar - Piutang| <= Rp1 (kasus sintetis pada 1051,
// piutang 6.455.000): +1 dan -1 tetap Partially-Paid, +2 jadi
// Insufficient Payment.
const tagihan1051 = DATA_NYATA.tagihan.find(
  (t) => t.kontrakId === cari('1051/PKS/RRI.PLB/02/2026').id,
)!;
const bayarSintetis = (jumlah: number): Pembayaran[] => [
  {
    id: 'SINT-TOL',
    tagihanId: tagihan1051.id,
    tanggalBayar: '2026-11-16',
    jumlah,
    metode: 'Transfer',
    penyetor: 'Sintetis',
    statusVerifikasi: 'Terverifikasi',
    satker: { kode: '41', nama: 'PALEMBANG' },
  },
];
cek(
  'toleransi: dibayar piutang+1 (6.455.001) tetap Partially-Paid',
  statusPembayaranKontrak(
    cari('1051/PKS/RRI.PLB/02/2026'),
    DATA_NYATA.tagihan,
    bayarSintetis(6455001),
    DATA_NYATA.denda,
    HARI_INI,
  ) === 'Partially-Paid',
);
cek(
  'toleransi: dibayar piutang-1 (6.454.999) tetap Partially-Paid',
  statusPembayaranKontrak(
    cari('1051/PKS/RRI.PLB/02/2026'),
    DATA_NYATA.tagihan,
    bayarSintetis(6454999),
    DATA_NYATA.denda,
    HARI_INI,
  ) === 'Partially-Paid',
);
cek(
  'toleransi: dibayar piutang+2 (6.455.002) jadi Insufficient Payment',
  statusPembayaranKontrak(
    cari('1051/PKS/RRI.PLB/02/2026'),
    DATA_NYATA.tagihan,
    bayarSintetis(6455002),
    DATA_NYATA.denda,
    HARI_INI,
  ) === 'Insufficient Payment',
);
// Kategori saling lepas: jumlah kelimanya = 42.
cek(
  'payment status saling lepas (28+5+6+3+0 = 42)',
  hitungBayar('Paid') +
    hitungBayar('Partially-Paid') +
    hitungBayar('Insufficient Payment') +
    hitungBayar('Unpaid') +
    hitungBayar('Overdue') ===
    42,
);
// Kebenaran filter + nomor urut sesudah filter baru.
const sebagianNilaiDesc = urutkanKontrak(
  kontrak.filter(
    (k) =>
      statusPembayaranKontrak(
        k,
        DATA_NYATA.tagihan,
        DATA_NYATA.pembayaran,
        DATA_NYATA.denda,
        HARI_INI,
      ) === 'Partially-Paid',
  ),
  'nilai',
  'turun',
);
cek(
  'filter Partially-Paid = 5 baris',
  sebagianNilaiDesc.length === 5,
  `${sebagianNilaiDesc.length}`,
);
cek(
  'filter Partially-Paid + sort nilai desc pertama 016 VGreen',
  sebagianNilaiDesc[0].nomorPks === '016/PKS/DIR.LPU/06/2025',
  sebagianNilaiDesc[0].nomorPks,
);
cek(
  'filter Partially-Paid + sort nilai desc terakhir 1053',
  sebagianNilaiDesc[4].nomorPks === '1053/PKS/RRI.PLB/02/2026',
  sebagianNilaiDesc[4].nomorPks,
);
cek(
  'filter Partially-Paid + sort nilai desc urutan 016, 027, 1051, 1052, 1053',
  JSON.stringify(sebagianNilaiDesc.map((k) => k.nomorPks.split('/')[0])) ===
    JSON.stringify(['016', '027', '1051', '1052', '1053']),
);
const kurangNilaiDesc = urutkanKontrak(
  kontrak.filter(
    (k) =>
      statusPembayaranKontrak(
        k,
        DATA_NYATA.tagihan,
        DATA_NYATA.pembayaran,
        DATA_NYATA.denda,
        HARI_INI,
      ) === 'Insufficient Payment',
  ),
  'nilai',
  'turun',
);
cek(
  'filter Insufficient Payment = 6 baris',
  kurangNilaiDesc.length === 6,
  `${kurangNilaiDesc.length}`,
);
cek(
  'filter Insufficient Payment + sort nilai desc pertama 1744',
  kurangNilaiDesc[0].nomorPks === '1744/PKS/RRI.PLB/03/2026',
  kurangNilaiDesc[0].nomorPks,
);
cek(
  'filter Insufficient Payment + sort nilai desc terakhir 2920',
  kurangNilaiDesc[5].nomorPks === '2920/PKS/RRI.PLB/04/2026',
  kurangNilaiDesc[5].nomorPks,
);
cek(
  'filter Insufficient Payment + sort nilai desc urutan 1744, 7054, 7052, 7060, 2919, 2920',
  JSON.stringify(kurangNilaiDesc.map((k) => k.nomorPks.split('/')[0])) ===
    JSON.stringify(['1744', '7054', '7052', '7060', '2919', '2920']),
);
cek(
  'filter Overdue = 0 baris (jujur: tidak ada kontrak nol-pembayaran yang lewat jatuh tempo)',
  kontrak.filter(
    (k) =>
      statusPembayaranKontrak(
        k,
        DATA_NYATA.tagihan,
        DATA_NYATA.pembayaran,
        DATA_NYATA.denda,
        HARI_INI,
      ) === 'Overdue',
  ).length === 0,
);
// Kombinasi dengan filter lama (PNBP Type).
cek(
  'filter gabungan Fungsional + Paid = 19',
  kontrak.filter(
    (k) =>
      k.jenisPnBP === 'Fungsional' &&
      statusPembayaranKontrak(
        k,
        DATA_NYATA.tagihan,
        DATA_NYATA.pembayaran,
        DATA_NYATA.denda,
        HARI_INI,
      ) === 'Paid',
  ).length === 19,
);
cek(
  'filter gabungan Fungsional + Partially-Paid = 0 (1744, 2919, 2920 pindah ke Insufficient)',
  kontrak.filter(
    (k) =>
      k.jenisPnBP === 'Fungsional' &&
      statusPembayaranKontrak(
        k,
        DATA_NYATA.tagihan,
        DATA_NYATA.pembayaran,
        DATA_NYATA.denda,
        HARI_INI,
      ) === 'Partially-Paid',
  ).length === 0,
);
cek(
  'filter gabungan Fungsional + Insufficient Payment = 3 (1744, 2919, 2920)',
  kontrak.filter(
    (k) =>
      k.jenisPnBP === 'Fungsional' &&
      statusPembayaranKontrak(
        k,
        DATA_NYATA.tagihan,
        DATA_NYATA.pembayaran,
        DATA_NYATA.denda,
        HARI_INI,
      ) === 'Insufficient Payment',
  ).length === 3,
);

// ---------- filter Cooperation Status (keputusan pengguna 16/11/2026 13:56 WIB) ----------
// Aturan (helper statusKerjaSamaKontrak): status 'Selesai' → Completed;
// tanggalMulai > hari ini → Upcoming; selain itu On-Going. Status yang
// ada di seed hanya 'Aktif' dan 'Selesai' (tidak ada 'Draft'/'Dibatalkan').
const statusKerja = (nomor: string) =>
  statusKerjaSamaKontrak(cari(nomor), HARI_INI);
const hitungKerja = (s: string) =>
  kontrak.filter((k) => statusKerjaSamaKontrak(k, HARI_INI) === s).length;
cek(
  'cooperation status 027 Darojad = On-Going (Aktif, sampai 30/06/2028)',
  statusKerja('027/RRI.PLB/PKS.U/06/2025') === 'On-Going',
);
cek(
  'cooperation status 016 VGreen = On-Going (Aktif, sampai 20/08/2028)',
  statusKerja('016/PKS/DIR.LPU/06/2025') === 'On-Going',
);
cek(
  'cooperation status 0603 = Completed',
  statusKerja('0603/PKS/RRI.PLB/01/2026') === 'Completed',
);
cek(
  'cooperation status 11290 = Completed (kontrak 1 hari, status Selesai)',
  statusKerja('11290/PKS/RRI.PLB/10/2026') === 'Completed',
);
cek(
  'cooperation status Samdini 10828 = On-Going',
  statusKerja('10828/PKS/RRI.PLB/10/2026') === 'On-Going',
);
cek(
  'cooperation status 018 = On-Going',
  statusKerja('018/PKS/DIR.LPU/08/2026') === 'On-Going',
);
cek(
  'cooperation status 10227 = On-Going',
  statusKerja('10227/PKS/RRI.PLB/10/2026') === 'On-Going',
);
cek('cooperation status Completed = 27', hitungKerja('Completed') === 27, `${hitungKerja('Completed')}`);
cek('cooperation status On-Going = 15', hitungKerja('On-Going') === 15, `${hitungKerja('On-Going')}`);
cek(
  'cooperation status Upcoming = 0 (jujur: tanggalMulai terbaru 2026-10-30)',
  hitungKerja('Upcoming') === 0,
  `${hitungKerja('Upcoming')}`,
);
cek(
  'cooperation status saling lepas (27+15+0 = 42)',
  hitungKerja('Completed') + hitungKerja('On-Going') + hitungKerja('Upcoming') === 42,
);
// Kombinasi kedua filter baru.
cek(
  'filter gabungan Paid + Completed = 20',
  kontrak.filter(
    (k) =>
      statusPembayaranKontrak(
        k,
        DATA_NYATA.tagihan,
        DATA_NYATA.pembayaran,
        DATA_NYATA.denda,
        HARI_INI,
      ) === 'Paid' && statusKerjaSamaKontrak(k, HARI_INI) === 'Completed',
  ).length === 20,
);
cek(
  'filter gabungan Partially-Paid + Completed = 0 (6 kontrak lama pindah ke Insufficient)',
  kontrak.filter(
    (k) =>
      statusPembayaranKontrak(
        k,
        DATA_NYATA.tagihan,
        DATA_NYATA.pembayaran,
        DATA_NYATA.denda,
        HARI_INI,
      ) === 'Partially-Paid' && statusKerjaSamaKontrak(k, HARI_INI) === 'Completed',
  ).length === 0,
);
cek(
  'filter gabungan Insufficient Payment + Completed = 6 (1744, 2919, 2920, 7052, 7054, 7060)',
  kontrak.filter(
    (k) =>
      statusPembayaranKontrak(
        k,
        DATA_NYATA.tagihan,
        DATA_NYATA.pembayaran,
        DATA_NYATA.denda,
        HARI_INI,
      ) === 'Insufficient Payment' && statusKerjaSamaKontrak(k, HARI_INI) === 'Completed',
  ).length === 6,
);
cek(
  'filter gabungan Insufficient Payment + On-Going = 0',
  kontrak.filter(
    (k) =>
      statusPembayaranKontrak(
        k,
        DATA_NYATA.tagihan,
        DATA_NYATA.pembayaran,
        DATA_NYATA.denda,
        HARI_INI,
      ) === 'Insufficient Payment' && statusKerjaSamaKontrak(k, HARI_INI) === 'On-Going',
  ).length === 0,
);
cek(
  'filter gabungan Partially-Paid + On-Going = 5 (1051, 1052, 1053, 016, 027)',
  kontrak.filter(
    (k) =>
      statusPembayaranKontrak(
        k,
        DATA_NYATA.tagihan,
        DATA_NYATA.pembayaran,
        DATA_NYATA.denda,
        HARI_INI,
      ) === 'Partially-Paid' && statusKerjaSamaKontrak(k, HARI_INI) === 'On-Going',
  ).length === 5,
);
cek(
  'filter gabungan Overdue + On-Going = 0',
  kontrak.filter(
    (k) =>
      statusPembayaranKontrak(
        k,
        DATA_NYATA.tagihan,
        DATA_NYATA.pembayaran,
        DATA_NYATA.denda,
        HARI_INI,
      ) === 'Overdue' && statusKerjaSamaKontrak(k, HARI_INI) === 'On-Going',
  ).length === 0,
);
cek(
  'filter gabungan Unpaid + On-Going = 2',
  kontrak.filter(
    (k) =>
      statusPembayaranKontrak(
        k,
        DATA_NYATA.tagihan,
        DATA_NYATA.pembayaran,
        DATA_NYATA.denda,
        HARI_INI,
      ) === 'Unpaid' && statusKerjaSamaKontrak(k, HARI_INI) === 'On-Going',
  ).length === 2,
);

// ---------- kolom Remaining Days (keputusan pengguna 16/11/2026 15:29 WIB) ----------
// Aturan (helper sisaHariKerjaSama, hari ini = 2026-11-16): status
// 'Selesai' → "Completed"; selain itu hitung mundur hari kalender dari
// hari ini sampai tanggalSelesai ("1 day" bila 1, "N days" bila lain).
// AUDIT (seed, per 2026-11-16): 15 kontrak non-Selesai, semuanya berakhir
// di masa depan — TIDAK ADA yang tanggal akhirnya sudah lewat (selisih
// terkecil 1 hari: 10227 berakhir 17/11/2026; terbesar 807 hari:
// 1051/1052/1053 berakhir 31/01/2029).
const sisaHari = (nomor: string) => sisaHariKerjaSama(cari(nomor), HARI_INI);
cek(
  'remaining days 027 Darojad = "592 days" (sampai 30/06/2028)',
  sisaHari('027/RRI.PLB/PKS.U/06/2025') === '592 days',
  sisaHari('027/RRI.PLB/PKS.U/06/2025'),
);
cek(
  'remaining days 016 VGreen = "643 days" (sampai 20/08/2028)',
  sisaHari('016/PKS/DIR.LPU/06/2025') === '643 days',
  sisaHari('016/PKS/DIR.LPU/06/2025'),
);
cek(
  'remaining days 1051 = "807 days" (sampai 31/01/2029)',
  sisaHari('1051/PKS/RRI.PLB/02/2026') === '807 days',
  sisaHari('1051/PKS/RRI.PLB/02/2026'),
);
cek(
  'remaining days 1052 = "807 days" (sampai 31/01/2029)',
  sisaHari('1052/PKS/RRI.PLB/02/2026') === '807 days',
  sisaHari('1052/PKS/RRI.PLB/02/2026'),
);
cek(
  'remaining days 1053 = "807 days" (sampai 31/01/2029)',
  sisaHari('1053/PKS/RRI.PLB/02/2026') === '807 days',
  sisaHari('1053/PKS/RRI.PLB/02/2026'),
);
cek(
  'remaining days 0603 = "Completed" (status Selesai)',
  sisaHari('0603/PKS/RRI.PLB/01/2026') === 'Completed',
);
cek(
  'remaining days Taspen 001 = "Completed" (status Selesai)',
  sisaHari('001/PKS/DIR.LPU/01/2026') === 'Completed',
);
cek(
  'remaining days Samdini 10828 = "304 days" (sampai 16/09/2027)',
  sisaHari('10828/PKS/RRI.PLB/10/2026') === '304 days',
  sisaHari('10828/PKS/RRI.PLB/10/2026'),
);
cek(
  'remaining days 10227 = "1 day" (tunggal, berakhir 17/11/2026)',
  sisaHari('10227/PKS/RRI.PLB/10/2026') === '1 day',
  sisaHari('10227/PKS/RRI.PLB/10/2026'),
);
cek(
  '"Completed" untuk semua 27 kontrak Selesai',
  kontrak
    .filter((k) => k.status === 'Selesai')
    .every((k) => sisaHariKerjaSama(k, HARI_INI) === 'Completed'),
);
cek(
  '15 kontrak non-Selesai semuanya berformat "N days"/"1 day" dengan N >= 1',
  kontrak
    .filter((k) => k.status !== 'Selesai')
    .every((k) => /^(1 day|[1-9][0-9]* days)$/.test(sisaHariKerjaSama(k, HARI_INI))),
);
cek(
  'audit: TIDAK ADA kontrak non-Selesai yang tanggal akhirnya sudah lewat per 2026-11-16',
  kontrak.filter((k) => k.status !== 'Selesai' && k.tanggalSelesai < HARI_INI)
    .length === 0,
);
cek(
  'selisih terkecil non-Selesai = 1 hari (10227)',
  Math.min(
    ...kontrak
      .filter((k) => k.status !== 'Selesai')
      .map((k) => selisihHari(HARI_INI, k.tanggalSelesai)),
  ) === 1,
);
cek(
  'selisih terbesar non-Selesai = 807 hari (1051/1052/1053)',
  Math.max(
    ...kontrak
      .filter((k) => k.status !== 'Selesai')
      .map((k) => selisihHari(HARI_INI, k.tanggalSelesai)),
  ) === 807,
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
// ---------- sort Remaining Days (keputusan pengguna 16/11/2026 15:37 WIB) ----------
// Kunci = sisa hari sampai tanggalSelesai; kontrak Selesai ("Completed")
// SELALU paling akhir di kedua arah. Hari ini = 2026-11-16.
const sisaNaik = urutkanKontrak(kontrak, 'sisaHari', 'naik', HARI_INI);
cek('sort sisaHari naik pertama 10227 (1 day)', sisaNaik[0].nomorPks === '10227/PKS/RRI.PLB/10/2026', sisaNaik[0].nomorPks);
cek('sort sisaHari naik 15 pertama non-Selesai', sisaNaik.slice(0, 15).every((x) => x.status !== 'Selesai'));
cek('sort sisaHari naik 15 pertama terurut naik', sisaNaik.slice(0, 15).every((x, i, arr) => i === 0 || selisihHari(HARI_INI, arr[i - 1].tanggalSelesai) <= selisihHari(HARI_INI, x.tanggalSelesai)));
cek('sort sisaHari naik 27 terakhir semua Selesai', sisaNaik.slice(15).every((x) => x.status === 'Selesai'));
cek('sort sisaHari naik terakhir salah satu Completed', sisaNaik[sisaNaik.length - 1].status === 'Selesai', sisaNaik[sisaNaik.length - 1].nomorPks);
const sisaTurun = urutkanKontrak(kontrak, 'sisaHari', 'turun', HARI_INI);
cek('sort sisaHari turun pertama 1051 (807 days, seri tie-break nomor)', sisaTurun[0].nomorPks === '1051/PKS/RRI.PLB/02/2026', sisaTurun[0].nomorPks);
cek('sort sisaHari turun 3 pertama 1051, 1052, 1053', JSON.stringify(sisaTurun.slice(0, 3).map((x) => x.nomorPks)) === JSON.stringify(['1051/PKS/RRI.PLB/02/2026', '1052/PKS/RRI.PLB/02/2026', '1053/PKS/RRI.PLB/02/2026']));
cek('sort sisaHari turun 15 pertama non-Selesai', sisaTurun.slice(0, 15).every((x) => x.status !== 'Selesai'));
cek('sort sisaHari turun 15 pertama terurut turun', sisaTurun.slice(0, 15).every((x, i, arr) => i === 0 || selisihHari(HARI_INI, arr[i - 1].tanggalSelesai) >= selisihHari(HARI_INI, x.tanggalSelesai)));
cek('sort sisaHari turun 27 terakhir semua Selesai', sisaTurun.slice(15).every((x) => x.status === 'Selesai'));
cek('sort sisaHari turun terakhir salah satu Completed', sisaTurun[sisaTurun.length - 1].status === 'Selesai', sisaTurun[sisaTurun.length - 1].nomorPks);
cek('label arah sisaHari naik', labelArahUrutKontrak('sisaHari', 'naik') === 'Fewest first');
cek('label arah sisaHari turun', labelArahUrutKontrak('sisaHari', 'turun') === 'Most first');
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

// ---------- 6 kolom nilai baru (keputusan pengguna 17/11/2026 09:04 WIB;
// header Total Revenue diganti 09:06 WIB, Remaining Value 09:07 WIB;
// DIURUT ULANG 17/11/2026 09:24 WIB) ----------
// Urutan blok nilai (Payment Deadline tetap sesudah Payment Status;
// Contract Value kini awal blok, Realisation dan Receivable Value
// bertukar posisi, Remaining Value kini terakhir): Payment Deadline,
// Contract Value, Fine Value, Total Revenue, Realisation,
// Receivable Value, Remaining Value.
// Definisi:
// - Payment Deadline = jatuh tempo tagihan TERTUA yang belum lunas
//   (statusTagihan bukan 'Lunas'); bila semua lunas, jatuh tempo
//   tagihan TERAKHIR; undefined bila tanpa tagihan (tidak ada di seed).
// - Fine Value = Σ Denda.jumlah (status selain Dihapus); tampil "—"
//   bila 0.
// - Total Revenue = nilaiKontrak + total denda.
// - Receivable Value = Piutang = (nilaiKontrak + denda) x % Realisasi.
// - Realisation = % realisasi kontrak, format SAMA PERSIS dengan seksi
//   Revenue di DetailKontrak (formatPersenRealisasi: 1 desimal,
//   pemisah desimal ".", tanpa ",0" — "33.3%", "66.7%", "100%").
//   Angka 33,33% / 66,67% / 54,05% dari brief adalah fraksi tersimpan
//   (1/3, 2/3, 60/111); tampilannya dibulatkan 1 desimal.
// - Remaining Value = Sisa Kontrak = (nilaiKontrak + denda) x (1 - %).
// Semua nilai dihitung pada HARI_INI = 2026-11-16 supaya deterministik.
const dendaNilai = (nomor: string) =>
  totalDendaKontrak(cari(nomor), DATA_NYATA.tagihan, DATA_NYATA.denda);
const totalRevenueNilai = (nomor: string) =>
  cari(nomor).nilaiKontrak + dendaNilai(nomor);
const piutangNilai = (nomor: string) =>
  piutangRealisasi(cari(nomor), DATA_NYATA.tagihan, DATA_NYATA.denda, HARI_INI);
const realisasiNilai = (nomor: string) =>
  realisasiKontrak(cari(nomor), HARI_INI);
const realisasiTampil = (nomor: string) =>
  formatPersenRealisasi(realisasiNilai(nomor));
const sisaNilai = (nomor: string) =>
  sisaKontrakRealisasi(cari(nomor), DATA_NYATA.tagihan, DATA_NYATA.denda, HARI_INI);
const deadlineNilai = (nomor: string) =>
  jatuhTempoPembayaranKontrak(
    cari(nomor),
    DATA_NYATA.tagihan,
    DATA_NYATA.pembayaran,
    HARI_INI,
  );

// ----- Payment Deadline -----
cek(
  'payment deadline 10227 = 2026-12-15 (belum lunas)',
  deadlineNilai('10227/PKS/RRI.PLB/10/2026') === '2026-12-15',
);
cek(
  'payment deadline 018 = 2026-12-31 (belum lunas)',
  deadlineNilai('018/PKS/DIR.LPU/08/2026') === '2026-12-31',
);
cek(
  'payment deadline 11290 = 2026-11-27 (belum lunas)',
  deadlineNilai('11290/PKS/RRI.PLB/10/2026') === '2026-11-27',
);
cek(
  'payment deadline 1744 = 2026-04-22 (Lunas Sebagian)',
  deadlineNilai('1744/PKS/RRI.PLB/03/2026') === '2026-04-22',
);
cek(
  'payment deadline 0603 = 2026-02-24 (Paid: semua lunas -> tagihan terakhir)',
  deadlineNilai('0603/PKS/RRI.PLB/01/2026') === '2026-02-24',
);
cek(
  'payment deadline 1051 = 2026-01-31 (Paid: semua lunas -> tagihan terakhir)',
  deadlineNilai('1051/PKS/RRI.PLB/02/2026') === '2026-01-31',
);
cek(
  'semua 42 kontrak punya tepat 1 tagihan (cabang deadline sama dengan jatuh tempo tagihan itu)',
  kontrak.every(
    (k) =>
      DATA_NYATA.tagihan.filter((t) => t.kontrakId === k.id).length === 1,
  ),
);
// Cabang "tertua belum lunas" vs "terakhir bila semua lunas" (tidak ada
// di seed — semua kontrak 1 tagihan): dites sintetis pada kontrak 0603.
const tagihanSintetis = (id: string, jatuhTempo: string, nilai: number): Tagihan => ({
  id,
  nomor: `SINT-${id}`,
  kontrakId: cari('0603/PKS/RRI.PLB/01/2026').id,
  uraian: 'Sintetis',
  nilai,
  tanggalTerbit: '2026-01-19',
  tanggalJatuhTempo: jatuhTempo,
  kodeAkun: '425531',
  satker: { kode: '41', nama: 'PALEMBANG' },
});
const bayarLunasSintetis = (tagihanId: string, jumlah: number): Pembayaran[] => [
  {
    id: `SINT-BYR-${tagihanId}`,
    tagihanId,
    tanggalBayar: '2026-01-20',
    jumlah,
    metode: 'Transfer',
    penyetor: 'Sintetis',
    statusVerifikasi: 'Terverifikasi',
    satker: { kode: '41', nama: 'PALEMBANG' },
  },
];
const kontrak0603 = cari('0603/PKS/RRI.PLB/01/2026');
cek(
  'deadline sintetis: 2 tagihan, 1 lunas (2026-02-01) + 1 belum lunas (2026-03-01) -> 2026-03-01',
  jatuhTempoPembayaranKontrak(
    kontrak0603,
    [
      tagihanSintetis('T1', '2026-03-01', 100000),
      tagihanSintetis('T2', '2026-02-01', 50000),
    ],
    bayarLunasSintetis('T2', 50000),
    HARI_INI,
  ) === '2026-03-01',
);
cek(
  'deadline sintetis: 2 tagihan belum lunas -> jatuh tempo paling awal (2026-02-01)',
  jatuhTempoPembayaranKontrak(
    kontrak0603,
    [
      tagihanSintetis('T1', '2026-03-01', 100000),
      tagihanSintetis('T2', '2026-02-01', 50000),
    ],
    [],
    HARI_INI,
  ) === '2026-02-01',
);
cek(
  'deadline sintetis: 2 tagihan semua lunas -> jatuh tempo paling akhir (2026-03-01)',
  jatuhTempoPembayaranKontrak(
    kontrak0603,
    [
      tagihanSintetis('T1', '2026-03-01', 100000),
      tagihanSintetis('T2', '2026-02-01', 50000),
    ],
    [...bayarLunasSintetis('T1', 100000), ...bayarLunasSintetis('T2', 50000)],
    HARI_INI,
  ) === '2026-03-01',
);
cek(
  'deadline sintetis: tanpa tagihan -> undefined (tampil "—")',
  jatuhTempoPembayaranKontrak(kontrak0603, [], [], HARI_INI) === undefined,
);

// ----- Fine Value -----
cek('fine value 1744 = 900.000', dendaNilai('1744/PKS/RRI.PLB/03/2026') === 900000);
cek('fine value 7054 = 1.897.030', dendaNilai('7054/PKS/RRI.PLB/07/2026') === 1897030);
cek('fine value 1494 = 180.380', dendaNilai('1494/PKS/RRI.PLB/02/2026') === 180380);
cek('fine value 2919 = 30.000', dendaNilai('2919/PKS/RRI.PLB/04/2026') === 30000);
cek('fine value 1051 = 0 (tampil "—")', dendaNilai('1051/PKS/RRI.PLB/02/2026') === 0);
cek('fine value 10227 = 0 (tampil "—")', dendaNilai('10227/PKS/RRI.PLB/10/2026') === 0);
cek(
  'kontrak berdenda = 11 (12 catatan denda; 2036 ada 2 kontrak)',
  kontrak.filter(
    (k) => totalDendaKontrak(k, DATA_NYATA.tagihan, DATA_NYATA.denda) > 0,
  ).length === 11,
);
cek(
  'Σ fine value semua kontrak = 6.219.250',
  kontrak.reduce(
    (s, k) => s + totalDendaKontrak(k, DATA_NYATA.tagihan, DATA_NYATA.denda),
    0,
  ) === 6219250,
);

// ----- Total Revenue -----
cek('total revenue 1744 = 15.900.000', totalRevenueNilai('1744/PKS/RRI.PLB/03/2026') === 15900000);
cek('total revenue 7054 = 9.801.322', totalRevenueNilai('7054/PKS/RRI.PLB/07/2026') === 9801322);
cek('total revenue 1051 = 19.365.000', totalRevenueNilai('1051/PKS/RRI.PLB/02/2026') === 19365000);
cek('total revenue 1494 = 9.199.380', totalRevenueNilai('1494/PKS/RRI.PLB/02/2026') === 9199380);
cek('total revenue 10227 = 4.995.000 (tanpa denda)', totalRevenueNilai('10227/PKS/RRI.PLB/10/2026') === 4995000);

// ----- Receivable Value -----
cek('receivable 1051 = 6.455.000', piutangNilai('1051/PKS/RRI.PLB/02/2026') === 6455000);
cek('receivable 1052 = 6.455.000', piutangNilai('1052/PKS/RRI.PLB/02/2026') === 6455000);
cek('receivable 1053 = 5.648.000', piutangNilai('1053/PKS/RRI.PLB/02/2026') === 5648000);
cek('receivable 016 = 34.292.500', piutangNilai('016/PKS/DIR.LPU/06/2025') === 34292500);
cek('receivable 027 = 22.492.500', piutangNilai('027/RRI.PLB/PKS.U/06/2025') === 22492500);
cek('receivable 1744 = 15.900.000', piutangNilai('1744/PKS/RRI.PLB/03/2026') === 15900000);
cek('receivable 10227 = 2.700.000', piutangNilai('10227/PKS/RRI.PLB/10/2026') === 2700000);
cek('receivable 018 = 4.110.000', piutangNilai('018/PKS/DIR.LPU/08/2026') === 4110000);
cek('receivable 11290 = 2.000.000', piutangNilai('11290/PKS/RRI.PLB/10/2026') === 2000000);

// ----- Realisation -----
cek('realisation 1051 = 33.3% (fraksi 1/3)', realisasiTampil('1051/PKS/RRI.PLB/02/2026') === '33.3%');
cek('realisation 1052 = 33.3%', realisasiTampil('1052/PKS/RRI.PLB/02/2026') === '33.3%');
cek('realisation 1053 = 33.3%', realisasiTampil('1053/PKS/RRI.PLB/02/2026') === '33.3%');
cek('realisation 016 = 66.7% (fraksi 2/3)', realisasiTampil('016/PKS/DIR.LPU/06/2025') === '66.7%');
cek('realisation 027 = 66.7%', realisasiTampil('027/RRI.PLB/PKS.U/06/2025') === '66.7%');
cek('realisation 1744 = 100%', realisasiTampil('1744/PKS/RRI.PLB/03/2026') === '100%');
cek('realisation 10227 = 54.1% (fraksi 60/111)', realisasiTampil('10227/PKS/RRI.PLB/10/2026') === '54.1%');
cek('realisation 018 = 51.5%', realisasiTampil('018/PKS/DIR.LPU/08/2026') === '51.5%');
cek('realisation 11290 = 100%', realisasiTampil('11290/PKS/RRI.PLB/10/2026') === '100%');
cek(
  'realisation 1051 fraksi = 1/3',
  Math.abs(realisasiNilai('1051/PKS/RRI.PLB/02/2026') - 1 / 3) < 1e-9,
);
cek(
  'realisation 016 fraksi = 2/3',
  Math.abs(realisasiNilai('016/PKS/DIR.LPU/06/2025') - 2 / 3) < 1e-9,
);

// ----- Remaining Value -----
cek('remaining value 1051 = 12.910.000', sisaNilai('1051/PKS/RRI.PLB/02/2026') === 12910000);
cek('remaining value 1052 = 12.910.000', sisaNilai('1052/PKS/RRI.PLB/02/2026') === 12910000);
cek('remaining value 1053 = 11.296.000', sisaNilai('1053/PKS/RRI.PLB/02/2026') === 11296000);
cek('remaining value 016 = 17.146.250', sisaNilai('016/PKS/DIR.LPU/06/2025') === 17146250);
cek('remaining value 027 = 11.246.250', sisaNilai('027/RRI.PLB/PKS.U/06/2025') === 11246250);
cek('remaining value 1744 = 0', sisaNilai('1744/PKS/RRI.PLB/03/2026') === 0);
cek('remaining value 10227 = 2.295.000', sisaNilai('10227/PKS/RRI.PLB/10/2026') === 2295000);
cek('remaining value 018 = 3.865.000', sisaNilai('018/PKS/DIR.LPU/08/2026') === 3865000);
cek('remaining value 11290 = 0', sisaNilai('11290/PKS/RRI.PLB/10/2026') === 0);

// ----- Perilaku live -----
// Firestore live TIDAK punya field layanan.realisasi (PR #63 hanya
// mengubah seed; re-migrasi terakhir PR #53 sebelum itu). Kolom baru
// memakai helper yang SAMA dengan seksi Revenue di DetailKontrak —
// jadi live-nya TIDAK tampil "—": helper menghitung fallback PR #63
// (Selesai 100%, Umum 100% / tahun berjalan, Fungsional proporsi
// waktu). Simulasi live = hapus field realisasi dari semua layanan,
// hitung ulang: hanya 2/42 kontrak yang nilainya berubah. Payment
// Deadline, Fine Value, Total Revenue tidak memakai realisasi —
// nilainya identik live dan seed.
const kontrakLive = kontrak.map((k) => ({
  ...k,
  layanan: k.layanan.map((l) => {
    const { realisasi, ...sisanya } = l as typeof l & { realisasi?: number };
    return sisanya;
  }),
}));
const bedaLive = kontrak.filter((k) => {
  const kl = kontrakLive.find((x) => x.id === k.id)!;
  return (
    piutangRealisasi(kl, DATA_NYATA.tagihan, DATA_NYATA.denda, HARI_INI) !==
      piutangRealisasi(k, DATA_NYATA.tagihan, DATA_NYATA.denda, HARI_INI) ||
    Math.abs(realisasiKontrak(kl, HARI_INI) - realisasiKontrak(k, HARI_INI)) > 1e-9
  );
});
cek(
  'live: hanya 2/42 kontrak berubah tanpa field realisasi (018, 10227)',
  bedaLive.length === 2 &&
    JSON.stringify(bedaLive.map((k) => k.nomorPks.split('/')[0]).sort()) ===
      JSON.stringify(['018', '10227']),
  JSON.stringify(bedaLive.map((k) => k.nomorPks)),
);
const live018 = kontrakLive.find((k) => k.nomorPks === '018/PKS/DIR.LPU/08/2026')!;
const live10227 = kontrakLive.find((k) => k.nomorPks === '10227/PKS/RRI.PLB/10/2026')!;
cek(
  'live: 018 realisasi 77.6% (fallback proporsi waktu; seed 51.5%)',
  formatPersenRealisasi(realisasiKontrak(live018, HARI_INI)) === '77.6%',
);
cek(
  'live: 018 piutang 6.187.500 (seed 4.110.000)',
  piutangRealisasi(live018, DATA_NYATA.tagihan, DATA_NYATA.denda, HARI_INI) === 6187500,
);
cek(
  'live: 10227 realisasi 97.2% (fallback proporsi waktu; seed 54.1%)',
  formatPersenRealisasi(realisasiKontrak(live10227, HARI_INI)) === '97.2%',
);
cek(
  'live: 10227 piutang 4.856.250 (seed 2.700.000)',
  piutangRealisasi(live10227, DATA_NYATA.tagihan, DATA_NYATA.denda, HARI_INI) === 4856250,
);

// ---------- kolom Document Completeness (keputusan pengguna 17/11/2026 09:26 WIB) ----------
// Persentase = item checklist "Ada" / total item (7 normal, 8 bila
// Overdue) — dihitung dari daftar yang SAMA dengan tabel Document
// (daftarDokumenKontrak), format sama dengan Realisation
// (formatPersenRealisasi: 1 desimal). Distribusi seed (HARI_INI):
// 14.3% (1/7) = 5 kontrak, 28.6% (2/7) = 15, 42.9% (3/7) = 15,
// 57.1% (4/7) = 4, 71.4% (5/7) = 3. TIDAK ADA kontrak 100% — Nota
// Penyiaran + Jadwal Siar / Nota Produksi + Bukti Siar Belum Ada untuk
// semua Fungsional, Pemberitahuan Persetujuan Sewa Belum Ada untuk
// semua Umum; maksimum 71.4% (1051/1052/1053), minimum 14.3%.
const persenDokumen = (nomor: string) => {
  const k = cari(nomor);
  const items = daftarDokumenKontrak(
    k,
    DATA_NYATA.dokumen,
    DATA_NYATA.tagihan,
    DATA_NYATA.pembayaran,
    DATA_NYATA.denda,
    HARI_INI,
  );
  return kelengkapanDokumen(items);
};
const persenDokumenTampil = (nomor: string) =>
  formatPersenRealisasi(persenDokumen(nomor).fraksi);
cek(
  '11290 keterpenuhan dokumen 1/7 = 14.3% (contoh screenshot user)',
  persenDokumen('11290/PKS/RRI.PLB/10/2026').ada === 1 &&
    persenDokumen('11290/PKS/RRI.PLB/10/2026').total === 7 &&
    persenDokumenTampil('11290/PKS/RRI.PLB/10/2026') === '14.3%',
);
cek(
  '10227 keterpenuhan dokumen 1/7 = 14.3%',
  persenDokumenTampil('10227/PKS/RRI.PLB/10/2026') === '14.3%',
);
cek(
  '1051 keterpenuhan dokumen 5/7 = 71.4% (tertinggi)',
  persenDokumen('1051/PKS/RRI.PLB/02/2026').ada === 5 &&
    persenDokumenTampil('1051/PKS/RRI.PLB/02/2026') === '71.4%',
);
cek(
  '1052 keterpenuhan dokumen 5/7 = 71.4%',
  persenDokumenTampil('1052/PKS/RRI.PLB/02/2026') === '71.4%',
);
cek(
  '1053 keterpenuhan dokumen 5/7 = 71.4%',
  persenDokumenTampil('1053/PKS/RRI.PLB/02/2026') === '71.4%',
);
cek(
  '0603 keterpenuhan dokumen 4/7 = 57.1%',
  persenDokumenTampil('0603/PKS/RRI.PLB/01/2026') === '57.1%',
);
cek(
  '10828 keterpenuhan dokumen 2/7 = 28.6%',
  persenDokumenTampil('10828/PKS/RRI.PLB/10/2026') === '28.6%',
);
cek(
  'distribusi persen dokumen: 5x 14.3%, 15x 28.6%, 15x 42.9%, 4x 57.1%, 3x 71.4% (total 42)',
  (() => {
    const hitung = new Map<string, number>();
    for (const k of kontrak) {
      const items = daftarDokumenKontrak(
        k,
        DATA_NYATA.dokumen,
        DATA_NYATA.tagihan,
        DATA_NYATA.pembayaran,
        DATA_NYATA.denda,
        HARI_INI,
      );
      const p = formatPersenRealisasi(kelengkapanDokumen(items).fraksi);
      hitung.set(p, (hitung.get(p) ?? 0) + 1);
    }
    return (
      hitung.get('14.3%') === 5 &&
      hitung.get('28.6%') === 15 &&
      hitung.get('42.9%') === 15 &&
      hitung.get('57.1%') === 4 &&
      hitung.get('71.4%') === 3 &&
      [...hitung.values()].reduce((s, n) => s + n, 0) === 42
    );
  })(),
);
cek(
  'tidak ada kontrak 100% dan tidak ada 0% (maksimum 71.4%, minimum 14.3%)',
  kontrak.every((k) => {
    const items = daftarDokumenKontrak(
      k,
      DATA_NYATA.dokumen,
      DATA_NYATA.tagihan,
      DATA_NYATA.pembayaran,
      DATA_NYATA.denda,
      HARI_INI,
    );
    const f = kelengkapanDokumen(items).fraksi;
    return f > 0 && f < 1;
  }),
);
cek(
  'semua kontrak penyebut 7 (tidak ada Overdue di data nyata)',
  kontrak.every((k) => {
    const items = daftarDokumenKontrak(
      k,
      DATA_NYATA.dokumen,
      DATA_NYATA.tagihan,
      DATA_NYATA.pembayaran,
      DATA_NYATA.denda,
      HARI_INI,
    );
    return kelengkapanDokumen(items).total === 7;
  }),
);

// ---------- struktur sumber TabKontrak ----------
const deals = fs.readFileSync('src/modules/Deals.tsx', 'utf8');
const kerjaSama = fs.readFileSync('src/modules/KerjaSama.tsx', 'utf8');
const awal = deals.indexOf('export function TabKontrak');
const akhir = deals.indexOf('function DetailKontrak', awal);
const tabKontrak = deals.slice(awal, akhir);
const header = [...tabKontrak.matchAll(/<Th[^>]*>([^<]+)<\/Th>/g)].map((m) => m[1]);
cek(
  'urutan 18 header kolom (No. paling kiri, Remaining Days sesudah Contract Period, Payment Status sesudah Remaining Days, Payment Deadline sesudah Payment Status, blok nilai Contract Value, Fine Value, Total Revenue, Realisation, Receivable Value, Remaining Value, Document Completeness terakhir)',
  JSON.stringify(header) ===
    JSON.stringify([
      'No.',
      'Contract &amp; Reference Number',
      'Contract Title',
      'Signing Date',
      'Client',
      'Service Type',
      'Service Detail',
      'Contract Period',
      'Remaining Days',
      'Payment Status',
      'Payment Deadline',
      'Contract Value',
      'Fine Value',
      'Total Revenue',
      'Realisation',
      'Receivable Value',
      'Remaining Value',
      'Document Completeness',
    ]),
  JSON.stringify(header),
);
cek('header "Payment Status" 1x', header.filter((h) => h === 'Payment Status').length === 1);
cek(
  'header "Payment Status" sesudah Remaining Days, sebelum Payment Deadline',
  header.indexOf('Payment Status') === header.indexOf('Remaining Days') + 1 &&
    header.indexOf('Payment Status') === header.indexOf('Payment Deadline') - 1,
);
cek('header "Payment Deadline" 1x', header.filter((h) => h === 'Payment Deadline').length === 1);
cek('header "Fine Value" 1x', header.filter((h) => h === 'Fine Value').length === 1);
cek('header "Total Revenue" 1x', header.filter((h) => h === 'Total Revenue').length === 1);
cek('header "Receivable Value" 1x', header.filter((h) => h === 'Receivable Value').length === 1);
cek('header "Realisation" 1x', header.filter((h) => h === 'Realisation').length === 1);
cek('header "Remaining Value" 1x', header.filter((h) => h === 'Remaining Value').length === 1);
cek('header "Document Completeness" 1x', header.filter((h) => h === 'Document Completeness').length === 1);
cek(
  'urutan blok nilai: Payment Deadline, Contract Value, Fine Value, Total Revenue, Realisation, Receivable Value, Remaining Value, Document Completeness (terakhir)',
  header.indexOf('Payment Deadline') + 1 === header.indexOf('Contract Value') &&
    header.indexOf('Contract Value') + 1 === header.indexOf('Fine Value') &&
    header.indexOf('Fine Value') + 1 === header.indexOf('Total Revenue') &&
    header.indexOf('Total Revenue') + 1 === header.indexOf('Realisation') &&
    header.indexOf('Realisation') + 1 === header.indexOf('Receivable Value') &&
    header.indexOf('Receivable Value') + 1 === header.indexOf('Remaining Value') &&
    header.indexOf('Remaining Value') + 1 === header.indexOf('Document Completeness'),
);
cek(
  'header lama "Total Contract Value + Fine" 0x (diganti "Total Revenue" 09:06 WIB)',
  !header.includes('Total Contract Value + Fine'),
);
cek(
  'header lama "Remaining Contract Value" 0x (diganti "Remaining Value" 09:07 WIB)',
  !header.includes('Remaining Contract Value'),
);
cek(
  'sel Payment Deadline pakai helper jatuhTempoPembayaranKontrak + formatTanggal, "—" bila tanpa tagihan',
  tabKontrak.includes('const jatuhTempo = jatuhTempoPembayaranKontrak(') &&
    tabKontrak.includes("jatuhTempo ? formatTanggal(jatuhTempo) : '—'"),
);
cek(
  'sel Fine Value pakai totalDendaKontrak, "—" bila 0',
  tabKontrak.includes('const totalDenda = totalDendaKontrak(') &&
    tabKontrak.includes("totalDenda === 0 ? '—' : formatRupiah(totalDenda)"),
);
cek(
  'sel Total Revenue = nilaiKontrak + totalDenda',
  tabKontrak.includes('nilaiPlusDenda = k.nilaiKontrak + totalDenda') &&
    tabKontrak.includes('formatRupiah(nilaiPlusDenda)'),
);
cek(
  'sel Receivable Value pakai piutangRealisasi (helper yang sama dengan DetailKontrak)',
  tabKontrak.includes('const piutang = piutangRealisasi(') &&
    tabKontrak.includes('formatRupiah(piutang)'),
);
cek(
  'sel Realisation pakai realisasiKontrak + formatPersenRealisasi (format sama dengan DetailKontrak)',
  tabKontrak.includes('realisasiKontrak(k, hariIni)') &&
    tabKontrak.includes('formatPersenRealisasi(realisasi)'),
);
cek(
  'sel Remaining Value pakai sisaKontrakRealisasi (helper yang sama dengan DetailKontrak)',
  tabKontrak.includes('const sisaKontrak = sisaKontrakRealisasi(') &&
    tabKontrak.includes('formatRupiah(sisaKontrak)'),
);
cek(
  'sel Document Completeness pakai daftarDokumenKontrak + kelengkapanDokumen + formatPersenRealisasi (daftar yang sama dengan tabel Document)',
  tabKontrak.includes('daftarDokumenKontrak(') &&
    tabKontrak.includes('kelengkapanDokumen(') &&
    tabKontrak.includes('formatPersenRealisasi(kelengkapan.fraksi)'),
);
cek(
  'sel Document Completeness rata kanan',
  tabKontrak.includes('<Td kanan>{formatPersenRealisasi(kelengkapan.fraksi)}</Td>'),
);
cek(
  'sel Fine Value / Total Revenue / Receivable Value / Realisation / Remaining Value rata kanan',
  tabKontrak.includes('<Td kanan>{formatRupiah(nilaiPlusDenda)}</Td>') &&
    tabKontrak.includes('<Td kanan>{formatRupiah(piutang)}</Td>') &&
    tabKontrak.includes('<Td kanan>{formatPersenRealisasi(realisasi)}</Td>') &&
    tabKontrak.includes('<Td kanan>{formatRupiah(sisaKontrak)}</Td>') &&
    tabKontrak.includes(
      "<Td kanan>{totalDenda === 0 ? '—' : formatRupiah(totalDenda)}</Td>",
    ),
);
cek(
  'sel Payment Status menampilkan statusPembayaranKontrak langsung (tanpa helper label)',
  tabKontrak.includes('statusPembayaranKontrak(k, data.tagihan, data.pembayaran, data.denda)') &&
    !tabKontrak.includes('labelStatusPembayaranKontrak'),
);
cek(
  'helper label Indonesia labelStatusPembayaranKontrak 0x di Deals.tsx + kontrakTampilan.ts',
  !deals.includes('labelStatusPembayaranKontrak') &&
    !fs.readFileSync('src/lib/kontrakTampilan.ts', 'utf8').includes('export function labelStatusPembayaranKontrak'),
);
cek('header "Status Pembayaran" (Indonesia) 0x di TabKontrak', !tabKontrak.includes('Status Pembayaran'));
cek('header "Remaining Days" 1x', header.filter((h) => h === 'Remaining Days').length === 1);
cek(
  'header "Document Completeness" kini terakhir (ditambah 17/11/2026 09:26 WIB), Remaining Value kedua terakhir',
  header[header.length - 1] === 'Document Completeness' &&
    header[header.length - 2] === 'Remaining Value',
);
cek(
  'header "Contract Value" kini awal blok nilai (sesudah Payment Deadline, sebelum Fine Value)',
  header.indexOf('Contract Value') === header.indexOf('Payment Deadline') + 1 &&
    header.indexOf('Contract Value') === header.indexOf('Fine Value') - 1,
);
cek(
  'sel Remaining Days pakai helper sisaHariKerjaSama',
  tabKontrak.includes('sisaHariKerjaSama(k)'),
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
cek('filter Payment Status ada', tabKontrak.includes('<Label>Payment Status</Label>'));
cek('filter Cooperation Status ada', tabKontrak.includes('<Label>Cooperation Status</Label>'));
cek(
  'opsi filter Payment Status 5 (All + 5 status)',
  ['Unpaid', 'Paid', 'Partially-Paid', 'Insufficient Payment', 'Overdue'].every((o) =>
    tabKontrak.includes(`value="${o}">${o}`),
  ),
);
cek(
  'urutan opsi filter Payment Status: Partially-Paid, Insufficient Payment, Overdue',
  tabKontrak.indexOf('value="Partially-Paid"') <
    tabKontrak.indexOf('value="Insufficient Payment"') &&
    tabKontrak.indexOf('value="Insufficient Payment"') <
      tabKontrak.indexOf('value="Overdue"'),
);
cek(
  'opsi filter Cooperation Status 3',
  ['Completed', 'On-Going', 'Upcoming'].every((o) =>
    tabKontrak.includes(`value="${o}">${o}`),
  ),
);
cek(
  'kontrakTersaring pakai statusPembayaranKontrak',
  tabKontrak.includes('statusPembayaranKontrak(k, data.tagihan, data.pembayaran, data.denda)'),
);
cek(
  'kontrakTersaring pakai statusKerjaSamaKontrak',
  tabKontrak.includes('statusKerjaSamaKontrak(k)'),
);
cek('"Service / BMN Detail" 0x di TabKontrak', !tabKontrak.includes('Service / BMN Detail'));
cek('header "Service Detail" ada di TabKontrak', tabKontrak.includes('<Th>Service Detail</Th>'));
cek('kontrol Sort by ada', tabKontrak.includes('<Label>Sort by</Label>'));
cek('kontrol Order ada', tabKontrak.includes('<Label>Order</Label>'));
cek('opsi sort Signing Date', tabKontrak.includes('value="tandaTangan">Signing Date'));
cek('opsi sort End Date', tabKontrak.includes('value="selesai">End Date'));
cek('opsi sort Contract Value', tabKontrak.includes('value="nilai">Contract Value'));
cek('opsi sort Remaining Days', tabKontrak.includes('value="sisaHari">Remaining Days'));
cek(
  'opsi sort tetap 4 (tidak ada sort baru untuk 6 kolom nilai)',
  (tabKontrak
    .slice(
      tabKontrak.indexOf('<Label>Sort by</Label>'),
      tabKontrak.indexOf('<Label>Order</Label>'),
    )
    .match(/<option /g) ?? []).length === 4,
);
cek('"Account Code" 0x di DetailKontrak', !deals.slice(akhir, deals.indexOf('function FormKontrak', akhir)).includes('Account code'));
// Filter Status LAMA (kolom Status, PR #54) tetap tidak ada — asersi
// dipersempit ke pengenal lamanya, karena nama filter baru
// (filterStatusPembayaran / filterStatusKerjaSama) mengandung substring
// 'filterStatus'.
cek(
  'filterStatus lama 0x di Deals.tsx',
  !deals.includes('[filterStatus, setFilterStatus]') &&
    !deals.includes('filterStatus={filterStatus}'),
);
cek(
  'filterStatus lama 0x di KerjaSama.tsx',
  !kerjaSama.includes('[filterStatus, setFilterStatus]') &&
    !kerjaSama.includes('filterStatus={filterStatus}'),
);
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

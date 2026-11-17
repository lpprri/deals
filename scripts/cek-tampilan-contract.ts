// Cek tampilan baru tabel Contract (PR tampilan-baru-contract + PR
// contract-signing-date + PR filter-contract-status + PR
// remaining-days-contract + PR kolom-status-pembayaran): 11 kolom — No.,
// Contract & Reference Number (gabungan, keputusan pengguna 16/11/2026
// 13:35 WIB), Contract Title, Signing Date (= Creation Date per keputusan
// pengguna 16/11/2026, dari tanggalTandaTangan dengan fallback
// tanggalMulai), Client, Service Type, Service Detail (nama layanan,
// gabung "; " — header diganti dari "Service / BMN Detail" per keputusan
// pengguna 16/11/2026 13:58 WIB), Contract Period, Remaining Days
// (hitung mundur sampai tanggalSelesai, "Completed" bila status Selesai —
// keputusan pengguna 16/11/2026 15:29 WIB), Status Pembayaran (label
// Bahasa Indonesia: Lunas / Belum Bayar / Kurang Bayar / Keterlambatan
// Pembayaran — keputusan pengguna 17/11/2026 08:04 WIB; definisi status
// tetap PR #60), Contract Value; nomor
// urut "No." mengikuti urutan tampil sesudah filter + sort (keputusan
// pengguna 16/11/2026 13:31 WIB), filter Client Type + PNBP Type +
// Payment Status + Cooperation Status (keputusan pengguna 16/11/2026
// 13:56 WIB), sort 4 kunci (Signing Date / End Date / Contract Value /
// Remaining Days — opsi ke-4 keputusan pengguna 16/11/2026 15:37 WIB),
// tanpa Account Code dan tanpa Status di tabel; total kontrol tidak
// berubah.
import * as fs from 'node:fs';
import { DATA_NYATA } from '../src/lib/seedNyata';
import { dibayarTerverifikasi, hitungTotalKontrol } from '../src/lib/derive';
import { selisihHari } from '../src/lib/format';
import {
  detailLayananKontrak,
  jenisKlienYangAda,
  judulKontrak,
  labelArahUrutKontrak,
  labelStatusPembayaranKontrak,
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
// DIKOREKSI pengguna 16/11/2026 15:13–15:15 WIB — membalik precedence PR #58) ----------
// Aturan BARU (helper statusPembayaranKontrak, hari ini = 2026-11-16);
// pembandingnya NILAI KONTRAK + DENDA, bukan nilai tagihan:
// Paid = dibayar Terverifikasi >= nilaiKontrak + total denda;
// Partially-Paid = 0 < dibayar < nilaiKontrak + total denda (tidak peduli
// sudah lewat jatuh tempo atau belum — 6 kontrak bayar-sebagian yang dulu
// Overdue kini Partially-Paid, ditambah 5 kontrak sewa multi-tahun yang
// tagihannya baru tahun pertama: 1051/1052/1053, 016, 027);
// Overdue = dibayar 0 DAN ada tagihan lewat jatuh tempo;
// Unpaid = dibayar 0 DAN belum ada tagihan lewat jatuh tempo.
// Hanya pembayaran Terverifikasi yang dihitung.
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
  'payment status 1744 = Partially-Paid (dibayar 15.000.000 dari 15.000.000 + denda 900.000)',
  statusBayar('1744/PKS/RRI.PLB/03/2026') === 'Partially-Paid',
);
cek(
  'payment status 2919 = Partially-Paid (dibayar 1.500.000 dari 1.500.000 + denda 30.000)',
  statusBayar('2919/PKS/RRI.PLB/04/2026') === 'Partially-Paid',
);
cek(
  'payment status 2920 = Partially-Paid (dibayar 1.000.000 dari 1.000.000 + denda 20.000)',
  statusBayar('2920/PKS/RRI.PLB/04/2026') === 'Partially-Paid',
);
cek(
  'payment status 7052 = Partially-Paid (dibayar 6.000.000 dari 6.000.000 + denda 1.440.000)',
  statusBayar('7052/PKS/RRI.PLB/07/2026') === 'Partially-Paid',
);
cek(
  'payment status 7054 = Partially-Paid (dibayar 7.904.292 dari 7.904.292 + denda 1.897.030)',
  statusBayar('7054/PKS/RRI.PLB/07/2026') === 'Partially-Paid',
);
cek(
  'payment status 7060 = Partially-Paid (dibayar 4.116.000 dari 4.116.000 + denda 987.840)',
  statusBayar('7060/PKS/RRI.PLB/07/2026') === 'Partially-Paid',
);
cek(
  'payment status 1051 = Partially-Paid (sewa 3 tahun, baru dibayar 1 tahun: 6.455.000 dari 19.365.000)',
  statusBayar('1051/PKS/RRI.PLB/02/2026') === 'Partially-Paid',
);
cek(
  'payment status 1052 = Partially-Paid (sewa 3 tahun, baru dibayar 1 tahun: 6.455.000 dari 19.365.000)',
  statusBayar('1052/PKS/RRI.PLB/02/2026') === 'Partially-Paid',
);
cek(
  'payment status 1053 = Partially-Paid (sewa 3 tahun, baru dibayar 1 tahun: 5.648.000 dari 16.944.000)',
  statusBayar('1053/PKS/RRI.PLB/02/2026') === 'Partially-Paid',
);
cek(
  'payment status 016 VGreen = Partially-Paid (dibayar 34.292.500 dari 51.438.750)',
  statusBayar('016/PKS/DIR.LPU/06/2025') === 'Partially-Paid',
);
cek(
  'payment status 027 Darojad = Partially-Paid (dibayar 22.492.500 dari 33.738.750)',
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
  'payment status Partially-Paid = 11 (6 bayar-sebagian + denda + 5 sewa multi-tahun)',
  hitungBayar('Partially-Paid') === 11,
  `${hitungBayar('Partially-Paid')}`,
);
cek('payment status Unpaid = 3', hitungBayar('Unpaid') === 3, `${hitungBayar('Unpaid')}`);
cek(
  'payment status Overdue = 0 (jujur: 3 kontrak tanpa pembayaran semuanya belum jatuh tempo)',
  hitungBayar('Overdue') === 0,
  `${hitungBayar('Overdue')}`,
);

// ---------- kolom Status Pembayaran (keputusan pengguna 17/11/2026 08:04 WIB) ----------
// Label kolom Bahasa Indonesia, statusnya tetap dari
// statusPembayaranKontrak (definisi PR #60, tidak berubah); opsi filter
// Payment Status TETAP Bahasa Inggris (asersi di bawah, bagian struktur).
// Nilai "Overdue" TIDAK BISA dites lewat baris tabel — saat ini tidak ada
// kontrak Overdue di seed (0, lihat asersi di atas) — jadi hanya dites
// lewat helper label di bawah, bukan lewat baris.
const labelBayar = (nomor: string) =>
  labelStatusPembayaranKontrak(statusBayar(nomor));
cek("label Paid = 'Lunas'", labelStatusPembayaranKontrak('Paid') === 'Lunas');
cek(
  "label Unpaid = 'Belum Bayar'",
  labelStatusPembayaranKontrak('Unpaid') === 'Belum Bayar',
);
cek(
  "label Partially-Paid = 'Kurang Bayar'",
  labelStatusPembayaranKontrak('Partially-Paid') === 'Kurang Bayar',
);
cek(
  "label Overdue = 'Keterlambatan Pembayaran'",
  labelStatusPembayaranKontrak('Overdue') === 'Keterlambatan Pembayaran',
);
cek(
  'kolom Status Pembayaran 0603 = Lunas',
  labelBayar('0603/PKS/RRI.PLB/01/2026') === 'Lunas',
);
cek(
  'kolom Status Pembayaran 018 = Belum Bayar',
  labelBayar('018/PKS/DIR.LPU/08/2026') === 'Belum Bayar',
);
cek(
  'kolom Status Pembayaran 1051 = Kurang Bayar',
  labelBayar('1051/PKS/RRI.PLB/02/2026') === 'Kurang Bayar',
);
cek(
  'kolom Status Pembayaran 10227 = Belum Bayar',
  labelBayar('10227/PKS/RRI.PLB/10/2026') === 'Belum Bayar',
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
// semuanya Partially-Paid — tidak ada lagi yang masuk Overdue.
const bayarSebagian = kontrak.filter((k) => {
  const tg = DATA_NYATA.tagihan.filter((t) => t.kontrakId === k.id);
  const total = tg.reduce(
    (s, t) => s + dibayarTerverifikasi(t.id, DATA_NYATA.pembayaran),
    0,
  );
  return total > 0 && total < k.nilaiKontrak + dendaKontrak(k);
});
cek(
  '11 kontrak bayar-sebagian (vs nilaiKontrak + denda) semuanya Partially-Paid',
  bayarSebagian.length === 11 &&
    bayarSebagian.every(
      (k) =>
        statusPembayaranKontrak(
          k,
          DATA_NYATA.tagihan,
          DATA_NYATA.pembayaran,
          DATA_NYATA.denda,
          HARI_INI,
        ) === 'Partially-Paid',
    ),
  `${bayarSebagian.length}`,
);
// Kategori saling lepas: jumlah keempatnya = 42.
cek(
  'payment status saling lepas (28+11+3+0 = 42)',
  hitungBayar('Paid') +
    hitungBayar('Partially-Paid') +
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
  'filter Partially-Paid = 11 baris',
  sebagianNilaiDesc.length === 11,
  `${sebagianNilaiDesc.length}`,
);
cek(
  'filter Partially-Paid + sort nilai desc pertama 016 VGreen',
  sebagianNilaiDesc[0].nomorPks === '016/PKS/DIR.LPU/06/2025',
  sebagianNilaiDesc[0].nomorPks,
);
cek(
  'filter Partially-Paid + sort nilai desc terakhir 2920',
  sebagianNilaiDesc[10].nomorPks === '2920/PKS/RRI.PLB/04/2026',
  sebagianNilaiDesc[10].nomorPks,
);
cek(
  'filter Partially-Paid + sort nilai desc urutan 016, 027, 1051, 1052, 1053',
  JSON.stringify(sebagianNilaiDesc.slice(0, 5).map((k) => k.nomorPks.split('/')[0])) ===
    JSON.stringify(['016', '027', '1051', '1052', '1053']),
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
  'filter gabungan Fungsional + Partially-Paid = 3 (1744, 2919, 2920)',
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
  'filter gabungan Partially-Paid + Completed = 6 (1744, 2919, 2920, 7052, 7054, 7060)',
  kontrak.filter(
    (k) =>
      statusPembayaranKontrak(
        k,
        DATA_NYATA.tagihan,
        DATA_NYATA.pembayaran,
        DATA_NYATA.denda,
        HARI_INI,
      ) === 'Partially-Paid' && statusKerjaSamaKontrak(k, HARI_INI) === 'Completed',
  ).length === 6,
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

// ---------- struktur sumber TabKontrak ----------
const deals = fs.readFileSync('src/modules/Deals.tsx', 'utf8');
const kerjaSama = fs.readFileSync('src/modules/KerjaSama.tsx', 'utf8');
const awal = deals.indexOf('export function TabKontrak');
const akhir = deals.indexOf('function DetailKontrak', awal);
const tabKontrak = deals.slice(awal, akhir);
const header = [...tabKontrak.matchAll(/<Th[^>]*>([^<]+)<\/Th>/g)].map((m) => m[1]);
cek(
  'urutan 11 header kolom (No. paling kiri, Remaining Days sesudah Contract Period, Status Pembayaran sesudah Remaining Days, Contract Value tetap terakhir)',
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
      'Status Pembayaran',
      'Contract Value',
    ]),
  JSON.stringify(header),
);
cek('header "Status Pembayaran" 1x', header.filter((h) => h === 'Status Pembayaran').length === 1);
cek(
  'header "Status Pembayaran" sesudah Remaining Days, sebelum Contract Value',
  header.indexOf('Status Pembayaran') === header.indexOf('Remaining Days') + 1 &&
    header.indexOf('Status Pembayaran') === header.indexOf('Contract Value') - 1,
);
cek(
  'sel Status Pembayaran pakai helper labelStatusPembayaranKontrak + statusPembayaranKontrak',
  tabKontrak.includes('labelStatusPembayaranKontrak(') &&
    tabKontrak.includes('statusPembayaranKontrak(k, data.tagihan, data.pembayaran, data.denda)'),
);
cek('header "Remaining Days" 1x', header.filter((h) => h === 'Remaining Days').length === 1);
cek(
  'header "Contract Value" tetap terakhir',
  header[header.length - 1] === 'Contract Value',
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
  'opsi filter Payment Status 4',
  ['Unpaid', 'Paid', 'Partially-Paid', 'Overdue'].every((o) =>
    tabKontrak.includes(`value="${o}">${o}`),
  ),
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

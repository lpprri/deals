// Cek restruktur Detail Kontrak (draft pengguna 16/11/2026 + jawaban
// 7 pertanyaan 16/11/2026 16:34 WIB): 4 bagian — Partnership Details,
// Client, Revenue, Special Details (kondisional Umum/Fungsional);
// Employee Rank Attribution tetap (di bawah Partnership Details);
// Realisasi Kerja Sama dari file sumber (per layanan), Piutang =
// (nilaiKontrak + total denda) x % Realisasi, Sisa Kontrak =
// (nilaiKontrak + total denda) x (1 - % Realisasi), Sisa Piutang =
// Piutang - pembayaran Terverifikasi; NTB/NTPN dipisah dari buktiSetor;
// nama klien bisa diklik -> menu Clients dengan klien itu terpilih;
// jendela Prime/Regular Time dari SK 31/2026; total kontrol tidak berubah.
import * as fs from 'node:fs';
import { DATA_NYATA } from '../src/lib/seedNyata';
import { hitungTotalKontrol, sisaTagihan } from '../src/lib/derive';
import {
  JENDELA_WAKTU_SIAR,
  formatPersenRealisasi,
  kodeBillingKontrak,
  piutangRealisasi,
  pisahBuktiSetor,
  realisasiKontrak,
  realisasiLayanan,
  sisaKontrakRealisasi,
  sisaPiutangRealisasi,
  totalDendaKontrak,
  totalPembayaranKontrak,
} from '../src/lib/realisasi';
import { daftarDokumenKontrak, kelengkapanDokumen } from '../src/lib/dokumenKontrak';
import { statusPembayaranKontrak } from '../src/lib/kontrakTampilan';
import type { Kontrak, Tagihan } from '../src/lib/types';

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};

const HARI_INI = '2026-11-16';
const { kontrak, tagihan, pembayaran, denda, dokumen } = DATA_NYATA;
const cariKontrak = (id: string): Kontrak => {
  const k = kontrak.find((x) => x.id === id);
  if (!k) throw new Error(`kontrak ${id} tidak ditemukan`);
  return k;
};
const dekat = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) <= tol;

// ---------- field baru di seed ----------
const jmlPenandatangan = kontrak.filter((k) => k.penandatanganNama).length;
cek('penandatangan terisi 41/42', jmlPenandatangan === 41, `${jmlPenandatangan}`);
cek(
  '018 tanpa penandatangan (kosong di sumber)',
  cariKontrak('018/PKS/DIR.LPU/08/2026').penandatanganNama === undefined,
);
cek(
  '0603 penandatangan + jabatan',
  cariKontrak('0603/PKS/RRI.PLB/01/2026').penandatanganNama === 'Ilham Juliando' &&
    cariKontrak('0603/PKS/RRI.PLB/01/2026').penandatanganJabatan ===
      'K3 dan Keamanan PLN UPT Palembang',
);
cek(
  '001 penandatangan Henra / Corporate Secretary',
  cariKontrak('001/PKS/DIR.LPU/01/2026').penandatanganNama === 'Henra' &&
    cariKontrak('001/PKS/DIR.LPU/01/2026').penandatanganJabatan ===
      'Corporate Secretary',
);
cek(
  '1051 penandatangan perorangan tanpa jabatan',
  cariKontrak('1051/PKS/RRI.PLB/02/2026').penandatanganNama === 'Aminul Khair' &&
    cariKontrak('1051/PKS/RRI.PLB/02/2026').penandatanganJabatan === undefined,
);
cek(
  '016 penandatangan Loura Hardjaloka',
  cariKontrak('016/PKS/DIR.LPU/06/2025').penandatanganNama === 'Loura Hardjaloka',
);
cek(
  '027 penandatangan Darojad',
  cariKontrak('027/RRI.PLB/PKS.U/06/2025').penandatanganNama === 'Darojad',
);
const jmlBmn = kontrak.filter((k) => k.jenisBmn).length;
cek('BMN terisi 17 kontrak Umum', jmlBmn === 17, `${jmlBmn}`);
cek(
  '1051 BMN lengkap',
  cariKontrak('1051/PKS/RRI.PLB/02/2026').jenisBmn === 'Lahan' &&
    cariKontrak('1051/PKS/RRI.PLB/02/2026').lokasiBmn ===
      'Pemancar RRI Palembang di Indralaya' &&
    cariKontrak('1051/PKS/RRI.PLB/02/2026').ukuranBmn === '4 m x 20 m' &&
    cariKontrak('1051/PKS/RRI.PLB/02/2026').luasBmn === '80m2' &&
    cariKontrak('1051/PKS/RRI.PLB/02/2026').dasarNilai === 'S-476/MK/KNL.0402/2025',
);
cek(
  '016 BMN (blok 2 file): Lahan, 2.5 m x 5 m, S-103',
  cariKontrak('016/PKS/DIR.LPU/06/2025').jenisBmn === 'Lahan' &&
    cariKontrak('016/PKS/DIR.LPU/06/2025').ukuranBmn === '2.5 m x 5 m' &&
    cariKontrak('016/PKS/DIR.LPU/06/2025').luasBmn === '12,5m2' &&
    cariKontrak('016/PKS/DIR.LPU/06/2025').dasarNilai === 'S-103/MK/KNL.0402/2025',
);
cek(
  '10828 BMN: 465 m x 1000 m, S-292',
  cariKontrak('10828/PKS/RRI.PLB/10/2026').ukuranBmn === '465 m x 1000 m' &&
    cariKontrak('10828/PKS/RRI.PLB/10/2026').dasarNilai ===
      'S-292/MK/KNL.0402/2026',
);
cek(
  'kontrak Fungsional tanpa BMN (0603)',
  cariKontrak('0603/PKS/RRI.PLB/01/2026').jenisBmn === undefined &&
    cariKontrak('0603/PKS/RRI.PLB/01/2026').dasarNilai === undefined,
);
const jmlRealisasi = kontrak.reduce(
  (s, k) => s + k.layanan.filter((l) => typeof l.realisasi === 'number').length,
  0,
);
cek('realisasi per layanan terisi 44/48', jmlRealisasi === 44, `${jmlRealisasi}`);
const jmlPrime = kontrak.reduce(
  (s, k) => s + k.layanan.filter((l) => l.jenisWaktu === 'Prime Time').length,
  0,
);
cek("jenisWaktu 'Prime Time' 28 layanan", jmlPrime === 28, `${jmlPrime}`);
const jmlRegular = kontrak.reduce(
  (s, k) => s + k.layanan.filter((l) => l.jenisWaktu === 'Regular Time').length,
  0,
);
cek("jenisWaktu 'Regular Time' 0 (tidak ada di data)", jmlRegular === 0, `${jmlRegular}`);

// ---------- rumus realisasi / piutang / sisa (hari ini 2026-11-16) ----------
const k1051 = cariKontrak('1051/PKS/RRI.PLB/02/2026');
cek('1051 realisasi 1/3', dekat(realisasiKontrak(k1051, HARI_INI), 1 / 3), `${realisasiKontrak(k1051, HARI_INI)}`);
cek('1051 piutang 6.455.000', piutangRealisasi(k1051, tagihan, denda, HARI_INI) === 6455000, `${piutangRealisasi(k1051, tagihan, denda, HARI_INI)}`);
cek('1051 sisa kontrak 12.910.000', sisaKontrakRealisasi(k1051, tagihan, denda, HARI_INI) === 12910000, `${sisaKontrakRealisasi(k1051, tagihan, denda, HARI_INI)}`);
cek('1051 sisa piutang 0', sisaPiutangRealisasi(k1051, tagihan, denda, pembayaran, HARI_INI) === 0, `${sisaPiutangRealisasi(k1051, tagihan, denda, pembayaran, HARI_INI)}`);
cek('1052 piutang 6.455.000', piutangRealisasi(cariKontrak('1052/PKS/RRI.PLB/02/2026'), tagihan, denda, HARI_INI) === 6455000);
cek('1053 piutang 5.648.000', piutangRealisasi(cariKontrak('1053/PKS/RRI.PLB/02/2026'), tagihan, denda, HARI_INI) === 5648000);

const k016 = cariKontrak('016/PKS/DIR.LPU/06/2025');
cek('016 realisasi 2/3', dekat(realisasiKontrak(k016, HARI_INI), 2 / 3), `${realisasiKontrak(k016, HARI_INI)}`);
cek('016 piutang 34.292.500', piutangRealisasi(k016, tagihan, denda, HARI_INI) === 34292500, `${piutangRealisasi(k016, tagihan, denda, HARI_INI)}`);
cek('016 sisa kontrak 17.146.250', sisaKontrakRealisasi(k016, tagihan, denda, HARI_INI) === 17146250, `${sisaKontrakRealisasi(k016, tagihan, denda, HARI_INI)}`);
cek('016 sisa piutang 0', sisaPiutangRealisasi(k016, tagihan, denda, pembayaran, HARI_INI) === 0);
const k027 = cariKontrak('027/RRI.PLB/PKS.U/06/2025');
cek('027 realisasi 2/3', dekat(realisasiKontrak(k027, HARI_INI), 2 / 3));
cek('027 piutang 22.492.500', piutangRealisasi(k027, tagihan, denda, HARI_INI) === 22492500, `${piutangRealisasi(k027, tagihan, denda, HARI_INI)}`);
cek('027 sisa kontrak 11.246.250', sisaKontrakRealisasi(k027, tagihan, denda, HARI_INI) === 11246250);

const k0603 = cariKontrak('0603/PKS/RRI.PLB/01/2026');
cek('0603 realisasi 100%', realisasiKontrak(k0603, HARI_INI) === 1);
cek('0603 piutang 270.000', piutangRealisasi(k0603, tagihan, denda, HARI_INI) === 270000);
cek('0603 sisa piutang 0', sisaPiutangRealisasi(k0603, tagihan, denda, pembayaran, HARI_INI) === 0);
const k001 = cariKontrak('001/PKS/DIR.LPU/01/2026');
cek('001 piutang 1.550.000', piutangRealisasi(k001, tagihan, denda, HARI_INI) === 1550000);
cek('001 sisa piutang 0', sisaPiutangRealisasi(k001, tagihan, denda, pembayaran, HARI_INI) === 0);

const k11290 = cariKontrak('11290/PKS/RRI.PLB/10/2026');
cek('11290 realisasi 100% (per file) meski Belum Bayar', realisasiKontrak(k11290, HARI_INI) === 1);
cek('11290 piutang 2.000.000', piutangRealisasi(k11290, tagihan, denda, HARI_INI) === 2000000);
cek('11290 sisa piutang 2.000.000', sisaPiutangRealisasi(k11290, tagihan, denda, pembayaran, HARI_INI) === 2000000);
cek('11290 sisa kontrak 0', sisaKontrakRealisasi(k11290, tagihan, denda, HARI_INI) === 0);

const k7054 = cariKontrak('7054/PKS/RRI.PLB/07/2026');
cek('7054 piutang 9.801.322 (nilai+denda)', piutangRealisasi(k7054, tagihan, denda, HARI_INI) === 9801322, `${piutangRealisasi(k7054, tagihan, denda, HARI_INI)}`);
cek('7054 sisa piutang 1.897.030', sisaPiutangRealisasi(k7054, tagihan, denda, pembayaran, HARI_INI) === 1897030, `${sisaPiutangRealisasi(k7054, tagihan, denda, pembayaran, HARI_INI)}`);
cek('7054 denda 1.897.030', totalDendaKontrak(k7054, tagihan, denda) === 1897030);

const k018 = cariKontrak('018/PKS/DIR.LPU/08/2026');
cek(
  '018 realisasi per layanan 58/95, 1/2, 0',
  dekat(k018.layanan[0].realisasi ?? -1, 58 / 95) &&
    dekat(k018.layanan[1].realisasi ?? -1, 0.5) &&
    (k018.layanan[2].realisasi ?? -1) === 0,
);
cek(
  '018 realisasi tertimbang = piutang/tagihan',
  dekat(realisasiKontrak(k018, HARI_INI), 4110000 / 7975000),
  `${realisasiKontrak(k018, HARI_INI)}`,
);
cek('018 piutang 4.110.000', piutangRealisasi(k018, tagihan, denda, HARI_INI) === 4110000, `${piutangRealisasi(k018, tagihan, denda, HARI_INI)}`);
cek('018 sisa kontrak 3.865.000', sisaKontrakRealisasi(k018, tagihan, denda, HARI_INI) === 3865000);
cek('018 sisa piutang 4.110.000', sisaPiutangRealisasi(k018, tagihan, denda, pembayaran, HARI_INI) === 4110000);

const k10227 = cariKontrak('10227/PKS/RRI.PLB/10/2026');
cek('10227 realisasi 60/111', dekat(realisasiKontrak(k10227, HARI_INI), 60 / 111), `${realisasiKontrak(k10227, HARI_INI)}`);
cek('10227 piutang 2.700.000', piutangRealisasi(k10227, tagihan, denda, HARI_INI) === 2700000);
cek('10227 sisa kontrak 2.295.000', sisaKontrakRealisasi(k10227, tagihan, denda, HARI_INI) === 2295000);
cek('10227 sisa piutang 2.700.000', sisaPiutangRealisasi(k10227, tagihan, denda, pembayaran, HARI_INI) === 2700000);

const k5390 = cariKontrak('5390/PKS/RRI.PLB/06/2026');
cek(
  '5390 layanan Siaran Langsung tanpa realisasi tersimpan (fallback)',
  k5390.layanan[1].realisasi === undefined &&
    k5390.layanan[2].realisasi === undefined,
);
cek('5390 realisasi 100% (Selesai -> fallback 100%)', realisasiKontrak(k5390, HARI_INI) === 1);
cek('5390 piutang 3.500.000', piutangRealisasi(k5390, tagihan, denda, HARI_INI) === 3500000);

const k1744 = cariKontrak('1744/PKS/RRI.PLB/03/2026');
cek('1744 piutang 15.900.000 (nilai+denda)', piutangRealisasi(k1744, tagihan, denda, HARI_INI) === 15900000);
cek('1744 sisa piutang 900.000', sisaPiutangRealisasi(k1744, tagihan, denda, pembayaran, HARI_INI) === 900000);

// Konsistensi silang: piutang (realisasi) == tagihan file (toleransi Rp1
// untuk pembulatan impor 7054) — bukti realisasi dari file mereproduksi
// nilai tagihan yang sudah diverifikasi di PR #52.
let selisihBesar = 0;
for (const k of kontrak) {
  const p = piutangRealisasi(k, tagihan, denda, HARI_INI);
  const t = tagihan
    .filter((x) => x.kontrakId === k.id)
    .reduce((s, x) => s + x.nilai, 0);
  if (Math.abs(p - t) > 1) selisihBesar += 1;
  const sp = sisaPiutangRealisasi(k, tagihan, denda, pembayaran, HARI_INI);
  const st = tagihan
    .filter((x) => x.kontrakId === k.id)
    .reduce((s, x) => s + sisaTagihan(x, pembayaran), 0);
  if (Math.abs(sp - st) > 1) selisihBesar += 1;
}
cek('piutang & sisa piutang (realisasi) == tagihan, 42 kontrak', selisihBesar === 0, `${selisihBesar} selisih > Rp1`);

// ---------- aturan fallback (kontrak sintetis, tanpa realisasi tersimpan) ----------
const satker41 = { kode: '41', nama: 'PALEMBANG' };
const sintetis = (
  id: string,
  jenisPnBP: 'Fungsional' | 'Umum',
  status: 'Aktif' | 'Selesai',
  mulai: string,
  selesai: string,
  layanan: Kontrak['layanan'],
): Kontrak => ({
  id,
  nomorPks: id,
  klienId: 'KLN-001',
  jenisPnBP,
  kategoriLayanan: 'Jasa Penyiaran',
  tanggalMulai: mulai,
  tanggalSelesai: selesai,
  nilaiKontrak: 2900000,
  status,
  penanggungJawab: 'Tes',
  satker: satker41,
  layanan,
});
const lay = (
  satuan: string,
  jumlah: number,
  subtotal: number,
): Kontrak['layanan'][number] => ({
  id: 'LYN-TES',
  namaLayanan: 'Tes',
  kategori: 'Jasa Penyiaran',
  kodeAkun: '425531',
  jenisPnBP: 'Fungsional',
  satuan,
  tarif: subtotal / jumlah,
  jumlah,
  subtotal,
});
cek(
  'fallback Fungsional berjalan: 15/29 hari',
  dekat(
    realisasiKontrak(
      sintetis('TES-1', 'Fungsional', 'Aktif', '2026-11-01', '2026-11-30', [
        lay('Menit', 29, 2900000),
      ]),
      HARI_INI,
    ),
    15 / 29,
  ),
);
cek(
  'fallback Umum 3 tahun: 1/3',
  dekat(
    realisasiKontrak(
      sintetis('TES-2', 'Umum', 'Aktif', '2026-02-01', '2029-01-31', [
        lay('Tahun', 3, 3000000),
      ]),
      HARI_INI,
    ),
    1 / 3,
  ),
);
cek(
  'fallback Umum 1 tahun: 100%',
  realisasiKontrak(
    sintetis('TES-3', 'Umum', 'Aktif', '2026-02-01', '2027-01-31', [
      lay('Tahun', 1, 3000000),
    ]),
    HARI_INI,
  ) === 1,
);
cek(
  'fallback Selesai tanpa realisasi: 100%',
  realisasiKontrak(
    sintetis('TES-4', 'Fungsional', 'Selesai', '2026-01-01', '2026-01-31', [
      lay('Menit', 10, 1000000),
    ]),
    HARI_INI,
  ) === 1,
);
cek(
  'fallback Fungsional belum mulai: 0%',
  realisasiKontrak(
    sintetis('TES-5', 'Fungsional', 'Aktif', '2026-12-01', '2026-12-31', [
      lay('Menit', 10, 1000000),
    ]),
    HARI_INI,
  ) === 0,
);

// ---------- NTB / NTPN / kode billing ----------
const p0603 = pembayaran.filter((p) =>
  tagihan.some((t) => t.id === p.tagihanId && t.kontrakId === k0603.id),
);
cek('0603 punya 1 pembayaran', p0603.length === 1, `${p0603.length}`);
const bukti0603 = pisahBuktiSetor(p0603[0]?.buktiSetor);
cek('0603 NTB 820260205527034', bukti0603.ntb === '820260205527034', `${bukti0603.ntb}`);
cek('0603 NTPN 812AE3CIG6I7VVVQ', bukti0603.ntpn === '812AE3CIG6I7VVVQ', `${bukti0603.ntpn}`);
cek(
  '0603 kode billing = NTB (sama dgn KODE BILLING Finance)',
  kodeBillingKontrak(p0603) === '820260205527034',
);
const p1051 = pembayaran.filter((p) =>
  tagihan.some((t) => t.id === p.tagihanId && t.kontrakId === k1051.id),
);
cek('1051 kode billing 820260129497246', kodeBillingKontrak(p1051) === '820260129497246');
cek(
  '11290 tanpa pembayaran -> kode billing null',
  kodeBillingKontrak(
    pembayaran.filter((p) =>
      tagihan.some((t) => t.id === p.tagihanId && t.kontrakId === k11290.id),
    ),
  ) === null,
);
let buktiBuruk = 0;
let ntbLegacy = 0;
for (const p of pembayaran) {
  const { ntb, ntpn } = pisahBuktiSetor(p.buktiSetor);
  if (!p.buktiSetor) continue;
  // Dua pembayaran 2025 (BYR-039, BYR-041) membawa NTB bank 12 digit —
  // BUKAN kode billing; dicatat terpisah di bawah, bukan dihitung buruk.
  if (ntb && /^82\d{13}$/.test(ntb)) {
    if (!ntpn || ntpn.length !== 16) buktiBuruk += 1;
  } else if (ntb && /^\d{12}$/.test(ntb)) {
    ntbLegacy += 1;
  } else {
    buktiBuruk += 1;
  }
}
cek('43 pembayaran 2026: NTB kode billing 15 digit + NTPN 16 karakter', buktiBuruk === 0, `${buktiBuruk} buruk`);
cek('tepat 2 NTB legacy 12 digit (BYR-039, BYR-041, tahun 2025)', ntbLegacy === 2, `${ntbLegacy}`);
cek(
  'BYR-041 NTPN 15 karakter (anomali sumber, tampil apa adanya)',
  pisahBuktiSetor(
    pembayaran.find((p) => p.id === 'BYR-041')?.buktiSetor,
  ).ntpn === '28611JNG8I74UDF',
);
cek(
  '027 kode billing dari pembayaran 2026 (BYR-040), bukan NTB legacy 2025',
  kodeBillingKontrak(
    pembayaran.filter((p) =>
      tagihan.some((t) => t.id === p.tagihanId && t.kontrakId === k027.id),
    ),
  ) === '820260618264146',
);
cek(
  '016 kode billing dari pembayaran 2026 (BYR-042)',
  kodeBillingKontrak(
    pembayaran.filter((p) =>
      tagihan.some((t) => t.id === p.tagihanId && t.kontrakId === k016.id),
    ),
  ) === '820260812804390',
);
cek('buktiSetor kosong -> null/null', pisahBuktiSetor('').ntb === null && pisahBuktiSetor().ntpn === null);
cek('buktiSetor tanpa NTPN -> ntpn null', pisahBuktiSetor('NTB 820260205527034').ntpn === null);

// ---------- jendela waktu SK 31/2026 ----------
cek('SK punya 3 programa (1, 2, 4)', JENDELA_WAKTU_SIAR.length === 3, `${JENDELA_WAKTU_SIAR.length}`);
cek(
  'SK tanpa Programa 3',
  !JENDELA_WAKTU_SIAR.some((j) => j.programa === 'Programa 3'),
);
cek(
  'P1 Prime memuat 05.00–13.30',
  JENDELA_WAKTU_SIAR[0].prime.includes('05.00–13.30'),
);
cek(
  'P4 Regular memuat 20.00–24.00',
  (JENDELA_WAKTU_SIAR.find((j) => j.programa === 'Programa 4')?.regular ?? []).includes(
    '20.00–24.00',
  ),
);
cek('format persen 1/3 -> 33.3%', formatPersenRealisasi(1 / 3) === '33.3%', formatPersenRealisasi(1 / 3));
cek('format persen 1 -> 100%', formatPersenRealisasi(1) === '100%');

// ---------- struktur UI DetailKontrak (grep sumber) ----------
const deals = fs.readFileSync('src/modules/Deals.tsx', 'utf-8');
for (const teks of [
  'Partnership Details',
  'Employee Rank Attribution',
  'Client',
  'Revenue',
  'Special Details',
  'Contact Person',
  'Signatory',
  'Due Date',
  'KPKNL Approval Letter No.',
  'Outstanding Receivables (realisation)',
  'Remaining Contract',
  'Outstanding invoice balance',
  'Prime Time (WIB)',
  'onNavigasiKlien(klien.id)',
]) {
  cek(`Deals.tsx memuat "${teks}"`, deals.includes(teks));
}
cek(
  'judul lama "Services (contract snapshot)" sudah diganti',
  !deals.includes('Services (contract snapshot)'),
);
cek(
  'label lama "Person in charge" sudah tidak ada di DetailKontrak',
  !deals
    .slice(
      deals.indexOf('function DetailKontrak'),
      deals.indexOf('function FormKontrak'),
    )
    .includes('Person in charge'),
);
const klienSrc = fs.readFileSync('src/modules/Klien.tsx', 'utf-8');
cek('Klien.tsx menyelaraskan klienIdTerpilihLuar', klienSrc.includes('klienIdTerpilihLuar'));
const appSrc = fs.readFileSync('src/App.tsx', 'utf-8');
cek('App.tsx memasang onNavigasiKlien', appSrc.includes('onNavigasiKlien'));

// ---------- cluster Document (permintaan pengguna 17/11/2026) ----------
const cariItem = (
  items: ReturnType<typeof daftarDokumenKontrak>,
  label: string,
) => items.find((x) => x.label === label);

const dok11290 = daftarDokumenKontrak(
  k11290,
  dokumen,
  tagihan,
  pembayaran,
  denda,
  HARI_INI,
);
cek('11290 cluster 7 item (Fungsional, tanpa Surat Penagihan)', dok11290.length === 7, `${dok11290.length}`);
cek(
  '11290 urutan label umum + Fungsional',
  dok11290.map((x) => x.label).join('|') ===
    'Perjanjian Kerjasama|Invoice Penagihan|Billing Pembayaran|Kwitansi Pembayaran|Nota Penyiaran|Jadwal Siar / Nota Produksi|Bukti Siar',
);
cek('11290 Perjanjian Kerjasama Belum Ada', cariItem(dok11290, 'Perjanjian Kerjasama')?.ada === false);
cek(
  '11290 Invoice Penagihan Ada (038/RRI.PLB/PKS.F/10/2026)',
  cariItem(dok11290, 'Invoice Penagihan')?.ada === true &&
    cariItem(dok11290, 'Invoice Penagihan')?.detail ===
      '038/RRI.PLB/PKS.F/10/2026',
);
cek('11290 Billing Pembayaran Belum Ada (tanpa catatan)', cariItem(dok11290, 'Billing Pembayaran')?.ada === false);
cek('11290 Kwitansi Pembayaran Belum Ada', cariItem(dok11290, 'Kwitansi Pembayaran')?.ada === false);
cek('11290 tanpa Surat Penagihan (Unpaid, bukan Overdue)', cariItem(dok11290, 'Surat Penagihan') === undefined);
cek('11290 Nota Penyiaran Belum Ada', cariItem(dok11290, 'Nota Penyiaran')?.ada === false);
cek('11290 Jadwal Siar / Nota Produksi Belum Ada', cariItem(dok11290, 'Jadwal Siar / Nota Produksi')?.ada === false);
cek('11290 Bukti Siar Belum Ada', cariItem(dok11290, 'Bukti Siar')?.ada === false);
cek(
  '11290 tanpa item Umum',
  !dok11290.some(
    (x) => x.label === 'Permohonan Sewa' || x.label === 'Persetujuan Sewa KPKNL',
  ),
);

const k10828 = cariKontrak('10828/PKS/RRI.PLB/10/2026');
const dok10828 = daftarDokumenKontrak(
  k10828,
  dokumen,
  tagihan,
  pembayaran,
  denda,
  HARI_INI,
);
cek('10828 cluster 7 item (Umum, tanpa Surat Penagihan)', dok10828.length === 7, `${dok10828.length}`);
cek(
  '10828 urutan label umum + Umum',
  dok10828.map((x) => x.label).join('|') ===
    'Perjanjian Kerjasama|Invoice Penagihan|Billing Pembayaran|Kwitansi Pembayaran|Permohonan Sewa|Pemberitahuan Persetujuan Sewa|Persetujuan Sewa KPKNL',
);
cek('10828 Permohonan Sewa Ada', cariItem(dok10828, 'Permohonan Sewa')?.ada === true);
cek(
  '10828 Persetujuan Sewa KPKNL Belum Ada + nomor S-292 sebagai referensi',
  cariItem(dok10828, 'Persetujuan Sewa KPKNL')?.ada === false &&
    cariItem(dok10828, 'Persetujuan Sewa KPKNL')?.detail ===
      'S-292/MK/KNL.0402/2026',
);
cek('10828 Pemberitahuan Persetujuan Sewa Belum Ada', cariItem(dok10828, 'Pemberitahuan Persetujuan Sewa')?.ada === false);
cek('10828 Perjanjian Kerjasama Belum Ada', cariItem(dok10828, 'Perjanjian Kerjasama')?.ada === false);
cek('10828 Invoice Penagihan Ada', cariItem(dok10828, 'Invoice Penagihan')?.ada === true);
cek('10828 tanpa Surat Penagihan (Paid, bukan Overdue)', cariItem(dok10828, 'Surat Penagihan') === undefined);
cek(
  '10828 tanpa item Fungsional',
  !dok10828.some((x) => x.label === 'Nota Penyiaran' || x.label === 'Bukti Siar'),
);

const dok0603 = daftarDokumenKontrak(
  k0603,
  dokumen,
  tagihan,
  pembayaran,
  denda,
  HARI_INI,
);
cek('0603 cluster 7 item', dok0603.length === 7, `${dok0603.length}`);
cek('0603 Perjanjian Kerjasama Ada', cariItem(dok0603, 'Perjanjian Kerjasama')?.ada === true);
cek('0603 Billing Pembayaran Ada (catatan dokumen)', cariItem(dok0603, 'Billing Pembayaran')?.ada === true);
cek('0603 Kwitansi Pembayaran Ada', cariItem(dok0603, 'Kwitansi Pembayaran')?.ada === true);
cek('0603 Invoice Penagihan Ada', cariItem(dok0603, 'Invoice Penagihan')?.ada === true);

// ---------- persentase keterpenuhan dokumen (keputusan pengguna 17/11/2026 09:26 WIB) ----------
// Persentase = item "Ada" / total item (7 normal, 8 bila Overdue) —
// dari daftar yang SAMA dengan tabel Document (daftarDokumenKontrak),
// format sama dengan Realisation (formatPersenRealisasi: 1 desimal).
const persenCluster = (items: ReturnType<typeof daftarDokumenKontrak>) =>
  kelengkapanDokumen(items);
cek(
  '11290 keterpenuhan 1/7 = 14.3% (contoh screenshot user)',
  persenCluster(dok11290).ada === 1 &&
    persenCluster(dok11290).total === 7 &&
    formatPersenRealisasi(persenCluster(dok11290).fraksi) === '14.3%',
);
cek(
  '10828 keterpenuhan 2/7 = 28.6%',
  formatPersenRealisasi(persenCluster(dok10828).fraksi) === '28.6%',
);
cek(
  '0603 keterpenuhan 4/7 = 57.1%',
  formatPersenRealisasi(persenCluster(dok0603).fraksi) === '57.1%',
);
const k1051Dok = cariKontrak('1051/PKS/RRI.PLB/02/2026');
const dok1051 = daftarDokumenKontrak(
  k1051Dok,
  dokumen,
  tagihan,
  pembayaran,
  denda,
  HARI_INI,
);
cek(
  '1051 keterpenuhan 5/7 = 71.4% (tertinggi di seed)',
  persenCluster(dok1051).ada === 5 &&
    formatPersenRealisasi(persenCluster(dok1051).fraksi) === '71.4%',
);

// Hitungan global (seed)
const hitungAda = (jenis: string) =>
  dokumen.filter((d) => d.jenisDokumen === jenis && d.status === 'Ada').length;
cek('PKS (asli) Ada 36/42', hitungAda('PKS (asli)') === 36, `${hitungAda('PKS (asli)')}`);
cek('Billing Pembayaran Ada 16', hitungAda('Billing Pembayaran') === 16, `${hitungAda('Billing Pembayaran')}`);
cek('Kwitansi Pembayaran Ada 4', hitungAda('Kwitansi Pembayaran') === 4, `${hitungAda('Kwitansi Pembayaran')}`);
cek('Permohonan Sewa Ada 14', hitungAda('Permohonan Sewa') === 14, `${hitungAda('Permohonan Sewa')}`);
cek(
  'Surat Penagihan Ada 1 (1494, tersembunyi karena bukan Overdue)',
  hitungAda('Surat Penagihan') === 1,
  `${hitungAda('Surat Penagihan')}`,
);
cek(
  "Bukti Siaran 0 catatan di seed",
  dokumen.filter((d) => d.jenisDokumen === 'Bukti Siaran').length === 0,
);
cek(
  'Invoice Penagihan Ada 42/42 (1 tagihan per kontrak)',
  kontrak.every(
    (k) =>
      daftarDokumenKontrak(k, dokumen, tagihan, pembayaran, denda, HARI_INI).find(
        (x) => x.label === 'Invoice Penagihan',
      )?.ada === true,
  ),
);
cek(
  'semua kontrak 7 item (tidak ada Overdue di data nyata)',
  kontrak.every(
    (k) =>
      daftarDokumenKontrak(k, dokumen, tagihan, pembayaran, denda, HARI_INI)
        .length === 7,
  ),
);
cek(
  'Persetujuan Sewa KPKNL: 17/17 Umum punya nomor, semua Belum Ada (file tidak disimpan)',
  kontrak
    .filter((k) => k.jenisPnBP === 'Umum')
    .every((k) => {
      const item = daftarDokumenKontrak(
        k,
        dokumen,
        tagihan,
        pembayaran,
        denda,
        HARI_INI,
      ).find((x) => x.label === 'Persetujuan Sewa KPKNL');
      return (
        item?.ada === false &&
        item?.detail === k.dasarNilai &&
        k.dasarNilai !== undefined
      );
    }),
);

// Surat Penagihan kondisional Overdue — kasus sintetis (data nyata: 0 Overdue)
const kOverdue = sintetis('TES-OVERDUE', 'Fungsional', 'Aktif', '2026-09-01', '2026-10-31', [
  lay('Menit', 10, 1000000),
]);
const tagihanOverdue: Tagihan[] = [
  ...tagihan,
  {
    id: 'TGH-TES-OVERDUE',
    nomor: 'TES/001',
    kontrakId: 'TES-OVERDUE',
    uraian: 'Tes Overdue',
    nilai: 1000000,
    tanggalTerbit: '2026-09-01',
    tanggalJatuhTempo: '2026-10-15',
    kodeAkun: '425531',
    satker: satker41,
  },
];
cek(
  'sintetis Overdue: statusPembayaranKontrak = Overdue',
  statusPembayaranKontrak(kOverdue, tagihanOverdue, pembayaran, denda, HARI_INI) === 'Overdue',
);
const dokOverdue = daftarDokumenKontrak(
  kOverdue,
  [
    ...dokumen,
    {
      id: 'DOK-TES-SP',
      kontrakId: 'TES-OVERDUE',
      jenisDokumen: 'Surat Penagihan',
      status: 'Ada',
    },
  ],
  tagihanOverdue,
  pembayaran,
  denda,
  HARI_INI,
);
cek('sintetis Overdue: 8 item (Surat Penagihan tampil)', dokOverdue.length === 8, `${dokOverdue.length}`);
cek('sintetis Overdue: Surat Penagihan Ada', cariItem(dokOverdue, 'Surat Penagihan')?.ada === true);
const dokOverdueTanpaCatatan = daftarDokumenKontrak(
  kOverdue,
  dokumen,
  tagihanOverdue,
  pembayaran,
  denda,
  HARI_INI,
);
cek(
  'sintetis Overdue tanpa catatan: Surat Penagihan Belum Ada',
  cariItem(dokOverdueTanpaCatatan, 'Surat Penagihan')?.ada === false,
);
cek(
  'sintetis Overdue: keterpenuhan 2/8 = 25% (penyebut 8 karena Surat Penagihan tampil)',
  persenCluster(dokOverdue).ada === 2 &&
    persenCluster(dokOverdue).total === 8 &&
    formatPersenRealisasi(persenCluster(dokOverdue).fraksi) === '25%',
);
cek(
  'sintetis Overdue tanpa catatan: keterpenuhan 1/8 = 12.5%',
  persenCluster(dokOverdueTanpaCatatan).ada === 1 &&
    persenCluster(dokOverdueTanpaCatatan).total === 8 &&
    formatPersenRealisasi(persenCluster(dokOverdueTanpaCatatan).fraksi) ===
      '12.5%',
);

// ---------- struktur UI cluster Document ----------
const detailSlice = deals.slice(
  deals.indexOf('function DetailKontrak'),
  deals.indexOf('function FormKontrak'),
);
cek(
  'Document cluster ada di DetailKontrak',
  detailSlice.includes('<JudulBagian>Document</JudulBagian>'),
);
cek(
  'Document sesudah Special Details (paling bawah)',
  detailSlice.indexOf('<JudulBagian>Document</JudulBagian>') >
    detailSlice.indexOf('Special Details'),
);
cek('DetailKontrak memanggil daftarDokumenKontrak', detailSlice.includes('daftarDokumenKontrak'));
cek(
  'catatan jujur: aplikasi tidak menyimpan file dokumen',
  detailSlice.includes('does not store') &&
    detailSlice.includes('document files'),
);
const docClusterSlice = detailSlice.slice(
  detailSlice.indexOf('<JudulBagian>Document</JudulBagian>'),
);
cek(
  'cluster Document tanpa tautan/tombol unduh/unggah (hanya kalimat penjelasan)',
  !docClusterSlice.includes('href=') &&
    !docClusterSlice.includes('<a ') &&
    !docClusterSlice.includes('onClick'),
);
cek(
  'cluster Document menampilkan keterpenuhan "Document Completeness: X% (N of M documents)"',
  docClusterSlice.includes('Document Completeness:') &&
    docClusterSlice.includes('of ') &&
    docClusterSlice.includes('documents)'),
);
cek(
  'cluster Document memakai kelengkapanDokumen(dokumenCluster) + formatPersenRealisasi (daftar yang sama dengan tabel)',
  detailSlice.includes('kelengkapanDokumen(dokumenCluster)') &&
    detailSlice.includes('formatPersenRealisasi(kelengkapanDokumenCluster.fraksi)'),
);
cek(
  'baris keterpenuhan ada di bawah judul Document, di atas tabel',
  docClusterSlice.indexOf('Document Completeness:') <
    docClusterSlice.indexOf('<Th>Document</Th>'),
);
const dokHelper = fs.readFileSync('src/lib/dokumenKontrak.ts', 'utf-8');
for (const label of [
  'Perjanjian Kerjasama',
  'Invoice Penagihan',
  'Billing Pembayaran',
  'Kwitansi Pembayaran',
  'Surat Penagihan',
  'Nota Penyiaran',
  'Jadwal Siar / Nota Produksi',
  'Bukti Siar',
  'Permohonan Sewa',
  'Pemberitahuan Persetujuan Sewa',
  'Persetujuan Sewa KPKNL',
]) {
  cek(`dokumenKontrak.ts memuat label "${label}"`, dokHelper.includes(`'${label}'`));
}

// ---------- total kontrol tidak berubah ----------
const k = hitungTotalKontrol(DATA_NYATA);
const totalKontrak = kontrak.reduce((s, x) => s + x.nilaiKontrak, 0);
const pksAktif = kontrak.filter((x) => x.status === 'Aktif').length;
cek('nilai kontrak 441.863.375', totalKontrak === 441863375, `${totalKontrak}`);
cek('tagihan 376.414.124', k.totalTagihan === 376414124, `${k.totalTagihan}`);
cek('pembayaran terverifikasi 362.329.255', k.totalPembayaranTerverifikasi === 362329255, `${k.totalPembayaranTerverifikasi}`);
cek('sisa piutang (lama) 14.084.869', k.sisaPiutang === 14084869, `${k.sisaPiutang}`);
cek('denda 6.219.250', k.totalDenda === 6219250, `${k.totalDenda}`);
cek('penerimaan acuan 257.590.368', k.totalPenerimaanAcuan === 257590368, `${k.totalPenerimaanAcuan}`);
cek('PKS aktif 15/42', pksAktif === 15, `${pksAktif}`);

if (gagal === 0) console.log('\nSemua asersi lolos.');
else console.log(`\n${gagal} asersi GAGAL.`);
process.exit(gagal === 0 ? 0 : 1);

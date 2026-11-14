// Daftar Satker — master data nasional (PRD v2.1, Bab 6: daftar satker = master nasional).
// Sumber: spreadsheet "LAPORAN PNBP 2026" (tab JANUARI), dibaca 14 Nov 2026.
// 69 satker bernomor (termasuk Kantor Pusat dan Puslitbangdiklat) + 35 sub-stasiun
// (SP) di bawah satker induknya = 104 entri.
// CATATAN: ejaan nama mengikuti persis yang tertulis di spreadsheet sumber
// (mis. "BOVENDIGOEL", "SP TJ BALAI"). Jangan "memperbaiki" ejaan tanpa
// konfirmasi — ejaan resmi menunggu verifikasi dengan kantor pusat.

export type SatkerTipe = 'KANTOR_PUSAT' | 'SATKER' | 'SP' | 'PUSLITBANGDIKLAT';

export interface Satker {
  /** Nomor urut di spreadsheet sumber (1–69). Sub-stasiun (SP) tidak bernomor. */
  no: number | null;
  nama: string;
  tipe: SatkerTipe;
  /** Nama satker induk, hanya untuk tipe SP. */
  induk?: string;
}

export const DAFTAR_SATKER: Satker[] = [
  { no: 1, nama: 'KANTOR PUSAT', tipe: 'KANTOR_PUSAT' },
  { no: 2, nama: 'AMBON', tipe: 'SATKER' },
  { no: null, nama: 'SP BULA', tipe: 'SP', induk: 'AMBON' },
  { no: 3, nama: 'ATAMBUA', tipe: 'SATKER' },
  { no: null, nama: 'SP ALOR', tipe: 'SP', induk: 'ATAMBUA' },
  { no: 4, nama: 'BANDA ACEH', tipe: 'SATKER' },
  { no: null, nama: 'SP SINGKIL', tipe: 'SP', induk: 'BANDA ACEH' },
  { no: null, nama: 'SP SABANG', tipe: 'SP', induk: 'BANDA ACEH' },
  { no: 5, nama: 'BANDAR LAMPUNG', tipe: 'SATKER' },
  { no: null, nama: 'SP WAYKANAN', tipe: 'SP', induk: 'BANDAR LAMPUNG' },
  { no: 6, nama: 'BANDUNG', tipe: 'SATKER' },
  { no: 7, nama: 'BANJARMASIN', tipe: 'SATKER' },
  { no: 8, nama: 'BATAM', tipe: 'SATKER' },
  { no: 9, nama: 'BENGKULU', tipe: 'SATKER' },
  { no: null, nama: 'SP BINTUHAN', tipe: 'SP', induk: 'BENGKULU' },
  { no: 10, nama: 'BIAK', tipe: 'SATKER' },
  { no: 11, nama: 'BOGOR', tipe: 'SATKER' },
  { no: 12, nama: 'BOVENDIGOEL', tipe: 'SATKER' },
  { no: 13, nama: 'BUKITTINGGI', tipe: 'SATKER' },
  { no: 14, nama: 'CIREBON', tipe: 'SATKER' },
  { no: 15, nama: 'DENPASAR', tipe: 'SATKER' },
  { no: 16, nama: 'ENDE', tipe: 'SATKER' },
  { no: null, nama: 'SP LABUAN BAJO', tipe: 'SP', induk: 'ENDE' },
  { no: 17, nama: 'SANGGAU', tipe: 'SATKER' },
  { no: null, nama: 'SP SANGGAU', tipe: 'SP', induk: 'SANGGAU' },
  { no: 18, nama: 'FAK FAK', tipe: 'SATKER' },
  { no: null, nama: 'SP KAIMANA', tipe: 'SP', induk: 'FAK FAK' },
  { no: 19, nama: 'GORONTALO', tipe: 'SATKER' },
  { no: 20, nama: 'GUNUNG SITOLI', tipe: 'SATKER' },
  { no: null, nama: 'SP NIAS SELATAN', tipe: 'SP', induk: 'GUNUNG SITOLI' },
  { no: 21, nama: 'JAKARTA', tipe: 'SATKER' },
  { no: 22, nama: 'JAMBI', tipe: 'SATKER' },
  { no: null, nama: 'SP SUNGAIPENUH', tipe: 'SP', induk: 'JAMBI' },
  { no: 23, nama: 'JAYAPURA', tipe: 'SATKER' },
  { no: null, nama: 'SP SKOW', tipe: 'SP', induk: 'JAYAPURA' },
  { no: 24, nama: 'JEMBER', tipe: 'SATKER' },
  { no: 25, nama: 'KENDARI', tipe: 'SATKER' },
  { no: null, nama: 'SP BAUBAU', tipe: 'SP', induk: 'KENDARI' },
  { no: 26, nama: 'KUPANG', tipe: 'SATKER' },
  { no: null, nama: 'SP ROTE', tipe: 'SP', induk: 'KUPANG' },
  { no: null, nama: 'SP SUMBA', tipe: 'SP', induk: 'KUPANG' },
  { no: 27, nama: 'LHOKSEUMAWE', tipe: 'SATKER' },
  { no: 28, nama: 'MADIUN', tipe: 'SATKER' },
  { no: 29, nama: 'MAKASSAR', tipe: 'SATKER' },
  { no: null, nama: 'SP BONE', tipe: 'SP', induk: 'MAKASSAR' },
  { no: 30, nama: 'MALANG', tipe: 'SATKER' },
  { no: 31, nama: 'MANADO', tipe: 'SATKER' },
  { no: null, nama: 'SP TALAUD', tipe: 'SP', induk: 'MANADO' },
  { no: null, nama: 'SP MIANGAS', tipe: 'SP', induk: 'MANADO' },
  { no: 32, nama: 'MANOKWARI', tipe: 'SATKER' },
  { no: null, nama: 'SP TELUK BINTUNI', tipe: 'SP', induk: 'MANOKWARI' },
  { no: 33, nama: 'MATARAM', tipe: 'SATKER' },
  { no: null, nama: 'SP BIMA', tipe: 'SP', induk: 'MATARAM' },
  { no: 34, nama: 'MEDAN', tipe: 'SATKER' },
  { no: null, nama: 'SP TJ BALAI', tipe: 'SP', induk: 'MEDAN' },
  { no: 35, nama: 'MERAUKE', tipe: 'SATKER' },
  { no: 36, nama: 'MEULABOH', tipe: 'SATKER' },
  { no: 37, nama: 'NABIRE', tipe: 'SATKER' },
  { no: 38, nama: 'NUNUKAN', tipe: 'SATKER' },
  { no: 39, nama: 'PADANG', tipe: 'SATKER' },
  { no: 40, nama: 'PALANGKARAYA', tipe: 'SATKER' },
  { no: 41, nama: 'PALEMBANG', tipe: 'SATKER' },
  { no: 42, nama: 'PALU', tipe: 'SATKER' },
  { no: null, nama: 'SP AMPANA', tipe: 'SP', induk: 'PALU' },
  { no: 43, nama: 'PEKANBARU', tipe: 'SATKER' },
  { no: null, nama: 'SP BENGKALIS', tipe: 'SP', induk: 'PEKANBARU' },
  { no: 44, nama: 'PONTIANAK', tipe: 'SATKER' },
  { no: null, nama: 'SP SAMBAS', tipe: 'SP', induk: 'PONTIANAK' },
  { no: 45, nama: 'PURWOKERTO', tipe: 'SATKER' },
  { no: 46, nama: 'RANAI', tipe: 'SATKER' },
  { no: 47, nama: 'SAMARINDA', tipe: 'SATKER' },
  { no: null, nama: 'SP LONG BANGUN', tipe: 'SP', induk: 'SAMARINDA' },
  { no: null, nama: 'SP SENDAWAR', tipe: 'SP', induk: 'SAMARINDA' },
  { no: 48, nama: 'SEMARANG', tipe: 'SATKER' },
  { no: 49, nama: 'SERUI', tipe: 'SATKER' },
  { no: 50, nama: 'SIBOLGA', tipe: 'SATKER' },
  { no: 51, nama: 'SINGARAJA', tipe: 'SATKER' },
  { no: 52, nama: 'SINTANG', tipe: 'SATKER' },
  { no: 53, nama: 'SORONG', tipe: 'SATKER' },
  { no: null, nama: 'SP TERMINABUAN', tipe: 'SP', induk: 'SORONG' },
  { no: 54, nama: 'SUMENEP', tipe: 'SATKER' },
  { no: null, nama: 'SP SAMPANG', tipe: 'SP', induk: 'SUMENEP' },
  { no: 55, nama: 'SUNGAILIAT', tipe: 'SATKER' },
  { no: null, nama: 'SP BELITUNG', tipe: 'SP', induk: 'SUNGAILIAT' },
  { no: 56, nama: 'SURABAYA', tipe: 'SATKER' },
  { no: null, nama: 'SP KEDIRI', tipe: 'SP', induk: 'SURABAYA' },
  { no: null, nama: 'SP TUBAN', tipe: 'SP', induk: 'SURABAYA' },
  { no: 57, nama: 'SURAKARTA', tipe: 'SATKER' },
  { no: 58, nama: 'TAHUNA', tipe: 'SATKER' },
  { no: 59, nama: 'TAKENGON', tipe: 'SATKER' },
  { no: null, nama: 'SP BENER MERIAH', tipe: 'SP', induk: 'TAKENGON' },
  { no: 60, nama: 'TANJUNG PINANG', tipe: 'SATKER' },
  { no: 61, nama: 'TARAKAN', tipe: 'SATKER' },
  { no: null, nama: 'SP MALINAU', tipe: 'SP', induk: 'TARAKAN' },
  { no: 62, nama: 'TERNATE', tipe: 'SATKER' },
  { no: 63, nama: 'TOLI TOLI', tipe: 'SATKER' },
  { no: 64, nama: 'LANGGUR', tipe: 'SATKER' },
  { no: null, nama: 'SP SAUMLAKI', tipe: 'SP', induk: 'LANGGUR' },
  { no: 65, nama: 'WAMENA', tipe: 'SATKER' },
  { no: null, nama: 'SP OKSIBIL', tipe: 'SP', induk: 'WAMENA' },
  { no: 66, nama: 'YOGYAKARTA', tipe: 'SATKER' },
  { no: 67, nama: 'BANTEN', tipe: 'SATKER' },
  { no: 68, nama: 'MAMUJU', tipe: 'SATKER' },
  { no: 69, nama: 'PUSLITBANGDIKLAT', tipe: 'PUSLITBANGDIKLAT' },
];

export const JUMLAH_SATKER_BERNOMOR = DAFTAR_SATKER.filter(
  (s) => s.no !== null,
).length;

export const JUMLAH_SP = DAFTAR_SATKER.filter((s) => s.tipe === 'SP').length;

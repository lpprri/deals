// Data copy landing page RRI Deals — copy final yang disetujui pengguna
// 2026-11-17 (dokumen Copy-Landing-RRI-Deals-Final-2026-11-17.md).
// File ini DULU berisi data contoh template agency (PR
// landing-marklo-clone); pada PR ini seluruh nama, angka, dan
// layanan contoh diganti dengan copy RRI.
//
// Catatan data:
// - Angka statistik: 500+ Partners (sesuai arahan pengguna; verifikasi
//   kumulatif masih terbuka), 67 Cities, 69 Satker, 42 Kontrak 2026.
// - Tarif "mulai dari" berasal dari dokumen Usulan Tarif 2026 RRI
//   Palembang — dipakai apa adanya, jangan diubah tanpa konfirmasi.
// - Testimoni DIKOSONGKAN (belum ada testimoni nyata); logo klien
//   fiktif dihapus — tidak ada lagi data testimoni di file ini.

export interface KampanyeMarklo {
  klien: string;
  layanan: string;
  /** Kelas gradien pastel untuk visual kartu (placeholder CSS, bukan foto). */
  gradien: string;
  inisial: string;
  ringkasan: string;
}

/**
 * Etalase 4 kelompok layanan RRI (bukan lagi kampanye klien contoh).
 * Komponen carousel tidak diubah — hanya isi kartunya yang diganti.
 */
export const KAMPANYE_MARKLO: KampanyeMarklo[] = [
  {
    klien: 'Radio',
    layanan: 'Jasa Penyiaran',
    gradien: 'from-rose-200 via-pink-100 to-orange-100',
    inisial: 'R',
    ringkasan:
      'Spot iklan, adlibs, dialog interaktif, sandiwara radio, kuis & wawancara, feature, report on the spot, sponsor program, dan greeting — mengudara di 4 programa RRI.',
  },
  {
    klien: 'Digital',
    layanan: 'Jasa Digitalisasi Penyiaran',
    gradien: 'from-sky-200 via-blue-100 to-indigo-100',
    inisial: 'D',
    ringkasan:
      'Banner rri.co.id, Live Dialog dan advertorial YouTube, Reels, Feed, Carousel, Live dan Story Instagram, Facebook, dan TikTok Live.',
  },
  {
    klien: 'Venue & Produksi',
    layanan: 'Sarana & Prasarana',
    gradien: 'from-violet-200 via-purple-100 to-fuchsia-100',
    inisial: 'V',
    ringkasan:
      'Auditorium, sound system, dan studio RRI untuk acara dan siaran Anda — di dalam studio maupun di lokasi kegiatan.',
  },
  {
    klien: 'Pelatihan & Sertifikasi',
    layanan: 'Diklat & Sertifikasi',
    gradien: 'from-emerald-200 via-teal-100 to-lime-100',
    inisial: 'P',
    ringkasan:
      'Pendidikan dan pelatihan sesuai tugas dan fungsi RRI, serta Sertifikasi Kompetensi Wartawan Radio.',
  },
];

export interface StatistikMarklo {
  id: string;
  nilai: number;
  akhiran: string;
  desimal: number;
  label: string;
}

export const STATISTIK_MARKLO: StatistikMarklo[] = [
  { id: 'mitra', nilai: 500, akhiran: '+', desimal: 0, label: 'Partners' },
  { id: 'kota', nilai: 67, akhiran: '', desimal: 0, label: 'Cities' },
  { id: 'satker', nilai: 69, akhiran: '', desimal: 0, label: 'Satker' },
  { id: 'kontrak', nilai: 42, akhiran: '', desimal: 0, label: 'Kontrak Kerja Sama 2026' },
];

/** 67 lokasi satker bernama (69 satker minus Kantor Pusat & Puslitbangdiklat). */
export interface KotaMarklo {
  nama: string;
}

export const KOTA_MARKLO: KotaMarklo[] = [
  { nama: 'AMBON' },
  { nama: 'ATAMBUA' },
  { nama: 'BANDA ACEH' },
  { nama: 'BANDAR LAMPUNG' },
  { nama: 'BANDUNG' },
  { nama: 'BANJARMASIN' },
  { nama: 'BATAM' },
  { nama: 'BENGKULU' },
  { nama: 'BIAK' },
  { nama: 'BOGOR' },
  { nama: 'BOVENDIGOEL' },
  { nama: 'BUKITTINGGI' },
  { nama: 'CIREBON' },
  { nama: 'DENPASAR' },
  { nama: 'ENDE' },
  { nama: 'SANGGAU' },
  { nama: 'FAK FAK' },
  { nama: 'GORONTALO' },
  { nama: 'GUNUNG SITOLI' },
  { nama: 'JAKARTA' },
  { nama: 'JAMBI' },
  { nama: 'JAYAPURA' },
  { nama: 'JEMBER' },
  { nama: 'KENDARI' },
  { nama: 'KUPANG' },
  { nama: 'LHOKSEUMAWE' },
  { nama: 'MADIUN' },
  { nama: 'MAKASSAR' },
  { nama: 'MALANG' },
  { nama: 'MANADO' },
  { nama: 'MANOKWARI' },
  { nama: 'MATARAM' },
  { nama: 'MEDAN' },
  { nama: 'MERAUKE' },
  { nama: 'MEULABOH' },
  { nama: 'NABIRE' },
  { nama: 'NUNUKAN' },
  { nama: 'PADANG' },
  { nama: 'PALANGKARAYA' },
  { nama: 'PALEMBANG' },
  { nama: 'PALU' },
  { nama: 'PEKANBARU' },
  { nama: 'PONTIANAK' },
  { nama: 'PURWOKERTO' },
  { nama: 'RANAI' },
  { nama: 'SAMARINDA' },
  { nama: 'SEMARANG' },
  { nama: 'SERUI' },
  { nama: 'SIBOLGA' },
  { nama: 'SINGARAJA' },
  { nama: 'SINTANG' },
  { nama: 'SORONG' },
  { nama: 'SUMENEP' },
  { nama: 'SUNGAILIAT' },
  { nama: 'SURABAYA' },
  { nama: 'SURAKARTA' },
  { nama: 'TAHUNA' },
  { nama: 'TAKENGON' },
  { nama: 'TANJUNG PINANG' },
  { nama: 'TARAKAN' },
  { nama: 'TERNATE' },
  { nama: 'TOLI TOLI' },
  { nama: 'LANGGUR' },
  { nama: 'WAMENA' },
  { nama: 'YOGYAKARTA' },
  { nama: 'BANTEN' },
  { nama: 'MAMUJU' },
];

export interface LangkahProsesMarklo {
  nomor: string;
  judul: string;
  desk: string;
}

export const PROSES_MARKLO: LangkahProsesMarklo[] = [
  {
    nomor: '01',
    judul: 'Book a Free Call',
    desk: 'Ceritakan tujuan dan anggaran Anda dalam 30 menit. Kami dengarkan dulu, baru tawarkan.',
  },
  {
    nomor: '02',
    judul: 'Strategi & Penawaran',
    desk: 'Tim RRI menyusun paket multi-kanal — radio di jam Prime atau Regular, plus digital — lengkap dengan penawarannya.',
  },
  {
    nomor: '03',
    judul: 'Tayang & Terlacak',
    desk: 'Kerja sama dituangkan dalam PKS, iklan tayang, dan Anda bisa melacaknya lewat "Lacak Kerja Sama" dengan nomor PKS atau invoice.',
  },
];

export interface TahapFunnelMarklo {
  tahap: string;
  layanan: string;
  gradien: string;
  desk: string;
}

export const FUNNEL_MARKLO: TahapFunnelMarklo[] = [
  {
    tahap: 'Radio — Jasa Penyiaran',
    layanan: 'Mulai Rp40.000 / 60 detik',
    gradien: 'from-rose-200 to-pink-100',
    desk: 'Spot iklan, jingle, filler & advertorial, adlibs, dialog interaktif, sandiwara radio, kuis & wawancara, feature, report on the spot, sponsor program, dan greeting/time signal — mengudara di 4 programa RRI, jam Prime Time dan Regular Time.',
  },
  {
    tahap: 'Digital — Jasa Digitalisasi Penyiaran',
    layanan: 'rri.co.id · YouTube · Instagram · Facebook · TikTok',
    gradien: 'from-sky-200 to-blue-100',
    desk: 'Banner di portal rri.co.id, Live Dialog dan advertorial YouTube, Reels, Feed, Carousel, Live dan Story Instagram @rri_official, Facebook Live, dan TikTok Live.',
  },
  {
    tahap: 'Venue & Produksi — Sarana & Prasarana',
    layanan: 'Mulai Rp1.500.000 / 4 jam',
    gradien: 'from-violet-200 to-purple-100',
    desk: 'Auditorium dengan sound system, sound system untuk siaran di luar studio, dan studio RRI untuk rekaman dan siaran acara Anda.',
  },
  {
    tahap: 'Pelatihan & Sertifikasi',
    layanan: 'Mulai Rp500.000 / orang',
    gradien: 'from-emerald-200 to-teal-100',
    desk: 'Pendidikan dan pelatihan sesuai tugas dan fungsi RRI, serta Sertifikasi Kompetensi Wartawan Radio — per orang per 3 hari.',
  },
];

export const PERBANDINGAN_LAIN: string[] = [
  'Strategi copy-paste untuk semua klien',
  'Fokus pada ad spend, bukan pada hasil',
  'Metrik yang sulit dicek',
];

export const PERBANDINGAN_KAMI: string[] = [
  'Kampanye dirancang untuk setiap brand',
  'Tarif PNBP yang transparan',
  'Jangkauan 69 satker di 67 kota',
  'Bukti siar yang bisa dilacak',
];

export interface ManfaatMarklo {
  judul: string;
  desk: string;
  tautan?: { label: string; jangkar: string };
}

export const MANFAAT_MARKLO: ManfaatMarklo[] = [
  {
    judul: 'Jangkauan Nasional',
    desk: 'Satu mitra, 67 kota di seluruh Indonesia.',
  },
  {
    judul: 'Multi-Kanal',
    desk: 'Radio, portal, dan media sosial dalam satu kampanye.',
  },
  {
    judul: 'Kredibilitas Penyiar Publik',
    desk: 'Brand Anda tampil di kanal yang dipercaya pendengar sejak lama.',
  },
  {
    judul: 'Tarif Jelas',
    desk: 'Harga per format dan per durasi, bukan paket yang sulit dibandingkan.',
    tautan: { label: 'Book a Call', jangkar: '#booking' },
  },
];

export interface FaqMarklo {
  q: string;
  a: string;
}

export const FAQ_MARKLO: FaqMarklo[] = [
  {
    q: 'Bagaimana cara mengajukan kerja sama?',
    a: 'Klik "Ajukan Kerja Sama", isi pengajuan Anda, lalu tim operator RRI akan menindaklanjuti.',
  },
  {
    q: 'Bagaimana cara melacak kerja sama saya?',
    a: 'Buka "Lacak Kerja Sama" di footer, lalu masukkan nomor PKS atau invoice Anda.',
  },
  {
    q: 'Apa bedanya Prime Time dan Regular Time?',
    a: 'Prime Time adalah jam siaran utama dengan pendengar terbanyak; Regular Time di luar jam tersebut. Pembagiannya mengikuti SK Kepala RRI No. 31/2026, dan tarif Prime Time lebih tinggi.',
  },
  {
    q: 'Berapa biayanya?',
    a: 'Mulai Rp40.000 per 60 detik untuk spot iklan Regular Time. Tarif lengkap per format ada di halaman layanan; tarif per satker dapat berbeda.',
  },
  {
    q: 'Bisakah iklan saya tayang di banyak kota sekaligus?',
    a: 'Bisa — melalui jaringan 69 satker RRI di 67 kota. Cakupan dan biayanya dibahas saat konsultasi.',
  },
  {
    q: 'Apakah saya mendapat bukti siar?',
    a: 'Ya, bukti siar dan dokumen kerja sama tersedia untuk setiap kerja sama yang tayang.',
  },
];

/** Slot waktu booking (menit sejak tengah malam, basis WIB). */
export const SLOT_BOOKING_MENIT: number[] = [
  540, 570, 600, 630, 660, 690, 720, 750, 780, 810, 840, 870, 900, 930, 960,
];

export interface ZonaWaktuMarklo {
  id: string;
  label: string;
  /** Offset dari UTC dalam menit. */
  offsetMenit: number;
}

export const ZONA_WAKTU_MARKLO: ZonaWaktuMarklo[] = [
  { id: 'Asia/Jakarta', label: 'WIB — Jakarta (UTC+7)', offsetMenit: 420 },
  { id: 'Asia/Singapore', label: 'SGT — Singapore (UTC+8)', offsetMenit: 480 },
  { id: 'UTC', label: 'UTC', offsetMenit: 0 },
];

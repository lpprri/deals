// Data untuk tiruan landing page template agency "Marklo"
// (PR landing-marklo-clone, 2026-11-17).
//
// KECUALI KAMPANYE_MARKLO: sejak PR #80 (2026-11-18) daftar kampanye di bawah
// adalah KAMPANYE NYATA RRI — nama klien asli (Bahasa Indonesia, sesuai
// daftar user); deskripsi berbahasa Inggris ditulis dari judul kampanye
// aslinya, tanpa angka/klaim hasil yang dikarang. Sejak PR #86 judul kampanye
// tidak lagi tampil di kartu (hanya nama klien + tag layanan + deskripsi).
// Sejak PR #95 tiap kartu memakai FOTO yang diunggah pengguna (bukan gradasi
// + huruf awal) — foto di-embed sebagai data URI di src/lib/fotoKampanye.ts.
// KECUALI KOTA_SATKER_MARKLO: sejak PR #82 (2026-11-18) daftar kota di bawah
// adalah KOTA SATKER NYATA RRI — diturunkan langsung dari DAFTAR_SATKER
// (master data nasional, src/lib/satker.ts).
// Bagian lain file ini (testimoni, statistik, dst.) MASIH data contoh template
// Marklo dan BUKAN data RRI — JANGAN jadikan nama/angka di sana sebagai
// fakta tentang RRI.

import { DAFTAR_SATKER } from './satker';
import {
  LOGO_PLATFORM,
  LOGO_PROGRAMA,
  LOGO_SOSIAL,
  LOGO_YOUTUBE,
} from './logoLayanan';
import type { LogoLayanan } from './logoLayanan';

export interface KampanyeMarklo {
  klien: string;
  layanan: string;
  ringkasan: string;
}

export const KAMPANYE_MARKLO: KampanyeMarklo[] = [
  {
    klien: 'PLN',
    layanan: 'Radio Spot',
    ringkasan:
      'A public-education spot that makes electricity safety simple to understand — the dangers to avoid and the benefits to enjoy, delivered loud and clear on air.',
  },
  {
    klien: 'Taspen',
    layanan: 'Adlibs',
    ringkasan:
      'A sharp adlibs warning that helps listeners spot scams pretending to be PT Taspen — before anyone gets tricked.',
  },
  {
    klien: 'Alfamart',
    layanan: 'Radio Spot',
    ringkasan:
      "A cheerful on-air promo that keeps Alfamart's offers top of mind for everyday shoppers.",
  },
  {
    klien: 'Medco',
    layanan: 'Adlibs & Interactive Dialogue',
    ringkasan:
      "An on-campus talk that opens up the gas industry's integrity story — in plain language, with room for real questions.",
  },
  {
    klien: 'Bank Indonesia',
    layanan: 'Adlibs',
    ringkasan:
      'Live adlibs from Digital Kito Galo 7th x Gemilang Palembang Raya 2026 — bringing the energy of the event straight to listeners at home.',
  },
  {
    klien: 'Perempuan Indonesia Maju',
    layanan: 'Interactive Dialogue',
    ringkasan:
      'An interactive dialogue celebrating Indonesian women — the grace of kebaya songket, worn with pride and talked about live on air.',
  },
  {
    klien: 'BNN',
    layanan: 'Radio Spot',
    ringkasan:
      'A public-service spot that takes rehabilitation on the road and puts help within reach — Re-Link and Pindang, explained simply for everyone listening.',
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
  { id: 'proyek', nilai: 500, akhiran: '+', desimal: 0, label: 'Projects Delivered' },
  { id: 'klien', nilai: 1, akhiran: 'k+', desimal: 0, label: 'Happy Clients' },
  { id: 'kepuasan', nilai: 98, akhiran: '%', desimal: 0, label: 'Client Satisfaction' },
];

/** Ubah nama satker (HURUF BESAR per spreadsheet) menjadi Title Case
    untuk tampilan pil kota — hanya kapitalisasi, ejaan tidak diubah
    (ejaan mengikuti spreadsheet, menunggu verifikasi HQ). */
function titelKota(nama: string): string {
  return nama
    .toLowerCase()
    .split(' ')
    .map((kata) => kata.charAt(0).toUpperCase() + kata.slice(1))
    .join(' ');
}

/**
 * Kota-kota Satuan Kerja RRI untuk section "Our Clients in 67+ Cities"
 * (PR #82): diturunkan langsung dari DAFTAR_SATKER (master data nasional)
 * supaya section selalu sinkron — 67 stasiun (tipe 'SATKER'), diurutkan
 * abjad A–Z (keputusan user 2026-11-18); KANTOR PUSAT + PUSLITBANGDIKLAT
 * TIDAK ditampilkan karena bukan kota.
 */
export const KOTA_SATKER_MARKLO: string[] = DAFTAR_SATKER.filter(
  (s) => s.tipe === 'SATKER',
)
  .map((s) => titelKota(s.nama))
  .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

export interface LangkahProsesMarklo {
  nomor: string;
  judul: string;
  desk: string;
}

export const PROSES_MARKLO: LangkahProsesMarklo[] = [
  {
    nomor: '01',
    judul: 'Funnel Audit',
    desk: 'We map your funnel end to end, find the leaks, and show you exactly where growth is hiding.',
  },
  {
    nomor: '02',
    judul: 'Campaign Management',
    desk: 'We launch and manage campaigns across channels, testing creative and audiences every week.',
  },
  {
    nomor: '03',
    judul: 'Reporting & Maximize Profit',
    desk: 'Clear reporting on what matters — leads, cost per acquisition, and revenue — then we scale what works.',
  },
];

export interface LayananMarklo {
  nama: string;
  gradien: string;
  desk: string;
  /** Label langkah template (Attract/Engage/Convert/Retain) — dipetakan ke layanan RRI (PR #85). */
  langkah: string;
  /** Logo yang tampil di chip putih di atas judul kartu (PR #85). */
  logo: LogoLayanan[];
}

export const LAYANAN_MARKLO: LayananMarklo[] = [
  {
    nama: 'Radio Ads',
    gradien: 'from-blue-100 to-sky-50',
    desk: "Prime-time spots and adlibs broadcast across 67 cities — your brand heard on Indonesia's widest radio network, from the capital to the farthest corners of the country.",
    langkah: 'Attract Customer',
    logo: LOGO_PROGRAMA,
  },
  {
    nama: 'Social Media Ads',
    gradien: 'from-sky-100 to-blue-50',
    desk: 'Thumb-stopping creative built for the feed — turning scrollers into followers, and followers into customers.',
    langkah: 'Engage Prospect',
    logo: LOGO_SOSIAL,
  },
  {
    nama: 'Digital Platform Ads',
    gradien: 'from-violet-100 to-purple-50',
    desk: "Your brand across RRI's digital platforms — display, video, and streaming — so your message follows listeners from the radio to the screen.",
    langkah: 'Convert Clients',
    logo: LOGO_PLATFORM,
  },
  {
    nama: 'Dialogue & Podcast',
    gradien: 'from-emerald-100 to-teal-50',
    desk: 'Interactive dialogues and podcasts that give your story room to breathe — real conversations, live on air and on demand.',
    langkah: 'Retain Clients',
    logo: LOGO_YOUTUBE,
  },
  {
    // Ditambahkan 2026-11-23 atas perintah pengguna ("bangun juga kartu
    // untuk 'Held Event' = 'MICE Venues', 'Expand Business' =
    // 'Commercial Spaces'"). Deskripsi adalah DRAF dari konten yang
    // sudah ada di app (Book a Venue / Rent a Space) — pengguna bisa
    // mengoreksi kata-katanya. Logo kosong: belum ada set logo khusus
    // untuk kedua layanan ini (hanya ada 4 set PRO/Sosial/Platform/
    // YouTube); kirimkan logonya bila ada.
    nama: 'MICE Venues',
    gradien: 'from-amber-100 to-yellow-50',
    desk: 'Auditoriums, halls, and meeting rooms in RRI stations across Indonesia — ready stages for conferences, exhibitions, and company gatherings.',
    langkah: 'Held Events',
    logo: [],
  },
  {
    nama: 'Commercial Spaces',
    gradien: 'from-cyan-100 to-sky-50',
    desk: 'Land owned by RRI, open for your business — shops, cafes, parking, and more, in cities across Indonesia.',
    langkah: 'Expand Business',
    logo: [],
  },
];

export const PERBANDINGAN_LAIN: string[] = [
  'Generic copy-paste strategies for every client',
  'Focused on ad spend, not on ROI',
  'Poor targeting and wasted budget',
  'Vanity metrics instead of real results',
  'Big promises, little accountability',
];

export const PERBANDINGAN_KAMI: string[] = [
  'Custom campaigns built on your data',
  'Focused on ROI and revenue, not spend',
  'Deep research before a single ad runs',
  'Measurable results you can check anytime',
  'Transparent reporting, every week',
];

// Strip logo mitra RRI (bukan lagi wordmark contoh template).
// Sejak PR #81 (2026-11-18): 10 LOGO MITRA NYATA RRI yang diunggah
// pengguna, di-embed sebagai base64 di src/lib/logoMitra.ts.
// Nama ekspor dipertahankan supaya Marklo.tsx tidak berubah impornya.
export { LOGO_MITRA as LOGO_KLIEN_MARKLO } from './logoMitra';
export type { LogoMitra } from './logoMitra';

export interface ManfaatMarklo {
  judul: string;
  desk: string;
  /** Gradien pastel kartu (gaya template asli Marklo, PR landing-why-marketing-template). */
  gradien: string;
  tautan?: { label: string; jangkar: string };
}

export const MANFAAT_MARKLO: ManfaatMarklo[] = [
  {
    judul: 'Increased Visibility',
    desk: 'Show up where your customers already are — search, social, and beyond.',
    gradien: 'from-white to-pink-100',
  },
  {
    judul: 'Targeted Audience',
    desk: 'Reach the people most likely to buy, instead of shouting at everyone.',
    gradien: 'from-white to-sky-100',
  },
  {
    judul: 'Cost-Effective Growth',
    desk: 'Every rupiah of budget is tracked against pipeline and revenue.',
    gradien: 'from-white to-blue-100',
  },
  {
    judul: 'Competitive Advantage',
    desk: 'Stand out from other business in your industry.',
    gradien: 'from-white to-orange-100',
    tautan: { label: 'View our case study', jangkar: '#work' },
  },
];

export interface TestimoniMarklo {
  nama: string;
  peran: string;
  inisial: string;
  gradien: string;
  kutipan: string;
  unggulan?: boolean;
}

export const TESTIMONI_MARKLO: TestimoniMarklo[] = [
  {
    nama: 'Budi Santoso',
    peran: 'CEO, Lumo Labs',
    inisial: 'BS',
    gradien: 'from-blue-200 to-sky-100',
    kutipan:
      'RRI rebuilt our funnel from scratch. Within weeks we finally knew which campaigns were making money — and which ones to stop.',
  },
  {
    nama: 'Agus Wijaya',
    peran: 'Founder, ZenZap',
    inisial: 'AW',
    gradien: 'from-sky-200 to-blue-100',
    kutipan:
      'The weekly reporting alone is worth it. No jargon, no vanity numbers — just leads, costs, and what happens next.',
  },
  {
    nama: 'Rizky Pratama',
    peran: 'Marketing Lead, Innovio',
    inisial: 'RP',
    gradien: 'from-violet-200 to-purple-100',
    kutipan:
      'Our cost per acquisition dropped by half in the first month. The team tests fast and explains every change.',
  },
  {
    nama: 'Dewi Lestari',
    peran: 'Director, Craftgram',
    inisial: 'DL',
    gradien: 'from-emerald-200 to-teal-100',
    kutipan:
      'We tried three agencies before RRI. They are the first ones who treated our budget like their own money.',
  },
  {
    nama: 'Maya Kusuma',
    peran: 'Owner, Sparkle',
    inisial: 'MK',
    gradien: 'from-sky-200 to-blue-100',
    kutipan:
      'From the first audit call it was clear they had done their homework. The plan was specific to our business, not a template.',
  },
  {
    nama: 'Andi Firmansyah',
    peran: 'CMO, Reviro',
    inisial: 'AF',
    gradien: 'from-cyan-200 to-sky-100',
    kutipan:
      'Content, ads, and reporting finally work as one system. Pipeline is up and the sales team actually trusts the leads.',
  },
  {
    nama: 'Siti Rahmawati',
    peran: 'CEO, Beskon',
    inisial: 'SR',
    gradien: 'from-blue-400 to-sky-400',
    kutipan:
      'RRI is the growth partner we had been looking for. Revenue from paid campaigns tripled — and we can see exactly why.',
    unggulan: true,
  },
];

export interface FaqMarklo {
  q: string;
  a: string;
}

export const FAQ_MARKLO: FaqMarklo[] = [
  {
    q: 'What services do you offer?',
    a: 'Radio Ads, Social Media Ads, Digital Platform Ads, and Dialogue & Podcast — all built around one funnel, from first click to repeat customer.',
  },
  {
    q: 'How can marketing help my business?',
    a: 'It puts you in front of people already looking for what you sell, then turns that attention into measurable leads and sales.',
  },
  {
    q: 'How long does it take to see results?',
    a: 'Paid campaigns usually show first signals within 2–4 weeks. We report progress every week so you always know where things stand.',
  },
  {
    q: 'Do you work with businesses of all sizes?',
    a: 'Yes. From early-stage startups to established brands, every engagement starts with a funnel audit so the plan fits your budget and goals.',
  },
  {
    q: 'How do you measure success?',
    a: 'On leads, cost per acquisition, and conversion rate — the numbers that connect marketing spend to revenue, not vanity metrics.',
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

/** Tiga zona waktu Indonesia untuk dropdown TIME ZONE kartu booking
    (keputusan pengguna 2026-11-19 14:45 WIB): WIB/WITA/WIT — dua entri
    lama (Singapura + UTC) dihapus. Slot disimpan basis WIB (offsetMenit 420). */
export const ZONA_WAKTU_MARKLO: ZonaWaktuMarklo[] = [
  { id: 'Asia/Jakarta', label: 'WIB — Jakarta (UTC+7)', offsetMenit: 420 },
  { id: 'Asia/Makassar', label: 'WITA — Makassar (UTC+8)', offsetMenit: 480 },
  { id: 'Asia/Jayapura', label: 'WIT — Jayapura (UTC+9)', offsetMenit: 540 },
];

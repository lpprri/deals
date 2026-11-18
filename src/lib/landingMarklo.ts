// Data CONTOH (SAMPLE) untuk tiruan landing page template agency "Marklo"
// (PR landing-marklo-clone, 2026-11-17).
//
// Semua nama orang, klien, kampanye, testimoni, dan angka di file ini
// berasal dari template Marklo dan BUKAN data RRI — dipakai apa adanya
// untuk tiruan visual, dan akan diganti pada putaran penyesuaian RRI.
// JANGAN jadikan nama/angka di sini sebagai fakta tentang RRI.
//
// KECUALI LOGO_KLIEN_MARKLO: sejak PR #81 (2026-11-18) strip logo di
// bawah Comparison adalah LOGO MITRA NYATA RRI (10 logo yang diunggah
// pengguna, di-embed di src/lib/logoMitra.ts) — bukan lagi wordmark
// contoh template.

export interface KampanyeMarklo {
  klien: string;
  layanan: string;
  /** Kelas gradien pastel untuk visual kartu (placeholder CSS, bukan foto). */
  gradien: string;
  inisial: string;
  ringkasan: string;
}

export const KAMPANYE_MARKLO: KampanyeMarklo[] = [
  {
    klien: 'RingID',
    layanan: 'Meta Ads',
    gradien: 'from-rose-200 via-pink-100 to-orange-100',
    inisial: 'R',
    ringkasan: 'Paid social campaign that scaled installs month over month.',
  },
  {
    klien: 'Beskon Music',
    layanan: 'Google Ads',
    gradien: 'from-sky-200 via-blue-100 to-indigo-100',
    inisial: 'B',
    ringkasan: 'Search campaign that put new releases in front of fans.',
  },
  {
    klien: 'Boutique',
    layanan: 'SEO',
    gradien: 'from-violet-200 via-purple-100 to-fuchsia-100',
    inisial: 'B',
    ringkasan: 'Organic growth that turned search into the top channel.',
  },
  {
    klien: 'Reviro',
    layanan: 'Content Marketing',
    gradien: 'from-emerald-200 via-teal-100 to-lime-100',
    inisial: 'R',
    ringkasan: 'Editorial engine that built authority and pipeline.',
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
  { id: 'proyek', nilai: 1200, akhiran: '+', desimal: 0, label: 'Projects Delivered' },
  { id: 'klien', nilai: 25, akhiran: 'k+', desimal: 0, label: 'Happy Clients' },
  { id: 'kepuasan', nilai: 98, akhiran: '%', desimal: 0, label: 'Client Satisfaction' },
  { id: 'pertumbuhan', nilai: 35, akhiran: 'X', desimal: 0, label: 'Client Growth Result' },
];

export interface NegaraMarklo {
  bendera: string;
  nama: string;
}

export const NEGARA_MARKLO: NegaraMarklo[] = [
  { bendera: '🇺🇸', nama: 'United States' },
  { bendera: '🇬🇧', nama: 'United Kingdom' },
  { bendera: '🇮🇳', nama: 'India' },
  { bendera: '🇦🇺', nama: 'Australia' },
  { bendera: '🇨🇦', nama: 'Canada' },
  { bendera: '🇩🇪', nama: 'Germany' },
  { bendera: '🇸🇬', nama: 'Singapore' },
  { bendera: '🇮🇩', nama: 'Indonesia' },
];

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

export interface TahapFunnelMarklo {
  tahap: string;
  layanan: string;
  gradien: string;
  desk: string;
}

export const FUNNEL_MARKLO: TahapFunnelMarklo[] = [
  {
    tahap: 'Attract Customer',
    layanan: 'Meta Ads',
    gradien: 'from-rose-200 to-pink-100',
    desk: 'Scroll-stopping creative that puts your brand in front of the right people.',
  },
  {
    tahap: 'Engage Prospect',
    layanan: 'Google Ads',
    gradien: 'from-sky-200 to-blue-100',
    desk: 'High-intent search traffic, captured at the exact moment people look for you.',
  },
  {
    tahap: 'Convert Clients',
    layanan: 'Viral TikTok Ads',
    gradien: 'from-violet-200 to-purple-100',
    desk: 'Short-form video that turns attention into enquiries and sales.',
  },
  {
    tahap: 'Retain Clients',
    layanan: 'Content Marketing',
    gradien: 'from-emerald-200 to-teal-100',
    desk: 'Useful content that keeps customers coming back — and bringing friends.',
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
// Daftar + data URI logo ada di src/lib/logoMitra.ts (10 logo yang
// diunggah pengguna, di-embed sebagai base64). Nama ekspor dipertahankan
// supaya Marklo.tsx tidak berubah impornya.
export { LOGO_MITRA as LOGO_KLIEN_MARKLO } from './logoMitra';
export type { LogoMitra } from './logoMitra';

export interface ManfaatMarklo {
  judul: string;
  desk: string;
  tautan?: { label: string; jangkar: string };
}

export const MANFAAT_MARKLO: ManfaatMarklo[] = [
  {
    judul: 'Increased Visibility',
    desk: 'Show up where your customers already are — search, social, and beyond.',
  },
  {
    judul: 'Targeted Audience',
    desk: 'Reach the people most likely to buy, instead of shouting at everyone.',
  },
  {
    judul: 'Cost-Effective Growth',
    desk: 'Every rupiah of budget is tracked against pipeline and revenue.',
  },
  {
    judul: 'Higher Conversions',
    desk: 'Landing pages, offers, and follow-ups tuned to turn clicks into customers.',
    tautan: { label: 'Book a Call', jangkar: '#booking' },
  },
  {
    judul: 'Competitive Advantage',
    desk: 'Move faster than competitors still guessing what works.',
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
    nama: 'Gabriel Ross',
    peran: 'CEO, Lumo Labs',
    inisial: 'GR',
    gradien: 'from-rose-200 to-orange-100',
    kutipan:
      'Marklo rebuilt our funnel from scratch. Within weeks we finally knew which campaigns were making money — and which ones to stop.',
  },
  {
    nama: 'Samuel M',
    peran: 'Founder, ZenZap',
    inisial: 'SM',
    gradien: 'from-sky-200 to-blue-100',
    kutipan:
      'The weekly reporting alone is worth it. No jargon, no vanity numbers — just leads, costs, and what happens next.',
  },
  {
    nama: 'Pranav K',
    peran: 'Marketing Lead, Innovio',
    inisial: 'PK',
    gradien: 'from-violet-200 to-purple-100',
    kutipan:
      'Our cost per acquisition dropped by half in the first month. The team tests fast and explains every change.',
  },
  {
    nama: 'David L',
    peran: 'Director, Craftgram',
    inisial: 'DL',
    gradien: 'from-emerald-200 to-teal-100',
    kutipan:
      'We tried three agencies before Marklo. They are the first ones who treated our budget like their own money.',
  },
  {
    nama: 'Ethan W',
    peran: 'Owner, Sparkle',
    inisial: 'EW',
    gradien: 'from-amber-200 to-yellow-100',
    kutipan:
      'From the first audit call it was clear they had done their homework. The plan was specific to our business, not a template.',
  },
  {
    nama: 'James R',
    peran: 'CMO, Reviro',
    inisial: 'JR',
    gradien: 'from-cyan-200 to-sky-100',
    kutipan:
      'Content, ads, and reporting finally work as one system. Pipeline is up and the sales team actually trusts the leads.',
  },
  {
    nama: 'Daniel Lee',
    peran: 'CEO, Beskon',
    inisial: 'DL',
    gradien: 'from-orange-400 to-rose-400',
    kutipan:
      'Marklo is the growth partner we had been looking for. Revenue from paid campaigns tripled — and we can see exactly why.',
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
    a: 'Meta Ads, Google Ads, viral TikTok Ads, SEO, and content marketing — all built around one funnel, from first click to repeat customer.',
  },
  {
    q: 'How can digital marketing help my business?',
    a: 'It puts you in front of people already looking for what you sell, then turns that attention into measurable leads and sales.',
  },
  {
    q: 'How long does it take to see results?',
    a: 'Paid campaigns usually show first signals within 2–4 weeks. SEO and content compound over months — we report progress every week so you always know where things stand.',
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

export const ZONA_WAKTU_MARKLO: ZonaWaktuMarklo[] = [
  { id: 'Asia/Jakarta', label: 'WIB — Jakarta (UTC+7)', offsetMenit: 420 },
  { id: 'Asia/Singapore', label: 'SGT — Singapore (UTC+8)', offsetMenit: 480 },
  { id: 'UTC', label: 'UTC', offsetMenit: 0 },
];

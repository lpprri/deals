// Verifikasi landing page tiruan template agency "Marklo"
// (PR landing-marklo-clone, route `/`).
// Asersi:
// - Route `/` (belum login, halamanPublik 'beranda') me-render
//   MarkloLanding dengan tombol Login; Beranda lama TIDAK dipakai di
//   App.tsx tetapi filenya TETAP ADA di repo (tidak dihapus).
// - Semua section template ada: header, hero, carousel kampanye,
//   pernyataan, statistik (counter), process, services funnel,
//   comparison, why-marketing, booking konsultasi, testimonials,
//   FAQ, footer gelap.
// - Motion "hidup": IntersectionObserver (reveal blur/fade),
//   requestAnimationFrame (counter), carousel auto-advance,
//   marquee logo, accordion FAQ, hover states.
// - Yang DIPARKIR (penyesuaian RRI belakangan): Lacak, Ajukan,
//   statistik live, dua bahasa — tidak ada di landing baru.
//   KECUALI aksen warna (PR oren-ke-biru): vermilion template diganti
//   Biru RRI #2573E2 (hover Navy #0D2569, peach jadi biru muda #e8f1fe),
//   gradasi avatar oren/amber/rose jadi biru/sky; merah error booking
//   tetap merah (fungsional), logo merek Instagram/TikTok/YouTube tetap
//   warna merek.
//   KECUALI footer: gradien navy RRI + logo putih + kolom "Site Map" /
//   "What to Do" + header seamless, atas permintaan eksplisit pengguna
//   2026-11-17 (PR landing-footer-navy-putih; judul kolom "Our Service")
//   dan revisi 2026-11-18 (PR footer-site-map-client-portal: "Navigation"
//   → "Site Map", kolom baru "Client Portal", "Our Service" → "Additional
//   Service") dan revisi 2026-11-21 17:57 WIB (kolom "Client Portal"
//   DIHAPUS, "Additional Service" kembali jadi "Our Service", "Plan a
//   Campaign" pindah ke "Our Service") dan revisi 2026-11-21 18:27 WIB
//   (judul kolom "Our Service" diubah jadi "What to Do").
//   KECUALI section Comparison + strip logo (PR #97): latar gradasi
//   diagonal NAVY RRI (#1a3a8a -> #0D2569 -> #04122e, gaya gradasi latar
//   gelap template, BUKAN maroon template — koreksi pengguna 15:48 WIB);
//   logo mitra PUTIH tanpa chip sejak PR landing-logo-mitra-putih
//   (membalik PR #97 atas permintaan pengguna 2026-11-18; logo diolah
//   jadi putih-transparan per file, BUKAN filter CSS).
// - Jujur: nama/klien/testimoni/angka adalah SAMPLE template
//   (dinyatakan di data + PR body); tidak ada hotlink gambar eksternal.
//   KECUALI strip logo di bawah Comparison: 10 logo mitra nyata RRI
//   yang diunggah pengguna (PR #81), di-embed sebagai data URI di
//   src/lib/logoMitra.ts; sejak PR landing-logo-mitra-putih tiap logo
//   berwarna PUTIH (diolah per file) dan tampil langsung di atas latar
//   navy gelap, tanpa chip putih.
//   KECUALI section "Our Clients in 67+ Cities" (PR #82): 67 pil kota
//   satker nyata RRI, diturunkan dari DAFTAR_SATKER (master data nasional)
//   di src/lib/satker.ts, diurutkan abjad A–Z; KANTOR PUSAT +
//   PUSLITBANGDIKLAT tidak ditampilkan karena bukan kota.
//   KECUALI kartu kampanye (PR #95): tiap kartu memakai FOTO yang diunggah
//   pengguna (bukan gradasi + huruf awal), di-embed sebagai data URI WebP
//   di src/lib/fotoKampanye.ts, dipetakan ke nama klien (Badan_Narkotika_
//   Nasional.jpg -> BNN).
//   KECUALI section "Why do you need Marketing?" (PR
//   landing-why-marketing-template, 2026-11-18): mengikuti template ASLI
//   atas pilihan pengguna ("ikuti template asli", diklarifikasi "gaya
//   nya saja, teks tetap sama") — 4 kartu gradien pastel + ikon 3D
//   glossy orisinal hasil generate (bukan aset template), pill
//   "Confusion?" MERAH vermilion template #ff4d2e (varian lokal
//   PillMerahTemplate; LabelPill global tetap Biru RRI), tautan
//   "View our case study" hitam, latar section putih, layout 3 kartu
//   atas + 1 kartu lebar bawah SELEBAR FULL. Perubahan 2026-11-18
//   20:21 WIB (permintaan pengguna): kartu "Higher Conversions"
//   DIHAPUS (termasuk tautan "Book a Call" merahnya), kartu
//   "Competitive Advantage" selebar full, kalimatnya menjadi "Stand out
//   from other business in your industry." — persis seperti yang pengguna
//   tulis (bukan "businesses"/"websites" template asli). SEMUA TEKS LAIN
//   byte-identik dengan sebelumnya (3 manfaat atas termasuk "Every
//   rupiah...", heading, kartu CTA hitam "Still not sure where to
//   start?" — kartu CTA dipertahankan sebagai strip full-width di bawah
//   4 kartu, tombolnya tetap Biru RRI). Target tautan tetap #work
//   (bukan #testimonials template).
// - Tombol "Book a Free Call" menggulir ke kartu booking — perilaku
//   PR #78 (membuka halaman Meeting) DI-REVERT atas koreksi pengguna
//   2026-11-17 (PR landing-booking-ke-meeting). Kartu booking NYATA:
//   Next membuka form singkat (Nama, Perusahaan opsional, Kontak,
//   Topik); submit menyimpan permintaan sebagai Meeting di Firestore.
// - Teks social proof hero: "TRUSTED BY 100+ PARTNERS NATIONALLY"
//   (avatar, bintang, 4.9/5.0 tidak berubah; teks lama tidak tersisa).
// - Batch landing 2026-11-19 (permintaan pengguna 08:51–08:54 WIB):
//   pill Alfamart "Promotion" → "Radio Spot"; keempat kotak layanan
//   BISA DI-KLIK → halaman "Plan a Campaign" (role="button" +
//   keyboard); halaman publik baru "Plan a Campaign" men-embed form
//   Tally (id ArpNAN) dan footer "Plan a Campaign" membuka halaman
//   itu — BUKAN lagi gulir ke kartu booking. Deskripsi kartu kampanye
//   yang semula max 3 baris (line-clamp-3) DIHAPUS oleh koreksi
//   pengguna 09:12 WIB (memotong kalimat) — deskripsi tampil UTUH
//   tanpa elipsis, kartu sm:w-[520px] supaya teks maksimal sampai
//   ujung box (Perempuan Indonesia Maju muat 2 baris).
// - Zona waktu booking (keputusan pengguna 2026-11-19 14:45 WIB):
//   dropdown TIME ZONE hanya 3 zona Indonesia — WIB Jakarta (UTC+7),
//   WITA Makassar (UTC+8), WIT Jayapura (UTC+9); SGT Singapore + UTC
//   dihapus. Default tetap WIB; slot disimpan basis WIB, zona hanya
//   menggeser tampilan jam (offsetMenit - 420).
// Skrip ini membaca berkas sebagai teks. Keluar bukan-nol bila ada
// asersi gagal.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { KOTA_SATKER_MARKLO, ZONA_WAKTU_MARKLO } from '../src/lib/landingMarklo';

// Daftar 67 kota satker (Title Case, urutan ABJAD A–Z, keputusan user
// 2026-11-18) yang harus tampil sebagai pil di section
// "Our Clients in 67+ Cities" (PR #82).
const KOTA_HARAPAN: string[] = [
  'Ambon', 'Atambua', 'Banda Aceh', 'Bandar Lampung', 'Bandung',
  'Banjarmasin', 'Banten', 'Batam', 'Bengkulu', 'Biak', 'Bogor',
  'Bovendigoel', 'Bukittinggi', 'Cirebon', 'Denpasar', 'Ende', 'Fak Fak',
  'Gorontalo', 'Gunung Sitoli', 'Jakarta', 'Jambi', 'Jayapura', 'Jember',
  'Kendari', 'Kupang', 'Langgur', 'Lhokseumawe', 'Madiun', 'Makassar',
  'Malang', 'Mamuju', 'Manado', 'Manokwari', 'Mataram', 'Medan', 'Merauke',
  'Meulaboh', 'Nabire', 'Nunukan', 'Padang', 'Palangkaraya', 'Palembang',
  'Palu', 'Pekanbaru', 'Pontianak', 'Purwokerto', 'Ranai', 'Samarinda',
  'Sanggau', 'Semarang', 'Serui', 'Sibolga', 'Singaraja', 'Sintang',
  'Sorong', 'Sumenep', 'Sungailiat', 'Surabaya', 'Surakarta', 'Tahuna',
  'Takengon', 'Tanjung Pinang', 'Tarakan', 'Ternate', 'Toli Toli',
  'Wamena', 'Yogyakarta',
];

// Dijalankan dari root repo (pola skrip cek lain).
const baca = (relatif: string) =>
  readFileSync(join(process.cwd(), relatif), 'utf8');
const app = baca('src/App.tsx');
const marklo = baca('src/modules/landing/Marklo.tsx');
const comingSoon = baca('src/modules/ComingSoon.tsx');
const planCampaign = baca('src/modules/PlanCampaign.tsx');
const dataMarklo = baca('src/lib/landingMarklo.ts');
const logoMitra = baca('src/lib/logoMitra.ts');
const fotoKampanye = baca('src/lib/fotoKampanye.ts');
const logoLayanan = baca('src/lib/logoLayanan.ts');
const css = baca('src/index.css');
const firestoreStore = baca('src/lib/firestoreStore.ts');
const rules = baca('firestore.rules');
const berandaLama = baca('src/modules/Beranda.tsx');
const layananLama = baca('src/modules/landing/Layanan.tsx');
const kolaborasiLama = baca('src/modules/landing/Kolaborasi.tsx');
const tentangLama = baca('src/modules/landing/Tentang.tsx');

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};

// --- 1. Wiring App.tsx: route `/` memakai Marklo, Beranda tidak dipakai. ---
cek(
  "App.tsx: import MarkloLanding dari './modules/landing/Marklo'",
  app.includes("import MarkloLanding from './modules/landing/Marklo';"),
);
cek(
  "App.tsx: beranda me-render <MarkloLanding onLogin + onPlanCampaign + onKirimBooking /> (prop onLacak DIHAPUS 2026-11-21 — kolom footer Client Portal dihapus, Lacak tanpa tombol masuk dari landing)",
  app.includes('<MarkloLanding') &&
    app.includes("onLogin={() => setHalamanPublik('login')}") &&
    !app.includes("onLacak={() => setHalamanPublik('lacak')}") &&
    app.includes("onPlanCampaign={() => setHalamanPublik('plan-campaign')}") &&
    app.includes('onKirimBooking={kirimBookingPublik}'),
);
cek(
  "App.tsx: halaman 'plan-campaign' ada — import PlanCampaign + cabang halamanPublik + onKembali ke beranda",
  app.includes("import PlanCampaign from './modules/PlanCampaign';") &&
    app.includes("halamanPublik === 'plan-campaign'") &&
    app.includes('<PlanCampaign') &&
    app.includes("'beranda' | 'login' | 'lacak' | 'ajukan' | 'coming-soon' | 'plan-campaign'"),
);
cek(
  'App.tsx: TIDAK lagi me-render Beranda di route beranda',
  !app.includes('<Beranda'),
);
cek(
  'App.tsx: TIDAK lagi import Beranda / HalamanLanding',
  !app.includes("from './modules/Beranda'") && !app.includes('HalamanLanding'),
);
cek(
  'App.tsx: state landing lama (halamanLanding/navigasiLanding) sudah dibersihkan',
  !app.includes('halamanLanding') && !app.includes('navigasiLanding'),
);
cek(
  'App.tsx: Lacak + Ajukan tetap bisa dibuka (cabang lacak/ajukan masih ada)',
  app.includes("halamanPublik === 'lacak'") &&
    app.includes("halamanPublik === 'ajukan'"),
);

// --- 2. Landing lama tetap di repo (tidak dihapus). ---
cek(
  'Beranda.tsx lama tetap ada (export default function Beranda)',
  berandaLama.includes('export default function Beranda'),
);
cek(
  'landing/Layanan.tsx, Kolaborasi.tsx, Tentang.tsx lama tetap ada',
  layananLama.includes('Layanan') &&
    kolaborasiLama.includes('Kolaborasi') &&
    tentangLama.includes('Tentang'),
);

// --- 3. Header. ---
cek(
  'Header: nav About, Service, Testimonials, Process (jangkar)',
  marklo.includes("gulirKe('about')") &&
    marklo.includes("gulirKe('services')") &&
    marklo.includes("gulirKe('testimonials')") &&
    marklo.includes("gulirKe('process')"),
);
cek(
  'Header: pill tengah Home + Options (dropdown, bukan 4 tautan langsung)',
  marklo.includes("gulirKe('atas')") &&
    marklo.includes('menuTerbuka') &&
    marklo.includes('ChevronDown') &&
    marklo.includes('rounded-full border border-slate-200') &&
    marklo.includes('aria-haspopup="true"'),
);
cek(
  'Header: ikon video-call (Book a Free Call) + ikon profil (Login, onLogin) — hanya di header',
  marklo
    .slice(marklo.indexOf('function Header('), marklo.indexOf('</header>'))
    .includes('aria-label="Book a Free Call"') &&
    marklo
      .slice(marklo.indexOf('function Header('), marklo.indexOf('</header>'))
      .includes('aria-label="Login"') &&
    marklo.includes('onClick={onLogin}'),
);
cek(
  'Header: logo RRI Deals di dalam pill (gaya Rare UI) — logo apa adanya, hanya dibungkus pill',
  marklo.includes('min-w-0 items-center gap-2 rounded-full border') &&
    marklo.includes('LOGO_RRI_LANDING_DATA_URI') &&
    marklo.includes('LOGO_DEALS_DATA_URI'),
);
cek(
  'Header: brand RRI Deals (logo RRI + Deals, apa adanya)',
  marklo.includes('LOGO_RRI_LANDING_DATA_URI') &&
    marklo.includes('LOGO_DEALS_DATA_URI'),
);
cek(
  'Header: seamless tanpa garis bawah — tidak ada border-b/divider di bawah header',
  marklo.includes('className="sticky top-0 z-50 bg-white/90 backdrop-blur"') &&
    !marklo
      .slice(marklo.indexOf('function Header('), marklo.indexOf('</header>'))
      .includes('border-b border-slate-200'),
);

// --- 4. Hero. ---
cek(
  'Hero: H1 raksasa "Grow smarter with our marketing."',
  marklo.includes('Grow <span className="text-slate-300">smarter</span> with our') &&
    marklo.includes('marketing.'),
);
cek(
  'Hero: tombol primer "Book a Free Call" + outline "Our Services"',
  marklo.includes('Book a Free Call') && marklo.includes('Our Services'),
);
cek(
  'Hero: social proof bintang 5 + rating 4.9 + "TRUSTED BY 100+ PARTNERS NATIONALLY" (teks lama hilang)',
  marklo.includes('TRUSTED BY 100+ PARTNERS NATIONALLY') &&
    !marklo.includes('TRUSTED BY 500+ BRANDS GLOBALLY') &&
    marklo.includes('useCountUp(4.9') &&
    marklo.includes('BintangLima'),
);

// --- 5. Carousel kampanye. ---
cek(
  'Carousel: section id="work" + 7 kampanye nyata RRI (PLN, Taspen, Alfamart, Medco, Bank Indonesia, Perempuan Indonesia Maju, BNN) — template hilang',
  marklo.includes('id="work"') &&
    dataMarklo.includes("klien: 'PLN'") &&
    dataMarklo.includes("klien: 'Taspen'") &&
    dataMarklo.includes("klien: 'Alfamart'") &&
    dataMarklo.includes("klien: 'Medco'") &&
    dataMarklo.includes("klien: 'Bank Indonesia'") &&
    dataMarklo.includes("klien: 'Perempuan Indonesia Maju'") &&
    dataMarklo.includes("klien: 'BNN'") &&
    !dataMarklo.includes("klien: 'Perempuan Indonesia Maju (PIM)'") &&
    !dataMarklo.includes("klien: 'BNN Sumsel'") &&
    !dataMarklo.includes("klien: 'RingID'") &&
    !dataMarklo.includes("klien: 'Beskon Music'") &&
    !dataMarklo.includes("klien: 'Boutique'") &&
    !dataMarklo.includes("klien: 'Reviro'"),
);
cek(
  'Carousel: judul kampanye TIDAK tampil (PR #86) — ketujuh judul hilang dari data + komponen, deskripsi tetap',
  !dataMarklo.includes('Spot Iklan Edukasi Bahaya & Manfaat Listrik') &&
    !dataMarklo.includes('Adlibs Waspada Penipuan Mengatasnamakan PT Taspen') &&
    !dataMarklo.includes('Promosi Alfamart') &&
    !dataMarklo.includes('Goes to Campus "Ngobrol Seputar Gas: Integritas dalam Industri Hulu Migas"') &&
    !dataMarklo.includes('Event Digital Kito Galo 7th X Gemilang Palembang Raya 2026') &&
    !dataMarklo.includes('Parade Kebaya Songket: Pesona Perempuan Indonesia') &&
    !dataMarklo.includes('Re-Link (Rehabilitasi Keliling) & Pindang (Pelayanan Aplikasi)') &&
    !marklo.includes('{k.judul}') &&
    dataMarklo.includes('A public-education spot that makes electricity safety simple to understand') &&
    dataMarklo.includes('A public-service spot that takes rehabilitation on the road'),
);
cek(
  'Carousel: layanan English (Radio Spot, Adlibs, Adlibs & Interactive Dialogue, Interactive Dialogue) — "Promotion" HILANG (pill Alfamart jadi "Radio Spot", permintaan pengguna 2026-11-19 08:52 WIB)',
  dataMarklo.includes("layanan: 'Radio Spot'") &&
    dataMarklo.includes("layanan: 'Adlibs'") &&
    !dataMarklo.includes("layanan: 'Promotion'") &&
    dataMarklo.includes("layanan: 'Adlibs & Interactive Dialogue'") &&
    dataMarklo.includes("layanan: 'Interactive Dialogue'"),
);
cek(
  'Carousel: pill Alfamart "Radio Spot" (bukan "Promotion") — dicek di blok Alfamart saja',
  (() => {
    const blokAlfamart = dataMarklo.slice(
      dataMarklo.indexOf("klien: 'Alfamart'"),
      dataMarklo.indexOf("klien: 'Medco'"),
    );
    return (
      blokAlfamart.includes("layanan: 'Radio Spot'") &&
      !blokAlfamart.includes("layanan: 'Promotion'")
    );
  })(),
);
cek(
  'Carousel: deskripsi kartu tampil UTUH tanpa pemotongan — TANPA line-clamp/truncation (koreksi pengguna 2026-11-19 09:12 WIB: line-clamp-3 dari PR #113 memotong kalimat dengan "..."); deskripsi di luar baris judul+pill (lebar penuh kartu), kartu sm:w-[520px] supaya teks maksimal sampai ujung box (Perempuan Indonesia Maju muat 2 baris); copy byte-identik',
  (() => {
    const kartu = marklo.slice(
      marklo.indexOf('function MarqueeKampanye()'),
      marklo.indexOf('function Pernyataan()'),
    );
    // <p> deskripsi berada SETELAH penutup baris judul+pill (</span>
    // lalu </div>), jadi memakai lebar penuh kartu — bukan kolom sempit
    // di samping pill.
    const pIdx = kartu.indexOf(
      '<p className="mt-1 text-sm leading-relaxed text-slate-500">',
    );
    const spanTutup = kartu.indexOf('</span>', kartu.indexOf('{k.layanan}'));
    return (
      !kartu.includes('line-clamp') &&
      !kartu.includes('truncate') &&
      kartu.includes('{k.ringkasan}') &&
      kartu.includes('sm:w-[520px]') &&
      pIdx > spanTutup &&
      kartu.slice(spanTutup, pIdx).includes('</div>')
    );
  })(),
);
// Blok data kampanye saja (bukan seluruh landingMarklo.ts — LAYANAN dan
// TESTIMONI masih memakai gradien/inisial).
const blokKampanye = dataMarklo.slice(
  dataMarklo.indexOf('export const KAMPANYE_MARKLO'),
  dataMarklo.indexOf('];', dataMarklo.indexOf('export const KAMPANYE_MARKLO')),
);
cek(
  'Carousel: teks deskripsi lengkap ada di data (tidak dipotong di sumber) — PLN, Medco, BNN, Perempuan Indonesia Maju',
  blokKampanye.includes('delivered loud and clear on air.') &&
    blokKampanye.includes('in plain language, with room for real questions.') &&
    blokKampanye.includes('explained simply for everyone listening.') &&
    blokKampanye.includes('talked about live on air.'),
);
cek(
  'Carousel: foto tiap kartu (PR #95) — 7 data URI WebP di fotoKampanye.ts, dipetakan ke nama klien',
  fotoKampanye.includes('export const FOTO_KAMPANYE') &&
    fotoKampanye.includes("'PLN': 'data:image/webp;base64,") &&
    fotoKampanye.includes("'Taspen': 'data:image/webp;base64,") &&
    fotoKampanye.includes("'Alfamart': 'data:image/webp;base64,") &&
    fotoKampanye.includes("'Medco': 'data:image/webp;base64,") &&
    fotoKampanye.includes("'Bank Indonesia': 'data:image/webp;base64,") &&
    fotoKampanye.includes("'Perempuan Indonesia Maju': 'data:image/webp;base64,") &&
    fotoKampanye.includes("'BNN': 'data:image/webp;base64,") &&
    !fotoKampanye.includes("'BNN Sumsel'") &&
    !fotoKampanye.includes("'Perempuan Indonesia Maju (PIM)'"),
);
cek(
  'Carousel: komponen memakai FOTO_KAMPANYE[k.klien] — img object-cover h-60, lazy (crop, bukan distorsi)',
  marklo.includes("import { FOTO_KAMPANYE } from '../../lib/fotoKampanye'") &&
    marklo.includes('src={FOTO_KAMPANYE[k.klien]}') &&
    marklo.includes('className="h-full w-full object-cover"') &&
    marklo.includes('loading="lazy"') &&
    marklo.includes('className="relative h-60 overflow-hidden"'),
);
cek(
  'Carousel: area gradasi + huruf awal HILANG (PR #95) — data kampanye tanpa gradien/inisial, komponen tanpa k.gradien/k.inisial',
  !blokKampanye.includes('gradien') &&
    !blokKampanye.includes('inisial') &&
    !marklo.includes('k.gradien') &&
    !marklo.includes('k.inisial') &&
    !marklo.includes('bg-gradient-to-br ${k.gradien}'),
);
cek(
  'Carousel: MARQUEE kampanye (PR landing-kampanye-marquee) — tombol prev/next + auto-advance 5 detik + snap HILANG; 7 kartu diduplikasi, animasi mk-marquee-kampanye, jeda hover',
  !marklo.includes('Previous campaign') &&
    !marklo.includes('Next campaign') &&
    !marklo.includes('gulirKartu') &&
    !marklo.includes('setInterval') &&
    !marklo.includes('snap-x snap-mandatory') &&
    !marklo.includes('scrollbar-tersembunyi') &&
    marklo.includes('function MarqueeKampanye()') &&
    marklo.includes('[...KAMPANYE_MARKLO, ...KAMPANYE_MARKLO]') &&
    marklo.includes('mk-marquee-kampanye flex w-max items-start gap-6') &&
    marklo.includes('aria-hidden={i >= KAMPANYE_MARKLO.length}') &&
    css.includes('.mk-marquee-kampanye {') &&
    css.includes('animation: mk-marquee 60s linear infinite;') &&
    css.includes('.mk-marquee-kampanye:hover {') &&
    css.includes('animation-play-state: paused;') &&
    css.includes('.mk-marquee,\n  .mk-marquee-kampanye {') &&
    !marklo.includes('CarouselKampanye'),
);

// --- 6. Pernyataan / About. ---
cek(
  'Pernyataan: "We focus on returns..." + "multi-platform marketing" abu-abu ("digital marketing" hilang)',
  marklo.includes('We focus on returns, scaling your brand through') &&
    marklo.includes('multi-platform marketing') &&
    !marklo.includes('digital marketing'),
);

// --- 7. Statistik (counter animasi). ---
cek(
  'Statistik: 3 item — 500+ Projects Delivered, 1k+ Happy Clients, 98% Client Satisfaction; kartu 35X dihapus',
  dataMarklo.includes("nilai: 500, akhiran: '+'") &&
    dataMarklo.includes("label: 'Projects Delivered'") &&
    dataMarklo.includes("nilai: 1, akhiran: 'k+'") &&
    dataMarklo.includes("label: 'Happy Clients'") &&
    dataMarklo.includes("nilai: 98, akhiran: '%'") &&
    dataMarklo.includes("label: 'Client Satisfaction'") &&
    !dataMarklo.includes("label: 'Client Growth Result'") &&
    !dataMarklo.includes('35X') &&
    !dataMarklo.includes('Client Growth') &&
    marklo.includes('grid grid-cols-2 gap-6 lg:grid-cols-3'),
);
cek(
  'Statistik: judul "Our Clients in 67+ Cities" + subjudul + pil kota satker (bukan negara)',
  marklo.includes('Our Clients in 67+ Cities') &&
    !marklo.includes('62+ Cities') &&
    marklo.includes('From the capital to the farthest corners of Indonesia') &&
    marklo.includes('KOTA_SATKER_MARKLO') &&
    !marklo.includes('Our Clients in 35+ Countries') &&
    !marklo.includes('NEGARA_MARKLO'),
);
cek(
  'Statistik: KOTA_SATKER_MARKLO diturunkan dari DAFTAR_SATKER (67 stasiun, Title Case) — negara template hilang',
  dataMarklo.includes("from './satker'") &&
    dataMarklo.includes("tipe === 'SATKER'") &&
    !dataMarklo.includes("nama: 'United States'") &&
    !dataMarklo.includes("nama: 'United Kingdom'") &&
    !dataMarklo.includes("nama: 'India'") &&
    !dataMarklo.includes("nama: 'Australia'") &&
    !dataMarklo.includes("nama: 'Canada'") &&
    !dataMarklo.includes("nama: 'Germany'") &&
    !dataMarklo.includes("nama: 'Singapore'") &&
    !dataMarklo.includes('NEGARA_MARKLO'),
);
cek(
  'Statistik: 67 pil kota persis DAFTAR_SATKER (Title Case, urutan ABJAD A–Z; tanpa Kantor Pusat/Puslitbangdiklat)',
  KOTA_SATKER_MARKLO.length === 67 &&
    KOTA_SATKER_MARKLO.every((kota, i) => kota === KOTA_HARAPAN[i]) &&
    KOTA_SATKER_MARKLO.every(
      (kota, i, arr) => i === 0 || arr[i - 1] < kota,
    ) &&
    !KOTA_SATKER_MARKLO.includes('Kantor Pusat') &&
    !KOTA_SATKER_MARKLO.includes('Puslitbangdiklat'),
);
cek(
  'Statistik: pil kota dirender sebagai marquee horizontal tak berujung (daftar terduplikasi, seperti strip logo mitra)',
  marklo.includes('[...KOTA_SATKER_MARKLO, ...KOTA_SATKER_MARKLO]') &&
    marklo.includes('mk-marquee flex w-max items-center gap-2') &&
    marklo.includes("animationDuration: '90s'") &&
    !marklo.includes('flex flex-wrap items-center justify-center gap-2'),
);

// --- 8. Process. ---
cek(
  'Process: pill "Process" + heading 3-step + Funnel Audit, Campaign Management, Reporting & Maximize Profit',
  marklo.includes('<LabelPill>Process</LabelPill>') &&
    marklo.includes('Our simple 3-step process to skyrocket your business.') &&
    dataMarklo.includes("judul: 'Funnel Audit'") &&
    dataMarklo.includes("judul: 'Campaign Management'") &&
    dataMarklo.includes("judul: 'Reporting & Maximize Profit'"),
);

// --- 9. Services (4 layanan RRI). ---
cek(
  'Services: pill "Services" + heading multi-platform + 4 layanan (Radio/Social Media/Digital Platform/Dialogue & Podcast)',
  marklo.includes('<LabelPill>Services</LabelPill>') &&
    marklo.includes('Multi-platform marketing for predictable, lasting growth.') &&
    dataMarklo.includes("nama: 'Radio Ads'") &&
    dataMarklo.includes("nama: 'Social Media Ads'") &&
    dataMarklo.includes("nama: 'Digital Platform Ads'") &&
    dataMarklo.includes("nama: 'Dialogue & Podcast'"),
);
cek(
  'Services: label langkah template dipetakan ke layanan RRI (Attract→Radio, Engage→Social, Convert→Digital, Retain→Dialogue)',
  dataMarklo.includes("langkah: 'Attract Customer'") &&
    dataMarklo.includes("langkah: 'Engage Prospect'") &&
    dataMarklo.includes("langkah: 'Convert Clients'") &&
    dataMarklo.includes("langkah: 'Retain Clients'") &&
    marklo.includes('layanan.langkah'),
);
cek(
  'Services: label langkah bisa di-klik — button (bukan span) yang smooth-scroll ke kartu + sorot singkat (PR #91)',
  marklo.includes('onClick={() => pilihLayanan(i)}') &&
    marklo.includes('aria-label={`View ${layanan.nama} service`}') &&
    marklo.includes('id={`layanan-${i}`}') &&
    marklo.includes(
      "scrollIntoView({ behavior: 'smooth', block: 'center' })",
    ) &&
    marklo.includes('ring-mk-aksen') &&
    marklo.includes('window.setTimeout(() => setSorot(null), 1600)'),
);
cek(
  'Services: keempat kotak layanan BISA DI-KLIK → halaman "Plan a Campaign" (permintaan pengguna 2026-11-19 08:54 WIB) — article role="button" + keyboard (Enter/Spasi) + kursor pointer + hover naik; label langkah (PR #91) tetap scroll',
  (() => {
    const blokLayanan = marklo.slice(
      marklo.indexOf('function Layanan('),
      marklo.indexOf('function Perbandingan()'),
    );
    return (
      marklo.includes('onPlanCampaign: () => void') &&
      marklo.includes('<Layanan onPlanCampaign={onPlanCampaign} />') &&
      blokLayanan.includes('function Layanan({ onPlanCampaign }') &&
      blokLayanan.includes('role="button"') &&
      blokLayanan.includes('tabIndex={0}') &&
      blokLayanan.includes("aria-label={`Plan a Campaign — ${layanan.nama}`}") &&
      blokLayanan.includes('onClick={onPlanCampaign}') &&
      blokLayanan.includes("e.key === 'Enter'") &&
      blokLayanan.includes("e.key === ' '") &&
      blokLayanan.includes('cursor-pointer') &&
      blokLayanan.includes('hover:-translate-y-1') &&
      blokLayanan.includes('onClick={() => pilihLayanan(i)}')
    );
  })(),
);
cek(
  'Services: logo per layanan ter-embed (programa 1-4, Instagram+TikTok, RRI Digital+rri.co.id, YouTube)',
  dataMarklo.includes('logo: LOGO_PROGRAMA') &&
    dataMarklo.includes('logo: LOGO_SOSIAL') &&
    dataMarklo.includes('logo: LOGO_PLATFORM') &&
    dataMarklo.includes('logo: LOGO_YOUTUBE') &&
    logoLayanan.includes("nama: 'Pro 1'") &&
    logoLayanan.includes("nama: 'Pro 4'") &&
    logoLayanan.includes("nama: 'Instagram'") &&
    logoLayanan.includes("nama: 'TikTok'") &&
    logoLayanan.includes("nama: 'RRI Digital'") &&
    logoLayanan.includes("nama: 'rri.co.id'") &&
    logoLayanan.includes("nama: 'YouTube'") &&
    logoLayanan.includes('data:image/webp;base64,') &&
    logoLayanan.includes('data:image/svg+xml,') &&
    marklo.includes('layanan.logo.map'),
);
cek(
  'Services: logo tanpa chip putih — logo langsung di atas gradasi kartu (PR #90)',
  marklo.includes('layanan.logo.map') &&
    !marklo.includes('rounded-lg bg-white px-1.5 py-1 shadow-sm ring-1 ring-slate-200/70'),
);
cek(
  'Services: keempat deskripsi layanan ada + teks funnel lama hilang (tag/Step/35X)',
  dataMarklo.includes("Prime-time spots and adlibs broadcast across 67 cities") &&
    dataMarklo.includes('Thumb-stopping creative built for the feed') &&
    dataMarklo.includes("Your brand across RRI's digital platforms") &&
    dataMarklo.includes('Interactive dialogues and podcasts that give your story room to breathe') &&
    !dataMarklo.includes("layanan: 'Meta Ads'") &&
    !dataMarklo.includes("layanan: 'Google Ads'") &&
    !dataMarklo.includes("layanan: 'Viral TikTok Ads'") &&
    !dataMarklo.includes("layanan: 'Content Marketing'") &&
    !marklo.includes('Step {i + 1}') &&
    !marklo.includes('35X') &&
    !marklo.includes('Client Growth'),
);
cek(
  'Services: susunan tangga diagonal + garis penghubung beranimasi + kartu melayang (gaya template)',
  marklo.includes('OFFSET_FUNNEL') &&
    marklo.includes('mk-layang') &&
    marklo.includes('mk-garis-funnel') &&
    css.includes('@keyframes mk-layang') &&
    css.includes('@keyframes mk-garis-bergerak') &&
    !marklo.includes('border-l-2 border-dashed'),
);
// Blok data LAYANAN_MARKLO saja (gradien -200/-100 yang sama juga dipakai
// TESTIMONI_MARKLO — di luar cakupan PR #92, jangan ikut dihitung).
const layananData = dataMarklo.slice(
  dataMarklo.indexOf('export const LAYANAN_MARKLO'),
  dataMarklo.indexOf(
    '];',
    dataMarklo.indexOf('export const LAYANAN_MARKLO'),
  ),
);
cek(
  'Services: gradasi kartu pucat seperti template — bukan gradasi jenuh -200/-100 (PR #92; kartu pertama biru muda sejak PR oren-ke-biru)',
  layananData.includes("gradien: 'from-blue-100 to-sky-50'") &&
    layananData.includes("gradien: 'from-sky-100 to-blue-50'") &&
    layananData.includes("gradien: 'from-violet-100 to-purple-50'") &&
    layananData.includes("gradien: 'from-emerald-100 to-teal-50'") &&
    !layananData.includes("gradien: 'from-rose-100 to-pink-50'") &&
    !layananData.includes("gradien: 'from-rose-200 to-pink-100'") &&
    !layananData.includes("gradien: 'from-sky-200 to-blue-100'") &&
    !layananData.includes("gradien: 'from-violet-200 to-purple-100'") &&
    !layananData.includes("gradien: 'from-emerald-200 to-teal-100'"),
);
cek(
  'Services: ukuran + warna dekat template — kartu lebih sempit (max-w-xl), padding lebih lega, judul lebih besar, latar putih, label pertama biru RRI (PR oren-ke-biru)',
  marklo.includes('<section id="services" className="bg-white py-16 sm:py-20">') &&
    marklo.includes('max-w-xl rounded-[20px]') &&
    marklo.includes('p-7 shadow-md') &&
    marklo.includes('sm:p-8') &&
    marklo.includes('<h3 className="text-2xl font-extrabold text-black">') &&
    marklo.includes('text-[15px] leading-relaxed text-slate-600') &&
    marklo.includes("i === 0 ? 'text-[#2573e2]' : 'text-slate-400'"),
);
cek(
  'Services: logo beranimasi saat di-hover — goyang ringan + naik (PR #92), dimatikan bila prefers-reduced-motion',
  marklo.includes('mk-logo-layanan h-10 w-auto sm:h-12') &&
    css.includes('@keyframes mk-logo-goyang') &&
    css.includes('.mk-logo-layanan:hover') &&
    css.includes('mk-logo-goyang 0.7s ease-in-out infinite') &&
    (css.match(/mk-logo-layanan/g) || []).length >= 3,
);
cek(
  'Services: kartu scroll-reveal dalam — hidden (naik 48px + blur kuat) sampai masuk viewport, muncul halus bertahap seperti template (PR #93)',
  marklo.includes('className="mk-reveal-dalam"') &&
    marklo.includes('tunda={i * 180}') &&
    marklo.includes('ambang={0.15}') &&
    marklo.includes('margin="0px 0px -8% 0px"') &&
    marklo.includes('threshold: ambang') &&
    marklo.includes('rootMargin: margin') &&
    marklo.includes("document\n      .getElementById(`layanan-${i}`)") &&
    css.includes('.mk-reveal.mk-reveal-dalam') &&
    css.includes('transform: translateY(48px);') &&
    css.includes('filter: blur(12px);') &&
    css.includes('transition-duration: 0.9s;') &&
    css.includes('  .mk-reveal.mk-reveal-dalam {\n    opacity: 1;'),
);

// --- 10. Comparison. ---
cek(
  'Comparison: pill "Comparison" + heading + Other Services vs Our Service',
  marklo.includes('<LabelPill gelap>Comparison</LabelPill>') &&
    marklo.includes('But, why would you want to work with us?') &&
    marklo.includes('Other Services') &&
    marklo.includes('Our Service') &&
    !marklo.includes('Other Agencies') &&
    !marklo.includes('Our Agency'),
);
cek(
  'Comparison: X merah (lain) + ceklis biru (kami), 5 butir masing-masing (ikon cek biru muda sejak PR oren-ke-biru)',
  dataMarklo.includes('Generic copy-paste strategies') &&
    dataMarklo.includes('Custom campaigns built on your data') &&
    marklo.includes('bg-blue-100') &&
    marklo.includes('bg-mk-peach'),
);
cek(
  'Comparison: strip logo = 10 logo mitra PUTIH nyata RRI (marquee, gambar <img>) tanpa garis pembatas di atas & bawah, TANPA chip putih — logo putih langsung di atas latar navy (PR landing-logo-mitra-putih, membalik PR #97)',
  ['Taspen', 'Bank Sumsel Babel', 'PLN', 'Alfamart', 'MedcoEnergi', 'Bea Cukai', 'Bank Indonesia', 'BNN', 'DJP', 'Komdigi'].every((nama) =>
    logoMitra.includes(`nama: '${nama}'`),
  ) &&
    logoMitra.includes('data:image/webp;base64,') &&
    logoMitra.includes('PUTIH-TRANSPARAN') &&
    marklo.includes('mk-marquee') &&
    marklo.includes('<img') &&
    marklo.includes('logo.logoDataUri') &&
    !marklo.includes('rounded-lg bg-white px-3 py-2 shadow-sm') &&
    // Filter brightness(0) invert(1) TETAP dipakai di FOOTER (logo RRI
    // putih di navy, PR #76) — yang dilarang hanya di strip logo mitra,
    // jadi cek negatifnya dibatasi ke blok marquee, bukan seluruh file.
    // Batas akhir slice: dulu div overlay fade (mk-fade-tepi-kiri) —
    // sejak PR landing-logo-marquee-fade-mask overlay dihapus, dipakai
    // header section berikutnya (Why Marketing) sebagai penanda akhir
    // blok marquee.
    !marklo
      .slice(
        marklo.indexOf('mk-marquee flex w-max items-center gap-12'),
        marklo.indexOf('/* ================= Why Marketing ================= */'),
      )
      .includes('brightness(0)') &&
    !marklo
      .slice(
        marklo.indexOf('mk-marquee flex w-max items-center gap-12'),
        marklo.indexOf('/* ================= Why Marketing ================= */'),
      )
      .includes('invert(1)') &&
    !marklo.includes('grayscale') &&
    !marklo.includes('opacity-60') &&
    !marklo.includes('border-y'),
);
cek(
  'Comparison: latar gradasi diagonal navy RRI (PR #97, BUKAN maroon, BUKAN flat solid) + judul putih + pill gelap',
  marklo.includes('<section className="mk-latar-navy py-16 sm:py-20">') &&
    marklo.includes('<LabelPill gelap>Comparison</LabelPill>') &&
    marklo.includes('text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl') &&
    css.includes('.mk-latar-navy {') &&
    css.includes('linear-gradient(105deg, #1a3a8a 0%, #0d2569 55%, #04122e 100%)') &&
    !marklo.includes('<LabelPill>Comparison</LabelPill>'),
);
cek(
  'Comparison: strip logo fade-out di ujung kiri & kanan via MASK pada container (PR landing-logo-marquee-fade-mask — mengganti overlay PR #98 yang terbaca sebagai bar kaku; mask membuat LOGO memudar, latar navy tetap seragam, TANPA div overlay)',
  marklo.includes('<div className="mk-fade-mask-logo relative mt-6 overflow-hidden py-5">') &&
    !marklo.includes('mk-fade-tepi-kiri') &&
    !marklo.includes('mk-fade-tepi-kanan') &&
    css.includes('.mk-fade-mask-logo {') &&
    css.includes('-webkit-mask-image: linear-gradient(to right, transparent 0, #000 12%, #000 88%, transparent 100%)') &&
    css.includes('mask-image: linear-gradient(to right, transparent 0, #000 12%, #000 88%, transparent 100%)') &&
    !css.includes('.mk-fade-tepi-kiri {') &&
    !css.includes('.mk-fade-tepi-kanan {'),
);
cek(
  'Comparison: baris "Trusted by hundreds of companies in Indonesia" 1×, putih tebal rata tengah, TEPAT di atas marquee logo (permintaan pengguna 16:42 WIB — bukan "thousands worldwide" template)',
  marklo.split('Trusted by hundreds of companies in Indonesia').length - 1 === 1 &&
    marklo.includes(
      '<p className="mt-12 text-center text-sm font-bold tracking-wide text-white">',
    ) &&
    marklo.indexOf('Trusted by hundreds of companies in Indonesia') <
      marklo.indexOf('mk-marquee flex w-max items-center gap-12') &&
    !marklo.includes('Trusted by thousands of companies worldwide') &&
    !marklo.includes('thousands of companies worldwide'),
);
cek(
  'Comparison: wordmark contoh template (ZenZap, Sparkle, Innovio, Craftgram, Lumo Labs) tidak ada lagi',
  !dataMarklo.includes("'ZenZap'") &&
    !dataMarklo.includes("'Sparkle'") &&
    !dataMarklo.includes("'Innovio'") &&
    !dataMarklo.includes("'Craftgram'") &&
    !dataMarklo.includes("'Lumo Labs'") &&
    !marklo.includes('ZenZap') &&
    !marklo.includes('Sparkle') &&
    !marklo.includes('Innovio') &&
    !marklo.includes('Craftgram') &&
    !marklo.includes('Lumo Labs'),
);
cek(
  'Landing: frasa "digital marketing" 0 di seluruh teks landing (termasuk FAQ), "multi-platform marketing" ada',
  !(marklo + dataMarklo).toLowerCase().includes('digital marketing') &&
    marklo.includes('multi-platform marketing') &&
    dataMarklo.includes('How can marketing help my business?') &&
    !dataMarklo.includes('How can multi-platform marketing help my business?'),
);

// --- 11. Why Marketing (gaya template asli, PR landing-why-marketing-template). ---
// Slice fungsi saja: string 'bg-white py-16 sm:py-20' juga dipakai
// section lain (dengan id), jadi asersi latar + gradien + ikon dibatasi
// ke fungsi ini. Copy TIDAK BERUBAH (keputusan pengguna 2026-11-18:
// "gaya nya saja, teks tetap sama").
const mengapaMarklo = marklo.slice(
  marklo.indexOf('function MengapaMarketing()'),
  marklo.indexOf('/* ================= Booking konsultasi ================= */'),
);
cek(
  'Why Marketing: pill "Confusion?" MERAH template (varian lokal PillMerahTemplate, LabelPill global tetap biru RRI) + heading + 4 manfaat (Higher Conversions DIHAPUS 2026-11-18)',
  marklo.includes('<PillMerahTemplate>Confusion?</PillMerahTemplate>') &&
    marklo.includes('border-[#ff4d2e]') &&
    marklo.includes('Why do you need Marketing?') &&
    dataMarklo.includes("judul: 'Increased Visibility'") &&
    dataMarklo.includes("judul: 'Targeted Audience'") &&
    dataMarklo.includes("judul: 'Cost-Effective Growth'") &&
    !dataMarklo.includes("judul: 'Higher Conversions'") &&
    dataMarklo.includes("judul: 'Competitive Advantage'") &&
    dataMarklo.includes("desk: 'Stand out from other business in your industry.'") &&
    !dataMarklo.includes("desk: 'Move faster than competitors still guessing what works.'") &&
    !dataMarklo.includes("desk: 'Landing pages, offers, and follow-ups tuned to turn clicks into customers.'"),
);
cek(
  'Why Marketing: tautan "View our case study" SAJA (tautan "Book a Call" hilang bersama kartu Higher Conversions)',
  !dataMarklo.includes("label: 'Book a Call'") &&
    dataMarklo.includes("label: 'View our case study'"),
);
cek(
  'Why Marketing: latar section PUTIH template (bukan slate-50) + 4 gradien pastel + ikon 3D (bukan kartu putih ber-ring)',
  mengapaMarklo.includes('<section className="bg-white py-16 sm:py-20">') &&
    !mengapaMarklo.includes('bg-slate-50') &&
    !mengapaMarklo.includes('ring-1 ring-slate-200') &&
    dataMarklo.includes("gradien: 'from-white to-pink-100'") &&
    dataMarklo.includes("gradien: 'from-white to-sky-100'") &&
    dataMarklo.includes("gradien: 'from-white to-blue-100'") &&
    dataMarklo.includes("gradien: 'from-white to-orange-100'") &&
    marklo.includes('IKON_MANFAAT[m.judul]') &&
    marklo.includes("from '../../lib/ikonManfaat'"),
);
cek(
  'Why Marketing: layout template 3 kartu atas + 1 kartu lebar bawah SELEBAR FULL (grid 6 kolom) + tautan hitam "View our case study" (tanpa kondisional warna merah lagi)',
  mengapaMarklo.includes('lg:grid-cols-6') &&
    mengapaMarklo.includes('lg:col-span-2') &&
    mengapaMarklo.includes('lg:col-span-6') &&
    !mengapaMarklo.includes('lg:col-span-3') &&
    !mengapaMarklo.includes("m.tautan.label === 'Book a Call'") &&
    !mengapaMarklo.includes("text-[#ff4d2e]") &&
    mengapaMarklo.includes('text-black'),
);
cek(
  'Why Marketing: kartu CTA hitam TETAP ADA sebagai strip full-width di bawah 4 kartu (teks + tombol tidak berubah)',
  mengapaMarklo.includes('Still not sure where to start?') &&
    mengapaMarklo.includes(
      'Book a free 30-minute call and we will audit your funnel together.',
    ) &&
    mengapaMarklo.includes('Book a Free Call') &&
    mengapaMarklo.includes('sm:flex-row sm:items-center sm:justify-between'),
);

// --- 12. Booking konsultasi. ---
// Substring kartu booking saja untuk asersi nama/logo kartu — komentar
// header berkas menyebut 'Marklo' (template), jadi pengecekan nama
// kartu harus dibatasi ke fungsi ini.
const bookingMarklo = marklo.slice(
  marklo.indexOf('function BookingKonsultasi('),
  marklo.indexOf('/* ================= Testimonials ================= */'),
);
cek(
  'Booking: pill "Free Consultation" + heading "Let\'s talk about growing your business"',
  marklo.includes('<LabelPill>Free Consultation</LabelPill>') &&
    marklo.includes("Let&apos;s talk about growing your business"),
);
cek(
  'Booking: kartu 3 kolom (host, kalender bulan berjalan, slot) + "30 Min Meeting" + video call',
  marklo.includes('30 Min Meeting') &&
    marklo.includes('Video call') &&
    marklo.includes('NAMA_BULAN') &&
    marklo.includes('Available times'),
);
cek(
  'Booking: pemilih zona waktu + toggle 12h/24h + tombol Next',
  marklo.includes('ZONA_WAKTU_MARKLO') &&
    marklo.includes('12h') &&
    marklo.includes('24h') &&
    marklo.includes(
      "disabled={tanggalDipilih === null || slotDipilih === null}",
    ),
);
cek(
  'Booking: zona waktu = 3 zona Indonesia — WIB Jakarta (UTC+7, Asia/Jakarta, 420), WITA Makassar (UTC+8, Asia/Makassar, 480), WIT Jayapura (UTC+9, Asia/Jayapura, 540); SGT/Singapore + UTC HILANG (keputusan pengguna 2026-11-19 14:45 WIB)',
  ZONA_WAKTU_MARKLO.length === 3 &&
    ZONA_WAKTU_MARKLO[0].id === 'Asia/Jakarta' &&
    ZONA_WAKTU_MARKLO[0].label === 'WIB — Jakarta (UTC+7)' &&
    ZONA_WAKTU_MARKLO[0].offsetMenit === 420 &&
    ZONA_WAKTU_MARKLO[1].id === 'Asia/Makassar' &&
    ZONA_WAKTU_MARKLO[1].label === 'WITA — Makassar (UTC+8)' &&
    ZONA_WAKTU_MARKLO[1].offsetMenit === 480 &&
    ZONA_WAKTU_MARKLO[2].id === 'Asia/Jayapura' &&
    ZONA_WAKTU_MARKLO[2].label === 'WIT — Jayapura (UTC+9)' &&
    ZONA_WAKTU_MARKLO[2].offsetMenit === 540 &&
    !dataMarklo.includes('Asia/Singapore') &&
    !dataMarklo.includes('SGT') &&
    !dataMarklo.includes("id: 'UTC'"),
);
cek(
  'Booking: default zona WIB (useState Asia/Jakarta) + geser slot basis WIB — WITA +60 mnt, WIT +120 mnt (zona.offsetMenit - 420)',
  marklo.includes("const [zonaId, setZonaId] = useState('Asia/Jakarta')") &&
    marklo.includes('const geserMenit = zona.offsetMenit - 420;') &&
    ZONA_WAKTU_MARKLO[1].offsetMenit - ZONA_WAKTU_MARKLO[0].offsetMenit ===
      60 &&
    ZONA_WAKTU_MARKLO[2].offsetMenit - ZONA_WAKTU_MARKLO[0].offsetMenit ===
      120,
);
cek(
  'Booking: Next membuka form singkat (bukan catatan pratinjau) — "Preview only" hilang',
  marklo.includes("onClick={() => setTahap('form')}") &&
    !marklo.includes('Preview only') &&
    !marklo.includes('not sent anywhere') &&
    !marklo.includes('catatanTampil'),
);
cek(
  'Booking: form singkat punya 5 field — Nama, Perusahaan (opsional), Kontak, Email, Topik (Email setelah Kontak)',
  marklo.includes('booking-nama') &&
    marklo.includes('booking-perusahaan') &&
    marklo.includes('booking-kontak') &&
    marklo.includes('booking-email') &&
    marklo.includes('booking-topik') &&
    marklo.includes('Nama *') &&
    marklo.includes('Kontak *') &&
    marklo.includes('Email *') &&
    marklo.includes('Topik *'),
);
cek(
  'Booking: validasi form — Nama, Kontak, Email, Topik wajib; Email format dasar; Perusahaan opsional',
  marklo.includes("galat.nama = 'Nama wajib diisi.'") &&
    marklo.includes("galat.kontak = 'Kontak wajib diisi.'") &&
    marklo.includes("galat.email = 'Email wajib diisi.'") &&
    marklo.includes("galat.email = 'Format email tidak valid.'") &&
    marklo.includes("galat.topik = 'Topik wajib diisi.'"),
);
cek(
  'Booking: submit memanggil onKirimBooking (prop App.tsx) + sukses/gagal jujur di kartu',
  marklo.includes('onKirimBooking: (input: BookingPublikInput) => Promise<string | null>') &&
    marklo.includes('const galatSimpan = await onKirimBooking({') &&
    marklo.includes('Permintaan terkirim') &&
    marklo.includes('setGalatKirim(galatSimpan)'),
);
cek(
  'Booking: kartu memakai gambar logo Deals (aset sama dengan header) + logo RRI — teks "Deals" polos / avatar "M" / "Marklo" hilang dari kartu',
  bookingMarklo.includes('src={LOGO_DEALS_DATA_URI}') &&
    bookingMarklo.includes('LOGO_RRI_LANDING_DATA_URI') &&
    !bookingMarklo.includes('>Deals<') &&
    !bookingMarklo.includes('>Marklo<') &&
    !bookingMarklo.includes('from-rose-400 to-orange-300'),
);

// Potongan data testimoni saja (PR #88): 'Marklo' masih ada di komentar,
// nama tipe/identifier, dan nama file di luar potongan ini — bukan teks UI.
// Cek kata 'Marklo' memakai batas kata (\b) supaya identifier
// 'TestimoniMarklo' di baris deklarasi tidak ikut terhitung.
const testimoni = dataMarklo.slice(
  dataMarklo.indexOf('export const TESTIMONI_MARKLO'),
  dataMarklo.indexOf('export interface FaqMarklo'),
);

// --- 13. Testimonials. ---
cek(
  'Testimonials: ribbon "#1 Radio with the Widest Network in Indonesia" + pill + heading (teks lama hilang)',
  marklo.includes('#1 Radio with the Widest Network in Indonesia') &&
    !marklo.includes('#1 Marketing Agency 2025 Award Winner') &&
    marklo.includes('<LabelPill>Testimonial</LabelPill>') &&
    marklo.includes("Why everyone&apos;s talking about our service"),
);
cek(
  'Testimonials: 6 kartu + 1 unggulan merah (Siti Rahmawati/CEO Beskon)',
  dataMarklo.includes("nama: 'Budi Santoso'") &&
    dataMarklo.includes("nama: 'Siti Rahmawati'") &&
    dataMarklo.includes('unggulan: true') &&
    marklo.includes('bg-mk-aksen p-7 text-white'),
);
cek(
  'Testimonials: kata "Marklo" hilang, nama Indonesia baru ada, nama lama hilang (PR #88)',
  !/\bMarklo\b/.test(testimoni) &&
    testimoni.includes("nama: 'Budi Santoso'") &&
    testimoni.includes("nama: 'Agus Wijaya'") &&
    testimoni.includes("nama: 'Rizky Pratama'") &&
    testimoni.includes("nama: 'Dewi Lestari'") &&
    testimoni.includes("nama: 'Maya Kusuma'") &&
    testimoni.includes("nama: 'Andi Firmansyah'") &&
    testimoni.includes("nama: 'Siti Rahmawati'") &&
    testimoni.includes("inisial: 'BS'") &&
    testimoni.includes("inisial: 'AW'") &&
    testimoni.includes("inisial: 'RP'") &&
    testimoni.includes("inisial: 'MK'") &&
    testimoni.includes("inisial: 'AF'") &&
    testimoni.includes("inisial: 'SR'") &&
    testimoni.includes('RRI rebuilt our funnel from scratch') &&
    testimoni.includes('We tried three agencies before RRI.') &&
    testimoni.includes('RRI is the growth partner we had been looking for.') &&
    !testimoni.includes("nama: 'Gabriel Ross'") &&
    !testimoni.includes("nama: 'Samuel M'") &&
    !testimoni.includes("nama: 'Pranav K'") &&
    !testimoni.includes("nama: 'David L'") &&
    !testimoni.includes("nama: 'Ethan W'") &&
    !testimoni.includes("nama: 'James R'") &&
    !testimoni.includes("nama: 'Daniel Lee'"),
);

// --- 14. FAQ. ---
cek(
  'FAQ: pill "FAQ" + heading "No more confusion - just answers" + 5 pertanyaan',
  marklo.includes('<LabelPill>FAQ</LabelPill>') &&
    marklo.includes('No more confusion - just answers') &&
    dataMarklo.includes("q: 'What services do you offer?'") &&
    dataMarklo.includes("q: 'How do you measure success?'"),
);
cek(
  'FAQ: accordion (state terbuka) + pertanyaan terbuka jadi kartu merah teks putih',
  marklo.includes('const [terbuka, setTerbuka] = useState(0)') &&
    marklo.includes("bg-mk-aksen text-white' : 'bg-white text-black"),
);
cek(
  'FAQ: jawaban hasil 2–4 minggu + leads/CPA/conversion rate',
  dataMarklo.includes('2–4 weeks') &&
    dataMarklo.includes('cost per acquisition'),
);
cek(
  'FAQ: jawaban layanan = 4 layanan RRI; daftar lama (Meta/Google/TikTok/SEO) hilang',
  dataMarklo.includes(
    'Radio Ads, Social Media Ads, Digital Platform Ads, and Dialogue & Podcast',
  ) &&
    !dataMarklo.includes('Meta Ads, Google Ads, viral TikTok Ads') &&
    !dataMarklo.includes('SEO and content compound'),
);

// --- 15. Footer gelap. ---
// Substring footer saja untuk asersi urutan kolom.
const footerMarklo = marklo.slice(
  marklo.indexOf('/* ================= Footer ================= */'),
);
cek(
  'Footer: gradien navy RRI (#0D2569) ke navy gelap + tepi atas bergelombang (SVG) — maroon hilang',
  marklo.includes('from-[#0D2569] to-[#04122e]') &&
    marklo.includes('viewBox="0 0 1440 70"') &&
    !marklo.includes('#3a0d0d'),
);
cek(
  'Footer: Back to top + Site Map + Socials + Contact + "Book 30 Min Free Call" (tanpa mark bunga; "Navigation" sudah hilang)',
  marklo.includes('Back to top') &&
    marklo.includes('Site Map') &&
    !footerMarklo.includes('Navigation') &&
    marklo.includes('Socials') &&
    marklo.includes('Contact') &&
    marklo.includes('Book 30 Min Free Call'),
);
cek(
  'Footer: mark bunga 4 kelopak pink SUDAH DIHAPUS (tidak ada kelopak / warna pink pucat di Marklo.tsx)',
  !marklo.includes('kelopak') && !marklo.includes('#f6d9e8'),
);
cek(
  'Footer: Socials memakai tautan RESMI RRI (LinkedIn, Facebook, Instagram) dibuka di tab baru — bukan sample template',
  marklo.includes('https://www.linkedin.com/company/6777005/') &&
    marklo.includes('https://www.facebook.com/p/Radio-Republik-Indonesia-100079994898112') &&
    marklo.includes('https://www.instagram.com/rri_official/') &&
    marklo.includes('target="_blank"') &&
    marklo.includes('rel="noopener noreferrer"') &&
    !marklo.includes("href=\"#atas\""),
);
cek(
  'Footer: logo RRI + Deals putih (filter brightness(0) invert(1) di kedua img footer; logo header tanpa filter)',
  (marklo.match(/\[filter:brightness\(0\)_invert\(1\)\]/g) || []).length === 2 &&
    marklo.includes('className="h-9 w-auto shrink-0"'),
);
cek(
  'Footer: urutan kolom "Site Map" < "What to Do" < Contact — kolom "Client Portal" DIHAPUS, "Additional Service" kembali jadi "Our Service" lalu judul diubah jadi "What to Do" (perintah user 2026-11-21 17:57 + 18:27 WIB); isi tiap kolom berurutan + "Book a Free Call" hilang dari footer',
  footerMarklo.indexOf('Site Map') < footerMarklo.indexOf('What to Do') &&
    footerMarklo.indexOf('What to Do') < footerMarklo.indexOf('Jl. Medan Merdeka Barat') &&
    !footerMarklo.includes('Client Portal') &&
    !footerMarklo.includes('Additional Service') &&
    !footerMarklo.includes('Navigation') &&
    !footerMarklo.includes('Book a Free Call') &&
    (() => {
      const peta = footerMarklo.slice(
        footerMarklo.indexOf('Site Map'),
        footerMarklo.indexOf('What to Do'),
      );
      return (
        peta.indexOf('About') < peta.indexOf('Service') &&
        peta.indexOf('Service') < peta.indexOf('Testimonials') &&
        peta.indexOf('Testimonials') < peta.indexOf('Process') &&
        !peta.includes('Book a Free Call')
      );
    })() &&
    (() => {
      const layanan = footerMarklo.slice(
        footerMarklo.indexOf('What to Do'),
        footerMarklo.indexOf('Jl. Medan Merdeka Barat'),
      );
      return (
        layanan.indexOf('Plan a Campaign') < layanan.indexOf('Book a Venue') &&
        layanan.indexOf('Book a Venue') < layanan.indexOf('Rent a Space') &&
        layanan.indexOf('Rent a Space') < layanan.indexOf('Join our Event') &&
        !layanan.includes('Collaborate with Us') &&
        !layanan.includes('Invite as Media Partner') &&
        !layanan.includes('Support our Event') &&
        !layanan.includes('Track your Deal')
      );
    })(),
);
cek(
  'Footer: pill "Partner with RRI" (biru RRI + ikon Handshake) di sebelah "Back to top" di kolom brand, membuka halaman "Partner with RRI" (perintah user 2026-11-21 16:20 WIB, contoh Traveloka; tujuan dipindah dari Plan a Campaign ke halaman baru 2026-11-21)',
  footerMarklo.includes('Partner with RRI') &&
    footerMarklo.includes('Handshake') &&
    footerMarklo.includes('bg-[#2573e2]') &&
    footerMarklo.includes('onClick={onPartnerWithRri}') &&
    footerMarklo.indexOf('<ArrowUp') < footerMarklo.indexOf('<Handshake') &&
    marklo.includes('Handshake,'),
);
cek(
  'Footer: "Track your Deal" + kolom "Client Portal" DIHAPUS (perintah user 2026-11-21 17:57 WIB) — footer tanpa onLacak; halaman Lacak TETAP ada di App.tsx (state lacak + modul Lacak), hanya tanpa tombol masuk dari landing',
  !footerMarklo.includes('Track your Deal') &&
    !footerMarklo.includes('Client Portal') &&
    !footerMarklo.includes('onLacak') &&
    !marklo.includes('onLacak: () => void') &&
    !marklo.includes('onLacak={onLacak}') &&
    app.includes("'beranda' | 'login' | 'lacak' | 'ajukan'") &&
    app.includes("halamanPublik === 'lacak'") &&
    app.includes('<Lacak'),
);
cek(
  'Footer: "Plan a Campaign" (item PERTAMA "What to Do", pindah dari Client Portal 2026-11-21) membuka halaman Plan a Campaign via prop onPlanCampaign — BUKAN gulirKe booking (permintaan pengguna 2026-11-19 08:33 WIB)',
  marklo.includes('onPlanCampaign: () => void') &&
    marklo.includes('onPartnerWithRri: () => void') &&
    marklo.includes('<Footer onComingSoon={onComingSoon} onPlanCampaign={onPlanCampaign} onPartnerWithRri={onPartnerWithRri} onBookVenue={onBookVenue} onRentSpace={onRentSpace} />') &&
    marklo.includes('function Footer({ onComingSoon, onPlanCampaign, onPartnerWithRri, onBookVenue, onRentSpace }') &&
    footerMarklo.includes("label: 'Plan a Campaign'") &&
    footerMarklo.includes('onClick: onPlanCampaign') &&
    !footerMarklo.includes("aksi: 'plan-campaign'") &&
    !footerMarklo.includes("aksi: 'booking'") &&
    app.includes("onPlanCampaign={() => setHalamanPublik('plan-campaign')}") &&
    app.includes("halamanPublik === 'plan-campaign'"),
);
cek(
  'PlanCampaign: halaman publik embed form Tally "Plan a Campaign" (id ArpNAN) — iframe + script widget + Tally.loadEmbeds() (pola React docs Tally); gaya login page (kolom 400px, #f5f2f2, lockup RRI, "Back to Landing Page"); judul sendiri karena hideTitle=1',
  planCampaign.includes('https://tally.so/embed/ArpNAN?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1') &&
    planCampaign.includes('data-tally-src') &&
    planCampaign.includes('https://tally.so/widgets/embed.js') &&
    planCampaign.includes('Tally.loadEmbeds()') &&
    planCampaign.includes('useEffect') &&
    planCampaign.includes("querySelectorAll('iframe[data-tally-src]:not([src])')") &&
    planCampaign.includes('export default function PlanCampaign') &&
    planCampaign.includes('max-w-[400px]') &&
    planCampaign.includes('bg-[#f5f2f2]') &&
    planCampaign.includes('LOGO_RRI_LOCKUP_DATA_URI') &&
    planCampaign.includes('Back to Landing Page') &&
    planCampaign.includes('Plan a Campaign'),
);
cek(
  'Footer: empat item "What to Do" (Plan a Campaign pertama, Book a Venue, Rent a Space, Join our Event) — tiga pertama membuka halaman aslinya via prop; "Join our Event" (dulu "Support our Event") tetap "Coming Soon" via onComingSoon; "Collaborate with Us" dan "Invite as Media Partner" DIHAPUS (perintah user 2026-11-21 16:17 WIB; halaman Coming Soon gaya login page, TANPA logo; permintaan pengguna 2026-11-18 21:19–21:21 WIB); item pelatihan DIHAPUS (perintah user 2026-11-22)',
  marklo.includes('onComingSoon: () => void') &&
    marklo.includes('<Footer onComingSoon={onComingSoon} onPlanCampaign={onPlanCampaign} onPartnerWithRri={onPartnerWithRri} onBookVenue={onBookVenue} onRentSpace={onRentSpace} />') &&
    marklo.includes('function Footer({ onComingSoon, onPlanCampaign, onPartnerWithRri, onBookVenue, onRentSpace }') &&
    footerMarklo.includes("label: 'Plan a Campaign'") &&
    footerMarklo.includes('onClick: onPlanCampaign') &&
    footerMarklo.includes("label: 'Join our Event'") &&
    footerMarklo.includes("label: 'Book a Venue'") &&
    footerMarklo.includes('onClick: onBookVenue') &&
    footerMarklo.includes("label: 'Rent a Space'") &&
    footerMarklo.includes('onClick: onRentSpace') &&
    footerMarklo.includes('onClick: onComingSoon') &&
    !footerMarklo.includes('Collaborate with Us') &&
    !footerMarklo.includes('Invite as Media Partner') &&
    !footerMarklo.includes('Support our Event') &&
    !footerMarklo.includes('Improve your Skill') &&
    !footerMarklo.includes('Learning Centre') &&
    !footerMarklo
      .slice(
        footerMarklo.indexOf('What to Do'),
        footerMarklo.indexOf('Jl. Medan Merdeka Barat'),
      )
      .includes('gulirKe') &&
    app.includes("'coming-soon'") &&
    app.includes("onComingSoon={() => setHalamanPublik('coming-soon')}") &&
    app.includes('<ComingSoon') &&
    app.includes("halamanPublik === 'coming-soon'") &&
    comingSoon.includes('Coming Soon') &&
    comingSoon.includes('max-w-[400px]') &&
    comingSoon.includes('bg-[#f5f2f2]') &&
    comingSoon.includes('Back to Landing Page') &&
    !comingSoon.includes('logoRriLockup') &&
    !comingSoon.includes('logo-rri.svg') &&
    !comingSoon.includes('LOGO_') &&
    !comingSoon.includes('<img'),
);
cek(
  'Footer: kontak RESMI Kantor Pusat RRI (alamat Jl. Medan Merdeka Barat, dua nomor telepon tel:, tanpa email sample)',
  marklo.includes('Jl. Medan Merdeka Barat No. 4–5, Jakarta Pusat, DKI Jakarta 10110') &&
    marklo.includes('tel:+62213500584') &&
    marklo.includes('+62 21 350 0584') &&
    marklo.includes('tel:+62213511086') &&
    marklo.includes('+62 21 351 1086') &&
    !marklo.includes('contoh@rri.go.id') &&
    marklo.includes('08:00–16:00 WIB') &&
    marklo.includes('© 2026 LPP RRI. All rights reserved.'),
);

// --- 16. Motion "hidup" (CSS + hook). ---
cek(
  'Motion: Reveal memakai IntersectionObserver (blur + fade-in)',
  marklo.includes('new IntersectionObserver') &&
    marklo.includes('mk-reveal') &&
    marklo.includes('mk-tampil'),
);
cek(
  'Motion: counter memakai requestAnimationFrame (useCountUp)',
  marklo.includes('requestAnimationFrame') &&
    marklo.includes('useCountUp'),
);
cek(
  'Motion: index.css punya .mk-reveal/.mk-tampil + keyframes marquee + prefers-reduced-motion',
  css.includes('.mk-reveal') &&
    css.includes('.mk-reveal.mk-tampil') &&
    css.includes('@keyframes mk-marquee') &&
    css.includes('.mk-marquee') &&
    css.includes('prefers-reduced-motion'),
);
cek(
  'Motion: token aksen biru RRI di @theme index.css (PR oren-ke-biru)',
  css.includes('--color-mk-aksen: #2573e2;') &&
    css.includes('--color-mk-aksen-gelap: #0d2569;') &&
    css.includes('--color-mk-peach: #e8f1fe;') &&
    !css.includes('#ff4d2e') &&
    !css.includes('#e63e20') &&
    !css.includes('#ffede8'),
);
// Merah template #ff4d2e hanya boleh ada di section Why (komentar +
// komponen PillMerahTemplate di MengapaMarketing) — tautan "Book a Call"
// merah SUDAH HILANG sejak kartu "Higher Conversions" dihapus
// 2026-11-18 20:21 WIB; di luar blok itu, larangan oren PR oren-ke-biru
// tetap berlaku.
const luarWhyMarklo =
  marklo.slice(0, marklo.indexOf('/* ================= Why Marketing ================= */')) +
  marklo.slice(
    marklo.indexOf('/* ================= Booking konsultasi ================= */'),
  );
cek(
  'Oren-ke-biru: tidak ada lagi warna oren di landing KECUALI section Why (pill MERAH template #ff4d2e SAJA sejak "Book a Call" hilang 2026-11-18 20:21 WIB, PR landing-why-marketing-template) — aksen Biru RRI, hover navy, peach biru muda, gradasi avatar biru/sky, ring + ikon cek biru; merah error booking tetap ada (PR oren-ke-biru)',
  !luarWhyMarklo.includes('#ff4d2e') &&
    !marklo.includes('ring-orange-100') &&
    !marklo.includes('bg-pink-100') &&
    !marklo.includes('text-red-400') &&
    !marklo.includes('from-rose-400 to-orange-300') &&
    !marklo.includes('bg-rose-400') &&
    !dataMarklo.includes('from-rose-100 to-pink-50') &&
    !dataMarklo.includes('from-rose-200 to-orange-100') &&
    !dataMarklo.includes('from-amber-200 to-yellow-100') &&
    !dataMarklo.includes('from-orange-400 to-rose-400') &&
    marklo.includes('ring-blue-100') &&
    marklo.includes('bg-blue-100') &&
    marklo.includes("i === 0 ? 'text-[#2573e2]' : 'text-slate-400'") &&
    marklo.includes('from-blue-400 to-sky-300') &&
    marklo.includes('bg-blue-400') &&
    dataMarklo.includes("gradien: 'from-blue-100 to-sky-50'") &&
    dataMarklo.includes("gradien: 'from-blue-200 to-sky-100'") &&
    dataMarklo.includes("gradien: 'from-sky-200 to-blue-100'") &&
    dataMarklo.includes("gradien: 'from-blue-400 to-sky-400'") &&
    marklo.includes('bg-red-50') &&
    marklo.includes('text-red-800') &&
    marklo.includes('ring-red-200') &&
    marklo.includes('text-red-600'),
);
cek(
  'Motion: hover states di kartu/tombol (hover:-translate-y-1 / hover:bg-mk-aksen-gelap)',
  marklo.includes('hover:-translate-y-1') &&
    marklo.includes('hover:bg-mk-aksen-gelap'),
);

// --- 17. Yang DIPARKIR: tidak ada di landing baru. ---
cek(
  'Parkir: landing baru TIDAK import Lacak/Ajukan/landingI18n/satker/Beranda',
  !marklo.includes("from './Lacak'") &&
    !marklo.includes("from './Ajukan'") &&
    !marklo.includes('landingI18n') &&
    !marklo.includes('DAFTAR_SATKER') &&
    !marklo.includes("from '../Beranda'"),
);
cek(
  'Parkir: landing baru TIDAK punya toggle bahasa / statistik live',
  !marklo.includes('rri-bahasa-landing') &&
    !marklo.includes('jumlahSatker') &&
    !marklo.includes('jumlahKlien') &&
    !marklo.includes('jumlahKontrak'),
);
cek(
  'Parkir: TIDAK ada section harga (pricing)',
  !/pricing|harga paket|price/i.test(marklo),
);

// --- 18. Jujur: sample + tanpa hotlink eksternal. ---
cek(
  'Jujur: kampanye dinyatakan NYATA RRI, sisa data tetap SAMPLE/template bukan data RRI',
  dataMarklo.includes('KAMPANYE NYATA RRI') &&
    dataMarklo.includes('BUKAN data RRI') &&
    !dataMarklo.includes('CONTOH (SAMPLE)'),
);
cek(
  'Sample: komponen menyatakan penyesuaian RRI diparkir',
  marklo.includes('DIPARKIR') && marklo.includes('penyesuaian RRI'),
);
cek(
  'Gambar: TIDAK ada hotlink gambar eksternal — https:// di Marklo.tsx hanya 3 tautan medsos resmi RRI',
  (marklo.match(/https:\/\//g) || []).length === 3 &&
    marklo.includes('https://www.linkedin.com/company/6777005/') &&
    marklo.includes('https://www.facebook.com/p/Radio-Republik-Indonesia-100079994898112') &&
    marklo.includes('https://www.instagram.com/rri_official/'),
);
cek(
  'Gambar: visual kartu kampanye memakai foto data URI (PR #95) — bukan <img> eksternal',
  marklo.includes('src={FOTO_KAMPANYE[k.klien]}') && !marklo.includes('<img src="http'),
);

// --- 19. Revert PR #78 + booking → Meeting (koreksi pengguna 2026-11-17). ---
cek(
  'Revert78: App.tsx TIDAK lagi punya wiring tujuan-setelah-login (onBookMeeting / sessionStorage)',
  !app.includes('onBookMeeting') &&
    !app.includes('bukaMeetingDariLanding') &&
    !app.includes('rri-tujuan-setelah-login') &&
    !app.includes('KUNCI_TUJUAN_SETELAH_LOGIN'),
);
cek(
  'Revert78: MarkloLanding TIDAK lagi mendeklarasikan/meneruskan prop onBookMeeting',
  !marklo.includes('onBookMeeting') &&
    !marklo.includes('onClick={onBookMeeting}'),
);
cek(
  'Revert78: 5 tombol menggulir ke booking — 3× "Book a Free Call" (header, hero, kartu gelap) + "Book a Free Consultation" + "Book 30 Min Free Call"',
  (marklo.match(/onClick=\{\(\) => gulirKe\('booking'\)\}/g) || []).length === 5 &&
    marklo.includes('Book a Free Call') &&
    marklo.includes('Book a Free Consultation') &&
    marklo.includes('Book 30 Min Free Call'),
);
cek(
  'Revert78: footer SUDAH TIDAK punya tautan "Book a Free Call" (dihapus dari Site Map + Client Portal atas permintaan pengguna 2026-11-18; kolom Client Portal sendiri dihapus 2026-11-21; tombol booking di header/hero/kartu gelap tetap ada)',
  !footerMarklo.includes('Book a Free Call') &&
    marklo.includes('Book a Free Call'),
);
cek(
  'BookingSubmit: App.tsx kirimBookingPublik menyimpan Meeting (MTG-, SATKER_PILOT, Nama → Contact Person/Rep, Email → contactPersonEmail, RRI Rep kosong)',
  app.includes('const kirimBookingPublik = async (') &&
    app.includes("idBerikutnya('MTG-', data.meeting.map((m) => m.id))") &&
    app.includes('satker: SATKER_PILOT') &&
    app.includes('clientRepresentatives: [input.nama.trim()]') &&
    app.includes('contactPersonEmail: input.email.trim()') &&
    app.includes('rriRepresentatives: []'),
);
cek(
  'BookingSubmit: App.tsx menulis ke Firestore via kirimBookingPublikKeFirestore + error jujur bila gagal',
  app.includes('kirimBookingPublik as kirimBookingPublikKeFirestore') &&
    app.includes('await kirimBookingPublikKeFirestore(db, meeting)') &&
    app.includes('Gagal menyimpan permintaan booking ke Firestore'),
);
cek(
  'BookingSubmit: firestoreStore kirimBookingPublik setDoc ke KOLEKSI.meeting',
  firestoreStore.includes('export async function kirimBookingPublik(') &&
    firestoreStore.includes('doc(db, KOLEKSI.meeting, meeting.id)'),
);
cek(
  'BookingRules: firestore.rules mengizinkan create publik tervalidasi ke /meeting/{id} (tanpa read/update/delete publik) — email wajib + format',
  rules.includes('match /meeting/{id}') &&
    rules.includes('allow create: if request.auth == null') &&
    rules.includes("request.resource.data.satker.kode == '41'") &&
    rules.includes('contactPersonEmail') &&
    rules.includes("!('googleEventId' in request.resource.data)"),
);

cek(
  'Landing: scroll ke atas saat mount (kembali dari halaman publik yang di-scroll tidak mendarat di tengah — user 2026-11-21 13:18 WIB)',
  marklo.includes('window.scrollTo({ top: 0 })'),
);

if (gagal > 0) {
  console.log(`\n${gagal} asersi GAGAL`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');

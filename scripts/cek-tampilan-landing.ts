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
//   statistik live, dua bahasa, palet RRI — tidak ada di landing baru.
//   KECUALI footer: gradien navy RRI + logo putih + kolom "Our Service"
//   + header seamless, atas permintaan eksplisit pengguna 2026-11-17
//   (PR landing-footer-navy-putih; judul kolom diubah jadi "Our Service"
//   dan isinya 4 layanan pada PR landing-booking-ke-meeting).
// - Jujur: nama/klien/testimoni/angka adalah SAMPLE template
//   (dinyatakan di data + PR body); tidak ada hotlink gambar eksternal.
//   KECUALI strip logo di bawah Comparison: 10 logo mitra nyata RRI
//   yang diunggah pengguna (PR #81), di-embed sebagai data URI di
//   src/lib/logoMitra.ts, tampil slate redup (grayscale + opacity)
//   seperti screenshot referensi pengguna.
// - Tombol "Book a Free Call" menggulir ke kartu booking — perilaku
//   PR #78 (membuka halaman Meeting) DI-REVERT atas koreksi pengguna
//   2026-11-17 (PR landing-booking-ke-meeting). Kartu booking NYATA:
//   Next membuka form singkat (Nama, Perusahaan opsional, Kontak,
//   Topik); submit menyimpan permintaan sebagai Meeting di Firestore.
// - Teks social proof hero: "TRUSTED BY 100+ PARTNERS NATIONALLY"
//   (avatar, bintang, 4.9/5.0 tidak berubah; teks lama tidak tersisa).
// Skrip ini membaca berkas sebagai teks. Keluar bukan-nol bila ada
// asersi gagal.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Dijalankan dari root repo (pola skrip cek lain).
const baca = (relatif: string) =>
  readFileSync(join(process.cwd(), relatif), 'utf8');
const app = baca('src/App.tsx');
const marklo = baca('src/modules/landing/Marklo.tsx');
const dataMarklo = baca('src/lib/landingMarklo.ts');
const logoMitra = baca('src/lib/logoMitra.ts');
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
  "App.tsx: beranda me-render <MarkloLanding onLogin + onKirimBooking />",
  app.includes('<MarkloLanding') &&
    app.includes("onLogin={() => setHalamanPublik('login')}") &&
    app.includes('onKirimBooking={kirimBookingPublik}'),
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
  'Header: tombol Book a Free Call + Login (onLogin)',
  marklo.includes('Book a Free Call') && marklo.includes('onClick={onLogin}'),
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
  'Carousel: section id="work" + 7 kampanye nyata RRI (PLN, Taspen, Alfamart, Medco, Bank Indonesia, PIM, BNN Sumsel) — template hilang',
  marklo.includes('id="work"') &&
    dataMarklo.includes("klien: 'PLN'") &&
    dataMarklo.includes("klien: 'Taspen'") &&
    dataMarklo.includes("klien: 'Alfamart'") &&
    dataMarklo.includes("klien: 'Medco'") &&
    dataMarklo.includes("klien: 'Bank Indonesia'") &&
    dataMarklo.includes("klien: 'Perempuan Indonesia Maju (PIM)'") &&
    dataMarklo.includes("klien: 'BNN Sumsel'") &&
    !dataMarklo.includes("klien: 'RingID'") &&
    !dataMarklo.includes("klien: 'Beskon Music'") &&
    !dataMarklo.includes("klien: 'Boutique'") &&
    !dataMarklo.includes("klien: 'Reviro'"),
);
cek(
  'Carousel: judul kampanye asli (Bahasa Indonesia) di ketujuh kartu',
  dataMarklo.includes('Spot Iklan Edukasi Bahaya & Manfaat Listrik') &&
    dataMarklo.includes('Adlibs Waspada Penipuan Mengatasnamakan PT Taspen') &&
    dataMarklo.includes('Promosi Alfamart') &&
    dataMarklo.includes('Goes to Campus "Ngobrol Seputar Gas: Integritas dalam Industri Hulu Migas"') &&
    dataMarklo.includes('Event Digital Kito Galo 7th X Gemilang Palembang Raya 2026') &&
    dataMarklo.includes('Parade Kebaya Songket: Pesona Perempuan Indonesia') &&
    dataMarklo.includes('Re-Link (Rehabilitasi Keliling) & Pindang (Pelayanan Aplikasi)'),
);
cek(
  'Carousel: layanan English (Radio Spot, Adlibs, Promotion, Adlibs & Interactive Dialogue, Interactive Dialogue)',
  dataMarklo.includes("layanan: 'Radio Spot'") &&
    dataMarklo.includes("layanan: 'Adlibs'") &&
    dataMarklo.includes("layanan: 'Promotion'") &&
    dataMarklo.includes("layanan: 'Adlibs & Interactive Dialogue'") &&
    dataMarklo.includes("layanan: 'Interactive Dialogue'"),
);
cek(
  'Carousel: tombol prev/next + auto-advance 5 detik (jeda saat hover/fokus)',
  marklo.includes('Previous campaign') &&
    marklo.includes('Next campaign') &&
    marklo.includes('setInterval(() => gulirKartu(1), 5000)') &&
    marklo.includes('snap-x snap-mandatory'),
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
  'Statistik: 4 item (Projects Delivered, Happy Clients, Satisfaction, Growth 35X)',
  dataMarklo.includes("label: 'Projects Delivered'") &&
    dataMarklo.includes("label: 'Happy Clients'") &&
    dataMarklo.includes("label: 'Client Satisfaction'") &&
    dataMarklo.includes("label: 'Client Growth Result'"),
);
cek(
  'Statistik: "Our Clients in 35+ Countries" + bendera negara',
  marklo.includes('Our Clients in 35+ Countries') &&
    dataMarklo.includes("bendera: '🇺🇸'"),
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

// --- 9. Services (tangga funnel). ---
cek(
  'Services: pill "Services" + heading funnel + 4 tahap (Attract/Engage/Convert/Retain)',
  marklo.includes('<LabelPill>Services</LabelPill>') &&
    marklo.includes('Funnel-focused marketing for predictable, lasting growth.') &&
    dataMarklo.includes("tahap: 'Attract Customer'") &&
    dataMarklo.includes("tahap: 'Engage Prospect'") &&
    dataMarklo.includes("tahap: 'Convert Clients'") &&
    dataMarklo.includes("tahap: 'Retain Clients'"),
);
cek(
  'Services: kartu Meta Ads, Google Ads, Viral TikTok Ads, Content Marketing + "35X Client Growth"',
  dataMarklo.includes("layanan: 'Viral TikTok Ads'") &&
    marklo.includes('35X') &&
    marklo.includes('Client Growth'),
);
cek(
  'Services: susunan tangga diagonal + garis penghubung putus-putus vertikal',
  marklo.includes('OFFSET_FUNNEL') &&
    marklo.includes('border-l-2 border-dashed'),
);

// --- 10. Comparison. ---
cek(
  'Comparison: pill "Comparison" + heading + Other Agencies vs Our Agency',
  marklo.includes('<LabelPill>Comparison</LabelPill>') &&
    marklo.includes('But, why would you want to work with us?') &&
    marklo.includes('Other Agencies') &&
    marklo.includes('Our Agency'),
);
cek(
  'Comparison: X merah (lain) + ceklis merah (kami), 5 butir masing-masing',
  dataMarklo.includes('Generic copy-paste strategies') &&
    dataMarklo.includes('Custom campaigns built on your data') &&
    marklo.includes('bg-pink-100') &&
    marklo.includes('bg-mk-peach'),
);
cek(
  'Comparison: strip logo = 10 logo mitra nyata RRI (marquee, gambar <img>)',
  ['Taspen', 'Bank Sumsel Babel', 'PLN', 'Alfamart', 'MedcoEnergi', 'Bea Cukai', 'Bank Indonesia', 'BNN', 'DJP', 'Komdigi'].every((nama) =>
    logoMitra.includes(`nama: '${nama}'`),
  ) &&
    logoMitra.includes('data:image/webp;base64,') &&
    marklo.includes('mk-marquee') &&
    marklo.includes('<img') &&
    marklo.includes('logo.logoDataUri') &&
    marklo.includes('grayscale') &&
    marklo.includes('opacity-60'),
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
    dataMarklo.includes('How can multi-platform marketing help my business?'),
);

// --- 11. Why Marketing. ---
cek(
  'Why Marketing: pill "Confusion?" + heading + 5 manfaat',
  marklo.includes('<LabelPill>Confusion?</LabelPill>') &&
    marklo.includes('Why do you need Marketing?') &&
    dataMarklo.includes("judul: 'Increased Visibility'") &&
    dataMarklo.includes("judul: 'Targeted Audience'") &&
    dataMarklo.includes("judul: 'Cost-Effective Growth'") &&
    dataMarklo.includes("judul: 'Higher Conversions'") &&
    dataMarklo.includes("judul: 'Competitive Advantage'"),
);
cek(
  'Why Marketing: link "Book a Call" + "View our case study"',
  dataMarklo.includes("label: 'Book a Call'") &&
    dataMarklo.includes("label: 'View our case study'"),
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

// --- 13. Testimonials. ---
cek(
  'Testimonials: ribbon "#1 Radio with the Widest Network in Indonesia" + pill + heading (teks lama hilang)',
  marklo.includes('#1 Radio with the Widest Network in Indonesia') &&
    !marklo.includes('#1 Marketing Agency 2025 Award Winner') &&
    marklo.includes('<LabelPill>Testimonial</LabelPill>') &&
    marklo.includes("Why everyone&apos;s talking about our service"),
);
cek(
  'Testimonials: 6 kartu + 1 unggulan merah (Daniel Lee/CEO Beskon)',
  dataMarklo.includes("nama: 'Gabriel Ross'") &&
    dataMarklo.includes("nama: 'Daniel Lee'") &&
    dataMarklo.includes('unggulan: true') &&
    marklo.includes('bg-mk-aksen p-7 text-white'),
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
  'Footer: Back to top + Navigation + Socials + Contact + "Book 30 Min Free Call" (tanpa mark bunga)',
  marklo.includes('Back to top') &&
    marklo.includes('Navigation') &&
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
  'Footer: kolom "Our Service" di antara Navigation dan Contact — 4 layanan berurutan ke booking (judul + isi lama hilang)',
  footerMarklo.indexOf('Navigation') < footerMarklo.indexOf('Our Service') &&
    footerMarklo.indexOf('Our Service') < footerMarklo.indexOf('Jl. Medan Merdeka Barat') &&
    footerMarklo.indexOf('Plan a Campaign') < footerMarklo.indexOf('Book a Venue') &&
    footerMarklo.indexOf('Book a Venue') < footerMarklo.indexOf('Rent a Space') &&
    footerMarklo.indexOf('Rent a Space') < footerMarklo.indexOf('Get a Journalism Training') &&
    !footerMarklo.includes('Additional Service') &&
    !footerMarklo.includes('Book a Room'),
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
  'Motion: token aksen vermilion di @theme index.css',
  css.includes('--color-mk-aksen: #ff4d2e;') &&
    css.includes('--color-mk-peach: #ffede8;'),
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
  'Gambar: visual kartu memakai gradien CSS + inisial (bukan <img> eksternal)',
  marklo.includes('bg-gradient-to-br') && !marklo.includes('<img src="http'),
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
  'Revert78: tautan navigasi footer "Book a Free Call" tetap menggulir ke section booking',
  marklo.includes("{ label: 'Book a Free Call', id: 'booking' }"),
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

if (gagal > 0) {
  console.log(`\n${gagal} asersi GAGAL`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');

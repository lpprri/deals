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
//   KECUALI footer: gradien navy RRI + logo putih + kolom "Additional
//   Service" + header seamless, atas permintaan eksplisit pengguna
//   2026-11-17 (PR landing-footer-navy-putih). PR ini JUGA me-revert
//   PR #75: ukuran landing kembali ke PR #74 karena pengguna menilai
//   ukuran PR #75 kebesaran di zoom 100%.
// - Jujur: nama/klien/testimoni/angka adalah SAMPLE template
//   (dinyatakan di data + PR body); booking Next hanya pratinjau,
//   tidak ada pemesanan yang terkirim; tidak ada hotlink gambar
//   eksternal.
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
const css = baca('src/index.css');
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
  "App.tsx: beranda me-render <MarkloLanding onLogin={...login} />",
  app.includes('<MarkloLanding onLogin={() => setHalamanPublik(\'login\')} />'),
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
  'Hero: social proof bintang 5 + rating 4.9 + "TRUSTED BY 500+ BRANDS GLOBALLY"',
  marklo.includes('TRUSTED BY 500+ BRANDS GLOBALLY') &&
    marklo.includes('useCountUp(4.9') &&
    marklo.includes('BintangLima'),
);

// --- 5. Carousel kampanye. ---
cek(
  'Carousel: section id="work" + 4 kampanye template (RingID, Beskon, Boutique, Reviro)',
  marklo.includes('id="work"') &&
    dataMarklo.includes("klien: 'RingID'") &&
    dataMarklo.includes("klien: 'Beskon Music'") &&
    dataMarklo.includes("klien: 'Boutique'") &&
    dataMarklo.includes("klien: 'Reviro'"),
);
cek(
  'Carousel: layanan Meta Ads, Google Ads, SEO, Content Marketing',
  dataMarklo.includes("layanan: 'Meta Ads'") &&
    dataMarklo.includes("layanan: 'Google Ads'") &&
    dataMarklo.includes("layanan: 'SEO'") &&
    dataMarklo.includes("layanan: 'Content Marketing'"),
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
  'Pernyataan: "We focus on returns..." + "digital marketing" abu-abu',
  marklo.includes('We focus on returns, scaling your brand through') &&
    marklo.includes('digital marketing'),
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
  'Comparison: strip logo klien (ZenZap, Sparkle, Innovio, Craftgram, Lumo Labs) marquee',
  dataMarklo.includes("'ZenZap'") &&
    dataMarklo.includes("'Lumo Labs'") &&
    marklo.includes('mk-marquee'),
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
  'Booking: Next HANYA menampilkan catatan pratinjau jujur (tidak ada pemesanan terkirim)',
  marklo.includes('Preview only') &&
    marklo.includes('not sent anywhere') &&
    marklo.includes('connect to the Ajukan') &&
    !marklo.includes('fetch(') &&
    !marklo.includes('kirimPengajuan'),
);

// --- 13. Testimonials. ---
cek(
  'Testimonials: ribbon "#1 Marketing Agency 2025 Award Winner" + pill + heading',
  marklo.includes('#1 Marketing Agency 2025 Award Winner') &&
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
// Substring footer saja untuk asersi urutan kolom — komentar header
// berkas juga menyebut 'Additional Service', jadi indexOf global salah.
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
  'Footer: mark 4 kelopak + Back to top + Navigation + Socials + Contact + "Book 30 Min Free Call"',
  marklo.includes('Back to top') &&
    marklo.includes('Navigation') &&
    marklo.includes('Socials') &&
    marklo.includes('Contact') &&
    marklo.includes('Book 30 Min Free Call') &&
    marklo.includes('rounded-full bg-[#f6d9e8]'),
);
cek(
  'Footer: logo RRI + Deals putih (filter brightness(0) invert(1) di kedua img footer; logo header tanpa filter)',
  (marklo.match(/\[filter:brightness\(0\)_invert\(1\)\]/g) || []).length === 2 &&
    marklo.includes('className="h-9 w-auto shrink-0"'),
);
cek(
  'Footer: kolom "Additional Service" di antara Navigation dan Contact — link Book a Room + Rent a Space ke booking',
  footerMarklo.indexOf('Navigation') < footerMarklo.indexOf('Additional Service') &&
    footerMarklo.indexOf('Additional Service') < footerMarklo.indexOf('LPP RRI Head Office') &&
    footerMarklo.includes('Book a Room') &&
    footerMarklo.includes('Rent a Space'),
);
cek(
  'Footer: kontak RRI dari landing saat ini (alamat HQ, telepon/email bertanda sample, jam layanan)',
  marklo.includes('LPP RRI Head Office, Jakarta') &&
    marklo.includes('(021) 000-0000') &&
    marklo.includes('contoh@rri.go.id') &&
    marklo.includes('(sample)') &&
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
  'Sample: data Marklo dinyatakan SAMPLE/template, bukan data RRI',
  dataMarklo.includes('CONTOH (SAMPLE)') &&
    dataMarklo.includes('BUKAN data RRI'),
);
cek(
  'Sample: komponen menyatakan penyesuaian RRI diparkir',
  marklo.includes('DIPARKIR') && marklo.includes('penyesuaian RRI'),
);
cek(
  'Gambar: TIDAK ada hotlink eksternal (tanpa https:// di Marklo.tsx)',
  !marklo.includes('https://'),
);
cek(
  'Gambar: visual kartu memakai gradien CSS + inisial (bukan <img> eksternal)',
  marklo.includes('bg-gradient-to-br') && !marklo.includes('<img src="http'),
);

if (gagal > 0) {
  console.log(`\n${gagal} asersi GAGAL`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');

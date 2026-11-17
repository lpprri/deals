// Verifikasi landing page RRI Deals — copy final RRI yang disetujui
// pengguna 2026-11-17 (PR landing-copy-rri-final, route `/`).
// Asersi:
// - Route `/` (belum login, halamanPublik 'beranda') me-render
//   MarkloLanding dengan tombol Login + callback onLacak/onAjukan ke
//   halaman publik Lacak/Ajukan yang sudah ada; Beranda lama TIDAK
//   dipakai di App.tsx tetapi filenya TETAP ADA di repo (tidak dihapus).
// - Semua section ada dengan copy RRI: header, hero, carousel
//   etalase layanan, pernyataan, statistik (counter), process,
//   services (4 kelompok layanan), comparison, why-marketing, booking
//   konsultasi, FAQ, footer gelap.
// - Testimoni DIKOSONGKAN: section tidak dirender, tautan Testimonials
//   dihapus, logo klien contoh dihapus.
// - Motion "hidup": IntersectionObserver (reveal blur/fade),
//   requestAnimationFrame (counter), carousel auto-advance,
//   accordion FAQ, hover states. (Marquee logo klien dihapus bersama
//   logonya; keyframes marquee di index.css tidak dipakai lagi.)
// - Yang MASIH DIPARKIR: statistik live, dua bahasa, halaman khusus
//   Book a Room / Rent a Space.
// - Jujur: data landing kini copy RRI (bukan lagi SAMPLE template);
//   booking Next hanya pratinjau, tidak ada pemesanan yang terkirim;
//   tidak ada hotlink gambar eksternal.
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
  'App.tsx: beranda me-render <MarkloLanding onLogin + onLacak + onAjukan />',
  app.includes('<MarkloLanding') &&
    app.includes("onLogin={() => setHalamanPublik('login')}") &&
    app.includes("onLacak={() => setHalamanPublik('lacak')}") &&
    app.includes("onAjukan={() => setHalamanPublik('ajukan')}"),
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
  'Header: nav About, Service, Process (tanpa Testimonials)',
  marklo.includes("gulirKe('about')") &&
    marklo.includes("gulirKe('services')") &&
    marklo.includes("gulirKe('process')") &&
    !marklo.includes("gulirKe('testimonials')"),
);
cek(
  'Header: tombol Book a Free Call + Ajukan Kerja Sama + Login (onLogin)',
  marklo.includes('Book a Free Call') &&
    marklo.includes('Ajukan Kerja Sama') &&
    marklo.includes('onClick={onLogin}'),
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
  'Hero: H1 "Suara Anda, Didengar Indonesia."',
  marklo.includes('Suara Anda,') &&
    marklo.includes('Didengar Indonesia.'),
);
cek(
  'Hero: subcopy 67 kota lewat 69 satker RRI',
  marklo.includes('di 67 kota lewat 69') && marklo.includes('satker RRI'),
);
cek(
  'Hero: tombol primer "Book a Free Call" + "Ajukan Kerja Sama" (bukan "Our Services")',
  marklo.includes('Book a Free Call') &&
    marklo.includes('Ajukan Kerja Sama') &&
    !marklo.includes('Our Services'),
);
cek(
  'Hero: blok rating DIHAPUS — tidak ada TRUSTED BY, rating 4.9, bintang, atau avatar inisial testimoni',
  !marklo.includes('TRUSTED BY') &&
    !marklo.includes('useCountUp(4.9') &&
    !marklo.includes('BintangLima') &&
    !marklo.includes('/5.0') &&
    !marklo.includes("inisial: 'GR'"),
);

// --- 5. Carousel etalase layanan (dulu kampanye contoh). ---
cek(
  'Carousel: section id="work" + 4 kelompok layanan RRI (Radio, Digital, Venue & Produksi, Pelatihan & Sertifikasi)',
  marklo.includes('id="work"') &&
    dataMarklo.includes("klien: 'Radio'") &&
    dataMarklo.includes("klien: 'Digital'") &&
    dataMarklo.includes("klien: 'Venue & Produksi'") &&
    dataMarklo.includes("klien: 'Pelatihan & Sertifikasi'"),
);
cek(
  'Carousel: TIDAK ada lagi kampanye contoh (RingID, Beskon, Boutique, Reviro)',
  !dataMarklo.includes("klien: 'RingID'") &&
    !dataMarklo.includes("klien: 'Beskon Music'") &&
    !dataMarklo.includes("klien: 'Boutique'") &&
    !dataMarklo.includes("klien: 'Reviro'"),
);
cek(
  'Carousel: TIDAK ada layanan agency (Meta Ads, Google Ads, SEO, Content Marketing, Viral TikTok Ads)',
  !dataMarklo.includes("layanan: 'Meta Ads'") &&
    !dataMarklo.includes("layanan: 'Google Ads'") &&
    !dataMarklo.includes("layanan: 'SEO'") &&
    !dataMarklo.includes("layanan: 'Content Marketing'") &&
    !dataMarklo.includes('Viral TikTok Ads'),
);
cek(
  'Carousel: tombol prev/next + auto-advance 5 detik (jeda saat hover/fokus)',
  marklo.includes('Layanan sebelumnya') &&
    marklo.includes('Layanan berikutnya') &&
    marklo.includes('setInterval(() => gulirKartu(1), 5000)') &&
    marklo.includes('snap-x snap-mandatory'),
);

// --- 6. Pernyataan / About. ---
cek(
  'Pernyataan: "Kami fokus pada hasil — menempatkan brand Anda di udara dan di layar"',
  marklo.includes('Kami fokus pada hasil') &&
    marklo.includes('di udara dan di layar') &&
    marklo.includes('radio dan kanal digital RRI'),
);

// --- 7. Statistik (counter animasi). ---
cek(
  'Statistik: 4 item RRI (500+ Partners, 67 Cities, 69 Satker, 42 Kontrak Kerja Sama 2026)',
  dataMarklo.includes("label: 'Partners'") &&
    dataMarklo.includes("label: 'Cities'") &&
    dataMarklo.includes("label: 'Satker'") &&
    dataMarklo.includes("label: 'Kontrak Kerja Sama 2026'") &&
    dataMarklo.includes("nilai: 500") &&
    dataMarklo.includes("nilai: 67") &&
    dataMarklo.includes("nilai: 69") &&
    dataMarklo.includes("nilai: 42"),
);
cek(
  'Statistik: TIDAK ada lagi angka template (1200+ proyek, 25k+ klien, 98%, 35X)',
  !dataMarklo.includes("label: 'Projects Delivered'") &&
    !dataMarklo.includes("label: 'Happy Clients'") &&
    !dataMarklo.includes("label: 'Client Satisfaction'") &&
    !dataMarklo.includes("label: 'Client Growth Result'") &&
    !marklo.includes('35X'),
);
cek(
  'Statistik: "Mitra Kami di 67 Kota" + daftar nama satker (tanpa bendera negara)',
  marklo.includes('Mitra Kami di 67 Kota') &&
    dataMarklo.includes("nama: 'PALEMBANG'") &&
    dataMarklo.includes("nama: 'JAKARTA'") &&
    dataMarklo.includes("nama: 'MAMUJU'") &&
    !dataMarklo.includes('bendera') &&
    !marklo.includes('Our Clients in 35+ Countries'),
);

// --- 8. Process. ---
cek(
  'Process: pill "Proses" + heading "Tiga Langkah Mudah Memulai" + 3 langkah RRI',
  marklo.includes('<LabelPill>Proses</LabelPill>') &&
    marklo.includes('Tiga Langkah Mudah Memulai') &&
    dataMarklo.includes("judul: 'Book a Free Call'") &&
    dataMarklo.includes("judul: 'Strategi & Penawaran'") &&
    dataMarklo.includes("judul: 'Tayang & Terlacak'"),
);
cek(
  'Process: TIDAK ada lagi Funnel Audit / Campaign Management / Reporting & Maximize Profit / "skyrocket"',
  !dataMarklo.includes("judul: 'Funnel Audit'") &&
    !dataMarklo.includes("judul: 'Campaign Management'") &&
    !dataMarklo.includes("judul: 'Reporting & Maximize Profit'") &&
    !marklo.includes('skyrocket'),
);

// --- 9. Services (4 kelompok layanan RRI). ---
cek(
  'Services: pill "Layanan" + heading "Layanan RRI Deals" + 4 kelompok layanan',
  marklo.includes('<LabelPill>Layanan</LabelPill>') &&
    marklo.includes('Layanan RRI Deals') &&
    dataMarklo.includes("tahap: 'Radio — Jasa Penyiaran'") &&
    dataMarklo.includes("tahap: 'Digital — Jasa Digitalisasi Penyiaran'") &&
    dataMarklo.includes("tahap: 'Venue & Produksi — Sarana & Prasarana'") &&
    dataMarklo.includes("tahap: 'Pelatihan & Sertifikasi'"),
);
cek(
  'Services: harga "mulai dari" sesuai Usulan Tarif 2026 (Rp40.000 spot, Rp1.500.000 sound, Rp500.000 sertifikasi)',
  dataMarklo.includes('Mulai Rp40.000 / 60 detik') &&
    dataMarklo.includes('Mulai Rp1.500.000 / 4 jam') &&
    dataMarklo.includes('Mulai Rp500.000 / orang'),
);
cek(
  'Services: TIDAK ada lagi tangga funnel agency (Attract/Engage/Convert/Retain) + kotak "35X Client Growth"',
  !dataMarklo.includes("tahap: 'Attract Customer'") &&
    !dataMarklo.includes("tahap: 'Engage Prospect'") &&
    !dataMarklo.includes("tahap: 'Convert Clients'") &&
    !dataMarklo.includes("tahap: 'Retain Clients'") &&
    !marklo.includes('Client Growth'),
);
cek(
  'Services: susunan tangga diagonal + garis penghubung putus-putus vertikal (layout tidak berubah)',
  marklo.includes('OFFSET_FUNNEL') &&
    marklo.includes('border-l-2 border-dashed'),
);

// --- 10. Comparison. ---
cek(
  'Comparison: pill "Perbandingan" + heading "Mengapa RRI?" + Agency Lain vs RRI Deals',
  marklo.includes('<LabelPill>Perbandingan</LabelPill>') &&
    marklo.includes('Mengapa RRI?') &&
    marklo.includes('Agency Lain') &&
    marklo.includes('>RRI Deals</h3>'),
);
cek(
  'Comparison: 3 butir agency lain + 4 butir RRI (tarif PNBP, 69 satker, bukti siar)',
  dataMarklo.includes('Strategi copy-paste untuk semua klien') &&
    dataMarklo.includes('Tarif PNBP yang transparan') &&
    dataMarklo.includes('Jangkauan 69 satker di 67 kota') &&
    dataMarklo.includes('Bukti siar yang bisa dilacak'),
);
cek(
  'Comparison: strip logo klien contoh DIHAPUS (tidak ada marquee logo di komponen)',
  !dataMarklo.includes("'ZenZap'") &&
    !dataMarklo.includes("'Lumo Labs'") &&
    !marklo.includes('mk-marquee') &&
    !marklo.includes('LOGO_KLIEN'),
);

// --- 11. Why Marketing. ---
cek(
  'Why Marketing: pill "Masih Ragu?" + heading "Kenapa Beriklan di RRI?" + 4 manfaat RRI',
  marklo.includes('<LabelPill>Masih Ragu?</LabelPill>') &&
    marklo.includes('Kenapa Beriklan di RRI?') &&
    dataMarklo.includes("judul: 'Jangkauan Nasional'") &&
    dataMarklo.includes("judul: 'Multi-Kanal'") &&
    dataMarklo.includes("judul: 'Kredibilitas Penyiar Publik'") &&
    dataMarklo.includes("judul: 'Tarif Jelas'"),
);
cek(
  'Why Marketing: link "Book a Call" dipertahankan; "View our case study" dihapus',
  dataMarklo.includes("label: 'Book a Call'") &&
    !dataMarklo.includes("label: 'View our case study'"),
);
cek(
  'Why Marketing: kartu gelap "Masih ragu mau mulai dari mana?" + Book a Free Call',
  marklo.includes('Masih ragu mau mulai dari mana?') &&
    marklo.includes('Pesan panggilan gratis 30 menit'),
);

// --- 12. Booking konsultasi. ---
cek(
  'Booking: pill "Konsultasi Gratis" + heading "Ngobrol dulu, gratis. Tanpa komitmen."',
  marklo.includes('<LabelPill>Konsultasi Gratis</LabelPill>') &&
    marklo.includes('Ngobrol dulu, gratis. Tanpa komitmen.'),
);
cek(
  'Booking: subcopy 30 menit memetakan kanal dan format (bukan "review your funnel")',
  marklo.includes('Dalam 30 menit, kami bantu') &&
    marklo.includes('petakan kanal dan format') &&
    !marklo.includes('review your funnel'),
);
cek(
  'Booking: kartu host "RRI Deals" + "Pertemuan 30 Menit" + "Panggilan video" (bukan "Marklo")',
  marklo.includes('>RRI Deals</h3>') &&
    marklo.includes('Pertemuan 30 Menit') &&
    marklo.includes('Panggilan video') &&
    !marklo.includes('>Marklo</h3>'),
);
cek(
  'Booking: pemilih zona waktu + toggle 12h/24h + tombol "Lanjut"',
  marklo.includes('ZONA_WAKTU_MARKLO') &&
    marklo.includes('12h') &&
    marklo.includes('24h') &&
    marklo.includes(
      "disabled={tanggalDipilih === null || slotDipilih === null}",
    ),
);
cek(
  'Booking: tombol Lanjut HANYA menampilkan catatan pratinjau jujur berbahasa Indonesia + tombol Ajukan Kerja Sama (tidak ada pemesanan terkirim)',
  marklo.includes('Pratinjau saja') &&
    marklo.includes('tidak dikirim ke mana pun') &&
    marklo.includes('Ajukan Kerja Sama') &&
    !marklo.includes('Preview only') &&
    !marklo.includes('not sent anywhere') &&
    !marklo.includes('fetch(') &&
    !marklo.includes('kirimPengajuan'),
);

// --- 13. Testimonials DIKOSONGKAN. ---
cek(
  'Testimonials: section TIDAK dirender (tidak ada id="testimonials", fungsi Testimoni, atau data TESTIMONI)',
  !marklo.includes('id="testimonials"') &&
    !marklo.includes('function Testimoni') &&
    !marklo.includes('<Testimoni') &&
    !marklo.includes('TESTIMONI_MARKLO') &&
    !dataMarklo.includes('TESTIMONI'),
);
cek(
  'Testimonials: TIDAK ada lagi nama/kutipan contoh (Gabriel Ross, Daniel Lee, "Growth is not luck", "#1 Marketing Agency")',
  !dataMarklo.includes("nama: 'Gabriel Ross'") &&
    !dataMarklo.includes("nama: 'Daniel Lee'") &&
    !marklo.includes('Growth is not luck') &&
    !marklo.includes('#1 Marketing Agency 2025 Award Winner'),
);

// --- 14. FAQ. ---
cek(
  'FAQ: pill "FAQ" + heading "Pertanyaan yang Sering Diajukan" + 6 pertanyaan RRI',
  marklo.includes('<LabelPill>FAQ</LabelPill>') &&
    marklo.includes('Pertanyaan yang Sering Diajukan') &&
    dataMarklo.includes("q: 'Bagaimana cara mengajukan kerja sama?'") &&
    dataMarklo.includes("q: 'Bagaimana cara melacak kerja sama saya?'") &&
    dataMarklo.includes("q: 'Apa bedanya Prime Time dan Regular Time?'") &&
    dataMarklo.includes("q: 'Berapa biayanya?'") &&
    dataMarklo.includes("q: 'Bisakah iklan saya tayang di banyak kota sekaligus?'") &&
    dataMarklo.includes("q: 'Apakah saya mendapat bukti siar?'"),
);
cek(
  'FAQ: accordion (state terbuka) + pertanyaan terbuka jadi kartu merah teks putih',
  marklo.includes('const [terbuka, setTerbuka] = useState(0)') &&
    marklo.includes("bg-mk-aksen text-white' : 'bg-white text-black"),
);
cek(
  'FAQ: jawaban menyebut SK Kepala RRI No. 31/2026 + mulai Rp40.000/60 detik',
  dataMarklo.includes('SK Kepala RRI No. 31/2026') &&
    dataMarklo.includes('Mulai Rp40.000 per 60 detik'),
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
  'Footer: deskripsi berbahasa Indonesia + "Kembali ke atas" + Navigation + Socials + Contact + CTA "Pesan Panggilan Gratis 30 Menit"',
  marklo.includes('Portal kemitraan Lembaga Penyiaran Publik') &&
    marklo.includes('Kembali ke atas') &&
    marklo.includes('Navigation') &&
    marklo.includes('Socials') &&
    marklo.includes('Contact') &&
    marklo.includes('Pesan Panggilan Gratis 30 Menit') &&
    !marklo.includes('Back to top') &&
    !marklo.includes('Book 30 Min Free Call'),
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
  'Footer: kolom "Additional Service" di antara Navigation dan Contact — Book a Room + Rent a Space ke booking, "Lacak Kerja Sama" via onLacak (bukan booking)',
  footerMarklo.indexOf('Navigation') < footerMarklo.indexOf('Additional Service') &&
    footerMarklo.indexOf('Additional Service') < footerMarklo.indexOf('Jl. Medan Merdeka Barat') &&
    footerMarklo.includes('Book a Room') &&
    footerMarklo.includes('Rent a Space') &&
    footerMarklo.includes('Lacak Kerja Sama') &&
    marklo.includes('onLacak'),
);
cek(
  'Footer: navigasi TIDAK lagi memuat tautan Testimonials',
  !footerMarklo.includes("'Testimonials'"),
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
    marklo.includes('© 2026 LPP RRI. Hak cipta dilindungi.'),
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
  'Parkir: Lacak/Ajukan kini terhubung via callback onLacak/onAjukan (bukan import langsung di komponen landing)',
  marklo.includes('onLacak') &&
    marklo.includes('onAjukan') &&
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
  'Parkir: TIDAK ada section harga khusus (pricing) — harga hanya tag "Mulai ..." di kartu layanan',
  !marklo.includes('id="pricing"') &&
    dataMarklo.includes('Mulai Rp40.000 / 60 detik'),
);

// --- 18. Jujur: data RRI + tanpa hotlink eksternal. ---
cek(
  'Data: data landing kini copy RRI yang disetujui (bukan lagi SAMPLE template)',
  dataMarklo.includes('disetujui pengguna') &&
    !dataMarklo.includes('CONTOH (SAMPLE)') &&
    !dataMarklo.includes('BUKAN data RRI'),
);
cek(
  'Data: komponen menyatakan copy final RRI (bukan penyesuaian yang diparkir)',
  marklo.includes('copy final RRI') && !marklo.includes('DIPARKIR ke'),
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

// --- 19. Tidak ada jejak konten contoh di copy landing. ---
const gabungan = marklo + '\n' + dataMarklo;
const terlarang = [
  'RingID',
  'Beskon',
  'Boutique',
  'Reviro',
  'Gabriel Ross',
  'Daniel Lee',
  'ZenZap',
  'Sparkle',
  'Innovio',
  'Craftgram',
  'Lumo Labs',
  'Meta Ads',
  'Google Ads',
  '35+ Countries',
  '35X',
  '#1 Marketing Agency',
  'TRUSTED BY',
  'Viral TikTok Ads',
  'Funnel Audit',
  'Other Agencies',
  'Our Agency',
  'Growth is not luck',
  'TRUSTED',
  'useCountUp(4.9',
  '>Marklo</h3>',
];
const ditemukan = terlarang.filter((s) => gabungan.includes(s));
cek(
  'Jejak: tidak ada satu pun string contoh terlarang di copy landing',
  ditemukan.length === 0,
  ditemukan.join(', '),
);

if (gagal > 0) {
  console.log(`\n${gagal} asersi GAGAL`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');

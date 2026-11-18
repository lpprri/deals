// Landing page publik — tiruan template agency "Marklo"
// (PR landing-marklo-clone, 2026-11-17).
// (PR landing-footer-navy-putih, 2026-11-17: footer gradien navy RRI
// #0D2569 (bukan maroon), logo RRI + Deals di footer dibuat putih,
// kolom "Our Service", header seamless tanpa garis bawah.
// PR ini JUGA me-revert PR #75 (ukuran landing kembali ke PR #74)
// karena pengguna menilai ukuran PR #75 kebesaran di zoom 100% —
// permintaan ukuran PR #75 berasal dari tampilan zoom-out.)
//
// Tiruan visual SESETIA MUNGKIN dari template Marklo; penyesuaian RRI
// (palet, Lacak, Ajukan, statistik live, dua bahasa) DIPARKIR ke
// putaran berikutnya atas instruksi pengguna 15:42 WIB. Di PR ini:
//   - Bahasa: Inggris (seperti template).
//   - Nama orang/klien/kampanye/testimoni/angka: DATA CONTOH dari
//     template (src/lib/landingMarklo.ts) — BUKAN data RRI.
//   - Brand header/footer tetap "RRI Deals" (logo/wordmark RRI apa
//     adanya, tidak diwarnai ulang) — KECUALI logo di footer yang
//     dibuat putih atas permintaan eksplisit pengguna 2026-11-17
//     (filter brightness(0) invert(1), hanya di footer).
//   - Kontak footer memakai data RESMI Kantor Pusat RRI (alamat Jl.
//     Medan Merdeka Barat No. 4–5 + dua nomor telepon tel:, pengguna
//     2026-11-17); TIDAK ADA baris email sama sekali — pengguna
//     mengonfirmasi 2026-11-17 16:35 WIB: tidak ada email yang
//     ditampilkan di footer Contact.
//   - Tombol "Book a Free Call" (header, hero, kartu gelap "Still not
//     sure where to start?") menggulir ke kartu booking — perilaku PR
//     #78 (membuka halaman Meeting) DI-REVERT atas koreksi pengguna
//     2026-11-17: tombol tetap mengarah ke pemilih tanggal/waktu.
//     Tombol "Book a Free Consultation" (akhir Proses) dan
//     "Book 30 Min Free Call" (footer Contact) TIDAK diubah.
//   - Kartu booking NYATA (bukan pratinjau): pilih tanggal + jam lalu
//     Next membuka form singkat (Nama, Perusahaan opsional, Kontak,
//     Email, Topik); submit menyimpan permintaan sebagai Meeting di
//     Firestore (koleksi 'meeting') agar muncul di tabel Meeting panel
//     admin. Email wajib — kanal kirim link Google Meet (operator kirim
//     manual setelah sync; PR landing-booking-email).
//     Catatan pratinjau SUDAH DIHAPUS.
//   - Kolom footer "Our Service": Plan a Campaign, Book a Venue,
//     Rent a Space, Get a Journalism Training — keempatnya menggulir
//     ke kartu booking untuk sementara.
//   - Kartu booking memakai nama "Deals" + logo RRI (bukan "Marklo").
//   - Teks social proof hero diubah atas permintaan pengguna 2026-11-17:
//     "TRUSTED BY 100+ PARTNERS NATIONALLY"; avatar, bintang, dan 4.9/5.0
//     tidak berubah. Teks lama (500+ brands, global) tidak boleh tersisa
//     di landing ini.
//   - Gambar: tidak ada hotlink eksternal — visual kartu memakai
//     gradien CSS; avatar memakai lingkaran inisial.
// Komponen landing lama (Beranda.tsx + landing/*) TETAP di repo dan
// tidak dipakai di route `/` untuk sementara.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ArrowRight,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  MapPin,
  Phone,
  Star,
  Video,
  X,
} from 'lucide-react';
import { LOGO_RRI_LANDING_DATA_URI } from '../../lib/logoRriLanding';
import { LOGO_DEALS_DATA_URI } from '../../lib/logoDeals';
import {
  FAQ_MARKLO,
  KAMPANYE_MARKLO,
  LAYANAN_MARKLO,
  LOGO_KLIEN_MARKLO,
  MANFAAT_MARKLO,
  PERBANDINGAN_KAMI,
  PERBANDINGAN_LAIN,
  PROSES_MARKLO,
  SLOT_BOOKING_MENIT,
  STATISTIK_MARKLO,
  TESTIMONI_MARKLO,
  ZONA_WAKTU_MARKLO,
} from '../../lib/landingMarklo';
import { KOTA_SATKER_MARKLO } from '../../lib/landingMarklo';
import { FOTO_KAMPANYE } from '../../lib/fotoKampanye';
import type { BookingPublikInput } from '../../lib/store';

export interface MarkloLandingProps {
  /** Buka halaman login Operator (infrastruktur aplikasi). */
  onLogin: () => void;
  /** Kirim permintaan free call publik (form singkat kartu booking):
      menyimpan sebagai Meeting di Firestore; kembalikan null bila
      berhasil, pesan error bila gagal. */
  onKirimBooking: (input: BookingPublikInput) => Promise<string | null>;
}

/** Gulir halus ke section berdasarkan id. */
function gulirKe(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

/** Pembungkus reveal: blur + fade-in saat masuk viewport.
    Opsi ambang/margin hanya dipakai kartu layanan (PR #93) supaya
    pemicunya lebih dalam di viewport; pemakaian lain tetap default. */
function Reveal({
  children,
  className = '',
  tunda = 0,
  ambang = 0.12,
  margin = '0px',
}: {
  children: ReactNode;
  className?: string;
  tunda?: number;
  ambang?: number;
  margin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tampil, setTampil] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const pengamat = new IntersectionObserver(
      (entri) => {
        if (entri[0].isIntersecting) {
          setTampil(true);
          pengamat.disconnect();
        }
      },
      { threshold: ambang, rootMargin: margin },
    );
    pengamat.observe(el);
    return () => pengamat.disconnect();
  }, [ambang, margin]);
  return (
    <div
      ref={ref}
      style={tunda ? { transitionDelay: `${tunda}ms` } : undefined}
      className={`mk-reveal ${tampil ? 'mk-tampil' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

/** Counter animasi 0 → target dengan requestAnimationFrame (ease-out). */
function useCountUp(target: number, aktif: boolean, durasi = 1600) {
  const [nilai, setNilai] = useState(0);
  useEffect(() => {
    if (!aktif) return;
    let raf = 0;
    const mulai = performance.now();
    const langkah = (waktu: number) => {
      const progres = Math.min(1, (waktu - mulai) / durasi);
      const redam = 1 - Math.pow(1 - progres, 3);
      setNilai(target * redam);
      if (progres < 1) raf = requestAnimationFrame(langkah);
    };
    raf = requestAnimationFrame(langkah);
    return () => cancelAnimationFrame(raf);
  }, [target, aktif, durasi]);
  return nilai;
}

/** Label section berbentuk pill outline merah (gaya template).
    Varian `gelap` (PR #97) untuk section berlatar gelap: border + teks
    putih supaya kontras cukup di atas navy. */
function LabelPill({
  children,
  gelap = false,
}: {
  children: ReactNode;
  gelap?: boolean;
}) {
  return (
    <span
      className={
        gelap
          ? 'inline-flex items-center rounded-full border border-white/60 px-4 py-1.5 text-sm font-semibold text-white'
          : 'inline-flex items-center rounded-full border border-mk-aksen px-4 py-1.5 text-sm font-semibold text-mk-aksen'
      }
    >
      {children}
    </span>
  );
}

/** Bintang 5 penuh (social proof hero + kartu testimoni). */
function BintangLima({
  className = 'h-4 w-4',
  pembungkus = 'text-mk-aksen',
}: {
  className?: string;
  pembungkus?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${pembungkus}`}
      aria-label="Rated 5 out of 5"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={`${className} fill-current`} aria-hidden="true" />
      ))}
    </span>
  );
}

export default function MarkloLanding({ onLogin, onKirimBooking }: MarkloLandingProps) {
  return (
    <div className="min-h-screen bg-white text-black">
      <Header onLogin={onLogin} />
      <main>
        <Hero />
        <CarouselKampanye />
        <Pernyataan />
        <Statistik />
        <Proses />
        <Layanan />
        <Perbandingan />
        <MengapaMarketing />
        <BookingKonsultasi onKirimBooking={onKirimBooking} />
        <Testimoni />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}

/* ================= Header ================= */

function Header({ onLogin }: { onLogin: () => void }) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => gulirKe('atas')}
          className="flex min-w-0 items-center gap-2"
          aria-label="RRI Deals — back to top"
        >
          <img
            src={LOGO_RRI_LANDING_DATA_URI}
            alt="Radio Republik Indonesia"
            className="h-9 w-auto shrink-0"
          />
          <img
            src={LOGO_DEALS_DATA_URI}
            alt="Deals"
            className="h-9 w-auto shrink-0"
          />
        </button>
        <nav
          aria-label="Main navigation"
          className="ml-auto hidden items-center gap-7 text-sm font-medium text-slate-700 md:flex"
        >
          <button type="button" onClick={() => gulirKe('about')} className="hover:text-mk-aksen">
            About
          </button>
          <button type="button" onClick={() => gulirKe('services')} className="hover:text-mk-aksen">
            Service
          </button>
          <button
            type="button"
            onClick={() => gulirKe('testimonials')}
            className="hover:text-mk-aksen"
          >
            Testimonials
          </button>
          <button type="button" onClick={() => gulirKe('process')} className="hover:text-mk-aksen">
            Process
          </button>
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
          <button
            type="button"
            onClick={() => gulirKe('booking')}
            className="hidden rounded-full bg-mk-aksen px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-mk-aksen-gelap sm:inline-flex"
          >
            Book a Free Call
          </button>
          <button
            type="button"
            onClick={onLogin}
            className="rounded-full border-2 border-black px-4 py-2 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
          >
            Login
          </button>
        </div>
      </div>
    </header>
  );
}

/* ================= Hero ================= */

function Hero() {
  const rating = useCountUp(4.9, true, 1800);
  return (
    <section id="atas" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-14 text-center sm:px-6 lg:pt-20">
        <Reveal>
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight text-black sm:text-6xl lg:text-7xl">
            Grow <span className="text-slate-300">smarter</span> with our
            marketing.
          </h1>
        </Reveal>
        <Reveal tunda={120}>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg">
            We help ambitious brands grow with data-driven campaigns, creative
            that converts, and reporting you can actually trust.
          </p>
        </Reveal>
        <Reveal tunda={220}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => gulirKe('booking')}
              className="inline-flex items-center gap-2 rounded-full bg-mk-aksen px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-mk-aksen-gelap"
            >
              Book a Free Call
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => gulirKe('services')}
              className="rounded-full border-2 border-black px-6 py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
            >
              Our Services
            </button>
          </div>
        </Reveal>
        <Reveal tunda={320}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <span className="flex -space-x-2">
              {[
                { inisial: 'GR', gradien: 'from-rose-400 to-orange-300' },
                { inisial: 'SM', gradien: 'from-sky-400 to-blue-300' },
                { inisial: 'PK', gradien: 'from-violet-400 to-purple-300' },
                { inisial: 'DL', gradien: 'from-emerald-400 to-teal-300' },
              ].map((a) => (
                <span
                  key={a.inisial}
                  className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${a.gradien} text-xs font-bold text-white ring-2 ring-white`}
                  aria-hidden="true"
                >
                  {a.inisial}
                </span>
              ))}
            </span>
            <span className="flex items-center gap-2">
              <BintangLima />
              <span className="text-sm font-bold text-black">
                {rating.toFixed(1)}/5.0
              </span>
            </span>
            <span className="text-xs font-semibold tracking-widest text-slate-400">
              TRUSTED BY 100+ PARTNERS NATIONALLY
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= Carousel kampanye ================= */

function CarouselKampanye() {
  const ref = useRef<HTMLDivElement>(null);
  const [jeda, setJeda] = useState(false);
  const gulirKartu = useCallback((arah: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const kartu = el.querySelector<HTMLElement>('[data-kartu]');
    const lebar = kartu ? kartu.offsetWidth + 24 : 360;
    const maks = el.scrollWidth - el.clientWidth;
    let berikut = el.scrollLeft + arah * lebar;
    if (berikut > maks + 4) berikut = 0;
    if (berikut < -4) berikut = maks;
    el.scrollTo({ left: berikut, behavior: 'smooth' });
  }, []);
  useEffect(() => {
    if (jeda) return;
    const id = window.setInterval(() => gulirKartu(1), 5000);
    return () => window.clearInterval(id);
  }, [jeda, gulirKartu]);
  return (
    <section id="work" className="bg-white pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
              Campaigns that delivered.
            </h2>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => gulirKartu(-1)}
                aria-label="Previous campaign"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-black transition hover:border-black hover:bg-black hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => gulirKartu(1)}
                aria-label="Next campaign"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-black transition hover:border-black hover:text-white"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </Reveal>
        <Reveal tunda={120}>
          <div
            ref={ref}
            onMouseEnter={() => setJeda(true)}
            onMouseLeave={() => setJeda(false)}
            onFocus={() => setJeda(true)}
            onBlur={() => setJeda(false)}
            className="scrollbar-tersembunyi mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2"
          >
            {KAMPANYE_MARKLO.map((k) => (
              <article
                key={k.klien}
                data-kartu
                className="w-[85%] shrink-0 snap-start overflow-hidden rounded-[20px] bg-white shadow-lg ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl sm:w-[420px]"
              >
                <div className="relative h-60 overflow-hidden" aria-hidden="true">
                  <img
                    src={FOTO_KAMPANYE[k.klien]}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-start justify-between gap-4 p-5">
                  <div>
                    <h3 className="text-lg font-extrabold text-black">{k.klien}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                      {k.ringkasan}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-mk-peach px-3 py-1 text-xs font-bold text-mk-aksen">
                    {k.layanan}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= Pernyataan / About ================= */

function Pernyataan() {
  return (
    <section id="about" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        <Reveal>
          <p className="text-3xl font-extrabold leading-tight tracking-tight text-black sm:text-5xl lg:text-6xl">
            We focus on returns, scaling your brand through{' '}
            <span className="text-slate-300">multi-platform marketing</span> to take
            it to the next level.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= Statistik ================= */

function Statistik() {
  const ref = useRef<HTMLDivElement>(null);
  const [terlihat, setTerlihat] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const pengamat = new IntersectionObserver(
      (entri) => {
        if (entri[0].isIntersecting) {
          setTerlihat(true);
          pengamat.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    pengamat.observe(el);
    return () => pengamat.disconnect();
  }, []);
  return (
    <section className="bg-white pb-16 sm:pb-20">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <dl className="grid grid-cols-2 gap-6 lg:grid-cols-3">
            {STATISTIK_MARKLO.map((s) => (
              <StatItem key={s.id} stat={s} aktif={terlihat} />
            ))}
          </dl>
        </Reveal>
        <Reveal tunda={150}>
          <div className="mt-12 text-center">
            <p className="text-sm font-bold tracking-wide text-black">
              Our Clients in 67+ Cities
            </p>
            <p className="mt-1 text-sm text-slate-500">
              From the capital to the farthest corners of Indonesia
            </p>
            <div className="mt-4 overflow-hidden">
              <ul
                className="mk-marquee flex w-max items-center gap-2"
                style={{ animationDuration: '90s' }}
              >
                {[...KOTA_SATKER_MARKLO, ...KOTA_SATKER_MARKLO].map(
                  (kota, i) => (
                    <li
                      key={`${kota}-${i}`}
                      aria-hidden={i >= KOTA_SATKER_MARKLO.length}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                    >
                      {kota}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function StatItem({
  stat,
  aktif,
}: {
  stat: (typeof STATISTIK_MARKLO)[number];
  aktif: boolean;
}) {
  const nilai = useCountUp(stat.nilai, aktif, 1800);
  const tampil = nilai.toLocaleString('en-US', {
    maximumFractionDigits: stat.desimal,
  });
  return (
    <div className="rounded-[20px] bg-slate-50 p-6 text-center ring-1 ring-slate-200">
      <dd className="text-4xl font-extrabold tracking-tight text-black sm:text-5xl">
        {tampil}
        {stat.akhiran}
      </dd>
      <dt className="mt-2 text-sm font-medium text-slate-500">{stat.label}</dt>
      {stat.id === 'klien' && (
        <span className="mt-3 inline-flex items-center justify-center gap-2">
          <span className="flex -space-x-1.5">
            {['GR', 'SM', 'PK'].map((inisial, i) => (
              <span
                key={inisial}
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-white ${
                  ['bg-rose-400', 'bg-sky-400', 'bg-violet-400'][i]
                }`}
                aria-hidden="true"
              >
                {inisial}
              </span>
            ))}
          </span>
          <BintangLima className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  );
}

/* ================= Process ================= */

function Proses() {
  return (
    <section id="process" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <Reveal>
          <LabelPill>Process</LabelPill>
          <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-black sm:text-5xl">
            Our simple 3-step process to skyrocket your business.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 text-left md:grid-cols-3">
          {PROSES_MARKLO.map((langkah, i) => (
            <Reveal key={langkah.nomor} tunda={i * 120}>
              <article className="h-full rounded-[20px] bg-white p-7 shadow-lg ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl">
                <span className="text-4xl font-extrabold text-mk-aksen">
                  {langkah.nomor}
                </span>
                <h3 className="mt-4 text-xl font-extrabold text-black">
                  {langkah.judul}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {langkah.desk}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal tunda={200}>
          <button
            type="button"
            onClick={() => gulirKe('booking')}
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-mk-aksen px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-mk-aksen-gelap"
          >
            Book a Free Consultation
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= Services (4 layanan RRI) ================= */

const OFFSET_FUNNEL = ['', 'sm:pl-10', 'sm:pl-20', 'sm:pl-32'];

function Layanan() {
  const [sorot, setSorot] = useState<number | null>(null);
  const timerSorot = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (timerSorot.current !== null) window.clearTimeout(timerSorot.current);
    };
  }, []);
  /** Klik label langkah: gulir halus ke kartu layanannya + sorot singkat (PR #91). */
  function pilihLayanan(i: number) {
    if (timerSorot.current !== null) window.clearTimeout(timerSorot.current);
    document
      .getElementById(`layanan-${i}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setSorot(i);
    timerSorot.current = window.setTimeout(() => setSorot(null), 1600);
  }
  return (
    <section id="services" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <Reveal>
          <LabelPill>Services</LabelPill>
          <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-black sm:text-5xl">
            Multi-platform marketing for predictable, lasting growth.
          </h2>
        </Reveal>
        {/* Baris label langkah template — dipetakan ke layanan RRI (PR #85):
            label pertama merah seperti template, sisanya slate.
            Label bisa di-klik (PR #91): tiap label tombol yang menggulir
            halus ke kartu layanannya + sorot singkat; tampilan tetap. */}
        <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-left">
          {LAYANAN_MARKLO.map((layanan, i) => (
            <button
              key={layanan.nama}
              type="button"
              onClick={() => pilihLayanan(i)}
              aria-label={`View ${layanan.nama} service`}
              className={`cursor-pointer text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mk-aksen sm:text-base ${
                i === 0 ? 'text-red-400' : 'text-slate-400'
              }`}
            >
              {layanan.langkah}
            </button>
          ))}
        </div>
        <div className="mx-auto mt-6 max-w-3xl text-left">
          {LAYANAN_MARKLO.map((layanan, i) => (
            <div
              key={layanan.nama}
              className={`mk-layang ${OFFSET_FUNNEL[i]}`}
              style={{ animationDelay: `${i * 1.2}s` }}
            >
              {/* Reveal dalam (PR #93): kartu benar-benar tersembunyi
                  (naik 48px + blur kuat) sampai masuk viewport, lalu
                  muncul halus bertahap (stagger 180ms) seperti template.
                  Klik label (PR #91) menggulir kartu ke tengah layar,
                  jadi pemicu reveal tetap jalan seperti scroll biasa. */}
              <Reveal
                tunda={i * 180}
                className="mk-reveal-dalam"
                ambang={0.15}
                margin="0px 0px -8% 0px"
              >
                <article
                  id={`layanan-${i}`}
                  className={`scroll-mt-24 max-w-xl rounded-[20px] bg-gradient-to-br ${layanan.gradien} p-7 shadow-md transition hover:shadow-lg sm:p-8 ${
                    sorot === i ? 'ring-2 ring-mk-aksen' : 'ring-1 ring-white'
                  }`}
                >
                  {/* Logo langsung di atas gradasi kartu, tanpa chip putih (PR #90).
                      Logo bergoyang saat di-hover (PR #92). */}
                  <div className="flex flex-wrap items-center gap-2">
                    {layanan.logo.map((item) => (
                      <img
                        key={item.nama}
                        src={item.logoDataUri}
                        alt={item.nama}
                        className="mk-logo-layanan h-10 w-auto sm:h-12"
                        loading="lazy"
                      />
                    ))}
                  </div>
                  <div className="mt-3">
                    <h3 className="text-2xl font-extrabold text-black">
                      {layanan.nama}
                    </h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-slate-600">
                      {layanan.desk}
                    </p>
                  </div>
                </article>
              </Reveal>
              {i < LAYANAN_MARKLO.length - 1 && (
                <div
                  className={OFFSET_FUNNEL[i + 1]}
                  aria-hidden="true"
                >
                  <div className="mk-garis-funnel h-8 w-0.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= Comparison ================= */

function Perbandingan() {
  return (
    <section className="mk-latar-navy py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <LabelPill gelap>Comparison</LabelPill>
            <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              But, why would you want to work with us?
            </h2>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Reveal>
            <article className="h-full rounded-[20px] bg-white p-7 shadow-lg ring-1 ring-slate-200">
              <h3 className="text-xl font-extrabold text-black">
                Other Services
              </h3>
              <ul className="mt-5 space-y-4">
                {PERBANDINGAN_LAIN.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-100 text-mk-aksen">
                      <X className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm leading-relaxed text-slate-500">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
          <Reveal tunda={140}>
            <article className="h-full rounded-[20px] bg-mk-peach p-7 shadow-lg ring-1 ring-orange-100">
              <h3 className="text-xl font-extrabold text-black">Our Service</h3>
              <ul className="mt-5 space-y-4">
                {PERBANDINGAN_KAMI.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mk-aksen text-white">
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold leading-relaxed text-black">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        </div>
        <Reveal tunda={200}>
          <div className="relative mt-12 overflow-hidden py-5">
            <div className="mk-marquee flex w-max items-center gap-12">
              {[...LOGO_KLIEN_MARKLO, ...LOGO_KLIEN_MARKLO].map((logo, i) => (
                <span
                  key={`${logo.nama}-${i}`}
                  className="flex shrink-0 items-center rounded-lg bg-white px-3 py-2 shadow-sm"
                >
                  <img
                    src={logo.logoDataUri}
                    alt={logo.nama}
                    aria-hidden={i >= LOGO_KLIEN_MARKLO.length}
                    className="h-10 w-auto"
                  />
                </span>
              ))}
            </div>
            {/* Fade tepi (PR #98): overlay gradasi di kedua ujung strip —
                kiri #1a3a8a, kanan #04122e, mengikuti latar navy section.
                pointer-events-none supaya hover tetap men-pause marquee. */}
            <div
              aria-hidden="true"
              className="mk-fade-tepi-kiri pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-32"
            />
            <div
              aria-hidden="true"
              className="mk-fade-tepi-kanan pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-32"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= Why Marketing ================= */

function MengapaMarketing() {
  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <LabelPill>Confusion?</LabelPill>
            <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-black sm:text-5xl">
              Why do you need Marketing?
            </h2>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MANFAAT_MARKLO.map((m, i) => (
            <Reveal key={m.judul} tunda={(i % 3) * 120} className={i === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}>
              <article className="flex h-full flex-col rounded-[20px] bg-white p-7 shadow-md ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
                <h3 className="text-lg font-extrabold text-black">{m.judul}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
                  {m.desk}
                </p>
                {m.tautan && (
                  <button
                    type="button"
                    onClick={() => gulirKe(m.tautan!.jangkar.slice(1))}
                    className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-bold text-mk-aksen hover:underline"
                  >
                    {m.tautan.label}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </article>
            </Reveal>
          ))}
          <Reveal tunda={240} className="sm:col-span-2 lg:col-span-1">
            <article className="flex h-full flex-col items-start justify-center rounded-[20px] bg-black p-7 text-white shadow-md">
              <p className="text-2xl font-extrabold leading-snug">
                Still not sure where to start?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Book a free 30-minute call and we will audit your funnel together.
              </p>
              <button
                type="button"
                onClick={() => gulirKe('booking')}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-mk-aksen px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-mk-aksen-gelap"
              >
                Book a Free Call
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================= Booking konsultasi ================= */

function kunciTanggal(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function formatSlot(menit: number, format24: boolean) {
  const m = ((menit % 1440) + 1440) % 1440;
  const jam = Math.floor(m / 60);
  const mnt = m % 60;
  if (format24) {
    return `${String(jam).padStart(2, '0')}:${String(mnt).padStart(2, '0')}`;
  }
  const ampm = jam >= 12 ? 'PM' : 'AM';
  const jam12 = jam % 12 === 0 ? 12 : jam % 12;
  return `${jam12}:${String(mnt).padStart(2, '0')} ${ampm}`;
}

function labelTanggal(kunci: string) {
  const [y, m, d] = kunci.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const NAMA_BULAN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function BookingKonsultasi({
  onKirimBooking,
}: {
  onKirimBooking: (input: BookingPublikInput) => Promise<string | null>;
}) {
  const hariIni = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [bulan, setBulan] = useState(
    () => new Date(hariIni.getFullYear(), hariIni.getMonth(), 1),
  );
  const [tanggalDipilih, setTanggalDipilih] = useState<string | null>(null);
  const [slotDipilih, setSlotDipilih] = useState<number | null>(null);
  const [zonaId, setZonaId] = useState('Asia/Jakarta');
  const [format24, setFormat24] = useState(true);
  /** Tahap kartu: 'pilih' (kalender + slot), 'form' (form singkat),
      'terkirim' (status sukses). */
  const [tahap, setTahap] = useState<'pilih' | 'form' | 'terkirim'>('pilih');
  const [nama, setNama] = useState('');
  const [perusahaan, setPerusahaan] = useState('');
  const [kontak, setKontak] = useState('');
  const [email, setEmail] = useState('');
  const [topik, setTopik] = useState('');
  const [galatField, setGalatField] = useState<{
    nama?: string;
    kontak?: string;
    email?: string;
    topik?: string;
  }>({});
  const [galatKirim, setGalatKirim] = useState<string | null>(null);
  const [mengirim, setMengirim] = useState(false);
  const zona = ZONA_WAKTU_MARKLO.find((z) => z.id === zonaId) ?? ZONA_WAKTU_MARKLO[0];
  const geserMenit = zona.offsetMenit - 420; // slot disimpan basis WIB (UTC+7)

  const bulanIni = new Date(hariIni.getFullYear(), hariIni.getMonth(), 1);
  const bulanDepan = new Date(hariIni.getFullYear(), hariIni.getMonth() + 1, 1);
  const bisaMundur = bulan.getTime() > bulanIni.getTime();
  const bisaMaju = bulan.getTime() < bulanDepan.getTime();

  const hariPertama = (new Date(bulan.getFullYear(), bulan.getMonth(), 1).getDay() + 6) % 7; // Senin dulu
  const jumlahHari = new Date(bulan.getFullYear(), bulan.getMonth() + 1, 0).getDate();
  const selKalender: (Date | null)[] = [
    ...Array.from({ length: hariPertama }, () => null),
    ...Array.from({ length: jumlahHari }, (_, i) => new Date(bulan.getFullYear(), bulan.getMonth(), i + 1)),
  ];

  const pilihTanggal = (d: Date) => {
    setTanggalDipilih(kunciTanggal(d));
    setSlotDipilih(null);
  };

  /** Ringkasan slot yang dipilih, dalam zona tampilan pengunjung. */
  const ringkasanSlot =
    tanggalDipilih !== null && slotDipilih !== null
      ? `${labelTanggal(tanggalDipilih)}, ${formatSlot(slotDipilih + geserMenit, format24)} ${zona.id}`
      : '';

  /** Validasi form singkat lalu kirim sebagai Meeting (App.tsx). */
  const kirim = async () => {
    const galat: { nama?: string; kontak?: string; email?: string; topik?: string } = {};
    if (!nama.trim()) galat.nama = 'Nama wajib diisi.';
    if (!kontak.trim()) galat.kontak = 'Kontak wajib diisi.';
    if (!email.trim()) galat.email = 'Email wajib diisi.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      galat.email = 'Format email tidak valid.';
    if (!topik.trim()) galat.topik = 'Topik wajib diisi.';
    setGalatField(galat);
    if (Object.keys(galat).length > 0) return;
    if (tanggalDipilih === null || slotDipilih === null) return;
    setMengirim(true);
    setGalatKirim(null);
    const galatSimpan = await onKirimBooking({
      tanggal: tanggalDipilih,
      // Slot disimpan basis WIB (jam meeting); zona tampilan yang dipilih
      // pengunjung hanya memengaruhi tampilan jam di kartu.
      jam: formatSlot(slotDipilih, true),
      nama: nama.trim(),
      perusahaan: perusahaan.trim() || undefined,
      kontak: kontak.trim(),
      email: email.trim(),
      topik: topik.trim(),
    });
    setMengirim(false);
    if (galatSimpan) {
      // Gagal tersimpan — tampilkan jujur di kartu, jangan sukses palsu.
      setGalatKirim(galatSimpan);
      return;
    }
    setTahap('terkirim');
  };

  /** Kembali ke pemilih jadwal dari awal (setelah terkirim). */
  const ulang = () => {
    setTahap('pilih');
    setTanggalDipilih(null);
    setSlotDipilih(null);
    setNama('');
    setPerusahaan('');
    setKontak('');
    setEmail('');
    setTopik('');
    setGalatField({});
    setGalatKirim(null);
  };

  return (
    <section id="booking" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <LabelPill>Free Consultation</LabelPill>
            <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-black sm:text-5xl">
              Let&apos;s talk about growing your business
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-500">
              Pick a time that works for you. We will review your funnel and
              show you the fastest path to growth — free, no strings attached.
            </p>
          </div>
        </Reveal>
        <Reveal tunda={150}>
          {tahap === 'pilih' ? (
          <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-[20px] bg-white shadow-xl ring-1 ring-slate-200">
            <div className="grid md:grid-cols-3">
              {/* Kolom host */}
              <div className="border-b border-slate-200 p-6 md:border-b-0 md:border-r">
                <img
                  src={LOGO_RRI_LANDING_DATA_URI}
                  alt="Radio Republik Indonesia"
                  className="h-10 w-auto"
                />
                <img
                  src={LOGO_DEALS_DATA_URI}
                  alt="Deals"
                  className="mt-4 h-7 w-auto"
                />
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  30 Min Meeting
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <Video className="h-4 w-4" aria-hidden="true" />
                  Video call
                </p>
                <label className="mt-5 block text-xs font-bold uppercase tracking-wide text-slate-400">
                  Time zone
                </label>
                <span className="mt-1 flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
                  <Globe className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  <select
                    value={zonaId}
                    onChange={(e) => setZonaId(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-black outline-none"
                    aria-label="Time zone"
                  >
                    {ZONA_WAKTU_MARKLO.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.label}
                      </option>
                    ))}
                  </select>
                </span>
                <div
                  className="mt-4 inline-flex rounded-full border border-slate-300 text-xs font-bold"
                  role="group"
                  aria-label="Clock format"
                >
                  <button
                    type="button"
                    onClick={() => setFormat24(false)}
                    aria-pressed={!format24}
                    className={`rounded-l-full px-3 py-1.5 ${!format24 ? 'bg-black text-white' : 'text-black hover:bg-slate-100'}`}
                  >
                    12h
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat24(true)}
                    aria-pressed={format24}
                    className={`rounded-r-full px-3 py-1.5 ${format24 ? 'bg-black text-white' : 'text-black hover:bg-slate-100'}`}
                  >
                    24h
                  </button>
                </div>
              </div>
              {/* Kolom kalender */}
              <div className="border-b border-slate-200 p-6 md:border-b-0 md:border-r">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-black">
                    {NAMA_BULAN[bulan.getMonth()]} {bulan.getFullYear()}
                  </h3>
                  <span className="flex gap-1">
                    <button
                      type="button"
                      disabled={!bisaMundur}
                      onClick={() =>
                        setBulan(new Date(bulan.getFullYear(), bulan.getMonth() - 1, 1))
                      }
                      aria-label="Previous month"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-black transition hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={!bisaMaju}
                      onClick={() =>
                        setBulan(new Date(bulan.getFullYear(), bulan.getMonth() + 1, 1))
                      }
                      aria-label="Next month"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-black transition hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400">
                  {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((h) => (
                    <span key={h}>{h}</span>
                  ))}
                </div>
                <div className="mt-1 grid grid-cols-7 gap-1">
                  {selKalender.map((d, i) => {
                    if (!d) return <span key={`kosong-${i}`} />;
                    const kunci = kunciTanggal(d);
                    const lewat = d.getTime() < hariIni.getTime();
                    const aktif = tanggalDipilih === kunci;
                    return (
                      <button
                        key={kunci}
                        type="button"
                        disabled={lewat}
                        onClick={() => pilihTanggal(d)}
                        aria-pressed={aktif}
                        aria-label={labelTanggal(kunci)}
                        className={`flex h-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                          aktif
                            ? 'bg-mk-aksen text-white shadow'
                            : lewat
                              ? 'cursor-not-allowed text-slate-300'
                              : 'text-black hover:bg-slate-100'
                        }`}
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-slate-400">
                  {tanggalDipilih
                    ? `Selected: ${labelTanggal(tanggalDipilih)}`
                    : 'Select a date to see available times.'}
                </p>
              </div>
              {/* Kolom slot + Next */}
              <div className="flex flex-col p-6">
                <h3 className="text-base font-extrabold text-black">Available times</h3>
                {tanggalDipilih ? (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {SLOT_BOOKING_MENIT.map((slot) => {
                      const tampil = formatSlot(slot + geserMenit, format24);
                      const aktif = slotDipilih === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSlotDipilih(slot)}
                          aria-pressed={aktif}
                          className={`rounded-lg border px-2 py-2 text-sm font-semibold transition ${
                            aktif
                              ? 'border-mk-aksen bg-mk-aksen text-white shadow'
                              : 'border-slate-300 text-black hover:border-black'
                          }`}
                        >
                          {tampil}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-relaxed text-slate-400">
                    Pick a date first — time slots will appear here.
                  </p>
                )}
                <button
                  type="button"
                  disabled={tanggalDipilih === null || slotDipilih === null}
                  onClick={() => setTahap('form')}
                  className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-mk-aksen px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-mk-aksen-gelap disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          ) : tahap === 'form' ? (
          <div className="mx-auto mt-12 max-w-xl rounded-[20px] bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8">
            <p className="text-sm font-semibold text-slate-500">
              {ringkasanSlot} · 30 Min Meeting · Video call
            </p>
            <h3 className="mt-2 text-xl font-extrabold text-black">
              Isi detail kamu
            </h3>
            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="booking-nama"
                  className="block text-sm font-bold text-black"
                >
                  Nama *
                </label>
                <input
                  id="booking-nama"
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama kamu"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-black outline-none focus:border-black"
                />
                {galatField.nama && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {galatField.nama}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="booking-perusahaan"
                  className="block text-sm font-bold text-black"
                >
                  Perusahaan
                </label>
                <input
                  id="booking-perusahaan"
                  type="text"
                  value={perusahaan}
                  onChange={(e) => setPerusahaan(e.target.value)}
                  placeholder="Perusahaan / institusi (opsional)"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-black outline-none focus:border-black"
                />
              </div>
              <div>
                <label
                  htmlFor="booking-kontak"
                  className="block text-sm font-bold text-black"
                >
                  Kontak *
                </label>
                <input
                  id="booking-kontak"
                  type="tel"
                  value={kontak}
                  onChange={(e) => setKontak(e.target.value)}
                  placeholder="Nomor WhatsApp / telepon"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-black outline-none focus:border-black"
                />
                {galatField.kontak && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {galatField.kontak}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="booking-email"
                  className="block text-sm font-bold text-black"
                >
                  Email *
                </label>
                <input
                  id="booking-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email kamu"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-black outline-none focus:border-black"
                />
                {galatField.email && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {galatField.email}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="booking-topik"
                  className="block text-sm font-bold text-black"
                >
                  Topik *
                </label>
                <textarea
                  id="booking-topik"
                  value={topik}
                  onChange={(e) => setTopik(e.target.value)}
                  placeholder="Topik yang ingin dibahas"
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-black outline-none focus:border-black"
                />
                {galatField.topik && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {galatField.topik}
                  </p>
                )}
              </div>
            </div>
            {galatKirim && (
              <p className="mt-4 rounded-xl bg-red-50 p-4 text-xs leading-relaxed text-red-800 ring-1 ring-red-200">
                {galatKirim}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={kirim}
                disabled={mengirim}
                className="inline-flex items-center gap-2 rounded-full bg-mk-aksen px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-mk-aksen-gelap disabled:cursor-not-allowed disabled:opacity-40"
              >
                {mengirim ? 'Mengirim...' : 'Kirim permintaan'}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setTahap('pilih')}
                className="rounded-full border-2 border-black px-6 py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
              >
                Kembali
              </button>
            </div>
          </div>
          ) : (
          <div className="mx-auto mt-12 max-w-xl rounded-[20px] bg-white p-6 text-center shadow-xl ring-1 ring-slate-200 sm:p-8">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-xl font-extrabold text-black">
              Permintaan terkirim
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              Permintaan free call kamu untuk {ringkasanSlot} sudah terkirim.
              Operator RRI akan menghubungimu untuk konfirmasi.
            </p>
            <button
              type="button"
              onClick={ulang}
              className="mt-6 rounded-full border-2 border-black px-6 py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
            >
              Pilih jadwal lain
            </button>
          </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/* ================= Testimonials ================= */

function Testimoni() {
  const unggulan = TESTIMONI_MARKLO.find((t) => t.unggulan);
  const biasa = TESTIMONI_MARKLO.filter((t) => !t.unggulan);
  return (
    <section id="testimonials" className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <p className="mx-auto max-w-2xl text-xl font-semibold italic leading-relaxed text-slate-500 sm:text-2xl">
              &ldquo;Growth is not luck. It is a system — and we build it with
              you.&rdquo;
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-mk-aksen px-4 py-1.5 text-sm font-bold text-white shadow">
              <Star className="h-4 w-4 fill-current" aria-hidden="true" />
              #1 Radio with the Widest Network in Indonesia
            </p>
            <div className="mt-8">
              <LabelPill>Testimonial</LabelPill>
              <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-black sm:text-5xl">
                Why everyone&apos;s talking about our service
              </h2>
            </div>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {unggulan && (
            <Reveal className="md:col-span-2 lg:col-span-1">
              <article className="flex h-full flex-col rounded-[20px] bg-mk-aksen p-7 text-white shadow-lg">
                <BintangLima pembungkus="text-white" />
                <p className="mt-4 flex-1 text-base font-medium leading-relaxed">
                  &ldquo;{unggulan.kutipan}&rdquo;
                </p>
                <footer className="mt-6 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-sm font-extrabold ring-2 ring-white/40">
                    {unggulan.inisial}
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold">{unggulan.nama}</span>
                    <span className="block text-xs text-white/80">{unggulan.peran}</span>
                  </span>
                </footer>
              </article>
            </Reveal>
          )}
          {biasa.map((t, i) => (
            <Reveal key={t.nama} tunda={(i % 3) * 120}>
              <article className="flex h-full flex-col rounded-[20px] bg-white p-7 shadow-md ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
                <BintangLima />
                <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
                  &ldquo;{t.kutipan}&rdquo;
                </p>
                <footer className="mt-6 flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${t.gradien} text-sm font-extrabold text-black/70 ring-2 ring-white`}
                  >
                    {t.inisial}
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold text-black">{t.nama}</span>
                    <span className="block text-xs text-slate-500">{t.peran}</span>
                  </span>
                </footer>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= FAQ ================= */

function Faq() {
  const [terbuka, setTerbuka] = useState(0);
  return (
    <section id="faq" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <LabelPill>FAQ</LabelPill>
            <h2 className="mx-auto mt-5 text-3xl font-extrabold leading-tight tracking-tight text-black sm:text-5xl">
              No more confusion - just answers
            </h2>
          </div>
        </Reveal>
        <div className="mt-10 space-y-4">
          {FAQ_MARKLO.map((item, i) => {
            const aktif = terbuka === i;
            return (
              <Reveal key={item.q} tunda={i * 80}>
                <div
                  className={`overflow-hidden rounded-[20px] shadow-md transition ${
                    aktif ? 'bg-mk-aksen text-white' : 'bg-white text-black ring-1 ring-slate-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setTerbuka(aktif ? -1 : i)}
                    aria-expanded={aktif}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  >
                    <span className="text-base font-extrabold">{item.q}</span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                        aktif ? 'bg-white/20 text-white' : 'bg-slate-100 text-black'
                      }`}
                      aria-hidden="true"
                    >
                      {aktif ? '−' : '+'}
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ${
                      aktif ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p
                        className={`px-5 pb-5 text-sm leading-relaxed ${
                          aktif ? 'text-white/90' : 'text-slate-500'
                        }`}
                      >
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================= Footer ================= */

function Footer() {
  return (
    <footer className="relative bg-white">
      {/* Tepi atas bergelombang (SVG) menuju section gelap */}
      <svg
        className="block w-full text-[#0D2569]"
        viewBox="0 0 1440 70"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,40 C240,70 480,10 720,35 C960,60 1200,15 1440,40 L1440,70 L0,70 Z"
          fill="currentColor"
        />
      </svg>
      <div className="bg-gradient-to-b from-[#0D2569] to-[#04122e] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="mt-5 flex items-center gap-3">
              {/* Logo dibuat putih khusus footer (permintaan eksplisit
                  pengguna 2026-11-17): kedua logo PNG berlatar
                  transparan, jadi filter brightness(0) invert(1)
                  mengubah semua piksel menjadi putih. Logo di header
                  dan tempat lain TIDAK memakai filter ini. */}
              <img
                src={LOGO_RRI_LANDING_DATA_URI}
                alt="Radio Republik Indonesia"
                className="h-10 w-auto shrink-0 [filter:brightness(0)_invert(1)]"
              />
              <img
                src={LOGO_DEALS_DATA_URI}
                alt="Deals"
                className="h-10 w-auto shrink-0 [filter:brightness(0)_invert(1)]"
              />
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
              The partnership portal of Lembaga Penyiaran Publik Radio
              Republik Indonesia — advertising, events, programmes, rooms, and
              land, across Indonesia.
            </p>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
              Back to top
            </button>
          </div>
          <nav aria-label="Footer navigation">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/50">
              Navigation
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { label: 'About', id: 'about' },
                { label: 'Service', id: 'services' },
                { label: 'Testimonials', id: 'testimonials' },
                { label: 'Process', id: 'process' },
                { label: 'Book a Free Call', id: 'booking' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => gulirKe(item.id)}
                    className="text-white/80 transition hover:text-white hover:underline"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
            <h3 className="mt-8 text-sm font-bold uppercase tracking-widest text-white/50">
              Socials
            </h3>
            <ul className="mt-4 flex gap-2">
              {/* Tautan media sosial RESMI RRI (pengguna 2026-11-17) —
                  dibuka di tab baru. Twitter template tidak dipakai. */}
              {[
                {
                  label: 'LinkedIn',
                  Ikon: Linkedin,
                  href: 'https://www.linkedin.com/company/6777005/',
                },
                {
                  label: 'Facebook',
                  Ikon: Facebook,
                  href: 'https://www.facebook.com/p/Radio-Republik-Indonesia-100079994898112',
                },
                {
                  label: 'Instagram',
                  Ikon: Instagram,
                  href: 'https://www.instagram.com/rri_official/',
                },
              ].map(({ label, Ikon, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white/80 transition hover:bg-white hover:text-black"
                  >
                    <Ikon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {/* Kolom Our Service — di antara Navigation dan Contact
              (permintaan pengguna 2026-11-17). Untuk sementara keempat
              link mengarah ke section booking/konsultasi, karena halaman
              khusus Plan a Campaign / Book a Venue / Rent a Space /
              Get a Journalism Training belum ada di landing baru;
              halaman khusus menyusul pada putaran penyesuaian. */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/50">
              Our Service
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { label: 'Plan a Campaign', id: 'booking' },
                { label: 'Book a Venue', id: 'booking' },
                { label: 'Rent a Space', id: 'booking' },
                { label: 'Get a Journalism Training', id: 'booking' },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => gulirKe(item.id)}
                    className="text-white/80 transition hover:text-white hover:underline"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/50">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/50" aria-hidden="true" />
                Jl. Medan Merdeka Barat No. 4–5, Jakarta Pusat, DKI Jakarta 10110
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/50" aria-hidden="true" />
                <a href="tel:+62213500584" className="transition hover:text-white hover:underline">
                  +62 21 350 0584
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/50" aria-hidden="true" />
                <a href="tel:+62213511086" className="transition hover:text-white hover:underline">
                  +62 21 351 1086
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-white/50" aria-hidden="true" />
                08:00–16:00 WIB
              </li>
            </ul>
            <button
              type="button"
              onClick={() => gulirKe('booking')}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-mk-aksen px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-mk-aksen-gelap"
            >
              Book 30 Min Free Call
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="border-t border-white/10">
          <p className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-white/50 sm:px-6">
            © 2026 LPP RRI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

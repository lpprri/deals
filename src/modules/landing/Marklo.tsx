// Landing page publik — tiruan template agency "Marklo"
// (PR landing-marklo-clone, 2026-11-17).
// (PR landing-footer-navy-putih, 2026-11-17: footer gradien navy RRI
// #0D2569 (bukan maroon), logo RRI + Deals di footer dibuat putih,
// kolom "Site Map" / "What to Do", header
// seamless tanpa garis bawah.
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
//   - Kolom footer (revisi pengguna 2026-11-21 17:57 WIB): "Site Map"
//     (navigasi section), "What to Do" (Plan a Campaign → halaman Plan a
//     Campaign via prop onPlanCampaign — pindah dari kolom "Client Portal"
//     yang DIHAPUS; Book a Venue → halaman Book a Venue via prop
//     onBookVenue, Rent a Space → halaman Rent a Space via prop
//     onRentSpace; "Join our Event" membuka halaman "Coming Soon" via prop
//     onComingSoon). Kolom "Client Portal" DIHAPUS — "Track your Deal"
//     ikut hilang dari footer; halaman Lacak tetap ada (App.tsx, state
//     'lacak') tapi tanpa lagi tombol masuk dari landing.
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
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Activity,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Facebook,
  Globe,
  Handshake,
  Instagram,
  Languages,
  Linkedin,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Monitor,
  Moon,
  Phone,
  Star,
  Sun,
  User,
  Video,
  X,
} from 'lucide-react';
import type { DummyUser } from '../../lib/dummyUsers';
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
import { IKON_MANFAAT } from '../../lib/ikonManfaat';
import type { BookingPublikInput } from '../../lib/store';

export interface MarkloLandingProps {
  /** Buka halaman login Operator (infrastruktur aplikasi). */
  onLogin: () => void;
  /** Pengguna yang sedang login (null bila belum login) — panel Profil
      menampilkan keadaan login bila ada, keadaan tamu bila tidak.
      Landing hanya di-render saat belum login (App.tsx: `if (!user)`),
      jadi keadaan login di sini disiapkan untuk pemakaian mendatang. */
  pengguna?: DummyUser | null;
  /** Keluar dari sesi (App.tsx: tanganiKeluar). */
  onLogout?: () => void;
  /** Buka modul admin ('master' = Master Data & Users, 'audit' = Audit)
      dari panel Profil saat sudah login. */
  onBukaModul?: (modul: 'master' | 'audit') => void;
  /** Buka halaman "Coming Soon" publik — dipakai SATU item footer
      "What to Do" ("Join our Event"; pola persis onLogin; permintaan
      pengguna 2026-11-18 21:19–21:21 WIB — BUKAN ke kartu booking). */
  onComingSoon: () => void;
  /** Buka halaman "Book a Venue" publik (daftar venue + form booking) —
      dipakai item footer "Book a Venue" (pola persis onLacak;
      permintaan pengguna 2026-11-21 10:52 WIB). */
  onBookVenue: () => void;
  /** Buka halaman "Rent a Space" publik (daftar lahan + form inquiry) —
      dipakai item footer "Rent a Space" (pola persis onLacak;
      permintaan pengguna 2026-11-21 10:52 WIB). */
  onRentSpace: () => void;
  /** Buka halaman "Plan a Campaign" publik (form Tally embed) —
      dipakai item footer "Plan a Campaign" (What to Do, pindah dari
      Client Portal 2026-11-21) dan keempat kotak layanan (pola persis
      onLogin; permintaan pengguna 2026-11-19 08:51–08:54 WIB — BUKAN
      lagi gulir ke kartu booking). */
  onPlanCampaign: () => void;
  /** Buka halaman "Partner with RRI" publik — dipakai pill footer
      "Partner with RRI" (2026-11-21; sebelumnya pill ini memanggil
      onPlanCampaign sebagai tujuan sementara). */
  onPartnerWithRri: () => void;
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
    pemicunya lebih dalam di viewport; pemakaian lain tetap default.
    DUA ARAH (perbaikan 19/11/2026 20:25 WIB — laporan pengguna:
    animasi hanya jalan saat scroll-down, tidak saat scroll-up):
    observer TIDAK disconnect setelah tampil pertama; keluar viewport
    (ke arah mana pun) menghapus mk-tampil sehingga masuk lagi memutar
    animasi dari awal. Sebelumnya sekali tampil + disconnect, jadi
    scroll-up tidak pernah menganimasikan ulang. */
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
        // Dua arah: tampil saat masuk viewport, sembunyi lagi saat
        // keluar — masuk ulang (scroll-down maupun scroll-up) memutar
        // animasi dari awal. Jangan disconnect di sini; observer hanya
        // dilepas saat komponen di-unmount (cleanup di bawah).
        setTampil(entri[0].isIntersecting);
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

export default function MarkloLanding({ onLogin, pengguna, onLogout, onBukaModul, onComingSoon, onPlanCampaign, onPartnerWithRri, onBookVenue, onRentSpace, onKirimBooking }: MarkloLandingProps) {
  // Kembali ke landing dari halaman publik yang di-scroll: SPA
  // mempertahankan posisi scroll window, jadi landing mendarat di
  // tengah halaman. Scroll ke atas saat mount (perintah user
  // 2026-11-21 13:18 WIB "lanjutkan" — kelanjutan perbaikan
  // scroll-to-top 7 halaman publik di PR #127).
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);
  return (
    <div className="min-h-screen bg-white text-black">
      <Header onLogin={onLogin} pengguna={pengguna} onLogout={onLogout} onBukaModul={onBukaModul} />
      <main>
        <Hero />
        <MarqueeKampanye />
        <Pernyataan />
        <Statistik />
        <Proses />
        <Layanan onPlanCampaign={onPlanCampaign} />
        <Perbandingan />
        <MengapaMarketing />
        <BookingKonsultasi onKirimBooking={onKirimBooking} />
        <Testimoni />
        <Faq />
      </main>
      <Footer onComingSoon={onComingSoon} onPlanCampaign={onPlanCampaign} onPartnerWithRri={onPartnerWithRri} onBookVenue={onBookVenue} onRentSpace={onRentSpace} />
    </div>
  );
}

/* ================= Header ================= */

/** Baris Bahasa & Tema di panel Profil — TAMPIL DULU (pilihan pengguna
    2026-11-23): menampilkan pengaturan saat ini, belum bisa diganti.
    Menggantinya butuh terjemahan landing (ID/EN) + mode gelap penuh
    untuk seluruh landing — dua pekerjaan besar yang diparkir 2026-11-22. */
function BarisBahasaTema() {
  return (
    <>
      <div className="flex items-center gap-3 px-3 py-2">
        <Languages className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        <span className="text-sm font-medium text-slate-700">Bahasa</span>
        <span className="ml-auto text-sm text-slate-500">English</span>
      </div>
      <div className="flex items-center gap-3 px-3 py-2">
        <Sun className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        <span className="text-sm font-medium text-slate-700">Tema</span>
        <span className="ml-auto flex items-center gap-0.5 rounded-full border border-slate-200 p-0.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white">
            <Sun className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400">
            <Moon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400">
            <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </span>
      </div>
    </>
  );
}

function Header({
  onLogin,
  pengguna,
  onLogout,
  onBukaModul,
}: {
  onLogin: () => void;
  pengguna?: DummyUser | null;
  onLogout?: () => void;
  onBukaModul?: (modul: 'master' | 'audit') => void;
}) {
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const [menuMobileTerbuka, setMenuMobileTerbuka] = useState(false);
  const [menuProfilTerbuka, setMenuProfilTerbuka] = useState(false);
  const [sudahScroll, setSudahScroll] = useState(false);
  useEffect(() => {
    const perbarui = () => setSudahScroll(window.scrollY > 24);
    perbarui();
    window.addEventListener('scroll', perbarui, { passive: true });
    return () => window.removeEventListener('scroll', perbarui);
  }, []);
  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,backdrop-filter] duration-500 ease-in-out ${sudahScroll ? 'bg-transparent' : 'bg-white/90 backdrop-blur'}`}
    >
      <div
        className={`mx-auto flex items-center gap-4 px-4 py-2 transition-[max-width,margin-top,gap] duration-500 ease-in-out sm:px-6 sm:py-3 ${sudahScroll ? 'mt-2 max-w-[360px] gap-2 sm:max-w-[460px] md:max-w-[640px]' : 'max-w-7xl'}`}
      >

        <div className="relative md:hidden">
          <button
            type="button"
            onClick={() => {
              setMenuProfilTerbuka(false);
              setMenuMobileTerbuka(!menuMobileTerbuka);
            }}
            aria-label="Menu"
            aria-haspopup="true"
            aria-expanded={menuMobileTerbuka}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-black text-black transition hover:bg-black hover:text-white sm:h-10 sm:w-10"
          >
            {menuMobileTerbuka ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
          {menuMobileTerbuka && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuMobileTerbuka(false)}
                className="fixed inset-0 z-40 cursor-default"
              />
              <div className="absolute left-0 z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setMenuMobileTerbuka(false);
                    gulirKe('atas');
                  }}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-mk-aksen"
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuMobileTerbuka(false);
                    gulirKe('about');
                  }}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-mk-aksen"
                >
                  About
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuMobileTerbuka(false);
                    gulirKe('services');
                  }}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-mk-aksen"
                >
                  Service
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuMobileTerbuka(false);
                    gulirKe('testimonials');
                  }}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-mk-aksen"
                >
                  Testimonials
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuMobileTerbuka(false);
                    gulirKe('process');
                  }}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-mk-aksen"
                >
                  Process
                </button>
              </div>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => gulirKe('atas')}
          className="flex min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 shadow-sm backdrop-blur max-md:mx-auto sm:px-3 sm:py-1.5"
          aria-label="RRI Deals — back to top"
        >
          <img
            src={LOGO_RRI_LANDING_DATA_URI}
            alt="Radio Republik Indonesia"
            className="h-7 w-auto shrink-0 sm:h-9"
          />
          <img
            src={LOGO_DEALS_DATA_URI}
            alt="Deals"
            className="h-7 w-auto shrink-0 sm:h-9"
          />
        </button>

        <div
          className={`hidden justify-center transition-[flex-grow] duration-500 ease-in-out md:flex ${sudahScroll ? 'grow-0' : 'grow'}`}
        >
          <nav aria-label="Main navigation" className="relative">
            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-2 py-1 shadow-sm backdrop-blur">
              <button
                type="button"
                onClick={() => gulirKe('atas')}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-mk-aksen"
              >
                Home
              </button>
              <span aria-hidden="true" className="h-5 w-px bg-slate-200" />
              <button
                type="button"
                onClick={() => {
                  setMenuProfilTerbuka(false);
                  setMenuTerbuka(!menuTerbuka);
                }}
                aria-haspopup="true"
                aria-expanded={menuTerbuka}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-mk-aksen"
              >
                Options
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {menuTerbuka && (
              <>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMenuTerbuka(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />
                <div className="absolute left-1/2 z-50 mt-2 w-48 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuTerbuka(false);
                      gulirKe('about');
                    }}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-mk-aksen"
                  >
                    About
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuTerbuka(false);
                      gulirKe('services');
                    }}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-mk-aksen"
                  >
                    Service
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuTerbuka(false);
                      gulirKe('testimonials');
                    }}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-mk-aksen"
                  >
                    Testimonials
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuTerbuka(false);
                      gulirKe('process');
                    }}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-mk-aksen"
                  >
                    Process
                  </button>
                </div>
              </>
            )}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2">

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setMenuMobileTerbuka(false);
                setMenuTerbuka(false);
                setMenuProfilTerbuka(!menuProfilTerbuka);
              }}
              title="Profile"
              aria-label="Profile"
              aria-haspopup="true"
              aria-expanded={menuProfilTerbuka}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-black text-black transition hover:bg-black hover:text-white sm:h-10 sm:w-10"
            >
              <User className="h-5 w-5" aria-hidden="true" />
            </button>
            {menuProfilTerbuka && (
              <>
                <button
                  type="button"
                  aria-label="Close profile menu"
                  onClick={() => setMenuProfilTerbuka(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />
                <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                  {pengguna ? (
                    <>
                      <div className="px-3 pb-2 pt-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {pengguna.nama}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {pengguna.email ?? ''}
                        </p>
                      </div>
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        type="button"
                        onClick={() => {
                          setMenuProfilTerbuka(false);
                          onBukaModul?.('master');
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-mk-aksen"
                      >
                        <User className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                        Informasi Akun
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuProfilTerbuka(false);
                          onBukaModul?.('audit');
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-mk-aksen"
                      >
                        <Activity className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                        Aktivitas Akun
                      </button>
                      <div className="my-1 border-t border-slate-100" />
                      <BarisBahasaTema />
                      <div className="my-1 border-t border-slate-100" />
                      <button
                        type="button"
                        onClick={() => {
                          setMenuProfilTerbuka(false);
                          onLogout?.();
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-mk-aksen"
                      >
                        <LogOut className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                        Keluar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuProfilTerbuka(false);
                          onLogin();
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-mk-aksen px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-mk-aksen-gelap"
                      >
                        <LogIn className="h-4 w-4" aria-hidden="true" />
                        Login
                      </button>
                      <div className="my-1 border-t border-slate-100" />
                      <BarisBahasaTema />
                    </>
                  )}
                </div>
              </>
            )}
          </div>
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
                { inisial: 'GR', gradien: 'from-blue-400 to-sky-300' },
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

/* ================= Marquee kampanye =================
   Dulu carousel: lompat satu kartu tiap 5 detik + tombol prev/next
   (PR landing-kampanye-marquee). Sekarang marquee kontinu seperti
   strip logo mitra: 7 kartu diduplikasi, animasi CSS linear infinite
   (.mk-marquee-kampanye di src/index.css), tanpa tombol geser.
   Jeda saat hover mengikuti pola marquee logo. */

function MarqueeKampanye() {
  return (
    <section id="work" className="bg-white pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <h2 className="text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
            Campaigns that delivered.
          </h2>
        </Reveal>
        <Reveal tunda={120}>
          <div className="relative mt-8 overflow-hidden py-2">
            <div className="mk-marquee-kampanye flex w-max items-start gap-6">
              {[...KAMPANYE_MARKLO, ...KAMPANYE_MARKLO].map((k, i) => (
                <article
                  key={`${k.klien}-${i}`}
                  aria-hidden={i >= KAMPANYE_MARKLO.length}
                  className="w-[320px] shrink-0 overflow-hidden rounded-[20px] bg-white shadow-lg ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl sm:w-[520px]"
                >
                  <div className="relative h-60 overflow-hidden" aria-hidden="true">
                    <img
                      src={FOTO_KAMPANYE[k.klien]}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-extrabold text-black">{k.klien}</h3>
                      <span className="shrink-0 rounded-full bg-mk-peach px-3 py-1 text-xs font-bold text-mk-aksen">
                        {k.layanan}
                      </span>
                    </div>
                    {/* Deskripsi tampil UTUH tanpa pemotongan — koreksi
                        pengguna 2026-11-19 09:12 WIB: clamp 3 baris dari
                        PR #113 memotong kalimat dengan "...". Deskripsi
                        di luar baris judul+pill supaya memakai lebar penuh
                        kartu (maksimal sampai ujung box); kartu
                        sm:w-[520px] supaya Perempuan Indonesia Maju muat
                        2 baris. Copy byte-identik; tinggi kartu boleh
                        berbeda. */}
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                      {k.ringkasan}
                    </p>
                  </div>
                </article>
              ))}
            </div>
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
        // Dua arah (seperti Reveal di atas, perbaikan 19/11/2026
        // 20:25 WIB): counter jalan ulang tiap kali section masuk
        // viewport, dari arah mana pun — keluar viewport mematikan
        // `terlihat`, masuk lagi memulai useCountUp dari 0.
        setTerlihat(entri[0].isIntersecting);
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
                  ['bg-blue-400', 'bg-sky-400', 'bg-violet-400'][i]
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

/* ================= Services (6 layanan RRI) ================= */

/** Keenam kotak layanan BISA DI-KLIK (permintaan pengguna 2026-11-19
    08:54 WIB): klik membuka halaman "Plan a Campaign" (form Tally
    embed) lewat prop onPlanCampaign (pola onLacak). Kartu memakai
    role="button" + tabIndex + onKeyDown (Enter/Spasi) supaya bisa
    diakses keyboard — <article> dipertahankan (bukan <button>) karena
    isinya blok (h3 + p); kursor pointer + hover naik seperti kartu
    kampanye. Label langkah (PR #91) tetap menggulir ke kartu. */
function Layanan({ onPlanCampaign }: { onPlanCampaign: () => void }) {
  const [sorot, setSorot] = useState<number | null>(null);
  const [lihatLebih, setLihatLebih] = useState(false);
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
            halus ke kartu layanannya + sorot singkat; tampilan tetap.
            Saat "See More" ditekan (perintah pengguna 2026-11-23), baris
            melebar (max-w-5xl) dan keenam label + tombol See Less tersusun
            proporsional dalam satu baris di desktop (lg:flex-nowrap). */}
        <div
          className={`mx-auto mt-12 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-left ${
            lihatLebih ? 'max-w-5xl lg:flex-nowrap' : 'max-w-3xl'
          }`}
        >
          {LAYANAN_MARKLO.map((layanan, i) =>
            i < 4 || lihatLebih ? (
              <button
                key={layanan.nama}
                type="button"
                onClick={() => pilihLayanan(i)}
                aria-label={`View ${layanan.nama} service`}
                className={`cursor-pointer text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mk-aksen sm:text-base ${
                  i === 0 ? 'text-[#2573e2]' : 'text-slate-400'
                }`}
              >
                {layanan.langkah}
              </button>
            ) : null,
          )}
          <button
            type="button"
            onClick={() => setLihatLebih(!lihatLebih)}
            aria-expanded={lihatLebih}
            className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-[#2573e2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mk-aksen sm:text-base"
          >
            {lihatLebih ? 'See Less' : 'See More'}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${lihatLebih ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>
        <div className="mx-auto mt-6 max-w-3xl text-left">
          {LAYANAN_MARKLO.map((layanan, i) => (
            // Kartu di tengah (perintah pengguna 2026-11-23): susunan tangga
            // diagonal template dihapus — kartu tidak lagi
            // bergeser ke kanan per baris, melainkan terpusat di tengah di
            // bawah baris label, supaya saat "See More" ditekan dan teks
            // melebar, kartu tetap di tengah teks yang terkait.
            <div
              key={layanan.nama}
              className="mk-layang"
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
                  role="button"
                  tabIndex={0}
                  aria-label={`Plan a Campaign — ${layanan.nama}`}
                  onClick={onPlanCampaign}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onPlanCampaign();
                    }
                  }}
                  className={`scroll-mt-24 mx-auto max-w-xl cursor-pointer rounded-[20px] bg-gradient-to-br ${layanan.gradien} p-7 shadow-md transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mk-aksen sm:p-8 ${
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
                <div className="flex justify-center" aria-hidden="true">
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
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-mk-aksen">
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
            <article className="h-full rounded-[20px] bg-mk-peach p-7 shadow-lg ring-1 ring-blue-100">
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
          {/* Baris social proof di atas strip logo (permintaan pengguna
              16:42 WIB): teks persis "Trusted by hundreds of companies
              in Indonesia" — bukan "thousands worldwide" seperti template.
              Putih, tebal, rata tengah, di atas marquee. */}
          <p className="mt-12 text-center text-sm font-bold tracking-wide text-white">
            Trusted by hundreds of companies in Indonesia
          </p>
          {/* Fade tepi via MASK (bukan overlay): dua div overlay gradasi
              PR #98 dihapus 2026-11-18 — warnanya tidak pernah sama persis
              dengan latar gradasi diagonal navy di titik itu, sehingga
              terbaca sebagai persegi/bar kaku di ujung strip (laporan
              pengguna 21:30 WIB). Mask membuat LOGO-nya sendiri memudar
              di tepi; latar navy tetap seragam. Definisi di index.css
              (.mk-fade-mask-logo). */}
          <div className="mk-fade-mask-logo relative mt-6 overflow-hidden py-5">
            <div className="mk-marquee flex w-max items-center gap-12">
              {[...LOGO_KLIEN_MARKLO, ...LOGO_KLIEN_MARKLO].map((logo, i) => (
                <span
                  key={`${logo.nama}-${i}`}
                  className="flex shrink-0 items-center"
                >
                  {/* Logo putih langsung di atas navy — TANPA chip putih
                      sejak PR landing-logo-mitra-putih (membalik PR #97). */}
                  <img
                    src={logo.logoDataUri}
                    alt={logo.nama}
                    aria-hidden={i >= LOGO_KLIEN_MARKLO.length}
                    className="h-10 w-auto"
                  />
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= Why Marketing ================= */

/** Pill merah template (#ff4d2e, vermilion asli Marklo) — varian LOKAL
    hanya untuk section ini. LabelPill global TIDAK diubah: section lain
    tetap memakai Biru RRI #2573E2 (PR oren-ke-biru). Merah di sini
    mengikuti template asli atas pilihan pengguna 2026-11-18 ("ikuti
    template asli"); ganti ke Biru RRI bila diminta. Sejak 2026-11-18
    20:21 WIB (permintaan pengguna): tautan "Book a Call" merah sudah
    TIDAK ADA lagi — kartunya ("Higher Conversions") dihapus, jadi merah
    #ff4d2e di section ini hanya tersisa di pill ini. */
function PillMerahTemplate({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#ff4d2e] bg-white px-4 py-1.5 text-sm font-semibold text-[#ff4d2e]">
      {children}
    </span>
  );
}

/** Gaya template ASLI Marklo (PR landing-why-marketing-template,
    pilihan pengguna 2026-11-18; studi jiro.build 19:29 WIB):
    latar section putih, kartu gradien pastel + ikon 3D glossy,
    3 kartu atas (ikon kiri atas, teks kiri bawah) + 1 kartu lebar bawah
    SELEBAR FULL (teks kiri, ikon kanan, tautan kiri bawah).
    Perubahan 2026-11-18 20:21 WIB (permintaan pengguna): kartu
    "Higher Conversions" DIHAPUS (judul + desk + ikon petir + tautan
    "Book a Call" ikut hilang), kartu "Competitive Advantage" menjadi
    selebar full menggantikan posisinya, dan kalimatnya diubah menjadi
    "Stand out from other business in your industry." — persis seperti
    yang pengguna tulis (bukan "businesses"/"websites" template asli;
    bila itu typo, pengguna bisa koreksi). Copy 3 kartu atas, pill,
    heading, dan kartu CTA hitam sama persis seperti sebelumnya.
    Kartu CTA hitam (BUKAN bagian template asli — dari versi restyle)
    dipertahankan sebagai strip full-width DI BAWAH 4 kartu supaya
    layout template tetap murni. Target tautan tetap: "View our case
    study" -> #work (di template asli mengarah ke #testimonials —
    perilaku tidak diubah karena pengguna minta gaya saja).
    Booking tetap bisa dicapai lewat tombol "Book a Free Call" di strip
    CTA hitam, hero, dan footer. */
function MengapaMarketing() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <PillMerahTemplate>Confusion?</PillMerahTemplate>
            <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-black sm:text-5xl">
              Why do you need Marketing?
            </h2>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
          {MANFAAT_MARKLO.map((m, i) =>
            i < 3 ? (
              <Reveal
                key={m.judul}
                tunda={i * 120}
                className="lg:col-span-2"
              >
                <article
                  className={`flex h-full flex-col rounded-[20px] bg-gradient-to-br ${m.gradien} p-7 shadow-md transition hover:-translate-y-1 hover:shadow-lg`}
                >
                  <img
                    src={IKON_MANFAAT[m.judul]}
                    alt=""
                    aria-hidden="true"
                    className="h-24 w-auto self-start sm:h-28"
                  />
                  <div className="mt-auto pt-8">
                    <h3 className="text-lg font-extrabold text-black">
                      {m.judul}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {m.desk}
                    </p>
                  </div>
                </article>
              </Reveal>
            ) : (
              <Reveal
                key={m.judul}
                tunda={(i - 3) * 120}
                className="sm:col-span-2 lg:col-span-6"
              >
                <article
                  className={`flex h-full flex-col gap-6 rounded-[20px] bg-gradient-to-br ${m.gradien} p-7 shadow-md transition hover:-translate-y-1 hover:shadow-lg sm:flex-row`}
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="text-lg font-extrabold text-black">
                      {m.judul}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {m.desk}
                    </p>
                    {m.tautan && (
                      <button
                        type="button"
                        onClick={() => gulirKe(m.tautan!.jangkar.slice(1))}
                        className="mt-auto inline-flex items-center gap-1.5 self-start pt-4 text-sm font-bold text-black hover:underline"
                      >
                        {m.tautan.label}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <img
                    src={IKON_MANFAAT[m.judul]}
                    alt=""
                    aria-hidden="true"
                    className="h-28 w-auto shrink-0 self-center sm:h-32"
                  />
                </article>
              </Reveal>
            ),
          )}
        </div>
        <Reveal tunda={240} className="mt-6">
          <article className="flex flex-col gap-4 rounded-[20px] bg-black p-7 text-white shadow-md sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-2xl font-extrabold leading-snug">
                Still not sure where to start?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Book a free 30-minute call and we will audit your funnel together.
              </p>
            </div>
            <button
              type="button"
              onClick={() => gulirKe('booking')}
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-mk-aksen px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-mk-aksen-gelap sm:self-center"
            >
              Book a Free Call
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </article>
        </Reveal>
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

/**
 * Kartu booking "Book a Free Call" — diekspor (dua peran 19/11/2026)
 * supaya Client Portal memakai kartu yang SAMA (bukan salinan):
 * kalender + slot 30 menit + form singkat, zona WIB/WITA/WIT.
 */
export function BookingKonsultasi({
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

function Footer({ onComingSoon, onPlanCampaign, onPartnerWithRri, onBookVenue, onRentSpace }: { onComingSoon: () => void; onPlanCampaign: () => void; onPartnerWithRri: () => void; onBookVenue: () => void; onRentSpace: () => void }) {
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
            {/* Tombol "Partner with RRI" (perintah user 2026-11-21 16:20 WIB,
                contoh Traveloka): pill biru RRI di sebelah "Back to top",
                membuka halaman "Partner with RRI" (2026-11-21; sebelumnya
                pill ini memanggil onPlanCampaign sebagai tujuan
                sementara). */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
              >
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
                Back to top
              </button>
              <button
                type="button"
                onClick={onPartnerWithRri}
                className="inline-flex items-center gap-2 rounded-full bg-[#2573e2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0d2569]"
              >
                <Handshake className="h-4 w-4" aria-hidden="true" />
                Partner with RRI
              </button>
            </div>
          </div>
          <nav aria-label="Footer navigation">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/50">
              Site Map
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { label: 'About', id: 'about' },
                { label: 'Service', id: 'services' },
                { label: 'Testimonials', id: 'testimonials' },
                { label: 'Process', id: 'process' },
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
          {/* Kolom What to Do — judul "Our Service" diubah jadi "What to
              Do" atas permintaan pengguna 2026-11-21 18:27 WIB; "Plan a
              Campaign" pindah ke sini dari kolom portal klien yang DIHAPUS
              (item pertama). Empat item: Plan a Campaign → halaman Plan a
              Campaign via onPlanCampaign; Book a Venue → onBookVenue,
              Rent a Space → onRentSpace; "Join our Event" membuka halaman
              "Coming Soon" via onComingSoon — BUKAN ke kartu booking. */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/50">
              What to Do
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { label: 'Plan a Campaign', onClick: onPlanCampaign },
                { label: 'Book a Venue', onClick: onBookVenue },
                { label: 'Rent a Space', onClick: onRentSpace },
                { label: 'Join our Event', onClick: onComingSoon },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={item.onClick}
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

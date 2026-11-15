// Shell landing page publik "Partnership LPP RRI" (halaman depan, tanpa login).
//
// Struktur HALAMAN TERPISAH per section (keputusan pengguna 2026-11-15):
//   Header (sticky) + Footer dipakai bersama semua halaman; <main> hanya
//   me-render SATU halaman sesuai `halamanLanding` — Home hanya menampilkan
//   Hero (tanpa section lain yang bertumpuk). Navigasi header/footer
//   memanggil `onNavigasiLanding(halaman)`; "Lacak" membuka halaman Track
//   yang sudah ada (src/modules/Lacak.tsx) lewat `onTrack`; "Hubungi Kami"
//   membuka halaman Tentang lalu menggulir ke kartu kontak (jangkar).
//   Halaman: beranda (Hero) | layanan (Our Service + Book a Room +
//   Rent a Space) | kolaborasi | tentang (About Us: Profile, Contact,
//   Clients) | cara (How It Works) | faq. Banner CTA tampil di semua
//   halaman landing, sebelum footer.
// Section Layanan, Kolaborasi, dan Tentang dibuat worker lain secara
// paralel (src/modules/landing/Layanan.tsx, Kolaborasi.tsx, Tentang.tsx);
// file ini hanya mengimpor dan merangkainya, serta meneruskan kamus `t` +
// callback.
//
// Bahasa: dual ID/EN dengan toggle di header, default Bahasa Indonesia
// (keputusan pengguna 2026-11-15). Pilihan disimpan di localStorage
// ('rri-bahasa-landing') agar tetap terpilih saat pengguna membuka form
// pengajuan/Lacak lalu kembali ke beranda. Dashboard/aplikasi tetap
// Inggris penuh; kamus ini hanya untuk landing page (lihat src/lib/landingI18n.ts).
//
// Data: statistik hero dihitung dari DATA NYATA (prop `data` + daftar
// satker nasional) — tidak ada angka karangan. Foto hero memakai foto
// Gedung Kantor Pusat RRI yang sudah ada (src/lib/gedungRri.ts).
//
// Palet dasar RRI: Biru #2573E2 (aksen), Navy #0D2569 (teks utama +
// section gelap), Putih #FFFFFF (latar). Abu-abu netral (slate) dipakai
// HANYA untuk teks sekunder — bukan warna aksen baru.

import { useEffect, useState } from 'react';
import type { AppData } from '../lib/types';
import { DAFTAR_SATKER } from '../lib/satker';
import { GEDUNG_RRI_DATA_URI } from '../lib/gedungRri';
import { LOGO_RRI_LANDING_DATA_URI } from '../lib/logoRriLanding';
import { LOGO_DEALS_DATA_URI } from '../lib/logoDeals';
import {
  KAMUS,
  type BahasaLanding,
  type KamusLanding,
} from '../lib/landingI18n';
import LayananSection from './landing/Layanan';
import KolaborasiSection from './landing/Kolaborasi';
import TentangSection from './landing/Tentang';

/** Callback pengajuan yang sama dipakai semua section landing page. */
export type OnAjukanLanding = (
  jenisAwal: 'Pengajuan Kerja Sama' | 'Media Order' | 'Permohonan Sewa',
  judulAwal: string,
  uraianAwal: string,
) => void;

/** Satu halaman landing yang ditampilkan di <main> (halaman terpisah). */
export type HalamanLanding =
  | 'beranda'
  | 'layanan'
  | 'kolaborasi'
  | 'tentang'
  | 'cara'
  | 'faq';

export interface BerandaProps {
  data: AppData;
  onLogin: () => void;
  onTrack: () => void;
  onAjukan: OnAjukanLanding;
  halamanLanding: HalamanLanding;
  jangkarLanding: string | null;
  onNavigasiLanding: (halaman: HalamanLanding, jangkar?: string) => void;
}

export default function Beranda({
  data,
  onLogin,
  onTrack,
  onAjukan,
  halamanLanding,
  jangkarLanding,
  onNavigasiLanding,
}: BerandaProps) {
  // Pilihan bahasa disimpan di localStorage agar tidak reset ke ID saat
  // pengguna membuka form pengajuan/Lacak lalu kembali ke beranda.
  const [bahasa, setBahasa] = useState<BahasaLanding>(() => {
    try {
      const tersimpan = localStorage.getItem('rri-bahasa-landing');
      return tersimpan === 'en' || tersimpan === 'id' ? tersimpan : 'id';
    } catch {
      return 'id';
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('rri-bahasa-landing', bahasa);
    } catch {
      // Penyimpanan tidak tersedia (mode privat, dsb.) — abaikan saja.
    }
  }, [bahasa]);

  // "Hubungi Kami" membuka halaman Tentang lalu menggulir ke kartu kontak.
  useEffect(() => {
    if (!jangkarLanding) return;
    document.getElementById(jangkarLanding)?.scrollIntoView({ behavior: 'smooth' });
  }, [halamanLanding, jangkarLanding]);

  // Item nav halaman aktif ditandai biru + tebal (rasa "tab").
  const kelasNav = (aktif: boolean) =>
    aktif ? 'font-bold text-[#2573e2]' : 'hover:text-[#2573e2]';
  const t: KamusLanding = KAMUS[bahasa];

  // Statistik hero — DATA NYATA, dihitung dari prop + master satker.
  // Satker bernomor = 69 (DAFTAR_SATKER no !== null); klien/kontrak =
  // panjang array data aplikasi (seed nyata Palembang: 33 klien,
  // 42 kontrak — berubah mengikuti data Firestore setelah go-live).
  const jumlahSatker = DAFTAR_SATKER.filter((s) => s.no !== null).length;
  const jumlahKlien = data.klien.length;
  const jumlahKontrak = data.kontrak.length;

  const langkahCaraKerja = [
    { nomor: '1', judul: t.caraLangkah1Judul, desk: t.caraLangkah1Desk },
    { nomor: '2', judul: t.caraLangkah2Judul, desk: t.caraLangkah2Desk },
    { nomor: '3', judul: t.caraLangkah3Judul, desk: t.caraLangkah3Desk },
  ];

  const faq = [
    { q: t.faq1Q, a: t.faq1A },
    { q: t.faq2Q, a: t.faq2A },
    { q: t.faq3Q, a: t.faq3A },
    { q: t.faq4Q, a: t.faq4A },
  ];

  return (
    <div className="min-h-screen bg-white text-[#0d2569]">
      {/* ---------- Header (sticky, latar putih) ---------- */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => onNavigasiLanding('beranda')}
            className="flex min-w-0 items-center gap-3"
            aria-label="Deals — Beranda"
          >
            <img
              src={LOGO_RRI_LANDING_DATA_URI}
              alt="Radio Republik Indonesia"
              className="h-10 w-auto shrink-0"
            />
            <img
              src={LOGO_DEALS_DATA_URI}
              alt="Deals"
              className="h-10 w-auto shrink-0"
            />
          </button>

          <nav
            aria-label="Navigasi utama"
            className="ml-auto hidden items-center gap-6 text-sm font-medium lg:flex"
          >
            <button
              type="button"
              onClick={() => onNavigasiLanding('beranda')}
              aria-current={halamanLanding === 'beranda' ? 'page' : undefined}
              className={kelasNav(halamanLanding === 'beranda')}
            >
              {t.navBeranda}
            </button>
            <button
              type="button"
              onClick={() => onNavigasiLanding('layanan')}
              aria-current={halamanLanding === 'layanan' ? 'page' : undefined}
              className={kelasNav(halamanLanding === 'layanan')}
            >
              {t.navLayanan}
            </button>
            <button
              type="button"
              onClick={() => onNavigasiLanding('kolaborasi')}
              aria-current={halamanLanding === 'kolaborasi' ? 'page' : undefined}
              className={kelasNav(halamanLanding === 'kolaborasi')}
            >
              {t.navKolaborasi}
            </button>
            <button
              type="button"
              onClick={onTrack}
              className="hover:text-[#2573e2]"
            >
              {t.navLacak}
            </button>
            <button
              type="button"
              onClick={() => onNavigasiLanding('tentang')}
              aria-current={halamanLanding === 'tentang' ? 'page' : undefined}
              className={kelasNav(halamanLanding === 'tentang')}
            >
              {t.navTentang}
            </button>
            <button
              type="button"
              onClick={() => onNavigasiLanding('tentang', 'kontak')}
              className="hover:text-[#2573e2]"
            >
              {t.navKontak}
            </button>
          </nav>

          {/* Toggle bahasa: ID | EN */}
          <div
            className="ml-auto flex shrink-0 items-center rounded-lg border border-slate-300 text-sm font-semibold lg:ml-0"
            role="group"
            aria-label={t.navBahasa}
          >
            <button
              type="button"
              onClick={() => setBahasa('id')}
              aria-pressed={bahasa === 'id'}
              className={`rounded-l-lg px-2.5 py-1.5 ${
                bahasa === 'id'
                  ? 'bg-[#0d2569] text-white'
                  : 'bg-white text-[#0d2569] hover:bg-slate-100'
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => setBahasa('en')}
              aria-pressed={bahasa === 'en'}
              className={`rounded-r-lg px-2.5 py-1.5 ${
                bahasa === 'en'
                  ? 'bg-[#0d2569] text-white'
                  : 'bg-white text-[#0d2569] hover:bg-slate-100'
              }`}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            onClick={onLogin}
            className="shrink-0 rounded-lg bg-[#2573e2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a5fc4]"
          >
            {t.navMasuk}
          </button>
        </div>
      </header>

      <main>
        {/* ---------- Hero — hanya di halaman Home ---------- */}
        {halamanLanding === 'beranda' && (
        <section id="beranda" className="bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-16">
            <div>
              <h1 className="text-3xl font-extrabold leading-tight text-[#0d2569] sm:text-4xl lg:text-5xl">
                {t.heroJudul}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                {t.heroSubjudul}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onAjukan('Pengajuan Kerja Sama', '', '')}
                  className="rounded-lg bg-[#2573e2] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1a5fc4]"
                >
                  {t.heroCtaAjukan}
                </button>
                <button
                  type="button"
                  onClick={onTrack}
                  className="rounded-lg border-2 border-[#0d2569] px-6 py-3 text-sm font-semibold text-[#0d2569] hover:bg-slate-100"
                >
                  {t.heroCtaLacak}
                </button>
              </div>

              {/* Statistik dari data nyata */}
              <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-200 pt-6">
                <div>
                  <dt className="sr-only">{t.heroStatSatker}</dt>
                  <dd className="text-2xl font-extrabold text-[#0d2569] sm:text-3xl">
                    {jumlahSatker}
                  </dd>
                  <dd className="mt-1 text-xs leading-snug text-slate-600 sm:text-sm">
                    {t.heroStatSatker}
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">{t.heroStatKlien}</dt>
                  <dd className="text-2xl font-extrabold text-[#0d2569] sm:text-3xl">
                    {jumlahKlien}
                  </dd>
                  <dd className="mt-1 text-xs leading-snug text-slate-600 sm:text-sm">
                    {t.heroStatKlien}
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">{t.heroStatKontrak}</dt>
                  <dd className="text-2xl font-extrabold text-[#0d2569] sm:text-3xl">
                    {jumlahKontrak}
                  </dd>
                  <dd className="mt-1 text-xs leading-snug text-slate-600 sm:text-sm">
                    {t.heroStatKontrak}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <img
                src={GEDUNG_RRI_DATA_URI}
                alt={
                  bahasa === 'id'
                    ? 'Gedung Kantor Pusat LPP RRI di Jakarta'
                    : 'LPP RRI Head Office building in Jakarta'
                }
                className="h-auto w-full rounded-2xl object-cover shadow-lg"
              />
            </div>
          </div>
        </section>
        )}

        {/* ---------- Services — halaman sendiri ---------- */}
        {halamanLanding === 'layanan' && <LayananSection t={t} onAjukan={onAjukan} />}

        {/* ---------- Collaboration — halaman sendiri ---------- */}
        {halamanLanding === 'kolaborasi' && <KolaborasiSection t={t} onAjukan={onAjukan} />}

        {/* ---------- About Us — halaman sendiri ---------- */}
        {halamanLanding === 'tentang' && <TentangSection t={t} onAjukan={onAjukan} />}

        {/* ---------- Cara Kerja / How It Works — halaman sendiri ---------- */}
        {halamanLanding === 'cara' && (
        <section id="cara-kerja" className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <h2 className="text-center text-2xl font-extrabold text-[#0d2569] sm:text-3xl">
              {t.caraJudul}
            </h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {langkahCaraKerja.map((langkah) => (
                <li
                  key={langkah.nomor}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2573e2] text-base font-extrabold text-white">
                    {langkah.nomor}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-[#0d2569]">
                    {langkah.judul}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {langkah.desk}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        )}

        {/* ---------- FAQ — halaman sendiri ---------- */}
        {halamanLanding === 'faq' && (
        <section id="faq" className="bg-white">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <h2 className="text-center text-2xl font-extrabold text-[#0d2569] sm:text-3xl">
              {t.faqJudul}
            </h2>
            <div className="mt-8 space-y-4">
              {faq.map((item) => (
                <details
                  key={item.q}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <summary className="cursor-pointer text-base font-bold text-[#0d2569]">
                    {item.q}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* ---------- CTA banner (Navy RRI) — di semua halaman landing ---------- */}
        <section className="bg-[#0d2569]">
          <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              {t.ctaJudul}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-white/85">
              {t.ctaDesk}
            </p>
            <button
              type="button"
              onClick={() => onAjukan('Pengajuan Kerja Sama', '', '')}
              className="mt-6 rounded-lg bg-[#2573e2] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1a5fc4]"
            >
              {t.ctaTombol}
            </button>
          </div>
        </section>
      </main>

      {/* ---------- Footer (terang) ---------- */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src={LOGO_RRI_LANDING_DATA_URI}
                alt="Radio Republik Indonesia"
                className="h-10 w-auto shrink-0"
              />
              <img
                src={LOGO_DEALS_DATA_URI}
                alt="Deals"
                className="h-10 w-auto shrink-0"
              />
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">
              {t.footerDesk}
            </p>
          </div>
          <nav aria-label={t.footerLayanan}>
            <h3 className="text-sm font-bold text-[#0d2569]">{t.footerLayanan}</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigasiLanding('layanan')}
                  className="hover:text-[#2573e2]"
                >
                  {t.navLayanan}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigasiLanding('kolaborasi')}
                  className="hover:text-[#2573e2]"
                >
                  {t.navKolaborasi}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onTrack}
                  className="hover:text-[#2573e2]"
                >
                  {t.navLacak}
                </button>
              </li>
            </ul>
          </nav>
          <nav aria-label={t.footerTentang}>
            <h3 className="text-sm font-bold text-[#0d2569]">{t.footerTentang}</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigasiLanding('beranda')}
                  className="hover:text-[#2573e2]"
                >
                  {t.navBeranda}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigasiLanding('tentang')}
                  className="hover:text-[#2573e2]"
                >
                  {t.navTentang}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigasiLanding('tentang', 'kontak')}
                  className="hover:text-[#2573e2]"
                >
                  {t.navKontak}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigasiLanding('cara')}
                  className="hover:text-[#2573e2]"
                >
                  {t.caraJudul}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigasiLanding('faq')}
                  className="hover:text-[#2573e2]"
                >
                  {t.faqJudul}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onLogin}
                  className="hover:text-[#2573e2]"
                >
                  {t.navMasuk}
                </button>
              </li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-slate-200">
          <p className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-slate-600 sm:px-6">
            {t.footerHakCipta}
          </p>
        </div>
      </footer>
    </div>
  );
}

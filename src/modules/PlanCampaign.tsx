// Modul Plan a Campaign — halaman PUBLIK "Plan a Campaign" (tanpa login).
//
// Permintaan pengguna 2026-11-19 08:29–08:33 WIB: fitur ini adalah form
// permintaan quotation terkait iklan — dibangun di Tally (bukan form
// di dalam aplikasi), lalu DI-EMBED di halaman app ini (bukan tab baru).
// Form Tally "Plan a Campaign" (id ArpNAN, PUBLISHED) dibuat Digi via
// API Tally 2026-11-19 08:44 WIB: 29 pertanyaan, 8 kelompok, logika
// tampil C/D/E per layanan, TIDAK menampilkan tarif (dokumen tarif
// status USULAN, belum terkonfirmasi). Jawaban masuk ke Tally, tanpa
// sinkronisasi otomatis ke aplikasi — operator buat Prospect/Offer
// manual.
//
// Embed mengikuti pola React dari dokumentasi Tally
// (developers.tally.so/widgets/examples/react.md): iframe dengan
// data-tally-src + script tally.so/widgets/embed.js + Tally.loadEmbeds()
// di useEffect (sekali muat; fallback isi src iframe langsung bila
// window.Tally tidak tersedia). Judul form disembunyikan di embed
// (hideTitle=1), jadi halaman ini memakai judulnya sendiri.
//
// Gaya mengikuti halaman Lacak (PR #109): kolom tengah ~400px, latar
// off-white #f5f2f2 + gradasi pucat biru/navy di bawah, logo lockup RRI
// lengkap h-20, tombol "Back to Landing Page" di kiri atas.

import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { LOGO_RRI_LOCKUP_DATA_URI } from '../lib/logoRriLockup';

/** Global widget Tally — dimuat dinamis dari tally.so/widgets/embed.js. */
declare const Tally: { loadEmbeds: () => void } | undefined;

/** URL embed form Tally "Plan a Campaign" (id ArpNAN). */
const TALLY_EMBED_SRC =
  'https://tally.so/embed/ArpNAN?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1';

export interface PlanCampaignProps {
  onKembali: () => void;
  /**
   * Label tombol kembali — default "Back to Landing Page" (publik).
   * Client Portal (dua peran 19/11/2026) memakai "Back to Client Portal".
   */
  labelKembali?: string;
}

export default function PlanCampaign({ onKembali, labelKembali }: PlanCampaignProps) {
  // Muat script widget Tally sekali, lalu muat embed (pola React dari
  // dokumentasi Tally — contoh react.md).
  useEffect(() => {
    // Halaman publik dibuka dari footer landing (SPA: posisi gulir
    // window TIDAK reset saat komponen mount) — mulai dari atas.
    window.scrollTo({ top: 0 });

    const widgetScriptSrc = 'https://tally.so/widgets/embed.js';

    const load = () => {
      // Muat embed Tally.
      if (typeof Tally !== 'undefined') {
        Tally.loadEmbeds();
        return;
      }

      // Fallback bila window.Tally tidak tersedia.
      document
        .querySelectorAll('iframe[data-tally-src]:not([src])')
        .forEach((iframeEl) => {
          const el = iframeEl as HTMLIFrameElement;
          if (el.dataset.tallySrc) el.src = el.dataset.tallySrc;
        });
    };

    // Bila Tally sudah dimuat, langsung muat embed.
    if (typeof Tally !== 'undefined') {
      load();
      return;
    }

    // Bila script widget belum dimuat, muat dulu.
    if (document.querySelector(`script[src="${widgetScriptSrc}"]`) === null) {
      const script = document.createElement('script');
      script.src = widgetScriptSrc;
      script.onload = load;
      script.onerror = load;
      document.body.appendChild(script);
      return;
    }
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f2f2] px-4 py-16">
      {/* Gradasi pucat biru/navy di bagian bawah (pola yang sama seperti
          halaman login dan Lacak) — dekoratif saja. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-[#2573e2]/15 via-[#0d2569]/10 to-transparent"
      />

      {/* Tombol sudut kiri atas kembali ke landing page (pola login). */}
      <button
        type="button"
        onClick={onKembali}
        className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-[#0d2569]/15 bg-white/80 px-3 py-2 text-xs font-semibold text-[#0d2569] hover:border-[#2573e2] hover:text-[#2573e2] sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        {labelKembali ?? 'Back to Landing Page'}
      </button>

      {/* Kolom terpusat ~400px (pola login/Lacak). */}
      <div className="relative w-full max-w-[400px]">
        <div className="text-center">
          {/* Logo lockup lengkap RRI (mark + teks di dalam gambar),
              h-20 seperti login dan Lacak. */}
          <img
            src={LOGO_RRI_LOCKUP_DATA_URI}
            alt="Logo RRI"
            className="mx-auto h-20 w-auto"
          />
        </div>

        <h1 className="mt-8 text-center text-3xl font-bold text-[#0d2569]">
          Plan a Campaign
        </h1>
        <p className="mt-2 text-center text-sm text-[#0d2569]/70">
          Request an advertising quotation — fill in your campaign brief
          below.
        </p>

        {/* Form Tally (embed): judul form disembunyikan (hideTitle=1),
            tinggi menyesuaikan isi (dynamicHeight=1). */}
        <div className="mt-6">
          <iframe
            data-tally-src={TALLY_EMBED_SRC}
            loading="lazy"
            width="100%"
            height={200}
            frameBorder={0}
            marginHeight={0}
            marginWidth={0}
            title="Plan a Campaign — advertising quotation request"
          />
        </div>
      </div>
    </div>
  );
}

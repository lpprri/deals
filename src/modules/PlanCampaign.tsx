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
// Gaya mengikuti Book a Venue / Rent a Space (perintah pengguna
// 2026-11-21): latar putih, header panah + logo RRI h-10 di kiri dan
// judul di kanan (tanpa teks kembali yang terlihat); kolom form ~400px
// tetap di tengah.

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
   * Label tombol kembali — dipakai sebagai aria-label (tidak ada teks
   * kembali yang terlihat, pola Book a Venue); default
   * "Back to Landing Page" (publik). Client Portal (dua peran
   * 19/11/2026) memakai "Back to Client Portal".
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
    <div className="relative min-h-screen overflow-x-clip bg-white px-4 py-6">
      <div className="relative mx-auto w-full max-w-7xl">
        {/* Header pola Book a Venue: panah + logo RRI di kiri, judul di kanan. */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onKembali}
              aria-label={labelKembali ?? 'Back to Landing Page'}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#ddd] bg-white text-[#222] transition hover:border-[#0d2569] hover:text-[#0d2569]"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </button>
            <img
              src={LOGO_RRI_LOCKUP_DATA_URI}
              alt="Logo RRI"
              className="h-10 w-auto"
            />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#0d2569]">
            Plan a Campaign
          </h1>
        </header>

        {/* Form Tally (embed): judul form disembunyikan (hideTitle=1),
            tinggi menyesuaikan isi (dynamicHeight=1). */}
        <div className="mx-auto mt-8 w-full max-w-[400px]">
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

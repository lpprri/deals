// Modul Coming Soon — halaman PUBLIK "Coming Soon" (tanpa login).
//
// Permintaan pengguna 2026-11-18 21:19–21:21 WIB: keenam item kolom
// footer "Additional Service" (Book a Venue, Rent a Space, Get a
// Journalism Training, Collaborate with Us, Support our Event, Invite
// as Media Partner) mengarah ke SATU halaman ini — BUKAN ke kartu
// booking. Halaman bergaya login page (PR #99): kolom tengah ~400px,
// latar off-white #f5f2f2 + gradasi pucat biru/navy di bawah, tombol
// "Back to Landing Page" di kiri atas. TANPA LOGO di halaman ini
// (keputusan pengguna 21:21 WIB — jangan pakai lockup RRI maupun
// mark RRI di sini).

import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

export interface ComingSoonProps {
  onKembali: () => void;
  /**
   * Label tombol kembali — default "Back to Landing Page" (publik).
   * Client Portal (dua peran 19/11/2026) memakai "Back to Client Portal".
   */
  labelKembali?: string;
}

export default function ComingSoon({ onKembali, labelKembali }: ComingSoonProps) {
  // Halaman publik dibuka dari footer landing (SPA: posisi gulir window
  // TIDAK reset saat komponen mount) — selalu mulai dari atas.
  useEffect(() => {
    window.scrollTo({ top: 0 });
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

      {/* Kolom terpusat ~400px (pola login). */}
      <div className="relative w-full max-w-[400px] text-center">
        <h1 className="text-3xl font-bold text-[#0d2569]">Coming Soon</h1>
        <p className="mt-2 text-sm text-[#0d2569]/70">
          This service is not available yet — please check back soon.
        </p>
      </div>
    </div>
  );
}

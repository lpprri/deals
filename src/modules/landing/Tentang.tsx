// Section Track & Trace + About Us untuk landing page publik
// "Partnership LPP RRI" (REVISI 2026-11-15: klien TIDAK perlu login/akun).
//
// Track & Trace HANYA mengarahkan ke halaman Track yang sudah ada
// (src/modules/Lacak.tsx) lewat onTrack() — TIDAK membangun ulang halaman
// tracking, TIDAK ada input nomor di section ini, TIDAK ada pencarian
// nama. About Us me-render teks dari kamus landing (landingI18n.ts):
// Profile, Contact Us (identitas dummy + jam layanan), dan Our Clients
// dari registry logo (src/lib/clientLogos.ts — saat ini kosong, jadi
// tampil empty state yang jujur).
//
// Warna: Biru RRI #2573E2 (aksen), Navy #0D2569, Putih #FFFFFF; abu-abu
// netral hanya untuk teks sekunder.

import { ArrowRight, Building2, Clock, Mail, MapPin, Phone } from 'lucide-react';
import type { KamusLanding } from '../../lib/landingI18n';
import { DAFTAR_LOGO_KLIEN } from '../../lib/clientLogos';

export default function Tentang({
  t,
  onTrack,
  onAjukan,
}: {
  t: KamusLanding;
  onTrack: () => void;
  onAjukan: (
    jenisAwal: 'Pengajuan Kerja Sama' | 'Media Order' | 'Permohonan Sewa',
    judulAwal: string,
    uraianAwal: string,
  ) => void;
}) {
  return (
    <>
      {/* --- Track & Trace: tombol menuju halaman Track yang sudah ada --- */}
      <section id="lacak" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-[#0D2569] sm:text-3xl">
              {t.lacakJudul}
            </h2>
            <p className="mt-4 text-base text-slate-600">{t.lacakDesk}</p>
            <button
              type="button"
              onClick={onTrack}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#2573E2] px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-[#1a5fc4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2573E2] focus-visible:ring-offset-2"
            >
              {t.lacakCta}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* --- About Us: Profile, Contact Us, Our Clients --- */}
      <section id="tentang" className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-[#0D2569] sm:text-3xl">
            {t.tentangJudul}
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {/* Profile */}
            <article className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <h3 className="text-lg font-semibold text-[#0D2569]">
                {t.profilJudul}
              </h3>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-slate-600">
                {t.profilIsi}
              </p>
            </article>

            {/* Contact Us */}
            <article
              id="kontak"
              className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"
            >
              <h3 className="text-lg font-semibold text-[#0D2569]">
                {t.kontakJudul}
              </h3>
              <ul className="mt-4 space-y-4 text-base text-slate-600">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#2573E2]" aria-hidden="true" />
                  <span>{t.kontakAlamat}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-1 h-5 w-5 shrink-0 text-[#2573E2]" aria-hidden="true" />
                  <span>
                    {t.kontakTelepon}{' '}
                    <span className="text-sm text-slate-400">{t.kontakContoh}</span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-1 h-5 w-5 shrink-0 text-[#2573E2]" aria-hidden="true" />
                  <span>
                    {t.kontakEmail}{' '}
                    <span className="text-sm text-slate-400">{t.kontakContoh}</span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-1 h-5 w-5 shrink-0 text-[#2573E2]" aria-hidden="true" />
                  <span>{t.kontakJam}</span>
                </li>
              </ul>
              <button
                type="button"
                onClick={() => onAjukan('Pengajuan Kerja Sama', '', '')}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2573E2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a5fc4]"
              >
                {t.heroCtaAjukan}
              </button>
            </article>
          </div>

          {/* Our Clients */}
          <article className="mt-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <h3 className="text-lg font-semibold text-[#0D2569]">
              {t.klienJudul}
            </h3>
            {DAFTAR_LOGO_KLIEN.length > 0 ? (
              <ul className="mt-6 grid grid-cols-2 items-center gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {DAFTAR_LOGO_KLIEN.map((logo) => (
                  <li key={logo.klienId} className="flex items-center justify-center">
                    <img
                      src={logo.logoDataUri}
                      alt={logo.nama}
                      title={logo.nama}
                      className="max-h-16 w-auto max-w-full object-contain"
                      loading="lazy"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 flex flex-col items-center gap-2 py-6 text-center">
                <Building2 className="h-10 w-10 text-slate-300" aria-hidden="true" />
                <p className="text-base font-medium text-slate-500">{t.klienKosong}</p>
                <p className="max-w-md text-sm text-slate-400">{t.klienKosongDesk}</p>
              </div>
            )}
          </article>
        </div>
      </section>
    </>
  );
}

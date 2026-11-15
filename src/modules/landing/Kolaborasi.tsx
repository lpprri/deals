// Section "Collaboration" landing page: 2 kartu (Join Our Event,
// Be Media Partner). Letaknya di antara Services dan Track.
// Semua klik "ajukan" memanggil onAjukan dengan jenis tersimpan
// 'Pengajuan Kerja Sama' — TIDAK ada jenis baru. Form Ajukan sendiri
// yang menerima pre-select lewat prop jenisAwal/judulAwal/uraianAwal.
// "Event" dipindah ke sini dari kartu Support a Program (keputusan
// pengguna 2026-11-15) — kartu itu kini hanya berisi Podcast.
// Latar tint biru muda (#2573E2/5) agar section ini terbedakan dari
// Services dan Track yang berlatar putih.

import type { KamusLanding } from '../../lib/landingI18n';

export default function Kolaborasi({
  t,
  onAjukan,
}: {
  t: KamusLanding;
  onAjukan: (
    jenisAwal: 'Pengajuan Kerja Sama' | 'Media Order' | 'Permohonan Sewa',
    judulAwal: string,
    uraianAwal: string,
  ) => void;
}) {
  const kartu = [
    {
      judulTampil: t.kolaborasiJoinEvent,
      judulInggris: 'Join Our Event',
      deskripsi: t.kolaborasiJoinEventDesk,
      uraianInggris: 'Request to join an RRI event.',
    },
    {
      judulTampil: t.kolaborasiMediaPartner,
      judulInggris: 'Be Media Partner',
      deskripsi: t.kolaborasiMediaPartnerDesk,
      uraianInggris: 'Request to become an RRI media partner.',
    },
  ];

  return (
    <section id="kolaborasi" className="bg-[#2573e2]/5 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-[#0d2569]">
          {t.kolaborasiJudul}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-slate-600">
          {t.kolaborasiSubjudul}
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {kartu.map((kartuItem) => (
            <article
              key={kartuItem.judulInggris}
              className="flex flex-col rounded-xl border border-[#2573e2]/20 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-bold text-[#0d2569]">
                {kartuItem.judulTampil}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {kartuItem.deskripsi}
              </p>
              <div className="mt-auto pt-5">
                <button
                  type="button"
                  onClick={() =>
                    onAjukan(
                      'Pengajuan Kerja Sama',
                      kartuItem.judulInggris,
                      kartuItem.uraianInggris,
                    )
                  }
                  className="w-full rounded-lg bg-[#2573e2] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0d2569]"
                >
                  {t.layananAjukan}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

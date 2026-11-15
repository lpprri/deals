// Section "Our Service" landing page: 5 kartu layanan + Book a Room
// (katalog ruangan DUMMY) + Rent a Space (lahan publik — saat ini
// kosong). Hanya warna RRI: Biru #2573E2, Navy #0D2569, Putih;
// abu-abu netral hanya untuk teks sekunder.
// Semua klik "ajukan" memanggil onAjukan dengan jenis tersimpan
// ('Pengajuan Kerja Sama' | 'Media Order' | 'Permohonan Sewa') —
// TIDAK ada jenis baru. Form Ajukan sendiri (tanpa login) yang
// menerima pre-select lewat prop jenisAwal/judulAwal/uraianAwal.

import { useMemo, useState } from 'react';
import type { KamusLanding } from '../../lib/landingI18n';
import { DAFTAR_SATKER } from '../../lib/satker';
import { formatRupiah, formatTanggal, hariIniIso } from '../../lib/format';
import { DAFTAR_RUANGAN_DUMMY, type RuanganDummy } from '../../lib/rooms';
import { DAFTAR_LAHAN_PUBLIK, type LahanPublik } from '../../lib/spaces';

type JenisPengajuan =
  | 'Pengajuan Kerja Sama'
  | 'Media Order'
  | 'Permohonan Sewa';

export default function Layanan({
  t,
  onAjukan,
}: {
  t: KamusLanding;
  onAjukan: (
    jenisAwal: JenisPengajuan,
    judulAwal: string,
    uraianAwal: string,
  ) => void;
}) {
  // 69 satker bernomor (no !== null); sub-stasiun (SP) tidak ikut
  // dropdown kota.
  const daftarKota = useMemo(
    () => DAFTAR_SATKER.filter((s) => s.no !== null),
    [],
  );

  // --- 5 kartu layanan -------------------------------------------------
  // Nama layanan Inggris di judulAwal ditulis apa adanya (form Ajukan
  // berbahasa Inggris); nama sub-layanan memakai nilai kamus (istilah
  // user apa adanya: Adlibs, Spot Iklan, Greeting, dst).
  const kartuLayanan: {
    judulTampil: string;
    judulInggris: string;
    deskripsi: string;
    jenis: JenisPengajuan;
    sub: string[];
  }[] = [
    {
      judulTampil: t.layananDisplayAds,
      judulInggris: 'Display an Ads',
      deskripsi: t.layananDisplayAdsDesk,
      jenis: 'Media Order',
      sub: [t.layananSubAdlibs, t.layananSubSpot, t.layananSubGreeting],
    },
    {
      judulTampil: t.layananPublishEvent,
      judulInggris: 'Publish an Event',
      deskripsi: t.layananPublishEventDesk,
      jenis: 'Media Order',
      sub: [
        t.layananSubLiveBroadcast,
        t.layananSubLiveReport,
        t.layananSubNewsCoverage,
      ],
    },
    {
      judulTampil: t.layananSupportProgram,
      judulInggris: 'Support a Program',
      deskripsi: t.layananSupportProgramDesk,
      jenis: 'Pengajuan Kerja Sama',
      sub: [t.layananSubPodcast],
    },
    {
      judulTampil: t.layananBookRoom,
      judulInggris: 'Book a Room',
      deskripsi: t.layananBookRoomDesk,
      jenis: 'Permohonan Sewa',
      sub: [
        t.ruanganJenisAuditorium,
        t.ruanganJenisRapat,
        t.ruanganJenisMultipurpose,
        t.ruanganJenisAula,
      ],
    },
    {
      judulTampil: t.layananRentSpace,
      judulInggris: 'Rent a Space',
      deskripsi: t.layananRentSpaceDesk,
      jenis: 'Permohonan Sewa',
      sub: [],
    },
  ];

  // --- Book a Room ------------------------------------------------------
  const [kotaRuangan, setKotaRuangan] = useState('');
  const [ruanganTerpilih, setRuanganTerpilih] =
    useState<RuanganDummy | null>(null);
  const [kegiatan, setKegiatan] = useState('');
  const [tanggal, setTanggal] = useState('');

  const ruanganKota = useMemo(
    () =>
      kotaRuangan === ''
        ? []
        : DAFTAR_RUANGAN_DUMMY.filter((r) => r.kota === kotaRuangan),
    [kotaRuangan],
  );

  const labelJenisRuangan: Record<RuanganDummy['jenis'], string> = {
    Auditorium: t.ruanganJenisAuditorium,
    'Ruang Rapat': t.ruanganJenisRapat,
    'Ruang Multi-Purpose': t.ruanganJenisMultipurpose,
    'Aula/Hall': t.ruanganJenisAula,
  };

  const daftarKegiatan = [
    t.ruanganKegiatanPernikahan,
    t.ruanganKegiatanLomba,
    t.ruanganKegiatanMeeting,
    t.ruanganKegiatanPameran,
    t.ruanganKegiatanLainnya,
  ];

  const ajukanRuangan = () => {
    if (!ruanganTerpilih || kegiatan === '' || tanggal === '') return;
    onAjukan(
      'Permohonan Sewa',
      `Book a Room — ${labelJenisRuangan[ruanganTerpilih.jenis]}`,
      `City: ${kotaRuangan}\nRoom: ${ruanganTerpilih.nama}\nActivity: ${kegiatan}\nDate: ${formatTanggal(tanggal)}`,
    );
  };

  // --- Rent a Space ------------------------------------------------------
  const [kotaLahan, setKotaLahan] = useState('');

  const lahanKota = useMemo(
    () =>
      kotaLahan === ''
        ? []
        : DAFTAR_LAHAN_PUBLIK.filter((l) => l.satker === kotaLahan),
    [kotaLahan],
  );

  const ajukanLahanUmum = () => {
    if (kotaLahan === '') return;
    onAjukan(
      'Permohonan Sewa',
      'Rent a Space — Land Request',
      `City: ${kotaLahan}\nPlease describe the intended business use.`,
    );
  };

  const ajukanLahan = (lahan: LahanPublik) => {
    onAjukan(
      'Permohonan Sewa',
      `Rent a Space — ${lahan.nama}`,
      `City: ${lahan.satker}\nLand: ${lahan.nama}\nPlease describe the intended business use.`,
    );
  };

  return (
    <section id="layanan" className="bg-white px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-[#0d2569]">
          {t.layananJudul}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-slate-600">
          {t.layananSubjudul}
        </p>

        {/* 5 kartu layanan */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {kartuLayanan.map((kartu) => (
            <article
              key={kartu.judulInggris}
              className="flex flex-col rounded-xl border border-[#2573e2]/20 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-bold text-[#0d2569]">
                {kartu.judulTampil}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{kartu.deskripsi}</p>
              {kartu.sub.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {kartu.sub.map((sub) => (
                    <li key={sub}>
                      <button
                        type="button"
                        onClick={() =>
                          onAjukan(
                            kartu.jenis,
                            `${kartu.judulInggris} — ${sub}`,
                            '',
                          )
                        }
                        className="rounded-full border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-1 text-xs font-semibold text-[#0d2569] hover:bg-[#2573e2]/10"
                      >
                        {sub}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-auto pt-5">
                <button
                  type="button"
                  onClick={() =>
                    onAjukan(kartu.jenis, kartu.judulInggris, '')
                  }
                  className="w-full rounded-lg bg-[#2573e2] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0d2569]"
                >
                  {t.layananAjukan}
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Book a Room */}
        <div id="ruangan" className="mt-16">
          <h3 className="text-2xl font-bold text-[#0d2569]">
            {t.ruanganJudul}
          </h3>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="ruangan-kota"
                className="mb-1 block text-sm font-semibold text-[#0d2569]"
              >
                {t.ruanganPilihKota}
              </label>
              <select
                id="ruangan-kota"
                className="w-full rounded-lg border border-[#2573e2]/40 bg-white px-3 py-2 text-sm text-[#0d2569]"
                value={kotaRuangan}
                onChange={(e) => {
                  setKotaRuangan(e.target.value);
                  setRuanganTerpilih(null);
                }}
              >
                <option value="">{t.ruanganPilihKota}</option>
                {daftarKota.map((s) => (
                  <option key={s.nama} value={s.nama}>
                    {s.nama}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="ruangan-kegiatan"
                className="mb-1 block text-sm font-semibold text-[#0d2569]"
              >
                {t.ruanganPilihKegiatan}
              </label>
              <select
                id="ruangan-kegiatan"
                className="w-full rounded-lg border border-[#2573e2]/40 bg-white px-3 py-2 text-sm text-[#0d2569]"
                value={kegiatan}
                onChange={(e) => setKegiatan(e.target.value)}
              >
                <option value="">{t.ruanganPilihKegiatan}</option>
                {daftarKegiatan.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="ruangan-tanggal"
                className="mb-1 block text-sm font-semibold text-[#0d2569]"
              >
                {t.ruanganTanggal}
              </label>
              <input
                id="ruangan-tanggal"
                type="date"
                min={hariIniIso()}
                className="w-full rounded-lg border border-[#2573e2]/40 bg-white px-3 py-2 text-sm text-[#0d2569]"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
              />
            </div>
          </div>

          {kotaRuangan !== '' && ruanganKota.length === 0 && (
            <div className="mt-6 rounded-xl border border-[#2573e2]/20 bg-[#2573e2]/5 p-6 text-center">
              <p className="text-base font-bold text-[#0d2569]">
                {t.ruanganKosong}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {t.ruanganKosongDesk}
              </p>
              <button
                type="button"
                onClick={() =>
                  onAjukan(
                    'Permohonan Sewa',
                    'Book a Room — Request',
                    `City: ${kotaRuangan}\nPlease describe the room you need, the activity, and the date.`,
                  )
                }
                className="mt-4 rounded-lg bg-[#2573e2] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0d2569]"
              >
                {t.ruanganAjukan}
              </button>
            </div>
          )}

          {ruanganKota.length > 0 && (
            <>
              <p className="mt-6 text-sm font-semibold text-[#0d2569]">
                {t.ruanganPilihJenis}
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {ruanganKota.map((ruangan) => {
                  const terpilih = ruanganTerpilih?.id === ruangan.id;
                  return (
                    <button
                      key={ruangan.id}
                      type="button"
                      onClick={() => setRuanganTerpilih(ruangan)}
                      aria-pressed={terpilih}
                      className={`rounded-xl border p-5 text-left shadow-sm ${
                        terpilih
                          ? 'border-[#2573e2] bg-[#2573e2]/5 ring-2 ring-[#2573e2]'
                          : 'border-[#2573e2]/20 bg-white hover:border-[#2573e2]/60'
                      }`}
                    >
                      <p className="text-base font-bold text-[#0d2569]">
                        {ruangan.nama}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {labelJenisRuangan[ruangan.jenis]}
                      </p>
                      <p className="mt-3 text-sm text-[#0d2569]">
                        {t.ruanganKapasitas}: {ruangan.kapasitas}
                      </p>
                      <p className="mt-1 text-sm text-[#0d2569]">
                        {t.ruanganTarif}: {formatRupiah(ruangan.tarifPerHari)}
                        <span className="ml-2 rounded-full bg-[#2573e2]/10 px-2 py-0.5 text-xs font-semibold text-[#2573e2]">
                          {t.ruanganTarifContoh}
                        </span>
                      </p>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={ajukanRuangan}
                disabled={
                  !ruanganTerpilih || kegiatan === '' || tanggal === ''
                }
                className="mt-6 rounded-lg bg-[#2573e2] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0d2569] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.ruanganAjukan}
              </button>
            </>
          )}
        </div>

        {/* Rent a Space */}
        <div id="lahan" className="mt-16">
          <h3 className="text-2xl font-bold text-[#0d2569]">
            {t.lahanJudul}
          </h3>
          <div className="mt-6 max-w-md">
            <label
              htmlFor="lahan-kota"
              className="mb-1 block text-sm font-semibold text-[#0d2569]"
            >
              {t.lahanPilihKota}
            </label>
            <select
              id="lahan-kota"
              className="w-full rounded-lg border border-[#2573e2]/40 bg-white px-3 py-2 text-sm text-[#0d2569]"
              value={kotaLahan}
              onChange={(e) => setKotaLahan(e.target.value)}
            >
              <option value="">{t.lahanPilihKota}</option>
              {daftarKota.map((s) => (
                <option key={s.nama} value={s.nama}>
                  {s.nama}
                </option>
              ))}
            </select>
          </div>

          {DAFTAR_LAHAN_PUBLIK.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lahanKota.map((lahan) => (
                <article
                  key={lahan.id}
                  className="rounded-xl border border-[#2573e2]/20 bg-white p-6 shadow-sm"
                >
                  {lahan.fotoDataUri && (
                    <img
                      src={lahan.fotoDataUri}
                      alt={lahan.nama}
                      className="mb-4 h-40 w-full rounded-lg object-cover"
                    />
                  )}
                  <h4 className="text-base font-bold text-[#0d2569]">
                    {lahan.nama}
                  </h4>
                  <p className="mt-2 text-sm text-[#0d2569]">
                    {t.lahanLuas}: {lahan.luasM2} m&sup2;
                  </p>
                  {lahan.tarifEstimasi !== undefined && (
                    <p className="mt-1 text-sm text-[#0d2569]">
                      {t.lahanTarifEstimasi}:{' '}
                      {formatRupiah(lahan.tarifEstimasi)}
                    </p>
                  )}
                  {lahan.cocokUntuk.length > 0 && (
                    <p className="mt-1 text-sm text-slate-600">
                      {t.lahanCocokUntuk}: {lahan.cocokUntuk.join(', ')}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => ajukanLahan(lahan)}
                    className="mt-4 w-full rounded-lg bg-[#2573e2] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0d2569]"
                  >
                    {t.lahanAjukan}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-[#2573e2]/20 bg-[#2573e2]/5 p-6 text-center">
              <p className="text-base font-bold text-[#0d2569]">
                {t.lahanKosong}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {t.lahanKosongDesk}
              </p>
              <button
                type="button"
                onClick={ajukanLahanUmum}
                disabled={kotaLahan === ''}
                className="mt-4 rounded-lg bg-[#2573e2] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0d2569] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.lahanAjukan}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

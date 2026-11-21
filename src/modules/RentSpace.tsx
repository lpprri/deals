// Modul Rent a Space — halaman PUBLIK "Rent a Space" (tanpa login).
//
// Rebuild ala Brighton (keputusan pengguna 2026-11-21 14:16 WIB, "Ya,
// rebuild sekarang"; referensi studi browser brighton.co.id/disewa
// 14:06 WIB): search band + filter modal + sort, kartu foto 16:9
// (carousel) 3 per baris, halaman detail per lahan (galeri + lightbox,
// tabel Property Details, deskripsi, Similar properties, kartu kontak
// satker sticky + form inquiry). Space = sebidang tanah milik RRI di
// tiap satuan kerja, disewa klien untuk ruang bisnis (pertokoan, cafe,
// lahan parkir, dll) — BUKAN ruangan gedung.
//
// "Chat ke admin" yang dimaksud pengguna = tombol "Send Inquiry" ini:
// chat client→admin TIDAK ADA di aplikasi (Chat yang ada hanya antar
// operator). Submit → dokumen `spaceRentOrder` (id `SRR-…`) di panel
// Order; konfirmasi menampilkan nomor referensi. Bila tulis Firestore
// gagal, error ditampilkan apa adanya — jangan pura-pura berhasil.
//
// DATA DUMMY (src/lib/layananTambahanDummy.ts) — ganti data asli.
// HARGA: TIDAK ada tarif KB untuk sewa lahan → semua "Price on request".
// FOTO: 12 foto lahan yang DI-GENERATE di src/lib/fotoLahan.ts
// (data URI WebP) — 8 foto utama + 4 foto galeri bersama; tiap plot
// memakai 5 foto. TIDAK ADA seksi peta (lokasi plot dummy hanya teks),
// TIDAK ADA field rumah, toggle Dijual, agen, tombol pesan instan,
// atau badge berbayar.
//
// Header ala Book a Venue (perintah user 2026-11-21 14:03 WIB): kiri
// panah + logo RRI h-10, kanan judul "Rent a Space" gaya logo Deals,
// tanpa deskripsi, tanpa teks "Back to Landing Page". Di halaman detail
// panah kembali ke listing ("Back to spaces").

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Landmark,
  LayoutGrid,
  MapPin,
  Search,
  Share,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { LOGO_RRI_LOCKUP_DATA_URI } from '../lib/logoRriLockup';
import { DAFTAR_SATKER } from '../lib/satker';
import { SPACE_DUMMY } from '../lib/layananTambahanDummy';
import type { SpaceDummy } from '../lib/layananTambahanDummy';
import { FOTO_LAHAN } from '../lib/fotoLahan';
import type { PermintaanSpacePublikInput } from '../lib/store';

export interface RentSpaceProps {
  onKembali: () => void;
  /** Kirim inquiry; kembalikan { galat, id } — id = nomor referensi
      (mis. 'SRR-001') yang ditampilkan saat berhasil. */
  onKirim: (
    input: PermintaanSpacePublikInput,
  ) => Promise<{ galat: string | null; id?: string }>;
}

/** 'PALEMBANG' → 'Palembang'; 'TOLI TOLI' → 'Toli Toli'. */
function judulKota(nama: string): string {
  return nama
    .split(' ')
    .map((k) => k.charAt(0) + k.slice(1).toLowerCase())
    .join(' ');
}

const dariIso = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** '2026-11-20' → '20 Nov 2026'. */
const labelTanggal = (iso: string): string =>
  dariIso(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

/** '2026-11-20' → '20/11/2026'. */
const labelTanggalPenuh = (iso: string): string =>
  dariIso(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

/** 2500 → '2,500'. */
const labelLuas = (n: number): string => n.toLocaleString('en-GB');

/** Peruntukan lahan (definisi user) + opsi 'All'. */
const PENGGUNAAN = ['All', 'Shop', 'Cafe', 'Parking', 'Showroom', 'Other'];

/** 8 mata angin (Brighton memakai 12; 8 cukup untuk lahan RRI). */
const ARAH_HADAP = [
  'North',
  'Northeast',
  'East',
  'Southeast',
  'South',
  'Southwest',
  'West',
  'Northwest',
];

type Urutan = 'newest' | 'oldest' | 'largest' | 'smallest';

export default function RentSpace({ onKembali, onKirim }: RentSpaceProps) {
  // --- Pencarian + filter (ala Brighton). ---
  const [teksLokasi, setTeksLokasi] = useState('');
  const [panelLokasi, setPanelLokasi] = useState(false);
  const [penggunaan, setPenggunaan] = useState('All');
  const [modalFilter, setModalFilter] = useState(false);
  const [luasMinDraf, setLuasMinDraf] = useState('');
  const [luasMaxDraf, setLuasMaxDraf] = useState('');
  const [hadapDraf, setHadapDraf] = useState('All');
  const [luasMin, setLuasMin] = useState('');
  const [luasMax, setLuasMax] = useState('');
  const [hadap, setHadap] = useState('All');
  const [urutan, setUrutan] = useState<Urutan>('newest');

  // --- Halaman detail lahan (klik kartu). ---
  const [detailId, setDetailId] = useState<string | null>(null);
  const [fotoKartu, setFotoKartu] = useState<Record<string, number>>({});
  const [galeriTerbuka, setGaleriTerbuka] = useState(false);
  const [fotoLightbox, setFotoLightbox] = useState(0);
  const [tautanDisalin, setTautanDisalin] = useState(false);

  // --- Form inquiry. ---
  const [spaceId, setSpaceId] = useState(SPACE_DUMMY[0].id);
  const [nama, setNama] = useState('');
  const [kontak, setKontak] = useState('');
  const [email, setEmail] = useState('');
  const [pesan, setPesan] = useState('');
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [referensi, setReferensi] = useState<string | null>(null);

  // Halaman publik dibuka dari footer landing (SPA: posisi gulir window
  // TIDAK reset saat komponen mount — footer di bawah landing membuat
  // halaman baru mendarat di bawah, di form). Selalu mulai dari atas.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const detail = detailId
    ? (SPACE_DUMMY.find((s) => s.id === detailId) ?? null)
    : null;

  // --- Saran kota satker + plot saat mengetik lokasi. ---
  const kotaSatker = DAFTAR_SATKER.filter((s) => s.tipe === 'SATKER').map(
    (s) => s.nama,
  );
  const teks = teksLokasi.trim().toLowerCase();
  const saranKota =
    teks === ''
      ? []
      : kotaSatker
          .filter((k) => k.toLowerCase().includes(teks))
          .slice(0, 8);
  const saranPlot =
    teks === ''
      ? []
      : SPACE_DUMMY.filter(
          (s) =>
            s.nama.toLowerCase().includes(teks) ||
            s.lokasi.toLowerCase().includes(teks),
        ).slice(0, 4);

  // Kota yang diketik persis (untuk heading "N plots in [kota]").
  const kotaTerpilih =
    teks === ''
      ? null
      : (kotaSatker.find((k) => k.toLowerCase() === teks) ?? null);

  // --- Filter + sort hasil. ---
  const hasil = SPACE_DUMMY.filter((space) => {
    const cocokLokasi =
      teks === '' ||
      space.kota.toLowerCase().includes(teks) ||
      space.nama.toLowerCase().includes(teks) ||
      space.lokasi.toLowerCase().includes(teks);
    const cocokPenggunaan =
      penggunaan === 'All' || space.peruntukan === penggunaan;
    const cocokLuasMin = luasMin === '' || space.luasTanah >= Number(luasMin);
    const cocokLuasMax = luasMax === '' || space.luasTanah <= Number(luasMax);
    const cocokHadap = hadap === 'All' || space.hadap === hadap;
    return (
      cocokLokasi &&
      cocokPenggunaan &&
      cocokLuasMin &&
      cocokLuasMax &&
      cocokHadap
    );
  }).sort((a, b) => {
    if (urutan === 'newest')
      return b.tanggalDaftar.localeCompare(a.tanggalDaftar);
    if (urutan === 'oldest')
      return a.tanggalDaftar.localeCompare(b.tanggalDaftar);
    if (urutan === 'largest') return b.luasTanah - a.luasTanah;
    return a.luasTanah - b.luasTanah;
  });

  const filterAktif =
    teksLokasi.trim() !== '' ||
    penggunaan !== 'All' ||
    luasMin !== '' ||
    luasMax !== '' ||
    hadap !== 'All';

  /** Buka halaman detail lahan (klik kartu di listing). */
  const bukaDetail = (id: string) => {
    setSpaceId(id);
    setDetailId(id);
    setGaleriTerbuka(false);
    setFotoLightbox(0);
    setGalat(null);
    setReferensi(null);
    setPanelLokasi(false);
    window.scrollTo({ top: 0 });
  };

  const kembaliKeListing = () => {
    setDetailId(null);
    setGaleriTerbuka(false);
    setPanelLokasi(false);
    window.scrollTo({ top: 0 });
  };

  /** Geser carousel foto kartu (panah; klik tidak membuka detail). */
  const geserFotoKartu = (
    e: React.MouseEvent,
    id: string,
    arah: 1 | -1,
  ) => {
    e.stopPropagation();
    setFotoKartu((lama) => {
      const space = SPACE_DUMMY.find((s) => s.id === id);
      const n = space ? space.foto.length : 1;
      const kini = lama[id] ?? 0;
      return { ...lama, [id]: (kini + arah + n) % n };
    });
  };

  /** Share: salin tautan halaman (belum ada deep-link per lahan —
      tautan membuka halaman Rent a Space). */
  const bagikan = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setTautanDisalin(true);
      window.setTimeout(() => setTautanDisalin(false), 2000);
    } catch {
      // Clipboard tidak tersedia: tombol tetap tampil tanpa umpan balik.
    }
  };

  const terapkanFilter = () => {
    setLuasMin(luasMinDraf);
    setLuasMax(luasMaxDraf);
    setHadap(hadapDraf);
    setModalFilter(false);
  };

  const bersihkanFilter = () => {
    setTeksLokasi('');
    setPenggunaan('All');
    setLuasMin('');
    setLuasMax('');
    setHadap('All');
    setLuasMinDraf('');
    setLuasMaxDraf('');
    setHadapDraf('All');
    setUrutan('newest');
  };

  const kirim = async () => {
    setGalat(null);
    setReferensi(null);
    if (!nama.trim()) {
      setGalat('Name is required.');
      return;
    }
    if (!kontak.trim()) {
      setGalat('Contact is required.');
      return;
    }
    if (!email.trim()) {
      setGalat('Email is required.');
      return;
    }
    const space = SPACE_DUMMY.find((s) => s.id === spaceId);
    if (!space) {
      setGalat('Space is required.');
      return;
    }
    setMengirim(true);
    const hasilKirim = await onKirim({
      space: space.nama,
      nama: nama.trim(),
      kontak: kontak.trim(),
      email: email.trim(),
      pesan: pesan.trim() || undefined,
    });
    setMengirim(false);
    if (hasilKirim.galat) {
      setGalat(hasilKirim.galat);
      return;
    }
    setReferensi(hasilKirim.id ?? '');
  };

  const labelInput =
    'mt-1 block w-full rounded-lg border border-[#0d2569]/15 bg-white px-3 py-2 text-sm text-[#0d2569] outline-none focus:border-[#2573e2]';

  // --- Form inquiry (dipakai di kartu kontak sticky halaman detail). ---
  const formInquiry = (
    <div id="form-rent-space" className="mt-6">
      {referensi ? (
        <div className="rounded-lg border border-[#2573e2]/30 bg-[#e8f1fe] px-4 py-3 text-sm text-[#0d2569]">
          <p className="font-semibold">Inquiry received.</p>
          <p className="mt-1">
            Your reference number is{' '}
            <span className="font-bold">{referensi}</span> — please keep it
            for follow-up.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="rent-space-pilihan"
              className="text-sm font-semibold text-[#0d2569]"
            >
              Space
            </label>
            <select
              id="rent-space-pilihan"
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
              className={labelInput}
            >
              {SPACE_DUMMY.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.nama} — {space.lokasi}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="rent-space-nama"
              className="text-sm font-semibold text-[#0d2569]"
            >
              Name
            </label>
            <input
              id="rent-space-nama"
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Your full name"
              className={labelInput}
            />
          </div>
          <div>
            <label
              htmlFor="rent-space-kontak"
              className="text-sm font-semibold text-[#0d2569]"
            >
              Contact (phone / WhatsApp)
            </label>
            <input
              id="rent-space-kontak"
              type="text"
              value={kontak}
              onChange={(e) => setKontak(e.target.value)}
              placeholder="e.g. 0812-3456-7890"
              className={labelInput}
            />
          </div>
          <div>
            <label
              htmlFor="rent-space-email"
              className="text-sm font-semibold text-[#0d2569]"
            >
              Email
            </label>
            <input
              id="rent-space-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={labelInput}
            />
          </div>
          <div>
            <label
              htmlFor="rent-space-pesan"
              className="text-sm font-semibold text-[#0d2569]"
            >
              Message (optional)
            </label>
            <textarea
              id="rent-space-pesan"
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              placeholder="Tell us how you plan to use the space"
              rows={3}
              className={labelInput}
            />
          </div>
          {galat ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {galat}
            </p>
          ) : null}
          <button
            type="button"
            onClick={kirim}
            disabled={mengirim}
            className="w-full rounded-full bg-[#2573e2] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#0d2569] disabled:opacity-60"
          >
            {mengirim ? 'Sending…' : 'Send inquiry'}
          </button>
        </div>
      )}
    </div>
  );

  // --- Halaman detail lahan (ala Brighton + tambahan RRI). ---
  const tampilDetail = (space: SpaceDummy) => {
    const serupa = [...SPACE_DUMMY]
      .filter((s) => s.id !== space.id)
      .sort((a, b) => {
        const aSama = a.kota === space.kota ? 0 : 1;
        const bSama = b.kota === space.kota ? 0 : 1;
        return aSama - bSama || b.tanggalDaftar.localeCompare(a.tanggalDaftar);
      });
    const fotoDetail = space.foto;
    return (
      <div>
        {/* Galeri foto: 1 besar + 4 kecil + Show all photos. */}
        <div className="relative mt-6">
          <div className="grid grid-cols-4 gap-2 overflow-hidden rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setFotoLightbox(0);
                setGaleriTerbuka(true);
              }}
              aria-label={`Open photos of ${space.nama}`}
              className="relative col-span-2 row-span-2"
            >
              <img
                src={FOTO_LAHAN[fotoDetail[0]] ?? ''}
                alt={space.nama}
                className="h-full w-full object-cover"
              />
            </button>
            {fotoDetail.slice(1).map((kunci, i) => (
              <button
                key={kunci}
                type="button"
                onClick={() => {
                  setFotoLightbox(i + 1);
                  setGaleriTerbuka(true);
                }}
                aria-label="Open photos"
                className="relative"
              >
                <img
                  src={FOTO_LAHAN[kunci] ?? ''}
                  alt=""
                  className="aspect-[4/3] w-full object-cover"
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setFotoLightbox(0);
              setGaleriTerbuka(true);
            }}
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#222] shadow transition hover:bg-[#f7f7f7]"
          >
            <LayoutGrid className="h-4 w-4" aria-hidden />
            Show all photos
          </button>
        </div>

        {/* Pill + lokasi + harga + Share, lalu judul. */}
        <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="inline-block rounded-full bg-[#2573e2] px-2.5 py-0.5 text-xs font-semibold text-white">
              LAND
            </span>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[#0d2569]">
              {space.lokasi}
            </p>
            <p className="mt-1 text-2xl font-bold text-[#0d2569]">
              Price on request
            </p>
          </div>
          <button
            type="button"
            onClick={bagikan}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#222] underline transition hover:text-[#0d2569]"
          >
            <Share className="h-4 w-4" aria-hidden />
            {tautanDisalin ? 'Link copied' : 'Share'}
          </button>
        </div>
        <h2 className="mt-3 text-2xl font-bold text-[#222]">{space.nama}</h2>
        <p className="mt-1 text-sm text-[#717171]">
          {space.peruntukan === 'Other'
            ? 'Land for general business use'
            : `Land for ${space.peruntukan.toLowerCase()} use`}{' '}
          in {judulKota(space.kota)}, Indonesia
        </p>

        {/* Isi detail: kiri tabel + deskripsi + serupa; kanan kartu kontak. */}
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            {/* Satker pemilik lahan. */}
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0d2569] text-white">
                <Landmark className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-bold text-[#222]">
                  RRI {judulKota(space.kota)}
                </p>
                <p className="text-sm text-[#717171]">
                  LPP Radio Republik Indonesia · {judulKota(space.kota)}{' '}
                  station
                </p>
              </div>
            </div>

            {/* Property Details. */}
            <h3 className="mt-8 text-lg font-bold text-[#222]">
              Property Details
            </h3>
            <dl className="mt-3 divide-y divide-[#0d2569]/10 rounded-2xl border border-[#0d2569]/10 bg-white">
              {(
                [
                  ['Land area', `LT: ${labelLuas(space.luasTanah)}m²`],
                  ['Dimensions', space.dimensi],
                  ['Permitted use', space.peruntukan],
                  ['Facing', space.hadap],
                  ['Road access', space.aksesJalan],
                  ['Address', space.alamat],
                  ['Location', `${space.provinsi}, ${judulKota(space.kota)}`],
                  ['Certificate', '—'],
                  ['Listed on', labelTanggalPenuh(space.tanggalDaftar)],
                  ['Listing ID', space.id],
                ] as const
              ).map(([label, nilai]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 px-5 py-3"
                >
                  <dt className="text-sm text-[#717171]">{label}</dt>
                  <dd className="text-right text-sm font-semibold text-[#222]">
                    {nilai}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Description. */}
            <h3 className="mt-8 text-lg font-bold text-[#222]">
              Description
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#222]">
              {space.deskripsi}
            </p>

            {/* Similar properties. */}
            <h3 className="mt-8 text-lg font-bold text-[#222]">
              Similar properties
            </h3>
            <div className="mt-3 flex gap-4 overflow-x-auto pb-2">
              {serupa.map((s) => (
                <article
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details of ${s.nama}`}
                  onClick={() => bukaDetail(s.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      bukaDetail(s.id);
                    }
                  }}
                  className="w-64 shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-[#0d2569]/10 bg-white shadow-sm"
                >
                  <img
                    src={FOTO_LAHAN[s.foto[0]] ?? ''}
                    alt={`${s.nama} in ${judulKota(s.kota)}`}
                    loading="lazy"
                    className="aspect-[16/9] w-full object-cover"
                  />
                  <div className="p-4">
                    <p className="text-sm font-bold text-[#0d2569]">
                      Price on request
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#0d2569]/70">
                      {s.lokasi}
                    </p>
                    <h4 className="mt-0.5 text-sm font-bold text-[#0d2569]">
                      {s.nama}
                    </h4>
                    <p className="mt-0.5 text-xs text-[#0d2569]/70">
                      LT: {labelLuas(s.luasTanah)}m² · {s.dimensi}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Kartu kontak satker (sticky) + form inquiry. */}
          <div>
            <div className="sticky top-6 rounded-2xl border border-[#0d2569]/10 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0d2569] text-white">
                  <Landmark className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-[#222]">
                    RRI {judulKota(space.kota)}
                  </p>
                  <p className="text-sm text-[#717171]">
                    LPP Radio Republik Indonesia
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-[#717171]">
                Send an inquiry about this plot — our team will follow up by
                email or phone.
              </p>
              {formInquiry}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f2f2] px-4 py-16">
      {/* Gradasi pucat biru/navy di bagian bawah (pola halaman publik). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-[#2573e2]/15 via-[#0d2569]/10 to-transparent"
      />

      <div className="relative mx-auto w-full max-w-6xl">
        {/* Header ala Book a Venue (perintah user 2026-11-21 14:03 WIB):
            kiri panah + logo RRI; kanan judul gaya logo Deals; tanpa
            deskripsi; tanpa teks "Back to Landing Page". Di halaman
            detail panah kembali ke listing ("Back to spaces"). */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={detail ? kembaliKeListing : onKembali}
              aria-label={
                detail ? 'Back to spaces' : 'Back to Landing Page'
              }
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
            Rent a Space
          </h1>
        </header>

        {detail ? (
          tampilDetail(detail)
        ) : (
          <>
            {/* Search band (ala Brighton): lokasi + penggunaan + Filter. */}
            <div className="relative z-20 mt-8">
              <div className="flex flex-col gap-2 rounded-2xl border border-[#0d2569]/10 bg-white p-2 shadow-sm sm:flex-row sm:items-center sm:rounded-full">
                <label className="flex flex-1 items-center gap-2 px-3 py-2">
                  <Search
                    className="h-4 w-4 shrink-0 text-[#0d2569]/60"
                    aria-hidden
                  />
                  <input
                    type="text"
                    value={teksLokasi}
                    onChange={(e) => {
                      setTeksLokasi(e.target.value);
                      setPanelLokasi(true);
                    }}
                    onFocus={() => setPanelLokasi(true)}
                    onBlur={() =>
                      window.setTimeout(() => setPanelLokasi(false), 150)
                    }
                    placeholder="Search by city or plot name"
                    aria-label="Search by city or plot name"
                    className="w-full bg-transparent text-sm text-[#0d2569] outline-none placeholder:text-[#0d2569]/50"
                  />
                  {teksLokasi ? (
                    <button
                      type="button"
                      onClick={() => setTeksLokasi('')}
                      aria-label="Clear search"
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#0d2569]/60 transition hover:bg-[#e8f1fe] hover:text-[#0d2569]"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  ) : null}
                </label>
                <div
                  aria-hidden
                  className="hidden h-8 w-px bg-[#0d2569]/10 sm:block"
                />
                <label className="flex items-center gap-2 px-3 py-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#0d2569]/60">
                    Use
                  </span>
                  <select
                    value={penggunaan}
                    onChange={(e) => setPenggunaan(e.target.value)}
                    aria-label="Permitted use"
                    className="bg-transparent text-sm font-semibold text-[#0d2569] outline-none"
                  >
                    {PENGGUNAAN.map((p) => (
                      <option key={p} value={p}>
                        {p === 'All' ? 'All uses' : p}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setLuasMinDraf(luasMin);
                    setLuasMaxDraf(luasMax);
                    setHadapDraf(hadap);
                    setModalFilter(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2573e2] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d2569]"
                >
                  <SlidersHorizontal className="h-4 w-4" aria-hidden />
                  Filter
                  {luasMin !== '' || luasMax !== '' || hadap !== 'All' ? (
                    <span
                      aria-hidden
                      className="flex h-2 w-2 rounded-full bg-white"
                    />
                  ) : null}
                </button>
              </div>

              {/* Saran kota satker + plot saat mengetik. */}
              {panelLokasi &&
              teks !== '' &&
              (saranKota.length > 0 || saranPlot.length > 0) ? (
                <div className="absolute inset-x-0 top-full z-30 mt-2 rounded-2xl border border-[#0d2569]/10 bg-white p-2 shadow-lg">
                  {saranKota.length > 0 ? (
                    <div>
                      <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-[#0d2569]/60">
                        Cities
                      </p>
                      {saranKota.map((k) => (
                        <button
                          key={k}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setTeksLokasi(judulKota(k));
                            setPanelLokasi(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#0d2569] hover:bg-[#e8f1fe]"
                        >
                          <MapPin
                            className="h-4 w-4 shrink-0 text-[#0d2569]/50"
                            aria-hidden
                          />
                          {judulKota(k)}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {saranPlot.length > 0 ? (
                    <div>
                      <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-[#0d2569]/60">
                        Plots
                      </p>
                      {saranPlot.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            bukaDetail(p.id);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#0d2569] hover:bg-[#e8f1fe]"
                        >
                          <MapPin
                            className="h-4 w-4 shrink-0 text-[#0d2569]/50"
                            aria-hidden
                          />
                          {p.nama} — {judulKota(p.kota)}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* Heading hasil + sort. */}
            <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#0d2569]">
                  {kotaTerpilih
                    ? `${hasil.length} plot${hasil.length === 1 ? '' : 's'} in ${judulKota(kotaTerpilih)}`
                    : 'Available plots'}
                </h2>
                <p className="mt-1 text-sm text-[#0d2569]/70">
                  {filterAktif
                    ? `${hasil.length} plot${hasil.length === 1 ? '' : 's'} found`
                    : 'Land owned by RRI, for your business — shops, cafes, parking, and more.'}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-[#0d2569]">
                <span className="font-semibold">Sort by</span>
                <select
                  value={urutan}
                  onChange={(e) => setUrutan(e.target.value as Urutan)}
                  aria-label="Sort plots"
                  className="rounded-lg border border-[#0d2569]/15 bg-white px-3 py-2 text-sm font-semibold text-[#0d2569] outline-none focus:border-[#2573e2]"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="largest">Largest area</option>
                  <option value="smallest">Smallest area</option>
                </select>
              </label>
            </div>

            {/* Daftar lahan (DUMMY — ganti data asli). */}
            {hasil.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-[#0d2569]/10 bg-white p-8 text-center shadow-sm">
                <p className="text-lg font-bold text-[#0d2569]">
                  No plots match your search
                </p>
                <p className="mt-1 text-sm text-[#0d2569]/70">
                  Try a different city, a wider area range, or another use.
                </p>
                <button
                  type="button"
                  onClick={bersihkanFilter}
                  className="mt-4 rounded-full bg-[#2573e2] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d2569]"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {hasil.map((space) => {
                  const idx = fotoKartu[space.id] ?? 0;
                  const fotoAktif = space.foto[idx] ?? space.foto[0];
                  return (
                    <article
                      key={space.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`View details of ${space.nama}`}
                      onClick={() => bukaDetail(space.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          bukaDetail(space.id);
                        }
                      }}
                      className="cursor-pointer overflow-hidden rounded-2xl border border-[#0d2569]/10 bg-white shadow-sm transition hover:shadow-md"
                    >
                      {/* Foto 16:9 — carousel bila plot punya >1 foto. */}
                      <div className="relative">
                        <img
                          src={FOTO_LAHAN[fotoAktif] ?? ''}
                          alt={`${space.nama} in ${judulKota(space.kota)}`}
                          loading="lazy"
                          className="aspect-[16/9] w-full object-cover"
                        />
                        {space.foto.length > 1 ? (
                          <>
                            <button
                              type="button"
                              onClick={(e) => geserFotoKartu(e, space.id, -1)}
                              aria-label="Previous photo"
                              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0d2569] shadow transition hover:bg-white"
                            >
                              <ChevronLeft className="h-4 w-4" aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => geserFotoKartu(e, space.id, 1)}
                              aria-label="Next photo"
                              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#0d2569] shadow transition hover:bg-white"
                            >
                              <ChevronRight className="h-4 w-4" aria-hidden />
                            </button>
                            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                              {space.foto.map((f, i) => (
                                <span
                                  key={f}
                                  className={`h-1.5 rounded-full ${
                                    i === idx
                                      ? 'w-4 bg-white'
                                      : 'w-1.5 bg-white/60'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        ) : null}
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-base font-bold text-[#0d2569]">
                            Price on request
                          </p>
                          <p className="shrink-0 text-xs text-[#0d2569]/60">
                            {labelTanggal(space.tanggalDaftar)}
                          </p>
                        </div>
                        <span className="mt-2 inline-block rounded-full bg-[#2573e2] px-2.5 py-0.5 text-xs font-semibold text-white">
                          LAND
                        </span>
                        <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[#0d2569]">
                          {space.lokasi}
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-[#0d2569]">
                          {space.nama}
                        </h3>
                        <p className="mt-1 text-sm text-[#0d2569]/70">
                          LT: {labelLuas(space.luasTanah)}m² · {space.dimensi}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Filter: luas tanah min/max + arah hadap. */}
      {modalFilter ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Filter plots"
          onClick={() => setModalFilter(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0d2569]">Filter</h2>
              <button
                type="button"
                onClick={() => setModalFilter(false)}
                aria-label="Close filter"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#0d2569] transition hover:bg-[#e8f1fe]"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm font-semibold text-[#0d2569]">
                  Land area (m²)
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={luasMinDraf}
                    onChange={(e) => setLuasMinDraf(e.target.value)}
                    placeholder="Min"
                    aria-label="Minimum land area in square metres"
                    className={labelInput}
                  />
                  <span className="shrink-0 text-sm text-[#0d2569]/60">
                    to
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={luasMaxDraf}
                    onChange={(e) => setLuasMaxDraf(e.target.value)}
                    placeholder="Max"
                    aria-label="Maximum land area in square metres"
                    className={labelInput}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="rent-space-hadap"
                  className="text-sm font-semibold text-[#0d2569]"
                >
                  Facing
                </label>
                <select
                  id="rent-space-hadap"
                  value={hadapDraf}
                  onChange={(e) => setHadapDraf(e.target.value)}
                  className={labelInput}
                >
                  <option value="All">All directions</option>
                  {ARAH_HADAP.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setLuasMinDraf('');
                  setLuasMaxDraf('');
                  setHadapDraf('All');
                }}
                className="flex-1 rounded-full border border-[#0d2569]/20 px-5 py-2.5 text-sm font-semibold text-[#0d2569] transition hover:border-[#2573e2] hover:text-[#2573e2]"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={terapkanFilter}
                className="flex-1 rounded-full bg-[#2573e2] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d2569]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Lightbox galeri foto (halaman detail). */}
      {galeriTerbuka && detail ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Photos of ${detail.nama}`}
          onClick={() => setGaleriTerbuka(false)}
        >
          <div
            className="mx-auto flex w-full max-w-5xl items-center justify-between py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-white">
              Photos of {detail.nama}
            </p>
            <button
              type="button"
              onClick={() => setGaleriTerbuka(false)}
              aria-label="Close photos"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div
            className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center gap-3 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() =>
                setFotoLightbox(
                  (i) => (i - 1 + detail.foto.length) % detail.foto.length,
                )
              }
              aria-label="Previous photo"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <img
              src={FOTO_LAHAN[detail.foto[fotoLightbox]] ?? ''}
              alt={`${detail.nama} — photo ${fotoLightbox + 1} of ${detail.foto.length}`}
              className="max-h-[65vh] w-auto max-w-full rounded-xl object-contain"
            />
            <button
              type="button"
              onClick={() =>
                setFotoLightbox((i) => (i + 1) % detail.foto.length)
              }
              aria-label="Next photo"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <p className="py-2 text-center text-sm font-semibold text-white">
            {fotoLightbox + 1} of {detail.foto.length}
          </p>
          <div
            className="mx-auto flex w-full max-w-5xl justify-center gap-2 overflow-x-auto pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            {detail.foto.map((kunci, i) => (
              <button
                key={kunci}
                type="button"
                onClick={() => setFotoLightbox(i)}
                aria-label={`Show photo ${i + 1} of ${detail.foto.length}`}
                className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg ${
                  i === fotoLightbox
                    ? 'ring-2 ring-white'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={FOTO_LAHAN[kunci] ?? ''}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

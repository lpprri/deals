// Modul Book a Venue — halaman PUBLIK "Book a Venue" (tanpa login).
//
// Rebuild ala Airbnb (keputusan pengguna 2026-11-21 12:01 WIB, 5
// screenshot airbnb.com + studi live airbnb.com 12:03–12:06 WIB):
// bar kategori (All / Auditorium / Hall / Multipurpose Room /
// Meeting Room), search bar pil 3 segmen (Where = kota satker, When =
// kalender 2 bulan, Who = peserta + occasion), kartu listing foto
// besar + badge "Client favourite" + hati wishlist + rating.
//
// REVISI pengguna 2026-11-21 12:24–12:28 WIB ("laksanakan"):
// - Form booking TIDAK tampil di halaman listing — pindah ke halaman
//   detail venue.
// - Kartu listing CLICKABLE (seluruh kartu); tombol biru "Book this
//   venue" DIHAPUS. Klik kartu/foto → halaman detail venue ala Airbnb:
//   galeri foto (1 besar + 4 kecil + "Show all photos"), judul,
//   Share + Save, info venue, rating + jumlah ulasan, highlights,
//   "What this place offers" (amenities + "Show all amenities"), dan
//   kartu booking di kanan (CHECK-IN / CHECK-OUT / GUESTS + tombol
//   Reserve = "Send booking request"). Tombol Back kembali ke listing.
// - Header: baris flex — kiri panah ← saja (tanpa teks), kanan logo RRI
//   + judul "Book a Venue" gaya logo Deals (lihat komentar di header);
//   deskripsi dihapus.
// - Logo Deals adalah gambar PNG (src/lib/logoDeals.ts), BUKAN file
//   font — judul memakai pendekatan visualnya: navy #0D2569,
//   extra-bold/black, letter-spacing rapat, font stack sistem aplikasi.
//
// Submit → dokumen `venueBookOrder` (id `VBR-…`) di panel Order;
// konfirmasi menampilkan nomor referensi. Bila tulis Firestore gagal,
// error ditampilkan apa adanya — jangan pura-pura berhasil.
//
// DATA DUMMY (src/lib/layananTambahanDummy.ts) — ganti data asli.
// FOTO: 5 foto interior yang DI-GENERATE (src/lib/fotoVenue.ts), satu
// per jenis venue, + 4 foto galeri tambahan ('galeri-*', juga
// DI-GENERATE — sudut lain ruang venue RRI, ILUSTRASI umum, bukan foto
// ruangan yang sama persis). HARGA hanya tarif KB PP 68/2020 beserta
// satuannya (Auditorium / 4 hours, Studio / 3 hours); yang tidak ada
// tarif KB-nya → "Price on request". TIDAK ADA tarif harian di KB —
// kartu TIDAK menampilkan tarif harian turunan.
//
// Wishlist (hati): TANPA login — tersimpan di localStorage
// ('rri-venue-wishlist'). Berbeda dengan Airbnb (hati saat logout
// membuka modal login); di sini hati langsung terisi.
// Search button + aksen memakai biru RRI (#2573E2 / #0D2569), bukan
// merah Airbnb. Gaya lain mengikuti Airbnb: latar putih, teks #222,
// sekunder #717171, hover #F7F7F7, border #DDD.

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Armchair,
  AudioLines,
  Building2,
  CalendarDays,
  Car,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Heart,
  Landmark,
  Layers,
  LayoutGrid,
  MapPin,
  Mic,
  Minus,
  Monitor,
  Navigation,
  Plus,
  Presentation,
  Projector,
  Search,
  Share,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Star,
  Trophy,
  Users,
  Video,
  Volume2,
  Wifi,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { LOGO_RRI_LOCKUP_DATA_URI } from '../lib/logoRriLockup';
import { DAFTAR_SATKER } from '../lib/satker';
import { FOTO_VENUE } from '../lib/fotoVenue';
import { VENUE_DUMMY, type VenueDummy } from '../lib/layananTambahanDummy';
import type { PermintaanVenuePublikInput } from '../lib/store';

export interface BookVenueProps {
  onKembali: () => void;
  /** Kirim permintaan booking; kembalikan { galat, id } — id = nomor
      referensi (mis. 'VBR-001') yang ditampilkan saat berhasil. */
  onKirim: (
    input: PermintaanVenuePublikInput,
  ) => Promise<{ galat: string | null; id?: string }>;
}

/** Kota satker yang bisa dipilih di Where (KANTOR PUSAT dan
    PUSLITBANGDIKLAT bukan kota — tidak ikut). Nama kanonis huruf besar. */
const KOTA_SATKER = DAFTAR_SATKER.filter((s) => s.tipe === 'SATKER').map(
  (s) => s.nama,
);

const TAB_JENIS = [
  { id: 'All', label: 'All', ikon: LayoutGrid },
  { id: 'Auditorium', label: 'Auditorium', ikon: Landmark },
  { id: 'Hall', label: 'Hall', ikon: Building2 },
  { id: 'Multipurpose Room', label: 'Multipurpose Room', ikon: Layers },
  { id: 'Meeting Room', label: 'Meeting Room', ikon: Users },
] as const;

const OCCASION = [
  'Seminar',
  'Workshop',
  'Wedding / Reception',
  'Meeting',
  'Exhibition',
  'Concert / Performance',
  'Other',
];

const FLEKSIBEL_OPSI = [
  'Exact dates',
  '± 1 day',
  '± 2 days',
  '± 3 days',
  '± 7 days',
  '± 14 days',
];

const DURASI_FLEKSIBEL = ['Weekend', 'Week', 'Month'];

const KUNCI_WISHLIST = 'rri-venue-wishlist';

/** Foto galeri tambahan halaman detail (kunci di FOTO_VENUE) — sudut
    lain ruang venue RRI (panggung, deret kursi, lobi, meja rapat).
    DUMMY: ilustrasi umum, bukan foto ruangan yang sama persis. */
const FOTO_GALERI = [
  'galeri-panggung',
  'galeri-kursi',
  'galeri-lobi',
  'galeri-meja',
];

/** Amenitas standar semua venue (DUMMY) + tambahan saat "Show all". */
const AMENITAS_STANDAR = ['Wifi', 'Air conditioning'];
const AMENITAS_TAMBAHAN = ['Parking', 'Security', 'Cleaning service'];

const IKON_AMENITAS: Record<string, LucideIcon> = {
  'Sound system': Volume2,
  Stage: Presentation,
  Seating: Armchair,
  'LED screen': Monitor,
  Parking: Car,
  Projector: Projector,
  Whiteboard: ClipboardList,
  'Video conference': Video,
  'Recording equipment': Mic,
  Soundproofing: AudioLines,
  Wifi: Wifi,
  'Air conditioning': Snowflake,
  Security: ShieldCheck,
  'Cleaning service': Sparkles,
};

/** 'PALEMBANG' → 'Palembang'; 'TOLI TOLI' → 'Toli Toli'. */
function judulKota(nama: string): string {
  return nama
    .split(' ')
    .map((k) => k.charAt(0) + k.slice(1).toLowerCase())
    .join(' ');
}

function judulVenue(v: VenueDummy): string {
  return `${v.nama} in ${judulKota(v.kota)}`;
}

const keIso = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;

const dariIso = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** '2026-11-28' → '28 Nov'. */
const labelTanggalPendek = (iso: string): string =>
  dariIso(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });

/** '2026-12' → 'Dec 2026'. */
const labelBulan = (yyyyMm: string): string => {
  const [y, m] = yyyyMm.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  });
};

const namaBulanPanjang = (d: Date): string =>
  d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

const tambahBulan = (d: Date, n: number): Date =>
  new Date(d.getFullYear(), d.getMonth() + n, 1);

function bacaWishlist(): Set<string> {
  try {
    const mentah = localStorage.getItem(KUNCI_WISHLIST);
    if (!mentah) return new Set();
    const daftar: unknown = JSON.parse(mentah);
    if (!Array.isArray(daftar)) return new Set();
    return new Set(daftar.filter((x): x is string => typeof x === 'string'));
  } catch {
    return new Set();
  }
}

export default function BookVenue({ onKembali, onKirim }: BookVenueProps) {
  // --- Filter + pencarian (ala Airbnb). ---
  const [tab, setTab] = useState<string>('All');
  const [panel, setPanel] = useState<'where' | 'when' | 'who' | null>(null);
  const [kota, setKota] = useState('');
  const [teksKota, setTeksKota] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [fleksibel, setFleksibel] = useState('Exact dates');
  const [modeKalender, setModeKalender] = useState<'dates' | 'flexible'>(
    'dates',
  );
  const [bulanAwal, setBulanAwal] = useState<Date>(() => {
    const kini = new Date();
    return new Date(kini.getFullYear(), kini.getMonth(), 1);
  });
  const [bulanFleksibel, setBulanFleksibel] = useState('');
  const [durasiFleksibel, setDurasiFleksibel] = useState('');
  const [peserta, setPeserta] = useState(0);
  const [keperluan, setKeperluan] = useState('');
  // Filter yang sudah diterapkan tombol Search (draf di segmen belum
  // diterapkan sampai Search ditekan — kecuali tab, yang langsung jalan).
  const [terapan, setTerapan] = useState({ tab: 'All', kota: '', peserta: 0 });
  const [ringkas, setRingkas] = useState(false);
  const [hanyaSimpan, setHanyaSimpan] = useState(false);

  // --- Halaman detail venue (klik kartu/foto). ---
  const [detailId, setDetailId] = useState<string | null>(null);
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [galeriTerbuka, setGaleriTerbuka] = useState(false);
  const [tampilSemuaAmenitas, setTampilSemuaAmenitas] = useState(false);
  const [tautanDisalin, setTautanDisalin] = useState(false);

  // --- Wishlist (localStorage, tanpa login). ---
  const [wishlist, setWishlist] = useState<Set<string>>(bacaWishlist);
  useEffect(() => {
    try {
      localStorage.setItem(KUNCI_WISHLIST, JSON.stringify([...wishlist]));
    } catch {
      // Penyimpanan penuh / nonaktif: wishlist tetap jalan di sesi ini.
    }
  }, [wishlist]);

  // Halaman publik dibuka dari footer landing (SPA: posisi gulir window
  // TIDAK reset saat komponen mount — footer di bawah landing membuat
  // halaman baru mendarat di bawah, di form). Selalu mulai dari atas.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  // --- Form booking (di kartu booking halaman detail; tanggal/peserta/
  // occasion dibagikan dengan search bar). ---
  const [venueId, setVenueId] = useState(VENUE_DUMMY[0].id);
  const [nama, setNama] = useState('');
  const [kontak, setKontak] = useState('');
  const [email, setEmail] = useState('');
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [referensi, setReferensi] = useState<string | null>(null);

  const hariIniIso = keIso(new Date());
  const bulanKini = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );

  const detail =
    detailId === null
      ? undefined
      : VENUE_DUMMY.find((v) => v.id === detailId);

  const kotaTersaring = useMemo(() => {
    const cari = teksKota.trim().toLowerCase();
    if (!cari) return KOTA_SATKER;
    return KOTA_SATKER.filter((k) => k.toLowerCase().includes(cari));
  }, [teksKota]);

  const hasil = useMemo(
    () =>
      VENUE_DUMMY.filter((v) => {
        if (terapan.tab !== 'All' && v.jenis !== terapan.tab) return false;
        if (terapan.kota && v.kota !== terapan.kota) return false;
        if (terapan.peserta > 0 && v.kapasitas < terapan.peserta) return false;
        if (hanyaSimpan && !wishlist.has(v.id)) return false;
        return true;
      }),
    [terapan, hanyaSimpan, wishlist],
  );

  const filterAktif =
    terapan.tab !== 'All' ||
    terapan.kota !== '' ||
    terapan.peserta > 0 ||
    hanyaSimpan;

  const labelWhen =
    tanggal !== ''
      ? `${labelTanggalPendek(tanggal)}${
          fleksibel !== 'Exact dates' ? ` ${fleksibel}` : ''
        }`
      : bulanFleksibel !== ''
        ? `Flexible · ${labelBulan(bulanFleksibel)}${durasiFleksibel !== '' ? ` · ${durasiFleksibel}` : ''}`
        : 'Add dates';

  const labelWho = [
    peserta > 0
      ? `${peserta} participant${peserta > 1 ? 's' : ''}`
      : undefined,
    keperluan !== '' ? keperluan : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

  const labelRingkas = [
    kota !== '' ? judulKota(kota) : 'All venues',
    labelWhen === 'Add dates' ? 'Any date' : labelWhen,
    labelWho !== '' ? labelWho : 'Any group',
  ].join(' · ');

  const judulHasil =
    terapan.kota !== ''
      ? `${hasil.length} venue${hasil.length === 1 ? '' : 's'} in ${judulKota(terapan.kota)}`
      : filterAktif
        ? `${hasil.length} venue${hasil.length === 1 ? '' : 's'}`
        : 'Available venues';

  const bukaPanel = (nama: 'where' | 'when' | 'who') => {
    if (nama === 'where') setTeksKota(kota !== '' ? judulKota(kota) : '');
    setPanel((p) => (p === nama ? null : nama));
  };

  const pilihKota = (nama: string) => {
    setKota(nama);
    setTeksKota(judulKota(nama));
    setPanel('when');
  };

  const terapkanPencarian = () => {
    setTerapan({ tab, kota, peserta });
    setRingkas(true);
    setPanel(null);
    document
      .getElementById('hasil-venue')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  const bersihkanFilter = () => {
    setTab('All');
    setKota('');
    setTeksKota('');
    setTanggal('');
    setFleksibel('Exact dates');
    setModeKalender('dates');
    setBulanFleksibel('');
    setDurasiFleksibel('');
    setPeserta(0);
    setKeperluan('');
    setTerapan({ tab: 'All', kota: '', peserta: 0 });
    setRingkas(false);
    setHanyaSimpan(false);
    setPanel(null);
  };

  const toggleSimpan = (id: string) => {
    setWishlist((lama) => {
      const baru = new Set(lama);
      if (baru.has(id)) baru.delete(id);
      else baru.add(id);
      return baru;
    });
  };

  /** Buka halaman detail venue (klik kartu/foto di listing). */
  const bukaDetail = (id: string) => {
    setVenueId(id);
    setDetailId(id);
    setTanggalSelesai('');
    setGaleriTerbuka(false);
    setTampilSemuaAmenitas(false);
    setGalat(null);
    setReferensi(null);
    setPanel(null);
    window.scrollTo({ top: 0 });
  };

  const kembaliKeListing = () => {
    setDetailId(null);
    setGaleriTerbuka(false);
    setPanel(null);
    window.scrollTo({ top: 0 });
  };

  /** Pilih tanggal di kalender detail (ala Airbnb): klik pertama =
      check-in, klik kedua (≥ check-in) = check-out; klik sebelum
      check-in atau saat rentang sudah lengkap = check-in baru. */
  const pilihTanggalDetail = (iso: string) => {
    if (tanggal === '' || tanggalSelesai !== '' || iso < tanggal) {
      setTanggal(iso);
      setTanggalSelesai('');
    } else {
      setTanggalSelesai(iso);
    }
  };

  /** Share: salin tautan halaman (belum ada deep-link per venue —
      tautan membuka halaman Book a Venue). */
  const bagikan = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setTautanDisalin(true);
      window.setTimeout(() => setTautanDisalin(false), 2000);
    } catch {
      // Clipboard tidak tersedia: tombol tetap tampil tanpa umpan balik.
    }
  };

  const kirim = async () => {
    setGalat(null);
    setReferensi(null);
    if (!tanggal.trim()) {
      setGalat('Booking date is required.');
      return;
    }
    if (
      tanggalSelesai !== '' &&
      tanggalSelesai < tanggal.trim()
    ) {
      setGalat('Check-out date must be on or after the check-in date.');
      return;
    }
    if (!keperluan.trim()) {
      setGalat('Occasion is required.');
      return;
    }
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
    const venue = VENUE_DUMMY.find((v) => v.id === venueId);
    if (!venue) {
      setGalat('Venue is required.');
      return;
    }
    setMengirim(true);
    const hasilKirim = await onKirim({
      venue: judulVenue(venue),
      tanggal: tanggal.trim(),
      tanggalSelesai:
        tanggalSelesai !== '' && tanggalSelesai !== tanggal.trim()
          ? tanggalSelesai
          : undefined,
      keperluan: keperluan.trim(),
      nama: nama.trim(),
      kontak: kontak.trim(),
      email: email.trim(),
      jumlahPeserta: peserta > 0 ? peserta : undefined,
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

  /** Satu bulan kalender (When → Dates). Tanggal lampau non-aktif. */
  const renderBulan = (awal: Date, mode: 'cari' | 'detail' = 'cari') => {
    const tahun = awal.getFullYear();
    const bulan = awal.getMonth();
    const selKosong = new Date(tahun, bulan, 1).getDay();
    const jumlahHari = new Date(tahun, bulan + 1, 0).getDate();
    const sel: (number | null)[] = [
      ...Array<null>(selKosong).fill(null),
      ...Array.from({ length: jumlahHari }, (_, i) => i + 1),
    ];
    return (
      <div>
        <p className="text-center text-sm font-bold text-[#222]">
          {namaBulanPanjang(awal)}
        </p>
        <div className="mt-3 grid grid-cols-7 gap-y-1 text-center text-xs font-semibold text-[#717171]">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((h, i) => (
            <span key={`${h}-${i}`}>{h}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-y-1 text-center">
          {sel.map((hari, i) => {
            if (hari === null) return <span key={`kosong-${i}`} />;
            const iso = keIso(new Date(tahun, bulan, hari));
            const lampau = iso < hariIniIso;
            // Mode detail: tandai check-in DAN check-out + rentang
            // di antaranya (mode cari hanya menandai tanggal terpilih).
            const dipilih =
              mode === 'detail'
                ? iso === tanggal ||
                  (tanggalSelesai !== '' && iso === tanggalSelesai)
                : iso === tanggal;
            const dalamRentang =
              mode === 'detail' &&
              tanggal !== '' &&
              tanggalSelesai !== '' &&
              iso > tanggal &&
              iso < tanggalSelesai;
            const hariIni = iso === hariIniIso;
            return (
              <button
                key={iso}
                type="button"
                disabled={lampau}
                onClick={() =>
                  mode === 'detail'
                    ? pilihTanggalDetail(iso)
                    : setTanggal(iso)
                }
                aria-label={iso}
                aria-pressed={dipilih}
                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm ${
                  dipilih
                    ? 'bg-[#0d2569] font-bold text-white'
                    : dalamRentang
                      ? 'bg-[#e8f1fe] text-[#222]'
                      : lampau
                        ? 'text-[#ddd]'
                        : hariIni
                          ? 'font-bold text-[#222] hover:bg-[#f7f7f7]'
                          : 'text-[#222] hover:bg-[#f7f7f7]'
                }`}
              >
                {hari}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const bulanFleksibelBerikut = Array.from({ length: 6 }, (_, i) => {
    const d = tambahBulan(bulanKini, i);
    return keIso(d).slice(0, 7);
  });

  const segmen = (
    label: string,
    nilai: string,
    nama: 'where' | 'when' | 'who',
    bisaHapus: boolean,
    hapus?: () => void,
  ) => (
    <div className="relative min-w-0 flex-1">
      <button
        type="button"
        onClick={() => bukaPanel(nama)}
        aria-expanded={panel === nama}
        className={`block w-full rounded-full px-5 py-2.5 text-left transition hover:bg-[#f7f7f7] ${
          panel === nama ? 'bg-[#f7f7f7]' : ''
        }`}
      >
        <span className="block text-[11px] font-bold text-[#222]">
          {label}
        </span>
        <span
          className={`block truncate text-sm text-[#717171] ${
            bisaHapus ? 'pr-5' : ''
          }`}
        >
          {nilai}
        </span>
      </button>
      {bisaHapus ? (
        <button
          type="button"
          aria-label={`Clear ${label}`}
          onClick={hapus}
          className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-[#ddd] text-[#222] hover:bg-[#bbb]"
        >
          <X className="h-3 w-3" aria-hidden />
        </button>
      ) : null}
    </div>
  );

  /** Stepper peserta (dipakai panel Who + kartu booking detail). */
  const stepperPeserta = (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={peserta <= 0}
        onClick={() => setPeserta((p) => Math.max(0, p - 1))}
        aria-label="Fewer participants"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd] text-[#222] transition hover:border-[#222] disabled:opacity-30"
      >
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <span className="w-6 text-center text-sm font-semibold text-[#222]">
        {peserta}
      </span>
      <button
        type="button"
        disabled={peserta >= 1000}
        onClick={() => setPeserta((p) => Math.min(1000, p + 1))}
        aria-label="More participants"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd] text-[#222] transition hover:border-[#222] disabled:opacity-30"
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );

  // --- Halaman detail venue (ala Airbnb). ---
  const tampilDetail = (venue: VenueDummy) => {
    const disimpan = wishlist.has(venue.id);
    const [angkaHarga, satuanHarga] = venue.harga.split(' / ');
    const sorotan: { ikon: LucideIcon; judul: string; teks: string }[] = [
      ...(venue.rating >= 4.9
        ? [
            {
              ikon: Trophy,
              judul: 'Top rated venue',
              teks: 'Highly ranked based on ratings and reliability.',
            },
          ]
        : []),
      {
        ikon: MapPin,
        judul: `In ${judulKota(venue.kota)}`,
        teks: `Located at the RRI ${judulKota(venue.kota)} station.`,
      },
      {
        ikon: Users,
        judul: `Capacity ${venue.kapasitas}`,
        teks: `Seats up to ${venue.kapasitas} guests for your event.`,
      },
      {
        ikon: Sparkles,
        judul: 'Full facilities',
        teks: venue.fasilitas.join(', '),
      },
    ];
    const semuaAmenitas = [
      ...venue.fasilitas,
      ...AMENITAS_STANDAR,
      ...AMENITAS_TAMBAHAN,
    ];
    const amenitasTampil = tampilSemuaAmenitas
      ? semuaAmenitas
      : semuaAmenitas.slice(0, 4);
    return (
      <div>
        {/* Judul + Share / Save. */}
        <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-2xl font-bold text-[#222]">
            {judulVenue(venue)}
          </h2>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={bagikan}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#222] underline transition hover:text-[#0d2569]"
            >
              <Share className="h-4 w-4" aria-hidden />
              {tautanDisalin ? 'Link copied' : 'Share'}
            </button>
            <button
              type="button"
              onClick={() => toggleSimpan(venue.id)}
              aria-label="Save to wishlist"
              aria-pressed={disimpan}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#222] underline transition hover:text-[#0d2569]"
            >
              <Heart
                className="h-4 w-4"
                fill={disimpan ? '#2573e2' : 'none'}
                stroke={disimpan ? '#2573e2' : '#222'}
                aria-hidden
              />
              {disimpan ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-[#717171]">
          {venue.nama} in {judulKota(venue.kota)}, Indonesia
        </p>
        <p className="mt-0.5 text-sm text-[#717171]">
          Capacity {venue.kapasitas} · {venue.fasilitas.join(' · ')}
        </p>

        {/* Galeri foto: 1 besar + 4 kecil + Show all photos. */}
        <div className="relative mt-6">
          <div className="grid grid-cols-4 gap-2 overflow-hidden rounded-2xl">
            <button
              type="button"
              onClick={() => setGaleriTerbuka(true)}
              aria-label={`Open photos of ${judulVenue(venue)}`}
              className="relative col-span-2 row-span-2"
            >
              <img
                src={FOTO_VENUE[venue.foto] ?? ''}
                alt={`${venue.nama} in ${judulKota(venue.kota)}`}
                className="h-full w-full object-cover"
              />
            </button>
            {FOTO_GALERI.map((kunci) => (
              <button
                key={kunci}
                type="button"
                onClick={() => setGaleriTerbuka(true)}
                aria-label="Open photos"
                className="relative"
              >
                <img
                  src={FOTO_VENUE[kunci] ?? ''}
                  alt=""
                  className="aspect-[4/3] w-full object-cover"
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setGaleriTerbuka(true)}
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#222] shadow transition hover:bg-[#f7f7f7]"
          >
            <LayoutGrid className="h-4 w-4" aria-hidden />
            Show all photos
          </button>
        </div>

        {/* Isi detail: info kiri + kartu booking kanan. */}
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            {/* Hosted by. */}
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0d2569] text-white">
                <Landmark className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-bold text-[#222]">
                  Hosted by RRI {judulKota(venue.kota)}
                </p>
                <p className="text-sm text-[#717171]">
                  LPP Radio Republik Indonesia · {judulKota(venue.kota)}{' '}
                  station
                </p>
              </div>
            </div>

            {/* Rating strip. */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-[#ddd] px-5 py-4">
              {venue.rating >= 4.9 ? (
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[#222]">
                  <Trophy
                    className="h-5 w-5 text-[#b8860b]"
                    aria-hidden
                  />
                  Client favourite
                </span>
              ) : null}
              <p className="text-sm text-[#222]">
                One of the most loved venues on RRI Deals, according to
                clients.
              </p>
              <span className="ml-auto flex items-center gap-2">
                <span className="text-xl font-bold text-[#222]">
                  {venue.rating.toFixed(2)}
                </span>
                <span
                  className="flex"
                  aria-label={`${venue.rating.toFixed(2)} out of 5`}
                >
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-[#222]"
                      fill="currentColor"
                      aria-hidden
                    />
                  ))}
                </span>
                <span className="text-sm text-[#717171]">
                  {venue.ulasan} reviews
                </span>
              </span>
            </div>

            {/* Highlights. */}
            <div className="mt-8 space-y-5">
              {sorotan.map((s) => {
                const Ikon = s.ikon;
                return (
                  <div key={s.judul} className="flex gap-4">
                    <Ikon
                      className="h-6 w-6 shrink-0 text-[#222]"
                      aria-hidden
                    />
                    <div>
                      <p className="text-sm font-bold text-[#222]">
                        {s.judul}
                      </p>
                      <p className="text-sm text-[#717171]">{s.teks}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Deskripsi. */}
            <div className="mt-8 border-t border-[#ddd] pt-6">
              <p className="text-sm leading-relaxed text-[#222]">
                {venue.deskripsi}
                {venue.hargaCatatan ? ` ${venue.hargaCatatan}.` : ''}
              </p>
            </div>

            {/* What this place offers. */}
            <div className="mt-8 border-t border-[#ddd] pt-6">
              <h3 className="text-xl font-bold text-[#222]">
                What this place offers
              </h3>
              <div className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {amenitasTampil.map((nama) => {
                  const Ikon = IKON_AMENITAS[nama] ?? Check;
                  return (
                    <div key={nama} className="flex items-center gap-3">
                      <Ikon
                        className="h-5 w-5 shrink-0 text-[#222]"
                        aria-hidden
                      />
                      <span className="text-sm text-[#222]">{nama}</span>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() =>
                  setTampilSemuaAmenitas((s) => !s)
                }
                aria-expanded={tampilSemuaAmenitas}
                className="mt-5 rounded-full border border-[#ddd] bg-white px-4 py-2 text-sm font-semibold text-[#222] transition hover:border-[#0d2569] hover:text-[#0d2569]"
              >
                {tampilSemuaAmenitas
                  ? 'Show less'
                  : `Show all ${semuaAmenitas.length} amenities`}
              </button>
            </div>
          </div>

          {/* Kolom kanan: kartu booking + kalender detail di bawahnya. */}
          <div className="space-y-6">
          {/* Kartu booking (sticky). */}
          <aside className="h-fit rounded-2xl border border-[#ddd] bg-white p-6 shadow-lg lg:sticky lg:top-6">
            {referensi ? (
              <div className="rounded-lg border border-[#2573e2]/30 bg-[#e8f1fe] px-4 py-3 text-sm text-[#0d2569]">
                <p className="font-semibold">Booking request received.</p>
                <p className="mt-1">
                  Your reference number is{' '}
                  <span className="font-bold">{referensi}</span> — please
                  keep it for follow-up.
                </p>
              </div>
            ) : (
              <>
                <p className="text-lg text-[#222]">
                  {satuanHarga ? (
                    <>
                      <span className="font-bold">{angkaHarga}</span>
                      {` / ${satuanHarga}`}
                    </>
                  ) : (
                    <span className="font-bold">{venue.harga}</span>
                  )}
                </p>
                {venue.hargaCatatan ? (
                  <p className="mt-1 text-xs text-[#717171]">
                    {venue.hargaCatatan}
                  </p>
                ) : null}

                {/* CHECK-IN / CHECK-OUT / GUESTS (ala Airbnb). */}
                <div className="mt-4 overflow-hidden rounded-xl border border-[#ddd]">
                  <div className="grid grid-cols-2">
                    <label className="block border-r border-[#ddd] px-3 py-2">
                      <span className="block text-[11px] font-bold text-[#222]">
                        CHECK-IN
                      </span>
                      <input
                        type="date"
                        value={tanggal}
                        min={hariIniIso}
                        onChange={(e) => setTanggal(e.target.value)}
                        className="w-full bg-transparent text-sm text-[#222] outline-none"
                      />
                    </label>
                    <label className="block px-3 py-2">
                      <span className="block text-[11px] font-bold text-[#222]">
                        CHECK-OUT
                      </span>
                      <input
                        type="date"
                        value={tanggalSelesai || tanggal}
                        min={tanggal || hariIniIso}
                        onChange={(e) => setTanggalSelesai(e.target.value)}
                        className="w-full bg-transparent text-sm text-[#222] outline-none"
                      />
                    </label>
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-[#ddd] px-3 py-2">
                    <span className="text-[11px] font-bold text-[#222]">
                      GUESTS
                    </span>
                    {stepperPeserta}
                  </div>
                </div>

                <div className="mt-3">
                  <label
                    htmlFor="detail-occasion"
                    className="text-sm font-semibold text-[#0d2569]"
                  >
                    Occasion
                  </label>
                  <select
                    id="detail-occasion"
                    value={keperluan}
                    onChange={(e) => setKeperluan(e.target.value)}
                    className={labelInput}
                  >
                    <option value="">Select an occasion</option>
                    {OCCASION.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-3">
                  <label
                    htmlFor="detail-nama"
                    className="text-sm font-semibold text-[#0d2569]"
                  >
                    Name
                  </label>
                  <input
                    id="detail-nama"
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Your full name"
                    className={labelInput}
                  />
                </div>
                <div className="mt-3">
                  <label
                    htmlFor="detail-kontak"
                    className="text-sm font-semibold text-[#0d2569]"
                  >
                    Contact (phone / WhatsApp)
                  </label>
                  <input
                    id="detail-kontak"
                    type="text"
                    value={kontak}
                    onChange={(e) => setKontak(e.target.value)}
                    placeholder="e.g. 0812-3456-7890"
                    className={labelInput}
                  />
                </div>
                <div className="mt-3">
                  <label
                    htmlFor="detail-email"
                    className="text-sm font-semibold text-[#0d2569]"
                  >
                    Email
                  </label>
                  <input
                    id="detail-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={labelInput}
                  />
                </div>
                {galat ? (
                  <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {galat}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={kirim}
                  disabled={mengirim}
                  className="mt-4 w-full rounded-full bg-[#2573e2] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#0d2569] disabled:opacity-60"
                >
                  {mengirim ? 'Sending…' : 'Send booking request'}
                </button>
                <p className="mt-2 text-center text-xs text-[#717171]">
                  You won&apos;t be charged yet
                </p>
                <p className="mt-3 text-center text-xs text-[#717171]">
                  Your request goes to our team — we will confirm
                  availability and follow up by email.
                </p>
              </>
            )}
          </aside>

          {/* Kalender detail (ala Airbnb): di bawah kartu booking —
              check-in/check-out yang dipilih ditandai; klik tanggal
              memilih check-in lalu check-out (satu bulan + navigasi,
              kolom kanan 360px tidak muat dua bulan). */}
          <section className="rounded-2xl border border-[#ddd] bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#222]">
                Select your dates
              </h3>
              <span className="flex gap-1">
                <button
                  type="button"
                  disabled={bulanAwal <= bulanKini}
                  onClick={() => setBulanAwal((b) => tambahBulan(b, -1))}
                  aria-label="Previous month"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd] text-[#222] transition hover:border-[#222] disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  disabled={
                    tambahBulan(bulanAwal, 1) > tambahBulan(bulanKini, 11)
                  }
                  onClick={() => setBulanAwal((b) => tambahBulan(b, 1))}
                  aria-label="Next month"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd] text-[#222] transition hover:border-[#222] disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </span>
            </div>
            <p className="mt-1 text-sm text-[#717171]">
              {tanggal !== ''
                ? tanggalSelesai !== ''
                  ? `${labelTanggalPendek(tanggal)} – ${labelTanggalPendek(tanggalSelesai)}`
                  : `${labelTanggalPendek(tanggal)} — pick a check-out date`
                : 'Pick a check-in date first'}
            </p>
            <div className="mt-4">{renderBulan(bulanAwal, 'detail')}</div>
          </section>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-white px-4 py-6">
      {/* Backdrop penutup panel saat panel search terbuka (klik di luar). */}
      {panel !== null ? (
        <div
          aria-hidden
          className="fixed inset-0 z-10"
          onClick={() => setPanel(null)}
        />
      ) : null}

      <div className="relative mx-auto w-full max-w-7xl">
        {/* Header: kiri panah + logo RRI; kanan judul gaya logo Deals.
            Logo Deals adalah gambar PNG (src/lib/logoDeals.ts),
            BUKAN file font — judul memakai pendekatan visualnya: navy
            #0D2569, extra-bold/black, letter-spacing rapat, font stack
            sistem aplikasi. Deskripsi halaman dihapus (perintah user
            2026-11-21 12:28 WIB). Logo pindah ke kiri, di samping panah
            (perintah user 2026-11-21 13:04 WIB). */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={detail ? kembaliKeListing : onKembali}
              aria-label={
                detail ? 'Back to venues' : 'Back to Landing Page'
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
            Book a Venue
          </h1>
        </header>

        {detail ? (
          tampilDetail(detail)
        ) : (
          <>
            {/* Bar kategori (ala Airbnb). */}
            <div
              className="mt-8 flex justify-start gap-2 overflow-x-auto pb-1 sm:justify-center"
              role="tablist"
              aria-label="Venue type"
            >
              {TAB_JENIS.map((t) => {
                const Ikon = t.ikon;
                const aktif = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={aktif}
                    onClick={() => {
                      setTab(t.id);
                      setTerapan((lama) => ({ ...lama, tab: t.id }));
                    }}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      aktif
                        ? 'border-[#0d2569] bg-[#0d2569] text-white'
                        : 'border-[#ddd] bg-white text-[#222] hover:border-[#0d2569] hover:text-[#0d2569]'
                    }`}
                  >
                    <Ikon className="h-4 w-4" aria-hidden />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Search bar (ala Airbnb): pil 3 segmen + tombol search. */}
            <div className="relative z-20 mx-auto mt-6 max-w-[850px]">
              {ringkas ? (
                <button
                  type="button"
                  onClick={() => setRingkas(false)}
                  className="flex w-full items-center justify-between gap-3 rounded-full border border-[#ddd] bg-white px-5 py-3 text-left shadow-md transition hover:shadow-lg"
                >
                  <span className="min-w-0 truncate text-sm font-semibold text-[#222]">
                    {labelRingkas}
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2573e2] text-white">
                    <Search className="h-4 w-4" aria-hidden />
                  </span>
                </button>
              ) : (
                <div className="flex flex-col rounded-3xl border border-[#ddd] bg-white p-2 shadow-md sm:flex-row sm:items-center sm:rounded-full">
                  <div className="flex flex-1 flex-col sm:flex-row">
                    {segmen(
                      'Where',
                      kota !== '' ? judulKota(kota) : 'Search destinations',
                      'where',
                      kota !== '',
                      () => {
                        setKota('');
                        setTeksKota('');
                      },
                    )}
                    <div
                      aria-hidden
                      className="mx-2 border-t border-[#ddd] sm:mx-0 sm:border-l sm:border-t-0"
                    />
                    {segmen(
                      'When',
                      labelWhen,
                      'when',
                      tanggal !== '' || bulanFleksibel !== '',
                      () => {
                        setTanggal('');
                        setBulanFleksibel('');
                        setDurasiFleksibel('');
                      },
                    )}
                    <div
                      aria-hidden
                      className="mx-2 border-t border-[#ddd] sm:mx-0 sm:border-l sm:border-t-0"
                    />
                    {segmen(
                      'Who',
                      labelWho !== '' ? labelWho : 'Add participants',
                      'who',
                      peserta > 0 || keperluan !== '',
                      () => {
                        setPeserta(0);
                        setKeperluan('');
                      },
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={terapkanPencarian}
                    aria-label="Search"
                    className={`mt-2 flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#2573e2] px-5 text-sm font-semibold text-white transition hover:bg-[#0d2569] sm:mt-0 sm:h-12 ${
                      panel !== null ? 'sm:w-auto' : 'sm:w-12 sm:px-0'
                    }`}
                  >
                    <Search className="h-4 w-4" aria-hidden />
                    <span className={panel !== null ? '' : 'sm:hidden'}>
                      Search
                    </span>
                  </button>
                </div>
              )}

              {/* Panel Where. */}
              {panel === 'where' ? (
                <div className="absolute left-1/2 top-full z-20 mt-2 w-[min(450px,94vw)] -translate-x-1/2 rounded-3xl border border-[#ddd] bg-white p-5 shadow-xl">
                  <label
                    htmlFor="book-venue-where"
                    className="text-xs font-bold text-[#222]"
                  >
                    Where
                  </label>
                  <input
                    id="book-venue-where"
                    type="text"
                    value={teksKota}
                    onChange={(e) => {
                      setTeksKota(e.target.value);
                      if (e.target.value.trim() === '') setKota('');
                    }}
                    placeholder="Search destinations"
                    autoFocus
                    className="mt-1 block w-full rounded-lg border border-[#ddd] px-3 py-2 text-sm text-[#222] outline-none focus:border-[#2573e2]"
                  />
                  <p className="mt-4 text-xs font-bold text-[#222]">
                    Suggested destinations
                  </p>
                  <div className="mt-2 max-h-72 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setKota('');
                        setTeksKota('');
                        setPanel('when');
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-[#f7f7f7]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f7f7f7] text-[#222]">
                        <Navigation className="h-5 w-5" aria-hidden />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-[#222]">
                          Nearby
                        </span>
                        <span className="block text-sm text-[#717171]">
                          Find what&apos;s around you
                        </span>
                      </span>
                    </button>
                    {kotaTersaring.map((nama) => (
                      <button
                        key={nama}
                        type="button"
                        onClick={() => pilihKota(nama)}
                        className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-[#f7f7f7]"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f7f7f7] text-[#222]">
                          <MapPin className="h-5 w-5" aria-hidden />
                        </span>
                        <span>
                          <span className="block text-sm font-bold text-[#222]">
                            {judulKota(nama)}
                          </span>
                          <span className="block text-sm text-[#717171]">
                            Indonesia
                          </span>
                        </span>
                      </button>
                    ))}
                    {kotaTersaring.length === 0 ? (
                      <p className="px-2 py-3 text-sm text-[#717171]">
                        No destinations match &ldquo;{teksKota.trim()}&rdquo;.
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Panel When. */}
              {panel === 'when' ? (
                <div className="absolute left-1/2 top-full z-20 mt-2 w-[min(700px,94vw)] -translate-x-1/2 rounded-3xl border border-[#ddd] bg-white p-5 shadow-xl">
                  <div className="mx-auto flex w-fit rounded-full bg-[#f7f7f7] p-1">
                    {(['dates', 'flexible'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setModeKalender(mode)}
                        aria-pressed={modeKalender === mode}
                        className={`rounded-full px-5 py-1.5 text-sm font-semibold ${
                          modeKalender === mode
                            ? 'bg-white text-[#222] shadow'
                            : 'text-[#717171]'
                        }`}
                      >
                        {mode === 'dates' ? 'Dates' : 'Flexible'}
                      </button>
                    ))}
                  </div>

                  {modeKalender === 'dates' ? (
                    <>
                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#222]">
                          Pick a date
                        </span>
                        <span className="flex gap-1">
                          <button
                            type="button"
                            disabled={bulanAwal <= bulanKini}
                            onClick={() =>
                              setBulanAwal((b) => tambahBulan(b, -1))
                            }
                            aria-label="Previous month"
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd] text-[#222] transition hover:border-[#222] disabled:opacity-30"
                          >
                            <ChevronLeft className="h-4 w-4" aria-hidden />
                          </button>
                          <button
                            type="button"
                            disabled={tambahBulan(bulanAwal, 1) > tambahBulan(bulanKini, 11)}
                            onClick={() =>
                              setBulanAwal((b) => tambahBulan(b, 1))
                            }
                            aria-label="Next month"
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd] text-[#222] transition hover:border-[#222] disabled:opacity-30"
                          >
                            <ChevronRight className="h-4 w-4" aria-hidden />
                          </button>
                        </span>
                      </div>
                      <div className="mt-4 grid gap-6 sm:grid-cols-2">
                        {renderBulan(bulanAwal)}
                        {renderBulan(tambahBulan(bulanAwal, 1))}
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {FLEKSIBEL_OPSI.map((opsi) => (
                          <button
                            key={opsi}
                            type="button"
                            onClick={() => setFleksibel(opsi)}
                            aria-pressed={fleksibel === opsi}
                            className={`rounded-full border px-3.5 py-1.5 text-sm ${
                              fleksibel === opsi
                                ? 'border-[#222] font-semibold text-[#222]'
                                : 'border-[#ddd] text-[#717171] hover:border-[#222] hover:text-[#222]'
                            }`}
                          >
                            {opsi}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mt-5 text-sm font-semibold text-[#222]">
                        How long?
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {DURASI_FLEKSIBEL.map((durasi) => (
                          <button
                            key={durasi}
                            type="button"
                            onClick={() => setDurasiFleksibel(durasi)}
                            aria-pressed={durasiFleksibel === durasi}
                            className={`rounded-full border px-4 py-1.5 text-sm ${
                              durasiFleksibel === durasi
                                ? 'border-[#0d2569] bg-[#0d2569] font-semibold text-white'
                                : 'border-[#ddd] text-[#222] hover:border-[#0d2569]'
                            }`}
                          >
                            {durasi}
                          </button>
                        ))}
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {bulanFleksibelBerikut.map((yyyyMm) => (
                          <button
                            key={yyyyMm}
                            type="button"
                            onClick={() => {
                              setBulanFleksibel(yyyyMm);
                              setTanggal('');
                            }}
                            aria-pressed={bulanFleksibel === yyyyMm}
                            className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-left text-sm font-semibold ${
                              bulanFleksibel === yyyyMm
                                ? 'border-[#0d2569] bg-[#e8f1fe] text-[#0d2569]'
                                : 'border-[#ddd] text-[#222] hover:border-[#0d2569]'
                            }`}
                          >
                            <CalendarDays
                              className="h-4 w-4 shrink-0"
                              aria-hidden
                            />
                            {labelBulan(yyyyMm)}
                          </button>
                        ))}
                      </div>
                      <p className="mt-4 text-xs text-[#717171]">
                        Flexible dates don&apos;t pin a day — pick your exact
                        date on the venue detail page.
                      </p>
                    </>
                  )}
                </div>
              ) : null}

              {/* Panel Who. */}
              {panel === 'who' ? (
                <div className="absolute left-1/2 top-full z-20 mt-2 w-[min(380px,94vw)] -translate-x-1/2 rounded-3xl border border-[#ddd] bg-white p-5 shadow-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[#222]">Participants</p>
                      <p className="text-[13px] text-[#717171]">
                        How many people will attend?
                      </p>
                    </div>
                    {stepperPeserta}
                  </div>
                  <div className="mt-5">
                    <label
                      htmlFor="book-venue-who-occasion"
                      className="text-sm font-bold text-[#222]"
                    >
                      Occasion
                    </label>
                    <div className="relative mt-1">
                      <select
                        id="book-venue-who-occasion"
                        value={keperluan}
                        onChange={(e) => setKeperluan(e.target.value)}
                        className="block w-full appearance-none rounded-lg border border-[#ddd] bg-white px-3 py-2 pr-8 text-sm text-[#222] outline-none focus:border-[#2573e2]"
                      >
                        <option value="">Select an occasion</option>
                        {OCCASION.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#717171]"
                        aria-hidden
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Hasil pencarian. */}
            <div id="hasil-venue" className="mt-12 scroll-mt-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-[#222]">{judulHasil}</h2>
                  <p className="mt-1 text-sm text-[#717171]">
                    {hasil.length} of {VENUE_DUMMY.length} venues
                    {wishlist.size > 0
                      ? ` · ${wishlist.size} saved`
                      : ''}
                  </p>
                  <p className="mt-1 text-xs text-[#717171]">
                    Rates shown are package tariffs (PP 68/2020) — venues
                    without a listed tariff show &ldquo;Price on request&rdquo;.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHanyaSimpan((s) => !s)}
                    aria-pressed={hanyaSimpan}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                      hanyaSimpan
                        ? 'border-[#0d2569] bg-[#0d2569] text-white'
                        : 'border-[#ddd] bg-white text-[#222] hover:border-[#0d2569]'
                    }`}
                  >
                    <Heart
                      className="h-4 w-4"
                      fill={hanyaSimpan ? 'currentColor' : 'none'}
                      aria-hidden
                    />
                    Saved
                  </button>
                  {filterAktif ? (
                    <button
                      type="button"
                      onClick={bersihkanFilter}
                      className="rounded-full border border-[#ddd] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#222] transition hover:border-[#0d2569] hover:text-[#0d2569]"
                    >
                      Clear filters
                    </button>
                  ) : null}
                </div>
              </div>

              {hasil.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-[#ddd] bg-white px-6 py-10 text-center">
                  <p className="text-base font-semibold text-[#222]">
                    No venues match your search.
                  </p>
                  <p className="mt-1 text-sm text-[#717171]">
                    Try a different city, fewer participants, or another venue
                    type.
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
                <div className="mt-6 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {hasil.map((venue) => {
                    const disimpan = wishlist.has(venue.id);
                    const [angkaHarga, satuanHarga] = venue.harga.split(' / ');
                    return (
                      <article
                        key={venue.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`View details of ${judulVenue(venue)}`}
                        onClick={() => bukaDetail(venue.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            bukaDetail(venue.id);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <div className="relative">
                          <img
                            src={FOTO_VENUE[venue.foto] ?? ''}
                            alt={`${venue.nama} in ${judulKota(venue.kota)}`}
                            className="aspect-[4/3] w-full rounded-2xl object-cover"
                            loading="lazy"
                          />
                          {venue.rating >= 4.9 ? (
                            <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#222] shadow">
                              Client favourite
                            </span>
                          ) : null}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSimpan(venue.id);
                            }}
                            aria-label={
                              disimpan
                                ? `Remove ${judulVenue(venue)} from wishlist`
                                : `Save ${judulVenue(venue)} to wishlist`
                            }
                            aria-pressed={disimpan}
                            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center"
                          >
                            <Heart
                              className="h-6 w-6 drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)]"
                              fill={disimpan ? '#2573e2' : 'none'}
                              stroke={disimpan ? '#2573e2' : '#222'}
                              strokeWidth={2}
                              aria-hidden
                            />
                          </button>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-[15px] font-semibold text-[#222]">
                              {judulVenue(venue)}
                            </h3>
                            <span className="inline-flex shrink-0 items-center gap-1 text-sm text-[#222]">
                              <Star
                                className="h-3.5 w-3.5"
                                fill="currentColor"
                                aria-hidden
                              />
                              {venue.rating.toFixed(2)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-[#717171]">
                            Capacity {venue.kapasitas} ·{' '}
                            {venue.fasilitas.slice(0, 2).join(', ')}
                          </p>
                          <p className="mt-0.5 text-[15px] text-[#222]">
                            {satuanHarga ? (
                              <>
                                <span className="font-semibold">{angkaHarga}</span>
                                {` / ${satuanHarga}`}
                              </>
                            ) : (
                              <span className="font-semibold">
                                {venue.harga}
                              </span>
                            )}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Lightbox galeri foto (halaman detail). */}
      {galeriTerbuka && detail ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Photos of ${judulVenue(detail)}`}
          onClick={() => setGaleriTerbuka(false)}
        >
          <div
            className="mx-auto flex w-full max-w-5xl items-center justify-between py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold text-white">
              Photos of {judulVenue(detail)}
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
            className="mx-auto grid w-full max-w-5xl flex-1 content-center gap-2 overflow-y-auto sm:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            {[detail.foto, ...FOTO_GALERI].map((kunci) => (
              <img
                key={kunci}
                src={FOTO_VENUE[kunci] ?? ''}
                alt={
                  kunci === detail.foto
                    ? `${detail.nama} in ${judulKota(detail.kota)}`
                    : 'Additional view of an RRI venue'
                }
                className="w-full rounded-xl object-cover"
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

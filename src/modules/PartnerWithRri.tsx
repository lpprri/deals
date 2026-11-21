// Modul Partner with RRI — halaman PUBLIK "Partner with RRI" (tanpa login).
//
// Permintaan pengguna 2026-11-21 17:05 WIB (keputusan studi Traveloka) +
// spec partner-with-rri-spec.md (disetujui pengguna 2026-11-21 19:38 WIB):
// halaman publik baru (seperti 3 halaman layanan), BUKAN section landing.
// Irama Traveloka (hero + 3 pintu + statistik + langkah + FAQ) dengan arah
// dibalik: Traveloka merekrut supplier untuk menjual DI platformnya; RRI
// menjual jangkauan/layanannya KE bisnis.
//
// Urutan section: Hero → 3 pintu → Why Partner with RRI → Trusted by →
// Who partners with RRI → media-partner audiences → 4 Easy Steps → FAQ →
// form Partnership Request + checklist proposal. Footer landing TIDAK
// dirender di halaman ini (pola ketiga halaman layanan lain — Book a
// Venue / Rent a Space / Learning Centre juga tanpa footer; footer
// sendiri tidak berubah kecuali pill "Partner with RRI" yang dipindah
// ke halaman ini).
//
// DATA — hanya yang terverifikasi, TIDAK ada angka karangan:
// - Statistik: HANYA 69 satker / 67+ kota (keputusan pengguna 17:05 WIB —
//   angka-angka landing (proyek/klien/kepuasan) TIDAK dipakai).
// - MoU: agregat dari src/lib/seedMou.ts (44 record, Palembang pilot),
//   dihitung ulang dari file 2026-11-21 (bukan disalin dari spec):
//   kategori 18/9/7/5/2/1/1/1, jenis 26/17/1, tema 7/6/6/4/3/3/3/3/5
//   (tema "Pengarusutamaan Gender dan Inklusi" 5 = 3 + 2 — sumber
//   menulisnya dengan dua ejaan, "Program Siaran ..." dan
//   "Program siaran ..."). NAMA institusi TIDAK ditampilkan (keputusan
//   pengguna, default spec) — hanya kategori + jumlah + tema. Modul ini
//   TIDAK mengimpor MOU_NYATA (record-nya memuat nomor telepon
//   narahubung — data pribadi, tidak boleh ikut ke bundle publik).
// - Logo mitra: LOGO_MITRA yang sama dengan strip landing (10 logo,
//   dipakai ulang — TIDAK diregenerasi). Logo-logo itu artwork PUTIH
//   (diolah untuk latar navy landing), jadi section Trusted by memakai
//   latar navy yang sama (.mk-latar-navy), bukan latar putih.
// - TIDAK ADA: penghargaan, kesaksian klien, tabel harga, portal
//   supplier. Label lama yang dihapus dari footer 2026-11-21 TIDAK
//   PERNAH dipakai di halaman ini (pakai "Join Our Event" dan
//   "Be Media Partner").
//
// Form Partnership Request (Nama, Institusi/Organisasi, Email, Jenis
// Kemitraan, Pesan) menyimpan ke koleksi 'partnershipRequest' (id
// 'PTR-…', status 'Baru', satker PALEMBANG 41) lewat prop onKirim (pola
// sama dengan form layanan PR #126 — handler di App.tsx).

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Handshake,
  MapPin,
  Megaphone,
  Phone,
} from 'lucide-react';
import { LOGO_RRI_LOCKUP_DATA_URI } from '../lib/logoRriLockup';
import { LOGO_MITRA } from '../lib/logoMitra';
import type { PermintaanPartnershipPublikInput } from '../lib/store';

export interface PartnerWithRriProps {
  /** Kembali ke landing page. */
  onKembali: () => void;
  /** Buka halaman "Plan a Campaign" publik (form Tally embed). */
  onPlanCampaign: () => void;
  /** Buka halaman "Book a Venue" publik. */
  onBookVenue: () => void;
  /** Buka halaman "Rent a Space" publik. */
  onRentSpace: () => void;
  /** Buka hub "Learning Centre" publik. */
  onTraining: () => void;
  /** Buka kartu booking landing ("Book a Free Call") — App mengarahkan
      ke beranda lalu menggulir ke kartu booking. */
  onBookFreeCall: () => void;
  /** Kirim Partnership Request — handler di App.tsx (pola form layanan
      PR #126); mengembalikan { galat, id } — id = nomor referensi PTR-…
      yang ditampilkan ke pengunjung. */
  onKirim: (
    input: PermintaanPartnershipPublikInput,
  ) => Promise<{ galat: string | null; id?: string }>;
}

/** Pilihan Jenis Kemitraan (spec — persis lima ini). */
const JENIS_KEMITRAAN = [
  'Media Partner',
  'Join Our Event',
  'MoU',
  'Event Support',
  'Other',
] as const;

/**
 * Agregat MoU — dihitung dari src/lib/seedMou.ts (44 record) 2026-11-21.
 * TIDAK mengimpor MOU_NYATA (lihat komentar file di atas).
 */
const KATEGORI_MOU: { nama: string; jumlah: number }[] = [
  { nama: 'Instansi Pemerintahan', jumlah: 18 },
  { nama: 'Komunitas', jumlah: 9 },
  { nama: 'Pemerintah Daerah', jumlah: 7 },
  { nama: 'Universitas', jumlah: 5 },
  { nama: 'Asosiasi Pelaku Usaha', jumlah: 2 },
  { nama: 'Organisasi Kemasyarakatan', jumlah: 1 },
  { nama: 'Rumah Sakit', jumlah: 1 },
  { nama: 'Sekolah', jumlah: 1 },
];
const JENIS_MOU: { nama: string; jumlah: number }[] = [
  { nama: 'Nota Kesepahaman', jumlah: 26 },
  { nama: 'Perjanjian Kerjasama', jumlah: 17 },
  { nama: 'Pelaksanaan Kerja Sama', jumlah: 1 },
];
const TEMA_MOU: { nama: string; jumlah: number }[] = [
  { nama: 'Portal RRI.CO.ID', jumlah: 7 },
  { nama: 'Kepala Daerah Menyapa', jumlah: 6 },
  { nama: 'UMKM Bicara', jumlah: 6 },
  { nama: 'Indonesia Cerdas', jumlah: 4 },
  { nama: 'Mutiara Pagi', jumlah: 3 },
  { nama: 'Palembang Menyapa', jumlah: 3 },
  { nama: 'Literasi Digital', jumlah: 3 },
  { nama: 'Ruang Disabilitas dan Inklusi', jumlah: 3 },
  { nama: 'Pengarusutamaan Gender dan Inklusi', jumlah: 5 },
];

/** Checklist proposal 7 poin (adaptasi pro-tip Traveloka — spec §9). */
const CHECKLIST_PROPOSAL = [
  {
    judul: 'Business overview',
    isi: 'What you do and who you serve.',
  },
  {
    judul: 'Your unique selling points',
    isi: 'What makes your business or event stand out.',
  },
  {
    judul: 'Proposed partnership model',
    isi: 'Advertising, media partnership, event support, or MoU.',
  },
  {
    judul: 'Your goals',
    isi: 'What you want this partnership to achieve.',
  },
  {
    judul: 'Resources you need from RRI',
    isi: 'Airtime, venue, space, training, or media coverage.',
  },
  {
    judul: 'Performance estimates',
    isi: 'Expected reach, attendance, or sales — if you have them.',
  },
  {
    judul: 'Timeline',
    isi: 'When you want the partnership to start.',
  },
];

export default function PartnerWithRri({
  onKembali,
  onPlanCampaign,
  onBookVenue,
  onRentSpace,
  onTraining,
  onBookFreeCall,
  onKirim,
}: PartnerWithRriProps) {
  // Halaman publik dibuka dari footer landing (SPA: posisi gulir window
  // TIDAK reset saat komponen mount) — mulai dari atas (pola 7 halaman
  // publik lain).
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  // --- FAQ (pola accordion landing Marklo.tsx: Faq — kartu membulat,
  //     +/−, animasi grid-rows; pertama terbuka). ---
  const [faqTerbuka, setFaqTerbuka] = useState(0);
  const faq: {
    q: string;
    a: string;
    tautan?: { label: string; onClick: () => void }[];
  }[] = [
    {
      q: 'Who can become an RRI partner?',
      a: 'Any business or institution — advertisers, event organisers, media, and training participants. No account is needed to enquire.',
    },
    {
      q: 'What forms of cooperation exist?',
      a: 'Advertising, venue and space rental, training, media partnership, and event or programme support through an MoU or Commitment.',
    },
    {
      q: 'How do I advertise?',
      a: 'Plan a Campaign and our team will prepare a quotation. An accepted quotation becomes an Order, then a PKS.',
      tautan: [{ label: 'Plan a Campaign', onClick: onPlanCampaign }],
    },
    {
      q: 'How do I book a venue, rent space, or join training?',
      a: 'Use the three service pages below.',
      tautan: [
        { label: 'Book a Venue', onClick: onBookVenue },
        { label: 'Rent a Space', onClick: onRentSpace },
        { label: 'Learning Centre', onClick: onTraining },
      ],
    },
    {
      q: 'How do I become a media partner or support an event?',
      a: 'Send a Partnership Request below and our team will contact you.',
      tautan: [
        {
          label: 'Go to the form',
          onClick: () =>
            document
              .getElementById('partnership-form')
              ?.scrollIntoView({ behavior: 'smooth' }),
        },
      ],
    },
    {
      q: 'What does it cost?',
      a: 'Tariffs follow PP 68/2020 (Knowledge Base). A quotation is prepared per request — no tariff list is published on this page.',
    },
    {
      q: 'How do I track my cooperation?',
      a: 'Use the Track your Deal page with your PKS or invoice number. Linked clients can also sign in to the client portal.',
    },
    {
      q: 'Who do I contact?',
      a: 'Send a Partnership Request below or book a free call. Our head office: Jl. Medan Merdeka Barat No. 4–5, Jakarta Pusat 10110, +62 21 350 0584 / +62 21 351 1086.',
    },
  ];

  // --- Form Partnership Request. ---
  const [nama, setNama] = useState('');
  const [institusi, setInstitusi] = useState('');
  const [email, setEmail] = useState('');
  const [jenis, setJenis] =
    useState<(typeof JENIS_KEMITRAAN)[number]>('Media Partner');
  const [pesan, setPesan] = useState('');
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [referensi, setReferensi] = useState<string | null>(null);

  const kirim = async () => {
    setGalat(null);
    setReferensi(null);
    if (!nama.trim()) {
      setGalat('Name is required.');
      return;
    }
    if (!institusi.trim()) {
      setGalat('Institution / Organisation is required.');
      return;
    }
    if (!email.trim()) {
      setGalat('Email is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setGalat('Email format is not valid.');
      return;
    }
    if (!pesan.trim()) {
      setGalat('Message is required.');
      return;
    }
    setMengirim(true);
    const hasilKirim = await onKirim({
      nama: nama.trim(),
      institusi: institusi.trim(),
      email: email.trim(),
      jenisKemitraan: jenis,
      pesan: pesan.trim(),
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
  const judulSection =
    'text-3xl font-extrabold tracking-tight text-[#0d2569]';
  const subSection = 'mt-3 text-base leading-relaxed text-[#475467]';

  return (
    <div className="relative min-h-screen overflow-x-clip bg-white px-4 py-6">
      <div className="relative mx-auto w-full max-w-7xl">
        {/* Header pola Book a Venue: kiri panah + logo RRI; kanan judul.
            Tanpa deskripsi, tanpa teks back yang terlihat. */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onKembali}
              aria-label="Back to Landing Page"
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
            Partner with RRI
          </h1>
        </header>

        {/* Hero — satu CTA utama (Plan a Campaign), sekunder
            Book a Free Call. */}
        <section className="mt-10 text-center">
          <h2 className="text-4xl font-black tracking-tight text-[#0d2569] sm:text-5xl">
            Partner with RRI
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-[#475467]">
            69 work units in 67+ cities — Indonesia&apos;s national public
            broadcaster.
          </p>
          <p className="mt-2 text-base text-[#475467]">
            Choose the partnership that fits you.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onPlanCampaign}
              className="inline-flex items-center gap-2 rounded-full bg-[#2573e2] px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-[#0d2569]"
            >
              Plan a Campaign
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={onBookFreeCall}
              className="inline-flex items-center gap-2 rounded-full border border-[#2573e2] bg-white px-6 py-3 text-sm font-semibold text-[#2573e2] transition hover:bg-[#e8f1fe]"
            >
              Book a Free Call
            </button>
          </div>
        </section>

        {/* Tiga pintu kemitraan. */}
        <section className="mt-16">
          <div className="grid gap-6 md:grid-cols-3">
            <article className="rounded-[20px] bg-white p-6 shadow-md ring-1 ring-slate-200">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f1fe] text-[#0d2569]">
                <Megaphone className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-4 text-xl font-extrabold text-[#0d2569]">
                Advertise with RRI
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#475467]">
                Reach listeners across Indonesia — radio spots, adlibs,
                advertorials, jingles, dialogues, and podcasts.
              </p>
              <p className="mt-3 text-sm text-[#475467]">
                Spot Iklan · Adlibs · Advertorial · Jingle · Dialog
                Interaktif · Podcast
              </p>
              <button
                type="button"
                onClick={onPlanCampaign}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#2573e2] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#0d2569]"
              >
                Plan a Campaign
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </article>
            <article className="rounded-[20px] bg-white p-6 shadow-md ring-1 ring-slate-200">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f1fe] text-[#0d2569]">
                <Building2 className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-4 text-xl font-extrabold text-[#0d2569]">
                Use RRI&apos;s Spaces &amp; Services
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#475467]">
                Venues, land, and training from Indonesia&apos;s public
                broadcaster.
              </p>
              <div className="mt-4 flex flex-col items-start gap-2">
                <button
                  type="button"
                  onClick={onBookVenue}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2573e2] transition hover:text-[#0d2569] hover:underline"
                >
                  Book a Venue
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={onRentSpace}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2573e2] transition hover:text-[#0d2569] hover:underline"
                >
                  Rent a Space
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={onTraining}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2573e2] transition hover:text-[#0d2569] hover:underline"
                >
                  Learning Centre
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </article>
            <article className="rounded-[20px] bg-white p-6 shadow-md ring-1 ring-slate-200">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f1fe] text-[#0d2569]">
                <Handshake className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-4 text-xl font-extrabold text-[#0d2569]">
                Partner with RRI
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#475467]">
                Be a media partner, join our event, or support a programme
                through an MoU.
              </p>
              <p className="mt-3 text-sm text-[#475467]">
                Be Media Partner · Join Our Event · MoU / Commitment
              </p>
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById('partnership-form')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#2573e2] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#0d2569]"
              >
                Tell us your interest
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </article>
          </div>
        </section>

        {/* Why Partner with RRI — HANYA angka terverifikasi. */}
        <section className="mt-16 text-center">
          <h2 className={judulSection}>Why Partner with RRI</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-[#475467]">
            Indonesia&apos;s national public broadcaster — on air and on the
            ground in cities across the country.
          </p>
          <div className="mx-auto mt-8 grid max-w-2xl gap-6 sm:grid-cols-2">
            <div className="rounded-[20px] bg-white p-6 shadow-md ring-1 ring-slate-200">
              <p className="text-5xl font-black text-[#0d2569]">69</p>
              <p className="mt-2 text-sm font-semibold text-[#475467]">
                Work Units
              </p>
            </div>
            <div className="rounded-[20px] bg-white p-6 shadow-md ring-1 ring-slate-200">
              <p className="text-5xl font-black text-[#0d2569]">67+</p>
              <p className="mt-2 text-sm font-semibold text-[#475467]">
                Cities
              </p>
            </div>
          </div>
        </section>

        {/* Trusted by — strip logo landing (10 logo, dipakai ulang) di
            atas latar navy yang sama — logo artwork-nya putih. */}
        <section className="mk-latar-navy -mx-4 mt-16 px-4 py-12">
          <div className="mx-auto max-w-7xl">
            <p className="text-center text-sm font-bold tracking-wide text-white">
              Trusted by hundreds of companies in Indonesia
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
              {LOGO_MITRA.map((logo) => (
                <img
                  key={logo.nama}
                  src={logo.logoDataUri}
                  alt={logo.nama}
                  className="h-10 w-auto"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Who partners with RRI — agregat MoU (44 record). */}
        <section className="mt-16">
          <h2 className={judulSection}>Who partners with RRI</h2>
          <p className={subSection}>
            Based on 44 partnership records — institutions that already work
            with RRI.
          </p>
          <h3 className="mt-8 text-lg font-extrabold text-[#0d2569]">
            By category
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {KATEGORI_MOU.map((k) => (
              <span
                key={k.nama}
                className="inline-flex items-center gap-2 rounded-full bg-[#e8f1fe] px-4 py-2 text-sm font-semibold text-[#0d2569]"
              >
                {k.nama}
                <span className="rounded-full bg-[#2573e2] px-2 py-0.5 text-xs font-bold text-white">
                  {k.jumlah}
                </span>
              </span>
            ))}
          </div>
          <h3 className="mt-8 text-lg font-extrabold text-[#0d2569]">
            By agreement type
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {JENIS_MOU.map((j) => (
              <span
                key={j.nama}
                className="inline-flex items-center gap-2 rounded-full bg-[#e8f1fe] px-4 py-2 text-sm font-semibold text-[#0d2569]"
              >
                {j.nama}
                <span className="rounded-full bg-[#2573e2] px-2 py-0.5 text-xs font-bold text-white">
                  {j.jumlah}
                </span>
              </span>
            ))}
          </div>
          <h3 className="mt-8 text-lg font-extrabold text-[#0d2569]">
            Top programme themes
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {TEMA_MOU.map((t) => (
              <span
                key={t.nama}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0d2569] ring-1 ring-slate-200"
              >
                {t.nama}
                <span className="rounded-full bg-[#2573e2] px-2 py-0.5 text-xs font-bold text-white">
                  {t.jumlah}
                </span>
              </span>
            ))}
          </div>
        </section>

        {/* Who can be a media partner + target perluasan MoU. */}
        <section className="mt-16">
          <h2 className={judulSection}>Who can be a media partner</h2>
          <p className={subSection}>
            Media partners of RRI are usually community groups, academic and
            student communities, and event organisers holding concerts in a
            city.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <article className="rounded-[20px] bg-white p-6 shadow-md ring-1 ring-slate-200">
              <h3 className="text-lg font-extrabold text-[#0d2569]">
                Community groups
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#475467]">
                Local communities that want their activities heard on air.
              </p>
            </article>
            <article className="rounded-[20px] bg-white p-6 shadow-md ring-1 ring-slate-200">
              <h3 className="text-lg font-extrabold text-[#0d2569]">
                Academic &amp; student communities
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#475467]">
                Universities and student communities that run programmes
                with RRI.
              </p>
            </article>
            <article className="rounded-[20px] bg-white p-6 shadow-md ring-1 ring-slate-200">
              <h3 className="text-lg font-extrabold text-[#0d2569]">
                Event organisers
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#475467]">
                Organisers holding concerts and events in a city.
              </p>
            </article>
          </div>
          <div className="mt-6 rounded-[20px] bg-[#e8f1fe] p-6">
            <h3 className="text-lg font-extrabold text-[#0d2569]">
              We are also expanding our MoU partnerships
            </h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#0d2569]/80">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                Event organisers managing auditoriums, halls, and meeting
                rooms.
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                Hotels offering rooms for RRI official activities.
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                Event organisers acting as a third party between RRI and
                broadcast / advertising clients.
              </li>
            </ul>
          </div>
        </section>

        {/* Start a Partnership in 4 Easy Steps. */}
        <section className="mt-16">
          <h2 className={judulSection}>Start a Partnership in 4 Easy Steps</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                judul: 'Tell us your interest',
                isi: 'Send a Partnership Request, plan a campaign, or book a free call.',
              },
              {
                judul: "Let's discuss",
                isi: 'Our team contacts you to discuss your needs and prepare a quotation.',
              },
              {
                judul: 'Sign the agreement',
                isi: 'We formalise the cooperation in a PKS or MoU.',
              },
              {
                judul: "You're live",
                isi: 'Your campaign, event, or programme goes live.',
              },
            ].map((langkah, i) => (
              <article
                key={langkah.judul}
                className="rounded-[20px] bg-white p-6 shadow-md ring-1 ring-slate-200"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0d2569] text-base font-black text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-[#0d2569]">
                  {langkah.judul}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475467]">
                  {langkah.isi}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* FAQ — pola accordion landing (Faq di Marklo.tsx). */}
        <section className="mt-16">
          <h2 className={judulSection}>Frequently Asked Questions</h2>
          <div className="mt-8 space-y-4">
            {faq.map((item, i) => {
              const aktif = faqTerbuka === i;
              return (
                <div
                  key={item.q}
                  className={`overflow-hidden rounded-[20px] shadow-md transition ${
                    aktif
                      ? 'bg-[#2573e2] text-white'
                      : 'bg-white text-[#0d2569] ring-1 ring-slate-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setFaqTerbuka(aktif ? -1 : i)}
                    aria-expanded={aktif}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  >
                    <span className="text-base font-extrabold">{item.q}</span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                        aktif ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#0d2569]'
                      }`}
                      aria-hidden="true"
                    >
                      {aktif ? '−' : '+'}
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ${
                      aktif
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p
                        className={`px-5 pb-3 text-sm leading-relaxed ${
                          aktif ? 'text-white/90' : 'text-slate-500'
                        }`}
                      >
                        {item.a}
                      </p>
                      {item.tautan && (
                        <div className="flex flex-wrap gap-2 px-5 pb-5">
                          {item.tautan.map((t) => (
                            <button
                              key={t.label}
                              type="button"
                              onClick={t.onClick}
                              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                                aktif
                                  ? 'bg-white text-[#0d2569] hover:bg-[#e8f1fe]'
                                  : 'bg-[#2573e2] text-white hover:bg-[#0d2569]'
                              }`}
                            >
                              {t.label}
                              <ArrowRight className="h-4 w-4" aria-hidden />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* "Got any questions?" + checklist proposal + form Partnership
            Request — satu section, form di kiri, checklist di kanan. */}
        <section id="partnership-form" className="mt-16 scroll-mt-8 pb-8">
          <h2 className={judulSection}>Got any questions?</h2>
          <p className={subSection}>
            Send a Partnership Request and our team will get back to you.
            Before you write, the checklist below helps you prepare a
            complete proposal.
          </p>
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-5">
            <article className="rounded-[20px] bg-white p-6 shadow-md ring-1 ring-slate-200 lg:col-span-3">
              <h3 className="text-lg font-extrabold text-[#0d2569]">
                Partnership Request
              </h3>
              <p className="mt-1 text-sm text-[#475467]">
                We reply to every request — tell us what you have in mind.
              </p>
              <div className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="ptr-nama"
                    className="text-sm font-semibold text-[#0d2569]"
                  >
                    Name
                  </label>
                  <input
                    id="ptr-nama"
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className={labelInput}
                    autoComplete="name"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="ptr-institusi"
                    className="text-sm font-semibold text-[#0d2569]"
                  >
                    Institution / Organisation
                  </label>
                  <input
                    id="ptr-institusi"
                    type="text"
                    value={institusi}
                    onChange={(e) => setInstitusi(e.target.value)}
                    className={labelInput}
                    autoComplete="organization"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="ptr-email"
                    className="text-sm font-semibold text-[#0d2569]"
                  >
                    Email
                  </label>
                  <input
                    id="ptr-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={labelInput}
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="ptr-jenis"
                    className="text-sm font-semibold text-[#0d2569]"
                  >
                    Partnership Type
                  </label>
                  <select
                    id="ptr-jenis"
                    value={jenis}
                    onChange={(e) =>
                      setJenis(
                        e.target.value as (typeof JENIS_KEMITRAAN)[number],
                      )
                    }
                    className={labelInput}
                  >
                    {JENIS_KEMITRAAN.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="ptr-pesan"
                    className="text-sm font-semibold text-[#0d2569]"
                  >
                    Message
                  </label>
                  <textarea
                    id="ptr-pesan"
                    rows={4}
                    value={pesan}
                    onChange={(e) => setPesan(e.target.value)}
                    className={labelInput}
                    required
                  />
                </div>
                {galat && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {galat}
                  </div>
                )}
                {referensi ? (
                  <div className="rounded-xl border border-[#2573e2]/30 bg-[#e8f1fe] px-4 py-3">
                    <p className="text-sm font-bold text-[#0d2569]">
                      Request sent.
                    </p>
                    <p className="mt-1 text-sm text-[#475467]">
                      Your reference number is{' '}
                      <strong className="text-[#0d2569]">{referensi}</strong>.
                      Our team will contact you.
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={kirim}
                    disabled={mengirim}
                    className="inline-flex items-center gap-2 rounded-full bg-[#2573e2] px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-[#0d2569] disabled:opacity-60"
                  >
                    {mengirim ? 'Sending…' : 'Send Partnership Request'}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>
            </article>
            <aside className="rounded-[20px] bg-[#e8f1fe] p-6 lg:col-span-2">
              <h3 className="text-lg font-extrabold text-[#0d2569]">
                A good proposal covers
              </h3>
              <p className="mt-1 text-sm text-[#0d2569]/70">
                Seven points — the more complete, the faster we can reply.
              </p>
              <ul className="mt-4 space-y-4">
                {CHECKLIST_PROPOSAL.map((c) => (
                  <li key={c.judul} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2573e2] text-white">
                      <Check className="h-4 w-4" aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[#0d2569]">
                        {c.judul}
                      </p>
                      <p className="text-sm leading-relaxed text-[#0d2569]/70">
                        {c.isi}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 space-y-2 border-t border-[#2573e2]/20 pt-4 text-sm text-[#0d2569]/80">
                <p className="flex items-start gap-2">
                  <MapPin
                    className="mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden
                  />
                  Jl. Medan Merdeka Barat No. 4–5, Jakarta Pusat 10110
                </p>
                <p className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  +62 21 350 0584 / +62 21 351 1086
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}

// Modul E-Learning — halaman PUBLIK "E-Learning" (tanpa login).
//
// Fase 1 rebuild Learning Centre (spec learning-centre-spec.md, disetujui
// pengguna 2026-11-21 15:35 WIB): listing Learning Path, detail Path
// (Topik → Materi), dan detail Materi (video + Pre/Post Test +
// sertifikat), mengikuti pola platform belajar yang dipelajari dari
// myskill.id — tetapi topik & tema memakai keilmuan RRI (arahan pengguna
// 2026-11-21 15:15 WIB), bukan kategori platform lain.
//
// Satu modul dengan state internal (pola BookVenue.tsx): tampilan
// 'daftar' | 'path' | 'materi'. Panah kembali naik satu tingkat di dalam
// modul (materi → path, path → daftar, daftar → hub Learning Centre).
//
// DATA DUMMY (src/lib/learningCentreDummy.ts) — ganti data asli. Video
// player DUMMY (foto path sebagai poster + ikon play, TIDAK memutar video
// sungguhan, TIDAK ada URL video). Tombol "Join Community" dan "Subscribe"
// DUMMY (tanpa aksi — langganan dan komunitas tiba di Fase 4). Sertifikat
// DUMMY (pratinjau contoh, tidak membuat dokumen). Foto thumbnail: gambar
// generate per Learning Path (src/lib/fotoLearningCentre.ts, DUMMY sampai
// foto asli tersedia). TIDAK ADA harga di halaman ini (langganan video
// belum ada tarif KB-nya).

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  Play,
  Search,
  Star,
  Users,
} from 'lucide-react';
import { LOGO_RRI_LOCKUP_DATA_URI } from '../lib/logoRriLockup';
import { FOTO_LEARNING_CENTRE } from '../lib/fotoLearningCentre';
import {
  LEARNING_PATH_DUMMY,
  type LearningPathDummy,
  type MateriDummy,
  type TopikDummy,
} from '../lib/learningCentreDummy';

export interface ELearningProps {
  onKembali: () => void;
}

type Tampilan = 'daftar' | 'path' | 'materi';

/** Bidang keilmuan RRI (chip kategori) — diturunkan dari data dummy. */
const BIDANG: string[] = [
  'All',
  ...Array.from(new Set(LEARNING_PATH_DUMMY.map((path) => path.bidang))),
];

const jumlahMateri = (path: LearningPathDummy) =>
  path.topik.reduce((total, topik) => total + topik.materi.length, 0);

const materiSelesai = (materi: MateriDummy[]) =>
  materi.filter((m) => m.selesai).length;

/** Header ala Book a Venue (panah + logo kiri, judul kanan). */
function HeaderELearning({
  judul,
  onBack,
}: {
  judul: string;
  onBack: () => void;
}) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
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
        {judul}
      </h1>
    </header>
  );
}

/** Histogram rating (DUMMY — contoh). */
const RATING_HISTOGRAM = [
  { bintang: 5, persen: 78 },
  { bintang: 4, persen: 15 },
  { bintang: 3, persen: 5 },
  { bintang: 2, persen: 1 },
  { bintang: 1, persen: 1 },
];

export default function ELearning({ onKembali }: ELearningProps) {
  const [tampilan, setTampilan] = useState<Tampilan>('daftar');
  const [pathId, setPathId] = useState(LEARNING_PATH_DUMMY[0].id);
  const [topikId, setTopikId] = useState(LEARNING_PATH_DUMMY[0].topik[0].id);
  const [materiId, setMateriId] = useState(
    LEARNING_PATH_DUMMY[0].topik[0].materi[0].id,
  );
  const [cari, setCari] = useState('');
  const [bidang, setBidang] = useState('All');
  const [topikTerbuka, setTopikTerbuka] = useState<string | null>(
    LEARNING_PATH_DUMMY[0].topik[0].id,
  );
  const [tampilSertifikatContoh, setTampilSertifikatContoh] = useState(false);

  // Selalu mulai dari atas — saat mount dan setiap ganti tampilan.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [tampilan]);

  const pathTerpilih =
    LEARNING_PATH_DUMMY.find((p) => p.id === pathId) ??
    LEARNING_PATH_DUMMY[0];
  const topikTerpilih =
    pathTerpilih.topik.find((t) => t.id === topikId) ?? pathTerpilih.topik[0];
  const materiTerpilih =
    topikTerpilih.materi.find((m) => m.id === materiId) ??
    topikTerpilih.materi[0];

  const pathTersaring = useMemo(() => {
    const kata = cari.trim().toLowerCase();
    return LEARNING_PATH_DUMMY.filter((path) => {
      const cocokBidang = bidang === 'All' || path.bidang === bidang;
      const cocokCari =
        kata === '' ||
        path.judul.toLowerCase().includes(kata) ||
        path.bidang.toLowerCase().includes(kata);
      return cocokBidang && cocokCari;
    });
  }, [cari, bidang]);

  const bukaPath = (path: LearningPathDummy) => {
    setPathId(path.id);
    setTopikId(path.topik[0].id);
    setMateriId(path.topik[0].materi[0].id);
    setTopikTerbuka(path.topik[0].id);
    setTampilSertifikatContoh(false);
    setTampilan('path');
  };

  const bukaMateri = (topik: TopikDummy, materi: MateriDummy) => {
    setTopikId(topik.id);
    setMateriId(materi.id);
    setTampilSertifikatContoh(false);
    setTampilan('materi');
  };

  const kembaliDariMateri = () => {
    setTampilSertifikatContoh(false);
    setTampilan('path');
  };

  const kembaliDariPath = () => {
    setTampilSertifikatContoh(false);
    setTampilan('daftar');
  };

  const progresTopik =
    topikTerpilih.materi.length === 0
      ? 0
      : Math.round(
          (materiSelesai(topikTerpilih.materi) / topikTerpilih.materi.length) *
            100,
        );
  const semuaMateriPath = pathTerpilih.topik.flatMap((t) => t.materi);
  const progresPath =
    semuaMateriPath.length === 0
      ? 0
      : Math.round(
          (materiSelesai(semuaMateriPath) / semuaMateriPath.length) * 100,
        );

  const rekomendasi = LEARNING_PATH_DUMMY.filter((p) => p.id !== pathId).slice(
    0,
    3,
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f2f2] px-4 py-16">
      {/* Gradasi pucat biru/navy di bagian bawah (pola halaman publik). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-[#2573e2]/15 via-[#0d2569]/10 to-transparent"
      />

      <div className="relative mx-auto w-full max-w-6xl">
        {tampilan === 'daftar' && (
          <>
            <HeaderELearning judul="E-Learning" onBack={onKembali} />

            <p className="mt-8 text-center text-lg font-semibold text-[#0d2569]">
              Video courses by RRI trainers — learn broadcasting, journalism,
              and radio production at your own pace.
            </p>

            {/* Search + chip kategori. */}
            <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-[#0d2569]/15 bg-white px-4 py-2.5 shadow-sm">
              <Search
                className="h-4 w-4 shrink-0 text-[#0d2569]/50"
                aria-hidden
              />
              <input
                type="text"
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                placeholder="Search learning paths..."
                className="w-full bg-transparent text-sm text-[#0d2569] outline-none placeholder:text-[#0d2569]/50"
              />
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {BIDANG.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBidang(b)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    bidang === b
                      ? 'bg-[#2573e2] text-white shadow'
                      : 'border border-[#0d2569]/15 bg-white text-[#0d2569] hover:border-[#2573e2]'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* Daftar Learning Path. */}
            {pathTersaring.length === 0 ? (
              <p className="mt-10 text-center text-sm text-[#0d2569]/70">
                No learning paths match your search.
              </p>
            ) : (
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {pathTersaring.map((path) => (
                  <article
                    key={path.id}
                    className="overflow-hidden rounded-2xl border border-[#0d2569]/10 bg-white shadow-sm"
                  >
                    {/* Foto thumbnail path (data URI, src/lib/fotoLearningCentre.ts);
                        gradien biru tetap sebagai latar di bawah foto. */}
                    <div className="h-36 overflow-hidden bg-gradient-to-br from-[#2573e2] to-[#0d2569]">
                      <img
                        src={FOTO_LEARNING_CENTRE[path.id] ?? ''}
                        alt={path.judul}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#2573e2]">
                        {path.bidang}
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-[#0d2569]">
                        {path.judul}
                      </h2>
                      <p className="mt-1 text-sm text-[#0d2569]/70">
                        {path.topik.length} Topics • {jumlahMateri(path)}{' '}
                        Materials
                      </p>
                      <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-[#0d2569]">
                        <Star
                          className="h-4 w-4 fill-[#2573e2] text-[#2573e2]"
                          aria-hidden
                        />
                        {path.rating.toFixed(1)} ·{' '}
                        {path.peserta.toLocaleString('en-GB')} learners
                      </p>
                      <button
                        type="button"
                        onClick={() => bukaPath(path)}
                        className="mt-4 w-full rounded-full bg-[#2573e2] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#0d2569]"
                      >
                        View Path
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {tampilan === 'path' && (
          <>
            <HeaderELearning judul={pathTerpilih.judul} onBack={kembaliDariPath} />

            {/* Cover + info path. */}
            <div className="mt-8 overflow-hidden rounded-2xl border border-[#0d2569]/10 bg-white shadow-sm">
              {/* Cover path: foto thumbnail (gradien biru sebagai latar). */}
              <div className="h-48 overflow-hidden bg-gradient-to-br from-[#2573e2] to-[#0d2569]">
                <img
                  src={FOTO_LEARNING_CENTRE[pathTerpilih.id] ?? ''}
                  alt={pathTerpilih.judul}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#2573e2]">
                  {pathTerpilih.bidang}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-[#0d2569]">
                  {pathTerpilih.judul}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-[#0d2569]/70">
                  {pathTerpilih.deskripsi}
                </p>
                <p className="mt-3 text-sm font-semibold text-[#0d2569]">
                  {pathTerpilih.topik.length} Topics ·{' '}
                  {jumlahMateri(pathTerpilih)} Materials ·{' '}
                  {pathTerpilih.peserta.toLocaleString('en-GB')} learners
                </p>
                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#0d2569]/10">
                    <div
                      className="h-full rounded-full bg-[#2573e2]"
                      style={{ width: '0%' }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[#0d2569]/60">
                    Progress: 0%
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {/* Tombol DUMMY (tanpa aksi) — komunitas tiba di Fase 4. */}
                  <button
                    type="button"
                    className="rounded-full bg-[#2573e2] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#0d2569]"
                  >
                    Join Community
                  </button>
                  {/* Tombol DUMMY (tanpa aksi) — langganan tiba di Fase 4. */}
                  <button
                    type="button"
                    className="rounded-full border border-[#2573e2] bg-white px-5 py-2.5 text-sm font-semibold text-[#2573e2] transition hover:bg-[#e8f1fe]"
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            {/* Empat kartu info. */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-[#0d2569]/10 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#2573e2]">
                  Materials
                </h3>
                <p className="mt-2 text-sm text-[#0d2569]/70">
                  {jumlahMateri(pathTerpilih)} video lessons across{' '}
                  {pathTerpilih.topik.length} topics.
                </p>
              </div>
              <div className="rounded-2xl border border-[#0d2569]/10 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#2573e2]">
                  Practice
                </h3>
                <p className="mt-2 text-sm text-[#0d2569]/70">
                  Pre-Test and Post Test in every topic.
                </p>
              </div>
              <div className="rounded-2xl border border-[#0d2569]/10 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#2573e2]">
                  Benefits
                </h3>
                <p className="mt-2 text-sm text-[#0d2569]/70">
                  A certificate for every material you complete.
                </p>
              </div>
              <div className="rounded-2xl border border-[#0d2569]/10 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#2573e2]">
                  Requirements
                </h3>
                <p className="mt-2 text-sm text-[#0d2569]/70">
                  No experience needed — open to everyone.
                </p>
              </div>
            </div>

            {/* Daftar Topik (accordion). */}
            <h2 className="mt-10 text-xl font-bold text-[#0d2569]">Topics</h2>
            <div className="mt-4 space-y-4">
              {pathTerpilih.topik.map((topik) => {
                const terbuka = topikTerbuka === topik.id;
                return (
                  <div
                    key={topik.id}
                    className="overflow-hidden rounded-2xl border border-[#0d2569]/10 bg-white shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setTopikTerbuka(terbuka ? null : topik.id)
                      }
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span>
                        <span className="block text-base font-bold text-[#0d2569]">
                          {topik.judul}
                        </span>
                        <span className="mt-0.5 block text-sm text-[#0d2569]/60">
                          {topik.materi.length} Materials
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-[#2573e2]">
                        See all
                        <ChevronDown
                          className={`h-4 w-4 transition ${
                            terbuka ? 'rotate-180' : ''
                          }`}
                          aria-hidden
                        />
                      </span>
                    </button>
                    {terbuka && (
                      <ul className="border-t border-[#0d2569]/10 px-5 py-2">
                        {topik.materi.map((materi) => (
                          <li key={materi.id}>
                            <button
                              type="button"
                              onClick={() => bukaMateri(topik, materi)}
                              className="flex w-full items-center gap-3 py-3 text-left transition hover:bg-[#f5f2f2]"
                            >
                              {materi.selesai ? (
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0f766e] text-white">
                                  <Check className="h-4 w-4" aria-hidden />
                                </span>
                              ) : (
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8f1fe] text-[#2573e2]">
                                  <Play className="h-3.5 w-3.5" aria-hidden />
                                </span>
                              )}
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-[#0d2569]">
                                  {materi.judul}
                                </span>
                                <span className="mt-0.5 flex items-center gap-1 text-xs text-[#0d2569]/60">
                                  <Clock className="h-3 w-3" aria-hidden />
                                  {materi.durasi} · {materi.mentor}
                                </span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tampilan === 'materi' && (
          <>
            <HeaderELearning
              judul={materiTerpilih.judul}
              onBack={kembaliDariMateri}
            />

            <p className="mt-6 text-sm font-semibold text-[#2573e2]">
              {pathTerpilih.bidang} · {pathTerpilih.judul} ·{' '}
              {topikTerpilih.judul}
            </p>

            <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
              {/* Kolom kiri: player dummy + hasil belajar. */}
              <div className="min-w-0">
                {/* Video player DUMMY — foto path sebagai poster + ikon play; TIDAK
                    memutar video sungguhan, TIDAK ada URL video. */}
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-[#2573e2] to-[#0d2569] shadow-sm">
                  <img
                    src={FOTO_LEARNING_CENTRE[pathTerpilih.id] ?? ''}
                    alt={pathTerpilih.judul}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
                      <Play
                        className="h-10 w-10 fill-white text-white"
                        aria-hidden
                      />
                    </div>
                  </div>
                  <span className="absolute bottom-4 right-4 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white">
                    {materiTerpilih.durasi}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[#0d2569]/60">
                  Sample player — the full video will be available here.
                </p>

                <div className="mt-6 rounded-2xl border border-[#0d2569]/10 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-[#0d2569]">
                    In This Material
                  </h2>
                  <p className="mt-2 text-sm text-[#0d2569]/70">
                    {materiTerpilih.deskripsi}
                  </p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#0d2569]/80">
                    {materiTerpilih.hasil.map((hasil) => (
                      <li key={hasil}>{hasil}</li>
                    ))}
                  </ul>
                  <p className="mt-4 flex items-center gap-2 text-sm text-[#0d2569]/60">
                    <Users className="h-4 w-4" aria-hidden />
                    Mentor: {materiTerpilih.mentor}
                  </p>
                </div>

                {/* Progress & Certificate. */}
                <div className="mt-6 rounded-2xl border border-[#0d2569]/10 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-[#0d2569]">
                    Progress &amp; Certificate
                  </h2>
                  {materiTerpilih.selesai ? (
                    <>
                      <p className="mt-2 text-sm text-[#0d2569]/70">
                        You have completed this material. Get your
                        certificate below.
                      </p>
                      <p className="mt-3 text-sm font-bold text-[#2573e2]">
                        Certificate 100%
                      </p>
                      <button
                        type="button"
                        onClick={() => setTampilSertifikatContoh(true)}
                        className="mt-4 rounded-full bg-[#2573e2] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#0d2569]"
                      >
                        Get Certificate
                      </button>
                      {tampilSertifikatContoh && (
                        <div className="mt-4 rounded-lg border border-[#2573e2]/30 bg-[#e8f1fe] px-4 py-3 text-sm text-[#0d2569]">
                          <p className="font-semibold">
                            Sample certificate preview.
                          </p>
                          <p className="mt-1">
                            This is a sample only — certificates are issued
                            when a material is completed.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-sm text-[#0d2569]/70">
                        Complete this material to unlock your certificate.
                      </p>
                      <p className="mt-3 text-sm font-bold text-[#0d2569]/60">
                        Certificate 0%
                      </p>
                      <button
                        type="button"
                        disabled
                        className="mt-4 cursor-not-allowed rounded-full bg-[#0d2569]/15 px-5 py-2.5 text-sm font-semibold text-[#0d2569]/50"
                      >
                        Get Certificate
                      </button>
                    </>
                  )}
                  <p className="mt-4 text-sm text-[#0d2569]/70">
                    Progress Topic: {progresTopik}% · Progress Learning Path:{' '}
                    {progresPath}%
                  </p>
                </div>

                {/* Rating. */}
                <div className="mt-6 rounded-2xl border border-[#0d2569]/10 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-[#0d2569]">Rating</h2>
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#0d2569]">
                    <Star
                      className="h-5 w-5 fill-[#2573e2] text-[#2573e2]"
                      aria-hidden
                    />
                    {pathTerpilih.rating.toFixed(1)} from 128 reviews
                  </p>
                  <div className="mt-4 space-y-2">
                    {RATING_HISTOGRAM.map((baris) => (
                      <div
                        key={baris.bintang}
                        className="flex items-center gap-3 text-sm text-[#0d2569]/70"
                      >
                        <span className="w-6 shrink-0 text-right font-semibold">
                          {baris.bintang}
                        </span>
                        <Star
                          className="h-3.5 w-3.5 shrink-0 fill-[#2573e2] text-[#2573e2]"
                          aria-hidden
                        />
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#0d2569]/10">
                          <div
                            className="h-full rounded-full bg-[#2573e2]"
                            style={{ width: `${baris.persen}%` }}
                          />
                        </div>
                        <span className="w-9 shrink-0 text-right">
                          {baris.persen}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rekomendasi. */}
                <h2 className="mt-10 text-xl font-bold text-[#0d2569]">
                  Recommended Courses
                </h2>
                <div className="mt-4 grid gap-5 sm:grid-cols-3">
                  {rekomendasi.map((path) => (
                    <article
                      key={path.id}
                      className="overflow-hidden rounded-2xl border border-[#0d2569]/10 bg-white shadow-sm"
                    >
                      <div className="h-24 overflow-hidden bg-gradient-to-br from-[#2573e2] to-[#0d2569]">
                        <img
                          src={FOTO_LEARNING_CENTRE[path.id] ?? ''}
                          alt={path.judul}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-[#0d2569]">
                          {path.judul}
                        </h3>
                        <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#0d2569]">
                          <Star
                            className="h-3.5 w-3.5 fill-[#2573e2] text-[#2573e2]"
                            aria-hidden
                          />
                          {path.rating.toFixed(1)} · {jumlahMateri(path)}{' '}
                          Materials
                        </p>
                        <button
                          type="button"
                          onClick={() => bukaPath(path)}
                          className="mt-3 w-full rounded-full bg-[#2573e2] px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-[#0d2569]"
                        >
                          View Path
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Kolom kanan: panel Materials. */}
              <div className="min-w-0">
                <div className="rounded-2xl border border-[#0d2569]/10 bg-white p-5 shadow-sm lg:sticky lg:top-6">
                  <h2 className="text-lg font-bold text-[#0d2569]">
                    Materials
                  </h2>
                  <p className="mt-1 text-sm text-[#0d2569]/60">
                    {topikTerpilih.judul}
                  </p>
                  <ul className="mt-4 space-y-1">
                    <li className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-semibold text-[#0d2569]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8f1fe] text-[#2573e2]">
                        <BookOpen className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      Pre-Test
                    </li>
                    {topikTerpilih.materi.map((materi) => {
                      const aktif = materi.id === materiTerpilih.id;
                      return (
                        <li key={materi.id}>
                          <button
                            type="button"
                            onClick={() => bukaMateri(topikTerpilih, materi)}
                            className={`flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm transition ${
                              aktif
                                ? 'bg-[#e8f1fe] font-semibold text-[#0d2569]'
                                : 'text-[#0d2569]/80 hover:bg-[#f5f2f2]'
                            }`}
                          >
                            {materi.selesai ? (
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0f766e] text-white">
                                <Check className="h-4 w-4" aria-hidden />
                              </span>
                            ) : (
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8f1fe] text-[#2573e2]">
                                <Play className="h-3.5 w-3.5" aria-hidden />
                              </span>
                            )}
                            <span className="min-w-0 flex-1 truncate">
                              {materi.judul}
                            </span>
                            <span className="shrink-0 text-xs text-[#0d2569]/60">
                              {materi.durasi}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                    <li className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-semibold text-[#0d2569]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8f1fe] text-[#2573e2]">
                        <Award className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      Post Test
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

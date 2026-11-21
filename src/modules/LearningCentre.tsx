// Modul Learning Centre — halaman PUBLIK "Learning Centre" (tanpa login).
//
// Fase 1 rebuild Learning Centre (spec learning-centre-spec.md, disetujui
// pengguna 2026-11-21 15:35 WIB): hub yang menggantikan halaman
// "Get a Journalism Training" sebagai pintu masuk edukasi Pusbangkom
// Penyiaran Radio LPP RRI. Tiga fitur utama: E-Learning (video by
// subscription), Bootcamp & Program (berbayar per-event), Certification
// (Sertifikasi Wartawan Radio, lisensi dipegang RRI).
//
// Fase 1 HANYA hub + E-Learning (ELearning.tsx). Bootcamp & Program dan
// Certification masih mengarah ke halaman Training lama (onTraining) —
// diganti halaman sendiri di Fase 2 dan Fase 3. Langganan dan My Learning
// TIDAK ada di Fase 1 (Fase 4).
//
// DATA DUMMY (src/lib/learningCentreDummy.ts) — ganti data asli. HARGA
// hanya tarif KB PP 68/2020 (Pelatihan Rp2.000.000/orang/3 hari,
// Sertifikasi Wartawan Radio Rp1.500.000/orang/3 hari); sisanya
// "Price on request". TIDAK ADA foto: kartu memakai blok placeholder
// gradien biru RRI (tanpa foto stok).
//
// Gaya mengikuti halaman publik lain: latar off-white #f5f2f2 + gradasi
// pucat biru/navy di bawah. Header ala Book a Venue: kiri panah + logo
// RRI h-10, kanan judul gaya logo Deals, tanpa deskripsi, tanpa teks
// "Back to Landing Page".

import { useEffect } from 'react';
import { ArrowLeft, Award, BookOpen, GraduationCap, Star, Users } from 'lucide-react';
import { LOGO_RRI_LOCKUP_DATA_URI } from '../lib/logoRriLockup';
import {
  COURSE_DUMMY,
  type CourseDummy,
} from '../lib/layananTambahanDummy';
import {
  LEARNING_PATH_DUMMY,
  type LearningPathDummy,
} from '../lib/learningCentreDummy';
import { formatTanggal } from '../lib/format';

export interface LearningCentreProps {
  onKembali: () => void;
  /** Buka halaman E-Learning (listing Learning Path). */
  onELearning: () => void;
  /** Buka halaman Training lama (bootcamp + sertifikasi, sampai Fase 2/3). */
  onTraining: () => void;
}

/** 3 Learning Path dengan rating tertinggi (DUMMY — contoh). */
const PATH_POPULER: LearningPathDummy[] = [...LEARNING_PATH_DUMMY]
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 3);

/** 3 bootcamp terdekat dari COURSE_DUMMY lama (DUMMY — contoh). */
const BOOTCAMP_TERDEKAT: CourseDummy[] = COURSE_DUMMY.slice(0, 3);

const jumlahMateri = (path: LearningPathDummy) =>
  path.topik.reduce((total, topik) => total + topik.materi.length, 0);

export default function LearningCentre({
  onKembali,
  onELearning,
  onTraining,
}: LearningCentreProps) {
  // Halaman publik dibuka dari footer landing (SPA: posisi gulir window
  // TIDAK reset saat komponen mount). Selalu mulai dari atas.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f2f2] px-4 py-16">
      {/* Gradasi pucat biru/navy di bagian bawah (pola halaman publik). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-[#2573e2]/15 via-[#0d2569]/10 to-transparent"
      />

      <div className="relative mx-auto w-full max-w-6xl">
        {/* Header ala Book a Venue: kiri panah + logo RRI; kanan judul
            gaya logo Deals; tanpa deskripsi; tanpa teks
            "Back to Landing Page". */}
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
            Learning Centre
          </h1>
        </header>

        {/* Hero singkat. */}
        <p className="mt-8 text-center text-lg font-semibold text-[#0d2569]">
          Broadcasting knowledge from Indonesia’s public radio — video
          courses, live programmes, and certification.
        </p>

        {/* Tiga kartu fitur. */}
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <article className="rounded-2xl border border-[#0d2569]/10 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f1fe]">
              <BookOpen className="h-6 w-6 text-[#2573e2]" aria-hidden />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#0d2569]">
              E-Learning
            </h2>
            <p className="mt-1 text-sm text-[#0d2569]/70">
              Video courses you can watch anytime, by subscription.
            </p>
            <button
              type="button"
              onClick={onELearning}
              className="mt-4 w-full rounded-full bg-[#2573e2] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#0d2569]"
            >
              Browse E-Learning
            </button>
          </article>
          <article className="rounded-2xl border border-[#0d2569]/10 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f1fe]">
              <Users className="h-6 w-6 text-[#2573e2]" aria-hidden />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#0d2569]">
              Bootcamp &amp; Program
            </h2>
            <p className="mt-1 text-sm text-[#0d2569]/70">
              Live workshops and programmes, paid per event.
            </p>
            <button
              type="button"
              onClick={onTraining}
              className="mt-4 w-full rounded-full bg-[#2573e2] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#0d2569]"
            >
              View Bootcamps
            </button>
          </article>
          <article className="rounded-2xl border border-[#0d2569]/10 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f1fe]">
              <Award className="h-6 w-6 text-[#2573e2]" aria-hidden />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#0d2569]">
              Certification
            </h2>
            <p className="mt-1 text-sm text-[#0d2569]/70">
              Radio Journalist Competency Certification, licensed by RRI.
            </p>
            <button
              type="button"
              onClick={onTraining}
              className="mt-4 w-full rounded-full bg-[#2573e2] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#0d2569]"
            >
              View Certification
            </button>
          </article>
        </div>

        {/* Learning Path populer. */}
        <h2 className="mt-12 text-xl font-bold text-[#0d2569]">
          Popular Learning Paths
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PATH_POPULER.map((path) => (
            <article
              key={path.id}
              className="overflow-hidden rounded-2xl border border-[#0d2569]/10 bg-white shadow-sm"
            >
              {/* Placeholder gradien (TIDAK ADA foto) — blok visual biru RRI. */}
              <div className="flex h-36 items-center justify-center bg-gradient-to-br from-[#2573e2] to-[#0d2569]">
                <GraduationCap
                  className="h-12 w-12 text-white/70"
                  aria-hidden
                />
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#2573e2]">
                  {path.bidang}
                </p>
                <h3 className="mt-1 text-lg font-bold text-[#0d2569]">
                  {path.judul}
                </h3>
                <p className="mt-1 text-sm text-[#0d2569]/70">
                  {path.topik.length} Topics • {jumlahMateri(path)} Materials
                </p>
                <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-[#0d2569]">
                  <Star
                    className="h-4 w-4 fill-[#2573e2] text-[#2573e2]"
                    aria-hidden
                  />
                  {path.rating.toFixed(1)} · {path.peserta.toLocaleString('en-GB')}{' '}
                  learners
                </p>
                <button
                  type="button"
                  onClick={onELearning}
                  className="mt-4 w-full rounded-full bg-[#2573e2] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#0d2569]"
                >
                  View Path
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Bootcamp terdekat. */}
        <h2 className="mt-12 text-xl font-bold text-[#0d2569]">
          Upcoming Bootcamps
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BOOTCAMP_TERDEKAT.map((course) => (
            <article
              key={course.id}
              className="overflow-hidden rounded-2xl border border-[#0d2569]/10 bg-white shadow-sm"
            >
              {/* Placeholder gradien (TIDAK ADA foto) — blok visual biru RRI. */}
              <div className="flex h-36 items-center justify-center bg-gradient-to-br from-[#2573e2] to-[#0d2569]">
                <GraduationCap
                  className="h-12 w-12 text-white/70"
                  aria-hidden
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#0d2569]">
                  {course.judul}
                </h3>
                <p className="mt-1 text-sm text-[#0d2569]/70">
                  {course.deskripsi}
                </p>
                <p className="mt-3 text-sm text-[#0d2569]/80">
                  Schedule: {formatTanggal(course.tanggal)}
                </p>
                <p className="mt-1 text-sm text-[#0d2569]/80">
                  Duration: {course.durasi}
                </p>
                <p className="mt-3 text-base font-bold text-[#2573e2]">
                  {course.harga}
                </p>
                <button
                  type="button"
                  onClick={onTraining}
                  className="mt-4 w-full rounded-full bg-[#2573e2] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#0d2569]"
                >
                  Register
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Banner sertifikasi. */}
        <div className="mt-12 overflow-hidden rounded-2xl bg-gradient-to-br from-[#2573e2] to-[#0d2569] p-8 text-white shadow-sm sm:p-10">
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-white/80" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
              Certification · Licensed by RRI
            </p>
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight">
            Radio Journalist Competency Certification
          </h2>
          <p className="mt-2 max-w-xl text-sm text-white/80">
            The national certification for radio journalists — assessed over
            3 days, with a written test and an interview.
          </p>
          <p className="mt-4 text-lg font-bold">
            Rp1,500,000 / person / 3 days
          </p>
          <button
            type="button"
            onClick={onTraining}
            className="mt-5 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#0d2569] shadow transition hover:bg-[#e8f1fe]"
          >
            View Certification
          </button>
        </div>
      </div>
    </div>
  );
}

// Modul Get a Journalism Training — halaman PUBLIK "Get a Journalism
// Training" (tanpa login).
//
// Keputusan pengguna 2026-11-21 10:52 WIB: bangun ketiga halaman layanan
// tambahan sekaligus, data dummy dulu. Halaman ini ala Coursera: daftar
// Scheduled Course (judul, jadwal, durasi), klik register → form (course,
// nama, email, telepon). Submit → dokumen `trainingOrder` (id `TRN-…`)
// di panel Order; konfirmasi menampilkan nomor referensi. Bila tulis
// Firestore gagal, error ditampilkan apa adanya — jangan pura-pura
// berhasil.
//
// DATA DUMMY (src/lib/layananTambahanDummy.ts) — ganti data asli.
// HARGA hanya tarif KB PP 68/2020 (Pelatihan Rp2.000.000/orang/3 hari,
// Sertifikasi Wartawan Radio Rp1.500.000/orang/3 hari); sisanya
// "Price on request". TIDAK ADA foto: kartu memakai blok placeholder
// gradien biru RRI (tanpa foto stok).
//
// Gaya mengikuti halaman publik lain (PlanCampaign/Lacak): latar
// off-white #f5f2f2 + gradasi pucat biru/navy di bawah, logo lockup RRI
// lengkap h-20, tombol "Back to Landing Page" di kiri atas.

import { useEffect, useState } from 'react';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { LOGO_RRI_LOCKUP_DATA_URI } from '../lib/logoRriLockup';
import { COURSE_DUMMY } from '../lib/layananTambahanDummy';
import { formatTanggal } from '../lib/format';
import type { PermintaanTrainingPublikInput } from '../lib/store';

export interface TrainingProps {
  onKembali: () => void;
  /** Kirim pendaftaran; kembalikan { galat, id } — id = nomor referensi
      (mis. 'TRN-001') yang ditampilkan saat berhasil. */
  onKirim: (
    input: PermintaanTrainingPublikInput,
  ) => Promise<{ galat: string | null; id?: string }>;
}

export default function Training({ onKembali, onKirim }: TrainingProps) {
  // Course yang dipilih dari kartu (default: item pertama).
  const [courseId, setCourseId] = useState(COURSE_DUMMY[0].id);
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [telepon, setTelepon] = useState('');
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [referensi, setReferensi] = useState<string | null>(null);

  // Halaman publik dibuka dari footer landing (SPA: posisi gulir window
  // TIDAK reset saat komponen mount — footer di bawah landing membuat
  // halaman baru mendarat di bawah, di form). Selalu mulai dari atas.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const pilihCourse = (id: string) => {
    setCourseId(id);
    document
      .getElementById('form-training')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  const kirim = async () => {
    setGalat(null);
    setReferensi(null);
    if (!nama.trim()) {
      setGalat('Name is required.');
      return;
    }
    if (!email.trim()) {
      setGalat('Email is required.');
      return;
    }
    if (!telepon.trim()) {
      setGalat('Phone is required.');
      return;
    }
    const course = COURSE_DUMMY.find((c) => c.id === courseId);
    if (!course) {
      setGalat('Course is required.');
      return;
    }
    setMengirim(true);
    const hasil = await onKirim({
      course: course.judul,
      tanggalCourse: course.tanggal,
      nama: nama.trim(),
      email: email.trim(),
      telepon: telepon.trim(),
    });
    setMengirim(false);
    if (hasil.galat) {
      setGalat(hasil.galat);
      return;
    }
    setReferensi(hasil.id ?? '');
  };

  const labelInput =
    'mt-1 block w-full rounded-lg border border-[#0d2569]/15 bg-white px-3 py-2 text-sm text-[#0d2569] outline-none focus:border-[#2573e2]';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f2f2] px-4 py-16">
      {/* Gradasi pucat biru/navy di bagian bawah (pola halaman publik). */}
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
        Back to Landing Page
      </button>

      <div className="relative mx-auto w-full max-w-6xl">
        <div className="text-center">
          <img
            src={LOGO_RRI_LOCKUP_DATA_URI}
            alt="Logo RRI"
            className="mx-auto h-20 w-auto"
          />
        </div>

        <h1 className="mt-8 text-center text-3xl font-bold text-[#0d2569]">
          Get a Journalism Training
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[#0d2569]/70">
          Scheduled courses for journalists and broadcasters — pick a
          course and register as a participant.
        </p>

        {/* Daftar Scheduled Course (DUMMY — ganti data asli). */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {COURSE_DUMMY.map((course) => (
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
                <h2 className="text-lg font-bold text-[#0d2569]">
                  {course.judul}
                </h2>
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
                  onClick={() => pilihCourse(course.id)}
                  className="mt-4 w-full rounded-full bg-[#2573e2] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#0d2569]"
                >
                  Register
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Form registrasi. */}
        <div
          id="form-training"
          className="mx-auto mt-12 w-full max-w-[560px] rounded-2xl border border-[#0d2569]/10 bg-white p-6 shadow-sm sm:p-8"
        >
          <h2 className="text-xl font-bold text-[#0d2569]">Register</h2>
          <p className="mt-1 text-sm text-[#0d2569]/70">
            Your registration goes to our team — we will confirm your seat
            and follow up by email.
          </p>

          {referensi ? (
            <div className="mt-6 rounded-lg border border-[#2573e2]/30 bg-[#e8f1fe] px-4 py-3 text-sm text-[#0d2569]">
              <p className="font-semibold">Registration received.</p>
              <p className="mt-1">
                Your reference number is{' '}
                <span className="font-bold">{referensi}</span> — please keep
                it for follow-up.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="training-pilihan"
                  className="text-sm font-semibold text-[#0d2569]"
                >
                  Course
                </label>
                <select
                  id="training-pilihan"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className={labelInput}
                >
                  {COURSE_DUMMY.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.judul} — {formatTanggal(course.tanggal)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="training-nama"
                  className="text-sm font-semibold text-[#0d2569]"
                >
                  Name
                </label>
                <input
                  id="training-nama"
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Your full name"
                  className={labelInput}
                />
              </div>
              <div>
                <label
                  htmlFor="training-email"
                  className="text-sm font-semibold text-[#0d2569]"
                >
                  Email
                </label>
                <input
                  id="training-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={labelInput}
                />
              </div>
              <div>
                <label
                  htmlFor="training-telepon"
                  className="text-sm font-semibold text-[#0d2569]"
                >
                  Phone
                </label>
                <input
                  id="training-telepon"
                  type="text"
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  placeholder="e.g. 0812-3456-7890"
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
                {mengirim ? 'Sending…' : 'Register'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

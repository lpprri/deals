// Modul Rent a Space — halaman PUBLIK "Rent a Space" (tanpa login).
//
// Keputusan pengguna 2026-11-21 10:52 WIB: bangun ketiga halaman layanan
// tambahan sekaligus, data dummy dulu. Halaman ini ala rumah123/OLX
// properti: daftar lahan + detail (lokasi, luas), tombol inquiry.
// "Chat ke admin" yang dimaksud pengguna = tombol "Send Inquiry" ini:
// chat client→admin TIDAK ADA di aplikasi (Chat yang ada hanya antar
// operator). Submit → dokumen `spaceRentOrder` (id `SRR-…`) di panel
// Order; konfirmasi menampilkan nomor referensi. Bila tulis Firestore
// gagal, error ditampilkan apa adanya — jangan pura-pura berhasil.
//
// DATA DUMMY (src/lib/layananTambahanDummy.ts) — ganti data asli.
// HARGA: TIDAK ada tarif KB untuk sewa lahan → semua "Price on request".
// TIDAK ADA foto: kartu memakai blok placeholder gradien biru RRI
// (tanpa foto stok).
//
// Gaya mengikuti halaman publik lain (PlanCampaign/Lacak): latar
// off-white #f5f2f2 + gradasi pucat biru/navy di bawah, logo lockup RRI
// lengkap h-20, tombol "Back to Landing Page" di kiri atas.

import { useState } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { LOGO_RRI_LOCKUP_DATA_URI } from '../lib/logoRriLockup';
import { SPACE_DUMMY } from '../lib/layananTambahanDummy';
import type { PermintaanSpacePublikInput } from '../lib/store';

export interface RentSpaceProps {
  onKembali: () => void;
  /** Kirim inquiry; kembalikan { galat, id } — id = nomor referensi
      (mis. 'SRR-001') yang ditampilkan saat berhasil. */
  onKirim: (
    input: PermintaanSpacePublikInput,
  ) => Promise<{ galat: string | null; id?: string }>;
}

export default function RentSpace({ onKembali, onKirim }: RentSpaceProps) {
  // Lahan yang dipilih dari kartu (default: item pertama).
  const [spaceId, setSpaceId] = useState(SPACE_DUMMY[0].id);
  const [nama, setNama] = useState('');
  const [kontak, setKontak] = useState('');
  const [email, setEmail] = useState('');
  const [pesan, setPesan] = useState('');
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [referensi, setReferensi] = useState<string | null>(null);

  const pilihSpace = (id: string) => {
    setSpaceId(id);
    document
      .getElementById('form-rent-space')
      ?.scrollIntoView({ behavior: 'smooth' });
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
    const hasil = await onKirim({
      space: space.nama,
      nama: nama.trim(),
      kontak: kontak.trim(),
      email: email.trim(),
      pesan: pesan.trim() || undefined,
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
          Rent a Space
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[#0d2569]/70">
          Land and spaces for your business — browse the listings and send
          an inquiry; our team will contact you.
        </p>

        {/* Daftar lahan (DUMMY — ganti data asli). */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SPACE_DUMMY.map((space) => (
            <article
              key={space.id}
              className="overflow-hidden rounded-2xl border border-[#0d2569]/10 bg-white shadow-sm"
            >
              {/* Placeholder gradien (TIDAK ADA foto) — blok visual biru RRI. */}
              <div className="flex h-36 items-center justify-center bg-gradient-to-br from-[#2573e2] to-[#0d2569]">
                <MapPin className="h-12 w-12 text-white/70" aria-hidden />
              </div>
              <div className="p-5">
                <h2 className="text-lg font-bold text-[#0d2569]">
                  {space.nama}
                </h2>
                <p className="mt-1 text-sm text-[#0d2569]/70">
                  {space.deskripsi}
                </p>
                <p className="mt-3 text-sm text-[#0d2569]/80">
                  Location: {space.lokasi}
                </p>
                <p className="mt-1 text-sm text-[#0d2569]/80">
                  Size: {space.luas} · {space.jenis}
                </p>
                <p className="mt-3 text-base font-bold text-[#2573e2]">
                  {space.harga}
                </p>
                <button
                  type="button"
                  onClick={() => pilihSpace(space.id)}
                  className="mt-4 w-full rounded-full bg-[#2573e2] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#0d2569]"
                >
                  Send Inquiry
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Form inquiry. */}
        <div
          id="form-rent-space"
          className="mx-auto mt-12 w-full max-w-[560px] rounded-2xl border border-[#0d2569]/10 bg-white p-6 shadow-sm sm:p-8"
        >
          <h2 className="text-xl font-bold text-[#0d2569]">Send an inquiry</h2>
          <p className="mt-1 text-sm text-[#0d2569]/70">
            Your inquiry goes to our team — we will follow up by email or
            phone.
          </p>

          {referensi ? (
            <div className="mt-6 rounded-lg border border-[#2573e2]/30 bg-[#e8f1fe] px-4 py-3 text-sm text-[#0d2569]">
              <p className="font-semibold">Inquiry received.</p>
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
      </div>
    </div>
  );
}

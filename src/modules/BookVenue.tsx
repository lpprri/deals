// Modul Book a Venue — halaman PUBLIK "Book a Venue" (tanpa login).
//
// Keputusan pengguna 2026-11-21 10:52 WIB: bangun ketiga halaman layanan
// tambahan sekaligus, data dummy dulu. Halaman ini ala Airbnb/Traveloka:
// daftar venue + detail singkat tiap venue, klik booking → form (venue,
// tanggal, occasion/keperluan, nama, kontak, email). Submit → dokumen
// `venueBookOrder` (id `VBR-…`) di panel Order; konfirmasi menampilkan
// nomor referensi. Bila tulis Firestore gagal, error ditampilkan apa
// adanya — jangan pura-pura berhasil.
//
// DATA DUMMY (src/lib/layananTambahanDummy.ts) — ganti data asli.
// HARGA hanya tarif KB PP 68/2020 (Auditorium, Studio); sisanya
// "Price on request". TIDAK ADA foto: kartu memakai blok placeholder
// gradien biru RRI (tanpa foto stok).
//
// Gaya mengikuti halaman publik lain (PlanCampaign/Lacak): latar
// off-white #f5f2f2 + gradasi pucat biru/navy di bawah, logo lockup RRI
// lengkap h-20, tombol "Back to Landing Page" di kiri atas.

import { useState } from 'react';
import { ArrowLeft, Building2 } from 'lucide-react';
import { LOGO_RRI_LOCKUP_DATA_URI } from '../lib/logoRriLockup';
import { VENUE_DUMMY } from '../lib/layananTambahanDummy';
import type { PermintaanVenuePublikInput } from '../lib/store';

export interface BookVenueProps {
  onKembali: () => void;
  /** Kirim permintaan booking; kembalikan { galat, id } — id = nomor
      referensi (mis. 'VBR-001') yang ditampilkan saat berhasil. */
  onKirim: (
    input: PermintaanVenuePublikInput,
  ) => Promise<{ galat: string | null; id?: string }>;
}

export default function BookVenue({ onKembali, onKirim }: BookVenueProps) {
  // Venue yang dipilih dari kartu (default: item pertama).
  const [venueId, setVenueId] = useState(VENUE_DUMMY[0].id);
  const [tanggal, setTanggal] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [nama, setNama] = useState('');
  const [kontak, setKontak] = useState('');
  const [email, setEmail] = useState('');
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [referensi, setReferensi] = useState<string | null>(null);

  const pilihVenue = (id: string) => {
    setVenueId(id);
    document
      .getElementById('form-book-venue')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  const kirim = async () => {
    setGalat(null);
    setReferensi(null);
    if (!tanggal.trim()) {
      setGalat('Booking date is required.');
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
    const hasil = await onKirim({
      venue: venue.nama,
      tanggal: tanggal.trim(),
      keperluan: keperluan.trim(),
      nama: nama.trim(),
      kontak: kontak.trim(),
      email: email.trim(),
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
          Book a Venue
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[#0d2569]/70">
          Book our auditorium, hall, and meeting spaces for your event —
          choose a venue, pick a date, and tell us the occasion.
        </p>

        {/* Daftar venue (DUMMY — ganti data asli). */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {VENUE_DUMMY.map((venue) => (
            <article
              key={venue.id}
              className="overflow-hidden rounded-2xl border border-[#0d2569]/10 bg-white shadow-sm"
            >
              {/* Placeholder gradien (TIDAK ADA foto) — blok visual biru RRI. */}
              <div className="flex h-36 items-center justify-center bg-gradient-to-br from-[#2573e2] to-[#0d2569]">
                <Building2 className="h-12 w-12 text-white/70" aria-hidden />
              </div>
              <div className="p-5">
                <h2 className="text-lg font-bold text-[#0d2569]">
                  {venue.nama}
                </h2>
                <p className="mt-1 text-sm text-[#0d2569]/70">
                  {venue.deskripsi}
                </p>
                <p className="mt-3 text-sm text-[#0d2569]/80">
                  Capacity: {venue.kapasitas} people
                </p>
                <p className="mt-1 text-sm text-[#0d2569]/80">
                  Facilities: {venue.fasilitas.join(', ')}
                </p>
                <p className="mt-3 text-base font-bold text-[#2573e2]">
                  {venue.harga}
                </p>
                {venue.hargaCatatan ? (
                  <p className="mt-1 text-xs text-[#0d2569]/60">
                    {venue.hargaCatatan}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => pilihVenue(venue.id)}
                  className="mt-4 w-full rounded-full bg-[#2573e2] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#0d2569]"
                >
                  Book this venue
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Form booking. */}
        <div
          id="form-book-venue"
          className="mx-auto mt-12 w-full max-w-[560px] rounded-2xl border border-[#0d2569]/10 bg-white p-6 shadow-sm sm:p-8"
        >
          <h2 className="text-xl font-bold text-[#0d2569]">Booking form</h2>
          <p className="mt-1 text-sm text-[#0d2569]/70">
            Your request goes to our team — we will confirm availability and
            follow up by email.
          </p>

          {referensi ? (
            <div className="mt-6 rounded-lg border border-[#2573e2]/30 bg-[#e8f1fe] px-4 py-3 text-sm text-[#0d2569]">
              <p className="font-semibold">Booking request received.</p>
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
                  htmlFor="book-venue-pilihan"
                  className="text-sm font-semibold text-[#0d2569]"
                >
                  Venue
                </label>
                <select
                  id="book-venue-pilihan"
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className={labelInput}
                >
                  {VENUE_DUMMY.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.nama} — {venue.harga}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="book-venue-tanggal"
                  className="text-sm font-semibold text-[#0d2569]"
                >
                  Date
                </label>
                <input
                  id="book-venue-tanggal"
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className={labelInput}
                />
              </div>
              <div>
                <label
                  htmlFor="book-venue-keperluan"
                  className="text-sm font-semibold text-[#0d2569]"
                >
                  Occasion
                </label>
                <input
                  id="book-venue-keperluan"
                  type="text"
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  placeholder="e.g. Graduation ceremony"
                  className={labelInput}
                />
              </div>
              <div>
                <label
                  htmlFor="book-venue-nama"
                  className="text-sm font-semibold text-[#0d2569]"
                >
                  Name
                </label>
                <input
                  id="book-venue-nama"
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Your full name"
                  className={labelInput}
                />
              </div>
              <div>
                <label
                  htmlFor="book-venue-kontak"
                  className="text-sm font-semibold text-[#0d2569]"
                >
                  Contact (phone / WhatsApp)
                </label>
                <input
                  id="book-venue-kontak"
                  type="text"
                  value={kontak}
                  onChange={(e) => setKontak(e.target.value)}
                  placeholder="e.g. 0812-3456-7890"
                  className={labelInput}
                />
              </div>
              <div>
                <label
                  htmlFor="book-venue-email"
                  className="text-sm font-semibold text-[#0d2569]"
                >
                  Email
                </label>
                <input
                  id="book-venue-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
                {mengirim ? 'Sending…' : 'Send booking request'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

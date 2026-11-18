// Halaman login — REDESAIN 2026-11-18 (PR login-redesign-mixpanel,
// disetujui pengguna 15:58 WIB): meniru TATA LETAK halaman sign-up/login
// Mixpanel (kolom tunggal terpusat ~400px, BUKAN split-screen) dengan
// re-skin warna RRI — Navy #0D2569 + Biru #2573E2, BUKAN ungu/violet
// pastel template. Latar warm off-white (#f5f2f2) dengan gradasi pucat
// biru/navy yang halus di bagian bawah (re-skin gradasi pastel bawah
// template Mixpanel).
// - Logo lockup lengkap RRI (mark "rri" + teks di dalam gambar,
//   data URI di src/lib/logoRriLockup.ts) di tengah atas; teks terpisah
//   di bawah logo DIHAPUS supaya tidak duplikat dengan teks di gambar.
// - Heading "Welcome Back" + subjudul yang sama seperti sebelumnya.
// - Keterangan akses (keputusan pengguna 15:53 WIB, versi LENGKAP,
//   verbatim) dengan ikon gembok di bawah subjudul, di atas kolom email.
// - Field Email + Password gaya Mixpanel: label tebal gelap di atas
//   field, input pill putih, border tipis, placeholder abu-abu.
// - Satu tombol pill full-width Biru "Sign in" (hover navy).
// - Tombol sudut kiri atas kembali ke landing page (prop onKembali).
// - Panel foto gedung RRI di kanan DIHAPUS (template tidak punya side
//   panel); src/lib/gedungRri.ts tetap dipakai Beranda.tsx, jangan hapus.
// HANYA login email operator: TIDAK ada login sosial (tanpa tombol
// Google), TIDAK ada sign-up klien, TIDAK ada alur email-first (password
// tetap di layar yang sama), TIDAK ada Forgot password (belum ada
// alurnya), TIDAK ada checkbox Remember (persistensi Firebase sudah
// default). Tautan publik Lacak/Ajukan TIDAK ada di halaman ini
// (keputusan pengguna 2026-11-15) — halaman publik tersebut dijangkau
// lewat landing page.
// KOREKSI 2026-11-15: klien tidak punya login/akun; halaman ini hanya
// untuk Operator. Akses klien lewat Lacak (kode transaksi) dan Ajukan
// Permohonan (form publik).
// Bila Firebase terkonfigurasi: form email + kata sandi (Firebase Auth).
// Bila belum: mode contoh dengan 1 tombol Operator dummy saja.
// Halaman ini TIDAK menampilkan konfigurasi Firebase apa pun.

import { useState } from 'react';
import type { FormEvent, InputHTMLAttributes } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import type { DummyUser } from '../lib/dummyUsers';
import { DUMMY_USERS } from '../lib/dummyUsers';
import { isFirebaseConfigured } from '../lib/firebaseApp';
import { labelJabatan } from '../lib/labels';
import { LOGO_RRI_LOCKUP_DATA_URI } from '../lib/logoRriLockup';
import { FASE_TERBANGUN } from '../lib/master';
import { LABEL_PERAN } from '../lib/permissions';
import { Peringatan } from './ui';

/** Field gaya Mixpanel: label tebal gelap di atas, input pill putih. */
function Kolom({
  label,
  ...inputProps
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label
        htmlFor={inputProps.id}
        className="mb-1.5 block text-sm font-bold text-[#0d2569]"
      >
        {label}
      </label>
      <input
        {...inputProps}
        className="w-full rounded-full border border-[#0d2569]/20 bg-white px-4 py-2.5 text-sm text-[#0d2569] outline-none placeholder:text-[#0d2569]/40 focus:border-[#2573e2] focus:ring-2 focus:ring-[#2573e2]/20"
      />
    </div>
  );
}

export default function Login({
  onLoginAuth,
  onLoginDummy,
  onKembali,
}: {
  /** Dipanggil saat Firebase terkonfigurasi; kembalikan pesan error atau null bila sukses. */
  onLoginAuth: (email: string, kataSandi: string) => Promise<string | null>;
  /** Dipanggil saat mode contoh (Firebase belum terkonfigurasi). */
  onLoginDummy: (user: DummyUser) => void;
  /** Dipanggil saat tombol kembali ditekan (kembali ke landing page). */
  onKembali?: () => void;
}) {
  const [email, setEmail] = useState('');
  const [kataSandi, setKataSandi] = useState('');
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [sedangMasuk, setSedangMasuk] = useState(false);

  async function kirimForm(e: FormEvent) {
    e.preventDefault();
    setPesanError(null);
    setSedangMasuk(true);
    try {
      const error = await onLoginAuth(email, kataSandi);
      if (error) setPesanError(error);
    } finally {
      setSedangMasuk(false);
    }
  }

  const operatorDummy = DUMMY_USERS[0];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f2f2] px-4 py-16">
      {/* Gradasi pucat biru/navy di bagian bawah (re-skin gradasi pastel
          bawah template Mixpanel) — dekoratif saja. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-[#2573e2]/15 via-[#0d2569]/10 to-transparent"
      />

      {/* Tombol sudut kiri atas kembali ke landing page. */}
      {onKembali && (
        <button
          type="button"
          onClick={onKembali}
          className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-[#0d2569]/15 bg-white/80 px-3 py-2 text-xs font-semibold text-[#0d2569] hover:border-[#2573e2] hover:text-[#2573e2] sm:left-6 sm:top-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to Landing Page
        </button>
      )}

      {/* Kolom terpusat ~400px. */}
      <div className="relative w-full max-w-[400px]">
        <div className="text-center">
          {/* Logo lockup lengkap (PR login-logo-lockup): mark "rri" +
              teks sudah di dalam gambar; h-20 (80px) → lebar ~254px
              (rasio 3,18:1), ~64% dari kolom 400px — teks di gambar
              terbaca (~13px per baris) tanpa memenuhi kolom. Data URI
              terpisah (src/lib/logoRriLockup.ts) dari /logo-rri.svg
              karena file itu dipakai bersama (favicon, top bar admin,
              header Ajukan/Lacak) yang butuh mark saja. */}
          <img
            src={LOGO_RRI_LOCKUP_DATA_URI}
            alt="Logo RRI"
            className="mx-auto h-20 w-auto"
          />
        </div>

        <h1 className="mt-8 text-center text-3xl font-bold text-[#0d2569]">
          Welcome Back
        </h1>
        <p className="mt-2 text-center text-sm text-[#0d2569]/70">
          Enter your credentials to access your account
        </p>

        {/* Keterangan akses (versi lengkap, keputusan pengguna 15:53 WIB). */}
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-[#2573e2]/25 bg-white px-3.5 py-3">
          <Lock
            className="mt-0.5 h-4 w-4 shrink-0 text-[#2573e2]"
            aria-hidden
          />
          <p className="text-xs leading-relaxed text-[#0d2569]/80">
            Only designated officers can sign in here. If you&apos;re a
            client, please use Track or Submit a Request on the landing page.
          </p>
        </div>

        {isFirebaseConfigured ? (
          <form onSubmit={kirimForm} className="mt-6 space-y-5">
            <Kolom
              label="Email"
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your email address"
            />
            <Kolom
              label="Password"
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={kataSandi}
              onChange={(e) => setKataSandi(e.target.value)}
              placeholder="Password"
            />
            {pesanError && (
              <p className="rounded-md bg-[#2573e2]/10 px-3 py-2 text-sm font-semibold text-[#0d2569]">
                {pesanError}
              </p>
            )}
            <button
              type="submit"
              disabled={sedangMasuk}
              className="w-full rounded-full bg-[#2573e2] px-4 py-3 text-sm font-bold text-white hover:bg-[#0d2569] disabled:opacity-60"
            >
              {sedangMasuk ? 'Checking…' : 'Sign in'}
            </button>
          </form>
        ) : (
          <>
            <div className="mt-6">
              <Peringatan teks="Sample mode — sign in as Operator (Sample). In production, sign-in uses Firebase Auth; this dummy profile is only for development." />
            </div>
            <p className="mt-6 text-sm font-semibold text-[#0d2569]">
              Sign in as (Sample):
            </p>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => onLoginDummy(operatorDummy)}
                className="w-full rounded-md border border-[#2573e2]/20 bg-white p-4 text-left hover:border-[#2573e2] hover:bg-[#2573e2]/5"
              >
                <p className="text-sm font-bold text-[#0d2569]">
                  {operatorDummy.nama}
                </p>
                <p className="mt-1 text-xs text-[#0d2569]/70">
                  {labelJabatan(operatorDummy.jabatan)}
                </p>
                <p className="mt-2">
                  <span className="inline-flex items-center gap-1 rounded bg-[#2573e2]/10 px-2 py-0.5 text-xs font-semibold text-[#0d2569]">
                    {LABEL_PERAN[operatorDummy.peran]}
                  </span>
                </p>
              </button>
            </div>
            <p className="mt-6 text-center text-xs text-[#0d2569]/60">
              No password — sample mode is for development only{' '}
              {FASE_TERBANGUN}.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

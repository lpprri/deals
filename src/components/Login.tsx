// Halaman login — pola "Desktop sign up and login pages by EditorM"
// (Figma Community, Bhakthi Manjari, CC BY 4.0, fileKey
// KqMNx1pEplshja5mtMTZC7): split-screen 50/50 — form di kiri, panel
// foto full-height di kanan TANPA teks/overlay di atas foto; judul besar,
// field berlabel, tombol utama penuh lebar.
// HANYA polanya yang dipakai, dengan penyesuaian aplikasi ini: bahasa
// Indonesia; palet tetap 3 warna RRI (Biru #2573E2, Navy #0D2569, Putih);
// tombol Biru; TIDAK ada login sosial, TIDAK ada Forgot password (belum
// ada alurnya), TIDAK ada checkbox Remember (persistensi Firebase sudah
// default), TIDAK ada signup klien. Tautan publik Lacak/Ajukan TIDAK ada
// di halaman ini lagi (keputusan pengguna 2026-11-15) — halaman publik
// tersebut dijangkau lewat landing page, yang kini menjadi pintu masuk
// publik aplikasi.
// KOREKSI 2026-11-15: klien tidak punya login/akun; halaman ini hanya
// untuk Operator. Akses klien lewat Lacak (kode transaksi) dan Ajukan
// Permohonan (form publik).
// Panel kanan memakai foto gedung Kantor Pusat RRI Jakarta
// (src/lib/gedungRri.ts — data URI base64, karena push snapshot GitHub
// hanya menerima file teks). Logo RRI kecil tetap di atas form.
// Bila Firebase terkonfigurasi: form email + kata sandi (Firebase Auth).
// Bila belum: mode contoh dengan 1 tombol Operator dummy saja.
// Halaman ini TIDAK menampilkan konfigurasi Firebase apa pun.

import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { DummyUser } from '../lib/dummyUsers';
import { DUMMY_USERS } from '../lib/dummyUsers';
import { isFirebaseConfigured } from '../lib/firebaseApp';
import { GEDUNG_RRI_DATA_URI } from '../lib/gedungRri';
import { labelJabatan } from '../lib/labels';
import { FASE_TERBANGUN } from '../lib/master';
import { LABEL_PERAN } from '../lib/permissions';
import { Peringatan } from './ui';

const inputDalam =
  'w-full border-0 bg-transparent px-1 py-1 text-sm text-[#0d2569] outline-none placeholder:text-[#0d2569]/40';

/** Field dengan label mengambang memotong garis border atas (pola PR #15). */
function Kolom({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="relative rounded-md border border-[#2573e2]/30 bg-white px-3 pb-2 pt-2.5 focus-within:border-[#2573e2]">
      <span className="absolute -top-2 left-3 bg-white px-1 text-xs font-semibold text-[#0d2569]">
        {label}
      </span>
      {children}
    </div>
  );
}

export default function Login({
  onLoginAuth,
  onLoginDummy,
}: {
  /** Dipanggil saat Firebase terkonfigurasi; kembalikan pesan error atau null bila sukses. */
  onLoginAuth: (email: string, kataSandi: string) => Promise<string | null>;
  /** Dipanggil saat mode contoh (Firebase belum terkonfigurasi). */
  onLoginDummy: (user: DummyUser) => void;
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
    <div className="flex min-h-screen bg-white">
      {/* Kolom form (kiri, ~49%) */}
      <div className="flex w-full items-center justify-center px-6 py-10 lg:w-[49%] lg:shrink-0">
        <div className="w-full max-w-md">
          <img src="/logo-rri.svg" alt="Logo RRI" className="h-12 w-auto" />
          <h1 className="mt-6 text-4xl font-bold text-[#0d2569]">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Enter your credentials to access your account
          </p>

          {isFirebaseConfigured ? (
            <>
              <form onSubmit={kirimForm} className="mt-8 space-y-5">
                <Kolom label="Email">
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputDalam}
                    placeholder="your email address"
                  />
                </Kolom>
                <Kolom label="Password">
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={kataSandi}
                    onChange={(e) => setKataSandi(e.target.value)}
                    className={inputDalam}
                    placeholder="Password"
                  />
                </Kolom>
                {pesanError && (
                  <p className="rounded-md bg-[#2573e2]/10 px-3 py-2 text-sm font-semibold text-[#0d2569]">
                    {pesanError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={sedangMasuk}
                  className="w-full rounded-md bg-[#2573e2] px-4 py-3 text-sm font-bold text-white hover:bg-[#0d2569] disabled:opacity-60"
                >
                  {sedangMasuk ? 'Checking…' : 'Sign in'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mt-8">
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

          <p className="mt-8 text-center text-xs text-[#0d2569]/60">
            Partnership LPP RRI — {FASE_TERBANGUN}
          </p>
        </div>
      </div>

      {/* Panel foto gedung (kanan, ~51%) — full-height, tanpa teks/overlay */}
      <div className="hidden lg:block lg:w-[51%]">
        <img
          src={GEDUNG_RRI_DATA_URI}
          alt="Gedung Kantor Pusat RRI Jakarta"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

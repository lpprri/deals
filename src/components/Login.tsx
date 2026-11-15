// Halaman login — redesain 2026-11-15 mengikuti pola "Login & Register
// Web UI Kit (Freebie)" (Figma Community, Nazmul Hossain Shanto):
// layar split-screen — form di kiri, panel merek di kanan; field dengan
// label mengambang di garis border; tombol utama penuh lebar.
// HANYA pola layout/typografi yang dipakai; palet tetap 3 warna RRI
// (Biru #2573E2, Navy #0D2569, Putih), logo RRI asli, tanpa ilustrasi
// dan tanpa tombol sosial dari kit tersebut (tidak ada login sosial
// di aplikasi ini).
// KEPUTUSAN PENGGUNA 15/11/2026: halaman menampilkan 2 hal —
// Masuk/Daftar beserta pilihan peran Operator/Klien.
// Bila Firebase terkonfigurasi: form email + kata sandi (Firebase Auth).
// Bila belum: mode contoh dengan 1 tombol Operator dummy saja.
// KEPUTUSAN PENGGUNA 14/11/2026 21:29 WIB: hanya ada 1 role — Operator;
// pemilih 6 peran dummy Q-01 sudah tidak berlaku.
// FASE C — Client Order Portal (Q-10, 15/11/2026): bila Firebase
// terkonfigurasi, PIC klien bisa DAFTAR SENDIRI dengan memilih klien
// yang diwakilinya. Akun baru berstatus 'Menunggu' dan TIDAK bisa masuk
// dashboard sebelum disetujui Operator. Akun Operator TIDAK bisa
// didaftar sendiri — dibuat di Firebase console.
// Halaman ini TIDAK menampilkan konfigurasi Firebase apa pun.

import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { DummyUser } from '../lib/dummyUsers';
import { DUMMY_USERS } from '../lib/dummyUsers';
import type { PendaftaranKlienInput } from '../lib/auth';
import { isFirebaseConfigured } from '../lib/firebaseApp';
import { FASE_TERBANGUN } from '../lib/master';
import { LABEL_PERAN } from '../lib/permissions';
import { Peringatan } from './ui';

type ModeLogin = 'masuk' | 'daftar';
type PeranLogin = 'operator' | 'klien';

const inputDalam =
  'w-full border-0 bg-transparent px-1 py-1 text-sm text-[#0d2569] outline-none placeholder:text-[#0d2569]/40';

/** Field ala kit: label mengambang memotong garis border atas. */
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
  onDaftarKlien,
  daftarKlien,
}: {
  /** Dipanggil saat Firebase terkonfigurasi; kembalikan pesan error atau null bila sukses. */
  onLoginAuth: (email: string, kataSandi: string) => Promise<string | null>;
  /** Dipanggil saat mode contoh (Firebase belum terkonfigurasi). */
  onLoginDummy: (user: DummyUser) => void;
  /**
   * Pendaftaran PIC klien (self-service, Q-10). Kembalikan pesan error
   * atau null bila sukses — bila sukses App langsung menampilkan layar
   * "menunggu approval" untuk akun baru itu.
   */
  onDaftarKlien: (input: PendaftaranKlienInput) => Promise<string | null>;
  /** Daftar klien yang bisa dipilih PIC saat mendaftar (id + nama). */
  daftarKlien: { id: string; nama: string }[];
}) {
  const [mode, setMode] = useState<ModeLogin>('masuk');
  const [peran, setPeran] = useState<PeranLogin>('operator');
  const [email, setEmail] = useState('');
  const [kataSandi, setKataSandi] = useState('');
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [sedangMasuk, setSedangMasuk] = useState(false);
  // Form pendaftaran PIC klien (hanya bila Firebase terkonfigurasi).
  const [namaPic, setNamaPic] = useState('');
  const [emailDaftar, setEmailDaftar] = useState('');
  const [kataSandiDaftar, setKataSandiDaftar] = useState('');
  const [klienIdDaftar, setKlienIdDaftar] = useState('');
  const [pesanDaftar, setPesanDaftar] = useState<string | null>(null);
  const [sedangDaftar, setSedangDaftar] = useState(false);

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

  async function kirimDaftar(e: FormEvent) {
    e.preventDefault();
    setPesanDaftar(null);
    if (namaPic.trim() === '') {
      setPesanDaftar('Nama PIC wajib diisi.');
      return;
    }
    if (klienIdDaftar === '') {
      setPesanDaftar('Pilih klien yang Anda wakili.');
      return;
    }
    if (kataSandiDaftar.length < 6) {
      setPesanDaftar('Kata sandi minimal 6 karakter.');
      return;
    }
    setSedangDaftar(true);
    try {
      const error = await onDaftarKlien({
        email: emailDaftar,
        kataSandi: kataSandiDaftar,
        namaPic: namaPic.trim(),
        klienId: klienIdDaftar,
      });
      if (error) setPesanDaftar(error);
    } finally {
      setSedangDaftar(false);
    }
  }

  function gantiMode(m: ModeLogin) {
    setMode(m);
    setPesanError(null);
    setPesanDaftar(null);
  }

  function gantiPeran(p: PeranLogin) {
    setPeran(p);
    setPesanError(null);
    setPesanDaftar(null);
  }

  const operatorDummy = DUMMY_USERS[0];

  const judul = mode === 'masuk' ? 'Masuk' : 'Daftar';
  const subjudul =
    mode === 'masuk'
      ? peran === 'operator'
        ? 'Masuk sebagai Operator Layanan & Pengembangan Usaha'
        : 'Masuk ke Portal Klien sebagai PIC'
      : peran === 'operator'
        ? 'Akun Operator tidak bisa didaftar sendiri'
        : 'Daftar sebagai PIC klien — akun menunggu persetujuan Operator';

  const tombolTab = (m: ModeLogin, teks: string) => (
    <button
      key={m}
      type="button"
      onClick={() => gantiMode(m)}
      className={
        mode === m
          ? 'flex-1 rounded-md bg-[#2573e2] px-4 py-2 text-sm font-bold text-white'
          : 'flex-1 rounded-md px-4 py-2 text-sm font-semibold text-[#0d2569]'
      }
    >
      {teks}
    </button>
  );

  const tombolPeran = (
    p: PeranLogin,
    judulPeran: string,
    keterangan: string,
  ) => (
    <button
      key={p}
      type="button"
      onClick={() => gantiPeran(p)}
      className={
        peran === p
          ? 'rounded-md border-2 border-[#2573e2] bg-[#2573e2]/5 p-3 text-left'
          : 'rounded-md border border-[#2573e2]/20 bg-white p-3 text-left hover:border-[#2573e2]/50'
      }
    >
      <span className="block text-sm font-bold text-[#0d2569]">
        {judulPeran}
      </span>
      <span className="mt-0.5 block text-xs text-[#0d2569]/70">
        {keterangan}
      </span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-white">
      {/* Kolom form (kiri) */}
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <img src="/logo-rri.svg" alt="Logo RRI" className="h-12 w-auto" />
          <h1 className="mt-6 text-4xl font-bold text-[#0d2569]">{judul}</h1>
          <p className="mt-2 text-sm text-[#0d2569]/70">{subjudul}</p>

          {isFirebaseConfigured ? (
            <>
              {/* Pengalih Masuk / Daftar */}
              <div className="mt-6 flex rounded-md border border-[#2573e2]/30 p-1">
                {tombolTab('masuk', 'Masuk')}
                {tombolTab('daftar', 'Daftar')}
              </div>

              {/* Pilihan peran: Operator / Klien */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {tombolPeran(
                  'operator',
                  'Operator',
                  'Staf Layanan & Pengembangan Usaha',
                )}
                {tombolPeran('klien', 'Klien (PIC)', 'Portal Klien — PIC mitra')}
              </div>

              {mode === 'masuk' ? (
                <form onSubmit={kirimForm} className="mt-6 space-y-5">
                  <Kolom label="Email">
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputDalam}
                      placeholder="alamat email Anda"
                    />
                  </Kolom>
                  <Kolom label="Kata sandi">
                    <input
                      type="password"
                      required
                      autoComplete="current-password"
                      value={kataSandi}
                      onChange={(e) => setKataSandi(e.target.value)}
                      className={inputDalam}
                      placeholder="Kata sandi"
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
                    {sedangMasuk ? 'Memeriksa…' : 'Masuk'}
                  </button>
                  <p className="text-center text-xs text-[#0d2569]/60">
                    {peran === 'operator'
                      ? 'Masuk ke Portal Operator — seluruh modul kerja sama.'
                      : 'Masuk ke Portal Klien — timeline kerja sama Anda.'}
                  </p>
                </form>
              ) : peran === 'klien' ? (
                <form onSubmit={kirimDaftar} className="mt-6 space-y-5">
                  <Kolom label="Klien yang Anda wakili *">
                    <select
                      required
                      value={klienIdDaftar}
                      onChange={(e) => setKlienIdDaftar(e.target.value)}
                      className={inputDalam}
                    >
                      <option value="">— Pilih klien —</option>
                      {daftarKlien.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.nama}
                        </option>
                      ))}
                    </select>
                  </Kolom>
                  <Kolom label="Nama PIC *">
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={namaPic}
                      onChange={(e) => setNamaPic(e.target.value)}
                      className={inputDalam}
                      placeholder="Nama Anda sebagai PIC"
                    />
                  </Kolom>
                  <Kolom label="Email *">
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={emailDaftar}
                      onChange={(e) => setEmailDaftar(e.target.value)}
                      className={inputDalam}
                      placeholder="alamat email Anda"
                    />
                  </Kolom>
                  <Kolom label="Kata sandi (minimal 6 karakter) *">
                    <input
                      type="password"
                      required
                      autoComplete="new-password"
                      value={kataSandiDaftar}
                      onChange={(e) => setKataSandiDaftar(e.target.value)}
                      className={inputDalam}
                      placeholder="Kata sandi"
                    />
                  </Kolom>
                  {pesanDaftar && (
                    <p className="rounded-md bg-[#2573e2]/10 px-3 py-2 text-sm font-semibold text-[#0d2569]">
                      {pesanDaftar}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={sedangDaftar}
                    className="w-full rounded-md bg-[#2573e2] px-4 py-3 text-sm font-bold text-white hover:bg-[#0d2569] disabled:opacity-60"
                  >
                    {sedangDaftar ? 'Mendaftar…' : 'Daftar'}
                  </button>
                  <p className="text-center text-xs text-[#0d2569]/60">
                    Akun baru berstatus Menunggu — Anda baru bisa masuk ke
                    Portal Klien setelah disetujui Operator.
                  </p>
                </form>
              ) : (
                <div className="mt-6 rounded-md border border-[#2573e2]/20 bg-white p-6">
                  <p className="text-sm font-semibold text-[#0d2569]">
                    Akun Operator dibuat di Firebase console
                  </p>
                  <p className="mt-2 text-sm text-[#0d2569]/70">
                    Pendaftaran mandiri hanya tersedia untuk PIC klien.
                    Akun Operator dibuat oleh operator aplikasi di Firebase
                    console, lalu Operator masuk lewat tab Masuk.
                  </p>
                  <button
                    type="button"
                    onClick={() => gantiPeran('klien')}
                    className="mt-4 text-sm font-semibold text-[#2573e2] underline underline-offset-2"
                  >
                    Daftar sebagai PIC klien
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mt-6">
                <Peringatan teks="Mode contoh — masuk sebagai Operator (Contoh). Di produksi login memakai Firebase Auth; profil dummy ini hanya untuk pembangunan." />
              </div>
              <p className="mt-6 text-sm font-semibold text-[#0d2569]">
                Masuk sebagai (Contoh):
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
                    {operatorDummy.jabatan}
                  </p>
                  <p className="mt-2">
                    <span className="inline-flex items-center gap-1 rounded bg-[#2573e2]/10 px-2 py-0.5 text-xs font-semibold text-[#0d2569]">
                      {LABEL_PERAN[operatorDummy.peran]}
                    </span>
                  </p>
                </button>
              </div>
              <p className="mt-6 text-center text-xs text-[#0d2569]/60">
                Tanpa kata sandi — mode contoh hanya untuk pembangunan{' '}
                {FASE_TERBANGUN}. Pendaftaran PIC klien tersedia setelah
                Firebase terkonfigurasi.
              </p>
            </>
          )}

          <p className="mt-8 text-center text-xs text-[#0d2569]/60">
            Partnership LPP RRI — {FASE_TERBANGUN}
          </p>
        </div>
      </div>

      {/* Panel merek (kanan) — menggantikan panel ilustrasi 3D pada kit */}
      <div className="hidden w-[46%] p-6 lg:block">
        <div className="flex h-full flex-col justify-center rounded-[24px] bg-[#0d2569] p-10">
          <img
            src="/logo-rri.svg"
            alt="Logo RRI"
            className="h-16 w-auto self-start rounded-md bg-white p-2"
          />
          <h2 className="mt-6 text-3xl font-bold text-white">
            Partnership LPP RRI
          </h2>
          <p className="mt-1 text-sm text-white/70">
            Radio Republik Indonesia
          </p>
          <div className="mt-8 space-y-4 text-sm text-white">
            <p>
              <span className="font-bold">Portal Operator</span> — kelola
              kerja sama, kontrak, tagihan, dan laporan PNBP dalam satu
              tempat.
            </p>
            <p>
              <span className="font-bold">Portal Klien</span> — ajukan kerja
              sama, media order, dan permohonan sewa, lalu pantau timeline
              kerja sama Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Halaman login — aktivasi Firebase (PRD v2.0 Final Bab 7).
// Bila Firebase terkonfigurasi: form email + kata sandi (Firebase Auth).
// Bila belum: mode contoh dengan 1 tombol Operator dummy saja.
// KEPUTUSAN PENGGUNA 14/11/2026 21:29 WIB: hanya ada 1 role — Operator;
// pemilih 6 peran dummy Q-01 sudah tidak berlaku.
// FASE C — Client Order Portal (Q-10, 15/11/2026): bila Firebase
// terkonfigurasi, PIC klien bisa DAFTAR SENDIRI ("Daftar sebagai PIC
// klien") dengan memilih klien yang diwakilinya. Akun baru berstatus
// 'Menunggu' dan TIDAK bisa masuk dashboard sebelum disetujui Operator.
// Halaman ini TIDAK menampilkan konfigurasi Firebase apa pun.

import { useState } from 'react';
import type { FormEvent } from 'react';
import type { DummyUser } from '../lib/dummyUsers';
import { DUMMY_USERS } from '../lib/dummyUsers';
import type { PendaftaranKlienInput } from '../lib/auth';
import { isFirebaseConfigured } from '../lib/firebaseApp';
import { FASE_TERBANGUN } from '../lib/master';
import { LABEL_PERAN } from '../lib/permissions';
import { Peringatan } from './ui';

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
  const [email, setEmail] = useState('');
  const [kataSandi, setKataSandi] = useState('');
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [sedangMasuk, setSedangMasuk] = useState(false);
  // Form pendaftaran PIC klien (hanya bila Firebase terkonfigurasi).
  const [modeDaftar, setModeDaftar] = useState(false);
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

  const operatorDummy = DUMMY_USERS[0];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="text-center">
          <img
            src="/logo-rri.svg"
            alt="Logo RRI"
            className="mx-auto h-16 w-auto"
          />
          <h1 className="mt-4 text-3xl font-bold text-[#0d2569]">
            Partnership LPP RRI
          </h1>
          <p className="mt-1 text-sm text-[#0d2569]/70">
            Radio Republik Indonesia
          </p>
        </div>

        {isFirebaseConfigured ? (
          <>
            <form
              onSubmit={kirimForm}
              className="mt-8 rounded-md border border-[#2573e2]/20 bg-white p-6"
            >
              <p className="text-sm font-semibold text-[#0d2569]">
                Masuk sebagai Operator
              </p>
              <label className="mt-4 block text-sm font-semibold text-[#0d2569]">
                Email
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#2573e2]/30 px-3 py-2 text-sm font-normal text-[#0d2569] outline-none focus:border-[#2573e2]"
                  placeholder="alamat email Anda"
                />
              </label>
              <label className="mt-4 block text-sm font-semibold text-[#0d2569]">
                Kata sandi
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={kataSandi}
                  onChange={(e) => setKataSandi(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#2573e2]/30 px-3 py-2 text-sm font-normal text-[#0d2569] outline-none focus:border-[#2573e2]"
                  placeholder="Kata sandi"
                />
              </label>
              {pesanError && (
                <p className="mt-4 rounded-md bg-[#2573e2]/10 px-3 py-2 text-sm font-semibold text-[#0d2569]">
                  {pesanError}
                </p>
              )}
              <button
                type="submit"
                disabled={sedangMasuk}
                className="mt-6 w-full rounded-md bg-[#2573e2] px-4 py-2 text-sm font-bold text-white hover:bg-[#0d2569] disabled:opacity-60"
              >
                {sedangMasuk ? 'Memeriksa…' : 'Masuk'}
              </button>
            </form>
            <p className="mt-6 text-center text-xs text-[#0d2569]/60">
              Akun Operator dibuat oleh operator aplikasi di Firebase
              console.
            </p>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setModeDaftar((m) => !m);
                  setPesanDaftar(null);
                }}
                className="text-sm font-semibold text-[#2573e2] underline underline-offset-2"
              >
                {modeDaftar
                  ? 'Kembali ke masuk Operator'
                  : 'Daftar sebagai PIC klien'}
              </button>
            </div>
            {modeDaftar && (
              <form
                onSubmit={kirimDaftar}
                className="mt-4 rounded-md border border-[#2573e2]/20 bg-white p-6"
              >
                <p className="text-sm font-semibold text-[#0d2569]">
                  Daftar sebagai PIC klien
                </p>
                <p className="mt-1 text-xs text-[#0d2569]/70">
                  Akun baru berstatus Menunggu — Anda baru bisa masuk ke
                  Portal Klien setelah disetujui Operator.
                </p>
                <label className="mt-4 block text-sm font-semibold text-[#0d2569]">
                  Klien yang Anda wakili *
                  <select
                    required
                    value={klienIdDaftar}
                    onChange={(e) => setKlienIdDaftar(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#2573e2]/30 px-3 py-2 text-sm font-normal text-[#0d2569] outline-none focus:border-[#2573e2]"
                  >
                    <option value="">— Pilih klien —</option>
                    {daftarKlien.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mt-4 block text-sm font-semibold text-[#0d2569]">
                  Nama PIC *
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={namaPic}
                    onChange={(e) => setNamaPic(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#2573e2]/30 px-3 py-2 text-sm font-normal text-[#0d2569] outline-none focus:border-[#2573e2]"
                    placeholder="Nama Anda sebagai PIC"
                  />
                </label>
                <label className="mt-4 block text-sm font-semibold text-[#0d2569]">
                  Email *
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={emailDaftar}
                    onChange={(e) => setEmailDaftar(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#2573e2]/30 px-3 py-2 text-sm font-normal text-[#0d2569] outline-none focus:border-[#2573e2]"
                    placeholder="alamat email Anda"
                  />
                </label>
                <label className="mt-4 block text-sm font-semibold text-[#0d2569]">
                  Kata sandi (minimal 6 karakter) *
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={kataSandiDaftar}
                    onChange={(e) => setKataSandiDaftar(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[#2573e2]/30 px-3 py-2 text-sm font-normal text-[#0d2569] outline-none focus:border-[#2573e2]"
                    placeholder="Kata sandi"
                  />
                </label>
                {pesanDaftar && (
                  <p className="mt-4 rounded-md bg-[#2573e2]/10 px-3 py-2 text-sm font-semibold text-[#0d2569]">
                    {pesanDaftar}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={sedangDaftar}
                  className="mt-6 w-full rounded-md bg-[#2573e2] px-4 py-2 text-sm font-bold text-white hover:bg-[#0d2569] disabled:opacity-60"
                >
                  {sedangDaftar ? 'Mendaftar…' : 'Daftar'}
                </button>
              </form>
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
      </div>
    </div>
  );
}

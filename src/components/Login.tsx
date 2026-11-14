// Halaman login mode contoh — Fase A (PRD v2.0 Final Bab 7).
// Firebase belum terkonfigurasi: masuk dengan memilih salah satu peran
// dummy. Di produksi login memakai Firebase Auth dan daftar ini diganti
// nama & jabatan asli (Q-01). Tidak ada password di mode contoh, dan
// halaman ini TIDAK menampilkan konfigurasi Firebase apa pun.

import type { DummyUser } from '../lib/dummyUsers';
import { DUMMY_USERS } from '../lib/dummyUsers';
import { LABEL_PERAN } from '../lib/permissions';
import { Peringatan } from './ui';

export default function Login({
  onLogin,
}: {
  onLogin: (user: DummyUser) => void;
}) {
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

        <div className="mt-6">
          <Peringatan teks="Mode contoh — pilih peran untuk masuk. Di produksi login memakai Firebase Auth; nama & jabatan dummy wajib diganti nama asli sebelum produksi." />
        </div>

        <p className="mt-6 text-sm font-semibold text-[#0d2569]">
          Masuk sebagai (Contoh):
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {DUMMY_USERS.map((user) => (
            <button
              key={user.peran}
              type="button"
              onClick={() => onLogin(user)}
              className="rounded-md border border-[#2573e2]/20 bg-white p-4 text-left hover:border-[#2573e2] hover:bg-[#2573e2]/5"
            >
              <p className="text-sm font-bold text-[#0d2569]">{user.nama}</p>
              <p className="mt-1 text-xs text-[#0d2569]/70">{user.jabatan}</p>
              <p className="mt-2">
                <span className="inline-flex items-center gap-1 rounded bg-[#2573e2]/10 px-2 py-0.5 text-xs font-semibold text-[#0d2569]">
                  {LABEL_PERAN[user.peran]}
                </span>
              </p>
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-[#0d2569]/60">
          Tanpa kata sandi — mode contoh hanya untuk pembangunan Fase A.
        </p>
      </div>
    </div>
  );
}

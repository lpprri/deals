// Panel Profil — dipakai bersama oleh header landing (Marklo.tsx) dan
// top bar admin (App.tsx). Isi SAMA di keduanya: keadaan login =
// nama/email + Informasi Akun + Aktivitas Akun + Tema (tampil dulu)
// + Keluar; keadaan tamu = tombol Login + Tema. Baris Bahasa DIHAPUS
// atas instruksi pengguna 23/11/2026 — panel admin & klien berbahasa
// Indonesia saja, tanpa alih bahasa (keputusan 23/11/2026).
// Komponen ini HANYA kotak panelnya (absolute, w-80); state buka/tutup
// + klik-di-luar dipegang pemanggil — landing memakai tombol overlay,
// admin memakai ref + mousedown seperti Notifikasi.
import {
  Activity,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  Sun,
  User,
} from 'lucide-react';
import type { DummyUser } from '../lib/dummyUsers';

/** Baris Tema di panel Profil — TAMPIL DULU (pilihan pengguna
    2026-11-23): menampilkan pengaturan saat ini, belum bisa diganti.
    Menggantinya butuh mode gelap penuh untuk seluruh landing — pekerjaan
    besar yang diparkir 2026-11-22. Baris Bahasa dihapus 23/11/2026 atas
    instruksi pengguna (tanpa alih bahasa di panel admin & klien). */
function BarisTema() {
  return (
    <>
      <div className="flex items-center gap-3 px-3 py-2">
        <Sun className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        <span className="text-sm font-medium text-slate-700">Tema</span>
        <span className="ml-auto flex items-center gap-0.5 rounded-full border border-slate-200 p-0.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white">
            <Sun className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400">
            <Moon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400">
            <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </span>
      </div>
    </>
  );
}

export function PanelProfil({
  pengguna,
  onLogin,
  onLogout,
  onBukaModul,
  onTutup,
}: {
  pengguna?: DummyUser | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onBukaModul?: (modul: 'master' | 'audit') => void;
  onTutup: () => void;
}) {
  return (
    <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
      {pengguna ? (
        <>
          <div className="px-3 pb-2 pt-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {pengguna.nama}
            </p>
            <p className="truncate text-xs text-slate-500">
              {pengguna.email ?? ''}
            </p>
          </div>
          <div className="my-1 border-t border-slate-100" />
          <button
            type="button"
            onClick={() => {
              onTutup();
              onBukaModul?.('master');
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-mk-aksen"
          >
            <User className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            Informasi Akun
          </button>
          <button
            type="button"
            onClick={() => {
              onTutup();
              onBukaModul?.('audit');
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-mk-aksen"
          >
            <Activity className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            Aktivitas Akun
          </button>
          <div className="my-1 border-t border-slate-100" />
          <BarisTema />
          <div className="my-1 border-t border-slate-100" />
          <button
            type="button"
            onClick={() => {
              onTutup();
              onLogout?.();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-mk-aksen"
          >
            <LogOut className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            Keluar
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              onTutup();
              onLogin?.();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-mk-aksen px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-mk-aksen-gelap"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Login
          </button>
          <div className="my-1 border-t border-slate-100" />
          <BarisTema />
        </>
      )}
    </div>
  );
}

// Modul Chat antar operator 1-to-1 (PR #45, 16/11/2026).
// Palet HANYA 3 warna RRI: Biru #2573E2, Navy #0D2569, Putih #FFFFFF.
// Bahasa UI Indonesia.
//
// SUMBER KONTAK (keputusan koordinator — alasan lengkap di lib/pesan.ts):
// daftar kontak = OPERATOR_PALEMBANG (tanpa operator yang sedang login
// bila bisa ditentukan dari profil login — dicocokkan lewat nama,
// karena roster hanya berisi nama) DITAMBAH lawan bicara yang ditemukan
// di koleksi `pesan` (pengirim/penerima di luar roster), supaya
// percakapan nyata selalu tampil. Seed `pesan` KOSONG — tanpa pesan
// contoh — jadi daftar awal hanya berisi kelima operator.
// Satu kontak bisa dikenal lewat beberapa alamat (kunci internal
// turunan nama + email Auth asli, lihat `alamatDikenal`): utas dari
// semua alamat itu digabung dalam satu percakapan.

import { useMemo, useState, type FormEvent } from 'react';
import { ChevronLeft, MessageSquare, Send } from 'lucide-react';
import type { ModulProps } from '../lib/store';
import type { Pesan } from '../lib/types';
import { OPERATOR_PALEMBANG } from '../lib/master';
import {
  adalahKunciInternal,
  formatWaktuPesan,
  idPercakapan,
  kunciAlamatOperator,
} from '../lib/pesan';
import { JudulBagian, PesanKosong, inputClass } from '../components/ui';

/** Jabatan semua operator roster: Staf Layanan & Pengembangan Usaha. */
const JABATAN_OPERATOR = 'Staf Layanan & Pengembangan Usaha';

interface Kontak {
  nama: string;
  /** Alamat utama: email Auth asli bila diketahui, bila tidak kunci internal. */
  email: string;
  jabatan?: string;
  /** Semua alamat yang dikenal untuk kontak ini (utama + kunci internal). */
  alamatDikenal: string[];
  /** Pesan terakhir percakapan ini (bila ada). */
  terakhir?: { isi: string; tanggal: string };
  belumDibaca: number;
}

/** Inisial avatar dari nama (dua kata pertama) atau email. */
function inisial(nama: string, email: string): string {
  const kata = nama.split(' ').filter(Boolean);
  if (kata.length >= 2) {
    return (kata[0][0] + kata[1][0]).toUpperCase();
  }
  if (kata.length === 1 && kata[0].length > 1) {
    return kata[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

/**
 * Bangun daftar kontak dari roster + koleksi pesan, lengkap dengan pesan
 * terakhir dan jumlah belum dibaca per kontak.
 */
function bangunKontak(data: ModulProps['data'], user: ModulProps['user']): Kontak[] {
  const kunciSaya = kunciAlamatOperator(user.nama, user.email);
  const peta = new Map<string, Kontak>();
  const perNama = new Map<string, Kontak>();

  // 1. Roster operator (tanpa saya bila bisa ditentukan dari profil login).
  for (const nama of OPERATOR_PALEMBANG) {
    if (user.nama === nama) continue;
    const email = kunciAlamatOperator(nama);
    if (email === kunciSaya) continue;
    const kontak: Kontak = {
      nama,
      email,
      jabatan: JABATAN_OPERATOR,
      alamatDikenal: [email],
      belumDibaca: 0,
    };
    peta.set(email, kontak);
    perNama.set(nama.trim().toLowerCase(), kontak);
  }

  // 2. Email Auth asli dari pesan yang dikirim operator roster: ganti
  // alamat utama (kunci internal tetap dikenal, utas lama tidak hilang).
  // Nama pengirim dari pesan yang namanya cocok roster juga menautkan
  // pesan itu ke kontak roster (bukan kontak luar terpisah).
  for (const p of data.pesan) {
    const cocok = perNama.get(p.pengirim.nama.trim().toLowerCase());
    if (!cocok) continue;
    if (!cocok.alamatDikenal.includes(p.pengirim.email)) {
      cocok.alamatDikenal.push(p.pengirim.email);
    }
    if (!adalahKunciInternal(p.pengirim.email)) {
      cocok.email = p.pengirim.email;
    }
  }

  // 3. Lawan bicara di luar roster: nama dikenal dari pesan yang mereka
  // kirim; penerima yang belum pernah mengirim hanya dikenal emailnya.
  const namaPengirim = new Map<string, string>();
  for (const p of data.pesan) {
    if (p.pengirim.email !== kunciSaya) {
      namaPengirim.set(p.pengirim.email, p.pengirim.nama);
    }
  }
  const alamatDikenalSemua = new Set(
    [...peta.values()].flatMap((k) => k.alamatDikenal),
  );
  for (const p of data.pesan) {
    for (const alamat of [p.pengirim.email, p.penerima.email]) {
      if (alamat === kunciSaya) continue;
      if (alamatDikenalSemua.has(alamat)) continue;
      if (perNama.has(namaPengirim.get(alamat)?.trim().toLowerCase() ?? '')) {
        continue;
      }
      const kontak: Kontak = {
        nama: namaPengirim.get(alamat) ?? alamat,
        email: alamat,
        alamatDikenal: [alamat],
        belumDibaca: 0,
      };
      peta.set(alamat, kontak);
      alamatDikenalSemua.add(alamat);
    }
  }

  // 4. Pesan terakhir + jumlah belum dibaca per kontak.
  for (const kontak of peta.values()) {
    const idUtas = new Set(
      kontak.alamatDikenal.map((a) => idPercakapan(kunciSaya, a)),
    );
    const utas = data.pesan
      .filter((p) => idUtas.has(p.idPercakapan))
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    const akhir = utas[utas.length - 1];
    if (akhir) kontak.terakhir = { isi: akhir.isi, tanggal: akhir.tanggal };
    kontak.belumDibaca = utas.filter(
      (p) => p.penerima.email === kunciSaya && !p.dibaca,
    ).length;
  }

  // Percakapan aktif dulu (terbaru di atas), lalu kontak tanpa pesan.
  return [...peta.values()].sort((a, b) => {
    if (a.terakhir && b.terakhir) {
      return b.terakhir.tanggal.localeCompare(a.terakhir.tanggal);
    }
    if (a.terakhir) return -1;
    if (b.terakhir) return 1;
    return a.nama.localeCompare(b.nama);
  });
}

export default function Chat(props: ModulProps) {
  const { data, user, actions, cari } = props;
  const kunciSaya = kunciAlamatOperator(user.nama, user.email);
  const [terpilih, setTerpilih] = useState<string | null>(null);
  const [draf, setDraf] = useState('');
  const [galat, setGalat] = useState('');

  const semuaKontak = useMemo(
    () => bangunKontak(data, user),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.pesan, user.nama, user.email],
  );
  const kataKunci = cari.trim().toLowerCase();
  const kontak = semuaKontak.filter(
    (k) =>
      kataKunci === '' ||
      `${k.nama} ${k.email}`.toLowerCase().includes(kataKunci),
  );
  const kontakAktif =
    semuaKontak.find((k) => k.email === terpilih) ?? null;
  const idUtasAktif = kontakAktif
    ? new Set(
        kontakAktif.alamatDikenal.map((a) => idPercakapan(kunciSaya, a)),
      )
    : new Set<string>();
  const utas: Pesan[] = kontakAktif
    ? data.pesan
        .filter((p) => idUtasAktif.has(p.idPercakapan))
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
    : [];

  const pilihKontak = (k: Kontak) => {
    setTerpilih(k.email);
    setGalat('');
    for (const alamat of k.alamatDikenal) {
      actions.tandaiPesanDibaca(idPercakapan(kunciSaya, alamat));
    }
  };

  const kirim = (e: FormEvent) => {
    e.preventDefault();
    if (!kontakAktif) return;
    const hasil = actions.kirimPesan({
      penerimaEmail: kontakAktif.email,
      isi: draf,
    });
    if (hasil) {
      setGalat(hasil);
      return;
    }
    setDraf('');
    setGalat('');
  };

  const pesanTerakhirSaya =
    utas.length > 0 ? utas[utas.length - 1] : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <JudulBagian>Chat</JudulBagian>
      </div>
      <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white">
        {/* Daftar percakapan (kiri). */}
        <div
          className={`w-full shrink-0 md:w-80 md:border-r md:border-slate-200 ${
            kontakAktif ? 'hidden md:block' : 'block'
          }`}
        >
          <div className="border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#0d2569]/60">
            Percakapan
          </div>
          {kontak.length === 0 ? (
            <div className="p-4">
              <PesanKosong teks="Belum ada percakapan" />
            </div>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto">
              {kontak.map((k) => (
                <li key={k.email}>
                  <button
                    type="button"
                    onClick={() => pilihKontak(k)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#2573e2]/5 ${
                      k.email === terpilih ? 'bg-[#2573e2]/10' : ''
                    }`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2573e2] text-xs font-bold text-white">
                      {inisial(k.nama, k.email)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-[#0d2569]">
                          {k.nama}
                        </span>
                        {k.belumDibaca > 0 && (
                          <span className="shrink-0 rounded-full bg-[#2573e2] px-1.5 py-0.5 text-[10px] font-bold text-white">
                            {k.belumDibaca}
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-xs text-[#0d2569]/60">
                        {k.jabatan ?? k.email}
                      </span>
                      <span className="block truncate text-xs text-[#0d2569]/60">
                        {k.terakhir
                          ? k.terakhir.isi
                          : 'Belum ada pesan'}
                      </span>
                    </span>
                    {k.terakhir && (
                      <span className="shrink-0 text-[11px] text-[#0d2569]/50">
                        {formatWaktuPesan(k.terakhir.tanggal)}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Utas percakapan (kanan). */}
        <div
          className={`min-w-0 flex-1 flex-col ${
            kontakAktif ? 'flex' : 'hidden md:flex'
          }`}
        >
          {!kontakAktif ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
              <MessageSquare size={32} className="text-[#2573e2]/40" />
              <p className="text-sm text-[#0d2569]/60">
                Pilih percakapan untuk mulai mengirim pesan
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setTerpilih(null)}
                  className="rounded p-1 text-[#0d2569]/60 hover:bg-[#2573e2]/5 md:hidden"
                  aria-label="Kembali ke percakapan"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2573e2] text-xs font-bold text-white">
                  {inisial(kontakAktif.nama, kontakAktif.email)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[#0d2569]">
                    {kontakAktif.nama}
                  </span>
                  <span className="block truncate text-xs text-[#0d2569]/60">
                    {kontakAktif.jabatan ?? kontakAktif.email}
                  </span>
                </span>
              </div>

              <div className="max-h-[55vh] flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
                {utas.length === 0 ? (
                  <PesanKosong teks="Belum ada pesan. Kirim pesan pertama Anda." />
                ) : (
                  utas.map((p) => {
                    const saya = p.pengirim.email === kunciSaya;
                    return (
                      <div
                        key={p.id}
                        className={`flex ${saya ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-3 py-2 ${
                            saya
                              ? 'bg-[#2573e2] text-white'
                              : 'border border-slate-200 bg-white text-[#0d2569]'
                          }`}
                        >
                          {!saya && (
                            <div className="mb-0.5 text-xs font-semibold">
                              {p.pengirim.nama}
                            </div>
                          )}
                          <div className="whitespace-pre-wrap break-words text-sm">
                            {p.isi}
                          </div>
                          <div
                            className={`mt-1 text-right text-[11px] ${
                              saya ? 'text-white/70' : 'text-[#0d2569]/50'
                            }`}
                          >
                            {formatWaktuPesan(p.tanggal)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {pesanTerakhirSaya &&
                pesanTerakhirSaya.pengirim.email === kunciSaya && (
                  <div className="border-t border-slate-200 bg-white px-4 pt-1 text-right text-[11px] text-[#0d2569]/50">
                    {pesanTerakhirSaya.dibaca ? 'Dibaca' : 'Terkirim'}
                  </div>
                )}

              <form
                onSubmit={kirim}
                className="flex items-center gap-2 border-t border-slate-200 bg-white px-4 py-3"
              >
                <input
                  value={draf}
                  onChange={(e) => setDraf(e.target.value)}
                  placeholder="Tulis pesan…"
                  aria-label="Tulis pesan"
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="submit"
                  disabled={!draf.trim()}
                  className="flex shrink-0 items-center gap-2 rounded-md bg-[#2573e2] px-3 py-2 text-sm font-semibold text-white hover:bg-[#0d2569] disabled:opacity-40"
                >
                  <Send size={16} />
                  Kirim
                </button>
              </form>
              {galat && (
                <div className="border-t border-slate-200 bg-white px-4 pb-3 text-xs text-red-600">
                  {galat}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

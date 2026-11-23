// Tombol lonceng + panel notifikasi di top bar (pola Mekari Qontak — layout
// saja). Isi panel dihitung dari data lewat daftarNotifikasi (src/lib/
// notifikasi.ts): TIDAK ADA notifikasi fabrikasi. Status dibaca disimpan
// di localStorage key `rri-notifikasi-dibaca` (array id).
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  CheckCheck,
  ClipboardList,
  Clock,
  FileWarning,
  Inbox,
  Receipt,
  Scale,
  UserPlus,
} from 'lucide-react';
import type { AppData } from '../lib/types';
import { hariIniIso } from '../lib/format';
import {
  daftarNotifikasi,
  type ModulNotifikasi,
  type Notifikasi,
  type TabNotifikasi,
} from '../lib/notifikasi';

const KUNCI_DIBACA = 'rri-notifikasi-dibaca';

const IKON_KATEGORI: Record<string, typeof Bell> = {
  'Public submission awaiting review': UserPlus,
  'Overdue invoice': Receipt,
  'Submission needs follow-up': Inbox,
  'Disposition task': ClipboardList,
  'Missing document': FileWarning,
  'Lease expiring soon': Clock,
  'Reconciliation difference': Scale,
};

const TAB: { id: TabNotifikasi; label: string }[] = [
  { id: 'general', label: 'Umum' },
  { id: 'inbox', label: 'Kotak masuk' },
  { id: 'approval', label: 'Persetujuan' },
];

function muatDibaca(): Set<string> {
  try {
    const mentah = localStorage.getItem(KUNCI_DIBACA);
    if (!mentah) return new Set();
    const arr: unknown = JSON.parse(mentah);
    return Array.isArray(arr) ? new Set(arr.filter((x): x is string => typeof x === 'string')) : new Set();
  } catch {
    return new Set();
  }
}

function simpanDibaca(dibaca: Set<string>) {
  try {
    localStorage.setItem(KUNCI_DIBACA, JSON.stringify([...dibaca]));
  } catch {
    // localStorage tidak tersedia — status dibaca hanya berlaku di sesi ini.
  }
}

interface Props {
  data: AppData;
  onNavigasi: (modul: ModulNotifikasi) => void;
}

export default function Notifikasi({ data, onNavigasi }: Props) {
  const [terbuka, setTerbuka] = useState(false);
  const [tab, setTab] = useState<TabNotifikasi>('general');
  const [hanyaBelumDibaca, setHanyaBelumDibaca] = useState(false);
  const [filterKategori, setFilterKategori] = useState('');
  const [dibaca, setDibaca] = useState<Set<string>>(muatDibaca);
  const refPanel = useRef<HTMLDivElement>(null);

  const semua = useMemo(() => daftarNotifikasi(data, hariIniIso()), [data]);
  const jumlahBelumDibaca = semua.filter((n) => !dibaca.has(n.id)).length;

  // Tutup panel saat klik di luar & saat Escape.
  useEffect(() => {
    if (!terbuka) return;
    const tanganiKlik = (e: MouseEvent) => {
      if (refPanel.current && !refPanel.current.contains(e.target as Node)) {
        setTerbuka(false);
      }
    };
    const tanganiTombol = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTerbuka(false);
    };
    document.addEventListener('mousedown', tanganiKlik);
    document.addEventListener('keydown', tanganiTombol);
    return () => {
      document.removeEventListener('mousedown', tanganiKlik);
      document.removeEventListener('keydown', tanganiTombol);
    };
  }, [terbuka]);

  const itemTab: Notifikasi[] =
    tab === 'general' ? semua : semua.filter((n) => n.tab === tab);
  const kategoriTab = [...new Set(itemTab.map((n) => n.kategori))];
  const tampil = itemTab.filter(
    (n) =>
      (filterKategori === '' || n.kategori === filterKategori) &&
      (!hanyaBelumDibaca || !dibaca.has(n.id)),
  );

  const tandaiDibaca = (id: string) => {
    setDibaca((sebelum) => {
      const baru = new Set(sebelum);
      baru.add(id);
      simpanDibaca(baru);
      return baru;
    });
  };

  const tandaiSemuaDibaca = () => {
    setDibaca(() => {
      const baru = new Set(semua.map((n) => n.id));
      simpanDibaca(baru);
      return baru;
    });
  };

  const gantiTab = (t: TabNotifikasi) => {
    setTab(t);
    setFilterKategori('');
  };

  return (
    <div className="relative" ref={refPanel}>
      <button
        type="button"
        onClick={() => setTerbuka((v) => !v)}
        aria-label={`Notifikasi${jumlahBelumDibaca > 0 ? `, ${jumlahBelumDibaca} belum dibaca` : ''}`}
        aria-expanded={terbuka}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#0d2569] hover:bg-[#2573e2]/10"
      >
        <Bell size={20} />
        {jumlahBelumDibaca > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2573e2] px-1 text-[11px] font-bold text-white">
            {jumlahBelumDibaca > 99 ? '99+' : jumlahBelumDibaca}
          </span>
        )}
      </button>

      {terbuka && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[420px] max-w-[90vw] overflow-hidden rounded-lg border border-[#2573e2]/20 bg-white shadow-xl">
          <div className="flex items-center justify-between px-4 pb-2 pt-4">
            <h2 className="text-lg font-bold text-[#0d2569]">Notifikasi</h2>
            <button
              type="button"
              role="switch"
              aria-checked={hanyaBelumDibaca}
              onClick={() => setHanyaBelumDibaca((v) => !v)}
              className="flex items-center gap-2 text-sm text-[#0d2569]"
            >
              <span
                className={`flex h-5 w-9 items-center rounded-full px-0.5 transition-colors ${
                  hanyaBelumDibaca ? 'bg-[#2573e2]' : 'bg-[#0d2569]/20'
                }`}
              >
                <span
                  className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    hanyaBelumDibaca ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </span>
              Hanya yang belum dibaca
            </button>
          </div>

          <div className="flex items-center gap-4 border-b border-[#2573e2]/15 px-4">
            {TAB.map((t) => {
              const jumlah =
                t.id === 'general'
                  ? semua.length
                  : semua.filter((n) => n.tab === t.id).length;
              const aktif = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => gantiTab(t.id)}
                  className={`border-b-2 py-2 text-sm ${
                    aktif
                      ? 'border-[#2573e2] font-semibold text-[#2573e2]'
                      : 'border-transparent text-[#0d2569]/60 hover:text-[#0d2569]'
                  }`}
                >
                  {t.label}
                  <span className="ml-1 text-xs text-[#0d2569]/50">
                    {jumlah}
                  </span>
                </button>
              );
            })}
            {jumlahBelumDibaca > 0 && (
              <button
                type="button"
                onClick={tandaiSemuaDibaca}
                className="ml-auto flex items-center gap-1 py-2 text-xs font-semibold text-[#2573e2] hover:underline"
              >
                <CheckCheck size={14} /> Tandai semua sudah dibaca
              </button>
            )}
          </div>

          <div className="px-4 py-3">
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              aria-label="Saring berdasarkan kategori"
              className="w-full rounded-md border border-[#2573e2]/30 px-3 py-2 text-sm text-[#0d2569] outline-none focus:border-[#2573e2]"
            >
              <option value="">Semua notifikasi</option>
              {kategoriTab.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div className="max-h-[55vh] overflow-auto px-2 pb-3">
            {tampil.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-10 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2573e2]/10">
                  <Bell size={40} className="text-[#2573e2]" />
                </span>
                <p className="mt-4 text-base font-bold text-[#0d2569]">
                  Belum ada notifikasi
                </p>
                <p className="mt-1 text-sm text-[#0d2569]/60">
                  Daftar notifikasi Anda akan muncul di sini.
                </p>
              </div>
            ) : (
              tampil.map((n) => {
                const Ikon = IKON_KATEGORI[n.kategori] ?? Bell;
                const belumDibaca = !dibaca.has(n.id);
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      tandaiDibaca(n.id);
                      setTerbuka(false);
                      onNavigasi(n.modul);
                    }}
                    className="flex w-full items-start gap-3 rounded-md px-2 py-2.5 text-left hover:bg-[#2573e2]/5"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2573e2]/10 text-[#2573e2]">
                      <Ikon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-[#2573e2]">
                        {n.kategori}
                      </span>
                      <span className="mt-0.5 block text-sm font-semibold text-[#0d2569]">
                        {n.judul}
                      </span>
                      <span className="mt-0.5 block text-xs text-[#0d2569]/60">
                        {n.detail}
                      </span>
                    </span>
                    {belumDibaca && (
                      <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#2573e2]" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

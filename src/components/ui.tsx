// Komponen UI bersama — pola HubSpot (Bab 8.1), palet HANYA 3 warna RRI:
// Biru #2573E2, Navy #0D2569, Putih #FFFFFF. Status dibedakan teks & ikon,
// bukan warna baru: semua badge memakai tint Biru/Navy yang sama.

import type { ReactNode } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe,
  Info,
  XCircle,
} from 'lucide-react';
import type { Bahasa } from '../lib/bahasa';
import { useBahasa } from '../lib/bahasa';
import {
  labelStatusDenda,
  labelStatusDokumen,
  labelStatusKlien,
  labelStatusKontrak,
  labelStatusOrder,
  labelStatusPersetujuan,
  labelStatusSewa,
  labelStatusTagihan,
  labelStatusTask,
  labelStatusTemuan,
  labelStatusTiket,
  labelStatusVerifikasi,
  labelTahapPengajuan,
  labelTahapPipeline,
} from '../lib/labels';

/**
 * Label untuk nilai status tersimpan apa pun yang tampil di badge —
 * DUAL BAHASA Fase 1: arah Inggris memakai peta labels.ts, arah
 * Indonesia mengembalikan nilai tersimpan itu sendiri (lihat labels.ts:
 * audit Fase 1 tidak menemukan pengecualian). Setiap helper
 * mengembalikan nilai asli bila tidak mengenalnya, jadi rantai ini aman
 * untuk semua domain status (kontrak, tagihan, dokumen, pembayaran,
 * denda, sewa, temuan, persetujuan, order, task, tiket, tahap
 * pengajuan/pipeline). Nilai yang sudah Inggris lolos apa adanya.
 */
function labelStatusTampilan(status: string, bahasa: Bahasa): string {
  for (const fn of [
    labelStatusKontrak,
    labelStatusKlien,
    labelStatusDokumen,
    labelStatusTagihan,
    labelStatusVerifikasi,
    labelStatusDenda,
    labelStatusSewa,
    labelStatusTemuan,
    labelStatusPersetujuan,
    labelStatusOrder,
    labelStatusTask,
    labelStatusTiket,
    labelTahapPipeline,
    labelTahapPengajuan,
  ]) {
    const mapped = fn(status, bahasa);
    if (mapped !== status) return mapped;
  }
  return status;
}

/**
 * Toggle bahasa ID | EN (Fase 1 dual bahasa, meniru toggle Beranda dulu:
 * pil ID | EN, `aria-pressed`, yang aktif berlatar navy #0D2569).
 * Bentuk penuh dipakai di login dan footer sidebar terbuka; `ringkas`
 * dipakai saat sidebar dilipat — satu tombol globe yang mengganti bahasa
 * tiap ketukan, supaya toggle tetap bisa dijangkau (T6).
 */
export function ToggleBahasa({
  ringkas = false,
  className = '',
}: {
  ringkas?: boolean;
  className?: string;
}) {
  const { bahasa, setBahasa } = useBahasa();
  if (ringkas) {
    return (
      <button
        type="button"
        onClick={() => setBahasa(bahasa === 'id' ? 'en' : 'id')}
        title={
          bahasa === 'id'
            ? 'Bahasa: Indonesia — ketuk untuk English'
            : 'Language: English — tap for Bahasa Indonesia'
        }
        aria-label="Ganti bahasa / Change language"
        className={`flex h-9 w-9 flex-col items-center justify-center rounded-md border border-[#0d2569]/15 text-[#0d2569]/70 hover:bg-[#2573e2]/10 hover:text-[#2573e2] ${className}`}
      >
        <Globe size={15} aria-hidden />
        <span className="text-[9px] font-bold leading-none">
          {bahasa.toUpperCase()}
        </span>
      </button>
    );
  }
  const tombolAktif =
    'flex-1 bg-[#0d2569] px-2.5 py-1.5 text-white';
  const tombolNonaktif =
    'flex-1 bg-white px-2.5 py-1.5 text-[#0d2569] hover:bg-slate-100';
  return (
    <div
      className={`inline-flex items-center rounded-lg border border-[#0d2569]/20 text-xs font-semibold ${className}`}
      role="group"
      aria-label="Bahasa / Language"
    >
      <button
        type="button"
        onClick={() => setBahasa('id')}
        aria-pressed={bahasa === 'id'}
        className={`rounded-l-lg ${bahasa === 'id' ? tombolAktif : tombolNonaktif}`}
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => setBahasa('en')}
        aria-pressed={bahasa === 'en'}
        className={`rounded-r-lg ${bahasa === 'en' ? tombolAktif : tombolNonaktif}`}
      >
        EN
      </button>
    </div>
  );
}

export function Kartu({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-md border border-[#2573e2]/20 bg-white p-5 ${className}`}>
      {children}
    </div>
  );
}

export function JudulBagian({ children }: { children: ReactNode }) {
  return <h2 className="text-base font-bold text-[#0d2569]">{children}</h2>;
}

/**
 * Kartu statistik pola DashStack (referensi Figma 14/11/2026): label kecil,
 * angka besar, ikon dalam chip tint Biru, dan baris konteks faktual di bawah
 * (bukan tren persen — data hanya sampai Sep 2026, tren bulanan akan
 * menyesatkan). Palet tetap 3 warna RRI; `ikon` opsional agar pemakaian
 * lama (mis. Marketing) tetap jalan.
 */
export function StatCard({
  label,
  nilai,
  keterangan,
  ikon,
}: {
  label: string;
  nilai: string;
  keterangan?: string;
  ikon?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[#2573e2]/15 bg-white p-4 shadow-[0_1px_3px_rgba(13,37,105,0.08)]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-[#0d2569]/60">{label}</p>
        {ikon && (
          <span className="inline-flex shrink-0 items-center justify-center rounded-md bg-[#2573e2]/10 p-2 text-[#2573e2]">
            {ikon}
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold leading-tight text-[#0d2569]">
        {nilai}
      </p>
      {keterangan && (
        <p className="mt-1 text-xs leading-relaxed text-[#0d2569]/60">
          {keterangan}
        </p>
      )}
    </div>
  );
}

/** Badge status: teks + ikon, latar tint Biru/Navy saja (Bab 8.2).
 * Bahasa dibaca dari konteks (Fase 1) — semua pemakai StatusBadge di
 * modul otomatis mengikuti toggle tanpa prop berantai. */
export function StatusBadge({ status }: { status: string }) {
  const { bahasa } = useBahasa();
  // Ikon dipilih dari nilai mentah (Indonesia) ATAU label tampil —
  // call-site boleh meneruskan keduanya. 'Clock' dicek sebelum centang
  // supaya 'Belum Ada' ('Not yet available') tidak mendapat ikon centang
  // karena mengandung 'ada'/'available'.
  const s = status.toLowerCase();
  const t = labelStatusTampilan(status, bahasa).toLowerCase();
  const negatif =
    s.includes('lewat') ||
    s.includes('ditolak') ||
    s.includes('bermasalah') ||
    s.includes('dibatalkan') ||
    s.includes('dihapus') ||
    t.includes('overdue') ||
    t.includes('rejected') ||
    t.includes('problematic') ||
    t.includes('cancelled') ||
    t.includes('removed');
  const menunggu =
    s.includes('menunggu') ||
    s.includes('belum') ||
    s.includes('ditelaah') ||
    s.includes('masuk') ||
    s.includes('diproses') ||
    s.includes('berjalan') ||
    t.includes('pending') ||
    t.includes('not yet') ||
    t.includes('awaiting') ||
    t.includes('in progress') ||
    t.includes('under review') ||
    t.includes('due') ||
    t.includes('received');
  const positif =
    s.includes('lunas') ||
    s.includes('selesai') ||
    s.includes('aktif') ||
    s.includes('terverifikasi') ||
    s.includes('disetujui') ||
    s.includes('dikonversi') ||
    t.includes('paid') ||
    t.includes('completed') ||
    t.includes('active') ||
    t.includes('available') ||
    t.includes('verified') ||
    t.includes('approved') ||
    t.includes('converted') ||
    t.includes('matched') ||
    t.includes('sent') ||
    t.includes('answered') ||
    t.includes('resolved');
  const Icon = negatif ? XCircle : menunggu ? Clock : positif ? CheckCircle2 : Info;
  return (
    <span className="inline-flex items-center gap-1 rounded bg-[#2573e2]/10 px-2 py-0.5 text-xs font-semibold text-[#0d2569]">
      <Icon size={13} className="text-[#2573e2]" />
      {labelStatusTampilan(status, bahasa)}
    </span>
  );
}

export function TombolUtama({
  children,
  onClick,
  type = 'button',
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="rounded-md bg-[#2573e2] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function TombolSekunder({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-[#2573e2] bg-white px-3 py-1.5 text-sm font-semibold text-[#0d2569] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function TabBar({
  tabs,
  aktif,
  onPilih,
}: {
  tabs: { id: string; label: string }[];
  aktif: string;
  onPilih: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-[#2573e2]/20">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onPilih(t.id)}
          className={`px-3 py-2 text-sm font-semibold ${
            t.id === aktif
              ? 'border-b-2 border-[#2573e2] text-[#2573e2]'
              : 'text-[#0d2569]/60 hover:text-[#0d2569]'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function PesanKosong({ teks }: { teks: string }) {
  return (
    <p className="rounded-md border border-dashed border-[#2573e2]/40 bg-[#2573e2]/5 px-4 py-6 text-center text-sm text-[#0d2569]/70">
      {teks}
    </p>
  );
}

export function Peringatan({ teks }: { teks: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-4 py-3 text-sm text-[#0d2569]">
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[#2573e2]" />
      <span>{teks}</span>
    </div>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1 block text-xs font-semibold text-[#0d2569]/70">{children}</label>;
}

export const inputClass =
  'w-full rounded-md border border-[#2573e2]/40 px-3 py-2 text-sm text-[#0d2569] outline-none focus:border-[#2573e2]';

/**
 * Pola tabel bersama — DashStack (referensi Figma 14/11/2026): kartu putih
 * bersudut membulat bayangan halus; header kecil huruf tebal navy redup;
 * baris hover tint Biru sangat tipis; pemisah tipis; angka rata kanan;
 * status tetap memakai StatusBadge (teks + ikon). Palet tetap 3 warna RRI.
 * Dipakai semua tabel di modul agar konsisten — jangan lagi menulis gaya
 * tabel inline yang berbeda-beda di tiap modul.
 */
export function Tabel({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

/** Sel header tabel: kecil, tebal, navy redup, garis bawah. */
export function Th({
  children,
  kanan = false,
  className = '',
}: {
  children: ReactNode;
  kanan?: boolean;
  className?: string;
}) {
  return (
    <th
      className={`border-b border-[#2573e2]/20 py-2.5 pr-3 text-xs font-semibold whitespace-nowrap text-[#0d2569]/60 last:pr-0 ${kanan ? 'text-right' : 'text-left'} ${className}`}
    >
      {children}
    </th>
  );
}

/** Sel isi tabel: navy, garis bawah tipis. `kanan` untuk angka. `colSpan` untuk sel gabungan (mis. baris total). `children` opsional untuk sel pengisi kosong. */
export function Td({
  children,
  kanan = false,
  tebal = false,
  colSpan,
  className = '',
}: {
  children?: ReactNode;
  kanan?: boolean;
  tebal?: boolean;
  colSpan?: number;
  className?: string;
}) {
  return (
    <td
      colSpan={colSpan}
      className={`border-b border-[#2573e2]/10 py-2.5 pr-3 align-top text-[#0d2569] last:pr-0 ${kanan ? 'text-right whitespace-nowrap' : 'text-left'} ${tebal ? 'font-semibold' : ''} ${className}`}
    >
      {children}
    </td>
  );
}

/** Baris isi tabel: hover tint Biru sangat tipis. `onClick` untuk baris yang bisa diklik (ditambah `cursor-pointer`). */
export function Baris({
  children,
  onClick,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <tr
      onClick={onClick}
      className={`hover:bg-[#2573e2]/5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
}

/**
 * Butir daftar di dalam Kartu (mis. Perlu perhatian, Aktivitas terakhir,
 * disposisi/tugas): pemisah tipis antar butir, tanpa garis di butir terakhir.
 */
export function ItemDaftar({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <li className={`border-b border-[#2573e2]/10 pb-3 last:border-0 last:pb-0 ${className}`}>
      {children}
    </li>
  );
}

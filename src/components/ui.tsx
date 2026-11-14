// Komponen UI bersama — pola HubSpot (Bab 8.1), palet HANYA 3 warna RRI:
// Biru #2573E2, Navy #0D2569, Putih #FFFFFF. Status dibedakan teks & ikon,
// bukan warna baru: semua badge memakai tint Biru/Navy yang sama.

import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Info, XCircle } from 'lucide-react';

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

export function StatCard({
  label,
  nilai,
  keterangan,
}: {
  label: string;
  nilai: string;
  keterangan?: string;
}) {
  return (
    <div className="rounded-md border border-[#2573e2]/20 bg-white p-4">
      <p className="text-xs text-[#0d2569]/60">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#0d2569]">{nilai}</p>
      {keterangan && <p className="mt-1 text-xs text-[#0d2569]/60">{keterangan}</p>}
    </div>
  );
}

/** Badge status: teks + ikon, latar tint Biru/Navy saja (Bab 8.2). */
export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const Icon = s.includes('lewat') || s.includes('ditolak') || s.includes('bermasalah')
    ? XCircle
    : s.includes('lunas') || s.includes('selesai') || s.includes('aktif') || s.includes('ada') || s.includes('terverifikasi') || s.includes('disetujui') || s.includes('dikonversi')
      ? CheckCircle2
      : s.includes('menunggu') || s.includes('belum') || s.includes('ditelaah') || s.includes('masuk')
        ? Clock
        : Info;
  return (
    <span className="inline-flex items-center gap-1 rounded bg-[#2573e2]/10 px-2 py-0.5 text-xs font-semibold text-[#0d2569]">
      <Icon size={13} className="text-[#2573e2]" />
      {status}
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

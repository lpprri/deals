// Dashboard — Fase A (PRD v2.0 Final Bab 4 & Bab 7.5).
// Semua angka dihitung dari data lewat derive.ts (satu sumber hitung),
// sehingga cocok dengan Revenue dan Reporting.
// Tampilan kartu statistik + grafik tren mengikuti pola DashStack
// (referensi Figma 14/11/2026) — hanya pola tata letak; palet tetap
// 3 warna RRI dan tren persen tidak dipakai (data hanya sampai Sep 2026).

import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  FileText,
  Handshake,
  Receipt,
  Trophy,
} from 'lucide-react';
import type { ModulProps, StoreActions } from '../lib/store';
import type { AppData } from '../lib/types';
import {
  BENIH_ACAK_ATRIBUSI,
  distribusiAcakOperator,
  FILTER_ANALYTICS_KOSONG,
  hitungTotalKontrol,
  nilaiKontrakPerBulan,
  opsiFilterAnalytics,
  penyetoranPerBulan,
  periodeRankingTersedia,
  rankingOperator,
  rankingSatker,
  ringkasanDistribusi,
  ringkasanAnalytics,
  ringkasanPeriodeRanking,
  sisaTagihan,
  statusTagihan,
  totalPerKodeAkun,
  type BarisAnalytics,
  type BarisRanking,
  type FilterAnalytics,
  type ModePeriodeRanking,
  type RingkasanOperator,
  type TitikBulanan,
} from '../lib/derive';
import {
  formatAngka,
  formatBulanSingkat,
  formatPeriode,
  formatRupiah,
  formatRupiahSingkat,
  formatTanggal,
  hariIniIso,
  selisihHari,
} from '../lib/format';
import { OPERATOR_PALEMBANG, uraianKodeAkun } from '../lib/master';
import {
  labelAksiAudit,
  labelEntitasAudit,
  labelJenisDokumen,
  labelKategoriLayanan,
  labelTahapPengajuan,
  labelUraianKodeAkun,
} from '../lib/labels';

import { formatWaktuAudit } from '../lib/audit';
import {
  Baris,
  ItemDaftar,
  JudulBagian,
  Kartu,
  PesanKosong,
  StatCard,
  StatusBadge,
  Tabel,
  Td,
  Th,
} from '../components/ui';

/** Tanggal ISO (yyyy-mm-dd) untuk hari tertentu di bulan berikutnya. */
function tanggalBulanBerikutnya(hari: number): string {
  const now = new Date();
  const tahun =
    now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
  const bulan = now.getMonth() === 11 ? 1 : now.getMonth() + 2;
  return `${tahun}-${String(bulan).padStart(2, '0')}-${String(hari).padStart(2, '0')}`;
}

function labelSisaHari(jumlahHari: number): string {
  if (jumlahHari < 0) return 'lewat tenggat';
  if (jumlahHari === 0) return 'hari ini';
  if (jumlahHari === 1) return '1 hari lagi';
  return `${jumlahHari} hari lagi`;
}

/**
 * Kartu grafik tren bulanan pola DashStack ("Sales Details"): grafik garis
 * + area SVG murni (tanpa dependensi baru), pemilih seri Nilai kontrak /
 * Penyetoran. Sumbu memakai label bulan singkat; nilai lengkap terlihat
 * saat kursor di atas titik. Hanya 3 warna RRI.
 */
function GrafikTren({
  kontrak,
  penyetoran,
}: {
  kontrak: TitikBulanan[];
  penyetoran: TitikBulanan[];
}) {
  const [seri, setSeri] = useState<'kontrak' | 'penyetoran'>('kontrak');
  // Sumbu memakai bulan seri yang aktif saja — sebelumnya memakai gabungan
  // kedua seri sehingga muncul titik nol palsu (kontrak Jul 2025 = Rp0,
  // penyetoran Okt 2026 = Rp0) yang terbaca seperti anjlok.
  const aktif = seri === 'kontrak' ? kontrak : penyetoran;
  const periode = aktif.map((t) => t.periode);
  const nilai = aktif.map((t) => t.nilai);
  const total = nilai.reduce((a, b) => a + b, 0);
  const maks = Math.max(...nilai, 1);
  const idxTertinggi = nilai.indexOf(Math.max(...nilai));

  const W = 720;
  const H = 240;
  const PL = 64;
  const PR = 16;
  const PT = 16;
  const PB = 28;
  const x = (i: number) =>
    PL + (i * (W - PL - PR)) / Math.max(periode.length - 1, 1);
  const y = (v: number) => PT + (1 - v / maks) * (H - PT - PB);
  const garis = nilai.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const area = `${PL},${H - PB} ${garis} ${x(periode.length - 1)},${H - PB}`;

  const tombol = (id: 'kontrak' | 'penyetoran', teks: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setSeri(id)}
      className={
        seri === id
          ? 'rounded-md bg-[#2573e2] px-3 py-1 text-xs font-semibold text-white'
          : 'rounded-md border border-[#2573e2]/30 bg-white px-3 py-1 text-xs font-semibold text-[#0d2569]'
      }
    >
      {teks}
    </button>
  );

  return (
    <Kartu>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <JudulBagian>Tren bulanan</JudulBagian>
          <p className="mt-1 text-xs text-[#0d2569]/60">
            {periode.length > 0
              ? `${formatPeriode(periode[0])} – ${formatPeriode(periode[periode.length - 1])}`
              : 'Belum ada data'}{' '}
            · Total {formatRupiah(total)}
            {idxTertinggi >= 0 && nilai[idxTertinggi] > 0 && (
              <>
                {' · '}Tertinggi {formatPeriode(periode[idxTertinggi])}{' '}
                {formatRupiah(nilai[idxTertinggi])}
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {tombol('kontrak', 'Nilai kontrak')}
          {tombol('penyetoran', 'Penyetoran')}
        </div>
      </div>
      {periode.length === 0 ? (
        <div className="mt-3">
          <PesanKosong teks="Belum ada tagihan atau penyetoran." />
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mt-4 w-full"
          role="img"
          aria-label={`Grafik tren bulanan, ${seri === 'kontrak' ? 'nilai kontrak' : 'penyetoran'}`}
        >
          {[0, 0.5, 1].map((f) => (
            <g key={f}>
              <line
                x1={PL}
                x2={W - PR}
                y1={y(maks * f)}
                y2={y(maks * f)}
                stroke="#2573e2"
                strokeOpacity={0.12}
              />
              <text
                x={PL - 8}
                y={y(maks * f) + 4}
                textAnchor="end"
                fontSize={11}
                fill="#0d2569"
                fillOpacity={0.6}
              >
                {formatRupiahSingkat(maks * f)}
              </text>
            </g>
          ))}
          <polygon points={area} fill="#2573e2" fillOpacity={0.08} />
          <polyline
            points={garis}
            fill="none"
            stroke="#2573e2"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {nilai.map((v, i) => (
            <g key={periode[i]}>
              <circle
                cx={x(i)}
                cy={y(v)}
                r={4}
                fill="#ffffff"
                stroke="#2573e2"
                strokeWidth={2}
              >
                <title>
                  {formatPeriode(periode[i])}: {formatRupiah(v)}
                </title>
              </circle>
              <text
                x={x(i)}
                y={H - 8}
                textAnchor="middle"
                fontSize={11}
                fill="#0d2569"
                fillOpacity={0.6}
              >
                {formatBulanSingkat(periode[i])}
              </text>
            </g>
          ))}
        </svg>
      )}
      <p className="mt-2 text-xs text-[#0d2569]/60">
        Nilai kontrak memakai bulan terbit tagihan (bulan PKS diterbitkan); penyetoran memakai tanggal bayar (arus kas), sama seperti rekonsiliasi laporan.
      </p>
    </Kartu>
  );
}

/**
 * Analytics Dashboard + Cross-Filtering (template Figma "Analytics Dashboard
 * with Cross-Filtering" — pola panel filter, kartu KPI, dan perilaku
 * cross-filtering saja; semua angka dari data nyata lewat ringkasanAnalytics).
 * Filter Kategori / Region / Time Period; klik segmen donat, batang satker,
 * atau batang tahun ikut mengatur filter yang sama. Semua KPI dan grafik
 * mengikuti filter aktif, sehingga totalnya selalu cocok.
 */

// Warna segmen donat per kategori (PRD v2.2: warna tambahan diizinkan bila
// memang dibutuhkan — segmen donat harus bisa dibedakan satu sama lain;
// selain itu hanya warna dasar RRI yang dipakai).
const WARNA_KATEGORI: Record<string, string> = {
  'Jasa Penyiaran': '#2573E2',
  'Jasa Penggunaan Sarana dan Prasarana Siaran': '#0D2569',
  'Jasa Digitalisasi Penyiaran': '#2E9E6B',
};
const WARNA_KATEGORI_LAIN = ['#D97706', '#7C3AED', '#0891B2'];

function warnaKategori(nama: string, indeks: number): string {
  return (
    WARNA_KATEGORI[nama] ??
    WARNA_KATEGORI_LAIN[indeks % WARNA_KATEGORI_LAIN.length]
  );
}

function labelPeriodeAnalytics(periode: string): string {
  if (periode === '') return 'Sepanjang waktu';
  if (periode.length === 4) return `Tahun ${periode}`;
  return formatPeriode(periode);
}

function DonatKategori({
  baris,
  aktif,
  onPilih,
}: {
  baris: BarisAnalytics[];
  aktif: string;
  onPilih: (label: string) => void;
}) {
  const total = baris.reduce((s, b) => s + b.nilai, 0);
  const R = 70;
  const C = 2 * Math.PI * R;
  let berjalan = 0;
  const segmen = baris.map((b, i) => {
    const fraksi = total > 0 ? b.nilai / total : 0;
    const seg = {
      ...b,
      warna: warnaKategori(b.label, i),
      panjang: fraksi * C,
      mulai: berjalan,
      persen: fraksi * 100,
    };
    berjalan += fraksi * C;
    return seg;
  });
  return (
    <div className="flex flex-wrap items-center gap-4">
      <svg
        viewBox="0 0 180 180"
        className="h-44 w-44 shrink-0"
        role="img"
        aria-label="Nilai kontrak per kategori layanan"
      >
        <circle
          cx="90"
          cy="90"
          r={R}
          fill="none"
          stroke="#2573e2"
          strokeOpacity={0.08}
          strokeWidth={28}
        />
        {segmen.map((s) => (
          <circle
            key={s.label}
            cx="90"
            cy="90"
            r={R}
            fill="none"
            stroke={s.warna}
            strokeWidth={28}
            strokeDasharray={`${s.panjang} ${C - s.panjang}`}
            strokeDashoffset={-s.mulai}
            transform="rotate(-90 90 90)"
            opacity={aktif === '' || aktif === s.label ? 1 : 0.35}
            className="cursor-pointer"
            onClick={() => onPilih(s.label)}
          >
            <title>{`${labelKategoriLayanan(s.label)}: ${formatRupiah(s.nilai)} (${s.persen.toFixed(1)}%), klik untuk menyaring`}</title>
          </circle>
        ))}
        <text
          x="90"
          y="88"
          textAnchor="middle"
          fontSize={16}
          fontWeight={700}
          fill="#0d2569"
        >
          {formatRupiahSingkat(total)}
        </text>
        <text
          x="90"
          y="106"
          textAnchor="middle"
          fontSize={11}
          fill="#0d2569"
          fillOpacity={0.6}
        >
          Total
        </text>
      </svg>
      <ul className="min-w-56 flex-1 space-y-2">
        {segmen.map((s) => (
          <li key={s.label}>
            <button
              type="button"
              onClick={() => onPilih(s.label)}
              aria-pressed={aktif === s.label}
              className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm ${
                aktif === s.label
                  ? 'border-[#2573e2] bg-[#2573e2]/5 font-semibold text-[#0d2569]'
                  : 'border-[#2573e2]/15 bg-white text-[#0d2569]'
              }`}
            >
              <span
                className="h-3 w-3 shrink-0 rounded-sm"
                style={{ background: s.warna }}
              />
              <span className="flex-1">
                {labelKategoriLayanan(s.label)}
              </span>
              <span className="text-[#0d2569]/60">
                {s.persen.toFixed(1)}%
              </span>
              <span className="font-semibold">{formatRupiah(s.nilai)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GrafikBatang({
  baris,
  aktif,
  onPilih,
  sumbu,
}: {
  baris: BarisAnalytics[];
  aktif?: string;
  onPilih?: (label: string) => void;
  sumbu: (b: BarisAnalytics) => string;
}) {
  const W = 720;
  const H = 240;
  const PL = 64;
  const PR = 16;
  const PT = 24;
  const PB = 28;
  const maks = Math.max(...baris.map((b) => b.nilai), 1);
  const lebar = baris.length > 0 ? (W - PL - PR) / baris.length : 0;
  const y = (v: number) => PT + (1 - v / maks) * (H - PT - PB);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-4 w-full"
      role="img"
      aria-label="Grafik batang"
    >
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line
            x1={PL}
            x2={W - PR}
            y1={y(maks * f)}
            y2={y(maks * f)}
            stroke="#2573e2"
            strokeOpacity={0.12}
          />
          <text
            x={PL - 8}
            y={y(maks * f) + 4}
            textAnchor="end"
            fontSize={11}
            fill="#0d2569"
            fillOpacity={0.6}
          >
            {formatRupiahSingkat(maks * f)}
          </text>
        </g>
      ))}
      {baris.map((b, i) => {
        const bw = Math.min(72, lebar * 0.55);
        const bx = PL + i * lebar + (lebar - bw) / 2;
        const kunci = b.kode ?? b.label;
        const aktifIni = aktif !== undefined && aktif === kunci;
        return (
          <g key={b.label}>
            <rect
              x={bx}
              y={y(b.nilai)}
              width={bw}
              height={Math.max(H - PB - y(b.nilai), 0)}
              rx={4}
              fill={aktifIni ? '#0D2569' : '#2573E2'}
              fillOpacity={
                onPilih && aktif !== undefined && aktif !== '' && !aktifIni
                  ? 0.35
                  : 1
              }
              className={onPilih ? 'cursor-pointer' : undefined}
              onClick={onPilih ? () => onPilih(kunci) : undefined}
            >
              <title>{`${sumbu(b)}: ${formatRupiah(b.nilai)} (${formatAngka(b.jumlah)} kontrak)${onPilih ? ', klik untuk menyaring' : ''}`}</title>
            </rect>
            <text
              x={bx + bw / 2}
              y={y(b.nilai) - 6}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              fill="#0d2569"
            >
              {formatRupiahSingkat(b.nilai)}
            </text>
            <text
              x={bx + bw / 2}
              y={H - 8}
              textAnchor="middle"
              fontSize={11}
              fill="#0d2569"
              fillOpacity={0.6}
            >
              {sumbu(b)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function GrafikTrenAnalytics({ titik }: { titik: TitikBulanan[] }) {
  const periode = titik.map((t) => t.periode);
  const nilai = titik.map((t) => t.nilai);
  const total = nilai.reduce((a, b) => a + b, 0);
  const maks = Math.max(...nilai, 1);
  const idxTertinggi = nilai.indexOf(Math.max(...nilai));
  const W = 720;
  const H = 240;
  const PL = 64;
  const PR = 16;
  const PT = 16;
  const PB = 28;
  const x = (i: number) =>
    PL + (i * (W - PL - PR)) / Math.max(periode.length - 1, 1);
  const y = (v: number) => PT + (1 - v / maks) * (H - PT - PB);
  const garis = nilai.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const area = `${PL},${H - PB} ${garis} ${x(periode.length - 1)},${H - PB}`;
  return (
    <>
      <p className="mt-1 text-xs text-[#0d2569]/60">
        {periode.length > 0
          ? `${formatPeriode(periode[0])} – ${formatPeriode(periode[periode.length - 1])}`
          : 'Belum ada data'}{' '}
        · Total {formatRupiah(total)}
        {idxTertinggi >= 0 && nilai[idxTertinggi] > 0 && (
          <>
            {' · '}Tertinggi {formatPeriode(periode[idxTertinggi])}{' '}
            {formatRupiah(nilai[idxTertinggi])}
          </>
        )}
      </p>
      {periode.length === 0 ? (
        <div className="mt-3">
          <PesanKosong teks="Tidak ada nilai kontrak pada filter yang dipilih." />
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mt-4 w-full"
          role="img"
          aria-label="Tren bulanan nilai kontrak yang difilter"
        >
          {[0, 0.5, 1].map((f) => (
            <g key={f}>
              <line
                x1={PL}
                x2={W - PR}
                y1={y(maks * f)}
                y2={y(maks * f)}
                stroke="#2573e2"
                strokeOpacity={0.12}
              />
              <text
                x={PL - 8}
                y={y(maks * f) + 4}
                textAnchor="end"
                fontSize={11}
                fill="#0d2569"
                fillOpacity={0.6}
              >
                {formatRupiahSingkat(maks * f)}
              </text>
            </g>
          ))}
          <polygon points={area} fill="#2573e2" fillOpacity={0.08} />
          <polyline
            points={garis}
            fill="none"
            stroke="#2573e2"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {nilai.map((v, i) => (
            <g key={periode[i]}>
              <circle
                cx={x(i)}
                cy={y(v)}
                r={4}
                fill="#ffffff"
                stroke="#2573e2"
                strokeWidth={2}
              >
                <title>
                  {formatPeriode(periode[i])}: {formatRupiah(v)}
                </title>
              </circle>
              <text
                x={x(i)}
                y={H - 8}
                textAnchor="middle"
                fontSize={11}
                fill="#0d2569"
                fillOpacity={0.6}
              >
                {formatBulanSingkat(periode[i])}
              </text>
            </g>
          ))}
        </svg>
      )}
      <p className="mt-2 text-xs text-[#0d2569]/60">
        Nilai kontrak memakai bulan terbit tagihan, sama seperti rekonsiliasi laporan.
      </p>
    </>
  );
}

function KartuAnalytics({ data }: { data: AppData }) {
  const opsi = useMemo(() => opsiFilterAnalytics(data), [data.kontrak]);
  const [filter, setFilter] = useState<FilterAnalytics>(
    FILTER_ANALYTICS_KOSONG,
  );
  const ringkasan = useMemo(
    () => ringkasanAnalytics(data, filter),
    [data, filter],
  );
  const ubahFilter = (patch: Partial<FilterAnalytics>) =>
    setFilter((f) => ({ ...f, ...patch }));
  const bersihkanFilter = (kunci: keyof FilterAnalytics) => {
    if (kunci === 'kategori') setFilter((f) => ({ ...f, kategori: '' }));
    else if (kunci === 'satker') setFilter((f) => ({ ...f, satker: '' }));
    else setFilter((f) => ({ ...f, periode: '' }));
  };
  const alihkanKategori = (label: string) =>
    setFilter((f) => ({ ...f, kategori: f.kategori === label ? '' : label }));
  const alihkanSatker = (kode: string) =>
    setFilter((f) => ({ ...f, satker: f.satker === kode ? '' : kode }));
  const alihkanTahun = (tahun: string) =>
    setFilter((f) => ({ ...f, periode: f.periode === tahun ? '' : tahun }));
  const filterAktif = (
    [
      filter.kategori !== ''
        ? {
            kunci: 'kategori' as const,
            label: `Kategori: ${labelKategoriLayanan(filter.kategori)}`,
          }
        : null,
      filter.satker !== ''
        ? {
            kunci: 'satker' as const,
            label: `Wilayah: ${opsi.satker.find((s) => s.kode === filter.satker)?.nama ?? filter.satker}`,
          }
        : null,
      filter.periode !== ''
        ? {
            kunci: 'periode' as const,
            label: `Periode: ${labelPeriodeAnalytics(filter.periode)}`,
          }
        : null,
    ] as ({ kunci: keyof FilterAnalytics; label: string } | null)[]
  ).filter(
    (x): x is { kunci: keyof FilterAnalytics; label: string } => x !== null,
  );
  const persen = (bagian: number, total: number) =>
    total > 0 ? `${((bagian / total) * 100).toFixed(1)}%` : '—';
  return (
    <Kartu>
      <div>
        <JudulBagian>Analitik penyaringan silang</JudulBagian>
        <p className="mt-1 text-xs text-[#0d2569]/60">
          Saring berdasarkan kategori, satuan kerja, dan periode. Setiap KPI dan grafik di kartu ini mengikuti filter yang aktif. Klik segmen donat atau batang untuk menyaring.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-xs font-semibold text-[#0d2569]/70">
          Kategori
          <select
            value={filter.kategori}
            onChange={(e) => ubahFilter({ kategori: e.target.value })}
            aria-label="Saring berdasarkan kategori"
            className="rounded-md border border-[#2573e2]/30 bg-white px-2 py-1 text-xs font-semibold text-[#0d2569]"
          >
            <option value="">Semua kategori</option>
            {opsi.kategori.map((k) => (
              <option key={k} value={k}>
                {labelKategoriLayanan(k)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-[#0d2569]/70">
          Wilayah
          <select
            value={filter.satker}
            onChange={(e) => ubahFilter({ satker: e.target.value })}
            aria-label="Saring berdasarkan satuan kerja"
            className="rounded-md border border-[#2573e2]/30 bg-white px-2 py-1 text-xs font-semibold text-[#0d2569]"
          >
            <option value="">Semua satuan kerja</option>
            {opsi.satker.map((s) => (
              <option key={s.kode} value={s.kode}>
                {s.nama}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-[#0d2569]/70">
          Periode
          <select
            value={filter.periode}
            onChange={(e) => ubahFilter({ periode: e.target.value })}
            aria-label="Saring berdasarkan periode"
            className="rounded-md border border-[#2573e2]/30 bg-white px-2 py-1 text-xs font-semibold text-[#0d2569]"
          >
            <option value="">Sepanjang waktu</option>
            {opsi.periode.map((p) => (
              <option key={p} value={p}>
                {labelPeriodeAnalytics(p)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {filterAktif.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-[#0d2569]/70">
            Pilihan aktif:
          </span>
          {filterAktif.map((f) => (
            <button
              key={f.kunci}
              type="button"
              onClick={() => bersihkanFilter(f.kunci)}
              aria-label={`Hapus ${f.label}`}
              className="rounded-full border border-[#2573e2]/30 bg-[#2573e2]/5 px-2 py-1 font-semibold text-[#0d2569]"
            >
              {f.label} ×
            </button>
          ))}
          <button
            type="button"
            onClick={() => setFilter(FILTER_ANALYTICS_KOSONG)}
            className="rounded-full bg-[#2573e2] px-2 py-1 font-semibold text-white"
          >
            Hapus semua
          </button>
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Nilai kontrak"
          nilai={formatRupiah(ringkasan.nilaiKontrak)}
          keterangan={`${formatAngka(ringkasan.jumlahKontrak)} kontrak · ${formatAngka(ringkasan.jumlahKlien)} klien`}
          ikon={<Handshake size={20} />}
        />
        <StatCard
          label="Pembayaran terverifikasi"
          nilai={formatRupiah(ringkasan.pembayaranTerverifikasi)}
          keterangan={`${persen(ringkasan.pembayaranTerverifikasi, ringkasan.nilaiKontrak)} dari nilai kontrak`}
          ikon={<CheckCircle2 size={20} />}
        />
        <StatCard
          label="Piutang"
          nilai={formatRupiah(ringkasan.sisaPiutang)}
          keterangan={`${persen(ringkasan.sisaPiutang, ringkasan.nilaiKontrak)} dari nilai kontrak`}
          ikon={<Clock size={20} />}
        />
        <StatCard
          label="Kontrak"
          nilai={formatAngka(ringkasan.jumlahKontrak)}
          keterangan={`${formatAngka(ringkasan.jumlahKlien)} klien`}
          ikon={<FileText size={20} />}
        />
      </div>
      {ringkasan.jumlahKontrak === 0 ? (
        <div className="mt-4">
          <PesanKosong teks="Tidak ada kontrak yang cocok dengan filter aktif." />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-[#2573e2]/15 p-4">
            <JudulBagian>Tren nilai kontrak</JudulBagian>
            <GrafikTrenAnalytics titik={ringkasan.perBulan} />
          </div>
          <div className="rounded-lg border border-[#2573e2]/15 p-4">
            <JudulBagian>Nilai kontrak per kategori</JudulBagian>
            <p className="mt-1 text-xs text-[#0d2569]/60">
              Klik segmen atau baris legenda untuk menyaring berdasarkan kategori itu; klik lagi untuk menghapus filter.
            </p>
            <div className="mt-3">
              <DonatKategori
                baris={ringkasan.perKategori}
                aktif={filter.kategori}
                onPilih={alihkanKategori}
              />
            </div>
          </div>
          <div className="rounded-lg border border-[#2573e2]/15 p-4">
            <JudulBagian>Nilai kontrak per satuan kerja</JudulBagian>
            <p className="mt-1 text-xs text-[#0d2569]/60">
              Hanya satuan kerja yang punya data yang ditampilkan. Klik batang untuk menyaring berdasarkan satuan kerja itu.
            </p>
            <GrafikBatang
              baris={ringkasan.perSatker}
              aktif={filter.satker}
              onPilih={alihkanSatker}
              sumbu={(b) => b.label}
            />
          </div>
          <div className="rounded-lg border border-[#2573e2]/15 p-4">
            <JudulBagian>Nilai kontrak per tahun</JudulBagian>
            <p className="mt-1 text-xs text-[#0d2569]/60">
              Klik batang untuk menyaring berdasarkan tahun itu.
            </p>
            <GrafikBatang
              baris={ringkasan.perTahun.map((t) => ({
                label: t.tahun,
                nilai: t.nilai,
                jumlah: t.jumlah,
              }))}
              aktif={filter.periode}
              onPilih={alihkanTahun}
              sumbu={(b) => b.label}
            />
          </div>
        </div>
      )}
      <p className="mt-4 text-xs text-[#0d2569]/60">
        Setiap angka di kartu ini dihitung dari kontrak yang sama setelah difilter, jadi KPI dan keempat grafik selalu cocok. Periode mengikuti tanggal kontrak ditandatangani (atau tanggal mulai bila tanggal tanda tangan kosong), sama seperti Peringkat karyawan; tren bulanan memakai bulan terbit tagihan, sama seperti laporan bulanan.
      </p>
    </Kartu>
  );
}

/**
 * Ranking Fase C (Q-09, Q-11): Peringkat karyawan dan peringkat satker, papan
 * peringkat tahunan dan bulanan, toggle Tahun/Bulan. Metrik keduanya
 * Σ nilaiKontrak; periode dari tanggal tanda tangan kontrak (fallback
 * tanggalMulai bila belum diisi — lihat derive.ts). Satker Rank sekaligus
 * Revenue Analytics nasional per satker pada periode yang sama.
 * Hanya 3 warna RRI.
 */
function TabelRanking({
  judul,
  baris,
  teksKosong,
}: {
  judul: string;
  baris: BarisRanking[];
  teksKosong: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[#0d2569]">{judul}</h3>
      {baris.length === 0 ? (
        <div className="mt-3">
          <PesanKosong teks={teksKosong} />
        </div>
      ) : (
        <div className="mt-3">
          <Tabel>
            <thead>
              <tr>
                <Th>#</Th>
                <Th>Nama</Th>
                <Th kanan>Kontrak</Th>
                <Th kanan>Nilai kontrak</Th>
              </tr>
            </thead>
            <tbody>
              {baris.map((r, i) => (
                <Baris key={r.label}>
                  <Td>{formatAngka(i + 1)}</Td>
                  <Td tebal>
                    {r.label}
                    {r.sub ? ` (${r.sub})` : ''}
                  </Td>
                  <Td kanan>{formatAngka(r.jumlahKontrak)}</Td>
                  <Td kanan tebal>{formatRupiah(r.nilai)}</Td>
                </Baris>
              ))}
            </tbody>
          </Tabel>
        </div>
      )}
    </div>
  );
}

function KartuRanking({ data, actions }: { data: AppData; actions: StoreActions }) {
  const [mode, setMode] = useState<ModePeriodeRanking>('tahun');
  const tahunTersedia = periodeRankingTersedia(data, 'tahun');
  const bulanTersedia = periodeRankingTersedia(data, 'bulan');
  const [tahunDipilih, setTahunDipilih] = useState('');
  const [bulanDipilih, setBulanDipilih] = useState('');
  // Bila pilihan tersimpan belum ada di data (mis. data baru dimuat dari
  // Firestore setelah render pertama), pakai periode terbaru yang ada.
  const tahun =
    tahunDipilih !== '' && tahunTersedia.includes(tahunDipilih)
      ? tahunDipilih
      : (tahunTersedia[0] ?? hariIniIso().slice(0, 4));
  const bulan =
    bulanDipilih !== '' && bulanTersedia.includes(bulanDipilih)
      ? bulanDipilih
      : (bulanTersedia[0] ?? hariIniIso().slice(0, 7));
  const periode = mode === 'tahun' ? tahun : bulan;
  const labelPeriode =
    mode === 'tahun' ? `Tahun ${periode}` : formatPeriode(periode);
  const employee = rankingOperator(data, mode, periode);
  const satker = rankingSatker(data, mode, periode);
  const ringkasan = ringkasanPeriodeRanking(data, mode, periode);

  // Atribusi massal acak (keputusan pengguna 2026-11-15): pratinjau
  // memakai fungsi deterministik yang sama dengan aksi terapkannya,
  // sehingga angka pratinjau sama persis dengan hasil penerapan.
  const tanpaOperator = data.kontrak.filter((k) => !k.operatorPenutup);
  const pratinjau = useMemo(
    () =>
      tanpaOperator.length === 0
        ? []
        : ringkasanDistribusi(
            tanpaOperator,
            distribusiAcakOperator(
              tanpaOperator,
              OPERATOR_PALEMBANG,
              BENIH_ACAK_ATRIBUSI,
            ),
          ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.kontrak],
  );
  const [hasilAtribusi, setHasilAtribusi] = useState<{
    diterapkan: number;
    perOperator: RingkasanOperator[];
  } | null>(null);

  const tombolMode = (id: ModePeriodeRanking, teks: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setMode(id)}
      className={
        mode === id
          ? 'rounded-md bg-[#2573e2] px-3 py-1 text-xs font-semibold text-white'
          : 'rounded-md border border-[#2573e2]/30 bg-white px-3 py-1 text-xs font-semibold text-[#0d2569]'
      }
    >
      {teks}
    </button>
  );

  return (
    <Kartu>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-[#2573e2]" />
          <div>
            <JudulBagian>Peringkat karyawan dan satker</JudulBagian>
            <p className="mt-1 text-xs text-[#0d2569]/60">
              Papan peringkat {mode === 'tahun' ? 'tahun ini' : 'bulan ini'} ·{' '}
              {labelPeriode} · Metrik: nilai kontrak yang ditutup
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tombolMode('tahun', 'Tahun')}
          {tombolMode('bulan', 'Bulan')}
          {mode === 'tahun' ? (
            <select
              value={tahun}
              onChange={(e) => setTahunDipilih(e.target.value)}
              aria-label="Pilih tahun"
              className="rounded-md border border-[#2573e2]/30 bg-white px-2 py-1 text-xs font-semibold text-[#0d2569]"
            >
              {tahunTersedia.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={bulan}
              onChange={(e) => setBulanDipilih(e.target.value)}
              aria-label="Pilih bulan"
              className="rounded-md border border-[#2573e2]/30 bg-white px-2 py-1 text-xs font-semibold text-[#0d2569]"
            >
              {bulanTersedia.map((b) => (
                <option key={b} value={b}>
                  {formatPeriode(b)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <TabelRanking
          judul="Peringkat karyawan: nilai kontrak per penanggung jawab"
          baris={employee}
          teksKosong={`Tidak ada kontrak yang ditutup pada ${labelPeriode}.`}
        />
        <TabelRanking
          judul="Peringkat satker: analitik pendapatan nasional per satker"
          baris={satker}
          teksKosong={`Tidak ada kontrak yang ditutup pada ${labelPeriode}.`}
        />
      </div>
      <p className="mt-4 text-xs text-[#0d2569]/60">
        Periode dihitung dari tanggal kontrak ditandatangani; bila tanggal tanda tangan belum diisi, tanggal mulai kontrak dipakai
        {ringkasan.jumlahKontrak > 0 &&
          ` Pada ${labelPeriode}, ${formatAngka(ringkasan.jumlahFallback)} dari ${formatAngka(ringkasan.jumlahKontrak)} kontrak memakai tanggal mulai.`}
      </p>
      <p className="mt-1 text-xs text-[#0d2569]/60">
        Peringkat karyawan hanya menghitung kontrak yang sudah punya operator penutup (staf Layanan yang menutup kontrak)
        {ringkasan.jumlahTanpaOperator > 0 &&
          ` Pada ${labelPeriode}, ${formatAngka(ringkasan.jumlahTanpaOperator)} dari ${formatAngka(ringkasan.jumlahKontrak)} kontrak belum punya operator penutup; tetapkan di detail kontrak (Deals → Kontrak).`}
      </p>
      {(tanpaOperator.length > 0 || hasilAtribusi) && (
        <div className="mt-4 rounded-lg border border-[#2573e2]/30 bg-[#2573e2]/5 p-4">
          <h3 className="text-sm font-bold text-[#0d2569]">
            Atribusi massal (acak)
          </h3>
          {hasilAtribusi ? (
            <p className="mt-2 text-sm text-[#0d2569]">
              Diterapkan ke {formatAngka(hasilAtribusi.diterapkan)} kontrak:{' '}
              {hasilAtribusi.perOperator
                .map(
                  (p) =>
                    `${p.operator}: ${formatAngka(p.jumlah)} kontrak (${formatRupiah(p.nilai)})`,
                )
                .join('; ')}
              .
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-[#0d2569]/80">
                Bagikan {OPERATOR_PALEMBANG.length} operator Palembang secara acak ke {formatAngka(tanpaOperator.length)} kontrak yang belum punya operator penutup. Pembagiannya merata (selisih paling banyak 1 kontrak per operator); tanggal tanda tangan diisi tanggal mulai bila masih kosong. Kontrak yang sudah punya operator tidak diubah. Pembagian ini acak sesuai instruksi. Peringkat mencerminkan pembagian acak ini, bukan kinerja penutupan yang sebenarnya.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-[#0d2569]">
                {pratinjau.map((p) => (
                  <li key={p.operator} className="flex justify-between gap-4">
                    <span>{p.operator}</span>
                    <span className="font-semibold">
                      {formatAngka(p.jumlah)} kontrak · {formatRupiah(p.nilai)}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  const hasil = actions.terapkanAtribusiAcak();
                  if (hasil) setHasilAtribusi(hasil);
                }}
                className="mt-4 rounded-lg bg-[#2573e2] px-4 py-2 text-sm font-bold text-white hover:bg-[#0d2569]"
              >
                Terapkan pembagian acak
              </button>
            </>
          )}
        </div>
      )}
      <p className="mt-1 text-xs text-[#0d2569]/60">
        Peringkat nasional hanya mencakup satker yang datanya ada di aplikasi (saat ini PALEMBANG); satker tanpa data tidak ditampilkan.
      </p>
    </Kartu>
  );
}

export default function Dashboard({ data, actions }: ModulProps) {
  const total = hitungTotalKontrol(data);
  const hariIni = hariIniIso();
  const perKodeAkun = totalPerKodeAkun(data);

  // (b) Deadline laporan kantor pusat: isi tgl 10, kumpul file tgl 11.
  const batasIsi = tanggalBulanBerikutnya(10);
  const batasKumpul = tanggalBulanBerikutnya(11);
  const sisaIsi = selisihHari(hariIni, batasIsi);
  const sisaKumpul = selisihHari(hariIni, batasKumpul);

  // (c) Perlu perhatian — dikumpulkan dari data.
  interface Perhatian {
    kategori: string;
    teks: string;
    detail: string;
  }
  const perhatian: Perhatian[] = [];

  data.tagihan
    .filter((t) => statusTagihan(t, data.pembayaran) === 'Lewat Jatuh Tempo')
    .forEach((t) => {
      perhatian.push({
        kategori: 'Tagihan lewat jatuh tempo',
        teks: `${t.nomor} — ${t.uraian}`,
        detail: `Jatuh tempo ${formatTanggal(t.tanggalJatuhTempo)} · Sisa ${formatRupiah(sisaTagihan(t, data.pembayaran))}`,
      });
    });

  data.dokumen
    .filter((d) => d.status === 'Belum Ada')
    .forEach((d) => {
      perhatian.push({
        kategori: 'Dokumen belum ada',
        teks: `${labelJenisDokumen(d.jenisDokumen)} — ${d.kontrakId}`,
        detail: d.catatan ?? 'Dokumen kontrak belum diunggah.',
      });
    });

  data.pengajuan
    .filter((p) => ['Masuk', 'Ditelaah', 'Menunggu Dokumen'].includes(p.tahap))
    .forEach((p) => {
      perhatian.push({
        kategori: 'Pengajuan perlu ditindaklanjuti',
        teks: `${p.id} — ${p.pemohon}`,
        detail: `Tahap: ${labelTahapPengajuan(p.tahap)} · Diterima ${formatTanggal(p.tanggalMasuk)}`,
      });
    });

  data.sewa
    .filter((s) => {
      const sisa = selisihHari(hariIni, s.tanggalSelesai);
      return s.status === 'ON GOING' && sisa >= 0 && sisa <= 60;
    })
    .forEach((s) => {
      const sisa = selisihHari(hariIni, s.tanggalSelesai);
      perhatian.push({
        kategori: 'Sewa segera berakhir',
        teks: `${s.aset} — ${s.penyewaNama}`,
        detail: `Berakhir ${formatTanggal(s.tanggalSelesai)} (${sisa} hari lagi)`,
      });
    });

  // Selisih rekonsiliasi hanya bermakna bila data acuan Keuangan ada.
  // Bila penerimaanAcuan kosong (Sheet 3 belum diimpor), selisih = 0 −
  // pembayaran terverifikasi dan BUKAN selisih yang sebenarnya.
  if (data.penerimaanAcuan.length > 0 && total.selisihRekonsiliasi !== 0) {
    perhatian.push({
      kategori: 'Selisih rekonsiliasi',
      teks: `Selisih ${formatRupiah(total.selisihRekonsiliasi)} antara penerimaan acuan Keuangan dan pembayaran terverifikasi`,
      detail: 'Penerimaan tanpa tagihan',
    });
  }

  const aktivitasTerakhir = [...data.audit]
    .sort((a, b) => (a.waktu < b.waktu ? 1 : a.waktu > b.waktu ? -1 : 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#0d2569]/70">
        Ringkasan periode: satker percontohan PALEMBANG. Semua angka dihitung dari data nyata yang diimpor dari spreadsheet (14/11/2026), sama seperti modul lain; data contoh Fase B tetap berlabel &quot;(Contoh)&quot;.
      </p>

      {/* (a) Kartu statistik — pola DashStack: label, angka besar, chip ikon,
          baris konteks faktual (bukan tren persen). */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          label="PKS aktif"
          nilai={formatAngka(total.jumlahPks)}
          keterangan={`dari ${formatAngka(data.kontrak.length)} kontrak`}
          ikon={<FileText size={20} />}
        />
        <StatCard
          label="Total nilai kontrak"
          nilai={formatRupiah(total.nilaiKontrak)}
          keterangan={`${formatAngka(data.kontrak.filter((k) => k.tanggalMulai.startsWith('2026')).length)} kontrak 2026 · ${formatAngka(data.kontrak.filter((k) => k.tanggalMulai.startsWith('2025')).length)} sisanya dari 2025`}
          ikon={<Handshake size={20} />}
        />
        <StatCard
          label="Pembayaran terverifikasi"
          nilai={formatRupiah(total.totalPembayaranTerverifikasi)}
          keterangan={
            data.pembayaran.every((p) => p.statusVerifikasi === 'Terverifikasi')
              ? `${formatAngka(data.pembayaran.length)} pembayaran · semua terverifikasi`
              : `${formatAngka(data.pembayaran.filter((p) => p.statusVerifikasi === 'Terverifikasi').length)} dari ${formatAngka(data.pembayaran.length)} pembayaran terverifikasi`
          }
          ikon={<CheckCircle2 size={20} />}
        />
        <StatCard
          label="Piutang"
          nilai={formatRupiah(total.sisaPiutang)}
          keterangan={`${formatAngka(data.tagihan.filter((t) => sisaTagihan(t, data.pembayaran) > 0).length)} tagihan bersisa`}
          ikon={<Clock size={20} />}
        />
        <StatCard
          label="Denda keterlambatan tercatat"
          nilai={formatRupiah(total.totalDenda)}
          keterangan={`${formatAngka(data.denda.length)} denda · kode akun 425839`}
          ikon={<Receipt size={20} />}
        />
      </div>

      {/* (a2) Grafik tren bulanan — pola DashStack "Sales Details". */}
      <GrafikTren
        kontrak={nilaiKontrakPerBulan(data)}
        penyetoran={penyetoranPerBulan(data)}
      />

      {/* (a2b) Analytics + Cross-Filtering (template Figma). */}
      <KartuAnalytics data={data} />

      {/* (a3) Ranking Fase C — Employee Rank & Satker Rank. */}
      <KartuRanking data={data} actions={actions} />

      {/* (b) Deadline laporan kantor pusat */}
      <Kartu>
        <JudulBagian>Tenggat laporan kantor pusat</JudulBagian>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-[#2573e2]/20 bg-[#2573e2]/5 p-4">
            <p className="text-xs font-semibold text-[#0d2569]/70">
              Tenggat pengisian laporan
            </p>
            <p className="mt-1 text-lg font-bold text-[#0d2569]">
              {formatTanggal(batasIsi)}
            </p>
            <p className="mt-1 text-sm text-[#0d2569]/70">
              {labelSisaHari(sisaIsi)}
            </p>
          </div>
          <div className="rounded-md border border-[#2573e2]/20 bg-[#2573e2]/5 p-4">
            <p className="text-xs font-semibold text-[#0d2569]/70">
              Tenggat pengumpulan berkas ke kantor pusat
            </p>
            <p className="mt-1 text-lg font-bold text-[#0d2569]">
              {formatTanggal(batasKumpul)}
            </p>
            <p className="mt-1 text-sm text-[#0d2569]/70">
              {labelSisaHari(sisaKumpul)}
            </p>
          </div>
        </div>
      </Kartu>

      {/* (c) Perlu perhatian */}
      <Kartu>
        <JudulBagian>Perlu perhatian</JudulBagian>
        {perhatian.length === 0 ? (
          <div className="mt-3">
            <PesanKosong teks="Tidak ada yang perlu diperhatikan saat ini." />
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {perhatian.map((item, i) => (
              <ItemDaftar key={`${item.kategori}-${i}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={item.kategori} />
                </div>
                <p className="mt-2 text-sm font-semibold text-[#0d2569]">
                  {item.teks}
                </p>
                <p className="mt-1 text-xs text-[#0d2569]/70">{item.detail}</p>
              </ItemDaftar>
            ))}
          </ul>
        )}
      </Kartu>

      {/* (d) Ringkasan per kode akun */}
      <Kartu>
        <JudulBagian>Ringkasan per kode akun</JudulBagian>
        {perKodeAkun.length === 0 ? (
          <div className="mt-3">
            <PesanKosong teks="Belum ada tagihan atau penerimaan acuan." />
          </div>
        ) : (
          <Tabel>
            <thead>
              <tr>
                <Th>Kode akun</Th>
                <Th>Uraian</Th>
                <Th kanan>Tagihan</Th>
                <Th kanan>Pembayaran</Th>
                <Th kanan>Acuan Keuangan</Th>
                <Th kanan>Selisih</Th>
              </tr>
            </thead>
            <tbody>
              {perKodeAkun.map((r) => (
                <Baris key={r.kodeAkun}>
                  <Td tebal>{r.kodeAkun}</Td>
                  <Td>{labelUraianKodeAkun(uraianKodeAkun(r.kodeAkun))}</Td>
                  <Td kanan>{formatRupiah(r.tagihan)}</Td>
                  <Td kanan>{formatRupiah(r.pembayaran)}</Td>
                  <Td kanan>{formatRupiah(r.acuan)}</Td>
                  <Td kanan tebal>{formatRupiah(r.selisih)}</Td>
                </Baris>
              ))}
            </tbody>
          </Tabel>
        )}
      </Kartu>

      {/* (e) Aktivitas terakhir */}
      <Kartu>
        <JudulBagian>Aktivitas terakhir</JudulBagian>
        {aktivitasTerakhir.length === 0 ? (
          <div className="mt-3">
            <PesanKosong teks="Belum ada aktivitas yang tercatat." />
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {aktivitasTerakhir.map((a) => (
              <ItemDaftar key={a.id} className="text-sm">
                <p className="font-semibold text-[#0d2569]">{labelAksiAudit(a.aksi)}</p>
                <p className="mt-0.5 text-xs text-[#0d2569]/70">
                  {formatWaktuAudit(a.waktu)} · {a.pengguna} · {labelEntitasAudit(a.entitas)}{' '}
                  {a.entitasId}
                </p>
              </ItemDaftar>
            ))}
          </ul>
        )}
      </Kartu>
    </div>
  );
}

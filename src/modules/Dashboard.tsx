// Dashboard — Fase A (PRD v2.0 Final Bab 4 & Bab 7.5).
// Semua angka dihitung dari data lewat derive.ts (satu sumber hitung),
// sehingga cocok dengan Revenue dan Reporting.
// Tampilan kartu statistik + grafik tren mengikuti pola DashStack
// (referensi Figma 14/11/2026) — hanya pola tata letak; palet tetap
// 3 warna RRI dan tren persen tidak dipakai (data hanya sampai Sep 2026).

import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  FileText,
  Handshake,
  Receipt,
  Trophy,
} from 'lucide-react';
import type { ModulProps } from '../lib/store';
import type { AppData } from '../lib/types';
import {
  hitungTotalKontrol,
  nilaiKontrakPerBulan,
  penyetoranPerBulan,
  periodeRankingTersedia,
  rankingOperator,
  rankingSatker,
  ringkasanPeriodeRanking,
  sisaTagihan,
  statusTagihan,
  totalPerKodeAkun,
  type BarisRanking,
  type ModePeriodeRanking,
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
import { uraianKodeAkun } from '../lib/master';
import {
  labelAksiAudit,
  labelEntitasAudit,
  labelJenisDokumen,
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
  if (jumlahHari < 0) return 'overdue';
  if (jumlahHari === 0) return 'today';
  if (jumlahHari === 1) return '1 more day';
  return `${jumlahHari} more days`;
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
          <JudulBagian>Monthly Trend</JudulBagian>
          <p className="mt-1 text-xs text-[#0d2569]/60">
            {periode.length > 0
              ? `${formatPeriode(periode[0])} – ${formatPeriode(periode[periode.length - 1])}`
              : 'No data yet'}{' '}
            · Total {formatRupiah(total)}
            {idxTertinggi >= 0 && nilai[idxTertinggi] > 0 && (
              <>
                {' · '}Highest {formatPeriode(periode[idxTertinggi])}{' '}
                {formatRupiah(nilai[idxTertinggi])}
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {tombol('kontrak', 'Contract value')}
          {tombol('penyetoran', 'Deposits')}
        </div>
      </div>
      {periode.length === 0 ? (
        <div className="mt-3">
          <PesanKosong teks="No invoices or deposits yet." />
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mt-4 w-full"
          role="img"
          aria-label={`Monthly trend chart, ${seri === 'kontrak' ? 'contract value' : 'deposits'}`}
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
        Contract value uses the invoice issue month (the month the PKS was
        issued); deposits use the payment date (cash flow) — same as the
        report reconciliation.
      </p>
    </Kartu>
  );
}

/**
 * Ranking Fase C (Q-09, Q-11): Employee Rank & Satker Rank — Leaderboard
 * of Year dan of The Month, toggle Tahun/Bulan. Metrik keduanya
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
                <Th>Name</Th>
                <Th kanan>Contracts</Th>
                <Th kanan>Contract value</Th>
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

function KartuRanking({ data }: { data: AppData }) {
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
    mode === 'tahun' ? `Year ${periode}` : formatPeriode(periode);
  const employee = rankingOperator(data, mode, periode);
  const satker = rankingSatker(data, mode, periode);
  const ringkasan = ringkasanPeriodeRanking(data, mode, periode);

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
            <JudulBagian>Ranking — Employee Rank &amp; Satker Rank</JudulBagian>
            <p className="mt-1 text-xs text-[#0d2569]/60">
              Leaderboard {mode === 'tahun' ? 'of the Year' : 'of the Month'} ·{' '}
              {labelPeriode} · Metric: value of closed contracts
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tombolMode('tahun', 'Year')}
          {tombolMode('bulan', 'Month')}
          {mode === 'tahun' ? (
            <select
              value={tahun}
              onChange={(e) => setTahunDipilih(e.target.value)}
              aria-label="Choose year"
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
              aria-label="Choose month"
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
          judul="Employee Rank — contract value per person in charge"
          baris={employee}
          teksKosong={`No contracts were closed in ${labelPeriode}.`}
        />
        <TabelRanking
          judul="Satker Rank — national Revenue Analytics per satker"
          baris={satker}
          teksKosong={`No contracts were closed in ${labelPeriode}.`}
        />
      </div>
      <p className="mt-4 text-xs text-[#0d2569]/60">
        The period is calculated from the date the contract was signed; if the
        signing date is not filled in, the contract start date is used
        {ringkasan.jumlahKontrak > 0 &&
          ` — in ${labelPeriode}, ${formatAngka(ringkasan.jumlahFallback)} of ${formatAngka(ringkasan.jumlahKontrak)} contracts use the start date.`}
      </p>
      <p className="mt-1 text-xs text-[#0d2569]/60">
        Employee Rank only counts contracts that already have a closing
        operator (Service staff who closed the contract)
        {ringkasan.jumlahTanpaOperator > 0 &&
          ` — in ${labelPeriode}, ${formatAngka(ringkasan.jumlahTanpaOperator)} of ${formatAngka(ringkasan.jumlahKontrak)} contracts do not have a closing operator yet; assign one in the contract details (Deals → Contracts).`}
      </p>
      <p className="mt-1 text-xs text-[#0d2569]/60">
        The national ranking only covers satker whose data is in the app
        (currently PALEMBANG); satker without data are not shown.
      </p>
    </Kartu>
  );
}

export default function Dashboard({ data }: ModulProps) {
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
        kategori: 'Overdue invoice',
        teks: `${t.nomor} — ${t.uraian}`,
        detail: `Due ${formatTanggal(t.tanggalJatuhTempo)} · Balance ${formatRupiah(sisaTagihan(t, data.pembayaran))}`,
      });
    });

  data.dokumen
    .filter((d) => d.status === 'Belum Ada')
    .forEach((d) => {
      perhatian.push({
        kategori: 'Missing document',
        teks: `${labelJenisDokumen(d.jenisDokumen)} — ${d.kontrakId}`,
        detail: d.catatan ?? 'Contract document has not been uploaded yet.',
      });
    });

  data.pengajuan
    .filter((p) => ['Masuk', 'Ditelaah', 'Menunggu Dokumen'].includes(p.tahap))
    .forEach((p) => {
      perhatian.push({
        kategori: 'Submission needs follow-up',
        teks: `${p.id} — ${p.pemohon}`,
        detail: `Stage: ${labelTahapPengajuan(p.tahap)} · Received ${formatTanggal(p.tanggalMasuk)}`,
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
        kategori: 'Lease expiring soon',
        teks: `${s.aset} — ${s.penyewaNama}`,
        detail: `Ends ${formatTanggal(s.tanggalSelesai)} (${sisa} more days)`,
      });
    });

  // Selisih rekonsiliasi hanya bermakna bila data acuan Keuangan ada.
  // Bila penerimaanAcuan kosong (Sheet 3 belum diimpor), selisih = 0 −
  // pembayaran terverifikasi dan BUKAN selisih yang sebenarnya.
  if (data.penerimaanAcuan.length > 0 && total.selisihRekonsiliasi !== 0) {
    perhatian.push({
      kategori: 'Reconciliation difference',
      teks: `Difference of ${formatRupiah(total.selisihRekonsiliasi)} between Finance reference receipts and verified payments`,
      detail: 'Receipts without invoices',
    });
  }

  const aktivitasTerakhir = [...data.audit]
    .sort((a, b) => (a.waktu < b.waktu ? 1 : a.waktu > b.waktu ? -1 : 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#0d2569]/70">
        Period summary — Pilot satker PALEMBANG. All figures are calculated
        from the real data imported from spreadsheets (14/11/2026), the same as
        other modules; Fase B sample data remains labelled &quot;(Sample)&quot;.
      </p>

      {/* (a) Kartu statistik — pola DashStack: label, angka besar, chip ikon,
          baris konteks faktual (bukan tren persen). */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          label="Active PKS"
          nilai={formatAngka(total.jumlahPks)}
          keterangan={`of ${formatAngka(data.kontrak.length)} contracts`}
          ikon={<FileText size={20} />}
        />
        <StatCard
          label="Total contract value"
          nilai={formatRupiah(total.nilaiKontrak)}
          keterangan={`${formatAngka(data.kontrak.filter((k) => k.tanggalMulai.startsWith('2026')).length)} 2026 contracts · ${formatAngka(data.kontrak.filter((k) => k.tanggalMulai.startsWith('2025')).length)} remaining from 2025`}
          ikon={<Handshake size={20} />}
        />
        <StatCard
          label="Verified payments"
          nilai={formatRupiah(total.totalPembayaranTerverifikasi)}
          keterangan={
            data.pembayaran.every((p) => p.statusVerifikasi === 'Terverifikasi')
              ? `${formatAngka(data.pembayaran.length)} payments · all Verified`
              : `${formatAngka(data.pembayaran.filter((p) => p.statusVerifikasi === 'Terverifikasi').length)} of ${formatAngka(data.pembayaran.length)} payments Verified`
          }
          ikon={<CheckCircle2 size={20} />}
        />
        <StatCard
          label="Outstanding receivables"
          nilai={formatRupiah(total.sisaPiutang)}
          keterangan={`${formatAngka(data.tagihan.filter((t) => sisaTagihan(t, data.pembayaran) > 0).length)} invoices with a balance`}
          ikon={<Clock size={20} />}
        />
        <StatCard
          label="Recorded late fees"
          nilai={formatRupiah(total.totalDenda)}
          keterangan={`${formatAngka(data.denda.length)} late fees · account code 425839`}
          ikon={<Receipt size={20} />}
        />
      </div>

      {/* (a2) Grafik tren bulanan — pola DashStack "Sales Details". */}
      <GrafikTren
        kontrak={nilaiKontrakPerBulan(data)}
        penyetoran={penyetoranPerBulan(data)}
      />

      {/* (a3) Ranking Fase C — Employee Rank & Satker Rank. */}
      <KartuRanking data={data} />

      {/* (b) Deadline laporan kantor pusat */}
      <Kartu>
        <JudulBagian>Head office report deadline</JudulBagian>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-[#2573e2]/20 bg-[#2573e2]/5 p-4">
            <p className="text-xs font-semibold text-[#0d2569]/70">
              Report filling deadline
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
              File submission deadline to head office
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
        <JudulBagian>Needs attention</JudulBagian>
        {perhatian.length === 0 ? (
          <div className="mt-3">
            <PesanKosong teks="Nothing needs attention right now." />
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
        <JudulBagian>Summary per account code</JudulBagian>
        {perKodeAkun.length === 0 ? (
          <div className="mt-3">
            <PesanKosong teks="No invoices or reference receipts yet." />
          </div>
        ) : (
          <Tabel>
            <thead>
              <tr>
                <Th>Account Code</Th>
                <Th>Description</Th>
                <Th kanan>Invoices</Th>
                <Th kanan>Payments</Th>
                <Th kanan>Finance Reference</Th>
                <Th kanan>Difference</Th>
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
        <JudulBagian>Recent activity</JudulBagian>
        {aktivitasTerakhir.length === 0 ? (
          <div className="mt-3">
            <PesanKosong teks="No activity recorded yet." />
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {aktivitasTerakhir.map((a) => (
              <ItemDaftar key={a.id} className="text-sm">
                <p className="font-semibold text-[#0d2569]">{labelAksiAudit(a.aksi)}</p>
                <p className="mt-0.5 text-xs text-[#0d2569]/70">
                  {formatWaktuAudit(a.waktu)} · {a.pengguna.replace('(Contoh)', '(Sample)')} · {labelEntitasAudit(a.entitas)}{' '}
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

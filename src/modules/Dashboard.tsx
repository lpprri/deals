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
} from 'lucide-react';
import type { ModulProps } from '../lib/store';
import {
  hitungTotalKontrol,
  nilaiKontrakPerBulan,
  penyetoranPerBulan,
  sisaTagihan,
  statusTagihan,
  totalPerKodeAkun,
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
  if (jumlahHari < 0) return 'sudah lewat';
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
          aria-label={`Grafik tren bulanan ${seri === 'kontrak' ? 'nilai kontrak' : 'penyetoran'}`}
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
        Nilai kontrak memakai basis bulan terbit tagihan (bulan PKS
        diterbitkan); penyetoran memakai basis tanggal bayar (arus kas) —
        sama dengan rekonsiliasi laporan.
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
        teks: `${d.jenisDokumen} — ${d.kontrakId}`,
        detail: d.catatan ?? 'Dokumen kontrak belum diunggah.',
      });
    });

  data.pengajuan
    .filter((p) => ['Masuk', 'Ditelaah', 'Menunggu Dokumen'].includes(p.tahap))
    .forEach((p) => {
      perhatian.push({
        kategori: 'Pengajuan perlu ditindaklanjuti',
        teks: `${p.id} — ${p.pemohon}`,
        detail: `Tahap: ${p.tahap} · Masuk ${formatTanggal(p.tanggalMasuk)}`,
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
        Ringkasan periode — Satker pilot PALEMBANG. Semua angka dihitung
        dari data nyata hasil impor spreadsheet (14/11/2026) yang sama dengan
        modul lain; data contoh Fase B tetap berlabel &quot;(Contoh)&quot;.
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
          label="Nilai kontrak total"
          nilai={formatRupiah(total.nilaiKontrak)}
          keterangan={`${formatAngka(data.kontrak.filter((k) => k.tanggalMulai.startsWith('2026')).length)} kontrak 2026 · ${formatAngka(data.kontrak.filter((k) => k.tanggalMulai.startsWith('2025')).length)} sisa 2025`}
          ikon={<Handshake size={20} />}
        />
        <StatCard
          label="Pembayaran terverifikasi"
          nilai={formatRupiah(total.totalPembayaranTerverifikasi)}
          keterangan={
            data.pembayaran.every((p) => p.statusVerifikasi === 'Terverifikasi')
              ? `${formatAngka(data.pembayaran.length)} pembayaran · semua Terverifikasi`
              : `${formatAngka(data.pembayaran.filter((p) => p.statusVerifikasi === 'Terverifikasi').length)} dari ${formatAngka(data.pembayaran.length)} pembayaran Terverifikasi`
          }
          ikon={<CheckCircle2 size={20} />}
        />
        <StatCard
          label="Sisa piutang"
          nilai={formatRupiah(total.sisaPiutang)}
          keterangan={`${formatAngka(data.tagihan.filter((t) => sisaTagihan(t, data.pembayaran) > 0).length)} tagihan bersisa`}
          ikon={<Clock size={20} />}
        />
        <StatCard
          label="Denda tercatat"
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

      {/* (b) Deadline laporan kantor pusat */}
      <Kartu>
        <JudulBagian>Deadline laporan kantor pusat</JudulBagian>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-[#2573e2]/20 bg-[#2573e2]/5 p-4">
            <p className="text-xs font-semibold text-[#0d2569]/70">
              Batas pengisian laporan
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
              Batas pengumpulan file ke kantor pusat
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
            <PesanKosong teks="Tidak ada yang perlu perhatian saat ini." />
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
                <Th>Kode Akun</Th>
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
                  <Td>{uraianKodeAkun(r.kodeAkun)}</Td>
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
            <PesanKosong teks="Belum ada aktivitas tercatat." />
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {aktivitasTerakhir.map((a) => (
              <ItemDaftar key={a.id} className="text-sm">
                <p className="font-semibold text-[#0d2569]">{a.aksi}</p>
                <p className="mt-0.5 text-xs text-[#0d2569]/70">
                  {formatWaktuAudit(a.waktu)} · {a.pengguna} · {a.entitas}{' '}
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

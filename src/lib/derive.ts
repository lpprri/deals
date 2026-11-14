// Nilai turunan — dihitung dari data, bukan diinput (PRD Bab 6.5, 7.5).
// Semua total di dashboard, Revenue, dan Reporting memakai fungsi ini,
// supaya angka di semua tempat selalu sama (gerbang keluar Fase A).

import type {
  AppData,
  Pembayaran,
  StatusTagihan,
  Tagihan,
} from './types';
import { TAHAP_PIPELINE_AKTIF } from './master';
import { hariIniIso, selisihHari } from './format';

/** Jumlah pembayaran (semua status) untuk satu tagihan. */
export function dibayarTagihan(tagihanId: string, pembayaran: Pembayaran[]): number {
  return pembayaran
    .filter((p) => p.tagihanId === tagihanId)
    .reduce((s, p) => s + p.jumlah, 0);
}

/** Jumlah pembayaran TERVERIFIKASI untuk satu tagihan. */
export function dibayarTerverifikasi(
  tagihanId: string,
  pembayaran: Pembayaran[],
): number {
  return pembayaran
    .filter((p) => p.tagihanId === tagihanId && p.statusVerifikasi === 'Terverifikasi')
    .reduce((s, p) => s + p.jumlah, 0);
}

/** Sisa piutang = nilai tagihan − pembayaran terverifikasi. */
export function sisaTagihan(tagihan: Tagihan, pembayaran: Pembayaran[]): number {
  return Math.max(0, tagihan.nilai - dibayarTerverifikasi(tagihan.id, pembayaran));
}

/**
 * Status turunan tagihan (PRD Bab 6.5): diturunkan dari pembayaran,
 * tidak diinput bebas.
 */
export function statusTagihan(
  tagihan: Tagihan,
  pembayaran: Pembayaran[],
  hariIni: string = hariIniIso(),
): StatusTagihan {
  const dibayar = dibayarTerverifikasi(tagihan.id, pembayaran);
  if (dibayar >= tagihan.nilai) return 'Lunas';
  if (dibayar > 0) return 'Lunas Sebagian';
  if (hariIni > tagihan.tanggalJatuhTempo) return 'Lewat Jatuh Tempo';
  if (hariIni === tagihan.tanggalJatuhTempo) return 'Jatuh Tempo';
  return 'Belum Jatuh Tempo';
}

/** Umur piutang dalam hari sejak jatuh tempo (0 bila belum jatuh tempo). */
export function umurPiutangHari(tagihan: Tagihan, hariIni: string = hariIniIso()): number {
  const lewat = selisihHari(tagihan.tanggalJatuhTempo, hariIni);
  return Math.max(0, lewat);
}

/** Kelompok umur piutang (ambang final menunggu Q-07; dipakai ambang PRD 7.5). */
export function kelompokUmurPiutang(tagihan: Tagihan, hariIni: string = hariIniIso()): string {
  const umur = umurPiutangHari(tagihan, hariIni);
  if (umur === 0) return 'Belum jatuh tempo';
  if (umur <= 30) return '1–30 hari';
  if (umur <= 60) return '31–60 hari';
  return 'Lebih dari 60 hari';
}

export interface TotalKontrol {
  jumlahPks: number;
  nilaiKontrak: number;
  totalTagihan: number;
  totalPembayaran: number;
  totalPembayaranTerverifikasi: number;
  sisaPiutang: number;
  totalDenda: number;
  totalPenerimaanAcuan: number;
  selisihRekonsiliasi: number;
}

/**
 * Total kontrol — SATU sumber hitung untuk dashboard, Revenue, dan
 * Reporting. Total kontrol laporan harus sama dengan jumlah barisnya
 * karena keduanya dihitung dari array yang sama (PRD Bab 7.6).
 */
export function hitungTotalKontrol(data: AppData): TotalKontrol {
  const totalTagihan = data.tagihan.reduce((s, t) => s + t.nilai, 0);
  const totalPembayaran = data.pembayaran.reduce((s, p) => s + p.jumlah, 0);
  const totalPembayaranTerverifikasi = data.pembayaran
    .filter((p) => p.statusVerifikasi === 'Terverifikasi')
    .reduce((s, p) => s + p.jumlah, 0);
  const sisaPiutang = data.tagihan.reduce(
    (s, t) => s + sisaTagihan(t, data.pembayaran),
    0,
  );
  const totalDenda = data.denda
    .filter((d) => d.status !== 'Dihapus')
    .reduce((s, d) => s + d.jumlah, 0);
  const totalPenerimaanAcuan = data.penerimaanAcuan.reduce((s, a) => s + a.jumlah, 0);
  return {
    jumlahPks: data.kontrak.filter((k) => k.status === 'Aktif').length,
    nilaiKontrak: data.kontrak.reduce((s, k) => s + k.nilaiKontrak, 0),
    totalTagihan,
    totalPembayaran,
    totalPembayaranTerverifikasi,
    sisaPiutang,
    totalDenda,
    totalPenerimaanAcuan,
    // Selisih = penerimaan acuan Keuangan − pembayaran terverifikasi.
    // Selisih 0 = cocok; selisih ≠ 0 harus terlihat & dijelaskan (Bab 7.5).
    selisihRekonsiliasi: totalPenerimaanAcuan - totalPembayaranTerverifikasi,
  };
}

// ---------------------------------------------------------------------------
// Analitik Sales — Fase B (PRD Bab 7.3). Semua angka dihitung dari data yang
// sama dengan Dashboard Fase A, supaya tidak ada angka yang berbeda antar
// layar. Nilai pipeline = Σ nilai perkiraan prospek pada tahap aktif.

export interface AnalitikSales {
  jumlahProspect: number;
  prospectPerTahap: { tahap: string; jumlah: number; nilai: number }[];
  nilaiPipeline: number;
  jumlahQuotation: number;
  jumlahQuotationDisetujui: number;
  jumlahOrder: number;
  jumlahOrderSelesai: number;
  jumlahKontrakDariProspect: number;
  konversiProspectKeQuotation: number; // persen, 0–100
  konversiQuotationKeOrder: number; // persen, 0–100
  konversiOrderKeKontrak: number; // persen, 0–100
  konversiProspectKeKontrak: number; // persen, 0–100
}

export function hitungAnalitikSales(data: AppData): AnalitikSales {
  const prospect = data.prospect;
  const prospectPerTahap = TAHAP_PIPELINE_AKTIF.map((tahap) => ({
    tahap,
    jumlah: prospect.filter((p) => p.tahap === tahap).length,
    nilai: prospect
      .filter((p) => p.tahap === tahap)
      .reduce((s, p) => s + p.nilaiPerkiraan, 0),
  }));
  const nilaiPipeline = prospect
    .filter((p) => TAHAP_PIPELINE_AKTIF.includes(p.tahap))
    .reduce((s, p) => s + p.nilaiPerkiraan, 0);
  const jumlahQuotation = data.quotation.length;
  const jumlahQuotationDisetujui = data.quotation.filter(
    (q) => q.status === 'Disetujui',
  ).length;
  const jumlahOrder = data.order.length;
  const jumlahOrderSelesai = data.order.filter((o) => o.status === 'Selesai').length;
  const jumlahKontrakDariProspect = data.kontrak.filter((k) =>
    data.prospect.some((p) => p.kontrakId === k.id),
  ).length;
  const persen = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 100));
  return {
    jumlahProspect: prospect.length,
    prospectPerTahap,
    nilaiPipeline,
    jumlahQuotation,
    jumlahQuotationDisetujui,
    jumlahOrder,
    jumlahOrderSelesai,
    jumlahKontrakDariProspect,
    konversiProspectKeQuotation: persen(
      new Set(data.quotation.map((q) => q.prospectId)).size,
      prospect.length,
    ),
    konversiQuotationKeOrder: persen(
      new Set(data.order.map((o) => o.quotationId)).size,
      jumlahQuotation,
    ),
    konversiOrderKeKontrak: persen(jumlahOrderSelesai, jumlahOrder),
    konversiProspectKeKontrak: persen(jumlahKontrakDariProspect, prospect.length),
  };
}

/** Total per kode akun (tagihan vs pembayaran terverifikasi vs acuan). */
export function totalPerKodeAkun(data: AppData): {
  kodeAkun: string;
  tagihan: number;
  pembayaran: number;
  acuan: number;
  selisih: number;
}[] {
  const kodeSet = new Set<string>();
  data.tagihan.forEach((t) => kodeSet.add(t.kodeAkun));
  data.penerimaanAcuan.forEach((a) => kodeSet.add(a.kodeAkun));
  return [...kodeSet].sort().map((kodeAkun) => {
    const tagihan = data.tagihan
      .filter((t) => t.kodeAkun === kodeAkun)
      .reduce((s, t) => s + t.nilai, 0);
    const pembayaran = data.pembayaran
      .filter(
        (p) =>
          p.statusVerifikasi === 'Terverifikasi' &&
          data.tagihan.find((t) => t.id === p.tagihanId)?.kodeAkun === kodeAkun,
      )
      .reduce((s, p) => s + p.jumlah, 0);
    const acuan = data.penerimaanAcuan
      .filter((a) => a.kodeAkun === kodeAkun)
      .reduce((s, a) => s + a.jumlah, 0);
    return { kodeAkun, tagihan, pembayaran, acuan, selisih: acuan - pembayaran };
  });
}

/** Satu titik deret bulanan untuk grafik tren (pola DashStack). */
export interface TitikBulanan {
  /** Periode 'yyyy-mm'. */
  periode: string;
  nilai: number;
}

/**
 * Nilai kontrak per bulan, basis bulan terbit tagihan (bulan PKS
 * diterbitkan) — basis yang sama dengan rekonsiliasi Laporan Bulanan
 * (skrip verifikasi migrasi). Total deret ini = nilai kontrak total di
 * kartu kontrol. Kontrak tanpa tagihan memakai bulan tanggalMulai sebagai
 * cadangan agar total tetap cocok. Hanya bulan yang ada datanya, terurut.
 */
export function nilaiKontrakPerBulan(data: AppData): TitikBulanan[] {
  const tagihanPerKontrak = new Map(
    data.tagihan.map((t) => [t.kontrakId, t]),
  );
  const peta = new Map<string, number>();
  data.kontrak.forEach((k) => {
    const terbit = tagihanPerKontrak.get(k.id)?.tanggalTerbit ?? k.tanggalMulai;
    const periode = terbit.slice(0, 7);
    peta.set(periode, (peta.get(periode) ?? 0) + k.nilaiKontrak);
  });
  return [...peta.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([periode, nilai]) => ({ periode, nilai }));
}

/**
 * Penyetoran (arus kas) per bulan, basis tanggal bayar — sama dengan
 * rekonsiliasi Laporan Piutang. Hanya bulan yang ada datanya, terurut.
 */
export function penyetoranPerBulan(data: AppData): TitikBulanan[] {
  const peta = new Map<string, number>();
  data.pembayaran.forEach((p) => {
    const periode = p.tanggalBayar.slice(0, 7);
    peta.set(periode, (peta.get(periode) ?? 0) + p.jumlah);
  });
  return [...peta.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([periode, nilai]) => ({ periode, nilai }));
}


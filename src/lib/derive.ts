// Nilai turunan — dihitung dari data, bukan diinput (PRD Bab 6.5, 7.5).
// Semua total di dashboard, Revenue, dan Reporting memakai fungsi ini,
// supaya angka di semua tempat selalu sama (gerbang keluar Fase A).

import type {
  AppData,
  Pembayaran,
  StatusTagihan,
  Tagihan,
} from './types';
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

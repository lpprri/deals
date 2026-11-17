// Realisasi Kerja Sama & angka Revenue di Detail Kontrak
// (draft pengguna 16/11/2026 + jawaban 7 pertanyaan 16/11/2026 16:34 WIB).
//
// Modul MURNI — tidak mengimpor Firebase (pola yang sama seperti
// lacakHasil.ts / kontrakTampilan.ts), supaya bisa dipakai skrip cek.
//
// SUMBER REALISASI (penyelidikan 16/11/2026):
// - File "Kerja Sama PNBP 2026" punya kolom "Realisasi Kerja Sama" PER
//   LAYANAN (= proporsi yang sudah tayang / dilaksanakan). TIDAK ADA
//   jadwal siaran per tanggal di spreadsheet mana pun — jadi realisasi
//   memakai kolom itu, BUKAN daftar tanggal tayang.
// - Bila satu layanan tidak punya nilai realisasi di file (layanan
//   "Siaran Langsung" pada 5390/5391), dipakai aturan fallback di bawah.
// - Piutang (realisasi) BERBEDA dari sisa piutang lama (Σ tagihan −
//   pembayaran): keduanya tampil dengan label yang jelas di Detail
//   Kontrak dan tidak pernah dicampur.
//
// RUMUS (persis jawaban pengguna):
// - Realisasi Fungsional = proporsi yang sudah tayang (dari file), atau
//   proporsi periode berjalan bila tidak ada data tersimpan.
// - Realisasi Umum = 100% di muka, KECUALI sewa multi-tahun yang dibayar
//   per tahun -> tahun berjalan / jumlah tahun.
// - Piutang = (nilaiKontrak + total denda) x % Realisasi.
// - Sisa Kontrak = (nilaiKontrak + total denda) x (1 - % Realisasi)
//   ("nilai kerja sama yang belum direalisasikan").
// - Sisa Piutang = Piutang - total pembayaran Terverifikasi.
// - Total denda = Σ Denda.jumlah atas tagihan kontrak itu dengan
//   status selain "Dihapus" (konvensi yang sama seperti derive.ts dan
//   statusPembayaranKontrak di kontrakTampilan.ts).

import { selisihHari } from './format';
import { dibayarTerverifikasi } from './derive';
import type {
  Denda,
  Kontrak,
  LayananKontrak,
  Pembayaran,
  Tagihan,
} from './types';

// ---------------------------------------------------------------------------
// Jendela waktu Prime Time / Regular Time (referensi, bagian Time Fungsional)
// ---------------------------------------------------------------------------

/**
 * Keputusan Kepala RRI Jakarta Nomor 31 Tahun 2026 (26 Januari 2026,
 * ditandatangani Ir. Mochammad Bugi Hidayat, M.Si) — penetapan waktu
 * Prime Time dan Regular Time untuk penyiaran Spot, Adlibs, Quiz, dll.
 * Berlaku untuk seluruh Indonesia (keputusan pengguna 2026-11-16; SK ini
 * milik Jakarta "tapi sama saja untuk seluruh indonesia").
 * Jendela disalin apa adanya dari lampiran SK — termasuk yang tumpang
 * tindih (mis. Programa 1 Prime 05.00–13.30 dan 15.00–20.00).
 * SK ini HANYA memuat Programa 1, 2, dan 4 — tidak ada Programa 3.
 */
export interface JendelaWaktuSiar {
  programa: string;
  prime: string[];
  regular: string[];
}

export const JENDELA_WAKTU_SIAR: JendelaWaktuSiar[] = [
  {
    programa: 'Programa 1',
    prime: ['05.00–13.30', '15.00–20.00'],
    regular: ['13.30–14.00', '14.00–15.00', '20.00–21.00', '21.00–23.00', '23.00–24.00'],
  },
  {
    programa: 'Programa 2',
    prime: ['05.00–12.00', '09.00–10.00', '16.00–20.00'],
    regular: ['12.00–16.00', '20.00–24.00'],
  },
  {
    programa: 'Programa 4',
    prime: ['05.00–15.00', '13.30–15.00', '13.00–14.00', '16.00–20.00', '19.00–20.00'],
    regular: ['15.00–16.00', '20.00–24.00'],
  },
];

export const SUMBER_JENDELA_WAKTU_SIAR =
  'Keputusan Kepala RRI Jakarta Nomor 31 Tahun 2026 (26 January 2026)';

const batasiFraksi = (nilai: number): number =>
  Math.min(1, Math.max(0, nilai));

// ---------------------------------------------------------------------------
// NTB / NTPN — dipisah dari Pembayaran.buktiSetor ("NTB ... / NTPN ...")
// ---------------------------------------------------------------------------

export interface BuktiSetorTerpisah {
  /** Nomor 15 digit; di file sumber kolom ini berisi KODE BILLING. */
  ntb: string | null;
  ntpn: string | null;
}

/**
 * Pisahkan buktiSetor menjadi NTB dan NTPN. Bila buktiSetor kosong,
 * keduanya null (tampil "—").
 *
 * FAKTA SUMBER (penyelidikan 16/11/2026): angka 15 digit di kolom NTB
 * file "Kerja Sama PNBP 2026" adalah angka yang SAMA dengan kolom
 * "KODE BILLING" di spreadsheet Finance "DATA PNBP 2026" (terverifikasi
 * 1:1 untuk 0603, 1051, 1052, 1494). Jadi kode billing kontrak ini
 * adalah bagian NTB dari buktiSetor pembayaran — tidak ada kolom billing
 * terpisah di data. Bila Finance mengonfirmasi adanya NTB bank yang
 * berbeda dari kode billing, pemisahan ini perlu data tambahan.
 */
export function pisahBuktiSetor(buktiSetor?: string): BuktiSetorTerpisah {
  const hasil: BuktiSetorTerpisah = { ntb: null, ntpn: null };
  if (!buktiSetor) return hasil;
  for (const bagian of buktiSetor.split('/')) {
    const teks = bagian.trim();
    const cocokNtb = /^NTB\s*(.+)$/i.exec(teks);
    if (cocokNtb) {
      hasil.ntb = cocokNtb[1].trim() || null;
      continue;
    }
    const cocokNtpn = /^NTPN\s*(.+)$/i.exec(teks);
    if (cocokNtpn) hasil.ntpn = cocokNtpn[1].trim() || null;
  }
  return hasil;
}

/**
 * Kode billing kontrak = bagian NTB dari pembayaran tertua yang punya
 * kode billing (format 15 digit diawali "82").
 *
 * Hanya NTB berformat kode billing yang dipakai: dua pembayaran 2025
 * (BYR-039 Darojad, BYR-041 PT VGreen) membawa NTB bank 12 digit
 * ("121637827742", "271823198897") — BUKAN kode billing — sehingga
 * dilewati di sini (tetapi tetap tampil apa adanya di tabel Pembayaran).
 */
export function kodeBillingKontrak(pembayaranKontrak: Pembayaran[]): string | null {
  const terurut = [...pembayaranKontrak].sort((a, b) =>
    a.tanggalBayar < b.tanggalBayar ? -1 : a.tanggalBayar > b.tanggalBayar ? 1 : 0,
  );
  for (const p of terurut) {
    const { ntb } = pisahBuktiSetor(p.buktiSetor);
    if (ntb && /^82\d{13}$/.test(ntb)) return ntb;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Total denda & total pembayaran per kontrak (konvensi derive.ts)
// ---------------------------------------------------------------------------

/** Σ Denda.jumlah atas tagihan kontrak ini, status selain "Dihapus". */
export function totalDendaKontrak(
  kontrak: Kontrak,
  tagihan: Tagihan[],
  denda: Denda[],
): number {
  const idTagihan = new Set(
    tagihan.filter((t) => t.kontrakId === kontrak.id).map((t) => t.id),
  );
  return denda
    .filter((d) => idTagihan.has(d.tagihanId) && d.status !== 'Dihapus')
    .reduce((s, d) => s + d.jumlah, 0);
}

/** Σ pembayaran Terverifikasi atas tagihan kontrak ini. */
export function totalPembayaranKontrak(
  kontrak: Kontrak,
  tagihan: Tagihan[],
  pembayaran: Pembayaran[],
): number {
  return tagihan
    .filter((t) => t.kontrakId === kontrak.id)
    .reduce((s, t) => s + dibayarTerverifikasi(t.id, pembayaran), 0);
}

/**
 * Pembayaran Terverifikasi TERAKHIR kontrak itu — tanggalBayar terbaru
 * (bila tanggal sama, jumlah terbesar dulu supaya deterministik).
 * undefined bila belum ada pembayaran Terverifikasi (3 kontrak seed:
 * 018, 10227, 11290 — ketiganya Unpaid). Dipakai kolom Payment Date /
 * Payment Amount (Cluster 5, keputusan pengguna 17/11/2026 11:41 WIB).
 */
export function pembayaranTerverifikasiTerakhir(
  kontrak: Kontrak,
  tagihan: Tagihan[],
  pembayaran: Pembayaran[],
): Pembayaran | undefined {
  const idTagihan = new Set(
    tagihan.filter((t) => t.kontrakId === kontrak.id).map((t) => t.id),
  );
  const terverifikasi = pembayaran.filter(
    (p) => idTagihan.has(p.tagihanId) && p.statusVerifikasi === 'Terverifikasi',
  );
  terverifikasi.sort((a, b) =>
    a.tanggalBayar !== b.tanggalBayar
      ? a.tanggalBayar < b.tanggalBayar
        ? 1
        : -1
      : b.jumlah - a.jumlah,
  );
  return terverifikasi[0];
}

/**
 * Remaining Receivable (kolom Cluster 5) = Sisa Piutang: Piutang −
 * Total Payment.
 *
 * KOREKSI (Arahan 3, pengguna 17/11/2026 11:57 WIB): rumus pengguna
 * "Total Pembayaran − Piutang" diterapkan dengan urutan DIBALIK.
 * Urutan harfiah membuat Sisa Kontrak = Total Revenue + Piutang −
 * 2 × Total Pembayaran — contoh 10227: Rp7.695.000, MELEBIHI nilai
 * kontrak Rp4.995.000, bukan "sisa" apa pun. Dengan urutan dibalik,
 * nilainya sama dengan sisaPiutangRealisasi (Sisa Piutang PR #63 di
 * DetailKontrak) dan TIDAK ADA lagi nilai negatif: 9 kontrak yang
 * dulu negatif kini positif (6 Insufficient Payment + 3 Unpaid),
 * 33 kontrak nol.
 */
export function selisihBayarPiutang(
  kontrak: Kontrak,
  tagihan: Tagihan[],
  denda: Denda[],
  pembayaran: Pembayaran[],
  hariIni: string,
): number {
  return (
    piutangRealisasi(kontrak, tagihan, denda, hariIni) -
    totalPembayaranKontrak(kontrak, tagihan, pembayaran)
  );
}

/**
 * Remaining Value (kolom Cluster 5) = Sisa Kontrak: Total Revenue −
 * Receivable Value − Remaining Receivable. Karena Remaining
 * Receivable di sini = Piutang − Total Payment (urutan dibalik,
 * lihat selisihBayarPiutang), rumus ini menyusut menjadi Total
 * Revenue − Piutang — SAMA dengan sisaKontrakRealisasi (definisi
 * Sisa Kontrak PR #63/67). REDEFINISI 17/11/2026 11:41 WIB
 * (Total Revenue − Total Payment) DIBATALKAN oleh koreksi Arahan 3
 * (pengguna 17/11/2026 11:57 WIB); kolom ini KEMBALI ke nilai lama.
 * Komposisi ini terbukti sama dengan sisaKontrakRealisasi untuk
 * semua 42 kontrak seed (skrip cek; tanpa selisih pembulatan).
 * Karena memakai Piutang (realisasi), nilai live (fallback) berbeda
 * dari seed hanya untuk 018 dan 10227 — sama seperti Piutang.
 */
export function sisaNilaiSetelahBayar(
  kontrak: Kontrak,
  tagihan: Tagihan[],
  denda: Denda[],
  pembayaran: Pembayaran[],
  hariIni: string,
): number {
  return (
    kontrak.nilaiKontrak +
    totalDendaKontrak(kontrak, tagihan, denda) -
    totalPembayaranKontrak(kontrak, tagihan, pembayaran) -
    selisihBayarPiutang(kontrak, tagihan, denda, pembayaran, hariIni)
  );
}

// ---------------------------------------------------------------------------
// Realisasi
// ---------------------------------------------------------------------------

/** Proporsi periode berjalan (hari ini − mulai) / (selesai − mulai), 0–100%. */
export function realisasiProporsiWaktu(kontrak: Kontrak, hariIni: string): number {
  if (kontrak.status === 'Selesai') return 1;
  const total = selisihHari(kontrak.tanggalMulai, kontrak.tanggalSelesai);
  if (total <= 0) return 1;
  return batasiFraksi(
    selisihHari(kontrak.tanggalMulai, hariIni) / total,
  );
}

/**
 * Realisasi satu layanan (fraksi 0–1).
 * 1) Nilai tersimpan dari file ("Realisasi Kerja Sama") dipakai bila ada.
 * 2) Fallback — kontrak Selesai: 100%.
 * 3) Fallback — PNBP Umum multi-tahun (satuan Tahun, jumlah > 1):
 *    tahun berjalan / jumlah tahun. Tahun berjalan = tahun ke-n dari
 *    tanggal mulai (tahun pertama = 1), dibatasi 0..jumlah.
 * 4) Fallback — PNBP Umum lainnya: 100% di muka.
 * 5) Fallback — PNBP Fungsional: proporsi periode berjalan.
 */
export function realisasiLayanan(
  layanan: LayananKontrak,
  kontrak: Kontrak,
  hariIni: string,
): number {
  if (typeof layanan.realisasi === 'number') {
    return batasiFraksi(layanan.realisasi);
  }
  if (kontrak.status === 'Selesai') return 1;
  if (kontrak.jenisPnBP === 'Umum') {
    if (layanan.satuan === 'Tahun' && layanan.jumlah > 1) {
      const tahunBerjalan = Math.min(
        layanan.jumlah,
        Math.max(
          0,
          Math.floor(selisihHari(kontrak.tanggalMulai, hariIni) / 365) + 1,
        ),
      );
      return tahunBerjalan / layanan.jumlah;
    }
    return 1;
  }
  return realisasiProporsiWaktu(kontrak, hariIni);
}

/**
 * Realisasi kontrak = rata-rata realisasi layanan, dibobot subtotal.
 * Kontrak tanpa layanan memakai fallback status/jenis (Selesai/Umum 100%,
 * Fungsional proporsi waktu).
 */
export function realisasiKontrak(kontrak: Kontrak, hariIni: string): number {
  const totalSubtotal = kontrak.layanan.reduce((s, l) => s + l.subtotal, 0);
  if (kontrak.layanan.length === 0 || totalSubtotal <= 0) {
    if (kontrak.status === 'Selesai' || kontrak.jenisPnBP === 'Umum') return 1;
    return realisasiProporsiWaktu(kontrak, hariIni);
  }
  const tertimbang = kontrak.layanan.reduce(
    (s, l) => s + l.subtotal * realisasiLayanan(l, kontrak, hariIni),
    0,
  );
  return batasiFraksi(tertimbang / totalSubtotal);
}

/** "61.1%" / "100%" — persen 1 desimal, tanpa ",0" di belakang. */
export function formatPersenRealisasi(fraksi: number): string {
  const persen = Math.round(fraksi * 1000) / 10;
  return `${persen % 1 === 0 ? persen.toFixed(0) : persen.toFixed(1)}%`;
}

// ---------------------------------------------------------------------------
// Piutang / Sisa Kontrak / Sisa Piutang (versi realisasi)
// ---------------------------------------------------------------------------

/** Piutang = (nilaiKontrak + total denda) x % Realisasi. */
export function piutangRealisasi(
  kontrak: Kontrak,
  tagihan: Tagihan[],
  denda: Denda[],
  hariIni: string,
): number {
  const totalDenda = totalDendaKontrak(kontrak, tagihan, denda);
  return Math.round(
    (kontrak.nilaiKontrak + totalDenda) * realisasiKontrak(kontrak, hariIni),
  );
}

/** Sisa Kontrak = (nilaiKontrak + total denda) x (1 - % Realisasi). */
export function sisaKontrakRealisasi(
  kontrak: Kontrak,
  tagihan: Tagihan[],
  denda: Denda[],
  hariIni: string,
): number {
  const totalDenda = totalDendaKontrak(kontrak, tagihan, denda);
  return Math.round(
    (kontrak.nilaiKontrak + totalDenda) *
      (1 - realisasiKontrak(kontrak, hariIni)),
  );
}

/** Sisa Piutang = Piutang (realisasi) - total pembayaran Terverifikasi. */
export function sisaPiutangRealisasi(
  kontrak: Kontrak,
  tagihan: Tagihan[],
  denda: Denda[],
  pembayaran: Pembayaran[],
  hariIni: string,
): number {
  return (
    piutangRealisasi(kontrak, tagihan, denda, hariIni) -
    totalPembayaranKontrak(kontrak, tagihan, pembayaran)
  );
}

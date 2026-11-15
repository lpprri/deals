// Notifikasi top bar — MURNI, tanpa import Firebase (supaya bisa di-bundle
// skrip cek). Satu item punya SATU tab primer; tampilan General menunjukkan
// SEMUA item. Isinya hanya yang bisa dihitung dari data — TIDAK ADA
// notifikasi fabrikasi. Teks judul/detail mengikuti format Dashboard
// "Perlu perhatian" (modul yang sama, helper format yang sama).

import type { AppData } from './types';
import { hitungTotalKontrol, sisaTagihan, statusTagihan } from './derive';
import { formatRupiah, formatTanggal, selisihHari } from './format';
import { labelJenisDokumen, labelTahapPengajuan } from './labels';

export type TabNotifikasi = 'general' | 'inbox' | 'approval';

/** Modul tujuan saat item notifikasi diklik (sama dengan ModuleId di App.tsx). */
export type ModulNotifikasi =
  | 'dashboard'
  | 'marketing'
  | 'sales'
  | 'deals'
  | 'sewa'
  | 'pengajuan'
  | 'revenue'
  | 'reporting'
  | 'todo'
  | 'service'
  | 'audit'
  | 'master';

export interface Notifikasi {
  id: string;
  tab: TabNotifikasi;
  kategori: string;
  judul: string;
  detail: string;
  modul: ModulNotifikasi;
}

export const KATEGORI_NOTIFIKASI = {
  pengajuanKlien: 'Public submission awaiting review',
  tagihanLewat: 'Overdue invoice',
  pengajuan: 'Submission needs follow-up',
  disposisi: 'Disposition task',
  dokumenHilang: 'Missing document',
  sewaBerakhir: 'Lease expiring soon',
  selisih: 'Reconciliation difference',
} as const;

/** Daftar notifikasi dari data. `hariIni` ISO 'yyyy-mm-dd' (diinjeksikan agar bisa diuji). */
export function daftarNotifikasi(data: AppData, hariIni: string): Notifikasi[] {
  const semua: Notifikasi[] = [];

  // Approval — submission publik (Ajukan) yang masih Menunggu.
  data.pengajuanKlien
    .filter((pk) => pk.status === 'Menunggu')
    .forEach((pk) => {
      semua.push({
        id: `pengajuan-klien:${pk.id}`,
        tab: 'approval',
        kategori: KATEGORI_NOTIFIKASI.pengajuanKlien,
        judul: `${pk.judul} — ${pk.namaInstitusi ?? pk.namaPic}`,
        detail: `Type: ${pk.jenis} · From ${pk.namaPic} · ${formatTanggal(pk.tanggalBuat)}`,
        modul: 'pengajuan',
      });
    });

  // Inbox — tagihan lewat jatuh tempo.
  data.tagihan
    .filter((t) => statusTagihan(t, data.pembayaran) === 'Lewat Jatuh Tempo')
    .forEach((t) => {
      semua.push({
        id: `tagihan-lewat:${t.nomor}`,
        tab: 'inbox',
        kategori: KATEGORI_NOTIFIKASI.tagihanLewat,
        judul: `${t.nomor} — ${t.uraian}`,
        detail: `Due ${formatTanggal(t.tanggalJatuhTempo)} · Balance ${formatRupiah(sisaTagihan(t, data.pembayaran))}`,
        modul: 'revenue',
      });
    });

  // Inbox — pengajuan internal tahap awal.
  data.pengajuan
    .filter((p) => ['Masuk', 'Ditelaah', 'Menunggu Dokumen'].includes(p.tahap))
    .forEach((p) => {
      semua.push({
        id: `pengajuan:${p.id}`,
        tab: 'inbox',
        kategori: KATEGORI_NOTIFIKASI.pengajuan,
        judul: `${p.id} — ${p.pemohon}`,
        detail: `Stage: ${labelTahapPengajuan(p.tahap)} · Received ${formatTanggal(p.tanggalMasuk)}`,
        modul: 'pengajuan',
      });
    });

  // Inbox — tugas disposisi yang belum selesai (ada pemberi/disposisi).
  data.task
    .filter(
      (t) =>
        (t.disposisiDari || t.pemberiDisposisi) &&
        (t.status === 'Belum Dikerjakan' || t.status === 'Berjalan'),
    )
    .forEach((t) => {
      semua.push({
        id: `tugas-disposisi:${t.id}`,
        tab: 'inbox',
        kategori: KATEGORI_NOTIFIKASI.disposisi,
        judul: `${t.judul} — ${t.pemilik}`,
        detail: `From ${t.pemberiDisposisi ?? t.disposisiDari} · Due ${formatTanggal(t.tenggat)}`,
        modul: 'todo',
      });
    });

  // General — dokumen kerja sama yang belum ada.
  data.dokumen
    .filter((d) => d.status === 'Belum Ada')
    .forEach((d) => {
      semua.push({
        id: `dokumen-hilang:${d.id}`,
        tab: 'general',
        kategori: KATEGORI_NOTIFIKASI.dokumenHilang,
        judul: `${labelJenisDokumen(d.jenisDokumen)} — ${d.kontrakId}`,
        detail: d.catatan ?? 'Contract document has not been uploaded yet.',
        modul: 'deals',
      });
    });

  // General — sewa ON GOING yang berakhir ≤ 60 hari.
  data.sewa
    .filter((s) => {
      const sisa = selisihHari(hariIni, s.tanggalSelesai);
      return s.status === 'ON GOING' && sisa >= 0 && sisa <= 60;
    })
    .forEach((s) => {
      const sisa = selisihHari(hariIni, s.tanggalSelesai);
      semua.push({
        id: `sewa-berakhir:${s.id}`,
        tab: 'general',
        kategori: KATEGORI_NOTIFIKASI.sewaBerakhir,
        judul: `${s.aset} — ${s.penyewaNama}`,
        detail: `Ends ${formatTanggal(s.tanggalSelesai)} (${sisa} more days)`,
        modul: 'sewa',
      });
    });

  // General — selisih rekonsiliasi, hanya bermakna bila data acuan ada
  // (aturan yang sama dengan Dashboard "Perlu perhatian").
  const total = hitungTotalKontrol(data);
  if (data.penerimaanAcuan.length > 0 && total.selisihRekonsiliasi !== 0) {
    semua.push({
      id: 'rekonsiliasi-selisih',
      tab: 'general',
      kategori: KATEGORI_NOTIFIKASI.selisih,
      judul: `Difference of ${formatRupiah(total.selisihRekonsiliasi)} between Finance reference receipts and verified payments`,
      detail: 'Receipts without invoices',
      modul: 'revenue',
    });
  }

  return semua;
}

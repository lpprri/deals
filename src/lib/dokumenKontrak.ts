// Daftar dokumen per kontrak untuk cluster "Document" di DetailKontrak
// (permintaan pengguna 17/11/2026) — ini CHECKLIST dokumen, BUKAN unggah
// file: aplikasi tidak menyimpan file dokumen, jadi tidak ada tautan
// unduh/unggah di cluster ini.
//
// Persentase keterpenuhan dokumen (permintaan pengguna 17/11/2026
// 09:26 WIB) dihitung dari daftar ini juga (kelengkapanDokumen) —
// tampil di cluster Document dan sebagai kolom "Document Completeness"
// di tabel Contract.
//
// Label Bahasa Indonesia Proper Case persis permintaan pengguna —
// pengecualian dari keputusan UI full-English (seperti kolom Status
// Pembayaran, PR #64).
//
// Pemetaan ke data (diverifikasi dari seed, 102 dokumen):
// - Perjanjian Kerjasama <- DokumenItem 'PKS (asli)' (42; Ada 36).
// - Invoice Penagihan <- Tagihan, 1 per kontrak (42; semua Ada).
// - Billing Pembayaran <- DokumenItem 'Billing Pembayaran' (22; Ada 16).
//   Catatan: ini catatan DOKUMEN billing, bukan nilai kode billing itu
//   sendiri — kode billing 15 digit (dari NTB pembayaran) sudah tampil
//   di bagian Revenue (PR #63). Menampilkan "Belum Ada" untuk semua
//   kontrak di sini akan bertentangan dengan 16 catatan "Ada" tersebut.
// - Kwitansi Pembayaran <- DokumenItem 'Kwitansi Pembayaran' (12; Ada 4).
// - Surat Penagihan <- DokumenItem 'Surat Penagihan' (12; Ada 1),
//   HANYA tampil bila status pembayaran kontrak = Overdue (definisi
//   PR #60). Saat ini tidak ada kontrak Overdue.
// - Nota Penyiaran, Jadwal Siar / Nota Produksi: tidak ada di data
//   manapun (kolom sumber kosong untuk semua 42 kontrak) — selalu
//   "Belum Ada".
// - Bukti Siar <- DokumenItem 'Bukti Siaran' (nama jenis di master/seed;
//   label tampil memakai "Bukti Siar" persis permintaan pengguna).
//   Tidak ada catatannya di seed — selalu "Belum Ada" sejauh ini.
// - Permohonan Sewa <- DokumenItem 'Permohonan Sewa' (14; semua Ada).
// - Pemberitahuan Persetujuan Sewa: tidak ada di data manapun — selalu
//   "Belum Ada".
// - Persetujuan Sewa KPKNL: tidak ada catatan DokumenItem-nya; nomor
//   suratnya tercatat di kontrak.dasarNilai (17/17 kontrak Umum) dan
//   tampil sebagai referensi — file suratnya sendiri tidak disimpan di
//   aplikasi, jadi status tetap "Belum Ada".
import { statusPembayaranKontrak } from './kontrakTampilan';
import { hariIniIso } from './format';
import type {
  Denda,
  DokumenItem,
  Kontrak,
  Pembayaran,
  Tagihan,
} from './types';

export interface ItemDokumenKontrak {
  /** Label tampil — Proper Case Indonesia, persis permintaan pengguna. */
  label: string;
  /** Referensi: id catatan dokumen / nomor tagihan / nomor surat KPKNL. */
  detail: string | null;
  /** true = "Ada", false = "Belum Ada". */
  ada: boolean;
}

function dariDokumen(
  dokumen: DokumenItem[],
  kontrakId: string,
  jenis: string,
  label: string,
): ItemDokumenKontrak {
  const d = dokumen.find(
    (x) => x.kontrakId === kontrakId && x.jenisDokumen === jenis,
  );
  return { label, detail: d ? d.id : null, ada: d?.status === 'Ada' };
}

export function daftarDokumenKontrak(
  kontrak: Kontrak,
  dokumen: DokumenItem[],
  tagihan: Tagihan[],
  pembayaran: Pembayaran[],
  denda: Denda[],
  hariIni: string = hariIniIso(),
): ItemDokumenKontrak[] {
  const items: ItemDokumenKontrak[] = [];

  // ---- Umum: semua kontrak ----
  items.push(
    dariDokumen(dokumen, kontrak.id, 'PKS (asli)', 'Perjanjian Kerjasama'),
  );
  const tagihanKontrak = tagihan.find((t) => t.kontrakId === kontrak.id);
  items.push({
    label: 'Invoice Penagihan',
    detail: tagihanKontrak ? tagihanKontrak.nomor : null,
    ada: tagihanKontrak !== undefined,
  });
  items.push(
    dariDokumen(
      dokumen,
      kontrak.id,
      'Billing Pembayaran',
      'Billing Pembayaran',
    ),
  );
  items.push(
    dariDokumen(
      dokumen,
      kontrak.id,
      'Kwitansi Pembayaran',
      'Kwitansi Pembayaran',
    ),
  );
  // Surat Penagihan hanya bila pembayaran Overdue (definisi PR #60).
  if (
    statusPembayaranKontrak(kontrak, tagihan, pembayaran, denda, hariIni) ===
    'Overdue'
  ) {
    items.push(
      dariDokumen(dokumen, kontrak.id, 'Surat Penagihan', 'Surat Penagihan'),
    );
  }

  // ---- Khusus per jenis PNBP (seperti Special Details) ----
  if (kontrak.jenisPnBP === 'Fungsional') {
    items.push({ label: 'Nota Penyiaran', detail: null, ada: false });
    items.push({ label: 'Jadwal Siar / Nota Produksi', detail: null, ada: false });
    items.push(dariDokumen(dokumen, kontrak.id, 'Bukti Siaran', 'Bukti Siar'));
  } else {
    items.push(
      dariDokumen(dokumen, kontrak.id, 'Permohonan Sewa', 'Permohonan Sewa'),
    );
    items.push({
      label: 'Pemberitahuan Persetujuan Sewa',
      detail: null,
      ada: false,
    });
    items.push({
      label: 'Persetujuan Sewa KPKNL',
      detail: kontrak.dasarNilai ?? null,
      ada: false,
    });
  }
  return items;
}

export interface KelengkapanDokumen {
  /** Jumlah item checklist berstatus "Ada". */
  ada: number;
  /** Total item checklist kontrak itu (7 normal, 8 bila Overdue). */
  total: number;
  /** Fraksi 0–1 (ada / total); tampil dengan formatPersenRealisasi. */
  fraksi: number;
}

/**
 * Keterpenuhan dokumen (permintaan pengguna 17/11/2026 09:26 WIB):
 * item "Ada" / total item checklist kontrak itu.
 *
 * Dihitung dari daftar yang SAMA dengan yang dirender tabel Document
 * (daftarDokumenKontrak) — penyebut = panjang daftar, BUKAN angka
 * tetap — supaya persen dan tabel tidak pernah berbeda. Karena Surat
 * Penagihan hanya tampil bila Overdue, kontrak Overdue punya penyebut
 * 8, yang lain 7. Daftar kosong (tidak terjadi di data — semua kontrak
 * punya minimal Invoice Penagihan) menghasilkan 0.
 */
export function kelengkapanDokumen(
  items: ItemDokumenKontrak[],
): KelengkapanDokumen {
  const ada = items.filter((x) => x.ada).length;
  const total = items.length;
  return { ada, total, fraksi: total === 0 ? 0 : ada / total };
}

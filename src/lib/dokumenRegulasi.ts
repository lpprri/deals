// Daftar kanonis dokumen lengkap Knowledge Base — tab Document, Resources
// (PR #49, 16/11/2026). Berkas PDF-nya TIDAK ada di repo ini: snapshot push
// GitHub hanya menerima file teks, dan connector GitHub tidak menyediakan
// unggah biner (create_or_update_file hanya menerima `content` string —
// server melakukan base64-encode sendiri, jadi byte biner tidak bisa
// dilewatkan utuh). Berkas diunggah pengguna lewat GitHub web UI ke folder
// `public/dokumen/` repo `lpprri/deals`; tautan di bawah menunjuk ke
// `/dokumen/<nama-berkas>` (disajikan Vercel dari domain yang sama) dan
// baru berfungsi setelah berkas-berkas itu diunggah. JANGAN mengganti
// tautan ini dengan tautan Drive/Storage lain.
//
// Metadata di bawah adalah nilai SEBENARNYA dari berkas (pdfinfo + stat,
// 16/11/2026) — jangan diubah tanpa memeriksa ulang berkasnya.

/** Satu dokumen lengkap yang bisa diunduh dari tab Document. */
export interface DokumenRegulasi {
  /** Nama regulasi (Bahasa Indonesia, sesuai nama berkas). */
  judul: string;
  /** Nama berkas persis seperti di `public/dokumen/`. */
  berkas: string;
  /** Jumlah halaman (pdfinfo). */
  halaman: number;
  /** Ukuran berkas dalam byte (stat). */
  ukuranByte: number;
}

/** Tautan unduh satu dokumen (domain yang sama, disajikan Vercel). */
export function urlDokumenRegulasi(berkas: string): string {
  return `/dokumen/${encodeURIComponent(berkas)}`;
}

export const DOKUMEN_REGULASI: DokumenRegulasi[] = [
  {
    judul: 'PMK 115/PMK.03/2021',
    berkas: 'PMK 115-PMK.03-2021.pdf',
    halaman: 85,
    ukuranByte: 7031454,
  },
  {
    judul: 'PP 5/2015',
    berkas: 'PP 5-2015.pdf',
    halaman: 54,
    ukuranByte: 985693,
  },
  {
    judul: 'PP 68/2020',
    berkas: 'PP 68-2020.pdf',
    halaman: 14,
    ukuranByte: 701139,
  },
  {
    judul: 'Perdirut RRI 1/2023',
    berkas: 'Perdirut RRI 1-2023.pdf',
    halaman: 68,
    ukuranByte: 8748096,
  },
  {
    judul: 'Perdirut RRI 5/2023',
    berkas: 'Perdirut RRI 5-2023.pdf',
    halaman: 71,
    ukuranByte: 12945043,
  },
  {
    judul: 'Perdirut RRI 11/2023',
    berkas: 'Perdirut RRI 11-2023.pdf',
    halaman: 26,
    ukuranByte: 6068314,
  },
  {
    judul: 'Pedoman LPU 2019',
    berkas: 'Pedoman LPU 2019.pdf',
    halaman: 94,
    ukuranByte: 4320139,
  },
  {
    judul: 'Pedoman LPU 2023',
    berkas: 'Pedoman LPU 2023.pdf',
    halaman: 53,
    ukuranByte: 10592785,
  },
  {
    judul: 'Juknis PNBP Perdirut 13/2025',
    berkas: 'Juknis PNBP Perdirut 13-2025.pdf',
    halaman: 59,
    ukuranByte: 2654753,
  },
];

/**
 * Tautan unduh satu artikel KB (PR #50, 16/11/2026): pakai `tautan` artikel
 * bila ada; bila tidak ada — mis. artikel regulasi yang sudah di-seed ke
 * Firestore sebelum PR #50, saat tautan belum tersimpan di data — cari
 * berkasnya dari daftar kanonis lewat judul. Mengembalikan undefined bila
 * tidak ada berkas yang cocok (tombol Download tidak tampil).
 */
export function tautanUnduhArtikel(a: {
  judul: string;
  tautan?: string;
}): string | undefined {
  if (a.tautan) return a.tautan;
  const d = DOKUMEN_REGULASI.find((x) => x.judul === a.judul);
  return d ? urlDokumenRegulasi(d.berkas) : undefined;
}

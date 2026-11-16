// Daftar kanonis dokumen lengkap Knowledge Base — tab Document, Resources
// (PR #49, 16/11/2026; PR #50: tab Document digabung ke Knowledge Base).
// Berkas PDF disimpan di Google Drive, folder "RRI Deals - Dokumen
// Regulasi" (PR #51, 16/11/2026) — unggah via GitHub web UI GAGAL
// ("Commit failed — file is too large"), jadi tautan TIDAK LAGI menunjuk
// ke /dokumen/<nama-berkas> di repo. Tiap berkas dibagikan "Anyone with
// the link" (reader); bila berbagi dimatikan, tautan rusak. Tombol di
// tabel KB ("View") membuka PREVIEW Drive (webViewLink); tautan unduh
// langsung (webContentLink) disimpan sebagai fallback (urlUnduhDrive)
// dan TIDAK dipakai tombol utama di tabel.
//
// Metadata di bawah adalah nilai SEBENARNYA dari berkas (pdfinfo + stat,
// 16/11/2026) — jangan diubah tanpa memeriksa ulang berkasnya. ID Drive
// di bawah disalin persis dari ~/workspace/dokumen-regulasi-drive.md.

/** Satu dokumen lengkap yang bisa dilihat dari tab Knowledge Base. */
export interface DokumenRegulasi {
  /** Nama regulasi (Bahasa Indonesia, sesuai nama berkas). */
  judul: string;
  /** Nama berkas persis seperti di Google Drive. */
  berkas: string;
  /** Jumlah halaman (pdfinfo). */
  halaman: number;
  /** Ukuran berkas dalam byte (stat). */
  ukuranByte: number;
  /** ID berkas Google Drive (folder "RRI Deals - Dokumen Regulasi"). */
  driveId: string;
}

/** Tautan preview Google Drive (webViewLink) satu berkas. */
export function urlLihatDrive(driveId: string): string {
  return `https://drive.google.com/file/d/${driveId}/view?usp=drivesdk`;
}

/** Tautan unduh langsung Google Drive (webContentLink) — fallback. */
export function urlUnduhDrive(driveId: string): string {
  return `https://drive.google.com/uc?id=${driveId}&export=download`;
}

/**
 * Tautan dokumen satu berkas (preview Google Drive) — dipakai artikel KB
 * (`tautan`): tombol "View" di tabel KB dan "Open document" di kartu
 * detail sama-sama membuka preview ini; tombol download ada di dalam
 * preview Drive.
 */
export function urlDokumenRegulasi(berkas: string): string {
  const d = DOKUMEN_REGULASI.find((x) => x.berkas === berkas);
  return d ? urlLihatDrive(d.driveId) : '';
}

export const DOKUMEN_REGULASI: DokumenRegulasi[] = [
  {
    judul: 'PMK 115/PMK.03/2021',
    berkas: 'PMK 115-PMK.03-2021.pdf',
    halaman: 85,
    ukuranByte: 7031454,
    driveId: '17mLmWqjyWzgK5wh7GcWW2kyFmt5olGQs',
  },
  {
    judul: 'PP 5/2015',
    berkas: 'PP 5-2015.pdf',
    halaman: 54,
    ukuranByte: 985693,
    driveId: '1ZEXSEy-FKEcCGE5D7V27G0UDi_g6dBjT',
  },
  {
    judul: 'PP 68/2020',
    berkas: 'PP 68-2020.pdf',
    halaman: 14,
    ukuranByte: 701139,
    driveId: '1aB-zvEo2WRidLjwaGM4RcrUy1EefGadW',
  },
  {
    judul: 'Perdirut RRI 1/2023',
    berkas: 'Perdirut RRI 1-2023.pdf',
    halaman: 68,
    ukuranByte: 8748096,
    driveId: '1igH8Leo4E2qOtnXBO7cmF0KknIYiPbT-',
  },
  {
    judul: 'Perdirut RRI 5/2023',
    berkas: 'Perdirut RRI 5-2023.pdf',
    halaman: 71,
    ukuranByte: 12945043,
    driveId: '118jqKJ1SjW56fImM9QBXnRekfFiExUx9',
  },
  {
    judul: 'Perdirut RRI 11/2023',
    berkas: 'Perdirut RRI 11-2023.pdf',
    halaman: 26,
    ukuranByte: 6068314,
    driveId: '1k176UfoWp9FTrlRvXpBO5HfrOi3W0-6D',
  },
  {
    judul: 'Pedoman LPU 2019',
    berkas: 'Pedoman LPU 2019.pdf',
    halaman: 94,
    ukuranByte: 4320139,
    driveId: '1H8WCzkZFi2Zv9CmE-R2UWR-QHdomdXB2',
  },
  {
    judul: 'Pedoman LPU 2023',
    berkas: 'Pedoman LPU 2023.pdf',
    halaman: 53,
    ukuranByte: 10592785,
    driveId: '1xi0WeLdA-0IyyZc42jcRpeNBMkbsSRRm',
  },
  {
    judul: 'Juknis PNBP Perdirut 13/2025',
    berkas: 'Juknis PNBP Perdirut 13-2025.pdf',
    halaman: 59,
    ukuranByte: 2654753,
    driveId: '1jwqBV2ECzyXZA_XaTD0Gey8qs0SBLl1a',
  },
];

/**
 * Tautan satu artikel KB (PR #50, 16/11/2026; PR #51: tautan kini
 * preview Google Drive): pakai `tautan` artikel bila ada; bila tidak
 * ada — mis. artikel regulasi yang sudah di-seed ke Firestore sebelum
 * PR #50, saat tautan belum tersimpan di data — cari berkasnya dari
 * daftar kanonis lewat judul. Mengembalikan undefined bila tidak ada
 * berkas yang cocok (tombol View tidak tampil).
 */
export function tautanUnduhArtikel(a: {
  judul: string;
  tautan?: string;
}): string | undefined {
  if (a.tautan) return a.tautan;
  const d = DOKUMEN_REGULASI.find((x) => x.judul === a.judul);
  return d ? urlDokumenRegulasi(d.berkas) : undefined;
}

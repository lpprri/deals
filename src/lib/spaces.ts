// Struktur data lahan publik untuk Rent a Space di landing page.
// ============================================================
// DAFTAR_LAHAN_PUBLIK SENGAJA KOSONG — belum ada lahan yang
// dipublikasikan.
//
// Tiap satker nantinya mempublikasikan lahan (tarif estimasi, foto,
// luas, cocok untuk kegiatan usaha apa) lewat data master; sampai
// saat itu UI menampilkan empty state jujur ("belum ada lahan yang
// dipublikasikan") beserta tombol pengajuan umum.
//
// JANGAN isi array ini dengan data karangan: tidak ada lahan, tarif,
// foto, atau kota fiktif yang boleh tampil sebagai lahan nyata.
// Bila suatu hari array terisi, UI di Layanan.tsx sudah menulis
// render kartu lahan (guard `DAFTAR_LAHAN_PUBLIK.length > 0`).
// ============================================================

export interface LahanPublik {
  id: string;
  /** Nama satker persis seperti di DAFTAR_SATKER. */
  satker: string;
  nama: string;
  /** Luas lahan dalam meter persegi. */
  luasM2: number;
  /** Tarif ESTIMASI (Rp). Opsional bila satker belum menetapkan. */
  tarifEstimasi?: number;
  /** Jenis kegiatan usaha yang cocok untuk lahan ini. */
  cocokUntuk: string[];
  /** Foto lahan (data URI), bila satker mengunggahnya. */
  fotoDataUri?: string;
  /** Tanggal publikasi (ISO 'yyyy-mm-dd'). */
  dipublikasikanPada?: string;
}

export const DAFTAR_LAHAN_PUBLIK: LahanPublik[] = [];

// Rencana migrasi MoU ke Firestore (impor MoU 19/11/2026) — logika
// MURNI, tanpa Firebase. Dipisah dari src/lib/migrasiMou.ts supaya bisa
// diuji lewat skrip cek (Node) tanpa menarik Firebase SDK — pola yang
// sama dengan remigrasiRencana.ts (murni) vs remigrasi.ts (Firebase).
//
// LATAR: panel Memorandum of Understanding membaca koleksi `mou` yang
// TERPISAH dari kontrak (keputusan pengguna 19/11/2026). Seed
// (src/lib/seedMou.ts) berisi 44 record dari file pengguna
// "Rekapitulasi_Nota_Kesepahaman.xlsx", tapi data LIVE di Firestore
// belum punya koleksi `mou` sama sekali. Migrasi ini menulis 44 record
// itu ke live — SATU koleksi saja, tidak ada yang dihapus.
//
// ATURAN YANG TIDAK BOLEH DILANGGAR modul ini:
// - Cakupan PERSIS 1 koleksi: `mou`. Koleksi lain tidak pernah disentuh.
// - Prakondisi: live `mou` HARUS 0 dokumen. Bila sudah ada record,
//   batalkan SEBELUM menulis apa pun (migrasi hanya jalan sekali;
//   guard `meta/migrasi-mou-2026` juga mencegah jalan dua kali).
// - Total kontrak PNBP TIDAK BOLEH berubah: 42 kontrak, nilai
//   Rp441.863.375 (verifikasi sesudah migrasi memakai seed).
// - Semua 44 baris adalah MoU meski label JENIS berbeda (26 Nota
//   Kesepahaman, 17 Perjanjian Kerjasama, 1 Pelaksanaan Kerja Sama).

import type { AppData, Mou } from './types';

/** Koleksi yang ditulis migrasi MoU — PERSIS satu ini. */
export const KOLEKSI_MIGRASI_MOU = ['mou'] as const;

export type KunciMigrasiMou = (typeof KOLEKSI_MIGRASI_MOU)[number];

/** Id dokumen guard migrasi MoU di bawah `meta/` (terpisah dari `meta/migrasi` dan `meta/migrasi-kontrak-2026`). */
export const ID_GUARD_MIGRASI_MOU = 'migrasi-mou-2026';
/** Id dokumen guard migrasi pertama — guard baru TIDAK BOLEH sama dengan ini. */
export const ID_GUARD_MIGRASI_PERTAMA = 'migrasi';
/** Id dokumen guard re-migrasi kontrak — guard baru TIDAK BOLEH sama dengan ini. */
export const ID_GUARD_REMIGRASI_KONTRAK = 'migrasi-kontrak-2026';

/** Jumlah record MoU yang diharapkan (seed, 44 baris file pengguna). */
export const JUMLAH_MOU_SEED = 44;

/** Rincian JENIS yang diharapkan (label asli file, semua adalah MoU). */
export const JENIS_MOU_DIHARAPKAN: Record<string, number> = {
  'Nota Kesepahaman': 26,
  'Perjanjian Kerjasama': 17,
  'Pelaksanaan Kerja Sama': 1,
};

/** Total kontrol kontrak PNBP — TIDAK BOLEH berubah oleh migrasi MoU. */
export const TOTAL_KONTROL_KONTRAK = {
  jumlahKontrak: 42,
  nilaiKontrak: 441863375,
} as const;

/**
 * Periksa prakondisi: live `mou` harus 0 dokumen. Kembalikan daftar
 * masalah (kosong = lolos).
 */
export function periksaPrakondisiMou(jumlahLiveMou: number): string[] {
  if (jumlahLiveMou !== 0) {
    return [
      `Live mou already has ${jumlahLiveMou} documents, expected 0 — MoU migration already ran or live data changed; migration cancelled.`,
    ];
  }
  return [];
}

/**
 * Verifikasi hasil migrasi MoU atas data lengkap (live yang dibaca ulang
 * + kontrak dari seed). Kembalikan daftar masalah (kosong = lolos):
 * 44 record MoU, rincian JENIS, id unik, semua field wajib terisi, dan
 * total kontrak PNBP tidak berubah.
 */
export function verifikasiHasilMou(data: Pick<AppData, 'mou' | 'kontrak'>): string[] {
  const masalah: string[] = [];
  const daftar = data.mou;
  if (daftar.length !== JUMLAH_MOU_SEED) {
    masalah.push(`mou has ${daftar.length} documents, expected ${JUMLAH_MOU_SEED}.`);
  }
  const idUnik = new Set(daftar.map((m) => m.id));
  if (idUnik.size !== daftar.length) {
    masalah.push(`mou has duplicate ids (${daftar.length - idUnik.size} duplicates).`);
  }
  const jenisHitung: Record<string, number> = {};
  for (const m of daftar) {
    jenisHitung[m.jenis] = (jenisHitung[m.jenis] ?? 0) + 1;
  }
  for (const [jenis, diharapkan] of Object.entries(JENIS_MOU_DIHARAPKAN)) {
    if ((jenisHitung[jenis] ?? 0) !== diharapkan) {
      masalah.push(
        `mou jenis '${jenis}' has ${jenisHitung[jenis] ?? 0} records, expected ${diharapkan}.`,
      );
    }
  }
  const wajib: (keyof Mou)[] = [
    'id',
    'jenis',
    'instansi',
    'kategori',
    'judul',
    'tanggalTandaTangan',
    'tanggalMulai',
    'tanggalSelesai',
    'masaBerlaku',
  ];
  for (const m of daftar) {
    for (const field of wajib) {
      if (!m[field] || (typeof m[field] === 'string' && m[field].trim() === '')) {
        masalah.push(`mou ${m.id || '(tanpa id)'} is missing ${field}.`);
      }
    }
    if (m.satker?.kode !== '41') {
      masalah.push(`mou ${m.id} has satker ${m.satker?.kode ?? '(kosong)'}, expected 41.`);
    }
  }
  if (data.kontrak.length !== TOTAL_KONTROL_KONTRAK.jumlahKontrak) {
    masalah.push(
      `kontrak has ${data.kontrak.length} documents, expected ${TOTAL_KONTROL_KONTRAK.jumlahKontrak} — MoU migration must not touch contracts.`,
    );
  }
  const nilaiKontrak = data.kontrak.reduce((s, k) => s + (k.nilaiKontrak ?? 0), 0);
  if (nilaiKontrak !== TOTAL_KONTROL_KONTRAK.nilaiKontrak) {
    masalah.push(
      `nilaiKontrak is Rp${nilaiKontrak.toLocaleString('id-ID')}, expected Rp${TOTAL_KONTROL_KONTRAK.nilaiKontrak.toLocaleString('id-ID')} — MoU migration must not touch contracts.`,
    );
  }
  return masalah;
}

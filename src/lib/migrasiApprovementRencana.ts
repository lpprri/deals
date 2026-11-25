// Rencana migrasi Approvement ke Firestore (surat persetujuan Media
// Partner, definisi pengguna 24/11/2026, PR #156) — logika MURNI,
// tanpa Firebase. Dipisah dari src/lib/migrasiApprovement.ts supaya
// bisa diuji lewat skrip cek (Node) tanpa menarik Firebase SDK — pola
// yang sama dengan migrasiMouRencana.ts vs migrasiMou.ts, dan
// migrasiCommitmentRencana.ts vs migrasiCommitment.ts.
//
// LATAR: panel Media Partner membaca koleksi `approvement` yang
// TERPISAH dari kontrak (keputusan pengguna 24/11/2026). Seed
// (src/lib/seedApprovement.ts) berisi 4 record DUMMY surat persetujuan
// Kepala RRI (2 organisasi mahasiswa + 2 komunitas), tapi data LIVE di
// Firestore belum punya koleksi `approvement` sama sekali (panel live
// menampilkan empty state yang jujur). Migrasi ini menulis 4 record
// itu ke live — SATU koleksi saja, tidak ada yang dihapus.
//
// ATURAN YANG TIDAK BOLEH DILANGGAR modul ini:
// - Cakupan PERSIS 1 koleksi: `approvement`. Koleksi lain tidak pernah disentuh.
// - Prakondisi: live `approvement` HARUS 0 dokumen. Bila sudah ada
//   record, batalkan SEBELUM menulis apa pun (migrasi hanya jalan
//   sekali; guard `meta/migrasi-approvement-2026` juga mencegah jalan
//   dua kali).
// - Total kontrak PNBP TIDAK BOLEH berubah: 42 kontrak, nilai
//   Rp441.863.375 (verifikasi sesudah migrasi memakai seed).
// - Seed adalah data DUMMY (semua nama klien berlabel "(Contoh)");
//   nilai kompensasi Rp0 untuk barter (3 record) + Rp2.500.000 tunai
//   (1 record); dokumen '—' semua (upload ditunda).

import type { AppData, Approvement } from './types';

/** Koleksi yang ditulis migrasi Approvement — PERSIS satu ini. */
export const KOLEKSI_MIGRASI_APPROVEMENT = ['approvement'] as const;

export type KunciMigrasiApprovement =
  (typeof KOLEKSI_MIGRASI_APPROVEMENT)[number];

/** Id dokumen guard migrasi Approvement di bawah `meta/` (terpisah dari `meta/migrasi`, `meta/migrasi-kontrak-2026`, `meta/migrasi-mou-2026`, dan `meta/migrasi-commitment-2026`). */
export const ID_GUARD_MIGRASI_APPROVEMENT = 'migrasi-approvement-2026';
/** Id dokumen guard migrasi pertama — guard baru TIDAK BOLEH sama dengan ini. */
export const ID_GUARD_MIGRASI_PERTAMA = 'migrasi';
/** Id dokumen guard re-migrasi kontrak — guard baru TIDAK BOLEH sama dengan ini. */
export const ID_GUARD_REMIGRASI_KONTRAK = 'migrasi-kontrak-2026';
/** Id dokumen guard migrasi MoU — guard baru TIDAK BOLEH sama dengan ini. */
export const ID_GUARD_MIGRASI_MOU = 'migrasi-mou-2026';
/** Id dokumen guard migrasi Commitment — guard baru TIDAK BOLEH sama dengan ini. */
export const ID_GUARD_MIGRASI_COMMITMENT = 'migrasi-commitment-2026';

/** Jumlah record Approvement yang diharapkan (seed, 4 surat persetujuan dummy). */
export const JUMLAH_APPROVEMENT_SEED = 4;

/** Tanggal seed Approvement dibuat (24/11/2026, PR #156) — ditulis sebagai tanggalImporAsal di dokumen guard. */
export const TANGGAL_SEED_APPROVEMENT = '2026-11-24';

/** Nomor surat persetujuan yang diharapkan, per id record. */
export const NOMOR_SURAT_APPROVEMENT: Record<string, string> = {
  'APR-01': '001/RRI.PLB/MP/01/2026',
  'APR-02': '002/RRI.PLB/MP/02/2026',
  'APR-03': '003/RRI.PLB/MP/03/2026',
  'APR-04': '004/RRI.PLB/MP/05/2026',
};

/** Nilai kompensasi yang diharapkan (Rp), per id record. */
export const NILAI_KOMPENSASI_APPROVEMENT: Record<string, number> = {
  'APR-01': 0,
  'APR-02': 0,
  'APR-03': 0,
  'APR-04': 2500000,
};

/** Tanggal pelaksanaan yang diharapkan ('yyyy-mm-dd'), per id record. */
export const TANGGAL_PELAKSANAAN_APPROVEMENT: Record<string, string> = {
  'APR-01': '2026-03-14',
  'APR-02': '2026-04-20',
  'APR-03': '2026-05-10',
  'APR-04': '2026-06-06',
};

/** Rincian jenis klien yang diharapkan (2 organisasi mahasiswa + 2 komunitas). */
export const JENIS_KLIEN_DIHARAPKAN: Record<string, number> = {
  Mahasiswa: 2,
  Komunitas: 2,
};

/** Total nilai kompensasi semua record yang diharapkan (Rp) — 3x barter Rp0 + 1x tunai Rp2.500.000. */
export const TOTAL_NILAI_KOMPENSASI_DIHARAPKAN = 2500000;

/** Total kontrol kontrak PNBP — TIDAK BOLEH berubah oleh migrasi Approvement. */
export const TOTAL_KONTROL_KONTRAK = {
  jumlahKontrak: 42,
  nilaiKontrak: 441863375,
} as const;

/**
 * Periksa prakondisi: live `approvement` harus 0 dokumen. Kembalikan
 * daftar masalah (kosong = lolos).
 */
export function periksaPrakondisiApprovement(
  jumlahLiveApprovement: number,
): string[] {
  if (jumlahLiveApprovement !== 0) {
    return [
      `Live approvement already has ${jumlahLiveApprovement} documents, expected 0 — Approvement migration already ran or live data changed; migration cancelled.`,
    ];
  }
  return [];
}

/**
 * Verifikasi hasil migrasi Approvement atas data lengkap (live yang
 * dibaca ulang + kontrak dari seed). Kembalikan daftar masalah
 * (kosong = lolos): 4 record Approvement, id unik, semua field wajib
 * terisi, nomor surat + nilai kompensasi + tanggal pelaksanaan per
 * record, rincian jenis klien, total nilai kompensasi Rp2.500.000,
 * dokumen '—' semua, dan total kontrak PNBP tidak berubah.
 */
export function verifikasiHasilApprovement(
  data: Pick<AppData, 'approvement' | 'kontrak'>,
): string[] {
  const masalah: string[] = [];
  const daftar = data.approvement;
  if (daftar.length !== JUMLAH_APPROVEMENT_SEED) {
    masalah.push(
      `approvement has ${daftar.length} documents, expected ${JUMLAH_APPROVEMENT_SEED}.`,
    );
  }
  const idUnik = new Set(daftar.map((a) => a.id));
  if (idUnik.size !== daftar.length) {
    masalah.push(
      `approvement has duplicate ids (${daftar.length - idUnik.size} duplicates).`,
    );
  }
  const jenisHitung: Record<string, number> = {};
  for (const a of daftar) {
    jenisHitung[a.jenisKlien] = (jenisHitung[a.jenisKlien] ?? 0) + 1;
  }
  for (const [jenis, diharapkan] of Object.entries(JENIS_KLIEN_DIHARAPKAN)) {
    if ((jenisHitung[jenis] ?? 0) !== diharapkan) {
      masalah.push(
        `approvement jenis klien '${jenis}' has ${jenisHitung[jenis] ?? 0} records, expected ${diharapkan}.`,
      );
    }
  }
  const wajib: (keyof Approvement)[] = [
    'id',
    'nomorSurat',
    'namaKlien',
    'jenisKlien',
    'namaNarahubung',
    'tanggalPelaksanaan',
    'jenisKompensasi',
    'dokumen',
  ];
  for (const a of daftar) {
    for (const field of wajib) {
      if (!a[field] || (typeof a[field] === 'string' && a[field].trim() === '')) {
        masalah.push(`approvement ${a.id || '(tanpa id)'} is missing ${field}.`);
      }
    }
    const nomorSuratDiharapkan = NOMOR_SURAT_APPROVEMENT[a.id];
    if (nomorSuratDiharapkan !== undefined && a.nomorSurat !== nomorSuratDiharapkan) {
      masalah.push(
        `approvement ${a.id} has nomorSurat ${a.nomorSurat}, expected ${nomorSuratDiharapkan}.`,
      );
    }
    const nilaiDiharapkan = NILAI_KOMPENSASI_APPROVEMENT[a.id];
    if (nilaiDiharapkan !== undefined && a.nilaiKompensasi !== nilaiDiharapkan) {
      masalah.push(
        `approvement ${a.id} has nilaiKompensasi Rp${a.nilaiKompensasi.toLocaleString('id-ID')}, expected Rp${nilaiDiharapkan.toLocaleString('id-ID')}.`,
      );
    }
    if (a.nilaiKompensasi < 0) {
      masalah.push(
        `approvement ${a.id} has nilaiKompensasi negatif Rp${a.nilaiKompensasi.toLocaleString('id-ID')}.`,
      );
    }
    const tanggalDiharapkan = TANGGAL_PELAKSANAAN_APPROVEMENT[a.id];
    if (tanggalDiharapkan !== undefined && a.tanggalPelaksanaan !== tanggalDiharapkan) {
      masalah.push(
        `approvement ${a.id} has tanggalPelaksanaan ${a.tanggalPelaksanaan}, expected ${tanggalDiharapkan}.`,
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a.tanggalPelaksanaan)) {
      masalah.push(
        `approvement ${a.id} has tanggalPelaksanaan ${a.tanggalPelaksanaan}, expected format yyyy-mm-dd.`,
      );
    }
    if (a.dokumen !== '—') {
      masalah.push(
        `approvement ${a.id} has dokumen '${a.dokumen}', expected '—' (upload ditunda).`,
      );
    }
    if (!a.namaKlien.includes('(Contoh)')) {
      masalah.push(
        `approvement ${a.id} has namaKlien '${a.namaKlien}' tanpa label '(Contoh)' — seed Approvement adalah data dummy.`,
      );
    }
    if (a.satker?.kode !== '41') {
      masalah.push(
        `approvement ${a.id} has satker ${a.satker?.kode ?? '(kosong)'}, expected 41.`,
      );
    }
  }
  const totalSemua = daftar.reduce((s, a) => s + a.nilaiKompensasi, 0);
  if (totalSemua !== TOTAL_NILAI_KOMPENSASI_DIHARAPKAN) {
    masalah.push(
      `total nilai kompensasi is Rp${totalSemua.toLocaleString('id-ID')}, expected Rp${TOTAL_NILAI_KOMPENSASI_DIHARAPKAN.toLocaleString('id-ID')}.`,
    );
  }
  if (data.kontrak.length !== TOTAL_KONTROL_KONTRAK.jumlahKontrak) {
    masalah.push(
      `kontrak has ${data.kontrak.length} documents, expected ${TOTAL_KONTROL_KONTRAK.jumlahKontrak} — Approvement migration must not touch contracts.`,
    );
  }
  const nilaiKontrak = data.kontrak.reduce((s, k) => s + (k.nilaiKontrak ?? 0), 0);
  if (nilaiKontrak !== TOTAL_KONTROL_KONTRAK.nilaiKontrak) {
    masalah.push(
      `nilaiKontrak is Rp${nilaiKontrak.toLocaleString('id-ID')}, expected Rp${TOTAL_KONTROL_KONTRAK.nilaiKontrak.toLocaleString('id-ID')} — Approvement migration must not touch contracts.`,
    );
  }
  return masalah;
}

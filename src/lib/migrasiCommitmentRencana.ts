// Rencana migrasi Commitment ke Firestore (impor Commitment
// 19/11/2026) — logika MURNI, tanpa Firebase. Dipisah dari
// src/lib/migrasiCommitment.ts supaya bisa diuji lewat skrip cek (Node)
// tanpa menarik Firebase SDK — pola yang sama dengan
// remigrasiRencana.ts (murni) vs remigrasi.ts (Firebase), dan
// migrasiMouRencana.ts vs migrasiMou.ts.
//
// LATAR: panel Commitment membaca koleksi `commitment` yang TERPISAH
// dari kontrak (keputusan pengguna 19/11/2026, seperti MoU). Seed
// (src/lib/seedCommitment.ts) berisi 4 record dari file pengguna
// "Dukungan_Layanan_2026.xlsx", tapi data LIVE di Firestore belum
// punya koleksi `commitment` sama sekali. Migrasi ini menulis 4 record
// itu ke live — SATU koleksi saja, tidak ada yang dihapus.
//
// ATURAN YANG TIDAK BOLEH DILANGGAR modul ini:
// - Cakupan PERSIS 1 koleksi: `commitment`. Koleksi lain tidak pernah disentuh.
// - Prakondisi: live `commitment` HARUS 0 dokumen. Bila sudah ada
//   record, batalkan SEBELUM menulis apa pun (migrasi hanya jalan
//   sekali; guard `meta/migrasi-commitment-2026` juga mencegah jalan
//   dua kali).
// - Total kontrak PNBP TIDAK BOLEH berubah: 42 kontrak, nilai
//   Rp441.863.375 (verifikasi sesudah migrasi memakai seed).
// - Total dukungan Rp16.600.000 (4 mitra; cocok dengan REKAPITULASI
//   file). PERHATIAN TANGGAL: nama file menyebut 2026, tapi data
//   kegiatan adalah 13 Maret 2024 — disimpan 2024-03-13 apa adanya.

import type { AppData, Commitment } from './types';

/** Koleksi yang ditulis migrasi Commitment — PERSIS satu ini. */
export const KOLEKSI_MIGRASI_COMMITMENT = ['commitment'] as const;

export type KunciMigrasiCommitment =
  (typeof KOLEKSI_MIGRASI_COMMITMENT)[number];

/** Id dokumen guard migrasi Commitment di bawah `meta/` (terpisah dari `meta/migrasi`, `meta/migrasi-kontrak-2026`, dan `meta/migrasi-mou-2026`). */
export const ID_GUARD_MIGRASI_COMMITMENT = 'migrasi-commitment-2026';
/** Id dokumen guard migrasi pertama — guard baru TIDAK BOLEH sama dengan ini. */
export const ID_GUARD_MIGRASI_PERTAMA = 'migrasi';
/** Id dokumen guard re-migrasi kontrak — guard baru TIDAK BOLEH sama dengan ini. */
export const ID_GUARD_REMIGRASI_KONTRAK = 'migrasi-kontrak-2026';
/** Id dokumen guard migrasi MoU — guard baru TIDAK BOLEH sama dengan ini. */
export const ID_GUARD_MIGRASI_MOU = 'migrasi-mou-2026';

/** Jumlah record Commitment yang diharapkan (seed, 4 mitra file pengguna). */
export const JUMLAH_COMMITMENT_SEED = 4;

/** Total dukungan per mitra yang diharapkan (Rp). */
export const TOTAL_DUKUNGAN_PER_MITRA: Record<string, number> = {
  '001/RRI.PLB/PKS.DL/03/2024': 3000000,
  '002/RRI.PLB/PKS.DL/03/2024': 1500000,
  '003/RRI.PLB/PKS.DL/03/2024': 1900000,
  '004/RRI.PLB/PKS.DL/03/2024': 10200000,
};

/** Total dukungan semua mitra yang diharapkan (Rp) — sama dengan REKAPITULASI file. */
export const TOTAL_DUKUNGAN_DIHARAPKAN = 16600000;

/** Tanggal kegiatan yang diharapkan (13 Maret 2024 — data 2024 meski nama file 2026). */
export const TANGGAL_KEGIATAN_DIHARAPKAN = '2024-03-13';

/** Total kontrol kontrak PNBP — TIDAK BOLEH berubah oleh migrasi Commitment. */
export const TOTAL_KONTROL_KONTRAK = {
  jumlahKontrak: 42,
  nilaiKontrak: 441863375,
} as const;

/**
 * Periksa prakondisi: live `commitment` harus 0 dokumen. Kembalikan
 * daftar masalah (kosong = lolos).
 */
export function periksaPrakondisiCommitment(jumlahLiveCommitment: number): string[] {
  if (jumlahLiveCommitment !== 0) {
    return [
      `Live commitment already has ${jumlahLiveCommitment} documents, expected 0 — Commitment migration already ran or live data changed; migration cancelled.`,
    ];
  }
  return [];
}

/**
 * Verifikasi hasil migrasi Commitment atas data lengkap (live yang
 * dibaca ulang + kontrak dari seed). Kembalikan daftar masalah
 * (kosong = lolos): 4 record Commitment, id unik, semua field wajib
 * terisi, jumlah tiap item = qty x hargaSatuan, jumlah item = total
 * per mitra, total dukungan Rp16.600.000, tanggal kegiatan 2024-03-13,
 * dan total kontrak PNBP tidak berubah.
 */
export function verifikasiHasilCommitment(
  data: Pick<AppData, 'commitment' | 'kontrak'>,
): string[] {
  const masalah: string[] = [];
  const daftar = data.commitment;
  if (daftar.length !== JUMLAH_COMMITMENT_SEED) {
    masalah.push(
      `commitment has ${daftar.length} documents, expected ${JUMLAH_COMMITMENT_SEED}.`,
    );
  }
  const idUnik = new Set(daftar.map((c) => c.id));
  if (idUnik.size !== daftar.length) {
    masalah.push(
      `commitment has duplicate ids (${daftar.length - idUnik.size} duplicates).`,
    );
  }
  for (const [id, diharapkan] of Object.entries(TOTAL_DUKUNGAN_PER_MITRA)) {
    const rec = daftar.find((c) => c.id === id);
    if (!rec) {
      masalah.push(`commitment is missing record ${id}.`);
      continue;
    }
    if (rec.totalDukungan !== diharapkan) {
      masalah.push(
        `commitment ${id} has totalDukungan Rp${rec.totalDukungan.toLocaleString('id-ID')}, expected Rp${diharapkan.toLocaleString('id-ID')}.`,
      );
    }
  }
  const wajib: (keyof Commitment)[] = [
    'id',
    'kegiatan',
    'tanggalKegiatan',
    'mitra',
    'penandatangan',
    'jabatanPenandatangan',
    'dokumen',
  ];
  for (const c of daftar) {
    for (const field of wajib) {
      if (!c[field] || (typeof c[field] === 'string' && c[field].trim() === '')) {
        masalah.push(`commitment ${c.id || '(tanpa id)'} is missing ${field}.`);
      }
    }
    if (c.tanggalKegiatan !== TANGGAL_KEGIATAN_DIHARAPKAN) {
      masalah.push(
        `commitment ${c.id} has tanggalKegiatan ${c.tanggalKegiatan}, expected ${TANGGAL_KEGIATAN_DIHARAPKAN}.`,
      );
    }
    if (c.layanan !== '—') {
      masalah.push(
        `commitment ${c.id} has layanan '${c.layanan}', expected '—' (empty in source).`,
      );
    }
    if (c.nilaiKonversi !== '—') {
      masalah.push(
        `commitment ${c.id} has nilaiKonversi '${c.nilaiKonversi}', expected '—' (empty in source).`,
      );
    }
    for (const item of c.dukungan) {
      if (item.qty * item.hargaSatuan !== item.jumlah) {
        masalah.push(
          `commitment ${c.id} item '${item.jenis}': qty ${item.qty} x Rp${item.hargaSatuan.toLocaleString('id-ID')} != jumlah Rp${item.jumlah.toLocaleString('id-ID')}.`,
        );
      }
    }
    const jumlahItem = c.dukungan.reduce((s, d) => s + d.jumlah, 0);
    if (jumlahItem !== c.totalDukungan) {
      masalah.push(
        `commitment ${c.id}: sum of item amounts Rp${jumlahItem.toLocaleString('id-ID')} != totalDukungan Rp${c.totalDukungan.toLocaleString('id-ID')}.`,
      );
    }
    if (c.satker?.kode !== '41') {
      masalah.push(
        `commitment ${c.id} has satker ${c.satker?.kode ?? '(kosong)'}, expected 41.`,
      );
    }
  }
  const totalSemua = daftar.reduce((s, c) => s + c.totalDukungan, 0);
  if (totalSemua !== TOTAL_DUKUNGAN_DIHARAPKAN) {
    masalah.push(
      `total dukungan is Rp${totalSemua.toLocaleString('id-ID')}, expected Rp${TOTAL_DUKUNGAN_DIHARAPKAN.toLocaleString('id-ID')}.`,
    );
  }
  if (data.kontrak.length !== TOTAL_KONTROL_KONTRAK.jumlahKontrak) {
    masalah.push(
      `kontrak has ${data.kontrak.length} documents, expected ${TOTAL_KONTROL_KONTRAK.jumlahKontrak} — Commitment migration must not touch contracts.`,
    );
  }
  const nilaiKontrak = data.kontrak.reduce((s, k) => s + (k.nilaiKontrak ?? 0), 0);
  if (nilaiKontrak !== TOTAL_KONTROL_KONTRAK.nilaiKontrak) {
    masalah.push(
      `nilaiKontrak is Rp${nilaiKontrak.toLocaleString('id-ID')}, expected Rp${TOTAL_KONTROL_KONTRAK.nilaiKontrak.toLocaleString('id-ID')} — Commitment migration must not touch contracts.`,
    );
  }
  return masalah;
}

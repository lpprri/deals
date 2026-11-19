// Rencana perbaikan satu kali record MoU 037 (19/11/2026) — logika
// MURNI, tanpa Firebase. Dipisah dari src/lib/perbaikanMou037.ts supaya
// bisa diuji lewat skrip cek (Node) tanpa menarik Firebase SDK — pola
// yang sama dengan migrasiMouRencana.ts (murni) vs migrasiMou.ts.
//
// LATAR: impor MoU (PR #116) sudah merge dan migrasi MoU sudah
// dijalankan pengguna — panel MoU menampilkan 44 record live. Setelah
// itu pengguna meminta (19/11/2026 14:41 WIB): PIC record
// 037/RRI-PLB/KJM.02.04/09/2026 menjadi 'Ja'far' (di sumber PIC-nya
// kosong, '—') dan nama instansinya dibersihkan dari backtick nyasar
// di akhir. Seed sudah diperbaiki lewat scripts/impor-mou.py
// (KOREKSI_037), tapi data LIVE di Firestore masih menyimpan nilai lama
// — patch ini menulis nilai baru itu ke dokumen live 037.
//
// ATURAN YANG TIDAK BOLEH DILANGGAR modul ini:
// - Cakupan PERSIS 1 dokumen: `mou/037/RRI-PLB/KJM.02.04/09/2026`
//   (id dokumen di-encode seperti id kontrak). Dokumen lain TIDAK
//   PERNAH disentuh, koleksi lain TIDAK PERNAH disentuh.
// - Hanya 2 field yang ditulis: `pic` dan `instansi`. Field lain
//   (termasuk `satker`) tidak diubah.
// - Sekali jalan: prakondisi MENOLAK bila dokumen 037 sudah
//   bernilai baru (sudah diperbaiki), bila dokumen tidak ditemukan,
//   atau bila nilai live-nya TIDAK SAMA dengan nilai lama yang
//   diharapkan (data berubah di luar dugaan — jangan sentuh).
// - TIDAK ADA dokumen guard `meta/` baru: firestore.rules hanya
//   mengizinkan tiga dokumen guard bernama (migrasi, migrasi-kontrak-2026,
//   migrasi-mou-2026), jadi guard baru butuh publish rules. Perlindungan
//   jalan-dua-kali berasal dari prakondisi nilai live di atas, BUKAN
//   dari guard — patch ini TIDAK butuh publish rules sebelum merge.
// - Total kontrak PNBP TIDAK BOLEH berubah: 42 kontrak, nilai
//   Rp441.863.375 (patch tidak menyentuh kontrak sama sekali).

import type { Mou } from './types';

/** Id record MoU yang diperbaiki (nomor dokumen). */
export const ID_MOU_037 = '037/RRI-PLB/KJM.02.04/09/2026';

/** Nilai PIC lama di live (kosong di sumber) dan nilai barunya. */
export const PIC_MOU_037_LAMA = '—';
export const PIC_MOU_037_BARU = "Ja'far";

/** Nama instansi lama (backtick nyasar di akhir) dan yang dibersihkan. */
export const INSTANSI_MOU_037_LAMA = 'Komunitas Wirausaha Tangan Di Atas`';
export const INSTANSI_MOU_037_BARU = 'Komunitas Wirausaha Tangan Di Atas';

/** Nilai baru yang ditulis ke dokumen 037 — PERSIS 2 field ini. */
export const PERBAIKAN_MOU_037: Pick<Mou, 'pic' | 'instansi'> = {
  pic: PIC_MOU_037_BARU,
  instansi: INSTANSI_MOU_037_BARU,
};

/** Bentuk minimal dokumen live 037 yang dibaca patch (null = tidak ada). */
export type DokumenMou037Live = Pick<Mou, 'id' | 'pic' | 'instansi'> | null;

/**
 * Periksa prakondisi SEBELUM menulis apa pun. Kembalikan daftar
 * masalah (kosong = lolos):
 * - dokumen 037 harus ada di live;
 * - bila sudah bernilai baru -> SUDAH diperbaiki, tolak (sekali jalan);
 * - bila nilainya bukan nilai lama yang diharapkan -> data berubah di
 *   luar dugaan, tolak (jangan sentuh).
 */
export function periksaPrakondisiPerbaikanMou037(
  dok: DokumenMou037Live,
): string[] {
  if (!dok) {
    return [
      `Live mou document ${ID_MOU_037} not found — the one-off fix cannot run.`,
    ];
  }
  const sudahPic = dok.pic === PIC_MOU_037_BARU;
  const sudahInstansi = dok.instansi === INSTANSI_MOU_037_BARU;
  if (sudahPic && sudahInstansi) {
    return [
      `MoU ${ID_MOU_037} is already fixed (PIC Ja'far, clean institution name) — the one-off fix refuses to run twice.`,
    ];
  }
  if (dok.pic !== PIC_MOU_037_LAMA || dok.instansi !== INSTANSI_MOU_037_LAMA) {
    return [
      `Live mou ${ID_MOU_037} has unexpected values (PIC '${dok.pic}', institution '${dok.instansi}') — expected PIC '—' and the institution name with a trailing backtick. Fix cancelled; nothing was written.`,
    ];
  }
  return [];
}

/**
 * Verifikasi hasil patch atas dokumen yang dibaca ulang dari live.
 * Kembalikan daftar masalah (kosong = lolos): pic dan instansi harus
 * bernilai baru.
 */
export function verifikasiHasilPerbaikanMou037(
  dok: DokumenMou037Live,
): string[] {
  const masalah: string[] = [];
  if (!dok) {
    masalah.push(`Live mou document ${ID_MOU_037} not found after the fix.`);
    return masalah;
  }
  if (dok.pic !== PIC_MOU_037_BARU) {
    masalah.push(
      `MoU ${ID_MOU_037} has PIC '${dok.pic}', expected '${PIC_MOU_037_BARU}'.`,
    );
  }
  if (dok.instansi !== INSTANSI_MOU_037_BARU) {
    masalah.push(
      `MoU ${ID_MOU_037} has institution '${dok.instansi}', expected '${INSTANSI_MOU_037_BARU}'.`,
    );
  }
  return masalah;
}

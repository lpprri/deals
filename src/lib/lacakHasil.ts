// Fungsi murni untuk hasil Cloud Function `lacakKerjaSama` — TANPA
// dependensi Firebase, supaya bisa diuji lewat skrip cek tanpa menarik
// Firebase SDK ke dalam bundle Node (cek-lacak-function.ts).
// Pemanggilan Function-nya sendiri ada di lacakFunction.ts.

import type {
  DokumenItem,
  Klien,
  Kontrak,
  Pembayaran,
  Tagihan,
} from './types';
import type { HasilLacak } from '../modules/Lacak';

/** Normalisasi kode untuk Function: buang spasi ujung, huruf besar. */
export function normalisasiKodeFunction(kode: string): string {
  return kode.trim().toUpperCase();
}

function objekDenganString(
  nilai: unknown,
  kunci: string[],
): Record<string, unknown> | null {
  if (typeof nilai !== 'object' || nilai === null) return null;
  const obj = nilai as Record<string, unknown>;
  if (!kunci.every((k) => typeof obj[k] === 'string')) return null;
  return obj;
}

/**
 * Validasi + pemetaan payload Function ke HasilLacak. Mengembalikan null
 * bila payload tidak ditemukan (ditemukan !== true) atau tidak berbentuk
 * (kontrak tanpa id/nomorPks, atau daftar terkait bukan array).
 * `klien` boleh null (klien belum tercatat) — pemanggil memakai fallback
 * nama dari data seed bila ada.
 */
export function normalisasiHasilLacakFunction(
  payload: unknown,
): HasilLacak | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const p = payload as Record<string, unknown>;
  if (p.ditemukan !== true) return null;
  const kontrak = objekDenganString(p.kontrak, ['id', 'nomorPks']);
  if (!kontrak) return null;
  if (
    !Array.isArray(p.tagihan) ||
    !Array.isArray(p.dokumen) ||
    !Array.isArray(p.pembayaran)
  ) {
    return null;
  }
  const klien =
    p.klien === null || p.klien === undefined
      ? null
      : objekDenganString(p.klien, ['id', 'nama']);
  return {
    kontrak: p.kontrak as Kontrak,
    klien: (klien as Klien | null) ?? null,
    tagihan: p.tagihan as Tagihan[],
    dokumen: p.dokumen as DokumenItem[],
    pembayaran: p.pembayaran as Pembayaran[],
  };
}

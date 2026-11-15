// Pemanggilan Cloud Function `lacakKerjaSama` dari halaman publik Lacak
// (wiring PR #29). Function adalah SATU jalur lengkap Lacak di mode
// Firestore: lookup nomor PKS / nomor tagihan + daftar terkait (tagihan,
// dokumen, pembayaran, klien) untuk SATU kontrak itu saja — tanpa login,
// tanpa jalan mendaftar kontrak lain.
//
// ATURAN YANG DICATAT:
// - Kode dinormalisasi ke HURUF BESAR sebelum dikirim: kode tersimpan
//   memakai huruf besar, dan lookup Function bersifat case-sensitive
//   (lihat komentar di functions/index.js). Ini menjaga perilaku
//   case-insensitive yang sama dengan cariKerjaSama (seed).
// - `lacakViaFunction` MELEMPAR bila Function tidak bisa dihubungi
//   (belum di-deploy / galat jaringan / tidak ditemukan di region) —
//   pemanggil memakai ini untuk fallback ke data seed + catatan jujur.
//   "Nomor tidak ditemukan" (ditemukan: false) BUKAN galat: hasilnya
//   null dan pemanggil menampilkan pesan tidak ditemukan.
// - Modul ini sengaja di-import LAZY dari Lacak.tsx (import dinamis di
//   handler) supaya halaman publik tidak menarik Firebase SDK sebelum
//   pencarian live — dan supaya skrip cek (yang mengimpor Lacak.tsx)
//   tidak ikut membundel Firebase SDK.

import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebaseApp';
import {
  normalisasiHasilLacakFunction,
  normalisasiKodeFunction,
} from './lacakHasil';
import type { HasilLacak } from '../modules/Lacak';

/**
 * Panggil Function dengan kode transaksi. Mengembalikan HasilLacak bila
 * ditemukan, null bila nomor tidak ditemukan. Melempar bila Function
 * tidak bisa dihubungi — pemanggil memutuskan fallback.
 */
export async function lacakViaFunction(
  kode: string,
): Promise<HasilLacak | null> {
  if (!app) {
    throw new Error('Firebase belum terkonfigurasi.');
  }
  const panggil = httpsCallable(
    getFunctions(app, 'asia-southeast2'),
    'lacakKerjaSama',
  );
  const hasil = await panggil({ kode: normalisasiKodeFunction(kode) });
  return normalisasiHasilLacakFunction(hasil.data);
}

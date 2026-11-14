// Migrasi satu kali data contoh ke Firestore — aktivasi Firebase
// (PRD v2.0 Final Bab 12, build ulang dari nol).
// KEPUTUSAN PENGGUNA 14 Nov 2026 21:29 WIB: hanya ada 1 role — Operator
// (Staf Layanan & Pengembangan Usaha). 6 peran dummy Q-01 TIDAK BERLAKU dan
// peran Admin Nasional TIDAK DIPAKAI tahap ini. Migrasi ini hanya men-seed
// SATU profil operator.
// Semua tulis lewat client SDK dengan kredensial pengguna yang login —
// JANGAN memakai Admin SDK atau service account. Tidak ada kredensial
// apa pun yang ditulis di file ini.

import {
  collection,
  doc,
  getDoc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { DATA_NYATA, TANGGAL_IMPOR } from './seedNyata';
import { SATKER_PILOT } from './master';
import {
  KOLEKSI,
  bersihkanUndefined,
  kodeIdDokumen,
} from './firestoreStore';
import type { AppData } from './types';

/** Email usulan akun operator — bisa diganti saat membuat akun Auth. */
export const EMAIL_OPERATOR_USULAN = 'operator@rri.go.id';

/** Batas tulis per batch Firestore adalah 500; pakai 450 agar aman. */
const MAKS_TULIS_PER_BATCH = 450;

export interface HasilMigrasi {
  tanggal: string;
  jumlahPerKoleksi: Record<string, number>;
}

/**
 * Menulis SELURUH isi DATA_NYATA ke Firestore, sekali saja.
 *
 * Guard sekali-jalan: bila dokumen `meta/migrasi` sudah ada, lempar Error
 * dan TIDAK menulis apa pun. Dokumen penanda ditulis dalam batch yang sama
 * dengan data, jadi penanda hanya ada bila seluruh tulis berhasil
 * (writeBatch bersifat atomik per batch).
 *
 * Juga men-seed SATU profil operator di `userProfiles/{email}`.
 */
export async function jalankanMigrasi(
  db: Firestore,
  operator: { nama: string; email: string },
): Promise<HasilMigrasi> {
  const refPenanda = doc(db, 'meta', 'migrasi');
  const penanda = await getDoc(refPenanda);
  if (penanda.exists()) {
    const tanggalLama =
      (penanda.data() as { tanggal?: string }).tanggal ?? 'tidak diketahui';
    throw new Error(
      `Migrasi sudah pernah dijalankan pada ${tanggalLama}. Migrasi hanya bisa dilakukan sekali.`,
    );
  }

  const tanggal = new Date().toISOString();
  const jumlahPerKoleksi: Record<string, number> = {};

  // Kumpulkan semua tulis dulu, lalu pecah per batch (maks 450 tulis).
  const tulis: { ref: ReturnType<typeof doc>; data: Record<string, unknown> }[] =
    [];
  for (const kunci of Object.keys(KOLEKSI) as (keyof AppData)[]) {
    const daftar = DATA_NYATA[kunci] as { id: string }[];
    jumlahPerKoleksi[KOLEKSI[kunci]] = daftar.length;
    for (const entitas of daftar) {
      if (!entitas.id) {
        throw new Error(
          `Data ${KOLEKSI[kunci]} mengandung entitas tanpa id — migrasi dibatalkan.`,
        );
      }
      tulis.push({
        // Id dokumen di-encode (kodeIdDokumen) — 42 id kontrak mengandung
        // '/' yang dilarang Firestore sebagai id dokumen. Lapisan data
        // (firestoreStore.ts) memakai pengodean yang sama saat membaca.
        ref: doc(collection(db, KOLEKSI[kunci]), kodeIdDokumen(entitas.id)),
        data: bersihkanUndefined(
          entitas as unknown as Record<string, unknown>,
        ),
      });
    }
  }

  // Profil SATU-SATUNYA operator (model 1 role).
  tulis.push({
    ref: doc(collection(db, 'userProfiles'), operator.email),
    data: {
      email: operator.email,
      nama: 'Operator Layanan & Pengembangan Usaha',
      jabatan: 'Staf Layanan & Pengembangan Usaha',
      peran: 'operator',
      satker: bersihkanUndefined(SATKER_PILOT),
    },
  });

  // Penanda sekali-jalan — ditulis terakhir dalam batch terakhir.
  tulis.push({
    ref: refPenanda,
    data: {
      tanggal,
      dimigrasiOleh: operator.nama,
      jumlahPerKoleksi,
      tanggalImporAsal: TANGGAL_IMPOR,
    },
  });

  for (let i = 0; i < tulis.length; i += MAKS_TULIS_PER_BATCH) {
    const batch = writeBatch(db);
    for (const t of tulis.slice(i, i + MAKS_TULIS_PER_BATCH)) {
      batch.set(t.ref, t.data);
    }
    await batch.commit();
  }

  return { tanggal, jumlahPerKoleksi };
}

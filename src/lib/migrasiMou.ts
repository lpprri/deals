// Migrasi MoU ke Firestore (impor MoU 19/11/2026).
//
// LATAR: panel Memorandum of Understanding membaca koleksi `mou` yang
// TERPISAH dari kontrak (keputusan pengguna 19/11/2026). Seed
// (src/lib/seedMou.ts) berisi 44 record dari file pengguna, tapi data
// LIVE di Firestore belum punya koleksi `mou`. Migrasi ini menulis 44
// record itu ke live — SATU koleksi saja, TIDAK ADA yang dihapus dan
// TIDAK ADA koleksi lain yang disentuh. Total kontrak PNBP tidak
// berubah (verifikasi sesudah migrasi mengeceknya).
//
// Semua tulis lewat client SDK dengan kredensial pengguna yang login —
// JANGAN memakai Admin SDK atau service account (sama seperti migrasi
// pertama, src/lib/migrasi.ts, dan re-migrasi, src/lib/remigrasi.ts).
//
// URUTAN (tiap tahap dilaporkan lewat onKemajuan; bila gagal di tengah,
// error menyebut tahap yang sedang diproses):
//   1. guard — bila `meta/migrasi-mou-2026` sudah ada, batal.
//   2. baca-live — baca koleksi `mou` live (filter satker).
//   3. prakondisi — live `mou` harus 0 dokumen; bila tidak, batal
//      SEBELUM menulis apa pun.
//   4. tulis — tulis 44 dokumen baru dari DATA_NYATA.mou; dokumen
//      guard ditulis dalam batch tulis TERAKHIR.
//   5. verifikasi — baca ulang `mou` + kontrak, cek 44 record +
//      rincian JENIS + total kontrak; bila gagal, lempar (guard sudah
//      terlanjur diset — JANGAN jalankan ulang; laporkan ke Digi).
//   6. audit — tulis SATU entri audit.
// Guard baru terpisah dari guard migrasi pertama (`meta/migrasi`) dan
// re-migrasi kontrak (`meta/migrasi-kontrak-2026`).
//
// PERHATIAN ATURAN: dokumen guard `meta/migrasi-mou-2026` butuh blok
// aturan sendiri di firestore.rules (seperti `meta/migrasi` dan
// `meta/migrasi-kontrak-2026`). Bila aturan itu belum dipublikasikan di
// console, cek guard gagal dengan 'Missing or insufficient
// permissions' — publikasikan dulu file firestore.rules terbaru, lalu
// jalankan migrasi MoU. Koleksi `mou` juga harus sudah ada di allowlist
// operator di firestore.rules sebelum merge PR ini (lihat PR body).

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { DATA_NYATA, TANGGAL_IMPOR } from './seedNyata';
import {
  KOLEKSI,
  bersihkanUndefined,
  kodeIdDokumen,
  tulisAudit,
} from './firestoreStore';
import { buatEntriAudit } from './audit';
import type { DummyUser } from './dummyUsers';
import type { AppData } from './types';
import {
  ID_GUARD_MIGRASI_MOU,
  JUMLAH_MOU_SEED,
  KOLEKSI_MIGRASI_MOU,
  periksaPrakondisiMou,
  verifikasiHasilMou,
  type KunciMigrasiMou,
} from './migrasiMouRencana';

/** Batas tulis per batch Firestore adalah 500; pakai 450 agar aman. */
const MAKS_TULIS_PER_BATCH = 450;

export type TahapMigrasiMou =
  | 'guard'
  | 'baca-live'
  | 'prakondisi'
  | 'tulis'
  | 'verifikasi'
  | 'audit'
  | 'selesai';

export interface KemajuanMigrasiMou {
  tahap: TahapMigrasiMou;
  /** Koleksi yang sedang diproses (tahap tulis). */
  koleksi?: KunciMigrasiMou;
  /** Jumlah koleksi yang sudah selesai diproses. */
  selesai: number;
  /** Jumlah koleksi dalam cakupan (selalu 1). */
  total: number;
}

export interface HasilMigrasiMou {
  tanggal: string;
  sebelum: { jumlahMou: number };
  sesudah: { jumlahMou: number };
  jumlahDitulis: number;
}

/** True bila migrasi MoU sudah pernah dijalankan (dokumen guard ada). */
export async function cekSudahMigrasiMou(db: Firestore): Promise<boolean> {
  const snap = await getDoc(doc(db, 'meta', ID_GUARD_MIGRASI_MOU));
  return snap.exists();
}

/** Status migrasi MoU + tanggalnya (bila sudah dijalankan). */
export async function bacaStatusMigrasiMou(
  db: Firestore,
): Promise<{ sudah: boolean; tanggal?: string; oleh?: string }> {
  const snap = await getDoc(doc(db, 'meta', ID_GUARD_MIGRASI_MOU));
  if (!snap.exists()) return { sudah: false };
  const data = snap.data() as { tanggal?: string; dimigrasiOleh?: string };
  return { sudah: true, tanggal: data.tanggal, oleh: data.dimigrasiOleh };
}

/**
 * Jalankan migrasi MoU penuh. Lempar Error (menyebut tahap) bila guard
 * sudah diset, prakondisi tidak terpenuhi, atau verifikasi gagal —
 * pemanggil (UI) menampilkan pesan itu apa adanya.
 */
export async function jalankanMigrasiMou(
  db: Firestore,
  pengguna: DummyUser,
  satkerKode: string,
  onKemajuan?: (k: KemajuanMigrasiMou) => void,
): Promise<HasilMigrasiMou> {
  const laporkan = (kemajuan: KemajuanMigrasiMou) => onKemajuan?.(kemajuan);

  // 1. Guard sekali-jalan (terpisah dari guard migrasi lain).
  laporkan({ tahap: 'guard', selesai: 0, total: KOLEKSI_MIGRASI_MOU.length });
  const refGuard = doc(db, 'meta', ID_GUARD_MIGRASI_MOU);
  const guard = await getDoc(refGuard);
  if (guard.exists()) {
    const tanggalLama =
      (guard.data() as { tanggal?: string }).tanggal ?? 'tidak diketahui';
    throw new Error(
      `MoU migration already ran on ${tanggalLama}. MoU migration can only be done once.`,
    );
  }

  // 2. Baca live + 3. prakondisi (SEBELUM menulis apa pun).
  laporkan({ tahap: 'baca-live', selesai: 0, total: KOLEKSI_MIGRASI_MOU.length });
  const snapLive = await getDocs(
    query(
      collection(db, KOLEKSI.mou),
      where('satker.kode', '==', satkerKode),
    ),
  );
  const sebelum = { jumlahMou: snapLive.size };
  laporkan({ tahap: 'prakondisi', selesai: 0, total: KOLEKSI_MIGRASI_MOU.length });
  const masalahPrakondisi = periksaPrakondisiMou(sebelum.jumlahMou);
  if (masalahPrakondisi.length > 0) {
    throw new Error(
      `Preconditions not met — MoU migration cancelled, nothing was written: ${masalahPrakondisi.join(' ')}`,
    );
  }

  const tanggal = new Date().toISOString();
  const daftar = DATA_NYATA.mou;
  if (daftar.length !== JUMLAH_MOU_SEED) {
    throw new Error(
      `Seed mou has ${daftar.length} records, expected ${JUMLAH_MOU_SEED} — MoU migration cancelled, nothing was written.`,
    );
  }

  // 4. Tulis — 44 dokumen + guard dalam batch terakhir.
  laporkan({ tahap: 'tulis', koleksi: 'mou', selesai: 0, total: 1 });
  try {
    for (let j = 0; j < daftar.length; j += MAKS_TULIS_PER_BATCH) {
      const batch = writeBatch(db);
      for (const entitas of daftar.slice(j, j + MAKS_TULIS_PER_BATCH)) {
        if (!entitas.id) {
          throw new Error('seed mou contains an entity without id');
        }
        batch.set(
          doc(collection(db, KOLEKSI.mou), kodeIdDokumen(entitas.id)),
          bersihkanUndefined(entitas as unknown as Record<string, unknown>),
        );
      }
      if (j + MAKS_TULIS_PER_BATCH >= daftar.length) {
        batch.set(refGuard, {
          tanggal,
          dimigrasiOleh: pengguna.nama,
          jumlahDitulis: JUMLAH_MOU_SEED,
          tanggalImporAsal: TANGGAL_IMPOR,
        });
      }
      await batch.commit();
    }
  } catch (e) {
    const pesan = e instanceof Error ? e.message : 'Unknown error.';
    throw new Error(
      `MoU migration failed mid-way (${pesan}) — live data may be partially written. Do NOT run again; report this to Digi.`,
    );
  }
  laporkan({ tahap: 'tulis', koleksi: 'mou', selesai: 1, total: 1 });

  // 5. Verifikasi — baca ulang dari Firestore, bukan dari memori.
  laporkan({ tahap: 'verifikasi', selesai: 1, total: 1 });
  const snapSesudah = await getDocs(
    query(
      collection(db, KOLEKSI.mou),
      where('satker.kode', '==', satkerKode),
    ),
  );
  const mouSesudah = snapSesudah.docs.map((d) => d.data());
  const snapKontrak = await getDocs(
    query(
      collection(db, KOLEKSI.kontrak),
      where('satker.kode', '==', satkerKode),
    ),
  );
  const masalahVerifikasi = verifikasiHasilMou({
    mou: mouSesudah as AppData['mou'],
    kontrak: snapKontrak.docs.map((d) => d.data()) as AppData['kontrak'],
  });
  if (masalahVerifikasi.length > 0) {
    throw new Error(
      `Verification after MoU migration FAILED — the guard is already set, so do NOT run again; report this to Digi: ${masalahVerifikasi.join(' ')}`,
    );
  }
  const sesudah = { jumlahMou: snapSesudah.size };

  // 6. SATU entri audit.
  laporkan({ tahap: 'audit', selesai: 1, total: 1 });
  const entri = buatEntriAudit(
    pengguna,
    'Migrasi Data MoU',
    'mou',
    ID_GUARD_MIGRASI_MOU,
    'live mou 0 records',
    `live mou ${sesudah.jumlahMou} records`,
  );
  await tulisAudit(db, entri);

  laporkan({ tahap: 'selesai', selesai: 1, total: 1 });
  return { tanggal, sebelum, sesudah, jumlahDitulis: sesudah.jumlahMou };
}

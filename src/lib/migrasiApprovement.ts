// Migrasi Approvement ke Firestore (surat persetujuan Media Partner,
// definisi pengguna 24/11/2026, PR #156).
//
// LATAR: panel Media Partner membaca koleksi `approvement` yang
// TERPISAH dari kontrak (keputusan pengguna 24/11/2026). Seed
// (src/lib/seedApprovement.ts) berisi 4 record DUMMY surat persetujuan
// Kepala RRI (2 organisasi mahasiswa + 2 komunitas), tapi data LIVE di
// Firestore belum punya koleksi `approvement` (panel live menampilkan
// empty state yang jujur). Migrasi ini menulis 4 record itu ke live —
// SATU koleksi saja, TIDAK ADA yang dihapus dan TIDAK ADA koleksi lain
// yang disentuh. Total kontrak PNBP tidak berubah (verifikasi sesudah
// migrasi mengeceknya).
//
// Semua tulis lewat client SDK dengan kredensial pengguna yang login —
// JANGAN memakai Admin SDK atau service account (sama seperti migrasi
// pertama, src/lib/migrasi.ts, re-migrasi, src/lib/remigrasi.ts,
// migrasi MoU, src/lib/migrasiMou.ts, dan migrasi Commitment,
// src/lib/migrasiCommitment.ts).
//
// URUTAN (tiap tahap dilaporkan lewat onKemajuan; bila gagal di tengah,
// error menyebut tahap yang sedang diproses):
//   1. guard — bila `meta/migrasi-approvement-2026` sudah ada, batal.
//   2. baca-live — baca koleksi `approvement` live (filter satker).
//   3. prakondisi — live `approvement` harus 0 dokumen; bila tidak, batal
//      SEBELUM menulis apa pun.
//   4. tulis — tulis 4 dokumen baru dari APPROVEMENT_DUMMY; dokumen
//      guard ditulis dalam batch tulis TERAKHIR.
//   5. verifikasi — baca ulang `approvement` + kontrak, cek 4 record +
//      rincian jenis klien + total nilai kompensasi Rp2.500.000 +
//      total kontrak; bila gagal, lempar (guard sudah terlanjur diset —
//      JANGAN jalankan ulang; laporkan ke Digi).
//   6. audit — tulis SATU entri audit.
// Guard baru terpisah dari guard migrasi pertama (`meta/migrasi`),
// re-migrasi kontrak (`meta/migrasi-kontrak-2026`), migrasi MoU
// (`meta/migrasi-mou-2026`), dan migrasi Commitment
// (`meta/migrasi-commitment-2026`).
//
// PERHATIAN ATURAN: dokumen guard `meta/migrasi-approvement-2026`
// butuh blok aturan sendiri di firestore.rules (seperti `meta/migrasi`,
// `meta/migrasi-kontrak-2026`, `meta/migrasi-mou-2026`, dan
// `meta/migrasi-commitment-2026`). Bila aturan itu belum dipublikasikan
// di console, cek guard gagal dengan 'Missing or insufficient
// permissions' — publikasikan dulu file firestore.rules terbaru, lalu
// jalankan migrasi Approvement. Koleksi `approvement` sudah ada di
// allowlist operator di firestore.rules sejak PR #156 (dipublikasikan
// pengguna 24/11/2026).

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
import { APPROVEMENT_DUMMY } from './seedApprovement';
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
  ID_GUARD_MIGRASI_APPROVEMENT,
  JUMLAH_APPROVEMENT_SEED,
  KOLEKSI_MIGRASI_APPROVEMENT,
  TANGGAL_SEED_APPROVEMENT,
  periksaPrakondisiApprovement,
  verifikasiHasilApprovement,
  type KunciMigrasiApprovement,
} from './migrasiApprovementRencana';

/** Batas tulis per batch Firestore adalah 500; pakai 450 agar aman. */
const MAKS_TULIS_PER_BATCH = 450;

export type TahapMigrasiApprovement =
  | 'guard'
  | 'baca-live'
  | 'prakondisi'
  | 'tulis'
  | 'verifikasi'
  | 'audit'
  | 'selesai';

export interface KemajuanMigrasiApprovement {
  tahap: TahapMigrasiApprovement;
  /** Koleksi yang sedang diproses (tahap tulis). */
  koleksi?: KunciMigrasiApprovement;
  /** Jumlah koleksi yang sudah selesai diproses. */
  selesai: number;
  /** Jumlah koleksi dalam cakupan (selalu 1). */
  total: number;
}

export interface HasilMigrasiApprovement {
  tanggal: string;
  sebelum: { jumlahApprovement: number };
  sesudah: { jumlahApprovement: number };
  jumlahDitulis: number;
}

/** True bila migrasi Approvement sudah pernah dijalankan (dokumen guard ada). */
export async function cekSudahMigrasiApprovement(db: Firestore): Promise<boolean> {
  const snap = await getDoc(doc(db, 'meta', ID_GUARD_MIGRASI_APPROVEMENT));
  return snap.exists();
}

/** Status migrasi Approvement + tanggalnya (bila sudah dijalankan). */
export async function bacaStatusMigrasiApprovement(
  db: Firestore,
): Promise<{ sudah: boolean; tanggal?: string; oleh?: string }> {
  const snap = await getDoc(doc(db, 'meta', ID_GUARD_MIGRASI_APPROVEMENT));
  if (!snap.exists()) return { sudah: false };
  const data = snap.data() as { tanggal?: string; dimigrasiOleh?: string };
  return { sudah: true, tanggal: data.tanggal, oleh: data.dimigrasiOleh };
}

/**
 * Jalankan migrasi Approvement penuh. Lempar Error (menyebut tahap) bila
 * guard sudah diset, prakondisi tidak terpenuhi, atau verifikasi gagal —
 * pemanggil (UI) menampilkan pesan itu apa adanya.
 */
export async function jalankanMigrasiApprovement(
  db: Firestore,
  pengguna: DummyUser,
  satkerKode: string,
  onKemajuan?: (k: KemajuanMigrasiApprovement) => void,
): Promise<HasilMigrasiApprovement> {
  const laporkan = (kemajuan: KemajuanMigrasiApprovement) => onKemajuan?.(kemajuan);

  // 1. Guard sekali-jalan (terpisah dari guard migrasi lain).
  laporkan({ tahap: 'guard', selesai: 0, total: KOLEKSI_MIGRASI_APPROVEMENT.length });
  const refGuard = doc(db, 'meta', ID_GUARD_MIGRASI_APPROVEMENT);
  const guard = await getDoc(refGuard);
  if (guard.exists()) {
    const tanggalLama =
      (guard.data() as { tanggal?: string }).tanggal ?? 'tidak diketahui';
    throw new Error(
      `Approvement migration already ran on ${tanggalLama}. Approvement migration can only be done once.`,
    );
  }

  // 2. Baca live + 3. prakondisi (SEBELUM menulis apa pun).
  laporkan({ tahap: 'baca-live', selesai: 0, total: KOLEKSI_MIGRASI_APPROVEMENT.length });
  const snapLive = await getDocs(
    query(
      collection(db, KOLEKSI.approvement),
      where('satker.kode', '==', satkerKode),
    ),
  );
  const sebelum = { jumlahApprovement: snapLive.size };
  laporkan({ tahap: 'prakondisi', selesai: 0, total: KOLEKSI_MIGRASI_APPROVEMENT.length });
  const masalahPrakondisi = periksaPrakondisiApprovement(sebelum.jumlahApprovement);
  if (masalahPrakondisi.length > 0) {
    throw new Error(
      `Preconditions not met — Approvement migration cancelled, nothing was written: ${masalahPrakondisi.join(' ')}`,
    );
  }

  const tanggal = new Date().toISOString();
  const daftar = APPROVEMENT_DUMMY;
  if (daftar.length !== JUMLAH_APPROVEMENT_SEED) {
    throw new Error(
      `Seed approvement has ${daftar.length} records, expected ${JUMLAH_APPROVEMENT_SEED} — Approvement migration cancelled, nothing was written.`,
    );
  }

  // 4. Tulis — 4 dokumen + guard dalam batch terakhir.
  laporkan({ tahap: 'tulis', koleksi: 'approvement', selesai: 0, total: 1 });
  try {
    for (let j = 0; j < daftar.length; j += MAKS_TULIS_PER_BATCH) {
      const batch = writeBatch(db);
      for (const entitas of daftar.slice(j, j + MAKS_TULIS_PER_BATCH)) {
        if (!entitas.id) {
          throw new Error('seed approvement contains an entity without id');
        }
        batch.set(
          doc(collection(db, KOLEKSI.approvement), kodeIdDokumen(entitas.id)),
          bersihkanUndefined(entitas as unknown as Record<string, unknown>),
        );
      }
      if (j + MAKS_TULIS_PER_BATCH >= daftar.length) {
        batch.set(refGuard, {
          tanggal,
          dimigrasiOleh: pengguna.nama,
          jumlahDitulis: JUMLAH_APPROVEMENT_SEED,
          tanggalImporAsal: TANGGAL_SEED_APPROVEMENT,
        });
      }
      await batch.commit();
    }
  } catch (e) {
    const pesan = e instanceof Error ? e.message : 'Unknown error.';
    throw new Error(
      `Approvement migration failed mid-way (${pesan}) — live data may be partially written. Do NOT run again; report this to Digi.`,
    );
  }
  laporkan({ tahap: 'tulis', koleksi: 'approvement', selesai: 1, total: 1 });

  // 5. Verifikasi — baca ulang dari Firestore, bukan dari memori.
  laporkan({ tahap: 'verifikasi', selesai: 1, total: 1 });
  const snapSesudah = await getDocs(
    query(
      collection(db, KOLEKSI.approvement),
      where('satker.kode', '==', satkerKode),
    ),
  );
  const approvementSesudah = snapSesudah.docs.map((d) => d.data());
  const snapKontrak = await getDocs(
    query(
      collection(db, KOLEKSI.kontrak),
      where('satker.kode', '==', satkerKode),
    ),
  );
  const masalahVerifikasi = verifikasiHasilApprovement({
    approvement: approvementSesudah as AppData['approvement'],
    kontrak: snapKontrak.docs.map((d) => d.data()) as AppData['kontrak'],
  });
  if (masalahVerifikasi.length > 0) {
    throw new Error(
      `Verification after Approvement migration FAILED — the guard is already set, so do NOT run again; report this to Digi: ${masalahVerifikasi.join(' ')}`,
    );
  }
  const sesudah = { jumlahApprovement: snapSesudah.size };

  // 6. SATU entri audit.
  laporkan({ tahap: 'audit', selesai: 1, total: 1 });
  const entri = buatEntriAudit(
    pengguna,
    'Migrasi Data Media Partner',
    'approvement',
    ID_GUARD_MIGRASI_APPROVEMENT,
    'live approvement 0 records',
    `live approvement ${sesudah.jumlahApprovement} records`,
  );
  await tulisAudit(db, entri);

  laporkan({ tahap: 'selesai', selesai: 1, total: 1 });
  return { tanggal, sebelum, sesudah, jumlahDitulis: sesudah.jumlahApprovement };
}

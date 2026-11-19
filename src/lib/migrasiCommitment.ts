// Migrasi Commitment ke Firestore (impor Commitment 19/11/2026).
//
// LATAR: panel Commitment membaca koleksi `commitment` yang TERPISAH
// dari kontrak (keputusan pengguna 19/11/2026, seperti MoU). Seed
// (src/lib/seedCommitment.ts) berisi 4 record dari file pengguna, tapi
// data LIVE di Firestore belum punya koleksi `commitment`. Migrasi ini
// menulis 4 record itu ke live — SATU koleksi saja, TIDAK ADA yang
// dihapus dan TIDAK ADA koleksi lain yang disentuh. Total kontrak PNBP
// tidak berubah (verifikasi sesudah migrasi mengeceknya).
//
// Semua tulis lewat client SDK dengan kredensial pengguna yang login —
// JANGAN memakai Admin SDK atau service account (sama seperti migrasi
// pertama, src/lib/migrasi.ts, re-migrasi, src/lib/remigrasi.ts, dan
// migrasi MoU, src/lib/migrasiMou.ts).
//
// URUTAN (tiap tahap dilaporkan lewat onKemajuan; bila gagal di tengah,
// error menyebut tahap yang sedang diproses):
//   1. guard — bila `meta/migrasi-commitment-2026` sudah ada, batal.
//   2. baca-live — baca koleksi `commitment` live (filter satker).
//   3. prakondisi — live `commitment` harus 0 dokumen; bila tidak, batal
//      SEBELUM menulis apa pun.
//   4. tulis — tulis 4 dokumen baru dari DATA_NYATA.commitment; dokumen
//      guard ditulis dalam batch tulis TERAKHIR.
//   5. verifikasi — baca ulang `commitment` + kontrak, cek 4 record +
//      total dukungan Rp16.600.000 + total kontrak; bila gagal, lempar
//      (guard sudah terlanjur diset — JANGAN jalankan ulang; laporkan
//      ke Digi).
//   6. audit — tulis SATU entri audit.
// Guard baru terpisah dari guard migrasi pertama (`meta/migrasi`),
// re-migrasi kontrak (`meta/migrasi-kontrak-2026`), dan migrasi MoU
// (`meta/migrasi-mou-2026`).
//
// PERHATIAN ATURAN: dokumen guard `meta/migrasi-commitment-2026` butuh
// blok aturan sendiri di firestore.rules (seperti `meta/migrasi`,
// `meta/migrasi-kontrak-2026`, dan `meta/migrasi-mou-2026`). Bila aturan
// itu belum dipublikasikan di console, cek guard gagal dengan 'Missing
// or insufficient permissions' — publikasikan dulu file firestore.rules
// terbaru, lalu jalankan migrasi Commitment. Koleksi `commitment` juga
// harus sudah ada di allowlist operator di firestore.rules sebelum
// merge PR ini (lihat PR body).

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
  ID_GUARD_MIGRASI_COMMITMENT,
  JUMLAH_COMMITMENT_SEED,
  KOLEKSI_MIGRASI_COMMITMENT,
  periksaPrakondisiCommitment,
  verifikasiHasilCommitment,
  type KunciMigrasiCommitment,
} from './migrasiCommitmentRencana';

/** Batas tulis per batch Firestore adalah 500; pakai 450 agar aman. */
const MAKS_TULIS_PER_BATCH = 450;

export type TahapMigrasiCommitment =
  | 'guard'
  | 'baca-live'
  | 'prakondisi'
  | 'tulis'
  | 'verifikasi'
  | 'audit'
  | 'selesai';

export interface KemajuanMigrasiCommitment {
  tahap: TahapMigrasiCommitment;
  /** Koleksi yang sedang diproses (tahap tulis). */
  koleksi?: KunciMigrasiCommitment;
  /** Jumlah koleksi yang sudah selesai diproses. */
  selesai: number;
  /** Jumlah koleksi dalam cakupan (selalu 1). */
  total: number;
}

export interface HasilMigrasiCommitment {
  tanggal: string;
  sebelum: { jumlahCommitment: number };
  sesudah: { jumlahCommitment: number };
  jumlahDitulis: number;
}

/** True bila migrasi Commitment sudah pernah dijalankan (dokumen guard ada). */
export async function cekSudahMigrasiCommitment(db: Firestore): Promise<boolean> {
  const snap = await getDoc(doc(db, 'meta', ID_GUARD_MIGRASI_COMMITMENT));
  return snap.exists();
}

/** Status migrasi Commitment + tanggalnya (bila sudah dijalankan). */
export async function bacaStatusMigrasiCommitment(
  db: Firestore,
): Promise<{ sudah: boolean; tanggal?: string; oleh?: string }> {
  const snap = await getDoc(doc(db, 'meta', ID_GUARD_MIGRASI_COMMITMENT));
  if (!snap.exists()) return { sudah: false };
  const data = snap.data() as { tanggal?: string; dimigrasiOleh?: string };
  return { sudah: true, tanggal: data.tanggal, oleh: data.dimigrasiOleh };
}

/**
 * Jalankan migrasi Commitment penuh. Lempar Error (menyebut tahap) bila
 * guard sudah diset, prakondisi tidak terpenuhi, atau verifikasi gagal —
 * pemanggil (UI) menampilkan pesan itu apa adanya.
 */
export async function jalankanMigrasiCommitment(
  db: Firestore,
  pengguna: DummyUser,
  satkerKode: string,
  onKemajuan?: (k: KemajuanMigrasiCommitment) => void,
): Promise<HasilMigrasiCommitment> {
  const laporkan = (kemajuan: KemajuanMigrasiCommitment) => onKemajuan?.(kemajuan);

  // 1. Guard sekali-jalan (terpisah dari guard migrasi lain).
  laporkan({ tahap: 'guard', selesai: 0, total: KOLEKSI_MIGRASI_COMMITMENT.length });
  const refGuard = doc(db, 'meta', ID_GUARD_MIGRASI_COMMITMENT);
  const guard = await getDoc(refGuard);
  if (guard.exists()) {
    const tanggalLama =
      (guard.data() as { tanggal?: string }).tanggal ?? 'tidak diketahui';
    throw new Error(
      `Commitment migration already ran on ${tanggalLama}. Commitment migration can only be done once.`,
    );
  }

  // 2. Baca live + 3. prakondisi (SEBELUM menulis apa pun).
  laporkan({ tahap: 'baca-live', selesai: 0, total: KOLEKSI_MIGRASI_COMMITMENT.length });
  const snapLive = await getDocs(
    query(
      collection(db, KOLEKSI.commitment),
      where('satker.kode', '==', satkerKode),
    ),
  );
  const sebelum = { jumlahCommitment: snapLive.size };
  laporkan({ tahap: 'prakondisi', selesai: 0, total: KOLEKSI_MIGRASI_COMMITMENT.length });
  const masalahPrakondisi = periksaPrakondisiCommitment(sebelum.jumlahCommitment);
  if (masalahPrakondisi.length > 0) {
    throw new Error(
      `Preconditions not met — Commitment migration cancelled, nothing was written: ${masalahPrakondisi.join(' ')}`,
    );
  }

  const tanggal = new Date().toISOString();
  const daftar = DATA_NYATA.commitment;
  if (daftar.length !== JUMLAH_COMMITMENT_SEED) {
    throw new Error(
      `Seed commitment has ${daftar.length} records, expected ${JUMLAH_COMMITMENT_SEED} — Commitment migration cancelled, nothing was written.`,
    );
  }

  // 4. Tulis — 4 dokumen + guard dalam batch terakhir.
  laporkan({ tahap: 'tulis', koleksi: 'commitment', selesai: 0, total: 1 });
  try {
    for (let j = 0; j < daftar.length; j += MAKS_TULIS_PER_BATCH) {
      const batch = writeBatch(db);
      for (const entitas of daftar.slice(j, j + MAKS_TULIS_PER_BATCH)) {
        if (!entitas.id) {
          throw new Error('seed commitment contains an entity without id');
        }
        batch.set(
          doc(collection(db, KOLEKSI.commitment), kodeIdDokumen(entitas.id)),
          bersihkanUndefined(entitas as unknown as Record<string, unknown>),
        );
      }
      if (j + MAKS_TULIS_PER_BATCH >= daftar.length) {
        batch.set(refGuard, {
          tanggal,
          dimigrasiOleh: pengguna.nama,
          jumlahDitulis: JUMLAH_COMMITMENT_SEED,
          tanggalImporAsal: TANGGAL_IMPOR,
        });
      }
      await batch.commit();
    }
  } catch (e) {
    const pesan = e instanceof Error ? e.message : 'Unknown error.';
    throw new Error(
      `Commitment migration failed mid-way (${pesan}) — live data may be partially written. Do NOT run again; report this to Digi.`,
    );
  }
  laporkan({ tahap: 'tulis', koleksi: 'commitment', selesai: 1, total: 1 });

  // 5. Verifikasi — baca ulang dari Firestore, bukan dari memori.
  laporkan({ tahap: 'verifikasi', selesai: 1, total: 1 });
  const snapSesudah = await getDocs(
    query(
      collection(db, KOLEKSI.commitment),
      where('satker.kode', '==', satkerKode),
    ),
  );
  const commitmentSesudah = snapSesudah.docs.map((d) => d.data());
  const snapKontrak = await getDocs(
    query(
      collection(db, KOLEKSI.kontrak),
      where('satker.kode', '==', satkerKode),
    ),
  );
  const masalahVerifikasi = verifikasiHasilCommitment({
    commitment: commitmentSesudah as AppData['commitment'],
    kontrak: snapKontrak.docs.map((d) => d.data()) as AppData['kontrak'],
  });
  if (masalahVerifikasi.length > 0) {
    throw new Error(
      `Verification after Commitment migration FAILED — the guard is already set, so do NOT run again; report this to Digi: ${masalahVerifikasi.join(' ')}`,
    );
  }
  const sesudah = { jumlahCommitment: snapSesudah.size };

  // 6. SATU entri audit.
  laporkan({ tahap: 'audit', selesai: 1, total: 1 });
  const entri = buatEntriAudit(
    pengguna,
    'Migrasi Data Commitment',
    'commitment',
    ID_GUARD_MIGRASI_COMMITMENT,
    'live commitment 0 records',
    `live commitment ${sesudah.jumlahCommitment} records`,
  );
  await tulisAudit(db, entri);

  laporkan({ tahap: 'selesai', selesai: 1, total: 1 });
  return { tanggal, sebelum, sesudah, jumlahDitulis: sesudah.jumlahCommitment };
}

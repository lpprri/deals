// Re-migrasi data kontrak 2026 ke Firestore (PR #53).
//
// LATAR: PR #52 mengganti 40 kontrak 2026 di SEED dengan file baru
// pengguna, tapi data LIVE di Firestore masih data lama (hasil migrasi
// pertama 2026-11-14). Re-migrasi ini menyamakan live dengan seed:
// hapus lalu tulis ulang 5 koleksi (klien, kontrak, tagihan, pembayaran,
// denda) — TIDAK ADA koleksi lain yang disentuh.
//
// Semua tulis lewat client SDK dengan kredensial pengguna yang login —
// JANGAN memakai Admin SDK atau service account (sama seperti migrasi
// pertama, src/lib/migrasi.ts).
//
// URUTAN (tiap tahap dilaporkan lewat onKemajuan; bila gagal di tengah,
// error menyebut tahap + koleksi yang sedang diproses):
//   1. guard — bila `meta/migrasi-kontrak-2026` sudah ada, batal.
//   2. baca-live — baca 5 koleksi live (filter satker).
//   3. prakondisi — hitungan live harus persis 42/42/42/42/13; bila
//      tidak, batal SEBELUM menghapus apa pun.
//   4. hapus — hapus dokumen lama per koleksi (batch per koleksi).
//   5. tulis — tulis dokumen baru dari DATA_NYATA, atribusi operator
//      (operatorPenutup + tanggalTandaTangan) dibawa dari LIVE; dokumen
//      guard ditulis dalam batch tulis TERAKHIR.
//   6. verifikasi — baca ulang 5 koleksi, cek hitungan + total kontrol
//      + kedua kontrak 2025; bila gagal, lempar (guard sudah terlanjur
//      diset — JANGAN jalankan ulang; laporkan ke Digi).
//   7. audit — tulis SATU entri audit.
// Guard baru terpisah dari guard migrasi pertama (`meta/migrasi`):
// migrasi pertama tetap tidak bisa jalan dua kali, dan re-migrasi ini
// juga tidak bisa jalan dua kali.
//
// PERHATIAN ATURAN: dokumen guard `meta/migrasi-kontrak-2026` butuh blok
// aturan sendiri di firestore.rules (seperti `meta/migrasi`). Bila aturan
// itu belum dipublikasikan di console, cek guard gagal dengan
// 'Missing or insufficient permissions' — publikasikan dulu file
// firestore.rules terbaru, lalu jalankan re-migrasi.

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
  HITUNGAN_SEED,
  ID_GUARD_REMIGRASI,
  KOLEKSI_REMIGRASI,
  TOTAL_KONTROL_TARGET,
  gabungkanAtribusiLive,
  hitungTotalRemigrasi,
  periksaPrakondisi,
  verifikasiHasil,
  type HitunganRemigrasi,
  type KunciRemigrasi,
  type PratinjauRemigrasi,
} from './remigrasiRencana';

/** Batas tulis per batch Firestore adalah 500; pakai 450 agar aman. */
const MAKS_TULIS_PER_BATCH = 450;

export type TahapRemigrasi =
  | 'guard'
  | 'baca-live'
  | 'prakondisi'
  | 'hapus'
  | 'tulis'
  | 'verifikasi'
  | 'audit'
  | 'selesai';

export interface KemajuanRemigrasi {
  tahap: TahapRemigrasi;
  /** Koleksi yang sedang diproses (tahap hapus/tulis). */
  koleksi?: KunciRemigrasi;
  /** Jumlah koleksi yang sudah selesai diproses (hapus/tulis). */
  selesai: number;
  /** Jumlah koleksi dalam cakupan (selalu 5). */
  total: number;
}

export interface HasilRemigrasi {
  tanggal: string;
  sebelum: HitunganRemigrasi;
  sesudah: HitunganRemigrasi;
  jumlahDihapus: Record<KunciRemigrasi, number>;
  jumlahDitulis: Record<KunciRemigrasi, number>;
}

/** True bila re-migrasi sudah pernah dijalankan (dokumen guard ada). */
export async function cekSudahRemigrasi(db: Firestore): Promise<boolean> {
  const snap = await getDoc(doc(db, 'meta', ID_GUARD_REMIGRASI));
  return snap.exists();
}

/** Status re-migrasi + tanggalnya (bila sudah dijalankan). */
export async function bacaStatusRemigrasi(
  db: Firestore,
): Promise<{ sudah: boolean; tanggal?: string; oleh?: string }> {
  const snap = await getDoc(doc(db, 'meta', ID_GUARD_REMIGRASI));
  if (!snap.exists()) return { sudah: false };
  const data = snap.data() as { tanggal?: string; diremigrasiOleh?: string };
  return { sudah: true, tanggal: data.tanggal, oleh: data.diremigrasiOleh };
}

type BagianLive = Pick<
  AppData,
  'klien' | 'kontrak' | 'tagihan' | 'pembayaran' | 'denda'
>;

/** Baca 5 koleksi live untuk satker ini (dipakai pratinjau + re-migrasi). */
async function bacaLive(
  db: Firestore,
  satkerKode: string,
): Promise<BagianLive> {
  const bagian = {} as Record<KunciRemigrasi, unknown[]>;
  await Promise.all(
    KOLEKSI_REMIGRASI.map(async (kunci) => {
      const snap = await getDocs(
        query(
          collection(db, KOLEKSI[kunci]),
          where('satker.kode', '==', satkerKode),
        ),
      );
      bagian[kunci] = snap.docs.map((d) => d.data());
    }),
  );
  return bagian as unknown as BagianLive;
}

/** Hitungan + total dari 5 koleksi yang dibaca. */
function ringkasanBagian(bagian: BagianLive): HitunganRemigrasi {
  const hitungan = {} as Record<KunciRemigrasi, number>;
  for (const kunci of KOLEKSI_REMIGRASI) {
    hitungan[kunci] = bagian[kunci].length;
  }
  return { hitungan, total: hitungTotalRemigrasi(bagian) };
}

/**
 * Pratinjau tanpa menulis apa pun: hitungan + total kontrol SEBELUM
 * (live) vs SESUDAH (seed pasca-PR #52).
 */
export async function pratinjauRemigrasi(
  db: Firestore,
  satkerKode: string,
): Promise<PratinjauRemigrasi> {
  const live = await bacaLive(db, satkerKode);
  return {
    sebelum: ringkasanBagian(live),
    sesudah: {
      hitungan: { ...HITUNGAN_SEED },
      total: { ...TOTAL_KONTROL_TARGET },
    },
  };
}

/**
 * Jalankan re-migrasi penuh. Lempar Error (menyebut tahap + koleksi)
 * bila guard sudah diset, prakondisi tidak terpenuhi, atau verifikasi
 * gagal — pemanggil (UI) menampilkan pesan itu apa adanya.
 */
export async function jalankanRemigrasi(
  db: Firestore,
  pengguna: DummyUser,
  satkerKode: string,
  onKemajuan?: (kemajuan: KemajuanRemigrasi) => void,
): Promise<HasilRemigrasi> {
  const laporkan = (kemajuan: KemajuanRemigrasi) => onKemajuan?.(kemajuan);

  // 1. Guard sekali-jalan (terpisah dari guard migrasi pertama).
  laporkan({ tahap: 'guard', selesai: 0, total: KOLEKSI_REMIGRASI.length });
  const refGuard = doc(db, 'meta', ID_GUARD_REMIGRASI);
  const guard = await getDoc(refGuard);
  if (guard.exists()) {
    const tanggalLama =
      (guard.data() as { tanggal?: string }).tanggal ?? 'tidak diketahui';
    throw new Error(
      `Re-migration already ran on ${tanggalLama}. Re-migration can only be done once.`,
    );
  }

  // 2. Baca live + 3. prakondisi (SEBELUM menghapus apa pun).
  laporkan({ tahap: 'baca-live', selesai: 0, total: KOLEKSI_REMIGRASI.length });
  const live = await bacaLive(db, satkerKode);
  const sebelum = ringkasanBagian(live);
  laporkan({ tahap: 'prakondisi', selesai: 0, total: KOLEKSI_REMIGRASI.length });
  const masalahPrakondisi = periksaPrakondisi(sebelum.hitungan);
  if (masalahPrakondisi.length > 0) {
    throw new Error(
      `Preconditions not met — re-migration cancelled, nothing was deleted: ${masalahPrakondisi.join(' ')}`,
    );
  }

  // Simpan atribusi live di memori: live adalah sumber kebenaran.
  const kontrakBaru = gabungkanAtribusiLive(DATA_NYATA.kontrak, live.kontrak);
  const dataBaru: BagianLive = {
    klien: DATA_NYATA.klien,
    kontrak: kontrakBaru,
    tagihan: DATA_NYATA.tagihan,
    pembayaran: DATA_NYATA.pembayaran,
    denda: DATA_NYATA.denda,
  };

  const jumlahDihapus = {} as Record<KunciRemigrasi, number>;
  const jumlahDitulis = {} as Record<KunciRemigrasi, number>;
  const tanggal = new Date().toISOString();

  // Tahap hapus + tulis dibungkus: bila batch gagal di tengah, data
  // mungkin sudah terganti sebagian. Prakondisi (hitungan live) akan
  // menggagalkan jalan ulang yang buta — laporkan ke Digi, jangan
  // jalankan ulang sendiri.
  try {
    await hapusDokumenLama(db, satkerKode, laporkan, jumlahDihapus);
    await tulisDokumenBaru(
      db,
      refGuard,
      tanggal,
      pengguna.nama,
      dataBaru,
      laporkan,
      jumlahDitulis,
    );
  } catch (e) {
    const pesan = e instanceof Error ? e.message : 'Unknown error.';
    throw new Error(
      `Re-migration failed mid-way (${pesan}) — live data may be partially replaced. Do NOT run again; report this to Digi.`,
    );
  }

  // 6. Verifikasi — baca ulang dari Firestore, bukan dari memori.
  laporkan({ tahap: 'verifikasi', selesai: KOLEKSI_REMIGRASI.length, total: KOLEKSI_REMIGRASI.length });
  const liveSesudah = await bacaLive(db, satkerKode);
  const dataSesudah: AppData = {
    ...DATA_NYATA,
    klien: liveSesudah.klien,
    kontrak: liveSesudah.kontrak,
    tagihan: liveSesudah.tagihan,
    pembayaran: liveSesudah.pembayaran,
    denda: liveSesudah.denda,
  };
  const masalahVerifikasi = verifikasiHasil(dataSesudah);
  if (masalahVerifikasi.length > 0) {
    throw new Error(
      `Verification after re-migration FAILED — the guard is already set, so do NOT run again; report this to Digi: ${masalahVerifikasi.join(' ')}`,
    );
  }
  const sesudah = ringkasanBagian(liveSesudah);

  // 7. SATU entri audit.
  laporkan({ tahap: 'audit', selesai: KOLEKSI_REMIGRASI.length, total: KOLEKSI_REMIGRASI.length });
  const entri = buatEntriAudit(
    pengguna,
    'Re-migrasi Data Kontrak 2026',
    'kontrak',
    ID_GUARD_REMIGRASI,
    `payments 42, receivables Rp${sebelum.total.sisaPiutang.toLocaleString('id-ID')}, fines Rp${sebelum.total.totalDenda.toLocaleString('id-ID')}`,
    `payments 45, receivables Rp${sesudah.total.sisaPiutang.toLocaleString('id-ID')}, fines Rp${sesudah.total.totalDenda.toLocaleString('id-ID')}`,
  );
  await tulisAudit(db, entri);

  laporkan({ tahap: 'selesai', selesai: KOLEKSI_REMIGRASI.length, total: KOLEKSI_REMIGRASI.length });
  return { tanggal, sebelum, sesudah, jumlahDihapus, jumlahDitulis };
}

/** Tahap 4 — hapus dokumen lama, satu batch per koleksi, berurutan. */
async function hapusDokumenLama(
  db: Firestore,
  satkerKode: string,
  laporkan: (kemajuan: KemajuanRemigrasi) => void,
  jumlahDihapus: Record<KunciRemigrasi, number>,
): Promise<void> {
  // Referensi dokumen diambil dari snapshot baca (id sudah ter-encode).
  const hapusPerKoleksi = await Promise.all(
    KOLEKSI_REMIGRASI.map(async (kunci) => {
      const snap = await getDocs(
        query(
          collection(db, KOLEKSI[kunci]),
          where('satker.kode', '==', satkerKode),
        ),
      );
      return { kunci, refs: snap.docs.map((d) => d.ref) };
    }),
  );
  for (let i = 0; i < hapusPerKoleksi.length; i += 1) {
    const { kunci, refs } = hapusPerKoleksi[i];
    laporkan({ tahap: 'hapus', koleksi: kunci, selesai: i, total: KOLEKSI_REMIGRASI.length });
    for (let j = 0; j < refs.length; j += MAKS_TULIS_PER_BATCH) {
      const batch = writeBatch(db);
      for (const ref of refs.slice(j, j + MAKS_TULIS_PER_BATCH)) {
        batch.delete(ref);
      }
      await batch.commit();
    }
    jumlahDihapus[kunci] = refs.length;
    laporkan({ tahap: 'hapus', koleksi: kunci, selesai: i + 1, total: KOLEKSI_REMIGRASI.length });
  }
}

/** Tahap 5 — tulis dokumen baru dari seed, satu batch per koleksi. */
async function tulisDokumenBaru(
  db: Firestore,
  refGuard: ReturnType<typeof doc>,
  tanggal: string,
  namaOperator: string,
  dataBaru: BagianLive,
  laporkan: (kemajuan: KemajuanRemigrasi) => void,
  jumlahDitulis: Record<KunciRemigrasi, number>,
): Promise<void> {
  // Dokumen guard ditulis dalam batch tulis TERAKHIR (denda) — penanda
  // hanya ada bila seluruh tulis berhasil (pola migrasi pertama).
  for (let i = 0; i < KOLEKSI_REMIGRASI.length; i += 1) {
    const kunci = KOLEKSI_REMIGRASI[i];
    const daftar = dataBaru[kunci] as { id: string }[];
    laporkan({ tahap: 'tulis', koleksi: kunci, selesai: i, total: KOLEKSI_REMIGRASI.length });
    for (let j = 0; j < daftar.length; j += MAKS_TULIS_PER_BATCH) {
      const batch = writeBatch(db);
      for (const entitas of daftar.slice(j, j + MAKS_TULIS_PER_BATCH)) {
        if (!entitas.id) {
          throw new Error(
            `seed ${KOLEKSI[kunci]} contains an entity without id (tahap tulis ${kunci})`,
          );
        }
        batch.set(
          doc(collection(db, KOLEKSI[kunci]), kodeIdDokumen(entitas.id)),
          bersihkanUndefined(entitas as unknown as Record<string, unknown>),
        );
      }
      if (kunci === KOLEKSI_REMIGRASI[KOLEKSI_REMIGRASI.length - 1]) {
        batch.set(refGuard, {
          tanggal,
          diremigrasiOleh: namaOperator,
          jumlahDihapus: HITUNGAN_SEED,
          jumlahDitulis: HITUNGAN_SEED,
          tanggalImporAsal: TANGGAL_IMPOR,
        });
      }
      await batch.commit();
    }
    jumlahDitulis[kunci] = daftar.length;
    laporkan({ tahap: 'tulis', koleksi: kunci, selesai: i + 1, total: KOLEKSI_REMIGRASI.length });
  }
}

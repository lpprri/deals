// Backfill klienId ke data live Firestore (dua peran 19/11/2026).
//
// LATAR: aturan Firestore baca-klien hanya mengizinkan client membaca
// dokumen yang `klienId`-nya sama dengan klienId di profilnya. Data
// live ditulis SEBELUM field ini ada (kontrak sudah punya klienId
// sejak impor; tagihan/pembayaran/denda/dokumen belum; MoU hanya 3
// yang tertaut). Backfill satu kali ini menambahkannya dari rantai
// induk yang sudah ada — SATU field per dokumen, TIDAK ADA yang
// dihapus, kontrak/klien/commitment TIDAK disentuh, total kontrak
// PNBP tidak berubah.
//
// Semua tulis lewat client SDK dengan kredensial pengguna yang login —
// JANGAN memakai Admin SDK atau service account (sama seperti migrasi
// lain, src/lib/migrasiMou.ts).
//
// URUTAN (tiap tahap dilaporkan lewat onKemajuan; bila gagal di tengah,
// error menyebut tahap yang sedang diproses):
//   1. guard — bila `meta/backfill-klienId-2026` sudah ada, batal.
//   2. baca-live — baca kontrak + tagihan + pembayaran + denda +
//      dokumen + mou + commitment live (filter satker; dokumen tanpa
//      filter satker seperti muatDariFirestore).
//   3. prakondisi — hitungan live harus sama dengan seed (42/45/12/
//      102/44) dan semua induk harus ada; bila tidak, batal SEBELUM
//      menulis apa pun.
//   4. tulis — update parsial field `klienId` saja (writeBatch,
//      updateDoc — BUKAN set, supaya field lain tidak tersentuh);
//      dokumen yang sudah punya klienId benar DILEWATI; yang punya
//      klienId SALAH membuat backfill GAGAL sebelum menulis apa pun.
//      Dokumen guard ditulis dalam batch tulis TERAKHIR.
//   5. verifikasi — baca ulang, cek rantai klienId + 3 MoU tertaut +
//      0 Commitment tertaut + total kontrak; bila gagal, lempar (guard
//      sudah terlanjur diset — JANGAN jalankan ulang; laporkan ke Digi).
//   6. audit — tulis SATU entri audit.
//
// PERHATIAN ATURAN: dokumen guard `meta/backfill-klienId-2026` butuh
// blok aturan sendiri di firestore.rules (seperti guard migrasi lain).
// Bila aturan itu belum dipublikasikan di console, cek guard gagal
// dengan 'Missing or insufficient permissions' — publikasikan dulu
// file firestore.rules terbaru, lalu jalankan backfill.

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
import {
  KOLEKSI,
  bersihkanUndefined,
  tulisAudit,
} from './firestoreStore';
import { buatEntriAudit } from './audit';
import type { DummyUser } from './dummyUsers';
import type { AppData } from './types';
import {
  ID_GUARD_BACKFILL_KLIENID,
  KLIEN_MOU,
  KOLEKSI_BACKFILL_KLIENID,
  periksaPrakondisiBackfillKlienId,
  verifikasiHasilBackfillKlienId,
  type KunciBackfillKlienId,
  type RingkasanLiveBackfill,
} from './backfillKlienIdRencana';

/** Batas tulis per batch Firestore adalah 500; pakai 450 agar aman. */
const MAKS_TULIS_PER_BATCH = 450;

export type TahapBackfillKlienId =
  | 'guard'
  | 'baca-live'
  | 'prakondisi'
  | 'tulis'
  | 'verifikasi'
  | 'audit'
  | 'selesai';

export interface KemajuanBackfillKlienId {
  tahap: TahapBackfillKlienId;
  /** Koleksi yang sedang diproses (tahap tulis). */
  koleksi?: KunciBackfillKlienId;
  /** Jumlah koleksi yang sudah selesai diproses. */
  selesai: number;
  /** Jumlah koleksi dalam cakupan. */
  total: number;
}

export interface HasilBackfillKlienId {
  tanggal: string;
  sebelum: { tanpaKlienId: number };
  sesudah: { tanpaKlienId: number };
  jumlahDitulis: number;
  perKoleksi: Record<string, number>;
}

/** True bila backfill klienId sudah pernah dijalankan (dokumen guard ada). */
export async function cekSudahBackfillKlienId(db: Firestore): Promise<boolean> {
  const snap = await getDoc(doc(db, 'meta', ID_GUARD_BACKFILL_KLIENID));
  return snap.exists();
}

/** Status backfill klienId + tanggalnya (bila sudah dijalankan). */
export async function bacaStatusBackfillKlienId(
  db: Firestore,
): Promise<{ sudah: boolean; tanggal?: string; oleh?: string }> {
  const snap = await getDoc(doc(db, 'meta', ID_GUARD_BACKFILL_KLIENID));
  if (!snap.exists()) return { sudah: false };
  const data = snap.data() as { tanggal?: string; dimigrasiOleh?: string };
  return { sudah: true, tanggal: data.tanggal, oleh: data.dimigrasiOleh };
}

/**
 * Jalankan backfill klienId penuh. Lempar Error (menyebut tahap) bila
 * guard sudah diset, prakondisi tidak terpenuhi, ada klienId yang
 * salah, atau verifikasi gagal — pemanggil (UI) menampilkan pesan itu
 * apa adanya.
 */
export async function jalankanBackfillKlienId(
  db: Firestore,
  pengguna: DummyUser,
  satkerKode: string,
  onKemajuan?: (k: KemajuanBackfillKlienId) => void,
): Promise<HasilBackfillKlienId> {
  const laporkan = (kemajuan: KemajuanBackfillKlienId) => onKemajuan?.(kemajuan);
  const totalKoleksi = KOLEKSI_BACKFILL_KLIENID.length;

  // 1. Guard sekali-jalan (terpisah dari guard migrasi lain).
  laporkan({ tahap: 'guard', selesai: 0, total: totalKoleksi });
  const refGuard = doc(db, 'meta', ID_GUARD_BACKFILL_KLIENID);
  const guard = await getDoc(refGuard);
  if (guard.exists()) {
    const tanggalLama =
      (guard.data() as { tanggal?: string }).tanggal ?? 'tidak diketahui';
    throw new Error(
      `klienId backfill already ran on ${tanggalLama}. Backfill can only be done once.`,
    );
  }

  // 2. Baca live.
  laporkan({ tahap: 'baca-live', selesai: 0, total: totalKoleksi });
  const bacaKoleksi = async <K extends keyof AppData>(
    kunci: K,
  ): Promise<Record<string, unknown>[]> => {
    const ref = collection(db, KOLEKSI[kunci]);
    const snap =
      kunci === 'dokumen'
        ? await getDocs(ref)
        : await getDocs(query(ref, where('satker.kode', '==', satkerKode)));
    return snap.docs.map((d) => ({
      idDokumen: d.id,
      ...(d.data() as Record<string, unknown>),
    }));
  };
  const kontrak = await bacaKoleksi('kontrak');
  const tagihan = await bacaKoleksi('tagihan');
  const pembayaran = await bacaKoleksi('pembayaran');
  const denda = await bacaKoleksi('denda');
  const dokumen = await bacaKoleksi('dokumen');
  const mou = await bacaKoleksi('mou');

  const klienKontrak = new Map<string, string>();
  for (const k of kontrak) {
    if (typeof k.klienId === 'string' && k.klienId !== '') {
      klienKontrak.set(String(k.id), k.klienId);
    }
  }
  const klienTagihan = new Map<string, string>();
  const indukHilang: string[] = [];
  for (const t of tagihan) {
    const klienId = klienKontrak.get(String(t.kontrakId));
    if (!klienId) indukHilang.push(`tagihan ${t.id}`);
    else klienTagihan.set(String(t.id), klienId);
  }
  for (const p of pembayaran) {
    if (!klienTagihan.has(String(p.tagihanId))) {
      indukHilang.push(`pembayaran ${p.id}`);
    }
  }
  for (const d of denda) {
    if (!klienTagihan.has(String(d.tagihanId))) {
      indukHilang.push(`denda ${d.id}`);
    }
  }
  for (const d of dokumen) {
    if (!klienKontrak.has(String(d.kontrakId))) {
      indukHilang.push(`dokumen ${d.id}`);
    }
  }

  // 3. Prakondisi (SEBELUM menulis apa pun).
  laporkan({ tahap: 'prakondisi', selesai: 0, total: totalKoleksi });
  const ringkasan: RingkasanLiveBackfill = {
    jumlahTagihan: tagihan.length,
    jumlahPembayaran: pembayaran.length,
    jumlahDenda: denda.length,
    jumlahDokumen: dokumen.length,
    jumlahMou: mou.length,
    indukHilang,
  };
  const masalahPrakondisi = periksaPrakondisiBackfillKlienId(ringkasan);
  if (masalahPrakondisi.length > 0) {
    throw new Error(
      `Preconditions not met — klienId backfill cancelled, nothing was written: ${masalahPrakondisi.join(' ')}`,
    );
  }

  // Rencana tulis: hanya dokumen yang belum punya klienId; yang sudah
  // punya klienId SALAH membuat backfill gagal (bukan ditimpa).
  type Tulis = { koleksi: KunciBackfillKlienId; idDokumen: string; klienId: string };
  const rencana: Tulis[] = [];
  const masalahKlienIdSalah: string[] = [];
  const rencanakan = (
    koleksi: KunciBackfillKlienId,
    daftar: Record<string, unknown>[],
    klienIdUntuk: (d: Record<string, unknown>) => string | undefined,
  ) => {
    for (const d of daftar) {
      const diharapkan = klienIdUntuk(d);
      if (!diharapkan) continue;
      const lama = d.klienId;
      if (typeof lama === 'string' && lama !== '') {
        if (lama !== diharapkan) {
          masalahKlienIdSalah.push(
            `${koleksi} ${d.id} already has klienId ${lama}, expected ${diharapkan} — refusing to overwrite.`,
          );
        }
        continue;
      }
      rencana.push({
        koleksi,
        idDokumen: String(d.idDokumen ?? d.id),
        klienId: diharapkan,
      });
    }
  };
  rencanakan('tagihan', tagihan, (t) => klienKontrak.get(String(t.kontrakId)));
  rencanakan('pembayaran', pembayaran, (p) => klienTagihan.get(String(p.tagihanId)));
  rencanakan('denda', denda, (d) => klienTagihan.get(String(d.tagihanId)));
  rencanakan('dokumen', dokumen, (d) => klienKontrak.get(String(d.kontrakId)));
  rencanakan('mou', mou, (m) => KLIEN_MOU[String(m.id)]);
  if (masalahKlienIdSalah.length > 0) {
    throw new Error(
      `Conflicting klienId found — backfill cancelled, nothing was written: ${masalahKlienIdSalah.join(' ')}`,
    );
  }
  const sebelum = {
    tanpaKlienId: rencana.length,
  };
  const perKoleksi: Record<string, number> = {};
  for (const r of rencana) {
    perKoleksi[r.koleksi] = (perKoleksi[r.koleksi] ?? 0) + 1;
  }

  // 4. Tulis — update parsial klienId saja + guard dalam batch terakhir.
  const tanggal = new Date().toISOString();
  laporkan({ tahap: 'tulis', selesai: 0, total: totalKoleksi });
  try {
    const semua = [...rencana];
    // Batch terakhir juga menulis guard — pastikan ada minimal 1 batch
    // meski rencana kosong (tidak mungkin di data saat ini, tapi aman).
    const potongan: Tulis[][] = [];
    for (let j = 0; j < semua.length; j += MAKS_TULIS_PER_BATCH) {
      potongan.push(semua.slice(j, j + MAKS_TULIS_PER_BATCH));
    }
    if (potongan.length === 0) potongan.push([]);
    for (let i = 0; i < potongan.length; i++) {
      const batch = writeBatch(db);
      for (const r of potongan[i]) {
        batch.update(doc(db, KOLEKSI[r.koleksi], r.idDokumen), {
          klienId: r.klienId,
        });
      }
      if (i === potongan.length - 1) {
        batch.set(refGuard, {
          tanggal,
          dimigrasiOleh: pengguna.nama,
          jumlahDitulis: rencana.length,
          perKoleksi: bersihkanUndefined(perKoleksi),
        });
      }
      await batch.commit();
      laporkan({
        tahap: 'tulis',
        selesai: Math.min(i + 1, totalKoleksi),
        total: totalKoleksi,
      });
    }
  } catch (e) {
    const pesan = e instanceof Error ? e.message : 'Unknown error.';
    throw new Error(
      `klienId backfill failed mid-way (${pesan}) — live data may be partially written. Do NOT run again; report this to Digi.`,
    );
  }
  laporkan({ tahap: 'tulis', selesai: totalKoleksi, total: totalKoleksi });

  // 5. Verifikasi — baca ulang dari Firestore, bukan dari memori.
  laporkan({ tahap: 'verifikasi', selesai: totalKoleksi, total: totalKoleksi });
  const sesudahKontrak = await bacaKoleksi('kontrak');
  const sesudahTagihan = await bacaKoleksi('tagihan');
  const sesudahPembayaran = await bacaKoleksi('pembayaran');
  const sesudahDenda = await bacaKoleksi('denda');
  const sesudahDokumen = await bacaKoleksi('dokumen');
  const sesudahMou = await bacaKoleksi('mou');
  const sesudahCommitment = await bacaKoleksi('commitment');
  const masalahVerifikasi = verifikasiHasilBackfillKlienId({
    kontrak: sesudahKontrak as unknown as AppData['kontrak'],
    tagihan: sesudahTagihan as unknown as AppData['tagihan'],
    pembayaran: sesudahPembayaran as unknown as AppData['pembayaran'],
    denda: sesudahDenda as unknown as AppData['denda'],
    dokumen: sesudahDokumen as unknown as AppData['dokumen'],
    mou: sesudahMou as unknown as AppData['mou'],
    commitment: sesudahCommitment as unknown as AppData['commitment'],
  });
  if (masalahVerifikasi.length > 0) {
    throw new Error(
      `Verification after klienId backfill FAILED — the guard is already set, so do NOT run again; report this to Digi: ${masalahVerifikasi.join(' ')}`,
    );
  }
  const tanpaKlienIdSesudah =
    sesudahTagihan.filter((t) => !t.klienId).length +
    sesudahPembayaran.filter((p) => !p.klienId).length +
    sesudahDenda.filter((d) => !d.klienId).length +
    sesudahDokumen.filter((d) => !d.klienId).length;
  const sesudah = { tanpaKlienId: tanpaKlienIdSesudah };

  // 6. SATU entri audit.
  laporkan({ tahap: 'audit', selesai: totalKoleksi, total: totalKoleksi });
  const entri = buatEntriAudit(
    pengguna,
    'Backfill klienId (dua peran)',
    'meta',
    ID_GUARD_BACKFILL_KLIENID,
    `live tanpa klienId ${sebelum.tanpaKlienId} dokumen`,
    `live tanpa klienId ${sesudah.tanpaKlienId} dokumen`,
  );
  await tulisAudit(db, entri);

  laporkan({ tahap: 'selesai', selesai: totalKoleksi, total: totalKoleksi });
  return { tanggal, sebelum, sesudah, jumlahDitulis: rencana.length, perKoleksi };
}

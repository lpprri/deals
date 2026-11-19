// Perbaikan satu kali record MoU 037 di Firestore (19/11/2026).
//
// LATAR: impor MoU (PR #116) sudah merge dan migrasi MoU sudah
// dijalankan — panel MoU menampilkan 44 record live. Pengguna lalu
// meminta PIC record 037/RRI-PLB/KJM.02.04/09/2026 menjadi 'Ja'far'
// (di sumber PIC-nya kosong) dan nama instansinya dibersihkan dari
// backtick nyasar di akhir. Seed sudah diperbaiki lewat
// scripts/impor-mou.py, tapi data LIVE masih menyimpan nilai lama —
// patch ini menulis nilai baru itu ke dokumen live 037.
//
// Cakupan PERSIS 1 dokumen (`mou/037/...`) dan PERSIS 2 field (`pic`,
// `instansi`) — dokumen lain dan koleksi lain TIDAK disentuh. Total
// kontrak PNBP tidak berubah.
//
// Semua tulis lewat client SDK dengan kredensial pengguna yang login —
// JANGAN memakai Admin SDK atau service account (sama seperti migrasi
// MoU, src/lib/migrasiMou.ts).
//
// Sekali jalan TANPA dokumen guard `meta/` baru: firestore.rules hanya
// mengizinkan tiga dokumen guard bernama (migrasi, migrasi-kontrak-2026,
// migrasi-mou-2026), jadi guard baru butuh publish rules — patch ini
// dirancang supaya TIDAK butuh itu. Perlindungan jalan-dua-kali
// berasal dari prakondisi nilai live (src/lib/perbaikanMou037Rencana):
// bila dokumen 037 sudah bernilai baru, patch MENOLAK sebelum menulis
// apa pun. Tulis ke koleksi `mou` (update) sudah diizinkan operator di
// firestore.rules yang sudah dipublikasikan.
//
// URUTAN (tiap tahap dilaporkan lewat onKemajuan; bila gagal di tengah,
// error menyebut tahap yang sedang diproses):
//   1. baca-live — baca dokumen 037 live.
//   2. prakondisi — nilai live harus nilai lama yang diharapkan; bila
//      sudah bernilai baru atau nilainya di luar dugaan, batal SEBELUM
//      menulis apa pun.
//   3. tulis — update PERSIS 2 field (pic, instansi) pada dokumen 037.
//   4. verifikasi — baca ulang dokumen 037, cek pic + instansi bernilai
//      baru; bila gagal, lempar (JANGAN jalankan ulang; laporkan ke Digi).
//   5. audit — tulis SATU entri audit.

import {
  collection,
  doc,
  getDoc,
  updateDoc,
  type Firestore,
} from 'firebase/firestore';
import {
  KOLEKSI,
  kodeIdDokumen,
  tulisAudit,
} from './firestoreStore';
import { buatEntriAudit } from './audit';
import type { DummyUser } from './dummyUsers';
import {
  ID_MOU_037,
  INSTANSI_MOU_037_BARU,
  INSTANSI_MOU_037_LAMA,
  PERBAIKAN_MOU_037,
  PIC_MOU_037_BARU,
  PIC_MOU_037_LAMA,
  periksaPrakondisiPerbaikanMou037,
  verifikasiHasilPerbaikanMou037,
  type DokumenMou037Live,
} from './perbaikanMou037Rencana';

export type TahapPerbaikanMou037 =
  | 'baca-live'
  | 'prakondisi'
  | 'tulis'
  | 'verifikasi'
  | 'audit'
  | 'selesai';

export interface KemajuanPerbaikanMou037 {
  tahap: TahapPerbaikanMou037;
}

export interface HasilPerbaikanMou037 {
  tanggal: string;
  sebelum: { pic: string; instansi: string };
  sesudah: { pic: string; instansi: string };
}

/** True bila perbaikan MoU 037 sudah pernah dijalankan (nilai live sudah baru). */
export async function bacaStatusPerbaikanMou037(
  db: Firestore,
): Promise<{ sudah: boolean }> {
  const snap = await getDoc(
    doc(collection(db, KOLEKSI.mou), kodeIdDokumen(ID_MOU_037)),
  );
  if (!snap.exists()) return { sudah: false };
  const data = snap.data() as { pic?: string; instansi?: string };
  return {
    sudah:
      data.pic === PIC_MOU_037_BARU &&
      data.instansi === INSTANSI_MOU_037_BARU,
  };
}

/**
 * Jalankan perbaikan satu kali record MoU 037. Lempar Error (menyebut
 * tahap) bila dokumen tidak ada, prakondisi tidak terpenuhi, atau
 * verifikasi gagal — pemanggil (UI) menampilkan pesan itu apa adanya.
 */
export async function jalankanPerbaikanMou037(
  db: Firestore,
  pengguna: DummyUser,
  onKemajuan?: (k: KemajuanPerbaikanMou037) => void,
): Promise<HasilPerbaikanMou037> {
  const laporkan = (kemajuan: KemajuanPerbaikanMou037) =>
    onKemajuan?.(kemajuan);

  // 1. Baca live.
  laporkan({ tahap: 'baca-live' });
  const ref = doc(collection(db, KOLEKSI.mou), kodeIdDokumen(ID_MOU_037));
  const snapLive = await getDoc(ref);
  const dokLive: DokumenMou037Live = snapLive.exists()
    ? (snapLive.data() as DokumenMou037Live)
    : null;

  // 2. Prakondisi (SEBELUM menulis apa pun).
  laporkan({ tahap: 'prakondisi' });
  const masalahPrakondisi = periksaPrakondisiPerbaikanMou037(dokLive);
  if (masalahPrakondisi.length > 0) {
    throw new Error(
      `Preconditions not met — MoU 037 fix cancelled, nothing was written: ${masalahPrakondisi.join(' ')}`,
    );
  }

  const tanggal = new Date().toISOString();
  const sebelum = { pic: PIC_MOU_037_LAMA, instansi: INSTANSI_MOU_037_LAMA };

  // 3. Tulis — PERSIS 2 field pada dokumen 037.
  laporkan({ tahap: 'tulis' });
  try {
    await updateDoc(ref, {
      pic: PERBAIKAN_MOU_037.pic,
      instansi: PERBAIKAN_MOU_037.instansi,
    });
  } catch (e) {
    const pesan = e instanceof Error ? e.message : 'Unknown error.';
    throw new Error(
      `MoU 037 fix failed while writing (${pesan}) — do NOT run again; report this to Digi.`,
    );
  }

  // 4. Verifikasi — baca ulang dari Firestore, bukan dari memori.
  laporkan({ tahap: 'verifikasi' });
  const snapSesudah = await getDoc(ref);
  const dokSesudah: DokumenMou037Live = snapSesudah.exists()
    ? (snapSesudah.data() as DokumenMou037Live)
    : null;
  const masalahVerifikasi = verifikasiHasilPerbaikanMou037(dokSesudah);
  if (masalahVerifikasi.length > 0) {
    throw new Error(
      `Verification after MoU 037 fix FAILED — do NOT run again; report this to Digi: ${masalahVerifikasi.join(' ')}`,
    );
  }
  const sesudah = { pic: PIC_MOU_037_BARU, instansi: INSTANSI_MOU_037_BARU };

  // 5. SATU entri audit.
  laporkan({ tahap: 'audit' });
  const entri = buatEntriAudit(
    pengguna,
    'Perbaikan Data MoU 037',
    'mou',
    ID_MOU_037,
    `PIC ${sebelum.pic} / instansi ${sebelum.instansi}`,
    `PIC ${sesudah.pic} / instansi ${sesudah.instansi}`,
  );
  await tulisAudit(db, entri);

  laporkan({ tahap: 'selesai' });
  return { tanggal, sebelum, sesudah };
}

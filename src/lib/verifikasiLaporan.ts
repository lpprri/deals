// Checklist verifikasi laporan — EMPAT PERAN (keputusan pengguna
// 19/11/2026 20:43 WIB): verifikator (ahli madya / supervisor)
// mengecek bagian Report dan memberi checklist. Satu dokumen per
// jenis laporan + periode di koleksi `verifikasiLaporan`
// (id `{jenis}-{periode}`, mis. `bulanan-2026-02`); verifikator
// mencentang item dan menyimpan — operator dan user hanya MELIHAT
// keadaan checklist (read-only). Checklist TIDAK memblokir apa pun:
// tidak ada alur approve/reject — pengguna tidak memintanya.
// Item default diturunkan dari isi laporan itu sendiri (total
// kontrol, kelengkapan periode, rekonsiliasi) — BUKAN angka baru.
// Di mode contoh (Firebase belum terkonfigurasi), checklist hanya
// hidup di sesi (tidak tersimpan) — lihat `muatChecklist`.
//
// Modul MURNI sebisa mungkin: validasi + penggabungan checklist
// tersimpan dengan default tidak menyentuh Firebase (dipakai skrip
// cek); hanya muat/simpan yang memakai Firestore.

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseApp';
import type { SatkerRef } from './types';

export type JenisLaporanChecklist = 'bulanan' | 'piutang' | 'kantor-pusat';

export interface ItemChecklist {
  /** Id stabil item (untuk kunci render + penggabungan). */
  id: string;
  /** Label tampil — English (keputusan UI full-English). */
  label: string;
  /** Dicentang verifikator. */
  dicentang: boolean;
}

export interface ChecklistVerifikasi {
  /** Id dokumen: `{jenis}-{periode}`. */
  id: string;
  jenis: JenisLaporanChecklist;
  /** Periode laporan 'yyyy-mm'. */
  periode: string;
  satker: SatkerRef;
  item: ItemChecklist[];
  /** Nama/email terakhir yang menyimpan checklist. */
  diperiksaOleh?: string;
  /** Waktu simpan terakhir (ISO). */
  diperbaruiPada?: string;
}

/**
 * Item default per jenis laporan — diturunkan dari isi laporan
 * (total kontrol, kelengkapan periode, rekonsiliasi). Daftar ini
 * DEFAULT (dicatat di PR) — pengguna boleh mengoreksi.
 */
export const ITEM_CHECKLIST_DEFAULT: Record<
  JenisLaporanChecklist,
  { id: string; label: string }[]
> = {
  bulanan: [
    {
      id: 'total-kontrol',
      label: 'Control totals equal the sum of the report rows',
    },
    {
      id: 'tagihan-periode',
      label: 'Every contract in this period has an invoice',
    },
    {
      id: 'pembayaran-terverifikasi',
      label: 'Verified payments for this period are recorded',
    },
    {
      id: 'piutang-rekonsiliasi',
      label: 'Outstanding receivables (invoices minus payments) reconcile',
    },
    {
      id: 'kode-akun',
      label: 'Account codes match the PNBP type (Functional / General)',
    },
  ],
  piutang: [
    {
      id: 'umur-piutang',
      label: 'Receivable aging groups are correct',
    },
    {
      id: 'jatuh-tempo',
      label: 'Overdue invoices are flagged',
    },
    {
      id: 'pembayaran-cocok',
      label: 'Verified payments match the payment evidence',
    },
    {
      id: 'sisa-sama-kontrol',
      label: 'Outstanding total equals the control total',
    },
  ],
  'kantor-pusat': [
    {
      id: 'total-per-kode-akun',
      label: 'Totals per account code match the monthly report',
    },
    {
      id: 'satker-tercakup',
      label: 'All work units for this period are covered',
    },
    {
      id: 'baris-nol',
      label: 'No unexplained zero-value rows',
    },
  ],
};

/** Id dokumen checklist untuk jenis + periode. */
export function idChecklist(
  jenis: JenisLaporanChecklist,
  periode: string,
): string {
  return `${jenis}-${periode}`;
}

/** Checklist baru (semua item belum dicentang) untuk jenis + periode. */
export function checklistDefault(
  jenis: JenisLaporanChecklist,
  periode: string,
  satker: SatkerRef,
): ChecklistVerifikasi {
  return {
    id: idChecklist(jenis, periode),
    jenis,
    periode,
    satker,
    item: ITEM_CHECKLIST_DEFAULT[jenis].map((i) => ({
      ...i,
      dicentang: false,
    })),
  };
}

/**
 * Gabungkan checklist tersimpan dengan item default — MURNI (dipakai
 * skrip cek): keadaan centang item yang dikenal dipertahankan; item
 * default baru (bila daftar default bertambah) muncul belum
 * dicentang; item tersimpan yang tidak lagi ada di default dibuang.
 * Bila tersimpan bukan objek checklist yang valid, kembalikan default.
 */
export function terapkanChecklistTersimpan(
  tersimpan: unknown,
  bawaan: ChecklistVerifikasi,
): ChecklistVerifikasi {
  if (typeof tersimpan !== 'object' || tersimpan === null) return bawaan;
  const data = tersimpan as Record<string, unknown>;
  if (!Array.isArray(data.item)) return bawaan;
  const keadaan = new Map<string, boolean>();
  for (const it of data.item as Record<string, unknown>[]) {
    if (typeof it === 'object' && it !== null && typeof it.id === 'string') {
      keadaan.set(it.id, it.dicentang === true);
    }
  }
  const diperiksaOleh =
    typeof data.diperiksaOleh === 'string' && data.diperiksaOleh !== ''
      ? data.diperiksaOleh
      : undefined;
  const diperbaruiPada =
    typeof data.diperbaruiPada === 'string' && data.diperbaruiPada !== ''
      ? data.diperbaruiPada
      : undefined;
  return {
    ...bawaan,
    item: bawaan.item.map((i) => ({
      ...i,
      dicentang: keadaan.get(i.id) ?? false,
    })),
    ...(diperiksaOleh ? { diperiksaOleh } : {}),
    ...(diperbaruiPada ? { diperbaruiPada } : {}),
  };
}

/**
 * Muat checklist untuk jenis + periode. Bila Firebase belum
 * terkonfigurasi atau dokumen belum ada, kembalikan default
 * (belum dicentang) — panel menampilkan keadaan itu dengan jujur.
 */
export async function muatChecklist(
  jenis: JenisLaporanChecklist,
  periode: string,
  satker: SatkerRef,
): Promise<ChecklistVerifikasi> {
  const bawaan = checklistDefault(jenis, periode, satker);
  if (!isFirebaseConfigured || !db) return bawaan;
  try {
    const snap = await getDoc(doc(db, 'verifikasiLaporan', bawaan.id));
    if (!snap.exists()) return bawaan;
    return terapkanChecklistTersimpan(snap.data(), bawaan);
  } catch {
    return bawaan;
  }
}

/** Simpan checklist (hanya verifikator — ditegakkan firestore.rules). */
export async function simpanChecklist(
  checklist: ChecklistVerifikasi,
  diperiksaOleh: string,
): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase belum terkonfigurasi — checklist hanya tersimpan di sesi ini.');
  }
  await setDoc(doc(db, 'verifikasiLaporan', checklist.id), {
    ...checklist,
    diperiksaOleh,
    diperbaruiPada: new Date().toISOString(),
  });
}

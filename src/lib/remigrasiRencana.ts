// Rencana re-migrasi data kontrak 2026 (PR #53) — logika MURNI, tanpa
// Firebase. Dipisah dari src/lib/remigrasi.ts supaya bisa diuji lewat
// skrip cek (Node) tanpa menarik Firebase SDK — pola yang sama dengan
// lacakHasil.ts (murni) vs lacakFunction.ts (Firebase).
//
// LATAR: PR #52 mengganti 40 kontrak 2026 di SEED (src/lib/seedNyata.ts)
// dengan file baru pengguna, tapi data LIVE di Firestore masih data lama.
// Re-migrasi ini menyamakan data live dengan seed: hapus lalu tulis ulang
// 5 koleksi saja (klien, kontrak, tagihan, pembayaran, denda).
//
// ATURAN YANG TIDAK BOLEH DILANGGAR modul ini:
// - Cakupan PERSIS 5 koleksi di atas; koleksi lain tidak pernah disentuh.
// - Prakondisi: hitungan live HARUS persis kontrak 42, tagihan 42,
//   pembayaran 42, denda 13, klien 33 — bila tidak, batalkan sebelum
//   menghapus apa pun.
// - Atribusi operator (operatorPenutup + tanggalTandaTangan) diambil dari
//   LIVE (sumber kebenaran), bukan dari seed — seed sudah memuat nilai
//   yang sama, tapi live yang dipakai.
// - Kedua kontrak 2025 (Darojad, PT VGreen) HARUS ada sesudah migrasi.

import { hitungTotalKontrol } from './derive';
import type { AppData, Kontrak } from './types';

/** Koleksi yang diganti re-migrasi — PERSIS lima ini, urutan = urutan proses. */
export const KOLEKSI_REMIGRASI = [
  'klien',
  'kontrak',
  'tagihan',
  'pembayaran',
  'denda',
] as const;

export type KunciRemigrasi = (typeof KOLEKSI_REMIGRASI)[number];

/** Id dokumen guard re-migrasi di bawah `meta/` (terpisah dari `meta/migrasi`). */
export const ID_GUARD_REMIGRASI = 'migrasi-kontrak-2026';
/** Id dokumen guard migrasi pertama — guard baru TIDAK BOLEH sama dengan ini. */
export const ID_GUARD_MIGRASI_PERTAMA = 'migrasi';

/**
 * Hitungan live yang DIHARAPKAN sebelum re-migrasi (data hasil migrasi
 * pertama 2026-11-14 + PR #52 belum diterapkan ke live). Bila hitungan
 * live berbeda, data live sudah berubah dari yang diharapkan — batalkan.
 */
export const HITUNGAN_LIVE_DIHARAPKAN: Record<KunciRemigrasi, number> = {
  klien: 33,
  kontrak: 42,
  tagihan: 42,
  pembayaran: 42,
  denda: 13,
};

/** Hitungan sesudah re-migrasi = hitungan seed pasca-PR #52. */
export const HITUNGAN_SEED: Record<KunciRemigrasi, number> = {
  klien: 33,
  kontrak: 42,
  tagihan: 42,
  pembayaran: 45,
  denda: 12,
};

/** Empat total kontrol yang dicek re-migrasi (angka PR #52). */
export interface TotalKontrolRemigrasi {
  nilaiKontrak: number;
  totalPembayaranTerverifikasi: number;
  sisaPiutang: number;
  totalDenda: number;
}

/** Total kontrol sesudah re-migrasi (angka PR #52, diverifikasi skrip cek). */
export const TOTAL_KONTROL_TARGET: TotalKontrolRemigrasi = {
  nilaiKontrak: 441863375,
  totalPembayaranTerverifikasi: 362329255,
  sisaPiutang: 14084869,
  totalDenda: 6219250,
};

/** Dua kontrak 2025 yang dipertahankan (kerja sama masih berjalan). */
export const KONTRAK_2025_WAJIB = [
  '016/PKS/DIR.LPU/06/2025',
  '027/RRI.PLB/PKS.U/06/2025',
] as const;

export interface HitunganRemigrasi {
  hitungan: Record<KunciRemigrasi, number>;
  total: TotalKontrolRemigrasi;
}

export interface PratinjauRemigrasi {
  sebelum: HitunganRemigrasi;
  sesudah: HitunganRemigrasi;
}

/**
 * Periksa prakondisi: hitungan live harus persis sama dengan yang
 * diharapkan. Kembalikan daftar masalah (kosong = lolos). Setiap masalah
 * menyebut nama koleksinya supaya pesan batalnya jelas.
 */
export function periksaPrakondisi(
  hitunganLive: Record<KunciRemigrasi, number>,
): string[] {
  const masalah: string[] = [];
  for (const kunci of KOLEKSI_REMIGRASI) {
    const diharapkan = HITUNGAN_LIVE_DIHARAPKAN[kunci];
    const aktual = hitunganLive[kunci];
    if (aktual !== diharapkan) {
      masalah.push(
        `Live ${kunci} has ${aktual ?? 0} documents, expected ${diharapkan} — live data has changed from the first migration; re-migration cancelled.`,
      );
    }
  }
  return masalah;
}

/**
 * Gabungkan atribusi live ke kontrak seed: untuk tiap kontrak seed, bila
 * kontrak live dengan id yang sama punya operatorPenutup /
 * tanggalTandaTangan, pakai nilai LIVE; bila live tidak menyimpannya,
 * pertahankan nilai seed. Live adalah sumber kebenaran atribusi.
 */
export function gabungkanAtribusiLive(
  kontrakSeed: Kontrak[],
  kontrakLive: Pick<Kontrak, 'id' | 'operatorPenutup' | 'tanggalTandaTangan'>[],
): Kontrak[] {
  const livePerId = new Map(kontrakLive.map((k) => [k.id, k]));
  return kontrakSeed.map((k) => {
    const live = livePerId.get(k.id);
    if (!live) return k;
    return {
      ...k,
      operatorPenutup: live.operatorPenutup ?? k.operatorPenutup,
      tanggalTandaTangan: live.tanggalTandaTangan ?? k.tanggalTandaTangan,
    };
  });
}

/**
 * Hitung 4 total kontrol dari 5 koleksi dalam cakupan saja (dipakai
 * pratinjau SEBELUM dari data live dan verifikasi SESUDAH). Memakai
 * hitungTotalKontrol (satu sumber hitung) di atas AppData parsial —
 * hanya 4 total ini yang dibaca; selisih rekonsiliasi tidak dipakai di
 * sini karena penerimaanAcuan di luar cakupan.
 */
export function hitungTotalRemigrasi(
  bagian: Pick<
    AppData,
    'klien' | 'kontrak' | 'tagihan' | 'pembayaran' | 'denda'
  >,
): TotalKontrolRemigrasi {
  const k = hitungTotalKontrol({
    ...bagian,
    penerimaanAcuan: [],
  } as unknown as AppData);
  return {
    nilaiKontrak: k.nilaiKontrak,
    totalPembayaranTerverifikasi: k.totalPembayaranTerverifikasi,
    sisaPiutang: k.sisaPiutang,
    totalDenda: k.totalDenda,
  };
}

/**
 * Verifikasi hasil re-migrasi atas data LENGKAP (seed, atau live yang
 * dibaca ulang + koleksi luar cakupan dari seed). Kembalikan daftar
 * masalah (kosong = lolos): hitungan 5 koleksi, 4 total kontrol, dan
 * kedua kontrak 2025 harus ada.
 */
export function verifikasiHasil(data: AppData): string[] {
  const masalah: string[] = [];
  for (const kunci of KOLEKSI_REMIGRASI) {
    const diharapkan = HITUNGAN_SEED[kunci];
    const aktual = data[kunci].length;
    if (aktual !== diharapkan) {
      masalah.push(
        `${kunci} has ${aktual} documents, expected ${diharapkan}.`,
      );
    }
  }
  const total = hitungTotalRemigrasi(data);
  (Object.keys(TOTAL_KONTROL_TARGET) as (keyof typeof TOTAL_KONTROL_TARGET)[]).forEach(
    (kunci) => {
      if (total[kunci] !== TOTAL_KONTROL_TARGET[kunci]) {
        masalah.push(
          `${kunci} is Rp${total[kunci].toLocaleString('id-ID')}, expected Rp${TOTAL_KONTROL_TARGET[kunci].toLocaleString('id-ID')}.`,
        );
      }
    },
  );
  for (const nomor of KONTRAK_2025_WAJIB) {
    if (!data.kontrak.some((k) => k.id === nomor)) {
      masalah.push(`2025 contract ${nomor} is missing after re-migration.`);
    }
  }
  return masalah;
}

/**
 * Rencana tulis: urutan koleksi, jumlah hapus (dari hitungan live yang
 * diharapkan) dan jumlah tulis (dari hitungan seed). Dipakai UI untuk
 * progres dan skrip cek untuk memastikan cakupan tidak melebar.
 */
export function rencanaTulis(): {
  koleksi: KunciRemigrasi;
  hapus: number;
  tulis: number;
}[] {
  return KOLEKSI_REMIGRASI.map((koleksi) => ({
    koleksi,
    hapus: HITUNGAN_LIVE_DIHARAPKAN[koleksi],
    tulis: HITUNGAN_SEED[koleksi],
  }));
}

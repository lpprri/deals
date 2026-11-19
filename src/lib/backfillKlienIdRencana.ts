// Rencana backfill klienId ke data live Firestore (dua peran
// 19/11/2026) — logika MURNI, tanpa Firebase. Dipisah dari
// src/lib/backfillKlienId.ts supaya bisa diuji lewat skrip cek (Node)
// tanpa menarik Firebase SDK — pola yang sama dengan
// migrasiMouRencana.ts (murni) vs migrasiMou.ts (Firebase).
//
// LATAR: aturan Firestore baca-klien hanya mengizinkan client membaca
// dokumen yang `klienId`-nya sama dengan klienId di profilnya — jadi
// tagihan, pembayaran, denda, dan dokumen live HARUS membawa klienId
// (kontrak sudah punya sejak impor). Data live ditulis SEBELUM field
// ini ada, jadi backfill satu kali ini menambahkannya dari rantai
// induk yang sudah ada: tagihan/dokumen ← kontrak.klienId,
// pembayaran/denda ← tagihan → kontrak.klienId, MoU ← pencocokan nama
// instansi persis (KLIEN_MOU di bawah). Commitment: NOL yang ditautkan
// (tidak ada nama mitra yang cocok persis — lihat types.ts).
//
// ATURAN YANG TIDAK BOLEH DILANGGAR modul ini:
// - Cakupan PERSIS 5 koleksi tulis: tagihan, pembayaran, denda,
//   dokumen, mou. Koleksi lain (termasuk kontrak, klien, commitment)
//   TIDAK PERNAH ditulis — commitment hanya DIVERIFIKASI (0 klienId).
// - Hanya field `klienId` yang ditulis (update parsial — dokumen lain
//   dan field lain TIDAK disentuh); dokumen yang sudah punya klienId
//   yang benar DILEWATI, yang punya klienId SALAH membuat backfill
//   GAGAL (bukan ditimpa diam-diam).
// - Prakondisi: hitungan live harus sama dengan seed (42 tagihan,
//   45 pembayaran, 12 denda, 102 dokumen, 44 MoU) — bila live berubah,
//   batalkan SEBELUM menulis apa pun. Guard `meta/backfill-klienId-2026`
//   mencegah jalan dua kali.
// - Total kontrak PNBP TIDAK BOLEH berubah: 42 kontrak, nilai
//   Rp441.863.375.

import type { AppData } from './types';

/** Koleksi yang DITULIS backfill klienId — PERSIS lima ini. */
export const KOLEKSI_BACKFILL_KLIENID = [
  'tagihan',
  'pembayaran',
  'denda',
  'dokumen',
  'mou',
] as const;

export type KunciBackfillKlienId = (typeof KOLEKSI_BACKFILL_KLIENID)[number];

/** Id dokumen guard backfill klienId di bawah `meta/`. */
export const ID_GUARD_BACKFILL_KLIENID = 'backfill-klienId-2026';
/** Id dokumen guard migrasi pertama — guard baru TIDAK BOLEH sama. */
export const ID_GUARD_MIGRASI_PERTAMA = 'migrasi';
/** Id dokumen guard re-migrasi kontrak — guard baru TIDAK BOLEH sama. */
export const ID_GUARD_REMIGRASI_KONTRAK = 'migrasi-kontrak-2026';
/** Id dokumen guard migrasi MoU — guard baru TIDAK BOLEH sama. */
export const ID_GUARD_MIGRASI_MOU = 'migrasi-mou-2026';
/** Id dokumen guard migrasi Commitment — guard baru TIDAK BOLEH sama. */
export const ID_GUARD_MIGRASI_COMMITMENT = 'migrasi-commitment-2026';

/** Hitungan live yang diharapkan (sama dengan seed saat ini). */
export const HITUNGAN_BACKFILL_DIHARAPKAN = {
  tagihan: 42,
  pembayaran: 45,
  denda: 12,
  dokumen: 102,
  mou: 44,
} as const;

/**
 * Tautan MoU → klien — HANYA bila nama instansi MoU sama PERSIS dengan
 * nama record klien (pencocokan nama persis, bukan kemiripan). Map ini
 * HARUS sama dengan KLIEN_MOU di scripts/impor-mou.py (skrip cek
 * mengasersi keduanya identik). Near-miss yang SENGAJA tidak ditautkan:
 * 039 "Dinas Komunikasi dan Informatika Kabupaten Ogan Komering Ulu"
 * (tanpa "Selatan") — bukan KLN-014.
 */
export const KLIEN_MOU: Record<string, string> = {
  '035/RRI-PLB/KJM.02.04/08/2026': 'KLN-030',
  '043/RRI-PLB/KJM.02.04/10/2026': 'KLN-014',
  '045/RRI-PLB/KJM.02.04/10/2026': 'KLN-009',
};

/** Total kontrol kontrak PNBP — TIDAK BOLEH berubah oleh backfill. */
export const TOTAL_KONTROL_KONTRAK = {
  jumlahKontrak: 42,
  nilaiKontrak: 441863375,
} as const;

export interface RingkasanLiveBackfill {
  jumlahTagihan: number;
  jumlahPembayaran: number;
  jumlahDenda: number;
  jumlahDokumen: number;
  jumlahMou: number;
  /** Dokumen yang induknya tidak ditemukan di live (id-nya). */
  indukHilang: string[];
}

/**
 * Periksa prakondisi: hitungan live harus sama dengan seed, dan semua
 * induk (kontrak/tagihan) harus ada. Kembalikan daftar masalah
 * (kosong = lolos).
 */
export function periksaPrakondisiBackfillKlienId(
  ringkasan: RingkasanLiveBackfill,
): string[] {
  const masalah: string[] = [];
  const cekHitungan = (nama: string, ada: number, diharapkan: number) => {
    if (ada !== diharapkan) {
      masalah.push(
        `Live ${nama} has ${ada} documents, expected ${diharapkan} — live data changed since the seed; backfill cancelled.`,
      );
    }
  };
  cekHitungan('tagihan', ringkasan.jumlahTagihan, HITUNGAN_BACKFILL_DIHARAPKAN.tagihan);
  cekHitungan('pembayaran', ringkasan.jumlahPembayaran, HITUNGAN_BACKFILL_DIHARAPKAN.pembayaran);
  cekHitungan('denda', ringkasan.jumlahDenda, HITUNGAN_BACKFILL_DIHARAPKAN.denda);
  cekHitungan('dokumen', ringkasan.jumlahDokumen, HITUNGAN_BACKFILL_DIHARAPKAN.dokumen);
  cekHitungan('mou', ringkasan.jumlahMou, HITUNGAN_BACKFILL_DIHARAPKAN.mou);
  for (const id of ringkasan.indukHilang) {
    masalah.push(
      `Document ${id} has no parent (contract/invoice) in live data — backfill cannot determine its klienId; backfill cancelled.`,
    );
  }
  return masalah;
}

/**
 * Verifikasi hasil backfill atas data lengkap (live yang dibaca ulang).
 * Kembalikan daftar masalah (kosong = lolos): setiap tagihan/
 * pembayaran/denda/dokumen punya klienId yang cocok dengan rantai
 * induknya, tepat 3 MoU punya klienId (sesuai KLIEN_MOU), 0 Commitment
 * punya klienId, dan total kontrak PNBP tidak berubah.
 */
export function verifikasiHasilBackfillKlienId(
  data: Pick<AppData, 'kontrak' | 'tagihan' | 'pembayaran' | 'denda' | 'dokumen' | 'mou' | 'commitment'>,
): string[] {
  const masalah: string[] = [];
  const klienKontrak = new Map(data.kontrak.map((k) => [k.id, k.klienId]));
  const klienTagihan = new Map<string, string>();
  for (const t of data.tagihan) {
    const klienId = klienKontrak.get(t.kontrakId);
    if (!klienId) {
      masalah.push(`tagihan ${t.id} has kontrakId ${t.kontrakId} with no contract.`);
      continue;
    }
    klienTagihan.set(t.id, klienId);
    if (t.klienId !== klienId) {
      masalah.push(
        `tagihan ${t.id} has klienId ${t.klienId ?? '(kosong)'}, expected ${klienId}.`,
      );
    }
  }
  for (const p of data.pembayaran) {
    const klienId = klienTagihan.get(p.tagihanId);
    if (!klienId) {
      masalah.push(`pembayaran ${p.id} has tagihanId ${p.tagihanId} with no invoice.`);
      continue;
    }
    if (p.klienId !== klienId) {
      masalah.push(
        `pembayaran ${p.id} has klienId ${p.klienId ?? '(kosong)'}, expected ${klienId}.`,
      );
    }
  }
  for (const d of data.denda) {
    const klienId = klienTagihan.get(d.tagihanId);
    if (!klienId) {
      masalah.push(`denda ${d.id} has tagihanId ${d.tagihanId} with no invoice.`);
      continue;
    }
    if (d.klienId !== klienId) {
      masalah.push(
        `denda ${d.id} has klienId ${d.klienId ?? '(kosong)'}, expected ${klienId}.`,
      );
    }
  }
  for (const d of data.dokumen) {
    const klienId = klienKontrak.get(d.kontrakId);
    if (!klienId) {
      masalah.push(`dokumen ${d.id} has kontrakId ${d.kontrakId} with no contract.`);
      continue;
    }
    if (d.klienId !== klienId) {
      masalah.push(
        `dokumen ${d.id} has klienId ${d.klienId ?? '(kosong)'}, expected ${klienId}.`,
      );
    }
  }
  const mouTertaut = data.mou.filter((m) => m.klienId);
  if (mouTertaut.length !== Object.keys(KLIEN_MOU).length) {
    masalah.push(
      `mou has ${mouTertaut.length} linked records, expected ${Object.keys(KLIEN_MOU).length}.`,
    );
  }
  for (const m of mouTertaut) {
    const diharapkan = KLIEN_MOU[m.id];
    if (!diharapkan) {
      masalah.push(`mou ${m.id} is linked to ${m.klienId} but is not in KLIEN_MOU.`);
    } else if (m.klienId !== diharapkan) {
      masalah.push(`mou ${m.id} has klienId ${m.klienId}, expected ${diharapkan}.`);
    }
  }
  const commitmentTertaut = data.commitment.filter((c) => c.klienId);
  if (commitmentTertaut.length !== 0) {
    masalah.push(
      `commitment has ${commitmentTertaut.length} linked records, expected 0 — backfill must not link Commitment.`,
    );
  }
  if (data.kontrak.length !== TOTAL_KONTROL_KONTRAK.jumlahKontrak) {
    masalah.push(
      `kontrak has ${data.kontrak.length} documents, expected ${TOTAL_KONTROL_KONTRAK.jumlahKontrak} — backfill must not touch contracts.`,
    );
  }
  const nilaiKontrak = data.kontrak.reduce((s, k) => s + (k.nilaiKontrak ?? 0), 0);
  if (nilaiKontrak !== TOTAL_KONTROL_KONTRAK.nilaiKontrak) {
    masalah.push(
      `nilaiKontrak is Rp${nilaiKontrak.toLocaleString('id-ID')}, expected Rp${TOTAL_KONTROL_KONTRAK.nilaiKontrak.toLocaleString('id-ID')} — backfill must not touch contracts.`,
    );
  }
  return masalah;
}

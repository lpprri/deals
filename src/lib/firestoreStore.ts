// Lapisan data Firestore — aktivasi Firebase aplikasi "Partnership LPP RRI".
// (PRD v2.0 Final + Amandemen v2.1; keputusan pengguna 14/11/2026 21:29 WIB:
// HANYA ADA 1 ROLE — Operator, staf Layanan & Pengembangan Usaha. Lapisan
// ini tidak mengenal peran lain; yang dikenal hanya satker pengguna.)
//
// TIGA MODE DATA (pemanggil — App.tsx — yang memilih; modul ini tidak
// mengubah derive.ts atau logika hitung apa pun):
//   (a) Firebase TIDAK terkonfigurasi
//       → pakai DATA_NYATA (src/lib/seedNyata.ts), session-only. Perubahan
//         hilang saat refresh; UI wajib melabelinya dengan jujur.
//   (b) Firebase terkonfigurasi TAPI `meta/migrasi` belum ada
//       → tetap pakai DATA_NYATA, dengan label jujur
//         "Data contoh — belum dimigrasi ke Firestore". Jangan pura-pura
//         datanya sudah tersimpan permanen.
//   (c) Firebase terkonfigurasi DAN `meta/migrasi` sudah ada
//       → muat dari Firestore lewat muatDariFirestore(); aksi tulis
//         menyimpan perubahan lewat simpanDokumen()/tulisAudit().
//
// ATURAN PENAMAAN:
// - Satu koleksi per kunci AppData, namanya = nama kunci itu sendiri
//   (lihat KOLEKSI). Satu dokumen per entitas.
// - Id dokumen = id entitas, KECUALI bila id mengandung '/' (lihat
//   kodeIdDokumen). Firestore melarang '/' di id dokumen karena '/' adalah
//   pemisah path. Seluruh 42 id kontrak nyata mengandung '/' (id kontrak =
//   nomor PKS, mis. "001/PKS/DIR.LPU/01/2026"), jadi id dokumen kontrak
//   adalah bentuk encodeURIComponent-nya ("001%2FPKS%2FDIR.LPU%2F01%2F2026").
//   Field `id` di DALAM dokumen tetap berisi id entitas asli, dan semua
//   tautan antar-entitas (kontrakId, tagihanId, dst.) tetap memakai id asli.
//   Pemanggil TIDAK PERLU meng-encode sendiri: simpanDokumen() meng-encode,
//   muatDariFirestore() memakai field `id` dari dokumen.
// - `dokumen`, `audit`, dan `artikelKB` (Fase C) TIDAK punya field
//   `satker` (lihat types.ts), jadi dibaca tanpa filter satker.
//   Konsekuensinya: di tingkat nasional, koleksi `dokumen` memuat dokumen
//   SEMUA satker dan `audit` memuat audit SEMUA satker — lihat daftar risiko
//   di laporan integrasi. Dokumen tetap terikat ke kontrak satker ini lewat
//   kontrakId; `artikelKB` memang bersifat nasional (Regulasi & SOP).
// - `penerimaanAcuan` adalah data acuan Keuangan — READ-ONLY (PRD Bab 6.5).
//   Lapisan ini hanya membacanya; tidak ada aksi tulis yang menyentuhnya.
//
// MIGRASI SATU KALI (bukan di file ini; dikerjakan koordinator):
// tulis SEMUA koleksi dulu, tulis dokumen `meta/migrasi` PALING AKHIR —
// cekSudahDimigrasi() tidak boleh bernilai true untuk migrasi yang baru
// setengah jalan. Penulis migrasi wajib memakai kodeIdDokumen() yang sama
// untuk id dokumen, supaya muatDariFirestore() menemukannya kembali.

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { AppData, AuditEntry } from './types';

/** Nama koleksi Firestore untuk tiap kunci AppData (nama kunci = nama koleksi). */
export const KOLEKSI: Record<keyof AppData, string> = {
  klien: 'klien',
  kontrak: 'kontrak',
  dokumen: 'dokumen',
  tagihan: 'tagihan',
  pembayaran: 'pembayaran',
  denda: 'denda',
  sewa: 'sewa',
  pengajuan: 'pengajuan',
  pengajuanKlien: 'pengajuanKlien',
  penerimaanAcuan: 'penerimaanAcuan',
  audit: 'audit',
  prospect: 'prospect',
  quotation: 'quotation',
  order: 'order',
  meeting: 'meeting',
  event: 'event',
  advertisement: 'advertisement',
  task: 'task',
  tiket: 'tiket',
  umpanBalik: 'umpanBalik',
  artikelKB: 'artikelKB',
};

/** Kunci AppData yang entitasnya TIDAK punya field `satker`. */
export const KUNCI_TANPA_SATKER: ReadonlySet<keyof AppData> = new Set([
  'dokumen',
  'audit',
  // Fase C — Service: artikel Knowledge Base bersifat nasional.
  'artikelKB',
]);

/**
 * Id dokumen Firestore untuk sebuah id entitas.
 * Firestore melarang '/' di id dokumen; encodeURIComponent mengubah '/'
 * menjadi '%2F' (dan '#' menjadi '%23') sehingga pemetaan ini reversibel
 * dan deterministis. Id tanpa karakter terlarang tidak berubah.
 * Dipakai simpanDokumen(); penulis migrasi satu kali WAJIB memakai yang sama.
 */
export function kodeIdDokumen(idEntitas: string): string {
  return encodeURIComponent(idEntitas);
}

/** Kebalikan kodeIdDokumen — dipakai hanya bila dokumen lama tanpa field `id`. */
export function idEntitasDariDokumen(idDokumen: string): string {
  try {
    return decodeURIComponent(idDokumen);
  } catch {
    return idDokumen;
  }
}

/**
 * Hapus nilai `undefined` secara rekursif (objek bersarang dan array).
 * Firestore menolak `undefined` di kedalaman mana pun; data aplikasi
 * memakai `undefined` untuk field opsional yang kosong (mis. `npwp?`,
 * `catatan?`, `hasilKonversi?`), jadi setiap tulis harus dibersihkan dulu.
 */
export function bersihkanUndefined<T>(nilai: T): T {
  if (Array.isArray(nilai)) {
    return nilai.map((item) => bersihkanUndefined(item)) as T;
  }
  if (nilai !== null && typeof nilai === 'object') {
    const bersih: Record<string, unknown> = {};
    for (const [kunci, isi] of Object.entries(nilai as Record<string, unknown>)) {
      if (isi !== undefined) bersih[kunci] = bersihkanUndefined(isi);
    }
    return bersih as T;
  }
  return nilai;
}

/** Field array yang wajib ada di dokumen lama; diisi [] bila tidak ada. */
const ARRAY_WAJIB: Partial<Record<keyof AppData, string[]>> = {
  kontrak: ['layanan'],
  sewa: ['riwayatHarga', 'temuan'],
  prospect: ['riwayat'],
  tiket: ['balasan'],
  umpanBalik: ['jawaban'],
};

/**
 * Normalisasi satu dokumen Firestore menjadi entitas aplikasi.
 * - `id` diambil dari field `id` di dokumen; bila dokumen lama tidak
 *   menyimpannya, dipakai id dokumen yang di-decode.
 * - Field array yang hilang diisi [] (dokumen lama / tulis parsial).
 * - `satker` yang hilang pada entitas bersatker diisi fallback dari
 *   satker yang sedang dimuat (tidak mungkin terjadi pada hasil query
 *   terfilter, tapi aman bila dokumen ditulis manual di console).
 */
function normalisasiEntitas<K extends keyof AppData>(
  kunci: K,
  idDokumen: string,
  data: Record<string, unknown>,
  satkerKode: string,
): AppData[K][number] {
  const entitas: Record<string, unknown> = { ...data };
  if (typeof entitas.id !== 'string' || entitas.id === '') {
    entitas.id = idEntitasDariDokumen(idDokumen);
  }
  for (const field of ARRAY_WAJIB[kunci] ?? []) {
    if (!Array.isArray(entitas[field])) entitas[field] = [];
  }
  if (!KUNCI_TANPA_SATKER.has(kunci)) {
    const satker = entitas.satker as { kode?: unknown; nama?: unknown } | null;
    if (!satker || typeof satker !== 'object' || typeof satker.kode !== 'string') {
      entitas.satker = { kode: satkerKode, nama: satkerKode };
    }
  }
  return entitas as unknown as AppData[K][number];
}

/**
 * True bila migrasi satu kali sudah pernah dijalankan: dokumen
 * `meta/migrasi` ada. Dokumen ini ditulis PALING AKHIR oleh migrasi.
 */
export async function cekSudahDimigrasi(db: Firestore): Promise<boolean> {
  const snap = await getDoc(doc(db, 'meta', 'migrasi'));
  return snap.exists();
}

/**
 * Muat seluruh AppData satker ini dari Firestore.
 * - Bila `meta/migrasi` TIDAK ada → null (pemanggil memakai DATA_NYATA
 *   dengan label mode (b) "Data contoh — belum dimigrasi ke Firestore").
 * - Koleksi yang entitasnya punya `satker` difilter
 *   `where('satker.kode', '==', satkerKode)`; `dokumen`, `audit`, dan
 *   `artikelKB` dibaca tanpa filter (tidak punya satker; dokumen terikat ke
 *   kontrak lewat kontrakId, audit bersifat global, artikelKB nasional).
 * - Selalu mengembalikan AppData lengkap; koleksi kosong → array kosong,
 *   bukan undefined.
 */
export async function muatDariFirestore(
  db: Firestore,
  satkerKode: string,
): Promise<AppData | null> {
  if (!(await cekSudahDimigrasi(db))) return null;
  const hasil = {} as Record<keyof AppData, unknown[]>;
  await Promise.all(
    (Object.keys(KOLEKSI) as (keyof AppData)[]).map(async (kunci) => {
      const ref = collection(db, KOLEKSI[kunci]);
      const snap = KUNCI_TANPA_SATKER.has(kunci)
        ? await getDocs(ref)
        : await getDocs(query(ref, where('satker.kode', '==', satkerKode)));
      hasil[kunci] = snap.docs.map((d) =>
        normalisasiEntitas(kunci, d.id, d.data() as Record<string, unknown>, satkerKode),
      );
    }),
  );
  return hasil as AppData;
}

/**
 * Muat data milik SATU klien untuk Client Order Portal (Fase C, Q-10).
 * Dipakai App saat pengguna login adalah klien — muatDariFirestore()
 * TIDAK bisa dipakai klien karena query-nya dibatasi aturan Operator.
 * Hanya memakai SATU filter `where` per query supaya tidak butuh
 * composite index di console: kontrak & pengajuanKlien difilter
 * `klienId`, tagihan/dokumen difilter `kontrakId`, pembayaran difilter
 * `tagihanId` (operator `in`, dipotong per 30 — batas Firestore).
 * Koleksi lain dikembalikan kosong; portal hanya memakai irisan ini.
 * `dokumen` dibaca tanpa filter satker (tidak punya field satker) tapi
 * tetap hanya dokumen dari kontrak klien itu (lewat kontrakId).
 */
export async function muatDataKlien(
  db: Firestore,
  satkerKode: string,
  klienId: string,
): Promise<AppData> {
  if (!(await cekSudahDimigrasi(db))) {
    throw new Error('Data belum dimigrasi ke Firestore.');
  }
  const kosong: AppData = {
    klien: [],
    kontrak: [],
    dokumen: [],
    tagihan: [],
    pembayaran: [],
    denda: [],
    sewa: [],
    pengajuan: [],
    pengajuanKlien: [],
    penerimaanAcuan: [],
    audit: [],
    prospect: [],
    quotation: [],
    order: [],
    meeting: [],
    event: [],
    advertisement: [],
    task: [],
    tiket: [],
    umpanBalik: [],
    artikelKB: [],
  };
  const potong30 = <T,>(daftar: T[]): T[][] => {
    const hasil: T[][] = [];
    for (let i = 0; i < daftar.length; i += 30) hasil.push(daftar.slice(i, i + 30));
    return hasil;
  };
  const klienSnap = await getDoc(doc(db, KOLEKSI.klien, kodeIdDokumen(klienId)));
  if (klienSnap.exists()) {
    kosong.klien = [
      normalisasiEntitas('klien', klienSnap.id, klienSnap.data(), satkerKode),
    ];
  }
  const kontrakSnap = await getDocs(
    query(collection(db, KOLEKSI.kontrak), where('klienId', '==', klienId)),
  );
  kosong.kontrak = kontrakSnap.docs.map((d) =>
    normalisasiEntitas('kontrak', d.id, d.data() as Record<string, unknown>, satkerKode),
  );
  const kontrakIds = kosong.kontrak.map((k) => k.id);
  const tagihan: AppData['tagihan'] = [];
  for (const potong of potong30(kontrakIds)) {
    if (potong.length === 0) continue;
    const snap = await getDocs(
      query(collection(db, KOLEKSI.tagihan), where('kontrakId', 'in', potong)),
    );
    tagihan.push(
      ...snap.docs.map((d) =>
        normalisasiEntitas('tagihan', d.id, d.data() as Record<string, unknown>, satkerKode),
      ),
    );
  }
  kosong.tagihan = tagihan;
  const dokumen: AppData['dokumen'] = [];
  for (const potong of potong30(kontrakIds)) {
    if (potong.length === 0) continue;
    const snap = await getDocs(
      query(collection(db, KOLEKSI.dokumen), where('kontrakId', 'in', potong)),
    );
    dokumen.push(
      ...snap.docs.map((d) =>
        normalisasiEntitas('dokumen', d.id, d.data() as Record<string, unknown>, satkerKode),
      ),
    );
  }
  kosong.dokumen = dokumen;
  const tagihanIds = tagihan.map((t) => t.id);
  const pembayaran: AppData['pembayaran'] = [];
  for (const potong of potong30(tagihanIds)) {
    if (potong.length === 0) continue;
    const snap = await getDocs(
      query(collection(db, KOLEKSI.pembayaran), where('tagihanId', 'in', potong)),
    );
    pembayaran.push(
      ...snap.docs.map((d) =>
        normalisasiEntitas('pembayaran', d.id, d.data() as Record<string, unknown>, satkerKode),
      ),
    );
  }
  kosong.pembayaran = pembayaran;
  const pengajuanKlienSnap = await getDocs(
    query(
      collection(db, KOLEKSI.pengajuanKlien),
      where('klienId', '==', klienId),
    ),
  );
  kosong.pengajuanKlien = pengajuanKlienSnap.docs.map((d) =>
    normalisasiEntitas(
      'pengajuanKlien',
      d.id,
      d.data() as Record<string, unknown>,
      satkerKode,
    ),
  );
  return kosong;
}

/**
 * Tulis (buat/ubah, overwrite penuh) satu dokumen entitas.
 * `id` adalah id ENTITAS (mis. nomor PKS kontrak) — peng-encode-an ke id
 * dokumen dilakukan di sini. Dipakai pemanggil SETELAH `setData` berhasil
 * pada tiap aksi tulis (lihat spesifikasi integrasi di laporan).
 */
export async function simpanDokumen(
  db: Firestore,
  koleksi: string,
  id: string,
  data: unknown,
): Promise<void> {
  await setDoc(
    doc(db, koleksi, kodeIdDokumen(id)),
    bersihkanUndefined(data) as Record<string, unknown>,
  );
}

/**
 * Tambah satu entri audit (append-only). addDoc menghasilkan id dokumen
 * otomatis; field `id` entri (mis. "AUD-...") tetap tersimpan di dalam
 * dokumen. Jangan pernah update/delete lewat fungsi ini.
 */
export async function tulisAudit(db: Firestore, entri: AuditEntry): Promise<void> {
  await addDoc(
    collection(db, KOLEKSI.audit),
    bersihkanUndefined(entri) as unknown as Record<string, unknown>,
  );
}

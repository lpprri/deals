// Lapisan data Firestore — aktivasi Firebase aplikasi "Partnership LPP RRI".
// (PRD v2.0 Final + Amandemen v2.1; keputusan pengguna 14/11/2026 21:29 WIB:
// HANYA ADA 1 ROLE — Operator, staf Layanan & Pengembangan Usaha — DIBALIK
// keputusan pengguna 19/11/2026 15:45 WIB: DUA peran, operator + client,
// satu halaman login; client membaca HANYA datanya sendiri lewat
// muatDataKlien() di bawah, ditegakkan firestore.rules. Lapisan ini
// mengenal peran lewat klienId yang dibawa pemanggil, bukan lewat
// pengecekan peran sendiri.)
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
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { AppData, AuditEntry, Meeting, PengajuanKlien, PermintaanLayanan } from './types';

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
  // Panel Order — enam tabel (PR #115): koleksi baru, mulai kosong.
  adsQuotationRequest: 'adsQuotationRequest',
  venueBookOrder: 'venueBookOrder',
  spaceRentOrder: 'spaceRentOrder',
  trainingOrder: 'trainingOrder',
  // Panel Order — tabel "Partnership Request" (diganti nama dari
  // "Media Partner Order" 2026-11-21; koleksi diganti nama dari
  // mediaPartnerOrder — seed kosong, tanpa data yang dipindah).
  partnershipRequest: 'partnershipRequest',
  // Memorandum of Understanding (impor MoU 19/11/2026): 44 record
  // dari file pengguna; ditulis ke Firestore lewat migrasi MoU
  // (src/lib/migrasiMou.ts) setelah PR ini merge.
  mou: 'mou',
  // Commitment (impor Commitment 19/11/2026): 4 record dukungan
  // layanan dari file pengguna; ditulis ke Firestore lewat migrasi
  // Commitment (src/lib/migrasiCommitment.ts) setelah PR ini merge.
  commitment: 'commitment',
  // Approvement (definisi pengguna 24/11/2026): surat persetujuan
  // Kepala RRI atas permintaan media partner; 4 record DUMMY dari
  // seed (src/lib/seedApprovement.ts). Migrasi ke Firestore adalah
  // langkah terpisah setelah PR ini merge (belum ada migrasi
  // Approvement); sebelum itu panel menampilkan empty state jujur.
  // muatDariFirestore() memuatnya generik lewat KOLEKSI ini.
  // muatDataKlien() TIDAK memuatnya: tanpa klienId, client tidak
  // melihat Approvement.
  approvement: 'approvement',
  meeting: 'meeting',
  event: 'event',
  advertisement: 'advertisement',
  task: 'task',
  tiket: 'tiket',
  umpanBalik: 'umpanBalik',
  artikelKB: 'artikelKB',
  // PR #49 — FAQ Resources, nasional seperti artikelKB.
  faq: 'faq',
  // Fase C — Chat antar operator 1-to-1 (PR #45). Punya field `satker`,
  // jadi muatDariFirestore() memfilternya per satker seperti koleksi
  // bersatker lain (generik atas KOLEKSI — tanpa kode khusus).
  pesan: 'pesan',
};

/** Kunci AppData yang entitasnya TIDAK punya field `satker`. */
export const KUNCI_TANPA_SATKER: ReadonlySet<keyof AppData> = new Set([
  'dokumen',
  'audit',
  // Fase C — Service: artikel Knowledge Base bersifat nasional.
  'artikelKB',
  // PR #49 — FAQ Resources bersifat nasional seperti artikelKB.
  'faq',
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
 * Muat data SATU client dari Firestore (dua peran 19/11/2026).
 * Dipakai App.tsx bila pengguna yang login berperan 'client'.
 * - Bila `meta/migrasi` TIDAK ada → null (pemanggil memakai DATA_NYATA
 *   dengan label mode (b), seperti operator).
 * - Hanya koleksi yang punya `klienId` yang dibaca, dan hanya dokumen
 *   dengan klienId sama dengan klienId akun ini: klien (get per id),
 *   kontrak, tagihan, pembayaran, denda, mou, commitment, dokumen,
 *   pengajuanKlien. Koleksi lain dikembalikan KOSONG — client tidak
 *   melihat sewa, prospect, order, meeting, audit, master, dan
 *   koleksi operator lainnya.
 * - Query SELALU memfilter `klienId` + `satker.kode` (kecuali `dokumen`
 *   yang tidak punya satker — filter klienId saja, dan `klien` yang
 *   dibaca get per id): aturan Firestore baca-klien MENUNTUT filter
 *   itu — query tanpa filter klienId DITOLAK rules meski datanya
 *   memang milik client (aturan list tidak bisa membedakan). Indeks
 *   komposit (klienId + satker.kode) WAJIB dibuat di console untuk
 *   tiap koleksi di atas (kecuali dokumen/klien); tanpa indeks, query
 *   gagal dengan tautan pembuatan indeks di pesan error.
 * - pengajuanKlien dibaca dua query (klienId + satker, DAN dibuatOleh
 *   + satker) lalu digabung tanpa duplikat: submission lama yang
 *   dibuat client itu sebelum punya akun (klienId '') tetap terlihat
 *   lewat email pembuatnya.
 * - `klienId` di sini BUKAN input pengguna — pemanggil mengambilnya
 *   dari profil `users/{uid}` yang sudah tervalidasi (peranDariProfil).
 */
export async function muatDataKlien(
  db: Firestore,
  satkerKode: string,
  klienId: string,
  dibuatOlehEmail?: string,
): Promise<AppData | null> {
  if (!(await cekSudahDimigrasi(db))) return null;
  const hasil = {} as Record<keyof AppData, unknown[]>;
  for (const kunci of Object.keys(KOLEKSI) as (keyof AppData)[]) {
    hasil[kunci] = [];
  }
  const bacaTersaring = async <K extends keyof AppData>(
    kunci: K,
    filterKlien: boolean,
  ): Promise<void> => {
    const ref = collection(db, KOLEKSI[kunci]);
    const snap = filterKlien
      ? await getDocs(
          query(
            ref,
            where('klienId', '==', klienId),
            where('satker.kode', '==', satkerKode),
          ),
        )
      : await getDocs(query(ref, where('klienId', '==', klienId)));
    hasil[kunci] = snap.docs.map((d) =>
      normalisasiEntitas(kunci, d.id, d.data() as Record<string, unknown>, satkerKode),
    );
  };
  // Record klien sendiri — get per id (bukan list: aturan melarang
  // list klien untuk client).
  const snapKlien = await getDoc(doc(db, KOLEKSI.klien, kodeIdDokumen(klienId)));
  if (snapKlien.exists()) {
    const entitas = normalisasiEntitas(
      'klien',
      snapKlien.id,
      snapKlien.data() as Record<string, unknown>,
      satkerKode,
    );
    if ((entitas as { satker?: { kode?: string } }).satker?.kode === satkerKode) {
      hasil.klien = [entitas];
    }
  }
  await Promise.all([
    bacaTersaring('kontrak', true),
    bacaTersaring('tagihan', true),
    bacaTersaring('pembayaran', true),
    bacaTersaring('denda', true),
    bacaTersaring('mou', true),
    bacaTersaring('commitment', true),
    // dokumen tidak punya field satker — filter klienId saja.
    bacaTersaring('dokumen', false),
  ]);
  // pengajuanKlien: milik client lewat klienId ATAU lewat email
  // pembuat (submission publik sebelum punya akun).
  const snapPengajuanKlienId = await getDocs(
    query(
      collection(db, KOLEKSI.pengajuanKlien),
      where('klienId', '==', klienId),
      where('satker.kode', '==', satkerKode),
    ),
  );
  const pengajuan = snapPengajuanKlienId.docs.map((d) =>
    normalisasiEntitas(
      'pengajuanKlien',
      d.id,
      d.data() as Record<string, unknown>,
      satkerKode,
    ),
  );
  if (dibuatOlehEmail) {
    const snapPengajuanEmail = await getDocs(
      query(
        collection(db, KOLEKSI.pengajuanKlien),
        where('dibuatOleh', '==', dibuatOlehEmail),
        where('satker.kode', '==', satkerKode),
      ),
    );
    const sudahAda = new Set(pengajuan.map((p) => p.id));
    for (const d of snapPengajuanEmail.docs) {
      if (sudahAda.has(d.id)) continue;
      pengajuan.push(
        normalisasiEntitas(
          'pengajuanKlien',
          d.id,
          d.data() as Record<string, unknown>,
          satkerKode,
        ),
      );
    }
  }
  hasil.pengajuanKlien = pengajuan;
  return hasil as AppData;
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
 * Hapus satu dokumen entitas (dipakai hapusTask, duplikasi Todoist
 * 2026-11-24). Aturan Firestore sudah mengizinkan delete untuk koleksi
 * `task` (operator + admin, blok koleksi bersatker).
 */
export async function hapusDokumen(
  db: Firestore,
  koleksi: string,
  id: string,
): Promise<void> {
  await deleteDoc(doc(db, koleksi, kodeIdDokumen(id)));
}

/**
 * Tulis satu submission publik ke Firestore (REVISI KOREKSI 2026-11-15:
 * dipakai kirim publik tanpa login; aturan Firestore mengizinkan create
 * publik tervalidasi untuk koleksi ini). Pola sama dengan simpanDokumen.
 */
export async function kirimPengajuanPublik(
  db: Firestore,
  submission: PengajuanKlien,
): Promise<void> {
  await setDoc(
    doc(db, KOLEKSI.pengajuanKlien, submission.id),
    bersihkanUndefined(submission),
  );
}

/**
 * Tulis satu permintaan free call publik sebagai dokumen Meeting ke
 * Firestore (PR landing-booking-ke-meeting, 2026-11-17: dipakai kirim
 * publik tanpa login dari kartu booking landing; aturan Firestore
 * mengizinkan create publik tervalidasi untuk koleksi ini — lihat blok
 * publik meeting di firestore.rules). Pola sama dengan
 * kirimPengajuanPublik.
 */
export async function kirimBookingPublik(
  db: Firestore,
  meeting: Meeting,
): Promise<void> {
  await setDoc(
    doc(db, KOLEKSI.meeting, meeting.id),
    bersihkanUndefined(meeting),
  );
}

/**
 * Tulis satu permintaan booking venue publik sebagai dokumen
 * PermintaanLayanan ke Firestore (halaman "Book a Venue", 2026-11-21:
 * dipakai kirim publik tanpa login dari halaman Book a Venue; aturan
 * Firestore mengizinkan create publik tervalidasi untuk koleksi ini —
 * lihat blok publik venueBookOrder di firestore.rules). Pola sama dengan
 * kirimBookingPublik.
 */
export async function kirimPermintaanVenuePublik(
  db: Firestore,
  permintaan: PermintaanLayanan,
): Promise<void> {
  await setDoc(
    doc(db, KOLEKSI.venueBookOrder, permintaan.id),
    bersihkanUndefined(permintaan),
  );
}

/**
 * Tulis satu inquiry lahan publik sebagai dokumen PermintaanLayanan ke
 * Firestore (halaman "Rent a Space", 2026-11-21: dipakai kirim publik
 * tanpa login dari halaman Rent a Space; aturan Firestore mengizinkan
 * create publik tervalidasi untuk koleksi ini — lihat blok publik
 * spaceRentOrder di firestore.rules). Pola sama dengan
 * kirimBookingPublik.
 */
export async function kirimPermintaanSpacePublik(
  db: Firestore,
  permintaan: PermintaanLayanan,
): Promise<void> {
  await setDoc(
    doc(db, KOLEKSI.spaceRentOrder, permintaan.id),
    bersihkanUndefined(permintaan),
  );
}

/**
 * Tulis satu pendaftaran course publik sebagai dokumen PermintaanLayanan
 * ke Firestore (halaman "Get a Journalism Training", 2026-11-21: dipakai
 * kirim publik tanpa login dari halaman Training; aturan Firestore
 * mengizinkan create publik tervalidasi untuk koleksi ini — lihat blok
 * publik trainingOrder di firestore.rules). Pola sama dengan
 * kirimBookingPublik.
 */
export async function kirimPermintaanTrainingPublik(
  db: Firestore,
  permintaan: PermintaanLayanan,
): Promise<void> {
  await setDoc(
    doc(db, KOLEKSI.trainingOrder, permintaan.id),
    bersihkanUndefined(permintaan),
  );
}

/**
 * Tulis satu permintaan kemitraan publik sebagai dokumen
 * PermintaanLayanan ke Firestore (halaman "Partner with RRI",
 * 2026-11-21: dipakai kirim publik tanpa login dari form Partnership
 * Request; aturan Firestore mengizinkan create publik tervalidasi untuk
 * koleksi ini — lihat blok publik partnershipRequest di
 * firestore.rules). Pola sama dengan kirimBookingPublik.
 */
export async function kirimPermintaanPartnershipPublik(
  db: Firestore,
  permintaan: PermintaanLayanan,
): Promise<void> {
  await setDoc(
    doc(db, KOLEKSI.partnershipRequest, permintaan.id),
    bersihkanUndefined(permintaan),
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

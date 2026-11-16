// Helper murni percakapan 1-to-1 antar operator (PR #45, 16/11/2026).
// Modul ini bebas-Firebase supaya skrip cek bisa mengimpornya tanpa
// Firebase SDK; tidak ada akses Firestore di sini.
//
// SUMBER KONTAK & ALAMAT (keputusan koordinator, dicatat di sini):
// - Daftar operator HANYA berisi nama (OPERATOR_PALEMBANG di master.ts);
//   `userProfiles`/`users` di Firestore hanya mengizinkan `get` dokumen
//   sendiri (tanpa `list`) dan `userProfiles` hanya berisi SATU dokumen
//   seed — jadi tidak ada sumber email operator yang bisa di-list.
//   Karena itu alamat peserta memakai email Auth ASLI bila diketahui,
//   bila tidak memakai kunci alamat internal turunan nama
//   (`<slug-nama>@operator.local`, lihat kunciAlamatOperator).
// - Kunci `@operator.local` BUKAN alamat email sungguhan dan tidak
//   pernah dikirim ke mana pun: hanya kunci perutean internal supaya
//   percakapan 1-to-1 bisa dialamatkan sebelum email asli operator
//   tercatat di master data. Begitu seorang operator mengirim pesan
//   dari akun Auth-nya, email aslinya tercatat di koleksi `pesan` dan
//   dipakai sebagai alamat utama kontak itu (alamat lama tetap dikenal
//   lewat `alamatDikenal`, supaya utas lama tidak hilang).
// - Pesan TIDAK menulis entri audit (chat bersifat percakapan, bukan
//   transaksi — seperti submission publik yang juga tanpa audit).

/** Normalisasi kunci alamat: tanpa spasi, huruf kecil. */
export function normalisasiKunciAlamat(nilai: string): string {
  return nilai.trim().toLowerCase();
}

/** Slug nama operator: huruf kecil, non-alfanumerik jadi '-'. */
export function slugOperator(nama: string): string {
  return (
    nama
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'operator'
  );
}

/**
 * Kunci alamat peserta percakapan: email Auth asli bila ada, bila tidak
 * kunci alamat internal `<slug>@operator.local` (BUKAN email sungguhan,
 * lihat catatan di atas).
 */
export function kunciAlamatOperator(nama: string, email?: string): string {
  const asli = normalisasiKunciAlamat(email ?? '');
  if (asli) return asli;
  return `${slugOperator(nama)}@operator.local`;
}

/** True bila kunci alamat adalah kunci internal turunan nama. */
export function adalahKunciInternal(kunci: string): boolean {
  return normalisasiKunciAlamat(kunci).endsWith('@operator.local');
}

/**
 * Id percakapan 1-to-1: kedua kunci alamat dinormalisasi, diurutkan,
 * lalu digabung dengan '|'. Deterministik: urutan argumen tidak
 * berpengaruh; pasangan berbeda -> id berbeda ('|' tidak mungkin ada
 * di dalam alamat email maupun kunci internal).
 */
export function idPercakapan(kunciA: string, kunciB: string): string {
  const [a, b] = [
    normalisasiKunciAlamat(kunciA),
    normalisasiKunciAlamat(kunciB),
  ].sort();
  return `${a}|${b}`;
}

/** Lawan bicara dalam sebuah idPercakapan, dilihat dari kunci alamat saya. */
export function lawanBicara(id: string, kunciSaya: string): string | null {
  const saya = normalisasiKunciAlamat(kunciSaya);
  const [a, b] = id.split('|');
  if (a === saya) return b ?? null;
  if (b === saya) return a ?? null;
  return null;
}

/**
 * Format waktu pesan (ISO lengkap): 'HH:MM' bila hari ini,
 * 'dd/mm/yyyy HH:MM' bila hari lain. Mengembalikan string apa adanya
 * bila tidak bisa diurai.
 */
export function formatWaktuPesan(iso: string): string {
  const tanggal = new Date(iso);
  if (Number.isNaN(tanggal.getTime())) return iso;
  const jam = String(tanggal.getHours()).padStart(2, '0');
  const menit = String(tanggal.getMinutes()).padStart(2, '0');
  const kini = new Date();
  const hariIni =
    tanggal.getFullYear() === kini.getFullYear() &&
    tanggal.getMonth() === kini.getMonth() &&
    tanggal.getDate() === kini.getDate();
  if (hariIni) return `${jam}:${menit}`;
  const d = String(tanggal.getDate()).padStart(2, '0');
  const m = String(tanggal.getMonth() + 1).padStart(2, '0');
  const y = tanggal.getFullYear();
  return `${d}/${m}/${y} ${jam}:${menit}`;
}

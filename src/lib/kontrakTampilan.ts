// Tampilan tabel Contract (keputusan pengguna 16/11/2026) — helper MURNI
// (tanpa Firebase) supaya bisa diuji skrip cek Node.
//
// FAKTA DATA (audit 16/11/2026 terhadap seed + file
// Kerja_Sama_PNBP_2026_Tabel_Rapi.xlsx):
// - Judul + Nomor Referensi TIDAK ada sebagai field di Kontrak — keduanya
//   hanya tersimpan di dalam teks bebas `catatan` ("Judul: ... |
//   No. Referensi: ... | ..."). Keduanya diparsing di sini, BUKAN dikarang:
//   cross-check terhadap file: judul cocok 39/40 (1 selisih hanya
//   "\r\n" vs "\n"), referensi cocok 40/40. Judul ada di 42/42 kontrak,
//   referensi di 38/42 — 4 kontrak tanpa referensi (001 Taspen, 018
//   Komdigi, 027 Darojad 2025, 016 VGreen 2025; file menulis '-' / tanpa
//   baris) menampilkan "—".
// - "Tanggal Pembuatan Kontrak" (kolom "Tanggal Kontrak" di file) TIDAK
//   tersimpan sebagai field di app. Keputusan pengguna 16/11/2026
//   13:29 WIB: kolom Creation Date DIGANTI menjadi Signing Date —
//   "Creation Date sama dengan Signing Date" — jadi impor "Tanggal
//   Kontrak" dari file TIDAK diperlukan. Kolom menampilkan
//   tanggalTandaTangan (fallback tanggalMulai, pola yang sama dengan
//   tanggalAcuanKontrak yang dipakai sort Signing Date); terisi 42/42
//   kontrak seed. Catatan: tanggalTandaTangan == tanggalMulai di 42/42
//   kontrak dan berbeda dari file pada 33/40 kontrak — itu data yang
//   tersimpan, bukan karangan.
// - Jenis Klien di data: 5 nilai, persis MASTER_JENIS_KLIEN
//   (Pemerintah, BUMN/BUMD, Swasta, Perorangan, Lembaga/Organisasi).

import type { Denda, Klien, Kontrak, Mou, Pembayaran, Tagihan } from './types';
import { MASTER_JENIS_KLIEN } from './master';
import { dibayarTerverifikasi, statusTagihan, tanggalAcuanKontrak } from './derive';
import { piutangRealisasi } from './realisasi';
import { hariIniIso, selisihHari } from './format';

/** Ambil satu segmen "Kunci: nilai" dari teks catatan ("A | B | C"). */
function segmenCatatan(catatan: string | undefined, kunci: string): string | undefined {
  if (!catatan) return undefined;
  const awalan = `${kunci}: `;
  for (const segmen of catatan.split(' | ')) {
    if (segmen.startsWith(awalan)) {
      // Normalisasi spasi (termasuk "\r\n" di judul 018) — tampilan saja,
      // data tersimpan tidak diubah.
      const nilai = segmen.slice(awalan.length).replace(/\s+/g, ' ').trim();
      return nilai === '' || nilai === '-' ? undefined : nilai;
    }
  }
  return undefined;
}

/** Judul kontrak — diparsing dari `catatan` ("Judul: ..."). */
export function judulKontrak(kontrak: Kontrak): string | undefined {
  return segmenCatatan(kontrak.catatan, 'Judul');
}

/** Nomor referensi kontrak — diparsing dari `catatan` ("No. Referensi: ..."). */
export function nomorReferensiKontrak(kontrak: Kontrak): string | undefined {
  return segmenCatatan(kontrak.catatan, 'No. Referensi');
}

/**
 * Notes (kolom Cluster 7, keputusan pengguna 17/11/2026 11:41 WIB):
 * isi `catatan` di luar segmen "Judul:" dan "No. Referensi:" — segmen
 * lain ("Keterangan sumber:", "BMN:", "SPn-1", dst.) digabung " | "
 * seperti di sumber. undefined bila tidak ada segmen lain (tidak
 * terjadi di seed — 42/42 kontrak punya segmen lain).
 */
export function catatanLuarJudulReferensi(
  catatan: string | undefined,
): string | undefined {
  if (!catatan) return undefined;
  const sisa = catatan
    .split(' | ')
    .filter(
      (s) => !s.startsWith('Judul:') && !s.startsWith('No. Referensi:'),
    )
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s !== '');
  return sisa.length === 0 ? undefined : sisa.join(' | ');
}

/**
 * Detail layanan / BMN — nama-nama layanan kontrak, digabung "; " bila
 * lebih dari satu (39 kontrak punya 1 layanan, 3 kontrak punya 3).
 * Nama diambil apa adanya dari data: 16 kontrak sewa menampilkan teks
 * generik yang sama "Sewa Lahan / BMN" — itu isi sumber, bukan karangan.
 * undefined bila kontrak tidak punya layanan.
 */
export function detailLayananKontrak(kontrak: Kontrak): string | undefined {
  const nama = (kontrak.layanan ?? [])
    .map((l) => l.namaLayanan)
    .filter((n) => n !== '');
  return nama.length === 0 ? undefined : nama.join('; ');
}

/**
 * Tanggal penandatanganan kontrak untuk kolom Signing Date — keputusan
 * pengguna 16/11/2026 13:29 WIB (Creation Date = Signing Date).
 * Sama dengan tanggalAcuanKontrak: tanggalTandaTangan bila ada, bila
 * belum diisi memakai tanggalMulai sebagai fallback — pola yang sama
 * dengan kunci sort 'tandaTangan', supaya kolom dan sort tidak pernah
 * berbeda nilainya.
 */
export function tanggalPenandatangananKontrak(kontrak: Kontrak): string {
  return tanggalAcuanKontrak(kontrak);
}

/**
 * Status pembayaran per kontrak — diturunkan dari NILAI KONTRAK + DENDA
 * dan PIUTANG (realisasi). REDEFINISI (keputusan pengguna 17/11/2026
 * 08:33 WIB): Partially-Paid kini berarti dibayar == Piutang (nilai
 * kontrak yang sudah dilaksanakan) — menggantikan definisi PR #60 —
 * dan ada status baru 'Insufficient Payment'. Pembandingnya adalah
 * nilaiKontrak + total denda kontrak, BUKAN nilai tagihan.
 *
 * FAKTA DATA (audit 16/11/2026 terhadap seed): denda SUDAH tertanam di
 * tagihan.nilai, TETAPI Σ tagihan.nilai == nilaiKontrak + total denda
 * hanya di 34/42 kontrak — 7 kontrak punya tagihan yang nilainya memang
 * lebih kecil dari nilai kontrak (5 sewa multi-tahun: 1051/1052/1053
 * tagihan tahun pertama, 016/027 tagihan 2/3 nilai; plus 018 dan 10227
 * yang Piutang di file lebih kecil dari nilai kontrak), dan 7054
 * selisih Rp1 pembulatan impor (tagihan Rp9.801.321 vs nilaiKontrak +
 * denda Rp9.801.322 — selisih yang sudah diketahui: nilaiKontrak 7054
 * Rp7.904.292 vs file Rp7.904.291,5). Justru karena itu rumus di sini
 * memakai nilaiKontrak + denda secara harfiah seperti kata pengguna —
 * bukan Σ tagihan.nilai — supaya klasifikasi tetap benar: memakai
 * Σ tagihan sebagai pembanding akan membuat ketujuh kontrak itu tetap
 * Paid. Total denda = Σ Denda.jumlah atas tagihan kontrak itu dengan
 * status selain 'Dihapus' (konvensi yang sama dengan totalDenda di
 * derive.ts; denda 'Dibayar' tetap dihitung karena pembayarannya juga
 * masuk ke total pembayaran terverifikasi).
 *
 * Kategori saling lepas — URUTAN PERIKSA PENTING (keputusan 17/11/2026):
 * "belum mencukupi total nilai transaksi + denda" secara harfiah juga
 * berlaku untuk Partially-Paid, jadi Partially-Paid diperiksa DULU:
 * - Paid: total pembayaran Terverifikasi >= nilaiKontrak + total denda.
 * - Partially-Paid: dibayar == Piutang, dengan Piutang =
 *   (nilaiKontrak + total denda) x % Realisasi (rumus PR #63,
 *   piutangRealisasi) DAN Piutang < nilaiKontrak + total denda.
 *   "Sesuai" diuji dengan toleransi |dibayar − Piutang| <= Rp1 —
 *   jaring pengaman pembulatan (contoh 7054 yang nilai kontraknya
 *   selisih Rp1 dari file). Artinya klien sudah membayar lunas nilai
 *   kontrak yang SUDAH dilaksanakan; sisanya belum terealisasi —
 *   contohnya sewa multi-tahun yang baru dibayar 1 tahun
 *   (1051/1052/1053, 016, 027).
 * - Insufficient Payment: 0 < dibayar < nilaiKontrak + total denda DAN
 *   dibayar != Piutang — termasuk dibayar > Piutang tapi < penuh
 *   (tidak ada kasusnya di seed per 17/11/2026). Contohnya 6 kontrak
 *   yang pokoknya lunas tetapi dendanya belum dibayar (1744, 2919,
 *   2920, 7052, 7054, 7060): dibayar == nilaiKontrak < Piutang.
 * - Overdue: TIDAK ADA pembayaran sama sekali (0) DAN ada tagihan yang
 *   sudah lewat tanggal jatuh tempo. (TETAP seperti PR #60.)
 * - Unpaid: TIDAK ADA pembayaran sama sekali (0) DAN belum ada tagihan
 *   yang lewat jatuh tempo. (TETAP.)
 * DISTRIBUSI BARU (seed, per 17/11/2026): Paid 28, Partially-Paid 5,
 * Insufficient Payment 6, Unpaid 3, Overdue 0.
 * "Hari ini" default = tanggal sistem (hariIniIso); skrip cek memakai
 * '2026-11-16' eksplisit supaya deterministik. Hanya pembayaran
 * Terverifikasi yang dihitung.
 * Catatan pinggir: kontrak tanpa tagihan (tidak ada di seed) dengan
 * nilaiKontrak > 0 dan tanpa pembayaran dihitung Unpaid — tidak ada
 * tanggal jatuh tempo yang bisa dilewati.
 */
export type StatusPembayaranKontrak =
  | 'Unpaid'
  | 'Paid'
  | 'Partially-Paid'
  | 'Insufficient Payment'
  | 'Overdue';

export function statusPembayaranKontrak(
  kontrak: Kontrak,
  tagihan: Tagihan[],
  pembayaran: Pembayaran[],
  denda: Denda[],
  hariIni: string = hariIniIso(),
): StatusPembayaranKontrak {
  const tagihanKontrak = tagihan.filter((t) => t.kontrakId === kontrak.id);
  const idTagihan = new Set(tagihanKontrak.map((t) => t.id));
  const totalDenda = denda
    .filter((d) => idTagihan.has(d.tagihanId) && d.status !== 'Dihapus')
    .reduce((s, d) => s + d.jumlah, 0);
  const totalDibayar = tagihanKontrak.reduce(
    (s, t) => s + dibayarTerverifikasi(t.id, pembayaran),
    0,
  );
  const penuh = kontrak.nilaiKontrak + totalDenda;
  if (totalDibayar >= penuh) return 'Paid';
  if (totalDibayar > 0) {
    // Partially-Paid = dibayar SESUAI Piutang (nilai kontrak yang sudah
    // dilaksanakan); toleransi Rp1 untuk pembulatan (kasus 7054).
    const piutang = piutangRealisasi(kontrak, tagihan, denda, hariIni);
    if (Math.abs(totalDibayar - piutang) <= 1 && piutang < penuh)
      return 'Partially-Paid';
    return 'Insufficient Payment';
  }
  const adaLewatJatuhTempo = tagihanKontrak.some(
    (t) => hariIni > t.tanggalJatuhTempo,
  );
  return adaLewatJatuhTempo ? 'Overdue' : 'Unpaid';
}

// CATATAN: helper labelStatusPembayaranKontrak (label Indonesia: Lunas /
// Belum Bayar / Kurang Bayar / Keterlambatan Pembayaran, PR #64) DIHAPUS
// per keputusan pengguna 17/11/2026 08:34 WIB — kolom Status Pembayaran
// kembali ke English. Nilai statusnya sendiri sudah Bahasa Inggris
// (Paid / Unpaid / Partially-Paid / Insufficient Payment / Overdue),
// jadi sel tabel menampilkan status itu langsung, tanpa helper label.
// Ini pembatalan label Indonesia atas instruksi eksplisit pengguna,
// bukan perbaikan bug.

/**
 * Status kerja sama per kontrak (keputusan pengguna 16/11/2026: filter
 * Cooperation Status):
 * - Completed: status tersimpan 'Selesai'.
 * - Upcoming: tanggalMulai masih di masa depan (belum ada di seed —
 *   tanggalMulai terbaru 2026-10-30, jadi 0 Upcoming — hasil jujur).
 * - On-Going: selain itu (status 'Aktif' di seed; fallback untuk 'Draft' /
 *   'Dibatalkan' bila suatu saat muncul — keduanya tidak ada di seed).
 */
export type StatusKerjaSamaKontrak = 'Completed' | 'On-Going' | 'Upcoming';

export function statusKerjaSamaKontrak(
  kontrak: Kontrak,
  hariIni: string = hariIniIso(),
): StatusKerjaSamaKontrak {
  if (kontrak.status === 'Selesai') return 'Completed';
  if (kontrak.tanggalMulai > hariIni) return 'Upcoming';
  return 'On-Going';
}

/**
 * Sisa hari kerja sama untuk kolom "Remaining Days" (keputusan pengguna
 * 16/11/2026 15:29 WIB): hitung mundur hari kalender dari hari ini
 * sampai tanggalSelesai; kontrak berstatus 'Selesai' menampilkan
 * "Completed" (bukan angka).
 *
 * AUDIT (seed, per 2026-11-16): 15 kontrak non-Selesai, semuanya berakhir
 * di masa depan — selisih terkecil 1 hari (10227, berakhir 17/11/2026),
 * terbesar 807 hari (1051/1052/1053, berakhir 31/01/2029). TIDAK ADA
 * kontrak non-Selesai yang tanggal akhirnya sudah lewat, jadi cabang
 * selisih <= 0 tidak terjadi di data saat ini (diasersikan di skrip cek).
 * Bila suatu saat terjadi di data live (tanggal akhir lewat tetapi status
 * belum diubah ke 'Selesai'), angkanya ditampilkan apa adanya ("-5 days",
 * "0 days") supaya ketidakcocokan itu terlihat, bukan disembunyikan.
 * Tunggal vs jamak: "1 day", selain itu "N days".
 */
export function sisaHariKerjaSama(
  kontrak: Kontrak,
  hariIni: string = hariIniIso(),
): string {
  if (kontrak.status === 'Selesai') return 'Completed';
  const sisa = selisihHari(hariIni, kontrak.tanggalSelesai);
  if (sisa === 1) return '1 day';
  return `${sisa} days`;
}

/**
 * Sisa hari MoU untuk kolom "Remaining Days" di tabel MoU (keputusan
 * pengguna 19/11/2026 14:41 WIB): hitung mundur hari kalender dari hari
 * ini sampai tanggalSelesai — FORMAT SAMA seperti sisaHariKerjaSama
 * ("1 day" / "N days", tanggal akhir yang sudah lewat ditampilkan apa
 * adanya, mis. "-5 days", supaya ketidakcocokan terlihat). MoU TIDAK
 * punya status 'Selesai' seperti kontrak, jadi tidak ada cabang
 * "Completed".
 */
export function sisaHariMou(
  mou: Mou,
  hariIni: string = hariIniIso(),
): string {
  const sisa = selisihHari(hariIni, mou.tanggalSelesai);
  if (sisa === 1) return '1 day';
  return `${sisa} days`;
}

/**
 * Jatuh tempo pembayaran untuk kolom "Payment Deadline" (keputusan
 * pengguna 17/11/2026 09:04 WIB): jatuh tempo tagihan TERTUA yang belum
 * lunas (statusTagihan bukan 'Lunas' — konvensi derive.ts yang sama
 * dengan statusPembayaranKontrak); bila semua tagihan lunas, jatuh
 * tempo tagihan TERAKHIR; undefined bila kontrak tidak punya tagihan.
 * "Tertua" = tanggal jatuh tempo paling awal di antara yang belum
 * lunas; "terakhir" = tanggal jatuh tempo paling akhir.
 *
 * FAKTA DATA (seed, per 2026-11-17): semua 42 kontrak punya TEPAT
 * 1 tagihan — jadi di data saat ini kedua cabang itu sama dengan jatuh
 * tempo satu-satunya tagihan itu (contoh: 10227 yang belum lunas →
 * 15/12/2026; 0603 yang lunas → 24/02/2026). Cabang-cabangnya baru
 * berbeda bila suatu kontrak punya >1 tagihan — dites sintetis di
 * skrip cek.
 * "Hari ini" default = tanggal sistem (hariIniIso); skrip cek memakai
 * '2026-11-16' eksplisit supaya deterministik. Hanya status 'Lunas'
 * yang menentukan "belum lunas" — statusTagihan memakai hariIni hanya
 * untuk membedakan 'Lewat Jatuh Tempo' / 'Jatuh Tempo' /
 * 'Belum Jatuh Tempo', bukan untuk 'Lunas'.
 */
export function jatuhTempoPembayaranKontrak(
  kontrak: Kontrak,
  tagihan: Tagihan[],
  pembayaran: Pembayaran[],
  hariIni: string = hariIniIso(),
): string | undefined {
  const tagihanKontrak = tagihan.filter((t) => t.kontrakId === kontrak.id);
  if (tagihanKontrak.length === 0) return undefined;
  const terurut = [...tagihanKontrak].sort((a, b) =>
    a.tanggalJatuhTempo < b.tanggalJatuhTempo
      ? -1
      : a.tanggalJatuhTempo > b.tanggalJatuhTempo
        ? 1
        : 0,
  );
  const belumLunas = terurut.filter(
    (t) => statusTagihan(t, pembayaran, hariIni) !== 'Lunas',
  );
  if (belumLunas.length > 0) return belumLunas[0].tanggalJatuhTempo;
  return terurut[terurut.length - 1].tanggalJatuhTempo;
}

/** Nilai filter Payment Status di dropdown (Semua = tanpa filter). */
export type FilterStatusPembayaran = 'Semua' | StatusPembayaranKontrak;
/** Nilai filter Cooperation Status di dropdown (Semua = tanpa filter). */
export type FilterStatusKerjaSama = 'Semua' | StatusKerjaSamaKontrak;

/**
 * Jenis klien yang benar-benar ada di data, dalam urutan master; nilai di
 * luar master (bila ada) ditambahkan alfabetis di belakang.
 */
export function jenisKlienYangAda(klien: Klien[]): string[] {
  const ada = [...new Set(klien.map((k) => k.jenis))];
  const dalamMaster = MASTER_JENIS_KLIEN.filter((j) => ada.includes(j));
  const luarMaster = ada.filter((j) => !MASTER_JENIS_KLIEN.includes(j)).sort();
  return [...dalamMaster, ...luarMaster];
}

/** Kunci sort tabel Contract. */
export type KunciUrutKontrak = 'tandaTangan' | 'selesai' | 'nilai' | 'sisaHari';

/** Arah sort: 'turun' = descending (terbaru / terbesar dulu). */
export type ArahUrutKontrak = 'naik' | 'turun';

/** Label tombol balik arah, tergantung kunci sort yang aktif. */
export function labelArahUrutKontrak(
  kunci: KunciUrutKontrak,
  arah: ArahUrutKontrak,
): string {
  if (kunci === 'nilai') return arah === 'turun' ? 'Highest first' : 'Lowest first';
  if (kunci === 'selesai') return arah === 'turun' ? 'Latest end first' : 'Earliest end first';
  if (kunci === 'sisaHari') return arah === 'turun' ? 'Most first' : 'Fewest first';
  return arah === 'turun' ? 'Newest first' : 'Oldest first';
}

function nilaiKunci(kontrak: Kontrak, kunci: KunciUrutKontrak): string | number {
  if (kunci === 'selesai') return kontrak.tanggalSelesai;
  if (kunci === 'nilai') return kontrak.nilaiKontrak;
  // Tanggal penandatangan — fallback tanggalMulai (sama seperti
  // tanggalAcuanKontrak di derive.ts).
  return tanggalAcuanKontrak(kontrak);
}

/**
 * Urutkan kontrak (salinan baru, data asli tidak diubah). Pembanding
 * sekunder nomorPks supaya urutan deterministik bila nilai kunci sama
 * (mis. dua kontrak 2036 bertanggal sama).
 *
 * Kunci 'sisaHari' (keputusan pengguna 16/11/2026 15:37 WIB): kunci
 * sort = jumlah hari tersisa sampai tanggalSelesai (selisihHari dari
 * hari ini); kontrak berstatus 'Selesai' ("Completed") SELALU paling
 * akhir, apapun arahnya — mereka sudah selesai, bukan yang paling
 * mendesak maupun paling lama. Jadi ascending = sisa hari terkecil
 * dulu (10227 "1 day" pertama), descending = sisa hari terbesar dulu
 * (1051/1052/1053 "807 days" pertama, seri — tie-break nomorPks).
 * "Hari ini" default = tanggal sistem (hariIniIso); skrip cek memakai
 * '2026-11-16' eksplisit supaya deterministik. Call-site live
 * (TabKontrak) tidak mengoper hariIni — sama seperti kolom Remaining
 * Days yang juga memakai tanggal sistem.
 */
export function urutkanKontrak(
  kontrak: Kontrak[],
  kunci: KunciUrutKontrak,
  arah: ArahUrutKontrak,
  hariIni: string = hariIniIso(),
): Kontrak[] {
  const pengali = arah === 'turun' ? -1 : 1;
  return [...kontrak].sort((a, b) => {
    if (kunci === 'sisaHari') {
      const selesaiA = a.status === 'Selesai' ? 1 : 0;
      const selesaiB = b.status === 'Selesai' ? 1 : 0;
      if (selesaiA !== selesaiB) return selesaiA - selesaiB;
      const na = selisihHari(hariIni, a.tanggalSelesai);
      const nb = selisihHari(hariIni, b.tanggalSelesai);
      if (na < nb) return -1 * pengali;
      if (na > nb) return 1 * pengali;
    } else {
      const na = nilaiKunci(a, kunci);
      const nb = nilaiKunci(b, kunci);
      if (na < nb) return -1 * pengali;
      if (na > nb) return 1 * pengali;
    }
    if (a.nomorPks < b.nomorPks) return -1;
    if (a.nomorPks > b.nomorPks) return 1;
    return 0;
  });
}

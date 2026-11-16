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

import type { Klien, Kontrak } from './types';
import { MASTER_JENIS_KLIEN } from './master';
import { tanggalAcuanKontrak } from './derive';

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
export type KunciUrutKontrak = 'tandaTangan' | 'selesai' | 'nilai';

/** Arah sort: 'turun' = descending (terbaru / terbesar dulu). */
export type ArahUrutKontrak = 'naik' | 'turun';

/** Label tombol balik arah, tergantung kunci sort yang aktif. */
export function labelArahUrutKontrak(
  kunci: KunciUrutKontrak,
  arah: ArahUrutKontrak,
): string {
  if (kunci === 'nilai') return arah === 'turun' ? 'Highest first' : 'Lowest first';
  if (kunci === 'selesai') return arah === 'turun' ? 'Latest end first' : 'Earliest end first';
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
 */
export function urutkanKontrak(
  kontrak: Kontrak[],
  kunci: KunciUrutKontrak,
  arah: ArahUrutKontrak,
): Kontrak[] {
  const pengali = arah === 'turun' ? -1 : 1;
  return [...kontrak].sort((a, b) => {
    const na = nilaiKunci(a, kunci);
    const nb = nilaiKunci(b, kunci);
    if (na < nb) return -1 * pengali;
    if (na > nb) return 1 * pengali;
    if (a.nomorPks < b.nomorPks) return -1;
    if (a.nomorPks > b.nomorPks) return 1;
    return 0;
  });
}

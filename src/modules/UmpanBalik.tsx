// Menu Feedback Survey baru sebagai sub-navigasi Reports (keputusan
// pengguna 15/11/2026 20:15 WIB, PR #38): tab "Feedback Survey" dihapus
// dari modul Resources — tampilannya pindah ke sini sebagai sub-item di
// bawah Reports (panel REPORTS). Memakai ulang komponen TabUmpanBalik
// yang diekspor dari Service; TIDAK ada duplikasi tabel/data dan data
// `umpanBalik` TIDAK berubah.
//
// FAKTA DATA (impor nyata 14/11/2026): 0 survei tersimpan — belum ada
// survei kepuasan yang diisi, jadi tampilan ini menampilkan empty state
// jujur ("No satisfaction surveys saved yet", rata-rata "-") dan 42
// kontrak belum disurvei. Form survei 4 pertanyaan (skala 1–5 +
// komentar, satu survei per kontrak) tetap ada di sini; bila survei
// baru disimpan lewat form, ringkasan ikut terhitung dari data yang
// sama seperti sebelumnya.

import { TabUmpanBalik } from './Service';
import type { ModulProps } from '../lib/store';

/** Feedback Survey — survei kepuasan klien per kontrak (skala 1–5). */
export function MenuUmpanBalik(props: ModulProps) {
  return <TabUmpanBalik {...props} />;
}

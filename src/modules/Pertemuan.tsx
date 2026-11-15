// Menu Meeting baru (keputusan pengguna 15/11/2026 20:36 WIB, PR #39):
// menu tingkat atas di cluster Sales & Deals, setelah Order.
// Memakai ulang tampilan tab yang sama dari Sales (komponen TabMeeting
// yang diekspor); TIDAK ada duplikasi tabel/data dan total tidak
// berubah. Navigasi langsung — tanpa sub-item dan tanpa panel tambahan.
//
// FAKTA DATA (impor nyata 14/11/2026, Fase B): 2 meeting
// (MTG-01 18/11/2026 10:00 Presentasi paket iklan 3 bulan (QTN-02),
// MTG-02 15/12/2025 14:00 Pembahasan kebutuhan siaran iklan tahun
// 2026). Filter bawaan tab adalah "Upcoming", jadi saat dibuka menu
// ini menampilkan MTG-01; pilih "All" untuk melihat keduanya. Bila
// meeting baru ditambahkan lewat form, menu ini ikut menampilkan
// karena membaca data.meeting yang sama seperti Sales.

import { TabMeeting } from './Sales';
import type { ModulProps } from '../lib/store';

/** Meeting — tampilan Meeting Schedule yang sama seperti Sales. */
export function MenuMeeting(props: ModulProps) {
  return <TabMeeting {...props} />;
}

// Menu Prospect baru (keputusan pengguna 15/11/2026 20:53 WIB, PR #40):
// menu tingkat atas di cluster Sales & Deals, setelah Campaign
// (dikoreksi pengguna 20:55 WIB — urutan akhir cluster 3: Sales,
// Deals, Campaign, Prospect, Offer, Order, Clients, Meeting).
// Memakai ulang daftar prospect yang sama dari Sales (komponen
// TabProspek yang diekspor); TIDAK ada duplikasi tabel/data dan total
// tidak berubah. Tab "Prospect" di halaman Offer TETAP ADA — ini menu
// tambahan, bukan pindahan. Navigasi langsung — tanpa sub-item dan
// tanpa panel tambahan.
//
// FAKTA DATA (impor nyata 14/11/2026, Fase B): 4 prospect
// (PRS-01 s.d. PRS-04). Bila prospect baru ditambahkan lewat form,
// menu ini ikut menampilkan karena membaca data.prospect yang sama
// seperti Sales dan Offer.

import { TabProspek } from './Sales';
import type { ModulProps } from '../lib/store';

/** Prospect — daftar prospect yang sama seperti tab Prospect di Offer. */
export function MenuProspek(props: ModulProps) {
  return <TabProspek {...props} />;
}

// Menu Offer & Order baru (keputusan pengguna 15/11/2026 20:14 WIB, PR #38):
// dua menu tingkat atas di cluster Sales & Deals, setelah Clients.
// Keduanya memakai ulang tampilan tab yang sama dari Sales (komponen
// TabQuotation dan TabOrder yang diekspor); TIDAK ada duplikasi
// tabel/data dan total tidak berubah. Keduanya navigasi langsung —
// tanpa sub-item dan tanpa panel tambahan.
//
// FAKTA DATA (impor nyata 14/11/2026, Fase B): 3 quotation
// (QTN-01 Disetujui Rp48.000.000, QTN-02 Dikirim Rp9.000.000,
// QTN-03 Ditolak Rp5.000.000 — Σ Rp62.000.000) dan 1 order
// (ORD-01 Selesai Rp48.000.000, dari QTN-01, dikonversi menjadi
// kontrak PKS-001/2026). Bila quotation/order baru ditambahkan lewat
// form, menu ini ikut menampilkan karena membaca data.quotation /
// data.order yang sama seperti Sales.

import { TabOrder, TabQuotation } from './Sales';
import type { ModulProps } from '../lib/store';

/** Offer — tampilan Quotation (Penawaran) yang sama seperti Sales. */
export function MenuOffer(props: ModulProps) {
  return <TabQuotation {...props} />;
}

/** Order — tampilan Order (Order Form) yang sama seperti Sales. */
export function MenuOrder(props: ModulProps) {
  return <TabOrder {...props} />;
}

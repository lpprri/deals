// Menu Offer & Order baru (keputusan pengguna 15/11/2026 20:14 WIB, PR #38):
// dua menu tingkat atas di cluster Sales & Deals, setelah Clients.
// Keduanya memakai ulang tampilan tab yang sama dari Sales (komponen
// TabQuotation dan TabOrder yang diekspor); TIDAK ada duplikasi
// tabel/data dan total tidak berubah. Keduanya navigasi langsung —
// tanpa sub-item dan tanpa panel tambahan.
//
// TAMBAHAN (keputusan pengguna 15/11/2026 20:37 WIB, dilipat ke PR #39):
// tab "Prospect" pindah dari Sales ke halaman Offer — Offer menjadi
// bertab: "Quotation" (tab aktif default, isi Offer saat ini tidak
// berubah) + "Prospect" (TabProspek dari Sales, dipakai ulang dengan
// pola yang sama). Tab "Order" dihapus dari Sales (TabOrder tetap
// dipakai menu Order). Data prospect tidak berubah dan alur yang
// memakainya (Pipeline, konversi Order) tetap membaca data.prospect
// yang sama.
//
// TAMBAHAN (keputusan pengguna 15/11/2026 20:39 WIB, dilipat ke PR #39):
// tab "Analytics" pindah dari Sales ke halaman Offer sebagai tab ketiga
// (TabAnalytics dari Sales, dipakai ulang dengan pola yang sama —
// kartu ringkasan + tabel "Prospects per Stage" + Conversion Rate,
// semua angka dari hitungAnalitikSales(data)). Tab Sales yang tersisa:
// Pipeline, Quotation, Meeting.
//
// FAKTA DATA (impor nyata 14/11/2026, Fase B): 3 quotation
// (QTN-01 Disetujui Rp48.000.000, QTN-02 Dikirim Rp9.000.000,
// QTN-03 Ditolak Rp5.000.000 — Σ Rp62.000.000), 1 order
// (ORD-01 Selesai Rp48.000.000, dari QTN-01, dikonversi menjadi
// kontrak PKS-001/2026), dan 4 prospect (PRS-01 … PRS-04).
// Bila quotation/order/prospect baru ditambahkan lewat form, menu ini
// ikut menampilkan karena membaca data yang sama seperti Sales.

import { useState } from 'react';
import { TabBar } from '../components/ui';
import { TabAnalytics, TabOrder, TabProspek, TabQuotation } from './Sales';
import type { ModulProps } from '../lib/store';

const TABS_OFFER = [
  { id: 'quotation', label: 'Quotation' },
  { id: 'prospek', label: 'Prospect' },
  { id: 'analytics', label: 'Analytics' },
];

/** Offer — Quotation (default) + Prospect + Analytics, tampilan yang sama seperti Sales. */
export function MenuOffer(props: ModulProps) {
  const [tab, setTab] = useState('quotation');
  return (
    <div className="space-y-4">
      <TabBar tabs={TABS_OFFER} aktif={tab} onPilih={setTab} />
      {tab === 'quotation' && <TabQuotation {...props} />}
      {tab === 'prospek' && <TabProspek {...props} />}
      {tab === 'analytics' && <TabAnalytics data={props.data} />}
    </div>
  );
}

/** Order — tampilan Order (Order Form) yang sama seperti Sales. */
export function MenuOrder(props: ModulProps) {
  return <TabOrder {...props} />;
}

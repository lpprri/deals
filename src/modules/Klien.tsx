// Menu Clients baru (keputusan pengguna 15/11/2026, PR #37):
// menu tingkat atas di cluster Sales & Deals — awalnya setelah
// Campaign, dipindah ke setelah Order (koreksi pengguna 15/11/2026
// 20:55 WIB, PR #40; urutan akhir cluster 3: Sales, Deals, Campaign,
// Prospect, Offer, Order, Clients, Meeting).
// Memakai ulang daftar klien yang sama dari Deals (komponen TabKlien
// yang diekspor); TIDAK ada duplikasi tabel/data dan total tidak
// berubah. Clients adalah navigasi langsung — tanpa sub-item dan
// tanpa panel tambahan.
//
// FAKTA DATA (impor nyata 14/11/2026): 33 klien. Bila klien baru
// ditambahkan lewat form, menu ini ikut menampilkan karena membaca
// data.klien yang sama seperti Deals.

import { useEffect, useState } from 'react';
import { TabKlien } from './Deals';
import type { ModulProps } from '../lib/store';

/** Clients — daftar klien yang sama seperti Deals (tab Clients). */
export function MenuKlien({
  data,
  user,
  actions,
  cari,
  klienIdTerpilihLuar,
}: ModulProps) {
  // State lokal sama seperti Deals (tab klien): pilihan dan form —
  // supaya TabKlien dipakai ulang apa adanya.
  const [klienIdTerpilih, setKlienIdTerpilih] = useState<string | null>(null);
  const [tampilForm, setTampilForm] = useState(false);

  // Dibuka dari Detail Kontrak (nama klien diklik): pilih klien itu.
  // Hanya berjalan saat nilai luar berubah — pilihan manual pengguna
  // di daftar tidak ditimpa.
  useEffect(() => {
    if (klienIdTerpilihLuar) setKlienIdTerpilih(klienIdTerpilihLuar);
  }, [klienIdTerpilihLuar]);

  const kataKunci = cari.trim().toLowerCase();
  const cocokCari = (teks: string) =>
    kataKunci === '' || teks.toLowerCase().includes(kataKunci);

  const klienTerpilih = klienIdTerpilih
    ? data.klien.find((k) => k.id === klienIdTerpilih) ?? null
    : null;

  return (
    <TabKlien
      data={data}
      user={user}
      actions={actions}
      cari={cari}
      cocokCari={cocokCari}
      klienTerpilih={klienTerpilih}
      onPilihKlien={setKlienIdTerpilih}
      tampilForm={tampilForm}
      onTampilForm={setTampilForm}
    />
  );
}

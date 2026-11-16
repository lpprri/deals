// Menu kerja sama baru (keputusan pengguna 15/11/2026): Contract,
// Memorandum of Understanding, Commitment, Approvement — menu tingkat
// atas di bawah Campaign. Semuanya memakai ulang daftar kontrak yang
// sama dari Deals (komponen TabKontrak yang diekspor); TIDAK ada
// duplikasi data dan total tidak berubah.
//
// FAKTA DATA (impor nyata 14/11/2026, 42 kontrak — semuanya PNBP):
// kategoriLayanan yang ada hanya 'Jasa Penyiaran' (24), 'Jasa
// Penggunaan Sarana dan Prasarana Siaran' (17), dan 'Jasa Digitalisasi
// Penyiaran' (1). NOL kontrak berkategori 'Nota Kesepahaman',
// 'Dukungan Layanan', atau 'Media Partner' — ketiga kategori itu
// memang ada di MASTER_KATEGORI_LAYANAN tapi belum ada record-nya.
// Karena itu ketiga menu itu menampilkan EMPTY STATE JUJUR sampai
// datanya diimpor; JANGAN mengarang record dan JANGAN membuat model
// data baru secara diam-diam. Bila suatu saat record berkategori itu
// ada, menu otomatis menampilkan tabel yang sama seperti Deals.

import { useState } from 'react';
import { TabKontrak } from './Deals';
import type { ModulProps } from '../lib/store';
import { PesanKosong } from '../components/ui';
import type {
  ArahUrutKontrak,
  FilterStatusKerjaSama,
  FilterStatusPembayaran,
  KunciUrutKontrak,
} from '../lib/kontrakTampilan';

interface PropsKategori extends ModulProps {
  /**
   * Nilai `Kontrak.kategoriLayanan` yang difilter; null = semua kontrak
   * (menu Contract). Kategori 'Nota Kesepahaman' / 'Dukungan Layanan' /
   * 'Media Partner' masih MENUNGGU data — lihat komentar di atas.
   */
  kategori: string | null;
  /** Teks empty state jujur bila belum ada record berkategori ini. */
  teksKosong?: string;
  /** Penjelasan singkat di bawah empty state. */
  penjelasanKosong?: string;
}

function DaftarKontrakKategori({
  data,
  user,
  actions,
  cari,
  onNavigasiKlien,
  kategori,
  teksKosong,
  penjelasanKosong,
}: PropsKategori) {
  // State lokal sama seperti Deals (tab kontrak): pilihan, form,
  // filter, dan sort — supaya TabKontrak dipakai ulang apa adanya.
  const [kontrakIdTerpilih, setKontrakIdTerpilih] = useState<string | null>(null);
  const [tampilForm, setTampilForm] = useState(false);
  const [filterPnBP, setFilterPnBP] = useState<'Semua' | 'Fungsional' | 'Umum'>('Semua');
  const [filterJenisKlien, setFilterJenisKlien] = useState<string>('Semua');
  const [filterStatusPembayaran, setFilterStatusPembayaran] =
    useState<FilterStatusPembayaran>('Semua');
  const [filterStatusKerjaSama, setFilterStatusKerjaSama] =
    useState<FilterStatusKerjaSama>('Semua');
  const [urutKunci, setUrutKunci] = useState<KunciUrutKontrak>('tandaTangan');
  const [urutArah, setUrutArah] = useState<ArahUrutKontrak>('turun');

  const kataKunci = cari.trim().toLowerCase();
  const cocokCari = (teks: string) =>
    kataKunci === '' || teks.toLowerCase().includes(kataKunci);

  const kontrakTersaring =
    kategori === null
      ? data.kontrak
      : data.kontrak.filter((k) => k.kategoriLayanan === kategori);
  const kontrakTerpilih = kontrakIdTerpilih
    ? kontrakTersaring.find((k) => k.id === kontrakIdTerpilih) ?? null
    : null;

  // Belum ada record berkategori ini: empty state jujur, bukan tabel kosong.
  if (kategori !== null && kontrakTersaring.length === 0) {
    return (
      <div className="space-y-3">
        <PesanKosong teks={teksKosong ?? 'No records yet.'} />
        {penjelasanKosong && (
          <p className="max-w-2xl text-sm text-[#0d2569]/70">{penjelasanKosong}</p>
        )}
      </div>
    );
  }

  return (
    <TabKontrak
      data={{ ...data, kontrak: kontrakTersaring }}
      user={user}
      actions={actions}
      cocokCari={cocokCari}
      kontrakTerpilih={kontrakTerpilih}
      onPilihKontrak={setKontrakIdTerpilih}
      tampilForm={tampilForm}
      onTampilForm={setTampilForm}
      filterPnBP={filterPnBP}
      onFilterPnBP={setFilterPnBP}
      filterJenisKlien={filterJenisKlien}
      onFilterJenisKlien={setFilterJenisKlien}
      filterStatusPembayaran={filterStatusPembayaran}
      onFilterStatusPembayaran={setFilterStatusPembayaran}
      filterStatusKerjaSama={filterStatusKerjaSama}
      onFilterStatusKerjaSama={setFilterStatusKerjaSama}
      urutKunci={urutKunci}
      onUrutKunci={setUrutKunci}
      urutArah={urutArah}
      onUrutArah={setUrutArah}
      onNavigasiKlien={onNavigasiKlien}
    />
  );
}

/** Contract — daftar kontrak PNBP yang sama seperti Deals (42 kontrak). */
export function MenuKontrak(props: ModulProps) {
  return <DaftarKontrakKategori {...props} kategori={null} />;
}

/**
 * Memorandum of Understanding — Nota Kesepahaman untuk mendukung
 * program siaran. Data tipe ini masih menunggu (0 record).
 */
export function MenuMoU(props: ModulProps) {
  return (
    <DaftarKontrakKategori
      {...props}
      kategori="Nota Kesepahaman"
      teksKosong="No Memorandum of Understanding yet."
      penjelasanKosong="No contract in the imported data has the 'Nota Kesepahaman' service category yet. This list will fill in once such data is imported."
    />
  );
}

/**
 * Commitment — dokumen kerja sama dukungan layanan untuk support event
 * & program acara di RRI. Data tipe ini masih menunggu (0 record).
 */
export function MenuKomitmen(props: ModulProps) {
  return (
    <DaftarKontrakKategori
      {...props}
      kategori="Dukungan Layanan"
      teksKosong="No Commitment documents yet."
      penjelasanKosong="No contract in the imported data has the 'Dukungan Layanan' service category yet. This list will fill in once such data is imported."
    />
  );
}

/**
 * Approvement — dokumen media partner. Data tipe ini masih menunggu
 * (0 record).
 */
export function MenuApprovement(props: ModulProps) {
  return (
    <DaftarKontrakKategori
      {...props}
      kategori="Media Partner"
      teksKosong="No Approvement documents yet."
      penjelasanKosong="No contract in the imported data has the 'Media Partner' service category yet. This list will fill in once such data is imported."
    />
  );
}

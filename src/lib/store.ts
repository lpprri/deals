// Aksi store — diimplementasikan App.tsx, dipakai semua modul Fase A.
// Setiap aksi yang mengubah data sensitif juga menulis entri audit
// (PRD Bab 10). Modul tidak pernah mengubah `data` langsung.

import type {
  AppData,
  Denda,
  DokumenItem,
  Klien,
  Kontrak,
  Pembayaran,
  Pengajuan,
  StatusDokumen,
  TahapPengajuan,
} from './types';
import type { DummyUser } from './dummyUsers';

export interface PembayaranInput {
  tagihanId: string;
  tanggalBayar: string;
  jumlah: number;
  metode: string;
  buktiSetor?: string;
  penyetor: string;
}

export interface KlienInput {
  nama: string;
  jenis: string;
  alamat: string;
  kontakNama: string;
  kontakJabatan: string;
  telepon: string;
  email: string;
  npwp?: string;
  catatan?: string;
}

export interface LayananInput {
  kategori: string;
  satuan: string;
  tarif: number;
  jumlah: number;
  programa?: string;
}

export interface KontrakInput {
  nomorPks: string;
  klienId: string;
  kategoriLayanan: string;
  programa?: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  penanggungJawab: string;
  catatan?: string;
  layanan: LayananInput[];
}

export interface PengajuanInput {
  jenis: 'Kerja Sama Baru' | 'Sewa Baru';
  pemohon: string;
  tanggalMasuk: string;
  kebutuhan: string;
  penanggungJawab: string;
  nilaiPerkiraan?: number;
}

export interface DendaInput {
  tagihanId: string;
  dasar: string;
  jumlah: number;
}

export interface StoreActions {
  tambahKlien: (input: KlienInput) => string | null;
  tambahKontrak: (input: KontrakInput) => string | null;
  catatPembayaran: (input: PembayaranInput) => string | null;
  verifikasiPembayaran: (id: string) => void;
  tambahDenda: (input: DendaInput) => string | null;
  ubahStatusDokumen: (dokumen: DokumenItem, status: StatusDokumen) => void;
  tambahPengajuan: (input: PengajuanInput) => string | null;
  ubahTahapPengajuan: (pengajuan: Pengajuan, tahap: TahapPengajuan, alasan?: string) => void;
  konversiPengajuan: (pengajuan: Pengajuan) => string | null;
}

export interface ModulProps {
  data: AppData;
  user: DummyUser;
  actions: StoreActions;
  /** Kata kunci pencarian global dari top bar. */
  cari: string;
}

export type { AppData, Denda, DokumenItem, Klien, Kontrak, Pembayaran, Pengajuan };

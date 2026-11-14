// Aksi store — diimplementasikan App.tsx, dipakai semua modul Fase A.
// Setiap aksi yang mengubah data sensitif juga menulis entri audit
// (PRD Bab 10). Modul tidak pernah mengubah `data` langsung.

import type {
  Advertisement,
  AppData,
  Denda,
  DokumenItem,
  Event,
  Klien,
  Kontrak,
  Meeting,
  Order,
  Pembayaran,
  Pengajuan,
  Prospect,
  Quotation,
  StatusDokumen,
  StatusOrder,
  StatusQuotation,
  StatusTask,
  TahapPengajuan,
  TahapPipeline,
  Task,
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

// --- Input Fase B (PRD Bab 6.12, 7.2, 7.3, 7.7) ---

export interface ProspectInput {
  namaInstansi: string;
  kontakNama: string;
  kontakJabatan?: string;
  telepon: string;
  email?: string;
  sumber: string;
  layananDiminati: string;
  penanggungJawab: string;
  tanggalTindakLanjut?: string;
  nilaiPerkiraan: number;
  catatan?: string;
  pengajuanId?: string;
}

export interface QuotationLayananInput {
  kategori: string;
  satuan: string;
  /**
   * Tarif penawaran per satuan, diisi operator di form (master kategori
   * layanan Fase A tidak memuat tarif — sama seperti tarif layanan pada
   * form kontrak Fase A). Disimpan sebagai snapshot di quotation dan
   * tidak berubah bila master berubah.
   */
  tarif: number;
  jumlah: number;
  programa?: string;
}

export interface QuotationInput {
  prospectId: string;
  berlakuSampai: string;
  catatan?: string;
  layanan: QuotationLayananInput[];
}

export interface OrderInput {
  quotationId: string;
  catatan?: string;
}

export interface MeetingInput {
  tanggal: string;
  jam: string;
  prospectId?: string;
  klienId?: string;
  peserta: string;
  agenda: string;
  hasil?: string;
}

export interface EventInput {
  nama: string;
  tanggal: string;
  penyelenggara: string;
  biaya: number;
  hasil?: string;
  prospectId?: string;
}

export interface AdvertisementInput {
  nama: string;
  media: string;
  periodeMulai: string;
  periodeSelesai: string;
  biaya: number;
  hasil?: string;
}

export interface TaskInput {
  pemilik: string;
  judul: string;
  tenggat: string;
  terkaitId?: string;
  terkaitLabel?: string;
}

export interface DisposisiInput {
  pemberiDisposisi: string;
  penerima: string;
  judul: string;
  instruksi: string;
  tenggat: string;
  terkaitId?: string;
  terkaitLabel?: string;
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
  // Fase B — Sales (PRD Bab 7.3, 9.5).
  tambahProspect: (input: ProspectInput) => string | null;
  /** Pindah tahap pipeline dengan catatan tindak lanjut (dicatat di audit + riwayat prospek). */
  ubahTahapProspect: (prospect: Prospect, tahap: TahapPipeline, catatan: string) => string | null;
  tambahTindakLanjut: (prospect: Prospect, catatan: string, tanggal?: string) => void;
  tambahQuotation: (input: QuotationInput) => string | null;
  ubahStatusQuotation: (quotation: Quotation, status: StatusQuotation) => string | null;
  tambahOrder: (input: OrderInput) => string | null;
  ubahStatusOrder: (order: Order, status: StatusOrder) => string | null;
  /** Order Selesai -> Kontrak/PKS (Draft) via alur kontrak Fase A; prospek jadi Menang. */
  konversiOrder: (order: Order) => string | null;
  tambahMeeting: (input: MeetingInput) => string | null;
  // Fase B — Marketing (PRD Bab 7.2).
  tambahEvent: (input: EventInput) => string | null;
  tambahAdvertisement: (input: AdvertisementInput) => string | null;
  // Fase B — To-Do List (PRD Bab 7.7, 9.6).
  tambahTask: (input: TaskInput) => string | null;
  ubahStatusTask: (task: Task, status: StatusTask) => void;
  /** Disposisi (Alur F): pemberi menugaskan staf; tersimpan sebagai Task + riwayat. */
  tambahDisposisi: (input: DisposisiInput) => string | null;
  /** Pemberi disposisi menutup tugas yang sudah Selesai. */
  tutupDisposisi: (task: Task) => string | null;
}

export interface ModulProps {
  data: AppData;
  user: DummyUser;
  actions: StoreActions;
  /** Kata kunci pencarian global dari top bar. */
  cari: string;
}

export type {
  Advertisement,
  AppData,
  Denda,
  DokumenItem,
  Event,
  Klien,
  Kontrak,
  Meeting,
  Order,
  Pembayaran,
  Pengajuan,
  Prospect,
  Quotation,
  Task,
};

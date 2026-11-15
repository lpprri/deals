// Aksi store — diimplementasikan App.tsx, dipakai semua modul Fase A.
// Setiap aksi yang mengubah data sensitif juga menulis entri audit
// (PRD Bab 10). Modul tidak pernah mengubah `data` langsung.

import type {
  Advertisement,
  AppData,
  ArtikelKB,
  Denda,
  DokumenItem,
  Event,
  JenisPengajuanKlien,
  Klien,
  Kontrak,
  Meeting,
  Order,
  Pembayaran,
  Pengajuan,
  PengajuanKlien,
  Prospect,
  Quotation,
  StatusDokumen,
  StatusOrder,
  StatusQuotation,
  StatusTask,
  StatusTiket,
  TahapPengajuan,
  TahapPipeline,
  Task,
  Tiket,
  UmpanBalik,
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
  /** Tanggal kontrak ditandatangani (Q-09) — opsional; kosong = fallback tanggalMulai. */
  tanggalTandaTangan?: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  penanggungJawab: string;
  /** Operator penutup (Q-09) — opsional; kosong = diisi nama operator yang login. */
  operatorPenutup?: string;
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

export interface PengajuanKlienInput {
  jenis: JenisPengajuanKlien;
  judul: string;
  uraian: string;
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

// --- Input Fase C — Service (PRD Bab 7.8; Q-12) ---

export interface TiketInput {
  kategori: string;
  judul: string;
  isi: string;
}

export interface UmpanBalikInput {
  kontrakId: string;
  /** Skor 1–5 per pertanyaan (MASTER_PERTANYAAN_SURVEI), urutan bebas. */
  jawaban: { pertanyaan: string; skor: number }[];
  komentar?: string;
}

export interface ArtikelKBInput {
  judul: string;
  nomor?: string;
  tanggalBerlaku?: string;
  ringkasan: string;
  isi?: string;
  tautan?: string;
}

export interface StoreActions {
  tambahKlien: (input: KlienInput) => string | null;
  tambahKontrak: (input: KontrakInput) => string | null;
  /**
   * Ubah atribusi kontrak (Q-09; keputusan 2026-11-15): operator penutup
   * dan/atau tanggal tanda tangan. Dipakai untuk menugaskan operator ke
   * kontrak impor yang belum punya operatorPenutup. Kontrak lain tidak
   * berubah; perubahan tercatat di audit.
   */
  ubahAtribusiKontrak: (
    kontrak: Kontrak,
    input: { operatorPenutup?: string; tanggalTandaTangan?: string },
  ) => string | null;
  catatPembayaran: (input: PembayaranInput) => string | null;
  verifikasiPembayaran: (id: string) => void;
  tambahDenda: (input: DendaInput) => string | null;
  ubahStatusDokumen: (dokumen: DokumenItem, status: StatusDokumen) => void;
  tambahPengajuan: (input: PengajuanInput) => string | null;
  ubahTahapPengajuan: (pengajuan: Pengajuan, tahap: TahapPengajuan, alasan?: string) => void;
  konversiPengajuan: (pengajuan: Pengajuan) => string | null;
  // Fase C — Client Order Portal (Q-10). Approval Operator TIDAK membuat
  // entitas order kedua: submission yang disetujui menjadi Prospect baru
  // lewat alur Sales yang sudah ada (prospect → quotation → order →
  // kontrak); submission menautkannya lewat `prospectId`.
  /** PIC klien membuat submission (status awal 'Menunggu'). */
  tambahPengajuanKlien: (input: PengajuanKlienInput) => string | null;
  /**
   * Operator menyetujui submission: status 'Disetujui' + Prospect baru
   * (tahap 'Prospek Baru', sumber 'Pengajuan') + tautan `prospectId`.
   */
  setujuiPengajuanKlien: (
    submission: PengajuanKlien,
    catatan?: string,
  ) => string | null;
  /** Operator menolak submission: status 'Ditolak', catatan wajib, audit tercatat. */
  tolakPengajuanKlien: (submission: PengajuanKlien, catatan: string) => string | null;
  // Fase B — Sales (PRD Bab 7.3, 9.5).
  tambahProspect: (input: ProspectInput) => string | null;
  /** Pindah tahap pipeline dengan catatan tindak lanjut (dicatat di audit + riwayat prospek). */
  ubahTahapProspect: (prospect: Prospect, tahap: TahapPipeline, catatan: string) => string | null;
  tambahTindakLanjut: (prospect: Prospect, catatan: string, tanggal?: string) => void;
  tambahQuotation: (input: QuotationInput) => string | null;
  ubahStatusQuotation: (quotation: Quotation, status: StatusQuotation) => string | null;
  tambahOrder: (input: OrderInput) => string | null;
  ubahStatusOrder: (order: Order, status: StatusOrder) => string | null;
  /** Order Selesai -> Kontrak/PKS (Draft) via alur kontrak Fase A; prospek jadi Diterima. */
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
  // Fase C — Service (PRD Bab 7.8; Q-12).
  /** Buat tiket konsultasi Help-Desk ke Direktorat Layanan & Pengembangan Usaha. */
  tambahTiket: (input: TiketInput) => string | null;
  /**
   * Tambah jawaban/tindak lanjut ke tiket. Balasan pertama mengubah status
   * Terbuka -> Dijawab. Tiket Ditutup tidak bisa dibalas (buka kembali dulu).
   */
  tambahBalasanTiket: (tiket: Tiket, isi: string) => string | null;
  /** Ubah status tiket (Terbuka/Dijawab/Ditutup; Ditutup bisa dibuka kembali). */
  ubahStatusTiket: (tiket: Tiket, status: StatusTiket) => void;
  /** Simpan survei kepuasan klien untuk satu kontrak (satu survei per kontrak). */
  tambahUmpanBalik: (input: UmpanBalikInput) => string | null;
  /** Tambah entri Regulasi & SOP ke Knowledge Base (nasional, tanpa satker). */
  tambahArtikelKB: (input: ArtikelKBInput) => string | null;
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
  ArtikelKB,
  Denda,
  DokumenItem,
  Event,
  Klien,
  Kontrak,
  Meeting,
  Order,
  Pembayaran,
  Pengajuan,
  PengajuanKlien,
  Prospect,
  Quotation,
  Task,
  Tiket,
  UmpanBalik,
};

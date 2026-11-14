// Tipe data inti Partnership LPP RRI — Fase A (PRD v2.0 Final Bab 6).
// Aturan yang dikunci:
// - Setiap entitas wajib punya field `satker` (kode + nama), Amandemen v2.1.
// - Tanggal disimpan sebagai string ISO 'yyyy-mm-dd'; ditampilkan dd/mm/yyyy.
// - Nilai uang dalam Rupiah (number, tanpa desimal).
// - Satu kode akun = satu klasifikasi; Master Kode Akun (master.ts) adalah
//   sumber kebenaran: 425131 = Umum.

export interface SatkerRef {
  kode: string;
  nama: string;
}

export type JenisPnBP = 'Fungsional' | 'Umum';

export type StatusKontrak =
  | 'Draft'
  | 'Aktif'
  | 'Selesai'
  | 'Dibatalkan'
  | 'Berakhir';

export type StatusDokumen = 'Ada' | 'Belum Ada' | 'Tidak Berlaku';

export interface LayananKontrak {
  id: string;
  namaLayanan: string;
  kategori: string;
  kodeAkun: string;
  jenisPnBP: JenisPnBP;
  satuan: string;
  tarif: number;
  jumlah: number;
  subtotal: number;
  programa?: string;
}

export interface Klien {
  id: string;
  nama: string;
  jenis: string;
  alamat: string;
  kontakNama: string;
  kontakJabatan: string;
  telepon: string;
  email: string;
  npwp?: string;
  status: 'Aktif' | 'Nonaktif';
  catatan?: string;
  satker: SatkerRef;
  dibuatOleh: string;
  dibuatPada: string;
}

export interface Kontrak {
  id: string;
  nomorPks: string;
  klienId: string;
  jenisPnBP: JenisPnBP;
  kategoriLayanan: string;
  programa?: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  nilaiKontrak: number;
  status: StatusKontrak;
  sewaId?: string;
  penanggungJawab: string;
  catatan?: string;
  satker: SatkerRef;
  layanan: LayananKontrak[];
}

export interface DokumenItem {
  id: string;
  kontrakId: string;
  jenisDokumen: string;
  status: StatusDokumen;
  catatan?: string;
  diunggahOleh?: string;
  tanggalUnggah?: string;
}

export type StatusTagihan =
  | 'Belum Jatuh Tempo'
  | 'Jatuh Tempo'
  | 'Lewat Jatuh Tempo'
  | 'Lunas Sebagian'
  | 'Lunas';

export interface Tagihan {
  id: string;
  nomor: string;
  kontrakId: string;
  uraian: string;
  nilai: number;
  tanggalTerbit: string;
  tanggalJatuhTempo: string;
  kodeAkun: string;
  satker: SatkerRef;
}

export interface Pembayaran {
  id: string;
  tagihanId: string;
  tanggalBayar: string;
  jumlah: number;
  metode: string;
  buktiSetor?: string;
  penyetor: string;
  statusVerifikasi: 'Terverifikasi' | 'Menunggu Verifikasi';
  satker: SatkerRef;
}

export interface Denda {
  id: string;
  tagihanId: string;
  /** Dasar keterlambatan — wajib diisi; denda dicatat manual sampai Q-03 terjawab. */
  dasar: string;
  jumlah: number;
  status: 'Terhitung' | 'Ditagihkan' | 'Dibayar' | 'Dihapus';
  kodeAkun: string;
  satker: SatkerRef;
}

export type StatusSewa = 'ON GOING' | 'Berakhir' | 'Pengajuan' | 'Bermasalah';

export interface RiwayatHarga {
  tanggalBerlaku: string;
  nilai: number;
}

export interface TemuanLapangan {
  tanggal: string;
  uraian: string;
  tindakLanjut: string;
  status: 'Dalam Tindak Lanjut' | 'Selesai';
}

export interface Sewa {
  id: string;
  aset: string;
  lokasi: string;
  penyewaId?: string;
  penyewaNama: string;
  nomorPerjanjian: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  nilaiSewa: number;
  status: StatusSewa;
  diterimaDiMuka: number;
  masihHarusDiterima: number;
  kontrakId?: string;
  riwayatHarga: RiwayatHarga[];
  temuan: TemuanLapangan[];
  satker: SatkerRef;
}

export type TahapPengajuan =
  | 'Masuk'
  | 'Ditelaah'
  | 'Menunggu Dokumen'
  | 'Disetujui'
  | 'Ditolak'
  | 'Dikonversi';

export interface Pengajuan {
  id: string;
  jenis: 'Kerja Sama Baru' | 'Sewa Baru';
  pemohon: string;
  tanggalMasuk: string;
  kebutuhan: string;
  tahap: TahapPengajuan;
  penanggungJawab: string;
  catatan?: string;
  alasanTolak?: string;
  nilaiPerkiraan?: number;
  hasilKonversi?: { jenis: 'Kontrak' | 'Sewa'; id: string; label: string };
  satker: SatkerRef;
}

/** Data acuan Keuangan — READ-ONLY untuk Layanan dan Umum (PRD Bab 6.5). */
export interface PenerimaanAcuan {
  id: string;
  periode: string; // 'yyyy-mm'
  kodeAkun: string;
  uraian: string;
  jumlah: number;
  // Opsional: sumber (Sheet 3) memang tidak mencantumkan penyetor pada
  // 3 baris nyata — denda agregat Feb 2026 (ACU-010) dan 2 baris
  // Pemindahtanganan BMN (ACU-003, ACU-057, penyetor "-" di sumber).
  // Tidak ditebak; UI menampilkan '-' bila kosong.
  penyetor?: string;
  tanggalSetor?: string;
  satker: SatkerRef;
}

// ---------------------------------------------------------------------------
// Entitas Fase B (PRD v2.0 Final Bab 6.12, 7.2, 7.3, 7.7).
// Aturan yang sama seperti Fase A: field `satker` wajib; tanggal ISO;
// nilai Rupiah (number). Tahap pipeline masih DRAF — Q-11 belum terjawab
// (lihat MASTER_TAHAP_PIPELINE di master.ts).

export type TahapPipeline =
  | 'Prospek Baru'
  | 'Dihubungi'
  | 'Penawaran'
  | 'Negosiasi'
  | 'Order'
  | 'Menang'
  | 'Kalah';

export interface TindakLanjut {
  tanggal: string;
  catatan: string;
  oleh: string;
}

export interface Prospect {
  id: string;
  namaInstansi: string;
  kontakNama: string;
  kontakJabatan?: string;
  telepon: string;
  email?: string;
  sumber: string;
  layananDiminati: string;
  tahap: TahapPipeline;
  penanggungJawab: string;
  tanggalTindakLanjut?: string;
  nilaiPerkiraan: number;
  catatan?: string;
  /** Tautan ke klien bila prospek sudah menjadi klien (Deals). */
  klienId?: string;
  /** Tautan ke pengajuan asal bila prospek masuk dari Pengajuan (Fase A). */
  pengajuanId?: string;
  /** Tautan ke kontrak hasil konversi (jejak end-to-end, gerbang Fase B). */
  kontrakId?: string;
  riwayat: TindakLanjut[];
  satker: SatkerRef;
}

export type StatusQuotation = 'Draft' | 'Dikirim' | 'Disetujui' | 'Ditolak';

export interface QuotationLayanan {
  id: string;
  kategori: string;
  kodeAkun: string;
  jenisPnBP: JenisPnBP;
  satuan: string;
  /** Tarif snapshot saat quotation dibuat — tidak berubah bila master berubah. */
  tarif: number;
  jumlah: number;
  subtotal: number;
  programa?: string;
}

export interface Quotation {
  id: string;
  prospectId: string;
  tanggalBuat: string;
  berlakuSampai: string;
  status: StatusQuotation;
  layanan: QuotationLayanan[];
  /** Nilai penawaran = Σ subtotal layanan (dihitung, bukan diinput bebas). */
  nilai: number;
  catatan?: string;
  satker: SatkerRef;
}

export type StatusOrder = 'Draft' | 'Diproses' | 'Selesai' | 'Dibatalkan';

export interface Order {
  id: string;
  quotationId: string;
  prospectId: string;
  tanggalOrder: string;
  status: StatusOrder;
  nilai: number;
  catatan?: string;
  /** Tautan ke kontrak hasil konversi (Deals → Contracts). */
  kontrakId?: string;
  satker: SatkerRef;
}

export interface Meeting {
  id: string;
  tanggal: string; // 'yyyy-mm-dd'
  jam: string; // 'hh:mm'
  prospectId?: string;
  klienId?: string;
  peserta: string;
  agenda: string;
  hasil?: string;
  satker: SatkerRef;
}

export interface Event {
  id: string;
  nama: string;
  tanggal: string;
  penyelenggara: string;
  biaya: number;
  hasil?: string;
  /** Prospek/klien yang dihasilkan event ini (tautan opsional, Bab 7.2). */
  prospectId?: string;
  satker: SatkerRef;
}

export interface Advertisement {
  id: string;
  nama: string;
  media: string;
  periodeMulai: string;
  periodeSelesai: string;
  biaya: number;
  hasil?: string;
  satker: SatkerRef;
}

export type StatusTask = 'Belum Dikerjakan' | 'Berjalan' | 'Selesai' | 'Ditutup';

export interface Task {
  id: string;
  pemilik: string;
  judul: string;
  tenggat: string;
  status: StatusTask;
  /** Bila tugas berasal dari disposisi (Alur F Bab 9.6). */
  disposisiDari?: string;
  instruksi?: string;
  /** Pemberi disposisi; kosong untuk tugas pribadi. */
  pemberiDisposisi?: string;
  /** Tautan opsional ke prospek/klien/pengajuan terkait. */
  terkaitId?: string;
  terkaitLabel?: string;
  satker: SatkerRef;
}

export interface AuditEntry {
  id: string;
  waktu: string; // ISO datetime
  pengguna: string;
  peran: string;
  aksi: string;
  entitas: string;
  entitasId: string;
  sebelum?: string;
  sesudah?: string;
}

export interface AppData {
  klien: Klien[];
  kontrak: Kontrak[];
  dokumen: DokumenItem[];
  tagihan: Tagihan[];
  pembayaran: Pembayaran[];
  denda: Denda[];
  sewa: Sewa[];
  pengajuan: Pengajuan[];
  penerimaanAcuan: PenerimaanAcuan[];
  audit: AuditEntry[];
  // Fase B (PRD Bab 6.12).
  prospect: Prospect[];
  quotation: Quotation[];
  order: Order[];
  meeting: Meeting[];
  event: Event[];
  advertisement: Advertisement[];
  task: Task[];
}

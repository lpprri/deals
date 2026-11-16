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
  /** Tanggal kontrak ditandatangani (Q-09, Fase C) — acuan periode Employee Rank & Satker Rank. Opsional: kontrak impor lama belum punya field ini; bila kosong, ranking memakai tanggalMulai sebagai fallback (lihat tanggalAcuanKontrak di derive.ts). */
  tanggalTandaTangan?: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  nilaiKontrak: number;
  status: StatusKontrak;
  sewaId?: string;
  /** PIC klien (bukan operator RRI) — nama penanggung jawab di sisi klien/mitra. */
  penanggungJawab: string;
  /**
   * Operator Staf Layanan & Pengembangan Usaha yang menutup kontrak ini
   * (Q-09; keputusan pengguna 2026-11-15). Acuan Employee Rank — BUKAN
   * penanggungJawab (itu PIC klien). Diisi otomatis dari nama operator
   * yang login saat kontrak dibuat/dikonversi; bisa diubah di detail
   * kontrak. Kontrak impor lama belum punya field ini (tidak diketahui
   * operatornya) — ranking hanya menghitung kontrak yang sudah punya
   * operatorPenutup dan memberi catatan jujur untuk sisanya.
   */
  operatorPenutup?: string;
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

// ---------------------------------------------------------------------------
// Entitas Fase C — Submission publik (PRD v2.0 Final Bab 7.8; Q-10
// terjawab 15/11/2026).
//
// REVISI per KOREKSI 2026-11-15: PIC klien TIDAK lagi daftar/masuk —
// tidak ada akun klien. Submission berasal dari FORM PUBLIK tanpa akun
// ("Ajukan Permohonan Kerja Sama"); approval tetap oleh OPERATOR.
// Satu submission yang disetujui tetap menjadi SATU Prospect baru lewat
// alur Sales yang sudah ada (tanpa entitas order kedua).
//
// ASUMSI YANG DITETAPKAN (bukan tebakan diam-diam):
// - Yang memberi approval adalah OPERATOR (satu-satunya peran yang bisa
//   menyetujui dari dalam aplikasi).
// - Submission yang disetujui TIDAK menjadi entitas order kedua: ia
//   menjadi Prospect baru lewat alur Sales yang sudah ada (prospect →
//   quotation → order → kontrak), dan submission menautkannya lewat
//   `prospectId`. Tidak ada duplikasi total order/kontrak.
// - Submission publik dari calon klien yang belum tercatat punya
//   `klienId` KOSONG (''); Klien baru dibuatkan Operator saat menyetujui.

/** Jenis submission yang bisa dibuat dari form publik (Q-10). */
export type JenisPengajuanKlien =
  | 'Pengajuan Kerja Sama'
  | 'Media Order'
  | 'Permohonan Sewa';

export const DAFTAR_JENIS_PENGAJUAN_KLIEN: JenisPengajuanKlien[] = [
  'Pengajuan Kerja Sama',
  'Media Order',
  'Permohonan Sewa',
];

/** Status antrean approval submission publik. */
export type StatusPengajuanKlien = 'Menunggu' | 'Disetujui' | 'Ditolak';

export interface PengajuanKlien {
  id: string;
  /** Klien asal submission — KOSONG ('') bila submission publik dari calon klien yang belum tercatat; diisi saat Operator menyetujui (dibuatkan Klien baru). */
  klienId: string;
  /** Nama institusi pemohon (submission publik). */
  namaInstitusi?: string;
  /** Telepon pemohon (submission publik, opsional). */
  telepon?: string;
  jenis: JenisPengajuanKlien;
  judul: string;
  uraian: string;
  /** Nama pemohon (PIC / pengaju). */
  namaPic: string;
  /** Email kontak pemohon (untuk submission publik). */
  dibuatOleh: string;
  tanggalBuat: string; // 'yyyy-mm-dd'
  nilaiPerkiraan?: number;
  status: StatusPengajuanKlien;
  /** Catatan Operator saat menyetujui/menolak (wajib diisi bila menolak). */
  catatanOperator?: string;
  /** Tautan ke Prospect internal hasil approval (alur Sales yang sudah ada). */
  prospectId?: string;
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
// nilai Rupiah (number). Tahap pipeline FINAL — Q-11 terjawab 15/11/2026
// (7 tahap; 'Menang'/'Kalah' diganti 'Diterima'/'Ditolak', lihat
// MASTER_TAHAP_PIPELINE di master.ts).

export type TahapPipeline =
  | 'Prospek Baru'
  | 'Dihubungi'
  | 'Penawaran'
  | 'Negosiasi'
  | 'Order'
  | 'Diterima'
  | 'Ditolak';

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

// ---------------------------------------------------------------------------
// Entitas Fase C — Service (PRD v2.0 Final Bab 7.8; Q-12 terjawab 15/11/2026).
// Help-Desk: tiket konsultasi ke Direktorat Layanan & Pengembangan Usaha
// (PIC beragam per kategori; nama PIC per kategori belum ditentukan — tiket
// wajib punya field kategori, tujuan tampil sebagai nama direktorat).
// Feedback: survei kepuasan klien per kontrak. Knowledge Base: Regulasi &
// SOP nasional (tanpa field satker — dibaca semua Operator).

export type StatusTiket = 'Terbuka' | 'Dijawab' | 'Ditutup';

export interface BalasanTiket {
  id: string;
  tanggal: string; // 'yyyy-mm-dd'
  isi: string;
  oleh: string;
}

export interface Tiket {
  id: string;
  kategori: string; // jenis konsultasi, dari MASTER_KATEGORI_TIKET
  judul: string;
  isi: string;
  /** PIC tujuan — selalu "Direktorat Layanan & Pengembangan Usaha" (Q-12). */
  tujuan: string;
  tanggal: string; // 'yyyy-mm-dd'
  dibuatOleh: string;
  status: StatusTiket;
  /** Riwayat balasan & tindak lanjut (jawaban tersimpan per tiket, Q-12). */
  balasan: BalasanTiket[];
  satker: SatkerRef;
}

export interface JawabanSurvei {
  pertanyaan: string;
  /** Skala kepuasan 1–5. */
  skor: number;
}

export interface UmpanBalik {
  id: string;
  kontrakId: string;
  tanggal: string; // 'yyyy-mm-dd'
  /** Satu survei per kontrak; jawaban mencakup semua MASTER_PERTANYAAN_SURVEI. */
  jawaban: JawabanSurvei[];
  komentar?: string;
  dibuatOleh: string;
  satker: SatkerRef;
}

export interface ArtikelKB {
  id: string;
  judul: string;
  /** Nomor regulasi/dokumen bila ada — kosong bila tidak tercantum. */
  nomor?: string;
  /** Kategori dokumen — 'Regulasi' atau 'SOP' (MASTER_KATEGORI_KB). */
  kategori?: string;
  tanggalBerlaku?: string; // 'yyyy-mm-dd'
  ringkasan: string;
  isi?: string;
  /** Tautan dokumen (mis. Drive) bila ada. */
  tautan?: string;
  dibuatOleh: string;
  dibuatPada: string; // 'yyyy-mm-dd'
  // TIDAK punya field satker: Regulasi & SOP bersifat nasional.
}

/** Entri FAQ Resources — tanya-jawab yang jawabannya bersumber dari regulasi yang diimpor (PR #49). */
export interface FaqItem {
  id: string; // 'FAQ-01', dst.
  pertanyaan: string;
  jawaban: string;
  /** Sumber jawaban — nama regulasi + pasal/bagian bila terbaca. */
  sumber: string;
  // TIDAK punya field satker: FAQ bersifat nasional seperti artikelKB.
}

// Fase C — Chat antar operator 1-to-1 (PR #45, 16/11/2026).
export interface Pesan {
  id: string; // 'PSN-01', dst.
  /** Id percakapan 1-to-1 — lihat idPercakapan() di lib/pesan.ts. */
  idPercakapan: string;
  /**
   * Pengirim: `email` = alamat Auth asli bila ada, bila tidak kunci
   * alamat internal turunan nama (lihat kunciAlamatOperator di
   * lib/pesan.ts — BUKAN alamat email sungguhan).
   */
  pengirim: { email: string; nama: string };
  /** Penerima: hanya kunci alamat yang sama seperti pengirim. */
  penerima: { email: string };
  isi: string;
  /**
   * Waktu kirim, string ISO LENGKAP (tanggal + jam) — pengecualian dari
   * aturan 'yyyy-mm-dd' di atas, supaya urutan pesan dalam satu hari
   * terjaga. Ditampilkan lewat formatWaktuPesan() di lib/pesan.ts.
   */
  tanggal: string;
  /** Sudah dibaca penerima. */
  dibaca: boolean;
  satker: SatkerRef;
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
  pengajuanKlien: PengajuanKlien[];
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
  // Fase C — Service (PRD Bab 7.8).
  tiket: Tiket[];
  umpanBalik: UmpanBalik[];
  artikelKB: ArtikelKB[];
  // PR #49 — FAQ Resources (tanya-jawab bersumber regulasi, nasional).
  faq: FaqItem[];
  // Fase C — Chat antar operator 1-to-1 (PR #45): mulai kosong, tanpa
  // pesan contoh.
  pesan: Pesan[];
}

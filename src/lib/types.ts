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
  /**
   * Realisasi kerja sama per layanan, fraksi 0–1, dari kolom
   * "Realisasi Kerja Sama" file sumber (proporsi yang sudah tayang /
   * dilaksanakan). Bila kosong, realisasi dihitung dari aturan fallback
   * (lihat realisasiLayanan di lib/realisasi.ts).
   */
  realisasi?: number;
  /**
   * Jenis waktu siaran per layanan, persis dari kolom "Jenis Waktu"
   * file sumber ("Prime Time" / "Regular Time"). Hanya ada pada layanan
   * siaran; layanan sewa/digital tidak punya nilai ini.
   */
  jenisWaktu?: string;
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
  /**
   * Akun klien SUDAH dibuat untuk record ini (invite oleh Operator,
   * dua peran 19/11/2026) — BUKAN alamat email klien. Semua 33 record
   * seed masih punya email KOSONG, jadi field ini yang menandai record
   * yang sudah punya akun (diisi true oleh Operator saat akun Auth
   * klien dibuat dan ditautkan ke record ini; lihat kartu "Invite
   * Client Account" di MasterPage). Klien tanpa akun tetap tidak bisa
   * login — mereka memakai Lacak publik (nomor PKS/tagihan).
   */
  akunKlienDibuat?: boolean;
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
   * Penandatangan kontrak dari kolom "Nama Penandatangan" file sumber
   * (format sumber: "nama\njabatan"). Bila sumber tidak mencatat jabatan
   * (mis. klien perorangan), penandatanganJabatan kosong — bukan ditebak.
   * Kontrak 018/PKS/DIR.LPU/08/2026 tidak punya penandatangan di sumber.
   */
  penandatanganNama?: string;
  penandatanganJabatan?: string;
  /**
   * Detail BMN/aset kontrak sewa (PNBP Umum), dari file sumber per kontrak:
   * jenisBmn = kolom "Detail BMN" (mis. "Lahan", "Aula"),
   * lokasiBmn = "Lokasi BMN", ukuranBmn = "Ukuran BMN",
   * luasBmn = "Luas BMN", dasarNilai = "Dasar Nilai" yaitu nomor surat
   * persetujuan KPKNL (mis. "S-476/MK/KNL.0402/2025"). Kontrak Fungsional
   * tidak punya field ini.
   */
  jenisBmn?: string;
  lokasiBmn?: string;
  ukuranBmn?: string;
  luasBmn?: string;
  dasarNilai?: string;
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
  /**
   * Id klien pemilik dokumen — denormalisasi dari kontrak lewat
   * kontrakId (dua peran 19/11/2026). Dipakai aturan Firestore
   * baca-klien: klien hanya membaca dokumen yang klienId-nya sama
   * dengan klienId di profilnya (users/{uid}.klienId). Diisi di seed
   * (scripts/isi-klienId-seed.py) dan di data live oleh backfill
   * satu kali (src/lib/backfillKlienId.ts); dokumen lama tanpa field
   * ini tidak terbaca klien.
   */
  klienId?: string;
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
  /**
   * Id klien pemilik tagihan — denormalisasi dari kontrak lewat
   * kontrakId (dua peran 19/11/2026). Dipakai aturan Firestore
   * baca-klien (lihat komentar klienId di DokumenItem): klien hanya
   * membaca tagihan miliknya sendiri. Diisi di seed
   * (scripts/isi-klienId-seed.py) dan di data live oleh backfill
   * satu kali (src/lib/backfillKlienId.ts).
   */
  klienId?: string;
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
  /**
   * Id klien pemilik pembayaran — denormalisasi dari tagihan lewat
   * tagihanId → kontrak (dua peran 19/11/2026). Dipakai aturan
   * Firestore baca-klien (lihat komentar klienId di DokumenItem).
   * Diisi di seed (scripts/isi-klienId-seed.py) dan di data live
   * oleh backfill satu kali (src/lib/backfillKlienId.ts).
   */
  klienId?: string;
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
  /**
   * Id klien pemilik denda — denormalisasi dari tagihan lewat
   * tagihanId → kontrak (dua peran 19/11/2026). Dipakai aturan
   * Firestore baca-klien (lihat komentar klienId di DokumenItem).
   * Diisi di seed (scripts/isi-klienId-seed.py) dan di data live
   * oleh backfill satu kali (src/lib/backfillKlienId.ts).
   */
  klienId?: string;
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

/**
 * Status permintaan dari form publik (Tally / Coming Soon) — panel Order,
 * enam tabel (PR #115). 'Baru' = baru masuk, belum ditindaklanjuti.
 */
export type StatusPermintaan = 'Baru' | 'Diproses' | 'Selesai' | 'Ditolak';

/**
 * Permintaan quotation iklan dari form Tally "Plan a Campaign" (id ArpNAN,
 * 29 pertanyaan dalam 8 kelompok). Kolom tabel: Request ID, Client,
 * Company, Services, Budget, Submitted, Status. Diisi OTOMATIS oleh
 * webhook Tally (PR terpisah — butuh upgrade Firebase ke Blaze); sampai
 * webhook tersambung tabel ini kosong. TANPA data contoh — jangan
 * mengarang permintaan.
 * - namaLengkap = A1, perusahaan = A2, email = A3 (untuk follow-up).
 * - layanan = B1 (checkboxes: Radio Ads, Social Media Ads, Digital
 *   Platform Ads, Dialogue & Podcast).
 * - anggaran = G1 (rentang klasifikasi, BUKAN harga — tarif tidak tampil
 *   di form).
 * NILAI MENTAH vs TAMPILAN (terverifikasi via API, submission laGXkbk):
 * Tally menyimpan jawaban pilihan sebagai UUID BLOK OPSI, bukan teks
 * (mis. B1 menyimpan 'd774d4c6-...' = 'Social Media Ads'). Record ini
 * menyimpan nilai MENTAH apa adanya; tabel menyelesaikannya saat render
 * lewat labelOpsiTally() (src/lib/petaOpsiTally.ts) — JANGAN pernah
 * menampilkan UUID mentah ke operator. Webhook memakai peta yang sama.
 */
export interface AdsQuotationRequest {
  /** Id submission Tally, mis. 'AQR-...' — dibuat webhook dari submissionId. */
  id: string;
  namaLengkap: string;
  perusahaan: string;
  email: string;
  telepon?: string;
  layanan: string[];
  anggaran: string;
  tanggalSubmit: string; // 'yyyy-mm-dd'
  status: StatusPermintaan;
  satker: SatkerRef;
}

/**
 * Permintaan layanan dari form Coming Soon (Book a Venue / Rent a Space /
 * Get a Journalism Training / Partner with RRI) — panel Order,
 * enam tabel (PR #115). Keempat tabel memakai interface yang sama;
 * koleksinya berbeda (venueBookOrder, spaceRentOrder, trainingOrder,
 * partnershipRequest). TANPA data contoh.
 *
 * Sejak halaman layanan tambahan (2026-11-21): tiga form publik sudah
 * hidup (Book a Venue, Rent a Space, Get a Journalism Training) dan
 * menulis detail permintaan ke field OPSIONAL di bawah — opsional supaya
 * baris lama (tanpa detail) tetap jalan; tabel Order menampilkan detail
 * di kolom Details. Form Partnership Request (2026-11-21) menulis
 * institusi pemohon ke field `institusi` (opsional di tipe — tabel lain
 * tidak memakainya).
 */
export interface PermintaanLayanan {
  /** Id permintaan, mis. 'VBR-...', 'SRR-...', 'TRN-...', 'PTR-...'. */
  id: string;
  namaKlien: string;
  tanggalPermintaan: string; // 'yyyy-mm-dd'
  status: StatusPermintaan;
  satker: SatkerRef;
  /** Institusi/organisasi pemohon (form Partnership Request). */
  institusi?: string;
  /** Nama venue / lahan / course yang dipilih. */
  layanan?: string;
  /** Tanggal layanan yang diminta / tanggal jadwal course, 'yyyy-mm-dd'. */
  tanggalLayanan?: string;
  /** Tanggal selesai booking venue (CHECK-OUT), 'yyyy-mm-dd' — opsional,
      hanya bila berbeda dari tanggalLayanan (booking multi-hari). */
  tanggalSelesai?: string;
  /** Occasion (venue) / pesan inquiry (space). */
  keperluan?: string;
  /** Kontak pengunjung (WA/telepon). */
  kontak?: string;
  /** Email pengunjung. */
  email?: string;
  /** Jumlah peserta (booking venue) — dari stepper Who / form booking. */
  jumlahPeserta?: number;
}

/**
 * Memorandum of Understanding — record kerja sama dari file pengguna
 * "Rekapitulasi_Nota_Kesepahaman.xlsx" (sheet '2026', 44 baris;
 * impor 19/11/2026). Data TERPISAH dari kontrak PNBP — bukan kontrak,
 * tanpa nilai rupiah, dan TIDAK memengaruhi total kontrak/PNBP.
 * Keputusan pengguna 19/11/2026: SEMUA 44 baris adalah MoU meski
 * penyebutan JENIS berbeda (26 Nota Kesepahaman, 17 Perjanjian
 * Kerjasama, 1 Pelaksanaan Kerja Sama); label JENIS asli disimpan di
 * field `jenis`. Panel Memorandum of Understanding membaca koleksi
 * `mou` (seed: src/lib/seedMou.ts, dibuat scripts/impor-mou.py).
 * - id = nomor dokumen (5 kolom digabung, mis.
 *   '008/RRI-PLB/KJM.02.04/01/2026'); mengandung '/' seperti id
 *   kontrak, di-encode saat tulis Firestore.
 * - pic = PIC RRI penanggung jawab (apa adanya dari file: 'Dessi' dan
 *   'Dessi Maya Sari' TIDAK digabung; 'Selvia Lena' bukan operator).
 *   '—' bila kosong di sumber (1 baris).
 * - dokumen = label dokumen sumber ('DOKUMEN NOTA KESEPAHAMAN', dst.);
 *   '—' bila kosong di sumber (21 baris).
 * - tanggal* = 'yyyy-mm-dd'. Typo tahun sumber '0206' (2 baris)
 *   dibaca sebagai 2026 (lihat scripts/impor-mou.py).
 */
export interface Mou {
  /** Nomor dokumen — id record. */
  id: string;
  /** JENIS KERJASAMA asli dari file. */
  jenis: string;
  instansi: string;
  kategori: string;
  /** Narahubung instansi mitra. */
  narahubung: string;
  telepon: string;
  tematik: string;
  astaCita: string;
  judul: string;
  tanggalTandaTangan: string; // 'yyyy-mm-dd'
  tanggalMulai: string; // 'yyyy-mm-dd'
  tanggalSelesai: string; // 'yyyy-mm-dd'
  masaBerlaku: string;
  dokumen: string;
  pic: string;
  /**
   * Id klien pemilik MoU — ditautkan HANYA bila nama instansi MoU sama
   * PERSIS dengan nama record klien (dua peran 19/11/2026; pencocokan
   * nama persis, bukan kemiripan — lihat KLIEN_MOU di
   * scripts/impor-mou.py). Dipakai aturan Firestore baca-klien: klien
   * hanya membaca MoU yang klienId-nya sama dengan klienId di
   * profilnya. 3 dari 44 record seed punya klienId (035 → KLN-030,
   * 043 → KLN-014, 045 → KLN-009); 41 lainnya kosong — termasuk
   * near-miss 039 "…Ogan Komering Ulu" (tanpa "Selatan") yang SENGAJA
   * tidak ditautkan ke KLN-014. MoU tanpa klienId tidak tampil di
   * portal klien mana pun.
   */
  klienId?: string;
  satker: SatkerRef;
}

/**
 * Satu baris item dukungan (barang) dalam satu record Commitment.
 * `jumlah` = qty x hargaSatuan — dicek sama dengan kolom JUMLAH file.
 */
export interface DukunganItem {
  /** Jenis barang dukungan, apa adanya dari file. */
  jenis: string;
  qty: number;
  hargaSatuan: number;
  jumlah: number;
}

/**
 * Commitment — dokumen kerja sama dukungan layanan untuk support event
 * & program acara di RRI, dari file pengguna
 * "Dukungan_Layanan_2026.xlsx" (sheet 'Semarak Ramadhan', 13 baris item
 * jadi 4 record; impor 19/11/2026). Data TERPISAH dari kontrak PNBP —
 * bukan kontrak, TANPA nilai PNBP, dan TIDAK memengaruhi total
 * kontrak/PNBP. Keputusan pengguna 19/11/2026: data Commitment
 * tersendiri seperti MoU. Panel Commitment membaca koleksi
 * `commitment` (seed: src/lib/seedCommitment.ts, dibuat
 * scripts/impor-commitment.py).
 * - id = nomor dokumen PKS.DL (mis. '001/RRI.PLB/PKS.DL/03/2024');
 *   mengandung '/' seperti id kontrak dan id MoU, di-encode saat
 *   tulis Firestore.
 * - tanggalKegiatan = 'yyyy-mm-dd'. PERHATIAN: nama file menyebut
 *   2026, tapi data kegiatan adalah 13 Maret 2024 — disimpan
 *   2024-03-13 apa adanya dari file (lihat scripts/impor-commitment.py).
 * - mitra = nama mitra apa adanya dari file ('Bank Syariah Indonesian
 *   Kenten 2' — dengan "Indonesian", bukan "Indonesia").
 * - layanan / nilaiKonversi = '—' bila kosong di sumber (semua baris
 *   file: kolom LAYANAN/BENEFIT dan NILAI KONVERSI berisi '-'; tidak
 *   ada benefit/nilai konversi yang dikarang).
 * - totalDukungan = jumlah `dukungan[].jumlah` per mitra; total semua
 *   mitra Rp16.600.000 (cocok dengan REKAPITULASI file).
 */
export interface Commitment {
  /** Nomor dokumen PKS.DL — id record. */
  id: string;
  /** Nama kegiatan yang didukung. */
  kegiatan: string;
  /** Tanggal pelaksanaan kegiatan ('yyyy-mm-dd'). */
  tanggalKegiatan: string;
  /** Mitra/penyumbang dukungan. */
  mitra: string;
  /** Nama penandatangan dari pihak mitra. */
  penandatangan: string;
  jabatanPenandatangan: string;
  /** Baris-baris item dukungan (barang). */
  dukungan: DukunganItem[];
  /** Total nilai dukungan mitra ini (Rp). */
  totalDukungan: number;
  /** Layanan/benefit yang diterima mitra — '—' bila kosong di sumber. */
  layanan: string;
  /** Nilai konversi dukungan — '—' bila kosong di sumber. */
  nilaiKonversi: string;
  /** Dokumen sumber ('Surat Penawaran 00X ...'). */
  dokumen: string;
  /** Nomor dokumen pendek (kolom U file: '001'–'004'). */
  nomorDokumen: string;
  /**
   * Id klien pemilik Commitment — ditautkan HANYA bila nama mitra sama
   * PERSIS dengan nama record klien (dua peran 19/11/2026; pencocokan
   * nama persis, bukan kemiripan). NOL dari 4 record seed punya
   * klienId: tidak satu pun nama mitra cocok persis dengan record
   * klien ("Bank Sumsel Babel Syariah" vs klien "Bank Sumsel Babel"
   * SENGAJA tidak ditautkan). Commitment tanpa klienId tidak tampil di
   * portal klien mana pun sampai Operator menautkannya manual.
   */
  klienId?: string;
  satker: SatkerRef;
}

/**
 * Approvement — surat persetujuan Kepala RRI atas permintaan media
 * partner (definisi pengguna 24/11/2026). Data TERPISAH dari kontrak
 * PNBP — bukan kontrak, dan TIDAK memengaruhi total kontrak/PNBP.
 * Panel Media Partner (Approvement) membaca koleksi `approvement`
 * (seed: src/lib/seedApprovement.ts — 4 record DUMMY: 2 organisasi
 * mahasiswa + 2 komunitas, berlabel "(Contoh)").
 * - id = nomor urut dummy ('APR-01' … 'APR-04').
 * - nomorSurat = nomor surat persetujuan Kepala RRI.
 * - jenisKlien = 'Mahasiswa' (organisasi mahasiswa) atau 'Komunitas'
 *   (teks bebas).
 * - tanggalPelaksanaan = 'yyyy-mm-dd'.
 * - jenisKompensasi = teks bebas (mis. barter publikasi / liputan).
 * - nilaiKompensasi = nilai kompensasi (Rp); Rp0 untuk kompensasi
 *   non-uang (barter).
 * - dokumen = label dokumen; '—' bila kosong (tahap upload dokumen
 *   masih ditunda per keputusan pengguna 17/11/2026 — JANGAN dikarang
 *   menjadi tautan).
 * - Migrasi ke Firestore adalah langkah terpisah setelah PR ini merge
 *   (belum ada migrasiApprovement / penanda meta).
 */
export interface Approvement {
  /** Id record dummy ('APR-01' …). */
  id: string;
  /** Nomor surat persetujuan Kepala RRI. */
  nomorSurat: string;
  /** Nama klien (organisasi mahasiswa / komunitas). */
  namaKlien: string;
  /** Jenis klien: 'Mahasiswa' atau 'Komunitas'. */
  jenisKlien: string;
  /** Nama narahubung klien. */
  namaNarahubung: string;
  /** Tanggal pelaksanaan kerja sama ('yyyy-mm-dd'). */
  tanggalPelaksanaan: string;
  /** Jenis kompensasi (teks bebas). */
  jenisKompensasi: string;
  /** Nilai kompensasi (Rp); 0 bila non-uang (barter). */
  nilaiKompensasi: number;
  /** Dokumen sumber — '—' bila kosong (upload ditunda). */
  dokumen: string;
  satker: SatkerRef;
}

export interface Meeting {
  id: string;
  tanggal: string; // 'yyyy-mm-dd'
  jam: string; // 'hh:mm'
  prospectId?: string;
  klienId?: string;
  /** Field lama — TETAP DISIMPAN (kompatibilitas), tidak lagi ditampilkan (PR #73). */
  peserta: string;
  agenda: string;
  hasil?: string;
  /** Nama-nama klien yang ditemui (kolom Client Representative, PR #73). */
  clientRepresentatives?: string[];
  contactPersonNama?: string;
  contactPersonTelepon?: string;
  /** Email Contact Person — kanal kirim link Google Meet (PR landing-booking-email, 2026-11-17): dikumpulkan form booking publik (wajib); operator mengirim link Meet manual ke alamat ini setelah sync ke Google Calendar. */
  contactPersonEmail?: string;
  /** Petugas Layanan & Pengembangan Usaha yang hadir (atribusi performa). */
  rriRepresentatives?: string[];
  /** Alamat klien (kolom Client Address). */
  alamatKlien?: string;
  /** Id event Google Calendar hasil sinkronisasi (PR #73). */
  googleEventId?: string;
  /** Waktu sinkronisasi terakhir (ISO) — kapan googleEventId ditulis. */
  googleSyncedAt?: string;
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
  // Panel Order — enam tabel (PR #115, 19/11/2026): `order` di atas adalah
  // "Manual Order"; lima tabel baru di bawah mulai kosong — Ads Quotation
  // Request diisi webhook Tally (PR terpisah, butuh Blaze), empat tabel
  // layanan diisi form publik (Book a Venue, Rent a Space, Get a
  // Journalism Training, Partner with RRI — tabel terakhir diganti nama
  // dari "Media Partner Order" 2026-11-21, koleksi diganti nama dari
  // mediaPartnerOrder ke partnershipRequest, tanpa data yang dipindah
  // karena seed-nya kosong). TIDAK ada tabel untuk
  // Support our Event / Collaborate with Us.
  adsQuotationRequest: AdsQuotationRequest[];
  venueBookOrder: PermintaanLayanan[];
  spaceRentOrder: PermintaanLayanan[];
  trainingOrder: PermintaanLayanan[];
  partnershipRequest: PermintaanLayanan[];
  // Memorandum of Understanding (impor MoU 19/11/2026): 44 record dari
  // file pengguna — data tersendiri, BUKAN kontrak (total PNBP tidak
  // berubah). Panel MoU membaca koleksi ini; sebelum migrasi MoU
  // dijalankan, Firestore mode menampilkan empty state jujur.
  mou: Mou[];
  // Commitment (impor Commitment 19/11/2026): 4 record dukungan
  // layanan dari file pengguna — data tersendiri seperti MoU, BUKAN
  // kontrak (total PNBP tidak berubah). Panel Commitment membaca
  // koleksi ini; sebelum migrasi Commitment dijalankan, Firestore
  // mode menampilkan empty state jujur.
  commitment: Commitment[];
  // Approvement (definisi pengguna 24/11/2026): surat persetujuan
  // Kepala RRI atas permintaan media partner — 4 record DUMMY (2
  // organisasi mahasiswa + 2 komunitas) dari seedApprovement.ts.
  // Data tersendiri seperti MoU/Commitment, BUKAN kontrak (total PNBP
  // tidak berubah). Panel Media Partner membaca koleksi ini; sebelum
  // migrasi Approvement dijalankan, Firestore mode menampilkan empty
  // state jujur.
  approvement: Approvement[];
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

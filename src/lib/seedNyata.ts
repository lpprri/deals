// Data NYATA Palembang — hasil impor spreadsheet (PRD v2.0 Final Bab 12.3).
// Dibuat OTOMATIS oleh scripts/impor-data-nyata/impor.mjs dari snapshot
// ./data/ — JANGAN diubah manual; ubah sumbernya lalu jalankan ulang skrip.
// Tanggal impor: 2026-11-14; penggantian data kontrak 2026-11-16.
// Satker: PALEMBANG (pilot).
//
// ISI:
// - Klien/kontrak/tagihan/pembayaran/denda/dokumen/pengajuan: NYATA, dari
//   spreadsheet "Kerja Sama PNBP 2026" (Sheet 1). TANPA label "(Contoh)".
// - Sewa: NYATA, dari "Daftar Sewa Lahan/BMN" (Sheet 2). 16 dari
//   41 sewa tertaut ke kontrak lewat nomor referensi lama;
//   sisanya tidak tertaut (perjanjian 2025 ke bawah, tidak ada di
//   kontrak 2026). 6 temuan lapangan dari tab Temuan (attempt kedua).
// - PenerimaanAcuan: NYATA, 62 baris dari Sheet 3
//   (DATA PNBP 2026, attempt kedua 14/11/2026), total Rp257.590.368.
//   Data acuan Keuangan — READ-ONLY. Rekonsiliasi terhadap acuan kini
//   dapat dilakukan; selisihnya dilaporkan di laporan-rekonsiliasi.json
//   butir (e) — bukan dihilangkan.
// - Entitas Fase B (prospect, quotation, order, meeting, event,
//   advertisement, task): DATA CONTOH dari DATA_CONTOH, tetap berlabel
//   "(Contoh)". Tautan mereka ke entitas contoh Fase A (KLN-01,
//   PKS-001/2026, PJ-001/002/003) sudah dihapus supaya tidak menggantung.
// - Pembayaran dengan NTB + NTPN ditandai 'Terverifikasi' (NTPN = bukti
//   penerimaan negara; lihat impor.mjs keputusan 1).
// - Pengajuan PGJ-01 & PGJ-02 memakai tanggal placeholder 2026-11-14
//   (tanggal masuk tidak tercatat di sumber) — WAJIB dikoreksi pengguna.
//   Tab Pengajuan Baru Sheet 2 (attempt kedua) ternyata bukan daftar
//   pengajuan (rencana penggunaan lahan tanpa nama/tanggal), jadi tidak
//   ada tanggal asli dari sana.
//
// ANGKA KUNCI (dihitung ulang dari data ini — lihat laporan-rekonsiliasi):
// - Nilai kontrak 2026: Rp356.685.875 (Jan–Sep Rp216.986.875 + Okt
//   Rp139.699.000) + sisa kontrak 2025 Rp85.177.500.
// - Total tagihan Rp376.414.124; total pembayaran Rp362.329.255;
//   sisa piutang Rp14.084.869; denda Rp6.219.250 (per 2026-11-16).
// - PENGGANTIAN DATA KONTRAK 2026-11-16 (PR #52): 40 kontrak 2026
//   diganti dgn file Kerja_Sama_PNBP_2026.xlsx (Summary); 2 kontrak
//   2025 (Darojad, PT VGreen) dipertahankan karena kerja sama masih
//   berjalan. Perubahan bersih: +3 pembayaran (Samdini Rp132.704.000,
//   1158 Rp180.000, denda 6593 Rp40.000); denda Samdini DND-013
//   Rp2.654.080 dihapus (file: denda 0, Lunas, bukti NTB/NTPN);
//   DND-009 (6593) lunas; jatuh tempo 10227/11290 ikut file.
//   File pengganti TIDAK membawa snapshot baru di ./data/ — sumber
//   pengganti adalah xlsx di atas; snapshot lama tetap arsip impor awal.

import type { AppData } from './types';
import { SATKER_PILOT } from './master';
import { ARTIKEL_REGULASI } from './artikelRegulasi';
import { FAQ_REGULASI } from './faqRegulasi';
import { MOU_NYATA } from './seedMou';
import { COMMITMENT_NYATA } from './seedCommitment';

const S = SATKER_PILOT;

export const TANGGAL_IMPOR = '2026-11-16';

export const DATA_NYATA: AppData = {
  klien: [
  {
    "id": "KLN-001",
    "nama": "PT PLN (Persero) UPT Palembang",
    "jenis": "BUMN/BUMD",
    "alamat": "Palembang",
    "kontakNama": "Ilham Juliando",
    "kontakJabatan": "K3 dan Keamanan PLN UPT Palembang",
    "telepon": "0896-8903-6481",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-01-19"
  },
  {
    "id": "KLN-002",
    "nama": "PT Taspen (Persero)",
    "jenis": "BUMN/BUMD",
    "alamat": "Palembang",
    "kontakNama": "",
    "kontakJabatan": "Corporate Secretary",
    "telepon": "",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-01-19"
  },
  {
    "id": "KLN-003",
    "nama": "Aminul Khair",
    "jenis": "Perorangan",
    "alamat": "Ogan Ilir",
    "kontakNama": "Aminul Khair",
    "kontakJabatan": "",
    "telepon": "0821-7800-4497",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-01-30"
  },
  {
    "id": "KLN-004",
    "nama": "Meily Oktarina",
    "jenis": "Perorangan",
    "alamat": "Palembang",
    "kontakNama": "Meily Oktarina",
    "kontakJabatan": "",
    "telepon": "0813-6761-5858",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-01-30"
  },
  {
    "id": "KLN-005",
    "nama": "Dierga Salomon Riezki, S.STP",
    "jenis": "Perorangan",
    "alamat": "Palembang",
    "kontakNama": "Dierga Salomon Riezki, S.STP",
    "kontakJabatan": "",
    "telepon": "0823-7525-9995",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-01-30"
  },
  {
    "id": "KLN-006",
    "nama": "Abdul Rozak Rusdy",
    "jenis": "Perorangan",
    "alamat": "Ogan Ilir",
    "kontakNama": "Abdul Rozak Rusdy",
    "kontakJabatan": "",
    "telepon": "0813 7777 7369",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-02-11"
  },
  {
    "id": "KLN-007",
    "nama": "Assef Hidayat",
    "jenis": "Perorangan",
    "alamat": "Ogan Ilir",
    "kontakNama": "Assef Hidayat",
    "kontakJabatan": "",
    "telepon": "0822-8286-6552",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-02-11"
  },
  {
    "id": "KLN-008",
    "nama": "Dinas Komunikasi dan Informatika Kota Palembang",
    "jenis": "Pemerintah",
    "alamat": "Palembang",
    "kontakNama": "Dody",
    "kontakJabatan": "Kepala Bidang Pengelola Komunikasi Publik",
    "telepon": "0812-7328-5000",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-02-18"
  },
  {
    "id": "KLN-009",
    "nama": "Dinas Komunikasi dan Informatika Kabupaten Banyuasin",
    "jenis": "Pemerintah",
    "alamat": "Banyuasin",
    "kontakNama": "Titin Yariyanti, S.Pd., M.Si",
    "kontakJabatan": "Kepala Bidang Informasi Komunikasi Publik",
    "telepon": "0813-6700-8599",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-02-18"
  },
  {
    "id": "KLN-010",
    "nama": "Dinas Komunikasi dan Informatika Kabupaten Musi Banyuasin",
    "jenis": "Pemerintah",
    "alamat": "Musi Banyuasin",
    "kontakNama": "Slamet Rianto",
    "kontakJabatan": "Kepala Bidang Komunikasi Publik",
    "telepon": "0821-6284-8445",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-02-18"
  },
  {
    "id": "KLN-011",
    "nama": "Bank Sumsel Babel",
    "jenis": "BUMN/BUMD",
    "alamat": "Palembang",
    "kontakNama": "Desy",
    "kontakJabatan": "Pengelola Bisnis Dana Jasa & Tresury Komersial & Institusi Syariah",
    "telepon": "0813-6607-6066",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-02-18"
  },
  {
    "id": "KLN-012",
    "nama": "Kantor Perwakilan Bank Indonesia Provinsi Sumatera Selatan",
    "jenis": "Lembaga/Organisasi",
    "alamat": "Palembang",
    "kontakNama": "Anggita",
    "kontakJabatan": "Kepala Unit Kehumasan",
    "telepon": "0852-1388-1024",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-02-24"
  },
  {
    "id": "KLN-013",
    "nama": "Kantor Pengawasan dan Pelayanan Bea dan Cukai TMP B Palembang",
    "jenis": "Pemerintah",
    "alamat": "Palembang",
    "kontakNama": "Humas Bea Cukai Palembang",
    "kontakJabatan": "Pejabat Pembuat Komitmen",
    "telepon": "0851-6289-0528",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-03-10"
  },
  {
    "id": "KLN-014",
    "nama": "Dinas Komunikasi dan Informatika Kabupaten Ogan Komering Ulu Selatan",
    "jenis": "Pemerintah",
    "alamat": "Ogan Komering Ulu Selatan",
    "kontakNama": "Rio",
    "kontakJabatan": "Kepala Dinas",
    "telepon": "0812-6663-3232",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-03-19"
  },
  {
    "id": "KLN-015",
    "nama": "Bank Syariah Indonesia KCP Kenten 2 Palembang",
    "jenis": "BUMN/BUMD",
    "alamat": "Palembang",
    "kontakNama": "Zalmon",
    "kontakJabatan": "Branch Manager",
    "telepon": "0821-8408-9414",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-03-19"
  },
  {
    "id": "KLN-016",
    "nama": "Kanwil DJP Sumatera Selatan dan Kepulauan Bangka Belitung",
    "jenis": "Pemerintah",
    "alamat": "Palembang",
    "kontakNama": "Fari Ardining",
    "kontakJabatan": "Kepala Seksi Bimbingan Penyuluhan dan Pengelolaan Dokumen",
    "telepon": "0857-8078-4191",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-04-17"
  },
  {
    "id": "KLN-017",
    "nama": "Arip",
    "jenis": "Perorangan",
    "alamat": "Palembang",
    "kontakNama": "Ahmad Sobirin",
    "kontakJabatan": "",
    "telepon": "0813-6775-2442",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-05-21"
  },
  {
    "id": "KLN-018",
    "nama": "Savano Entertainment",
    "jenis": "Swasta",
    "alamat": "Palembang",
    "kontakNama": "Yusheni",
    "kontakJabatan": "Account Executive",
    "telepon": "0819-685-810",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-05-22"
  },
  {
    "id": "KLN-019",
    "nama": "Yayasan Islam Al-Ittifaqiah",
    "jenis": "Lembaga/Organisasi",
    "alamat": "Ogan Ilir",
    "kontakNama": "M. Joni Rusli",
    "kontakJabatan": "Ketua",
    "telepon": "0811-7100-116",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-05-26"
  },
  {
    "id": "KLN-020",
    "nama": "PT Sumber Alfaria Trijaya Tbk. Branch Palembang",
    "jenis": "Swasta",
    "alamat": "Palembang",
    "kontakNama": "Medi",
    "kontakJabatan": "Marketing Manager",
    "telepon": "0812-9467-2900",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-05-29"
  },
  {
    "id": "KLN-021",
    "nama": "Dr. Jalaluddin, MPSA",
    "jenis": "Perorangan",
    "alamat": "Palembang",
    "kontakNama": "Dr. Jalaluddin, MPSA",
    "kontakJabatan": "Direktur ASMA",
    "telepon": "0823-7244-2843",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-06-12"
  },
  {
    "id": "KLN-022",
    "nama": "DPRD Kota Palembang",
    "jenis": "Pemerintah",
    "alamat": "Palembang",
    "kontakNama": "Lydia",
    "kontakJabatan": "Ketua Tim Humas Protokol dan Publikasi",
    "telepon": "0852-7336-0336",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-06-15"
  },
  {
    "id": "KLN-023",
    "nama": "PT Medco E&P Indonesia",
    "jenis": "Pemerintah",
    "alamat": "Palembang",
    "kontakNama": "Reni",
    "kontakJabatan": "Lead Field Relations Support Medco E&P Indonesia",
    "telepon": "0821-7900-7746",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-06-15"
  },
  {
    "id": "KLN-024",
    "nama": "Perempuan Indonesia Maju (PIM)",
    "jenis": "Lembaga/Organisasi",
    "alamat": "Jakarta Selatan",
    "kontakNama": "Andi Ina Sarinah",
    "kontakJabatan": "TA Kabid Kowani dan PIM",
    "telepon": "0811-8806-1040",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-07-17"
  },
  {
    "id": "KLN-025",
    "nama": "Faridah Hanum",
    "jenis": "Perorangan",
    "alamat": "Ogan Ilir",
    "kontakNama": "Faridah Hanum",
    "kontakJabatan": "",
    "telepon": "0895-2806-7380",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-07-31"
  },
  {
    "id": "KLN-026",
    "nama": "Fisol Jailani",
    "jenis": "Perorangan",
    "alamat": "Ogan Ilir",
    "kontakNama": "Fisol Jailani",
    "kontakJabatan": "",
    "telepon": "0821 7514 4455",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-07-31"
  },
  {
    "id": "KLN-027",
    "nama": "Mila Agustina",
    "jenis": "Perorangan",
    "alamat": "Ogan Ilir",
    "kontakNama": "Mila Agustina",
    "kontakJabatan": "",
    "telepon": "0823 7777 1974",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-07-31"
  },
  {
    "id": "KLN-028",
    "nama": "Herman Sawiran",
    "jenis": "Perorangan",
    "alamat": "Ogan Ilir",
    "kontakNama": "Herman Sawiran",
    "kontakJabatan": "",
    "telepon": "0821-7509-2939",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-07-31"
  },
  {
    "id": "KLN-029",
    "nama": "Kementerian Komunikasi dan Digital",
    "jenis": "Pemerintah",
    "alamat": "Jakarta",
    "kontakNama": "",
    "kontakJabatan": "",
    "telepon": "",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-08-13"
  },
  {
    "id": "KLN-030",
    "nama": "Badan Narkotika Nasional Provinsi Sumatera Selatan",
    "jenis": "Pemerintah",
    "alamat": "Palembang",
    "kontakNama": "Ratna",
    "kontakJabatan": "Penyuluh Narkoba Ahli Madya",
    "telepon": "0812-6929-2157",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-10-12"
  },
  {
    "id": "KLN-031",
    "nama": "Samdini",
    "jenis": "Perorangan",
    "alamat": "Ogan Ilir",
    "kontakNama": "Samdini",
    "kontakJabatan": "",
    "telepon": "0821-8484-5699",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2026-10-16"
  },
  {
    "id": "KLN-032",
    "nama": "Darojad",
    "jenis": "Perorangan",
    "alamat": "Ogan Ilir",
    "kontakNama": "Darojad",
    "kontakJabatan": "",
    "telepon": "0813-6812-4918",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2025-06-20"
  },
  {
    "id": "KLN-033",
    "nama": "PT VGreen Global Charging Station Investment Indonesia",
    "jenis": "Swasta",
    "alamat": "Jakarta",
    "kontakNama": "Selika",
    "kontakJabatan": "Loura Hardjaloka",
    "telepon": "0815-5039-358",
    "email": "",
    "status": "Aktif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "dibuatOleh": "Migrasi Spreadsheet 1",
    "dibuatPada": "2025-06-26"
  }
],
  kontrak: [
  {
    "id": "0603/PKS/RRI.PLB/01/2026",
    "nomorPks": "0603/PKS/RRI.PLB/01/2026",
    "klienId": "KLN-001",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 1",
    "tanggalMulai": "2026-01-19",
    "tanggalSelesai": "2026-01-24",
    "nilaiKontrak": 270000,
    "status": "Selesai",
    "penanggungJawab": "Ilham Juliando — K3 dan Keamanan PLN UPT Palembang",
    "penandatanganNama": "Ilham Juliando",
    "penandatanganJabatan": "K3 dan Keamanan PLN UPT Palembang",
    "operatorPenutup": "Dessi Maya Sari",
    "tanggalTandaTangan": "2026-01-19",
    "catatan": "Judul: Spot Iklan Edukasi Bahaya & Manfaat Listrik | No. Referensi: 001/RRI.PLB/PKS.F/01/2026 | Keterangan sumber: Pembayaran Tepat Waktu",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-1-1",
        "namaLayanan": "Siaran Iklan (Spot)",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Menit",
        "tarif": 45000,
        "jumlah": 6,
        "subtotal": 270000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      }
    ]
  },
  {
    "id": "001/PKS/DIR.LPU/01/2026",
    "nomorPks": "001/PKS/DIR.LPU/01/2026",
    "klienId": "KLN-002",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 1",
    "tanggalMulai": "2026-01-20",
    "tanggalSelesai": "2026-02-19",
    "nilaiKontrak": 1550000,
    "status": "Selesai",
    "penanggungJawab": "Henra — Corporate Secretary",
    "penandatanganNama": "Henra",
    "penandatanganJabatan": "Corporate Secretary",
    "operatorPenutup": "Nadya Pratita",
    "tanggalTandaTangan": "2026-01-20",
    "catatan": "Judul: Adlibs Waspada Penipuan Mengatasnamakan PT Taspen | Keterangan sumber: Terlambang Melakukan Pembayaran | Tidak Dikenakan Denda",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-2-1",
        "namaLayanan": "Ad-Lib / Jingle",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Menit",
        "tarif": 50000,
        "jumlah": 31,
        "subtotal": 1550000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      }
    ]
  },
  {
    "id": "1051/PKS/RRI.PLB/02/2026",
    "nomorPks": "1051/PKS/RRI.PLB/02/2026",
    "klienId": "KLN-003",
    "jenisPnBP": "Umum",
    "kategoriLayanan": "Jasa Penggunaan Sarana dan Prasarana Siaran",
    "tanggalMulai": "2026-02-01",
    "tanggalSelesai": "2029-01-31",
    "nilaiKontrak": 19365000,
    "status": "Aktif",
    "penanggungJawab": "Aminul Khair",
    "penandatanganNama": "Aminul Khair",
    "jenisBmn": "Lahan",
    "lokasiBmn": "Pemancar RRI Palembang di Indralaya",
    "ukuranBmn": "4 m x 20 m",
    "luasBmn": "80m2",
    "dasarNilai": "S-476/MK/KNL.0402/2025",
    "operatorPenutup": "Nadya Pratita",
    "tanggalTandaTangan": "2026-02-01",
    "catatan": "Judul: Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang | No. Referensi: 002/RRI.PLB/PKS.U/01/2026 | BMN: Lahan | Lokasi: Pemancar RRI Palembang di Indralaya | Tujuan: Toko Listrik | Luas: 80m2 | Dasar Nilai: S-476/MK/KNL.0402/2025 | Realisasi kerja sama: 33% (per sumber) | Keterangan sumber: Pembayaran Tepat Waktu | Catatan sewa sumber: Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang Nama Klien: Aminul Khair Tujuan Penggunaan BMN: Toko Listrik Ukuran BMN: 4m x 20m = 80m2 Periode Kerja Sama: 1 Februari 2026 s.d. 31 Januari 2029 Nilai Kerja Sama: 3 Tahun x 6455000",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-3-1",
        "namaLayanan": "Sewa Lahan / BMN",
        "kategori": "Jasa Penggunaan Sarana dan Prasarana Siaran",
        "kodeAkun": "425131",
        "jenisPnBP": "Umum",
        "satuan": "Tahun",
        "tarif": 6455000,
        "jumlah": 3,
        "subtotal": 19365000,
        "realisasi": 0.333333333333333,
      }
    ]
  },
  {
    "id": "1052/PKS/RRI.PLB/02/2026",
    "nomorPks": "1052/PKS/RRI.PLB/02/2026",
    "klienId": "KLN-004",
    "jenisPnBP": "Umum",
    "kategoriLayanan": "Jasa Penggunaan Sarana dan Prasarana Siaran",
    "tanggalMulai": "2026-02-01",
    "tanggalSelesai": "2029-01-31",
    "nilaiKontrak": 19365000,
    "status": "Aktif",
    "penanggungJawab": "Meily Oktarina",
    "penandatanganNama": "Meily Oktarina",
    "jenisBmn": "Lahan",
    "lokasiBmn": "Pemancar RRI Palembang di Indralaya",
    "ukuranBmn": "4 m x 20 m",
    "luasBmn": "80m2",
    "dasarNilai": "S-476/MK/KNL.0402/2025",
    "operatorPenutup": "Ja\'far",
    "tanggalTandaTangan": "2026-02-01",
    "catatan": "Judul: Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang | No. Referensi: 003/RRI.PLB/PKS.U/01/2026 | BMN: Lahan | Lokasi: Pemancar RRI Palembang di Indralaya | Tujuan: Toko Perlengkapan Bayi | Luas: 80m2 | Dasar Nilai: S-476/MK/KNL.0402/2025 | Realisasi kerja sama: 33% (per sumber) | Keterangan sumber: Pembayaran Tepat Waktu | Catatan sewa sumber: Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang Nama Klien: Meily Oktarina Tujuan Penggunaan BMN: Toko Perlengkapan Bayi Ukuran BMN: 4m x 20m = 80m2 Periode Kerja Sama: 1 Februari 2026 s.d. 31 Januari 2029 Nilai Kerja Sama: 3 Tahun x 6455000",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-4-1",
        "namaLayanan": "Sewa Lahan / BMN",
        "kategori": "Jasa Penggunaan Sarana dan Prasarana Siaran",
        "kodeAkun": "425131",
        "jenisPnBP": "Umum",
        "satuan": "Tahun",
        "tarif": 6455000,
        "jumlah": 3,
        "subtotal": 19365000,
        "realisasi": 0.333333333333333,
      }
    ]
  },
  {
    "id": "1053/PKS/RRI.PLB/02/2026",
    "nomorPks": "1053/PKS/RRI.PLB/02/2026",
    "klienId": "KLN-005",
    "jenisPnBP": "Umum",
    "kategoriLayanan": "Jasa Penggunaan Sarana dan Prasarana Siaran",
    "tanggalMulai": "2026-02-01",
    "tanggalSelesai": "2029-01-31",
    "nilaiKontrak": 16944000,
    "status": "Aktif",
    "penanggungJawab": "Dierga Salomon Riezki, S.STP",
    "penandatanganNama": "Dierga Salomon Riezki, S.STP",
    "jenisBmn": "Lahan",
    "lokasiBmn": "Pemancar RRI Palembang di Indralaya",
    "ukuranBmn": "3.5 m x 20 m",
    "luasBmn": "70m2",
    "dasarNilai": "S-476/MK/KNL.0402/2025",
    "operatorPenutup": "Nadya Pratita",
    "tanggalTandaTangan": "2026-02-01",
    "catatan": "Judul: Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang | No. Referensi: 004/RRI.PLB/PKS.U/01/2026 | BMN: Lahan | Lokasi: Pemancar RRI Palembang di Indralaya | Tujuan: Rental Play Station | Luas: 70m2 | Dasar Nilai: S-476/MK/KNL.0402/2025 | Realisasi kerja sama: 33% (per sumber) | Keterangan sumber: Pembayaran Tepat Waktu | Catatan sewa sumber: Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang Nama Klien: Dierga Salomon Riezki, S.STP Tujuan Penggunaan BMN: Rental Play Station Ukuran BMN: 3,5m x 20m = 70m2 Periode Kerja Sama: 1 Februari 2026 s.d. 31 Januari 2029 Nilai Kerja Sama: 3 Tahun x 5648000",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-5-1",
        "namaLayanan": "Sewa Lahan / BMN",
        "kategori": "Jasa Penggunaan Sarana dan Prasarana Siaran",
        "kodeAkun": "425131",
        "jenisPnBP": "Umum",
        "satuan": "Tahun",
        "tarif": 5648000,
        "jumlah": 3,
        "subtotal": 16944000,
        "realisasi": 0.333333333333333,
      }
    ]
  },
  {
    "id": "1494/PKS/RRI.PLB/02/2026",
    "nomorPks": "1494/PKS/RRI.PLB/02/2026",
    "klienId": "KLN-006",
    "jenisPnBP": "Umum",
    "kategoriLayanan": "Jasa Penggunaan Sarana dan Prasarana Siaran",
    "tanggalMulai": "2026-02-01",
    "tanggalSelesai": "2027-01-31",
    "nilaiKontrak": 9019000,
    "status": "Aktif",
    "penanggungJawab": "Abdul Rozak Rusdy",
    "penandatanganNama": "Abdul Rozak Rusdy",
    "jenisBmn": "Lahan",
    "lokasiBmn": "Pemancar RRI Palembang di Indralaya",
    "ukuranBmn": "100 m x 173 m",
    "luasBmn": "17300m2",
    "dasarNilai": "S-477/MK/KNL.0402/2025",
    "operatorPenutup": "Nadya Pratita",
    "tanggalTandaTangan": "2026-02-01",
    "catatan": "Judul: Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang | No. Referensi: 005/RRI.PLB/PKS.U/02/2026 | BMN: Lahan | Lokasi: Pemancar RRI Palembang di Indralaya | Tujuan: Berkebun, Beternak Kambing & Ayam dan Kolam Pancing | Luas: 17300m2 | Dasar Nilai: S-477/MK/KNL.0402/2025 | Keterangan sumber: Terlambang Melakukan Pembayaran | SPn-1 | Catatan sewa sumber: Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang Nama Klien: Abdul Rozak Rusdy Tujuan Penggunaan BMN: Berkebun, Beternak Kambing & Ayam dan Kolam Pancing Ukuran BMN: 100m x 173m = 17300m2 Periode Kerja Sama: 1 Februari 2026 s.d. 31 Januari 2027 Nilai Kerja Sama: 1 Tahun x 9019000",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-6-1",
        "namaLayanan": "Sewa Lahan / BMN",
        "kategori": "Jasa Penggunaan Sarana dan Prasarana Siaran",
        "kodeAkun": "425131",
        "jenisPnBP": "Umum",
        "satuan": "Tahun",
        "tarif": 9019000,
        "jumlah": 1,
        "subtotal": 9019000,
        "realisasi": 1.0,
      }
    ]
  },
  {
    "id": "1497/PKS/RRI.PLB/02/2026",
    "nomorPks": "1497/PKS/RRI.PLB/02/2026",
    "klienId": "KLN-007",
    "jenisPnBP": "Umum",
    "kategoriLayanan": "Jasa Penggunaan Sarana dan Prasarana Siaran",
    "tanggalMulai": "2026-02-11",
    "tanggalSelesai": "2027-02-10",
    "nilaiKontrak": 6536000,
    "status": "Aktif",
    "penanggungJawab": "Assef Hidayat",
    "penandatanganNama": "Assef Hidayat",
    "jenisBmn": "Lahan",
    "lokasiBmn": "Pemancar RRI Palembang di Indralaya",
    "ukuranBmn": "5 m x 20 m",
    "luasBmn": "100m2",
    "dasarNilai": "S-477/MK/KNL.0402/2025",
    "operatorPenutup": "A. Kadir Kurniawan",
    "tanggalTandaTangan": "2026-02-11",
    "catatan": "Judul: Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang | No. Referensi: 006/RRI.PLB/PKS.U/02/2026 | BMN: Lahan | Lokasi: Pemancar RRI Palembang di Indralaya | Tujuan: Warung  Sarapan Pagi & Es Teh | Luas: 100m2 | Dasar Nilai: S-477/MK/KNL.0402/2025 | Keterangan sumber: Pembayaran Tepat Waktu | Catatan sewa sumber: Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang Nama Klien: Assef Hidayat Tujuan Penggunaan BMN: Warung  Sarapan Pagi & Es Teh Ukuran BMN: 5m x 20m = 100m2 Periode Kerja Sama: 11 Februari 2026 s.d. 10 Februari 2027 Nilai Kerja Sama: 1 Tahun x 6536000",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-7-1",
        "namaLayanan": "Sewa Lahan / BMN",
        "kategori": "Jasa Penggunaan Sarana dan Prasarana Siaran",
        "kodeAkun": "425131",
        "jenisPnBP": "Umum",
        "satuan": "Tahun",
        "tarif": 6536000,
        "jumlah": 1,
        "subtotal": 6536000,
        "realisasi": 1.0,
      }
    ]
  },
  {
    "id": "1744/PKS/RRI.PLB/03/2026",
    "nomorPks": "1744/PKS/RRI.PLB/03/2026",
    "klienId": "KLN-008",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 1",
    "tanggalMulai": "2026-02-19",
    "tanggalSelesai": "2026-03-23",
    "nilaiKontrak": 15000000,
    "status": "Selesai",
    "penanggungJawab": "Haryati Alfat — Kepala Bidang Pengelola Komunikasi Publik",
    "penandatanganNama": "Haryati Alfat",
    "penandatanganJabatan": "Kepala Bidang Pengelola Komunikasi Publik",
    "operatorPenutup": "A. Kadir Kurniawan",
    "tanggalTandaTangan": "2026-02-19",
    "catatan": "Judul: Greeting Ramadan & Idul Fitri 1447 H Wali Kota & Wakil Wali Kota Palembang | No. Referensi: 007/RRI.PLB/PKS.F/02/2026 | Keterangan sumber: Terlambang Melakukan Pembayaran | SPn-3",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-8-1",
        "namaLayanan": "Greeting / Tanda Waktu (Time Signal)",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Menit",
        "tarif": 100000,
        "jumlah": 150,
        "subtotal": 15000000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      }
    ]
  },
  {
    "id": "1745/PKS/RRI.PLB/03/2026",
    "nomorPks": "1745/PKS/RRI.PLB/03/2026",
    "klienId": "KLN-009",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 1",
    "tanggalMulai": "2026-02-19",
    "tanggalSelesai": "2026-03-23",
    "nilaiKontrak": 5000000,
    "status": "Selesai",
    "penanggungJawab": "Titin Yariyanti, S.Pd., M.Si — Kepala Bidang Informasi Komunikasi Publik",
    "penandatanganNama": "Titin Yariyanti, S.Pd., M.Si",
    "penandatanganJabatan": "Kepala Bidang Informasi Komunikasi Publik",
    "operatorPenutup": "Ja\'far",
    "tanggalTandaTangan": "2026-02-19",
    "catatan": "Judul: Greeting Ramadan & Idul Fitri 1447 H Bupati Banyuasin | No. Referensi: 008/RRI.PLB/PKS.F/02/2026 | Keterangan sumber: Terlambang Melakukan Pembayaran | SPn-3",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-9-1",
        "namaLayanan": "Greeting / Tanda Waktu (Time Signal)",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Menit",
        "tarif": 100000,
        "jumlah": 50,
        "subtotal": 5000000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      }
    ]
  },
  {
    "id": "1746/PKS/RRI.PLB/03/2026",
    "nomorPks": "1746/PKS/RRI.PLB/03/2026",
    "klienId": "KLN-010",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 1",
    "tanggalMulai": "2026-02-19",
    "tanggalSelesai": "2026-03-20",
    "nilaiKontrak": 3000000,
    "status": "Selesai",
    "penanggungJawab": "Jerry Rinoldy, S.T., M.T — Kepala Bidang Komunikasi Publik",
    "penandatanganNama": "Jerry Rinoldy, S.T., M.T",
    "penandatanganJabatan": "Kepala Bidang Komunikasi Publik",
    "operatorPenutup": "Dessi Maya Sari",
    "tanggalTandaTangan": "2026-02-19",
    "catatan": "Judul: Greeting Ramadan & Idul Fitri 1447 H Bupati Musi Banyuasin | No. Referensi: 009/RRI.PLB/PKS.F/02/2026 | Keterangan sumber: Pembayaran Tepat Waktu",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-10-1",
        "namaLayanan": "Greeting / Tanda Waktu (Time Signal)",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Menit",
        "tarif": 100000,
        "jumlah": 30,
        "subtotal": 3000000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      }
    ]
  },
  {
    "id": "2036/PKS/RRI.PLB/03/2026#010",
    "nomorPks": "2036/PKS/RRI.PLB/03/2026",
    "klienId": "KLN-011",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 1",
    "tanggalMulai": "2026-02-19",
    "tanggalSelesai": "2026-03-23",
    "nilaiKontrak": 7500000,
    "status": "Selesai",
    "penanggungJawab": "Tommy Andika — Pengelola Bisnis Dana Jasa & Tresury Komersial & Institusi Syariah",
    "penandatanganNama": "Tommy Andika",
    "penandatanganJabatan": "Pengelola Bisnis Dana Jasa & Tresury Komersial & Institusi Syariah",
    "operatorPenutup": "Meliyana",
    "tanggalTandaTangan": "2026-02-19",
    "catatan": "Judul: Greeting Ramadan & Idul Fitri 1447 H Direktur Utama Bank Sumsel Babel | No. Referensi: 010/RRI.PLB/PKS.F/02/2026 | Keterangan sumber: Terlambang Melakukan Pembayaran | SPn-2",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-11-1",
        "namaLayanan": "Greeting / Tanda Waktu (Time Signal)",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Menit",
        "tarif": 100000,
        "jumlah": 75,
        "subtotal": 7500000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      }
    ]
  },
  {
    "id": "2036/PKS/RRI.PLB/03/2026#011",
    "nomorPks": "2036/PKS/RRI.PLB/03/2026",
    "klienId": "KLN-012",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 1",
    "tanggalMulai": "2026-02-25",
    "tanggalSelesai": "2026-03-23",
    "nilaiKontrak": 6200000,
    "status": "Selesai",
    "penanggungJawab": "Yossie N. — Kepala Unit Kehumasan",
    "penandatanganNama": "Yossie N.",
    "penandatanganJabatan": "Kepala Unit Kehumasan",
    "operatorPenutup": "A. Kadir Kurniawan",
    "tanggalTandaTangan": "2026-02-25",
    "catatan": "Judul: Greeting Ramadan & Idul Fitri 1447 H Kepala Kantor Perwakilan Bank Indonesia Provinsi Sumatera Selatan | No. Referensi: 011/RRI.PLB/PKS.F/02/2026 | Keterangan sumber: Terlambang Melakukan Pembayaran | SPn-1",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-12-1",
        "namaLayanan": "Greeting / Tanda Waktu (Time Signal)",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Menit",
        "tarif": 100000,
        "jumlah": 62,
        "subtotal": 6200000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      }
    ]
  },
  {
    "id": "2605/PKS/RRI.PLB/04/2026",
    "nomorPks": "2605/PKS/RRI.PLB/04/2026",
    "klienId": "KLN-013",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 1",
    "tanggalMulai": "2026-03-11",
    "tanggalSelesai": "2026-04-09",
    "nilaiKontrak": 4050000,
    "status": "Selesai",
    "penanggungJawab": "Sahbani — Pejabat Pembuat Komitmen",
    "penandatanganNama": "Sahbani",
    "penandatanganJabatan": "Pejabat Pembuat Komitmen",
    "operatorPenutup": "Meliyana",
    "tanggalTandaTangan": "2026-03-11",
    "catatan": "Judul: Spot Iklan Layanan Masyarakat Edukasi Larangan Penggunaan Produk Ilegal | No. Referensi: 012/RRI.PLB/PKS.F/03/2026 | Keterangan sumber: Pembayaran Tepat Waktu",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-13-1",
        "namaLayanan": "Siaran Iklan (Spot)",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Menit",
        "tarif": 45000,
        "jumlah": 90,
        "subtotal": 4050000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      }
    ]
  },
  {
    "id": "2919/PKS/RRI.PLB/04/2026",
    "nomorPks": "2919/PKS/RRI.PLB/04/2026",
    "klienId": "KLN-014",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 1",
    "tanggalMulai": "2026-03-20",
    "tanggalSelesai": "2026-03-23",
    "nilaiKontrak": 1500000,
    "status": "Selesai",
    "penanggungJawab": "Zakiah, S.E, M.M — Kepala Dinas",
    "penandatanganNama": "Zakiah, S.E, M.M",
    "penandatanganJabatan": "Kepala Dinas",
    "operatorPenutup": "A. Kadir Kurniawan",
    "tanggalTandaTangan": "2026-03-20",
    "catatan": "Judul: Greeting Idul Fitri 1447 H Bupati Ogan Komering Ulu Selatan | No. Referensi: 013/RRI.PLB/PKS.F/03/2026 | Keterangan sumber: Terlambang Melakukan Pembayaran | SPn-1",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-14-1",
        "namaLayanan": "Greeting / Tanda Waktu (Time Signal)",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Menit",
        "tarif": 100000,
        "jumlah": 15,
        "subtotal": 1500000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      }
    ]
  },
  {
    "id": "2920/PKS/RRI.PLB/04/2026",
    "nomorPks": "2920/PKS/RRI.PLB/04/2026",
    "klienId": "KLN-015",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 1",
    "tanggalMulai": "2026-03-20",
    "tanggalSelesai": "2026-03-22",
    "nilaiKontrak": 1000000,
    "status": "Selesai",
    "penanggungJawab": "Andi Amijaya — Branch Manager",
    "penandatanganNama": "Andi Amijaya",
    "penandatanganJabatan": "Branch Manager",
    "operatorPenutup": "Dessi Maya Sari",
    "tanggalTandaTangan": "2026-03-20",
    "catatan": "Judul: Greeting Idul Fitri 1447 H Kepala Cabang Bank Syariah Indonesia KCP Kenten 2 Palembang | No. Referensi: 014/RRI.PLB/PKS.F/03/2026 | Keterangan sumber: Terlambang Melakukan Pembayaran | SPn-1",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-15-1",
        "namaLayanan": "Greeting / Tanda Waktu (Time Signal)",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Menit",
        "tarif": 100000,
        "jumlah": 10,
        "subtotal": 1000000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      }
    ]
  },
  {
    "id": "3669/PKS/RRI.PLB/04/2026",
    "nomorPks": "3669/PKS/RRI.PLB/04/2026",
    "klienId": "KLN-016",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 1",
    "tanggalMulai": "2026-04-20",
    "tanggalSelesai": "2026-04-20",
    "nilaiKontrak": 2000000,
    "status": "Selesai",
    "penanggungJawab": "Amalia Fatmasari — Kepala Seksi Bimbingan Penyuluhan dan Pengelolaan Dokumen",
    "penandatanganNama": "Amalia Fatmasari",
    "penandatanganJabatan": "Kepala Seksi Bimbingan Penyuluhan dan Pengelolaan Dokumen",
    "operatorPenutup": "Ja\'far",
    "tanggalTandaTangan": "2026-04-20",
    "catatan": "Judul: Dialog Interaktif \"SPT Tahunan PPh: Relaksasi, Perpanjangan Jangka Waktu Pelaporan dan NPPN\" | No. Referensi: 015/RRI.PLB/PKS.F/04/2026 | Keterangan sumber: Pembayaran Tepat Waktu",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-16-1",
        "namaLayanan": "Dialog Interaktif Dalam Studio",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Jam",
        "tarif": 2000000,
        "jumlah": 1,
        "subtotal": 2000000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      }
    ]
  },
  {
    "id": "3981/PKS/RRI.PLB/05/2026",
    "nomorPks": "3981/PKS/RRI.PLB/05/2026",
    "klienId": "KLN-001",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 1",
    "tanggalMulai": "2026-04-27",
    "tanggalSelesai": "2026-05-02",
    "nilaiKontrak": 270000,
    "status": "Selesai",
    "penanggungJawab": "Ilham Juliando — K3 dan Keamanan",
    "penandatanganNama": "Ilham Juliando",
    "penandatanganJabatan": "K3 dan Keamanan",
    "operatorPenutup": "A. Kadir Kurniawan",
    "tanggalTandaTangan": "2026-04-27",
    "catatan": "Judul: Spot Iklan Edukasi Bahaya & Manfaat Listrik | No. Referensi: 016/RRI.PLB/PKS.F/04/2026 | Keterangan sumber: Pembayaran Tepat Waktu",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-17-1",
        "namaLayanan": "Siaran Iklan (Spot)",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Menit",
        "tarif": 45000,
        "jumlah": 6,
        "subtotal": 270000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      }
    ]
  },
  {
    "id": "4720/PKS/RRI.PLB/06/2026",
    "nomorPks": "4720/PKS/RRI.PLB/06/2026",
    "klienId": "KLN-017",
    "jenisPnBP": "Umum",
    "kategoriLayanan": "Jasa Penggunaan Sarana dan Prasarana Siaran",
    "tanggalMulai": "2026-05-22",
    "tanggalSelesai": "2027-05-21",
    "nilaiKontrak": 5320000,
    "status": "Aktif",
    "penanggungJawab": "Arip",
    "penandatanganNama": "Arip",
    "jenisBmn": "Lahan",
    "lokasiBmn": "Pemancar RRI Palembang di Indralaya",
    "ukuranBmn": "4.5 m x 20 m",
    "luasBmn": "90m2",
    "dasarNilai": "S-66/MK/KNL.0402/2026",
    "operatorPenutup": "Ja\'far",
    "tanggalTandaTangan": "2026-05-22",
    "catatan": "Judul: Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang | No. Referensi: 017/RRI.PLB/PKS.F/05/2026 | BMN: Lahan | Lokasi: Pemancar RRI Palembang di Indralaya | Tujuan: Layanan Jasa Keuangan BRILink & Agen Mandiri | Luas: 90m2 | Dasar Nilai: S-66/MK/KNL.0402/2026 | Keterangan sumber: Pembayaran Tepat Waktu",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-18-1",
        "namaLayanan": "Sewa Lahan / BMN",
        "kategori": "Jasa Penggunaan Sarana dan Prasarana Siaran",
        "kodeAkun": "425131",
        "jenisPnBP": "Umum",
        "satuan": "Tahun",
        "tarif": 5320000,
        "jumlah": 1,
        "subtotal": 5320000,
        "realisasi": 1.0,
      }
    ]
  },
  {
    "id": "4747/PKS/RRI.PLB/06/2026",
    "nomorPks": "4747/PKS/RRI.PLB/06/2026",
    "klienId": "KLN-018",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Digitalisasi Penyiaran",
    "programa": "@rri.palembang",
    "tanggalMulai": "2026-05-23",
    "tanggalSelesai": "2026-05-23",
    "nilaiKontrak": 200000,
    "status": "Selesai",
    "penanggungJawab": "Yusheni — Account Executive",
    "penandatanganNama": "Yusheni",
    "penandatanganJabatan": "Account Executive",
    "operatorPenutup": "Ja\'far",
    "tanggalTandaTangan": "2026-05-23",
    "catatan": "Judul: Reels Instagram Promosi PT. Chery Sales Indonesia | No. Referensi: 018/RRI.PLB/PKS.F/05/2026 | Keterangan sumber: Pembayaran Tepat Waktu",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-19-1",
        "namaLayanan": "Instagram Reels",
        "kategori": "Jasa Digitalisasi Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Periode",
        "tarif": 200000,
        "jumlah": 1,
        "subtotal": 200000,
        "realisasi": 1.0,
        "programa": "@rri.palembang"
      }
    ]
  },
  {
    "id": "4842/PKS/RRI.PLB/06/2026",
    "nomorPks": "4842/PKS/RRI.PLB/06/2026",
    "klienId": "KLN-019",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 1",
    "tanggalMulai": "2026-05-26",
    "tanggalSelesai": "2026-06-24",
    "nilaiKontrak": 4050000,
    "status": "Selesai",
    "penanggungJawab": "M. Joni Rusli — Ketua",
    "penandatanganNama": "M. Joni Rusli",
    "penandatanganJabatan": "Ketua",
    "operatorPenutup": "Dessi Maya Sari",
    "tanggalTandaTangan": "2026-05-26",
    "catatan": "Judul: Spot Iklan Sosialisasi Penerimaan Santri & Mahasiswa Baru Ponpes Al-Ittifaqiah Indralaya | No. Referensi: 019/RRI.PLB/PKS.F/05/2026 | Keterangan sumber: Pembayaran Tepat Waktu",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-20-1",
        "namaLayanan": "Siaran Iklan (Spot)",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Menit",
        "tarif": 45000,
        "jumlah": 90,
        "subtotal": 4050000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      }
    ]
  },
  {
    "id": "4873/PKS/RRI.PLB/06/2026",
    "nomorPks": "4873/PKS/RRI.PLB/06/2026",
    "klienId": "KLN-020",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 1",
    "tanggalMulai": "2026-06-01",
    "tanggalSelesai": "2026-06-30",
    "nilaiKontrak": 990000,
    "status": "Selesai",
    "penanggungJawab": "Uus Firdaus — Marketing Manager",
    "penandatanganNama": "Uus Firdaus",
    "penandatanganJabatan": "Marketing Manager",
    "operatorPenutup": "Meliyana",
    "tanggalTandaTangan": "2026-06-01",
    "catatan": "Judul: Spot Iklan Promosi Alfamart | No. Referensi: 020/RRI.PLB/PKS.F/05/2026 | Keterangan sumber: Pembayaran Tepat Waktu",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-21-1",
        "namaLayanan": "Siaran Iklan (Spot)",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Menit",
        "tarif": 45000,
        "jumlah": 22,
        "subtotal": 990000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      }
    ]
  },
  {
    "id": "5350/PKS/RRI.PLB/06/2026",
    "nomorPks": "5350/PKS/RRI.PLB/06/2026",
    "klienId": "KLN-021",
    "jenisPnBP": "Umum",
    "kategoriLayanan": "Jasa Penggunaan Sarana dan Prasarana Siaran",
    "tanggalMulai": "2026-06-14",
    "tanggalSelesai": "2026-06-14",
    "nilaiKontrak": 3056000,
    "status": "Selesai",
    "penanggungJawab": "Dr. Jalaluddin, MPSA — Direktur ASMA",
    "penandatanganNama": "Dr. Jalaluddin, MPSA",
    "penandatanganJabatan": "Direktur ASMA",
    "jenisBmn": "Aula",
    "lokasiBmn": "Kantor RRI Palembang",
    "ukuranBmn": "10 m x 29.94 m",
    "luasBmn": "299,4m2",
    "dasarNilai": "S-81/MK.6/KNL.0402/2025",
    "operatorPenutup": "Ja\'far",
    "tanggalTandaTangan": "2026-06-14",
    "catatan": "Judul: Sewa Menyewa Fasilitas Aula LPP RRI Palembang | No. Referensi: 021/RRI.PLB/PKS.U/06/2026 | BMN: Aula | Lokasi: Kantor RRI Palembang | Tujuan: Penyelenggaraan Kegiatan Olimpiade Mental Aritmatika dan Wisuda ASMA | Luas: 299,4m2 | Dasar Nilai: S-81/MK.6/KNL.0402/2025 | Keterangan sumber: Pembayaran Tepat Waktu",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-22-1",
        "namaLayanan": "Sewa Aula",
        "kategori": "Jasa Penggunaan Sarana dan Prasarana Siaran",
        "kodeAkun": "425131",
        "jenisPnBP": "Umum",
        "satuan": "Hari",
        "tarif": 3056000,
        "jumlah": 1,
        "subtotal": 3056000,
        "realisasi": 1.0,
      }
    ]
  },
  {
    "id": "5390/PKS/RRI.PLB/06/2026",
    "nomorPks": "5390/PKS/RRI.PLB/06/2026",
    "klienId": "KLN-022",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 1",
    "tanggalMulai": "2026-06-16",
    "tanggalSelesai": "2026-06-17",
    "nilaiKontrak": 3500000,
    "status": "Selesai",
    "penanggungJawab": "Evin Melliniya Angel Putri, S.STP — Ketua Tim Humas Protokol dan Publikasi",
    "penandatanganNama": "Evin Melliniya Angel Putri, S.STP",
    "penandatanganJabatan": "Ketua Tim Humas Protokol dan Publikasi",
    "operatorPenutup": "Ja\'far",
    "tanggalTandaTangan": "2026-06-16",
    "catatan": "Judul: Greeting & Siaran Langsung HUT Kota Palembang | No. Referensi: 022/RRI.PLB/PKS.F/06/2026 | Keterangan sumber: Pembayaran Tepat Waktu",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-23-1",
        "namaLayanan": "Greeting / Tanda Waktu (Time Signal)",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Menit",
        "tarif": 100000,
        "jumlah": 5,
        "subtotal": 500000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      },
      {
        "id": "LYN-23-2",
        "namaLayanan": "Siaran Langsung",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Jam",
        "tarif": 2000000,
        "jumlah": 1,
        "subtotal": 2000000,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      },
      {
        "id": "LYN-23-3",
        "namaLayanan": "Siaran Langsung YouTube",
        "kategori": "Jasa Digitalisasi Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Jam",
        "tarif": 1000000,
        "jumlah": 1,
        "subtotal": 1000000,
        "programa": "RRI Palembang"
      }
    ]
  },
  {
    "id": "5391/PKS/RRI.PLB/06/2026",
    "nomorPks": "5391/PKS/RRI.PLB/06/2026",
    "klienId": "KLN-023",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 2",
    "tanggalMulai": "2026-06-16",
    "tanggalSelesai": "2026-06-18",
    "nilaiKontrak": 3500000,
    "status": "Selesai",
    "penanggungJawab": "Ericka Lestari Dewi A. — Lead Field Relations Support Medco E&P Indonesia",
    "penandatanganNama": "Ericka Lestari Dewi A.",
    "penandatanganJabatan": "Lead Field Relations Support Medco E&P Indonesia",
    "operatorPenutup": "A. Kadir Kurniawan",
    "tanggalTandaTangan": "2026-06-16",
    "catatan": "Judul: Adlibs & Dialog Interaktif Goes to Campus Ngobrol Seputar Gas: Integritas dalam Industri Hulu Migas | No. Referensi: 023/RRI.PLB/PKS.F/06/2026 | Keterangan sumber: Pembayaran Tepat Waktu",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-24-1",
        "namaLayanan": "Ad-Lib / Jingle",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425131",
        "jenisPnBP": "Umum",
        "satuan": "Menit",
        "tarif": 50000,
        "jumlah": 10,
        "subtotal": 500000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 2"
      },
      {
        "id": "LYN-24-2",
        "namaLayanan": "Dialog Interaktif Luar Studio",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Jam",
        "tarif": 2000000,
        "jumlah": 1,
        "subtotal": 2000000,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 2"
      },
      {
        "id": "LYN-24-3",
        "namaLayanan": "Siaran Langsung YouTube",
        "kategori": "Jasa Digitalisasi Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Jam",
        "tarif": 1000000,
        "jumlah": 1,
        "subtotal": 1000000,
        "programa": "RRI Palembang"
      }
    ]
  },
  {
    "id": "5483/PKS/RRI.PLB/06/2026",
    "nomorPks": "5483/PKS/RRI.PLB/06/2026",
    "klienId": "KLN-013",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 1",
    "tanggalMulai": "2026-06-18",
    "tanggalSelesai": "2026-07-17",
    "nilaiKontrak": 4050000,
    "status": "Selesai",
    "penanggungJawab": "Sahbani — Pejabat Pembuat Komitmen",
    "penandatanganNama": "Sahbani",
    "penandatanganJabatan": "Pejabat Pembuat Komitmen",
    "operatorPenutup": "Meliyana",
    "tanggalTandaTangan": "2026-06-18",
    "catatan": "Judul: Spot Iklan Layanan Masyarakat Himbauan Waspada Penipuan Mengatasnamakan Bea Cukai | No. Referensi: 024/RRI.PLB/PKS.F/06/2026 | Keterangan sumber: Pembayaran Tepat Waktu",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-25-1",
        "namaLayanan": "Siaran Iklan (Spot)",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Menit",
        "tarif": 45000,
        "jumlah": 90,
        "subtotal": 4050000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      }
    ]
  },
  {
    "id": "5484/PKS/RRI.PLB/06/2026",
    "nomorPks": "5484/PKS/RRI.PLB/06/2026",
    "klienId": "KLN-012",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 2",
    "tanggalMulai": "2026-06-19",
    "tanggalSelesai": "2026-06-19",
    "nilaiKontrak": 2000000,
    "status": "Selesai",
    "penanggungJawab": "Yossie N. — Kepala Unit Kehumasan",
    "penandatanganNama": "Yossie N.",
    "penandatanganJabatan": "Kepala Unit Kehumasan",
    "operatorPenutup": "A. Kadir Kurniawan",
    "tanggalTandaTangan": "2026-06-19",
    "catatan": "Judul: Dialog Interaktif GEMILANG PALEMBANG RAYA X DIGITAL KITO GALO 7th TAHUN 2026: “Transaksi Digital Inklusif, Wujudkan Ekonomi Sumsel yang Produktif” | No. Referensi: 025/RRI.PLB/PKS.F/06/2026 | Keterangan sumber: Pembayaran Tepat Waktu",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-26-1",
        "namaLayanan": "Dialog Interaktif Dalam Studio",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Jam",
        "tarif": 2000000,
        "jumlah": 1,
        "subtotal": 2000000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 2"
      }
    ]
  },
  {
    "id": "5592/PKS/RRI.PLB/06/2026",
    "nomorPks": "5592/PKS/RRI.PLB/06/2026",
    "klienId": "KLN-012",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 2",
    "tanggalMulai": "2026-06-19",
    "tanggalSelesai": "2026-06-28",
    "nilaiKontrak": 1000000,
    "status": "Selesai",
    "penanggungJawab": "Theodora Stefany — Asistent Manajer",
    "penandatanganNama": "Theodora Stefany",
    "penandatanganJabatan": "Asistent Manajer",
    "operatorPenutup": "Meliyana",
    "tanggalTandaTangan": "2026-06-19",
    "catatan": "Judul: Adlibs Event Digital Kito Galo 7th X Gemilang Palembang Raya 2026 | No. Referensi: 026/RRI.PLB/PKS.F/06/2026 | Keterangan sumber: Pembayaran Tepat Waktu",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-27-1",
        "namaLayanan": "Ad-Lib / Jingle",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Menit",
        "tarif": 50000,
        "jumlah": 20,
        "subtotal": 1000000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 2"
      }
    ]
  },
  {
    "id": "6593/PKS/RRI.PLB/07/2026",
    "nomorPks": "6593/PKS/RRI.PLB/07/2026",
    "klienId": "KLN-024",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 1",
    "tanggalMulai": "2026-07-18",
    "tanggalSelesai": "2026-07-18",
    "nilaiKontrak": 2000000,
    "status": "Selesai",
    "penanggungJawab": "Andi Ina Sarinah — TA Kabid Kowani dan PIM",
    "penandatanganNama": "Andi Ina Sarinah",
    "penandatanganJabatan": "TA Kabid Kowani dan PIM",
    "operatorPenutup": "Nadya Pratita",
    "tanggalTandaTangan": "2026-07-18",
    "catatan": "Judul: Dialog Interaktif \"Parade Kebaya Songket: Pesona Perempuan Indonesia\" | No. Referensi: 027/RRI.PLB/PKS.F/07/2026 | Keterangan sumber: Keterlambatan Pembayaran | SPn-1",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-28-1",
        "namaLayanan": "Dialog Interaktif Dalam Studio",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Jam",
        "tarif": 2000000,
        "jumlah": 1,
        "subtotal": 2000000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      }
    ]
  },
  {
    "id": "7051/PKS/RRI.PLB/07/2026",
    "nomorPks": "7051/PKS/RRI.PLB/07/2026",
    "klienId": "KLN-025",
    "jenisPnBP": "Umum",
    "kategoriLayanan": "Jasa Penggunaan Sarana dan Prasarana Siaran",
    "tanggalMulai": "2026-08-01",
    "tanggalSelesai": "2027-07-31",
    "nilaiKontrak": 6536000,
    "status": "Aktif",
    "penanggungJawab": "Faridah Hanum",
    "penandatanganNama": "Faridah Hanum",
    "jenisBmn": "Lahan",
    "lokasiBmn": "Pemancar RRI Palembang di Indralaya",
    "ukuranBmn": "5 m x 20 m",
    "luasBmn": "100m2",
    "dasarNilai": "S-187/MK/KNL.0402/2026",
    "operatorPenutup": "Meliyana",
    "tanggalTandaTangan": "2026-08-01",
    "catatan": "Judul: Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang | No. Referensi: 028/RRI.PLB/PKS.U/07/2026 | BMN: Lahan | Lokasi: Pemancar RRI Palembang di Indralaya | Tujuan: Barbershop | Luas: 100m2 | Dasar Nilai: S-187/MK/KNL.0402/2026 | Keterangan sumber: Pembayaran Tepat Waktu",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-29-1",
        "namaLayanan": "Sewa Lahan / BMN",
        "kategori": "Jasa Penggunaan Sarana dan Prasarana Siaran",
        "kodeAkun": "425131",
        "jenisPnBP": "Umum",
        "satuan": "Tahun",
        "tarif": 6536000,
        "jumlah": 1,
        "subtotal": 6536000,
        "realisasi": 1.0,
      }
    ]
  },
  {
    "id": "7052/PKS/RRI.PLB/07/2026",
    "nomorPks": "7052/PKS/RRI.PLB/07/2026",
    "klienId": "KLN-026",
    "jenisPnBP": "Umum",
    "kategoriLayanan": "Jasa Penggunaan Sarana dan Prasarana Siaran",
    "tanggalMulai": "2026-02-01",
    "tanggalSelesai": "2026-07-31",
    "nilaiKontrak": 6000000,
    "status": "Selesai",
    "penanggungJawab": "Fisol Jailani",
    "penandatanganNama": "Fisol Jailani",
    "jenisBmn": "Lahan",
    "lokasiBmn": "Pemancar RRI Palembang di Indralaya",
    "ukuranBmn": "15 m x 14 m",
    "luasBmn": "210m2",
    "dasarNilai": "S-187/MK/KNL.0402/2026",
    "operatorPenutup": "Dessi Maya Sari",
    "tanggalTandaTangan": "2026-02-01",
    "catatan": "Judul: Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang | No. Referensi: 029/RRI.PLB/PKS.U/07/2026 | BMN: Lahan | Lokasi: Pemancar RRI Palembang di Indralaya | Tujuan: Depot Gas & Air Minum | Luas: 210m2 | Dasar Nilai: S-187/MK/KNL.0402/2026 | Keterangan sumber: Keterlambatan Pembayaran | SPn-6",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-30-1",
        "namaLayanan": "Sewa Lahan / BMN",
        "kategori": "Jasa Penggunaan Sarana dan Prasarana Siaran",
        "kodeAkun": "425131",
        "jenisPnBP": "Umum",
        "satuan": "Tahun",
        "tarif": 12000000,
        "jumlah": 0.5,
        "subtotal": 6000000,
        "realisasi": 1.0,
      }
    ]
  },
  {
    "id": "7053/PKS/RRI.PLB/07/2026",
    "nomorPks": "7053/PKS/RRI.PLB/07/2026",
    "klienId": "KLN-026",
    "jenisPnBP": "Umum",
    "kategoriLayanan": "Jasa Penggunaan Sarana dan Prasarana Siaran",
    "tanggalMulai": "2026-08-01",
    "tanggalSelesai": "2027-07-31",
    "nilaiKontrak": 12000000,
    "status": "Aktif",
    "penanggungJawab": "Fisol Jailani",
    "penandatanganNama": "Fisol Jailani",
    "jenisBmn": "Lahan",
    "lokasiBmn": "Pemancar RRI Palembang di Indralaya",
    "ukuranBmn": "15 m x 14 m",
    "luasBmn": "210m2",
    "dasarNilai": "S-187/MK/KNL.0402/2026",
    "operatorPenutup": "Dessi Maya Sari",
    "tanggalTandaTangan": "2026-08-01",
    "catatan": "Judul: Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang | No. Referensi: 030/RRI.PLB/PKS.U/07/2026 | BMN: Lahan | Lokasi: Pemancar RRI Palembang di Indralaya | Tujuan: Depot Gas & Air Minum | Luas: 210m2 | Dasar Nilai: S-187/MK/KNL.0402/2026 | Keterangan sumber: Pembayaran Tepat Waktu",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-31-1",
        "namaLayanan": "Sewa Lahan / BMN",
        "kategori": "Jasa Penggunaan Sarana dan Prasarana Siaran",
        "kodeAkun": "425131",
        "jenisPnBP": "Umum",
        "satuan": "Tahun",
        "tarif": 12000000,
        "jumlah": 1,
        "subtotal": 12000000,
        "realisasi": 1.0,
      }
    ]
  },
  {
    "id": "7054/PKS/RRI.PLB/07/2026",
    "nomorPks": "7054/PKS/RRI.PLB/07/2026",
    "klienId": "KLN-027",
    "jenisPnBP": "Umum",
    "kategoriLayanan": "Jasa Penggunaan Sarana dan Prasarana Siaran",
    "tanggalMulai": "2026-02-01",
    "tanggalSelesai": "2026-07-31",
    "nilaiKontrak": 7904292,
    "status": "Selesai",
    "penanggungJawab": "Mila Agustina",
    "penandatanganNama": "Mila Agustina",
    "jenisBmn": "Lahan",
    "lokasiBmn": "Pemancar RRI Palembang di Indralaya",
    "ukuranBmn": "25 m x 17 m",
    "luasBmn": "425m2",
    "dasarNilai": "S-187/MK/KNL.0402/2026",
    "operatorPenutup": "Nadya Pratita",
    "tanggalTandaTangan": "2026-02-01",
    "catatan": "Judul: Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang | No. Referensi: 031/RRI.PLB/PKS.U/07/2026 | BMN: Lahan | Lokasi: Pemancar RRI Palembang di Indralaya | Tujuan: Warung Makan & Rental Play Station | Luas: 425m2 | Dasar Nilai: S-187/MK/KNL.0402/2026 | Keterangan sumber: Keterlambatan Pembayaran | SPn-6",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-32-1",
        "namaLayanan": "Sewa Lahan / BMN",
        "kategori": "Jasa Penggunaan Sarana dan Prasarana Siaran",
        "kodeAkun": "425131",
        "jenisPnBP": "Umum",
        "satuan": "Tahun",
        "tarif": 15808583,
        "jumlah": 0.5,
        "subtotal": 7904292,
        "realisasi": 1.0,
      }
    ]
  },
  {
    "id": "7055/PKS/RRI.PLB/07/2026",
    "nomorPks": "7055/PKS/RRI.PLB/07/2026",
    "klienId": "KLN-027",
    "jenisPnBP": "Umum",
    "kategoriLayanan": "Jasa Penggunaan Sarana dan Prasarana Siaran",
    "tanggalMulai": "2026-08-01",
    "tanggalSelesai": "2027-07-31",
    "nilaiKontrak": 15808583,
    "status": "Aktif",
    "penanggungJawab": "Mila Agustina",
    "penandatanganNama": "Mila Agustina",
    "jenisBmn": "Lahan",
    "lokasiBmn": "Pemancar RRI Palembang di Indralaya",
    "ukuranBmn": "25 m x 17 m",
    "luasBmn": "425m2",
    "dasarNilai": "S-187/MK/KNL.0402/2026",
    "operatorPenutup": "Ja\'far",
    "tanggalTandaTangan": "2026-08-01",
    "catatan": "Judul: Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang | No. Referensi: 032/RRI.PLB/PKS.U/07/2026 | BMN: Lahan | Lokasi: Pemancar RRI Palembang di Indralaya | Tujuan: Warung Makan & Rental Play Station | Luas: 425m2 | Dasar Nilai: S-187/MK/KNL.0402/2026 | Keterangan sumber: Pembayaran Tepat Waktu",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-33-1",
        "namaLayanan": "Sewa Lahan / BMN",
        "kategori": "Jasa Penggunaan Sarana dan Prasarana Siaran",
        "kodeAkun": "425131",
        "jenisPnBP": "Umum",
        "satuan": "Tahun",
        "tarif": 15808583,
        "jumlah": 1,
        "subtotal": 15808583,
        "realisasi": 1.0,
      }
    ]
  },
  {
    "id": "7060/PKS/RRI.PLB/07/2026",
    "nomorPks": "7060/PKS/RRI.PLB/07/2026",
    "klienId": "KLN-028",
    "jenisPnBP": "Umum",
    "kategoriLayanan": "Jasa Penggunaan Sarana dan Prasarana Siaran",
    "tanggalMulai": "2026-02-01",
    "tanggalSelesai": "2026-07-31",
    "nilaiKontrak": 4116000,
    "status": "Selesai",
    "penanggungJawab": "Herman Sawiran",
    "penandatanganNama": "Herman Sawiran",
    "jenisBmn": "Lahan",
    "lokasiBmn": "Pemancar RRI Palembang di Indralaya",
    "ukuranBmn": "10 m x 15 m",
    "luasBmn": "150m2",
    "dasarNilai": "S-187/MK/KNL.0402/2026",
    "operatorPenutup": "Ja\'far",
    "tanggalTandaTangan": "2026-02-01",
    "catatan": "Judul: Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang | No. Referensi: 033/RRI.PLB/PKS.U/07/2026 | BMN: Lahan | Lokasi: Pemancar RRI Palembang di Indralaya | Tujuan: Bengkel Motor & Stan Minuman | Luas: 150m2 | Dasar Nilai: S-187/MK/KNL.0402/2026 | Keterangan sumber: Keterlambatan Pembayaran | SPn-6",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-34-1",
        "namaLayanan": "Sewa Lahan / BMN",
        "kategori": "Jasa Penggunaan Sarana dan Prasarana Siaran",
        "kodeAkun": "425131",
        "jenisPnBP": "Umum",
        "satuan": "Tahun",
        "tarif": 8232000,
        "jumlah": 0.5,
        "subtotal": 4116000,
        "realisasi": 1.0,
      }
    ]
  },
  {
    "id": "7061/PKS/RRI.PLB/07/2026",
    "nomorPks": "7061/PKS/RRI.PLB/07/2026",
    "klienId": "KLN-028",
    "jenisPnBP": "Umum",
    "kategoriLayanan": "Jasa Penggunaan Sarana dan Prasarana Siaran",
    "tanggalMulai": "2026-08-01",
    "tanggalSelesai": "2027-07-31",
    "nilaiKontrak": 8232000,
    "status": "Aktif",
    "penanggungJawab": "Herman Sawiran",
    "penandatanganNama": "Herman Sawiran",
    "jenisBmn": "Lahan",
    "lokasiBmn": "Pemancar RRI Palembang di Indralaya",
    "ukuranBmn": "10 m x 15 m",
    "luasBmn": "150m2",
    "dasarNilai": "S-187/MK/KNL.0402/2026",
    "operatorPenutup": "Dessi Maya Sari",
    "tanggalTandaTangan": "2026-08-01",
    "catatan": "Judul: Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang | No. Referensi: 034/RRI.PLB/PKS.U/07/2026 | BMN: Lahan | Lokasi: Pemancar RRI Palembang di Indralaya | Tujuan: Bengkel Motor & Stan Minuman | Luas: 150m2 | Dasar Nilai: S-187/MK/KNL.0402/2026 | Keterangan sumber: Pembayaran Tepat Waktu",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-35-1",
        "namaLayanan": "Sewa Lahan / BMN",
        "kategori": "Jasa Penggunaan Sarana dan Prasarana Siaran",
        "kodeAkun": "425131",
        "jenisPnBP": "Umum",
        "satuan": "Tahun",
        "tarif": 8232000,
        "jumlah": 1,
        "subtotal": 8232000,
        "realisasi": 1.0,
      }
    ]
  },
  {
    "id": "018/PKS/DIR.LPU/08/2026",
    "nomorPks": "018/PKS/DIR.LPU/08/2026",
    "klienId": "KLN-029",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 1",
    "tanggalMulai": "2026-08-18",
    "tanggalSelesai": "2026-12-12",
    "nilaiKontrak": 7975000,
    "status": "Aktif",
    "penanggungJawab": "Belum Ditentukan",
    "operatorPenutup": "Meliyana",
    "tanggalTandaTangan": "2026-08-18",
    "catatan": "Judul: Kerjasama Penyiaran Program Komunikasi Publik\r\nKementerian Komdigi & Radio Republik Indonesia | Realisasi kerja sama: 61% (per sumber) | Keterangan sumber: Belum Jatuh Tempo",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-36-1",
        "namaLayanan": "Siaran Iklan (Spot)",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Menit",
        "tarif": 45000,
        "jumlah": 95,
        "subtotal": 4275000,
        "realisasi": 0.610526315789474,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      },
      {
        "id": "LYN-36-2",
        "namaLayanan": "Sandiwara Radio / Majalah Udara",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "10 Menit",
        "tarif": 750000,
        "jumlah": 4,
        "subtotal": 3000000,
        "realisasi": 0.5,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      },
      {
        "id": "LYN-36-3",
        "namaLayanan": "Feauture",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "7 Menit",
        "tarif": 350000,
        "jumlah": 2,
        "subtotal": 700000,
        "realisasi": 0.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      }
    ]
  },
  {
    "id": "1158/PKS/RRI.PLB/10/2026",
    "nomorPks": "1158/PKS/RRI.PLB/10/2026",
    "klienId": "KLN-001",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 1",
    "tanggalMulai": "2026-09-22",
    "tanggalSelesai": "2026-09-25",
    "nilaiKontrak": 180000,
    "status": "Selesai",
    "penanggungJawab": "Ilham Juliando — K3 dan Keamanan",
    "penandatanganNama": "Ilham Juliando",
    "penandatanganJabatan": "K3 dan Keamanan",
    "operatorPenutup": "Dessi Maya Sari",
    "tanggalTandaTangan": "2026-09-22",
    "catatan": "Judul: Spot Iklan Edukasi Bahaya & Manfaat Listrik | No. Referensi: 035/RRI.PLB/PKS.F/09/2026 | Keterangan sumber: Pembayaran Tepat Waktu",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-37-1",
        "namaLayanan": "Siaran Iklan (Spot)",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Menit",
        "tarif": 45000,
        "jumlah": 4,
        "subtotal": 180000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      }
    ]
  },
  {
    "id": "10227/PKS/RRI.PLB/10/2026",
    "nomorPks": "10227/PKS/RRI.PLB/10/2026",
    "klienId": "KLN-030",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 1",
    "tanggalMulai": "2026-10-12",
    "tanggalSelesai": "2026-11-17",
    "nilaiKontrak": 4995000,
    "status": "Aktif",
    "penanggungJawab": "Marwan Hidayat, SE — Penyuluh Narkoba Ahli Madya",
    "penandatanganNama": "Marwan Hidayat, SE",
    "penandatanganJabatan": "Penyuluh Narkoba Ahli Madya",
    "operatorPenutup": "Nadya Pratita",
    "tanggalTandaTangan": "2026-10-12",
    "catatan": "Judul: Spot  Iklan Layanan Masyarakat Re-Link (Rehabilitasi Keliling) & Pindang (Pelayanan Aplikasi) | No. Referensi: 036/RRI.PLB/PKS.F/10/2026 | Realisasi kerja sama: 54% (per sumber) | Keterangan sumber: Belum Jatuh Tempo",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-38-1",
        "namaLayanan": "Siaran Iklan (Spot)",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Menit",
        "tarif": 45000,
        "jumlah": 111,
        "subtotal": 4995000,
        "realisasi": 0.540540540540541,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      }
    ]
  },
  {
    "id": "10828/PKS/RRI.PLB/10/2026",
    "nomorPks": "10828/PKS/RRI.PLB/10/2026",
    "klienId": "KLN-031",
    "jenisPnBP": "Umum",
    "kategoriLayanan": "Jasa Penggunaan Sarana dan Prasarana Siaran",
    "tanggalMulai": "2026-09-17",
    "tanggalSelesai": "2027-09-16",
    "nilaiKontrak": 132704000,
    "status": "Aktif",
    "penanggungJawab": "Samdini",
    "penandatanganNama": "Samdini",
    "jenisBmn": "Lahan",
    "lokasiBmn": "Pemancar RRI Palembang di Indralaya",
    "ukuranBmn": "465 m x 1000 m",
    "luasBmn": "465000m2",
    "dasarNilai": "S-292/MK/KNL.0402/2026",
    "operatorPenutup": "Meliyana",
    "tanggalTandaTangan": "2026-09-17",
    "catatan": "Judul: Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang | No. Referensi: 037/RRI.PLB/PKS.U/10/2026 | BMN: Lahan | Lokasi: Pemancar RRI Palembang di Indralaya | Tujuan: Perkebunan & Pertanian | Luas: 465000m2 | Dasar Nilai: S-292/MK/KNL.0402/2026 | Keterangan sumber: Keterlambatan Pembayaran Karena Alasan Administratif",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-39-1",
        "namaLayanan": "Sewa Lahan / BMN",
        "kategori": "Jasa Penggunaan Sarana dan Prasarana Siaran",
        "kodeAkun": "425131",
        "jenisPnBP": "Umum",
        "satuan": "Tahun",
        "tarif": 132704000,
        "jumlah": 1,
        "subtotal": 132704000,
        "realisasi": 1.0,
      }
    ]
  },
  {
    "id": "11290/PKS/RRI.PLB/10/2026",
    "nomorPks": "11290/PKS/RRI.PLB/10/2026",
    "klienId": "KLN-016",
    "jenisPnBP": "Fungsional",
    "kategoriLayanan": "Jasa Penyiaran",
    "programa": "Programa 1",
    "tanggalMulai": "2026-10-30",
    "tanggalSelesai": "2026-10-30",
    "nilaiKontrak": 2000000,
    "status": "Selesai",
    "penanggungJawab": "Amalia Fatmasari — Kepala Seksi Bimbingan Penyuluhan dan Pengelolaan Dokumen",
    "penandatanganNama": "Amalia Fatmasari",
    "penandatanganJabatan": "Kepala Seksi Bimbingan Penyuluhan dan Pengelolaan Dokumen",
    "operatorPenutup": "Meliyana",
    "tanggalTandaTangan": "2026-10-30",
    "catatan": "Judul: Dialog Interaktif \"Bebas Sanksi Pajak Lewat Program Pengurangan Sanksi Administrasi (PSA) : Waktunya Kepatuhan Sukarela\" | No. Referensi: 038/RRI.PLB/PKS.F/10/2026 | Keterangan sumber: Belum Jatuh Tempo",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-40-1",
        "namaLayanan": "Dialog Interaktif Dalam Studio",
        "kategori": "Jasa Penyiaran",
        "kodeAkun": "425531",
        "jenisPnBP": "Fungsional",
        "satuan": "Jam",
        "tarif": 2000000,
        "jumlah": 1,
        "subtotal": 2000000,
        "realisasi": 1.0,
        "jenisWaktu": "Prime Time",
        "programa": "Programa 1"
      }
    ]
  },
  {
    "id": "027/RRI.PLB/PKS.U/06/2025",
    "nomorPks": "027/RRI.PLB/PKS.U/06/2025",
    "klienId": "KLN-032",
    "jenisPnBP": "Umum",
    "kategoriLayanan": "Jasa Penggunaan Sarana dan Prasarana Siaran",
    "tanggalMulai": "2025-07-01",
    "tanggalSelesai": "2028-06-30",
    "nilaiKontrak": 33738750,
    "status": "Aktif",
    "penanggungJawab": "Darojad",
    "penandatanganNama": "Darojad",
    "jenisBmn": "Lahan",
    "lokasiBmn": "Pemancar RRI Palembang di Indralaya",
    "ukuranBmn": "10 m x 15 m",
    "luasBmn": "150m2",
    "dasarNilai": "S-99/MK/KNL.0402/2025",
    "operatorPenutup": "A. Kadir Kurniawan",
    "tanggalTandaTangan": "2025-07-01",
    "catatan": "Judul: Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang | BMN: Lahan | Lokasi: Pemancar RRI Palembang di Indralaya | Tujuan: Toko Kelontong,\nJasa Pengiriman\ndan Warung\nPempek | Luas: 150m2 | Dasar Nilai: S-99/MK/KNL.0402/2025 | Realisasi kerja sama: 67% (per sumber) | Keterangan sumber: Pembayaran Tepat Waktu | Sisa kontrak tahun sebelumnya (2025); pembayaran 2026 tercatat sebagai angsuran tahun berjalan.",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-2025-40-1",
        "namaLayanan": "Sewa Lahan / BMN",
        "kategori": "Jasa Penggunaan Sarana dan Prasarana Siaran",
        "kodeAkun": "425131",
        "jenisPnBP": "Umum",
        "satuan": "Tahun",
        "tarif": 11246250,
        "jumlah": 3,
        "subtotal": 33738750,
        "realisasi": 0.666666666666667,
      }
    ]
  },
  {
    "id": "016/PKS/DIR.LPU/06/2025",
    "nomorPks": "016/PKS/DIR.LPU/06/2025",
    "klienId": "KLN-033",
    "jenisPnBP": "Umum",
    "kategoriLayanan": "Jasa Penggunaan Sarana dan Prasarana Siaran",
    "tanggalMulai": "2025-08-20",
    "tanggalSelesai": "2028-08-20",
    "nilaiKontrak": 51438750,
    "status": "Aktif",
    "penanggungJawab": "Loura Hardjaloka",
    "penandatanganNama": "Loura Hardjaloka",
    "jenisBmn": "Lahan",
    "lokasiBmn": "Pemancar RRI Palembang di Indralaya",
    "ukuranBmn": "2.5 m x 5 m",
    "luasBmn": "12,5m2",
    "dasarNilai": "S-103/MK/KNL.0402/2025",
    "operatorPenutup": "Nadya Pratita",
    "tanggalTandaTangan": "2025-08-20",
    "catatan": "Judul: Sewa Menyewa Lahan di Lokasi Kantor LPP RRI Palembang | BMN: Lahan | Lokasi: Pemancar RRI Palembang di Indralaya | Tujuan: Stasiun Pengisian Bahan Bakar Listrik | Luas: 12,5m2 | Dasar Nilai: S-103/MK/KNL.0402/2025 | Realisasi kerja sama: 67% (per sumber) | Keterangan sumber: Pembayaran Tepat Waktu | Sisa kontrak tahun sebelumnya (2025); pembayaran 2026 tercatat sebagai angsuran tahun berjalan.",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "layanan": [
      {
        "id": "LYN-2025-41-1",
        "namaLayanan": "Sewa Lahan / BMN",
        "kategori": "Jasa Penggunaan Sarana dan Prasarana Siaran",
        "kodeAkun": "425131",
        "jenisPnBP": "Umum",
        "satuan": "Tahun",
        "tarif": 17146250,
        "jumlah": 3,
        "subtotal": 51438750,
        "realisasi": 0.666666666666667,
      }
    ]
  }
],
  dokumen: [
  {
    "id": "DOK-1-K",
    "klienId": "KLN-001",
    "kontrakId": "0603/PKS/RRI.PLB/01/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-1-M",
    "klienId": "KLN-001",
    "kontrakId": "0603/PKS/RRI.PLB/01/2026",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Ada"
  },
  {
    "id": "DOK-1-N",
    "klienId": "KLN-001",
    "kontrakId": "0603/PKS/RRI.PLB/01/2026",
    "jenisDokumen": "Kwitansi Pembayaran",
    "status": "Ada"
  },
  {
    "id": "DOK-1-O",
    "klienId": "KLN-001",
    "kontrakId": "0603/PKS/RRI.PLB/01/2026",
    "jenisDokumen": "Surat Penagihan",
    "status": "Belum Ada",
    "catatan": "No Document"
  },
  {
    "id": "DOK-2-K",
    "klienId": "KLN-002",
    "kontrakId": "001/PKS/DIR.LPU/01/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-2-M",
    "klienId": "KLN-002",
    "kontrakId": "001/PKS/DIR.LPU/01/2026",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Ada"
  },
  {
    "id": "DOK-2-N",
    "klienId": "KLN-002",
    "kontrakId": "001/PKS/DIR.LPU/01/2026",
    "jenisDokumen": "Kwitansi Pembayaran",
    "status": "Belum Ada",
    "catatan": "Konfirmasi ke Imam"
  },
  {
    "id": "DOK-2-O",
    "klienId": "KLN-002",
    "kontrakId": "001/PKS/DIR.LPU/01/2026",
    "jenisDokumen": "Surat Penagihan",
    "status": "Belum Ada",
    "catatan": "No Document"
  },
  {
    "id": "DOK-3-K",
    "klienId": "KLN-003",
    "kontrakId": "1051/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-3-M",
    "klienId": "KLN-003",
    "kontrakId": "1051/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Ada"
  },
  {
    "id": "DOK-3-N",
    "klienId": "KLN-003",
    "kontrakId": "1051/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "Kwitansi Pembayaran",
    "status": "Ada"
  },
  {
    "id": "DOK-3-O",
    "klienId": "KLN-003",
    "kontrakId": "1051/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "Surat Penagihan",
    "status": "Belum Ada",
    "catatan": "No Document"
  },
  {
    "id": "DOK-3-S",
    "klienId": "KLN-003",
    "kontrakId": "1051/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "Permohonan Sewa",
    "status": "Ada"
  },
  {
    "id": "DOK-4-K",
    "klienId": "KLN-004",
    "kontrakId": "1052/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-4-M",
    "klienId": "KLN-004",
    "kontrakId": "1052/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Ada"
  },
  {
    "id": "DOK-4-N",
    "klienId": "KLN-004",
    "kontrakId": "1052/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "Kwitansi Pembayaran",
    "status": "Ada"
  },
  {
    "id": "DOK-4-O",
    "klienId": "KLN-004",
    "kontrakId": "1052/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "Surat Penagihan",
    "status": "Belum Ada",
    "catatan": "No Document"
  },
  {
    "id": "DOK-4-S",
    "klienId": "KLN-004",
    "kontrakId": "1052/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "Permohonan Sewa",
    "status": "Ada"
  },
  {
    "id": "DOK-5-K",
    "klienId": "KLN-005",
    "kontrakId": "1053/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-5-M",
    "klienId": "KLN-005",
    "kontrakId": "1053/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Ada"
  },
  {
    "id": "DOK-5-N",
    "klienId": "KLN-005",
    "kontrakId": "1053/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "Kwitansi Pembayaran",
    "status": "Ada"
  },
  {
    "id": "DOK-5-O",
    "klienId": "KLN-005",
    "kontrakId": "1053/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "Surat Penagihan",
    "status": "Belum Ada",
    "catatan": "No Document"
  },
  {
    "id": "DOK-5-S",
    "klienId": "KLN-005",
    "kontrakId": "1053/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "Permohonan Sewa",
    "status": "Ada"
  },
  {
    "id": "DOK-6-K",
    "klienId": "KLN-006",
    "kontrakId": "1494/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada",
    "catatan": "Anotasi sumber (kolom A): Invoice 005 Abdul Rozak Rusdy"
  },
  {
    "id": "DOK-6-M",
    "klienId": "KLN-006",
    "kontrakId": "1494/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Ada"
  },
  {
    "id": "DOK-6-N",
    "klienId": "KLN-006",
    "kontrakId": "1494/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "Kwitansi Pembayaran",
    "status": "Belum Ada",
    "catatan": "Konfirmasi ke Imam"
  },
  {
    "id": "DOK-6-O",
    "klienId": "KLN-006",
    "kontrakId": "1494/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "Surat Penagihan",
    "status": "Ada",
    "catatan": "Dokumen Surat Penagihan"
  },
  {
    "id": "DOK-6-S",
    "klienId": "KLN-006",
    "kontrakId": "1494/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "Permohonan Sewa",
    "status": "Ada"
  },
  {
    "id": "DOK-7-K",
    "klienId": "KLN-007",
    "kontrakId": "1497/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-7-M",
    "klienId": "KLN-007",
    "kontrakId": "1497/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Ada"
  },
  {
    "id": "DOK-7-N",
    "klienId": "KLN-007",
    "kontrakId": "1497/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "Kwitansi Pembayaran",
    "status": "Belum Ada",
    "catatan": "Konfirmasi ke Imam"
  },
  {
    "id": "DOK-7-O",
    "klienId": "KLN-007",
    "kontrakId": "1497/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "Surat Penagihan",
    "status": "Belum Ada",
    "catatan": "No Document"
  },
  {
    "id": "DOK-7-S",
    "klienId": "KLN-007",
    "kontrakId": "1497/PKS/RRI.PLB/02/2026",
    "jenisDokumen": "Permohonan Sewa",
    "status": "Ada"
  },
  {
    "id": "DOK-8-K",
    "klienId": "KLN-008",
    "kontrakId": "1744/PKS/RRI.PLB/03/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada",
    "catatan": "Anotasi sumber (kolom A): PKS 007 Dinas Komunikasi dan Informatika Kota Palembang"
  },
  {
    "id": "DOK-8-M",
    "klienId": "KLN-008",
    "kontrakId": "1744/PKS/RRI.PLB/03/2026",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Belum Ada",
    "catatan": "Belum Bayar"
  },
  {
    "id": "DOK-8-N",
    "klienId": "KLN-008",
    "kontrakId": "1744/PKS/RRI.PLB/03/2026",
    "jenisDokumen": "Kwitansi Pembayaran",
    "status": "Belum Ada",
    "catatan": "Belum Bayar"
  },
  {
    "id": "DOK-8-O",
    "klienId": "KLN-008",
    "kontrakId": "1744/PKS/RRI.PLB/03/2026",
    "jenisDokumen": "Surat Penagihan",
    "status": "Belum Ada",
    "catatan": "Belum Jatuh Tempo"
  },
  {
    "id": "DOK-9-K",
    "klienId": "KLN-009",
    "kontrakId": "1745/PKS/RRI.PLB/03/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-9-M",
    "klienId": "KLN-009",
    "kontrakId": "1745/PKS/RRI.PLB/03/2026",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Belum Ada",
    "catatan": "Belum Bayar"
  },
  {
    "id": "DOK-9-N",
    "klienId": "KLN-009",
    "kontrakId": "1745/PKS/RRI.PLB/03/2026",
    "jenisDokumen": "Kwitansi Pembayaran",
    "status": "Belum Ada",
    "catatan": "Belum Bayar"
  },
  {
    "id": "DOK-9-O",
    "klienId": "KLN-009",
    "kontrakId": "1745/PKS/RRI.PLB/03/2026",
    "jenisDokumen": "Surat Penagihan",
    "status": "Belum Ada",
    "catatan": "Belum Jatuh Tempo"
  },
  {
    "id": "DOK-10-K",
    "klienId": "KLN-010",
    "kontrakId": "1746/PKS/RRI.PLB/03/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-10-M",
    "klienId": "KLN-010",
    "kontrakId": "1746/PKS/RRI.PLB/03/2026",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Ada"
  },
  {
    "id": "DOK-10-N",
    "klienId": "KLN-010",
    "kontrakId": "1746/PKS/RRI.PLB/03/2026",
    "jenisDokumen": "Kwitansi Pembayaran",
    "status": "Belum Ada",
    "catatan": "Belum Bayar"
  },
  {
    "id": "DOK-10-O",
    "klienId": "KLN-010",
    "kontrakId": "1746/PKS/RRI.PLB/03/2026",
    "jenisDokumen": "Surat Penagihan",
    "status": "Belum Ada",
    "catatan": "Belum Jatuh Tempo"
  },
  {
    "id": "DOK-11-K",
    "klienId": "KLN-011",
    "kontrakId": "2036/PKS/RRI.PLB/03/2026#010",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada",
    "catatan": "Anotasi sumber (kolom A): PKS 010 Bank Sumsel Babel (Signature)"
  },
  {
    "id": "DOK-11-M",
    "klienId": "KLN-011",
    "kontrakId": "2036/PKS/RRI.PLB/03/2026#010",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Belum Ada",
    "catatan": "Belum Bayar"
  },
  {
    "id": "DOK-11-N",
    "klienId": "KLN-011",
    "kontrakId": "2036/PKS/RRI.PLB/03/2026#010",
    "jenisDokumen": "Kwitansi Pembayaran",
    "status": "Belum Ada",
    "catatan": "Belum Bayar"
  },
  {
    "id": "DOK-11-O",
    "klienId": "KLN-011",
    "kontrakId": "2036/PKS/RRI.PLB/03/2026#010",
    "jenisDokumen": "Surat Penagihan",
    "status": "Belum Ada",
    "catatan": "Belum Jatuh Tempo"
  },
  {
    "id": "DOK-12-K",
    "klienId": "KLN-012",
    "kontrakId": "2036/PKS/RRI.PLB/03/2026#011",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada",
    "catatan": "Anotasi sumber (kolom A): PKS 011 Kantor Perwakilan Bank Indonesia Provinsi Sumatera Selatan (Signature)"
  },
  {
    "id": "DOK-12-M",
    "klienId": "KLN-012",
    "kontrakId": "2036/PKS/RRI.PLB/03/2026#011",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Ada"
  },
  {
    "id": "DOK-12-N",
    "klienId": "KLN-012",
    "kontrakId": "2036/PKS/RRI.PLB/03/2026#011",
    "jenisDokumen": "Kwitansi Pembayaran",
    "status": "Belum Ada",
    "catatan": "Belum Bayar"
  },
  {
    "id": "DOK-12-O",
    "klienId": "KLN-012",
    "kontrakId": "2036/PKS/RRI.PLB/03/2026#011",
    "jenisDokumen": "Surat Penagihan",
    "status": "Belum Ada",
    "catatan": "Belum Jatuh Tempo"
  },
  {
    "id": "DOK-12-M2",
    "klienId": "KLN-012",
    "kontrakId": "2036/PKS/RRI.PLB/03/2026#011",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Ada",
    "catatan": "Billing Denda (baris lanjutan Dokumen Kerjasama baris 19)."
  },
  {
    "id": "DOK-13-K",
    "klienId": "KLN-013",
    "kontrakId": "2605/PKS/RRI.PLB/04/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-13-M",
    "klienId": "KLN-013",
    "kontrakId": "2605/PKS/RRI.PLB/04/2026",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Ada"
  },
  {
    "id": "DOK-14-K",
    "klienId": "KLN-014",
    "kontrakId": "2919/PKS/RRI.PLB/04/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-14-M",
    "klienId": "KLN-014",
    "kontrakId": "2919/PKS/RRI.PLB/04/2026",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Ada"
  },
  {
    "id": "DOK-15-K",
    "klienId": "KLN-015",
    "kontrakId": "2920/PKS/RRI.PLB/04/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada",
    "catatan": "Anotasi sumber (kolom A): PKS 014 Bank Syariah Indonesia KCP Kenten 2 Palembang (Signature)"
  },
  {
    "id": "DOK-15-M",
    "klienId": "KLN-015",
    "kontrakId": "2920/PKS/RRI.PLB/04/2026",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Ada"
  },
  {
    "id": "DOK-16-K",
    "klienId": "KLN-016",
    "kontrakId": "3669/PKS/RRI.PLB/04/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-16-M",
    "klienId": "KLN-016",
    "kontrakId": "3669/PKS/RRI.PLB/04/2026",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Ada"
  },
  {
    "id": "DOK-17-K",
    "klienId": "KLN-001",
    "kontrakId": "3981/PKS/RRI.PLB/05/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-17-M",
    "klienId": "KLN-001",
    "kontrakId": "3981/PKS/RRI.PLB/05/2026",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Ada"
  },
  {
    "id": "DOK-18-K",
    "klienId": "KLN-017",
    "kontrakId": "4720/PKS/RRI.PLB/06/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-18-M",
    "klienId": "KLN-017",
    "kontrakId": "4720/PKS/RRI.PLB/06/2026",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Ada"
  },
  {
    "id": "DOK-18-S",
    "klienId": "KLN-017",
    "kontrakId": "4720/PKS/RRI.PLB/06/2026",
    "jenisDokumen": "Permohonan Sewa",
    "status": "Ada"
  },
  {
    "id": "DOK-19-K",
    "klienId": "KLN-018",
    "kontrakId": "4747/PKS/RRI.PLB/06/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-19-M",
    "klienId": "KLN-018",
    "kontrakId": "4747/PKS/RRI.PLB/06/2026",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Belum Ada",
    "catatan": "Minta ke Imam"
  },
  {
    "id": "DOK-20-K",
    "klienId": "KLN-019",
    "kontrakId": "4842/PKS/RRI.PLB/06/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-20-M",
    "klienId": "KLN-019",
    "kontrakId": "4842/PKS/RRI.PLB/06/2026",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Belum Ada",
    "catatan": "Belum Bayar"
  },
  {
    "id": "DOK-21-K",
    "klienId": "KLN-020",
    "kontrakId": "4873/PKS/RRI.PLB/06/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada",
    "catatan": "Anotasi sumber (kolom A): PKS 020 PT Sumber Alfaria Trijaya Tbk. Branch Palembang (Signature)"
  },
  {
    "id": "DOK-21-M",
    "klienId": "KLN-020",
    "kontrakId": "4873/PKS/RRI.PLB/06/2026",
    "jenisDokumen": "Billing Pembayaran",
    "status": "Belum Ada",
    "catatan": "Belum Bayar"
  },
  {
    "id": "DOK-22-K",
    "klienId": "KLN-021",
    "kontrakId": "5350/PKS/RRI.PLB/06/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-23-K",
    "klienId": "KLN-022",
    "kontrakId": "5390/PKS/RRI.PLB/06/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-24-K",
    "klienId": "KLN-023",
    "kontrakId": "5391/PKS/RRI.PLB/06/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-25-K",
    "klienId": "KLN-013",
    "kontrakId": "5483/PKS/RRI.PLB/06/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada",
    "catatan": "Anotasi sumber (kolom A): PKS 024 Kantor Pengawasan dan Pelayanan Bea dan Cukai TMP B Palembang (Signature)"
  },
  {
    "id": "DOK-26-K",
    "klienId": "KLN-012",
    "kontrakId": "5484/PKS/RRI.PLB/06/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-27-K",
    "klienId": "KLN-012",
    "kontrakId": "5592/PKS/RRI.PLB/06/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-28-K",
    "klienId": "KLN-024",
    "kontrakId": "6593/PKS/RRI.PLB/07/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada",
    "catatan": "Anotasi sumber (kolom A): PKS 027 Perempuan Indonesia Maju (PIM) (Signature)"
  },
  {
    "id": "DOK-29-K",
    "klienId": "KLN-025",
    "kontrakId": "7051/PKS/RRI.PLB/07/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada",
    "catatan": "Anotasi sumber (kolom A): PKS 028 Faridah Hanum"
  },
  {
    "id": "DOK-29-S",
    "klienId": "KLN-025",
    "kontrakId": "7051/PKS/RRI.PLB/07/2026",
    "jenisDokumen": "Permohonan Sewa",
    "status": "Ada"
  },
  {
    "id": "DOK-30-K",
    "klienId": "KLN-026",
    "kontrakId": "7052/PKS/RRI.PLB/07/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada",
    "catatan": "Anotasi sumber (kolom A): Permohonan Sewa 029 Fisol Jailani"
  },
  {
    "id": "DOK-30-S",
    "klienId": "KLN-026",
    "kontrakId": "7052/PKS/RRI.PLB/07/2026",
    "jenisDokumen": "Permohonan Sewa",
    "status": "Ada"
  },
  {
    "id": "DOK-31-K",
    "klienId": "KLN-026",
    "kontrakId": "7053/PKS/RRI.PLB/07/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-31-S",
    "klienId": "KLN-026",
    "kontrakId": "7053/PKS/RRI.PLB/07/2026",
    "jenisDokumen": "Permohonan Sewa",
    "status": "Ada"
  },
  {
    "id": "DOK-32-K",
    "klienId": "KLN-027",
    "kontrakId": "7054/PKS/RRI.PLB/07/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada",
    "catatan": "Anotasi sumber (kolom A): Permohonan Sewa 031 Mila Agustina"
  },
  {
    "id": "DOK-32-S",
    "klienId": "KLN-027",
    "kontrakId": "7054/PKS/RRI.PLB/07/2026",
    "jenisDokumen": "Permohonan Sewa",
    "status": "Ada"
  },
  {
    "id": "DOK-33-K",
    "klienId": "KLN-027",
    "kontrakId": "7055/PKS/RRI.PLB/07/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-33-S",
    "klienId": "KLN-027",
    "kontrakId": "7055/PKS/RRI.PLB/07/2026",
    "jenisDokumen": "Permohonan Sewa",
    "status": "Ada"
  },
  {
    "id": "DOK-34-K",
    "klienId": "KLN-028",
    "kontrakId": "7060/PKS/RRI.PLB/07/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada",
    "catatan": "Anotasi sumber (kolom A): Permohonan Sewa 033 Herman Sawiran"
  },
  {
    "id": "DOK-34-S",
    "klienId": "KLN-028",
    "kontrakId": "7060/PKS/RRI.PLB/07/2026",
    "jenisDokumen": "Permohonan Sewa",
    "status": "Ada"
  },
  {
    "id": "DOK-35-K",
    "klienId": "KLN-028",
    "kontrakId": "7061/PKS/RRI.PLB/07/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada"
  },
  {
    "id": "DOK-35-S",
    "klienId": "KLN-028",
    "kontrakId": "7061/PKS/RRI.PLB/07/2026",
    "jenisDokumen": "Permohonan Sewa",
    "status": "Ada"
  },
  {
    "id": "DOK-36-K",
    "klienId": "KLN-029",
    "kontrakId": "018/PKS/DIR.LPU/08/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Ada",
    "catatan": "Dokumen Masih Proses Penandatangan di Kantor Pusat Direktorat LPU"
  },
  {
    "id": "DOK-37-K",
    "klienId": "KLN-001",
    "kontrakId": "1158/PKS/RRI.PLB/10/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Belum Ada",
    "catatan": "Baris dokumen di sumber hanya berisi nomor kontrak (stub); status PKS tidak tercatat."
  },
  {
    "id": "DOK-38-K",
    "klienId": "KLN-030",
    "kontrakId": "10227/PKS/RRI.PLB/10/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Belum Ada",
    "catatan": "Baris dokumen di sumber hanya berisi nomor kontrak (stub); status PKS tidak tercatat."
  },
  {
    "id": "DOK-39-S",
    "klienId": "KLN-031",
    "kontrakId": "10828/PKS/RRI.PLB/10/2026",
    "jenisDokumen": "Permohonan Sewa",
    "status": "Ada"
  },
  {
    "id": "DOK-39-K",
    "klienId": "KLN-031",
    "kontrakId": "10828/PKS/RRI.PLB/10/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Belum Ada",
    "catatan": "Baris dokumen di sumber hanya berisi nomor kontrak (stub); status PKS tidak tercatat."
  },
  {
    "id": "DOK-40-K",
    "klienId": "KLN-016",
    "kontrakId": "11290/PKS/RRI.PLB/10/2026",
    "jenisDokumen": "PKS (asli)",
    "status": "Belum Ada",
    "catatan": "Tidak ada baris di tab Dokumen Kerjasama."
  },
  {
    "id": "DOK-2025-40-K",
    "klienId": "KLN-032",
    "kontrakId": "027/RRI.PLB/PKS.U/06/2025",
    "jenisDokumen": "PKS (asli)",
    "status": "Belum Ada",
    "catatan": "Tidak ada baris di tab Dokumen Kerjasama."
  },
  {
    "id": "DOK-2025-41-K",
    "klienId": "KLN-033",
    "kontrakId": "016/PKS/DIR.LPU/06/2025",
    "jenisDokumen": "PKS (asli)",
    "status": "Belum Ada",
    "catatan": "Tidak ada baris di tab Dokumen Kerjasama."
  }
],
  tagihan: [
  {
    "id": "TGH-001-RRI-PLB-PKS-F-01-2026",
    "klienId": "KLN-001",
    "nomor": "001/RRI.PLB/PKS.F/01/2026",
    "kontrakId": "0603/PKS/RRI.PLB/01/2026",
    "uraian": "Tagihan Siaran Iklan (Spot) — 0603/PKS/RRI.PLB/01/2026",
    "nilai": 270000,
    "tanggalTerbit": "2026-01-19",
    "tanggalJatuhTempo": "2026-02-24",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-001-PKS-DIR-LPU-01-2026",
    "klienId": "KLN-002",
    "nomor": "001/PKS/DIR.LPU/01/2026",
    "kontrakId": "001/PKS/DIR.LPU/01/2026",
    "uraian": "Tagihan Ad-Lib / Jingle — 001/PKS/DIR.LPU/01/2026",
    "nilai": 1550000,
    "tanggalTerbit": "2026-01-19",
    "tanggalJatuhTempo": "2026-03-18",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-002-RRI-PLB-PKS-U-01-2026",
    "klienId": "KLN-003",
    "nomor": "002/RRI.PLB/PKS.U/01/2026",
    "kontrakId": "1051/PKS/RRI.PLB/02/2026",
    "uraian": "Tagihan Sewa Lahan / BMN — 1051/PKS/RRI.PLB/02/2026",
    "nilai": 6455000,
    "tanggalTerbit": "2026-01-30",
    "tanggalJatuhTempo": "2026-01-31",
    "kodeAkun": "425131",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-003-RRI-PLB-PKS-U-01-2026",
    "klienId": "KLN-004",
    "nomor": "003/RRI.PLB/PKS.U/01/2026",
    "kontrakId": "1052/PKS/RRI.PLB/02/2026",
    "uraian": "Tagihan Sewa Lahan / BMN — 1052/PKS/RRI.PLB/02/2026",
    "nilai": 6455000,
    "tanggalTerbit": "2026-01-30",
    "tanggalJatuhTempo": "2026-01-31",
    "kodeAkun": "425131",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-004-RRI-PLB-PKS-U-01-2026",
    "klienId": "KLN-005",
    "nomor": "004/RRI.PLB/PKS.U/01/2026",
    "kontrakId": "1053/PKS/RRI.PLB/02/2026",
    "uraian": "Tagihan Sewa Lahan / BMN — 1053/PKS/RRI.PLB/02/2026",
    "nilai": 5648000,
    "tanggalTerbit": "2026-01-30",
    "tanggalJatuhTempo": "2026-01-31",
    "kodeAkun": "425131",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-005-RRI-PLB-PKS-U-02-2026",
    "klienId": "KLN-006",
    "nomor": "005/RRI.PLB/PKS.U/02/2026",
    "kontrakId": "1494/PKS/RRI.PLB/02/2026",
    "uraian": "Tagihan Sewa Lahan / BMN — 1494/PKS/RRI.PLB/02/2026",
    "nilai": 9199380,
    "tanggalTerbit": "2026-02-11",
    "tanggalJatuhTempo": "2026-01-31",
    "kodeAkun": "425131",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-006-RRI-PLB-PKS-U-02-2026",
    "klienId": "KLN-007",
    "nomor": "006/RRI.PLB/PKS.U/02/2026",
    "kontrakId": "1497/PKS/RRI.PLB/02/2026",
    "uraian": "Tagihan Sewa Lahan / BMN — 1497/PKS/RRI.PLB/02/2026",
    "nilai": 6536000,
    "tanggalTerbit": "2026-02-11",
    "tanggalJatuhTempo": "2026-03-09",
    "kodeAkun": "425131",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-007-RRI-PLB-PKS-F-02-2026",
    "klienId": "KLN-008",
    "nomor": "007/RRI.PLB/PKS.F/02/2026",
    "kontrakId": "1744/PKS/RRI.PLB/03/2026",
    "uraian": "Tagihan Greeting / Tanda Waktu (Time Signal) — 1744/PKS/RRI.PLB/03/2026",
    "nilai": 15900000,
    "tanggalTerbit": "2026-02-18",
    "tanggalJatuhTempo": "2026-04-22",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-008-RRI-PLB-PKS-F-02-2026",
    "klienId": "KLN-009",
    "nomor": "008/RRI.PLB/PKS.F/02/2026",
    "kontrakId": "1745/PKS/RRI.PLB/03/2026",
    "uraian": "Tagihan Greeting / Tanda Waktu (Time Signal) — 1745/PKS/RRI.PLB/03/2026",
    "nilai": 5300000,
    "tanggalTerbit": "2026-02-18",
    "tanggalJatuhTempo": "2026-04-22",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-009-RRI-PLB-PKS-F-02-2026",
    "klienId": "KLN-010",
    "nomor": "009/RRI.PLB/PKS.F/02/2026",
    "kontrakId": "1746/PKS/RRI.PLB/03/2026",
    "uraian": "Tagihan Greeting / Tanda Waktu (Time Signal) — 1746/PKS/RRI.PLB/03/2026",
    "nilai": 3000000,
    "tanggalTerbit": "2026-02-18",
    "tanggalJatuhTempo": "2026-04-22",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-010-RRI-PLB-PKS-F-02-2026",
    "klienId": "KLN-011",
    "nomor": "010/RRI.PLB/PKS.F/02/2026",
    "kontrakId": "2036/PKS/RRI.PLB/03/2026#010",
    "uraian": "Tagihan Greeting / Tanda Waktu (Time Signal) — 2036/PKS/RRI.PLB/03/2026",
    "nilai": 7800000,
    "tanggalTerbit": "2026-02-18",
    "tanggalJatuhTempo": "2026-04-22",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-011-RRI-PLB-PKS-F-02-2026",
    "klienId": "KLN-012",
    "nomor": "011/RRI.PLB/PKS.F/02/2026",
    "kontrakId": "2036/PKS/RRI.PLB/03/2026#011",
    "uraian": "Tagihan Greeting / Tanda Waktu (Time Signal) — 2036/PKS/RRI.PLB/03/2026",
    "nilai": 6324000,
    "tanggalTerbit": "2026-02-24",
    "tanggalJatuhTempo": "2026-04-22",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-012-RRI-PLB-PKS-F-03-2026",
    "klienId": "KLN-013",
    "nomor": "012/RRI.PLB/PKS.F/03/2026",
    "kontrakId": "2605/PKS/RRI.PLB/04/2026",
    "uraian": "Tagihan Siaran Iklan (Spot) — 2605/PKS/RRI.PLB/04/2026",
    "nilai": 4050000,
    "tanggalTerbit": "2026-03-10",
    "tanggalJatuhTempo": "2026-05-08",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-013-RRI-PLB-PKS-F-03-2026",
    "klienId": "KLN-014",
    "nomor": "013/RRI.PLB/PKS.F/03/2026",
    "kontrakId": "2919/PKS/RRI.PLB/04/2026",
    "uraian": "Tagihan Greeting / Tanda Waktu (Time Signal) — 2919/PKS/RRI.PLB/04/2026",
    "nilai": 1530000,
    "tanggalTerbit": "2026-03-19",
    "tanggalJatuhTempo": "2026-04-22",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-014-RRI-PLB-PKS-F-03-2026",
    "klienId": "KLN-015",
    "nomor": "014/RRI.PLB/PKS.F/03/2026",
    "kontrakId": "2920/PKS/RRI.PLB/04/2026",
    "uraian": "Tagihan Greeting / Tanda Waktu (Time Signal) — 2920/PKS/RRI.PLB/04/2026",
    "nilai": 1020000,
    "tanggalTerbit": "2026-03-19",
    "tanggalJatuhTempo": "2026-04-22",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-015-RRI-PLB-PKS-F-04-2026",
    "klienId": "KLN-016",
    "nomor": "015/RRI.PLB/PKS.F/04/2026",
    "kontrakId": "3669/PKS/RRI.PLB/04/2026",
    "uraian": "Tagihan Dialog Interaktif Dalam Studio — 3669/PKS/RRI.PLB/04/2026",
    "nilai": 2000000,
    "tanggalTerbit": "2026-04-17",
    "tanggalJatuhTempo": "2026-05-21",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-016-RRI-PLB-PKS-F-04-2026",
    "klienId": "KLN-001",
    "nomor": "016/RRI.PLB/PKS.F/04/2026",
    "kontrakId": "3981/PKS/RRI.PLB/05/2026",
    "uraian": "Tagihan Siaran Iklan (Spot) — 3981/PKS/RRI.PLB/05/2026",
    "nilai": 270000,
    "tanggalTerbit": "2026-04-27",
    "tanggalJatuhTempo": "2026-06-05",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-017-RRI-PLB-PKS-F-05-2026",
    "klienId": "KLN-017",
    "nomor": "017/RRI.PLB/PKS.F/05/2026",
    "kontrakId": "4720/PKS/RRI.PLB/06/2026",
    "uraian": "Tagihan Sewa Lahan / BMN — 4720/PKS/RRI.PLB/06/2026",
    "nilai": 5320000,
    "tanggalTerbit": "2026-05-21",
    "tanggalJatuhTempo": "2026-05-24",
    "kodeAkun": "425131",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-018-RRI-PLB-PKS-F-05-2026",
    "klienId": "KLN-018",
    "nomor": "018/RRI.PLB/PKS.F/05/2026",
    "kontrakId": "4747/PKS/RRI.PLB/06/2026",
    "uraian": "Tagihan Instagram Reels — 4747/PKS/RRI.PLB/06/2026",
    "nilai": 200000,
    "tanggalTerbit": "2026-05-22",
    "tanggalJatuhTempo": "2026-06-24",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-019-RRI-PLB-PKS-F-05-2026",
    "klienId": "KLN-019",
    "nomor": "019/RRI.PLB/PKS.F/05/2026",
    "kontrakId": "4842/PKS/RRI.PLB/06/2026",
    "uraian": "Tagihan Siaran Iklan (Spot) — 4842/PKS/RRI.PLB/06/2026",
    "nilai": 4050000,
    "tanggalTerbit": "2026-05-26",
    "tanggalJatuhTempo": "2026-07-22",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-020-RRI-PLB-PKS-F-05-2026",
    "klienId": "KLN-020",
    "nomor": "020/RRI.PLB/PKS.F/05/2026",
    "kontrakId": "4873/PKS/RRI.PLB/06/2026",
    "uraian": "Tagihan Siaran Iklan (Spot) — 4873/PKS/RRI.PLB/06/2026",
    "nilai": 990000,
    "tanggalTerbit": "2026-05-29",
    "tanggalJatuhTempo": "2026-07-28",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-021-RRI-PLB-PKS-U-06-2026",
    "klienId": "KLN-021",
    "nomor": "021/RRI.PLB/PKS.U/06/2026",
    "kontrakId": "5350/PKS/RRI.PLB/06/2026",
    "uraian": "Tagihan Sewa Aula — 5350/PKS/RRI.PLB/06/2026",
    "nilai": 3056000,
    "tanggalTerbit": "2026-06-12",
    "tanggalJatuhTempo": "2026-06-14",
    "kodeAkun": "425131",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-022-RRI-PLB-PKS-F-06-2026",
    "klienId": "KLN-022",
    "nomor": "022/RRI.PLB/PKS.F/06/2026",
    "kontrakId": "5390/PKS/RRI.PLB/06/2026",
    "uraian": "Tagihan Greeting / Tanda Waktu (Time Signal) — 5390/PKS/RRI.PLB/06/2026",
    "nilai": 3500000,
    "tanggalTerbit": "2026-06-15",
    "tanggalJatuhTempo": "2026-07-15",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-023-RRI-PLB-PKS-F-06-2026",
    "klienId": "KLN-023",
    "nomor": "023/RRI.PLB/PKS.F/06/2026",
    "kontrakId": "5391/PKS/RRI.PLB/06/2026",
    "uraian": "Tagihan Ad-Lib / Jingle — 5391/PKS/RRI.PLB/06/2026",
    "nilai": 3500000,
    "tanggalTerbit": "2026-06-15",
    "tanggalJatuhTempo": "2026-07-16",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-024-RRI-PLB-PKS-F-06-2026",
    "klienId": "KLN-013",
    "nomor": "024/RRI.PLB/PKS.F/06/2026",
    "kontrakId": "5483/PKS/RRI.PLB/06/2026",
    "uraian": "Tagihan Siaran Iklan (Spot) — 5483/PKS/RRI.PLB/06/2026",
    "nilai": 4050000,
    "tanggalTerbit": "2026-06-18",
    "tanggalJatuhTempo": "2026-08-14",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-025-RRI-PLB-PKS-F-06-2026",
    "klienId": "KLN-012",
    "nomor": "025/RRI.PLB/PKS.F/06/2026",
    "kontrakId": "5484/PKS/RRI.PLB/06/2026",
    "uraian": "Tagihan Dialog Interaktif Dalam Studio — 5484/PKS/RRI.PLB/06/2026",
    "nilai": 2000000,
    "tanggalTerbit": "2026-06-18",
    "tanggalJatuhTempo": "2026-07-17",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-026-RRI-PLB-PKS-F-06-2026",
    "klienId": "KLN-012",
    "nomor": "026/RRI.PLB/PKS.F/06/2026",
    "kontrakId": "5592/PKS/RRI.PLB/06/2026",
    "uraian": "Tagihan Ad-Lib / Jingle — 5592/PKS/RRI.PLB/06/2026",
    "nilai": 1000000,
    "tanggalTerbit": "2026-06-19",
    "tanggalJatuhTempo": "2026-07-24",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-027-RRI-PLB-PKS-F-07-2026",
    "klienId": "KLN-024",
    "nomor": "027/RRI.PLB/PKS.F/07/2026",
    "kontrakId": "6593/PKS/RRI.PLB/07/2026",
    "uraian": "Tagihan Dialog Interaktif Dalam Studio — 6593/PKS/RRI.PLB/07/2026",
    "nilai": 2040000,
    "tanggalTerbit": "2026-07-17",
    "tanggalJatuhTempo": "2026-08-14",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-028-RRI-PLB-PKS-U-07-2026",
    "klienId": "KLN-025",
    "nomor": "028/RRI.PLB/PKS.U/07/2026",
    "kontrakId": "7051/PKS/RRI.PLB/07/2026",
    "uraian": "Tagihan Sewa Lahan / BMN — 7051/PKS/RRI.PLB/07/2026",
    "nilai": 6536000,
    "tanggalTerbit": "2026-07-31",
    "tanggalJatuhTempo": "2026-07-31",
    "kodeAkun": "425131",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-029-RRI-PLB-PKS-U-07-2026",
    "klienId": "KLN-026",
    "nomor": "029/RRI.PLB/PKS.U/07/2026",
    "kontrakId": "7052/PKS/RRI.PLB/07/2026",
    "uraian": "Tagihan Sewa Lahan / BMN — 7052/PKS/RRI.PLB/07/2026",
    "nilai": 7440000,
    "tanggalTerbit": "2026-07-31",
    "tanggalJatuhTempo": "2026-01-31",
    "kodeAkun": "425131",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-030-RRI-PLB-PKS-U-07-2026",
    "klienId": "KLN-026",
    "nomor": "030/RRI.PLB/PKS.U/07/2026",
    "kontrakId": "7053/PKS/RRI.PLB/07/2026",
    "uraian": "Tagihan Sewa Lahan / BMN — 7053/PKS/RRI.PLB/07/2026",
    "nilai": 12000000,
    "tanggalTerbit": "2026-07-31",
    "tanggalJatuhTempo": "2026-07-31",
    "kodeAkun": "425131",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-031-RRI-PLB-PKS-U-07-2026",
    "klienId": "KLN-027",
    "nomor": "031/RRI.PLB/PKS.U/07/2026",
    "kontrakId": "7054/PKS/RRI.PLB/07/2026",
    "uraian": "Tagihan Sewa Lahan / BMN — 7054/PKS/RRI.PLB/07/2026",
    "nilai": 9801321,
    "tanggalTerbit": "2026-07-31",
    "tanggalJatuhTempo": "2026-01-31",
    "kodeAkun": "425131",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-032-RRI-PLB-PKS-U-07-2026",
    "klienId": "KLN-027",
    "nomor": "032/RRI.PLB/PKS.U/07/2026",
    "kontrakId": "7055/PKS/RRI.PLB/07/2026",
    "uraian": "Tagihan Sewa Lahan / BMN — 7055/PKS/RRI.PLB/07/2026",
    "nilai": 15808583,
    "tanggalTerbit": "2026-07-31",
    "tanggalJatuhTempo": "2026-07-31",
    "kodeAkun": "425131",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-033-RRI-PLB-PKS-U-07-2026",
    "klienId": "KLN-028",
    "nomor": "033/RRI.PLB/PKS.U/07/2026",
    "kontrakId": "7060/PKS/RRI.PLB/07/2026",
    "uraian": "Tagihan Sewa Lahan / BMN — 7060/PKS/RRI.PLB/07/2026",
    "nilai": 5103840,
    "tanggalTerbit": "2026-07-31",
    "tanggalJatuhTempo": "2026-01-31",
    "kodeAkun": "425131",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-034-RRI-PLB-PKS-U-07-2026",
    "klienId": "KLN-028",
    "nomor": "034/RRI.PLB/PKS.U/07/2026",
    "kontrakId": "7061/PKS/RRI.PLB/07/2026",
    "uraian": "Tagihan Sewa Lahan / BMN — 7061/PKS/RRI.PLB/07/2026",
    "nilai": 8232000,
    "tanggalTerbit": "2026-07-31",
    "tanggalJatuhTempo": "2026-07-31",
    "kodeAkun": "425131",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-018-PKS-DIR-LPU-08-2026",
    "klienId": "KLN-029",
    "nomor": "018/PKS/DIR.LPU/08/2026",
    "kontrakId": "018/PKS/DIR.LPU/08/2026",
    "uraian": "Tagihan Siaran Iklan (Spot) — 018/PKS/DIR.LPU/08/2026",
    "nilai": 4110000,
    "tanggalTerbit": "2026-08-13",
    "tanggalJatuhTempo": "2026-12-31",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-035-RRI-PLB-PKS-F-09-2026",
    "klienId": "KLN-001",
    "nomor": "035/RRI.PLB/PKS.F/09/2026",
    "kontrakId": "1158/PKS/RRI.PLB/10/2026",
    "uraian": "Tagihan Siaran Iklan (Spot) — 1158/PKS/RRI.PLB/10/2026",
    "nilai": 180000,
    "tanggalTerbit": "2026-09-21",
    "tanggalJatuhTempo": "2026-10-23",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-036-RRI-PLB-PKS-F-10-2026",
    "klienId": "KLN-030",
    "nomor": "036/RRI.PLB/PKS.F/10/2026",
    "kontrakId": "10227/PKS/RRI.PLB/10/2026",
    "uraian": "Tagihan Siaran Iklan (Spot) — 10227/PKS/RRI.PLB/10/2026",
    "nilai": 2700000,
    "tanggalTerbit": "2026-10-12",
    "tanggalJatuhTempo": "2026-12-15",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-037-RRI-PLB-PKS-U-10-2026",
    "klienId": "KLN-031",
    "nomor": "037/RRI.PLB/PKS.U/10/2026",
    "kontrakId": "10828/PKS/RRI.PLB/10/2026",
    "uraian": "Tagihan Sewa Lahan / BMN — 10828/PKS/RRI.PLB/10/2026",
    "nilai": 132704000,
    "tanggalTerbit": "2026-10-16",
    "tanggalJatuhTempo": "2026-09-16",
    "kodeAkun": "425131",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-038-RRI-PLB-PKS-F-10-2026",
    "klienId": "KLN-016",
    "nomor": "038/RRI.PLB/PKS.F/10/2026",
    "kontrakId": "11290/PKS/RRI.PLB/10/2026",
    "uraian": "Tagihan Dialog Interaktif Dalam Studio — 11290/PKS/RRI.PLB/10/2026",
    "nilai": 2000000,
    "tanggalTerbit": "2026-10-29",
    "tanggalJatuhTempo": "2026-11-27",
    "kodeAkun": "425531",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-027-RRI-PLB-PKS-U-06-2025",
    "klienId": "KLN-032",
    "nomor": "027/RRI.PLB/PKS.U/06/2025",
    "kontrakId": "027/RRI.PLB/PKS.U/06/2025",
    "uraian": "Tagihan Sewa Lahan / BMN — 027/RRI.PLB/PKS.U/06/2025",
    "nilai": 22492500,
    "tanggalTerbit": "2025-06-20",
    "tanggalJatuhTempo": "2025-06-30",
    "kodeAkun": "425131",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "TGH-016-PKS-DIR-LPU-06-2025",
    "klienId": "KLN-033",
    "nomor": "016/PKS/DIR.LPU/06/2025",
    "kontrakId": "016/PKS/DIR.LPU/06/2025",
    "uraian": "Tagihan Sewa Lahan / BMN — 016/PKS/DIR.LPU/06/2025",
    "nilai": 34292500,
    "tanggalTerbit": "2025-06-26",
    "tanggalJatuhTempo": "2025-08-19",
    "kodeAkun": "425131",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  }
],
  pembayaran: [
  {
    "id": "BYR-001",
    "klienId": "KLN-001",
    "tagihanId": "TGH-001-RRI-PLB-PKS-F-01-2026",
    "tanggalBayar": "2026-02-05",
    "jumlah": 270000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260205527034 / NTPN 812AE3CIG6I7VVVQ",
    "penyetor": "PT PLN (Persero) UPT Palembang",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-002",
    "klienId": "KLN-002",
    "tagihanId": "TGH-001-PKS-DIR-LPU-01-2026",
    "tanggalBayar": "2026-03-27",
    "jumlah": 1550000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260325230579 / NTPN 0C5B68N3F644J1VJ",
    "penyetor": "PT Taspen (Persero)",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-003",
    "klienId": "KLN-003",
    "tagihanId": "TGH-002-RRI-PLB-PKS-U-01-2026",
    "tanggalBayar": "2026-01-30",
    "jumlah": 6455000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260129497246 / NTPN CB6262G50BTJ2O4U",
    "penyetor": "Aminul Khair",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-004",
    "klienId": "KLN-004",
    "tagihanId": "TGH-003-RRI-PLB-PKS-U-01-2026",
    "tanggalBayar": "2026-01-30",
    "jumlah": 6455000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260129495687 / NTPN 89BD96U8FGPH3MK7",
    "penyetor": "Meily Oktarina",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-005",
    "klienId": "KLN-005",
    "tagihanId": "TGH-004-RRI-PLB-PKS-U-01-2026",
    "tanggalBayar": "2026-01-30",
    "jumlah": 5648000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260129496383 / NTPN 6118C3CIG6FVFN9V",
    "penyetor": "Dierga Salomon Riezki, S.STP",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-006",
    "klienId": "KLN-006",
    "tagihanId": "TGH-005-RRI-PLB-PKS-U-02-2026",
    "tanggalBayar": "2026-02-10",
    "jumlah": 9199380,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260203188072 / NTPN 122D11JNGHDCUJR8",
    "penyetor": "Abdul Rozak Rusdy",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-007",
    "klienId": "KLN-007",
    "tagihanId": "TGH-006-RRI-PLB-PKS-U-02-2026",
    "tanggalBayar": "2026-02-10",
    "jumlah": 6536000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260210141875 / NTPN 1E33B61QVM9HJQLJ",
    "penyetor": "Assef Hidayat",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-008",
    "klienId": "KLN-008",
    "tagihanId": "TGH-007-RRI-PLB-PKS-F-02-2026",
    "tanggalBayar": "2026-06-26",
    "jumlah": 15000000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260625423701 / NTPN BF4407QLVBQMF7AL",
    "penyetor": "Dinas Komunikasi dan Informatika Kota Palembang",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-009",
    "klienId": "KLN-009",
    "tagihanId": "TGH-008-RRI-PLB-PKS-F-02-2026",
    "tanggalBayar": "2026-06-29",
    "jumlah": 5000000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260624221021 / NTPN FFEFB3CIG6UN9GQT",
    "penyetor": "Dinas Komunikasi dan Informatika Kabupaten Banyuasin",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-010",
    "klienId": "KLN-009",
    "tagihanId": "TGH-008-RRI-PLB-PKS-F-02-2026",
    "tanggalBayar": "2026-07-14",
    "jumlah": 300000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260714279343 / NTPN 3310555DFS65VSDF",
    "penyetor": "Dinas Komunikasi dan Informatika Kabupaten Banyuasin",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-011",
    "klienId": "KLN-010",
    "tagihanId": "TGH-009-RRI-PLB-PKS-F-02-2026",
    "tanggalBayar": "2026-04-22",
    "jumlah": 3000000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260422176512 / NTPN A58D86U8FH287JO0",
    "penyetor": "Dinas Komunikasi dan Informatika Kabupaten Musi Banyuasin",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-012",
    "klienId": "KLN-011",
    "tagihanId": "TGH-010-RRI-PLB-PKS-F-02-2026",
    "tanggalBayar": "2026-06-22",
    "jumlah": 7500000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260615730539 / NTPN B5E091JNGHPMCDBB",
    "penyetor": "Bank Sumsel Babel",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-013",
    "klienId": "KLN-011",
    "tagihanId": "TGH-010-RRI-PLB-PKS-F-02-2026",
    "tanggalBayar": "2026-07-14",
    "jumlah": 300000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260714279389 / NTPN 295C92G50CF0OSET",
    "penyetor": "Bank Sumsel Babel",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-014",
    "klienId": "KLN-012",
    "tagihanId": "TGH-011-RRI-PLB-PKS-F-02-2026",
    "tanggalBayar": "2026-05-13",
    "jumlah": 6200000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260513249583 / NTPN 0E7FA3CIG6RDEU9F",
    "penyetor": "Kantor Perwakilan Bank Indonesia Provinsi Sumatera Selatan",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-015",
    "klienId": "KLN-012",
    "tagihanId": "TGH-011-RRI-PLB-PKS-F-02-2026",
    "tanggalBayar": "2026-05-18",
    "jumlah": 124000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260513281865 / NTPN 40D6555DFS069TQ9",
    "penyetor": "Kantor Perwakilan Bank Indonesia Provinsi Sumatera Selatan",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-016",
    "klienId": "KLN-013",
    "tagihanId": "TGH-012-RRI-PLB-PKS-F-03-2026",
    "tanggalBayar": "2026-04-14",
    "jumlah": 4050000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260414967708 / NTPN 03EE67QLVBKDOJSS",
    "penyetor": "Kantor Pengawasan dan Pelayanan Bea dan Cukai TMP B Palembang",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-017",
    "klienId": "KLN-014",
    "tagihanId": "TGH-013-RRI-PLB-PKS-F-03-2026",
    "tanggalBayar": "2026-04-23",
    "jumlah": 1500000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260422245816 / NTPN BEEF23CIG6OMLNDO",
    "penyetor": "Dinas Komunikasi dan Informatika Kabupaten Ogan Komering Ulu Selatan",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-018",
    "klienId": "KLN-015",
    "tagihanId": "TGH-014-RRI-PLB-PKS-F-03-2026",
    "tanggalBayar": "2026-04-23",
    "jumlah": 1000000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260421045934 / NTPN F1A450NA0N1GA3LE",
    "penyetor": "Bank Syariah Indonesia KCP Kenten 2 Palembang",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-019",
    "klienId": "KLN-016",
    "tagihanId": "TGH-015-RRI-PLB-PKS-F-04-2026",
    "tanggalBayar": "2026-05-12",
    "jumlah": 2000000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260511902046 / NTPN 49A9C61QVMIHCQAU",
    "penyetor": "Kanwil DJP Sumatera Selatan dan Kepulauan Bangka Belitung",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-020",
    "klienId": "KLN-001",
    "tagihanId": "TGH-016-RRI-PLB-PKS-F-04-2026",
    "tanggalBayar": "2026-05-20",
    "jumlah": 270000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260520213970 / NTPN 699683CIG6RK3FEI",
    "penyetor": "PT PLN (Persero) UPT Palembang",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-021",
    "klienId": "KLN-017",
    "tagihanId": "TGH-017-RRI-PLB-PKS-F-05-2026",
    "tanggalBayar": "2026-05-20",
    "jumlah": 5320000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260520202181 / NTPN 130C50NA0N4ES3U5",
    "penyetor": "Arip",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-022",
    "klienId": "KLN-018",
    "tagihanId": "TGH-018-RRI-PLB-PKS-F-05-2026",
    "tanggalBayar": "2026-05-26",
    "jumlah": 200000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260526984443 / NTPN 8F2571JNGHN1O37R",
    "penyetor": "Savano Entertainment",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-023",
    "klienId": "KLN-019",
    "tagihanId": "TGH-019-RRI-PLB-PKS-F-05-2026",
    "tanggalBayar": "2026-06-14",
    "jumlah": 4050000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260611283732 / NTPN 138122G50CBUHMOK",
    "penyetor": "Yayasan Islam Al-Ittifaqiah",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-024",
    "klienId": "KLN-020",
    "tagihanId": "TGH-020-RRI-PLB-PKS-F-05-2026",
    "tanggalBayar": "2026-07-28",
    "jumlah": 990000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260728396050 / NTPN 4AA9049001K71M8I",
    "penyetor": "PT Sumber Alfaria Trijaya Tbk. Branch Palembang",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-025",
    "klienId": "KLN-021",
    "tagihanId": "TGH-021-RRI-PLB-PKS-U-06-2026",
    "tanggalBayar": "2026-06-12",
    "jumlah": 3056000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260611306342 / NTPN 7435B49001GNCCR6",
    "penyetor": "Dr. Jalaluddin, MPSA",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-026",
    "klienId": "KLN-022",
    "tagihanId": "TGH-022-RRI-PLB-PKS-F-06-2026",
    "tanggalBayar": "2026-07-07",
    "jumlah": 3500000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260707096830 / NTPN 56E4F7QLVBT4BM7U",
    "penyetor": "DPRD Kota Palembang",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-027",
    "klienId": "KLN-023",
    "tagihanId": "TGH-023-RRI-PLB-PKS-F-06-2026",
    "tanggalBayar": "2026-07-14",
    "jumlah": 3500000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260714274512 / NTPN A18170NA0NA7UNMG",
    "penyetor": "PT Medco E&P Indonesia",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-028",
    "klienId": "KLN-013",
    "tagihanId": "TGH-024-RRI-PLB-PKS-F-06-2026",
    "tanggalBayar": "2026-07-27",
    "jumlah": 4050000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260722488280 / NTPN 99C250NA0NAFPCUO",
    "penyetor": "Kantor Pengawasan dan Pelayanan Bea dan Cukai TMP B Palembang",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-029",
    "klienId": "KLN-012",
    "tagihanId": "TGH-025-RRI-PLB-PKS-F-06-2026",
    "tanggalBayar": "2026-07-16",
    "jumlah": 2000000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260716693693 / NTPN 987CB3CIG71FFI5T",
    "penyetor": "Kantor Perwakilan Bank Indonesia Provinsi Sumatera Selatan",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-030",
    "klienId": "KLN-012",
    "tagihanId": "TGH-026-RRI-PLB-PKS-F-06-2026",
    "tanggalBayar": "2026-07-02",
    "jumlah": 1000000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260629925295 / NTPN 3A85755DFS3LHJDF",
    "penyetor": "Kantor Perwakilan Bank Indonesia Provinsi Sumatera Selatan",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-031",
    "klienId": "KLN-024",
    "tagihanId": "TGH-027-RRI-PLB-PKS-F-07-2026",
    "tanggalBayar": "2026-09-14",
    "jumlah": 2000000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260914784821 / NTPN 96D411JNGI2JIQHL",
    "penyetor": "Perempuan Indonesia Maju (PIM)",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-032",
    "klienId": "KLN-025",
    "tagihanId": "TGH-028-RRI-PLB-PKS-U-07-2026",
    "tanggalBayar": "2026-07-17",
    "jumlah": 6536000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260716674372 / NTPN DCA0D2G50CF31VA4",
    "penyetor": "Faridah Hanum",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-033",
    "klienId": "KLN-026",
    "tagihanId": "TGH-029-RRI-PLB-PKS-U-07-2026",
    "tanggalBayar": "2026-07-30",
    "jumlah": 6000000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260730797865 / NTPN 5379561QVMP24VP9",
    "penyetor": "Fisol Jailani",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-034",
    "klienId": "KLN-026",
    "tagihanId": "TGH-030-RRI-PLB-PKS-U-07-2026",
    "tanggalBayar": "2026-07-30",
    "jumlah": 12000000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260730797898 / NTPN 8EC633CIG71STVQA",
    "penyetor": "Fisol Jailani",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-035",
    "klienId": "KLN-027",
    "tagihanId": "TGH-031-RRI-PLB-PKS-U-07-2026",
    "tanggalBayar": "2026-07-30",
    "jumlah": 7904292,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260730825245 / NTPN C4B4D49001K9BQGT",
    "penyetor": "Mila Agustina",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-036",
    "klienId": "KLN-027",
    "tagihanId": "TGH-032-RRI-PLB-PKS-U-07-2026",
    "tanggalBayar": "2026-07-30",
    "jumlah": 15808583,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260730825192 / NTPN 8CDED2G50CFGHQF8",
    "penyetor": "Mila Agustina",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-037",
    "klienId": "KLN-028",
    "tagihanId": "TGH-033-RRI-PLB-PKS-U-07-2026",
    "tanggalBayar": "2026-07-31",
    "jumlah": 4116000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260731072349 / NTPN DA11E61QVMP2DBQT",
    "penyetor": "Herman Sawiran",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-038",
    "klienId": "KLN-028",
    "tagihanId": "TGH-034-RRI-PLB-PKS-U-07-2026",
    "tanggalBayar": "2026-07-31",
    "jumlah": 8232000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260731072240 / NTPN AE21E55DFS6M0BNG",
    "penyetor": "Herman Sawiran",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-039",
    "klienId": "KLN-032",
    "tagihanId": "TGH-027-RRI-PLB-PKS-U-06-2025",
    "tanggalBayar": "2025-06-18",
    "jumlah": 11246250,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 121637827742 / NTPN 16BE648VVO6TD3E9",
    "penyetor": "Darojad",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-040",
    "klienId": "KLN-032",
    "tagihanId": "TGH-027-RRI-PLB-PKS-U-06-2025",
    "tanggalBayar": "2026-06-18",
    "jumlah": 11246250,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260618264146 / NTPN 9E2A11JNGHPOPNII",
    "penyetor": "Darojad",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-041",
    "klienId": "KLN-033",
    "tagihanId": "TGH-016-PKS-DIR-LPU-06-2025",
    "tanggalBayar": "2025-07-01",
    "jumlah": 17146250,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 271823198897 / NTPN 28611JNG8I74UDF",
    "penyetor": "PT VGreen Global Charging Station Investment Indonesia",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-042",
    "klienId": "KLN-033",
    "tagihanId": "TGH-016-PKS-DIR-LPU-06-2025",
    "tanggalBayar": "2026-08-13",
    "jumlah": 17146250,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820260812804390 / NTPN A49300NA0ND5TK96",
    "penyetor": "PT VGreen Global Charging Station Investment Indonesia",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-043",
    "klienId": "KLN-001",
    "tagihanId": "TGH-035-RRI-PLB-PKS-F-09-2026",
    "tanggalBayar": "2026-10-07",
    "jumlah": 180000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820261007582400 / NTPN 8182F2G50CNOFP60",
    "penyetor": "PT PLN (Persero) UPT Palembang",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-044",
    "klienId": "KLN-024",
    "tagihanId": "TGH-027-RRI-PLB-PKS-F-07-2026",
    "tanggalBayar": "2026-10-13",
    "jumlah": 40000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820261012368839 / NTPN 9C09D7QLVC67FRE7",
    "penyetor": "Perempuan Indonesia Maju (PIM)",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "BYR-045",
    "klienId": "KLN-031",
    "tagihanId": "TGH-037-RRI-PLB-PKS-U-10-2026",
    "tanggalBayar": "2026-10-16",
    "jumlah": 132704000,
    "metode": "Transfer Bank",
    "buktiSetor": "NTB 820261012367367 / NTPN A6EBE7QLVC67FQ07",
    "penyetor": "Samdini",
    "statusVerifikasi": "Terverifikasi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  }
],
  denda: [
  {
    "id": "DND-001",
    "klienId": "KLN-002",
    "tagihanId": "TGH-001-PKS-DIR-LPU-01-2026",
    "dasar": "Terlambat 9 hari dari jatuh tempo; denda Rp0 — Tidak Dikenakan Denda (per sumber).",
    "jumlah": 0,
    "status": "Dihapus",
    "kodeAkun": "425839",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "DND-002",
    "klienId": "KLN-006",
    "tagihanId": "TGH-005-RRI-PLB-PKS-U-02-2026",
    "dasar": "Terlambat 10 hari (jatuh tempo 2026-01-31, dibayar 2026-02-10); Terlambang Melakukan Pembayaran | SPn-1",
    "jumlah": 180380,
    "status": "Dibayar",
    "kodeAkun": "425839",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "DND-003",
    "klienId": "KLN-008",
    "tagihanId": "TGH-007-RRI-PLB-PKS-F-02-2026",
    "dasar": "Terlambat 65 hari (jatuh tempo 2026-04-22, dibayar 2026-06-26); Terlambang Melakukan Pembayaran | SPn-3",
    "jumlah": 900000,
    "status": "Ditagihkan",
    "kodeAkun": "425839",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "DND-004",
    "klienId": "KLN-009",
    "tagihanId": "TGH-008-RRI-PLB-PKS-F-02-2026",
    "dasar": "Terlambat 68 hari (jatuh tempo 2026-04-22, dibayar 2026-06-29); Terlambang Melakukan Pembayaran | SPn-3",
    "jumlah": 300000,
    "status": "Dibayar",
    "kodeAkun": "425839",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "DND-005",
    "klienId": "KLN-011",
    "tagihanId": "TGH-010-RRI-PLB-PKS-F-02-2026",
    "dasar": "Terlambat 61 hari (jatuh tempo 2026-04-22, dibayar 2026-06-22); Terlambang Melakukan Pembayaran | SPn-2",
    "jumlah": 300000,
    "status": "Dibayar",
    "kodeAkun": "425839",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "DND-006",
    "klienId": "KLN-012",
    "tagihanId": "TGH-011-RRI-PLB-PKS-F-02-2026",
    "dasar": "Terlambat 21 hari (jatuh tempo 2026-04-22, dibayar 2026-05-13); Terlambang Melakukan Pembayaran | SPn-1",
    "jumlah": 124000,
    "status": "Dibayar",
    "kodeAkun": "425839",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "DND-007",
    "klienId": "KLN-014",
    "tagihanId": "TGH-013-RRI-PLB-PKS-F-03-2026",
    "dasar": "Terlambat 1 hari (jatuh tempo 2026-04-22, dibayar 2026-04-23); Terlambang Melakukan Pembayaran | SPn-1",
    "jumlah": 30000,
    "status": "Ditagihkan",
    "kodeAkun": "425839",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "DND-008",
    "klienId": "KLN-015",
    "tagihanId": "TGH-014-RRI-PLB-PKS-F-03-2026",
    "dasar": "Terlambat 1 hari (jatuh tempo 2026-04-22, dibayar 2026-04-23); Terlambang Melakukan Pembayaran | SPn-1",
    "jumlah": 20000,
    "status": "Ditagihkan",
    "kodeAkun": "425839",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "DND-009",
    "klienId": "KLN-024",
    "tagihanId": "TGH-027-RRI-PLB-PKS-F-07-2026",
    "dasar": "Terlambat 31 hari (jatuh tempo 2026-08-14, dibayar 2026-09-14); Keterlambatan Pembayaran | SPn-1",
    "jumlah": 40000,
    "status": "Dibayar",
    "kodeAkun": "425839",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "DND-010",
    "klienId": "KLN-026",
    "tagihanId": "TGH-029-RRI-PLB-PKS-U-07-2026",
    "dasar": "Terlambat 180 hari (jatuh tempo 2026-01-31, dibayar 2026-07-30); Keterlambatan Pembayaran | SPn-6",
    "jumlah": 1440000,
    "status": "Ditagihkan",
    "kodeAkun": "425839",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "DND-011",
    "klienId": "KLN-027",
    "tagihanId": "TGH-031-RRI-PLB-PKS-U-07-2026",
    "dasar": "Terlambat 180 hari (jatuh tempo 2026-01-31, dibayar 2026-07-30); Keterlambatan Pembayaran | SPn-6",
    "jumlah": 1897030,
    "status": "Ditagihkan",
    "kodeAkun": "425839",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "DND-012",
    "klienId": "KLN-028",
    "tagihanId": "TGH-033-RRI-PLB-PKS-U-07-2026",
    "dasar": "Terlambat 181 hari (jatuh tempo 2026-01-31, dibayar 2026-07-31); Keterlambatan Pembayaran | SPn-6",
    "jumlah": 987840,
    "status": "Ditagihkan",
    "kodeAkun": "425839",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  }
],
  sewa: [
  {
    "id": "SW-001-RRI-PLB-PKS-F-02-2025",
    "aset": "Sewa Menara — Menara untuk Penempatan Perangkat (-)",
    "lokasi": "Kantor RRI Palembang",
    "penyewaNama": "PT Indosat Tbk",
    "nomorPerjanjian": "001/RRI.PLB/PKS.F/02/2025",
    "tanggalMulai": "2024-12-21",
    "tanggalSelesai": "2027-12-20",
    "nilaiSewa": 524700000,
    "status": "ON GOING",
    "diterimaDiMuka": 306075000,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2024-12-21",
        "nilai": 524700000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-026-RRI-PLB-PKS-U-06-2025",
    "aset": "Sewa Lahan — Bengkel Motor (150m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Herman Sawiran",
    "nomorPerjanjian": "026/RRI.PLB/PKS.U/06/2025",
    "tanggalMulai": "2025-03-01",
    "tanggalSelesai": "2026-01-31",
    "nilaiSewa": 8232000,
    "status": "Berakhir",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2024-03-01",
        "nilai": 6435000
      },
      {
        "tanggalBerlaku": "2025-03-01",
        "nilai": 8232000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-010-RRI-PLB-PKS-U-03-2025",
    "aset": "Sewa Lahan — (tujuan tidak tertulis) (300m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Sahara Al Fatiara Rozak",
    "nomorPerjanjian": "010/RRI.PLB/PKS.U/03/2025",
    "tanggalMulai": "2025-03-23",
    "tanggalSelesai": "2026-03-22",
    "nilaiSewa": 11159000,
    "status": "Berakhir",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2025-03-23",
        "nilai": 11159000
      },
      {
        "tanggalBerlaku": "2026-01-01",
        "nilai": 18119000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-015-RRI-PLB-PKS-U-03-2025",
    "aset": "Sewa Lahan — Komunitas Pemanah (3500m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Muhammad Theodosius El Abqo",
    "nomorPerjanjian": "015/RRI.PLB/PKS.U/03/2025",
    "tanggalMulai": "2025-03-27",
    "tanggalSelesai": "2026-03-26",
    "nilaiSewa": 1283000,
    "status": "Berakhir",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2025-03-27",
        "nilai": 1283000
      },
      {
        "tanggalBerlaku": "2026-01-01",
        "nilai": 3954000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-012-RRI-PLB-PKS-U-03-2025",
    "aset": "Sewa Lahan — Toko Listrik (80m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Aminul Khair",
    "nomorPerjanjian": "012/RRI.PLB/PKS.U/03/2025",
    "tanggalMulai": "2025-04-05",
    "tanggalSelesai": "2026-01-31",
    "nilaiSewa": 4667000,
    "status": "Berakhir",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2025-04-05",
        "nilai": 4667000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-013-RRI-PLB-PKS-U-03-2025",
    "aset": "Sewa Lahan — Rental Playstation (70m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Dierga Salomon Riezki, S.STP",
    "nomorPerjanjian": "013/RRI.PLB/PKS.U/03/2025",
    "tanggalMulai": "2025-04-05",
    "tanggalSelesai": "2026-01-31",
    "nilaiSewa": 4084000,
    "status": "Berakhir",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2025-04-05",
        "nilai": 4084000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-014-RRI-PLB-PKS-U-03-2025",
    "aset": "Sewa Lahan — Toko Perlengkapan Bayi (80m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Meily Oktarina",
    "nomorPerjanjian": "014/RRI.PLB/PKS.U/03/2025",
    "tanggalMulai": "2025-04-05",
    "tanggalSelesai": "2026-01-31",
    "nilaiSewa": 4667000,
    "status": "Berakhir",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2023-04-05",
        "nilai": 11518000
      },
      {
        "tanggalBerlaku": "2024-04-05",
        "nilai": 7545000
      },
      {
        "tanggalBerlaku": "2025-04-05",
        "nilai": 4667000
      }
    ],
    "temuan": [
      {
        "tanggal": "2026-11-14",
        "uraian": "- Ketidaksesuaian luas lahan yang disewa, luas lahan yang digunakan 260m2\n- Penyewa menyewakan kembali ke pihak ke-3 yakni Toko Listrik sebesar Rp17.000.000,- dan Rental PS sebesar Rp20.000.000.-\n- Melakukan pembangunan tambahan tanpa menginformasikan ke RRI",
        "tindakLanjut": "Pergantian Atas perobohan Pagar",
        "status": "Dalam Tindak Lanjut"
      }
    ],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-019-RRI-PLB-PKS-U-04-2025",
    "aset": "Sewa Lahan — Jual Beli Velg & Ban Baru & Bekas, Spooring & Balancing Mobil (300m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Nirmalan",
    "nomorPerjanjian": "019/RRI.PLB/PKS.U/04/2025",
    "tanggalMulai": "2025-04-26",
    "tanggalSelesai": "2028-01-31",
    "nilaiSewa": 46590000,
    "status": "ON GOING",
    "diterimaDiMuka": 31060000,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2024-04-26",
        "nilai": 12000000
      },
      {
        "tanggalBerlaku": "2024-08-14",
        "nilai": 8884000
      },
      {
        "tanggalBerlaku": "2025-04-26",
        "nilai": 46590000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-021-RRI-PLB-PKS-U-04-2025",
    "aset": "Sewa Lahan — Lapangan Sepakbola (8970m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Amir Syarifuddin",
    "nomorPerjanjian": "021/RRI.PLB/PKS.U/04/2025",
    "tanggalMulai": "2025-05-01",
    "tanggalSelesai": "2028-03-31",
    "nilaiSewa": 9593000,
    "status": "ON GOING",
    "diterimaDiMuka": 6852143,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2025-05-01",
        "nilai": 9593000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-020-RRI-PLB-PKS-U-04-2025",
    "aset": "Sewa Lahan — Jual Gorengan (17,5m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Sudani",
    "nomorPerjanjian": "020/RRI.PLB/PKS.U/04/2025",
    "tanggalMulai": "2025-05-01",
    "tanggalSelesai": "2028-03-31",
    "nilaiSewa": 3833000,
    "status": "ON GOING",
    "diterimaDiMuka": 2737857,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2025-05-01",
        "nilai": 3833000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-030-RRI-PLB-PKS-U-06-2025",
    "aset": "Sewa Lahan — Toko Bahan Bangunan (750m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Ahmad Sobirin",
    "nomorPerjanjian": "030/RRI.PLB/PKS.U/06/2025",
    "tanggalMulai": "2025-06-27",
    "tanggalSelesai": "2027-01-31",
    "nilaiSewa": 50012000,
    "status": "ON GOING",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 33341333,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2023-06-27",
        "nilai": 21170000
      },
      {
        "tanggalBerlaku": "2024-06-27",
        "nilai": 21552000
      },
      {
        "tanggalBerlaku": "2025-06-27",
        "nilai": 50012000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-027-RRI-PLB-PKS-U-06-2025",
    "aset": "Sewa Lahan — Toko Kelontong,\nJasa Pengiriman\ndan Warung\nPempek (150m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Darojad",
    "nomorPerjanjian": "027/RRI.PLB/PKS.U/06/2025",
    "tanggalMulai": "2025-07-01",
    "tanggalSelesai": "2028-06-30",
    "nilaiSewa": 33738750,
    "status": "ON GOING",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2025-07-01",
        "nilai": 33738750
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "kontrakId": "027/RRI.PLB/PKS.U/06/2025"
  },
  {
    "id": "SW-016-PKS-DIR-LPU-06-2025",
    "aset": "Sewa Lahan — Stasiun Pengisian Bahan Bakar Listrik (12,5m2)",
    "lokasi": "Halaman Kantor RRI Palembang",
    "penyewaNama": "PT VGreen Global Charging Station Investment Indonesia",
    "nomorPerjanjian": "016/PKS/DIR.LPU/06/2025",
    "tanggalMulai": "2025-08-20",
    "tanggalSelesai": "2028-08-20",
    "nilaiSewa": 51438750,
    "status": "ON GOING",
    "diterimaDiMuka": 40007917,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2025-08-20",
        "nilai": 51438750
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "kontrakId": "016/PKS/DIR.LPU/06/2025"
  },
  {
    "id": "SW-047-RRI-PLB-PKS-U-11-2025",
    "aset": "Sewa Lahan — Berkebun, Beternak Kambing & Ayam dan Kolam Pancing (17300m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Abdul Rozak Rusdy",
    "nomorPerjanjian": "047/RRI.PLB/PKS.U/11/2025",
    "tanggalMulai": "2025-09-01",
    "tanggalSelesai": "2026-01-31",
    "nilaiSewa": 3006000,
    "status": "Berakhir",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2024-09-01",
        "nilai": 10222000
      },
      {
        "tanggalBerlaku": "2025-09-01",
        "nilai": 3006000
      }
    ],
    "temuan": [
      {
        "tanggal": "2026-11-14",
        "uraian": "- Melakukan penebangan pohon tanpa laporan atas pohon yang sudah ditebang\n- Melakukan pengerukan tanah tanpa izin dari RRI untuk keperluan kolam ikan\n- Kolam ikan tidak termasuk dalam izin yang diberikan yang hanya Peternakan & Perkebunan\n- Kolam ikan berpotensi menjadi komersial apabila dibuka menjadi Kolam Pemancingan Umum",
        "tindakLanjut": "Bank Guarantee terkait pengerukan tanah",
        "status": "Dalam Tindak Lanjut"
      }
    ],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-048-RRI-PLB-PKS-U-11-2025",
    "aset": "Sewa Lahan — Warung Makan & Rental Playstation (425m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Mila Agustina",
    "nomorPerjanjian": "048/RRI.PLB/PKS.U/11/2025",
    "tanggalMulai": "2025-09-01",
    "tanggalSelesai": "2026-01-31",
    "nilaiSewa": 7867000,
    "status": "Berakhir",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2024-09-01",
        "nilai": 14497000
      },
      {
        "tanggalBerlaku": "2025-09-01",
        "nilai": 7867000
      }
    ],
    "temuan": [
      {
        "tanggal": "2026-11-14",
        "uraian": "- Melakukan transaksi pemindahtanganan lahan tanpa sepengetahuan & izin dari RRI\n- Terjadi perubahan luas lahan yang sudah ditetapkan",
        "tindakLanjut": "Tidak dipermasalahkan apabila menambah usaha selama masalah sendiri",
        "status": "Dalam Tindak Lanjut"
      }
    ],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-037-RRI-PLB-PKS-U-09-2025",
    "aset": "Sewa Lahan — Warung Pecel Lele (192,5m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Kasir",
    "nomorPerjanjian": "037/RRI.PLB/PKS.U/09/2025",
    "tanggalMulai": "2025-09-17",
    "tanggalSelesai": "2027-01-31",
    "nilaiSewa": 15178000,
    "status": "Bermasalah",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2022-09-01",
        "nilai": 8250000
      },
      {
        "tanggalBerlaku": "2023-09-01",
        "nilai": 8291000
      },
      {
        "tanggalBerlaku": "2024-09-17",
        "nilai": 8382000
      },
      {
        "tanggalBerlaku": "2025-09-17",
        "nilai": 15178000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-036-RRI-PLB-PKS-U-09-2025",
    "aset": "Sewa Lahan — Warung Sembako, Warung Nasi, Toko Pakan Ternak, Minuman Manis & Jasa Cuci Motor (399,5m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Ricardo Nopriansa",
    "nomorPerjanjian": "036/RRI.PLB/PKS.U/09/2025",
    "tanggalMulai": "2025-09-17",
    "tanggalSelesai": "2027-01-31",
    "nilaiSewa": 26252000,
    "status": "Bermasalah",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2022-09-01",
        "nilai": 14107500
      },
      {
        "tanggalBerlaku": "2023-09-01",
        "nilai": 14497000
      },
      {
        "tanggalBerlaku": "2024-09-17",
        "nilai": 14799000
      },
      {
        "tanggalBerlaku": "2025-09-17",
        "nilai": 26252000
      }
    ],
    "temuan": [
      {
        "tanggal": "2026-11-14",
        "uraian": "- Penyewa diduga menyewakan kembali ke pihak ke-3, yakni Usaha Gorengan, Usaha Minuman Manis, Usaha Warung Makan, Usaha PetShop, pihak ke-3 tidak mengakui bahwa mereka menyewa tapi hanya menumpang dan tidak memberikan informasi biaya sewa yang mereka bayar\n- untuk Usaha Gorengan diduga menempati lahan diluar lokasi yang disewa Ricardo Nopriansa\n- Terdapat tanaman yang dipagari disamping lahan yang disewa Ricardo Nopriansa",
        "tindakLanjut": "",
        "status": "Dalam Tindak Lanjut"
      }
    ],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-040-RRI-PLB-PKS-U-09-2025",
    "aset": "Sewa Lahan — Kebun Singkong & Sayur (47ha)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Samdini",
    "nomorPerjanjian": "040/RRI.PLB/PKS.U/09/2025",
    "tanggalMulai": "2025-09-17",
    "tanggalSelesai": "2026-09-16",
    "nilaiSewa": 118150000,
    "status": "Berakhir",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2024-09-17",
        "nilai": 115757000
      },
      {
        "tanggalBerlaku": "2025-09-17",
        "nilai": 118150000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-041-RRI-PLB-PKS-U-09-2025",
    "aset": "Sewa Lahan — Depot Gas & Air Minum (210m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Fisol Jailani",
    "nomorPerjanjian": "041/RRI.PLB/PKS.U/09/2025",
    "tanggalMulai": "2025-10-01",
    "tanggalSelesai": "2026-01-31",
    "nilaiSewa": 4140000,
    "status": "Berakhir",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2024-10-01",
        "nilai": 11816000
      },
      {
        "tanggalBerlaku": "2025-10-01",
        "nilai": 4140000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-050-RRI-PLB-PKS-U-11-2025",
    "aset": "Sewa Lahan — Warung Makan & Rental Playstation (12m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Nanik Wahyunita",
    "nomorPerjanjian": "050/RRI.PLB/PKS.U/11/2025",
    "tanggalMulai": "2025-11-17",
    "tanggalSelesai": "2026-11-16",
    "nilaiSewa": 2517000,
    "status": "ON GOING",
    "diterimaDiMuka": 1468250,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2025-11-17",
        "nilai": 2517000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-052-RRI-PLB-PKS-U-12-2025",
    "aset": "Sewa Lahan — Jasa Tambal Ban (425m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Binsar Sinambela",
    "nomorPerjanjian": "052/RRI.PLB/PKS.U/12/2025",
    "tanggalMulai": "2025-12-03",
    "tanggalSelesai": "2026-12-02",
    "nilaiSewa": 8566000,
    "status": "ON GOING",
    "diterimaDiMuka": 6424500,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2022-12-03",
        "nilai": 6995000
      },
      {
        "tanggalBerlaku": "2023-12-03",
        "nilai": 7225000
      },
      {
        "tanggalBerlaku": "2024-12-03",
        "nilai": 8232000
      },
      {
        "tanggalBerlaku": "2025-12-03",
        "nilai": 8566000
      }
    ],
    "temuan": [
      {
        "tanggal": "2026-11-14",
        "uraian": "Keterlambatan Pembayaran Setiap Tahun",
        "tindakLanjut": "Keterlambatan",
        "status": "Dalam Tindak Lanjut"
      }
    ],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-053-RRI-PLB-PKS-U-12-2025",
    "aset": "Sewa Lahan — Usaha Tanaman Hias (425m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "SR. Sihotang",
    "nomorPerjanjian": "053/RRI.PLB/PKS.U/12/2025",
    "tanggalMulai": "2025-12-03",
    "tanggalSelesai": "2026-12-02",
    "nilaiSewa": 10908000,
    "status": "ON GOING",
    "diterimaDiMuka": 8181000,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2022-12-03",
        "nilai": 10492000
      },
      {
        "tanggalBerlaku": "2023-12-03",
        "nilai": 10581000
      },
      {
        "tanggalBerlaku": "2024-12-03",
        "nilai": 10639000
      },
      {
        "tanggalBerlaku": "2025-12-03",
        "nilai": 10908000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-055-RRI-PLB-PKS-U-12-2025",
    "aset": "Sewa Lahan — Bengkel Las (250m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Subhan",
    "nomorPerjanjian": "055/RRI.PLB/PKS.U/12/2025",
    "tanggalMulai": "2025-12-11",
    "tanggalSelesai": "2027-01-31",
    "nilaiSewa": 14837000,
    "status": "Bermasalah",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2024-12-11",
        "nilai": 10962000
      },
      {
        "tanggalBerlaku": "2025-12-11",
        "nilai": 14837000
      }
    ],
    "temuan": [
      {
        "tanggal": "2026-11-14",
        "uraian": "- Melakukan transaksi pemindahtanganan lahan tanpa sepengetahuan & izin dari RRI\n- Ketidaksesuaian luas lahan yang disewa, luas lahan yang digunakan 220m2",
        "tindakLanjut": "",
        "status": "Dalam Tindak Lanjut"
      }
    ],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-054-RRI-PLB-PKS-U-12-2025",
    "aset": "Sewa Lahan — Warung Makanan (100m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Efran Valuphy",
    "nomorPerjanjian": "054/RRI.PLB/PKS.U/12/2025",
    "tanggalMulai": "2025-12-25",
    "tanggalSelesai": "2026-12-24",
    "nilaiSewa": 4578000,
    "status": "ON GOING",
    "diterimaDiMuka": 381500,
    "masihHarusDiterima": 3052000,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2025-12-25",
        "nilai": 4578000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-056-RRI-PLB-PKS-U-12-2025",
    "aset": "Sewa Lahan — Jasa Laundry (100m2)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Nehwa Atmojo",
    "nomorPerjanjian": "056/RRI.PLB/PKS.U/12/2025",
    "tanggalMulai": "2025-12-29",
    "tanggalSelesai": "2026-12-28",
    "nilaiSewa": 6536000,
    "status": "ON GOING",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 4357333,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2025-12-29",
        "nilai": 6536000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-3580-PKS-RRI-PLB-02-2026",
    "aset": "Lahan — Berkebun, Beternak Kambing & Ayam dan Kolam Pancing (17300m2)",
    "lokasi": "Pemancar RRI Palembang di Indralaya",
    "penyewaNama": "Abdul Rozak Rusdy",
    "nomorPerjanjian": "3580/PKS/RRI.PLB/02/2026",
    "tanggalMulai": "2026-02-01",
    "tanggalSelesai": "2027-01-31",
    "nilaiSewa": 9019000,
    "status": "Bermasalah",
    "diterimaDiMuka": 7515833,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2024-09-01",
        "nilai": 10222000
      },
      {
        "tanggalBerlaku": "2025-09-01",
        "nilai": 3006000
      },
      {
        "tanggalBerlaku": "2026-02-01",
        "nilai": 9019000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "kontrakId": "1494/PKS/RRI.PLB/02/2026"
  },
  {
    "id": "SW-3152-PKS-RRI-PLB-02-2026",
    "aset": "Lahan — Toko Listrik (80m2)",
    "lokasi": "Pemancar RRI Palembang di Indralaya",
    "penyewaNama": "Aminul Khair",
    "nomorPerjanjian": "3152/PKS/RRI.PLB/02/2026",
    "tanggalMulai": "2026-02-01",
    "tanggalSelesai": "2029-01-31",
    "nilaiSewa": 19365000,
    "status": "ON GOING",
    "diterimaDiMuka": 18289167,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2025-04-05",
        "nilai": 4667000
      },
      {
        "tanggalBerlaku": "2026-02-01",
        "nilai": 19365000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "kontrakId": "1051/PKS/RRI.PLB/02/2026"
  },
  {
    "id": "SW-3161-PKS-RRI-PLB-02-2026",
    "aset": "Lahan — Rental Play Station (70m2)",
    "lokasi": "Pemancar RRI Palembang di Indralaya",
    "penyewaNama": "Dierga Salomon Riezki, S.STP",
    "nomorPerjanjian": "3161/PKS/RRI.PLB/02/2026",
    "tanggalMulai": "2026-02-01",
    "tanggalSelesai": "2029-01-31",
    "nilaiSewa": 16944000,
    "status": "ON GOING",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2025-04-05",
        "nilai": 4084000
      },
      {
        "tanggalBerlaku": "2026-02-01",
        "nilai": 16944000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "kontrakId": "1053/PKS/RRI.PLB/02/2026"
  },
  {
    "id": "SW-7052-PKS-RRI-PLB-07-2026",
    "aset": "Lahan — Depot Gas & Air Minum (210m2)",
    "lokasi": "Pemancar RRI Palembang di Indralaya",
    "penyewaNama": "Fisol Jailani",
    "nomorPerjanjian": "7052/PKS/RRI.PLB/07/2026",
    "tanggalMulai": "2026-02-01",
    "tanggalSelesai": "2026-07-31",
    "nilaiSewa": 6000000,
    "status": "Berakhir",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2024-10-01",
        "nilai": 11816000
      },
      {
        "tanggalBerlaku": "2025-10-01",
        "nilai": 4140000
      },
      {
        "tanggalBerlaku": "2026-02-01",
        "nilai": 6000000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "kontrakId": "7052/PKS/RRI.PLB/07/2026"
  },
  {
    "id": "SW-7060-PKS-RRI-PLB-07-2026",
    "aset": "Lahan — Bengkel Motor & Stan Minuman (150m2)",
    "lokasi": "Pemancar RRI Palembang di Indralaya",
    "penyewaNama": "Herman Sawiran",
    "nomorPerjanjian": "7060/PKS/RRI.PLB/07/2026",
    "tanggalMulai": "2026-02-01",
    "tanggalSelesai": "2026-07-31",
    "nilaiSewa": 4116000,
    "status": "Berakhir",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2024-03-01",
        "nilai": 6435000
      },
      {
        "tanggalBerlaku": "2025-03-01",
        "nilai": 8232000
      },
      {
        "tanggalBerlaku": "2026-02-01",
        "nilai": 4116000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "kontrakId": "7060/PKS/RRI.PLB/07/2026"
  },
  {
    "id": "SW-3160-PKS-RRI-PLB-02-2026",
    "aset": "Lahan — Toko Perlengkapan Bayi (80m2)",
    "lokasi": "Pemancar RRI Palembang di Indralaya",
    "penyewaNama": "Meily Oktarina",
    "nomorPerjanjian": "3160/PKS/RRI.PLB/02/2026",
    "tanggalMulai": "2026-02-01",
    "tanggalSelesai": "2029-01-31",
    "nilaiSewa": 19365000,
    "status": "ON GOING",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2023-04-05",
        "nilai": 11518000
      },
      {
        "tanggalBerlaku": "2024-04-05",
        "nilai": 7545000
      },
      {
        "tanggalBerlaku": "2025-04-05",
        "nilai": 4667000
      },
      {
        "tanggalBerlaku": "2026-02-01",
        "nilai": 19365000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "kontrakId": "1052/PKS/RRI.PLB/02/2026"
  },
  {
    "id": "SW-7054-PKS-RRI-PLB-07-2026",
    "aset": "Lahan — Warung Makan & Rental Play Station (425m2)",
    "lokasi": "Pemancar RRI Palembang di Indralaya",
    "penyewaNama": "Mila Agustina",
    "nomorPerjanjian": "7054/PKS/RRI.PLB/07/2026",
    "tanggalMulai": "2026-02-01",
    "tanggalSelesai": "2026-07-31",
    "nilaiSewa": 7904292,
    "status": "Berakhir",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2024-09-01",
        "nilai": 14497000
      },
      {
        "tanggalBerlaku": "2025-09-01",
        "nilai": 7867000
      },
      {
        "tanggalBerlaku": "2026-02-01",
        "nilai": 7904292
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "kontrakId": "7054/PKS/RRI.PLB/07/2026"
  },
  {
    "id": "SW-3607-PKS-RRI-PLB-02-2026",
    "aset": "Lahan — Warung  Sarapan Pagi & Es Teh (100m2)",
    "lokasi": "Pemancar RRI Palembang di Indralaya",
    "penyewaNama": "Assef Hidayat",
    "nomorPerjanjian": "3607/PKS/RRI.PLB/02/2026",
    "tanggalMulai": "2026-02-11",
    "tanggalSelesai": "2027-02-10",
    "nilaiSewa": 6536000,
    "status": "ON GOING",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2023-03-08",
        "nilai": 8860000
      },
      {
        "tanggalBerlaku": "2026-02-11",
        "nilai": 6536000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "kontrakId": "1497/PKS/RRI.PLB/02/2026"
  },
  {
    "id": "SW-7293-PKS-RRI-PLB-06-2026",
    "aset": "Lahan — Layanan Jasa Keuangan BRILink & Agen Mandiri (90m2)",
    "lokasi": "Pemancar RRI Palembang di Indralaya",
    "penyewaNama": "Arip",
    "nomorPerjanjian": "7293/PKS/RRI.PLB/06/2026",
    "tanggalMulai": "2026-05-22",
    "tanggalSelesai": "2027-05-21",
    "nilaiSewa": 5320000,
    "status": "ON GOING",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2026-05-22",
        "nilai": 5320000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "kontrakId": "4720/PKS/RRI.PLB/06/2026"
  },
  {
    "id": "SW-5350-PKS-RRI-PLB-06-2026",
    "aset": "Aula — Penyelenggaraan Kegiatan Olimpiade Mental Aritmatika dan Wisuda ASMA (299,4m2)",
    "lokasi": "Kantor RRI Palembang",
    "penyewaNama": "Dr. Jalaluddin, MPSA",
    "nomorPerjanjian": "5350/PKS/RRI.PLB/06/2026",
    "tanggalMulai": "2026-06-14",
    "tanggalSelesai": "2026-06-14",
    "nilaiSewa": 3056000,
    "status": "Berakhir",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2025-09-21",
        "nilai": 3056000
      },
      {
        "tanggalBerlaku": "2026-06-14",
        "nilai": 3056000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "kontrakId": "5350/PKS/RRI.PLB/06/2026"
  },
  {
    "id": "SW-7051-PKS-RRI-PLB-07-2026",
    "aset": "Lahan — Barbershop (100m2)",
    "lokasi": "Pemancar RRI Palembang di Indralaya",
    "penyewaNama": "Faridah Hanum",
    "nomorPerjanjian": "7051/PKS/RRI.PLB/07/2026",
    "tanggalMulai": "2026-08-01",
    "tanggalSelesai": "2027-07-31",
    "nilaiSewa": 6536000,
    "status": "ON GOING",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2026-08-01",
        "nilai": 6536000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "kontrakId": "7051/PKS/RRI.PLB/07/2026"
  },
  {
    "id": "SW-7053-PKS-RRI-PLB-07-2026",
    "aset": "Lahan — Depot Gas & Air Minum (210m2)",
    "lokasi": "Pemancar RRI Palembang di Indralaya",
    "penyewaNama": "Fisol Jailani",
    "nomorPerjanjian": "7053/PKS/RRI.PLB/07/2026",
    "tanggalMulai": "2026-08-01",
    "tanggalSelesai": "2027-07-31",
    "nilaiSewa": 12000000,
    "status": "ON GOING",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2024-10-01",
        "nilai": 11816000
      },
      {
        "tanggalBerlaku": "2025-10-01",
        "nilai": 4140000
      },
      {
        "tanggalBerlaku": "2026-02-01",
        "nilai": 6000000
      },
      {
        "tanggalBerlaku": "2026-08-01",
        "nilai": 12000000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "kontrakId": "7053/PKS/RRI.PLB/07/2026"
  },
  {
    "id": "SW-7061-PKS-RRI-PLB-07-2026",
    "aset": "Lahan — Bengkel Motor & Stan Minuman (150m2)",
    "lokasi": "Pemancar RRI Palembang di Indralaya",
    "penyewaNama": "Herman Sawiran",
    "nomorPerjanjian": "7061/PKS/RRI.PLB/07/2026",
    "tanggalMulai": "2026-08-01",
    "tanggalSelesai": "2027-07-31",
    "nilaiSewa": 8232000,
    "status": "ON GOING",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2024-03-01",
        "nilai": 6435000
      },
      {
        "tanggalBerlaku": "2025-03-01",
        "nilai": 8232000
      },
      {
        "tanggalBerlaku": "2026-02-01",
        "nilai": 4116000
      },
      {
        "tanggalBerlaku": "2026-08-01",
        "nilai": 8232000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "kontrakId": "7061/PKS/RRI.PLB/07/2026"
  },
  {
    "id": "SW-7055-PKS-RRI-PLB-07-2026",
    "aset": "Lahan — Warung Makan & Rental Play Station (425m2)",
    "lokasi": "Pemancar RRI Palembang di Indralaya",
    "penyewaNama": "Mila Agustina",
    "nomorPerjanjian": "7055/PKS/RRI.PLB/07/2026",
    "tanggalMulai": "2026-08-01",
    "tanggalSelesai": "2027-07-31",
    "nilaiSewa": 15808583,
    "status": "ON GOING",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2024-09-01",
        "nilai": 14497000
      },
      {
        "tanggalBerlaku": "2025-09-01",
        "nilai": 7867000
      },
      {
        "tanggalBerlaku": "2026-02-01",
        "nilai": 7904292
      },
      {
        "tanggalBerlaku": "2026-08-01",
        "nilai": 15808583
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "kontrakId": "7055/PKS/RRI.PLB/07/2026"
  },
  {
    "id": "SW-039-RRI-PLB-PKS-U-09-2023",
    "aset": "Sewa Lahan — Kebun Singkong (47ha)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Yayan Apriansyah",
    "nomorPerjanjian": "039/RRI.PLB/PKS.U/09/2023",
    "tanggalMulai": "2023-09-01",
    "tanggalSelesai": "2024-08-31",
    "nilaiSewa": 115509000,
    "status": "Berakhir",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2023-09-01",
        "nilai": 115509000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "SW-003-RRI-PLB-PKS-U-01-2024",
    "aset": "Sewa Lahan — Komunitas Pemanah (1ha)",
    "lokasi": "Area Pemancar RRI di Indralaya",
    "penyewaNama": "Wahidin Baskara",
    "nomorPerjanjian": "003/RRI.PLB/PKS.U/01/2024",
    "tanggalMulai": "2024-02-01",
    "tanggalSelesai": "2025-01-31",
    "nilaiSewa": 3497000,
    "status": "Berakhir",
    "diterimaDiMuka": 0,
    "masihHarusDiterima": 0,
    "riwayatHarga": [
      {
        "tanggalBerlaku": "2024-02-01",
        "nilai": 3497000
      }
    ],
    "temuan": [],
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  }
],
  pengajuan: [
  {
    "id": "PGJ-01",
    "jenis": "Sewa Baru",
    "pemohon": "PT Bumi Ampera Rajasa",
    "tanggalMasuk": "2026-11-14",
    "kebutuhan": "Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang — BMN Lahan, Pemancar RRI Palembang di Indralaya",
    "tahap": "Disetujui",
    "penanggungJawab": "Belum Ditentukan",
    "catatan": "Sumber: Summary baris 58 ('Menunggu Pembayaran Biaya Sewa'). Tanggal masuk tidak tercatat; placeholder tanggal ekstraksi — WAJIB dikoreksi. Tidak ada baris di tab Sewa.",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "PGJ-02",
    "jenis": "Sewa Baru",
    "pemohon": "Genda Ananta Rahmat",
    "tanggalMasuk": "2026-11-14",
    "kebutuhan": "Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang — BMN Lahan, Pemancar RRI Palembang di Indralaya",
    "tahap": "Disetujui",
    "penanggungJawab": "Belum Ditentukan",
    "catatan": "Sumber: Summary baris 59 ('Menunggu Pembayaran Biaya Sewa'). Tanggal masuk tidak tercatat; placeholder tanggal ekstraksi — WAJIB dikoreksi. Tidak ada baris di tab Sewa.",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "PGJ-03",
    "jenis": "Sewa Baru",
    "pemohon": "Nanik Wahyunita",
    "tanggalMasuk": "2026-08-18",
    "kebutuhan": "Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang",
    "tahap": "Ditelaah",
    "penanggungJawab": "Belum Ditentukan",
    "catatan": "Sumber: Summary baris 61 ('') + tab Sewa baris 6 ('Dokumen Diproses oleh Bagian Umum'). Tanggal masuk tidak tercatat di sumber; dipakai Jatuh Tempo Surat Permohonan 18 Agustus 2026 sebagai pendekatan — perlu konfirmasi. Jatuh tempo kerja sama (rencana): 2026-11-16. Kelengkapan dokumen (tab Sewa): belum ada (semua FALSE).",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "PGJ-04",
    "jenis": "Sewa Baru",
    "pemohon": "Subhan",
    "tanggalMasuk": "2026-11-02",
    "kebutuhan": "Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang",
    "tahap": "Menunggu Dokumen",
    "penanggungJawab": "Belum Ditentukan",
    "catatan": "Sumber: Summary baris 62 ('') + tab Sewa baris 14 ('Menunggu Surat Pernyataan'). Tanggal masuk tidak tercatat di sumber; dipakai Jatuh Tempo Surat Permohonan 2 November 2026 sebagai pendekatan — perlu konfirmasi. Jatuh tempo kerja sama (rencana): 2027-01-31. Kelengkapan dokumen (tab Sewa): belum ada (semua FALSE).",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "PGJ-05",
    "jenis": "Sewa Baru",
    "pemohon": "Meily Oktarina",
    "tanggalMasuk": "2026-11-02",
    "kebutuhan": "Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang",
    "tahap": "Menunggu Dokumen",
    "penanggungJawab": "Belum Ditentukan",
    "catatan": "Sumber: Summary baris 63 ('') + tab Sewa baris 16 ('Menunggu Surat Pernyataan'). Tanggal masuk tidak tercatat di sumber; dipakai Jatuh Tempo Surat Permohonan 2 November 2026 sebagai pendekatan — perlu konfirmasi. Jatuh tempo kerja sama (rencana): 2027-01-31. Kelengkapan dokumen (tab Sewa): 8/9 lengkap.",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "PGJ-06",
    "jenis": "Sewa Baru",
    "pemohon": "Ihsan",
    "tanggalMasuk": "2026-11-02",
    "kebutuhan": "Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang",
    "tahap": "Menunggu Dokumen",
    "penanggungJawab": "Belum Ditentukan",
    "catatan": "Sumber: Summary baris 64 ('') + tab Sewa baris 17 ('Menunggu Surat Pernyataan'). Tanggal masuk tidak tercatat di sumber; dipakai Jatuh Tempo Surat Permohonan 2 November 2026 sebagai pendekatan — perlu konfirmasi. Jatuh tempo kerja sama (rencana): 2027-01-31. Kelengkapan dokumen (tab Sewa): 8/9 lengkap.",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "PGJ-07",
    "jenis": "Sewa Baru",
    "pemohon": "Sahara Al Fatiara Rozak",
    "tanggalMasuk": "2025-12-22",
    "kebutuhan": "Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang — BMN Lahan, Pemancar RRI Palembang di Indralaya, tujuan: Toko Variasi & Salon Mobil, Toko Oleh-oleh, & Warung Sembako, luas 300m2",
    "tahap": "Disetujui",
    "penanggungJawab": "Belum Ditentukan",
    "catatan": "Sumber: Summary baris 65 ('Menunggu Proses Pembayaran') + tab Sewa baris 4 ('Menunggu Permohonan'). Tanggal masuk tidak tercatat di sumber; dipakai Jatuh Tempo Surat Permohonan 22 Desember 2025 sebagai pendekatan — perlu konfirmasi. Jatuh tempo kerja sama (rencana): 2026-03-22. Kelengkapan dokumen (tab Sewa): belum ada (semua FALSE).",
    "nilaiPerkiraan": 7549583,
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "PGJ-08",
    "jenis": "Sewa Baru",
    "pemohon": "Muhammad Theodosius El Abqo",
    "tanggalMasuk": "2025-12-26",
    "kebutuhan": "Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang — BMN Lahan, Pemancar RRI Palembang di Indralaya, tujuan: Prasarana Latihan Olahraga Panahan, luas 10010m2",
    "tahap": "Disetujui",
    "penanggungJawab": "Belum Ditentukan",
    "catatan": "Sumber: Summary baris 66 ('Menunggu Proses Pembayaran') + tab Sewa baris 5 ('Menunggu Permohonan'). Tanggal masuk tidak tercatat di sumber; dipakai Jatuh Tempo Surat Permohonan 26 Desember 2025 sebagai pendekatan — perlu konfirmasi. Jatuh tempo kerja sama (rencana): 2026-03-26. Kelengkapan dokumen (tab Sewa): belum ada (semua FALSE).",
    "nilaiPerkiraan": 1647500,
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "PGJ-09",
    "jenis": "Sewa Baru",
    "pemohon": "SR. Sihotang",
    "tanggalMasuk": "2026-09-03",
    "kebutuhan": "Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang",
    "tahap": "Ditelaah",
    "penanggungJawab": "Belum Ditentukan",
    "catatan": "Sumber: Summary baris 67 ('') + tab Sewa baris 8 ('Sudah Dihubungi (Tidak Ada Respon)'). Tanggal masuk tidak tercatat di sumber; dipakai Jatuh Tempo Surat Permohonan 3 September 2026 sebagai pendekatan — perlu konfirmasi. Jatuh tempo kerja sama (rencana): 2026-12-02. Kelengkapan dokumen (tab Sewa): belum ada (semua FALSE).",
    "alasanTolak": "Sudah dihubungi, tidak ada respon",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "PGJ-10",
    "jenis": "Sewa Baru",
    "pemohon": "Nehwa Atmojo",
    "tanggalMasuk": "2026-09-29",
    "kebutuhan": "Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang",
    "tahap": "Masuk",
    "penanggungJawab": "Belum Ditentukan",
    "catatan": "Sumber: Summary baris 68 ('') + tab Sewa baris 10 ('Menunggu Permohonan'). Tanggal masuk tidak tercatat di sumber; dipakai Jatuh Tempo Surat Permohonan 29 September 2026 sebagai pendekatan — perlu konfirmasi. Jatuh tempo kerja sama (rencana): 2026-12-28. Kelengkapan dokumen (tab Sewa): belum ada (semua FALSE).",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "PGJ-11",
    "jenis": "Sewa Baru",
    "pemohon": "Efran Valuphy",
    "tanggalMasuk": "2026-09-25",
    "kebutuhan": "Sewa Menyewa Lahan di Lokasi Pemancar LPP RRI Palembang",
    "tahap": "Masuk",
    "penanggungJawab": "Belum Ditentukan",
    "catatan": "Sumber: Summary baris 69 ('') + tab Sewa baris 9 (''). Tanggal masuk tidak tercatat di sumber; dipakai Jatuh Tempo Surat Permohonan 25 September 2026 sebagai pendekatan — perlu konfirmasi. Jatuh tempo kerja sama (rencana): 2026-12-24. Kelengkapan dokumen (tab Sewa): belum ada (semua FALSE).",
    "alasanTolak": "Keterangan kosong di sumber",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "PGJ-12",
    "jenis": "Sewa Baru",
    "pemohon": "Binsar Sinambela",
    "tanggalMasuk": "2026-09-03",
    "kebutuhan": "Pengajuan sewa BMN LPP RRI Palembang (detail objek belum tercatat di sumber)",
    "tahap": "Ditolak",
    "penanggungJawab": "Belum Ditentukan",
    "catatan": "Sumber: tab Sewa baris 7 ('Akan Dihentikan'). Tanggal masuk tidak tercatat di sumber; dipakai Jatuh Tempo Surat Permohonan 3 September 2026 sebagai pendekatan — perlu konfirmasi. Jatuh tempo kerja sama (rencana): 2026-12-02. Kelengkapan dokumen (tab Sewa): belum ada (semua FALSE).",
    "alasanTolak": "Akan Dihentikan (per tab Sewa)",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "PGJ-13",
    "jenis": "Sewa Baru",
    "pemohon": "Ahmad Sobirin",
    "tanggalMasuk": "2026-11-02",
    "kebutuhan": "Pengajuan sewa BMN LPP RRI Palembang (detail objek belum tercatat di sumber)",
    "tahap": "Masuk",
    "penanggungJawab": "Belum Ditentukan",
    "catatan": "Sumber: tab Sewa baris 11 (''). Tanggal masuk tidak tercatat di sumber; dipakai Jatuh Tempo Surat Permohonan 2 November 2026 sebagai pendekatan — perlu konfirmasi. Jatuh tempo kerja sama (rencana): 2027-01-31. Kelengkapan dokumen (tab Sewa): belum ada (semua FALSE).",
    "alasanTolak": "Keterangan kosong di sumber",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "PGJ-14",
    "jenis": "Sewa Baru",
    "pemohon": "Kasir",
    "tanggalMasuk": "2026-11-02",
    "kebutuhan": "Pengajuan sewa BMN LPP RRI Palembang (detail objek belum tercatat di sumber)",
    "tahap": "Masuk",
    "penanggungJawab": "Belum Ditentukan",
    "catatan": "Sumber: tab Sewa baris 12 ('Menunggu Permohonan'). Tanggal masuk tidak tercatat di sumber; dipakai Jatuh Tempo Surat Permohonan 2 November 2026 sebagai pendekatan — perlu konfirmasi. Jatuh tempo kerja sama (rencana): 2027-01-31. Kelengkapan dokumen (tab Sewa): belum ada (semua FALSE).",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "PGJ-15",
    "jenis": "Sewa Baru",
    "pemohon": "Ricardo Nopriansa",
    "tanggalMasuk": "2026-11-02",
    "kebutuhan": "Pengajuan sewa BMN LPP RRI Palembang (detail objek belum tercatat di sumber)",
    "tahap": "Masuk",
    "penanggungJawab": "Belum Ditentukan",
    "catatan": "Sumber: tab Sewa baris 13 ('Menunggu Permohonan'). Tanggal masuk tidak tercatat di sumber; dipakai Jatuh Tempo Surat Permohonan 2 November 2026 sebagai pendekatan — perlu konfirmasi. Jatuh tempo kerja sama (rencana): 2027-01-31. Kelengkapan dokumen (tab Sewa): belum ada (semua FALSE).",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "PGJ-16",
    "jenis": "Sewa Baru",
    "pemohon": "Abdul Rozak Rusdy",
    "tanggalMasuk": "2026-11-02",
    "kebutuhan": "Pengajuan sewa BMN LPP RRI Palembang (detail objek belum tercatat di sumber)",
    "tahap": "Masuk",
    "penanggungJawab": "Belum Ditentukan",
    "catatan": "Sumber: tab Sewa baris 15 ('Menunggu Permohonan'). Tanggal masuk tidak tercatat di sumber; dipakai Jatuh Tempo Surat Permohonan 2 November 2026 sebagai pendekatan — perlu konfirmasi. Jatuh tempo kerja sama (rencana): 2027-01-31. Kelengkapan dokumen (tab Sewa): belum ada (semua FALSE). Catatan: pemohon sudah memiliki kontrak sewa aktif 2026 — kemungkinan pengajuan perpanjangan.",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  }
],
  pengajuanKlien: [],
  penerimaanAcuan: [
  {
    "id": "ACU-001",
    "periode": "2026-01",
    "kodeAkun": "425151",
    "uraian": "Sewa Rumah Dinas — Setoran Dedek Handoko, S. Ak — kontrak 3054 Tahun 2025 — Billing 00002T — NTPN 269991528000845",
    "jumlah": 226217,
    "penyetor": "Dedek Handoko, S. Ak",
    "tanggalSetor": "2026-01-01",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-002",
    "periode": "2026-01",
    "kodeAkun": "425151",
    "uraian": "Sewa Rumah Dinas — Setoran Azizul Hakim, A. Md — kontrak 3053 Tahun 2025 — Billing 00003T — NTPN 269991528000846",
    "jumlah": 226217,
    "penyetor": "Azizul Hakim, A. Md",
    "tanggalSetor": "2026-01-01",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-003",
    "periode": "2026-01",
    "kodeAkun": "425122",
    "uraian": "Pemindahtanganan BMN — Billing 820260128300709 — NTPN 30D5E8N3F5U8P7L5",
    "jumlah": 8100000,
    "tanggalSetor": "2026-01-28",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-004",
    "periode": "2026-01",
    "kodeAkun": "425131",
    "uraian": "Sewa Lahan Pemancar Inderalaya — Setoran Meily Oktarina — kontrak 3152/PKS/RRI.PLB/02/2026 (ref 002/RRI.PLB/PKS.U/01/2026) — Billing 820260129495687 — NTPN 89BD96U8FGPH3MK7",
    "jumlah": 6455000,
    "penyetor": "Meily Oktarina",
    "tanggalSetor": "2026-01-30",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-005",
    "periode": "2026-01",
    "kodeAkun": "425131",
    "uraian": "Sewa Lahan Pemancar Inderalaya — Setoran Dierga Salomon — kontrak 3160/PKS/RRI.PLB/02/2026 (ref 003/RRI.PLB/PKS.U/01/2026) — Billing 820260129496383 — NTPN 6118C3CIG6FVFN9V",
    "jumlah": 5648000,
    "penyetor": "Dierga Salomon",
    "tanggalSetor": "2026-01-30",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-006",
    "periode": "2026-01",
    "kodeAkun": "425131",
    "uraian": "Sewa Lahan Pemancar Inderalaya — Setoran Aminul Khair — kontrak 3161/PKS/RRI.PLB/02/2026 (ref 004/RRI.PLB/PKS.U/01/2026) — Billing 820260129497246 — NTPN CB6262G50BTJ2O4U",
    "jumlah": 6455000,
    "penyetor": "Aminul Khair",
    "tanggalSetor": "2026-01-30",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-007",
    "periode": "2026-02",
    "kodeAkun": "425151",
    "uraian": "Sewa Rumah Dinas — Setoran Dedek Handoko, S. Ak — kontrak 3054 Tahun 2025 — Billing 00012T — NTPN 260140000001832",
    "jumlah": 226217,
    "penyetor": "Dedek Handoko, S. Ak",
    "tanggalSetor": "2026-02-01",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-008",
    "periode": "2026-02",
    "kodeAkun": "425531",
    "uraian": "Jasa Penyiaran Spot — Setoran PT PLN (Persero) UPT Palembang — kontrak 2339/PKS/RRI.PLB/01/2026 (ref 001/RRI.PLB/PKS.F/01/2026) — Billing 820260205527034 — NTPN 812AE3CIG6I7VVVQ",
    "jumlah": 270000,
    "penyetor": "PT PLN (Persero) UPT Palembang",
    "tanggalSetor": "2026-02-05",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-009",
    "periode": "2026-02",
    "kodeAkun": "425131",
    "uraian": "Sewa Lahan Pemancar Inderalaya — Setoran Abdul Rozak Rusdy — kontrak 3580/PKS/RRI.PLB/02/2026 (ref 005/RRI.PLB/PKS.U/02/2026) — Billing 820260203188072 — NTPN 122D11JNGHDCUJR8",
    "jumlah": 9019000,
    "penyetor": "Abdul Rozak Rusdy",
    "tanggalSetor": "2026-02-10",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-010",
    "periode": "2026-02",
    "kodeAkun": "425839",
    "uraian": "Pendapatan Denda Lainnya — penyetor, kode billing, NTPN & tanggal setoran tidak tercantum di sumber",
    "jumlah": 180380,
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-011",
    "periode": "2026-02",
    "kodeAkun": "425131",
    "uraian": "Sewa Lahan Pemancar Inderalaya — Setoran Assef Hidayat — kontrak 3607/PKS/RRI.PLB/02/2026 (ref 006/RRI.PLB/PKS.U/02/2026) — Billing 820260210141875 — NTPN 1E33B61QVM9HJQLJ",
    "jumlah": 6536000,
    "penyetor": "Assef Hidayat",
    "tanggalSetor": "2026-02-10",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-012",
    "periode": "2026-03",
    "kodeAkun": "425151",
    "uraian": "Sewa Rumah Dinas — Setoran Dedek Handoko, S. Ak — kontrak 3054 Tahun 2025 — Billing 00033T — NTPN 260140000005796",
    "jumlah": 250839,
    "penyetor": "Dedek Handoko, S. Ak",
    "tanggalSetor": "2026-03-01",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-013",
    "periode": "2026-03",
    "kodeAkun": "425151",
    "uraian": "Sewa Rumah Dinas — Setoran Suryadi, S. I. Kom — kontrak 24 Tahun 2026 — Billing 00033T — NTPN 260140000005796",
    "jumlah": 226217,
    "penyetor": "Suryadi, S. I. Kom",
    "tanggalSetor": "2026-03-01",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-014",
    "periode": "2026-03",
    "kodeAkun": "425151",
    "uraian": "Sewa Rumah Dinas — Setoran Azizul Hakim — kontrak 3053 Tahun 2025 — Billing 00032T — NTPN 260140000005795",
    "jumlah": 452434,
    "penyetor": "Azizul Hakim",
    "tanggalSetor": "2026-03-01",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-015",
    "periode": "2026-03",
    "kodeAkun": "425531",
    "uraian": "Jasa Penyiaran Adlibs — Setoran PT Mandiri Taspen — kontrak 001/PKS/DIR.LPU/01/2026 — Billing 820260325230579 — NTPN 0C5B68N3F644J1VJ",
    "jumlah": 1550000,
    "penyetor": "PT Mandiri Taspen",
    "tanggalSetor": "2026-03-27",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-016",
    "periode": "2026-04",
    "kodeAkun": "425151",
    "uraian": "Sewa Rumah Dinas — Setoran Dedek Handoko, S. Ak — kontrak 3054 Tahun 2025 — Billing 00080T — NTPN 260140000017048",
    "jumlah": 226217,
    "penyetor": "Dedek Handoko, S. Ak",
    "tanggalSetor": "2026-04-01",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-017",
    "periode": "2026-04",
    "kodeAkun": "425151",
    "uraian": "Sewa Rumah Dinas — Setoran Suryadi, S. I. Kom — kontrak 24 Tahun 2026 — Billing 00080T — NTPN 260140000017048",
    "jumlah": 226217,
    "penyetor": "Suryadi, S. I. Kom",
    "tanggalSetor": "2026-04-01",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-018",
    "periode": "2026-04",
    "kodeAkun": "425531",
    "uraian": "Jasa Penyiaran Spot — Setoran Kantor Pengawasan dan Pelayanan Bea dan Cukai TMP B Palembang — kontrak 012/RRI.PLB/PKS.F/03/2026 — Billing 820260414967708 — NTPN 03EE67QLVBKDOJSS",
    "jumlah": 4050000,
    "penyetor": "Kantor Pengawasan dan Pelayanan Bea dan Cukai TMP B Palembang",
    "tanggalSetor": "2026-04-14",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-019",
    "periode": "2026-04",
    "kodeAkun": "425531",
    "uraian": "Jasa Penyiaran Greeting — Setoran Diskominfo Kabupaten Musi Banyuasin — kontrak 009/RRI.PLB/PKS.F/02/2026 — Billing 820260422176512 — NTPN A58D86U8FH287JO0",
    "jumlah": 3000000,
    "penyetor": "Diskominfo Kabupaten Musi Banyuasin",
    "tanggalSetor": "2026-04-22",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-020",
    "periode": "2026-04",
    "kodeAkun": "425531",
    "uraian": "Jasa Penyiaran Greeting — Setoran Diskominfo Kabupaten OKU Selatan — kontrak 013/RRI.PLB/PKS.F/03/2026 — Billing 820260422245816 — NTPN BEEF23CIG6OMLNDO",
    "jumlah": 1500000,
    "penyetor": "Diskominfo Kabupaten OKU Selatan",
    "tanggalSetor": "2026-04-23",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-021",
    "periode": "2026-04",
    "kodeAkun": "425531",
    "uraian": "Jasa Penyiaran Greeting — Setoran BSI KCP Kenten 2 Palembang — kontrak 014/RRI.PLB/PKS.F/03/2026 — Billing 820260421045934 — NTPN F1A450NA0N1GA3LE",
    "jumlah": 1000000,
    "penyetor": "BSI KCP Kenten 2 Palembang",
    "tanggalSetor": "2026-04-23",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-022",
    "periode": "2026-05",
    "kodeAkun": "425151",
    "uraian": "Sewa Rumah Dinas — Setoran Dedek Handoko, S. Ak — kontrak 3054 Tahun 2025 — Billing 00099T — NTPN 260140000020232",
    "jumlah": 226217,
    "penyetor": "Dedek Handoko, S. Ak",
    "tanggalSetor": "2026-05-01",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-023",
    "periode": "2026-05",
    "kodeAkun": "425151",
    "uraian": "Sewa Rumah Dinas — Setoran Suryadi, S. I. Kom — kontrak 24 Tahun 2026 — Billing 00099T — NTPN 260140000020232",
    "jumlah": 226217,
    "penyetor": "Suryadi, S. I. Kom",
    "tanggalSetor": "2026-05-01",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-024",
    "periode": "2026-05",
    "kodeAkun": "425531",
    "uraian": "Jasa Penyiaran Dialog Interaktif Dalam Studio — Setoran Kanwil DJP Sumsel dan Kepulauan Babel — kontrak 5201/PKS/RRI-PLB/04/2026 (ref 015/RRI.PLB/PKS.F/04/2026) — Billing 820260511902046 — NTPN 49A9C61QVMIHCQAU",
    "jumlah": 2000000,
    "penyetor": "Kanwil DJP Sumsel dan Kepulauan Babel",
    "tanggalSetor": "2026-05-12",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-025",
    "periode": "2026-05",
    "kodeAkun": "425531",
    "uraian": "Jasa Penyiaran Greeting — Setoran Kantor Perwakilan Bank Indonesia Provinsi Sumatera Selatan — kontrak 4416/PKS/RRI-PLB/03/2026 (ref 011/RRI.PLB/PKS.F/02/2026) — Billing 820260513249583 — NTPN 0E7FA3CIG6RDEU9F",
    "jumlah": 6200000,
    "penyetor": "Kantor Perwakilan Bank Indonesia Provinsi Sumatera Selatan",
    "tanggalSetor": "2026-05-13",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-026",
    "periode": "2026-05",
    "kodeAkun": "425839",
    "uraian": "Pendapatan Denda Lainnya (SPn 1) — Setoran Kantor Perwakilan Bank Indonesia Provinsi Sumatera Selatan — kontrak 4416/PKS/RRI-PLB/03/2026 (ref 011/RRI.PLB/PKS.F/02/2026) — Billing 820260513281865 — NTPN 40D6555DFS069TQ9",
    "jumlah": 124000,
    "penyetor": "Kantor Perwakilan Bank Indonesia Provinsi Sumatera Selatan",
    "tanggalSetor": "2026-05-18",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-027",
    "periode": "2026-05",
    "kodeAkun": "425531",
    "uraian": "Jasa Penyiaran Greeting — Setoran PT PLN (Persero) UPT Palembang — kontrak 6585/PKS/RRI-PLB/05/2026 (ref 016/RRI.PLB/PKS.F/04/2026) — Billing 820260520213970 — NTPN 699683CIG6RK3FEI",
    "jumlah": 270000,
    "penyetor": "PT PLN (Persero) UPT Palembang",
    "tanggalSetor": "2026-05-20",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-028",
    "periode": "2026-05",
    "kodeAkun": "425131",
    "uraian": "Sewa Lahan Pemancar Indralaya — Setoran Arip — kontrak 7293/PKS/RRI-PLB/06/2026 (ref 017/RRI.PLB/PKS.U/05/2026) — Billing 820260520202181 — NTPN 130C50NA0N4ES3U5",
    "jumlah": 5320000,
    "penyetor": "Arip",
    "tanggalSetor": "2026-05-20",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-029",
    "periode": "2026-05",
    "kodeAkun": "425531",
    "uraian": "Jasa Digitalisasi Siaran Instagram Reels — Setoran Savano Entertaiment — kontrak 7297/PKS/RRI-PLB/06/2026 (ref 018/RRI.PLB/PKS.F/05/2026) — Billing 820260526984443 — NTPN 8F2571JNGHN1O37R",
    "jumlah": 200000,
    "penyetor": "Savano Entertaiment",
    "tanggalSetor": "2026-05-26",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-030",
    "periode": "2026-06",
    "kodeAkun": "425151",
    "uraian": "Sewa Rumah Dinas — Setoran Dedek Handoko, S. Ak — kontrak 3054 Tahun 2025 — Billing 00119T — NTPN 260140000029092",
    "jumlah": 226217,
    "penyetor": "Dedek Handoko, S. Ak",
    "tanggalSetor": "2026-06-01",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-031",
    "periode": "2026-06",
    "kodeAkun": "425151",
    "uraian": "Sewa Rumah Dinas — Setoran Suryadi, S. I. Kom — kontrak 24 Tahun 2026 — Billing 00119T — NTPN 260140000029092",
    "jumlah": 226217,
    "penyetor": "Suryadi, S. I. Kom",
    "tanggalSetor": "2026-06-01",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-032",
    "periode": "2026-06",
    "kodeAkun": "425131",
    "uraian": "Sewa Aula — Setoran Dr. Jalaludiin, MPSA — kontrak 5350/PKS/RRI-PLB/06/2026 (ref 021/RRI.PLB/PKS.U/06/2026) — Billing 820260611306342 — NTPN 7435B49001GNCCR6",
    "jumlah": 3056000,
    "penyetor": "Dr. Jalaludiin, MPSA",
    "tanggalSetor": "2026-06-12",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-033",
    "periode": "2026-06",
    "kodeAkun": "425531",
    "uraian": "Jasa Penyiaran Spot — Setoran Yayasan Islam Al-Ittifaqiah — kontrak 7299/PKS/RRI-PLB/06/2026 (ref 019/RRI.PLB/PKS.F/05/2026) — Billing 820260611283732 — NTPN 138122G50CBUHMOK",
    "jumlah": 4050000,
    "penyetor": "Yayasan Islam Al-Ittifaqiah",
    "tanggalSetor": "2026-06-14",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-034",
    "periode": "2026-06",
    "kodeAkun": "425131",
    "uraian": "Sewa Lahan Pemancar Indralaya — Setoran Darojad — kontrak ref 027/RRI.PLB/PKS.F/06/2025 (tanpa Nomor Kontrak) — Billing 820260618264146 — NTPN 9E2A11JNGHPOPNII",
    "jumlah": 11246250,
    "penyetor": "Darojad",
    "tanggalSetor": "2026-06-18",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-035",
    "periode": "2026-06",
    "kodeAkun": "425531",
    "uraian": "Jasa Penyiaran Greeting — Setoran Bank Sumsel dan Babel — kontrak 4415/PKS/RRI-PLB/03/2026 (ref 010/RRI.PLB/PKS.F/02/2026) — Billing 820260615730539 — NTPN B5E091JNGHPMCDBB",
    "jumlah": 7500000,
    "penyetor": "Bank Sumsel dan Babel",
    "tanggalSetor": "2026-06-22",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-036",
    "periode": "2026-06",
    "kodeAkun": "425531",
    "uraian": "Jasa Penyiaran Greeting — Setoran Diskominfo Kota Palembang — kontrak 3874/PKS/RRI-PLB/03/2026 (ref 007/RRI.PLB/PKS.F/02/2026) — Billing 820260625423701 — NTPN BF4407QLVBQMF7AL",
    "jumlah": 15000000,
    "penyetor": "Diskominfo Kota Palembang",
    "tanggalSetor": "2026-06-26",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-037",
    "periode": "2026-06",
    "kodeAkun": "425531",
    "uraian": "Jasa Penyiaran Greeting — Setoran Diskominfo Kabupaten Banyuasin — kontrak 3876/PKS/RRI-PLB/03/2026 (ref 008/RRI.PLB/PKS.F/02/2026) — Billing 820260624221021 — NTPN FFEFB3CIG6UN9GQT",
    "jumlah": 5000000,
    "penyetor": "Diskominfo Kabupaten Banyuasin",
    "tanggalSetor": "2026-06-29",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-038",
    "periode": "2026-07",
    "kodeAkun": "425151",
    "uraian": "Sewa Rumah Dinas — Setoran Dedek Handoko, S. Ak — kontrak 3054 Tahun 2025 — Billing 00150T — NTPN 260140000037148",
    "jumlah": 226217,
    "penyetor": "Dedek Handoko, S. Ak",
    "tanggalSetor": "2026-07-01",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-039",
    "periode": "2026-07",
    "kodeAkun": "425151",
    "uraian": "Sewa Rumah Dinas — Setoran Suryadi, S. I. Kom — kontrak 24 Tahun 2026 — Billing 00150T — NTPN 260140000037148",
    "jumlah": 226217,
    "penyetor": "Suryadi, S. I. Kom",
    "tanggalSetor": "2026-07-01",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-040",
    "periode": "2026-07",
    "kodeAkun": "425531",
    "uraian": "Jasa Penyiaran Adlibs — Setoran Bank Indonesia Perwakilan Sumatera Selatan — kontrak 5592/PKS/RRI-PLB/06/2026 (ref 026/RRI.PLB/PKS.F/06/2026) — Billing 820260629925295 — NTPN 3A85755DFS3LHJDF",
    "jumlah": 1000000,
    "penyetor": "Bank Indonesia Perwakilan Sumatera Selatan",
    "tanggalSetor": "2026-07-02",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-041",
    "periode": "2026-07",
    "kodeAkun": "425531",
    "uraian": "Digitalisasi Siaran Live Youtube + Jasa Penyiaran Siaran Langsung + Jasa Penyiaran Adlibs — Setoran DPRD Kota Palembang — kontrak 5390/PKS/RRI-PLB/06/2026 (ref 022/RRI.PLB/PKS.F/06/2026) — Billing 820260707096830 — NTPN 56E4F7QLVBT4BM7U",
    "jumlah": 3500000,
    "penyetor": "DPRD Kota Palembang",
    "tanggalSetor": "2026-07-07",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-042",
    "periode": "2026-07",
    "kodeAkun": "425531",
    "uraian": "Dialog Interaktif Luar Studio + Digitalisasi Siaran Live Youtube + Jasa Penyiaran Adlibs — Setoran PT. Medco E&P Indonesia — kontrak 5391/PKS/RRI-PLB/06/2026 (ref 023/RRI.PLB/PKS.F/06/2026) — Billing 820260714274512 — NTPN A18170NA0NA7UNMG",
    "jumlah": 3500000,
    "penyetor": "PT. Medco E&P Indonesia",
    "tanggalSetor": "2026-07-14",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-043",
    "periode": "2026-07",
    "kodeAkun": "425839",
    "uraian": "Pendapatan Denda Lainnya (SPn 2) — Setoran Bank Sumsel dan Babel — kontrak 4415/PKS/RRI-PLB/03/2026 (ref 010/RRI.PLB/PKS.F/02/2026) — Billing 820260714279389 — NTPN 295C92G50CF0OSET",
    "jumlah": 300000,
    "penyetor": "Bank Sumsel dan Babel",
    "tanggalSetor": "2026-07-14",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-044",
    "periode": "2026-07",
    "kodeAkun": "425839",
    "uraian": "Pendapatan Denda Lainnya (SPn 3) — Setoran Diskominfo Kabupaten Banyuasin — kontrak 3876/PKS/RRI-PLB/03/2026 (ref 008/RRI.PLB/PKS.F/02/2026) — Billing 820260714279343 — NTPN 3310555DFS65VSDF",
    "jumlah": 300000,
    "penyetor": "Diskominfo Kabupaten Banyuasin",
    "tanggalSetor": "2026-07-14",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-045",
    "periode": "2026-07",
    "kodeAkun": "425531",
    "uraian": "Jasa Penyiaran Dialog Interaktif Dalam Studio — Setoran Bank Indonesia Perwakilan Sumatera Selatan — kontrak 5484/PKS/RRI-PLB/06/2026 (ref 025/RRI.PLB/PKS.F/06/2026) — Billing 820260716693693 — NTPN 987CB3CIG71FFI5T",
    "jumlah": 2000000,
    "penyetor": "Bank Indonesia Perwakilan Sumatera Selatan",
    "tanggalSetor": "2026-07-16",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-046",
    "periode": "2026-07",
    "kodeAkun": "425131",
    "uraian": "Sewa Lahan Pemancar Indralaya — Setoran Faridah Hanum — kontrak 7051/PKS/RRI-PLB/07/2026 (ref 028/RRI.PLB/PKS.U/07/2026) — Billing 820260716674372 — NTPN DCA0D2G50CF31VA4",
    "jumlah": 6536000,
    "penyetor": "Faridah Hanum",
    "tanggalSetor": "2026-07-17",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-047",
    "periode": "2026-07",
    "kodeAkun": "425531",
    "uraian": "Jasa Penyiaran Spot — Setoran Kantor Pengawasan dan Pelayanan Bea dan Cukai TMP B Palembang — kontrak 5483/PKS/RRI-PLB/06/2026 (ref 024/RRI.PLB/PKS.F/06/2026) — Billing 820260722488280 — NTPN 99C250NA0NAFPCUO",
    "jumlah": 4050000,
    "penyetor": "Kantor Pengawasan dan Pelayanan Bea dan Cukai TMP B Palembang",
    "tanggalSetor": "2026-07-27",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-048",
    "periode": "2026-07",
    "kodeAkun": "425531",
    "uraian": "Jasa Penyiaran Spot — Setoran PT Sumber Alfaria Trijaya Tbk (Alfamart) Palembang — kontrak 7302/PKS/RRI-PLB/06/2026 (ref 020/RRI.PLB/PKS.F/05/2026) — Billing 820260728396050 — NTPN 4AA9049001K71M8I",
    "jumlah": 990000,
    "penyetor": "PT Sumber Alfaria Trijaya Tbk (Alfamart) Palembang",
    "tanggalSetor": "2026-07-28",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-049",
    "periode": "2026-07",
    "kodeAkun": "425131",
    "uraian": "Sewa Lahan Pemancar Indralaya — Setoran Fisol Jailani — kontrak 7053/PKS/RRI-PLB/07/2026 (ref 030/RRI.PLB/PKS.U/07/2026) — Billing 820260730797898 — NTPN 8EC633CIG71STVQA",
    "jumlah": 12000000,
    "penyetor": "Fisol Jailani",
    "tanggalSetor": "2026-07-30",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-050",
    "periode": "2026-07",
    "kodeAkun": "425131",
    "uraian": "Sewa Lahan Pemancar Indralaya — Setoran Fisol Jailani — kontrak 7052/PKS/RRI-PLB/07/2026 (ref 029/RRI.PLB/PKS.U/07/2026) — Billing 820260730797865 — NTPN 5379561QVMP24VP9",
    "jumlah": 6000000,
    "penyetor": "Fisol Jailani",
    "tanggalSetor": "2026-07-30",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-051",
    "periode": "2026-07",
    "kodeAkun": "425131",
    "uraian": "Sewa Lahan Pemancar Indralaya — Setoran Mila Agustina — kontrak 7054/PKS/RRI-PLB/07/2026 (ref 031/RRI.PLB/PKS.U/07/2026) — Billing 820260730825245 — NTPN C4B4D49001K9BQGT",
    "jumlah": 7904292,
    "penyetor": "Mila Agustina",
    "tanggalSetor": "2026-07-30",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-052",
    "periode": "2026-07",
    "kodeAkun": "425131",
    "uraian": "Sewa Lahan Pemancar Indralaya — Setoran Mila Agustina — kontrak 7055/PKS/RRI-PLB/07/2026 (ref 032/RRI.PLB/PKS.U/07/2026) — Billing 820260730825192 — NTPN 8CDED2G50CFGHQF8",
    "jumlah": 15808583,
    "penyetor": "Mila Agustina",
    "tanggalSetor": "2026-07-30",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-053",
    "periode": "2026-07",
    "kodeAkun": "425131",
    "uraian": "Sewa Lahan Pemancar Indralaya — Setoran Herman Sawiran — kontrak 7061/PKS/RRI-PLB/07/2026 (ref 034/RRI.PLB/PKS.U/07/2026) — Billing 820260731072240 — NTPN AE21E55DFS6M0BNG",
    "jumlah": 8232000,
    "penyetor": "Herman Sawiran",
    "tanggalSetor": "2026-07-31",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-054",
    "periode": "2026-07",
    "kodeAkun": "425131",
    "uraian": "Sewa Lahan Pemancar Indralaya — Setoran Herman Sawiran — kontrak 7060/PKS/RRI-PLB/07/2026 (ref 033/RRI.PLB/PKS.U/07/2026) — Billing 820260731072349 — NTPN DA11E61QVMP2DBQT",
    "jumlah": 4116000,
    "penyetor": "Herman Sawiran",
    "tanggalSetor": "2026-07-31",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-055",
    "periode": "2026-08",
    "kodeAkun": "425151",
    "uraian": "Sewa Rumah Dinas — Setoran Dedek Handoko, S. Ak — kontrak 3054 Tahun 2025 — Billing 00169T — NTPN 260140000043736",
    "jumlah": 226217,
    "penyetor": "Dedek Handoko, S. Ak",
    "tanggalSetor": "2026-08-01",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-056",
    "periode": "2026-08",
    "kodeAkun": "425151",
    "uraian": "Sewa Rumah Dinas — Setoran Suryadi, S. I. Kom — kontrak 24 Tahun 2026 — Billing 00169T — NTPN 260140000043736",
    "jumlah": 226217,
    "penyetor": "Suryadi, S. I. Kom",
    "tanggalSetor": "2026-08-01",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-057",
    "periode": "2026-08",
    "kodeAkun": "425122",
    "uraian": "Pemindahtanganan BMN — Billing 820260805757533 — NTPN F45473CIG744DIIT",
    "jumlah": 43250000,
    "tanggalSetor": "2026-08-05",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-058",
    "periode": "2026-08",
    "kodeAkun": "425131",
    "uraian": "Sewa Lahan Kantor RRI Palembang — Setoran PT Vgreen Global Charging Station Investment Indonesia — kontrak 0016/PKS/DIR.LPU/06/2025 — Billing 820260812804390 — NTPN A49300NA0ND5TK96",
    "jumlah": 17146250,
    "penyetor": "PT Vgreen Global Charging Station Investment Indonesia",
    "tanggalSetor": "2026-08-13",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-059",
    "periode": "2026-09",
    "kodeAkun": "425151",
    "uraian": "Sewa Rumah Dinas — Setoran Dedek Handoko, S. Ak — kontrak 3054 Tahun 2025 — Billing 00197T — NTPN 260140000053291",
    "jumlah": 226217,
    "penyetor": "Dedek Handoko, S. Ak",
    "tanggalSetor": "2026-09-01",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-060",
    "periode": "2026-09",
    "kodeAkun": "425151",
    "uraian": "Sewa Rumah Dinas — Setoran Suryadi, S. I. Kom — kontrak 24 Tahun 2026 — Billing 00197T — NTPN 260140000053291",
    "jumlah": 226217,
    "penyetor": "Suryadi, S. I. Kom",
    "tanggalSetor": "2026-09-01",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-061",
    "periode": "2026-09",
    "kodeAkun": "425151",
    "uraian": "Sewa Rumah Dinas — Setoran Arianto, S. Sos — kontrak 1228 Tahun 2026 — Billing 00198T — NTPN 260140000053292",
    "jumlah": 904868,
    "penyetor": "Arianto, S. Sos",
    "tanggalSetor": "2026-09-01",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "ACU-062",
    "periode": "2026-09",
    "kodeAkun": "425531",
    "uraian": "Jasa Penyiaran Dialog Interaktif Dalam Studio — Setoran Perempuan Indonesia Maju — kontrak 6593/PKS/RRI-PLB/07/2026 (ref 027/RRI.PLB/PKS.F/07/2026) — Billing 820260914784821 — NTPN 96D411JNGI2JIQHL",
    "jumlah": 2000000,
    "penyetor": "Perempuan Indonesia Maju",
    "tanggalSetor": "2026-09-14",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  }
],
  audit: [
  {
    "id": "AUD-IMPOR-01",
    "waktu": "2026-11-14T00:00:00",
    "pengguna": "Impor Spreadsheet",
    "peran": "Admin Sistem",
    "aksi": "Impor data nyata dari spreadsheet",
    "entitas": "Dataset",
    "entitasId": "DATA_NYATA",
    "sebelum": "—",
    "sesudah": "Data nyata Palembang diimpor dari 6 spreadsheet kerja (2026-11-14): 33 klien, 42 kontrak, 42 tagihan, 42 pembayaran, 13 denda, 41 sewa, 16 pengajuan, 62 penerimaan acuan. Entitas Fase B tetap data contoh."
  }
],
  // --- Data contoh Fase B (PRD Bab 6.12) ---
  prospect: [
    {
      id: 'PRS-01',
      namaInstansi: 'PT Cahaya Media Palembang (Contoh)',
      kontakNama: 'Hendra Wijaya',
      kontakJabatan: 'Direktur Pemasaran',
      telepon: '0812-7788-9900',
      email: 'hendra@cahayamedia.co.id',
      sumber: 'Pengajuan',
      layananDiminati: 'Siaran Iklan (Spot/Jingle/Filler/Advetorial)',
      tahap: 'Negosiasi',
      penanggungJawab: 'Andi Pratama (Contoh)',
      tanggalTindakLanjut: '2026-11-20',
      nilaiPerkiraan: 9000000,
      catatan: 'Kampanye produk 3 bulan; masuk dari pengajuan PJ-001.',
      riwayat: [
        { tanggal: '2026-11-02', catatan: 'Prospek dicatat dari pengajuan PJ-001.', oleh: 'Andi Pratama (Contoh)' },
        { tanggal: '2026-11-05', catatan: 'Dihubungi — minta paket siaran iklan 3 bulan.', oleh: 'Andi Pratama (Contoh)' },
        { tanggal: '2026-11-10', catatan: 'Quotation QTN-02 dikirim; negosiasi harga paket.', oleh: 'Andi Pratama (Contoh)' },
      ],
      satker: S,
    },
    {
      id: 'PRS-02',
      namaInstansi: 'PT Swara Media Nusantara (Contoh)',
      kontakNama: 'Rina Wijaya',
      kontakJabatan: 'Manajer Pemasaran',
      telepon: '0812-3456-7890',
      email: 'rina@swaramedia.co.id',
      sumber: 'Referensi',
      layananDiminati: 'Siaran Iklan (Spot/Jingle/Filler/Advetorial)',
      tahap: 'Diterima',
      penanggungJawab: 'Andi Pratama (Contoh)',
      nilaiPerkiraan: 48000000,
      catatan: 'Jejak lengkap: prospek → QTN-01 → ORD-01 → PKS-001/2026.',
      riwayat: [
        { tanggal: '2025-12-10', catatan: 'Prospek dicatat dari referensi klien lama.', oleh: 'Andi Pratama (Contoh)' },
        { tanggal: '2025-12-15', catatan: 'Meeting — sepakat lanjut ke quotation.', oleh: 'Andi Pratama (Contoh)' },
        { tanggal: '2025-12-18', catatan: 'Quotation QTN-01 dibuat (Rp48.000.000).', oleh: 'Andi Pratama (Contoh)' },
        { tanggal: '2025-12-22', catatan: 'Quotation disetujui; order ORD-01 dibuat.', oleh: 'Andi Pratama (Contoh)' },
        { tanggal: '2026-01-01', catatan: 'Order dikonversi menjadi kontrak PKS-001/2026.', oleh: 'Andi Pratama (Contoh)' },
      ],
      satker: S,
    },
    {
      id: 'PRS-03',
      namaInstansi: 'Yayasan Pendidikan Cahaya Bangsa (Contoh)',
      kontakNama: 'Agus Santoso',
      kontakJabatan: 'Ketua Yayasan',
      telepon: '0813-5566-7788',
      sumber: 'Kunjungan',
      layananDiminati: 'Dukungan Layanan',
      tahap: 'Ditolak',
      penanggungJawab: 'Andi Pratama (Contoh)',
      nilaiPerkiraan: 5000000,
      catatan: 'Tidak lanjut — dokumen persyaratan tidak lengkap (lihat PJ-003).',
      riwayat: [
        { tanggal: '2026-09-15', catatan: 'Prospek dicatat dari kunjungan; pengajuan PJ-003 masuk.', oleh: 'Andi Pratama (Contoh)' },
        { tanggal: '2026-09-20', catatan: 'Quotation QTN-03 ditolak pemohon.', oleh: 'Andi Pratama (Contoh)' },
      ],
      satker: S,
    },
    {
      id: 'PRS-04',
      namaInstansi: 'CV Sinar Pagi Palembang (Contoh)',
      kontakNama: 'Maya Putri',
      kontakJabatan: 'Pemilik',
      telepon: '0811-9900-1122',
      email: 'maya@sinarpagi.co.id',
      sumber: 'Event',
      layananDiminati: 'Ad-Lib / Jingle',
      tahap: 'Prospek Baru',
      penanggungJawab: 'Andi Pratama (Contoh)',
      tanggalTindakLanjut: '2026-11-18',
      nilaiPerkiraan: 12000000,
      catatan: 'Bertemu di Pameran Produk UMKM (EVT-01); minta info Ad-Lib/Jingle.',
      riwayat: [
        { tanggal: '2026-10-10', catatan: 'Prospek dicatat dari event EVT-01.', oleh: 'Andi Pratama (Contoh)' },
      ],
      satker: S,
    },
  ],

  quotation: [
    {
      id: 'QTN-01',
      prospectId: 'PRS-02',
      tanggalBuat: '2025-12-18',
      berlakuSampai: '2026-01-15',
      status: 'Disetujui',
      layanan: [
        {
          id: 'QTL-001',
          kategori: 'Siaran Iklan (Spot/Jingle/Filler/Advetorial)',
          kodeAkun: '425531',
          jenisPnBP: 'Fungsional',
          satuan: 'Termin',
          tarif: 12000000,
          jumlah: 4,
          subtotal: 48000000,
          programa: 'Pro 1',
        },
      ],
      nilai: 48000000,
      catatan: 'Penawaran awal; disetujui 2025-12-22, lanjut ke order ORD-01.',
      satker: S,
    },
    {
      id: 'QTN-02',
      prospectId: 'PRS-01',
      tanggalBuat: '2026-11-10',
      berlakuSampai: '2026-11-30',
      status: 'Dikirim',
      layanan: [
        {
          id: 'QTL-002',
          kategori: 'Siaran Iklan (Spot/Jingle/Filler/Advetorial)',
          kodeAkun: '425531',
          jenisPnBP: 'Fungsional',
          satuan: 'Bulan',
          tarif: 3000000,
          jumlah: 3,
          subtotal: 9000000,
          programa: 'Pro 1',
        },
      ],
      nilai: 9000000,
      catatan: 'Paket kampanye 3 bulan; menunggu keputusan direksi.',
      satker: S,
    },
    {
      id: 'QTN-03',
      prospectId: 'PRS-03',
      tanggalBuat: '2026-09-18',
      berlakuSampai: '2026-10-02',
      status: 'Ditolak',
      layanan: [
        {
          id: 'QTL-003',
          kategori: 'Dukungan Layanan',
          kodeAkun: '425131',
          jenisPnBP: 'Umum',
          satuan: 'Paket',
          tarif: 5000000,
          jumlah: 1,
          subtotal: 5000000,
        },
      ],
      nilai: 5000000,
      catatan: 'Ditolak pemohon — anggaran yayasan tidak mencukupi.',
      satker: S,
    },
  ],

  order: [
    {
      id: 'ORD-01',
      quotationId: 'QTN-01',
      prospectId: 'PRS-02',
      tanggalOrder: '2025-12-22',
      status: 'Selesai',
      nilai: 48000000,
      catatan: 'Order dipenuhi — dikonversi menjadi kontrak PKS-001/2026.',
      satker: S,
    },
  ],

  meeting: [
    {
      id: 'MTG-01',
      tanggal: '2026-11-18',
      jam: '10:00',
      prospectId: 'PRS-01',
      peserta: 'Andi Pratama (Contoh), Hendra Wijaya (PT Cahaya Media)',
      agenda: 'Presentasi paket iklan 3 bulan (QTN-02)',
      hasil: 'Menunggu keputusan direksi; tindak lanjut 20/11/2026.',
      clientRepresentatives: ['Hendra Wijaya'],
      contactPersonNama: 'Hendra Wijaya',
      contactPersonTelepon: '0812-7788-9900',
      rriRepresentatives: ['Andi Pratama (Contoh)'],
      satker: S,
    },
    {
      id: 'MTG-02',
      tanggal: '2025-12-15',
      jam: '14:00',
      prospectId: 'PRS-02',
      peserta: 'Andi Pratama (Contoh), Rina Wijaya (PT Swara Media)',
      agenda: 'Pembahasan kebutuhan siaran iklan tahun 2026',
      hasil: 'Sepakat — lanjut ke quotation QTN-01.',
      clientRepresentatives: ['Rina Wijaya'],
      contactPersonNama: 'Rina Wijaya',
      contactPersonTelepon: '0812-3456-7890',
      rriRepresentatives: ['Andi Pratama (Contoh)'],
      satker: S,
    },
  ],

  event: [
    {
      id: 'EVT-01',
      nama: 'Pameran Produk UMKM Palembang (Contoh)',
      tanggal: '2026-10-10',
      penyelenggara: 'Dinas Koperasi dan UKM Kota Palembang',
      biaya: 2500000,
      hasil: '12 prospek baru tercatat; 1 di antaranya CV Sinar Pagi (PRS-04).',
      prospectId: 'PRS-04',
      satker: S,
    },
    {
      id: 'EVT-02',
      nama: 'Talkshow Radio Pro 1 — HUT RRI (Contoh)',
      tanggal: '2026-09-11',
      penyelenggara: 'LPP RRI Palembang',
      biaya: 0,
      hasil: 'Liputan 2 jam; 3 calon pengiklan menyatakan minat.',
      satker: S,
    },
  ],

  advertisement: [
    {
      id: 'ADV-01',
      nama: 'Iklan layanan Siaran Iklan — media sosial (Contoh)',
      media: 'Media Sosial (Instagram/Facebook)',
      periodeMulai: '2026-10-01',
      periodeSelesai: '2026-10-31',
      biaya: 1500000,
      hasil: '8 pertanyaan masuk; 2 menjadi prospek.',
      satker: S,
    },
  ],

  task: [
    {
      id: 'TSK-01',
      pemilik: 'Andi Pratama (Contoh)',
      judul: 'Hubungi PT Cahaya Media — tindak lanjut quotation QTN-02',
      tenggat: '2026-11-20',
      status: 'Berjalan',
      terkaitId: 'PRS-01',
      terkaitLabel: 'Prospek PRS-01',
      satker: S,
    },
    {
      id: 'TSK-02',
      pemilik: 'Dewi Lestari (Contoh)',
      judul: 'Lengkapi dokumen pengajuan PJ-002',
      tenggat: '2026-11-18',
      status: 'Berjalan',
      satker: S,
    },
    {
      id: 'TSK-03',
      pemilik: 'Andi Pratama (Contoh)',
      judul: 'Siapkan materi presentasi event pameran UMKM',
      tenggat: '2026-10-09',
      status: 'Selesai',
      terkaitId: 'EVT-01',
      terkaitLabel: 'Event EVT-01',
      satker: S,
    },
    {
      id: 'TSK-04',
      pemilik: 'Siti Rahmawati (Contoh)',
      judul: 'Verifikasi laporan PNBP Oktober 2026',
      tenggat: '2026-11-14',
      status: 'Ditutup',
      disposisiDari: 'DIS-01',
      instruksi: 'Verifikasi laporan PNBP Oktober 2026 sebelum tanggal 10 November 2026.',
      pemberiDisposisi: 'Ahmad Fauzi (Contoh)',
      satker: S,
    },
    {
      id: 'TSK-05',
      pemilik: 'Andi Pratama (Contoh)',
      judul: 'Susun daftar prospek prioritas November 2026',
      tenggat: '2026-11-21',
      status: 'Berjalan',
      disposisiDari: 'DIS-02',
      instruksi: 'Susun daftar prospek prioritas bulan November berdasarkan nilai pipeline.',
      pemberiDisposisi: 'Siti Rahmawati (Contoh)',
      terkaitId: 'PRS-01',
      terkaitLabel: 'Prospek PRS-01',
      satker: S,
    },
  ],
  // Fase C — Service (PRD Bab 7.8): koleksi baru, mulai kosong.
  tiket: [],
  umpanBalik: [],
  // PR #49 — 9 artikel regulasi + FAQ bersumber regulasi (daftar kanonis).
  artikelKB: ARTIKEL_REGULASI,
  faq: FAQ_REGULASI,
  // Fase C — Chat antar operator (PR #45): tanpa pesan contoh.
  pesan: [],
  // Panel Order — enam tabel (PR #115): lima tabel baru mulai kosong.
  adsQuotationRequest: [],
  venueBookOrder: [],
  spaceRentOrder: [],
  trainingOrder: [],
  mediaPartnerOrder: [],
  // Memorandum of Understanding (impor MoU 19/11/2026): 44 record
  // dari file pengguna — data tersendiri, bukan kontrak. Isinya di
  // src/lib/seedMou.ts (dibuat scripts/impor-mou.py); JANGAN pindahkan
  // ke sini — impor.mjs menulis ulang file ini dan akan menghapusnya.
  mou: MOU_NYATA,
  // Commitment (impor Commitment 19/11/2026): 4 record dukungan
  // layanan dari file pengguna — data tersendiri seperti MoU, bukan
  // kontrak. Isinya di src/lib/seedCommitment.ts (dibuat
  // scripts/impor-commitment.py); JANGAN pindahkan ke sini — impor.mjs
  // menulis ulang file ini dan akan menghapusnya.
  commitment: COMMITMENT_NYATA,
};

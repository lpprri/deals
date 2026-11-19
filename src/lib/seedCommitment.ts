// Data Commitment NYATA Palembang — hasil impor file pengguna
// "Dukungan_Layanan_2026.xlsx" (sheet 'Semarak Ramadhan', baris 7-19).
// Dibuat OTOMATIS oleh scripts/impor-commitment.py — JANGAN diubah
// manual; ubah sumbernya (xlsx) lalu jalankan ulang skrip ini.
// Tanggal impor: 2026-11-19; satker: PALEMBANG (pilot).
//
// ISI: 4 record Commitment (dukungan layanan) — 1 kegiatan
// "Pekan Tilawatil Qur'an" dengan 4 mitra, 13 baris item dukungan
// (barang: Kipas Angin, Rice Cooker, Dispenser, Setrika). Keputusan
// pengguna 19/11/2026: Commitment adalah data TERPISAH seperti MoU,
// BUKAN kontrak (total kontrak/totals PNBP tidak berubah). Panel
// Commitment membaca koleksi `commitment`.
// - PERHATIAN TANGGAL: nama file menyebut 2026, tapi data kegiatan
//   adalah 13 Maret 2024 (kolom C) — tanggal disimpan 2024-03-13
//   apa adanya dari file. Jangan "betulkan" ke 2026 tanpa pengguna.
// - Nama mitra apa adanya dari file: 'Bank Syariah Indonesian
//   Kenten 2' (dengan "Indonesian", bukan "Indonesia").
// - LAYANAN/BENEFIT (kolom N-Q) dan NILAI KONVERSI (R) kosong ('-')
//   di semua baris — disimpan '—'; tidak ada benefit/nilai konversi
//   yang dikarang.
// - id record = nomor dokumen (mis. '001/RRI.PLB/PKS.DL/03/2024');
//   mengandung '/', di-encode saat tulis Firestore seperti id
//   kontrak dan id MoU.

import type { Commitment } from './types';

export const COMMITMENT_NYATA: Commitment[] = [
  {
    "id": "001/RRI.PLB/PKS.DL/03/2024",
    "kegiatan": "Pekan Tilawatil Qur'an",
    "tanggalKegiatan": "2024-03-13",
    "mitra": "Bank Syariah Indonesian Kenten 2",
    "penandatangan": "Dwi Cahyadi",
    "jabatanPenandatangan": "General Manager",
    "dukungan": [
      {
        "jenis": "Kipas Angin",
        "qty": 4,
        "hargaSatuan": 300000,
        "jumlah": 1200000
      },
      {
        "jenis": "Rice Cooker",
        "qty": 4,
        "hargaSatuan": 250000,
        "jumlah": 1000000
      },
      {
        "jenis": "Dispenser",
        "qty": 4,
        "hargaSatuan": 200000,
        "jumlah": 800000
      }
    ],
    "totalDukungan": 3000000,
    "layanan": "—",
    "nilaiKonversi": "—",
    "dokumen": "Surat Penawaran 001 Pekan Tilawatil Qur'an - Bank Syariah Indonesian Kenten 2",
    "nomorDokumen": "001",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "002/RRI.PLB/PKS.DL/03/2024",
    "kegiatan": "Pekan Tilawatil Qur'an",
    "tanggalKegiatan": "2024-03-13",
    "mitra": "Bank Sumsel Babel Syariah",
    "penandatangan": "Dipo Nugraha",
    "jabatanPenandatangan": "Wakil Pemimpin Cabang Bank Sumsel Babel Cabang Syariah Palembang",
    "dukungan": [
      {
        "jenis": "Kipas Angin",
        "qty": 2,
        "hargaSatuan": 300000,
        "jumlah": 600000
      },
      {
        "jenis": "Rice Cooker",
        "qty": 2,
        "hargaSatuan": 250000,
        "jumlah": 500000
      },
      {
        "jenis": "Dispenser",
        "qty": 2,
        "hargaSatuan": 200000,
        "jumlah": 400000
      }
    ],
    "totalDukungan": 1500000,
    "layanan": "—",
    "nilaiKonversi": "—",
    "dokumen": "Surat Penawaran 002 Pekan Tilawatil Qur'an - Bank Sumsel Babel Syariah",
    "nomorDokumen": "002",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "003/RRI.PLB/PKS.DL/03/2024",
    "kegiatan": "Pekan Tilawatil Qur'an",
    "tanggalKegiatan": "2024-03-13",
    "mitra": "Pondok Pesantren Daarul Qur'an Fathimah Azzahra",
    "penandatangan": "Suadi",
    "jabatanPenandatangan": "Pembina",
    "dukungan": [
      {
        "jenis": "Kipas Angin",
        "qty": 2,
        "hargaSatuan": 300000,
        "jumlah": 600000
      },
      {
        "jenis": "Rice Cooker",
        "qty": 2,
        "hargaSatuan": 250000,
        "jumlah": 500000
      },
      {
        "jenis": "Dispenser",
        "qty": 2,
        "hargaSatuan": 200000,
        "jumlah": 400000
      },
      {
        "jenis": "Setrika",
        "qty": 4,
        "hargaSatuan": 100000,
        "jumlah": 400000
      }
    ],
    "totalDukungan": 1900000,
    "layanan": "—",
    "nilaiKonversi": "—",
    "dokumen": "Surat Penawaran 003 Pekan Tilawatil Qur'an - Pondok Pesantren Daarul Qur'an Fathimah Azzahra",
    "nomorDokumen": "003",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "004/RRI.PLB/PKS.DL/03/2024",
    "kegiatan": "Pekan Tilawatil Qur'an",
    "tanggalKegiatan": "2024-03-13",
    "mitra": "Baznas Provinsi Sumatera Selatan",
    "penandatangan": "Hendra Praja",
    "jabatanPenandatangan": "Ketua Pelaksana",
    "dukungan": [
      {
        "jenis": "Dispenser",
        "qty": 8,
        "hargaSatuan": 1000000,
        "jumlah": 8000000
      },
      {
        "jenis": "Kipas Angin",
        "qty": 4,
        "hargaSatuan": 300000,
        "jumlah": 1200000
      },
      {
        "jenis": "Rice Cooker",
        "qty": 4,
        "hargaSatuan": 250000,
        "jumlah": 1000000
      }
    ],
    "totalDukungan": 10200000,
    "layanan": "—",
    "nilaiKonversi": "—",
    "dokumen": "Surat Penawaran 004 Pekan Tilawatil Qur'an - Baznas Provinsi Sumatera Selatan",
    "nomorDokumen": "004",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  }
];

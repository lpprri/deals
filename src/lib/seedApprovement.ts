// Data Approvement DUMMY — surat persetujuan Kepala RRI atas permintaan
// media partner (definisi pengguna 24/11/2026: tab Media Partner berisi
// surat persetujuan; field nomor surat, nama klien, jenis klien, nama
// narahubung, tanggal pelaksanaan, jenis kompensasi, nilai kompensasi,
// dokumen). Dibuat sebagai data contoh karena panel Approvement masih
// kosong (0 record) dan pengguna meminta daftar dummy mahasiswa +
// komunitas.
//
// ISI: 4 record — 2 organisasi mahasiswa + 2 komunitas. Semua nama
// klien generik + "(Contoh)"; JANGAN pakai nama organisasi nyata yang
// tidak terverifikasi. Nilai kompensasi Rp0 untuk kompensasi non-uang
// (barter publikasi/liputan); satu record berupa uang (Rp2.500.000)
// sebagai contoh kompensasi tunai. Dokumen '—' semua (tahap upload
// dokumen masih ditunda per keputusan pengguna 17/11/2026).
// Satker: PALEMBANG (41) semua.
// - id record = 'APR-01' … 'APR-04' (bukan nomor surat; nomor surat
//   ada di field `nomorSurat`).
// - tanggalPelaksanaan = 'yyyy-mm-dd'.

import type { Approvement } from './types';

export const APPROVEMENT_DUMMY: Approvement[] = [
  {
    id: 'APR-01',
    nomorSurat: '001/RRI.PLB/MP/01/2026',
    namaKlien: 'Badan Eksekutif Mahasiswa (Contoh)',
    jenisKlien: 'Mahasiswa',
    namaNarahubung: 'Rina Marlina',
    tanggalPelaksanaan: '2026-03-14',
    jenisKompensasi: 'Publikasi kegiatan di media sosial RRI',
    nilaiKompensasi: 0,
    dokumen: '—',
    satker: {
      kode: '41',
      nama: 'PALEMBANG',
    },
  },
  {
    id: 'APR-02',
    nomorSurat: '002/RRI.PLB/MP/02/2026',
    namaKlien: 'Himpunan Mahasiswa Ilmu Komunikasi (Contoh)',
    jenisKlien: 'Mahasiswa',
    namaNarahubung: 'Dedi Saputra',
    tanggalPelaksanaan: '2026-04-20',
    jenisKompensasi: 'Liputan dan wawancara program radio',
    nilaiKompensasi: 0,
    dokumen: '—',
    satker: {
      kode: '41',
      nama: 'PALEMBANG',
    },
  },
  {
    id: 'APR-03',
    nomorSurat: '003/RRI.PLB/MP/03/2026',
    namaKlien: 'Komunitas Fotografi Palembang (Contoh)',
    jenisKlien: 'Komunitas',
    namaNarahubung: 'Sari Wulandari',
    tanggalPelaksanaan: '2026-05-10',
    jenisKompensasi: 'Ruang pameran foto di lobi RRI Palembang',
    nilaiKompensasi: 0,
    dokumen: '—',
    satker: {
      kode: '41',
      nama: 'PALEMBANG',
    },
  },
  {
    id: 'APR-04',
    nomorSurat: '004/RRI.PLB/MP/05/2026',
    namaKlien: 'Komunitas Musik Akustik Palembang (Contoh)',
    jenisKlien: 'Komunitas',
    namaNarahubung: 'Budi Santoso',
    tanggalPelaksanaan: '2026-06-06',
    jenisKompensasi: 'Siaran langsung penampilan akustik',
    nilaiKompensasi: 2500000,
    dokumen: '—',
    satker: {
      kode: '41',
      nama: 'PALEMBANG',
    },
  },
];

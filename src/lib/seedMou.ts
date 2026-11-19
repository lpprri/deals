// Data MoU NYATA Palembang — hasil impor file pengguna
// "Rekapitulasi_Nota_Kesepahaman.xlsx" (sheet '2026', baris 6-49).
// Dibuat OTOMATIS oleh scripts/impor-mou.py — JANGAN diubah manual;
// ubah sumbernya (xlsx) lalu jalankan ulang skrip ini.
// Tanggal impor: 2026-11-19; satker: PALEMBANG (pilot).
//
// ISI: 44 record Memorandum of Understanding — 26 Nota Kesepahaman,
// 17 Perjanjian Kerjasama, 1 Pelaksanaan Kerja Sama. Keputusan pengguna
// 19/11/2026: SEMUA 44 baris adalah MoU meski penyebutan JENIS berbeda;
// label JENIS asli disimpan di field `jenis`. Data ini TERPISAH dari
// kontrak PNBP (bukan kontrak; total kontrak/totals PNBP tidak berubah).
// Panel Memorandum of Understanding membaca koleksi `mou`.
// - Nomor dokumen digabung dari 5 kolom (mis. '008/RRI-PLB/KJM.02.04/
//   01/2026'); id record = nomor dokumen (mengandung '/', di-encode
//   saat tulis Firestore seperti id kontrak).
// - PIC apa adanya: 'Dessi' (5) dan 'Dessi Maya Sari' (2) TIDAK
//   digabung; 'Selvia Lena' (4) bukan operator — tetap disimpan;
//   PIC kosong di sumber (1 baris, 037) dikoreksi pengguna 19/11/2026
//   menjadi 'Ja'far' (lihat KOREKSI_037 di scripts/impor-mou.py).
// - Nama instansi 037 dibersihkan dari backtick nyasar di akhir
//   ('Komunitas Wirausaha Tangan Di Atas`' -> tanpa backtick).
// - DOKUMEN kosong (21 baris) -> '—'.
// - Masa berlaku '2 tahun' dinormalisasi ke '2 Tahun'.
// - Typo tahun sumber (2 baris): periode '7 April 0206' (baris 28) dan
//   '6 May 0206' (baris 29) dibaca sebagai 2026 — hari+bulan cocok
//   dengan tanggal penandatanganan baris itu (2026-04-07 / 2026-05-06);
//   Q baris 29 (masa '1 Hari') = 2026-05-06. Bila pengguna mengoreksi,
//   ubah xlsx lalu jalankan ulang skrip ini.
// - klienId (dua peran 19/11/2026): 3 record tertaut ke klien lewat
//   pencocokan nama instansi PERSIS (035 → KLN-030 BNN Sumsel,
//   043 → KLN-014 Diskominfo OKU Selatan, 045 → KLN-009 Diskominfo
//   Banyuasin); 41 lainnya tanpa klienId — termasuk near-miss 039
//   "…Ogan Komering Ulu" (tanpa "Selatan") yang SENGAJA tidak ditautkan
//   ke KLN-014. Lihat KLIEN_MOU di scripts/impor-mou.py.

import type { Mou } from './types';

export const MOU_NYATA: Mou[] = [
  {
    "id": "008/RRI-PLB/KJM.02.04/01/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "Pemerintah Kota Palembang",
    "kategori": "Pemerintah Daerah",
    "narahubung": "Diky",
    "telepon": "081177538284",
    "tematik": "Program siaran Kepala Daerah Menyapa",
    "astaCita": "Pembangunan daerah dan budaya",
    "judul": "Penyediaan Kanal Sosialisasi Program dan Penyediaan Materi Berita Online",
    "tanggalTandaTangan": "2026-01-20",
    "tanggalMulai": "2026-01-20",
    "tanggalSelesai": "2027-01-20",
    "masaBerlaku": "1 Tahun",
    "dokumen": "DOKUMEN NOTA KESEPAHAMAN",
    "pic": "Selvia Lena",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "003/RRI-PLB/KJM.02.04/01/2026",
    "jenis": "Perjanjian Kerjasama",
    "instansi": "Fakultas Ushuluddin dan Pemikiran Islam UIN Raden Fatah Palembang",
    "kategori": "Universitas",
    "narahubung": "Almunadi",
    "telepon": "081368637781",
    "tematik": "Program siaran Mutiara Pagi",
    "astaCita": "Edukasi keagamaan dan moderasi beragama",
    "judul": "Pendidikan, Pengajaran, Penelitian, Pengabdian, Dakwah Islam dan Kemahasiswaan",
    "tanggalTandaTangan": "2026-01-26",
    "tanggalMulai": "2026-01-26",
    "tanggalSelesai": "2028-01-26",
    "masaBerlaku": "2 Tahun",
    "dokumen": "DOKUMEN PERJANJIAN KERJA SAMA",
    "pic": "Nadya Pratita",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "001/RRI-PLB/KJM.02.04/01/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "Satuan Tugas Wilayah Sumatera Selatan Detasemen Khusus 88 Anti Teror Kepolisian Republik Indonesia",
    "kategori": "Instansi Pemerintahan",
    "narahubung": "Fachrurozi",
    "telepon": "081377914928",
    "tematik": "Program siaran Moderasi Beragama",
    "astaCita": "Moderasi beragama, pencegahan radikalisme dan intoleransi",
    "judul": "Penyebaran Informasi Program Asta Cita",
    "tanggalTandaTangan": "2026-01-29",
    "tanggalMulai": "2026-01-29",
    "tanggalSelesai": "2028-01-29",
    "masaBerlaku": "2 Tahun",
    "dokumen": "DOKUMEN NOTA KESEPAHAMAN",
    "pic": "Dessi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "002/RRI-PLB/KJM.02.04/02/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "Kantor Kementerian Agama Kota Palembang",
    "kategori": "Instansi Pemerintahan",
    "narahubung": "Ahmad Muhajirin",
    "telepon": "081532474779",
    "tematik": "Program siaran Mutiara Pagi",
    "astaCita": "Kerukunan umat dan moderasi beragama",
    "judul": "Penyebaran Informasi Program Asta Cita",
    "tanggalTandaTangan": "2026-02-03",
    "tanggalMulai": "2026-02-03",
    "tanggalSelesai": "2028-02-03",
    "masaBerlaku": "2 Tahun",
    "dokumen": "DOKUMEN NOTA KESEPAHAMAN",
    "pic": "A. Kadir Kurniawan",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "005/RRI-PLB/KJM.02.04/02/2026",
    "jenis": "Perjanjian Kerjasama",
    "instansi": "Aliansi Perempuan Peduli Indonesia (ALPPIND) Sumsel",
    "kategori": "Komunitas",
    "narahubung": "Eny Gusita Sayuti",
    "telepon": "08117104165",
    "tematik": "Program siaran Pengarusutamaan Gender dan Inklusi",
    "astaCita": "Pemberdayaan perempuan",
    "judul": "Penyebaran Informasi Program Asta Cita",
    "tanggalTandaTangan": "2026-02-10",
    "tanggalMulai": "2026-02-10",
    "tanggalSelesai": "2028-02-10",
    "masaBerlaku": "2 Tahun",
    "dokumen": "DOKUMEN NOTA KESEPAHAMAN",
    "pic": "A. Kadir Kurniawan",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "004/RRI-PLB/KJM.02.04/02/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "Pemerintah Kota Pagar Alam",
    "kategori": "Pemerintah Daerah",
    "narahubung": "Ayung Chairuddin",
    "telepon": "08117312346",
    "tematik": "Program siaran Kepala Daerah Menyapa",
    "astaCita": "Pembangunan daerah dan budaya",
    "judul": "Kerja Sama Penyiaran Informasi Pemerintah Kota Pagar Alam",
    "tanggalTandaTangan": "2026-02-13",
    "tanggalMulai": "2026-02-13",
    "tanggalSelesai": "2030-02-28",
    "masaBerlaku": "4 Tahun",
    "dokumen": "DOKUMEN NOTA KESEPAHAMAN",
    "pic": "Selvia Lena",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "006/RRI-PLB/KJM.02.04/02/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "Pemerintah Kabupaten Banyuasin",
    "kategori": "Pemerintah Daerah",
    "narahubung": "Titin",
    "telepon": "081367008599",
    "tematik": "Program siaran Kepala Daerah Menyapa",
    "astaCita": "Pembangunan daerah dan budaya",
    "judul": "Kerja Sama Penyiaran Informasi Pemerintah Daerah Kabupaten Banyuasin",
    "tanggalTandaTangan": "2026-02-13",
    "tanggalMulai": "2026-02-13",
    "tanggalSelesai": "2028-02-13",
    "masaBerlaku": "2 Tahun",
    "dokumen": "DOKUMEN NOTA KESEPAHAMAN",
    "pic": "Dessi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "007/RRI-PLB/KJM.02.04/02/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "Universitas Kader Bangsa",
    "kategori": "Universitas",
    "narahubung": "Medy Purwato",
    "telepon": "085273219700",
    "tematik": "Program siaran Indonesia Cerdas",
    "astaCita": "Edukasi dan pengembangan SDM",
    "judul": "Peningkatan Program Siaran dan Pendidikan, Penelitian, Pengabdian Kepada Masyarakat",
    "tanggalTandaTangan": "2026-02-13",
    "tanggalMulai": "2026-02-13",
    "tanggalSelesai": "2028-02-13",
    "masaBerlaku": "2 Tahun",
    "dokumen": "DOKUMEN NOTA KESEPAHAMAN",
    "pic": "Selvia Lena",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "009/RRI-PLB/KJM.02.04/02/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "Pemerintah Kabupaten Ogan Komering Ulu Selatan",
    "kategori": "Pemerintah Daerah",
    "narahubung": "Anggia Dini",
    "telepon": "082119631988",
    "tematik": "Program siaran Kepala Daerah Menyapa",
    "astaCita": "Pembangunan daerah dan budaya",
    "judul": "Kerja Sama Penyiaran Informasi Pemerintah Daerah Ogan Komering Ulu Selatan",
    "tanggalTandaTangan": "2026-02-18",
    "tanggalMulai": "2026-02-18",
    "tanggalSelesai": "2028-02-18",
    "masaBerlaku": "2 Tahun",
    "dokumen": "DOKUMEN NOTA KESEPAHAMAN",
    "pic": "A. Kadir Kurniawan",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "010/RRI-PLB/KJM.02.04/02/2026",
    "jenis": "Perjanjian Kerjasama",
    "instansi": "STISIPOL Candradimuka",
    "kategori": "Universitas",
    "narahubung": "Debi",
    "telepon": "081366631369",
    "tematik": "Program siaran Indonesia Cerdas",
    "astaCita": "Edukasi dan pengembangan SDM",
    "judul": "Peningkatan Program Siaran dan Pendidikan",
    "tanggalTandaTangan": "2026-02-27",
    "tanggalMulai": "2026-02-27",
    "tanggalSelesai": "2028-02-27",
    "masaBerlaku": "2 Tahun",
    "dokumen": "DOKUMEN NOTA KESEPAHAMAN",
    "pic": "A. Kadir Kurniawan",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "011/RRI-PLB/KJM.02.04/03/2027",
    "jenis": "Nota Kesepahaman",
    "instansi": "Universitas Multi Data Palembang",
    "kategori": "Universitas",
    "narahubung": "Karisma Ayu",
    "telepon": "085758820001",
    "tematik": "Program siaran Indonesia Cerdas",
    "astaCita": "Edukasi, pengembangan SDM, dan literasi digital",
    "judul": "Kerja Sama Pendidikan, Penelitian, Pengabdian Kepada Masyarakat, dan Peningkatan Program Siaran",
    "tanggalTandaTangan": "2026-03-04",
    "tanggalMulai": "2026-03-04",
    "tanggalSelesai": "2028-03-04",
    "masaBerlaku": "2 Tahun",
    "dokumen": "DOKUMEN NOTA KESEPAHAMAN",
    "pic": "Nadya Pratita",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "012/RRI-PLB/KJM.02.04/03/2028",
    "jenis": "Nota Kesepahaman",
    "instansi": "Lembaga Dakwah Nahdlatul Ulama Sumatera Selatan",
    "kategori": "Organisasi Kemasyarakatan",
    "narahubung": "Abdul Assaad",
    "telepon": "08117882534",
    "tematik": "Program siaran Mutiara Pagi",
    "astaCita": "Edukasi keagamaan dan moderasi beragama",
    "judul": "Program Acara Siaran Agama Islam",
    "tanggalTandaTangan": "2026-03-05",
    "tanggalMulai": "2026-03-05",
    "tanggalSelesai": "2028-03-05",
    "masaBerlaku": "2 Tahun",
    "dokumen": "DOKUMEN NOTA KESEPAHAMAN",
    "pic": "A. Kadir Kurniawan",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "014/RRI-PLB/KJM.02.04/03/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "Dewan Kesenian Palembang",
    "kategori": "Komunitas",
    "narahubung": "Faldy Ronaldo",
    "telepon": "081278470617",
    "tematik": "Program siaran Dialog Palembang Malam Ini - Obrolan Komunitas (Sanggar Sastra)",
    "astaCita": "Pelestarian seni dan budaya",
    "judul": "Program Penyiaran dan Pelestarian Budaya",
    "tanggalTandaTangan": "2026-03-06",
    "tanggalMulai": "2026-03-06",
    "tanggalSelesai": "2028-03-06",
    "masaBerlaku": "2 Tahun",
    "dokumen": "DOKUMEN NOTA KESEPAHAMAN",
    "pic": "Nadya Pratita",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "013/RRI-PLB/KJM.02.04/03/2029",
    "jenis": "Nota Kesepahaman",
    "instansi": "Asosiasi Pengusaha Pempek Palembang",
    "kategori": "Asosiasi Pelaku Usaha",
    "narahubung": "Yenni Anggraini",
    "telepon": "08127120033",
    "tematik": "Program siaran UMKM Bicara",
    "astaCita": "UMKM dan ekonomi kreatif",
    "judul": "Informasi Penyiaran Pemberdayaan UMKM",
    "tanggalTandaTangan": "2026-03-09",
    "tanggalMulai": "2026-03-09",
    "tanggalSelesai": "2028-03-09",
    "masaBerlaku": "2 Tahun",
    "dokumen": "DOKUMEN NOTA KESEPAHAMAN",
    "pic": "Nadya Pratita",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "015/RRI-PLB/KJM.02.04/03/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "Womens Crisis Center (WCC) Palembang",
    "kategori": "Komunitas",
    "narahubung": "Yesi Ariyani",
    "telepon": "081367674757",
    "tematik": "Program siaran Pengarusutamaan Gender dan Inklusi",
    "astaCita": "Pemberdayaan perempuan",
    "judul": "Kerja Sama Penyiaran Pengarustamaan Gender",
    "tanggalTandaTangan": "2026-03-09",
    "tanggalMulai": "2026-03-09",
    "tanggalSelesai": "2028-03-09",
    "masaBerlaku": "2 Tahun",
    "dokumen": "DOKUMEN NOTA KESEPAHAMAN",
    "pic": "A. Kadir Kurniawan",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "016/RRI-PLB/KJM.02.04/03/2026",
    "jenis": "Perjanjian Kerjasama",
    "instansi": "Badan Penanggulangan Bencana Daerah Provinsi Sumatera Selatan",
    "kategori": "Instansi Pemerintahan",
    "narahubung": "Dwi Zadine",
    "telepon": "082278414975",
    "tematik": "Program siaran Palembang Menyapa",
    "astaCita": "Edukasi dan mitigasi bencana",
    "judul": "Penyebaran Informasi dan Edukasi Penanggulangan Bencana",
    "tanggalTandaTangan": "2026-03-13",
    "tanggalMulai": "2026-03-13",
    "tanggalSelesai": "2028-03-13",
    "masaBerlaku": "2 Tahun",
    "dokumen": "DOKUMEN PERJANJIAN KERJA SAMA",
    "pic": "Nadya Pratita",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "017/RRI-PLB/KJM.02.04/03/2026",
    "jenis": "Perjanjian Kerjasama",
    "instansi": "Dinas Perpustakaan Provinsi Sumatera Selatan",
    "kategori": "Instansi Pemerintahan",
    "narahubung": "Anita Karlina",
    "telepon": "081367248457",
    "tematik": "Program Siaran Literasi Digital",
    "astaCita": "Edukasi dan literasi digital",
    "judul": "Penyebaran Informasi Program Asta Cita",
    "tanggalTandaTangan": "2026-03-31",
    "tanggalMulai": "2026-03-31",
    "tanggalSelesai": "2028-03-31",
    "masaBerlaku": "2 Tahun",
    "dokumen": "DOKUMEN PERJANJIAN KERJA SAMA",
    "pic": "A. Kadir Kurniawan",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "018/RRI-PLB/KJM.02.04/04/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "RSUP Dr. Mohammad Hoesin Palembang",
    "kategori": "Rumah Sakit",
    "narahubung": "Leni Yuspitasari",
    "telepon": "085268271981",
    "tematik": "Program siaran Indonesia Sehat",
    "astaCita": "Edukasi kesehatan masyarakat",
    "judul": "Program Siaran Indonesia Kesehatan",
    "tanggalTandaTangan": "2026-04-02",
    "tanggalMulai": "2026-04-02",
    "tanggalSelesai": "2028-04-02",
    "masaBerlaku": "2 Tahun",
    "dokumen": "DOKUMEN NOTA KESEPAHAMAN",
    "pic": "Nadya Pratita",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "019/RRI-PLB/KJM.02.04/04/2026",
    "jenis": "Pelaksanaan Kerja Sama",
    "instansi": "Balai Bahasa Provinsi Sumatera Selatan",
    "kategori": "Instansi Pemerintahan",
    "narahubung": "Hadiah",
    "telepon": "081279088440",
    "tematik": "Program Siaran Literasi Digital",
    "astaCita": "Edukasi, literasi bahasa, dan literasi digital",
    "judul": "Penyebaran Informasi Program Asta Cita",
    "tanggalTandaTangan": "2026-04-29",
    "tanggalMulai": "2026-04-29",
    "tanggalSelesai": "2028-04-29",
    "masaBerlaku": "2 Tahun",
    "dokumen": "DOKUMEN PELAKSANAAN KERJA SAMA",
    "pic": "Meliyana",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "021/RRI-PLB/KJM.02.04/04/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "SLB-B Negeri Pembina Sumatera Selatan",
    "kategori": "Sekolah",
    "narahubung": "Deni Nofita",
    "telepon": "08126741701",
    "tematik": "Program Siaran Ruang Disabilitas dan Inklusi",
    "astaCita": "Pendidikan inklusif",
    "judul": "Program Siaran Ruang Disabilitas",
    "tanggalTandaTangan": "2026-04-29",
    "tanggalMulai": "2026-04-29",
    "tanggalSelesai": "2028-04-29",
    "masaBerlaku": "2 Tahun",
    "dokumen": "DOKUMEN NOTA KESEPAHAMAN",
    "pic": "A. Kadir Kurniawan",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "022/RRI-PLB/KJM.02.04/04/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "Solidaritas Perempuan",
    "kategori": "Komunitas",
    "narahubung": "Dania",
    "telepon": "089531401128",
    "tematik": "Program Siaran Pengarusutamaan Gender dan Inklusi",
    "astaCita": "Kesetaraan gender",
    "judul": "Kerja Sama Penyiaran Pengarusutamaan Gender",
    "tanggalTandaTangan": "2026-04-29",
    "tanggalMulai": "2026-04-29",
    "tanggalSelesai": "2028-04-29",
    "masaBerlaku": "2 Tahun",
    "dokumen": "DOKUMEN NOTA KESEPAHAMAN",
    "pic": "A. Kadir Kurniawan",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "020/RRI-PLB/KJM.02.04/04/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "Perwakilan Badan Kependudukan dan Keluarga Berencana Nasional Provinsi Sumatera Selatan",
    "kategori": "Instansi Pemerintahan",
    "narahubung": "Shinta",
    "telepon": "08129678585",
    "tematik": "Program siaran Palembang Menyapa",
    "astaCita": "Edukasi kesehatan masyarakat dan ketahanan keluarga",
    "judul": "Kolaborasi Pelaksanaan Penyiaran, Promosi KIE Program Pembangunan Keluarga, Kependudukan dan Keluarga Berencana, dan Percepatan Penururan Stunting",
    "tanggalTandaTangan": "2026-04-30",
    "tanggalMulai": "2026-04-30",
    "tanggalSelesai": "2028-04-30",
    "masaBerlaku": "2 Tahun",
    "dokumen": "DOKUMEN NOTA KESEPAHAMAN",
    "pic": "Nadya Pratita",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "023/RRI-PLB/KJM.02.04/05/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "Pemerintah Kabupaten Ogan Komering Ulu Timur",
    "kategori": "Pemerintah Daerah",
    "narahubung": "Rosdiana, S.Sos",
    "telepon": "085267669788",
    "tematik": "Program siaran Kepala Daerah Menyapa",
    "astaCita": "Pembangunan daerah dan budaya",
    "judul": "Kerja Sama Penyiaran Informasi Pemerintah Daerah Kabupaten Ogan Komering Ulu Timur",
    "tanggalTandaTangan": "2026-04-07",
    "tanggalMulai": "2026-04-07",
    "tanggalSelesai": "2028-04-07",
    "masaBerlaku": "2 Tahun",
    "dokumen": "—",
    "pic": "A. Kadir Kurniawan",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "024/RRI-PLB/KJM.02.04/05/2026",
    "jenis": "Perjanjian Kerjasama",
    "instansi": "Universitas Multi Data Palembang",
    "kategori": "Universitas",
    "narahubung": "Karisma Ayu",
    "telepon": "085758820001",
    "tematik": "Program siaran Indonesia Cerdas",
    "astaCita": "Edukasi, pengembangan SDM, dan literasi digital",
    "judul": "Dialog Indonesia Cerdas \"Trik agar SDM Indonesia Bisa Bersaing di Kancah Global Lewat Penguasaan Data",
    "tanggalTandaTangan": "2026-05-06",
    "tanggalMulai": "2026-05-06",
    "tanggalSelesai": "2026-05-06",
    "masaBerlaku": "1 Hari",
    "dokumen": "—",
    "pic": "Meliyana",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "025/RRI-PLB/KJM.02.04/05/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "Rumah BUMN Sumsel",
    "kategori": "Komunitas",
    "narahubung": "Mukti",
    "telepon": "085279464888",
    "tematik": "Program siaran UMKM Bicara",
    "astaCita": "UMKM dan ekonomi kreatif",
    "judul": "Informasi Penyiaran Pemberdayaan UMKM",
    "tanggalTandaTangan": "2026-05-15",
    "tanggalMulai": "2026-05-15",
    "tanggalSelesai": "2027-05-15",
    "masaBerlaku": "1 Tahun",
    "dokumen": "—",
    "pic": "Nadya Pratita",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "026/RRI-PLB/KJM.02.04/05/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "Komunitas Usaha Kecil Mikro Industri Kecil Mikro Nusantara",
    "kategori": "Komunitas",
    "narahubung": "Ruda Ermansyah",
    "telepon": "082182466513",
    "tematik": "Program siaran UMKM Bicara",
    "astaCita": "UMKM dan ekonomi kreatif",
    "judul": "Informasi Penyiaran Pemberdayaan UMKM",
    "tanggalTandaTangan": "2026-05-26",
    "tanggalMulai": "2026-05-26",
    "tanggalSelesai": "2027-05-26",
    "masaBerlaku": "1 Tahun",
    "dokumen": "—",
    "pic": "A. Kadir Kurniawan",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "027/RRI-PLB/KJM.02.04/05/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "Forum Keluarga Spesial Indonesia (FORKESI) Chapter Sumatera Selatan",
    "kategori": "Komunitas",
    "narahubung": "Devie Wahyuni, S.TP.",
    "telepon": "081807150860",
    "tematik": "Program Siaran Ruang Disabilitas dan Inklusi",
    "astaCita": "Pendidikan inklusif",
    "judul": "Program Siaran Ruang Disabilitas dan Inklusi",
    "tanggalTandaTangan": "2026-05-26",
    "tanggalMulai": "2026-05-26",
    "tanggalSelesai": "2027-05-26",
    "masaBerlaku": "1 Tahun",
    "dokumen": "—",
    "pic": "A. Kadir Kurniawan",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "028/RRI-PLB/KJM.02.04/06/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "Balai Standardisasi dan Pelayanan Jasa Industri (BSPJI) Palembang",
    "kategori": "Instansi Pemerintahan",
    "narahubung": "Ridho",
    "telepon": "082388050361",
    "tematik": "Program siaran UMKM Bicara",
    "astaCita": "UMKM dan ekonomi kreatif",
    "judul": "Pelayanan Informasi Penyiaran Industri dan IKM",
    "tanggalTandaTangan": "2026-06-10",
    "tanggalMulai": "2026-06-10",
    "tanggalSelesai": "2027-06-10",
    "masaBerlaku": "1 Tahun",
    "dokumen": "—",
    "pic": "Dessi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "029/RRI-PLB/KJM.02.04/06/2026",
    "jenis": "Perjanjian Kerjasama",
    "instansi": "Sentra Budi Perkasa Palembang",
    "kategori": "Instansi Pemerintahan",
    "narahubung": "Ria Kurnia",
    "telepon": "081241585244",
    "tematik": "Program Siaran Ruang Disabilitas dan Inklusi",
    "astaCita": "Pendidikan inklusif",
    "judul": "Penyebaran Informasi Program Asta Cita",
    "tanggalTandaTangan": "2026-06-15",
    "tanggalMulai": "2026-06-15",
    "tanggalSelesai": "2028-06-15",
    "masaBerlaku": "2 Tahun",
    "dokumen": "—",
    "pic": "Dessi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "030/RRI-PLB/KJM.02.04/06/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "BPC Himpunan Pengusaha Muda Kota Palembang",
    "kategori": "Asosiasi Pelaku Usaha",
    "narahubung": "Ikhwanul Ganda",
    "telepon": "085789892746",
    "tematik": "Program siaran UMKM Bicara",
    "astaCita": "UMKM dan ekonomi kreatif",
    "judul": "Informasi Penyiaran Pemberdayaan UMKM",
    "tanggalTandaTangan": "2026-06-25",
    "tanggalMulai": "2026-06-25",
    "tanggalSelesai": "2027-06-25",
    "masaBerlaku": "1 Tahun",
    "dokumen": "—",
    "pic": "Meliyana",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "031/RRI-PLB/KJM.02.04/07/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "Pemerintah Kabupaten Musi Banyuasin",
    "kategori": "Pemerintah Daerah",
    "narahubung": "Fitria Anjelina",
    "telepon": "081373198359",
    "tematik": "Program siaran Kepala Daerah Menyapa",
    "astaCita": "Pembangunan daerah dan budaya",
    "judul": "Kerja Sama Penyiaran Informasi Pemerintah Daerah Kabupaten Musi Banyuasin",
    "tanggalTandaTangan": "2026-07-06",
    "tanggalMulai": "2026-07-06",
    "tanggalSelesai": "2028-07-06",
    "masaBerlaku": "2 Tahun",
    "dokumen": "—",
    "pic": "Dessi",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "032/RRI-PLB/KJM.02.04/07/2026",
    "jenis": "Perjanjian Kerjasama",
    "instansi": "Hello Sister",
    "kategori": "Komunitas",
    "narahubung": "Nindy Voristya Wanda, S.H.",
    "telepon": "081377999717",
    "tematik": "Program Siaran Pengarusutamaan Gender dan Inklusi",
    "astaCita": "Pemberdayaan perempuan",
    "judul": "Kerja Sama Penyiaran Pengarusutamaan Gender",
    "tanggalTandaTangan": "2026-07-07",
    "tanggalMulai": "2026-07-07",
    "tanggalSelesai": "2027-07-07",
    "masaBerlaku": "1 Tahun",
    "dokumen": "—",
    "pic": "A. Kadir Kurniawan",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "034/RRI-PLB/KJM.02.04/08/2026",
    "jenis": "Perjanjian Kerjasama",
    "instansi": "DinasPenanaman Modal dan Pelayanan Terpadu Satu Pintu Kota Palembang",
    "kategori": "Instansi Pemerintahan",
    "narahubung": "Heni Erfiati",
    "telepon": "085279588806",
    "tematik": "Program Siaran Literasi Digital",
    "astaCita": "Edukasi, literasi bahasa, dan literasi digital",
    "judul": "Penyebaran Informasi Program Asta Cita",
    "tanggalTandaTangan": "2026-08-03",
    "tanggalMulai": "2026-08-03",
    "tanggalSelesai": "2028-08-03",
    "masaBerlaku": "2 Tahun",
    "dokumen": "DOKUMEN PKS",
    "pic": "Meliyana",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "035/RRI-PLB/KJM.02.04/08/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "Badan Narkotika Nasional Provinsi Sumatera Selatan",
    "kategori": "Instansi Pemerintahan",
    "narahubung": "Ratna",
    "telepon": "081269292157",
    "tematik": "Program Siaran Suara Anti Narkoba, Korupsi, dan Judi (SANKSI)",
    "astaCita": "Pembangunan SDM dan kesehatan masyarakat",
    "judul": "Pencegahan Dan Pemberantasan Penyalahgunaan Dan Peredaran Gelap Narkotika Dan Prekursor Narkotika Melalui Penyiaran",
    "tanggalTandaTangan": "2026-08-13",
    "tanggalMulai": "2026-08-13",
    "tanggalSelesai": "2028-08-13",
    "masaBerlaku": "2 Tahun",
    "dokumen": "—",
    "pic": "Dessi Maya Sari",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "klienId": "KLN-030"
  },
  {
    "id": "036/RRI-PLB/KJM.02.04/08/2026",
    "jenis": "Perjanjian Kerjasama",
    "instansi": "Dinas Pemberdayaan Perempuan dan Perlindungan Anak Provinsi Sumatera Selatan",
    "kategori": "Instansi Pemerintahan",
    "narahubung": "Yulia Rhamadini, S.Kom., M.Si",
    "telepon": "0818310779",
    "tematik": "Program Siaran Pengarusutamaan Gender dan Inklusi",
    "astaCita": "Pemberdayaan perempuan dan anak",
    "judul": "Penguatan Diseminasi Pemberdayaan Perempuan Dan\nPerlindungan Anak Di Provinsi Sumatera Selatan",
    "tanggalTandaTangan": "2026-08-20",
    "tanggalMulai": "2026-08-20",
    "tanggalSelesai": "2028-08-20",
    "masaBerlaku": "2 Tahun",
    "dokumen": "—",
    "pic": "Nadya Pratita",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "037/RRI-PLB/KJM.02.04/09/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "Komunitas Wirausaha Tangan Di Atas",
    "kategori": "Komunitas",
    "narahubung": "Muklis Rackman",
    "telepon": "08117181990",
    "tematik": "Program siaran UMKM Bicara",
    "astaCita": "UMKM dan ekonomi kreatif",
    "judul": "Informasi Penyiaran Pemberdayaan UMKM",
    "tanggalTandaTangan": "2026-09-22",
    "tanggalMulai": "2026-09-22",
    "tanggalSelesai": "2028-09-21",
    "masaBerlaku": "2 Tahun",
    "dokumen": "—",
    "pic": "Ja'far",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "038/RRI-PLB/KJM.02.04/09/2026",
    "jenis": "Nota Kesepahaman",
    "instansi": "Badan Amil Zakat Nasional (BAZNAS) Provinsi Sumatera Selatan",
    "kategori": "Pemerintah Daerah",
    "narahubung": "Supri",
    "telepon": "085279588806",
    "tematik": "Program siaran Palembang Menyapa",
    "astaCita": "Penguatan kehidupan beragama dan harmoni sosial",
    "judul": "Literasi Zakat dan Pengelolaan Zakat dan Infaq Pegawai RRI Palembang",
    "tanggalTandaTangan": "2026-09-30",
    "tanggalMulai": "2026-09-30",
    "tanggalSelesai": "2028-09-30",
    "masaBerlaku": "2 Tahun",
    "dokumen": "—",
    "pic": "A. Kadir Kurniawan",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "039/RRI-PLB/KJM.02.04/10/2026",
    "jenis": "Perjanjian Kerjasama",
    "instansi": "Dinas Komunikasi dan Informatika Kabupaten Ogan Komering Ulu",
    "kategori": "Instansi Pemerintahan",
    "narahubung": "Dede Fernandes",
    "telepon": "0735325757",
    "tematik": "Portal RRI.CO.ID",
    "astaCita": "Pembangunan daerah dan transparansi informasi publik",
    "judul": "Pemanfaatan Portal RRI.CO.ID/RRI News untuk Diseminasi Informasi Pembangunan dan Promosi Potensi Daerah",
    "tanggalTandaTangan": "2026-10-20",
    "tanggalMulai": "2026-10-20",
    "tanggalSelesai": "2028-10-19",
    "masaBerlaku": "2 Tahun",
    "dokumen": "—",
    "pic": "A. Kadir Kurniawan",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "040/RRI-PLB/KJM.02.04/10/2026",
    "jenis": "Perjanjian Kerjasama",
    "instansi": "Dinas Komunikasi dan Informatika Kabupaten Muara Enim",
    "kategori": "Instansi Pemerintahan",
    "narahubung": "Ayu Dwining Tyas",
    "telepon": "081377738177",
    "tematik": "Portal RRI.CO.ID",
    "astaCita": "Pembangunan daerah dan transparansi informasi publik",
    "judul": "Pemanfaatan Portal RRI.CO.ID/RRI News untuk Diseminasi Informasi Pembangunan dan Promosi Potensi Daerah",
    "tanggalTandaTangan": "2026-10-21",
    "tanggalMulai": "2026-10-21",
    "tanggalSelesai": "2028-10-20",
    "masaBerlaku": "2 Tahun",
    "dokumen": "—",
    "pic": "Ja'far",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "041/RRI-PLB/KJM.02.04/10/2026",
    "jenis": "Perjanjian Kerjasama",
    "instansi": "Dinas Komunikasi, Informatika, Statistik dan Persandian Kota Lubuk Linggau",
    "kategori": "Instansi Pemerintahan",
    "narahubung": "Raga Buana",
    "telepon": "0822-8947-9665",
    "tematik": "Portal RRI.CO.ID",
    "astaCita": "Pembangunan daerah dan transparansi informasi publik",
    "judul": "Pemanfaatan Portal RRI.CO.ID/RRI News untuk Diseminasi Informasi Pembangunan dan Promosi Potensi Daerah",
    "tanggalTandaTangan": "2026-10-27",
    "tanggalMulai": "2026-10-27",
    "tanggalSelesai": "2028-10-27",
    "masaBerlaku": "2 Tahun",
    "dokumen": "—",
    "pic": "Meliyana",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "042/RRI-PLB/KJM.02.04/10/2026",
    "jenis": "Perjanjian Kerjasama",
    "instansi": "Dinas Komunikasi dan Informatika Kabupaten Ogan Komering Ulu Timur",
    "kategori": "Instansi Pemerintahan",
    "narahubung": "Ruhan",
    "telepon": "0853-8467-3373",
    "tematik": "Portal RRI.CO.ID",
    "astaCita": "Pembangunan daerah dan transparansi informasi publik",
    "judul": "Pemanfaatan Portal RRI.CO.ID/RRI News untuk Diseminasi Informasi Pembangunan dan Promosi Potensi Daerah",
    "tanggalTandaTangan": "2026-10-27",
    "tanggalMulai": "2026-10-27",
    "tanggalSelesai": "2028-10-27",
    "masaBerlaku": "2 Tahun",
    "dokumen": "—",
    "pic": "A. Kadir Kurniawan",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "043/RRI-PLB/KJM.02.04/10/2026",
    "jenis": "Perjanjian Kerjasama",
    "instansi": "Dinas Komunikasi dan Informatika Kabupaten Ogan Komering Ulu Selatan",
    "kategori": "Instansi Pemerintahan",
    "narahubung": "Zakia",
    "telepon": "0812-7280-3300",
    "tematik": "Portal RRI.CO.ID",
    "astaCita": "Pembangunan daerah dan transparansi informasi publik",
    "judul": "Pemanfaatan Portal RRI.CO.ID/RRI News untuk Diseminasi Informasi Pembangunan dan Promosi Potensi Daerah",
    "tanggalTandaTangan": "2026-10-27",
    "tanggalMulai": "2026-10-27",
    "tanggalSelesai": "2028-10-27",
    "masaBerlaku": "2 Tahun",
    "dokumen": "—",
    "pic": "A. Kadir Kurniawan",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "klienId": "KLN-014"
  },
  {
    "id": "044/RRI-PLB/KJM.02.04/11/2026",
    "jenis": "Perjanjian Kerjasama",
    "instansi": "Dinas Komunikasi dan Informatika Provinsi Sumatera Selatan",
    "kategori": "Instansi Pemerintahan",
    "narahubung": "Septriandi Setia Permana, S.STP., M.Si.",
    "telepon": "0711-363480",
    "tematik": "Portal RRI.CO.ID",
    "astaCita": "Pembangunan daerah dan transparansi informasi publik",
    "judul": "Pemanfaatan Portal RRI.CO.ID/RRI News untuk Diseminasi Informasi Pembangunan dan Promosi Potensi Daerah",
    "tanggalTandaTangan": "2026-11-04",
    "tanggalMulai": "2026-11-04",
    "tanggalSelesai": "2028-11-04",
    "masaBerlaku": "2 Tahun",
    "dokumen": "—",
    "pic": "Selvia Lena",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    }
  },
  {
    "id": "045/RRI-PLB/KJM.02.04/10/2026",
    "jenis": "Perjanjian Kerjasama",
    "instansi": "Dinas Komunikasi dan Informatika Kabupaten Banyuasin",
    "kategori": "Instansi Pemerintahan",
    "narahubung": "Titin Yariyanti",
    "telepon": "0813-6700-8599",
    "tematik": "Portal RRI.CO.ID",
    "astaCita": "Pembangunan daerah dan transparansi informasi publik",
    "judul": "Pemanfaatan Portal RRI.CO.ID/RRI News untuk Diseminasi Informasi Pembangunan dan Promosi Potensi Daerah",
    "tanggalTandaTangan": "2026-10-30",
    "tanggalMulai": "2026-10-30",
    "tanggalSelesai": "2028-10-30",
    "masaBerlaku": "2 Tahun",
    "dokumen": "—",
    "pic": "Dessi Maya Sari",
    "satker": {
      "kode": "41",
      "nama": "PALEMBANG"
    },
    "klienId": "KLN-009"
  }
];

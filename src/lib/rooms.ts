// Katalog ruangan DUMMY untuk Book a Room di landing page.
// ============================================================
// DUMMY — data contoh untuk dirancang, GANTI dengan data nyata
// (master ruangan per satker).
//
// Tarif dan kapasitas di bawah ini adalah ANGKA CONTOH dan BUKAN
// tarif resmi RRI. Di UI setiap tarif ditandai lencana "(contoh)".
// Jangan jadikan angka ini acuan penagihan atau penawaran.
// Hanya 2 kota yang punya ruangan dummy: PALEMBANG dan JAKARTA.
// Kota lain menampilkan empty state jujur di UI ("belum ada
// ruangan contoh untuk kota ini") dan tetap bisa mengajukan
// permohonan umum.
// ============================================================

export interface RuanganDummy {
  id: string;
  /** Nama satker persis seperti di DAFTAR_SATKER. */
  kota: string;
  jenis: 'Auditorium' | 'Ruang Rapat' | 'Ruang Multi-Purpose' | 'Aula/Hall';
  nama: string;
  /** Jumlah kursi/orang. */
  kapasitas: number;
  /** Tarif CONTOH per hari (Rp). */
  tarifPerHari: number;
}

export const DAFTAR_RUANGAN_DUMMY: RuanganDummy[] = [
  {
    id: 'R-PLB-AUD',
    kota: 'PALEMBANG',
    jenis: 'Auditorium',
    nama: 'Auditorium RRI Palembang',
    kapasitas: 500,
    tarifPerHari: 7500000,
  },
  {
    id: 'R-PLB-RAP',
    kota: 'PALEMBANG',
    jenis: 'Ruang Rapat',
    nama: 'Ruang Rapat RRI Palembang',
    kapasitas: 30,
    tarifPerHari: 1500000,
  },
  {
    id: 'R-PLB-MUL',
    kota: 'PALEMBANG',
    jenis: 'Ruang Multi-Purpose',
    nama: 'Ruang Multi-Purpose RRI Palembang',
    kapasitas: 150,
    tarifPerHari: 3500000,
  },
  {
    id: 'R-PLB-AUL',
    kota: 'PALEMBANG',
    jenis: 'Aula/Hall',
    nama: 'Aula RRI Palembang',
    kapasitas: 300,
    tarifPerHari: 5000000,
  },
  {
    id: 'R-JKT-AUD',
    kota: 'JAKARTA',
    jenis: 'Auditorium',
    nama: 'Auditorium RRI Jakarta',
    kapasitas: 500,
    tarifPerHari: 7500000,
  },
  {
    id: 'R-JKT-RAP',
    kota: 'JAKARTA',
    jenis: 'Ruang Rapat',
    nama: 'Ruang Rapat RRI Jakarta',
    kapasitas: 30,
    tarifPerHari: 1500000,
  },
  {
    id: 'R-JKT-MUL',
    kota: 'JAKARTA',
    jenis: 'Ruang Multi-Purpose',
    nama: 'Ruang Multi-Purpose RRI Jakarta',
    kapasitas: 150,
    tarifPerHari: 3500000,
  },
  {
    id: 'R-JKT-AUL',
    kota: 'JAKARTA',
    jenis: 'Aula/Hall',
    nama: 'Aula RRI Jakarta',
    kapasitas: 300,
    tarifPerHari: 5000000,
  },
];

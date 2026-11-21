// Data DUMMY layanan tambahan (Book a Venue / Rent a Space / Get a
// Journalism Training) — keputusan pengguna 2026-11-21 10:52 WIB:
// "bangun ketiganya sekaligus, gunakan data dummy terlebih dahulu".
// DUMMY — ganti data asli: daftar venue, lahan, dan course di bawah ini
// HANYA contoh (nama, kapasitas, luas, tanggal) sampai pengguna
// memberikan daftar aslinya. TIDAK ADA foto: halaman memakai blok
// placeholder gradien biru RRI (tanpa foto stok).
//
// HARGA: hanya tarif terverifikasi dari Knowledge Base (PP 68/2020,
// artikelRegulasi.ts) — Auditorium Rp7.500.000/4 jam (sound system) atau
// Rp10.000.000/4 jam (sound + kursi + meja), Studio Rp2.000.000/3 jam,
// Pelatihan Rp2.000.000/orang/3 hari, Sertifikasi Wartawan Radio
// Rp1.500.000/orang/3 hari. Yang TIDAK ada tarif KB-nya → "Price on
// request". JANGAN mengarang angka harga lain.

/** Satu venue yang bisa dibooking (dummy). */
export interface VenueDummy {
  /** Id stabil untuk select form, mis. 'auditorium'. */
  id: string;
  /** Nama tampil, mis. 'Auditorium'. */
  nama: string;
  /** Jenis venue, mis. 'Auditorium'. */
  jenis: string;
  /** Kapasitas (DUMMY — angka contoh). */
  kapasitas: number;
  /** Fasilitas (DUMMY — contoh). */
  fasilitas: string[];
  /** Harga tampil — tarif KB PP 68/2020, atau 'Price on request'. */
  harga: string;
  /** Catatan harga (mis. paket kedua Auditorium). */
  hargaCatatan?: string;
  /** Deskripsi singkat (DUMMY — contoh). */
  deskripsi: string;
}

/** Satu lahan yang ditawarkan untuk disewa (dummy). */
export interface SpaceDummy {
  /** Id stabil untuk select form, mis. 'lahan-kenten'. */
  id: string;
  /** Nama tampil, mis. 'Open Land — Kenten'. */
  nama: string;
  /** Lokasi (DUMMY — contoh). */
  lokasi: string;
  /** Luas (DUMMY — contoh), mis. '2,500 m²'. */
  luas: string;
  /** Jenis lahan (DUMMY — contoh), mis. 'Open land'. */
  jenis: string;
  /** Harga tampil — TIDAK ada tarif KB untuk sewa lahan → 'Price on request'. */
  harga: string;
  /** Deskripsi singkat (DUMMY — contoh). */
  deskripsi: string;
}

/** Satu Scheduled Course (dummy). */
export interface CourseDummy {
  /** Id stabil untuk select form, mis. 'pelatihan-jurnalistik'. */
  id: string;
  /** Judul course, mis. 'Journalism Training'. */
  judul: string;
  /** Tanggal jadwal, 'yyyy-mm-dd' (DUMMY — contoh). */
  tanggal: string;
  /** Durasi, mis. '3 days' (DUMMY — contoh, kecuali yang tarif KB: 3 hari). */
  durasi: string;
  /** Harga tampil — tarif KB PP 68/2020, atau 'Price on request'. */
  harga: string;
  /** Deskripsi singkat (DUMMY — contoh). */
  deskripsi: string;
}

// DUMMY — ganti data asli. Venue (5): empat yang diminta pengguna +
// Studio (tarifnya ada di KB). Kapasitas + fasilitas angka contoh.
export const VENUE_DUMMY: VenueDummy[] = [
  {
    id: 'auditorium',
    nama: 'Auditorium',
    jenis: 'Auditorium',
    kapasitas: 500,
    fasilitas: ['Sound system', 'Stage', 'Seating'],
    // Tarif KB PP 68/2020: paket sound system Rp7.500.000/4 jam.
    harga: 'Rp7,500,000 / 4 hours',
    hargaCatatan:
      'Also available: Rp10,000,000 / 4 hours (sound system, chairs & tables)',
    deskripsi:
      'Large hall for seminars, graduations, and public gatherings.',
  },
  {
    id: 'hall',
    nama: 'Hall',
    jenis: 'Hall',
    kapasitas: 300,
    fasilitas: ['Sound system', 'Stage'],
    // TIDAK ada tarif KB untuk Hall → Price on request.
    harga: 'Price on request',
    deskripsi: 'Spacious hall for exhibitions, receptions, and community events.',
  },
  {
    id: 'multipurpose-room',
    nama: 'Multipurpose Room',
    jenis: 'Multipurpose Room',
    kapasitas: 150,
    fasilitas: ['Sound system', 'Projector'],
    // TIDAK ada tarif KB untuk Multipurpose Room → Price on request.
    harga: 'Price on request',
    deskripsi:
      'Flexible room for workshops, meetings, and small gatherings.',
  },
  {
    id: 'meeting-room',
    nama: 'Meeting Room',
    jenis: 'Meeting Room',
    kapasitas: 20,
    fasilitas: ['Projector', 'Whiteboard'],
    // TIDAK ada tarif KB untuk Meeting Room → Price on request.
    harga: 'Price on request',
    deskripsi: 'Private room for team meetings and discussions.',
  },
  {
    id: 'studio',
    nama: 'Studio',
    jenis: 'Studio',
    kapasitas: 10,
    fasilitas: ['Recording equipment', 'Soundproofing'],
    // Tarif KB PP 68/2020: Studio Rp2.000.000/3 jam.
    harga: 'Rp2,000,000 / 3 hours',
    deskripsi: 'Broadcast studio for recordings and live sessions.',
  },
];

// DUMMY — ganti data asli. Lahan (4). Luas + lokasi angka contoh.
// TIDAK ada tarif KB untuk sewa lahan → semua 'Price on request'.
export const SPACE_DUMMY: SpaceDummy[] = [
  {
    id: 'lahan-kenten',
    nama: 'Open Land — Kenten',
    lokasi: 'Kenten, Palembang',
    luas: '2,500 m²',
    jenis: 'Open land',
    harga: 'Price on request',
    deskripsi: 'Open land suitable for events, parking, or temporary use.',
  },
  {
    id: 'lahan-demang',
    nama: 'Commercial Plot — Demang Lebar Daun',
    lokasi: 'Demang Lebar Daun, Palembang',
    luas: '1,200 m²',
    jenis: 'Commercial plot',
    harga: 'Price on request',
    deskripsi: 'Commercial plot in a busy area, ideal for business use.',
  },
  {
    id: 'lahan-musi',
    nama: 'Riverside Land — Musi Riverbank',
    lokasi: 'Musi riverbank, Palembang',
    luas: '5,000 m²',
    jenis: 'Riverside land',
    harga: 'Price on request',
    deskripsi: 'Riverside land with open views, suitable for outdoor events.',
  },
  {
    id: 'lahan-kompleks',
    nama: 'Courtyard Space — RRI Complex',
    lokasi: 'RRI Palembang complex',
    luas: '800 m²',
    jenis: 'Courtyard / event space',
    harga: 'Price on request',
    deskripsi: 'Courtyard space inside the RRI complex for gatherings.',
  },
];

// DUMMY — ganti data asli. Scheduled Course (4). Tanggal + durasi contoh;
// dua pertama memakai tarif KB PP 68/2020 (Pelatihan Rp2.000.000/orang/
// 3 hari; Sertifikasi Wartawan Radio Rp1.500.000/orang/3 hari), dua
// lainnya 'Price on request' (TIDAK ada tarif KB-nya).
export const COURSE_DUMMY: CourseDummy[] = [
  {
    id: 'pelatihan-jurnalistik',
    judul: 'Journalism Training',
    tanggal: '2026-12-07',
    durasi: '3 days',
    // Tarif KB PP 68/2020: Jasa Pendidikan dan Pelatihan.
    harga: 'Rp2,000,000 / person / 3 days',
    deskripsi:
      'Learn the basics of journalism: news writing, reporting, and ethics.',
  },
  {
    id: 'sertifikasi-wartawan',
    judul: 'Radio Journalist Competency Certification',
    tanggal: '2026-12-14',
    durasi: '3 days',
    // Tarif KB PP 68/2020: Jasa Sertifikasi Kompetensi Wartawan Radio.
    harga: 'Rp1,500,000 / person / 3 days',
    deskripsi:
      'Competency certification for radio journalists, assessed over 3 days.',
  },
  {
    id: 'workshop-penulisan',
    judul: 'Broadcast Writing Workshop',
    tanggal: '2027-01-11',
    durasi: '2 days',
    // TIDAK ada tarif KB untuk workshop ini → Price on request.
    harga: 'Price on request',
    deskripsi:
      'Hands-on workshop on writing scripts for radio and digital broadcast.',
  },
  {
    id: 'wawancara-reportase',
    judul: 'Interview & Reporting Skills',
    tanggal: '2027-01-18',
    durasi: '2 days',
    // TIDAK ada tarif KB untuk course ini → Price on request.
    harga: 'Price on request',
    deskripsi:
      'Practical skills for interviews, field reporting, and live coverage.',
  },
];

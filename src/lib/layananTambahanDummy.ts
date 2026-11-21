// Data DUMMY layanan tambahan (Book a Venue / Rent a Space / Get a
// Journalism Training) — keputusan pengguna 2026-11-21 10:52 WIB:
// "bangun ketiganya sekaligus, gunakan data dummy terlebih dahulu".
// DUMMY — ganti data asli: daftar venue, lahan, dan course di bawah ini
// HANYA contoh (nama, kapasitas, luas, tanggal, kota, rating) sampai
// pengguna memberikan daftar aslinya.
//
// FOTO (Book a Venue): 5 foto interior yang DI-GENERATE, satu per jenis
// venue, di src/lib/fotoVenue.ts (data URI WebP). BUKAN foto stok.
// Rent a Space + Training masih tanpa foto (placeholder gradien).
//
// HARGA: hanya tarif terverifikasi dari Knowledge Base (PP 68/2020,
// artikelRegulasi.ts) — Auditorium Rp7.500.000/4 jam (sound system) atau
// Rp10.000.000/4 jam (sound + kursi + meja), Studio Rp2.000.000/3 jam,
// Pelatihan Rp2.000.000/orang/3 hari, Sertifikasi Wartawan Radio
// Rp1.500.000/orang/3 hari. Yang TIDAK ada tarif KB-nya → "Price on
// request". JANGAN mengarang angka harga lain — TIDAK ADA tarif harian di
// KB, jadi kartu menampilkan tarif paket apa adanya beserta satuannya
// (bukan tarif harian turunan).

/** Satu venue yang bisa dibooking (dummy). */
export interface VenueDummy {
  /** Id stabil untuk select form, mis. 'auditorium-palembang'. */
  id: string;
  /** Nama tampil, mis. 'Auditorium'. */
  nama: string;
  /** Jenis venue, mis. 'Auditorium'. */
  jenis: string;
  /** Kota satker (nama kanonis dari DAFTAR_SATKER, mis. 'PALEMBANG'). */
  kota: string;
  /** Kapasitas (DUMMY — angka contoh). */
  kapasitas: number;
  /** Rating klien (DUMMY — angka contoh, 4.8–4.97). */
  rating: number;
  /** Jumlah ulasan klien (DUMMY — angka contoh). */
  ulasan: number;
  /** Kunci foto di FOTO_VENUE (satu foto per jenis venue). */
  foto: string;
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

// DUMMY — ganti data asli. Venue (10) di 8 kota satker: tiga Auditorium,
// dua Hall, dua Multipurpose Room, dua Meeting Room, satu Studio (tarifnya
// ada di KB). Kapasitas + fasilitas + rating angka contoh. Kota memakai
// nama kanonis DAFTAR_SATKER (huruf besar); judul tampil memakai
// title-case ("Auditorium in Palembang").
// HARGA: Auditorium + Studio memakai tarif KB PP 68/2020; Hall /
// Multipurpose Room / Meeting Room TIDAK ada tarif KB-nya → 'Price on
// request'. Catatan paket kedua Auditorium (Rp10.000.000/4 jam) hanya di
// Palembang supaya angkanya muncul sekali.
export const VENUE_DUMMY: VenueDummy[] = [
  {
    id: 'auditorium-palembang',
    nama: 'Auditorium',
    jenis: 'Auditorium',
    kota: 'PALEMBANG',
    kapasitas: 500,
    rating: 4.95,
    ulasan: 214,
    foto: 'auditorium',
    fasilitas: ['Sound system', 'Stage', 'Seating'],
    // Tarif KB PP 68/2020: paket sound system Rp7.500.000/4 jam.
    harga: 'Rp7,500,000 / 4 hours',
    hargaCatatan:
      'Also available: Rp10,000,000 / 4 hours (sound system, chairs & tables)',
    deskripsi:
      'Large hall for seminars, graduations, and public gatherings in Palembang.',
  },
  {
    id: 'auditorium-jakarta',
    nama: 'Auditorium',
    jenis: 'Auditorium',
    kota: 'JAKARTA',
    kapasitas: 800,
    rating: 4.91,
    ulasan: 187,
    foto: 'auditorium',
    fasilitas: ['Sound system', 'Stage', 'LED screen'],
    // Tarif KB PP 68/2020: paket sound system Rp7.500.000/4 jam.
    harga: 'Rp7,500,000 / 4 hours',
    deskripsi:
      'The largest RRI auditorium, for national seminars and ceremonies in Jakarta.',
  },
  {
    id: 'auditorium-makassar',
    nama: 'Auditorium',
    jenis: 'Auditorium',
    kota: 'MAKASSAR',
    kapasitas: 450,
    rating: 4.88,
    ulasan: 96,
    foto: 'auditorium',
    fasilitas: ['Sound system', 'Stage', 'Seating'],
    // Tarif KB PP 68/2020: paket sound system Rp7.500.000/4 jam.
    harga: 'Rp7,500,000 / 4 hours',
    deskripsi:
      'Large hall for seminars and community gatherings in Makassar.',
  },
  {
    id: 'hall-bandung',
    nama: 'Hall',
    jenis: 'Hall',
    kota: 'BANDUNG',
    kapasitas: 300,
    rating: 4.93,
    ulasan: 143,
    foto: 'hall',
    fasilitas: ['Sound system', 'Stage'],
    // TIDAK ada tarif KB untuk Hall → Price on request.
    harga: 'Price on request',
    deskripsi: 'Spacious hall for exhibitions, receptions, and community events in Bandung.',
  },
  {
    id: 'hall-surabaya',
    nama: 'Hall',
    jenis: 'Hall',
    kota: 'SURABAYA',
    kapasitas: 250,
    rating: 4.85,
    ulasan: 121,
    foto: 'hall',
    fasilitas: ['Sound system', 'Stage', 'Parking'],
    // TIDAK ada tarif KB untuk Hall → Price on request.
    harga: 'Price on request',
    deskripsi: 'Spacious hall for exhibitions and receptions in Surabaya.',
  },
  {
    id: 'multipurpose-yogyakarta',
    nama: 'Multipurpose Room',
    jenis: 'Multipurpose Room',
    kota: 'YOGYAKARTA',
    kapasitas: 150,
    rating: 4.9,
    ulasan: 88,
    foto: 'multipurpose',
    fasilitas: ['Sound system', 'Projector'],
    // TIDAK ada tarif KB untuk Multipurpose Room → Price on request.
    harga: 'Price on request',
    deskripsi:
      'Flexible room for workshops, meetings, and small gatherings in Yogyakarta.',
  },
  {
    id: 'multipurpose-medan',
    nama: 'Multipurpose Room',
    jenis: 'Multipurpose Room',
    kota: 'MEDAN',
    kapasitas: 120,
    rating: 4.82,
    ulasan: 76,
    foto: 'multipurpose',
    fasilitas: ['Sound system', 'Projector', 'Whiteboard'],
    // TIDAK ada tarif KB untuk Multipurpose Room → Price on request.
    harga: 'Price on request',
    deskripsi:
      'Flexible room for workshops and small gatherings in Medan.',
  },
  {
    id: 'meeting-palembang',
    nama: 'Meeting Room',
    jenis: 'Meeting Room',
    kota: 'PALEMBANG',
    kapasitas: 20,
    rating: 4.97,
    ulasan: 203,
    foto: 'meeting',
    fasilitas: ['Projector', 'Whiteboard'],
    // TIDAK ada tarif KB untuk Meeting Room → Price on request.
    harga: 'Price on request',
    deskripsi: 'Private room for team meetings and discussions in Palembang.',
  },
  {
    id: 'meeting-semarang',
    nama: 'Meeting Room',
    jenis: 'Meeting Room',
    kota: 'SEMARANG',
    kapasitas: 25,
    rating: 4.89,
    ulasan: 159,
    foto: 'meeting',
    fasilitas: ['Projector', 'Whiteboard', 'Video conference'],
    // TIDAK ada tarif KB untuk Meeting Room → Price on request.
    harga: 'Price on request',
    deskripsi: 'Private room for team meetings and discussions in Semarang.',
  },
  {
    id: 'studio-palembang',
    nama: 'Studio',
    jenis: 'Studio',
    kota: 'PALEMBANG',
    kapasitas: 10,
    rating: 4.94,
    ulasan: 134,
    foto: 'studio',
    fasilitas: ['Recording equipment', 'Soundproofing'],
    // Tarif KB PP 68/2020: Studio Rp2.000.000/3 jam.
    harga: 'Rp2,000,000 / 3 hours',
    deskripsi: 'Broadcast studio for recordings and live sessions in Palembang.',
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

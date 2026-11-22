// Data DUMMY layanan tambahan (Book a Venue / Rent a Space) — keputusan pengguna 2026-11-21 10:52 WIB:
// "bangun ketiganya sekaligus, gunakan data dummy terlebih dahulu".
// DUMMY — ganti data asli: daftar venue dan lahan di bawah ini
// HANYA contoh (nama, kapasitas, luas, tanggal, kota, rating) sampai
// pengguna memberikan daftar aslinya.
//
// FOTO (Book a Venue): 5 foto interior yang DI-GENERATE, satu per jenis
// venue, di src/lib/fotoVenue.ts (data URI WebP). BUKAN foto stok.
// FOTO (Rent a Space): 12 foto lahan yang DI-GENERATE di
// src/lib/fotoLahan.ts (data URI WebP) — 8 foto utama (satu per sudut
// lahan) + 4 foto galeri bersama; tiap plot memakai 5 foto (1 utama +
// 4 galeri).
//
// HARGA: hanya tarif terverifikasi dari Knowledge Base (PP 68/2020,
// artikelRegulasi.ts) — Auditorium Rp7.500.000/4 jam (sound system) atau
// Rp10.000.000/4 jam (sound + kursi + meja), Studio Rp2.000.000/3 jam.
// Yang TIDAK ada tarif KB-nya → "Price on
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
  /** Id stabil, mis. 'SPC-001'. */
  id: string;
  /** Nama tampil, mis. 'Commercial Plot — Kenten'. */
  nama: string;
  /** Kota satker (nama kanonis dari DAFTAR_SATKER, mis. 'PALEMBANG'). */
  kota: string;
  /** Provinsi (nama Inggris), mis. 'South Sumatra'. */
  provinsi: string;
  /** Lokasi singkat tampil di kartu, mis. 'Kenten, Palembang'. */
  lokasi: string;
  /** Luas tanah dalam m² (DUMMY — angka contoh), 250–5000. */
  luasTanah: number;
  /** Dimensi, mis. '50 x 50 m' (luas = hasil kali dimensi). */
  dimensi: string;
  /** Peruntukan (definisi user): Shop / Cafe / Parking / Showroom / Sport Center / Warehouse / Plantation / Other. */
  peruntukan: string;
  /** Arah hadap: 8 mata angin (Inggris). */
  hadap: string;
  /** Akses jalan, mis. 'Main road, 8 m wide'. */
  aksesJalan: string;
  /** Alamat lengkap tampil di tabel detail. */
  alamat: string;
  /** Harga tampil — TIDAK ada tarif KB untuk sewa lahan → 'Price on request'. */
  harga: string;
  /** Deskripsi singkat (DUMMY — contoh). */
  deskripsi: string;
  /** Tanggal listing, 'yyyy-mm-dd' (DUMMY — contoh), untuk sort Newest/Oldest. */
  tanggalDaftar: string;
  /** Kunci foto di FOTO_LAHAN (5 per plot: 1 utama + 4 sudut galeri). */
  foto: string[];
}

/** Foto galeri bersama semua plot (kunci di FOTO_LAHAN) — sudut lain
    lahan RRI (udara, jalan depan, patok ukur, lingkungan). DUMMY:
    ilustrasi umum, bukan foto lahan yang sama persis. */
const FOTO_GALERI_LAHAN = [
  'galeri-udara',
  'galeri-jalan',
  'galeri-patok',
  'galeri-lingkungan',
];

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

// DUMMY — ganti data asli. Lahan (10) di 8 kota satker (pola Book a
// Venue: 10 listing/8 kota). Luas 250–5000 m², dimensi = hasil kali
// luas; peruntukan dari definisi user (Shop / Cafe / Parking /
// Showroom / Sport Center / Warehouse / Plantation / Other). Kota
// memakai nama kanonis DAFTAR_SATKER (huruf besar). Tiap plot 5 foto:
// 1 foto utama + 4 foto galeri bersama.
// TIDAK ada tarif KB untuk sewa lahan → semua 'Price on request'.
export const SPACE_DUMMY: SpaceDummy[] = [
  {
    id: 'SPC-001',
    nama: 'Commercial Plot — Kenten',
    kota: 'PALEMBANG',
    provinsi: 'South Sumatra',
    lokasi: 'Kenten, Palembang',
    luasTanah: 2500,
    dimensi: '50 x 50 m',
    peruntukan: 'Shop',
    hadap: 'South',
    aksesJalan: 'Main road, 8 m wide',
    alamat: 'Jl. Kenten Raya No. 12, Palembang',
    harga: 'Price on request',
    deskripsi:
      'Corner plot on a main road in Kenten, suitable for a shop or small retail building with high visibility.',
    tanggalDaftar: '2026-11-18',
    foto: ['lahan-sudut', ...FOTO_GALERI_LAHAN],
  },
  {
    id: 'SPC-002',
    nama: 'Open Land — Demang Lebar Daun',
    kota: 'PALEMBANG',
    provinsi: 'South Sumatra',
    lokasi: 'Demang Lebar Daun, Palembang',
    luasTanah: 1200,
    dimensi: '30 x 40 m',
    peruntukan: 'Cafe',
    hadap: 'East',
    aksesJalan: 'Main road, 6 m wide',
    alamat: 'Jl. Demang Lebar Daun No. 45, Palembang',
    harga: 'Price on request',
    deskripsi:
      'Grassy open plot in a busy residential area, ideal for a cafe with outdoor seating.',
    tanggalDaftar: '2026-11-15',
    foto: ['lahan-taman', ...FOTO_GALERI_LAHAN],
  },
  {
    id: 'SPC-003',
    nama: 'Commercial Plot — Sudirman',
    kota: 'JAKARTA',
    provinsi: 'Jakarta',
    lokasi: 'Sudirman, Jakarta',
    luasTanah: 800,
    dimensi: '20 x 40 m',
    peruntukan: 'Showroom',
    hadap: 'West',
    aksesJalan: 'Main road, 10 m wide',
    alamat: 'Jl. Jenderal Sudirman Kav. 52, Jakarta',
    harga: 'Price on request',
    deskripsi:
      'Street-front plot in the Sudirman business district, suitable for a showroom or brand outlet.',
    tanggalDaftar: '2026-11-20',
    foto: ['lahan-ruko', ...FOTO_GALERI_LAHAN],
  },
  {
    id: 'SPC-004',
    nama: 'Parking Lot — Kemang',
    kota: 'JAKARTA',
    provinsi: 'Jakarta',
    lokasi: 'Kemang, Jakarta',
    luasTanah: 1500,
    dimensi: '30 x 50 m',
    peruntukan: 'Parking',
    hadap: 'North',
    aksesJalan: 'Main road, 7 m wide',
    alamat: 'Jl. Kemang Raya No. 8, Jakarta',
    harga: 'Price on request',
    deskripsi:
      'Flat paved lot in Kemang, ready to use as paid parking for nearby offices and restaurants.',
    tanggalDaftar: '2026-11-12',
    foto: ['lahan-parkir', ...FOTO_GALERI_LAHAN],
  },
  {
    id: 'SPC-005',
    nama: 'Open Land — Dago',
    kota: 'BANDUNG',
    provinsi: 'West Java',
    lokasi: 'Dago, Bandung',
    luasTanah: 2000,
    dimensi: '40 x 50 m',
    peruntukan: 'Sport Center',
    hadap: 'Southeast',
    aksesJalan: 'Main road, 6 m wide',
    alamat: 'Jl. Ir. H. Juanda No. 90, Bandung',
    harga: 'Price on request',
    deskripsi:
      'Open grassy land on Dago’s main road, a good spot for a sport center or weekend market.',
    tanggalDaftar: '2026-11-10',
    foto: ['lahan-rumput', ...FOTO_GALERI_LAHAN],
  },
  {
    id: 'SPC-006',
    nama: 'Riverside Land — Kalimas',
    kota: 'SURABAYA',
    provinsi: 'East Java',
    lokasi: 'Kalimas, Surabaya',
    luasTanah: 5000,
    dimensi: '100 x 50 m',
    peruntukan: 'Plantation',
    hadap: 'Northeast',
    aksesJalan: 'Riverside road, 6 m wide',
    alamat: 'Jl. Kalimas Baru No. 3, Surabaya',
    harga: 'Price on request',
    deskripsi:
      'Large riverside plot on the Kalimas, suitable for plantation or agriculture use.',
    tanggalDaftar: '2026-11-08',
    foto: ['lahan-sungai', ...FOTO_GALERI_LAHAN],
  },
  {
    id: 'SPC-007',
    nama: 'Open Land — Polonia',
    kota: 'MEDAN',
    provinsi: 'North Sumatra',
    lokasi: 'Polonia, Medan',
    luasTanah: 3500,
    dimensi: '50 x 70 m',
    peruntukan: 'Warehouse',
    hadap: 'Southwest',
    aksesJalan: 'Main road, 8 m wide',
    alamat: 'Jl. Polonia No. 21, Medan',
    harga: 'Price on request',
    deskripsi:
      'Wide open field in Polonia, suitable for a shop, warehouse yard, or open-air market.',
    tanggalDaftar: '2026-11-06',
    foto: ['lahan-lapang', ...FOTO_GALERI_LAHAN],
  },
  {
    id: 'SPC-008',
    nama: 'Courtyard Space — Malioboro',
    kota: 'YOGYAKARTA',
    provinsi: 'Yogyakarta',
    lokasi: 'Malioboro, Yogyakarta',
    luasTanah: 250,
    dimensi: '10 x 25 m',
    peruntukan: 'Cafe',
    hadap: 'Northwest',
    aksesJalan: 'Side street, 4 m wide',
    alamat: 'Jl. Malioboro No. 137, Yogyakarta',
    harga: 'Price on request',
    deskripsi:
      'Small courtyard plot steps from Malioboro, ideal for a coffee stall or souvenir shop.',
    tanggalDaftar: '2026-11-05',
    foto: ['lahan-kota', ...FOTO_GALERI_LAHAN],
  },
  {
    id: 'SPC-009',
    nama: 'Open Land — Pettarani',
    kota: 'MAKASSAR',
    provinsi: 'South Sulawesi',
    lokasi: 'Pettarani, Makassar',
    luasTanah: 3000,
    dimensi: '50 x 60 m',
    peruntukan: 'Parking',
    hadap: 'South',
    aksesJalan: 'Main road, 8 m wide',
    alamat: 'Jl. A. P. Pettarani No. 77, Makassar',
    harga: 'Price on request',
    deskripsi:
      'Open land on Pettarani’s main road, suitable for parking or a car showroom yard.',
    tanggalDaftar: '2026-11-03',
    foto: ['lahan-rumput', ...FOTO_GALERI_LAHAN],
  },
  {
    id: 'SPC-010',
    nama: 'Commercial Plot — Pandanaran',
    kota: 'SEMARANG',
    provinsi: 'Central Java',
    lokasi: 'Pandanaran, Semarang',
    luasTanah: 1800,
    dimensi: '30 x 60 m',
    peruntukan: 'Showroom',
    hadap: 'East',
    aksesJalan: 'Main road, 7 m wide',
    alamat: 'Jl. Pandanaran No. 30, Semarang',
    harga: 'Price on request',
    deskripsi:
      'Street-front plot on Pandanaran, suitable for a showroom or retail outlet.',
    tanggalDaftar: '2026-11-01',
    foto: ['lahan-sudut', ...FOTO_GALERI_LAHAN],
  },
];

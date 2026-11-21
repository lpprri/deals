// Verifikasi halaman 3 layanan tambahan (Book a Venue / Rent a Space /
// Get a Journalism Training) — keputusan pengguna 2026-11-21 10:52 WIB:
// bangun ketiganya sekaligus, data dummy dulu. PLUS rebuild Book a Venue
// ala Airbnb (2026-11-21 12:01 WIB, 5 screenshot airbnb.com + studi live
// airbnb.com 12:03–12:06 WIB): tab kategori, search bar Where/When/Who,
// kartu foto generated + wishlist localStorage + rating.
//
// Asersi:
// - Rute: App.tsx mengenal 'book-venue' | 'rent-space' | 'training',
//   merender ketiga modul baru, dan meneruskan prop baru ke Marklo.
// - Footer: Marklo hanya 3 item baru yang memakai prop baru; 3 item
//   lainnya tetap onComingSoon.
// - Dummy: 10 venue + 4 lahan + 4 course, semua id ada; harga HANYA
//   tarif KB PP 68/2020 (5 harga) + 'Price on request' (12x); tidak ada
//   angka Rp lain; file jelas ditandai DUMMY; venue punya kota satker +
//   rating + foto.
// - Foto venue: 5 data URI WebP di fotoVenue.ts (satu per jenis);
//   BookVenue memakai foto itu di kartu (bukan placeholder gradien).
// - Airbnb: tab kategori, 3 segmen search bar, kalender 2 bulan +
//   Dates/Flexible + Exact/±, wishlist localStorage, kartu (foto 4:3,
//   badge Client favourite, hati, rating), form peserta + occasion
//   dropdown, jumlahPeserta sampai ke Order Details.
// - Tulis publik: 3 fungsi kirim di firestoreStore.ts + 3 handler di
//   App.tsx (id VBR-/SRR-/TRN-…, status 'Baru'); tabel Order punya
//   kolom Details; 4 kolom lama tetap ada.
// - Rules: 3 blok create publik (auth == null, status 'Baru', satker
//   '41'); blok /meeting dan blok generik operator TIDAK berubah;
//   TIDAK ada hasOnly — field opsional jumlahPeserta tidak butuh
//   perubahan rules (tidak perlu re-publish untuk PR ini).
//
// REVISI 2026-11-21 12:24–12:28 WIB (form booking pindah ke halaman
// detail, kartu clickable, tombol "Book this venue" dihapus, header logo
// kanan + judul gaya logo Deals, tanpa deskripsi) + temuan preview
// 12:34 WIB (scroll-to-top saat halaman publik mount) + studi Airbnb
// saat login 12:35–12:36 WIB (tombol Save = hati + teks "Save",
// galeri 5 foto mosaic tiap foto tombol, kartu booking Reserve +
// "You won't be charged yet", kalender di kartu booking, check-out
// multi-hari) + REVISI HEADER 2026-11-21 13:04 WIB (logo RRI pindah
// ke kiri, di samping panah back; judul tetap di kanan).
// "Message host" dan "Report this listing" SENGAJA tidak dibangun
// (tidak ada messaging host di RRI).
//
// PLUS rebuild Rent a Space ala Brighton (2026-11-21 14:16 WIB,
// perintah user "Ya, rebuild sekarang"; referensi studi browser
// brighton.co.id/disewa 14:06 WIB): search band (lokasi + penggunaan
// + Filter modal), sort, kartu foto 16:9 carousel 3/baris, halaman
// detail (galeri + lightbox, tabel Property Details, deskripsi,
// Similar properties, kartu kontak satker sticky + form inquiry),
// 10 lahan di 8 kota, 12 foto lahan generated (fotoLahan.ts), semua
// "Price on request". Header baru (panah + logo RRI kiri, judul kanan)
// ikut masuk PR ini — widget push terpisah header TIDAK berlaku lagi.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Dijalankan dari root repo (pola skrip cek lain).
const baca = (relatif: string) =>
  readFileSync(join(process.cwd(), relatif), 'utf8');
const app = baca('src/App.tsx');
const marklo = baca('src/modules/landing/Marklo.tsx');
const dummy = baca('src/lib/layananTambahanDummy.ts');
const types = baca('src/lib/types.ts');
const store = baca('src/lib/store.ts');
const firestoreStore = baca('src/lib/firestoreStore.ts');
const sales = baca('src/modules/Sales.tsx');
const rules = baca('firestore.rules');
const bookVenue = baca('src/modules/BookVenue.tsx');
const rentSpace = baca('src/modules/RentSpace.tsx');
const training = baca('src/modules/Training.tsx');
const fotoVenue = baca('src/lib/fotoVenue.ts');
const fotoLahan = baca('src/lib/fotoLahan.ts');
const lacak = baca('src/modules/Lacak.tsx');
const ajukan = baca('src/modules/Ajukan.tsx');
const comingSoon = baca('src/modules/ComingSoon.tsx');
const planCampaign = baca('src/modules/PlanCampaign.tsx');

// Potongan file dummy per bagian (venue sebelum SPACE_DUMMY, lahan
// antara SPACE_DUMMY dan COURSE_DUMMY) — dipakai asersi jumlah field.
const venueBagian = dummy.slice(0, dummy.indexOf('export const SPACE_DUMMY'));
const spaceBagian = dummy.slice(
  dummy.indexOf('export const SPACE_DUMMY'),
  dummy.indexOf('export const COURSE_DUMMY'),
);

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};
const hitung = (teks: string, jarum: string) =>
  teks.split(jarum).length - 1;

// --- 1. Rute + handler App.tsx. ---
cek(
  "App: union halamanPublik mengenal 'book-venue' | 'rent-space' | 'training'",
  app.includes("'book-venue' | 'rent-space' | 'training'"),
);
cek(
  'App: render BookVenue + RentSpace + Training',
  app.includes('<BookVenue') &&
    app.includes('<RentSpace') &&
    app.includes('<Training'),
);
cek(
  'App: 3 handler kirim publik ada',
  app.includes('kirimPermintaanVenuePublik') &&
    app.includes('kirimPermintaanSpacePublik') &&
    app.includes('kirimPermintaanTrainingPublik'),
);
cek(
  "App: id VBR-/SRR-/TRN- + status 'Baru'",
  app.includes("idBerikutnya('VBR-'") &&
    app.includes("idBerikutnya('SRR-'") &&
    app.includes("idBerikutnya('TRN-'") &&
    hitung(app, "status: 'Baru'") >= 3,
);
cek(
  'App: prop baru diteruskan ke Marklo',
  app.includes("onBookVenue={() => setHalamanPublik('book-venue')}") &&
    app.includes("onRentSpace={() => setHalamanPublik('rent-space')}") &&
    app.includes("onTraining={() => setHalamanPublik('training')}"),
);

// --- 2. Footer Marklo. ---
cek(
  'Marklo: prop onBookVenue/onRentSpace/onTraining ada di interface',
  marklo.includes('onBookVenue: () => void') &&
    marklo.includes('onRentSpace: () => void') &&
    marklo.includes('onTraining: () => void'),
);
cek(
  'Marklo: 3 item baru memakai prop baru',
  marklo.includes("{ label: 'Book a Venue', onClick: onBookVenue }") &&
    marklo.includes("{ label: 'Rent a Space', onClick: onRentSpace }") &&
    marklo.includes(
      "{ label: 'Get a Journalism Training', onClick: onTraining }",
    ),
);
cek(
  'Marklo: 3 item lain tetap onComingSoon',
  marklo.includes("{ label: 'Collaborate with Us', onClick: onComingSoon }") &&
    marklo.includes("{ label: 'Support our Event', onClick: onComingSoon }") &&
    marklo.includes(
      "{ label: 'Invite as Media Partner', onClick: onComingSoon }",
    ),
);
cek(
  'Marklo: tidak ada lagi keenam item ke onComingSoon',
  !marklo.includes('Keenam item membuka halaman'),
);

// --- 3. Data dummy: jumlah + harga KB saja. ---
const idVenue = [
  'auditorium-palembang',
  'auditorium-jakarta',
  'auditorium-makassar',
  'hall-bandung',
  'hall-surabaya',
  'multipurpose-yogyakarta',
  'multipurpose-medan',
  'meeting-palembang',
  'meeting-semarang',
  'studio-palembang',
];
const idSpace = [
  'SPC-001',
  'SPC-002',
  'SPC-003',
  'SPC-004',
  'SPC-005',
  'SPC-006',
  'SPC-007',
  'SPC-008',
  'SPC-009',
  'SPC-010',
];
const idCourse = [
  'pelatihan-jurnalistik',
  'sertifikasi-wartawan',
  'workshop-penulisan',
  'wawancara-reportase',
];
cek(
  'Dummy: 10 venue + 10 lahan + 4 course (semua id ada)',
  [...idVenue, ...idSpace, ...idCourse].every((id) =>
    dummy.includes(`id: '${id}'`),
  ),
);
cek(
  'Dummy: file jelas ditandai DUMMY',
  dummy.includes('DUMMY — ganti data asli') && hitung(dummy, 'DUMMY') >= 5,
);
cek(
  'Dummy: harga KB hadir (Auditorium 2 paket, Studio, Pelatihan, Sertifikasi)',
  dummy.includes("harga: 'Rp7,500,000 / 4 hours'") &&
    dummy.includes('Rp10,000,000 / 4 hours') &&
    dummy.includes("harga: 'Rp2,000,000 / 3 hours'") &&
    dummy.includes("harga: 'Rp2,000,000 / person / 3 days'") &&
    dummy.includes("harga: 'Rp1,500,000 / person / 3 days'"),
);
cek(
  "Dummy: 'Price on request' tepat 18x (6 venue + 10 lahan + 2 course)",
  hitung(dummy, "harga: 'Price on request'") === 18,
);
cek(
  'Dummy: total 24 baris harga (10 venue + 10 lahan + 4 course)',
  hitung(dummy, "harga: '") === 24,
);
cek(
  'Dummy: tidak ada angka Rp lain selain tarif KB',
  (() => {
    const boleh = new Set([
      'Rp7.500.000',
      'Rp10.000.000',
      'Rp2.000.000',
      'Rp1.500.000',
      'Rp7,500,000',
      'Rp10,000,000',
      'Rp2,000,000',
      'Rp1,500,000',
    ]);
    const semua = dummy.match(/Rp[0-9.,]+/g) ?? [];
    return semua.length > 0 && semua.every((r) => boleh.has(r));
  })(),
);
cek(
  'Dummy: venue punya kota satker + rating + foto (10x tiap field)',
  hitung(venueBagian, "kota: '") === 10 &&
    hitung(venueBagian, "foto: '") === 10 &&
    (venueBagian.match(/rating: [0-9]/g) ?? []).length === 10,
);
cek(
  'Dummy: kota venue nama kanonis satker (8 kota)',
  ['PALEMBANG', 'JAKARTA', 'MAKASSAR', 'BANDUNG', 'SURABAYA', 'YOGYAKARTA', 'MEDAN', 'SEMARANG'].every(
    (k) => dummy.includes(`kota: '${k}'`),
  ),
);
cek(
  'Dummy: rating venue 4.8–4.97 (semua dalam rentang)',
  (() => {
    const semua = [...dummy.matchAll(/rating: ([0-9.]+)/g)].map((m) =>
      Number(m[1]),
    );
    return (
      semua.length === 10 && semua.every((r) => r >= 4.8 && r <= 4.97)
    );
  })(),
);
cek(
  'Dummy: tarif KB Auditorium muncul 3x (3 auditorium), Studio 1x',
  hitung(dummy, "harga: 'Rp7,500,000 / 4 hours'") === 3 &&
    hitung(dummy, "harga: 'Rp2,000,000 / 3 hours'") === 1,
);
cek('Dummy: tidak ada tarif harian turunan', !dummy.includes('/ day'));

// --- 3e2. Data lahan (rebuild ala Brighton: 10 plot, 8 kota). ---
cek(
  'Dummy lahan: 10 plot SPC-001–SPC-010 di 8 kota satker',
  idSpace.every((id) => spaceBagian.includes(`id: '${id}'`)) &&
    [
      'PALEMBANG',
      'JAKARTA',
      'BANDUNG',
      'SURABAYA',
      'MEDAN',
      'YOGYAKARTA',
      'MAKASSAR',
      'SEMARANG',
    ].every((k) => spaceBagian.includes(`kota: '${k}'`)),
);
cek(
  'Dummy lahan: semua plot punya provinsi + luasTanah + dimensi + peruntukan + hadap + aksesJalan + alamat + tanggalDaftar + foto (10x)',
  ['provinsi: ', 'luasTanah: ', 'dimensi: ', 'peruntukan: ', 'hadap: ', 'aksesJalan: ', 'alamat: ', "tanggalDaftar: '", 'foto: ['].every(
    (f) => hitung(spaceBagian, f) === 10,
  ),
);
cek(
  'Dummy lahan: luas 250–5000 m² (semua dalam rentang)',
  (() => {
    const semua = [...spaceBagian.matchAll(/luasTanah: ([0-9]+)/g)].map((m) =>
      Number(m[1]),
    );
    return semua.length === 10 && semua.every((l) => l >= 250 && l <= 5000);
  })(),
);
cek(
  'Dummy lahan: dimensi cocok dengan luas (a x b = luasTanah, 10x)',
  (() => {
    const luas = [...spaceBagian.matchAll(/luasTanah: ([0-9]+)/g)].map((m) =>
      Number(m[1]),
    );
    const dimensi = [
      ...spaceBagian.matchAll(/dimensi: '([0-9]+) x ([0-9]+) m'/g),
    ].map((m) => Number(m[1]) * Number(m[2]));
    return (
      luas.length === 10 &&
      dimensi.length === 10 &&
      luas.every((l, i) => l === dimensi[i])
    );
  })(),
);
cek(
  'Dummy lahan: peruntukan hanya 8 opsi definisi user (Shop/Cafe/Parking/Showroom/Sport Center/Warehouse/Plantation/Other)',
  (() => {
    const semua = [...spaceBagian.matchAll(/peruntukan: '([^']+)'/g)].map(
      (m) => m[1],
    );
    const boleh = new Set(['Shop', 'Cafe', 'Parking', 'Showroom', 'Sport Center', 'Warehouse', 'Plantation', 'Other']);
    return semua.length === 10 && semua.every((p) => boleh.has(p));
  })(),
);
cek(
  'Dummy lahan: hadap hanya 8 mata angin',
  (() => {
    const semua = [...spaceBagian.matchAll(/hadap: '([^']+)'/g)].map(
      (m) => m[1],
    );
    const boleh = new Set([
      'North',
      'Northeast',
      'East',
      'Southeast',
      'South',
      'Southwest',
      'West',
      'Northwest',
    ]);
    return semua.length === 10 && semua.every((h) => boleh.has(h));
  })(),
);
cek(
  'Dummy lahan: tanggalDaftar Nov 2026 (10x, format yyyy-mm-dd)',
  (spaceBagian.match(/tanggalDaftar: '2026-11-[0-9]{2}'/g) ?? []).length ===
    10,
);
cek(
  'Dummy lahan: semua plot "Price on request" (10x, tidak ada tarif lahan)',
  hitung(spaceBagian, "harga: 'Price on request'") === 10 &&
    !/harga: 'Rp/.test(spaceBagian),
);

// --- 3b. Foto venue (generated, data URI WebP). ---
cek(
  'FotoVenue: 9 foto data URI WebP (5 jenis + 4 galeri detail)',
  ['auditorium', 'hall', 'multipurpose', 'meeting', 'studio'].every((k) =>
    fotoVenue.includes(`'${k}': 'data:image/webp;base64,`),
  ) &&
    ['galeri-panggung', 'galeri-kursi', 'galeri-lobi', 'galeri-meja'].every(
      (k) => fotoVenue.includes(`'${k}': 'data:image/webp;base64,`),
    ) &&
    hitung(fotoVenue, 'data:image/webp;base64,') === 9,
);
cek(
  'FotoVenue: file menjelaskan sumber generated (bukan stok)',
  fotoVenue.includes('DI-GENERATE') && fotoVenue.includes('FOTO_VENUE'),
);
cek(
  'BookVenue: kartu memakai foto (img + FOTO_VENUE), bukan placeholder gradien',
  bookVenue.includes('FOTO_VENUE[venue.foto]') &&
    bookVenue.includes('<img') &&
    !bookVenue.includes('bg-gradient-to-br from-[#2573e2] to-[#0d2569]'),
);

// --- 3c. Rebuild ala Airbnb: tab, search bar, kalender, wishlist, kartu. ---
cek(
  'Airbnb: tab kategori All/Auditorium/Hall/Multipurpose Room/Meeting Room',
  bookVenue.includes("id: 'All'") &&
    bookVenue.includes("id: 'Auditorium'") &&
    bookVenue.includes("id: 'Hall'") &&
    bookVenue.includes("id: 'Multipurpose Room'") &&
    bookVenue.includes("id: 'Meeting Room'") &&
    !bookVenue.includes("id: 'Studio'"),
);
cek(
  'Airbnb: search bar 3 segmen Where/When/Who + tombol Search',
  bookVenue.includes("'Where'") &&
    bookVenue.includes("'When'") &&
    bookVenue.includes("'Who'") &&
    bookVenue.includes('Search') &&
    bookVenue.includes('Search destinations'),
);
cek(
  'Airbnb: panel Where — Suggested destinations + Nearby + daftar kota satker',
  bookVenue.includes('Suggested destinations') &&
    bookVenue.includes('Nearby') &&
    bookVenue.includes('around you') &&
    bookVenue.includes('DAFTAR_SATKER'),
);
cek(
  'Airbnb: panel When — toggle Dates/Flexible + kalender 2 bulan + Exact/±',
  bookVenue.includes("'Dates'") &&
    bookVenue.includes("'Flexible'") &&
    bookVenue.includes('Exact dates') &&
    bookVenue.includes('± 1 day') &&
    bookVenue.includes('± 14 days') &&
    bookVenue.includes('How long?'),
);
cek(
  'Airbnb: panel Who — stepper peserta + dropdown occasion',
  bookVenue.includes('Participants') &&
    bookVenue.includes('How many people will attend?') &&
    bookVenue.includes('Wedding / Reception') &&
    bookVenue.includes('Concert / Performance'),
);
cek(
  'Airbnb: Search menerapkan filter + pil ringkas + Clear filters',
  bookVenue.includes('terapkanPencarian') &&
    bookVenue.includes('labelRingkas') &&
    bookVenue.includes('Clear filters') &&
    bookVenue.includes('bersihkanFilter'),
);
cek(
  'Airbnb: heading hasil "N venues in [kota]" / "Available venues"',
  bookVenue.includes('Available venues') &&
    bookVenue.includes("venue${hasil.length === 1 ? '' : 's'} in"),
);
cek(
  'Airbnb: wishlist localStorage tanpa login (hati toggle + persist)',
  bookVenue.includes("KUNCI_WISHLIST = 'rri-venue-wishlist'") &&
    bookVenue.includes('localStorage.getItem(KUNCI_WISHLIST)') &&
    bookVenue.includes('localStorage.setItem(KUNCI_WISHLIST,') &&
    bookVenue.includes('toggleSimpan'),
);
cek(
  'Airbnb: kartu — foto 4:3 + badge Client favourite + hati + rating ★',
  bookVenue.includes('aspect-[4/3]') &&
    bookVenue.includes('Client favourite') &&
    bookVenue.includes('rating >= 4.9') &&
    bookVenue.includes('toFixed(2)'),
);
cek(
  'Airbnb: judul kartu "Auditorium in Palembang" + kapasitas + harga KB',
  bookVenue.includes('judulVenue') &&
    bookVenue.includes('Capacity') &&
    bookVenue.includes('Price on request'),
);

// --- 3d. Revisi detail page (12:24–12:28 WIB) + studi login Airbnb. ---
cek(
  'Revisi: TIDAK ada tombol "Book this venue" / form inline di listing / deskripsi lama',
  !bookVenue.includes('Book this venue') &&
    !bookVenue.includes('form-book-venue') &&
    !bookVenue.includes('Book our auditorium, hall, and meeting spaces'),
);
cek(
  'Revisi: kartu clickable ke halaman detail (article role=button + bukaDetail + detailId)',
  bookVenue.includes('role="button"') &&
    bookVenue.includes('onClick={() => bukaDetail(venue.id)}') &&
    bookVenue.includes('const [detailId, setDetailId]') &&
    bookVenue.includes('kembaliKeListing'),
);
cek(
  'Revisi: header — panah + logo RRI di kiri, judul gaya Deals di kanan, tanpa teks back (user 2026-11-21 13:04 WIB)',
  bookVenue.includes("'Back to venues'") &&
    bookVenue.includes('className="h-10 w-auto"') &&
    bookVenue.includes('text-2xl font-black tracking-tight text-[#0d2569]') &&
    !bookVenue.includes('>Back to Landing Page<') &&
    bookVenue.indexOf('<ArrowLeft') <
      bookVenue.indexOf('src={LOGO_RRI_LOCKUP_DATA_URI}') &&
    bookVenue.indexOf('src={LOGO_RRI_LOCKUP_DATA_URI}') <
      bookVenue.indexOf('text-2xl font-black tracking-tight text-[#0d2569]'),
);
cek(
  'Revisi: detail — galeri 1 besar + 4 kecil (tiap foto tombol) + Show all photos',
  bookVenue.includes('FOTO_GALERI') &&
    bookVenue.includes('aria-label="Open photos"') &&
    bookVenue.includes('Open photos of ${judulVenue(venue)}') &&
    bookVenue.includes('Show all photos') &&
    bookVenue.includes('col-span-2 row-span-2'),
);
cek(
  'Revisi: detail — Share + Save (hati + teks, aria-label Save to wishlist)',
  bookVenue.includes('Link copied') &&
    bookVenue.includes('aria-label="Save to wishlist"') &&
    bookVenue.includes("{disimpan ? 'Saved' : 'Save'}"),
);
cek(
  'Revisi: detail — info + rating + highlights + amenities + kartu booking',
  bookVenue.includes('Hosted by RRI') &&
    bookVenue.includes('reviews') &&
    bookVenue.includes('Top rated venue') &&
    bookVenue.includes('What this place offers') &&
    bookVenue.includes('Show all') &&
    bookVenue.includes('amenities') &&
    bookVenue.includes('CHECK-IN') &&
    bookVenue.includes('CHECK-OUT') &&
    bookVenue.includes('GUESTS') &&
    bookVenue.includes('Send booking request'),
);
cek(
  "Revisi: kartu booking — \"You won't be charged yet\" di bawah tombol + catatan tim",
  bookVenue.includes("You won&apos;t be charged yet") &&
    bookVenue.includes('Your request goes to our team'),
);
cek(
  'Revisi: kalender detail di bawah kartu booking (rentang check-in/check-out ditandai)',
  bookVenue.includes('Select your dates') &&
    bookVenue.includes('pilihTanggalDetail') &&
    bookVenue.includes("renderBulan(bulanAwal, 'detail')") &&
    bookVenue.includes('Pick a check-in date first'),
);

// --- 3e. Check-out date + jumlah ulasan (revisi detail). ---
cek(
  'Revisi: tanggalSelesai di types/store/App/Sales',
  types.includes('tanggalSelesai?: string') &&
    store.includes('tanggalSelesai?: string') &&
    app.includes('Check-out date is not valid.') &&
    sales.includes('tanggalSelesai'),
);
cek(
  'Revisi: dummy ulasan 10x (76–214)',
  (() => {
    const semua = [...dummy.matchAll(/ulasan: ([0-9]+)/g)].map((m) =>
      Number(m[1]),
    );
    return semua.length === 10 && semua.every((u) => u >= 76 && u <= 214);
  })(),
);

// --- 3f. Foto lahan (generated, data URI WebP). ---
cek(
  'FotoLahan: 12 foto data URI WebP (8 utama + 4 galeri)',
  [
    'lahan-sudut',
    'lahan-taman',
    'lahan-ruko',
    'lahan-parkir',
    'lahan-rumput',
    'lahan-sungai',
    'lahan-lapang',
    'lahan-kota',
  ].every((k) => fotoLahan.includes(`'${k}': 'data:image/webp;base64,`)) &&
    ['galeri-udara', 'galeri-jalan', 'galeri-patok', 'galeri-lingkungan'].every(
      (k) => fotoLahan.includes(`'${k}': 'data:image/webp;base64,`),
    ) &&
    hitung(fotoLahan, 'data:image/webp;base64,') === 12,
);
cek(
  'FotoLahan: file menjelaskan sumber generated (bukan stok)',
  fotoLahan.includes('DI-GENERATE') && fotoLahan.includes('FOTO_LAHAN'),
);
cek(
  'RentSpace: kartu + detail memakai foto (img + FOTO_LAHAN), bukan placeholder gradien',
  rentSpace.includes('FOTO_LAHAN[') &&
    rentSpace.includes('<img') &&
    !rentSpace.includes('bg-gradient-to-br from-[#2573e2] to-[#0d2569]'),
);

// --- 3g. Rebuild ala Brighton: search band, filter modal, sort, kartu, detail. ---
cek(
  'Brighton: search band — input lokasi + saran kota satker + saran plot + dropdown penggunaan',
  rentSpace.includes('Search by city or plot name') &&
    rentSpace.includes('DAFTAR_SATKER') &&
    rentSpace.includes('Cities') &&
    rentSpace.includes('Plots') &&
    rentSpace.includes("'All uses'") &&
    rentSpace.includes('Showroom') &&
    rentSpace.includes('SlidersHorizontal'),
);
cek(
  'Brighton: Filter modal — luas tanah min/max (m²) + arah hadap 8 + Clear/Apply',
  rentSpace.includes('Land area (m²)') &&
    rentSpace.includes('Minimum land area in square metres') &&
    rentSpace.includes('Maximum land area in square metres') &&
    rentSpace.includes('All directions') &&
    rentSpace.includes('Northwest') &&
    rentSpace.includes('Southeast') &&
    rentSpace.includes('Apply') &&
    rentSpace.includes('Clear') &&
    rentSpace.includes('terapkanFilter'),
);
cek(
  'Brighton: sort Newest/Oldest/Largest area/Smallest area (tanpa sort harga)',
  rentSpace.includes('Sort plots') &&
    rentSpace.includes('>Newest<') &&
    rentSpace.includes('>Oldest<') &&
    rentSpace.includes('>Largest area<') &&
    rentSpace.includes('>Smallest area<') &&
    !rentSpace.includes('Highest price') &&
    !rentSpace.includes('Lowest price'),
);
cek(
  'Brighton: heading hasil "N plots in [kota]" / "Available Space" + subjudul dipertahankan + kosong + Clear filters',
  rentSpace.includes('Available Space') &&
    rentSpace.includes('Land owned by RRI, for your business — shops, cafes, parking, and more.') &&
    rentSpace.includes("plot${hasil.length === 1 ? '' : 's'} in") &&
    rentSpace.includes('No plots match your search') &&
    rentSpace.includes('Clear filters') &&
    rentSpace.includes('bersihkanFilter'),
);
cek(
  'Brighton: kartu 3/baris — foto 16:9 carousel (panah + dot) + pill LAND biru RRI + harga + tanggal + LT + dimensi',
  rentSpace.includes('lg:grid-cols-3') &&
    rentSpace.includes('aspect-[16/9]') &&
    rentSpace.includes('Previous photo') &&
    rentSpace.includes('Next photo') &&
    rentSpace.includes('LAND') &&
    rentSpace.includes('bg-[#2573e2]') &&
    rentSpace.includes('Price on request') &&
    rentSpace.includes('LT: ') &&
    rentSpace.includes('View details of'),
);
cek(
  'Brighton: kartu clickable ke halaman detail (article role=button + bukaDetail + detailId)',
  rentSpace.includes('role="button"') &&
    rentSpace.includes('onClick={() => bukaDetail(space.id)}') &&
    rentSpace.includes('const [detailId, setDetailId]') &&
    rentSpace.includes('kembaliKeListing'),
);
cek(
  'Brighton: detail — galeri 1 besar + 4 kecil (tiap foto tombol) + Show all photos',
  rentSpace.includes('aria-label={`Open photos of ${space.nama}`}') &&
    rentSpace.includes('aria-label="Open photos"') &&
    rentSpace.includes('Show all photos') &&
    rentSpace.includes('col-span-2 row-span-2'),
);
cek(
  'Brighton: detail — pill LAND + lokasi + harga besar + Share (Link copied) + judul + satker',
  rentSpace.includes('Link copied') &&
    rentSpace.includes('Share') &&
    rentSpace.includes('RRI {judulKota(space.kota)}') &&
    rentSpace.includes('LPP Radio Republik Indonesia'),
);
cek(
  'Brighton: detail — tabel Property Details (luas, dimensi, peruntukan, hadap, akses, alamat, lokasi, sertifikat —, tanggal, ID) + Description + Similar properties',
  rentSpace.includes('Property Details') &&
    rentSpace.includes("'Land area'") &&
    rentSpace.includes("'Dimensions'") &&
    rentSpace.includes("'Permitted use'") &&
    rentSpace.includes("'Facing'") &&
    rentSpace.includes("'Road access'") &&
    rentSpace.includes("'Address'") &&
    rentSpace.includes("'Location'") &&
    rentSpace.includes("'Certificate'") &&
    rentSpace.includes("'Listed on'") &&
    rentSpace.includes("'Listing ID'") &&
    rentSpace.includes('Description') &&
    rentSpace.includes('Similar properties'),
);
cek(
  'Brighton: detail — kartu kontak satker sticky + form inquiry di dalamnya',
  rentSpace.includes('sticky top-6') &&
    rentSpace.includes('Send an inquiry about this plot') &&
    rentSpace.includes('formInquiry'),
);
cek(
  'Brighton: detail — kedua anak grid detail punya min-w-0 (anti grid blowout PR #130: carousel Similar 9 kartu w-64 tidak boleh memaksa track 1fr melebar)',
  rentSpace.includes('lg:grid-cols-[1fr_360px]') &&
    rentSpace.includes('<div className="min-w-0">') &&
    (rentSpace.match(/<div className="min-w-0">/g) ?? []).length === 2 &&
    rentSpace.indexOf('<div className="min-w-0">') >
      rentSpace.indexOf('lg:grid-cols-[1fr_360px]'),
);
cek(
  'Brighton: lightbox — Close + panah prev/next + counter "n of N" + strip thumbnail',
  rentSpace.includes('Close photos') &&
    rentSpace.includes('} of {detail.foto.length}') &&
    rentSpace.includes('Show photo') &&
    rentSpace.includes('ring-2 ring-white'),
);
cek(
  'Brighton: TIDAK ADA harga (Rp, /year, per m²) di RentSpace',
  !rentSpace.includes('Rp') &&
    !rentSpace.includes('/year') &&
    !rentSpace.includes('per m²') &&
    !rentSpace.includes('/ day'),
);
cek(
  'Brighton: TIDAK ADA field rumah / KPR / badge berbayar di RentSpace',
  !rentSpace.includes('Kamar Tidur') &&
    !rentSpace.includes('Kamar Mandi') &&
    !rentSpace.includes('Luas Bangunan') &&
    !rentSpace.includes('Listrik') &&
    !rentSpace.includes('Furnish') &&
    !rentSpace.includes('KPR') &&
    !rentSpace.includes('Premier') &&
    !rentSpace.includes('Featured'),
);
cek(
  'Brighton: "WhatsApp" hanya 1x — label field kontak pengunjung, BUKAN tombol agen',
  hitung(rentSpace, 'WhatsApp') === 1 &&
    rentSpace.includes('Contact (phone / WhatsApp)'),
);
cek(
  'Brighton: TIDAK ADA seksi peta (tanpa koordinat) di RentSpace',
  !rentSpace.toLowerCase().includes('google map') &&
    !rentSpace.includes('koordinat') &&
    !rentSpace.includes('latitude') &&
    !rentSpace.includes('longitude'),
);
cek(
  'Brighton: scroll ke atas saat buka/tutup detail (3x scrollTo di RentSpace)',
  hitung(rentSpace, 'window.scrollTo({ top: 0 })') >= 3,
);

// --- 4. Modul halaman baru. ---
cek(
  'BookVenue: form booking di kartu booking halaman detail (tanggal/peserta/occasion/nama/kontak/email + referensi)',
  bookVenue.includes('Send booking request') &&
    bookVenue.includes('Occasion') &&
    bookVenue.includes('Participants') &&
    bookVenue.includes('Select an occasion') &&
    bookVenue.includes('Your reference number is'),
);
cek(
  'BookVenue: peserta + occasion terkirim sebagai jumlahPeserta',
  bookVenue.includes('jumlahPeserta: peserta > 0 ? peserta : undefined'),
);
cek(
  'RentSpace: form space/nama/kontak/email/pesan + referensi',
  rentSpace.includes('Send Inquiry') &&
    rentSpace.includes('Message (optional)') &&
    rentSpace.includes('Your reference number is') &&
    rentSpace.includes('Back to Landing Page'),
);
cek(
  'RentSpace: header ala Book a Venue — panah + logo RRI di kiri, judul gaya Deals di kanan, tanpa deskripsi, tanpa teks back (user 2026-11-21 14:03 WIB; detail → "Back to spaces")',
  rentSpace.includes("'Back to spaces'") &&
    rentSpace.includes("'Back to Landing Page'") &&
    rentSpace.includes('className="h-10 w-auto"') &&
    rentSpace.includes('text-2xl font-black tracking-tight text-[#0d2569]') &&
    !rentSpace.includes('>Back to Landing Page<') &&
    !rentSpace.includes('Land and spaces for your business') &&
    rentSpace.indexOf('<ArrowLeft') <
      rentSpace.indexOf('src={LOGO_RRI_LOCKUP_DATA_URI}') &&
    rentSpace.indexOf('src={LOGO_RRI_LOCKUP_DATA_URI}') <
      rentSpace.indexOf('text-2xl font-black tracking-tight text-[#0d2569]'),
);
cek(
  'Training: daftar course + form course/nama/email/telepon + referensi',
  training.includes('Register') &&
    training.includes('Schedule:') &&
    training.includes('Your reference number is') &&
    training.includes('Back to Landing Page'),
);
cek(
  'Halaman baru: gagal tulis Firestore tampil apa adanya',
  bookVenue.includes('galat') &&
    rentSpace.includes('galat') &&
    training.includes('galat'),
);

// --- 5. Tipe + store + firestoreStore. ---
cek(
  'types: 6 field opsional di PermintaanLayanan (termasuk jumlahPeserta)',
  types.includes('layanan?: string') &&
    types.includes('tanggalLayanan?: string') &&
    types.includes('keperluan?: string') &&
    types.includes('kontak?: string') &&
    types.includes('email?: string') &&
    types.includes('jumlahPeserta?: number'),
);
cek(
  'store: input venue membawa jumlahPeserta opsional',
  store.includes('jumlahPeserta?: number'),
);
cek(
  'App: handler venue menulis jumlahPeserta + validasi',
  app.includes('jumlahPeserta: input.jumlahPeserta') &&
    app.includes('Participants is not valid.'),
);
cek(
  'store: 3 interface input publik ada',
  store.includes('PermintaanVenuePublikInput') &&
    store.includes('PermintaanSpacePublikInput') &&
    store.includes('PermintaanTrainingPublikInput'),
);
cek(
  'firestoreStore: 3 fungsi kirim publik ada',
  firestoreStore.includes('kirimPermintaanVenuePublik') &&
    firestoreStore.includes('kirimPermintaanSpacePublik') &&
    firestoreStore.includes('kirimPermintaanTrainingPublik'),
);

// --- 6. Tabel Order: kolom Details, 4 kolom lama utuh. ---
cek(
  'Sales: kolom Details ada + 4 kolom lama tetap ada',
  sales.includes('<Th>Details</Th>') &&
    sales.includes('<Th>Request ID</Th>') &&
    sales.includes('<Th>Client</Th>') &&
    sales.includes('<Th>Request Date</Th>') &&
    sales.includes('<Th>Status</Th>'),
);
cek(
  'Sales: rincianPermintaan menampilkan layanan + tanggal + keperluan + peserta',
  sales.includes('function rincianPermintaan') &&
    sales.includes("join(' · ')") &&
    sales.includes('jumlahPeserta') &&
    sales.includes('participant'),
);
cek(
  'Sales: teks kosong 3 tabel diperbarui (form sudah hidup)',
  sales.includes('Requests from the Book a Venue form will appear here.') &&
    sales.includes('Requests from the Rent a Space form will appear here.') &&
    sales.includes(
      'Requests from the Get a Journalism Training form will appear here.',
    ),
);

// --- 7. Rules: 3 blok publik baru; blok lain tidak berubah. ---
cek(
  'Rules: 3 blok match publik ada',
  rules.includes('match /venueBookOrder/{id}') &&
    rules.includes('match /spaceRentOrder/{id}') &&
    rules.includes('match /trainingOrder/{id}'),
);
cek(
  'Rules: ketiga blok hanya create publik tervalidasi',
  hitung(rules, 'request.auth == null') >= 4 && // meeting + 3 baru
    hitung(rules, "status == 'Baru'") === 3 &&
    hitung(rules, "satker.kode == '41'") >= 3,
);
cek(
  'Rules: blok /meeting tidak berubah (tanggal + email + peserta)',
  rules.includes('contactPersonEmail') &&
    rules.includes("request.resource.data.peserta is string"),
);
cek(
  'Rules: blok generik operator tetap mencakup ketiga koleksi (4 daftar: read/create/update/delete)',
  hitung(rules, "'venueBookOrder'") === 4 &&
    hitung(rules, "'spaceRentOrder'") === 4 &&
    hitung(rules, "'trainingOrder'") === 4,
);
cek(
  'Rules: regex tanggal memakai escape ganda yang benar (2 backslash, bukan 4)',
  !rules.includes('\\\\\\\\d') && rules.includes('\\\\d{4}'),
);
cek(
  'Rules: TIDAK ada hasOnly — field opsional jumlahPeserta tidak butuh perubahan rules',
  !rules.includes('hasOnly'),
);

// --- 8. Scroll-to-top saat halaman publik mount (temuan preview 12:34 WIB). ---
cek(
  'Scroll: 7 halaman publik mount dari atas (BookVenue/RentSpace/Training/Lacak/Ajukan/ComingSoon/PlanCampaign)',
  [
    bookVenue,
    rentSpace,
    training,
    lacak,
    ajukan,
    comingSoon,
    planCampaign,
  ].every((f) => f.includes('window.scrollTo({ top: 0 })')),
);
cek(
  'Scroll: BookVenue — bukaDetail + kembaliKeListing juga gulir ke atas (3x scrollTo)',
  hitung(bookVenue, 'window.scrollTo({ top: 0 })') >= 3,
);

// --- Ringkasan. ---
if (gagal > 0) {
  console.error(`\n${gagal} asersi GAGAL.`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');

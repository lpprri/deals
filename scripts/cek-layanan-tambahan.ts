// Verifikasi halaman 3 layanan tambahan (Book a Venue / Rent a Space /
// Get a Journalism Training) — keputusan pengguna 2026-11-21 10:52 WIB:
// bangun ketiganya sekaligus, data dummy dulu.
//
// Asersi:
// - Rute: App.tsx mengenal 'book-venue' | 'rent-space' | 'training',
//   merender ketiga modul baru, dan meneruskan prop baru ke Marklo.
// - Footer: Marklo hanya 3 item baru yang memakai prop baru; 3 item
//   lainnya tetap onComingSoon.
// - Dummy: 5 venue + 4 lahan + 4 course, semua id ada; harga HANYA
//   tarif KB PP 68/2020 (4 harga) + 'Price on request' (9x); tidak ada
//   angka Rp lain; file jelas ditandai DUMMY.
// - Tulis publik: 3 fungsi kirim di firestoreStore.ts + 3 handler di
//   App.tsx (id VBR-/SRR-/TRN-…, status 'Baru'); tabel Order punya
//   kolom Details; 4 kolom lama tetap ada.
// - Rules: 3 blok create publik (auth == null, status 'Baru', satker
//   '41'); blok /meeting dan blok generik operator TIDAK berubah.

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
const idVenue = ['auditorium', 'hall', 'multipurpose-room', 'meeting-room', 'studio'];
const idSpace = ['lahan-kenten', 'lahan-demang', 'lahan-musi', 'lahan-kompleks'];
const idCourse = [
  'pelatihan-jurnalistik',
  'sertifikasi-wartawan',
  'workshop-penulisan',
  'wawancara-reportase',
];
cek(
  'Dummy: 5 venue + 4 lahan + 4 course (semua id ada)',
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
  "Dummy: 'Price on request' tepat 9x (3 venue + 4 lahan + 2 course)",
  hitung(dummy, "harga: 'Price on request'") === 9,
);
cek(
  'Dummy: total 13 baris harga (5 venue + 4 lahan + 4 course)',
  hitung(dummy, "harga: '") === 13,
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
cek('Dummy: tidak ada foto (tidak ada <img)', !dummy.includes('<img'));

// --- 4. Modul halaman baru. ---
cek(
  'BookVenue: form venue/tanggal/occasion/nama/kontak/email + referensi',
  bookVenue.includes('Book this venue') &&
    bookVenue.includes('Occasion') &&
    bookVenue.includes('Your reference number is') &&
    bookVenue.includes('Back to Landing Page'),
);
cek(
  'RentSpace: form space/nama/kontak/email/pesan + referensi',
  rentSpace.includes('Send Inquiry') &&
    rentSpace.includes('Message (optional)') &&
    rentSpace.includes('Your reference number is') &&
    rentSpace.includes('Back to Landing Page'),
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
  'types: 5 field opsional di PermintaanLayanan',
  types.includes('layanan?: string') &&
    types.includes('tanggalLayanan?: string') &&
    types.includes('keperluan?: string') &&
    types.includes('kontak?: string') &&
    types.includes('email?: string'),
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
  'Sales: rincianPermintaan menampilkan layanan + tanggal + keperluan',
  sales.includes('function rincianPermintaan') &&
    sales.includes("join(' · ')"),
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

// --- Ringkasan. ---
if (gagal > 0) {
  console.error(`\n${gagal} asersi GAGAL.`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');

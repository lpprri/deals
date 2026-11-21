// Verifikasi halaman "Partner with RRI" — spec partner-with-rri-spec.md,
// disetujui pengguna 2026-11-21 19:38 WIB (defaults: form Partnership
// Request utama + Book a Free Call sekunder, MoU hanya kategori +
// jumlah + tema tanpa nama institusi, statistik hanya 69 satker /
// 67+ kota).
//
// Asersi:
// - Halaman baru: Hero + 3 pintu + Why (hanya 69/67+) + Trusted by
//   (10 logo landing dipakai ulang, latar navy) + Who partners (agregat
//   MoU) + audiences + 4 langkah + FAQ 8 pertanyaan + form Partnership
//   Request + checklist 7 poin.
// - Agregat MoU dihitung ULANG dari src/lib/seedMou.ts (kategori,
//   jenis, tema setelah strip prefix "Program siaran/Siaran ") —
//   BUKAN disalin dari spec; total 44 record.
// - Form: 5 field, opsi Jenis Kemitraan persis 5, submit ke koleksi
//   'partnershipRequest' (id 'PTR-…', status 'Baru', satker 41) lewat
//   pola publik PR #126; blok rules publik modeled pada blok
//   spaceRentOrder.
// - Tabel Order "Media Partner Order" diganti nama "Partnership
//   Request", baca koleksi baru, empty state baru; tidak ada lagi
//   referensi kode 'mediaPartnerOrder' (komentar sejarah dikecualikan).
// - Pill footer "Partner with RRI" membuka halaman baru (bukan Plan a
//   Campaign); rute 'partner-with-rri' di App.tsx.
// - Header pola Book a Venue, latar bg-white, scroll-to-top on mount.
// - Larangan: 0 "Invite as Media Partner", 0 awards, 0 testimoni,
//   0 harga, 0 statistik landing (500+/1k+/98%), 0 nama institusi
//   (modul TIDAK mengimpor MOU_NYATA).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Dijalankan dari root repo (pola skrip cek lain).
const baca = (relatif: string) =>
  readFileSync(join(process.cwd(), relatif), 'utf8');
const page = baca('src/modules/PartnerWithRri.tsx');
const app = baca('src/App.tsx');
const marklo = baca('src/modules/landing/Marklo.tsx');
const sales = baca('src/modules/Sales.tsx');
const store = baca('src/lib/firestoreStore.ts');
const types = baca('src/lib/types.ts');
const rules = baca('firestore.rules');
const seedMou = baca('src/lib/seedMou.ts');

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};
const hitung = (teks: string, jarum: string) =>
  teks.split(jarum).length - 1;

/** Tally kemunculan nilai field JSON di seedMou.ts. */
const tallySeed = (field: string): Map<string, number> => {
  const peta = new Map<string, number>();
  const pola = new RegExp(`"${field}": "([^"]+)"`, 'g');
  for (const m of seedMou.matchAll(pola)) {
    peta.set(m[1], (peta.get(m[1]) ?? 0) + 1);
  }
  return peta;
};

/** Parse blok konstanta { nama: 'X', jumlah: N } dari modul halaman. */
const parseKonstanta = (blok: string): Map<string, number> => {
  const peta = new Map<string, number>();
  for (const m of blok.matchAll(/\{ nama: '([^']+)', jumlah: (\d+) \}/g)) {
    peta.set(m[1], Number(m[2]));
  }
  return peta;
};
const ambilBlok = (dari: string, sampai: string) =>
  page.slice(page.indexOf(dari), page.indexOf(sampai));

// --- 1. Hero + CTA. ---
cek('Hero: judul "Partner with RRI"', page.includes('Partner with RRI'));
cek('Hero: CTA utama "Plan a Campaign"', page.includes('Plan a Campaign'));
cek('Hero: CTA sekunder "Book a Free Call"', page.includes('Book a Free Call'));
cek(
  'Hero: subjudul hanya 69 satker / 67+ kota',
  page.includes('69 work units in 67+ cities'),
);

// --- 2. Tiga pintu. ---
cek('Pintu 1: "Advertise with RRI"', page.includes('Advertise with RRI'));
cek(
  'Pintu 2: "Use RRI\u2019s Spaces & Services"',
  page.includes('Use RRI&apos;s Spaces &amp; Services'),
);
cek('Pintu 3: "Partner with RRI"', hitung(page, 'Partner with RRI') >= 2);
cek(
  'Pintu 3: CTA "Tell us your interest" gulir ke form',
  page.includes("getElementById('partnership-form')"),
);
cek(
  'Pintu 2: tautan Book a Venue / Rent a Space / Learning Centre',
  page.includes('Book a Venue') &&
    page.includes('Rent a Space') &&
    page.includes('Learning Centre'),
);

// --- 3. Why Partner with RRI — hanya angka terverifikasi. ---
cek('Why: angka 69 + 67+', page.includes('>69<') && page.includes('>67+<'));
cek(
  'Why: 0 statistik landing (500+ / 1k+ / 98%)',
  !page.includes('500+') && !page.includes('1k+') && !page.includes('98%'),
);

// --- 4. Trusted by — logo landing dipakai ulang. ---
cek(
  'Trusted by: impor LOGO_MITRA (dipakai ulang, bukan diregenerasi)',
  page.includes("import { LOGO_MITRA } from '../lib/logoMitra'"),
);
cek(
  'Trusted by: kalimat "Trusted by hundreds of companies in Indonesia"',
  page.includes('Trusted by hundreds of companies in Indonesia'),
);
cek(
  'Trusted by: latar navy (logo artwork putih)',
  page.includes('mk-latar-navy'),
);

// --- 5. Who partners with RRI — agregat MoU dihitung dari seed. ---
const kategoriSeed = tallySeed('kategori');
const jenisSeed = tallySeed('jenis');
const temaSeed = tallySeed('tematik');
const temaTampil = new Map<string, number>();
for (const [tema, jumlah] of temaSeed) {
  const tampil = tema
    .replace(/^Program siaran /, '')
    .replace(/^Program Siaran /, '');
  temaTampil.set(tampil, (temaTampil.get(tampil) ?? 0) + jumlah);
}
const totalSeed = [...kategoriSeed.values()].reduce((a, b) => a + b, 0);
cek('MoU seed: total 44 record', totalSeed === 44, `total ${totalSeed}`);
const kategoriPage = parseKonstanta(
  ambilBlok('const KATEGORI_MOU', 'const JENIS_MOU'),
);
const jenisPage = parseKonstanta(
  ambilBlok('const JENIS_MOU', 'const TEMA_MOU'),
);
const temaPage = parseKonstanta(
  ambilBlok('const TEMA_MOU', '];\n\n/** Checklist'),
);
const banding = (
  nama: string,
  seed: Map<string, number>,
  tampil: Map<string, number>,
) => {
  const salah: string[] = [];
  for (const [k, v] of seed) {
    if (tampil.has(k) && tampil.get(k) !== v) salah.push(`${k}: seed ${v} vs halaman ${tampil.get(k)}`);
  }
  for (const [k, v] of tampil) {
    if (!seed.has(k)) salah.push(`${k}: halaman ${v}, tidak ada di seed`);
  }
  cek(nama, salah.length === 0, salah.join('; '));
};
banding('MoU kategori: halaman == seed', kategoriSeed, kategoriPage);
banding('MoU jenis: halaman == seed', jenisSeed, jenisPage);
// Tema: halaman hanya menampilkan 9 tema teratas (jumlah >= 3); tema
// sekali-muncul (4 tema) tidak ditampilkan — bandingkan hanya yang
// ditampilkan.
const temaSeedTop = new Map(
  [...temaTampil].filter(([, v]) => v >= 3),
);
banding('MoU tema teratas: halaman == seed', temaSeedTop, temaPage);
cek(
  'MoU: 0 nama institusi — modul tidak impor data MoU (hanya agregat)',
  !/import\s+.*MOU_NYATA/.test(page) &&
    !page.includes("from '../lib/seedMou'") &&
    !page.includes('from "./seedMou"'),
);

// --- 6. Audiences + target perluasan MoU. ---
cek(
  'Audiences: komunitas / akademik & mahasiswa / EO konser',
  page.includes('Community groups') &&
    page.includes('Academic &amp; student communities') &&
    page.includes('Event organisers'),
);
cek(
  'Perluasan MoU: EO auditorium/hall/meeting room, hotel, EO pihak ketiga',
  // Normalisasi whitespace — JSX membungkus kalimat di beberapa baris
  // sumber (newline dirender sebagai satu spasi).
  (() => {
    const normal = page.replace(/\s+/g, ' ');
    return (
      normal.includes('auditoriums, halls, and meeting rooms') &&
      normal.includes('Hotels offering rooms for RRI official activities') &&
      normal.includes('third party between RRI and')
    );
  })(),
);

// --- 7. 4 Easy Steps. ---
cek(
  'Steps: judul + 4 langkah',
  page.includes('Start a Partnership in 4 Easy Steps') &&
    page.includes('Tell us your interest') &&
    page.includes("Let's discuss") &&
    page.includes('Sign the agreement') &&
    page.includes("You're live"),
);

// --- 8. FAQ — 8 pertanyaan spec. ---
const FAQ = [
  'Who can become an RRI partner?',
  'What forms of cooperation exist?',
  'How do I advertise?',
  'How do I book a venue, rent space, or join training?',
  'How do I become a media partner or support an event?',
  'What does it cost?',
  'How do I track my cooperation?',
  'Who do I contact?',
];
cek(
  'FAQ: 8 pertanyaan spec',
  FAQ.every((q) => page.includes(q)),
  `ditemukan ${FAQ.filter((q) => page.includes(q)).length}/8`,
);
cek(
  'FAQ: accordion (pertama terbuka, +/−)',
  page.includes('faqTerbuka') && page.includes('useState(0)'),
);
cek(
  'FAQ Q7: jawaban menyebut halaman Track your Deal (teks saja — TANPA tombol tautan ke Lacak; keputusan 2026-11-21: Lacak tanpa tombol masuk; prop onLacak tidak ada di halaman ini)',
  page.includes('Use the Track your Deal page with your PKS or invoice number') &&
    !page.includes('onLacak'),
);

// --- 9. Checklist proposal 7 poin. ---
const CHECKLIST = [
  'Business overview',
  'Your unique selling points',
  'Proposed partnership model',
  'Your goals',
  'Resources you need from RRI',
  'Performance estimates',
  'Timeline',
];
cek(
  'Checklist: 7 poin proposal',
  CHECKLIST.every((c) => page.includes(c)),
  `ditemukan ${CHECKLIST.filter((c) => page.includes(c)).length}/7`,
);
cek(
  'Checklist: judul "A good proposal covers"',
  page.includes('A good proposal covers'),
);

// --- 10. Form Partnership Request. ---
cek(
  'Form: 5 field (Nama, Institusi, Email, Jenis, Pesan)',
  page.includes('Name') &&
    page.includes('Institution / Organisation') &&
    page.includes('Email') &&
    page.includes('Partnership Type') &&
    page.includes('Message'),
);
cek(
  'Form: 5 opsi Jenis Kemitraan',
  ['Media Partner', 'Join Our Event', 'MoU', 'Event Support', 'Other'].every(
    (o) => page.includes(`'${o}'`),
  ),
);
cek(
  'Form: id section "partnership-form"',
  page.includes('id="partnership-form"'),
);
cek(
  'Form: sukses tampilkan nomor referensi',
  page.includes('Your reference number is'),
);

// --- 11. Koleksi + submit (pola PR #126). ---
cek(
  'Store: KOLEKSI.partnershipRequest',
  store.includes("partnershipRequest: 'partnershipRequest'"),
);
cek(
  'Store: kirimPermintaanPartnershipPublik (setDoc + bersihkanUndefined)',
  store.includes('kirimPermintaanPartnershipPublik') &&
    store.includes('KOLEKSI.partnershipRequest'),
);
cek(
  'Types: PermintaanLayanan.institusi (opsional)',
  types.includes('institusi?: string'),
);
cek(
  'App: handler kirimPermintaanPartnershipPublik, id PTR-…, status Baru, satker 41',
  app.includes('kirimPermintaanPartnershipPublik') &&
    app.includes("idBerikutnya(\n      'PTR-',") &&
    app.includes("status: 'Baru'") &&
    app.includes('satker: SATKER_PILOT'),
);
cek(
  'Rules: blok publik /partnershipRequest/{id}',
  rules.includes('match /partnershipRequest/{id}') &&
    rules.includes("request.resource.data.status == 'Baru'") &&
    rules.includes("request.resource.data.satker.kode == '41'"),
);
cek(
  'Rules: blok publik partnershipRequest izinkan create tanpa login',
  rules
    .slice(rules.indexOf('match /partnershipRequest/{id}'))
    .includes('allow create: if request.auth == null'),
);

// --- 12. Tabel Order diganti nama. ---
cek(
  'Sales: tabel "Partnership Request"',
  sales.includes('judul="Partnership Request"'),
);
cek(
  'Sales: empty state baru',
  sales.includes(
    'No partnership requests yet. Requests from the Partner with RRI form will appear here.',
  ),
);
cek(
  'Sales: baca data.partnershipRequest',
  sales.includes('data.partnershipRequest'),
);
cek(
  'Rename: 0 referensi kode mediaPartnerOrder di src + rules (komentar sejarah dikecualikan)',
  !sales.includes('data.mediaPartnerOrder') &&
    !sales.includes('mediaPartnerTersaring') &&
    !store.includes("'mediaPartnerOrder'") &&
    !types.includes('mediaPartnerOrder:') &&
    !rules.includes("'mediaPartnerOrder'") &&
    !app.includes('mediaPartnerOrder'),
);

// --- 13. Rute + pill footer. ---
cek(
  'App: rute \'partner-with-rri\' + render PartnerWithRri',
  app.includes("'partner-with-rri'") && app.includes('<PartnerWithRri'),
);
cek(
  'App: onBookFreeCall → beranda + gulir ke kartu booking',
  app.includes('bukaBookingLanding') &&
    app.includes("getElementById('booking')"),
);
cek(
  'Marklo: prop onPartnerWithRri di interface + Footer',
  marklo.includes('onPartnerWithRri: () => void') &&
    marklo.includes('onPartnerWithRri={onPartnerWithRri}'),
);
cek(
  'Marklo: pill "Partner with RRI" memanggil onPartnerWithRri',
  marklo.includes('onClick={onPartnerWithRri}'),
);
cek(
  'App: pill footer → setHalamanPublik(\'partner-with-rri\')',
  app.includes("onPartnerWithRri={() => setHalamanPublik('partner-with-rri')}"),
);

// --- 14. Header + latar + scroll-to-top. ---
cek(
  'Header: pola Book a Venue (panah + logo h-10, judul kanan)',
  page.includes('aria-label="Back to Landing Page"') &&
    page.includes('LOGO_RRI_LOCKUP_DATA_URI') &&
    page.includes('h-10 w-auto'),
);
cek('Latar: bg-white', page.includes('bg-white px-4 py-6'));
cek(
  'Scroll-to-top on mount',
  page.includes('window.scrollTo({ top: 0 })'),
);

// --- 15. Larangan. ---
cek(
  'Larangan: 0 "Invite as Media Partner"',
  !page.includes('Invite as Media Partner'),
);
cek(
  'Larangan: 0 awards / testimoni / harga',
  !/award/i.test(page) &&
    !/testimonial/i.test(page) &&
    !page.includes('Rp') &&
    !page.includes('Price on request'),
);

if (gagal > 0) {
  console.error(`\n${gagal} asersi GAGAL.`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');

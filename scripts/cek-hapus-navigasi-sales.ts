// Verifikasi Sales dihapus dari navigasi sidebar (PR #43, src/App.tsx).
// Asersi: 'sales' TIDAK ada di CLUSTER_SIDEBAR mana pun (cluster 3 =
// Campaign, Clients, Prospect, Offer, Order); cluster lain
// tidak berubah; entri MODULES 'sales' + cabang render tetap ada;
// semua komponen Sales yang dipakai ulang tetap diekspor dan dipakai
// (TabProspek, TabOrder, TabMeeting, TabAnalytics, FormQuotation);
// TIDAK ada jalur masuk ke tampilan Sales (tanpa setActive /
// onNavigasi 'sales', tanpa notifikasi bermodul 'sales').
// CATATAN PR #45 (16/11/2026): bentuk cluster berubah — cluster 1 kini
// Home, Task, Chat; cluster 4 kini Revenue, Reports, Resources;
// cluster 5 hilang. CATATAN PR #47 (16/11/2026): cluster 4 kini
// Revenue, Reports, Resources, Feedback ('umpanBalik' pindah ke
// cluster 4). CATATAN PR #48 (16/11/2026): cluster 4 kini Revenue,
// Reports, Feedback, Resources; cluster 1 kini Home, Task, Chat,
// Meeting; cluster 3 kini Campaign, Clients, Prospect, Offer, Order
// (Meeting pindah ke cluster 1; Clients naik ke setelah Campaign).
// Asersi "cluster lain" di bawah mengikuti
// bentuk AKHIR itu; inti skrip ini (Sales tidak di sidebar) tidak
// berubah.
// Skrip ini membaca berkas sebagai teks. Keluar bukan-nol bila ada
// asersi gagal.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Dijalankan dari root repo (pola skrip cek lain) — berkas dibaca saat
// runtime, jadi path diambil dari cwd, bukan dari lokasi bundle.
const baca = (relatif: string) =>
  readFileSync(join(process.cwd(), relatif), 'utf8');
const app = baca('src/App.tsx');
const sales = baca('src/modules/Sales.tsx');
const notifikasi = baca('src/lib/notifikasi.ts');

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};

// --- Ekstrak CLUSTER_SIDEBAR (daftar cluster sesuai urutan berkas). ---
const blokCluster = app.slice(
  app.indexOf('const CLUSTER_SIDEBAR: ModuleId[][] = ['),
  app.indexOf('];', app.indexOf('const CLUSTER_SIDEBAR: ModuleId[][] = [')),
);
const barisCluster = blokCluster
  .split('\n')
  .map((baris) => baris.trim())
  .filter((baris) => baris.startsWith('['))
  .map((baris) => [...baris.matchAll(/'(\w+)'/g)].map((b) => b[1]));

// --- Asersi CLUSTER_SIDEBAR. ---
cek(
  "cluster 3 = Campaign, Clients, Prospect, Offer, Order (tanpa Sales/Meeting)",
  JSON.stringify(barisCluster[2]) ===
    JSON.stringify([
      'marketing',
      'klien',
      'prospek',
      'offer',
      'order',
    ]),
  (barisCluster[2] ?? []).join(', '),
);
cek(
  "TIDAK ada cluster yang memuat 'sales'",
  !barisCluster.some((c) => c.includes('sales')),
);
cek(
  'cluster lain sesuai PR #48 (1 Home/Task/Chat/Meeting; 2 Contract/MoU/Commitment/Approvement; 4 Revenue/Reports/Feedback/Resources; tanpa cluster 5)',
  JSON.stringify(barisCluster[0]) ===
    JSON.stringify(['home', 'todo', 'chat', 'meeting']) &&
    JSON.stringify(barisCluster[1]) ===
      JSON.stringify(['kontrak', 'mou', 'komitmen', 'approvement']) &&
    JSON.stringify(barisCluster[3]) ===
      JSON.stringify(['revenue', 'reporting', 'umpanBalik', 'service']) &&
    barisCluster.length === 4,
  barisCluster.map((c) => c.join(',')).join(' | '),
);

// --- Asersi MODULES + render branch tetap ada. ---
cek(
  "entri MODULES 'sales' tetap ada tepat 1×",
  (app.match(/id: 'sales',/g) ?? []).length === 1,
);
cek(
  'cabang render Sales tetap ada',
  app.includes("active === 'sales' && <Sales"),
);
cek(
  "label 'Sales' tetap ada di MODULES (hanya tidak di sidebar)",
  app.includes("label: 'Sales',"),
);

// --- Asersi komponen Sales yang dipakai ulang tetap diekspor + dipakai. ---
const komponen = [
  'TabProspek',
  'TabOrder',
  'TabMeeting',
  'TabAnalytics',
  'FormQuotation',
] as const;
for (const nama of komponen) {
  cek(
    `Sales.tsx tetap mengekspor ${nama}`,
    sales.includes(`export function ${nama}(`),
  );
}
cek(
  'MenuProspek memakai TabProspek',
  baca('src/modules/Prospek.tsx').includes(
    "import { TabProspek } from './Sales'",
  ),
);
cek(
  'MenuOrder memakai TabOrder',
  baca('src/modules/Penawaran.tsx').includes('TabOrder'),
);
cek(
  'MenuMeeting memakai TabMeeting',
  baca('src/modules/Pertemuan.tsx').includes(
    "import { TabMeeting } from './Sales'",
  ),
);
cek(
  'Offer memakai TabAnalytics + FormQuotation',
  baca('src/modules/Penawaran.tsx').includes('TabAnalytics') &&
    baca('src/modules/Penawaran.tsx').includes('FormQuotation'),
);

// --- Asersi TIDAK ada jalur masuk ke tampilan Sales. ---
const semuaSrc = [
  app,
  sales,
  ...['Prospek', 'Penawaran', 'Pertemuan', 'Klien', 'KerjaSama', 'UmpanBalik'].map(
    (m) => baca(`src/modules/${m}.tsx`),
  ),
].join('\n');
cek(
  "tidak ada setActive('sales') di src/",
  !semuaSrc.includes("setActive('sales')"),
);
cek(
  "tidak ada onNavigasi('sales') di src/",
  !semuaSrc.includes("onNavigasi('sales')"),
);
cek(
  "tidak ada notifikasi bermodul 'sales'",
  !notifikasi.includes("modul: 'sales'"),
);

// --- Asersi panel Permintaan — LIMA TAB jenis permintaan (perintah
// pengguna 2026-11-24; menggantikan lima tabel bertumpuk PR #115 —
// Training Order sudah DIHAPUS perintah pengguna 2026-11-22). ---
// Tab: PNBP Fungsional (Pesanan manual + Permintaan penawaran iklan),
// PNBP Umum (Pesanan booking venue + Pesanan sewa ruang),
// Nota Kesepahaman (Partnership Request layanan 'MoU'),
// Dukungan Layanan (Partnership Request layanan 'Event Support'),
// Media Partner (Partnership Request layanan 'Media Partner' +
// 'Join Our Event' / 'Other' / tanpa layanan — edge case, lihat komentar
// di TabOrder; saat ini 0 record).
// Semua tab menampilkan daftar permintaan berisi identitas peminta
// kerja sama (prospek / nama lengkap + perusahaan / klien + institusi).
const tabOrder = sales.slice(sales.indexOf('export function TabOrder('));
const types = baca('src/lib/types.ts');
const store = baca('src/lib/firestoreStore.ts');
const seed = baca('src/lib/seedNyata.ts');
const contoh = baca('src/lib/sampleData.ts');
const rules = baca('firestore.rules');
const labels = baca('src/lib/labels.ts');

const urutanTab = [
  "{ id: 'fungsional', label: 'PNBP Fungsional' }",
  "{ id: 'umum', label: 'PNBP Umum' }",
  "{ id: 'mou', label: 'Nota Kesepahaman' }",
  "{ id: 'dukungan', label: 'Dukungan Layanan' }",
  "{ id: 'media', label: 'Media Partner' }",
];
const posisiTab = urutanTab.map((t) => tabOrder.indexOf(t));
cek(
  'panel Permintaan: lima tab berurutan (PNBP Fungsional, PNBP Umum, Nota Kesepahaman, Dukungan Layanan, Media Partner)',
  posisiTab.every((p) => p >= 0) &&
    posisiTab.every((p, i) => i === 0 || p > posisiTab[i - 1]),
  posisiTab.join(', '),
);
cek(
  'panel Permintaan: tab default = fungsional + TabBar dirender sebelum isi tab',
  tabOrder.includes("useState('fungsional')") &&
    tabOrder.indexOf('<TabBar') >= 0 &&
    tabOrder.indexOf('<TabBar') < tabOrder.indexOf("tab === 'fungsional'"),
);
cek(
  'PNBP Fungsional: Pesanan manual + Permintaan penawaran iklan dalam satu tab',
  tabOrder.indexOf('<JudulBagian>Pesanan manual</JudulBagian>') >
    tabOrder.indexOf("tab === 'fungsional'") &&
    tabOrder.indexOf('<JudulBagian>Permintaan penawaran iklan</JudulBagian>') >
      tabOrder.indexOf("tab === 'fungsional'") &&
    tabOrder.indexOf('<JudulBagian>Permintaan penawaran iklan</JudulBagian>') <
      tabOrder.indexOf("tab === 'umum'"),
);
cek(
  'Pesanan manual: judul + tombol + Buat pesanan + kolom lama utuh',
  tabOrder.includes('<JudulBagian>Pesanan manual</JudulBagian>') &&
    tabOrder.includes('+ Buat pesanan') &&
    [
      '<Th>ID</Th>',
      '<Th>Penawaran</Th>',
      '<Th>Prospek</Th>',
      '<Th>Tanggal pesanan</Th>',
      '<Th>Status</Th>',
      '<Th kanan>Nilai</Th>',
      '<Th>Kontrak</Th>',
    ].every((h) => tabOrder.includes(h)),
);
cek(
  'TIDAK ada lagi lima tabel bertumpuk di luar tab (judul tabel Umum hanya di dalam tabnya)',
  tabOrder.indexOf('judul="Pesanan booking venue"') >
    tabOrder.indexOf("tab === 'umum'") &&
    tabOrder.indexOf('judul="Pesanan booking venue"') <
      tabOrder.indexOf("tab === 'mou'"),
);
cek(
  "judul halaman 'Order' + subtitle shell Bahasa Indonesia (App.tsx)",
  app.includes(
    "description: 'Daftar permintaan, sama dengan tab Pesanan di Sales (ORD-01 …).'",
  ),
);
cek(
  'Permintaan penawaran iklan: 7 kolom + empty state jujur + tanpa tombol create',
  [
    '<Th>ID permintaan</Th>',
    '<Th>Klien</Th>',
    '<Th>Perusahaan</Th>',
    '<Th>Layanan</Th>',
    '<Th>Anggaran</Th>',
    '<Th>Dikirim</Th>',
    '<Th>Status</Th>',
  ].every((h) => tabOrder.includes(h)) &&
    tabOrder.includes(
      'Belum ada permintaan penawaran. Respons dari formulir Plan a Campaign akan muncul di sini otomatis setelah webhook tersambung.',
    ) &&
    !tabOrder.includes('Create Quotation Request'),
);
const tabelLayanan: [string, string, string][] = [
  [
    'Pesanan booking venue',
    'Belum ada pesanan booking venue. Permintaan dari formulir Book a Venue akan muncul di sini.',
    "tab === 'umum'",
  ],
  [
    'Pesanan sewa ruang',
    'Belum ada pesanan sewa ruang. Permintaan dari formulir Rent a Space akan muncul di sini.',
    "tab === 'umum'",
  ],
  [
    'Nota Kesepahaman',
    "Belum ada permintaan Nota Kesepahaman. Permintaan kemitraan dengan jenis 'MoU' dari formulir Partner with RRI akan muncul di sini.",
    "tab === 'mou'",
  ],
  [
    'Dukungan Layanan',
    "Belum ada permintaan Dukungan Layanan. Permintaan kemitraan dengan jenis 'Event Support' dari formulir Partner with RRI akan muncul di sini.",
    "tab === 'dukungan'",
  ],
  [
    'Media Partner',
    "Belum ada permintaan Media Partner. Permintaan kemitraan dengan jenis 'Media Partner' dari formulir Partner with RRI akan muncul di sini.",
    "tab === 'media'",
  ],
];
for (const [judul, kosong, tab] of tabelLayanan) {
  cek(
    `tab ${judul}: judul + empty state jujur di dalam tabnya`,
    tabOrder.includes(`judul="${judul}"`) &&
      tabOrder.includes(kosong) &&
      tabOrder.indexOf(`judul="${judul}"`) > tabOrder.indexOf(tab),
  );
}
cek(
  'Partnership Request dipecah per jenis kemitraan (field layanan)',
  tabOrder.includes("r.layanan === 'MoU'") &&
    tabOrder.includes("r.layanan === 'Event Support'") &&
    tabOrder.includes("r.layanan === 'Media Partner'"),
);
cek(
  "edge case: 'Join Our Event' / 'Other' / tanpa layanan ikut tab Media Partner (tidak ada record tersembunyi)",
  tabOrder.includes("r.layanan === 'Join Our Event'") &&
    tabOrder.includes("r.layanan === 'Other'") &&
    tabOrder.includes('!r.layanan'),
);
cek(
  'tabel layanan: kolom bersama ID permintaan / Klien / Tanggal permintaan / Status',
  tabOrder.includes('<Th>ID permintaan</Th>') &&
    tabOrder.includes('<Th>Tanggal permintaan</Th>'),
);
cek(
  'tabel layanan: tanpa tombol create',
  !tabOrder.includes('Create Venue') &&
    !tabOrder.includes('Create Space') &&
    !tabOrder.includes('Create Media'),
);
cek(
  'TIDAK ada tabel Support our Event / Collaborate with Us',
  !tabOrder.includes('Support our Event') &&
    !tabOrder.includes('Collaborate with Us'),
);
cek(
  'filter panel (cari) berlaku untuk empat daftar baru',
  tabOrder.includes('data.adsQuotationRequest.filter') &&
    tabOrder.includes('data.venueBookOrder.filter') &&
    tabOrder.includes('data.spaceRentOrder.filter') &&
    tabOrder.includes('data.partnershipRequest.filter'),
);
cek(
  'DetailOrder tetap berfungsi (klik baris order → detail, kembali ke daftar)',
  tabOrder.includes('<DetailOrder') &&
    tabOrder.includes('onKembali={() => setOrderIdTerpilih(null)}'),
);
cek(
  'types: AdsQuotationRequest + PermintaanLayanan + StatusPermintaan + 5 kunci AppData',
  types.includes('export interface AdsQuotationRequest {') &&
    types.includes('export interface PermintaanLayanan {') &&
    types.includes('export type StatusPermintaan =') &&
    types.includes('adsQuotationRequest: AdsQuotationRequest[];') &&
    types.includes('venueBookOrder: PermintaanLayanan[];') &&
    types.includes('spaceRentOrder: PermintaanLayanan[];') &&
    types.includes('trainingOrder: PermintaanLayanan[];') &&
    types.includes('partnershipRequest: PermintaanLayanan[];'),
);
cek(
  'firestoreStore: KOLEKSI memetakan 5 koleksi baru',
  [
    'adsQuotationRequest',
    'venueBookOrder',
    'spaceRentOrder',
    'trainingOrder',
    'partnershipRequest',
  ].every((k) => store.includes(`${k}: '${k}',`)),
);
cek(
  'seed + contoh: 5 array baru mulai kosong (tanpa data contoh)',
  [
    'adsQuotationRequest: [],',
    'venueBookOrder: [],',
    'spaceRentOrder: [],',
    'trainingOrder: [],',
    'partnershipRequest: [],',
  ].every((s) => seed.includes(s) && contoh.includes(s)),
);
cek(
  'firestore.rules: 5 koleksi baru di allowlist operator',
  [
    'adsQuotationRequest',
    'venueBookOrder',
    'spaceRentOrder',
    'trainingOrder',
    'partnershipRequest',
  ].every((k) => rules.includes(`'${k}'`)),
);
cek(
  'labels: labelStatusPermintaan ada',
  labels.includes('export function labelStatusPermintaan('),
);

// --- Asersi pemetaan UUID opsi Tally -> label (PR #115, amandemen). ---
// Tally menyimpan jawaban pilihan sebagai UUID blok opsi (terverifikasi
// via API pada submission laGXkbk); tabel Ads Quotation Request WAJIB
// menampilkan labelnya, bukan UUID mentah.
const petaOpsi = baca('src/lib/petaOpsiTally.ts');
const jumlahEntriPeta = (
  petaOpsi.match(
    /'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}': '/g,
  ) ?? []
).length;
cek(
  'petaOpsiTally: 49 entri UUID -> label dari form ArpNAN',
  jumlahEntriPeta === 49,
  String(jumlahEntriPeta),
);
cek(
  'petaOpsiTally: contoh terverifikasi d774d4c6-... -> Social Media Ads',
  petaOpsi.includes(
    "'d774d4c6-9d38-5e4d-8f30-4b0470608ebf': 'Social Media Ads'",
  ),
);
cek(
  'petaOpsiTally: helper labelOpsiTally ada + fallback nilai asli',
  petaOpsi.includes('export function labelOpsiTally(') &&
    petaOpsi.includes('PETA_OPSI_TALLY[nilai] ?? nilai'),
);
cek(
  'Ads Quotation Request: layanan + anggaran dirender lewat labelOpsiTally (bukan UUID mentah)',
  tabOrder.includes('r.layanan.map(labelOpsiTally)') &&
    tabOrder.includes('labelOpsiTally(r.anggaran)') &&
    sales.includes("from '../lib/petaOpsiTally'"),
);

if (gagal > 0) {
  console.log(`\n${gagal} asersi GAGAL`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');


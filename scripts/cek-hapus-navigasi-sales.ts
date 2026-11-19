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

// --- Asersi panel Order — enam tabel (PR #115, 19/11/2026). ---
// Urutan: Manual Order, Ads Quotation Request, Venue Book Order,
// Space Rent Order, Training Order, Media Partner Order. Manual Order
// adalah tabel Order yang sudah ada (judul saja yang berubah); lima
// tabel baru mulai kosong dengan empty state jujur; TIDAK ada tabel
// untuk Support our Event / Collaborate with Us.
const tabOrder = sales.slice(sales.indexOf('export function TabOrder('));
const types = baca('src/lib/types.ts');
const store = baca('src/lib/firestoreStore.ts');
const seed = baca('src/lib/seedNyata.ts');
const contoh = baca('src/lib/sampleData.ts');
const rules = baca('firestore.rules');
const labels = baca('src/lib/labels.ts');

const urutanJudul = [
  'Manual Order',
  'Ads Quotation Request',
  'Venue Book Order',
  'Space Rent Order',
  'Training Order',
  'Media Partner Order',
];
const posisiJudul = urutanJudul.map((j) => tabOrder.indexOf(j));
cek(
  'panel Order: enam judul tabel berurutan (Manual, Ads Quotation Request, Venue, Space, Training, Media Partner)',
  posisiJudul.every((p) => p >= 0) &&
    posisiJudul.every((p, i) => i === 0 || p > posisiJudul[i - 1]),
  posisiJudul.join(', '),
);
cek(
  'Manual Order: judul + tombol + Create Order + kolom lama utuh',
  tabOrder.includes('<JudulBagian>Manual Order</JudulBagian>') &&
    tabOrder.includes('+ Create Order') &&
    [
      '<Th>ID</Th>',
      '<Th>Quotation</Th>',
      '<Th>Prospect</Th>',
      '<Th>Order Date</Th>',
      '<Th>Status</Th>',
      '<Th kanan>Value</Th>',
      '<Th>Contract</Th>',
    ].every((h) => tabOrder.includes(h)),
);
cek(
  "judul halaman 'Order' + subtitle shell tidak berubah (App.tsx)",
  app.includes("description: 'Order list — the same Order tab as Sales (ORD-01 …).'"),
);
cek(
  'Ads Quotation Request: 7 kolom + empty state jujur + tanpa tombol create',
  [
    '<Th>Request ID</Th>',
    '<Th>Client</Th>',
    '<Th>Company</Th>',
    '<Th>Services</Th>',
    '<Th>Budget</Th>',
    '<Th>Submitted</Th>',
    '<Th>Status</Th>',
  ].every((h) => tabOrder.includes(h)) &&
    tabOrder.includes(
      'No quotation requests yet. Responses from the Plan a Campaign form will appear here automatically once the webhook is connected.',
    ) &&
    !tabOrder.includes('Create Quotation Request'),
);
const tabelLayanan: [string, string][] = [
  [
    'Venue Book Order',
    'No venue booking orders yet. Requests from the Book a Venue form will appear here once it is available.',
  ],
  [
    'Space Rent Order',
    'No space rental orders yet. Requests from the Rent a Space form will appear here once it is available.',
  ],
  [
    'Training Order',
    'No journalism training orders yet. Requests from the Get a Journalism Training form will appear here once it is available.',
  ],
  [
    'Media Partner Order',
    'No media partner orders yet. Requests from the Invite as Media Partner form will appear here once it is available.',
  ],
];
for (const [judul, kosong] of tabelLayanan) {
  cek(
    `tabel layanan ${judul}: judul + empty state jujur`,
    tabOrder.includes(judul) && tabOrder.includes(kosong),
  );
}
cek(
  'tabel layanan: kolom bersama Request ID / Client / Request Date / Status',
  tabOrder.includes('<Th>Request ID</Th>') &&
    tabOrder.includes('<Th>Request Date</Th>'),
);
cek(
  'tabel layanan: tanpa tombol create',
  !tabOrder.includes('Create Venue') &&
    !tabOrder.includes('Create Space') &&
    !tabOrder.includes('Create Training') &&
    !tabOrder.includes('Create Media'),
);
cek(
  'TIDAK ada tabel Support our Event / Collaborate with Us',
  !tabOrder.includes('Support our Event') &&
    !tabOrder.includes('Collaborate with Us'),
);
cek(
  'filter panel (cari) berlaku untuk lima tabel baru',
  tabOrder.includes('data.adsQuotationRequest.filter') &&
    tabOrder.includes('data.venueBookOrder.filter') &&
    tabOrder.includes('data.spaceRentOrder.filter') &&
    tabOrder.includes('data.trainingOrder.filter') &&
    tabOrder.includes('data.mediaPartnerOrder.filter'),
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
    types.includes('mediaPartnerOrder: PermintaanLayanan[];'),
);
cek(
  'firestoreStore: KOLEKSI memetakan 5 koleksi baru',
  [
    'adsQuotationRequest',
    'venueBookOrder',
    'spaceRentOrder',
    'trainingOrder',
    'mediaPartnerOrder',
  ].every((k) => store.includes(`${k}: '${k}',`)),
);
cek(
  'seed + contoh: 5 array baru mulai kosong (tanpa data contoh)',
  [
    'adsQuotationRequest: [],',
    'venueBookOrder: [],',
    'spaceRentOrder: [],',
    'trainingOrder: [],',
    'mediaPartnerOrder: [],',
  ].every((s) => seed.includes(s) && contoh.includes(s)),
);
cek(
  'firestore.rules: 5 koleksi baru di allowlist operator',
  [
    'adsQuotationRequest',
    'venueBookOrder',
    'spaceRentOrder',
    'trainingOrder',
    'mediaPartnerOrder',
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

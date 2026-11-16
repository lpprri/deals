// Verifikasi Sales dihapus dari navigasi sidebar (PR #43, src/App.tsx).
// Asersi: 'sales' TIDAK ada di CLUSTER_SIDEBAR mana pun (cluster 3 =
// Campaign, Prospect, Offer, Order, Clients, Meeting); cluster lain
// tidak berubah; entri MODULES 'sales' + cabang render tetap ada;
// semua komponen Sales yang dipakai ulang tetap diekspor dan dipakai
// (TabProspek, TabOrder, TabMeeting, TabAnalytics, FormQuotation);
// TIDAK ada jalur masuk ke tampilan Sales (tanpa setActive /
// onNavigasi 'sales', tanpa notifikasi bermodul 'sales').
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
  "cluster 3 = Campaign, Prospect, Offer, Order, Clients, Meeting (tanpa Sales)",
  JSON.stringify(barisCluster[2]) ===
    JSON.stringify([
      'marketing',
      'prospek',
      'offer',
      'order',
      'klien',
      'meeting',
    ]),
  (barisCluster[2] ?? []).join(', '),
);
cek(
  "TIDAK ada cluster yang memuat 'sales'",
  !barisCluster.some((c) => c.includes('sales')),
);
cek(
  'cluster lain tidak berubah (1 Home; 2 Contract/MoU/Commitment/Approvement; 4 Revenue/Reports; 5 Task/Resources)',
  JSON.stringify(barisCluster[0]) === JSON.stringify(['home']) &&
    JSON.stringify(barisCluster[1]) ===
      JSON.stringify(['kontrak', 'mou', 'komitmen', 'approvement']) &&
    JSON.stringify(barisCluster[3]) ===
      JSON.stringify(['revenue', 'reporting']) &&
    JSON.stringify(barisCluster[4]) === JSON.stringify(['todo', 'service']),
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

if (gagal > 0) {
  console.log(`\n${gagal} asersi GAGAL`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');

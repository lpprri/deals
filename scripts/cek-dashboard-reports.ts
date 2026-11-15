// Verifikasi Dashboard masuk ke panel REPORTS (PR #42, src/App.tsx).
// Asersi: entri 'dashboard' punya induk 'reporting' dan muncul SEBELUM
// 'umpanBalik' di MODULES (urutan panel REPORTS: Dashboard, lalu
// Feedback Survey); simulasi aturan yang sama dengan kode (navUtama =
// tanpa induk & bukan Admin; panel = anak-anak induk; panelUntukTampilan
// = induk bila ada, dirinya bila punya anak, null bila tidak ada);
// cluster 4 CLUSTER_SIDEBAR = ['revenue', 'reporting'] (tanpa
// dashboard); tampilan awal login tetap 'dashboard'; cabang render
// Dashboard tetap ada; logika panel generik tidak berubah.
// Skrip ini membaca src/App.tsx sebagai teks (MODULES tidak diekspor).
// Keluar bukan-nol bila ada asersi gagal.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Dijalankan dari root repo (pola skrip cek lain) — App.tsx dibaca saat
// runtime, jadi path diambil dari cwd, bukan dari lokasi bundle.
const sumber = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};

// --- Ekstrak entri MODULES (id + induk + phase) sesuai urutan berkas. ---
const blokModules = sumber.slice(
  sumber.indexOf('const MODULES: NavItem[] = ['),
  sumber.indexOf('];', sumber.indexOf('const MODULES: NavItem[] = [')),
);
type Entri = { id: string; induk?: string; phase: string };
const entri: Entri[] = [];
const polaId = /id: '(\w+)'/g;
let m: RegExpExecArray | null;
while ((m = polaId.exec(blokModules)) !== null) {
  const mulai = m.index;
  const akhir = blokModules.indexOf("id: '", mulai + 1);
  const potong = blokModules.slice(mulai, akhir === -1 ? undefined : akhir);
  const induk = potong.match(/induk: '(\w+)'/)?.[1];
  const phase = potong.match(/phase: '(\w+)'/)?.[1] ?? '';
  entri.push({ id: m[1], induk, phase });
}
const cari = (id: string) => entri.find((e) => e.id === id);
const indeks = (id: string) => entri.findIndex((e) => e.id === id);

// --- Simulasi aturan yang sama dengan kode di App.tsx. ---
const navUtama = entri.filter((e) => e.phase !== 'Admin' && !e.induk);
const anakPanel = (indukId: string) =>
  entri.filter((e) => e.induk === indukId).map((e) => e.id);
const panelUntukTampilan = (id: string): string | null => {
  const e = cari(id);
  if (!e) return null;
  if (e.induk) return e.induk;
  return entri.some((c) => c.induk === id) ? id : null;
};

// --- Asersi struktur MODULES. ---
cek(
  "entri 'dashboard' ada tepat 1×",
  entri.filter((e) => e.id === 'dashboard').length === 1,
);
cek(
  "entri 'dashboard' punya induk 'reporting'",
  cari('dashboard')?.induk === 'reporting',
);
cek(
  "entri 'umpanBalik' tetap punya induk 'reporting'",
  cari('umpanBalik')?.induk === 'reporting',
);
cek(
  "urutan MODULES: 'dashboard' sebelum 'umpanBalik'",
  indeks('dashboard') !== -1 &&
    indeks('umpanBalik') !== -1 &&
    indeks('dashboard') < indeks('umpanBalik'),
  `dashboard@${indeks('dashboard')}, umpanBalik@${indeks('umpanBalik')}`,
);

// --- Asersi perilaku panel (simulasi). ---
cek(
  "panelUntukTampilan('dashboard') = 'reporting'",
  panelUntukTampilan('dashboard') === 'reporting',
);
cek(
  "panelUntukTampilan('umpanBalik') = 'reporting'",
  panelUntukTampilan('umpanBalik') === 'reporting',
);
cek(
  "panelUntukTampilan('reporting') = 'reporting' (induk punya anak)",
  panelUntukTampilan('reporting') === 'reporting',
);
cek(
  "panelUntukTampilan('revenue') = null (tanpa sub-item)",
  panelUntukTampilan('revenue') === null,
);
cek(
  "anak panel REPORTS berurutan Dashboard, Feedback Survey",
  JSON.stringify(anakPanel('reporting')) ===
    JSON.stringify(['dashboard', 'umpanBalik']),
  anakPanel('reporting').join(', '),
);
cek(
  "navUtama TIDAK lagi memuat 'dashboard'",
  !navUtama.some((e) => e.id === 'dashboard'),
);
cek(
  "navUtama tetap memuat 'reporting' dan 'revenue'",
  navUtama.some((e) => e.id === 'reporting') &&
    navUtama.some((e) => e.id === 'revenue'),
);
cek(
  "navUtama tetap memuat modul lain yang tidak berubah (home, sales, offer)",
  ['home', 'sales', 'offer'].every((id) =>
    navUtama.some((e) => e.id === id),
  ),
);

// --- Asersi CLUSTER_SIDEBAR. ---
const blokCluster = sumber.slice(
  sumber.indexOf('const CLUSTER_SIDEBAR: ModuleId[][] = ['),
  sumber.indexOf('];', sumber.indexOf('const CLUSTER_SIDEBAR: ModuleId[][] = [')),
);
const barisCluster = blokCluster
  .split('\n')
  .map((baris) => baris.trim())
  .filter((baris) => baris.startsWith('['))
  .map((baris) => [...baris.matchAll(/'(\w+)'/g)].map((b) => b[1]));
cek(
  'cluster 4 = Revenue, Reports (tanpa Dashboard)',
  JSON.stringify(barisCluster[3]) === JSON.stringify(['revenue', 'reporting']),
  (barisCluster[3] ?? []).join(', '),
);
cek(
  "cluster lain tidak berubah (cluster 1 Home; cluster 3 Sales…Meeting)",
  JSON.stringify(barisCluster[0]) === JSON.stringify(['home']) &&
    JSON.stringify(barisCluster[2]) ===
      JSON.stringify([
        'sales',
        'marketing',
        'prospek',
        'offer',
        'order',
        'klien',
        'meeting',
      ]),
);

// --- Asersi tampilan awal + render + logika generik tak berubah. ---
cek(
  "tampilan awal login tetap 'dashboard'",
  sumber.includes("useState<ModuleId>('dashboard')"),
);
cek(
  'cabang render Dashboard tetap ada',
  sumber.includes("active === 'dashboard' && <Dashboard"),
);
cek(
  'judul panel tetap dari label induk (REPORTS)',
  sumber.includes('{panelInduk.label}'),
);
cek(
  "logika panelUntukTampilan generik tidak berubah",
  sumber.includes('if (m.induk) return m.induk;') &&
    sumber.includes('MODULES.some((c) => c.induk === m.id) ? m.id : null'),
);
cek(
  'navUtama tetap memfilter modul ber-induk',
  sumber.includes("MODULES.filter((m) => m.phase !== 'Admin' && !m.induk)"),
);
cek(
  'efek auto-open panel saat tampilan berubah tetap ada',
  sumber.includes('const induk = panelUntukTampilan(active);') &&
    sumber.includes('if (induk) setPanelTerbuka(induk);'),
);

if (gagal > 0) {
  console.log(`\n${gagal} asersi GAGAL`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');

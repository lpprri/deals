// Verifikasi Dashboard masuk ke panel REPORTS (PR #42, src/App.tsx).
// Asersi: entri 'dashboard' punya induk 'reporting'; 'umpanBalik'
// TIDAK lagi punya induk (PR #47, 16/11/2026 — Feedback Survey
// keluar dari panel REPORTS menjadi navigasi top-level 'Feedback' di
// cluster 4; PR #48 — Feedback di antara Reports dan Resources,
// Meeting pindah ke cluster 1 paling bawah); panel
// REPORTS kini hanya berisi Dashboard; simulasi aturan yang sama
// dengan kode (navUtama = tanpa induk & bukan Admin; panel =
// anak-anak induk; panelUntukTampilan = induk bila ada, dirinya bila
// punya anak, null bila tidak ada); cluster 4 CLUSTER_SIDEBAR =
// ['revenue', 'reporting', 'umpanBalik', 'service'] (tanpa dashboard;
// 'service' pindah ke cluster 4 di PR #45, 'umpanBalik' di PR #47,
// Feedback di antara Reports dan Resources di PR #48);
// tampilan awal login 'home' (PR #59, 16/11/2026 — bukan lagi 'dashboard';
// Home tidak punya sub-navigasi, jadi tidak ada panel yang terbuka
// otomatis saat login); cabang render Dashboard
// tetap ada; logika panel generik tidak berubah.
// CATATAN: asersi bentuk cluster di sini diperbarui di PR #45 —
// sebelumnya cluster 4 = ['revenue', 'reporting'] dan cluster 3
// masih memuat 'sales' (sudah dihapus PR #43); skrip ini sudah GAGAL
// 1 asersi di main b7ba624 sebelum PR #45 karena itu.
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
type Entri = { id: string; label: string; induk?: string; phase: string };
const entri: Entri[] = [];
const polaId = /id: '(\w+)'/g;
let m: RegExpExecArray | null;
while ((m = polaId.exec(blokModules)) !== null) {
  const mulai = m.index;
  const akhir = blokModules.indexOf("id: '", mulai + 1);
  const potong = blokModules.slice(mulai, akhir === -1 ? undefined : akhir);
  const label = potong.match(/label: '([^']+)'/)?.[1] ?? '';
  const induk = potong.match(/induk: '(\w+)'/)?.[1];
  const phase = potong.match(/phase: '(\w+)'/)?.[1] ?? '';
  entri.push({ id: m[1], label, induk, phase });
}
const cari = (id: string) => entri.find((e) => e.id === id);

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
  "entri 'umpanBalik' TIDAK lagi punya induk (PR #47 — keluar dari panel REPORTS)",
  cari('umpanBalik')?.induk === undefined,
  `induk=${cari('umpanBalik')?.induk ?? '—'}`,
);
cek(
  "label entri 'umpanBalik' = 'Feedback' (PR #47)",
  cari('umpanBalik')?.label === 'Feedback',
  `label=${cari('umpanBalik')?.label ?? '—'}`,
);
cek(
  "entri 'umpanBalik' ada tepat 1×",
  entri.filter((e) => e.id === 'umpanBalik').length === 1,
);

// --- Asersi perilaku panel (simulasi). ---
cek(
  "panelUntukTampilan('dashboard') = 'reporting'",
  panelUntukTampilan('dashboard') === 'reporting',
);
cek(
  "panelUntukTampilan('umpanBalik') = null (top-level, tanpa sub-item)",
  panelUntukTampilan('umpanBalik') === null,
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
  "panelUntukTampilan('home') = null (Home tanpa sub-navigasi — tidak ada panel auto-open saat login)",
  panelUntukTampilan('home') === null,
);
cek(
  "anak panel REPORTS hanya Dashboard (PR #47 — Feedback Survey keluar)",
  JSON.stringify(anakPanel('reporting')) === JSON.stringify(['dashboard']),
  anakPanel('reporting').join(', '),
);
cek(
  "navUtama TIDAK lagi memuat 'dashboard'",
  !navUtama.some((e) => e.id === 'dashboard'),
);
cek(
  "navUtama kini memuat 'umpanBalik' (PR #47 — navigasi top-level)",
  navUtama.some((e) => e.id === 'umpanBalik'),
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
  'cluster 4 = Revenue, Reports, Feedback, Resources (tanpa Dashboard)',
  JSON.stringify(barisCluster[3]) ===
    JSON.stringify(['revenue', 'reporting', 'umpanBalik', 'service']),
  (barisCluster[3] ?? []).join(', '),
);
cek(
  'cluster lain sesuai PR #48 (cluster 1 Home, Task, Chat, Meeting; cluster 3 Campaign, Clients, Prospect, Offer, Order)',
  JSON.stringify(barisCluster[0]) ===
    JSON.stringify(['home', 'todo', 'chat', 'meeting']) &&
    JSON.stringify(barisCluster[2]) ===
      JSON.stringify(['marketing', 'klien', 'prospek', 'offer', 'order']) &&
    barisCluster.length === 4,
);

// --- Asersi tampilan awal + render + logika generik tak berubah. ---
cek(
  "tampilan awal login 'home' (PR #59 — bukan lagi 'dashboard')",
  sumber.includes("useState<ModuleId>('home')"),
);
cek(
  "keluar (tanganiKeluar) mengembalikan tampilan ke 'home' (login berikutnya juga Home)",
  sumber.includes("setActive('home')"),
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
    sumber.includes('modules.some((c) => c.induk === m.id) ? m.id : null'),
);
cek(
  'navUtama tetap memfilter modul ber-induk',
  sumber.includes("modules.filter((m) => m.phase !== 'Admin' && !m.induk)"),
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

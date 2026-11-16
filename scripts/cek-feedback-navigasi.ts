// Verifikasi Feedback Survey menjadi navigasi top-level 'Feedback'
// (PR #47, diperbaiki PR #48, src/App.tsx).
// Asersi: entri 'umpanBalik' tanpa induk, label 'Feedback', ada di
// cluster 4 DI ANTARA Reports dan Resources (PR #48 — PR #47 salah
// menaruhnya paling bawah karena urutan tampil mengikuti urutan
// MODULES, bukan CLUSTER_SIDEBAR); Meeting pindah ke cluster 1
// paling bawah di bawah Chat (PR #48); panel REPORTS kini hanya
// berisi Dashboard; logika panel generik tetap benar (klik
// Reports -> panel hanya Dashboard; login default tetap Dashboard
// dengan panel REPORTS auto-open); cabang render + komponen survei
// tetap ada; data survei tidak berubah (0 survei tersimpan).
// PELAJARAN BUG PR #47: skrip ini juga mengasersi URUTAN RENDER
// (meniru logika App.tsx:2518–2523: navUtama = MODULES tanpa induk
// & bukan Admin, lalu difilter per cluster) — bukan hanya
// keanggotaan CLUSTER_SIDEBAR.
// Skrip ini membaca src/App.tsx sebagai teks (MODULES tidak diekspor),
// kecuali seed yang diimpor langsung. Keluar bukan-nol bila ada
// asersi gagal.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_NYATA } from '../src/lib/seedNyata';

// Dijalankan dari root repo (pola skrip cek lain) — berkas dibaca saat
// runtime, jadi path diambil dari cwd, bukan dari lokasi bundle.
const baca = (relatif: string) =>
  readFileSync(join(process.cwd(), relatif), 'utf8');
const app = baca('src/App.tsx');
const umpanBalik = baca('src/modules/UmpanBalik.tsx');

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};

// --- Ekstrak entri MODULES (id + label + induk) sesuai urutan berkas. ---
const blokModules = app.slice(
  app.indexOf('const MODULES: NavItem[] = ['),
  app.indexOf('];', app.indexOf('const MODULES: NavItem[] = [')),
);
type Entri = { id: string; label: string; induk?: string; phase?: string };
const entri: Entri[] = [];
const polaId = /id: '(\w+)'/g;
let m: RegExpExecArray | null;
while ((m = polaId.exec(blokModules)) !== null) {
  const mulai = m.index;
  const akhir = blokModules.indexOf("id: '", mulai + 1);
  const potong = blokModules.slice(mulai, akhir === -1 ? undefined : akhir);
  const label = potong.match(/label: '([^']+)'/)?.[1] ?? '';
  const induk = potong.match(/induk: '(\w+)'/)?.[1];
  const phase = potong.match(/phase: '(\w+)'/)?.[1];
  entri.push({ id: m[1], label, induk, phase });
}
const cari = (id: string) => entri.find((e) => e.id === id);

// --- Ekstrak CLUSTER_SIDEBAR. ---
const blokCluster = app.slice(
  app.indexOf('const CLUSTER_SIDEBAR: ModuleId[][] = ['),
  app.indexOf('];', app.indexOf('const CLUSTER_SIDEBAR: ModuleId[][] = [')),
);
const barisCluster = blokCluster
  .split('\n')
  .map((baris) => baris.trim())
  .filter((baris) => baris.startsWith('['))
  .map((baris) => [...baris.matchAll(/'(\w+)'/g)].map((b) => b[1]));

// --- Simulasi aturan yang sama dengan kode di App.tsx. ---
// navUtama = MODULES tanpa induk & bukan Admin (App.tsx:2518);
// navUtamaCluster = per cluster, navUtama difilter keanggotaan
// (App.tsx:2522–2523) — urutan tampil mengikuti urutan MODULES.
const navUtama = entri.filter((e) => !e.induk && e.phase !== 'Admin');
const navUtamaCluster: string[][] = barisCluster.map((ids) =>
  navUtama.filter((e) => ids.includes(e.id)).map((e) => e.id),
);
const anakPanel = (indukId: string) =>
  entri.filter((e) => e.induk === indukId).map((e) => e.id);
const panelUntukTampilan = (id: string): string | null => {
  const e = cari(id);
  if (!e) return null;
  if (e.induk) return e.induk;
  return entri.some((c) => c.induk === id) ? id : null;
};

// --- Asersi entri MODULES 'umpanBalik'. ---
cek(
  "entri 'umpanBalik' ada tepat 1×",
  entri.filter((e) => e.id === 'umpanBalik').length === 1,
);
cek(
  "label entri 'umpanBalik' = 'Feedback'",
  cari('umpanBalik')?.label === 'Feedback',
  `label=${cari('umpanBalik')?.label ?? '—'}`,
);
cek(
  "entri 'umpanBalik' TIDAK punya induk (bukan lagi anak panel REPORTS)",
  cari('umpanBalik')?.induk === undefined,
  `induk=${cari('umpanBalik')?.induk ?? '—'}`,
);
cek(
  "deskripsi modul tetap menyebut Feedback Survey (isi tidak berubah)",
  blokModules.includes(
    'the same Feedback Survey as Resources before 15/11/2026',
  ),
);

// --- Asersi CLUSTER_SIDEBAR. ---
cek(
  'cluster 4 = Revenue, Reports, Feedback, Resources (berurutan)',
  JSON.stringify(barisCluster[3]) ===
    JSON.stringify(['revenue', 'reporting', 'umpanBalik', 'service']),
  (barisCluster[3] ?? []).join(', '),
);
cek(
  "'umpanBalik' DI ANTARA Reports dan Resources (index 2 di cluster 4)",
  barisCluster[3]?.[2] === 'umpanBalik',
  (barisCluster[3] ?? []).join(', '),
);
cek(
  'cluster lain sesuai PR #48 (1 Home/Task/Chat/Meeting; 2 Contract/MoU/Commitment/Approvement; 3 Campaign/Clients/Prospect/Offer/Order; 4 cluster total)',
  JSON.stringify(barisCluster[0]) ===
    JSON.stringify(['home', 'todo', 'chat', 'meeting']) &&
    JSON.stringify(barisCluster[1]) ===
      JSON.stringify(['kontrak', 'mou', 'komitmen', 'approvement']) &&
    JSON.stringify(barisCluster[2]) ===
      JSON.stringify(['marketing', 'klien', 'prospek', 'offer', 'order']) &&
    barisCluster.length === 4,
  barisCluster.map((c) => c.join(',')).join(' | '),
);
cek(
  "navUtama memuat 'umpanBalik' (navigasi top-level)",
  navUtama.some((e) => e.id === 'umpanBalik'),
);
cek(
  "urutan MODULES: 'umpanBalik' tepat setelah 'reporting' (sebelum 'service')",
  entri.findIndex((e) => e.id === 'umpanBalik') ===
    entri.findIndex((e) => e.id === 'reporting') + 1 &&
    entri.findIndex((e) => e.id === 'umpanBalik') <
      entri.findIndex((e) => e.id === 'service'),
  entri.map((e) => e.id).join(', '),
);
cek(
  "urutan MODULES: 'meeting' tepat setelah 'chat' (akhir cluster 1)",
  entri.findIndex((e) => e.id === 'meeting') ===
    entri.findIndex((e) => e.id === 'chat') + 1,
  entri.map((e) => e.id).join(', '),
);

// --- Asersi URUTAN RENDER (pelajaran bug PR #47: tampil mengikuti
// urutan MODULES, bukan CLUSTER_SIDEBAR — asersi keanggotaan saja
// tidak cukup). ---
cek(
  'URUTAN RENDER cluster 1 = Home, Task, Chat, Meeting',
  JSON.stringify(navUtamaCluster[0]) ===
    JSON.stringify(['home', 'todo', 'chat', 'meeting']),
  (navUtamaCluster[0] ?? []).join(', '),
);
cek(
  'URUTAN RENDER cluster 3 = Campaign, Clients, Prospect, Offer, Order',
  JSON.stringify(navUtamaCluster[2]) ===
    JSON.stringify(['marketing', 'klien', 'prospek', 'offer', 'order']),
  (navUtamaCluster[2] ?? []).join(', '),
);
cek(
  'URUTAN RENDER cluster 4 = Revenue, Reports, Feedback, Resources',
  JSON.stringify(navUtamaCluster[3]) ===
    JSON.stringify(['revenue', 'reporting', 'umpanBalik', 'service']),
  (navUtamaCluster[3] ?? []).join(', '),
);

// --- Asersi panel REPORTS kini hanya Dashboard. ---
cek(
  "anak panel REPORTS hanya ['dashboard']",
  JSON.stringify(anakPanel('reporting')) === JSON.stringify(['dashboard']),
  anakPanel('reporting').join(', '),
);
cek(
  "panelUntukTampilan('dashboard') = 'reporting'",
  panelUntukTampilan('dashboard') === 'reporting',
);
cek(
  "panelUntukTampilan('umpanBalik') = null (top-level, tanpa sub-item)",
  panelUntukTampilan('umpanBalik') === null,
);
cek(
  "panelUntukTampilan('reporting') = 'reporting' (induk masih punya anak)",
  panelUntukTampilan('reporting') === 'reporting',
);
cek(
  "tampilan awal login 'home' (PR #59 — bukan lagi 'dashboard'; efek auto-open panel tetap ada, tapi Home tanpa panel)",
  app.includes("useState<ModuleId>('home')") &&
    app.includes('const induk = panelUntukTampilan(active);') &&
    app.includes('if (induk) setPanelTerbuka(induk);'),
);

// --- Asersi judul halaman + render + data survei tidak berubah. ---
cek(
  "judul halaman memakai label modul (ikut jadi 'Feedback')",
  app.includes('{current.label}'),
);
cek(
  'cabang render Feedback tetap ada',
  app.includes("active === 'umpanBalik' && <MenuUmpanBalik"),
);
cek(
  'MenuUmpanBalik tetap merender TabUmpanBalik dari Service',
  umpanBalik.includes('TabUmpanBalik'),
);
cek(
  'data survei tidak berubah: 0 survei tersimpan (honest empty state)',
  DATA_NYATA.umpanBalik.length === 0,
  `${DATA_NYATA.umpanBalik.length} survei`,
);

if (gagal > 0) {
  console.log(`\n${gagal} asersi GAGAL`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');

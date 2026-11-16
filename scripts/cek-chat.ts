// Verifikasi Chat antar operator 1-to-1 + penataan ulang sidebar
// (PR #45, src/App.tsx + src/modules/Chat.tsx + src/lib/pesan.ts).
// Asersi: cluster 1 = Home, Task, Chat, Meeting (Meeting pindah
// dari cluster 3 ke bawah cluster 1, PR #48, 16/11/2026); cluster 2
// tidak berubah; cluster 3 = Campaign, Clients, Prospect, Offer,
// Order (tanpa Meeting); cluster 4 = Revenue, Reports, Feedback,
// Resources ('umpanBalik' di antara Reports dan Resources, PR #48 —
// PR #47 salah menaruhnya paling bawah karena urutan tampil
// mengikuti urutan MODULES, bukan CLUSTER_SIDEBAR); TIDAK ADA
// cluster 5 (CLUSTER_SIDEBAR hanya berisi
// 4 cluster); modul `chat` terdaftar di MODULES tepat setelah `todo`
// + cabang render ada; `pesan` kosong di seed (tanpa pesan contoh); helper `idPercakapan`
// deterministik (urutan argumen tidak berpengaruh; pasangan berbeda ->
// id berbeda); blok `match /pesan/` ada di firestore.rules.
// Skrip ini membaca berkas sebagai teks, kecuali helper pesan dan seed
// yang diimpor langsung. Keluar bukan-nol bila ada asersi gagal.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_NYATA } from '../src/lib/seedNyata';
import { DATA_CONTOH } from '../src/lib/sampleData';
import {
  idPercakapan,
  kunciAlamatOperator,
  lawanBicara,
} from '../src/lib/pesan';

// Dijalankan dari root repo (pola skrip cek lain) — berkas dibaca saat
// runtime, jadi path diambil dari cwd, bukan dari lokasi bundle.
const baca = (relatif: string) =>
  readFileSync(join(process.cwd(), relatif), 'utf8');
const app = baca('src/App.tsx');
const rules = baca('firestore.rules');
const chat = baca('src/modules/Chat.tsx');
const types = baca('src/lib/types.ts');
const store = baca('src/lib/store.ts');
const firestoreStore = baca('src/lib/firestoreStore.ts');

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

// --- Asersi CLUSTER_SIDEBAR (PR #45: Task + Chat ke cluster 1,
// Resources ke cluster 4, cluster 5 hilang; PR #47: 'umpanBalik'
// ke cluster 4; PR #48: Feedback di antara Reports dan Resources,
// Meeting dari cluster 3 ke cluster 1 paling bawah). ---
cek(
  'cluster 1 = Home, Task, Chat, Meeting (berurutan)',
  JSON.stringify(barisCluster[0]) ===
    JSON.stringify(['home', 'todo', 'chat', 'meeting']),
  (barisCluster[0] ?? []).join(', '),
);
cek(
  'cluster 2 tidak berubah (Contract, MoU, Commitment, Approvement)',
  JSON.stringify(barisCluster[1]) ===
    JSON.stringify(['kontrak', 'mou', 'komitmen', 'approvement']),
  (barisCluster[1] ?? []).join(', '),
);
cek(
  'cluster 3 = Campaign, Clients, Prospect, Offer, Order (tanpa Meeting)',
  JSON.stringify(barisCluster[2]) ===
    JSON.stringify(['marketing', 'klien', 'prospek', 'offer', 'order']),
  (barisCluster[2] ?? []).join(', '),
);
cek(
  'cluster 4 = Revenue, Reports, Feedback, Resources (berurutan)',
  JSON.stringify(barisCluster[3]) ===
    JSON.stringify(['revenue', 'reporting', 'umpanBalik', 'service']),
  (barisCluster[3] ?? []).join(', '),
);
cek(
  'TIDAK ADA cluster 5 (CLUSTER_SIDEBAR hanya berisi 4 cluster)',
  barisCluster.length === 4,
  `${barisCluster.length} cluster`,
);
cek(
  "Task TIDAK lagi di cluster 5 (dan 'todo' hanya di cluster 1)",
  barisCluster.filter((c) => c.includes('todo')).length === 1 &&
    barisCluster[0].includes('todo'),
);
cek(
  "Resources TIDAK lagi di cluster 5 (dan 'service' hanya di cluster 4)",
  barisCluster.filter((c) => c.includes('service')).length === 1 &&
    barisCluster[3].includes('service'),
);

// --- Asersi MODULES + render branch. ---
const blokModules = app.slice(
  app.indexOf('const MODULES: NavItem[] = ['),
  app.indexOf('];', app.indexOf('const MODULES: NavItem[] = [')),
);
const urutanModules = [...blokModules.matchAll(/id: '(\w+)',/g)].map(
  (b) => b[1],
);
cek(
  "entri MODULES 'chat' ada tepat 1×",
  (app.match(/id: 'chat',/g) ?? []).length === 1,
);
cek(
  "entri 'chat' tepat setelah 'todo' di MODULES",
  urutanModules.indexOf('chat') === urutanModules.indexOf('todo') + 1,
  urutanModules.join(', '),
);
cek("label modul chat = 'Chat'", app.includes("label: 'Chat',"));
cek(
  "modul chat phase 'C'",
  blokModules.includes("id: 'chat',") &&
    /id: 'chat',[\s\S]{0,200}?phase: 'C'/.test(blokModules),
);
cek(
  'modul chat memakai ikon MessageSquare',
  /id: 'chat',[\s\S]{0,200}?icon: MessageSquare/.test(blokModules),
);
cek(
  'cabang render Chat ada',
  app.includes("active === 'chat' && <Chat"),
);
cek(
  "impor modul Chat ada di App.tsx",
  app.includes("import Chat from './modules/Chat';"),
);

// --- Asersi tipe + data (pesan kosong, tanpa pesan contoh). ---
cek(
  'AppData punya kunci pesan: Pesan[]',
  types.includes('pesan: Pesan[];'),
);
cek(
  'KOLEKSI memetakan pesan ke koleksi Firestore pesan',
  firestoreStore.includes("pesan: 'pesan',"),
);
cek(
  'StoreActions punya kirimPesan + tandaiPesanDibaca',
  store.includes('kirimPesan: (input: PesanInput) => string | null;') &&
    store.includes('tandaiPesanDibaca: (idPercakapan: string) => void;'),
);
cek(
  'pesan kosong di DATA_NYATA (seed nyata, tanpa pesan contoh)',
  DATA_NYATA.pesan.length === 0,
  `${DATA_NYATA.pesan.length} pesan`,
);
cek(
  'pesan kosong di DATA_CONTOH (seed contoh, tanpa pesan contoh)',
  DATA_CONTOH.pesan.length === 0,
  `${DATA_CONTOH.pesan.length} pesan`,
);

// --- Asersi helper idPercakapan (deterministik). ---
cek(
  'idPercakapan: urutan argumen tidak berpengaruh',
  idPercakapan('a@rri.go.id', 'b@rri.go.id') ===
    idPercakapan('b@rri.go.id', 'a@rri.go.id'),
  idPercakapan('a@rri.go.id', 'b@rri.go.id'),
);
cek(
  'idPercakapan: pasangan berbeda -> id berbeda',
  idPercakapan('a@rri.go.id', 'b@rri.go.id') !==
    idPercakapan('a@rri.go.id', 'c@rri.go.id'),
);
cek(
  'idPercakapan: pasangan sama -> id sama (idempotent)',
  idPercakapan('a@rri.go.id', 'b@rri.go.id') ===
    idPercakapan('a@rri.go.id', 'b@rri.go.id'),
);
cek(
  'idPercakapan: normalisasi huruf besar/kecil + spasi',
  idPercakapan('A@RRI.GO.ID ', ' b@rri.go.id') ===
    idPercakapan('a@rri.go.id', 'b@rri.go.id'),
);
cek(
  'lawanBicara: mengembalikan alamat lawan dari id percakapan',
  lawanBicara(idPercakapan('a@rri.go.id', 'b@rri.go.id'), 'a@rri.go.id') ===
    'b@rri.go.id' &&
    lawanBicara(
      idPercakapan('a@rri.go.id', 'b@rri.go.id'),
      'b@rri.go.id',
    ) === 'a@rri.go.id',
);
cek(
  'kunciAlamatOperator: email asli dipakai apa adanya (huruf kecil)',
  kunciAlamatOperator('Meliyana', 'Meliyana@RRI.go.id') ===
    'meliyana@rri.go.id',
);
cek(
  'kunciAlamatOperator: tanpa email -> kunci internal turunan nama',
  kunciAlamatOperator('Nadya Pratita') === 'nadya-pratita@operator.local',
);

// --- Asersi modul Chat memakai roster + empty state jujur. ---
cek(
  'Chat.tsx memakai OPERATOR_PALEMBANG sebagai sumber kontak',
  chat.includes('OPERATOR_PALEMBANG'),
);
cek(
  "Chat.tsx punya empty state 'No conversations yet'",
  chat.includes('No conversations yet'),
);
cek(
  "Chat.tsx punya empty state 'No messages yet",
  chat.includes('No messages yet'),
);

// --- Asersi firestore.rules. ---
cek(
  'firestore.rules punya blok match /pesan/',
  rules.includes('match /pesan/{id} {'),
);
cek(
  'firestore.rules: pesan mengikuti pola tiket (Operator + satker sama)',
  rules.includes('match /pesan/{id} {') &&
    /match \/pesan\/\{id\} \{[\s\S]{0,600}?adalahOperator\(\) && satkerMilikPemanggil\(resource\.data\)/.test(
      rules,
    ),
);

if (gagal > 0) {
  console.log(`\n${gagal} asersi GAGAL`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');

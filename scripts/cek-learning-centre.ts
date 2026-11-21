// Verifikasi Learning Centre Fase 1 (hub + E-Learning) — spec
// learning-centre-spec.md, disetujui pengguna 2026-11-21 15:35 WIB
// (defaults: footer "Improve your Skill" (dulu "Learning Centre", diubah 2026-11-21), konten kursus English, video
// player dummy, TANPA langganan dan TANPA My Learning di Fase 1).
//
// Asersi:
// - Dummy: 9 Learning Path bidang RRI (3 topik per path, 3 materi per
//   topik = 81 materi), tipe lengkap, ditandai DUMMY.
// - 0 kategori platform belajar lain (18 kategori) di file baru; 0
//   "Review CV" / "Info Loker" / "Affiliate" / "Corporate Service".
// - Harga: hanya tarif KB PP 68/2020 atau "Price on request" (hub: banner
//   sertifikasi Rp1,500,000; E-Learning + dummy: tanpa 'Rp' sama sekali).
// - Header pola Book a Venue di kedua modul baru (logo h-10, judul
//   text-2xl font-black, aria-label "Back to Landing Page", tanpa teks
//   back yang terlihat).
// - Thumbnail: 9 foto generate (WebP data URI, satu per id path) dipakai
//   di listing + detail path + poster player + Recommended (E-Learning)
//   dan di Popular Learning Paths + Upcoming Bootcamps (hub); tidak ada
//   lagi header kartu gradien-only + GraduationCap di kartu path.
// - Rute: App.tsx mengenal 'learning-centre' | 'e-learning', merender
//   LearningCentre + ELearning, footer onTraining membuka hub.
// - E-Learning: search box, chip kategori, Pre-Test/Post Test,
//   "Get Certificate", "Progress & Certificate", "See all",
//   "Recommended Courses".

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Dijalankan dari root repo (pola skrip cek lain).
const baca = (relatif: string) =>
  readFileSync(join(process.cwd(), relatif), 'utf8');
const app = baca('src/App.tsx');
const marklo = baca('src/modules/landing/Marklo.tsx');
const dummy = baca('src/lib/learningCentreDummy.ts');
const hub = baca('src/modules/LearningCentre.tsx');
const elearning = baca('src/modules/ELearning.tsx');
const foto = baca('src/lib/fotoLearningCentre.ts');
const baru = dummy + hub + elearning;

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};
const hitung = (teks: string, jarum: string) =>
  teks.split(jarum).length - 1;

// --- 1. Dummy: 9 Learning Path bidang RRI. ---
const ID_PATH = [
  'penyiaran-radio',
  'jurnalistik-radio',
  'announcing',
  'produksi-program',
  'penulisan-naskah',
  'reportase',
  'etika-hukum',
  'manajemen-media',
  'teknologi-penyiaran',
];
cek(
  'Dummy: 9 Learning Path bidang RRI ada',
  ID_PATH.every((id) => dummy.includes(`id: '${id}'`)),
);
cek(
  'Dummy: tipe LearningPathDummy + TopikDummy + MateriDummy ada',
  dummy.includes('export interface MateriDummy') &&
    dummy.includes('export interface TopikDummy') &&
    dummy.includes('export interface LearningPathDummy') &&
    dummy.includes('export const LEARNING_PATH_DUMMY'),
);
cek(
  'Dummy: 9 path (topik: [) + 27 topik (materi: [) + 81 materi (durasi)',
  hitung(dummy, 'topik: [') === 9 &&
    hitung(dummy, 'materi: [') === 27 &&
    hitung(dummy, "durasi: '") === 81,
);
cek(
  'Dummy: 2 materi contoh selesai (progres + sertifikat)',
  hitung(dummy, 'selesai: true,') === 2,
);
cek(
  'Dummy: ditandai DUMMY + mentor dummy "RRI Trainer"',
  dummy.includes('DUMMY — ganti data asli') &&
    dummy.includes("mentor: 'RRI Trainer'"),
);

// --- 2. Bukan kategori platform belajar lain. ---
const KATEGORI_LAIN = [
  'Digital Marketing',
  'Data Science',
  'Microsoft Excel',
  'Accounting Finance and Tax',
  'Artificial Intelligence',
  'English Test',
  'Human Resource Development',
  'Graphic Design',
  'UI-UX',
  'Product and Project Management',
  'Website & Apps Development',
  'Software Quality Assurance',
  'Sales Business Development and Customer Service',
  'Bisnis Online Shop',
  'Career & Self Development',
  'Foreign Languages',
  'Internet of Things',
  'Web 3.0',
];
const kategoriDitemukan = KATEGORI_LAIN.filter((k) => baru.includes(k));
cek(
  'Bukan kategori lain: 0 dari 18 kategori di file baru',
  kategoriDitemukan.length === 0,
  kategoriDitemukan.join(', '),
);
const FITUR_LAIN = [
  'Review CV',
  'Info Loker',
  'Affiliate',
  'Corporate Service',
];
const fiturDitemukan = FITUR_LAIN.filter((f) => baru.includes(f));
cek(
  'Tidak dibangun: 0 "Review CV" / "Info Loker" / "Affiliate" / "Corporate Service" di file baru',
  fiturDitemukan.length === 0,
  fiturDitemukan.join(', '),
);

// --- 3. Harga: hanya tarif KB atau "Price on request". ---
const hargaDiHub = hub.match(/Rp[0-9][0-9.,]*/g) ?? [];
cek(
  'Harga hub: hanya tarif KB (Rp1,500,000 banner + Rp di komentar tarif)',
  hargaDiHub.every((h) =>
    ['Rp1,500,000', 'Rp2.000.000', 'Rp1.500.000'].includes(h),
  ),
  hargaDiHub.join(', '),
);
cek(
  'Harga hub: banner sertifikasi Rp1,500,000 / person / 3 days',
  hub.includes('Rp1,500,000 / person / 3 days'),
);
cek(
  'Harga: E-Learning + dummy tanpa Rp sama sekali (tanpa langganan di Fase 1)',
  !elearning.includes('Rp') && !dummy.includes('Rp'),
);

// --- 4. Header pola Book a Venue di kedua modul baru. ---
for (const [nama, isi] of [
  ['LearningCentre', hub],
  ['ELearning', elearning],
] as const) {
  cek(
    `Header ${nama}: logo h-10 + judul text-2xl font-black + aria-label back`,
    isi.includes('className="h-10 w-auto"') &&
      isi.includes('text-2xl font-black tracking-tight text-[#0d2569]') &&
      isi.includes('aria-label="Back to Landing Page"'),
  );
  cek(
    `Header ${nama}: tanpa teks "Back to Landing Page" yang terlihat`,
    !isi.includes('>Back to Landing Page<'),
  );
}
cek(
  'Scroll: kedua modul baru gulir ke atas saat mount (ELearning juga tiap ganti tampilan)',
  hub.includes('window.scrollTo({ top: 0 })') &&
    hitung(elearning, 'window.scrollTo({ top: 0 })') >= 1,
);

// --- 5. Rute + footer. ---
cek(
  "App: union halamanPublik mengenal 'learning-centre' | 'e-learning'",
  app.includes("'learning-centre' | 'e-learning'"),
);
cek(
  'App: render LearningCentre + ELearning',
  app.includes('<LearningCentre') && app.includes('<ELearning'),
);
cek(
  "App: rute 'learning-centre' + 'e-learning' + footer onTraining membuka hub",
  app.includes("halamanPublik === 'learning-centre'") &&
    app.includes("halamanPublik === 'e-learning'") &&
    app.includes("onTraining={() => setHalamanPublik('learning-centre')}") &&
    app.includes("onELearning={() => setHalamanPublik('e-learning')}"),
);
cek(
  "Marklo: footer 'Improve your Skill' memakai onTraining",
  marklo.includes("{ label: 'Improve your Skill', onClick: onTraining }"),
);

// --- 6. Hub: tiga fitur + path populer + bootcamp + banner sertifikasi. ---
cek(
  'Hub: 3 kartu fitur (E-Learning / Bootcamp & Program / Certification)',
  hub.includes('Browse E-Learning') &&
    hub.includes('View Bootcamps') &&
    hub.includes('View Certification'),
);
cek(
  'Hub: Popular Learning Paths + Upcoming Bootcamps',
  hub.includes('Popular Learning Paths') &&
    hub.includes('Upcoming Bootcamps') &&
    hub.includes('Topics •') &&
    hub.includes('Materials'),
);
cek(
  'Hub: banner Radio Journalist Competency Certification, lisensi RRI',
  hub.includes('Radio Journalist Competency Certification') &&
    hub.includes('Licensed by RRI'),
);

// --- 7. E-Learning: listing + detail path + detail materi. ---
cek(
  'E-Learning: search box + chip kategori (All + 9 bidang)',
  elearning.includes('Search learning paths...') &&
    elearning.includes("const BIDANG: string[] = [") &&
    elearning.includes("'All'"),
);
cek(
  'E-Learning: state internal daftar | path | materi',
  elearning.includes("type Tampilan = 'daftar' | 'path' | 'materi'"),
);
cek(
  'E-Learning: detail path — info cards + accordion topik + "See all"',
  elearning.includes('Materials') &&
    elearning.includes('Practice') &&
    elearning.includes('Benefits') &&
    elearning.includes('Requirements') &&
    elearning.includes('See all'),
);
cek(
  'E-Learning: detail materi — player dummy + Pre-Test/Post Test + "In This Material"',
  elearning.includes('Sample player') &&
    elearning.includes('Pre-Test') &&
    elearning.includes('Post Test') &&
    elearning.includes('In This Material'),
);
cek(
  'E-Learning: Progress & Certificate + Get Certificate + Rating + Recommended Courses',
  elearning.includes('Progress & Certificate') &&
    elearning.includes('Get Certificate') &&
    elearning.includes('Certificate 100%') &&
    elearning.includes('Rating') &&
    elearning.includes('Recommended Courses'),
);
cek(
  'E-Learning: tombol Join Community + Subscribe dummy (tanpa aksi, Fase 4)',
  elearning.includes('Join Community') && elearning.includes('Subscribe'),
);

// --- 8. Thumbnail foto per Learning Path (perintah pengguna 2026-11-21 17:34 WIB). ---
cek(
  'Foto: 9 entri data URI WebP, satu per id path',
  ID_PATH.every((id) =>
    foto.includes(`'${id}': 'data:image/webp;base64,`),
  ) && hitung(foto, 'data:image/webp;base64,') === 9,
);
cek(
  'Foto: export FOTO_LEARNING_CENTRE + sumber generate + ditandai DUMMY',
  foto.includes('export const FOTO_LEARNING_CENTRE: Record<string, string>') &&
    foto.includes('DI-GENERATE') &&
    foto.includes('DUMMY sampai pengguna memberikan foto aslinya'),
);
cek(
  'E-Learning: 4 foto — listing + cover path + poster player + Recommended (alt = judul path)',
  hitung(elearning, 'FOTO_LEARNING_CENTRE[') === 4 &&
    elearning.includes('<img') &&
    elearning.includes('FOTO_LEARNING_CENTRE[path.id]') &&
    elearning.includes('FOTO_LEARNING_CENTRE[pathTerpilih.id]') &&
    elearning.includes('alt={path.judul}') &&
    elearning.includes('alt={pathTerpilih.judul}') &&
    elearning.includes(
      "import { FOTO_LEARNING_CENTRE } from '../lib/fotoLearningCentre';",
    ),
);
cek(
  'E-Learning: player memakai foto path sebagai poster + overlay gelap + tombol play + caption Sample player tetap',
  elearning.includes('bg-black/25') &&
    elearning.includes('Sample player — the full video will be available here.'),
);
cek(
  'Hub: 2 foto — Popular Learning Paths (per path) + Upcoming Bootcamps (foto path terdekat)',
  hitung(hub, 'FOTO_LEARNING_CENTRE[') === 2 &&
    hub.includes('<img') &&
    hub.includes('FOTO_LEARNING_CENTRE[path.id]') &&
    hub.includes('FOTO_BOOTCAMP[course.id]') &&
    hub.includes("'pelatihan-jurnalistik': 'jurnalistik-radio'") &&
    hub.includes("'workshop-penulisan': 'penulisan-naskah'") &&
    hub.includes(
      "import { FOTO_LEARNING_CENTRE } from '../lib/fotoLearningCentre';",
    ),
);
cek(
  'Kartu path: tidak ada lagi header gradien-only + GraduationCap di ELearning + hub',
  !elearning.includes('GraduationCap') &&
    !hub.includes('GraduationCap') &&
    !elearning.includes('flex h-36 items-center justify-center bg-gradient-to-br') &&
    !elearning.includes('flex h-48 items-center justify-center bg-gradient-to-br') &&
    !elearning.includes('flex h-24 items-center justify-center bg-gradient-to-br') &&
    !hub.includes('flex h-36 items-center justify-center bg-gradient-to-br'),
);

// --- 9. Latar: putih seperti Book a Venue (perintah user 2026-11-21 17:55 WIB). ---
cek(
  'Latar halaman: Learning Centre (hub) + E-Learning latar putih bg-white seperti Book a Venue — bukan lagi abu #f5f2f2',
  hub.includes('relative min-h-screen overflow-hidden bg-white px-4 py-16') &&
    elearning.includes('relative min-h-screen overflow-hidden bg-white px-4 py-16') &&
    !hub.includes("bg-[#f5f2f2]") &&
    !elearning.includes('min-h-screen overflow-hidden bg-[#f5f2f2]'),
);

// --- Ringkasan. ---
if (gagal > 0) {
  console.error(`\n${gagal} asersi GAGAL.`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');

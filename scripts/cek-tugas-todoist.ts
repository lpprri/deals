// Verifikasi duplikasi Todoist untuk panel Tugas
// (2026-11-24; src/modules/Todo.tsx + src/lib/tugasTodoist.ts +
//  src/lib/types.ts + src/lib/store.ts + src/App.tsx +
//  src/lib/firestoreStore.ts).
// Asersi: tampilan (Kotak Masuk, Hari Ini, Mendatang, Filter & Label,
// Laporan, Disposisi), Quick Add, kartu tugas, dialog detail, View Options,
// Mendatang + jadwalkan ulang massal, filter tersimpan & label disposisi,
// Laporan + ekspor CSV, pencarian + shortcut, Bahasa Indonesia di UI panel,
// Disposisi (Alur F) tetap ada, TIDAK ADA koleksi/aturan Firestore baru,
// helper murni benar di data sintetis + seed nyata, dan marker ada di bundle
// hasil build (dist/). Keluar bukan-nol bila ada asersi gagal.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_NYATA } from '../src/lib/seedNyata';
import { hariIniIso } from '../src/lib/format';
import {
  LABEL_DISPOSISI,
  akhirPekanIni,
  cocokFilterTersimpan,
  cocokKataKunci,
  kelompokkanTugas,
  labelTanggal,
  progresSubTugas,
  proyekTugas,
  semuaLabel,
  seninDepan,
  statusTanggal,
  tambahHari,
  terlambat,
} from '../src/lib/tugasTodoist';
import type { Task } from '../src/lib/types';

// Dijalankan dari root repo (pola skrip cek lain).
const baca = (relatif: string) =>
  readFileSync(join(process.cwd(), relatif), 'utf8');
const todo = baca('src/modules/Todo.tsx');
const helper = baca('src/lib/tugasTodoist.ts');
const types = baca('src/lib/types.ts');
const store = baca('src/lib/store.ts');
const app = baca('src/App.tsx');
const firestoreStore = baca('src/lib/firestoreStore.ts');
const rules = baca('firestore.rules');

let gagal = 0;
let lolos = 0;
const cek = (nama: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (ok) lolos += 1;
  else gagal += 1;
};

// --- 1. Tampilan dalam panel (Bahasa Indonesia). ---
for (const label of [
  'Kotak Masuk',
  'Hari Ini',
  'Mendatang',
  'Filter & Label',
  'Laporan',
  'Disposisi',
]) {
  cek(`Tab tampilan "${label}" ada`, todo.includes(label));
}
cek(
  'Subjudul panel dipertahankan',
  todo.includes('Tugas perorangan dan disposisi.'),
);

// --- 2. Quick Add + pilihan tanggal cepat. ---
for (const s of [
  'Nama tugas',
  'Hari ini',
  'Besok',
  'Akhir pekan ini',
  'Minggu depan',
  'Tanpa tanggal',
  '+ Opsi lain',
]) {
  cek(`Quick Add/pemilih tanggal memuat "${s}"`, todo.includes(s));
}
cek('Shortcut Q + Ctrl+K didaftarkan', todo.includes("'q'") && todo.includes("toLowerCase() === 'k'"));

// --- 3. Kartu tugas ala Todoist. ---
for (const s of ['Tandai selesai', 'Sub-tugas', 'BenderaPrioritas', 'Tandai belum selesai']) {
  cek(`Kartu tugas memuat "${s}"`, todo.includes(s));
}
cek(
  'Tanggal terlambat merah, hari ini hijau',
  todo.includes('text-red-600') && todo.includes('text-green-700'),
);

// --- 4. View Options: Daftar/Board, Grouping, Sorting, Filter. ---
for (const s of [
  'Opsi tampilan',
  'Kelompokkan berdasarkan',
  'Cerdas',
  'Atur ulang semua',
]) {
  cek(`View Options memuat "${s}"`, todo.includes(s));
}

// --- 5. Mendatang + jadwalkan ulang massal. ---
for (const s of ['Jadwalkan ulang semua', 'Terlambat']) {
  cek(`Mendatang memuat "${s}"`, todo.includes(s));
}

// --- 6. Filter tersimpan, label disposisi, tambah label. ---
for (const s of ['Filter saya', 'Prioritas 1', '+ Tambah label']) {
  cek(`Filter & Label memuat "${s}"`, todo.includes(s));
}
cek(
  'Filter tersimpan "Ditugaskan ke saya" ada (di tugasTodoist.ts, dipakai FilterLabel)',
  helper.includes('Ditugaskan ke saya') && todo.includes('FILTER_TERSIMPAN'),
);
for (const l of LABEL_DISPOSISI) {
  cek(`Label disposisi "${l}" ada`, helper.includes(l));
}

// --- 7. Dialog detail 2 kolom + More actions. ---
for (const s of [
  'Deskripsi',
  'Komentar',
  'Pengingat',
  'Duplikat',
  'Salin tautan tugas',
  'Ya, hapus',
  'Tutup disposisi',
]) {
  cek(`Dialog detail memuat "${s}"`, todo.includes(s));
}

// --- 8. Laporan + ekspor CSV. ---
cek('Laporan memuat "Ekspor CSV"', todo.includes('Ekspor CSV'));
cek('Laporan memuat hitungan bulan ini', todo.includes('selesai bulan ini'));

// --- 9. Bahasa Indonesia di UI panel (tidak ada label Inggris Todoist). ---
for (const s of ['Inbox', 'Add task', 'No Date', 'Overdue', 'Upcoming', 'Completed tasks']) {
  cek(`UI panel tidak memakai "${s}"`, !todo.includes(s));
}

// --- 10. Disposisi (Alur F) dipertahankan. ---
for (const s of [
  'DaftarDisposisi',
  'FormDisposisi',
  'Riwayat alur disposisi',
  '+ Buat disposisi',
  'tutupDisposisi',
]) {
  cek(`Disposisi dipertahankan ("${s}")`, todo.includes(s));
}

// --- 11. Model + store + App. ---
for (const s of [
  'deskripsi?: string',
  'proyek?: string',
  'prioritas?: PrioritasTugas',
  'label?: string[]',
  'subTugas?: SubTugas[]',
  'komentar?: KomentarTugas[]',
  'selesaiPada?: string',
]) {
  cek(`types.ts Task memuat "${s}"`, types.includes(s));
}
for (const s of ['ubahTask:', 'duplikatTask:', 'hapusTask:']) {
  cek(`StoreActions memuat "${s}"`, store.includes(s));
  cek(`App.tsx mengimplementasikan "${s}"`, app.includes(s));
}
cek(
  'tambahTask meneruskan bidang Todoist',
  app.includes('proyek: input.proyek'),
);
cek(
  'ubahStatusTask mencatat selesaiPada',
  app.includes('selesaiPada'),
);
cek(
  'Checkbox boleh menyelesaikan langsung (Belum -> Selesai)',
  app.includes("'Belum Dikerjakan': ['Berjalan', 'Selesai']"),
);
cek('firestoreStore memuat hapusDokumen', firestoreStore.includes('hapusDokumen'));

// --- 12. TIDAK ADA koleksi/aturan Firestore baru. ---
cek(
  'Tidak ada koleksi baru di firestoreStore (tetap task)',
  firestoreStore.includes("task: 'task'") &&
    !firestoreStore.includes('tugasTodoist') &&
    !firestoreStore.includes('labelTugas'),
);
cek(
  'firestore.rules tidak menambah blok tugas baru',
  !rules.includes('tugasTodoist') && !rules.includes('labelTugas'),
);

// --- 13. Helper murni di data sintetis (tanggal relatif hari ini). ---
const hariIni = hariIniIso();
const contoh = DATA_NYATA.task[0];
cek('Seed nyata punya 5 tugas', DATA_NYATA.task.length === 5, `${DATA_NYATA.task.length} tugas`);
cek(
  'Seed nyata: semua tugas punya id/judul/tenggat/status',
  DATA_NYATA.task.every((t) => t.id && t.judul && t.tenggat && t.status),
);
const buat = (patch: Partial<Task>): Task => ({ ...contoh, ...patch });
cek('labelTanggal hari ini', labelTanggal(hariIni) === 'Hari ini');
cek('labelTanggal besok', labelTanggal(tambahHari(hariIni, 1)) === 'Besok');
cek('labelTanggal tanpa tanggal', labelTanggal('') === 'Tanpa tanggal');
cek(
  'statusTanggal terlambat',
  statusTanggal(tambahHari(hariIni, -2), hariIni) === 'terlambat',
);
cek(
  'terlambat() benar untuk tugas lama belum selesai',
  terlambat(buat({ tenggat: tambahHari(hariIni, -1), status: 'Berjalan' }), hariIni),
);
cek(
  'terlambat() salah untuk tugas selesai',
  !terlambat(buat({ tenggat: tambahHari(hariIni, -1), status: 'Selesai' }), hariIni),
);
cek(
  'akhirPekanIni jatuh hari Sabtu',
  new Date(`${akhirPekanIni(hariIni)}T00:00:00`).getDay() === 6,
  akhirPekanIni(hariIni),
);
cek(
  'seninDepan jatuh hari Senin',
  new Date(`${seninDepan(hariIni)}T00:00:00`).getDay() === 1,
  seninDepan(hariIni),
);
cek(
  'tambahHari lintas bulan',
  tambahHari('2026-01-31', 1) === '2026-02-01',
);
cek(
  'proyekTugas default Kotak Masuk',
  proyekTugas(buat({ proyek: undefined })) === 'Kotak Masuk',
);
cek(
  'progresSubTugas menghitung benar',
  (() => {
    const p = progresSubTugas(
      buat({
        subTugas: [
          { id: 'S1', judul: 'a', selesai: true },
          { id: 'S2', judul: 'b', selesai: false },
        ],
      }),
    );
    return p.selesai === 1 && p.total === 2;
  })(),
);
cek(
  'cocokKataKunci menemukan judul + label',
  cocokKataKunci(
    buat({ judul: 'Laporan PNBP', label: ['Menunggu Disposisi'] }),
    'disposisi',
  ),
);
cek(
  'Filter tersimpan Prioritas 1',
  cocokFilterTersimpan(buat({ prioritas: 1 }), 'prioritas-1', 'Siapa pun'),
);
cek(
  'Filter tersimpan Ditugaskan ke saya',
  cocokFilterTersimpan(
    buat({ pemilik: 'Andi' }),
    'ditugaskan-ke-saya',
    'Andi',
  ) &&
    !cocokFilterTersimpan(
      buat({ pemilik: 'Budi' }),
      'ditugaskan-ke-saya',
      'Andi',
    ),
);
cek(
  'semuaLabel memuat label disposisi',
  LABEL_DISPOSISI.every((l) => semuaLabel(DATA_NYATA.task).includes(l)),
);
cek(
  'kelompokkanTugas: grup proyek + urutan tanggal',
  (() => {
    const daftar = [
      buat({ id: 'T1', tenggat: tambahHari(hariIni, 2), proyek: 'PNBP' }),
      buat({ id: 'T2', tenggat: hariIni, proyek: 'KBRN' }),
      buat({ id: 'T3', tenggat: tambahHari(hariIni, 1), proyek: 'PNBP' }),
    ];
    const grup = kelompokkanTugas(daftar, 'proyek', 'tanggal', hariIni);
    const pnbp = grup.find((g) => g.nama === 'PNBP');
    return (
      grup.length === 2 &&
      pnbp !== undefined &&
      pnbp.tugas[0].id === 'T3' &&
      pnbp.tugas[1].id === 'T1'
    );
  })(),
);
cek(
  'kelompokkanTugas: urutan prioritas P1 dulu',
  (() => {
    const daftar = [
      buat({ id: 'T1', prioritas: 3 }),
      buat({ id: 'T2', prioritas: 1 }),
    ];
    const grup = kelompokkanTugas(daftar, 'tanpa-grup', 'prioritas', hariIni);
    return grup[0].tugas[0].id === 'T2';
  })(),
);

// --- 14. Marker ada di bundle hasil build (verifikasi dari bundle). ---
try {
  const aset = readdirSync(join(process.cwd(), 'dist', 'assets')).filter((f) =>
    f.endsWith('.js'),
  );
  const bundle = aset.map((f) => baca(join('dist', 'assets', f))).join('\n');
  for (const s of [
    'Kotak Masuk',
    'Jadwalkan ulang semua',
    'Filter & Label',
    'Ditugaskan ke saya',
  ]) {
    cek(`Bundle memuat "${s}"`, bundle.includes(s));
  }
} catch {
  cek('Bundle dist/ tersedia (jalankan npm run build dulu)', false);
}

console.log(`\n${lolos} lolos, ${gagal} gagal.`);
if (gagal > 0) {
  console.log('Ada asersi gagal.');
  process.exit(1);
} else {
  console.log('Semua asersi lolos.');
}

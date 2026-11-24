// Verifikasi duplikasi Todoist untuk panel Tugas
// (2026-11-24; src/modules/Todo.tsx + src/lib/tugasTodoist.ts +
//  src/lib/types.ts + src/lib/store.ts + src/App.tsx +
//  src/lib/firestoreStore.ts).
// Asersi: tampilan (Kotak Masuk, Hari Ini, Mendatang, Filter & Label,
// Laporan) sebagai sidebar Todoist di dalam panel, Quick Add, kartu tugas,

// View Options, Mendatang + jadwalkan ulang massal, filter tersimpan & label
// disposisi, Laporan + ekspor CSV, pencarian + shortcut, Bahasa Indonesia
// di UI panel, Disposisi (Alur F) DIBUANG dari panel (model & data tetap),
// TIDAK ADA koleksi/aturan Firestore baru, helper murni benar di data
// sintetis + seed nyata, dan marker ada di bundle hasil build (dist/).
// Keluar bukan-nol bila ada asersi gagal.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_NYATA } from '../src/lib/seedNyata';
import {
  formatTanggalPendek,
  hariIniIso,
  parseTanggalId,
} from '../src/lib/format';
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
  tugasSelesai,
} from '../src/lib/tugasTodoist';
import type { Task } from '../src/lib/types';

// Dijalankan dari root repo (pola skrip cek lain).
const baca = (relatif: string) =>
  readFileSync(join(process.cwd(), relatif), 'utf8');
const todo = baca('src/modules/Todo.tsx');
// Nama komponen ikon lucide (mis. Inbox) bukan label UI — keluarkan baris
// impor ikon saat memeriksa label Inggris di UI panel.
const todoTanpaImporIkon = todo.replace(
  /import \{[^}]*\} from 'lucide-react';/g,
  '',
);
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

// --- 1. Tampilan dalam panel (Bahasa Indonesia) sebagai sidebar Todoist. ---
for (const label of [
  'Kotak Masuk',
  'Hari Ini',
  'Mendatang',
  'Filter & Label',
  'Laporan',
]) {
  cek(`Item sub-panel "${label}" ada`, todo.includes(label));
}
cek(
  'Judul tampilan besar ala Todoist (26px) + subjudul hitungan',
  todo.includes('text-[26px]') && todo.includes('CheckCircle2'),
);
cek(
  'Sidebar Todoist di dalam panel (lebar 280px, latar #fafafa)',
  todo.includes('SidebarTodoist') &&
    todo.includes('md:w-[280px]') &&
    todo.includes('bg-[#fafafa]'),
);
cek(
  'Sidebar memuat tombol tambah tugas NAVY + Cari',
  todo.includes('Tambah tugas') &&
    todo.includes('bg-[#0D2569]') &&
    todo.includes('Cari'),
);
cek(
  'Tombol "Tambah tugas" sidebar NAVY SOLID (bukan teks + lingkaran)',
  todo.includes(
    'justify-center gap-2 rounded-md bg-[#0D2569] px-4 py-2 text-sm font-semibold text-white',
  ) && !todo.includes('rounded-full bg-[#0D2569] text-white'),
);
cek(
  'Sidebar memuat bagian Proyek Saya + Jelajahi semua proyek',
  todo.includes('Proyek Saya') &&
    todo.includes('Jelajahi semua proyek') &&
    todo.includes('PROYEK_TODOIST'),
);
cek(
  'Sidebar memuat hitungan tugas (Kotak Masuk / Hari Ini / Laporan)',
  todo.includes('jumlahKotakMasuk') &&
    todo.includes('jumlahHariIni') &&
    todo.includes('jumlahSelesai'),
);
cek(
  'Sub-panel ala Laporan sudah tidak dipakai (tanpa SubPanelTugas)',
  !todo.includes('SubPanelTugas'),
);
cek(
  'Tab horizontal lama (TabBar) sudah tidak dipakai di panel Tugas',
  !todo.includes('TabBar'),
);
cek(
  'Layout default Board ala Todoist (Today board per proyek)',
  todo.includes("useState<'daftar' | 'board'>('board')"),
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
cek(
  'Ctrl+K membuka pop-up Cari (bukan fokus kotak pencarian)',
  todo.includes('setPaletCari(true)') && !todo.includes('cariRef'),
);
cek(
  'Quick Add berupa MODAL melayang terpusat (overlay + kartu tengah)',
  todo.includes('fixed inset-0 z-50 flex items-start justify-center') &&
    todo.includes('max-w-[560px]'),
);
cek(
  'Tanggal di panel memakai input teks DD/MM/YYYY (tanpa input date native)',
  todo.includes('function InputTanggal') &&
    todo.includes('dd/mm/yyyy') &&
    !todo.includes('type="date"'),
);

// --- 3. Kartu tugas ala Todoist. ---
for (const s of ['Tandai selesai', 'Sub-tugas', 'Tandai belum selesai']) {
  cek(`Kartu tugas memuat "${s}"`, todo.includes(s));
}
// Anatomi kartu Todoist: checkbox + judul + tanggal + progres sub-tugas +
// tag proyek SAJA — tanpa badge prioritas, baris penanggung jawab, pil status
// (ketiganya tetap ada di dialog detail).
const kartu = todo.slice(
  todo.indexOf('function KartuTugas'),
  todo.indexOf('function DaftarTugas'),
);
cek(
  'Kartu tugas tanpa badge prioritas (P4 tetap di dialog detail)',
  !kartu.includes('BenderaPrioritas'),
);
cek(
  'Kartu tugas tanpa baris penanggung jawab (tetap di dialog detail)',
  !kartu.includes('{t.pemilik}'),
);
cek(
  'Kartu tugas tanpa pil status (tetap di dialog detail & Laporan)',
  !kartu.includes('BadgeStatus'),
);
cek(
  'Tanggal terlambat NAVY TEBAL, hari ini hijau',
  todo.includes("font-bold text-[#0D2569]") && todo.includes('text-[#058527]'),
);
cek(
  'Aksen NAVY #0D2569 dipakai (tombol + checkbox + sidebar)',
  todo.includes('#0D2569'),
);
cek(
  'Kartu tugas putih border #e6e6e6 + checkbox 18px border #999',
  todo.includes('border-[#e6e6e6]') &&
    todo.includes('h-[18px]') &&
    todo.includes('border-[#999]'),
);
cek(
  'Bendera prioritas (P1 navy, P2 oranye, P3 biru)',
  todo.includes("'#0D2569'") &&
    todo.includes("'#eb8909'") &&
    todo.includes("'#246fe0'"),
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
cek(
  'Label kolom Mendatang memakai tanggal pendek dd/mm (bukan dd/mm/yyyy)',
  todo.includes('formatTanggalPendek(tanggal)') &&
    !todo.includes('Hari ini · ${formatTanggal(tanggal)}'),
);

// --- 6. Filter tersimpan, label disposisi, tambah label. ---
for (const s of ['Filter saya', 'Prioritas 1', 'Belum ada label.']) {
  cek(`Filter & Label memuat "${s}"`, todo.includes(s));
}
cek(
  'Filter tersimpan "Ditugaskan ke saya" ada (di tugasTodoist.ts, dipakai FilterLabel)',
  helper.includes('Ditugaskan ke saya') && todo.includes('FILTER_TERSIMPAN'),
);
cek(
  'Daftar definisi label DIKOSONGKAN (LABEL_DISPOSISI + LABEL_BAWAAN kosong)',
  helper.includes('export const LABEL_DISPOSISI: string[] = [];') &&
    helper.includes('export const LABEL_BAWAAN: string[] = [];'),
);
cek(
  'semuaLabel pada seed nyata kosong (seed tidak punya label)',
  semuaLabel(DATA_NYATA.task).length === 0,
);

// --- 7. Dialog detail 2 kolom + More actions. ---
for (const s of [
  'Deskripsi',
  'Komentar',
  'Pengingat',
  'Duplikat',
  'Salin tautan tugas',
  'Ya, hapus',
]) {
  cek(`Dialog detail memuat "${s}"`, todo.includes(s));
}

// --- 8. Laporan + ekspor CSV. ---
cek('Laporan memuat "Ekspor CSV"', todo.includes('Ekspor CSV'));
cek('Laporan memuat hitungan bulan ini', todo.includes('selesai bulan ini'));
cek(
  'Laporan: baris "Selesai pada" hanya bila ada tanggalnya (tanpa "—" kosong)',
  todo.includes('Selesai pada {formatTanggal(t.selesaiPada)}') &&
    !todo.includes("formatTanggal(t.selesaiPada) : '—'"),
);
cek(
  'Hitungan tampil sebagai satu string "N tugas" (tanpa "0tugas")',
  todo.includes('`${jumlahJudul} tugas`') &&
    todo.includes('`${selesai.length} tugas selesai`'),
);

// --- 9. Bahasa Indonesia di UI panel (tidak ada label Inggris Todoist). ---
// 'Inbox' hanya nama komponen ikon lucide (Icon: Inbox) — label UI-nya
// 'Kotak Masuk'; untuk kata itu periksa bentuk string berkuotip saja.
cek(
  'UI panel tidak memakai label "Inbox"',
  !todo.includes("'Inbox'") && !todo.includes('"Inbox"'),
);
for (const s of ['Add task', 'No Date', 'Overdue', 'Upcoming', 'Completed tasks']) {
  cek(`UI panel tidak memakai "${s}"`, !todoTanpaImporIkon.includes(s));
}

// --- 10. Disposisi dibuang dari panel Tugas; model & data tetap ada. ---
for (const s of [
  'DaftarDisposisi',
  'FormDisposisi',
  'Riwayat alur disposisi',
  '+ Buat disposisi',
  'tutupDisposisi',
  'Instruksi disposisi',
  "'disposisi'",
]) {
  cek(`Disposisi dibuang dari panel ("${s}")`, !todo.includes(s));
}
cek(
  'Model: types.ts tetap punya field disposisi',
  types.includes('pemberiDisposisi?: string') &&
    types.includes('disposisiDari?: string'),
);
cek(
  'Model: store.ts tetap punya aksi disposisi',
  store.includes('tambahDisposisi:') && store.includes('tutupDisposisi:'),
);
cek(
  'Model: App.tsx tetap mengimplementasikan aksi disposisi',
  app.includes('tambahDisposisi:') && app.includes('tutupDisposisi:'),
);
cek(
  'Seed TSK-04/TSK-05 tetap ada',
  DATA_NYATA.task.some((t) => t.id === 'TSK-04') &&
    DATA_NYATA.task.some((t) => t.id === 'TSK-05'),
);
cek(
  'TSK-04 (Ditutup) tetap tampil di Laporan',
  tugasSelesai(DATA_NYATA.task.find((t) => t.id === 'TSK-04')!),
);
cek(
  'TSK-05 (Berjalan, tenggat lewat) tetap tampil di Kotak Masuk/Hari Ini',
  (() => {
    const t = DATA_NYATA.task.find((x) => x.id === 'TSK-05')!;
    return !tugasSelesai(t) && t.tenggat !== '' && t.tenggat <= hariIniIso();
  })(),
);

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
cek('labelTanggal kemarin', labelTanggal(tambahHari(hariIni, -1)) === 'Kemarin');
cek(
  'labelTanggal tanggal lain tampil dd/mm (tanpa tahun)',
  labelTanggal(tambahHari(hariIni, 5)) ===
    formatTanggalPendek(tambahHari(hariIni, 5)) &&
    !labelTanggal(tambahHari(hariIni, 5)).includes(
      String(new Date().getFullYear()),
    ),
);
cek('labelTanggal tanpa tanggal', labelTanggal('') === 'Tanpa tanggal');
cek(
  'formatTanggalPendek 24/11',
  formatTanggalPendek('2026-11-24') === '24/11',
);
cek(
  'parseTanggalId dd/mm/yyyy',
  parseTanggalId('24/11/2026') === '2026-11-24',
);
cek(
  'parseTanggalId menolak format US (bulan 24 tidak valid)',
  parseTanggalId('11/24/2026') === null,
);
cek(
  'parseTanggalId menolak tanggal tidak valid (31 Feb)',
  parseTanggalId('31/02/2026') === null,
);
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
      buat({ id: 'T4', tenggat: hariIni, proyek: 'Media Partner' }),
    ];
    const grup = kelompokkanTugas(daftar, 'proyek', 'tanggal', hariIni);
    const pnbp = grup.find((g) => g.nama === 'PNBP');
    return (
      grup.length === 3 &&
      pnbp !== undefined &&
      pnbp.tugas[0].id === 'T3' &&
      pnbp.tugas[1].id === 'T1' &&
      grup[1].nama === 'Media Partner' &&
      grup[2].nama === 'KBRN'
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
    'Proyek Saya',
    'Jelajahi semua proyek',
    'Tambah tugas',
    'dd/mm/yyyy',
    'Cari atau ketik perintah...',
    'Baru saja dilihat',
    'Belum ada label.',
  ]) {
    cek(`Bundle memuat "${s}"`, bundle.includes(s));
  }
  for (const s of ['+ Buat disposisi', 'Tutup disposisi', 'Instruksi disposisi']) {
    cek(`Bundle tidak lagi memuat "${s}"`, !bundle.includes(s));
  }
  for (const s of ['Tugas perorangan.', 'Cari tugas…']) {
    cek(`Bundle tidak lagi memuat "${s}"`, !bundle.includes(s));
  }
} catch {
  cek('Bundle dist/ tersedia (jalankan npm run build dulu)', false);
}

// --- 15. Perubahan 2026-11-24: navy + tanpa subjudul + pop-up Cari +
//     proyek baru + ikon modul + label dikosongkan. ---
for (const hex of ['#DB4C3F', '#d1453b', '#fceae8', '#C23B2E']) {
  cek(`Tidak ada merah Todoist "${hex}" di source panel Tugas`, !todo.includes(hex));
}
cek(
  'Tanggal terlambat navy TEBAL (bukan merah)',
  todo.includes("font-bold text-[#0D2569]"),
);
cek(
  'Subjudul "Tugas perorangan." dihapus (modul Tugas tanpa deskripsi)',
  !app.includes('Tugas perorangan.') &&
    app.includes("id: 'todo'") &&
    !todo.includes('Tugas perorangan.'),
);
cek(
  'Tidak ada kotak pencarian menetap di konten panel',
  !todo.includes('Cari tugas… (Ctrl+K)') &&
    !todo.includes('Cari tugas selesai… (Ctrl+K)') &&
    !todo.includes('cariRef'),
);
for (const s of [
  'PaletPencarian',
  'Cari atau ketik perintah...',
  'Baru saja dilihat',
  'Ke Beranda',
  'Ke Kotak Masuk',
  'Ke Hari Ini',
  'Ke Mendatang',
  'Ke Filter & Label',
  'Ke Laporan',
  'G lalu H',
  'G lalu I',
  'G lalu T',
  'G lalu U',
  'G lalu V',
  'G lalu A',
]) {
  cek(`Pop-up Cari memuat "${s}"`, todo.includes(s));
}
cek(
  'Pop-up Cari dibuka dari sidebar + Ctrl+K, ditutup Esc/klik latar',
  todo.includes('onCari={() => setPaletCari(true)}') &&
    todo.includes('setPaletCari(true)') &&
    todo.includes('onTutup={() => setPaletCari(false)}'),
);
cek(
  'Shortcut G-lalu-huruf terdaftar (Beranda H, Kotak Masuk I, Hari Ini T)',
  todo.includes("h: () => props.onNavigasiModul?.('home')") &&
    todo.includes("i: () => pilihTampilan('kotak-masuk')") &&
    todo.includes("t: () => pilihTampilan('hari-ini')"),
);
cek(
  'Pop-up Cari bisa ke Beranda (onNavigasiModul diteruskan App.tsx)',
  app.includes('onNavigasiModul={(m) => setActive(m as ModuleId)}'),
);
// Daftar proyek baru: hanya di blok PROYEK_TODOIST (bagian lama di
// BAGIAN_PROYEK sengaja dipertahankan untuk tugas berproyek lama).
const blokProyek = helper.slice(
  helper.indexOf('export const PROYEK_TODOIST'),
  helper.indexOf('export const BAGIAN_PROYEK'),
);
for (const nama of ['PNBP', 'Nota Kesepahaman', 'Dukungan Layanan', 'Media Partner']) {
  cek(`Daftar proyek baru memuat "${nama}"`, blokProyek.includes(`nama: '${nama}'`));
}
for (const nama of ['KBRN', 'Komunikasi Publik', 'Layanan Publik', 'General Affairs']) {
  cek(`Daftar proyek baru TIDAK memuat "${nama}"`, !blokProyek.includes(nama));
}
cek(
  'Ikon Proyek Saya = ikon modul di sidebar admin',
  todo.includes('PNBP: FileSignature') &&
    todo.includes("'Nota Kesepahaman': ScrollText") &&
    todo.includes("'Dukungan Layanan': HeartHandshake") &&
    todo.includes("'Media Partner': Stamp"),
);
cek(
  'Ikon modul di App.tsx tidak diubah (FileSignature/ScrollText/HeartHandshake/Stamp)',
  app.includes('icon: FileSignature') &&
    app.includes('icon: ScrollText') &&
    app.includes('icon: HeartHandshake') &&
    app.includes('icon: Stamp'),
);
cek(
  'Daftar Label kosong (kartu "Belum ada label.", tanpa tambah label)',
  todo.includes('Belum ada label.') &&
    !todo.includes('+ Tambah label') &&
    !todo.includes('Label baru'),
);
cek(
  'Tidak ada chip label di kartu/detail (tanpa LabelTodo "Label")',
  !todo.includes('<LabelTodo>Label</LabelTodo>') &&
    !todo.includes('rounded-full bg-[#f5f5f5] px-2 py-0.5 text-xs text-[#666]'),
);
cek(
  'Tidak ada pemilih/filter label di UI (state & prop label dihapus)',
  !todo.includes('filterLabel') &&
    !todo.includes('labelDipakai') &&
    !todo.includes('alihLabel'),
);
cek(
  'Model data label tetap ada (field label di types.ts + store)',
  types.includes('label?: string[]'),
);

console.log(`\n${lolos} lolos, ${gagal} gagal.`);
if (gagal > 0) {
  console.log('Ada asersi gagal.');
  process.exit(1);
} else {
  console.log('Semua asersi lolos.');
}

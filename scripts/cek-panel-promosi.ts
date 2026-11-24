// Verifikasi restrukturasi panel Promosi (keputusan pengguna 24/11/2026,
// opsi (a)) — TANPA Firestore.
// - Subjudul "Acara dan iklan." di bawah judul panel Promosi dihapus
//   (deskripsi modul marketing di MODULES App.tsx dikosongkan; modul
//   lain tetap memakai deskripsi).
// - Judul "Kampanye" (JudulBagian di Marketing.tsx) dihapus.
// - Tab lama "Acara" (events) dan "Iklan" (advertisement) dihapus;
//   daftar event + form tambah event TIDAK lagi tampil di panel ini.
//   Data event TIDAK dihapus: seed + store + aksi tambahEvent tetap ada.
// - Dua tab baru "Iklan Radio" dan "Iklan Digital", keduanya
//   menampilkan daftar iklan yang sama (DaftarAdvertisement): Radio =
//   media mengandung kata "Radio" (case-insensitive), Digital = sisanya.
//   ADV-01 (media "Media Sosial (Instagram/Facebook)") masuk Digital;
//   tab Radio mulai dengan empty state jujur.
// - Form tambah iklan TIDAK diubah (media tetap teks bebas).
// - Judul panel tetap "Promosi".
// Keluar bukan-nol bila ada asersi gagal.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_NYATA } from '../src/lib/seedNyata';

// Dijalankan dari root repo — berkas dibaca saat runtime, jadi path
// diambil dari cwd, bukan dari lokasi bundle.
const baca = (relatif: string) =>
  readFileSync(join(process.cwd(), relatif), 'utf8');
const app = baca('src/App.tsx');
const marketing = baca('src/modules/Marketing.tsx');
const store = baca('src/lib/store.ts');
const seedNyata = baca('src/lib/seedNyata.ts');

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};

// ---------- judul + subjudul panel ----------
cek(
  'Promosi: judul panel tetap "Promosi"',
  app.includes("label: 'Promosi'"),
);
cek(
  'Promosi: subjudul "Acara dan iklan." hilang dari App.tsx',
  !app.includes('Acara dan iklan.'),
);
const entriMarketing = app.slice(
  app.indexOf("id: 'marketing',"),
  app.indexOf("id: 'marketing',") + 400,
);
cek(
  'Promosi: entri modul marketing berdeskripsi kosong (subjudul hilang hanya untuk modul ini)',
  entriMarketing.includes("label: 'Promosi'") &&
    entriMarketing.includes("description: ''"),
);
cek(
  'Promosi: deskripsi modul lain utuh (contoh: Approvement + Klien)',
  app.includes("description: 'Dokumen media partner.'") &&
    app.includes("description: 'Daftar klien, sama dengan tab Klien di Deals.'"),
);
cek(
  'Promosi: judul "Kampanye" hilang dari Marketing.tsx',
  !marketing.includes('Kampanye'),
);

// ---------- tab baru vs tab lama ----------
cek(
  'Promosi: tab "Iklan Radio" ada',
  marketing.includes("{ id: 'radio', label: 'Iklan Radio' }"),
);
cek(
  'Promosi: tab "Iklan Digital" ada',
  marketing.includes("{ id: 'digital', label: 'Iklan Digital' }"),
);
cek(
  'Promosi: tab lama "Acara" (events) hilang',
  !marketing.includes("id: 'events'") && !marketing.includes('Acara'),
);
cek(
  'Promosi: tab lama "Iklan" (advertisement) hilang',
  !marketing.includes("id: 'advertisement'") &&
    !marketing.includes("label: 'Iklan'"),
);
cek(
  'Promosi: tab default adalah Iklan Radio',
  marketing.includes("useState('radio')"),
);
cek(
  'Promosi: kedua tab memakai DaftarAdvertisement yang sama (prop jenis)',
  marketing.includes("jenis={tab === 'radio' ? 'radio' : 'digital'}") &&
    marketing.includes("jenis: 'radio' | 'digital'"),
);

// ---------- pemisah Radio / Digital ----------
cek(
  'Promosi: filter Radio = media mengandung kata "Radio" (case-insensitive)',
  marketing.includes("a.media.toLowerCase().includes('radio')"),
);
const iklan = DATA_NYATA.advertisement;
const radio = iklan.filter((a) => a.media.toLowerCase().includes('radio'));
const digital = iklan.filter((a) => !a.media.toLowerCase().includes('radio'));
cek('Promosi: data contoh hanya punya 1 iklan', iklan.length === 1, `${iklan.length}`);
cek(
  'Promosi: ADV-01 masuk Digital (media "Media Sosial (Instagram/Facebook)")',
  digital.length === 1 && digital[0].id === 'ADV-01',
  digital.map((a) => a.id).join(', '),
);
cek('Promosi: tab Radio mulai kosong (0 iklan radio di data contoh)', radio.length === 0, `${radio.length}`);

// ---------- daftar iklan tetap lengkap per tab ----------
cek(
  'Promosi: stat card Jumlah iklan + Total biaya iklan tetap ada',
  marketing.includes('label="Jumlah iklan"') &&
    marketing.includes('label="Total biaya iklan"'),
);
cek(
  'Promosi: tombol "+ Tambah iklan" tetap ada',
  marketing.includes('+ Tambah iklan'),
);
cek(
  'Promosi: tabel iklan tetap ada (ID, Nama iklan, Media / kanal, Periode, Biaya, Hasil)',
  marketing.includes('<Th>Nama iklan</Th>') &&
    marketing.includes('<Th>Media / kanal</Th>') &&
    marketing.includes('<Th>Periode</Th>'),
);
cek(
  'Promosi: form tambah iklan tidak diubah (media tetap teks bebas, aksi tambahAdvertisement)',
  marketing.includes('actions.tambahAdvertisement') &&
    marketing.includes('placeholder="Contoh: Media sosial (Instagram/Facebook)"'),
);
cek(
  'Promosi: empty state jujur saat tab kosong',
  marketing.includes('Belum ada iklan yang cocok.'),
);

// ---------- event tidak tampil, tapi data TIDAK dihapus ----------
cek(
  'Promosi: DaftarEvent + FormEvent hilang dari Marketing.tsx',
  !marketing.includes('DaftarEvent') && !marketing.includes('FormEvent'),
);
cek(
  'Promosi: tidak ada referensi EventInput / data.event di Marketing.tsx',
  !marketing.includes('EventInput') && !marketing.includes('data.event'),
);
cek(
  'Promosi: data event tetap ada di seed (EVT-01)',
  seedNyata.includes("id: 'EVT-01'"),
);
cek(
  'Promosi: aksi tambahEvent tetap ada di store',
  store.includes('tambahEvent'),
);

if (gagal > 0) {
  console.error(`\n${gagal} asersi GAGAL.`);
  process.exitCode = 1;
} else {
  console.log('\nSemua asersi panel Promosi lolos.');
}

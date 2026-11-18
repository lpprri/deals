// Verifikasi fitur Meeting: Update (edit) + sinkronisasi Google
// Calendar (PR #73, src/modules/Sales.tsx — TabMeeting dipakai ulang
// menu Meeting — + src/lib/googleCalendar.ts + src/App.tsx +
// src/lib/types.ts + src/lib/store.ts + seed MTG-01/MTG-02).
// Asersi:
// - Kolom Participants DIGANTI (PR #73 lanjutan, permintaan pengguna
//   17/11/2026 15:07 WIB) oleh Client Address, Client Representative,
//   Contact Person, RRI Representative — urutan header persis;
//   field lama `peserta` tetap disimpan, tidak lagi ditampilkan.
// - Form Add/Edit memuat keempat field baru; RRI Representative berupa
//   dropdown checkbox (5 operator Palembang, default operator login);
//   pilih Prospect/Client mengisi otomatis Contact Person (+ telepon)
//   dan alamat klien dari datanya.
// - Tombol Update paling kanan + Sync + status sync; koneksi memakai
//   linkWithPopup (BUKAN signInWithPopup — lihat alasan di
//   googleCalendar.ts); scope calendar.events; insert/patch Calendar
//   API v3; googleEventId + googleSyncedAt disimpan; event tanpa
//   attendees; durasi default 1 jam (Asia/Jakarta, +07:00); token hanya
//   di memori sesi (tidak di localStorage/Firestore).
// Skrip ini membaca berkas sebagai teks, kecuali helper kalender dan
// seed yang diimpor langsung untuk uji unit. Keluar bukan-nol bila ada
// asersi gagal.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  bangunIsiEvent,
  hitungAkhir,
} from '../src/lib/googleCalendar';
import { DATA_NYATA } from '../src/lib/seedNyata';
import type { Meeting } from '../src/lib/types';

// Dijalankan dari root repo (pola skrip cek lain) — berkas dibaca saat
// runtime, jadi path diambil dari cwd, bukan dari lokasi bundle.
const baca = (relatif: string) =>
  readFileSync(join(process.cwd(), relatif), 'utf8');
const sales = baca('src/modules/Sales.tsx');
const app = baca('src/App.tsx');
const types = baca('src/lib/types.ts');
const store = baca('src/lib/store.ts');
const kalender = baca('src/lib/googleCalendar.ts');
const rules = baca('firestore.rules');
const seedNyata = baca('src/lib/seedNyata.ts');
const sampleData = baca('src/lib/sampleData.ts');

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};

// --- Blok TabMeeting + FormMeeting (dipotong dari berkas). ---
const awalTab = sales.indexOf('export function TabMeeting(');
const akhirTab = sales.indexOf('function FormMeeting(');
const tab = sales.slice(awalTab, akhirTab);
const form = sales.slice(akhirTab);
const isiTabel = tab.slice(tab.indexOf('<tbody>'), tab.indexOf('</tbody>'));

// --- 1. Tipe Meeting: field baru + peserta tetap disimpan. ---
cek(
  'types.ts: Meeting punya clientRepresentatives + contactPersonNama/Telepon/Email + rriRepresentatives + alamatKlien',
  types.includes('clientRepresentatives?: string[];') &&
    types.includes('contactPersonNama?: string;') &&
    types.includes('contactPersonTelepon?: string;') &&
    types.includes('contactPersonEmail?: string;') &&
    types.includes('rriRepresentatives?: string[];') &&
    types.includes('alamatKlien?: string;'),
);
cek(
  'types.ts: Meeting tetap menyimpan peserta (field lama, tidak dihapus)',
  /export interface Meeting \{[\s\S]{0,500}?peserta: string;/.test(types),
);
cek(
  'types.ts: Meeting punya googleEventId + googleSyncedAt',
  /export interface Meeting \{[\s\S]{0,1300}?googleEventId\?: string;[\s\S]{0,200}?googleSyncedAt\?: string;/.test(
    types,
  ),
);

// --- 2. MeetingInput: field baru, tanpa peserta (diturunkan di App). ---
cek(
  'store.ts: MeetingInput punya 5 field baru dan TIDAK punya peserta',
  store.includes('clientRepresentatives: string[];') &&
    store.includes('contactPersonNama: string;') &&
    store.includes('contactPersonTelepon: string;') &&
    store.includes('rriRepresentatives: string[];') &&
    store.includes('alamatKlien: string;') &&
    !/export interface MeetingInput \{[\s\S]{0,600}?peserta: string;/.test(
      store,
    ),
);

// --- 3. Aksi store: ubah + tandai sync. ---
cek(
  'store.ts: StoreActions punya ubahMeeting(id, input)',
  store.includes(
    'ubahMeeting: (id: string, input: MeetingInput) => string | null;',
  ),
);
cek(
  'store.ts: StoreActions punya tandaiMeetingTersinkron(id, googleEventId)',
  store.includes(
    'tandaiMeetingTersinkron: (id: string, googleEventId: string) => void;',
  ),
);

// --- 4. Implementasi App.tsx. ---
cek(
  'App.tsx: ubahMeeting memvalidasi + simpanKeFirestore meeting',
  app.includes('ubahMeeting: (id: string, input: MeetingInput) => {') &&
    app.includes("simpanKeFirestore('meeting', id, diperbarui);") &&
    app.includes("'Meeting diperbarui'"),
  'ubah + simpan + audit',
);
cek(
  'App.tsx: ubahMeeting mempertahankan googleEventId (spread ...lama)',
  /ubahMeeting: \(id: string, input: MeetingInput\) => \{[\s\S]{0,1500}?const diperbarui: Meeting = \{\n\s*\.\.\.lama,/.test(
    app,
  ),
);
cek(
  'App.tsx: tambahMeeting menurunkan peserta dari RRI + Client Representative',
  app.includes('peserta: [') &&
    app.includes('...input.rriRepresentatives,') &&
    app.includes('...input.clientRepresentatives,'),
);
cek(
  'App.tsx: validasi field baru (wakil klien, contact person, RRI)',
  app.includes("'Add at least one client representative.'") &&
    app.includes("'Contact person name is required.'") &&
    app.includes("'Add at least one RRI representative.'"),
);
cek(
  'App.tsx: tandaiMeetingTersinkron menulis googleEventId + googleSyncedAt',
  app.includes(
    'tandaiMeetingTersinkron: (id: string, googleEventId: string) => {',
  ) && app.includes('googleSyncedAt: new Date().toISOString(),'),
);

// --- 5. Tabel: urutan header baru, Participants hilang. ---
const headerTabel = tab.slice(tab.indexOf('<thead>'), tab.indexOf('</thead>'));
const headerTerakhir = [...headerTabel.matchAll(/<Th>([^<]+)<\/Th>/g)].map(
  (m) => m[1],
);
cek(
  'tabel Meeting: urutan header = Date, Time, Prospect/Client, Client Address, Client Representative, Contact Person, RRI Representative, Agenda, Outcome, Actions',
  JSON.stringify(headerTerakhir) ===
    JSON.stringify([
      'Date',
      'Time',
      'Prospect / Client',
      'Client Address',
      'Client Representative',
      'Contact Person',
      'RRI Representative',
      'Agenda',
      'Outcome',
      'Actions',
    ]),
  headerTerakhir.join(' | '),
);
cek(
  "tabel Meeting: header 'Participants' TIDAK ADA lagi",
  !headerTabel.includes('<Th>Participants</Th>'),
);
cek(
  'tabel Meeting: isi baris tidak lagi menampilkan m.peserta',
  !isiTabel.includes('m.peserta'),
);
cek(
  'tabel Meeting: sel memakai helper tampil (alamat, daftar, kontak)',
  isiTabel.includes('tampilTeks(m.alamatKlien)') &&
    isiTabel.includes('tampilDaftar(m.clientRepresentatives)') &&
    isiTabel.includes('tampilKontak(m)') &&
    isiTabel.includes('tampilDaftar(m.rriRepresentatives)'),
);
cek(
  'tabel Meeting: Contact Person menampilkan email (kanal kirim link Meet)',
  sales.includes('contactPersonEmail?.trim()') &&
    sales.includes("`${dasar} · ${m.contactPersonEmail.trim()}`"),
);
cek(
  'tabel Meeting: tombol Update per baris (label persis)',
  />\s*Update\s*<\/TombolSekunder>/.test(tab) &&
    tab.includes('onClick={() => setEditMeeting(m)}'),
);
cek(
  'tabel Meeting: tombol Sync per baris',
  tab.includes("'Sync'") &&
    tab.includes('onClick={() => void sinkronkan(m)}'),
);
cek(
  'tabel Meeting: status sync per baris (Synced / Not synced)',
  tab.includes("'Synced'") && tab.includes("'Not synced'"),
);
cek(
  'tabel Meeting: Update + Sync hanya bila bolehKelola (kelolaMeeting)',
  tab.includes("const bolehKelola = bolehAksi(user.peran, 'kelolaMeeting');"),
);

// --- 6. FormMeeting: field baru + dropdown checkbox + auto-fill. ---
cek(
  'FormMeeting: label Client Address, Client Representative, Contact Person, RRI Representative ada',
  form.includes('<Label>Client Address</Label>') &&
    form.includes('<Label>Client Representative *</Label>') &&
    form.includes('<Label>Contact Person *</Label>') &&
    form.includes('<Label>Contact Person Phone</Label>') &&
    form.includes('<Label>Contact Person Email</Label>') &&
    form.includes('<Label>RRI Representative *</Label>'),
);
cek(
  "FormMeeting: label 'Participants' TIDAK ADA lagi",
  !form.includes('<Label>Participants'),
);
cek(
  'FormMeeting: RRI Representative berupa dropdown checkbox (5 operator Palembang)',
  form.includes('type="checkbox"') &&
    form.includes('OPERATOR_PALEMBANG') &&
    form.includes('alihkanRri(nama)'),
);
cek(
  'FormMeeting: operator login terpilih default di form Add',
  form.includes('namaOperatorLogin: string;') &&
    form.includes(
      "(namaOperatorLogin.trim() === '' ? [] : [namaOperatorLogin.trim()])",
    ),
);
cek(
  'FormMeeting: pilih prospect mengisi otomatis Contact Person (nama + telepon)',
  form.includes('pilihProspect') &&
    form.includes('contactPersonNama: p?.kontakNama') &&
    form.includes('contactPersonTelepon: p?.telepon'),
);
cek(
  'FormMeeting: pilih klien mengisi otomatis Contact Person + alamat',
  form.includes('pilihKlien') &&
    form.includes('contactPersonNama: k?.kontakNama') &&
    form.includes('alamatKlien: k?.alamat'),
);
cek(
  'FormMeeting: Client Representative free-text multi-nama (pisah koma)',
  form.includes('wakilKlienTeks') &&
    form.includes("split(',')") &&
    form.includes('Client representative names, separated by commas'),
);
cek(
  "FormMeeting: judul 'Update Meeting' saat edit, 'Add Meeting' saat tambah",
  form.includes(
    "<JudulBagian>{meeting ? 'Update Meeting' : 'Add Meeting'}</JudulBagian>",
  ),
);
cek(
  "FormMeeting: tombol 'Save Changes' saat edit, 'Save Meeting' saat tambah",
  form.includes("{meeting ? 'Save Changes' : 'Save Meeting'}"),
);
cek(
  'FormMeeting: edit memanggil actions.ubahMeeting, tambah tetap tambahMeeting',
  form.includes('actions.ubahMeeting(meeting.id, input)') &&
    form.includes('actions.tambahMeeting(input)'),
);
cek(
  'TabMeeting: form edit dirender saat editMeeting terisi',
  tab.includes('{editMeeting && (') &&
    tab.includes('<FormMeeting') &&
    tab.includes('meeting={editMeeting}'),
);

// --- 7. Migrasi seed MTG-01 / MTG-02 (teks + impor langsung). ---
const mtg01 = DATA_NYATA.meeting.find((m) => m.id === 'MTG-01');
const mtg02 = DATA_NYATA.meeting.find((m) => m.id === 'MTG-02');
cek(
  'seed: MTG-01 termigrasi (wakil, contact person, RRI, peserta tetap)',
  !!mtg01 &&
    JSON.stringify(mtg01.clientRepresentatives) ===
      JSON.stringify(['Hendra Wijaya']) &&
    mtg01.contactPersonNama === 'Hendra Wijaya' &&
    mtg01.contactPersonTelepon === '0812-7788-9900' &&
    JSON.stringify(mtg01.rriRepresentatives) ===
      JSON.stringify(['Andi Pratama (Contoh)']) &&
    mtg01.peserta ===
      'Andi Pratama (Contoh), Hendra Wijaya (PT Cahaya Media)',
  JSON.stringify(mtg01?.clientRepresentatives),
);
cek(
  'seed: MTG-02 termigrasi dengan logika yang sama',
  !!mtg02 &&
    JSON.stringify(mtg02.clientRepresentatives) ===
      JSON.stringify(['Rina Wijaya']) &&
    mtg02.contactPersonNama === 'Rina Wijaya' &&
    mtg02.contactPersonTelepon === '0812-3456-7890' &&
    JSON.stringify(mtg02.rriRepresentatives) ===
      JSON.stringify(['Andi Pratama (Contoh)']),
);
cek(
  'seed: sampleData ikut termigrasi (MTG-01 + MTG-02)',
  sampleData.includes("clientRepresentatives: ['Hendra Wijaya']") &&
    sampleData.includes("clientRepresentatives: ['Rina Wijaya']"),
);
cek(
  'seed: MTG-01/MTG-02 tanpa alamat (prospect tidak punya field alamat)',
  !!mtg01 &&
    !!mtg02 &&
    mtg01.alamatKlien === undefined &&
    mtg02.alamatKlien === undefined,
);

// --- 8. Google Calendar: koneksi. ---
cek(
  'kalender: tombol Connect Google Calendar di header (dekat + Add Meeting)',
  />\s*Connect Google Calendar\s*<\/TombolSekunder>/.test(tab) &&
    tab.includes('onClick={hubungkan}'),
);
cek(
  'kalender: status terhubung (email) + tombol Disconnect',
  tab.includes('Connected: {google.email}') &&
    />\s*Disconnect\s*<\/TombolSekunder>/.test(tab),
);
cek(
  'kalender: koneksi memakai linkWithPopup (BUKAN signInWithPopup)',
  kalender.includes('linkWithPopup(auth.currentUser, provider)') &&
    !/signInWithPopup\(/.test(kalender),
);
cek(
  'kalender: scope calendar.events',
  kalender.includes(
    "'https://www.googleapis.com/auth/calendar.events'",
  ) && kalender.includes('provider.addScope(SCOPE_KALENDER)'),
);
cek(
  'kalender: token hanya di memori sesi (tanpa pemakaian localStorage / tulis Firestore)',
  !/localStorage\.(getItem|setItem|removeItem|clear)\s*\(/.test(kalender) &&
    !/setDoc\s*\(/.test(kalender) &&
    !/simpanDokumen\s*\(/.test(kalender),
);
cek(
  'kalender: galat provider Google belum aktif dijelaskan di UI',
  kalender.includes('auth/operation-not-allowed') &&
    kalender.includes('Authentication → Sign-in method → Google'),
);

// --- 9. Google Calendar: insert / patch / simpan penanda. ---
cek(
  'kalender: insert via POST calendars/primary/events',
  kalender.includes(
    "'https://www.googleapis.com/calendar/v3/calendars/primary/events'",
  ) && kalender.includes("'POST'"),
);
cek(
  'kalender: patch via PATCH .../events/{id} (tanpa duplikat)',
  kalender.includes("'PATCH'") &&
    kalender.includes('`${URL_EVENT}/${encodeURIComponent(eventId)}`'),
);
cek(
  'kalender: event TANPA attendees (peserta tidak punya email)',
  !/(^|\n)\s*attendees\s*:/m.test(kalender),
);
cek(
  'kalender: zona Asia/Jakarta + offset +07:00',
  kalender.includes("const ZONA_WAKTU = 'Asia/Jakarta';") &&
    kalender.includes("const OFFSET_JAKARTA = '+07:00';"),
);
cek(
  'TabMeeting: Sync memanggil sinkronkanEventKalender + tandaiMeetingTersinkron',
  tab.includes('sinkronkanEventKalender(') &&
    tab.includes('actions.tandaiMeetingTersinkron(m.id, idEvent);'),
);
cek(
  'TabMeeting: edit meeting yang sudah sync mem-PATCH event-nya',
  tab.includes('perbaruiEventKalender(') &&
    tab.includes('const eventId = m.googleEventId;'),
);
cek(
  'TabMeeting: edit tanpa koneksi menampilkan catatan kalender belum diperbarui',
  tab.includes(
    'Google Calendar was not updated — connect Google Calendar and use Sync to update the event.',
  ),
);

// --- 10. Aturan Firestore: meeting sudah boleh di-update Operator. ---
cek(
  'firestore.rules: meeting ada di daftar koleksi update Operator',
  rules.includes("'meeting',") &&
    /allow update: if koleksi in \[[\s\S]{0,400}?'meeting'/.test(rules),
);

// --- 11. Uji unit helper kalender (impor langsung). ---
const contoh: Meeting = {
  id: 'MTG-01',
  tanggal: '2026-11-18',
  jam: '10:00',
  prospectId: 'PRS-01',
  peserta: 'Andi Pratama (Contoh), Hendra Wijaya (PT Cahaya Media)',
  agenda: 'Presentasi paket iklan 3 bulan (QTN-02)',
  hasil: 'Menunggu keputusan direksi; tindak lanjut 20/11/2026.',
  clientRepresentatives: ['Hendra Wijaya'],
  contactPersonNama: 'Hendra Wijaya',
  contactPersonTelepon: '0812-7788-9900',
  rriRepresentatives: ['Andi Pratama (Contoh)'],
  satker: { kode: '41', nama: 'PALEMBANG' },
};
const akhirSiang = hitungAkhir('2026-11-18', '10:00');
cek(
  'hitungAkhir: 10:00 + 1 jam = 11:00 di hari yang sama',
  akhirSiang.tanggal === '2026-11-18' && akhirSiang.jam === '11:00',
  `${akhirSiang.tanggal} ${akhirSiang.jam}`,
);
const akhirMalam = hitungAkhir('2026-11-18', '23:30');
cek(
  'hitungAkhir: 23:30 + 1 jam = 00:30 keesokan harinya',
  akhirMalam.tanggal === '2026-11-19' && akhirMalam.jam === '00:30',
  `${akhirMalam.tanggal} ${akhirMalam.jam}`,
);
const isi = bangunIsiEvent(contoh, 'PT Cahaya Media Palembang (Contoh)');
cek(
  'bangunIsiEvent: summary = agenda + pihak',
  isi.summary === 'Presentasi paket iklan 3 bulan (QTN-02) — PT Cahaya Media Palembang (Contoh)',
  isi.summary,
);
cek(
  'bangunIsiEvent: start 10:00+07:00, end 11:00+07:00, zona Asia/Jakarta',
  isi.start.dateTime === '2026-11-18T10:00:00+07:00' &&
    isi.end.dateTime === '2026-11-18T11:00:00+07:00' &&
    isi.start.timeZone === 'Asia/Jakarta' &&
    isi.end.timeZone === 'Asia/Jakarta',
  `${isi.start.dateTime} → ${isi.end.dateTime}`,
);
cek(
  'bangunIsiEvent: description memakai field baru (wakil, contact person + telepon, RRI, agenda, outcome)',
  isi.description.includes('Client Representative: Hendra Wijaya') &&
    isi.description.includes('Contact Person: Hendra Wijaya (0812-7788-9900)') &&
    isi.description.includes('RRI Representative: Andi Pratama (Contoh)') &&
    isi.description.includes('Agenda: Presentasi paket iklan 3 bulan (QTN-02)') &&
    isi.description.includes('Outcome: Menunggu keputusan direksi') &&
    !('attendees' in isi),
  isi.description.replaceAll('\n', ' | '),
);
cek(
  "bangunIsiEvent: description TIDAK memakai string Participants lama",
  !isi.description.includes('Participants:'),
);
const isiTanpaPihak = bangunIsiEvent(
  { ...contoh, hasil: undefined, alamatKlien: 'Jl. Merdeka No. 1' },
  '',
);
cek(
  'bangunIsiEvent: tanpa pihak, summary = agenda saja; alamat ikut di description',
  isiTanpaPihak.summary === 'Presentasi paket iklan 3 bulan (QTN-02)' &&
    isiTanpaPihak.description.includes('Client Address: Jl. Merdeka No. 1'),
);

if (gagal > 0) {
  console.log(`\n${gagal} asersi GAGAL`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');

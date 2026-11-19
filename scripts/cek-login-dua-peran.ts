// Verifikasi login EMPAT PERAN + Client Portal (19/11/2026; model dua
// peran PR #121 diganti keputusan pengguna 19/11/2026 20:41 + 20:43 WIB
// — nama berkas dipertahankan, isinya kini mengasersi model empat
// peran; cek-empat-peran.ts mengasersi matriks hak + checklist) —
// TANPA Firestore.
// - Field peran + routing menurut peran (peranDariProfil murni; App.tsx
//   merutekan client ke PortalKlien, operator/user/verifikator ke
//   admin portal).
// - SIGNUP PUBLIK (keputusan pengguna 19/11/2026 16:12 WIB, TIDAK
//   berubah oleh empat peran): halaman login punya jalur 'Create
//   account' — signup SELALU menghasilkan peran 'client' (tanpa
//   klienId, tanpa pilihan peran di form maupun di kode); akun baru
//   yang belum tertaut menampilkan portal 'belum tertaut' + diarahkan
//   ke Ajukan; self-create operator di rules dikunci ke profil
//   userProfiles yang disiapkan (menutup jalan penaikan peran yang
//   dibuka signup publik); akun belum tertaut boleh membuat
//   submission Ajukan klienId '' yang dibuatOleh-nya sama dengan
//   email akun Auth-nya (email Ajukan dikunci di portal).
// - firestore.rules: baca client HANYA di bawah klienId-nya sendiri
//   (kontrak/tagihan/pembayaran/denda/mou/commitment/dokumen/
//   pengajuanKlien/klien), list klien dilarang, baca operasional untuk
//   tiga peran internal (operator/user/verifikator), tulis operasional
//   hanya operator + user, verifikator tulis HANYA checklist
//   verifikasiLaporan, Lacak publik tetap get-by-ID tanpa login, guard
//   backfill baru, profil users: self-create hanya operator, operator
//   boleh membuat profil operator/user/verifikator/client (klienId
//   wajib hanya untuk client), peran/satker/klienId tidak bisa diubah.
// - Seed: klienId terdenormalisasi di tagihan/pembayaran/denda/dokumen
//   (rantai induk benar), MoU tepat 3 tertaut (035→KLN-030, 043→KLN-014,
//   045→KLN-009; near-miss 039 TIDAK tertaut), Commitment 0 tertaut.
// - Backfill: cakupan PERSIS 5 koleksi, guard baru berbeda dari guard
//   lain, prakondisi menolak hitungan live yang berubah, verifikasi
//   lolos pada seed dan menolak klienId yang salah.
// - Portal: 7 bagian tampil (My Cooperation, Plan a Campaign, Submit
//   a Request, Book a Free Call, Our Services, Additional Services,
//   Help & Contact); portal menyaring menurut klienId; tidak ada jalan
//   ke rute admin; client tidak punya satu pun aksi tulis (permissions).
// - Ajukan: submission mengembalikan nomor referensi (id) untuk dilacak.
// - Total kontrak PNBP TIDAK berubah: 42 kontrak, Rp441.863.375.
// Keluar bukan-nol bila ada asersi gagal.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_NYATA } from '../src/lib/seedNyata';
import { hitungTotalKontrol } from '../src/lib/derive';
import { peranDariProfil } from '../src/lib/auth';
import { DUMMY_USERS } from '../src/lib/dummyUsers';
import { LABEL_PERAN, bolehAksi } from '../src/lib/permissions';
import {
  HITUNGAN_BACKFILL_DIHARAPKAN,
  ID_GUARD_BACKFILL_KLIENID,
  ID_GUARD_MIGRASI_COMMITMENT,
  ID_GUARD_MIGRASI_MOU,
  ID_GUARD_MIGRASI_PERTAMA,
  ID_GUARD_REMIGRASI_KONTRAK,
  KLIEN_MOU,
  KOLEKSI_BACKFILL_KLIENID,
  periksaPrakondisiBackfillKlienId,
  verifikasiHasilBackfillKlienId,
} from '../src/lib/backfillKlienIdRencana';
import { cariKerjaSama } from '../src/modules/Lacak';

// Dijalankan dari root repo — berkas dibaca saat runtime, jadi path
// diambil dari cwd, bukan dari lokasi bundle.
const baca = (relatif: string) =>
  readFileSync(join(process.cwd(), relatif), 'utf8');
const rules = baca('firestore.rules');
const app = baca('src/App.tsx');
const login = baca('src/components/Login.tsx');
const portal = baca('src/modules/PortalKlien.tsx');
const ajukan = baca('src/modules/Ajukan.tsx');
const store = baca('src/lib/firestoreStore.ts');
const auth = baca('src/lib/auth.ts');
const master = baca('src/modules/MasterPage.tsx');
// Teks JSX terbelah baris (spasi/newline di sumber) — asersi salinan
// memakai versi yang diratakan spasi-nya, bukan sumber mentah.
const loginRata = login.replace(/\s+/g, ' ');
const masterRata = master.replace(/\s+/g, ' ');
const generatorMou = baca('scripts/impor-mou.py');

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};
const cekLempar = (nama: string, fn: () => unknown, harusLempar: boolean) => {
  let melempar = false;
  try {
    fn();
  } catch {
    melempar = true;
  }
  cek(nama, melempar === harusLempar, melempar ? 'lempar' : 'tidak lempar');
};

// ---------- peran: validasi murni ----------
cek(
  'peranDariProfil operator lolos',
  peranDariProfil({ peran: 'operator' }).peran === 'operator',
);
cek(
  'peranDariProfil client + klienId lolos',
  (() => {
    const r = peranDariProfil({ peran: 'client', klienId: 'KLN-030' });
    return r.peran === 'client' && r.klienId === 'KLN-030';
  })(),
);
cek(
  'peranDariProfil client tanpa klienId LOLOS (belum tertaut)',
  (() => {
    const r = peranDariProfil({ peran: 'client' });
    return r.peran === 'client' && r.klienId === undefined;
  })(),
);
cek(
  'peranDariProfil client klienId kosong LOLOS (belum tertaut)',
  (() => {
    const r = peranDariProfil({ peran: 'client', klienId: '' });
    return r.peran === 'client' && r.klienId === undefined;
  })(),
);
cekLempar('peranDariProfil client klienId bukan string ditolak', () =>
  peranDariProfil({ peran: 'client', klienId: 123 }),
  true,
);
cekLempar('peranDariProfil peran tidak dikenal ditolak', () =>
  peranDariProfil({ peran: 'admin' }),
  true,
);
cekLempar('peranDariProfil tanpa peran ditolak', () => peranDariProfil({}), true);

// ---------- dummy + label peran ----------
cek('DUMMY_USERS 2 akun (operator + client)', DUMMY_USERS.length === 2);
cek(
  'dummy operator ada',
  DUMMY_USERS.some((u) => u.peran === 'operator'),
);
cek(
  'dummy client KLN-030 (BNN Sumsel)',
  DUMMY_USERS.some((u) => u.peran === 'client' && u.klienId === 'KLN-030'),
);
cek(
  'LABEL_PERAN operator + client',
  LABEL_PERAN.operator === 'Operator' && LABEL_PERAN.client === 'Client',
);
cek(
  'Login tidak lagi menyebut "Only designated officers"',
  !login.includes('Only designated officers'),
);
cek(
  'Login menyebut empat peran masuk di sini',
  loginRata.includes('Operators, Users, Verifikators, and clients sign in here'),
);
cek(
  'Login merender semua DUMMY_USERS',
  login.includes('DUMMY_USERS.map'),
);

// ---------- routing menurut peran (App.tsx) ----------
cek(
  'App merutekan client ke PortalKlien',
  app.includes("user.peran === 'client'") && app.includes('<PortalKlien'),
);
cek(
  'App memuat data client lewat muatDataKlien',
  app.includes('muatDataKlien('),
);
cek(
  'App tetap memuat data operator lewat muatDariFirestore',
  app.includes('muatDariFirestore('),
);
cek(
  'cabang client SEBELUM shell admin (navUtama)',
  app.indexOf("user.peran === 'client'") !== -1 &&
    app.indexOf("user.peran === 'client'") < app.indexOf('navUtama'),
);
cek(
  'session restore menerima keempat peran (peranDikenal)',
  app.includes('peranDikenal(peran)'),
);
cek(
  'Lacak publik tetap ada (halamanPublik lacak)',
  app.includes("halamanPublik === 'lacak'"),
);

// ---------- permissions: client tidak punya aksi tulis ----------
const AKSI_OPERATOR = [
  'tambahKlien',
  'tambahKontrak',
  'catatPembayaran',
  'verifikasiPembayaran',
  'tambahDenda',
  'ubahDokumen',
  'kelolaMaster',
  'lihatAudit',
  'kelolaOrder',
  'kelolaMeeting',
  'setujuiPengajuanKlien',
  'tolakPengajuanKlien',
] as const;
cek(
  'client tidak boleh satu pun aksi operator',
  AKSI_OPERATOR.every((a) => !bolehAksi('client', a)),
  `${AKSI_OPERATOR.length} aksi dicek`,
);
cek(
  'operator tetap boleh tambahKlien + kelolaMaster',
  bolehAksi('operator', 'tambahKlien') && bolehAksi('operator', 'kelolaMaster'),
);

// ---------- signup publik (keputusan 19/11/2026 16:12 WIB) ----------
// Ambil badan daftarDenganEmail saja (sampai komentar Keluar) supaya
// asersi 'tanpa klienId' tidak tertipu komentar di luar fungsi.
const awalDaftar = auth.indexOf('export async function daftarDenganEmail');
const akhirDaftar = auth.indexOf('/** Keluar', awalDaftar);
const badanDaftar = auth.slice(awalDaftar, akhirDaftar);
cek(
  'daftarDenganEmail memakai createUserWithEmailAndPassword',
  badanDaftar.includes('createUserWithEmailAndPassword('),
);
cek(
  'daftarDenganEmail TIDAK punya parameter peran (selalu client)',
  auth.includes(
    'export async function daftarDenganEmail(\n  nama: string,\n  institusi: string,\n  email: string,\n  kataSandi: string,\n)',
  ),
);
cek(
  "daftarDenganEmail menulis peran 'client' (hardcode)",
  badanDaftar.includes("peran: 'client'"),
);
cek(
  'daftarDenganEmail TIDAK menulis klienId (tanpa tautan otomatis)',
  !badanDaftar.includes('klienId:'),
);
cek(
  'daftarDenganEmail menyimpan institusi pendaftar (untuk penautan)',
  badanDaftar.includes('institusi: institusiBersih'),
);
cek(
  'daftarDenganEmail menolak kata sandi < 6 karakter',
  badanDaftar.includes('kataSandi.length < 6'),
);
cek(
  'Login punya mode signup (Create account / Create your account)',
  login.includes('Create account') && login.includes('Create your account'),
);
cek(
  'Login form signup: nama + institusi + email + password',
  login.includes('id="signup-nama"') &&
    login.includes('id="signup-institusi"') &&
    login.includes('id="signup-email"') &&
    login.includes('id="signup-password"'),
);
cek(
  'Login form signup TIDAK punya pemilih peran',
  !login.includes('id="signup-peran"') && !login.includes('name="peran"'),
);
cek(
  'Login signup menjelaskan: tanpa pilihan peran, operator menautkan',
  loginRata.includes('no role to choose') &&
    loginRata.includes('the Operator will link your account'),
);
cek(
  'Login menerima prop onSignupAuth',
  login.includes('onSignupAuth'),
);
cek(
  'App menyambung onSignupAuth ke daftarDenganEmail',
  app.includes('onSignupAuth={') && app.includes('daftarDenganEmail('),
);
cek(
  'App: client belum tertaut TIDAK memanggil muatDataKlien',
  app.includes('muatDataKlien TIDAK dipanggil tanpa klienId'),
);
cek(
  'App session restore membawa institusi pendaftar',
  app.includes('institusi:') && app.includes('d.institusi'),
);
cek(
  "portal 'belum tertaut': kartu jujur + operator menautkan",
  portal.includes('Your account is not linked to a client record yet.') &&
    portal.includes('the Operator will link your account'),
);
cek(
  "portal 'belum tertaut': tombol arahkan ke Ajukan",
  portal.includes("setTab('ajukan')") && portal.includes('Submit a Request'),
);
cek(
  'portal Ajukan memakai email akun (emailTetap)',
  portal.includes('emailTetap={pengguna.email}'),
);
cek(
  'Ajukan: emailTetap dikunci (disabled) + alasan',
  ajukan.includes('emailTetap') &&
    ajukan.includes('disabled={emailTetap !== undefined}') &&
    ajukan.includes('Using your account email'),
);
cek(
  "rules: client belum tertaut boleh buat Ajukan klienId '' (dibuatOleh == token email)",
  rules.includes('BELUM TERTAUT') &&
    rules.includes("request.resource.data.klienId == ''") &&
    rules.includes(
      'request.resource.data.dibuatOleh == request.auth.token.email',
    ),
);
cek(
  'rules update users: peran tidak bisa diubah (anti-eskalasi)',
  rules.includes(
    'request.resource.data.peran == resource.data.peran',
  ),
);
cek(
  'rules: operator boleh menautkan akun signup (update users, tambah klienId saja)',
  (() => {
    const awal = rules.indexOf('match /users/{uid}');
    const akhir = rules.indexOf('match /userProfiles', awal);
    const blok = rules.slice(awal, akhir);
    return (
      blok.includes('allow update: if adalahOperator()') &&
      blok.includes("resource.data.peran == 'client'") &&
      blok.includes("resource.data.get('klienId', '') == ''") &&
      blok.includes('request.resource.data.klienId.size() > 0')
    );
  })(),
);
cek(
  'App tanganiUndangKlien: tautkan akun signup (updateDoc klienId saja)',
  app.includes('updateDoc(refProfil, { klienId: input.klienId })') &&
    app.includes("'Akun client ditautkan'"),
);
cek(
  'App tanganiUndangKlien: tautan menolak email yang tidak cocok',
  app.includes('does not match the account that signed up'),
);
cek(
  'App tanganiUndangKlien: tautan menolak akun yang sudah tertaut / operator',
  app.includes('klienIdLama !== '),
);
cek(
  'MasterPage invite: menyebut signup publik + penautan akun signup',
  masterRata.includes('sign up themselves from the login page') &&
    masterRata.includes('to link a signed-up account') &&
    !masterRata.includes('There is no public'),
);

// ---------- firestore.rules: baca client ----------
// Ambil blok "Akses baca klien" saja (antara marker dan blok berikutnya).
const awalKlien = rules.indexOf('Akses baca klien');
const akhirKlien = rules.indexOf('Data acuan Keuangan', awalKlien);
const blokKlien = rules.slice(awalKlien, akhirKlien);
cek('rules punya helper adalahClient', rules.includes('function adalahClient()'));
cek('rules punya helper klienPemanggil', rules.includes('function klienPemanggil()'));
for (const koleksi of [
  'kontrak',
  'tagihan',
  'pembayaran',
  'denda',
  'mou',
  'commitment',
  'dokumen',
  'pengajuanKlien',
]) {
  cek(
    `rules baca client ${koleksi} (klienId == klienPemanggil())`,
    blokKlien.includes(`match /${koleksi}/{id}`) &&
      blokKlien.includes('resource.data.klienId == klienPemanggil()'),
  );
}
cek(
  'rules klien: get per id + list dilarang',
  blokKlien.includes('match /klien/{id}') &&
    blokKlien.includes('resource.data.id == klienPemanggil()') &&
    blokKlien.includes('allow list: if false'),
);
cek(
  'rules baca client TIDAK menyebut koleksi operator lain',
  !['audit', 'pesan', 'artikelKB', 'faq', 'sewa', 'prospect', 'order', 'meeting', 'task', 'tiket', 'umpanBalik', 'penerimaanAcuan'].some((k) =>
    blokKlien.includes(`/${k}/`),
  ),
);
cek(
  'rules pengajuanKlien client: klienId ATAU email pembuat',
  blokKlien.includes('resource.data.dibuatOleh == request.auth.token.email'),
);
cek(
  'rules client create pengajuanKlien (klienId milik sendiri)',
  rules.includes('request.resource.data.klienId == klienPemanggil()'),
);
cek(
  'rules Lacak publik tetap get-by-ID tanpa login',
  rules.includes('allow get: if request.auth == null;'),
);
cek(
  'rules operator generik tidak berubah (adalahOperator + mou/commitment)',
  rules.includes('adalahOperator()') &&
    rules.includes("'mou'") &&
    rules.includes("'commitment'"),
);
cek(
  'rules guard backfill-klienId-2026 ada',
  rules.includes('match /meta/backfill-klienId-2026'),
);
cek(
  'rules self-create operator dikunci ke userProfiles yang disiapkan',
  rules.includes(
    'exists(/databases/$(database)/documents/userProfiles/$(request.resource.data.email))',
  ),
);
cek(
  'rules self-create client: peran client + TANPA klienId + email == token',
  rules.includes("request.resource.data.peran == 'client'") &&
    rules.includes("!('klienId' in request.resource.data)") &&
    rules.includes(
      'request.resource.data.email == request.auth.token.email',
    ),
);
cek(
  'rules operator boleh membuat profil operator/user/verifikator/client (klienId wajib untuk client)',
  rules.includes(
    "request.resource.data.peran in ['operator', 'user', 'verifikator', 'client']",
  ) && rules.includes('request.resource.data.klienId is string'),
);
cek(
  'rules update users: klienId tidak bisa diubah',
  rules.includes(
    "request.resource.data.get('klienId', '') == resource.data.get('klienId', '')",
  ),
);
cek(
  'rules memuat peringatan publish SEBELUM merge',
  rules.includes('publikasikan') && rules.includes('SEBELUM merge'),
);

// ---------- muatDataKlien (firestoreStore.ts) ----------
cek(
  'muatDataKlien memfilter klienId + satker',
  store.includes('muatDataKlien') &&
    store.includes("where('klienId', '==', klienId)") &&
    store.includes("where('satker.kode', '==', satkerKode)"),
);
cek(
  'muatDataKlien: dokumen hanya filter klienId (tanpa satker)',
  store.includes('dokumen tidak punya field satker'),
);
cek(
  'muatDataKlien: pengajuanKlien juga lewat email pembuat',
  store.includes("where('dibuatOleh', '==', dibuatOlehEmail)"),
);

// ---------- seed: klienId terdenormalisasi ----------
const tagihanTanpa = DATA_NYATA.tagihan.filter((t) => !t.klienId);
const pembayaranTanpa = DATA_NYATA.pembayaran.filter((p) => !p.klienId);
const dendaTanpa = DATA_NYATA.denda.filter((d) => !d.klienId);
const dokumenTanpa = DATA_NYATA.dokumen.filter((d) => !d.klienId);
cek('seed tagihan 42 semua punya klienId', DATA_NYATA.tagihan.length === 42 && tagihanTanpa.length === 0, `${tagihanTanpa.length} tanpa klienId`);
cek('seed pembayaran 45 semua punya klienId', DATA_NYATA.pembayaran.length === 45 && pembayaranTanpa.length === 0, `${pembayaranTanpa.length} tanpa klienId`);
cek('seed denda 12 semua punya klienId', DATA_NYATA.denda.length === 12 && dendaTanpa.length === 0, `${dendaTanpa.length} tanpa klienId`);
cek('seed dokumen 102 semua punya klienId', DATA_NYATA.dokumen.length === 102 && dokumenTanpa.length === 0, `${dokumenTanpa.length} tanpa klienId`);
cek(
  'seed rantai klienId benar (verifikasiHasilBackfillKlienId lolos)',
  verifikasiHasilBackfillKlienId(DATA_NYATA).length === 0,
  verifikasiHasilBackfillKlienId(DATA_NYATA).join(' | '),
);
cek(
  'seed MoU tepat 3 tertaut',
  DATA_NYATA.mou.filter((m) => m.klienId).length === 3,
);
cek(
  'seed MoU 035→KLN-030, 043→KLN-014, 045→KLN-009',
  DATA_NYATA.mou.find((m) => m.id === '035/RRI-PLB/KJM.02.04/08/2026')?.klienId === 'KLN-030' &&
    DATA_NYATA.mou.find((m) => m.id === '043/RRI-PLB/KJM.02.04/10/2026')?.klienId === 'KLN-014' &&
    DATA_NYATA.mou.find((m) => m.id === '045/RRI-PLB/KJM.02.04/10/2026')?.klienId === 'KLN-009',
);
cek(
  'seed MoU near-miss 039 TIDAK tertaut',
  DATA_NYATA.mou.find((m) => m.id === '039/RRI-PLB/KJM.02.04/10/2026')?.klienId === undefined,
);
cek(
  'seed Commitment 0 tertaut',
  DATA_NYATA.commitment.filter((c) => c.klienId).length === 0,
);
cek(
  'generator MoU (impor-mou.py) punya KLIEN_MOU yang sama',
  ['"035/RRI-PLB/KJM.02.04/08/2026": "KLN-030"',
   '"043/RRI-PLB/KJM.02.04/10/2026": "KLN-014"',
   '"045/RRI-PLB/KJM.02.04/10/2026": "KLN-009"'].every((s) => generatorMou.includes(s)),
);
cek(
  'KLIEN_MOU rencana == 3 entri yang diharapkan',
  JSON.stringify(KLIEN_MOU) ===
    JSON.stringify({
      '035/RRI-PLB/KJM.02.04/08/2026': 'KLN-030',
      '043/RRI-PLB/KJM.02.04/10/2026': 'KLN-014',
      '045/RRI-PLB/KJM.02.04/10/2026': 'KLN-009',
    }),
);
// GAP yang ditandai (bukan kegagalan): semua email klien kosong.
const emailKosong = DATA_NYATA.klien.filter((k) => !k.email).length;
cek('GAP: semua 33 klien tanpa email (invite pakai email asli)', emailKosong === 33, `${emailKosong}/33 kosong`);
cek(
  'GAP: belum ada klien yang ditandai punya akun (akunKlienDibuat)',
  DATA_NYATA.klien.filter((k) => k.akunKlienDibuat).length === 0,
);

// ---------- backfill: rencana ----------
cek(
  'backfill cakupan PERSIS 5 koleksi',
  JSON.stringify(KOLEKSI_BACKFILL_KLIENID) ===
    JSON.stringify(['tagihan', 'pembayaran', 'denda', 'dokumen', 'mou']),
);
cek(
  'guard backfill berbeda dari semua guard lain',
  new Set([
    ID_GUARD_BACKFILL_KLIENID,
    ID_GUARD_MIGRASI_PERTAMA,
    ID_GUARD_REMIGRASI_KONTRAK,
    ID_GUARD_MIGRASI_MOU,
    ID_GUARD_MIGRASI_COMMITMENT,
  ]).size === 5,
  ID_GUARD_BACKFILL_KLIENID,
);
cek(
  'hitungan backfill diharapkan 42/45/12/102/44',
  HITUNGAN_BACKFILL_DIHARAPKAN.tagihan === 42 &&
    HITUNGAN_BACKFILL_DIHARAPKAN.pembayaran === 45 &&
    HITUNGAN_BACKFILL_DIHARAPKAN.denda === 12 &&
    HITUNGAN_BACKFILL_DIHARAPKAN.dokumen === 102 &&
    HITUNGAN_BACKFILL_DIHARAPKAN.mou === 44,
);
cek(
  'prakondisi backfill lolos pada hitungan seed',
  periksaPrakondisiBackfillKlienId({
    jumlahTagihan: 42,
    jumlahPembayaran: 45,
    jumlahDenda: 12,
    jumlahDokumen: 102,
    jumlahMou: 44,
    indukHilang: [],
  }).length === 0,
);
cek(
  'prakondisi backfill MENOLAK hitungan live berubah',
  periksaPrakondisiBackfillKlienId({
    jumlahTagihan: 41,
    jumlahPembayaran: 45,
    jumlahDenda: 12,
    jumlahDokumen: 102,
    jumlahMou: 44,
    indukHilang: [],
  }).length > 0,
);
cek(
  'prakondisi backfill MENOLAK induk hilang',
  periksaPrakondisiBackfillKlienId({
    jumlahTagihan: 42,
    jumlahPembayaran: 45,
    jumlahDenda: 12,
    jumlahDokumen: 102,
    jumlahMou: 44,
    indukHilang: ['tagihan TGH-XXX'],
  }).length > 0,
);
cek(
  'verifikasi backfill MENOLAK klienId yang salah',
  verifikasiHasilBackfillKlienId({
    ...DATA_NYATA,
    tagihan: DATA_NYATA.tagihan.map((t, i) =>
      i === 0 ? { ...t, klienId: 'KLN-999' } : t,
    ),
  }).length > 0,
);
cek(
  'verifikasi backfill MENOLAK MoU tertaut keempat',
  verifikasiHasilBackfillKlienId({
    ...DATA_NYATA,
    mou: DATA_NYATA.mou.map((m, i) =>
      i === 0 ? { ...m, klienId: 'KLN-001' } : m,
    ),
  }).length > 0,
);

// ---------- portal: 7 bagian + penyaringan + tanpa jalan admin ----------
for (const bagian of [
  'My Cooperation',
  'Plan a Campaign',
  'Submit a Request',
  'Book a Free Call',
  'Our Services',
  'Additional Services',
  'Help & Contact',
]) {
  cek(`portal memuat bagian "${bagian}"`, portal.includes(bagian));
}
cek(
  'portal memakai PlanCampaign + Ajukan + BookingKonsultasi + DetailKerjaSama yang sudah ada',
  portal.includes("from './PlanCampaign'") &&
    portal.includes("from './Ajukan'") &&
    portal.includes('BookingKonsultasi') &&
    portal.includes('DetailKerjaSama'),
);
cek(
  'portal memakai layanan + contoh kampanye landing',
  portal.includes('LAYANAN_MARKLO') && portal.includes('KAMPANYE_MARKLO'),
);
cek(
  'portal menyaring kontrak/MoU/Commitment menurut klienId',
  portal.includes('k.klienId === klienId') &&
    portal.includes('m.klienId === klienId') &&
    portal.includes('c.klienId === klienId'),
);
cek(
  'portal menampilkan Remaining Days + Payment Status',
  portal.includes('sisaHariKerjaSama') &&
    portal.includes('sisaHariMou') &&
    portal.includes('statusPembayaranKontrak'),
);
cek(
  'portal TIDAK mengimpor modul admin (MasterPage/MODULES/bolehAksi)',
  !portal.includes('MasterPage') &&
    !portal.includes('MODULES') &&
    !portal.includes('bolehAksi'),
);
cek(
  'portal punya Sign out',
  portal.includes('Sign out'),
);

// ---------- Ajukan: nomor referensi ----------
cek(
  'Ajukan menampilkan nomor referensi di pesan sukses',
  ajukan.includes('reference number is'),
);
cek(
  'App kirimPengajuanPublik mengembalikan { galat, id }',
  app.includes('return { galat: null, id }'),
);
cek(
  'App kirimPengajuanPublik menerima klienId (portal)',
  app.includes('kirimPengajuanPublik(input, user.klienId)'),
);

// ---------- Lacak tetap publik + total kontrol ----------
const lacakPln = cariKerjaSama(DATA_NYATA, '0603/PKS/RRI.PLB/01/2026');
cek(
  'Lacak publik: PKS PLN tetap ditemukan',
  lacakPln !== null && lacakPln.kontrak.nomorPks === '0603/PKS/RRI.PLB/01/2026',
);
cek(
  'Lacak publik: nomor salah tetap tidak ditemukan',
  cariKerjaSama(DATA_NYATA, 'TIDAK-ADA/000') === null,
);
const k = hitungTotalKontrol(DATA_NYATA);
cek('total kontrol nilaiKontrak', k.nilaiKontrak === 441863375, `${k.nilaiKontrak}`);
cek('total kontrol totalTagihan', k.totalTagihan === 376414124, `${k.totalTagihan}`);
cek('total kontrol totalPembayaranTerverifikasi', k.totalPembayaranTerverifikasi === 362329255, `${k.totalPembayaranTerverifikasi}`);
cek('total kontrol sisaPiutang', k.sisaPiutang === 14084869, `${k.sisaPiutang}`);
cek('total kontrol totalDenda', k.totalDenda === 6219250, `${k.totalDenda}`);
cek('total kontrol totalPenerimaanAcuan', k.totalPenerimaanAcuan === 257590368, `${k.totalPenerimaanAcuan}`);

if (gagal > 0) {
  console.error(`\n${gagal} asersi GAGAL.`);
  process.exitCode = 1;
} else {
  console.log('\nSemua asersi login dua peran lolos.');
}

// Verifikasi model EMPAT PERAN (keputusan pengguna 19/11/2026 20:41 +
// 20:43 WIB, menggantikan model DUA PERAN PR #121) — TANPA Firestore.
// - Field peran + validasi (peranDariProfil murni): 'client' |
//   'operator' | 'user' | 'verifikator', huruf kecil persis;
//   'Operator' kapital DITOLAK (temuan 19/11/2026).
// - Matriks hak akses (permissions.ts): operator semua aksi +
//   admin (kelolaAkun, jalankanMigrasi, kelolaMaster, lihatAudit,
//   kunciLaporan); user aksi operasional KECUALI admin +
//   verifikasiLaporan; verifikator HANYA verifikasiLaporan;
//   client TIDAK SATU PUN aksi tulis.
// - Akun internal: operator membuat akun operator/user/verifikator
//   dari Master & Users lewat secondary FirebaseApp (sesi operator
//   tidak terganti); client TIDAK BISA dibuat dari jalur itu dan
//   signup publik tetap selalu 'client' tanpa pilihan peran.
// - Checklist verifikasi laporan (Reports): satu dokumen per jenis
//   + periode di koleksi `verifikasiLaporan`; verifikator
//   mencentang + menyimpan, peran lain read-only; tidak memblokir.
// - firestore.rules: baca operasional untuk tiga peran internal,
//   tulis hanya operator + user, verifikator tulis HANYA checklist,
//   client tetap hanya datanya sendiri; rules WAJIB dipublikasikan
//   di console SEBELUM merge.
// - Total kontrak PNBP TIDAK berubah: 42 kontrak, Rp441.863.375.
// Keluar bukan-nol bila ada asersi gagal.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_NYATA } from '../src/lib/seedNyata';
import { hitungTotalKontrol } from '../src/lib/derive';
import { peranDariProfil, peranDikenal } from '../src/lib/auth';
import { LABEL_PERAN, adalahInternal, bolehAksi } from '../src/lib/permissions';
import {
  ITEM_CHECKLIST_DEFAULT,
  checklistDefault,
  idChecklist,
  terapkanChecklistTersimpan,
} from '../src/lib/verifikasiLaporan';
import { SATKER_PILOT } from '../src/lib/master';

// Dijalankan dari root repo — berkas dibaca saat runtime, jadi path
// diambil dari cwd, bukan dari lokasi bundle.
const baca = (relatif: string) =>
  readFileSync(join(process.cwd(), relatif), 'utf8');
const rules = baca('firestore.rules');
const app = baca('src/App.tsx');
const auth = baca('src/lib/auth.ts');
const login = baca('src/components/Login.tsx');
const master = baca('src/modules/MasterPage.tsx');
const reporting = baca('src/modules/Reporting.tsx');
// Teks JSX terbelah baris (spasi/newline di sumber) — asersi salinan
// memakai versi yang diratakan spasi-nya, bukan sumber mentah.
const loginRata = login.replace(/\s+/g, ' ');

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
  'peranDariProfil user lolos',
  peranDariProfil({ peran: 'user' }).peran === 'user',
);
cek(
  'peranDariProfil verifikator lolos',
  peranDariProfil({ peran: 'verifikator' }).peran === 'verifikator',
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
cekLempar(
  "peranDariProfil 'Operator' kapital DITOLAK",
  () => peranDariProfil({ peran: 'Operator' }),
  true,
);
cekLempar(
  'peranDariProfil peran kosong DITOLAK',
  () => peranDariProfil({}),
  true,
);
cekLempar(
  "peranDariProfil 'admin' DITOLAK",
  () => peranDariProfil({ peran: 'admin' }),
  true,
);
cek(
  'peranDikenal: empat peran dikenal, client bukan internal',
  peranDikenal('operator') &&
    peranDikenal('user') &&
    peranDikenal('verifikator') &&
    peranDikenal('client') &&
    !peranDikenal('Operator') &&
    !peranDikenal('admin'),
);
cek(
  'adalahInternal: operator/user/verifikator ya, client tidak',
  adalahInternal('operator') &&
    adalahInternal('user') &&
    adalahInternal('verifikator') &&
    !adalahInternal('client'),
);
cek(
  'LABEL_PERAN: empat peran',
  LABEL_PERAN.operator === 'Operator' &&
    LABEL_PERAN.user === 'User' &&
    LABEL_PERAN.verifikator === 'Verifikator' &&
    LABEL_PERAN.client === 'Client',
);

// ---------- matriks hak akses ----------
cek(
  'operator: semua aksi admin + operasional',
  bolehAksi('operator', 'kelolaAkun') &&
    bolehAksi('operator', 'jalankanMigrasi') &&
    bolehAksi('operator', 'kelolaMaster') &&
    bolehAksi('operator', 'lihatAudit') &&
    bolehAksi('operator', 'kunciLaporan') &&
    bolehAksi('operator', 'verifikasiLaporan') &&
    bolehAksi('operator', 'tambahKontrak') &&
    bolehAksi('operator', 'setujuiPengajuanKlien'),
);
cek(
  'user: operasional ya, admin + verifikasi tidak',
  bolehAksi('user', 'tambahKontrak') &&
    bolehAksi('user', 'catatPembayaran') &&
    bolehAksi('user', 'kelolaMeeting') &&
    bolehAksi('user', 'setujuiPengajuanKlien') &&
    bolehAksi('user', 'tolakPengajuanKlien') &&
    !bolehAksi('user', 'kelolaAkun') &&
    !bolehAksi('user', 'jalankanMigrasi') &&
    !bolehAksi('user', 'kelolaMaster') &&
    !bolehAksi('user', 'lihatAudit') &&
    !bolehAksi('user', 'verifikasiLaporan') &&
    !bolehAksi('user', 'kunciLaporan'),
);
cek(
  'verifikator: HANYA verifikasiLaporan',
  bolehAksi('verifikator', 'verifikasiLaporan') &&
    !bolehAksi('verifikator', 'tambahKontrak') &&
    !bolehAksi('verifikator', 'kelolaMaster') &&
    !bolehAksi('verifikator', 'kunciLaporan') &&
    !bolehAksi('verifikator', 'kelolaAkun') &&
    !bolehAksi('verifikator', 'setujuiPengajuanKlien'),
);
cek(
  'client: TIDAK SATU PUN aksi tulis',
  !bolehAksi('client', 'tambahKontrak') &&
    !bolehAksi('client', 'verifikasiLaporan') &&
    !bolehAksi('client', 'kelolaAkun') &&
    !bolehAksi('client', 'setujuiPengajuanKlien'),
);

// ---------- checklist verifikasi laporan ----------
cek(
  'checklist default: bulanan 5, piutang 4, kantor-pusat 3 item',
  ITEM_CHECKLIST_DEFAULT.bulanan.length === 5 &&
    ITEM_CHECKLIST_DEFAULT.piutang.length === 4 &&
    ITEM_CHECKLIST_DEFAULT['kantor-pusat'].length === 3,
);
cek(
  'idChecklist bulanan-2026-02',
  idChecklist('bulanan', '2026-02') === 'bulanan-2026-02',
);
cek(
  'checklistDefault: semua item belum dicentang',
  (() => {
    const c = checklistDefault('piutang', '2026-02', SATKER_PILOT);
    return (
      c.id === 'piutang-2026-02' &&
      c.item.length === 4 &&
      c.item.every((i) => i.dicentang === false)
    );
  })(),
);
cek(
  'terapkanChecklistTersimpan: centang dikenal dipertahankan, item baru belum dicentang, item asing dibuang',
  (() => {
    const bawaan = checklistDefault('bulanan', '2026-02', SATKER_PILOT);
    const gabung = terapkanChecklistTersimpan(
      {
        item: [
          { id: 'total-kontrol', dicentang: true },
          { id: 'item-lama-tidak-ada', dicentang: true },
        ],
        diperiksaOleh: 'Verifikator',
      },
      bawaan,
    );
    return (
      gabung.item.find((i) => i.id === 'total-kontrol')?.dicentang === true &&
      gabung.item.find((i) => i.id === 'tagihan-periode')?.dicentang === false &&
      gabung.item.every((i) => i.id !== 'item-lama-tidak-ada') &&
      gabung.diperiksaOleh === 'Verifikator'
    );
  })(),
);
cek(
  'terapkanChecklistTersimpan: tersimpan tidak valid -> default',
  (() => {
    const bawaan = checklistDefault('bulanan', '2026-02', SATKER_PILOT);
    const gabung = terapkanChecklistTersimpan('bukan-objek', bawaan);
    return gabung.item.every((i) => i.dicentang === false);
  })(),
);

// ---------- akun internal: secondary app, tanpa ganti sesi ----------
cek(
  'auth: buatAkunInternal memakai FirebaseApp kedua bernama buat-akun-internal',
  auth.includes("initializeApp(firebaseConfig, 'buat-akun-internal')") &&
    auth.includes('deleteApp(appKedua)'),
);
cek(
  'auth: buatAkunInternal menolak peran client',
  auth.includes("peran !== 'operator' && peran !== 'user' && peran !== 'verifikator'"),
);
cek(
  'auth: signup publik tetap selalu client (tanpa parameter peran)',
  auth.includes("peran: 'client',") &&
    !/export async function daftarDenganEmail\([^)]*peran/.test(auth),
);
cek(
  'App: pulihkan sesi memakai peranDikenal (empat peran)',
  app.includes('if (peranDikenal(peran))'),
);
cek(
  'App: handler buat akun internal disambung ke MasterPage',
  app.includes('tanganiBuatAkunInternal') &&
    app.includes('onBuatAkunInternal={tanganiBuatAkunInternal}'),
);
cek(
  'App: setujui/tolak submission memakai bolehAksi (operator + user)',
  app.includes("bolehAksi(penggunaAktif.peran, 'setujuiPengajuanKlien')") &&
    app.includes("bolehAksi(penggunaAktif.peran, 'tolakPengajuanKlien')"),
);
cek(
  'App: audit Firestore ditulis sesi operator + user',
  app.includes("penggunaAktif.peran === 'operator' || penggunaAktif.peran === 'user'"),
);

// ---------- Master & Users: kartu buat akun internal ----------
cek(
  'MasterPage: kartu Create Internal Account ada, tiga peran internal saja',
  master.includes('Create Internal Account') &&
    master.includes('BuatAkunInternalInput') &&
    master.includes("value=\"user\"") &&
    master.includes("value=\"verifikator\"") &&
    master.includes("value=\"operator\""),
);
cek(
  'MasterPage: kartu buat akun internal TIDAK menawarkan client',
  (() => {
    const awal = master.indexOf('function BagianBuatAkunInternal');
    const akhir = master.indexOf('export default function MasterPage');
    if (awal < 0 || akhir < 0 || akhir < awal) return false;
    return !master.slice(awal, akhir).includes('value="client"');
  })(),
);
cek(
  'MasterPage: kartu buat akun internal hanya tampil untuk kelolaAkun',
  master.includes("bolehAksi(user.peran, 'kelolaAkun')"),
);

// ---------- Reports: panel checklist ----------
cek(
  'Reporting: panel checklist verifikasi ada + simpan hanya verifikator',
  reporting.includes('PanelChecklistVerifikasi') &&
    reporting.includes('simpanChecklist(checklist') &&
    reporting.includes("bolehAksi(user.peran, 'verifikasiLaporan')"),
);
cek(
  'Reporting: checklist read-only untuk peran lain (teks penjelas)',
  reporting.includes('only the Verifikator can change it'),
);

// ---------- Login: empat peran, signup tetap client saja ----------
cek(
  'Login: keterangan akses menyebut empat peran',
  loginRata.includes('Operators, Users, Verifikators, and clients sign in here'),
);
cek(
  'Login: signup tetap membuat akun client (tanpa pilihan peran)',
  loginRata.includes('This creates a client account'),
);

// ---------- firestore.rules ----------
cek(
  'rules: helper peran internal ada',
  rules.includes('function adalahUser()') &&
    rules.includes('function adalahVerifikator()') &&
    rules.includes('function adalahStafInternal()') &&
    rules.includes('function bolehTulisOperasional()'),
);
cek(
  'rules: baca operasional untuk staf internal, tulis operator + user',
  rules.includes('&& adalahStafInternal()') &&
    rules.includes('&& bolehTulisOperasional()'),
);
cek(
  'rules: blok verifikasiLaporan — tulis HANYA verifikator, hapus dilarang',
  rules.includes('match /verifikasiLaporan/{id}') &&
    rules.includes('allow create: if adalahVerifikator()') &&
    rules.includes('allow update: if adalahVerifikator()'),
);
cek(
  'rules: operator boleh membuat profil operator/user/verifikator/client',
  rules.includes(
    "request.resource.data.peran in ['operator', 'user', 'verifikator', 'client']",
  ),
);
cek(
  'rules: baca client tetap hanya di bawah klienId sendiri',
  rules.includes('resource.data.klienId == klienPemanggil()'),
);
cek(
  'rules: peringatan publikasikan SEBELUM merge ada',
  rules.includes('publikasikan') && rules.includes('SEBELUM merge PR'),
);

// ---------- total kontrol TIDAK berubah ----------
const k = hitungTotalKontrol(DATA_NYATA);
cek('total kontrol nilaiKontrak', k.nilaiKontrak === 441863375, `${k.nilaiKontrak}`);
cek('total kontrol totalTagihan', k.totalTagihan === 376414124, `${k.totalTagihan}`);
cek('total kontrol totalPembayaranTerverifikasi', k.totalPembayaranTerverifikasi === 362329255, `${k.totalPembayaranTerverifikasi}`);
cek('total kontrol sisaPiutang', k.sisaPiutang === 14084869, `${k.sisaPiutang}`);
cek('total kontrol totalDenda', k.totalDenda === 6219250, `${k.totalDenda}`);
cek('total kontrol totalPenerimaanAcuan', k.totalPenerimaanAcuan === 257590368, `${k.totalPenerimaanAcuan}`);
cek(
  'total kontrak: 42 kontrak',
  DATA_NYATA.kontrak.length === 42,
  `${DATA_NYATA.kontrak.length}`,
);

if (gagal > 0) {
  console.error(`\n${gagal} asersi GAGAL.`);
  process.exitCode = 1;
} else {
  console.log('\nSemua asersi empat peran lolos.');
}

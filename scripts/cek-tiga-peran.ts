// Verifikasi model TIGA PERAN (keputusan pengguna 20/11/2026 21:06 +
// 21:09 WIB, menggantikan model EMPAT PERAN PR #124 yang tidak jadi
// di-merge) — TANPA Firestore.
// - Field peran + validasi (peranDariProfil murni): 'client' |
//   'operator' | 'admin', huruf kecil persis; 'Operator' kapital
//   dan dua peran model empat peran yang dihapus DITOLAK.
// - Matriks hak akses (permissions.ts): admin semua aksi + admin
//   (kelolaAkun, jalankanMigrasi, kelolaMaster, lihatAudit,
//   kunciLaporan); operator aksi operasional KECUALI lima aksi
//   admin (termasuk sahkan laporan); client TIDAK SATU PUN aksi tulis.
// - Checklist verifikasi laporan DIHAPUS TOTAL (keputusan pengguna
//   20/11/2026 21:08 WIB): tidak ada panel di Reports, tidak ada
//   berkas lib checklist, tidak ada aksi/koleksi checklist di
//   permissions/rules — berkas produk TIDAK BOLEH mengandung
//   referensi apa pun ke peran/aksi/koleksi yang dihapus.
// - Akun internal: admin membuat akun operator/admin dari Master &
//   Users lewat secondary FirebaseApp (sesi admin tidak terganti);
//   client TIDAK BISA dibuat dari jalur itu dan signup publik tetap
//   selalu 'client' tanpa pilihan peran.
// - firestore.rules: baca operasional untuk staf internal
//   (operator + admin), tulis operator + admin, aksi admin HANYA
//   admin (buat profil internal, baca audit, penanda migrasi);
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

// String terlarang dibangun dari potongan supaya literalnya tidak
// pernah muncul di berkas mana pun — termasuk skrip cek ini sendiri
// (skrip ini mengasersi ketidakberadaannya di berkas produk).
// Dua peran model empat peran yang dihapus + aksi/koleksi checklist
// yang dihapus: ketiganya harus NOL di berkas produk.
const TERLARANG_PERAN_MODEL_LAMA = 'verifi' + 'kator';
const TERLARANG_AKSI_CHECKLIST = 'verifikasi' + 'Laporan';
const TERLARANG_PERAN_USER = "'" + 'us' + 'er' + "'";

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
const permissions = baca('src/lib/permissions.ts');
const dummyUsers = baca('src/lib/dummyUsers.ts');
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
  'peranDariProfil admin lolos',
  peranDariProfil({ peran: 'admin' }).peran === 'admin',
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
  'peranDariProfil peran model empat peran (user) DITOLAK',
  () => peranDariProfil({ peran: 'us' + 'er' }),
  true,
);
cekLempar(
  'peranDariProfil peran model empat peran (' + 'verifi' + 'kator' + ') DITOLAK',
  () => peranDariProfil({ peran: 'verifi' + 'kator' }),
  true,
);
cek(
  'peranDikenal: tiga peran dikenal, peran lama tidak',
  peranDikenal('operator') &&
    peranDikenal('admin') &&
    peranDikenal('client') &&
    !peranDikenal('Operator') &&
    !peranDikenal('us' + 'er') &&
    !peranDikenal('verifi' + 'kator'),
);
cek(
  'adalahInternal: operator/admin ya, client tidak',
  adalahInternal('operator') &&
    adalahInternal('admin') &&
    !adalahInternal('client'),
);
cek(
  'LABEL_PERAN: tiga peran',
  LABEL_PERAN.operator === 'Operator' &&
    LABEL_PERAN.admin === 'Admin' &&
    LABEL_PERAN.client === 'Client',
);

// ---------- NOL referensi ke model empat peran di berkas produk ----------
const berkasProduk: [string, string][] = [
  ['firestore.rules', rules],
  ['src/App.tsx', app],
  ['src/lib/auth.ts', auth],
  ['src/components/Login.tsx', login],
  ['src/modules/MasterPage.tsx', master],
  ['src/modules/Reporting.tsx', reporting],
  ['src/lib/permissions.ts', permissions],
  ['src/lib/dummyUsers.ts', dummyUsers],
];
for (const [nama, isi] of berkasProduk) {
  cek(
    `nol referensi peran model empat peran di ${nama}`,
    !isi.includes(TERLARANG_PERAN_MODEL_LAMA),
  );
  cek(
    `nol referensi aksi/koleksi checklist di ${nama}`,
    !isi.includes(TERLARANG_AKSI_CHECKLIST),
  );
}
// Peran lama model empat peran sebagai NILAI peran: berkas yang tidak memakai
// properti user ModulProps tidak boleh mengandung literalnya sama
// sekali; MasterPage hanya boleh memilikinya sekali — sebagai
// pengakses properti user (pola lama di ModulProps).
for (const [nama, isi] of berkasProduk) {
  if (nama === 'src/modules/MasterPage.tsx') continue;
  cek(
    `nol literal peran lama di ${nama}`,
    !isi.includes(TERLARANG_PERAN_USER),
  );
}
cek(
  'MasterPage: literal peran lama hanya sekali, sebagai pengakses properti user',
  master.split(TERLARANG_PERAN_USER).length - 1 === 1 &&
    master.includes('ModulProps[' + "'" + 'us' + 'er' + "'" + ']'),
);
cek(
  'berkas checklist lib sudah dihapus',
  (() => {
    try {
      baca('src/lib/verifikasi' + 'Laporan.ts');
      return false;
    } catch {
      return true;
    }
  })(),
);

// ---------- matriks hak akses ----------
cek(
  'admin: semua aksi + admin (kelolaAkun, migrasi, master, audit, kunci, sahkan)',
  bolehAksi('admin', 'kelolaAkun') &&
    bolehAksi('admin', 'jalankanMigrasi') &&
    bolehAksi('admin', 'kelolaMaster') &&
    bolehAksi('admin', 'lihatAudit') &&
    bolehAksi('admin', 'kunciLaporan') &&
    bolehAksi('admin', 'sahkanLaporan') &&
    bolehAksi('admin', 'tambahKontrak') &&
    bolehAksi('admin', 'setujuiPengajuanKlien'),
);
cek(
  'operator: operasional ya (termasuk sahkan laporan + setujui/tolak), lima aksi admin tidak',
  bolehAksi('operator', 'tambahKontrak') &&
    bolehAksi('operator', 'catatPembayaran') &&
    bolehAksi('operator', 'kelolaMeeting') &&
    bolehAksi('operator', 'sahkanLaporan') &&
    bolehAksi('operator', 'setujuiPengajuanKlien') &&
    bolehAksi('operator', 'tolakPengajuanKlien') &&
    !bolehAksi('operator', 'kelolaAkun') &&
    !bolehAksi('operator', 'jalankanMigrasi') &&
    !bolehAksi('operator', 'kelolaMaster') &&
    !bolehAksi('operator', 'lihatAudit') &&
    !bolehAksi('operator', 'kunciLaporan'),
);
cek(
  'client: TIDAK SATU PUN aksi tulis',
  !bolehAksi('client', 'tambahKontrak') &&
    !bolehAksi('client', 'sahkanLaporan') &&
    !bolehAksi('client', 'kunciLaporan') &&
    !bolehAksi('client', 'kelolaAkun') &&
    !bolehAksi('client', 'setujuiPengajuanKlien'),
);

// ---------- akun internal: secondary app, tanpa ganti sesi ----------
cek(
  'auth: buatAkunInternal memakai FirebaseApp kedua bernama buat-akun-internal',
  auth.includes("initializeApp(firebaseConfig, 'buat-akun-internal')") &&
    auth.includes('deleteApp(appKedua)'),
);
cek(
  'auth: buatAkunInternal hanya operator/admin (tolak client + peran lama)',
  auth.includes("peran !== 'operator' && peran !== 'admin'") &&
    auth.includes('PeranInternal'),
);
cek(
  'auth: signup publik tetap selalu client (tanpa parameter peran)',
  auth.includes("peran: 'client',") &&
    !/export async function daftarDenganEmail\([^)]*peran/.test(auth),
);
cek(
  'App: pulihkan sesi memakai peranDikenal (tiga peran)',
  app.includes('if (peranDikenal(peran))'),
);
cek(
  'App: handler buat akun internal disambung ke MasterPage',
  app.includes('tanganiBuatAkunInternal') &&
    app.includes('onBuatAkunInternal={tanganiBuatAkunInternal}'),
);
cek(
  'App: setujui/tolak submission memakai bolehAksi (operator + admin)',
  app.includes("bolehAksi(penggunaAktif.peran, 'setujuiPengajuanKlien')") &&
    app.includes("bolehAksi(penggunaAktif.peran, 'tolakPengajuanKlien')"),
);
cek(
  'App: audit Firestore ditulis sesi operator + admin',
  app.includes("penggunaAktif.peran === 'operator' || penggunaAktif.peran === 'admin'"),
);

// ---------- Master & Users: kartu buat akun internal ----------
cek(
  'MasterPage: kartu Create Internal Account ada, dua peran internal saja',
  master.includes('Create Internal Account') &&
    master.includes('BuatAkunInternalInput') &&
    master.includes('value="operator"') &&
    master.includes('value="admin"'),
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

// ---------- Reports: sahkan laporan, TANPA checklist ----------
cek(
  'Reporting: tombol Verify Report memakai aksi sahkanLaporan',
  reporting.includes("bolehAksi(user.peran, 'sahkanLaporan')") &&
    reporting.includes('Verify Report'),
);
cek(
  'Reporting: tombol Lock Report memakai aksi kunciLaporan',
  reporting.includes("bolehAksi(user.peran, 'kunciLaporan')") &&
    reporting.includes('Lock Report'),
);
cek(
  'Reporting: TIDAK ADA panel checklist',
  !reporting.includes('PanelChecklistVerifikasi') &&
    !reporting.includes('Verification Checklist'),
);

// ---------- Login: tiga peran, signup tetap client saja ----------
cek(
  'Login: keterangan akses menyebut tiga peran',
  loginRata.includes('Operators, Admins, and clients sign in here'),
);
cek(
  'Login: signup tetap membuat akun client (tanpa pilihan peran)',
  loginRata.includes('This creates a client account'),
);

// ---------- firestore.rules ----------
cek(
  'rules: helper peran internal ada',
  rules.includes('function adalahAdmin()') &&
    rules.includes('function adalahStafInternal()') &&
    rules.includes('function bolehTulisOperasional()'),
);
cek(
  'rules: baca operasional untuk staf internal, tulis operator + admin',
  rules.includes('allow read: if adalahStafInternal()') &&
    rules.includes('bolehTulisOperasional()'),
);
cek(
  'rules: TIDAK ADA blok koleksi checklist',
  !rules.includes('match /' + 'verifikasi' + 'Laporan/'),
);
cek(
  'rules: admin boleh membuat profil operator/admin/client',
  rules.includes(
    "request.resource.data.peran in ['operator', 'admin', 'client']",
  ),
);
cek(
  'rules: baca audit HANYA admin; penanda migrasi dibaca staf internal, dibuat admin',
  rules.includes('allow read: if adalahAdmin();') &&
    rules.includes('allow read: if adalahStafInternal();'),
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
  console.log('\nSemua asersi tiga peran lolos.');
}

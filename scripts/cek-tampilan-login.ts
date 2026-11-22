// Verifikasi redesign halaman login (PR login-redesign-mixpanel,
// disetujui pengguna 2026-11-18 15:58 WIB): meniru TATA LETAK halaman
// sign-up/login Mixpanel (kolom tunggal terpusat ~400px, BUKAN
// split-screen) dengan re-skin warna RRI — Navy #0D2569 + Biru #2573E2.
// Asersi:
// - Kolom terpusat max-w-[400px]; split-screen lama HILANG (tidak ada
//   lagi kolom form lg:w-[49%] / panel foto lg:w-[51%]); panel foto
//   gedung RRI DIHAPUS dari Login.tsx (GEDUNG_RRI_DATA_URI tidak lagi
//   diimpor di sini; src/lib/gedungRri.ts tetap dipakai Beranda.tsx).
// - Logo lockup lengkap RRI di tengah atas (data URI terpisah
//   src/lib/logoRriLockup.ts, h-20); teks terpisah
//   "Radio Republik Indonesia" DIHAPUS dari Login.tsx karena teks itu
//   sudah ada di dalam gambar logo (duplikat bila dipertahankan).
// - Heading "Welcome Back" + subjudul lama dipertahankan.
// - Kotak keterangan akses mode login DIHAPUS 2026-11-20 22:05 WIB
//   (keputusan pengguna: semua user termasuk client sudah bisa masuk
//   di sini). Tidak ada lagi kalimat akses, ikon gembok di mode login,
//   maupun tautan ke Lacak dari halaman ini (Lacak tetap dijangkau
//   dari landing page). Kotak penjelasan mode signup dipertahankan:
//   tanpa pilihan peran ("no role to choose"), Admin menautkan akunnya.
//   SIGNUP PUBLIK (keputusan pengguna 19/11/2026 16:12 WIB): tautan
//   "Create account" ke mode signup ("Create your account"); mode
//   signup menjelaskan tanpa pilihan peran dan Admin menautkan akunnya.
// - Field Email + Password gaya Mixpanel: label tebal gelap di atas,
//   input pill putih (rounded-full), border tipis, placeholder abu-abu;
//   password tetap di layar yang sama (TIDAK ada alur email-first).
// - Satu tombol pill full-width Biru #2573E2 "Sign in" (hover navy).
// - Tombol sudut kiri atas "Back to Landing Page" (prop onKembali,
//   disambungkan di App.tsx ke halamanPublik 'beranda').
// - HANYA login email: TIDAK ada login sosial (tanpa tombol Google),
//   TIDAK ada warna ungu/violet pastel template (tidak ada class
//   violet-/purple- dan tidak ada #8263FF). Signup publik ADA sejak
//   19/11/2026 16:12 WIB (jalur 'Create account', selalu peran
//   client — lihat cek-login-dua-peran.ts untuk asersi signup).
// - Latar warm off-white #f5f2f2 + gradasi pucat biru/navy di bawah.
// - Mode contoh/dummy TETAP dipertahankan (tombol dummy Operator DAN
//   Client sejak dua peran 19/11/2026).
// - Tautan publik Ajukan TETAP tidak ada di halaman login (keputusan
//   pengguna 2026-11-15). Tautan ke Lacak dari halaman login DIHAPUS
//   2026-11-20 22:05 WIB bersama kotak keterangan akses; Lacak tetap
//   dijangkau dari landing page (footer "Track your Deal").
// Skrip ini membaca berkas sebagai teks. Keluar bukan-nol bila ada
// asersi gagal.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Dijalankan dari root repo (pola skrip cek lain).
const baca = (relatif: string) =>
  readFileSync(join(process.cwd(), relatif), 'utf8');
const login = baca('src/components/Login.tsx');
const app = baca('src/App.tsx');
// Fase 1 dual bahasa: teks Login pindah ke kamusUmum.ts (EN verbatim).
const kamusUmum = baca('src/lib/i18n/kamusUmum.ts');
// Teks JSX terbelah baris — asersi salinan memakai versi yang
// diratakan spasi-nya.
const loginRata = login.replace(/\s+/g, ' ');

const logoLockup = baca('src/lib/logoRriLockup.ts');

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};

cek(
  'Login: kolom terpusat max-w-[400px] (bukan split-screen)',
  login.includes('max-w-[400px]') &&
    login.includes('items-center justify-center'),
);
cek(
  'Login: split-screen lama hilang (tidak ada lg:w-[49%] / lg:w-[51%])',
  !login.includes('lg:w-[49%]') && !login.includes('lg:w-[51%]'),
);
cek(
  'Login: panel foto gedung DIHAPUS (tidak lagi diimpor dari gedungRri)',
  !login.includes("from '../lib/gedungRri'") &&
    !login.includes('GEDUNG_RRI_DATA_URI'),
);
cek(
  'Login: logo lockup lengkap di tengah atas (data URI terpisah, h-20, bukan mark saja)',
  login.includes("import { LOGO_RRI_LOCKUP_DATA_URI } from '../lib/logoRriLockup'") &&
    login.includes('src={LOGO_RRI_LOCKUP_DATA_URI}') &&
    login.includes('mx-auto h-20 w-auto') &&
    login.includes('alt="Logo RRI"') &&
    !login.includes('src="/logo-rri.svg"') &&
    logoLockup.includes('export const LOGO_RRI_LOCKUP_DATA_URI') &&
    logoLockup.includes('data:image/png;base64,'),
);
cek(
  'Login: teks terpisah "Radio Republik Indonesia" DIHAPUS (sudah di dalam gambar logo)',
  !login.includes('Radio Republik Indonesia'),
);
cek(
  'Login: heading "Welcome Back" + subjudul lama dipertahankan (di kamusUmum, EN verbatim; Login memakai kamus)',
  kamusUmum.includes('Welcome Back') &&
    kamusUmum.includes('Enter your credentials to access your account') &&
    login.includes('kamusUmum[bahasa]'),
);
cek(
  'Login: kotak keterangan akses mode login DIHAPUS (22:05 WIB) — tidak ada kalimat akses / "click here"; signup tetap ada',
  !loginRata.includes('Sign in with your account') &&
    !loginRata.includes('Operators, Admins, and clients sign in here') &&
    !loginRata.includes('click here') &&
    kamusUmum.includes('Create account') &&
    kamusUmum.includes('Create your account') &&
    kamusUmum.includes('This creates a client account') &&
    !loginRata.includes('Only designated officers can sign in here.') &&
    !loginRata.includes(
      'please use Track or Submit a Request on the landing page.',
    ) &&
    login.includes('Lock'),
);
cek(
  'Login: prop onLacak DIHAPUS — tidak ada lagi tautan ke Lacak dari halaman login; wiring onLacak di App.tsx kini 0x (kolom footer Client Portal dihapus 2026-11-21, Lacak tanpa tombol masuk dari landing)',
  !login.includes('onLacak') &&
    !login.includes('click here') &&
    !login.includes('onClick={onLacak}') &&
    app.split("onLacak={() => setHalamanPublik('lacak')}").length - 1 ===
      0,
);
cek(
  'Login: field Email + Password gaya Mixpanel (label tebal di atas, input pill putih)',
  login.includes('label') &&
    login.includes('font-bold text-[#0d2569]') &&
    login.includes('rounded-full border border-[#0d2569]/20 bg-white'),
);
cek(
  'Login: password di layar yang sama (tidak ada alur email-first)',
  login.includes('type="password"') &&
    login.includes('autoComplete="current-password"') &&
    !login.includes('Continue') &&
    !login.includes('Passkey'),
);
cek(
  'Login: tombol pill full-width Biru "Sign in" (hover navy)',
  login.includes('rounded-full bg-[#2573e2]') &&
    login.includes("hover:bg-[#0d2569]") &&
    kamusUmum.includes("'Sign in'") &&
    kamusUmum.includes("'Checking…'") &&
    login.includes('t.tombolMasuk'),
);
cek(
  'Login: tombol sudut kiri atas "Back to Landing Page" (prop onKembali)',
  kamusUmum.includes('Back to Landing Page') &&
    login.includes('t.kembaliKeLanding') &&
    login.includes('onKembali?: () => void') &&
    login.includes('absolute left-4 top-4'),
);
cek(
  'Login: App.tsx menyambungkan onKembali ke halamanPublik beranda',
  app.includes("onKembali={() => setHalamanPublik('beranda')}"),
);
cek(
  'Login: HANYA login email — tanpa tombol Google / sign-up klien',
  !login.includes('Continue with Google') &&
    !login.includes('>Google<') &&
    !login.includes('Sign up') &&
    !login.includes('Sign Up'),
);
cek(
  'Login: tanpa ungu/violet pastel template (tidak ada class violet-/purple- atau #8263FF)',
  !login.includes('violet-') &&
    !login.includes('purple-') &&
    !login.toLowerCase().includes('#8263ff'),
);
cek(
  'Login: latar warm off-white + gradasi pucat biru/navy di bawah',
  login.includes('bg-[#f5f2f2]') &&
    login.includes('bg-gradient-to-t') &&
    login.includes('from-[#2573e2]/15') &&
    login.includes('via-[#0d2569]/10'),
);
cek(
  'Login: mode contoh/dummy TETAP dipertahankan',
  login.includes('onLoginDummy') &&
    login.includes('DUMMY_USERS') &&
    kamusUmum.includes('Sign in as (Sample):') &&
    login.includes('t.masukSebagaiContoh'),
);
cek(
  'Login: TIDAK ADA tautan publik sama sekali (Ajukan tetap tidak ada; tautan ke Lacak sudah dihapus)',
  !login.includes("setHalamanPublik('ajukan')") &&
    !login.includes('Ajukan Permohonan') &&
    !login.includes('<a ') &&
    !login.includes('onLacak') &&
    !login.includes('click here'),
);

if (gagal > 0) {
  console.log(`\n${gagal} asersi GAGAL`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');

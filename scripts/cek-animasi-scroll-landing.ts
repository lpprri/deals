// Verifikasi animasi scroll landing DUA ARAH
// (perbaikan 19/11/2026 20:25 WIB — laporan pengguna: animasi landing
// hanya jalan saat scroll-down, tidak saat scroll-up).
// Akar masalah: dua IntersectionObserver di Marklo.tsx bersifat sekali
// jalan — callback set state true LALU disconnect, jadi elemen yang
// sudah tampil tidak pernah kembali ke keadaan awal dan masuk ulang
// tidak memutar animasi lagi.
// Perbaikan: observer tetap aktif; state = isIntersecting, jadi keluar
// viewport (ke arah mana pun) mereset elemen dan masuk ulang memutar
// animasi dari awal. Desain/timing/copy TIDAK berubah; hanya perilaku
// pemicu yang berubah.
// Asersi:
// - Reveal + Statistik memakai setTampil/setTerlihat(isIntersecting),
//   tanpa setX(true) sekali jalan dan tanpa disconnect di callback.
// - disconnect() hanya ada 2x, keduanya cleanup unmount.
// - CSS reveal + reduced-motion tidak berubah.
// - Jumlah pemakaian <Reveal>, durasi counter, dan default Reveal
//   (ambang/margin/tunda) tidak berubah.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Dijalankan dari root repo (pola skrip cek lain).
const baca = (relatif: string) =>
  readFileSync(join(process.cwd(), relatif), 'utf8');
const marklo = baca('src/modules/landing/Marklo.tsx');
const css = baca('src/index.css');

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};
const hitung = (teks: string, jarum: string) =>
  teks.split(jarum).length - 1;

// --- 1. Reveal: observer dua arah, bukan sekali jalan. ---
cek(
  'Reveal: callback memakai setTampil(entri[0].isIntersecting)',
  marklo.includes('setTampil(entri[0].isIntersecting)'),
);
cek(
  'Reveal: tidak ada lagi setTampil(true) sekali jalan',
  !marklo.includes('setTampil(true)'),
);
cek(
  'Reveal: keputusan dua arah dicatat di komentar komponen',
  marklo.includes('DUA ARAH') &&
    marklo.includes('scroll-down') &&
    marklo.includes('scroll-up'),
);

// --- 2. Statistik: counter jalan ulang tiap kali masuk viewport. ---
cek(
  'Statistik: callback memakai setTerlihat(entri[0].isIntersecting)',
  marklo.includes('setTerlihat(entri[0].isIntersecting)'),
);
cek(
  'Statistik: tidak ada lagi setTerlihat(true) sekali jalan',
  !marklo.includes('setTerlihat(true)'),
);

// --- 3. Tidak ada disconnect di dalam callback observer. ---
cek(
  'Observer: pengamat.disconnect() hanya 2x (cleanup unmount Reveal + Statistik)',
  hitung(marklo, 'pengamat.disconnect()') === 2,
  `ditemukan ${hitung(marklo, 'pengamat.disconnect()')}x`,
);
cek(
  'Observer: kedua disconnect adalah cleanup "return () => pengamat.disconnect();"',
  hitung(marklo, 'return () => pengamat.disconnect();') === 2,
  `ditemukan ${hitung(marklo, 'return () => pengamat.disconnect();')}x`,
);
cek(
  'Observer: tepat 2 IntersectionObserver di landing (Reveal + Statistik)',
  hitung(marklo, 'new IntersectionObserver(') === 2,
  `ditemukan ${hitung(marklo, 'new IntersectionObserver(')}x`,
);

// --- 4. useCountUp memulai ulang dari 0 saat aktif kembali. ---
cek(
  'useCountUp: efek bergantung pada aktif (jalan ulang tiap masuk viewport)',
  marklo.includes('}, [target, aktif, durasi]);'),
);
cek(
  'useCountUp: tidak aktif -> berhenti (nilai lama dipertahankan sampai jalan ulang)',
  marklo.includes('if (!aktif) return;'),
);

// --- 5. Desain/timing/copy tidak berubah. ---
cek(
  'Reveal: jumlah pemakaian <Reveal tetap 29',
  hitung(marklo, '<Reveal') === 29,
  `ditemukan ${hitung(marklo, '<Reveal')}x`,
);
cek(
  'Reveal: className tetap mk-reveal + mk-tampil bersyarat',
  marklo.includes("className={`mk-reveal ${tampil ? 'mk-tampil' : ''} ${className}`}"),
);
cek(
  'Reveal: default ambang 0.12, margin 0px, tunda 0 tidak berubah',
  marklo.includes('tunda = 0,') &&
    marklo.includes('ambang = 0.12,') &&
    marklo.includes("margin = '0px',"),
);
cek(
  'Reveal: transitionDelay tunda tetap dipakai',
  marklo.includes('transitionDelay: `${tunda}ms`'),
);
cek(
  'Statistik: ambang observer tetap 0.2',
  marklo.includes('{ threshold: 0.2 }'),
);
cek(
  'Counter: durasi default useCountUp 1600 dan Statistik 1800 tidak berubah',
  marklo.includes('durasi = 1600') &&
    marklo.includes('useCountUp(stat.nilai, aktif, 1800)'),
);
cek(
  'CSS: .mk-reveal awal tetap opacity 0 + blur 8px + translateY 24px, transisi 0.7s',
  css.includes('.mk-reveal {') &&
    css.includes('opacity: 0;') &&
    css.includes('filter: blur(8px);') &&
    css.includes('transform: translateY(24px);') &&
    css.includes('opacity 0.7s ease,'),
);
cek(
  'CSS: .mk-reveal.mk-tampil tetap opacity 1 + blur 0 + transform none',
  css.includes('.mk-reveal.mk-tampil {') &&
    css.includes('opacity: 1;') &&
    css.includes('filter: blur(0);') &&
    css.includes('transform: none;'),
);
cek(
  'CSS: .mk-reveal-dalam tetap 48px + blur 12px + durasi 0.9s',
  css.includes('.mk-reveal.mk-reveal-dalam {') &&
    css.includes('transform: translateY(48px);') &&
    css.includes('filter: blur(12px);') &&
    css.includes('transition-duration: 0.9s;'),
);
cek(
  'CSS: prefers-reduced-motion tetap mematikan reveal (opacity 1, tanpa transisi)',
  css.includes('@media (prefers-reduced-motion: reduce)') &&
    css.includes('.mk-reveal.mk-reveal-dalam {\n    opacity: 1;'),
);

// --- 6. Tidak ada mekanisme reveal lain yang tertinggal sekali jalan. ---
cek(
  'Landing: tidak ada lagi pola "isIntersecting -> disconnect" di Marklo.tsx',
  !/isIntersecting\) \{\s*\n?\s*set\w+\(true\);\s*\n?\s*pengamat\.disconnect\(\)/.test(
    marklo,
  ),
);

if (gagal > 0) {
  console.log(`\n${gagal} asersi GAGAL`);
  process.exit(1);
}
console.log('\nSemua asersi animasi scroll landing dua arah lolos.');

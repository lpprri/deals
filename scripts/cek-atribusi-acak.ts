// Verifikasi distribusi acak atribusi Employee Rank (keputusan pengguna
// 2026-11-15): 5 operator Palembang didistribusikan acak (deterministik,
// pembagian merata) ke 42 kontrak. Skrip ini juga mencetak peta
// penugasan sebagai JSON (dipakai menambal seed + CSV) dan memeriksa
// seed sudah memuat penugasan yang sama. Keluar bukan-nol bila ada
// asersi gagal.
import { DATA_NYATA } from '../src/lib/seedNyata';
import {
  BENIH_ACAK_ATRIBUSI,
  distribusiAcakOperator,
  ringkasanDistribusi,
} from '../src/lib/derive';
import { OPERATOR_PALEMBANG } from '../src/lib/master';

const kontrak = DATA_NYATA.kontrak;
const peta = distribusiAcakOperator(kontrak, OPERATOR_PALEMBANG, BENIH_ACAK_ATRIBUSI);
const perOperator = ringkasanDistribusi(kontrak, peta);

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};

cek('kontrak di seed', kontrak.length === 42, `${kontrak.length}`);
cek('penugasan di peta', peta.size === 42, `${peta.size}`);
cek(
  'semua operator dipakai',
  perOperator.length === OPERATOR_PALEMBANG.length,
  perOperator.map((p) => `${p.operator}=${p.jumlah}`).join(', '),
);
cek(
  'pembagian merata (8 atau 9 per operator)',
  perOperator.every((p) => p.jumlah === 8 || p.jumlah === 9),
  perOperator.map((p) => `${p.operator}=${p.jumlah}`).join(', '),
);
cek(
  'total nilai penugasan',
  perOperator.reduce((s, p) => s + p.nilai, 0) === 441863375,
  `Rp${perOperator.reduce((s, p) => s + p.nilai, 0).toLocaleString('id-ID')}`,
);
const seedCocok = kontrak.every(
  (k) => k.operatorPenutup === peta.get(k.id) && k.tanggalTandaTangan === k.tanggalMulai,
);
cek('seed memuat penugasan yang sama (operator + tgl tanda tangan = tgl mulai)', seedCocok);
console.log('PETA:' + JSON.stringify([...peta.entries()]));
console.log('PER_OPERATOR:' + JSON.stringify(perOperator));
if (gagal > 0) process.exit(1);

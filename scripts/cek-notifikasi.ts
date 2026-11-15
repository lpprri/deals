// Verifikasi notifikasi top bar (daftarNotifikasi, src/lib/notifikasi.ts).
// Asersi: jumlah per kategori SAMA dengan hitungan ulang langsung dari
// DATA_NYATA (hariIni '2026-11-15'); semua id unik & tak kosong; General
// memuat semua item; item selisih rekonsiliasi ada iff selisih ≠ 0;
// setiap item punya tab/modul yang valid dan judul/detail tak kosong.
// Keluar bukan-nol bila ada asersi gagal.
import { DATA_NYATA } from '../src/lib/seedNyata';
import { daftarNotifikasi } from '../src/lib/notifikasi';
import { hitungTotalKontrol, statusTagihan } from '../src/lib/derive';
import { selisihHari } from '../src/lib/format';

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};

const HARI_INI = '2026-11-15';
const semua = daftarNotifikasi(DATA_NYATA, HARI_INI);
const perKategori = (k: string) => semua.filter((n) => n.kategori === k).length;

// Hitungan ulang langsung (logika yang sama dengan Dashboard "Perlu perhatian").
const hitungLewat = DATA_NYATA.tagihan.filter(
  (t) => statusTagihan(t, DATA_NYATA.pembayaran) === 'Lewat Jatuh Tempo',
).length;
const hitungDokumen = DATA_NYATA.dokumen.filter((d) => d.status === 'Belum Ada').length;
const hitungSewa = DATA_NYATA.sewa.filter((s) => {
  const sisa = selisihHari(HARI_INI, s.tanggalSelesai);
  return s.status === 'ON GOING' && sisa >= 0 && sisa <= 60;
}).length;
const hitungPengajuan = DATA_NYATA.pengajuan.filter((p) =>
  ['Masuk', 'Ditelaah', 'Menunggu Dokumen'].includes(p.tahap),
).length;
const hitungPengajuanKlien = DATA_NYATA.pengajuanKlien.filter(
  (pk) => pk.status === 'Menunggu',
).length;
const hitungDisposisi = DATA_NYATA.task.filter(
  (t) =>
    (t.disposisiDari || t.pemberiDisposisi) &&
    (t.status === 'Belum Dikerjakan' || t.status === 'Berjalan'),
).length;

cek('Overdue invoice = hitungan ulang', perKategori('Overdue invoice') === hitungLewat, `${perKategori('Overdue invoice')} vs ${hitungLewat}`);
cek('Missing document = hitungan ulang', perKategori('Missing document') === hitungDokumen, `${perKategori('Missing document')} vs ${hitungDokumen}`);
cek('Lease expiring soon = hitungan ulang', perKategori('Lease expiring soon') === hitungSewa, `${perKategori('Lease expiring soon')} vs ${hitungSewa}`);
cek('Submission needs follow-up = hitungan ulang', perKategori('Submission needs follow-up') === hitungPengajuan, `${perKategori('Submission needs follow-up')} vs ${hitungPengajuan}`);
cek('Public submission awaiting review = hitungan ulang (seed: 0)', perKategori('Public submission awaiting review') === hitungPengajuanKlien, `${perKategori('Public submission awaiting review')} vs ${hitungPengajuanKlien}`);
cek('Disposition task = hitungan ulang', perKategori('Disposition task') === hitungDisposisi, `${perKategori('Disposition task')} vs ${hitungDisposisi}`);

const total = hitungTotalKontrol(DATA_NYATA);
const adaSelisih =
  DATA_NYATA.penerimaanAcuan.length > 0 && total.selisihRekonsiliasi !== 0;
cek(
  'Reconciliation difference ada iff selisih ≠ 0',
  (perKategori('Reconciliation difference') === 1) === adaSelisih,
  `selisih Rp${total.selisihRekonsiliasi.toLocaleString('id-ID')}, item: ${perKategori('Reconciliation difference')}`,
);
cek(
  'total = jumlah semua kategori',
  semua.length ===
    hitungLewat +
      hitungDokumen +
      hitungSewa +
      hitungPengajuan +
      hitungPengajuanKlien +
      hitungDisposisi +
      (adaSelisih ? 1 : 0),
  `${semua.length} item`,
);

// Struktur.
const ids = semua.map((n) => n.id);
cek('semua id unik', new Set(ids).size === ids.length, `${ids.length} id`);
cek('semua id tak kosong', ids.every((id) => id.length > 0));
cek(
  'General memuat semua item (inbox + approval + general = total)',
  semua.filter((n) => n.tab === 'general').length +
    semua.filter((n) => n.tab === 'inbox').length +
    semua.filter((n) => n.tab === 'approval').length ===
    semua.length,
);
cek(
  'tab hanya general/inbox/approval',
  semua.every((n) => ['general', 'inbox', 'approval'].includes(n.tab)),
);
const MODUL_VALID = [
  'dashboard',
  'marketing',
  'sales',
  'deals',
  'sewa',
  'pengajuan',
  'revenue',
  'reporting',
  'todo',
  'service',
  'audit',
  'master',
];
cek('modul tujuan valid', semua.every((n) => MODUL_VALID.includes(n.modul)));
cek(
  'judul & detail tak kosong',
  semua.every((n) => n.judul.trim().length > 0 && n.detail.trim().length > 0),
);
cek(
  'satu item punya satu tab primer',
  semua.every((n) => typeof n.tab === 'string' && n.tab.length > 0),
);
cek('ada notifikasi dari data (bukan kosong)', semua.length > 0, `${semua.length} item`);

if (gagal > 0) process.exit(1);

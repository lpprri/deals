// Verifikasi wiring Cloud Function lacakKerjaSama (PR #29).
// Asersi: normalisasi payload Function menghasilkan HasilLacak yang sama
// dengan cariKerjaSama (seed) untuk nomor yang sama; payload tidak
// berbentuk → null; normalisasi kode ke huruf besar; wiring inert tanpa
// konfigurasi Firebase. Function TIDAK dipanggil di sini (belum di-deploy
// — deploy + uji live mengikuti setelah merge). Keluar bukan-nol bila ada
// asersi gagal.
import { DATA_NYATA } from '../src/lib/seedNyata';
import { cariKerjaSama } from '../src/modules/Lacak';
import {
  normalisasiHasilLacakFunction,
  normalisasiKodeFunction,
} from '../src/lib/lacakHasil';

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};

const KODE = '0603/PKS/RRI.PLB/01/2026';
const dariSeed = cariKerjaSama(DATA_NYATA, KODE);
if (!dariSeed) {
  console.log('GAGAL seed tidak menemukan 0603 (prasyarat cek)');
  process.exit(1);
}
// Payload seperti yang dikembalikan Function (firestore sudah berisi
// dokumen yang sama persis dengan seed pasca-migrasi).
const payload = {
  ditemukan: true,
  kontrak: dariSeed.kontrak,
  klien: DATA_NYATA.klien.find((k) => k.id === dariSeed.kontrak.klienId) ?? null,
  tagihan: dariSeed.tagihan,
  dokumen: dariSeed.dokumen,
  pembayaran: dariSeed.pembayaran,
};
const dariFungsi = normalisasiHasilLacakFunction(payload);
cek('payload valid → HasilLacak', dariFungsi !== null);
cek('payload: kontrak sama dengan seed', dariFungsi?.kontrak.id === dariSeed.kontrak.id, dariFungsi?.kontrak.id);
cek('payload: jumlah tagihan sama', dariFungsi?.tagihan.length === dariSeed.tagihan.length, `${dariFungsi?.tagihan.length}`);
cek('payload: jumlah dokumen sama', dariFungsi?.dokumen.length === dariSeed.dokumen.length, `${dariFungsi?.dokumen.length}`);
cek('payload: jumlah pembayaran sama', dariFungsi?.pembayaran.length === dariSeed.pembayaran.length, `${dariFungsi?.pembayaran.length}`);
cek('payload: klien sama', dariFungsi?.klien?.nama === 'PT PLN (Persero) UPT Palembang', dariFungsi?.klien?.nama ?? 'null');

// Payload tidak berbentuk → null (bukan crash).
cek('ditemukan:false → null', normalisasiHasilLacakFunction({ ditemukan: false }) === null);
cek('payload kosong → null', normalisasiHasilLacakFunction({}) === null);
cek('payload null → null', normalisasiHasilLacakFunction(null) === null);
cek('kontrak tanpa id → null', normalisasiHasilLacakFunction({ ditemukan: true, kontrak: { nomorPks: 'x' }, tagihan: [], dokumen: [], pembayaran: [] }) === null);
cek('daftar bukan array → null', normalisasiHasilLacakFunction({ ditemukan: true, kontrak: dariSeed.kontrak, tagihan: 'bukan-array', dokumen: [], pembayaran: [] }) === null);
cek('klien null diterima', normalisasiHasilLacakFunction({ ...payload, klien: null })?.klien === null);
cek('klien hilang diterima', normalisasiHasilLacakFunction({ ditemukan: true, kontrak: dariSeed.kontrak, tagihan: [], dokumen: [], pembayaran: [] })?.klien === null);

// Normalisasi kode (Function case-sensitive; kode tersimpan huruf besar).
cek('normalisasi kode ke huruf besar', normalisasiKodeFunction(' 0603/pks/rri.plb/01/2026 ') === '0603/PKS/RRI.PLB/01/2026', normalisasiKodeFunction(' 0603/pks/rri.plb/01/2026 '));
cek('normalisasi nomor tagihan', normalisasiKodeFunction('001/rri.plb/pks.f/01/2026') === '001/RRI.PLB/PKS.F/01/2026');

// Modul Lacak tidak menarik Firebase SDK secara statis (import LAZY di
// handler) — skrip ini berjalan tanpa konfigurasi Firebase; bila modul
// Lacak menarik SDK, bundle di atas sudah gagal sebelum asersi ini.

if (gagal > 0) process.exit(1);

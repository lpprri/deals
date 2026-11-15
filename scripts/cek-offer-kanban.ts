// Verifikasi Kanban Offer (PR #41): pemetaan tahap Q-11 ke 6 kolom tampil,
// keempat prospect masing-masing di tepat satu kolom, ketiga quotation
// tertaut ke prospect yang ada, dan 6 total kontrol tidak berubah.
// Keluar bukan-nol bila ada asersi gagal.
import { DATA_NYATA } from '../src/lib/seedNyata';
import { hitungTotalKontrol } from '../src/lib/derive';
import { KOLOM_OFFER, kolomKanbanOffer } from '../src/modules/Penawaran';
import type { TahapPipeline } from '../src/lib/types';

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};
const cekNilai = (nama: string, aktual: number, harap: number) =>
  cek(nama, aktual === harap, `aktual ${aktual}, harap ${harap}`);

// 1. Pemetaan tahap tersimpan (Q-11) ke kolom tampil — 7 tahap, sesuai brief.
const peta: [TahapPipeline, string][] = [
  ['Prospek Baru', 'Prospect'],
  ['Dihubungi', 'Contacted'],
  ['Penawaran', 'Quotation'],
  ['Negosiasi', 'Negotiation'],
  ['Order', 'Accepted'],
  ['Diterima', 'Accepted'],
  ['Ditolak', 'Rejected'],
];
for (const [tahap, kolom] of peta) {
  cek(`peta ${tahap} -> ${kolom}`, kolomKanbanOffer(tahap) === kolom);
}
cek('jumlah kolom Kanban', KOLOM_OFFER.length === 6, KOLOM_OFFER.join(', '));

// 2. Keempat prospect masing-masing di tepat satu kolom (total terpeta = 4).
const perKolom = new Map<string, { jumlah: number; nilai: number }>();
for (const k of KOLOM_OFFER) perKolom.set(k, { jumlah: 0, nilai: 0 });
for (const p of DATA_NYATA.prospect) {
  const kolom = kolomKanbanOffer(p.tahap);
  const r = perKolom.get(kolom)!;
  r.jumlah += 1;
  r.nilai += p.nilaiPerkiraan;
}
const totalTerpeta = [...perKolom.values()].reduce((s, r) => s + r.jumlah, 0);
cekNilai('prospect terpeta ke Kanban', totalTerpeta, 4);
cekNilai('jumlah prospect data', DATA_NYATA.prospect.length, 4);

// 3. Distribusi per kolom (dari data nyata).
cekNilai('kolom Prospect', perKolom.get('Prospect')!.jumlah, 1);
cekNilai('kolom Contacted', perKolom.get('Contacted')!.jumlah, 0);
cekNilai('kolom Quotation', perKolom.get('Quotation')!.jumlah, 0);
cekNilai('kolom Negotiation', perKolom.get('Negotiation')!.jumlah, 1);
cekNilai('kolom Accepted', perKolom.get('Accepted')!.jumlah, 1);
cekNilai('kolom Rejected', perKolom.get('Rejected')!.jumlah, 1);
cekNilai('nilai kolom Prospect', perKolom.get('Prospect')!.nilai, 12000000);
cekNilai('nilai kolom Negotiation', perKolom.get('Negotiation')!.nilai, 9000000);
cekNilai('nilai kolom Accepted', perKolom.get('Accepted')!.nilai, 48000000);
cekNilai('nilai kolom Rejected', perKolom.get('Rejected')!.nilai, 5000000);

// 4. Ketiga quotation tertaut ke prospect yang ada; tautan per prospect benar.
const idProspect = new Set(DATA_NYATA.prospect.map((p) => p.id));
cek(
  'semua quotation tertaut ke prospect yang ada',
  DATA_NYATA.quotation.every((q) => idProspect.has(q.prospectId)),
);
const quotationPerProspect = (id: string) =>
  DATA_NYATA.quotation.filter((q) => q.prospectId === id).map((q) => q.id);
cek(
  'PRS-01 -> QTN-02',
  JSON.stringify(quotationPerProspect('PRS-01')) === JSON.stringify(['QTN-02']),
);
cek(
  'PRS-02 -> QTN-01',
  JSON.stringify(quotationPerProspect('PRS-02')) === JSON.stringify(['QTN-01']),
);
cek(
  'PRS-03 -> QTN-03',
  JSON.stringify(quotationPerProspect('PRS-03')) === JSON.stringify(['QTN-03']),
);
cek('PRS-04 tanpa quotation', quotationPerProspect('PRS-04').length === 0);
cekNilai('jumlah quotation', DATA_NYATA.quotation.length, 3);
cekNilai(
  'Σ nilai quotation',
  DATA_NYATA.quotation.reduce((s, q) => s + q.nilai, 0),
  62000000,
);

// 5. Enam total kontrol tidak berubah.
const k = hitungTotalKontrol(DATA_NYATA);
cekNilai('nilaiKontrak', k.nilaiKontrak, 441863375);
cekNilai('totalTagihan', k.totalTagihan, 379068204);
cekNilai(
  'totalPembayaranTerverifikasi',
  k.totalPembayaranTerverifikasi,
  229405255,
);
cekNilai('sisaPiutang', k.sisaPiutang, 149662949);
cekNilai('totalDenda', k.totalDenda, 8873330);
cekNilai('jumlahPks aktif', k.jumlahPks, 15);

if (gagal > 0) {
  console.log(`\n${gagal} asersi GAGAL.`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');

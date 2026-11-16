// Verifikasi penggantian data kontrak 2026-11-16 (PR #52):
// file Kerja_Sama_PNBP_2026.xlsx (Summary) mengganti 40 kontrak 2026;
// 2 kontrak 2025 (Darojad, PT VGreen) dipertahankan. Asersi:
// - jumlah tiap koleksi (pembayaran 42 -> 45, denda 13 -> 12; sisanya tetap)
// - 6 total kontrol baru (nilai kontrak + PKS aktif + acuan TIDAK berubah)
// - 3 pembayaran baru (BYR-043/044/045) dgn NTB/NTPN + tautan tagihan benar
// - DND-013 (Samdini) HILANG; DND-009 (6593) Dibayar; DND-011 tetap
//   Rp1.897.030 (selisih Rp1 vs file dipertahankan — pembulatan impor lama)
// - 3 tagihan berubah (10828 nilai; 10227 + 11290 jatuh tempo); tagihan
//   2 kontrak 2025 tidak berubah
// - kontrak: operatorPenutup + tanggalTandaTangan (PR #26) dipertahankan
//   di semua 42 kontrak; catatan 1158 + 11290 ikut file
// - 4 kontrak multi-pembayaran kini punya 2 baris pembayaran; kontrak
//   lain 1 baris; semua pembayaran Terverifikasi
// - jembatan rekonsiliasi: selisih kini NEGATIF (pembayaran Okt 2026 di
//   luar jendela acuan Jan-Sep), sisa tak terjelaskan tetap 0
// Keluar bukan-nol bila ada asersi gagal.
import { DATA_NYATA, TANGGAL_IMPOR } from '../src/lib/seedNyata';
import {
  dibayarTerverifikasi,
  hitungJembatanRekonsiliasi,
  hitungTotalKontrol,
  sisaTagihan,
  statusTagihan,
} from '../src/lib/derive';

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};
const tagihanKontrak = (kontrakId: string) =>
  DATA_NYATA.tagihan.find((t) => t.kontrakId === kontrakId);
const pembayaranTagihan = (tagihanId: string) =>
  DATA_NYATA.pembayaran.filter((p) => p.tagihanId === tagihanId);

cek('TANGGAL_IMPOR 2026-11-16', TANGGAL_IMPOR === '2026-11-16', TANGGAL_IMPOR);

// ---------- jumlah koleksi ----------
cek('kontrak 42', DATA_NYATA.kontrak.length === 42, `${DATA_NYATA.kontrak.length}`);
cek('klien 33', DATA_NYATA.klien.length === 33, `${DATA_NYATA.klien.length}`);
cek('tagihan 42 (1 per kontrak)', DATA_NYATA.tagihan.length === 42, `${DATA_NYATA.tagihan.length}`);
cek('pembayaran 45 (42 + 3 baru)', DATA_NYATA.pembayaran.length === 45, `${DATA_NYATA.pembayaran.length}`);
cek('denda 12 (13 - DND-013)', DATA_NYATA.denda.length === 12, `${DATA_NYATA.denda.length}`);
cek('dokumen 102', DATA_NYATA.dokumen.length === 102, `${DATA_NYATA.dokumen.length}`);
cek('sewa 41', DATA_NYATA.sewa.length === 41, `${DATA_NYATA.sewa.length}`);
cek('pengajuan 16', DATA_NYATA.pengajuan.length === 16, `${DATA_NYATA.pengajuan.length}`);
cek('penerimaanAcuan 62', DATA_NYATA.penerimaanAcuan.length === 62, `${DATA_NYATA.penerimaanAcuan.length}`);

// ---------- total kontrol baru ----------
const k = hitungTotalKontrol(DATA_NYATA);
cek('nilaiKontrak tetap 441.863.375', k.nilaiKontrak === 441863375, `Rp${k.nilaiKontrak.toLocaleString('id-ID')}`);
cek('totalTagihan 376.414.124', k.totalTagihan === 376414124, `Rp${k.totalTagihan.toLocaleString('id-ID')}`);
cek('pembayaran terverifikasi 362.329.255', k.totalPembayaranTerverifikasi === 362329255, `Rp${k.totalPembayaranTerverifikasi.toLocaleString('id-ID')}`);
cek('sisaPiutang 14.084.869', k.sisaPiutang === 14084869, `Rp${k.sisaPiutang.toLocaleString('id-ID')}`);
cek('totalDenda 6.219.250', k.totalDenda === 6219250, `Rp${k.totalDenda.toLocaleString('id-ID')}`);
cek('acuan tetap 257.590.368', k.totalPenerimaanAcuan === 257590368, `Rp${k.totalPenerimaanAcuan.toLocaleString('id-ID')}`);
cek('PKS aktif tetap 15', k.jumlahPks === 15, `${k.jumlahPks}`);
cek('selisih rekonsiliasi -104.738.887', k.selisihRekonsiliasi === -104738887, `Rp${k.selisihRekonsiliasi.toLocaleString('id-ID')}`);

// ---------- 3 pembayaran baru ----------
const byr = (id: string) => DATA_NYATA.pembayaran.find((p) => p.id === id);
const b43 = byr('BYR-043');
cek('BYR-043: 1158 Rp180.000 2026-10-07', !!b43 && b43.jumlah === 180000 && b43.tanggalBayar === '2026-10-07' && b43.tagihanId === 'TGH-035-RRI-PLB-PKS-F-09-2026', b43?.buktiSetor);
cek('BYR-043: NTB/NTPN + Terverifikasi', !!b43 && b43.buktiSetor === 'NTB 820261007582400 / NTPN 8182F2G50CNOFP60' && b43.statusVerifikasi === 'Terverifikasi' && b43.penyetor === 'PT PLN (Persero) UPT Palembang');
const b44 = byr('BYR-044');
cek('BYR-044: denda 6593 Rp40.000 2026-10-13', !!b44 && b44.jumlah === 40000 && b44.tanggalBayar === '2026-10-13' && b44.tagihanId === 'TGH-027-RRI-PLB-PKS-F-07-2026', b44?.buktiSetor);
cek('BYR-044: NTB/NTPN + Terverifikasi', !!b44 && b44.buktiSetor === 'NTB 820261012368839 / NTPN 9C09D7QLVC67FRE7' && b44.statusVerifikasi === 'Terverifikasi' && b44.penyetor === 'Perempuan Indonesia Maju (PIM)');
const b45 = byr('BYR-045');
cek('BYR-045: Samdini Rp132.704.000 2026-10-16', !!b45 && b45.jumlah === 132704000 && b45.tanggalBayar === '2026-10-16' && b45.tagihanId === 'TGH-037-RRI-PLB-PKS-U-10-2026', b45?.buktiSetor);
cek('BYR-045: NTB/NTPN + Terverifikasi', !!b45 && b45.buktiSetor === 'NTB 820261012367367 / NTPN A6EBE7QLVC67FQ07' && b45.statusVerifikasi === 'Terverifikasi' && b45.penyetor === 'Samdini');
cek('semua pembayaran Terverifikasi', DATA_NYATA.pembayaran.every((p) => p.statusVerifikasi === 'Terverifikasi'));

// ---------- denda ----------
cek('DND-013 (Samdini) HILANG', !DATA_NYATA.denda.some((d) => d.id === 'DND-013'));
const dnd009 = DATA_NYATA.denda.find((d) => d.id === 'DND-009');
cek('DND-009 (6593) Dibayar', dnd009?.status === 'Dibayar' && dnd009.jumlah === 40000);
const dnd011 = DATA_NYATA.denda.find((d) => d.id === 'DND-011');
cek('DND-011 (7054) tetap Rp1.897.030', dnd011?.jumlah === 1897030, `Rp${dnd011?.jumlah}`);
cek('DND-001 (Taspen) tetap Rp0 Dihapus', DATA_NYATA.denda.find((d) => d.id === 'DND-001')?.status === 'Dihapus');

// ---------- 3 tagihan berubah + 2 tagihan 2025 tetap ----------
const tSamdini = tagihanKontrak('10828/PKS/RRI.PLB/10/2026');
cek('tagihan Samdini nilai 132.704.000', tSamdini?.nilai === 132704000, `Rp${tSamdini?.nilai}`);
cek('tagihan Samdini Lunas (per 2026-11-15)', !!tSamdini && statusTagihan(tSamdini, DATA_NYATA.pembayaran, '2026-11-15') === 'Lunas');
const t10227 = tagihanKontrak('10227/PKS/RRI.PLB/10/2026');
cek('tagihan 10227 jatuh tempo 2026-12-15', t10227?.tanggalJatuhTempo === '2026-12-15', t10227?.tanggalJatuhTempo);
const t11290 = tagihanKontrak('11290/PKS/RRI.PLB/10/2026');
cek('tagihan 11290 jatuh tempo 2026-11-27', t11290?.tanggalJatuhTempo === '2026-11-27', t11290?.tanggalJatuhTempo);
const tDarojad = tagihanKontrak('016/PKS/DIR.LPU/06/2025');
cek('tagihan Darojad 2025 tidak berubah', !!tDarojad && tDarojad.nilai === 34292500 && tDarojad.tanggalJatuhTempo === '2025-08-19');
const tVGreen = tagihanKontrak('027/RRI.PLB/PKS.U/06/2025');
cek('tagihan VGreen 2025 tidak berubah', !!tVGreen && tVGreen.nilai === 22492500 && tVGreen.tanggalJatuhTempo === '2025-06-30');
cek('tidak ada tagihan Lewat Jatuh Tempo (per 2026-11-15)', DATA_NYATA.tagihan.filter((t) => statusTagihan(t, DATA_NYATA.pembayaran, '2026-11-15') === 'Lewat Jatuh Tempo').length === 0);

// ---------- kontrak 2025 dipertahankan ----------
const kDarojad = DATA_NYATA.kontrak.find((x) => x.id === '016/PKS/DIR.LPU/06/2025');
const kVGreen = DATA_NYATA.kontrak.find((x) => x.id === '027/RRI.PLB/PKS.U/06/2025');
cek('kontrak Darojad 2025 tetap', !!kDarojad && kDarojad.nilaiKontrak === 51438750 && kDarojad.klienId === 'KLN-033');
cek('kontrak VGreen 2025 tetap', !!kVGreen && kVGreen.nilaiKontrak === 33738750 && kVGreen.klienId === 'KLN-032');
cek('klien Darojad + VGreen tetap', DATA_NYATA.klien.some((c) => c.id === 'KLN-032') && DATA_NYATA.klien.some((c) => c.id === 'KLN-033'));
cek('duplikat 2036 tetap 2 kontrak', DATA_NYATA.kontrak.some((x) => x.id === '2036/PKS/RRI.PLB/03/2026#010') && DATA_NYATA.kontrak.some((x) => x.id === '2036/PKS/RRI.PLB/03/2026#011'));

// ---------- operatorPenutup + tanggalTandaTangan dipertahankan ----------
cek('semua 42 kontrak punya operatorPenutup', DATA_NYATA.kontrak.every((x) => !!x.operatorPenutup), `${DATA_NYATA.kontrak.filter((x) => !x.operatorPenutup).length} tanpa operator`);
cek('semua 42 kontrak punya tanggalTandaTangan', DATA_NYATA.kontrak.every((x) => !!x.tanggalTandaTangan), `${DATA_NYATA.kontrak.filter((x) => !x.tanggalTandaTangan).length} tanpa tanggal`);
const perOperator = new Map<string, number>();
for (const x of DATA_NYATA.kontrak) perOperator.set(x.operatorPenutup ?? '', (perOperator.get(x.operatorPenutup ?? '') ?? 0) + x.nilaiKontrak);
cek('distribusi operator PR #26 tetap (Σ = 441.863.375)', [...perOperator.values()].reduce((a, b) => a + b, 0) === 441863375 && perOperator.get('Meliyana') === 166805000 && perOperator.get('Nadya Pratita') === 113216042 && perOperator.get('A. Kadir Kurniawan') === 68744750 && perOperator.get("Ja'far") === 58365583 && perOperator.get('Dessi Maya Sari') === 34732000, [...perOperator.entries()].map(([o, v]) => `${o}=${v}`).join(', '));

// ---------- catatan 1158 + 11290 ----------
const k1158 = DATA_NYATA.kontrak.find((x) => x.id === '1158/PKS/RRI.PLB/10/2026');
cek('catatan 1158: Pembayaran Tepat Waktu', !!k1158 && k1158.catatan.includes('Keterangan sumber: Pembayaran Tepat Waktu') && !k1158.catatan.includes('Belum Jatuh Tempo'));
const k11290 = DATA_NYATA.kontrak.find((x) => x.id === '11290/PKS/RRI.PLB/10/2026');
cek('catatan 11290: + Keterangan Belum Jatuh Tempo', !!k11290 && k11290.catatan.endsWith('Keterangan sumber: Belum Jatuh Tempo'));

// ---------- multi-pembayaran ----------
for (const kid of ['1745/PKS/RRI.PLB/03/2026', '2036/PKS/RRI.PLB/03/2026#010', '2036/PKS/RRI.PLB/03/2026#011', '6593/PKS/RRI.PLB/07/2026']) {
  const t = tagihanKontrak(kid);
  cek(`multi-pembayaran ${kid.split('/')[0]}: 2 baris`, !!t && pembayaranTagihan(t.id).length === 2, t ? `${pembayaranTagihan(t.id).length}` : 'tanpa tagihan');
}
const harapBayar: Record<string, number> = {
  '1745/PKS/RRI.PLB/03/2026': 2, '2036/PKS/RRI.PLB/03/2026#010': 2,
  '2036/PKS/RRI.PLB/03/2026#011': 2, '6593/PKS/RRI.PLB/07/2026': 2,
  '016/PKS/DIR.LPU/06/2025': 2, '027/RRI.PLB/PKS.U/06/2025': 2,
  '10227/PKS/RRI.PLB/10/2026': 0, '11290/PKS/RRI.PLB/10/2026': 0,
  '018/PKS/DIR.LPU/08/2026': 0,
};
cek('pembayaran per tagihan sesuai pola (0/1/2)', DATA_NYATA.kontrak.filter((x) => {
  const t = tagihanKontrak(x.id);
  return !t || pembayaranTagihan(t.id).length !== (harapBayar[x.id] ?? 1);
}).length === 0);
cek('tagihan bersisa 9 (dari 12)', DATA_NYATA.tagihan.filter((t) => sisaTagihan(t, DATA_NYATA.pembayaran) > 0).length === 9, `${DATA_NYATA.tagihan.filter((t) => sisaTagihan(t, DATA_NYATA.pembayaran) > 0).length}`);
cek('tagihan 6593 lunas (2.000.000 + 40.000)', (() => { const t = tagihanKontrak('6593/PKS/RRI.PLB/07/2026'); return !!t && dibayarTerverifikasi(t.id, DATA_NYATA.pembayaran) === t.nilai; })());
cek('tagihan 1158 lunas (180.000)', (() => { const t = tagihanKontrak('1158/PKS/RRI.PLB/10/2026'); return !!t && dibayarTerverifikasi(t.id, DATA_NYATA.pembayaran) === t.nilai; })());

// ---------- jembatan rekonsiliasi ----------
const j = hitungJembatanRekonsiliasi(DATA_NYATA);
cek('jembatan: selisih -104.738.887', j.selisih === -104738887, `Rp${j.selisih.toLocaleString('id-ID')}`);
cek('jembatan: pembayaranTanpaAcuan 161.316.500 / 5 baris', j.pembayaranTanpaAcuan.total === 161316500 && j.pembayaranTanpaAcuan.jumlahBaris === 5, `${j.pembayaranTanpaAcuan.total} / ${j.pembayaranTanpaAcuan.jumlahBaris}`);
cek('jembatan: acuanTanpaPembayaran tetap 56.577.613 / 21', j.acuanTanpaPembayaran.total === 56577613 && j.acuanTanpaPembayaran.jumlahBaris === 21);
cek('jembatan: sisaTakTerjelaskan tetap 0', j.sisaTakTerjelaskan === 0, `${j.sisaTakTerjelaskan}`);
cek('jembatan: pasangan tetap 40/40, selisih -180.380', j.pasangan.jumlahBarisAcuan === 40 && j.pasangan.jumlahPembayaran === 40 && j.pasangan.selisih === -180380);
cek('jembatan: 3 NTPN baru TIDAK ada di acuan', ['8182F2G50CNOFP60', '9C09D7QLVC67FRE7', 'A6EBE7QLVC67FQ07'].every((n) => !DATA_NYATA.penerimaanAcuan.some((a) => a.uraian.includes(n))));

if (gagal > 0) {
  console.log(`\n${gagal} asersi GAGAL.`);
  process.exit(1);
}
console.log('\nSemua asersi lolos.');

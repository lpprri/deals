// Entri hitung untuk verifikasi rekonsiliasi — dipakai verifikasi.mjs.
// Dibundel dengan esbuild lalu dijalankan dengan node; mencetak SATU objek
// JSON ke stdout. Semua angka dihitung dari DATA_NYATA lewat derive.ts,
// supaya yang diverifikasi adalah angka yang sama dengan yang tampil di
// Dashboard / Revenue / Reporting.
//
// BASIS BULAN (penting — hasil audit rekonsiliasi 14 Nov 2026):
// Laporan Bulanan aplikasi (Reporting.tsx barisBulanan) mengelompokkan PKS
// menurut BULAN TERBIT TAGIHAN (bulan PKS diterbitkan), BUKAN tanggalMulai
// kontrak (awal masa layanan). Keduanya berbeda untuk 8+ kontrak — mis.
// sewa 1051/1052/1053: layanan mulai 01/02/2026 tapi PKS terbit 30/01/2026
// (masuk laporan Januari); Samdini 10828: layanan mulai 17/09/2026 tapi
// PKS terbit 16/10/2026 (masuk laporan Oktober). Basis terbit-tagihan
// mereproduksi tabel bulanan per-master Sheet 1 PERSIS (10/10 bulan).
// Untuk transparansi, perBulanTanggalMulai juga dihitung sebagai pembanding.

import { DATA_NYATA } from '../../src/lib/seedNyata';
import { hitungTotalKontrol, totalPerKodeAkun } from '../../src/lib/derive';

const BULAN = [
  '2026-01',
  '2026-02',
  '2026-03',
  '2026-04',
  '2026-05',
  '2026-06',
  '2026-07',
  '2026-08',
  '2026-09',
  '2026-10',
];

function jenisDariKode(kodeAkun: string): 'Fungsional' | 'Umum' {
  return kodeAkun === '425531' ? 'Fungsional' : 'Umum';
}

interface PerBulan {
  nilaiKontrakFungsional: number;
  nilaiKontrakUmum: number;
  nilaiKontrakTotal: number;
  qtyPks: number;
  nilaiTagihan: number;
  totalPembayaran: number;
  totalPembayaranTerverifikasi: number;
}

const tagihanPerKontrak = new Map(
  DATA_NYATA.tagihan.map((t) => [t.kontrakId, t]),
);

const perBulan: Record<string, PerBulan> = {};
const perBulanTanggalMulai: Record<string, PerBulan> = {};
for (const b of BULAN) {
  // Basis aplikasi: kontrak yang tagihannya terbit di bulan ini.
  const kontrakBulan = DATA_NYATA.kontrak.filter(
    (k) => tagihanPerKontrak.get(k.id)?.tanggalTerbit.startsWith(b),
  );
  const tagihanBulan = DATA_NYATA.tagihan.filter((t) =>
    t.tanggalTerbit.startsWith(b),
  );
  const bayarBulan = DATA_NYATA.pembayaran.filter((p) =>
    p.tanggalBayar.startsWith(b),
  );
  const fungsional = kontrakBulan.filter(
    (k) => jenisDariKode(tagihanPerKontrak.get(k.id)!.kodeAkun) === 'Fungsional',
  );
  const umum = kontrakBulan.filter(
    (k) => jenisDariKode(tagihanPerKontrak.get(k.id)!.kodeAkun) === 'Umum',
  );
  perBulan[b] = {
    nilaiKontrakFungsional: fungsional.reduce((s, k) => s + k.nilaiKontrak, 0),
    nilaiKontrakUmum: umum.reduce((s, k) => s + k.nilaiKontrak, 0),
    nilaiKontrakTotal: kontrakBulan.reduce((s, k) => s + k.nilaiKontrak, 0),
    qtyPks: kontrakBulan.length,
    nilaiTagihan: tagihanBulan.reduce((s, t) => s + t.nilai, 0),
    totalPembayaran: bayarBulan.reduce((s, p) => s + p.jumlah, 0),
    totalPembayaranTerverifikasi: bayarBulan
      .filter((p) => p.statusVerifikasi === 'Terverifikasi')
      .reduce((s, p) => s + p.jumlah, 0),
  };
  // Pembanding: basis tanggalMulai (bukan basis laporan).
  const mulaiBulan = DATA_NYATA.kontrak.filter((k) =>
    k.tanggalMulai.startsWith(b),
  );
  perBulanTanggalMulai[b] = {
    nilaiKontrakFungsional: mulaiBulan
      .filter((k) => k.jenisPnBP === 'Fungsional')
      .reduce((s, k) => s + k.nilaiKontrak, 0),
    nilaiKontrakUmum: mulaiBulan
      .filter((k) => k.jenisPnBP === 'Umum')
      .reduce((s, k) => s + k.nilaiKontrak, 0),
    nilaiKontrakTotal: mulaiBulan.reduce((s, k) => s + k.nilaiKontrak, 0),
    qtyPks: mulaiBulan.length,
    nilaiTagihan: 0,
    totalPembayaran: 0,
    totalPembayaranTerverifikasi: 0,
  };
}

// Posisi piutang akhir 30 Sep 2026 — per tagihan (tagihan terbit ≤ 30 Sep,
// pembayaran terverifikasi dengan tanggal bayar ≤ 30 Sep).
// CATATAN: nilai tagihan SUDAH mencakup denda yang tertanam (mis. Fisol:
// tagihan 7.440.000 = kontrak 6.000.000 + denda 1.440.000). Entitas Denda
// mencatat jumlah yang sama secara terpisah — denda TIDAK ditambahkan lagi
// ke sisa tagihan (itu akan menghitung ganda). Pengecualian: denda Mila
// tercatat 1.897.030 sementara sisa tagihannya 1.897.029 (selisih Rp1
// di sumber — lihat laporan-rekonsiliasi).
const BATAS = '2026-09-30';
const posisiSep = DATA_NYATA.tagihan
  .filter((t) => t.tanggalTerbit <= BATAS)
  .map((t) => {
    const dibayar = DATA_NYATA.pembayaran
      .filter(
        (p) =>
          p.tagihanId === t.id &&
          p.statusVerifikasi === 'Terverifikasi' &&
          p.tanggalBayar <= BATAS,
      )
      .reduce((s, p) => s + p.jumlah, 0);
    return {
      tagihanId: t.id,
      kontrakId: t.kontrakId,
      nilai: t.nilai,
      dibayar,
      sisa: Math.max(0, t.nilai - dibayar),
    };
  })
  .filter((p) => p.sisa > 0);

const tagihanSep = new Map(DATA_NYATA.tagihan.map((t) => [t.id, t]));
const dendaBelumDibayarSep = DATA_NYATA.denda
  .filter(
    (d) =>
      (d.status === 'Terhitung' || d.status === 'Ditagihkan') &&
      (tagihanSep.get(d.tagihanId)?.tanggalTerbit ?? '') <= BATAS,
  )
  .map((d) => ({
    dendaId: d.id,
    tagihanId: d.tagihanId,
    jumlah: d.jumlah,
    status: d.status,
  }));

// Jembatan Agustus: pembayaran Juli untuk tagihan Fisol/Mila/Herman
// (PKS 7052/7054/7060) yang dicatat tab AGUSTUS Sheet 5 sebagai setoran
// (tab itu mencatat setoran per kontrak yang tercantum, bukan arus kas
// bulanan — K-07/K-12). Dihitung dari data aplikasi, bukan hardcode angka.
const PKS_AGUSTUS_JEMBATAN = [
  '7052/PKS/RRI.PLB/07/2026',
  '7054/PKS/RRI.PLB/07/2026',
  '7060/PKS/RRI.PLB/07/2026',
];
const tagihanJembatan = new Set(
  DATA_NYATA.tagihan
    .filter((t) => PKS_AGUSTUS_JEMBATAN.includes(t.kontrakId))
    .map((t) => t.id),
);
const pembayaranJuliJembatan = DATA_NYATA.pembayaran
  .filter(
    (p) =>
      tagihanJembatan.has(p.tagihanId) && p.tanggalBayar.startsWith('2026-07'),
  )
  .reduce((s, p) => s + p.jumlah, 0);

// Jembatan acuan Keuangan (Sheet 3) vs pembayaran — pencocokan per NTPN.
// NTPN diekstrak dari uraian acuan ("NTPN <kode>") dan buktiSetor
// pembayaran ("NTB ... / NTPN <kode>"). Pasangan yang cocok dibandingkan
// per kode akun; sisanya dirinci sebagai pembayaran tanpa acuan (di luar
// periode Sheet 3) dan acuan tanpa pembayaran (di luar tagihan kerja sama).
const ntpnDari = (s: string) => (s.match(/NTPN\s+([A-Za-z0-9]+)/) || [])[1] || null;
const bayarPerNtpn = new Map<string, (typeof DATA_NYATA.pembayaran)[number]>();
for (const p of DATA_NYATA.pembayaran) {
  const n = ntpnDari(p.buktiSetor || '');
  if (n) bayarPerNtpn.set(n, p);
}
const tagihanKode = new Map(DATA_NYATA.tagihan.map((t) => [t.id, t.kodeAkun]));
const pasanganPerKode = new Map<string, { n: number; acuan: number; bayar: number }>();
const acuanTanpaPembayaran: { id: string; kodeAkun: string; periode: string; jumlah: number }[] = [];
let acuanTanpaNtpnJumlahBaris = 0;
let acuanTanpaNtpnTotal = 0;
for (const a of DATA_NYATA.penerimaanAcuan) {
  const n = ntpnDari(a.uraian || '');
  if (!n) {
    acuanTanpaNtpnJumlahBaris += 1;
    acuanTanpaNtpnTotal += a.jumlah;
    continue;
  }
  const p = bayarPerNtpn.get(n);
  if (!p) {
    acuanTanpaPembayaran.push({ id: a.id, kodeAkun: a.kodeAkun, periode: a.periode, jumlah: a.jumlah });
    continue;
  }
  const kunci = `${a.kodeAkun}/${tagihanKode.get(p.tagihanId) ?? '?'}`;
  const e = pasanganPerKode.get(kunci) ?? { n: 0, acuan: 0, bayar: 0 };
  e.n += 1;
  e.acuan += a.jumlah;
  e.bayar += p.jumlah;
  pasanganPerKode.set(kunci, e);
}
const ntpnAcuan = new Set(
  DATA_NYATA.penerimaanAcuan.map((a) => ntpnDari(a.uraian || '')).filter((x): x is string => x !== null),
);
const pembayaranTanpaAcuan = DATA_NYATA.pembayaran
  .filter((p) => {
    const n = ntpnDari(p.buktiSetor || '');
    return n !== null && !ntpnAcuan.has(n);
  })
  .map((p) => ({
    id: p.id,
    tagihanId: p.tagihanId,
    kodeAkun: tagihanKode.get(p.tagihanId),
    tanggalBayar: p.tanggalBayar,
    jumlah: p.jumlah,
  }));

const kontrol = hitungTotalKontrol(DATA_NYATA);

console.log(
  JSON.stringify(
    {
      perBulan,
      perBulanTanggalMulai,
      posisiAkhirSeptember: {
        jumlahTagihanBersisa: posisiSep.length,
        totalSisaTagihan: posisiSep.reduce((s, p) => s + p.sisa, 0),
        rincian: posisiSep,
        totalDendaBelumDibayar: dendaBelumDibayarSep.reduce(
          (s, d) => s + d.jumlah,
          0,
        ),
        rincianDenda: dendaBelumDibayarSep,
      },
      jembatanAgustus: {
        pembayaranJuliFisolMilaHerman: pembayaranJuliJembatan,
      },
      totalKontrol: kontrol,
      // Rekonsiliasi vs acuan Keuangan (butir (e) verifikasi): per kode akun.
      perKodeAkun: totalPerKodeAkun(DATA_NYATA),
      // Jembatan NTPN acuan vs pembayaran (butir (e) verifikasi).
      jembatanAcuan: {
        pasanganPerKode: [...pasanganPerKode.entries()].map(([kunci, v]) => ({ kunci, ...v })),
        pembayaranTanpaAcuan,
        acuanTanpaPembayaran,
        acuanTanpaNtpn: { jumlahBaris: acuanTanpaNtpnJumlahBaris, total: acuanTanpaNtpnTotal },
      },
    },
    null,
    2,
  ),
);

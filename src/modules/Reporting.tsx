// Modul Reporting — PRD v2.0 Final Bab 7.6.
// Laporan OTOMATIS: tidak ada form input isi; pengguna memilih jenis
// laporan dan periode, sistem menyusun dari data.
// TOTAL KONTROL wajib tampil di atas tabel laporan dan dihitung dari
// baris-baris laporan yang sama, sehingga total selalu sama dengan
// jumlah baris. Sel yang tidak ada nilainya diisi "0" (aturan kantor pusat).

import { useState } from 'react';
import type { ModulProps } from '../lib/store';
import type { JenisPnBP } from '../lib/types';
import {
  hitungTotalKontrol,
  dibayarTerverifikasi,
  sisaTagihan,
  statusTagihan,
  kelompokUmurPiutang,
} from '../lib/derive';
import { formatRupiah, formatPeriode, formatAngka, periodeDariTanggal } from '../lib/format';
import { jenisPnBPDariKodeAkun, uraianKodeAkun } from '../lib/master';
import { bolehAksi } from '../lib/permissions';
import {
  Kartu,
  JudulBagian,
  StatCard,
  StatusBadge,
  TombolUtama,
  TabBar,
  Peringatan,
  Label,
  inputClass,
} from '../components/ui';

const th =
  'border-b border-[#2573e2]/20 px-3 py-2 text-left text-xs font-semibold text-[#0d2569]/70';
const td = 'border-b border-[#2573e2]/10 px-3 py-2 text-sm text-[#0d2569]';
const tdKanan = `${td} text-right`;

type JenisLaporan = 'bulanan' | 'piutang' | 'kantor-pusat';
type StatusLaporan = 'Draft' | 'Diverifikasi' | 'Terkunci';

const TABS: { id: JenisLaporan; label: string }[] = [
  { id: 'bulanan', label: 'Bulanan PNBP' },
  { id: 'piutang', label: 'Piutang & Penyetoran' },
  { id: 'kantor-pusat', label: 'Kantor Pusat' },
];

const NAMA_FILE: Record<JenisLaporan, string> = {
  bulanan: 'bulanan-pnbp',
  piutang: 'piutang-penyetoran',
  'kantor-pusat': 'kantor-pusat',
};

const PERIODE_2026: string[] = Array.from(
  { length: 12 },
  (_, i) => `2026-${String(i + 1).padStart(2, '0')}`,
);

interface BarisBulanan {
  kontrakId: string;
  nomorPks: string;
  klien: string;
  jenisPnBP: JenisPnBP;
  kodeAkun: string;
  nilaiKontrak: number;
  nilaiTagihan: number;
  pembayaran: number;
  sisa: number;
}

interface BarisPiutang {
  nomor: string;
  kontrak: string;
  uraian: string;
  nilai: number;
  dibayar: number;
  sisa: number;
  status: string;
  umur: string;
  kodeAkun: string;
}

interface BarisSatker {
  satkerKode: string;
  satkerNama: string;
  qty: number;
  fungsional: number;
  umum: number;
  sisa: number;
}

function jumlahBarisBulanan(baris: BarisBulanan[]) {
  return baris.reduce(
    (s, b) => ({
      qty: s.qty + 1,
      nilaiKontrak: s.nilaiKontrak + b.nilaiKontrak,
      nilaiTagihan: s.nilaiTagihan + b.nilaiTagihan,
      pembayaran: s.pembayaran + b.pembayaran,
      sisa: s.sisa + b.sisa,
    }),
    { qty: 0, nilaiKontrak: 0, nilaiTagihan: 0, pembayaran: 0, sisa: 0 },
  );
}

function perKodeAkunDariBaris(baris: { kodeAkun: string; nilaiTagihan: number; pembayaran: number }[]) {
  const peta = new Map<string, { tagihan: number; pembayaran: number }>();
  baris.forEach((b) => {
    const lama = peta.get(b.kodeAkun) ?? { tagihan: 0, pembayaran: 0 };
    peta.set(b.kodeAkun, {
      tagihan: lama.tagihan + b.nilaiTagihan,
      pembayaran: lama.pembayaran + b.pembayaran,
    });
  });
  return [...peta.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([kodeAkun, v]) => ({ kodeAkun, ...v }));
}

function waktuSekarang(): string {
  return new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function unduhCsv(namaFile: string, baris: string[][]) {
  const isi = baris
    .map((r) =>
      r
        .map((sel) => {
          const teks = String(sel);
          return /[",\n]/.test(teks) ? `"${teks.replace(/"/g, '""')}"` : teks;
        })
        .join(','),
    )
    .join('\n');
  const blob = new Blob([isi], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = namaFile;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reporting(props: ModulProps) {
  const { data, user } = props;
  const [jenis, setJenis] = useState<JenisLaporan>('bulanan');
  const [periode, setPeriode] = useState('2026-02');
  const [status, setStatus] = useState<StatusLaporan>('Draft');
  const [verifikasiInfo, setVerifikasiInfo] = useState<string | null>(null);
  const [kunciInfo, setKunciInfo] = useState<string | null>(null);

  const kontrol = hitungTotalKontrol(data);

  const resetSnapshot = () => {
    setStatus('Draft');
    setVerifikasiInfo(null);
    setKunciInfo(null);
  };

  const pilihJenis = (j: JenisLaporan) => {
    setJenis(j);
    resetSnapshot();
  };

  const pilihPeriode = (p: string) => {
    setPeriode(p);
    resetSnapshot();
  };

  const namaKlien = (klienId: string): string =>
    data.klien.find((k) => k.id === klienId)?.nama ?? klienId;

  // ---------- Laporan Bulanan PNBP ----------
  const tagihanPeriode = data.tagihan.filter(
    (t) => periodeDariTanggal(t.tanggalTerbit) === periode,
  );

  const barisBulanan: BarisBulanan[] = data.kontrak
    .map((k) => {
      const tagihanKontrak = tagihanPeriode.filter((t) => t.kontrakId === k.id);
      if (tagihanKontrak.length === 0) return null;
      const kodeAkun = tagihanKontrak[0].kodeAkun;
      const nilaiTagihan = tagihanKontrak.reduce((s, t) => s + t.nilai, 0);
      const idTagihan = new Set(tagihanKontrak.map((t) => t.id));
      const pembayaran = data.pembayaran
        .filter(
          (p) =>
            p.statusVerifikasi === 'Terverifikasi' &&
            idTagihan.has(p.tagihanId) &&
            periodeDariTanggal(p.tanggalBayar) === periode,
        )
        .reduce((s, p) => s + p.jumlah, 0);
      return {
        kontrakId: k.id,
        nomorPks: k.nomorPks,
        klien: namaKlien(k.klienId),
        jenisPnBP: jenisPnBPDariKodeAkun(kodeAkun) ?? k.jenisPnBP,
        kodeAkun,
        nilaiKontrak: k.nilaiKontrak,
        nilaiTagihan,
        pembayaran,
        sisa: nilaiTagihan - pembayaran,
      } satisfies BarisBulanan;
    })
    .filter((b): b is BarisBulanan => b !== null);

  const barisFungsional = barisBulanan.filter((b) => b.jenisPnBP === 'Fungsional');
  const barisUmum = barisBulanan.filter((b) => b.jenisPnBP === 'Umum');
  const totalFungsional = jumlahBarisBulanan(barisFungsional);
  const totalUmum = jumlahBarisBulanan(barisUmum);
  const totalBulanan = jumlahBarisBulanan(barisBulanan);
  const rekapBulanan = {
    qty: totalFungsional.qty + totalUmum.qty,
    nilaiKontrak: totalFungsional.nilaiKontrak + totalUmum.nilaiKontrak,
    nilaiTagihan: totalFungsional.nilaiTagihan + totalUmum.nilaiTagihan,
    pembayaran: totalFungsional.pembayaran + totalUmum.pembayaran,
    sisa: totalFungsional.sisa + totalUmum.sisa,
  };
  const rekapCocok =
    rekapBulanan.qty === totalBulanan.qty &&
    rekapBulanan.nilaiTagihan === totalBulanan.nilaiTagihan &&
    rekapBulanan.pembayaran === totalBulanan.pembayaran &&
    rekapBulanan.sisa === totalBulanan.sisa;

  // ---------- Laporan Piutang & Penyetoran ----------
  const barisPiutang: BarisPiutang[] = data.tagihan.map((t) => ({
    nomor: t.nomor,
    kontrak:
      data.kontrak.find((k) => k.id === t.kontrakId)?.nomorPks ?? t.kontrakId,
    uraian: t.uraian,
    nilai: t.nilai,
    dibayar: dibayarTerverifikasi(t.id, data.pembayaran),
    sisa: sisaTagihan(t, data.pembayaran),
    status: statusTagihan(t, data.pembayaran),
    umur: kelompokUmurPiutang(t),
    kodeAkun: t.kodeAkun,
  }));
  const totalPiutang = barisPiutang.reduce(
    (s, b) => ({
      nilai: s.nilai + b.nilai,
      dibayar: s.dibayar + b.dibayar,
      sisa: s.sisa + b.sisa,
    }),
    { nilai: 0, dibayar: 0, sisa: 0 },
  );
  const piutangCocok = totalPiutang.sisa === kontrol.sisaPiutang;
  const kontrakPiutang = new Map(data.kontrak.map((k) => [k.id, k]));
  const nilaiKontrakPiutang = [...new Set(data.tagihan.map((t) => t.kontrakId))].reduce(
    (s, id) => s + (kontrakPiutang.get(id)?.nilaiKontrak ?? 0),
    0,
  );

  // ---------- Laporan Kantor Pusat ----------
  const satkerList = [...new Map(data.kontrak.map((k) => [k.satker.kode, k.satker])).values()];
  const barisSatker: BarisSatker[] = satkerList.map((satker) => {
    const kontrakSatker = data.kontrak.filter(
      (k) => k.satker.kode === satker.kode,
    );
    const qty = kontrakSatker.filter(
      (k) => periodeDariTanggal(k.tanggalMulai) === periode,
    ).length;
    const tagihanSatker = tagihanPeriode.filter(
      (t) => t.satker.kode === satker.kode,
    );
    const fungsional = tagihanSatker
      .filter((t) => t.kodeAkun === '425531')
      .reduce((s, t) => s + t.nilai, 0);
    const umum = tagihanSatker
      .filter((t) => t.kodeAkun === '425131')
      .reduce((s, t) => s + t.nilai, 0);
    const sisa = tagihanSatker.reduce(
      (s, t) => s + sisaTagihan(t, data.pembayaran),
      0,
    );
    return {
      satkerKode: satker.kode,
      satkerNama: satker.nama,
      qty,
      fungsional,
      umum,
      sisa,
    };
  });
  const totalSatker = barisSatker.reduce(
    (s, b) => ({
      qty: s.qty + b.qty,
      fungsional: s.fungsional + b.fungsional,
      umum: s.umum + b.umum,
      sisa: s.sisa + b.sisa,
    }),
    { qty: 0, fungsional: 0, umum: 0, sisa: 0 },
  );
  const idTagihanPeriode = new Set(tagihanPeriode.map((t) => t.id));
  const pembayaranPeriodeHq = data.pembayaran
    .filter(
      (p) =>
        p.statusVerifikasi === 'Terverifikasi' &&
        idTagihanPeriode.has(p.tagihanId) &&
        periodeDariTanggal(p.tanggalBayar) === periode,
    )
    .reduce((s, p) => s + p.jumlah, 0);
  const nilaiKontrakHq = data.kontrak
    .filter((k) => periodeDariTanggal(k.tanggalMulai) === periode)
    .reduce((s, k) => s + k.nilaiKontrak, 0);

  const eksporCsv = () => {
    const namaFile = `laporan-${NAMA_FILE[jenis]}-${periode}.csv`;
    if (jenis === 'bulanan') {
      const kepala = [
        'Bagian',
        'Nomor PKS',
        'Klien',
        'Jenis PNBP',
        'Kode Akun',
        'Nilai Tagihan Periode',
        'Pembayaran Periode',
        'Sisa',
      ];
      const isi: string[][] = [kepala];
      barisFungsional.forEach((b) =>
        isi.push([
          'Fungsional',
          b.nomorPks,
          b.klien,
          b.jenisPnBP,
          b.kodeAkun,
          String(b.nilaiTagihan),
          String(b.pembayaran),
          String(b.sisa),
        ]),
      );
      barisUmum.forEach((b) =>
        isi.push([
          'Umum',
          b.nomorPks,
          b.klien,
          b.jenisPnBP,
          b.kodeAkun,
          String(b.nilaiTagihan),
          String(b.pembayaran),
          String(b.sisa),
        ]),
      );
      isi.push([
        'Rekapitulasi',
        '',
        '',
        '',
        '',
        String(rekapBulanan.nilaiTagihan),
        String(rekapBulanan.pembayaran),
        String(rekapBulanan.sisa),
      ]);
      unduhCsv(namaFile, isi);
    } else if (jenis === 'piutang') {
      const isi: string[][] = [
        [
          'Nomor Tagihan',
          'Kontrak',
          'Uraian',
          'Nilai',
          'Dibayar Terverifikasi',
          'Sisa',
          'Status',
          'Umur Piutang',
        ],
      ];
      barisPiutang.forEach((b) =>
        isi.push([
          b.nomor,
          b.kontrak,
          b.uraian,
          String(b.nilai),
          String(b.dibayar),
          String(b.sisa),
          b.status,
          b.umur,
        ]),
      );
      isi.push([
        'Total',
        '',
        '',
        String(totalPiutang.nilai),
        String(totalPiutang.dibayar),
        String(totalPiutang.sisa),
        '',
        '',
      ]);
      unduhCsv(namaFile, isi);
    } else {
      const isi: string[][] = [
        ['Satker', 'QTY', 'PNBP Fungsional', 'PNBP Umum', 'Sisa Piutang'],
      ];
      barisSatker.forEach((b) =>
        isi.push([
          b.satkerNama,
          String(b.qty),
          String(b.fungsional),
          String(b.umum),
          String(b.sisa),
        ]),
      );
      isi.push([
        'TOTAL',
        String(totalSatker.qty),
        String(totalSatker.fungsional),
        String(totalSatker.umum),
        String(totalSatker.sisa),
      ]);
      unduhCsv(namaFile, isi);
    }
  };

  const verifikasiLaporan = () => {
    setStatus('Diverifikasi');
    setVerifikasiInfo(`${user.nama} — ${waktuSekarang()}`);
  };

  const kunciLaporan = () => {
    setStatus('Terkunci');
    setKunciInfo(`${user.nama} — ${waktuSekarang()}`);
  };

  const judulLaporan =
    jenis === 'bulanan'
      ? 'Laporan Bulanan PNBP'
      : jenis === 'piutang'
        ? 'Laporan Piutang & Penyetoran'
        : 'Laporan Kantor Pusat';

  return (
    <div className="space-y-4">
      <TabBar tabs={TABS} aktif={jenis} onPilih={(id) => pilihJenis(id as JenisLaporan)} />

      <Kartu>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label>Periode Laporan</Label>
            <select
              value={periode}
              onChange={(e) => pilihPeriode(e.target.value)}
              className={inputClass}
            >
              {PERIODE_2026.map((p) => (
                <option key={p} value={p}>
                  {formatPeriode(p)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Status Laporan</Label>
            <div className="pb-1">
              <StatusBadge status={status} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {status === 'Draft' && bolehAksi(user.peran, 'verifikasiLaporan') && (
              <TombolUtama onClick={verifikasiLaporan}>Verifikasi Laporan</TombolUtama>
            )}
            {status === 'Diverifikasi' && bolehAksi(user.peran, 'kunciLaporan') && (
              <TombolUtama onClick={kunciLaporan}>Kunci Laporan</TombolUtama>
            )}
          </div>
        </div>
        <p className="mt-3 text-sm text-[#0d2569]">
          {judulLaporan} — {formatPeriode(periode)}. Laporan disusun otomatis dari
          data; tidak ada isian manual.
        </p>
        {verifikasiInfo && (
          <p className="mt-1 text-xs text-[#0d2569]/60">
            Diverifikasi oleh {verifikasiInfo}
          </p>
        )}
        {kunciInfo && (
          <p className="mt-1 text-xs text-[#0d2569]/60">
            Dikunci oleh {kunciInfo}
          </p>
        )}
        {status === 'Terkunci' && (
          <div className="mt-3">
            <Peringatan teks="Snapshot terkunci untuk pengiriman (batas isi tanggal 10, kumpul file tanggal 11). Koreksi setelah terkunci membuat versi baru; versi ini tetap tersimpan." />
          </div>
        )}
      </Kartu>

      {/* TOTAL KONTROL — dihitung dari baris-baris laporan yang sama */}
      <Kartu>
        <JudulBagian>Total Kontrol — {judulLaporan}</JudulBagian>
        {jenis === 'bulanan' && (
          <>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard label="QTY (Jumlah PKS)" nilai={String(totalBulanan.qty)} />
              <StatCard label="Nilai Kontrak" nilai={formatRupiah(totalBulanan.nilaiKontrak)} />
              <StatCard label="Total Tagihan" nilai={formatRupiah(totalBulanan.nilaiTagihan)} />
              <StatCard label="Total Pembayaran" nilai={formatRupiah(totalBulanan.pembayaran)} />
              <StatCard label="Sisa Piutang" nilai={formatRupiah(totalBulanan.sisa)} />
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={th}>Kode Akun</th>
                    <th className={th}>Uraian</th>
                    <th className={`${th} text-right`}>Tagihan</th>
                    <th className={`${th} text-right`}>Pembayaran</th>
                  </tr>
                </thead>
                <tbody>
                  {perKodeAkunDariBaris(barisBulanan).map((r) => (
                    <tr key={r.kodeAkun}>
                      <td className={td}>{r.kodeAkun}</td>
                      <td className={td}>{uraianKodeAkun(r.kodeAkun)}</td>
                      <td className={tdKanan}>{formatRupiah(r.tagihan)}</td>
                      <td className={tdKanan}>{formatRupiah(r.pembayaran)}</td>
                    </tr>
                  ))}
                  {barisBulanan.length === 0 && (
                    <tr>
                      <td className={td} colSpan={4}>
                        Tidak ada tagihan terbit pada periode ini — semua nilai 0.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {!rekapCocok && (
              <div className="mt-3">
                <Peringatan teks="Selisih terdeteksi: total Rekapitulasi tidak sama dengan Fungsional + Umum. Periksa baris laporan di bawah." />
              </div>
            )}
          </>
        )}
        {jenis === 'piutang' && (
          <>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard
                label="QTY (Jumlah PKS)"
                nilai={String(new Set(data.tagihan.map((t) => t.kontrakId)).size)}
              />
              <StatCard label="Nilai Kontrak" nilai={formatRupiah(nilaiKontrakPiutang)} />
              <StatCard label="Total Tagihan" nilai={formatRupiah(totalPiutang.nilai)} />
              <StatCard label="Total Pembayaran" nilai={formatRupiah(totalPiutang.dibayar)} />
              <StatCard label="Sisa Piutang" nilai={formatRupiah(totalPiutang.sisa)} />
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={th}>Kode Akun</th>
                    <th className={th}>Uraian</th>
                    <th className={`${th} text-right`}>Tagihan</th>
                    <th className={`${th} text-right`}>Pembayaran</th>
                  </tr>
                </thead>
                <tbody>
                  {perKodeAkunDariBaris(
                    barisPiutang.map((b) => ({
                      kodeAkun: b.kodeAkun,
                      nilaiTagihan: b.nilai,
                      pembayaran: b.dibayar,
                    })),
                  ).map((r) => (
                    <tr key={r.kodeAkun}>
                      <td className={td}>{r.kodeAkun}</td>
                      <td className={td}>{uraianKodeAkun(r.kodeAkun)}</td>
                      <td className={tdKanan}>{formatRupiah(r.tagihan)}</td>
                      <td className={tdKanan}>{formatRupiah(r.pembayaran)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-[#0d2569]">
              Sisa piutang laporan: {formatRupiah(totalPiutang.sisa)} — sisa piutang
              operasional: {formatRupiah(kontrol.sisaPiutang)} —{' '}
              {piutangCocok ? (
                <span className="font-semibold">Cocok</span>
              ) : (
                <span className="font-semibold">Tidak cocok — periksa baris laporan.</span>
              )}
            </p>
            {!piutangCocok && (
              <div className="mt-3">
                <Peringatan teks="Selisih terdeteksi: total sisa piutang laporan tidak sama dengan sisa piutang operasional." />
              </div>
            )}
          </>
        )}
        {jenis === 'kantor-pusat' && (
          <>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard label="QTY (Jumlah PKS)" nilai={String(totalSatker.qty)} />
              <StatCard label="Nilai Kontrak" nilai={formatRupiah(nilaiKontrakHq)} />
              <StatCard
                label="Total Tagihan"
                nilai={formatRupiah(totalSatker.fungsional + totalSatker.umum)}
              />
              <StatCard label="Total Pembayaran" nilai={formatRupiah(pembayaranPeriodeHq)} />
              <StatCard label="Sisa Piutang" nilai={formatRupiah(totalSatker.sisa)} />
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={th}>Kode Akun</th>
                    <th className={th}>Uraian</th>
                    <th className={`${th} text-right`}>Tagihan</th>
                    <th className={`${th} text-right`}>Pembayaran</th>
                  </tr>
                </thead>
                <tbody>
                  {perKodeAkunDariBaris(
                    tagihanPeriode.map((t) => ({
                      kodeAkun: t.kodeAkun,
                      nilaiTagihan: t.nilai,
                      pembayaran: data.pembayaran
                        .filter(
                          (p) =>
                            p.statusVerifikasi === 'Terverifikasi' &&
                            p.tagihanId === t.id &&
                            periodeDariTanggal(p.tanggalBayar) === periode,
                        )
                        .reduce((s, p) => s + p.jumlah, 0),
                    })),
                  ).map((r) => (
                    <tr key={r.kodeAkun}>
                      <td className={td}>{r.kodeAkun}</td>
                      <td className={td}>{uraianKodeAkun(r.kodeAkun)}</td>
                      <td className={tdKanan}>{formatRupiah(r.tagihan)}</td>
                      <td className={tdKanan}>{formatRupiah(r.pembayaran)}</td>
                    </tr>
                  ))}
                  {tagihanPeriode.length === 0 && (
                    <tr>
                      <td className={td} colSpan={4}>
                        Tidak ada tagihan terbit pada periode ini — semua nilai 0.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Kartu>

      <div className="flex flex-wrap items-center gap-3">
        <TombolUtama onClick={eksporCsv}>Ekspor CSV</TombolUtama>
        <p className="text-xs text-[#0d2569]/60">
          File: laporan-{NAMA_FILE[jenis]}-{periode}.csv — angka mentah tanpa Rp dan
          tanpa pemisah ribuan.
        </p>
      </div>

      {jenis === 'bulanan' && (
        <Kartu>
          <JudulBagian>{judulLaporan} — {formatPeriode(periode)}</JudulBagian>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={th}>Nomor PKS</th>
                  <th className={th}>Klien</th>
                  <th className={th}>Jenis PNBP</th>
                  <th className={th}>Kode Akun</th>
                  <th className={`${th} text-right`}>Nilai Tagihan Periode</th>
                  <th className={`${th} text-right`}>Pembayaran Periode</th>
                  <th className={`${th} text-right`}>Sisa</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-[#2573e2]/5">
                  <td className={`${td} font-bold`} colSpan={7}>
                    Fungsional
                  </td>
                </tr>
                {barisFungsional.map((b) => (
                  <tr key={b.kontrakId}>
                    <td className={td}>{b.nomorPks}</td>
                    <td className={td}>{b.klien}</td>
                    <td className={td}>{b.jenisPnBP}</td>
                    <td className={td}>{b.kodeAkun}</td>
                    <td className={tdKanan}>{formatRupiah(b.nilaiTagihan)}</td>
                    <td className={tdKanan}>{formatRupiah(b.pembayaran)}</td>
                    <td className={tdKanan}>{formatRupiah(b.sisa)}</td>
                  </tr>
                ))}
                {barisFungsional.length === 0 && (
                  <tr>
                    <td className={td} colSpan={7}>
                      Tidak ada tagihan Fungsional pada periode ini — 0.
                    </td>
                  </tr>
                )}
                <tr className="bg-[#2573e2]/5">
                  <td className={`${td} font-bold`} colSpan={7}>
                    Umum
                  </td>
                </tr>
                {barisUmum.map((b) => (
                  <tr key={b.kontrakId}>
                    <td className={td}>{b.nomorPks}</td>
                    <td className={td}>{b.klien}</td>
                    <td className={td}>{b.jenisPnBP}</td>
                    <td className={td}>{b.kodeAkun}</td>
                    <td className={tdKanan}>{formatRupiah(b.nilaiTagihan)}</td>
                    <td className={tdKanan}>{formatRupiah(b.pembayaran)}</td>
                    <td className={tdKanan}>{formatRupiah(b.sisa)}</td>
                  </tr>
                ))}
                {barisUmum.length === 0 && (
                  <tr>
                    <td className={td} colSpan={7}>
                      Tidak ada tagihan Umum pada periode ini — 0.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-[#2573e2]/5 font-bold">
                  <td className={td} colSpan={4}>
                    Rekapitulasi
                  </td>
                  <td className={tdKanan}>{formatRupiah(rekapBulanan.nilaiTagihan)}</td>
                  <td className={tdKanan}>{formatRupiah(rekapBulanan.pembayaran)}</td>
                  <td className={tdKanan}>{formatRupiah(rekapBulanan.sisa)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mt-3 text-xs text-[#0d2569]/60">
            Rekapitulasi = Fungsional + Umum, dihitung dari baris-baris di atas.
            Pembayaran periode hanya menghitung pembayaran terverifikasi yang
            tanggal bayarnya pada periode ini.
          </p>
        </Kartu>
      )}

      {jenis === 'piutang' && (
        <Kartu>
          <JudulBagian>{judulLaporan} — {formatPeriode(periode)}</JudulBagian>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={th}>Nomor Tagihan</th>
                  <th className={th}>Kontrak</th>
                  <th className={th}>Uraian</th>
                  <th className={`${th} text-right`}>Nilai</th>
                  <th className={`${th} text-right`}>Dibayar (Terverifikasi)</th>
                  <th className={`${th} text-right`}>Sisa</th>
                  <th className={th}>Status</th>
                  <th className={th}>Umur Piutang</th>
                </tr>
              </thead>
              <tbody>
                {barisPiutang.map((b) => (
                  <tr key={b.nomor}>
                    <td className={td}>{b.nomor}</td>
                    <td className={td}>{b.kontrak}</td>
                    <td className={td}>{b.uraian}</td>
                    <td className={tdKanan}>{formatRupiah(b.nilai)}</td>
                    <td className={tdKanan}>{formatRupiah(b.dibayar)}</td>
                    <td className={tdKanan}>{formatRupiah(b.sisa)}</td>
                    <td className={td}>
                      <StatusBadge status={b.status} />
                    </td>
                    <td className={td}>{b.umur}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#2573e2]/5 font-bold">
                  <td className={td} colSpan={3}>
                    Total
                  </td>
                  <td className={tdKanan}>{formatRupiah(totalPiutang.nilai)}</td>
                  <td className={tdKanan}>{formatRupiah(totalPiutang.dibayar)}</td>
                  <td className={tdKanan}>{formatRupiah(totalPiutang.sisa)}</td>
                  <td className={td} colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mt-3 text-xs text-[#0d2569]/60">
            Laporan ini menampilkan seluruh tagihan; total sisa piutang dihitung
            dengan fungsi derive yang sama dengan total operasional, sehingga
            keduanya cocok.
          </p>
        </Kartu>
      )}

      {jenis === 'kantor-pusat' && (
        <Kartu>
          <JudulBagian>{judulLaporan} — {formatPeriode(periode)}</JudulBagian>
          <p className="mt-1 text-xs text-[#0d2569]/60">
            Format kantor pusat: satu baris per satker. Sel tanpa nilai diisi 0.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={th}>Satker</th>
                  <th className={`${th} text-right`}>QTY</th>
                  <th className={`${th} text-right`}>PNBP Fungsional</th>
                  <th className={`${th} text-right`}>PNBP Umum</th>
                  <th className={`${th} text-right`}>Sisa Piutang</th>
                </tr>
              </thead>
              <tbody>
                {barisSatker.map((b) => (
                  <tr key={b.satkerKode}>
                    <td className={td}>{b.satkerNama}</td>
                    <td className={tdKanan}>{formatAngka(b.qty)}</td>
                    <td className={tdKanan}>{formatAngka(b.fungsional)}</td>
                    <td className={tdKanan}>{formatAngka(b.umum)}</td>
                    <td className={tdKanan}>{formatAngka(b.sisa)}</td>
                  </tr>
                ))}
                {barisSatker.length === 0 && (
                  <tr>
                    <td className={td}>—</td>
                    <td className={tdKanan}>0</td>
                    <td className={tdKanan}>0</td>
                    <td className={tdKanan}>0</td>
                    <td className={tdKanan}>0</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-[#2573e2]/5 font-bold">
                  <td className={td}>TOTAL</td>
                  <td className={tdKanan}>{formatAngka(totalSatker.qty)}</td>
                  <td className={tdKanan}>{formatAngka(totalSatker.fungsional)}</td>
                  <td className={tdKanan}>{formatAngka(totalSatker.umum)}</td>
                  <td className={tdKanan}>{formatAngka(totalSatker.sisa)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mt-3 text-xs text-[#0d2569]/60">
            QTY = jumlah PKS yang mulai pada bulan ini (bukan jumlah siaran).
            PNBP Fungsional/Umum = nilai tagihan kode 425531/425131 yang terbit
            pada periode ini. Sisa Piutang = sisa tagihan yang terbit pada periode
            ini.
          </p>
        </Kartu>
      )}
    </div>
  );
}

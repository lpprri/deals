// Dashboard — Fase A (PRD v2.0 Final Bab 4 & Bab 7.5).
// Semua angka dihitung dari data lewat derive.ts (satu sumber hitung),
// sehingga cocok dengan Revenue dan Reporting.

import type { ModulProps } from '../lib/store';
import {
  hitungTotalKontrol,
  sisaTagihan,
  statusTagihan,
  totalPerKodeAkun,
} from '../lib/derive';
import { formatAngka, formatRupiah, formatTanggal, hariIniIso, selisihHari } from '../lib/format';
import { uraianKodeAkun } from '../lib/master';
import { formatWaktuAudit } from '../lib/audit';
import {
  JudulBagian,
  Kartu,
  PesanKosong,
  StatCard,
  StatusBadge,
} from '../components/ui';

/** Tanggal ISO (yyyy-mm-dd) untuk hari tertentu di bulan berikutnya. */
function tanggalBulanBerikutnya(hari: number): string {
  const now = new Date();
  const tahun =
    now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
  const bulan = now.getMonth() === 11 ? 1 : now.getMonth() + 2;
  return `${tahun}-${String(bulan).padStart(2, '0')}-${String(hari).padStart(2, '0')}`;
}

function labelSisaHari(jumlahHari: number): string {
  if (jumlahHari < 0) return 'sudah lewat';
  if (jumlahHari === 0) return 'hari ini';
  if (jumlahHari === 1) return '1 hari lagi';
  return `${jumlahHari} hari lagi`;
}

export default function Dashboard({ data }: ModulProps) {
  const total = hitungTotalKontrol(data);
  const hariIni = hariIniIso();
  const perKodeAkun = totalPerKodeAkun(data);

  // (b) Deadline laporan kantor pusat: isi tgl 10, kumpul file tgl 11.
  const batasIsi = tanggalBulanBerikutnya(10);
  const batasKumpul = tanggalBulanBerikutnya(11);
  const sisaIsi = selisihHari(hariIni, batasIsi);
  const sisaKumpul = selisihHari(hariIni, batasKumpul);

  // (c) Perlu perhatian — dikumpulkan dari data.
  interface Perhatian {
    kategori: string;
    teks: string;
    detail: string;
  }
  const perhatian: Perhatian[] = [];

  data.tagihan
    .filter((t) => statusTagihan(t, data.pembayaran) === 'Lewat Jatuh Tempo')
    .forEach((t) => {
      perhatian.push({
        kategori: 'Tagihan lewat jatuh tempo',
        teks: `${t.nomor} — ${t.uraian}`,
        detail: `Jatuh tempo ${formatTanggal(t.tanggalJatuhTempo)} · Sisa ${formatRupiah(sisaTagihan(t, data.pembayaran))}`,
      });
    });

  data.dokumen
    .filter((d) => d.status === 'Belum Ada')
    .forEach((d) => {
      perhatian.push({
        kategori: 'Dokumen belum ada',
        teks: `${d.jenisDokumen} — ${d.kontrakId}`,
        detail: d.catatan ?? 'Dokumen kontrak belum diunggah.',
      });
    });

  data.pengajuan
    .filter((p) => ['Masuk', 'Ditelaah', 'Menunggu Dokumen'].includes(p.tahap))
    .forEach((p) => {
      perhatian.push({
        kategori: 'Pengajuan perlu ditindaklanjuti',
        teks: `${p.id} — ${p.pemohon}`,
        detail: `Tahap: ${p.tahap} · Masuk ${formatTanggal(p.tanggalMasuk)}`,
      });
    });

  data.sewa
    .filter((s) => {
      const sisa = selisihHari(hariIni, s.tanggalSelesai);
      return s.status === 'ON GOING' && sisa >= 0 && sisa <= 60;
    })
    .forEach((s) => {
      const sisa = selisihHari(hariIni, s.tanggalSelesai);
      perhatian.push({
        kategori: 'Sewa segera berakhir',
        teks: `${s.aset} — ${s.penyewaNama}`,
        detail: `Berakhir ${formatTanggal(s.tanggalSelesai)} (${sisa} hari lagi)`,
      });
    });

  // Selisih rekonsiliasi hanya bermakna bila data acuan Keuangan ada.
  // Bila penerimaanAcuan kosong (Sheet 3 belum diimpor), selisih = 0 −
  // pembayaran terverifikasi dan BUKAN selisih yang sebenarnya.
  if (data.penerimaanAcuan.length > 0 && total.selisihRekonsiliasi !== 0) {
    perhatian.push({
      kategori: 'Selisih rekonsiliasi',
      teks: `Selisih ${formatRupiah(total.selisihRekonsiliasi)} antara penerimaan acuan Keuangan dan pembayaran terverifikasi`,
      detail: 'Penerimaan tanpa tagihan',
    });
  }

  const aktivitasTerakhir = [...data.audit]
    .sort((a, b) => (a.waktu < b.waktu ? 1 : a.waktu > b.waktu ? -1 : 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#0d2569]/70">
        Ringkasan periode — Satker pilot PALEMBANG. Semua angka dihitung
        dari data nyata hasil impor spreadsheet (14/11/2026) yang sama dengan
        modul lain; data contoh Fase B tetap berlabel &quot;(Contoh)&quot;.
      </p>

      {/* (a) Kartu statistik */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          label="PKS aktif"
          nilai={formatAngka(total.jumlahPks)}
          keterangan="Kontrak berstatus Aktif"
        />
        <StatCard
          label="Nilai kontrak total"
          nilai={formatRupiah(total.nilaiKontrak)}
        />
        <StatCard
          label="Pembayaran terverifikasi"
          nilai={formatRupiah(total.totalPembayaranTerverifikasi)}
        />
        <StatCard
          label="Sisa piutang"
          nilai={formatRupiah(total.sisaPiutang)}
        />
        <StatCard
          label="Denda tercatat"
          nilai={formatRupiah(total.totalDenda)}
        />
      </div>

      {/* (b) Deadline laporan kantor pusat */}
      <Kartu>
        <JudulBagian>Deadline laporan kantor pusat</JudulBagian>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-[#2573e2]/20 bg-[#2573e2]/5 p-4">
            <p className="text-xs font-semibold text-[#0d2569]/70">
              Batas pengisian laporan
            </p>
            <p className="mt-1 text-lg font-bold text-[#0d2569]">
              {formatTanggal(batasIsi)}
            </p>
            <p className="mt-1 text-sm text-[#0d2569]/70">
              {labelSisaHari(sisaIsi)}
            </p>
          </div>
          <div className="rounded-md border border-[#2573e2]/20 bg-[#2573e2]/5 p-4">
            <p className="text-xs font-semibold text-[#0d2569]/70">
              Batas pengumpulan file ke kantor pusat
            </p>
            <p className="mt-1 text-lg font-bold text-[#0d2569]">
              {formatTanggal(batasKumpul)}
            </p>
            <p className="mt-1 text-sm text-[#0d2569]/70">
              {labelSisaHari(sisaKumpul)}
            </p>
          </div>
        </div>
      </Kartu>

      {/* (c) Perlu perhatian */}
      <Kartu>
        <JudulBagian>Perlu perhatian</JudulBagian>
        {perhatian.length === 0 ? (
          <div className="mt-3">
            <PesanKosong teks="Tidak ada yang perlu perhatian saat ini." />
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {perhatian.map((item, i) => (
              <li
                key={`${item.kategori}-${i}`}
                className="rounded-md border border-[#2573e2]/20 px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={item.kategori} />
                </div>
                <p className="mt-2 text-sm font-semibold text-[#0d2569]">
                  {item.teks}
                </p>
                <p className="mt-1 text-xs text-[#0d2569]/70">{item.detail}</p>
              </li>
            ))}
          </ul>
        )}
      </Kartu>

      {/* (d) Ringkasan per kode akun */}
      <Kartu>
        <JudulBagian>Ringkasan per kode akun</JudulBagian>
        {perKodeAkun.length === 0 ? (
          <div className="mt-3">
            <PesanKosong teks="Belum ada tagihan atau penerimaan acuan." />
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2573e2]/20 text-left text-xs text-[#0d2569]/60">
                  <th className="py-2 pr-3 font-semibold">Kode Akun</th>
                  <th className="py-2 pr-3 font-semibold">Uraian</th>
                  <th className="py-2 pr-3 text-right font-semibold">Tagihan</th>
                  <th className="py-2 pr-3 text-right font-semibold">Pembayaran</th>
                  <th className="py-2 pr-3 text-right font-semibold">Acuan Keuangan</th>
                  <th className="py-2 text-right font-semibold">Selisih</th>
                </tr>
              </thead>
              <tbody>
                {perKodeAkun.map((r) => (
                  <tr
                    key={r.kodeAkun}
                    className="border-b border-[#2573e2]/10 text-[#0d2569]"
                  >
                    <td className="py-2 pr-3 font-semibold">{r.kodeAkun}</td>
                    <td className="py-2 pr-3">{uraianKodeAkun(r.kodeAkun)}</td>
                    <td className="py-2 pr-3 text-right">
                      {formatRupiah(r.tagihan)}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {formatRupiah(r.pembayaran)}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {formatRupiah(r.acuan)}
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {formatRupiah(r.selisih)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Kartu>

      {/* (e) Aktivitas terakhir */}
      <Kartu>
        <JudulBagian>Aktivitas terakhir</JudulBagian>
        {aktivitasTerakhir.length === 0 ? (
          <div className="mt-3">
            <PesanKosong teks="Belum ada aktivitas tercatat." />
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {aktivitasTerakhir.map((a) => (
              <li
                key={a.id}
                className="border-b border-[#2573e2]/10 pb-3 text-sm last:border-0 last:pb-0"
              >
                <p className="font-semibold text-[#0d2569]">{a.aksi}</p>
                <p className="mt-0.5 text-xs text-[#0d2569]/70">
                  {formatWaktuAudit(a.waktu)} · {a.pengguna} · {a.entitas}{' '}
                  {a.entitasId}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Kartu>
    </div>
  );
}

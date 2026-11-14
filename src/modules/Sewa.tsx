// Modul Sewa / BMN (PRD v2.0 Final Bab 7.9).
// Palet HANYA 3 warna RRI: Biru #2573E2, Navy #0D2569, Putih #FFFFFF.

import { useState } from 'react';
import type { Sewa as SewaItem } from '../lib/types';
import type { ModulProps } from '../lib/store';
import { formatRupiah, formatTanggal, hariIniIso, selisihHari } from '../lib/format';
import {
  JudulBagian,
  Kartu,
  PesanKosong,
  StatusBadge,
  TabBar,
  TombolSekunder,
} from '../components/ui';

const th = 'px-3 py-2 text-left text-xs font-semibold text-[#0d2569]/70';
const td = 'px-3 py-2 align-top text-sm text-[#0d2569]';
const barisKlik =
  'cursor-pointer border-t border-[#2573e2]/10 hover:bg-[#2573e2]/5';

type FilterId =
  | 'semua'
  | 'onGoing'
  | 'akanBerakhir'
  | 'pengajuanBaru'
  | 'diterimaDiMuka'
  | 'masihHarusDiterima'
  | 'temuan'
  | 'indralaya';

function cocokFilter(sewa: SewaItem, filter: FilterId): boolean {
  switch (filter) {
    case 'semua':
      return true;
    case 'onGoing':
      return sewa.status === 'ON GOING';
    case 'akanBerakhir':
      return (
        sewa.status === 'ON GOING' &&
        selisihHari(hariIniIso(), sewa.tanggalSelesai) >= 0 &&
        selisihHari(hariIniIso(), sewa.tanggalSelesai) <= 60
      );
    case 'pengajuanBaru':
      return sewa.status === 'Pengajuan';
    case 'diterimaDiMuka':
      return sewa.diterimaDiMuka > 0;
    case 'masihHarusDiterima':
      return sewa.masihHarusDiterima > 0;
    case 'temuan':
      return sewa.temuan.length > 0;
    case 'indralaya':
      return sewa.lokasi.toLowerCase().includes('indralaya');
    default:
      return true;
  }
}

export default function Sewa(props: ModulProps) {
  const { data, cari } = props;
  const [filter, setFilter] = useState<FilterId>('semua');
  const [sewaIdTerpilih, setSewaIdTerpilih] = useState<string | null>(null);

  const hitung = (f: FilterId) =>
    data.sewa.filter((s) => cocokFilter(s, f)).length;

  const kataKunci = cari.trim().toLowerCase();
  const sewaTersaring = data.sewa.filter(
    (s) =>
      cocokFilter(s, filter) &&
      (kataKunci === '' ||
        `${s.aset} ${s.lokasi} ${s.penyewaNama} ${s.nomorPerjanjian}`
          .toLowerCase()
          .includes(kataKunci)),
  );

  const sewaTerpilih = sewaIdTerpilih
    ? data.sewa.find((s) => s.id === sewaIdTerpilih) ?? null
    : null;

  if (sewaTerpilih) {
    return (
      <DetailSewa data={data} sewa={sewaTerpilih} onKembali={() => setSewaIdTerpilih(null)} />
    );
  }

  return (
    <div className="space-y-4">
      <TabBar
        tabs={[
          { id: 'semua', label: `Semua (${hitung('semua')})` },
          { id: 'onGoing', label: `ON GOING (${hitung('onGoing')})` },
          { id: 'akanBerakhir', label: `Akan Berakhir (${hitung('akanBerakhir')})` },
          { id: 'pengajuanBaru', label: `Pengajuan Baru (${hitung('pengajuanBaru')})` },
          { id: 'diterimaDiMuka', label: `Diterima di Muka (${hitung('diterimaDiMuka')})` },
          { id: 'masihHarusDiterima', label: `Masih Harus Diterima (${hitung('masihHarusDiterima')})` },
          { id: 'temuan', label: `Temuan Lapangan (${hitung('temuan')})` },
          { id: 'indralaya', label: `Indralaya (${hitung('indralaya')})` },
        ]}
        aktif={filter}
        onPilih={(id) => setFilter(id as FilterId)}
      />

      {sewaTersaring.length === 0 ? (
        <PesanKosong teks="Belum ada sewa yang cocok dengan filter ini." />
      ) : (
        <Kartu className="overflow-x-auto p-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#2573e2]/5">
                <th className={th}>Aset</th>
                <th className={th}>Lokasi</th>
                <th className={th}>Penyewa</th>
                <th className={th}>Nomor Perjanjian</th>
                <th className={th}>Periode</th>
                <th className={th}>Nilai Sewa</th>
                <th className={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sewaTersaring.map((s) => (
                <tr
                  key={s.id}
                  className={barisKlik}
                  onClick={() => setSewaIdTerpilih(s.id)}
                >
                  <td className={`${td} font-semibold`}>{s.aset}</td>
                  <td className={td}>{s.lokasi}</td>
                  <td className={td}>{s.penyewaNama}</td>
                  <td className={td}>{s.nomorPerjanjian}</td>
                  <td className={td}>
                    {formatTanggal(s.tanggalMulai)} –{' '}
                    {formatTanggal(s.tanggalSelesai)}
                  </td>
                  <td className={td}>{formatRupiah(s.nilaiSewa)}</td>
                  <td className={td}>
                    <StatusBadge status={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Kartu>
      )}
    </div>
  );
}

function DetailSewa({
  data,
  sewa,
  onKembali,
}: {
  data: ModulProps['data'];
  sewa: SewaItem;
  onKembali: () => void;
}) {
  const kontrak = sewa.kontrakId
    ? data.kontrak.find((k) => k.id === sewa.kontrakId)
    : undefined;
  const sisaHari = selisihHari(hariIniIso(), sewa.tanggalSelesai);

  return (
    <div className="space-y-4">
      <TombolSekunder onClick={onKembali}>&larr; Kembali ke daftar</TombolSekunder>
      <JudulBagian>{sewa.aset}</JudulBagian>

      <Kartu>
        <dl className="grid gap-2 text-sm md:grid-cols-2">
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Lokasi</dt>
            <dd className="text-right text-[#0d2569]">{sewa.lokasi}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Penyewa</dt>
            <dd className="text-right font-semibold text-[#0d2569]">
              {sewa.penyewaNama}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Nomor perjanjian</dt>
            <dd className="text-[#0d2569]">{sewa.nomorPerjanjian}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Periode</dt>
            <dd className="text-[#0d2569]">
              {formatTanggal(sewa.tanggalMulai)} –{' '}
              {formatTanggal(sewa.tanggalSelesai)}
              {sewa.status === 'ON GOING' &&
                (sisaHari >= 0
                  ? ` (${sisaHari} hari lagi)`
                  : ` (lewat ${-sisaHari} hari)`)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Nilai sewa</dt>
            <dd className="font-semibold text-[#0d2569]">
              {formatRupiah(sewa.nilaiSewa)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Status</dt>
            <dd>
              <StatusBadge status={sewa.status} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Diterima di muka</dt>
            <dd className="text-[#0d2569]">{formatRupiah(sewa.diterimaDiMuka)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Masih harus diterima</dt>
            <dd className="text-[#0d2569]">
              {formatRupiah(sewa.masihHarusDiterima)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Satker</dt>
            <dd className="text-[#0d2569]">
              {sewa.satker.nama} ({sewa.satker.kode})
            </dd>
          </div>
          {kontrak && (
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Kontrak terkait</dt>
              <dd className="text-right text-[#0d2569]">
                {kontrak.nomorPks} — {formatRupiah(kontrak.nilaiKontrak)}
              </dd>
            </div>
          )}
        </dl>
      </Kartu>

      <Kartu>
        <JudulBagian>Riwayat harga</JudulBagian>
        <p className="mt-1 text-xs text-[#0d2569]/70">
          Kenaikan harga dicatat sebagai riwayat — nilai lama tidak ditimpa.
        </p>
        {sewa.riwayatHarga.length === 0 ? (
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Belum ada riwayat harga.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#2573e2]/5">
                  <th className={th}>Tanggal Berlaku</th>
                  <th className={th}>Nilai</th>
                </tr>
              </thead>
              <tbody>
                {[...sewa.riwayatHarga]
                  .sort((a, b) => (a.tanggalBerlaku < b.tanggalBerlaku ? -1 : 1))
                  .map((r, i) => (
                    <tr key={i} className="border-t border-[#2573e2]/10">
                      <td className={td}>{formatTanggal(r.tanggalBerlaku)}</td>
                      <td className={td}>{formatRupiah(r.nilai)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Kartu>

      <Kartu>
        <JudulBagian>Temuan lapangan</JudulBagian>
        {sewa.temuan.length === 0 ? (
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Tidak ada temuan lapangan.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#2573e2]/5">
                  <th className={th}>Tanggal</th>
                  <th className={th}>Uraian</th>
                  <th className={th}>Tindak Lanjut</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sewa.temuan.map((t, i) => (
                  <tr key={i} className="border-t border-[#2573e2]/10">
                    <td className={td}>{formatTanggal(t.tanggal)}</td>
                    <td className={td}>{t.uraian}</td>
                    <td className={td}>{t.tindakLanjut}</td>
                    <td className={td}>
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Kartu>
    </div>
  );
}

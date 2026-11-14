// Modul Sewa / BMN (PRD v2.0 Final Bab 7.9).
// Palet HANYA 3 warna RRI: Biru #2573E2, Navy #0D2569, Putih #FFFFFF.

import { useState } from 'react';
import type { Sewa as SewaItem } from '../lib/types';
import type { ModulProps } from '../lib/store';
import { formatRupiah, formatTanggal, hariIniIso, selisihHari } from '../lib/format';
import {
  Baris,
  JudulBagian,
  Kartu,
  PesanKosong,
  StatusBadge,
  TabBar,
  Tabel,
  Td,
  Th,
  TombolSekunder,
} from '../components/ui';

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
        <Kartu>
          <Tabel>
            <thead>
              <tr>
                <Th>Aset</Th>
                <Th>Lokasi</Th>
                <Th>Penyewa</Th>
                <Th>Nomor Perjanjian</Th>
                <Th>Periode</Th>
                <Th kanan>Nilai Sewa</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {sewaTersaring.map((s) => (
                <Baris
                  key={s.id}
                  onClick={() => setSewaIdTerpilih(s.id)}
                  className="border-t border-[#2573e2]/10"
                >
                  <Td tebal>{s.aset}</Td>
                  <Td>{s.lokasi}</Td>
                  <Td>{s.penyewaNama}</Td>
                  <Td>{s.nomorPerjanjian}</Td>
                  <Td>
                    {formatTanggal(s.tanggalMulai)} –{' '}
                    {formatTanggal(s.tanggalSelesai)}
                  </Td>
                  <Td kanan>{formatRupiah(s.nilaiSewa)}</Td>
                  <Td>
                    <StatusBadge status={s.status} />
                  </Td>
                </Baris>
              ))}
            </tbody>
          </Tabel>
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
          <div className="mt-3">
            <Tabel>
              <thead>
                <tr>
                  <Th>Tanggal Berlaku</Th>
                  <Th kanan>Nilai</Th>
                </tr>
              </thead>
              <tbody>
                {[...sewa.riwayatHarga]
                  .sort((a, b) => (a.tanggalBerlaku < b.tanggalBerlaku ? -1 : 1))
                  .map((r, i) => (
                    <Baris key={i}>
                      <Td>{formatTanggal(r.tanggalBerlaku)}</Td>
                      <Td kanan>{formatRupiah(r.nilai)}</Td>
                    </Baris>
                  ))}
              </tbody>
            </Tabel>
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
          <div className="mt-3">
            <Tabel>
              <thead>
                <tr>
                  <Th>Tanggal</Th>
                  <Th>Uraian</Th>
                  <Th>Tindak Lanjut</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {sewa.temuan.map((t, i) => (
                  <Baris key={i}>
                    <Td>{formatTanggal(t.tanggal)}</Td>
                    <Td>{t.uraian}</Td>
                    <Td>{t.tindakLanjut}</Td>
                    <Td>
                      <StatusBadge status={t.status} />
                    </Td>
                  </Baris>
                ))}
              </tbody>
            </Tabel>
          </div>
        )}
      </Kartu>
    </div>
  );
}

// Modul Sewa / BMN (PRD v2.0 Final Bab 7.9).
// Palet HANYA 3 warna RRI: Biru #2573E2, Navy #0D2569, Putih #FFFFFF.

import { useState } from 'react';
import type { Sewa as SewaItem } from '../lib/types';
import type { ModulProps } from '../lib/store';
import { formatRupiah, formatTanggal, hariIniIso, selisihHari } from '../lib/format';
import { labelStatusSewa, labelStatusTemuan } from '../lib/labels';
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
          { id: 'semua', label: `All (${hitung('semua')})` },
          { id: 'onGoing', label: `ON GOING (${hitung('onGoing')})` },
          { id: 'akanBerakhir', label: `Expiring Soon (${hitung('akanBerakhir')})` },
          { id: 'pengajuanBaru', label: `New Applications (${hitung('pengajuanBaru')})` },
          { id: 'diterimaDiMuka', label: `Received in Advance (${hitung('diterimaDiMuka')})` },
          { id: 'masihHarusDiterima', label: `Still Receivable (${hitung('masihHarusDiterima')})` },
          { id: 'temuan', label: `Field Findings (${hitung('temuan')})` },
          { id: 'indralaya', label: `Indralaya (${hitung('indralaya')})` },
        ]}
        aktif={filter}
        onPilih={(id) => setFilter(id as FilterId)}
      />

      {sewaTersaring.length === 0 ? (
        <PesanKosong teks="No leases match this filter." />
      ) : (
        <Kartu>
          <Tabel>
            <thead>
              <tr>
                <Th>Asset</Th>
                <Th>Location</Th>
                <Th>Lessee</Th>
                <Th>Agreement Number</Th>
                <Th>Period</Th>
                <Th kanan>Lease Value</Th>
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
                    <StatusBadge status={labelStatusSewa(s.status)} />
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
      <TombolSekunder onClick={onKembali}>&larr; Back to list</TombolSekunder>
      <JudulBagian>{sewa.aset}</JudulBagian>

      <Kartu>
        <dl className="grid gap-2 text-sm md:grid-cols-2">
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Location</dt>
            <dd className="text-right text-[#0d2569]">{sewa.lokasi}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Lessee</dt>
            <dd className="text-right font-semibold text-[#0d2569]">
              {sewa.penyewaNama}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Agreement number</dt>
            <dd className="text-[#0d2569]">{sewa.nomorPerjanjian}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Period</dt>
            <dd className="text-[#0d2569]">
              {formatTanggal(sewa.tanggalMulai)} –{' '}
              {formatTanggal(sewa.tanggalSelesai)}
              {sewa.status === 'ON GOING' &&
                (sisaHari >= 0
                  ? ` (${sisaHari} more days)`
                  : ` (${-sisaHari} days overdue)`)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Lease value</dt>
            <dd className="font-semibold text-[#0d2569]">
              {formatRupiah(sewa.nilaiSewa)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Status</dt>
            <dd>
              <StatusBadge status={labelStatusSewa(sewa.status)} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Received in advance</dt>
            <dd className="text-[#0d2569]">{formatRupiah(sewa.diterimaDiMuka)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Still receivable</dt>
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
              <dt className="text-[#0d2569]/60">Related contract</dt>
              <dd className="text-right text-[#0d2569]">
                {kontrak.nomorPks} — {formatRupiah(kontrak.nilaiKontrak)}
              </dd>
            </div>
          )}
        </dl>
      </Kartu>

      <Kartu>
        <JudulBagian>Price History</JudulBagian>
        <p className="mt-1 text-xs text-[#0d2569]/70">
          Price increases are recorded as history — old values are not overwritten.
        </p>
        {sewa.riwayatHarga.length === 0 ? (
          <p className="mt-2 text-sm text-[#0d2569]/70">
            No price history yet.
          </p>
        ) : (
          <div className="mt-3">
            <Tabel>
              <thead>
                <tr>
                  <Th>Effective Date</Th>
                  <Th kanan>Amount</Th>
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
        <JudulBagian>Field Findings</JudulBagian>
        {sewa.temuan.length === 0 ? (
          <p className="mt-2 text-sm text-[#0d2569]/70">
            No field findings.
          </p>
        ) : (
          <div className="mt-3">
            <Tabel>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Description</Th>
                  <Th>Follow-up</Th>
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
                      <StatusBadge status={labelStatusTemuan(t.status)} />
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

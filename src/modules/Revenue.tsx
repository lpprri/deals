// Modul Revenue — PRD v2.0 Final Bab 6.5, 6.7, 7.5, 9.2/9.4.
// Semua angka dihitung lewat derive.ts (hitungTotalKontrol,
// totalPerKodeAkun, sisaTagihan, statusTagihan, kelompokUmurPiutang).
// Data acuan Keuangan bersifat read-only.

import { useState } from 'react';
import type { ModulProps, PembayaranInput, DendaInput } from '../lib/store';
import type { Tagihan } from '../lib/types';
import {
  hitungTotalKontrol,
  hitungJembatanRekonsiliasi,
  totalPerKodeAkun,
  sisaTagihan,
  dibayarTerverifikasi,
  statusTagihan,
  kelompokUmurPiutang,
} from '../lib/derive';
import { formatRupiah, formatTanggal, hariIniIso } from '../lib/format';
import { MASTER_METODE_PEMBAYARAN, uraianKodeAkun } from '../lib/master';
import {
  labelMetodePembayaran,
  labelStatusDenda,
  labelStatusTagihan,
  labelStatusVerifikasi,
  labelUmurPiutang,
  labelUraianKodeAkun,
} from '../lib/labels';

/** Status rekonsiliasi (nilai turunan — belum ada di labels.ts, pemetaan lokal). */
const PETA_STATUS_REKON: Record<string, string> = {
  'Penerimaan Tanpa Tagihan': 'Receipt without invoice',
  'Sudah Cocok': 'Matched',
  'Cocok Sebagian': 'Partially matched',
  'Belum Ada Penerimaan': 'No receipt yet',
};
function labelStatusRekon(status: string): string {
  return PETA_STATUS_REKON[status] ?? status;
}

import { bolehAksi } from '../lib/permissions';
import {
  Baris,
  Kartu,
  JudulBagian,
  StatCard,
  StatusBadge,
  Tabel,
  Td,
  Th,
  TombolUtama,
  TombolSekunder,
  TabBar,
  PesanKosong,
  Peringatan,
  Label,
  inputClass,
} from '../components/ui';

type TabRevenue = 'overview' | 'invoice' | 'payments' | 'billings' | 'rekonsiliasi';

const TABS: { id: TabRevenue; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'invoice', label: 'Invoice' },
  { id: 'payments', label: 'Payments' },
  { id: 'billings', label: 'Billings' },
  { id: 'rekonsiliasi', label: 'Reconciliation' },
];

const STATUS_TAGIHAN: string[] = [
  'Belum Jatuh Tempo',
  'Jatuh Tempo',
  'Lewat Jatuh Tempo',
  'Lunas Sebagian',
  'Lunas',
];

export default function Revenue(props: ModulProps) {
  const { data, user, actions, cari } = props;
  const [tab, setTab] = useState<TabRevenue>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [tagihanTerpilihId, setTagihanTerpilihId] = useState<string | null>(null);

  // Form catat pembayaran
  const [tanggalBayar, setTanggalBayar] = useState(hariIniIso());
  const [jumlahBayar, setJumlahBayar] = useState('');
  const [metodeBayar, setMetodeBayar] = useState(MASTER_METODE_PEMBAYARAN[0]);
  const [penyetor, setPenyetor] = useState('');
  const [buktiSetor, setBuktiSetor] = useState('');
  const [errorBayar, setErrorBayar] = useState('');
  const [suksesBayar, setSuksesBayar] = useState('');

  // Form tambah denda
  const [jumlahDenda, setJumlahDenda] = useState('');
  const [dasarDenda, setDasarDenda] = useState('');
  const [errorDenda, setErrorDenda] = useState('');
  const [suksesDenda, setSuksesDenda] = useState('');

  const kontrol = hitungTotalKontrol(data);
  const jembatan = hitungJembatanRekonsiliasi(data);
  const perKodeAkun = totalPerKodeAkun(data);

  const namaKlien = (klienId: string): string =>
    data.klien.find((k) => k.id === klienId)?.nama ?? klienId;

  const nomorKontrak = (kontrakId: string): string =>
    data.kontrak.find((k) => k.id === kontrakId)?.nomorPks ?? kontrakId;

  const tagihanTerpilih: Tagihan | undefined = data.tagihan.find(
    (t) => t.id === tagihanTerpilihId,
  );

  const pilihTagihan = (id: string) => {
    setTagihanTerpilihId(id);
    setErrorBayar('');
    setSuksesBayar('');
    setErrorDenda('');
    setSuksesDenda('');
  };

  const simpanPembayaran = () => {
    if (!tagihanTerpilih) return;
    const sisa = sisaTagihan(tagihanTerpilih, data.pembayaran);
    const jumlah = Number(jumlahBayar);
    if (!jumlahBayar || Number.isNaN(jumlah) || jumlah <= 0) {
      setErrorBayar('Payment amount is required and must be more than 0.');
      setSuksesBayar('');
      return;
    }
    if (jumlah > sisa) {
      setErrorBayar(
        `Payment amount (${formatRupiah(jumlah)}) exceeds the outstanding receivables of this invoice (${formatRupiah(sisa)}). Reduce the payment amount.`,
      );
      setSuksesBayar('');
      return;
    }
    if (!tanggalBayar) {
      setErrorBayar('Payment date is required.');
      setSuksesBayar('');
      return;
    }
    if (!penyetor.trim()) {
      setErrorBayar('Depositor is required.');
      setSuksesBayar('');
      return;
    }
    const input: PembayaranInput = {
      tagihanId: tagihanTerpilih.id,
      tanggalBayar,
      jumlah,
      metode: metodeBayar,
      penyetor: penyetor.trim(),
      ...(buktiSetor.trim() ? { buktiSetor: buktiSetor.trim() } : {}),
    };
    const hasil = actions.catatPembayaran(input);
    if (hasil) {
      setErrorBayar(hasil);
      setSuksesBayar('');
      return;
    }
    setErrorBayar('');
    setSuksesBayar(
      `Payment ${formatRupiah(jumlah)} recorded with status Pending verification.`,
    );
    setJumlahBayar('');
    setPenyetor('');
    setBuktiSetor('');
  };

  const simpanDenda = () => {
    if (!tagihanTerpilih) return;
    const jumlah = Number(jumlahDenda);
    if (!dasarDenda.trim()) {
      setErrorDenda('Late fee basis is required.');
      setSuksesDenda('');
      return;
    }
    if (!jumlahDenda || Number.isNaN(jumlah) || jumlah <= 0) {
      setErrorDenda('Late fee amount is required and must be more than 0.');
      setSuksesDenda('');
      return;
    }
    const input: DendaInput = {
      tagihanId: tagihanTerpilih.id,
      dasar: dasarDenda.trim(),
      jumlah,
    };
    const hasil = actions.tambahDenda(input);
    if (hasil) {
      setErrorDenda(hasil);
      setSuksesDenda('');
      return;
    }
    setErrorDenda('');
    setSuksesDenda(`Late fee ${formatRupiah(jumlah)} recorded for ${tagihanTerpilih.nomor}.`);
    setJumlahDenda('');
    setDasarDenda('');
  };

  const kataCari = cari.trim().toLowerCase();
  const tagihanTampil = data.tagihan.filter((t) => {
    if (filterStatus !== 'Semua' && statusTagihan(t, data.pembayaran) !== filterStatus) {
      return false;
    }
    if (!kataCari) return true;
    return (
      t.nomor.toLowerCase().includes(kataCari) ||
      t.uraian.toLowerCase().includes(kataCari) ||
      nomorKontrak(t.kontrakId).toLowerCase().includes(kataCari)
    );
  });

  const pembayaranTerurut = [...data.pembayaran].sort((a, b) =>
    a.tanggalBayar < b.tanggalBayar ? 1 : a.tanggalBayar > b.tanggalBayar ? -1 : 0,
  );

  const barisBillings = data.kontrak.map((k) => {
    const tagihanKontrak = data.tagihan.filter((t) => t.kontrakId === k.id);
    const totalTagihanKontrak = tagihanKontrak.reduce((s, t) => s + t.nilai, 0);
    const totalDibayarKontrak = tagihanKontrak.reduce(
      (s, t) => s + dibayarTerverifikasi(t.id, data.pembayaran),
      0,
    );
    const sisaKontrak = tagihanKontrak.reduce(
      (s, t) => s + sisaTagihan(t, data.pembayaran),
      0,
    );
    return {
      kontrak: k,
      totalTagihan: totalTagihanKontrak,
      totalDibayar: totalDibayarKontrak,
      sisa: sisaKontrak,
      jumlahTagihan: tagihanKontrak.length,
    };
  });
  const totalBillings = barisBillings.reduce(
    (s, b) => ({
      nilaiKontrak: s.nilaiKontrak + b.kontrak.nilaiKontrak,
      totalTagihan: s.totalTagihan + b.totalTagihan,
      totalDibayar: s.totalDibayar + b.totalDibayar,
      sisa: s.sisa + b.sisa,
      jumlahTagihan: s.jumlahTagihan + b.jumlahTagihan,
    }),
    { nilaiKontrak: 0, totalTagihan: 0, totalDibayar: 0, sisa: 0, jumlahTagihan: 0 },
  );

  const pembayaranTerverifikasi = data.pembayaran.filter(
    (p) => p.statusVerifikasi === 'Terverifikasi',
  );

  // Status rekonsiliasi baris acuan memakai NTPN — aturan yang sama dengan
  // jembatan rekonsiliasi di scripts/impor-data-nyata/_hitung.ts. NTPN
  // diekstrak dari uraian acuan ("NTPN <kode>") dan buktiSetor pembayaran
  // ("NTB ... / NTPN <kode>"). Aturan lama (jumlah persis + penyetor sama)
  // hanya menemukan 20 baris cocok, padahal jembatan NTPN menemukan 39
  // pasangan sama jumlah + 1 baris terpecah (ACU-009: pokok Rp9.019.000
  // dari pembayaran Rp9.199.380 yang dipecah pokok + denda di Sheet 3).
  const ntpnDari = (s: string) =>
    (s.match(/NTPN\s+([A-Za-z0-9]+)/) || [])[1] || null;
  const jumlahBayarPerNtpn = new Map<string, number>();
  for (const p of pembayaranTerverifikasi) {
    const n = ntpnDari(p.buktiSetor || '');
    if (n && !jumlahBayarPerNtpn.has(n)) jumlahBayarPerNtpn.set(n, p.jumlah);
  }

  return (
    <div className="space-y-4">
      <TabBar
        tabs={TABS}
        aktif={tab}
        onPilih={(id) => setTab(id as TabRevenue)}
      />

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Invoices" nilai={formatRupiah(kontrol.totalTagihan)} />
            <StatCard
              label="Verified Payments"
              nilai={formatRupiah(kontrol.totalPembayaranTerverifikasi)}
            />
            <StatCard label="Outstanding Receivables" nilai={formatRupiah(kontrol.sisaPiutang)} />
            <StatCard label="Recorded Late Fees" nilai={formatRupiah(kontrol.totalDenda)} />
          </div>
          <Kartu>
            <JudulBagian>Totals per Account Code</JudulBagian>
            <Tabel>
              <thead>
                <tr>
                  <Th>Account Code</Th>
                  <Th>Description</Th>
                  <Th kanan>Invoices</Th>
                  <Th kanan>Payments</Th>
                  <Th kanan>Finance Reference</Th>
                  <Th kanan>Difference</Th>
                </tr>
              </thead>
              <tbody>
                {perKodeAkun.map((r) => (
                  <Baris key={r.kodeAkun}>
                    <Td>{r.kodeAkun}</Td>
                    <Td>{labelUraianKodeAkun(uraianKodeAkun(r.kodeAkun))}</Td>
                    <Td kanan>{formatRupiah(r.tagihan)}</Td>
                    <Td kanan>{formatRupiah(r.pembayaran)}</Td>
                    <Td kanan>{formatRupiah(r.acuan)}</Td>
                    <Td kanan>{formatRupiah(r.selisih)}</Td>
                  </Baris>
                ))}
              </tbody>
            </Tabel>
            <p className="mt-3 text-xs text-[#0d2569]/60">
              Finance reference data is read-only — shown for reconciliation
              only and cannot be changed from this module.
            </p>
          </Kartu>
        </div>
      )}

      {tab === 'invoice' && (
        <div className="space-y-4">
          <Kartu>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <Label>Filter by Status</Label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={inputClass}
                >
                  <option value="Semua">All Statuses</option>
                  {STATUS_TAGIHAN.map((s) => (
                    <option key={s} value={s}>
                      {labelStatusTagihan(s)}
                    </option>
                  ))}
                </select>
              </div>
              <p className="pb-2 text-xs text-[#0d2569]/60">
                {kataCari
                  ? `Search: "${cari}" — ${tagihanTampil.length} invoices found.`
                  : 'Click an invoice row to see details, payments, and late fees.'}
              </p>
            </div>
            <Tabel>
              <thead>
                <tr>
                  <Th>Number</Th>
                  <Th>Contract</Th>
                  <Th>Description</Th>
                  <Th kanan>Amount</Th>
                  <Th>Issued</Th>
                  <Th>Due Date</Th>
                  <Th>Account Code</Th>
                  <Th>Status</Th>
                  <Th kanan>Balance</Th>
                  <Th>Receivables Age</Th>
                </tr>
              </thead>
              <tbody>
                {tagihanTampil.map((t) => (
                  <Baris
                    key={t.id}
                    onClick={() => pilihTagihan(t.id)}
                    className={t.id === tagihanTerpilihId ? 'bg-[#2573e2]/10' : ''}
                  >
                    <Td>{t.nomor}</Td>
                    <Td>{nomorKontrak(t.kontrakId)}</Td>
                    <Td>{t.uraian}</Td>
                    <Td kanan>{formatRupiah(t.nilai)}</Td>
                    <Td>{formatTanggal(t.tanggalTerbit)}</Td>
                    <Td>{formatTanggal(t.tanggalJatuhTempo)}</Td>
                    <Td>{t.kodeAkun}</Td>
                    <Td>
                      <StatusBadge status={labelStatusTagihan(statusTagihan(t, data.pembayaran))} />
                    </Td>
                    <Td kanan>
                      {formatRupiah(sisaTagihan(t, data.pembayaran))}
                    </Td>
                    <Td>{labelUmurPiutang(kelompokUmurPiutang(t))}</Td>
                  </Baris>
                ))}
              </tbody>
            </Tabel>
            {tagihanTampil.length === 0 && (
              <div className="mt-3">
                <PesanKosong teks="No invoices match the filter or search." />
              </div>
            )}
          </Kartu>

          {tagihanTerpilih && (
            <Kartu>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <JudulBagian>
                  Details {tagihanTerpilih.nomor} — {tagihanTerpilih.uraian}
                </JudulBagian>
                <TombolSekunder onClick={() => setTagihanTerpilihId(null)}>
                  Close Details
                </TombolSekunder>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm text-[#0d2569] sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-[#0d2569]/60">Contract</dt>
                  <dd>{nomorKontrak(tagihanTerpilih.kontrakId)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#0d2569]/60">Amount</dt>
                  <dd>{formatRupiah(tagihanTerpilih.nilai)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#0d2569]/60">Outstanding Receivables</dt>
                  <dd>{formatRupiah(sisaTagihan(tagihanTerpilih, data.pembayaran))}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#0d2569]/60">Status</dt>
                  <dd>
                    <StatusBadge
                      status={labelStatusTagihan(statusTagihan(tagihanTerpilih, data.pembayaran))}
                    />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#0d2569]/60">Issue Date</dt>
                  <dd>{formatTanggal(tagihanTerpilih.tanggalTerbit)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#0d2569]/60">Due Date</dt>
                  <dd>{formatTanggal(tagihanTerpilih.tanggalJatuhTempo)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#0d2569]/60">Account Code</dt>
                  <dd>
                    {tagihanTerpilih.kodeAkun} —{' '}
                    {labelUraianKodeAkun(uraianKodeAkun(tagihanTerpilih.kodeAkun))}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#0d2569]/60">Receivables Age</dt>
                  <dd>{labelUmurPiutang(kelompokUmurPiutang(tagihanTerpilih))}</dd>
                </div>
              </dl>

              <h3 className="mt-5 text-sm font-bold text-[#0d2569]">Payments</h3>
              {data.pembayaran.filter((p) => p.tagihanId === tagihanTerpilih.id)
                .length === 0 ? (
                <div className="mt-2">
                  <PesanKosong teks="No payments yet for this invoice." />
                </div>
              ) : (
                <Tabel>
                  <thead>
                    <tr>
                      <Th>Payment Date</Th>
                      <Th kanan>Amount</Th>
                      <Th>Method</Th>
                      <Th>Depositor</Th>
                      <Th>Verification Status</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pembayaran
                      .filter((p) => p.tagihanId === tagihanTerpilih.id)
                      .map((p) => (
                        <Baris key={p.id}>
                          <Td>{formatTanggal(p.tanggalBayar)}</Td>
                          <Td kanan>{formatRupiah(p.jumlah)}</Td>
                          <Td>{labelMetodePembayaran(p.metode)}</Td>
                          <Td>{p.penyetor}</Td>
                          <Td>
                            <StatusBadge status={labelStatusVerifikasi(p.statusVerifikasi)} />
                          </Td>
                        </Baris>
                      ))}
                  </tbody>
                </Tabel>
              )}

              <h3 className="mt-5 text-sm font-bold text-[#0d2569]">Late Fees</h3>
              {data.denda.filter((d) => d.tagihanId === tagihanTerpilih.id).length ===
              0 ? (
                <div className="mt-2">
                  <PesanKosong teks="No late fees yet for this invoice." />
                </div>
              ) : (
                <Tabel>
                  <thead>
                    <tr>
                      <Th>ID</Th>
                      <Th kanan>Amount</Th>
                      <Th>Status</Th>
                      <Th>Basis</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.denda
                      .filter((d) => d.tagihanId === tagihanTerpilih.id)
                      .map((d) => (
                        <Baris key={d.id}>
                          <Td>{d.id}</Td>
                          <Td kanan>{formatRupiah(d.jumlah)}</Td>
                          <Td>
                            <StatusBadge status={labelStatusDenda(d.status)} />
                          </Td>
                          <Td>{d.dasar}</Td>
                        </Baris>
                      ))}
                  </tbody>
                </Tabel>
              )}

              {bolehAksi(user.peran, 'catatPembayaran') && (
                <div className="mt-6 rounded-md border border-[#2573e2]/20 bg-[#2573e2]/5 p-4">
                  <h3 className="text-sm font-bold text-[#0d2569]">
                    Record Payment
                  </h3>
                  <p className="mt-1 text-xs text-[#0d2569]/60">
                    New payments have the status Pending verification until
                    verified by Finance.
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Payment Date</Label>
                      <input
                        type="date"
                        value={tanggalBayar}
                        onChange={(e) => setTanggalBayar(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <Label>Amount (Rp)</Label>
                      <input
                        type="number"
                        min={1}
                        value={jumlahBayar}
                        onChange={(e) => setJumlahBayar(e.target.value)}
                        placeholder="Example: 5000000"
                        className={inputClass}
                      />
                      <p className="mt-1 text-xs text-[#0d2569]/60">
                        Maximum outstanding receivables:{' '}
                        {formatRupiah(sisaTagihan(tagihanTerpilih, data.pembayaran))}
                      </p>
                    </div>
                    <div>
                      <Label>Method</Label>
                      <select
                        value={metodeBayar}
                        onChange={(e) => setMetodeBayar(e.target.value)}
                        className={inputClass}
                      >
                        {MASTER_METODE_PEMBAYARAN.map((m) => (
                          <option key={m} value={m}>
                            {labelMetodePembayaran(m)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Depositor</Label>
                      <input
                        type="text"
                        value={penyetor}
                        onChange={(e) => setPenyetor(e.target.value)}
                        placeholder="Depositor name"
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Deposit Receipt (optional)</Label>
                      <input
                        type="text"
                        value={buktiSetor}
                        onChange={(e) => setBuktiSetor(e.target.value)}
                        placeholder="Receipt number / reference"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  {errorBayar && (
                    <p className="mt-3 text-sm font-semibold text-[#0d2569]">
                      {errorBayar}
                    </p>
                  )}
                  {suksesBayar && (
                    <p className="mt-3 text-sm text-[#0d2569]/70">{suksesBayar}</p>
                  )}
                  <div className="mt-3">
                    <TombolUtama onClick={simpanPembayaran}>
                      Save Payment
                    </TombolUtama>
                  </div>
                </div>
              )}

              {bolehAksi(user.peran, 'tambahDenda') && (
                <div className="mt-4 rounded-md border border-[#2573e2]/20 bg-[#2573e2]/5 p-4">
                  <h3 className="text-sm font-bold text-[#0d2569]">Add Late Fee</h3>
                  <p className="mt-1 text-xs text-[#0d2569]/60">
                    Late fees are recorded manually; the official formula and
                    rates are not yet confirmed (Q-03).
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Late Fee Amount (Rp)</Label>
                      <input
                        type="number"
                        min={1}
                        value={jumlahDenda}
                        onChange={(e) => setJumlahDenda(e.target.value)}
                        placeholder="Example: 350000"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <Label>Basis (required)</Label>
                      <textarea
                        value={dasarDenda}
                        onChange={(e) => setDasarDenda(e.target.value)}
                        placeholder="Example: Overdue since 05/05/2026."
                        className={inputClass}
                        rows={2}
                      />
                    </div>
                  </div>
                  {errorDenda && (
                    <p className="mt-3 text-sm font-semibold text-[#0d2569]">
                      {errorDenda}
                    </p>
                  )}
                  {suksesDenda && (
                    <p className="mt-3 text-sm text-[#0d2569]/70">{suksesDenda}</p>
                  )}
                  <div className="mt-3">
                    <TombolUtama onClick={simpanDenda}>Save Late Fee</TombolUtama>
                  </div>
                </div>
              )}
            </Kartu>
          )}
        </div>
      )}

      {tab === 'payments' && (
        <Kartu>
          <JudulBagian>All Payments</JudulBagian>
          <Tabel>
            <thead>
              <tr>
                <Th>Payment Date</Th>
                <Th>Invoice</Th>
                <Th>Depositor</Th>
                <Th kanan>Amount</Th>
                <Th>Method</Th>
                <Th>Verification Status</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {pembayaranTerurut.map((p) => {
                const tagihan = data.tagihan.find((t) => t.id === p.tagihanId);
                const menunggu = p.statusVerifikasi === 'Menunggu Verifikasi';
                return (
                  <Baris key={p.id}>
                    <Td>{formatTanggal(p.tanggalBayar)}</Td>
                    <Td>
                      {tagihan ? `${tagihan.nomor} — ${tagihan.uraian}` : p.tagihanId}
                    </Td>
                    <Td>{p.penyetor}</Td>
                    <Td kanan>{formatRupiah(p.jumlah)}</Td>
                    <Td>{labelMetodePembayaran(p.metode)}</Td>
                    <Td>
                      <StatusBadge status={labelStatusVerifikasi(p.statusVerifikasi)} />
                    </Td>
                    <Td>
                      {menunggu && bolehAksi(user.peran, 'verifikasiPembayaran') ? (
                        <TombolSekunder
                          onClick={() => actions.verifikasiPembayaran(p.id)}
                        >
                          Verify
                        </TombolSekunder>
                      ) : menunggu ? (
                        <span className="text-xs text-[#0d2569]/60">
                          Only Finance can verify
                        </span>
                      ) : (
                        <span className="text-xs text-[#0d2569]/60">—</span>
                      )}
                    </Td>
                  </Baris>
                );
              })}
            </tbody>
          </Tabel>
          {pembayaranTerurut.length === 0 && (
            <div className="mt-3">
              <PesanKosong teks="No payments yet." />
            </div>
          )}
        </Kartu>
      )}

      {tab === 'billings' && (
        <Kartu>
          <JudulBagian>Billing Summary per Contract</JudulBagian>
          <Tabel>
            <thead>
              <tr>
                <Th>PKS Number</Th>
                <Th>Client</Th>
                <Th kanan>Contract Value</Th>
                <Th kanan>Total Invoices</Th>
                <Th kanan>Total Paid (Verified)</Th>
                <Th kanan>Outstanding Receivables</Th>
                <Th kanan>Invoice Count</Th>
              </tr>
            </thead>
            <tbody>
              {barisBillings.map((b) => (
                <Baris key={b.kontrak.id}>
                  <Td>{b.kontrak.nomorPks}</Td>
                  <Td>{namaKlien(b.kontrak.klienId)}</Td>
                  <Td kanan>{formatRupiah(b.kontrak.nilaiKontrak)}</Td>
                  <Td kanan>{formatRupiah(b.totalTagihan)}</Td>
                  <Td kanan>{formatRupiah(b.totalDibayar)}</Td>
                  <Td kanan>{formatRupiah(b.sisa)}</Td>
                  <Td kanan>{b.jumlahTagihan}</Td>
                </Baris>
              ))}
            </tbody>
            <tfoot>
              <Baris className="bg-[#2573e2]/5 font-semibold">
                <Td colSpan={2}>
                  Total
                </Td>
                <Td kanan tebal>{formatRupiah(totalBillings.nilaiKontrak)}</Td>
                <Td kanan tebal>{formatRupiah(totalBillings.totalTagihan)}</Td>
                <Td kanan tebal>{formatRupiah(totalBillings.totalDibayar)}</Td>
                <Td kanan tebal>{formatRupiah(totalBillings.sisa)}</Td>
                <Td kanan tebal>{totalBillings.jumlahTagihan}</Td>
              </Baris>
            </tfoot>
          </Tabel>
          <p className="mt-3 text-xs text-[#0d2569]/60">
            The bottom-row totals are calculated from the rows above and match the
            control totals: total invoices {formatRupiah(kontrol.totalTagihan)}, verified
            payments {formatRupiah(kontrol.totalPembayaranTerverifikasi)}, outstanding
            receivables {formatRupiah(kontrol.sisaPiutang)}.
          </p>
        </Kartu>
      )}

      {tab === 'rekonsiliasi' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              label="Verified Payments"
              nilai={formatRupiah(kontrol.totalPembayaranTerverifikasi)}
            />
            <StatCard
              label="Finance Reference Receipts"
              nilai={formatRupiah(kontrol.totalPenerimaanAcuan)}
            />
            <StatCard
              label="Reconciliation Difference"
              nilai={
                data.penerimaanAcuan.length === 0
                  ? '—'
                  : formatRupiah(kontrol.selisihRekonsiliasi)
              }
              keterangan={
                data.penerimaanAcuan.length === 0
                  ? 'Finance reference data has not been imported yet.'
                  : kontrol.selisihRekonsiliasi === 0
                    ? 'Match — no difference.'
                    : jembatan.sisaTakTerjelaskan === 0
                      ? 'Fully explained — see the details below.'
                      : 'Partly unexplained — see the details below.'
              }
            />
          </div>
          {data.penerimaanAcuan.length > 0 &&
            kontrol.selisihRekonsiliasi !== 0 && (
              <Kartu>
                <JudulBagian>Difference Explained</JudulBagian>
                <p className="mt-2 text-sm text-[#0d2569]/70">
                  Finance reference receipts{' '}
                  {formatRupiah(jembatan.totalAcuan)} − verified
                  payments{' '}
                  {formatRupiah(jembatan.totalPembayaranTerverifikasi)} =
                  difference {formatRupiah(jembatan.selisih)}. The details
                  below explain the difference down to the last rupiah —
                  calculated from data, not written manually.
                </p>
                <Tabel>
                  <thead>
                    <tr>
                      <Th>Description</Th>
                      <Th>Rows</Th>
                      <Th kanan>Amount</Th>
                    </tr>
                  </thead>
                  <tbody>
                    <Baris>
                      <Td>
                        Reference receipts without an invoice
                        <div className="text-xs text-[#0d2569]/60">
                          Outside partnership invoices:{' '}
                          {jembatan.acuanTanpaPembayaran.perKodeAkun
                            .map(
                              (r) =>
                                `${r.kodeAkun} ${labelUraianKodeAkun(uraianKodeAkun(r.kodeAkun))} ${formatRupiah(r.total)} (${r.jumlahBaris} rows)`,
                            )
                            .join(' · ')}
                        </div>
                      </Td>
                      <Td>
                        {jembatan.acuanTanpaPembayaran.jumlahBaris} rows
                      </Td>
                      <Td kanan>
                        {formatRupiah(jembatan.acuanTanpaPembayaran.total)}
                      </Td>
                    </Baris>
                    <Baris>
                      <Td>
                        Reference receipts without NTPN
                        <div className="text-xs text-[#0d2569]/60">
                          No NTPN in the description — cannot be matched
                          with a payment.
                        </div>
                      </Td>
                      <Td>{jembatan.acuanTanpaNtpn.jumlahBaris} rows</Td>
                      <Td kanan>
                        {formatRupiah(jembatan.acuanTanpaNtpn.total)}
                      </Td>
                    </Baris>
                    <Baris>
                      <Td>
                        Verified payments without a reference
                        <div className="text-xs text-[#0d2569]/60">
                          NTPN is not in the Finance reference data
                          {jembatan.pembayaranTanpaAcuan.tanggalTerawal !==
                            null &&
                            ` · payment date ${formatTanggal(jembatan.pembayaranTanpaAcuan.tanggalTerawal)}${jembatan.pembayaranTanpaAcuan.tanggalTerakhir !==
                              jembatan.pembayaranTanpaAcuan.tanggalTerawal
                              ? `–${formatTanggal(jembatan.pembayaranTanpaAcuan.tanggalTerakhir ?? '')}`
                              : ''}`}
                          .
                        </div>
                      </Td>
                      <Td>
                        {jembatan.pembayaranTanpaAcuan.jumlahBaris} rows
                      </Td>
                      <Td kanan>
                        {formatRupiah(-jembatan.pembayaranTanpaAcuan.total)}
                      </Td>
                    </Baris>
                    <Baris>
                      <Td>
                        NTPN pair difference (matched reference − matched
                        payment)
                        <div className="text-xs text-[#0d2569]/60">
                          {jembatan.pasangan.selisih === 0
                            ? 'All pairs match in amount.'
                            : jembatan.pasangan.selisih < 0
                              ? 'Matched reference is smaller than matched payment — payment split in Sheet 3 (principal + late fee).'
                              : 'Matched reference is larger than matched payment.'}
                        </div>
                      </Td>
                      <Td>
                        {jembatan.pasangan.jumlahBarisAcuan} reference rows ·{' '}
                        {jembatan.pasangan.jumlahPembayaran} payments
                      </Td>
                      <Td kanan>
                        {formatRupiah(jembatan.pasangan.selisih)}
                      </Td>
                    </Baris>
                  </tbody>
                  <tfoot>
                    <Baris className="bg-[#2573e2]/5 font-semibold">
                      <Td colSpan={2}>Difference (explained)</Td>
                      <Td kanan tebal>
                        {formatRupiah(jembatan.selisih)}
                      </Td>
                    </Baris>
                  </tfoot>
                </Tabel>
                {jembatan.sisaTakTerjelaskan === 0 ? (
                  <p className="mt-3 text-xs text-[#0d2569]/60">
                    Difference fully explained — unexplained remainder
                    Rp0.
                  </p>
                ) : (
                  <div className="mt-3">
                    <Peringatan
                      teks={`Remaining difference of ${formatRupiah(jembatan.sisaTakTerjelaskan)} is not explained by the details above — confirmation from Finance is needed.`}
                    />
                  </div>
                )}
                {jembatan.pasanganBedaKode
                  // Pasangan denda (acuan 425839) tidak ditampilkan di sini
                  // — denda yang tertanam dalam pembayaran tagihan punya
                  // catatan sendiri di bawah, dan klasifikasinya sudah
                  // dipahami (bukan anomali yang menunggu konfirmasi).
                  .filter((b) => b.kodeAcuan !== '425839')
                  .map((b) => (
                  <p
                    key={`${b.kodeAcuan}/${b.kodeTagihan}`}
                    className="mt-3 text-xs text-[#0d2569]/60"
                  >
                    Account-code mismatch pair: {b.jumlahBaris} rows recorded
                    as {b.kodeAcuan} ({labelUraianKodeAkun(uraianKodeAkun(b.kodeAcuan))}) in
                    Sheet 3 although the invoice is {b.kodeTagihan} (
                    {labelUraianKodeAkun(uraianKodeAkun(b.kodeTagihan))}) —{' '}
                    {formatRupiah(b.totalAcuan)}. This is a per-account-code
                    difference; the total is unchanged; classification awaits
                    confirmation from Finance.
                  </p>
                ))}
                {jembatan.dendaTertanam.jumlahBaris > 0 && (
                  <p className="mt-3 text-xs text-[#0d2569]/60">
                    Embedded late fee {formatRupiah(jembatan.dendaTertanam.total)}{' '}
                    ({jembatan.dendaTertanam.jumlahBaris} reference rows 425839)
                    is already included in the invoice payment — recorded as
                    425839 in Sheet 3, not added again to receivables.
                  </p>
                )}
              </Kartu>
            )}

          <Kartu>
            <JudulBagian>Finance Reference Receipts (Read-Only)</JudulBagian>
            {data.penerimaanAcuan.length === 0 && (
              <p className="mt-3 text-sm text-[#0d2569]/70">
                Finance reference data has not been imported yet — Sheet 3 (DATA PNBP 2026)
                could not be read because of the connector limit during the 14/11/2026
                import. Reconciliation against the Finance reference cannot be done
                until that data is imported.
              </p>
            )}
            <Tabel>
              <thead>
                <tr>
                  <Th>ID</Th>
                  <Th>Period</Th>
                  <Th>Account Code</Th>
                  <Th>Description</Th>
                  <Th>Depositor</Th>
                  <Th>Deposit Date</Th>
                  <Th kanan>Amount</Th>
                  <Th>Reconciliation Status</Th>
                </tr>
              </thead>
              <tbody>
                {data.penerimaanAcuan.map((a) => {
                  const ntpn = ntpnDari(a.uraian || '');
                  const jumlahBayar =
                    ntpn === null
                      ? undefined
                      : jumlahBayarPerNtpn.get(ntpn);
                  // NTPN sama + jumlah sama = Sudah Cocok; NTPN sama tapi
                  // jumlah berbeda (pembayaran terpecah di Sheet 3) =
                  // Cocok Sebagian; tanpa NTPN yang cocok = Penerimaan
                  // Tanpa Tagihan.
                  const statusRekon =
                    jumlahBayar === undefined
                      ? 'Penerimaan Tanpa Tagihan'
                      : jumlahBayar === a.jumlah
                        ? 'Sudah Cocok'
                        : 'Cocok Sebagian';
                  return (
                    <Baris key={a.id}>
                      <Td>{a.id}</Td>
                      <Td>{a.periode}</Td>
                      <Td>{a.kodeAkun}</Td>
                      <Td>{a.uraian}</Td>
                      <Td>{a.penyetor ?? '-'}</Td>
                      <Td>{formatTanggal(a.tanggalSetor)}</Td>
                      <Td kanan>{formatRupiah(a.jumlah)}</Td>
                      <Td>
                        <StatusBadge status={labelStatusRekon(statusRekon)} />
                      </Td>
                    </Baris>
                  );
                })}
              </tbody>
            </Tabel>
          </Kartu>

          <Kartu>
            <JudulBagian>Reconciliation per Invoice</JudulBagian>
            <Tabel>
              <thead>
                <tr>
                  <Th>Number</Th>
                  <Th>Description</Th>
                  <Th kanan>Invoice Amount</Th>
                  <Th kanan>Paid (Verified)</Th>
                  <Th kanan>Balance</Th>
                  <Th>Reconciliation Status</Th>
                </tr>
              </thead>
              <tbody>
                {data.tagihan.map((t) => {
                  const dibayar = dibayarTerverifikasi(t.id, data.pembayaran);
                  const statusRekon =
                    dibayar >= t.nilai
                      ? 'Sudah Cocok'
                      : dibayar > 0
                        ? 'Cocok Sebagian'
                        : 'Belum Ada Penerimaan';
                  return (
                    <Baris key={t.id}>
                      <Td>{t.nomor}</Td>
                      <Td>{t.uraian}</Td>
                      <Td kanan>{formatRupiah(t.nilai)}</Td>
                      <Td kanan>{formatRupiah(dibayar)}</Td>
                      <Td kanan>
                        {formatRupiah(sisaTagihan(t, data.pembayaran))}
                      </Td>
                      <Td>
                        <StatusBadge status={labelStatusRekon(statusRekon)} />
                      </Td>
                    </Baris>
                  );
                })}
              </tbody>
            </Tabel>
          </Kartu>

          <Kartu>
            <JudulBagian>Control Totals per Account Code</JudulBagian>
            <Tabel>
              <thead>
                <tr>
                  <Th>Account Code</Th>
                  <Th>Description</Th>
                  <Th kanan>Invoices</Th>
                  <Th kanan>Payments</Th>
                  <Th kanan>Finance Reference</Th>
                  <Th kanan>Difference</Th>
                </tr>
              </thead>
              <tbody>
                {perKodeAkun.map((r) => (
                  <Baris key={r.kodeAkun}>
                    <Td>{r.kodeAkun}</Td>
                    <Td>{labelUraianKodeAkun(uraianKodeAkun(r.kodeAkun))}</Td>
                    <Td kanan>{formatRupiah(r.tagihan)}</Td>
                    <Td kanan>{formatRupiah(r.pembayaran)}</Td>
                    <Td kanan>{formatRupiah(r.acuan)}</Td>
                    <Td kanan>{formatRupiah(r.selisih)}</Td>
                  </Baris>
                ))}
              </tbody>
            </Tabel>
          </Kartu>
        </div>
      )}
    </div>
  );
}

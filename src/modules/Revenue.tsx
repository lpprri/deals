// Modul Revenue — PRD v2.0 Final Bab 6.5, 6.7, 7.5, 9.2/9.4.
// Semua angka dihitung lewat derive.ts (hitungTotalKontrol,
// totalPerKodeAkun, sisaTagihan, statusTagihan, kelompokUmurPiutang).
// Data acuan Keuangan bersifat read-only.

import { useState } from 'react';
import type { ModulProps, PembayaranInput, DendaInput } from '../lib/store';
import type { Tagihan } from '../lib/types';
import {
  hitungTotalKontrol,
  totalPerKodeAkun,
  sisaTagihan,
  dibayarTerverifikasi,
  statusTagihan,
  kelompokUmurPiutang,
} from '../lib/derive';
import { formatRupiah, formatTanggal, hariIniIso } from '../lib/format';
import { MASTER_METODE_PEMBAYARAN, uraianKodeAkun } from '../lib/master';
import { bolehAksi } from '../lib/permissions';
import {
  Kartu,
  JudulBagian,
  StatCard,
  StatusBadge,
  TombolUtama,
  TombolSekunder,
  TabBar,
  PesanKosong,
  Peringatan,
  Label,
  inputClass,
} from '../components/ui';

const th =
  'border-b border-[#2573e2]/20 px-3 py-2 text-left text-xs font-semibold text-[#0d2569]/70';
const td = 'border-b border-[#2573e2]/10 px-3 py-2 text-sm text-[#0d2569]';
const tdKanan = `${td} text-right`;

type TabRevenue = 'overview' | 'invoice' | 'payments' | 'billings' | 'rekonsiliasi';

const TABS: { id: TabRevenue; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'invoice', label: 'Invoice' },
  { id: 'payments', label: 'Payments' },
  { id: 'billings', label: 'Billings' },
  { id: 'rekonsiliasi', label: 'Rekonsiliasi' },
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
      setErrorBayar('Jumlah pembayaran wajib diisi dan lebih dari 0.');
      setSuksesBayar('');
      return;
    }
    if (jumlah > sisa) {
      setErrorBayar(
        `Jumlah pembayaran (${formatRupiah(jumlah)}) melebihi sisa piutang tagihan ini (${formatRupiah(sisa)}). Kurangi jumlah pembayaran.`,
      );
      setSuksesBayar('');
      return;
    }
    if (!tanggalBayar) {
      setErrorBayar('Tanggal bayar wajib diisi.');
      setSuksesBayar('');
      return;
    }
    if (!penyetor.trim()) {
      setErrorBayar('Penyetor wajib diisi.');
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
      `Pembayaran ${formatRupiah(jumlah)} dicatat dengan status Menunggu Verifikasi.`,
    );
    setJumlahBayar('');
    setPenyetor('');
    setBuktiSetor('');
  };

  const simpanDenda = () => {
    if (!tagihanTerpilih) return;
    const jumlah = Number(jumlahDenda);
    if (!dasarDenda.trim()) {
      setErrorDenda('Dasar denda wajib diisi.');
      setSuksesDenda('');
      return;
    }
    if (!jumlahDenda || Number.isNaN(jumlah) || jumlah <= 0) {
      setErrorDenda('Jumlah denda wajib diisi dan lebih dari 0.');
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
    setSuksesDenda(`Denda ${formatRupiah(jumlah)} dicatat untuk ${tagihanTerpilih.nomor}.`);
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
            <StatCard label="Total Tagihan" nilai={formatRupiah(kontrol.totalTagihan)} />
            <StatCard
              label="Pembayaran Terverifikasi"
              nilai={formatRupiah(kontrol.totalPembayaranTerverifikasi)}
            />
            <StatCard label="Sisa Piutang" nilai={formatRupiah(kontrol.sisaPiutang)} />
            <StatCard label="Denda Tercatat" nilai={formatRupiah(kontrol.totalDenda)} />
          </div>
          <Kartu>
            <JudulBagian>Total per Kode Akun</JudulBagian>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={th}>Kode Akun</th>
                    <th className={th}>Uraian</th>
                    <th className={`${th} text-right`}>Tagihan</th>
                    <th className={`${th} text-right`}>Pembayaran</th>
                    <th className={`${th} text-right`}>Acuan Keuangan</th>
                    <th className={`${th} text-right`}>Selisih</th>
                  </tr>
                </thead>
                <tbody>
                  {perKodeAkun.map((r) => (
                    <tr key={r.kodeAkun}>
                      <td className={td}>{r.kodeAkun}</td>
                      <td className={td}>{uraianKodeAkun(r.kodeAkun)}</td>
                      <td className={tdKanan}>{formatRupiah(r.tagihan)}</td>
                      <td className={tdKanan}>{formatRupiah(r.pembayaran)}</td>
                      <td className={tdKanan}>{formatRupiah(r.acuan)}</td>
                      <td className={tdKanan}>{formatRupiah(r.selisih)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-[#0d2569]/60">
              Data acuan Keuangan bersifat read-only — hanya ditampilkan untuk
              rekonsiliasi, tidak dapat diubah dari modul ini.
            </p>
          </Kartu>
        </div>
      )}

      {tab === 'invoice' && (
        <div className="space-y-4">
          <Kartu>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <Label>Filter Status</Label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={inputClass}
                >
                  <option value="Semua">Semua Status</option>
                  {STATUS_TAGIHAN.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <p className="pb-2 text-xs text-[#0d2569]/60">
                {kataCari
                  ? `Pencarian: "${cari}" — ${tagihanTampil.length} tagihan ditemukan.`
                  : 'Klik baris tagihan untuk melihat detail, pembayaran, dan denda.'}
              </p>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={th}>Nomor</th>
                    <th className={th}>Kontrak</th>
                    <th className={th}>Uraian</th>
                    <th className={`${th} text-right`}>Nilai</th>
                    <th className={th}>Terbit</th>
                    <th className={th}>Jatuh Tempo</th>
                    <th className={th}>Kode Akun</th>
                    <th className={th}>Status</th>
                    <th className={`${th} text-right`}>Sisa</th>
                    <th className={th}>Umur Piutang</th>
                  </tr>
                </thead>
                <tbody>
                  {tagihanTampil.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => pilihTagihan(t.id)}
                      className={`cursor-pointer hover:bg-[#2573e2]/5 ${
                        t.id === tagihanTerpilihId ? 'bg-[#2573e2]/10' : ''
                      }`}
                    >
                      <td className={td}>{t.nomor}</td>
                      <td className={td}>{nomorKontrak(t.kontrakId)}</td>
                      <td className={td}>{t.uraian}</td>
                      <td className={tdKanan}>{formatRupiah(t.nilai)}</td>
                      <td className={td}>{formatTanggal(t.tanggalTerbit)}</td>
                      <td className={td}>{formatTanggal(t.tanggalJatuhTempo)}</td>
                      <td className={td}>{t.kodeAkun}</td>
                      <td className={td}>
                        <StatusBadge status={statusTagihan(t, data.pembayaran)} />
                      </td>
                      <td className={tdKanan}>
                        {formatRupiah(sisaTagihan(t, data.pembayaran))}
                      </td>
                      <td className={td}>{kelompokUmurPiutang(t)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tagihanTampil.length === 0 && (
                <div className="mt-3">
                  <PesanKosong teks="Tidak ada tagihan yang cocok dengan filter atau pencarian." />
                </div>
              )}
            </div>
          </Kartu>

          {tagihanTerpilih && (
            <Kartu>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <JudulBagian>
                  Detail {tagihanTerpilih.nomor} — {tagihanTerpilih.uraian}
                </JudulBagian>
                <TombolSekunder onClick={() => setTagihanTerpilihId(null)}>
                  Tutup Detail
                </TombolSekunder>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm text-[#0d2569] sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-[#0d2569]/60">Kontrak</dt>
                  <dd>{nomorKontrak(tagihanTerpilih.kontrakId)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#0d2569]/60">Nilai</dt>
                  <dd>{formatRupiah(tagihanTerpilih.nilai)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#0d2569]/60">Sisa Piutang</dt>
                  <dd>{formatRupiah(sisaTagihan(tagihanTerpilih, data.pembayaran))}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#0d2569]/60">Status</dt>
                  <dd>
                    <StatusBadge
                      status={statusTagihan(tagihanTerpilih, data.pembayaran)}
                    />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#0d2569]/60">Tanggal Terbit</dt>
                  <dd>{formatTanggal(tagihanTerpilih.tanggalTerbit)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#0d2569]/60">Jatuh Tempo</dt>
                  <dd>{formatTanggal(tagihanTerpilih.tanggalJatuhTempo)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#0d2569]/60">Kode Akun</dt>
                  <dd>
                    {tagihanTerpilih.kodeAkun} —{' '}
                    {uraianKodeAkun(tagihanTerpilih.kodeAkun)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#0d2569]/60">Umur Piutang</dt>
                  <dd>{kelompokUmurPiutang(tagihanTerpilih)}</dd>
                </div>
              </dl>

              <h3 className="mt-5 text-sm font-bold text-[#0d2569]">Pembayaran</h3>
              {data.pembayaran.filter((p) => p.tagihanId === tagihanTerpilih.id)
                .length === 0 ? (
                <div className="mt-2">
                  <PesanKosong teks="Belum ada pembayaran untuk tagihan ini." />
                </div>
              ) : (
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className={th}>Tanggal Bayar</th>
                        <th className={`${th} text-right`}>Jumlah</th>
                        <th className={th}>Metode</th>
                        <th className={th}>Penyetor</th>
                        <th className={th}>Status Verifikasi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.pembayaran
                        .filter((p) => p.tagihanId === tagihanTerpilih.id)
                        .map((p) => (
                          <tr key={p.id}>
                            <td className={td}>{formatTanggal(p.tanggalBayar)}</td>
                            <td className={tdKanan}>{formatRupiah(p.jumlah)}</td>
                            <td className={td}>{p.metode}</td>
                            <td className={td}>{p.penyetor}</td>
                            <td className={td}>
                              <StatusBadge status={p.statusVerifikasi} />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              <h3 className="mt-5 text-sm font-bold text-[#0d2569]">Denda</h3>
              {data.denda.filter((d) => d.tagihanId === tagihanTerpilih.id).length ===
              0 ? (
                <div className="mt-2">
                  <PesanKosong teks="Belum ada denda untuk tagihan ini." />
                </div>
              ) : (
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className={th}>ID</th>
                        <th className={`${th} text-right`}>Jumlah</th>
                        <th className={th}>Status</th>
                        <th className={th}>Dasar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.denda
                        .filter((d) => d.tagihanId === tagihanTerpilih.id)
                        .map((d) => (
                          <tr key={d.id}>
                            <td className={td}>{d.id}</td>
                            <td className={tdKanan}>{formatRupiah(d.jumlah)}</td>
                            <td className={td}>
                              <StatusBadge status={d.status} />
                            </td>
                            <td className={td}>{d.dasar}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {bolehAksi(user.peran, 'catatPembayaran') && (
                <div className="mt-6 rounded-md border border-[#2573e2]/20 bg-[#2573e2]/5 p-4">
                  <h3 className="text-sm font-bold text-[#0d2569]">
                    Catat Pembayaran
                  </h3>
                  <p className="mt-1 text-xs text-[#0d2569]/60">
                    Pembayaran baru berstatus Menunggu Verifikasi sampai diverifikasi
                    Keuangan.
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Tanggal Bayar</Label>
                      <input
                        type="date"
                        value={tanggalBayar}
                        onChange={(e) => setTanggalBayar(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <Label>Jumlah (Rp)</Label>
                      <input
                        type="number"
                        min={1}
                        value={jumlahBayar}
                        onChange={(e) => setJumlahBayar(e.target.value)}
                        placeholder="Contoh: 5000000"
                        className={inputClass}
                      />
                      <p className="mt-1 text-xs text-[#0d2569]/60">
                        Maksimal sisa piutang:{' '}
                        {formatRupiah(sisaTagihan(tagihanTerpilih, data.pembayaran))}
                      </p>
                    </div>
                    <div>
                      <Label>Metode</Label>
                      <select
                        value={metodeBayar}
                        onChange={(e) => setMetodeBayar(e.target.value)}
                        className={inputClass}
                      >
                        {MASTER_METODE_PEMBAYARAN.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Penyetor</Label>
                      <input
                        type="text"
                        value={penyetor}
                        onChange={(e) => setPenyetor(e.target.value)}
                        placeholder="Nama penyetor"
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Bukti Setor (opsional)</Label>
                      <input
                        type="text"
                        value={buktiSetor}
                        onChange={(e) => setBuktiSetor(e.target.value)}
                        placeholder="Nomor/keterangan bukti setor"
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
                      Simpan Pembayaran
                    </TombolUtama>
                  </div>
                </div>
              )}

              {bolehAksi(user.peran, 'tambahDenda') && (
                <div className="mt-4 rounded-md border border-[#2573e2]/20 bg-[#2573e2]/5 p-4">
                  <h3 className="text-sm font-bold text-[#0d2569]">Tambah Denda</h3>
                  <p className="mt-1 text-xs text-[#0d2569]/60">
                    Denda dicatat manual; rumus dan tarif resmi belum dikonfirmasi
                    (Q-03).
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Jumlah Denda (Rp)</Label>
                      <input
                        type="number"
                        min={1}
                        value={jumlahDenda}
                        onChange={(e) => setJumlahDenda(e.target.value)}
                        placeholder="Contoh: 350000"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <Label>Dasar (wajib diisi)</Label>
                      <textarea
                        value={dasarDenda}
                        onChange={(e) => setDasarDenda(e.target.value)}
                        placeholder="Contoh: Lewat jatuh tempo 05/05/2026."
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
                    <TombolUtama onClick={simpanDenda}>Simpan Denda</TombolUtama>
                  </div>
                </div>
              )}
            </Kartu>
          )}
        </div>
      )}

      {tab === 'payments' && (
        <Kartu>
          <JudulBagian>Semua Pembayaran</JudulBagian>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={th}>Tanggal Bayar</th>
                  <th className={th}>Tagihan</th>
                  <th className={th}>Penyetor</th>
                  <th className={`${th} text-right`}>Jumlah</th>
                  <th className={th}>Metode</th>
                  <th className={th}>Status Verifikasi</th>
                  <th className={th}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pembayaranTerurut.map((p) => {
                  const tagihan = data.tagihan.find((t) => t.id === p.tagihanId);
                  const menunggu = p.statusVerifikasi === 'Menunggu Verifikasi';
                  return (
                    <tr key={p.id}>
                      <td className={td}>{formatTanggal(p.tanggalBayar)}</td>
                      <td className={td}>
                        {tagihan ? `${tagihan.nomor} — ${tagihan.uraian}` : p.tagihanId}
                      </td>
                      <td className={td}>{p.penyetor}</td>
                      <td className={tdKanan}>{formatRupiah(p.jumlah)}</td>
                      <td className={td}>{p.metode}</td>
                      <td className={td}>
                        <StatusBadge status={p.statusVerifikasi} />
                      </td>
                      <td className={td}>
                        {menunggu && bolehAksi(user.peran, 'verifikasiPembayaran') ? (
                          <TombolSekunder
                            onClick={() => actions.verifikasiPembayaran(p.id)}
                          >
                            Verifikasi
                          </TombolSekunder>
                        ) : menunggu ? (
                          <span className="text-xs text-[#0d2569]/60">
                            Hanya Keuangan yang dapat memverifikasi
                          </span>
                        ) : (
                          <span className="text-xs text-[#0d2569]/60">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {pembayaranTerurut.length === 0 && (
              <div className="mt-3">
                <PesanKosong teks="Belum ada pembayaran." />
              </div>
            )}
          </div>
        </Kartu>
      )}

      {tab === 'billings' && (
        <Kartu>
          <JudulBagian>Ringkasan Penagihan per Kontrak</JudulBagian>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={th}>Nomor PKS</th>
                  <th className={th}>Klien</th>
                  <th className={`${th} text-right`}>Nilai Kontrak</th>
                  <th className={`${th} text-right`}>Total Tagihan</th>
                  <th className={`${th} text-right`}>Total Dibayar (Terverifikasi)</th>
                  <th className={`${th} text-right`}>Sisa Piutang</th>
                  <th className={`${th} text-right`}>Jumlah Tagihan</th>
                </tr>
              </thead>
              <tbody>
                {barisBillings.map((b) => (
                  <tr key={b.kontrak.id}>
                    <td className={td}>{b.kontrak.nomorPks}</td>
                    <td className={td}>{namaKlien(b.kontrak.klienId)}</td>
                    <td className={tdKanan}>{formatRupiah(b.kontrak.nilaiKontrak)}</td>
                    <td className={tdKanan}>{formatRupiah(b.totalTagihan)}</td>
                    <td className={tdKanan}>{formatRupiah(b.totalDibayar)}</td>
                    <td className={tdKanan}>{formatRupiah(b.sisa)}</td>
                    <td className={tdKanan}>{b.jumlahTagihan}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#2573e2]/5 font-bold">
                  <td className={td} colSpan={2}>
                    Total
                  </td>
                  <td className={tdKanan}>{formatRupiah(totalBillings.nilaiKontrak)}</td>
                  <td className={tdKanan}>{formatRupiah(totalBillings.totalTagihan)}</td>
                  <td className={tdKanan}>{formatRupiah(totalBillings.totalDibayar)}</td>
                  <td className={tdKanan}>{formatRupiah(totalBillings.sisa)}</td>
                  <td className={tdKanan}>{totalBillings.jumlahTagihan}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mt-3 text-xs text-[#0d2569]/60">
            Total baris bawah dihitung dari baris-baris di atas dan sama dengan total
            kontrol: total tagihan {formatRupiah(kontrol.totalTagihan)}, pembayaran
            terverifikasi {formatRupiah(kontrol.totalPembayaranTerverifikasi)}, sisa
            piutang {formatRupiah(kontrol.sisaPiutang)}.
          </p>
        </Kartu>
      )}

      {tab === 'rekonsiliasi' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              label="Pembayaran Terverifikasi"
              nilai={formatRupiah(kontrol.totalPembayaranTerverifikasi)}
            />
            <StatCard
              label="Penerimaan Acuan Keuangan"
              nilai={formatRupiah(kontrol.totalPenerimaanAcuan)}
            />
            <StatCard
              label="Selisih Terbuka"
              nilai={formatRupiah(kontrol.selisihRekonsiliasi)}
              keterangan={
                kontrol.selisihRekonsiliasi === 0
                  ? 'Cocok — tidak ada selisih.'
                  : 'Selisih harus ditindaklanjuti.'
              }
            />
          </div>
          {kontrol.selisihRekonsiliasi !== 0 && (
            <Peringatan
              teks={`Selisih rekonsiliasi ${formatRupiah(kontrol.selisihRekonsiliasi)} belum dijelaskan. Tindak lanjut: ACU-006 — Penerimaan tanpa tagihan Rp1.500.000 dari PT Swara Media Nusantara, 15/06/2026. Perlu konfirmasi ke Keuangan: tagihan mana yang dipasangkan, atau catat sebagai penerimaan tanpa tagihan.`}
            />
          )}

          <Kartu>
            <JudulBagian>Penerimaan Acuan Keuangan (Read-Only)</JudulBagian>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={th}>ID</th>
                    <th className={th}>Periode</th>
                    <th className={th}>Kode Akun</th>
                    <th className={th}>Uraian</th>
                    <th className={th}>Penyetor</th>
                    <th className={th}>Tanggal Setor</th>
                    <th className={`${th} text-right`}>Jumlah</th>
                    <th className={th}>Status Rekonsiliasi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.penerimaanAcuan.map((a) => {
                    const cocok = pembayaranTerverifikasi.some(
                      (p) => p.jumlah === a.jumlah && p.penyetor === a.penyetor,
                    );
                    return (
                      <tr key={a.id}>
                        <td className={td}>{a.id}</td>
                        <td className={td}>{a.periode}</td>
                        <td className={td}>{a.kodeAkun}</td>
                        <td className={td}>{a.uraian}</td>
                        <td className={td}>{a.penyetor}</td>
                        <td className={td}>{formatTanggal(a.tanggalSetor)}</td>
                        <td className={tdKanan}>{formatRupiah(a.jumlah)}</td>
                        <td className={td}>
                          <StatusBadge
                            status={
                              cocok ? 'Sudah Cocok' : 'Penerimaan Tanpa Tagihan'
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Kartu>

          <Kartu>
            <JudulBagian>Rekonsiliasi per Tagihan</JudulBagian>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={th}>Nomor</th>
                    <th className={th}>Uraian</th>
                    <th className={`${th} text-right`}>Nilai Tagihan</th>
                    <th className={`${th} text-right`}>Dibayar (Terverifikasi)</th>
                    <th className={`${th} text-right`}>Sisa</th>
                    <th className={th}>Status Rekonsiliasi</th>
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
                      <tr key={t.id}>
                        <td className={td}>{t.nomor}</td>
                        <td className={td}>{t.uraian}</td>
                        <td className={tdKanan}>{formatRupiah(t.nilai)}</td>
                        <td className={tdKanan}>{formatRupiah(dibayar)}</td>
                        <td className={tdKanan}>
                          {formatRupiah(sisaTagihan(t, data.pembayaran))}
                        </td>
                        <td className={td}>
                          <StatusBadge status={statusRekon} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Kartu>

          <Kartu>
            <JudulBagian>Total Kontrol per Kode Akun</JudulBagian>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={th}>Kode Akun</th>
                    <th className={th}>Uraian</th>
                    <th className={`${th} text-right`}>Tagihan</th>
                    <th className={`${th} text-right`}>Pembayaran</th>
                    <th className={`${th} text-right`}>Acuan Keuangan</th>
                    <th className={`${th} text-right`}>Selisih</th>
                  </tr>
                </thead>
                <tbody>
                  {perKodeAkun.map((r) => (
                    <tr key={r.kodeAkun}>
                      <td className={td}>{r.kodeAkun}</td>
                      <td className={td}>{uraianKodeAkun(r.kodeAkun)}</td>
                      <td className={tdKanan}>{formatRupiah(r.tagihan)}</td>
                      <td className={tdKanan}>{formatRupiah(r.pembayaran)}</td>
                      <td className={tdKanan}>{formatRupiah(r.acuan)}</td>
                      <td className={tdKanan}>{formatRupiah(r.selisih)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Kartu>
        </div>
      )}
    </div>
  );
}

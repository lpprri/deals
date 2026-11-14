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
            <Tabel>
              <thead>
                <tr>
                  <Th>Kode Akun</Th>
                  <Th>Uraian</Th>
                  <Th kanan>Tagihan</Th>
                  <Th kanan>Pembayaran</Th>
                  <Th kanan>Acuan Keuangan</Th>
                  <Th kanan>Selisih</Th>
                </tr>
              </thead>
              <tbody>
                {perKodeAkun.map((r) => (
                  <Baris key={r.kodeAkun}>
                    <Td>{r.kodeAkun}</Td>
                    <Td>{uraianKodeAkun(r.kodeAkun)}</Td>
                    <Td kanan>{formatRupiah(r.tagihan)}</Td>
                    <Td kanan>{formatRupiah(r.pembayaran)}</Td>
                    <Td kanan>{formatRupiah(r.acuan)}</Td>
                    <Td kanan>{formatRupiah(r.selisih)}</Td>
                  </Baris>
                ))}
              </tbody>
            </Tabel>
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
            <Tabel>
              <thead>
                <tr>
                  <Th>Nomor</Th>
                  <Th>Kontrak</Th>
                  <Th>Uraian</Th>
                  <Th kanan>Nilai</Th>
                  <Th>Terbit</Th>
                  <Th>Jatuh Tempo</Th>
                  <Th>Kode Akun</Th>
                  <Th>Status</Th>
                  <Th kanan>Sisa</Th>
                  <Th>Umur Piutang</Th>
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
                      <StatusBadge status={statusTagihan(t, data.pembayaran)} />
                    </Td>
                    <Td kanan>
                      {formatRupiah(sisaTagihan(t, data.pembayaran))}
                    </Td>
                    <Td>{kelompokUmurPiutang(t)}</Td>
                  </Baris>
                ))}
              </tbody>
            </Tabel>
            {tagihanTampil.length === 0 && (
              <div className="mt-3">
                <PesanKosong teks="Tidak ada tagihan yang cocok dengan filter atau pencarian." />
              </div>
            )}
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
                <Tabel>
                  <thead>
                    <tr>
                      <Th>Tanggal Bayar</Th>
                      <Th kanan>Jumlah</Th>
                      <Th>Metode</Th>
                      <Th>Penyetor</Th>
                      <Th>Status Verifikasi</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pembayaran
                      .filter((p) => p.tagihanId === tagihanTerpilih.id)
                      .map((p) => (
                        <Baris key={p.id}>
                          <Td>{formatTanggal(p.tanggalBayar)}</Td>
                          <Td kanan>{formatRupiah(p.jumlah)}</Td>
                          <Td>{p.metode}</Td>
                          <Td>{p.penyetor}</Td>
                          <Td>
                            <StatusBadge status={p.statusVerifikasi} />
                          </Td>
                        </Baris>
                      ))}
                  </tbody>
                </Tabel>
              )}

              <h3 className="mt-5 text-sm font-bold text-[#0d2569]">Denda</h3>
              {data.denda.filter((d) => d.tagihanId === tagihanTerpilih.id).length ===
              0 ? (
                <div className="mt-2">
                  <PesanKosong teks="Belum ada denda untuk tagihan ini." />
                </div>
              ) : (
                <Tabel>
                  <thead>
                    <tr>
                      <Th>ID</Th>
                      <Th kanan>Jumlah</Th>
                      <Th>Status</Th>
                      <Th>Dasar</Th>
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
                            <StatusBadge status={d.status} />
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
          <Tabel>
            <thead>
              <tr>
                <Th>Tanggal Bayar</Th>
                <Th>Tagihan</Th>
                <Th>Penyetor</Th>
                <Th kanan>Jumlah</Th>
                <Th>Metode</Th>
                <Th>Status Verifikasi</Th>
                <Th>Aksi</Th>
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
                    <Td>{p.metode}</Td>
                    <Td>
                      <StatusBadge status={p.statusVerifikasi} />
                    </Td>
                    <Td>
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
                    </Td>
                  </Baris>
                );
              })}
            </tbody>
          </Tabel>
          {pembayaranTerurut.length === 0 && (
            <div className="mt-3">
              <PesanKosong teks="Belum ada pembayaran." />
            </div>
          )}
        </Kartu>
      )}

      {tab === 'billings' && (
        <Kartu>
          <JudulBagian>Ringkasan Penagihan per Kontrak</JudulBagian>
          <Tabel>
            <thead>
              <tr>
                <Th>Nomor PKS</Th>
                <Th>Klien</Th>
                <Th kanan>Nilai Kontrak</Th>
                <Th kanan>Total Tagihan</Th>
                <Th kanan>Total Dibayar (Terverifikasi)</Th>
                <Th kanan>Sisa Piutang</Th>
                <Th kanan>Jumlah Tagihan</Th>
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
              nilai={
                data.penerimaanAcuan.length === 0
                  ? '—'
                  : formatRupiah(kontrol.selisihRekonsiliasi)
              }
              keterangan={
                data.penerimaanAcuan.length === 0
                  ? 'Data acuan Keuangan belum diimpor.'
                  : kontrol.selisihRekonsiliasi === 0
                    ? 'Cocok — tidak ada selisih.'
                    : 'Selisih harus ditindaklanjuti.'
              }
            />
          </div>
          {data.penerimaanAcuan.length > 0 &&
            kontrol.selisihRekonsiliasi !== 0 && (
              <Peringatan
                teks={`Selisih rekonsiliasi ${formatRupiah(kontrol.selisihRekonsiliasi)} belum dijelaskan. Perlu konfirmasi ke Keuangan: penerimaan acuan mana yang belum terpasangkan dengan pembayaran terverifikasi, atau catat sebagai penerimaan tanpa tagihan.`}
              />
            )}

          <Kartu>
            <JudulBagian>Penerimaan Acuan Keuangan (Read-Only)</JudulBagian>
            {data.penerimaanAcuan.length === 0 && (
              <p className="mt-3 text-sm text-[#0d2569]/70">
                Data acuan Keuangan belum diimpor — Sheet 3 (DATA PNBP 2026)
                belum terbaca karena batas konektor saat impor 14/11/2026.
                Rekonsiliasi terhadap acuan Keuangan belum dapat dilakukan
                sampai data itu diimpor.
              </p>
            )}
            <Tabel>
              <thead>
                <tr>
                  <Th>ID</Th>
                  <Th>Periode</Th>
                  <Th>Kode Akun</Th>
                  <Th>Uraian</Th>
                  <Th>Penyetor</Th>
                  <Th>Tanggal Setor</Th>
                  <Th kanan>Jumlah</Th>
                  <Th>Status Rekonsiliasi</Th>
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
                        <StatusBadge status={statusRekon} />
                      </Td>
                    </Baris>
                  );
                })}
              </tbody>
            </Tabel>
          </Kartu>

          <Kartu>
            <JudulBagian>Rekonsiliasi per Tagihan</JudulBagian>
            <Tabel>
              <thead>
                <tr>
                  <Th>Nomor</Th>
                  <Th>Uraian</Th>
                  <Th kanan>Nilai Tagihan</Th>
                  <Th kanan>Dibayar (Terverifikasi)</Th>
                  <Th kanan>Sisa</Th>
                  <Th>Status Rekonsiliasi</Th>
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
                        <StatusBadge status={statusRekon} />
                      </Td>
                    </Baris>
                  );
                })}
              </tbody>
            </Tabel>
          </Kartu>

          <Kartu>
            <JudulBagian>Total Kontrol per Kode Akun</JudulBagian>
            <Tabel>
              <thead>
                <tr>
                  <Th>Kode Akun</Th>
                  <Th>Uraian</Th>
                  <Th kanan>Tagihan</Th>
                  <Th kanan>Pembayaran</Th>
                  <Th kanan>Acuan Keuangan</Th>
                  <Th kanan>Selisih</Th>
                </tr>
              </thead>
              <tbody>
                {perKodeAkun.map((r) => (
                  <Baris key={r.kodeAkun}>
                    <Td>{r.kodeAkun}</Td>
                    <Td>{uraianKodeAkun(r.kodeAkun)}</Td>
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

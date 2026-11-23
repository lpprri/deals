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
  'Penerimaan Tanpa Tagihan': 'Penerimaan Tanpa Tagihan',
  'Sudah Cocok': 'Sudah Cocok',
  'Cocok Sebagian': 'Cocok Sebagian',
  'Belum Ada Penerimaan': 'Belum Ada Penerimaan',
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
  { id: 'overview', label: 'Ringkasan' },
  { id: 'invoice', label: 'Tagihan' },
  { id: 'payments', label: 'Pembayaran' },
  { id: 'billings', label: 'Billing' },
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
      setErrorBayar('Jumlah pembayaran wajib diisi dan harus lebih dari 0.');
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
      `Pembayaran ${formatRupiah(jumlah)} tercatat dengan status Menunggu verifikasi.`,
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
      setErrorDenda('Jumlah denda wajib diisi dan harus lebih dari 0.');
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
    setSuksesDenda(`Denda ${formatRupiah(jumlah)} tercatat untuk ${tagihanTerpilih.nomor}.`);
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
            <StatCard label="Denda Keterlambatan Tercatat" nilai={formatRupiah(kontrol.totalDenda)} />
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
              Data acuan Keuangan hanya baca, ditampilkan hanya untuk rekonsiliasi dan tidak bisa diubah dari modul ini.
            </p>
          </Kartu>
        </div>
      )}

      {tab === 'invoice' && (
        <div className="space-y-4">
          <Kartu>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <Label>Saring berdasarkan status</Label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={inputClass}
                >
                  <option value="Semua">Semua status</option>
                  {STATUS_TAGIHAN.map((s) => (
                    <option key={s} value={s}>
                      {labelStatusTagihan(s)}
                    </option>
                  ))}
                </select>
              </div>
              <p className="pb-2 text-xs text-[#0d2569]/60">
                {kataCari
                  ? `Pencarian "${cari}": ${tagihanTampil.length} tagihan ditemukan.`
                  : 'Klik baris tagihan untuk melihat detail, pembayaran, dan denda.'}
              </p>
            </div>
            <Tabel>
              <thead>
                <tr>
                  <Th>Nomor</Th>
                  <Th>Kontrak</Th>
                  <Th>Uraian</Th>
                  <Th kanan>Jumlah</Th>
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
                  <dt className="text-xs text-[#0d2569]/60">Jumlah</dt>
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
                      status={labelStatusTagihan(statusTagihan(tagihanTerpilih, data.pembayaran))}
                    />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#0d2569]/60">Tanggal Terbit</dt>
                  <dd>{formatTanggal(tagihanTerpilih.tanggalTerbit)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#0d2569]/60">Tanggal Jatuh Tempo</dt>
                  <dd>{formatTanggal(tagihanTerpilih.tanggalJatuhTempo)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#0d2569]/60">Kode Akun</dt>
                  <dd>
                    {tagihanTerpilih.kodeAkun} —{' '}
                    {labelUraianKodeAkun(uraianKodeAkun(tagihanTerpilih.kodeAkun))}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#0d2569]/60">Umur Piutang</dt>
                  <dd>{labelUmurPiutang(kelompokUmurPiutang(tagihanTerpilih))}</dd>
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

              <h3 className="mt-5 text-sm font-bold text-[#0d2569]">Denda Keterlambatan</h3>
              {data.denda.filter((d) => d.tagihanId === tagihanTerpilih.id).length ===
              0 ? (
                <div className="mt-2">
                  <PesanKosong teks="Belum ada denda keterlambatan untuk tagihan ini." />
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
                    Catat Pembayaran
                  </h3>
                  <p className="mt-1 text-xs text-[#0d2569]/60">
                    Pembayaran baru berstatus Menunggu verifikasi sampai diverifikasi oleh Keuangan.
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
                        Maksimum sisa piutang:{' '}
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
                            {labelMetodePembayaran(m)}
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
                        placeholder="Nomor bukti setor / referensi"
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
                    Denda keterlambatan dicatat manual; rumus dan tarif resminya belum dikonfirmasi (Q-03).
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
                        placeholder="Contoh: Jatuh tempo sejak 05/05/2026."
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
                    <Td>{labelMetodePembayaran(p.metode)}</Td>
                    <Td>
                      <StatusBadge status={labelStatusVerifikasi(p.statusVerifikasi)} />
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
                          Hanya Keuangan yang bisa memverifikasi
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
          <JudulBagian>Ringkasan Billing per Kontrak</JudulBagian>
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
            Total di baris bawah dihitung dari baris-baris di atas dan cocok dengan total kontrol: total tagihan {formatRupiah(kontrol.totalTagihan)}, pembayaran terverifikasi {formatRupiah(kontrol.totalPembayaranTerverifikasi)}, sisa piutang {formatRupiah(kontrol.sisaPiutang)}.
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
              label="Selisih Rekonsiliasi"
              nilai={
                data.penerimaanAcuan.length === 0
                  ? '—'
                  : formatRupiah(kontrol.selisihRekonsiliasi)
              }
              keterangan={
                data.penerimaanAcuan.length === 0
                  ? 'Data acuan Keuangan belum diimpor.'
                  : kontrol.selisihRekonsiliasi === 0
                    ? 'Cocok, tidak ada selisih.'
                    : jembatan.sisaTakTerjelaskan === 0
                      ? 'Sudah dijelaskan sepenuhnya, lihat rinciannya di bawah.'
                      : 'Sebagian belum dijelaskan, lihat rinciannya di bawah.'
              }
            />
          </div>
          {data.penerimaanAcuan.length > 0 &&
            kontrol.selisihRekonsiliasi !== 0 && (
              <Kartu>
                <JudulBagian>Penjelasan Selisih</JudulBagian>
                <p className="mt-2 text-sm text-[#0d2569]/70">
                  Penerimaan acuan Keuangan{' '}
                  {formatRupiah(jembatan.totalAcuan)} − pembayaran terverifikasi{' '}
                  {formatRupiah(jembatan.totalPembayaranTerverifikasi)} =
                  selisih {formatRupiah(jembatan.selisih)}. Rincian di bawah menjelaskan selisih sampai rupiah terakhir, dihitung dari data, bukan ditulis manual.
                </p>
                <Tabel>
                  <thead>
                    <tr>
                      <Th>Uraian</Th>
                      <Th>Baris</Th>
                      <Th kanan>Jumlah</Th>
                    </tr>
                  </thead>
                  <tbody>
                    <Baris>
                      <Td>
                        Penerimaan acuan tanpa tagihan
                        <div className="text-xs text-[#0d2569]/60">
                          Di luar tagihan kerja sama:{' '}
                          {jembatan.acuanTanpaPembayaran.perKodeAkun
                            .map(
                              (r) =>
                                `${r.kodeAkun} ${labelUraianKodeAkun(uraianKodeAkun(r.kodeAkun))} ${formatRupiah(r.total)} (${r.jumlahBaris} baris)`,
                            )
                            .join(' · ')}
                        </div>
                      </Td>
                      <Td>
                        {jembatan.acuanTanpaPembayaran.jumlahBaris} baris
                      </Td>
                      <Td kanan>
                        {formatRupiah(jembatan.acuanTanpaPembayaran.total)}
                      </Td>
                    </Baris>
                    <Baris>
                      <Td>
                        Penerimaan acuan tanpa NTPN
                        <div className="text-xs text-[#0d2569]/60">
                          Tidak ada NTPN di uraian, jadi tidak bisa dicocokkan dengan pembayaran.
                        </div>
                      </Td>
                      <Td>{jembatan.acuanTanpaNtpn.jumlahBaris} baris</Td>
                      <Td kanan>
                        {formatRupiah(jembatan.acuanTanpaNtpn.total)}
                      </Td>
                    </Baris>
                    <Baris>
                      <Td>
                        Pembayaran terverifikasi tanpa acuan
                        <div className="text-xs text-[#0d2569]/60">
                          NTPN tidak ada di data acuan Keuangan
                          {jembatan.pembayaranTanpaAcuan.tanggalTerawal !==
                            null &&
                            ` · tanggal bayar ${formatTanggal(jembatan.pembayaranTanpaAcuan.tanggalTerawal)}${jembatan.pembayaranTanpaAcuan.tanggalTerakhir !==
                              jembatan.pembayaranTanpaAcuan.tanggalTerawal
                              ? `–${formatTanggal(jembatan.pembayaranTanpaAcuan.tanggalTerakhir ?? '')}`
                              : ''}`}
                          .
                        </div>
                      </Td>
                      <Td>
                        {jembatan.pembayaranTanpaAcuan.jumlahBaris} baris
                      </Td>
                      <Td kanan>
                        {formatRupiah(-jembatan.pembayaranTanpaAcuan.total)}
                      </Td>
                    </Baris>
                    <Baris>
                      <Td>
                        Selisih pasangan NTPN (acuan cocok − pembayaran cocok)
                        <div className="text-xs text-[#0d2569]/60">
                          {jembatan.pasangan.selisih === 0
                            ? 'Semua pasangan cocok jumlahnya.'
                            : jembatan.pasangan.selisih < 0
                              ? 'Acuan yang cocok lebih kecil dari pembayaran yang cocok, pembayaran terpecah di Sheet 3 (pokok + denda).'
                              : 'Acuan yang cocok lebih besar dari pembayaran yang cocok.'}
                        </div>
                      </Td>
                      <Td>
                        {jembatan.pasangan.jumlahBarisAcuan} baris acuan ·{' '}
                        {jembatan.pasangan.jumlahPembayaran} pembayaran
                      </Td>
                      <Td kanan>
                        {formatRupiah(jembatan.pasangan.selisih)}
                      </Td>
                    </Baris>
                  </tbody>
                  <tfoot>
                    <Baris className="bg-[#2573e2]/5 font-semibold">
                      <Td colSpan={2}>Selisih (dijelaskan)</Td>
                      <Td kanan tebal>
                        {formatRupiah(jembatan.selisih)}
                      </Td>
                    </Baris>
                  </tfoot>
                </Tabel>
                {jembatan.sisaTakTerjelaskan === 0 ? (
                  <p className="mt-3 text-xs text-[#0d2569]/60">
                    Selisih sudah dijelaskan sepenuhnya, sisa yang belum dijelaskan Rp0.
                  </p>
                ) : (
                  <div className="mt-3">
                    <Peringatan
                      teks={`Sisa selisih ${formatRupiah(jembatan.sisaTakTerjelaskan)} belum dijelaskan oleh rincian di atas, perlu konfirmasi dari Keuangan.`}
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
                    Pasangan kode akun tidak cocok: {b.jumlahBaris} baris tercatat sebagai {b.kodeAcuan} ({labelUraianKodeAkun(uraianKodeAkun(b.kodeAcuan))}) di Sheet 3 padahal tagihannya {b.kodeTagihan} ({labelUraianKodeAkun(uraianKodeAkun(b.kodeTagihan))}), {formatRupiah(b.totalAcuan)}. Ini selisih per kode akun; totalnya tidak berubah; klasifikasinya menunggu konfirmasi dari Keuangan.
                  </p>
                ))}
                {jembatan.dendaTertanam.jumlahBaris > 0 && (
                  <p className="mt-3 text-xs text-[#0d2569]/60">
                    Denda tertanam {formatRupiah(jembatan.dendaTertanam.total)}{' '} ({jembatan.dendaTertanam.jumlahBaris} baris acuan 425839) sudah termasuk dalam pembayaran tagihan, tercatat sebagai 425839 di Sheet 3, tidak ditambahkan lagi ke piutang.
                  </p>
                )}
              </Kartu>
            )}

          <Kartu>
            <JudulBagian>Penerimaan Acuan Keuangan (Hanya Baca)</JudulBagian>
            {data.penerimaanAcuan.length === 0 && (
              <p className="mt-3 text-sm text-[#0d2569]/70">
                Data acuan Keuangan belum diimpor, Sheet 3 (DATA PNBP 2026) tidak bisa dibaca karena batas konektor saat impor 14/11/2026. Rekonsiliasi terhadap acuan Keuangan tidak bisa dilakukan sampai data itu diimpor.
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
                        <StatusBadge status={labelStatusRekon(statusRekon)} />
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
                  <Th kanan>Jumlah Tagihan</Th>
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
                        <StatusBadge status={labelStatusRekon(statusRekon)} />
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

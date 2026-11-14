// Modul Sales — Fase B (PRD v2.0 Final Bab 7.3 & 9.5; US-S1, US-S2, US-S3).
// Palet HANYA 3 warna RRI: Biru #2573E2, Navy #0D2569, Putih #FFFFFF.
// Status dibedakan teks & ikon (StatusBadge), bukan warna baru.
// Semua angka Analytics berasal dari hitungAnalitikSales(data).

import { useState } from 'react';
import type {
  Order as OrderItem,
  Prospect as ProspectItem,
  Quotation as QuotationItem,
  StatusOrder,
  StatusQuotation,
  TahapPipeline,
} from '../lib/types';
import type {
  MeetingInput,
  ModulProps,
  ProspectInput,
  QuotationInput,
  QuotationLayananInput,
} from '../lib/store';
import {
  MASTER_KATEGORI_LAYANAN,
  MASTER_PROGRAMA,
  MASTER_SUMBER_PROSPEK,
  MASTER_TAHAP_PIPELINE,
} from '../lib/master';
import { hitungAnalitikSales } from '../lib/derive';
import { formatRupiah, formatTanggal, hariIniIso } from '../lib/format';
import { bolehAksi } from '../lib/permissions';
import {
  JudulBagian,
  Kartu,
  Label,
  PesanKosong,
  Peringatan,
  StatCard,
  StatusBadge,
  TabBar,
  TombolSekunder,
  TombolUtama,
  inputClass,
} from '../components/ui';

const th = 'px-3 py-2 text-left text-xs font-semibold text-[#0d2569]/70';
const td = 'px-3 py-2 align-top text-sm text-[#0d2569]';
const barisKlik =
  'cursor-pointer border-t border-[#2573e2]/10 hover:bg-[#2573e2]/5';

const TABS = [
  { id: 'prospek', label: 'Prospek' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'quotation', label: 'Quotation' },
  { id: 'order', label: 'Order' },
  { id: 'meeting', label: 'Meeting' },
  { id: 'analytics', label: 'Analytics' },
];

export default function Sales(props: ModulProps) {
  const [tab, setTab] = useState('prospek');
  return (
    <div className="space-y-4">
      <JudulBagian>Sales</JudulBagian>
      <TabBar tabs={TABS} aktif={tab} onPilih={setTab} />
      {tab === 'prospek' && <TabProspek {...props} />}
      {tab === 'pipeline' && <TabPipeline {...props} />}
      {tab === 'quotation' && <TabQuotation {...props} />}
      {tab === 'order' && <TabOrder {...props} />}
      {tab === 'meeting' && <TabMeeting {...props} />}
      {tab === 'analytics' && <TabAnalytics data={props.data} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PROSPEK (US-S1)
// ---------------------------------------------------------------------------

function TabProspek({ data, user, actions, cari }: ModulProps) {
  const [filterTahap, setFilterTahap] = useState('Semua');
  const [filterSumber, setFilterSumber] = useState('Semua');
  const [prospekIdTerpilih, setProspekIdTerpilih] = useState<string | null>(null);
  const [tampilForm, setTampilForm] = useState(false);

  const kataKunci = cari.trim().toLowerCase();
  const prospekTersaring = data.prospect.filter(
    (p) =>
      (filterTahap === 'Semua' || p.tahap === filterTahap) &&
      (filterSumber === 'Semua' || p.sumber === filterSumber) &&
      (kataKunci === '' ||
        `${p.id} ${p.namaInstansi} ${p.kontakNama} ${p.telepon} ${p.penanggungJawab} ${p.layananDiminati}`
          .toLowerCase()
          .includes(kataKunci)),
  );

  const prospekTerpilih = prospekIdTerpilih
    ? data.prospect.find((p) => p.id === prospekIdTerpilih) ?? null
    : null;

  if (prospekTerpilih) {
    return (
      <DetailProspek
        data={data}
        user={user}
        actions={actions}
        prospect={prospekTerpilih}
        onKembali={() => setProspekIdTerpilih(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <JudulBagian>Prospek</JudulBagian>
        {bolehAksi(user.peran, 'kelolaProspect') && (
          <TombolUtama onClick={() => setTampilForm(true)}>
            + Tambah Prospek
          </TombolUtama>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <Label>Filter tahap</Label>
          <select
            className={`${inputClass} max-w-xs`}
            value={filterTahap}
            onChange={(e) => setFilterTahap(e.target.value)}
          >
            <option value="Semua">Semua</option>
            {MASTER_TAHAP_PIPELINE.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Filter sumber</Label>
          <select
            className={`${inputClass} max-w-xs`}
            value={filterSumber}
            onChange={(e) => setFilterSumber(e.target.value)}
          >
            <option value="Semua">Semua</option>
            {MASTER_SUMBER_PROSPEK.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {tampilForm && (
        <FormProspek
          actions={actions}
          onBatal={() => setTampilForm(false)}
          onSukses={() => setTampilForm(false)}
        />
      )}

      {prospekTersaring.length === 0 ? (
        <PesanKosong teks="Belum ada prospek yang cocok." />
      ) : (
        <Kartu className="overflow-x-auto p-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#2573e2]/5">
                <th className={th}>ID</th>
                <th className={th}>Nama Instansi</th>
                <th className={th}>Kontak</th>
                <th className={th}>Sumber</th>
                <th className={th}>Layanan Diminati</th>
                <th className={th}>Tahap</th>
                <th className={th}>Penanggung Jawab</th>
                <th className={th}>Tgl Tindak Lanjut</th>
                <th className={th}>Nilai Perkiraan</th>
              </tr>
            </thead>
            <tbody>
              {prospekTersaring.map((p) => (
                <tr
                  key={p.id}
                  className={barisKlik}
                  onClick={() => setProspekIdTerpilih(p.id)}
                >
                  <td className={`${td} font-semibold`}>{p.id}</td>
                  <td className={td}>{p.namaInstansi}</td>
                  <td className={td}>
                    {p.kontakNama}
                    <br />
                    <span className="text-xs text-[#0d2569]/60">{p.telepon}</span>
                  </td>
                  <td className={td}>{p.sumber}</td>
                  <td className={td}>{p.layananDiminati}</td>
                  <td className={td}>
                    <StatusBadge status={p.tahap} />
                  </td>
                  <td className={td}>{p.penanggungJawab}</td>
                  <td className={td}>{formatTanggal(p.tanggalTindakLanjut)}</td>
                  <td className={td}>{formatRupiah(p.nilaiPerkiraan)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Kartu>
      )}
    </div>
  );
}

function DetailProspek({
  data,
  user,
  actions,
  prospect,
  onKembali,
}: {
  data: ModulProps['data'];
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  prospect: ProspectItem;
  onKembali: () => void;
}) {
  const bolehUbah = bolehAksi(user.peran, 'kelolaProspect');
  const tahapBerikut = MASTER_TAHAP_PIPELINE.find((t) => t !== prospect.tahap);
  const [tahapTarget, setTahapTarget] = useState<TahapPipeline>(
    (tahapBerikut as TahapPipeline | undefined) ?? prospect.tahap,
  );
  const [catatanTahap, setCatatanTahap] = useState('');
  const [tlCatatan, setTlCatatan] = useState('');
  const [tlTanggal, setTlTanggal] = useState(hariIniIso());
  const [pesan, setPesan] = useState('');

  const klien = prospect.klienId
    ? data.klien.find((k) => k.id === prospect.klienId) ?? null
    : null;
  const pengajuan = prospect.pengajuanId
    ? data.pengajuan.find((p) => p.id === prospect.pengajuanId) ?? null
    : null;
  const kontrak = prospect.kontrakId
    ? data.kontrak.find((k) => k.id === prospect.kontrakId) ?? null
    : null;

  const pindahTahap = () => {
    if (tahapTarget === prospect.tahap) {
      setPesan('Pilih tahap tujuan yang berbeda dari tahap saat ini.');
      return;
    }
    if (catatanTahap.trim() === '') {
      setPesan('Catatan tindak lanjut wajib diisi untuk pindah tahap.');
      return;
    }
    const hasil = actions.ubahTahapProspect(
      prospect,
      tahapTarget,
      catatanTahap.trim(),
    );
    if (hasil !== null) {
      setPesan(hasil);
      return;
    }
    setCatatanTahap('');
    setPesan(`Tahap prospek diubah menjadi ${tahapTarget}.`);
  };

  const tambahTindakLanjut = () => {
    if (tlCatatan.trim() === '') {
      setPesan('Catatan tindak lanjut wajib diisi.');
      return;
    }
    if (tlTanggal === '') {
      setPesan('Tanggal tindak lanjut wajib diisi.');
      return;
    }
    actions.tambahTindakLanjut(prospect, tlCatatan.trim(), tlTanggal);
    setTlCatatan('');
    setTlTanggal(hariIniIso());
    setPesan('Tindak lanjut dicatat.');
  };

  return (
    <div className="space-y-4">
      <TombolSekunder onClick={onKembali}>&larr; Kembali ke daftar</TombolSekunder>
      <JudulBagian>
        {prospect.id} — {prospect.namaInstansi}
      </JudulBagian>

      <Kartu>
        <dl className="grid gap-2 text-sm md:grid-cols-2">
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Kontak</dt>
            <dd className="text-right font-semibold text-[#0d2569]">
              {prospect.kontakNama}
              {prospect.kontakJabatan ? ` (${prospect.kontakJabatan})` : ''}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Telepon</dt>
            <dd className="text-[#0d2569]">{prospect.telepon}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Email</dt>
            <dd className="text-[#0d2569]">{prospect.email ?? '-'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Sumber</dt>
            <dd className="text-[#0d2569]">{prospect.sumber}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Layanan diminati</dt>
            <dd className="text-right text-[#0d2569]">{prospect.layananDiminati}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Tahap</dt>
            <dd>
              <StatusBadge status={prospect.tahap} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Penanggung jawab</dt>
            <dd className="text-[#0d2569]">{prospect.penanggungJawab}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Tgl tindak lanjut</dt>
            <dd className="text-[#0d2569]">
              {formatTanggal(prospect.tanggalTindakLanjut)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Nilai perkiraan</dt>
            <dd className="text-[#0d2569]">{formatRupiah(prospect.nilaiPerkiraan)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Satker</dt>
            <dd className="text-[#0d2569]">
              {prospect.satker.nama} ({prospect.satker.kode})
            </dd>
          </div>
          {prospect.catatan && (
            <div className="flex justify-between gap-4 md:col-span-2">
              <dt className="text-[#0d2569]/60">Catatan</dt>
              <dd className="text-right text-[#0d2569]">{prospect.catatan}</dd>
            </div>
          )}
          {klien && (
            <div className="flex justify-between gap-4 md:col-span-2">
              <dt className="text-[#0d2569]/60">Klien terkait</dt>
              <dd className="text-right font-semibold text-[#0d2569]">
                {klien.nama} ({klien.id})
              </dd>
            </div>
          )}
          {pengajuan && (
            <div className="flex justify-between gap-4 md:col-span-2">
              <dt className="text-[#0d2569]/60">Pengajuan asal</dt>
              <dd className="text-right font-semibold text-[#0d2569]">
                {pengajuan.id} — tahap {pengajuan.tahap}
              </dd>
            </div>
          )}
          {kontrak && (
            <div className="flex justify-between gap-4 md:col-span-2">
              <dt className="text-[#0d2569]/60">Kontrak hasil konversi</dt>
              <dd className="text-right font-semibold text-[#0d2569]">
                {kontrak.nomorPks} ({kontrak.status})
              </dd>
            </div>
          )}
        </dl>
      </Kartu>

      <Kartu>
        <JudulBagian>Riwayat Tindak Lanjut</JudulBagian>
        {prospect.riwayat.length === 0 ? (
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Belum ada tindak lanjut yang dicatat.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {prospect.riwayat.map((r, i) => (
              <li
                key={`${r.tanggal}-${i}`}
                className="border-t border-[#2573e2]/10 pt-2 text-sm first:border-t-0 first:pt-0"
              >
                <p className="font-semibold text-[#0d2569]">
                  {formatTanggal(r.tanggal)} — {r.oleh}
                </p>
                <p className="text-[#0d2569]/80">{r.catatan}</p>
              </li>
            ))}
          </ul>
        )}
      </Kartu>

      {bolehUbah && (
        <Kartu>
          <JudulBagian>Pindah Tahap</JudulBagian>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div>
              <Label>Tahap tujuan *</Label>
              <select
                className={inputClass}
                value={tahapTarget}
                onChange={(e) =>
                  setTahapTarget(e.target.value as TahapPipeline)
                }
              >
                {MASTER_TAHAP_PIPELINE.filter((t) => t !== prospect.tahap).map(
                  (t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <Label>Catatan tindak lanjut *</Label>
              <input
                className={inputClass}
                value={catatanTahap}
                onChange={(e) => setCatatanTahap(e.target.value)}
                placeholder="Alasan / catatan perpindahan tahap"
              />
            </div>
          </div>
          <div className="mt-3">
            <TombolUtama onClick={pindahTahap}>Pindah Tahap</TombolUtama>
          </div>
        </Kartu>
      )}

      {bolehUbah && (
        <Kartu>
          <JudulBagian>Tambah Tindak Lanjut</JudulBagian>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div>
              <Label>Tanggal *</Label>
              <input
                className={inputClass}
                type="date"
                value={tlTanggal}
                onChange={(e) => setTlTanggal(e.target.value)}
              />
            </div>
            <div>
              <Label>Catatan *</Label>
              <input
                className={inputClass}
                value={tlCatatan}
                onChange={(e) => setTlCatatan(e.target.value)}
                placeholder="Catatan tindak lanjut"
              />
            </div>
          </div>
          <div className="mt-3">
            <TombolUtama onClick={tambahTindakLanjut}>
              Simpan Tindak Lanjut
            </TombolUtama>
          </div>
        </Kartu>
      )}

      {pesan !== '' && (
        <p className="rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {pesan}
        </p>
      )}
    </div>
  );
}

function FormProspek({
  actions,
  onBatal,
  onSukses,
}: {
  actions: ModulProps['actions'];
  onBatal: () => void;
  onSukses: () => void;
}) {
  const [form, setForm] = useState<ProspectInput>({
    namaInstansi: '',
    kontakNama: '',
    kontakJabatan: '',
    telepon: '',
    email: '',
    sumber: '',
    layananDiminati: '',
    penanggungJawab: '',
    tanggalTindakLanjut: '',
    nilaiPerkiraan: 0,
    catatan: '',
  });
  const [nilaiTeks, setNilaiTeks] = useState('');
  const [error, setError] = useState('');

  const ubah = (field: keyof ProspectInput, nilai: string) =>
    setForm((f) => ({ ...f, [field]: nilai }));

  const simpan = () => {
    if (form.namaInstansi.trim() === '') {
      setError('Nama instansi wajib diisi.');
      return;
    }
    if (form.kontakNama.trim() === '') {
      setError('Nama kontak wajib diisi.');
      return;
    }
    if (form.telepon.trim() === '') {
      setError('Telepon wajib diisi.');
      return;
    }
    if (form.sumber === '') {
      setError('Sumber prospek wajib dipilih.');
      return;
    }
    if (form.layananDiminati === '') {
      setError('Layanan diminati wajib dipilih.');
      return;
    }
    if (form.penanggungJawab.trim() === '') {
      setError('Penanggung jawab wajib diisi.');
      return;
    }
    const nilaiPerkiraan = Number(nilaiTeks);
    if (!(nilaiPerkiraan > 0)) {
      setError('Nilai perkiraan wajib diisi dan harus lebih dari 0.');
      return;
    }
    const hasil = actions.tambahProspect({
      namaInstansi: form.namaInstansi.trim(),
      kontakNama: form.kontakNama.trim(),
      kontakJabatan:
        form.kontakJabatan?.trim() === '' ? undefined : form.kontakJabatan?.trim(),
      telepon: form.telepon.trim(),
      email: form.email?.trim() === '' ? undefined : form.email?.trim(),
      sumber: form.sumber,
      layananDiminati: form.layananDiminati,
      penanggungJawab: form.penanggungJawab.trim(),
      tanggalTindakLanjut:
        form.tanggalTindakLanjut === '' ? undefined : form.tanggalTindakLanjut,
      nilaiPerkiraan,
      catatan: form.catatan?.trim() === '' ? undefined : form.catatan?.trim(),
    });
    if (hasil !== null) {
      setError(hasil);
      return;
    }
    onSukses();
  };

  return (
    <Kartu>
      <JudulBagian>Tambah Prospek</JudulBagian>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Nama instansi *</Label>
          <input
            className={inputClass}
            value={form.namaInstansi}
            onChange={(e) => ubah('namaInstansi', e.target.value)}
            placeholder="Nama instansi / perusahaan"
          />
        </div>
        <div>
          <Label>Nama kontak *</Label>
          <input
            className={inputClass}
            value={form.kontakNama}
            onChange={(e) => ubah('kontakNama', e.target.value)}
            placeholder="Nama narahubung"
          />
        </div>
        <div>
          <Label>Jabatan kontak</Label>
          <input
            className={inputClass}
            value={form.kontakJabatan ?? ''}
            onChange={(e) => ubah('kontakJabatan', e.target.value)}
            placeholder="Jabatan narahubung (opsional)"
          />
        </div>
        <div>
          <Label>Telepon *</Label>
          <input
            className={inputClass}
            value={form.telepon}
            onChange={(e) => ubah('telepon', e.target.value)}
            placeholder="Nomor telepon"
          />
        </div>
        <div>
          <Label>Email</Label>
          <input
            className={inputClass}
            type="email"
            value={form.email ?? ''}
            onChange={(e) => ubah('email', e.target.value)}
            placeholder="Email (opsional)"
          />
        </div>
        <div>
          <Label>Sumber *</Label>
          <select
            className={inputClass}
            value={form.sumber}
            onChange={(e) => ubah('sumber', e.target.value)}
          >
            <option value="">— Pilih sumber —</option>
            {MASTER_SUMBER_PROSPEK.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Layanan diminati *</Label>
          <select
            className={inputClass}
            value={form.layananDiminati}
            onChange={(e) => ubah('layananDiminati', e.target.value)}
          >
            <option value="">— Pilih layanan —</option>
            {MASTER_KATEGORI_LAYANAN.map((k) => (
              <option key={k.nama} value={k.nama}>
                {k.nama}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Penanggung jawab *</Label>
          <input
            className={inputClass}
            value={form.penanggungJawab}
            onChange={(e) => ubah('penanggungJawab', e.target.value)}
            placeholder="Nama penanggung jawab"
          />
        </div>
        <div>
          <Label>Tanggal tindak lanjut</Label>
          <input
            className={inputClass}
            type="date"
            value={form.tanggalTindakLanjut ?? ''}
            onChange={(e) => ubah('tanggalTindakLanjut', e.target.value)}
          />
        </div>
        <div>
          <Label>Nilai perkiraan (Rp) *</Label>
          <input
            className={inputClass}
            type="number"
            min="1"
            value={nilaiTeks}
            onChange={(e) => setNilaiTeks(e.target.value)}
            placeholder="Harus lebih dari 0"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Catatan</Label>
          <textarea
            className={`${inputClass} min-h-20`}
            value={form.catatan ?? ''}
            onChange={(e) => ubah('catatan', e.target.value)}
            placeholder="Catatan prospek (opsional)"
          />
        </div>
      </div>

      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Simpan Prospek</TombolUtama>
        <TombolSekunder onClick={onBatal}>Batal</TombolSekunder>
      </div>
    </Kartu>
  );
}

// ---------------------------------------------------------------------------
// PIPELINE (US-S2)
// ---------------------------------------------------------------------------

function TabPipeline({ data, user, actions }: ModulProps) {
  const bolehUbah = bolehAksi(user.peran, 'kelolaProspect');
  return (
    <div className="space-y-4">
      <JudulBagian>Pipeline</JudulBagian>
      <Peringatan teks="Tahap pipeline masih draf — menunggu jawaban Q-11 (PRD Lampiran C). Tahap dapat berubah tanpa mengubah data." />
      <div className="flex gap-3 overflow-x-auto pb-2">
        {MASTER_TAHAP_PIPELINE.map((tahap) => {
          const isi = data.prospect.filter((p) => p.tahap === tahap);
          const nilai = isi.reduce((s, p) => s + p.nilaiPerkiraan, 0);
          return (
            <div
              key={tahap}
              className="w-64 shrink-0 rounded-md border border-[#2573e2]/20 bg-white p-3"
            >
              <p className="text-sm font-bold text-[#0d2569]">{tahap}</p>
              <p className="mt-0.5 text-xs text-[#0d2569]/60">
                {isi.length} prospek — {formatRupiah(nilai)}
              </p>
              <div className="mt-3 space-y-2">
                {isi.length === 0 ? (
                  <p className="text-xs text-[#0d2569]/60">
                    Belum ada prospek pada tahap ini.
                  </p>
                ) : (
                  isi.map((p) => (
                    <PipelineCard
                      key={p.id}
                      prospect={p}
                      actions={actions}
                      bolehUbah={bolehUbah}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PipelineCard({
  prospect,
  actions,
  bolehUbah,
}: {
  prospect: ProspectItem;
  actions: ModulProps['actions'];
  bolehUbah: boolean;
}) {
  const idx = MASTER_TAHAP_PIPELINE.indexOf(prospect.tahap);
  const tahapSelanjutnya =
    idx >= 0 && idx < MASTER_TAHAP_PIPELINE.length - 1
      ? MASTER_TAHAP_PIPELINE[idx + 1]
      : MASTER_TAHAP_PIPELINE.find((t) => t !== prospect.tahap) ?? prospect.tahap;
  const [tahapTarget, setTahapTarget] = useState<TahapPipeline>(
    tahapSelanjutnya as TahapPipeline,
  );
  const [catatan, setCatatan] = useState('');
  const [pesan, setPesan] = useState('');

  const tahapSebelumnya =
    idx > 0 ? MASTER_TAHAP_PIPELINE[idx - 1] : null;

  const pindah = () => {
    if (tahapTarget === prospect.tahap) {
      setPesan('Pilih tahap tujuan yang berbeda dari tahap saat ini.');
      return;
    }
    if (catatan.trim() === '') {
      setPesan('Catatan wajib diisi untuk pindah tahap.');
      return;
    }
    const hasil = actions.ubahTahapProspect(
      prospect,
      tahapTarget,
      catatan.trim(),
    );
    if (hasil !== null) {
      setPesan(hasil);
      return;
    }
    setCatatan('');
    setPesan(`Pindah ke ${tahapTarget}.`);
  };

  return (
    <div className="rounded-md border border-[#2573e2]/20 bg-[#2573e2]/5 p-3">
      <p className="text-sm font-semibold text-[#0d2569]">
        {prospect.namaInstansi}
      </p>
      <p className="mt-0.5 text-xs text-[#0d2569]/70">
        {formatRupiah(prospect.nilaiPerkiraan)}
      </p>
      <p className="text-xs text-[#0d2569]/70">{prospect.penanggungJawab}</p>
      {bolehUbah && (
        <div className="mt-2 space-y-2">
          <div className="flex gap-1">
            <TombolSekunder
              disabled={tahapSebelumnya === null}
              onClick={() =>
                tahapSebelumnya !== null &&
                setTahapTarget(tahapSebelumnya as TahapPipeline)
              }
            >
              &larr;
            </TombolSekunder>
            <select
              className={`${inputClass} min-w-0 flex-1 px-2 py-1.5 text-xs`}
              value={tahapTarget}
              onChange={(e) => setTahapTarget(e.target.value as TahapPipeline)}
            >
              {MASTER_TAHAP_PIPELINE.filter((t) => t !== prospect.tahap).map(
                (t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ),
              )}
            </select>
            <TombolSekunder
              disabled={
                idx < 0 || idx >= MASTER_TAHAP_PIPELINE.length - 1
              }
              onClick={() =>
                idx >= 0 &&
                idx < MASTER_TAHAP_PIPELINE.length - 1 &&
                setTahapTarget(
                  MASTER_TAHAP_PIPELINE[idx + 1] as TahapPipeline,
                )
              }
            >
              &rarr;
            </TombolSekunder>
          </div>
          <input
            className={`${inputClass} px-2 py-1.5 text-xs`}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Catatan pindah tahap *"
          />
          <TombolSekunder onClick={pindah}>Pindah Tahap</TombolSekunder>
          {pesan !== '' && (
            <p className="text-xs font-semibold text-[#0d2569]">{pesan}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// QUOTATION (US-S2)
// ---------------------------------------------------------------------------

function statusQuotationBerikutnya(status: StatusQuotation): StatusQuotation[] {
  switch (status) {
    case 'Draft':
      return ['Dikirim'];
    case 'Dikirim':
      return ['Disetujui', 'Ditolak'];
    default:
      return [];
  }
}

function namaProspek(data: ModulProps['data'], prospectId: string): string {
  return (
    data.prospect.find((p) => p.id === prospectId)?.namaInstansi ?? prospectId
  );
}

function TabQuotation({ data, user, actions, cari }: ModulProps) {
  const [quotationIdTerpilih, setQuotationIdTerpilih] = useState<string | null>(
    null,
  );
  const [tampilForm, setTampilForm] = useState(false);

  const kataKunci = cari.trim().toLowerCase();
  const quotationTersaring = data.quotation.filter(
    (q) =>
      kataKunci === '' ||
      `${q.id} ${namaProspek(data, q.prospectId)} ${q.status}`
        .toLowerCase()
        .includes(kataKunci),
  );

  const quotationTerpilih = quotationIdTerpilih
    ? data.quotation.find((q) => q.id === quotationIdTerpilih) ?? null
    : null;

  if (quotationTerpilih) {
    return (
      <DetailQuotation
        data={data}
        user={user}
        actions={actions}
        quotation={quotationTerpilih}
        onKembali={() => setQuotationIdTerpilih(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <JudulBagian>Quotation</JudulBagian>
        {bolehAksi(user.peran, 'kelolaQuotation') && (
          <TombolUtama onClick={() => setTampilForm(true)}>
            + Buat Quotation
          </TombolUtama>
        )}
      </div>

      {tampilForm && (
        <FormQuotation
          data={data}
          actions={actions}
          onBatal={() => setTampilForm(false)}
          onSukses={() => setTampilForm(false)}
        />
      )}

      {quotationTersaring.length === 0 ? (
        <PesanKosong teks="Belum ada quotation yang cocok." />
      ) : (
        <Kartu className="overflow-x-auto p-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#2573e2]/5">
                <th className={th}>ID</th>
                <th className={th}>Prospek</th>
                <th className={th}>Tanggal Buat</th>
                <th className={th}>Berlaku Sampai</th>
                <th className={th}>Status</th>
                <th className={th}>Nilai</th>
              </tr>
            </thead>
            <tbody>
              {quotationTersaring.map((q) => (
                <tr
                  key={q.id}
                  className={barisKlik}
                  onClick={() => setQuotationIdTerpilih(q.id)}
                >
                  <td className={`${td} font-semibold`}>{q.id}</td>
                  <td className={td}>{namaProspek(data, q.prospectId)}</td>
                  <td className={td}>{formatTanggal(q.tanggalBuat)}</td>
                  <td className={td}>{formatTanggal(q.berlakuSampai)}</td>
                  <td className={td}>
                    <StatusBadge status={q.status} />
                  </td>
                  <td className={td}>{formatRupiah(q.nilai)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Kartu>
      )}
    </div>
  );
}

function DetailQuotation({
  data,
  user,
  actions,
  quotation,
  onKembali,
}: {
  data: ModulProps['data'];
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  quotation: QuotationItem;
  onKembali: () => void;
}) {
  const bolehUbah = bolehAksi(user.peran, 'kelolaQuotation');
  const bolehOrder = bolehAksi(user.peran, 'kelolaOrder');
  const [pesan, setPesan] = useState('');
  const orderTerkait = data.order.find((o) => o.quotationId === quotation.id);

  const ubahStatus = (status: StatusQuotation) => {
    const hasil = actions.ubahStatusQuotation(quotation, status);
    if (hasil !== null) {
      setPesan(hasil);
      return;
    }
    setPesan(`Status quotation diubah menjadi ${status}.`);
  };

  const buatOrder = () => {
    const hasil = actions.tambahOrder({ quotationId: quotation.id });
    if (hasil !== null) {
      setPesan(hasil);
      return;
    }
    setPesan('Order berhasil dibuat dari quotation ini. Lihat tab Order.');
  };

  return (
    <div className="space-y-4">
      <TombolSekunder onClick={onKembali}>&larr; Kembali ke daftar</TombolSekunder>
      <JudulBagian>
        {quotation.id} — {namaProspek(data, quotation.prospectId)}
      </JudulBagian>

      <Kartu>
        <dl className="grid gap-2 text-sm md:grid-cols-2">
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Prospek</dt>
            <dd className="text-right font-semibold text-[#0d2569]">
              {namaProspek(data, quotation.prospectId)} ({quotation.prospectId})
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Status</dt>
            <dd>
              <StatusBadge status={quotation.status} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Tanggal buat</dt>
            <dd className="text-[#0d2569]">{formatTanggal(quotation.tanggalBuat)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Berlaku sampai</dt>
            <dd className="text-[#0d2569]">{formatTanggal(quotation.berlakuSampai)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Nilai penawaran</dt>
            <dd className="font-semibold text-[#0d2569]">
              {formatRupiah(quotation.nilai)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Satker</dt>
            <dd className="text-[#0d2569]">
              {quotation.satker.nama} ({quotation.satker.kode})
            </dd>
          </div>
          {quotation.catatan && (
            <div className="flex justify-between gap-4 md:col-span-2">
              <dt className="text-[#0d2569]/60">Catatan</dt>
              <dd className="text-right text-[#0d2569]">{quotation.catatan}</dd>
            </div>
          )}
        </dl>
      </Kartu>

      <Kartu>
        <JudulBagian>Layanan (Snapshot Tarif)</JudulBagian>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#2573e2]/5">
                <th className={th}>Kategori</th>
                <th className={th}>Kode Akun</th>
                <th className={th}>Jenis PNBP</th>
                <th className={th}>Satuan</th>
                <th className={th}>Tarif</th>
                <th className={th}>Jumlah</th>
                <th className={th}>Subtotal</th>
                <th className={th}>Programa</th>
              </tr>
            </thead>
            <tbody>
              {quotation.layanan.map((l) => (
                <tr key={l.id} className="border-t border-[#2573e2]/10">
                  <td className={td}>{l.kategori}</td>
                  <td className={td}>{l.kodeAkun}</td>
                  <td className={td}>{l.jenisPnBP}</td>
                  <td className={td}>{l.satuan}</td>
                  <td className={td}>{formatRupiah(l.tarif)}</td>
                  <td className={td}>{l.jumlah}</td>
                  <td className={td}>{formatRupiah(l.subtotal)}</td>
                  <td className={td}>{l.programa ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-[#0d2569]/70">
          Tarif di atas adalah snapshot saat quotation dibuat dan tidak berubah
          bila master berubah.
        </p>
      </Kartu>

      {bolehUbah && statusQuotationBerikutnya(quotation.status).length > 0 && (
        <Kartu>
          <JudulBagian>Ubah Status</JudulBagian>
          <div className="mt-3 flex flex-wrap gap-2">
            {statusQuotationBerikutnya(quotation.status).map((s) => (
              <TombolSekunder key={s} onClick={() => ubahStatus(s)}>
                {s === 'Dikirim'
                  ? 'Kirim Quotation'
                  : s === 'Disetujui'
                    ? 'Setujui'
                    : 'Tolak'}
              </TombolSekunder>
            ))}
          </div>
        </Kartu>
      )}

      {quotation.status === 'Disetujui' && (
        <Kartu>
          <JudulBagian>Order</JudulBagian>
          {orderTerkait ? (
            <p className="mt-1 text-sm text-[#0d2569]">
              Order sudah dibuat dari quotation ini: {orderTerkait.id} (status{' '}
              {orderTerkait.status}).
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-[#0d2569]/70">
                Quotation disetujui — order dapat dibuat dari quotation ini.
              </p>
              {bolehOrder && (
                <div className="mt-3">
                  <TombolUtama onClick={buatOrder}>Buat Order</TombolUtama>
                </div>
              )}
            </>
          )}
        </Kartu>
      )}

      {pesan !== '' && (
        <p className="rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {pesan}
        </p>
      )}
    </div>
  );
}

interface BarisQuotationForm {
  kategori: string;
  satuan: string;
  tarif: string;
  jumlah: string;
  programa: string;
}

const BARIS_QUOTATION_AWAL: BarisQuotationForm = {
  kategori: MASTER_KATEGORI_LAYANAN[0].nama,
  satuan: '',
  tarif: '',
  jumlah: '1',
  programa: '',
};

function FormQuotation({
  data,
  actions,
  onBatal,
  onSukses,
}: {
  data: ModulProps['data'];
  actions: ModulProps['actions'];
  onBatal: () => void;
  onSukses: () => void;
}) {
  // Hanya prospek yang tahapnya bukan Menang/Kalah.
  const prospekLayak = data.prospect.filter(
    (p) => p.tahap !== 'Menang' && p.tahap !== 'Kalah',
  );
  const [prospectId, setProspectId] = useState(prospekLayak[0]?.id ?? '');
  const [berlakuSampai, setBerlakuSampai] = useState('');
  const [catatan, setCatatan] = useState('');
  const [baris, setBaris] = useState<BarisQuotationForm[]>([
    { ...BARIS_QUOTATION_AWAL },
  ]);
  const [error, setError] = useState('');

  const ubahBaris = (
    idx: number,
    field: keyof BarisQuotationForm,
    nilai: string,
  ) =>
    setBaris((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, [field]: nilai } : r)),
    );

  const simpan = () => {
    if (prospectId === '') {
      setError('Prospek wajib dipilih.');
      return;
    }
    if (berlakuSampai === '') {
      setError('Tanggal berlaku sampai wajib diisi.');
      return;
    }
    if (baris.length === 0) {
      setError('Minimal satu baris layanan wajib diisi.');
      return;
    }
    for (let i = 0; i < baris.length; i += 1) {
      if (baris[i].satuan.trim() === '') {
        setError(`Satuan pada baris layanan ${i + 1} wajib diisi.`);
        return;
      }
      if (!(Number(baris[i].tarif) > 0)) {
        setError(`Tarif pada baris layanan ${i + 1} harus lebih dari 0.`);
        return;
      }
      if (!(Number(baris[i].jumlah) > 0)) {
        setError(`Jumlah pada baris layanan ${i + 1} harus lebih dari 0.`);
        return;
      }
    }
    const layanan: QuotationLayananInput[] = baris.map((b) => ({
      kategori: b.kategori,
      satuan: b.satuan.trim(),
      tarif: Number(b.tarif),
      jumlah: Number(b.jumlah),
      ...(b.programa === '' ? {} : { programa: b.programa }),
    }));
    const input: QuotationInput = {
      prospectId,
      berlakuSampai,
      catatan: catatan.trim() === '' ? undefined : catatan.trim(),
      layanan,
    };
    const hasil = actions.tambahQuotation(input);
    if (hasil !== null) {
      setError(hasil);
      return;
    }
    onSukses();
  };

  if (prospekLayak.length === 0) {
    return (
      <Kartu>
        <PesanKosong teks="Belum ada prospek yang dapat dibuatkan quotation (semua prospek sudah Menang atau Kalah)." />
        <div className="mt-3">
          <TombolSekunder onClick={onBatal}>Tutup</TombolSekunder>
        </div>
      </Kartu>
    );
  }

  return (
    <Kartu>
      <JudulBagian>Buat Quotation</JudulBagian>
      <Peringatan teks="Tarif diisi operator per baris layanan dan dibekukan sebagai snapshot saat quotation dibuat — tarif tidak berubah bila master berubah (pola yang sama dengan tarif layanan pada form kontrak Fase A)." />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Prospek *</Label>
          <select
            className={inputClass}
            value={prospectId}
            onChange={(e) => setProspectId(e.target.value)}
          >
            {prospekLayak.map((p) => (
              <option key={p.id} value={p.id}>
                {p.namaInstansi} ({p.tahap})
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Berlaku sampai *</Label>
          <input
            className={inputClass}
            type="date"
            value={berlakuSampai}
            onChange={(e) => setBerlakuSampai(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <Label>Catatan</Label>
          <input
            className={inputClass}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Catatan quotation (opsional)"
          />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <JudulBagian>Layanan</JudulBagian>
        {baris.map((b, idx) => {
          const master = MASTER_KATEGORI_LAYANAN.find((k) => k.nama === b.kategori);
          return (
            <div
              key={idx}
              className="grid gap-3 rounded-md border border-[#2573e2]/20 p-3 md:grid-cols-5"
            >
              <div>
                <Label>Kategori *</Label>
                <select
                  className={inputClass}
                  value={b.kategori}
                  onChange={(e) => ubahBaris(idx, 'kategori', e.target.value)}
                >
                  {MASTER_KATEGORI_LAYANAN.map((k) => (
                    <option key={k.nama} value={k.nama}>
                      {k.nama}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-[#0d2569]/60">
                  Kode akun {master?.kodeAkun ?? '-'} — {master?.jenisPnBP ?? '-'}
                </p>
              </div>
              <div>
                <Label>Satuan *</Label>
                <input
                  className={inputClass}
                  value={b.satuan}
                  onChange={(e) => ubahBaris(idx, 'satuan', e.target.value)}
                  placeholder="cth: Termin / Paket / Bulan"
                />
              </div>
              <div>
                <Label>Tarif (Rp) *</Label>
                <input
                  className={inputClass}
                  type="number"
                  min="1"
                  value={b.tarif}
                  onChange={(e) => ubahBaris(idx, 'tarif', e.target.value)}
                  placeholder="cth: 3000000"
                />
              </div>
              <div>
                <Label>Jumlah *</Label>
                <input
                  className={inputClass}
                  type="number"
                  min="1"
                  value={b.jumlah}
                  onChange={(e) => ubahBaris(idx, 'jumlah', e.target.value)}
                />
              </div>
              <div>
                <Label>Programa</Label>
                <select
                  className={inputClass}
                  value={b.programa}
                  onChange={(e) => ubahBaris(idx, 'programa', e.target.value)}
                >
                  <option value="">— Tanpa programa —</option>
                  {MASTER_PROGRAMA.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-[#0d2569]/60 md:col-span-5">
                Subtotal baris {idx + 1}:{' '}
                {Number(b.tarif) > 0 && Number(b.jumlah) > 0
                  ? formatRupiah(Number(b.tarif) * Number(b.jumlah))
                  : '—'}
                . Tarif dibekukan sebagai snapshot saat quotation disimpan.
              </p>
              {baris.length > 1 && (
                <div className="md:col-span-5">
                  <TombolSekunder
                    onClick={() =>
                      setBaris((rows) => rows.filter((_, i) => i !== idx))
                    }
                  >
                    Hapus baris
                  </TombolSekunder>
                </div>
              )}
            </div>
          );
        })}
        <TombolSekunder
          onClick={() => setBaris((rows) => [...rows, { ...BARIS_QUOTATION_AWAL }])}
        >
          + Tambah Baris Layanan
        </TombolSekunder>
        <p className="mt-3 text-sm font-semibold text-[#0d2569]">
          Nilai penawaran (Σ subtotal):{' '}
          {formatRupiah(
            baris.reduce(
              (s, b) =>
                s +
                (Number(b.tarif) > 0 && Number(b.jumlah) > 0
                  ? Number(b.tarif) * Number(b.jumlah)
                  : 0),
              0,
            ),
          )}
        </p>
      </div>

      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Simpan Quotation</TombolUtama>
        <TombolSekunder onClick={onBatal}>Batal</TombolSekunder>
      </div>
    </Kartu>
  );
}

// ---------------------------------------------------------------------------
// ORDER (US-S3)
// ---------------------------------------------------------------------------

function statusOrderBerikutnya(status: StatusOrder): StatusOrder[] {
  switch (status) {
    case 'Draft':
      return ['Diproses', 'Dibatalkan'];
    case 'Diproses':
      return ['Selesai', 'Dibatalkan'];
    default:
      return [];
  }
}

function TabOrder({ data, user, actions, cari }: ModulProps) {
  const [orderIdTerpilih, setOrderIdTerpilih] = useState<string | null>(null);
  const [tampilForm, setTampilForm] = useState(false);

  const kataKunci = cari.trim().toLowerCase();
  const orderTersaring = data.order.filter(
    (o) =>
      kataKunci === '' ||
      `${o.id} ${o.quotationId} ${namaProspek(data, o.prospectId)} ${o.status}`
        .toLowerCase()
        .includes(kataKunci),
  );

  const orderTerpilih = orderIdTerpilih
    ? data.order.find((o) => o.id === orderIdTerpilih) ?? null
    : null;

  if (orderTerpilih) {
    return (
      <DetailOrder
        data={data}
        user={user}
        actions={actions}
        order={orderTerpilih}
        onKembali={() => setOrderIdTerpilih(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <JudulBagian>Order</JudulBagian>
        {bolehAksi(user.peran, 'kelolaOrder') && (
          <TombolUtama onClick={() => setTampilForm(true)}>
            + Buat Order
          </TombolUtama>
        )}
      </div>

      {tampilForm && (
        <FormOrder
          data={data}
          actions={actions}
          onBatal={() => setTampilForm(false)}
          onSukses={() => setTampilForm(false)}
        />
      )}

      {orderTersaring.length === 0 ? (
        <PesanKosong teks="Belum ada order yang cocok." />
      ) : (
        <Kartu className="overflow-x-auto p-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#2573e2]/5">
                <th className={th}>ID</th>
                <th className={th}>Quotation</th>
                <th className={th}>Prospek</th>
                <th className={th}>Tanggal Order</th>
                <th className={th}>Status</th>
                <th className={th}>Nilai</th>
                <th className={th}>Kontrak</th>
              </tr>
            </thead>
            <tbody>
              {orderTersaring.map((o) => {
                const kontrak = o.kontrakId
                  ? data.kontrak.find((k) => k.id === o.kontrakId)
                  : null;
                return (
                  <tr
                    key={o.id}
                    className={barisKlik}
                    onClick={() => setOrderIdTerpilih(o.id)}
                  >
                    <td className={`${td} font-semibold`}>{o.id}</td>
                    <td className={td}>{o.quotationId}</td>
                    <td className={td}>{namaProspek(data, o.prospectId)}</td>
                    <td className={td}>{formatTanggal(o.tanggalOrder)}</td>
                    <td className={td}>
                      <StatusBadge status={o.status} />
                    </td>
                    <td className={td}>{formatRupiah(o.nilai)}</td>
                    <td className={td}>{kontrak ? kontrak.nomorPks : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Kartu>
      )}
    </div>
  );
}

function DetailOrder({
  data,
  user,
  actions,
  order,
  onKembali,
}: {
  data: ModulProps['data'];
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  order: OrderItem;
  onKembali: () => void;
}) {
  const bolehUbah = bolehAksi(user.peran, 'kelolaOrder');
  const [pesan, setPesan] = useState('');
  const kontrak = order.kontrakId
    ? data.kontrak.find((k) => k.id === order.kontrakId) ?? null
    : null;
  const quotation = data.quotation.find((q) => q.id === order.quotationId);

  const ubahStatus = (status: StatusOrder) => {
    const hasil = actions.ubahStatusOrder(order, status);
    if (hasil !== null) {
      setPesan(hasil);
      return;
    }
    setPesan(`Status order diubah menjadi ${status}.`);
  };

  const konversi = () => {
    const hasil = actions.konversiOrder(order);
    if (hasil !== null) {
      setPesan(hasil);
      return;
    }
    const terbaru = data.order.find((o) => o.id === order.id);
    const kontrakBaru = terbaru?.kontrakId
      ? data.kontrak.find((k) => k.id === terbaru.kontrakId)
      : null;
    setPesan(
      kontrakBaru
        ? `Order berhasil dikonversi menjadi kontrak ${kontrakBaru.nomorPks}.`
        : 'Order berhasil dikonversi menjadi kontrak.',
    );
  };

  return (
    <div className="space-y-4">
      <TombolSekunder onClick={onKembali}>&larr; Kembali ke daftar</TombolSekunder>
      <JudulBagian>
        {order.id} — {namaProspek(data, order.prospectId)}
      </JudulBagian>

      <Kartu>
        <dl className="grid gap-2 text-sm md:grid-cols-2">
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Quotation</dt>
            <dd className="font-semibold text-[#0d2569]">
              {order.quotationId}
              {quotation ? ` (${quotation.status})` : ''}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Prospek</dt>
            <dd className="text-right text-[#0d2569]">
              {namaProspek(data, order.prospectId)} ({order.prospectId})
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Tanggal order</dt>
            <dd className="text-[#0d2569]">{formatTanggal(order.tanggalOrder)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Status</dt>
            <dd>
              <StatusBadge status={order.status} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Nilai</dt>
            <dd className="font-semibold text-[#0d2569]">
              {formatRupiah(order.nilai)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Satker</dt>
            <dd className="text-[#0d2569]">
              {order.satker.nama} ({order.satker.kode})
            </dd>
          </div>
          {order.catatan && (
            <div className="flex justify-between gap-4 md:col-span-2">
              <dt className="text-[#0d2569]/60">Catatan</dt>
              <dd className="text-right text-[#0d2569]">{order.catatan}</dd>
            </div>
          )}
          {kontrak && (
            <div className="flex justify-between gap-4 md:col-span-2">
              <dt className="text-[#0d2569]/60">Kontrak hasil konversi</dt>
              <dd className="text-right font-semibold text-[#0d2569]">
                {kontrak.nomorPks} ({kontrak.status})
              </dd>
            </div>
          )}
        </dl>
      </Kartu>

      {bolehUbah && statusOrderBerikutnya(order.status).length > 0 && (
        <Kartu>
          <JudulBagian>Ubah Status</JudulBagian>
          <div className="mt-3 flex flex-wrap gap-2">
            {statusOrderBerikutnya(order.status).map((s) => (
              <TombolSekunder key={s} onClick={() => ubahStatus(s)}>
                {s === 'Diproses'
                  ? 'Proses Order'
                  : s === 'Selesai'
                    ? 'Tandai Selesai'
                    : 'Batalkan'}
              </TombolSekunder>
            ))}
          </div>
        </Kartu>
      )}

      {order.status === 'Selesai' && !order.kontrakId && (
        <Kartu>
          <JudulBagian>Konversi menjadi Kontrak</JudulBagian>
          <p className="mt-1 text-sm text-[#0d2569]/70">
            Order yang selesai dapat dikonversi menjadi kontrak (PKS). Prospek
            terkait menjadi Menang.
          </p>
          {bolehUbah && (
            <div className="mt-3">
              <TombolUtama onClick={konversi}>
                Konversi menjadi Kontrak
              </TombolUtama>
            </div>
          )}
        </Kartu>
      )}

      {pesan !== '' && (
        <p className="rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {pesan}
        </p>
      )}
    </div>
  );
}

function FormOrder({
  data,
  actions,
  onBatal,
  onSukses,
}: {
  data: ModulProps['data'];
  actions: ModulProps['actions'];
  onBatal: () => void;
  onSukses: () => void;
}) {
  const quotationDisetujui = data.quotation.filter(
    (q) => q.status === 'Disetujui',
  );
  const [quotationId, setQuotationId] = useState(
    quotationDisetujui[0]?.id ?? '',
  );
  const [catatan, setCatatan] = useState('');
  const [error, setError] = useState('');

  if (quotationDisetujui.length === 0) {
    return (
      <Kartu>
        <PesanKosong teks="Belum ada quotation yang disetujui. Order hanya dapat dibuat dari quotation berstatus Disetujui." />
        <div className="mt-3">
          <TombolSekunder onClick={onBatal}>Tutup</TombolSekunder>
        </div>
      </Kartu>
    );
  }

  const simpan = () => {
    if (quotationId === '') {
      setError('Quotation wajib dipilih.');
      return;
    }
    const hasil = actions.tambahOrder({
      quotationId,
      catatan: catatan.trim() === '' ? undefined : catatan.trim(),
    });
    if (hasil !== null) {
      setError(hasil);
      return;
    }
    onSukses();
  };

  return (
    <Kartu>
      <JudulBagian>Buat Order</JudulBagian>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Quotation (Disetujui) *</Label>
          <select
            className={inputClass}
            value={quotationId}
            onChange={(e) => setQuotationId(e.target.value)}
          >
            {quotationDisetujui.map((q) => (
              <option key={q.id} value={q.id}>
                {q.id} — {namaProspek(data, q.prospectId)} —{' '}
                {formatRupiah(q.nilai)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Catatan</Label>
          <input
            className={inputClass}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Catatan order (opsional)"
          />
        </div>
      </div>

      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Simpan Order</TombolUtama>
        <TombolSekunder onClick={onBatal}>Batal</TombolSekunder>
      </div>
    </Kartu>
  );
}

// ---------------------------------------------------------------------------
// MEETING
// ---------------------------------------------------------------------------

function TabMeeting({ data, user, actions, cari }: ModulProps) {
  const [filterWaktu, setFilterWaktu] = useState<'mendatang' | 'semua'>(
    'mendatang',
  );
  const [tampilForm, setTampilForm] = useState(false);
  const hariIni = hariIniIso();

  const kataKunci = cari.trim().toLowerCase();
  const meetingTersaring = data.meeting
    .filter(
      (m) =>
        (filterWaktu === 'semua' || m.tanggal >= hariIni) &&
        (kataKunci === '' ||
          `${m.id} ${m.agenda} ${m.peserta} ${m.hasil ?? ''}`
            .toLowerCase()
            .includes(kataKunci)),
    )
    .slice()
    .sort((a, b) =>
      a.tanggal === b.tanggal
        ? a.jam.localeCompare(b.jam)
        : a.tanggal.localeCompare(b.tanggal),
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <JudulBagian>Meeting</JudulBagian>
        {bolehAksi(user.peran, 'kelolaMeeting') && (
          <TombolUtama onClick={() => setTampilForm(true)}>
            + Tambah Meeting
          </TombolUtama>
        )}
      </div>

      <div>
        <Label>Filter waktu</Label>
        <select
          className={`${inputClass} max-w-xs`}
          value={filterWaktu}
          onChange={(e) =>
            setFilterWaktu(e.target.value as 'mendatang' | 'semua')
          }
        >
          <option value="mendatang">Mendatang</option>
          <option value="semua">Semua</option>
        </select>
      </div>

      {tampilForm && (
        <FormMeeting
          data={data}
          actions={actions}
          onBatal={() => setTampilForm(false)}
          onSukses={() => setTampilForm(false)}
        />
      )}

      {meetingTersaring.length === 0 ? (
        <PesanKosong teks="Belum ada meeting yang cocok." />
      ) : (
        <Kartu className="overflow-x-auto p-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#2573e2]/5">
                <th className={th}>Tanggal</th>
                <th className={th}>Jam</th>
                <th className={th}>Prospek / Klien</th>
                <th className={th}>Peserta</th>
                <th className={th}>Agenda</th>
                <th className={th}>Hasil</th>
              </tr>
            </thead>
            <tbody>
              {meetingTersaring.map((m) => {
                const prospek = m.prospectId
                  ? data.prospect.find((p) => p.id === m.prospectId)
                  : null;
                const klien = m.klienId
                  ? data.klien.find((k) => k.id === m.klienId)
                  : null;
                const pihak = [prospek?.namaInstansi, klien?.nama]
                  .filter(Boolean)
                  .join(' — ');
                return (
                  <tr key={m.id} className="border-t border-[#2573e2]/10">
                    <td className={td}>{formatTanggal(m.tanggal)}</td>
                    <td className={td}>{m.jam}</td>
                    <td className={td}>{pihak === '' ? '-' : pihak}</td>
                    <td className={td}>{m.peserta}</td>
                    <td className={td}>{m.agenda}</td>
                    <td className={td}>{m.hasil ?? '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Kartu>
      )}
    </div>
  );
}

function FormMeeting({
  data,
  actions,
  onBatal,
  onSukses,
}: {
  data: ModulProps['data'];
  actions: ModulProps['actions'];
  onBatal: () => void;
  onSukses: () => void;
}) {
  const [form, setForm] = useState<MeetingInput>({
    tanggal: hariIniIso(),
    jam: '09:00',
    prospectId: '',
    klienId: '',
    peserta: '',
    agenda: '',
    hasil: '',
  });
  const [error, setError] = useState('');

  const ubah = (field: keyof MeetingInput, nilai: string) =>
    setForm((f) => ({ ...f, [field]: nilai }));

  const simpan = () => {
    if (form.tanggal === '') {
      setError('Tanggal meeting wajib diisi.');
      return;
    }
    if (form.jam === '') {
      setError('Jam meeting wajib diisi.');
      return;
    }
    if (
      (form.prospectId === '' || form.prospectId === undefined) &&
      (form.klienId === '' || form.klienId === undefined)
    ) {
      setError('Pilih salah satu: prospek atau klien.');
      return;
    }
    if (form.peserta.trim() === '') {
      setError('Peserta wajib diisi.');
      return;
    }
    if (form.agenda.trim() === '') {
      setError('Agenda wajib diisi.');
      return;
    }
    const hasil = actions.tambahMeeting({
      tanggal: form.tanggal,
      jam: form.jam,
      prospectId:
        form.prospectId === '' ? undefined : form.prospectId,
      klienId: form.klienId === '' ? undefined : form.klienId,
      peserta: form.peserta.trim(),
      agenda: form.agenda.trim(),
      hasil: form.hasil?.trim() === '' ? undefined : form.hasil?.trim(),
    });
    if (hasil !== null) {
      setError(hasil);
      return;
    }
    onSukses();
  };

  return (
    <Kartu>
      <JudulBagian>Tambah Meeting</JudulBagian>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Tanggal *</Label>
          <input
            className={inputClass}
            type="date"
            value={form.tanggal}
            onChange={(e) => ubah('tanggal', e.target.value)}
          />
        </div>
        <div>
          <Label>Jam *</Label>
          <input
            className={inputClass}
            type="time"
            value={form.jam}
            onChange={(e) => ubah('jam', e.target.value)}
          />
        </div>
        <div>
          <Label>Prospek (pilih salah satu) *</Label>
          <select
            className={inputClass}
            value={form.prospectId ?? ''}
            onChange={(e) => ubah('prospectId', e.target.value)}
          >
            <option value="">— Tanpa prospek —</option>
            {data.prospect.map((p) => (
              <option key={p.id} value={p.id}>
                {p.namaInstansi}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Klien (pilih salah satu) *</Label>
          <select
            className={inputClass}
            value={form.klienId ?? ''}
            onChange={(e) => ubah('klienId', e.target.value)}
          >
            <option value="">— Tanpa klien —</option>
            {data.klien.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <Label>Peserta *</Label>
          <input
            className={inputClass}
            value={form.peserta}
            onChange={(e) => ubah('peserta', e.target.value)}
            placeholder="Nama peserta meeting"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Agenda *</Label>
          <textarea
            className={`${inputClass} min-h-20`}
            value={form.agenda}
            onChange={(e) => ubah('agenda', e.target.value)}
            placeholder="Agenda meeting"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Hasil</Label>
          <input
            className={inputClass}
            value={form.hasil ?? ''}
            onChange={(e) => ubah('hasil', e.target.value)}
            placeholder="Hasil meeting (opsional)"
          />
        </div>
      </div>

      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Simpan Meeting</TombolUtama>
        <TombolSekunder onClick={onBatal}>Batal</TombolSekunder>
      </div>
    </Kartu>
  );
}

// ---------------------------------------------------------------------------
// ANALYTICS — semua angka dari hitungAnalitikSales(data), tanpa hitung ulang.
// ---------------------------------------------------------------------------

function TabAnalytics({ data }: { data: ModulProps['data'] }) {
  const a = hitungAnalitikSales(data);
  const totalProspekAktif = a.prospectPerTahap.reduce(
    (s, r) => s + r.jumlah,
    0,
  );
  const konversi: { label: string; nilai: number }[] = [
    { label: 'Prospek → Quotation', nilai: a.konversiProspectKeQuotation },
    { label: 'Quotation → Order', nilai: a.konversiQuotationKeOrder },
    { label: 'Order → Kontrak', nilai: a.konversiOrderKeKontrak },
    { label: 'Prospek → Kontrak', nilai: a.konversiProspectKeKontrak },
  ];

  return (
    <div className="space-y-4">
      <JudulBagian>Analytics</JudulBagian>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Jumlah Prospek" nilai={String(a.jumlahProspect)} />
        <StatCard
          label="Nilai Pipeline"
          nilai={formatRupiah(a.nilaiPipeline)}
          keterangan={`${totalProspekAktif} prospek pada tahap aktif`}
        />
        <StatCard
          label="Jumlah Quotation"
          nilai={String(a.jumlahQuotation)}
          keterangan={`${a.jumlahQuotationDisetujui} disetujui`}
        />
        <StatCard
          label="Jumlah Order"
          nilai={String(a.jumlahOrder)}
          keterangan={`${a.jumlahOrderSelesai} selesai`}
        />
        <StatCard
          label="Kontrak dari Prospek"
          nilai={String(a.jumlahKontrakDariProspect)}
        />
      </div>

      <Kartu>
        <JudulBagian>Prospek per Tahap (Aktif)</JudulBagian>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#2573e2]/5">
                <th className={th}>Tahap</th>
                <th className={th}>Jumlah Prospek</th>
                <th className={th}>Nilai</th>
              </tr>
            </thead>
            <tbody>
              {a.prospectPerTahap.map((r) => (
                <tr key={r.tahap} className="border-t border-[#2573e2]/10">
                  <td className={td}>{r.tahap}</td>
                  <td className={td}>{r.jumlah}</td>
                  <td className={td}>{formatRupiah(r.nilai)}</td>
                </tr>
              ))}
              <tr className="border-t border-[#2573e2]/20 bg-[#2573e2]/5">
                <td className={`${td} font-bold`}>Total (tahap aktif)</td>
                <td className={`${td} font-bold`}>{totalProspekAktif}</td>
                <td className={`${td} font-bold`}>
                  {formatRupiah(a.nilaiPipeline)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Kartu>

      <Kartu>
        <JudulBagian>Tingkat Konversi</JudulBagian>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {konversi.map((k) => (
            <StatCard key={k.label} label={k.label} nilai={`${k.nilai}%`} />
          ))}
        </div>
      </Kartu>
    </div>
  );
}

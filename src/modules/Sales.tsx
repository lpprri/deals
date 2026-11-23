// Modul Sales — Fase B (PRD v2.0 Final Bab 7.3 & 9.5; US-S1, US-S2, US-S3).
// Palet HANYA 3 warna RRI: Biru #2573E2, Navy #0D2569, Putih #FFFFFF.
// Status dibedakan teks & ikon (StatusBadge), bukan warna baru.
// Semua angka Analytics berasal dari hitungAnalitikSales(data).

import { useState } from 'react';
import type {
  Meeting as MeetingItem,
  Order as OrderItem,
  PermintaanLayanan as PermintaanLayananItem,
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
  OPERATOR_PALEMBANG,
} from '../lib/master';
import { hitungAnalitikSales } from '../lib/derive';
import { formatRupiah, formatTanggal, hariIniIso } from '../lib/format';
import { labelOpsiTally } from '../lib/petaOpsiTally';
import {
  hubungkanGoogleCalendar,
  perbaruiEventKalender,
  pesanGalatGoogle,
  sinkronkanEventKalender,
  type KoneksiKalender,
} from '../lib/googleCalendar';
import { bolehAksi } from '../lib/permissions';
import {
  labelJenisPnBP,
  labelKategoriLayanan,
  labelStatusKontrak,
  labelStatusOrder,
  labelStatusPermintaan,
  labelStatusPersetujuan,
  labelSumberProspek,
  labelTahapPengajuan,
  labelTahapPipeline,
} from '../lib/labels';
import {
  Baris,
  ItemDaftar,
  JudulBagian,
  Kartu,
  Label,
  PesanKosong,
  Peringatan,
  StatCard,
  StatusBadge,
  TabBar,
  Tabel,
  Td,
  Th,
  TombolSekunder,
  TombolUtama,
  inputClass,
} from '../components/ui';

const TABS = [
  { id: 'pipeline', label: 'Alur penawaran' },
  { id: 'quotation', label: 'Penawaran' },
  // Tab 'meeting' DIHAPUS 15/11/2026 atas instruksi pengguna — komponen
  // TabMeeting tetap ada di bawah, dipakai ulang menu Meeting.
];

export default function Sales(props: ModulProps) {
  const [tab, setTab] = useState('pipeline');
  return (
    <div className="space-y-4">
      <JudulBagian>Penjualan</JudulBagian>
      <TabBar tabs={TABS} aktif={tab} onPilih={setTab} />
      {tab === 'pipeline' && <TabPipeline {...props} />}
      {tab === 'quotation' && <TabQuotation {...props} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PROSPEK (US-S1)
// ---------------------------------------------------------------------------

export function TabProspek({ data, user, actions, cari }: ModulProps) {
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
            + Tambah prospek
          </TombolUtama>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <Label>Filter berdasarkan tahap</Label>
          <select
            className={`${inputClass} max-w-xs`}
            value={filterTahap}
            onChange={(e) => setFilterTahap(e.target.value)}
          >
            <option value="Semua">Semua</option>
            {MASTER_TAHAP_PIPELINE.map((t) => (
              <option key={t} value={t}>
                {labelTahapPipeline(t)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Filter berdasarkan sumber</Label>
          <select
            className={`${inputClass} max-w-xs`}
            value={filterSumber}
            onChange={(e) => setFilterSumber(e.target.value)}
          >
            <option value="Semua">Semua</option>
            {MASTER_SUMBER_PROSPEK.map((s) => (
              <option key={s} value={s}>
                {labelSumberProspek(s)}
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
        <Kartu>
          <Tabel>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Nama instansi</Th>
                <Th>Kontak</Th>
                <Th>Sumber</Th>
                <Th>Layanan yang diminati</Th>
                <Th>Tahap</Th>
                <Th>Penanggung jawab</Th>
                <Th>Tanggal tindak lanjut</Th>
                <Th kanan>Nilai perkiraan</Th>
              </tr>
            </thead>
            <tbody>
              {prospekTersaring.map((p) => (
                <Baris key={p.id} onClick={() => setProspekIdTerpilih(p.id)}>
                  <Td tebal>{p.id}</Td>
                  <Td>{p.namaInstansi}</Td>
                  <Td>
                    {p.kontakNama}
                    <br />
                    <span className="text-xs text-[#0d2569]/60">{p.telepon}</span>
                  </Td>
                  <Td>{labelSumberProspek(p.sumber)}</Td>
                  <Td>{labelKategoriLayanan(p.layananDiminati)}</Td>
                  <Td>
                    <StatusBadge status={labelTahapPipeline(p.tahap)} />
                  </Td>
                  <Td>{p.penanggungJawab}</Td>
                  <Td>{formatTanggal(p.tanggalTindakLanjut)}</Td>
                  <Td kanan>{formatRupiah(p.nilaiPerkiraan)}</Td>
                </Baris>
              ))}
            </tbody>
          </Tabel>
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
      setPesan('Catatan tindak lanjut wajib diisi untuk mengubah tahap.');
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
    setPesan(`Tahap prospek diubah ke ${labelTahapPipeline(tahapTarget)}.`);
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
    setPesan('Tindak lanjut tercatat.');
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
            <dd className="text-[#0d2569]">{labelSumberProspek(prospect.sumber)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Layanan yang diminati</dt>
            <dd className="text-right text-[#0d2569]">{labelKategoriLayanan(prospect.layananDiminati)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Tahap</dt>
            <dd>
              <StatusBadge status={labelTahapPipeline(prospect.tahap)} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Penanggung jawab</dt>
            <dd className="text-[#0d2569]">{prospect.penanggungJawab}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Tanggal tindak lanjut</dt>
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
                {pengajuan.id} — tahap {labelTahapPengajuan(pengajuan.tahap)}
              </dd>
            </div>
          )}
          {kontrak && (
            <div className="flex justify-between gap-4 md:col-span-2">
              <dt className="text-[#0d2569]/60">Kontrak hasil konversi</dt>
              <dd className="text-right font-semibold text-[#0d2569]">
                {kontrak.nomorPks} ({labelStatusKontrak(kontrak.status)})
              </dd>
            </div>
          )}
        </dl>
      </Kartu>

      <Kartu>
        <JudulBagian>Riwayat tindak lanjut</JudulBagian>
        {prospect.riwayat.length === 0 ? (
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Belum ada tindak lanjut yang tercatat.
          </p>
        ) : (
          <ul className="mt-3 text-sm">
            {prospect.riwayat.map((r, i) => (
              <ItemDaftar key={`${r.tanggal}-${i}`}>
                <p className="font-semibold text-[#0d2569]">
                  {formatTanggal(r.tanggal)} — {r.oleh}
                </p>
                <p className="text-[#0d2569]/80">{r.catatan}</p>
              </ItemDaftar>
            ))}
          </ul>
        )}
      </Kartu>

      {bolehUbah && (
        <Kartu>
          <JudulBagian>Ubah tahap</JudulBagian>
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
                      {labelTahapPipeline(t)}
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
                placeholder="Alasan / catatan perubahan tahap"
              />
            </div>
          </div>
          <div className="mt-3">
            <TombolUtama onClick={pindahTahap}>Ubah tahap</TombolUtama>
          </div>
        </Kartu>
      )}

      {bolehUbah && (
        <Kartu>
          <JudulBagian>Tambah tindak lanjut</JudulBagian>
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
              Simpan tindak lanjut
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
      setError('Layanan yang diminati wajib dipilih.');
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
      <JudulBagian>Tambah prospek</JudulBagian>
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
            placeholder="Jabatan kontak (opsional)"
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
                {labelSumberProspek(s)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Layanan yang diminati *</Label>
          <select
            className={inputClass}
            value={form.layananDiminati}
            onChange={(e) => ubah('layananDiminati', e.target.value)}
          >
            <option value="">— Pilih layanan —</option>
            {MASTER_KATEGORI_LAYANAN.map((k) => (
              <option key={k.nama} value={k.nama}>
                {labelKategoriLayanan(k.nama)}
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
        <TombolUtama onClick={simpan}>Simpan prospek</TombolUtama>
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
      <JudulBagian>Alur penawaran</JudulBagian>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {MASTER_TAHAP_PIPELINE.map((tahap) => {
          const isi = data.prospect.filter((p) => p.tahap === tahap);
          const nilai = isi.reduce((s, p) => s + p.nilaiPerkiraan, 0);
          return (
            <div
              key={tahap}
              className="w-64 shrink-0 rounded-md border border-[#2573e2]/20 bg-white p-3"
            >
              <p className="text-sm font-bold text-[#0d2569]">{labelTahapPipeline(tahap)}</p>
              <p className="mt-0.5 text-xs text-[#0d2569]/60">
                {isi.length} prospek · {formatRupiah(nilai)}
              </p>
              <div className="mt-3 space-y-2">
                {isi.length === 0 ? (
                  <p className="text-xs text-[#0d2569]/60">
                    Belum ada prospek di tahap ini.
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
      setPesan('Catatan wajib diisi untuk mengubah tahap.');
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
    setPesan(`Pindah ke ${labelTahapPipeline(tahapTarget)}.`);
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
                    {labelTahapPipeline(t)}
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
            placeholder="Catatan perubahan tahap *"
          />
          <TombolSekunder onClick={pindah}>Ubah tahap</TombolSekunder>
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

export function TabQuotation({ data, user, actions, cari }: ModulProps) {
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
        <JudulBagian>Penawaran</JudulBagian>
        {bolehAksi(user.peran, 'kelolaQuotation') && (
          <TombolUtama onClick={() => setTampilForm(true)}>
            + Buat penawaran
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
        <PesanKosong teks="Belum ada penawaran yang cocok." />
      ) : (
        <Kartu>
          <Tabel>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Prospek</Th>
                <Th>Tanggal dibuat</Th>
                <Th>Berlaku sampai</Th>
                <Th>Status</Th>
                <Th kanan>Nilai</Th>
              </tr>
            </thead>
            <tbody>
              {quotationTersaring.map((q) => (
                <Baris key={q.id} onClick={() => setQuotationIdTerpilih(q.id)}>
                  <Td tebal>{q.id}</Td>
                  <Td>{namaProspek(data, q.prospectId)}</Td>
                  <Td>{formatTanggal(q.tanggalBuat)}</Td>
                  <Td>{formatTanggal(q.berlakuSampai)}</Td>
                  <Td>
                    <StatusBadge status={labelStatusPersetujuan(q.status)} />
                  </Td>
                  <Td kanan>{formatRupiah(q.nilai)}</Td>
                </Baris>
              ))}
            </tbody>
          </Tabel>
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
    setPesan(`Status penawaran diubah ke ${labelStatusPersetujuan(status)}.`);
  };

  const buatOrder = () => {
    const hasil = actions.tambahOrder({ quotationId: quotation.id });
    if (hasil !== null) {
      setPesan(hasil);
      return;
    }
    setPesan('Pesanan berhasil dibuat dari penawaran ini. Lihat tab Pesanan.');
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
              <StatusBadge status={labelStatusPersetujuan(quotation.status)} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Tanggal dibuat</dt>
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
        <JudulBagian>Layanan (cuplikan tarif)</JudulBagian>
        <div className="mt-3">
          <Tabel>
            <thead>
              <tr>
                <Th>Kategori</Th>
                <Th>Kode akun</Th>
                <Th>Jenis PNBP</Th>
                <Th>Satuan</Th>
                <Th kanan>Tarif</Th>
                <Th kanan>Jumlah</Th>
                <Th kanan>Subtotal</Th>
                <Th>Programa</Th>
              </tr>
            </thead>
            <tbody>
              {quotation.layanan.map((l) => (
                <Baris key={l.id}>
                  <Td>{labelKategoriLayanan(l.kategori)}</Td>
                  <Td>{l.kodeAkun}</Td>
                  <Td>{labelJenisPnBP(l.jenisPnBP)}</Td>
                  <Td>{l.satuan}</Td>
                  <Td kanan>{formatRupiah(l.tarif)}</Td>
                  <Td kanan>{l.jumlah}</Td>
                  <Td kanan>{formatRupiah(l.subtotal)}</Td>
                  <Td>{l.programa ?? '-'}</Td>
                </Baris>
              ))}
            </tbody>
          </Tabel>
        </div>
        <p className="mt-3 text-sm text-[#0d2569]/70">
          Tarif di atas adalah cuplikan saat penawaran dibuat
          dan tidak berubah bila data master berubah.
        </p>
      </Kartu>

      {bolehUbah && statusQuotationBerikutnya(quotation.status).length > 0 && (
        <Kartu>
          <JudulBagian>Ubah status</JudulBagian>
          <div className="mt-3 flex flex-wrap gap-2">
            {statusQuotationBerikutnya(quotation.status).map((s) => (
              <TombolSekunder key={s} onClick={() => ubahStatus(s)}>
                {s === 'Dikirim'
                  ? 'Kirim penawaran'
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
          <JudulBagian>Pesanan</JudulBagian>
          {orderTerkait ? (
            <p className="mt-1 text-sm text-[#0d2569]">
              Pesanan sudah dibuat dari penawaran ini:{' '}
              {orderTerkait.id} (status {labelStatusOrder(orderTerkait.status)}).
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-[#0d2569]/70">
                Penawaran disetujui. Pesanan dapat dibuat dari penawaran ini.
              </p>
              {bolehOrder && (
                <div className="mt-3">
                  <TombolUtama onClick={buatOrder}>Buat pesanan</TombolUtama>
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

export function FormQuotation({
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
  // Hanya prospek yang tahapnya bukan Diterima/Ditolak.
  const prospekLayak = data.prospect.filter(
    (p) => p.tahap !== 'Diterima' && p.tahap !== 'Ditolak',
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
        <PesanKosong teks="Belum ada prospek yang bisa diberi penawaran (semua prospek sudah Diterima atau Ditolak)." />
        <div className="mt-3">
          <TombolSekunder onClick={onBatal}>Tutup</TombolSekunder>
        </div>
      </Kartu>
    );
  }

  return (
    <Kartu>
      <JudulBagian>Buat penawaran</JudulBagian>
      <Peringatan teks="Tarif diisi operator per baris layanan dan dibekukan sebagai cuplikan saat penawaran dibuat. Tarif tidak berubah bila data master berubah (pola yang sama seperti tarif layanan pada formulir kontrak Fase A)." />
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
                {p.namaInstansi} ({labelTahapPipeline(p.tahap)})
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
            placeholder="Catatan penawaran (opsional)"
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
                      {labelKategoriLayanan(k.nama)}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-[#0d2569]/60">
                  Kode akun {master?.kodeAkun ?? '-'} — {master?.jenisPnBP ? labelJenisPnBP(master.jenisPnBP) : '-'}
                </p>
              </div>
              <div>
                <Label>Satuan *</Label>
                <input
                  className={inputClass}
                  value={b.satuan}
                  onChange={(e) => ubahBaris(idx, 'satuan', e.target.value)}
                  placeholder="cth.: Cicilan / Paket / Bulan"
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
                  placeholder="cth.: 3000000"
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
                Subtotal baris ${idx + 1}:{' '}
                {Number(b.tarif) > 0 && Number(b.jumlah) > 0
                  ? formatRupiah(Number(b.tarif) * Number(b.jumlah))
                  : '—'}
                . Tarif dibekukan sebagai cuplikan saat penawaran disimpan.
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
          + Tambah baris layanan
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
        <TombolUtama onClick={simpan}>Simpan penawaran</TombolUtama>
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

export function TabOrder({ data, user, actions, cari }: ModulProps) {
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

  // Panel Order — lima tabel (PR #115): filter panel yang sama (`cari`)
  // berlaku juga untuk empat tabel baru (berdasarkan id / klien / layanan /
  // status); tabel kosong tidak terpengaruh.
  const cocokCari = (teks: string) =>
    kataKunci === '' || teks.toLowerCase().includes(kataKunci);
  const adsTersaring = data.adsQuotationRequest.filter((r) =>
    cocokCari(
      `${r.id} ${r.namaLengkap} ${r.perusahaan} ${r.layanan.join(' ')} ${r.anggaran} ${r.status}`,
    ),
  );
  const venueTersaring = data.venueBookOrder.filter((r) =>
    cocokCari(`${r.id} ${r.namaKlien} ${r.status}`),
  );
  const spaceTersaring = data.spaceRentOrder.filter((r) =>
    cocokCari(`${r.id} ${r.namaKlien} ${r.status}`),
  );
  const partnershipTersaring = data.partnershipRequest.filter((r) =>
    cocokCari(`${r.id} ${r.namaKlien} ${r.institusi ?? ''} ${r.status}`),
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
        <JudulBagian>Pesanan manual</JudulBagian>
        {bolehAksi(user.peran, 'kelolaOrder') && (
          <TombolUtama onClick={() => setTampilForm(true)}>
            + Buat pesanan
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
        <PesanKosong teks="Belum ada pesanan yang cocok." />
      ) : (
        <Kartu>
          <Tabel>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Penawaran</Th>
                <Th>Prospek</Th>
                <Th>Tanggal pesanan</Th>
                <Th>Status</Th>
                <Th kanan>Nilai</Th>
                <Th>Kontrak</Th>
              </tr>
            </thead>
            <tbody>
              {orderTersaring.map((o) => {
                const kontrak = o.kontrakId
                  ? data.kontrak.find((k) => k.id === o.kontrakId)
                  : null;
                return (
                  <Baris key={o.id} onClick={() => setOrderIdTerpilih(o.id)}>
                    <Td tebal>{o.id}</Td>
                    <Td>{o.quotationId}</Td>
                    <Td>{namaProspek(data, o.prospectId)}</Td>
                    <Td>{formatTanggal(o.tanggalOrder)}</Td>
                    <Td>
                      <StatusBadge status={labelStatusOrder(o.status)} />
                    </Td>
                    <Td kanan>{formatRupiah(o.nilai)}</Td>
                    <Td>{kontrak ? kontrak.nomorPks : '-'}</Td>
                  </Baris>
                );
              })}
            </tbody>
          </Tabel>
        </Kartu>
      )}

      {/* ---------------------------------------------------------------
          Ads Quotation Request — respons form Tally "Plan a Campaign"
          (PR #115). Kolom mengikuti pertanyaan form: Request ID, Client
          (A1 nama lengkap), Company (A2 perusahaan/instansi), Services
          (B1 pilihan layanan), Budget (G1 rentang anggaran), Submitted,
          Status. TANPA tombol create — tabel ini diisi OTOMATIS oleh
          webhook Tally (PR terpisah, butuh upgrade Firebase ke Blaze);
          sampai webhook tersambung, empty state jujur di bawah yang
          tampil. TANPA data contoh. */}
      <div className="space-y-3">
        <JudulBagian>Permintaan penawaran iklan</JudulBagian>
        {adsTersaring.length === 0 ? (
          <PesanKosong teks="Belum ada permintaan penawaran. Respons dari formulir Plan a Campaign akan muncul di sini otomatis setelah webhook tersambung." />
        ) : (
          <Kartu>
            <Tabel>
              <thead>
                <tr>
                  <Th>ID permintaan</Th>
                  <Th>Klien</Th>
                  <Th>Perusahaan</Th>
                  <Th>Layanan</Th>
                  <Th>Anggaran</Th>
                  <Th>Dikirim</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {adsTersaring.map((r) => (
                  <Baris key={r.id}>
                    <Td tebal>{r.id}</Td>
                    <Td>{r.namaLengkap}</Td>
                    <Td>{r.perusahaan}</Td>
                    <Td>{r.layanan.map(labelOpsiTally).join(', ')}</Td>
                    <Td>{labelOpsiTally(r.anggaran)}</Td>
                    <Td>{formatTanggal(r.tanggalSubmit)}</Td>
                    <Td>
                      <StatusBadge status={labelStatusPermintaan(r.status)} />
                    </Td>
                  </Baris>
                ))}
              </tbody>
            </Tabel>
          </Kartu>
        )}
      </div>

      {/* Venue Book Order — permintaan Book a Venue (halaman publik
          2026-11-21; sebelumnya form-nya masih Coming Soon). */}
      <TabelPermintaanLayanan
        judul="Pesanan booking venue"
        daftar={venueTersaring}
        teksKosong="Belum ada pesanan booking venue. Permintaan dari formulir Book a Venue akan muncul di sini."
      />

      {/* Space Rent Order — permintaan Rent a Space (halaman publik
          2026-11-21; sebelumnya form-nya masih Coming Soon). */}
      <TabelPermintaanLayanan
        judul="Pesanan sewa ruang"
        daftar={spaceTersaring}
        teksKosong="Belum ada pesanan sewa ruang. Permintaan dari formulir Rent a Space akan muncul di sini."
      />

      {/* Partnership Request — permintaan dari form Partnership Request
          halaman "Partner with RRI" (2026-11-21; diganti nama dari
          "Media Partner Order", koleksi diganti nama dari
          mediaPartnerOrder — seed kosong, tanpa data yang dipindah).
          Empty state jujur sampai ada permintaan masuk. */}
      <TabelPermintaanLayanan
        judul="Permintaan kemitraan"
        daftar={partnershipTersaring}
        teksKosong="Belum ada permintaan kemitraan. Permintaan dari formulir Partner with RRI akan muncul di sini."
      />
    </div>
  );
}

/**
 * Rincian permintaan untuk kolom Details (halaman layanan tambahan,
 * 2026-11-21): nama layanan + institusi (Partnership Request) + tanggal
 * layanan (dd/mm/yyyy) + keperluan + jumlah peserta (booking venue),
 * dipisah ' · '; '—' bila tidak ada detail (baris lama tanpa detail).
 */
function rincianPermintaan(r: PermintaanLayananItem): string {
  const tanggal =
    r.tanggalLayanan && r.tanggalSelesai
      ? `${formatTanggal(r.tanggalLayanan)} – ${formatTanggal(r.tanggalSelesai)}`
      : r.tanggalLayanan
        ? formatTanggal(r.tanggalLayanan)
        : undefined;
  const bagian = [
    r.layanan,
    r.institusi,
    tanggal,
    r.keperluan,
    r.jumlahPeserta
      ? `${r.jumlahPeserta} peserta`
      : undefined,
  ].filter((b): b is string => Boolean(b));
  return bagian.length > 0 ? bagian.join(' · ') : '—';
}

/**
 * Tabel permintaan layanan (PR #115) — dipakai ketiga tabel layanan panel
 * Order (Venue Book, Space Rent, Partnership Request). Kolom: Request
 * ID / Client / Details / Request Date / Status. Kolom Details (baru
 * 2026-11-21) menampilkan detail permintaan dari form publiknya; empat
 * kolom lama TIDAK berubah. TANPA tombol create — baris hanya muncul
 * dari form permintaannya; sampai ada permintaan, empty state jujur
 * yang tampil. TANPA data contoh.
 */
function TabelPermintaanLayanan({
  judul,
  daftar,
  teksKosong,
}: {
  judul: string;
  daftar: PermintaanLayananItem[];
  teksKosong: string;
}) {
  return (
    <div className="space-y-3">
      <JudulBagian>{judul}</JudulBagian>
      {daftar.length === 0 ? (
        <PesanKosong teks={teksKosong} />
      ) : (
        <Kartu>
          <Tabel>
            <thead>
              <tr>
                <Th>ID permintaan</Th>
                <Th>Klien</Th>
                <Th>Detail</Th>
                <Th>Tanggal permintaan</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {daftar.map((r) => (
                <Baris key={r.id}>
                  <Td tebal>{r.id}</Td>
                  <Td>{r.namaKlien}</Td>
                  <Td>{rincianPermintaan(r)}</Td>
                  <Td>{formatTanggal(r.tanggalPermintaan)}</Td>
                  <Td>
                    <StatusBadge status={labelStatusPermintaan(r.status)} />
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
    setPesan(`Status pesanan diubah ke ${labelStatusOrder(status)}.`);
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
        ? `Pesanan berhasil dikonversi menjadi kontrak ${kontrakBaru.nomorPks}.`
        : 'Pesanan berhasil dikonversi menjadi kontrak.',
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
            <dt className="text-[#0d2569]/60">Penawaran</dt>
            <dd className="font-semibold text-[#0d2569]">
              {order.quotationId}
              {quotation ? ` (${labelStatusPersetujuan(quotation.status)})` : ''}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Prospek</dt>
            <dd className="text-right text-[#0d2569]">
              {namaProspek(data, order.prospectId)} ({order.prospectId})
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Tanggal pesanan</dt>
            <dd className="text-[#0d2569]">{formatTanggal(order.tanggalOrder)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Status</dt>
            <dd>
              <StatusBadge status={labelStatusOrder(order.status)} />
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
                {kontrak.nomorPks} ({labelStatusKontrak(kontrak.status)})
              </dd>
            </div>
          )}
        </dl>
      </Kartu>

      {bolehUbah && statusOrderBerikutnya(order.status).length > 0 && (
        <Kartu>
          <JudulBagian>Ubah status</JudulBagian>
          <div className="mt-3 flex flex-wrap gap-2">
            {statusOrderBerikutnya(order.status).map((s) => (
              <TombolSekunder key={s} onClick={() => ubahStatus(s)}>
                {s === 'Diproses'
                  ? 'Proses pesanan'
                  : s === 'Selesai'
                    ? 'Tandai selesai'
                    : 'Batal'}
              </TombolSekunder>
            ))}
          </div>
        </Kartu>
      )}

      {order.status === 'Selesai' && !order.kontrakId && (
        <Kartu>
          <JudulBagian>Konversi menjadi kontrak</JudulBagian>
          <p className="mt-1 text-sm text-[#0d2569]/70">
            Pesanan yang selesai dapat dikonversi menjadi kontrak (PKS). Prospek
            terkait menjadi Diterima.
          </p>
          {bolehUbah && (
            <div className="mt-3">
              <TombolUtama onClick={konversi}>
                Konversi menjadi kontrak
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
        <PesanKosong teks="Belum ada penawaran yang disetujui. Pesanan hanya dapat dibuat dari penawaran berstatus Disetujui." />
        <div className="mt-3">
          <TombolSekunder onClick={onBatal}>Tutup</TombolSekunder>
        </div>
      </Kartu>
    );
  }

  const simpan = () => {
    if (quotationId === '') {
      setError('Penawaran wajib dipilih.');
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
      <JudulBagian>Buat pesanan</JudulBagian>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Penawaran (disetujui) *</Label>
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
            placeholder="Catatan pesanan (opsional)"
          />
        </div>
      </div>

      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Simpan pesanan</TombolUtama>
        <TombolSekunder onClick={onBatal}>Batal</TombolSekunder>
      </div>
    </Kartu>
  );
}

// ---------------------------------------------------------------------------
// MEETING
// ---------------------------------------------------------------------------

/** Tampilkan teks atau '—' bila kosong (kolom baru Meeting, PR #73). */
function tampilTeks(nilai?: string): string {
  return nilai?.trim() ? nilai.trim() : '—';
}

/** Tampilkan daftar nama dipisah koma, atau '—' bila kosong. */
function tampilDaftar(nilai?: string[]): string {
  return nilai?.length ? nilai.join(', ') : '—';
}

/** Contact Person: nama + telepon (bila ada) + email (bila ada), atau '—'.
    Email ditampilkan supaya operator bisa mengirim link Google Meet manual
    setelah sync (PR landing-booking-email). */
function tampilKontak(m: MeetingItem): string {
  if (!m.contactPersonNama?.trim()) return '—';
  const dasar = m.contactPersonTelepon?.trim()
    ? `${m.contactPersonNama.trim()} (${m.contactPersonTelepon.trim()})`
    : m.contactPersonNama.trim();
  return m.contactPersonEmail?.trim()
    ? `${dasar} · ${m.contactPersonEmail.trim()}`
    : dasar;
}

export function TabMeeting({ data, user, actions, cari }: ModulProps) {
  const [filterWaktu, setFilterWaktu] = useState<'mendatang' | 'semua'>(
    'mendatang',
  );
  const [tampilForm, setTampilForm] = useState(false);
  const [editMeeting, setEditMeeting] = useState<MeetingItem | null>(null);
  // Google Calendar (PR #73) — access token HANYA di memori sesi,
  // tidak disimpan di Firestore maupun localStorage.
  const [google, setGoogle] = useState<KoneksiKalender | null>(null);
  const [pesanGoogle, setPesanGoogle] = useState('');
  const [catatanKalender, setCatatanKalender] = useState('');
  const [sedangSinkron, setSedangSinkron] = useState<string | null>(null);
  const hariIni = hariIniIso();
  const bolehKelola = bolehAksi(user.peran, 'kelolaMeeting');

  const kataKunci = cari.trim().toLowerCase();
  const meetingTersaring = data.meeting
    .filter(
      (m) =>
        (filterWaktu === 'semua' || m.tanggal >= hariIni) &&
        (kataKunci === '' ||
          `${m.id} ${m.agenda} ${(m.clientRepresentatives ?? []).join(' ')} ${m.contactPersonNama ?? ''} ${m.contactPersonEmail ?? ''} ${(m.rriRepresentatives ?? []).join(' ')} ${m.alamatKlien ?? ''} ${m.hasil ?? ''}`
            .toLowerCase()
            .includes(kataKunci)),
    )
    .slice()
    .sort((a, b) =>
      a.tanggal === b.tanggal
        ? a.jam.localeCompare(b.jam)
        : a.tanggal.localeCompare(b.tanggal),
    );

  /** Nama prospect/klien untuk satu meeting (dipakai tabel + event). */
  const namaPihak = (m: MeetingItem): string => {
    const prospek = m.prospectId
      ? data.prospect.find((p) => p.id === m.prospectId)
      : null;
    const klien = m.klienId
      ? data.klien.find((k) => k.id === m.klienId)
      : null;
    return [prospek?.namaInstansi, klien?.nama].filter(Boolean).join(' — ');
  };

  const hubungkan = async () => {
    setPesanGoogle('');
    try {
      setGoogle(await hubungkanGoogleCalendar());
    } catch (e) {
      setPesanGoogle(pesanGalatGoogle(e));
    }
  };

  const sinkronkan = async (m: MeetingItem) => {
    if (!google) {
      setPesanGoogle('Hubungkan Google Calendar dulu, lalu sinkronkan pertemuannya.');
      return;
    }
    setSedangSinkron(m.id);
    setPesanGoogle('');
    try {
      const idEvent = await sinkronkanEventKalender(
        google.accessToken,
        m,
        namaPihak(m),
      );
      actions.tandaiMeetingTersinkron(m.id, idEvent);
    } catch (e) {
      setPesanGoogle(pesanGalatGoogle(e));
    } finally {
      setSedangSinkron(null);
    }
  };

  /** Setelah Update tersimpan: PATCH event Google-nya bila sudah sync. */
  const setelahUpdate = async (m: MeetingItem, input: MeetingInput) => {
    setEditMeeting(null);
    const eventId = m.googleEventId;
    if (!eventId) return;
    const diperbarui: MeetingItem = {
      ...m,
      tanggal: input.tanggal,
      jam: input.jam,
      prospectId: input.prospectId || undefined,
      klienId: input.klienId || undefined,
      peserta: [
        ...input.rriRepresentatives,
        ...input.clientRepresentatives,
      ].join(', '),
      agenda: input.agenda.trim(),
      hasil: input.hasil || undefined,
      clientRepresentatives: input.clientRepresentatives,
      contactPersonNama: input.contactPersonNama.trim(),
      contactPersonTelepon: input.contactPersonTelepon.trim() || undefined,
      rriRepresentatives: input.rriRepresentatives,
      alamatKlien: input.alamatKlien.trim() || undefined,
    };
    if (!google) {
      setCatatanKalender(
        'Google Calendar tidak diperbarui. Hubungkan Google Calendar lalu gunakan Sinkronkan untuk memperbarui acaranya.',
      );
      return;
    }
    try {
      await perbaruiEventKalender(
        google.accessToken,
        eventId,
        diperbarui,
        namaPihak(diperbarui),
      );
      setCatatanKalender('Acara Google Calendar diperbarui.');
    } catch (e) {
      setCatatanKalender(
        `Google Calendar tidak diperbarui: ${pesanGalatGoogle(e)}`,
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <JudulBagian>Pertemuan</JudulBagian>
        <div className="flex flex-wrap items-center gap-2">
          {google ? (
            <>
              <span className="text-sm text-[#0d2569]">
                Terhubung: {google.email}
              </span>
              <TombolSekunder
                onClick={() => {
                  setGoogle(null);
                  setPesanGoogle('');
                }}
              >
                Putuskan
              </TombolSekunder>
            </>
          ) : (
            <TombolSekunder onClick={hubungkan}>
              Hubungkan Google Calendar
            </TombolSekunder>
          )}
          {bolehKelola && (
            <TombolUtama onClick={() => setTampilForm(true)}>
              + Tambah pertemuan
            </TombolUtama>
          )}
        </div>
      </div>

      {pesanGoogle !== '' && <Peringatan teks={pesanGoogle} />}
      {catatanKalender !== '' && <Peringatan teks={catatanKalender} />}

      <div>
        <Label>Filter berdasarkan waktu</Label>
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
          namaOperatorLogin={user.nama}
          onBatal={() => setTampilForm(false)}
          onSukses={() => setTampilForm(false)}
        />
      )}

      {editMeeting && (
        <FormMeeting
          data={data}
          actions={actions}
          meeting={editMeeting}
          namaOperatorLogin={user.nama}
          onBatal={() => setEditMeeting(null)}
          onSukses={(input) => {
            if (input) void setelahUpdate(editMeeting, input);
            else setEditMeeting(null);
          }}
        />
      )}

      {meetingTersaring.length === 0 ? (
        <PesanKosong teks="Belum ada pertemuan yang cocok." />
      ) : (
        <Kartu>
          <Tabel>
            <thead>
              <tr>
                <Th>Tanggal</Th>
                <Th>Jam</Th>
                <Th>Prospek / Klien</Th>
                <Th>Alamat klien</Th>
                <Th>Perwakilan klien</Th>
                <Th>Narahubung</Th>
                <Th>Perwakilan RRI</Th>
                <Th>Agenda</Th>
                <Th>Hasil</Th>
                <Th>Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {meetingTersaring.map((m) => {
                const pihak = namaPihak(m);
                return (
                  <Baris key={m.id}>
                    <Td>{formatTanggal(m.tanggal)}</Td>
                    <Td>{m.jam}</Td>
                    <Td>{pihak === '' ? '-' : pihak}</Td>
                    <Td>{tampilTeks(m.alamatKlien)}</Td>
                    <Td>{tampilDaftar(m.clientRepresentatives)}</Td>
                    <Td>{tampilKontak(m)}</Td>
                    <Td>{tampilDaftar(m.rriRepresentatives)}</Td>
                    <Td>{m.agenda}</Td>
                    <Td>{m.hasil ?? '-'}</Td>
                    <Td>
                      <div className="flex flex-wrap items-center gap-2">
                        {bolehKelola && (
                          <TombolSekunder onClick={() => setEditMeeting(m)}>
                            Ubah
                          </TombolSekunder>
                        )}
                        {bolehKelola && (
                          <TombolSekunder
                            onClick={() => void sinkronkan(m)}
                            disabled={sedangSinkron === m.id}
                          >
                            {sedangSinkron === m.id ? 'Menyinkronkan…' : 'Sinkronkan'}
                          </TombolSekunder>
                        )}
                        <span className="text-xs whitespace-nowrap text-[#0d2569]/70">
                          {m.googleEventId ? 'Tersinkron' : 'Belum tersinkron'}
                        </span>
                      </div>
                    </Td>
                  </Baris>
                );
              })}
            </tbody>
          </Tabel>
        </Kartu>
      )}
    </div>
  );
}

function FormMeeting({
  data,
  actions,
  meeting,
  namaOperatorLogin,
  onBatal,
  onSukses,
}: {
  data: ModulProps['data'];
  actions: ModulProps['actions'];
  /** Bila diisi: mode edit (Update) — form terisi dari meeting ini. */
  meeting?: MeetingItem;
  /** Nama operator yang sedang login — default RRI Representative. */
  namaOperatorLogin: string;
  onBatal: () => void;
  onSukses: (input?: MeetingInput) => void;
}) {
  const [form, setForm] = useState<MeetingInput>({
    tanggal: meeting?.tanggal ?? hariIniIso(),
    jam: meeting?.jam ?? '09:00',
    prospectId: meeting?.prospectId ?? '',
    klienId: meeting?.klienId ?? '',
    agenda: meeting?.agenda ?? '',
    hasil: meeting?.hasil ?? '',
    clientRepresentatives: meeting?.clientRepresentatives ?? [],
    contactPersonNama: meeting?.contactPersonNama ?? '',
    contactPersonTelepon: meeting?.contactPersonTelepon ?? '',
    contactPersonEmail: meeting?.contactPersonEmail ?? '',
    // Form Add: operator yang sedang login terpilih secara default
    // (bisa diubah/ditambah — pola atribusi operatorPenutup kontrak).
    rriRepresentatives:
      meeting?.rriRepresentatives ??
      (namaOperatorLogin.trim() === '' ? [] : [namaOperatorLogin.trim()]),
    alamatKlien: meeting?.alamatKlien ?? '',
  });
  // Client Representative diisi free-text multi-nama (pisah koma);
  // diurai menjadi string[] saat simpan.
  const [wakilKlienTeks, setWakilKlienTeks] = useState(
    (meeting?.clientRepresentatives ?? []).join(', '),
  );
  const [tampilOpsiRri, setTampilOpsiRri] = useState(false);
  const [error, setError] = useState('');

  const ubah = (
    field:
      | 'tanggal'
      | 'jam'
      | 'prospectId'
      | 'klienId'
      | 'contactPersonNama'
      | 'contactPersonTelepon'
      | 'contactPersonEmail'
      | 'alamatKlien'
      | 'agenda'
      | 'hasil',
    nilai: string,
  ) => setForm((f) => ({ ...f, [field]: nilai }));

  // Opsi dropdown RRI Representative: 5 operator Palembang + nama yang
  // sudah terpilih (mis. nama contoh di meeting lama / nama operator
  // login bila bukan salah satu dari kelimanya).
  const opsiRri = [
    ...new Set(
      [...OPERATOR_PALEMBANG, ...form.rriRepresentatives, namaOperatorLogin]
        .map((n) => n.trim())
        .filter((n) => n !== ''),
    ),
  ];

  const alihkanRri = (nama: string) =>
    setForm((f) => ({
      ...f,
      rriRepresentatives: f.rriRepresentatives.includes(nama)
        ? f.rriRepresentatives.filter((n) => n !== nama)
        : [...f.rriRepresentatives, nama],
    }));

  /** Pilih prospect: isi otomatis Contact Person dari data prospect. */
  const pilihProspect = (id: string) => {
    const p = data.prospect.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      prospectId: id,
      contactPersonNama: p?.kontakNama ?? f.contactPersonNama,
      contactPersonTelepon: p?.telepon ?? f.contactPersonTelepon,
      contactPersonEmail: p?.email ?? f.contactPersonEmail,
    }));
  };

  /** Pilih klien: isi otomatis Contact Person + alamat dari data klien. */
  const pilihKlien = (id: string) => {
    const k = data.klien.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      klienId: id,
      contactPersonNama: k?.kontakNama ?? f.contactPersonNama,
      contactPersonTelepon: k?.telepon ?? f.contactPersonTelepon,
      contactPersonEmail: k?.email ?? f.contactPersonEmail,
      alamatKlien: k?.alamat ?? f.alamatKlien,
    }));
  };

  const simpan = () => {
    if (form.tanggal === '') {
      setError('Tanggal pertemuan wajib diisi.');
      return;
    }
    if (form.jam === '') {
      setError('Jam pertemuan wajib diisi.');
      return;
    }
    if (
      (form.prospectId === '' || form.prospectId === undefined) &&
      (form.klienId === '' || form.klienId === undefined)
    ) {
      setError('Pilih satu: prospek atau klien.');
      return;
    }
    const wakilKlien = wakilKlienTeks
      .split(',')
      .map((n) => n.trim())
      .filter((n) => n !== '');
    if (wakilKlien.length === 0) {
      setError('Tambahkan minimal satu perwakilan klien.');
      return;
    }
    if (form.contactPersonNama.trim() === '') {
      setError('Nama narahubung wajib diisi.');
      return;
    }
    if (form.rriRepresentatives.length === 0) {
      setError('Tambahkan minimal satu perwakilan RRI.');
      return;
    }
    if (form.agenda.trim() === '') {
      setError('Agenda wajib diisi.');
      return;
    }
    const input: MeetingInput = {
      tanggal: form.tanggal,
      jam: form.jam,
      prospectId: form.prospectId === '' ? undefined : form.prospectId,
      klienId: form.klienId === '' ? undefined : form.klienId,
      agenda: form.agenda.trim(),
      hasil: form.hasil?.trim() === '' ? undefined : form.hasil?.trim(),
      clientRepresentatives: wakilKlien,
      contactPersonNama: form.contactPersonNama.trim(),
      contactPersonTelepon: form.contactPersonTelepon.trim(),
      contactPersonEmail: form.contactPersonEmail?.trim() || undefined,
      rriRepresentatives: form.rriRepresentatives,
      alamatKlien: form.alamatKlien.trim(),
    };
    const hasil = meeting
      ? actions.ubahMeeting(meeting.id, input)
      : actions.tambahMeeting(input);
    if (hasil !== null) {
      setError(hasil);
      return;
    }
    onSukses(input);
  };

  return (
    <Kartu>
      <JudulBagian>{meeting ? 'Ubah pertemuan' : 'Tambah pertemuan'}</JudulBagian>
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
          <Label>Prospek (pilih satu) *</Label>
          <select
            className={inputClass}
            value={form.prospectId ?? ''}
            onChange={(e) => pilihProspect(e.target.value)}
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
          <Label>Klien (pilih satu) *</Label>
          <select
            className={inputClass}
            value={form.klienId ?? ''}
            onChange={(e) => pilihKlien(e.target.value)}
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
          <Label>Alamat klien</Label>
          <input
            className={inputClass}
            value={form.alamatKlien}
            onChange={(e) => ubah('alamatKlien', e.target.value)}
            placeholder="Alamat klien (terisi otomatis dari data klien)"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Perwakilan klien *</Label>
          <input
            className={inputClass}
            value={wakilKlienTeks}
            onChange={(e) => setWakilKlienTeks(e.target.value)}
            placeholder="Nama perwakilan klien, dipisah koma"
          />
        </div>
        <div>
          <Label>Narahubung *</Label>
          <input
            className={inputClass}
            value={form.contactPersonNama}
            onChange={(e) => ubah('contactPersonNama', e.target.value)}
            placeholder="Nama narahubung"
          />
        </div>
        <div>
          <Label>Telepon narahubung</Label>
          <input
            className={inputClass}
            value={form.contactPersonTelepon}
            onChange={(e) => ubah('contactPersonTelepon', e.target.value)}
            placeholder="Nomor telepon narahubung"
          />
        </div>
        <div>
          <Label>Email narahubung</Label>
          <input
            className={inputClass}
            value={form.contactPersonEmail ?? ''}
            onChange={(e) => ubah('contactPersonEmail', e.target.value)}
            placeholder="Email narahubung (menerima tautan Google Meet)"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Perwakilan RRI *</Label>
          <div className="relative">
            <button
              type="button"
              className={`${inputClass} text-left`}
              onClick={() => setTampilOpsiRri((v) => !v)}
            >
              {form.rriRepresentatives.length === 0
                ? 'Pilih perwakilan RRI'
                : form.rriRepresentatives.join(', ')}
            </button>
            {tampilOpsiRri && (
              <div className="absolute z-10 mt-1 w-full rounded-md border border-[#2573e2]/40 bg-white p-2 shadow-md">
                {opsiRri.map((nama) => (
                  <label
                    key={nama}
                    className="flex cursor-pointer items-center gap-2 px-2 py-1 text-sm text-[#0d2569]"
                  >
                    <input
                      type="checkbox"
                      checked={form.rriRepresentatives.includes(nama)}
                      onChange={() => alihkanRri(nama)}
                    />
                    {nama}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="md:col-span-2">
          <Label>Agenda *</Label>
          <textarea
            className={`${inputClass} min-h-20`}
            value={form.agenda}
            onChange={(e) => ubah('agenda', e.target.value)}
            placeholder="Agenda pertemuan"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Hasil</Label>
          <input
            className={inputClass}
            value={form.hasil ?? ''}
            onChange={(e) => ubah('hasil', e.target.value)}
            placeholder="Hasil pertemuan (opsional)"
          />
        </div>
      </div>

      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>
          {meeting ? 'Simpan perubahan' : 'Simpan pertemuan'}
        </TombolUtama>
        <TombolSekunder onClick={onBatal}>Batal</TombolSekunder>
      </div>
    </Kartu>
  );
}

// ---------------------------------------------------------------------------
// ANALYTICS — semua angka dari hitungAnalitikSales(data), tanpa hitung ulang.
// ---------------------------------------------------------------------------

export function TabAnalytics({ data }: { data: ModulProps['data'] }) {
  const a = hitungAnalitikSales(data);
  const totalProspekAktif = a.prospectPerTahap.reduce(
    (s, r) => s + r.jumlah,
    0,
  );
  const konversi: { label: string; nilai: number }[] = [
    { label: 'Prospek → Penawaran', nilai: a.konversiProspectKeQuotation },
    { label: 'Penawaran → Pesanan', nilai: a.konversiQuotationKeOrder },
    { label: 'Pesanan → Kontrak', nilai: a.konversiOrderKeKontrak },
    { label: 'Prospek → Kontrak', nilai: a.konversiProspectKeKontrak },
  ];

  return (
    <div className="space-y-4">
      <JudulBagian>Ringkasan</JudulBagian>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Jumlah prospek" nilai={String(a.jumlahProspect)} />
        <StatCard
          label="Nilai alur penawaran"
          nilai={formatRupiah(a.nilaiPipeline)}
          keterangan={`${totalProspekAktif} prospek di tahap aktif`}
        />
        <StatCard
          label="Jumlah penawaran"
          nilai={String(a.jumlahQuotation)}
          keterangan={`${a.jumlahQuotationDisetujui} disetujui`}
        />
        <StatCard
          label="Jumlah pesanan"
          nilai={String(a.jumlahOrder)}
          keterangan={`${a.jumlahOrderSelesai} selesai`}
        />
        <StatCard
          label="Kontrak dari prospek"
          nilai={String(a.jumlahKontrakDariProspect)}
        />
      </div>

      <Kartu>
        <JudulBagian>Prospek per tahap (aktif)</JudulBagian>
        <div className="mt-3">
          <Tabel>
            <thead>
              <tr>
                <Th>Tahap</Th>
                <Th kanan>Jumlah prospek</Th>
                <Th kanan>Nilai</Th>
              </tr>
            </thead>
            <tbody>
              {a.prospectPerTahap.map((r) => (
                <Baris key={r.tahap}>
                  <Td>{labelTahapPipeline(r.tahap)}</Td>
                  <Td kanan>{r.jumlah}</Td>
                  <Td kanan>{formatRupiah(r.nilai)}</Td>
                </Baris>
              ))}
              <Baris className="bg-[#2573e2]/5 font-semibold">
                <Td tebal>Total (tahap aktif)</Td>
                <Td kanan tebal>{totalProspekAktif}</Td>
                <Td kanan tebal>{formatRupiah(a.nilaiPipeline)}</Td>
              </Baris>
            </tbody>
          </Tabel>
        </div>
      </Kartu>

      <Kartu>
        <JudulBagian>Tingkat konversi</JudulBagian>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {konversi.map((k) => (
            <StatCard key={k.label} label={k.label} nilai={`${k.nilai}%`} />
          ))}
        </div>
      </Kartu>
    </div>
  );
}

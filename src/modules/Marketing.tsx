// Modul Marketing (PRD v2.0 Final Bab 7.2; user story US-M1).
// Palet HANYA 3 warna RRI: Biru #2573E2, Navy #0D2569, Putih #FFFFFF.

import { useState } from 'react';
import type { EventInput, AdvertisementInput, ModulProps } from '../lib/store';
import { formatRupiah, formatTanggal } from '../lib/format';
import { bolehAksi } from '../lib/permissions';
import {
  Baris,
  JudulBagian,
  Kartu,
  Label,
  PesanKosong,
  StatCard,
  TabBar,
  Tabel,
  Td,
  Th,
  TombolSekunder,
  TombolUtama,
  inputClass,
} from '../components/ui';

export default function Marketing(props: ModulProps) {
  const { data, user, actions, cari } = props;
  const [tab, setTab] = useState('events');
  const bolehKelola = bolehAksi(user.peran, 'kelolaMarketing');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <JudulBagian>Marketing</JudulBagian>
      </div>
      <TabBar
        tabs={[
          { id: 'events', label: 'Events' },
          { id: 'advertisement', label: 'Advertisement' },
        ]}
        aktif={tab}
        onPilih={setTab}
      />
      {tab === 'events' ? (
        <DaftarEvent
          data={data}
          actions={actions}
          cari={cari}
          bolehKelola={bolehKelola}
        />
      ) : (
        <DaftarAdvertisement
          data={data}
          actions={actions}
          cari={cari}
          bolehKelola={bolehKelola}
        />
      )}
    </div>
  );
}

function DaftarEvent({
  data,
  actions,
  cari,
  bolehKelola,
}: {
  data: ModulProps['data'];
  actions: ModulProps['actions'];
  cari: string;
  bolehKelola: boolean;
}) {
  const [tampilForm, setTampilForm] = useState(false);
  const kataKunci = cari.trim().toLowerCase();
  const events = data.event.filter(
    (e) =>
      kataKunci === '' ||
      `${e.id} ${e.nama} ${e.penyelenggara} ${e.hasil ?? ''}`
        .toLowerCase()
        .includes(kataKunci),
  );
  const totalBiaya = events.reduce((s, e) => s + e.biaya, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Jumlah event" nilai={String(events.length)} />
        <StatCard
          label="Total biaya event"
          nilai={formatRupiah(totalBiaya)}
          keterangan="Dihitung dari event yang ditampilkan"
        />
      </div>

      {bolehKelola && (
        <div>
          <TombolUtama onClick={() => setTampilForm(true)}>
            + Tambah Event
          </TombolUtama>
        </div>
      )}

      {tampilForm && (
        <FormEvent
          data={data}
          actions={actions}
          onBatal={() => setTampilForm(false)}
          onSukses={() => setTampilForm(false)}
        />
      )}

      {events.length === 0 ? (
        <PesanKosong teks="Belum ada event yang cocok." />
      ) : (
        <Kartu>
          <Tabel>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Nama Event</Th>
                <Th>Tanggal</Th>
                <Th>Penyelenggara</Th>
                <Th kanan>Biaya</Th>
                <Th>Hasil</Th>
                <Th>Prospek yang Dihasilkan</Th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const prospek = e.prospectId
                  ? data.prospect.find((p) => p.id === e.prospectId)
                  : undefined;
                return (
                  <Baris key={e.id}>
                    <Td tebal>{e.id}</Td>
                    <Td>{e.nama}</Td>
                    <Td>{formatTanggal(e.tanggal)}</Td>
                    <Td>{e.penyelenggara}</Td>
                    <Td kanan>{formatRupiah(e.biaya)}</Td>
                    <Td>{e.hasil ?? '-'}</Td>
                    <Td>
                      {prospek ? prospek.namaInstansi : '-'}
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

function FormEvent({
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
  const [form, setForm] = useState<EventInput>({
    nama: '',
    tanggal: '',
    penyelenggara: '',
    biaya: 0,
    hasil: '',
    prospectId: undefined,
  });
  const [biayaTeks, setBiayaTeks] = useState('0');
  const [error, setError] = useState('');

  const ubahTeks = (
    field: 'nama' | 'tanggal' | 'penyelenggara' | 'hasil',
    nilai: string,
  ) => setForm((f) => ({ ...f, [field]: nilai }));

  const simpan = () => {
    if (form.nama.trim() === '') {
      setError('Nama event wajib diisi.');
      return;
    }
    if (form.tanggal === '') {
      setError('Tanggal event wajib diisi.');
      return;
    }
    if (form.penyelenggara.trim() === '') {
      setError('Penyelenggara wajib diisi.');
      return;
    }
    const biaya = biayaTeks.trim() === '' ? 0 : Number(biayaTeks);
    if (!(biaya >= 0)) {
      setError('Biaya harus berupa angka 0 atau lebih.');
      return;
    }
    const hasil = actions.tambahEvent({
      nama: form.nama.trim(),
      tanggal: form.tanggal,
      penyelenggara: form.penyelenggara.trim(),
      biaya,
      hasil: form.hasil?.trim() === '' ? undefined : form.hasil?.trim(),
      prospectId:
        form.prospectId === '' ? undefined : form.prospectId,
    });
    if (hasil !== null) {
      setError(hasil);
      return;
    }
    onSukses();
  };

  return (
    <Kartu>
      <JudulBagian>Tambah Event</JudulBagian>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Nama event *</Label>
          <input
            className={inputClass}
            value={form.nama}
            onChange={(e) => ubahTeks('nama', e.target.value)}
            placeholder="Nama event"
          />
        </div>
        <div>
          <Label>Tanggal *</Label>
          <input
            className={inputClass}
            type="date"
            value={form.tanggal}
            onChange={(e) => ubahTeks('tanggal', e.target.value)}
          />
        </div>
        <div>
          <Label>Penyelenggara *</Label>
          <input
            className={inputClass}
            value={form.penyelenggara}
            onChange={(e) => ubahTeks('penyelenggara', e.target.value)}
            placeholder="Nama penyelenggara"
          />
        </div>
        <div>
          <Label>Biaya (Rp) *</Label>
          <input
            className={inputClass}
            type="number"
            min="0"
            value={biayaTeks}
            onChange={(e) => setBiayaTeks(e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <Label>Prospek yang dihasilkan (opsional)</Label>
          <select
            className={inputClass}
            value={form.prospectId ?? ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                prospectId:
                  e.target.value === '' ? undefined : e.target.value,
              }))
            }
          >
            <option value="">— Tidak ada —</option>
            {data.prospect.map((p) => (
              <option key={p.id} value={p.id}>
                {p.namaInstansi} ({p.id})
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Hasil (opsional)</Label>
          <input
            className={inputClass}
            value={form.hasil ?? ''}
            onChange={(e) => ubahTeks('hasil', e.target.value)}
            placeholder="Hasil atau capaian event"
          />
        </div>
      </div>

      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Simpan Event</TombolUtama>
        <TombolSekunder onClick={onBatal}>Batal</TombolSekunder>
      </div>
    </Kartu>
  );
}

function DaftarAdvertisement({
  data,
  actions,
  cari,
  bolehKelola,
}: {
  data: ModulProps['data'];
  actions: ModulProps['actions'];
  cari: string;
  bolehKelola: boolean;
}) {
  const [tampilForm, setTampilForm] = useState(false);
  const kataKunci = cari.trim().toLowerCase();
  const iklan = data.advertisement.filter(
    (a) =>
      kataKunci === '' ||
      `${a.id} ${a.nama} ${a.media} ${a.hasil ?? ''}`
        .toLowerCase()
        .includes(kataKunci),
  );
  const totalBiaya = iklan.reduce((s, a) => s + a.biaya, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Jumlah iklan" nilai={String(iklan.length)} />
        <StatCard
          label="Total biaya iklan"
          nilai={formatRupiah(totalBiaya)}
          keterangan="Dihitung dari iklan yang ditampilkan"
        />
      </div>

      {bolehKelola && (
        <div>
          <TombolUtama onClick={() => setTampilForm(true)}>
            + Tambah Iklan
          </TombolUtama>
        </div>
      )}

      {tampilForm && (
        <FormAdvertisement
          actions={actions}
          onBatal={() => setTampilForm(false)}
          onSukses={() => setTampilForm(false)}
        />
      )}

      {iklan.length === 0 ? (
        <PesanKosong teks="Belum ada iklan yang cocok." />
      ) : (
        <Kartu>
          <Tabel>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Nama Iklan</Th>
                <Th>Media / Saluran</Th>
                <Th>Periode</Th>
                <Th kanan>Biaya</Th>
                <Th>Hasil</Th>
              </tr>
            </thead>
            <tbody>
              {iklan.map((a) => (
                <Baris key={a.id}>
                  <Td tebal>{a.id}</Td>
                  <Td>{a.nama}</Td>
                  <Td>{a.media}</Td>
                  <Td>
                    {formatTanggal(a.periodeMulai)} –{' '}
                    {formatTanggal(a.periodeSelesai)}
                  </Td>
                  <Td kanan>{formatRupiah(a.biaya)}</Td>
                  <Td>{a.hasil ?? '-'}</Td>
                </Baris>
              ))}
            </tbody>
          </Tabel>
        </Kartu>
      )}
    </div>
  );
}

function FormAdvertisement({
  actions,
  onBatal,
  onSukses,
}: {
  actions: ModulProps['actions'];
  onBatal: () => void;
  onSukses: () => void;
}) {
  const [form, setForm] = useState<AdvertisementInput>({
    nama: '',
    media: '',
    periodeMulai: '',
    periodeSelesai: '',
    biaya: 0,
    hasil: '',
  });
  const [biayaTeks, setBiayaTeks] = useState('0');
  const [error, setError] = useState('');

  const ubahTeks = (
    field: 'nama' | 'media' | 'periodeMulai' | 'periodeSelesai' | 'hasil',
    nilai: string,
  ) => setForm((f) => ({ ...f, [field]: nilai }));

  const simpan = () => {
    if (form.nama.trim() === '') {
      setError('Nama iklan wajib diisi.');
      return;
    }
    if (form.media.trim() === '') {
      setError('Media / saluran wajib diisi.');
      return;
    }
    if (form.periodeMulai === '') {
      setError('Periode mulai wajib diisi.');
      return;
    }
    if (form.periodeSelesai === '') {
      setError('Periode selesai wajib diisi.');
      return;
    }
    if (form.periodeSelesai < form.periodeMulai) {
      setError('Periode selesai tidak boleh lebih awal dari periode mulai.');
      return;
    }
    const biaya = biayaTeks.trim() === '' ? 0 : Number(biayaTeks);
    if (!(biaya >= 0)) {
      setError('Biaya harus berupa angka 0 atau lebih.');
      return;
    }
    const hasil = actions.tambahAdvertisement({
      nama: form.nama.trim(),
      media: form.media.trim(),
      periodeMulai: form.periodeMulai,
      periodeSelesai: form.periodeSelesai,
      biaya,
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
      <JudulBagian>Tambah Iklan</JudulBagian>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Nama iklan *</Label>
          <input
            className={inputClass}
            value={form.nama}
            onChange={(e) => ubahTeks('nama', e.target.value)}
            placeholder="Nama iklan"
          />
        </div>
        <div>
          <Label>Media / saluran *</Label>
          <input
            className={inputClass}
            value={form.media}
            onChange={(e) => ubahTeks('media', e.target.value)}
            placeholder="Contoh: Media Sosial (Instagram/Facebook)"
          />
        </div>
        <div>
          <Label>Periode mulai *</Label>
          <input
            className={inputClass}
            type="date"
            value={form.periodeMulai}
            onChange={(e) => ubahTeks('periodeMulai', e.target.value)}
          />
        </div>
        <div>
          <Label>Periode selesai *</Label>
          <input
            className={inputClass}
            type="date"
            value={form.periodeSelesai}
            onChange={(e) => ubahTeks('periodeSelesai', e.target.value)}
          />
        </div>
        <div>
          <Label>Biaya (Rp) *</Label>
          <input
            className={inputClass}
            type="number"
            min="0"
            value={biayaTeks}
            onChange={(e) => setBiayaTeks(e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <Label>Hasil (opsional)</Label>
          <input
            className={inputClass}
            value={form.hasil ?? ''}
            onChange={(e) => ubahTeks('hasil', e.target.value)}
            placeholder="Hasil atau capaian iklan"
          />
        </div>
      </div>

      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Simpan Iklan</TombolUtama>
        <TombolSekunder onClick={onBatal}>Batal</TombolSekunder>
      </div>
    </Kartu>
  );
}

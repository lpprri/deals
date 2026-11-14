// Modul To-Do List (PRD v2.0 Final Bab 7.7 & Bab 9.6; user story US-T1).
// Palet HANYA 3 warna RRI: Biru #2573E2, Navy #0D2569, Putih #FFFFFF.
// Tanda "lewat tenggat" memakai teks, bukan warna baru.

import { useState } from 'react';
import type { StatusTask, Task } from '../lib/types';
import type { DisposisiInput, ModulProps, TaskInput } from '../lib/store';
import { MASTER_STATUS_TASK } from '../lib/master';
import { DUMMY_USERS } from '../lib/dummyUsers';
import { formatTanggal, hariIniIso } from '../lib/format';
import { bolehAksi } from '../lib/permissions';
import {
  Baris,
  ItemDaftar,
  JudulBagian,
  Kartu,
  Label,
  Peringatan,
  PesanKosong,
  StatusBadge,
  TabBar,
  Tabel,
  Td,
  Th,
  TombolSekunder,
  TombolUtama,
  inputClass,
} from '../components/ui';

/**
 * Status berikutnya yang sah: Belum Dikerjakan -> Berjalan -> Selesai.
 * 'Ditutup' hanya lewat penutupan disposisi (Alur F), bukan tombol status.
 */
function statusBerikutnya(status: StatusTask): StatusTask | null {
  switch (status) {
    case 'Belum Dikerjakan':
      return 'Berjalan';
    case 'Berjalan':
      return 'Selesai';
    default:
      return null;
  }
}

/** Lewat tenggat: tenggat < hari ini dan status belum Selesai/Ditutup. */
function lewatTenggat(t: Task): boolean {
  return (
    t.tenggat < hariIniIso() &&
    t.status !== 'Selesai' &&
    t.status !== 'Ditutup'
  );
}

export default function Todo(props: ModulProps) {
  const { data, user, actions, cari } = props;
  const [tab, setTab] = useState('tugas');
  const bolehKelolaTask = bolehAksi(user.peran, 'kelolaTask');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <JudulBagian>To-Do List</JudulBagian>
      </div>
      <TabBar
        tabs={[
          { id: 'tugas', label: 'Tugas Saya' },
          { id: 'disposisi', label: 'Disposisi' },
        ]}
        aktif={tab}
        onPilih={setTab}
      />
      {tab === 'tugas' ? (
        <DaftarTugas
          data={data}
          user={user}
          actions={actions}
          cari={cari}
          bolehKelolaTask={bolehKelolaTask}
        />
      ) : (
        <DaftarDisposisi
          data={data}
          user={user}
          actions={actions}
          cari={cari}
        />
      )}
    </div>
  );
}

function DaftarTugas({
  data,
  user,
  actions,
  cari,
  bolehKelolaTask,
}: {
  data: ModulProps['data'];
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  cari: string;
  bolehKelolaTask: boolean;
}) {
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [cakupan, setCakupan] = useState<'saya' | 'semua'>('saya');
  const [tampilForm, setTampilForm] = useState(false);
  const [pesan, setPesan] = useState('');

  const kataKunci = cari.trim().toLowerCase();
  const tugas = data.task.filter(
    (t) =>
      (cakupan === 'semua' || t.pemilik === user.nama) &&
      (filterStatus === 'Semua' || t.status === filterStatus) &&
      (kataKunci === '' ||
        `${t.id} ${t.judul} ${t.pemilik} ${t.instruksi ?? ''} ${
          t.terkaitLabel ?? ''
        }`
          .toLowerCase()
          .includes(kataKunci)),
  );

  const ubahStatus = (t: Task, status: StatusTask) => {
    actions.ubahStatusTask(t, status);
    setPesan(`Status tugas diubah menjadi ${status}.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div>
          <Label>Filter status</Label>
          <select
            className={`${inputClass} max-w-xs`}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Semua">Semua</option>
            {MASTER_STATUS_TASK.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Cakupan tugas</Label>
          <select
            className={`${inputClass} max-w-xs`}
            value={cakupan}
            onChange={(e) =>
              setCakupan(e.target.value as 'saya' | 'semua')
            }
          >
            <option value="saya">Tugas saya</option>
            <option value="semua">Semua tugas</option>
          </select>
        </div>
      </div>

      {bolehKelolaTask && (
        <div>
          <TombolUtama onClick={() => setTampilForm(true)}>
            + Tambah Tugas
          </TombolUtama>
        </div>
      )}

      {tampilForm && (
        <FormTask
          user={user}
          actions={actions}
          onBatal={() => setTampilForm(false)}
          onSukses={() => setTampilForm(false)}
        />
      )}

      {tugas.length === 0 ? (
        <PesanKosong teks="Belum ada tugas yang cocok." />
      ) : (
        <Kartu>
          <Tabel>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Judul</Th>
                <Th>Pemilik</Th>
                <Th>Tenggat</Th>
                <Th>Status</Th>
                <Th>Instruksi Disposisi</Th>
                <Th>Pemberi Disposisi</Th>
                <Th>Tautan Terkait</Th>
                <Th>Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {tugas.map((t) => {
                const berikut = statusBerikutnya(t.status);
                const bolehUbahStatus =
                  berikut !== null &&
                  (t.pemilik === user.nama ||
                    user.peran === 'admin_sistem');
                return (
                  <Baris key={t.id}>
                    <Td tebal>{t.id}</Td>
                    <Td>{t.judul}</Td>
                    <Td>{t.pemilik}</Td>
                    <Td>
                      {formatTanggal(t.tenggat)}
                      {lewatTenggat(t) && (
                        <span className="block text-xs font-semibold">
                          Lewat tenggat
                        </span>
                      )}
                    </Td>
                    <Td>
                      <StatusBadge status={t.status} />
                    </Td>
                    <Td>{t.instruksi ?? '-'}</Td>
                    <Td>{t.pemberiDisposisi ?? '-'}</Td>
                    <Td>{t.terkaitLabel ?? '-'}</Td>
                    <Td>
                      {bolehUbahStatus && berikut !== null ? (
                        <TombolSekunder
                          onClick={() => ubahStatus(t, berikut)}
                        >
                          Ubah ke {berikut}
                        </TombolSekunder>
                      ) : (
                        '-'
                      )}
                    </Td>
                  </Baris>
                );
              })}
            </tbody>
          </Tabel>
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

function FormTask({
  user,
  actions,
  onBatal,
  onSukses,
}: {
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  onBatal: () => void;
  onSukses: () => void;
}) {
  const [form, setForm] = useState<TaskInput>({
    pemilik: user.nama,
    judul: '',
    tenggat: '',
    terkaitId: undefined,
    terkaitLabel: undefined,
  });
  const [error, setError] = useState('');

  const simpan = () => {
    if (form.judul.trim() === '') {
      setError('Judul tugas wajib diisi.');
      return;
    }
    if (form.tenggat === '') {
      setError('Tenggat wajib diisi.');
      return;
    }
    const hasil = actions.tambahTask({
      pemilik: user.nama,
      judul: form.judul.trim(),
      tenggat: form.tenggat,
      terkaitId:
        form.terkaitId?.trim() === '' ? undefined : form.terkaitId?.trim(),
      terkaitLabel:
        form.terkaitLabel?.trim() === ''
          ? undefined
          : form.terkaitLabel?.trim(),
    });
    if (hasil !== null) {
      setError(hasil);
      return;
    }
    onSukses();
  };

  return (
    <Kartu>
      <JudulBagian>Tambah Tugas Pribadi</JudulBagian>
      <p className="mt-1 text-sm text-[#0d2569]/70">
        Pemilik tugas: {user.nama}
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Judul *</Label>
          <input
            className={inputClass}
            value={form.judul}
            onChange={(e) =>
              setForm((f) => ({ ...f, judul: e.target.value }))
            }
            placeholder="Judul tugas"
          />
        </div>
        <div>
          <Label>Tenggat *</Label>
          <input
            className={inputClass}
            type="date"
            value={form.tenggat}
            onChange={(e) =>
              setForm((f) => ({ ...f, tenggat: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>ID terkait (opsional)</Label>
          <input
            className={inputClass}
            value={form.terkaitId ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, terkaitId: e.target.value }))
            }
            placeholder="Contoh: PRS-01, PGJ-01, EVT-01"
          />
        </div>
        <div>
          <Label>Label terkait (opsional)</Label>
          <input
            className={inputClass}
            value={form.terkaitLabel ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, terkaitLabel: e.target.value }))
            }
            placeholder="Contoh: Prospek PRS-01"
          />
        </div>
      </div>

      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Simpan Tugas</TombolUtama>
        <TombolSekunder onClick={onBatal}>Batal</TombolSekunder>
      </div>
    </Kartu>
  );
}

function DaftarDisposisi({
  data,
  user,
  actions,
  cari,
}: {
  data: ModulProps['data'];
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  cari: string;
}) {
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [tampilForm, setTampilForm] = useState(false);
  const [pesan, setPesan] = useState('');
  const bolehBuat = bolehAksi(user.peran, 'tambahDisposisi');

  const kataKunci = cari.trim().toLowerCase();
  const disposisi = data.task.filter(
    (t) =>
      t.pemberiDisposisi !== undefined &&
      (filterStatus === 'Semua' || t.status === filterStatus) &&
      (kataKunci === '' ||
        `${t.id} ${t.judul} ${t.pemilik} ${t.pemberiDisposisi} ${
          t.instruksi ?? ''
        }`
          .toLowerCase()
          .includes(kataKunci)),
  );

  const tutup = (t: Task) => {
    const hasil = actions.tutupDisposisi(t);
    if (hasil !== null) {
      setPesan(hasil);
      return;
    }
    setPesan(`Disposisi ${t.id} ditutup.`);
  };

  return (
    <div className="space-y-4">
      <Peringatan teks="Disposisi tercatat end-to-end (Alur F): dibuat → dikerjakan → ditutup oleh pemberi; riwayat tersimpan dan dapat diaudit." />

      <div>
        <Label>Filter status</Label>
        <select
          className={`${inputClass} max-w-xs`}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="Semua">Semua</option>
          {MASTER_STATUS_TASK.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {bolehBuat && (
        <div>
          <TombolUtama onClick={() => setTampilForm(true)}>
            + Buat Disposisi
          </TombolUtama>
        </div>
      )}

      {tampilForm && (
        <FormDisposisi
          user={user}
          actions={actions}
          onBatal={() => setTampilForm(false)}
          onSukses={() => setTampilForm(false)}
        />
      )}

      {disposisi.length === 0 ? (
        <PesanKosong teks="Belum ada disposisi yang cocok." />
      ) : (
        <Kartu>
          <ul>
            {disposisi.map((t) => {
              const bolehTutup =
                t.status === 'Selesai' &&
                (t.pemberiDisposisi === user.nama ||
                  bolehAksi(user.peran, 'tutupDisposisi'));
              return (
                <ItemDaftar key={t.id}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-[#0d2569]">
                        {t.id} — {t.judul}
                      </p>
                      <p className="mt-1 text-sm text-[#0d2569]/70">
                        Penerima: {t.pemilik} · Tenggat:{' '}
                        {formatTanggal(t.tenggat)}
                        {lewatTenggat(t) ? ' (lewat tenggat)' : ''}
                        {t.terkaitLabel ? ` · Terkait: ${t.terkaitLabel}` : ''}
                      </p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>

                  {t.instruksi && (
                    <p className="mt-3 text-sm text-[#0d2569]">
                      <span className="font-semibold">Instruksi: </span>
                      {t.instruksi}
                    </p>
                  )}

                  <div className="mt-3">
                    <p className="text-xs font-semibold text-[#0d2569]/70">
                      Riwayat alur disposisi
                    </p>
                    <ol className="mt-1 list-inside list-decimal space-y-1 text-sm text-[#0d2569]">
                      <li>
                        ✓ Dibuat oleh {t.pemberiDisposisi}
                        {t.disposisiDari ? ` (${t.disposisiDari})` : ''}
                      </li>
                      <li>
                        {t.status === 'Belum Dikerjakan'
                          ? '• Menunggu dikerjakan oleh '
                          : '✓ Dikerjakan oleh '}
                        {t.pemilik}
                      </li>
                      <li>
                        {t.status === 'Selesai' || t.status === 'Ditutup'
                          ? '✓ Selesai'
                          : '• Belum selesai'}
                      </li>
                      <li>
                        {t.status === 'Ditutup'
                          ? '✓ Ditutup oleh pemberi disposisi'
                          : '• Belum ditutup'}
                      </li>
                    </ol>
                  </div>

                  {bolehTutup && (
                    <div className="mt-3">
                      <TombolUtama onClick={() => tutup(t)}>
                        Tutup Disposisi
                      </TombolUtama>
                    </div>
                  )}
                </ItemDaftar>
              );
            })}
          </ul>
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

function FormDisposisi({
  user,
  actions,
  onBatal,
  onSukses,
}: {
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  onBatal: () => void;
  onSukses: () => void;
}) {
  const [form, setForm] = useState<DisposisiInput>({
    pemberiDisposisi: user.nama,
    penerima: DUMMY_USERS[0].nama,
    judul: '',
    instruksi: '',
    tenggat: '',
    terkaitId: undefined,
    terkaitLabel: undefined,
  });
  const [error, setError] = useState('');

  const simpan = () => {
    if (form.penerima.trim() === '') {
      setError('Penerima disposisi wajib dipilih.');
      return;
    }
    if (form.judul.trim() === '') {
      setError('Judul disposisi wajib diisi.');
      return;
    }
    if (form.instruksi.trim() === '') {
      setError('Instruksi wajib diisi.');
      return;
    }
    if (form.tenggat === '') {
      setError('Tenggat wajib diisi.');
      return;
    }
    const hasil = actions.tambahDisposisi({
      pemberiDisposisi: user.nama,
      penerima: form.penerima,
      judul: form.judul.trim(),
      instruksi: form.instruksi.trim(),
      tenggat: form.tenggat,
      terkaitId:
        form.terkaitId?.trim() === '' ? undefined : form.terkaitId?.trim(),
      terkaitLabel:
        form.terkaitLabel?.trim() === ''
          ? undefined
          : form.terkaitLabel?.trim(),
    });
    if (hasil !== null) {
      setError(hasil);
      return;
    }
    onSukses();
  };

  return (
    <Kartu>
      <JudulBagian>Buat Disposisi</JudulBagian>
      <p className="mt-1 text-sm text-[#0d2569]/70">
        Pemberi disposisi: {user.nama}
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Penerima *</Label>
          <select
            className={inputClass}
            value={form.penerima}
            onChange={(e) =>
              setForm((f) => ({ ...f, penerima: e.target.value }))
            }
          >
            {DUMMY_USERS.map((u) => (
              <option key={u.nama} value={u.nama}>
                {u.nama} — {u.jabatan}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Tenggat *</Label>
          <input
            className={inputClass}
            type="date"
            value={form.tenggat}
            onChange={(e) =>
              setForm((f) => ({ ...f, tenggat: e.target.value }))
            }
          />
        </div>
        <div className="md:col-span-2">
          <Label>Judul *</Label>
          <input
            className={inputClass}
            value={form.judul}
            onChange={(e) =>
              setForm((f) => ({ ...f, judul: e.target.value }))
            }
            placeholder="Judul tugas disposisi"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Instruksi *</Label>
          <textarea
            className={`${inputClass} min-h-20`}
            value={form.instruksi}
            onChange={(e) =>
              setForm((f) => ({ ...f, instruksi: e.target.value }))
            }
            placeholder="Instruksi yang harus dikerjakan penerima"
          />
        </div>
        <div>
          <Label>ID terkait (opsional)</Label>
          <input
            className={inputClass}
            value={form.terkaitId ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, terkaitId: e.target.value }))
            }
            placeholder="Contoh: PRS-01, PJ-002"
          />
        </div>
        <div>
          <Label>Label terkait (opsional)</Label>
          <input
            className={inputClass}
            value={form.terkaitLabel ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, terkaitLabel: e.target.value }))
            }
            placeholder="Contoh: Prospek PRS-01"
          />
        </div>
      </div>

      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Simpan Disposisi</TombolUtama>
        <TombolSekunder onClick={onBatal}>Batal</TombolSekunder>
      </div>
    </Kartu>
  );
}

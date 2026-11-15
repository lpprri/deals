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
import { labelJabatan, labelStatusTask } from '../lib/labels';
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
          { id: 'tugas', label: 'My Tasks' },
          { id: 'disposisi', label: 'Disposition' },
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
    setPesan(`Task status changed to ${labelStatusTask(status)}.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div>
          <Label>Filter by status</Label>
          <select
            className={`${inputClass} max-w-xs`}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Semua">All</option>
            {MASTER_STATUS_TASK.map((s) => (
              <option key={s} value={s}>
                {labelStatusTask(s)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Task scope</Label>
          <select
            className={`${inputClass} max-w-xs`}
            value={cakupan}
            onChange={(e) =>
              setCakupan(e.target.value as 'saya' | 'semua')
            }
          >
            <option value="saya">My tasks</option>
            <option value="semua">All tasks</option>
          </select>
        </div>
      </div>

      {bolehKelolaTask && (
        <div>
          <TombolUtama onClick={() => setTampilForm(true)}>
            + Add Task
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
        <PesanKosong teks="No matching tasks yet." />
      ) : (
        <Kartu>
          <Tabel>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Title</Th>
                <Th>Owner</Th>
                <Th>Deadline</Th>
                <Th>Status</Th>
                <Th>Disposition Instruction</Th>
                <Th>Disposition Giver</Th>
                <Th>Related Link</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {tugas.map((t) => {
                const berikut = statusBerikutnya(t.status);
                // Model 1 role: Operator punya akses penuh atas tugas.
                const bolehUbahStatus = berikut !== null;
                return (
                  <Baris key={t.id}>
                    <Td tebal>{t.id}</Td>
                    <Td>{t.judul}</Td>
                    <Td>{t.pemilik}</Td>
                    <Td>
                      {formatTanggal(t.tenggat)}
                      {lewatTenggat(t) && (
                        <span className="block text-xs font-semibold">
                          Overdue
                        </span>
                      )}
                    </Td>
                    <Td>
                      <StatusBadge status={labelStatusTask(t.status)} />
                    </Td>
                    <Td>{t.instruksi ?? '-'}</Td>
                    <Td>{t.pemberiDisposisi ?? '-'}</Td>
                    <Td>{t.terkaitLabel ?? '-'}</Td>
                    <Td>
                      {bolehUbahStatus && berikut !== null ? (
                        <TombolSekunder
                          onClick={() => ubahStatus(t, berikut)}
                        >
                          Change to {labelStatusTask(berikut)}
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
      setError('Task title is required.');
      return;
    }
    if (form.tenggat === '') {
      setError('Deadline is required.');
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
      <JudulBagian>Add Personal Task</JudulBagian>
      <p className="mt-1 text-sm text-[#0d2569]/70">
        Task owner: {user.nama}
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Title *</Label>
          <input
            className={inputClass}
            value={form.judul}
            onChange={(e) =>
              setForm((f) => ({ ...f, judul: e.target.value }))
            }
            placeholder="Task title"
          />
        </div>
        <div>
          <Label>Deadline *</Label>
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
          <Label>Related ID (optional)</Label>
          <input
            className={inputClass}
            value={form.terkaitId ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, terkaitId: e.target.value }))
            }
            placeholder="Example: PRS-01, PGJ-01, EVT-01"
          />
        </div>
        <div>
          <Label>Related label (optional)</Label>
          <input
            className={inputClass}
            value={form.terkaitLabel ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, terkaitLabel: e.target.value }))
            }
            placeholder="Example: Prospect PRS-01"
          />
        </div>
      </div>

      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Save Task</TombolUtama>
        <TombolSekunder onClick={onBatal}>Cancel</TombolSekunder>
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
    setPesan(`Disposition ${t.id} closed.`);
  };

  return (
    <div className="space-y-4">
      <Peringatan teks="Dispositions are recorded end-to-end (Flow F): created → worked on → closed by the giver; history is saved and auditable." />

      <div>
        <Label>Filter by status</Label>
        <select
          className={`${inputClass} max-w-xs`}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="Semua">All</option>
          {MASTER_STATUS_TASK.map((s) => (
            <option key={s} value={s}>
              {labelStatusTask(s)}
            </option>
          ))}
        </select>
      </div>

      {bolehBuat && (
        <div>
          <TombolUtama onClick={() => setTampilForm(true)}>
            + Create Disposition
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
        <PesanKosong teks="No matching dispositions yet." />
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
                        Recipient: {t.pemilik} · Deadline:{' '}
                        {formatTanggal(t.tenggat)}
                        {lewatTenggat(t) ? ' (overdue)' : ''}
                        {t.terkaitLabel ? ` · Related: ${t.terkaitLabel}` : ''}
                      </p>
                    </div>
                    <StatusBadge status={labelStatusTask(t.status)} />
                  </div>

                  {t.instruksi && (
                    <p className="mt-3 text-sm text-[#0d2569]">
                      <span className="font-semibold">Instruction: </span>
                      {t.instruksi}
                    </p>
                  )}

                  <div className="mt-3">
                    <p className="text-xs font-semibold text-[#0d2569]/70">
                      Disposition flow history
                    </p>
                    <ol className="mt-1 list-inside list-decimal space-y-1 text-sm text-[#0d2569]">
                      <li>
                        ✓ Created by {t.pemberiDisposisi}
                        {t.disposisiDari ? ` (${t.disposisiDari})` : ''}
                      </li>
                      <li>
                        {t.status === 'Belum Dikerjakan'
                          ? '• Waiting to be worked on by '
                          : '✓ Worked on by '}
                        {t.pemilik}
                      </li>
                      <li>
                        {t.status === 'Selesai' || t.status === 'Ditutup'
                          ? '✓ Completed'
                          : '• Not yet completed'}
                      </li>
                      <li>
                        {t.status === 'Ditutup'
                          ? '✓ Closed by the disposition giver'
                          : '• Not yet closed'}
                      </li>
                    </ol>
                  </div>

                  {bolehTutup && (
                    <div className="mt-3">
                      <TombolUtama onClick={() => tutup(t)}>
                        Close Disposition
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
      setError('Disposition recipient must be selected.');
      return;
    }
    if (form.judul.trim() === '') {
      setError('Disposition title is required.');
      return;
    }
    if (form.instruksi.trim() === '') {
      setError('Instructions are required.');
      return;
    }
    if (form.tenggat === '') {
      setError('Deadline is required.');
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
      <JudulBagian>Create Disposition</JudulBagian>
      <p className="mt-1 text-sm text-[#0d2569]/70">
        Disposition giver: {user.nama}
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Recipient *</Label>
          <select
            className={inputClass}
            value={form.penerima}
            onChange={(e) =>
              setForm((f) => ({ ...f, penerima: e.target.value }))
            }
          >
            {DUMMY_USERS.map((u) => (
              <option key={u.nama} value={u.nama}>
                {u.nama} — {labelJabatan(u.jabatan)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Deadline *</Label>
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
          <Label>Title *</Label>
          <input
            className={inputClass}
            value={form.judul}
            onChange={(e) =>
              setForm((f) => ({ ...f, judul: e.target.value }))
            }
            placeholder="Disposition task title"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Instructions *</Label>
          <textarea
            className={`${inputClass} min-h-20`}
            value={form.instruksi}
            onChange={(e) =>
              setForm((f) => ({ ...f, instruksi: e.target.value }))
            }
            placeholder="Instructions the recipient must carry out"
          />
        </div>
        <div>
          <Label>Related ID (optional)</Label>
          <input
            className={inputClass}
            value={form.terkaitId ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, terkaitId: e.target.value }))
            }
            placeholder="Example: PRS-01, PJ-002"
          />
        </div>
        <div>
          <Label>Related label (optional)</Label>
          <input
            className={inputClass}
            value={form.terkaitLabel ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, terkaitLabel: e.target.value }))
            }
            placeholder="Example: Prospect PRS-01"
          />
        </div>
      </div>

      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Save Disposition</TombolUtama>
        <TombolSekunder onClick={onBatal}>Cancel</TombolSekunder>
      </div>
    </Kartu>
  );
}

// Modul Tugas ala Todoist (duplikasi Todoist, 2026-11-24; PRD v2.0 Bab 7.7 & 9.6).
// Studi: akun Todoist lpu.lpprripalembang@gmail.com, workspace RRI, tim LPP RRI.
// Tampilan dalam panel: Kotak Masuk, Hari Ini, Mendatang, Filter & Label,
// Laporan — sebagai sub-panel kiri (pola panel sub-navigasi Qontak di App.tsx).
// Semua label Bahasa Indonesia (keputusan 2026-11-23).
// Palet dasar RRI; merah/oranye/hijau hanya sebagai penanda semantik tanggal
// & prioritas seperti Todoist (revisi palet 2026-11-15).
// Data memakai koleksi Firestore `task` yang sudah ada — tidak ada koleksi
// atau aturan baru. Tampilan Disposisi (Alur F) dibuang dari panel ini
// 2026-11-24 atas instruksi pengguna; model data & tugas disposisi
// (TSK-04/TSK-05) tetap ada dan tampil sebagai tugas biasa.

import { useEffect, useMemo, useRef, useState } from 'react';
import { BarChart3, CalendarDays, CalendarRange, Inbox, Tags } from 'lucide-react';
import type { KomentarTugas, PrioritasTugas, StatusTask, SubTugas, Task } from '../lib/types';
import type { ModulProps, TaskInput, TaskPatch } from '../lib/store';
import { DUMMY_USERS } from '../lib/dummyUsers';
import { formatTanggal, hariIniIso } from '../lib/format';
import { bolehAksi } from '../lib/permissions';
import {
  BAGIAN_PROYEK,
  FILTER_TERSIMPAN,
  KELOMPOK_TUGAS_LABEL,
  LABEL_PRIORITAS,
  PROYEK_TODOIST,
  STATUS_TUGAS,
  akhirPekanIni,
  bacaLabelTambahan,
  cocokFilterTersimpan,
  cocokKataKunci,
  kelompokkanTugas,
  labelTanggal,
  prioritasTugas,
  progresSubTugas,
  proyekTugas,
  semuaLabel,
  seninDepan,
  simpanLabelTambahan,
  statusTanggal,
  tambahHari,
  terlambat,
  tugasSelesai,
  type KelompokTugas,
  type UrutanTugas,
} from '../lib/tugasTodoist';
import {
  JudulBagian,
  Kartu,
  Label,
  PesanKosong,
  TombolSekunder,
  TombolUtama,
  inputClass,
} from '../components/ui';

type Tampilan =
  | 'kotak-masuk'
  | 'hari-ini'
  | 'mendatang'
  | 'filter-label'
  | 'laporan';

/** Kelas warna tanggal ala Todoist: merah bila terlambat, hijau bila hari ini. */
function kelasTanggal(t: Task): string {
  const s = statusTanggal(t.tenggat);
  if (s === 'terlambat') return 'font-semibold text-red-600';
  if (s === 'hari-ini') return 'font-semibold text-green-700';
  return 'text-[#0d2569]/70';
}

/** Warna bendera prioritas ala Todoist (P1 merah, P2 oranye, P3 biru, P4 abu-abu). */
const WARNA_PRIORITAS: Record<PrioritasTugas, string> = {
  1: '#dc2626',
  2: '#ea580c',
  3: '#2573e2',
  4: '#94a3b8',
};

function BenderaPrioritas({ p }: { p: PrioritasTugas }) {
  return (
    <span
      title={LABEL_PRIORITAS[p]}
      className="inline-flex items-center gap-1 text-xs font-semibold"
      style={{ color: WARNA_PRIORITAS[p] }}
    >
      <span aria-hidden>⚑</span>
      {p !== 4 ? `P${p}` : 'P4'}
    </span>
  );
}

/** Badge status berbahasa Indonesia (nilai tersimpan sudah Indonesia). */
function BadgeStatus({ status }: { status: StatusTask }) {
  return (
    <span className="inline-flex items-center rounded bg-[#2573e2]/10 px-2 py-0.5 text-xs font-semibold text-[#0d2569]">
      {status}
    </span>
  );
}

function unduhCsv(namaFile: string, baris: string[][]) {
  const isi = baris
    .map((r) =>
      r
        .map((sel) => {
          const teks = String(sel);
          return /[",\n]/.test(teks)
            ? `"${teks.replace(/"/g, '""')}"`
            : teks;
        })
        .join(','),
    )
    .join('\n');
  const blob = new Blob([isi], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = namaFile;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Todo(props: ModulProps) {
  const { data, user, actions, cari } = props;
  const [tampilan, setTampilan] = useState<Tampilan>('hari-ini');
  const [cariLokal, setCariLokal] = useState('');
  const [cakupan, setCakupan] = useState<'saya' | 'semua'>('saya');
  const [layout, setLayout] = useState<'daftar' | 'board'>('daftar');
  const [kelompok, setKelompok] = useState<KelompokTugas>('proyek');
  const [urutan, setUrutan] = useState<UrutanTugas>('cerdas');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [filterPrioritas, setFilterPrioritas] = useState<string>('Semua');
  const [filterLabel, setFilterLabel] = useState<string>('Semua');
  const [filterPemilik, setFilterPemilik] = useState<string>('Semua');
  const [tampilOpsi, setTampilOpsi] = useState(false);
  const [quickAdd, setQuickAdd] = useState<{
    proyek?: string;
    tenggat?: string;
  } | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [pesan, setPesan] = useState('');
  const cariRef = useRef<HTMLInputElement>(null);
  const bolehKelolaTask = bolehAksi(user.peran, 'kelolaTask');

  const tugasDetail = detailId
    ? data.task.find((t) => t.id === detailId) ?? null
    : null;

  // Shortcut ala Todoist: Q = tambah tugas, Ctrl+K = fokus pencarian.
  // Diabaikan saat mengetik di input/textarea/select.
  useEffect(() => {
    const padaTombol = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const mengetik =
        el &&
        (el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.tagName === 'SELECT');
      if (e.key === 'Escape') {
        setQuickAdd(null);
        setDetailId(null);
        setTampilOpsi(false);
        return;
      }
      if (mengetik) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        cariRef.current?.focus();
        return;
      }
      if (e.key.toLowerCase() === 'q' && bolehKelolaTask) {
        e.preventDefault();
        setQuickAdd({});
      }
    };
    window.addEventListener('keydown', padaTombol);
    return () => window.removeEventListener('keydown', padaTombol);
  }, [bolehKelolaTask]);

  const kataKunci = `${cari} ${cariLokal}`.trim().toLowerCase();

  /** Tugas yang lolos cakupan + pencarian + semua filter toolbar. */
  const tugasTerlihat = useMemo(
    () =>
      data.task.filter(
        (t) =>
          (cakupan === 'semua' || t.pemilik === user.nama) &&
          (filterStatus === 'Semua' || t.status === filterStatus) &&
          (filterPrioritas === 'Semua' ||
            String(prioritasTugas(t)) === filterPrioritas) &&
          (filterLabel === 'Semua' ||
            (t.label ?? []).includes(filterLabel)) &&
          (filterPemilik === 'Semua' || t.pemilik === filterPemilik) &&
          cocokKataKunci(t, kataKunci),
      ),
    [
      data.task,
      cakupan,
      user.nama,
      filterStatus,
      filterPrioritas,
      filterLabel,
      filterPemilik,
      kataKunci,
    ],
  );

  const belumSelesai = tugasTerlihat.filter((t) => !tugasSelesai(t));
  const hariIni = hariIniIso();
  const jumlahHariIni = data.task.filter(
    (t) =>
      !tugasSelesai(t) &&
      t.tenggat !== '' &&
      t.tenggat <= hariIni &&
      (cakupan === 'semua' || t.pemilik === user.nama),
  ).length;
  const jumlahKotakMasuk = belumSelesai.length;
  const jumlahSelesai = data.task.filter(
    (t) =>
      tugasSelesai(t) && (cakupan === 'semua' || t.pemilik === user.nama),
  ).length;

  const pemilikUnik = [...new Set(data.task.map((t) => t.pemilik))].sort(
    (a, b) => a.localeCompare(b, 'id-ID'),
  );
  const labelDipakai = semuaLabel(data.task, bacaLabelTambahan());

  const bukaDetail = (t: Task) => setDetailId(t.id);
  const alihStatus = (t: Task, status: StatusTask) => {
    actions.ubahStatusTask(t, status);
    setPesan(
      status === 'Selesai'
        ? `Tugas "${t.judul}" selesai.`
        : `Status tugas diubah menjadi ${status}.`,
    );
  };

  const pilihTampilan = (id: Tampilan) => {
    setTampilan(id);
    setPesan('');
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-0">
      <SubPanelTugas
        tampilan={tampilan}
        onPilih={pilihTampilan}
        jumlahKotakMasuk={jumlahKotakMasuk}
        jumlahHariIni={jumlahHariIni}
        jumlahSelesai={jumlahSelesai}
      />
      <div className="min-w-0 flex-1 space-y-4 md:pl-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <JudulBagian>Tugas</JudulBagian>
            <p className="mt-1 text-sm text-[#0d2569]/70">Tugas perorangan.</p>
          </div>
          {tampilan === 'hari-ini' && (
            <p className="text-sm font-semibold text-[#0d2569]">
              {jumlahHariIni} tugas
            </p>
          )}
        </div>

        {tampilan !== 'laporan' && (
        <ToolbarTugas
          cariLokal={cariLokal}
          onCariLokal={setCariLokal}
          cariRef={cariRef}
          cakupan={cakupan}
          onCakupan={setCakupan}
          filterStatus={filterStatus}
          onFilterStatus={setFilterStatus}
          filterPrioritas={filterPrioritas}
          onFilterPrioritas={setFilterPrioritas}
          filterLabel={filterLabel}
          onFilterLabel={setFilterLabel}
          filterPemilik={filterPemilik}
          onFilterPemilik={setFilterPemilik}
          pemilikUnik={pemilikUnik}
          labelDipakai={labelDipakai}
          layout={layout}
          onLayout={setLayout}
          kelompok={kelompok}
          onKelompok={setKelompok}
          urutan={urutan}
          onUrutan={setUrutan}
          tampilOpsi={tampilOpsi}
          onTampilOpsi={setTampilOpsi}
          bolehKelolaTask={bolehKelolaTask}
          onTambah={() => setQuickAdd({})}
          sembunyikanOpsiTampilan={tampilan === 'filter-label'}
        />
      )}

      {tampilan === 'laporan' && (
        <ToolbarLaporan
          cakupan={cakupan}
          onCakupan={setCakupan}
          cariLokal={cariLokal}
          onCariLokal={setCariLokal}
          cariRef={cariRef}
        />
      )}

      {quickAdd !== null && bolehKelolaTask && (
        <QuickAdd
          user={user}
          actions={actions}
          proyekAwal={quickAdd.proyek}
          tenggatAwal={quickAdd.tenggat}
          labelDipakai={labelDipakai}
          onBatal={() => setQuickAdd(null)}
          onSukses={(judul) => {
            setQuickAdd(null);
            setPesan(`Tugas "${judul}" ditambahkan.`);
          }}
        />
      )}

      {tampilan === 'kotak-masuk' && (
        <DaftarTugas
          judul="Kotak Masuk"
          tugas={belumSelesai}
          kelompok={kelompok}
          urutan={urutan}
          layout={layout}
          user={user}
          actions={actions}
          onBukaDetail={bukaDetail}
          onAlihStatus={alihStatus}
          onTambah={(proyek) => setQuickAdd({ proyek })}
          kosong="Belum ada tugas yang cocok."
        />
      )}

      {tampilan === 'hari-ini' && (
        <DaftarTugas
          judul="Hari Ini"
          tugas={belumSelesai.filter(
            (t) => t.tenggat !== '' && t.tenggat <= hariIni,
          )}
          kelompok={kelompok}
          urutan={urutan}
          layout={layout}
          user={user}
          actions={actions}
          onBukaDetail={bukaDetail}
          onAlihStatus={alihStatus}
          onTambah={(proyek) => setQuickAdd({ proyek })}
          kosong="Tidak ada tugas untuk hari ini. Semua sudah selesai atau belum jatuh tempo."
        />
      )}

      {tampilan === 'mendatang' && (
        <Mendatang
          tugas={belumSelesai}
          user={user}
          actions={actions}
          onBukaDetail={bukaDetail}
          onAlihStatus={alihStatus}
          onTambah={(tenggat) => setQuickAdd({ tenggat })}
          onPesan={setPesan}
        />
      )}

      {tampilan === 'filter-label' && (
        <FilterLabel
          data={data}
          user={user}
          actions={actions}
          kataKunci={kataKunci}
          cakupan={cakupan}
          onBukaDetail={bukaDetail}
          onAlihStatus={alihStatus}
        />
      )}

      {tampilan === 'laporan' && (
        <Laporan
          tugas={data.task.filter(
            (t) =>
              tugasSelesai(t) &&
              (cakupan === 'semua' || t.pemilik === user.nama) &&
              cocokKataKunci(t, kataKunci),
          )}
          onBukaDetail={bukaDetail}
        />
      )}

      {pesan !== '' && (
        <p className="rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {pesan}
        </p>
      )}
      </div>

      {tugasDetail && (
        <DialogTugas
          tugas={tugasDetail}
          data={data}
          user={user}
          actions={actions}
          labelDipakai={labelDipakai}
          onTutup={() => setDetailId(null)}
          onPesan={setPesan}
          onHapus={() => setDetailId(null)}
        />
      )}
    </div>
  );
}

/** Sub-panel kiri tampilan Tugas — pola panel sub-navigasi Qontak di App.tsx
    (kolom w-60, border-r, judul kapital, item ikon + label), dengan hitungan
    tugas di kanan tiap item seperti sidebar Todoist. */
function SubPanelTugas(props: {
  tampilan: Tampilan;
  onPilih: (t: Tampilan) => void;
  jumlahKotakMasuk: number;
  jumlahHariIni: number;
  jumlahSelesai: number;
}) {
  const item: {
    id: Tampilan;
    label: string;
    jumlah?: number;
    Icon: typeof Inbox;
  }[] = [
    {
      id: 'kotak-masuk',
      label: 'Kotak Masuk',
      jumlah: props.jumlahKotakMasuk,
      Icon: Inbox,
    },
    {
      id: 'hari-ini',
      label: 'Hari Ini',
      jumlah: props.jumlahHariIni,
      Icon: CalendarDays,
    },
    { id: 'mendatang', label: 'Mendatang', Icon: CalendarRange },
    { id: 'filter-label', label: 'Filter & Label', Icon: Tags },
    {
      id: 'laporan',
      label: 'Laporan',
      jumlah: props.jumlahSelesai,
      Icon: BarChart3,
    },
  ];
  return (
    <div className="flex w-full shrink-0 flex-col border-b border-[#0d2569]/10 bg-white md:w-60 md:border-b-0 md:border-r">
      <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-4">
        <span className="text-xs font-bold uppercase tracking-wide text-[#0d2569]">
          Tugas
        </span>
      </div>
      <div className="scrollbar-tersembunyi min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {item.map(({ id, label, jumlah, Icon }) => {
          const aktif = id === props.tampilan;
          return (
            <button
              key={id}
              type="button"
              onClick={() => props.onPilih(id)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm ${
                aktif
                  ? 'bg-[#2573e2]/10 font-semibold text-[#2573e2]'
                  : 'text-[#0d2569]/70 hover:bg-[#2573e2]/5 hover:text-[#0d2569]'
              }`}
            >
              <Icon size={15} className="shrink-0" />
              {label}
              {jumlah !== undefined && (
                <span className="ml-auto text-xs font-semibold text-[#0d2569]/50">
                  {jumlah}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ToolbarTugas(props: {
  cariLokal: string;
  onCariLokal: (v: string) => void;
  cariRef: React.RefObject<HTMLInputElement | null>;
  cakupan: 'saya' | 'semua';
  onCakupan: (v: 'saya' | 'semua') => void;
  filterStatus: string;
  onFilterStatus: (v: string) => void;
  filterPrioritas: string;
  onFilterPrioritas: (v: string) => void;
  filterLabel: string;
  onFilterLabel: (v: string) => void;
  filterPemilik: string;
  onFilterPemilik: (v: string) => void;
  pemilikUnik: string[];
  labelDipakai: string[];
  layout: 'daftar' | 'board';
  onLayout: (v: 'daftar' | 'board') => void;
  kelompok: KelompokTugas;
  onKelompok: (v: KelompokTugas) => void;
  urutan: UrutanTugas;
  onUrutan: (v: UrutanTugas) => void;
  tampilOpsi: boolean;
  onTampilOpsi: (v: boolean) => void;
  bolehKelolaTask: boolean;
  onTambah: () => void;
  sembunyikanOpsiTampilan: boolean;
}) {
  const p = props;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={p.cariRef}
          className={`${inputClass} max-w-xs`}
          value={p.cariLokal}
          onChange={(e) => p.onCariLokal(e.target.value)}
          placeholder="Cari tugas… (Ctrl+K)"
        />
        <div>
          <select
            className={inputClass}
            value={p.cakupan}
            onChange={(e) => p.onCakupan(e.target.value as 'saya' | 'semua')}
            aria-label="Cakupan tugas"
          >
            <option value="saya">Tugas saya</option>
            <option value="semua">Semua tugas</option>
          </select>
        </div>
        <div>
          <select
            className={inputClass}
            value={p.filterStatus}
            onChange={(e) => p.onFilterStatus(e.target.value)}
            aria-label="Saring berdasarkan status"
          >
            <option value="Semua">Semua status</option>
            {STATUS_TUGAS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {!p.sembunyikanOpsiTampilan && (
          <TombolSekunder onClick={() => p.onTampilOpsi(!p.tampilOpsi)}>
            Tampilan: {p.layout === 'daftar' ? 'Daftar' : 'Board'}
          </TombolSekunder>
        )}
        {p.bolehKelolaTask && (
          <TombolUtama onClick={p.onTambah}>+ Tambah tugas</TombolUtama>
        )}
      </div>

      {p.tampilOpsi && !p.sembunyikanOpsiTampilan && (
        <Kartu>
          <p className="text-sm font-bold text-[#0d2569]">Opsi tampilan</p>
          <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>Tata letak</Label>
              <div className="flex gap-2">
                <TombolSekunder
                  onClick={() => p.onLayout('daftar')}
                  disabled={p.layout === 'daftar'}
                >
                  Daftar
                </TombolSekunder>
                <TombolSekunder
                  onClick={() => p.onLayout('board')}
                  disabled={p.layout === 'board'}
                >
                  Board
                </TombolSekunder>
              </div>
            </div>
            <div>
              <Label>Kelompokkan berdasarkan</Label>
              <select
                className={inputClass}
                value={p.kelompok}
                onChange={(e) => p.onKelompok(e.target.value as KelompokTugas)}
              >
                {(Object.keys(KELOMPOK_TUGAS_LABEL) as KelompokTugas[]).map(
                  (k) => (
                    <option key={k} value={k}>
                      {KELOMPOK_TUGAS_LABEL[k]}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <Label>Urutkan</Label>
              <select
                className={inputClass}
                value={p.urutan}
                onChange={(e) => p.onUrutan(e.target.value as UrutanTugas)}
              >
                <option value="cerdas">Cerdas</option>
                <option value="tanggal">Tanggal</option>
                <option value="prioritas">Prioritas</option>
                <option value="abjad">A–Z</option>
              </select>
            </div>
            <div className="space-y-3">
              <div>
                <Label>Penanggung jawab</Label>
                <select
                  className={inputClass}
                  value={p.filterPemilik}
                  onChange={(e) => p.onFilterPemilik(e.target.value)}
                >
                  <option value="Semua">Semua</option>
                  {p.pemilikUnik.map((nama) => (
                    <option key={nama} value={nama}>
                      {nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Prioritas</Label>
                <select
                  className={inputClass}
                  value={p.filterPrioritas}
                  onChange={(e) => p.onFilterPrioritas(e.target.value)}
                >
                  <option value="Semua">Semua</option>
                  <option value="1">Prioritas 1</option>
                  <option value="2">Prioritas 2</option>
                  <option value="3">Prioritas 3</option>
                  <option value="4">Tanpa prioritas</option>
                </select>
              </div>
              <div>
                <Label>Label</Label>
                <select
                  className={inputClass}
                  value={p.filterLabel}
                  onChange={(e) => p.onFilterLabel(e.target.value)}
                >
                  <option value="Semua">Semua</option>
                  {p.labelDipakai.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <TombolSekunder
              onClick={() => {
                p.onFilterStatus('Semua');
                p.onFilterPrioritas('Semua');
                p.onFilterLabel('Semua');
                p.onFilterPemilik('Semua');
                p.onKelompok('proyek');
                p.onUrutan('cerdas');
              }}
            >
              Atur ulang semua
            </TombolSekunder>
          </div>
        </Kartu>
      )}
    </div>
  );
}

function ToolbarLaporan(props: {
  cakupan: 'saya' | 'semua';
  onCakupan: (v: 'saya' | 'semua') => void;
  cariLokal: string;
  onCariLokal: (v: string) => void;
  cariRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={props.cariRef}
        className={`${inputClass} max-w-xs`}
        value={props.cariLokal}
        onChange={(e) => props.onCariLokal(e.target.value)}
        placeholder="Cari tugas selesai… (Ctrl+K)"
      />
      <select
        className={inputClass}
        value={props.cakupan}
        onChange={(e) =>
          props.onCakupan(e.target.value as 'saya' | 'semua')
        }
        aria-label="Cakupan tugas"
      >
        <option value="saya">Tugas saya</option>
        <option value="semua">Semua tugas</option>
      </select>
    </div>
  );
}

/** Quick Add ala Todoist: satu field nama + chip Proyek/Tanggal/Penanggung jawab. */
function QuickAdd(props: {
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  proyekAwal?: string;
  tenggatAwal?: string;
  labelDipakai: string[];
  onBatal: () => void;
  onSukses: (judul: string) => void;
}) {
  const { user, actions } = props;
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [tampilDeskripsi, setTampilDeskripsi] = useState(false);
  const [proyek, setProyek] = useState(props.proyekAwal ?? '');
  const [tenggat, setTenggat] = useState(
    props.tenggatAwal ?? hariIniIso(),
  );
  const [pemilik, setPemilik] = useState(user.nama);
  const [tampilLanjutan, setTampilLanjutan] = useState(false);
  const [prioritas, setPrioritas] = useState<PrioritasTugas>(4);
  const [label, setLabel] = useState<string[]>([]);
  const [pengulangan, setPengulangan] = useState('tidak');
  const [pengingat, setPengingat] = useState('');
  const [error, setError] = useState('');
  const inputJudul = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputJudul.current?.focus();
  }, []);

  const simpan = () => {
    if (judul.trim() === '') {
      setError('Judul tugas wajib diisi.');
      return;
    }
    if (tenggat === '') {
      setError('Tanggal wajib diisi (pilih Hari Ini bila belum pasti).');
      return;
    }
    const input: TaskInput = {
      pemilik,
      judul: judul.trim(),
      tenggat,
      deskripsi: deskripsi.trim() || undefined,
      proyek: proyek || undefined,
      prioritas,
      label: label.length > 0 ? label : undefined,
      pengulangan: pengulangan !== 'tidak' ? pengulangan : undefined,
      pengingat: pengingat || undefined,
    };
    const hasil = actions.tambahTask(input);
    if (hasil !== null) {
      setError(hasil);
      return;
    }
    props.onSukses(judul.trim());
  };

  const pilihTanggalCepat = (pilihan: 'hari-ini' | 'besok' | 'akhir-pekan' | 'minggu-depan') => {
    const hariIni = hariIniIso();
    if (pilihan === 'hari-ini') setTenggat(hariIni);
    if (pilihan === 'besok') setTenggat(tambahHari(hariIni, 1));
    if (pilihan === 'akhir-pekan') setTenggat(akhirPekanIni(hariIni));
    if (pilihan === 'minggu-depan') setTenggat(seninDepan(hariIni));
  };

  const pemilikPilihan = [...new Set([user.nama, ...DUMMY_USERS.map((u) => u.nama)])];

  return (
    <Kartu>
      <div className="space-y-3">
        <input
          ref={inputJudul}
          className={inputClass}
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') simpan();
          }}
          placeholder="Nama tugas"
        />
        {tampilDeskripsi ? (
          <textarea
            className={`${inputClass} min-h-16`}
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Deskripsi (opsional)"
          />
        ) : (
          <button
            type="button"
            className="text-sm font-semibold text-[#2573e2]"
            onClick={() => setTampilDeskripsi(true)}
          >
            + Deskripsi
          </button>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <select
            className={`${inputClass} w-auto`}
            value={proyek}
            onChange={(e) => setProyek(e.target.value)}
            aria-label="Proyek"
          >
            <option value="">Kotak Masuk</option>
            {PROYEK_TODOIST.map((p) => (
              <option key={p.nama} value={p.nama}>
                {p.nama}
              </option>
            ))}
          </select>
          <input
            className={`${inputClass} w-auto`}
            type="date"
            value={tenggat}
            onChange={(e) => setTenggat(e.target.value)}
            aria-label="Tanggal"
          />
          <select
            className={`${inputClass} w-auto`}
            value={pemilik}
            onChange={(e) => setPemilik(e.target.value)}
            aria-label="Penanggung jawab"
          >
            {pemilikPilihan.map((nama) => (
              <option key={nama} value={nama}>
                {nama}
              </option>
            ))}
          </select>
          <TombolSekunder onClick={() => setTampilLanjutan(!tampilLanjutan)}>
            {tampilLanjutan ? '− Opsi lain' : '+ Opsi lain'}
          </TombolSekunder>
        </div>
        <div className="flex flex-wrap gap-1">
          <TombolSekunder onClick={() => pilihTanggalCepat('hari-ini')}>
            Hari ini
          </TombolSekunder>
          <TombolSekunder onClick={() => pilihTanggalCepat('besok')}>
            Besok
          </TombolSekunder>
          <TombolSekunder onClick={() => pilihTanggalCepat('akhir-pekan')}>
            Akhir pekan ini
          </TombolSekunder>
          <TombolSekunder onClick={() => pilihTanggalCepat('minggu-depan')}>
            Minggu depan
          </TombolSekunder>
        </div>
        {tampilLanjutan && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Prioritas</Label>
              <div className="flex gap-2">
                {([1, 2, 3, 4] as PrioritasTugas[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrioritas(p)}
                    className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${
                      prioritas === p
                        ? 'border-[#2573e2] bg-[#2573e2]/10 text-[#0d2569]'
                        : 'border-[#2573e2]/30 text-[#0d2569]/70'
                    }`}
                  >
                    <BenderaPrioritas p={p} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Pengulangan</Label>
              <select
                className={inputClass}
                value={pengulangan}
                onChange={(e) => setPengulangan(e.target.value)}
              >
                <option value="tidak">Tidak berulang</option>
                <option value="harian">Setiap hari</option>
                <option value="mingguan">Setiap minggu</option>
                <option value="bulanan">Setiap bulan</option>
              </select>
            </div>
            <div>
              <Label>Pengingat</Label>
              <input
                className={inputClass}
                type="datetime-local"
                value={pengingat}
                onChange={(e) => setPengingat(e.target.value)}
              />
            </div>
            <div>
              <Label>Label</Label>
              <div className="flex flex-wrap gap-1">
                {props.labelDipakai.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() =>
                      setLabel((dulu) =>
                        dulu.includes(l)
                          ? dulu.filter((x) => x !== l)
                          : [...dulu, l],
                      )
                    }
                    className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                      label.includes(l)
                        ? 'border-[#2573e2] bg-[#2573e2]/10 text-[#0d2569]'
                        : 'border-[#2573e2]/30 text-[#0d2569]/70'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {error !== '' && (
          <p className="rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <TombolUtama onClick={simpan}>Tambah tugas</TombolUtama>
          <TombolSekunder onClick={props.onBatal}>Batal</TombolSekunder>
        </div>
      </div>
    </Kartu>
  );
}

/** Satu baris/kartu tugas ala Todoist. */
function KartuTugas(props: {
  tugas: Task;
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  onBukaDetail: (t: Task) => void;
  onAlihStatus: (t: Task, status: StatusTask) => void;
}) {
  const { tugas: t, actions, onBukaDetail, onAlihStatus } = props;
  const [tampilSub, setTampilSub] = useState(false);
  const selesai = tugasSelesai(t);
  const progres = progresSubTugas(t);

  const alihSelesai = () => {
    if (t.status === 'Ditutup') return;
    if (selesai) onAlihStatus(t, 'Berjalan');
    else onAlihStatus(t, 'Selesai');
  };

  const alihSub = (sub: SubTugas) => {
    actions.ubahTask(t, {
      subTugas: (t.subTugas ?? []).map((s) =>
        s.id === sub.id ? { ...s, selesai: !s.selesai } : s,
      ),
    });
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-md border border-[#2573e2]/20 bg-white px-3 py-2.5 ${
        selesai ? 'opacity-70' : ''
      }`}
    >
      <button
        type="button"
        onClick={alihSelesai}
        disabled={t.status === 'Ditutup'}
        title={
          t.status === 'Ditutup'
            ? 'Tugas sudah ditutup'
            : selesai
              ? 'Tandai belum selesai'
              : 'Tandai selesai'
        }
        aria-label={selesai ? 'Tandai belum selesai' : 'Tandai selesai'}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
          selesai
            ? 'border-[#2573e2] bg-[#2573e2] text-white'
            : 'border-[#0d2569]/40 text-transparent hover:border-[#2573e2] hover:text-[#2573e2]'
        }`}
      >
        ✓
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onBukaDetail(t)}
            className={`text-left text-sm font-semibold text-[#0d2569] hover:underline ${
              selesai ? 'line-through' : ''
            }`}
          >
            {t.judul}
          </button>
          <BenderaPrioritas p={prioritasTugas(t)} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className={kelasTanggal(t)}>{labelTanggal(t.tenggat)}</span>
          {t.pengulangan && t.pengulangan !== 'tidak' && (
            <span className="text-[#0d2569]/70" title="Berulang">
              ↻{' '}
              {t.pengulangan === 'harian'
                ? 'Setiap hari'
                : t.pengulangan === 'mingguan'
                  ? 'Setiap minggu'
                  : 'Setiap bulan'}
            </span>
          )}
          {progres.total > 0 && (
            <button
              type="button"
              className="font-semibold text-[#0d2569]/70 hover:underline"
              onClick={() => setTampilSub(!tampilSub)}
            >
              {tampilSub ? '▾' : '▸'} Sub-tugas {progres.selesai}/
              {progres.total}
            </button>
          )}
          {(t.komentar ?? []).length > 0 && (
            <span className="text-[#0d2569]/70">
              💬 {t.komentar?.length} komentar
            </span>
          )}
          <span className="text-[#0d2569]/70">
            #{proyekTugas(t)}
            {t.bagian ? ` / ${t.bagian}` : ''}
          </span>
          <span className="text-[#0d2569]/70">{t.pemilik}</span>
        </div>
        {(t.label ?? []).length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {(t.label ?? []).map((l) => (
              <span
                key={l}
                className="rounded-full bg-[#2573e2]/10 px-2 py-0.5 text-xs font-semibold text-[#0d2569]"
              >
                {l}
              </span>
            ))}
          </div>
        )}
        {tampilSub && progres.total > 0 && (
          <ul className="mt-2 space-y-1">
            {(t.subTugas ?? []).map((s) => (
              <li key={s.id} className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => alihSub(s)}
                  aria-label={s.selesai ? 'Batalkan sub-tugas' : 'Selesaikan sub-tugas'}
                  className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] font-bold ${
                    s.selesai
                      ? 'border-[#2573e2] bg-[#2573e2] text-white'
                      : 'border-[#0d2569]/40 text-transparent hover:border-[#2573e2]'
                  }`}
                >
                  ✓
                </button>
                <span
                  className={s.selesai ? 'text-[#0d2569]/50 line-through' : 'text-[#0d2569]'}
                >
                  {s.judul}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <BadgeStatus status={t.status} />
    </div>
  );
}

/** Daftar tugas yang dikelompokkan (Daftar/Board) untuk Kotak Masuk & Hari Ini. */
function DaftarTugas(props: {
  judul: string;
  tugas: Task[];
  kelompok: KelompokTugas;
  urutan: UrutanTugas;
  layout: 'daftar' | 'board';
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  onBukaDetail: (t: Task) => void;
  onAlihStatus: (t: Task, status: StatusTask) => void;
  onTambah: (proyek?: string) => void;
  kosong: string;
}) {
  const kelompokTugas = kelompokkanTugas(props.tugas, props.kelompok, props.urutan);
  if (props.tugas.length === 0) {
    return <PesanKosong teks={props.kosong} />;
  }
  if (props.layout === 'board') {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kelompokTugas.map((g) => (
          <div
            key={g.nama}
            className="rounded-md border border-[#2573e2]/20 bg-[#2573e2]/5 p-3"
          >
            <p className="mb-2 text-sm font-bold text-[#0d2569]">
              {g.nama} ({g.tugas.length})
            </p>
            <div className="space-y-2">
              {g.tugas.map((t) => (
                <KartuTugas
                  key={t.id}
                  tugas={t}
                  user={props.user}
                  actions={props.actions}
                  onBukaDetail={props.onBukaDetail}
                  onAlihStatus={props.onAlihStatus}
                />
              ))}
            </div>
            <button
              type="button"
              className="mt-2 text-sm font-semibold text-[#2573e2]"
              onClick={() =>
                props.onTambah(
                  props.kelompok === 'proyek' && g.nama !== 'Kotak Masuk'
                    ? g.nama
                    : undefined,
                )
              }
            >
              + Tambah tugas
            </button>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {kelompokTugas.map((g) => (
        <div key={g.nama}>
          <p className="mb-2 text-sm font-bold text-[#0d2569]">
            {g.nama} ({g.tugas.length})
          </p>
          <div className="space-y-2">
            {g.tugas.map((t) => (
              <KartuTugas
                key={t.id}
                tugas={t}
                user={props.user}
                actions={props.actions}
                onBukaDetail={props.onBukaDetail}
                onAlihStatus={props.onAlihStatus}
              />
            ))}
          </div>
          <button
            type="button"
            className="mt-2 text-sm font-semibold text-[#2573e2]"
            onClick={() =>
              props.onTambah(
                props.kelompok === 'proyek' && g.nama !== 'Kotak Masuk'
                  ? g.nama
                  : undefined,
              )
            }
          >
            + Tambah tugas ke {g.nama}
          </button>
        </div>
      ))}
    </div>
  );
}

/** Mendatang ala Todoist: board mingguan + kolom Terlambat + jadwalkan ulang massal. */
function Mendatang(props: {
  tugas: Task[];
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  onBukaDetail: (t: Task) => void;
  onAlihStatus: (t: Task, status: StatusTask) => void;
  onTambah: (tenggat: string) => void;
  onPesan: (pesan: string) => void;
}) {
  const hariIni = hariIniIso();
  const terlambatDaftar = props.tugas.filter((t) => terlambat(t, hariIni));
  const kolom: { label: string; tanggal: string | null; tugas: Task[] }[] = [
    { label: 'Terlambat', tanggal: null, tugas: terlambatDaftar },
  ];
  const namaHari = [
    'Minggu',
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
  ];
  for (let i = 0; i < 7; i++) {
    const tanggal = tambahHari(hariIni, i);
    const d = new Date(`${tanggal}T00:00:00`);
    const label =
      i === 0
        ? `Hari ini · ${formatTanggal(tanggal)}`
        : i === 1
          ? `Besok · ${formatTanggal(tanggal)}`
          : `${namaHari[d.getDay()]} · ${formatTanggal(tanggal)}`;
    kolom.push({
      label,
      tanggal,
      tugas: props.tugas.filter((t) => t.tenggat === tanggal),
    });
  }

  const jadwalkanUlangSemua = () => {
    for (const t of terlambatDaftar) {
      props.actions.ubahTask(t, { tenggat: hariIni });
    }
    props.onPesan(
      `${terlambatDaftar.length} tugas terlambat dijadwalkan ulang ke hari ini.`,
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#0d2569]/70">
        Tugas yang terlambat tetap terlihat di kolom Terlambat sampai
        dijadwalkan ulang — seperti Todoist.
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kolom.map((k) => (
          <div
            key={k.label}
            className="rounded-md border border-[#2573e2]/20 bg-[#2573e2]/5 p-3"
          >
            <p className="mb-2 text-sm font-bold text-[#0d2569]">
              {k.label} ({k.tugas.length})
            </p>
            {k.tanggal === null && k.tugas.length > 0 && (
              <div className="mb-2">
                <TombolSekunder onClick={jadwalkanUlangSemua}>
                  Jadwalkan ulang semua
                </TombolSekunder>
              </div>
            )}
            <div className="space-y-2">
              {k.tugas.map((t) => (
                <KartuTugas
                  key={t.id}
                  tugas={t}
                  user={props.user}
                  actions={props.actions}
                  onBukaDetail={props.onBukaDetail}
                  onAlihStatus={props.onAlihStatus}
                />
              ))}
            </div>
            {k.tanggal !== null && (
              <button
                type="button"
                className="mt-2 text-sm font-semibold text-[#2573e2]"
                onClick={() => props.onTambah(k.tanggal as string)}
              >
                + Tambah tugas
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Filter & Label ala Todoist: filter tersimpan + daftar label + tambah label. */
function FilterLabel(props: {
  data: ModulProps['data'];
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  kataKunci: string;
  cakupan: 'saya' | 'semua';
  onBukaDetail: (t: Task) => void;
  onAlihStatus: (t: Task, status: StatusTask) => void;
}) {
  const [pilihan, setPilihan] = useState<
    { jenis: 'filter'; id: string } | { jenis: 'label'; nama: string } | null
  >(null);
  const [labelBaru, setLabelBaru] = useState('');
  const [labelTambahan, setLabelTambahan] = useState<string[]>(() =>
    bacaLabelTambahan(),
  );
  const [pesanLabel, setPesanLabel] = useState('');

  const labelSemua = semuaLabel(props.data.task, labelTambahan);
  const hitungLabel = (nama: string) =>
    props.data.task.filter((t) => (t.label ?? []).includes(nama)).length;

  const tugasPilihan =
    pilihan === null
      ? []
      : props.data.task.filter(
          (t) =>
            (props.cakupan === 'semua' || t.pemilik === props.user.nama) &&
            cocokKataKunci(t, props.kataKunci) &&
            (pilihan.jenis === 'filter'
              ? cocokFilterTersimpan(t, pilihan.id, props.user.nama)
              : (t.label ?? []).includes(pilihan.nama)),
        );

  const tambahLabel = () => {
    const nama = labelBaru.trim();
    if (nama === '') {
      setPesanLabel('Nama label wajib diisi.');
      return;
    }
    if (labelSemua.includes(nama)) {
      setPesanLabel(`Label "${nama}" sudah ada.`);
      return;
    }
    const daftar = [...labelTambahan, nama];
    setLabelTambahan(daftar);
    simpanLabelTambahan(daftar);
    setLabelBaru('');
    setPesanLabel(`Label "${nama}" ditambahkan.`);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Kartu>
          <p className="text-sm font-bold text-[#0d2569]">Filter saya</p>
          <ul className="mt-2 space-y-1">
            {FILTER_TERSIMPAN.map((f) => {
              const jumlah = props.data.task.filter((t) =>
                cocokFilterTersimpan(t, f.id, props.user.nama),
              ).length;
              const aktif =
                pilihan?.jenis === 'filter' && pilihan.id === f.id;
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => setPilihan({ jenis: 'filter', id: f.id })}
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm font-semibold ${
                      aktif
                        ? 'bg-[#2573e2]/10 text-[#0d2569]'
                        : 'text-[#0d2569]/80 hover:bg-[#2573e2]/5'
                    }`}
                  >
                    {f.label} ({jumlah})
                  </button>
                </li>
              );
            })}
          </ul>
        </Kartu>
        <Kartu>
          <p className="text-sm font-bold text-[#0d2569]">Label</p>
          <ul className="mt-2 space-y-1">
            {labelSemua.map((l) => {
              const aktif =
                pilihan?.jenis === 'label' && pilihan.nama === l;
              return (
                <li key={l}>
                  <button
                    type="button"
                    onClick={() => setPilihan({ jenis: 'label', nama: l })}
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm font-semibold ${
                      aktif
                        ? 'bg-[#2573e2]/10 text-[#0d2569]'
                        : 'text-[#0d2569]/80 hover:bg-[#2573e2]/5'
                    }`}
                  >
                    {l} ({hitungLabel(l)})
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex gap-2">
            <input
              className={inputClass}
              value={labelBaru}
              onChange={(e) => setLabelBaru(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') tambahLabel();
              }}
              placeholder="Label baru"
            />
            <TombolSekunder onClick={tambahLabel}>
              + Tambah label
            </TombolSekunder>
          </div>
          {pesanLabel !== '' && (
            <p className="mt-2 text-sm font-semibold text-[#0d2569]">
              {pesanLabel}
            </p>
          )}
        </Kartu>
      </div>

      {pilihan === null ? (
        <PesanKosong teks="Pilih filter atau label untuk melihat tugasnya." />
      ) : tugasPilihan.length === 0 ? (
        <PesanKosong teks="Tidak ada tugas pada filter ini saat ini." />
      ) : (
        <div>
          <p className="mb-2 text-sm font-bold text-[#0d2569]">
            {pilihan.jenis === 'filter'
              ? FILTER_TERSIMPAN.find((f) => f.id === pilihan.id)?.label
              : pilihan.nama}{' '}
            ({tugasPilihan.length})
          </p>
          <div className="space-y-2">
            {tugasPilihan.map((t) => (
              <KartuTugas
                key={t.id}
                tugas={t}
                user={props.user}
                actions={props.actions}
                onBukaDetail={props.onBukaDetail}
                onAlihStatus={props.onAlihStatus}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Laporan ala Todoist: tugas selesai + ekspor CSV. */
function Laporan(props: {
  tugas: Task[];
  onBukaDetail: (t: Task) => void;
}) {
  const selesai = [...props.tugas].sort((a, b) =>
    (b.selesaiPada ?? b.tenggat).localeCompare(a.selesaiPada ?? a.tenggat),
  );
  const bulanIni = selesai.filter(
    (t) => (t.selesaiPada ?? '').slice(0, 7) === hariIniIso().slice(0, 7),
  ).length;

  const ekspor = () => {
    unduhCsv(`laporan-tugas-selesai-${hariIniIso()}.csv`, [
      ['ID', 'Judul', 'Pemilik', 'Proyek', 'Tenggat', 'Selesai pada', 'Status'],
      ...selesai.map((t) => [
        t.id,
        t.judul,
        t.pemilik,
        proyekTugas(t),
        t.tenggat,
        t.selesaiPada ?? '-',
        t.status,
      ]),
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-semibold text-[#0d2569]">
          {selesai.length} tugas selesai
          {bulanIni > 0 ? ` · ${bulanIni} selesai bulan ini` : ''}
        </p>
        <TombolSekunder onClick={ekspor} disabled={selesai.length === 0}>
          Ekspor CSV
        </TombolSekunder>
      </div>
      {selesai.length === 0 ? (
        <PesanKosong teks="Belum ada tugas yang selesai." />
      ) : (
        <Kartu>
          <ul className="divide-y divide-[#2573e2]/10">
            {selesai.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-2 py-2">
                <button
                  type="button"
                  onClick={() => props.onBukaDetail(t)}
                  className="text-left text-sm font-semibold text-[#0d2569] hover:underline"
                >
                  {t.judul}
                </button>
                <span className="text-xs text-[#0d2569]/70">
                  Selesai pada{' '}
                  {t.selesaiPada ? formatTanggal(t.selesaiPada) : '—'}
                </span>
                <span className="text-xs text-[#0d2569]/70">
                  #{proyekTugas(t)}
                </span>
                <span className="text-xs text-[#0d2569]/70">{t.pemilik}</span>
                <BadgeStatus status={t.status} />
              </li>
            ))}
          </ul>
        </Kartu>
      )}
    </div>
  );
}

/** Dialog detail tugas 2 kolom ala Todoist (konten kiri, properti kanan). */
function DialogTugas(props: {
  tugas: Task;
  data: ModulProps['data'];
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  labelDipakai: string[];
  onTutup: () => void;
  onPesan: (pesan: string) => void;
  onHapus: () => void;
}) {
  const { tugas: t, actions, user } = props;
  const [judul, setJudul] = useState(t.judul);
  const [deskripsi, setDeskripsi] = useState(t.deskripsi ?? '');
  const [subBaru, setSubBaru] = useState('');
  const [komentarBaru, setKomentarBaru] = useState('');
  const [tampilMenu, setTampilMenu] = useState(false);
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false);
  const [pesanLokal, setPesanLokal] = useState('');
  const progres = progresSubTugas(t);

  const ubah = (patch: TaskPatch) => actions.ubahTask(t, patch);
  const simpanJudul = () => {
    if (judul.trim() !== '' && judul.trim() !== t.judul)
      ubah({ judul: judul.trim() });
  };
  const simpanDeskripsi = () => {
    if (deskripsi.trim() !== (t.deskripsi ?? '')) {
      ubah({ deskripsi: deskripsi.trim() || undefined });
    }
  };

  const tambahSub = () => {
    if (subBaru.trim() === '') return;
    const sub: SubTugas = {
      id: `SUB-${Date.now()}`,
      judul: subBaru.trim(),
      selesai: false,
    };
    ubah({ subTugas: [...(t.subTugas ?? []), sub] });
    setSubBaru('');
  };

  const tambahKomentar = () => {
    if (komentarBaru.trim() === '') return;
    const komentar: KomentarTugas = {
      id: `KMT-${Date.now()}`,
      penulis: user.nama,
      isi: komentarBaru.trim(),
      waktu: new Date().toISOString(),
    };
    ubah({ komentar: [...(t.komentar ?? []), komentar] });
    setKomentarBaru('');
  };

  const alihLabel = (nama: string) => {
    const dulu = t.label ?? [];
    ubah({
      label: dulu.includes(nama)
        ? dulu.filter((x) => x !== nama)
        : [...dulu, nama],
    });
  };

  const pilihTanggalCepat = (
    pilihan: 'hari-ini' | 'besok' | 'akhir-pekan' | 'minggu-depan' | 'tanpa-tanggal',
  ) => {
    const hariIni = hariIniIso();
    if (pilihan === 'hari-ini') ubah({ tenggat: hariIni });
    if (pilihan === 'besok') ubah({ tenggat: tambahHari(hariIni, 1) });
    if (pilihan === 'akhir-pekan') ubah({ tenggat: akhirPekanIni(hariIni) });
    if (pilihan === 'minggu-depan') ubah({ tenggat: seninDepan(hariIni) });
    if (pilihan === 'tanpa-tanggal') ubah({ tenggat: '' });
  };

  const salinTautan = async () => {
    const tautan = `${window.location.href.split('#')[0]}#tugas-${t.id}`;
    try {
      await navigator.clipboard.writeText(tautan);
      setPesanLokal('Tautan tugas disalin.');
    } catch {
      setPesanLokal(`Tautan tugas: ${tautan}`);
    }
    setTampilMenu(false);
  };

  const hapus = () => {
    actions.hapusTask(t);
    props.onPesan(`Tugas "${t.judul}" dihapus.`);
    props.onHapus();
  };

  const aktivitas = (props.data.audit ?? [])
    .filter((a) => a.entitasId === t.id)
    .slice(0, 5);

  const bagianPilihan =
    t.proyek && BAGIAN_PROYEK[t.proyek] ? BAGIAN_PROYEK[t.proyek] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-md bg-white p-4 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#0d2569]/70">
            #{proyekTugas(t)}
            {t.bagian ? ` / ${t.bagian}` : ''} · {t.id}
          </p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <TombolSekunder onClick={() => setTampilMenu(!tampilMenu)}>
                ⋯
              </TombolSekunder>
              {tampilMenu && (
                <div className="absolute right-0 z-10 mt-1 w-56 rounded-md border border-[#2573e2]/20 bg-white p-1 shadow-md">
                  <button
                    type="button"
                    className="block w-full rounded px-2 py-1.5 text-left text-sm text-[#0d2569] hover:bg-[#2573e2]/5"
                    onClick={() => {
                      actions.duplikatTask(t);
                      props.onPesan(`Tugas "${t.judul}" diduplikat.`);
                      setTampilMenu(false);
                    }}
                  >
                    Duplikat
                  </button>
                  <button
                    type="button"
                    className="block w-full rounded px-2 py-1.5 text-left text-sm text-[#0d2569] hover:bg-[#2573e2]/5"
                    onClick={salinTautan}
                  >
                    Salin tautan tugas
                  </button>
                  <button
                    type="button"
                    className="block w-full rounded px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setKonfirmasiHapus(true);
                      setTampilMenu(false);
                    }}
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
            <TombolSekunder onClick={props.onTutup}>✕</TombolSekunder>
          </div>
        </div>

        <div className="mt-3 grid gap-6 md:grid-cols-[1fr_220px]">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() =>
                  tugasSelesai(t)
                    ? actions.ubahStatusTask(t, 'Berjalan')
                    : actions.ubahStatusTask(t, 'Selesai')
                }
                disabled={t.status === 'Ditutup'}
                aria-label={tugasSelesai(t) ? 'Tandai belum selesai' : 'Tandai selesai'}
                className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                  tugasSelesai(t)
                    ? 'border-[#2573e2] bg-[#2573e2] text-white'
                    : 'border-[#0d2569]/40 text-transparent hover:border-[#2573e2] hover:text-[#2573e2]'
                }`}
              >
                ✓
              </button>
              <input
                className="w-full border-b border-transparent text-base font-bold text-[#0d2569] outline-none focus:border-[#2573e2]"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                onBlur={simpanJudul}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                }}
              />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <textarea
                className={`${inputClass} min-h-20`}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                onBlur={simpanDeskripsi}
                placeholder="Tambahkan deskripsi…"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#0d2569]">
                  Sub-tugas {progres.total > 0 ? `${progres.selesai}/${progres.total}` : ''}
                </p>
              </div>
              <ul className="mt-2 space-y-1">
                {(t.subTugas ?? []).map((s) => (
                  <li key={s.id} className="flex items-center gap-2 text-sm">
                    <button
                      type="button"
                      onClick={() =>
                        ubah({
                          subTugas: (t.subTugas ?? []).map((x) =>
                            x.id === s.id ? { ...x, selesai: !x.selesai } : x,
                          ),
                        })
                      }
                      aria-label={s.selesai ? 'Batalkan sub-tugas' : 'Selesaikan sub-tugas'}
                      className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] font-bold ${
                        s.selesai
                          ? 'border-[#2573e2] bg-[#2573e2] text-white'
                          : 'border-[#0d2569]/40 text-transparent hover:border-[#2573e2]'
                      }`}
                    >
                      ✓
                    </button>
                    <span
                      className={
                        s.selesai
                          ? 'flex-1 text-[#0d2569]/50 line-through'
                          : 'flex-1 text-[#0d2569]'
                      }
                    >
                      {s.judul}
                    </span>
                    <button
                      type="button"
                      className="text-xs font-semibold text-[#0d2569]/50 hover:text-red-600"
                      onClick={() =>
                        ubah({
                          subTugas: (t.subTugas ?? []).filter((x) => x.id !== s.id),
                        })
                      }
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex gap-2">
                <input
                  className={inputClass}
                  value={subBaru}
                  onChange={(e) => setSubBaru(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') tambahSub();
                  }}
                  placeholder="Tambah sub-tugas"
                />
                <TombolSekunder onClick={tambahSub}>+ Tambah</TombolSekunder>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-[#0d2569]">Komentar</p>
              <ul className="mt-2 space-y-2">
                {(t.komentar ?? []).map((k) => (
                  <li
                    key={k.id}
                    className="rounded-md border border-[#2573e2]/20 px-3 py-2 text-sm"
                  >
                    <p className="font-semibold text-[#0d2569]">{k.penulis}</p>
                    <p className="text-[#0d2569]">{k.isi}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex gap-2">
                <input
                  className={inputClass}
                  value={komentarBaru}
                  onChange={(e) => setKomentarBaru(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') tambahKomentar();
                  }}
                  placeholder="Tambahkan komentar…"
                />
                <TombolSekunder onClick={tambahKomentar}>Kirim</TombolSekunder>
              </div>
            </div>

            {aktivitas.length > 0 && (
              <div>
                <p className="text-sm font-bold text-[#0d2569]">Aktivitas</p>
                <ul className="mt-1 space-y-1 text-sm text-[#0d2569]/70">
                  {aktivitas.map((a) => (
                    <li key={a.id}>
                      {a.aksi} — {a.pengguna}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-4 border-t border-[#2573e2]/20 pt-4 md:border-l md:border-t-0 md:pl-4 md:pt-0">
            <div>
              <Label>Status</Label>
              <div className="flex flex-wrap items-center gap-2">
                <BadgeStatus status={t.status} />
                {t.status === 'Belum Dikerjakan' && (
                  <TombolSekunder
                    onClick={() => actions.ubahStatusTask(t, 'Berjalan')}
                  >
                    Mulai
                  </TombolSekunder>
                )}
                {!tugasSelesai(t) && (
                  <TombolSekunder
                    onClick={() => actions.ubahStatusTask(t, 'Selesai')}
                  >
                    Selesai
                  </TombolSekunder>
                )}
                {t.status === 'Selesai' && (
                  <TombolSekunder
                    onClick={() => actions.ubahStatusTask(t, 'Berjalan')}
                  >
                    Kerjakan lagi
                  </TombolSekunder>
                )}
              </div>
            </div>
            <div>
              <Label>Proyek</Label>
              <select
                className={inputClass}
                value={t.proyek ?? ''}
                onChange={(e) =>
                  ubah({
                    proyek: e.target.value || undefined,
                    bagian: undefined,
                  })
                }
              >
                <option value="">Kotak Masuk</option>
                {PROYEK_TODOIST.map((p) => (
                  <option key={p.nama} value={p.nama}>
                    {p.nama}
                  </option>
                ))}
              </select>
            </div>
            {bagianPilihan.length > 0 && (
              <div>
                <Label>Bagian</Label>
                <select
                  className={inputClass}
                  value={t.bagian ?? ''}
                  onChange={(e) =>
                    ubah({ bagian: e.target.value || undefined })
                  }
                >
                  <option value="">Tanpa bagian</option>
                  {bagianPilihan.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <Label>Penanggung jawab</Label>
              <select
                className={inputClass}
                value={t.pemilik}
                onChange={(e) => ubah({ pemilik: e.target.value })}
              >
                {[...new Set([t.pemilik, ...DUMMY_USERS.map((u) => u.nama)])].map(
                  (nama) => (
                    <option key={nama} value={nama}>
                      {nama}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <Label>Tanggal</Label>
              <p className={`text-sm ${kelasTanggal(t)}`}>
                {labelTanggal(t.tenggat)}
              </p>
              <input
                className={`${inputClass} mt-1`}
                type="date"
                value={t.tenggat}
                onChange={(e) => ubah({ tenggat: e.target.value })}
              />
              <div className="mt-1 flex flex-wrap gap-1">
                <TombolSekunder onClick={() => pilihTanggalCepat('hari-ini')}>
                  Hari ini
                </TombolSekunder>
                <TombolSekunder onClick={() => pilihTanggalCepat('besok')}>
                  Besok
                </TombolSekunder>
                <TombolSekunder onClick={() => pilihTanggalCepat('akhir-pekan')}>
                  Akhir pekan ini
                </TombolSekunder>
                <TombolSekunder onClick={() => pilihTanggalCepat('minggu-depan')}>
                  Minggu depan
                </TombolSekunder>
                <TombolSekunder
                  onClick={() => pilihTanggalCepat('tanpa-tanggal')}
                >
                  Tanpa tanggal
                </TombolSekunder>
              </div>
            </div>
            <div>
              <Label>Pengulangan</Label>
              <select
                className={inputClass}
                value={t.pengulangan ?? 'tidak'}
                onChange={(e) =>
                  ubah({
                    pengulangan:
                      e.target.value === 'tidak' ? undefined : e.target.value,
                  })
                }
              >
                <option value="tidak">Tidak berulang</option>
                <option value="harian">Setiap hari</option>
                <option value="mingguan">Setiap minggu</option>
                <option value="bulanan">Setiap bulan</option>
              </select>
            </div>
            <div>
              <Label>Prioritas</Label>
              <div className="flex flex-wrap gap-1">
                {([1, 2, 3, 4] as PrioritasTugas[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      ubah({ prioritas: p === 4 ? undefined : p })
                    }
                    className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                      prioritasTugas(t) === p
                        ? 'border-[#2573e2] bg-[#2573e2]/10'
                        : 'border-[#2573e2]/30'
                    }`}
                  >
                    <BenderaPrioritas p={p} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Label</Label>
              <div className="flex flex-wrap gap-1">
                {props.labelDipakai.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => alihLabel(l)}
                    className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                      (t.label ?? []).includes(l)
                        ? 'border-[#2573e2] bg-[#2573e2]/10 text-[#0d2569]'
                        : 'border-[#2573e2]/30 text-[#0d2569]/70'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Pengingat</Label>
              <input
                className={inputClass}
                type="datetime-local"
                value={t.pengingat ?? ''}
                onChange={(e) => ubah({ pengingat: e.target.value || undefined })}
              />
              <p className="mt-1 text-xs text-[#0d2569]/60">
                Pengingat hanya penanda di tugas ini.
              </p>
            </div>
            {t.terkaitLabel && (
              <div>
                <Label>Terkait</Label>
                <p className="text-sm text-[#0d2569]">{t.terkaitLabel}</p>
              </div>
            )}
          </div>
        </div>

        {konfirmasiHapus && (
          <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm">
            <p className="font-semibold text-red-700">
              Hapus tugas &quot;{t.judul}&quot;?
            </p>
            <p className="text-red-700/80">
              Tugas dan sub-tugasnya dihapus permanen.
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white"
                onClick={hapus}
              >
                Ya, hapus
              </button>
              <TombolSekunder onClick={() => setKonfirmasiHapus(false)}>
                Batal
              </TombolSekunder>
            </div>
          </div>
        )}
        {pesanLokal !== '' && (
          <p className="mt-3 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
            {pesanLokal}
          </p>
        )}
      </div>
    </div>
  );
}

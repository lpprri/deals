// Modul Tugas ala Todoist (duplikasi Todoist, 2026-11-24; PRD v2.0 Bab 7.7 & 9.6).
// Studi: akun Todoist lpu.lpprripalembang@gmail.com, workspace RRI, tim LPP RRI.
// Instruksi pengguna 2026-11-24: "tiru persis ui yang digunakan oleh todoist"
// — panel ini MENIRU tampilan Todoist: sidebar Todoist di dalam panel,
// judul tampilan besar + hitungan, kartu tugas putih. Aksen merah Todoist
// diganti NAVY Deals #0D2569 pada 2026-11-24 atas instruksi
// pengguna ("semua merah jadi navy"); tanggal terlambat yang kini sewarna
// navy dibedakan dengan huruf TEBAL. Tetap palet RRI di panel ini.
// Semua label Bahasa Indonesia (keputusan 2026-11-23).
// Tampilan dalam panel: Kotak Masuk, Hari Ini, Mendatang, Filter & Label,
// Laporan. Data memakai koleksi Firestore `task` yang sudah ada — tidak ada
// koleksi atau aturan baru. Tampilan Disposisi (Alur F) dibuang dari panel
// ini 2026-11-24 atas instruksi pengguna; model data & tugas disposisi
// (TSK-04/TSK-05) tetap ada dan tampil sebagai tugas biasa.

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  FileSignature,
  FolderSearch,
  Hash,
  HeartHandshake,
  Home,
  Inbox,
  ScrollText,
  Search,
  Stamp,
  Tags,
} from 'lucide-react';
import type { KomentarTugas, PrioritasTugas, StatusTask, SubTugas, Task } from '../lib/types';
import type { ModulProps, TaskInput, TaskPatch } from '../lib/store';
import { DUMMY_USERS } from '../lib/dummyUsers';
import {
  formatTanggal,
  formatTanggalPendek,
  hariIniIso,
  parseTanggalId,
} from '../lib/format';
import { bolehAksi } from '../lib/permissions';
import {
  BAGIAN_PROYEK,
  FILTER_TERSIMPAN,
  KELOMPOK_TUGAS_LABEL,
  LABEL_PRIORITAS,
  PROYEK_TODOIST,
  akhirPekanIni,
  cocokFilterTersimpan,
  cocokKataKunci,
  kelompokkanTugas,
  labelTanggal,
  prioritasTugas,
  progresSubTugas,
  proyekTugas,
  seninDepan,
  statusTanggal,
  tambahHari,
  terlambat,
  tugasSelesai,
  type KelompokTugas,
  type UrutanTugas,
} from '../lib/tugasTodoist';
// Helper visual lokal ala Todoist — dipakai HANYA di panel ini supaya palet
// RRI di komponen bersama (components/ui) tidak berubah untuk panel lain.

/** Tombol utama navy Deals (#0D2569) — aksen Todoist yang diganti navy. */
function TombolNavy({
  children,
  onClick,
  type = 'button',
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="rounded-md bg-[#0D2569] px-4 py-2 text-sm font-semibold text-white hover:bg-[#081A4D] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/** Tombol netral berbingkai ala Todoist. */
function TombolNetral({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-[#e0e0e0] bg-white px-3 py-1.5 text-sm font-medium text-[#202020] hover:bg-[#f5f5f5] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/** Kartu putih ala Todoist (border tipis #e6e6e6, rounded-lg). */
function KartuPutih({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-[#e6e6e6] bg-white p-4 ${className}`}>
      {children}
    </div>
  );
}

/** Input netral ala Todoist. */
const inputTodo =
  'w-full rounded-md border border-[#e0e0e0] px-3 py-2 text-sm text-[#202020] outline-none focus:border-[#0D2569]';

/** Input tanggal teks DD/MM/YYYY (input date native menampilkan format
 * locale browser — mm/dd/yyyy di browser berbahasa Inggris — jadi tidak
 * dipakai di panel ini). Mengetik '24/11/2026' menyimpan ISO '2026-11-24';
 * teks tidak valid tidak mengubah nilai sampai diperbaiki/dikosongkan. */
function InputTanggal({
  value,
  onChange,
  ariaLabel,
  className,
}: {
  value: string;
  onChange: (iso: string) => void;
  ariaLabel?: string;
  className?: string;
}) {
  const [teks, setTeks] = useState(value ? formatTanggal(value) : '');
  useEffect(() => {
    setTeks(value ? formatTanggal(value) : '');
  }, [value]);
  return (
    <input
      className={className ?? `${inputTodo} w-auto`}
      value={teks}
      inputMode="numeric"
      placeholder="dd/mm/yyyy"
      aria-label={ariaLabel ?? 'Tanggal (dd/mm/yyyy)'}
      onChange={(e) => {
        const t = e.target.value;
        setTeks(t);
        if (t.trim() === '') {
          onChange('');
          return;
        }
        const iso = parseTanggalId(t);
        if (iso) onChange(iso);
      }}
      onBlur={() => setTeks(value ? formatTanggal(value) : '')}
    />
  );
}

/** Label kecil abu-abu ala Todoist. */
function LabelTodo({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1 block text-xs font-semibold text-[#808080]">
      {children}
    </label>
  );
}

/** Empty state ala Todoist: teks abu-abu rata tengah, tanpa border. */
function PesanKosongTodo({ teks }: { teks: string }) {
  return <p className="py-8 text-center text-sm text-[#808080]">{teks}</p>;
}

type Tampilan =
  | 'kotak-masuk'
  | 'hari-ini'
  | 'mendatang'
  | 'filter-label'
  | 'laporan';

/** Kelas warna tanggal: navy TEBAL bila terlambat (semua merah jadi navy
 * 2026-11-24 — tebal membedakannya dari teks biasa), hijau bila hari ini. */
function kelasTanggal(t: Task): string {
  const s = statusTanggal(t.tenggat);
  if (s === 'terlambat') return 'font-bold text-[#0D2569]';
  if (s === 'hari-ini') return 'font-medium text-[#058527]';
  return 'text-[#808080]';
}

/** Warna bendera prioritas (P1 navy, P2 oranye, P3 biru, P4 abu-abu). */
const WARNA_PRIORITAS: Record<PrioritasTugas, string> = {
  1: '#0D2569',
  2: '#eb8909',
  3: '#246fe0',
  4: '#a8a8a8',
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
    <span className="inline-flex items-center rounded bg-[#f5f5f5] px-2 py-0.5 text-xs font-medium text-[#808080]">
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
  const [cakupan, setCakupan] = useState<'saya' | 'semua'>('saya');
  const [layout, setLayout] = useState<'daftar' | 'board'>('board');
  const [kelompok, setKelompok] = useState<KelompokTugas>('proyek');
  const [urutan, setUrutan] = useState<UrutanTugas>('cerdas');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [filterPrioritas, setFilterPrioritas] = useState<string>('Semua');
  const [filterPemilik, setFilterPemilik] = useState<string>('Semua');
  /** Filter "Dibuat oleh" (Panel Tampilan); 'Semua' berarti tanpa filter. */
  const [filterDibuat, setFilterDibuat] = useState<string>('Semua');
  /** Toggle "Tugas selesai" (Panel Tampilan); mati berarti daftar hanya
   * menampilkan tugas yang belum selesai (perilaku lama). */
  const [tampilkanSelesai, setTampilkanSelesai] = useState(false);
  const [quickAdd, setQuickAdd] = useState<{
    proyek?: string;
    tenggat?: string;
  } | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [pesan, setPesan] = useState('');
  /** Proyek yang dipilih dari sidebar Todoist (null = semua proyek). */
  const [proyekPilihan, setProyekPilihan] = useState<string | null>(null);
  /** Pop-up Cari ala Todoist (command palette). */
  const [paletCari, setPaletCari] = useState(false);
  /** Shortcut "G lalu <huruf>" ala Todoist — menunggu huruf kedua. */
  const menungguG = useRef(false);
  const timerG = useRef<number | null>(null);
  const bolehKelolaTask = bolehAksi(user.peran, 'kelolaTask');

  const tugasDetail = detailId
    ? data.task.find((t) => t.id === detailId) ?? null
    : null;

  // Shortcut ala Todoist: Q = tambah tugas, Ctrl+K = buka pop-up Cari,
  // G lalu <huruf> = pindah tampilan (H Beranda, I Kotak Masuk, T Hari Ini,
  // U Mendatang, V Filter & Label, A Laporan). Diabaikan saat mengetik di
  // input/textarea/select (kecuali Esc yang selalu menutup dialog).
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
        setPaletCari(false);
        menungguG.current = false;
        return;
      }
      if (mengetik) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletCari(true);
        return;
      }
      if (menungguG.current) {
        menungguG.current = false;
        if (timerG.current !== null) {
          window.clearTimeout(timerG.current);
          timerG.current = null;
        }
        const tujuan: Record<string, () => void> = {
          h: () => props.onNavigasiModul?.('home'),
          i: () => pilihTampilan('kotak-masuk'),
          t: () => pilihTampilan('hari-ini'),
          u: () => pilihTampilan('mendatang'),
          v: () => pilihTampilan('filter-label'),
          a: () => pilihTampilan('laporan'),
        };
        const aksi = tujuan[e.key.toLowerCase()];
        if (aksi) {
          e.preventDefault();
          aksi();
        }
        return;
      }
      if (e.key.toLowerCase() === 'g') {
        menungguG.current = true;
        if (timerG.current !== null) window.clearTimeout(timerG.current);
        timerG.current = window.setTimeout(() => {
          menungguG.current = false;
          timerG.current = null;
        }, 1500);
        return;
      }
      if (e.key.toLowerCase() === 'q' && bolehKelolaTask) {
        e.preventDefault();
        setQuickAdd({});
      }
    };
    window.addEventListener('keydown', padaTombol);
    return () => {
      window.removeEventListener('keydown', padaTombol);
      if (timerG.current !== null) window.clearTimeout(timerG.current);
    };
  }, [bolehKelolaTask]);

  /** Pencarian memakai kata kunci global dari top bar (kotak pencarian
   * menetap di panel sudah dihapus 2026-11-24 — pencarian kini lewat
   * pop-up Cari). */
  const kataKunci = cari.trim().toLowerCase();

  /** Tugas yang lolos cakupan + pencarian + semua filter panel. */
  const tugasTerlihat = useMemo(
    () =>
      data.task.filter(
        (t) =>
          (cakupan === 'semua' || t.pemilik === user.nama) &&
          (filterStatus === 'Semua' || t.status === filterStatus) &&
          (filterPrioritas === 'Semua' ||
            String(prioritasTugas(t)) === filterPrioritas) &&
          (filterPemilik === 'Semua' || t.pemilik === filterPemilik) &&
          (filterDibuat === 'Semua' || t.dibuatOleh === filterDibuat) &&
          cocokKataKunci(t, kataKunci),
      ),
    [
      data.task,
      cakupan,
      user.nama,
      filterStatus,
      filterPrioritas,
      filterPemilik,
      filterDibuat,
      kataKunci,
    ],
  );

  const belumSelesai = tugasTerlihat.filter((t) => !tugasSelesai(t));
  /** Daftar yang ditampilkan: tanpa tugas selesai, kecuali toggle
   * "Tugas selesai" di Panel Tampilan dinyalakan. */
  const tugasDaftar = tampilkanSelesai ? tugasTerlihat : belumSelesai;
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

  /** Hitungan tugas belum selesai per proyek (untuk sidebar Todoist). */
  const jumlahProyek = useMemo(() => {
    const hitung = new Map<string, number>();
    for (const t of data.task) {
      if (tugasSelesai(t)) continue;
      if (cakupan === 'semua' || t.pemilik === user.nama) {
        const p = proyekTugas(t);
        hitung.set(p, (hitung.get(p) ?? 0) + 1);
      }
    }
    return hitung;
  }, [data.task, cakupan, user.nama]);

  /** Judul tampilan ala Todoist + hitungan subjudulnya. */
  const JUDUL_TAMPILAN: Record<Tampilan, string> = {
    'kotak-masuk': 'Kotak Masuk',
    'hari-ini': 'Hari Ini',
    mendatang: 'Mendatang',
    'filter-label': 'Filter & Label',
    laporan: 'Laporan',
  };
  const judulTampilan = proyekPilihan ?? JUDUL_TAMPILAN[tampilan];
  const jumlahJudul =
    proyekPilihan !== null
      ? (jumlahProyek.get(proyekPilihan) ?? 0)
      : tampilan === 'hari-ini'
        ? jumlahHariIni
        : tampilan === 'kotak-masuk'
          ? jumlahKotakMasuk
          : tampilan === 'laporan'
            ? jumlahSelesai
            : null;

  const pemilikUnik = [...new Set(data.task.map((t) => t.pemilik))].sort(
    (a, b) => a.localeCompare(b, 'id-ID'),
  );

  /** Nama pembuat tugas yang tercatat (untuk filter "Dibuat oleh"). */
  const dibuatUnik = [
    ...new Set(
      data.task.map((t) => t.dibuatOleh).filter((x): x is string => !!x),
    ),
  ].sort((a, b) => a.localeCompare(b, 'id-ID'));

  /** Kembalikan semua opsi Panel Tampilan ke default. */
  const resetTampilan = () => {
    setLayout('board');
    setTampilkanSelesai(false);
    setKelompok('proyek');
    setUrutan('cerdas');
    setFilterStatus('Semua');
    setFilterPrioritas('Semua');
    setFilterPemilik('Semua');
    setFilterDibuat('Semua');
  };

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
    setProyekPilihan(null);
    setPesan('');
    catatBaruDilihat({ tipe: 'tampilan', id, label: LABEL_TAMPILAN[id] });
  };

  /** Pilih proyek dari sidebar Todoist (membuka tampilan proyek itu). */
  const pilihProyek = (nama: string | null) => {
    setProyekPilihan(nama);
    setTampilan('kotak-masuk');
    setPesan('');
    if (nama !== null) {
      catatBaruDilihat({ tipe: 'proyek', id: nama, label: nama });
    }
  };

  return (
    <div className="flex flex-col bg-white md:flex-row">
      <SidebarTodoist
        tampilan={tampilan}
        onPilih={pilihTampilan}
        jumlahKotakMasuk={jumlahKotakMasuk}
        jumlahHariIni={jumlahHariIni}
        jumlahSelesai={jumlahSelesai}
        jumlahProyek={jumlahProyek}
        proyekAktif={proyekPilihan}
        onPilihProyek={pilihProyek}
        onTambah={() => setQuickAdd({})}
        onCari={() => setPaletCari(true)}
        bolehTambah={bolehKelolaTask}
      />
      <div className="min-w-0 flex-1 px-4 py-6 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-4">
        <div>
          <h2 className="text-[26px] font-bold leading-8 text-[#202020]">
            {judulTampilan}
          </h2>
          {jumlahJudul !== null && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[#808080]">
              <CheckCircle2 size={15} />
              {`${jumlahJudul} tugas`}
            </p>
          )}
        </div>

      {tampilan === 'laporan' && (
        <ToolbarLaporan
          cakupan={cakupan}
          onCakupan={setCakupan}
        />
      )}

      {paletCari && (
        <PaletPencarian
          tugas={data.task}
          onPilihTampilan={pilihTampilan}
          onPilihProyek={pilihProyek}
          onBeranda={() => props.onNavigasiModul?.('home')}
          onBukaDetail={bukaDetail}
          onTutup={() => setPaletCari(false)}
        />
      )}

      {quickAdd !== null && bolehKelolaTask && (
        <QuickAdd
          user={user}
          actions={actions}
          proyekAwal={quickAdd.proyek}
          tenggatAwal={quickAdd.tenggat}
          onBatal={() => setQuickAdd(null)}
          onSukses={(judul) => {
            setQuickAdd(null);
            setPesan(`Tugas "${judul}" ditambahkan.`);
          }}
        />
      )}

      {tampilan === 'kotak-masuk' && (
        <DaftarTugas
          judul={proyekPilihan ?? 'Kotak Masuk'}
          tugas={
            proyekPilihan
              ? tugasDaftar.filter((t) => proyekTugas(t) === proyekPilihan)
              : tugasDaftar
          }
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
          tugas={tugasDaftar.filter(
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
          tugas={tugasDaftar}
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
        <p className="rounded-md border border-[#e6e6e6] bg-[#f5f5f5] px-3 py-2 text-sm text-[#202020]">
          {pesan}
        </p>
      )}
        </div>
        {tampilan !== 'laporan' && tampilan !== 'filter-label' && (
          <PanelTampilan
            layout={layout}
            onLayout={setLayout}
            tampilkanSelesai={tampilkanSelesai}
            onTampilkanSelesai={setTampilkanSelesai}
            kelompok={kelompok}
            onKelompok={setKelompok}
            urutan={urutan}
            onUrutan={setUrutan}
            cakupan={cakupan}
            onCakupan={setCakupan}
            filterPemilik={filterPemilik}
            onFilterPemilik={setFilterPemilik}
            pemilikUnik={pemilikUnik}
            filterDibuat={filterDibuat}
            onFilterDibuat={setFilterDibuat}
            dibuatUnik={dibuatUnik}
            filterPrioritas={filterPrioritas}
            onFilterPrioritas={setFilterPrioritas}
            onReset={resetTampilan}
          />
        )}
        </div>
      </div>

      {tugasDetail && (
        <DialogTugas
          tugas={tugasDetail}
          data={data}
          user={user}
          actions={actions}
          onTutup={() => setDetailId(null)}
          onPesan={setPesan}
          onHapus={() => setDetailId(null)}
        />
      )}
    </div>
  );
}

/** "Baru saja dilihat" di pop-up Cari — tampilan/proyek terakhir dibuka,
 * disimpan di localStorage (mengikuti preseden label tambahan). */
type ItemBaruDilihat = {
  tipe: 'tampilan' | 'proyek';
  id: string;
  label: string;
};
const KUNCI_BARU_DILIHAT = 'rri-tugas-baru-saja-dilihat';
function bacaBaruDilihat(): ItemBaruDilihat[] {
  try {
    const mentah = localStorage.getItem(KUNCI_BARU_DILIHAT);
    if (!mentah) return [];
    const parsed = JSON.parse(mentah) as ItemBaruDilihat[];
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
}
function catatBaruDilihat(item: ItemBaruDilihat) {
  try {
    const daftar = bacaBaruDilihat().filter(
      (x) => !(x.tipe === item.tipe && x.id === item.id),
    );
    daftar.unshift(item);
    localStorage.setItem(
      KUNCI_BARU_DILIHAT,
      JSON.stringify(daftar.slice(0, 5)),
    );
  } catch {
    // localStorage tidak tersedia — "Baru saja dilihat" kosong saja.
  }
}
const LABEL_TAMPILAN: Record<Tampilan, string> = {
  'kotak-masuk': 'Kotak Masuk',
  'hari-ini': 'Hari Ini',
  mendatang: 'Mendatang',
  'filter-label': 'Filter & Label',
  laporan: 'Laporan',
};

/** Perintah navigasi pop-up Cari (ala Todoist: "G lalu <huruf>"). */
const PERINTAH_NAVIGASI: {
  id: string;
  label: string;
  petunjuk: string;
  Icon: typeof Inbox;
}[] = [
  { id: 'beranda', label: 'Ke Beranda', petunjuk: 'G lalu H', Icon: Home },
  {
    id: 'kotak-masuk',
    label: 'Ke Kotak Masuk',
    petunjuk: 'G lalu I',
    Icon: Inbox,
  },
  {
    id: 'hari-ini',
    label: 'Ke Hari Ini',
    petunjuk: 'G lalu T',
    Icon: CalendarDays,
  },
  {
    id: 'mendatang',
    label: 'Ke Mendatang',
    petunjuk: 'G lalu U',
    Icon: CalendarRange,
  },
  {
    id: 'filter-label',
    label: 'Ke Filter & Label',
    petunjuk: 'G lalu V',
    Icon: Tags,
  },
  {
    id: 'laporan',
    label: 'Ke Laporan',
    petunjuk: 'G lalu A',
    Icon: BarChart3,
  },
];

/** Pop-up Cari ala Todoist (command palette): dibuka dari item "Cari" di
 * sidebar kiri atau Ctrl+K, ditutup dengan Esc / klik latar. Mengetik
 * memfilter perintah navigasi dan tugas yang cocok; memilih tugas membuka
 * dialog detailnya. Semua label Bahasa Indonesia. */
function PaletPencarian(props: {
  tugas: Task[];
  onPilihTampilan: (t: Tampilan) => void;
  onPilihProyek: (nama: string) => void;
  onBeranda: () => void;
  onBukaDetail: (t: Task) => void;
  onTutup: () => void;
}) {
  const [query, setQuery] = useState('');
  const [pilih, setPilih] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [baruDilihat] = useState<ItemBaruDilihat[]>(() => bacaBaruDilihat());

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const kata = query.trim().toLowerCase();
  const navigasiCocok =
    kata === ''
      ? PERINTAH_NAVIGASI
      : PERINTAH_NAVIGASI.filter((p) =>
          p.label.toLowerCase().includes(kata),
        );
  const tugasCocok =
    kata === ''
      ? []
      : props.tugas.filter((t) => cocokKataKunci(t, kata)).slice(0, 8);

  type ButirPalet = { kunci: string; jalankan: () => void };
  const butir: ButirPalet[] = [];
  const jalankanNavigasi = (id: string) => {
    if (id === 'beranda') {
      props.onBeranda();
      return;
    }
    props.onPilihTampilan(id as Tampilan);
  };
  const baruDilihatButir: ButirPalet[] =
    kata === ''
      ? baruDilihat.map((b) => ({
          kunci: `baru-${b.tipe}-${b.id}`,
          jalankan: () =>
            b.tipe === 'proyek'
              ? props.onPilihProyek(b.id)
              : props.onPilihTampilan(b.id as Tampilan),
        }))
      : [];
  baruDilihatButir.forEach((b) => butir.push(b));
  navigasiCocok.forEach((p) =>
    butir.push({ kunci: `nav-${p.id}`, jalankan: () => jalankanNavigasi(p.id) }),
  );
  tugasCocok.forEach((t) =>
    butir.push({
      kunci: `tugas-${t.id}`,
      jalankan: () => props.onBukaDetail(t),
    }),
  );
  const pilihAman = butir.length === 0 ? 0 : Math.min(pilih, butir.length - 1);

  const padaTombolInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setPilih((i) => Math.min(i + 1, butir.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setPilih((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      butir[pilihAman]?.jalankan();
      props.onTutup();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-24"
      onClick={props.onTutup}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Cari atau ketik perintah"
      >
        <div className="flex items-center gap-3 border-b border-[#e6e6e6] px-4 py-3">
          <Search size={18} className="shrink-0 text-[#808080]" />
          <input
            ref={inputRef}
            className="min-w-0 flex-1 text-sm text-[#202020] outline-none placeholder:text-[#808080]"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPilih(0);
            }}
            onKeyDown={padaTombolInput}
            placeholder="Cari atau ketik perintah..."
            aria-label="Cari atau ketik perintah"
          />
          <kbd className="shrink-0 rounded border border-[#e0e0e0] bg-[#f5f5f5] px-1.5 py-0.5 text-xs text-[#808080]">
            Ctrl K
          </kbd>
        </div>
        <div className="max-h-96 overflow-y-auto py-2">
          {kata === '' && baruDilihat.length > 0 && (
            <div>
              <p className="px-4 pb-1 pt-1 text-xs font-semibold text-[#808080]">
                Baru saja dilihat
              </p>
              {baruDilihat.map((b, i) => {
                const idx = i;
                return (
                  <button
                    key={`baru-${b.tipe}-${b.id}`}
                    type="button"
                    onClick={() => {
                      butir[idx]?.jalankan();
                      props.onTutup();
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-[#202020] hover:bg-[#f5f5f5] ${
                      idx === pilihAman ? 'bg-[#f5f5f5]' : ''
                    }`}
                  >
                    {b.tipe === 'proyek' ? (
                      <Hash size={15} className="shrink-0 text-[#808080]" />
                    ) : (
                      <CalendarDays
                        size={15}
                        className="shrink-0 text-[#808080]"
                      />
                    )}
                    {b.label}
                  </button>
                );
              })}
            </div>
          )}
          <div>
            <p className="px-4 pb-1 pt-1 text-xs font-semibold text-[#808080]">
              Navigasi
            </p>
            {navigasiCocok.length === 0 && kata !== '' ? (
              <p className="px-4 py-2 text-sm text-[#808080]">
                Tidak ada perintah yang cocok.
              </p>
            ) : (
              navigasiCocok.map((p) => {
                const posisi =
                  butir.findIndex((b) => b.kunci === `nav-${p.id}`);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      jalankanNavigasi(p.id);
                      props.onTutup();
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-[#202020] hover:bg-[#f5f5f5] ${
                      posisi === pilihAman ? 'bg-[#f5f5f5]' : ''
                    }`}
                  >
                    <p.Icon size={15} className="shrink-0 text-[#808080]" />
                    {p.label}
                    <span className="ml-auto text-xs text-[#808080]">
                      {p.petunjuk}
                    </span>
                  </button>
                );
              })
            )}
          </div>
          {kata !== '' && (
            <div>
              <p className="px-4 pb-1 pt-1 text-xs font-semibold text-[#808080]">
                Tugas
              </p>
              {tugasCocok.length === 0 ? (
                <p className="px-4 py-2 text-sm text-[#808080]">
                  Tidak ada tugas yang cocok.
                </p>
              ) : (
                tugasCocok.map((t) => {
                  const posisi = butir.findIndex(
                    (b) => b.kunci === `tugas-${t.id}`,
                  );
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        props.onBukaDetail(t);
                        props.onTutup();
                      }}
                      className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-[#f5f5f5] ${
                        posisi === pilihAman ? 'bg-[#f5f5f5]' : ''
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate text-[#202020]">
                        {t.judul}
                      </span>
                      <span className="shrink-0 text-xs text-[#808080]">
                        {labelTanggal(t.tenggat)}
                      </span>
                      <span className="shrink-0 text-xs text-[#808080]">
                        # {proyekTugas(t)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Ikon "Proyek Saya" = ikon modul yang sama di sidebar admin (App.tsx
 * MODULES): PNBP FileSignature, Nota Kesepahaman ScrollText, Dukungan
 * Layanan HeartHandshake, Media Partner Stamp. Catatan: pengguna menyebut
 * ikon Media Partner "mikrofon", tapi komponen yang dipakai sidebar admin
 * adalah Stamp — dipakai ulang apa adanya supaya sama persis. */
const IKON_PROYEK: Record<string, typeof Inbox> = {
  PNBP: FileSignature,
  'Nota Kesepahaman': ScrollText,
  'Dukungan Layanan': HeartHandshake,
  'Media Partner': Stamp,
};

/** Sidebar Todoist di dalam panel (bukan lagi sub-panel ala Laporan):
 * tombol tambah tugas navy di atas, item Cari, navigasi tampilan dengan
 * hitungan (hitungan Hari Ini navy seperti aksen Todoist), lalu bagian
 * "Proyek Saya" + proyek workspace LPP RRI dengan hitungan, dan
 * "Jelajahi semua proyek". Lebar 280px seperti sidebar Todoist; item aktif
 * berlatar tint navy dengan teks navy. */
function SidebarTodoist(props: {
  tampilan: Tampilan;
  onPilih: (t: Tampilan) => void;
  jumlahKotakMasuk: number;
  jumlahHariIni: number;
  jumlahSelesai: number;
  jumlahProyek: Map<string, number>;
  proyekAktif: string | null;
  onPilihProyek: (nama: string | null) => void;
  onTambah: () => void;
  onCari: () => void;
  bolehTambah: boolean;
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
    <div className="flex w-full shrink-0 flex-col bg-white px-2 pb-4 pt-4 md:w-[280px] md:border-r md:border-[#e6e6e6]">
      <button
        type="button"
        onClick={props.onCari}
        className="mt-1 flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm text-[#202020] hover:bg-black/[0.04]"
      >
        <Search size={16} className="shrink-0 text-[#808080]" />
        Cari
      </button>
      <div className="mt-2 space-y-0.5">
        {item.map(({ id, label, jumlah, Icon }) => {
          const aktif = id === props.tampilan && props.proyekAktif === null;
          return (
            <button
              key={id}
              type="button"
              onClick={() => props.onPilih(id)}
              className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm ${
                aktif
                  ? 'bg-[#0D2569]/10 font-semibold text-[#0D2569]'
                  : 'text-[#202020] hover:bg-black/[0.04]'
              }`}
            >
              <Icon
                size={16}
                className={`shrink-0 ${aktif ? 'text-[#0D2569]' : 'text-[#808080]'}`}
              />
              {label}
              {jumlah !== undefined && (
                <span
                  className={`ml-auto text-xs font-semibold ${
                    id === 'hari-ini' ? 'text-[#0D2569]' : 'text-[#808080]'
                  }`}
                >
                  {jumlah}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-5 px-2 text-xs font-bold uppercase tracking-wide text-[#808080]">
        Proyek Saya
      </p>
      <div className="mt-1 space-y-0.5">
        {PROYEK_TODOIST.map((p) => {
          const jumlah = props.jumlahProyek.get(p.nama) ?? 0;
          const aktif = props.proyekAktif === p.nama;
          const IkonProyek = IKON_PROYEK[p.nama] ?? Hash;
          return (
            <button
              key={p.nama}
              type="button"
              onClick={() => props.onPilihProyek(p.nama)}
              className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm ${
                aktif
                  ? 'bg-[#0D2569]/10 font-semibold text-[#0D2569]'
                  : 'text-[#202020] hover:bg-black/[0.04]'
              }`}
            >
              <IkonProyek size={15} className="shrink-0 text-[#808080]" />
              {p.nama}
              <span className="ml-auto text-xs text-[#808080]">{jumlah}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => props.onPilihProyek(null)}
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm text-[#202020] hover:bg-black/[0.04]"
        >
          <FolderSearch size={15} className="shrink-0 text-[#808080]" />
          Jelajahi semua proyek
        </button>
      </div>
    </div>
  );
}


/** Panel Tampilan di sisi kanan area konten (Display ala Todoist):
 * menggantikan kontrol toolbar yang dihapus — Layout, toggle tugas
 * selesai, pengelompokan/pengurutan, filter. Kalender/Tabel belum
 * dibangun, ditampilkan nonaktif dengan tanda "segera". */
function PanelTampilan(props: {
  layout: 'daftar' | 'board';
  onLayout: (v: 'daftar' | 'board') => void;
  tampilkanSelesai: boolean;
  onTampilkanSelesai: (v: boolean) => void;
  kelompok: KelompokTugas;
  onKelompok: (v: KelompokTugas) => void;
  urutan: UrutanTugas;
  onUrutan: (v: UrutanTugas) => void;
  /** Cakupan tugas (menggantikan dropdown "Tugas saya" di toolbar yang
   * dihapus): 'saya' = hanya tugas operator yang login, 'semua' = semua. */
  cakupan: 'saya' | 'semua';
  onCakupan: (v: 'saya' | 'semua') => void;
  filterPemilik: string;
  onFilterPemilik: (v: string) => void;
  pemilikUnik: string[];
  filterDibuat: string;
  onFilterDibuat: (v: string) => void;
  dibuatUnik: string[];
  filterPrioritas: string;
  onFilterPrioritas: (v: string) => void;
  onReset: () => void;
}) {
  const p = props;
  return (
    <aside className="w-full shrink-0 rounded-lg border border-[#e6e6e6] bg-white p-4 lg:w-[280px]">
      <p className="text-sm font-bold text-[#202020]">Layout</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <TombolNetral
          onClick={() => p.onLayout('daftar')}
          disabled={p.layout === 'daftar'}
        >
          Daftar
        </TombolNetral>
        <TombolNetral
          onClick={() => p.onLayout('board')}
          disabled={p.layout === 'board'}
        >
          Board
        </TombolNetral>
        <TombolNetral disabled>
          Kalender{' '}
          <span className="rounded-full bg-[#f5f5f5] px-1.5 py-0.5 text-[11px] font-medium text-[#808080]">
            segera
          </span>
        </TombolNetral>
        <TombolNetral disabled>
          Tabel{' '}
          <span className="rounded-full bg-[#f5f5f5] px-1.5 py-0.5 text-[11px] font-medium text-[#808080]">
            segera
          </span>
        </TombolNetral>
      </div>
      <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-[#202020]">
        <input
          type="checkbox"
          checked={p.tampilkanSelesai}
          onChange={(e) => p.onTampilkanSelesai(e.target.checked)}
          className="accent-[#0D2569]"
        />
        Tugas selesai
      </label>
      <p className="mt-5 text-sm font-bold text-[#202020]">Sort</p>
      <div className="mt-2 space-y-3">
        <div>
          <LabelTodo>Kelompokkan</LabelTodo>
          <select
            className={inputTodo}
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
          <LabelTodo>Urutkan</LabelTodo>
          <select
            className={inputTodo}
            value={p.urutan}
            onChange={(e) => p.onUrutan(e.target.value as UrutanTugas)}
          >
            <option value="cerdas">Cerdas</option>
            <option value="tanggal">Tanggal</option>
            <option value="prioritas">Prioritas</option>
            <option value="abjad">A–Z</option>
          </select>
        </div>
      </div>
      <p className="mt-5 text-sm font-bold text-[#202020]">Filter</p>
      <div className="mt-2 space-y-3">
        <div>
          <LabelTodo>Cakupan</LabelTodo>
          <select
            className={inputTodo}
            value={p.cakupan}
            onChange={(e) => p.onCakupan(e.target.value as 'saya' | 'semua')}
            aria-label="Cakupan tugas"
          >
            <option value="saya">Tugas saya</option>
            <option value="semua">Semua tugas</option>
          </select>
        </div>
        <div>
          <LabelTodo>Penanggung jawab</LabelTodo>
          <select
            className={inputTodo}
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
          <LabelTodo>Dibuat oleh</LabelTodo>
          <select
            className={inputTodo}
            value={p.filterDibuat}
            onChange={(e) => p.onFilterDibuat(e.target.value)}
          >
            <option value="Semua">Semua</option>
            {p.dibuatUnik.map((nama) => (
              <option key={nama} value={nama}>
                {nama}
              </option>
            ))}
          </select>
        </div>
        <div>
          <LabelTodo>Prioritas</LabelTodo>
          <select
            className={inputTodo}
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
      </div>
      <div className="mt-5">
        <TombolNetral onClick={p.onReset}>Reset semua</TombolNetral>
      </div>
    </aside>
  );
}

function ToolbarLaporan(props: {
  cakupan: 'saya' | 'semua';
  onCakupan: (v: 'saya' | 'semua') => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className={inputTodo}
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
      dibuatOleh: user.nama,
      judul: judul.trim(),
      tenggat,
      deskripsi: deskripsi.trim() || undefined,
      proyek: proyek || undefined,
      prioritas,
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

  // Modal melayang terpusat ala Todoist (overlay + kartu dialog di tengah
  // layar); klik latar menutup, Esc juga menutup (shortcut di komponen Todo).
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
      onClick={props.onBatal}
    >
      <div
        className="mt-16 w-full max-w-[560px] rounded-xl border border-[#e6e6e6] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="space-y-3">
        <input
          ref={inputJudul}
          className="w-full border-0 px-0 py-1 text-base font-medium text-[#202020] outline-none placeholder:text-[#a8a8a8]" 
          value={judul}
          onChange={(e) => setJudul(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') simpan();
          }}
          placeholder="Nama tugas"
        />
        {tampilDeskripsi ? (
          <textarea
            className="w-full min-h-16 border-0 px-0 py-1 text-sm text-[#202020] outline-none placeholder:text-[#a8a8a8]" 
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Deskripsi (opsional)"
          />
        ) : (
          <button
            type="button"
            className="text-sm font-semibold text-[#0D2569]"
            onClick={() => setTampilDeskripsi(true)}
          >
            + Deskripsi
          </button>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <select
            className={`${inputTodo} w-auto`}
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
          <InputTanggal
            value={tenggat}
            onChange={setTenggat}
            ariaLabel="Tanggal (dd/mm/yyyy)"
          />
          <select
            className={`${inputTodo} w-auto`}
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
          <TombolNetral onClick={() => setTampilLanjutan(!tampilLanjutan)}>
            {tampilLanjutan ? '− Opsi lain' : '+ Opsi lain'}
          </TombolNetral>
        </div>
        <div className="flex flex-wrap gap-1">
          <TombolNetral onClick={() => pilihTanggalCepat('hari-ini')}>
            Hari ini
          </TombolNetral>
          <TombolNetral onClick={() => pilihTanggalCepat('besok')}>
            Besok
          </TombolNetral>
          <TombolNetral onClick={() => pilihTanggalCepat('akhir-pekan')}>
            Akhir pekan ini
          </TombolNetral>
          <TombolNetral onClick={() => pilihTanggalCepat('minggu-depan')}>
            Minggu depan
          </TombolNetral>
        </div>
        {tampilLanjutan && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <LabelTodo>Prioritas</LabelTodo>
              <div className="flex gap-2">
                {([1, 2, 3, 4] as PrioritasTugas[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrioritas(p)}
                    className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${
                      prioritas === p
                        ? 'border-[#0D2569] bg-[#f5f5f5] text-[#202020]'
                        : 'border-[#e0e0e0] text-[#808080]'
                    }`}
                  >
                    <BenderaPrioritas p={p} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <LabelTodo>Pengulangan</LabelTodo>
              <select
                className={inputTodo}
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
              <LabelTodo>Pengingat</LabelTodo>
              <input
                className={inputTodo}
                type="datetime-local"
                value={pengingat}
                onChange={(e) => setPengingat(e.target.value)}
              />
            </div>
          </div>
        )}
        {error !== '' && (
          <p className="rounded-md border border-[#0D2569]/40 bg-[#0D2569]/5 px-3 py-2 text-sm font-medium text-[#0D2569]">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <TombolNetral onClick={props.onBatal}>Batal</TombolNetral>
          <TombolNavy onClick={simpan}>Tambah tugas</TombolNavy>
        </div>
      </div>
      </div>
    </div>
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
      className={`flex items-start gap-3 rounded-lg border border-[#e6e6e6] bg-white px-3 py-3 hover:border-[#d9d9d9] ${
        selesai ? 'opacity-60' : ''
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
        className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
          selesai
            ? 'border-[#0D2569] bg-[#0D2569] text-white'
            : 'border-[#999] text-transparent hover:border-[#0D2569] hover:text-[#0D2569]'
        }`}
      >
        ✓
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onBukaDetail(t)}
            className={`text-left text-sm text-[#202020] hover:underline ${
              selesai ? 'text-[#808080] line-through' : ''
            }`}
          >
            {t.judul}
          </button>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className={kelasTanggal(t)}>{labelTanggal(t.tenggat)}</span>
          {t.pengulangan && t.pengulangan !== 'tidak' && (
            <span className="text-[#808080]" title="Berulang">
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
              className="font-semibold text-[#808080] hover:underline"
              onClick={() => setTampilSub(!tampilSub)}
            >
              {tampilSub ? '▾' : '▸'} Sub-tugas {progres.selesai}/
              {progres.total}
            </button>
          )}
          {(t.komentar ?? []).length > 0 && (
            <span className="text-[#808080]">
              💬 {t.komentar?.length} komentar
            </span>
          )}
          <span className="text-[#808080]">
            #{proyekTugas(t)}
            {t.bagian ? ` / ${t.bagian}` : ''}
          </span>
        </div>
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
                      ? 'border-[#0D2569] bg-[#0D2569] text-white'
                      : 'border-[#999] text-transparent hover:border-[#0D2569]'
                  }`}
                >
                  ✓
                </button>
                <span
                  className={s.selesai ? 'text-[#a8a8a8] line-through' : 'text-[#202020]'}
                >
                  {s.judul}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
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
    return <PesanKosongTodo teks={props.kosong} />;
  }
  if (props.layout === 'board') {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kelompokTugas.map((g) => (
          <div key={g.nama}>
            <p className="mb-2 text-sm font-bold text-[#202020]">
              {g.nama}{' '}
              <span className="font-normal text-[#808080]">
                ({g.tugas.length})
              </span>
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
              className="mt-2 text-sm font-medium text-[#808080] hover:text-[#0D2569]"
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
          <p className="mb-2 text-sm font-bold text-[#202020]">
            {g.nama}{' '}
            <span className="font-normal text-[#808080]">
              ({g.tugas.length})
            </span>
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
            className="mt-2 text-sm font-medium text-[#808080] hover:text-[#0D2569]"
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
        ? `Hari ini · ${formatTanggalPendek(tanggal)}`
        : i === 1
          ? `Besok · ${formatTanggalPendek(tanggal)}`
          : `${namaHari[d.getDay()]} · ${formatTanggalPendek(tanggal)}`;
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
      <p className="text-sm text-[#808080]">
        Tugas yang terlambat tetap terlihat di kolom Terlambat sampai
        dijadwalkan ulang — seperti Todoist.
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kolom.map((k) => (
          <div key={k.label}>
            <p className="mb-2 text-sm font-bold text-[#202020]">
              {k.label}{' '}
              <span className="font-normal text-[#808080]">
                ({k.tugas.length})
              </span>
            </p>
            {k.tanggal === null && k.tugas.length > 0 && (
              <div className="mb-2">
                <button
                  type="button"
                  onClick={jadwalkanUlangSemua}
                  className="rounded-md border border-[#0D2569] px-3 py-1.5 text-sm font-medium text-[#0D2569] hover:bg-[#0D2569]/5"
                >
                  Jadwalkan ulang semua
                </button>
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
                className="mt-2 text-sm font-medium text-[#808080] hover:text-[#0D2569]"
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

/** Filter & Label ala Todoist: hanya filter tersimpan. Daftar label
 * DIKOSONGKAN pengguna 2026-11-24 — bagian Label, tambah label, dan
 * pilihan label dihapus dari UI; nilai label pada data tugas dibiarkan
 * apa adanya (field label di model tetap ada). */
function FilterLabel(props: {
  data: ModulProps['data'];
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  kataKunci: string;
  cakupan: 'saya' | 'semua';
  onBukaDetail: (t: Task) => void;
  onAlihStatus: (t: Task, status: StatusTask) => void;
}) {
  const [pilihan, setPilihan] = useState<{ id: string } | null>(null);

  const tugasPilihan =
    pilihan === null
      ? []
      : props.data.task.filter(
          (t) =>
            (props.cakupan === 'semua' || t.pemilik === props.user.nama) &&
            cocokKataKunci(t, props.kataKunci) &&
            cocokFilterTersimpan(t, pilihan.id, props.user.nama),
        );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <KartuPutih>
          <p className="text-sm font-bold text-[#202020]">Filter saya</p>
          <ul className="mt-2 space-y-1">
            {FILTER_TERSIMPAN.map((f) => {
              const jumlah = props.data.task.filter((t) =>
                cocokFilterTersimpan(t, f.id, props.user.nama),
              ).length;
              const aktif = pilihan?.id === f.id;
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => setPilihan({ id: f.id })}
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm font-semibold ${
                      aktif
                        ? 'bg-[#f5f5f5] text-[#202020]'
                        : 'text-[#202020] hover:bg-[#f5f5f5]'
                    }`}
                  >
                    {f.label} ({jumlah})
                  </button>
                </li>
              );
            })}
          </ul>
        </KartuPutih>
        <KartuPutih>
          <p className="text-sm font-bold text-[#202020]">Label</p>
          <p className="mt-2 text-sm text-[#808080]">Belum ada label.</p>
        </KartuPutih>
      </div>

      {pilihan === null ? (
        <PesanKosongTodo teks="Pilih filter untuk melihat tugasnya." />
      ) : tugasPilihan.length === 0 ? (
        <PesanKosongTodo teks="Tidak ada tugas pada filter ini saat ini." />
      ) : (
        <div>
          <p className="mb-2 text-sm font-bold text-[#202020]">
            {FILTER_TERSIMPAN.find((f) => f.id === pilihan.id)?.label}{' '}
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
        <p className="text-sm font-semibold text-[#202020]">
          {`${selesai.length} tugas selesai`}
          {bulanIni > 0 ? ` · ${bulanIni} selesai bulan ini` : ''}
        </p>
        <TombolNetral onClick={ekspor} disabled={selesai.length === 0}>
          Ekspor CSV
        </TombolNetral>
      </div>
      {selesai.length === 0 ? (
        <PesanKosongTodo teks="Belum ada tugas yang selesai." />
      ) : (
        <KartuPutih>
          <ul className="divide-y divide-[#e6e6e6]">
            {selesai.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-2 py-2">
                <button
                  type="button"
                  onClick={() => props.onBukaDetail(t)}
                  className="text-left text-sm font-semibold text-[#202020] hover:underline"
                >
                  {t.judul}
                </button>
                <span className="text-xs text-[#808080]">
                  #{proyekTugas(t)}
                </span>
                {t.selesaiPada && (
                  <span className="text-xs text-[#808080]">
                    Selesai pada {formatTanggal(t.selesaiPada)}
                  </span>
                )}
                <span className="text-xs text-[#808080]">{t.pemilik}</span>
                <BadgeStatus status={t.status} />
              </li>
            ))}
          </ul>
        </KartuPutih>
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
      <div className="w-full max-w-3xl rounded-xl bg-white p-5 shadow-[0_16px_48px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#808080]">
            #{proyekTugas(t)}
            {t.bagian ? ` / ${t.bagian}` : ''} · {t.id}
          </p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <TombolNetral onClick={() => setTampilMenu(!tampilMenu)}>
                ⋯
              </TombolNetral>
              {tampilMenu && (
                <div className="absolute right-0 z-10 mt-1 w-56 rounded-md border border-[#e6e6e6] bg-white p-1 shadow-md">
                  <button
                    type="button"
                    className="block w-full rounded px-2 py-1.5 text-left text-sm text-[#202020] hover:bg-[#f5f5f5]"
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
                    className="block w-full rounded px-2 py-1.5 text-left text-sm text-[#202020] hover:bg-[#f5f5f5]"
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
            <TombolNetral onClick={props.onTutup}>✕</TombolNetral>
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
                className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                  tugasSelesai(t)
                    ? 'border-[#0D2569] bg-[#0D2569] text-white'
                    : 'border-[#999] text-transparent hover:border-[#0D2569] hover:text-[#0D2569]'
                }`}
              >
                ✓
              </button>
              <input
                className="w-full border-b border-transparent text-lg font-bold text-[#202020] outline-none focus:border-[#0D2569]" 
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                onBlur={simpanJudul}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                }}
              />
            </div>
            <div>
              <LabelTodo>Deskripsi</LabelTodo>
              <textarea
                className={`${inputTodo} min-h-20`}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                onBlur={simpanDeskripsi}
                placeholder="Tambahkan deskripsi…"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#202020]">
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
                          ? 'border-[#0D2569] bg-[#0D2569] text-white'
                          : 'border-[#999] text-transparent hover:border-[#0D2569]'
                      }`}
                    >
                      ✓
                    </button>
                    <span
                      className={
                        s.selesai
                          ? 'flex-1 text-[#a8a8a8] line-through'
                          : 'flex-1 text-[#202020]'
                      }
                    >
                      {s.judul}
                    </span>
                    <button
                      type="button"
                      className="text-xs font-semibold text-[#a8a8a8] hover:text-[#0D2569]" 
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
                  className={inputTodo}
                  value={subBaru}
                  onChange={(e) => setSubBaru(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') tambahSub();
                  }}
                  placeholder="Tambah sub-tugas"
                />
                <TombolNetral onClick={tambahSub}>+ Tambah</TombolNetral>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-[#202020]">Komentar</p>
              <ul className="mt-2 space-y-2">
                {(t.komentar ?? []).map((k) => (
                  <li
                    key={k.id}
                    className="rounded-md border border-[#e6e6e6] px-3 py-2 text-sm"
                  >
                    <p className="font-semibold text-[#202020]">{k.penulis}</p>
                    <p className="text-[#202020]">{k.isi}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex gap-2">
                <input
                  className={inputTodo}
                  value={komentarBaru}
                  onChange={(e) => setKomentarBaru(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') tambahKomentar();
                  }}
                  placeholder="Tambahkan komentar…"
                />
                <TombolNetral onClick={tambahKomentar}>Kirim</TombolNetral>
              </div>
            </div>

            {aktivitas.length > 0 && (
              <div>
                <p className="text-sm font-bold text-[#202020]">Aktivitas</p>
                <ul className="mt-1 space-y-1 text-sm text-[#808080]">
                  {aktivitas.map((a) => (
                    <li key={a.id}>
                      {a.aksi} — {a.pengguna}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-4 border-t border-[#e6e6e6] pt-4 md:border-l md:border-t-0 md:pl-4 md:pt-0">
            <div>
              <LabelTodo>Status</LabelTodo>
              <div className="flex flex-wrap items-center gap-2">
                <BadgeStatus status={t.status} />
                {t.status === 'Belum Dikerjakan' && (
                  <TombolNetral
                    onClick={() => actions.ubahStatusTask(t, 'Berjalan')}
                  >
                    Mulai
                  </TombolNetral>
                )}
                {!tugasSelesai(t) && (
                  <TombolNetral
                    onClick={() => actions.ubahStatusTask(t, 'Selesai')}
                  >
                    Selesai
                  </TombolNetral>
                )}
                {t.status === 'Selesai' && (
                  <TombolNetral
                    onClick={() => actions.ubahStatusTask(t, 'Berjalan')}
                  >
                    Kerjakan lagi
                  </TombolNetral>
                )}
              </div>
            </div>
            <div>
              <LabelTodo>Proyek</LabelTodo>
              <select
                className={inputTodo}
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
                <LabelTodo>Bagian</LabelTodo>
                <select
                  className={inputTodo}
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
              <LabelTodo>Penanggung jawab</LabelTodo>
              <select
                className={inputTodo}
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
              <LabelTodo>Tanggal</LabelTodo>
              <p className={`text-sm ${kelasTanggal(t)}`}>
                {labelTanggal(t.tenggat)}
              </p>
              <InputTanggal
                value={t.tenggat}
                onChange={(iso) => ubah({ tenggat: iso })}
                ariaLabel="Tanggal (dd/mm/yyyy)"
                className={`${inputTodo} mt-1`}
              />
              <div className="mt-1 flex flex-wrap gap-1">
                <TombolNetral onClick={() => pilihTanggalCepat('hari-ini')}>
                  Hari ini
                </TombolNetral>
                <TombolNetral onClick={() => pilihTanggalCepat('besok')}>
                  Besok
                </TombolNetral>
                <TombolNetral onClick={() => pilihTanggalCepat('akhir-pekan')}>
                  Akhir pekan ini
                </TombolNetral>
                <TombolNetral onClick={() => pilihTanggalCepat('minggu-depan')}>
                  Minggu depan
                </TombolNetral>
                <TombolNetral
                  onClick={() => pilihTanggalCepat('tanpa-tanggal')}
                >
                  Tanpa tanggal
                </TombolNetral>
              </div>
            </div>
            <div>
              <LabelTodo>Pengulangan</LabelTodo>
              <select
                className={inputTodo}
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
              <LabelTodo>Prioritas</LabelTodo>
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
                        ? 'border-[#0D2569] bg-[#f5f5f5]'
                        : 'border-[#e0e0e0]'
                    }`}
                  >
                    <BenderaPrioritas p={p} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <LabelTodo>Pengingat</LabelTodo>
              <input
                className={inputTodo}
                type="datetime-local"
                value={t.pengingat ?? ''}
                onChange={(e) => ubah({ pengingat: e.target.value || undefined })}
              />
              <p className="mt-1 text-xs text-[#808080]">
                Pengingat hanya penanda di tugas ini.
              </p>
            </div>
            {t.terkaitLabel && (
              <div>
                <LabelTodo>Terkait</LabelTodo>
                <p className="text-sm text-[#202020]">{t.terkaitLabel}</p>
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
              <TombolNetral onClick={() => setKonfirmasiHapus(false)}>
                Batal
              </TombolNetral>
            </div>
          </div>
        )}
        {pesanLokal !== '' && (
          <p className="mt-3 rounded-md border border-[#e6e6e6] bg-[#f5f5f5] px-3 py-2 text-sm text-[#202020]">
            {pesanLokal}
          </p>
        )}
      </div>
    </div>
  );
}

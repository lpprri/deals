// Partnership LPP RRI — App Fase A (PRD v2.0 Final Bab 12.3, Langkah 2).
// Shell 8 modul (Bab 4) + palet 3 warna RRI (Bab 8.2): Biru #2573E2,
// Navy #0D2569, Putih #FFFFFF. Modul Fase B/C tampil "segera hadir".
// Login mode contoh memakai peran dummy (Q-01); di produksi diganti
// Firebase Auth. Store ada di state App; setiap aksi menulis audit trail.

import { useState } from 'react';
import {
  BarChart3,
  Briefcase,
  Building2,
  CheckSquare,
  Database,
  FilePlus2,
  FileText,
  Handshake,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Settings,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { isFirebaseConfigured } from './config/firebase';
import { DATA_CONTOH } from './lib/sampleData';
import type { DummyUser } from './lib/dummyUsers';
import { MASTER_KATEGORI_LAYANAN, MASTER_JENIS_DOKUMEN, SATKER_PILOT } from './lib/master';
import { buatEntriAudit } from './lib/audit';
import { bolehAksi, LABEL_PERAN } from './lib/permissions';
import { hariIniIso } from './lib/format';
import type {
  AppData,
  DokumenItem,
  Klien,
  Kontrak,
  LayananKontrak,
  Pengajuan as PengajuanData,
  StatusDokumen,
  TahapPengajuan,
} from './lib/types';
import type {
  DendaInput,
  KlienInput,
  KontrakInput,
  PembayaranInput,
  PengajuanInput,
  StoreActions,
} from './lib/store';
import Login from './components/Login';
import Dashboard from './modules/Dashboard';
import Deals from './modules/Deals';
import Sewa from './modules/Sewa';
import Pengajuan from './modules/Pengajuan';
import Revenue from './modules/Revenue';
import Reporting from './modules/Reporting';
import AuditPage from './modules/AuditPage';
import MasterPage from './modules/MasterPage';

type ModuleId =
  | 'dashboard'
  | 'marketing'
  | 'sales'
  | 'deals'
  | 'sewa'
  | 'pengajuan'
  | 'revenue'
  | 'reporting'
  | 'todo'
  | 'service'
  | 'audit'
  | 'master';

interface NavItem {
  id: ModuleId;
  label: string;
  icon: typeof LayoutDashboard;
  phase: 'A' | 'B' | 'C' | 'Admin';
  description: string;
}

const MODULES: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    phase: 'A',
    description:
      'Ringkasan periode, Revenue Analytics, deadline laporan kantor pusat (isi tgl 10, kumpul tgl 11). Ranking nasional & satker menyusul di Fase C.',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: Megaphone,
    phase: 'B',
    description: 'Events dan Advertisement.',
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: Briefcase,
    phase: 'B',
    description:
      'Prospect List, Sales Analytics, Quotation, Pipeline, Order, Meeting Schedule.',
  },
  {
    id: 'deals',
    label: 'Deals',
    icon: Handshake,
    phase: 'A',
    description:
      'Clients, Partnership Details (PNBP Fungsional, PNBP Umum, Dukungan Layanan, Nota Kesepahaman, Media Partner), Contracts, Documents.',
  },
  {
    id: 'sewa',
    label: 'Sewa / BMN',
    icon: Building2,
    phase: 'A',
    description:
      'Satu daftar sewa (Deals → Partnership Details → PNBP Umum): Semua, ON GOING, Akan Berakhir, Pengajuan Baru, Diterima di Muka, Masih Harus Diterima, Temuan Lapangan, Indralaya.',
  },
  {
    id: 'pengajuan',
    label: 'Pengajuan',
    icon: FilePlus2,
    phase: 'A',
    description:
      'Pengajuan Baru (kerja sama baru / sewa baru): Masuk → Ditelaah → Menunggu Dokumen → Disetujui/Ditolak → Dikonversi ke kontrak.',
  },
  {
    id: 'revenue',
    label: 'Revenue',
    icon: Wallet,
    phase: 'A',
    description:
      'Overview, Revenue Stream, Revenue Type, Invoice, Payments, Billings, dan Rekonsiliasi dengan data acuan Keuangan (read-only).',
  },
  {
    id: 'reporting',
    label: 'Reporting',
    icon: FileText,
    phase: 'A',
    description:
      'Laporan Satker: Laporan PNBP, Laporan Piutang & Penyetoran, Laporan Dukungan Layanan, Laporan Nota Kesepahaman, Laporan Media Partner.',
  },
  {
    id: 'todo',
    label: 'To-Do List',
    icon: CheckSquare,
    phase: 'B',
    description: 'Individual Task dan Disposisi.',
  },
  {
    id: 'service',
    label: 'Service',
    icon: BarChart3,
    phase: 'C',
    description:
      'Client Order Portal, Feedback Survey, Help-Desk ke PIC kantor pusat, Knowledge Base (Regulasi, SOP).',
  },
  {
    id: 'audit',
    label: 'Audit',
    icon: ShieldCheck,
    phase: 'Admin',
    description:
      'Audit trail (append-only). Hanya Admin Sistem; tidak menampilkan konfigurasi Firebase atau email admin.',
  },
  {
    id: 'master',
    label: 'Master & Pengguna',
    icon: Database,
    phase: 'Admin',
    description:
      'Master data terpusat (kode akun, layanan, programa, jenis klien, jenis dokumen, status, daftar satker) dan pengguna dummy.',
  },
];

/** ID berikutnya dengan awalan yang sama (mis. KLN-01 -> KLN-02). */
function idBerikutnya(awalan: string, daftarId: string[]): string {
  let maks = 0;
  let lebar = 2;
  for (const id of daftarId) {
    if (!id.startsWith(awalan)) continue;
    const cocok = id.slice(awalan.length).match(/(\d+)/);
    if (!cocok) continue;
    maks = Math.max(maks, Number(cocok[1]));
    lebar = Math.max(lebar, cocok[1].length);
  }
  return `${awalan}${String(maks + 1).padStart(lebar, '0')}`;
}

/** Nomor PKS berikutnya untuk tahun berjalan (PKS-005/2026, dst.). */
function nomorPksBerikutnya(kontrak: Kontrak[]): string {
  const tahun = new Date().getFullYear();
  let maks = 0;
  for (const k of kontrak) {
    const cocok = k.nomorPks.match(/^PKS-(\d+)\/(\d{4})$/);
    if (cocok && Number(cocok[2]) === tahun) maks = Math.max(maks, Number(cocok[1]));
  }
  return `PKS-${String(maks + 1).padStart(3, '0')}/${tahun}`;
}

function buatChecklistDokumen(kontrakId: string, dokumenLama: DokumenItem[]): DokumenItem[] {
  const baru: DokumenItem[] = [];
  let daftar = dokumenLama;
  for (const jenis of MASTER_JENIS_DOKUMEN) {
    const id = idBerikutnya('DOK-', daftar.map((d) => d.id));
    const item: DokumenItem = { id, kontrakId, jenisDokumen: jenis, status: 'Belum Ada' };
    baru.push(item);
    daftar = [...daftar, item];
  }
  return baru;
}

export default function App() {
  const [user, setUser] = useState<DummyUser | null>(null);
  const [data, setData] = useState<AppData>(DATA_CONTOH);
  const [active, setActive] = useState<ModuleId>('dashboard');
  const [cari, setCari] = useState('');

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const penggunaAktif: DummyUser = user;

  const tambahAudit = (
    aksi: string,
    entitas: string,
    entitasId: string,
    sebelum?: string,
    sesudah?: string,
  ) => {
    setData((d) => ({
      ...d,
      audit: [buatEntriAudit(penggunaAktif, aksi, entitas, entitasId, sebelum, sesudah), ...d.audit],
    }));
  };

  const actions: StoreActions = {
    tambahKlien: (input: KlienInput) => {
      if (!input.nama.trim()) return 'Nama klien wajib diisi.';
      if (!input.telepon.trim()) return 'Telepon klien wajib diisi.';
      const id = idBerikutnya('KLN-', data.klien.map((k) => k.id));
      const klien: Klien = {
        id,
        nama: input.nama.trim(),
        jenis: input.jenis,
        alamat: input.alamat,
        kontakNama: input.kontakNama,
        kontakJabatan: input.kontakJabatan,
        telepon: input.telepon.trim(),
        email: input.email,
        npwp: input.npwp || undefined,
        status: 'Aktif',
        catatan: input.catatan || undefined,
        satker: SATKER_PILOT,
        dibuatOleh: penggunaAktif.nama,
        dibuatPada: hariIniIso(),
      };
      setData((d) => ({ ...d, klien: [...d.klien, klien] }));
      tambahAudit('Klien dicatat', 'Klien', id, '—', `${klien.nama} (${klien.jenis})`);
      return null;
    },

    tambahKontrak: (input: KontrakInput) => {
      if (!input.nomorPks.trim()) return 'Nomor PKS wajib diisi.';
      if (data.kontrak.some((k) => k.nomorPks === input.nomorPks.trim())) {
        return `Nomor PKS ${input.nomorPks.trim()} sudah dipakai kontrak lain.`;
      }
      if (!input.tanggalMulai) return 'Tanggal mulai wajib diisi.';
      if (!input.tanggalSelesai) return 'Tanggal selesai wajib diisi.';
      if (input.tanggalSelesai < input.tanggalMulai) {
        return 'Tanggal selesai tidak boleh sebelum tanggal mulai.';
      }
      if (input.layanan.length === 0) return 'Kontrak wajib punya minimal 1 baris layanan.';
      for (const [i, l] of input.layanan.entries()) {
        if (l.tarif <= 0) return `Tarif layanan baris ${i + 1} harus lebih dari 0.`;
        if (l.jumlah <= 0) return `Jumlah layanan baris ${i + 1} harus lebih dari 0.`;
      }
      const kategori = MASTER_KATEGORI_LAYANAN.find((k) => k.nama === input.kategoriLayanan);
      if (!kategori) return `Kategori layanan "${input.kategoriLayanan}" tidak dikenal.`;
      const layanan: LayananKontrak[] = input.layanan.map((l, i) => {
        const kat = MASTER_KATEGORI_LAYANAN.find((k) => k.nama === l.kategori);
        return {
          id: `LYN-${input.nomorPks.trim()}-${i + 1}`,
          namaLayanan: l.kategori,
          kategori: l.kategori,
          kodeAkun: kat?.kodeAkun ?? '425131',
          jenisPnBP: kat?.jenisPnBP ?? 'Umum',
          satuan: l.satuan,
          tarif: l.tarif,
          jumlah: l.jumlah,
          subtotal: l.tarif * l.jumlah,
          programa: l.programa || undefined,
        };
      });
      const nilaiKontrak = layanan.reduce((s, l) => s + l.subtotal, 0);
      const kontrak: Kontrak = {
        id: input.nomorPks.trim(),
        nomorPks: input.nomorPks.trim(),
        klienId: input.klienId,
        jenisPnBP: kategori.jenisPnBP,
        kategoriLayanan: input.kategoriLayanan,
        programa: input.programa || undefined,
        tanggalMulai: input.tanggalMulai,
        tanggalSelesai: input.tanggalSelesai,
        nilaiKontrak,
        status: 'Draft',
        penanggungJawab: input.penanggungJawab,
        catatan: input.catatan || undefined,
        satker: SATKER_PILOT,
        layanan,
      };
      const checklist = buatChecklistDokumen(kontrak.id, data.dokumen);
      setData((d) => ({
        ...d,
        kontrak: [...d.kontrak, kontrak],
        dokumen: [...d.dokumen, ...checklist],
      }));
      tambahAudit(
        'Kontrak dicatat',
        'Kontrak',
        kontrak.nomorPks,
        '—',
        `${kontrak.nomorPks} — ${kategori.jenisPnBP} — Rp${nilaiKontrak.toLocaleString('id-ID')} (Draft)`,
      );
      return null;
    },

    catatPembayaran: (input: PembayaranInput) => {
      const tagihan = data.tagihan.find((t) => t.id === input.tagihanId);
      if (!tagihan) return 'Tagihan tidak ditemukan.';
      if (!input.tanggalBayar) return 'Tanggal bayar wajib diisi.';
      if (input.jumlah <= 0) return 'Jumlah pembayaran harus lebih dari 0.';
      const sisa =
        tagihan.nilai -
        data.pembayaran
          .filter((p) => p.tagihanId === tagihan.id && p.statusVerifikasi === 'Terverifikasi')
          .reduce((s, p) => s + p.jumlah, 0);
      if (input.jumlah > sisa) {
        return `Jumlah pembayaran (Rp${input.jumlah.toLocaleString('id-ID')}) melebihi sisa piutang tagihan ini (Rp${sisa.toLocaleString('id-ID')}).`;
      }
      if (!input.penyetor.trim()) return 'Penyetor wajib diisi.';
      const id = idBerikutnya('BYR-', data.pembayaran.map((p) => p.id));
      setData((d) => ({
        ...d,
        pembayaran: [
          ...d.pembayaran,
          {
            id,
            tagihanId: input.tagihanId,
            tanggalBayar: input.tanggalBayar,
            jumlah: input.jumlah,
            metode: input.metode,
            buktiSetor: input.buktiSetor || undefined,
            penyetor: input.penyetor.trim(),
            statusVerifikasi: 'Menunggu Verifikasi',
            satker: SATKER_PILOT,
          },
        ],
      }));
      tambahAudit(
        'Pembayaran dicatat',
        'Pembayaran',
        id,
        '—',
        `Rp${input.jumlah.toLocaleString('id-ID')} — ${tagihan.nomor} (Menunggu Verifikasi)`,
      );
      return null;
    },

    verifikasiPembayaran: (id: string) => {
      const bayar = data.pembayaran.find((p) => p.id === id);
      if (!bayar || bayar.statusVerifikasi === 'Terverifikasi') return;
      setData((d) => ({
        ...d,
        pembayaran: d.pembayaran.map((p) =>
          p.id === id ? { ...p, statusVerifikasi: 'Terverifikasi' as const } : p,
        ),
      }));
      tambahAudit(
        'Pembayaran diverifikasi',
        'Pembayaran',
        id,
        'Menunggu Verifikasi',
        `Terverifikasi — Rp${bayar.jumlah.toLocaleString('id-ID')} (${bayar.tagihanId})`,
      );
    },

    tambahDenda: (input: DendaInput) => {
      if (!input.dasar.trim()) return 'Dasar keterlambatan wajib diisi.';
      if (input.jumlah <= 0) return 'Jumlah denda harus lebih dari 0.';
      const tagihan = data.tagihan.find((t) => t.id === input.tagihanId);
      if (!tagihan) return 'Tagihan tidak ditemukan.';
      const id = idBerikutnya('DND-', data.denda.map((x) => x.id));
      setData((d) => ({
        ...d,
        denda: [
          ...d.denda,
          {
            id,
            tagihanId: input.tagihanId,
            dasar: input.dasar.trim(),
            jumlah: input.jumlah,
            status: 'Terhitung',
            kodeAkun: '425839',
            satker: SATKER_PILOT,
          },
        ],
      }));
      tambahAudit(
        'Denda dicatat (manual)',
        'Denda',
        id,
        '—',
        `Rp${input.jumlah.toLocaleString('id-ID')} — ${tagihan.nomor} (Terhitung)`,
      );
      return null;
    },

    ubahStatusDokumen: (dokumen: DokumenItem, status: StatusDokumen) => {
      if (dokumen.status === status) return;
      setData((d) => ({
        ...d,
        dokumen: d.dokumen.map((x) => (x.id === dokumen.id ? { ...x, status } : x)),
      }));
      tambahAudit(
        'Status dokumen diubah',
        'Dokumen',
        dokumen.id,
        `${dokumen.jenisDokumen} — ${dokumen.status}`,
        `${dokumen.jenisDokumen} — ${status}`,
      );
    },

    tambahPengajuan: (input: PengajuanInput) => {
      if (!input.pemohon.trim()) return 'Pemohon wajib diisi.';
      if (!input.tanggalMasuk) return 'Tanggal masuk wajib diisi.';
      if (!input.kebutuhan.trim()) return 'Kebutuhan wajib diisi.';
      const id = idBerikutnya('PJ-', data.pengajuan.map((p) => p.id));
      setData((d) => ({
        ...d,
        pengajuan: [
          ...d.pengajuan,
          {
            id,
            jenis: input.jenis,
            pemohon: input.pemohon.trim(),
            tanggalMasuk: input.tanggalMasuk,
            kebutuhan: input.kebutuhan.trim(),
            tahap: 'Masuk',
            penanggungJawab: input.penanggungJawab,
            nilaiPerkiraan: input.nilaiPerkiraan,
            satker: SATKER_PILOT,
          },
        ],
      }));
      tambahAudit('Pengajuan dicatat', 'Pengajuan', id, '—', `${input.pemohon.trim()} — tahap Masuk`);
      return null;
    },

    ubahTahapPengajuan: (pengajuan: PengajuanData, tahap: TahapPengajuan, alasan?: string) => {
      if (pengajuan.tahap === tahap) return;
      if (tahap === 'Ditolak' && !alasan?.trim()) return;
      setData((d) => ({
        ...d,
        pengajuan: d.pengajuan.map((p) =>
          p.id === pengajuan.id
            ? { ...p, tahap, alasanTolak: tahap === 'Ditolak' ? alasan?.trim() : p.alasanTolak }
            : p,
        ),
      }));
      tambahAudit(
        'Tahap pengajuan diubah',
        'Pengajuan',
        pengajuan.id,
        pengajuan.tahap,
        tahap + (tahap === 'Ditolak' && alasan ? ` — ${alasan.trim()}` : ''),
      );
    },

    konversiPengajuan: (pengajuan: PengajuanData) => {
      if (pengajuan.tahap !== 'Disetujui') {
        return 'Pengajuan hanya dapat dikonversi bila tahapnya Disetujui.';
      }
      const nomorPks = nomorPksBerikutnya(data.kontrak);
      const namaPemohon = pengajuan.pemohon.replace(/ \(Contoh\)$/, '');
      let klien = data.klien.find((k) => k.nama.replace(/ \(Contoh\)$/, '') === namaPemohon);
      let klienBaru: Klien | null = null;
      if (!klien) {
        const id = idBerikutnya('KLN-', data.klien.map((k) => k.id));
        klienBaru = {
          id,
          nama: pengajuan.pemohon,
          jenis: 'Swasta',
          alamat: '—',
          kontakNama: '—',
          kontakJabatan: '—',
          telepon: '—',
          email: '—',
          status: 'Aktif',
          catatan: 'Klien dibuat otomatis dari pengajuan ' + pengajuan.id + '. Lengkapi datanya.',
          satker: SATKER_PILOT,
          dibuatOleh: penggunaAktif.nama,
          dibuatPada: hariIniIso(),
        };
        klien = klienBaru;
      }
      const kategoriNama = pengajuan.jenis === 'Sewa Baru'
        ? 'Sewa Lahan / BMN'
        : pengajuan.kebutuhan.toLowerCase().includes('iklan')
          ? 'Siaran Iklan (Spot/Jingle/Filler/Advetorial)'
          : 'Dukungan Layanan';
      const kategori = MASTER_KATEGORI_LAYANAN.find((k) => k.nama === kategoriNama)!;
      const nilai = pengajuan.nilaiPerkiraan ?? 0;
      const mulai = pengajuan.tanggalMasuk;
      const selesaiDate = new Date(`${mulai}T00:00:00`);
      selesaiDate.setFullYear(selesaiDate.getFullYear() + 1);
      selesaiDate.setDate(selesaiDate.getDate() - 1);
      const selesai = selesaiDate.toISOString().slice(0, 10);
      const kontrak: Kontrak = {
        id: nomorPks,
        nomorPks,
        klienId: klien.id,
        jenisPnBP: kategori.jenisPnBP,
        kategoriLayanan: kategori.nama,
        tanggalMulai: mulai,
        tanggalSelesai: selesai,
        nilaiKontrak: nilai,
        status: 'Draft',
        penanggungJawab: pengajuan.penanggungJawab,
        catatan: `Berasal dari pengajuan ${pengajuan.id} (Dikonversi).`,
        satker: SATKER_PILOT,
        layanan: [
          {
            id: `LYN-${nomorPks}-1`,
            namaLayanan: kategori.nama,
            kategori: kategori.nama,
            kodeAkun: kategori.kodeAkun,
            jenisPnBP: kategori.jenisPnBP,
            satuan: 'Paket',
            tarif: nilai,
            jumlah: 1,
            subtotal: nilai,
          },
        ],
      };
      const checklist = buatChecklistDokumen(kontrak.id, data.dokumen);
      setData((d) => ({
        ...d,
        klien: klienBaru ? [...d.klien, klienBaru] : d.klien,
        kontrak: [...d.kontrak, kontrak],
        dokumen: [...d.dokumen, ...checklist],
        pengajuan: d.pengajuan.map((p) =>
          p.id === pengajuan.id
            ? {
                ...p,
                tahap: 'Dikonversi' as const,
                hasilKonversi: { jenis: 'Kontrak' as const, id: nomorPks, label: nomorPks },
              }
            : p,
        ),
      }));
      tambahAudit(
        'Pengajuan dikonversi menjadi kontrak',
        'Pengajuan',
        pengajuan.id,
        'Disetujui',
        `Dikonversi — ${nomorPks} (Draft)`,
      );
      return null;
    },
  };

  const navUtama = MODULES.filter((m) => m.phase !== 'Admin');
  const navAdmin = MODULES.filter((m) => m.phase === 'Admin').filter((m) =>
    m.id === 'audit'
      ? bolehAksi(penggunaAktif.peran, 'lihatAudit')
      : bolehAksi(penggunaAktif.peran, 'kelolaMaster'),
  );
  const current = MODULES.find((m) => m.id === active) ?? MODULES[0];
  const Icon = current.icon;
  const propsModul = { data, user: penggunaAktif, actions, cari };

  return (
    <div className="flex h-full">
      {/* Sidebar gelap — Navy RRI #0D2569 */}
      <aside className="flex w-60 shrink-0 flex-col bg-[#0d2569] text-white">
        <div className="px-5 pb-4 pt-5">
          <p className="text-lg font-bold leading-tight">Partnership</p>
          <p className="text-lg font-bold leading-tight">LPP RRI</p>
          <p className="mt-1 text-xs text-white/70">Radio Republik Indonesia</p>
          <p className="mt-2 text-xs text-white/70">Satker: PALEMBANG (Pilot)</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-auto px-3">
          {navUtama.map((m) => {
            const ItemIcon = m.icon;
            const isActive = m.id === active;
            return (
              <button
                key={m.id}
                onClick={() => setActive(m.id)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm ${
                  isActive
                    ? 'bg-[#2573e2] font-semibold text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <ItemIcon size={18} />
                {m.label}
                {m.phase !== 'A' && (
                  <span className="ml-auto rounded bg-white/15 px-1.5 py-0.5 text-[10px]">
                    Fase {m.phase}
                  </span>
                )}
              </button>
            );
          })}
          {navAdmin.length > 0 && (
            <>
              <p className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wide text-white/50">
                Admin
              </p>
              {navAdmin.map((m) => {
                const ItemIcon = m.icon;
                const isActive = m.id === active;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActive(m.id)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm ${
                      isActive
                        ? 'bg-[#2573e2] font-semibold text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <ItemIcon size={18} />
                    {m.label}
                  </button>
                );
              })}
            </>
          )}
        </nav>
        <div className="border-t border-white/15 px-5 py-4 text-xs text-white/70">
          <p className="flex items-center gap-2">
            <Settings size={14} /> {penggunaAktif.nama}
          </p>
          <p className="mt-1">{LABEL_PERAN[penggunaAktif.peran]}</p>
          <p>{penggunaAktif.jabatan}</p>
          <button
            onClick={() => {
              setUser(null);
              setActive('dashboard');
            }}
            className="mt-3 flex items-center gap-2 rounded-md border border-white/30 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
          >
            <LogOut size={13} /> Keluar
          </button>
        </div>
      </aside>

      {/* Konten */}
      <div className="flex min-w-0 flex-1 flex-col bg-white">
        <header className="flex items-center gap-4 border-b border-[#2573e2]/15 px-6 py-3">
          <input
            type="search"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari klien, kontrak, tagihan…"
            className="w-full max-w-md rounded-md border border-[#2573e2]/40 px-3 py-2 text-sm outline-none placeholder:text-[#0d2569]/50 focus:border-[#2573e2]"
          />
          <button
            onClick={() => setActive('pengajuan')}
            className="ml-auto rounded-md bg-[#2573e2] px-4 py-2 text-sm font-semibold text-white"
          >
            + Tambah
          </button>
        </header>

        <main className="flex-1 overflow-auto px-6 py-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[#0d2569]">
            <Icon size={26} className="text-[#2573e2]" />
            {current.label}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#0d2569]/80">
            {current.description}
          </p>

          {!isFirebaseConfigured && (
            <div className="mt-4 max-w-2xl rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-4 py-3 text-sm">
              <strong>Mode contoh.</strong> Konfigurasi Firebase belum
              dipasang (lihat <code>.env.example</code>). Aplikasi berjalan
              dengan data contoh yang diberi label jelas — bukan data asli.
            </div>
          )}

          <div className="mt-6">
            {active === 'dashboard' && <Dashboard {...propsModul} />}
            {active === 'deals' && <Deals {...propsModul} />}
            {active === 'sewa' && <Sewa {...propsModul} />}
            {active === 'pengajuan' && <Pengajuan {...propsModul} />}
            {active === 'revenue' && <Revenue {...propsModul} />}
            {active === 'reporting' && <Reporting {...propsModul} />}
            {active === 'audit' && <AuditPage {...propsModul} />}
            {active === 'master' && <MasterPage {...propsModul} />}
            {(active === 'marketing' || active === 'sales' || active === 'todo' || active === 'service') && (
              <div className="mt-6 max-w-2xl rounded-md border border-[#2573e2]/20 p-5">
                <p className="text-sm font-semibold">
                  Segera hadir — Fase {current.phase}
                </p>
                <p className="mt-1 text-sm text-[#0d2569]/80">
                  Modul ini direncanakan pada Fase {current.phase} (PRD v2.0
                  Final Bab 4.3) dan belum dibangun. Tidak ada fitur palsu di
                  halaman ini.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

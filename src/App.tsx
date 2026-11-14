// Partnership LPP RRI — App Fase A + Fase B (PRD Bab 12.3–12.4).
// Shell 8 modul (Bab 4) + palet 3 warna RRI (Bab 8.2): Biru #2573E2,
// Navy #0D2569, Putih #FFFFFF. Modul Service (Fase C) tampil "segera hadir".
// Login memakai Firebase Auth bila terkonfigurasi; bila belum, mode contoh
// memakai 1 operator dummy (keputusan pengguna 14/11/2026: hanya 1 role —
// Operator, staf Layanan & Pengembangan Usaha). Store ada di state App;
// setiap aksi menulis audit trail. Bila Firestore sudah dimigrasi, aksi
// tulis juga disimpan ke Firestore; bila belum, perubahan session-only.

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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
import { auth, db, isFirebaseConfigured } from './lib/firebaseApp';
import { keluar, masukDenganEmail } from './lib/auth';
import { EMAIL_OPERATOR_USULAN, jalankanMigrasi } from './lib/migrasi';
import {
  cekSudahDimigrasi,
  muatDariFirestore,
  simpanDokumen,
  tulisAudit,
} from './lib/firestoreStore';
import { DATA_NYATA, TANGGAL_IMPOR } from './lib/seedNyata';
import type { DummyUser } from './lib/dummyUsers';
import {
  MASTER_KATEGORI_LAYANAN,
  MASTER_JENIS_DOKUMEN,
  MASTER_SUMBER_PROSPEK,
  MASTER_TAHAP_PIPELINE,
  SATKER_PILOT,
} from './lib/master';
import { buatEntriAudit } from './lib/audit';
import { bolehAksi, LABEL_PERAN } from './lib/permissions';
import { formatRupiah, formatTanggal, hariIniIso } from './lib/format';
import type {
  Advertisement,
  AppData,
  DokumenItem,
  Event,
  Klien,
  Kontrak,
  LayananKontrak,
  Meeting,
  Order,
  Pengajuan as PengajuanData,
  Prospect,
  Quotation,
  QuotationLayanan,
  StatusDokumen,
  StatusOrder,
  StatusQuotation,
  StatusTask,
  TahapPengajuan,
  TahapPipeline,
  Task,
} from './lib/types';
import type {
  AdvertisementInput,
  DendaInput,
  DisposisiInput,
  EventInput,
  KlienInput,
  KontrakInput,
  MeetingInput,
  OrderInput,
  PembayaranInput,
  PengajuanInput,
  ProspectInput,
  QuotationInput,
  StoreActions,
  TaskInput,
} from './lib/store';
import Login from './components/Login';
import Dashboard from './modules/Dashboard';
import Deals from './modules/Deals';
import Sewa from './modules/Sewa';
import Pengajuan from './modules/Pengajuan';
import Revenue from './modules/Revenue';
import Reporting from './modules/Reporting';
import Sales from './modules/Sales';
import Marketing from './modules/Marketing';
import Todo from './modules/Todo';
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

/**
 * Tahap pipeline yang lebih maju (Fase B). Dipakai saat dokumen dibuat:
 * quotation dibuat -> Penawaran, disetujui -> Negosiasi, order dibuat ->
 * Order. Tidak pernah memundurkan tahap (PRD Bab 9.5).
 */
function tahapMaju(
  tahapLama: TahapPipeline,
  tahapBaru: TahapPipeline,
): TahapPipeline {
  return MASTER_TAHAP_PIPELINE.indexOf(tahapBaru) >
    MASTER_TAHAP_PIPELINE.indexOf(tahapLama)
    ? tahapBaru
    : tahapLama;
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
  const [data, setData] = useState<AppData>(DATA_NYATA);
  const [active, setActive] = useState<ModuleId>('dashboard');
  const [cari, setCari] = useState('');

  /** Mode sumber data: contoh (belum terkonfigurasi / belum dimigrasi) atau Firestore. */
  type ModeData = 'tidak-terkonfigurasi' | 'belum-dimigrasi' | 'firestore';
  const [modeData, setModeData] = useState<ModeData>(
    isFirebaseConfigured ? 'belum-dimigrasi' : 'tidak-terkonfigurasi',
  );
  /** Email akun Auth yang login (dipakai identitas operator saat migrasi). */
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [sudahDimigrasi, setSudahDimigrasi] = useState(false);
  const [tanggalMigrasi, setTanggalMigrasi] = useState<string | undefined>(undefined);
  const [galatMuat, setGalatMuat] = useState<string | null>(null);
  const [peringatanSimpan, setPeringatanSimpan] = useState<string | null>(null);

  // Pulihkan sesi Auth yang sudah masuk (bila Firebase terkonfigurasi).
  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) return;
    const berhenti = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser || !db) return;
      try {
        const snap = await getDoc(doc(db, 'users', fbUser.uid));
        if (snap.exists() && snap.data().peran === 'operator') {
          const d = snap.data();
          setUser({
            nama: String(d.nama ?? ''),
            jabatan: String(d.jabatan ?? ''),
            peran: 'operator',
          });
          setAuthEmail(fbUser.email ?? null);
        }
      } catch {
        // Abaikan — pengguna masuk manual lewat form login.
      }
    });
    return berhenti;
  }, []);

  // Muat data dari Firestore setelah login, bila sudah dimigrasi.
  useEffect(() => {
    if (!user || !isFirebaseConfigured || !db) return;
    let batal = false;
    (async () => {
      try {
        const sudah = await cekSudahDimigrasi(db);
        if (batal) return;
        if (!sudah) {
          setModeData('belum-dimigrasi');
          return;
        }
        const dariFirestore = await muatDariFirestore(db, SATKER_PILOT.kode);
        if (batal) return;
        if (dariFirestore) {
          setData(dariFirestore);
          setModeData('firestore');
          setSudahDimigrasi(true);
        }
      } catch (e) {
        if (!batal) {
          setGalatMuat(
            e instanceof Error ? e.message : 'Gagal memuat data dari Firestore.',
          );
        }
      }
    })();
    return () => {
      batal = true;
    };
  }, [user]);

  if (!user) {
    return (
      <Login
        onLoginAuth={async (email, kataSandi) => {
          try {
            const appUser = await masukDenganEmail(email, kataSandi);
            setUser({
              nama: appUser.nama,
              jabatan: appUser.jabatan,
              peran: 'operator',
            });
            setAuthEmail(appUser.email);
            return null;
          } catch (e) {
            const kode = (e as { code?: string }).code;
            if (
              kode === 'auth/invalid-credential' ||
              kode === 'auth/user-not-found' ||
              kode === 'auth/wrong-password'
            ) {
              return 'Email atau kata sandi salah.';
            }
            if (kode === 'auth/too-many-requests') {
              return 'Terlalu banyak percobaan masuk — coba lagi nanti.';
            }
            if (kode === 'auth/network-request-failed') {
              return 'Tidak ada koneksi jaringan.';
            }
            return e instanceof Error ? e.message : 'Gagal masuk. Coba lagi.';
          }
        }}
        onLoginDummy={setUser}
      />
    );
  }

  const penggunaAktif: DummyUser = user;

  const tambahAudit = (
    aksi: string,
    entitas: string,
    entitasId: string,
    sebelum?: string,
    sesudah?: string,
  ) => {
    // Entri dibuat sekali di sini supaya objek yang sama dipakai state
    // lokal dan Firestore (id/waktu harus sama di keduanya).
    const entri = buatEntriAudit(penggunaAktif, aksi, entitas, entitasId, sebelum, sesudah);
    setData((d) => ({
      ...d,
      audit: [entri, ...d.audit],
    }));
    if (modeData === 'firestore' && db) {
      tulisAudit(db, entri).catch((e) => {
        console.error('Gagal menulis audit ke Firestore:', e);
        setPeringatanSimpan(
          'Gagal menyimpan catatan audit ke Firestore — perubahan hanya ada di sesi ini.',
        );
      });
    }
  };

  /**
   * Simpan satu dokumen entitas ke Firestore bila mode Firestore aktif.
   * Bila belum dimigrasi / tidak terkonfigurasi: no-op (session-only).
   * Kegagalan tulis tidak menggagalkan aksi — state lokal tetap sumber
   * kebenaran sesi itu, dan peringatan ditampilkan di layar.
   */
  const simpanKeFirestore = (koleksi: string, id: string, entitas: unknown) => {
    if (modeData !== 'firestore' || !db) return;
    simpanDokumen(db, koleksi, id, entitas).catch((e) => {
      console.error('Gagal menyimpan ke Firestore:', e);
      setPeringatanSimpan(
        'Gagal menyimpan perubahan ke Firestore — perubahan hanya ada di sesi ini.',
      );
    });
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
      simpanKeFirestore('klien', id, klien);
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
      simpanKeFirestore('kontrak', kontrak.id, kontrak);
      checklist.forEach((dok) => simpanKeFirestore('dokumen', dok.id, dok));
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
      simpanKeFirestore('pembayaran', id, {
        id,
        tagihanId: input.tagihanId,
        tanggalBayar: input.tanggalBayar,
        jumlah: input.jumlah,
        metode: input.metode,
        buktiSetor: input.buktiSetor || undefined,
        penyetor: input.penyetor.trim(),
        statusVerifikasi: 'Menunggu Verifikasi' as const,
        satker: SATKER_PILOT,
      });
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
      simpanKeFirestore('pembayaran', id, { ...bayar, statusVerifikasi: 'Terverifikasi' as const });
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
      simpanKeFirestore('denda', id, {
        id,
        tagihanId: input.tagihanId,
        dasar: input.dasar.trim(),
        jumlah: input.jumlah,
        status: 'Terhitung' as const,
        kodeAkun: '425839',
        satker: SATKER_PILOT,
      });
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
      simpanKeFirestore('dokumen', dokumen.id, { ...dokumen, status });
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
      simpanKeFirestore('pengajuan', id, {
        id,
        jenis: input.jenis,
        pemohon: input.pemohon.trim(),
        tanggalMasuk: input.tanggalMasuk,
        kebutuhan: input.kebutuhan.trim(),
        tahap: 'Masuk' as const,
        penanggungJawab: input.penanggungJawab,
        nilaiPerkiraan: input.nilaiPerkiraan,
        satker: SATKER_PILOT,
      });
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
      simpanKeFirestore('pengajuan', pengajuan.id, {
        ...pengajuan,
        tahap,
        alasanTolak: tahap === 'Ditolak' ? alasan?.trim() : pengajuan.alasanTolak,
      });
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
      if (klienBaru) simpanKeFirestore('klien', klienBaru.id, klienBaru);
      simpanKeFirestore('kontrak', kontrak.id, kontrak);
      checklist.forEach((dok) => simpanKeFirestore('dokumen', dok.id, dok));
      simpanKeFirestore('pengajuan', pengajuan.id, {
        ...pengajuan,
        tahap: 'Dikonversi' as const,
        hasilKonversi: { jenis: 'Kontrak' as const, id: nomorPks, label: nomorPks },
      });
      tambahAudit(
        'Pengajuan dikonversi menjadi kontrak',
        'Pengajuan',
        pengajuan.id,
        'Disetujui',
        `Dikonversi — ${nomorPks} (Draft)`,
      );
      return null;
    },

    // --- Aksi Fase B — Sales (PRD Bab 7.3, 9.5) ---
    tambahProspect: (input: ProspectInput) => {
      if (!input.namaInstansi.trim()) return 'Nama instansi wajib diisi.';
      if (!input.kontakNama.trim()) return 'Nama kontak wajib diisi.';
      if (!input.telepon.trim()) return 'Telepon wajib diisi.';
      if (!MASTER_SUMBER_PROSPEK.includes(input.sumber)) {
        return `Sumber prospek "${input.sumber}" tidak dikenal.`;
      }
      if (
        !MASTER_KATEGORI_LAYANAN.some((k) => k.nama === input.layananDiminati)
      ) {
        return `Layanan "${input.layananDiminati}" tidak dikenal.`;
      }
      if (!(input.nilaiPerkiraan > 0)) return 'Nilai perkiraan harus lebih dari 0.';
      if (
        input.pengajuanId &&
        !data.pengajuan.some((p) => p.id === input.pengajuanId)
      ) {
        return 'Pengajuan asal tidak ditemukan.';
      }
      const id = idBerikutnya('PRS-', data.prospect.map((p) => p.id));
      const prospect: Prospect = {
        id,
        namaInstansi: input.namaInstansi.trim(),
        kontakNama: input.kontakNama.trim(),
        kontakJabatan: input.kontakJabatan || undefined,
        telepon: input.telepon.trim(),
        email: input.email || undefined,
        sumber: input.sumber,
        layananDiminati: input.layananDiminati,
        tahap: 'Prospek Baru',
        penanggungJawab: input.penanggungJawab,
        tanggalTindakLanjut: input.tanggalTindakLanjut || undefined,
        nilaiPerkiraan: input.nilaiPerkiraan,
        catatan: input.catatan || undefined,
        pengajuanId: input.pengajuanId || undefined,
        riwayat: [
          {
            tanggal: hariIniIso(),
            catatan: 'Prospek dicatat.',
            oleh: penggunaAktif.nama,
          },
        ],
        satker: SATKER_PILOT,
      };
      setData((d) => ({ ...d, prospect: [...d.prospect, prospect] }));
      simpanKeFirestore('prospect', id, prospect);
      tambahAudit(
        'Prospek dicatat',
        'Prospek',
        id,
        '—',
        `${prospect.namaInstansi} — Prospek Baru — ${formatRupiah(prospect.nilaiPerkiraan)}`,
      );
      return null;
    },

    ubahTahapProspect: (prospect: Prospect, tahap: TahapPipeline, catatan: string) => {
      if (!catatan.trim()) return 'Catatan perpindahan tahap wajib diisi.';
      if (!MASTER_TAHAP_PIPELINE.includes(tahap)) {
        return `Tahap "${tahap}" tidak dikenal.`;
      }
      if (prospect.tahap === tahap) {
        return 'Prospek sudah berada pada tahap tersebut.';
      }
      if (prospect.tahap === 'Menang' || prospect.tahap === 'Kalah') {
        return `Prospek pada tahap ${prospect.tahap} sudah final dan tidak dapat dipindah.`;
      }
      // Tahap 'Order' dan 'Menang' dicapai otomatis lewat tambahOrder /
      // konversiOrder, bukan pindah manual (supaya jejak tetap konsisten).
      if (tahap === 'Order') {
        return "Tahap Order dicapai otomatis saat order dibuat dari quotation yang disetujui.";
      }
      if (tahap === 'Menang') {
        return 'Tahap Menang hanya dapat dicapai lewat konversi order menjadi kontrak.';
      }
      setData((d) => ({
        ...d,
        prospect: d.prospect.map((p) =>
          p.id === prospect.id
            ? {
                ...p,
                tahap,
                riwayat: [
                  ...p.riwayat,
                  {
                    tanggal: hariIniIso(),
                    catatan: catatan.trim(),
                    oleh: penggunaAktif.nama,
                  },
                ],
              }
            : p,
        ),
      }));
      simpanKeFirestore('prospect', prospect.id, {
        ...prospect,
        tahap,
        riwayat: [
          ...prospect.riwayat,
          {
            tanggal: hariIniIso(),
            catatan: catatan.trim(),
            oleh: penggunaAktif.nama,
          },
        ],
      });
      tambahAudit(
        'Tahap prospek diubah',
        'Prospek',
        prospect.id,
        prospect.tahap,
        `${tahap} — ${catatan.trim()}`,
      );
      return null;
    },

    tambahTindakLanjut: (prospect: Prospect, catatan: string, tanggal?: string) => {
      if (!catatan.trim()) return;
      const entri = {
        tanggal: tanggal ?? hariIniIso(),
        catatan: catatan.trim(),
        oleh: penggunaAktif.nama,
      };
      setData((d) => ({
        ...d,
        prospect: d.prospect.map((p) =>
          p.id === prospect.id
            ? { ...p, riwayat: [...p.riwayat, entri] }
            : p,
        ),
      }));
      simpanKeFirestore('prospect', prospect.id, { ...prospect, riwayat: [...prospect.riwayat, entri] });
      tambahAudit(
        'Tindak lanjut dicatat',
        'Prospek',
        prospect.id,
        '—',
        catatan.trim(),
      );
    },

    tambahQuotation: (input: QuotationInput) => {
      const prospect = data.prospect.find((p) => p.id === input.prospectId);
      if (!prospect) return 'Prospek tidak ditemukan.';
      if (prospect.tahap === 'Menang' || prospect.tahap === 'Kalah') {
        return 'Prospek pada tahap final tidak dapat dibuatkan quotation.';
      }
      if (!input.berlakuSampai) return 'Tanggal berlaku sampai wajib diisi.';
      if (input.layanan.length === 0) {
        return 'Quotation wajib punya minimal 1 baris layanan.';
      }
      for (const [i, l] of input.layanan.entries()) {
        const kat = MASTER_KATEGORI_LAYANAN.find((k) => k.nama === l.kategori);
        if (!kat) return `Kategori layanan baris ${i + 1} tidak dikenal.`;
        if (!(l.tarif > 0)) {
          return `Tarif layanan baris ${i + 1} harus lebih dari 0.`;
        }
        if (!(l.jumlah > 0)) {
          return `Jumlah layanan baris ${i + 1} harus lebih dari 0.`;
        }
      }
      const id = idBerikutnya('QTN-', data.quotation.map((q) => q.id));
      const layanan: QuotationLayanan[] = input.layanan.map((l, i) => {
        const kat = MASTER_KATEGORI_LAYANAN.find((k) => k.nama === l.kategori)!;
        return {
          id: `QTL-${id}-${i + 1}`,
          kategori: l.kategori,
          kodeAkun: kat.kodeAkun,
          jenisPnBP: kat.jenisPnBP,
          satuan: l.satuan,
          tarif: l.tarif,
          jumlah: l.jumlah,
          subtotal: l.tarif * l.jumlah,
          programa: l.programa || undefined,
        };
      });
      const nilai = layanan.reduce((s, l) => s + l.subtotal, 0);
      const quotation: Quotation = {
        id,
        prospectId: prospect.id,
        tanggalBuat: hariIniIso(),
        berlakuSampai: input.berlakuSampai,
        status: 'Draft',
        layanan,
        nilai,
        catatan: input.catatan || undefined,
        satker: SATKER_PILOT,
      };
      setData((d) => ({
        ...d,
        quotation: [...d.quotation, quotation],
        prospect: d.prospect.map((p) =>
          p.id === prospect.id
            ? {
                ...p,
                tahap: tahapMaju(p.tahap, 'Penawaran'),
                riwayat: [
                  ...p.riwayat,
                  {
                    tanggal: hariIniIso(),
                    catatan: `Quotation ${id} dibuat (${formatRupiah(nilai)}).`,
                    oleh: penggunaAktif.nama,
                  },
                ],
              }
            : p,
        ),
      }));
      simpanKeFirestore('quotation', id, quotation);
      simpanKeFirestore('prospect', prospect.id, {
        ...prospect,
        tahap: tahapMaju(prospect.tahap, 'Penawaran'),
        riwayat: [
          ...prospect.riwayat,
          {
            tanggal: hariIniIso(),
            catatan: `Quotation ${id} dibuat (${formatRupiah(nilai)}).`,
            oleh: penggunaAktif.nama,
          },
        ],
      });
      tambahAudit(
        'Quotation dibuat',
        'Quotation',
        id,
        '—',
        `${prospect.namaInstansi} — ${formatRupiah(nilai)} (Draft)`,
      );
      return null;
    },

    ubahStatusQuotation: (quotation: Quotation, status: StatusQuotation) => {
      const sah: Record<StatusQuotation, StatusQuotation[]> = {
        Draft: ['Dikirim'],
        Dikirim: ['Disetujui', 'Ditolak'],
        Disetujui: [],
        Ditolak: [],
      };
      if (!sah[quotation.status].includes(status)) {
        return `Status quotation tidak dapat diubah dari ${quotation.status} menjadi ${status}.`;
      }
      setData((d) => ({
        ...d,
        quotation: d.quotation.map((q) =>
          q.id === quotation.id ? { ...q, status } : q,
        ),
        prospect:
          status === 'Disetujui'
            ? d.prospect.map((p) =>
                p.id === quotation.prospectId
                  ? {
                      ...p,
                      tahap: tahapMaju(p.tahap, 'Negosiasi'),
                      riwayat: [
                        ...p.riwayat,
                        {
                          tanggal: hariIniIso(),
                          catatan: `Quotation ${quotation.id} disetujui.`,
                          oleh: penggunaAktif.nama,
                        },
                      ],
                    }
                  : p,
              )
            : d.prospect,
      }));
      simpanKeFirestore('quotation', quotation.id, { ...quotation, status });
      if (status === 'Disetujui') {
        const prospekTerkait = data.prospect.find((p) => p.id === quotation.prospectId);
        if (prospekTerkait) {
          simpanKeFirestore('prospect', prospekTerkait.id, {
            ...prospekTerkait,
            tahap: tahapMaju(prospekTerkait.tahap, 'Negosiasi'),
            riwayat: [
              ...prospekTerkait.riwayat,
              {
                tanggal: hariIniIso(),
                catatan: `Quotation ${quotation.id} disetujui.`,
                oleh: penggunaAktif.nama,
              },
            ],
          });
        }
      }
      tambahAudit(
        'Status quotation diubah',
        'Quotation',
        quotation.id,
        quotation.status,
        status,
      );
      return null;
    },

    tambahOrder: (input: OrderInput) => {
      const quotation = data.quotation.find((q) => q.id === input.quotationId);
      if (!quotation) return 'Quotation tidak ditemukan.';
      if (quotation.status !== 'Disetujui') {
        return 'Order hanya dapat dibuat dari quotation yang Disetujui.';
      }
      if (
        data.order.some(
          (o) => o.quotationId === quotation.id && o.status !== 'Dibatalkan',
        )
      ) {
        return `Quotation ${quotation.id} sudah memiliki order aktif.`;
      }
      const prospect = data.prospect.find((p) => p.id === quotation.prospectId);
      const id = idBerikutnya('ORD-', data.order.map((o) => o.id));
      const order: Order = {
        id,
        quotationId: quotation.id,
        prospectId: quotation.prospectId,
        tanggalOrder: hariIniIso(),
        status: 'Draft',
        nilai: quotation.nilai,
        catatan: input.catatan || undefined,
        satker: SATKER_PILOT,
      };
      setData((d) => ({
        ...d,
        order: [...d.order, order],
        prospect: d.prospect.map((p) =>
          p.id === quotation.prospectId
            ? {
                ...p,
                tahap: tahapMaju(p.tahap, 'Order'),
                riwayat: [
                  ...p.riwayat,
                  {
                    tanggal: hariIniIso(),
                    catatan: `Order ${id} dibuat dari quotation ${quotation.id}.`,
                    oleh: penggunaAktif.nama,
                  },
                ],
              }
            : p,
        ),
      }));
      simpanKeFirestore('order', id, order);
      if (prospect) {
        simpanKeFirestore('prospect', quotation.prospectId, {
          ...prospect,
          tahap: tahapMaju(prospect.tahap, 'Order'),
          riwayat: [
            ...prospect.riwayat,
            {
              tanggal: hariIniIso(),
              catatan: `Order ${id} dibuat dari quotation ${quotation.id}.`,
              oleh: penggunaAktif.nama,
            },
          ],
        });
      }
      tambahAudit(
        'Order dibuat',
        'Order',
        id,
        '—',
        `${prospect?.namaInstansi ?? quotation.prospectId} — ${formatRupiah(quotation.nilai)} (Draft)`,
      );
      return null;
    },

    ubahStatusOrder: (order: Order, status: StatusOrder) => {
      const sah: Record<StatusOrder, StatusOrder[]> = {
        Draft: ['Diproses', 'Dibatalkan'],
        Diproses: ['Selesai', 'Dibatalkan'],
        Selesai: [],
        Dibatalkan: [],
      };
      if (!sah[order.status].includes(status)) {
        return `Status order tidak dapat diubah dari ${order.status} menjadi ${status}.`;
      }
      setData((d) => ({
        ...d,
        order: d.order.map((o) =>
          o.id === order.id ? { ...o, status } : o,
        ),
      }));
      simpanKeFirestore('order', order.id, { ...order, status });
      tambahAudit(
        'Status order diubah',
        'Order',
        order.id,
        order.status,
        status,
      );
      return null;
    },

    konversiOrder: (order: Order) => {
      if (order.status !== 'Selesai') {
        return 'Order hanya dapat dikonversi bila statusnya Selesai.';
      }
      if (order.kontrakId) {
        return `Order ${order.id} sudah dikonversi menjadi ${order.kontrakId}.`;
      }
      const quotation = data.quotation.find((q) => q.id === order.quotationId);
      if (!quotation) return 'Quotation asal order tidak ditemukan.';
      const prospect = data.prospect.find((p) => p.id === order.prospectId);
      if (!prospect) return 'Prospek asal order tidak ditemukan.';
      const nomorPks = nomorPksBerikutnya(data.kontrak);
      // Klien: pakai klien yang sudah ditaut prospek, cocokkan nama, atau buat baru.
      let klien = prospect.klienId
        ? data.klien.find((k) => k.id === prospect.klienId)
        : undefined;
      if (!klien) {
        const namaBersih = prospect.namaInstansi.replace(/ \(Contoh\)$/, '');
        klien = data.klien.find(
          (k) => k.nama.replace(/ \(Contoh\)$/, '') === namaBersih,
        );
      }
      let klienBaru: Klien | null = null;
      if (!klien) {
        const id = idBerikutnya('KLN-', data.klien.map((k) => k.id));
        klienBaru = {
          id,
          nama: prospect.namaInstansi,
          jenis: 'Swasta',
          alamat: '—',
          kontakNama: prospect.kontakNama,
          kontakJabatan: prospect.kontakJabatan ?? '—',
          telepon: prospect.telepon,
          email: prospect.email ?? '—',
          status: 'Aktif',
          catatan: `Klien dibuat otomatis dari prospek ${prospect.id}. Lengkapi datanya.`,
          satker: SATKER_PILOT,
          dibuatOleh: penggunaAktif.nama,
          dibuatPada: hariIniIso(),
        };
        klien = klienBaru;
      }
      // Layanan kontrak memakai snapshot tarif dari quotation (bukan master).
      const layanan: LayananKontrak[] = quotation.layanan.map((l, i) => ({
        id: `LYN-${nomorPks}-${i + 1}`,
        namaLayanan: l.kategori,
        kategori: l.kategori,
        kodeAkun: l.kodeAkun,
        jenisPnBP: l.jenisPnBP,
        satuan: l.satuan,
        tarif: l.tarif,
        jumlah: l.jumlah,
        subtotal: l.subtotal,
        programa: l.programa,
      }));
      const kategoriNama =
        quotation.layanan[0]?.kategori ?? prospect.layananDiminati;
      const kategori = MASTER_KATEGORI_LAYANAN.find(
        (k) => k.nama === kategoriNama,
      )!;
      const mulai = hariIniIso();
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
        programa: quotation.layanan[0]?.programa,
        tanggalMulai: mulai,
        tanggalSelesai: selesai,
        nilaiKontrak: order.nilai,
        status: 'Draft',
        penanggungJawab: prospect.penanggungJawab,
        catatan: `Berasal dari order ${order.id} (prospek ${prospect.id}).`,
        satker: SATKER_PILOT,
        layanan,
      };
      const checklist = buatChecklistDokumen(kontrak.id, data.dokumen);
      setData((d) => ({
        ...d,
        klien: klienBaru ? [...d.klien, klienBaru] : d.klien,
        kontrak: [...d.kontrak, kontrak],
        dokumen: [...d.dokumen, ...checklist],
        order: d.order.map((o) =>
          o.id === order.id ? { ...o, kontrakId: nomorPks } : o,
        ),
        prospect: d.prospect.map((p) =>
          p.id === prospect.id
            ? {
                ...p,
                tahap: 'Menang',
                kontrakId: nomorPks,
                riwayat: [
                  ...p.riwayat,
                  {
                    tanggal: hariIniIso(),
                    catatan: `Order ${order.id} dikonversi menjadi kontrak ${nomorPks}.`,
                    oleh: penggunaAktif.nama,
                  },
                ],
              }
            : p,
        ),
      }));
      if (klienBaru) simpanKeFirestore('klien', klienBaru.id, klienBaru);
      simpanKeFirestore('kontrak', kontrak.id, kontrak);
      checklist.forEach((dok) => simpanKeFirestore('dokumen', dok.id, dok));
      simpanKeFirestore('order', order.id, { ...order, kontrakId: nomorPks });
      simpanKeFirestore('prospect', prospect.id, {
        ...prospect,
        tahap: 'Menang',
        kontrakId: nomorPks,
        riwayat: [
          ...prospect.riwayat,
          {
            tanggal: hariIniIso(),
            catatan: `Order ${order.id} dikonversi menjadi kontrak ${nomorPks}.`,
            oleh: penggunaAktif.nama,
          },
        ],
      });
      tambahAudit(
        'Order dikonversi menjadi kontrak',
        'Order',
        order.id,
        'Selesai',
        `Dikonversi — ${nomorPks} (Draft)`,
      );
      return null;
    },

    tambahMeeting: (input: MeetingInput) => {
      if (!input.tanggal) return 'Tanggal meeting wajib diisi.';
      if (!input.jam) return 'Jam meeting wajib diisi.';
      if (!input.peserta.trim()) return 'Peserta meeting wajib diisi.';
      if (!input.agenda.trim()) return 'Agenda meeting wajib diisi.';
      if (!input.prospectId && !input.klienId) {
        return 'Pilih prospek atau klien untuk meeting ini.';
      }
      if (
        input.prospectId &&
        !data.prospect.some((p) => p.id === input.prospectId)
      ) {
        return 'Prospek tidak ditemukan.';
      }
      if (
        input.klienId &&
        !data.klien.some((k) => k.id === input.klienId)
      ) {
        return 'Klien tidak ditemukan.';
      }
      const id = idBerikutnya('MTG-', data.meeting.map((m) => m.id));
      const meeting: Meeting = {
        id,
        tanggal: input.tanggal,
        jam: input.jam,
        prospectId: input.prospectId || undefined,
        klienId: input.klienId || undefined,
        peserta: input.peserta.trim(),
        agenda: input.agenda.trim(),
        hasil: input.hasil || undefined,
        satker: SATKER_PILOT,
      };
      setData((d) => ({ ...d, meeting: [...d.meeting, meeting] }));
      simpanKeFirestore('meeting', id, meeting);
      tambahAudit(
        'Meeting dijadwalkan',
        'Meeting',
        id,
        '—',
        `${input.tanggal} ${input.jam} — ${input.agenda.trim()}`,
      );
      return null;
    },

    // --- Aksi Fase B — Marketing (PRD Bab 7.2) ---
    tambahEvent: (input: EventInput) => {
      if (!input.nama.trim()) return 'Nama event wajib diisi.';
      if (!input.tanggal) return 'Tanggal event wajib diisi.';
      if (!input.penyelenggara.trim()) return 'Penyelenggara wajib diisi.';
      if (!(input.biaya >= 0)) return 'Biaya event tidak boleh negatif.';
      if (
        input.prospectId &&
        !data.prospect.some((p) => p.id === input.prospectId)
      ) {
        return 'Prospek yang dihasilkan tidak ditemukan.';
      }
      const id = idBerikutnya('EVT-', data.event.map((e) => e.id));
      const event: Event = {
        id,
        nama: input.nama.trim(),
        tanggal: input.tanggal,
        penyelenggara: input.penyelenggara.trim(),
        biaya: input.biaya,
        hasil: input.hasil || undefined,
        prospectId: input.prospectId || undefined,
        satker: SATKER_PILOT,
      };
      setData((d) => ({ ...d, event: [...d.event, event] }));
      simpanKeFirestore('event', id, event);
      tambahAudit(
        'Event dicatat',
        'Event',
        id,
        '—',
        `${event.nama} — ${formatRupiah(event.biaya)}`,
      );
      return null;
    },

    tambahAdvertisement: (input: AdvertisementInput) => {
      if (!input.nama.trim()) return 'Nama advertisement wajib diisi.';
      if (!input.media.trim()) return 'Media/saluran wajib diisi.';
      if (!input.periodeMulai) return 'Periode mulai wajib diisi.';
      if (!input.periodeSelesai) return 'Periode selesai wajib diisi.';
      if (input.periodeSelesai < input.periodeMulai) {
        return 'Periode selesai tidak boleh sebelum periode mulai.';
      }
      if (!(input.biaya >= 0)) return 'Biaya advertisement tidak boleh negatif.';
      const id = idBerikutnya('ADV-', data.advertisement.map((a) => a.id));
      const advertisement: Advertisement = {
        id,
        nama: input.nama.trim(),
        media: input.media.trim(),
        periodeMulai: input.periodeMulai,
        periodeSelesai: input.periodeSelesai,
        biaya: input.biaya,
        hasil: input.hasil || undefined,
        satker: SATKER_PILOT,
      };
      setData((d) => ({
        ...d,
        advertisement: [...d.advertisement, advertisement],
      }));
      simpanKeFirestore('advertisement', id, advertisement);
      tambahAudit(
        'Advertisement dicatat',
        'Advertisement',
        id,
        '—',
        `${advertisement.nama} — ${formatRupiah(advertisement.biaya)}`,
      );
      return null;
    },

    // --- Aksi Fase B — To-Do List (PRD Bab 7.7, 9.6) ---
    tambahTask: (input: TaskInput) => {
      if (!input.pemilik.trim()) return 'Pemilik tugas wajib diisi.';
      if (!input.judul.trim()) return 'Judul tugas wajib diisi.';
      if (!input.tenggat) return 'Tenggat tugas wajib diisi.';
      const id = idBerikutnya('TSK-', data.task.map((t) => t.id));
      const task: Task = {
        id,
        pemilik: input.pemilik.trim(),
        judul: input.judul.trim(),
        tenggat: input.tenggat,
        status: 'Belum Dikerjakan',
        terkaitId: input.terkaitId || undefined,
        terkaitLabel: input.terkaitLabel || undefined,
        satker: SATKER_PILOT,
      };
      setData((d) => ({ ...d, task: [...d.task, task] }));
      simpanKeFirestore('task', id, task);
      tambahAudit(
        'Tugas dicatat',
        'Tugas',
        id,
        '—',
        `${task.judul} — tenggat ${task.tenggat}`,
      );
      return null;
    },

    ubahStatusTask: (task: Task, status: StatusTask) => {
      const sah: Record<StatusTask, StatusTask[]> = {
        'Belum Dikerjakan': ['Berjalan'],
        Berjalan: ['Selesai', 'Belum Dikerjakan'],
        Selesai: ['Berjalan'],
        // 'Ditutup' hanya lewat tutupDisposisi (Alur F Bab 9.6).
        Ditutup: [],
      };
      if (!sah[task.status].includes(status)) return;
      setData((d) => ({
        ...d,
        task: d.task.map((t) =>
          t.id === task.id ? { ...t, status } : t,
        ),
      }));
      simpanKeFirestore('task', task.id, { ...task, status });
      tambahAudit(
        'Status tugas diubah',
        'Tugas',
        task.id,
        task.status,
        status,
      );
    },

    tambahDisposisi: (input: DisposisiInput) => {
      if (!input.penerima.trim()) return 'Penerima disposisi wajib diisi.';
      if (!input.judul.trim()) return 'Judul disposisi wajib diisi.';
      if (!input.instruksi.trim()) return 'Instruksi disposisi wajib diisi.';
      if (!input.tenggat) return 'Tenggat disposisi wajib diisi.';
      const noDisposisi = idBerikutnya(
        'DIS-',
        data.task.map((t) => t.disposisiDari ?? ''),
      );
      const id = idBerikutnya('TSK-', data.task.map((t) => t.id));
      const task: Task = {
        id,
        pemilik: input.penerima.trim(),
        judul: input.judul.trim(),
        tenggat: input.tenggat,
        status: 'Belum Dikerjakan',
        disposisiDari: noDisposisi,
        instruksi: input.instruksi.trim(),
        pemberiDisposisi: input.pemberiDisposisi.trim(),
        terkaitId: input.terkaitId || undefined,
        terkaitLabel: input.terkaitLabel || undefined,
        satker: SATKER_PILOT,
      };
      setData((d) => ({ ...d, task: [...d.task, task] }));
      simpanKeFirestore('task', id, task);
      tambahAudit(
        'Disposisi dibuat',
        'Disposisi',
        noDisposisi,
        '—',
        `${input.penerima.trim()} — ${input.judul.trim()}`,
      );
      return null;
    },

    tutupDisposisi: (task: Task) => {
      if (!task.pemberiDisposisi) return 'Tugas ini bukan disposisi.';
      if (task.status !== 'Selesai') {
        return 'Disposisi hanya dapat ditutup bila status tugas Selesai.';
      }
      // Model 1 role: hanya pemberi disposisi yang dapat menutupnya
      // (tidak ada lagi peran Admin yang terpisah).
      if (penggunaAktif.nama !== task.pemberiDisposisi) {
        return 'Hanya pemberi disposisi yang dapat menutup disposisi ini.';
      }
      setData((d) => ({
        ...d,
        task: d.task.map((t) =>
          t.id === task.id ? { ...t, status: 'Ditutup' as const } : t,
        ),
      }));
      simpanKeFirestore('task', task.id, { ...task, status: 'Ditutup' as const });
      tambahAudit(
        'Disposisi ditutup',
        'Disposisi',
        task.disposisiDari ?? task.id,
        'Selesai',
        'Ditutup',
      );
      return null;
    },
  };

  /** Jalankan migrasi satu kali (dari halaman Master & Pengguna). */
  const tanganiMigrasi = async () => {
    if (!db) {
      throw new Error('Firebase belum terkonfigurasi.');
    }
    const hasil = await jalankanMigrasi(db, {
      nama: penggunaAktif.nama,
      email: authEmail ?? EMAIL_OPERATOR_USULAN,
    });
    setSudahDimigrasi(true);
    setTanggalMigrasi(hasil.tanggal);
    setModeData('firestore');
    const dariFirestore = await muatDariFirestore(db, SATKER_PILOT.kode);
    if (dariFirestore) setData(dariFirestore);
    return hasil;
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
          <div className="flex items-center gap-3">
            <span className="flex h-10 shrink-0 items-center rounded-md bg-white px-2 py-1">
              <img src="/logo-rri.svg" alt="Logo RRI" className="h-7 w-auto" />
            </span>
            <span>
              <p className="text-lg font-bold leading-tight">Partnership</p>
              <p className="text-lg font-bold leading-tight">LPP RRI</p>
            </span>
          </div>
          <p className="mt-2 text-xs text-white/70">Radio Republik Indonesia</p>
          <p className="mt-1 text-xs text-white/70">Satker: PALEMBANG (Pilot)</p>
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
                {m.phase === 'C' && (
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
            onClick={async () => {
              await keluar();
              setUser(null);
              setAuthEmail(null);
              setData(DATA_NYATA);
              setModeData(
                isFirebaseConfigured ? 'belum-dimigrasi' : 'tidak-terkonfigurasi',
              );
              setSudahDimigrasi(false);
              setTanggalMigrasi(undefined);
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

          {modeData !== 'firestore' && (
            <div className="mt-4 max-w-2xl rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-4 py-3 text-sm">
              {modeData === 'tidak-terkonfigurasi' ? (
                <>
                  <strong>Data nyata Palembang — mode contoh.</strong> Data di
                  bawah ini adalah data nyata hasil impor dari spreadsheet kerja
                  pada {formatTanggal(TANGGAL_IMPOR)}. Konfigurasi Firebase belum
                  dipasang (lihat <code>.env.example</code>), jadi perubahan hanya
                  tersimpan di sesi ini dan belum tersimpan permanen. Data contoh
                  (prospek, quotation, order, event, tugas) tetap berlabel
                  &quot;(Contoh)&quot;.
                </>
              ) : (
                <>
                  <strong>Data contoh — belum dimigrasi ke Firestore.</strong>{' '}
                  Data di bawah ini masih data contoh dari spreadsheet kerja.
                  Jalankan migrasi di halaman Master &amp; Pengguna supaya
                  perubahan tersimpan permanen di Firestore.
                </>
              )}
            </div>
          )}
          {modeData === 'firestore' && (
            <div className="mt-4 max-w-2xl rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-4 py-3 text-sm">
              <strong>Data tersimpan di Firestore — Satker PALEMBANG.</strong>{' '}
              Perubahan tersimpan permanen.
            </div>
          )}
          {galatMuat && (
            <div className="mt-4 max-w-2xl rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-4 py-3 text-sm">
              <strong>Gagal memuat data dari Firestore:</strong> {galatMuat}{' '}
              Menampilkan data contoh.
            </div>
          )}
          {peringatanSimpan && (
            <div className="mt-4 max-w-2xl rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-4 py-3 text-sm">
              {peringatanSimpan}
            </div>
          )}

          <div className="mt-6">
            {active === 'dashboard' && <Dashboard {...propsModul} />}
            {active === 'deals' && <Deals {...propsModul} />}
            {active === 'sewa' && <Sewa {...propsModul} />}
            {active === 'pengajuan' && <Pengajuan {...propsModul} />}
            {active === 'revenue' && <Revenue {...propsModul} />}
            {active === 'reporting' && <Reporting {...propsModul} />}
            {active === 'sales' && <Sales {...propsModul} />}
            {active === 'marketing' && <Marketing {...propsModul} />}
            {active === 'todo' && <Todo {...propsModul} />}
            {active === 'audit' && <AuditPage {...propsModul} />}
            {active === 'master' && (
              <MasterPage
                {...propsModul}
                onMigrasi={tanganiMigrasi}
                statusMigrasi={
                  isFirebaseConfigured
                    ? sudahDimigrasi
                      ? 'sudah'
                      : 'belum'
                    : 'tidak-tersedia'
                }
                tanggalMigrasi={tanggalMigrasi}
              />
            )}
            {active === 'service' && (
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

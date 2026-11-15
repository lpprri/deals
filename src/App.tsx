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
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { auth, db, isFirebaseConfigured } from './lib/firebaseApp';
import {
  keluar,
  masukDenganEmail,
} from './lib/auth';
import { EMAIL_OPERATOR_USULAN, jalankanMigrasi } from './lib/migrasi';
import {
  cekSudahDimigrasi,
  kirimPengajuanPublik as kirimPengajuanPublikKeFirestore,
  muatDariFirestore,
  simpanDokumen,
  tulisAudit,
} from './lib/firestoreStore';
import { DATA_NYATA, TANGGAL_IMPOR } from './lib/seedNyata';
import type { DummyUser } from './lib/dummyUsers';
import {
  MASTER_KATEGORI_LAYANAN,
  MASTER_JENIS_DOKUMEN,
  MASTER_KATEGORI_TIKET,
  MASTER_PERTANYAAN_SURVEI,
  MASTER_SUMBER_PROSPEK,
  MASTER_TAHAP_PIPELINE,
  SATKER_PILOT,
  TUJUAN_TIKET,
} from './lib/master';
import { buatEntriAudit } from './lib/audit';
import { DAFTAR_JENIS_PENGAJUAN_KLIEN, type JenisPengajuanKlien } from './lib/types';
import { bolehAksi, LABEL_PERAN } from './lib/permissions';
import { formatRupiah, formatTanggal, hariIniIso } from './lib/format';
import {
  labelJabatan,
  labelKategoriLayanan,
  labelStatusOrder,
  labelStatusPersetujuan,
  labelTahapPipeline,
} from './lib/labels';
import type {
  Advertisement,
  AppData,
  ArtikelKB,
  BalasanTiket,
  DokumenItem,
  Event,
  Klien,
  Kontrak,
  LayananKontrak,
  Meeting,
  Order,
  Pengajuan as PengajuanData,
  PengajuanKlien,
  Prospect,
  Quotation,
  QuotationLayanan,
  StatusDokumen,
  StatusOrder,
  StatusQuotation,
  StatusTask,
  StatusTiket,
  TahapPengajuan,
  TahapPipeline,
  Task,
  Tiket,
  UmpanBalik,
} from './lib/types';
import type {
  AdvertisementInput,
  ArtikelKBInput,
  DendaInput,
  DisposisiInput,
  EventInput,
  KlienInput,
  KontrakInput,
  MeetingInput,
  OrderInput,
  PembayaranInput,
  PengajuanInput,
  PengajuanPublikInput,
  ProspectInput,
  QuotationInput,
  StoreActions,
  TaskInput,
  TiketInput,
  UmpanBalikInput,
} from './lib/store';
import Login from './components/Login';
import Beranda from './modules/Beranda';
import Lacak from './modules/Lacak';
import Ajukan from './modules/Ajukan';
import Dashboard from './modules/Dashboard';
import Deals from './modules/Deals';
import Sewa from './modules/Sewa';
import Pengajuan from './modules/Pengajuan';
import Revenue from './modules/Revenue';
import Reporting from './modules/Reporting';
import Sales from './modules/Sales';
import Marketing from './modules/Marketing';
import Todo from './modules/Todo';
import Service from './modules/Service';
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
  /**
   * Induk sub-item (keputusan pengguna 15/11/2026): item dengan `induk`
   * TIDAK tampil di daftar utama sidebar — hanya sebagai sub-item di
   * bawah induknya. Saat ini: 'sewa' di bawah 'deals', 'pengajuan' di
   * bawah 'sales'. Id tetap dipakai untuk `active` dan render konten.
   */
  induk?: ModuleId;
}

const MODULES: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    phase: 'A',
    description:
      'Period summary, Revenue Analytics, head office report deadlines (fill in by the 10th, submit by the 11th). Employee Rank & Satker Rank (Leaderboard of the Year / of the Month) per contract signing date period.',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: Megaphone,
    phase: 'B',
    description: 'Events and Advertisement.',
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: Briefcase,
    phase: 'B',
    description:
      'Prospect List, Sales Analytics, Quotation, Pipeline, Order, Meeting Schedule. New Submissions as a sub-module.',
  },
  {
    id: 'deals',
    label: 'Deals',
    icon: Handshake,
    phase: 'A',
    description:
      'Clients, Partnership Details (Functional PNBP, General PNBP, Service Support, Memorandum of Understanding, Media Partner), Contracts, Documents. Lease / State Assets (BMN) as a sub-module.',
  },
  {
    id: 'sewa',
    label: 'Lease / State Assets (BMN)',
    icon: Building2,
    phase: 'A',
    induk: 'deals',
    description:
      'One lease list (Deals → Partnership Details → General PNBP): All, ON GOING, Expiring Soon, New Applications, Received in Advance, Still Receivable, Field Findings, Indralaya.',
  },
  {
    id: 'pengajuan',
    label: 'Submission',
    icon: FilePlus2,
    phase: 'A',
    induk: 'sales',
    description:
      'New Submissions (new partnership / new lease): Received → Under review → Awaiting documents → Approved/Rejected → Converted to contract.',
  },
  {
    id: 'revenue',
    label: 'Revenue',
    icon: Wallet,
    phase: 'A',
    description:
      'Overview, Revenue Stream, Revenue Type, Invoice, Payments, Billings, and Reconciliation with Finance reference data (read-only).',
  },
  {
    id: 'reporting',
    label: 'Reporting',
    icon: FileText,
    phase: 'A',
    description:
      'Satker Reports: PNBP Report, Receivables & Deposits Report, Service Support Report, Memorandum of Understanding Report, Media Partner Report.',
  },
  {
    id: 'todo',
    label: 'To-Do List',
    icon: CheckSquare,
    phase: 'B',
    description: 'Individual Tasks and Dispositions.',
  },
  {
    id: 'service',
    label: 'Service',
    icon: BarChart3,
    phase: 'C',
    description:
      'Feedback Survey, Help-Desk to head office PIC, Knowledge Base (Regulations, SOP).',
  },
  {
    id: 'audit',
    label: 'Audit',
    icon: ShieldCheck,
    phase: 'Admin',
    description:
      'Audit trail (append-only). System Admin only; does not show Firebase configuration or admin email.',
  },
  {
    id: 'master',
    label: 'Master Data & Users',
    icon: Database,
    phase: 'Admin',
    description:
      'Centralised master data (account codes, services, programs, client types, document types, statuses, satker list) and dummy users.',
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
  /** Halaman publik tanpa login (lacak/ajukan) saat belum masuk. */
  const [halamanPublik, setHalamanPublik] = useState<'beranda' | 'login' | 'lacak' | 'ajukan'>('beranda');
  /** Prefill form Ajukan dari landing page (layanan/ruangan/lahan). */
  const [ajukanAwal, setAjukanAwal] = useState<{
    jenis: JenisPengajuanKlien;
    judul: string;
    uraian: string;
  } | null>(null);

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
            email: String(d.email ?? fbUser.email ?? ''),
            satker: d.satker as { kode: string; nama: string } | undefined,
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
  // Hanya Operator yang login; data selalu dimuat penuh dari Firestore.
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
            e instanceof Error ? e.message : 'Failed to load data from Firestore.',
          );
        }
      }
    })();
    return () => {
      batal = true;
    };
  }, [user]);

  /**
   * Kirim submission publik dari form "Ajukan" (REVISI KOREKSI 2026-11-15:
   * tanpa login/akun; menggantikan tambahPengajuanKlien khusus PIC).
   * Didefinisikan SEBELUM cabang `if (!user)` karena dipakai halaman
   * publik saat belum login. Submission masuk koleksi pengajuanKlien
   * dengan status selalu 'Menunggu' dan klienId kosong; audit TIDAK
   * ditulis di sini (audit hanya sesi Operator; dicatat saat Operator
   * memproses). Bila mode Firestore aktif, tulis juga ke Firestore;
   * bila tulis itu gagal, kembalikan pesan error (jangan menelan
   * diam-diam). Di luar mode Firestore, submission hanya tersimpan di
   * sesi ini — sama seperti aksi lain sebelum migrasi.
   */
  const kirimPengajuanPublik = async (
    input: PengajuanPublikInput,
  ): Promise<string | null> => {
    if (!DAFTAR_JENIS_PENGAJUAN_KLIEN.includes(input.jenis)) {
      return `Request type "${input.jenis}" is not recognised.`;
    }
    if (!input.namaPemohon.trim()) return 'Applicant name is required.';
    if (!input.namaInstitusi.trim()) return 'Institution name is required.';
    if (!input.kontakEmail.trim()) return 'Contact email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.kontakEmail.trim())) {
      return 'Contact email is not valid.';
    }
    if (!input.judul.trim()) return 'Request title is required.';
    if (!input.uraian.trim()) return 'Request details are required.';
    if (
      input.nilaiPerkiraan !== undefined &&
      !(input.nilaiPerkiraan >= 0)
    ) {
      return 'Estimated value must be 0 or more.';
    }
    const id = idBerikutnya('PKL-', data.pengajuanKlien.map((s) => s.id));
    const submission: PengajuanKlien = {
      id,
      klienId: '',
      jenis: input.jenis,
      judul: input.judul.trim(),
      uraian: input.uraian.trim(),
      namaPic: input.namaPemohon.trim(),
      dibuatOleh: input.kontakEmail.trim(),
      namaInstitusi: input.namaInstitusi.trim(),
      telepon: input.kontakTelepon?.trim() || undefined,
      tanggalBuat: hariIniIso(),
      nilaiPerkiraan: input.nilaiPerkiraan,
      status: 'Menunggu',
      satker: SATKER_PILOT,
    };
    setData((d) => ({
      ...d,
      pengajuanKlien: [...d.pengajuanKlien, submission],
    }));
    // Tulis ke Firestore bila terkonfigurasi. SENGAJA memakai
    // isFirebaseConfigured (bukan modeData === 'firestore'): modeData
    // baru menjadi 'firestore' SETELAH Operator login + muat data,
    // sedangkan pengunjung publik tidak pernah login — gate modeData
    // akan membuat submission publik tidak pernah sampai ke Firestore
    // di aplikasi live (hanya session-only lalu hilang saat reload).
    // Aturan publik pengajuanKlien mengizinkan create tanpa login.
    if (isFirebaseConfigured && db) {
      try {
        await kirimPengajuanPublikKeFirestore(db, submission);
      } catch (e) {
        console.error('Gagal menyimpan submission publik ke Firestore:', e);
        return 'Request recorded locally, but failed to save to Firestore — contact the Operator.';
      }
    }
    return null;
  };

  if (!user) {
    if (halamanPublik === 'beranda') {
      return (
        <Beranda
          data={data}
          onLogin={() => setHalamanPublik('login')}
          onTrack={() => setHalamanPublik('lacak')}
          onAjukan={(jenis, judul, uraian) => {
            setAjukanAwal({ jenis, judul, uraian });
            setHalamanPublik('ajukan');
          }}
        />
      );
    }
    if (halamanPublik === 'lacak') {
      return <Lacak data={data} onKembali={() => setHalamanPublik('beranda')} />;
    }
    if (halamanPublik === 'ajukan') {
      return (
        <Ajukan
          onKirim={kirimPengajuanPublik}
          onKembali={() => setHalamanPublik('beranda')}
          jenisAwal={ajukanAwal?.jenis}
          judulAwal={ajukanAwal?.judul}
          uraianAwal={ajukanAwal?.uraian}
        />
      );
    }
    return (
      <Login
        onLoginAuth={async (email, kataSandi) => {
          try {
            const appUser = await masukDenganEmail(email, kataSandi);
            setUser({
              nama: appUser.nama,
              jabatan: appUser.jabatan,
              peran: appUser.peran,
              email: appUser.email,
              satker: appUser.satker,
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
              return 'Incorrect email or password.';
            }
            if (kode === 'auth/too-many-requests') {
              return 'Too many sign-in attempts — try again later.';
            }
            if (kode === 'auth/network-request-failed') {
              return 'No network connection.';
            }
            return e instanceof Error ? e.message : 'Failed to sign in. Try again.';
          }
        }}
        onLoginDummy={setUser}
        onBukaLacak={() => setHalamanPublik('lacak')}
        onBukaAjukan={() => setHalamanPublik('ajukan')}
      />
    );
  }

  const penggunaAktif: DummyUser = user;

  /** Keluar: tutup sesi Auth dan kembalikan state ke mode contoh. */
  const tanganiKeluar = async () => {
    await keluar();
    setUser(null);
    setAuthEmail(null);
    setData(DATA_NYATA);
    setModeData(
      isFirebaseConfigured ? 'belum-dimigrasi' : 'tidak-terkonfigurasi',
    );
    setSudahDimigrasi(false);
    setTanggalMigrasi(undefined);
    setHalamanPublik('beranda');
    setActive('dashboard');
  };

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
    // Tulis audit ke Firestore HANYA untuk Operator: audit hanya
    // ditulis dari sesi Operator; submission publik tidak menulis
    // audit (audit dicatat saat Operator memprosesnya).
    if (modeData === 'firestore' && db && penggunaAktif.peran === 'operator') {
      tulisAudit(db, entri).catch((e) => {
        console.error('Gagal menulis audit ke Firestore:', e);
        setPeringatanSimpan(
          'Failed to save the audit record to Firestore — changes exist only in this session.',
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
        'Failed to save changes to Firestore — changes exist only in this session.',
      );
    });
  };

  const actions: StoreActions = {
    tambahKlien: (input: KlienInput) => {
      if (!input.nama.trim()) return 'Client name is required.';
      if (!input.telepon.trim()) return 'Client phone number is required.';
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
      if (!input.nomorPks.trim()) return 'PKS number is required.';
      if (data.kontrak.some((k) => k.nomorPks === input.nomorPks.trim())) {
        return `PKS number ${input.nomorPks.trim()} is already used by another contract.`;
      }
      if (!input.tanggalMulai) return 'Start date is required.';
      if (!input.tanggalSelesai) return 'End date is required.';
      if (input.tanggalSelesai < input.tanggalMulai) {
        return 'End date cannot be before start date.';
      }
      if (input.layanan.length === 0) return 'A contract must have at least 1 service line.';
      for (const [i, l] of input.layanan.entries()) {
        if (l.tarif <= 0) return `Service rate on line ${i + 1} must be more than 0.`;
        if (l.jumlah <= 0) return `Service quantity on line ${i + 1} must be more than 0.`;
      }
      const kategori = MASTER_KATEGORI_LAYANAN.find((k) => k.nama === input.kategoriLayanan);
      if (!kategori) return `Service category "${labelKategoriLayanan(input.kategoriLayanan)}" is not recognised.`;
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
        tanggalTandaTangan: input.tanggalTandaTangan || undefined,
        tanggalMulai: input.tanggalMulai,
        tanggalSelesai: input.tanggalSelesai,
        nilaiKontrak,
        status: 'Draft',
        penanggungJawab: input.penanggungJawab,
        operatorPenutup:
          input.operatorPenutup?.trim() || penggunaAktif.nama,
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

    ubahAtribusiKontrak: (kontrak, input) => {
      const operator = (input.operatorPenutup ?? '').trim();
      const tanggal = (input.tanggalTandaTangan ?? '').trim();
      // Tanpa validasi tanggal tambahan: tanggal tanda tangan bisa
      // mendahului tanggal mulai (lazim) dan data sumber pun punya
      // tanggal yang tidak berurutan rapi — jangan tolak input yang sah.
      const kontrakBaru: Kontrak = {
        ...kontrak,
        operatorPenutup: operator === '' ? undefined : operator,
        tanggalTandaTangan: tanggal === '' ? undefined : tanggal,
      };
      setData((d) => ({
        ...d,
        kontrak: d.kontrak.map((k) => (k.id === kontrak.id ? kontrakBaru : k)),
      }));
      simpanKeFirestore('kontrak', kontrak.id, kontrakBaru);
      tambahAudit(
        'Atribusi kontrak diubah',
        'Kontrak',
        kontrak.nomorPks,
        kontrak.operatorPenutup ?? '—',
        `Operator penutup: ${kontrakBaru.operatorPenutup ?? '—'}; tanggal tanda tangan: ${kontrakBaru.tanggalTandaTangan ?? '—'}`,
      );
      return null;
    },

    catatPembayaran: (input: PembayaranInput) => {
      const tagihan = data.tagihan.find((t) => t.id === input.tagihanId);
      if (!tagihan) return 'Invoice not found.';
      if (!input.tanggalBayar) return 'Payment date is required.';
      if (input.jumlah <= 0) return 'Payment amount must be more than 0.';
      const sisa =
        tagihan.nilai -
        data.pembayaran
          .filter((p) => p.tagihanId === tagihan.id && p.statusVerifikasi === 'Terverifikasi')
          .reduce((s, p) => s + p.jumlah, 0);
      if (input.jumlah > sisa) {
        return `Payment amount (Rp${input.jumlah.toLocaleString('id-ID')}) exceeds the outstanding receivables for this invoice (Rp${sisa.toLocaleString('id-ID')}).`;
      }
      if (!input.penyetor.trim()) return 'Payer is required.';
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
      if (!input.dasar.trim()) return 'Late-payment basis is required.';
      if (input.jumlah <= 0) return 'Late fee amount must be more than 0.';
      const tagihan = data.tagihan.find((t) => t.id === input.tagihanId);
      if (!tagihan) return 'Invoice not found.';
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
      if (!input.pemohon.trim()) return 'Applicant is required.';
      if (!input.tanggalMasuk) return 'Received date is required.';
      if (!input.kebutuhan.trim()) return 'Requirements are required.';
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
        return 'A submission can only be converted when its stage is Approved.';
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
        operatorPenutup: penggunaAktif.nama,
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

    // --- Aksi Fase C — Form submission publik (REVISI KOREKSI 2026-11-15) ---
    // Submission berasal dari form publik tanpa akun (lihat
    // kirimPengajuanPublik di atas); aksi tambahPengajuanKlien khusus PIC
    // login sudah dihapus. Approval dilakukan OPERATOR. Submission yang
    // disetujui TIDAK menjadi entitas order kedua — ia menjadi Prospect
    // baru lewat alur Sales yang sudah ada (prospect → quotation → order
    // → kontrak); submission menautkannya lewat `prospectId`. Bila
    // submission berasal dari calon klien yang belum tercatat (klienId
    // kosong), Operator menyetujui sekaligus dibuatkan Klien baru.
    setujuiPengajuanKlien: (submission: PengajuanKlien, catatan?: string) => {
      if (penggunaAktif.peran !== 'operator') {
        return 'Only the Operator can approve portal submissions.';
      }
      if (submission.status !== 'Menunggu') {
        return 'This submission has already been processed.';
      }
      // REVISI KOREKSI 2026-11-15: submission publik dari calon klien
      // yang belum tercatat punya klienId kosong — buatkan Klien baru
      // dari submission (pola konversiPengajuan) sebelum membuat
      // Prospect. Bila klienId ada dan ditemukan, perilaku lama tetap.
      let klien = submission.klienId
        ? data.klien.find((k) => k.id === submission.klienId)
        : undefined;
      let klienBaru: Klien | null = null;
      if (!klien) {
        const id = idBerikutnya('KLN-', data.klien.map((k) => k.id));
        klienBaru = {
          id,
          nama: submission.namaInstitusi ?? submission.namaPic,
          jenis: 'Swasta',
          alamat: '—',
          kontakNama: submission.namaPic,
          kontakJabatan: '—',
          telepon: submission.telepon ?? '',
          email: submission.dibuatOleh,
          status: 'Aktif',
          catatan: `Klien dibuat otomatis dari submission publik ${submission.id}. Lengkapi datanya.`,
          satker: submission.satker,
          dibuatOleh: penggunaAktif.nama,
          dibuatPada: hariIniIso(),
        };
        klien = klienBaru;
      }
      const kategoriNama =
        submission.jenis === 'Permohonan Sewa'
          ? 'Sewa Lahan / BMN'
          : submission.jenis === 'Media Order'
            ? 'Siaran Iklan (Spot/Jingle/Filler/Advetorial)'
            : 'Dukungan Layanan';
      const kategori = MASTER_KATEGORI_LAYANAN.find(
        (k) => k.nama === kategoriNama,
      )!;
      const idProspect = idBerikutnya('PRS-', data.prospect.map((p) => p.id));
      const prospect: Prospect = {
        id: idProspect,
        namaInstansi: klien.nama,
        kontakNama: submission.namaPic,
        telepon: klien.telepon,
        email: submission.dibuatOleh,
        sumber: 'Pengajuan',
        layananDiminati: kategori.nama,
        tahap: 'Prospek Baru',
        penanggungJawab: penggunaAktif.nama,
        nilaiPerkiraan: submission.nilaiPerkiraan ?? 0,
        catatan: `Berasal dari submission publik ${submission.id} (${submission.jenis}) — disetujui Operator.`,
        klienId: klien.id,
        riwayat: [
          {
            tanggal: hariIniIso(),
            catatan: `Prospek dibuat dari submission publik ${submission.id} yang disetujui.`,
            oleh: penggunaAktif.nama,
          },
        ],
        satker: submission.satker,
      };
      const terbaru: PengajuanKlien = {
        ...submission,
        klienId: klien.id,
        status: 'Disetujui',
        catatanOperator: catatan?.trim() || undefined,
        prospectId: idProspect,
      };
      setData((d) => ({
        ...d,
        klien: klienBaru ? [...d.klien, klienBaru] : d.klien,
        prospect: [...d.prospect, prospect],
        pengajuanKlien: d.pengajuanKlien.map((s) =>
          s.id === submission.id ? terbaru : s,
        ),
      }));
      if (klienBaru) simpanKeFirestore('klien', klienBaru.id, klienBaru);
      simpanKeFirestore('prospect', idProspect, prospect);
      simpanKeFirestore('pengajuanKlien', submission.id, terbaru);
      tambahAudit(
        'Submission portal disetujui',
        'Pengajuan Klien',
        submission.id,
        'Menunggu',
        `Disetujui — Prospect ${idProspect}`,
      );
      return null;
    },

    tolakPengajuanKlien: (submission: PengajuanKlien, catatan: string) => {
      if (penggunaAktif.peran !== 'operator') {
        return 'Only the Operator can reject portal submissions.';
      }
      if (submission.status !== 'Menunggu') {
        return 'This submission has already been processed.';
      }
      if (!catatan.trim()) return 'A rejection note is required.';
      const terbaru: PengajuanKlien = {
        ...submission,
        status: 'Ditolak',
        catatanOperator: catatan.trim(),
      };
      setData((d) => ({
        ...d,
        pengajuanKlien: d.pengajuanKlien.map((s) =>
          s.id === submission.id ? terbaru : s,
        ),
      }));
      simpanKeFirestore('pengajuanKlien', submission.id, terbaru);
      tambahAudit(
        'Submission portal ditolak',
        'Pengajuan Klien',
        submission.id,
        'Menunggu',
        `Ditolak — ${catatan.trim()}`,
      );
      return null;
    },

    // --- Aksi Fase B — Sales (PRD Bab 7.3, 9.5) ---
    tambahProspect: (input: ProspectInput) => {
      if (!input.namaInstansi.trim()) return 'Institution name is required.';
      if (!input.kontakNama.trim()) return 'Contact name is required.';
      if (!input.telepon.trim()) return 'Phone number is required.';
      if (!MASTER_SUMBER_PROSPEK.includes(input.sumber)) {
        return `Prospect source "${input.sumber}" is not recognised.`;
      }
      if (
        !MASTER_KATEGORI_LAYANAN.some((k) => k.nama === input.layananDiminati)
      ) {
        return `Service "${input.layananDiminati}" is not recognised.`;
      }
      if (!(input.nilaiPerkiraan > 0)) return 'Estimated value must be more than 0.';
      if (
        input.pengajuanId &&
        !data.pengajuan.some((p) => p.id === input.pengajuanId)
      ) {
        return 'Source submission not found.';
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
      if (!catatan.trim()) return 'A stage-change note is required.';
      if (!MASTER_TAHAP_PIPELINE.includes(tahap)) {
        return `Stage "${tahap}" is not recognised.`;
      }
      if (prospect.tahap === tahap) {
        return 'The prospect is already at that stage.';
      }
      if (prospect.tahap === 'Diterima' || prospect.tahap === 'Ditolak') {
        return `A prospect at the ${labelTahapPipeline(prospect.tahap)} stage is final and cannot be moved.`;
      }
      // Tahap 'Order' dan 'Diterima' dicapai otomatis lewat tambahOrder /
      // konversiOrder, bukan pindah manual (supaya jejak tetap konsisten).
      if (tahap === 'Order') {
        return 'The Order stage is reached automatically when an order is created from an approved quotation.';
      }
      if (tahap === 'Diterima') {
        return 'The Accepted stage can only be reached by converting an order into a contract.';
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
      if (!prospect) return 'Prospect not found.';
      if (prospect.tahap === 'Diterima' || prospect.tahap === 'Ditolak') {
        return 'A prospect at a final stage cannot be given a quotation.';
      }
      if (!input.berlakuSampai) return 'Valid-until date is required.';
      if (input.layanan.length === 0) {
        return 'A quotation must have at least 1 service line.';
      }
      for (const [i, l] of input.layanan.entries()) {
        const kat = MASTER_KATEGORI_LAYANAN.find((k) => k.nama === l.kategori);
        if (!kat) return `Service category on line ${i + 1} is not recognised.`;
        if (!(l.tarif > 0)) {
          return `Service rate on line ${i + 1} must be more than 0.`;
        }
        if (!(l.jumlah > 0)) {
          return `Service quantity on line ${i + 1} must be more than 0.`;
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
        return `Quotation status cannot be changed from ${labelStatusPersetujuan(quotation.status)} to ${labelStatusPersetujuan(status)}.`;
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
      if (!quotation) return 'Quotation not found.';
      if (quotation.status !== 'Disetujui') {
        return 'An order can only be created from an approved quotation.';
      }
      if (
        data.order.some(
          (o) => o.quotationId === quotation.id && o.status !== 'Dibatalkan',
        )
      ) {
        return `Quotation ${quotation.id} already has an active order.`;
      }
      const prospect = data.prospect.find((p) => p.id === quotation.prospectId);
      // Q-11: prospek menjadi klien SAAT ORDER DIBUAT — buat/tautkan Klien
      // dari prospek dan simpan tautannya di prospect.klienId (field
      // "Tautan ke klien bila prospek sudah menjadi klien"). Membuat Klien
      // tidak mengubah total kontrol (bukan kontrak/tagihan/pembayaran).
      // Logika pencocokan sama dengan konversiOrder, supaya order yang
      // sama tidak membuat klien ganda: pakai klien yang sudah ditaut,
      // cocokkan nama, atau buat baru.
      let klien = prospect?.klienId
        ? data.klien.find((k) => k.id === prospect.klienId)
        : undefined;
      if (!klien && prospect) {
        const namaBersih = prospect.namaInstansi.replace(/ \(Contoh\)$/, '');
        klien = data.klien.find(
          (k) => k.nama.replace(/ \(Contoh\)$/, '') === namaBersih,
        );
      }
      let klienBaru: Klien | null = null;
      if (!klien && prospect) {
        const idKlien = idBerikutnya('KLN-', data.klien.map((k) => k.id));
        klienBaru = {
          id: idKlien,
          nama: prospect.namaInstansi,
          jenis: 'Swasta',
          alamat: '—',
          kontakNama: prospect.kontakNama,
          kontakJabatan: prospect.kontakJabatan ?? '—',
          telepon: prospect.telepon,
          email: prospect.email ?? '—',
          status: 'Aktif',
          catatan: `Klien dibuat otomatis dari prospek ${prospect.id} saat order dibuat. Lengkapi datanya.`,
          satker: SATKER_PILOT,
          dibuatOleh: penggunaAktif.nama,
          dibuatPada: hariIniIso(),
        };
        klien = klienBaru;
      }
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
        klien: klienBaru ? [...d.klien, klienBaru] : d.klien,
        prospect: d.prospect.map((p) =>
          p.id === quotation.prospectId
            ? {
                ...p,
                tahap: tahapMaju(p.tahap, 'Order'),
                klienId: klien ? klien.id : p.klienId,
                riwayat: [
                  ...p.riwayat,
                  {
                    tanggal: hariIniIso(),
                    catatan: `Order ${id} dibuat dari quotation ${quotation.id}.${klienBaru ? ` Klien ${klienBaru.id} dibuat dari prospek.` : ''}`,
                    oleh: penggunaAktif.nama,
                  },
                ],
              }
            : p,
        ),
      }));
      simpanKeFirestore('order', id, order);
      if (klienBaru) simpanKeFirestore('klien', klienBaru.id, klienBaru);
      if (prospect) {
        simpanKeFirestore('prospect', quotation.prospectId, {
          ...prospect,
          tahap: tahapMaju(prospect.tahap, 'Order'),
          klienId: klien ? klien.id : prospect.klienId,
          riwayat: [
            ...prospect.riwayat,
            {
              tanggal: hariIniIso(),
              catatan: `Order ${id} dibuat dari quotation ${quotation.id}.${klienBaru ? ` Klien ${klienBaru.id} dibuat dari prospek.` : ''}`,
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
        `${prospect?.namaInstansi ?? quotation.prospectId} — ${formatRupiah(quotation.nilai)} (Draft)${klien ? ` · Klien ${klien.id}` : ''}`,
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
        return `Order status cannot be changed from ${labelStatusOrder(order.status)} to ${labelStatusOrder(status)}.`;
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
        return 'An order can only be converted when its status is Completed.';
      }
      if (order.kontrakId) {
        return `Order ${order.id} has already been converted into ${order.kontrakId}.`;
      }
      const quotation = data.quotation.find((q) => q.id === order.quotationId);
      if (!quotation) return "The order's source quotation was not found.";
      const prospect = data.prospect.find((p) => p.id === order.prospectId);
      if (!prospect) return "The order's source prospect was not found.";
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
        operatorPenutup: penggunaAktif.nama,
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
                tahap: 'Diterima',
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
        tahap: 'Diterima',
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
      if (!input.tanggal) return 'Meeting date is required.';
      if (!input.jam) return 'Meeting time is required.';
      if (!input.peserta.trim()) return 'Meeting attendees are required.';
      if (!input.agenda.trim()) return 'Meeting agenda is required.';
      if (!input.prospectId && !input.klienId) {
        return 'Select a prospect or client for this meeting.';
      }
      if (
        input.prospectId &&
        !data.prospect.some((p) => p.id === input.prospectId)
      ) {
        return 'Prospect not found.';
      }
      if (
        input.klienId &&
        !data.klien.some((k) => k.id === input.klienId)
      ) {
        return 'Client not found.';
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
      if (!input.nama.trim()) return 'Event name is required.';
      if (!input.tanggal) return 'Event date is required.';
      if (!input.penyelenggara.trim()) return 'Organiser is required.';
      if (!(input.biaya >= 0)) return 'Event cost cannot be negative.';
      if (
        input.prospectId &&
        !data.prospect.some((p) => p.id === input.prospectId)
      ) {
        return 'The resulting prospect was not found.';
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
      if (!input.nama.trim()) return 'Advertisement name is required.';
      if (!input.media.trim()) return 'Media / channel is required.';
      if (!input.periodeMulai) return 'Start period is required.';
      if (!input.periodeSelesai) return 'End period is required.';
      if (input.periodeSelesai < input.periodeMulai) {
        return 'End period cannot be before start period.';
      }
      if (!(input.biaya >= 0)) return 'Advertisement cost cannot be negative.';
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
      if (!input.pemilik.trim()) return 'Task owner is required.';
      if (!input.judul.trim()) return 'Task title is required.';
      if (!input.tenggat) return 'Task deadline is required.';
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
      if (!input.penerima.trim()) return 'Disposition recipient is required.';
      if (!input.judul.trim()) return 'Disposition title is required.';
      if (!input.instruksi.trim()) return 'Disposition instructions are required.';
      if (!input.tenggat) return 'Disposition deadline is required.';
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
      if (!task.pemberiDisposisi) return 'This task is not a disposition.';
      if (task.status !== 'Selesai') {
        return 'A disposition can only be closed when the task status is Completed.';
      }
      // Model 1 role: hanya pemberi disposisi yang dapat menutupnya
      // (tidak ada lagi peran Admin yang terpisah).
      if (penggunaAktif.nama !== task.pemberiDisposisi) {
        return 'Only the disposition giver can close this disposition.';
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

    // --- Aksi Fase C — Service (PRD Bab 7.8; Q-12) ---
    tambahTiket: (input: TiketInput) => {
      if (!MASTER_KATEGORI_TIKET.includes(input.kategori)) {
        return 'Consultation category is not recognised.';
      }
      if (!input.judul.trim()) return 'Ticket title is required.';
      if (!input.isi.trim()) return 'Consultation details are required.';
      const id = idBerikutnya('TKT-', data.tiket.map((t) => t.id));
      const tiket: Tiket = {
        id,
        kategori: input.kategori,
        judul: input.judul.trim(),
        isi: input.isi.trim(),
        tujuan: TUJUAN_TIKET,
        tanggal: hariIniIso(),
        dibuatOleh: penggunaAktif.nama,
        status: 'Terbuka',
        balasan: [],
        satker: SATKER_PILOT,
      };
      setData((d) => ({ ...d, tiket: [...d.tiket, tiket] }));
      simpanKeFirestore('tiket', id, tiket);
      tambahAudit(
        'Tiket Help-Desk dibuat',
        'Tiket',
        id,
        '—',
        `${tiket.kategori} — ${tiket.judul}`,
      );
      return null;
    },

    tambahBalasanTiket: (tiket: Tiket, isi: string) => {
      if (tiket.status === 'Ditutup') {
        return 'The ticket is already closed — reopen it before replying.';
      }
      if (!isi.trim()) return 'Reply content is required.';
      const balasan: BalasanTiket = {
        id: idBerikutnya('BLS-', tiket.balasan.map((b) => b.id)),
        tanggal: hariIniIso(),
        isi: isi.trim(),
        oleh: penggunaAktif.nama,
      };
      const statusBaru: StatusTiket =
        tiket.status === 'Terbuka' ? 'Dijawab' : tiket.status;
      const tiketBaru: Tiket = {
        ...tiket,
        status: statusBaru,
        balasan: [...tiket.balasan, balasan],
      };
      setData((d) => ({
        ...d,
        tiket: d.tiket.map((t) => (t.id === tiket.id ? tiketBaru : t)),
      }));
      simpanKeFirestore('tiket', tiket.id, tiketBaru);
      tambahAudit(
        'Tiket Help-Desk dijawab',
        'Tiket',
        tiket.id,
        tiket.status,
        statusBaru === tiket.status ? 'Balasan ditambahkan' : statusBaru,
      );
      return null;
    },

    ubahStatusTiket: (tiket: Tiket, status: StatusTiket) => {
      const sah: Record<StatusTiket, StatusTiket[]> = {
        Terbuka: ['Dijawab', 'Ditutup'],
        Dijawab: ['Terbuka', 'Ditutup'],
        // Ditutup bisa dibuka kembali bila ada konsultasi lanjutan.
        Ditutup: ['Terbuka'],
      };
      if (!sah[tiket.status].includes(status)) return;
      setData((d) => ({
        ...d,
        tiket: d.tiket.map((t) =>
          t.id === tiket.id ? { ...t, status } : t,
        ),
      }));
      simpanKeFirestore('tiket', tiket.id, { ...tiket, status });
      tambahAudit('Status tiket diubah', 'Tiket', tiket.id, tiket.status, status);
    },

    tambahUmpanBalik: (input: UmpanBalikInput) => {
      const kontrak = data.kontrak.find((k) => k.id === input.kontrakId);
      if (!kontrak) return 'Related contract not found.';
      if (data.umpanBalik.some((u) => u.kontrakId === input.kontrakId)) {
        return 'This contract already has a satisfaction survey.';
      }
      for (const p of MASTER_PERTANYAAN_SURVEI) {
        const j = input.jawaban.find((x) => x.pertanyaan === p);
        if (!j || j.skor < 1 || j.skor > 5) {
          return `Question "${p}" must be answered with a score of 1–5.`;
        }
      }
      const id = idBerikutnya('UMP-', data.umpanBalik.map((u) => u.id));
      const umpanBalik: UmpanBalik = {
        id,
        kontrakId: input.kontrakId,
        tanggal: hariIniIso(),
        jawaban: MASTER_PERTANYAAN_SURVEI.map((p) => ({
          pertanyaan: p,
          skor: input.jawaban.find((x) => x.pertanyaan === p)!.skor,
        })),
        komentar: input.komentar?.trim() || undefined,
        dibuatOleh: penggunaAktif.nama,
        satker: SATKER_PILOT,
      };
      setData((d) => ({ ...d, umpanBalik: [...d.umpanBalik, umpanBalik] }));
      simpanKeFirestore('umpanBalik', id, umpanBalik);
      tambahAudit(
        'Survei kepuasan dicatat',
        'Umpan Balik',
        id,
        '—',
        `${kontrak.nomorPks} — rata-rata ${(
          umpanBalik.jawaban.reduce((s, j) => s + j.skor, 0) /
          umpanBalik.jawaban.length
        ).toFixed(1)}/5`,
      );
      return null;
    },

    tambahArtikelKB: (input: ArtikelKBInput) => {
      if (!input.judul.trim()) return 'Document title is required.';
      if (!input.ringkasan.trim()) return 'Document summary is required.';
      if (input.tautan && !/^https?:\/\//i.test(input.tautan.trim())) {
        return 'Document link must start with http:// or https://.';
      }
      const id = idBerikutnya('KB-', data.artikelKB.map((a) => a.id));
      const artikel: ArtikelKB = {
        id,
        judul: input.judul.trim(),
        nomor: input.nomor?.trim() || undefined,
        tanggalBerlaku: input.tanggalBerlaku || undefined,
        ringkasan: input.ringkasan.trim(),
        isi: input.isi?.trim() || undefined,
        tautan: input.tautan?.trim() || undefined,
        dibuatOleh: penggunaAktif.nama,
        dibuatPada: hariIniIso(),
      };
      setData((d) => ({ ...d, artikelKB: [...d.artikelKB, artikel] }));
      simpanKeFirestore('artikelKB', id, artikel);
      tambahAudit(
        'Dokumen Knowledge Base ditambah',
        'Knowledge Base',
        id,
        '—',
        artikel.judul,
      );
      return null;
    },
  };

  /** Jalankan migrasi satu kali (dari halaman Master & Pengguna). */
  const tanganiMigrasi = async () => {
    if (!db) {
      throw new Error('Firebase is not yet configured.');
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

  // Daftar utama sidebar: hanya item tanpa induk (sub-item dirender di
  // bawah induknya, lihat nav di bawah).
  const navUtama = MODULES.filter((m) => m.phase !== 'Admin' && !m.induk);
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
            const anak = MODULES.filter((c) => c.induk === m.id);
            return (
              <div key={m.id}>
                <button
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
                      Phase {m.phase}
                    </span>
                  )}
                </button>
                {anak.map((c) => {
                  const AnakIcon = c.icon;
                  const anakAktif = c.id === active;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActive(c.id)}
                      className={`mt-1 flex w-full items-center gap-3 rounded-md py-2 pl-10 pr-3 text-left text-sm ${
                        anakAktif
                          ? 'bg-[#2573e2] font-semibold text-white'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <AnakIcon size={15} />
                      {c.label}
                    </button>
                  );
                })}
              </div>
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
          <p className="mt-1">{LABEL_PERAN[penggunaAktif.peran]}</p>
          <p>{labelJabatan(penggunaAktif.jabatan)}</p>
          <button
            onClick={tanganiKeluar}
            className="mt-3 flex items-center gap-2 rounded-md border border-white/30 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
          >
            <LogOut size={13} /> Sign out
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
            placeholder="Search clients, contracts, invoices…"
            className="w-full max-w-md rounded-md border border-[#2573e2]/40 px-3 py-2 text-sm outline-none placeholder:text-[#0d2569]/50 focus:border-[#2573e2]"
          />
          <button
            onClick={() => setActive('pengajuan')}
            className="ml-auto rounded-md bg-[#2573e2] px-4 py-2 text-sm font-semibold text-white"
          >
            + Add
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
                  <strong>Real Palembang data — sample mode.</strong> The data
                  below is real data imported from the working spreadsheet on{' '}
                  {formatTanggal(TANGGAL_IMPOR)}. Firebase is not configured
                  yet (see <code>.env.example</code>), so changes are only
                  saved in this session and not stored permanently. Sample
                  data (prospects, quotations, orders, events, tasks) remains
                  labelled &quot;(Sample)&quot;.
                </>
              ) : (
                <>
                  <strong>Sample data — not yet migrated to Firestore.</strong>{' '}
                  The data below is still sample data from the working
                  spreadsheet. Run the migration on the Master Data &amp;
                  Users page so changes are stored permanently in Firestore.
                </>
              )}
            </div>
          )}
          {modeData === 'firestore' && (
            <div className="mt-4 max-w-2xl rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-4 py-3 text-sm">
              <strong>Data stored in Firestore — Satker PALEMBANG.</strong>{' '}
              Changes are stored permanently.
            </div>
          )}
          {galatMuat && (
            <div className="mt-4 max-w-2xl rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-4 py-3 text-sm">
              <strong>Failed to load data from Firestore:</strong> {galatMuat}{' '}
              Showing sample data.
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
            {active === 'service' && <Service {...propsModul} />}
          </div>
        </main>
      </div>
    </div>
  );
}

// Partnership LPP RRI — App Fase A + Fase B (PRD Bab 12.3–12.4).
// Shell 8 modul (Bab 4) + palet 3 warna RRI (Bab 8.2): Biru #2573E2,
// Navy #0D2569, Putih #FFFFFF. Modul Service (Fase C) tampil "segera hadir".
// Login memakai Firebase Auth bila terkonfigurasi; bila belum, mode contoh
// memakai 1 operator dummy (keputusan pengguna 14/11/2026: hanya 1 role —
// Operator, staf Layanan & Pengembangan Usaha). Store ada di state App;
// setiap aksi menulis audit trail. Bila Firestore sudah dimigrasi, aksi
// tulis juga disimpan ke Firestore; bila belum, perubahan session-only.

import { Fragment, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import {
  BarChart3,
  Briefcase,
  Building2,
  CalendarDays,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Database,
  FilePlus2,
  FileSignature,
  FileText,
  Handshake,
  HeartHandshake,
  Home,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageSquare,
  ScrollText,
  ShieldCheck,
  Stamp,
  Tag,
  UserPlus,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { auth, db, isFirebaseConfigured } from './lib/firebaseApp';
import {
  buatAkunInternal,
  daftarDenganEmail,
  keluar,
  masukDenganEmail,
  peranDikenal,
} from './lib/auth';
import { EMAIL_OPERATOR_USULAN, jalankanMigrasi } from './lib/migrasi';
import {
  bacaStatusRemigrasi,
  jalankanRemigrasi,
  pratinjauRemigrasi,
} from './lib/remigrasi';
import type {
  HasilRemigrasi,
  KemajuanRemigrasi,
} from './lib/remigrasi';
import type { PratinjauRemigrasi } from './lib/remigrasiRencana';
import {
  bacaStatusMigrasiMou,
  jalankanMigrasiMou,
} from './lib/migrasiMou';
import type {
  HasilMigrasiMou,
  KemajuanMigrasiMou,
} from './lib/migrasiMou';
import {
  bacaStatusPerbaikanMou037,
  jalankanPerbaikanMou037,
} from './lib/perbaikanMou037';
import type {
  HasilPerbaikanMou037,
  KemajuanPerbaikanMou037,
} from './lib/perbaikanMou037';
import {
  bacaStatusMigrasiCommitment,
  jalankanMigrasiCommitment,
} from './lib/migrasiCommitment';
import type {
  HasilMigrasiCommitment,
  KemajuanMigrasiCommitment,
} from './lib/migrasiCommitment';
import {
  bacaStatusBackfillKlienId,
  jalankanBackfillKlienId,
} from './lib/backfillKlienId';
import type {
  HasilBackfillKlienId,
  KemajuanBackfillKlienId,
} from './lib/backfillKlienId';
import {
  cekSudahDimigrasi,
  kirimBookingPublik as kirimBookingPublikKeFirestore,
  kirimPengajuanPublik as kirimPengajuanPublikKeFirestore,
  kirimPermintaanSpacePublik as kirimPermintaanSpacePublikKeFirestore,
  kirimPermintaanTrainingPublik as kirimPermintaanTrainingPublikKeFirestore,
  kirimPermintaanVenuePublik as kirimPermintaanVenuePublikKeFirestore,
  muatDariFirestore,
  muatDataKlien,
  simpanDokumen,
  tulisAudit,
} from './lib/firestoreStore';
import { DATA_NYATA, TANGGAL_IMPOR } from './lib/seedNyata';
import { ARTIKEL_REGULASI } from './lib/artikelRegulasi';
import { FAQ_REGULASI } from './lib/faqRegulasi';
import type { DummyUser } from './lib/dummyUsers';
import {
  MASTER_KATEGORI_LAYANAN,
  MASTER_JENIS_DOKUMEN,
  MASTER_KATEGORI_TIKET,
  MASTER_PERTANYAAN_SURVEI,
  MASTER_SUMBER_PROSPEK,
  MASTER_TAHAP_PIPELINE,
  OPERATOR_PALEMBANG,
  SATKER_PILOT,
  TUJUAN_TIKET,
} from './lib/master';
import {
  BENIH_ACAK_ATRIBUSI,
  distribusiAcakOperator,
  ringkasanDistribusi,
} from './lib/derive';
import { buatEntriAudit } from './lib/audit';
import { idPercakapan, kunciAlamatOperator } from './lib/pesan';
import Notifikasi from './components/Notifikasi';
import { DAFTAR_JENIS_PENGAJUAN_KLIEN } from './lib/types';
import { bolehAksi, LABEL_PERAN } from './lib/permissions';
import { formatRupiah, formatTanggal, hariIniIso } from './lib/format';
import { LOGO_DEALS_DATA_URI } from './lib/logoDeals';
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
  PermintaanLayanan,
  Pesan,
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
  BookingPublikInput,
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
  PermintaanSpacePublikInput,
  PermintaanTrainingPublikInput,
  PermintaanVenuePublikInput,
  PesanInput,
  ProspectInput,
  QuotationInput,
  StoreActions,
  TaskInput,
  TiketInput,
  UmpanBalikInput,
} from './lib/store';
import Login from './components/Login';
import MarkloLanding from './modules/landing/Marklo';
import Lacak from './modules/Lacak';
import ComingSoon from './modules/ComingSoon';
import PlanCampaign from './modules/PlanCampaign';
import BookVenue from './modules/BookVenue';
import RentSpace from './modules/RentSpace';
import Training from './modules/Training';
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
import Chat from './modules/Chat';
import Service from './modules/Service';
import AuditPage from './modules/AuditPage';
import MasterPage from './modules/MasterPage';
import type {
  BuatAkunInternalInput,
  UndangKlienInput,
} from './modules/MasterPage';
import PortalKlien from './modules/PortalKlien';
import HomePage from './modules/Home';
import {
  MenuApprovement,
  MenuKomitmen,
  MenuKontrak,
  MenuMoU,
} from './modules/KerjaSama';
import { MenuKlien } from './modules/Klien';
import { MenuProspek } from './modules/Prospek';
import { MenuOffer, MenuOrder } from './modules/Penawaran';
import { MenuMeeting } from './modules/Pertemuan';
import { MenuUmpanBalik } from './modules/UmpanBalik';

type ModuleId =
  | 'home'
  | 'dashboard'
  | 'marketing'
  | 'klien'
  | 'prospek'
  | 'offer'
  | 'order'
  | 'meeting'
  | 'kontrak'
  | 'mou'
  | 'komitmen'
  | 'approvement'
  | 'sales'
  | 'deals'
  | 'sewa'
  | 'pengajuan'
  | 'umpanBalik'
  | 'revenue'
  | 'reporting'
  | 'todo'
  | 'chat'
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
   * Induk sub-item (keputusan pengguna 15/11/2026, diubah 15/11/2026):
   * item dengan `induk` TIDAK tampil di daftar utama sidebar — hanya
   * sebagai item di panel tambahan di samping sidebar (klik induknya).
   * Nama induk TIDAK dicantumkan lagi di dalam panelnya sendiri
   * (perbaikan 15/11/2026 19:16 WIB): panel hanya berisi sub-item.
   * Saat ini: hanya 'dashboard' di panel 'reports' (PR #42,
   * 15/11/2026 — Dashboard masuk ke dalam Reports); 'umpanBalik'
   * PINDAH ke navigasi top-level 'Feedback' di cluster 4 (PR #47,
   * 16/11/2026 — diminta pengguna "pindahkan Feedback Survey ini
   * menjadi Navigasi baru dengan nama Feedback").
   * 'sewa' TIDAK punya induk (dihapus dari panel 'deals' 15/11/2026,
   * PR #40 — panel DEALS sudah hilang; 'sewa' juga TIDAK tampil di
   * sidebar, seperti 'deals' dan 'pengajuan': modul + datanya tetap
   * utuh, dibuka lewat notifikasi).
   * 'pengajuan' TIDAK punya induk (dihapus dari panel 'sales'
   * 15/11/2026 atas instruksi pengguna "hilangkan submission ini"):
   * modul + datanya tetap utuh, dibuka lewat notifikasi, dan tidak
   * tampil di sidebar (tidak ada di CLUSTER_SIDEBAR).
   * Id tetap dipakai untuk `active` dan render konten.
   */
  induk?: ModuleId;
}

const MODULES: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    phase: 'A',
    description:
      'Home page inside the admin app — intentionally empty for now (correction 15/11/2026: not the landing page, not a sign-out).',
  },
  {
    id: 'kontrak',
    label: 'Contract',
    icon: FileSignature,
    phase: 'A',
    description:
      'PNBP contracts — the same contract list as Deals (Contracts / PKS).',
  },
  {
    id: 'mou',
    label: 'Memorandum of Understanding',
    icon: ScrollText,
    phase: 'A',
    description:
      'Memorandum of Understanding (Nota Kesepahaman) supporting broadcast programmes.',
  },
  {
    id: 'komitmen',
    label: 'Commitment',
    icon: HeartHandshake,
    phase: 'A',
    description:
      'Service-support cooperation documents for RRI events & programmes.',
  },
  {
    id: 'approvement',
    label: 'Approvement',
    icon: Stamp,
    phase: 'A',
    description: 'Media partner documents.',
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: Briefcase,
    phase: 'B',
    // TIDAK tampil di sidebar (16/11/2026, PR #43): dihapus dari
    // CLUSTER_SIDEBAR atas instruksi pengguna "buang navigasi sales".
    // Modul + semua tab/komponen + datanya tetap utuh, dipakai ulang
    // menu Prospect, Offer, Order, Meeting.
    description: 'Pipeline, Quotation.',
  },
  {
    id: 'sewa',
    label: 'Lease / State Assets (BMN)',
    icon: Building2,
    phase: 'A',
    // TIDAK punya induk dan TIDAK tampil di sidebar (15/11/2026,
    // PR #40): dulu sub-item panel DEALS — panel DEALS hilang, dan
    // promosi Sewa jadi menu utama DIBATALKAN (koreksi pengguna
    // 20:59 WIB). Modul + datanya tetap utuh, dibuka lewat
    // notifikasi ("Lease expiring soon" bernavigasi ke modul ini).
    description:
      'One lease list (Partnership Details → General PNBP): All, ON GOING, Expiring Soon, New Applications, Received in Advance, Still Receivable, Field Findings, Indralaya.',
  },
  {
    id: 'deals',
    label: 'Deals',
    icon: Handshake,
    phase: 'A',
    // TIDAK tampil di sidebar (15/11/2026, PR #40): dihapus dari
    // CLUSTER_SIDEBAR — modul + datanya tetap utuh, dibuka lewat
    // notifikasi ("Missing document" bernavigasi ke modul ini).
    description:
      'Clients, Partnership Details (Functional PNBP, General PNBP, Service Support, Memorandum of Understanding, Media Partner), Contracts, Documents.',
  },
  {
    id: 'marketing',
    label: 'Campaign',
    icon: Megaphone,
    phase: 'B',
    description: 'Events and Advertisement.',
  },
  {
    id: 'klien',
    label: 'Clients',
    icon: Users,
    phase: 'A',
    // Pindah ke setelah Campaign (PR #48, diminta pengguna
    // 16/11/2026 — urutan cluster 3: Campaign, Clients, Prospect,
    // Offer, Order; urutan tampil mengikuti urutan MODULES).
    description: 'Client list — the same client list as Deals (Clients tab).',
  },
  {
    id: 'prospek',
    label: 'Prospect',
    icon: UserPlus,
    phase: 'B',
    description:
      'Prospect list — the same prospects as the Offer pipeline (PRS-01 …).',
  },
  {
    id: 'offer',
    label: 'Offer',
    icon: Tag,
    phase: 'B',
    description:
      'Offer pipeline — opportunities from first contact to accepted or rejected (QTN-01 …, PRS-01 …).',
  },
  {
    id: 'order',
    label: 'Order',
    icon: ClipboardList,
    phase: 'B',
    description: 'Order list — the same Order tab as Sales (ORD-01 …).',
  },
  {
    id: 'pengajuan',
    label: 'Submission',
    icon: FilePlus2,
    phase: 'A',
    // TIDAK punya induk (15/11/2026): dihapus dari panel 'sales' atas
    // instruksi pengguna — modul + data tetap utuh, dibuka lewat
    // notifikasi; tidak tampil di sidebar (tidak ada di CLUSTER_SIDEBAR).
    description:
      'New Submissions (new partnership / new lease): Received → Under review → Awaiting documents → Approved/Rejected → Converted to contract.',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    phase: 'A',
    // Sub-item panel REPORTS (15/11/2026, PR #42, diminta pengguna
    // "masukkan dashboard ke dalam Reports"): Dashboard tidak tampil
    // di sidebar utama; panel REPORTS kini hanya berisi Dashboard
    // (Feedback Survey pindah ke navigasi top-level 'Feedback' di
    // cluster 4, PR #47, 16/11/2026). Modul + data tetap utuh;
    // tampilan awal saat login tetap Dashboard.
    induk: 'reporting',
    description:
      'Period summary, Revenue Analytics, head office report deadlines (fill in by the 10th, submit by the 11th). Employee Rank & Satker Rank (Leaderboard of the Year / of the Month) per contract signing date period.',
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
    label: 'Reports',
    icon: FileText,
    phase: 'A',
    description:
      'Satker Reports: PNBP Report, Receivables & Deposits Report, Service Support Report, Memorandum of Understanding Report, Media Partner Report.',
  },
  {
    id: 'umpanBalik',
    label: 'Feedback',
    icon: ClipboardCheck,
    phase: 'C',
    // Navigasi top-level (16/11/2026, PR #47, diminta pengguna
    // "pindahkan Feedback Survey ini menjadi Navigasi baru dengan
    // nama Feedback"): TIDAK lagi punya induk — dikeluarkan dari
    // panel REPORTS (panel kini hanya Dashboard) dan masuk
    // CLUSTER_SIDEBAR cluster 4 di antara Reports dan Resources
    // (PR #48, koreksi pengguna 16/11/2026 — semula paling bawah
    // setelah Resources di PR #47, ternyata tampil paling atas
    // karena urutan tampil mengikuti urutan MODULES, bukan
    // CLUSTER_SIDEBAR). Isi/komponen/data survei TIDAK berubah.
    description:
      'Client satisfaction survey per contract (scale 1–5) — the same Feedback Survey as Resources before 15/11/2026.',
  },
  {
    id: 'todo',
    label: 'Task',
    icon: CheckSquare,
    phase: 'B',
    description: 'Individual Tasks and Dispositions.',
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: MessageSquare,
    phase: 'C',
    description: 'Messages between operators (1-to-1).',
  },
  {
    id: 'meeting',
    label: 'Meeting',
    icon: CalendarDays,
    phase: 'B',
    // Pindah ke cluster 1 paling bawah, di bawah Chat (PR #48,
    // diminta pengguna 16/11/2026 — urutan tampil mengikuti urutan
    // MODULES, jadi entri ini diletakkan tepat setelah 'chat').
    description: 'Meeting Schedule (MTG-01 …).',
  },
  {
    id: 'service',
    label: 'Resources',
    icon: BarChart3,
    phase: 'C',
    description:
      'Help-Desk to head office PIC, Knowledge Base (Regulations, SOP).',
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

/** Cluster sidebar (PR #36, disetujui pengguna 15/11/2026 19:37 WIB,
    dikoreksi 19:37 WIB — Dashboard di cluster Revenue/Reports; PR #37,
    diminta pengguna 15/11/2026 19:47 WIB — Campaign pindah dari
    cluster 2 ke cluster Sales & Deals, menu Clients ditambahkan di
    cluster itu, setelah Campaign; PR #38, diminta pengguna 15/11/2026
    20:14 WIB — menu Offer dan Order ditambahkan di cluster itu,
    setelah Clients; PR #39, diminta pengguna 15/11/2026
    20:36 WIB — menu Meeting ditambahkan di cluster itu, setelah
    Order; PR #40, diminta pengguna 15/11/2026 20:53 WIB — menu
    Prospect ditambahkan di cluster itu, setelah Campaign;
    dikoreksi pengguna 20:55 WIB — Clients pindah ke setelah Order,
    urutan akhir cluster 3: Sales, Deals, Campaign, Prospect, Offer,
    Order, Clients, Meeting; diminta pengguna 20:57 WIB — Deals
    dihapus dari sidebar, Sewa naik jadi menu utama di posisi Deals;
    KOREKSI pengguna 20:59 WIB — promosi Sewa DIBATALKAN, Lease/BMN
    juga dihapus dari sidebar, urutan AKHIR cluster 3: Sales,
    Campaign, Prospect, Offer, Order, Clients, Meeting; PR #42,
    diminta pengguna 15/11/2026 21:46 WIB — Dashboard masuk ke
    panel REPORTS (sub-navigasi di bawah Reports); cluster 4
    tersisa Revenue, Reports; PR #43,
    diminta pengguna 16/11/2026 07:52 WIB — Sales dihapus dari
    sidebar; urutan AKHIR cluster 3: Campaign, Prospect, Offer,
    Order, Clients, Meeting (modul Sales tetap utuh); PR #45,
    diminta pengguna 16/11/2026 08:10 WIB — Task pindah dari
    cluster 5 ke cluster 1, tepat di bawah Home; menu Chat baru
    ditambahkan di bawah Task (chat 1-to-1 antar operator); PR #45
    juga, diminta pengguna 16/11/2026 08:13 WIB — Resources pindah
    dari cluster 5 ke cluster 4 (Revenue, Reports, Resources);
    cluster 5 HILANG seluruhnya. PR #47,
    diminta pengguna 16/11/2026 08:54 WIB — Feedback Survey
    keluar dari panel REPORTS menjadi navigasi top-level 'Feedback'
    di cluster 4; panel REPORTS kini hanya berisi Dashboard.
    PR #48, koreksi pengguna 16/11/2026 09:05 WIB — Feedback
    ternyata tampil PALING ATAS cluster 4 (bukan paling bawah)
    karena urutan tampil mengikuti urutan MODULES, bukan
    CLUSTER_SIDEBAR; Feedback dipindah ke antara Reports dan
    Resources. PR #48 juga, diminta pengguna 16/11/2026 09:06 WIB
    — Meeting pindah dari cluster 3 ke bawah cluster 1 (di bawah
    Chat). PR #48 juga, diminta pengguna 16/11/2026 09:08 WIB
    — urutan cluster 3: Campaign, Clients, Prospect, Offer, Order.
    Struktur AKHIR: cluster 1 Home, Task, Chat, Meeting;
    cluster 2 Contract, MoU, Commitment, Approvement;
    cluster 3 Campaign, Clients, Prospect, Offer, Order;
    cluster 4 Revenue, Reports, Feedback, Resources:
    item nav utama dibagi ke cluster yang dipisah garis tipis, tanpa
    label kelompok (kecuali ADMIN yang sudah punya label). Urutan
    cluster = urutan tampil di sidebar; urutan di dalam cluster
    mengikuti MODULES. */
const CLUSTER_SIDEBAR: ModuleId[][] = [
  ['home', 'todo', 'chat', 'meeting'],
  ['kontrak', 'mou', 'komitmen', 'approvement'],
  ['marketing', 'klien', 'prospek', 'offer', 'order'],
  ['revenue', 'reporting', 'umpanBalik', 'service'],
];

/** ID berikutnya dengan awalan yang sama (mis. KLN-01 -> KLN-02). */
function idBerikutnya(awalan: string, daftarId: string[]): string {
  let maks = 0;
  let lebar = 2;
  for (const id of daftarId) {
    if (!id.startsWith(awalan)) continue;
    // Hanya angka DI AWAL sisa id yang dihitung (PR #49): id tetap seperti
    // 'KB-PMK-115-2021' mengandung angka di tengah ('115', '2021') — tanpa
    // jangkar, id manual berikutnya akan salah menjadi 'KB-2024'.
    const cocok = id.slice(awalan.length).match(/^(\d+)/);
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
  const [active, setActive] = useState<ModuleId>('home');
  /**
   * Klien yang dipilih dari Detail Kontrak — saat nama klien diklik,
   * menu Clients dibuka dengan klien ini terpilih (draft 16/11/2026).
   * null = buka daftar klien seperti biasa.
   */
  const [klienTerpilihLuar, setKlienTerpilihLuar] = useState<string | null>(
    null,
  );
  /** Sidebar bisa dilipat ke rel ikon saja — status disimpan di localStorage
      (pola sama seperti 'rri-bahasa-landing' di Beranda.tsx). */
  const [sidebarCiut, setSidebarCiut] = useState<boolean>(() => {
    try {
      return localStorage.getItem('rri-sidebar-ciut') === '1';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('rri-sidebar-ciut', sidebarCiut ? '1' : '0');
    } catch {
      // Penyimpanan tidak tersedia (mode privat, dsb.) — abaikan saja.
    }
  }, [sidebarCiut]);
  /** Panel tambahan sub-navigasi (gaya Qontak): id modul induk yang
      panelnya terbuka. Berlaku di mode terbuka MAUPUN terlipat. */
  const [panelTerbuka, setPanelTerbuka] = useState<ModuleId | null>(null);
  /** Induk panel sub-navigasi untuk suatu tampilan: induknya bila
      tampilan adalah sub-item, dirinya sendiri bila punya sub-item,
      null bila tidak punya sub-navigasi. */
  const panelUntukTampilan = (id: ModuleId): ModuleId | null => {
    const m = MODULES.find((x) => x.id === id);
    if (!m) return null;
    if (m.induk) return m.induk;
    return MODULES.some((c) => c.induk === m.id) ? m.id : null;
  };
  /** Panel mengikuti tampilan aktif: bila tampilan adalah sub-item
      (atau induk yang punya sub-item) — mis. navigasi dari notifikasi,
      dari dalam modul, atau dari panel itu sendiri — panel induknya
      terbuka. Efek hanya jalan saat `active` berubah, jadi tutup manual
      (Escape / klik di luar / klik kedua pada induk) tetap bertahan
      sampai tampilan berpindah. */
  useEffect(() => {
    const induk = panelUntukTampilan(active);
    if (induk) setPanelTerbuka(induk);
  }, [active]);
  /** Escape / klik di luar menutup panel. */
  useEffect(() => {
    if (!panelTerbuka) return;
    const tutupDenganEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanelTerbuka(null);
    };
    const tutupDenganKlikLuar = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-panel]')) {
        setPanelTerbuka(null);
      }
    };
    document.addEventListener('keydown', tutupDenganEscape);
    document.addEventListener('mousedown', tutupDenganKlikLuar);
    return () => {
      document.removeEventListener('keydown', tutupDenganEscape);
      document.removeEventListener('mousedown', tutupDenganKlikLuar);
    };
  }, [panelTerbuka]);
  // Pencarian global di top bar DIHAPUS atas instruksi pengguna 15/11/2026
  // ("hilangkan ini di bar teratas"). `cari` dipertahankan sebagai '' agar
  // filter daftar di modul-modul tetap jalan (menampilkan semua); plumbing
  // pencarian dipertahankan bila suatu saat kolom pencarian ditambahkan lagi.
  const [cari] = useState('');

  /** Mode sumber data: contoh (belum terkonfigurasi / belum dimigrasi) atau Firestore. */
  type ModeData = 'tidak-terkonfigurasi' | 'belum-dimigrasi' | 'firestore';
  const [modeData, setModeData] = useState<ModeData>(
    isFirebaseConfigured ? 'belum-dimigrasi' : 'tidak-terkonfigurasi',
  );
  /** Email akun Auth yang login (dipakai identitas operator saat migrasi). */
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [sudahDimigrasi, setSudahDimigrasi] = useState(false);
  const [tanggalMigrasi, setTanggalMigrasi] = useState<string | undefined>(undefined);
  /** Status re-migrasi data kontrak 2026 (PR #53) — guard terpisah dari migrasi pertama. */
  const [sudahRemigrasi, setSudahRemigrasi] = useState(false);
  const [tanggalRemigrasi, setTanggalRemigrasi] = useState<string | undefined>(undefined);
  /** Status migrasi MoU (impor MoU 19/11/2026) — guard terpisah dari migrasi lain. */
  const [sudahMigrasiMou, setSudahMigrasiMou] = useState(false);
  const [tanggalMigrasiMou, setTanggalMigrasiMou] = useState<string | undefined>(undefined);
  /** Status perbaikan satu kali MoU 037 (19/11/2026) — tanpa guard meta, dari nilai live. */
  const [sudahPerbaikanMou037, setSudahPerbaikanMou037] = useState(false);
  /** Status migrasi Commitment (impor Commitment 19/11/2026) — guard terpisah dari migrasi lain. */
  const [sudahMigrasiCommitment, setSudahMigrasiCommitment] = useState(false);
  const [tanggalMigrasiCommitment, setTanggalMigrasiCommitment] = useState<string | undefined>(undefined);
  /** Status backfill klienId (dua peran 19/11/2026) — guard terpisah dari migrasi lain. */
  const [sudahBackfillKlienId, setSudahBackfillKlienId] = useState(false);
  const [tanggalBackfillKlienId, setTanggalBackfillKlienId] = useState<string | undefined>(undefined);
  const [galatMuat, setGalatMuat] = useState<string | null>(null);
  const [peringatanSimpan, setPeringatanSimpan] = useState<string | null>(null);
  /** Halaman publik tanpa login (lacak/ajukan) saat belum masuk. */
  const [halamanPublik, setHalamanPublik] = useState<'beranda' | 'login' | 'lacak' | 'ajukan' | 'coming-soon' | 'plan-campaign' | 'book-venue' | 'rent-space' | 'training'>('beranda');
  // Prefill form Ajukan dari landing page DIHAPUS sementara (PR
  // landing-marklo-clone): landing baru belum memanggil Ajukan; state
  // ajukanAwal + prop prefill akan dipasang lagi pada putaran penyesuaian.

  // Pulihkan sesi Auth yang sudah masuk (bila Firebase terkonfigurasi).
  // TIGA PERAN (20/11/2026): pulihkan Operator, Admin, DAN Client —
  // peran dibedakan lewat field `peran` di users/{uid}; client
  // membawa klienId (tanpa itu portal tidak tahu data siapa yang
  // ditampilkan). Routing: client → Client Portal, kedua peran
  // internal (operator + admin) → admin portal (lihat di bawah).
  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) return;
    const berhenti = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser || !db) return;
      try {
        const snap = await getDoc(doc(db, 'users', fbUser.uid));
        if (snap.exists()) {
          const d = snap.data();
          const peran = d.peran;
          if (peranDikenal(peran)) {
            setUser({
              nama: String(d.nama ?? ''),
              jabatan: String(d.jabatan ?? ''),
              peran,
              email: String(d.email ?? fbUser.email ?? ''),
              satker: d.satker as { kode: string; nama: string } | undefined,
              klienId:
                typeof d.klienId === 'string' && d.klienId !== ''
                  ? d.klienId
                  : undefined,
              institusi:
                typeof d.institusi === 'string' && d.institusi !== ''
                  ? d.institusi
                  : undefined,
            });
            setAuthEmail(fbUser.email ?? null);
          }
        }
      } catch {
        // Abaikan — pengguna masuk manual lewat form login.
      }
    });
    return berhenti;
  }, []);

  // Muat data dari Firestore setelah login, bila sudah dimigrasi.
  // Operator: data penuh (muatDariFirestore). Client (dua peran
  // 19/11/2026): HANYA datanya sendiri lewat muatDataKlien() — filter
  // klienId + satker; status migrasi/master TIDAK dibaca (client tidak
  // boleh membaca dokumen meta).
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
        if (user.peran === 'client') {
          if (!user.klienId) {
            // Akun client baru dari signup publik yang BELUM ditautkan
            // operator (19/11/2026 16:12 WIB): ini keadaan yang
            // diharapkan, BUKAN galat muat — portal menampilkan kartu
            // 'belum tertaut' yang jujur + mengarahkan ke Ajukan.
            // muatDataKlien TIDAK dipanggil tanpa klienId (query
            // klienId-nya tidak ada artinya tanpa tautan, dan aturan
            // Firestore menolak baca tanpa klienId yang cocok).
            return;
          }
          const dariFirestore = await muatDataKlien(
            db,
            SATKER_PILOT.kode,
            user.klienId,
            user.email,
          );
          if (batal) return;
          if (dariFirestore) {
            setData(dariFirestore);
            setModeData('firestore');
            setSudahDimigrasi(true);
          }
          return;
        }
        const dariFirestore = await muatDariFirestore(db, SATKER_PILOT.kode);
        if (batal) return;
        if (dariFirestore) {
          setData(dariFirestore);
          setModeData('firestore');
          setSudahDimigrasi(true);
          const statusRemigrasi = await bacaStatusRemigrasi(db);
          if (batal) return;
          setSudahRemigrasi(statusRemigrasi.sudah);
          setTanggalRemigrasi(statusRemigrasi.tanggal);
          const statusMigrasiMou = await bacaStatusMigrasiMou(db);
          if (batal) return;
          setSudahMigrasiMou(statusMigrasiMou.sudah);
          setTanggalMigrasiMou(statusMigrasiMou.tanggal);
          const statusPerbaikanMou037 = await bacaStatusPerbaikanMou037(db);
          if (batal) return;
          setSudahPerbaikanMou037(statusPerbaikanMou037.sudah);
          const statusMigrasiCommitment = await bacaStatusMigrasiCommitment(db);
          if (batal) return;
          setSudahMigrasiCommitment(statusMigrasiCommitment.sudah);
          setTanggalMigrasiCommitment(statusMigrasiCommitment.tanggal);
          const statusBackfillKlienId = await bacaStatusBackfillKlienId(db);
          if (batal) return;
          setSudahBackfillKlienId(statusBackfillKlienId.sudah);
          setTanggalBackfillKlienId(statusBackfillKlienId.tanggal);
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
   *
   * NOMOR REFERENSI + DUA PERAN (19/11/2026): mengembalikan
   * `{ galat, id }` — `id` adalah nomor referensi submission
   * (mis. 'PKL-001') yang ditampilkan ke pemohon supaya bisa melacak
   * statusnya. Bila dipanggil dari Client Portal (client yang login),
   * `klienId` diisi id record klien akun itu — submission tertaut ke
   * client dan tampil di "My Requests"-nya (aturan Firestore
   * mengizinkan client create dengan klienId milik sendiri).
   */
  const kirimPengajuanPublik = async (
    input: PengajuanPublikInput,
    klienId?: string,
  ): Promise<{ galat: string | null; id?: string }> => {
    if (!DAFTAR_JENIS_PENGAJUAN_KLIEN.includes(input.jenis)) {
      return { galat: `Request type "${input.jenis}" is not recognised.` };
    }
    if (!input.namaPemohon.trim()) return { galat: 'Applicant name is required.' };
    if (!input.namaInstitusi.trim()) return { galat: 'Institution name is required.' };
    if (!input.kontakEmail.trim()) return { galat: 'Contact email is required.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.kontakEmail.trim())) {
      return { galat: 'Contact email is not valid.' };
    }
    if (!input.judul.trim()) return { galat: 'Request title is required.' };
    if (!input.uraian.trim()) return { galat: 'Request details are required.' };
    if (
      input.nilaiPerkiraan !== undefined &&
      !(input.nilaiPerkiraan >= 0)
    ) {
      return { galat: 'Estimated value must be 0 or more.' };
    }
    const id = idBerikutnya('PKL-', data.pengajuanKlien.map((s) => s.id));
    const submission: PengajuanKlien = {
      id,
      klienId: klienId ?? '',
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
        return { galat: 'Request recorded locally, but failed to save to Firestore — contact the Operator.' };
      }
    }
    return { galat: null, id };
  };

  /**
   * Kirim permintaan free call publik dari kartu booking landing (PR
   * landing-booking-ke-meeting, 2026-11-17): pengunjung memilih tanggal +
   * jam lalu mengisi form singkat. Didefinisikan SEBELUM cabang
   * `if (!user)` karena dipakai halaman publik saat belum login.
   * Permintaan disimpan sebagai dokumen Meeting (koleksi 'meeting') agar
   * muncul di tabel Meeting panel admin — pemetaan field:
   * - tanggal/jam: slot yang dipilih, jam basis WIB (zona tampilan yang
   *   dipilih pengunjung hanya memengaruhi tampilan jam di kartu).
   * - agenda: Topik, ditambah " (Perusahaan)" bila Perusahaan diisi
   *   (tipe Meeting tidak punya field perusahaan; kolom Prospect/Client
   *   menampilkan '-' sampai Operator menautkan prospect/klien via Update).
   * - contactPersonNama + clientRepresentatives: Nama pengunjung.
   * - contactPersonTelepon: Kontak (WA/telepon).
   * - rriRepresentatives: KOSONG — belum ditetapkan; Operator melengkapi
   *   via Update (form Update mensyaratkan minimal 1 RRI Representative).
   * - satker: SATKER_PILOT (PALEMBANG) — sama seperti submission publik
   *   dan tambahMeeting; tidak ada pemilih satker di kartu booking.
   * - googleEventId/googleSyncedAt: TIDAK ada (status "Not synced") —
   *   Operator yang menyinkronkan via tombol Sync. Durasi 30 menit dan
   *   jenis video call TIDAK tersimpan (tipe Meeting tidak punya field
   *   durasi/medium); sinkronisasi Google Calendar tetap membuat event
   *   1 jam (default PR #73) sampai ada penyesuaian lanjutan.
   * Audit TIDAK ditulis di sini (audit hanya sesi Operator) — sama seperti
   * kirimPengajuanPublik. Bila mode Firestore aktif, tulis juga ke
   * Firestore (gate isFirebaseConfigured seperti kirimPengajuanPublik);
   * bila tulis itu gagal, kembalikan pesan error (jangan menelan
   * diam-diam). Di luar mode Firestore, permintaan hanya tersimpan di
   * sesi ini — sama seperti aksi lain sebelum migrasi.
   */
  const kirimBookingPublik = async (
    input: BookingPublikInput,
  ): Promise<string | null> => {
    if (
      !input.tanggal.trim() ||
      !/^\d{4}-\d{2}-\d{2}$/.test(input.tanggal.trim())
    ) {
      return 'Meeting date is not valid.';
    }
    if (!input.jam.trim() || !/^\d{2}:\d{2}$/.test(input.jam.trim())) {
      return 'Meeting time is not valid.';
    }
    if (!input.nama.trim()) return 'Name is required.';
    if (!input.kontak.trim()) return 'Contact is required.';
    if (!input.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))
      return 'Email format is not valid.';
    if (!input.topik.trim()) return 'Topic is required.';
    const perusahaan = input.perusahaan?.trim() || '';
    const id = idBerikutnya('MTG-', data.meeting.map((m) => m.id));
    const meeting: Meeting = {
      id,
      tanggal: input.tanggal.trim(),
      jam: input.jam.trim(),
      // Field lama peserta TETAP DISIMPAN (kompatibilitas) — diturunkan
      // dari Client Representative; tidak lagi ditampilkan.
      peserta: input.nama.trim(),
      agenda: perusahaan
        ? `${input.topik.trim()} (${perusahaan})`
        : input.topik.trim(),
      clientRepresentatives: [input.nama.trim()],
      contactPersonNama: input.nama.trim(),
      contactPersonTelepon: input.kontak.trim(),
      // Email WAJIB dari form booking — kanal kirim link Google Meet
      // (operator kirim manual setelah sync; PR landing-booking-email).
      contactPersonEmail: input.email.trim(),
      // RRI Representative KOSONG — Operator melengkapi via Update.
      rriRepresentatives: [],
      satker: SATKER_PILOT,
    };
    setData((d) => ({ ...d, meeting: [...d.meeting, meeting] }));
    // Tulis ke Firestore bila terkonfigurasi (gate isFirebaseConfigured,
    // bukan modeData — pengunjung publik tidak pernah login; lihat
    // komentar yang sama di kirimPengajuanPublik). Aturan publik meeting
    // mengizinkan create tanpa login.
    if (isFirebaseConfigured && db) {
      try {
        await kirimBookingPublikKeFirestore(db, meeting);
      } catch (e) {
        console.error('Gagal menyimpan permintaan booking ke Firestore:', e);
        return 'Request recorded locally, but failed to save to Firestore — contact the Operator.';
      }
    }
    return null;
  };

  /**
   * Kirim permintaan booking venue publik dari halaman "Book a Venue"
   * (2026-11-21): pengunjung memilih venue + tanggal lalu menyampaikan
   * occasion. Didefinisikan SEBELUM cabang `if (!user)` karena dipakai
   * halaman publik saat belum login. Permintaan disimpan sebagai dokumen
   * PermintaanLayanan (koleksi 'venueBookOrder', id 'VBR-…') agar muncul
   * di tabel Venue Book Order panel admin. Mengembalikan { galat, id } —
   * id = nomor referensi yang ditampilkan ke pengunjung (pola
   * kirimPengajuanPublik). Audit TIDAK ditulis di sini (audit hanya sesi
   * Operator). Bila mode Firestore aktif, tulis juga ke Firestore (gate
   * isFirebaseConfigured seperti kirimPengajuanPublik); bila tulis itu
   * gagal, kembalikan pesan error (jangan menelan diam-diam).
   */
  const kirimPermintaanVenuePublik = async (
    input: PermintaanVenuePublikInput,
  ): Promise<{ galat: string | null; id?: string }> => {
    if (!input.venue.trim()) return { galat: 'Venue is required.' };
    if (
      !input.tanggal.trim() ||
      !/^\d{4}-\d{2}-\d{2}$/.test(input.tanggal.trim())
    ) {
      return { galat: 'Booking date is not valid.' };
    }
    if (
      input.tanggalSelesai !== undefined &&
      input.tanggalSelesai.trim() !== '' &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(input.tanggalSelesai.trim()) ||
        input.tanggalSelesai.trim() < input.tanggal.trim())
    ) {
      return { galat: 'Check-out date is not valid.' };
    }
    if (!input.keperluan.trim()) return { galat: 'Occasion is required.' };
    if (!input.nama.trim()) return { galat: 'Name is required.' };
    if (!input.kontak.trim()) return { galat: 'Contact is required.' };
    if (!input.email.trim()) return { galat: 'Email is required.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))
      return { galat: 'Email format is not valid.' };
    if (
      input.jumlahPeserta !== undefined &&
      (!Number.isInteger(input.jumlahPeserta) || input.jumlahPeserta < 1)
    ) {
      return { galat: 'Participants is not valid.' };
    }
    const id = idBerikutnya('VBR-', data.venueBookOrder.map((r) => r.id));
    const permintaan: PermintaanLayanan = {
      id,
      namaKlien: input.nama.trim(),
      tanggalPermintaan: hariIniIso(),
      status: 'Baru',
      satker: SATKER_PILOT,
      layanan: input.venue.trim(),
      tanggalLayanan: input.tanggal.trim(),
      tanggalSelesai:
        input.tanggalSelesai !== undefined &&
        input.tanggalSelesai.trim() !== '' &&
        input.tanggalSelesai.trim() !== input.tanggal.trim()
          ? input.tanggalSelesai.trim()
          : undefined,
      keperluan: input.keperluan.trim(),
      kontak: input.kontak.trim(),
      email: input.email.trim(),
      jumlahPeserta: input.jumlahPeserta,
    };
    setData((d) => ({
      ...d,
      venueBookOrder: [...d.venueBookOrder, permintaan],
    }));
    if (isFirebaseConfigured && db) {
      try {
        await kirimPermintaanVenuePublikKeFirestore(db, permintaan);
      } catch (e) {
        console.error(
          'Gagal menyimpan permintaan venue ke Firestore:',
          e,
        );
        return { galat: 'Request recorded locally, but failed to save to Firestore — contact the Operator.' };
      }
    }
    return { galat: null, id };
  };

  /**
   * Kirim inquiry lahan publik dari halaman "Rent a Space" (2026-11-21):
   * pengunjung memilih lahan lalu mengirim inquiry ("chat ke admin" yang
   * dimaksud pengguna — chat client→admin TIDAK ADA di aplikasi).
   * Pola sama dengan kirimPermintaanVenuePublik; koleksi
   * 'spaceRentOrder', id 'SRR-…'; pesan inquiry opsional.
   */
  const kirimPermintaanSpacePublik = async (
    input: PermintaanSpacePublikInput,
  ): Promise<{ galat: string | null; id?: string }> => {
    if (!input.space.trim()) return { galat: 'Space is required.' };
    if (!input.nama.trim()) return { galat: 'Name is required.' };
    if (!input.kontak.trim()) return { galat: 'Contact is required.' };
    if (!input.email.trim()) return { galat: 'Email is required.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))
      return { galat: 'Email format is not valid.' };
    const id = idBerikutnya('SRR-', data.spaceRentOrder.map((r) => r.id));
    const permintaan: PermintaanLayanan = {
      id,
      namaKlien: input.nama.trim(),
      tanggalPermintaan: hariIniIso(),
      status: 'Baru',
      satker: SATKER_PILOT,
      layanan: input.space.trim(),
      keperluan: input.pesan?.trim() || undefined,
      kontak: input.kontak.trim(),
      email: input.email.trim(),
    };
    setData((d) => ({
      ...d,
      spaceRentOrder: [...d.spaceRentOrder, permintaan],
    }));
    if (isFirebaseConfigured && db) {
      try {
        await kirimPermintaanSpacePublikKeFirestore(db, permintaan);
      } catch (e) {
        console.error(
          'Gagal menyimpan inquiry lahan ke Firestore:',
          e,
        );
        return { galat: 'Request recorded locally, but failed to save to Firestore — contact the Operator.' };
      }
    }
    return { galat: null, id };
  };

  /**
   * Kirim pendaftaran course publik dari halaman "Get a Journalism
   * Training" (2026-11-21): pengunjung memilih Scheduled Course lalu
   * mendaftar sebagai peserta. Pola sama dengan
   * kirimPermintaanVenuePublik; koleksi 'trainingOrder', id 'TRN-…';
   * tanggalLayanan = tanggal jadwal course yang dipilih.
   */
  const kirimPermintaanTrainingPublik = async (
    input: PermintaanTrainingPublikInput,
  ): Promise<{ galat: string | null; id?: string }> => {
    if (!input.course.trim()) return { galat: 'Course is required.' };
    if (
      !input.tanggalCourse.trim() ||
      !/^\d{4}-\d{2}-\d{2}$/.test(input.tanggalCourse.trim())
    ) {
      return { galat: 'Course date is not valid.' };
    }
    if (!input.nama.trim()) return { galat: 'Name is required.' };
    if (!input.email.trim()) return { galat: 'Email is required.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()))
      return { galat: 'Email format is not valid.' };
    if (!input.telepon.trim()) return { galat: 'Phone is required.' };
    const id = idBerikutnya('TRN-', data.trainingOrder.map((r) => r.id));
    const permintaan: PermintaanLayanan = {
      id,
      namaKlien: input.nama.trim(),
      tanggalPermintaan: hariIniIso(),
      status: 'Baru',
      satker: SATKER_PILOT,
      layanan: input.course.trim(),
      tanggalLayanan: input.tanggalCourse.trim(),
      kontak: input.telepon.trim(),
      email: input.email.trim(),
    };
    setData((d) => ({
      ...d,
      trainingOrder: [...d.trainingOrder, permintaan],
    }));
    if (isFirebaseConfigured && db) {
      try {
        await kirimPermintaanTrainingPublikKeFirestore(db, permintaan);
      } catch (e) {
        console.error(
          'Gagal menyimpan pendaftaran training ke Firestore:',
          e,
        );
        return { galat: 'Request recorded locally, but failed to save to Firestore — contact the Operator.' };
      }
    }
    return { galat: null, id };
  };

  if (!user) {
    if (halamanPublik === 'beranda') {
      // Landing page tiruan template Marklo (PR landing-marklo-clone).
      // Komponen landing lama (Beranda.tsx + landing/*) tetap di repo,
      // tidak dipakai di route `/` untuk sementara — putaran penyesuaian
      // akan mengintegrasikan kembali Ajukan/statistik live/dua bahasa;
      // Lacak SUDAH terhubung lewat footer "Track your Deal" (Client
      // Portal) sejak PR footer-site-map-client-portal.
      return (
        <MarkloLanding
          onLogin={() => setHalamanPublik('login')}
          onLacak={() => setHalamanPublik('lacak')}
          onComingSoon={() => setHalamanPublik('coming-soon')}
          onPlanCampaign={() => setHalamanPublik('plan-campaign')}
          onBookVenue={() => setHalamanPublik('book-venue')}
          onRentSpace={() => setHalamanPublik('rent-space')}
          onTraining={() => setHalamanPublik('training')}
          onKirimBooking={kirimBookingPublik}
        />
      );
    }
    if (halamanPublik === 'lacak') {
      return (
        <Lacak
          data={data}
          modeLive={isFirebaseConfigured && !!db}
          onKembali={() => {
            setHalamanPublik('beranda');
          }}
        />
      );
    }
    if (halamanPublik === 'ajukan') {
      return (
        <Ajukan
          onKirim={kirimPengajuanPublik}
          onKembali={() => {
            setHalamanPublik('beranda');
          }}
        />
      );
    }
    if (halamanPublik === 'coming-soon') {
      // Halaman "Coming Soon" (permintaan pengguna 2026-11-18): keenam
      // item footer "Additional Service" mengarah ke sini — BUKAN ke
      // kartu booking. Gaya login page, TANPA logo.
      return (
        <ComingSoon
          onKembali={() => {
            setHalamanPublik('beranda');
          }}
        />
      );
    }
    if (halamanPublik === 'plan-campaign') {
      // Halaman "Plan a Campaign" (permintaan pengguna 2026-11-19):
      // form permintaan quotation iklan Tally (id ArpNAN) di-embed di
      // halaman app — dibuka dari footer "Plan a Campaign" (Client
      // Portal) dan keempat kotak layanan; BUKAN lagi gulir ke kartu
      // booking. Gaya login page (pola Lacak).
      return (
        <PlanCampaign
          onKembali={() => {
            setHalamanPublik('beranda');
          }}
        />
      );
    }
    if (halamanPublik === 'book-venue') {
      // Halaman "Book a Venue" (permintaan pengguna 2026-11-21):
      // daftar venue + form booking (venue, tanggal, occasion, nama,
      // kontak, email) — dibuka dari footer "Additional Service".
      // Submit → tabel Venue Book Order panel admin (id 'VBR-…').
      // Data dummy dulu; harga hanya tarif KB PP 68/2020.
      return (
        <BookVenue
          onKembali={() => {
            setHalamanPublik('beranda');
          }}
          onKirim={kirimPermintaanVenuePublik}
        />
      );
    }
    if (halamanPublik === 'rent-space') {
      // Halaman "Rent a Space" (permintaan pengguna 2026-11-21):
      // daftar lahan + form inquiry — dibuka dari footer "Additional
      // Service". Submit → tabel Space Rent Order panel admin
      // (id 'SRR-…'). Data dummy dulu; harga "Price on request".
      return (
        <RentSpace
          onKembali={() => {
            setHalamanPublik('beranda');
          }}
          onKirim={kirimPermintaanSpacePublik}
        />
      );
    }
    if (halamanPublik === 'training') {
      // Halaman "Get a Journalism Training" (permintaan pengguna
      // 2026-11-21): daftar Scheduled Course + form registrasi —
      // dibuka dari footer "Additional Service". Submit → tabel
      // Training Order panel admin (id 'TRN-…'). Data dummy dulu;
      // harga hanya tarif KB PP 68/2020.
      return (
        <Training
          onKembali={() => {
            setHalamanPublik('beranda');
          }}
          onKirim={kirimPermintaanTrainingPublik}
        />
      );
    }
    return (
      <Login
        onKembali={() => setHalamanPublik('beranda')}
        onLoginAuth={async (email, kataSandi) => {
          try {
            const appUser = await masukDenganEmail(email, kataSandi);
            setUser({
              nama: appUser.nama,
              jabatan: appUser.jabatan,
              peran: appUser.peran,
              email: appUser.email,
              satker: appUser.satker,
              klienId: appUser.klienId,
              institusi: appUser.institusi,
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
        onSignupAuth={async (nama, institusi, email, kataSandi) => {
          // SIGNUP PUBLIK (keputusan pengguna 19/11/2026 16:12 WIB):
          // selalu membuat akun peran 'client' tanpa klienId —
          // portal menampilkan keadaan 'belum tertaut' sampai
          // operator menautkan. Tidak ada pilihan peran di sini.
          try {
            const appUser = await daftarDenganEmail(
              nama,
              institusi,
              email,
              kataSandi,
            );
            setUser({
              nama: appUser.nama,
              jabatan: appUser.jabatan,
              peran: appUser.peran,
              email: appUser.email,
              satker: appUser.satker,
              klienId: appUser.klienId,
              institusi: appUser.institusi,
            });
            setAuthEmail(appUser.email);
            return null;
          } catch (e) {
            const kode = (e as { code?: string }).code;
            if (kode === 'auth/email-already-in-use') {
              return 'An account with this email already exists — sign in instead.';
            }
            if (kode === 'auth/weak-password') {
              return 'Password must be at least 6 characters.';
            }
            if (kode === 'auth/invalid-email') {
              return 'Email address is not valid.';
            }
            if (kode === 'auth/network-request-failed') {
              return 'No network connection.';
            }
            return e instanceof Error ? e.message : 'Failed to create account. Try again.';
          }
        }}
        onLoginDummy={setUser}
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
    setPanelTerbuka(null);
    setModeData(
      isFirebaseConfigured ? 'belum-dimigrasi' : 'tidak-terkonfigurasi',
    );
    setSudahDimigrasi(false);
    setTanggalMigrasi(undefined);
    setSudahRemigrasi(false);
    setTanggalRemigrasi(undefined);
    setSudahMigrasiMou(false);
    setTanggalMigrasiMou(undefined);
    setSudahPerbaikanMou037(false);
    setSudahMigrasiCommitment(false);
    setTanggalMigrasiCommitment(undefined);
    setSudahBackfillKlienId(false);
    setTanggalBackfillKlienId(undefined);
    setHalamanPublik('beranda');
    setActive('home');
  };

  // TIGA PERAN (20/11/2026): client yang login masuk Client Portal —
  // BUKAN admin portal. Portal hanya menerima data client itu
  // (di mode Firestore sudah tersaring lewat muatDataKlien; di mode
  // contoh portal menyaring seed penuh di dalamnya). Client tidak
  // pernah mencapai shell admin di bawah (nav, modul, MasterPage).
  if (user.peran === 'client') {
    return (
      <PortalKlien
        pengguna={user}
        data={data}
        onKeluar={tanganiKeluar}
        onKirimBooking={kirimBookingPublik}
        onKirimPengajuan={(input) =>
          kirimPengajuanPublik(input, user.klienId)
        }
      />
    );
  }

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
    // Tulis audit ke Firestore HANYA untuk Operator dan Admin:
    // audit hanya ditulis dari sesi internal yang bekerja
    // operasional; submission publik tidak menulis audit (audit
    // dicatat saat Operator/Admin memprosesnya).
    if (
      modeData === 'firestore' &&
      db &&
      (penggunaAktif.peran === 'operator' || penggunaAktif.peran === 'admin')
    ) {
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

    terapkanAtribusiAcak: () => {
      const tanpaOperator = data.kontrak
        .filter((k) => !k.operatorPenutup)
        .sort(
          (a, b) =>
            a.tanggalMulai.localeCompare(b.tanggalMulai) ||
            a.nomorPks.localeCompare(b.nomorPks),
        );
      if (tanpaOperator.length === 0) return null;
      const peta = distribusiAcakOperator(
        tanpaOperator,
        OPERATOR_PALEMBANG,
        BENIH_ACAK_ATRIBUSI,
      );
      const kontrakBaru = data.kontrak.map((k) => {
        const op = peta.get(k.id);
        if (!op) return k;
        return {
          ...k,
          operatorPenutup: op,
          tanggalTandaTangan: k.tanggalTandaTangan ?? k.tanggalMulai,
        };
      });
      setData((d) => ({ ...d, kontrak: kontrakBaru }));
      kontrakBaru.forEach((k) => {
        if (peta.has(k.id)) simpanKeFirestore('kontrak', k.id, k);
      });
      const perOperator = ringkasanDistribusi(tanpaOperator, peta);
      tambahAudit(
        'Atribusi massal diterapkan',
        'Kontrak',
        `${tanpaOperator.length} kontrak`,
        '—',
        `Distribusi acak ke ${OPERATOR_PALEMBANG.length} operator Palembang: ${perOperator
          .map(
            (p) =>
              `${p.operator} (${p.jumlah} kontrak, Rp${p.nilai.toLocaleString('id-ID')})`,
          )
          .join('; ')}`,
      );
      return { diterapkan: tanpaOperator.length, perOperator };
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
      if (!bolehAksi(penggunaAktif.peran, 'setujuiPengajuanKlien')) {
        return 'Only the Operator or Admin can approve portal submissions.';
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
      if (!bolehAksi(penggunaAktif.peran, 'tolakPengajuanKlien')) {
        return 'Only the Operator or Admin can reject portal submissions.';
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
      if (!input.agenda.trim()) return 'Meeting agenda is required.';
      if (!input.prospectId && !input.klienId) {
        return 'Select a prospect or client for this meeting.';
      }
      if (!input.clientRepresentatives.length)
        return 'Add at least one client representative.';
      if (!input.contactPersonNama.trim())
        return 'Contact person name is required.';
      if (!input.rriRepresentatives.length)
        return 'Add at least one RRI representative.';
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
        // Field lama peserta TETAP DISIMPAN (kompatibilitas) — diturunkan
        // dari RRI + Client Representative; tidak lagi ditampilkan.
        peserta: [
          ...input.rriRepresentatives,
          ...input.clientRepresentatives,
        ].join(', '),
        agenda: input.agenda.trim(),
        hasil: input.hasil || undefined,
        clientRepresentatives: input.clientRepresentatives,
        contactPersonNama: input.contactPersonNama.trim(),
        contactPersonTelepon:
          input.contactPersonTelepon.trim() || undefined,
        contactPersonEmail: input.contactPersonEmail?.trim() || undefined,
        rriRepresentatives: input.rriRepresentatives,
        alamatKlien: input.alamatKlien.trim() || undefined,
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

    // Fitur Update meeting (PR #73) — validasi sama seperti tambah;
    // id, satker, dan penanda sync Google Calendar dipertahankan.
    ubahMeeting: (id: string, input: MeetingInput) => {
      const lama = data.meeting.find((m) => m.id === id);
      if (!lama) return 'Meeting not found.';
      if (!input.tanggal) return 'Meeting date is required.';
      if (!input.jam) return 'Meeting time is required.';
      if (!input.agenda.trim()) return 'Meeting agenda is required.';
      if (!input.prospectId && !input.klienId) {
        return 'Select a prospect or client for this meeting.';
      }
      if (!input.clientRepresentatives.length)
        return 'Add at least one client representative.';
      if (!input.contactPersonNama.trim())
        return 'Contact person name is required.';
      if (!input.rriRepresentatives.length)
        return 'Add at least one RRI representative.';
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
      const diperbarui: Meeting = {
        ...lama,
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
        contactPersonTelepon:
          input.contactPersonTelepon.trim() || undefined,
        contactPersonEmail: input.contactPersonEmail?.trim() || undefined,
        rriRepresentatives: input.rriRepresentatives,
        alamatKlien: input.alamatKlien.trim() || undefined,
      };
      setData((d) => ({
        ...d,
        meeting: d.meeting.map((m) => (m.id === id ? diperbarui : m)),
      }));
      simpanKeFirestore('meeting', id, diperbarui);
      tambahAudit(
        'Meeting diperbarui',
        'Meeting',
        id,
        '—',
        `${input.tanggal} ${input.jam} — ${input.agenda.trim()}`,
      );
      return null;
    },

    // Penanda sinkronisasi Google Calendar (PR #73): simpan id event
    // Google + waktu sync ke dokumen meeting yang sama.
    tandaiMeetingTersinkron: (id: string, googleEventId: string) => {
      const lama = data.meeting.find((m) => m.id === id);
      if (!lama) return;
      const diperbarui: Meeting = {
        ...lama,
        googleEventId,
        googleSyncedAt: new Date().toISOString(),
      };
      setData((d) => ({
        ...d,
        meeting: d.meeting.map((m) => (m.id === id ? diperbarui : m)),
      }));
      simpanKeFirestore('meeting', id, diperbarui);
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
        kategori: input.kategori?.trim() || undefined,
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

    // PR #49 — Seed daftar kanonis regulasi & FAQ (16/11/2026).
    // Idempotent: hanya yang id-nya belum ada yang ditambah (tanpa
    // duplikasi bila dijalankan berulang). Satu entri audit per operasi.
    // Dipakai tombol di tab Knowledge Base / FAQ — di mode contoh semua
    // sudah ada lewat seed (tombol tersembunyi), di mode live Firestore
    // tombol muncul bila ada yang belum ada.
    seedArtikelKBRegulasi: () => {
      const hilang = ARTIKEL_REGULASI.filter(
        (a) => !data.artikelKB.some((x) => x.id === a.id),
      );
      if (hilang.length === 0)
        return { ditambah: 0, sudahAda: ARTIKEL_REGULASI.length };
      setData((d) => ({ ...d, artikelKB: [...d.artikelKB, ...hilang] }));
      hilang.forEach((a) => simpanKeFirestore('artikelKB', a.id, a));
      tambahAudit(
        'Artikel regulasi Knowledge Base ditambahkan',
        'Knowledge Base',
        `${hilang.length} artikel`,
        '—',
        hilang.map((a) => a.judul).join('; '),
      );
      return {
        ditambah: hilang.length,
        sudahAda: ARTIKEL_REGULASI.length - hilang.length,
      };
    },

    seedFaqRegulasi: () => {
      const hilang = FAQ_REGULASI.filter(
        (f) => !data.faq.some((x) => x.id === f.id),
      );
      if (hilang.length === 0)
        return { ditambah: 0, sudahAda: FAQ_REGULASI.length };
      setData((d) => ({ ...d, faq: [...d.faq, ...hilang] }));
      hilang.forEach((f) => simpanKeFirestore('faq', f.id, f));
      tambahAudit(
        'Entri FAQ Resources ditambahkan',
        'FAQ',
        `${hilang.length} entri`,
        '—',
        hilang.map((f) => f.pertanyaan).join('; '),
      );
      return {
        ditambah: hilang.length,
        sudahAda: FAQ_REGULASI.length - hilang.length,
      };
    },

    // Fase C — Chat antar operator 1-to-1 (PR #45, 16/11/2026).
    // Pesan TIDAK menulis entri audit: chat bersifat percakapan,
    // bukan transaksi (seperti submission publik yang juga tanpa audit).
    kirimPesan: (input: PesanInput) => {
      if (!input.penerimaEmail.trim()) return 'Recipient is required.';
      if (!input.isi.trim()) return 'Message content is required.';
      const kunciSaya = kunciAlamatOperator(
        penggunaAktif.nama,
        penggunaAktif.email,
      );
      const kunciPenerima = input.penerimaEmail.trim().toLowerCase();
      if (kunciPenerima === kunciSaya) {
        return 'You cannot send a message to yourself.';
      }
      const id = idBerikutnya('PSN-', data.pesan.map((p) => p.id));
      const pesan: Pesan = {
        id,
        idPercakapan: idPercakapan(kunciSaya, kunciPenerima),
        pengirim: { email: kunciSaya, nama: penggunaAktif.nama },
        penerima: { email: kunciPenerima },
        isi: input.isi.trim(),
        tanggal: new Date().toISOString(),
        dibaca: false,
        satker: SATKER_PILOT,
      };
      setData((d) => ({ ...d, pesan: [...d.pesan, pesan] }));
      simpanKeFirestore('pesan', id, pesan);
      return null;
    },

    tandaiPesanDibaca: (idPercakapanTarget: string) => {
      const kunciSaya = kunciAlamatOperator(
        penggunaAktif.nama,
        penggunaAktif.email,
      );
      const belumDibaca = data.pesan.filter(
        (p) =>
          p.idPercakapan === idPercakapanTarget &&
          p.penerima.email === kunciSaya &&
          !p.dibaca,
      );
      if (belumDibaca.length === 0) return;
      const sudahDibaca = new Set(belumDibaca.map((p) => p.id));
      setData((d) => ({
        ...d,
        pesan: d.pesan.map((p) =>
          sudahDibaca.has(p.id) ? { ...p, dibaca: true } : p,
        ),
      }));
      for (const p of belumDibaca) {
        simpanKeFirestore('pesan', p.id, { ...p, dibaca: true });
      }
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

  /** Pratinjau re-migrasi (dari halaman Master & Pengguna) — tanpa menulis apa pun. */
  const tanganiPratinjauRemigrasi = async (): Promise<PratinjauRemigrasi> => {
    if (!db) {
      throw new Error('Firebase is not yet configured.');
    }
    return pratinjauRemigrasi(db, SATKER_PILOT.kode);
  };

  /** Jalankan re-migrasi data kontrak 2026 (dari halaman Master & Pengguna). */
  const tanganiRemigrasi = async (
    onKemajuan?: (k: KemajuanRemigrasi) => void,
  ): Promise<HasilRemigrasi> => {
    if (!db) {
      throw new Error('Firebase is not yet configured.');
    }
    const hasil = await jalankanRemigrasi(
      db,
      penggunaAktif,
      SATKER_PILOT.kode,
      onKemajuan,
    );
    setSudahRemigrasi(true);
    setTanggalRemigrasi(hasil.tanggal);
    const dariFirestore = await muatDariFirestore(db, SATKER_PILOT.kode);
    if (dariFirestore) setData(dariFirestore);
    return hasil;
  };

  /** Jalankan migrasi MoU (dari halaman Master & Pengguna). */
  const tanganiMigrasiMou = async (
    onKemajuan?: (k: KemajuanMigrasiMou) => void,
  ): Promise<HasilMigrasiMou> => {
    if (!db) {
      throw new Error('Firebase is not yet configured.');
    }
    const hasil = await jalankanMigrasiMou(
      db,
      penggunaAktif,
      SATKER_PILOT.kode,
      onKemajuan,
    );
    setSudahMigrasiMou(true);
    setTanggalMigrasiMou(hasil.tanggal);
    const dariFirestore = await muatDariFirestore(db, SATKER_PILOT.kode);
    if (dariFirestore) setData(dariFirestore);
    return hasil;
  };

  /** Jalankan perbaikan satu kali MoU 037 (dari halaman Master & Pengguna). */
  const tanganiPerbaikanMou037 = async (
    onKemajuan?: (k: KemajuanPerbaikanMou037) => void,
  ): Promise<HasilPerbaikanMou037> => {
    if (!db) {
      throw new Error('Firebase is not yet configured.');
    }
    const hasil = await jalankanPerbaikanMou037(
      db,
      penggunaAktif,
      onKemajuan,
    );
    setSudahPerbaikanMou037(true);
    const dariFirestore = await muatDariFirestore(db, SATKER_PILOT.kode);
    if (dariFirestore) setData(dariFirestore);
    return hasil;
  };

  /** Jalankan migrasi Commitment (dari halaman Master & Pengguna). */
  const tanganiMigrasiCommitment = async (
    onKemajuan?: (k: KemajuanMigrasiCommitment) => void,
  ): Promise<HasilMigrasiCommitment> => {
    if (!db) {
      throw new Error('Firebase is not yet configured.');
    }
    const hasil = await jalankanMigrasiCommitment(
      db,
      penggunaAktif,
      SATKER_PILOT.kode,
      onKemajuan,
    );
    setSudahMigrasiCommitment(true);
    setTanggalMigrasiCommitment(hasil.tanggal);
    const dariFirestore = await muatDariFirestore(db, SATKER_PILOT.kode);
    if (dariFirestore) setData(dariFirestore);
    return hasil;
  };

  /** Jalankan backfill klienId satu kali (dari halaman Master & Pengguna). */
  const tanganiBackfillKlienId = async (
    onKemajuan?: (k: KemajuanBackfillKlienId) => void,
  ): Promise<HasilBackfillKlienId> => {
    if (!db) {
      throw new Error('Firebase is not yet configured.');
    }
    const hasil = await jalankanBackfillKlienId(
      db,
      penggunaAktif,
      SATKER_PILOT.kode,
      onKemajuan,
    );
    setSudahBackfillKlienId(true);
    setTanggalBackfillKlienId(hasil.tanggal);
    const dariFirestore = await muatDariFirestore(db, SATKER_PILOT.kode);
    if (dariFirestore) setData(dariFirestore);
    return hasil;
  };

  /**
   * Undang akun (tiga peran 20/11/2026; dari kartu "Invite Client
   * Account" di MasterPage). Admin SUDAH membuat akun Auth di
   * Firebase console (email + kata sandi) dan menyalin UID-nya —
   * aplikasi TIDAK membuat akun Auth (tidak ada Admin SDK). Handler
   * ini menulis dokumen profil `users/{uid}` (peran + klienId untuk
   * client) dan menandai record klien (`akunKlienDibuat`) bila
   * client. Profil yang sudah ada TIDAK ditimpa. Di luar mode
   * Firestore (mode contoh), hanya state lokal yang diubah — akun
   * tidak benar-benar dibuat; kartu tetap bisa dicoba dengan akun
   * dummy.
   */
  const tanganiUndangKlien = async (
    input: UndangKlienInput,
  ): Promise<{ galat: string | null }> => {
    if (input.peran === 'client') {
      const klien = data.klien.find((k) => k.id === input.klienId);
      if (!klien) {
        return { galat: `Client record ${input.klienId ?? '(kosong)'} not found.` };
      }
      if (klien.akunKlienDibuat) {
        return { galat: `Client record ${klien.id} (${klien.nama}) already has an account linked.` };
      }
    }
    if (!isFirebaseConfigured || !db) {
      // Mode contoh: tandai record klien saja (tidak ada Auth sungguhan).
      if (input.peran === 'client' && input.klienId) {
        setData((d) => ({
          ...d,
          klien: d.klien.map((k) =>
            k.id === input.klienId ? { ...k, akunKlienDibuat: true } : k,
          ),
        }));
      }
      return { galat: null };
    }
    try {
      const refProfil = doc(db, 'users', input.uidAuth);
      const sudahAda = await getDoc(refProfil);
      if (sudahAda.exists()) {
        // Akun hasil SIGNUP PUBLIK (19/11/2026 16:12 WIB): profil
        // client TANPA klienId sudah ada — TAUTKAN dengan menambah
        // klienId saja (updateDoc). Syarat: peran yang diminta
        // 'client', profil lama juga 'client' dan belum tertaut,
        // email form SAMA dengan email profil (menghindari salah
        // tautan UID). Akun yang sudah tertaut / akun operator TIDAK
        // bisa diubah dari sini — perubahan peran dilakukan admin
        // langsung di console. Aturan Firestore mengizinkan update
        // ini hanya untuk operator (lihat firestore.rules, users).
        const d = sudahAda.data();
        const klienIdLama = typeof d.klienId === 'string' ? d.klienId : '';
        if (
          input.peran !== 'client' ||
          d.peran !== 'client' ||
          klienIdLama !== ''
        ) {
          return { galat: `A profile for Auth UID ${input.uidAuth} already exists — role changes are done by the admin directly in the console.` };
        }
        if (
          String(d.email ?? '').toLowerCase() !== input.email.toLowerCase()
        ) {
          return { galat: `The email for Auth UID ${input.uidAuth} does not match the account that signed up — check the UID and email.` };
        }
        await updateDoc(refProfil, { klienId: input.klienId });
        if (input.klienId) {
          const klien = data.klien.find((k) => k.id === input.klienId);
          if (klien) {
            const klienBaru = { ...klien, akunKlienDibuat: true };
            await simpanDokumen(db, 'klien', klien.id, klienBaru);
            setData((dd) => ({
              ...dd,
              klien: dd.klien.map((k) => (k.id === klien.id ? klienBaru : k)),
            }));
          }
        }
        tambahAudit(
          'Akun client ditautkan',
          'users',
          input.uidAuth,
          '—',
          `${input.nama} (${input.email}) → ${input.klienId}`,
        );
        return { galat: null };
      }
      await setDoc(refProfil, {
        email: input.email.toLowerCase(),
        nama: input.nama,
        jabatan: input.jabatan,
        peran: input.peran,
        ...(input.peran === 'client' ? { klienId: input.klienId } : {}),
        satker: SATKER_PILOT,
        dibuatPada: new Date().toISOString(),
      });
      if (input.peran === 'client' && input.klienId) {
        const klien = data.klien.find((k) => k.id === input.klienId);
        if (klien) {
          const klienBaru = { ...klien, akunKlienDibuat: true };
          await simpanDokumen(db, 'klien', klien.id, klienBaru);
          setData((d) => ({
            ...d,
            klien: d.klien.map((k) => (k.id === klien.id ? klienBaru : k)),
          }));
        }
      }
      tambahAudit(
        input.peran === 'client' ? 'Akun client diundang' : 'Akun operator dibuat',
        'users',
        input.uidAuth,
        '—',
        `${input.nama} (${input.email})` +
          (input.peran === 'client' ? ` → ${input.klienId}` : ''),
      );
      return { galat: null };
    } catch (e) {
      console.error('Gagal mengundang akun:', e);
      return {
        galat:
          e instanceof Error
            ? e.message
            : 'Invite failed — check that the rules are published and the Auth UID exists.',
      };
    }
  };

  /**
   * Buat akun internal (tiga peran 20/11/2026; dari kartu "Create
   * Internal Account" di MasterPage). HANYA admin — guard
   * bolehAksi di sini (kartu juga hanya tampil untuk admin).
   * Memakai `buatAkunInternal` (secondary FirebaseApp) supaya sesi
   * admin yang sedang login TIDAK terganti. Akun client TIDAK
   * BISA dibuat dari sini (ditolak di auth.ts) — client hanya lewat
   * signup publik atau invite + tautan. Di luar mode Firestore
   * (mode contoh), akun tidak benar-benar dibuat — kartu memberi
   * tahu admin untuk memakai mode Firestore.
   */
  const tanganiBuatAkunInternal = async (
    input: BuatAkunInternalInput,
  ): Promise<{ galat: string | null; uid?: string }> => {
    if (!bolehAksi(penggunaAktif.peran, 'kelolaAkun')) {
      return { galat: 'Only the Admin can create internal accounts.' };
    }
    if (!isFirebaseConfigured || !db) {
      return {
        galat:
          'Firebase is not configured in this mode — internal accounts can only be created in Firestore mode.',
      };
    }
    try {
      const { uid } = await buatAkunInternal(
        input.nama,
        input.jabatan,
        input.email,
        input.kataSandi,
        input.peran,
      );
      tambahAudit(
        'Akun internal dibuat',
        'users',
        uid,
        '—',
        `${input.nama} (${input.email}) — ${input.peran}`,
      );
      return { galat: null, uid };
    } catch (e) {
      console.error('Gagal membuat akun internal:', e);
      return {
        galat:
          e instanceof Error
            ? e.message
            : 'Failed to create the account — try again.',
      };
    }
  };

  // Daftar utama sidebar: hanya item tanpa induk (sub-item tampil di
  // panel tambahan di samping sidebar, lihat panel di bawah).
  const navUtama = MODULES.filter((m) => m.phase !== 'Admin' && !m.induk);
  /** Nav utama dikelompokkan per CLUSTER_SIDEBAR (PR #36): urutan
      cluster = urutan tampil; urutan di dalam cluster mengikuti
      MODULES (navUtama). */
  const navUtamaCluster: NavItem[][] = CLUSTER_SIDEBAR.map((ids) =>
    navUtama.filter((m) => ids.includes(m.id)),
  );
  const navAdmin = MODULES.filter((m) => m.phase === 'Admin').filter((m) =>
    m.id === 'audit'
      ? bolehAksi(penggunaAktif.peran, 'lihatAudit')
      : bolehAksi(penggunaAktif.peran, 'kelolaMaster'),
  );
  const current = MODULES.find((m) => m.id === active) ?? MODULES[0];
  const Icon = current.icon;
  const propsModul = {
    data,
    user: penggunaAktif,
    actions,
    cari,
    klienIdTerpilihLuar: klienTerpilihLuar,
    onNavigasiKlien: (klienId: string) => {
      setKlienTerpilihLuar(klienId);
      setActive('klien');
    },
  };

  /** Panel tambahan yang sedang terbuka: HANYA sub-item induknya
      (perbaikan 15/11/2026 19:16 WIB — nama induk tidak dicantumkan
      lagi di dalam panelnya sendiri; judul panel sudah memuatnya). */
  const panelInduk = MODULES.find((m) => m.id === panelTerbuka);
  const panelItem: NavItem[] = panelInduk
    ? MODULES.filter((c) => c.induk === panelInduk.id)
    : [];

  /** Klik item nav utama (perbaikan 15/11/2026 19:16 WIB): induk yang
      punya sub-item NAVIGASI ke halaman induk itu SEKALIGUS membuka
      panel-nya (sebelumnya hanya membuka panel, konten tertahan di
      halaman sebelumnya); klik kedua pada induk yang sedang aktif =
      tutup panel saja, tetap di halaman induk. Tanpa sub-item ->
      navigasi langsung dan panel tertutup. */
  const tanganiKlikNav = (m: NavItem) => {
    const anak = MODULES.filter((c) => c.induk === m.id);
    if (anak.length > 0) {
      if (active === m.id) {
        // Sudah di halaman induk: alihkan panel saja. `active` tidak
        // berubah, jadi efek auto-open di atas tidak jalan dan panel
        // yang ditutup manual tidak terbuka kembali.
        setPanelTerbuka((terbuka) => (terbuka === m.id ? null : m.id));
        return;
      }
      setActive(m.id);
      setPanelTerbuka(m.id);
      return;
    }
    setActive(m.id);
    setPanelTerbuka(null);
  };

  /** Klik item di panel tambahan: navigasi, panel tetap terbuka karena
      tampilan masih di bagian induk yang sama (efek `active` di atas
      juga membukanya bila navigasi datang dari luar panel). */
  const tanganiKlikPanel = (id: ModuleId) => {
    setActive(id);
    setPanelTerbuka(panelUntukTampilan(id));
  };

  /** Jumlah pesan chat belum dibaca (PR #45): penerima = saya dan
      belum dibaca. Dipakai lencana di tombol nav Chat (terbuka
      maupun terlipat). */
  const kunciAlamatSaya = kunciAlamatOperator(
    penggunaAktif.nama,
    penggunaAktif.email,
  );
  const belumDibacaChat = data.pesan.filter(
    (p) => p.penerima.email === kunciAlamatSaya && !p.dibaca,
  ).length;

  /** Tombol satu item nav utama sidebar (dipakai per cluster di bawah). */
  const tombolNavUtama = (m: NavItem) => {
    const ItemIcon = m.icon;
    const anak = MODULES.filter((c) => c.induk === m.id);
    // Induk ikut ter-highlight saat sub-item-nya yang aktif.
    const isActive = m.id === active || anak.some((c) => c.id === active);
    return (
      <button
        key={m.id}
        title={sidebarCiut ? m.label : undefined}
        onClick={() => tanganiKlikNav(m)}
        className={`relative flex w-full items-center gap-3 rounded-md py-2 text-left text-sm ${
          sidebarCiut ? 'justify-center px-0' : 'px-3'
        } ${
          isActive
            ? 'bg-[#2573e2]/10 font-semibold text-[#2573e2]'
            : 'text-[#0d2569]/70 hover:bg-[#2573e2]/5 hover:text-[#0d2569]'
        }`}
      >
        <ItemIcon size={18} className="shrink-0" />
        {!sidebarCiut && m.label}
        {!sidebarCiut && m.id === 'chat' && belumDibacaChat > 0 && (
          <span className="ml-auto shrink-0 rounded-full bg-[#2573e2] px-1.5 py-0.5 text-[10px] font-bold text-white">
            {belumDibacaChat}
          </span>
        )}
        {sidebarCiut && m.id === 'chat' && belumDibacaChat > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2573e2] px-1 text-[10px] font-bold text-white">
            {belumDibacaChat}
          </span>
        )}
        {!sidebarCiut &&
          m.phase === 'C' &&
          !(m.id === 'chat' && belumDibacaChat > 0) && (
            <span className="ml-auto shrink-0 rounded bg-[#2573e2]/10 px-1.5 py-0.5 text-[10px] text-[#2573e2]">
              Phase {m.phase}
            </span>
          )}
      </button>
    );
  };

  /** Garis pemisah antar cluster sidebar (PR #36): abu muda, tanpa
      label — selebar sidebar di mode terbuka, garis pendek di tengah
      rel di mode terlipat. Bukan scrollbar; `.scrollbar-tersembunyi`
      tidak diubah. */
  const garisCluster = (key: string) => (
    <div
      key={key}
      aria-hidden="true"
      className={
        sidebarCiut
          ? 'mx-auto my-2 w-8 border-t border-slate-200'
          : 'my-2 border-t border-slate-200'
      }
    />
  );

  return (
    <div className="flex h-full flex-col">
      {/* Top bar putih gaya Qontak — logo + search + aksi di satu baris.
          Nama operator tampil DI SINI (instruksi pengguna 15/11/2026);
          footer sidebar tetap tanpa nama (keputusan 15/11/2026 12:14 WIB). */}
      <header className="flex shrink-0 items-center gap-4 border-b border-[#2573e2]/15 bg-white px-6 py-3">
        <div className="flex shrink-0 items-center gap-3">
          <img src="/logo-rri.svg" alt="Logo RRI" className="h-9 w-auto" />
          <img src={LOGO_DEALS_DATA_URI} alt="Deals" className="h-9 w-auto" />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <Notifikasi data={data} onNavigasi={(m) => setActive(m)} />
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2573e2] text-sm font-bold text-white">
              {penggunaAktif.nama.trim().charAt(0).toUpperCase()}
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold text-[#0d2569]">
                {penggunaAktif.nama}
              </span>
              <span className="block text-xs text-[#0d2569]/60">
                {penggunaAktif.satker?.nama ?? 'PALEMBANG'}
              </span>
            </span>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
      {/* Sidebar terang gaya Qontak — putih, teks navy (blok header logo
          dihapus: logo & satker sudah di top bar). Bisa dilipat ke rel
          ikon saja; sub-navigasi tampil di panel tambahan di samping
          sidebar (klik induknya), di mode terbuka maupun terlipat. */}
      <aside
        data-panel
        className={`relative flex shrink-0 flex-col bg-white text-[#0d2569] ${
          sidebarCiut ? 'w-[72px]' : 'w-60'
        }`}
      >
        {/* Tombol lipat/buka sidebar */}
        <div
          className={`flex shrink-0 px-2 pt-3 ${
            sidebarCiut ? 'justify-center' : 'justify-end'
          }`}
        >
          <button
            onClick={() => setSidebarCiut(!sidebarCiut)}
            title={sidebarCiut ? 'Buka sidebar' : 'Lipat sidebar'}
            aria-label={sidebarCiut ? 'Buka sidebar' : 'Lipat sidebar'}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#0d2569]/60 hover:bg-[#2573e2]/10 hover:text-[#2573e2]"
          >
            {sidebarCiut ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        <nav className="scrollbar-tersembunyi min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-4 pt-2">
          {/* Home kini modul biasa pertama di MODULES (koreksi pengguna
              15/11/2026): klik Home membuka tampilan Home kosong di
              dalam aplikasi, BUKAN keluar ke landing page. Nav utama
              dirender per cluster (PR #36) dengan garis pemisah tipis
              antar cluster — tanpa label kelompok. */}
          {navUtamaCluster.map((cluster, i) => (
            <Fragment key={`cluster-${i}`}>
              {i > 0 && garisCluster(`garis-${i}`)}
              {cluster.map((m) => tombolNavUtama(m))}
            </Fragment>
          ))}
          {navAdmin.length > 0 && (
            <>
              {garisCluster('garis-admin')}
              {!sidebarCiut && (
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-[#0d2569]/45">
                  Admin
                </p>
              )}
              {navAdmin.map((m) => {
                const ItemIcon = m.icon;
                const isActive = m.id === active;
                return (
                  <button
                    key={m.id}
                    title={sidebarCiut ? m.label : undefined}
                    onClick={() => {
                      setActive(m.id);
                      setPanelTerbuka(null);
                    }}
                    className={`flex w-full items-center gap-3 rounded-md py-2 text-left text-sm ${
                      sidebarCiut ? 'justify-center px-0' : 'px-3'
                    } ${
                      isActive
                        ? 'bg-[#2573e2]/10 font-semibold text-[#2573e2]'
                        : 'text-[#0d2569]/70 hover:bg-[#2573e2]/5 hover:text-[#0d2569]'
                    }`}
                  >
                    <ItemIcon size={18} className="shrink-0" />
                    {!sidebarCiut && m.label}
                  </button>
                );
              })}
            </>
          )}
        </nav>
        {sidebarCiut ? (
          <div className="flex shrink-0 justify-center border-t border-[#0d2569]/10 px-2 py-3">
            <button
              onClick={tanganiKeluar}
              title="Sign out"
              aria-label="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#0d2569]/15 text-[#0d2569]/70 hover:bg-[#2573e2]/10 hover:text-[#2573e2]"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div className="shrink-0 border-t border-[#0d2569]/10 px-5 py-4 text-xs text-[#0d2569]/60">
            <p className="mt-1">{LABEL_PERAN[penggunaAktif.peran]}</p>
            <p>{labelJabatan(penggunaAktif.jabatan)}</p>
            <button
              onClick={tanganiKeluar}
              className="mt-3 flex items-center gap-2 rounded-md border border-[#0d2569]/20 px-3 py-1.5 text-xs font-semibold text-[#0d2569] hover:bg-[#2573e2]/10 hover:text-[#2573e2]"
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Panel tambahan sub-navigasi (gaya Qontak): kolom kedua di antara
          sidebar dan konten — judul kapital + sub-item-nya saja (nama
          induk tidak dicantumkan lagi di dalam panel). In-flow (flex),
          jadi konten bergeser, bukan tertutup panel. Tampil di mode
          terbuka maupun terlipat. */}
      {panelInduk && panelItem.length > 0 && (
        <div
          data-panel
          className="flex w-60 shrink-0 flex-col border-r border-[#0d2569]/10 bg-white"
        >
          <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-4">
            <span className="text-xs font-bold uppercase tracking-wide text-[#0d2569]">
              {panelInduk.label}
            </span>
            <button
              onClick={() => setPanelTerbuka(null)}
              title="Tutup"
              aria-label="Tutup panel"
              className="flex h-6 w-6 items-center justify-center rounded-md text-[#0d2569]/50 hover:bg-[#2573e2]/10 hover:text-[#2573e2]"
            >
              <X size={15} />
            </button>
          </div>
          <div className="scrollbar-tersembunyi min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-4">
            {panelItem.map((item) => {
              const PanelIcon = item.icon;
              const itemAktif = item.id === active;
              return (
                <button
                  key={item.id}
                  onClick={() => tanganiKlikPanel(item.id)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm ${
                    itemAktif
                      ? 'bg-[#2573e2]/10 font-semibold text-[#2573e2]'
                      : 'text-[#0d2569]/70 hover:bg-[#2573e2]/5 hover:text-[#0d2569]'
                  }`}
                >
                  <PanelIcon size={15} className="shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Konten (search + Add di top bar dihapus atas instruksi pengguna 15/11/2026) */}
      <div className="flex min-w-0 flex-1 flex-col bg-white">
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
            {active === 'home' && <HomePage />}
            {active === 'dashboard' && <Dashboard {...propsModul} />}
            {active === 'kontrak' && <MenuKontrak {...propsModul} />}
            {active === 'mou' && <MenuMoU {...propsModul} />}
            {active === 'komitmen' && <MenuKomitmen {...propsModul} />}
            {active === 'approvement' && <MenuApprovement {...propsModul} />}
            {active === 'deals' && <Deals {...propsModul} />}
            {active === 'sewa' && <Sewa {...propsModul} />}
            {active === 'pengajuan' && <Pengajuan {...propsModul} />}
            {active === 'revenue' && <Revenue {...propsModul} />}
            {active === 'reporting' && <Reporting {...propsModul} />}
            {active === 'sales' && <Sales {...propsModul} />}
            {active === 'marketing' && <Marketing {...propsModul} />}
            {active === 'klien' && <MenuKlien {...propsModul} />}
            {active === 'prospek' && <MenuProspek {...propsModul} />}
            {active === 'offer' && <MenuOffer {...propsModul} />}
            {active === 'order' && <MenuOrder {...propsModul} />}
            {active === 'meeting' && <MenuMeeting {...propsModul} />}
            {active === 'umpanBalik' && <MenuUmpanBalik {...propsModul} />}
            {active === 'todo' && <Todo {...propsModul} />}
            {active === 'chat' && <Chat {...propsModul} />}
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
                onPratinjauRemigrasi={tanganiPratinjauRemigrasi}
                onRemigrasi={tanganiRemigrasi}
                statusRemigrasi={
                  modeData === 'firestore'
                    ? sudahRemigrasi
                      ? 'sudah'
                      : 'belum'
                    : 'tidak-tersedia'
                }
                tanggalRemigrasi={tanggalRemigrasi}
                onMigrasiMou={tanganiMigrasiMou}
                statusMigrasiMou={
                  modeData === 'firestore'
                    ? sudahMigrasiMou
                      ? 'sudah'
                      : 'belum'
                    : 'tidak-tersedia'
                }
                tanggalMigrasiMou={tanggalMigrasiMou}
                onPerbaikanMou037={tanganiPerbaikanMou037}
                statusPerbaikanMou037={
                  modeData === 'firestore'
                    ? sudahPerbaikanMou037
                      ? 'sudah'
                      : 'belum'
                    : 'tidak-tersedia'
                }
                onMigrasiCommitment={tanganiMigrasiCommitment}
                statusMigrasiCommitment={
                  modeData === 'firestore'
                    ? sudahMigrasiCommitment
                      ? 'sudah'
                      : 'belum'
                    : 'tidak-tersedia'
                }
                tanggalMigrasiCommitment={tanggalMigrasiCommitment}
                daftarKlien={data.klien.map((k) => ({
                  id: k.id,
                  nama: k.nama,
                  email: k.email,
                  akunKlienDibuat: k.akunKlienDibuat,
                }))}
                onUndangKlien={tanganiUndangKlien}
                onBuatAkunInternal={tanganiBuatAkunInternal}
                onBackfillKlienId={tanganiBackfillKlienId}
                statusBackfillKlienId={
                  modeData === 'firestore'
                    ? sudahBackfillKlienId
                      ? 'sudah'
                      : 'belum'
                    : 'tidak-tersedia'
                }
                tanggalBackfillKlienId={tanggalBackfillKlienId}
              />
            )}
            {active === 'service' && <Service {...propsModul} />}
          </div>
        </main>
      </div>
      </div>
    </div>
  );
}

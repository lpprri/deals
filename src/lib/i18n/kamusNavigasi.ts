// Kamus navigasi — Fase 1 dual bahasa (spek dual-bahasa §3.4).
// 24 label + 24 deskripsi MODULES di App.tsx. EN disalin verbatim dari
// MODULES (tidak diubah); ID ditulis mengikuti skill
// bahasa-indonesia-plain: kalimat aktif pendek, kata sehari-hari,
// sentence case untuk judul ID, sapaan "Anda" bila menyapa (deskripsi
// di sini tidak menyapa), nama diri/kode/tab yang masih Inggris di
// Fase 1 dipertahankan apa adanya (modul admin diterjemahkan di Fase 3).
// Setiap kunci punya ID dan EN; bila satu bahasa belum ada, pemanggil
// memakai fallback label/deskripsi MODULES (tidak tampil kosong).

import type { Bahasa } from '../bahasa';

export type IdModul =
  | 'home'
  | 'kontrak'
  | 'mou'
  | 'komitmen'
  | 'approvement'
  | 'sales'
  | 'sewa'
  | 'deals'
  | 'marketing'
  | 'klien'
  | 'prospek'
  | 'offer'
  | 'order'
  | 'pengajuan'
  | 'dashboard'
  | 'revenue'
  | 'reporting'
  | 'umpanBalik'
  | 'todo'
  | 'chat'
  | 'meeting'
  | 'service'
  | 'audit'
  | 'master';

export interface TerjemahanModul {
  label: string;
  description: string;
}

export const kamusNavigasi: Record<
  Bahasa,
  Record<IdModul, TerjemahanModul>
> = {
  id: {
    home: {
      label: 'Beranda',
      description:
        'Halaman Beranda di dalam aplikasi admin — sengaja masih kosong (koreksi 15/11/2026: bukan landing page, bukan tombol keluar).',
    },
    kontrak: {
      label: 'Kontrak',
      description:
        'Kontrak PNBP — daftar kontrak yang sama seperti di Kerja sama (Contracts / PKS).',
    },
    mou: {
      label: 'Nota Kesepahaman',
      description: 'Nota Kesepahaman yang mendukung programa siaran.',
    },
    komitmen: {
      label: 'Komitmen',
      description:
        'Dokumen kerja sama dukungan layanan untuk acara dan programa RRI.',
    },
    approvement: {
      label: 'Dokumen media partner',
      description: 'Dokumen media partner.',
    },
    sales: {
      label: 'Penjualan',
      description: 'Pipeline dan quotation.',
    },
    sewa: {
      label: 'Sewa / BMN',
      description:
        'Satu daftar sewa (Partnership Details → General PNBP): All, ON GOING, Expiring Soon, New Applications, Received in Advance, Still Receivable, Field Findings, Indralaya.',
    },
    deals: {
      label: 'Kerja sama',
      description:
        'Clients, Partnership Details (Functional PNBP, General PNBP, Service Support, Memorandum of Understanding, Media Partner), Contracts, Documents.',
    },
    marketing: {
      label: 'Kampanye',
      description: 'Acara dan iklan.',
    },
    klien: {
      label: 'Klien',
      description:
        'Daftar klien — daftar klien yang sama seperti di Kerja sama (tab Clients).',
    },
    prospek: {
      label: 'Prospek',
      description:
        'Daftar prospek — prospek yang sama seperti di pipeline Penawaran (PRS-01 …).',
    },
    offer: {
      label: 'Penawaran',
      description:
        'Pipeline Penawaran — peluang dari kontak pertama sampai diterima atau ditolak (QTN-01 …, PRS-01 …).',
    },
    order: {
      label: 'Order',
      description:
        'Daftar order — tab Order yang sama seperti di Penjualan (ORD-01 …).',
    },
    pengajuan: {
      label: 'Pengajuan',
      description:
        'Pengajuan baru (kerja sama baru / sewa baru): Masuk → Ditelaah → Menunggu Dokumen → Disetujui/Ditolak → Dikonversi menjadi kontrak.',
    },
    dashboard: {
      label: 'Dasbor',
      description:
        'Ringkasan periode, Revenue Analytics, tenggat laporan ke kantor pusat (isi sebelum tanggal 10, kirim sebelum tanggal 11). Employee Rank dan Satker Rank (Leaderboard of the Year / of the Month) per periode tanggal penandatanganan kontrak.',
    },
    revenue: {
      label: 'Pendapatan',
      description:
        'Overview, Revenue Stream, Revenue Type, Invoice, Payments, Billings, dan Reconciliation dengan data referensi Keuangan (hanya baca).',
    },
    reporting: {
      label: 'Laporan',
      description:
        'Laporan satker: PNBP Report, Receivables & Deposits Report, Service Support Report, Memorandum of Understanding Report, Media Partner Report.',
    },
    umpanBalik: {
      label: 'Umpan balik',
      description:
        'Survei kepuasan klien per kontrak (skala 1–5) — Feedback Survey yang sama seperti di Sumber daya sebelum 15/11/2026.',
    },
    todo: {
      label: 'Tugas',
      description: 'Tugas perorangan dan disposisi.',
    },
    chat: {
      label: 'Pesan',
      description: 'Pesan antaroperator (1-to-1).',
    },
    meeting: {
      label: 'Rapat',
      description: 'Jadwal rapat (MTG-01 …).',
    },
    service: {
      label: 'Sumber daya',
      description:
        'Help-Desk ke PIC kantor pusat, Knowledge Base (Regulations, SOP).',
    },
    audit: {
      label: 'Audit',
      description:
        'Jejak audit (append-only). Hanya Admin Sistem; tidak menampilkan konfigurasi Firebase atau email admin.',
    },
    master: {
      label: 'Data master dan pengguna',
      description:
        'Data master terpusat (kode akun, layanan, programa, jenis klien, jenis dokumen, status, daftar satker) dan pengguna contoh.',
    },
  },
  en: {
    home: {
      label: 'Home',
      description:
        'Home page inside the admin app — intentionally empty for now (correction 15/11/2026: not the landing page, not a sign-out).',
    },
    kontrak: {
      label: 'Contract',
      description:
        'PNBP contracts — the same contract list as Deals (Contracts / PKS).',
    },
    mou: {
      label: 'Memorandum of Understanding',
      description:
        'Memorandum of Understanding (Nota Kesepahaman) supporting broadcast programmes.',
    },
    komitmen: {
      label: 'Commitment',
      description:
        'Service-support cooperation documents for RRI events & programmes.',
    },
    approvement: {
      label: 'Approvement',
      description: 'Media partner documents.',
    },
    sales: {
      label: 'Sales',
      description: 'Pipeline, Quotation.',
    },
    sewa: {
      label: 'Lease / State Assets (BMN)',
      description:
        'One lease list (Partnership Details → General PNBP): All, ON GOING, Expiring Soon, New Applications, Received in Advance, Still Receivable, Field Findings, Indralaya.',
    },
    deals: {
      label: 'Deals',
      description:
        'Clients, Partnership Details (Functional PNBP, General PNBP, Service Support, Memorandum of Understanding, Media Partner), Contracts, Documents.',
    },
    marketing: {
      label: 'Campaign',
      description: 'Events and Advertisement.',
    },
    klien: {
      label: 'Clients',
      description: 'Client list — the same client list as Deals (Clients tab).',
    },
    prospek: {
      label: 'Prospect',
      description:
        'Prospect list — the same prospects as the Offer pipeline (PRS-01 …).',
    },
    offer: {
      label: 'Offer',
      description:
        'Offer pipeline — opportunities from first contact to accepted or rejected (QTN-01 …, PRS-01 …).',
    },
    order: {
      label: 'Order',
      description: 'Order list — the same Order tab as Sales (ORD-01 …).',
    },
    pengajuan: {
      label: 'Submission',
      description:
        'New Submissions (new partnership / new lease): Received → Under review → Awaiting documents → Approved/Rejected → Converted to contract.',
    },
    dashboard: {
      label: 'Dashboard',
      description:
        'Period summary, Revenue Analytics, head office report deadlines (fill in by the 10th, submit by the 11th). Employee Rank & Satker Rank (Leaderboard of the Year / of the Month) per contract signing date period.',
    },
    revenue: {
      label: 'Revenue',
      description:
        'Overview, Revenue Stream, Revenue Type, Invoice, Payments, Billings, and Reconciliation with Finance reference data (read-only).',
    },
    reporting: {
      label: 'Reports',
      description:
        'Satker Reports: PNBP Report, Receivables & Deposits Report, Service Support Report, Memorandum of Understanding Report, Media Partner Report.',
    },
    umpanBalik: {
      label: 'Feedback',
      description:
        'Client satisfaction survey per contract (scale 1–5) — the same Feedback Survey as Resources before 15/11/2026.',
    },
    todo: {
      label: 'Task',
      description: 'Individual Tasks and Dispositions.',
    },
    chat: {
      label: 'Chat',
      description: 'Messages between operators (1-to-1).',
    },
    meeting: {
      label: 'Meeting',
      description: 'Meeting Schedule (MTG-01 …).',
    },
    service: {
      label: 'Resources',
      description:
        'Help-Desk to head office PIC, Knowledge Base (Regulations, SOP).',
    },
    audit: {
      label: 'Audit',
      description:
        'Audit trail (append-only). System Admin only; does not show Firebase configuration or admin email.',
    },
    master: {
      label: 'Master Data & Users',
      description:
        'Centralised master data (account codes, services, programs, client types, document types, statuses, satker list) and dummy users.',
    },
  },
};

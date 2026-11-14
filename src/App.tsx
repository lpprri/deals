import { useState } from 'react';
import {
  BarChart3,
  Briefcase,
  CheckSquare,
  FileText,
  Handshake,
  LayoutDashboard,
  Megaphone,
  Settings,
  Wallet,
} from 'lucide-react';
import { isFirebaseConfigured } from './config/firebase';

// Partnership LPP RRI — Fase A scaffolding (PRD v2.0 Final, Bab 12 Langkah 1).
// Shell UI 8 modul (Bab 4) + palet 3 warna RRI (Bab 8.2):
// Biru #2573E2 (aksen), Navy #0D2569 (teks & sidebar), Putih #FFFFFF (konten).
// Modul Fase B/C yang belum ada datanya tampil "segera hadir", bukan fitur palsu.

type ModuleId =
  | 'dashboard'
  | 'marketing'
  | 'sales'
  | 'deals'
  | 'revenue'
  | 'reporting'
  | 'todo'
  | 'service';

const MODULES: {
  id: ModuleId;
  label: string;
  icon: typeof LayoutDashboard;
  phase: 'A' | 'B' | 'C';
  description: string;
}[] = [
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
];

export default function App() {
  const [active, setActive] = useState<ModuleId>('dashboard');
  const current = MODULES.find((m) => m.id === active)!;
  const Icon = current.icon;

  return (
    <div className="flex h-full">
      {/* Sidebar gelap — Navy RRI #0D2569 */}
      <aside className="flex w-60 shrink-0 flex-col bg-[#0d2569] text-white">
        <div className="px-5 pb-4 pt-5">
          <p className="text-lg font-bold leading-tight">Partnership</p>
          <p className="text-lg font-bold leading-tight">LPP RRI</p>
          <p className="mt-1 text-xs text-white/70">Radio Republik Indonesia</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {MODULES.map((m) => {
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
        </nav>
        <div className="border-t border-white/15 px-5 py-4 text-xs text-white/70">
          <p className="flex items-center gap-2">
            <Settings size={14} /> Settings
          </p>
          <p className="mt-2">Pengguna Dummy (Contoh)</p>
          <p>Operator Layanan</p>
        </div>
      </aside>

      {/* Konten */}
      <div className="flex min-w-0 flex-1 flex-col bg-white">
        <header className="flex items-center gap-4 border-b border-[#2573e2]/15 px-6 py-3">
          <input
            type="search"
            placeholder="Cari klien, kontrak, tagihan…"
            className="w-full max-w-md rounded-md border border-[#2573e2]/40 px-3 py-2 text-sm outline-none placeholder:text-[#0d2569]/50 focus:border-[#2573e2]"
          />
          <button className="ml-auto rounded-md bg-[#2573e2] px-4 py-2 text-sm font-semibold text-white">
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

          {current.phase === 'A' ? (
            <div className="mt-6 rounded-md border border-[#2573e2]/20 p-5">
              <p className="text-sm font-semibold">Fase A — Fondasi</p>
              <p className="mt-1 text-sm text-[#0d2569]/80">
                Modul ini dibangun pada Fase A (PRD v2.0 Final Bab 4.3).
                Fungsionalitas penuh — data, formulir, dan laporan — akan
                diisi pada langkah berikutnya setelah scaffolding ini.
              </p>
              <dl className="mt-4 grid max-w-lg grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-[#0d2569]/60">PKS aktif (Contoh)</dt>
                  <dd className="text-lg font-bold">0</dd>
                </div>
                <div>
                  <dt className="text-[#0d2569]/60">Piutang terbuka (Contoh)</dt>
                  <dd className="text-lg font-bold">Rp0</dd>
                </div>
              </dl>
            </div>
          ) : (
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
        </main>
      </div>
    </div>
  );
}

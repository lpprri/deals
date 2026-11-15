// Matriks hak akses — 1 role Operator + peran Klien (Fase C, Q-10).
// Operator (Staf Layanan & Pengembangan Usaha) dengan akses penuh,
// termasuk migrasi/master/konfigurasi. Klien (PIC) HANYA boleh membuat
// submission portal miliknya sendiri — SEMUA aksi operator ditolak untuk
// klien (matriks di bawah sengaja tidak memberi klien satu pun aksi
// operator; penegakan di Firestore Rules, bukan hanya di matriks ini).
// Catatan: data Keuangan (`penerimaanAcuan`) tetap read-only sebagai acuan
// dan perubahan sensitif tetap tercatat di audit — penegakan read-only itu
// ada di Firestore Rules, bukan di matriks ini.

import type { Role } from './dummyUsers';

export type Aksi =
  | 'tambahKlien'
  | 'tambahKontrak'
  | 'catatPembayaran'
  | 'verifikasiPembayaran'
  | 'tambahDenda'
  | 'ubahDokumen'
  | 'tambahPengajuan'
  | 'ubahPengajuan'
  | 'konversiPengajuan'
  | 'verifikasiLaporan'
  | 'kunciLaporan'
  | 'lihatAudit'
  | 'kelolaMaster'
  // Fase B — Sales, Marketing, To-Do (PRD Bab 7.2, 7.3, 7.7).
  | 'kelolaProspect'
  | 'kelolaQuotation'
  | 'kelolaOrder'
  | 'kelolaMeeting'
  | 'kelolaMarketing'
  | 'kelolaTask'
  | 'tambahDisposisi'
  | 'tutupDisposisi'
  // Fase C — Client Order Portal (Q-10). 'buatPengajuanKlien' HANYA untuk
  // klien (PIC membuat submission miliknya); setujui/tolak HANYA Operator.
  | 'buatPengajuanKlien'
  | 'setujuiPengajuanKlien'
  | 'tolakPengajuanKlien';

const SEMUA_AKSI: Aksi[] = [
  'tambahKlien',
  'tambahKontrak',
  'catatPembayaran',
  'verifikasiPembayaran',
  'tambahDenda',
  'ubahDokumen',
  'tambahPengajuan',
  'ubahPengajuan',
  'konversiPengajuan',
  'verifikasiLaporan',
  'kunciLaporan',
  'lihatAudit',
  'kelolaMaster',
  'kelolaProspect',
  'kelolaQuotation',
  'kelolaOrder',
  'kelolaMeeting',
  'kelolaMarketing',
  'kelolaTask',
  'tambahDisposisi',
  'tutupDisposisi',
];

const IZIN: Record<Aksi, Role[]> = Object.fromEntries(
  SEMUA_AKSI.map((aksi) => [aksi, ['operator'] as Role[]]),
) as Record<Aksi, Role[]>;

// Pengecualian Fase C: hanya PIC klien yang boleh membuat submission
// portal; hanya Operator yang boleh menyetujui/menolaknya.
IZIN.buatPengajuanKlien = ['klien'];
IZIN.setujuiPengajuanKlien = ['operator'];
IZIN.tolakPengajuanKlien = ['operator'];

export function bolehAksi(peran: Role, aksi: Aksi): boolean {
  return IZIN[aksi].includes(peran);
}

export const LABEL_PERAN: Record<Role, string> = {
  operator: 'Operator',
  klien: 'Klien (PIC)',
};

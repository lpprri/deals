// Matriks hak akses — DUA peran (keputusan pengguna 19/11/2026):
// Operator (Staf Layanan & Pengembangan Usaha) dengan akses penuh,
// termasuk migrasi/master/konfigurasi, dan Client yang HANYA membaca
// datanya sendiri (portal klien; ditegakkan firestore.rules).
// KOREKSI 2026-11-15 yang lama ("peran Klien dihapus") DIBALIK oleh
// keputusan 19/11/2026 — matriks ini TIDAK memberi client satu pun
// aksi tulis: semua aksi di bawah ini tetap operator saja. Setujui/
// tolak submission publik hanya Operator.
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
  // Fase C — antrean approval submission publik. Setujui/tolak HANYA
  // Operator; submission publik dibuat tanpa login (bukan aksi peran).
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

// Setujui/tolak submission publik: hanya Operator.
IZIN.setujuiPengajuanKlien = ['operator'];
IZIN.tolakPengajuanKlien = ['operator'];

export function bolehAksi(peran: Role, aksi: Aksi): boolean {
  return IZIN[aksi].includes(peran);
}

export const LABEL_PERAN: Record<Role, string> = {
  operator: 'Operator',
  client: 'Client',
};

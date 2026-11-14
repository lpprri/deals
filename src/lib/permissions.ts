// Matriks hak akses — 1 role (keputusan pengguna 14/11/2026 21:29 WIB).
// Hanya ada Operator (Staf Layanan & Pengembangan Usaha) dengan akses
// penuh, termasuk migrasi/master/konfigurasi.
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
  | 'tutupDisposisi';

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

export function bolehAksi(peran: Role, aksi: Aksi): boolean {
  return IZIN[aksi].includes(peran);
}

export const LABEL_PERAN: Record<Role, string> = {
  operator: 'Operator',
};

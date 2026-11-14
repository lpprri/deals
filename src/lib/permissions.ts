// Matriks hak akses Fase A (PRD Bab 2 & Bab 10, mode contoh).
// Aturan: data acuan Keuangan read-only untuk Layanan & Umum; Audit & Master
// hanya Admin Sistem; Pimpinan read-only. Penegakan di tampilan ini adalah
// lapis pertama — di produksi ditegakkan juga di Firestore Rules.

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
  | 'kelolaMaster';

const IZIN: Record<Aksi, Role[]> = {
  tambahKlien: ['operator_layanan', 'admin_sistem'],
  tambahKontrak: ['operator_layanan', 'admin_sistem'],
  catatPembayaran: ['operator_layanan', 'keuangan', 'admin_sistem'],
  // Verifikasi pembayaran hanya Keuangan (dan Admin).
  verifikasiPembayaran: ['keuangan', 'admin_sistem'],
  tambahDenda: ['operator_layanan', 'keuangan', 'admin_sistem'],
  ubahDokumen: ['operator_layanan', 'umum', 'admin_sistem'],
  tambahPengajuan: ['operator_layanan', 'umum', 'admin_sistem'],
  ubahPengajuan: ['operator_layanan', 'verifikator_layanan', 'admin_sistem'],
  konversiPengajuan: ['operator_layanan', 'verifikator_layanan', 'admin_sistem'],
  verifikasiLaporan: ['verifikator_layanan', 'admin_sistem'],
  kunciLaporan: ['verifikator_layanan', 'admin_sistem'],
  lihatAudit: ['admin_sistem'],
  kelolaMaster: ['admin_sistem'],
};

export function bolehAksi(peran: Role, aksi: Aksi): boolean {
  return IZIN[aksi].includes(peran);
}

export const LABEL_PERAN: Record<Role, string> = {
  operator_layanan: 'Operator Layanan',
  verifikator_layanan: 'Verifikator Layanan',
  keuangan: 'Keuangan',
  umum: 'Umum',
  pimpinan: 'Pimpinan',
  admin_sistem: 'Admin Sistem',
};

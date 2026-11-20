// Matriks hak akses — TIGA peran (keputusan pengguna 20/11/2026
// 21:06 WIB, menggantikan model EMPAT PERAN PR #124 yang tidak jadi
// di-merge):
// - Admin: super user yang mengelola web app — SEMUA aksi di bawah,
//   PLUS khusus admin: buat akun/akses peran lain (kelolaAkun),
//   migrasi & kartu one-off (jalankanMigrasi), master data
//   (kelolaMaster), audit (lihatAudit), kunci laporan (kunciLaporan).
// - Operator (petugas bidang Layanan & Pengembangan Usaha): kerja
//   operasional harian — SEMUA aksi operasional (kontrak, klien,
//   pembayaran, prospek, quotation, order, meeting, marketing,
//   task, pengajuan termasuk setujui/tolak submission publik, dan
//   sahkan laporan) KECUALI lima aksi admin di atas.
// - Client: HANYA membaca datanya sendiri (portal klien;
//   ditegakkan firestore.rules) — tidak satu pun aksi di bawah ini.
// Dua peran tambahan model empat peran DIHAPUS; aksi checklist
// verifikasi DIHAPUS bersama checklistnya (keputusan pengguna
// 20/11/2026 21:08 WIB — saat ini belum memerlukan pemeriksa
// laporan khusus). Tombol "Verify
// Report" di Reports (status Draft → Diverifikasi) kini memakai
// aksi 'sahkanLaporan' — aksi operasional (operator + admin),
// bukan checklist. Setujui/tolak submission publik: operator +
// admin (operasional, bukan admin).
// Catatan: data Keuangan (`penerimaanAcuan`) tetap read-only sebagai
// acuan dan perubahan sensitif tetap tercatat di audit — penegakan
// read-only itu ada di Firestore Rules, bukan di matriks ini.

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
  // Tombol "Verify Report" (Draft → Diverifikasi) di Reports.
  // BUKAN checklist verifikasi laporan (dihapus 20/11/2026).
  | 'sahkanLaporan'
  | 'kunciLaporan'
  | 'lihatAudit'
  | 'kelolaMaster'
  // TIGA PERAN (20/11/2026): admin saja — buat akun/akses peran
  // lain dan menjalankan migrasi + kartu one-off.
  | 'kelolaAkun'
  | 'jalankanMigrasi'
  // Fase B — Sales, Marketing, To-Do (PRD Bab 7.2, 7.3, 7.7).
  | 'kelolaProspect'
  | 'kelolaQuotation'
  | 'kelolaOrder'
  | 'kelolaMeeting'
  | 'kelolaMarketing'
  | 'kelolaTask'
  | 'tambahDisposisi'
  | 'tutupDisposisi'
  // Fase C — antrean approval submission publik. Setujui/tolak
  // Operator + Admin (operasional); submission publik dibuat tanpa
  // login (bukan aksi peran).
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
  'sahkanLaporan',
  'kunciLaporan',
  'lihatAudit',
  'kelolaMaster',
  'kelolaAkun',
  'jalankanMigrasi',
  'kelolaProspect',
  'kelolaQuotation',
  'kelolaOrder',
  'kelolaMeeting',
  'kelolaMarketing',
  'kelolaTask',
  'tambahDisposisi',
  'tutupDisposisi',
];

/** Aksi operasional harian — operator dan admin boleh. */
const AKSI_OPERASIONAL: Aksi[] = [
  'tambahKlien',
  'tambahKontrak',
  'catatPembayaran',
  'verifikasiPembayaran',
  'tambahDenda',
  'ubahDokumen',
  'tambahPengajuan',
  'ubahPengajuan',
  'konversiPengajuan',
  'sahkanLaporan',
  'kelolaProspect',
  'kelolaQuotation',
  'kelolaOrder',
  'kelolaMeeting',
  'kelolaMarketing',
  'kelolaTask',
  'tambahDisposisi',
  'tutupDisposisi',
  'setujuiPengajuanKlien',
  'tolakPengajuanKlien',
];

const IZIN: Record<Aksi, Role[]> = Object.fromEntries(
  SEMUA_AKSI.map((aksi) => [
    aksi,
    (AKSI_OPERASIONAL.includes(aksi)
      ? ['operator', 'admin']
      : ['admin']) as Role[],
  ]),
) as Record<Aksi, Role[]>;

// Setujui/tolak submission publik: operator + admin (operasional) —
// sudah tercakup AKSI_OPERASIONAL di atas, ditegaskan di sini.
IZIN.setujuiPengajuanKlien = ['operator', 'admin'];
IZIN.tolakPengajuanKlien = ['operator', 'admin'];

export function bolehAksi(peran: Role, aksi: Aksi): boolean {
  return IZIN[aksi].includes(peran);
}

/** Peran yang masuk admin portal (bukan Client Portal). */
export const PERAN_INTERNAL: Role[] = ['operator', 'admin'];

export function adalahInternal(peran: Role): boolean {
  return PERAN_INTERNAL.includes(peran);
}

export const LABEL_PERAN: Record<Role, string> = {
  operator: 'Operator',
  admin: 'Admin',
  client: 'Client',
};

// Matriks hak akses — EMPAT peran (keputusan pengguna 19/11/2026
// 20:41 + 20:43 WIB, menggantikan model DUA peran PR #121):
// - Operator: administrator app — SEMUA aksi di bawah, PLUS khusus
//   admin: buat akun/akses peran lain (kelolaAkun), migrasi & kartu
//   one-off (jalankanMigrasi), master data (kelolaMaster), audit
//   (lihatAudit), kunci laporan (kunciLaporan).
// - User (admin staf bidang Layanan & Pengembangan Usaha): kerja
//   operasional harian — SEMUA aksi operasional (kontrak, klien,
//   pembayaran, prospek, quotation, order, meeting, marketing,
//   task, pengajuan termasuk setujui/tolak submission publik) KECUALI
//   lima aksi admin di atas dan verifikasi laporan.
// - Verifikator (ahli madya / supervisor): HANYA memeriksa laporan
//   (verifikasiLaporan — checklist di Reports); data operasional
//   lain hanya dibaca, tanpa satu pun aksi tulis.
// - Client: HANYA membaca datanya sendiri (portal klien;
//   ditegakkan firestore.rules) — tidak satu pun aksi di bawah ini.
// Pembagian user vs operator ini DEFAULT (dicatat di PR) — pengguna
// boleh mengoreksi. Setujui/tolak submission publik: operator +
// user (operasional, bukan admin). Verifikasi laporan: operator +
// verifikator (operator tetap bisa memverifikasi laporannya sendiri).
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
  | 'verifikasiLaporan'
  | 'kunciLaporan'
  | 'lihatAudit'
  | 'kelolaMaster'
  // EMPAT PERAN (19/11/2026): operator saja — buat akun/akses peran
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
  // Operator + User (operasional); submission publik dibuat tanpa
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
  'verifikasiLaporan',
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

/** Aksi operasional harian — user (staf LPU) boleh, selain admin. */
const AKSI_USER: Aksi[] = [
  'tambahKlien',
  'tambahKontrak',
  'catatPembayaran',
  'verifikasiPembayaran',
  'tambahDenda',
  'ubahDokumen',
  'tambahPengajuan',
  'ubahPengajuan',
  'konversiPengajuan',
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
  SEMUA_AKSI.map((aksi) => [aksi, ['operator'] as Role[]]),
) as Record<Aksi, Role[]>;

// User: semua aksi operasional.
for (const aksi of AKSI_USER) {
  IZIN[aksi] = ['operator', 'user'];
}

// Verifikasi laporan: operator + verifikator (user tidak memverifikasi
// laporan yang ia kerjakan).
IZIN.verifikasiLaporan = ['operator', 'verifikator'];

// Setujui/tolak submission publik: operator + user (operasional).
IZIN.setujuiPengajuanKlien = ['operator', 'user'];
IZIN.tolakPengajuanKlien = ['operator', 'user'];

export function bolehAksi(peran: Role, aksi: Aksi): boolean {
  return IZIN[aksi].includes(peran);
}

/** Peran yang masuk admin portal (bukan Client Portal). */
export const PERAN_INTERNAL: Role[] = ['operator', 'user', 'verifikator'];

export function adalahInternal(peran: Role): boolean {
  return PERAN_INTERNAL.includes(peran);
}

export const LABEL_PERAN: Record<Role, string> = {
  operator: 'Operator',
  user: 'User',
  verifikator: 'Verifikator',
  client: 'Client',
};

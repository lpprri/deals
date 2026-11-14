// Audit trail — tambah-saja (append-only), tidak dapat diedit dari
// antarmuka (PRD Bab 10). Setiap buat/ubah/status/nilai pada data sensitif
// mencatat pengguna, waktu, dan nilai sebelum/sesudah.
// Halaman Audit HANYA untuk Admin Sistem dan TIDAK menampilkan konfigurasi
// Firebase atau email admin (pelajaran Bab 13).

import type { AuditEntry } from './types';
import type { DummyUser } from './dummyUsers';

let penghitung = 0;

export function buatEntriAudit(
  user: DummyUser,
  aksi: string,
  entitas: string,
  entitasId: string,
  sebelum?: string,
  sesudah?: string,
): AuditEntry {
  penghitung += 1;
  return {
    id: `AUD-${Date.now().toString(36)}-${penghitung}`,
    waktu: new Date().toISOString(),
    pengguna: user.nama,
    peran: user.jabatan,
    aksi,
    entitas,
    entitasId,
    sebelum,
    sesudah,
  };
}

/** Format waktu audit untuk tampilan (dd/mm/yyyy hh:mm). */
export function formatWaktuAudit(iso: string): string {
  const d = new Date(iso);
  const tgl = `${String(d.getDate()).padStart(2, '0')}/${String(
    d.getMonth() + 1,
  ).padStart(2, '0')}/${d.getFullYear()}`;
  const jam = `${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes(),
  ).padStart(2, '0')}`;
  return `${tgl} ${jam}`;
}

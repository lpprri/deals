// Konstanta & helper murni panel Tugas ala Todoist
// (duplikasi Todoist, 2026-11-24 — studi akun lpu.lpprripalembang@gmail.com,
// workspace RRI, tim LPP RRI).
//
// Semua label antarmuka Bahasa Indonesia (keputusan 2026-11-23: panel admin
// & client Bahasa Indonesia saja). Warna tanggal & bendera prioritas memakai
// merah/oranye/hijau semantik seperti Todoist — warna yang benar-benar
// dibutuhkan untuk membedakan terlambat/hari ini/prioritas (revisi palet
// 2026-11-15: palet dasar RRI bukan satu-satunya warna).
//
// Helper di sini murni (tanpa React/Firestore) supaya bisa diuji skrip cek.

import type { PrioritasTugas, StatusTask, Task } from './types';
import { formatTanggalPendek, hariIniIso } from './format';

/** Proyek nyata pengguna di Todoist (jumlah tugas saat studi). */
export const PROYEK_TODOIST: { nama: string; jumlah: number }[] = [
  { nama: 'PNBP', jumlah: 10 },
  { nama: 'KBRN', jumlah: 1 },
  { nama: 'Komunikasi Publik', jumlah: 0 },
  { nama: 'Layanan Publik', jumlah: 0 },
  { nama: 'General Affairs', jumlah: 1 },
];

/** Bagian di dalam proyek (Todoist: sections). */
export const BAGIAN_PROYEK: Record<string, string[]> = {
  PNBP: ['Permohonan Sewa', 'Laporan'],
  'General Affairs': ['Kepegawaian'],
};

/** Label disposisi nyata pengguna di Todoist. */
export const LABEL_DISPOSISI: string[] = [
  'Menunggu Disposisi',
  'Menunggu Pembayaran',
  'Perlu Ditandangani',
  'Menunggu Persetujuan KPKNL',
  'Paid',
  'Unpaid',
];

/** Label bawaan yang ditawarkan di panel (disposisi + umum). */
export const LABEL_BAWAAN: string[] = [...LABEL_DISPOSISI, 'Penting'];

/** Filter tersimpan ala Todoist (Filters & Labels). */
export const FILTER_TERSIMPAN: { id: string; label: string }[] = [
  { id: 'ditugaskan-ke-saya', label: 'Ditugaskan ke saya' },
  { id: 'prioritas-1', label: 'Prioritas 1' },
];

export const KUNCI_LABEL_TAMBAHAN = 'rri-tugas-label-tambahan';

/** Label tambahan buatan pengguna (disimpan lokal; pola sama seperti
 * status baca notifikasi & sidebar ciut). */
export function bacaLabelTambahan(): string[] {
  try {
    const mentah = localStorage.getItem(KUNCI_LABEL_TAMBAHAN);
    if (!mentah) return [];
    const daftar = JSON.parse(mentah) as unknown;
    return Array.isArray(daftar)
      ? daftar.filter((x): x is string => typeof x === 'string')
      : [];
  } catch {
    return [];
  }
}

export function simpanLabelTambahan(daftar: string[]): void {
  try {
    localStorage.setItem(KUNCI_LABEL_TAMBAHAN, JSON.stringify(daftar));
  } catch {
    // localStorage tidak tersedia — label tambahan hanya berlaku di sesi ini.
  }
}

/** Proyek tampil tugas; kosong berarti Kotak Masuk (Todoist: Inbox). */
export function proyekTugas(t: Task): string {
  return t.proyek?.trim() ? t.proyek.trim() : 'Kotak Masuk';
}

/** Prioritas tampil; kosong berarti P4 (tanpa prioritas). */
export function prioritasTugas(t: Task): PrioritasTugas {
  return t.prioritas ?? 4;
}

export const LABEL_PRIORITAS: Record<PrioritasTugas, string> = {
  1: 'Prioritas 1',
  2: 'Prioritas 2',
  3: 'Prioritas 3',
  4: 'Tanpa prioritas',
};

/** 'yyyy-mm-dd' + n hari (aritmetika tanggal lokal, pola format.ts). */
export function tambahHari(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const h = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${h}`;
}

/** Sabtu minggu ini (Todoist: This weekend); bila hari ini Sabtu/Minggu, Sabtu depan. */
export function akhirPekanIni(hariIni = hariIniIso()): string {
  const hari = new Date(`${hariIni}T00:00:00`).getDay(); // 0=Minggu..6=Sabtu
  const selisih = hari === 6 ? 7 : (6 - hari + 7) % 7 || 7;
  return tambahHari(hariIni, selisih);
}

/** Senin minggu depan (Todoist: Next week). */
export function seninDepan(hariIni = hariIniIso()): string {
  const hari = new Date(`${hariIni}T00:00:00`).getDay();
  const selisih = ((8 - hari) % 7) + 7;
  return tambahHari(hariIni, selisih);
}

/** Status tanggal relatif terhadap hari ini. */
export type StatusTanggal =
  | 'tanpa-tanggal'
  | 'terlambat'
  | 'hari-ini'
  | 'besok'
  | 'nanti';

export function statusTanggal(
  tenggat: string,
  hariIni = hariIniIso(),
): StatusTanggal {
  if (!tenggat) return 'tanpa-tanggal';
  if (tenggat < hariIni) return 'terlambat';
  if (tenggat === hariIni) return 'hari-ini';
  if (tenggat === tambahHari(hariIni, 1)) return 'besok';
  return 'nanti';
}

/** Label tanggal ala Todoist: 'Hari ini', 'Besok', 'Kemarin', atau dd/mm
 * (mis. '20/11') — tanggal lengkap dd/mm/yyyy hanya dipakai di tempat
 * yang memang menampilkannya penuh (mis. 'Selesai pada' di Laporan). */
export function labelTanggal(
  tenggat: string,
  hariIni = hariIniIso(),
): string {
  if (!tenggat) return 'Tanpa tanggal';
  const status = statusTanggal(tenggat, hariIni);
  if (status === 'hari-ini') return 'Hari ini';
  if (status === 'besok') return 'Besok';
  if (tenggat === tambahHari(hariIni, -1)) return 'Kemarin';
  return formatTanggalPendek(tenggat);
}

/** Terlambat: punya tenggat < hari ini dan belum Selesai/Ditutup. */
export function terlambat(t: Task, hariIni = hariIniIso()): boolean {
  return (
    t.tenggat !== '' &&
    t.tenggat < hariIni &&
    t.status !== 'Selesai' &&
    t.status !== 'Ditutup'
  );
}

export function tugasSelesai(t: Task): boolean {
  return t.status === 'Selesai' || t.status === 'Ditutup';
}

/** Progres sub-tugas: { selesai, total } — 0/0 bila tanpa sub-tugas. */
export function progresSubTugas(t: Task): { selesai: number; total: number } {
  const daftar = t.subTugas ?? [];
  return {
    selesai: daftar.filter((s) => s.selesai).length,
    total: daftar.length,
  };
}

/** Apakah tugas cocok dengan kata kunci (judul, pemilik, proyek, label, terkait). */
export function cocokKataKunci(t: Task, kataKunci: string): boolean {
  const k = kataKunci.trim().toLowerCase();
  if (k === '') return true;
  return `${t.id} ${t.judul} ${t.pemilik} ${proyekTugas(t)} ${
    t.bagian ?? ''
  } ${(t.label ?? []).join(' ')} ${t.deskripsi ?? ''} ${
    t.instruksi ?? ''
  } ${t.terkaitLabel ?? ''}`
    .toLowerCase()
    .includes(k);
}

export type KelompokTugas =
  | 'proyek'
  | 'tanggal'
  | 'prioritas'
  | 'penanggung-jawab'
  | 'label'
  | 'tanpa-grup';

/** Label Indonesia untuk pilihan Grouping (View Options ala Todoist). */
export const KELOMPOK_TUGAS_LABEL: Record<KelompokTugas, string> = {
  proyek: 'Proyek',
  tanggal: 'Tanggal',
  prioritas: 'Prioritas',
  'penanggung-jawab': 'Penanggung jawab',
  label: 'Label',
  'tanpa-grup': 'Tanpa grup',
};

export type UrutanTugas = 'cerdas' | 'tanggal' | 'prioritas' | 'abjad';

function kunciKelompok(
  t: Task,
  kelompok: KelompokTugas,
  hariIni = hariIniIso(),
): string {
  switch (kelompok) {
    case 'proyek':
      return proyekTugas(t);
    case 'tanggal':
      return labelTanggal(t.tenggat, hariIni);
    case 'prioritas':
      return LABEL_PRIORITAS[prioritasTugas(t)];
    case 'penanggung-jawab':
      return t.pemilik;
    case 'label':
      return (t.label ?? [])[0] ?? 'Tanpa label';
    case 'tanpa-grup':
      return 'Semua tugas';
  }
}

function bandingkanUrutan(
  a: Task,
  b: Task,
  urutan: UrutanTugas,
  hariIni = hariIniIso(),
): number {
  switch (urutan) {
    case 'tanggal':
      // Tanpa tanggal paling akhir.
      return (a.tenggat || '9999') < (b.tenggat || '9999')
        ? -1
        : (a.tenggat || '9999') > (b.tenggat || '9999')
          ? 1
          : a.judul.localeCompare(b.judul, 'id-ID');
    case 'prioritas':
      return (
        prioritasTugas(a) - prioritasTugas(b) ||
        (a.tenggat || '9999').localeCompare(b.tenggat || '9999') ||
        a.judul.localeCompare(b.judul, 'id-ID')
      );
    case 'abjad':
      return a.judul.localeCompare(b.judul, 'id-ID');
    case 'cerdas':
    default:
      // Cerdas (Smart): terlambat dulu, lalu hari ini, lalu prioritas,
      // lalu tanggal — pola Todoist Smart sort.
      if (terlambat(a, hariIni) !== terlambat(b, hariIni))
        return terlambat(a, hariIni) ? -1 : 1;
      if (
        statusTanggal(a.tenggat, hariIni) !== statusTanggal(b.tenggat, hariIni)
      ) {
        const urutanStatus: StatusTanggal[] = [
          'terlambat',
          'hari-ini',
          'besok',
          'nanti',
          'tanpa-tanggal',
        ];
        return (
          urutanStatus.indexOf(statusTanggal(a.tenggat, hariIni)) -
          urutanStatus.indexOf(statusTanggal(b.tenggat, hariIni))
        );
      }
      return prioritasTugas(a) - prioritasTugas(b);
  }
}

/** Kelompokkan + urutkan tugas untuk tampilan Daftar/Board. */
export function kelompokkanTugas(
  daftar: Task[],
  kelompok: KelompokTugas,
  urutan: UrutanTugas,
  hariIni = hariIniIso(),
): { nama: string; tugas: Task[] }[] {
  const terurut = [...daftar].sort((a, b) =>
    bandingkanUrutan(a, b, urutan, hariIni),
  );
  const peta = new Map<string, Task[]>();
  for (const t of terurut) {
    const kunci = kunciKelompok(t, kelompok, hariIni);
    const isi = peta.get(kunci);
    if (isi) isi.push(t);
    else peta.set(kunci, [t]);
  }
  // Urutan kelompok: proyek mengikuti urutan PROYEK_TODOIST, tanggal
  // kronologis, prioritas P1 dulu; sisanya alfabetis.
  const nama = [...peta.keys()];
  if (kelompok === 'proyek') {
    const urutanProyek = [
      'Kotak Masuk',
      ...PROYEK_TODOIST.map((p) => p.nama),
    ];
    nama.sort(
      (a, b) =>
        (urutanProyek.indexOf(a) === -1
          ? urutanProyek.length
          : urutanProyek.indexOf(a)) -
        (urutanProyek.indexOf(b) === -1
          ? urutanProyek.length
          : urutanProyek.indexOf(b)),
    );
  } else if (kelompok === 'tanggal') {
    const urutanTanggal = [
      'Kemarin',
      'Hari ini',
      'Besok',
      'Tanpa tanggal',
    ];
    nama.sort((a, b) => {
      const ia = urutanTanggal.indexOf(a);
      const ib = urutanTanggal.indexOf(b);
      if (ia !== -1 || ib !== -1)
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      return a.localeCompare(b, 'id-ID');
    });
  } else if (kelompok === 'prioritas') {
    const urutanPrioritas = [
      'Prioritas 1',
      'Prioritas 2',
      'Prioritas 3',
      'Tanpa prioritas',
    ];
    nama.sort(
      (a, b) =>
        urutanPrioritas.indexOf(a) - urutanPrioritas.indexOf(b),
    );
  } else {
    nama.sort((a, b) => a.localeCompare(b, 'id-ID'));
  }
  return nama.map((n) => ({ nama: n, tugas: peta.get(n) ?? [] }));
}

/** Filter tersimpan: id filter -> predikat (butuh nama pengguna untuk 'Ditugaskan ke saya'). */
export function cocokFilterTersimpan(
  t: Task,
  filterId: string,
  namaPengguna: string,
): boolean {
  if (filterId === 'ditugaskan-ke-saya') return t.pemilik === namaPengguna;
  if (filterId === 'prioritas-1') return prioritasTugas(t) === 1;
  return true;
}

/** Semua label yang dipakai: bawaan + label di data + label tambahan pengguna. */
export function semuaLabel(
  daftar: Task[],
  tambahan: string[] = [],
): string[] {
  const gabung = new Set<string>([...LABEL_BAWAAN, ...tambahan]);
  for (const t of daftar)
    for (const l of t.label ?? []) gabung.add(l);
  return [...gabung];
}

/** Status tugas yang bisa dipilih di filter (nilai tersimpan, Indonesia). */
export const STATUS_TUGAS: StatusTask[] = [
  'Belum Dikerjakan',
  'Berjalan',
  'Selesai',
  'Ditutup',
];

// Format tampilan: Bahasa Indonesia, tanggal dd/mm/yyyy, angka Indonesia
// (PRD v2.0 Final Bab 8.1 & Bab 10). Semua tanggal internal memakai ISO
// 'yyyy-mm-dd'; fungsi di sini hanya mengubah tampilannya.

export function formatRupiah(nilai: number): string {
  return `Rp${nilai.toLocaleString('id-ID')}`;
}

export function formatAngka(nilai: number): string {
  return nilai.toLocaleString('id-ID');
}

/** '2026-02-05' -> '05/02/2026'. Mengembalikan '-' bila kosong/tidak valid. */
export function formatTanggal(iso: string | undefined): string {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** '2026-02' -> 'Februari 2026'. */
export function formatPeriode(periode: string): string {
  const [y, m] = periode.split('-');
  const bulan = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  const idx = Number(m) - 1;
  if (!y || idx < 0 || idx > 11) return periode;
  return `${bulan[idx]} ${y}`;
}

/** Selisih hari dari `dari` ke `sampai` (positif bila `sampai` lebih lambat). */
export function selisihHari(dariIso: string, sampaiIso: string): number {
  const dari = new Date(`${dariIso}T00:00:00`);
  const sampai = new Date(`${sampaiIso}T00:00:00`);
  return Math.round((sampai.getTime() - dari.getTime()) / 86_400_000);
}

export function hariIniIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 'yyyy-mm-dd' -> 'yyyy-mm' (untuk filter periode laporan). */
export function periodeDariTanggal(iso: string): string {
  return iso.slice(0, 7);
}

/** Normalisasi nama untuk peringatan duplikat (PRD Bab 6.2). */
export function normalisasiNama(nama: string): string {
  return nama
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Format tampilan: Bahasa Indonesia, tanggal dd/mm/yyyy, angka Indonesia
// (PRD v2.0 Final Bab 8.1 & Bab 10). Semua tanggal internal memakai ISO
// 'yyyy-mm-dd'; fungsi di sini hanya mengubah tampilannya.

export function formatRupiah(nilai: number): string {
  return `Rp${nilai.toLocaleString('id-ID')}`;
}

export function formatAngka(nilai: number): string {
  return nilai.toLocaleString('id-ID');
}

/** Ukuran berkas: 701139 -> '685 KB', 7031454 -> '6,7 MB' (PR #49, tab Document). */
export function formatUkuranBerkas(byte: number): string {
  if (byte < 1024) return `${byte} B`;
  if (byte < 1024 * 1024) return `${Math.round(byte / 1024)} KB`;
  return `${(byte / (1024 * 1024)).toLocaleString('id-ID', { maximumFractionDigits: 1 })} MB`;
}

/** '2026-02-05' -> '05/02/2026'. Mengembalikan '-' bila kosong/tidak valid. */
export function formatTanggal(iso: string | undefined): string {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** '2026-11-24' -> '24/11' (label tanggal pendek ala Todoist). */
export function formatTanggalPendek(iso: string | undefined): string {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}`;
}

/** '24/11/2026' (dd/mm/yyyy; 1-2 digit juga boleh) -> '2026-11-24'.
 * Mengembalikan null bila format salah atau tanggal tidak valid — dipakai
 * input tanggal teks supaya tampilannya selalu DD/MM/YYYY, bukan format
 * locale browser (input date native menampilkan mm/dd/yyyy di browser
 * berbahasa Inggris). */
export function parseTanggalId(teks: string): string | null {
  const cocok = teks.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!cocok) return null;
  const d = Number(cocok[1]);
  const m = Number(cocok[2]);
  const y = Number(cocok[3]);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, m - 1, d);
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== m - 1 ||
    dt.getDate() !== d
  ) {
    return null;
  }
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** '2026-02' -> 'February 2026'. */
export function formatPeriode(periode: string): string {
  const [y, m] = periode.split('-');
  const bulan = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
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

/** Short month names (English) for chart axis labels. */
export const BULAN_SINGKAT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** '2026-01' -> 'Jan'. Mengembalikan periode apa adanya bila tidak valid. */
export function formatBulanSingkat(periode: string): string {
  const [, m] = periode.split('-');
  const idx = Number(m) - 1;
  if (idx < 0 || idx > 11) return periode;
  return BULAN_SINGKAT[idx];
}

/** Rupiah ringkas untuk label sumbu grafik, mis. 62.596.875 -> 'Rp63M'. */
export function formatRupiahSingkat(nilai: number): string {
  if (nilai >= 1_000_000_000) {
    return `Rp${(nilai / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}B`;
  }
  if (nilai >= 1_000_000) {
    return `Rp${Math.round(nilai / 1_000_000).toLocaleString('id-ID')}M`;
  }
  if (nilai >= 1_000) {
    return `Rp${Math.round(nilai / 1_000).toLocaleString('id-ID')}K`;
  }
  return `Rp${nilai.toLocaleString('id-ID')}`;
}

/** Normalisasi nama untuk peringatan duplikat (PRD Bab 6.2). */
export function normalisasiNama(nama: string): string {
  return nama
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

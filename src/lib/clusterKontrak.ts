// Cluster kolom tabel Contract (keputusan pengguna 17/11/2026 11:41 WIB).
//
// Tabel Contract dikelompokkan menjadi 7 cluster; tiap cluster bisa
// disembunyikan/ditampilkan lewat kotak centang di atas tabel — KECUALI
// Cluster 1 "Description" yang selalu tampil. State cluster yang
// disembunyikan disimpan di localStorage (pola yang sama seperti
// 'rri-sidebar-ciut' di App.tsx) supaya tetap setelah refresh; default:
// semua cluster tampil.
//
// Modul MURNI — tidak mengimpor Firebase (pola yang sama seperti
// kontrakTampilan.ts), supaya bisa dipakai skrip cek. localStorage
// diakses dengan guard typeof, supaya impor dari Node (skrip cek) aman.

export interface KolomKontrak {
  /** Id stabil kolom (untuk kunci render, bukan label tampil). */
  id: string;
  /** Header tampil — English (keputusan UI full-English). */
  header: string;
  /** true = angka, rata kanan (pola tabel yang sudah ada). */
  kanan?: boolean;
}

export interface ClusterKontrak {
  /** Id stabil cluster (disimpan di localStorage bila disembunyikan). */
  id: string;
  /** Nama cluster tampil — baris header grup di atas nama kolom. */
  label: string;
  /** true = selalu tampil, tanpa centang aktif (hanya Cluster 1). */
  selaluTampil: boolean;
  kolom: KolomKontrak[];
}

/**
 * Susunan 7 cluster + 32 kolom (keputusan pengguna 17/11/2026 11:41 WIB).
 * Urutan kolom di dalam tiap cluster = urutan tampil; kolom yang sudah
 * ada mempertahankan definisi/nilainya — termasuk Remaining Value
 * (Sisa Kontrak PR #67; redefinisi 11:41 WIB dibatalkan koreksi
 * Arahan 3 11:57 WIB — lihat sisaNilaiSetelahBayar di lib/realisasi.ts).
 *
 * Nama cluster 1 "Description" (keputusan pengguna 17/11/2026 12:20 WIB;
 * sebelumnya "Contract" pilihan Digi — pengguna tidak menamai cluster ini
 * saat itu — dan akhiran "(Always Show)" pada label centangnya dihapus
 * atas permintaan pengguna yang sama). Nama header kolom dipersingkat
 * dari arahan pengguna karena nama cluster di baris grup sudah memberi
 * konteks: "Type" = Type (Client), "Client" = Client (Name),
 * "Signatory" = (Nama) Penandatangan, "Signatory Title" = Jabatan
 * (Penandatangan), "View" = View (Documents).
 */
export const CLUSTER_KONTRAK: ClusterKontrak[] = [
  {
    id: 'kontrak',
    label: 'Description',
    selaluTampil: true,
    kolom: [
      { id: 'no', header: 'No.' },
      { id: 'nomor', header: 'Contract & Reference Number' },
      { id: 'judul', header: 'Contract Title' },
      { id: 'tanggalTandaTangan', header: 'Signing Date' },
      { id: 'owner', header: 'Owner' },
    ],
  },
  {
    id: 'klien',
    label: 'Client Details',
    selaluTampil: false,
    kolom: [
      { id: 'jenisKlien', header: 'Type' },
      { id: 'klien', header: 'Client' },
      { id: 'alamat', header: 'Address' },
      { id: 'penandatangan', header: 'Signatory' },
      { id: 'jabatanPenandatangan', header: 'Signatory Title' },
      { id: 'kontakNama', header: 'Contact Person' },
      { id: 'kontakTelepon', header: 'Contact' },
      { id: 'email', header: 'Email' },
    ],
  },
  {
    id: 'layanan',
    label: 'Service Details',
    selaluTampil: false,
    kolom: [
      { id: 'kategoriLayanan', header: 'Service Type' },
      { id: 'detailLayanan', header: 'Service Detail' },
      { id: 'periode', header: 'Contract Period' },
      { id: 'sisaHari', header: 'Remaining Days' },
      { id: 'realisasi', header: 'Realisation', kanan: true },
    ],
  },
  {
    id: 'revenue',
    label: 'Revenue Details',
    selaluTampil: false,
    kolom: [
      { id: 'nilaiKontrak', header: 'Contract Value', kanan: true },
      { id: 'denda', header: 'Fine Value', kanan: true },
      { id: 'totalRevenue', header: 'Total Revenue', kanan: true },
      { id: 'piutang', header: 'Receivable Value', kanan: true },
    ],
  },
  {
    id: 'pembayaran',
    label: 'Payment Details',
    selaluTampil: false,
    kolom: [
      { id: 'jatuhTempo', header: 'Payment Deadline' },
      { id: 'statusPembayaran', header: 'Payment Status' },
      { id: 'tanggalBayar', header: 'Payment Date' },
      { id: 'jumlahBayar', header: 'Payment Amount', kanan: true },
      { id: 'totalBayar', header: 'Total Payment', kanan: true },
      { id: 'sisaPiutangBaru', header: 'Remaining Receivable', kanan: true },
      { id: 'sisaNilaiBaru', header: 'Remaining Value', kanan: true },
    ],
  },
  {
    id: 'dokumen',
    label: 'Documents',
    selaluTampil: false,
    kolom: [
      { id: 'ketersediaanDokumen', header: 'Availability Rate', kanan: true },
      { id: 'lihatDokumen', header: 'View' },
    ],
  },
  {
    id: 'catatan',
    label: 'Notes',
    selaluTampil: false,
    kolom: [{ id: 'catatan', header: 'Notes' }],
  },
];

/** Kunci localStorage untuk daftar id cluster yang disembunyikan. */
export const KUNCI_LOCALSTORAGE_CLUSTER_KONTRAK =
  'rri-contract-cluster-tersembunyi';

/**
 * Kolom tampilan ramping default tabel Contract (perbaikan tabel
 * Contract, keputusan pengguna 19/11/2026 16:19 WIB — dari audit UI:
 * tabel 32 kolom tidak terpindai, jadi default hanya 10 kolom yang
 * muat tanpa scroll horizontal di 1485px). Ke-32 kolom TETAP ADA —
 * tampilan ramping hanya menyembunyikan kolom di luar daftar ini;
 * matikan "Slim view" untuk menampilkan semua kolom cluster yang
 * tampil. Urutan = urutan tampil.
 */
export const KOLOM_KONTRAK_TAMPILAN_RAMPING: string[] = [
  'no',
  'nomor',
  'judul',
  'tanggalTandaTangan',
  'klien',
  'periode',
  'sisaHari',
  'totalRevenue',
  'statusPembayaran',
  'lihatDokumen',
];

/** Kunci localStorage untuk pilihan tampilan ramping ('1' = ramping, '0' = penuh). */
export const KUNCI_LOCALSTORAGE_TAMPILAN_RAMPING_KONTRAK =
  'rri-contract-tampilan-ramping';

/**
 * Baca pilihan tampilan ramping dari localStorage (default TRUE bila
 * tidak ada / rusak / bukan browser — tampilan ramping adalah default
 * baru per keputusan 19/11/2026). Kunci ini TERPISAH dari kunci cluster
 * (rri-contract-cluster-tersembunyi): preferensi cluster lama yang
 * sudah tersimpan tetap dihormati, bukan ditimpa.
 */
export function bacaTampilanRampingKontrak(): boolean {
  try {
    if (typeof localStorage === 'undefined') return true;
    const mentah = localStorage.getItem(
      KUNCI_LOCALSTORAGE_TAMPILAN_RAMPING_KONTRAK,
    );
    if (mentah === null) return true;
    return mentah !== '0';
  } catch {
    return true;
  }
}

/** Simpan pilihan tampilan ramping ke localStorage (diam bila penyimpanan tidak tersedia). */
export function simpanTampilanRampingKontrak(ramping: boolean): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(
      KUNCI_LOCALSTORAGE_TAMPILAN_RAMPING_KONTRAK,
      ramping ? '1' : '0',
    );
  } catch {
    // Penyimpanan tidak tersedia (mode privat, dsb.) — abaikan saja.
  }
}

/**
 * Saring nilai mentah menjadi daftar id cluster tersembunyi yang valid:
 * hanya id cluster yang BOLEH disembunyikan (selaluTampil === false),
 * tanpa duplikat, urutan mengikuti CLUSTER_KONTRAK. Nilai bukan array,
 * id tidak dikenal, dan id Cluster 1 dibuang — jadi data localStorage
 * lama/rusak tidak pernah menyembunyikan Cluster 1.
 */
export function saringClusterKontrakTersembunyi(nilai: unknown): string[] {
  if (!Array.isArray(nilai)) return [];
  const bolehDisembunyikan = new Set(
    CLUSTER_KONTRAK.filter((c) => !c.selaluTampil).map((c) => c.id),
  );
  const tersaring = nilai.filter(
    (id): id is string => typeof id === 'string' && bolehDisembunyikan.has(id),
  );
  return CLUSTER_KONTRAK.filter((c) => tersaring.includes(c.id)).map(
    (c) => c.id,
  );
}

/** Baca daftar cluster tersembunyi dari localStorage ([] bila tidak ada / rusak / bukan browser). */
export function bacaClusterKontrakTersembunyi(): string[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const mentah = localStorage.getItem(KUNCI_LOCALSTORAGE_CLUSTER_KONTRAK);
    if (!mentah) return [];
    return saringClusterKontrakTersembunyi(JSON.parse(mentah) as unknown);
  } catch {
    return [];
  }
}

/** Simpan daftar cluster tersembunyi ke localStorage (diam bila penyimpanan tidak tersedia). */
export function simpanClusterKontrakTersembunyi(ids: string[]): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(
      KUNCI_LOCALSTORAGE_CLUSTER_KONTRAK,
      JSON.stringify(saringClusterKontrakTersembunyi(ids)),
    );
  } catch {
    // Penyimpanan tidak tersedia (mode privat, dsb.) — abaikan saja.
  }
}

/** Cluster yang tampil (semua kecuali yang disembunyikan), urutan tetap. */
export function clusterKontrakTerlihat(tersembunyi: string[]): ClusterKontrak[] {
  return CLUSTER_KONTRAK.filter((c) => !tersembunyi.includes(c.id));
}

/**
 * Cluster yang tampil dalam tampilan ramping (perbaikan tabel Contract,
 * keputusan pengguna 19/11/2026 16:19 WIB): seperti
 * clusterKontrakTerlihat, tetapi tiap cluster hanya berisi kolom-kolom
 * di KOLOM_KONTRAK_TAMPILAN_RAMPING; cluster yang tidak punya kolom
 * default (Notes) hilang dari baris header grup. ramping === false =
 * sama persis dengan clusterKontrakTerlihat (semua kolom cluster yang
 * tampil). Preferensi cluster lama (tersembunyi) tetap dihormati di
 * kedua mode.
 */
export function clusterKontrakTerlihatRamping(
  tersembunyi: string[],
  ramping: boolean,
): ClusterKontrak[] {
  const terlihat = clusterKontrakTerlihat(tersembunyi);
  if (!ramping) return terlihat;
  return terlihat
    .map((c) => ({
      ...c,
      kolom: c.kolom.filter((k) =>
        KOLOM_KONTRAK_TAMPILAN_RAMPING.includes(k.id),
      ),
    }))
    .filter((c) => c.kolom.length > 0);
}

/** Kolom yang tampil, diratakan mengikuti urutan cluster, urutan tetap. */
export function kolomKontrakTerlihat(tersembunyi: string[]): KolomKontrak[] {
  return clusterKontrakTerlihat(tersembunyi).flatMap((c) => c.kolom);
}

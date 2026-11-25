// Label tampil Bahasa Indonesia untuk nilai tersimpan (keputusan pengguna
// 2026-11-23 16:43 WIB: panel admin & klien Bahasa Indonesia saja —
// MENCABUT keputusan 2026-11-15 yang memakai bahasa Inggris full).
//
// ATURAN YANG DIKUNCI: nilai yang DISIMPAN di Firestore (status enum,
// tahap pipeline, jenis, kategori master) TIDAK PERNAH diubah — hanya
// tampilannya yang dipetakan lewat helper di file ini. Setiap fungsi
// menerima nilai tersimpan apa pun dan mengembalikan label Indonesia;
// nilai yang tidak dikenal dikembalikan apa adanya (fallback) supaya
// tidak ada layar yang kosong bila ada nilai lama di data.
//
// Proper noun TIDAK dipetakan di sini: nama satker, nama klien/orang,
// nama programa, "Partnership LPP RRI", "Radio Republik Indonesia",
// kode akun, NPWP, NIB/SIUP, QRIS, "ON GOING".

/** Pemetaan umum: nilai tersimpan -> label Indonesia, fallback nilai asli. */
function petakan(
  peta: Record<string, string>,
  nilai: string | undefined | null,
): string {
  if (nilai == null) return '';
  return peta[nilai] ?? nilai;
}

/** Status kontrak (StatusKontrak): Draft, Aktif, Selesai, Dibatalkan, Berakhir. */
export function labelStatusKontrak(status: string): string {
  return petakan(
    {
      Draft: 'Draft',
      Aktif: 'Aktif',
      Selesai: 'Selesai',
      Dibatalkan: 'Dibatalkan',
      Berakhir: 'Berakhir',
    },
    status,
  );
}

/** Status klien: Aktif / Nonaktif. */
export function labelStatusKlien(status: string): string {
  return petakan({ Aktif: 'Aktif', Nonaktif: 'Nonaktif' }, status);
}

/** Status dokumen checklist: Ada / Belum Ada / Tidak Berlaku. */
export function labelStatusDokumen(status: string): string {
  return petakan(
    {
      Ada: 'Ada',
      'Belum Ada': 'Belum Ada',
      'Tidak Berlaku': 'Tidak Berlaku',
    },
    status,
  );
}

/** Status tagihan (dihitung derive.ts, nilai tersimpan): 5 nilai. */
export function labelStatusTagihan(status: string): string {
  return petakan(
    {
      'Belum Jatuh Tempo': 'Belum Jatuh Tempo',
      'Jatuh Tempo': 'Jatuh Tempo',
      'Lewat Jatuh Tempo': 'Lewat Jatuh Tempo',
      'Lunas Sebagian': 'Lunas Sebagian',
      Lunas: 'Lunas',
    },
    status,
  );
}

/**
 * Status pembayaran kontrak (enum Inggris di kontrakTampilan.ts:
 * Paid / Unpaid / Partially-Paid / Insufficient Payment / Overdue) →
 * label Indonesia (keputusan pengguna 2026-11-23 21:03 WIB, MENCABUT
 * keputusan 17/11/2026 yang mengembalikan pill ke Inggris; helper lama
 * sempat dihapus 17/11/2026 08:34 WIB). Dipakai pill Status Pembayaran
 * di Deals + PortalKlien. ENUM TIDAK DIUBAH — hanya tampilannya.
 */
export function labelStatusPembayaranKontrak(status: string): string {
  return petakan(
    {
      Paid: 'Lunas',
      Unpaid: 'Belum Bayar',
      'Partially-Paid': 'Dibayar Sebagian',
      'Insufficient Payment': 'Kurang Bayar',
      Overdue: 'Terlambat Bayar',
    },
    status,
  );
}

/** Status verifikasi pembayaran: Terverifikasi / Menunggu Verifikasi. */
export function labelStatusVerifikasi(status: string): string {
  return petakan(
    {
      Terverifikasi: 'Terverifikasi',
      'Menunggu Verifikasi': 'Menunggu Verifikasi',
    },
    status,
  );
}

/** Status denda: Terhitung / Ditagihkan / Dibayar / Dihapus. */
export function labelStatusDenda(status: string): string {
  return petakan(
    {
      Terhitung: 'Terhitung',
      Ditagihkan: 'Ditagihkan',
      Dibayar: 'Dibayar',
      Dihapus: 'Dihapus',
    },
    status,
  );
}

/** Status sewa: ON GOING (sudah Inggris) / Berakhir / Pengajuan / Bermasalah. */
export function labelStatusSewa(status: string): string {
  return petakan(
    {
      'ON GOING': 'ON GOING',
      Berakhir: 'Berakhir',
      Pengajuan: 'Pengajuan',
      Bermasalah: 'Bermasalah',
    },
    status,
  );
}

/** Status temuan lapangan: Dalam Tindak Lanjut / Selesai. */
export function labelStatusTemuan(status: string): string {
  return petakan(
    { 'Dalam Tindak Lanjut': 'Dalam Tindak Lanjut', Selesai: 'Selesai' },
    status,
  );
}

/**
 * Status persetujuan (pengajuan, pengajuanKlien, quotation):
 * Menunggu / Disetujui / Ditolak (+ Draft / Dikirim untuk quotation).
 */
export function labelStatusPersetujuan(status: string): string {
  return petakan(
    {
      Menunggu: 'Menunggu',
      Disetujui: 'Disetujui',
      Ditolak: 'Ditolak',
      Draft: 'Draft',
      Dikirim: 'Dikirim',
    },
    status,
  );
}

/** Status order: Draft / Diproses / Selesai / Dibatalkan. */
export function labelStatusOrder(status: string): string {
  return petakan(
    {
      Draft: 'Draft',
      Diproses: 'Diproses',
      Selesai: 'Selesai',
      Dibatalkan: 'Dibatalkan',
    },
    status,
  );
}

/**
 * Status permintaan form publik (panel Order, enam tabel — PR #115):
 * Baru / Diproses / Selesai / Ditolak.
 */
export function labelStatusPermintaan(status: string): string {
  return petakan(
    {
      Baru: 'Baru',
      Diproses: 'Diproses',
      Selesai: 'Selesai',
      Ditolak: 'Ditolak',
    },
    status,
  );
}

/** Status task: Belum Dikerjakan / Berjalan / Selesai / Ditutup. */
export function labelStatusTask(status: string): string {
  return petakan(
    {
      'Belum Dikerjakan': 'Belum Dikerjakan',
      Berjalan: 'Berjalan',
      Selesai: 'Selesai',
      Ditutup: 'Ditutup',
    },
    status,
  );
}

/** Status tiket Help-Desk: Terbuka / Dijawab / Ditutup. */
export function labelStatusTiket(status: string): string {
  return petakan(
    { Terbuka: 'Terbuka', Dijawab: 'Dijawab', Ditutup: 'Ditutup' },
    status,
  );
}

/** Tahap pipeline (Q-11, 7 tahap final). */
export function labelTahapPipeline(tahap: string): string {
  return petakan(
    {
      'Prospek Baru': 'Prospek Baru',
      Dihubungi: 'Dihubungi',
      Penawaran: 'Penawaran',
      Negosiasi: 'Negosiasi',
      Order: 'Order',
      Diterima: 'Diterima',
      Ditolak: 'Ditolak',
    },
    tahap,
  );
}

/** Tahap pengajuan internal: Masuk / Ditelaah / Menunggu Dokumen / Disetujui / Ditolak / Dikonversi. */
export function labelTahapPengajuan(tahap: string): string {
  return petakan(
    {
      Masuk: 'Masuk',
      Ditelaah: 'Ditelaah',
      'Menunggu Dokumen': 'Menunggu Dokumen',
      Disetujui: 'Disetujui',
      Ditolak: 'Ditolak',
      Dikonversi: 'Dikonversi',
    },
    tahap,
  );
}

/** Jenis klien (master): Pemerintah / BUMN/BUMD / Swasta / Perorangan / Lembaga-Organisasi. */
export function labelJenisKlien(jenis: string): string {
  return petakan(
    {
      Pemerintah: 'Pemerintah',
      'BUMN/BUMD': 'BUMN/BUMD',
      Swasta: 'Swasta',
      Perorangan: 'Perorangan',
      'Lembaga/Organisasi': 'Lembaga/Organisasi',
    },
    jenis,
  );
}

/** Jenis dokumen (master checklist + varian impor): nama dokumen yang ditampilkan. */
export function labelJenisDokumen(jenis: string): string {
  return petakan(
    {
      'PKS (asli)': 'PKS (asli)',
      NPWP: 'NPWP',
      'NIB/SIUP': 'NIB/SIUP',
      'Surat Permohonan': 'Surat Permohonan',
      'Bukti Pembayaran': 'Bukti Pembayaran',
      'Berita Acara Serah Terima': 'Berita Acara Serah Terima',
      Kwitansi: 'Kwitansi',
      'Bukti Siaran': 'Bukti Siaran',
      // Varian jenis dokumen dari data impor (tidak ada di
      // MASTER_JENIS_DOKUMEN, tapi tampil di tabel dokumen & timeline).
      'Billing Pembayaran': 'Billing Pembayaran',
      'Kwitansi Pembayaran': 'Kwitansi Pembayaran',
      'Surat Penagihan': 'Surat Penagihan',
      'Permohonan Sewa': 'Permohonan Sewa',
    },
    jenis,
  );
}

/** Jenis PNBP: Fungsional / Umum. */
export function labelJenisPnBP(jenis: string): string {
  return petakan({ Fungsional: 'Fungsional', Umum: 'Umum' }, jenis);
}

/** Kategori layanan (master + varian impor): nama layanan yang ditampilkan. */
export function labelKategoriLayanan(kategori: string): string {
  return petakan(
    {
      'Siaran Iklan (Spot/Jingle/Filler/Advetorial)':
        'Siaran Iklan (Spot/Jingle/Filler/Advetorial)',
      'Ad-Lib / Jingle': 'Ad-Lib / Jingle',
      'Sewa Lahan / BMN': 'Sewa Lahan / BMN',
      'Sewa Rumah Dinas': 'Sewa Rumah Dinas',
      'Dukungan Layanan': 'Dukungan Layanan',
      'Nota Kesepahaman': 'Nota Kesepahaman',
      'Media Partner': 'Media Partner',
      // Kategori dari data impor (tidak ada di MASTER_KATEGORI_LAYANAN,
      // tapi tersimpan di kontrak/layanan dan tampil di Deals, Sales,
      // Lacak, dan MasterPage).
      'Jasa Penyiaran': 'Jasa Penyiaran',
      'Jasa Digitalisasi Penyiaran': 'Jasa Digitalisasi Penyiaran',
      'Jasa Penggunaan Sarana dan Prasarana Siaran':
        'Jasa Penggunaan Sarana dan Prasarana Siaran',
    },
    kategori,
  );
}

/**
 * Tujuan tiket Help-Desk (nilai tersimpan TUJUAN_TIKET, Q-12):
 * 'Direktorat Layanan & Pengembangan Usaha' — tampil sebagai prosa di
 * Service (intro Help-Desk dan detail tiket).
 */
export function labelTujuanTiket(tujuan: string): string {
  return petakan(
    {
      'Direktorat Layanan & Pengembangan Usaha':
        'Direktorat Layanan & Pengembangan Usaha',
    },
    tujuan,
  );
}

/**
 * Jabatan pengguna (nilai tersimpan di profil operator / entri audit):
 * deskripsi peran operator yang tampil di sidebar, tombol Operator
 * contoh di Login, daftar penerima tugas, dan kolom Role di Audit.
 * Nama akun (penggunaAktif.nama) TIDAK dipetakan — itu nama, bukan prosa.
 */
export function labelJabatan(jabatan: string): string {
  return petakan(
    {
      'Staf Layanan & Pengembangan Usaha':
        'Staf Layanan & Pengembangan Usaha',
      'Kepala Bidang Layanan & Pengembangan Usaha':
        'Kepala Bidang Layanan & Pengembangan Usaha',
      'Staf Umum': 'Staf Umum',
    },
    jabatan,
  );
}

/** Kategori tiket Help-Desk (master Q-12). */
export function labelKategoriTiket(kategori: string): string {
  return petakan(
    {
      'Tarif & Kode Akun PNBP': 'Tarif & Kode Akun PNBP',
      'Prosedur Kerja Sama': 'Prosedur Kerja Sama',
      'Kontrak & PKS': 'Kontrak & PKS',
      'Penagihan & Pembayaran': 'Penagihan & Pembayaran',
      'Sewa / BMN': 'Sewa / BMN',
      'Laporan PNBP': 'Laporan PNBP',
      Lainnya: 'Lainnya',
    },
    kategori,
  );
}

/** Kategori dokumen Knowledge Base: Regulasi / SOP. */
export function labelKategoriKB(kategori: string): string {
  return petakan(
    {
      Regulasi: 'Regulasi',
      SOP: 'SOP',
    },
    kategori,
  );
}

/** Sumber prospek (master): Pengajuan / Kunjungan / Referensi / Event / Media Sosial / Telepon / Lainnya. */
export function labelSumberProspek(sumber: string): string {
  return petakan(
    {
      Pengajuan: 'Pengajuan',
      Kunjungan: 'Kunjungan',
      Referensi: 'Referensi',
      Event: 'Event',
      'Media Sosial': 'Media Sosial',
      Telepon: 'Telepon',
      Lainnya: 'Lainnya',
    },
    sumber,
  );
}

/** Metode pembayaran (master): Transfer Bank / Tunai / QRIS. */
export function labelMetodePembayaran(metode: string): string {
  return petakan(
    { 'Transfer Bank': 'Transfer Bank', Tunai: 'Tunai', QRIS: 'QRIS' },
    metode,
  );
}

/** Uraian kode akun (master): tampil di UI sebagai label kode akun. */
export function labelUraianKodeAkun(uraian: string): string {
  return petakan(
    {
      'PNBP Umum': 'PNBP Umum',
      'PNBP Fungsional': 'PNBP Fungsional',
      'Denda Keterlambatan': 'Denda Keterlambatan',
      'Sarana Prasarana Sesuai Tusi': 'Sarana Prasarana Sesuai Tusi',
      'Penjualan Peralatan / Mesin': 'Penjualan Peralatan / Mesin',
    },
    uraian,
  );
}

/**
 * Kelompok umur piutang (dihitung derive.ts kelompokUmurPiutang):
 * 'Belum jatuh tempo' / '1–30 hari' / '31–60 hari' / 'Lebih dari 60 hari'.
 */
export function labelUmurPiutang(umur: string): string {
  return petakan(
    {
      'Belum jatuh tempo': 'Belum jatuh tempo',
      '1–30 hari': '1–30 hari',
      '31–60 hari': '31–60 hari',
      'Lebih dari 60 hari': 'Lebih dari 60 hari',
    },
    umur,
  );
}

/**
 * Aksi audit (nilai tersimpan, ditulis App.tsx tambahAudit).
 * Dipakai Dashboard (aktivitas terakhir) dan AuditPage — fallback nilai
 * asli bila ada aksi baru yang belum dipetakan.
 */
export function labelAksiAudit(aksi: string): string {
  return petakan(
    {
      'Klien dicatat': 'Klien dicatat',
      'Kontrak dicatat': 'Kontrak dicatat',
      'Atribusi kontrak diubah': 'Atribusi kontrak diubah',
      'Status dokumen diubah': 'Status dokumen diubah',
      'Pembayaran dicatat': 'Pembayaran dicatat',
      'Pembayaran diverifikasi': 'Pembayaran diverifikasi',
      'Denda dicatat (manual)': 'Denda dicatat (manual)',
      'Pengajuan dicatat': 'Pengajuan dicatat',
      'Tahap pengajuan diubah': 'Tahap pengajuan diubah',
      'Pengajuan dikonversi menjadi kontrak':
        'Pengajuan dikonversi menjadi kontrak',
      'Submission portal disetujui': 'Submission portal disetujui',
      'Submission portal ditolak': 'Submission portal ditolak',
      'Prospek dicatat': 'Prospek dicatat',
      'Tahap prospek diubah': 'Tahap prospek diubah',
      'Tindak lanjut dicatat': 'Tindak lanjut dicatat',
      'Quotation dibuat': 'Quotation dibuat',
      'Status quotation diubah': 'Status quotation diubah',
      'Order dibuat': 'Order dibuat',
      'Status order diubah': 'Status order diubah',
      'Order dikonversi menjadi kontrak': 'Order dikonversi menjadi kontrak',
      'Meeting dijadwalkan': 'Meeting dijadwalkan',
      'Event dicatat': 'Event dicatat',
      'Advertisement dicatat': 'Advertisement dicatat',
      'Tugas dicatat': 'Tugas dicatat',
      'Status tugas diubah': 'Status tugas diubah',
      'Disposisi dibuat': 'Disposisi dibuat',
      'Disposisi ditutup': 'Disposisi ditutup',
      'Tiket Bantuan dibuat': 'Tiket Bantuan dibuat',
      'Tiket Bantuan dijawab': 'Tiket Bantuan dijawab',
      'Status tiket diubah': 'Status tiket diubah',
      'Survei kepuasan dicatat': 'Survei kepuasan dicatat',
      'Dokumen Knowledge Base ditambah': 'Dokumen Knowledge Base ditambah',
      'Temuan lapangan dicatat': 'Temuan lapangan dicatat',
    },
    aksi,
  );
}

/** Entitas audit (nilai tersimpan, ditulis App.tsx tambahAudit). */
export function labelEntitasAudit(entitas: string): string {
  return petakan(
    {
      Klien: 'Klien',
      Kontrak: 'Kontrak',
      Dokumen: 'Dokumen',
      Pembayaran: 'Pembayaran',
      Denda: 'Denda',
      Pengajuan: 'Pengajuan',
      'Pengajuan Klien': 'Pengajuan Klien',
      Prospek: 'Prospek',
      Quotation: 'Quotation',
      Order: 'Order',
      Meeting: 'Meeting',
      Event: 'Event',
      Advertisement: 'Advertisement',
      Tugas: 'Tugas',
      Disposisi: 'Disposisi',
      Tiket: 'Tiket',
      'Umpan Balik': 'Umpan Balik',
      'Knowledge Base': 'Knowledge Base',
      Sewa: 'Sewa',
    },
    entitas,
  );
}

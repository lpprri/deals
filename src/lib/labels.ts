// Display labels (English) for stored Indonesian values — TERJEMAHAN
// BAHASA INGGRIS 2026-11-15 (keputusan pengguna: seluruh web app memakai
// bahasa Inggris secara full).
//
// ATURAN YANG DIKUNCI: nilai yang DISIMPAN di Firestore (status enum,
// tahap pipeline, jenis, kategori master) TIDAK PERNAH diubah — hanya
// tampilannya yang dipetakan ke Inggris lewat helper di file ini.
// Setiap fungsi menerima nilai tersimpan apa pun dan mengembalikan label
// Inggris; nilai yang tidak dikenal dikembalikan apa adanya (fallback)
// supaya tidak ada layar yang kosong bila ada nilai lama di data.
//
// Proper noun TIDAK dipetakan di sini: nama satker, nama klien/orang,
// nama programa, "Partnership LPP RRI", "Radio Republik Indonesia",
// kode akun, NPWP, NIB/SIUP, QRIS, "ON GOING".

/** Pemetaan umum: nilai tersimpan -> label Inggris, fallback nilai asli. */
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
      Aktif: 'Active',
      Selesai: 'Completed',
      Dibatalkan: 'Cancelled',
      Berakhir: 'Ended',
    },
    status,
  );
}

/** Status klien: Aktif / Nonaktif. */
export function labelStatusKlien(status: string): string {
  return petakan({ Aktif: 'Active', Nonaktif: 'Inactive' }, status);
}

/** Status dokumen checklist: Ada / Belum Ada / Tidak Berlaku. */
export function labelStatusDokumen(status: string): string {
  return petakan(
    {
      Ada: 'Available',
      'Belum Ada': 'Not yet available',
      'Tidak Berlaku': 'Not applicable',
    },
    status,
  );
}

/** Status tagihan (dihitung derive.ts, nilai tersimpan): 5 nilai. */
export function labelStatusTagihan(status: string): string {
  return petakan(
    {
      'Belum Jatuh Tempo': 'Not yet due',
      'Jatuh Tempo': 'Due',
      'Lewat Jatuh Tempo': 'Overdue',
      'Lunas Sebagian': 'Partially paid',
      Lunas: 'Paid',
    },
    status,
  );
}

/** Status verifikasi pembayaran: Terverifikasi / Menunggu Verifikasi. */
export function labelStatusVerifikasi(status: string): string {
  return petakan(
    {
      Terverifikasi: 'Verified',
      'Menunggu Verifikasi': 'Pending verification',
    },
    status,
  );
}

/** Status denda: Terhitung / Ditagihkan / Dibayar / Dihapus. */
export function labelStatusDenda(status: string): string {
  return petakan(
    {
      Terhitung: 'Calculated',
      Ditagihkan: 'Billed',
      Dibayar: 'Paid',
      Dihapus: 'Removed',
    },
    status,
  );
}

/** Status sewa: ON GOING (sudah Inggris) / Berakhir / Pengajuan / Bermasalah. */
export function labelStatusSewa(status: string): string {
  return petakan(
    {
      'ON GOING': 'ON GOING',
      Berakhir: 'Ended',
      Pengajuan: 'Application',
      Bermasalah: 'Problematic',
    },
    status,
  );
}

/** Status temuan lapangan: Dalam Tindak Lanjut / Selesai. */
export function labelStatusTemuan(status: string): string {
  return petakan(
    { 'Dalam Tindak Lanjut': 'In follow-up', Selesai: 'Resolved' },
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
      Menunggu: 'Pending',
      Disetujui: 'Approved',
      Ditolak: 'Rejected',
      Draft: 'Draft',
      Dikirim: 'Sent',
    },
    status,
  );
}

/** Status order: Draft / Diproses / Selesai / Dibatalkan. */
export function labelStatusOrder(status: string): string {
  return petakan(
    {
      Draft: 'Draft',
      Diproses: 'In progress',
      Selesai: 'Completed',
      Dibatalkan: 'Cancelled',
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
      Baru: 'New',
      Diproses: 'In progress',
      Selesai: 'Completed',
      Ditolak: 'Rejected',
    },
    status,
  );
}

/** Status task: Belum Dikerjakan / Berjalan / Selesai / Ditutup. */
export function labelStatusTask(status: string): string {
  return petakan(
    {
      'Belum Dikerjakan': 'Not started',
      Berjalan: 'In progress',
      Selesai: 'Completed',
      Ditutup: 'Closed',
    },
    status,
  );
}

/** Status tiket Help-Desk: Terbuka / Dijawab / Ditutup. */
export function labelStatusTiket(status: string): string {
  return petakan(
    { Terbuka: 'Open', Dijawab: 'Answered', Ditutup: 'Closed' },
    status,
  );
}

/** Tahap pipeline (Q-11, 7 tahap final). */
export function labelTahapPipeline(tahap: string): string {
  return petakan(
    {
      'Prospek Baru': 'New Prospect',
      Dihubungi: 'Contacted',
      Penawaran: 'Quotation',
      Negosiasi: 'Negotiation',
      Order: 'Order',
      Diterima: 'Accepted',
      Ditolak: 'Rejected',
    },
    tahap,
  );
}

/** Tahap pengajuan internal: Masuk / Ditelaah / Menunggu Dokumen / Disetujui / Ditolak / Dikonversi. */
export function labelTahapPengajuan(tahap: string): string {
  return petakan(
    {
      Masuk: 'Received',
      Ditelaah: 'Under review',
      'Menunggu Dokumen': 'Awaiting documents',
      Disetujui: 'Approved',
      Ditolak: 'Rejected',
      Dikonversi: 'Converted',
    },
    tahap,
  );
}

/** Jenis klien (master): Pemerintah / BUMN/BUMD / Swasta / Perorangan / Lembaga-Organisasi. */
export function labelJenisKlien(jenis: string): string {
  return petakan(
    {
      Pemerintah: 'Government',
      'BUMN/BUMD': 'State-Owned Enterprise',
      Swasta: 'Private',
      Perorangan: 'Individual',
      'Lembaga/Organisasi': 'Institution / Organisation',
    },
    jenis,
  );
}

/** Jenis dokumen (master checklist + varian impor): nama dokumen yang ditampilkan. */
export function labelJenisDokumen(jenis: string): string {
  return petakan(
    {
      'PKS (asli)': 'PKS (original)',
      NPWP: 'NPWP',
      'NIB/SIUP': 'NIB/SIUP',
      'Surat Permohonan': 'Application Letter',
      'Bukti Pembayaran': 'Proof of Payment',
      'Berita Acara Serah Terima': 'Handover Minutes',
      Kwitansi: 'Receipt',
      'Bukti Siaran': 'Broadcast Proof',
      // Varian jenis dokumen dari data impor (tidak ada di
      // MASTER_JENIS_DOKUMEN, tapi tampil di tabel dokumen & timeline).
      'Billing Pembayaran': 'Payment Billing',
      'Kwitansi Pembayaran': 'Payment Receipt',
      'Surat Penagihan': 'Collection Letter',
      'Permohonan Sewa': 'Lease Application',
    },
    jenis,
  );
}

/** Jenis PNBP: Fungsional / Umum. */
export function labelJenisPnBP(jenis: string): string {
  return petakan({ Fungsional: 'Functional', Umum: 'General' }, jenis);
}

/** Kategori layanan (master + varian impor): nama layanan yang ditampilkan. */
export function labelKategoriLayanan(kategori: string): string {
  return petakan(
    {
      'Siaran Iklan (Spot/Jingle/Filler/Advetorial)':
        'Advertising Broadcast (Spot/Jingle/Filler/Advertorial)',
      'Ad-Lib / Jingle': 'Ad-Lib / Jingle',
      'Sewa Lahan / BMN': 'Land / State Asset Lease (BMN)',
      'Sewa Rumah Dinas': 'Official Residence Lease',
      'Dukungan Layanan': 'Service Support',
      'Nota Kesepahaman': 'Memorandum of Understanding',
      'Media Partner': 'Media Partner',
      // Kategori dari data impor (tidak ada di MASTER_KATEGORI_LAYANAN,
      // tapi tersimpan di kontrak/layanan dan tampil di Deals, Sales,
      // Lacak, dan MasterPage).
      'Jasa Penyiaran': 'Broadcasting Services',
      'Jasa Digitalisasi Penyiaran': 'Broadcast Digitalisation Services',
      'Jasa Penggunaan Sarana dan Prasarana Siaran':
        'Use of Broadcast Facilities & Infrastructure',
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
        'Directorate of Service & Business Development',
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
        'Service & Business Development Staff',
      'Kepala Bidang Layanan & Pengembangan Usaha':
        'Head of Service & Business Development Division',
      'Staf Umum': 'General Affairs Staff',
    },
    jabatan,
  );
}

/** Kategori tiket Help-Desk (master Q-12). */
export function labelKategoriTiket(kategori: string): string {
  return petakan(
    {
      'Tarif & Kode Akun PNBP': 'PNBP Tariffs & Account Codes',
      'Prosedur Kerja Sama': 'Partnership Procedures',
      'Kontrak & PKS': 'Contracts & PKS',
      'Penagihan & Pembayaran': 'Billing & Payments',
      'Sewa / BMN': 'Leases / State Assets (BMN)',
      'Laporan PNBP': 'PNBP Reports',
      Lainnya: 'Other',
    },
    kategori,
  );
}

/** Tampilan Inggris untuk kategori dokumen Knowledge Base (nilai tersimpan tetap Indonesia). */
export function labelKategoriKB(kategori: string): string {
  return petakan(
    {
      Regulasi: 'Regulation',
      SOP: 'SOP',
    },
    kategori,
  );
}

/** Sumber prospek (master): Pengajuan / Kunjungan / Referensi / Event / Media Sosial / Telepon / Lainnya. */
export function labelSumberProspek(sumber: string): string {
  return petakan(
    {
      Pengajuan: 'Submission',
      Kunjungan: 'Visit',
      Referensi: 'Referral',
      Event: 'Event',
      'Media Sosial': 'Social Media',
      Telepon: 'Phone',
      Lainnya: 'Other',
    },
    sumber,
  );
}

/** Metode pembayaran (master): Transfer Bank / Tunai / QRIS. */
export function labelMetodePembayaran(metode: string): string {
  return petakan(
    { 'Transfer Bank': 'Bank Transfer', Tunai: 'Cash', QRIS: 'QRIS' },
    metode,
  );
}

/** Uraian kode akun (master): tampil di UI sebagai label kode akun. */
export function labelUraianKodeAkun(uraian: string): string {
  return petakan(
    {
      'PNBP Umum': 'General PNBP',
      'PNBP Fungsional': 'Functional PNBP',
      'Denda Keterlambatan': 'Late Payment Fine',
      'Sarana Prasarana Sesuai Tusi': 'Facilities per Duties & Functions',
      'Penjualan Peralatan / Mesin': 'Equipment / Machinery Sales',
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
      'Belum jatuh tempo': 'Not yet due',
      '1–30 hari': '1–30 days',
      '31–60 hari': '31–60 days',
      'Lebih dari 60 hari': 'More than 60 days',
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
      'Klien dicatat': 'Client recorded',
      'Kontrak dicatat': 'Contract recorded',
      'Atribusi kontrak diubah': 'Contract attribution changed',
      'Status dokumen diubah': 'Document status changed',
      'Pembayaran dicatat': 'Payment recorded',
      'Pembayaran diverifikasi': 'Payment verified',
      'Denda dicatat (manual)': 'Late fee recorded (manual)',
      'Pengajuan dicatat': 'Submission recorded',
      'Tahap pengajuan diubah': 'Submission stage changed',
      'Pengajuan dikonversi menjadi kontrak':
        'Submission converted into a contract',
      'Submission portal disetujui': 'Portal submission approved',
      'Submission portal ditolak': 'Portal submission rejected',
      'Prospek dicatat': 'Prospect recorded',
      'Tahap prospek diubah': 'Prospect stage changed',
      'Tindak lanjut dicatat': 'Follow-up recorded',
      'Quotation dibuat': 'Quotation created',
      'Status quotation diubah': 'Quotation status changed',
      'Order dibuat': 'Order created',
      'Status order diubah': 'Order status changed',
      'Order dikonversi menjadi kontrak': 'Order converted into a contract',
      'Meeting dijadwalkan': 'Meeting scheduled',
      'Event dicatat': 'Event recorded',
      'Advertisement dicatat': 'Advertisement recorded',
      'Tugas dicatat': 'Task recorded',
      'Status tugas diubah': 'Task status changed',
      'Disposisi dibuat': 'Disposition created',
      'Disposisi ditutup': 'Disposition closed',
      'Tiket Bantuan dibuat': 'Support ticket created',
      'Tiket Bantuan dijawab': 'Support ticket answered',
      'Status tiket diubah': 'Ticket status changed',
      'Survei kepuasan dicatat': 'Satisfaction survey recorded',
      'Dokumen Knowledge Base ditambah': 'Knowledge Base document added',
      'Temuan lapangan dicatat': 'Field finding recorded',
    },
    aksi,
  );
}

/** Entitas audit (nilai tersimpan, ditulis App.tsx tambahAudit). */
export function labelEntitasAudit(entitas: string): string {
  return petakan(
    {
      Klien: 'Client',
      Kontrak: 'Contract',
      Dokumen: 'Document',
      Pembayaran: 'Payment',
      Denda: 'Late Fee',
      Pengajuan: 'Submission',
      'Pengajuan Klien': 'Client Submission',
      Prospek: 'Prospect',
      Quotation: 'Quotation',
      Order: 'Order',
      Meeting: 'Meeting',
      Event: 'Event',
      Advertisement: 'Advertisement',
      Tugas: 'Task',
      Disposisi: 'Disposition',
      Tiket: 'Ticket',
      'Umpan Balik': 'Feedback',
      'Knowledge Base': 'Knowledge Base',
      Sewa: 'Lease',
    },
    entitas,
  );
}

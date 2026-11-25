// Verifikasi irisan 1 audit bahasa Indonesia (temuan #1 sisa, #2, #69,
// #70 — audit-panel-admin-2026-11-25-revalidasi-main.md) — TANPA Firestore.
// - labels.ts: semua helper display kembali ke Indonesia (keputusan
//   pengguna 23/11/2026 16:43 WIB, mencabut keputusan full-English
//   15/11/2026); komentar header diperbarui. Nilai tersimpan / enum
//   TIDAK diubah — hanya tampilannya.
// - Helper baru labelStatusPembayaranKontrak (labels.ts): enum Inggris
//   Paid/Unpaid/Partially-Paid/Insufficient Payment/Overdue → Lunas /
//   Belum Bayar / Dibayar Sebagian / Kurang Bayar / Terlambat Bayar
//   (keputusan 23/11/2026 21:03 WIB); dipakai pill Deals + PortalKlien.
// - Tab Reporting: PNBP Bulanan / Piutang & Penyetoran / Kantor Pusat;
//   judul laporan + kalimat penjelas + "Total Kontrol" ikut Indonesia.
//   Nama file CSV (NAMA_FILE) TIDAK diubah (T4 masih terbuka).
// - Home: kalimat kosong → Indonesia. Tab FAQ → "Pertanyaan Umum".
// - Label + deskripsi 4 modul tersembunyi (Sales, Sewa, Deals,
//   Pengajuan) → Indonesia; id modul TIDAK diubah.
// - Pill Status Pembayaran me-render label Indonesia (bukan enum mentah);
//   opsi filter disamakan dengan keputusan 23/11 (Kurang Bayar /
//   Terlambat Bayar / Dibayar Sebagian); nilai option (enum) TIDAK diubah.
// - Sel cluster dokumen memakai labelStatusDokumen (bukan literal).
// - Detail Kontrak memakai helper jatuhTempoPembayaranKontrak yang sama
//   dengan tabel + label "Batas waktu bayar" (bukan tagihan pertama /
//   "Tanggal jatuh tempo").
// - StatusBadge: substring Indonesia ditambah agar ikon 'Jatuh Tempo' /
//   'Ada' / 'Dikirim' / 'Dijawab' tidak berubah (cek Inggris dipertahankan
//   untuk nilai Inggris yang masih tiba mentah, mis. 'Verified').
// Keluar bukan-nol bila ada asersi gagal.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  labelAksiAudit,
  labelEntitasAudit,
  labelJabatan,
  labelJenisDokumen,
  labelJenisKlien,
  labelJenisPnBP,
  labelKategoriLayanan,
  labelKategoriTiket,
  labelKategoriKB,
  labelMetodePembayaran,
  labelSumberProspek,
  labelStatusDenda,
  labelStatusDokumen,
  labelStatusKlien,
  labelStatusKontrak,
  labelStatusOrder,
  labelStatusPembayaranKontrak,
  labelStatusPermintaan,
  labelStatusPersetujuan,
  labelStatusSewa,
  labelStatusTagihan,
  labelStatusTask,
  labelStatusTemuan,
  labelStatusTiket,
  labelTahapPengajuan,
  labelTahapPipeline,
  labelTujuanTiket,
  labelUmurPiutang,
  labelUraianKodeAkun,
  labelStatusVerifikasi,
} from '../src/lib/labels';
import { jatuhTempoPembayaranKontrak } from '../src/lib/kontrakTampilan';
import { DATA_NYATA } from '../src/lib/seedNyata';

// Dijalankan dari root repo — berkas dibaca saat runtime, jadi path
// diambil dari cwd, bukan dari lokasi bundle.
const baca = (relatif: string) =>
  readFileSync(join(process.cwd(), relatif), 'utf8');
const labels = baca('src/lib/labels.ts');
const ui = baca('src/components/ui.tsx');
const kontrakTampilan = baca('src/lib/kontrakTampilan.ts');
const reporting = baca('src/modules/Reporting.tsx');
const home = baca('src/modules/Home.tsx');
const service = baca('src/modules/Service.tsx');
const app = baca('src/App.tsx');
const deals = baca('src/modules/Deals.tsx');
const portal = baca('src/modules/PortalKlien.tsx');
const notifikasi = baca('src/lib/notifikasi.ts');

let gagal = 0;
const cek = (nama: string, lolos: boolean, detail = '') => {
  console.log(`${lolos ? 'OK' : 'GAGAL'} ${nama}${detail ? `: ${detail}` : ''}`);
  if (!lolos) gagal += 1;
};

// ---------- #1(a) labels.ts: komentar + helper kembali Indonesia ----------
cek(
  'labels.ts: komentar header merujuk keputusan Indonesia 23/11/2026',
  labels.includes('Bahasa Indonesia saja') &&
    labels.includes('MENCABUT keputusan 2026-11-15'),
);
cek(
  'labels.ts: komentar full-English 15/11 sudah tidak ada',
  !labels.includes('bahasa Inggris secara full') &&
    !labels.includes('seluruh web app memakai'),
);
cek(
  'labels.ts: labelStatusKontrak Selesai → "Selesai" (bukan "Completed")',
  labelStatusKontrak('Selesai') === 'Selesai' &&
    !labels.includes("Selesai: 'Completed'"),
);
cek(
  'labels.ts: labelStatusKlien Aktif → "Aktif"',
  labelStatusKlien('Aktif') === 'Aktif' &&
    !labels.includes("Aktif: 'Active'"),
);
cek(
  'labels.ts: labelStatusDokumen Ada/Belum Ada/Tidak Berlaku',
  labelStatusDokumen('Ada') === 'Ada' &&
    labelStatusDokumen('Belum Ada') === 'Belum Ada' &&
    labelStatusDokumen('Tidak Berlaku') === 'Tidak Berlaku' &&
    !labels.includes("'Available'") &&
    !labels.includes("'Not yet available'") &&
    !labels.includes("'Not applicable'"),
);
cek(
  'labels.ts: labelStatusTagihan Lunas/Lewat Jatuh Tempo',
  labelStatusTagihan('Lunas') === 'Lunas' &&
    labelStatusTagihan('Lewat Jatuh Tempo') === 'Lewat Jatuh Tempo' &&
    !labels.includes("Lunas: 'Paid'"),
);
cek(
  'labels.ts: labelStatusVerifikasi Terverifikasi',
  labelStatusVerifikasi('Terverifikasi') === 'Terverifikasi' &&
    !labels.includes("'Pending verification'"),
);
cek(
  'labels.ts: labelStatusDenda Dibayar (bukan "Paid")',
  labelStatusDenda('Dibayar') === 'Dibayar' &&
    !labels.includes("'Calculated'") &&
    !labels.includes("'Billed'"),
);
cek(
  'labels.ts: labelStatusSewa Berakhir/Pengajuan/Bermasalah',
  labelStatusSewa('Berakhir') === 'Berakhir' &&
    labelStatusSewa('Pengajuan') === 'Pengajuan' &&
    !labels.includes("'Ended'") &&
    !labels.includes("'Problematic'"),
);
cek(
  'labels.ts: labelStatusTemuan Dalam Tindak Lanjut',
  labelStatusTemuan('Dalam Tindak Lanjut') === 'Dalam Tindak Lanjut' &&
    !labels.includes("'In follow-up'") &&
    !labels.includes("'Resolved'"),
);
cek(
  'labels.ts: labelStatusPersetujuan Disetujui/Ditolak/Dikirim',
  labelStatusPersetujuan('Disetujui') === 'Disetujui' &&
    labelStatusPersetujuan('Ditolak') === 'Ditolak' &&
    labelStatusPersetujuan('Dikirim') === 'Dikirim' &&
    !labels.includes("'Approved'") &&
    !labels.includes("'Rejected'") &&
    !labels.includes("'Sent'"),
);
cek(
  'labels.ts: labelStatusOrder Diproses/Selesai (bukan "In progress"/"Completed")',
  labelStatusOrder('Diproses') === 'Diproses' &&
    labelStatusOrder('Selesai') === 'Selesai' &&
    !labels.includes("'In progress'"),
);
cek(
  'labels.ts: labelStatusPermintaan Baru/Diproses/Ditolak',
  labelStatusPermintaan('Baru') === 'Baru' &&
    labelStatusPermintaan('Ditolak') === 'Ditolak',
);
cek(
  'labels.ts: labelStatusTask Berjalan/Selesai/Ditutup',
  labelStatusTask('Berjalan') === 'Berjalan' &&
    labelStatusTask('Selesai') === 'Selesai' &&
    !labels.includes("'Not started'"),
);
cek(
  'labels.ts: labelStatusTiket Terbuka/Dijawab/Ditutup',
  labelStatusTiket('Terbuka') === 'Terbuka' &&
    labelStatusTiket('Dijawab') === 'Dijawab' &&
    !labels.includes("'Open'") &&
    !labels.includes("'Closed'"),
);
cek(
  'labels.ts: labelTahapPipeline Prospek Baru/Diterima/Ditolak (filter V-C1)',
  labelTahapPipeline('Prospek Baru') === 'Prospek Baru' &&
    labelTahapPipeline('Diterima') === 'Diterima' &&
    labelTahapPipeline('Ditolak') === 'Ditolak' &&
    !labels.includes("'New Prospect'") &&
    !labels.includes("'Accepted'"),
);
cek(
  'labels.ts: labelTahapPengajuan Masuk/Ditelaah/Dikonversi',
  labelTahapPengajuan('Masuk') === 'Masuk' &&
    labelTahapPengajuan('Ditelaah') === 'Ditelaah' &&
    labelTahapPengajuan('Dikonversi') === 'Dikonversi' &&
    !labels.includes("'Received'") &&
    !labels.includes("'Under review'"),
);
cek(
  'labels.ts: labelJenisKlien Pemerintah/Swasta (bukan "Government")',
  labelJenisKlien('Pemerintah') === 'Pemerintah' &&
    labelJenisKlien('Swasta') === 'Swasta' &&
    !labels.includes("'Government'"),
);
cek(
  'labels.ts: labelJenisDokumen Kwitansi/Bukti Siaran',
  labelJenisDokumen('Kwitansi') === 'Kwitansi' &&
    labelJenisDokumen('Bukti Siaran') === 'Bukti Siaran',
);
cek(
  'labels.ts: labelJenisPnBP Fungsional/Umum (bukan "Functional"/"General")',
  labelJenisPnBP('Fungsional') === 'Fungsional' &&
    labelJenisPnBP('Umum') === 'Umum' &&
    !labels.includes("'Functional'") &&
    !labels.includes("'General'"),
);
cek(
  'labels.ts: labelKategoriLayanan Sewa Lahan/BMN (bukan "Land / State Asset Lease")',
  labelKategoriLayanan('Sewa Lahan / BMN') === 'Sewa Lahan / BMN' &&
    !labels.includes("'Land / State Asset Lease (BMN)'"),
);
cek(
  'labels.ts: labelTujuanTiket Direktorat (bukan "Directorate of ...")',
  labelTujuanTiket('Direktorat Layanan & Pengembangan Usaha') ===
    'Direktorat Layanan & Pengembangan Usaha' &&
    !labels.includes("'Directorate of Service & Business Development'"),
);
cek(
  'labels.ts: labelJabatan Staf Layanan & Pengembangan Usaha',
  labelJabatan('Staf Layanan & Pengembangan Usaha') ===
    'Staf Layanan & Pengembangan Usaha' &&
    !labels.includes("'Service & Business Development Staff'"),
);
cek(
  'labels.ts: labelKategoriTiket Sewa/BMN, labelKategoriKB Regulasi',
  labelKategoriTiket('Sewa / BMN') === 'Sewa / BMN' &&
    labelKategoriKB('Regulasi') === 'Regulasi',
);
cek(
  'labels.ts: labelSumberProspek Kunjungan, labelMetodePembayaran Tunai',
  labelSumberProspek('Kunjungan') === 'Kunjungan' &&
    labelMetodePembayaran('Tunai') === 'Tunai',
);
cek(
  'labels.ts: labelUraianKodeAkun PNBP Umum, labelUmurPiutang 1–30 hari',
  labelUraianKodeAkun('PNBP Umum') === 'PNBP Umum' &&
    labelUmurPiutang('1–30 hari') === '1–30 hari' &&
    !labels.includes("'General PNBP'"),
);
cek(
  'labels.ts: labelAksiAudit + labelEntitasAudit Indonesia',
  labelAksiAudit('Klien dicatat') === 'Klien dicatat' &&
    labelAksiAudit('Tiket Bantuan dibuat') === 'Tiket Bantuan dibuat' &&
    labelEntitasAudit('Klien') === 'Klien' &&
    labelEntitasAudit('Kontrak') === 'Kontrak' &&
    !labels.includes("'Client recorded'") &&
    !labels.includes("'Support ticket created'"),
);
cek(
  'labels.ts: fallback nilai tak dikenal dikembalikan apa adanya',
  labelStatusKontrak('TidakDikenal') === 'TidakDikenal' &&
    labelStatusTagihan('TidakDikenal') === 'TidakDikenal',
);

// ---------- #2: helper baru labelStatusPembayaranKontrak ----------
cek(
  'labels.ts: labelStatusPembayaranKontrak ada (5 pemetaan 23/11)',
  labels.includes('export function labelStatusPembayaranKontrak') &&
    labels.includes("Paid: 'Lunas'") &&
    labels.includes("Unpaid: 'Belum Bayar'") &&
    labels.includes("'Partially-Paid': 'Dibayar Sebagian'") &&
    labels.includes("'Insufficient Payment': 'Kurang Bayar'") &&
    labels.includes("Overdue: 'Terlambat Bayar'"),
);
cek(
  'labelStatusPembayaranKontrak: Paid→Lunas, Unpaid→Belum Bayar',
  labelStatusPembayaranKontrak('Paid') === 'Lunas' &&
    labelStatusPembayaranKontrak('Unpaid') === 'Belum Bayar',
);
cek(
  'labelStatusPembayaranKontrak: Partially-Paid→Dibayar Sebagian, Insufficient→Kurang Bayar, Overdue→Terlambat Bayar',
  labelStatusPembayaranKontrak('Partially-Paid') === 'Dibayar Sebagian' &&
    labelStatusPembayaranKontrak('Insufficient Payment') === 'Kurang Bayar' &&
    labelStatusPembayaranKontrak('Overdue') === 'Terlambat Bayar',
);
cek(
  'kontrakTampilan.ts: enum StatusPembayaranKontrak TIDAK diubah (tetap Inggris)',
  kontrakTampilan.includes("export type StatusPembayaranKontrak") &&
    kontrakTampilan.includes("| 'Unpaid'") &&
    kontrakTampilan.includes("| 'Paid'") &&
    kontrakTampilan.includes("| 'Partially-Paid'") &&
    kontrakTampilan.includes("| 'Insufficient Payment'") &&
    kontrakTampilan.includes("| 'Overdue'"),
);
cek(
  'kontrakTampilan.ts: kelas pill tetap berkunci enum Inggris',
  kontrakTampilan.includes("Paid: 'bg-[#2573E2] text-white'"),
);
cek(
  'kontrakTampilan.ts: komentar penghapusan helper 17/11 diperbarui (23/11 mencabut)',
  kontrakTampilan.includes('Keputusan pengguna 23/11/2026') &&
    kontrakTampilan.includes('MENCABUT itu') &&
    !kontrakTampilan.includes('kolom Status Pembayaran\n// kembali ke English'),
);

// ---------- #2: pill Deals + filter + PortalKlien ----------
cek(
  'Deals.tsx: pill memakai labelStatusPembayaranKontrak (bukan enum mentah)',
  deals.includes('{labelStatusPembayaranKontrak(statusBayar)}') &&
    !deals.includes('{statusBayar}') &&
    deals.includes('labelStatusPembayaranKontrak,'),
);
cek(
  'Deals.tsx: filter Status Pembayaran berbahasa Indonesia (keputusan 23/11)',
  deals.includes('>Dibayar Sebagian</option>') &&
    deals.includes('>Kurang Bayar</option>') &&
    deals.includes('>Terlambat Bayar</option>') &&
    !deals.includes('>Pembayaran tidak cukup</option>') &&
    !deals.includes('>Lewat jatuh tempo</option>') &&
    !deals.includes('>Dibayar sebagian</option>'),
);
cek(
  'Deals.tsx: nilai option filter TIDAK diubah (tetap enum Inggris)',
  deals.includes('value="Paid"') &&
    deals.includes('value="Unpaid"') &&
    deals.includes('value="Partially-Paid"') &&
    deals.includes('value="Insufficient Payment"') &&
    deals.includes('value="Overdue"'),
);
cek(
  'PortalKlien.tsx: badge kontrak memakai labelStatusPembayaranKontrak',
  portal.includes('labelStatusPembayaranKontrak(') &&
    portal.includes('labelStatusPembayaranKontrak,') &&
    !portal.includes('status={statusPembayaranKontrak('),
);

// ---------- #1(b) tab + judul Reporting ----------
cek(
  'Reporting.tsx: 3 tab Indonesia (PNBP Bulanan / Piutang & Penyetoran / Kantor Pusat)',
  reporting.includes("{ id: 'bulanan', label: 'PNBP Bulanan' }") &&
    reporting.includes("{ id: 'piutang', label: 'Piutang & Penyetoran' }") &&
    reporting.includes("{ id: 'kantor-pusat', label: 'Kantor Pusat' }") &&
    !reporting.includes("label: 'Monthly PNBP'") &&
    !reporting.includes("label: 'Receivables & Deposits'") &&
    !reporting.includes("label: 'Head Office'"),
);
cek(
  'Reporting.tsx: judul laporan Indonesia (Laporan PNBP Bulanan / Piutang & Penyetoran / Kantor Pusat)',
  reporting.includes("'Laporan PNBP Bulanan'") &&
    reporting.includes("'Laporan Piutang & Penyetoran'") &&
    reporting.includes("'Laporan Kantor Pusat'") &&
    !reporting.includes("'Monthly PNBP Report'") &&
    !reporting.includes("'Receivables & Deposits Report'") &&
    !reporting.includes("'Head Office Report'"),
);
cek(
  'Reporting.tsx: kalimat penjelas judul Indonesia + "Total Kontrol"',
  reporting.includes('Laporan ini disusun otomatis') &&
    reporting.includes('tidak ada pengisian manual') &&
    reporting.includes('<JudulBagian>Total Kontrol — {judulLaporan}</JudulBagian>') &&
    !reporting.includes('The report is compiled automatically') &&
    !reporting.includes('Control Totals — {judulLaporan}'),
);
cek(
  'Reporting.tsx: nama file CSV TIDAK diubah (T4 masih terbuka)',
  reporting.includes("bulanan: 'monthly-pnbp'") &&
    reporting.includes("piutang: 'receivables-deposits'") &&
    reporting.includes("'kantor-pusat': 'head-office'"),
);

// ---------- #1(c) Home, #1(d) tab FAQ ----------
cek(
  'Home.tsx: kalimat kosong Indonesia',
  home.includes('Halaman ini sengaja dikosongkan untuk saat ini.') &&
    !home.includes('This page is intentionally empty for now.'),
);
cek(
  "Service.tsx: tab FAQ → 'Pertanyaan Umum' (id 'faq' tetap)",
  service.includes("{ id: 'faq', label: 'Pertanyaan Umum' }") &&
    !service.includes("{ id: 'faq', label: 'FAQ' }"),
);

// ---------- #1(e) label + deskripsi 4 modul tersembunyi ----------
cek(
  "App.tsx: label modul tersembunyi Indonesia (Penjualan / Sewa / BMN / Kerja Sama / Pengajuan)",
  app.includes("label: 'Penjualan',") &&
    app.includes("label: 'Sewa / BMN',") &&
    app.includes("label: 'Kerja Sama',") &&
    app.includes("label: 'Pengajuan',") &&
    !app.includes("label: 'Sales',") &&
    !app.includes("label: 'Lease / State Assets (BMN)',") &&
    !app.includes("label: 'Deals',") &&
    !app.includes("label: 'Submission',"),
);
cek(
  'App.tsx: deskripsi 4 modul tersembunyi Indonesia',
  app.includes("description: 'Alur penjualan, penawaran.'") &&
    app.includes('Satu daftar sewa (Detail Kerja Sama → PNBP Umum)') &&
    app.includes(
      'Klien, Detail Kerja Sama (PNBP Fungsional, PNBP Umum, Dukungan Layanan, Nota Kesepahaman, Media Partner), Kontrak, Dokumen.',
    ) &&
    app.includes(
      'Pengajuan baru (kerja sama baru / sewa baru): Masuk → Ditelaah → Menunggu Dokumen → Disetujui/Ditolak → Dikonversi menjadi kontrak.',
    ) &&
    !app.includes("description: 'Pipeline, Quotation.'") &&
    !app.includes('One lease list (Partnership Details → General PNBP)') &&
    !app.includes('Clients, Partnership Details (Functional PNBP') &&
    !app.includes('New Submissions (new partnership / new lease)'),
);
cek(
  "App.tsx: id modul TIDAK diubah (sales/sewa/deals/pengajuan)",
  (app.match(/id: 'sales',/g) ?? []).length === 1 &&
    (app.match(/id: 'sewa',/g) ?? []).length === 1 &&
    (app.match(/id: 'deals',/g) ?? []).length === 1 &&
    (app.match(/id: 'pengajuan',/g) ?? []).length === 1,
);

// ---------- pesan knock-on: nilai helper di dalam kalimat Inggris ----------
cek(
  'App.tsx: pesan ubahTahapProspect Indonesia (6 pesan, 1 fungsi)',
  app.includes('Catatan perubahan tahap wajib diisi.') &&
    app.includes('Tahap "${tahap}" tidak dikenal.') &&
    app.includes('Prospek sudah berada di tahap itu.') &&
    app.includes('sudah final dan tidak bisa dipindah.') &&
    app.includes('Tahap Order tercapai otomatis saat order dibuat') &&
    app.includes('Tahap Diterima hanya bisa dicapai dengan mengonversi order menjadi kontrak.') &&
    !app.includes('A stage-change note is required.') &&
    !app.includes('Stage "${tahap}" is not recognised.') &&
    !app.includes('The prospect is already at that stage.') &&
    !app.includes('A prospect at the ') &&
    !app.includes('The Order stage is reached automatically') &&
    !app.includes('The Accepted stage can only be reached'),
);
cek(
  'App.tsx: pesan kategori layanan + status order Indonesia',
  app.includes('Kategori layanan "') &&
    app.includes('" tidak dikenal.') &&
    app.includes('Status order tidak bisa diubah dari ') &&
    !app.includes('Service category "') &&
    !app.includes('Order status cannot be changed from'),
);
cek(
  'notifikasi.ts: detail pengajuan Indonesia (Tahap/Masuk)',
  notifikasi.includes('Tahap: ${labelTahapPengajuan(p.tahap)} · Masuk ') &&
    !notifikasi.includes('Stage: ${labelTahapPengajuan(p.tahap)}'),
);

// ---------- #70: sel cluster dokumen memakai helper ----------
cek(
  '#70 Deals.tsx: sel cluster dokumen memakai labelStatusDokumen',
  deals.includes(
    "{labelStatusDokumen(item.ada ? 'Ada' : 'Belum Ada')}",
  ) &&
    !deals.includes("<Td>{item.ada ? 'Ada' : 'Belum Ada'}</Td>"),
);
cek(
  '#70 Deals.tsx: Tab Dokumen tetap memakai labelStatusDokumen (badge + tombol)',
  deals.includes('<StatusBadge status={labelStatusDokumen(status)} />') &&
    deals.includes('{labelStatusDokumen(s)}'),
);

// ---------- #69: Detail Kontrak memakai helper tabel ----------
cek(
  '#69 Deals.tsx: Detail Kontrak memakai jatuhTempoPembayaranKontrak (bukan tagihan pertama)',
  !deals.includes(
    'const jatuhTempo = tagihanKontrak[0]?.tanggalJatuhTempo;',
  ) &&
    deals.includes('const jatuhTempo = jatuhTempoPembayaranKontrak(') &&
    deals.includes('Batas waktu bayar — helper yang SAMA dengan kolom tabel'),
);
cek(
  '#69 Deals.tsx: label detail "Batas waktu bayar" (sama dengan header tabel)',
  deals.includes('<dt className="text-[#0d2569]/60">Batas waktu bayar</dt>') &&
    deals.includes('<Th>Batas waktu bayar</Th>') &&
    !deals.includes(
      '<dt className="text-[#0d2569]/60">Tanggal jatuh tempo</dt>',
    ),
);
cek(
  '#69 perilaku: helper = tanggal tagihan pertama di data seed (42 kontrak, 1 tagihan tiap kontrak)',
  (() => {
    const hariIni = '2026-11-16';
    let diperiksa = 0;
    for (const k of DATA_NYATA.kontrak) {
      const tagihanKontrak = DATA_NYATA.tagihan.filter(
        (t) => t.kontrakId === k.id,
      );
      if (tagihanKontrak.length === 0) continue;
      const hasil = jatuhTempoPembayaranKontrak(
        k,
        DATA_NYATA.tagihan,
        DATA_NYATA.pembayaran,
        hariIni,
      );
      if (hasil !== tagihanKontrak[0].tanggalJatuhTempo) return false;
      diperiksa += 1;
    }
    return diperiksa === 42;
  })(),
  `${DATA_NYATA.kontrak.length} kontrak`,
);

// ---------- StatusBadge: ikon tidak berubah ----------
cek(
  'ui.tsx: StatusBadge memakai substring Indonesia (jatuh tempo/ada/dikirim/dijawab)',
  ui.includes("s.includes('jatuh tempo')") &&
    ui.includes("s.includes('ada')") &&
    ui.includes("s.includes('dikirim')") &&
    ui.includes("s.includes('dijawab')"),
);
cek(
  'ui.tsx: cek Inggris dipertahankan (nilai mentah Inggris, mis. Verified)',
  ui.includes("t.includes('verified')") &&
    ui.includes("t.includes('due')") &&
    ui.includes("t.includes('available')"),
);
cek(
  'ui.tsx: labelStatusTampilan dipakai StatusBadge; komentar menyebut Indonesia',
  ui.includes('const t = labelStatusTampilan(status).toLowerCase();') &&
    ui.includes('Label Indonesia untuk nilai status tersimpan'),
);

if (gagal > 0) {
  console.error(`\n${gagal} asersi GAGAL.`);
  process.exitCode = 1;
} else {
  console.log('\nSemua asersi irisan 1 bahasa Indonesia lolos.');
}

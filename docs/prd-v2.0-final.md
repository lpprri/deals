# PRD — Partnership LPP RRI

**Versi 2.0 — FINAL (nama aplikasi diperbarui 14 November 2026)**
**Tanggal:** 14 November 2026
**Pemilik produk:** Bidang Layanan & Pengembangan Usaha, LPP RRI Palembang
**Disusun oleh:** Digi — AI Product Manager
**Status:** Final — menggantikan PRD v1.0 (Draft), Amandemen v1.1, dan Amandemen v1.2

> Nama aplikasi ini adalah **Partnership LPP RRI** (sebelumnya disebut "CRM LPP RRI Palembang" / CRM "Kerja Sama RRI"). Satu sistem untuk kerja sama, piutang, sewa aset, dan laporan PNBP otomatis — dari kontrak sampai laporan kantor pusat, tanpa input ulang.

## Riwayat versi

| Versi | Tanggal | Isi dan keputusan |
|---|---|---|
| 1.0 | 13 Nov 2026 | PRD awal, 21 halaman, Draft. Ruang lingkup Tahap 0–1 dulu; stack Google AI Studio, Firebase, GitHub, Cloudflare Workers. |
| 1.1 | 13 Nov 2026, 17:20 WIB | Amandemen: build Tahap 0–4 diterima apa adanya, PRD disesuaikan ke build. Label tahap diseragamkan "Tahap 0–4". Deploy pindah Cloudflare → Vercel (login Cloudflare gagal di verifikasi bot). |
| 1.2 | 14 Nov 2026 | Amandemen: mind map "Kerja Sama RRI" digabung (8 modul), UI dirombak gaya HubSpot (pola layout saja), palet hanya 3 warna dari logo RRI. Fase A/B/C. Pertanyaan baru Q-08–Q-12. |
| **2.0 Final** | **14 Nov 2026** | **Konsolidasi v1.0 + v1.1 + v1.2 menjadi satu dokumen final, ditambah pelajaran dari percobaan build pertama (13–14 Nov 2026) dan rencana build ulang dari nol. Build pertama (AI Studio + repo `lpprri/Partnership`) dihapus pengguna pada 14 Nov 2026, 10:35 WIB; dokumen ini adalah satu-satunya acuan build baru.** |

Dokumen-dokumen lama (PRD v1.0 PDF, amandemen v1.1, amandemen v1.2, dan semua prompt AI Studio) dinyatakan **tidak berlaku sebagai acuan mandiri** — seluruh isinya yang masih relevan sudah diserap ke dalam dokumen ini. Prompt AI Studio 15:36 WIB (penomoran tahap keliru) dan prompt koreksi 17:19 WIB (menyembunyikan Tahap 2–4) dinyatakan **batal dan tidak boleh dipakai**.

## Daftar isi

1. Ringkasan produk dan masalah yang diselesaikan
2. Pengguna dan peran / hak akses per bidang
3. Tujuan dan kriteria sukses
4. Ruang lingkup: 8 modul, MVP vs fitur lanjutan, Fase A/B/C
5. User stories per peran
6. Model data
7. Fitur utama per modul
8. Antarmuka dan identitas visual
9. Alur kerja utama (end-to-end)
10. Kebutuhan non-fungsional
11. Arsitektur dan stack teknis
12. Rencana build ulang dari nol dan rilis bertahap
13. Pelajaran dari percobaan build pertama (13–14 Nov 2026)
- Lampiran A — Kriteria penerimaan
- Lampiran B — Risiko dan mitigasi
- Lampiran C — Pertanyaan terbuka Q-01–Q-12
- Lampiran D — Lembar persetujuan Final
- Lampiran E — Sumber data

**Cara membaca:** **Harus (MVP)** berarti tanpa fitur ini sistem belum layak dipakai menggantikan spreadsheet. **Seharusnya (lanjutan)** berarti bernilai, tetapi tidak menghalangi pemakaian. Setiap keputusan penting disertai alasan dan alternatif yang ditolak, agar peninjau dapat menilai trade-off-nya.

### Lima keputusan kunci produk ini

1. **Satu sumber sewa.** Sewa lahan/BMN hanya hidup di modul Sewa. Kontrak kerja sama yang memuat sewa menaut ke record sewa yang sama, tidak menyalinnya. Duplikasi adalah sumber selisih yang paling sering terjadi di file sumber.
2. **Keuangan sebagai referensi, bukan salinan.** Data penyetor PNBP milik Keuangan ditampilkan read-only untuk rekonsiliasi. Menyalin data Keuangan ke Partnership LPP RRI ditolak karena menciptakan dua versi kebenaran pembayaran.
3. **Laporan selalu diturunkan, tidak pernah diketik.** Tidak ada form input laporan bulanan, piutang, atau kantor pusat. Jika angka salah, yang diperbaiki adalah data sumbernya, lalu laporan dibuat ulang.
4. **QTY kantor pusat = jumlah Perjanjian Kerja Sama (PKS) dalam 1 bulan**, bukan jumlah siaran. Aturan ini dikunci di logika laporan dan diuji pada kriteria penerimaan.
5. **GitHub adalah satu-satunya sumber kebenaran kode.** Semua perubahan kode lewat pull request. Tidak ada lagi pengembangan yang hanya hidup di satu alat tanpa tersimpan di repo.

---

## 1. Ringkasan produk dan masalah yang diselesaikan

### 1.1 Ringkasan produk

Partnership LPP RRI adalah Web App internal LPP RRI Palembang untuk mengelola seluruh siklus Penerimaan Negara Bukan Pajak (PNBP): klien dan kerja sama, layanan dan tarif, piutang dan penyetoran, denda, kelengkapan dokumen, sewa lahan dan Barang Milik Negara (BMN), pengajuan baru, pemasaran dan penjualan, serta pelaporan. Sistem ini menggantikan enam workbook yang selama ini dikelola terpisah dan saling menyalin data. Pengguna utamanya adalah Bidang Layanan & Pengembangan Usaha sebagai pengelola data utama, Bidang Keuangan sebagai pemilik data acuan penerimaan, dan Bidang Umum sebagai pengelola pemanfaatan aset. Pimpinan dan kantor pusat adalah konsumen laporan, bukan penginput data.

### 1.2 Masalah yang diselesaikan

| Masalah | Dampak saat ini | Jawaban produk |
|---|---|---|
| Data yang sama diinput di beberapa file: kerja sama, laporan bulanan, laporan piutang, laporan pusat | Pekerjaan berulang tiap bulan; angka antarfile mudah berbeda | Input satu kali di modul sumber; semua laporan diturunkan otomatis |
| Data sewa tersebar: daftar sewa, ON GOING, pengajuan, pendapatan diterima di muka / masih harus diterima, Indralaya | Status sewa yang sama dapat tercatat berbeda di dua tempat | Satu record Sewa/BMN dengan status dan riwayat; tampilan per kategori adalah filter, bukan file terpisah |
| Piutang dan jatuh tempo dipantau manual | Keterlambatan dan denda terlambat diketahui | Daftar piutang dengan umur piutang, penanda jatuh tempo, dan perhitungan denda |
| Rekonsiliasi dengan Keuangan dilakukan dengan membandingkan file | Selisih sulit dilacak ke kontrak dan penyetornya | Layar rekonsiliasi yang memasangkan tagihan Partnership dengan penerimaan referensi Keuangan per kode akun |
| Deadline laporan pusat ketat: isi maksimal tanggal 10, kumpul file tanggal 11 bulan berikutnya | Risiko telat karena laporan disusun dari awal tiap bulan | Laporan pusat dapat dibuat kapan pun dari data berjalan; pengingat deadline di dashboard |
| Kelengkapan dokumen kerja sama tidak terlihat dalam satu pandangan | Dokumen kurang baru diketahui saat dibutuhkan | Checklist dokumen per kontrak dengan status lengkap / kurang |
| Prospek, penawaran, dan pipeline penjualan tidak tercatat sistematis | Peluang kerja sama baru sulit dilacak dari prospek sampai PKS | Modul Sales: Prospect, Quotation, Pipeline, Order, Meeting (Fase B) |

### 1.3 Yang bukan tujuan produk

Sistem ini bukan sistem akuntansi negara, bukan pengganti aplikasi keuangan resmi, dan bukan portal publik untuk klien pada rilis pertama (portal klien adalah Fase C dan bergantung pada jawaban Q-10). Sistem juga tidak mengubah kewenangan penetapan tarif, denda, atau persetujuan kerja sama — sistem mencatat dan menelusuri keputusan tersebut.

---

## 2. Pengguna dan peran / hak akses per bidang

Prinsipnya adalah kepemilikan data yang tunggal: setiap jenis data punya satu bidang pemilik yang boleh mengubahnya. Bidang lain melihat sesuai kebutuhan tugasnya.

### 2.1 Peran

| Peran | Siapa | Tanggung jawab utama |
|---|---|---|
| Operator Layanan | Staf Layanan & Pengembangan Usaha | Klien, kontrak, layanan, piutang operasional, dokumen, pengajuan, penyusunan laporan, prospek dan pipeline (Fase B) |
| Verifikator Layanan | Pejabat/penanggung jawab bidang Layanan | Memeriksa dan mengunci data sebelum laporan diterbitkan; menyetujui perubahan data terkunci |
| Keuangan (referensi) | Bidang Keuangan | Menyediakan dan memperbarui data acuan penerimaan PNBP; menandai hasil rekonsiliasi |
| Umum (aset) | Bidang Umum | Data aset/BMN, proses sewa, temuan lapangan, dan kenaikan harga sewa |
| Pimpinan (viewer) | Pimpinan satker | Melihat dashboard dan laporan final; tidak menginput data operasional |
| Admin sistem | Pengelola yang ditunjuk | Akun pengguna, master data/dropdown, dan konfigurasi; tanpa hak mengubah isi transaksi tanpa jejak audit |
| Klien eksternal (Fase C, bila disetujui) | Klien yang diberi akun portal | Melihat status order miliknya sendiri; mengajukan order — detail akses menunggu jawaban Q-10 |

### 2.2 Matriks hak akses ringkas

| Modul | Layanan | Keuangan | Umum | Pimpinan |
|---|---|---|---|---|
| Clients & Contracts (Deals) | Buat / ubah | Lihat | Lihat terbatas* | Lihat |
| Piutang & denda (Revenue) | Buat / ubah | Lihat | Tidak | Lihat ringkasan |
| Data acuan penerimaan | Lihat (read-only) | Buat / ubah | Tidak | Lihat ringkasan |
| Sewa / BMN | Lihat + tautan kontrak | Lihat status bayar | Buat / ubah | Lihat |
| Pengajuan baru | Buat / ubah | Lihat bila terkait bayar | Buat / ubah (aset) | Lihat |
| Sales & Marketing (Fase B) | Buat / ubah | Lihat ringkasan | Tidak | Lihat |
| To-Do List | Buat / ubah (tugas sendiri; disposisi sesuai alur) | — | — | Lihat |
| Laporan | Buat / ekspor | Lihat | Lihat bagian aset | Lihat final |
| Master & pengguna | Lihat master | — | — | — (Admin saja) |
| Audit trail | — | — | — | — (Admin saja) |

\* Umum melihat kontrak hanya sejauh yang terkait dengan aset/sewa yang dikelolanya. Penegakan hak akses dilakukan di aturan keamanan Firebase (server-side), bukan hanya menyembunyikan menu di antarmuka. **Keputusan:** Tidak ada peran "super editor" untuk data transaksi. Bahkan Admin mengubah master dan akun, bukan angka kontrak atau pembayaran.

---

## 3. Tujuan dan kriteria sukses

### 3.1 Tujuan produk

1. Menghilangkan input ulang laporan: laporan bulanan, laporan piutang & penyetoran, dan laporan kantor pusat dihasilkan dari data utama.
2. Menjamin satu versi kebenaran untuk kerja sama dan sewa di tiga bidang.
3. Membuat piutang, jatuh tempo, dan denda terlihat lebih awal, sebelum menjadi temuan.
4. Mempercepat rekonsiliasi dengan data acuan Keuangan per kode akun.
5. Menjaga tenggat kantor pusat: pengisian maksimal tanggal 10 dan pengumpulan file tanggal 11 bulan berikutnya.
6. Memberi Layanan alat kerja penjualan yang tertelusur: dari prospek sampai PKS (Fase B), dan memberi pimpinan gambaran capaian terhadap target (Fase C).

### 3.2 Kriteria sukses terukur

| Indikator | Target | Cara mengukur |
|---|---|---|
| Laporan bulanan & piutang dibuat tanpa input ulang | 100% dari data utama | Uji penerimaan: buat laporan dari data uji, cocokkan totalnya |
| Kesiapan laporan kantor pusat | Tersedia sebelum tgl 10 | Dashboard deadline + tanggal generate laporan |
| Duplikasi record sewa antar kategori | 0 record ganda | Satu ID sewa dipakai di semua tampilan kategori |
| Kontrak aktif dengan checklist dokumen terlihat | 100% | Laporan kelengkapan dokumen di dashboard |
| Piutang melewati jatuh tempo tanpa penanda | 0 | Status piutang diperbarui otomatis berdasarkan tanggal |
| Selisih rekonsiliasi yang belum dijelaskan | Terdaftar 100% | Daftar selisih dengan status tindak lanjut |
| Waktu menyusun laporan bulanan | Jauh lebih singkat dari cara manual | Dibandingkan saat uji pakai dengan pengguna Layanan |
| Prospek sampai PKS tertelusur (Fase B) | 100% prospek punya tahap pipeline | Audit trail konversi prospek → quotation → order → kontrak |

Catatan: Baseline waktu manual dan target PNBP tahunan belum tersedia pada saat PRD ini ditulis, sehingga tidak diisi dengan angka tebakan. Keduanya dicatat sebagai pertanyaan terbuka (Q-02) dan wajib dilengkapi sebelum target dinyatakan final.

### 3.3 Indikator penjaga (guardrail)

Tidak ada laporan yang dapat diekspor dari data yang belum diverifikasi tanpa tanda "DRAFT" yang jelas. Tidak ada penghapusan permanen data transaksi; pembatalan memakai status dan alasan, tercatat di audit trail. Setiap perubahan nilai, tanggal, atau status pada kontrak, pembayaran, dan sewa tercatat siapa dan kapan. Tidak ada fitur baru yang dibangun dari tebakan atas pertanyaan terbuka Q-01–Q-12 — modul yang datanya belum jelas tampil sebagai "segera hadir", bukan fitur palsu.

---
## 4. Ruang lingkup: 8 modul, MVP vs fitur lanjutan, Fase A/B/C

### 4.1 Delapan modul utama (struktur navigasi final)

Struktur ini berasal dari mind map "Kerja Sama RRI" (14 Nov 2026) dan menggantikan navigasi 11 halaman pada build pertama.

1. **Dashboard** — Revenue Analytics (Nasional: nilai & % capaian ke target; Satuan Kerja/Daerah: nilai capaian, % sumbangsi ke capaian nasional, % capaian ke target), Employee Rank (Leaderboard of Year, of The Month), Satker Rank (Leaderboard of Year, of The Month).
2. **Marketing** — Events, Advertisement.
3. **Sales** — Prospect List Database, Sales Analytics, Quotation, Sales Process Pipeline, Order (Order Form), Meeting Schedule.
4. **Deals** — Clients, Partnership Details (PNBP Fungsional, PNBP Umum, Dukungan Layanan, Nota Kesepahaman, Media Partner), Contracts, Documents.
5. **Revenue** — Overview, Revenue Stream (PNBP Fungsional: Jasa Siaran; PNBP Umum), Revenue Type (PNBP, Dukungan Layanan, Dukungan Program Siaran), Invoice, Payments, Billings.
6. **Reporting** — Laporan Satker (Laporan PNBP, Laporan Piutang & Penyetoran, Laporan Dukungan Layanan, Laporan Nota Kesepahaman, Laporan Media Partner).
7. **To-Do List** — Individual Task, Disposisi.
8. **Service** — Client Order Portal, Feedback Survey, Help-Desk (Consultation to Headquarter PIC), Knowledge Base (Regulasi, SOP).

Halaman Admin/Settings tetap ada di luar 8 modul utama: Migrasi & Go-Live, Master & Pengguna, Audit & Asumsi PRD (hanya Admin Sistem).

### 4.2 Pemetaan dari fungsi build pertama

Seluruh fungsi build pertama (Tahap 0–4) dipertahankan dan dipindahkan ke modul baru — **tidak ada data dan tidak ada fitur lama yang dihapus.** Yang berubah hanya navigasi, nama menu, dan tampilan.

| Fungsi lama | Modul baru |
|---|---|
| Dashboard | Dashboard (dirombak isinya: tambah Revenue Analytics + ranking) |
| Klien & Mitra | Deals → Clients |
| Kontrak / PKS | Deals → Contracts |
| Pengajuan Baru | Sales → Pipeline (tahap akhir) + Deals → Contracts (konversi) |
| Tagihan & Piutang | Revenue → Invoice / Payments / Billings |
| Keuangan & Rekonsiliasi | Revenue → Overview |
| Sewa Lahan / BMN | Deals → Partnership Details → PNBP Umum |
| Laporan Otomatis | Reporting → Laporan Satker |
| Migrasi & Go-Live, Master & Pengguna, Audit | Tetap sebagai halaman Admin/Settings |

### 4.3 Fase pembangunan

| Fase | Isi | Gerbang keluar |
|---|---|---|
| **Fase A — Fondasi + restruktur UI** | Repo baru, proyek Firebase dev/prod, Auth + peran, master data, navigasi 8 modul, shell UI gaya HubSpot (Bab 8), pemindahan fungsi lama ke modul baru, perbaikan bug P0/P1 (Bab 13). Modul baru yang belum ada datanya tampil sebagai "segera hadir" + tombol kembali — bukan halaman kosong dan bukan fitur palsu. | Login per peran berfungsi; seluruh fungsi lama dapat dipakai dari modul barunya; total kontrol laporan cocok dengan data uji. |
| **Fase B — Sales + Marketing + To-Do** | Prospect List, Quotation, Pipeline, Order Form, Meeting Schedule, Sales Analytics, Events, Advertisement, Individual Task, Disposisi. | Prospek dapat dilacak dari tahap awal sampai menjadi kontrak; disposisi tercatat end-to-end. |
| **Fase C — Ranking + Service** | Revenue Nasional & Satker Rank, Employee Rank, Client Order Portal, Feedback Survey, Help-Desk ke PIC kantor pusat, Knowledge Base. **Fase ini tergantung jawaban Q-08–Q-12 — jangan dibangun sebelum datanya jelas.** | Ranking memakai sumber data yang disepakati; portal klien memakai aturan akses yang disetujui. |

### 4.4 MVP vs fitur lanjutan

**MVP (Fase A):** Login dan hak akses per peran; master data & dropdown terpusat; Klien, kontrak/PKS, layanan & tarif; Tagihan, piutang, penyetoran, dan denda; Checklist dokumen per kontrak; Sewa/BMN satu sumber + pengajuan baru; Data acuan Keuangan read-only + layar rekonsiliasi dasar; Dashboard operasional dan deadline; Laporan otomatis: bulanan, piutang, kantor pusat + ekspor; Audit trail dan migrasi data awal dari 6 workbook.

**Fitur lanjutan (Fase B/C):** Modul Sales, Marketing, To-Do List, Service, dan ranking sesuai §4.3. Notifikasi otomatis (email/WhatsApp) untuk jatuh tempo; tanda tangan/persetujuan elektronik berjenjang; impor otomatis berkala dari file Keuangan; analitik tren PNBP, peramalan, dan target vs realisasi lanjutan; peta/lokasi aset dan galeri foto temuan lapangan.

**Di luar ruang lingkup:** Pembukuan akuntansi dan pelaporan keuangan negara di luar format yang diminta pada data sumber. Pembayaran online / payment gateway untuk klien pada MVP. Penggantian aplikasi resmi pemerintah yang sudah diwajibkan; Partnership LPP RRI menautkan dan merekonsiliasi, bukan menggantikannya. Aplikasi mobile native (MVP cukup responsif di browser).

**Asumsi ruang lingkup:** Pengguna bekerja dari browser desktop/laptop sebagai perangkat utama; tampilan tetap dapat dipakai di layar kecil. Satu satker: LPP RRI Palembang, termasuk daftar sewa Indralaya sebagai bagian dari data yang sama. Periode data awal mencakup kerja sama 2026 dan sewa 2022–2026 sesuai data sumber.

---

## 5. User stories per peran

Format: Sebagai [peran], saya ingin [kemampuan], agar [hasil]. ID story dipakai sebagai rujukan silang pada fitur (Bab 7), kriteria penerimaan (Lampiran A), dan daftar uji.

### 5.1 Layanan & Pengembangan Usaha

| ID | User story | Prioritas |
|---|---|---|
| US-L1 | Sebagai Operator Layanan, saya ingin mencatat klien dan PKS satu kali agar seluruh laporan mengambil data yang sama. | Harus |
| US-L2 | Sebagai Operator Layanan, saya ingin melihat piutang yang akan dan sudah jatuh tempo agar penagihan dilakukan sebelum terlambat. | Harus |
| US-L3 | Sebagai Operator Layanan, saya ingin checklist dokumen per kontrak agar kekurangan dokumen terlihat sebelum kontrak berjalan. | Harus |
| US-L4 | Sebagai Operator Layanan, saya ingin membuat laporan bulanan dan laporan piutang dengan memilih periode saja agar tidak menyusun ulang tabel setiap bulan. | Harus |
| US-L5 | Sebagai Verifikator Layanan, saya ingin mengunci periode laporan agar angka yang sudah dilaporkan tidak berubah diam-diam. | Harus |
| US-L6 | Sebagai Operator Layanan, saya ingin mencatat pengajuan kerja sama baru dan status tindak lanjutnya agar tidak ada pengajuan yang hilang. | Harus |
| US-L7 | Sebagai Operator Layanan, saya ingin denda keterlambatan terhitung dari aturan yang berlaku agar penagihan konsisten. | Harus |

### 5.2 Keuangan

| ID | User story | Prioritas |
|---|---|---|
| US-K1 | Sebagai staf Keuangan, saya ingin data penerimaan per kode akun tampil sebagai acuan agar bidang lain memeriksa status bayar tanpa meminta file terpisah. | Harus |
| US-K2 | Sebagai staf Keuangan, saya ingin memasangkan penerimaan dengan tagihan kontrak agar selisih rekonsiliasi terlihat per kontrak, bukan hanya per total. | Harus |
| US-K3 | Sebagai staf Keuangan, saya ingin bidang lain tidak dapat mengubah data acuan penerimaan agar tanggung jawab data keuangan tetap jelas. | Harus |

### 5.3 Umum

| ID | User story | Prioritas |
|---|---|---|
| US-U1 | Sebagai staf Umum, saya ingin satu daftar sewa lahan/BMN dengan status ON GOING dan riwayatnya agar tidak memelihara daftar duplikat per kategori. | Harus |
| US-U2 | Sebagai staf Umum, saya ingin mencatat pengajuan sewa baru, temuan lapangan, dan kenaikan harga pada record yang sama agar riwayat aset utuh. | Harus |
| US-U3 | Sebagai staf Umum, saya ingin melihat pendapatan diterima di muka dan pendapatan masih harus diterima per sewa agar posisi aset dan piutangnya jelas. | Harus |

### 5.4 Pimpinan dan Admin

| ID | User story | Prioritas |
|---|---|---|
| US-P1 | Sebagai Pimpinan, saya ingin dashboard ringkas berisi realisasi, piutang, dan kesiapan laporan agar pengawasan cukup dari satu halaman. | Harus |
| US-P2 | Sebagai Pimpinan, saya ingin laporan final yang sudah diverifikasi agar yang saya terima adalah versi terkunci. | Harus |
| US-A1 | Sebagai Admin, saya ingin mengelola akun, peran, dan master dropdown agar perubahan istilah dan pilihan tidak memerlukan perubahan kode. | Harus |
| US-A2 | Sebagai Admin, saya ingin melihat audit trail agar setiap perubahan data sensitif dapat ditelusuri ke pengguna dan waktunya. | Harus |

### 5.5 Sales, Marketing, To-Do, Service (Fase B/C)

| ID | User story | Prioritas |
|---|---|---|
| US-S1 | Sebagai Operator Layanan, saya ingin mencatat prospek dan tahap pipeline-nya agar peluang kerja sama tidak hilang sebelum menjadi PKS. | Harus (Fase B) |
| US-S2 | Sebagai Operator Layanan, saya ingin membuat quotation dari prospek dan mengubahnya menjadi order/kontrak agar penawaran tertelusur. | Harus (Fase B) |
| US-S3 | Sebagai Operator Layanan, saya ingin menjadwalkan meeting dengan prospek/klien dan melihatnya di kalender agar tindak lanjut tidak terlewat. | Harus (Fase B) |
| US-M1 | Sebagai Operator Layanan, saya ingin mencatat event dan advertisement agar kegiatan pemasaran terdokumentasi. | Seharusnya (Fase B) |
| US-T1 | Sebagai staf, saya ingin mencatat tugas pribadi dan menerima disposisi agar penugasan tercatat dan dapat dilacak penyelesaiannya. | Harus (Fase B) |
| US-V1 | Sebagai klien (Fase C), saya ingin melihat status order saya sendiri agar tidak perlu menanyakan lewat telepon. | Tergantung Q-10 |
| US-V2 | Sebagai Operator Layanan, saya ingin mencatat konsultasi ke PIC kantor pusat sebagai tiket agar jawaban dan tindak lanjutnya tersimpan. | Tergantung Q-12 |
| US-V3 | Sebagai staf, saya ingin mencari regulasi dan SOP di Knowledge Base agar acuan kerja selalu merujuk dokumen terbaru. | Seharusnya (Fase C) |

---

## 6. Model data

Model data mengikuti prinsip satu entitas, satu tempat. Field di bawah adalah kebutuhan produk (nama logis), bukan skema fisik final; penamaan koleksi Firestore diselaraskan pada tahap desain teknis tanpa mengubah makna dan relasinya.

### 6.1 Peta relasi inti

| Dari | Relasi | Ke | Aturan |
|---|---|---|---|
| Klien | 1 — banyak | Kontrak / PKS | Klien yang punya kontrak tidak dapat dihapus, hanya dinonaktifkan |
| Kontrak | 1 — banyak | Layanan kontrak, Tagihan, Dokumen | Nilai kontrak = jumlah layanan kontrak |
| Tagihan | 1 — banyak | Pembayaran / Penyetoran | Status tagihan diturunkan dari pembayaran, tidak diinput bebas |
| Tagihan | 1 — banyak | Denda | Denda lahir dari keterlambatan tagihan |
| Sewa/BMN | 0/1 — 1 | Kontrak | Kontrak sewa menaut record sewa yang sama (tanpa duplikasi) |
| Pengajuan | menjadi | Klien / Kontrak / Sewa | Konversi pengajuan menaut record hasil, pengajuan asal tetap tersimpan |
| Prospek | menjadi | Quotation → Order → Kontrak | Setiap tahap konversi tercatat; prospek asal tetap tersimpan (Fase B) |
| Laporan | diturunkan dari | Kontrak, Tagihan, Pembayaran, Sewa | Laporan menyimpan snapshot periode + parameter, bukan input manual |

### 6.2 Klien

**Field inti:** ID, nama instansi/perusahaan, jenis klien (master), alamat, kontak utama (nama, jabatan, telepon, email), NPWP bila tersedia, status aktif, catatan, dibuat/diubah oleh dan waktu. **Aturan:** peringatan duplikat berdasarkan nama yang dinormalisasi + kontak; riwayat kontrak klien tampil di halaman detail klien.

### 6.3 Kontrak / Kerja Sama (PKS)

**Field inti:** ID, nomor PKS, klien, jenis PNBP (Fungsional / Umum), kategori layanan, programa, tanggal mulai dan selesai, nilai kontrak, termin/jadwal tagihan, status (Draft, Aktif, Selesai, Dibatalkan, Berakhir), tautan sewa bila relevan, penanggung jawab, catatan. **Aturan:** nomor PKS unik; kontrak terkunci setelah periode laporannya dikunci (perubahan lewat mekanisme koreksi beraudit).

### 6.4 Layanan & Tarif

**Field inti:** ID layanan, nama layanan (master), jenis PNBP, kode akun default, satuan, tarif berlaku, tanggal berlaku tarif, status aktif. Pada kontrak, layanan disalin sebagai *snapshot* (nama, tarif, jumlah, subtotal) agar perubahan tarif di masa depan tidak mengubah kontrak lama. **Programa** dicatat pada layanan kontrak bila laporan per jasa/programa membutuhkannya (REALISASI/JASA).

### 6.5 Pembayaran / Piutang

**Tagihan (piutang):** Kontrak, uraian, nilai tagihan, tanggal terbit, tanggal jatuh tempo, kode akun, status turunan: Belum Jatuh Tempo, Jatuh Tempo, Lewat Jatuh Tempo, Lunas Sebagian, Lunas. Sisa piutang = nilai tagihan dikurangi pembayaran terverifikasi. **Pembayaran / Penyetoran:** Tagihan, tanggal bayar/setor, jumlah, metode, bukti setor (tautan dokumen), penyetor, status verifikasi, pasangan rekonsiliasi ke data acuan Keuangan. **Data acuan Keuangan:** Periode, kode akun, uraian, jumlah penerimaan, penyetor. Read-only untuk Layanan dan Umum. Perubahan hanya oleh Keuangan, dengan audit.

### 6.6 Denda

**Field inti:** ID, tagihan asal, dasar keterlambatan (hari lewat, aturan tarif denda yang dipakai sebagai snapshot), jumlah denda, status (Terhitung, Ditagihkan, Dibayar, Dihapus dengan persetujuan + alasan), kode akun denda. **Aturan:** rumus dan tarif denda resmi harus dikonfirmasi sebelum fitur denda diaktifkan (Q-03); sebelum itu denda dicatat manual dengan dasar yang wajib diisi, bukan dihitung dari rumus tebakan.

### 6.7 Kode akun acuan (dari data Keuangan)

| Kode akun | Uraian |
|---|---|
| 425131 | PNBP Umum |
| 425531 | PNBP Fungsional |
| 425839 | Denda Keterlambatan |
| 425151 | Sarana Prasarana Sesuai Tusi |
| 425122 | Penjualan Peralatan / Mesin |
| — | Sewa Rumah Dinas & Pemindahtanganan BMN (sesuai rincian sumber) |

**Aturan yang dikunci (pelajaran dari build pertama):** satu kode akun hanya punya satu klasifikasi. Master Kode Akun adalah sumber kebenaran: **425131 = Umum** — layanan "Ad-Lib / Jingle" dan kontrak PKS-004 pada build pertama salah diklasifikasikan sebagai Fungsional. Kode akun disimpan sebagai master data agar dapat ditambah/diubah Admin tanpa mengubah kode program. Pemetaan kode akun ke jenis PNBP dan jenis laporan diverifikasi bersama Keuangan pada tahap migrasi.

### 6.8 Dokumen

**Field inti:** ID, pemilik record (kontrak/sewa/pengajuan/pembayaran), jenis dokumen (master checklist), nama file, tautan file di Firebase Storage, tanggal unggah, diunggah oleh, status verifikasi, catatan kekurangan. File disimpan di Storage; database hanya menyimpan metadata dan tautan, bukan isi file.

### 6.9 Sewa / BMN

**Field inti:** ID sewa, aset/lahan (nama, lokasi termasuk Indralaya, luas/deskripsi), penyewa (tautan klien bila ada), nomor perjanjian, tanggal mulai/selesai, nilai sewa dan skema kenaikan harga, status (ON GOING, Berakhir, Pengajuan, Bermasalah/Temuan), pendapatan diterima di muka, pendapatan masih harus diterima, temuan lapangan (tanggal, uraian, tindak lanjut), tautan kontrak dan tagihan. **Aturan:** kategori pada file lama (ON GOING, diterima di muka, masih harus diterima, Indralaya) menjadi filter/status pada satu daftar, bukan entitas terpisah.

### 6.10 Pengajuan

**Field inti:** ID, jenis pengajuan (kerja sama baru / sewa baru), pemohon, tanggal masuk, kebutuhan/layanan atau aset yang diajukan, tahap (Masuk, Ditelaah, Menunggu Dokumen, Disetujui, Ditolak, Dikonversi), penanggung jawab, catatan, record hasil konversi. Pengajuan yang ditolak tetap tersimpan dengan alasan.

### 6.11 Laporan (snapshot)

**Field inti:** ID, jenis laporan (Bulanan, Piutang & Penyetoran, Kantor Pusat Bulanan, Triwulan, REALISASI/TRIWULAN, REALISASI/JASA, Dukungan Layanan, Nota Kesepahaman, Media Partner), periode, parameter filter, tanggal dibuat, dibuat oleh, status (Draft, Diverifikasi, Terkunci), file ekspor, hash/total kontrol. Snapshot memastikan laporan yang sudah dikirim tetap dapat ditampilkan persis seperti saat dibuat, meski data sumber kemudian dikoreksi.

### 6.12 Entitas baru Fase B/C

**Prospect:** ID, nama instansi, kontak, sumber prospek, layanan yang diminati, tahap pipeline, penanggung jawab, catatan, tanggal tindak lanjut. **Quotation:** ID, prospek, layanan + tarif snapshot, nilai penawaran, masa berlaku, status (Draft, Dikirim, Disetujui, Ditolak). **Order:** ID, quotation/kontrak asal, formulir order, status pemenuhan. **Event / Advertisement:** ID, nama, tanggal, penyelenggara, biaya, hasil/catatan. **Task (To-Do):** ID, pemilik, judul, tenggat, status, disposisi asal (pemberi disposisi, instruksi, tenggat). **Ticket (Help-Desk):** ID, pengaju, PIC kantor pusat, pertanyaan, jawaban, status. **Feedback:** ID, klien, order terkait, penilaian, komentar. **Knowledge:** ID, judul, jenis (Regulasi/SOP), file/tautan, tanggal berlaku.

### 6.13 Master data

Jenis PNBP, kategori layanan, programa, jenis klien, jenis dokumen, status, kode akun, satuan, tahap pipeline, dan daftar dropdown lain dari sheet Master pada file sumber. Master hanya diubah Admin; nilai master yang sudah dipakai transaksi tidak dapat dihapus, hanya dinonaktifkan.

---
## 7. Fitur utama per modul

### 7.1 Dashboard

**Ringkasan periode:** jumlah PKS aktif, nilai kontrak, realisasi penerimaan, total dan umur piutang, denda tercatat — difilter per bulan/triwulan/tahun dan jenis PNBP. **Revenue Analytics:** nilai & % capaian ke target (nasional dan satker), % sumbangsi satker ke capaian nasional (Fase C, tergantung Q-08). **Ranking:** Employee Rank dan Satker Rank, Leaderboard of Year dan of The Month (Fase C, tergantung Q-09). **Perlu perhatian:** tagihan lewat jatuh tempo, dokumen belum lengkap, pengajuan menunggu tindak lanjut, sewa akan berakhir, dan selisih rekonsiliasi terbuka. Setiap item menaut langsung ke record-nya. **Kalender deadline laporan:** hitung mundur ke tanggal 10 (batas pengisian) dan tanggal 11 (pengumpulan file) bulan berikutnya, dengan status kesiapan laporan periode berjalan. Dashboard Pimpinan adalah tampilan yang sama dalam mode ringkas/read-only, bukan dashboard terpisah yang angkanya dapat berbeda.

### 7.2 Marketing (Fase B)

Daftar Events (nama, tanggal, penyelenggara, biaya, hasil) dan Advertisement (media, periode tayang, biaya, hasil). Keduanya terdokumentasi dan dapat ditautkan ke prospek/klien yang dihasilkan.

### 7.3 Sales (Fase B)

**Prospect List Database:** daftar prospek dengan pencarian, filter tahap dan sumber, halaman detail berisi kontak dan riwayat tindak lanjut. **Sales Analytics:** jumlah prospek per tahap, nilai pipeline, tingkat konversi prospek → quotation → order → kontrak. **Quotation:** buat penawaran dari prospek dengan layanan + tarif snapshot; status Draft / Dikirim / Disetujui / Ditolak. **Sales Process Pipeline:** tampilan tahapan pipeline (tahap final menunggu Q-11); prospek berpindah tahap dengan catatan; konversi tahap akhir menjadi Order lalu Kontrak. **Order:** Order Form dari quotation yang disetujui; status pemenuhan. **Meeting Schedule:** jadwal meeting dengan prospek/klien, pengingat tindak lanjut.

### 7.4 Deals

**Clients:** daftar klien dengan pencarian, filter status/jenis, halaman detail berisi kontak, seluruh kontrak, piutang terbuka, dan dokumen terkait. Peringatan duplikat saat membuat klien baru; penggabungan duplikat hanya oleh Verifikator dengan audit. **Partnership Details:** rincian kerja sama per jenis — PNBP Fungsional, PNBP Umum, Dukungan Layanan, Nota Kesepahaman, Media Partner. **Contracts:** buat kontrak dari pengajuan, prospek/order, atau langsung; nomor PKS unik; layanan dan tarif sebagai snapshot; jadwal tagihan/termin dapat dibuat sekaligus; filter jenis PNBP, programa, status, dan periode; penanda kontrak akan berakhir; riwayat perubahan; kontrak pada periode terkunci hanya dapat dikoreksi lewat alur koreksi (Bab 9). **Documents:** checklist dokumen per kontrak/sewa dengan status Ada / Belum Ada / Tidak Berlaku (dengan alasan); persentase kelengkapan; daftar kekurangan yang dapat diekspor; unggah file ke Firebase Storage.

### 7.5 Revenue

**Overview:** ringkasan penerimaan, tagihan, dan rekonsiliasi per periode dan kode akun. **Revenue Stream:** PNBP Fungsional (Jasa Siaran) dan PNBP Umum. **Revenue Type:** PNBP, Dukungan Layanan, Dukungan Program Siaran. **Invoice / Payments / Billings:** daftar piutang dengan sisa tagihan, umur piutang (belum jatuh tempo, 1–30, 31–60, lebih dari 60 hari lewat — ambang final dikonfirmasi pada Q-07), dan status turunan otomatis; pencatatan pembayaran/penyetoran sebagian dan penuh, bukti setor, dan status verifikasi; perhitungan/pencatatan denda per tagihan lewat jatuh tempo dengan dasar yang terlihat; ekspor daftar piutang per periode sebagai bahan laporan piutang (bukan input terpisah). **Rekonsiliasi:** layar pasangan tagihan–penerimaan per periode dan kode akun: Sudah Cocok, Cocok Sebagian, Belum Ada Penerimaan, Penerimaan Tanpa Tagihan, dan Selisih Jumlah. Selisih wajib diberi status tindak lanjut dan catatan; total kontrol per kode akun dibandingkan dengan rekap acuan Keuangan. **Keputusan:** Pencocokan otomatis hanya berupa usulan. Keputusan akhir pasangan selalu oleh pengguna — pencocokan otomatis penuh ditolak karena nama penyetor dan jumlah pada data nyata sering tidak identik.

### 7.6 Reporting — Laporan otomatis

Ketiga laporan di bawah tidak memiliki form input isi. Pengguna memilih jenis, periode, dan filter, lalu sistem menyusunnya dari data utama. Koreksi selalu dilakukan pada data sumber, kemudian laporan dibuat ulang sebagai versi baru.

| Laporan | Isi dan sumber | Aturan kunci |
|---|---|---|
| Bulanan PNBP | Fungsional dan Umum per bulan plus Rekapitulasi. Sumber: kontrak, tagihan, pembayaran terverifikasi. | Total rekapitulasi harus sama dengan jumlah Fungsional + Umum pada periode yang sama. |
| Piutang & Penyetoran | Posisi piutang dan penyetoran per bulan dari tagihan dan pembayaran. | Sisa piutang laporan harus sama dengan sisa piutang daftar operasional pada tanggal potong yang sama. |
| Kantor Pusat | Bulanan Januari–Desember, Triwulan 1–4, REALISASI/TRIWULAN, dan REALISASI/JASA sesuai PANDUAN sumber. | QTY = jumlah PKS dalam 1 bulan, bukan jumlah siaran. Bila tidak ada kerja sama/duklay/piutang, sel tetap diisi "0", tidak dikosongkan. |
| Dukungan Layanan, Nota Kesepahaman, Media Partner | Laporan Satker per jenis kemitraan. | Mengikuti aturan laporan yang sama (snapshot, verifikasi, kunci). |

**Siklus hidup laporan:** (1) **Draft** — dibuat dari data berjalan; diberi tanda DRAFT yang jelas pada ekspor. (2) **Diverifikasi** — Verifikator memeriksa total kontrol dan daftar selisih; laporan mencatat pemeriksa dan waktunya. (3) **Terkunci** — snapshot dibekukan untuk pengiriman (batas isi tanggal 10, kumpul file tanggal 11). Koreksi setelah terkunci membuat versi baru dengan catatan perubahan, versi lama tetap tersimpan. (4) **Ekspor** — format file final mengikuti kebutuhan kantor pusat (dikonfirmasi pada Q-04); minimal tersedia ekspor spreadsheet dan PDF dari snapshot yang sama. **Total kontrol wajib pada setiap laporan:** jumlah PKS (QTY), nilai kontrak, tagihan, pembayaran, sisa piutang, dan total per kode akun. Total kontrol ditampilkan sebelum ekspor agar selisih ketahuan di layar, bukan di file yang sudah terkirim.

### 7.7 To-Do List (Fase B)

**Individual Task:** tugas pribadi per pengguna dengan tenggat dan status. **Disposisi:** penugasan dari atasan/pimpinan ke staf dengan instruksi dan tenggat; status penyelesaian terlacak; riwayat disposisi tersimpan.

### 7.8 Service (Fase C)

**Client Order Portal:** klien yang diberi akun dapat melihat status order miliknya sendiri dan mengajukan order baru — akses dan persetujuan akun menunggu jawaban Q-10. **Feedback Survey:** survei kepuasan klien per order/kontrak. **Help-Desk:** konsultasi ke PIC kantor pusat, tercatat sebagai tiket dengan jawaban dan tindak lanjut — identitas PIC dan kanal menunggu jawaban Q-12. **Knowledge Base:** Regulasi dan SOP yang dapat dicari, dengan tanggal berlaku dan versi dokumen.

### 7.9 Sewa / BMN (bagian dari Deals)

Satu daftar sewa dengan tampilan filter: Semua, ON GOING, Akan Berakhir, Pengajuan Baru, Diterima di Muka, Masih Harus Diterima, Temuan Lapangan, dan Indralaya. Perubahan status sewa mengikuti tahap pada Bab 9; kenaikan harga dicatat sebagai riwayat nilai, bukan menimpa nilai lama. Temuan lapangan dicatat pada record sewa yang sama dengan status tindak lanjutnya.

---

## 8. Antarmuka dan identitas visual

### 8.1 Pola layout — gaya HubSpot (pola, bukan merek)

Referensi: halaman Companies HubSpot. Yang ditiru adalah pola layout dan ritme tampilannya; logo, nama, dan warna merek HubSpot **tidak** dipakai. Identitas tetap RRI Palembang.

- **Sidebar kiri gelap, lebar tetap**, berisi logo/nama "Partnership LPP RRI", menu 8 modul dengan ikon, menu aktif ditandai jelas, dan bagian bawah untuk Settings + profil pengguna (nama, peran, "Radio Republik Indonesia" sebagai nama organisasi). Sidebar bisa diciutkan (collapse) di layar kecil.
- **Top bar terang** di atas konten: kolom pencarian global ("Cari klien, kontrak, tagihan…"), tombol aksi cepat (+), notifikasi, dan avatar pengguna.
- **Area konten putih**: judul halaman besar dengan dropdown tampilan dan tab ("Semua", "Milik Saya"), lalu toolbar Search / Filter / Sort by, lalu tabel data yang rapi.
- **Tabel**: header kolom dengan sorting, checkbox per baris, baris dengan hover, nama klien/kontrak sebagai link, kolom status berupa badge, footer tabel dengan jumlah record, Export, dan tombol aksi utama yang tegas (mis. "Tambah Klien") di kanan atas. Tabel bisa digeser horizontal tanpa memotong tombol aksi.
- **Kartu dan detail**: halaman detail klien/kontrak memakai layout dua kolom — kolom utama berisi data & timeline aktivitas, kolom kanan berisi ringkasan (nilai kontrak, status, kontak, dokumen).
- **Bahasa**: seluruh antarmuka Bahasa Indonesia. Format tanggal dd/mm/yyyy dan format angka/tanggal Indonesia.

### 8.2 Palet warna — hanya 3 warna dari logo RRI (keputusan 14 Nov 2026, diukur langsung dari file logo)

| # | Nama | Hex | Dipakai untuk |
|---|---|---|---|
| 1 | Biru RRI | `#2573E2` | Warna aksen utama: tombol utama, link, ikon aktif, garis penanda menu aktif, logo |
| 2 | Navy RRI | `#0D2569` | Teks utama & judul, sidebar gelap, teks di atas biru/putih |
| 3 | Putih | `#FFFFFF` | Latar konten, kartu, tabel, teks di atas biru/navy |

**Aturan pakai (mengikat):** Tidak ada warna keempat — tidak ada teal HubSpot, abu-abu, hijau, merah, atau kuning tambahan. Sidebar gelap = Navy `#0D2569`, teks di dalamnya putih, menu aktif ditandai Biru `#2573E2`. Tombol utama = Biru `#2573E2` dengan teks putih. Tombol sekunder = putih dengan border Biru `#2573E2` dan teks Navy `#0D2569`. Latar halaman = putih; pemisah antar kartu/bagian hanya memakai variasi opacity dari Biru/Navy di atas putih (mis. Biru 8–10% untuk latar sorotan). Status (Aktif, Draft, Selesai, Lewat Tempo, dll.) **tidak** dibedakan dengan warna baru: bedakan dengan teks dan ikon, dengan latar tint Biru/Navy yang sama. Logo RRI dipakai apa adanya di sidebar dan halaman login; jangan mewarnai ulang logo.

---

## 9. Alur kerja utama (end-to-end)

### 9.1 Alur A — Kerja sama baru sampai lunas

1. Pengajuan masuk dicatat (Layanan) dengan tahap Masuk, lalu Ditelaah.
2. Bila disetujui, pengajuan dikonversi menjadi Klien (bila baru) dan Kontrak/PKS; dokumen dilengkapi melalui checklist.
3. Layanan, tarif (snapshot), dan jadwal tagihan/termin ditetapkan pada kontrak; status kontrak menjadi Aktif.
4. Sistem menerbitkan daftar tagihan sesuai jadwal; pembayaran/penyetoran dicatat dengan bukti setor.
5. Pembayaran diverifikasi dan dipasangkan pada rekonsiliasi; status tagihan dan sisa piutang diperbarui otomatis.
6. Bila lewat jatuh tempo, tagihan berstatus Lewat Jatuh Tempo dan denda dicatat/dihitung sesuai aturan yang berlaku; kontrak Selesai bila seluruh kewajiban lunas dan dokumen lengkap.

### 9.2 Alur B — Pembayaran dan rekonsiliasi

1. Keuangan memperbarui data acuan penerimaan per kode akun untuk periode berjalan.
2. Layanan membuka layar rekonsiliasi: sistem mengusulkan pasangan berdasarkan penyetor, jumlah, tanggal, dan kode akun.
3. Pasangan dikonfirmasi atau diperbaiki manual; selisih diberi kategori dan catatan tindak lanjut.
4. Hasil rekonsiliasi menjadi dasar verifikasi laporan periode tersebut. Selisih terbuka tampil di dashboard sampai ditutup.

### 9.3 Alur C — Sewa lahan / BMN

1. Pengajuan sewa baru dicatat Umum (atau masuk dari pengajuan umum) dengan tahap penelaahan dan kelengkapan dokumen.
2. Sewa yang disetujui menjadi satu record Sewa/BMN berstatus ON GOING, tertaut ke klien/penyewa dan — bila menjadi kerja sama PNBP — ke kontrak yang sama.
3. Tagihan sewa mengikuti jadwal pada record sewa; posisi diterima di muka / masih harus diterima diturunkan dari jadwal vs pembayaran, bukan diinput sebagai daftar terpisah.
4. Kenaikan harga dicatat sebagai riwayat dengan tanggal berlaku; temuan lapangan dicatat dan ditindaklanjuti pada record yang sama.
5. Menjelang berakhir, sewa tampil pada daftar Akan Berakhir untuk perpanjangan atau penutupan; sewa berakhir berstatus Berakhir dan tetap dapat dicari sebagai arsip.

### 9.4 Alur D — Pelaporan bulanan sampai kantor pusat

1. Sepanjang bulan, data operasional berjalan seperti Alur A–C; tidak ada pekerjaan laporan terpisah.
2. Awal bulan berikutnya, Layanan membuat Draft laporan bulanan, piutang, dan kantor pusat untuk periode yang baru berakhir.
3. Total kontrol dan selisih rekonsiliasi diperiksa; koreksi dilakukan pada data sumber, lalu Draft dibuat ulang.
4. Verifikator memverifikasi dan mengunci laporan. Batas pengisian tanggal 10 dan pengumpulan file tanggal 11 dipantau dari dashboard.
5. File ekspor dari snapshot terkunci dikirim; versi terkunci menjadi arsip periode tersebut.

### 9.5 Alur E — Penjualan: prospek sampai PKS (Fase B)

1. Prospek dicatat dengan sumber dan layanan yang diminati; tahap pipeline awal.
2. Quotation dibuat dari prospek; bila disetujui, menjadi Order (Order Form).
3. Order dikonversi menjadi Kontrak/PKS (Alur A langkah 2–6 berlaku dari sini).
4. Meeting dan tindak lanjut tercatat pada prospek/klien; pipeline diperbarui di setiap tahap.

### 9.6 Alur F — Disposisi (Fase B)

1. Pemberi disposisi membuat tugas dengan instruksi dan tenggat untuk staf.
2. Staf menerima dan mengerjakan; status diperbarui sampai selesai.
3. Pemberi disposisi menutup tugas; riwayat tersimpan dan dapat diaudit.

### 9.7 Alur G — Help-Desk ke kantor pusat (Fase C)

1. Staf mengajukan pertanyaan/konsultasi sebagai tiket dengan PIC tujuan (Q-12).
2. Jawaban PIC tercatat pada tiket yang sama; tindak lanjut dapat ditautkan ke tugas.
3. Tiket ditutup dengan ringkasan hasil; tiket lama dapat dicari sebagai arsip pengetahuan.

### 9.8 Koreksi data pada periode terkunci

Koreksi tidak membuka kunci secara diam-diam. Pengguna mengajukan koreksi dengan alasan, Verifikator menyetujui, sistem membuat versi laporan baru, dan seluruh langkah tercatat di audit trail. Laporan versi lama tetap dapat dilihat dengan tanda Digantikan.

---

## 10. Kebutuhan non-fungsional

| Aspek | Kebutuhan |
|---|---|
| Keamanan | Login wajib (Firebase Authentication); kata sandi tidak disimpan di aplikasi. Otorisasi ditegakkan di Firestore Security Rules dan Storage Rules per peran — bukan hanya di tampilan. Sesi berakhir otomatis setelah tidak aktif (durasi dikonfirmasi Admin). Tidak ada data yang dapat diakses tanpa login. Halaman Audit hanya untuk Admin Sistem: email admin dan konfigurasi Firebase **tidak boleh** tampil ke peran lain. |
| Hak akses | Sesuai matriks Bab 2, termasuk prinsip read-only data acuan Keuangan bagi bidang lain. Perubahan peran hanya oleh Admin dan tercatat. |
| Audit trail | Setiap buat/ubah/status/nilai pada klien, kontrak, tagihan, pembayaran, denda, sewa, master, peran, dan laporan mencatat pengguna, waktu, nilai sebelum dan sesudah. Audit trail bersifat tambah-saja (append-only) dan tidak dapat diedit dari antarmuka. |
| Integritas data | Validasi field wajib, keunikan nomor PKS, konsistensi tanggal (selesai tidak sebelum mulai), dan larangan nilai negatif pada tagihan/pembayaran kecuali record koreksi yang beralasan. Satu kode akun = satu klasifikasi (Bab 6.7). Total kontrol laporan harus rekonsiliasi sebelum ekspor (Bab 7.6). |
| Performa | Daftar utama (klien, kontrak, piutang, sewa) dapat dicari dan difilter dengan responsif pada volume data satker hasil migrasi 2022–2026; daftar memakai pagination. Pembuatan laporan satu periode selesai dalam waktu yang wajar untuk dipakai menjelang deadline (diuji pada tahap laporan). |
| Ketersediaan & cadangan | Mengandalkan ketersediaan Firebase; ekspor snapshot laporan terkunci disimpan sebagai arsip file. Pencadangan dan pemulihan mengikuti kemampuan Firebase dan diuji sebelum go-live. |
| Kegunaan | Bahasa antarmuka Bahasa Indonesia; istilah mengikuti istilah file sumber (PKS, duklay, programa, penyetoran); pesan kesalahan menyebut field dan perbaikannya. Tanggal dd/mm/yyyy; angka format Indonesia. |
| Kompatibilitas | Browser modern yang umum dipakai di kantor; tampilan responsif; ekspor spreadsheet dapat dibuka di aplikasi spreadsheet umum. |
| Konfigurasi | Konfigurasi Firebase dibaca dari environment variable (`VITE_FIREBASE_*`) yang dipasang di Vercel dan `.env.local` untuk lokal. **Dilarang** mengimpor file konfigurasi yang hanya disediakan oleh satu platform (pelajaran Bab 13: `firebase-applet-config.json`). Aplikasi harus tetap dapat berjalan dengan data contoh yang diberi label jelas bila konfigurasi belum dipasang — dan harus menyatakan dengan jujur di layar bahwa ia berjalan di data contoh, bukan data asli. |
| Dependensi | Versi dependensi dipin secara eksplisit dan diverifikasi kompatibilitas peer-nya sebelum push: Vite 8.3 membutuhkan esbuild `^0.27.0 \|\| ^0.28.0` — esbuild `^0.25.0` **tidak boleh** dipakai bersama Vite 8.3. `package-lock.json` wajib ada di repo dan diperbarui pada setiap perubahan dependensi. |

---
## 11. Arsitektur dan stack teknis

| Komponen | Peran | Yang disimpan / dilakukan |
|---|---|---|
| Antigravity (Google) | Lingkungan pengembangan utama (agentic IDE) | Menulis, menguji, dan memperbaiki kode langsung di repo lokal; bukan tempat hosting |
| React + Vite + Tailwind CSS | Framework aplikasi | UI, routing, dan styling; build `vite build` |
| Firebase Auth | Login dan identitas pengguna | Akun, peran (custom claims / dokumen peran) |
| Cloud Firestore | Database utama | Klien, kontrak, layanan, tagihan, pembayaran, denda, sewa, pengajuan, prospek, quotation, order, task, tiket, master, laporan snapshot, audit trail |
| Firebase Storage | File dokumen | PKS, bukti setor, dokumen sewa dan pengajuan; akses mengikuti peran |
| Firebase Hosting / Cloud Functions | Hosting alternatif dan logika server tepercaya | Perhitungan status turunan, total kontrol, pembuatan snapshot laporan, dan tugas terjadwal deadline |
| GitHub | Kendali versi dan kolaborasi — **satu-satunya sumber kebenaran kode** | Seluruh kode, aturan keamanan, migrasi, dan riwayat rilis; perubahan lewat branch + pull request; tidak ada perubahan langsung ke `main` |
| Vercel | Hosting produksi | Deploy otomatis setiap push ke `main`; preview deployment per pull request/branch |

**Yang tidak lagi dipakai:** Google AI Studio bukan lagi alat build utama (lihat Bab 13). Cloudflare Workers tidak dipakai (keputusan 13 Nov 2026).

### 11.1 Aliran data

Pengguna bekerja di Web App → Auth memverifikasi identitas dan peran → Firestore menjadi satu-satunya sumber data transaksional → file masuk ke Storage → laporan dibuat dari Firestore pada saat diminta dan dibekukan sebagai snapshot → ekspor dihasilkan dari snapshot tersebut. Data acuan Keuangan masuk sebagai koleksi terpisah dengan aturan tulis khusus peran Keuangan (atau impor terverifikasi) dan tidak pernah ditimpa oleh proses lain di Partnership.

### 11.2 Lingkungan dan rilis

Lingkungan terpisah untuk pengembangan/uji dan produksi, dengan proyek Firebase terpisah, agar data uji tidak bercampur dengan data asli. Aturan keamanan (Firestore/Storage Rules) disimpan di GitHub dan diuji bersama kode, bukan diubah manual di konsol produksi. Skrip migrasi data dari enam workbook bersifat dapat diulang (idempotent) dan menghasilkan laporan hasil migrasi untuk diverifikasi sebelum go-live. **Alternatif yang ditolak:** menyimpan data di spreadsheet yang disinkronkan dua arah — ditolak karena konflik edit dan tidak adanya penegakan hak akses per field, justru masalah yang ingin dihilangkan oleh produk ini.

### 11.3 Aturan kerja kolaborasi (mengikat)

1. Setiap pekerjaan dimulai dari branch baru dari `main`; selesai lewat pull request yang di-review sebelum merge.
2. Sebelum push, `npm run dev` dan `npm run build` harus lolos di lokal.
3. Rahasia (Firebase config, kunci API) hanya lewat environment variable — tidak pernah di-commit ke repo (`.env*` ada di `.gitignore`).
4. PRD dan amandemennya tinggal di repo di bawah `docs/` agar selalu sejalan dengan kode.
5. Firestore Rules dan indeks di-deploy terpisah lewat Firebase CLI — deploy Vercel **tidak** otomatis menyambungkan Firestore.

---

## 12. Rencana build ulang dari nol dan rilis bertahap

Build pertama dihapus pada 14 Nov 2026; rencana di bawah ini adalah satu-satunya rencana build yang berlaku.

### 12.1 Langkah 0 — Persiapan (sebelum menulis kode)

1. Persetujuan PRD v2.0 Final ini (Lampiran D).
2. Jawaban Q-01 (nama + jabatan per peran) — paling mendesak, dibutuhkan sebelum setup Firebase Auth dengan akun asli.
3. Buat repo GitHub baru (nama disarankan: `partnership-lpp-rri`, selaras dengan nama aplikasi Partnership LPP RRI).
4. Buat proyek Vercel baru dari repo tersebut (framework Vite; hapus atau putuskan tautan project Vercel lama "partnership" yang menunjuk ke repo yang sudah dihapus).
5. Sambungkan Vercel ke Digi agar Digi dapat memverifikasi deployment.

### 12.2 Langkah 1 — Scaffolding (Fase A, fondasi)

Scaffold React + Vite + Tailwind CSS langsung di repo dengan dependensi yang sudah benar sejak awal: Vite `^8.3.0` dengan esbuild `^0.28.0` (bukan `^0.25.0`), `package-lock.json` di-commit, `.env.example` berisi daftar `VITE_FIREBASE_*` tanpa nilai rahasia, `vite.config.ts`, dan struktur `src/` sesuai 8 modul Bab 4. Verifikasi: `npm install` dan `npm run build` lolos, deploy Vercel pertama (scaffolding) berhasil.

### 12.3 Langkah 2 — Fase A (fungsi inti + UI)

Auth + peran, master data, 8 modul navigasi + shell UI Bab 8, pemindahan fungsi inti (Deals, Revenue, Reporting, Sewa/BMN, pengajuan), perbaikan bug P0/P1 dari build pertama (Bab 13), migrasi 6 workbook. Gerbang keluar Fase A sesuai §4.3.

### 12.4 Langkah 3 — Fase B, lalu Fase C

Sesuai §4.3. Fase C hanya dimulai setelah Q-08–Q-12 dijawab. Setiap fase diakhiri dengan verifikasi bersama Layanan, Keuangan, dan Umum sebelum lanjut.

### 12.5 Kriteria penerimaan umum (berlaku semua modul)

Pengguna tanpa peran yang sesuai tidak dapat melihat maupun mengubah data (diuji dengan akun uji per peran). Setiap perubahan data sensitif muncul di audit trail dengan pengguna, waktu, dan nilai sebelum/sesudah. Field wajib yang kosong ditolak dengan pesan yang jelas; data tidak tersimpan sebagian. Angka pada dashboard, daftar operasional, dan laporan untuk filter yang sama selalu sama.

---

## 13. Pelajaran dari percobaan build pertama (13–14 Nov 2026)

Bagian ini dicatat agar kesalahan yang sama tidak terulang pada build ulang. Fakta-fakta di bawah ini terverifikasi dari log, screenshot, dan pemeriksaan repo langsung.

### 13.1 Kronologi singkat

- **13 Nov 2026:** PRD v1.0 dibuat (21 halaman, Draft). Prompt AI Studio pertama salah penomoran tahap; diperbaiki ke Tahap 0 (Fondasi) + Tahap 1 (Data Utama).
- **13 Nov 2026, 17:11–17:13 WIB:** Build AI Studio dianalisa — 11 halaman tampil, tetapi build sudah mencakup Tahap 0–4 (bukan Tahap 0–1), label tahap tidak konsisten, dan ditemukan bug P0/P1 (lihat §13.2).
- **13 Nov 2026, 17:20 WIB:** Pengguna memutuskan menerima build Tahap 0–4 dan menyesuaikan PRD (Amandemen v1.1).
- **13 Nov 2026, 17:42–17:43 WIB:** Deploy pindah Cloudflare → Vercel karena login Cloudflare gagal di verifikasi bot (tombol "Sign in" tetap nonaktif; kredensial tidak pernah terkirim).
- **13 Nov 2026, 18:50 WIB:** Pengguna memilih push langsung AI Studio → GitHub. Repo `lpprri/Kerja-Sama` dibuat, lalu dinamai ulang menjadi `lpprri/Partnership`.
- **14 Nov 2026, 08:04–08:07 WIB:** Mind map 8 modul dibagikan; diputuskan digabung ke build yang ada; UI dirombak gaya HubSpot; palet 3 warna ditetapkan (Amandemen v1.2).
- **14 Nov 2026, 10:05 WIB:** Deploy Vercel gagal — `npm error code ERESOLVE` (Vite 8.3.8 vs esbuild 0.25.12). AI Studio mencapai limit harian ("You've reached your limit for the day").
- **14 Nov 2026, 10:12 WIB:** Preview AI Studio crash — `Failed to resolve import "../../firebase-applet-config.json" from "src/config/firebase.ts"`.
- **14 Nov 2026:** Audit Digi menemukan repo GitHub hanya berisi scaffolding (2 commit) — kode aplikasi lengkap tidak pernah ter-push. PR #1 (esbuild `^0.28.0`) dibuat dan di-merge ke `main` atas instruksi pengguna.
- **14 Nov 2026, 10:35 WIB:** Pengguna menghapus aplikasi AI Studio dan repo GitHub, memutuskan mulai dari awal. PRD v2.0 Final ini disusun sebagai acuan build ulang.

### 13.2 Bug build pertama yang wajib tidak terulang (P0/P1)

| # | Bug | Aturan di PRD v2.0 |
|---|---|---|
| P0 | Kode akun 425131 tampil ganda: Umum (Master Kode Akun) vs Fungsional (layanan "Ad-Lib / Jingle" dan kontrak PKS-004) | Bab 6.7: satu kode = satu klasifikasi; 425131 = Umum |
| P0 | Total tidak rekonsiliasi: kontrak Rp99.700.000 (6 PKS) vs kontrol laporan Rp98.800.000 (5 PKS), selisih Rp900.000; total Tagihan Rp96.700.000 | Bab 7.6: total kontrol wajib tampil sebelum ekspor; selisih harus dijelaskan, bukan disembunyikan |
| P1 | Halaman Audit menampilkan email admin asli dan konfigurasi Firebase ke SEMUA peran | Bab 10: Audit hanya Admin Sistem |
| P1 | Input tanggal memakai format AS mm/dd/yyyy | Bab 8 & 10: dd/mm/yyyy di semua tempat |
| P1 | Tabel Tagihan meluber di 1920 px, tombol "Bayar & Denda" terpotong | Bab 8: tabel dapat digeser horizontal tanpa memotong aksi |
| P2 (belum terverifikasi) | Tambah/ubah data benar-benar tersimpan; tampilan mobile; fungsi tombol "Simulasikan"; denda Rp412.500 pada PKS-004 masih outstanding padahal sisa tagihan Rp0; koneksi Firestore asli (aplikasi jalan di data contoh) | Bab 12: setiap fase diakhiri verifikasi; aplikasi harus menyatakan jujur bila berjalan di data contoh |

### 13.3 Pelajaran proses (mengikat untuk build ulang)

1. **Jangan membangun hanya di satu alat tanpa repo.** Kode aplikasi lengkap tidak pernah sampai ke GitHub — yang ter-push hanya scaffolding. Akibatnya tidak ada yang bisa diperbaiki, di-review, atau di-deploy ulang secara andal. Aturan Bab 11.3 berlaku sejak baris kode pertama.
2. **Limit harian AI Studio menghentikan pekerjaan di tengah jalan.** AI Studio bukan lagi alat build utama; Antigravity + GitHub adalah jalur kerja.
3. **Jangan bergantung pada file yang hanya disediakan satu platform.** `firebase-applet-config.json` disediakan AI Studio dan tidak ada di GitHub/Vercel — preview crash karenanya. Konfigurasi wajib lewat environment variable (Bab 10).
4. **Periksa kompatibilitas dependensi sebelum push.** ERESOLVE Vite 8.3 vs esbuild 0.25 adalah kesalahan yang bisa dicegah dengan satu pemeriksaan peer dependency. `package-lock.json` wajib di repo.
5. **Satu nama repo, konsisten.** Repo sempat bernama `Kerja-Sama` lalu `Partnership`, sementara project Vercel bernama "partnership" — kebingungan nama memperlambat audit. Nama repo baru ditetapkan di §12.1 dan tidak diubah lagi tanpa keputusan tercatat.
6. **Verifikasi sebelum mengklaim selesai.** Status "Selesai" pada halaman Audit build pertama tidak didukung bukti (Firebase belum terhubung, data masih contoh). Klaim selesai wajib didukung hasil uji pada Bab 12.5.
7. **Keputusan yang berubah dicatat, bukan ditimpa diam-diam.** Riwayat versi di awal dokumen ini adalah catatan resmi perubahan keputusan.

---

## Lampiran A — Kriteria penerimaan spesifik

| Area | Kriteria yang dapat diuji |
|---|---|
| Laporan pusat | Untuk periode uji dengan N PKS, QTY pada laporan = N (bukan jumlah siaran). Untuk bulan tanpa kerja sama/duklay/piutang, sel terisi "0". |
| Laporan bulanan | Rekapitulasi = Fungsional + Umum; total per kode akun sama dengan penjumlahan record sumbernya. |
| Piutang | Pembayaran sebagian menurunkan sisa piutang dengan tepat; melewati jatuh tempo mengubah status tanpa input manual. |
| Sewa | Satu record sewa yang sama muncul pada filter ON GOING, Diterima di Muka, dan Indralaya sesuai kategorinya — tanpa record duplikat. |
| Keuangan read-only | Akun Layanan dan Umum tidak dapat mengubah data acuan penerimaan, termasuk lewat antarmuka maupun akses langsung yang ditolak aturan keamanan. |
| Periode terkunci | Perubahan data pada periode terkunci tertolak; jalur koreksi menghasilkan versi laporan baru dan jejak audit lengkap. |
| Kode akun | Tidak ada kode akun dengan dua klasifikasi; 425131 tercatat sebagai Umum di semua tempat. |
| UI & palet | Seluruh tampilan hanya memakai Biru `#2573E2`, Navy `#0D2569`, dan Putih `#FFFFFF`; tidak ada warna keempat di mana pun. |
| Sales (Fase B) | Prospek dapat dilacak dari tahap awal sampai kontrak; tidak ada prospek yang hilang dari pipeline. |
| Deploy | `npm install` dan `npm run build` lolos dari clone baru; deploy Vercel dari `main` berhasil tanpa intervensi manual. |

## Lampiran B — Risiko utama dan mitigasi

| Risiko | Mitigasi |
|---|---|
| Kualitas data migrasi (nama klien tidak seragam, nilai tidak lengkap) | Laporan migrasi per file, masa verifikasi bersama, dan pemakaian paralel terbatas sebelum spreadsheet dihentikan. |
| Aturan denda/tarif belum terdokumentasi final | Denda manual berdasar wajib sampai aturan resmi dikonfirmasi (Q-03); tidak ada rumus tebakan di kode. |
| Perubahan format kantor pusat | Template laporan dipisahkan dari logika data, sehingga perubahan format tidak mengubah data utama. |
| Adopsi pengguna | Istilah dipertahankan dari file sumber dan MVP dibatasi pada pekerjaan yang benar-benar menghilangkan input ulang. |
| Ketergantungan pada satu alat/AI | GitHub sebagai sumber kebenaran tunggal; seluruh pekerjaan lewat branch + PR; tidak ada kode yang hanya hidup di satu alat. |
| Data nasional/satker belum jelas (Fase C) | Ranking dan portal klien ditunda ke Fase C sampai Q-08–Q-12 dijawab; modul tampil "segera hadir", bukan ditebak. |

## Lampiran C — Pertanyaan terbuka Q-01–Q-12

**Jawaban atas pertanyaan ini tidak boleh ditebak.** Modul yang bergantung pada jawaban yang belum ada tampil sebagai "segera hadir".

| ID | Pertanyaan | Dibutuhkan sebelum |
|---|---|---|
| Q-01 | Siapa pengguna awal per peran dan siapa Verifikator serta Admin yang ditunjuk? (nama + jabatan) | Tahap 0 / Langkah 0 |
| Q-02 | Berapa baseline waktu penyusunan laporan manual dan target PNBP tahunan untuk kriteria sukses final? | Fase A (laporan) |
| Q-03 | Apa rumus, tarif, dan dasar resmi denda keterlambatan per jenis layanan? | Fitur denda |
| Q-04 | Format file final dan kanal pengiriman laporan kantor pusat yang berlaku saat ini? | Laporan kantor pusat |
| Q-05 | Bagaimana data acuan Keuangan diperbarui berkala: input di Partnership oleh Keuangan atau impor file berkala? | Rekonsiliasi |
| Q-06 | Daftar dokumen wajib per jenis kerja sama dan per sewa untuk template checklist? | Data utama |
| Q-07 | Ambang umur piutang dan daftar sewa akan berakhir (jumlah hari) yang dipakai untuk penanda dashboard? | Piutang & dashboard |
| Q-08 | Data Revenue Nasional & Satker Rank dari mana? Aplikasi ini untuk Palembang saja atau nasional? | Fase C |
| Q-09 | Aturan Employee Rank? Siapa yang dihitung, metriknya apa, dan periode Year/Month dihitung dari tanggal apa? | Fase C |
| Q-10 | Client Order Portal: siapa yang boleh login? Data apa saja yang boleh mereka lihat dan siapa yang menyetujui akunnya? | Fase C |
| Q-11 | Sales Pipeline: tahapannya apa, dan kapan prospek berubah menjadi klien/kontrak? | Fase B |
| Q-12 | Help-Desk ke PIC kantor pusat: PIC-nya siapa dan lewat apa, dan apakah konsultasi tercatat sebagai tiket atau hanya tautan kontak? | Fase C |

**Deadline laporan kantor pusat (tidak berubah):** isi maksimal tanggal 10, kumpulkan file maksimal tanggal 11 bulan berikutnya. Deadline berikutnya: isi 10 Desember 2026, kumpul 11 Desember 2026 (periode November 2026).

## Lampiran D — Lembar persetujuan Final

Dengan menyetujui PRD v2.0 Final ini, pemilik produk menyetujui: ruang lingkup 8 modul dan Fase A/B/C (Bab 4), model data (Bab 6), rencana build ulang dari nol (Bab 12), dan bahwa PRD v1.0, Amandemen v1.1, dan Amandemen v1.2 tidak lagi berlaku sebagai acuan mandiri.

- [ ] Saya setuju dengan PRD v2.0 Final ini sebagai satu-satunya acuan build Partnership LPP RRI.
- [ ] Ada perubahan: …

| Peran | Nama | Tanda tangan / persetujuan | Tanggal |
|---|---|---|---|
| Pemilik Produk — Layanan & Pengembangan Usaha | | | |
| Bidang Keuangan | | | |
| Bidang Umum | | | |

Perubahan setelah persetujuan dicatat sebagai versi PRD baru dengan daftar perubahan.

## Lampiran E — Sumber data

Enam workbook sumber (dibaca 13 Nov 2026, tetap menjadi acuan migrasi):

1. **"Kerja Sama PNBP 2026"** — daftar kerja sama utama: kontrak, klien, PNBP Fungsional/Umum, layanan, programa, piutang & penyetoran, denda, dokumen kerja sama, sewa, rekap, Master dropdown.
2. **"Daftar Sewa Lahan/BMN"** — sewa lahan/BMN 2022–2026, ON GOING, Pengajuan Baru, pendapatan diterima di muka/masih harus diterima, kenaikan harga, temuan lapangan, daftar Indralaya.
3. **"DATA PNBP 2026 (Penyetor PNBP)"** — data acuan milik Keuangan (read-only): penerimaan bulanan per kode akun (Umum 425131, Fungsional 425531, Denda Keterlambatan 425839, Sarana Prasarana Sesuai Tusi 425151, Penjualan Peralatan/Mesin 425122), Sewa Rumah Dinas, Pemindahtanganan BMN.
4. **"Laporan Bulanan PNBP 2026"** — laporan bulanan pengguna (Jan–Sep, Fungsional & Umum, plus Rekapitulasi).
5. **"Laporan Piutang & Penyetoran 2026"** — laporan pengguna (Jan–Sep).
6. **"LAPORAN PNBP 2026"** — format kantor pusat untuk semua satuan kerja: PANDUAN, bulanan Jan–Des, Triwulan 1–4, REALISASI/TRIWULAN, REALISASI/JASA.

---

*Dokumen ini disusun dari PRD v1.0 (13 Nov 2026), Amandemen v1.1 (13 Nov 2026), Amandemen v1.2 (14 Nov 2026), lembar jawaban Q-01–Q-07, hasil analisa build AI Studio 13 Nov 2026, log deploy Vercel 14 Nov 2026, dan hasil audit repo GitHub 14 Nov 2026. Seluruh keputusan, tanggal, dan angka di atas merujuk pada sumber-sumber tersebut.*

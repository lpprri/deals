# Impor Data Nyata — Partnership LPP RRI

Skrip impor data nyata Palembang dari 6 spreadsheet kerja ke aplikasi
(PRD v2.0 Final Bab 12.3). Tanggal impor: **14 November 2026**.

## Yang dihasilkan

| File | Isi |
|---|---|
| `impor.mjs` | Skrip impor (Node, tanpa dependensi tambahan). Membaca `data/`, memvalidasi, menulis `src/lib/seedNyata.ts` + `laporan-impor.json`. |
| `verifikasi.mjs` + `_hitung.ts` | Verifikasi rekonsiliasi (Node + esbuild dari `node_modules`). Membandingkan angka aplikasi (via `derive.ts`) dengan laporan sumber; menulis `laporan-rekonsiliasi.json`. |
| `data/` | Snapshot beku hasil ekstraksi Sheets 14 Nov 2026 — SUMBER INPUT skrip. Jangan diubah manual; hasil ekstraksi baru menggantikannya. |
| `laporan-impor.json` | Jumlah baris per entitas, yang dilewati, keputusan pemetaan, pengecualian kode akun, yang belum diimpor. |
| `laporan-rekonsiliasi.json` | Hasil rekonsiliasi per bulan vs Laporan Bulanan / Laporan Piutang / format HQ. |

## Cara menjalankan

```sh
# dari root repo
node scripts/impor-data-nyata/impor.mjs      # tulis ulang seedNyata.ts
node scripts/impor-data-nyata/verifikasi.mjs  # verifikasi rekonsiliasi
npm run lint && npm run build
```

Skrip deterministis: dijalankan ulang menghasilkan file yang sama persis
(cek: `sha256sum src/lib/seedNyata.ts` sebelum/sesudah). Tanggal impor
adalah konstanta `TANGGAL_IMPOR = '2026-11-14'` — bukan tanggal berjalan.

## Keputusan yang didokumentasikan

1. **Dataset default aplikasi adalah `DATA_NYATA`** (`src/lib/seedNyata.ts`,
   dipakai `App.tsx`). `DATA_CONTOH` (`src/lib/sampleData.ts`) tetap ada di
   repo sebagai **fallback demo** — dipakai HANYA sebagai sumber entitas
   Fase B (prospek, quotation, order, meeting, event, advertisement, task)
   yang tidak punya sumber nyata. Tidak ada fallback runtime: bila seed
   nyata gagal dimuat, build gagal — itu disengaja, supaya aplikasi tidak
   diam-diam kembali ke data contoh.
2. **Pembayaran dengan NTB + NTPN → `Terverifikasi`** (42/42). NTPN adalah
   bukti penerimaan negara; pola yang sama dipakai data contoh Fase A.
3. **Sewa ↔ Kontrak** ditautkan lewat nomor referensi lama (16/39 tertaut;
   25 tidak — perjanjian 2025 ke bawah yang tidak ada di kontrak 2026).
   Sheet 1 (kontrak/angsuran 2026) dan Sheet 2 (perjanjian sewa multi-tahun
   2022–2026) adalah potongan berbeda — total nilainya tidak boleh
   dijumlahkan.
4. **Tautan Fase B ke contoh Fase A dihapus** (KLN-01, PKS-001/2026,
   PJ-001/002/003) supaya tidak menggantung; jejak prospek→quotation→order
   di dalam Fase B tetap utuh.
5. **Basis bulan laporan = bulan terbit tagihan** (bulan PKS diterbitkan),
   bukan `tanggalMulai` layanan — mereproduksi tabel bulanan sumber persis
   (temuan rekonsiliasi; lihat `laporan-rekonsiliasi.json` bagian
   `pembandingTanggalMulai`). `Reporting.tsx` (Laporan Kantor Pusat) ikut
   diperbaiki ke basis ini.
6. **Denda tertanam dalam nilai tagihan** (mis. Fisol: tagihan Rp7.440.000
   = kontrak Rp6.000.000 + denda Rp1.440.000) — denda tidak ditambahkan lagi
   ke sisa piutang.

## Yang sudah diimpor pada attempt kedua (14/11/2026 ~15:48 WIB)

- **Sheet 3 (DATA PNBP 2026) — seluruh 10 tab**: 62 baris `penerimaanAcuan`
  (total Rp257.590.368). Rekonsiliasi terhadap acuan Keuangan kini dapat
  dilakukan — lihat `laporan-rekonsiliasi.json` butir (e). Pengecualian:
  baris September di Rekap Penerimaan belum diisi (Rp0), padahal tab
  September berisi 4 setoran Rp3.357.302 — selisih Rp3.357.302 antara total
  Rekap dan jumlah tab bulanan.
- **Sheet 2, tab Pengajuan Baru, Indralaya, Temuan**: 0 pengajuan baru
  (tab Pengajuan Baru ternyata rencana penggunaan lahan, bukan daftar
  pengajuan); 2 sewa baru Indralaya; 6 temuan lapangan ditempel ke sewa.
  9 baris "KERJASAMA SEDANG BERJALAN" tidak diimpor sebagai sewa terpisah
  (periode + nilainya sudah tercatat sebagai riwayatHarga sewa berjalan
  yang sama). 3 temuan tak tercocokkan hanya dicatat di audit.

## Yang butuh keputusan/koreksi pengguna

- Pengajuan **PGJ-01 & PGJ-02 memakai tanggal placeholder 2026-11-14**
  (tanggal masuk tidak tercatat di sumber) — wajib dikoreksi. Tab
  Pengajuan Baru Sheet 2 (attempt kedua) ternyata bukan daftar pengajuan,
  jadi tidak ada tanggal asli dari sana.
- Konfirmasi audit Sheet 2: pemetaan SPn/terlambat → Bermasalah; arti
  infix `PKS.F` (Indosat, Arip); nilai Revisi 2026 Sahara & Theodosius;
  total 2024 selisih Rp7.225.000 (lihat `data/sheet2-3-audit.json`).
- Nomor PKS ganda `2036/PKS/RRI.PLB/03/2026` untuk 2 kontrak (id
  `…#010` / `…#011`); Samdini tertulis "Lunas" padahal tanpa NTB/NTPN.
- Selisih Rp1 denda Mila (Rp1.897.030 vs sisa tagihan Rp1.897.029).

## Impor field Detail Kontrak (16/11/2026)

Skrip `impor-detail-kontrak.py` (Python + openpyxl) mengimpor field baru
untuk halaman Detail Kontrak dari file yang dikirim pengguna 16/11/2026
(`Kerja_Sama_PNBP_2026.xlsx` + versi rapinya):

```sh
# dari root repo
python3 scripts/impor-data-nyata/impor-detail-kontrak.py --ekstrak  # xlsx -> data/detail-kontrak-2026-11-16.json
python3 scripts/impor-data-nyata/impor-detail-kontrak.py --patch    # JSON -> patch src/lib/seedNyata.ts
```

Field yang diimpor (opsional di `src/lib/types.ts`): `Kontrak`
`penandatanganNama`/`penandatanganJabatan` (41/42 — 018 kosong di sumber),
`jenisBmn`/`lokasiBmn`/`ukuranBmn`/`luasBmn`/`dasarNilai` (17 kontrak sewa
Umum); `LayananKontrak` `realisasi` (44/48 — layanan Siaran Langsung
5390/5391 kosong di sumber) dan `jenisWaktu` ("Prime Time" 28 layanan,
"Regular Time" 0). `--patch` memverifikasi dulu kecocokan tiap layanan
file vs seed (urutan + satuan/tarif/jumlah/subtotal, toleransi Rp1) dan
HANYA menambah baris — tidak ada nilai lama yang diubah. Kode billing
TIDAK diimpor sebagai field: angka 15 digit di kolom NTB file adalah
KODE BILLING yang sama dengan spreadsheet Finance (sudah tersimpan di
`Pembayaran.buktiSetor`, dipisah saat tampil — lihat `lib/realisasi.ts`).

# Partnership LPP RRI

Aplikasi kerja sama, piutang, sewa BMN, dan laporan PNBP untuk **LPP RRI dan
60+ satuan kerja di seluruh Indonesia**.

Acuan produk: **PRD v2.0 Final** (14 Nov 2026) di `docs/prd-v2.0-final.md`.
Nama aplikasi sebelumnya: "CRM LPP RRI Palembang" / CRM "Kerja Sama RRI".

## Stack

- React 19 + Vite 8.3 + Tailwind CSS 4
- Firebase (Auth, Firestore, Storage) — konfigurasi lewat environment variable
  `VITE_FIREBASE_*` (lihat `.env.example`)
- GitHub — satu-satunya sumber kebenaran kode (branch + pull request)
- Vercel — hosting (deploy otomatis dari `main`)

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local   # isi nilai Firebase, bila ada
npm run dev                  # http://localhost:3000
npm run build                # verifikasi build produksi
```

Tanpa konfigurasi Firebase, aplikasi berjalan dalam **mode contoh** yang diberi
label jelas — bukan data asli.

## Aturan yang dikunci (PRD v2.0 Final)

- Palet hanya 3 warna: Biru RRI `#2573E2`, Navy RRI `#0D2569`, Putih `#FFFFFF`.
- Satu kode akun = satu klasifikasi; 425131 = Umum.
- QTY laporan kantor pusat = jumlah PKS; sel kosong diisi "0".
- esbuild `^0.28.0` (Vite 8.3 membutuhkan `^0.27.0 || ^0.28.0` — jangan pakai
  `^0.25.0`).
- Jangan pernah mengimpor `firebase-applet-config.json` atau file konfigurasi
  yang hanya disediakan satu platform.

## Struktur

```
src/
  App.tsx            # Shell UI 8 modul (Dashboard, Marketing, Sales, Deals,
                     #   Revenue, Reporting, To-Do List, Service)
  config/firebase.ts # Konfigurasi Firebase dari env var
  lib/dummyUsers.ts  # Pengguna awal DUMMY (Q-01) — wajib diganti nama asli
docs/
  prd-v2.0-final.md  # PRD v2.0 Final (sumber Markdown)
```

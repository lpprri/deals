#!/usr/bin/env python3
"""Generate src/lib/seedMou.ts from Rekapitulasi_Nota_Kesepahaman.xlsx.

Deterministic: re-running produces the same file byte-for-byte (given the
same xlsx). Source of truth is the user's file
~/workspace/user/files/Rekapitulasi_Nota_Kesepahaman.xlsx, sheet '2026',
data rows 6-49 (44 records).

User decisions (2026-11-19, do not change without the user):
- MoU is SEPARATE data, NOT contracts (PNBP totals must not change).
- ALL 44 rows are MoU even though JENIS KERJASAMA differs (26 Nota
  Kesepahaman, 17 Perjanjian Kerjasama, 1 Pelaksanaan Kerja Sama);
  the original JENIS value is kept as the `jenis` field.
- PIC names exactly as written: 'Dessi' and 'Dessi Maya Sari' are NOT
  merged; 'Selvia Lena' kept as-is; 1 missing PIC -> '—' in the source,
  BUT user correction 19/11/2026 14:41 WIB sets record
  037/RRI-PLB/KJM.02.04/09/2026 PIC to 'Ja'far' (see KOREKSI_037 below).
- 21 empty DOKUMEN -> '—'. '2 tahun' normalized to '2 Tahun'.
- Institution name of record 037 has a stray trailing backtick in the
  source ('Komunitas Wirausaha Tangan Di Atas`') — cleaned by the same
  user correction (KOREKSI_037 below).

Usage:
  python3 scripts/impor-mou.py
"""
import json
import sys
from datetime import datetime
from pathlib import Path

import openpyxl

XLSX = Path.home() / "workspace/user/files/Rekapitulasi_Nota_Kesepahaman.xlsx"
OUT = Path(__file__).resolve().parent.parent / "src/lib/seedMou.ts"

HEADER = """// Data MoU NYATA Palembang — hasil impor file pengguna
// "Rekapitulasi_Nota_Kesepahaman.xlsx" (sheet '2026', baris 6-49).
// Dibuat OTOMATIS oleh scripts/impor-mou.py — JANGAN diubah manual;
// ubah sumbernya (xlsx) lalu jalankan ulang skrip ini.
// Tanggal impor: 2026-11-19; satker: PALEMBANG (pilot).
//
// ISI: 44 record Memorandum of Understanding — 26 Nota Kesepahaman,
// 17 Perjanjian Kerjasama, 1 Pelaksanaan Kerja Sama. Keputusan pengguna
// 19/11/2026: SEMUA 44 baris adalah MoU meski penyebutan JENIS berbeda;
// label JENIS asli disimpan di field `jenis`. Data ini TERPISAH dari
// kontrak PNBP (bukan kontrak; total kontrak/totals PNBP tidak berubah).
// Panel Memorandum of Understanding membaca koleksi `mou`.
// - Nomor dokumen digabung dari 5 kolom (mis. '008/RRI-PLB/KJM.02.04/
//   01/2026'); id record = nomor dokumen (mengandung '/', di-encode
//   saat tulis Firestore seperti id kontrak).
// - PIC apa adanya: 'Dessi' (5) dan 'Dessi Maya Sari' (2) TIDAK
//   digabung; 'Selvia Lena' (4) bukan operator — tetap disimpan;
//   PIC kosong di sumber (1 baris, 037) dikoreksi pengguna 19/11/2026
//   menjadi 'Ja'far' (lihat KOREKSI_037 di scripts/impor-mou.py).
// - Nama instansi 037 dibersihkan dari backtick nyasar di akhir
//   ('Komunitas Wirausaha Tangan Di Atas`' -> tanpa backtick).
// - DOKUMEN kosong (21 baris) -> '—'.
// - Masa berlaku '2 tahun' dinormalisasi ke '2 Tahun'.
// - Typo tahun sumber (2 baris): periode '7 April 0206' (baris 28) dan
//   '6 May 0206' (baris 29) dibaca sebagai 2026 — hari+bulan cocok
//   dengan tanggal penandatanganan baris itu (2026-04-07 / 2026-05-06);
//   Q baris 29 (masa '1 Hari') = 2026-05-06. Bila pengguna mengoreksi,
//   ubah xlsx lalu jalankan ulang skrip ini.

import type { Mou } from './types';

export const MOU_NYATA: Mou[] = """

REQUIRED = ["id", "jenis", "instansi", "kategori", "judul",
            "tanggalTandaTangan", "tanggalMulai", "tanggalSelesai",
            "masaBerlaku"]


def tgl(v, tahun_fallback=None):
    if isinstance(v, datetime):
        return v.strftime("%Y-%m-%d")
    if isinstance(v, str):
        # Typo sumber (2 baris): '7 April 0206' / '6 May 0206' — tahun
        # '0206' jelas salah ketik untuk 2026 (hari+bulan cocok dengan
        # tanggal penandatanganan baris itu). Parse hari+bulan, pakai
        # tahun penandatanganan sebagai fallback.
        try:
            d = datetime.strptime(v.strip(), "%d %B %Y")
        except ValueError:
            raise ValueError(f"unparsable date string {v!r}")
        if d.year < 1000:
            if tahun_fallback is None:
                raise ValueError(f"no fallback year for {v!r}")
            d = d.replace(year=tahun_fallback)
        return d.strftime("%Y-%m-%d")
    raise ValueError(f"expected datetime, got {v!r}")


def teks(v):
    if v is None:
        return ""
    if isinstance(v, float) and v.is_integer():
        return str(int(v))
    return str(v).strip()


def main() -> int:
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    ws = wb["2026"]
    records = []
    for r in range(6, 50):
        g = lambda c: ws.cell(row=r, column=c).value
        nomor = "".join(teks(g(c)) for c in range(2, 7))
        masa = teks(g(18))
        if masa.lower() == "2 tahun":
            masa = "2 Tahun"
        rec = {
            "id": nomor,
            "jenis": teks(g(7)),
            "instansi": teks(g(8)),
            "kategori": teks(g(9)),
            "narahubung": teks(g(10)),
            "telepon": teks(g(11)),
            "tematik": teks(g(12)),
            "astaCita": teks(g(13)),
            "judul": teks(g(14)),
            "tanggalTandaTangan": tgl(g(15)),
            "tanggalMulai": tgl(g(16), tahun_fallback=g(15).year
                               if isinstance(g(15), datetime) else None),
            "tanggalSelesai": tgl(g(17), tahun_fallback=g(15).year
                                 if isinstance(g(15), datetime) else None),
            "masaBerlaku": masa,
            "dokumen": teks(g(19)) or "—",
            "pic": teks(g(20)) or "—",
            "satker": {"kode": "41", "nama": "PALEMBANG"},
        }
        missing = [k for k in REQUIRED if not rec[k]]
        if missing:
            print(f"ROW {r}: missing required fields {missing}", file=sys.stderr)
            return 1
        records.append(rec)

    # --- koreksi pengguna 19/11/2026 14:41 WIB (BUKAN dari file) ---
    # Record 037/RRI-PLB/KJM.02.04/09/2026: PIC kosong di sumber ('—')
    # menjadi 'Ja'far'; nama instansi ada backtick nyasar di akhir
    # ('Komunitas Wirausaha Tangan Di Atas`') dibersihkan. Diterapkan DI
    # GENERATOR (bukan edit manual seed) supaya jalankan ulang skrip ini
    # tetap menghasilkan seed yang sama.
    KOREKSI_037 = {
        "id": "037/RRI-PLB/KJM.02.04/09/2026",
        "pic_lama": "—",
        "pic_baru": "Ja'far",
        "instansi_lama": "Komunitas Wirausaha Tangan Di Atas`",
        "instansi_baru": "Komunitas Wirausaha Tangan Di Atas",
    }
    rec037 = next(x for x in records if x["id"] == KOREKSI_037["id"])
    assert rec037["pic"] == KOREKSI_037["pic_lama"], rec037
    assert rec037["instansi"] == KOREKSI_037["instansi_lama"], rec037
    rec037["pic"] = KOREKSI_037["pic_baru"]
    rec037["instansi"] = KOREKSI_037["instansi_baru"]

    # --- verification summary (must match the parent's analysis) ---
    from collections import Counter
    jenis = Counter(x["jenis"] for x in records)
    assert len(records) == 44, len(records)
    assert jenis == {"Nota Kesepahaman": 26, "Perjanjian Kerjasama": 17,
                     "Pelaksanaan Kerja Sama": 1}, jenis
    assert len({x["id"] for x in records}) == 44, "duplicate nomor dokumen"
    assert sum(1 for x in records if x["dokumen"] == "—") == 21
    # PIC '—' di sumber tepat 1 baris (037), tapi koreksi pengguna di
    # atas mengubahnya menjadi 'Ja'far' — seed akhir: 0 baris '—'.
    assert sum(1 for x in records if x["pic"] == "—") == 0
    # 'Ja'far' sudah ada 1 baris di sumber + 037 dari koreksi = 2.
    assert Counter(x["pic"] for x in records)["Ja'far"] == 2
    assert all(not x["instansi"].endswith("`") for x in records)
    assert Counter(x["pic"] for x in records)["Dessi"] == 5
    assert Counter(x["pic"] for x in records)["Dessi Maya Sari"] == 2
    assert Counter(x["pic"] for x in records)["Selvia Lena"] == 4
    assert Counter(x["masaBerlaku"] for x in records) == {
        "2 Tahun": 35, "1 Tahun": 7, "4 Tahun": 1, "1 Hari": 1}, \
        Counter(x["masaBerlaku"] for x in records)
    dates = [x["tanggalTandaTangan"] for x in records]
    assert min(dates) == "2026-01-20" and max(dates) == "2026-11-04", \
        (min(dates), max(dates))
    # Typo tahun sumber (hari+bulan cocok dengan tgl tanda tangan):
    # baris 28 (023/.../05/2026) P '7 April 0206' -> 2026-04-07;
    # baris 29 (024/.../05/2026) P+Q '6 May 0206' -> 2026-05-06.
    per_id = {x["id"]: x for x in records}
    assert per_id["023/RRI-PLB/KJM.02.04/05/2026"]["tanggalMulai"] == "2026-04-07"
    assert per_id["023/RRI-PLB/KJM.02.04/05/2026"]["tanggalSelesai"] == "2028-04-07"
    assert per_id["024/RRI-PLB/KJM.02.04/05/2026"]["tanggalMulai"] == "2026-05-06"
    assert per_id["024/RRI-PLB/KJM.02.04/05/2026"]["tanggalSelesai"] == "2026-05-06"
    # Koreksi pengguna 19/11/2026 (KOREKSI_037 di atas).
    assert per_id["037/RRI-PLB/KJM.02.04/09/2026"]["pic"] == "Ja'far"
    assert per_id["037/RRI-PLB/KJM.02.04/09/2026"]["instansi"] == \
        "Komunitas Wirausaha Tangan Di Atas"

    body = json.dumps(records, ensure_ascii=False, indent=2)
    OUT.write_text(HEADER + body + ";\n", encoding="utf-8")
    print(f"wrote {OUT} ({len(records)} records)")
    print("jenis:", dict(jenis))
    print("dokumen '—':", sum(1 for x in records if x["dokumen"] == "—"),
          "| pic '—':", sum(1 for x in records if x["pic"] == "—"))
    print("dates:", min(dates), "..", max(dates))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

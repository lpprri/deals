#!/usr/bin/env python3
"""Generate src/lib/seedCommitment.ts from Dukungan_Layanan_2026.xlsx.

Deterministic: re-running produces the same file byte-for-byte (given
the same xlsx). Source of truth is the user's file
~/workspace/user/files/Dukungan_Layanan_2026.xlsx, sheet
'Semarak Ramadhan', data rows 7-19 (13 item lines grouped into 4
partner records).

User decision (2026-11-19, do not change without the user):
- Commitment is SEPARATE data, like MoU — NOT contracts (PNBP totals
  must not change).

Structure of the source file:
- One event: "Pekan Tilawatil Qur'an", 13 Mar 2024 (column C, row 7).
  NOTE the date discrepancy: the file is named 2026 but the data is
  2024 — the event date is stored as 2024-03-13 as written in the
  file; do not "fix" it to 2026 without the user.
- 4 partners (rows with column E filled); the 13 data rows are ITEM
  lines (qty x harga satuan = jumlah); column M = TOTAL per partner.
- LAYANAN/BENEFIT columns (N-Q) and NILAI KONVERSI (R) are all '-'
  (empty) — stored as '—'; do NOT invent benefits or conversion
  values.
- Column U = 001-004 (doc number), column V = "Surat Penawaran 00X
  Pekan Tilawatil Qur'an - <mitra>".
- Names exactly as written: 'Bank Syariah Indonesian Kenten 2'
  (with "Indonesian", as in the file — NOT "Indonesia").

Usage:
  python3 scripts/impor-commitment.py
"""
import json
import sys
from datetime import datetime
from pathlib import Path

import openpyxl

XLSX = Path.home() / "workspace/user/files/Dukungan_Layanan_2026.xlsx"
OUT = Path(__file__).resolve().parent.parent / "src/lib/seedCommitment.ts"

HEADER = """// Data Commitment NYATA Palembang — hasil impor file pengguna
// "Dukungan_Layanan_2026.xlsx" (sheet 'Semarak Ramadhan', baris 7-19).
// Dibuat OTOMATIS oleh scripts/impor-commitment.py — JANGAN diubah
// manual; ubah sumbernya (xlsx) lalu jalankan ulang skrip ini.
// Tanggal impor: 2026-11-19; satker: PALEMBANG (pilot).
//
// ISI: 4 record Commitment (dukungan layanan) — 1 kegiatan
// "Pekan Tilawatil Qur'an" dengan 4 mitra, 13 baris item dukungan
// (barang: Kipas Angin, Rice Cooker, Dispenser, Setrika). Keputusan
// pengguna 19/11/2026: Commitment adalah data TERPISAH seperti MoU,
// BUKAN kontrak (total kontrak/totals PNBP tidak berubah). Panel
// Commitment membaca koleksi `commitment`.
// - PERHATIAN TANGGAL: nama file menyebut 2026, tapi data kegiatan
//   adalah 13 Maret 2024 (kolom C) — tanggal disimpan 2024-03-13
//   apa adanya dari file. Jangan "betulkan" ke 2026 tanpa pengguna.
// - Nama mitra apa adanya dari file: 'Bank Syariah Indonesian
//   Kenten 2' (dengan "Indonesian", bukan "Indonesia").
// - LAYANAN/BENEFIT (kolom N-Q) dan NILAI KONVERSI (R) kosong ('-')
//   di semua baris — disimpan '—'; tidak ada benefit/nilai konversi
//   yang dikarang.
// - id record = nomor dokumen (mis. '001/RRI.PLB/PKS.DL/03/2024');
//   mengandung '/', di-encode saat tulis Firestore seperti id
//   kontrak dan id MoU.

import type { Commitment } from './types';

export const COMMITMENT_NYATA: Commitment[] = """

REQUIRED = ["id", "kegiatan", "tanggalKegiatan", "mitra",
            "penandatangan", "jabatanPenandatangan", "dokumen"]


def teks(v):
    if v is None:
        return ""
    if isinstance(v, float) and v.is_integer():
        return str(int(v))
    return str(v).strip()


def tgl(v):
    if isinstance(v, datetime):
        return v.strftime("%Y-%m-%d")
    raise ValueError(f"expected datetime, got {v!r}")


def main() -> int:
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    ws = wb["Semarak Ramadhan"]
    records = []
    baris_item = 0
    rekapitulasi = ws.cell(row=7, column=4).value
    kegiatan = teks(ws.cell(row=7, column=2).value)
    tanggal_kegiatan = tgl(ws.cell(row=7, column=3).value)
    saat_ini = None
    for r in range(7, 20):
        g = lambda c: ws.cell(row=r, column=c).value
        mitra = teks(g(5))
        if mitra:
            # Baris mitra baru (E terisi): mulai record baru.
            if saat_ini is not None:
                records.append(saat_ini)
            layanan = teks(g(14))
            konversi = teks(g(18))
            saat_ini = {
                "id": teks(g(8)),
                "kegiatan": kegiatan,
                "tanggalKegiatan": tanggal_kegiatan,
                "mitra": mitra,
                "penandatangan": teks(g(6)),
                "jabatanPenandatangan": teks(g(7)),
                "dukungan": [],
                "totalDukungan": g(13),
                "layanan": "—" if layanan in ("", "-") else layanan,
                "nilaiKonversi": "—" if konversi in ("", "-") else konversi,
                "dokumen": teks(g(22)),
                "nomorDokumen": teks(g(21)),
                "satker": {"kode": "41", "nama": "PALEMBANG"},
            }
        # Baris item dukungan (I-L) — ada di baris mitra maupun lanjutannya.
        jenis = teks(g(9))
        if saat_ini is None:
            print(f"ROW {r}: baris item sebelum mitra pertama", file=sys.stderr)
            return 1
        if not jenis:
            print(f"ROW {r}: item tanpa JENIS", file=sys.stderr)
            return 1
        qty = g(10)
        harga = g(11)
        jumlah = g(12)
        if not (isinstance(qty, (int, float)) and isinstance(harga, (int, float))
                and isinstance(jumlah, (int, float))):
            print(f"ROW {r}: qty/harga/jumlah bukan angka", file=sys.stderr)
            return 1
        saat_ini["dukungan"].append({
            "jenis": jenis,
            "qty": int(qty),
            "hargaSatuan": int(harga),
            "jumlah": int(jumlah),
        })
        baris_item += 1
    if saat_ini is not None:
        records.append(saat_ini)

    # --- verification summary (must match the parent's analysis) ---
    assert len(records) == 4, len(records)
    assert baris_item == 13, baris_item
    assert kegiatan == "Pekan Tilawatil Qur'an", kegiatan
    assert tanggal_kegiatan == "2024-03-13", tanggal_kegiatan
    assert rekapitulasi == 16600000, rekapitulasi
    total_diharapkan = {
        "001/RRI.PLB/PKS.DL/03/2024": 3000000,
        "002/RRI.PLB/PKS.DL/03/2024": 1500000,
        "003/RRI.PLB/PKS.DL/03/2024": 1900000,
        "004/RRI.PLB/PKS.DL/03/2024": 10200000,
    }
    assert len({x["id"] for x in records}) == 4, "duplicate nomor dokumen"
    for rec in records:
        missing = [k for k in REQUIRED if not rec[k]]
        if missing:
            print(f"{rec['id']}: missing required fields {missing}",
                  file=sys.stderr)
            return 1
        assert rec["totalDukungan"] == total_diharapkan[rec["id"]], \
            (rec["id"], rec["totalDukungan"])
        assert sum(d["jumlah"] for d in rec["dukungan"]) == rec["totalDukungan"], \
            (rec["id"], "jumlah item != total")
        for d in rec["dukungan"]:
            assert d["qty"] * d["hargaSatuan"] == d["jumlah"], \
                (rec["id"], d)
        assert rec["layanan"] == "—" and rec["nilaiKonversi"] == "—", rec["id"]
        assert rec["satker"] == {"kode": "41", "nama": "PALEMBANG"}
    assert sum(x["totalDukungan"] for x in records) == rekapitulasi, \
        sum(x["totalDukungan"] for x in records)
    assert records[0]["mitra"] == "Bank Syariah Indonesian Kenten 2", \
        records[0]["mitra"]
    assert records[0]["dokumen"] == (
        "Surat Penawaran 001 Pekan Tilawatil Qur'an - "
        "Bank Syariah Indonesian Kenten 2"), records[0]["dokumen"]

    body = json.dumps(records, ensure_ascii=False, indent=2)
    OUT.write_text(HEADER + body + ";\n", encoding="utf-8")
    print(f"wrote {OUT} ({len(records)} records, {baris_item} item lines)")
    print("totals:", {x["id"]: x["totalDukungan"] for x in records})
    print("grand total:", sum(x["totalDukungan"] for x in records),
          "| rekapitulasi:", rekapitulasi)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

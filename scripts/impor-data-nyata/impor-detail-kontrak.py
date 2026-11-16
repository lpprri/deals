#!/usr/bin/env python3
"""Impor field baru Detail Kontrak dari file sumber ke seed (PR detail-kontrak-baru).

Sumber (dikirim user 2026-11-16):
- File asli: ~/workspace/user/files/Kerja_Sama_PNBP_2026.xlsx
  (sheet Summary; kolom per layanan + kolom Nama Penandatangan)
- File rapi: ~/workspace/your_files/Kerja_Sama_PNBP_2026_Tabel_Rapi.xlsx
  (kolom Detail BMN / Lokasi BMN / Ukuran BMN / Luas BMN / Dasar Nilai
  yang sudah digabung & dibersihkan)

Field baru (opsional, di src/lib/types.ts):
- Kontrak: penandatanganNama, penandatanganJabatan, jenisBmn, lokasiBmn,
  ukuranBmn, luasBmn, dasarNilai (nomor surat persetujuan KPKNL).
- LayananKontrak: realisasi (fraksi 0-1, kolom "Realisasi Kerja Sama"),
  jenisWaktu ("Prime Time" / "Regular Time", kolom "Jenis Waktu").

CATATAN HASIL PENYELIDIKAN (2026-11-16):
- Penandatangan ADA di file (kolom "Nama Penandatangan", format
  "nama\\njabatan"); 39/40 kontrak 2026 terisi, 018 kosong; 016/027
  hanya ada di blok kedua file asli.
- Ukuran/Luas BMN + Dasar Nilai (KPKNL) ADA untuk semua kontrak sewa
  (17 kontrak Umum); file memuat 8 nomor KPKNL berbeda.
- Kode billing: TIDAK butuh field baru — angka 15 digit di kolom NTB
  file adalah KODE BILLING yang sama dengan kolom "KODE BILLING" di
  spreadsheet Finance "DATA PNBP 2026" (terverifikasi 1:1 untuk 0603,
  1051, 1052, 1494). App sudah menyimpannya di Pembayaran.buktiSetor
  ("NTB ... / NTPN ...") dan Detail Kontrak memisahkannya saat tampil.
- Jadwal siaran per tanggal TIDAK ada di spreadsheet mana pun; yang ada
  adalah kolom "Realisasi Kerja Sama" per layanan (= proporsi yang sudah
  tayang: menit/spot/jam yang sudah disiarkan). Realisasi memakai kolom
  itu; bila kosong (layanan Siaran Langsung 5390/5391), fallback dihitung
  di src/lib/realisasi.ts (Selesai -> 100%, Fungsional -> proporsi waktu,
  Umum multi-tahun -> tahun berjalan / jumlah tahun).

Penggunaan:
  python3 scripts/impor-data-nyata/impor-detail-kontrak.py --ekstrak
      -> tulis scripts/impor-data-nyata/data/detail-kontrak-2026-11-16.json
  python3 scripts/impor-data-nyata/impor-detail-kontrak.py --patch
      -> baca JSON di atas, patch src/lib/seedNyata.ts, verifikasi.

Patch hanya MENAMBAH baris (field baru); tidak ada nilai lama yang diubah.
"""

import json
import re
import sys
from pathlib import Path

import openpyxl

REPO = Path(__file__).resolve().parents[2]
ASLI = Path("/home/hatch/workspace/user/files/Kerja_Sama_PNBP_2026.xlsx")
RAPI = Path("/home/hatch/workspace/your_files/Kerja_Sama_PNBP_2026_Tabel_Rapi.xlsx")
JSON_OUT = REPO / "scripts/impor-data-nyata/data/detail-kontrak-2026-11-16.json"
SEED = REPO / "src/lib/seedNyata.ts"


def bersih(teks):
    """'-' / None / '' -> None; selain itu str tanpa spasi berlebih."""
    if teks is None:
        return None
    s = str(teks).strip()
    return s if s not in ("", "-") else None


def ekstrak():
    wb_asli = openpyxl.load_workbook(ASLI, data_only=True)
    ws = wb_asli["Summary"]
    wb_rapi = openpyxl.load_workbook(RAPI, data_only=True)
    ws_rapi = wb_rapi.active

    # --- Peta nomorPks -> baris file rapi (kolom 2), untuk field BMN ---
    bmn_rapi = {}
    for r in range(3, 43):
        nk = ws_rapi.cell(row=r, column=2).value
        if nk:
            bmn_rapi.setdefault(str(nk), []).append(r)

    # --- Blok 1: baris 6-55 (40 kontrak 2026) ---
    data = {}
    order = []
    seen = {}
    cur = None
    for r in range(6, 56):
        nk = "".join(str(ws.cell(row=r, column=c).value or "") for c in range(2, 7))
        if nk:
            seen[nk] = seen.get(nk, 0) + 1
            if seen[nk] == 2:
                # Duplikat PKS 2036: kunci pertama diganti mengikuti id seed
                # (#010 untuk Bank Sumsel Babel, #011 untuk Bank Indonesia).
                lama = data.pop(nk)
                order[order.index(nk)] = f"{nk}#010"
                data[f"{nk}#010"] = lama
                key = f"{nk}#011"
            elif seen[nk] == 1:
                key = nk
            else:
                key = f"{nk}#{9 + seen[nk]:03d}"
            cur = key
            order.append(key)
            pen = ws.cell(row=r, column=19).value
            nama, jabatan = None, None
            if pen:
                bagian = str(pen).split("\n")
                nama = bagian[0].strip() or None
                jabatan = bagian[1].strip() if len(bagian) > 1 else None
            data[key] = {
                "nomorPks": nk,
                "penandatanganNama": nama,
                "penandatanganJabatan": jabatan,
                "layanan": [],
            }
        if cur is not None:
            detail = ws.cell(row=r, column=22).value
            if detail is not None:  # baris lanjutan pembayaran (detail kosong) dilewati
                data[cur]["layanan"].append(
                    {
                        "detail": str(detail).strip(),
                        "programa": bersih(ws.cell(row=r, column=23).value),
                        "jenisWaktu": bersih(ws.cell(row=r, column=24).value),
                        "kuantiti": ws.cell(row=r, column=39).value,
                        "satuan": ws.cell(row=r, column=40).value,
                        "tarif": ws.cell(row=r, column=41).value,
                        "subtotal": ws.cell(row=r, column=42).value,
                        "realisasi": ws.cell(row=r, column=43).value,
                    }
                )

    # --- Blok 2: baris 61 (027) dan 64 (016), kontrak sisa 2025 ---
    for r in (61, 64):
        nk = "".join(str(ws.cell(row=r, column=c).value or "") for c in range(2, 7))
        pen = ws.cell(row=r, column=19).value
        nama, jabatan = None, None
        if pen:
            bagian = str(pen).split("\n")
            nama = bagian[0].strip() or None
            jabatan = bagian[1].strip() if len(bagian) > 1 else None
        data[nk] = {
            "nomorPks": nk,
            "penandatanganNama": nama,
            "penandatanganJabatan": jabatan,
            "layanan": [
                {
                    "detail": str(ws.cell(row=r, column=22).value or "-").strip(),
                    "programa": bersih(ws.cell(row=r, column=23).value),
                    "jenisWaktu": bersih(ws.cell(row=r, column=24).value),
                    "kuantiti": ws.cell(row=r, column=39).value,
                    "satuan": ws.cell(row=r, column=40).value,
                    "tarif": ws.cell(row=r, column=41).value,
                    "subtotal": ws.cell(row=r, column=42).value,
                    "realisasi": ws.cell(row=r, column=43).value,
                }
            ],
            "detailBmnAsli": bersih(ws.cell(row=r, column=25).value),
            "lokasiBmnAsli": bersih(ws.cell(row=r, column=26).value),
            "ukuranAsli": "".join(
                str(ws.cell(row=r, column=c).value or "") for c in range(28, 33)
            ),
            "luasAsli": bersih(ws.cell(row=r, column=33).value),
            "dasarNilaiAsli": bersih(ws.cell(row=r, column=34).value),
        }
        order.append(nk)

    # --- Field BMN dari file rapi (kolom 15-20), per kontrak ---
    for key in order:
        entri = data[key]
        nk = entri["nomorPks"]
        baris = bmn_rapi.get(nk, [])
        if baris:
            r = baris[0]
            entri["jenisBmn"] = bersih(ws_rapi.cell(row=r, column=15).value)
            entri["lokasiBmn"] = bersih(ws_rapi.cell(row=r, column=16).value)
            entri["ukuranBmn"] = bersih(ws_rapi.cell(row=r, column=18).value)
            entri["luasBmn"] = bersih(ws_rapi.cell(row=r, column=19).value)
            entri["dasarNilai"] = bersih(ws_rapi.cell(row=r, column=20).value)
        else:  # 016/027 tidak ada di file rapi — pakai kolom asli
            entri["jenisBmn"] = entri.pop("detailBmnAsli", None)
            entri["lokasiBmn"] = entri.pop("lokasiBmnAsli", None)
            ukuran = (entri.pop("ukuranAsli", "") or "").strip()
            # Normalisasi ke gaya file rapi: "2.5mx5m" -> "2.5 m x 5 m".
            m_uk = re.match(r"^([\d,\.]+)\s*m?\s*x\s*([\d,\.]+)\s*m?$", ukuran)
            if m_uk:
                ukuran = f"{m_uk.group(1)} m x {m_uk.group(2)} m"
            entri["ukuranBmn"] = ukuran if ukuran and set(ukuran) != {"-"} else None
            entri["luasBmn"] = entri.pop("luasAsli", None)
            entri["dasarNilai"] = entri.pop("dasarNilaiAsli", None)

    hasil = {"order": order, "data": data}
    JSON_OUT.parent.mkdir(parents=True, exist_ok=True)
    JSON_OUT.write_text(
        json.dumps(hasil, ensure_ascii=False, indent=1, default=str), encoding="utf-8"
    )
    n_layanan = sum(len(d["layanan"]) for d in data.values())
    n_pen = sum(1 for d in data.values() if d["penandatanganNama"])
    n_bmn = sum(1 for d in data.values() if d["jenisBmn"])
    n_real = sum(
        1 for d in data.values() for lay in d["layanan"] if lay["realisasi"] is not None
    )
    n_waktu = sum(
        1
        for d in data.values()
        for lay in d["layanan"]
        if lay["jenisWaktu"] == "Prime Time"
    )
    print(f"kontrak: {len(order)} | layanan: {n_layanan}")
    print(f"penandatangan terisi: {n_pen}/42")
    print(f"BMN (jenis/lokasi/ukuran/luas/KPKNL) terisi: {n_bmn}")
    print(f"realisasi per layanan terisi: {n_real}/{n_layanan}")
    print(f"jenisWaktu 'Prime Time': {n_waktu} | 'Regular Time': 0 (tidak ada di data)")
    print(f"ditulis: {JSON_OUT}")


def layanan_seed(teks_seed):
    """Parse ringan seed: {kontrakId: [(satuan, tarif, jumlah, subtotal, programa)]}."""
    hasil = {}
    blok = re.split(r'(?m)^  \},\n  \{$', teks_seed)
    for potong in blok:
        m_id = re.search(r'"id": "([^"]+)",\n    "nomorPks"', potong)
        if not m_id:
            continue
        kid = m_id.group(1)
        lay = []
        for m in re.finditer(
            r'"satuan": "([^"]+)",\n        "tarif": ([0-9.]+),\n        "jumlah": ([0-9.]+),\n        "subtotal": ([0-9.]+)(?:,\n        "programa": "([^"]+)")?',
            potong,
        ):
            lay.append(
                (
                    m.group(1),
                    float(m.group(2)),
                    float(m.group(3)),
                    float(m.group(4)),
                    m.group(5),
                )
            )
        hasil[kid] = lay
    return hasil


def patch():
    payload = json.loads(JSON_OUT.read_text(encoding="utf-8"))
    data = payload["data"]
    order = payload["order"]
    teks = SEED.read_text(encoding="utf-8")
    seed_layanan = layanan_seed(teks)

    # --- Verifikasi kecocokan layanan file vs seed (urutan + nilai) ---
    masalah = []
    for key in order:
        entri = data[key]
        lay_seed = seed_layanan.get(key)
        if lay_seed is None:
            masalah.append(f"{key}: tidak ditemukan di seed")
            continue
        if len(lay_seed) != len(entri["layanan"]):
            masalah.append(
                f"{key}: jumlah layanan file={len(entri['layanan'])} seed={len(lay_seed)}"
            )
            continue
        for i, (lay_file, lay_s) in enumerate(zip(entri["layanan"], lay_seed)):
            satuan, tarif, jumlah, subtotal, programa_seed = lay_s
            if lay_file["satuan"] != satuan:
                masalah.append(f"{key} lay-{i}: satuan file={lay_file['satuan']} seed={satuan}")
            if float(lay_file["tarif"] or 0) != tarif:
                masalah.append(f"{key} lay-{i}: tarif file={lay_file['tarif']} seed={tarif}")
            if float(lay_file["kuantiti"] or 0) != jumlah:
                masalah.append(f"{key} lay-{i}: jumlah file={lay_file['kuantiti']} seed={jumlah}")
            if abs(float(lay_file["subtotal"] or 0) - subtotal) > 1:
                masalah.append(
                    f"{key} lay-{i}: subtotal file={lay_file['subtotal']} seed={subtotal}"
                )
    if masalah:
        print("KECOCOKAN LAYANAN GAGAL:")
        for m in masalah:
            print(" -", m)
        sys.exit(1)
    print(f"kecocokan layanan file vs seed: OK ({len(order)} kontrak)")

    # --- Patch: sisipkan field baru ---
    baris = teks.split("\n")
    disisip = {"penandatanganNama": 0, "bmn": 0, "realisasi": 0, "jenisWaktu": 0}

    def cari_id(kid):
        target = f'    "id": "{kid}",'
        for idx, b in enumerate(baris):
            if b == target:
                return idx
        return -1

    for key in order:
        entri = data[key]
        i_id = cari_id(key)
        if i_id < 0:
            print(f"GAGAL: id {key} tidak ditemukan di seed")
            sys.exit(1)
        # Batas blok kontrak: baris '  },' berikutnya (indent 2).
        i_akhir = next(i for i in range(i_id, len(baris)) if baris[i] == "  },")
        # 1) Field kontrak — sisipkan setelah baris penanggungJawab.
        i_pj = next(
            i for i in range(i_id, i_akhir) if '"penanggungJawab":' in baris[i]
        )
        baru = []
        if entri["penandatanganNama"]:
            baru.append(
                f'    "penandatanganNama": {json.dumps(entri["penandatanganNama"], ensure_ascii=False)},'
            )
            disisip["penandatanganNama"] += 1
        if entri["penandatanganJabatan"]:
            baru.append(
                f'    "penandatanganJabatan": {json.dumps(entri["penandatanganJabatan"], ensure_ascii=False)},'
            )
        for field in ("jenisBmn", "lokasiBmn", "ukuranBmn", "luasBmn", "dasarNilai"):
            if entri.get(field):
                baru.append(
                    f'    "{field}": {json.dumps(entri[field], ensure_ascii=False)},'
                )
        if any(entri.get(f) for f in ("jenisBmn", "lokasiBmn", "ukuranBmn", "luasBmn", "dasarNilai")):
            disisip["bmn"] += 1
        baris[i_pj + 1 : i_pj + 1] = baru
        i_akhir += len(baru)
        # 2) Field layanan — sisipkan setelah tiap baris "subtotal" di blok ini.
        i_sub = [
            i
            for i in range(i_id, i_akhir)
            if re.match(r'        "subtotal": [0-9.]+,?$', baris[i])
        ]
        if len(i_sub) != len(entri["layanan"]):
            print(f"GAGAL: {key}: subtotal di seed={len(i_sub)} layanan file={len(entri['layanan'])}")
            sys.exit(1)
        # Sisip dari belakang supaya indeks tidak bergeser.
        for lay_file, i_s in zip(reversed(entri["layanan"]), reversed(i_sub)):
            # Baris subtotal yang menjadi field terakhir layanan tidak
            # diakhiri koma di seed — tambahkan dulu sebelum menyisip.
            if not baris[i_s].rstrip().endswith(","):
                baris[i_s] = baris[i_s] + ","
            sisip = []
            if lay_file["realisasi"] is not None:
                sisip.append(f'        "realisasi": {float(lay_file["realisasi"])!r},')
                disisip["realisasi"] += 1
            if lay_file["jenisWaktu"] in ("Prime Time", "Regular Time"):
                sisip.append(
                    f'        "jenisWaktu": {json.dumps(lay_file["jenisWaktu"], ensure_ascii=False)},'
                )
                disisip["jenisWaktu"] += 1
            baris[i_s + 1 : i_s + 1] = sisip

    SEED.write_text("\n".join(baris), encoding="utf-8")
    print(f"patch selesai: {disisip}")
    print(f"file: {SEED}")


if __name__ == "__main__":
    if "--ekstrak" in sys.argv:
        ekstrak()
    elif "--patch" in sys.argv:
        patch()
    else:
        print("pakai: --ekstrak | --patch")
        sys.exit(2)

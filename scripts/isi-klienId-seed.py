#!/usr/bin/env python3
"""Add denormalized `klienId` to tagihan/pembayaran/denda/dokumen records
in src/lib/seedNyata.ts (two roles, 19/11/2026).

WHY THIS SCRIPT EXISTS (do not regenerate blindly): the seed file is NO
LONGER the verbatim output of scripts/impor-data-nyata/impor.mjs — it
carries post-generation edits (PR #52 contract replacement, PR #57
Adlibs fix, PR #63 stored fields, operator attribution, MoU/Commitment
imports). Re-running impor.mjs would DESTROY those edits, so klienId is
added by this targeted patch instead: it inserts exactly one line per
record (`"klienId": "KLN-xxx",` right after the `"id"` line) and changes
nothing else. If impor.mjs is ever re-run, run this script again right
after it.

Derivation (from parent links already in the seed):
- tagihan.klienId   <- kontrak[kontrakId].klienId
- dokumen.klienId   <- kontrak[kontrakId].klienId
- pembayaran.klienId <- tagihan[tagihanId] -> kontrak.klienId
- denda.klienId     <- tagihan[tagihanId] -> kontrak.klienId

Idempotent: records that already carry the CORRECT klienId are skipped;
a record carrying a WRONG klienId fails the run (never silently
overwritten). Verification (exit non-zero on failure):
- counts: 42 tagihan, 45 pembayaran, 12 denda, 102 dokumen;
- every record's klienId matches its parent chain;
- control totals unchanged: 42 kontrak Rp441.863.375, pembayaran
  Rp362.329.255, denda Rp6.219.250;
- the diff is ONLY added klienId lines (every original line present
  in order, nothing else changed).

Usage:
  python3 scripts/isi-klienId-seed.py
"""
import json
import re
import sys
from pathlib import Path

SEED = Path(__file__).resolve().parent.parent / "src/lib/seedNyata.ts"

# Control totals (seed, verified 2026-11-16) — must not change.
JUMLAH_KONTRAK = 42
NILAI_KONTRAK = 441863375
TOTAL_PEMBAYARAN = 362329255
TOTAL_DENDA = 6219250
HITUNGAN = {"tagihan": 42, "pembayaran": 45, "denda": 12, "dokumen": 102}


def extract_array(txt, key):
    """Extract one top-level array from the TS file and parse it as JSON."""
    i = txt.index(f"  {key}: [")
    j = txt.index("[", i)
    depth = 0
    k = j
    in_str = False
    esc = False
    while True:
        c = txt[k]
        if in_str:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == '"':
                in_str = False
        else:
            if c == '"':
                in_str = True
            elif c == "[":
                depth += 1
            elif c == "]":
                depth -= 1
                if depth == 0:
                    break
        k += 1
    body = txt[j : k + 1]
    body = body.replace("\\'", "'")  # TS escape, invalid in JSON
    body = re.sub(r",(\s*[\}\]])", r"\1", body)  # trailing commas
    return json.loads(body), j, k + 1


def main() -> int:
    txt = SEED.read_text(encoding="utf-8")
    klien, _, _ = extract_array(txt, "klien")
    kontrak, _, _ = extract_array(txt, "kontrak")
    tagihan, _, _ = extract_array(txt, "tagihan")
    pembayaran, _, _ = extract_array(txt, "pembayaran")
    denda, _, _ = extract_array(txt, "denda")
    dokumen, _, _ = extract_array(txt, "dokumen")

    klien_kontrak = {c["id"]: c["klienId"] for c in kontrak}
    klien_tagihan = {}
    for t in tagihan:
        kid = klien_kontrak.get(t["kontrakId"])
        assert kid, f"tagihan {t['id']}: kontrakId {t['kontrakId']} tidak ada"
        klien_tagihan[t["id"]] = kid

    # Expected klienId per record id, per collection.
    diharapkan = {
        "tagihan": {t["id"]: klien_kontrak[t["kontrakId"]] for t in tagihan},
        "dokumen": {d["id"]: klien_kontrak[d["kontrakId"]] for d in dokumen},
        "pembayaran": {
            p["id"]: klien_tagihan[p["tagihanId"]] for p in pembayaran
        },
        "denda": {d["id"]: klien_tagihan[d["tagihanId"]] for d in denda},
    }
    for koleksi, jumlah in HITUNGAN.items():
        assert len(diharapkan[koleksi]) == jumlah, (
            koleksi,
            len(diharapkan[koleksi]),
            jumlah,
        )

    # Insert one `"klienId": ...` line after each record's `"id"` line.
    # Operates on raw text so every other line stays byte-identical.
    baru = txt
    ditambah = 0
    dilewati = 0
    for koleksi in ("tagihan", "pembayaran", "denda", "dokumen"):
        i = baru.index(f"  {koleksi}: [")
        j = baru.index("[", i)
        # end of this array: first line that is exactly "]," (column 0)
        # after j — top-level arrays close unindented in this file.
        m = re.search(r"(?m)^\],$", baru[j:])
        akhir = j + m.start()
        bagian = baru[j:akhir]
        # Existing klienId lines (idempotency check) — map id -> klienId.
        sudah = dict(
            re.findall(
                r'"id": "([^"]+)",\n    "klienId": "([^"]+)",', bagian
            )
        )
        for rid, kid in sudah.items():
            if diharapkan[koleksi].get(rid) != kid:
                print(
                    f"GAGAL: {koleksi} {rid} sudah punya klienId {kid}, "
                    f"diharapkan {diharapkan[koleksi].get(rid)}",
                    file=sys.stderr,
                )
                return 1
        def sisip(mo):
            nonlocal ditambah, dilewati
            rid = mo.group(2)
            kid = diharapkan[koleksi][rid]
            if rid in sudah:
                dilewati += 1
                return mo.group(0)
            ditambah += 1
            return mo.group(0) + f'\n    "klienId": "{kid}",'
        bagian_baru = re.sub(
            r'(?m)^(    "id": "([^"]+)",)$', sisip, bagian
        )
        baru = baru[:j] + bagian_baru + baru[akhir:]

    # Verification: re-parse the patched file and check everything.
    klien2, _, _ = extract_array(baru, "klien")
    kontrak2, _, _ = extract_array(baru, "kontrak")
    tagihan2, _, _ = extract_array(baru, "tagihan")
    pembayaran2, _, _ = extract_array(baru, "pembayaran")
    denda2, _, _ = extract_array(baru, "denda")
    dokumen2, _, _ = extract_array(baru, "dokumen")
    assert len(kontrak2) == JUMLAH_KONTRAK
    assert sum(c["nilaiKontrak"] for c in kontrak2) == NILAI_KONTRAK
    assert sum(p["jumlah"] for p in pembayaran2) == TOTAL_PEMBAYARAN
    assert sum(d["jumlah"] for d in denda2) == TOTAL_DENDA
    for koleksi, daftar in (
        ("tagihan", tagihan2),
        ("pembayaran", pembayaran2),
        ("denda", denda2),
        ("dokumen", dokumen2),
    ):
        assert len(daftar) == HITUNGAN[koleksi], (koleksi, len(daftar))
        for rec in daftar:
            assert rec.get("klienId") == diharapkan[koleksi][rec["id"]], (
                koleksi,
                rec["id"],
                rec.get("klienId"),
            )
    # Diff is ONLY added klienId lines.
    lama_lines = txt.splitlines()
    baru_lines = baru.splitlines()
    assert len(baru_lines) - len(lama_lines) == ditambah, (
        len(baru_lines),
        len(lama_lines),
        ditambah,
    )
    i = j = 0
    while i < len(lama_lines):
        if j < len(baru_lines) and baru_lines[j] == lama_lines[i]:
            i += 1
            j += 1
        else:
            assert re.fullmatch(
                r'    "klienId": "KLN-\d{3}",', baru_lines[j]
            ), baru_lines[j]
            j += 1
    assert j == len(baru_lines)

    SEED.write_text(baru, encoding="utf-8")
    print(
        f"seedNyata.ts: klienId ditambah {ditambah} baris "
        f"(dilewati {dilewati} yang sudah benar) — "
        f"tagihan {HITUNGAN['tagihan']}, pembayaran {HITUNGAN['pembayaran']}, "
        f"denda {HITUNGAN['denda']}, dokumen {HITUNGAN['dokumen']}; "
        f"total kontrol tidak berubah "
        f"(kontrak {JUMLAH_KONTRAK} Rp{NILAI_KONTRAK:,}, "
        f"pembayaran Rp{TOTAL_PEMBAYARAN:,}, denda Rp{TOTAL_DENDA:,})"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

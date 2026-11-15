// Modul Lacak — halaman PUBLIK "Lacak Kerja Sama" (tanpa login, tanpa akun).
//
// KOREKSI 2026-11-15: klien TIDAK perlu akses login atau akun. Keputusan ini
// merevisi jawaban Q-10 (PIC daftar sendiri + login portal + timeline) dan
// sebagian Fase C (peran 'klien', registrasi PIC, approval akun, Portal.tsx).
// Penggantinya: klien memasukkan KODE TRANSAKSI lalu melihat detail kerja
// sama dari nomor itu saja.
//
// KODE TRANSAKSI (keputusan 2026-11-15 11:22 WIB) = nomor PKS atau nomor
// tagihan YANG SUDAH ADA (bukan kode acak baru). Halaman ini menerima nomor
// PKS ATAU nomor tagihan; yang tampil hanya data kerja sama dari nomor itu
// (kontrak, dokumen, invoice/billing, kwitansi, bukti siaran) — tanpa
// daftar, tanpa pencarian nama/institusi, tanpa jalan ke kerja sama lain.
// Trade-off yang diterima pengguna: nomor PKS/tagihan yang berurutan bisa
// ditebak — siapa pun yang memegang nomornya bisa melihat data kerja sama
// itu; mitigasinya hanya data nomor itu yang tampil.
//
// Pola rendering dipakai ulang dari Portal.tsx (timeline, StatCard, tabel
// dokumen, peringatan "Menunggu diterbitkan") — tanpa form submission,
// tanpa "Pengajuan saya", tanpa login.
//
// TITIK INTEGRASI MODE FIRESTORE:
// Data diterima lewat prop `data`. Dalam mode contoh, App.tsx memberi
// DATA_NYATA (seed). Dalam mode Firestore, App.tsx kelak memberi data hasil
// Cloud Function lacakKerjaSama / get-by-ID — komponen ini tidak memanggil
// Firestore langsung.
//
// Palet HANYA 3 warna RRI: Biru #2573E2, Navy #0D2569, Putih #FFFFFF.
// Status dibedakan teks & ikon (StatusBadge), bukan warna baru.

import { useState } from 'react';
import type { FormEvent } from 'react';
import { FileText } from 'lucide-react';
import type {
  AppData,
  DokumenItem,
  Kontrak,
  Pembayaran,
  Tagihan,
} from '../lib/types';
import { formatRupiah, formatTanggal } from '../lib/format';
import {
  Baris,
  JudulBagian,
  Kartu,
  Label,
  Peringatan,
  PesanKosong,
  StatCard,
  StatusBadge,
  Tabel,
  Td,
  Th,
  TombolSekunder,
  TombolUtama,
  inputClass,
} from '../components/ui';

export interface LacakProps {
  data: AppData;
  onKembali: () => void;
}

export interface HasilLacak {
  kontrak: Kontrak;
  tagihan: Tagihan[];
  dokumen: DokumenItem[];
  /** Semua pembayaran atas tagihan kontrak ini (semua status verifikasi). */
  pembayaran: Pembayaran[];
}

interface PeristiwaTimeline {
  tanggal: string;
  label: string;
  detail: string;
  status?: string;
}

const PESAN_TIDAK_DITEMUKAN =
  'Nomor tidak ditemukan. Periksa kembali nomor PKS atau nomor tagihan Anda, atau hubungi Operator (Layanan & Pengembangan Usaha).';

/** Normalisasi kode: buang spasi ujung dan abaikan huruf besar/kecil. */
function normalisasiKode(kode: string): string {
  return kode.trim().toLowerCase();
}

/**
 * Cari kerja sama berdasarkan kode transaksi (nomor PKS atau nomor tagihan).
 * Urutan pencarian: (1) Kontrak yang `nomorPks`-nya sama dengan kode;
 * (2) bila tidak ada, Tagihan yang `nomor`-nya sama dengan kode, lalu ambil
 * kontrak lewat `kontrakId`-nya; (3) bila keduanya tidak ada, null.
 * Perbandingan tidak case-sensitive. `kontrakId` pada Tagihan/Dokumen bisa
 * berisi `id` kontrak maupun `nomorPks`-nya (di data impor keduanya sama),
 * jadi keduanya dicocokkan.
 */
export function cariKerjaSama(
  data: AppData,
  kode: string,
): HasilLacak | null {
  const kodeNormal = normalisasiKode(kode);
  if (kodeNormal === '') return null;

  const cocokKontrak = (k: Kontrak) =>
    normalisasiKode(k.nomorPks) === kodeNormal ||
    normalisasiKode(k.id) === kodeNormal;

  let kontrak = data.kontrak.find(cocokKontrak) ?? null;
  if (!kontrak) {
    const tagihan = data.tagihan.find(
      (t) => normalisasiKode(t.nomor) === kodeNormal,
    );
    if (!tagihan) return null;
    kontrak =
      data.kontrak.find(
        (k) =>
          k.id === tagihan.kontrakId || k.nomorPks === tagihan.kontrakId,
      ) ?? null;
    if (!kontrak) return null;
  }

  const tagihan = data.tagihan.filter((t) => t.kontrakId === kontrak.id || t.kontrakId === kontrak.nomorPks);
  const tagihanIds = new Set(tagihan.map((t) => t.id));
  const dokumen = data.dokumen.filter(
    (d) => d.kontrakId === kontrak.id || d.kontrakId === kontrak.nomorPks,
  );
  const pembayaran = data.pembayaran.filter((p) =>
    tagihanIds.has(p.tagihanId),
  );
  return { kontrak, tagihan, dokumen, pembayaran };
}

export default function Lacak({ data, onKembali }: LacakProps) {
  const [kode, setKode] = useState('');
  const [hasil, setHasil] = useState<HasilLacak | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);

  const lacak = (e: FormEvent) => {
    e.preventDefault();
    if (kode.trim() === '') {
      setHasil(null);
      setPesan('Masukkan nomor PKS atau nomor tagihan terlebih dahulu.');
      return;
    }
    const ditemukan = cariKerjaSama(data, kode);
    setHasil(ditemukan);
    setPesan(ditemukan ? null : PESAN_TIDAK_DITEMUKAN);
  };

  const kontrak = hasil?.kontrak ?? null;
  const klien = kontrak
    ? data.klien.find((k) => k.id === kontrak.klienId)
    : undefined;

  const tagihan = hasil?.tagihan ?? [];
  const dokumen = hasil?.dokumen ?? [];
  const pembayaranTerverifikasi = (hasil?.pembayaran ?? []).filter(
    (p) => p.statusVerifikasi === 'Terverifikasi',
  );
  const totalTagihan = tagihan.reduce((jumlah, t) => jumlah + t.nilai, 0);
  const totalPembayaranTerverifikasi = pembayaranTerverifikasi.reduce(
    (jumlah, p) => jumlah + p.jumlah,
    0,
  );
  const sisaPiutang = totalTagihan - totalPembayaranTerverifikasi;

  // Timeline: hanya peristiwa bertanggal milik kontrak ini, terbaru dulu.
  // "Billing" dan "invoice" adalah tagihan yang sama di aplikasi ini
  // (Tagihan) — label ditulis "Invoice / billing" supaya cocok dengan
  // istilah Q-10 tanpa menduplikasi entitas.
  const peristiwa: PeristiwaTimeline[] = kontrak
    ? [
        {
          tanggal: kontrak.tanggalTandaTangan ?? kontrak.tanggalMulai,
          label: `Kontrak ${kontrak.nomorPks} ditandatangani`,
          detail: `${kontrak.kategoriLayanan} — ${formatRupiah(kontrak.nilaiKontrak)}`,
          status: kontrak.status,
        },
        ...tagihan.map((t) => ({
          tanggal: t.tanggalTerbit,
          label: `Invoice / billing ${t.nomor} diterbitkan`,
          detail: `${t.uraian} — ${formatRupiah(t.nilai)} • jatuh tempo ${formatTanggal(t.tanggalJatuhTempo)}`,
        })),
        ...pembayaranTerverifikasi.map((p) => {
          const tagihanTerkait = tagihan.find((t) => t.id === p.tagihanId);
          return {
            tanggal: p.tanggalBayar,
            label: 'Pembayaran terverifikasi',
            detail: `${formatRupiah(p.jumlah)} • ${p.metode}${tagihanTerkait ? ` • untuk ${tagihanTerkait.nomor}` : ''}`,
            status: 'Terverifikasi',
          };
        }),
        ...dokumen
          .filter((d) => d.status === 'Ada' && d.tanggalUnggah)
          .map((d) => ({
            tanggal: d.tanggalUnggah as string,
            label: `${d.jenisDokumen} diterbitkan`,
            detail: `Kontrak ${kontrak.nomorPks}`,
            status: 'Ada',
          })),
      ].sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1))
    : [];

  // Kwitansi & bukti siaran yang belum diterbitkan (status bukan 'Ada').
  // Dicocokkan dengan `includes` karena di data impor jenisnya tertulis
  // "Kwitansi Pembayaran", bukan "Kwitansi" persis (Portal memakai
  // perbandingan persis sehingga tidak menangkap varian ini).
  const dokumenMenunggu = dokumen.filter(
    (d) =>
      (d.jenisDokumen.includes('Kwitansi') ||
        d.jenisDokumen.includes('Bukti Siaran')) &&
      d.status !== 'Ada',
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="flex flex-wrap items-center gap-4 border-b border-[#2573e2]/15 px-6 py-4">
        <img src="/logo-rri.svg" alt="Logo RRI" className="h-9 w-auto" />
        <div>
          <h1 className="text-xl font-bold text-[#0d2569]">
            Lacak Kerja Sama
          </h1>
          <p className="text-sm text-[#0d2569]/70">
            Lacak status kerja sama Anda dengan nomor PKS atau nomor tagihan —
            tanpa login.
          </p>
        </div>
        <div className="ml-auto">
          <TombolSekunder onClick={onKembali}>Kembali ke Masuk</TombolSekunder>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-6">
        <Kartu>
          <form onSubmit={lacak} className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div>
              <Label>Nomor PKS atau nomor tagihan</Label>
              <input
                className={inputClass}
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                placeholder="Contoh: 0603/PKS/RRI.PLB/01/2026"
                autoComplete="off"
              />
            </div>
            <div className="flex items-end">
              <TombolUtama type="submit">Lacak</TombolUtama>
            </div>
          </form>
          {pesan !== null && (
            <div className="mt-4">
              <Peringatan teks={pesan} />
            </div>
          )}
        </Kartu>

        {kontrak && (
          <>
            <Kartu>
              <JudulBagian>Ringkasan kerja sama</JudulBagian>
              <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold text-[#0d2569]/60">
                    Klien
                  </dt>
                  <dd className="font-semibold text-[#0d2569]">
                    {klien?.nama ?? '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[#0d2569]/60">
                    Nomor PKS
                  </dt>
                  <dd className="font-semibold text-[#0d2569]">
                    {kontrak.nomorPks}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[#0d2569]/60">
                    Status kontrak
                  </dt>
                  <dd className="mt-0.5">
                    <StatusBadge status={kontrak.status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[#0d2569]/60">
                    Nilai kontrak
                  </dt>
                  <dd className="font-semibold text-[#0d2569]">
                    {formatRupiah(kontrak.nilaiKontrak)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[#0d2569]/60">
                    Periode
                  </dt>
                  <dd className="text-[#0d2569]">
                    {formatTanggal(kontrak.tanggalMulai)} —{' '}
                    {formatTanggal(kontrak.tanggalSelesai)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[#0d2569]/60">
                    Layanan
                  </dt>
                  <dd className="text-[#0d2569]">
                    {kontrak.kategoriLayanan}
                    {kontrak.jenisPnBP ? ` • PNBP ${kontrak.jenisPnBP}` : ''}
                  </dd>
                </div>
              </dl>
            </Kartu>

            <div className="grid gap-4 md:grid-cols-4">
              <StatCard
                label="Nilai kontrak"
                nilai={formatRupiah(kontrak.nilaiKontrak)}
                keterangan={`Kontrak ${kontrak.nomorPks}`}
              />
              <StatCard
                label="Total tagihan"
                nilai={formatRupiah(totalTagihan)}
                keterangan={`${tagihan.length} invoice / billing diterbitkan`}
              />
              <StatCard
                label="Pembayaran terverifikasi"
                nilai={formatRupiah(totalPembayaranTerverifikasi)}
                keterangan={`${pembayaranTerverifikasi.length} pembayaran terverifikasi`}
              />
              <StatCard
                label="Sisa piutang"
                nilai={formatRupiah(sisaPiutang)}
                keterangan="Total tagihan dikurangi pembayaran terverifikasi"
              />
            </div>

            <Kartu>
              <JudulBagian>Timeline kerja sama</JudulBagian>
              {peristiwa.length === 0 ? (
                <p className="mt-3">
                  <PesanKosong teks="Belum ada peristiwa kerja sama untuk nomor ini." />
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {peristiwa.map((p, i) => (
                    <li
                      key={`${p.tanggal}-${p.label}-${i}`}
                      className="flex gap-3 border-b border-[#2573e2]/10 pb-3 last:border-0 last:pb-0"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#2573e2]/10 text-[#2573e2]">
                        <FileText size={16} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#0d2569]">
                          {p.label}
                        </p>
                        <p className="text-sm text-[#0d2569]/70">{p.detail}</p>
                        <p className="mt-1 text-xs text-[#0d2569]/60">
                          {formatTanggal(p.tanggal)}
                          {p.status ? ` • ${p.status}` : ''}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {dokumenMenunggu.length > 0 && (
                <div className="mt-4">
                  <Peringatan
                    teks={`Menunggu diterbitkan: ${dokumenMenunggu
                      .map((d) => `${d.jenisDokumen} (kontrak ${kontrak.nomorPks})`)
                      .join('; ')}.`}
                  />
                </div>
              )}
            </Kartu>

            <Kartu>
              <JudulBagian>Dokumen kerja sama</JudulBagian>
              {dokumen.length === 0 ? (
                <p className="mt-3">
                  <PesanKosong teks="Belum ada dokumen untuk nomor ini." />
                </p>
              ) : (
                <Tabel>
                  <thead>
                    <tr>
                      <Th>Jenis dokumen</Th>
                      <Th>Kontrak</Th>
                      <Th>Status</Th>
                      <Th>Tanggal unggah</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {dokumen.map((d) => (
                      <Baris key={d.id}>
                        <Td>{d.jenisDokumen}</Td>
                        <Td>{kontrak.nomorPks}</Td>
                        <Td>
                          <StatusBadge status={d.status} />
                        </Td>
                        <Td>
                          {d.tanggalUnggah
                            ? formatTanggal(d.tanggalUnggah)
                            : '-'}
                        </Td>
                      </Baris>
                    ))}
                  </tbody>
                </Tabel>
              )}
            </Kartu>
          </>
        )}
      </main>
    </div>
  );
}

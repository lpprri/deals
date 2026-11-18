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
// TITIK INTEGRASI MODE FIRESTORE (wiring PR #29):
// Data diterima lewat prop `data` (seed, mode contoh). Bila prop
// `modeLive` benar (Firebase terkonfigurasi — App.tsx memberi
// `isFirebaseConfigured && !!db`), pencarian memanggil Cloud Function
// `lacakKerjaSama` dulu (src/lib/lacakFunction.ts): Function mengembalikan
// SATU kontrak + daftar terkait + klien dari Firestore live. Bila
// Function belum di-deploy / tidak bisa dihubungi, pencarian jatuh ke
// data seed dan komponen menampilkan catatan jujur bahwa yang tampil
// adalah data contoh. Bila Function menjawab "tidak ditemukan", nomor
// memang tidak ada — tidak ada fallback ke seed.
//
// Palet HANYA 3 warna RRI: Biru #2573E2, Navy #0D2569, Putih #FFFFFF.
// Status dibedakan teks & ikon (StatusBadge), bukan warna baru.
//
// REDESAIN GAYA 2026-11-18 (permintaan pengguna, dari screenshot):
// tampilan mengikuti gaya login page (PR #99) — kolom tunggal terpusat
// ~400px, latar off-white #f5f2f2 + gradasi pucat biru/navy di bawah,
// logo lockup RRI lengkap h-20, field pill + tombol pill biru
// full-width, tombol "Back to Landing Page" di kiri atas. HANYA gaya:
// semua copy/teks dan logika lacak (Function + fallback contoh) TIDAK
// berubah. Hasil lacak tetap di dalam kolom tengah yang sama; grid
// StatCard 4 kolom jadi 2 kolom dan tabel dokumen dibungkus
// overflow-x-auto supaya muat di kolom 400px.

import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { LOGO_RRI_LOCKUP_DATA_URI } from '../lib/logoRriLockup';
import type {
  AppData,
  DokumenItem,
  Klien,
  Kontrak,
  Pembayaran,
  Tagihan,
} from '../lib/types';
import { formatRupiah, formatTanggal } from '../lib/format';
import {
  labelJenisDokumen,
  labelJenisPnBP,
  labelKategoriLayanan,
  labelMetodePembayaran,
  labelStatusDokumen,
  labelStatusKontrak,
  labelStatusVerifikasi,
} from '../lib/labels';
import {
  Baris,
  JudulBagian,
  Kartu,
  Peringatan,
  PesanKosong,
  StatCard,
  StatusBadge,
  Tabel,
  Td,
  Th,
} from '../components/ui';

export interface LacakProps {
  data: AppData;
  onKembali: () => void;
  /** Benar bila Firebase terkonfigurasi — Lacak memakai Cloud Function. */
  modeLive?: boolean;
}

export interface HasilLacak {
  kontrak: Kontrak;
  /** Klien pemilik kontrak; null bila belum tercatat. */
  klien?: Klien | null;
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
  'Number not found. Please check your PKS or invoice number again, or contact the Operator (Service & Business Development).';

/** Label Inggris untuk status yang tampil di timeline (nilai tersimpan). */
function labelStatusTimeline(status: string): string {
  for (const fn of [
    labelStatusKontrak,
    labelStatusVerifikasi,
    labelStatusDokumen,
  ]) {
    const mapped = fn(status);
    if (mapped !== status) return mapped;
  }
  return status;
}

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
  return {
    kontrak,
    klien: data.klien.find((k) => k.id === kontrak.klienId) ?? null,
    tagihan,
    dokumen,
    pembayaran,
  };
}

export default function Lacak({ data, onKembali, modeLive = false }: LacakProps) {
  const [kode, setKode] = useState('');
  const [hasil, setHasil] = useState<HasilLacak | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [mencari, setMencari] = useState(false);
  /** 'fungsi' = data live Firestore; 'contoh' = fallback data seed. */
  const [sumber, setSumber] = useState<'fungsi' | 'contoh' | null>(null);

  const lacak = async (e: FormEvent) => {
    e.preventDefault();
    if (mencari) return;
    if (kode.trim() === '') {
      setHasil(null);
      setPesan('Enter your PKS or invoice number first.');
      setSumber(null);
      return;
    }
    if (modeLive) {
      setMencari(true);
      try {
        // Import LAZY: Firebase SDK (lacakFunction) hanya dimuat saat
        // pencarian live benar-benar dilakukan — dan skrip cek yang
        // mengimpor modul ini tidak ikut membundel Firebase SDK.
        const { lacakViaFunction } = await import('../lib/lacakFunction');
        const dariFungsi = await lacakViaFunction(kode);
        setMencari(false);
        if (dariFungsi) {
          setHasil(dariFungsi);
          setPesan(null);
          setSumber('fungsi');
          return;
        }
        // Function menjawab "tidak ditemukan" — nomor memang tidak ada.
        setHasil(null);
        setPesan(PESAN_TIDAK_DITEMUKAN);
        setSumber(null);
        return;
      } catch (err) {
        // Function belum di-deploy / tidak bisa dihubungi — fallback ke
        // data seed dengan catatan jujur (bukan klaim data live).
        console.error(
          'Lacak via Cloud Function gagal, memakai data contoh:',
          err,
        );
        setMencari(false);
      }
    }
    const ditemukan = cariKerjaSama(data, kode);
    setHasil(ditemukan);
    setPesan(ditemukan ? null : PESAN_TIDAK_DITEMUKAN);
    setSumber(ditemukan && modeLive ? 'contoh' : null);
  };

  const kontrak = hasil?.kontrak ?? null;
  // Nama klien: dari Function bila ada, bila tidak dari data seed.
  const klien = kontrak
    ? hasil?.klien ??
      data.klien.find((k) => k.id === kontrak.klienId)
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
          label: `Contract ${kontrak.nomorPks} signed`,
          detail: `${labelKategoriLayanan(kontrak.kategoriLayanan)} — ${formatRupiah(kontrak.nilaiKontrak)}`,
          status: kontrak.status,
        },
        ...tagihan.map((t) => ({
          tanggal: t.tanggalTerbit,
          label: `Invoice / billing ${t.nomor} issued`,
          detail: `${t.uraian} — ${formatRupiah(t.nilai)} • due ${formatTanggal(t.tanggalJatuhTempo)}`,
        })),
        ...pembayaranTerverifikasi.map((p) => {
          const tagihanTerkait = tagihan.find((t) => t.id === p.tagihanId);
          return {
            tanggal: p.tanggalBayar,
            label: 'Verified payment',
            detail: `${formatRupiah(p.jumlah)} • ${labelMetodePembayaran(p.metode)}${tagihanTerkait ? ` • for ${tagihanTerkait.nomor}` : ''}`,
            status: 'Terverifikasi',
          };
        }),
        ...dokumen
          .filter((d) => d.status === 'Ada' && d.tanggalUnggah)
          .map((d) => ({
            tanggal: d.tanggalUnggah as string,
            label: `${labelJenisDokumen(d.jenisDokumen)} issued`,
            detail: `Contract ${kontrak.nomorPks}`,
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f2f2] px-4 py-16">
      {/* Gradasi pucat biru/navy di bagian bawah (pola yang sama seperti
          halaman login) — dekoratif saja. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-[#2573e2]/15 via-[#0d2569]/10 to-transparent"
      />

      {/* Tombol sudut kiri atas kembali ke landing page (pola login). */}
      <button
        type="button"
        onClick={onKembali}
        className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-[#0d2569]/15 bg-white/80 px-3 py-2 text-xs font-semibold text-[#0d2569] hover:border-[#2573e2] hover:text-[#2573e2] sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Back to Landing Page
      </button>

      {/* Kolom terpusat ~400px (pola login). */}
      <div className="relative w-full max-w-[400px]">
        <div className="text-center">
          {/* Logo lockup lengkap RRI (mark + teks di dalam gambar),
              h-20 seperti login. */}
          <img
            src={LOGO_RRI_LOCKUP_DATA_URI}
            alt="Logo RRI"
            className="mx-auto h-20 w-auto"
          />
        </div>

        <h1 className="mt-8 text-center text-3xl font-bold text-[#0d2569]">
          Track Partnership
        </h1>
        <p className="mt-2 text-center text-sm text-[#0d2569]/70">
          Track your partnership status with your PKS or invoice number —
          no sign-in required.
        </p>

        <form onSubmit={lacak} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="lacak-kode"
              className="mb-1.5 block text-sm font-bold text-[#0d2569]"
            >
              PKS or invoice number
            </label>
            <input
              id="lacak-kode"
              className="w-full rounded-full border border-[#0d2569]/20 bg-white px-4 py-2.5 text-sm text-[#0d2569] outline-none placeholder:text-[#0d2569]/40 focus:border-[#2573e2] focus:ring-2 focus:ring-[#2573e2]/20"
              value={kode}
              onChange={(e) => setKode(e.target.value)}
              placeholder="Example: 0603/PKS/RRI.PLB/01/2026"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={mencari}
            className="w-full rounded-full bg-[#2573e2] px-4 py-3 text-sm font-bold text-white hover:bg-[#0d2569] disabled:opacity-60"
          >
            {mencari ? 'Searching…' : 'Track'}
          </button>
        </form>
        {sumber === 'fungsi' && (
          <p className="mt-3 text-xs text-[#0d2569]/60">
            Source: live Firestore data.
          </p>
        )}
        {sumber === 'contoh' && (
          <div className="mt-4">
            <Peringatan teks="Live lookup is unavailable (the Cloud Function has not been deployed yet) — showing sample data for this number." />
          </div>
        )}
        {pesan !== null && (
          <div className="mt-4">
            <Peringatan teks={pesan} />
          </div>
        )}

        {kontrak && (
          <div className="mt-6 space-y-6">
            <Kartu>
              <JudulBagian>Partnership summary</JudulBagian>
              <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold text-[#0d2569]/60">
                    Client
                  </dt>
                  <dd className="font-semibold text-[#0d2569]">
                    {klien?.nama ?? '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[#0d2569]/60">
                    PKS Number
                  </dt>
                  <dd className="font-semibold text-[#0d2569]">
                    {kontrak.nomorPks}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[#0d2569]/60">
                    Contract status
                  </dt>
                  <dd className="mt-0.5">
                    <StatusBadge status={kontrak.status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[#0d2569]/60">
                    Contract value
                  </dt>
                  <dd className="font-semibold text-[#0d2569]">
                    {formatRupiah(kontrak.nilaiKontrak)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[#0d2569]/60">
                    Period
                  </dt>
                  <dd className="text-[#0d2569]">
                    {formatTanggal(kontrak.tanggalMulai)} —{' '}
                    {formatTanggal(kontrak.tanggalSelesai)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[#0d2569]/60">
                    Service
                  </dt>
                  <dd className="text-[#0d2569]">
                    {labelKategoriLayanan(kontrak.kategoriLayanan)}
                    {kontrak.jenisPnBP ? ` • PNBP ${labelJenisPnBP(kontrak.jenisPnBP)}` : ''}
                  </dd>
                </div>
              </dl>
            </Kartu>

            <div className="grid grid-cols-2 gap-4">
              <StatCard
                label="Contract value"
                nilai={formatRupiah(kontrak.nilaiKontrak)}
                keterangan={`Contract ${kontrak.nomorPks}`}
              />
              <StatCard
                label="Total invoices"
                nilai={formatRupiah(totalTagihan)}
                keterangan={`${tagihan.length} invoices / billings issued`}
              />
              <StatCard
                label="Verified payments"
                nilai={formatRupiah(totalPembayaranTerverifikasi)}
                keterangan={`${pembayaranTerverifikasi.length} verified payments`}
              />
              <StatCard
                label="Outstanding receivables"
                nilai={formatRupiah(sisaPiutang)}
                keterangan="Total invoices minus verified payments"
              />
            </div>

            <Kartu>
              <JudulBagian>Partnership timeline</JudulBagian>
              {peristiwa.length === 0 ? (
                <p className="mt-3">
                  <PesanKosong teks="No partnership events for this number yet." />
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
                          {p.status ? ` • ${labelStatusTimeline(p.status)}` : ''}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {dokumenMenunggu.length > 0 && (
                <div className="mt-4">
                  <Peringatan
                    teks={`Awaiting issuance: ${dokumenMenunggu
                      .map((d) => `${labelJenisDokumen(d.jenisDokumen)} (contract ${kontrak.nomorPks})`)
                      .join('; ')}.`}
                  />
                </div>
              )}
            </Kartu>

            <Kartu>
              <JudulBagian>Partnership documents</JudulBagian>
              {dokumen.length === 0 ? (
                <p className="mt-3">
                  <PesanKosong teks="No documents for this number yet." />
                </p>
              ) : (
                <Tabel>
                  <thead>
                    <tr>
                      <Th>Document type</Th>
                      <Th>Contract</Th>
                      <Th>Status</Th>
                      <Th>Upload date</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {dokumen.map((d) => (
                      <Baris key={d.id}>
                        <Td>{labelJenisDokumen(d.jenisDokumen)}</Td>
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
          </div>
        )}
      </div>
    </div>
  );
}

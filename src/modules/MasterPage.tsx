// Master data — Fase A + Fase B (PRD v2.0 Final Bab 6.13).
// Tampilan READ-ONLY. Master hanya diubah Operator; nilai yang sudah dipakai
// transaksi tidak dapat dihapus, hanya dinonaktifkan. Perubahan master
// dilakukan di luar mode contoh ini (Fase A: tampil sebagai daftar).

import { useState } from 'react';
import type { ModulProps } from '../lib/store';
import {
  MASTER_JENIS_DOKUMEN,
  MASTER_JENIS_KLIEN,
  MASTER_KATEGORI_LAYANAN,
  MASTER_KODE_AKUN,
  MASTER_PROGRAMA,
  MASTER_STATUS_KONTRAK,
  MASTER_STATUS_ORDER,
  MASTER_STATUS_QUOTATION,
  MASTER_STATUS_TASK,
  MASTER_SUMBER_PROSPEK,
  MASTER_TAHAP_PENGAJUAN,
  MASTER_TAHAP_PIPELINE,
  SATKER_PILOT,
} from '../lib/master';
import {
  DAFTAR_SATKER,
  JUMLAH_SATKER_BERNOMOR,
} from '../lib/satker';
import {
  labelJenisDokumen,
  labelJenisKlien,
  labelJenisPnBP,
  labelKategoriLayanan,
  labelStatusKontrak,
  labelStatusOrder,
  labelStatusPersetujuan,
  labelStatusTask,
  labelSumberProspek,
  labelTahapPengajuan,
  labelTahapPipeline,
  labelUraianKodeAkun,
} from '../lib/labels';
import {
  Baris,
  JudulBagian,
  Kartu,
  Peringatan,
  Tabel,
  Td,
  Th,
  TombolUtama,
} from '../components/ui';

function DaftarNilai({
  judul,
  nilai,
  label,
}: {
  judul: string;
  nilai: string[];
  /** Pemeta label Inggris untuk nilai tersimpan (opsional; tanpa label, nilai tampil apa adanya). */
  label?: (nilai: string) => string;
}) {
  return (
    <Kartu>
      <JudulBagian>{judul}</JudulBagian>
      <ul className="mt-3 space-y-2">
        {nilai.map((n) => (
          <li
            key={n}
            className="rounded-md border border-[#2573e2]/20 bg-[#2573e2]/5 px-3 py-2 text-sm text-[#0d2569]"
          >
            {label ? label(n) : n}
          </li>
        ))}
      </ul>
    </Kartu>
  );
}

export interface HasilMigrasiUI {
  tanggal: string;
  jumlahPerKoleksi: Record<string, number>;
}

export interface MasterPageProps extends ModulProps {
  /**
   * Dipanggil saat tombol migrasi diklik. Koordinator menyambungkannya ke
   * `jalankanMigrasi` (src/lib/migrasi.ts). Halaman ini TIDAK memanggil
   * Firebase langsung.
   */
  onMigrasi?: () => Promise<HasilMigrasiUI>;
  /** Status migrasi dari Firestore (dokumen meta/migrasi). */
  statusMigrasi?: 'belum' | 'sudah' | 'tidak-tersedia';
  /** Tanggal migrasi (bila diketahui dari luar sesi ini). */
  tanggalMigrasi?: string;
}

function formatTanggalIso(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

/** Bagian "Migrasi ke Firestore" — migrasi satu kali data contoh. */
function BagianMigrasi({
  onMigrasi,
  statusMigrasi,
  tanggalMigrasi,
}: {
  onMigrasi?: () => Promise<HasilMigrasiUI>;
  statusMigrasi: 'belum' | 'sudah' | 'tidak-tersedia';
  tanggalMigrasi?: string;
}) {
  const [proses, setProses] = useState(false);
  const [hasil, setHasil] = useState<HasilMigrasiUI | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  const sudah = statusMigrasi === 'sudah' || hasil !== null;

  async function tanganiMigrasi() {
    if (!onMigrasi || proses || sudah) return;
    setProses(true);
    setGalat(null);
    try {
      const r = await onMigrasi();
      setHasil(r);
    } catch (e) {
      setGalat(
        e instanceof Error ? e.message : 'Migration failed. Try again.',
      );
    } finally {
      setProses(false);
    }
  }

  return (
    <Kartu>
      <JudulBagian>Migrate to Firestore</JudulBagian>
      {statusMigrasi === 'tidak-tersedia' ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Migration requires Firebase configuration. First complete the six
          VITE_FIREBASE_* variables in Vercel, then redeploy, and return to
          this page.
        </p>
      ) : sudah ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Already migrated on{' '}
          {hasil
            ? formatTanggalIso(hasil.tanggal)
            : tanggalMigrasi
              ? formatTanggalIso(tanggalMigrasi)
              : 'the recorded date'}
          . Migration can only be done once.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Writes all sample data (clients, contracts, invoices, payments,
            leases, submissions, and Phase B data) to Firestore, along with
            the operator profile. Migration can only be done once — after it
            succeeds, this button is disabled.
          </p>
          <div className="mt-3">
            <TombolUtama onClick={tanganiMigrasi} disabled={proses || !onMigrasi}>
              {proses ? 'Migrating data…' : 'Migrate sample data to Firestore'}
            </TombolUtama>
          </div>
        </>
      )}

      {galat && (
        <div className="mt-3">
          <Peringatan teks={galat} />
        </div>
      )}

      {hasil && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#0d2569]">
            Migration succeeded on {formatTanggalIso(hasil.tanggal)}.
          </p>
          <Tabel>
            <thead>
              <tr>
                <Th>Collection</Th>
                <Th kanan>Document count</Th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(hasil.jumlahPerKoleksi).map(([koleksi, jumlah]) => (
                <Baris key={koleksi}>
                  <Td>{koleksi}</Td>
                  <Td kanan>{jumlah}</Td>
                </Baris>
              ))}
            </tbody>
          </Tabel>
        </div>
      )}
    </Kartu>
  );
}

export default function MasterPage(props: MasterPageProps) {
  const { onMigrasi, statusMigrasi = 'tidak-tersedia', tanggalMigrasi } = props;
  return (
    <div className="space-y-6">
      <p className="text-sm text-[#0d2569]/70">
        Master data is the application&apos;s single source of truth (one
        account code = one classification). This page only displays master
        data — changes are made by the Operator.
      </p>

      <BagianMigrasi
        onMigrasi={onMigrasi}
        statusMigrasi={statusMigrasi}
        tanggalMigrasi={tanggalMigrasi}
      />

      <Peringatan teks="Master data is only changed by the Operator; values already used by transactions cannot be deleted, only deactivated." />

      {/* Kode Akun */}
      <Kartu>
        <JudulBagian>Account Codes</JudulBagian>
        <div className="mt-3">
          <Tabel>
            <thead>
              <tr>
                <Th>Code</Th>
                <Th>Description</Th>
                <Th>PNBP Type</Th>
              </tr>
            </thead>
            <tbody>
              {MASTER_KODE_AKUN.map((k) => (
                <Baris key={k.kode}>
                  <Td tebal>{k.kode}</Td>
                  <Td>{labelUraianKodeAkun(k.uraian)}</Td>
                  <Td>{labelJenisPnBP(k.jenisPnBP)}</Td>
                </Baris>
              ))}
            </tbody>
          </Tabel>
        </div>
      </Kartu>

      {/* Kategori Layanan */}
      <Kartu>
        <JudulBagian>Service Categories</JudulBagian>
        <div className="mt-3">
          <Tabel>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Account Code</Th>
                <Th>PNBP Type</Th>
              </tr>
            </thead>
            <tbody>
              {MASTER_KATEGORI_LAYANAN.map((k) => (
                <Baris key={k.nama}>
                  <Td>{labelKategoriLayanan(k.nama)}</Td>
                  <Td tebal>{k.kodeAkun}</Td>
                  <Td>{labelJenisPnBP(k.jenisPnBP)}</Td>
                </Baris>
              ))}
            </tbody>
          </Tabel>
        </div>
      </Kartu>

      {/* Daftar nilai master */}
      <div className="grid gap-6 md:grid-cols-2">
        <DaftarNilai judul="Programs" nilai={MASTER_PROGRAMA} />
        <DaftarNilai
          judul="Client Types"
          nilai={MASTER_JENIS_KLIEN}
          label={labelJenisKlien}
        />
        <DaftarNilai
          judul="Document Types"
          nilai={MASTER_JENIS_DOKUMEN}
          label={labelJenisDokumen}
        />
        <DaftarNilai
          judul="Contract Statuses"
          nilai={MASTER_STATUS_KONTRAK}
          label={labelStatusKontrak}
        />
        <DaftarNilai
          judul="Submission Stages"
          nilai={MASTER_TAHAP_PENGAJUAN}
          label={labelTahapPengajuan}
        />
        <DaftarNilai
          judul="Pipeline Stages"
          nilai={MASTER_TAHAP_PIPELINE}
          label={labelTahapPipeline}
        />
        <DaftarNilai
          judul="Prospect Sources"
          nilai={MASTER_SUMBER_PROSPEK}
          label={labelSumberProspek}
        />
        <DaftarNilai
          judul="Quotation Statuses"
          nilai={MASTER_STATUS_QUOTATION}
          label={labelStatusPersetujuan}
        />
        <DaftarNilai
          judul="Order Statuses"
          nilai={MASTER_STATUS_ORDER}
          label={labelStatusOrder}
        />
        <DaftarNilai
          judul="Task Statuses"
          nilai={MASTER_STATUS_TASK}
          label={labelStatusTask}
        />
      </div>

      {/* Daftar Satker */}
      <Kartu>
        <JudulBagian>Work Unit</JudulBagian>
        <p className="mt-2 text-sm text-[#0d2569]/70">
          {JUMLAH_SATKER_BERNOMOR} work units. Phase A pilot satker:{' '}
          <strong className="text-[#0d2569]">
            {SATKER_PILOT.nama} (code {SATKER_PILOT.kode})
          </strong>
          . Name spellings follow the source spreadsheet &ldquo;LAPORAN PNBP
          2026&rdquo; and await verification by head office.
        </p>
        <div className="mt-3 max-h-96 overflow-auto rounded-md border border-[#2573e2]/20">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <Th className="sticky top-0 bg-white pl-3">No</Th>
                <Th className="sticky top-0 bg-white">Satker Name</Th>
                <Th className="sticky top-0 bg-white">Regional Coordinator</Th>
              </tr>
            </thead>
            <tbody>
              {DAFTAR_SATKER.map((s) => (
                <Baris key={`${s.no}-${s.nama}`}>
                  <Td className="pl-3">{s.no ?? '—'}</Td>
                  <Td tebal>
                    {s.nama}
                    {s.nama === SATKER_PILOT.nama && (
                      <span className="ml-2 rounded bg-[#2573e2]/10 px-2 py-0.5 text-xs font-semibold text-[#0d2569]">
                        Pilot satker
                      </span>
                    )}
                  </Td>
                  <Td>{s.korwil ?? '—'}</Td>
                </Baris>
              ))}
            </tbody>
          </table>
        </div>
      </Kartu>
    </div>
  );
}

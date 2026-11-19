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
import { formatRupiah } from '../lib/format';
import { KOLEKSI_REMIGRASI } from '../lib/remigrasiRencana';
import type {
  HasilRemigrasi,
  KemajuanRemigrasi,
  TahapRemigrasi,
} from '../lib/remigrasi';
import type { PratinjauRemigrasi } from '../lib/remigrasiRencana';
import { JUMLAH_MOU_SEED } from '../lib/migrasiMouRencana';
import type {
  HasilMigrasiMou,
  KemajuanMigrasiMou,
  TahapMigrasiMou,
} from '../lib/migrasiMou';
import { JUMLAH_COMMITMENT_SEED } from '../lib/migrasiCommitmentRencana';
import type {
  HasilMigrasiCommitment,
  KemajuanMigrasiCommitment,
  TahapMigrasiCommitment,
} from '../lib/migrasiCommitment';
import { HITUNGAN_BACKFILL_DIHARAPKAN } from '../lib/backfillKlienIdRencana';
import type {
  HasilBackfillKlienId,
  KemajuanBackfillKlienId,
  TahapBackfillKlienId,
} from '../lib/backfillKlienId';
import type { Klien } from '../lib/types';
import {
  ID_MOU_037,
  PIC_MOU_037_BARU,
} from '../lib/perbaikanMou037Rencana';
import type {
  HasilPerbaikanMou037,
  KemajuanPerbaikanMou037,
  TahapPerbaikanMou037,
} from '../lib/perbaikanMou037';
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
  /**
   * Dipanggil saat tombol pratinjau re-migrasi diklik. Hanya membaca
   * data live — TIDAK menulis apa pun. Halaman ini TIDAK memanggil
   * Firebase langsung.
   */
  onPratinjauRemigrasi?: () => Promise<PratinjauRemigrasi>;
  /**
   * Dipanggil saat tombol jalankan re-migrasi diklik, dengan callback
   * progres per tahap/koleksi. Koordinator menyambungkannya ke
   * `jalankanRemigrasi` (src/lib/remigrasi.ts).
   */
  onRemigrasi?: (
    onKemajuan?: (k: KemajuanRemigrasi) => void,
  ) => Promise<HasilRemigrasi>;
  /** Status re-migrasi dari Firestore (dokumen meta/migrasi-kontrak-2026). */
  statusRemigrasi?: 'belum' | 'sudah' | 'tidak-tersedia';
  /** Tanggal re-migrasi (bila diketahui dari luar sesi ini). */
  tanggalRemigrasi?: string;
  /**
   * Dipanggil saat tombol jalankan migrasi MoU diklik, dengan callback
   * progres per tahap. Koordinator menyambungkannya ke
   * `jalankanMigrasiMou` (src/lib/migrasiMou.ts).
   */
  onMigrasiMou?: (
    onKemajuan?: (k: KemajuanMigrasiMou) => void,
  ) => Promise<HasilMigrasiMou>;
  /** Status migrasi MoU dari Firestore (dokumen meta/migrasi-mou-2026). */
  statusMigrasiMou?: 'belum' | 'sudah' | 'tidak-tersedia';
  /** Tanggal migrasi MoU (bila diketahui dari luar sesi ini). */
  tanggalMigrasiMou?: string;
  /**
   * Dipanggil saat tombol jalankan perbaikan MoU 037 diklik, dengan
   * callback progres per tahap. Koordinator menyambungkannya ke
   * `jalankanPerbaikanMou037` (src/lib/perbaikanMou037.ts).
   */
  onPerbaikanMou037?: (
    onKemajuan?: (k: KemajuanPerbaikanMou037) => void,
  ) => Promise<HasilPerbaikanMou037>;
  /**
   * Status perbaikan MoU 037 dari Firestore (nilai live dokumen 037
   * sudah bernilai baru atau belum). TIDAK memakai dokumen guard
   * `meta/` — lihat src/lib/perbaikanMou037.ts.
   */
  statusPerbaikanMou037?: 'belum' | 'sudah' | 'tidak-tersedia';
  /**
   * Dipanggil saat tombol jalankan migrasi Commitment diklik, dengan
   * callback progres per tahap. Koordinator menyambungkannya ke
   * `jalankanMigrasiCommitment` (src/lib/migrasiCommitment.ts).
   */
  onMigrasiCommitment?: (
    onKemajuan?: (k: KemajuanMigrasiCommitment) => void,
  ) => Promise<HasilMigrasiCommitment>;
  /** Status migrasi Commitment dari Firestore (dokumen meta/migrasi-commitment-2026). */
  statusMigrasiCommitment?: 'belum' | 'sudah' | 'tidak-tersedia';
  /** Tanggal migrasi Commitment (bila diketahui dari luar sesi ini). */
  tanggalMigrasiCommitment?: string;
  /**
   * Daftar record klien untuk kartu undang akun (dua peran 19/11/2026)
   * — id, nama, email, dan penanda akun sudah dibuat. Dipakai memilih
   * record klien yang ditautkan ke akun client baru.
   */
  daftarKlien?: Pick<Klien, 'id' | 'nama' | 'email' | 'akunKlienDibuat'>[];
  /**
   * Dipanggil saat form undang akun dikirim. Koordinator menyambungkannya
   * ke handler App.tsx yang menulis `users/{uid}` (profil peran +
   * klienId) dan menandai record klien. Halaman ini TIDAK memanggil
   * Firebase langsung.
   */
  onUndangKlien?: (input: UndangKlienInput) => Promise<{
    galat: string | null;
  }>;
  /**
   * Dipanggil saat tombol jalankan backfill klienId diklik, dengan
   * callback progres per tahap. Koordinator menyambungkannya ke
   * `jalankanBackfillKlienId` (src/lib/backfillKlienId.ts).
   */
  onBackfillKlienId?: (
    onKemajuan?: (k: KemajuanBackfillKlienId) => void,
  ) => Promise<HasilBackfillKlienId>;
  /** Status backfill klienId dari Firestore (dokumen meta/backfill-klienId-2026). */
  statusBackfillKlienId?: 'belum' | 'sudah' | 'tidak-tersedia';
  /** Tanggal backfill klienId (bila diketahui dari luar sesi ini). */
  tanggalBackfillKlienId?: string;
}

/** Input form undang akun (dua peran 19/11/2026). */
export interface UndangKlienInput {
  peran: 'operator' | 'client';
  /** UID akun Auth yang dibuat di Firebase console. */
  uidAuth: string;
  /** Email akun Auth (harus sama dengan yang dibuat di console). */
  email: string;
  nama: string;
  jabatan: string;
  /** Id record klien — WAJIB untuk peran 'client', kosong untuk operator. */
  klienId?: string;
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

const LABEL_TAHAP: Record<TahapRemigrasi, string> = {
  guard: 'Checking re-migration status…',
  'baca-live': 'Reading live data…',
  prakondisi: 'Checking preconditions…',
  hapus: 'Deleting old documents…',
  tulis: 'Writing new documents…',
  verifikasi: 'Verifying the new data…',
  audit: 'Writing the audit record…',
  selesai: 'Done.',
};

/** Tabel sebelum vs sesudah (hitungan + total kontrol) — dipakai pratinjau & hasil. */
function TabelSebelumSesudah({
  sebelum,
  sesudah,
}: {
  sebelum: PratinjauRemigrasi['sebelum'];
  sesudah: PratinjauRemigrasi['sesudah'];
}) {
  return (
    <Tabel>
      <thead>
        <tr>
          <Th>Item</Th>
          <Th kanan>Before (live)</Th>
          <Th kanan>After (new seed)</Th>
        </tr>
      </thead>
      <tbody>
        {KOLEKSI_REMIGRASI.map((koleksi) => (
          <Baris key={koleksi}>
            <Td>{koleksi}</Td>
            <Td kanan>{sebelum.hitungan[koleksi]}</Td>
            <Td kanan>{sesudah.hitungan[koleksi]}</Td>
          </Baris>
        ))}
        <Baris>
          <Td>Contract value</Td>
          <Td kanan>{formatRupiah(sebelum.total.nilaiKontrak)}</Td>
          <Td kanan>{formatRupiah(sesudah.total.nilaiKontrak)}</Td>
        </Baris>
        <Baris>
          <Td>Verified payments</Td>
          <Td kanan>{formatRupiah(sebelum.total.totalPembayaranTerverifikasi)}</Td>
          <Td kanan>{formatRupiah(sesudah.total.totalPembayaranTerverifikasi)}</Td>
        </Baris>
        <Baris>
          <Td>Outstanding receivables</Td>
          <Td kanan>{formatRupiah(sebelum.total.sisaPiutang)}</Td>
          <Td kanan>{formatRupiah(sesudah.total.sisaPiutang)}</Td>
        </Baris>
        <Baris>
          <Td>Total fines</Td>
          <Td kanan>{formatRupiah(sebelum.total.totalDenda)}</Td>
          <Td kanan>{formatRupiah(sesudah.total.totalDenda)}</Td>
        </Baris>
      </tbody>
    </Tabel>
  );
}

/**
 * Bagian "Re-migrate Contract Data 2026" — menyamakan data live Firestore
 * dengan seed pasca-PR #52 (40 kontrak 2026 dari file baru pengguna).
 * Hanya 5 koleksi yang diganti (klien, kontrak, tagihan, pembayaran,
 * denda); koleksi lain TIDAK disentuh. Sekali jalan, dengan pratinjau
 * dan prakondisi sebelum menghapus apa pun.
 */
function BagianRemigrasi({
  onPratinjauRemigrasi,
  onRemigrasi,
  statusRemigrasi,
  tanggalRemigrasi,
}: {
  onPratinjauRemigrasi?: () => Promise<PratinjauRemigrasi>;
  onRemigrasi?: (
    onKemajuan?: (k: KemajuanRemigrasi) => void,
  ) => Promise<HasilRemigrasi>;
  statusRemigrasi: 'belum' | 'sudah' | 'tidak-tersedia';
  tanggalRemigrasi?: string;
}) {
  const [pratinjau, setPratinjau] = useState<PratinjauRemigrasi | null>(null);
  const [memuatPratinjau, setMemuatPratinjau] = useState(false);
  const [setuju, setSetuju] = useState(false);
  const [proses, setProses] = useState(false);
  const [kemajuan, setKemajuan] = useState<KemajuanRemigrasi | null>(null);
  const [riwayat, setRiwayat] = useState<KemajuanRemigrasi[]>([]);
  const [hasil, setHasil] = useState<HasilRemigrasi | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  const sudah = statusRemigrasi === 'sudah' || hasil !== null;

  // Koleksi selesai pada suatu tahap: ada laporan tahap itu untuk
  // koleksi tersebut dengan hitungan selesai melewati indeksnya.
  const koleksiSelesai = (tahap: 'hapus' | 'tulis', koleksi: string) => {
    const indeks = KOLEKSI_REMIGRASI.indexOf(
      koleksi as (typeof KOLEKSI_REMIGRASI)[number],
    );
    return riwayat.some(
      (k) => k.tahap === tahap && k.koleksi === koleksi && k.selesai > indeks,
    );
  };

  async function tanganiPratinjau() {
    if (!onPratinjauRemigrasi || memuatPratinjau || sudah) return;
    setMemuatPratinjau(true);
    setGalat(null);
    try {
      setPratinjau(await onPratinjauRemigrasi());
    } catch (e) {
      setGalat(
        e instanceof Error
          ? e.message
          : 'Failed to load the preview. Try again.',
      );
    } finally {
      setMemuatPratinjau(false);
    }
  }

  async function tanganiRemigrasi() {
    if (!onRemigrasi || proses || sudah || !setuju) return;
    setProses(true);
    setGalat(null);
    setRiwayat([]);
    try {
      const r = await onRemigrasi((k) => {
        setKemajuan(k);
        setRiwayat((lama) => [...lama, k]);
      });
      setHasil(r);
    } catch (e) {
      setGalat(
        e instanceof Error ? e.message : 'Re-migration failed. Try again.',
      );
    } finally {
      setProses(false);
    }
  }

  return (
    <Kartu>
      <JudulBagian>Re-migrate Contract Data 2026</JudulBagian>
      {statusRemigrasi === 'tidak-tersedia' ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Re-migration only works on live Firestore data. Open this page
          after signing in while the app is in Firestore mode — in sample
          mode the data already comes from the new seed.
        </p>
      ) : sudah ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Already re-migrated on{' '}
          {hasil
            ? formatTanggalIso(hasil.tanggal)
            : tanggalRemigrasi
              ? formatTanggalIso(tanggalRemigrasi)
              : 'the recorded date'}
          . Re-migration can only be done once.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Replaces the live Firestore data for clients, contracts,
            invoices, payments, and fines (5 collections) with the new seed
            from PR #52 — 40 contracts of 2026 from the new file, keeping
            the 2 contracts of 2025 (Darojad, PT VGreen). Operator
            attribution is carried over from the live data. Other
            collections (leases, submissions, reference receipts, documents,
            and the rest) are NOT touched. Before deleting anything, the
            preview shows the before/after numbers and preconditions are
            checked; re-migration can only be done once.
          </p>
          <div className="mt-3">
            <TombolUtama
              onClick={tanganiPratinjau}
              disabled={memuatPratinjau || proses || !onPratinjauRemigrasi}
            >
              {memuatPratinjau ? 'Loading preview…' : 'Show preview (no changes yet)'}
            </TombolUtama>
          </div>
        </>
      )}

      {pratinjau && !hasil && (
        <div className="mt-3">
          <TabelSebelumSesudah
            sebelum={pratinjau.sebelum}
            sesudah={pratinjau.sesudah}
          />
          <label className="mt-3 flex items-start gap-2 text-sm text-[#0d2569]">
            <input
              type="checkbox"
              checked={setuju}
              onChange={(e) => setSetuju(e.target.checked)}
              disabled={proses}
              className="mt-0.5"
            />
            <span>
              I understand this deletes 172 live documents and writes 174
              new ones. This cannot be undone from the app — the old data
              can only be restored from the code history (seed before PR
              #52).
            </span>
          </label>
          <div className="mt-3">
            <TombolUtama
              onClick={tanganiRemigrasi}
              disabled={proses || !setuju || !onRemigrasi}
            >
              {proses ? 'Re-migrating…' : 'Run re-migration'}
            </TombolUtama>
          </div>
        </div>
      )}

      {(proses || kemajuan) && !hasil && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#0d2569]">
            {kemajuan ? LABEL_TAHAP[kemajuan.tahap] : 'Starting…'}
            {kemajuan?.koleksi ? ` — ${kemajuan.koleksi}` : ''}
            {kemajuan && (kemajuan.tahap === 'hapus' || kemajuan.tahap === 'tulis')
              ? ` (${kemajuan.selesai}/${kemajuan.total})`
              : ''}
          </p>
          <ul className="mt-2 space-y-1">
            {KOLEKSI_REMIGRASI.map((koleksi) => (
              <li key={koleksi} className="text-sm text-[#0d2569]/70">
                {koleksi}: delete{' '}
                {koleksiSelesai('hapus', koleksi) ? 'done' : 'pending'} · write{' '}
                {koleksiSelesai('tulis', koleksi) ? 'done' : 'pending'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {galat && (
        <div className="mt-3">
          <Peringatan teks={galat} />
          {kemajuan && (
            <p className="mt-2 text-sm text-[#0d2569]/70">
              Stopped at: {LABEL_TAHAP[kemajuan.tahap]}
              {kemajuan.koleksi ? ` — ${kemajuan.koleksi}` : ''}. Do not run
              it again — report this to Digi with the message above.
            </p>
          )}
        </div>
      )}

      {hasil && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#0d2569]">
            Re-migration succeeded on {formatTanggalIso(hasil.tanggal)}.
            Verify the Dashboard totals in Firestore mode.
          </p>
          <div className="mt-2">
            <TabelSebelumSesudah sebelum={hasil.sebelum} sesudah={hasil.sesudah} />
          </div>
        </div>
      )}
    </Kartu>
  );
}

const LABEL_TAHAP_MIGRASI_MOU: Record<TahapMigrasiMou, string> = {
  guard: 'Checking MoU migration status…',
  'baca-live': 'Reading live MoU data…',
  prakondisi: 'Checking preconditions…',
  tulis: 'Writing MoU documents…',
  verifikasi: 'Verifying the new data…',
  audit: 'Writing the audit record…',
  selesai: 'Done.',
};

const LABEL_TAHAP_MIGRASI_COMMITMENT: Record<TahapMigrasiCommitment, string> = {
  guard: 'Checking Commitment migration status…',
  'baca-live': 'Reading live Commitment data…',
  prakondisi: 'Checking preconditions…',
  tulis: 'Writing Commitment documents…',
  verifikasi: 'Verifying the new data…',
  audit: 'Writing the audit record…',
  selesai: 'Done.',
};

/**
 * Bagian "Migrate MoU Data" — menulis 44 record MoU dari seed
 * (src/lib/seedMou.ts, file pengguna "Rekapitulasi_Nota_Kesepahaman")
 * ke koleksi `mou` di Firestore. SATU koleksi saja: tidak ada yang
 * dihapus, koleksi lain TIDAK disentuh, dan total kontrak PNBP tidak
 * berubah. Sekali jalan, dengan prakondisi (live `mou` harus 0) dan
 * verifikasi sebelum selesai.
 */
function BagianMigrasiMou({
  onMigrasiMou,
  statusMigrasiMou,
  tanggalMigrasiMou,
}: {
  onMigrasiMou?: (
    onKemajuan?: (k: KemajuanMigrasiMou) => void,
  ) => Promise<HasilMigrasiMou>;
  statusMigrasiMou: 'belum' | 'sudah' | 'tidak-tersedia';
  tanggalMigrasiMou?: string;
}) {
  const [setuju, setSetuju] = useState(false);
  const [proses, setProses] = useState(false);
  const [kemajuan, setKemajuan] = useState<KemajuanMigrasiMou | null>(null);
  const [hasil, setHasil] = useState<HasilMigrasiMou | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  const sudah = statusMigrasiMou === 'sudah' || hasil !== null;

  async function tanganiMigrasiMou() {
    if (!onMigrasiMou || proses || sudah || !setuju) return;
    setProses(true);
    setGalat(null);
    setKemajuan(null);
    try {
      const r = await onMigrasiMou((k) => setKemajuan(k));
      setHasil(r);
    } catch (e) {
      setGalat(
        e instanceof Error ? e.message : 'MoU migration failed. Try again.',
      );
    } finally {
      setProses(false);
    }
  }

  return (
    <Kartu>
      <JudulBagian>Migrate MoU Data</JudulBagian>
      {statusMigrasiMou === 'tidak-tersedia' ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          MoU migration only works on live Firestore data. Open this page
          after signing in while the app is in Firestore mode — in sample
          mode the data already comes from the new seed.
        </p>
      ) : sudah ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Already migrated on{' '}
          {hasil
            ? formatTanggalIso(hasil.tanggal)
            : tanggalMigrasiMou
              ? formatTanggalIso(tanggalMigrasiMou)
              : 'the recorded date'}
          . MoU migration can only be done once.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Writes {JUMLAH_MOU_SEED} Memorandum of Understanding records
            from &lsquo;Rekapitulasi Nota Kesepahaman&rsquo; to the
            Firestore collection `mou`. Nothing is deleted, no other
            collection is touched, and the PNBP contract totals do not
            change. Before writing anything, the migration checks that the
            live `mou` collection is still empty; it can only be done
            once.
          </p>
          <label className="mt-3 flex items-start gap-2 text-sm text-[#0d2569]">
            <input
              type="checkbox"
              checked={setuju}
              onChange={(e) => setSetuju(e.target.checked)}
              disabled={proses}
              className="mt-0.5"
            />
            <span>
              I understand this writes {JUMLAH_MOU_SEED} new MoU documents
              to Firestore. This cannot be undone from the app.
            </span>
          </label>
          <div className="mt-3">
            <TombolUtama
              onClick={tanganiMigrasiMou}
              disabled={proses || !setuju || !onMigrasiMou}
            >
              {proses ? 'Migrating MoU…' : 'Run MoU migration'}
            </TombolUtama>
          </div>
        </>
      )}

      {(proses || kemajuan) && !hasil && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#0d2569]">
            {kemajuan ? LABEL_TAHAP_MIGRASI_MOU[kemajuan.tahap] : 'Starting…'}
          </p>
        </div>
      )}

      {galat && (
        <div className="mt-3">
          <Peringatan teks={galat} />
          {kemajuan && (
            <p className="mt-2 text-sm text-[#0d2569]/70">
              Stopped at: {LABEL_TAHAP_MIGRASI_MOU[kemajuan.tahap]}. Do not
              run it again — report this to Digi with the message above.
            </p>
          )}
        </div>
      )}

      {hasil && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#0d2569]">
            MoU migration succeeded on {formatTanggalIso(hasil.tanggal)}.
            Live MoU records: {hasil.sebelum.jumlahMou} →{' '}
            {hasil.sesudah.jumlahMou}. Verify the Memorandum of
            Understanding panel in Firestore mode.
          </p>
        </div>
      )}
    </Kartu>
  );
}

const LABEL_TAHAP_PERBAIKAN_MOU_037: Record<TahapPerbaikanMou037, string> = {
  'baca-live': 'Reading live MoU record 037…',
  prakondisi: 'Checking preconditions…',
  tulis: 'Writing the fix to MoU 037…',
  verifikasi: 'Verifying the fixed record…',
  audit: 'Writing the audit record…',
  selesai: 'Done.',
};

/**
 * Bagian "Fix MoU Record 037 (One-off)" — perbaikan satu kali record
 * MoU 037/RRI-PLB/KJM.02.04/09/2026 di Firestore (keputusan pengguna
 * 19/11/2026 14:41 WIB): PIC menjadi 'Ja'far' dan nama instansi
 * dibersihkan dari backtick nyasar di akhir. PERSIS 1 dokumen dan
 * PERSIS 2 field; dokumen lain dan koleksi lain TIDAK disentuh, total
 * kontrak PNBP tidak berubah. Sekali jalan TANPA dokumen guard `meta/`
 * baru — perlindungan jalan-dua-kali berasal dari prakondisi nilai
 * live (bila dokumen 037 sudah bernilai baru, patch MENOLAK sebelum
 * menulis apa pun).
 */
function BagianPerbaikanMou037({
  onPerbaikanMou037,
  statusPerbaikanMou037,
}: {
  onPerbaikanMou037?: (
    onKemajuan?: (k: KemajuanPerbaikanMou037) => void,
  ) => Promise<HasilPerbaikanMou037>;
  statusPerbaikanMou037: 'belum' | 'sudah' | 'tidak-tersedia';
}) {
  const [setuju, setSetuju] = useState(false);
  const [proses, setProses] = useState(false);
  const [kemajuan, setKemajuan] = useState<KemajuanPerbaikanMou037 | null>(
    null,
  );
  const [hasil, setHasil] = useState<HasilPerbaikanMou037 | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  const sudah = statusPerbaikanMou037 === 'sudah' || hasil !== null;

  async function tanganiPerbaikanMou037() {
    if (!onPerbaikanMou037 || proses || sudah || !setuju) return;
    setProses(true);
    setGalat(null);
    setKemajuan(null);
    try {
      const r = await onPerbaikanMou037((k) => setKemajuan(k));
      setHasil(r);
    } catch (e) {
      setGalat(
        e instanceof Error ? e.message : 'MoU 037 fix failed. Try again.',
      );
    } finally {
      setProses(false);
    }
  }

  return (
    <Kartu>
      <JudulBagian>Fix MoU Record 037 (One-off)</JudulBagian>
      {statusPerbaikanMou037 === 'tidak-tersedia' ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          This fix only works on live Firestore data. Open this page after
          signing in while the app is in Firestore mode — in sample mode
          the data already comes from the corrected seed.
        </p>
      ) : sudah ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Already fixed
          {hasil ? ` on ${formatTanggalIso(hasil.tanggal)}` : ''} — PIC of
          MoU {ID_MOU_037} is {PIC_MOU_037_BARU} and the institution name
          is clean. This fix can only be done once.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Sets the PIC of MoU {ID_MOU_037} to {PIC_MOU_037_BARU} and
            removes the stray trailing backtick from its institution name.
            Only that one document and only those two fields are changed;
            no other document or collection is touched, and the PNBP
            contract totals do not change. Before writing anything, the
            fix checks that the live record still has the old values; it
            can only be done once.
          </p>
          <label className="mt-3 flex items-start gap-2 text-sm text-[#0d2569]">
            <input
              type="checkbox"
              checked={setuju}
              onChange={(e) => setSetuju(e.target.checked)}
              disabled={proses}
              className="mt-0.5"
            />
            <span>
              I understand this updates one MoU document ({ID_MOU_037})
              in Firestore. This cannot be undone from the app.
            </span>
          </label>
          <div className="mt-3">
            <TombolUtama
              onClick={tanganiPerbaikanMou037}
              disabled={proses || !setuju || !onPerbaikanMou037}
            >
              {proses ? 'Fixing MoU 037…' : 'Run MoU 037 fix'}
            </TombolUtama>
          </div>
        </>
      )}

      {(proses || kemajuan) && !hasil && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#0d2569]">
            {kemajuan
              ? LABEL_TAHAP_PERBAIKAN_MOU_037[kemajuan.tahap]
              : 'Starting…'}
          </p>
        </div>
      )}

      {galat && (
        <div className="mt-3">
          <Peringatan teks={galat} />
          {kemajuan && (
            <p className="mt-2 text-sm text-[#0d2569]/70">
              Stopped at: {LABEL_TAHAP_PERBAIKAN_MOU_037[kemajuan.tahap]}.
              Do not run it again — report this to Digi with the message
              above.
            </p>
          )}
        </div>
      )}

      {hasil && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#0d2569]">
            MoU 037 fix succeeded on {formatTanggalIso(hasil.tanggal)}.
            PIC: {hasil.sebelum.pic} → {hasil.sesudah.pic}. Verify the
            Memorandum of Understanding panel in Firestore mode.
          </p>
        </div>
      )}
    </Kartu>
  );
}

/**
 * Bagian "Migrate Commitment Data" — menulis 4 record Commitment dari
 * seed (src/lib/seedCommitment.ts, file pengguna
 * "Dukungan_Layanan_2026") ke koleksi `commitment` di Firestore. SATU
 * koleksi saja: tidak ada yang dihapus, koleksi lain TIDAK disentuh,
 * dan total kontrak PNBP tidak berubah. Sekali jalan, dengan
 * prakondisi (live `commitment` harus 0) dan verifikasi sebelum
 * selesai.
 */
function BagianMigrasiCommitment({
  onMigrasiCommitment,
  statusMigrasiCommitment,
  tanggalMigrasiCommitment,
}: {
  onMigrasiCommitment?: (
    onKemajuan?: (k: KemajuanMigrasiCommitment) => void,
  ) => Promise<HasilMigrasiCommitment>;
  statusMigrasiCommitment: 'belum' | 'sudah' | 'tidak-tersedia';
  tanggalMigrasiCommitment?: string;
}) {
  const [setuju, setSetuju] = useState(false);
  const [proses, setProses] = useState(false);
  const [kemajuan, setKemajuan] = useState<KemajuanMigrasiCommitment | null>(null);
  const [hasil, setHasil] = useState<HasilMigrasiCommitment | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  const sudah = statusMigrasiCommitment === 'sudah' || hasil !== null;

  async function tanganiMigrasiCommitment() {
    if (!onMigrasiCommitment || proses || sudah || !setuju) return;
    setProses(true);
    setGalat(null);
    setKemajuan(null);
    try {
      const r = await onMigrasiCommitment((k) => setKemajuan(k));
      setHasil(r);
    } catch (e) {
      setGalat(
        e instanceof Error
          ? e.message
          : 'Commitment migration failed. Try again.',
      );
    } finally {
      setProses(false);
    }
  }

  return (
    <Kartu>
      <JudulBagian>Migrate Commitment Data</JudulBagian>
      {statusMigrasiCommitment === 'tidak-tersedia' ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Commitment migration only works on live Firestore data. Open
          this page after signing in while the app is in Firestore mode —
          in sample mode the data already comes from the new seed.
        </p>
      ) : sudah ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Already migrated on{' '}
          {hasil
            ? formatTanggalIso(hasil.tanggal)
            : tanggalMigrasiCommitment
              ? formatTanggalIso(tanggalMigrasiCommitment)
              : 'the recorded date'}
          . Commitment migration can only be done once.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Writes {JUMLAH_COMMITMENT_SEED} Commitment records from
            &lsquo;Dukungan Layanan 2026&rsquo; to the Firestore
            collection `commitment`. Nothing is deleted, no other
            collection is touched, and the PNBP contract totals do not
            change. Before writing anything, the migration checks that
            the live `commitment` collection is still empty; it can only
            be done once.
          </p>
          <label className="mt-3 flex items-start gap-2 text-sm text-[#0d2569]">
            <input
              type="checkbox"
              checked={setuju}
              onChange={(e) => setSetuju(e.target.checked)}
              disabled={proses}
              className="mt-0.5"
            />
            <span>
              I understand this writes {JUMLAH_COMMITMENT_SEED} new
              Commitment documents to Firestore. This cannot be undone
              from the app.
            </span>
          </label>
          <div className="mt-3">
            <TombolUtama
              onClick={tanganiMigrasiCommitment}
              disabled={proses || !setuju || !onMigrasiCommitment}
            >
              {proses ? 'Migrating Commitment…' : 'Run Commitment migration'}
            </TombolUtama>
          </div>
        </>
      )}

      {(proses || kemajuan) && !hasil && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#0d2569]">
            {kemajuan
              ? LABEL_TAHAP_MIGRASI_COMMITMENT[kemajuan.tahap]
              : 'Starting…'}
          </p>
        </div>
      )}

      {galat && (
        <div className="mt-3">
          <Peringatan teks={galat} />
          {kemajuan && (
            <p className="mt-2 text-sm text-[#0d2569]/70">
              Stopped at: {LABEL_TAHAP_MIGRASI_COMMITMENT[kemajuan.tahap]}.
              Do not run it again — report this to Digi with the message
              above.
            </p>
          )}
        </div>
      )}

      {hasil && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#0d2569]">
            Commitment migration succeeded on{' '}
            {formatTanggalIso(hasil.tanggal)}. Live Commitment records:{' '}
            {hasil.sebelum.jumlahCommitment} →{' '}
            {hasil.sesudah.jumlahCommitment}. Verify the Commitment panel
            in Firestore mode.
          </p>
        </div>
      )}
    </Kartu>
  );
}

const LABEL_TAHAP_BACKFILL_KLIENID: Record<TahapBackfillKlienId, string> = {
  guard: 'Checking backfill status…',
  'baca-live': 'Reading live data…',
  prakondisi: 'Checking preconditions…',
  tulis: 'Writing klienId fields…',
  verifikasi: 'Verifying the new data…',
  audit: 'Writing the audit record…',
  selesai: 'Done.',
};

/**
 * Bagian "Backfill klienId (One-off)" — menambah field `klienId` ke
 * data live Firestore (dua peran 19/11/2026): tagihan/dokumen dari
 * kontrak, pembayaran/denda dari tagihan, MoU 3 record dari KLIEN_MOU.
 * Hanya field `klienId` yang ditulis (update parsial); dokumen yang
 * sudah punya klienId benar dilewati, yang punya klienId salah
 * membuat backfill GAGAL. Sekali jalan dengan guard
 * `meta/backfill-klienId-2026`, prakondisi hitungan live = seed, dan
 * verifikasi sebelum selesai. Kontrak/klien/commitment TIDAK disentuh.
 */
function BagianBackfillKlienId({
  onBackfillKlienId,
  statusBackfillKlienId,
  tanggalBackfillKlienId,
}: {
  onBackfillKlienId?: (
    onKemajuan?: (k: KemajuanBackfillKlienId) => void,
  ) => Promise<HasilBackfillKlienId>;
  statusBackfillKlienId: 'belum' | 'sudah' | 'tidak-tersedia';
  tanggalBackfillKlienId?: string;
}) {
  const [setuju, setSetuju] = useState(false);
  const [proses, setProses] = useState(false);
  const [kemajuan, setKemajuan] = useState<KemajuanBackfillKlienId | null>(null);
  const [hasil, setHasil] = useState<HasilBackfillKlienId | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  const sudah = statusBackfillKlienId === 'sudah' || hasil !== null;

  async function tanganiBackfill() {
    if (!onBackfillKlienId || proses || sudah || !setuju) return;
    setProses(true);
    setGalat(null);
    setKemajuan(null);
    try {
      const r = await onBackfillKlienId((k) => setKemajuan(k));
      setHasil(r);
    } catch (e) {
      setGalat(
        e instanceof Error ? e.message : 'klienId backfill failed. Try again.',
      );
    } finally {
      setProses(false);
    }
  }

  return (
    <Kartu>
      <JudulBagian>Backfill klienId (One-off)</JudulBagian>
      {statusBackfillKlienId === 'tidak-tersedia' ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          klienId backfill only works on live Firestore data. Open this
          page after signing in while the app is in Firestore mode — in
          sample mode the data already comes from the new seed.
        </p>
      ) : sudah ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Already backfilled on{' '}
          {hasil
            ? formatTanggalIso(hasil.tanggal)
            : tanggalBackfillKlienId
              ? formatTanggalIso(tanggalBackfillKlienId)
              : 'the recorded date'}
          . klienId backfill can only be done once.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Adds the `klienId` field to live Firestore documents so
            clients can read their own data: {HITUNGAN_BACKFILL_DIHARAPKAN.tagihan}{' '}
            invoices, {HITUNGAN_BACKFILL_DIHARAPKAN.pembayaran} payments,{' '}
            {HITUNGAN_BACKFILL_DIHARAPKAN.denda} fines, and{' '}
            {HITUNGAN_BACKFILL_DIHARAPKAN.dokumen} documents (from their
            parent contract/invoice), plus 3 MoU records linked by exact
            institution name. Only the `klienId` field is written —
            nothing is deleted, no other field or collection is touched,
            and the PNBP contract totals do not change. Before writing
            anything, the backfill checks that the live counts still
            match the seed; it can only be done once. Run this BEFORE
            inviting the first client accounts.
          </p>
          <label className="mt-3 flex items-start gap-2 text-sm text-[#0d2569]">
            <input
              type="checkbox"
              checked={setuju}
              onChange={(e) => setSetuju(e.target.checked)}
              disabled={proses}
              className="mt-0.5"
            />
            <span>
              I understand this updates the `klienId` field on live
              documents. This cannot be undone from the app.
            </span>
          </label>
          <div className="mt-3">
            <TombolUtama
              onClick={tanganiBackfill}
              disabled={proses || !setuju || !onBackfillKlienId}
            >
              {proses ? 'Backfilling klienId…' : 'Run klienId backfill'}
            </TombolUtama>
          </div>
        </>
      )}

      {(proses || kemajuan) && !hasil && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#0d2569]">
            {kemajuan
              ? LABEL_TAHAP_BACKFILL_KLIENID[kemajuan.tahap]
              : 'Starting…'}
          </p>
        </div>
      )}

      {galat && (
        <div className="mt-3">
          <Peringatan teks={galat} />
          {kemajuan && (
            <p className="mt-2 text-sm text-[#0d2569]/70">
              Stopped at: {LABEL_TAHAP_BACKFILL_KLIENID[kemajuan.tahap]}.
              Do not run it again — report this to Digi with the message
              above.
            </p>
          )}
        </div>
      )}

      {hasil && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#0d2569]">
            klienId backfill succeeded on{' '}
            {formatTanggalIso(hasil.tanggal)}. Documents updated:{' '}
            {hasil.jumlahDitulis} (documents without klienId:{' '}
            {hasil.sebelum.tanpaKlienId} → {hasil.sesudah.tanpaKlienId}).
            Verify by signing in as the sample client.
          </p>
        </div>
      )}
    </Kartu>
  );
}

/**
 * Bagian "Invite Client Account" — Operator menautkan akun Auth ke
 * record klien (dua peran 19/11/2026). DUA KASUS (signup publik
 * 19/11/2026 16:12 WIB): (1) INVITE — Operator membuat akun Auth di
 * Firebase console (Authentication → Add user, email + kata sandi),
 * menyalin UID akun itu, mengisi form ini; form menulis dokumen
 * profil `users/{uid}` (peran + klienId). (2) TAUTKAN AKUN SIGNUP —
 * calon klien sudah daftar sendiri dari halaman login (profil client
 * tanpa klienId sudah ada); Operator memasukkan UID akun itu
 * (dilihat di console Authentication, dicocokkan lewat email) dan
 * form HANYA menambah klienId ke profil yang sudah ada (email form
 * harus sama dengan email profil — salah tautan ditolak). Akun yang
 * sudah tertaut tidak bisa ditautkan ulang dari sini — perubahan
 * peran dilakukan admin langsung di console.
 *
 * PERINGATAN EMAIL (temuan 19/11/2026): SEMUA 33 record klien seed
 * punya email KOSONG — email akun Auth TIDAK BISA diambil dari record
 * klien dan TIDAK BOLEH dikarang. Operator memakai alamat email asli
 * klien (dari luar aplikasi) saat membuat akun di console, lalu
 * memasukkannya di form ini. Daftar di bawah menampilkan "no email on
 * record" untuk tiap record supaya jelas.
 */
function BagianUndangKlien({
  daftarKlien,
  onUndangKlien,
}: {
  daftarKlien?: Pick<Klien, 'id' | 'nama' | 'email' | 'akunKlienDibuat'>[];
  onUndangKlien?: (input: UndangKlienInput) => Promise<{
    galat: string | null;
  }>;
}) {
  const [peran, setPeran] = useState<'operator' | 'client'>('client');
  const [uidAuth, setUidAuth] = useState('');
  const [email, setEmail] = useState('');
  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [klienId, setKlienId] = useState('');
  const [proses, setProses] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [sukses, setSukses] = useState<string | null>(null);

  const sudahPunyaAkun = daftarKlien?.filter((k) => k.akunKlienDibuat).length ?? 0;

  async function tanganiUndang() {
    if (!onUndangKlien || proses) return;
    setGalat(null);
    setSukses(null);
    if (uidAuth.trim() === '') {
      setGalat('Auth UID is required — copy it from Firebase console → Authentication → Users.');
      return;
    }
    if (email.trim() === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setGalat('A valid Auth email is required — it must match the email of the account (the sign-up email, or the email used when creating the account in the console).');
      return;
    }
    if (nama.trim() === '') {
      setGalat('Name is required.');
      return;
    }
    if (peran === 'client' && klienId === '') {
      setGalat('Pick the client record this account links to.');
      return;
    }
    setProses(true);
    try {
      const hasil = await onUndangKlien({
        peran,
        uidAuth: uidAuth.trim(),
        email: email.trim(),
        nama: nama.trim(),
        jabatan: jabatan.trim() || (peran === 'client' ? 'Client' : 'Staf Layanan & Pengembangan Usaha'),
        klienId: peran === 'client' ? klienId : undefined,
      });
      if (hasil.galat !== null) {
        setGalat(hasil.galat);
        return;
      }
      setSukses(
        peran === 'client'
          ? `Client account linked to ${klienId}. The client can now sign in with ${email.trim()} and will see only their own cooperation.`
          : `Operator account created for ${email.trim()}. They can now sign in and will see the admin portal.`,
      );
      setUidAuth('');
      setEmail('');
      setNama('');
      setJabatan('');
      setKlienId('');
    } catch (e) {
      setGalat(e instanceof Error ? e.message : 'Invite failed. Try again.');
    } finally {
      setProses(false);
    }
  }

  return (
    <Kartu>
      <JudulBagian>Invite Client Account</JudulBagian>
      <p className="mt-2 text-sm text-[#0d2569]/70">
        Create client and operator accounts. Clients can also sign up
        themselves from the login page — to link a signed-up account,
        enter its Auth UID (from the Firebase console) and its sign-up
        email here. Or invite: first create the Auth account in the
        Firebase console (Authentication → Add user, email +
        password), copy its UID, then link it here. A client account
        only sees the cooperation linked to its client record.{' '}
        {sudahPunyaAkun} of {daftarKlien?.length ?? 0} client records
        already have an account.
      </p>
      <p className="mt-2 text-sm font-semibold text-[#0d2569]">
        No email on record: every client record in the seed has an empty
        email field — use the client&apos;s real email address (from
        outside the app) when creating the account in the console. Do
        not invent an email.
      </p>
      {daftarKlien === undefined ? (
        <p className="mt-3 text-sm text-[#0d2569]/70">
          Client list is unavailable in this mode.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-[#0d2569]">
              Role
            </label>
            <select
              className="w-full rounded-md border border-[#0d2569]/20 bg-white px-3 py-2 text-sm text-[#0d2569]"
              value={peran}
              onChange={(e) =>
                setPeran(e.target.value as 'operator' | 'client')
              }
              disabled={proses}
            >
              <option value="client">Client</option>
              <option value="operator">Operator</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-[#0d2569]">
              Auth UID *
            </label>
            <input
              className="w-full rounded-md border border-[#0d2569]/20 bg-white px-3 py-2 text-sm text-[#0d2569]"
              value={uidAuth}
              onChange={(e) => setUidAuth(e.target.value)}
              placeholder="UID from Firebase console"
              disabled={proses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-[#0d2569]">
              Auth email *
            </label>
            <input
              className="w-full rounded-md border border-[#0d2569]/20 bg-white px-3 py-2 text-sm text-[#0d2569]"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email used in the console"
              disabled={proses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-[#0d2569]">
              Name *
            </label>
            <input
              className="w-full rounded-md border border-[#0d2569]/20 bg-white px-3 py-2 text-sm text-[#0d2569]"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Account holder name"
              disabled={proses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-[#0d2569]">
              Job title
            </label>
            <input
              className="w-full rounded-md border border-[#0d2569]/20 bg-white px-3 py-2 text-sm text-[#0d2569]"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              placeholder={peran === 'client' ? 'Client' : 'Staf Layanan & Pengembangan Usaha'}
              disabled={proses}
            />
          </div>
          {peran === 'client' && (
            <div>
              <label className="mb-1.5 block text-sm font-bold text-[#0d2569]">
                Client record *
              </label>
              <select
                className="w-full rounded-md border border-[#0d2569]/20 bg-white px-3 py-2 text-sm text-[#0d2569]"
                value={klienId}
                onChange={(e) => setKlienId(e.target.value)}
                disabled={proses}
              >
                <option value="">— Pick a client record —</option>
                {daftarKlien.map((k) => (
                  <option key={k.id} value={k.id} disabled={k.akunKlienDibuat}>
                    {k.nama} ({k.id}) — no email on record
                    {k.akunKlienDibuat ? ' — account already created' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
      <div className="mt-4">
        <TombolUtama onClick={tanganiUndang} disabled={proses || !onUndangKlien}>
          {proses ? 'Linking account…' : 'Link account'}
        </TombolUtama>
      </div>
      {galat && (
        <div className="mt-3">
          <Peringatan teks={galat} />
        </div>
      )}
      {sukses && (
        <p className="mt-3 text-sm font-semibold text-[#0d2569]">{sukses}</p>
      )}
    </Kartu>
  );
}

export default function MasterPage(props: MasterPageProps) {
  const {
    onMigrasi,
    statusMigrasi = 'tidak-tersedia',
    tanggalMigrasi,
    onPratinjauRemigrasi,
    onRemigrasi,
    statusRemigrasi = 'tidak-tersedia',
    tanggalRemigrasi,
    onMigrasiMou,
    statusMigrasiMou = 'tidak-tersedia',
    tanggalMigrasiMou,
    onPerbaikanMou037,
    statusPerbaikanMou037 = 'tidak-tersedia',
    onMigrasiCommitment,
    statusMigrasiCommitment = 'tidak-tersedia',
    tanggalMigrasiCommitment,
    daftarKlien,
    onUndangKlien,
    onBackfillKlienId,
    statusBackfillKlienId = 'tidak-tersedia',
    tanggalBackfillKlienId,
  } = props;
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

      <BagianRemigrasi
        onPratinjauRemigrasi={onPratinjauRemigrasi}
        onRemigrasi={onRemigrasi}
        statusRemigrasi={statusRemigrasi}
        tanggalRemigrasi={tanggalRemigrasi}
      />

      <BagianMigrasiMou
        onMigrasiMou={onMigrasiMou}
        statusMigrasiMou={statusMigrasiMou}
        tanggalMigrasiMou={tanggalMigrasiMou}
      />

      <BagianPerbaikanMou037
        onPerbaikanMou037={onPerbaikanMou037}
        statusPerbaikanMou037={statusPerbaikanMou037}
      />

      <BagianMigrasiCommitment
        onMigrasiCommitment={onMigrasiCommitment}
        statusMigrasiCommitment={statusMigrasiCommitment}
        tanggalMigrasiCommitment={tanggalMigrasiCommitment}
      />

      <BagianBackfillKlienId
        onBackfillKlienId={onBackfillKlienId}
        statusBackfillKlienId={statusBackfillKlienId}
        tanggalBackfillKlienId={tanggalBackfillKlienId}
      />

      <BagianUndangKlien
        daftarKlien={daftarKlien}
        onUndangKlien={onUndangKlien}
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

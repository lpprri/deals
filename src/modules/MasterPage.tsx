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

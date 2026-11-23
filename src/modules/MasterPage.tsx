// Master data — Fase A + Fase B (PRD v2.0 Final Bab 6.13).
// Tampilan READ-ONLY. Master hanya diubah Admin; nilai yang sudah dipakai
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
import { LABEL_PERAN, bolehAksi } from '../lib/permissions';

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
   * Dipanggil saat form buat akun internal dikirim. Koordinator
   * menyambungkannya ke handler App.tsx yang membuat akun Auth +
   * dokumen profil `users/{uid}` lewat secondary FirebaseApp
   * (sesi admin tidak terganti). Halaman ini TIDAK memanggil
   * Firebase langsung.
   */
  onBuatAkunInternal?: (
    input: BuatAkunInternalInput,
  ) => Promise<{ galat: string | null; uid?: string }>;
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

/** Input form buat akun internal (tiga peran 20/11/2026). */
export interface BuatAkunInternalInput {
  /** Peran internal — client TIDAK BISA dibuat dari jalur ini. */
  peran: 'operator' | 'admin';
  email: string;
  kataSandi: string;
  nama: string;
  jabatan: string;
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
        e instanceof Error ? e.message : 'Migrasi gagal. Coba lagi.',
      );
    } finally {
      setProses(false);
    }
  }

  return (
    <Kartu>
      <JudulBagian>Migrasi ke Firestore</JudulBagian>
      {statusMigrasi === 'tidak-tersedia' ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Migrasi membutuhkan konfigurasi Firebase. Lengkapi dulu enam
          variabel VITE_FIREBASE_* di Vercel, lalu deploy ulang, dan kembali
          ke halaman ini.
        </p>
      ) : sudah ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Sudah dimigrasi pada{' '}
          {hasil
            ? formatTanggalIso(hasil.tanggal)
            : tanggalMigrasi
              ? formatTanggalIso(tanggalMigrasi)
              : 'tanggal yang tercatat'}
          . Migrasi hanya bisa dilakukan sekali.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Menulis semua data contoh (klien, kontrak, tagihan, pembayaran,
            sewa, pengajuan, dan data Fase B) ke Firestore, beserta profil
            operator. Migrasi hanya bisa dilakukan sekali. Setelah berhasil,
            tombol ini nonaktif.
          </p>
          <div className="mt-3">
            <TombolUtama onClick={tanganiMigrasi} disabled={proses || !onMigrasi}>
              {proses ? 'Memigrasi data…' : 'Migrasi data contoh ke Firestore'}
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
            Migrasi berhasil pada {formatTanggalIso(hasil.tanggal)}.
          </p>
          <Tabel>
            <thead>
              <tr>
                <Th>Koleksi</Th>
                <Th kanan>Jumlah dokumen</Th>
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
  guard: 'Memeriksa status migrasi ulang…',
  'baca-live': 'Membaca data live…',
  prakondisi: 'Memeriksa prakondisi…',
  hapus: 'Menghapus dokumen lama…',
  tulis: 'Menulis dokumen baru…',
  verifikasi: 'Memverifikasi data baru…',
  audit: 'Menulis catatan audit…',
  selesai: 'Selesai.',
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
          <Th kanan>Sebelum (live)</Th>
          <Th kanan>Sesudah (seed baru)</Th>
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
          <Td>Nilai kontrak</Td>
          <Td kanan>{formatRupiah(sebelum.total.nilaiKontrak)}</Td>
          <Td kanan>{formatRupiah(sesudah.total.nilaiKontrak)}</Td>
        </Baris>
        <Baris>
          <Td>Pembayaran terverifikasi</Td>
          <Td kanan>{formatRupiah(sebelum.total.totalPembayaranTerverifikasi)}</Td>
          <Td kanan>{formatRupiah(sesudah.total.totalPembayaranTerverifikasi)}</Td>
        </Baris>
        <Baris>
          <Td>Sisa piutang</Td>
          <Td kanan>{formatRupiah(sebelum.total.sisaPiutang)}</Td>
          <Td kanan>{formatRupiah(sesudah.total.sisaPiutang)}</Td>
        </Baris>
        <Baris>
          <Td>Total denda</Td>
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
          : 'Gagal memuat pratinjau. Coba lagi.',
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
        e instanceof Error ? e.message : 'Migrasi ulang gagal. Coba lagi.',
      );
    } finally {
      setProses(false);
    }
  }

  return (
    <Kartu>
      <JudulBagian>Migrasi Ulang Data Kontrak 2026</JudulBagian>
      {statusRemigrasi === 'tidak-tersedia' ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Migrasi ulang hanya berjalan di data Firestore live. Buka halaman
          ini setelah masuk saat aplikasi dalam mode Firestore. Di mode contoh, data sudah berasal dari seed baru.
        </p>
      ) : sudah ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Sudah dimigrasi ulang pada{' '}
          {hasil
            ? formatTanggalIso(hasil.tanggal)
            : tanggalRemigrasi
              ? formatTanggalIso(tanggalRemigrasi)
              : 'tanggal yang tercatat'}
          . Migrasi ulang hanya bisa dilakukan sekali.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Mengganti data Firestore live untuk klien, kontrak, tagihan,
            pembayaran, dan denda (5 koleksi) dengan seed baru dari PR #52. Ada 40 kontrak 2026 dari file baru, dengan tetap menyimpan 2 kontrak
            2025 (Darojad, PT VGreen). Atribusi operator dibawa dari data
            live. Koleksi lain (sewa, pengajuan, kwitansi referensi,
            dokumen, dan lainnya) TIDAK disentuh. Sebelum menghapus apa
            pun, pratinjau menampilkan angka sebelum/sesudah dan prakondisi
            diperiksa; migrasi ulang hanya bisa dilakukan sekali.
          </p>
          <div className="mt-3">
            <TombolUtama
              onClick={tanganiPratinjau}
              disabled={memuatPratinjau || proses || !onPratinjauRemigrasi}
            >
              {memuatPratinjau ? 'Memuat pratinjau…' : 'Tampilkan pratinjau (belum ada perubahan)'}
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
              Saya paham ini menghapus 172 dokumen live dan menulis 174
              dokumen baru. Ini tidak bisa dibatalkan dari aplikasi. Data
              lama hanya bisa dipulihkan dari riwayat kode (seed sebelum
              PR #52).
            </span>
          </label>
          <div className="mt-3">
            <TombolUtama
              onClick={tanganiRemigrasi}
              disabled={proses || !setuju || !onRemigrasi}
            >
              {proses ? 'Memigrasi ulang…' : 'Jalankan migrasi ulang'}
            </TombolUtama>
          </div>
        </div>
      )}

      {(proses || kemajuan) && !hasil && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#0d2569]">
            {kemajuan ? LABEL_TAHAP[kemajuan.tahap] : 'Memulai…'}
            {kemajuan?.koleksi ? ` — ${kemajuan.koleksi}` : ''}
            {kemajuan && (kemajuan.tahap === 'hapus' || kemajuan.tahap === 'tulis')
              ? ` (${kemajuan.selesai}/${kemajuan.total})`
              : ''}
          </p>
          <ul className="mt-2 space-y-1">
            {KOLEKSI_REMIGRASI.map((koleksi) => (
              <li key={koleksi} className="text-sm text-[#0d2569]/70">
                {koleksi}: hapus{' '}
                {koleksiSelesai('hapus', koleksi) ? 'selesai' : 'menunggu'} · tulis{' '}
                {koleksiSelesai('tulis', koleksi) ? 'selesai' : 'menunggu'}
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
              Berhenti di: {LABEL_TAHAP[kemajuan.tahap]}
              {kemajuan.koleksi ? ` — ${kemajuan.koleksi}` : ''}. Jangan dijalankan lagi. Laporkan ke Digi dengan pesan di atas.
            </p>
          )}
        </div>
      )}

      {hasil && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#0d2569]">
            Migrasi ulang berhasil pada {formatTanggalIso(hasil.tanggal)}.
            Periksa total Dashboard di mode Firestore.
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
  guard: 'Memeriksa status migrasi MoU…',
  'baca-live': 'Membaca data MoU live…',
  prakondisi: 'Memeriksa prakondisi…',
  tulis: 'Menulis dokumen MoU…',
  verifikasi: 'Memverifikasi data baru…',
  audit: 'Menulis catatan audit…',
  selesai: 'Selesai.',
};

const LABEL_TAHAP_MIGRASI_COMMITMENT: Record<TahapMigrasiCommitment, string> = {
  guard: 'Memeriksa status migrasi Dukungan Layanan…',
  'baca-live': 'Membaca data Dukungan Layanan live…',
  prakondisi: 'Memeriksa prakondisi…',
  tulis: 'Menulis dokumen Dukungan Layanan…',
  verifikasi: 'Memverifikasi data baru…',
  audit: 'Menulis catatan audit…',
  selesai: 'Selesai.',
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
        e instanceof Error ? e.message : 'Migrasi MoU gagal. Coba lagi.',
      );
    } finally {
      setProses(false);
    }
  }

  return (
    <Kartu>
      <JudulBagian>Migrasi Data MoU</JudulBagian>
      {statusMigrasiMou === 'tidak-tersedia' ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Migrasi MoU hanya berjalan di data Firestore live. Buka halaman
          ini setelah masuk saat aplikasi dalam mode Firestore. Di mode contoh, data sudah berasal dari seed baru.
        </p>
      ) : sudah ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Sudah dimigrasi pada{' '}
          {hasil
            ? formatTanggalIso(hasil.tanggal)
            : tanggalMigrasiMou
              ? formatTanggalIso(tanggalMigrasiMou)
              : 'tanggal yang tercatat'}
          . Migrasi MoU hanya bisa dilakukan sekali.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Menulis {JUMLAH_MOU_SEED} record Nota Kesepahaman dari
            &lsquo;Rekapitulasi Nota Kesepahaman&rsquo; ke koleksi `mou`
            di Firestore. Tidak ada yang dihapus, tidak ada koleksi lain
            yang disentuh, dan total kontrak PNBP tidak berubah. Sebelum
            menulis apa pun, migrasi memeriksa bahwa koleksi `mou` live
            masih kosong; migrasi hanya bisa dilakukan sekali.
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
              Saya paham ini menulis {JUMLAH_MOU_SEED} dokumen MoU baru
              ke Firestore. Ini tidak bisa dibatalkan dari aplikasi.
            </span>
          </label>
          <div className="mt-3">
            <TombolUtama
              onClick={tanganiMigrasiMou}
              disabled={proses || !setuju || !onMigrasiMou}
            >
              {proses ? 'Memigrasi MoU…' : 'Jalankan migrasi MoU'}
            </TombolUtama>
          </div>
        </>
      )}

      {(proses || kemajuan) && !hasil && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#0d2569]">
            {kemajuan ? LABEL_TAHAP_MIGRASI_MOU[kemajuan.tahap] : 'Memulai…'}
          </p>
        </div>
      )}

      {galat && (
        <div className="mt-3">
          <Peringatan teks={galat} />
          {kemajuan && (
            <p className="mt-2 text-sm text-[#0d2569]/70">
              Berhenti di: {LABEL_TAHAP_MIGRASI_MOU[kemajuan.tahap]}. Jangan dijalankan lagi. Laporkan ke Digi dengan pesan di atas.
            </p>
          )}
        </div>
      )}

      {hasil && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#0d2569]">
            Migrasi MoU berhasil pada {formatTanggalIso(hasil.tanggal)}.
            Record MoU live: {hasil.sebelum.jumlahMou} →{' '}
            {hasil.sesudah.jumlahMou}. Periksa panel Nota Kesepahaman
            di mode Firestore.
          </p>
        </div>
      )}
    </Kartu>
  );
}

const LABEL_TAHAP_PERBAIKAN_MOU_037: Record<TahapPerbaikanMou037, string> = {
  'baca-live': 'Membaca data MoU 037 live…',
  prakondisi: 'Memeriksa prakondisi…',
  tulis: 'Menulis perbaikan ke MoU 037…',
  verifikasi: 'Memverifikasi data yang diperbaiki…',
  audit: 'Menulis catatan audit…',
  selesai: 'Selesai.',
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
        e instanceof Error ? e.message : 'Perbaikan MoU 037 gagal. Coba lagi.',
      );
    } finally {
      setProses(false);
    }
  }

  return (
    <Kartu>
      <JudulBagian>Perbaiki Data MoU 037 (Sekali jalan)</JudulBagian>
      {statusPerbaikanMou037 === 'tidak-tersedia' ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Perbaikan ini hanya berjalan di data Firestore live. Buka halaman
          ini setelah masuk saat aplikasi dalam mode Firestore. Di mode contoh, data sudah berasal dari seed yang diperbaiki.
        </p>
      ) : sudah ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Sudah diperbaiki
          {hasil ? ` pada ${formatTanggalIso(hasil.tanggal)}` : ''} — PIC
          MoU {ID_MOU_037} adalah {PIC_MOU_037_BARU} dan nama instansi
          sudah bersih. Perbaikan ini hanya bisa dilakukan sekali.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Mengatur PIC MoU {ID_MOU_037} menjadi {PIC_MOU_037_BARU} dan
            menghapus backtick nyasar di akhir nama instansinya. Hanya satu
            dokumen itu dan hanya dua field itu yang diubah; tidak ada
            dokumen atau koleksi lain yang disentuh, dan total kontrak PNBP
            tidak berubah. Sebelum menulis apa pun, perbaikan memeriksa
            bahwa data live masih bernilai lama; perbaikan hanya bisa
            dilakukan sekali.
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
              Saya paham ini memperbarui satu dokumen MoU ({ID_MOU_037})
              di Firestore. Ini tidak bisa dibatalkan dari aplikasi.
            </span>
          </label>
          <div className="mt-3">
            <TombolUtama
              onClick={tanganiPerbaikanMou037}
              disabled={proses || !setuju || !onPerbaikanMou037}
            >
              {proses ? 'Memperbaiki MoU 037…' : 'Jalankan perbaikan MoU 037'}
            </TombolUtama>
          </div>
        </>
      )}

      {(proses || kemajuan) && !hasil && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#0d2569]">
            {kemajuan
              ? LABEL_TAHAP_PERBAIKAN_MOU_037[kemajuan.tahap]
              : 'Memulai…'}
          </p>
        </div>
      )}

      {galat && (
        <div className="mt-3">
          <Peringatan teks={galat} />
          {kemajuan && (
            <p className="mt-2 text-sm text-[#0d2569]/70">
              Berhenti di: {LABEL_TAHAP_PERBAIKAN_MOU_037[kemajuan.tahap]}.
              Jangan dijalankan lagi. Laporkan ke Digi dengan pesan di atas.
            </p>
          )}
        </div>
      )}

      {hasil && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#0d2569]">
            Perbaikan MoU 037 berhasil pada {formatTanggalIso(hasil.tanggal)}.
            PIC: {hasil.sebelum.pic} → {hasil.sesudah.pic}. Periksa panel
            Nota Kesepahaman di mode Firestore.
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
          : 'Migrasi Dukungan Layanan gagal. Coba lagi.',
      );
    } finally {
      setProses(false);
    }
  }

  return (
    <Kartu>
      <JudulBagian>Migrasi Data Dukungan Layanan</JudulBagian>
      {statusMigrasiCommitment === 'tidak-tersedia' ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Migrasi Dukungan Layanan hanya berjalan di data Firestore live.
          Buka halaman ini setelah masuk saat aplikasi dalam mode Firestore. Di mode contoh, data sudah berasal dari seed baru.
        </p>
      ) : sudah ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Sudah dimigrasi pada{' '}
          {hasil
            ? formatTanggalIso(hasil.tanggal)
            : tanggalMigrasiCommitment
              ? formatTanggalIso(tanggalMigrasiCommitment)
              : 'tanggal yang tercatat'}
          . Migrasi Dukungan Layanan hanya bisa dilakukan sekali.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Menulis {JUMLAH_COMMITMENT_SEED} record Dukungan Layanan dari
            &lsquo;Dukungan Layanan 2026&rsquo; ke koleksi `commitment`
            di Firestore. Tidak ada yang dihapus, tidak ada koleksi lain
            yang disentuh, dan total kontrak PNBP tidak berubah. Sebelum
            menulis apa pun, migrasi memeriksa bahwa koleksi `commitment`
            live masih kosong; migrasi hanya bisa dilakukan sekali.
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
              Saya paham ini menulis {JUMLAH_COMMITMENT_SEED} dokumen
              Dukungan Layanan baru ke Firestore. Ini tidak bisa dibatalkan
              dari aplikasi.
            </span>
          </label>
          <div className="mt-3">
            <TombolUtama
              onClick={tanganiMigrasiCommitment}
              disabled={proses || !setuju || !onMigrasiCommitment}
            >
              {proses ? 'Memigrasi Dukungan Layanan…' : 'Jalankan migrasi Dukungan Layanan'}
            </TombolUtama>
          </div>
        </>
      )}

      {(proses || kemajuan) && !hasil && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#0d2569]">
            {kemajuan
              ? LABEL_TAHAP_MIGRASI_COMMITMENT[kemajuan.tahap]
              : 'Memulai…'}
          </p>
        </div>
      )}

      {galat && (
        <div className="mt-3">
          <Peringatan teks={galat} />
          {kemajuan && (
            <p className="mt-2 text-sm text-[#0d2569]/70">
              Berhenti di: {LABEL_TAHAP_MIGRASI_COMMITMENT[kemajuan.tahap]}.
              Jangan dijalankan lagi. Laporkan ke Digi dengan pesan di atas.
            </p>
          )}
        </div>
      )}

      {hasil && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#0d2569]">
            Migrasi Dukungan Layanan berhasil pada{' '}
            {formatTanggalIso(hasil.tanggal)}. Record Dukungan Layanan live:{' '}
            {hasil.sebelum.jumlahCommitment} →{' '}
            {hasil.sesudah.jumlahCommitment}. Periksa panel Dukungan Layanan
            di mode Firestore.
          </p>
        </div>
      )}
    </Kartu>
  );
}

const LABEL_TAHAP_BACKFILL_KLIENID: Record<TahapBackfillKlienId, string> = {
  guard: 'Memeriksa status backfill…',
  'baca-live': 'Membaca data live…',
  prakondisi: 'Memeriksa prakondisi…',
  tulis: 'Menulis field klienId…',
  verifikasi: 'Memverifikasi data baru…',
  audit: 'Menulis catatan audit…',
  selesai: 'Selesai.',
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
        e instanceof Error ? e.message : 'Backfill klienId gagal. Coba lagi.',
      );
    } finally {
      setProses(false);
    }
  }

  return (
    <Kartu>
      <JudulBagian>Pengisian klienId (Sekali jalan)</JudulBagian>
      {statusBackfillKlienId === 'tidak-tersedia' ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Backfill klienId hanya berjalan di data Firestore live. Buka
          halaman ini setelah masuk saat aplikasi dalam mode Firestore. Di mode contoh, data sudah berasal dari seed baru.
        </p>
      ) : sudah ? (
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Sudah di-backfill pada{' '}
          {hasil
            ? formatTanggalIso(hasil.tanggal)
            : tanggalBackfillKlienId
              ? formatTanggalIso(tanggalBackfillKlienId)
              : 'tanggal yang tercatat'}
          . Backfill klienId hanya bisa dilakukan sekali.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Menambahkan field `klienId` ke dokumen Firestore live supaya
            klien bisa membaca datanya sendiri: {HITUNGAN_BACKFILL_DIHARAPKAN.tagihan}{' '}
            tagihan, {HITUNGAN_BACKFILL_DIHARAPKAN.pembayaran} pembayaran,{' '}
            {HITUNGAN_BACKFILL_DIHARAPKAN.denda} denda, dan{' '}
            {HITUNGAN_BACKFILL_DIHARAPKAN.dokumen} dokumen (dari
            kontrak/tagihan induknya), plus 3 record MoU yang ditautkan
            berdasarkan nama instansi yang persis sama. Hanya field `klienId` yang ditulis. Tidak ada yang dihapus, tidak ada
            field atau koleksi lain yang disentuh, dan total kontrak PNBP
            tidak berubah. Sebelum menulis apa pun, backfill memeriksa
            bahwa hitungan live masih cocok dengan seed; backfill hanya
            bisa dilakukan sekali. Jalankan ini SEBELUM mengundang akun
            klien pertama.
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
              Saya paham ini memperbarui field `klienId` pada dokumen
              live. Ini tidak bisa dibatalkan dari aplikasi.
            </span>
          </label>
          <div className="mt-3">
            <TombolUtama
              onClick={tanganiBackfill}
              disabled={proses || !setuju || !onBackfillKlienId}
            >
              {proses ? 'Mengisi klienId…' : 'Jalankan backfill klienId'}
            </TombolUtama>
          </div>
        </>
      )}

      {(proses || kemajuan) && !hasil && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#0d2569]">
            {kemajuan
              ? LABEL_TAHAP_BACKFILL_KLIENID[kemajuan.tahap]
              : 'Memulai…'}
          </p>
        </div>
      )}

      {galat && (
        <div className="mt-3">
          <Peringatan teks={galat} />
          {kemajuan && (
            <p className="mt-2 text-sm text-[#0d2569]/70">
              Berhenti di: {LABEL_TAHAP_BACKFILL_KLIENID[kemajuan.tahap]}.
              Jangan dijalankan lagi. Laporkan ke Digi dengan pesan di atas.
            </p>
          )}
        </div>
      )}

      {hasil && (
        <div className="mt-3">
          <p className="text-sm font-semibold text-[#0d2569]">
            Backfill klienId berhasil pada{' '}
            {formatTanggalIso(hasil.tanggal)}. Dokumen diperbarui:{' '}
            {hasil.jumlahDitulis} (dokumen tanpa klienId:{' '}
            {hasil.sebelum.tanpaKlienId} → {hasil.sesudah.tanpaKlienId}).
            Verifikasi dengan masuk sebagai klien contoh.
          </p>
        </div>
      )}
    </Kartu>
  );
}

/**
 * Bagian "Invite Client Account" — Admin menautkan akun Auth ke
 * record klien (tiga peran 20/11/2026). DUA KASUS (signup publik
 * 19/11/2026 16:12 WIB): (1) INVITE — Admin membuat akun Auth di
 * Firebase console (Authentication → Add user, email + kata sandi),
 * menyalin UID akun itu, mengisi form ini; form menulis dokumen
 * profil `users/{uid}` (peran + klienId). (2) TAUTKAN AKUN SIGNUP —
 * calon klien sudah daftar sendiri dari halaman login (profil client
 * tanpa klienId sudah ada); Admin memasukkan UID akun itu
 * (dilihat di console Authentication, dicocokkan lewat email) dan
 * form HANYA menambah klienId ke profil yang sudah ada (email form
 * harus sama dengan email profil — salah tautan ditolak). Akun yang
 * sudah tertaut tidak bisa ditautkan ulang dari sini — perubahan
 * peran dilakukan admin langsung di console.
 *
 * PERINGATAN EMAIL (temuan 19/11/2026): SEMUA 33 record klien seed
 * punya email KOSONG — email akun Auth TIDAK BISA diambil dari record
 * klien dan TIDAK BOLEH dikarang. Admin memakai alamat email asli
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
      setGalat('UID Auth wajib diisi. Salin dari Firebase console → Authentication → Users.');
      return;
    }
    if (email.trim() === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setGalat('Email Auth yang valid wajib diisi. Harus sama dengan email akun (email saat mendaftar, atau email yang dipakai saat membuat akun di console).');
      return;
    }
    if (nama.trim() === '') {
      setGalat('Nama wajib diisi.');
      return;
    }
    if (peran === 'client' && klienId === '') {
      setGalat('Pilih data klien yang ditautkan ke akun ini.');
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
          ? `Akun klien ditautkan ke ${klienId}. Klien kini bisa masuk dengan ${email.trim()} dan hanya akan melihat kerja samanya sendiri.`
          : `Akun operator dibuat untuk ${email.trim()}. Mereka kini bisa masuk dan akan melihat portal admin.`,
      );
      setUidAuth('');
      setEmail('');
      setNama('');
      setJabatan('');
      setKlienId('');
    } catch (e) {
      setGalat(e instanceof Error ? e.message : 'Undangan gagal. Coba lagi.');
    } finally {
      setProses(false);
    }
  }

  return (
    <Kartu>
      <JudulBagian>Undang Akun Klien</JudulBagian>
      <p className="mt-2 text-sm text-[#0d2569]/70">
        Buat akun klien dan operator. Klien juga bisa mendaftar sendiri
        dari halaman login. Untuk menautkan akun yang sudah mendaftar,
        masukkan UID Auth-nya (dari Firebase console) dan email
        pendaftarannya di sini. Atau undang: buat dulu akun Auth di
        Firebase console (Authentication → Add user, email + kata
        sandi), salin UID-nya, lalu tautkan di sini. Akun klien hanya
        melihat kerja sama yang ditautkan ke data kliennya.{' '}
        {sudahPunyaAkun} dari {daftarKlien?.length ?? 0} data klien
        sudah punya akun.
      </p>
      <p className="mt-2 text-sm font-semibold text-[#0d2569]">
        Tidak ada email tercatat: semua data klien di seed tidak punya
        email. Pakai alamat email asli klien (dari luar aplikasi) saat
        membuat akun di console. Jangan mengarang email.
      </p>
      {daftarKlien === undefined ? (
        <p className="mt-3 text-sm text-[#0d2569]/70">
          Daftar klien tidak tersedia di mode ini.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-[#0d2569]">
              Peran
            </label>
            <select
              className="w-full rounded-md border border-[#0d2569]/20 bg-white px-3 py-2 text-sm text-[#0d2569]"
              value={peran}
              onChange={(e) =>
                setPeran(e.target.value as 'operator' | 'client')
              }
              disabled={proses}
            >
              <option value="client">Klien</option>
              <option value="operator">Operator</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-[#0d2569]">
              UID Auth *
            </label>
            <input
              className="w-full rounded-md border border-[#0d2569]/20 bg-white px-3 py-2 text-sm text-[#0d2569]"
              value={uidAuth}
              onChange={(e) => setUidAuth(e.target.value)}
              placeholder="UID dari Firebase console"
              disabled={proses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-[#0d2569]">
              Email Auth *
            </label>
            <input
              className="w-full rounded-md border border-[#0d2569]/20 bg-white px-3 py-2 text-sm text-[#0d2569]"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email yang dipakai di console"
              disabled={proses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-[#0d2569]">
              Nama *
            </label>
            <input
              className="w-full rounded-md border border-[#0d2569]/20 bg-white px-3 py-2 text-sm text-[#0d2569]"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama pemegang akun"
              disabled={proses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-[#0d2569]">
              Jabatan
            </label>
            <input
              className="w-full rounded-md border border-[#0d2569]/20 bg-white px-3 py-2 text-sm text-[#0d2569]"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              placeholder={peran === 'client' ? 'Klien' : 'Staf Layanan & Pengembangan Usaha'}
              disabled={proses}
            />
          </div>
          {peran === 'client' && (
            <div>
              <label className="mb-1.5 block text-sm font-bold text-[#0d2569]">
                Data klien *
              </label>
              <select
                className="w-full rounded-md border border-[#0d2569]/20 bg-white px-3 py-2 text-sm text-[#0d2569]"
                value={klienId}
                onChange={(e) => setKlienId(e.target.value)}
                disabled={proses}
              >
                <option value="">— Pilih data klien —</option>
                {daftarKlien.map((k) => (
                  <option key={k.id} value={k.id} disabled={k.akunKlienDibuat}>
                    {k.nama} ({k.id}) — tidak ada email tercatat
                    {k.akunKlienDibuat ? ' — akun sudah dibuat' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
      <div className="mt-4">
        <TombolUtama onClick={tanganiUndang} disabled={proses || !onUndangKlien}>
          {proses ? 'Menautkan akun…' : 'Tautkan akun'}
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


/**
 * Bagian "Create Internal Account" — HANYA Admin (tiga peran
 * 20/11/2026: admin yang membuat akses untuk akun lain). Admin
 * mengisi nama, jabatan, email, kata sandi, dan peran internal
 * (operator / admin) — akun Auth + profil dibuat dari dalam
 * aplikasi lewat secondary FirebaseApp, jadi admin TIDAK perlu ke
 * Firebase console dan sesinya TIDAK terganti. Akun CLIENT tidak
 * bisa dibuat dari sini — client hanya lewat signup publik
 * (selalu 'client') atau kartu "Invite Client Account" di bawah
 * (invite + tautan). Kartu ini hanya tampil bila pengguna punya
 * aksi 'kelolaAkun' (admin saja); halaman Master & Users sendiri
 * juga hanya tampil untuk admin (nav admin di App.tsx).
 */
function BagianBuatAkunInternal({
  user,
  onBuatAkunInternal,
}: {
  user: ModulProps['user'];
  onBuatAkunInternal?: (
    input: BuatAkunInternalInput,
  ) => Promise<{ galat: string | null; uid?: string }>;
}) {
  const [peran, setPeran] =
    useState<BuatAkunInternalInput['peran']>('operator');
  const [email, setEmail] = useState('');
  const [kataSandi, setKataSandi] = useState('');
  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [proses, setProses] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [sukses, setSukses] = useState<string | null>(null);

  if (!bolehAksi(user.peran, 'kelolaAkun')) return null;

  async function tanganiBuat() {
    if (!onBuatAkunInternal || proses) return;
    setGalat(null);
    setSukses(null);
    if (nama.trim() === '') {
      setGalat('Nama wajib diisi.');
      return;
    }
    if (email.trim() === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setGalat('Email yang valid wajib diisi.');
      return;
    }
    if (kataSandi.length < 6) {
      setGalat('Kata sandi minimal 6 karakter.');
      return;
    }
    setProses(true);
    try {
      const hasil = await onBuatAkunInternal({
        peran,
        email: email.trim(),
        kataSandi,
        nama: nama.trim(),
        jabatan:
          jabatan.trim() ||
          (peran === 'admin'
            ? 'Administrator Web App'
            : 'Staf Layanan & Pengembangan Usaha'),
      });
      if (hasil.galat !== null) {
        setGalat(hasil.galat);
        return;
      }
      setSukses(
        `Akun ${LABEL_PERAN[peran]} dibuat untuk ${email.trim()} (UID Auth ${hasil.uid ?? '—'}). Mereka kini bisa masuk dan akan melihat portal admin.`,
      );
      setEmail('');
      setKataSandi('');
      setNama('');
      setJabatan('');
    } catch (e) {
      setGalat(e instanceof Error ? e.message : 'Pembuatan gagal. Coba lagi.');
    } finally {
      setProses(false);
    }
  }

  return (
    <Kartu>
      <JudulBagian>Buat Akun Internal</JudulBagian>
      <p className="mt-2 text-sm text-[#0d2569]/70">
        Buat akun Operator atau Admin. Akun dibuat di sini, di dalam
        aplikasi. Tidak perlu membuka Firebase console, dan sesi Anda
        sendiri tetap masuk. Akun klien tidak bisa dibuat di sini: klien
        mendaftar sendiri dari halaman login, atau pakai &ldquo;Undang
        Akun Klien&rdquo; di bawah.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-[#0d2569]">
            Peran *
          </label>
          <select
            className="w-full rounded-md border border-[#0d2569]/20 bg-white px-3 py-2 text-sm text-[#0d2569]"
            value={peran}
            onChange={(e) =>
              setPeran(e.target.value as BuatAkunInternalInput['peran'])
            }
            disabled={proses}
          >
            <option value="operator">Operator — Staf Layanan &amp; Pengembangan Usaha</option>
            <option value="admin">Admin — Super User (Administrator Aplikasi)</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-[#0d2569]">
            Email *
          </label>
          <input
            className="w-full rounded-md border border-[#0d2569]/20 bg-white px-3 py-2 text-sm text-[#0d2569]"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email untuk akun baru"
            disabled={proses}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-[#0d2569]">
            Kata sandi *
          </label>
          <input
            className="w-full rounded-md border border-[#0d2569]/20 bg-white px-3 py-2 text-sm text-[#0d2569]"
            type="password"
            value={kataSandi}
            onChange={(e) => setKataSandi(e.target.value)}
            placeholder="minimal 6 karakter"
            disabled={proses}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-[#0d2569]">
            Nama *
          </label>
          <input
            className="w-full rounded-md border border-[#0d2569]/20 bg-white px-3 py-2 text-sm text-[#0d2569]"
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama pemegang akun"
            disabled={proses}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-[#0d2569]">
            Jabatan
          </label>
          <input
            className="w-full rounded-md border border-[#0d2569]/20 bg-white px-3 py-2 text-sm text-[#0d2569]"
            type="text"
            value={jabatan}
            onChange={(e) => setJabatan(e.target.value)}
            placeholder="Staf Layanan & Pengembangan Usaha"
            disabled={proses}
          />
        </div>
      </div>
      <div className="mt-4">
        <TombolUtama onClick={tanganiBuat} disabled={proses || !onBuatAkunInternal}>
          {proses ? 'Membuat akun…' : 'Buat akun'}
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
    user,
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
    onBuatAkunInternal,
    onBackfillKlienId,
    statusBackfillKlienId = 'tidak-tersedia',
    tanggalBackfillKlienId,
  } = props;
  return (
    <div className="space-y-6">
      <p className="text-sm text-[#0d2569]/70">
        Data master adalah satu-satunya sumber kebenaran aplikasi (satu
        kode akun = satu klasifikasi). Halaman ini hanya menampilkan data
        master. Perubahan dilakukan oleh Admin.
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

      <BagianBuatAkunInternal
        user={user}
        onBuatAkunInternal={onBuatAkunInternal}
      />

      <Peringatan teks="Data master hanya diubah oleh Admin; nilai yang sudah dipakai transaksi tidak bisa dihapus, hanya dinonaktifkan." />

      {/* Kode Akun */}
      <Kartu>
        <JudulBagian>Kode Akun</JudulBagian>
        <div className="mt-3">
          <Tabel>
            <thead>
              <tr>
                <Th>Kode</Th>
                <Th>Uraian</Th>
                <Th>Jenis PNBP</Th>
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
        <JudulBagian>Kategori Layanan</JudulBagian>
        <div className="mt-3">
          <Tabel>
            <thead>
              <tr>
                <Th>Nama</Th>
                <Th>Kode Akun</Th>
                <Th>Jenis PNBP</Th>
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
        <DaftarNilai judul="Program" nilai={MASTER_PROGRAMA} />
        <DaftarNilai
          judul="Jenis Klien"
          nilai={MASTER_JENIS_KLIEN}
          label={labelJenisKlien}
        />
        <DaftarNilai
          judul="Jenis Dokumen"
          nilai={MASTER_JENIS_DOKUMEN}
          label={labelJenisDokumen}
        />
        <DaftarNilai
          judul="Status Kontrak"
          nilai={MASTER_STATUS_KONTRAK}
          label={labelStatusKontrak}
        />
        <DaftarNilai
          judul="Tahap Pengajuan"
          nilai={MASTER_TAHAP_PENGAJUAN}
          label={labelTahapPengajuan}
        />
        <DaftarNilai
          judul="Tahap Alur Penawaran"
          nilai={MASTER_TAHAP_PIPELINE}
          label={labelTahapPipeline}
        />
        <DaftarNilai
          judul="Sumber Prospek"
          nilai={MASTER_SUMBER_PROSPEK}
          label={labelSumberProspek}
        />
        <DaftarNilai
          judul="Status Penawaran"
          nilai={MASTER_STATUS_QUOTATION}
          label={labelStatusPersetujuan}
        />
        <DaftarNilai
          judul="Status Pesanan"
          nilai={MASTER_STATUS_ORDER}
          label={labelStatusOrder}
        />
        <DaftarNilai
          judul="Status Tugas"
          nilai={MASTER_STATUS_TASK}
          label={labelStatusTask}
        />
      </div>

      {/* Daftar Satker */}
      <Kartu>
        <JudulBagian>Satuan Kerja</JudulBagian>
        <p className="mt-2 text-sm text-[#0d2569]/70">
          {JUMLAH_SATKER_BERNOMOR} satuan kerja. Satker percontohan Fase A:{' '}
          <strong className="text-[#0d2569]">
            {SATKER_PILOT.nama} (kode {SATKER_PILOT.kode})
          </strong>
          . Ejaan nama mengikuti spreadsheet sumber &ldquo;LAPORAN PNBP
          2026&rdquo; dan menunggu verifikasi kantor pusat.
        </p>
        <div className="mt-3 max-h-96 overflow-auto rounded-md border border-[#2573e2]/20">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <Th className="sticky top-0 bg-white pl-3">No</Th>
                <Th className="sticky top-0 bg-white">Nama Satker</Th>
                <Th className="sticky top-0 bg-white">Koordinator Wilayah</Th>
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
                        Satker percontohan
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

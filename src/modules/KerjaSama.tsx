// Menu kerja sama baru (keputusan pengguna 15/11/2026): Contract,
// Memorandum of Understanding, Commitment, Approvement — menu tingkat
// atas di bawah Campaign.
//
// FAKTA DATA (impor nyata 14/11/2026, 42 kontrak — semuanya PNBP):
// kategoriLayanan yang ada hanya 'Jasa Penyiaran' (24), 'Jasa
// Penggunaan Sarana dan Prasarana Siaran' (17), dan 'Jasa Digitalisasi
// Penyiaran' (1). NOL kontrak berkategori 'Nota Kesepahaman',
// 'Dukungan Layanan', atau 'Media Partner'.
// - MoU (impor 19/11/2026): data TERPISAH, bukan kontrak — 44 record
//   dari file pengguna "Rekapitulasi_Nota_Kesepahaman.xlsx" (seed
//   src/lib/seedMou.ts, koleksi Firestore `mou`). Semua 44 baris
//   adalah MoU meski label JENIS berbeda (26 Nota Kesepahaman, 17
//   Perjanjian Kerjasama, 1 Pelaksanaan Kerja Sama). Panel MoU membaca
//   data.mou (bukan kontrak) — JANGAN kembalikan filter kontrak.
//   Sebelum migrasi MoU dijalankan (Master & Pengguna), panel
//   menampilkan empty state jujur.
// - Commitment (impor 19/11/2026): data TERPISAH seperti MoU, bukan
//   kontrak — 4 record dari file pengguna "Dukungan_Layanan_2026.xlsx"
//   (seed src/lib/seedCommitment.ts, koleksi Firestore `commitment`).
//   Panel Commitment membaca data.commitment (bukan kontrak) — JANGAN
//   kembalikan filter kontrak. Sebelum migrasi Commitment dijalankan
//   (Master & Pengguna), panel menampilkan empty state jujur.
// - Approvement (definisi pengguna 24/11/2026): surat persetujuan
//   Kepala RRI atas permintaan media partner — data TERPISAH, bukan
//   kontrak (seed src/lib/seedApprovement.ts, 4 record DUMMY: 2
//   organisasi mahasiswa + 2 komunitas; koleksi Firestore
//   `approvement`). Panel Media Partner membaca data.approvement
//   (bukan kontrak) — JANGAN kembalikan filter kontrak. Sebelum
//   migrasi Approvement dijalankan, panel menampilkan empty state
//   jujur; migrasi adalah langkah terpisah setelah PR merge.

import { useState } from 'react';
import { TabKontrak } from './Deals';
import type { ModulProps } from '../lib/store';
import { formatRupiah, formatTanggal } from '../lib/format';
import type { Commitment, Mou } from '../lib/types';
import {
  Baris,
  JudulBagian,
  Kartu,
  Label,
  PesanKosong,
  Tabel,
  Td,
  Th,
  TombolSekunder,
  inputClass,
} from '../components/ui';
import type {
  ArahUrutKontrak,
  FilterStatusKerjaSama,
  FilterStatusPembayaran,
  KunciUrutKontrak,
} from '../lib/kontrakTampilan';
import { sisaHariMou } from '../lib/kontrakTampilan';

interface PropsKategori extends ModulProps {
  /**
   * Nilai `Kontrak.kategoriLayanan` yang difilter; null = semua kontrak
   * (menu Contract). (MoU tidak lagi memakai filter ini sejak impor MoU
   * 19/11/2026: panel MoU membaca data.mou lewat DaftarMou; Commitment
   * tidak lagi memakai filter ini sejak impor Commitment 19/11/2026:
   * panel Commitment membaca data.commitment lewat DaftarCommitment;
   * Approvement tidak lagi memakai filter ini sejak 24/11/2026: panel
   * Media Partner membaca data.approvement lewat DaftarApprovement.)
   */
  kategori: string | null;
  /** Teks empty state jujur bila belum ada record berkategori ini. */
  teksKosong?: string;
  /** Penjelasan singkat di bawah empty state. */
  penjelasanKosong?: string;
}

function DaftarKontrakKategori({
  data,
  user,
  actions,
  cari,
  onNavigasiKlien,
  kategori,
  teksKosong,
  penjelasanKosong,
}: PropsKategori) {
  // State lokal sama seperti Deals (tab kontrak): pilihan, form,
  // filter, dan sort — supaya TabKontrak dipakai ulang apa adanya.
  const [kontrakIdTerpilih, setKontrakIdTerpilih] = useState<string | null>(null);
  const [tampilForm, setTampilForm] = useState(false);
  const [filterPnBP, setFilterPnBP] = useState<'Semua' | 'Fungsional' | 'Umum'>('Semua');
  const [filterJenisKlien, setFilterJenisKlien] = useState<string>('Semua');
  const [filterStatusPembayaran, setFilterStatusPembayaran] =
    useState<FilterStatusPembayaran>('Semua');
  const [filterStatusKerjaSama, setFilterStatusKerjaSama] =
    useState<FilterStatusKerjaSama>('Semua');
  const [urutKunci, setUrutKunci] = useState<KunciUrutKontrak>('tandaTangan');
  const [urutArah, setUrutArah] = useState<ArahUrutKontrak>('turun');

  const kataKunci = cari.trim().toLowerCase();
  const cocokCari = (teks: string) =>
    kataKunci === '' || teks.toLowerCase().includes(kataKunci);

  const kontrakTersaring =
    kategori === null
      ? data.kontrak
      : data.kontrak.filter((k) => k.kategoriLayanan === kategori);
  const kontrakTerpilih = kontrakIdTerpilih
    ? kontrakTersaring.find((k) => k.id === kontrakIdTerpilih) ?? null
    : null;

  // Belum ada record berkategori ini: empty state jujur, bukan tabel kosong.
  if (kategori !== null && kontrakTersaring.length === 0) {
    return (
      <div className="space-y-3">
        <PesanKosong teks={teksKosong ?? 'Belum ada catatan.'} />
        {penjelasanKosong && (
          <p className="max-w-2xl text-sm text-[#0d2569]/70">{penjelasanKosong}</p>
        )}
      </div>
    );
  }

  return (
    <TabKontrak
      data={{ ...data, kontrak: kontrakTersaring }}
      user={user}
      actions={actions}
      cocokCari={cocokCari}
      kontrakTerpilih={kontrakTerpilih}
      onPilihKontrak={setKontrakIdTerpilih}
      tampilForm={tampilForm}
      onTampilForm={setTampilForm}
      filterPnBP={filterPnBP}
      onFilterPnBP={setFilterPnBP}
      filterJenisKlien={filterJenisKlien}
      onFilterJenisKlien={setFilterJenisKlien}
      filterStatusPembayaran={filterStatusPembayaran}
      onFilterStatusPembayaran={setFilterStatusPembayaran}
      filterStatusKerjaSama={filterStatusKerjaSama}
      onFilterStatusKerjaSama={setFilterStatusKerjaSama}
      urutKunci={urutKunci}
      onUrutKunci={setUrutKunci}
      urutArah={urutArah}
      onUrutArah={setUrutArah}
      onNavigasiKlien={onNavigasiKlien}
    />
  );
}

/** Contract — daftar kontrak PNBP yang sama seperti Deals (42 kontrak). */
export function MenuKontrak(props: ModulProps) {
  return <DaftarKontrakKategori {...props} kategori={null} />;
}

/**
 * Memorandum of Understanding — Nota Kesepahaman untuk mendukung
 * program siaran. Data TERPISAH dari kontrak (impor MoU 19/11/2026,
 * 44 record dari file pengguna); panel membaca data.mou.
 */
export function MenuMoU({ data, cari }: ModulProps) {
  return <DaftarMou data={data} cari={cari} />;
}

/** Detail satu MoU — semua field dari file sumber. */
function DetailMou({ mou, onKembali }: { mou: Mou; onKembali: () => void }) {
  const baris: [string, string][] = [
    ['Nomor dokumen', mou.id],
    ['Jenis', mou.jenis],
    ['Instansi', mou.instansi],
    ['Kategori', mou.kategori],
    ['Narahubung', mou.narahubung],
    ['Telepon', mou.telepon],
    ['Tema', mou.tematik],
    ['Asta Cita', mou.astaCita],
    ['Judul kerja sama', mou.judul],
    ['Tanggal tanda tangan', formatTanggal(mou.tanggalTandaTangan)],
    [
      'Periode kerja sama',
      `${formatTanggal(mou.tanggalMulai)} — ${formatTanggal(mou.tanggalSelesai)}`,
    ],
    ['Masa berlaku', mou.masaBerlaku],
    ['Dokumen', mou.dokumen],
    ['PIC', mou.pic],
  ];
  return (
    <div className="space-y-4">
      <div>
        <TombolSekunder onClick={onKembali}>← Kembali ke daftar</TombolSekunder>
      </div>
      <Kartu>
        <JudulBagian>{mou.judul}</JudulBagian>
        <div className="mt-3 space-y-2">
          {baris.map(([label, nilai]) => (
            <div
              key={label}
              className="grid grid-cols-[180px_1fr] gap-2 text-sm"
            >
              <span className="font-semibold text-[#0d2569]/60">{label}</span>
              <span className="text-[#0d2569]">{nilai}</span>
            </div>
          ))}
        </div>
      </Kartu>
    </div>
  );
}

/**
 * Daftar MoU — tabel dari data.mou (bukan kontrak). Diurutkan tanggal
 * penandatanganan terbaru dulu; pencarian `cari` memfilter nomor,
 * instansi, judul, PIC, jenis, kategori, narahubung, dan dokumen.
 * Kolom "Remaining Days" (perbaikan 19/11/2026) di samping Period —
 * hitung mundur ke tanggalSelesai, format sama seperti tabel Contract.
 * Kolom "Document" paling kanan (perbaikan 19/11/2026): nilai `dokumen`
 * record; bila bernilai label asli (bukan '—'), tombol View membuka
 * detail MoU. `dokumen` saat ini hanya label jenis dokumen, BUKAN
 * tautan file (tahap upload dokumen masih ditunda) — jangan dikarang
 * menjadi tautan.
 */
function DaftarMou({ data, cari }: Pick<ModulProps, 'data' | 'cari'>) {
  const [mouIdTerpilih, setMouIdTerpilih] = useState<string | null>(null);

  const kataKunci = cari.trim().toLowerCase();
  const mouTersaring = [...data.mou]
    .sort((a, b) => b.tanggalTandaTangan.localeCompare(a.tanggalTandaTangan))
    .filter(
      (m) =>
        kataKunci === '' ||
        `${m.id} ${m.jenis} ${m.instansi} ${m.kategori} ${m.judul} ${m.pic} ${m.narahubung} ${m.dokumen}`
          .toLowerCase()
          .includes(kataKunci),
    );
  const mouTerpilih = mouIdTerpilih
    ? mouTersaring.find((m) => m.id === mouIdTerpilih) ?? null
    : null;

  if (mouTerpilih) {
    return <DetailMou mou={mouTerpilih} onKembali={() => setMouIdTerpilih(null)} />;
  }

  // Belum ada record MoU di Firestore (migrasi MoU belum dijalankan):
  // empty state jujur, bukan tabel kosong.
  if (mouTersaring.length === 0) {
    return (
      <div className="space-y-3">
        <PesanKosong teks="Belum ada Nota Kesepahaman." />
        <p className="max-w-2xl text-sm text-[#0d2569]/70">
          Belum ada catatan MoU di Firestore. Jalankan migrasi MoU dari
          halaman Master Data &amp; Users untuk mengimpor 44 catatan dari
          &lsquo;Rekapitulasi Nota Kesepahaman&rsquo;.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#0d2569]/70">
        {mouTersaring.length} catatan Nota Kesepahaman.
      </p>
      <Kartu>
        <Tabel>
          <thead>
            <tr>
              <Th>No.</Th>
              <Th>Nomor dokumen</Th>
              <Th>Jenis</Th>
              <Th>Instansi</Th>
              <Th>Kategori</Th>
              <Th>Judul kerja sama</Th>
              <Th>Tanggal tanda tangan</Th>
              <Th>Periode</Th>
              <Th>Sisa hari</Th>
              <Th>Masa berlaku</Th>
              <Th>PIC</Th>
              <Th>Dokumen</Th>
            </tr>
          </thead>
          <tbody>
            {mouTersaring.map((m, i) => (
              <Baris key={m.id} onClick={() => setMouIdTerpilih(m.id)}>
                <Td>{i + 1}</Td>
                <Td tebal>{m.id}</Td>
                <Td>{m.jenis}</Td>
                <Td>{m.instansi}</Td>
                <Td>{m.kategori}</Td>
                <Td>{m.judul}</Td>
                <Td>{formatTanggal(m.tanggalTandaTangan)}</Td>
                <Td>
                  {formatTanggal(m.tanggalMulai)} —{' '}
                  {formatTanggal(m.tanggalSelesai)}
                </Td>
                <Td>{sisaHariMou(m)}</Td>
                <Td>{m.masaBerlaku}</Td>
                <Td>{m.pic}</Td>
                <Td>
                  {m.dokumen === '—' ? (
                    '—'
                  ) : (
                    <>
                      {m.dokumen}{' '}
                      <button
                        type="button"
                        className="text-[#2573e2] underline hover:text-[#0d2569]"
                        onClick={(e) => {
                          // Jangan ikut membuka detail lewat klik baris
                          // saja — tombol View membuka detail MoU yang
                          // sama dengan klik baris.
                          e.stopPropagation();
                          setMouIdTerpilih(m.id);
                        }}
                      >
                        Lihat
                      </button>
                    </>
                  )}
                </Td>
              </Baris>
            ))}
          </tbody>
        </Tabel>
      </Kartu>
    </div>
  );
}

/**
 * Commitment — dokumen kerja sama dukungan layanan untuk support event
 * & program acara di RRI. Data TERPISAH dari kontrak (impor Commitment
 * 19/11/2026, 4 record dari file pengguna); panel membaca
 * data.commitment.
 */
export function MenuKomitmen({ data, cari }: ModulProps) {
  return <DaftarCommitment data={data} cari={cari} />;
}

/** Detail satu Commitment — semua field dari file sumber + tabel item dukungan. */
function DetailCommitment({
  commitment,
  onKembali,
}: {
  commitment: Commitment;
  onKembali: () => void;
}) {
  const baris: [string, string][] = [
    ['Nomor dokumen', commitment.id],
    ['Kegiatan', commitment.kegiatan],
    ['Tanggal kegiatan', formatTanggal(commitment.tanggalKegiatan)],
    ['Mitra', commitment.mitra],
    ['Penandatangan', commitment.penandatangan],
    ['Jabatan penandatangan', commitment.jabatanPenandatangan],
    ['Total dukungan', formatRupiah(commitment.totalDukungan)],
    ['Layanan / Manfaat', commitment.layanan],
    ['Nilai konversi', commitment.nilaiKonversi],
    ['Dokumen', commitment.dokumen],
    ['No. dokumen', commitment.nomorDokumen],
  ];
  return (
    <div className="space-y-4">
      <div>
        <TombolSekunder onClick={onKembali}>← Kembali ke daftar</TombolSekunder>
      </div>
      <Kartu>
        <JudulBagian>
          {commitment.kegiatan} — {commitment.mitra}
        </JudulBagian>
        <div className="mt-3 space-y-2">
          {baris.map(([label, nilai]) => (
            <div
              key={label}
              className="grid grid-cols-[180px_1fr] gap-2 text-sm"
            >
              <span className="font-semibold text-[#0d2569]/60">{label}</span>
              <span className="text-[#0d2569]">{nilai}</span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <p className="text-sm font-semibold text-[#0d2569]">
            Item dukungan (barang)
          </p>
          <div className="mt-2">
            <Tabel>
              <thead>
                <tr>
                  <Th>Item</Th>
                  <Th>Jml</Th>
                  <Th>Harga satuan</Th>
                  <Th>Jumlah</Th>
                </tr>
              </thead>
              <tbody>
                {commitment.dukungan.map((d) => (
                  <Baris key={d.jenis}>
                    <Td>{d.jenis}</Td>
                    <Td>{d.qty}</Td>
                    <Td>{formatRupiah(d.hargaSatuan)}</Td>
                    <Td>{formatRupiah(d.jumlah)}</Td>
                  </Baris>
                ))}
                <Baris>
                  <Td tebal>Total</Td>
                  <Td />
                  <Td />
                  <Td tebal>{formatRupiah(commitment.totalDukungan)}</Td>
                </Baris>
              </tbody>
            </Tabel>
          </div>
        </div>
      </Kartu>
    </div>
  );
}

/**
 * Daftar Commitment — tabel dari data.commitment (bukan kontrak).
 * Diurutkan nomor dokumen (001 → 004); pencarian `cari` memfilter
 * nomor, mitra, kegiatan, penandatangan, dan dokumen.
 */
function DaftarCommitment({ data, cari }: Pick<ModulProps, 'data' | 'cari'>) {
  const [commitmentIdTerpilih, setCommitmentIdTerpilih] = useState<
    string | null
  >(null);

  const kataKunci = cari.trim().toLowerCase();
  const commitmentTersaring = [...data.commitment]
    .sort((a, b) => a.id.localeCompare(b.id))
    .filter(
      (c) =>
        kataKunci === '' ||
        `${c.id} ${c.mitra} ${c.kegiatan} ${c.penandatangan} ${c.dokumen}`
          .toLowerCase()
          .includes(kataKunci),
    );
  const commitmentTerpilih = commitmentIdTerpilih
    ? commitmentTersaring.find((c) => c.id === commitmentIdTerpilih) ?? null
    : null;

  if (commitmentTerpilih) {
    return (
      <DetailCommitment
        commitment={commitmentTerpilih}
        onKembali={() => setCommitmentIdTerpilih(null)}
      />
    );
  }

  // Belum ada record Commitment di Firestore (migrasi Commitment belum
  // dijalankan): empty state jujur, bukan tabel kosong.
  if (commitmentTersaring.length === 0) {
    return (
      <div className="space-y-3">
        <PesanKosong teks="Belum ada dokumen Commitment." />
        <p className="max-w-2xl text-sm text-[#0d2569]/70">
          Belum ada catatan Commitment di Firestore. Jalankan migrasi Commitment dari
          halaman Master Data &amp; Users untuk mengimpor 4 catatan dari
          &lsquo;Dukungan Layanan 2026&rsquo;.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#0d2569]/70">
        {commitmentTersaring.length} catatan Commitment. Total dukungan:{' '}
        {formatRupiah(
          commitmentTersaring.reduce((s, c) => s + c.totalDukungan, 0),
        )}
        .
      </p>
      <Kartu>
        <Tabel>
          <thead>
            <tr>
              <Th>No.</Th>
              <Th>Nomor dokumen</Th>
              <Th>Mitra</Th>
              <Th>Kegiatan</Th>
              <Th>Tanggal kegiatan</Th>
              <Th>Penandatangan</Th>
              <Th>Item dukungan</Th>
              <Th>Total dukungan</Th>
            </tr>
          </thead>
          <tbody>
            {commitmentTersaring.map((c, i) => (
              <Baris
                key={c.id}
                onClick={() => setCommitmentIdTerpilih(c.id)}
              >
                <Td>{i + 1}</Td>
                <Td tebal>{c.id}</Td>
                <Td>{c.mitra}</Td>
                <Td>{c.kegiatan}</Td>
                <Td>{formatTanggal(c.tanggalKegiatan)}</Td>
                <Td>{c.penandatangan}</Td>
                <Td>
                  {c.dukungan.length} item
                </Td>
                <Td>{formatRupiah(c.totalDukungan)}</Td>
              </Baris>
            ))}
          </tbody>
        </Tabel>
      </Kartu>
    </div>
  );
}

/**
 * Approvement — surat persetujuan Kepala RRI atas permintaan media
 * partner (definisi pengguna 24/11/2026). Data TERPISAH dari kontrak
 * (seed 4 record DUMMY: 2 organisasi mahasiswa + 2 komunitas;
 * koleksi Firestore `approvement`); panel membaca data.approvement.
 */
export function MenuApprovement({ data, cari }: ModulProps) {
  return <DaftarApprovement data={data} cari={cari} />;
}

/**
 * Daftar Approvement — tabel dari data.approvement (bukan kontrak).
 * Diurutkan nomor surat; pencarian `cari` memfilter nomor surat,
 * klien, jenis klien, narahubung, dan jenis kompensasi. Kolom
 * "Dokumen" paling kanan: nilai `dokumen` record ('—' bila kosong —
 * tahap upload dokumen masih ditunda, jangan dikarang menjadi tautan).
 */
function DaftarApprovement({ data, cari }: Pick<ModulProps, 'data' | 'cari'>) {
  // Kotak pencarian sendiri di panel (pola panel Contract): pencarian
  // global di top bar dihapus atas instruksi pengguna 15/11/2026, jadi
  // `cari` dari shell selalu '' — pencarian panel memakai state lokal.
  const [pencarian, setPencarian] = useState('');
  const kataKunci = `${cari} ${pencarian}`.trim().toLowerCase();
  const approvementTersaring = [...data.approvement]
    .sort((a, b) => a.nomorSurat.localeCompare(b.nomorSurat))
    .filter(
      (a) =>
        kataKunci === '' ||
        `${a.nomorSurat} ${a.namaKlien} ${a.jenisKlien} ${a.namaNarahubung} ${a.jenisKompensasi}`
          .toLowerCase()
          .includes(kataKunci),
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="min-w-[240px]">
          <Label>Cari</Label>
          <input
            className={inputClass}
            type="search"
            value={pencarian}
            onChange={(e) => setPencarian(e.target.value)}
            placeholder="Nomor surat, klien, narahubung…"
            aria-label="Cari surat persetujuan"
          />
        </div>
      </div>
      {approvementTersaring.length === 0 ? (
        // Belum ada record Approvement di Firestore (migrasi Approvement
        // belum dijalankan): empty state jujur, bukan tabel kosong.
        // Kalau ada record tapi pencarian tidak cocok, pesannya beda.
        data.approvement.length === 0 ? (
          <div className="space-y-3">
            <PesanKosong teks="Belum ada surat persetujuan Media Partner." />
            <p className="max-w-2xl text-sm text-[#0d2569]/70">
              Belum ada catatan Approvement di Firestore. Data contoh (4 surat
              persetujuan: 2 organisasi mahasiswa + 2 komunitas) tersedia di
              seed dan akan tampil di sini setelah dimigrasikan ke Firestore.
            </p>
          </div>
        ) : (
          <PesanKosong teks="Tidak ada surat persetujuan yang cocok dengan pencarian." />
        )
      ) : (
        <>
          <p className="text-sm text-[#0d2569]/70">
            {approvementTersaring.length} surat persetujuan Media Partner.
          </p>
          <Kartu>
        <Tabel>
          <thead>
            <tr>
              <Th>No.</Th>
              <Th>No. Surat</Th>
              <Th>Klien</Th>
              <Th>Jenis Klien</Th>
              <Th>Narahubung</Th>
              <Th>Tanggal Pelaksanaan</Th>
              <Th>Jenis Kompensasi</Th>
              <Th kanan>Nilai Kompensasi</Th>
              <Th>Dokumen</Th>
            </tr>
          </thead>
          <tbody>
            {approvementTersaring.map((a, i) => (
              <Baris key={a.id}>
                <Td>{i + 1}</Td>
                <Td tebal>{a.nomorSurat}</Td>
                <Td>{a.namaKlien}</Td>
                <Td>{a.jenisKlien}</Td>
                <Td>{a.namaNarahubung}</Td>
                <Td>{formatTanggal(a.tanggalPelaksanaan)}</Td>
                <Td>{a.jenisKompensasi}</Td>
                <Td kanan>{formatRupiah(a.nilaiKompensasi)}</Td>
                <Td>{a.dokumen}</Td>
              </Baris>
            ))}
          </tbody>
        </Tabel>
          </Kartu>
        </>
      )}
    </div>
  );
}

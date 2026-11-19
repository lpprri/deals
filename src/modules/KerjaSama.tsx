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
// - Approvement masih MENUNGGU data (empty state jujur sampai datanya
//   diimpor; JANGAN mengarang record dan JANGAN membuat model data baru
//   secara diam-diam).

import { useState } from 'react';
import { TabKontrak } from './Deals';
import type { ModulProps } from '../lib/store';
import { formatRupiah, formatTanggal } from '../lib/format';
import type { Commitment, Mou } from '../lib/types';
import {
  Baris,
  JudulBagian,
  Kartu,
  PesanKosong,
  Tabel,
  Td,
  Th,
  TombolSekunder,
} from '../components/ui';
import type {
  ArahUrutKontrak,
  FilterStatusKerjaSama,
  FilterStatusPembayaran,
  KunciUrutKontrak,
} from '../lib/kontrakTampilan';

interface PropsKategori extends ModulProps {
  /**
   * Nilai `Kontrak.kategoriLayanan` yang difilter; null = semua kontrak
   * (menu Contract). Kategori 'Media Partner' masih MENUNGGU data —
   * lihat komentar di atas. (MoU tidak lagi memakai filter ini sejak
   * impor MoU 19/11/2026: panel MoU membaca data.mou lewat DaftarMou;
   * Commitment tidak lagi memakai filter ini sejak impor Commitment
   * 19/11/2026: panel Commitment membaca data.commitment lewat
   * DaftarCommitment.)
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
        <PesanKosong teks={teksKosong ?? 'No records yet.'} />
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
    ['Document Number', mou.id],
    ['Type', mou.jenis],
    ['Institution', mou.instansi],
    ['Category', mou.kategori],
    ['Contact Person', mou.narahubung],
    ['Phone', mou.telepon],
    ['Theme', mou.tematik],
    ['Asta Cita', mou.astaCita],
    ['Cooperation Title', mou.judul],
    ['Signing Date', formatTanggal(mou.tanggalTandaTangan)],
    [
      'Cooperation Period',
      `${formatTanggal(mou.tanggalMulai)} — ${formatTanggal(mou.tanggalSelesai)}`,
    ],
    ['Validity Period', mou.masaBerlaku],
    ['Document', mou.dokumen],
    ['PIC', mou.pic],
  ];
  return (
    <div className="space-y-4">
      <div>
        <TombolSekunder onClick={onKembali}>← Back to list</TombolSekunder>
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
        <PesanKosong teks="No Memorandum of Understanding yet." />
        <p className="max-w-2xl text-sm text-[#0d2569]/70">
          No MoU records in Firestore yet. Run the MoU migration from the
          Master &amp; Users page to import the 44 records from
          &lsquo;Rekapitulasi Nota Kesepahaman&rsquo;.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#0d2569]/70">
        {mouTersaring.length} Memorandum of Understanding records.
      </p>
      <Kartu>
        <Tabel>
          <thead>
            <tr>
              <Th>No.</Th>
              <Th>Document Number</Th>
              <Th>Type</Th>
              <Th>Institution</Th>
              <Th>Category</Th>
              <Th>Cooperation Title</Th>
              <Th>Signing Date</Th>
              <Th>Period</Th>
              <Th>Validity</Th>
              <Th>PIC</Th>
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
                <Td>{m.masaBerlaku}</Td>
                <Td>{m.pic}</Td>
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
    ['Document Number', commitment.id],
    ['Event', commitment.kegiatan],
    ['Event Date', formatTanggal(commitment.tanggalKegiatan)],
    ['Partner', commitment.mitra],
    ['Signatory', commitment.penandatangan],
    ['Signatory Title', commitment.jabatanPenandatangan],
    ['Total Support', formatRupiah(commitment.totalDukungan)],
    ['Service / Benefit', commitment.layanan],
    ['Conversion Value', commitment.nilaiKonversi],
    ['Document', commitment.dokumen],
    ['Document No.', commitment.nomorDokumen],
  ];
  return (
    <div className="space-y-4">
      <div>
        <TombolSekunder onClick={onKembali}>← Back to list</TombolSekunder>
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
            Support Items (Goods)
          </p>
          <div className="mt-2">
            <Tabel>
              <thead>
                <tr>
                  <Th>Item</Th>
                  <Th>Qty</Th>
                  <Th>Unit Price</Th>
                  <Th>Amount</Th>
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
        <PesanKosong teks="No Commitment documents yet." />
        <p className="max-w-2xl text-sm text-[#0d2569]/70">
          No Commitment records in Firestore yet. Run the Commitment migration from the
          Master &amp; Users page to import the 4 records from
          &lsquo;Dukungan Layanan 2026&rsquo;.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#0d2569]/70">
        {commitmentTersaring.length} Commitment records. Total support:{' '}
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
              <Th>Document Number</Th>
              <Th>Partner</Th>
              <Th>Event</Th>
              <Th>Event Date</Th>
              <Th>Signatory</Th>
              <Th>Support Items</Th>
              <Th>Total Support</Th>
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
                  {c.dukungan.length} item{c.dukungan.length > 1 ? 's' : ''}
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
 * Approvement — dokumen media partner. Data tipe ini masih menunggu
 * (0 record).
 */
export function MenuApprovement(props: ModulProps) {
  return (
    <DaftarKontrakKategori
      {...props}
      kategori="Media Partner"
      teksKosong="No Approvement documents yet."
      penjelasanKosong="No contract in the imported data has the 'Media Partner' service category yet. This list will fill in once such data is imported."
    />
  );
}

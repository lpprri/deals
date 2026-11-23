// Modul Deals — Klien, Kontrak / PKS, Dokumen (PRD v2.0 Final Bab 7.4).
// Palet HANYA 3 warna RRI: Biru #2573E2, Navy #0D2569, Putih #FFFFFF.

import { useEffect, useRef, useState } from 'react';
import type { Klien, Kontrak, StatusDokumen } from '../lib/types';
import type { KlienInput, KontrakInput, LayananInput, ModulProps } from '../lib/store';
import {
  MASTER_JENIS_DOKUMEN,
  MASTER_JENIS_KLIEN,
  MASTER_KATEGORI_LAYANAN,
  MASTER_PROGRAMA,
  uraianKodeAkun,
} from '../lib/master';
import {
  labelJenisDokumen,
  labelJenisKlien,
  labelJenisPnBP,
  labelKategoriLayanan,
  labelStatusDokumen,
  labelStatusKlien,
  labelStatusKontrak,
  labelStatusTagihan,
  labelUraianKodeAkun,
} from '../lib/labels';
import { sisaTagihan, statusTagihan } from '../lib/derive';
import {
  detailLayananKontrak,
  jenisKlienYangAda,
  jatuhTempoPembayaranKontrak,
  judulKontrak,
  kelasPillStatusPembayaran,
  cocokPencarianKontrak,
  labelArahUrutKontrak,
  nomorReferensiKontrak,
  sisaHariKerjaSama,
  sisaHariNegatif,
  statusKerjaSamaKontrak,
  statusPembayaranKontrak,
  tanggalPenandatangananKontrak,
  urutkanKontrak,
  type ArahUrutKontrak,
  type FilterStatusKerjaSama,
  type FilterStatusPembayaran,
  type KunciUrutKontrak,
} from '../lib/kontrakTampilan';
import { formatRupiah, formatTanggal, hariIniIso, normalisasiNama } from '../lib/format';
import {
  JENDELA_WAKTU_SIAR,
  SUMBER_JENDELA_WAKTU_SIAR,
  formatPersenRealisasi,
  kodeBillingKontrak,
  pembayaranTerverifikasiTerakhir,
  piutangRealisasi,
  pisahBuktiSetor,
  realisasiKontrak,
  realisasiLayanan,
  selisihBayarPiutang,
  sisaKontrakRealisasi,
  sisaNilaiSetelahBayar,
  sisaPiutangRealisasi,
  totalDendaKontrak,
  totalPembayaranKontrak,
} from '../lib/realisasi';
import { daftarDokumenKontrak, kelengkapanDokumen } from '../lib/dokumenKontrak';
import {
  CLUSTER_KONTRAK,
  bacaClusterKontrakTersembunyi,
  bacaTampilanRampingKontrak,
  clusterKontrakTerlihatRamping,
  simpanClusterKontrakTersembunyi,
  simpanTampilanRampingKontrak,
} from '../lib/clusterKontrak';
import { bolehAksi } from '../lib/permissions';
import {
  Baris,
  ItemDaftar,
  JudulBagian,
  Kartu,
  Label,
  Peringatan,
  PesanKosong,
  StatusBadge,
  TabBar,
  Tabel,
  Td,
  Th,
  TombolSekunder,
  TombolUtama,
  inputClass,
} from '../components/ui';

function kategoriDariNama(nama: string) {
  return MASTER_KATEGORI_LAYANAN.find((k) => k.nama === nama);
}

function namaKlien(data: ModulProps['data'], klienId: string): string {
  return data.klien.find((k) => k.id === klienId)?.nama ?? klienId;
}

type TabId = 'klien' | 'kontrak' | 'dokumen';

interface BarisLayananForm {
  kategori: string;
  satuan: string;
  tarif: string;
  jumlah: string;
}

const BARIS_LAYANAN_AWAL: BarisLayananForm = {
  kategori: MASTER_KATEGORI_LAYANAN[0].nama,
  satuan: '',
  tarif: '',
  jumlah: '1',
};

export default function Deals(props: ModulProps) {
  const { data, user, actions, cari, onNavigasiKlien } = props;
  const [tab, setTab] = useState<TabId>('klien');

  // Detail dipilih berdasarkan id supaya tampilan selalu membaca data terbaru.
  const [klienIdTerpilih, setKlienIdTerpilih] = useState<string | null>(null);
  const [kontrakIdTerpilih, setKontrakIdTerpilih] = useState<string | null>(null);

  const [tampilFormKlien, setTampilFormKlien] = useState(false);
  const [tampilFormKontrak, setTampilFormKontrak] = useState(false);

  const [filterPnBP, setFilterPnBP] = useState<'Semua' | 'Fungsional' | 'Umum'>('Semua');
  const [filterJenisKlien, setFilterJenisKlien] = useState<string>('Semua');
  const [filterStatusPembayaran, setFilterStatusPembayaran] =
    useState<FilterStatusPembayaran>('Semua');
  const [filterStatusKerjaSama, setFilterStatusKerjaSama] =
    useState<FilterStatusKerjaSama>('Semua');
  const [urutKunciKontrak, setUrutKunciKontrak] =
    useState<KunciUrutKontrak>('tandaTangan');
  const [urutArahKontrak, setUrutArahKontrak] =
    useState<ArahUrutKontrak>('turun');

  const [kontrakDokumenId, setKontrakDokumenId] = useState<string>(
    data.kontrak[0]?.id ?? '',
  );

  const kataKunci = cari.trim().toLowerCase();
  const cocokCari = (teks: string) =>
    kataKunci === '' || teks.toLowerCase().includes(kataKunci);

  const klienTerpilih = klienIdTerpilih
    ? data.klien.find((k) => k.id === klienIdTerpilih) ?? null
    : null;
  const kontrakTerpilih = kontrakIdTerpilih
    ? data.kontrak.find((k) => k.id === kontrakIdTerpilih) ?? null
    : null;

  return (
    <div className="space-y-4">
      <TabBar
        tabs={[
          { id: 'klien', label: 'Klien' },
          { id: 'kontrak', label: 'Kontrak / PKS' },
          { id: 'dokumen', label: 'Dokumen' },
        ]}
        aktif={tab}
        onPilih={(id) => setTab(id as TabId)}
      />

      {tab === 'klien' && (
        <TabKlien
          data={data}
          user={user}
          actions={actions}
          cari={cari}
          cocokCari={cocokCari}
          klienTerpilih={klienTerpilih}
          onPilihKlien={setKlienIdTerpilih}
          tampilForm={tampilFormKlien}
          onTampilForm={setTampilFormKlien}
        />
      )}

      {tab === 'kontrak' && (
        <TabKontrak
          data={data}
          user={user}
          actions={actions}
          cocokCari={cocokCari}
          kontrakTerpilih={kontrakTerpilih}
          onPilihKontrak={setKontrakIdTerpilih}
          tampilForm={tampilFormKontrak}
          onTampilForm={setTampilFormKontrak}
          filterPnBP={filterPnBP}
          onFilterPnBP={setFilterPnBP}
          filterJenisKlien={filterJenisKlien}
          onFilterJenisKlien={setFilterJenisKlien}
          filterStatusPembayaran={filterStatusPembayaran}
          onFilterStatusPembayaran={setFilterStatusPembayaran}
          filterStatusKerjaSama={filterStatusKerjaSama}
          onFilterStatusKerjaSama={setFilterStatusKerjaSama}
          urutKunci={urutKunciKontrak}
          onUrutKunci={setUrutKunciKontrak}
          urutArah={urutArahKontrak}
          onUrutArah={setUrutArahKontrak}
          onNavigasiKlien={onNavigasiKlien}
        />
      )}

      {tab === 'dokumen' && (
        <TabDokumen
          data={data}
          user={user}
          actions={actions}
          kontrakDokumenId={kontrakDokumenId}
          onKontrakDokumenId={setKontrakDokumenId}
        />
      )}
    </div>
  );
}

/* ============================== Tab Klien ============================== */

export function TabKlien({
  data,
  user,
  actions,
  cari,
  cocokCari,
  klienTerpilih,
  onPilihKlien,
  tampilForm,
  onTampilForm,
}: {
  data: ModulProps['data'];
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  cari: string;
  cocokCari: (teks: string) => boolean;
  klienTerpilih: Klien | null;
  onPilihKlien: (id: string | null) => void;
  tampilForm: boolean;
  onTampilForm: (tampil: boolean) => void;
}) {
  const bolehTambah = bolehAksi(user.peran, 'tambahKlien');

  if (klienTerpilih) {
    return (
      <DetailKlien
        data={data}
        klien={klienTerpilih}
        onKembali={() => onPilihKlien(null)}
      />
    );
  }

  const klienTersaring = data.klien.filter((k) =>
    cocokCari(`${k.nama} ${k.kontakNama} ${k.telepon}`),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <JudulBagian>Klien</JudulBagian>
        {bolehTambah && (
          <TombolUtama onClick={() => onTampilForm(true)}>
            + Tambah klien
          </TombolUtama>
        )}
      </div>

      {tampilForm && (
        <FormKlien
          data={data}
          actions={actions}
          onBatal={() => onTampilForm(false)}
          onSukses={() => onTampilForm(false)}
        />
      )}

      {cari.trim() !== '' && (
        <p className="text-sm text-[#0d2569]/70">
          Hasil pencarian untuk &ldquo;{cari.trim()}&rdquo;: {klienTersaring.length} klien
        </p>
      )}

      {klienTersaring.length === 0 ? (
        <PesanKosong teks="Belum ada klien yang cocok." />
      ) : (
        <Kartu>
          <Tabel>
            <thead>
              <tr>
                <Th>Nama</Th>
                <Th>Jenis</Th>
                <Th>Telepon</Th>
                <Th>Telepon</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {klienTersaring.map((k) => (
                <Baris key={k.id} onClick={() => onPilihKlien(k.id)}>
                  <Td tebal>{k.nama}</Td>
                  <Td>{labelJenisKlien(k.jenis)}</Td>
                  <Td>
                    {k.kontakNama}
                    {k.kontakJabatan ? ` — ${k.kontakJabatan}` : ''}
                  </Td>
                  <Td>{k.telepon}</Td>
                  <Td>
                    <StatusBadge status={labelStatusKlien(k.status)} />
                  </Td>
                </Baris>
              ))}
            </tbody>
          </Tabel>
        </Kartu>
      )}
    </div>
  );
}

function DetailKlien({
  data,
  klien,
  onKembali,
}: {
  data: ModulProps['data'];
  klien: Klien;
  onKembali: () => void;
}) {
  const kontrakKlien = data.kontrak.filter((k) => k.klienId === klien.id);
  const kontrakIds = new Set(kontrakKlien.map((k) => k.id));
  const tagihanKlien = data.tagihan.filter((t) => kontrakIds.has(t.kontrakId));
  const piutangTerbuka = tagihanKlien.reduce(
    (s, t) => s + sisaTagihan(t, data.pembayaran),
    0,
  );
  const dokumenTerkait = data.dokumen.filter((d) => kontrakIds.has(d.kontrakId));

  return (
    <div className="space-y-4">
      <TombolSekunder onClick={onKembali}>&larr; Kembali ke daftar</TombolSekunder>
      <JudulBagian>{klien.nama}</JudulBagian>

      <div className="grid gap-4 md:grid-cols-2">
        <Kartu>
          <JudulBagian>Detail klien</JudulBagian>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Jenis</dt>
              <dd className="font-semibold text-[#0d2569]">{labelJenisKlien(klien.jenis)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Status</dt>
              <dd>
                <StatusBadge status={labelStatusKlien(klien.status)} />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Satker</dt>
              <dd className="font-semibold text-[#0d2569]">
                {klien.satker.nama} ({klien.satker.kode})
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Alamat</dt>
              <dd className="text-right text-[#0d2569]">{klien.alamat}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">NPWP</dt>
              <dd className="text-[#0d2569]">{klien.npwp ?? '-'}</dd>
            </div>
            {klien.catatan && (
              <div className="flex justify-between gap-4">
                <dt className="text-[#0d2569]/60">Catatan</dt>
                <dd className="text-right text-[#0d2569]">{klien.catatan}</dd>
              </div>
            )}
          </dl>
        </Kartu>

        <Kartu>
          <JudulBagian>Kontak</JudulBagian>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Nama kontak</dt>
              <dd className="font-semibold text-[#0d2569]">{klien.kontakNama}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Jabatan</dt>
              <dd className="text-[#0d2569]">{klien.kontakJabatan || '-'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Telepon</dt>
              <dd className="text-[#0d2569]">{klien.telepon}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Email</dt>
              <dd className="text-[#0d2569]">{klien.email || '-'}</dd>
            </div>
          </dl>
          <p className="mt-4 border-t border-[#2573e2]/10 pt-3 text-sm">
            <span className="text-[#0d2569]/60">Piutang terbuka: </span>
            <strong className="text-[#0d2569]">{formatRupiah(piutangTerbuka)}</strong>
          </p>
        </Kartu>
      </div>

      <Kartu>
        <JudulBagian>Kontrak klien ini</JudulBagian>
        {kontrakKlien.length === 0 ? (
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Klien ini belum punya kontrak.
          </p>
        ) : (
          <ul className="mt-3 text-sm">
            {kontrakKlien.map((k) => (
              <ItemDaftar
                key={k.id}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span className="font-semibold text-[#0d2569]">{k.nomorPks}</span>
                <span className="text-[#0d2569]/70">
                  {labelKategoriLayanan(k.kategoriLayanan)} — {labelJenisPnBP(k.jenisPnBP)}
                </span>
                <span className="text-[#0d2569]">{formatRupiah(k.nilaiKontrak)}</span>
                <StatusBadge status={labelStatusKontrak(k.status)} />
              </ItemDaftar>
            ))}
          </ul>
        )}
      </Kartu>

      <Kartu>
        <JudulBagian>Dokumen terkait</JudulBagian>
        {dokumenTerkait.length === 0 ? (
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Belum ada dokumen terkait klien ini.
          </p>
        ) : (
          <ul className="mt-3 text-sm">
            {dokumenTerkait.map((d) => (
              <ItemDaftar
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span className="text-[#0d2569]">{labelJenisDokumen(d.jenisDokumen)}</span>
                <span className="text-[#0d2569]/70">{d.kontrakId}</span>
                <StatusBadge status={labelStatusDokumen(d.status)} />
              </ItemDaftar>
            ))}
          </ul>
        )}
      </Kartu>
    </div>
  );
}

function FormKlien({
  data,
  actions,
  onBatal,
  onSukses,
}: {
  data: ModulProps['data'];
  actions: ModulProps['actions'];
  onBatal: () => void;
  onSukses: () => void;
}) {
  const [form, setForm] = useState<KlienInput>({
    nama: '',
    jenis: MASTER_JENIS_KLIEN[0],
    alamat: '',
    kontakNama: '',
    kontakJabatan: '',
    telepon: '',
    email: '',
    npwp: '',
    catatan: '',
  });
  const [error, setError] = useState('');

  const namaMirip =
    form.nama.trim() !== '' &&
    data.klien.some(
      (k) =>
        normalisasiNama(k.nama) === normalisasiNama(form.nama) &&
        normalisasiNama(k.nama) !== '',
    );

  const ubah = (field: keyof KlienInput, nilai: string) =>
    setForm((f) => ({ ...f, [field]: nilai }));

  const simpan = () => {
    if (form.nama.trim() === '') {
      setError('Nama wajib diisi.');
      return;
    }
    if (form.telepon.trim() === '') {
      setError('Telepon wajib diisi.');
      return;
    }
    const hasil = actions.tambahKlien({
      ...form,
      nama: form.nama.trim(),
      telepon: form.telepon.trim(),
    });
    if (hasil !== null) {
      setError(hasil);
      return;
    }
    onSukses();
  };

  return (
    <Kartu>
      <JudulBagian>Tambah klien</JudulBagian>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Nama *</Label>
          <input
            className={inputClass}
            value={form.nama}
            onChange={(e) => ubah('nama', e.target.value)}
            placeholder="Nama klien"
          />
        </div>
        <div>
          <Label>Jenis</Label>
          <select
            className={inputClass}
            value={form.jenis}
            onChange={(e) => ubah('jenis', e.target.value)}
          >
            {MASTER_JENIS_KLIEN.map((j) => (
              <option key={j} value={j}>
                {labelJenisKlien(j)}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <Label>Alamat</Label>
          <input
            className={inputClass}
            value={form.alamat}
            onChange={(e) => ubah('alamat', e.target.value)}
            placeholder="Alamat klien"
          />
        </div>
        <div>
          <Label>Nama kontak</Label>
          <input
            className={inputClass}
            value={form.kontakNama}
            onChange={(e) => ubah('kontakNama', e.target.value)}
            placeholder="Nama penanggung jawab di klien"
          />
        </div>
        <div>
          <Label>Jabatan kontak</Label>
          <input
            className={inputClass}
            value={form.kontakJabatan}
            onChange={(e) => ubah('kontakJabatan', e.target.value)}
            placeholder="Jabatan"
          />
        </div>
        <div>
          <Label>Telepon *</Label>
          <input
            className={inputClass}
            value={form.telepon}
            onChange={(e) => ubah('telepon', e.target.value)}
            placeholder="Nomor telepon"
          />
        </div>
        <div>
          <Label>Email</Label>
          <input
            className={inputClass}
            type="email"
            value={form.email}
            onChange={(e) => ubah('email', e.target.value)}
            placeholder="email@example.com"
          />
        </div>
        <div>
          <Label>NPWP</Label>
          <input
            className={inputClass}
            value={form.npwp}
            onChange={(e) => ubah('npwp', e.target.value)}
            placeholder="NPWP (opsional)"
          />
        </div>
        <div>
          <Label>Catatan</Label>
          <input
            className={inputClass}
            value={form.catatan}
            onChange={(e) => ubah('catatan', e.target.value)}
            placeholder="Catatan (opsional)"
          />
        </div>
      </div>

      {namaMirip && (
        <div className="mt-4">
          <Peringatan teks="Nama yang mirip sudah ada. Periksa lagi sebelum menyimpan. Penyimpanan tetap diizinkan bila ini memang klien yang berbeda." />
        </div>
      )}
      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Simpan klien</TombolUtama>
        <TombolSekunder onClick={onBatal}>Batal</TombolSekunder>
      </div>
    </Kartu>
  );
}

/* ============================= Tab Kontrak ============================= */
// Diekspor supaya menu kerja sama baru (Contract, MoU, Commitment,
// Approvement — src/modules/KerjaSama.tsx) memakai ulang tabel yang
// sama dari sumber data yang sama, tanpa duplikasi data.

export function TabKontrak({
  data,
  user,
  actions,
  cocokCari,
  kontrakTerpilih,
  onPilihKontrak,
  tampilForm,
  onTampilForm,
  filterPnBP,
  onFilterPnBP,
  filterJenisKlien,
  onFilterJenisKlien,
  filterStatusPembayaran,
  onFilterStatusPembayaran,
  filterStatusKerjaSama,
  onFilterStatusKerjaSama,
  urutKunci,
  onUrutKunci,
  urutArah,
  onUrutArah,
  onNavigasiKlien,
}: {
  data: ModulProps['data'];
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  cocokCari: (teks: string) => boolean;
  kontrakTerpilih: Kontrak | null;
  onPilihKontrak: (id: string | null) => void;
  tampilForm: boolean;
  onTampilForm: (tampil: boolean) => void;
  filterPnBP: 'Semua' | 'Fungsional' | 'Umum';
  onFilterPnBP: (v: 'Semua' | 'Fungsional' | 'Umum') => void;
  filterJenisKlien: string;
  onFilterJenisKlien: (v: string) => void;
  filterStatusPembayaran: FilterStatusPembayaran;
  onFilterStatusPembayaran: (v: FilterStatusPembayaran) => void;
  filterStatusKerjaSama: FilterStatusKerjaSama;
  onFilterStatusKerjaSama: (v: FilterStatusKerjaSama) => void;
  urutKunci: KunciUrutKontrak;
  onUrutKunci: (v: KunciUrutKontrak) => void;
  urutArah: ArahUrutKontrak;
  onUrutArah: (v: ArahUrutKontrak) => void;
  onNavigasiKlien?: (klienId: string) => void;
}) {
  const bolehTambah = bolehAksi(user.peran, 'tambahKontrak');

  // Cluster kolom (keputusan pengguna 17/11/2026 11:41 WIB) — lihat
  // lib/clusterKontrak.ts. Daftar cluster tersembunyi disimpan di
  // localStorage (pola yang sama seperti 'rri-sidebar-ciut') supaya
  // tetap setelah refresh; default: semua cluster tampil. Cluster 1
  // "Contract" tidak pernah masuk daftar tersembunyi (disaring di lib).
  const [clusterTersembunyi, setClusterTersembunyi] = useState<string[]>(() =>
    bacaClusterKontrakTersembunyi(),
  );
  const toggleCluster = (idCluster: string) => {
    setClusterTersembunyi((lama) => {
      const baru = lama.includes(idCluster)
        ? lama.filter((x) => x !== idCluster)
        : [...lama, idCluster];
      simpanClusterKontrakTersembunyi(baru);
      return baru;
    });
  };
  // Tampilan ramping (perbaikan tabel Contract, keputusan pengguna
  // 19/11/2026 16:19 WIB): default hanya 10 kolom; pilihan disimpan
  // di localStorage (kunci terpisah dari kunci cluster — preferensi
  // cluster lama tetap dihormati, bukan ditimpa).
  const [tampilanRamping, setTampilanRamping] = useState<boolean>(() =>
    bacaTampilanRampingKontrak(),
  );
  const toggleTampilanRamping = () => {
    setTampilanRamping((lama) => {
      const baru = !lama;
      simpanTampilanRampingKontrak(baru);
      return baru;
    });
  };
  const clusterTerlihat = clusterKontrakTerlihatRamping(
    clusterTersembunyi,
    tampilanRamping,
  );
  const tampilCluster = (idCluster: string) =>
    !clusterTersembunyi.includes(idCluster);
  // Kolom tampil = cluster-nya tampil DAN (tampilan penuh ATAU kolom
  // termasuk 10 kolom default tampilan ramping). Dipakai sebagai
  // penjaga tiap <Th>/<Td> supaya tampilan ramping menyembunyikan
  // kolom di luar default tanpa menghapus definisinya.
  const tampilKolom = (idKolom: string) =>
    clusterTerlihat.some((c) => c.kolom.some((k) => k.id === idKolom));
  // Kolom pertama menempel (perbaikan tabel Contract, keputusan
  // pengguna 19/11/2026 16:19 WIB): sel No. (header + tiap baris)
  // sticky saat scroll horizontal, latar putih menutupi sel yang
  // bergeser + bayangan pemisah di tepi kanan.
  const KELAS_KOLOM_PERTAMA_MENEMPEL =
    'sticky left-0 z-10 bg-white shadow-[1px_0_0_0_rgba(37,115,226,0.15)]';
  // "View" di Cluster 6 Documents: buka DetailKontrak lalu gulir ke
  // cluster Document (fokusCluster diteruskan ke DetailKontrak).
  const [fokusClusterDetail, setFokusClusterDetail] = useState<string | null>(
    null,
  );
  // Pencarian teks tabel Contract (perbaikan tabel Contract, keputusan
  // pengguna 19/11/2026 16:19 WIB): nomor kontrak, nomor referensi,
  // judul kontrak, nama klien — bekerja bersama filter dropdown dan
  // pencarian global (cocokCari).
  const [pencarianKontrak, setPencarianKontrak] = useState('');

  if (kontrakTerpilih) {
    return (
      <DetailKontrak
        data={data}
        kontrak={kontrakTerpilih}
        actions={actions}
        onKembali={() => {
          onPilihKontrak(null);
          setFokusClusterDetail(null);
        }}
        onNavigasiKlien={onNavigasiKlien}
        fokusCluster={fokusClusterDetail}
      />
    );
  }

  // "Hari ini" untuk 6 kolom nilai — tanggal sistem, sama seperti
  // DetailKontrak (hariIniIso) dan seperti kolom Payment Status /
  // Remaining Days yang memakai default tanggal sistem di helpernya.
  const hariIni = hariIniIso();

  // Kolom tabel dikelompokkan menjadi 7 cluster (keputusan pengguna
  // 17/11/2026 11:41 WIB) — lihat CLUSTER_KONTRAK di
  // lib/clusterKontrak.ts: Contract (selalu tampil), Client Details,
  // Service Details, Revenue Details, Payment Details, Documents,
  // Notes — total 32 kolom. Tiap cluster bisa disembunyikan lewat
  // kotak centang di atas tabel (state di localStorage); baris header
  // grup menampilkan nama cluster di atas nama kolom. Filter (Client
  // Type, PNBP Type, Payment Status, Cooperation Status) + Sort by +
  // Order TIDAK berubah.
  // Definisi kolom (nilai memakai helper yang SAMA dengan seksi Revenue
  // di DetailKontrak — lib/realisasi.ts — supaya perilaku live-nya
  // identik; hariIni = tanggal sistem seperti di DetailKontrak):
  // - Owner = kontrak.operatorPenutup (atribusi Employee Rank PR #26),
  //   "—" bila kosong.
  // - Type = jenis klien; Client = nama klien (KLIK -> Clients dengan
  //   klien itu terpilih, pola yang sama dengan klik nama klien di
  //   DetailKontrak PR #63); Address, Signatory =
  //   kontrak.penandatanganNama, Signatory Title =
  //   kontrak.penandatanganJabatan, Contact Person = klien.kontakNama
  //   (fallback kontrak.penanggungJawab, pola DetailKontrak),
  //   Contact = klien.telepon, Email = klien.email ("—" bila kosong;
  //   di seed Email kosong untuk semua 42 kontrak).
  // - Realisation pindah ke Cluster 3 Service Details (dulu di blok
  //   nilai); Receivable Value = Piutang (realisasi).
  // - Payment Date / Payment Amount = tanggal + jumlah pembayaran
  //   Terverifikasi TERAKHIR kontrak itu ("—" bila belum ada).
  // - Total Payment = Σ pembayaran Terverifikasi ("—" bila 0).
  // - Remaining Receivable = Sisa Piutang = Piutang − Total Payment
  //   (koreksi Arahan 3, pengguna 17/11/2026 11:57 WIB: rumus
  //   "Total Pembayaran − Piutang" diterapkan dengan urutan dibalik —
  //   urutan harfiah membuat Sisa Kontrak melebihi nilai kontrak).
  // - Remaining Value = Sisa Kontrak = Total Revenue − Receivable
  //   Value − Remaining Receivable = Total Revenue − Piutang
  //   (REDEFINISI 11:41 WIB DIBATALKAN 11:57 WIB — kembali ke
  //   definisi PR #67, sama dengan DetailKontrak).
  // - Availability Rate = persentase keterpenuhan dokumen PR #69
  //   (helper kelengkapanDokumen, daftar yang SAMA dengan tabel
  //   Document); View = tombol yang membuka DetailKontrak lalu
  //   menggulir ke cluster Document (upload file DITUNDA pengguna
  //   09:28 WIB — tidak ada file untuk dibuka).
  // - Notes = DIKOSONGKAN (keputusan pengguna 17/11/2026 14:41 WIB):
  //   sel selalu "—"; isi catatan TIDAK lagi ditampilkan di tabel
  //   ini (kolom + cluster Notes tetap ada).
  const jenisKlien = (k: Kontrak): string | undefined =>
    data.klien.find((kl) => kl.id === k.klienId)?.jenis;
  const kontrakTersaring = urutkanKontrak(
    data.kontrak.filter(
      (k) =>
        (filterPnBP === 'Semua' || k.jenisPnBP === filterPnBP) &&
        (filterJenisKlien === 'Semua' || jenisKlien(k) === filterJenisKlien) &&
        (filterStatusPembayaran === 'Semua' ||
          statusPembayaranKontrak(k, data.tagihan, data.pembayaran, data.denda) ===
            filterStatusPembayaran) &&
        (filterStatusKerjaSama === 'Semua' ||
          statusKerjaSamaKontrak(k) === filterStatusKerjaSama) &&
        cocokPencarianKontrak(
          {
            nomorPks: k.nomorPks,
            referensi: nomorReferensiKontrak(k),
            judul: judulKontrak(k),
            namaKlien: namaKlien(data, k.klienId),
          },
          pencarianKontrak,
        ) &&
        cocokCari(
          `${k.nomorPks} ${namaKlien(data, k.klienId)} ${k.kategoriLayanan} ${judulKontrak(k) ?? ''} ${nomorReferensiKontrak(k) ?? ''}`,
        ),
    ),
    urutKunci,
    urutArah,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {bolehTambah && (
          <TombolUtama onClick={() => onTampilForm(true)}>
            + Tambah kontrak
          </TombolUtama>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="min-w-[240px]">
          <Label>Cari</Label>
          <input
            className={inputClass}
            type="search"
            value={pencarianKontrak}
            onChange={(e) => setPencarianKontrak(e.target.value)}
            placeholder="Nomor kontrak, judul, klien…"
            aria-label="Cari kontrak berdasarkan nomor, referensi, judul, atau klien"
          />
        </div>
        <div>
          <Label>Jenis klien</Label>
          <select
            className={inputClass}
            value={filterJenisKlien}
            onChange={(e) => onFilterJenisKlien(e.target.value)}
          >
            <option value="Semua">Semua</option>
            {jenisKlienYangAda(data.klien).map((j) => (
              <option key={j} value={j}>
                {labelJenisKlien(j)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Jenis PNBP</Label>
          <select
            className={inputClass}
            value={filterPnBP}
            onChange={(e) =>
              onFilterPnBP(e.target.value as 'Semua' | 'Fungsional' | 'Umum')
            }
          >
            <option value="Semua">Semua</option>
            <option value="Fungsional">Fungsional</option>
            <option value="Umum">Umum</option>
          </select>
        </div>
        <div>
          <Label>Status pembayaran</Label>
          <select
            className={inputClass}
            value={filterStatusPembayaran}
            onChange={(e) =>
              onFilterStatusPembayaran(
                e.target.value as FilterStatusPembayaran,
              )
            }
          >
            <option value="Semua">Semua</option>
            <option value="Unpaid">Belum dibayar</option>
            <option value="Paid">Lunas</option>
            <option value="Partially-Paid">Dibayar sebagian</option>
            <option value="Insufficient Payment">Pembayaran tidak cukup</option>
            <option value="Overdue">Lewat jatuh tempo</option>
          </select>
        </div>
        <div>
          <Label>Status kerja sama</Label>
          <select
            className={inputClass}
            value={filterStatusKerjaSama}
            onChange={(e) =>
              onFilterStatusKerjaSama(e.target.value as FilterStatusKerjaSama)
            }
          >
            <option value="Semua">Semua</option>
            <option value="Completed">Selesai</option>
            <option value="On-Going">Berlangsung</option>
            <option value="Upcoming">Akan datang</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <div>
          <Label>Urutkan</Label>
          <select
            className={inputClass}
            value={urutKunci}
            onChange={(e) => onUrutKunci(e.target.value as KunciUrutKontrak)}
          >
            <option value="tandaTangan">Tanggal Penandatanganan</option>
            <option value="selesai">Tanggal selesai</option>
            <option value="nilai">Nilai kontrak</option>
            <option value="sisaHari">Sisa hari</option>
          </select>
        </div>
        <div>
          <Label>Urutan</Label>
          <TombolSekunder
            onClick={() => onUrutArah(urutArah === 'turun' ? 'naik' : 'turun')}
          >
            {urutArah === 'turun' ? '↓ ' : '↑ '}
            {labelArahUrutKontrak(urutKunci, urutArah)}
          </TombolSekunder>
        </div>
        {/*
          Tampilan ramping (perbaikan tabel Contract, keputusan pengguna
          19/11/2026 16:19 WIB): bila aktif, tiap cluster hanya
          menampilkan kolom-kolom default (10 kolom); bila nonaktif,
          semua kolom cluster yang tampil kembali. Dipindah ke baris
          filter bawah, di kanan Urutan (23/11/2026).
        */}
        <div className="flex items-end pb-2">
          <label className="flex cursor-pointer items-center gap-1.5 font-semibold text-[#0d2569]">
            <input
              type="checkbox"
              checked={tampilanRamping}
              onChange={toggleTampilanRamping}
              aria-label="Tampilan ramping: hanya tampilkan 10 kolom bawaan"
            />
            Tampilan ramping
          </label>
        </div>
      </div>

      {tampilForm && (
        <FormKontrak
          data={data}
          actions={actions}
          onBatal={() => onTampilForm(false)}
          onSukses={() => onTampilForm(false)}
        />
      )}

      {/*
        Kotak centang hide/show cluster kolom (keputusan pengguna
        17/11/2026 11:41 WIB). Cluster 1 "Description" selalu tampil
        sehingga centangnya tidak ditampilkan di bar ini (23/11/2026).
        Default: semua cluster tampil.
      */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-[#2573e2]/20 bg-white px-3 py-2 text-sm">
        <span className="font-semibold text-[#0d2569]">
          Detail
        </span>
        {CLUSTER_KONTRAK.filter((c) => !c.selaluTampil).map((c) => (
          <label
            key={c.id}
            className={`flex cursor-pointer items-center gap-1.5 text-[#0d2569] ${c.selaluTampil ? 'opacity-70' : ''}`}
          >
            <input
              type="checkbox"
              checked={!clusterTersembunyi.includes(c.id)}
              disabled={c.selaluTampil}
              onChange={() => toggleCluster(c.id)}
              aria-label={`${c.selaluTampil ? 'Selalu tampil' : 'Tampilkan atau sembunyikan'} kolom ${c.label}`}
            />
            {c.label}
          </label>
        ))}
      </div>

      {kontrakTersaring.length === 0 ? (
        <PesanKosong teks="Belum ada kontrak yang cocok." />
      ) : (
        <Kartu>
          <Tabel>
            <thead>
              {/*
                Baris header grup — nama cluster di atas nama kolom
                (keputusan pengguna 17/11/2026 11:41 WIB). Hanya cluster
                yang tampil yang dirender; colSpan = jumlah kolom
                cluster. Ditulis dengan <th> mentah (bukan <Th>) supaya
                skrip cek yang mem-parsing <Th> tetap membaca 32 header
                kolom apa adanya.
              */}
              <tr>
                {clusterTerlihat.map((c) => (
                  <th
                    key={c.id}
                    colSpan={c.kolom.length}
                    className="border-b border-[#2573e2]/20 bg-[#2573e2]/5 py-2.5 pr-3 text-center text-xs font-semibold whitespace-nowrap text-[#0d2569]/60 last:pr-0"
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
              <tr>
                {tampilCluster('kontrak') && (
                  <>
                    {tampilKolom('no') && (
                      <Th className={KELAS_KOLOM_PERTAMA_MENEMPEL}>No.</Th>
                    )}
                    {tampilKolom('nomor') && (
                      <Th>Nomor kontrak &amp; referensi</Th>
                    )}
                    {tampilKolom('judul') && <Th>Judul kontrak</Th>}
                    {tampilKolom('tanggalTandaTangan') && (
                      <Th>Tanggal Penandatanganan</Th>
                    )}
                    {tampilKolom('owner') && <Th>Operator penutup</Th>}
                  </>
                )}
                {tampilCluster('klien') && (
                  <>
                    {tampilKolom('jenisKlien') && <Th>Jenis</Th>}
                    {tampilKolom('klien') && <Th>Klien</Th>}
                    {tampilKolom('alamat') && <Th>Alamat</Th>}
                    {tampilKolom('penandatangan') && <Th>Penandatangan</Th>}
                    {tampilKolom('jabatanPenandatangan') && (
                      <Th>Jabatan penandatangan</Th>
                    )}
                    {tampilKolom('kontakNama') && <Th>Narahubung</Th>}
                    {tampilKolom('kontakTelepon') && <Th>Telepon</Th>}
                    {tampilKolom('email') && <Th>Email</Th>}
                  </>
                )}
                {tampilCluster('layanan') && (
                  <>
                    {tampilKolom('kategoriLayanan') && <Th>Jenis layanan</Th>}
                    {tampilKolom('detailLayanan') && <Th>Detail layanan</Th>}
                    {tampilKolom('periode') && <Th>Periode kontrak</Th>}
                    {tampilKolom('sisaHari') && <Th>Sisa hari</Th>}
                    {tampilKolom('realisasi') && <Th kanan>Realisasi</Th>}
                  </>
                )}
                {tampilCluster('revenue') && (
                  <>
                    {tampilKolom('nilaiKontrak') && (
                      <Th kanan>Nilai kontrak</Th>
                    )}
                    {tampilKolom('denda') && <Th kanan>Nilai denda</Th>}
                    {tampilKolom('totalRevenue') && (
                      <Th kanan>Total pendapatan</Th>
                    )}
                    {tampilKolom('piutang') && (
                      <Th kanan>Nilai piutang</Th>
                    )}
                  </>
                )}
                {tampilCluster('pembayaran') && (
                  <>
                    {tampilKolom('jatuhTempo') && <Th>Batas waktu bayar</Th>}
                    {tampilKolom('statusPembayaran') && (
                      <Th>Status pembayaran</Th>
                    )}
                    {tampilKolom('tanggalBayar') && <Th>Tanggal bayar</Th>}
                    {tampilKolom('jumlahBayar') && (
                      <Th kanan>Jumlah bayar</Th>
                    )}
                    {tampilKolom('totalBayar') && (
                      <Th kanan>Total pembayaran</Th>
                    )}
                    {tampilKolom('sisaPiutangBaru') && (
                      <Th kanan>Sisa piutang</Th>
                    )}
                    {tampilKolom('sisaNilaiBaru') && (
                      <Th kanan>Sisa nilai</Th>
                    )}
                  </>
                )}
                {tampilCluster('dokumen') && (
                  <>
                    {tampilKolom('ketersediaanDokumen') && (
                      <Th kanan>Tingkat kelengkapan</Th>
                    )}
                    {tampilKolom('lihatDokumen') && <Th>Lihat</Th>}
                  </>
                )}
                {tampilCluster('catatan') && tampilKolom('catatan') && (
                  <Th>Catatan</Th>
                )}
              </tr>
            </thead>
            <tbody>
              {kontrakTersaring.map((k, indeks) => {
                // Nilai-nilai baris — helper yang SAMA dengan seksi
                // Revenue di DetailKontrak (lib/realisasi.ts), supaya
                // perilaku live-nya identik; hariIni = tanggal sistem
                // (hariIniIso) seperti di DetailKontrak.
                const klien = data.klien.find((kl) => kl.id === k.klienId);
                const kontakNama = klien?.kontakNama ?? '';
                const kontakTampil =
                  kontakNama !== '' ? kontakNama : k.penanggungJawab;
                const totalDenda = totalDendaKontrak(
                  k,
                  data.tagihan,
                  data.denda,
                );
                const nilaiPlusDenda = k.nilaiKontrak + totalDenda;
                const piutang = piutangRealisasi(
                  k,
                  data.tagihan,
                  data.denda,
                  hariIni,
                );
                const realisasi = realisasiKontrak(k, hariIni);
                const jatuhTempo = jatuhTempoPembayaranKontrak(
                  k,
                  data.tagihan,
                  data.pembayaran,
                  hariIni,
                );
                // Status pembayaran + sisa hari dihitung sekali di sini
                // (dipakai sel pill + sel Remaining Days di bawah) —
                // nilainya helper yang SAMA, definisi tidak berubah.
                const statusBayar = statusPembayaranKontrak(
                  k,
                  data.tagihan,
                  data.pembayaran,
                  data.denda,
                );
                const sisaHari = sisaHariKerjaSama(k);
                // Kolom baru Cluster 5 (keputusan pengguna 17/11/2026
                // 11:41 WIB, dikoreksi Arahan 3 11:57 WIB):
                // pembayaran Terverifikasi terakhir, total pembayaran,
                // Remaining Receivable (Piutang − Total Payment) dan
                // Remaining Value (Total Revenue − Piutang = Sisa
                // Kontrak PR #67).
                const bayarTerakhir = pembayaranTerverifikasiTerakhir(
                  k,
                  data.tagihan,
                  data.pembayaran,
                );
                const totalBayar = totalPembayaranKontrak(
                  k,
                  data.tagihan,
                  data.pembayaran,
                );
                const sisaPiutangBaru = selisihBayarPiutang(
                  k,
                  data.tagihan,
                  data.denda,
                  data.pembayaran,
                  hariIni,
                );
                const sisaNilaiBaru = sisaNilaiSetelahBayar(
                  k,
                  data.tagihan,
                  data.denda,
                  data.pembayaran,
                  hariIni,
                );
                // Cluster 7 "Notes": isi DIKOSONGKAN (keputusan
                // pengguna 17/11/2026 14:41 WIB) — sel selalu "—".
                // Keterpenuhan dokumen (keputusan pengguna 17/11/2026
                // 09:26 WIB) — dari daftar yang SAMA dengan tabel
                // Document di DetailKontrak (daftarDokumenKontrak),
                // supaya persen kolom dan tabel tidak pernah berbeda.
                const kelengkapan = kelengkapanDokumen(
                  daftarDokumenKontrak(
                    k,
                    data.dokumen,
                    data.tagihan,
                    data.pembayaran,
                    data.denda,
                    hariIni,
                  ),
                );
                return (
                    <Baris key={k.id} onClick={() => onPilihKontrak(k.id)}>
                    {/*
                      Nomor urut tampil — indeks baris sesudah filter +
                      sort (kontrakTersaring), jadi nomor 1 selalu baris
                      pertama yang terlihat dan tetap 1..N berurutan
                      sesudah filter. (Keputusan pengguna 16/11/2026
                      13:31 WIB.)
                    */}
                    {/* ---- Cluster 1 "Contract" (selalu tampil) ---- */}
                    <Td className={KELAS_KOLOM_PERTAMA_MENEMPEL}>
                      {indeks + 1}
                    </Td>
                    {/*
                      Nomor kontrak + nomor referensi digabung dalam satu
                      kolom (keputusan pengguna 16/11/2026 13:35 WIB):
                      nomor kontrak tebal di baris pertama, nomor referensi
                      lebih kecil di baris kedua; "—" bila tanpa referensi.
                      Masing-masing satu baris dengan ellipsis (perbaikan
                      tabel Contract, 19/11/2026).
                    */}
                    {tampilKolom('nomor') && (
                      <Td>
                        <div className="max-w-[240px] truncate font-semibold">
                          {k.nomorPks}
                        </div>
                        <div className="max-w-[240px] truncate text-xs text-[#0d2569]/70">
                          {nomorReferensiKontrak(k) ?? '—'}
                        </div>
                      </Td>
                    )}
                    {tampilKolom('judul') && (
                      <Td>
                        <span className="line-clamp-2">
                          {judulKontrak(k) ?? '—'}
                        </span>
                      </Td>
                    )}
                    {/*
                      Kolom tanggal penandatanganan — per keputusan pengguna
                      16/11/2026 13:29 WIB, kolom ini menggantikan kolom
                      tanggal pembuatan: tanggalTandaTangan, fallback
                      tanggalMulai — pola yang sama dengan kunci sort
                      'tandaTangan' (tanggalAcuanKontrak).
                    */}
                    {tampilKolom('tanggalTandaTangan') && (
                      <Td>
                        {formatTanggal(tanggalPenandatangananKontrak(k))}
                      </Td>
                    )}
                    {tampilKolom('owner') && (
                      <Td>{k.operatorPenutup ?? '—'}</Td>
                    )}
                    {/* ---- Cluster 2 "Client Details" (hideable) ---- */}
                    {tampilCluster('klien') && (
                      <>
                        {tampilKolom('jenisKlien') && (
                          <Td>
                            {klien ? labelJenisKlien(klien.jenis) : '—'}
                          </Td>
                        )}
                        {tampilKolom('klien') && (
                          <Td>
                            {klien && onNavigasiKlien ? (
                              <button
                                type="button"
                                className="line-clamp-2 text-left text-[#2573e2] underline hover:text-[#0d2569]"
                                onClick={(e) => {
                                  // Jangan ikut membuka DetailKontrak
                                  // (klik baris) — tujuannya Clients.
                                  e.stopPropagation();
                                  onNavigasiKlien(klien.id);
                                }}
                              >
                                {klien.nama}
                              </button>
                            ) : (
                              <span className="line-clamp-2">
                                {namaKlien(data, k.klienId)}
                              </span>
                            )}
                          </Td>
                        )}
                        {tampilKolom('alamat') && (
                          <Td>
                            {klien?.alamat && klien.alamat !== ''
                              ? klien.alamat
                              : '—'}
                          </Td>
                        )}
                        {tampilKolom('penandatangan') && (
                          <Td>{k.penandatanganNama ?? '—'}</Td>
                        )}
                        {tampilKolom('jabatanPenandatangan') && (
                          <Td>{k.penandatanganJabatan ?? '—'}</Td>
                        )}
                        {tampilKolom('kontakNama') && (
                          <Td>{kontakTampil !== '' ? kontakTampil : '—'}</Td>
                        )}
                        {tampilKolom('kontakTelepon') && (
                          <Td>
                            <div className="max-w-[160px] truncate">
                              {klien?.telepon && klien.telepon !== ''
                                ? klien.telepon
                                : '—'}
                            </div>
                          </Td>
                        )}
                        {tampilKolom('email') && (
                          <Td>
                            {klien?.email && klien.email !== ''
                              ? klien.email
                              : '—'}
                          </Td>
                        )}
                      </>
                    )}
                    {/* ---- Cluster 3 "Service Details" (hideable) ---- */}
                    {tampilCluster('layanan') && (
                      <>
                        {tampilKolom('kategoriLayanan') && (
                          <Td>{labelKategoriLayanan(k.kategoriLayanan)}</Td>
                        )}
                        {tampilKolom('detailLayanan') && (
                          <Td>{detailLayananKontrak(k) ?? '—'}</Td>
                        )}
                        {tampilKolom('periode') && (
                          <Td>
                            {formatTanggal(k.tanggalMulai)} –{' '}
                            {formatTanggal(k.tanggalSelesai)}
                          </Td>
                        )}
                        {/*
                          Sisa hari kerja sama — hitung mundur sampai tanggal
                          akhir (keputusan pengguna 16/11/2026 15:29 WIB);
                          kontrak yang sudah selesai tertulis "Completed".
                          Nilai NEGATIF ("-N days": tanggal akhir lewat
                          tetapi status belum Selesai) tampil merah dengan
                          titik penanda (perbaikan tabel Contract,
                          19/11/2026) supaya ketidakcocokan terlihat.
                        */}
                        {tampilKolom('sisaHari') && (
                          <Td>
                            {sisaHariNegatif(sisaHari) ? (
                              <span className="inline-flex items-center gap-1.5 font-semibold whitespace-nowrap text-[#B42318]">
                                <span
                                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-current"
                                  aria-hidden
                                />
                                {sisaHari}
                              </span>
                            ) : (
                              sisaHari
                            )}
                          </Td>
                        )}
                        {tampilKolom('realisasi') && (
                          <Td kanan>{formatPersenRealisasi(realisasi)}</Td>
                        )}
                      </>
                    )}
                    {/* ---- Cluster 4 "Revenue Details" (hideable) ---- */}
                    {tampilCluster('revenue') && (
                      <>
                        {tampilKolom('nilaiKontrak') && (
                          <Td kanan>{formatRupiah(k.nilaiKontrak)}</Td>
                        )}
                        {tampilKolom('denda') && (
                          <Td kanan>{totalDenda === 0 ? '—' : formatRupiah(totalDenda)}</Td>
                        )}
                        {tampilKolom('totalRevenue') && (
                          <Td kanan>{formatRupiah(nilaiPlusDenda)}</Td>
                        )}
                        {tampilKolom('piutang') && (
                          <Td kanan>{formatRupiah(piutang)}</Td>
                        )}
                      </>
                    )}
                    {/* ---- Cluster 5 "Payment Details" (hideable) ---- */}
                    {tampilCluster('pembayaran') && (
                      <>
                        {/*
                          Payment Deadline = jatuh tempo tagihan tertua
                          yang belum lunas, bila semua lunas tagihan
                          terakhir, "—" bila tanpa tagihan.
                        */}
                        {tampilKolom('jatuhTempo') && (
                          <Td>
                            {jatuhTempo ? formatTanggal(jatuhTempo) : '—'}
                          </Td>
                        )}
                        {/*
                          Status pembayaran — English (keputusan pengguna
                          17/11/2026 08:34 WIB; membatalkan label Indonesia
                          PR #64). Nilainya langsung dari
                          statusPembayaranKontrak (REDEFINISI 17/11/2026
                          08:33 WIB: Partially-Paid = dibayar == Piutang
                          realisasi; ditambah Insufficient Payment).
                          Tampil sebagai pill teks + titik (perbaikan tabel
                          Contract, keputusan pengguna 19/11/2026
                          16:19 WIB) — definisi dan nilai status TIDAK
                          berubah, hanya tampilannya.
                        */}
                        {tampilKolom('statusPembayaran') && (
                          <Td>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${kelasPillStatusPembayaran(statusBayar)}`}
                            >
                              <span
                                className="h-1.5 w-1.5 shrink-0 rounded-full bg-current"
                                aria-hidden
                              />
                              {statusBayar}
                            </span>
                          </Td>
                        )}
                        {tampilKolom('tanggalBayar') && (
                          <Td>{bayarTerakhir ? formatTanggal(bayarTerakhir.tanggalBayar) : '—'}</Td>
                        )}
                        {tampilKolom('jumlahBayar') && (
                          <Td kanan>{bayarTerakhir ? formatRupiah(bayarTerakhir.jumlah) : '—'}</Td>
                        )}
                        {tampilKolom('totalBayar') && (
                          <Td kanan>{totalBayar === 0 ? '—' : formatRupiah(totalBayar)}</Td>
                        )}
                        {/*
                          Remaining Receivable = Sisa Piutang = Piutang
                          − Total Payment (koreksi Arahan 3, 17/11/2026
                          11:57 WIB — urutan dibalik dari rumus harfiah
                          pengguna; tidak ada nilai negatif).
                        */}
                        {tampilKolom('sisaPiutangBaru') && (
                          <Td kanan>{formatRupiah(sisaPiutangBaru)}</Td>
                        )}
                        {/*
                          Remaining Value = Sisa Kontrak = Total Revenue
                          − Piutang (koreksi Arahan 3, 17/11/2026
                          11:57 WIB — REDEFINISI 11:41 WIB dibatalkan;
                          sama dengan DetailKontrak).
                        */}
                        {tampilKolom('sisaNilaiBaru') && (
                          <Td kanan>{formatRupiah(sisaNilaiBaru)}</Td>
                        )}
                      </>
                    )}
                    {/* ---- Cluster 6 "Documents" (hideable) ---- */}
                    {tampilCluster('dokumen') && (
                      <>
                        {tampilKolom('ketersediaanDokumen') && (
                          <Td kanan>{formatPersenRealisasi(kelengkapan.fraksi)}</Td>
                        )}
                        {tampilKolom('lihatDokumen') && (
                          <Td>
                            <button
                              type="button"
                              className="text-[#2573e2] underline hover:text-[#0d2569]"
                              onClick={(e) => {
                                // Jangan ikut membuka DetailKontrak lewat
                                // klik baris saja — tandai fokus ke cluster
                                // Document supaya detail menggulir ke sana.
                                e.stopPropagation();
                                setFokusClusterDetail('document');
                                onPilihKontrak(k.id);
                              }}
                            >
                              Lihat
                            </button>
                          </Td>
                        )}
                      </>
                    )}
                    {/* ---- Cluster 7 "Notes" (hideable) ---- */}
                    {tampilCluster('catatan') && tampilKolom('catatan') && (
                      <Td className="max-w-md">{'—'}</Td>
                    )}
                  </Baris>
                );
              })}
            </tbody>
          </Tabel>
        </Kartu>
      )}
    </div>
  );
}

function DetailKontrak({
  data,
  kontrak,
  actions,
  onKembali,
  onNavigasiKlien,
  fokusCluster,
}: {
  data: ModulProps['data'];
  kontrak: Kontrak;
  actions: ModulProps['actions'];
  onKembali: () => void;
  onNavigasiKlien?: (klienId: string) => void;
  /**
   * Cluster yang dituju saat detail dibuka — 'document' bila dibuka
   * lewat tombol "View" di Cluster 6 Documents tabel Contract
   * (keputusan pengguna 17/11/2026 11:41 WIB): detail menggulir ke
   * cluster Document. null = dibuka biasa (klik baris), tanpa gulir.
   */
  fokusCluster?: string | null;
}) {
  const klien = data.klien.find((k) => k.id === kontrak.klienId);
  const tagihanKontrak = data.tagihan.filter((t) => t.kontrakId === kontrak.id);
  const pembayaranKontrak = data.pembayaran
    .filter((p) => tagihanKontrak.some((t) => t.id === p.tagihanId))
    .sort((a, b) => (a.tanggalBayar < b.tanggalBayar ? -1 : 1));
  const dokumenKontrak = data.dokumen.filter((d) => d.kontrakId === kontrak.id);
  const sewa = kontrak.sewaId
    ? data.sewa.find((s) => s.id === kontrak.sewaId)
    : undefined;
  const [operatorPenutup, setOperatorPenutup] = useState(
    kontrak.operatorPenutup ?? '',
  );
  const [tanggalTandaTangan, setTanggalTandaTangan] = useState(
    kontrak.tanggalTandaTangan ?? '',
  );
  const [pesanAtribusi, setPesanAtribusi] = useState('');

  // Angka Revenue (draft pengguna 16/11/2026) — lihat lib/realisasi.ts.
  const hariIni = hariIniIso();
  const realisasi = realisasiKontrak(kontrak, hariIni);
  const totalDenda = totalDendaKontrak(kontrak, data.tagihan, data.denda);
  const nilaiPlusDenda = kontrak.nilaiKontrak + totalDenda;
  const piutang = piutangRealisasi(kontrak, data.tagihan, data.denda, hariIni);
  const sisaKontrak = sisaKontrakRealisasi(
    kontrak,
    data.tagihan,
    data.denda,
    hariIni,
  );
  const totalDibayar = totalPembayaranKontrak(
    kontrak,
    data.tagihan,
    data.pembayaran,
  );
  const sisaPiutang = sisaPiutangRealisasi(
    kontrak,
    data.tagihan,
    data.denda,
    data.pembayaran,
    hariIni,
  );
  const sisaTagihanTotal = tagihanKontrak.reduce(
    (s, t) => s + sisaTagihan(t, data.pembayaran),
    0,
  );
  const kodeBilling = kodeBillingKontrak(pembayaranKontrak);
  const kwitansi = dokumenKontrak.find(
    (d) => d.jenisDokumen === 'Kwitansi Pembayaran',
  );
  // Cluster Document (permintaan pengguna 17/11/2026) — lihat lib/dokumenKontrak.ts.
  const dokumenCluster = daftarDokumenKontrak(
    kontrak,
    data.dokumen,
    data.tagihan,
    data.pembayaran,
    data.denda,
  );
  // Keterpenuhan dokumen (permintaan pengguna 17/11/2026 09:26 WIB) —
  // dari daftar yang sama dengan tabel di bawah, supaya persen dan
  // tabel tidak pernah berbeda.
  const kelengkapanDokumenCluster = kelengkapanDokumen(dokumenCluster);
  const jatuhTempo = tagihanKontrak[0]?.tanggalJatuhTempo;
  const jendelaWaktu = JENDELA_WAKTU_SIAR.find(
    (j) => j.programa === kontrak.programa,
  );
  const programaLayanan = [
    ...new Set(
      kontrak.layanan
        .map((l) => l.programa)
        .filter((p): p is string => Boolean(p)),
    ),
  ];
  const kontakNama = klien?.kontakNama ?? '';
  const kontakTelepon = klien?.telepon ?? '';

  // Gulir ke cluster yang dituju (tombol "View" di tabel Contract).
  const refDokumen = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (fokusCluster === 'document') {
      refDokumen.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [fokusCluster]);

  return (
    <div className="space-y-4">
      <TombolSekunder onClick={onKembali}>&larr; Kembali ke daftar</TombolSekunder>
      <JudulBagian>{kontrak.nomorPks}</JudulBagian>

      {/* ---- 1. Detail Kerja Sama (draft pengguna 16/11/2026) ---- */}
      <Kartu>
        <JudulBagian>Detail kerja sama</JudulBagian>
        <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Nomor kontrak</dt>
            <dd className="text-right font-semibold text-[#0d2569]">
              {kontrak.nomorPks}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Nomor referensi</dt>
            <dd className="text-right text-[#0d2569]">
              {nomorReferensiKontrak(kontrak)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 md:col-span-2">
            <dt className="text-[#0d2569]/60">Judul kontrak</dt>
            <dd className="text-right text-[#0d2569]">
              {judulKontrak(kontrak)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Tanggal Penandatanganan</dt>
            <dd className="text-[#0d2569]">
              {kontrak.tanggalTandaTangan
                ? formatTanggal(kontrak.tanggalTandaTangan)
                : `${formatTanggal(kontrak.tanggalMulai)} (tanggal mulai)`}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Jenis PNBP</dt>
            <dd className="text-[#0d2569]">{labelJenisPnBP(kontrak.jenisPnBP)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Periode kerja sama</dt>
            <dd className="text-[#0d2569]">
              {formatTanggal(kontrak.tanggalMulai)} –{' '}
              {formatTanggal(kontrak.tanggalSelesai)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Status</dt>
            <dd>
              <StatusBadge status={labelStatusKontrak(kontrak.status)} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Narahubung</dt>
            <dd className="text-right text-[#0d2569]">
              {kontakNama !== '' ? kontakNama : kontrak.penanggungJawab}
              <span className="block text-xs text-[#0d2569]/60">
                {kontakTelepon !== '' ? kontakTelepon : '— belum ada nomor telepon'}
              </span>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Penandatangan</dt>
            <dd className="text-right text-[#0d2569]">
              {kontrak.penandatanganNama ?? '— belum dicatat'}
              {kontrak.penandatanganJabatan && (
                <span className="block text-xs text-[#0d2569]/60">
                  {kontrak.penandatanganJabatan}
                </span>
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Operator penutup</dt>
            <dd className="text-[#0d2569]">
              {kontrak.operatorPenutup ?? '— belum ditetapkan'}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Tanggal jatuh tempo</dt>
            <dd className="text-[#0d2569]">
              {jatuhTempo ? formatTanggal(jatuhTempo) : '— belum ada tagihan'}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Satker</dt>
            <dd className="text-[#0d2569]">
              {kontrak.satker.nama} ({kontrak.satker.kode})
            </dd>
          </div>
          {kontrak.catatan && (
            <div className="flex justify-between gap-4 md:col-span-2">
              <dt className="text-[#0d2569]/60">Catatan</dt>
              <dd className="text-right text-[#0d2569]">{kontrak.catatan}</dd>
            </div>
          )}
        </dl>
      </Kartu>

      <Kartu>
        <JudulBagian>Atribusi peringkat karyawan</JudulBagian>
        <p className="mt-1 text-xs text-[#0d2569]/70">
          Operator penutup dan tanggal tanda tangan menentukan Peringkat karyawan
          (Q-09). Kontrak impor tanpa operator penutup tidak
          masuk peringkat sampai ditetapkan di sini.
        </p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <Label>Operator penutup</Label>
            <input
              className={inputClass}
              value={operatorPenutup}
              onChange={(e) => setOperatorPenutup(e.target.value)}
              placeholder="Nama staf Layanan yang menutup kontrak ini"
            />
          </div>
          <div>
            <Label>Tanggal Penandatanganan</Label>
            <input
              className={inputClass}
              type="date"
              value={tanggalTandaTangan}
              onChange={(e) => setTanggalTandaTangan(e.target.value)}
            />
          </div>
        </div>
        {pesanAtribusi !== '' && (
          <p className="mt-2 text-sm text-[#0d2569]">{pesanAtribusi}</p>
        )}
        <div className="mt-3">
          <TombolUtama
            onClick={() => {
              const hasil = actions.ubahAtribusiKontrak(kontrak, {
                operatorPenutup,
                tanggalTandaTangan,
              });
              setPesanAtribusi(
                hasil !== null ? hasil : 'Atribusi kontrak tersimpan.',
              );
            }}
          >
            Simpan atribusi
          </TombolUtama>
        </div>
      </Kartu>

      {/* ---- 2. Client ---- */}
      <Kartu>
        <JudulBagian>Klien</JudulBagian>
        <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Nama</dt>
            <dd className="text-right font-semibold">
              {klien && onNavigasiKlien ? (
                <button
                  type="button"
                  className="text-[#2573e2] underline hover:text-[#0d2569]"
                  onClick={() => onNavigasiKlien(klien.id)}
                >
                  {klien.nama}
                </button>
              ) : (
                <span className="text-[#0d2569]">
                  {klien?.nama ?? kontrak.klienId}
                </span>
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Jenis klien</dt>
            <dd className="text-[#0d2569]">
              {klien ? labelJenisKlien(klien.jenis) : '—'}
            </dd>
          </div>
          <div className="flex justify-between gap-4 md:col-span-2">
            <dt className="text-[#0d2569]/60">Alamat</dt>
            <dd className="text-right text-[#0d2569]">
              {klien?.alamat && klien.alamat !== '' ? klien.alamat : '—'}
            </dd>
          </div>
        </dl>
      </Kartu>

      {/* ---- 3. Revenue ---- */}
      <Kartu>
        <JudulBagian>Pendapatan</JudulBagian>

        <h3 className="mt-4 text-sm font-semibold text-[#0d2569]">
          Dokumen
        </h3>
        <div className="mt-2">
          <Tabel>
            <thead>
              <tr>
                <Th>Dokumen</Th>
                <Th>Rincian</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {tagihanKontrak.map((t) => (
                <Baris key={t.id}>
                  <Td>Tagihan</Td>
                  <Td tebal>{t.nomor}</Td>
                  <Td>
                    <StatusBadge
                      status={labelStatusTagihan(statusTagihan(t, data.pembayaran))}
                    />
                  </Td>
                </Baris>
              ))}
              {tagihanKontrak.length === 0 && (
                <Baris>
                  <Td>Tagihan</Td>
                  <Td>—</Td>
                  <Td>— belum ada tagihan</Td>
                </Baris>
              )}
              <Baris>
                <Td>Billing</Td>
                <Td tebal>{kodeBilling ?? '—'}</Td>
                <Td>
                  {kodeBilling
                    ? 'Kode bayar (dicatat sebagai NTB pada pembayaran)'
                    : '— belum ada kode billing yang dicatat'}
                </Td>
              </Baris>
              <Baris>
                <Td>Kwitansi</Td>
                <Td>{kwitansi ? kwitansi.id : '—'}</Td>
                <Td>
                  {kwitansi
                    ? labelStatusDokumen(kwitansi.status)
                    : '— belum dicatat'}
                </Td>
              </Baris>
            </tbody>
          </Tabel>
        </div>
        <p className="mt-2 text-xs text-[#0d2569]/70">
          Billing adalah kode bayar (berlaku 7 hari). Di berkas sumber
          kode 15 digit yang sama dicatat di kolom NTB pembayaran
          ini.
        </p>

        <h3 className="mt-5 text-sm font-semibold text-[#0d2569]">
          Nilai kontrak
        </h3>
        <div className="mt-2">
          <Tabel>
            <thead>
              <tr>
                <Th>Layanan</Th>
                <Th>Kode akun</Th>
                <Th>Jumlah</Th>
                <Th>Satuan</Th>
                <Th kanan>Tarif</Th>
                <Th kanan>Subtotal</Th>
                <Th kanan>Realisasi</Th>
              </tr>
            </thead>
            <tbody>
              {kontrak.layanan.map((l) => (
                <Baris key={l.id}>
                  <Td>{l.namaLayanan}</Td>
                  <Td>{l.kodeAkun}</Td>
                  <Td kanan>{l.jumlah}</Td>
                  <Td>{l.satuan}</Td>
                  <Td kanan>{formatRupiah(l.tarif)}</Td>
                  <Td kanan>{formatRupiah(l.subtotal)}</Td>
                  <Td kanan>
                    {formatPersenRealisasi(
                      realisasiLayanan(l, kontrak, hariIni),
                    )}
                  </Td>
                </Baris>
              ))}
              <Baris className="bg-[#2573e2]/5 font-semibold">
                <Td colSpan={6} tebal>
                  Total nominal kontrak
                </Td>
                <Td kanan tebal>{formatRupiah(kontrak.nilaiKontrak)}</Td>
              </Baris>
              <Baris>
                <Td colSpan={6}>Denda keterlambatan</Td>
                <Td kanan>{formatRupiah(totalDenda)}</Td>
              </Baris>
              <Baris className="font-semibold">
                <Td colSpan={6} tebal>
                  Nilai kontrak + denda keterlambatan
                </Td>
                <Td kanan tebal>{formatRupiah(nilaiPlusDenda)}</Td>
              </Baris>
              <Baris>
                <Td colSpan={6}>Realisasi</Td>
                <Td kanan>{formatPersenRealisasi(realisasi)}</Td>
              </Baris>
              <Baris className="bg-[#2573e2]/5 font-semibold">
                <Td colSpan={6} tebal>
                  Piutang (realisasi)
                </Td>
                <Td kanan tebal>{formatRupiah(piutang)}</Td>
              </Baris>
            </tbody>
          </Tabel>
        </div>
        <p className="mt-2 text-xs text-[#0d2569]/70">
          Piutang di sini = (Nilai kontrak + denda keterlambatan) × Realisasi.
          Angka ini berbeda dengan sisa tagihan di bawah —
          lihat &ldquo;Sisa tagihan&rdquo;.
        </p>

        <h3 className="mt-5 text-sm font-semibold text-[#0d2569]">
          Pembayaran
        </h3>
        {pembayaranKontrak.length === 0 ? (
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Belum ada pembayaran untuk kontrak ini.
          </p>
        ) : (
          <div className="mt-2">
            <Tabel>
              <thead>
                <tr>
                  <Th>NTB</Th>
                  <Th>NTPN</Th>
                  <Th>Tanggal bayar</Th>
                  <Th kanan>Jumlah</Th>
                </tr>
              </thead>
              <tbody>
                {pembayaranKontrak.map((p) => {
                  const bukti = pisahBuktiSetor(p.buktiSetor);
                  return (
                    <Baris key={p.id}>
                      <Td>{bukti.ntb ?? '—'}</Td>
                      <Td>{bukti.ntpn ?? '—'}</Td>
                      <Td>{formatTanggal(p.tanggalBayar)}</Td>
                      <Td kanan>{formatRupiah(p.jumlah)}</Td>
                    </Baris>
                  );
                })}
              </tbody>
            </Tabel>
          </div>
        )}
        <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Total pembayaran</dt>
            <dd className="font-semibold text-[#0d2569]">
              {formatRupiah(totalDibayar)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">
              Sisa piutang (realisasi)
            </dt>
            <dd className="font-semibold text-[#0d2569]">
              {formatRupiah(sisaPiutang)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Sisa kontrak</dt>
            <dd className="font-semibold text-[#0d2569]">
              {formatRupiah(sisaKontrak)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Sisa tagihan</dt>
            <dd className="text-[#0d2569]">
              {formatRupiah(sisaTagihanTotal)}
            </dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-[#0d2569]/70">
          Sisa piutang (realisasi) = Piutang (realisasi)
          − Total pembayaran. Sisa tagihan = Σ tagihan −
          pembayaran (angka piutang sebelumnya).
        </p>

        <h3 className="mt-5 text-sm font-semibold text-[#0d2569]">
          Tagihan untuk kontrak ini
        </h3>
        {tagihanKontrak.length === 0 ? (
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Belum ada tagihan untuk kontrak ini.
          </p>
        ) : (
          <div className="mt-2">
            <Tabel>
              <thead>
                <tr>
                  <Th>Nomor</Th>
                  <Th>Uraian</Th>
                  <Th kanan>Jumlah</Th>
                  <Th>Tanggal jatuh tempo</Th>
                  <Th>Status</Th>
                  <Th kanan>Saldo</Th>
                </tr>
              </thead>
              <tbody>
                {tagihanKontrak.map((t) => (
                  <Baris key={t.id}>
                    <Td tebal>{t.nomor}</Td>
                    <Td>{t.uraian}</Td>
                    <Td kanan>{formatRupiah(t.nilai)}</Td>
                    <Td>{formatTanggal(t.tanggalJatuhTempo)}</Td>
                    <Td>
                      <StatusBadge
                        status={labelStatusTagihan(statusTagihan(t, data.pembayaran))}
                      />
                    </Td>
                    <Td kanan>
                      {formatRupiah(sisaTagihan(t, data.pembayaran))}
                    </Td>
                  </Baris>
                ))}
              </tbody>
            </Tabel>
          </div>
        )}
      </Kartu>

      {/* ---- 4. Spesial Detail (tergantung jenis PNBP) ---- */}
      <Kartu>
        <JudulBagian>Detail khusus</JudulBagian>
        {kontrak.jenisPnBP === 'Umum' ? (
          <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Kategori layanan</dt>
              <dd className="text-right text-[#0d2569]">
                {labelKategoriLayanan(kontrak.kategoriLayanan)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Jenis aset</dt>
              <dd className="text-[#0d2569]">{kontrak.jenisBmn ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Lokasi aset</dt>
              <dd className="text-right text-[#0d2569]">
                {kontrak.lokasiBmn ?? '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Ukuran</dt>
              <dd className="text-[#0d2569]">{kontrak.ukuranBmn ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Luas</dt>
              <dd className="text-[#0d2569]">{kontrak.luasBmn ?? '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">
                No. surat persetujuan KPKNL
              </dt>
              <dd className="text-[#0d2569]">{kontrak.dasarNilai ?? '—'}</dd>
            </div>
            {sewa && (
              <div className="flex justify-between gap-4 md:col-span-2">
                <dt className="text-[#0d2569]/60">Sewa terkait</dt>
                <dd className="text-right text-[#0d2569]">
                  {sewa.aset} — perjanjian {sewa.nomorPerjanjian} (
                  {formatRupiah(sewa.nilaiSewa)})
                </dd>
              </div>
            )}
          </dl>
        ) : (
          <div>
            <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
              <div className="flex justify-between gap-4">
                <dt className="text-[#0d2569]/60">Kategori layanan</dt>
                <dd className="text-right text-[#0d2569]">
                  {labelKategoriLayanan(kontrak.kategoriLayanan)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#0d2569]/60">Programa</dt>
                <dd className="text-[#0d2569]">
                  {(kontrak.programa ?? programaLayanan.join(', ')) || '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4 md:col-span-2">
                <dt className="text-[#0d2569]/60">Detail layanan</dt>
                <dd className="text-right text-[#0d2569]">
                  {detailLayananKontrak(kontrak)}
                </dd>
              </div>
            </dl>
            <h3 className="mt-4 text-sm font-semibold text-[#0d2569]">Waktu</h3>
            <div className="mt-2">
              <Tabel>
                <thead>
                  <tr>
                    <Th>Layanan</Th>
                    <Th>Programa</Th>
                    <Th>Waktu</Th>
                  </tr>
                </thead>
                <tbody>
                  {kontrak.layanan.map((l) => (
                    <Baris key={l.id}>
                      <Td>{l.namaLayanan}</Td>
                      <Td>{l.programa ?? '—'}</Td>
                      <Td>{l.jenisWaktu ?? '—'}</Td>
                    </Baris>
                  ))}
                </tbody>
              </Tabel>
            </div>
            {jendelaWaktu ? (
              <div className="mt-3">
                <p className="text-xs font-semibold text-[#0d2569]">
                  Acuan — {jendelaWaktu.programa} ({SUMBER_JENDELA_WAKTU_SIAR})
                </p>
                <dl className="mt-2 grid gap-2 text-sm md:grid-cols-2">
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#0d2569]/60">Waktu utama (WIB)</dt>
                    <dd className="text-right text-[#0d2569]">
                      {jendelaWaktu.prime.join(', ')}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#0d2569]/60">Waktu reguler (WIB)</dt>
                    <dd className="text-right text-[#0d2569]">
                      {jendelaWaktu.regular.join(', ')}
                    </dd>
                  </div>
                </dl>
                <p className="mt-2 text-xs text-[#0d2569]/70">
                  SK ini hanya mencakup Programa 1, 2, dan 4 (tanpa Programa
                  3). Jendela waktu di atas disalin apa adanya, termasuk
                  yang tumpang tindih.
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-[#0d2569]/70">
                Tidak ada jendela waktu utama/reguler untuk programa ini
                di {SUMBER_JENDELA_WAKTU_SIAR} (hanya mencakup Programa 1, 2, dan
                4).
              </p>
            )}
          </div>
        )}
      </Kartu>

      {/* ---- 5. Document (cluster dokumen, permintaan pengguna 17/11/2026) ---- */}
      <div ref={refDokumen}>
        <Kartu>
          <JudulBagian>Dokumen</JudulBagian>
          <p className="mt-2 text-sm text-[#0d2569]">
            Dokumentasi:{' '}
            {formatPersenRealisasi(kelengkapanDokumenCluster.fraksi)} (
            {kelengkapanDokumenCluster.ada} dari {kelengkapanDokumenCluster.total}{' '}
            dokumen)
          </p>
        <div className="mt-2">
          <Tabel>
            <thead>
              <tr>
                <Th>Dokumen</Th>
                <Th>Rincian</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {dokumenCluster.map((item) => (
                <Baris key={item.label}>
                  <Td>{item.label}</Td>
                  <Td>{item.detail ?? '—'}</Td>
                  <Td>{item.ada ? 'Ada' : 'Belum Ada'}</Td>
                </Baris>
              ))}
            </tbody>
          </Tabel>
        </div>
        <p className="mt-2 text-xs text-[#0d2569]/70">
          Daftar periksa dokumen untuk kontrak ini — aplikasi tidak menyimpan
          berkas dokumen, jadi tidak ada unggah atau unduh di sini.
          &ldquo;Belum Ada&rdquo; berarti belum ada catatan dokumen itu untuk
          kontrak ini. Untuk Persetujuan Sewa KPKNL, nomor surat persetujuan
          tercatat (lihat Detail khusus); berkas suratnya sendiri
          tidak disimpan di aplikasi.
        </p>
        </Kartu>
      </div>
    </div>
  );
}

function FormKontrak({
  data,
  actions,
  onBatal,
  onSukses,
}: {
  data: ModulProps['data'];
  actions: ModulProps['actions'];
  onBatal: () => void;
  onSukses: () => void;
}) {
  const [nomorPks, setNomorPks] = useState('');
  const [klienId, setKlienId] = useState(data.klien[0]?.id ?? '');
  const [kategoriLayanan, setKategoriLayanan] = useState(
    MASTER_KATEGORI_LAYANAN[0].nama,
  );
  const [programa, setPrograma] = useState(MASTER_PROGRAMA[0]);
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [tanggalTandaTangan, setTanggalTandaTangan] = useState('');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [operatorPenutup, setOperatorPenutup] = useState('');
  const [catatan, setCatatan] = useState('');
  const [baris, setBaris] = useState<BarisLayananForm[]>([{ ...BARIS_LAYANAN_AWAL }]);
  const [error, setError] = useState('');

  const kategoriTerpilih = kategoriDariNama(kategoriLayanan);
  const nilaiKontrak = baris.reduce((s, b) => {
    const tarif = Number(b.tarif) || 0;
    const jumlah = Number(b.jumlah) || 0;
    return s + tarif * jumlah;
  }, 0);

  const ubahBaris = (idx: number, field: keyof BarisLayananForm, nilai: string) =>
    setBaris((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, [field]: nilai } : r)),
    );

  const simpan = () => {
    if (nomorPks.trim() === '') {
      setError('Nomor PKS wajib diisi.');
      return;
    }
    if (
      data.kontrak.some(
        (k) => k.nomorPks.trim().toLowerCase() === nomorPks.trim().toLowerCase(),
      )
    ) {
      setError('Nomor PKS sudah dipakai kontrak lain.');
      return;
    }
    if (klienId === '') {
      setError('Klien wajib dipilih.');
      return;
    }
    if (tanggalMulai === '') {
      setError('Tanggal mulai wajib diisi.');
      return;
    }
    if (tanggalSelesai === '') {
      setError('Tanggal selesai wajib diisi.');
      return;
    }
    if (tanggalSelesai < tanggalMulai) {
      setError('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.');
      return;
    }
    if (penanggungJawab.trim() === '') {
      setError('Penanggung jawab wajib diisi.');
      return;
    }
    for (let i = 0; i < baris.length; i += 1) {
      const tarif = Number(baris[i].tarif);
      const jumlah = Number(baris[i].jumlah);
      if (!(tarif > 0)) {
        setError(`Tarif pada baris layanan ${i + 1} harus lebih dari 0.`);
        return;
      }
      if (!(jumlah > 0)) {
        setError(`Jumlah pada baris layanan ${i + 1} harus lebih dari 0.`);
        return;
      }
    }

    const layanan: LayananInput[] = baris.map((b) => ({
      kategori: b.kategori,
      satuan: b.satuan.trim(),
      tarif: Number(b.tarif),
      jumlah: Number(b.jumlah),
      programa,
    }));
    const input: KontrakInput = {
      nomorPks: nomorPks.trim(),
      klienId,
      kategoriLayanan,
      programa,
      tanggalTandaTangan: tanggalTandaTangan === '' ? undefined : tanggalTandaTangan,
      tanggalMulai,
      tanggalSelesai,
      penanggungJawab: penanggungJawab.trim(),
      operatorPenutup: operatorPenutup.trim() === '' ? undefined : operatorPenutup.trim(),
      catatan: catatan.trim() === '' ? undefined : catatan.trim(),
      layanan,
    };
    const hasil = actions.tambahKontrak(input);
    if (hasil !== null) {
      setError(hasil);
      return;
    }
    onSukses();
  };

  return (
    <Kartu>
      <JudulBagian>Tambah kontrak</JudulBagian>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Nomor PKS *</Label>
          <input
            className={inputClass}
            value={nomorPks}
            onChange={(e) => setNomorPks(e.target.value)}
            placeholder="PKS-000/2026"
          />
        </div>
        <div>
          <Label>Klien *</Label>
          <select
            className={inputClass}
            value={klienId}
            onChange={(e) => setKlienId(e.target.value)}
          >
            {data.klien.map((k) => (
              <option key={k.id} value={k.id}>
                {labelKategoriLayanan(k.nama)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Kategori layanan *</Label>
          <select
            className={inputClass}
            value={kategoriLayanan}
            onChange={(e) => setKategoriLayanan(e.target.value)}
          >
            {MASTER_KATEGORI_LAYANAN.map((k) => (
              <option key={k.nama} value={k.nama}>
                {labelKategoriLayanan(k.nama)}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[#0d2569]/70">
            Kode akun: {kategoriTerpilih?.kodeAkun ?? '-'} (
            {kategoriTerpilih
              ? labelUraianKodeAkun(uraianKodeAkun(kategoriTerpilih.kodeAkun))
              : '-'}
            ) — Jenis PNBP: {kategoriTerpilih ? labelJenisPnBP(kategoriTerpilih.jenisPnBP) : '-'} (terisi otomatis
            dari kategori)
          </p>
        </div>
        <div>
          <Label>Programa</Label>
          <select
            className={inputClass}
            value={programa}
            onChange={(e) => setPrograma(e.target.value)}
          >
            {MASTER_PROGRAMA.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Tanggal mulai *</Label>
          <input
            className={inputClass}
            type="date"
            value={tanggalMulai}
            onChange={(e) => setTanggalMulai(e.target.value)}
          />
        </div>
        <div>
          <Label>Tanggal selesai *</Label>
          <input
            className={inputClass}
            type="date"
            value={tanggalSelesai}
            onChange={(e) => setTanggalSelesai(e.target.value)}
          />
        </div>
        <div>
          <Label>Tanggal Penandatanganan</Label>
          <input
            className={inputClass}
            type="date"
            value={tanggalTandaTangan}
            onChange={(e) => setTanggalTandaTangan(e.target.value)}
          />
          <p className="mt-1 text-xs text-[#0d2569]/70">
            Periode acuan Peringkat karyawan (Q-09). Kosongkan bila belum diketahui —
            tanggal mulai yang dipakai.
          </p>
        </div>
        <div>
          <Label>Penanggung jawab *</Label>
          <input
            className={inputClass}
            value={penanggungJawab}
            onChange={(e) => setPenanggungJawab(e.target.value)}
            placeholder="Nama penanggung jawab"
          />
          <p className="mt-1 text-xs text-[#0d2569]/70">
            PIC klien (bukan operator).
          </p>
        </div>
        <div>
          <Label>Operator penutup</Label>
          <input
            className={inputClass}
            value={operatorPenutup}
            onChange={(e) => setOperatorPenutup(e.target.value)}
            placeholder="Kosongkan = operator yang sedang masuk"
          />
          <p className="mt-1 text-xs text-[#0d2569]/70">
            Staf Layanan yang menutup kontrak ini — acuan Peringkat karyawan.
          </p>
        </div>
        <div>
          <Label>Catatan</Label>
          <input
            className={inputClass}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Catatan (opsional)"
          />
        </div>
      </div>

      <div className="mt-6">
        <JudulBagian>Baris layanan</JudulBagian>
        <div className="mt-3 space-y-3">
          {baris.map((b, idx) => {
            const kat = kategoriDariNama(b.kategori);
            const subtotal = (Number(b.tarif) || 0) * (Number(b.jumlah) || 0);
            return (
              <div
                key={idx}
                className="grid gap-3 rounded-md border border-[#2573e2]/20 p-3 md:grid-cols-5"
              >
                <div className="md:col-span-2">
                  <Label>Kategori</Label>
                  <select
                    className={inputClass}
                    value={b.kategori}
                    onChange={(e) => ubahBaris(idx, 'kategori', e.target.value)}
                  >
                    {MASTER_KATEGORI_LAYANAN.map((k) => (
                      <option key={k.nama} value={k.nama}>
                        {labelKategoriLayanan(k.nama)}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-[#0d2569]/70">
                    Kode akun {kat?.kodeAkun ?? '-'} — {kat ? labelJenisPnBP(kat.jenisPnBP) : '-'}
                  </p>
                </div>
                <div>
                  <Label>Satuan</Label>
                  <input
                    className={inputClass}
                    value={b.satuan}
                    onChange={(e) => ubahBaris(idx, 'satuan', e.target.value)}
                    placeholder="Jangka / Paket"
                  />
                </div>
                <div>
                  <Label>Tarif (Rp)</Label>
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    value={b.tarif}
                    onChange={(e) => ubahBaris(idx, 'tarif', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Jumlah</Label>
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    value={b.jumlah}
                    onChange={(e) => ubahBaris(idx, 'jumlah', e.target.value)}
                  />
                </div>
                <p className="text-sm text-[#0d2569] md:col-span-4">
                  Subtotal: <strong>{formatRupiah(subtotal)}</strong>
                </p>
                {baris.length > 1 && (
                  <div className="md:col-span-1">
                    <TombolSekunder
                      onClick={() =>
                        setBaris((rows) => rows.filter((_, i) => i !== idx))
                      }
                    >
                      Hapus baris
                    </TombolSekunder>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <TombolSekunder
            onClick={() => setBaris((rows) => [...rows, { ...BARIS_LAYANAN_AWAL }])}
          >
            + Tambah baris layanan
          </TombolSekunder>
          <p className="text-sm text-[#0d2569]">
            Nilai kontrak (jumlah subtotal, tidak bisa diubah manual):{' '}
            <strong>{formatRupiah(nilaiKontrak)}</strong>
          </p>
        </div>
      </div>

      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Simpan kontrak</TombolUtama>
        <TombolSekunder onClick={onBatal}>Batal</TombolSekunder>
      </div>
    </Kartu>
  );
}

/* ============================= Tab Dokumen ============================= */

function TabDokumen({
  data,
  user,
  actions,
  kontrakDokumenId,
  onKontrakDokumenId,
}: {
  data: ModulProps['data'];
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  kontrakDokumenId: string;
  onKontrakDokumenId: (id: string) => void;
}) {
  const bolehUbah = bolehAksi(user.peran, 'ubahDokumen');
  const kontrak = data.kontrak.find((k) => k.id === kontrakDokumenId) ?? null;
  const statusPerJenis = MASTER_JENIS_DOKUMEN.map((jenis) => {
    const baris = kontrak
      ? data.dokumen.find(
          (d) => d.kontrakId === kontrak.id && d.jenisDokumen === jenis,
        )
      : undefined;
    return { jenis, baris, status: baris?.status ?? ('Belum Ada' as StatusDokumen) };
  });
  const berlaku = statusPerJenis.filter((s) => s.status !== 'Tidak Berlaku');
  const jumlahAda = berlaku.filter((s) => s.status === 'Ada').length;
  const persen =
    berlaku.length === 0 ? 100 : Math.round((jumlahAda / berlaku.length) * 100);
  const kekurangan = statusPerJenis.filter((s) => s.status === 'Belum Ada');

  const ubahStatus = (
    jenis: string,
    status: StatusDokumen,
  ) => {
    const baris = data.dokumen.find(
      (d) => d.kontrakId === kontrakDokumenId && d.jenisDokumen === jenis,
    );
    if (baris) actions.ubahStatusDokumen(baris, status);
  };

  if (!kontrak) {
    return <PesanKosong teks="Belum ada kontrak untuk menampilkan dokumen." />;
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Pilih kontrak</Label>
        <select
          className={`${inputClass} max-w-md`}
          value={kontrakDokumenId}
          onChange={(e) => onKontrakDokumenId(e.target.value)}
        >
          {data.kontrak.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nomorPks} — {namaKlien(data, k.klienId)}
            </option>
          ))}
        </select>
      </div>

      <Kartu>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <JudulBagian>
            Daftar periksa dokumen — {kontrak.nomorPks}
          </JudulBagian>
          <p className="text-sm font-semibold text-[#0d2569]">
            Kelengkapan: {persen}% ({jumlahAda} dari {berlaku.length} dokumen yang berlaku)
          </p>
        </div>
        <ul className="mt-4">
          {statusPerJenis.map(({ jenis, baris, status }) => (
            <ItemDaftar
              key={jenis}
              className="flex flex-wrap items-center justify-between gap-2"
            >
              <div>
                <p className="text-sm font-semibold text-[#0d2569]">{labelJenisDokumen(jenis)}</p>
                {baris?.catatan && (
                  <p className="text-xs text-[#0d2569]/70">{baris.catatan}</p>
                )}
                {!baris && (
                  <p className="text-xs text-[#0d2569]/70">
                    Belum ada baris dokumen untuk jenis ini.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={labelStatusDokumen(status)} />
                {bolehUbah && baris && (
                  <div className="flex gap-1">
                    {(['Ada', 'Belum Ada', 'Tidak Berlaku'] as StatusDokumen[]).map(
                      (s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={status === s}
                          onClick={() => ubahStatus(jenis, s)}
                          className={`rounded-md border px-2 py-1 text-xs font-semibold disabled:opacity-50 ${
                            status === s
                              ? 'border-[#2573e2] bg-[#2573e2] text-white'
                              : 'border-[#2573e2] bg-white text-[#0d2569]'
                          }`}
                        >
                          {labelStatusDokumen(s)}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>
            </ItemDaftar>
          ))}
        </ul>
      </Kartu>

      <Kartu>
        <JudulBagian>Dokumen yang belum ada</JudulBagian>
        {kekurangan.length === 0 ? (
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Semua dokumen yang berlaku sudah tersedia.
          </p>
        ) : (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#0d2569]">
            {kekurangan.map((k) => (
              <li key={k.jenis}>{labelJenisDokumen(k.jenis)} — Belum tersedia</li>
            ))}
          </ul>
        )}
      </Kartu>
    </div>
  );
}


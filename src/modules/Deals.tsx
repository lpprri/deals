// Modul Deals — Klien, Kontrak / PKS, Dokumen (PRD v2.0 Final Bab 7.4).
// Palet HANYA 3 warna RRI: Biru #2573E2, Navy #0D2569, Putih #FFFFFF.

import { useState } from 'react';
import type { Klien, Kontrak, StatusDokumen } from '../lib/types';
import type { KlienInput, KontrakInput, LayananInput, ModulProps } from '../lib/store';
import {
  MASTER_JENIS_DOKUMEN,
  MASTER_JENIS_KLIEN,
  MASTER_KATEGORI_LAYANAN,
  MASTER_PROGRAMA,
  MASTER_STATUS_KONTRAK,
  uraianKodeAkun,
} from '../lib/master';
import { sisaTagihan, statusTagihan } from '../lib/derive';
import { formatRupiah, formatTanggal, normalisasiNama } from '../lib/format';
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

function kodeAkunKontrak(kontrak: Kontrak): string {
  return (
    kategoriDariNama(kontrak.kategoriLayanan)?.kodeAkun ??
    kontrak.layanan[0]?.kodeAkun ??
    '-'
  );
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
  const { data, user, actions, cari } = props;
  const [tab, setTab] = useState<TabId>('klien');

  // Detail dipilih berdasarkan id supaya tampilan selalu membaca data terbaru.
  const [klienIdTerpilih, setKlienIdTerpilih] = useState<string | null>(null);
  const [kontrakIdTerpilih, setKontrakIdTerpilih] = useState<string | null>(null);

  const [tampilFormKlien, setTampilFormKlien] = useState(false);
  const [tampilFormKontrak, setTampilFormKontrak] = useState(false);

  const [filterPnBP, setFilterPnBP] = useState<'Semua' | 'Fungsional' | 'Umum'>('Semua');
  const [filterStatusKontrak, setFilterStatusKontrak] = useState<string>('Semua');

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
          filterStatus={filterStatusKontrak}
          onFilterStatus={setFilterStatusKontrak}
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

function TabKlien({
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
            + Tambah Klien
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
          Hasil pencarian &ldquo;{cari.trim()}&rdquo;: {klienTersaring.length} klien
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
                <Th>Kontak</Th>
                <Th>Telepon</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {klienTersaring.map((k) => (
                <Baris key={k.id} onClick={() => onPilihKlien(k.id)}>
                  <Td tebal>{k.nama}</Td>
                  <Td>{k.jenis}</Td>
                  <Td>
                    {k.kontakNama}
                    {k.kontakJabatan ? ` — ${k.kontakJabatan}` : ''}
                  </Td>
                  <Td>{k.telepon}</Td>
                  <Td>
                    <StatusBadge status={k.status} />
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
          <JudulBagian>Data Klien</JudulBagian>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Jenis</dt>
              <dd className="font-semibold text-[#0d2569]">{klien.jenis}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Status</dt>
              <dd>
                <StatusBadge status={klien.status} />
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
            Klien ini belum memiliki kontrak.
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
                  {k.kategoriLayanan} — {k.jenisPnBP}
                </span>
                <span className="text-[#0d2569]">{formatRupiah(k.nilaiKontrak)}</span>
                <StatusBadge status={k.status} />
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
                <span className="text-[#0d2569]">{d.jenisDokumen}</span>
                <span className="text-[#0d2569]/70">{d.kontrakId}</span>
                <StatusBadge status={d.status} />
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
      <JudulBagian>Tambah Klien</JudulBagian>
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
                {j}
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
            placeholder="email@contoh.id"
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
          <Peringatan teks="Nama mirip dengan klien yang sudah ada. Periksa kembali sebelum menyimpan — simpan tetap diizinkan bila memang klien yang berbeda." />
        </div>
      )}
      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Simpan Klien</TombolUtama>
        <TombolSekunder onClick={onBatal}>Batal</TombolSekunder>
      </div>
    </Kartu>
  );
}

/* ============================= Tab Kontrak ============================= */

function TabKontrak({
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
  filterStatus,
  onFilterStatus,
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
  filterStatus: string;
  onFilterStatus: (v: string) => void;
}) {
  const bolehTambah = bolehAksi(user.peran, 'tambahKontrak');

  if (kontrakTerpilih) {
    return (
      <DetailKontrak
        data={data}
        kontrak={kontrakTerpilih}
        onKembali={() => onPilihKontrak(null)}
      />
    );
  }

  const kontrakTersaring = data.kontrak.filter(
    (k) =>
      (filterPnBP === 'Semua' || k.jenisPnBP === filterPnBP) &&
      (filterStatus === 'Semua' || k.status === filterStatus) &&
      cocokCari(`${k.nomorPks} ${namaKlien(data, k.klienId)} ${k.kategoriLayanan}`),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <JudulBagian>Kontrak / PKS</JudulBagian>
        {bolehTambah && (
          <TombolUtama onClick={() => onTampilForm(true)}>
            + Tambah Kontrak
          </TombolUtama>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
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
          <Label>Status</Label>
          <select
            className={inputClass}
            value={filterStatus}
            onChange={(e) => onFilterStatus(e.target.value)}
          >
            <option value="Semua">Semua</option>
            {MASTER_STATUS_KONTRAK.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
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

      {kontrakTersaring.length === 0 ? (
        <PesanKosong teks="Belum ada kontrak yang cocok." />
      ) : (
        <Kartu>
          <Tabel>
            <thead>
              <tr>
                <Th>Nomor PKS</Th>
                <Th>Klien</Th>
                <Th>Jenis PNBP</Th>
                <Th>Kategori Layanan</Th>
                <Th>Kode Akun</Th>
                <Th kanan>Nilai</Th>
                <Th>Tanggal Selesai</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {kontrakTersaring.map((k) => (
                <Baris key={k.id} onClick={() => onPilihKontrak(k.id)}>
                  <Td tebal>{k.nomorPks}</Td>
                  <Td>{namaKlien(data, k.klienId)}</Td>
                  <Td>{k.jenisPnBP}</Td>
                  <Td>{k.kategoriLayanan}</Td>
                  <Td>{kodeAkunKontrak(k)}</Td>
                  <Td kanan>{formatRupiah(k.nilaiKontrak)}</Td>
                  <Td>{formatTanggal(k.tanggalSelesai)}</Td>
                  <Td>
                    <StatusBadge status={k.status} />
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

function DetailKontrak({
  data,
  kontrak,
  onKembali,
}: {
  data: ModulProps['data'];
  kontrak: Kontrak;
  onKembali: () => void;
}) {
  const klien = data.klien.find((k) => k.id === kontrak.klienId);
  const tagihanKontrak = data.tagihan.filter((t) => t.kontrakId === kontrak.id);
  const sewa = kontrak.sewaId
    ? data.sewa.find((s) => s.id === kontrak.sewaId)
    : undefined;

  return (
    <div className="space-y-4">
      <TombolSekunder onClick={onKembali}>&larr; Kembali ke daftar</TombolSekunder>
      <JudulBagian>{kontrak.nomorPks}</JudulBagian>

      <Kartu>
        <dl className="grid gap-2 text-sm md:grid-cols-2">
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Klien</dt>
            <dd className="text-right font-semibold text-[#0d2569]">
              {klien?.nama ?? kontrak.klienId}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Jenis PNBP</dt>
            <dd className="text-[#0d2569]">{kontrak.jenisPnBP}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Kategori layanan</dt>
            <dd className="text-right text-[#0d2569]">{kontrak.kategoriLayanan}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Kode akun</dt>
            <dd className="text-[#0d2569]">
              {kodeAkunKontrak(kontrak)} — {uraianKodeAkun(kodeAkunKontrak(kontrak))}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Programa</dt>
            <dd className="text-[#0d2569]">{kontrak.programa ?? '-'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Periode</dt>
            <dd className="text-[#0d2569]">
              {formatTanggal(kontrak.tanggalMulai)} –{' '}
              {formatTanggal(kontrak.tanggalSelesai)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Nilai kontrak</dt>
            <dd className="font-semibold text-[#0d2569]">
              {formatRupiah(kontrak.nilaiKontrak)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Status</dt>
            <dd>
              <StatusBadge status={kontrak.status} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Penanggung jawab</dt>
            <dd className="text-[#0d2569]">{kontrak.penanggungJawab}</dd>
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
      </Kartu>

      <Kartu>
        <JudulBagian>Layanan (snapshot kontrak)</JudulBagian>
        <div className="mt-3">
          <Tabel>
            <thead>
              <tr>
                <Th>Nama</Th>
                <Th>Kode Akun</Th>
                <Th>Satuan</Th>
                <Th kanan>Tarif</Th>
                <Th kanan>Jumlah</Th>
                <Th kanan>Subtotal</Th>
              </tr>
            </thead>
            <tbody>
              {kontrak.layanan.map((l) => (
                <Baris key={l.id}>
                  <Td>{l.namaLayanan}</Td>
                  <Td>{l.kodeAkun}</Td>
                  <Td>{l.satuan}</Td>
                  <Td kanan>{formatRupiah(l.tarif)}</Td>
                  <Td kanan>{l.jumlah}</Td>
                  <Td kanan>{formatRupiah(l.subtotal)}</Td>
                </Baris>
              ))}
              <Baris className="bg-[#2573e2]/5 font-semibold">
                <Td colSpan={5} tebal>
                  Total (= nilai kontrak)
                </Td>
                <Td kanan tebal>{formatRupiah(kontrak.nilaiKontrak)}</Td>
              </Baris>
            </tbody>
          </Tabel>
        </div>
      </Kartu>

      <Kartu>
        <JudulBagian>Tagihan kontrak ini</JudulBagian>
        {tagihanKontrak.length === 0 ? (
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Belum ada tagihan untuk kontrak ini.
          </p>
        ) : (
          <div className="mt-3">
            <Tabel>
              <thead>
                <tr>
                  <Th>Nomor</Th>
                  <Th>Uraian</Th>
                  <Th kanan>Nilai</Th>
                  <Th>Jatuh Tempo</Th>
                  <Th>Status</Th>
                  <Th kanan>Sisa</Th>
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
                        status={statusTagihan(t, data.pembayaran)}
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
  const [penanggungJawab, setPenanggungJawab] = useState('');
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
      setError('Nomor PKS sudah dipakai oleh kontrak lain.');
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
      setError('Tanggal selesai tidak boleh sebelum tanggal mulai.');
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
      tanggalMulai,
      tanggalSelesai,
      penanggungJawab: penanggungJawab.trim(),
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
      <JudulBagian>Tambah Kontrak</JudulBagian>
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
                {k.nama}
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
                {k.nama}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[#0d2569]/70">
            Kode akun: {kategoriTerpilih?.kodeAkun ?? '-'} (
            {kategoriTerpilih
              ? uraianKodeAkun(kategoriTerpilih.kodeAkun)
              : '-'}
            ) — Jenis PNBP: {kategoriTerpilih?.jenisPnBP ?? '-'} (terisi otomatis
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
          <Label>Penanggung jawab *</Label>
          <input
            className={inputClass}
            value={penanggungJawab}
            onChange={(e) => setPenanggungJawab(e.target.value)}
            placeholder="Nama penanggung jawab"
          />
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
                        {k.nama}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-[#0d2569]/70">
                    Kode akun {kat?.kodeAkun ?? '-'} — {kat?.jenisPnBP ?? '-'}
                  </p>
                </div>
                <div>
                  <Label>Satuan</Label>
                  <input
                    className={inputClass}
                    value={b.satuan}
                    onChange={(e) => ubahBaris(idx, 'satuan', e.target.value)}
                    placeholder="Termin / Paket"
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
            Nilai kontrak (jumlah subtotal, tidak bisa diedit manual):{' '}
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
        <TombolUtama onClick={simpan}>Simpan Kontrak</TombolUtama>
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
            Checklist dokumen — {kontrak.nomorPks}
          </JudulBagian>
          <p className="text-sm font-semibold text-[#0d2569]">
            Kelengkapan: {persen}% ({jumlahAda} dari {berlaku.length} dokumen
            yang berlaku)
          </p>
        </div>
        <ul className="mt-4">
          {statusPerJenis.map(({ jenis, baris, status }) => (
            <ItemDaftar
              key={jenis}
              className="flex flex-wrap items-center justify-between gap-2"
            >
              <div>
                <p className="text-sm font-semibold text-[#0d2569]">{jenis}</p>
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
                <StatusBadge status={status} />
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
                          {s}
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
        <JudulBagian>Daftar kekurangan</JudulBagian>
        {kekurangan.length === 0 ? (
          <p className="mt-2 text-sm text-[#0d2569]/70">
            Tidak ada kekurangan — semua dokumen yang berlaku sudah ada.
          </p>
        ) : (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#0d2569]">
            {kekurangan.map((k) => (
              <li key={k.jenis}>{k.jenis} — Belum Ada</li>
            ))}
          </ul>
        )}
      </Kartu>
    </div>
  );
}

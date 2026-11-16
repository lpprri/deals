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
  jenisKlienYangAda,
  judulKontrak,
  labelArahUrutKontrak,
  nomorReferensiKontrak,
  urutkanKontrak,
  type ArahUrutKontrak,
  type KunciUrutKontrak,
} from '../lib/kontrakTampilan';
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
  const [filterJenisKlien, setFilterJenisKlien] = useState<string>('Semua');
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
          { id: 'klien', label: 'Clients' },
          { id: 'kontrak', label: 'Contracts / PKS' },
          { id: 'dokumen', label: 'Documents' },
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
          urutKunci={urutKunciKontrak}
          onUrutKunci={setUrutKunciKontrak}
          urutArah={urutArahKontrak}
          onUrutArah={setUrutArahKontrak}
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
        <JudulBagian>Clients</JudulBagian>
        {bolehTambah && (
          <TombolUtama onClick={() => onTampilForm(true)}>
            + Add Client
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
          Search results for &ldquo;{cari.trim()}&rdquo;: {klienTersaring.length} clients
        </p>
      )}

      {klienTersaring.length === 0 ? (
        <PesanKosong teks="No matching clients yet." />
      ) : (
        <Kartu>
          <Tabel>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Contact</Th>
                <Th>Phone</Th>
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
      <TombolSekunder onClick={onKembali}>&larr; Back to list</TombolSekunder>
      <JudulBagian>{klien.nama}</JudulBagian>

      <div className="grid gap-4 md:grid-cols-2">
        <Kartu>
          <JudulBagian>Client Details</JudulBagian>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Type</dt>
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
              <dt className="text-[#0d2569]/60">Address</dt>
              <dd className="text-right text-[#0d2569]">{klien.alamat}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">NPWP</dt>
              <dd className="text-[#0d2569]">{klien.npwp ?? '-'}</dd>
            </div>
            {klien.catatan && (
              <div className="flex justify-between gap-4">
                <dt className="text-[#0d2569]/60">Notes</dt>
                <dd className="text-right text-[#0d2569]">{klien.catatan}</dd>
              </div>
            )}
          </dl>
        </Kartu>

        <Kartu>
          <JudulBagian>Contact</JudulBagian>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Contact name</dt>
              <dd className="font-semibold text-[#0d2569]">{klien.kontakNama}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Position</dt>
              <dd className="text-[#0d2569]">{klien.kontakJabatan || '-'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Phone</dt>
              <dd className="text-[#0d2569]">{klien.telepon}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Email</dt>
              <dd className="text-[#0d2569]">{klien.email || '-'}</dd>
            </div>
          </dl>
          <p className="mt-4 border-t border-[#2573e2]/10 pt-3 text-sm">
            <span className="text-[#0d2569]/60">Open receivables: </span>
            <strong className="text-[#0d2569]">{formatRupiah(piutangTerbuka)}</strong>
          </p>
        </Kartu>
      </div>

      <Kartu>
        <JudulBagian>This client&apos;s contracts</JudulBagian>
        {kontrakKlien.length === 0 ? (
          <p className="mt-2 text-sm text-[#0d2569]/70">
            This client has no contracts yet.
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
        <JudulBagian>Related documents</JudulBagian>
        {dokumenTerkait.length === 0 ? (
          <p className="mt-2 text-sm text-[#0d2569]/70">
            No documents related to this client yet.
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
      setError('Name is required.');
      return;
    }
    if (form.telepon.trim() === '') {
      setError('Phone is required.');
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
      <JudulBagian>Add Client</JudulBagian>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Name *</Label>
          <input
            className={inputClass}
            value={form.nama}
            onChange={(e) => ubah('nama', e.target.value)}
            placeholder="Client name"
          />
        </div>
        <div>
          <Label>Type</Label>
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
          <Label>Address</Label>
          <input
            className={inputClass}
            value={form.alamat}
            onChange={(e) => ubah('alamat', e.target.value)}
            placeholder="Client address"
          />
        </div>
        <div>
          <Label>Contact name</Label>
          <input
            className={inputClass}
            value={form.kontakNama}
            onChange={(e) => ubah('kontakNama', e.target.value)}
            placeholder="Name of the person in charge at the client"
          />
        </div>
        <div>
          <Label>Contact position</Label>
          <input
            className={inputClass}
            value={form.kontakJabatan}
            onChange={(e) => ubah('kontakJabatan', e.target.value)}
            placeholder="Position"
          />
        </div>
        <div>
          <Label>Phone *</Label>
          <input
            className={inputClass}
            value={form.telepon}
            onChange={(e) => ubah('telepon', e.target.value)}
            placeholder="Phone number"
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
            placeholder="NPWP (optional)"
          />
        </div>
        <div>
          <Label>Notes</Label>
          <input
            className={inputClass}
            value={form.catatan}
            onChange={(e) => ubah('catatan', e.target.value)}
            placeholder="Notes (optional)"
          />
        </div>
      </div>

      {namaMirip && (
        <div className="mt-4">
          <Peringatan teks="A similar name already exists. Please double-check before saving — saving is still allowed if this is indeed a different client." />
        </div>
      )}
      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Save Client</TombolUtama>
        <TombolSekunder onClick={onBatal}>Cancel</TombolSekunder>
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
  urutKunci,
  onUrutKunci,
  urutArah,
  onUrutArah,
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
  urutKunci: KunciUrutKontrak;
  onUrutKunci: (v: KunciUrutKontrak) => void;
  urutArah: ArahUrutKontrak;
  onUrutArah: (v: ArahUrutKontrak) => void;
}) {
  const bolehTambah = bolehAksi(user.peran, 'tambahKontrak');

  if (kontrakTerpilih) {
    return (
      <DetailKontrak
        data={data}
        kontrak={kontrakTerpilih}
        actions={actions}
        onKembali={() => onPilihKontrak(null)}
      />
    );
  }

  // Kolom baru (keputusan pengguna 16/11/2026): 8 kolom di bawah, tanpa
  // kolom kode akun dan tanpa Status. Filter: Client Type + PNBP Type.
  const jenisKlien = (k: Kontrak): string | undefined =>
    data.klien.find((kl) => kl.id === k.klienId)?.jenis;
  const kontrakTersaring = urutkanKontrak(
    data.kontrak.filter(
      (k) =>
        (filterPnBP === 'Semua' || k.jenisPnBP === filterPnBP) &&
        (filterJenisKlien === 'Semua' || jenisKlien(k) === filterJenisKlien) &&
        cocokCari(
          `${k.nomorPks} ${namaKlien(data, k.klienId)} ${k.kategoriLayanan} ${judulKontrak(k) ?? ''} ${nomorReferensiKontrak(k) ?? ''}`,
        ),
    ),
    urutKunci,
    urutArah,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <JudulBagian>Contracts / PKS</JudulBagian>
        {bolehTambah && (
          <TombolUtama onClick={() => onTampilForm(true)}>
            + Add Contract
          </TombolUtama>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <Label>Client Type</Label>
          <select
            className={inputClass}
            value={filterJenisKlien}
            onChange={(e) => onFilterJenisKlien(e.target.value)}
          >
            <option value="Semua">All</option>
            {jenisKlienYangAda(data.klien).map((j) => (
              <option key={j} value={j}>
                {labelJenisKlien(j)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>PNBP Type</Label>
          <select
            className={inputClass}
            value={filterPnBP}
            onChange={(e) =>
              onFilterPnBP(e.target.value as 'Semua' | 'Fungsional' | 'Umum')
            }
          >
            <option value="Semua">All</option>
            <option value="Fungsional">Functional</option>
            <option value="Umum">General</option>
          </select>
        </div>
        <div>
          <Label>Sort by</Label>
          <select
            className={inputClass}
            value={urutKunci}
            onChange={(e) => onUrutKunci(e.target.value as KunciUrutKontrak)}
          >
            <option value="tandaTangan">Signing Date</option>
            <option value="selesai">End Date</option>
            <option value="nilai">Contract Value</option>
          </select>
        </div>
        <div>
          <Label>Order</Label>
          <TombolSekunder
            onClick={() => onUrutArah(urutArah === 'turun' ? 'naik' : 'turun')}
          >
            {urutArah === 'turun' ? '↓ ' : '↑ '}
            {labelArahUrutKontrak(urutKunci, urutArah)}
          </TombolSekunder>
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
        <PesanKosong teks="No matching contracts yet." />
      ) : (
        <Kartu>
          <Tabel>
            <thead>
              <tr>
                <Th>Contract Number</Th>
                <Th>Reference Number</Th>
                <Th>Contract Title</Th>
                <Th>Creation Date</Th>
                <Th>Client</Th>
                <Th>Service Type</Th>
                <Th>Contract Period</Th>
                <Th kanan>Contract Value</Th>
              </tr>
            </thead>
            <tbody>
              {kontrakTersaring.map((k) => (
                <Baris key={k.id} onClick={() => onPilihKontrak(k.id)}>
                  <Td tebal>{k.nomorPks}</Td>
                  <Td>{nomorReferensiKontrak(k) ?? '—'}</Td>
                  <Td>{judulKontrak(k) ?? '—'}</Td>
                  {/*
                    Creation Date ("Tanggal Kontrak" di file) TIDAK ada
                    sebagai field di app — tampil "—" dengan jujur.
                    tanggalTandaTangan TIDAK BOLEH dipakai di sini: nilainya
                    == tanggalMulai di 42/42 kontrak dan berbeda dari file
                    pada 33/40 kontrak (audit 16/11/2026).
                  */}
                  <Td>—</Td>
                  <Td>{namaKlien(data, k.klienId)}</Td>
                  <Td>{labelKategoriLayanan(k.kategoriLayanan)}</Td>
                  <Td>
                    {formatTanggal(k.tanggalMulai)} – {formatTanggal(k.tanggalSelesai)}
                  </Td>
                  <Td kanan>{formatRupiah(k.nilaiKontrak)}</Td>
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
  actions,
  onKembali,
}: {
  data: ModulProps['data'];
  kontrak: Kontrak;
  actions: ModulProps['actions'];
  onKembali: () => void;
}) {
  const klien = data.klien.find((k) => k.id === kontrak.klienId);
  const tagihanKontrak = data.tagihan.filter((t) => t.kontrakId === kontrak.id);
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

  return (
    <div className="space-y-4">
      <TombolSekunder onClick={onKembali}>&larr; Back to list</TombolSekunder>
      <JudulBagian>{kontrak.nomorPks}</JudulBagian>

      <Kartu>
        <dl className="grid gap-2 text-sm md:grid-cols-2">
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Client</dt>
            <dd className="text-right font-semibold text-[#0d2569]">
              {klien?.nama ?? kontrak.klienId}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">PNBP Type</dt>
            <dd className="text-[#0d2569]">{labelJenisPnBP(kontrak.jenisPnBP)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Service category</dt>
            <dd className="text-right text-[#0d2569]">{labelKategoriLayanan(kontrak.kategoriLayanan)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Programme</dt>
            <dd className="text-[#0d2569]">{kontrak.programa ?? '-'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Period</dt>
            <dd className="text-[#0d2569]">
              {formatTanggal(kontrak.tanggalMulai)} –{' '}
              {formatTanggal(kontrak.tanggalSelesai)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Contract value</dt>
            <dd className="font-semibold text-[#0d2569]">
              {formatRupiah(kontrak.nilaiKontrak)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Status</dt>
            <dd>
              <StatusBadge status={labelStatusKontrak(kontrak.status)} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Person in charge</dt>
            <dd className="text-[#0d2569]">{kontrak.penanggungJawab}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Closing operator</dt>
            <dd className="text-[#0d2569]">
              {kontrak.operatorPenutup ?? '— not yet assigned'}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Signing date</dt>
            <dd className="text-[#0d2569]">
              {kontrak.tanggalTandaTangan
                ? formatTanggal(kontrak.tanggalTandaTangan)
                : '— (start date used)'}
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
              <dt className="text-[#0d2569]/60">Notes</dt>
              <dd className="text-right text-[#0d2569]">{kontrak.catatan}</dd>
            </div>
          )}
          {sewa && (
            <div className="flex justify-between gap-4 md:col-span-2">
              <dt className="text-[#0d2569]/60">Related lease</dt>
              <dd className="text-right text-[#0d2569]">
                {sewa.aset} — agreement {sewa.nomorPerjanjian} (
                {formatRupiah(sewa.nilaiSewa)})
              </dd>
            </div>
          )}
        </dl>
      </Kartu>

      <Kartu>
        <JudulBagian>Employee Rank Attribution</JudulBagian>
        <p className="mt-1 text-xs text-[#0d2569]/70">
          The closing operator and signing date determine Employee Rank
          (Q-09). Imported contracts without a closing operator are not
          included in the ranking until assigned here.
        </p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <Label>Closing operator</Label>
            <input
              className={inputClass}
              value={operatorPenutup}
              onChange={(e) => setOperatorPenutup(e.target.value)}
              placeholder="Name of the Service staff member who closed the contract"
            />
          </div>
          <div>
            <Label>Signing date</Label>
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
                hasil !== null ? hasil : 'Contract attribution saved.',
              );
            }}
          >
            Save Attribution
          </TombolUtama>
        </div>
      </Kartu>

      <Kartu>
        <JudulBagian>Services (contract snapshot)</JudulBagian>
        <div className="mt-3">
          <Tabel>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Account Code</Th>
                <Th>Unit</Th>
                <Th kanan>Rate</Th>
                <Th kanan>Quantity</Th>
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
                  Total (= contract value)
                </Td>
                <Td kanan tebal>{formatRupiah(kontrak.nilaiKontrak)}</Td>
              </Baris>
            </tbody>
          </Tabel>
        </div>
      </Kartu>

      <Kartu>
        <JudulBagian>Invoices for this contract</JudulBagian>
        {tagihanKontrak.length === 0 ? (
          <p className="mt-2 text-sm text-[#0d2569]/70">
            No invoices yet for this contract.
          </p>
        ) : (
          <div className="mt-3">
            <Tabel>
              <thead>
                <tr>
                  <Th>Number</Th>
                  <Th>Description</Th>
                  <Th kanan>Amount</Th>
                  <Th>Due Date</Th>
                  <Th>Status</Th>
                  <Th kanan>Balance</Th>
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
      setError('PKS number is required.');
      return;
    }
    if (
      data.kontrak.some(
        (k) => k.nomorPks.trim().toLowerCase() === nomorPks.trim().toLowerCase(),
      )
    ) {
      setError('PKS number is already used by another contract.');
      return;
    }
    if (klienId === '') {
      setError('A client must be selected.');
      return;
    }
    if (tanggalMulai === '') {
      setError('Start date is required.');
      return;
    }
    if (tanggalSelesai === '') {
      setError('End date is required.');
      return;
    }
    if (tanggalSelesai < tanggalMulai) {
      setError('End date must not be before the start date.');
      return;
    }
    if (penanggungJawab.trim() === '') {
      setError('Person in charge is required.');
      return;
    }
    for (let i = 0; i < baris.length; i += 1) {
      const tarif = Number(baris[i].tarif);
      const jumlah = Number(baris[i].jumlah);
      if (!(tarif > 0)) {
        setError(`Rate on service row ${i + 1} must be more than 0.`);
        return;
      }
      if (!(jumlah > 0)) {
        setError(`Quantity on service row ${i + 1} must be more than 0.`);
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
      <JudulBagian>Add Contract</JudulBagian>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>PKS Number *</Label>
          <input
            className={inputClass}
            value={nomorPks}
            onChange={(e) => setNomorPks(e.target.value)}
            placeholder="PKS-000/2026"
          />
        </div>
        <div>
          <Label>Client *</Label>
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
          <Label>Service category *</Label>
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
            Account code: {kategoriTerpilih?.kodeAkun ?? '-'} (
            {kategoriTerpilih
              ? labelUraianKodeAkun(uraianKodeAkun(kategoriTerpilih.kodeAkun))
              : '-'}
            ) — PNBP type: {kategoriTerpilih ? labelJenisPnBP(kategoriTerpilih.jenisPnBP) : '-'} (filled automatically
            from the category)
          </p>
        </div>
        <div>
          <Label>Programme</Label>
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
          <Label>Start date *</Label>
          <input
            className={inputClass}
            type="date"
            value={tanggalMulai}
            onChange={(e) => setTanggalMulai(e.target.value)}
          />
        </div>
        <div>
          <Label>End date *</Label>
          <input
            className={inputClass}
            type="date"
            value={tanggalSelesai}
            onChange={(e) => setTanggalSelesai(e.target.value)}
          />
        </div>
        <div>
          <Label>Signing date</Label>
          <input
            className={inputClass}
            type="date"
            value={tanggalTandaTangan}
            onChange={(e) => setTanggalTandaTangan(e.target.value)}
          />
          <p className="mt-1 text-xs text-[#0d2569]/70">
            Reference period for Employee Rank (Q-09). Leave blank if unknown —
            the start date will be used.
          </p>
        </div>
        <div>
          <Label>Person in charge *</Label>
          <input
            className={inputClass}
            value={penanggungJawab}
            onChange={(e) => setPenanggungJawab(e.target.value)}
            placeholder="Name of the person in charge"
          />
          <p className="mt-1 text-xs text-[#0d2569]/70">
            Client PIC (not an operator).
          </p>
        </div>
        <div>
          <Label>Closing operator</Label>
          <input
            className={inputClass}
            value={operatorPenutup}
            onChange={(e) => setOperatorPenutup(e.target.value)}
            placeholder="Leave blank = the signed-in operator"
          />
          <p className="mt-1 text-xs text-[#0d2569]/70">
            Service staff who closed this contract — reference for Employee Rank.
          </p>
        </div>
        <div>
          <Label>Notes</Label>
          <input
            className={inputClass}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Notes (optional)"
          />
        </div>
      </div>

      <div className="mt-6">
        <JudulBagian>Service rows</JudulBagian>
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
                  <Label>Category</Label>
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
                    Account code {kat?.kodeAkun ?? '-'} — {kat ? labelJenisPnBP(kat.jenisPnBP) : '-'}
                  </p>
                </div>
                <div>
                  <Label>Unit</Label>
                  <input
                    className={inputClass}
                    value={b.satuan}
                    onChange={(e) => ubahBaris(idx, 'satuan', e.target.value)}
                    placeholder="Term / Package"
                  />
                </div>
                <div>
                  <Label>Rate (Rp)</Label>
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    value={b.tarif}
                    onChange={(e) => ubahBaris(idx, 'tarif', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
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
                      Remove row
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
            + Add service row
          </TombolSekunder>
          <p className="text-sm text-[#0d2569]">
            Contract value (sum of subtotals, cannot be edited manually):{' '}
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
        <TombolUtama onClick={simpan}>Save Contract</TombolUtama>
        <TombolSekunder onClick={onBatal}>Cancel</TombolSekunder>
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
    return <PesanKosong teks="No contracts yet to show documents for." />;
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Choose contract</Label>
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
            Document checklist — {kontrak.nomorPks}
          </JudulBagian>
          <p className="text-sm font-semibold text-[#0d2569]">
            Completeness: {persen}% ({jumlahAda} of {berlaku.length} applicable
            documents)
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
                    No document row exists for this type yet.
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
        <JudulBagian>Missing items</JudulBagian>
        {kekurangan.length === 0 ? (
          <p className="mt-2 text-sm text-[#0d2569]/70">
            No missing items — all applicable documents are available.
          </p>
        ) : (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#0d2569]">
            {kekurangan.map((k) => (
              <li key={k.jenis}>{labelJenisDokumen(k.jenis)} — Not yet available</li>
            ))}
          </ul>
        )}
      </Kartu>
    </div>
  );
}

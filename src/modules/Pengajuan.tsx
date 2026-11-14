// Modul Pengajuan (PRD v2.0 Final Bab 6.10 & Bab 9).
// Palet HANYA 3 warna RRI: Biru #2573E2, Navy #0D2569, Putih #FFFFFF.

import { useState } from 'react';
import type { Pengajuan as PengajuanItem, TahapPengajuan } from '../lib/types';
import type { ModulProps, PengajuanInput } from '../lib/store';
import { MASTER_TAHAP_PENGAJUAN } from '../lib/master';
import { formatRupiah, formatTanggal, hariIniIso } from '../lib/format';
import { bolehAksi } from '../lib/permissions';
import {
  JudulBagian,
  Kartu,
  Label,
  PesanKosong,
  StatusBadge,
  TombolSekunder,
  TombolUtama,
  inputClass,
} from '../components/ui';

const th = 'px-3 py-2 text-left text-xs font-semibold text-[#0d2569]/70';
const td = 'px-3 py-2 align-top text-sm text-[#0d2569]';
const barisKlik =
  'cursor-pointer border-t border-[#2573e2]/10 hover:bg-[#2573e2]/5';

/**
 * Tahap berikutnya yang sah (Bab 9). 'Dikonversi' hanya lewat konversi
 * menjadi kontrak, bukan pindah tahap langsung.
 */
function tahapBerikutnya(tahap: TahapPengajuan): TahapPengajuan[] {
  switch (tahap) {
    case 'Masuk':
      return ['Ditelaah'];
    case 'Ditelaah':
      return ['Disetujui', 'Ditolak'];
    case 'Menunggu Dokumen':
      return ['Ditelaah'];
    case 'Disetujui':
      return ['Ditolak'];
    default:
      return [];
  }
}

export default function Pengajuan(props: ModulProps) {
  const { data, user, actions, cari } = props;
  const [filterTahap, setFilterTahap] = useState<string>('Semua');
  const [pengajuanIdTerpilih, setPengajuanIdTerpilih] = useState<string | null>(null);
  const [tampilForm, setTampilForm] = useState(false);

  const kataKunci = cari.trim().toLowerCase();
  const pengajuanTersaring = data.pengajuan.filter(
    (p) =>
      (filterTahap === 'Semua' || p.tahap === filterTahap) &&
      (kataKunci === '' ||
        `${p.id} ${p.pemohon} ${p.kebutuhan} ${p.penanggungJawab}`
          .toLowerCase()
          .includes(kataKunci)),
  );

  const pengajuanTerpilih = pengajuanIdTerpilih
    ? data.pengajuan.find((p) => p.id === pengajuanIdTerpilih) ?? null
    : null;

  if (pengajuanTerpilih) {
    return (
      <DetailPengajuan
        data={data}
        user={user}
        actions={actions}
        pengajuan={pengajuanTerpilih}
        onKembali={() => setPengajuanIdTerpilih(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <JudulBagian>Pengajuan</JudulBagian>
        {bolehAksi(user.peran, 'tambahPengajuan') && (
          <TombolUtama onClick={() => setTampilForm(true)}>
            + Tambah Pengajuan
          </TombolUtama>
        )}
      </div>

      <div>
        <Label>Filter tahap</Label>
        <select
          className={`${inputClass} max-w-xs`}
          value={filterTahap}
          onChange={(e) => setFilterTahap(e.target.value)}
        >
          <option value="Semua">Semua</option>
          {MASTER_TAHAP_PENGAJUAN.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {tampilForm && (
        <FormPengajuan
          actions={actions}
          onBatal={() => setTampilForm(false)}
          onSukses={() => setTampilForm(false)}
        />
      )}

      {pengajuanTersaring.length === 0 ? (
        <PesanKosong teks="Belum ada pengajuan yang cocok." />
      ) : (
        <Kartu className="overflow-x-auto p-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#2573e2]/5">
                <th className={th}>ID</th>
                <th className={th}>Jenis</th>
                <th className={th}>Pemohon</th>
                <th className={th}>Tanggal Masuk</th>
                <th className={th}>Kebutuhan</th>
                <th className={th}>Tahap</th>
                <th className={th}>Penanggung Jawab</th>
              </tr>
            </thead>
            <tbody>
              {pengajuanTersaring.map((p) => (
                <tr
                  key={p.id}
                  className={barisKlik}
                  onClick={() => setPengajuanIdTerpilih(p.id)}
                >
                  <td className={`${td} font-semibold`}>{p.id}</td>
                  <td className={td}>{p.jenis}</td>
                  <td className={td}>{p.pemohon}</td>
                  <td className={td}>{formatTanggal(p.tanggalMasuk)}</td>
                  <td className={td}>{p.kebutuhan}</td>
                  <td className={td}>
                    <StatusBadge status={p.tahap} />
                  </td>
                  <td className={td}>{p.penanggungJawab}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Kartu>
      )}
    </div>
  );
}

function DetailPengajuan({
  data,
  user,
  actions,
  pengajuan,
  onKembali,
}: {
  data: ModulProps['data'];
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  pengajuan: PengajuanItem;
  onKembali: () => void;
}) {
  const bolehUbah = bolehAksi(user.peran, 'ubahPengajuan');
  const bolehKonversi = bolehAksi(user.peran, 'konversiPengajuan');
  const [tahapTolak, setTahapTolak] = useState(false);
  const [alasanTolak, setAlasanTolak] = useState('');
  const [pesan, setPesan] = useState('');

  const pindahTahap = (tahap: TahapPengajuan) => {
    if (tahap === 'Ditolak') {
      setTahapTolak(true);
      setPesan('');
      return;
    }
    actions.ubahTahapPengajuan(pengajuan, tahap);
    setPesan(`Tahap pengajuan diubah menjadi ${tahap}.`);
  };

  const konfirmasiTolak = () => {
    if (alasanTolak.trim() === '') {
      setPesan('Alasan penolakan wajib diisi.');
      return;
    }
    actions.ubahTahapPengajuan(pengajuan, 'Ditolak', alasanTolak.trim());
    setTahapTolak(false);
    setAlasanTolak('');
    setPesan('Pengajuan ditolak dengan alasan yang dicatat.');
  };

  const konversi = () => {
    const hasil = actions.konversiPengajuan(pengajuan);
    if (hasil !== null) {
      setPesan(hasil);
      return;
    }
    // Nomor PKS baru dibaca dari data terbaru (hasilKonversi) setelah
    // store memperbarui pengajuan; detail me-render ulang dari props.
    const terbaru = data.pengajuan.find((p) => p.id === pengajuan.id);
    setPesan(
      terbaru?.hasilKonversi
        ? `Pengajuan berhasil dikonversi menjadi ${terbaru.hasilKonversi.label}.`
        : 'Pengajuan berhasil dikonversi.',
    );
  };

  return (
    <div className="space-y-4">
      <TombolSekunder onClick={onKembali}>&larr; Kembali ke daftar</TombolSekunder>
      <JudulBagian>
        {pengajuan.id} — {pengajuan.jenis}
      </JudulBagian>

      <Kartu>
        <dl className="grid gap-2 text-sm md:grid-cols-2">
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Pemohon</dt>
            <dd className="text-right font-semibold text-[#0d2569]">
              {pengajuan.pemohon}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Tanggal masuk</dt>
            <dd className="text-[#0d2569]">{formatTanggal(pengajuan.tanggalMasuk)}</dd>
          </div>
          <div className="flex justify-between gap-4 md:col-span-2">
            <dt className="text-[#0d2569]/60">Kebutuhan</dt>
            <dd className="text-right text-[#0d2569]">{pengajuan.kebutuhan}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Tahap</dt>
            <dd>
              <StatusBadge status={pengajuan.tahap} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Penanggung jawab</dt>
            <dd className="text-[#0d2569]">{pengajuan.penanggungJawab}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Nilai perkiraan</dt>
            <dd className="text-[#0d2569]">
              {pengajuan.nilaiPerkiraan !== undefined
                ? formatRupiah(pengajuan.nilaiPerkiraan)
                : '-'}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Satker</dt>
            <dd className="text-[#0d2569]">
              {pengajuan.satker.nama} ({pengajuan.satker.kode})
            </dd>
          </div>
          {pengajuan.catatan && (
            <div className="flex justify-between gap-4 md:col-span-2">
              <dt className="text-[#0d2569]/60">Catatan</dt>
              <dd className="text-right text-[#0d2569]">{pengajuan.catatan}</dd>
            </div>
          )}
          {pengajuan.tahap === 'Ditolak' && pengajuan.alasanTolak && (
            <div className="flex justify-between gap-4 md:col-span-2">
              <dt className="text-[#0d2569]/60">Alasan ditolak</dt>
              <dd className="text-right text-[#0d2569]">{pengajuan.alasanTolak}</dd>
            </div>
          )}
          {pengajuan.tahap === 'Dikonversi' && pengajuan.hasilKonversi && (
            <div className="flex justify-between gap-4 md:col-span-2">
              <dt className="text-[#0d2569]/60">Hasil konversi</dt>
              <dd className="text-right font-semibold text-[#0d2569]">
                {pengajuan.hasilKonversi.jenis}: {pengajuan.hasilKonversi.label}
              </dd>
            </div>
          )}
        </dl>
      </Kartu>

      {bolehUbah && tahapBerikutnya(pengajuan.tahap).length > 0 && (
        <Kartu>
          <JudulBagian>Ubah tahap</JudulBagian>
          <div className="mt-3 flex flex-wrap gap-2">
            {tahapBerikutnya(pengajuan.tahap).map((t) => (
              <TombolSekunder key={t} onClick={() => pindahTahap(t)}>
                {t === 'Ditolak' ? 'Tolak' : `Pindah ke ${t}`}
              </TombolSekunder>
            ))}
          </div>
          {tahapTolak && (
            <div className="mt-4">
              <Label>Alasan penolakan *</Label>
              <textarea
                className={`${inputClass} min-h-20`}
                value={alasanTolak}
                onChange={(e) => setAlasanTolak(e.target.value)}
                placeholder="Alasan penolakan wajib diisi"
              />
              <div className="mt-2 flex gap-2">
                <TombolUtama onClick={konfirmasiTolak}>
                  Konfirmasi Penolakan
                </TombolUtama>
                <TombolSekunder
                  onClick={() => {
                    setTahapTolak(false);
                    setAlasanTolak('');
                  }}
                >
                  Batal
                </TombolSekunder>
              </div>
            </div>
          )}
        </Kartu>
      )}

      {bolehKonversi && pengajuan.tahap === 'Disetujui' && (
        <Kartu>
          <JudulBagian>Konversi</JudulBagian>
          <p className="mt-1 text-sm text-[#0d2569]/70">
            Pengajuan yang disetujui dapat dikonversi menjadi kontrak.
          </p>
          <div className="mt-3">
            <TombolUtama onClick={konversi}>Konversi menjadi Kontrak</TombolUtama>
          </div>
        </Kartu>
      )}

      {pesan !== '' && (
        <p className="rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {pesan}
        </p>
      )}
    </div>
  );
}

function FormPengajuan({
  actions,
  onBatal,
  onSukses,
}: {
  actions: ModulProps['actions'];
  onBatal: () => void;
  onSukses: () => void;
}) {
  const [form, setForm] = useState<PengajuanInput>({
    jenis: 'Kerja Sama Baru',
    pemohon: '',
    tanggalMasuk: hariIniIso(),
    kebutuhan: '',
    penanggungJawab: '',
    nilaiPerkiraan: undefined,
  });
  const [nilaiPerkiraanTeks, setNilaiPerkiraanTeks] = useState('');
  const [error, setError] = useState('');

  const ubahTeks = (
    field: 'pemohon' | 'tanggalMasuk' | 'kebutuhan' | 'penanggungJawab',
    nilai: string,
  ) => setForm((f) => ({ ...f, [field]: nilai }));

  const simpan = () => {
    if (form.pemohon.trim() === '') {
      setError('Pemohon wajib diisi.');
      return;
    }
    if (form.tanggalMasuk === '') {
      setError('Tanggal masuk wajib diisi.');
      return;
    }
    if (form.kebutuhan.trim() === '') {
      setError('Kebutuhan wajib diisi.');
      return;
    }
    if (form.penanggungJawab.trim() === '') {
      setError('Penanggung jawab wajib diisi.');
      return;
    }
    const nilaiPerkiraan =
      nilaiPerkiraanTeks.trim() === '' ? undefined : Number(nilaiPerkiraanTeks);
    if (nilaiPerkiraan !== undefined && !(nilaiPerkiraan >= 0)) {
      setError('Nilai perkiraan harus berupa angka 0 atau lebih.');
      return;
    }
    const hasil = actions.tambahPengajuan({
      ...form,
      pemohon: form.pemohon.trim(),
      kebutuhan: form.kebutuhan.trim(),
      penanggungJawab: form.penanggungJawab.trim(),
      nilaiPerkiraan,
    });
    if (hasil !== null) {
      setError(hasil);
      return;
    }
    onSukses();
  };

  return (
    <Kartu>
      <JudulBagian>Tambah Pengajuan</JudulBagian>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Jenis *</Label>
          <select
            className={inputClass}
            value={form.jenis}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                jenis: e.target.value as 'Kerja Sama Baru' | 'Sewa Baru',
              }))
            }
          >
            <option value="Kerja Sama Baru">Kerja Sama Baru</option>
            <option value="Sewa Baru">Sewa Baru</option>
          </select>
        </div>
        <div>
          <Label>Pemohon *</Label>
          <input
            className={inputClass}
            value={form.pemohon}
            onChange={(e) => ubahTeks('pemohon', e.target.value)}
            placeholder="Nama pemohon"
          />
        </div>
        <div>
          <Label>Tanggal masuk *</Label>
          <input
            className={inputClass}
            type="date"
            value={form.tanggalMasuk}
            onChange={(e) => ubahTeks('tanggalMasuk', e.target.value)}
          />
        </div>
        <div>
          <Label>Penanggung jawab *</Label>
          <input
            className={inputClass}
            value={form.penanggungJawab}
            onChange={(e) => ubahTeks('penanggungJawab', e.target.value)}
            placeholder="Nama penanggung jawab"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Kebutuhan *</Label>
          <textarea
            className={`${inputClass} min-h-20`}
            value={form.kebutuhan}
            onChange={(e) => ubahTeks('kebutuhan', e.target.value)}
            placeholder="Uraian kebutuhan pengajuan"
          />
        </div>
        <div>
          <Label>Nilai perkiraan (Rp, opsional)</Label>
          <input
            className={inputClass}
            type="number"
            min="0"
            value={nilaiPerkiraanTeks}
            onChange={(e) => setNilaiPerkiraanTeks(e.target.value)}
            placeholder="Kosongkan bila belum ada perkiraan"
          />
        </div>
      </div>

      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Simpan Pengajuan</TombolUtama>
        <TombolSekunder onClick={onBatal}>Batal</TombolSekunder>
      </div>
    </Kartu>
  );
}

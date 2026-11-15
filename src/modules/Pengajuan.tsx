// Modul Pengajuan (PRD v2.0 Final Bab 6.10 & Bab 9).
// Palet HANYA 3 warna RRI: Biru #2573E2, Navy #0D2569, Putih #FFFFFF.

import { useState } from 'react';
import type {
  Pengajuan as PengajuanItem,
  PengajuanKlien,
  TahapPengajuan,
} from '../lib/types';
import type { ModulProps, PengajuanInput } from '../lib/store';
import { MASTER_TAHAP_PENGAJUAN } from '../lib/master';
import { formatRupiah, formatTanggal, hariIniIso } from '../lib/format';
import { bolehAksi } from '../lib/permissions';
import {
  labelStatusPersetujuan,
  labelTahapPengajuan,
} from '../lib/labels';

/**
 * Tampilan Inggris untuk nilai tersimpan yang belum ada di labels.ts
 * (dilaporkan ke koordinator untuk konsolidasi).
 */
const JENIS_PENGAJUAN_EN: Record<string, string> = {
  'Kerja Sama Baru': 'New Partnership',
  'Sewa Baru': 'New Lease',
};
const JENIS_PENGAJUAN_KLIEN_EN: Record<string, string> = {
  'Pengajuan Kerja Sama': 'Partnership Submission',
  'Media Order': 'Media Order',
  'Permohonan Sewa': 'Lease Request',
};
const JENIS_KONVERSI_EN: Record<string, string> = {
  Kontrak: 'Contract',
  Sewa: 'Lease',
};
import {
  Baris,
  JudulBagian,
  Kartu,
  Label,
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
  // Antrean approval pengajuan publik: tab di dalam modul Pengajuan
  // (bukan modul/sidebar baru). KOREKSI 2026-11-15: submission dibuat
  // lewat form publik tanpa login/akun klien.
  const [tabAktif, setTabAktif] = useState<string>('pengajuan');
  const jumlahMenungguPortal = data.pengajuanKlien.filter(
    (s) => s.status === 'Menunggu',
  ).length;

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

  if (pengajuanTerpilih && tabAktif === 'pengajuan') {
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
        <JudulBagian>Submission</JudulBagian>
        {tabAktif === 'pengajuan' && bolehAksi(user.peran, 'tambahPengajuan') && (
          <TombolUtama onClick={() => setTampilForm(true)}>
            + Add Submission
          </TombolUtama>
        )}
      </div>

      <TabBar
        tabs={[
          { id: 'pengajuan', label: 'Submission' },
          {
            id: 'portal',
            label:
              jumlahMenungguPortal > 0
                ? `Public Submissions (${jumlahMenungguPortal} pending)`
                : 'Public Submissions',
          },
        ]}
        aktif={tabAktif}
        onPilih={setTabAktif}
      />

      {tabAktif === 'portal' ? (
        <AntreanPortalKlien data={data} user={user} actions={actions} cari={cari} />
      ) : (
        <>
          <div>
            <Label>Filter by stage</Label>
            <select
              className={`${inputClass} max-w-xs`}
              value={filterTahap}
              onChange={(e) => setFilterTahap(e.target.value)}
            >
              <option value="Semua">All</option>
              {MASTER_TAHAP_PENGAJUAN.map((t) => (
                <option key={t} value={t}>
                  {labelTahapPengajuan(t)}
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
            <PesanKosong teks="No matching submissions yet." />
          ) : (
            <Kartu>
              <Tabel>
                <thead>
                  <tr>
                    <Th>ID</Th>
                    <Th>Type</Th>
                    <Th>Applicant</Th>
                    <Th>Received Date</Th>
                    <Th>Requirement</Th>
                    <Th>Stage</Th>
                    <Th>Person in Charge</Th>
                  </tr>
                </thead>
                <tbody>
                  {pengajuanTersaring.map((p) => (
                    <Baris
                      key={p.id}
                      onClick={() => setPengajuanIdTerpilih(p.id)}
                      className="border-t border-[#2573e2]/10"
                    >
                      <Td tebal>{p.id}</Td>
                      <Td>{JENIS_PENGAJUAN_EN[p.jenis] ?? p.jenis}</Td>
                      <Td>{p.pemohon}</Td>
                      <Td>{formatTanggal(p.tanggalMasuk)}</Td>
                      <Td>{p.kebutuhan}</Td>
                      <Td>
                        <StatusBadge status={labelTahapPengajuan(p.tahap)} />
                      </Td>
                      <Td>{p.penanggungJawab}</Td>
                    </Baris>
                  ))}
                </tbody>
              </Tabel>
            </Kartu>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Antrean approval pengajuan publik.
 * Approval dilakukan OPERATOR. Submission yang disetujui menjadi Prospect
 * baru lewat alur Sales yang sudah ada (bukan entitas order kedua);
 * yang ditolak menyimpan status + catatan, dan keduanya tercatat di
 * audit trail.
 */
function AntreanPortalKlien({ data, user, actions, cari }: ModulProps) {
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [terpilihId, setTerpilihId] = useState<string | null>(null);
  const [catatan, setCatatan] = useState('');
  const [pesan, setPesan] = useState('');

  const bolehSetujui = bolehAksi(user.peran, 'setujuiPengajuanKlien');
  const bolehTolak = bolehAksi(user.peran, 'tolakPengajuanKlien');

  const kataKunci = cari.trim().toLowerCase();
  const daftar = data.pengajuanKlien.filter(
    (s) =>
      (filterStatus === 'Semua' || s.status === filterStatus) &&
      (kataKunci === '' ||
        `${s.id} ${s.jenis} ${s.judul} ${s.namaPic} ${s.uraian}`
          .toLowerCase()
          .includes(kataKunci)),
  );
  const terpilih = terpilihId
    ? data.pengajuanKlien.find((s) => s.id === terpilihId) ?? null
    : null;

  const setujui = (s: PengajuanKlien) => {
    const hasil = actions.setujuiPengajuanKlien(s, catatan.trim() || undefined);
    if (hasil !== null) {
      setPesan(hasil);
      return;
    }
    const terbaru = data.pengajuanKlien.find((x) => x.id === s.id);
    setPesan(
      terbaru?.prospectId
        ? `Submission approved — new Prospect ${terbaru.prospectId} created for follow-up through the Sales flow.`
        : 'Submission approved.',
    );
    setCatatan('');
  };

  const tolak = (s: PengajuanKlien) => {
    if (catatan.trim() === '') {
      setPesan('Rejection note is required.');
      return;
    }
    const hasil = actions.tolakPengajuanKlien(s, catatan.trim());
    if (hasil !== null) {
      setPesan(hasil);
      return;
    }
    setPesan('Submission rejected with the note saved.');
    setCatatan('');
  };

  if (terpilih) {
    const namaKlien =
      data.klien.find((k) => k.id === terpilih.klienId)?.nama ??
      terpilih.namaInstitusi ??
      '-';
    return (
      <div className="space-y-4">
        <TombolSekunder onClick={() => setTerpilihId(null)}>
          &larr; Back to queue
        </TombolSekunder>
        <JudulBagian>
          {terpilih.id} — {JENIS_PENGAJUAN_KLIEN_EN[terpilih.jenis] ?? terpilih.jenis}
        </JudulBagian>
        <Kartu>
          <dl className="grid gap-2 text-sm md:grid-cols-2">
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Client</dt>
              <dd className="text-right font-semibold text-[#0d2569]">
                {namaKlien}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Creating PIC</dt>
              <dd className="text-right text-[#0d2569]">
                {terpilih.namaPic} ({terpilih.dibuatOleh})
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Created date</dt>
              <dd className="text-[#0d2569]">
                {formatTanggal(terpilih.tanggalBuat)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#0d2569]/60">Status</dt>
              <dd>
                <StatusBadge status={labelStatusPersetujuan(terpilih.status)} />
              </dd>
            </div>
            <div className="flex justify-between gap-4 md:col-span-2">
              <dt className="text-[#0d2569]/60">Title</dt>
              <dd className="text-right text-[#0d2569]">{terpilih.judul}</dd>
            </div>
            <div className="flex justify-between gap-4 md:col-span-2">
              <dt className="text-[#0d2569]/60">Description</dt>
              <dd className="text-right text-[#0d2569]">{terpilih.uraian}</dd>
            </div>
            {terpilih.nilaiPerkiraan !== undefined && (
              <div className="flex justify-between gap-4">
                <dt className="text-[#0d2569]/60">Estimated value</dt>
                <dd className="text-[#0d2569]">
                  {formatRupiah(terpilih.nilaiPerkiraan)}
                </dd>
              </div>
            )}
            {terpilih.prospectId && (
              <div className="flex justify-between gap-4">
                <dt className="text-[#0d2569]/60">Prospect resulting from approval</dt>
                <dd className="font-semibold text-[#0d2569]">
                  {terpilih.prospectId}
                </dd>
              </div>
            )}
            {terpilih.catatanOperator && (
              <div className="flex justify-between gap-4 md:col-span-2">
                <dt className="text-[#0d2569]/60">Operator note</dt>
                <dd className="text-right text-[#0d2569]">
                  {terpilih.catatanOperator}
                </dd>
              </div>
            )}
          </dl>
        </Kartu>

        {(bolehSetujui || bolehTolak) && terpilih.status === 'Menunggu' && (
          <Kartu>
            <JudulBagian>Approval Decision</JudulBagian>
            <p className="mt-1 text-sm text-[#0d2569]/70">
              Approving will create a new Prospect for this client and
              continue it through the existing Sales flow (prospect →
              quotation → order → contract).
            </p>
            <div className="mt-3">
              <Label>Operator note (required when rejecting)</Label>
              <textarea
                className={`${inputClass} min-h-20`}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Note for the client PIC"
              />
            </div>
            <div className="mt-3 flex gap-2">
              {bolehSetujui && (
                <TombolUtama onClick={() => setujui(terpilih)}>
                  Approve
                </TombolUtama>
              )}
              {bolehTolak && (
                <TombolSekunder onClick={() => tolak(terpilih)}>
                  Reject
                </TombolSekunder>
              )}
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

  return (
    <div className="space-y-4">
      <div>
        <Label>Filter by status</Label>
        <select
          className={`${inputClass} max-w-xs`}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="Semua">All</option>
          <option value="Menunggu">Pending</option>
          <option value="Disetujui">Approved</option>
          <option value="Ditolak">Rejected</option>
        </select>
      </div>
      {daftar.length === 0 ? (
        <PesanKosong teks="No matching public submissions yet." />
      ) : (
        <Kartu>
          <Tabel>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Type</Th>
                <Th>Title</Th>
                <Th>Client</Th>
                <Th>PIC</Th>
                <Th>Date</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {daftar.map((s) => (
                <Baris
                  key={s.id}
                  onClick={() => setTerpilihId(s.id)}
                  className="border-t border-[#2573e2]/10"
                >
                  <Td tebal>{s.id}</Td>
                  <Td>{JENIS_PENGAJUAN_KLIEN_EN[s.jenis] ?? s.jenis}</Td>
                  <Td>{s.judul}</Td>
                  <Td>
                    {data.klien.find((k) => k.id === s.klienId)?.nama ??
                      s.namaInstitusi ??
                      '-'}
                  </Td>
                  <Td>{s.namaPic}</Td>
                  <Td>{formatTanggal(s.tanggalBuat)}</Td>
                  <Td>
                    <StatusBadge status={labelStatusPersetujuan(s.status)} />
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
    setPesan(`Submission stage changed to ${labelTahapPengajuan(tahap)}.`);
  };

  const konfirmasiTolak = () => {
    if (alasanTolak.trim() === '') {
      setPesan('Rejection reason is required.');
      return;
    }
    actions.ubahTahapPengajuan(pengajuan, 'Ditolak', alasanTolak.trim());
    setTahapTolak(false);
    setAlasanTolak('');
    setPesan('Submission rejected with the reason recorded.');
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
        ? `Submission successfully converted into ${terbaru.hasilKonversi.label}.`
        : 'Submission successfully converted.',
    );
  };

  return (
    <div className="space-y-4">
      <TombolSekunder onClick={onKembali}>&larr; Back to list</TombolSekunder>
      <JudulBagian>
        {pengajuan.id} — {JENIS_PENGAJUAN_EN[pengajuan.jenis] ?? pengajuan.jenis}
      </JudulBagian>

      <Kartu>
        <dl className="grid gap-2 text-sm md:grid-cols-2">
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Applicant</dt>
            <dd className="text-right font-semibold text-[#0d2569]">
              {pengajuan.pemohon}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Received date</dt>
            <dd className="text-[#0d2569]">{formatTanggal(pengajuan.tanggalMasuk)}</dd>
          </div>
          <div className="flex justify-between gap-4 md:col-span-2">
            <dt className="text-[#0d2569]/60">Requirement</dt>
            <dd className="text-right text-[#0d2569]">{pengajuan.kebutuhan}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Stage</dt>
            <dd>
              <StatusBadge status={labelTahapPengajuan(pengajuan.tahap)} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Person in charge</dt>
            <dd className="text-[#0d2569]">{pengajuan.penanggungJawab}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[#0d2569]/60">Estimated value</dt>
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
              <dt className="text-[#0d2569]/60">Notes</dt>
              <dd className="text-right text-[#0d2569]">{pengajuan.catatan}</dd>
            </div>
          )}
          {pengajuan.tahap === 'Ditolak' && pengajuan.alasanTolak && (
            <div className="flex justify-between gap-4 md:col-span-2">
              <dt className="text-[#0d2569]/60">Rejection reason</dt>
              <dd className="text-right text-[#0d2569]">{pengajuan.alasanTolak}</dd>
            </div>
          )}
          {pengajuan.tahap === 'Dikonversi' && pengajuan.hasilKonversi && (
            <div className="flex justify-between gap-4 md:col-span-2">
              <dt className="text-[#0d2569]/60">Conversion result</dt>
              <dd className="text-right font-semibold text-[#0d2569]">
                {JENIS_KONVERSI_EN[pengajuan.hasilKonversi.jenis] ?? pengajuan.hasilKonversi.jenis}: {pengajuan.hasilKonversi.label}
              </dd>
            </div>
          )}
        </dl>
      </Kartu>

      {bolehUbah && tahapBerikutnya(pengajuan.tahap).length > 0 && (
        <Kartu>
          <JudulBagian>Change Stage</JudulBagian>
          <div className="mt-3 flex flex-wrap gap-2">
            {tahapBerikutnya(pengajuan.tahap).map((t) => (
              <TombolSekunder key={t} onClick={() => pindahTahap(t)}>
                {t === 'Ditolak' ? 'Reject' : `Move to ${labelTahapPengajuan(t)}`}
              </TombolSekunder>
            ))}
          </div>
          {tahapTolak && (
            <div className="mt-4">
              <Label>Rejection reason *</Label>
              <textarea
                className={`${inputClass} min-h-20`}
                value={alasanTolak}
                onChange={(e) => setAlasanTolak(e.target.value)}
                placeholder="Rejection reason is required"
              />
              <div className="mt-2 flex gap-2">
                <TombolUtama onClick={konfirmasiTolak}>
                  Confirm Rejection
                </TombolUtama>
                <TombolSekunder
                  onClick={() => {
                    setTahapTolak(false);
                    setAlasanTolak('');
                  }}
                >
                  Cancel
                </TombolSekunder>
              </div>
            </div>
          )}
        </Kartu>
      )}

      {bolehKonversi && pengajuan.tahap === 'Disetujui' && (
        <Kartu>
          <JudulBagian>Conversion</JudulBagian>
          <p className="mt-1 text-sm text-[#0d2569]/70">
            An approved submission can be converted into a contract.
          </p>
          <div className="mt-3">
            <TombolUtama onClick={konversi}>Convert into Contract</TombolUtama>
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
      setError('Applicant is required.');
      return;
    }
    if (form.tanggalMasuk === '') {
      setError('Received date is required.');
      return;
    }
    if (form.kebutuhan.trim() === '') {
      setError('Requirement is required.');
      return;
    }
    if (form.penanggungJawab.trim() === '') {
      setError('Person in charge is required.');
      return;
    }
    const nilaiPerkiraan =
      nilaiPerkiraanTeks.trim() === '' ? undefined : Number(nilaiPerkiraanTeks);
    if (nilaiPerkiraan !== undefined && !(nilaiPerkiraan >= 0)) {
      setError('Estimated value must be a number 0 or greater.');
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
      <JudulBagian>Add Submission</JudulBagian>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Type *</Label>
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
            <option value="Kerja Sama Baru">New Partnership</option>
            <option value="Sewa Baru">New Lease</option>
          </select>
        </div>
        <div>
          <Label>Applicant *</Label>
          <input
            className={inputClass}
            value={form.pemohon}
            onChange={(e) => ubahTeks('pemohon', e.target.value)}
            placeholder="Applicant name"
          />
        </div>
        <div>
          <Label>Received date *</Label>
          <input
            className={inputClass}
            type="date"
            value={form.tanggalMasuk}
            onChange={(e) => ubahTeks('tanggalMasuk', e.target.value)}
          />
        </div>
        <div>
          <Label>Person in charge *</Label>
          <input
            className={inputClass}
            value={form.penanggungJawab}
            onChange={(e) => ubahTeks('penanggungJawab', e.target.value)}
            placeholder="Name of the person in charge"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Requirement *</Label>
          <textarea
            className={`${inputClass} min-h-20`}
            value={form.kebutuhan}
            onChange={(e) => ubahTeks('kebutuhan', e.target.value)}
            placeholder="Description of the submission requirement"
          />
        </div>
        <div>
          <Label>Estimated value (Rp, optional)</Label>
          <input
            className={inputClass}
            type="number"
            min="0"
            value={nilaiPerkiraanTeks}
            onChange={(e) => setNilaiPerkiraanTeks(e.target.value)}
            placeholder="Leave empty if there is no estimate yet"
          />
        </div>
      </div>

      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Save Submission</TombolUtama>
        <TombolSekunder onClick={onBatal}>Cancel</TombolSekunder>
      </div>
    </Kartu>
  );
}

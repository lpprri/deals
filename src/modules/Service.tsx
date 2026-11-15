// Modul Service (PRD v2.0 Final Bab 7.8; Q-12 terjawab 15/11/2026).
// Tiga tab: Help-Desk (tiket konsultasi ke Direktorat Layanan &
// Pengembangan Usaha), Feedback Survey (survei kepuasan klien per kontrak),
// Knowledge Base (Regulasi & SOP nasional).
// Palet HANYA 3 warna RRI: Biru #2573E2, Navy #0D2569, Putih #FFFFFF.
// Knowledge Base mulai KOSONG — tidak ada nomor regulasi karangan; Operator
// menambahkan entri lewat form. Model 1 role: Operator punya akses penuh
// (tidak ada kunci izin baru di permissions.ts tahap ini).

import { useState } from 'react';
import type { StatusTiket, Tiket } from '../lib/types';
import type { ArtikelKBInput, ModulProps, TiketInput, UmpanBalikInput } from '../lib/store';
import {
  MASTER_KATEGORI_TIKET,
  MASTER_PERTANYAAN_SURVEI,
  MASTER_STATUS_TIKET,
  TUJUAN_TIKET,
} from '../lib/master';
import { formatTanggal, hariIniIso } from '../lib/format';
import { labelKategoriTiket, labelStatusTiket } from '../lib/labels';

/**
 * Tampilan Inggris untuk pertanyaan survei (nilai master di master.ts
 * TIDAK diubah — dilaporkan ke koordinator untuk konsolidasi).
 */
const PERTANYAAN_SURVEI_EN: Record<string, string> = {
  'Kemudahan proses kerja sama': 'Ease of the partnership process',
  'Kualitas layanan yang diterima': 'Quality of the service received',
  'Kecepatan penagihan & administrasi': 'Speed of billing & administration',
  'Kepuasan keseluruhan': 'Overall satisfaction',
};
import {
  Baris,
  ItemDaftar,
  JudulBagian,
  Kartu,
  Label,
  Peringatan,
  PesanKosong,
  StatCard,
  StatusBadge,
  TabBar,
  Tabel,
  Td,
  Th,
  TombolSekunder,
  TombolUtama,
  inputClass,
} from '../components/ui';

export default function Service(props: ModulProps) {
  const { data, user, actions, cari } = props;
  const [tab, setTab] = useState('helpdesk');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <JudulBagian>Service</JudulBagian>
      </div>
      <TabBar
        tabs={[
          { id: 'helpdesk', label: 'Help-Desk' },
          { id: 'feedback', label: 'Feedback Survey' },
          { id: 'kb', label: 'Knowledge Base' },
        ]}
        aktif={tab}
        onPilih={setTab}
      />
      {tab === 'helpdesk' ? (
        <HelpDesk data={data} user={user} actions={actions} cari={cari} />
      ) : tab === 'feedback' ? (
        <Feedback data={data} user={user} actions={actions} cari={cari} />
      ) : (
        <KnowledgeBase data={data} user={user} actions={actions} cari={cari} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Help-Desk — tiket konsultasi (Q-12).
// Status: Terbuka -> Dijawab -> Ditutup; Ditutup bisa dibuka kembali.
// Balasan pertama mengubah status Terbuka menjadi Dijawab otomatis.

function statusBerikutnya(status: StatusTiket): StatusTiket[] {
  switch (status) {
    case 'Terbuka':
      return ['Dijawab', 'Ditutup'];
    case 'Dijawab':
      return ['Terbuka', 'Ditutup'];
    case 'Ditutup':
      return ['Terbuka'];
    default:
      return [];
  }
}

function HelpDesk({
  data,
  user,
  actions,
  cari,
}: {
  data: ModulProps['data'];
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  cari: string;
}) {
  const [filterKategori, setFilterKategori] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [tampilForm, setTampilForm] = useState(false);
  const [tiketTerpilihId, setTiketTerpilihId] = useState<string | null>(null);
  const [pesan, setPesan] = useState('');

  const kataKunci = cari.trim().toLowerCase();
  const tiket = data.tiket.filter(
    (t) =>
      (filterKategori === 'Semua' || t.kategori === filterKategori) &&
      (filterStatus === 'Semua' || t.status === filterStatus) &&
      (kataKunci === '' ||
        `${t.id} ${t.judul} ${t.isi} ${t.kategori} ${t.dibuatOleh}`
          .toLowerCase()
          .includes(kataKunci)),
  );
  const tiketTerpilih = data.tiket.find((t) => t.id === tiketTerpilihId) ?? null;
  const jumlahStatus = (s: StatusTiket) => data.tiket.filter((t) => t.status === s).length;

  return (
    <div className="space-y-4">
      <Peringatan
        teks={`Direct consultation via the app to ${TUJUAN_TIKET}. The PIC varies depending on the type of consultation — the PIC name per category has not been determined yet, so tickets are recorded per category and answered as saved follow-ups.`}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total tickets" nilai={String(data.tiket.length)} keterangan="All consultation tickets for this work unit" />
        <StatCard label="Open" nilai={String(jumlahStatus('Terbuka'))} keterangan="Awaiting a reply from head office" />
        <StatCard label="Answered" nilai={String(jumlahStatus('Dijawab'))} keterangan="Already answered / followed up" />
        <StatCard label="Closed" nilai={String(jumlahStatus('Ditutup'))} keterangan="Consultation completed" />
      </div>

      {tiketTerpilih ? (
        <DetailTiket
          tiket={tiketTerpilih}
          user={user}
          actions={actions}
          onKembali={() => setTiketTerpilihId(null)}
          onPesan={setPesan}
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-4">
            <div>
              <Label>Filter by category</Label>
              <select
                className={`${inputClass} max-w-xs`}
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
              >
                <option value="Semua">All</option>
                {MASTER_KATEGORI_TIKET.map((k) => (
                  <option key={k} value={k}>
                    {labelKategoriTiket(k)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Filter by status</Label>
              <select
                className={`${inputClass} max-w-xs`}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="Semua">All</option>
                {MASTER_STATUS_TIKET.map((s) => (
                  <option key={s} value={s}>
                    {labelStatusTiket(s)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <TombolUtama onClick={() => setTampilForm(true)}>
              + Create Consultation Ticket
            </TombolUtama>
          </div>

          {tampilForm && (
            <FormTiket
              user={user}
              actions={actions}
              onBatal={() => setTampilForm(false)}
              onSukses={() => {
                setTampilForm(false);
                setPesan('Consultation ticket created.');
              }}
            />
          )}

          {tiket.length === 0 ? (
            <PesanKosong teks="No matching consultation tickets yet." />
          ) : (
            <Kartu>
              <Tabel>
                <thead>
                  <tr>
                    <Th>ID</Th>
                    <Th>Title</Th>
                    <Th>Category</Th>
                    <Th>Date</Th>
                    <Th>Created By</Th>
                    <Th>Status</Th>
                    <Th>Replies</Th>
                  </tr>
                </thead>
                <tbody>
                  {tiket.map((t) => (
                    <Baris key={t.id} onClick={() => setTiketTerpilihId(t.id)}>
                      <Td tebal>{t.id}</Td>
                      <Td>{t.judul}</Td>
                      <Td>{labelKategoriTiket(t.kategori)}</Td>
                      <Td>{formatTanggal(t.tanggal)}</Td>
                      <Td>{t.dibuatOleh}</Td>
                      <Td>
                        <StatusBadge status={labelStatusTiket(t.status)} />
                      </Td>
                      <Td>{t.balasan.length}</Td>
                    </Baris>
                  ))}
                </tbody>
              </Tabel>
            </Kartu>
          )}
        </>
      )}

      {pesan !== '' && (
        <p className="rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {pesan}
        </p>
      )}
    </div>
  );
}

function FormTiket({
  user,
  actions,
  onBatal,
  onSukses,
}: {
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  onBatal: () => void;
  onSukses: () => void;
}) {
  const [form, setForm] = useState<TiketInput>({
    kategori: MASTER_KATEGORI_TIKET[0],
    judul: '',
    isi: '',
  });
  const [error, setError] = useState('');

  const simpan = () => {
    const hasil = actions.tambahTiket({
      kategori: form.kategori,
      judul: form.judul.trim(),
      isi: form.isi.trim(),
    });
    if (hasil !== null) {
      setError(hasil);
      return;
    }
    onSukses();
  };

  return (
    <Kartu>
      <JudulBagian>Create Consultation Ticket</JudulBagian>
      <p className="mt-1 text-sm text-[#0d2569]/70">
        Addressed to: {TUJUAN_TIKET} · Created by: {user.nama} · Date:{' '}
        {formatTanggal(hariIniIso())}
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Category / consultation type *</Label>
          <select
            className={inputClass}
            value={form.kategori}
            onChange={(e) => setForm((f) => ({ ...f, kategori: e.target.value }))}
          >
            {MASTER_KATEGORI_TIKET.map((k) => (
              <option key={k} value={k}>
                {labelKategoriTiket(k)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Title *</Label>
          <input
            className={inputClass}
            value={form.judul}
            onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
            placeholder="Short consultation title"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Consultation content *</Label>
          <textarea
            className={`${inputClass} min-h-24`}
            value={form.isi}
            onChange={(e) => setForm((f) => ({ ...f, isi: e.target.value }))}
            placeholder="Describe the matter being consulted in as much detail as possible"
          />
        </div>
      </div>

      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Send Ticket</TombolUtama>
        <TombolSekunder onClick={onBatal}>Cancel</TombolSekunder>
      </div>
    </Kartu>
  );
}

function DetailTiket({
  tiket,
  user,
  actions,
  onKembali,
  onPesan,
}: {
  tiket: Tiket;
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  onKembali: () => void;
  onPesan: (pesan: string) => void;
}) {
  const [isiBalasan, setIsiBalasan] = useState('');
  const [error, setError] = useState('');

  const kirimBalasan = () => {
    const hasil = actions.tambahBalasanTiket(tiket, isiBalasan);
    if (hasil !== null) {
      setError(hasil);
      return;
    }
    setIsiBalasan('');
    setError('');
    onPesan(`Reply added to ticket ${tiket.id}.`);
  };

  const ubahStatus = (status: StatusTiket) => {
    actions.ubahStatusTiket(tiket, status);
    onPesan(`Ticket ${tiket.id} status changed to ${labelStatusTiket(status)}.`);
  };

  return (
    <div className="space-y-4">
      <div>
        <TombolSekunder onClick={onKembali}>← Back to ticket list</TombolSekunder>
      </div>

      <Kartu>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-[#0d2569]">
              {tiket.id} — {tiket.judul}
            </p>
            <p className="mt-1 text-sm text-[#0d2569]/70">
              Category: {labelKategoriTiket(tiket.kategori)} · Date: {formatTanggal(tiket.tanggal)} ·
              Created by: {tiket.dibuatOleh}
            </p>
            <p className="mt-1 text-sm text-[#0d2569]/70">Destination: {tiket.tujuan}</p>
          </div>
          <StatusBadge status={labelStatusTiket(tiket.status)} />
        </div>
        <p className="mt-3 text-sm text-[#0d2569]">
          <span className="font-semibold">Consultation content: </span>
          {tiket.isi}
        </p>

        <div className="mt-4">
          <p className="text-xs font-semibold text-[#0d2569]/70">
            Reply &amp; follow-up history ({tiket.balasan.length})
          </p>
          {tiket.balasan.length === 0 ? (
            <p className="mt-2 text-sm text-[#0d2569]/70">
              No replies yet — the ticket is still awaiting a response from head office.
            </p>
          ) : (
            <ul className="mt-2 space-y-3">
              {tiket.balasan.map((b) => (
                <ItemDaftar key={b.id}>
                  <p className="text-sm font-semibold text-[#0d2569]">
                    {b.oleh} · {formatTanggal(b.tanggal)}
                  </p>
                  <p className="mt-1 text-sm text-[#0d2569]">{b.isi}</p>
                </ItemDaftar>
              ))}
            </ul>
          )}
        </div>

        {tiket.status !== 'Ditutup' && (
          <div className="mt-4">
            <Label>Add a reply / follow-up (as {user.nama})</Label>
            <textarea
              className={`${inputClass} min-h-20`}
              value={isiBalasan}
              onChange={(e) => setIsiBalasan(e.target.value)}
              placeholder="Write a reply or follow-up from head office"
            />
            {error !== '' && (
              <p className="mt-2 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
                {error}
              </p>
            )}
            <div className="mt-2">
              <TombolUtama onClick={kirimBalasan}>Save Reply</TombolUtama>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {statusBerikutnya(tiket.status).map((s) => (
            <TombolSekunder key={s} onClick={() => ubahStatus(s)}>
              Change to {labelStatusTiket(s)}
            </TombolSekunder>
          ))}
        </div>
      </Kartu>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feedback Survey — survei kepuasan klien per kontrak, skala 1–5.
// Ringkasan dihitung dari data yang ada saja; tidak ada data hasil survei
// karangan — sebelum ada survei, ringkasan menampilkan "Belum ada survei".

function rataRata(angka: number[]): number | null {
  if (angka.length === 0) return null;
  return angka.reduce((s, n) => s + n, 0) / angka.length;
}

function Feedback({
  data,
  user,
  actions,
  cari,
}: {
  data: ModulProps['data'];
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  cari: string;
}) {
  const [tampilForm, setTampilForm] = useState(false);
  const [pesan, setPesan] = useState('');

  const kataKunci = cari.trim().toLowerCase();
  const hasil = data.umpanBalik.filter(
    (u) =>
      kataKunci === '' ||
      `${u.id} ${u.kontrakId} ${u.komentar ?? ''}`
        .toLowerCase()
        .includes(kataKunci),
  );
  const semuaSkor = hasil.flatMap((u) => u.jawaban.map((j) => j.skor));
  const rataKeseluruhan = rataRata(semuaSkor);
  const rataPerPertanyaan = MASTER_PERTANYAAN_SURVEI.map((p) => ({
    pertanyaan: p,
    rata: rataRata(
      hasil.flatMap((u) =>
        u.jawaban.filter((j) => j.pertanyaan === p).map((j) => j.skor),
      ),
    ),
  }));
  const namaKlien = (kontrakId: string) => {
    const kontrak = data.kontrak.find((k) => k.id === kontrakId);
    if (!kontrak) return '-';
    return data.klien.find((k) => k.id === kontrak.klienId)?.nama ?? '-';
  };

  return (
    <div className="space-y-4">
      <Peringatan teks="The client satisfaction survey is filled in per contract (one survey per contract). The summary below is calculated from saved surveys — there are no sample survey results." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Saved surveys"
          nilai={String(data.umpanBalik.length)}
          keterangan="Number of contracts already surveyed"
        />
        <StatCard
          label="Overall average"
          nilai={rataKeseluruhan === null ? '-' : `${rataKeseluruhan.toFixed(1)} / 5`}
          keterangan={
            rataKeseluruhan === null
              ? 'No surveys yet'
              : `From ${data.umpanBalik.length} surveys`
          }
        />
        <StatCard
          label="Contracts not yet surveyed"
          nilai={String(
            data.kontrak.filter(
              (k) => !data.umpanBalik.some((u) => u.kontrakId === k.id),
            ).length,
          )}
          keterangan="Contracts without a satisfaction survey"
        />
      </div>

      {rataPerPertanyaan.some((r) => r.rata !== null) && (
        <Kartu>
          <JudulBagian>Average per question</JudulBagian>
          <Tabel>
            <thead>
              <tr>
                <Th>Question</Th>
                <Th kanan>Average (scale 1–5)</Th>
              </tr>
            </thead>
            <tbody>
              {rataPerPertanyaan.map((r) => (
                <Baris key={r.pertanyaan}>
                  <Td>{PERTANYAAN_SURVEI_EN[r.pertanyaan] ?? r.pertanyaan}</Td>
                  <Td kanan tebal>
                    {r.rata === null ? '-' : r.rata.toFixed(1)}
                  </Td>
                </Baris>
              ))}
            </tbody>
          </Tabel>
        </Kartu>
      )}

      <div>
        <TombolUtama onClick={() => setTampilForm(true)}>
          + Fill in Satisfaction Survey
        </TombolUtama>
      </div>

      {tampilForm && (
        <FormSurvei
          data={data}
          user={user}
          actions={actions}
          onBatal={() => setTampilForm(false)}
          onSukses={() => {
            setTampilForm(false);
            setPesan('Satisfaction survey saved.');
          }}
        />
      )}

      {hasil.length === 0 ? (
        <PesanKosong teks="No satisfaction surveys saved yet." />
      ) : (
        <Kartu>
          <Tabel>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Contract</Th>
                <Th>Client</Th>
                <Th>Date</Th>
                <Th kanan>Average</Th>
                <Th>Comment</Th>
              </tr>
            </thead>
            <tbody>
              {hasil.map((u) => {
                const rata = rataRata(u.jawaban.map((j) => j.skor));
                const kontrak = data.kontrak.find((k) => k.id === u.kontrakId);
                return (
                  <Baris key={u.id}>
                    <Td tebal>{u.id}</Td>
                    <Td>{kontrak?.nomorPks ?? u.kontrakId}</Td>
                    <Td>{namaKlien(u.kontrakId)}</Td>
                    <Td>{formatTanggal(u.tanggal)}</Td>
                    <Td kanan tebal>
                      {rata === null ? '-' : `${rata.toFixed(1)} / 5`}
                    </Td>
                    <Td>{u.komentar ?? '-'}</Td>
                  </Baris>
                );
              })}
            </tbody>
          </Tabel>
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

function FormSurvei({
  data,
  user,
  actions,
  onBatal,
  onSukses,
}: {
  data: ModulProps['data'];
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  onBatal: () => void;
  onSukses: () => void;
}) {
  const kontrakBelumDisurvei = data.kontrak.filter(
    (k) => !data.umpanBalik.some((u) => u.kontrakId === k.id),
  );
  const [form, setForm] = useState<UmpanBalikInput>({
    kontrakId: kontrakBelumDisurvei[0]?.id ?? '',
    jawaban: [],
    komentar: '',
  });
  const [error, setError] = useState('');

  const skorUntuk = (pertanyaan: string) =>
    form.jawaban.find((j) => j.pertanyaan === pertanyaan)?.skor ?? 0;

  const aturSkor = (pertanyaan: string, skor: number) => {
    setForm((f) => ({
      ...f,
      jawaban: [
        ...f.jawaban.filter((j) => j.pertanyaan !== pertanyaan),
        { pertanyaan, skor },
      ],
    }));
  };

  const simpan = () => {
    const hasil = actions.tambahUmpanBalik({
      kontrakId: form.kontrakId,
      jawaban: form.jawaban,
      komentar: form.komentar?.trim() === '' ? undefined : form.komentar?.trim(),
    });
    if (hasil !== null) {
      setError(hasil);
      return;
    }
    onSukses();
  };

  if (kontrakBelumDisurvei.length === 0) {
    return (
      <Kartu>
        <JudulBagian>Fill in Satisfaction Survey</JudulBagian>
        <p className="mt-2 text-sm text-[#0d2569]/70">
          All contracts already have a satisfaction survey.
        </p>
        <div className="mt-4">
          <TombolSekunder onClick={onBatal}>Close</TombolSekunder>
        </div>
      </Kartu>
    );
  }

  return (
    <Kartu>
      <JudulBagian>Fill in Satisfaction Survey</JudulBagian>
      <p className="mt-1 text-sm text-[#0d2569]/70">
        Recorded by: {user.nama} · Date: {formatTanggal(hariIniIso())} ·
        Scale: 1 (very dissatisfied) – 5 (very satisfied)
      </p>
      <div className="mt-4 space-y-4">
        <div>
          <Label>Related contract *</Label>
          <select
            className={inputClass}
            value={form.kontrakId}
            onChange={(e) => setForm((f) => ({ ...f, kontrakId: e.target.value }))}
          >
            {kontrakBelumDisurvei.map((k) => {
              const klien = data.klien.find((x) => x.id === k.klienId);
              return (
                <option key={k.id} value={k.id}>
                  {k.nomorPks} — {klien?.nama ?? '-'}
                </option>
              );
            })}
          </select>
        </div>

        {MASTER_PERTANYAAN_SURVEI.map((p) => (
          <div key={p}>
            <Label>{PERTANYAAN_SURVEI_EN[p] ?? p} *</Label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => aturSkor(p, n)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${
                    skorUntuk(p) === n
                      ? 'border-[#2573e2] bg-[#2573e2] text-white'
                      : 'border-[#2573e2] bg-white text-[#0d2569]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div>
          <Label>Comment (optional)</Label>
          <textarea
            className={`${inputClass} min-h-20`}
            value={form.komentar ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, komentar: e.target.value }))}
            placeholder="Client comments or feedback"
          />
        </div>
      </div>

      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Save Survey</TombolUtama>
        <TombolSekunder onClick={onBatal}>Cancel</TombolSekunder>
      </div>
    </Kartu>
  );
}

// ---------------------------------------------------------------------------
// Knowledge Base — Regulasi & SOP (nasional, tanpa satker).
// Isi awal KOSONG dengan pesan jujur "Belum ada dokumen" + form tambah —
// tidak ada nomor regulasi karangan di aplikasi.

function KnowledgeBase({
  data,
  user,
  actions,
  cari,
}: {
  data: ModulProps['data'];
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  cari: string;
}) {
  const [tampilForm, setTampilForm] = useState(false);
  const [pencarian, setPencarian] = useState('');
  const [artikelTerpilihId, setArtikelTerpilihId] = useState<string | null>(null);
  const [pesan, setPesan] = useState('');

  const kataKunci = `${cari} ${pencarian}`.trim().toLowerCase();
  const artikel = data.artikelKB.filter(
    (a) =>
      kataKunci === '' ||
      `${a.id} ${a.judul} ${a.nomor ?? ''} ${a.ringkasan} ${a.isi ?? ''}`
        .toLowerCase()
        .includes(kataKunci),
  );
  const artikelTerpilih =
    data.artikelKB.find((a) => a.id === artikelTerpilihId) ?? null;

  return (
    <div className="space-y-4">
      <Peringatan teks="The Regulations & SOP list is national — read by all work units. Only add documents whose number and content have been verified; do not write regulation numbers from memory." />

      <div className="max-w-md">
        <Label>Search documents</Label>
        <input
          className={inputClass}
          value={pencarian}
          onChange={(e) => setPencarian(e.target.value)}
          placeholder="Search by title, number, or document content"
        />
      </div>

      <div>
        <TombolUtama onClick={() => setTampilForm(true)}>
          + Add Document
        </TombolUtama>
      </div>

      {tampilForm && (
        <FormArtikelKB
          user={user}
          actions={actions}
          onBatal={() => setTampilForm(false)}
          onSukses={() => {
            setTampilForm(false);
            setPesan('Document added to the Knowledge Base.');
          }}
        />
      )}

      {artikelTerpilih && (
        <Kartu>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-[#0d2569]">{artikelTerpilih.judul}</p>
              <p className="mt-1 text-sm text-[#0d2569]/70">
                {artikelTerpilih.nomor ? `Number: ${artikelTerpilih.nomor} · ` : ''}
                {artikelTerpilih.tanggalBerlaku
                  ? `Effective since: ${formatTanggal(artikelTerpilih.tanggalBerlaku)} · `
                  : ''}
                Added by {artikelTerpilih.dibuatOleh} on{' '}
                {formatTanggal(artikelTerpilih.dibuatPada)}
              </p>
            </div>
            <TombolSekunder onClick={() => setArtikelTerpilihId(null)}>
              Close
            </TombolSekunder>
          </div>
          <p className="mt-3 text-sm text-[#0d2569]">{artikelTerpilih.ringkasan}</p>
          {artikelTerpilih.isi && (
            <p className="mt-2 whitespace-pre-line text-sm text-[#0d2569]">
              {artikelTerpilih.isi}
            </p>
          )}
          {artikelTerpilih.tautan && (
            <p className="mt-3 text-sm">
              <a
                href={artikelTerpilih.tautan}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#2573e2] underline"
              >
                Open document
              </a>
            </p>
          )}
        </Kartu>
      )}

      {artikel.length === 0 ? (
        <PesanKosong teks="No regulation/SOP documents yet. Add verified documents using the button above." />
      ) : (
        <Kartu>
          <Tabel>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Title</Th>
                <Th>Number</Th>
                <Th>Effective Since</Th>
                <Th>Summary</Th>
              </tr>
            </thead>
            <tbody>
              {artikel.map((a) => (
                <Baris key={a.id} onClick={() => setArtikelTerpilihId(a.id)}>
                  <Td tebal>{a.id}</Td>
                  <Td>{a.judul}</Td>
                  <Td>{a.nomor ?? '-'}</Td>
                  <Td>{formatTanggal(a.tanggalBerlaku)}</Td>
                  <Td>{a.ringkasan}</Td>
                </Baris>
              ))}
            </tbody>
          </Tabel>
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

function FormArtikelKB({
  user,
  actions,
  onBatal,
  onSukses,
}: {
  user: ModulProps['user'];
  actions: ModulProps['actions'];
  onBatal: () => void;
  onSukses: () => void;
}) {
  const [form, setForm] = useState<ArtikelKBInput>({
    judul: '',
    nomor: '',
    tanggalBerlaku: '',
    ringkasan: '',
    isi: '',
    tautan: '',
  });
  const [error, setError] = useState('');

  const simpan = () => {
    const hasil = actions.tambahArtikelKB({
      judul: form.judul.trim(),
      nomor: form.nomor?.trim() === '' ? undefined : form.nomor?.trim(),
      tanggalBerlaku:
        form.tanggalBerlaku === '' ? undefined : form.tanggalBerlaku,
      ringkasan: form.ringkasan.trim(),
      isi: form.isi?.trim() === '' ? undefined : form.isi?.trim(),
      tautan: form.tautan?.trim() === '' ? undefined : form.tautan?.trim(),
    });
    if (hasil !== null) {
      setError(hasil);
      return;
    }
    onSukses();
  };

  return (
    <Kartu>
      <JudulBagian>Add Regulation / SOP Document</JudulBagian>
      <p className="mt-1 text-sm text-[#0d2569]/70">
        Added by: {user.nama} · Applies to all work units (national).
        Fill in the document number only if it has been verified.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>Document title *</Label>
          <input
            className={inputClass}
            value={form.judul}
            onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
            placeholder="Example: LPP RRI Partnership Guidelines"
          />
        </div>
        <div>
          <Label>Document number (optional)</Label>
          <input
            className={inputClass}
            value={form.nomor ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, nomor: e.target.value }))}
            placeholder="Fill in only if verified"
          />
        </div>
        <div>
          <Label>Effective date (optional)</Label>
          <input
            className={inputClass}
            type="date"
            value={form.tanggalBerlaku ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, tanggalBerlaku: e.target.value }))
            }
          />
        </div>
        <div className="md:col-span-2">
          <Label>Summary *</Label>
          <textarea
            className={`${inputClass} min-h-20`}
            value={form.ringkasan}
            onChange={(e) => setForm((f) => ({ ...f, ringkasan: e.target.value }))}
            placeholder="Summary of the document content"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Content / key points (optional)</Label>
          <textarea
            className={`${inputClass} min-h-24`}
            value={form.isi ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, isi: e.target.value }))}
            placeholder="Key points from the document"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Document link (optional)</Label>
          <input
            className={inputClass}
            value={form.tautan ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, tautan: e.target.value }))}
            placeholder="https://..."
          />
        </div>
      </div>

      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Save Document</TombolUtama>
        <TombolSekunder onClick={onBatal}>Cancel</TombolSekunder>
      </div>
    </Kartu>
  );
}

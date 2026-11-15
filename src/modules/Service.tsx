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
        teks={`Konsultasi langsung via aplikasi ke ${TUJUAN_TIKET}. PIC beragam tergantung jenis konsultasi — nama PIC per kategori belum ditentukan, jadi tiket dicatat per kategori dan dijawab sebagai tindak lanjut tersimpan.`}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total tiket" nilai={String(data.tiket.length)} keterangan="Semua tiket konsultasi satker ini" />
        <StatCard label="Terbuka" nilai={String(jumlahStatus('Terbuka'))} keterangan="Menunggu jawaban dari kantor pusat" />
        <StatCard label="Dijawab" nilai={String(jumlahStatus('Dijawab'))} keterangan="Sudah ada jawaban / tindak lanjut" />
        <StatCard label="Ditutup" nilai={String(jumlahStatus('Ditutup'))} keterangan="Konsultasi selesai" />
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
              <Label>Filter kategori</Label>
              <select
                className={`${inputClass} max-w-xs`}
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
              >
                <option value="Semua">Semua</option>
                {MASTER_KATEGORI_TIKET.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Filter status</Label>
              <select
                className={`${inputClass} max-w-xs`}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="Semua">Semua</option>
                {MASTER_STATUS_TIKET.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <TombolUtama onClick={() => setTampilForm(true)}>
              + Buat Tiket Konsultasi
            </TombolUtama>
          </div>

          {tampilForm && (
            <FormTiket
              user={user}
              actions={actions}
              onBatal={() => setTampilForm(false)}
              onSukses={() => {
                setTampilForm(false);
                setPesan('Tiket konsultasi dibuat.');
              }}
            />
          )}

          {tiket.length === 0 ? (
            <PesanKosong teks="Belum ada tiket konsultasi yang cocok." />
          ) : (
            <Kartu>
              <Tabel>
                <thead>
                  <tr>
                    <Th>ID</Th>
                    <Th>Judul</Th>
                    <Th>Kategori</Th>
                    <Th>Tanggal</Th>
                    <Th>Dibuat Oleh</Th>
                    <Th>Status</Th>
                    <Th>Balasan</Th>
                  </tr>
                </thead>
                <tbody>
                  {tiket.map((t) => (
                    <Baris key={t.id} onClick={() => setTiketTerpilihId(t.id)}>
                      <Td tebal>{t.id}</Td>
                      <Td>{t.judul}</Td>
                      <Td>{t.kategori}</Td>
                      <Td>{formatTanggal(t.tanggal)}</Td>
                      <Td>{t.dibuatOleh}</Td>
                      <Td>
                        <StatusBadge status={t.status} />
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
      <JudulBagian>Buat Tiket Konsultasi</JudulBagian>
      <p className="mt-1 text-sm text-[#0d2569]/70">
        Ditujukan ke: {TUJUAN_TIKET} · Dibuat oleh: {user.nama} · Tanggal:{' '}
        {formatTanggal(hariIniIso())}
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Kategori / jenis konsultasi *</Label>
          <select
            className={inputClass}
            value={form.kategori}
            onChange={(e) => setForm((f) => ({ ...f, kategori: e.target.value }))}
          >
            {MASTER_KATEGORI_TIKET.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Judul *</Label>
          <input
            className={inputClass}
            value={form.judul}
            onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
            placeholder="Judul singkat konsultasi"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Isi konsultasi *</Label>
          <textarea
            className={`${inputClass} min-h-24`}
            value={form.isi}
            onChange={(e) => setForm((f) => ({ ...f, isi: e.target.value }))}
            placeholder="Jelaskan hal yang dikonsultasikan selengkap mungkin"
          />
        </div>
      </div>

      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Kirim Tiket</TombolUtama>
        <TombolSekunder onClick={onBatal}>Batal</TombolSekunder>
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
    onPesan(`Balasan ditambahkan ke tiket ${tiket.id}.`);
  };

  const ubahStatus = (status: StatusTiket) => {
    actions.ubahStatusTiket(tiket, status);
    onPesan(`Status tiket ${tiket.id} diubah menjadi ${status}.`);
  };

  return (
    <div className="space-y-4">
      <div>
        <TombolSekunder onClick={onKembali}>← Kembali ke daftar tiket</TombolSekunder>
      </div>

      <Kartu>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-[#0d2569]">
              {tiket.id} — {tiket.judul}
            </p>
            <p className="mt-1 text-sm text-[#0d2569]/70">
              Kategori: {tiket.kategori} · Tanggal: {formatTanggal(tiket.tanggal)} ·
              Dibuat oleh: {tiket.dibuatOleh}
            </p>
            <p className="mt-1 text-sm text-[#0d2569]/70">Tujuan: {tiket.tujuan}</p>
          </div>
          <StatusBadge status={tiket.status} />
        </div>
        <p className="mt-3 text-sm text-[#0d2569]">
          <span className="font-semibold">Isi konsultasi: </span>
          {tiket.isi}
        </p>

        <div className="mt-4">
          <p className="text-xs font-semibold text-[#0d2569]/70">
            Riwayat jawaban &amp; tindak lanjut ({tiket.balasan.length})
          </p>
          {tiket.balasan.length === 0 ? (
            <p className="mt-2 text-sm text-[#0d2569]/70">
              Belum ada jawaban — tiket masih menunggu respons dari kantor pusat.
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
            <Label>Tambah jawaban / tindak lanjut (sebagai {user.nama})</Label>
            <textarea
              className={`${inputClass} min-h-20`}
              value={isiBalasan}
              onChange={(e) => setIsiBalasan(e.target.value)}
              placeholder="Tulis jawaban atau tindak lanjut dari kantor pusat"
            />
            {error !== '' && (
              <p className="mt-2 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
                {error}
              </p>
            )}
            <div className="mt-2">
              <TombolUtama onClick={kirimBalasan}>Simpan Balasan</TombolUtama>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {statusBerikutnya(tiket.status).map((s) => (
            <TombolSekunder key={s} onClick={() => ubahStatus(s)}>
              Ubah ke {s}
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
      <Peringatan teks="Survei kepuasan klien diisi per kontrak (satu survei per kontrak). Ringkasan di bawah dihitung dari survei yang sudah tersimpan — tidak ada hasil survei contoh." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Survei tersimpan"
          nilai={String(data.umpanBalik.length)}
          keterangan="Jumlah kontrak yang sudah disurvei"
        />
        <StatCard
          label="Rata-rata keseluruhan"
          nilai={rataKeseluruhan === null ? '-' : `${rataKeseluruhan.toFixed(1)} / 5`}
          keterangan={
            rataKeseluruhan === null
              ? 'Belum ada survei'
              : `Dari ${data.umpanBalik.length} survei`
          }
        />
        <StatCard
          label="Kontrak belum disurvei"
          nilai={String(
            data.kontrak.filter(
              (k) => !data.umpanBalik.some((u) => u.kontrakId === k.id),
            ).length,
          )}
          keterangan="Kontrak tanpa survei kepuasan"
        />
      </div>

      {rataPerPertanyaan.some((r) => r.rata !== null) && (
        <Kartu>
          <JudulBagian>Rata-rata per pertanyaan</JudulBagian>
          <Tabel>
            <thead>
              <tr>
                <Th>Pertanyaan</Th>
                <Th kanan>Rata-rata (skala 1–5)</Th>
              </tr>
            </thead>
            <tbody>
              {rataPerPertanyaan.map((r) => (
                <Baris key={r.pertanyaan}>
                  <Td>{r.pertanyaan}</Td>
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
          + Isi Survei Kepuasan
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
            setPesan('Survei kepuasan disimpan.');
          }}
        />
      )}

      {hasil.length === 0 ? (
        <PesanKosong teks="Belum ada survei kepuasan yang tersimpan." />
      ) : (
        <Kartu>
          <Tabel>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Kontrak</Th>
                <Th>Klien</Th>
                <Th>Tanggal</Th>
                <Th kanan>Rata-rata</Th>
                <Th>Komentar</Th>
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
        <JudulBagian>Isi Survei Kepuasan</JudulBagian>
        <p className="mt-2 text-sm text-[#0d2569]/70">
          Semua kontrak sudah memiliki survei kepuasan.
        </p>
        <div className="mt-4">
          <TombolSekunder onClick={onBatal}>Tutup</TombolSekunder>
        </div>
      </Kartu>
    );
  }

  return (
    <Kartu>
      <JudulBagian>Isi Survei Kepuasan</JudulBagian>
      <p className="mt-1 text-sm text-[#0d2569]/70">
        Dicatat oleh: {user.nama} · Tanggal: {formatTanggal(hariIniIso())} ·
        Skala: 1 (sangat tidak puas) – 5 (sangat puas)
      </p>
      <div className="mt-4 space-y-4">
        <div>
          <Label>Kontrak terkait *</Label>
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
            <Label>{p} *</Label>
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
          <Label>Komentar (opsional)</Label>
          <textarea
            className={`${inputClass} min-h-20`}
            value={form.komentar ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, komentar: e.target.value }))}
            placeholder="Komentar atau masukan klien"
          />
        </div>
      </div>

      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <TombolUtama onClick={simpan}>Simpan Survei</TombolUtama>
        <TombolSekunder onClick={onBatal}>Batal</TombolSekunder>
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
      <Peringatan teks="Daftar Regulasi & SOP bersifat nasional — dibaca semua satker. Tambahkan hanya dokumen yang nomor dan isinya sudah terverifikasi; jangan menulis nomor regulasi dari ingatan." />

      <div className="max-w-md">
        <Label>Cari dokumen</Label>
        <input
          className={inputClass}
          value={pencarian}
          onChange={(e) => setPencarian(e.target.value)}
          placeholder="Cari judul, nomor, atau isi dokumen"
        />
      </div>

      <div>
        <TombolUtama onClick={() => setTampilForm(true)}>
          + Tambah Dokumen
        </TombolUtama>
      </div>

      {tampilForm && (
        <FormArtikelKB
          user={user}
          actions={actions}
          onBatal={() => setTampilForm(false)}
          onSukses={() => {
            setTampilForm(false);
            setPesan('Dokumen ditambahkan ke Knowledge Base.');
          }}
        />
      )}

      {artikelTerpilih && (
        <Kartu>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-[#0d2569]">{artikelTerpilih.judul}</p>
              <p className="mt-1 text-sm text-[#0d2569]/70">
                {artikelTerpilih.nomor ? `Nomor: ${artikelTerpilih.nomor} · ` : ''}
                {artikelTerpilih.tanggalBerlaku
                  ? `Berlaku sejak: ${formatTanggal(artikelTerpilih.tanggalBerlaku)} · `
                  : ''}
                Ditambahkan oleh {artikelTerpilih.dibuatOleh} pada{' '}
                {formatTanggal(artikelTerpilih.dibuatPada)}
              </p>
            </div>
            <TombolSekunder onClick={() => setArtikelTerpilihId(null)}>
              Tutup
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
                Buka dokumen
              </a>
            </p>
          )}
        </Kartu>
      )}

      {artikel.length === 0 ? (
        <PesanKosong teks="Belum ada dokumen regulasi/SOP. Tambahkan dokumen yang sudah terverifikasi lewat tombol di atas." />
      ) : (
        <Kartu>
          <Tabel>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Judul</Th>
                <Th>Nomor</Th>
                <Th>Berlaku Sejak</Th>
                <Th>Ringkasan</Th>
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
      <JudulBagian>Tambah Dokumen Regulasi / SOP</JudulBagian>
      <p className="mt-1 text-sm text-[#0d2569]/70">
        Ditambahkan oleh: {user.nama} · Berlaku untuk semua satker (nasional).
        Isi nomor dokumen hanya bila sudah terverifikasi.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>Judul dokumen *</Label>
          <input
            className={inputClass}
            value={form.judul}
            onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
            placeholder="Contoh: Pedoman Kerja Sama LPP RRI"
          />
        </div>
        <div>
          <Label>Nomor dokumen (opsional)</Label>
          <input
            className={inputClass}
            value={form.nomor ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, nomor: e.target.value }))}
            placeholder="Diisi hanya bila terverifikasi"
          />
        </div>
        <div>
          <Label>Tanggal berlaku (opsional)</Label>
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
          <Label>Ringkasan *</Label>
          <textarea
            className={`${inputClass} min-h-20`}
            value={form.ringkasan}
            onChange={(e) => setForm((f) => ({ ...f, ringkasan: e.target.value }))}
            placeholder="Ringkasan isi dokumen"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Isi / poin penting (opsional)</Label>
          <textarea
            className={`${inputClass} min-h-24`}
            value={form.isi ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, isi: e.target.value }))}
            placeholder="Poin-poin penting dari dokumen"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Tautan dokumen (opsional)</Label>
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
        <TombolUtama onClick={simpan}>Simpan Dokumen</TombolUtama>
        <TombolSekunder onClick={onBatal}>Batal</TombolSekunder>
      </div>
    </Kartu>
  );
}

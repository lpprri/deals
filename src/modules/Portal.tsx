// Modul Portal Klien — Client Order Portal (Fase C, PRD Bab 7.8; Q-10
// terjawab 15/11/2026). Tampilan TERPISAH untuk pengguna login dengan
// peran 'klien' (PIC dari tiap klien): tanpa sidebar operator, dan HANYA
// menampilkan data klien itu sendiri (filter klienId di semua daftar —
// tidak ada data klien lain yang pernah dirender di sini).
// - PIC membuat pengajuan / media order / permohonan sewa (status awal
//   'Menunggu' — approval oleh Operator).
// - Setelah disetujui, PIC melihat timeline kerja sama kliennya: kontrak
//   yang ditandatangani, penerbitan invoice/billing, pembayaran
//   terverifikasi, kwitansi & bukti siaran.
// Palet HANYA 3 warna RRI: Biru #2573E2, Navy #0D2569, Putih #FFFFFF.

import { useState } from 'react';
import type { FormEvent } from 'react';
import { FileText, LogOut } from 'lucide-react';
import type { AppData } from '../lib/types';
import { DAFTAR_JENIS_PENGAJUAN_KLIEN } from '../lib/types';
import type { DummyUser } from '../lib/dummyUsers';
import type { PengajuanKlienInput, StoreActions } from '../lib/store';
import { formatRupiah, formatTanggal, hariIniIso } from '../lib/format';
import { bolehAksi } from '../lib/permissions';
import {
  Baris,
  JudulBagian,
  Kartu,
  Label,
  Peringatan,
  PesanKosong,
  StatCard,
  StatusBadge,
  Tabel,
  Td,
  Th,
  TombolSekunder,
  TombolUtama,
  inputClass,
} from '../components/ui';

export interface PortalProps {
  data: AppData;
  user: DummyUser;
  actions: StoreActions;
  onKeluar: () => void;
}

interface PeristiwaTimeline {
  tanggal: string;
  label: string;
  detail: string;
  status?: string;
}

export default function Portal({ data, user, actions, onKeluar }: PortalProps) {
  const klienId = user.klienId ?? '';
  const klien = data.klien.find((k) => k.id === klienId);
  const [pesanForm, setPesanForm] = useState<string | null>(null);

  // Semua daftar di bawah ini difilter klienId — tidak ada data klien
  // lain yang tampil di portal.
  const kontrakSaya = data.kontrak.filter((k) => k.klienId === klienId);
  const kontrakIds = new Set(kontrakSaya.map((k) => k.id));
  const tagihanSaya = data.tagihan.filter((t) => kontrakIds.has(t.kontrakId));
  const tagihanIds = new Set(tagihanSaya.map((t) => t.id));
  const pembayaranSaya = data.pembayaran.filter(
    (p) => tagihanIds.has(p.tagihanId) && p.statusVerifikasi === 'Terverifikasi',
  );
  const dokumenSaya = data.dokumen.filter((d) => kontrakIds.has(d.kontrakId));
  const submissionSaya = data.pengajuanKlien
    .filter((s) => s.klienId === klienId)
    .slice()
    .sort((a, b) => (a.tanggalBuat < b.tanggalBuat ? 1 : -1));

  const totalPembayaranTerverifikasi = pembayaranSaya.reduce(
    (jumlah, p) => jumlah + p.jumlah,
    0,
  );
  const submissionMenunggu = submissionSaya.filter(
    (s) => s.status === 'Menunggu',
  ).length;

  // Timeline: hanya peristiwa bertanggal milik klien ini, terbaru dulu.
  // "Billing" dan "invoice" adalah tagihan yang sama di aplikasi ini
  // (Tagihan) — label ditulis "Invoice / billing" supaya cocok dengan
  // istilah Q-10 tanpa menduplikasi entitas.
  const peristiwa: PeristiwaTimeline[] = [
    ...kontrakSaya.map((k) => ({
      tanggal: k.tanggalMulai,
      label: `Kontrak ${k.nomorPks} ditandatangani`,
      detail: `${k.kategoriLayanan} — ${formatRupiah(k.nilaiKontrak)}`,
      status: k.status,
    })),
    ...tagihanSaya.map((t) => ({
      tanggal: t.tanggalTerbit,
      label: `Invoice / billing ${t.nomor} diterbitkan`,
      detail: `${t.uraian} — ${formatRupiah(t.nilai)} • jatuh tempo ${formatTanggal(t.tanggalJatuhTempo)}`,
    })),
    ...pembayaranSaya.map((p) => {
      const tagihan = tagihanSaya.find((t) => t.id === p.tagihanId);
      return {
        tanggal: p.tanggalBayar,
        label: 'Pembayaran terverifikasi',
        detail: `${formatRupiah(p.jumlah)} • ${p.metode}${tagihan ? ` • untuk ${tagihan.nomor}` : ''}`,
        status: 'Terverifikasi',
      };
    }),
    ...dokumenSaya
      .filter((d) => d.status === 'Ada' && d.tanggalUnggah)
      .map((d) => ({
        tanggal: d.tanggalUnggah as string,
        label: `${d.jenisDokumen} diterbitkan`,
        detail: `Kontrak ${d.kontrakId}`,
        status: 'Ada',
      })),
  ].sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));

  // Kwitansi & bukti siaran yang belum diterbitkan (status 'Belum Ada').
  const dokumenMenunggu = dokumenSaya.filter(
    (d) =>
      (d.jenisDokumen === 'Kwitansi' || d.jenisDokumen === 'Bukti Siaran') &&
      d.status !== 'Ada',
  );

  if (!klien) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-10">
        <div className="w-full max-w-2xl">
          <Peringatan teks="Klien yang Anda wakili tidak ditemukan. Hubungi Operator aplikasi." />
          <div className="mt-4">
            <TombolSekunder onClick={onKeluar}>Keluar</TombolSekunder>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="flex flex-wrap items-center gap-4 border-b border-[#2573e2]/15 px-6 py-4">
        <img src="/logo-rri.svg" alt="Logo RRI" className="h-9 w-auto" />
        <div>
          <h1 className="text-xl font-bold text-[#0d2569]">Portal Klien</h1>
          <p className="text-sm text-[#0d2569]/70">
            {klien.nama} — PIC: {user.nama}
          </p>
        </div>
        <button
          onClick={onKeluar}
          className="ml-auto flex items-center gap-2 rounded-md border border-[#2573e2]/40 px-3 py-1.5 text-sm font-semibold text-[#0d2569] hover:bg-[#2573e2]/5"
        >
          <LogOut size={14} /> Keluar
        </button>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Kontrak berjalan"
            nilai={String(kontrakSaya.filter((k) => k.status === 'Aktif').length)}
            keterangan={`${kontrakSaya.length} kontrak tercatat`}
          />
          <StatCard
            label="Invoice / billing"
            nilai={String(tagihanSaya.length)}
            keterangan="Tagihan diterbitkan untuk klien ini"
          />
          <StatCard
            label="Pembayaran terverifikasi"
            nilai={formatRupiah(totalPembayaranTerverifikasi)}
            keterangan={`${pembayaranSaya.length} pembayaran terverifikasi`}
          />
          <StatCard
            label="Pengajuan menunggu"
            nilai={String(submissionMenunggu)}
            keterangan={`${submissionSaya.length} pengajuan dari portal`}
          />
        </div>

        <FormPengajuanKlien
          bolehBuat={bolehAksi(user.peran, 'buatPengajuanKlien')}
          actions={actions}
          pesan={pesanForm}
          onPesan={setPesanForm}
        />

        <Kartu>
          <JudulBagian>Pengajuan saya</JudulBagian>
          {submissionSaya.length === 0 ? (
            <p className="mt-3">
              <PesanKosong teks="Belum ada pengajuan dari portal." />
            </p>
          ) : (
            <Tabel>
              <thead>
                <tr>
                  <Th>ID</Th>
                  <Th>Jenis</Th>
                  <Th>Judul</Th>
                  <Th>Tanggal</Th>
                  <Th>Status</Th>
                  <Th>Catatan Operator</Th>
                </tr>
              </thead>
              <tbody>
                {submissionSaya.map((s) => (
                  <Baris key={s.id}>
                    <Td tebal>{s.id}</Td>
                    <Td>{s.jenis}</Td>
                    <Td>{s.judul}</Td>
                    <Td>{formatTanggal(s.tanggalBuat)}</Td>
                    <Td>
                      <StatusBadge status={s.status} />
                    </Td>
                    <Td>{s.catatanOperator ?? '-'}</Td>
                  </Baris>
                ))}
              </tbody>
            </Tabel>
          )}
        </Kartu>

        <Kartu>
          <JudulBagian>Timeline kerja sama</JudulBagian>
          {peristiwa.length === 0 ? (
            <p className="mt-3">
              <PesanKosong teks="Belum ada peristiwa kerja sama untuk klien ini." />
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {peristiwa.map((p, i) => (
                <li
                  key={`${p.tanggal}-${p.label}-${i}`}
                  className="flex gap-3 border-b border-[#2573e2]/10 pb-3 last:border-0 last:pb-0"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#2573e2]/10 text-[#2573e2]">
                    <FileText size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#0d2569]">
                      {p.label}
                    </p>
                    <p className="text-sm text-[#0d2569]/70">{p.detail}</p>
                    <p className="mt-1 text-xs text-[#0d2569]/60">
                      {formatTanggal(p.tanggal)}
                      {p.status ? ` • ${p.status}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {dokumenMenunggu.length > 0 && (
            <div className="mt-4">
              <Peringatan
                teks={`Menunggu diterbitkan: ${dokumenMenunggu
                  .map((d) => `${d.jenisDokumen} (kontrak ${d.kontrakId})`)
                  .join('; ')}.`}
              />
            </div>
          )}
        </Kartu>

        <Kartu>
          <JudulBagian>Dokumen kerja sama</JudulBagian>
          {dokumenSaya.length === 0 ? (
            <p className="mt-3">
              <PesanKosong teks="Belum ada dokumen untuk klien ini." />
            </p>
          ) : (
            <Tabel>
              <thead>
                <tr>
                  <Th>Jenis dokumen</Th>
                  <Th>Kontrak</Th>
                  <Th>Status</Th>
                  <Th>Tanggal unggah</Th>
                </tr>
              </thead>
              <tbody>
                {dokumenSaya.map((d) => (
                  <Baris key={d.id}>
                    <Td>{d.jenisDokumen}</Td>
                    <Td>{d.kontrakId}</Td>
                    <Td>
                      <StatusBadge status={d.status} />
                    </Td>
                    <Td>
                      {d.tanggalUnggah ? formatTanggal(d.tanggalUnggah) : '-'}
                    </Td>
                  </Baris>
                ))}
              </tbody>
            </Tabel>
          )}
        </Kartu>
      </main>
    </div>
  );
}

function FormPengajuanKlien({
  bolehBuat,
  actions,
  pesan,
  onPesan,
}: {
  bolehBuat: boolean;
  actions: StoreActions;
  pesan: string | null;
  onPesan: (pesan: string | null) => void;
}) {
  const [form, setForm] = useState<PengajuanKlienInput>({
    jenis: 'Pengajuan Kerja Sama',
    judul: '',
    uraian: '',
    nilaiPerkiraan: undefined,
  });
  const [nilaiTeks, setNilaiTeks] = useState('');
  const [error, setError] = useState('');

  const simpan = (e: FormEvent) => {
    e.preventDefault();
    if (form.judul.trim() === '') {
      setError('Judul wajib diisi.');
      return;
    }
    if (form.uraian.trim() === '') {
      setError('Uraian wajib diisi.');
      return;
    }
    const nilaiPerkiraan =
      nilaiTeks.trim() === '' ? undefined : Number(nilaiTeks);
    if (nilaiPerkiraan !== undefined && !(nilaiPerkiraan >= 0)) {
      setError('Nilai perkiraan harus berupa angka 0 atau lebih.');
      return;
    }
    const hasil = actions.tambahPengajuanKlien({
      jenis: form.jenis,
      judul: form.judul.trim(),
      uraian: form.uraian.trim(),
      nilaiPerkiraan,
    });
    if (hasil !== null) {
      setError(hasil);
      return;
    }
    setError('');
    setForm({
      jenis: 'Pengajuan Kerja Sama',
      judul: '',
      uraian: '',
      nilaiPerkiraan: undefined,
    });
    setNilaiTeks('');
    onPesan('Pengajuan terkirim dan menunggu persetujuan Operator.');
  };

  if (!bolehBuat) {
    return (
      <Kartu>
        <JudulBagian>Buat pengajuan baru</JudulBagian>
        <p className="mt-3">
          <PesanKosong teks="Akun Anda belum bisa membuat pengajuan." />
        </p>
      </Kartu>
    );
  }

  return (
    <Kartu>
      <JudulBagian>Buat pengajuan baru</JudulBagian>
      <form onSubmit={simpan} className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>Jenis pengajuan *</Label>
          <select
            className={inputClass}
            value={form.jenis}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                jenis: e.target.value as PengajuanKlienInput['jenis'],
              }))
            }
          >
            {DAFTAR_JENIS_PENGAJUAN_KLIEN.map((j) => (
              <option key={j} value={j}>
                {j}
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
            placeholder="Judul singkat pengajuan"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Uraian *</Label>
          <textarea
            className={`${inputClass} min-h-20`}
            value={form.uraian}
            onChange={(e) =>
              setForm((f) => ({ ...f, uraian: e.target.value }))
            }
            placeholder="Uraian kebutuhan: layanan, periode, dan hal lain yang perlu diketahui Operator"
          />
        </div>
        <div>
          <Label>Nilai perkiraan (Rp, opsional)</Label>
          <input
            className={inputClass}
            type="number"
            min="0"
            value={nilaiTeks}
            onChange={(e) => setNilaiTeks(e.target.value)}
            placeholder="Kosongkan bila belum ada perkiraan"
          />
        </div>
        <div className="flex items-end">
          <TombolUtama type="submit">Kirim Pengajuan</TombolUtama>
        </div>
      </form>
      {error !== '' && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {error}
        </p>
      )}
      {pesan !== null && (
        <p className="mt-4 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
          {pesan}
        </p>
      )}
      <p className="mt-3 text-xs text-[#0d2569]/60">
        Pengajuan dibuat pada {formatTanggal(hariIniIso())} dan masuk antrean
        approval Operator.
      </p>
    </Kartu>
  );
}

/**
 * Layar penahan untuk akun PIC yang login tetapi belum disetujui Operator
 * (status 'Menunggu') atau pendaftarannya ditolak ('Ditolak'). Akun TIDAK
 * masuk dashboard/portal sebelum statusnya 'Disetujui'.
 */
export function LayarMenungguApproval({
  user,
  onKeluar,
}: {
  user: DummyUser;
  onKeluar: () => void;
}) {
  const ditolak = user.statusApproval === 'Ditolak';
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-2xl text-center">
        <img src="/logo-rri.svg" alt="Logo RRI" className="mx-auto h-16 w-auto" />
        <h1 className="mt-4 text-2xl font-bold text-[#0d2569]">
          Partnership LPP RRI
        </h1>
        <div className="mt-8 text-left">
          {ditolak ? (
            <Peringatan teks="Pendaftaran akun PIC Anda ditolak oleh Operator. Silakan hubungi Operator aplikasi (Layanan & Pengembangan Usaha) untuk penjelasan lebih lanjut." />
          ) : (
            <Peringatan teks="Akun PIC Anda sedang menunggu persetujuan Operator. Anda belum bisa masuk ke Portal Klien sebelum akun disetujui. Silakan kembali lagi setelah Operator menyetujui pendaftaran Anda." />
          )}
        </div>
        <p className="mt-4 text-sm text-[#0d2569]/70">
          Masuk sebagai {user.nama}
          {user.email ? ` (${user.email})` : ''} — status:{' '}
          {user.statusApproval ?? 'Menunggu'}
        </p>
        <div className="mt-6">
          <TombolSekunder onClick={onKeluar}>Keluar</TombolSekunder>
        </div>
      </div>
    </div>
  );
}

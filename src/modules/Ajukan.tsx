// Halaman publik "Ajukan Permohonan Kerja Sama" — form submission tanpa
// login (KOREKSI 2026-11-15: klien TIDAK perlu akun; PIC tidak lagi
// daftar/masuk). Submission masuk koleksi pengajuanKlien dengan status
// selalu 'Menunggu' dan diproses Operator lewat antrean Pengajuan.
// Pemetaan jenis → layanan dipertahankan dari Fase C (lihat
// setujuiPengajuanKlien di App.tsx). Hanya warna RRI: Biru #2573E2,
// Navy #0D2569, Putih #FFFFFF.

import { useState, type FormEvent } from 'react';
import { DAFTAR_JENIS_PENGAJUAN_KLIEN } from '../lib/types';
import type { PengajuanPublikInput } from '../lib/store';
import {
  JudulBagian,
  Kartu,
  Label,
  TombolSekunder,
  TombolUtama,
  inputClass,
} from '../components/ui';

/**
 * Label Inggris untuk jenis permohonan tersimpan (DAFTAR_JENIS_PENGAJUAN_KLIEN).
 * Nilai yang disimpan TIDAK berubah — hanya label tampilannya. Belum ada di
 * labels.ts; laporkan ke koordinator untuk konsolidasi.
 */
const LABEL_JENIS_PENGAJUAN_KLIEN: Record<string, string> = {
  'Pengajuan Kerja Sama': 'Partnership Submission',
  'Media Order': 'Media Order',
  'Permohonan Sewa': 'Lease Request',
};

export default function Ajukan({
  onKirim,
  onKembali,
  jenisAwal,
  judulAwal,
  uraianAwal,
}: {
  onKirim: (input: PengajuanPublikInput) => Promise<string | null>;
  onKembali: () => void;
  /** Pre-select dari landing page (opsional; fallback ke default). */
  jenisAwal?: PengajuanPublikInput['jenis'];
  judulAwal?: string;
  uraianAwal?: string;
}) {
  const [form, setForm] = useState<PengajuanPublikInput>({
    namaPemohon: '',
    namaInstitusi: '',
    kontakEmail: '',
    kontakTelepon: '',
    jenis: jenisAwal ?? 'Pengajuan Kerja Sama',
    judul: judulAwal ?? '',
    uraian: uraianAwal ?? '',
    nilaiPerkiraan: undefined,
  });
  const [nilaiTeks, setNilaiTeks] = useState('');
  const [error, setError] = useState('');
  const [pesanSukses, setPesanSukses] = useState('');

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    setPesanSukses('');
    if (form.namaPemohon.trim() === '') {
      setError('Applicant name is required.');
      return;
    }
    if (form.namaInstitusi.trim() === '') {
      setError('Institution name is required.');
      return;
    }
    if (form.kontakEmail.trim() === '') {
      setError('Contact email is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.kontakEmail.trim())) {
      setError('Contact email is not valid.');
      return;
    }
    if (form.judul.trim() === '') {
      setError('Request title is required.');
      return;
    }
    if (form.uraian.trim() === '') {
      setError('Request details are required.');
      return;
    }
    const nilaiPerkiraan =
      nilaiTeks.trim() === '' ? undefined : Number(nilaiTeks);
    if (nilaiPerkiraan !== undefined && !(nilaiPerkiraan >= 0)) {
      setError('Estimated value must be 0 or more.');
      return;
    }
    const hasil = await onKirim({
      namaPemohon: form.namaPemohon.trim(),
      namaInstitusi: form.namaInstitusi.trim(),
      kontakEmail: form.kontakEmail.trim(),
      kontakTelepon: form.kontakTelepon?.trim() || undefined,
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
      namaPemohon: '',
      namaInstitusi: '',
      kontakEmail: '',
      kontakTelepon: '',
      jenis: 'Pengajuan Kerja Sama',
      judul: '',
      uraian: '',
      nilaiPerkiraan: undefined,
    });
    setNilaiTeks('');
    setPesanSukses('Your request has been sent and is awaiting review by the Operator.');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#2573e2]/20 px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo-rri.svg" alt="Logo RRI" className="h-10 w-auto" />
            <div>
              <p className="text-base font-bold text-[#0d2569]">
                Submit a Partnership Request
              </p>
              <p className="text-xs text-[#0d2569]/60">
                Partnership LPP RRI
              </p>
            </div>
          </div>
          <TombolSekunder onClick={onKembali}>
            &larr; Back to Home
          </TombolSekunder>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <Kartu>
          <JudulBagian>Request form</JudulBagian>
          <form onSubmit={kirim} className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <Label>Applicant name *</Label>
              <input
                className={inputClass}
                value={form.namaPemohon}
                onChange={(e) =>
                  setForm((f) => ({ ...f, namaPemohon: e.target.value }))
                }
                placeholder="Name of the person in charge / PIC"
              />
            </div>
            <div>
              <Label>Institution name *</Label>
              <input
                className={inputClass}
                value={form.namaInstitusi}
                onChange={(e) =>
                  setForm((f) => ({ ...f, namaInstitusi: e.target.value }))
                }
                placeholder="Company / institution name"
              />
            </div>
            <div>
              <Label>Contact email *</Label>
              <input
                className={inputClass}
                type="email"
                required
                value={form.kontakEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, kontakEmail: e.target.value }))
                }
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <input
                className={inputClass}
                type="tel"
                value={form.kontakTelepon ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, kontakTelepon: e.target.value }))
                }
                placeholder="Phone number (optional)"
              />
            </div>
            <div>
              <Label>Request type *</Label>
              <select
                className={inputClass}
                value={form.jenis}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    jenis: e.target
                      .value as PengajuanPublikInput['jenis'],
                  }))
                }
              >
                {DAFTAR_JENIS_PENGAJUAN_KLIEN.map((j) => (
                  <option key={j} value={j}>
                    {LABEL_JENIS_PENGAJUAN_KLIEN[j] ?? j}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Estimated value (Rp, optional)</Label>
              <input
                className={inputClass}
                type="number"
                min="0"
                value={nilaiTeks}
                onChange={(e) => setNilaiTeks(e.target.value)}
                placeholder="Leave blank if you do not have an estimate yet"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Request title *</Label>
              <input
                className={inputClass}
                value={form.judul}
                onChange={(e) =>
                  setForm((f) => ({ ...f, judul: e.target.value }))
                }
                placeholder="Short title for the request"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Request details *</Label>
              <textarea
                className={`${inputClass} min-h-24`}
                value={form.uraian}
                onChange={(e) =>
                  setForm((f) => ({ ...f, uraian: e.target.value }))
                }
                placeholder="Describe what you need: service, period, and anything else the Operator should know"
              />
            </div>
            <div className="md:col-span-2">
              {error !== '' && (
                <p className="mb-3 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
                  {error}
                </p>
              )}
              {pesanSukses !== '' && (
                <p className="mb-3 rounded-md border border-[#2573e2]/40 bg-[#2573e2]/5 px-3 py-2 text-sm font-semibold text-[#0d2569]">
                  {pesanSukses}
                </p>
              )}
              <TombolUtama type="submit">Submit Request</TombolUtama>
            </div>
          </form>
        </Kartu>
        <p className="mt-4 text-center text-xs text-[#0d2569]/60">
          Your request will be reviewed by the Operator (Service &amp;
          Business Development). No account needed.
        </p>
      </main>
    </div>
  );
}

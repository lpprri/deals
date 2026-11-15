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

export default function Ajukan({
  onKirim,
  onKembali,
}: {
  onKirim: (input: PengajuanPublikInput) => Promise<string | null>;
  onKembali: () => void;
}) {
  const [form, setForm] = useState<PengajuanPublikInput>({
    namaPemohon: '',
    namaInstitusi: '',
    kontakEmail: '',
    kontakTelepon: '',
    jenis: 'Pengajuan Kerja Sama',
    judul: '',
    uraian: '',
    nilaiPerkiraan: undefined,
  });
  const [nilaiTeks, setNilaiTeks] = useState('');
  const [error, setError] = useState('');
  const [pesanSukses, setPesanSukses] = useState('');

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    setPesanSukses('');
    if (form.namaPemohon.trim() === '') {
      setError('Nama pemohon wajib diisi.');
      return;
    }
    if (form.namaInstitusi.trim() === '') {
      setError('Nama institusi wajib diisi.');
      return;
    }
    if (form.kontakEmail.trim() === '') {
      setError('Email kontak wajib diisi.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.kontakEmail.trim())) {
      setError('Email kontak tidak valid.');
      return;
    }
    if (form.judul.trim() === '') {
      setError('Judul permohonan wajib diisi.');
      return;
    }
    if (form.uraian.trim() === '') {
      setError('Detail permohonan wajib diisi.');
      return;
    }
    const nilaiPerkiraan =
      nilaiTeks.trim() === '' ? undefined : Number(nilaiTeks);
    if (nilaiPerkiraan !== undefined && !(nilaiPerkiraan >= 0)) {
      setError('Nilai perkiraan harus berupa angka 0 atau lebih.');
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
    setPesanSukses('Permohonan terkirim dan menunggu diproses Operator.');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#2573e2]/20 px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo-rri.svg" alt="Logo RRI" className="h-10 w-auto" />
            <div>
              <p className="text-base font-bold text-[#0d2569]">
                Ajukan Permohonan Kerja Sama
              </p>
              <p className="text-xs text-[#0d2569]/60">
                Partnership LPP RRI
              </p>
            </div>
          </div>
          <TombolSekunder onClick={onKembali}>
            &larr; Kembali ke Masuk
          </TombolSekunder>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <Kartu>
          <JudulBagian>Form permohonan</JudulBagian>
          <form onSubmit={kirim} className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <Label>Nama pemohon *</Label>
              <input
                className={inputClass}
                value={form.namaPemohon}
                onChange={(e) =>
                  setForm((f) => ({ ...f, namaPemohon: e.target.value }))
                }
                placeholder="Nama penanggung jawab / PIC"
              />
            </div>
            <div>
              <Label>Nama institusi *</Label>
              <input
                className={inputClass}
                value={form.namaInstitusi}
                onChange={(e) =>
                  setForm((f) => ({ ...f, namaInstitusi: e.target.value }))
                }
                placeholder="Nama perusahaan / instansi"
              />
            </div>
            <div>
              <Label>Email kontak *</Label>
              <input
                className={inputClass}
                type="email"
                required
                value={form.kontakEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, kontakEmail: e.target.value }))
                }
                placeholder="email@contoh.id"
              />
            </div>
            <div>
              <Label>Telepon</Label>
              <input
                className={inputClass}
                type="tel"
                value={form.kontakTelepon ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, kontakTelepon: e.target.value }))
                }
                placeholder="Nomor telepon (opsional)"
              />
            </div>
            <div>
              <Label>Jenis permohonan *</Label>
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
                    {j}
                  </option>
                ))}
              </select>
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
            <div className="md:col-span-2">
              <Label>Judul permohonan *</Label>
              <input
                className={inputClass}
                value={form.judul}
                onChange={(e) =>
                  setForm((f) => ({ ...f, judul: e.target.value }))
                }
                placeholder="Judul singkat permohonan"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Detail permohonan *</Label>
              <textarea
                className={`${inputClass} min-h-24`}
                value={form.uraian}
                onChange={(e) =>
                  setForm((f) => ({ ...f, uraian: e.target.value }))
                }
                placeholder="Uraian kebutuhan: layanan, periode, dan hal lain yang perlu diketahui Operator"
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
              <TombolUtama type="submit">Kirim Permohonan</TombolUtama>
            </div>
          </form>
        </Kartu>
        <p className="mt-4 text-center text-xs text-[#0d2569]/60">
          Permohonan Anda akan diperiksa Operator (Layanan &amp;
          Pengembangan Usaha). Tidak perlu akun.
        </p>
      </main>
    </div>
  );
}

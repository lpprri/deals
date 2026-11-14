// Master data — Fase A + Fase B (PRD v2.0 Final Bab 6.13).
// Tampilan READ-ONLY. Master hanya diubah Admin; nilai yang sudah dipakai
// transaksi tidak dapat dihapus, hanya dinonaktifkan. Perubahan master
// dilakukan di luar mode contoh ini (Fase A: tampil sebagai daftar).

import type { ModulProps } from '../lib/store';
import {
  MASTER_JENIS_DOKUMEN,
  MASTER_JENIS_KLIEN,
  MASTER_KATEGORI_LAYANAN,
  MASTER_KODE_AKUN,
  MASTER_PROGRAMA,
  MASTER_STATUS_KONTRAK,
  MASTER_STATUS_ORDER,
  MASTER_STATUS_QUOTATION,
  MASTER_STATUS_TASK,
  MASTER_SUMBER_PROSPEK,
  MASTER_TAHAP_PENGAJUAN,
  MASTER_TAHAP_PIPELINE,
  SATKER_PILOT,
} from '../lib/master';
import {
  DAFTAR_SATKER,
  JUMLAH_SATKER_BERNOMOR,
  JUMLAH_SP,
} from '../lib/satker';
import {
  Baris,
  JudulBagian,
  Kartu,
  Peringatan,
  Tabel,
  Td,
  Th,
} from '../components/ui';

function DaftarNilai({ judul, nilai }: { judul: string; nilai: string[] }) {
  return (
    <Kartu>
      <JudulBagian>{judul}</JudulBagian>
      <ul className="mt-3 space-y-2">
        {nilai.map((n) => (
          <li
            key={n}
            className="rounded-md border border-[#2573e2]/20 bg-[#2573e2]/5 px-3 py-2 text-sm text-[#0d2569]"
          >
            {n}
          </li>
        ))}
      </ul>
    </Kartu>
  );
}

export default function MasterPage(_props: ModulProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-[#0d2569]/70">
        Master data adalah sumber kebenaran tunggal aplikasi (satu kode akun =
        satu klasifikasi). Halaman ini hanya menampilkan master — perubahan
        dilakukan oleh Admin Sistem.
      </p>

      <Peringatan teks="Master hanya diubah Admin; nilai yang sudah dipakai transaksi tidak dapat dihapus, hanya dinonaktifkan." />

      {/* Kode Akun */}
      <Kartu>
        <JudulBagian>Kode Akun</JudulBagian>
        <div className="mt-3">
          <Tabel>
            <thead>
              <tr>
                <Th>Kode</Th>
                <Th>Uraian</Th>
                <Th>Jenis PNBP</Th>
              </tr>
            </thead>
            <tbody>
              {MASTER_KODE_AKUN.map((k) => (
                <Baris key={k.kode}>
                  <Td tebal>{k.kode}</Td>
                  <Td>{k.uraian}</Td>
                  <Td>{k.jenisPnBP}</Td>
                </Baris>
              ))}
            </tbody>
          </Tabel>
        </div>
      </Kartu>

      {/* Kategori Layanan */}
      <Kartu>
        <JudulBagian>Kategori Layanan</JudulBagian>
        <div className="mt-3">
          <Tabel>
            <thead>
              <tr>
                <Th>Nama</Th>
                <Th>Kode Akun</Th>
                <Th>Jenis PNBP</Th>
              </tr>
            </thead>
            <tbody>
              {MASTER_KATEGORI_LAYANAN.map((k) => (
                <Baris key={k.nama}>
                  <Td>{k.nama}</Td>
                  <Td tebal>{k.kodeAkun}</Td>
                  <Td>{k.jenisPnBP}</Td>
                </Baris>
              ))}
            </tbody>
          </Tabel>
        </div>
      </Kartu>

      {/* Daftar nilai master */}
      <div className="grid gap-6 md:grid-cols-2">
        <DaftarNilai judul="Programa" nilai={MASTER_PROGRAMA} />
        <DaftarNilai judul="Jenis Klien" nilai={MASTER_JENIS_KLIEN} />
        <DaftarNilai judul="Jenis Dokumen" nilai={MASTER_JENIS_DOKUMEN} />
        <DaftarNilai judul="Status Kontrak" nilai={MASTER_STATUS_KONTRAK} />
        <DaftarNilai judul="Tahap Pengajuan" nilai={MASTER_TAHAP_PENGAJUAN} />
        <DaftarNilai
          judul="Tahap Pipeline (draf — menunggu Q-11)"
          nilai={MASTER_TAHAP_PIPELINE}
        />
        <DaftarNilai judul="Sumber Prospek" nilai={MASTER_SUMBER_PROSPEK} />
        <DaftarNilai
          judul="Status Quotation"
          nilai={MASTER_STATUS_QUOTATION}
        />
        <DaftarNilai judul="Status Order" nilai={MASTER_STATUS_ORDER} />
        <DaftarNilai judul="Status Tugas" nilai={MASTER_STATUS_TASK} />
      </div>

      {/* Daftar Satker */}
      <Kartu>
        <JudulBagian>Daftar Satker (Master Nasional)</JudulBagian>
        <p className="mt-2 text-sm text-[#0d2569]/70">
          {JUMLAH_SATKER_BERNOMOR} satker bernomor + {JUMLAH_SP} sub-stasiun
          = {DAFTAR_SATKER.length} entri. Satker pilot Fase A:{' '}
          <strong className="text-[#0d2569]">
            {SATKER_PILOT.nama} (kode {SATKER_PILOT.kode})
          </strong>
          . Ejaan nama mengikuti spreadsheet sumber &ldquo;LAPORAN PNBP
          2026&rdquo; dan menunggu verifikasi kantor pusat.
        </p>
        <div className="mt-3 max-h-96 overflow-auto rounded-md border border-[#2573e2]/20">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <Th className="sticky top-0 bg-white pl-3">No</Th>
                <Th className="sticky top-0 bg-white">Nama Satker</Th>
                <Th className="sticky top-0 bg-white">Tipe</Th>
                <Th className="sticky top-0 bg-white">Satker Induk</Th>
              </tr>
            </thead>
            <tbody>
              {DAFTAR_SATKER.map((s) => (
                <Baris key={`${s.nama}-${s.induk ?? ''}`}>
                  <Td className="pl-3">{s.no ?? '—'}</Td>
                  <Td tebal>
                    {s.nama}
                    {s.nama === SATKER_PILOT.nama && (
                      <span className="ml-2 rounded bg-[#2573e2]/10 px-2 py-0.5 text-xs font-semibold text-[#0d2569]">
                        Satker pilot
                      </span>
                    )}
                  </Td>
                  <Td>{s.tipe}</Td>
                  <Td>{s.induk ?? '—'}</Td>
                </Baris>
              ))}
            </tbody>
          </table>
        </div>
      </Kartu>
    </div>
  );
}

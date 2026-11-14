// Master data — Fase A (PRD v2.0 Final Bab 6.13).
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
  MASTER_TAHAP_PENGAJUAN,
  SATKER_PILOT,
} from '../lib/master';
import {
  DAFTAR_SATKER,
  JUMLAH_SATKER_BERNOMOR,
  JUMLAH_SP,
} from '../lib/satker';
import { JudulBagian, Kartu, Peringatan } from '../components/ui';

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
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2573e2]/20 text-left text-xs text-[#0d2569]/60">
                <th className="py-2 pr-3 font-semibold">Kode</th>
                <th className="py-2 pr-3 font-semibold">Uraian</th>
                <th className="py-2 font-semibold">Jenis PNBP</th>
              </tr>
            </thead>
            <tbody>
              {MASTER_KODE_AKUN.map((k) => (
                <tr
                  key={k.kode}
                  className="border-b border-[#2573e2]/10 text-[#0d2569]"
                >
                  <td className="py-2 pr-3 font-semibold">{k.kode}</td>
                  <td className="py-2 pr-3">{k.uraian}</td>
                  <td className="py-2">{k.jenisPnBP}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Kartu>

      {/* Kategori Layanan */}
      <Kartu>
        <JudulBagian>Kategori Layanan</JudulBagian>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2573e2]/20 text-left text-xs text-[#0d2569]/60">
                <th className="py-2 pr-3 font-semibold">Nama</th>
                <th className="py-2 pr-3 font-semibold">Kode Akun</th>
                <th className="py-2 font-semibold">Jenis PNBP</th>
              </tr>
            </thead>
            <tbody>
              {MASTER_KATEGORI_LAYANAN.map((k) => (
                <tr
                  key={k.nama}
                  className="border-b border-[#2573e2]/10 text-[#0d2569]"
                >
                  <td className="py-2 pr-3">{k.nama}</td>
                  <td className="py-2 pr-3 font-semibold">{k.kodeAkun}</td>
                  <td className="py-2">{k.jenisPnBP}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Kartu>

      {/* Daftar nilai master */}
      <div className="grid gap-6 md:grid-cols-2">
        <DaftarNilai judul="Programa" nilai={MASTER_PROGRAMA} />
        <DaftarNilai judul="Jenis Klien" nilai={MASTER_JENIS_KLIEN} />
        <DaftarNilai judul="Jenis Dokumen" nilai={MASTER_JENIS_DOKUMEN} />
        <DaftarNilai judul="Status Kontrak" nilai={MASTER_STATUS_KONTRAK} />
        <DaftarNilai judul="Tahap Pengajuan" nilai={MASTER_TAHAP_PENGAJUAN} />
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
              <tr className="sticky top-0 border-b border-[#2573e2]/20 bg-white text-left text-xs text-[#0d2569]/60">
                <th className="py-2 pl-3 pr-3 font-semibold">No</th>
                <th className="py-2 pr-3 font-semibold">Nama Satker</th>
                <th className="py-2 pr-3 font-semibold">Tipe</th>
                <th className="py-2 pr-3 font-semibold">Satker Induk</th>
              </tr>
            </thead>
            <tbody>
              {DAFTAR_SATKER.map((s) => (
                <tr
                  key={`${s.nama}-${s.induk ?? ''}`}
                  className="border-b border-[#2573e2]/10 text-[#0d2569]"
                >
                  <td className="py-2 pl-3 pr-3">{s.no ?? '—'}</td>
                  <td className="py-2 pr-3 font-semibold">
                    {s.nama}
                    {s.nama === SATKER_PILOT.nama && (
                      <span className="ml-2 rounded bg-[#2573e2]/10 px-2 py-0.5 text-xs font-semibold text-[#0d2569]">
                        Satker pilot
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-3">{s.tipe}</td>
                  <td className="py-2 pr-3">{s.induk ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Kartu>
    </div>
  );
}

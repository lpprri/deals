// Audit trail — Fase A (PRD v2.0 Final Bab 10).
// Halaman ini HANYA menampilkan jejak audit. Tidak menampilkan
// konfigurasi Firebase, email admin, atau secret apa pun (pelajaran Bab 13).
// Audit bersifat tambah-saja (append-only) dan tidak dapat diedit dari
// antarmuka. Akses halaman ini hanya untuk Admin Sistem (lihat permissions.ts).

import type { ModulProps } from '../lib/store';
import { formatWaktuAudit } from '../lib/audit';
import { JudulBagian, Kartu, Peringatan, PesanKosong } from '../components/ui';

export default function AuditPage({ data }: ModulProps) {
  const entri = [...data.audit].sort((a, b) =>
    a.waktu < b.waktu ? 1 : a.waktu > b.waktu ? -1 : 0,
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#0d2569]/70">
        Jejak audit seluruh perubahan data sensitif — siapa, kapan, apa yang
        berubah. Entri terbaru ditampilkan paling atas.
      </p>

      <Peringatan teks="Audit trail bersifat tambah-saja (append-only) dan tidak dapat diedit dari antarmuka." />

      <Kartu>
        <JudulBagian>Audit Trail ({entri.length} entri)</JudulBagian>
        {entri.length === 0 ? (
          <div className="mt-3">
            <PesanKosong teks="Belum ada entri audit." />
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2573e2]/20 text-left text-xs text-[#0d2569]/60">
                  <th className="py-2 pr-3 font-semibold">Waktu</th>
                  <th className="py-2 pr-3 font-semibold">Pengguna</th>
                  <th className="py-2 pr-3 font-semibold">Peran</th>
                  <th className="py-2 pr-3 font-semibold">Aksi</th>
                  <th className="py-2 pr-3 font-semibold">Entitas</th>
                  <th className="py-2 pr-3 font-semibold">ID Entitas</th>
                  <th className="py-2 pr-3 font-semibold">Sebelum</th>
                  <th className="py-2 font-semibold">Sesudah</th>
                </tr>
              </thead>
              <tbody>
                {entri.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-[#2573e2]/10 align-top text-[#0d2569]"
                  >
                    <td className="whitespace-nowrap py-2 pr-3">
                      {formatWaktuAudit(a.waktu)}
                    </td>
                    <td className="py-2 pr-3">{a.pengguna}</td>
                    <td className="py-2 pr-3">{a.peran}</td>
                    <td className="py-2 pr-3 font-semibold">{a.aksi}</td>
                    <td className="py-2 pr-3">{a.entitas}</td>
                    <td className="py-2 pr-3">{a.entitasId}</td>
                    <td className="py-2 pr-3 text-[#0d2569]/70">
                      {a.sebelum ?? '—'}
                    </td>
                    <td className="py-2 text-[#0d2569]/70">
                      {a.sesudah ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Kartu>
    </div>
  );
}

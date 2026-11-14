// Audit trail — Fase A (PRD v2.0 Final Bab 10).
// Halaman ini HANYA menampilkan jejak audit. Tidak menampilkan
// konfigurasi Firebase, email admin, atau secret apa pun (pelajaran Bab 13).
// Audit bersifat tambah-saja (append-only) dan tidak dapat diedit dari
// antarmuka. Akses halaman ini hanya untuk Admin Sistem (lihat permissions.ts).

import type { ModulProps } from '../lib/store';
import { formatWaktuAudit } from '../lib/audit';
import {
  Baris,
  JudulBagian,
  Kartu,
  Peringatan,
  PesanKosong,
  Tabel,
  Td,
  Th,
} from '../components/ui';

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
          <div className="mt-3">
            <Tabel>
              <thead>
                <tr>
                  <Th>Waktu</Th>
                  <Th>Pengguna</Th>
                  <Th>Peran</Th>
                  <Th>Aksi</Th>
                  <Th>Entitas</Th>
                  <Th>ID Entitas</Th>
                  <Th>Sebelum</Th>
                  <Th>Sesudah</Th>
                </tr>
              </thead>
              <tbody>
                {entri.map((a) => (
                  <Baris key={a.id}>
                    <Td className="whitespace-nowrap">
                      {formatWaktuAudit(a.waktu)}
                    </Td>
                    <Td>{a.pengguna}</Td>
                    <Td>{a.peran}</Td>
                    <Td tebal>{a.aksi}</Td>
                    <Td>{a.entitas}</Td>
                    <Td>{a.entitasId}</Td>
                    <Td>
                      <span className="text-[#0d2569]/70">
                        {a.sebelum ?? '—'}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-[#0d2569]/70">
                        {a.sesudah ?? '—'}
                      </span>
                    </Td>
                  </Baris>
                ))}
              </tbody>
            </Tabel>
          </div>
        )}
      </Kartu>
    </div>
  );
}

// Audit trail — Fase A (PRD v2.0 Final Bab 10).
// Halaman ini HANYA menampilkan jejak audit. Tidak menampilkan
// konfigurasi Firebase, email admin, atau secret apa pun (pelajaran Bab 13).
// Audit bersifat tambah-saja (append-only) dan tidak dapat diedit dari
// antarmuka. Akses halaman ini hanya untuk Admin Sistem (lihat permissions.ts).

import type { ModulProps } from '../lib/store';
import { formatWaktuAudit } from '../lib/audit';
import { labelAksiAudit, labelEntitasAudit, labelJabatan } from '../lib/labels';
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
        Audit trail of all sensitive data changes — who, when, what changed.
        Newest entries are shown first.
      </p>

      <Peringatan teks="The audit trail is append-only and cannot be edited from the interface." />

      <Kartu>
        <JudulBagian>Audit Trail ({entri.length} entries)</JudulBagian>
        {entri.length === 0 ? (
          <div className="mt-3">
            <PesanKosong teks="No audit entries yet." />
          </div>
        ) : (
          <div className="mt-3">
            <Tabel>
              <thead>
                <tr>
                  <Th>Time</Th>
                  <Th>User</Th>
                  <Th>Role</Th>
                  <Th>Action</Th>
                  <Th>Entity</Th>
                  <Th>Entity ID</Th>
                  <Th>Before</Th>
                  <Th>After</Th>
                </tr>
              </thead>
              <tbody>
                {entri.map((a) => (
                  <Baris key={a.id}>
                    <Td className="whitespace-nowrap">
                      {formatWaktuAudit(a.waktu)}
                    </Td>
                    <Td>{a.pengguna}</Td>
                    <Td>{labelJabatan(a.peran)}</Td>
                    <Td tebal>{labelAksiAudit(a.aksi)}</Td>
                    <Td>{labelEntitasAudit(a.entitas)}</Td>
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

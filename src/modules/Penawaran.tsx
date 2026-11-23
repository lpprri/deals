// Menu Offer & Order (keputusan pengguna 15/11/2026 20:14 WIB, PR #38):
// dua menu tingkat atas di cluster Sales & Deals, setelah Clients.
// Keduanya memakai ulang tampilan yang sama dari Sales; TIDAK ada
// duplikasi tabel/data dan total tidak berubah. Keduanya navigasi
// langsung — tanpa sub-item dan tanpa panel tambahan.
//
// PERUBAHAN (keputusan pengguna 15/11/2026 21:19–21:20 WIB, PR #41):
// 1. Offer diubah menjadi PIPELINE/KANBAN 6 kolom (Prospek, Dihubungi,
//    Penawaran, Negosiasi, Diterima, Ditolak). Kartu = prospek;
//    kartu menampilkan quotation yang tertaut bila ada (nilai + status).
//    Pemetaan tahap tersimpan (Q-11) ke kolom tampil ADA DI BAWAH —
//    TAMPILAN saja: MASTER_TAHAP_PIPELINE, Q-11, dan logika stage Sales
//    TIDAK berubah. Sales Pipeline (7 tahap) tetap apa adanya.
// 2. Isi tab ringkasan lama (summary cards + "Prospects per Stage" +
//    Conversion Rate, dari hitungAnalitikSales) dirender DI BAWAH board,
//    selalu terlihat — judul section netral "Summary", TANPA kata
//    itu di halaman Offer. (Judul diubah di TabAnalytics,
//    Sales.tsx — komponen itu hanya dipakai halaman Offer.)
// 3. Tab Quotation & Prospect DIHAPUS dari Offer (HANYA tab-nya):
//    tidak ada lagi TabBar di halaman ini. Data 3 quotation + 4
//    prospect TETAP UTUH; menu Prospect, tab Sales, menu Order, dan
//    komponen TabQuotation/TabProspek/TabAnalytics di Sales.tsx TETAP
//    ADA. Tombol "+ Buat penawaran" TETAP di kanan atas halaman
//    (form-nya dipakai ulang dari Sales — FormQuotation diekspor).
//
// FAKTA DATA (impor nyata 14/11/2026, Fase B): 3 quotation
// (QTN-01 Disetujui Rp48.000.000, QTN-02 Dikirim Rp9.000.000,
// QTN-03 Ditolak Rp5.000.000 — Σ Rp62.000.000), 1 order
// (ORD-01 Selesai Rp48.000.000, dari QTN-01, dikonversi menjadi
// kontrak PKS-001/2026), dan 4 prospect (PRS-01 … PRS-04).
// Distribusi Kanban dari data: Prospek 1 (PRS-04), Dihubungi 0,
// Penawaran 0, Negosiasi 1 (PRS-01), Diterima 1 (PRS-02),
// Ditolak 1 (PRS-03). Bila prospek/penawaran baru ditambahkan
// lewat form, halaman ini ikut menampilkan karena membaca data
// yang sama seperti Sales.

import { useState } from 'react';
import type { Prospect, Quotation, TahapPipeline } from '../lib/types';
import type { ModulProps } from '../lib/store';
import { formatRupiah } from '../lib/format';
import { bolehAksi } from '../lib/permissions';
import { labelStatusPersetujuan } from '../lib/labels';
import { JudulBagian, TombolUtama } from '../components/ui';
import { FormQuotation, TabAnalytics, TabOrder } from './Sales';

/** Kolom Kanban Offer (tampil), 6 kolom, urutan tetap. */
export const KOLOM_OFFER = [
  'Prospek',
  'Dihubungi',
  'Penawaran',
  'Negosiasi',
  'Diterima',
  'Ditolak',
] as const;

export type KolomOffer = (typeof KOLOM_OFFER)[number];

/**
 * Pemetaan tahap tersimpan (Q-11, Indonesia) ke kolom tampil Offer.
 * TAMPILAN saja — MASTER_TAHAP_PIPELINE, Q-11, dan logika stage Sales
 * tidak berubah. 'Order' dan 'Diterima' sama-sama berarti penawaran
 * diterima (order dibuat = penawaran diterima).
 */
const PETA_TAHAP_KE_KOLOM: Record<TahapPipeline, KolomOffer> = {
  'Prospek Baru': 'Prospek',
  Dihubungi: 'Dihubungi',
  Penawaran: 'Penawaran',
  Negosiasi: 'Negosiasi',
  Order: 'Diterima',
  Diterima: 'Diterima',
  Ditolak: 'Ditolak',
};

export function kolomKanbanOffer(tahap: TahapPipeline): KolomOffer {
  return PETA_TAHAP_KE_KOLOM[tahap];
}

/**
 * Kartu prospect di board Kanban Offer: nama, nilai perkiraan, PIC,
 * + quotation yang tertaut (nilai + status) bila ada. Tampil saja —
 * pindah tahap tetap lewat Sales Pipeline.
 */
function KartuOfferKanban({
  prospect,
  quotation,
}: {
  prospect: Prospect;
  quotation: Quotation[];
}) {
  return (
    <div className="rounded-md border border-[#2573e2]/20 bg-[#2573e2]/5 p-3">
      <p className="text-sm font-semibold text-[#0d2569]">
        {prospect.namaInstansi}
      </p>
      <p className="mt-0.5 text-xs text-[#0d2569]/70">
        {formatRupiah(prospect.nilaiPerkiraan)}
      </p>
      <p className="text-xs text-[#0d2569]/70">{prospect.penanggungJawab}</p>
      {quotation.map((q) => (
        <p key={q.id} className="mt-1 text-xs text-[#0d2569]/70">
          {q.id} — {formatRupiah(q.nilai)} — {labelStatusPersetujuan(q.status)}
        </p>
      ))}
    </div>
  );
}

/** Offer — Pipeline/Kanban 6 kolom + ringkasan di bawah board. */
export function MenuOffer(props: ModulProps) {
  const { data, user, actions } = props;
  const [tampilForm, setTampilForm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <JudulBagian>Alur penawaran</JudulBagian>
        {bolehAksi(user.peran, 'kelolaQuotation') && (
          <TombolUtama onClick={() => setTampilForm(true)}>
            + Buat penawaran
          </TombolUtama>
        )}
      </div>

      {tampilForm && (
        <FormQuotation
          data={data}
          actions={actions}
          onBatal={() => setTampilForm(false)}
          onSukses={() => setTampilForm(false)}
        />
      )}

      <div className="flex gap-3 overflow-x-auto pb-2">
        {KOLOM_OFFER.map((kolom) => {
          const isi = data.prospect.filter(
            (p) => kolomKanbanOffer(p.tahap) === kolom,
          );
          const nilai = isi.reduce((s, p) => s + p.nilaiPerkiraan, 0);
          return (
            <div
              key={kolom}
              className="w-64 shrink-0 rounded-md border border-[#2573e2]/20 bg-white p-3"
            >
              <p className="text-sm font-bold text-[#0d2569]">{kolom}</p>
              <p className="mt-0.5 text-xs text-[#0d2569]/60">
                {isi.length} prospek ·{' '}
                {formatRupiah(nilai)}
              </p>
              <div className="mt-3 space-y-2">
                {isi.length === 0 ? (
                  <p className="text-xs text-[#0d2569]/60">
                    Belum ada prospek di tahap ini.
                  </p>
                ) : (
                  isi.map((p) => (
                    <KartuOfferKanban
                      key={p.id}
                      prospect={p}
                      quotation={data.quotation.filter(
                        (q) => q.prospectId === p.id,
                      )}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TabAnalytics data={data} />
    </div>
  );
}

/** Order — tampilan Order (Order Form) yang sama seperti Sales. */
export function MenuOrder(props: ModulProps) {
  return <TabOrder {...props} />;
}

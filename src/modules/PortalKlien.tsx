// Client Portal — halaman setelah login peran 'client' (dua peran,
// keputusan pengguna 19/11/2026 15:45 WIB — MEMBALIK keputusan
// 14/11/2026 "buang semua role" dan koreksi 15/11/2026 / PRD v2.3
// yang menghapus login klien). Satu halaman login; peran dibedakan
// lewat field `peran` di profil `users/{uid}`; client masuk ke sini,
// operator masuk admin portal. Lacak publik (nomor PKS/tagihan, tanpa
// login) TETAP ada di samping login.
//
// ISI PORTAL (keputusan pengguna 19/11/2026 15:48 WIB):
// (a) My Cooperation — kontrak/MoU/Commitment milik client ini
//     (periode + Remaining Days, status pembayaran, invoice/billing,
//     kwitansi, bukti siaran) + submission saya;
// (b) Plan a Campaign — halaman embed Tally yang sudah ada;
// (c) Ajukan Kerja Sama — form submission publik yang sudah ada
//     (submission dari portal tertaut ke akun client — klienId diisi);
// (d) Book a Free Call — kartu booking 30 menit yang sudah ada
//     (WIB/WITA/WIT);
// (e) Our Services — 4 layanan + contoh kampanye (dari landing);
// (f) Additional Services — 6 item, Coming Soon (sama seperti footer);
// (g) Help & Contact — FAQ relevan klien + kontak RRI.
//
// KEAMANAN: portal ini HANYA menampilkan data yang sudah tersaring
// untuk client ini — di mode Firestore, App.tsx memuatnya lewat
// muatDataKlien() (filter klienId + satker); di mode contoh, portal
// menyaring seed penuh di sini (defense in depth). Client TIDAK
// PERNAH melihat daftar klien lain, kontrak lain, atau menu admin —
// dan firestore.rules menolak baca lintas klien di sisi server (bukan
// hanya routing di App.tsx). TIDAK ADA aksi tulis client di portal
// ini kecuali Ajukan + booking (keduanya jalur publik yang sudah ada).
// TIDAK ADA pembayaran online di portal ini.

import { useState } from 'react';
import type { DummyUser } from '../lib/dummyUsers';
import type { AppData, Kontrak } from '../lib/types';
import type { BookingPublikInput, PengajuanPublikInput } from '../lib/store';
import { formatRupiah, formatTanggal } from '../lib/format';
import { KAMPANYE_MARKLO, LAYANAN_MARKLO } from '../lib/landingMarklo';
import {
  sisaHariKerjaSama,
  sisaHariMou,
  statusPembayaranKontrak,
} from '../lib/kontrakTampilan';
import {
  labelJenisPnBP,
  labelKategoriLayanan,
  labelStatusKontrak,
} from '../lib/labels';
import { cariKerjaSama, DetailKerjaSama } from './Lacak';
import Ajukan from './Ajukan';
import PlanCampaign from './PlanCampaign';
import ComingSoon from './ComingSoon';
import { BookingKonsultasi } from './landing/Marklo';
import {
  Baris,
  JudulBagian,
  Kartu,
  PesanKosong,
  StatusBadge,
  Tabel,
  Td,
  Th,
  TombolSekunder,
  TombolUtama,
} from '../components/ui';

type TabPortal =
  | 'kerja-sama'
  | 'plan-campaign'
  | 'ajukan'
  | 'book-call'
  | 'layanan'
  | 'tambahan'
  | 'bantuan';

const TAB_LABEL: { id: TabPortal; label: string }[] = [
  { id: 'kerja-sama', label: 'My Cooperation' },
  { id: 'plan-campaign', label: 'Plan a Campaign' },
  { id: 'ajukan', label: 'Submit a Request' },
  { id: 'book-call', label: 'Book a Free Call' },
  { id: 'layanan', label: 'Our Services' },
  { id: 'tambahan', label: 'Additional Services' },
  { id: 'bantuan', label: 'Help & Contact' },
];

/** Lima item Additional Service (sama seperti footer — Coming Soon). */
const LAYANAN_TAMBAHAN = [
  'Book a Venue',
  'Rent a Space',
  'Collaborate with Us',
  'Support our Event',
  'Invite as Media Partner',
] as const;

/** FAQ relevan klien — jawaban dari perilaku aplikasi yang sebenarnya. */
const FAQ_KLIEN: { tanya: string; jawab: string }[] = [
  {
    tanya: 'How do I track my partnership?',
    jawab:
      'Sign in here and open My Cooperation — your contracts, invoices, payments, and documents are listed there. Without signing in, you can also use Track Partnership on the landing page with your PKS or invoice number.',
  },
  {
    tanya: 'How do I submit a new partnership request?',
    jawab:
      'Open Submit a Request and fill in the form. You will receive a reference number (for example PKL-001) — keep it to track your request status.',
  },
  {
    tanya: 'How do I request an advertising quotation?',
    jawab:
      'Open Plan a Campaign and fill in the form. The Operator will prepare your quotation and contact you — no prices are shown in the form itself.',
  },
  {
    tanya: 'How do I book a free consultation call?',
    jawab:
      'Open Book a Free Call, pick a date and a 30-minute slot, then fill in the short form. You can view the times in WIB, WITA, or WIT. The Operator will send you the meeting link.',
  },
  {
    tanya: 'How do I pay an invoice?',
    jawab:
      'Invoices are listed under each contract in My Cooperation. There is no online payment in this portal — payment is confirmed by the Operator after verification, and the receipt appears under the same contract.',
  },
  {
    tanya: 'I cannot see one of my contracts. What should I do?',
    jawab:
      'Contact the Operator (Service & Business Development) with your PKS number. Your account only shows the cooperation linked to it — if a contract is missing, the Operator needs to link it to your account.',
  },
];

export interface PortalKlienProps {
  /** Pengguna client yang login (peran 'client', klienId wajib). */
  pengguna: DummyUser;
  /**
   * Data untuk client ini — di mode Firestore sudah tersaring lewat
   * muatDataKlien(); di mode contoh seed penuh (portal menyaring lagi
   * di sini). Jangan pernah memberi data penuh lintas klien ke portal.
   */
  data: AppData;
  /** Keluar (signOut + kembali ke landing). */
  onKeluar: () => void;
  /** Kirim booking free call (jalur publik yang sudah ada). */
  onKirimBooking: (input: BookingPublikInput) => Promise<string | null>;
  /**
   * Kirim submission Ajukan dari portal — App.tsx mengisi klienId
   * akun ini supaya submission tertaut ke client (lihat
   * kirimPengajuanPublik). Mengembalikan `{ galat, id }`.
   */
  onKirimPengajuan: (input: PengajuanPublikInput) => Promise<{
    galat: string | null;
    id?: string;
  }>;
}

export default function PortalKlien({
  pengguna,
  data,
  onKeluar,
  onKirimBooking,
  onKirimPengajuan,
}: PortalKlienProps) {
  const [tab, setTab] = useState<TabPortal>('kerja-sama');
  const [kontrakTerpilih, setKontrakTerpilih] = useState<Kontrak | null>(null);
  const [layananTambahan, setLayananTambahan] = useState<string | null>(null);

  const klienId = pengguna.klienId ?? '';
  // Saring lagi di sini (defense in depth — di mode contoh `data`
  // adalah seed penuh; di mode Firestore sudah tersaring).
  const klien = data.klien.find((k) => k.id === klienId) ?? null;
  const kontrakSaya = data.kontrak.filter((k) => k.klienId === klienId);
  const mouSaya = data.mou.filter((m) => m.klienId === klienId);
  const commitmentSaya = data.commitment.filter((c) => c.klienId === klienId);
  const pengajuanSaya = data.pengajuanKlien.filter(
    (p) =>
      p.klienId === klienId ||
      (pengguna.email ? p.dibuatOleh === pengguna.email : false),
  );

  const kembaliKePortal = () => {
    setTab('kerja-sama');
    setLayananTambahan(null);
  };

  // Halaman penuh (bukan di dalam shell tab): Plan a Campaign, Ajukan,
  // dan Coming Soon memakai layout halamannya sendiri.
  if (tab === 'plan-campaign') {
    return (
      <PlanCampaign
        onKembali={kembaliKePortal}
        labelKembali="Back to Client Portal"
      />
    );
  }
  if (tab === 'ajukan') {
    return (
      <Ajukan
        onKirim={onKirimPengajuan}
        onKembali={kembaliKePortal}
        labelKembali="Back to Client Portal"
        emailTetap={pengguna.email}
      />
    );
  }
  if (layananTambahan !== null) {
    return (
      <ComingSoon
        onKembali={() => setLayananTambahan(null)}
        labelKembali="Back to Client Portal"
      />
    );
  }

  const hasilTerpilih = kontrakTerpilih
    ? cariKerjaSama(data, kontrakTerpilih.nomorPks)
    : null;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#2573e2]/20 px-4 py-4">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo-rri.svg" alt="Logo RRI" className="h-10 w-auto" />
            <div>
              <p className="text-base font-bold text-[#0d2569]">
                Client Portal
              </p>
              <p className="text-xs text-[#0d2569]/60">
                {klien?.nama ?? pengguna.nama}
                {klien
                  ? ` • ${klien.jenis}`
                  : pengguna.institusi
                    ? ` • ${pengguna.institusi}`
                    : ''}
              </p>
            </div>
          </div>
          <TombolSekunder onClick={onKeluar}>Sign out</TombolSekunder>
        </div>
        <nav className="mx-auto mt-4 flex max-w-5xl flex-wrap gap-2">
          {TAB_LABEL.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                tab === t.id
                  ? 'bg-[#2573e2] text-white'
                  : 'border border-[#2573e2]/20 bg-white text-[#0d2569] hover:border-[#2573e2]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {tab === 'kerja-sama' && (
          <div className="space-y-6">
            {klienId === '' && (
              <Kartu>
                <p className="text-sm font-semibold text-[#0d2569]">
                  Your account is not linked to a client record yet.
                </p>
                <p className="mt-2 text-sm text-[#0d2569]/70">
                  You signed up
                  {pengguna.institusi ? ` as ${pengguna.institusi}` : ''} —
                  the Operator will link your account to your
                  partnership data after verifying your identity. Until
                  then you cannot see any contract, invoice, or
                  broadcast proof here. Start by submitting a
                  partnership request below — the Operator will use it
                  to link your account.
                </p>
                <div className="mt-4">
                  <TombolUtama onClick={() => setTab('ajukan')}>
                    Submit a Request
                  </TombolUtama>
                </div>
              </Kartu>
            )}

            <Kartu>
              <JudulBagian>My Cooperation</JudulBagian>
              <p className="mt-2 text-sm text-[#0d2569]/70">
                {kontrakSaya.length} contract
                {kontrakSaya.length === 1 ? '' : 's'}
                {mouSaya.length > 0
                  ? ` • ${mouSaya.length} Memorandum of Understanding`
                  : ''}
                {commitmentSaya.length > 0
                  ? ` • ${commitmentSaya.length} Commitment`
                  : ''}
                . Only your own cooperation is shown here.
              </p>
              {kontrakSaya.length === 0 &&
              mouSaya.length === 0 &&
              commitmentSaya.length === 0 ? (
                <p className="mt-3">
                  <PesanKosong teks="No cooperation linked to your account yet. Contact the Operator if you expect to see a contract here." />
                </p>
              ) : (
                <>
                  {kontrakSaya.length > 0 && (
                    <div className="mt-4">
                      <Tabel>
                        <thead>
                          <tr>
                            <Th>PKS Number</Th>
                            <Th>Service</Th>
                            <Th>Period</Th>
                            <Th>Remaining Days</Th>
                            <Th>Payment Status</Th>
                            <Th kanan>Value</Th>
                            <Th>Detail</Th>
                          </tr>
                        </thead>
                        <tbody>
                          {kontrakSaya.map((k) => (
                            <Baris key={k.id}>
                              <Td tebal>{k.nomorPks}</Td>
                              <Td>
                                {labelKategoriLayanan(k.kategoriLayanan)}
                                {k.jenisPnBP
                                  ? ` • PNBP ${labelJenisPnBP(k.jenisPnBP)}`
                                  : ''}
                              </Td>
                              <Td>
                                {formatTanggal(k.tanggalMulai)} —{' '}
                                {formatTanggal(k.tanggalSelesai)}
                              </Td>
                              <Td>{sisaHariKerjaSama(k)}</Td>
                              <Td>
                                <StatusBadge
                                  status={statusPembayaranKontrak(
                                    k,
                                    data.tagihan,
                                    data.pembayaran,
                                    data.denda,
                                  )}
                                />
                              </Td>
                              <Td kanan>{formatRupiah(k.nilaiKontrak)}</Td>
                              <Td>
                                <TombolSekunder
                                  onClick={() =>
                                    setKontrakTerpilih(
                                      kontrakTerpilih?.id === k.id ? null : k,
                                    )
                                  }
                                >
                                  {kontrakTerpilih?.id === k.id
                                    ? 'Hide'
                                    : 'View'}
                                </TombolSekunder>
                              </Td>
                            </Baris>
                          ))}
                        </tbody>
                      </Tabel>
                    </div>
                  )}

                  {kontrakTerpilih && hasilTerpilih && (
                    <div className="mt-4 rounded-xl border border-[#2573e2]/20 bg-[#2573e2]/5 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-bold text-[#0d2569]">
                          Contract {kontrakTerpilih.nomorPks} —{' '}
                          {labelStatusKontrak(kontrakTerpilih.status)}
                        </p>
                        <TombolSekunder
                          onClick={() => setKontrakTerpilih(null)}
                        >
                          Close
                        </TombolSekunder>
                      </div>
                      <DetailKerjaSama hasil={hasilTerpilih} data={data} />
                    </div>
                  )}

                  {mouSaya.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-bold text-[#0d2569]">
                        Memorandum of Understanding
                      </h3>
                      <div className="mt-2">
                        <Tabel>
                          <thead>
                            <tr>
                              <Th>Document Number</Th>
                              <Th>Title</Th>
                              <Th>Period</Th>
                              <Th>Remaining Days</Th>
                              <Th>PIC</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {mouSaya.map((m) => (
                              <Baris key={m.id}>
                                <Td tebal>{m.id}</Td>
                                <Td>{m.judul}</Td>
                                <Td>
                                  {formatTanggal(m.tanggalMulai)} —{' '}
                                  {formatTanggal(m.tanggalSelesai)}
                                </Td>
                                <Td>{sisaHariMou(m)}</Td>
                                <Td>{m.pic}</Td>
                              </Baris>
                            ))}
                          </tbody>
                        </Tabel>
                      </div>
                    </div>
                  )}

                  {commitmentSaya.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-bold text-[#0d2569]">
                        Commitment
                      </h3>
                      <div className="mt-2">
                        <Tabel>
                          <thead>
                            <tr>
                              <Th>Document Number</Th>
                              <Th>Event</Th>
                              <Th>Date</Th>
                              <Th kanan>Total Support</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {commitmentSaya.map((c) => (
                              <Baris key={c.id}>
                                <Td tebal>{c.id}</Td>
                                <Td>{c.kegiatan}</Td>
                                <Td>{formatTanggal(c.tanggalKegiatan)}</Td>
                                <Td kanan>
                                  {formatRupiah(c.totalDukungan)}
                                </Td>
                              </Baris>
                            ))}
                          </tbody>
                        </Tabel>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Kartu>

            <Kartu>
              <JudulBagian>My Requests</JudulBagian>
              {pengajuanSaya.length === 0 ? (
                <p className="mt-3">
                  <PesanKosong teks="No requests from your account yet. Use Submit a Request to send one — you will receive a reference number to track it." />
                </p>
              ) : (
                <div className="mt-4">
                  <Tabel>
                    <thead>
                      <tr>
                        <Th>Reference</Th>
                        <Th>Type</Th>
                        <Th>Title</Th>
                        <Th>Submitted</Th>
                        <Th>Status</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {pengajuanSaya.map((p) => (
                        <Baris key={p.id}>
                          <Td tebal>{p.id}</Td>
                          <Td>{p.jenis}</Td>
                          <Td>{p.judul}</Td>
                          <Td>{formatTanggal(p.tanggalBuat)}</Td>
                          <Td>
                            <StatusBadge status={p.status} />
                          </Td>
                        </Baris>
                      ))}
                    </tbody>
                  </Tabel>
                </div>
              )}
            </Kartu>
          </div>
        )}

        {tab === 'book-call' && (
          <div className="mx-auto max-w-2xl">
            <h1 className="text-2xl font-bold text-[#0d2569]">
              Book a Free Call
            </h1>
            <p className="mt-2 text-sm text-[#0d2569]/70">
              Pick a date and a 30-minute slot, then fill in the short
              form. You can view the times in WIB, WITA, or WIT. The
              Operator will send you the meeting link.
            </p>
            <div className="mt-6">
              <BookingKonsultasi onKirimBooking={onKirimBooking} />
            </div>
          </div>
        )}

        {tab === 'layanan' && (
          <div className="space-y-6">
            <Kartu>
              <JudulBagian>Our Services</JudulBagian>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {LAYANAN_MARKLO.map((layanan) => (
                  <div
                    key={layanan.nama}
                    className="rounded-xl border border-[#2573e2]/20 bg-[#2573e2]/5 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#2573e2]">
                      {layanan.langkah}
                    </p>
                    <p className="mt-1 text-base font-bold text-[#0d2569]">
                      {layanan.nama}
                    </p>
                    <p className="mt-2 text-sm text-[#0d2569]/70">
                      {layanan.desk}
                    </p>
                    <div className="mt-3">
                      <TombolUtama onClick={() => setTab('plan-campaign')}>
                        Plan a Campaign
                      </TombolUtama>
                    </div>
                  </div>
                ))}
              </div>
            </Kartu>
            <Kartu>
              <JudulBagian>Campaign examples</JudulBagian>
              <ul className="mt-3 space-y-3">
                {KAMPANYE_MARKLO.map((kampanye) => (
                  <li
                    key={`${kampanye.klien}-${kampanye.layanan}`}
                    className="rounded-md border border-[#2573e2]/20 bg-white px-3 py-2"
                  >
                    <p className="text-sm font-bold text-[#0d2569]">
                      {kampanye.klien}{' '}
                      <span className="ml-1 rounded bg-[#2573e2]/10 px-2 py-0.5 text-xs font-semibold text-[#0d2569]">
                        {kampanye.layanan}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-[#0d2569]/70">
                      {kampanye.ringkasan}
                    </p>
                  </li>
                ))}
              </ul>
            </Kartu>
          </div>
        )}

        {tab === 'tambahan' && (
          <Kartu>
            <JudulBagian>Additional Services</JudulBagian>
            <p className="mt-2 text-sm text-[#0d2569]/70">
              These services are coming soon. Select one to see its status.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {LAYANAN_TAMBAHAN.map((nama) => (
                <button
                  key={nama}
                  type="button"
                  onClick={() => setLayananTambahan(nama)}
                  className="rounded-xl border border-[#2573e2]/20 bg-white p-4 text-left hover:border-[#2573e2] hover:bg-[#2573e2]/5"
                >
                  <p className="text-sm font-bold text-[#0d2569]">{nama}</p>
                  <p className="mt-1 text-xs text-[#0d2569]/60">
                    Coming Soon
                  </p>
                </button>
              ))}
            </div>
          </Kartu>
        )}

        {tab === 'bantuan' && (
          <div className="space-y-6">
            <Kartu>
              <JudulBagian>Help &amp; Contact</JudulBagian>
              <ul className="mt-3 space-y-4">
                {FAQ_KLIEN.map((faq) => (
                  <li key={faq.tanya}>
                    <p className="text-sm font-bold text-[#0d2569]">
                      {faq.tanya}
                    </p>
                    <p className="mt-1 text-sm text-[#0d2569]/70">
                      {faq.jawab}
                    </p>
                  </li>
                ))}
              </ul>
            </Kartu>
            <Kartu>
              <JudulBagian>Contact RRI</JudulBagian>
              <dl className="mt-3 space-y-2 text-sm text-[#0d2569]">
                <div>
                  <dt className="text-xs font-semibold text-[#0d2569]/60">
                    Head Office
                  </dt>
                  <dd>
                    Jl. Medan Merdeka Barat No. 4–5, Jakarta Pusat, DKI
                    Jakarta 10110
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[#0d2569]/60">
                    Phone
                  </dt>
                  <dd>
                    <a
                      href="tel:+62213500584"
                      className="text-[#2573e2] hover:underline"
                    >
                      +62 21 350 0584
                    </a>
                    {' / '}
                    <a
                      href="tel:+62213511086"
                      className="text-[#2573e2] hover:underline"
                    >
                      +62 21 351 1086
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-[#0d2569]/60">
                    Office hours
                  </dt>
                  <dd>08:00–16:00 WIB</dd>
                </div>
              </dl>
              <p className="mt-3 text-sm text-[#0d2569]/70">
                For questions about your cooperation, contact the Operator
                (Service &amp; Business Development) at your work unit with
                your PKS number.
              </p>
            </Kartu>
          </div>
        )}
      </main>
    </div>
  );
}

// Sinkronisasi meeting ke Google Calendar — SATU ARAH (app -> Google
// Calendar), PR #73 (permintaan pengguna 17/11/2026).
//
// - Koneksi: OAuth Google lewat Firebase Auth. PENTING — memakai
//   `linkWithPopup` (BUKAN `signInWithPopup`): signInWithPopup mengganti
//   sesi Firebase Auth ke akun Google (uid baru, tanpa dokumen
//   `users/{uid}` peran Operator) sehingga aturan Firestore
//   (`adalahOperator()`) menolak baca/tulis meeting setelahnya.
//   linkWithPopup menautkan kredensial Google ke akun Operator yang
//   sudah masuk — uid dan sesi tetap, dan access token Google tetap
//   didapat dari credential hasil link. Bila provider sudah tertaut
//   (mis. koneksi ulang), dipakai `reauthenticateWithPopup` untuk
//   mendapatkan token baru.
// - Access token HANYA di memori sesi (state React di TabMeeting) —
//   TIDAK disimpan di Firestore maupun localStorage. Token Google
//   berumur pendek (~1 jam); bila Sync gagal 401, putuskan
//   (Disconnect) lalu hubungkan lagi untuk token baru.
// - Event dibuat TANPA attendees: peserta meeting hanya punya nama
//   (tanpa email; email klien 0/42) — nama peserta ditulis di
//   description.
// - Data meeting TIDAK PUNYA jam selesai — event memakai durasi
//   default 1 jam dari jam mulai (zona Asia/Jakarta, +07:00).
// - Tidak ada "Sync all" massal dan tidak ada sinkronisasi dua arah
//   (perubahan di Google Calendar tidak kembali ke app).
// - PRASYARAT KONSOL (di luar kode — pengguna yang lakukan): Firebase
//   console -> Authentication -> Sign-in method -> aktifkan provider
//   Google; pastikan OAuth consent screen Google Cloud mengizinkan
//   scope `calendar.events`. Tanpa itu, koneksi gagal dengan pesan
//   `auth/operation-not-allowed` yang ditampilkan di UI.

import {
  GoogleAuthProvider,
  linkWithPopup,
  reauthenticateWithPopup,
} from 'firebase/auth';
import { auth } from './firebaseApp';
import type { Meeting } from './types';

export const SCOPE_KALENDER =
  'https://www.googleapis.com/auth/calendar.events';
const ZONA_WAKTU = 'Asia/Jakarta';
const OFFSET_JAKARTA = '+07:00';
const URL_EVENT =
  'https://www.googleapis.com/calendar/v3/calendars/primary/events';

/** Hasil koneksi Google Calendar — token hanya di memori sesi. */
export interface KoneksiKalender {
  email: string;
  accessToken: string;
}

export interface IsiEventKalender {
  summary: string;
  description: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
}

/**
 * Hubungkan akun Google operator (tautkan ke akun Operator yang sudah
 * masuk) dan kembalikan email + access token-nya.
 */
export async function hubungkanGoogleCalendar(): Promise<KoneksiKalender> {
  if (!auth?.currentUser) {
    throw new Error(
      'Masuk sebagai Operator terlebih dahulu sebelum menghubungkan Google Calendar.',
    );
  }
  const provider = new GoogleAuthProvider();
  provider.addScope(SCOPE_KALENDER);
  let hasil;
  try {
    hasil = await linkWithPopup(auth.currentUser, provider);
  } catch (e) {
    // Sudah tertaut sebelumnya (mis. koneksi ulang) — autentikasi ulang
    // dengan provider yang sama untuk mendapatkan token baru.
    if (
      e instanceof Error &&
      (e as { code?: string }).code === 'auth/provider-already-linked'
    ) {
      hasil = await reauthenticateWithPopup(auth.currentUser, provider);
    } else {
      throw e;
    }
  }
  const kredensial = GoogleAuthProvider.credentialFromResult(hasil);
  const token = kredensial?.accessToken;
  if (!token) {
    throw new Error(
      'Google tidak mengembalikan access token — coba hubungkan lagi.',
    );
  }
  return { email: hasil.user.email ?? '', accessToken: token };
}

/** Hitung jam selesai = jam mulai + 1 jam (durasi default). */
export function hitungAkhir(
  tanggal: string,
  jam: string,
): { tanggal: string; jam: string } {
  const mulai = new Date(`${tanggal}T${jam}:00${OFFSET_JAKARTA}`);
  const akhir = new Date(mulai.getTime() + 60 * 60 * 1000);
  // Kembalikan ke waktu dinding Jakarta (+07:00).
  const jakarta = new Date(akhir.getTime() + 7 * 60 * 60 * 1000);
  const iso = jakarta.toISOString();
  return { tanggal: iso.slice(0, 10), jam: iso.slice(11, 16) };
}

/**
 * Susun isi event Calendar dari meeting. Summary = agenda + pihak
 * (prospect/klien); description = Client Representative + Contact
 * Person (+ telepon) + RRI Representative + alamat klien + agenda +
 * outcome. TANPA attendees (peserta tidak punya email) dan TANPA
 * string Participants lama (kolom itu tidak lagi ditampilkan, PR #73).
 */
export function bangunIsiEvent(
  meeting: Meeting,
  pihak: string,
): IsiEventKalender {
  const akhir = hitungAkhir(meeting.tanggal, meeting.jam);
  const baris: string[] = [];
  if (meeting.clientRepresentatives?.length) {
    baris.push(
      `Client Representative: ${meeting.clientRepresentatives.join(', ')}`,
    );
  }
  if (meeting.contactPersonNama?.trim()) {
    baris.push(
      `Contact Person: ${meeting.contactPersonNama.trim()}${meeting.contactPersonTelepon?.trim() ? ` (${meeting.contactPersonTelepon.trim()})` : ''}`,
    );
  }
  if (meeting.rriRepresentatives?.length) {
    baris.push(
      `RRI Representative: ${meeting.rriRepresentatives.join(', ')}`,
    );
  }
  if (meeting.alamatKlien?.trim()) {
    baris.push(`Client Address: ${meeting.alamatKlien.trim()}`);
  }
  baris.push(`Agenda: ${meeting.agenda}`);
  if (meeting.hasil) baris.push(`Outcome: ${meeting.hasil}`);
  return {
    summary: pihak === '' ? meeting.agenda : `${meeting.agenda} — ${pihak}`,
    description: baris.join('\n'),
    start: {
      dateTime: `${meeting.tanggal}T${meeting.jam}:00${OFFSET_JAKARTA}`,
      timeZone: ZONA_WAKTU,
    },
    end: {
      dateTime: `${akhir.tanggal}T${akhir.jam}:00${OFFSET_JAKARTA}`,
      timeZone: ZONA_WAKTU,
    },
  };
}

type GalatCalendar = Error & { status?: number };

function pesanGalatCalendar(status: number): string {
  if (status === 401)
    return 'Sesi Google Calendar kedaluwarsa — putuskan (Disconnect) lalu hubungkan lagi, kemudian Sync ulang.';
  if (status === 403)
    return 'Google menolak akses kalender — pastikan scope calendar.events diizinkan di OAuth consent screen.';
  if (status === 404)
    return 'Event tidak ditemukan di Google Calendar — Sync ulang untuk membuat event baru.';
  return `Google Calendar mengembalikan galat ${status}.`;
}

async function panggilCalendar(
  token: string,
  url: string,
  method: 'POST' | 'PATCH',
  isi: unknown,
): Promise<{ id: string }> {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(isi),
  });
  if (!res.ok) {
    const galat = new Error(
      pesanGalatCalendar(res.status),
    ) as GalatCalendar;
    galat.status = res.status;
    throw galat;
  }
  return (await res.json()) as { id: string };
}

/** Buat event baru di kalender utama; kembalikan id event-nya. */
export async function buatEventKalender(
  token: string,
  meeting: Meeting,
  pihak: string,
): Promise<string> {
  const hasil = await panggilCalendar(
    token,
    URL_EVENT,
    'POST',
    bangunIsiEvent(meeting, pihak),
  );
  if (!hasil.id) {
    throw new Error('Google Calendar tidak mengembalikan id event.');
  }
  return hasil.id;
}

/** Perbarui event yang sudah ada (tanpa membuat duplikat). */
export async function perbaruiEventKalender(
  token: string,
  eventId: string,
  meeting: Meeting,
  pihak: string,
): Promise<void> {
  await panggilCalendar(
    token,
    `${URL_EVENT}/${encodeURIComponent(eventId)}`,
    'PATCH',
    bangunIsiEvent(meeting, pihak),
  );
}

/**
 * Sinkronkan satu meeting: bila sudah punya googleEventId, PATCH event
 * itu; bila event-nya sudah dihapus di Google (404), buat event baru.
 * Kembalikan id event yang berlaku.
 */
export async function sinkronkanEventKalender(
  token: string,
  meeting: Meeting,
  pihak: string,
): Promise<string> {
  if (meeting.googleEventId) {
    try {
      await perbaruiEventKalender(
        token,
        meeting.googleEventId,
        meeting,
        pihak,
      );
      return meeting.googleEventId;
    } catch (e) {
      if ((e as GalatCalendar).status === 404) {
        return buatEventKalender(token, meeting, pihak);
      }
      throw e;
    }
  }
  return buatEventKalender(token, meeting, pihak);
}

/** Pesan galat koneksi/API yang ramah untuk ditampilkan di UI. */
export function pesanGalatGoogle(e: unknown): string {
  const kode = (e as { code?: string })?.code ?? '';
  if (kode === 'auth/operation-not-allowed')
    return 'Provider Google belum diaktifkan di Firebase console — aktifkan di Authentication → Sign-in method → Google, lalu coba lagi.';
  if (kode === 'auth/popup-blocked')
    return 'Popup Google diblokir browser — izinkan popup untuk situs ini, lalu coba lagi.';
  if (
    kode === 'auth/popup-closed-by-user' ||
    kode === 'auth/cancelled-popup-request'
  )
    return 'Jendela Google ditutup sebelum selesai — coba hubungkan lagi.';
  if (kode === 'auth/credential-already-in-use')
    return 'Akun Google ini sudah dipakai akun Firebase lain — gunakan akun Google lain.';
  if (e instanceof Error) return e.message;
  return 'Gagal menghubungkan Google Calendar.';
}

// Autentikasi Firebase Auth (email + kata sandi) — aktivasi Firebase.
// DUA PERAN (keputusan pengguna 19/11/2026 15:45 WIB): Operator (Staf
// Layanan & Pengembangan Usaha) DAN Client — satu halaman login; peran
// dibedakan lewat field `peran` di dokumen profil `users/{uid}`;
// setelah masuk, client masuk Client Portal, operator masuk admin
// portal. Keputusan ini MEMBALIK dua keputusan sebelumnya: (1)
// keputusan pengguna 14/11/2026 21:29 WIB "buang semua role" (hanya 1
// role Operator); (2) koreksi 15/11/2026 (PRD v2.3) yang menghapus
// peran klien. Lacak publik (nomor PKS/tagihan, tanpa login) TETAP ada.
// Akun client dibuat OPERATOR (invite — tanpa self-registration
// publik); file ini TIDAK membuat akun Auth.
//
// Profil peran disimpan di Firestore: dokumen `users/{uid}`.
// Bootstrap: bila `users/{uid}` belum ada, profil diambil dari dokumen
// `userProfiles/{email}` (key = email huruf kecil) yang di-seed oleh
// migrasi satu kali (src/lib/migrasi.ts), lalu disalin ke `users/{uid}`.
// Bila tidak ada profil untuk email itu, bootstrap MENOLAK (bukan
// membuat profil Operator otomatis seperti sebelum 19/11/2026) —
// alasannya keamanan dua peran: akun client yang dibuat di console
// tapi belum ditautkan Operator TIDAK BOLEH login pertama kali sebagai
// Operator. Akun baru (operator maupun client) ditautkan dulu lewat
// kartu "Invite Client Account" di MasterPage (operator menulis
// users/{uid} dengan peran + klienId yang benar), baru akun itu bisa
// login. firestore.rules menegakkan hal yang sama di sisi server
// (self-create hanya boleh peran 'operator' dari profil yang disiapkan;
// operator boleh membuat profil client dengan klienId).

import {
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebaseApp';
import { SATKER_PILOT } from './master';
import type { Role } from './dummyUsers';
import type { SatkerRef } from './types';

export interface AppUser {
  uid: string;
  email: string;
  nama: string;
  jabatan: string;
  peran: Role;
  satker: SatkerRef;
  /**
   * Id record klien yang ditautkan ke akun ini — HANYA untuk peran
   * 'client' (wajib; lihat peranDariProfil). Menentukan data apa yang
   * boleh dibaca client di portalnya.
   */
  klienId?: string;
}

function pastikanTerkonfigurasi(): void {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error(
      'Firebase belum terkonfigurasi — gunakan mode contoh atau lengkapi konfigurasi.',
    );
  }
}

/**
 * Validasi peran dari dokumen profil `users/{uid}` — MURNI, tanpa
 * Firebase (dipakai skrip cek). 'operator' lolos apa adanya; 'client'
 * WAJIB membawa `klienId` non-kosong — akun client tanpa tautan klien
 * tidak bisa dipakai (portal tidak tahu data siapa yang ditampilkan,
 * dan aturan Firestore menolak baca tanpa klienId). Peran lain /
 * peran kosong DITOLAK.
 */
export function peranDariProfil(data: Record<string, unknown>): {
  peran: Role;
  klienId?: string;
} {
  const peran = data.peran;
  if (peran === 'operator') return { peran: 'operator' };
  if (peran === 'client') {
    const klienId = data.klienId;
    if (typeof klienId !== 'string' || klienId.trim() === '') {
      throw new Error(
        'Akun client belum ditautkan ke data klien — hubungi Operator.',
      );
    }
    return { peran: 'client', klienId: klienId.trim() };
  }
  throw new Error('Akun belum diberi peran yang dikenal — hubungi Operator.');
}

function bacaAppUser(uid: string, data: Record<string, unknown>): AppUser {
  const satker = data.satker as SatkerRef | undefined;
  const { peran, klienId } = peranDariProfil(data);
  return {
    uid,
    email: String(data.email ?? ''),
    nama: String(data.nama ?? ''),
    jabatan: String(data.jabatan ?? ''),
    peran,
    klienId,
    satker: satker ?? SATKER_PILOT,
  };
}

/**
 * Membuat dokumen `users/{uid}` dari profil yang sudah disiapkan di
 * `userProfiles/{email}` (di-seed oleh migrasi satu kali). Bila belum
 * ada profil untuk email tersebut, LEMPAR Error — akun itu belum
 * ditautkan ke peran apa pun (lihat komentar file ini). Selalu
 * mengembalikan true bila profil berhasil dibuat.
 */
export async function bootstrapProfil(
  uid: string,
  email: string,
): Promise<boolean> {
  pastikanTerkonfigurasi();
  const emailKecil = email.toLowerCase();
  const profilRef = doc(db!, 'userProfiles', emailKecil);
  const profilSnap = await getDoc(profilRef);
  if (!profilSnap.exists()) {
    throw new Error(
      'Akun ini belum ditautkan ke peran apa pun — hubungi Operator untuk membuat akun Anda.',
    );
  }
  const profil = profilSnap.data();
  await setDoc(doc(db!, 'users', uid), {
    email: emailKecil,
    nama: String(profil.nama ?? ''),
    jabatan: String(profil.jabatan ?? ''),
    peran: 'operator',
    satker: SATKER_PILOT,
    dibuatPada: new Date().toISOString(),
  });
  return true;
}

/**
 * Masuk dengan email + kata sandi. Setelah sign-in, dokumen `users/{uid}`
 * dibaca; bila belum ada, dijalankan bootstrap dari `userProfiles/{email}`
 * lalu dibaca lagi. Bila tetap tidak ada, perannya tidak dikenal, atau
 * client tanpa klienId, sesi ditutup dan dilempar Error. Routing setelah
 * masuk (client → Client Portal, operator → admin portal) diputuskan
 * pemanggil dari AppUser.peran (App.tsx).
 */
export async function masukDenganEmail(
  email: string,
  kataSandi: string,
): Promise<AppUser> {
  pastikanTerkonfigurasi();
  const kredensial = await signInWithEmailAndPassword(
    auth!,
    email.trim(),
    kataSandi,
  );
  const pengguna: User = kredensial.user;

  let snap = await getDoc(doc(db!, 'users', pengguna.uid));
  if (!snap.exists()) {
    await bootstrapProfil(pengguna.uid, pengguna.email ?? email);
    snap = await getDoc(doc(db!, 'users', pengguna.uid));
  }

  if (!snap.exists()) {
    await signOut(auth!);
    throw new Error(
      'Akun belum diberi peran — hubungi operator aplikasi.',
    );
  }

  try {
    return bacaAppUser(pengguna.uid, snap.data());
  } catch (e) {
    await signOut(auth!);
    throw e;
  }
}

/** Keluar (signOut Firebase Auth). */
export async function keluar(): Promise<void> {
  if (auth) await signOut(auth);
}
